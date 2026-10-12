const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Clicking "← 戻る"...');
        await client.evaluate(`(() => {
            const backBtn = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '戻る');
            if (backBtn) backBtn.click();
        })()`);

        await new Promise(r => setTimeout(r, 3000));

        const listInfo = await client.evaluate(`({
            url: window.location.href,
            items: Array.from(document.querySelectorAll('tr, [class*="list-item"], [class*="row"]'))
                .map(r => r.innerText.trim())
                .filter(t => t.includes('【テスト】'))
        })`);

        console.log('List Info:', JSON.stringify(listInfo, null, 2));

        const screenshotPath = path.join(__dirname, 'news_list_with_test.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
