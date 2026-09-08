const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const cmsListUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf';
        console.log('Navigating to CMS list...');
        await client.navigate(cmsListUrl);
        await new Promise(r => setTimeout(r, 4000));

        const items = await client.evaluate(`(() => {
            const rows = Array.from(document.querySelectorAll('tr, [class*="row"]'));
            return rows.map(r => r.innerText.trim()).filter(t => t.length > 0 && (t.includes('松') || t.includes('zH1tT1kd')));
        })()`);
        console.log('Found Matsunii rows:', items);

        const screenshotPath = path.join(__dirname, 'check_cms_current.png');
        await client.screenshot(screenshotPath);
        console.log('Screenshot saved to:', screenshotPath);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
