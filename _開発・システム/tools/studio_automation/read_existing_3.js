const CDPClient = require('./cdp_client');

async function checkRow(slug) {
    const client = new CDPClient(9222);
    await client.connect('studio.design');
    
    // Click row with slug
    console.log(`Looking for row with slug: ${slug}...`);
    const clicked = await client.evaluate(`(() => {
        const rows = Array.from(document.querySelectorAll('.o-model-content-list-item'));
        const r = rows.find(row => row.innerText && row.innerText.includes('${slug}'));
        if (r) {
            const clickable = r.querySelector('[data-field-name="title"], .ellipsis, div') || r;
            clickable.click();
            return true;
        }
        return false;
    })()`);
    
    if (!clicked) {
        console.log(`Row ${slug} not found`);
        await client.close();
        return;
    }
    
    // Wait for editor
    for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 400));
        const ready = await client.evaluate(`!!document.querySelector('.title-div.main-title')`);
        if (ready) break;
    }
    
    const data = await client.evaluate(`(() => {
        const titleEl = document.querySelector('.title-div.main-title');
        const bodyEl = document.querySelector('.ProseMirror.in-cms');
        const statusEl = document.querySelector('.o-post-editor-top-bar, .status');
        return {
            title: titleEl ? titleEl.innerText : null,
            body: bodyEl ? bodyEl.innerText : null,
            topBar: statusEl ? statusEl.innerText.replace(/\\n+/g, ' ') : null
        };
    })()`);
    
    console.log(`[${slug}] data:`, JSON.stringify(data, null, 2));
    
    // Click 戻る
    await client.evaluate(`(() => {
        const backBtn = Array.from(document.querySelectorAll('button, div, span, a')).find(b => b.innerText && b.innerText.trim() === '戻る');
        if (backBtn) backBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 2000));
    await client.close();
}

async function main() {
    await checkRow('5sK5bOQS');
    await checkRow('Sd7i744o');
    await checkRow('k8G0erJK');
}

main();
