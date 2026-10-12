const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');

    const testTitle = '【2024.07.11】日本海新聞にて「ゆるダン®」の取り組みが掲載されました';

    // Click on title div, select all, backspace, type
    console.log('Focusing title...');
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.focus();
            document.execCommand('selectAll', false, null);
        }
    })()`);
    await new Promise(r => setTimeout(r, 200));

    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await new Promise(r => setTimeout(r, 300));

    await client.send('Input.insertText', { text: testTitle });
    await new Promise(r => setTimeout(r, 500));

    // Dispatch input & change events just in case
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    })()`);

    await new Promise(r => setTimeout(r, 1000));

    const check = await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        const header = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('【2024.07.11】'));
        return {
            elText: el ? el.innerText : null,
            foundInHeader: !!header
        };
    })()`);
    console.log('Check result:', check);

    await client.close();
}

main().catch(console.error);
