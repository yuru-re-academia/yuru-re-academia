const CDPClient = require('./cdp_client');
const path = require('path');

const articles = [
    // 2: 2024.07.10 NHK総合 いろ★ドリ
    {
        num: 2,
        date: '2024.07.10',
        title: '【2024.07.10】NHK総合「いろ★ドリ」生放送に出演しました',
        bodyParagraphs: [
            'NHK総合（鳥取放送局）の情報番組「いろ★ドリ」の生放送に出演いたしました。',
            '番組内では、シニア専門ダンススクール「ゆるダン®」の活動や、運動習慣の少ないシニア男性でも気軽に取り組める健康維持プログラムの特徴についてPRさせていただきました。',
            '鳥取県内をはじめ山陰地域における高齢者の健康習慣づくりの取り組みとして、ぜひご確認ください。',
            '【関連リンク・参考情報】',
            '・NHK鳥取放送局「いろ★ドリ」公式ホームページ：https://www.nhk.jp/p/irodori/',
            '・中海・宍道湖・大山圏域市長会 公式ホームページ：https://na-s-da.net/'
        ]
    },
    // 3: 2024.07.11 日本海新聞
    {
        num: 3,
        date: '2024.07.11',
        title: '【2024.07.11】日本海新聞にて「ゆるダン®」の取り組みが掲載されました',
        bodyParagraphs: [
            '山陰の地方紙である日本海新聞にて、シニア向け健康ダンス「ゆるダン®」の活動が紹介されました。',
            'NHKでの生放送出演を機に、地域高齢者の介護予防・フレイル予防や、外出機会の創出に向けた取り組みとして紙面に取り上げていただきました。シニア男性の参加促進も含め、地域コミュニティにおける運動習慣定着への意義が報じられています。',
            '山陰・鳥取地域における健康寿命延伸の先進事例として、ぜひご確認ください。',
            '【関連リンク・参考情報】',
            '・新日本海新聞社 公式ホームページ：https://www.nnn.co.jp/'
        ]
    },
    // 4: 2024.09.10 中海テレビ フューチャースクエア
    {
        num: 4,
        date: '2024.09.10',
        title: '【2024.09.10】中海テレビ放送「フューチャースクエア」にてインタビュー記事が掲載されました',
        bodyParagraphs: [
            '中海・宍道湖・大山圏域の情報発信拠点である中海テレビ放送「フューチャースクエア」にて取材を受け、インタビュー記事が掲載されました。',
            '地域カルチャー講座の講師としての活動や、米子市をはじめとする圏域シニアの健康・生きがいづくりにかける想い、誰もが気軽に参加できる場づくりの重要性についてお話しさせていただきました。',
            '地域に根ざしたシニア向け文化活動・健康づくりの実践として、ぜひご覧ください。',
            '【関連リンク・参考情報】',
            '・株式会社中海テレビ放送 公式ホームページ：https://www.chukai.co.jp/',
            '・中海・宍道湖・大山圏域市長会 公式ホームページ：https://na-s-da.net/'
        ]
    },
    // 5: 2024.09.19 NHK総合 精鋭
    {
        num: 5,
        date: '2024.09.19',
        title: '【2024.09.19】NHK総合「いろ★ドリ」の特集コーナー「精鋭」にて活動が紹介されました',
        bodyParagraphs: [
            'NHK総合（鳥取）のニュース情報番組「いろ★ドリ」の特集コーナー「精鋭」にて、「高齢者の元気をダンスで支えたい」をテーマに活動を取り上げていただきました。',
            '本コーナーは「真摯に誠実に生きる人、その道を極める人、言葉を伝える人、先駆者、挑戦者、きらりと光る鳥取県民の精鋭の姿を伝える」という趣旨で制作されており、シニアの孤立予防や健康寿命延伸に挑戦する姿勢を密着取材していただきました。あわせて新聞・Web等でも広く報道されております。',
            '鳥取県発のシニア支援・介護予防の先駆的取り組みとして、ぜひご確認ください。',
            '【関連リンク・参考情報】',
            '・NHK鳥取放送局「いろ★ドリ」公式ホームページ：https://www.nhk.jp/p/irodori/'
        ]
    },
    // 6: 2024.10.22 ホトセナNEWS
    {
        num: 6,
        date: '2024.10.22',
        title: '【2024.10.22】ホトセナNEWS取材記事が公開され、Yahoo!ニュース等に掲載されました',
        bodyParagraphs: [
            '情報ニュースメディア「ほ・とせなNEWS」より取材を受け、特集記事が公開されました。本記事はYahoo!ニュース等にも転載・掲載されております。',
            '記事では、元JICA海外協力隊としての活動経験から、現在地元・鳥取にてシニア専門ダンススクール「ゆるダン®」を立ち上げ展開するに至った背景や活動理念について詳しく紹介していただきました。教育や国際協力の視点を活かした独自の地域貢献アプローチが注目を集めています。',
            '海外での経験を活かした地域課題解決への取り組みとして、ぜひご確認ください。',
            '【関連リンク・参考情報】',
            '・ほ・とせなNEWS 公式ホームページ：https://hotosena.com/'
        ]
    },
    // 7: 2024.11.30 中海健康まつり
    {
        num: 7,
        date: '2024.11.30',
        title: '【2024.11.30】中海テレビ開局35周年「中海健康まつり」にてダンスレッスンを実施しました',
        bodyParagraphs: [
            '中海テレビ放送開局35周年記念事業「中海健康まつり～大切な人と一緒に健康になろう～」にて、「家族みんなで踊っちゃおう！ゆるダン＆ほのまる」と題したダンスレッスンを実施いたしました。',
            '当日は吉本興業の鳥取県住みます芸人「ほのまる」さんとのコラボレーションのもと、米子市および中海圏域の住民の皆様に向けて、シニア男性やお子様を含む3世代が一緒に楽しく身体を動かせるプログラムを提供いたしました。',
            '地域メディアや地域住民と連携した健康づくりの実践事例として、ぜひご確認ください。',
            '【関連リンク・参考情報】',
            '・株式会社中海テレビ放送 公式ホームページ：https://www.chukai.co.jp/',
            '・中海テレビ放送開局35周年記念事業「中海健康まつり」'
        ]
    },
    // 8: 2025.03.22 TOKYO FM
    {
        num: 8,
        date: '2025.03.22',
        title: '【2025.03.22】TOKYO FM全国ネット「JA共済 にほんのたから ちいきのきずな」にて紹介されました',
        bodyParagraphs: [
            'TOKYO FMをはじめとするJFN全国38局ネット番組「JA共済 にほんのたから ちいきのきずな」（パーソナリティ：住吉美紀さん）にて、全国放送で活動が紹介されました。',
            '日本各地で地域社会を支える取り組みを紹介する同番組において、鳥取発のシニア向け健康支援・生きがいづくりの活動として「ゆるダン®」を取り上げていただきました。',
            '全国ネットを通じて発信された鳥取発の地域貢献事例として、ぜひご確認ください。',
            '【関連リンク・参考情報】',
            '・JA共済「ちいきのきずな」特設サイト：https://social.ja-kyosai.or.jp/',
            '・TOKYO FM 公式ホームページ：https://www.tfm.co.jp/'
        ]
    }
];

