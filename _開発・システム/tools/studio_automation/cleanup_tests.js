const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Finding test rows to delete (OFYtyU6C and 2zCtweph)...');
        // 各行を調査して右端やメニューを探す
        const rowsInfo = await client.evaluate(`(() => {
            const slugsToDelete = ['OFYtyU6C', '2zCtweph'];
            const targets = [];
            const allElements = Array.from(document.querySelectorAll('*'));
            slugsToDelete.forEach(slug => {
                const el = allElements.find(e => e.innerText && e.innerText.trim() === slug || e.innerText && e.innerText.trim() === '/ ' + slug);
                if (el) {
                    const row = el.closest('tr') || el.closest('[class*="row"]');
                    targets.push({ slug, found: true, rowClass: row ? row.className : '' });
                }
            });
            return targets;
        })()`);

        console.log('Rows Info:', rowsInfo);

        // 一覧画面の最新スクリーンショットを撮っておく
        const screenshotPath = path.join(__dirname, 'current_news_list.png');
        await client.screenshot(screenshotPath);
        console.log(`Current news list saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
