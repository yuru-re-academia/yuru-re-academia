const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const targetTitle = '【メディア紹介】小泉今日子さんのラジオ番組で「ゆるダン®」が紹介されました';

        const bodyParagraphs = [
            '小泉今日子さんがパーソナリティを務めるラジオ番組にて、シニア専門ダンススクール「ゆるダン®」の取り組みが紹介されました。',
            '番組内では、シニアの健康寿命延伸や介護予防・フレイル予防を目的としたダンスプログラムとして「ゆるダン®」が取り上げられ、日頃の活動の様子やその社会的意義についてご紹介いただきました。',
            '当日の放送内容や紹介時の様子は、下記の動画よりご確認いただけます。',
            '▼紹介動画',
            '［※動画のURLまたは埋め込みリンク］',
            '健康づくりや地域コミュニティにおける実践事例として、ぜひチェックしてみてください。'
        ];

        // 1. スクロール最上部
        await client.evaluate(`(() => {
            const scrollContainer = document.querySelector('.overflow-y-auto') || window;
            if (scrollContainer.scrollTo) scrollContainer.scrollTo(0, 0);
            window.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 500));

        // 2. タイトルのクリア＆入力
        console.log('Clearing and setting Title cleanly...');
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

        // 4. スクロールを戻す
        await client.evaluate(`(() => {
            window.scrollTo(0, 0);
            const scrollContainer = document.querySelector('.overflow-y-auto');
            if (scrollContainer) scrollContainer.scrollTo(0, 0);
        })()`);
        await new Promise(r => setTimeout(r, 800));

        // 5. 自動保存待機（下書き保存・8秒待機）
        console.log('Waiting 8 seconds for auto-save (下書き保存)...');
        await new Promise(r => setTimeout(r, 8000));

        // 6. 検証
        const verified = await client.evaluate(`({
            title: document.querySelector('.title-div.main-title')?.innerText?.trim(),
            bodyParagraphs: Array.from(document.querySelectorAll('.ProseMirror.in-cms p')).map(p => p.innerText.trim()).filter(Boolean),
            url: window.location.href,
            status: document.querySelector('.o-post-editor-status, [class*=\"status\"]')?.innerText
        })`);
        console.log('Verified Content:', JSON.stringify(verified, null, 2));

        const screenshotPath = path.join(__dirname, 'kyonkyon_authoritative_editor.png');
        await client.screenshot(screenshotPath);
        console.log(`Saved screenshot to: ${screenshotPath}`);

        // 7. 一覧画面へ戻る
        console.log('Clicking 戻る...');
        await client.evaluate(`(() => {
            const btns = Array.from(document.querySelectorAll('button, div')).filter(b => b.innerText && b.innerText.trim() === '戻る' && b.offsetHeight > 0);
            if (btns.length > 0) btns[0].click();
        })()`);
        await new Promise(r => setTimeout(r, 4000));

        const listScreenshot = path.join(__dirname, 'kyonkyon_authoritative_list.png');
        await client.screenshot(listScreenshot);
        console.log(`Saved list screenshot to: ${listScreenshot}`);

        await client.close();
        console.log('SUCCESS: Authoritative rewrite finished cleanly!');
    } catch (e) {
        console.error('Error in main:', e);
        process.exit(1);
    }
}

main();
