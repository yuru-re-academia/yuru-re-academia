const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect();
        console.log('Clicking 新規追加 button...');

        const clicked = await client.evaluate(`(() => {
            const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && (b.innerText.includes('新規追加') || b.innerText.includes('アイテムを追加')));
            if (btns.length > 0) {
                btns[0].click();
                return btns[0].innerText.trim();
            }
            return false;
        })()`);
        console.log('Clicked button:', clicked);

        await new Promise(r => setTimeout(r, 2500));

        const editorUrl = await client.evaluate('window.location.href');
        console.log('Current URL after click:', editorUrl);

        const screenshotPath = path.join(__dirname, 'after_click_new_item.png');
        await client.screenshot(screenshotPath);
        console.log('Saved screenshot:', screenshotPath);

        await client.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
