const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Step 1: Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const cmsUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf';
        console.log(`Step 2: Navigating to CMS News model: ${cmsUrl}`);
        await client.navigate(cmsUrl);
        await new Promise(r => setTimeout(r, 4500));

        console.log('Step 3: Clicking "＋ 新規追加" button...');
        const createClicked = await client.evaluate(`(() => {
            const btns = Array.from(document.querySelectorAll('button, div, a'));
            const addBtn = btns.find(b => b.innerText && (b.innerText.includes('新規追加') || b.innerText.includes('New item')));
            if (addBtn) {
                addBtn.click();
                return true;
            }
            return false;
        })()`);
        console.log('Create button clicked:', createClicked);
        await new Promise(r => setTimeout(r, 4500));

        const targetTitle = '【レッスン風景】笑顔とリズムが広がる！最近のゆるダン®レッスンの様子をお届けします';

        const bodyParagraphs = [
            'こんにちは！シニア専門ダンススクール「ゆるダン®」です。今回は、最近の各クラスでのレッスンの様子を少しだけご紹介します！',
            '今週のレッスンでは、懐かしの名曲に合わせて、無理なく身体を心地よく動かしました。椅子に座ったままでもできる上半身のリズム運動からスタートし、徐々に軽やかなステップへ。「久しぶりにこんなに笑いながら身体を動かしたわ！」と、参加者の皆様からたくさんの笑顔がこぼれました。',
            'ゆるダン®が大切にしているのは、ダンスの上達だけでなく「楽しむこと」と「温かいつながり」です。レッスン前後には世間話やおしゃべりに花が咲き、お仲間同士の交流の輪もどんどん広がっています。',
            '見学や体験レッスンも随時受け付けております。身体を動かしたい方、新しい楽しみを見つけたい方は、ぜひお気軽にお問い合わせください！次回レッスンでも皆様にお会いできるのを楽しみにしております。'
        ];

        // 1. タイトル入力
        console.log('Step 4: Focusing and typing Title...');
        const titleRect = await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + r.height / 2 };
        })()`);

        if (!titleRect) {
            throw new Error('Title element (.title-div.main-title) not found');
        }

        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: titleRect.x, y: titleRect.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: titleRect.x, y: titleRect.y, button: 'left', clickCount: 1 });
        await new Promise(r => setTimeout(r, 300));

        await client.evaluate(`document.execCommand('selectAll', false, null)`);
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await new Promise(r => setTimeout(r, 400));

        await client.send('Input.insertText', { text: targetTitle });
        await new Promise(r => setTimeout(r, 1000));

        // 2. 本文入力
        console.log('Step 5: Focusing and typing Body...');
        const bodyRect = await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + 30 };
        })()`);

        if (!bodyRect) {
            throw new Error('Body element (.ProseMirror.in-cms) not found');
        }

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

        console.log('Step 6: Waiting 6 seconds for auto-save (下書き保存)...');
        await new Promise(r => setTimeout(r, 6000));

        // エディタの状態を検証
        const editorInfo = await client.evaluate(`({
            url: window.location.href,
            titleText: document.querySelector('.title-div.main-title')?.innerText?.trim(),
            bodyParagraphs: Array.from(document.querySelectorAll('.ProseMirror.in-cms p')).map(p => p.innerText.trim()),
            publishButton: Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('公開'))?.innerText?.trim(),
            statusText: Array.from(document.querySelectorAll('span, div')).find(el => el.innerText && (el.innerText.includes('下書き') || el.innerText.includes('未公開') || el.innerText.includes('保存')) )?.innerText?.trim()
        })`);

        console.log('Editor Info:', JSON.stringify(editorInfo, null, 2));

        // スクリーンショット撮影（下書き状態・投稿手前）
        const editorScreenshot = path.join(__dirname, 'lesson_draft_editor.png');
        await client.screenshot(editorScreenshot);
        console.log(`Saved editor screenshot to: ${editorScreenshot}`);

        // 一覧画面へ戻って下書きが反映されているか確認
        console.log('Step 7: Clicking "戻る" to verify in list...');
        await client.evaluate(`(() => {
            const backBtn = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '戻る');
            if (backBtn) backBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 4500));

        const listScreenshot = path.join(__dirname, 'lesson_draft_list.png');
        await client.screenshot(listScreenshot);
        console.log(`Saved list screenshot to: ${listScreenshot}`);

        const listInfo = await client.evaluate(`({
            url: window.location.href,
            rows: Array.from(document.querySelectorAll('tr, [role="row"]')).map(r => r.innerText.replace(/\\n+/g, ' | ').trim()).filter(Boolean).slice(0, 5)
        })`);
        console.log('Top rows in list:', JSON.stringify(listInfo, null, 2));

        await client.close();
        console.log('Done! Article is saved as draft (ready for publishing).');
    } catch (e) {
        console.error('Error during execution:', e.message);
        process.exit(1);
    }
}

main();
