const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        console.log('Looking for CMS link or clicking CMS tab...');
        // 上部メニューの「CMS」リンクをクリック、またはURL遷移
        const clicked = await client.evaluate(`(() => {
            const tabs = Array.from(document.querySelectorAll('a, button, div')).filter(el => el.innerText && el.innerText.trim() === 'CMS');
            if (tabs.length > 0) {
                tabs[0].click();
                return true;
            }
            return false;
        })()`);

        if (!clicked) {
            console.log('CMS button not found by text, navigating directly to CMS URL...');
            await client.navigate('https://app.studio.design/projects/NxqgmljEW1/cms');
        }

        await new Promise(r => setTimeout(r, 4000));

        const cmsInfo = await client.evaluate(`({
            url: window.location.href,
            title: document.title,
            models: Array.from(document.querySelectorAll('[data-test*="model"], [class*="model"], aside a, nav a')).map(el => el.innerText.trim()).filter(Boolean),
            bodySnippet: document.body.innerText.substring(0, 800)
        })`);

        console.log('CMS Page Info:', JSON.stringify(cmsInfo, null, 2));

        const screenshotPath = path.join(__dirname, 'cms_dashboard.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
