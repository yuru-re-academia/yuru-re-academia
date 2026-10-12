const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');

    console.log('Current URL before:', await client.evaluate('window.location.href'));

    // If currently at /new, navigate to list first
    await client.navigate('https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf');
    await new Promise(r => setTimeout(r, 4000));

    // Find and click 新規追加 button using DOM .click()
    const clicked = await client.evaluate(`(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    })()`);
    console.log('Button clicked:', clicked);

    // Wait for editor to appear
    let ready = false;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        ready = await client.evaluate(`(() => {
            const titleEl = document.querySelector('.title-div.main-title');
            return !!titleEl;
        })()`);
        if (ready) {
            console.log(`Editor ready after ${(i + 1) * 500}ms!`);
            break;
        }
    }

    console.log('Has title element:', ready);
    const hasProse = await client.evaluate(`!!document.querySelector('.ProseMirror.in-cms')`);
    console.log('Has ProseMirror element:', hasProse);

    await client.screenshot(path.join(__dirname, 'test_click_result.png'));
    await client.close();
}

main().catch(console.error);