async function clickAt(client, x, y) {
    await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function createDraft(client, article) {
    console.log(`\n==================================================`);
    console.log(`Creating Article ${article.num}: ${article.title}`);
    console.log(`==================================================`);

    // 1. Navigate to /new
    console.log('Navigating to /new...');
    await client.navigate('https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/new');

    // Wait for editor elements
    let ready = false;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 500));
        ready = await client.evaluate(`!!(document.querySelector('.title-div.main-title') && document.querySelector('.ProseMirror.in-cms'))`);
        if (ready) {
            console.log(`Editor ready in ${(i + 1) * 500}ms`);
            await new Promise(r => setTimeout(r, 600));
            break;
        }
    }
    if (!ready) throw new Error('Editor elements not found after navigating to /new');

    // 2. Focus & Type Title
    console.log('Focusing Title...');
    const titlePos = await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + 20 };
        }
        return null;
    })()`);
    if (!titlePos) throw new Error('Title element not found');
    await clickAt(client, titlePos.x, titlePos.y);
    await new Promise(r => setTimeout(r, 300));

    console.log('Typing Title...');
    await client.send('Input.insertText', { text: article.title });
    await new Promise(r => setTimeout(r, 400));
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    })()`);
    await new Promise(r => setTimeout(r, 500));

    // 3. Focus & Type Body
    console.log('Focusing Body...');
    const bodyPos = await client.evaluate(`(() => {
        const el = document.querySelector('.ProseMirror.in-cms');
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + 50, y: r.top + 30 };
        }
        return null;
    })()`);
    if (!bodyPos) throw new Error('Body element not found');
    await clickAt(client, bodyPos.x, bodyPos.y);
    await new Promise(r => setTimeout(r, 300));

    console.log('Typing Body paragraphs...');
    for (let i = 0; i < article.bodyParagraphs.length; i++) {
        await client.send('Input.insertText', { text: article.bodyParagraphs[i] });
        await new Promise(r => setTimeout(r, 150));
        if (i < article.bodyParagraphs.length - 1) {
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await new Promise(r => setTimeout(r, 200));
        }
    }
    await new Promise(r => setTimeout(r, 500));

    // 4. Select Category (ゆるダン)
    console.log('Selecting Category (ゆるダン)...');
    try {
        const catPos = await client.evaluate(`(() => {
            const el = document.querySelector('.o-post-editor-right-item-reference-field');
            if (el) {
                const r = el.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            }
            return null;
        })()`);
        if (catPos) {
            await clickAt(client, catPos.x, catPos.y);
            await new Promise(r => setTimeout(r, 800));

            const catClicked = await client.evaluate(`(() => {
                const items = Array.from(document.querySelectorAll('.unselected-list-wrap .o-cms-content-edit-reference-field-dropdown-item, .o-cms-content-edit-reference-field-dropdown-item'));
                const target = items.find(it => it.innerText && it.innerText.includes('ゆるダン'));
                if (target) {
                    target.click();
                    return true;
                }
                return false;
            })()`);
            console.log('Category clicked:', catClicked);
            await new Promise(r => setTimeout(r, 400));

            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await new Promise(r => setTimeout(r, 400));
        }
    } catch (e) {
        console.error('Category selection error:', e.message);
    }

    // 5. Auto-save wait (7 seconds)
    console.log('Waiting 7s for auto-save (下書き保存)...');
    await new Promise(r => setTimeout(r, 7000));

    const screenshotPath = path.join(__dirname, `draft_${article.num}_saved.png`);
    await client.screenshot(screenshotPath);
    console.log(`Saved screenshot: ${screenshotPath}`);
}

async function main() {
    const client = new CDPClient(9222);
    try {
        await client.connect('studio.design');

        for (const art of articles) {
            await createDraft(client, art);
        }

        console.log('\n==================================================');
        console.log('All articles created! Returning to list view...');
        console.log('==================================================');
        await client.navigate('https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf');
        await new Promise(r => setTimeout(r, 5000));

        const finalListScreenshot = path.join(__dirname, 'all_batch_drafts_final_list.png');
        await client.screenshot(finalListScreenshot);
        console.log(`Final list screenshot saved to: ${finalListScreenshot}`);

        await client.close();
    } catch (e) {
        console.error('Fatal error:', e);
        process.exit(1);
    }
}

main();
