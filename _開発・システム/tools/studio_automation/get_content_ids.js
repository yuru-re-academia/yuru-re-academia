const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');
    const result = await client.evaluate(`(() => {
        const els = Array.from(document.querySelectorAll('.o-model-content-list-item'));
        return els.map(el => {
            return {
                contentId: el.dataset.contentId || el.getAttribute('data-content-id'),
                text: el.innerText.replace(/\\n+/g, ' | ').substring(0, 150)
            };
        });
    })()`);
    console.log('Items:', JSON.stringify(result, null, 2));
    await client.close();
}

main().catch(console.error);
