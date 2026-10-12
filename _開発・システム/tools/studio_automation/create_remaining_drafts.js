const CDPClient = require('./cdp_client');
const path = require('path');

const remainingArticles = [
    {
        date: '2024.07.10',
        title: '【2024.07.10】NHK総合「いろ★ドリ」生放送に出演しました',
        bodyParagraphs: [
            'NHK総合（鳥取放送局）の夕方ニュース・情報番組「いろ★ドリ」の生放送に出演いたしました。',
            '番組内では、シニア専門ダンススクール「ゆるダン®」の活動や、運動習慣の少ないシニア男性でも無理なく楽しく取り組める健康維持プログラムの特徴についてPRさせていただきました。',
            '鳥取県内をはじめ山陰地域における高齢者の健康習慣づくりの取り組みとして、ぜひご確認ください。',
            '【関連リンク・参考情報】',
            '・NHK鳥取放送局「いろ★ドリ」公式ホームページ：https://www.nhk.jp/p/irodori/'
        ]
    },
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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

async function safeEvaluate(client, expr) {
    try {
        return await client.evaluate(expr);
    } catch (e) {
        return null;
    }
}

async function waitForEditorReady(client, timeoutMs = 20000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const ready = await safeEvaluate(client, `(() => {
            const titleEl = document.querySelector('.title-div.main-title');
            const proseEl = document.querySelector('.ProseMirror.in-cms');
            return !!(titleEl && proseEl);
        })()`);
        if (ready) return true;
        await new Promise(r => setTimeout(r, 500));
    }
    return false;
}

async function createSingleArticle(client, article, index, total) {
    console.log(`\n==================================================`);
    console.log(`[${index + 1}/${total}] Creating Draft: ${article.title}`);
    console.log(`==================================================`);

    // 1. Click 新規追加 button from list view
    console.log('1. Looking for 新規追加 button...');
    let btnFound = false;
    for (let i = 0; i < 10; i++) {
        btnFound = await safeEvaluate(client, `(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        })()`);
        if (btnFound) break;
        await new Promise(r => setTimeout(r, 800));
    }

    if (!btnFound) {
        console.log('Button not found, navigating directly to /new...');
        await client.navigate('https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf/new');
    }

    // 2. Wait for editor to be ready
    console.log('2. Waiting for editor elements (.title-div.main-title & .ProseMirror.in-cms)...');
    let ready = await waitForEditorReady(client, 20000);
    if (!ready) {
        // Try reloading once if it didn't render
        console.log('Editor not ready, reloading page...');
        await client.send('Page.reload');
        ready = await waitForEditorReady(client, 20000);
        if (!ready) {
            throw new Error(`Editor failed to load for article: ${article.title}`);
        }
    }
    console.log('Editor is ready!');
    await new Promise(r => setTimeout(r, 600));

    // 3. Scroll to top
    await safeEvaluate(client, `(() => {
        const scrollContainer = document.querySelector('.overflow-y-auto') || window;
        if (scrollContainer.scrollTo) scrollContainer.scrollTo(0, 0);
        window.scrollTo(0, 0);
    })()`);
    await new Promise(r => setTimeout(r, 300));

    // 4. Enter Title
    console.log('3. Setting Title...');
    await safeEvaluate(client, `(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.scrollIntoView({ block: 'center' });
            el.focus();
            const sel = window.getSelection();
            sel.selectAllChildren(el);
            sel.deleteFromDocument();
        }
    })()`);
    await new Promise(r => setTimeout(r, 400));
    await client.send('Input.insertText', { text: article.title });
    await new Promise(r => setTimeout(r, 800));

    // 5. Enter Body
    console.log('4. Setting Body paragraphs...');
    await safeEvaluate(client, `(() => {
        const el = document.querySelector('.ProseMirror.in-cms');
        if (el) {
            el.scrollIntoView({ block: 'center' });
            el.focus();
            const sel = window.getSelection();
            sel.selectAllChildren(el);
            sel.deleteFromDocument();
        }
    })()`);
    await new Promise(r => setTimeout(r, 400));

    for (let pIdx = 0; pIdx < article.bodyParagraphs.length; pIdx++) {
        await client.send('Input.insertText', { text: article.bodyParagraphs[pIdx] });
        await new Promise(r => setTimeout(r, 200));
        if (pIdx < article.bodyParagraphs.length - 1) {
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await new Promise(r => setTimeout(r, 250));
        }
    }
    await new Promise(r => setTimeout(r, 800));

    // 6. Set Category (ゆるダン)
    console.log('5. Setting Category (ゆるダン)...');
    try {
        await safeEvaluate(client, `(() => {
            const refField = document.querySelector('.o-post-editor-right-item-reference-field');
            if (refField) refField.click();
        })()`);
        await new Promise(r => setTimeout(r, 1000));

        const catResult = await safeEvaluate(client, `(() => {
            const item = document.querySelector('.unselected-list-wrap .o-cms-content-edit-reference-field-dropdown-item');
            if (item) {
                item.click();
                return 'clicked: ' + item.innerText.trim();
            }
            return 'not found';
        })()`);
        console.log('Category select result:', catResult);

        // Close popover with Escape
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await new Promise(r => setTimeout(r, 500));
    } catch (e) {
        console.error('Category error:', e.message);
    }

    // 7. Auto-save wait (7 seconds)
    console.log('6. Waiting 7 seconds for cloud auto-save...');
    await new Promise(r => setTimeout(r, 7000));

    const itemUrl = await safeEvaluate(client, 'window.location.href');
    console.log(`Saved as draft! Current URL: ${itemUrl}`);

    // Take screenshot of saved editor
    const editorScreenshot = path.join(__dirname, `draft_${index + 2}_editor.png`);
    await client.screenshot(editorScreenshot);

    // 8. Return to list view
    console.log('7. Returning to CMS list view...');
    await safeEvaluate(client, `(() => {
        const backBtn = Array.from(document.querySelectorAll('button, div, span, a')).find(b => b.innerText && b.innerText.trim() === '戻る');
        if (backBtn) backBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 3500));
}

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        for (let i = 0; i < remainingArticles.length; i++) {
            await createSingleArticle(client, remainingArticles[i], i, remainingArticles.length);
        }

        console.log('\n==================================================');
        console.log('ALL REMAINING 7 ARTICLES CREATED AS DRAFTS SUCCESSFULLY!');
        console.log('==================================================');

        await new Promise(r => setTimeout(r, 3000));
        const finalScreenshot = path.join(__dirname, 'all_articles_final_list.png');
        await client.screenshot(finalScreenshot);
        console.log(`Saved final list screenshot: ${finalScreenshot}`);

        await client.close();
    } catch (e) {
        console.error('Error during remaining articles creation:', e);
        process.exit(1);
    }
}

main();
