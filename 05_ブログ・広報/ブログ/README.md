# ゆるダン® ブログ・お知らせ記事 運用プロジェクト

本プロジェクトは、シニア専門ダンススクール「ゆるダン®」公式ホームページ（[www.yurudan.jp](https://www.yurudan.jp)）のお知らせ・メディア掲載・活動報告記事を制作・管理・CMS投入するための専用プロジェクトです。

---

## 📁 フォルダ構成

```text
ブログ/
├── GEMINI.md          # プロジェクト基本規定・執筆ルール（最重要）
├── AGENTS.md          # エージェント同期規定
├── README.md          # 本ファイル（プロジェクト全体像・操作手引き）
├── articles/          # 完成原稿マスター（全12記事＋今後の新規記事）
│   ├── README.md      # 記事一覧・ステータス管理表
│   ├── 01_2024-04-24_北条中学校座談会.md
│   ├── 02_2024-07-10_NHKいろドリ生放送.md
│   ├── ...
├── templates/         # 新規記事テンプレート＆チェックリスト
│   └── article_template.md
├── scripts/           # STUDIO CMS 自動化スクリプト（CDP連携）
│   ├── cdp_client.js
│   ├── batch_articles_data.js
│   └── create_all_drafts_pipeline.js
└── docs/              # 引き継ぎ・仕様ドキュメント
    └── HANDOVER_NOTES.md
```

---

## ✍️ 記事執筆クイックルール

1. **タイトル**: 必ず先頭に日付を入れる（例: `【2024.07.10】タイトル`）
2. **挨拶不要**: 「こんにちは」などの挨拶文は入れない
3. **「！」禁止**: ビックリマークは使わず、落ち着いたトーンにする
4. **トーン**: 客観的・公式ニュースレター調（平易な言葉＋メディア・公的実績で権威性担保）
5. **末尾**: 関連機関・メディアの紹介と公式URLリンクを箇条書きで必ず記載

---

## 🚀 STUDIO CMS への登録手順

- **CMS管理画面**: [STUDIO CMS ダッシュボード](https://app.studio.design/projects/NxqgmljEW1/dashboard/cms/pXOoHndOmpNJZxetn9Sf)
- **手動登録**: `articles/` 配下の各記事Markdownからタイトル・本文・リンクをコピーして「ニュース」モデルへ貼り付け → 「下書き」保存。
- **自動登録**: `scripts/` ディレクトリ内のCDP自動化スクリプトを使用（Chromeを `--remote-debugging-port=9222` で起動）。
