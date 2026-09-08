// Minimal Chrome DevTools Protocol (CDP) Client using Node.js built-in modules
const http = require('http');

class CDPClient {
    constructor(port = 9222) {
        this.port = port;
        this.ws = null;
        this.messageId = 1;
        this.callbacks = new Map();
        this.eventListeners = new Map();
    }

    async getTargets() {
        return new Promise((resolve, reject) => {
            const req = http.get(`http://127.0.0.1:${this.port}/json`, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Failed to parse targets: ${data}`));
                    }
                });
            });
            req.on('error', reject);
        });
    }

    async connect(targetUrlMatch = null) {
        const targets = await this.getTargets();
        let target = null;
        if (targetUrlMatch) {
            target = targets.find(t => t.type === 'page' && t.url && t.url.includes(targetUrlMatch));
        }
        if (!target) {
            target = targets.find(t => t.type === 'page');
        }
        if (!target || !target.webSocketDebuggerUrl) {
            throw new Error('No inspectable page found in Chrome.');
        }

        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(target.webSocketDebuggerUrl);

            this.ws.onopen = () => {
                // Enable necessary domains
                Promise.all([
                    this.send('Page.enable'),
                    this.send('Runtime.enable'),
                    this.send('DOM.enable')
                ]).then(() => resolve(target)).catch(reject);
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.id && this.callbacks.has(message.id)) {
                        const { resolve, reject } = this.callbacks.get(message.id);
                        this.callbacks.delete(message.id);
                        if (message.error) {
                            reject(new Error(message.error.message));
                        } else {
                            resolve(message.result);
                        }
                    } else if (message.method && this.eventListeners.has(message.method)) {
                        const listeners = this.eventListeners.get(message.method);
                        listeners.forEach(fn => fn(message.params));
                    }
                } catch (e) {
                    console.error('CDP parse error:', e);
                }
            };

            this.ws.onerror = (err) => reject(err);
        });
    }

    send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = this.messageId++;
            this.callbacks.set(id, { resolve, reject });
            this.ws.send(JSON.stringify({ id, method, params }));
        });
    }

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    async evaluate(expression) {
        const result = await this.send('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true
        });
        if (result.exceptionDetails) {
            throw new Error(result.exceptionDetails.text || 'Evaluation exception');
        }
        return result.result ? result.result.value : undefined;
    }

    async navigate(url) {
        await this.send('Page.navigate', { url });
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    async screenshot(filePath) {
        const fs = require('fs');
        const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
        return filePath;
    }

    async close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

module.exports = CDPClient;
