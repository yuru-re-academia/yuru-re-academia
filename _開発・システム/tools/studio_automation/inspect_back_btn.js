const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        const btns = await client.evaluate(`(() => {
            const all = Array.from(document.querySelectorAll('*')).filter(el => {
                const t = el.innerText ? el.innerText.trim() : '';
                return t.includes('戻る');
            });
            return all.map(el => ({
                tag: el.tagName,
                class: el.className,
                text: el.innerText,
                rect: {
                    x: el.getBoundingClientRect().left,
                    y: el.getBoundingClientRect().top,
                    w: el.getBoundingClientRect().width,
                    h: el.getBoundingClientRect().height
                }
            }));
        })()`);
        console.log(JSON.stringify(btns, null, 2));
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
