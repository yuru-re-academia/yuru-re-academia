const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Testing inline edit on title cell...');
        const titleCellInfo = await client.evaluate(`(() => {
            // 一番上のアイテムのタイトルセルを探す
            const cells = Array.from(document.querySelectorAll('div, td'));
            // OFYtyU6C を含む行を探す
            const row = cells.find(c => c.innerText && c.innerText.includes('OFYtyU6C'));
            if (row) {
                const parentRow = row.closest('tr') || row.closest('[class*="row"]');
                return { foundRow: true, rowHtml: parentRow ? parentRow.innerHTML.substring(0, 500) : '' };
            }
            return { foundRow: false };
        })()`);

        console.log('Title Cell Info:', titleCellInfo);

        // 一番上の下書きアイテムをクリックしてエディタを開く
        console.log('Clicking the draft item to open editor...');
        await client.evaluate(`(() => {
            const rows = Array.from(document.querySelectorAll('*'));
            const draftSlug = rows.find(el => el.innerText && el.innerText.trim() === 'OFYtyU6C');
            if (draftSlug) {
                const clickTarget = draftSlug.closest('tr') || draftSlug.closest('[class*="row"]') || draftSlug;
                clickTarget.click();
            }
        })()`);

        await new Promise(r => setTimeout(r, 4000));

        const editorUrl = await client.evaluate('window.location.href');
        console.log('Current URL after click:', editorUrl);

        const screenshotPath = path.join(__dirname, 'editor_opened.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
