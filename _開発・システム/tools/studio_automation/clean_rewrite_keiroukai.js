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
            '当日は地域の高齢者の方々が約80名集まり、会場は温かい笑顔と熱気に満ちあふれていました。色鮮やかで華やかな衣装を身にまとったフラダンスの優雅なステージや、心温まるコーラスなど、皆様の生き生きとした表情がとても印象的な素晴らしいひとときでした。',
            '私たち「ゆるダン®」も貴重なお時間をいただき、会場の皆様全員と一緒に音楽に合わせて身体を動かしました！椅子に座ったままでも無理なく楽しめる上半身のリズム運動や手拍子からスタートし、会場全体が一体となって心地よい音楽と笑顔に包まれました。',
            '体験してくださった皆様からは、「久しぶりにこんなに笑って身体を動かせて楽しかった！」「心がすっと軽くなった」「ぜひまた一緒に踊りたい！」といった温かいお声をたくさんいただき、私たちにとってもかけがえのない大切な時間となりました。',
            'このような記念すべき式典・敬老会にお声がけいただき、皆様と温かい時間を共に過ごせましたことを心より感謝申し上げます。本当にありがとうございました！',
            '▼公式ホームページはこちら',
            'https://www.suimeiso.jp/'
        ];

        // 1. スクロール最上部
        await client.evaluate(`(() => {
            const scrollContainer = document.querySelector('.overflow-y-auto') || window;
            if (scrollContainer.scrollTo) scrollContainer.scrollTo(0, 0);
            window.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 500));

        // 2. タイトルのクリア＆入力
        console.log('Clearing and setting Title...');
        await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                el.scrollIntoView({ block: 'center' });
                el.focus();
                const sel = window.getSelection();
                sel.selectAllChildren(el);
                sel.deleteFromDocument();
            }
        })()`);
        await new Promise(r => setTimeout(r, 400));
        await client.send('Input.insertText', { text: targetTitle });
        await new Promise(r => setTimeout(r, 800));

        // 3. 本文のクリア＆入力
        console.log('Clearing and setting Body paragraphs...');
        await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (el) {
                el.scrollIntoView({ block: 'center' });
                el.focus();
                const sel = window.getSelection();
                sel.selectAllChildren(el);
                sel.deleteFromDocument();
            }
        })()`);
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

        // 4. カテゴリの確認・設定
        console.log('Checking/Setting Category...');
        try {
            const catPos = await client.evaluate(`(() => {
                const rows = Array.from(document.querySelectorAll('.o-post-editor-right-item'));
                const catRow = rows.find(r => r.innerText && r.innerText.includes('カテゴリ'));
                if (catRow && !catRow.innerText.includes('ゆるダン')) {
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

        // 5. スクロールを戻す
        await client.evaluate(`(() => {
            window.scrollTo(0, 0);
            const scrollContainer = document.querySelector('.overflow-y-auto');
            if (scrollContainer) scrollContainer.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 800));

        // 6. 自動保存待機（下書き保存）
        console.log('Waiting 7 seconds for auto-save (下書き保存)...');
        await new Promise(r => setTimeout(r, 7000));

        // 7. 検証
        const verified = await client.evaluate(`({
            title: document.querySelector('.title-div.main-title')?.innerText?.trim(),
            bodyParagraphs: Array.from(document.querySelectorAll('.ProseMirror.in-cms p')).map(p => p.innerText.trim()).filter(Boolean),
            url: window.location.href,
            rightPanel: document.querySelector('.o-post-editor-right')?.innerText?.replace(/\\n+/g, ' | ')
        })`);
        console.log('Verified Content:', JSON.stringify(verified, null, 2));

        const screenshotPath = path.join(__dirname, 'keiroukai_draft_perfect.png');
        await client.screenshot(screenshotPath);
        console.log(`Saved screenshot to: ${screenshotPath}`);

        await client.close();
        console.log('SUCCESS: Clean rewrite finished!');
    } catch (e) {
        console.error('Error in main:', e);
        process.exit(1);
    }
}

main();
