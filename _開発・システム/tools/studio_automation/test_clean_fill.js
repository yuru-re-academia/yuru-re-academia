const CDPClient = require('./cdp_client');
const path = require('path');

const art1 = {
    date: '2024.04.24',
    title: '【2024.04.24】北栄町立北条中学校「中庭プロジェクト」にて座談会に登壇しました',
    bodyParagraphs: [
        '鳥取県東伯郡北栄町の北条中学校にて開催された「中庭プロジェクト」において、座談会に登壇いたしました。',
        '当日は生徒の皆様や地域の方々に向けて、シニアの健康寿命延伸や多世代交流の重要性についてお話しし、世代を超えて地域の健康や生きがいについて考える機会となりました。',
        'シニア層だけでなく次世代とともに進める地域共生社会づくりの実践として、ぜひご確認ください。',
        '【関連リンク・参考情報】',
        '・北栄町立北条中学校（鳥取県東伯郡北栄町土下100-1）',
        '・北栄町 公式ホームページ：https://www.e-hokuei.net/'
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
        if (!titlePos) throw new Error('Title element not found');
        await clickAt(client, titlePos.x, titlePos.y);
        await new Promise(r => setTimeout(r, 300));
        
        console.log('Typing Title...');
        await client.send('Input.insertText', { text: art1.title });
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
        if (!bodyPos) throw new Error('Body element not found');
        await clickAt(client, bodyPos.x, bodyPos.y);
        await new Promise(r => setTimeout(r, 300));

        console.log('Typing Body paragraphs...');
        for (let i = 0; i < art1.bodyParagraphs.length; i++) {
            await client.send('Input.insertText', { text: art1.bodyParagraphs[i] });
            await new Promise(r => setTimeout(r, 150));
            if (i < art1.bodyParagraphs.length - 1) {
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

        const screenshotPath = path.join(__dirname, 'clean_fill_art1_result.png');
        await client.screenshot(screenshotPath);
        console.log('Screenshot saved to:', screenshotPath);

        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
