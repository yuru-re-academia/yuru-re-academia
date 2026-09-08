const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        const directUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/M40pur1aT9IyXtVpUECY';
        console.log('Navigating directly to contentId URL:', directUrl);
        await client.navigate(directUrl);
        await new Promise(r => setTimeout(r, 5000));

        const editorInfo = await client.evaluate(`({
            url: window.location.href,
            title: document.querySelector('.title-div.main-title')?.innerText,
            bodySnippet: document.querySelector('.ProseMirror.in-cms')?.innerText?.substring(0, 100),
            breadcrumb: Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.includes('【取材レポート】'))?.innerText?.substring(0, 50)
        })`);
        console.log('Editor info:', JSON.stringify(editorInfo, null, 2));

        const screenshotPath = path.join(__dirname, 'content_id_opened.png');
        await client.screenshot(screenshotPath);
        console.log('Saved screenshot to:', screenshotPath);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
