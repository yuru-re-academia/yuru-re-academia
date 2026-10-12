const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        console.log('Clicking on "ニュース" in the left sidebar...');
        const clickedNews = await client.evaluate(`(() => {
            const items = Array.from(document.querySelectorAll('div, a, span, p')).filter(el => {
                return el.innerText && el.innerText.trim() === 'ニュース' && el.children.length === 0;
            });
            if (items.length > 0) {
                items[0].closest('div, a').click();
                return true;
            }
            return false;
        })()`);

        console.log('Clicked "ニュース":', clickedNews);
        await new Promise(r => setTimeout(r, 3000));

        const currentInfo = await client.evaluate(`({
            url: window.location.href,
            heading: document.querySelector('h1, h2')?.innerText,
            buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)
        })`);

        console.log('Current Info:', JSON.stringify(currentInfo, null, 2));

        const screenshotPath = path.join(__dirname, 'news_list.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
