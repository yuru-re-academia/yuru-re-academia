const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const projectUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/home';
        console.log(`Navigating to project dashboard: ${projectUrl}`);
        await client.navigate(projectUrl);
        await new Promise(r => setTimeout(r, 4000));

        // ページのリンクやメニューを取得
        const pageDetails = await client.evaluate(`({
            url: window.location.href,
            title: document.title,
            links: Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href })).filter(l => l.text || l.href),
            buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)
        })`);

        console.log('Page URL:', pageDetails.url);
        console.log('Page Title:', pageDetails.title);
        console.log('Buttons:', pageDetails.buttons);
        console.log('Links found:', pageDetails.links.length);

        const screenshotPath = path.join(__dirname, 'project_dashboard.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
