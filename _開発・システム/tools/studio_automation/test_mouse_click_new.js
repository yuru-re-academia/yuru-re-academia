const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');

    console.log('Current URL before click:', await client.evaluate('window.location.href'));

    const rect = await client.evaluate(`(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
        if (btn) {
            const r = btn.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return null;
    })()`);

    console.log('Button rect center:', rect);
    if (rect) {
        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
    }

    console.log('Waiting 3s for editor to open...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('Current URL after click:', await client.evaluate('window.location.href'));
    await client.screenshot(path.join(__dirname, 'test_new_btn_click_result.png'));

    const hasTitle = await client.evaluate(`!!document.querySelector('.title-div.main-title')`);
    console.log('Has title element:', hasTitle);

    await client.close();
}

main().catch(console.error);
