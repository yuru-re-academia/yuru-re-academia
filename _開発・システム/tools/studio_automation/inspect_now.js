const CDPClient = require('./cdp_client');
async function run() {
    const client = new CDPClient(9222);
    await client.connect('studio.design');
    const url = await client.evaluate('window.location.href');
    console.log('Current URL:', url);
    const hasTitle = await client.evaluate("!!document.querySelector('.title-div.main-title')");
    const hasProse = await client.evaluate("!!document.querySelector('.ProseMirror.in-cms')");
    const hasSkeleton = await client.evaluate("!!document.querySelector('[class*=\"skeleton\"]')");
    const buttons = await client.evaluate("Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)");
    console.log('hasTitle:', hasTitle, 'hasProse:', hasProse, 'hasSkeleton:', hasSkeleton);
    console.log('Buttons:', buttons);
    await client.screenshot('inspect_now.png');
    await client.close();
}
run();
