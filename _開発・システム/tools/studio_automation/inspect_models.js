const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');
        const models = await client.evaluate(`(() => {
            const links = Array.from(document.querySelectorAll('a, div, span, li')).filter(el => {
                const text = el.innerText ? el.innerText.trim() : '';
                return ['お知らせ', 'ニュース', 'CASES', '投稿者'].some(m => text.startsWith(m));
            });
            const sidebarLinks = Array.from(document.querySelectorAll('a[href*="/cms/"]')).map(a => ({
                text: a.innerText.trim(),
                href: a.href
            }));
            return {
                url: window.location.href,
                sidebarLinks
            };
        })()`);
        console.log(JSON.stringify(models, null, 2));
        await client.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
