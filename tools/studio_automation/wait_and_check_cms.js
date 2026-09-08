const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Waiting for CMS content to render...');
        await new Promise(r => setTimeout(r, 4000));

        const data = await client.evaluate(`(() => {
            const rows = Array.from(document.querySelectorAll('tr, div[class*="row"], div[class*="item"]'));
            const textNodes = Array.from(document.querySelectorAll('*'))
                .filter(el => el.innerText && el.innerText.includes('松二ィ'))
                .map(el => ({ tag: el.tagName, className: el.className, text: el.innerText.substring(0, 100) }));
            return {
                rowCount: rows.length,
                matsuniiElements: textNodes.slice(0, 5)
            };
        })()`);
        console.log('CMS data:', JSON.stringify(data, null, 2));

        const screenshotPath = path.join(__dirname, 'rendered_cms.png');
        await client.screenshot(screenshotPath);
        console.log('Screenshot saved to:', screenshotPath);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
