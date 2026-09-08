#!/usr/bin/env node
const CDPClient = require('./cdp_client');
const path = require('path');

// 引数解析
const args = process.argv.slice(2);
function getArg(name) {
    const idx = args.indexOf(`--${name}`);
    if (idx !== -1 && idx + 1 < args.length) {
        return args[idx + 1];
    }
    return null;
}
const isPublish = args.includes('--publish');
const title = getArg('title') || '【お知らせ】新着情報';
const body = getArg('body') || '本文を入力してください。';
const category = getArg('category') || 'ゆるダン';

async function main() {
    console.log('========================================');
    console.log('STUDIO News Post Automation');
    console.log(`Title:    ${title}`);
    console.log(`Category: ${category}`);
    console.log(`Publish:  ${isPublish ? 'YES (即時公開)' : 'NO (下書き保存)'}`);
    console.log('========================================');

    const client = new CDPClient(9222);
    try {
        console.log('[1/5] Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const newPostUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/new';
        console.log(`[2/5] Opening New Post Editor: ${newPostUrl}`);
        await client.navigate(newPostUrl);
        await new Promise(r => setTimeout(r, 4000));

        console.log('[3/5] Entering Title...');
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
        await client.send('Input.insertText', { text: title });
        await new Promise(r => setTimeout(r, 1000));

        console.log('[4/5] Entering Body Content...');
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
        await client.send('Input.insertText', { text: body });
        await new Promise(r => setTimeout(r, 2500));

        // スクリーンショット取得
        const editScreenshot = path.join(__dirname, 'latest_post_result.png');
        await client.screenshot(editScreenshot);
        console.log(`Screenshot saved: ${editScreenshot}`);

        if (isPublish) {
            console.log('[5/5] Publishing article...');
            const published = await client.evaluate(`(() => {
                const publishBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('公開'));
                if (publishBtn) {
                    publishBtn.click();
                    return true;
                }
                return false;
            })()`);
            console.log('Publish button clicked:', published);
            await new Promise(r => setTimeout(r, 3000));
        } else {
            console.log('[5/5] Saved as Draft (自動下書き保存完了)');
        }

        console.log('✅ Post automation completed successfully!');
        await client.close();
    } catch (e) {
        console.error('❌ Error during post automation:', e.message);
        process.exit(1);
    }
}

main();
