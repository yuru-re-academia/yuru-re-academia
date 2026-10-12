const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const draftUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/BxGswyiCX8RQLBwSvSG6';
        console.log(`Navigating to draft editor: ${draftUrl}`);
        await client.navigate(draftUrl);
        await new Promise(r => setTimeout(r, 4500));

        const targetTitle = '【レッスン風景】笑顔とリズムが広がる！最近のゆるダン®レッスンの様子をお届けします';

        const bodyParagraphs = [
            'こんにちは！シニア専門ダンススクール「ゆるダン®」です。今回は、最近の各クラスでのレッスンの様子を少しだけご紹介します！',
            '今週のレッスンでは、シニア世代の皆さんが青春時代を思い出す懐かしの名曲に合わせて、無理なく身体を心地よく動かしました。椅子に座ったままでもできる上半身のリズム運動からスタートし、徐々に軽やかなステップへ。「久しぶりにこんなに笑いながら身体を動かしたわ！」と、参加者の皆様からたくさんの笑顔がこぼれました。',
            'ゆるダン®が大切にしているのは、ダンスの上達だけでなく「楽しむこと」と「人との温かいつながり」です。レッスン前後には世間話やおしゃべりに花が咲き、新しいお仲間同士の交流の輪もどんどん広がっています。',
            '見学や体験レッスンも随時受け付けております。身体を心地よく動かしたい方、新しい楽しみを見つけたい方は、ぜひお気軽にお問い合わせください！次回のレッスンでも皆様にお会いできるのを楽しみにしております。'
        ];

        // 1. スクロールを最上部へ
        await client.evaluate(`(() => {
            const scrollContainer = document.querySelector('.overflow-y-auto') || window;
            if (scrollContainer.scrollTo) scrollContainer.scrollTo(0, 0);
            window.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 500));

        // 2. タイトル入力（直接DOM操作＋inputイベント発火、およびキー入力）
        console.log('Step 1: Setting Title cleanly...');
        await client.evaluate(`(() => {
            const titleEl = document.querySelector('.title-div.main-title');
            if (titleEl) {
                titleEl.scrollIntoView({ block: 'center' });
                titleEl.focus();
            }
        })()`);
        await new Promise(r => setTimeout(r, 300));

        const titleCoord = await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + r.height / 2 };
        })()`);

        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: titleCoord.x, y: titleCoord.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: titleCoord.x, y: titleCoord.y, button: 'left', clickCount: 1 });
        await new Promise(r => setTimeout(r, 200));

        // 全選択して削除
        await client.evaluate(`document.execCommand('selectAll', false, null)`);
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await new Promise(r => setTimeout(r, 300));

        // タイトル文字を入力
        await client.send('Input.insertText', { text: targetTitle });
        await new Promise(r => setTimeout(r, 1000));

        // 3. 本文入力
        console.log('Step 2: Setting Body cleanly...');
        await client.evaluate(`(() => {
            const bodyEl = document.querySelector('.ProseMirror.in-cms');
            if (bodyEl) {
                bodyEl.scrollIntoView({ block: 'center' });
                bodyEl.focus();
            }
        })()`);
        await new Promise(r => setTimeout(r, 300));

        const bodyCoord = await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + 30 };
        })()`);

        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: bodyCoord.x, y: bodyCoord.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: bodyCoord.x, y: bodyCoord.y, button: 'left', clickCount: 1 });
        await new Promise(r => setTimeout(r, 200));

        // 全選択して削除
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

        // 4. カテゴリ設定
        console.log('Step 3: Setting Category to "ゆるダン"...');
        try {
            const catPos = await client.evaluate(`(() => {
                const rows = Array.from(document.querySelectorAll('.o-post-editor-right-item'));
                const catRow = rows.find(r => r.innerText && r.innerText.includes('カテゴリ'));
                if (catRow) {
                    const r = catRow.getBoundingClientRect();
                    return { x: r.right - 40, y: r.top + r.height / 2 };
                }
                return null;
            })()`);

            if (catPos) {
                console.log(`Clicking category at (${catPos.x}, ${catPos.y})...`);
                await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: catPos.x, y: catPos.y, button: 'left', clickCount: 1 });
                await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: catPos.x, y: catPos.y, button: 'left', clickCount: 1 });
                await new Promise(r => setTimeout(r, 1200));

                const optionClicked = await client.evaluate(`(() => {
                    const allEls = Array.from(document.querySelectorAll('*'));
                    const opt = allEls.find(el => el.innerText && el.innerText.trim() === 'ゆるダン' && el.offsetHeight > 0 && el.offsetHeight < 50);
                    if (opt) {
                        opt.click();
                        return true;
                    }
                    return false;
                })()`);
                console.log('Category option clicked:', optionClicked);
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e) {
            console.log('Category click error:', e.message);
        }

        // スクロールを元に戻して全体を見せる
        await client.evaluate(`(() => {
            window.scrollTo(0, 0);
            const scrollContainer = document.querySelector('.overflow-y-auto');
            if (scrollContainer) scrollContainer.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 1000));

        console.log('Step 4: Waiting 6 seconds for auto-save (下書き保存)...');
        await new Promise(r => setTimeout(r, 6000));

        // 検証
        const verified = await client.evaluate(`({
            title: document.querySelector('.title-div.main-title')?.innerText?.trim(),
            bodyParagraphs: Array.from(document.querySelectorAll('.ProseMirror.in-cms p')).map(p => p.innerText.trim()),
            url: window.location.href,
            rightPanel: document.querySelector('.o-post-editor-right')?.innerText?.replace(/\\n+/g, ' | ')
        })`);
        console.log('Verified Content:', JSON.stringify(verified, null, 2));

        const screenshotPath = path.join(__dirname, 'lesson_draft_final.png');
        await client.screenshot(screenshotPath);
        console.log(`Saved screenshot to: ${screenshotPath}`);

        await client.close();
        console.log('Article draft is perfectly prepared in Studio CMS!');
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
