const CDPClient = require('./cdp_client');
const path = require('path');

const articles = [
    // 1: 2024.04.24 北条中学校
    {
        date: '2024.04.24',
        title: '【2024.04.24】北栄町立北条中学校「中庭プロジェクト」にて座談会に登壇しました',
        bodyParagraphs: [
            '鳥取県東伯郡北栄町の北条中学校にて開催された「中庭プロジェクト」において、座談会に登壇いたしました。',
            '当日は生徒の皆様や地域の方々に向けて、シニアの健康寿命延伸や多世代交流の重要性についてお話しし、世代を超えて地域の健康や生きがいについて考える機会となりました。',
            'シニア層だけでなく次世代とともに進める地域共生社会づくりの実践として、ぜひご確認ください。',
            '【関連リンク・参考情報】',
            '・北栄町立北条中学校（鳥取県東伯郡北栄町土下100-1）',
            '・北栄町 公式ホームページ：https://www.e-hokuei.net/'
        ]
    },
    // 2: 2024.07.10 NHK総合 いろ★ドリ
    {
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

async function clickElementCenter(client, selector) {
    const rect = await client.evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return null;
    })()`);
    if (rect) {
        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
        return true;
    }
    return false;
}

async function openNewEditor(client) {
    console.log('Clicking 新規追加 button...');
    const btnRect = await client.evaluate(`(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'));
        if (btn) {
            const r = btn.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return null;
    })()`);
    if (!btnRect) throw new Error('新規追加 button not found!');

    await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: btnRect.x, y: btnRect.y, button: 'left', clickCount: 1 });
    await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: btnRect.x, y: btnRect.y, button: 'left', clickCount: 1 });

    // Wait for editor to appear
    console.log('Waiting for editor elements to become ready...');
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const ready = await client.evaluate(`!!(document.querySelector('.title-div.main-title') && document.querySelector('.ProseMirror.in-cms'))`);
        if (ready) {
            console.log(`Editor ready in ${(i + 1) * 500}ms`);
            await new Promise(r => setTimeout(r, 600));
            return true;
        }
    }
    throw new Error('Editor did not open in time');
}

async function clickBackToList(client) {
    console.log('Clicking 戻る...');
    const backRect = await client.evaluate(`(() => {
        const backBtn = Array.from(document.querySelectorAll('button, div, span, a')).find(b => b.innerText && b.innerText.trim() === '戻る');
        if (backBtn) {
            const r = backBtn.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return null;
    })()`);

    if (backRect) {
        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: backRect.x, y: backRect.y, button: 'left', clickCount: 1 });
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: backRect.x, y: backRect.y, button: 'left', clickCount: 1 });
    }

    // Wait for list view to return
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const onList = await client.evaluate(`!document.querySelector('.title-div.main-title') && !!Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('新規追加'))`);
        if (onList) {
            console.log('Back in list view!');
            await new Promise(r => setTimeout(r, 1000));
            return true;
        }
    }
    console.log('Warning: back to list timeout, waiting extra 2s...');
    await new Promise(r => setTimeout(r, 2000));
}

async function fillArticle(client, article) {
    console.log(`Entering article data: ${article.title}`);

    // 1. Title
    console.log('Focusing & typing Title...');
    await clickElementCenter(client, '.title-div.main-title');
    await new Promise(r => setTimeout(r, 300));
    await client.evaluate(`document.execCommand('selectAll', false, null)`);
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await new Promise(r => setTimeout(r, 200));
    await client.send('Input.insertText', { text: article.title });
    await new Promise(r => setTimeout(r, 300));
    await client.evaluate(`(() => {
        const el = document.querySelector('.title-div.main-title');
        if (el) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // 2. Body
    console.log('Focusing & typing Body...');
    await clickElementCenter(client, '.ProseMirror.in-cms');
    await new Promise(r => setTimeout(r, 300));
    await client.evaluate(`document.execCommand('selectAll', false, null)`);
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await new Promise(r => setTimeout(r, 200));

    for (let p = 0; p < article.bodyParagraphs.length; p++) {
        await client.send('Input.insertText', { text: article.bodyParagraphs[p] });
        await new Promise(r => setTimeout(r, 150));
        if (p < article.bodyParagraphs.length - 1) {
            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
            await new Promise(r => setTimeout(r, 200));
        }
    }
    await new Promise(r => setTimeout(r, 500));

    // 3. Category
    console.log('Setting Category (ゆるダン)...');
    try {
        const catFieldRect = await client.evaluate(`(() => {
            const el = document.querySelector('.o-post-editor-right-item-reference-field');
            if (el) {
                const r = el.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            }
            return null;
        })()`);
        if (catFieldRect) {
            await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: catFieldRect.x, y: catFieldRect.y, button: 'left', clickCount: 1 });
            await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: catFieldRect.x, y: catFieldRect.y, button: 'left', clickCount: 1 });
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
            console.log('Category "ゆるダン" option clicked:', catClicked);
            await new Promise(r => setTimeout(r, 400));

            await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await new Promise(r => setTimeout(r, 400));
        }
    } catch (e) {
        console.error('Category selection error:', e.message);
    }

    // 4. Wait for auto-save (下書き保存)
    console.log('Waiting 7s for auto-save (下書き保存)...');
    await new Promise(r => setTimeout(r, 7000));
}

async function main() {
    const client = new CDPClient(9222);
    try {
        console.log('Connecting to Chrome on port 9222...');
        await client.connect('studio.design');

        const cmsListUrl = 'https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf';
        
        // Ensure we are in list view
        const isEditorOpen = await client.evaluate(`!!document.querySelector('.title-div.main-title')`);
        if (isEditorOpen) {
            console.log('Editor currently open, returning to list view first...');
            await clickBackToList(client);
        }

        for (let i = 0; i < articles.length; i++) {
            const art = articles[i];
            console.log(`\n==================================================`);
            console.log(`[${i + 1}/${articles.length}] Processing Article: ${art.title}`);
            console.log(`==================================================`);

            // Check if already in list
            const alreadyExists = await client.evaluate(`(() => {
                const text = document.body.innerText;
                return text.includes(${JSON.stringify(art.title)});
            })()`);

            if (alreadyExists) {
                console.log(`Article already exists in CMS list. Skipping: ${art.title}`);
                continue;
            }

            // Create new draft
            await openNewEditor(client);
            await fillArticle(client, art);
            
            // Take screenshot of saved editor
            const editorScreenshot = path.join(__dirname, `draft_${i + 1}_saved.png`);
            await client.screenshot(editorScreenshot);
            console.log(`Editor screenshot saved: ${editorScreenshot}`);

            await clickBackToList(client);
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log('\n==================================================');
        console.log('ALL ARTICLES PROCESSED AS DRAFTS!');
        console.log('==================================================');

        await new Promise(r => setTimeout(r, 3000));
        const finalScreenshot = path.join(__dirname, 'all_drafts_pipeline_final.png');
        await client.screenshot(finalScreenshot);
        console.log(`Final list screenshot saved to: ${finalScreenshot}`);

        await client.close();
    } catch (e) {
        console.error('Fatal error:', e);
        process.exit(1);
    }
}

main();
