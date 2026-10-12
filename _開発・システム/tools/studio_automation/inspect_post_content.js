const CDPClient = require('./cdp_client');

async function inspectPost(id) {
    const client = new CDPClient(9222);
    await client.connect('studio.design');
    console.log(`Opening item ${id}...`);
    await client.navigate(`https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/${id}`);
    await new Promise(r => setTimeout(r, 4000));
    
    const data = await client.evaluate(`(() => {
        const titleEl = document.querySelector('.title-div.main-title');
        const bodyEl = document.querySelector('.ProseMirror.in-cms');
        const statusEl = document.querySelector('.status, [class*="status"]');
        return {
            title: titleEl ? titleEl.innerText : null,
            body: bodyEl ? bodyEl.innerText : null,
            status: statusEl ? statusEl.innerText : null
        };
    })()`);
    console.log('Post data:', JSON.stringify(data, null, 2));
    await client.close();
}

inspectPost(process.argv[2] || 'dA7CAX6HxTsDYUwfsdeK');
