const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect();

        const fileUrl = 'file:///Users/keita/Desktop/antigravity/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/%E3%82%A2%E3%82%AB%E3%83%87%E3%83%9F%E3%82%A2/team_hub.html';
        console.log(`Navigating to file URL: ${fileUrl}`);
        await client.navigate(fileUrl);
        await new Promise(r => setTimeout(r, 3000));

        const title = await client.evaluate('document.title');
        console.log('Loaded Document Title:', title);

        // 1. タスク一覧のキャプチャ
        const p1 = path.join(__dirname, 'team_hub_tasks.png');
        await client.screenshot(p1);
        console.log('Saved Tasks screenshot:', p1);

        // 2. 議事録タブ
        await client.evaluate(`switchTab('minutes')`);
        await new Promise(r => setTimeout(r, 1000));
        const p2 = path.join(__dirname, 'team_hub_minutes.png');
        await client.screenshot(p2);
        console.log('Saved Minutes screenshot:', p2);

        // 3. ナレッジタブ
        await client.evaluate(`switchTab('knowledge')`);
        await new Promise(r => setTimeout(r, 1000));
        const p3 = path.join(__dirname, 'team_hub_knowledge.png');
        await client.screenshot(p3);
        console.log('Saved Knowledge screenshot:', p3);

        // 4. 事業構想タブ
        await client.evaluate(`switchTab('vision')`);
        await new Promise(r => setTimeout(r, 1000));
        const p4 = path.join(__dirname, 'team_hub_vision.png');
        await client.screenshot(p4);
        console.log('Saved Vision screenshot:', p4);

        // 5. 共有タブ
        await client.evaluate(`switchTab('share')`);
        await new Promise(r => setTimeout(r, 1000));
        const p5 = path.join(__dirname, 'team_hub_share.png');
        await client.screenshot(p5);
        console.log('Saved Share screenshot:', p5);

        // 6. タスクボードに戻す
        await client.evaluate(`switchTab('tasks')`);
        await new Promise(r => setTimeout(r, 1000));

        await client.close();
        console.log('All screenshots captured successfully!');
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
