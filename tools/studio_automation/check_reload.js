const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Reloading page...');
        await client.send('Page.reload');
        await new Promise(r => setTimeout(r, 4000));

        const screenshotPath = path.join(__dirname, 'reloaded_list.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        const itemsCount = await client.evaluate(`document.querySelector('h1, h2, [class*="title"]')?.innerText`);
        console.log('Heading text:', itemsCount);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
