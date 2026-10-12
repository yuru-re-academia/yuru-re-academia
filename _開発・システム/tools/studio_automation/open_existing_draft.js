const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Finding row with zH1tT1kd...');
        const clickResult = await client.evaluate(`(() => {
            // "zH1tT1kd" を含む要素を探す
            const all = Array.from(document.querySelectorAll('*'));
            const slugEl = all.find(el => el.innerText && el.innerText.trim() === 'zH1tT1kd' || el.innerText && el.innerText.trim() === '/ zH1tT1kd');
            if (!slugEl) return { error: 'slugEl not found' };

            // その親の行要素を探す（td, tr, またはテーブル行コンテナ）
            let row = slugEl;
            while (row && row.tagName !== 'TR' && !row.getAttribute('role')?.includes('row') && !row.className.includes('table-row') && row !== document.body) {
                // タイトルセルか行要素を探す
                if (row.parentElement && row.parentElement.querySelectorAll('div').length > 5 && row.parentElement.innerText.includes('松二ィ')) {
                    row = row.parentElement;
                    break;
                }
                row = row.parentElement;
            }

            // タイトルのテキスト要素をクリック
            const titleEl = all.find(el => el.innerText && el.innerText.includes('【取材レポート】総フォロワー15万人'));
            if (titleEl) {
                const rect = titleEl.getBoundingClientRect();
                return {
                    found: true,
                    titleText: titleEl.innerText,
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            }
            return { error: 'titleEl not found' };
        })()`);

        console.log('Click result:', clickResult);

        if (clickResult.found) {
            console.log(`Clicking title at (${clickResult.x}, ${clickResult.y})...`);
            await client.send('Input.dispatchMouseEvent', {
                type: 'mousePressed',
                x: clickResult.x,
                y: clickResult.y,
                button: 'left',
                clickCount: 2
            });
            await client.send('Input.dispatchMouseEvent', {
                type: 'mouseReleased',
                x: clickResult.x,
                y: clickResult.y,
                button: 'left',
                clickCount: 2
            });

            await new Promise(r => setTimeout(r, 4000));
            console.log('Current URL after click:', await client.evaluate('window.location.href'));

            const screenshotPath = path.join(__dirname, 'after_click_row.png');
            await client.screenshot(screenshotPath);
            console.log('Saved screenshot to:', screenshotPath);
        }

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
