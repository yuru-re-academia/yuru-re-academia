const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect();
        console.log('Navigating to accounts.google.com...');
        await client.navigate('https://accounts.google.com');
        await new Promise(r => setTimeout(r, 2000));

        const screenshotPath = path.join(__dirname, 'google_accounts.png');
        await client.screenshot(screenshotPath);
        console.log('Screenshot saved:', screenshotPath);

        const currentUrl = await client.evaluate('window.location.href');
        console.log('Google Accounts URL:', currentUrl);

        await client.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
