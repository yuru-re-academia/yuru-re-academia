const CDPClient = require('./cdp_client');
const path = require('path');

const articles = [
    // 3: 日本海新聞 (currently open in editor with title already typed)
    {
        id: 3,
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
    // 4: 中海テレビ フューチャースクエア
    {
        id: 4,
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
    // 5: NHK 精鋭
    {
        id: 5,
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
    // 6: ホトセナNEWS
    {
        id: 6,
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
    // 7: 中海健康まつり
    {
        id: 7,
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
    // 8: TOKYO FM
    {
        id: 8,
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

async function openNewEditor(client) {
    console.log('Looking for 新規追加 button in list view...');
    for (let i = 0; i < 15; i++) {
        const clicked = await client.evaluate(`(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        })()`);
        if (clicked) {
            console.log('Clicked 新規追加!');
            break;
        }
        await new Promise(r => setTimeout(r, 600));
    }

    console.log('Waiting for editor elements to load...');
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 500));
        const ready = await client.evaluate(`!!(document.querySelector('.title-div.main-title') && document.querySelector('.ProseMirror.in-cms'))`);
        if (ready) {
            console.log(`Editor loaded after ${(i + 1) * 500}ms!`);
            return true;
        }
    }
    throw new Error('Editor failed to open within timeout');
}

async function returnToList(client) {
    console.log('Returning to CMS list view...');
    await client.evaluate(`(() => {
        const backBtn = Array.from(document.querySelectorAll('button, div, span, a')).find(b => b.innerText && b.innerText.trim() === '戻る');
        if (backBtn) backBtn.click();
    })()`);

    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const isBack = await client.evaluate(`!document.querySelector('.title-div.main-title') && !!Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'))`);
        if (isBack) {
            console.log('Successfully back in list view!');
            await new Promise(r => setTimeout(r, 1500));
            return true;
        }
    }
    console.log('Warning: returnToList timed out waiting for list confirmation, waiting extra 2s...');
    await new Promise(r => setTimeout(r, 2000));
    return false;
}

async function fillArticle(client, article, isFirstAlreadyOpen = false) {
    console.log(`\n==================================================`);
    console.log(`Processing Article [${article.id}/8]: ${article.title}`);
    console.log(`==================================================`);

    if (!isFirstAlreadyOpen) {
        await openNewEditor(client);
    }

    // 1. Scroll to top
    await client.evaluate(`(() => {
        const scrollContainer = document.querySelector('.overflow-y-auto') || window;
        if (scrollContainer.scrollTo) scrollContainer.scrollTo(0, 0);
        window.scrollTo(0, 0);
    })()`);
    await new Promise(r => setTimeout(r, 300));

    // 2. Title
    console.log('Setting Title...');
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.focus();
            document.execCommand('selectAll', false, null);
        }
    })()`);
    await new Promise(r => setTimeout(r, 200));
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await new Promise(r => setTimeout(r, 300));

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

    // 3. Body
    console.log('Setting Body...');
    await client.evaluate(`(() => {
        const el = document.querySelector('.ProseMirror.in-cms');
        if (el) {
            el.focus();
            document.execCommand('selectAll', false, null);
        }
    })()`);
    await new Promise(r => setTimeout(r, 200));
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await new Promise(r => setTimeout(r, 300));

    for (let p = 0; p < article.bodyParagraphs.length; p++) {
        await client.send('Input.insertText', { text: article.bodyParagraphs[p] });
        await new Promise(r => setTimeout(r, 200));
        if (p < article.bodyParagraphs.length - 1) {
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await new Promise(r => setTimeout(r, 250));
        }
    }
    await new Promise(r => setTimeout(r, 800));

    // 4. Category
    console.log('Setting Category (ゆるダン)...');
    try {
        await client.evaluate(`(() => {
            const refField = document.querySelector('.o-post-editor-right-item-reference-field');
            if (refField) refField.click();
        })()`);
        await new Promise(r => setTimeout(r, 800));

        const catClicked = await client.evaluate(`(() => {
            const item = document.querySelector('.unselected-list-wrap .o-cms-content-edit-reference-field-dropdown-item');
            if (item) {
                item.click();
                return item.innerText.trim();
            }
            return null;
        })()`);
        console.log('Category clicked:', catClicked);
        await new Promise(r => setTimeout(r, 500));

        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await new Promise(r => setTimeout(r, 500));
    } catch (e) {
        console.error('Category warning:', e.message);
    }

    // 5. Cloud Auto-save wait
    console.log('Waiting 7s for cloud auto-save...');
    await new Promise(r => setTimeout(r, 7000));

    const itemUrl = await client.evaluate('window.location.href');
    console.log(`Saved as draft! URL: ${itemUrl}`);

    // Screenshot editor state
    await client.screenshot(path.join(__dirname, `article_${article.id}_saved.png`));

    // 6. Return to list
    await returnToList(client);
}

async function fixArticle1Title(client) {
    console.log('\n==================================================');
    console.log('Checking and fixing Article 1 Title in list...');
    console.log('==================================================');

    // Click on row containing 北条中学校
    const rowClicked = await client.evaluate(`(() => {
        const rows = Array.from(document.querySelectorAll('.o-model-content-list-item'));
        const targetRow = rows.find(r => r.innerText && r.innerText.includes('北条中学校'));
        if (targetRow) {
            targetRow.click();
            return true;
        }
        return false;
    })()`);

    if (!rowClicked) {
        console.log('Row for 北条中学校 not found in top rows, skipping title fix');
        return;
    }

    console.log('Waiting for Article 1 editor to open...');
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const ready = await client.evaluate(`!!document.querySelector('.title-div.main-title')`);
        if (ready) break;
    }

    const correctTitle = '【2024.04.24】北栄町立北条中学校「中庭プロジェクト」にて座談会に登壇しました';
    console.log('Setting exact Article 1 Title:', correctTitle);

    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.focus();
            document.execCommand('selectAll', false, null);
        }
    })()`);
    await new Promise(r => setTimeout(r, 200));
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await new Promise(r => setTimeout(r, 300));

    await client.send('Input.insertText', { text: correctTitle });
    await new Promise(r => setTimeout(r, 400));
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    })()`);

    console.log('Waiting 7s for Article 1 auto-save...');
    await new Promise(r => setTimeout(r, 7000));
    await client.screenshot(path.join(__dirname, 'article_1_fixed.png'));

    await returnToList(client);
}

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        // Article 3 is already open in editor!
        await fillArticle(client, articles[0], true);

        // Articles 4 to 8
        for (let i = 1; i < articles.length; i++) {
            await fillArticle(client, articles[i], false);
        }

        // Fix Article 1 title if needed
        await fixArticle1Title(client);

        console.log('\n==================================================');
        console.log('ALL ARTICLES DRAFT CREATION COMPLETED!');
        console.log('==================================================');

        await new Promise(r => setTimeout(r, 3000));
        const finalListScreenshot = path.join(__dirname, 'all_articles_final_list.png');
        await client.screenshot(finalListScreenshot);
        console.log(`Saved final list screenshot: ${finalListScreenshot}`);

        await client.close();
    } catch (e) {
        console.error('Error in master pipeline:', e);
        process.exit(1);
    }
}

main();
