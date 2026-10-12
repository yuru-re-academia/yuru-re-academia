const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');

    // Click 新規追加 if on list page
    const btnPos = await client.evaluate(`(() => {
        const btns = Array.from(document.querySelectorAll('button, div, span')).filter(b => b.innerText && b.innerText.trim() === '新規追加' && b.offsetHeight > 0);
        if (btns.length > 0) {
            const r = btns[0].getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return null;
    })()`);
    console.log('btnPos:', btnPos);
    if (btnPos) {
        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: btnPos.x, y: btnPos.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: btnPos.x, y: btnPos.y, button: 'left', clickCount: 1 });
    }

    await new Promise(r => setTimeout(r, 3000));
    console.log('Current URL:', await client.evaluate('window.location.href'));
    const domInfo = await client.evaluate(`(() => {
        return {
            hasTitle: !!document.querySelector('.title-div.main-title'),
            hasProse: !!document.querySelector('.ProseMirror.in-cms'),
            buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)
        };
    })()`);
    console.log('DOM info:', JSON.stringify(domInfo, null, 2));
    await client.screenshot(path.join(__dirname, 'editor_opened_inspect.png'));
    await client.close();
}

main().catch(console.error);
