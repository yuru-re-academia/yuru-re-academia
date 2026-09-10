const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const bodyParagraphs = [
            'こんにちは！シニア専門ダンススクール「ゆるダン®」です。今回は、最近の各クラスでのレッスンの様子を少しだけご紹介します！',
            '今週のレッスンでは、シニア世代の皆さんが青春時代を思い出す懐かしの名曲に合わせて、無理なく身体を心地よく動かしました。椅子に座ったままでもできる上半身のリズム運動からスタートし、徐々に軽やかな足のステップへ。「久しぶりにこんなに笑いながら身体を動かしたわ！」と、参加者の皆様からたくさんの笑顔がこぼれました。',
            'ゆるダン®が大切にしているのは、ダンスの上達だけでなく「楽しむこと」と「人との温かいつながり」です。レッスン前後には世間話やおしゃべりに花が咲き、新しいお仲間同士の交流の輪もどんどん広がっています。',
            '見学や体験レッスンも随時受け付けております。身体を心地よく動かしたい方、新しい楽しみを見つけたい方は、ぜひお気軽にお問い合わせください！次回のレッスンでも皆様にお会いできるのを楽しみにしております。'
        ];

        // 1. Bodyアコーディオンの展開
        console.log('Step 1: Checking if Body is collapsed...');
        let hasProse = await client.evaluate(`!!document.querySelector('.ProseMirror.in-cms')`);
        if (!hasProse) {
            console.log('Clicking Body button to expand...');
            await client.evaluate(`(() => {
                const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.trim() === 'Body');
                if (btns.length > 0) btns[0].click();
            })()`);
            await new Promise(r => setTimeout(r, 1200));
        }

        hasProse = await client.evaluate(`!!document.querySelector('.ProseMirror.in-cms')`);
        console.log('ProseMirror visible now:', hasProse);

        if (!hasProse) {
            throw new Error('Failed to expand Body section');
        }

        // 2. 本文エディタをクリックして全選択＆クリア
        console.log('Step 2: Focusing and typing Body content...');
        const bodyCoord = await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            el.scrollIntoView({ block: 'center' });
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + 30 };
        })()`);

        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: bodyCoord.x, y: bodyCoord.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: bodyCoord.x, y: bodyCoord.y, button: 'left', clickCount: 1 });
        await new Promise(r => setTimeout(r, 300));

        await client.evaluate(`document.execCommand('selectAll', false, null)`);
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await new Promise(r => setTimeout(r, 400));

        // 段落を入力
        for (let i = 0; i < bodyParagraphs.length; i++) {
            await client.send('Input.insertText', { text: bodyParagraphs[i] });
            await new Promise(r => setTimeout(r, 200));
            if (i < bodyParagraphs.length - 1) {
                await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await new Promise(r => setTimeout(r, 250));
            }
        }

        // スクロールを戻す
        await client.evaluate(`(() => {
            window.scrollTo(0, 0);
            const scrollContainer = document.querySelector('.overflow-y-auto');
            if (scrollContainer) scrollContainer.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 800));

        console.log('Step 3: Waiting 6 seconds for auto-save (下書き自動保存)...');
        await new Promise(r => setTimeout(r, 6000));

        const verified = await client.evaluate(`({
            title: document.querySelector('.title-div.main-title')?.innerText?.trim(),
            bodyParagraphs: Array.from(document.querySelectorAll('.ProseMirror.in-cms p')).map(p => p.innerText.trim()),
            url: window.location.href
        })`);
        console.log('Verified draft content:', JSON.stringify(verified, null, 2));

        const screenshotPath = path.join(__dirname, 'lesson_draft_complete.png');
        await client.screenshot(screenshotPath);
        console.log(`Saved screenshot to: ${screenshotPath}`);

        await client.close();
        console.log('SUCCESS: Body is fully filled and draft is saved!');
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
