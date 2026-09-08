const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        // 青枠の中にあるボタンやアイコン、またはポップアップ
        const buttons = await client.evaluate(`(() => {
            const all = Array.from(document.querySelectorAll('button, svg, [role="button"], div'));
            const rects = [];
            all.forEach(el => {
                const r = el.getBoundingClientRect();
                // 選択されたセルの近傍 (x: 400〜600, y: 200〜400)
                if (r.x > 450 && r.x < 650 && r.y > 200 && r.y < 350 && r.width > 10 && r.width < 50) {
                    rects.push({
                        tag: el.tagName,
                        className: el.className,
                        x: r.x + r.width / 2,
                        y: r.y + r.height / 2,
                        width: r.width,
                        height: r.height,
                        ariaLabel: el.getAttribute('aria-label') || '',
                        title: el.getAttribute('title') || ''
                    });
                }
            });
            return rects;
        })()`);

        console.log('Detected buttons around cell:', buttons);

        // もしボタンが見つかったらクリック
        if (buttons.length > 0) {
            // 一番それらしいボタンをクリック
            const btn = buttons[0];
            console.log(`Clicking button at (${btn.x}, ${btn.y})...`);
            await client.send('Input.dispatchMouseEvent', {
                type: 'mousePressed',
                x: btn.x,
                y: btn.y,
                button: 'left',
                clickCount: 1
            });
            await client.send('Input.dispatchMouseEvent', {
                type: 'mouseReleased',
                x: btn.x,
                y: btn.y,
                button: 'left',
                clickCount: 1
            });
            await new Promise(r => setTimeout(r, 4000));

            const screenshotPath = path.join(__dirname, 'after_expand_click.png');
            await client.screenshot(screenshotPath);
            console.log('Saved screenshot to:', screenshotPath);
            console.log('URL now:', await client.evaluate('window.location.href'));
        }

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
