const CDPClient = require('./cdp_client');

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        console.log('Navigating to CMS list...');
        await client.navigate('https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf');
        await new Promise(r => setTimeout(r, 4500));

        // 行構造を詳しく調査
        const rowsDetail = await client.evaluate(`(() => {
            const trs = Array.from(document.querySelectorAll('tr'));
            if (trs.length > 0) {
                return trs.map((tr, idx) => ({
                    idx,
                    text: tr.innerText.replace(/\\n/g, ' ').substring(0, 80),
                    cells: Array.from(tr.querySelectorAll('td, th')).map(td => ({
                        tag: td.tagName,
                        className: td.className,
                        text: td.innerText.replace(/\\n/g, ' ').substring(0, 30)
                    }))
                }));
            }
            // trがない場合、divによるテーブル構造を探す
            const tableDivs = Array.from(document.querySelectorAll('div[class*="table"], div[class*="grid"], div[class*="row"]'));
            return {
                message: 'No tr found, checking div table structure',
                count: tableDivs.length,
                classes: tableDivs.slice(0, 10).map(d => d.className)
            };
        })()`);

        console.log('Rows detail:', JSON.stringify(rowsDetail, null, 2));

        await client.close();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
