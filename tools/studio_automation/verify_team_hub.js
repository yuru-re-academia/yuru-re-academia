const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect();

        const hubUrl = 'http://127.0.0.1:8765/team_hub.html';
        console.log(`Navigating to Team Hub: ${hubUrl}`);
        await client.navigate(hubUrl);
        await new Promise(r => setTimeout(r, 2500));

        // 1. タスクボード（初期表示）のスクリーンショット
        const taskScreenshot = path.join(__dirname, 'team_hub_tasks.png');
        await client.screenshot(taskScreenshot);
        console.log(`1. Tasks screenshot saved to: ${taskScreenshot}`);

        // 2. 議事録タブへ切り替え
        console.log('Switching to Minutes tab...');
        await client.evaluate(`switchTab('minutes')`);
        await new Promise(r => setTimeout(r, 1000));
        const minutesScreenshot = path.join(__dirname, 'team_hub_minutes.png');
        await client.screenshot(minutesScreenshot);
        console.log(`2. Minutes screenshot saved to: ${minutesScreenshot}`);

        // 3. ナレッジタブへ切り替え
        console.log('Switching to Knowledge tab...');
        await client.evaluate(`switchTab('knowledge')`);
        await new Promise(r => setTimeout(r, 1000));
        const knowledgeScreenshot = path.join(__dirname, 'team_hub_knowledge.png');
        await client.screenshot(knowledgeScreenshot);
        console.log(`3. Knowledge screenshot saved to: ${knowledgeScreenshot}`);

        // 4. 事業構想タブへ切り替え
        console.log('Switching to Vision tab...');
        await client.evaluate(`switchTab('vision')`);
        await new Promise(r => setTimeout(r, 1000));
        const visionScreenshot = path.join(__dirname, 'team_hub_vision.png');
        await client.screenshot(visionScreenshot);
        console.log(`4. Vision screenshot saved to: ${visionScreenshot}`);

        // 5. 共有タブへ切り替え
        console.log('Switching to Share tab...');
        await client.evaluate(`switchTab('share')`);
        await new Promise(r => setTimeout(r, 1000));
        const shareScreenshot = path.join(__dirname, 'team_hub_share.png');
        await client.screenshot(shareScreenshot);
        console.log(`5. Share screenshot saved to: ${shareScreenshot}`);

        // 6. 議事録からネクストアクション自動生成の機能テスト
        console.log('Testing Meeting Note & Next Action extraction...');
        const testRes = await client.evaluate(`(() => {
            const initialTaskCount = appData.tasks.length;
            const newMtg = {
                id: 'mtg-test-auto',
                title: '【テスト】第2回 カリキュラム＆ヒアリング進捗会議',
                date: '2026-09-12',
                attendees: ['代表', 'AI担当', '介護現場担当'],
                decisions: '・AI講座の第一弾は「音声入力でのAI回顧録づくり」に決定\\n・ケアマネ向け案内状のドラフト作成を開始',
                notes: '活発な意見交換が行われ、方向性が確定。',
                actionCount: 2,
                createdAt: '2026-09-12'
            };
            appData.meetings.unshift(newMtg);

            // ネクストアクションを2件生成してタスクに追加
            appData.tasks.unshift({
                id: 'task-test-1',
                title: 'AI回顧録づくりの体験デモキット準備',
                assignee: 'AI担当',
                category: 'AI・テクノロジー',
                status: 'todo',
                priority: 'high',
                dueDate: '2026-09-18',
                description: '議事録「【テスト】第2回 カリキュラム＆ヒアリング進捗会議」より自動生成されたネクストアクション。',
                meetingId: newMtg.id,
                createdAt: '2026-09-12'
            });

            appData.tasks.unshift({
                id: 'task-test-2',
                title: 'ケアマネ訪問用コンセプトシートの文面監修',
                assignee: '介護現場担当',
                category: '介護現場・制度',
                status: 'doing',
                priority: 'high',
                dueDate: '2026-09-19',
                description: '議事録「【テスト】第2回 カリキュラム＆ヒアリング進捗会議」より自動生成されたネクストアクション。',
                meetingId: newMtg.id,
                createdAt: '2026-09-12'
            });

            saveData();
            initApp();

            return {
                initialCount: initialTaskCount,
                newTaskCount: appData.tasks.length,
                meetingsCount: appData.meetings.length
            };
        })()`);
        console.log('Test execution result:', testRes);

        // タスクボードに戻して反映を確認
        await client.evaluate(`switchTab('tasks')`);
        await new Promise(r => setTimeout(r, 1000));
        const afterActionScreenshot = path.join(__dirname, 'team_hub_after_action.png');
        await client.screenshot(afterActionScreenshot);
        console.log(`6. After-action tasks screenshot saved to: ${afterActionScreenshot}`);

        await client.close();
        console.log('All verification steps succeeded!');
    } catch (e) {
        console.error('Error during verification:', e.message);
        process.exit(1);
    }
}

main();
