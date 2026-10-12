const CDPClient = require('./cdp_client');
const path = require('path');

const art2 = {
    date: '2024.07.10',
    title: '【2024.07.10】NHK総合「いろ★ドリ」生放送に出演しました',
    bodyParagraphs: [
        'NHK総合（鳥取放送局）の情報番組「いろ★ドリ」の生放送に出演いたしました。',
        '番組内では、シニア専門ダンススクール「ゆるダン®」の活動や、運動習慣の少ないシニア男性でも気軽に取り組める健康維持プログラムの特徴についてPRさせていただきました。',
        '鳥取県内をはじめ山陰地域における高齢者の健康習慣づくりの取り組みとして、ぜひご確認ください。',
        '【関連リンク・参考情報】',
        '・NHK鳥取放送局「いろ★ドリ」公式ホームページ：https://www.nhk.jp/p/irodori/',
        '・中海・宍道湖・大山圏域市長会 公式ホームページ：https://na-s-da.net/'
    ]
};

async function clickAt(client, x, y) {
    await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        // 1. Focus Title
        console.log('Focusing Title...');
        const titlePos = await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                const r = el.getBoundingClientRect();
                return { x: r.left + 50, y: r.top + 20 };
            }
            return null;
        })()`);
        await clickAt(client, titlePos.x, titlePos.y);
        await new Promise(r => setTimeout(r, 300));
        
        console.log('Typing Title...');
        await client.send('Input.insertText', { text: art2.title });
        await new Promise(r => setTimeout(r, 400));
        await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        })()`);
        await new Promise(r => setTimeout(r, 500));

        // 2. Focus Body
        console.log('Focusing Body...');
        const bodyPos = await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (el) {
                const r = el.getBoundingClientRect();
                return { x: r.left + 50, y: r.top + 30 };
            }
            return null;
        })()`);
        await clickAt(client, bodyPos.x, bodyPos.y);
        await new Promise(r => setTimeout(r, 300));

        console.log('Typing Body paragraphs...');
        for (let i = 0; i < art2.bodyParagraphs.length; i++) {
            await client.send('Input.insertText', { text: art2.bodyParagraphs[i] });
            await new Promise(r => setTimeout(r, 150));
            if (i < art2.bodyParagraphs.length - 1) {
                await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await new Promise(r => setTimeout(r, 200));
            }
        }
        await new Promise(r => setTimeout(r, 500));

        // 3. Category
        console.log('Selecting Category (ゆるダン)...');
        const catPos = await client.evaluate(`(() => {
            const el = document.querySelector('.o-post-editor-right-item-reference-field');
            if (el) {
                const r = el.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            }
            return null;
        })()`);
        if (catPos) {
            await clickAt(client, catPos.x, catPos.y);
            await new Promise(r => setTimeout(r, 800));

            const catClicked = await client.evaluate(`(() => {
                const items = Array.from(document.querySelectorAll('.unselected-list-wrap .o-cms-content-edit-reference-field-dropdown-item, .o-cms-content-edit-reference-field-dropdown-item'));
                const target = items.find(it => it.innerText && it.innerText.includes('ゆるダン'));
                if (target) {
                    target.click();
                    return true;
                }
                return false;
            })()`);
            console.log('Category clicked:', catClicked);
            await new Promise(r => setTimeout(r, 400));

            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await new Promise(r => setTimeout(r, 400));
        }

        // 4. Auto-save wait
        console.log('Waiting 7s for auto-save...');
        await new Promise(r => setTimeout(r, 7000));

        const screenshotPath = path.join(__dirname, 'art2_saved.png');
        await client.screenshot(screenshotPath);
        console.log('Screenshot saved to:', screenshotPath);

        // 5. Click 戻る
        console.log('Clicking 戻る at (35, 87)...');
        await clickAt(client, 35, 87);
        await new Promise(r => setTimeout(r, 3000));

        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
