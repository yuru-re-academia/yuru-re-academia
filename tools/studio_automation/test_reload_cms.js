const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Reloading page...');
        await client.send('Page.reload');
        await new Promise(r => setTimeout(r, 6000));

        const info = await client.evaluate(`(() => {
            const heading = document.querySelector('h1, h2, [class*="title"]');
            const rows = Array.from(document.querySelectorAll('tr, [class*="row"]')).map(r => r.innerText.replace(/\\n/g, ' '));
            return {
                title: document.title,
                url: window.location.href,
                heading: heading ? heading.innerText : null,
                rowCount: rows.length,
                rowsSnippet: rows.slice(0, 5)
            };
        })()`);
        console.log('Info after reload:', JSON.stringify(info, null, 2));

        const screenshotPath = path.join(__dirname, 'reloaded_cms.png');
        await client.screenshot(screenshotPath);
        console.log('Screenshot saved to:', screenshotPath);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
