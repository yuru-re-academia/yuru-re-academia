const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Navigating to CMS list...');
        await client.navigate('https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf');
        await new Promise(r => setTimeout(r, 4500));

        // 最も内側のテキスト要素を探す
        const elemInfo = await client.evaluate(`(() => {
            const all = Array.from(document.querySelectorAll('*'));
            const targets = all.filter(el => el.children.length === 0 && el.innerText && el.innerText.includes('松二ィ'));
            if (targets.length === 0) return null;
            const target = targets[0];
            const rect = target.getBoundingClientRect();
            return {
                text: target.innerText,
                tag: target.tagName,
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                width: rect.width,
                height: rect.height
            };
        })()`);

        console.log('Leaf element info:', elemInfo);

        if (elemInfo) {
            console.log(`Double clicking at (${elemInfo.x}, ${elemInfo.y})...`);
            await client.send('Input.dispatchMouseEvent', {
                type: 'mousePressed',
                x: elemInfo.x,
                y: elemInfo.y,
                button: 'left',
                clickCount: 1
            });
            await client.send('Input.dispatchMouseEvent', {
                type: 'mouseReleased',
                x: elemInfo.x,
                y: elemInfo.y,
                button: 'left',
                clickCount: 1
            });
            await new Promise(r => setTimeout(r, 100));
            await client.send('Input.dispatchMouseEvent', {
                type: 'mousePressed',
                x: elemInfo.x,
                y: elemInfo.y,
                button: 'left',
                clickCount: 2
            });
            await client.send('Input.dispatchMouseEvent', {
                type: 'mouseReleased',
                x: elemInfo.x,
                y: elemInfo.y,
                button: 'left',
                clickCount: 2
            });

            await new Promise(r => setTimeout(r, 4000));
            const screenshotPath = path.join(__dirname, 'after_leaf_click.png');
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
