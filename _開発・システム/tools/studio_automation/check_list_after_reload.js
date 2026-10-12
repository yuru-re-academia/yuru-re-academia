const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Reloading list...');
        await client.send('Page.reload');
        await new Promise(r => setTimeout(r, 6000));

        const listData = await client.evaluate(`(() => {
            const rows = Array.from(document.querySelectorAll('tr, div[class*="row"]'));
            return rows.map(r => r.innerText.replace(/\\n/g, ' ')).filter(t => t.includes('松') || t.includes('zH1') || t.includes('IU_'));
        })()`);
        console.log('Items matching in list:', listData);

        const screenshotPath = path.join(__dirname, 'list_after_reload.png');
        await client.screenshot(screenshotPath);
        console.log('Saved screenshot to:', screenshotPath);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
