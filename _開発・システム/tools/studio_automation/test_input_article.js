const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const titleText = '【テスト】シニアアカデミア YURU-RE: 開設に向けて';
        const bodyText = '鳥取県米子市にて、大人の好奇心が満たされる学び舎「シニアアカデミア YURU-RE:（ユルリ）」の開設計画を進めています。リカレント教育と運動を掛け合わせた新しい自立支援モデルを目指します。';

        console.log('Inputting Title...');
        await client.evaluate(`(() => {
            const titleEl = document.querySelector('.title-div.main-title');
            if (titleEl) {
                titleEl.focus();
                titleEl.innerText = ${JSON.stringify(titleText)};
                titleEl.dispatchEvent(new Event('input', { bubbles: true }));
                titleEl.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
            return false;
        })()`);

        await new Promise(r => setTimeout(r, 1000));

        console.log('Inputting Body...');
        await client.evaluate(`(() => {
            const proseEl = document.querySelector('.ProseMirror.in-cms');
            if (proseEl) {
                proseEl.focus();
                // ProseMirrorの段落要素にテキストを入れる
                let p = proseEl.querySelector('p');
                if (!p) {
                    p = document.createElement('p');
                    proseEl.appendChild(p);
                }
                p.innerText = ${JSON.stringify(bodyText)};
                proseEl.dispatchEvent(new Event('input', { bubbles: true }));
                return true;
            }
            return false;
        })()`);

        await new Promise(r => setTimeout(r, 1000));

        // カテゴリ欄をクリックしてドロップダウンの選択肢を確認
        console.log('Clicking Category field...');
        const categoryOptions = await client.evaluate(`(() => {
            // カテゴリの行を探す
            const catLabel = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === 'カテゴリ');
            if (catLabel) {
                const parentRow = catLabel.closest('tr') || catLabel.parentElement;
                const valueArea = parentRow ? parentRow.querySelector('td:last-child, div:last-child') : null;
                if (valueArea) {
                    valueArea.click();
                }
            }
            return true;
        })()`);

        await new Promise(r => setTimeout(r, 2000));

        // ドロップダウンに出てきた候補を取得
        const dropdownItems = await client.evaluate(`(() => {
            return Array.from(document.querySelectorAll('[role="option"], [class*="option"], [class*="menu-item"], [class*="dropdown"] li, [class*="select"] div'))
                .map(el => el.innerText.trim())
                .filter(Boolean);
        })()`);

        console.log('Dropdown items found:', dropdownItems);

        const screenshotPath = path.join(__dirname, 'test_input_result.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
