const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect();
        console.log('Navigating to projects page...');
        await client.navigate('https://app.studio.design/projects');
        await new Promise(r => setTimeout(r, 2000));

        // Let us inspect the left navigation DOM specifically
        const navElements = await client.evaluate(`(() => {
            const nav = document.querySelector('nav');
            if (!nav) return 'No nav found';
            return Array.from(nav.querySelectorAll('*')).map(el => ({
                tag: el.tagName,
                className: el.className,
                text: el.innerText?.trim(),
                href: el.href || null
            })).filter(x => x.text);
        })()`);
        console.log('Nav elements:', JSON.stringify(navElements, null, 2));

        // Also inspect any workspace links/buttons anywhere in document
        const wsElements = await client.evaluate(`(() => {
            return Array.from(document.querySelectorAll('a, button, [role="button"]')).map(el => ({
                tag: el.tagName,
                text: el.innerText?.trim(),
                href: el.href || null,
                classes: el.className
            })).filter(x => x.text && (x.text.includes('ワークスペース') || x.text.includes('ユル') || x.text.includes('First')));
        })()`);
        console.log('Workspace elements:', JSON.stringify(wsElements, null, 2));

        await client.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
