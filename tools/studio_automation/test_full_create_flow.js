const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Step 1: Navigating to News CMS model...');
        await client.navigate('https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf');
        await new Promise(r => setTimeout(r, 4000));

        console.log('Step 2: Clicking "＋ 新規追加"...');
        await client.evaluate(`(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
            if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 4000));

        const titleText = '【公式】シニアアカデミア YURU-RE:（ユルリ）構想スタート';
        const bodyText = 'ユルクでは鳥取県米子市にて、大人の好奇心が満たされる新しい学び舎「シニアアカデミア YURU-RE:（ユルリ）」の開設計画を進めています。地域のシニアがいくつになっても学び、身体を動かし、笑顔で自立できるリカレント教育モデルです。';

        console.log('Step 3: Clicking Title area to focus...');
        const titleClicked = await client.evaluate(`(() => {
            const titleEl = document.querySelector('.title-div.main-title');
            if (titleEl) {
                titleEl.click();
                titleEl.focus();
                return true;
            }
            return false;
        })()`);
        console.log('Title element clicked:', titleClicked);

        await new Promise(r => setTimeout(r, 1000));

        console.log('Step 4: Typing Title using Input.insertText...');
        await client.send('Input.insertText', { text: titleText });
        await new Promise(r => setTimeout(r, 1500));

        console.log('Step 5: Clicking Body area to focus...');
        const bodyClicked = await client.evaluate(`(() => {
            const proseEl = document.querySelector('.ProseMirror.in-cms');
            if (proseEl) {
                proseEl.click();
                proseEl.focus();
                return true;
            }
            return false;
        })()`);
        console.log('Body element clicked:', bodyClicked);

        await new Promise(r => setTimeout(r, 1000));

        console.log('Step 6: Typing Body using Input.insertText...');
        await client.send('Input.insertText', { text: bodyText });
        await new Promise(r => setTimeout(r, 3000));

        const screenshotPath = path.join(__dirname, 'full_flow_editor.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        // タイトルと本文がDOM上にどう存在しているか確認
        const checkContent = await client.evaluate(`({
            title: document.querySelector('.title-div.main-title')?.innerText,
            body: document.querySelector('.ProseMirror.in-cms')?.innerText,
            slug: Array.from(document.querySelectorAll('td, div')).find(el => el.innerText && el.innerText.includes('/'))?.innerText
        })`);
        console.log('Current Editor Content in DOM:', checkContent);

        // 5秒待って自動保存を確実にする
        console.log('Waiting 5 seconds for auto-save...');
        await new Promise(r => setTimeout(r, 5000));

        // 戻るボタンをクリックして一覧で確認
        console.log('Step 7: Clicking 戻る...');
        await client.evaluate(`(() => {
            const backBtn = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '戻る');
            if (backBtn) backBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 4000));

        const listScreenshot = path.join(__dirname, 'full_flow_list.png');
        await client.screenshot(listScreenshot);
        console.log(`Final list screenshot saved to: ${listScreenshot}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
