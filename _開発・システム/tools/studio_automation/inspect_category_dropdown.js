const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Inspecting Category row and clicking it...');
        const clickResult = await client.evaluate(`(() => {
            const rows = Array.from(document.querySelectorAll('tr, [class*="row"]'));
            const catRow = rows.find(r => r.innerText && r.innerText.includes('カテゴリ'));
            if (catRow) {
                // 右側の空欄部分をクリック
                const lastCell = catRow.querySelector('td:last-child, div:last-child') || catRow;
                lastCell.click();
                return { success: true, rowText: catRow.innerText };
            }
            return { success: false };
        })()`);

        console.log('Click result:', clickResult);
        await new Promise(r => setTimeout(r, 1500));

        const modalOrDropdown = await client.evaluate(`(() => {
            const popovers = Array.from(document.querySelectorAll('[role="dialog"], [role="listbox"], [role="menu"], [class*="popover"], [class*="dropdown"], [class*="modal"]'));
            return popovers.map(p => ({
                tag: p.tagName,
                className: p.className,
                text: p.innerText.substring(0, 300)
            }));
        })()`);

        console.log('Popovers found:', JSON.stringify(modalOrDropdown, null, 2));

        const screenshotPath = path.join(__dirname, 'category_popover.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
