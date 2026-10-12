const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const cmsListUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf';
        console.log(`Navigating to CMS list: ${cmsListUrl}`);
        await client.navigate(cmsListUrl);
        await new Promise(r => setTimeout(r, 4500));

        // 1. 新規追加ボタンをクリック
        console.log('Clicking 新規追加 button...');
        const clicked = await client.evaluate(`(() => {
            const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && (b.innerText.includes('新規追加') || b.innerText.includes('アイテムを追加')));
            if (btns.length > 0) {
                btns[0].click();
                return btns[0].innerText.trim();
            }
            return false;
        })()`);
        console.log('Clicked button:', clicked);
        await new Promise(r => setTimeout(r, 3500));

        const targetTitle = '【メディア紹介】小泉今日子さんのラジオ番組で「ゆるダン®」が紹介されました！';

        const bodyParagraphs = [
            'こんにちは！シニア専門ダンススクール「ゆるダン®」です。',
            '以前、あの小泉今日子さん（キョンキョン）のラジオ番組にて、私たちの「ゆるダン®」の取り組みを取り上げていただきました！',
            '番組内で温かいコメントとともにご紹介いただき、メンバー一同大変光栄で、大きな励みとなりました。',
            '当日の実際の様子やご紹介いただいた内容は、ぜひ下記の動画からご覧ください！',
            '▼紹介動画はこちら',
            '［※動画のURLまたは埋め込みリンク］',
            'これからも地域のシニアの皆様に笑顔と元気をお届けできるよう、楽しく活動を続けてまいります。ぜひ動画もチェックしてみてくださいね！'
        ];

        // 2. スクロール最上部へ
        await client.evaluate(`(() => {
            const scrollContainer = document.querySelector('.overflow-y-auto') || window;
            if (scrollContainer.scrollTo) scrollContainer.scrollTo(0, 0);
            window.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 500));

        // 3. タイトル入力（クリア＆入力）
        console.log('Step 1: Setting Title cleanly...');
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

        // 4. 本文入力
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

        // 5. カテゴリ設定（「ゆるダン」）
        console.log('Step 3: Setting Category...');
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

        // 6. スクロールを戻す
        await client.evaluate(`(() => {
            window.scrollTo(0, 0);
            const scrollContainer = document.querySelector('.overflow-y-auto');
            if (scrollContainer) scrollContainer.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 800));

        // 7. 自動保存待機（下書き保存）
        console.log('Step 4: Waiting 7 seconds for auto-save (下書き保存)...');
        await new Promise(r => setTimeout(r, 7000));

        // 8. 検証
        const verified = await client.evaluate(`({
            title: document.querySelector('.title-div.main-title')?.innerText?.trim(),
            bodyParagraphs: Array.from(document.querySelectorAll('.ProseMirror.in-cms p')).map(p => p.innerText.trim()).filter(Boolean),
            url: window.location.href,
            rightPanel: document.querySelector('.o-post-editor-right')?.innerText?.replace(/\\n+/g, ' | ')
        })`);
        console.log('Verified Content:', JSON.stringify(verified, null, 2));

        const screenshotPath = path.join(__dirname, 'kyonkyon_draft_editor.png');
        await client.screenshot(screenshotPath);
        console.log(`Saved editor screenshot to: ${screenshotPath}`);

        // 9. 一覧画面へ戻って下書き確認
        console.log('Navigating back to list...');
        await client.evaluate(`(() => {
            const backBtn = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '戻る');
            if (backBtn) backBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 4000));

        const listScreenshot = path.join(__dirname, 'kyonkyon_draft_list.png');
        await client.screenshot(listScreenshot);
        console.log(`Saved list screenshot to: ${listScreenshot}`);

        await client.close();
        console.log('SUCCESS: Kyonkyon radio article draft created cleanly!');
    } catch (e) {
        console.error('Error in main:', e);
        process.exit(1);
    }
}

main();
