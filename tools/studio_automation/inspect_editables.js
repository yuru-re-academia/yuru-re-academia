const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        const articleUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/M40pur1aT9IyXtVpUECY';
        await client.navigate(articleUrl);
        await new Promise(r => setTimeout(r, 4500));

        const editables = await client.evaluate(`(() => {
            return Array.from(document.querySelectorAll('[contenteditable="true"]')).map((el, i) => ({
                index: i,
                tag: el.tagName,
                className: el.className,
                placeholder: el.getAttribute('placeholder') || el.getAttribute('data-placeholder'),
                text: el.innerText.substring(0, 80)
            }));
        })()`);

        console.log('Contenteditable elements:', JSON.stringify(editables, null, 2));
        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
