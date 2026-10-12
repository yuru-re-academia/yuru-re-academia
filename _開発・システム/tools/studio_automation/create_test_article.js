const CDPClient = require('./cdp_client');
const path = require('path');

const testArticle = {
    title: '【テスト投稿】ゆるダン®活動の様子：元気に楽しくレッスンを行っています',
    bodyParagraphs: [
        '日頃よりシニア向け健康ダンス「ゆるダン®」の活動を応援いただき、誠にありがとうございます。',
        '本記事はホームページの動作確認を兼ねたテスト投稿です。',
        '現在、米子市をはじめとする各地域のレッスン会場では、多くのシニアの皆様が笑顔で元気に身体を動かしていらっしゃいます。「音楽に合わせて無理なく楽しく続けられる」と大変好評をいただいており、日々のフレイル予防や健康寿命の延伸に向けて励まれています。',
        'これからも地域のシニアの皆様が楽しく健やかに過ごせる場をお届けできるよう、スタッフ一同力を合わせて頑張ってまいります。'
    ]
};

async function clickAt(client, x, y) {
    await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function run() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');

    console.log('1. Checking current view...');
    const inEditor = await client.evaluate(`(() => {
        const hasTitle = !!document.querySelector('.title-div.main-title');
        const hasProse = !!document.querySelector('.ProseMirror.in-cms');
        const hasSkeleton = !!document.querySelector('[class*="skeleton"]');
        return hasTitle && hasProse && !hasSkeleton;
    })()`);

    if (!inEditor) {
        console.log('Clicking 新規追加 button...');
        const clicked = await client.evaluate(`(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
            if (!btn) return false;
            btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            return true;
        })()`);
        if (!clicked) throw new Error('新規追加 button not found!');

        console.log('Waiting for editor elements to load...');
        let ready = false;
        for (let i = 0; i < 40; i++) {
            await new Promise(r => setTimeout(r, 500));
            ready = await client.evaluate(`(() => {
                const hasTitle = !!document.querySelector('.title-div.main-title');
                const hasProse = !!document.querySelector('.ProseMirror.in-cms');
                const hasSkeleton = !!document.querySelector('[class*="skeleton"]');
                return hasTitle && hasProse && !hasSkeleton;
            })()`);
            if (ready) {
                console.log(`Editor ready in ${(i + 1) * 500}ms`);
                await new Promise(r => setTimeout(r, 800));
                break;
            }
        }
        if (!ready) throw new Error('Editor failed to become ready');
    } else {
        console.log('Already in ready editor.');
    }

    // 2. Focus & Type Title
    console.log('2. Focusing Title...');
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
    await client.send('Input.insertText', { text: testArticle.title });
    await new Promise(r => setTimeout(r, 400));
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    })()`);
    await new Promise(r => setTimeout(r, 500));

    // 3. Focus & Type Body
    console.log('3. Focusing Body...');
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
    for (let i = 0; i < testArticle.bodyParagraphs.length; i++) {
        await client.send('Input.insertText', { text: testArticle.bodyParagraphs[i] });
        await new Promise(r => setTimeout(r, 150));
        if (i < testArticle.bodyParagraphs.length - 1) {
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await new Promise(r => setTimeout(r, 200));
        }
    }
    await new Promise(r => setTimeout(r, 500));

    // 4. Select Category (ゆるダン)
    console.log('4. Selecting Category (ゆるダン)...');
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

    // 5. Auto-save wait (7s)
    console.log('5. Waiting 7s for auto-save (下書き保存)...');
    await new Promise(r => setTimeout(r, 7000));

    const editorScreenshot = path.join(__dirname, 'test_draft_saved_editor.png');
    await client.screenshot(editorScreenshot);
    console.log(`Saved editor screenshot: ${editorScreenshot}`);

    // 6. Click 戻る
    console.log('6. Clicking 戻る...');
    await client.evaluate(`(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('戻る'));
        if (btn) btn.click();
    })()`);

    console.log('7. Waiting for list view to return...');
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const onList = await client.evaluate(`(() => {
            const noEditor = !document.querySelector('.title-div.main-title');
            const hasAddBtn = !!Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
            return noEditor && hasAddBtn;
        })()`);
        if (onList) {
            console.log(`Back on list view in ${(i + 1) * 500}ms!`);
            await new Promise(r => setTimeout(r, 1500));
            break;
        }
    }

    const listScreenshot = path.join(__dirname, 'test_draft_saved_list.png');
    await client.screenshot(listScreenshot);
    console.log(`Saved list screenshot: ${listScreenshot}`);

    await client.close();
}

run().catch(console.error);
