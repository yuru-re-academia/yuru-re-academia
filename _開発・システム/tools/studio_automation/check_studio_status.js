const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        const target = await client.connect('studio.design');
        console.log(`Connected to page: ${target.title} (${target.url})`);

        const pageInfo = await client.evaluate(`({
            url: window.location.href,
            title: document.title,
            bodyText: document.body.innerText.substring(0, 500),
            hasLoginButton: !!document.querySelector('button, a[href*="login"], a[href*="auth"]')
        })`);

        console.log('Current Page Info:', JSON.stringify(pageInfo, null, 2));

        const screenshotPath = path.join(__dirname, 'status.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
