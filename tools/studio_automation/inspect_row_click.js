const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        const rowInfo = await client.evaluate(`(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'zH1tT1kd' || e.innerText && e.innerText.trim() === '/ zH1tT1kd');
            if (!el) return { found: false };
            const row = el.closest('tr') || el.closest('[class*="row"]');
            
            // 行内のリンクやクリック可能な要素を調査
            const links = Array.from(row.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText }));
            const titleEl = Array.from(row.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('松二ィ'));
            const rect = titleEl ? titleEl.getBoundingClientRect() : null;

            return {
                found: true,
                rowTag: row.tagName,
                rowClass: row.className,
                links,
                titleRect: rect ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } : null
            };
        })()`);

        console.log('Row info:', JSON.stringify(rowInfo, null, 2));
        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
