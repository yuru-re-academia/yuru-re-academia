const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        const elements = await client.evaluate(`(() => {
            return Array.from(document.querySelectorAll('img, button')).map(el => {
                const r = el.getBoundingClientRect();
                return {
                    tag: el.tagName,
                    src: el.src || '',
                    text: el.innerText?.trim() || '',
                    x: r.left,
                    y: r.top,
                    w: r.width,
                    h: r.height
                };
            }).filter(b => b.x > 800 && b.y < 100);
        })()`);
        console.log('Top right elements:', elements);

        if (elements.length > 0) {
            const t = elements[0];
            const cx = t.x + t.w / 2;
            const cy = t.y + t.h / 2;
            console.log('Clicking:', cx, cy);
            await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
            await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });
            await new Promise(r => setTimeout(r, 1200));

            const screenshotPath = path.join(__dirname, 'top_right_menu.png');
            await client.screenshot(screenshotPath);
            console.log('Saved screenshot:', screenshotPath);
        }

        await client.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
