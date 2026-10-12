const CDPClient = require('./cdp_client');
const fs = require('fs');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        await client.screenshot(path.join(__dirname, 'inspect_now.png'));
        
        const res = await client.evaluate(`(() => {
            const items = [];
            const rows = document.querySelectorAll('.o-model-content-list-item');
            for (let i = 0; i < rows.length; i++) {
                items.push(rows[i].innerText.replace(/\\n+/g, ' | '));
            }
            const isEditor = !!document.querySelector('.title-div.main-title');
            const title = isEditor ? document.querySelector('.title-div.main-title').innerText : '';
            return {
                isEditor,
                title,
                count: items.length,
                items: items
            };
        })()`);
        
        console.log('Result:', JSON.stringify(res, null, 2));
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
