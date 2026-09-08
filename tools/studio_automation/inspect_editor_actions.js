const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        const details = await client.evaluate(`(() => {
            // カテゴリの欄
            const categoryRow = Array.from(document.querySelectorAll('div, td, tr')).find(el => el.innerText && el.innerText.trim() === 'カテゴリ');
            
            // 右上のヘッダーやボタン
            const allButtons = Array.from(document.querySelectorAll('button, [role="button"], a')).map(el => ({
                text: el.innerText ? el.innerText.trim() : '',
                ariaLabel: el.getAttribute('aria-label'),
                className: el.className
            })).filter(b => b.text || b.ariaLabel);

            // ステータス（下書き・公開）の要素を探す
            const statusElements = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.innerText ? el.innerText.trim() : '';
                return text === '下書き' || text === '公開' || text === '公開中' || text === 'ステータス';
            }).map(el => ({ tag: el.tagName, text: el.innerText.trim(), className: el.className }));

            return {
                allButtons: allButtons.slice(0, 30),
                statusElements: statusElements.slice(0, 10),
                categoryRowFound: !!categoryRow
            };
        })()`);

        console.log('Action Details:', JSON.stringify(details, null, 2));
        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
