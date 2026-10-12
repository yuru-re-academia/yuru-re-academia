const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Clicking profile button...');
        await client.evaluate(`(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('佐々木啓太'));
            if (btn) btn.click();
        })()`);

        await new Promise(r => setTimeout(r, 1500));

        const screenshotPath = path.join(__dirname, 'workspace_menu.png');
        await client.screenshot(screenshotPath);
        console.log('Saved screenshot:', screenshotPath);

        const list = await client.evaluate(`(() => {
            return Array.from(document.querySelectorAll('*')).map(el => el.innerText?.trim()).filter(t => t && (t.includes('ユル') || t.includes('ゆる') || t.includes('株式会社') || t.includes('ワークスペース')));
        })()`);
        console.log('Found matching text:', list);

        await client.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
