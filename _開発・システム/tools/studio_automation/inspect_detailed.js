const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        const rows = await client.evaluate(`(() => {
            const trs = Array.from(document.querySelectorAll('.o-model-content-list-item'));
            return trs.map((tr, idx) => {
                return {
                    idx,
                    text: tr.innerText.split('\\n').map(s => s.trim()).filter(Boolean).join(' | ')
                };
            });
        })()`);
        console.log('Total rows:', rows.length);
        rows.forEach(r => console.log(`[${r.idx}] ${r.text}`));
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
