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
        
        console.log('1. Clearing & Setting Title...');
        await clickAt(client, 200, 160);
        await new Promise(r => setTimeout(r, 200));
        
        await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                el.focus();
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        })()`);
        await new Promise(r => setTimeout(r, 200));
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

        console.log('2. Clearing & Setting Body...');
        await clickAt(client, 200, 320);
        await new Promise(r => setTimeout(r, 200));
        
        await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (el) {
                el.focus();
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        })()`);
        await new Promise(r => setTimeout(r, 200));
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

        console.log('3. Waiting 7s for auto-save...');
        await new Promise(r => setTimeout(r, 7000));

        const editorScreenshot = path.join(__dirname, 'fixed_art1_editor.png');
        await client.screenshot(editorScreenshot);
        console.log(`Editor screenshot saved to: ${editorScreenshot}`);

        console.log('4. Clicking 戻る at (35, 87)...');
        await clickAt(client, 35, 87);
        await new Promise(r => setTimeout(r, 3000));

        const listScreenshot = path.join(__dirname, 'fixed_art1_list.png');
        await client.screenshot(listScreenshot);
        console.log(`List screenshot saved to: ${listScreenshot}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
