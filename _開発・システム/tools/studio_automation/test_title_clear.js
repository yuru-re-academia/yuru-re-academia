const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        const articleUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/M40pur1aT9IyXtVpUECY';
        await client.navigate(articleUrl);
        await new Promise(r => setTimeout(r, 4500));

        // タイトル要素を完全にクリアする方法を検証
        const testRes = await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (!el) return { error: 'no el' };
            el.focus();
            
            // Selection API で全選択して削除
            const sel = window.getSelection();
            sel.selectAllChildren(el);
            sel.deleteFromDocument();

            return {
                textAfterDelete: el.innerText,
                hasChildren: el.childNodes.length
            };
        })()`);

        console.log('Result after Selection deleteFromDocument:', testRes);

        // その状態で Input.insertText してみる
        const testTitle = '【テスト】正常クリア確認';
        await client.send('Input.insertText', { text: testTitle });
        await new Promise(r => setTimeout(r, 1000));

        const checkTitle = await client.evaluate(`document.querySelector('.title-div.main-title')?.innerText`);
        console.log('Title after insertText:', checkTitle);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
