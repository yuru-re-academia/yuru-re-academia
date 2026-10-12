const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect();

        const info = await client.evaluate(`(() => {
            const list = [];
            const all = document.querySelectorAll('*');
            for (const el of all) {
                if (el.innerText && el.innerText.includes('seniorstage.sns@medicalcare.jp')) {
                    const r = el.getBoundingClientRect();
                    list.push({
                        tag: el.tagName,
                        className: el.className,
                        role: el.getAttribute('role'),
                        rect: { x: r.left, y: r.top, w: r.width, h: r.height }
                    });
                }
            }
            return list;
        })()`);
        console.log('Matching elements:', JSON.stringify(info, null, 2));

        // Click the first one with height > 20
        const target = info.find(i => i.rect.h > 20);
        if (target) {
            const cx = target.rect.x + target.rect.w / 2;
            const cy = target.rect.y + target.rect.h / 2;
            console.log('Clicking target at:', cx, cy);
            await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
            await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });

            await new Promise(r => setTimeout(r, 6000));
            const newUrl = await client.evaluate('window.location.href');
            console.log('New URL:', newUrl);
        }

        await client.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
