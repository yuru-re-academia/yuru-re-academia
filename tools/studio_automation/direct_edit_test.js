const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        const editUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/OFYtyU6C';
        console.log(`Navigating directly to item editor: ${editUrl}`);
        await client.navigate(editUrl);
        await new Promise(r => setTimeout(r, 4000));

        const titleText = '【テスト】シニアアカデミア YURU-RE: 開設に向けて';
        const bodyText = '鳥取県米子市にて、大人の好奇心が満たされる学び舎「シニアアカデミア YURU-RE:（ユルリ）」の開設計画を進めています。';

        console.log('Focusing Title element...');
        const titleFocused = await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                el.focus();
                // 選択をクリア
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                return true;
            }
            return false;
        })()`);
        console.log('Title focused:', titleFocused);

        // CDPのネイティブ文字入力 API を使用
        console.log('Inserting text into Title via CDP Input.insertText...');
        await client.send('Input.insertText', { text: titleText });
        await new Promise(r => setTimeout(r, 1000));

        console.log('Focusing Body element...');
        const bodyFocused = await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (el) {
                el.focus();
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                return true;
            }
            return false;
        })()`);
        console.log('Body focused:', bodyFocused);

        console.log('Inserting text into Body via CDP Input.insertText...');
        await client.send('Input.insertText', { text: bodyText });
        await new Promise(r => setTimeout(r, 2000));

        const screenshotPath = path.join(__dirname, 'direct_edit_screenshot.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        // 自動保存を待つ
        console.log('Waiting 3 seconds for auto-save...');
        await new Promise(r => setTimeout(r, 3000));

        // 一覧画面へ戻る
        console.log('Navigating back to list...');
        await client.navigate('https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf');
        await new Promise(r => setTimeout(r, 4000));

        const listScreenshot = path.join(__dirname, 'news_list_final_check.png');
        await client.screenshot(listScreenshot);
        console.log(`Final list screenshot saved to: ${listScreenshot}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
