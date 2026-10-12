const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        const items = await client.evaluate(`(() => {
            const elements = Array.from(document.querySelectorAll('[data-content-id]'));
            const map = new Map();
            for (const el of elements) {
                const id = el.getAttribute('data-content-id');
                if (!map.has(id)) {
                    // find parent or text
                    const row = el.closest('.o-model-content-list-item') || el;
                    map.set(id, row.innerText.split('\\n').map(s => s.trim()).filter(Boolean));
                }
            }
            return Array.from(map.entries()).map(([id, lines]) => ({ id, lines }));
        })()`);
        console.log('Unique items:', items.length);
        items.forEach(it => {
            console.log(`[${it.id}] ${it.lines.join(' | ')}`);
        });
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
