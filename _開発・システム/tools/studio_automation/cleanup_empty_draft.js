const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Selecting empty draft (OFYtyU6C) to clean up...');
        const selected = await client.evaluate(`(() => {
            const rows = Array.from(document.querySelectorAll('tr, [class*="item"], div'));
            const emptyRow = rows.find(r => r.innerText && r.innerText.includes('OFYtyU6C'));
            if (emptyRow) {
                const checkbox = emptyRow.querySelector('input[type="checkbox"], [role="checkbox"], div:first-child');
                if (checkbox) {
                    checkbox.click();
                    return true;
                }
            }
            return false;
        })()`);

        console.log('Checkbox clicked:', selected);
        await new Promise(r => setTimeout(r, 1500));

        const actionButtons = await client.evaluate(`(() => {
            return Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
        })()`);
        console.log('Action buttons after select:', actionButtons);

        const screenshotPath = path.join(__dirname, 'after_select_row.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
