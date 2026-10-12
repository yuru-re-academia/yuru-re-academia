const CDPClient = require('./cdp_client');
const path = require('path');

const article3 = {
    id: 3,
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

async function safeEvaluate(client, expr) {
    try {
        return await client.evaluate(expr);
    } catch (e) {
        return null;
    }
}

async function fillCurrentEditor(client, article) {
    console.log(`Setting Title for Article ${article.id}...`);
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.focus();
            document.execCommand('selectAll', false, null);
        }
    })()`);
    await new Promise(r => setTimeout(r, 200));
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await new Promise(r => setTimeout(r, 300));
    await client.send('Input.insertText', { text: article.title });
    await new Promise(r => setTimeout(r, 400));
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    })()`);
    await new Promise(r => setTimeout(r, 500));

    console.log(`Setting Body for Article ${article.id}...`);
    await client.evaluate(`(() => {
        const el = document.querySelector('.ProseMirror.in-cms');
        if (el) {
            el.focus();
            document.execCommand('selectAll', false, null);
        }
    })()`);
    await new Promise(r => setTimeout(r, 200));
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await new Promise(r => setTimeout(r, 300));

    for (let p = 0; p < article.bodyParagraphs.length; p++) {
        await client.send('Input.insertText', { text: article.bodyParagraphs[p] });
        await new Promise(r => setTimeout(r, 200));
        if (p < article.bodyParagraphs.length - 1) {
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await new Promise(r => setTimeout(r, 250));
        }
    }
    await new Promise(r => setTimeout(r, 800));

    console.log(`Setting Category for Article ${article.id}...`);
    try {
        await client.evaluate(`(() => {
            const refField = document.querySelector('.o-post-editor-right-item-reference-field');
            if (refField) refField.click();
        })()`);
        await new Promise(r => setTimeout(r, 800));

        const catClicked = await client.evaluate(`(() => {
            const item = document.querySelector('.unselected-list-wrap .o-cms-content-edit-reference-field-dropdown-item');
            if (item) {
                item.click();
                return item.innerText.trim();
            }
            return null;
        })()`);
        console.log('Category clicked:', catClicked);
        await new Promise(r => setTimeout(r, 500));

        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await new Promise(r => setTimeout(r, 500));
    } catch (e) {
        console.error('Category error:', e.message);
    }

    console.log('Waiting 7s for auto-save...');
    await new Promise(r => setTimeout(r, 7000));
    const finalUrl = await client.evaluate('window.location.href');
    console.log(`Article ${article.id} saved! Final URL: ${finalUrl}`);
    await client.screenshot(path.join(__dirname, `test_article_${article.id}_saved.png`));
}

async function main() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');
    await fillCurrentEditor(client, article3);
    await client.close();
}

main().catch(console.error);
