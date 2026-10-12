const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        const rows = await client.evaluate(`(() => {
            const trs = Array.from(document.querySelectorAll('.o-model-content-list-item'));
            return trs.map((tr, idx) => ({
                idx,
                tag: tr.tagName,
                className: tr.className,
                html: tr.innerHTML.substring(0, 300),
                text: tr.innerText
            }));
        })()`);
        console.log(JSON.stringify(rows.slice(0, 5), null, 2));
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
