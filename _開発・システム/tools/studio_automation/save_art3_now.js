const CDPClient = require('./cdp_client');
const path = require('path');

const art3 = {
    num: 3,
    date: '2024.07.11',
    title: '【2024.07.11】日本海新聞にて「ゆるダン®」の取り組みが掲載されました',
    bodyParagraphs: [
        '山陰の地方紙である日本海新聞にて、シニア向け健康ダンス「ゆるダン®」の活動が紹介されました。',
        'NHKでの生放送出演を機に、地域高齢者の介護予防・フレイル予防や、外出機会の創出に向けた取り組みとして紙面に取り上げていただきました。シニア男性の参加促進も含め、地域コミュニティにおける運動習慣定着への意義が報じられています。',
        '山陰・鳥取地域における健康寿命延伸の先進事例として、ぜひご確認ください。',
        '【関連リンク・参考情報】',
        '・新日本海新聞社 公式ホームページ：https://www.nnn.co.jp/'
    ]
};

async function clickAt(client, x, y) {
    await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function run() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');

    console.log('Focusing Title...');
    const titlePos = await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + 20 };
        }
        return null;
    })()`);
    if (!titlePos) throw new Error('Title element not found');
    await clickAt(client, titlePos.x, titlePos.y);
    await new Promise(r => setTimeout(r, 300));

    console.log('Typing Title...');
    await client.send('Input.insertText', { text: art3.title });
    await new Promise(r => setTimeout(r, 400));
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    })()`);
    await new Promise(r => setTimeout(r, 500));

    // 4. Focus & Type Body
    console.log('Focusing Body...');
    const bodyPos = await client.evaluate(`(() => {
        const el = document.querySelector('.ProseMirror.in-cms');
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + 30 };
        }
        return null;
    })()`);
    if (!bodyPos) throw new Error('Body element not found');
    await clickAt(client, bodyPos.x, bodyPos.y);
    await new Promise(r => setTimeout(r, 300));

    console.log('Typing Body paragraphs...');
    for (let i = 0; i < art3.bodyParagraphs.length; i++) {
        await client.send('Input.insertText', { text: art3.bodyParagraphs[i] });
        await new Promise(r => setTimeout(r, 150));
        if (i < art3.bodyParagraphs.length - 1) {
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await new Promise(r => setTimeout(r, 200));
        }
    }
    await new Promise(r => setTimeout(r, 500));

    // 5. Select Category (ゆるダン)
    console.log('Selecting Category (ゆるダン)...');
    try {
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
    } catch (e) {
        console.error('Category selection error:', e.message);
    }

    // 6. Auto-save wait (7s)
    console.log('Waiting 7s for auto-save (下書き保存)...');
    await new Promise(r => setTimeout(r, 7000));

    const screenshotPath = path.join(__dirname, 'art3_saved.png');
    await client.screenshot(screenshotPath);
    console.log(`Saved screenshot: ${screenshotPath}`);

    // 7. Click 戻る
    console.log('Clicking 戻る...');
    await client.evaluate(`(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('戻る'));
        if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 3500));

    const listScreenshotPath = path.join(__dirname, 'list_after_art3.png');
    await client.screenshot(listScreenshotPath);
    console.log(`Saved list screenshot: ${listScreenshotPath}`);

    await client.close();
}

run().catch(console.error);
