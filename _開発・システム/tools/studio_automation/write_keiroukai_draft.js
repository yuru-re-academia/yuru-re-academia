const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect();

        const targetTitle = '【活動報告】敬老会にて約80名の皆様と「ゆるダン®」を踊りました！';

        const bodyParagraphs = [
            'こんにちは！シニア専門ダンススクール「ゆるダン®」です。',
            '9月12日、鳥取県にて開催された記念すべき式典と敬老会イベントに参加させていただきました！',
            '当日は地域の高齢者の方々が約80名集まり、会場は温かい笑顔と活気に満ちあふれていました。色鮮やかで華やかな衣装を身にまとったフラダンスの優雅なステージや、心温まるコーラスなど、皆様の生き生きとした表情がとても印象的な素晴らしいひとときでした。',
            '私たち「ゆるダン®」も貴重なお時間をいただき、会場の皆様全員と一緒に音楽に合わせて身体を動かしました！椅子に座ったままでも無理なく楽しめる上半身のリズム運動や手拍子からスタートし、会場全体が一体となって心地よい音楽と笑顔に包まれました。',
            '体験してくださった皆様からは、「久しぶりにこんなに笑って身体を動かせて楽しかった！」「心がすっと軽くなった」「ぜひまた一緒に踊りたい！」といった温かいお声をたくさんいただき、私たちにとってもかけがえのない大切な時間となりました。',
            'このような記念すべき式典・敬老会にお声がけいただき、皆様と温かい時間を共に過ごせましたことを心より感謝申し上げます。本当にありがとうございました！',
            '▼公式ホームページはこちら\nhttps://www.suimeiso.jp/'
        ];

        // 1. スクロールを最上部へ
        await client.evaluate(`(() => {
            const scrollContainer = document.querySelector('.overflow-y-auto') || window;
            if (scrollContainer.scrollTo) scrollContainer.scrollTo(0, 0);
            window.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 500));

        // 2. タイトル入力
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
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + r.height / 2 };
        })()`);

        if (titleCoord) {
            await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: titleCoord.x, y: titleCoord.y, button: 'left', clickCount: 1 });
            await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: titleCoord.x, y: titleCoord.y, button: 'left', clickCount: 1 });
            await new Promise(r => setTimeout(r, 200));

            await client.evaluate(`document.execCommand('selectAll', false, null)`);
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
            await new Promise(r => setTimeout(r, 300));

            await client.send('Input.insertText', { text: targetTitle });
            await new Promise(r => setTimeout(r, 1000));
        }

        // 3. 本文入力
        console.log('Step 2: Checking ProseMirror and Setting Body...');
        let hasProse = await client.evaluate(`!!document.querySelector('.ProseMirror.in-cms')`);
        if (!hasProse) {
            console.log('ProseMirror not found immediately, checking Body section button...');
            await client.evaluate(`(() => {
                const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.trim() === 'Body');
                if (btns.length > 0) btns[0].click();
            })()`);
            await new Promise(r => setTimeout(r, 1200));
        }

        const bodyCoord = await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (!el) return null;
            el.scrollIntoView({ block: 'center' });
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + 30 };
        })()`);

        if (bodyCoord) {
            await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: bodyCoord.x, y: bodyCoord.y, button: 'left', clickCount: 1 });
            await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: bodyCoord.x, y: bodyCoord.y, button: 'left', clickCount: 1 });
            await new Promise(r => setTimeout(r, 200));

            await client.evaluate(`document.execCommand('selectAll', false, null)`);
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
            await new Promise(r => setTimeout(r, 400));

            for (let i = 0; i < bodyParagraphs.length; i++) {
                await client.send('Input.insertText', { text: bodyParagraphs[i] });
                await new Promise(r => setTimeout(r, 200));
                if (i < bodyParagraphs.length - 1) {
                    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                    await new Promise(r => setTimeout(r, 250));
                }
            }
        }

        // 4. カテゴリ設定（「ゆるダン」または該当カテゴリ）
        console.log('Step 3: Setting Category...');
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
            console.log('Category setting skipped/error:', e.message);
        }

        // 5. スクロールを戻して全体を表示
        await client.evaluate(`(() => {
            window.scrollTo(0, 0);
            const scrollContainer = document.querySelector('.overflow-y-auto');
            if (scrollContainer) scrollContainer.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 1000));

        // 6. 自動保存待機（下書き保存）
        console.log('Step 4: Waiting 6 seconds for auto-save (下書き保存)...');
        await new Promise(r => setTimeout(r, 6000));

        // 7. 検証
        const verified = await client.evaluate(`({
            title: document.querySelector('.title-div.main-title')?.innerText?.trim(),
            bodyParagraphs: Array.from(document.querySelectorAll('.ProseMirror.in-cms p')).map(p => p.innerText.trim()),
            url: window.location.href,
            rightPanel: document.querySelector('.o-post-editor-right')?.innerText?.replace(/\\n+/g, ' | ')
        })`);
        console.log('Verified Draft Content:', JSON.stringify(verified, null, 2));

        const screenshotPath = path.join(__dirname, 'keiroukai_draft_final.png');
        await client.screenshot(screenshotPath);
        console.log(`Saved screenshot to: ${screenshotPath}`);

        await client.close();
        console.log('SUCCESS: Keiroukai article draft created and saved!');
    } catch (e) {
        console.error('Error in main:', e);
        process.exit(1);
    }
}

main();
