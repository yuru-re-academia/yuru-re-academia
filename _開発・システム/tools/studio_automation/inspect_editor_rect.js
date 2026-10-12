const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        const res = await client.evaluate(`(() => {
            const titleEl = document.querySelector('.title-div.main-title');
            const proseEl = document.querySelector('.ProseMirror.in-cms');
            const editorContainer = document.querySelector('[class*="editor"], [class*="post-editor"]');
            return {
                titleRect: titleEl ? titleEl.getBoundingClientRect() : null,
                proseRect: proseEl ? proseEl.getBoundingClientRect() : null,
                editorContainerClass: editorContainer ? editorContainer.className : null,
                editorContainerRect: editorContainer ? editorContainer.getBoundingClientRect() : null,
                editorStyle: editorContainer ? window.getComputedStyle(editorContainer).transform : null
            };
        })()`);
        console.log(JSON.stringify(res, null, 2));
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
