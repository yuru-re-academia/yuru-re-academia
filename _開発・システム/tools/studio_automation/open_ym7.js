const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        
        const pos = await client.evaluate(`(() => {
            const rows = Array.from(document.querySelectorAll('.o-model-content-list-item'));
            const row = rows.find(r => r.innerText.includes('ym7QVhfX'));
            if (row) {
                const r = row.getBoundingClientRect();
                return { x: r.left + 300, y: r.top + r.height / 2 };
            }
            return null;
        })()`);
        console.log('Position of ym7QVhfX row:', pos);
        
        if (pos) {
            await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
            await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
        }
        
        await new Promise(r => setTimeout(r, 3000));
        await client.screenshot(path.join(__dirname, 'opened_ym7.png'));
        
        const editorInfo = await client.evaluate(`({
            hasEditor: !!document.querySelector('.title-div.main-title'),
            title: document.querySelector('.title-div.main-title')?.innerText,
            body: document.querySelector('.ProseMirror.in-cms')?.innerText
        })`);
        console.log('Editor info:', editorInfo);
        
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
