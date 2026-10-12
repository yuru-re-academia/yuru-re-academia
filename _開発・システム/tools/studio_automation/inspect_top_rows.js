const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');
    await new Promise(r => setTimeout(r, 2000));
    const items = await client.evaluate(`(() => {
        const rows = Array.from(document.querySelectorAll('.o-model-content-list-item'));
        return rows.slice(0, 6).map(r => r.innerText.replace(/[\\r\\n]+/g, ' | ').trim());
    })()`);
    console.log('Top rows:', JSON.stringify(items, null, 2));
    await client.screenshot(path.join(__dirname, 'clean_list_view.png'));
    await client.close();
}

main().catch(console.error);
