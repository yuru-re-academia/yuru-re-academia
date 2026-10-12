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

async function clickElementCenter(client, selector) {
    const rect = await client.evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return null;
    })()`);
    if (rect) {
        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
        return true;
    }
    return false;
}

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        
        console.log('1. Title input...');
        await clickElementCenter(client, '.title-div.main-title');
        await new Promise(r => setTimeout(r, 300));
        await client.evaluate(`document.execCommand('selectAll', false, null)`);
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await new Promise(r => setTimeout(r, 200));
        await client.send('Input.insertText', { text: art1.title });
        await new Promise(r => setTimeout(r, 300));
        await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        })()`);
        await new Promise(r => setTimeout(r, 500));

        console.log('2. Body input...');
        await clickElementCenter(client, '.ProseMirror.in-cms');
        await new Promise(r => setTimeout(r, 300));
        await client.evaluate(`document.execCommand('selectAll', false, null)`);
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await new Promise(r => setTimeout(r, 200));

        for (let p = 0; p < art1.bodyParagraphs.length; p++) {
            await client.send('Input.insertText', { text: art1.bodyParagraphs[p] });
            await new Promise(r => setTimeout(r, 150));
            if (p < art1.bodyParagraphs.length - 1) {
                await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await new Promise(r => setTimeout(r, 200));
            }
        }
        await new Promise(r => setTimeout(r, 500));

        console.log('3. Category select...');
        const catFieldRect = await client.evaluate(`(() => {
            const el = document.querySelector('.o-post-editor-right-item-reference-field');
            if (el) {
                const r = el.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            }
            return null;
        })()`);
        if (catFieldRect) {
            await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: catFieldRect.x, y: catFieldRect.y, button: 'left', clickCount: 1 });
            await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: catFieldRect.x, y: catFieldRect.y, button: 'left', clickCount: 1 });
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
            console.log('Category "ゆるダン" option clicked:', catClicked);
            await new Promise(r => setTimeout(r, 400));

            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await new Promise(r => setTimeout(r, 400));
        }

        console.log('4. Waiting 7s for auto-save (下書き保存)...');
        await new Promise(r => setTimeout(r, 7000));

        const screenshotPath = path.join(__dirname, 'art1_filled_editor.png');
        await client.screenshot(screenshotPath);
        console.log(`Saved screenshot to: ${screenshotPath}`);

        console.log('5. Clicking 戻る...');
        const backRect = await client.evaluate(`(() => {
            const backBtn = Array.from(document.querySelectorAll('button, div, span, a')).find(b => b.innerText && b.innerText.trim() === '戻る');
            if (backBtn) {
                const r = backBtn.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            }
            return null;
        })()`);

        if (backRect) {
            await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: backRect.x, y: backRect.y, button: 'left', clickCount: 1 });
            await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: backRect.x, y: backRect.y, button: 'left', clickCount: 1 });
        }
        await new Promise(r => setTimeout(r, 3000));

        const listScreenshot = path.join(__dirname, 'after_art1_list.png');
        await client.screenshot(listScreenshot);
        console.log(`List screenshot saved to: ${listScreenshot}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
