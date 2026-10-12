const CDPClient = require('./cdp_client');
const path = require('path');

const art4 = {
    num: 4,
    date: '2024.09.10',
    title: '【2024.09.10】中海テレビ放送「フューチャースクエア」にてインタビュー記事が掲載されました',
    bodyParagraphs: [
        '中海・宍道湖・大山圏域の情報発信拠点である中海テレビ放送「フューチャースクエア」にて取材を受け、インタビュー記事が掲載されました。',
        '地域カルチャー講座の講師としての活動や、米子市をはじめとする圏域シニアの健康・生きがいづくりにかける想い、誰もが気軽に参加できる場づくりの重要性についてお話しさせていただきました。',
        '地域に根ざしたシニア向け文化活動・健康づくりの実践として、ぜひご覧ください。',
        '【関連リンク・参考情報】',
        '・株式会社中海テレビ放送 公式ホームページ：https://www.chukai.co.jp/',
        '・中海・宍道湖・大山圏域市長会 公式ホームページ：https://na-s-da.net/'
    ]
};

async function clickAt(client, x, y) {
    await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function run() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');

    console.log('1. Clicking 新規追加 button...');
    let clicked = false;
    for (let i = 0; i < 10; i++) {
        clicked = await client.evaluate(`(() => {
            const btns = Array.from(document.querySelectorAll('button, div, a'));
            const addBtn = btns.find(b => b.innerText && (b.innerText.includes('新規追加') || b.innerText.includes('New item')));
            if (addBtn) {
                addBtn.click();
                return true;
            }
            return false;
        })()`);
        if (clicked) break;
        await new Promise(r => setTimeout(r, 500));
    }
    console.log('新規追加 clicked:', clicked);

    console.log('2. Waiting for editor elements to load...');
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

    // 3. Focus & Type Title
    console.log('3. Focusing Title...');
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
    await client.send('Input.insertText', { text: art4.title });
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
    console.log('4. Focusing Body...');
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
    for (let i = 0; i < art4.bodyParagraphs.length; i++) {
        await client.send('Input.insertText', { text: art4.bodyParagraphs[i] });
        await new Promise(r => setTimeout(r, 150));
        if (i < art4.bodyParagraphs.length - 1) {
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await new Promise(r => setTimeout(r, 200));
        }
    }
    await new Promise(r => setTimeout(r, 500));

    // 5. Select Category (ゆるダン)
    console.log('5. Selecting Category (ゆるダン)...');
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
    console.log('6. Waiting 7s for auto-save (下書き保存)...');
    await new Promise(r => setTimeout(r, 7000));

    const screenshotPath = path.join(__dirname, 'art4_saved.png');
    await client.screenshot(screenshotPath);
    console.log(`Saved screenshot: ${screenshotPath}`);

    // 7. Click 戻る & wait for list view
    console.log('7. Clicking 戻る...');
    await client.evaluate(`(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('戻る'));
        if (btn) btn.click();
    })()`);

    console.log('Waiting for list view to return...');
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const backOnList = await client.evaluate(`(() => {
            const noEditor = !document.querySelector('.title-div.main-title');
            const hasAddBtn = !!Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
            return noEditor && hasAddBtn;
        })()`);
        if (backOnList) {
            console.log(`Back on list view in ${(i + 1) * 500}ms!`);
            await new Promise(r => setTimeout(r, 1000));
            break;
        }
    }

    const listScreenshotPath = path.join(__dirname, 'list_after_art4.png');
    await client.screenshot(listScreenshotPath);
    console.log(`Saved list screenshot: ${listScreenshotPath}`);

    await client.close();
}

run().catch(console.error);
