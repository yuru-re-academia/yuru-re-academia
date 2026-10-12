const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect();
        console.log('Connected!');

        const hubUrl = 'http://127.0.0.1:8765/team_hub.html';
        console.log('Sending Page.navigate...');
        const navRes = await client.send('Page.navigate', { url: hubUrl });
        console.log('Page.navigate response:', navRes);

        console.log('Waiting 3s for page load...');
        await new Promise(r => setTimeout(r, 3000));

        const pageTitle = await client.evaluate('document.title');
        console.log('Current document title:', pageTitle);

        const screenshotPath = path.join(__dirname, 'team_hub_test.png');
        console.log('Capturing screenshot...');
        await client.screenshot(screenshotPath);
        console.log('Screenshot saved to:', screenshotPath);

        await client.close();
    } catch (e) {
        console.error('Error caught in test:', e);
    }
}

main();
