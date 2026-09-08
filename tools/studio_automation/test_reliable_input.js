const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Clicking the draft item row to edit...');
        await client.evaluate(`(() => {
            const rows = Array.from(document.querySelectorAll('tr, [class*="item"], div'));
            const draftRow = rows.find(r => r.innerText && r.innerText.includes('OFYtyU6C'));
            if (draftRow) draftRow.click();
        })()`);

        await new Promise(r => setTimeout(r, 3000));

        console.log('Focusing Title and typing with document.execCommand...');
        const titleText = '【テスト】シニアアカデミア YURU-RE: 開設に向けて';
        const bodyText = '鳥取県米子市にて、大人の好奇心が満たされる学び舎「シニアアカデミア YURU-RE:（ユルリ）」の開設計画を進めています。';

        // 1. タイトル入力
        await client.evaluate(`(() => {
            const titleEl = document.querySelector('.title-div.main-title');
            if (titleEl) {
                titleEl.focus();
                // 全選択して消去
                document.execCommand('selectAll', false, null);
                // ネイティブ挿入
                document.execCommand('insertText', false, ${JSON.stringify(titleText)});
                return true;
            }
            return false;
        })()`);

        await new Promise(r => setTimeout(r, 1000));

        // 2. 本文入力
        await client.evaluate(`(() => {
            const proseEl = document.querySelector('.ProseMirror.in-cms');
            if (proseEl) {
                proseEl.focus();
                document.execCommand('selectAll', false, null);
                document.execCommand('insertText', false, ${JSON.stringify(bodyText)});
                return true;
            }
            return false;
        })()`);

        await new Promise(r => setTimeout(r, 2000));

        // 3. カテゴリ設定の調査：一覧画面に戻ってカテゴリをクリックするか、エディタで設定するか
        // まずスクリーンショットで確認
        const screenshotPath = path.join(__dirname, 'editor_after_exec_command.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        // 4. 戻るボタンをクリック
        console.log('Clicking 戻る...');
        await client.evaluate(`(() => {
            const backBtn = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '戻る');
            if (backBtn) backBtn.click();
        })()`);

        await new Promise(r => setTimeout(r, 3000));

        const listScreenshot = path.join(__dirname, 'news_list_verified.png');
        await client.screenshot(listScreenshot);
        console.log(`List screenshot saved to: ${listScreenshot}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
