const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        const ancestors = await client.evaluate(`(() => {
            const all = Array.from(document.querySelectorAll('*'));
            const slugEl = all.find(el => el.children.length === 0 && el.innerText && el.innerText.trim() === 'zH1tT1kd');
            if (!slugEl) return { error: 'not found' };
            
            const list = [];
            let curr = slugEl;
            for (let i = 0; i < 12; i++) {
                if (!curr) break;
                list.push({
                    level: i,
                    tag: curr.tagName,
                    className: curr.className,
                    id: curr.id,
                    dataAttributes: Object.assign({}, curr.dataset),
                    childrenCount: curr.children.length
                });
                curr = curr.parentElement;
            }
            return list;
        })()`);

        console.log('Ancestors of slugEl:', JSON.stringify(ancestors, null, 2));
        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
