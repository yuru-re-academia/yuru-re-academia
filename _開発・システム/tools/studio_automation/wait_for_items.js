const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        
        console.log('Waiting for items to load...');
        for (let i = 0; i < 30; i++) {
            const count = await client.evaluate(`(() => {
                const el = document.querySelector('.o-model-content-list-item');
                const titleText = document.body.innerText;
                const match = titleText.match(/ニュース\\s+(\\d+)\\s*件のアイテム/);
                return {
                    hasItems: !!el,
                    itemCountText: match ? match[1] : null,
                    rows: document.querySelectorAll('.o-model-content-list-item').length
                };
            })()`);
            console.log(`[${i}]`, count);
            if (count && count.itemCountText && count.itemCountText !== '0') {
                console.log('Items loaded successfully!');
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        
        await client.screenshot(path.join(__dirname, 'news_list_loaded.png'));
        
        // Dump all items
        const allItems = await client.evaluate(`(() => {
            const elements = Array.from(document.querySelectorAll('[data-content-id]'));
            const map = new Map();
            for (const el of elements) {
                const id = el.getAttribute('data-content-id');
                if (!map.has(id)) {
                    const row = el.closest('.o-model-content-list-item') || el;
                    map.set(id, row.innerText.split('\\n').map(s => s.trim()).filter(Boolean));
                }
            }
            return Array.from(map.entries()).map(([id, lines]) => ({ id, text: lines.join(' | ') }));
        })()`);
        
        console.log('Total items in list:', allItems.length);
        allItems.forEach((it, idx) => console.log(`[${idx}] ${it.id}: ${it.text}`));
        
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
