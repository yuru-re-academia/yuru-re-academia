const CDPClient = require('./cdp_client');
const path = require('path');

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const titleText = '【取材レポート】総フォロワー15万人の83歳エバンジェリスト「松二ィ」が地元企業の人生取材を受けました！＆ 9/16(水) DARAZ FMラジオ出演決定！';

        const paragraphs = [
            'いつもYURU-DAN（ゆるダン）およびYURU\'Qを応援いただき、ありがとうございます！',
            '本日9月7日、私たちの活動の象徴であり、エバンジェリスト的存在である「松二ィ」こと松本さん（83歳）が、地元企業様からのインタビュー取材を受けました。',
            '■ 83歳・総フォロワー15万人！新たな生きがいを発信する「松二ィ」とは？',
            '松二ィは、鳥取県米子市の高齢者住宅「シニアステージ西福原」にお住まいの83歳の男性です。私たちYURU\'Qと一緒にSNS運用をスタートして約1年半、今ではなんと総フォロワー数15万人を超える大人気インフルエンサーへと成長されました！',
            '「歳をとっても、新しい挑戦に遅すぎることはない」――SNSを通じて多くの若い世代や同世代とつながり、日々の発信そのものを新たな生きがいとして輝かせる姿は、まさに私たちが目指す「大人の生きがいと感動寿命の延伸」を体現するエバンジェリスト（伝道師）です。',
            '本日の取材では、そんな松二ィのこれまでの豊かな人生の歩みや、年齢を重ねても毎日をワクワク楽しむための人生観・価値観について、温かい雰囲気の中でお話しさせていただきました。',
            '■ 【次回告知】9月16日(水) 午前10:30頃〜 地元ラジオ「DARAZ FM」に出演決定！',
            'そして嬉しいお知らせがもう一つ！',
            '来週9月16日（水）午前10時30分頃より、米子市の地元ラジオ局「DARAZ FM（79.8MHz）」にて、松二ィがラジオ取材・生出演することが決定いたしました！',
            'ラジオの電波に乗せて、松二ィの元気な声とポジティブなパワーをお届けします。米子・山陰の皆様、ぜひ周波数を合わせてお聴きください！',
            'これからも松二ィとともに、地域と全国へ笑顔とワクワクを届けてまいります。応援よろしくお願いいたします！'
        ];

        console.log('Navigating to New Post Editor...');
        const newPostUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/new';
        await client.navigate(newPostUrl);
        await new Promise(r => setTimeout(r, 4500));

        console.log('Entering Title...');
        await client.evaluate(`(() => {
            const el = document.querySelector('.title-div.main-title');
            if (el) {
                el.focus();
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        })()`);
        await client.send('Input.insertText', { text: titleText });
        await new Promise(r => setTimeout(r, 1200));

        console.log('Entering Body paragraphs...');
        // ProseMirrorにフォーカス
        await client.evaluate(`(() => {
            const el = document.querySelector('.ProseMirror.in-cms');
            if (el) {
                el.focus();
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        })()`);

        // 各段落を順番に入力し、段落ごとにEnterキー（改行）を送信
        for (let i = 0; i < paragraphs.length; i++) {
            await client.send('Input.insertText', { text: paragraphs[i] });
            await new Promise(r => setTimeout(r, 200));
            // 改行（Enterキー）を送信して新しい段落を作成
            if (i < paragraphs.length - 1) {
                await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
                await new Promise(r => setTimeout(r, 300));
            }
        }

        console.log('Waiting 5 seconds for auto-save (下書き自動保存)...');
        await new Promise(r => setTimeout(r, 5000));

        const editorScreenshot = path.join(__dirname, 'matsunii_editor.png');
        await client.screenshot(editorScreenshot);
        console.log(`Editor screenshot saved to: ${editorScreenshot}`);

        // 一覧画面に戻る
        console.log('Navigating back to list...');
        const backBtnFound = await client.evaluate(`(() => {
            const back = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.trim() === '戻る');
            if (back) {
                back.click();
                return true;
            }
            return false;
        })()`);
        if (!backBtnFound) {
            await client.navigate('https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf');
        }
        await new Promise(r => setTimeout(r, 4000));

        const listScreenshot = path.join(__dirname, 'matsunii_list.png');
        await client.screenshot(listScreenshot);
        console.log(`List screenshot saved to: ${listScreenshot}`);

        await client.close();
        console.log('All operations finished successfully!');
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
