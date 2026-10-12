const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect();
        await new Promise(r => setTimeout(r, 2000));

        const screenshotPath = path.join(__dirname, 'table_loaded.png');
        await client.screenshot(screenshotPath);
        console.log('Screenshot saved to:', screenshotPath);

        const rowTexts = await client.evaluate(`(() => {
            const trs = Array.from(document.querySelectorAll('tr, div[role="row"]'));
            return trs.map(t => t.innerText?.replace(/\\s+/g, ' ').trim()).filter(Boolean);
        })()`);
        console.log('Table rows found:', rowTexts);

        await client.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
