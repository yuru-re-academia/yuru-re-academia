const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        
        const testTitle = '【2024.04.24】北栄町立北条中学校「中庭プロジェクト」にて座談会に登壇しました';
        
        const res = await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                el.focus();
                el.innerText = ${JSON.stringify(testTitle)};
                el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ${JSON.stringify(testTitle)} }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                return el.innerText;
            }
            return null;
        })()`);
        console.log('Title after evaluate:', res);
        
        await new Promise(r => setTimeout(r, 4000));
        await client.screenshot(path.join(__dirname, 'test_direct_title.png'));
        
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
