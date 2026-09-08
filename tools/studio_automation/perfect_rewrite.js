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

        // 1. タイトル要素の座標を取得してクリック＆全消去＆入力
        console.log('Step 1: Focus and update Title...');
        const titleRect = await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + r.height / 2 };
        })()`);

        if (!titleRect) throw new Error('Title element not found');

        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: titleRect.x, y: titleRect.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: titleRect.x, y: titleRect.y, button: 'left', clickCount: 1 });
        await new Promise(r => setTimeout(r, 300));

        await client.evaluate(`document.execCommand('selectAll', false, null)`);
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await new Promise(r => setTimeout(r, 400));

        await client.send('Input.insertText', { text: targetTitle });
        await new Promise(r => setTimeout(r, 1000));

        // 2. 本文要素の座標を取得してクリック＆全消去＆入力
        console.log('Step 2: Focus and update Body...');
        const bodyRect = await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + 30 };
        })()`);

        if (!bodyRect) throw new Error('Body element not found');

        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: bodyRect.x, y: bodyRect.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: bodyRect.x, y: bodyRect.y, button: 'left', clickCount: 1 });
        await new Promise(r => setTimeout(r, 300));

        await client.evaluate(`document.execCommand('selectAll', false, null)`);
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await new Promise(r => setTimeout(r, 500));

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

        // DOMの現在のテキストを検証
        const verifyContent = await client.evaluate(`({
            currentTitle: document.querySelector('.title-div.main-title')?.innerText?.trim(),
            currentBodyParagraphs: Array.from(document.querySelectorAll('.ProseMirror.in-cms p')).map(p => p.innerText.trim())
        })`);
        console.log('Verification result:', JSON.stringify(verifyContent, null, 2));

        const editorScreenshot = path.join(__dirname, 'matsunii_perfect_editor.png');
        await client.screenshot(editorScreenshot);
        console.log(`Saved screenshot to: ${editorScreenshot}`);

        // 一覧画面へ戻る
        console.log('Navigating back to list...');
        await client.evaluate(`(() => {
            const backBtn = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '戻る');
            if (backBtn) backBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 4500));

        const listScreenshot = path.join(__dirname, 'matsunii_perfect_list.png');
        await client.screenshot(listScreenshot);
        console.log(`Saved list screenshot to: ${listScreenshot}`);

        await client.close();
        console.log('Finished cleanly!');
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
