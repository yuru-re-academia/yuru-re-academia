const CDPClient = require('./cdp_client');
const path = require('path');

const article1 = {
    date: '2024.04.24',
    title: '【2024.04.24】北栄町立北条中学校「中庭プロジェクト」にて座談会に登壇しました',
    bodyParagraphs: [
        '鳥取県東伯郡北栄町の北条中学校にて開催された「中庭プロジェクト」において、座談会に登壇いたしました。',
        '当日は生徒の皆様や地域の方々に向けて、シニアの健康寿命延伸や多世代交流の重要性についてお話しし、世代を超えて地域の健康や生きがいについて考える機会となりました。',
        'シニア層だけでなく次世代とともに進める地域共生社会づくりの実践として、ぜひチェックしてみてください。',
        '【関連リンク・参考情報】',
        '・北栄町立北条中学校（鳥取県東伯郡北栄町土下100-1）',
        '・北栄町 公式ホームページ：https://www.e-hokuei.net/'
    ]
};

async function safeEvaluate(client, expr) {
    try {
        return await client.evaluate(expr);
    } catch (e) {
        return null;
    }
}

async function setArticleContent(client, article) {
    console.log('Setting title:', article.title);
    // Focus title
    await safeEvaluate(client, `(() => {
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
    await client.send('Input.insertText', { text: article.title });
    await new Promise(r => setTimeout(r, 800));

    // Focus body
    console.log('Setting body paragraphs...');
    await safeEvaluate(client, `(() => {
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

    for (let i = 0; i < article.bodyParagraphs.length; i++) {
        await client.send('Input.insertText', { text: article.bodyParagraphs[i] });
        await new Promise(r => setTimeout(r, 200));
        if (i < article.bodyParagraphs.length - 1) {
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await new Promise(r => setTimeout(r, 250));
        }
    }

    // Set category to ゆるダン
    console.log('Setting Category...');
    try {
        const catPos = await safeEvaluate(client, `(() => {
            const rows = Array.from(document.querySelectorAll('.o-post-editor-right-item'));
            const catRow = rows.find(r => r.innerText && r.innerText.includes('カテゴリ'));
            if (catRow) {
                const r = catRow.getBoundingClientRect();
                return { x: r.right - 40, y: r.top + r.height / 2 };
            }
            return null;
        })()`);

        if (catPos) {
            console.log('Clicking category dropdown at:', catPos);
            await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: catPos.x, y: catPos.y, button: 'left', clickCount: 1 });
            await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: catPos.x, y: catPos.y, button: 'left', clickCount: 1 });
            await new Promise(r => setTimeout(r, 1200));

            const clicked = await safeEvaluate(client, `(() => {
                const allEls = Array.from(document.querySelectorAll('*'));
                const opt = allEls.find(el => el.innerText && el.innerText.trim() === 'ゆるダン' && el.offsetHeight > 0 && el.offsetHeight < 50);
                if (opt) {
                    opt.click();
                    return true;
                }
                return false;
            })()`);
            console.log('Selected ゆるダン:', clicked);
            await new Promise(r => setTimeout(r, 800));
        }
    } catch (e) {
        console.error('Error setting category:', e);
    }

    // Wait 7s for auto-save
    console.log('Waiting 7s for auto-save...');
    await new Promise(r => setTimeout(r, 7000));
}

async function main() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');
    await setArticleContent(client, article1);
    await client.screenshot(path.join(__dirname, 'article1_result.png'));
    await client.close();
}

main().catch(console.error);
