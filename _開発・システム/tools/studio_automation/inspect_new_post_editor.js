const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        console.log('Clicking "＋ 新規追加" button...');
        const clickedNew = await client.evaluate(`(() => {
            const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.includes('新規追加'));
            if (btns.length > 0) {
                btns[0].click();
                return true;
            }
            return false;
        })()`);

        console.log('Clicked "新規追加":', clickedNew);
        await new Promise(r => setTimeout(r, 4000));

        // 編集エディタ画面のフィールド・要素を調査
        const editorInfo = await client.evaluate(`({
            url: window.location.href,
            inputs: Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]')).map(el => ({
                tag: el.tagName,
                type: el.type,
                placeholder: el.placeholder,
                name: el.name,
                contentEditable: el.contentEditable,
                className: el.className
            })),
            buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean),
            labels: Array.from(document.querySelectorAll('label, [class*="label"], [class*="title"]')).map(l => l.innerText.trim()).filter(Boolean).slice(0, 30)
        })`);

        console.log('Editor Info:', JSON.stringify(editorInfo, null, 2));

        const screenshotPath = path.join(__dirname, 'news_editor.png');
        await client.screenshot(screenshotPath);
        console.log(`Screenshot saved to: ${screenshotPath}`);

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
