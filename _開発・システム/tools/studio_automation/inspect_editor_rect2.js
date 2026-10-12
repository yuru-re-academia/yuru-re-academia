const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        const res = await client.evaluate(`(() => {
            function getR(el) {
                if (!el) return null;
                const r = el.getBoundingClientRect();
                return { top: r.top, left: r.left, width: r.width, height: r.height };
            }
            const titleEl = document.querySelector('.title-div.main-title');
            const proseEl = document.querySelector('.ProseMirror.in-cms');
            return {
                titleRect: getR(titleEl),
                proseRect: getR(proseEl)
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
