const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        const listUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf';
        await client.navigate(listUrl);
        await new Promise(r => setTimeout(r, 4000));
        
        const screenshotPath = path.join(__dirname, 'current_cms_list_verified.png');
        await client.screenshot(screenshotPath);
        console.log('Navigated to CMS list and took screenshot:', screenshotPath);
        
        const btnExists = await client.evaluate(`(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
            return !!btn;
        })()`);
        console.log('新規追加 button exists:', btnExists);
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
