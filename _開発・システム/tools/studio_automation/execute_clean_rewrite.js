const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const articleUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/M40pur1aT9IyXtVpUECY';
        console.log(`Navigating to target article editor: ${articleUrl}`);
        await client.navigate(articleUrl);
        await new Promise(r => setTimeout(r, 4500));

        const newTitle = '83歳・総フォロワー15万人の松二ィ（松本さん）が地元企業より人生・価値観についての取材を受けました';

        const paragraphs = [
            '本日9月7日、鳥取県米子市のシニア向け住宅「シニアステージ西福原」にお住まいの松二ィ（松兄）こと松本さん（83歳）が、地元企業からのインタビュー取材を受けました。',
            '今回の取材は、松本さんのこれまでの人生の歩みや大切にされている価値観について話を聞かせてほしいとの依頼を受けて実施されたものです。取材では、これまでの歩みや日々の考え方についてお話しさせていただきました。',
            '松二ィは、YURU\'QとともにSNS運用を始めて約1年半が経過し、現在は総フォロワー数15万人となっています。SNSを通じて新たな生きがいを見出しており、弊社の活動におけるエバンジェリスト的な存在でもあります。',
            '今後も松二ィの活動とともに、日々の発信を継続してまいります。'
        ];

        console.log('Updating Title...');
        await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                el.focus();
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        })()`);
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await new Promise(r => setTimeout(r, 400));
        await client.send('Input.insertText', { text: newTitle });
        await new Promise(r => setTimeout(r, 1000));

        console.log('Updating Body...');
        await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (el) {
                el.focus();
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        })()`);
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await new Promise(r => setTimeout(r, 500));

        // 各段落を順番に入力
        for (let i = 0; i < paragraphs.length; i++) {
            await client.send('Input.insertText', { text: paragraphs[i] });
            await new Promise(r => setTimeout(r, 200));
            if (i < paragraphs.length - 1) {
                await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await new Promise(r => setTimeout(r, 300));
            }
        }

        console.log('Waiting 6 seconds for auto-save (下書き自動保存)...');
        await new Promise(r => setTimeout(r, 6000));

        const editorScreenshot = path.join(__dirname, 'matsunii_final_editor.png');
        await client.screenshot(editorScreenshot);
        console.log(`Final Editor screenshot saved to: ${editorScreenshot}`);

        // 一覧画面へ戻る
        console.log('Navigating back to list...');
        await client.evaluate(`(() => {
            const backBtn = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '戻る');
            if (backBtn) backBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 4500));

        const listScreenshot = path.join(__dirname, 'matsunii_final_list.png');
        await client.screenshot(listScreenshot);
        console.log(`Final List screenshot saved to: ${listScreenshot}`);

        await client.close();
        console.log('Rewrite and auto-save completed successfully!');
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
