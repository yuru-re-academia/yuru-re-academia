const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const articleUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/M40pur1aT9IyXtVpUECY';
        console.log(`Navigating to article editor: ${articleUrl}`);
        await client.navigate(articleUrl);
        await new Promise(r => setTimeout(r, 4500));

        const targetTitle = '83歳・総フォロワー15万人の松二ィ（松本さん）が地元企業より人生・価値観についての取材を受けました';

        const bodyParagraphs = [
            '本日9月7日、鳥取県米子市のシニア向け住宅「シニアステージ西福原」にお住まいの松二ィ（松兄）こと松本さん（83歳）が、地元企業からのインタビュー取材を受けました。',
            '今回の取材は、松本さんのこれまでの人生の歩みや大切にされている価値観について話を聞かせてほしいとの依頼を受けて実施されたものです。取材では、これまでの歩みや日々の考え方についてお話しさせていただきました。',
            '松二ィは、YURU\'QとともにSNS運用を始めて約1年半が経過し、現在は総フォロワー数15万人となっています。SNSを通じて新たな生きがいを見出しており、弊社の活動におけるエバンジェリスト的な存在でもあります。',
            '今後も松二ィの活動とともに、日々の発信を継続してまいります。'
        ];

        // 1. タイトルのクリア＆入力
        console.log('Clearing and updating Title...');
        await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                el.focus();
                const sel = window.getSelection();
                sel.selectAllChildren(el);
                sel.deleteFromDocument();
            }
        })()`);
        await new Promise(r => setTimeout(r, 300));
        await client.send('Input.insertText', { text: targetTitle });
        await new Promise(r => setTimeout(r, 1000));

        // 2. 本文のクリア＆入力
        console.log('Clearing and updating Body...');
        await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (el) {
                el.focus();
                const sel = window.getSelection();
                sel.selectAllChildren(el);
                sel.deleteFromDocument();
            }
        })()`);
        await new Promise(r => setTimeout(r, 300));

        for (let i = 0; i < bodyParagraphs.length; i++) {
            await client.send('Input.insertText', { text: bodyParagraphs[i] });
            await new Promise(r => setTimeout(r, 200));
            if (i < bodyParagraphs.length - 1) {
                await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await new Promise(r => setTimeout(r, 300));
            }
        }

        console.log('Waiting 6 seconds for auto-save (下書き自動保存)...');
        await new Promise(r => setTimeout(r, 6000));

        // DOMの現在のテキストを厳格に検証
        const verification = await client.evaluate(`({
            title: document.querySelector('.title-div.main-title')?.innerText?.trim(),
            paragraphs: Array.from(document.querySelectorAll('.ProseMirror.in-cms p')).map(p => p.innerText.trim())
        })`);
        console.log('Final Verification:', JSON.stringify(verification, null, 2));

        const editorScreenshot = path.join(__dirname, 'matsunii_clean_editor.png');
        await client.screenshot(editorScreenshot);
        console.log(`Editor screenshot saved to: ${editorScreenshot}`);

        // 一覧画面へ戻る
        console.log('Navigating back to list...');
        await client.evaluate(`(() => {
            const backBtn = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '戻る');
            if (backBtn) backBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 4500));

        const listScreenshot = path.join(__dirname, 'matsunii_clean_list.png');
        await client.screenshot(listScreenshot);
        console.log(`List screenshot saved to: ${listScreenshot}`);

        await client.close();
        console.log('All operations completed cleanly and successfully!');
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
