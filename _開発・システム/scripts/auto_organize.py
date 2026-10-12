#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
アカデミアフォルダ自動整理スクリプト (Auto-Organizer)
フォルダ直下に新しいファイルが追加された際、所定のルールに基づいて各フォルダへ自動分類・移動します。
"""

import os
import shutil
import sys
import time
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOG_FILE = os.path.join(BASE_DIR, "_開発・システム", "organize.log")

# ルートに常に残す正規のアイテム一覧
ALLOWED_ROOT_ITEMS = {
    "01_事業計画・構想",
    "02_中海テレビ放送",
    "03_米子市",
    "04_鳥取大学",
    "05_ブログ・広報",
    "_開発・システム",
    "_未分類・新着",
    "team_hub.html",
    "index.html",
    "README.md",
    "フォルダ案内.md",
}

def log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] {message}"
    print(entry)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(entry + "\n")
    except Exception:
        pass

def classify_item(name):
    lower = name.lower()
    
    # スクリプトファイル
    if name.endswith((".py", ".sh", ".bash", ".zsh")):
        return os.path.join(BASE_DIR, "_開発・システム", "scripts")

    # テスト画像・スクリーンショット
    if name.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
        if any(k in lower for k in ["chukai", "中海", "センビル", "ビル"]):
            return os.path.join(BASE_DIR, "02_中海テレビ放送")
        return os.path.join(BASE_DIR, "_開発・システム", "screenshots")

    # 中海テレビ放送関連
    if any(k in name for k in ["中海", "chukai", "Chukai", "CHUKAI", "センビル"]):
        if any(k in name for k in ["提案", "サマリー", "プレゼン", "スライド"]):
            return os.path.join(BASE_DIR, "02_中海テレビ放送", "提案資料")
        return os.path.join(BASE_DIR, "02_中海テレビ放送")

    # 米子市・行政・指定申請関連
    if any(k in name for k in ["米子", "長寿社会", "指定申請", "事前協議", "事前相談", "総合事業", "介護保険", "添付書類"]):
        return os.path.join(BASE_DIR, "03_米子市")

    # 鳥取大学関連
    if any(k in name for k in ["鳥取大学", "鳥大", "浦上", "CoRE", "core", "とっとり方式"]):
        return os.path.join(BASE_DIR, "04_鳥取大学")

    # ブログ・記事・広報関連
    if any(k in name for k in ["ブログ", "記事", "note", "オウンドメディア", "引き継ぎ", "引継"]):
        return os.path.join(BASE_DIR, "05_ブログ・広報")

    # 事業計画・収支・ロードマップ・構想
    if any(k in name for k in ["事業計画", "収支", "ロードマップ", "チェックリスト", "構想", "財務", "シミュレーション", "開業"]):
        return os.path.join(BASE_DIR, "01_事業計画・構想")

    # それ以外の未分類ファイル
    return os.path.join(BASE_DIR, "_未分類・新着")

def organize():
    try:
        items = os.listdir(BASE_DIR)
    except Exception as e:
        log(f"エラー: ディレクトリ読み込み失敗: {e}")
        return

    moved_count = 0
    for item in items:
        # 隠しファイル（.git, .DS_Store等）や正規フォルダ・ファイルはスキップ
        if item.startswith(".") or item in ALLOWED_ROOT_ITEMS:
            continue

        src_path = os.path.join(BASE_DIR, item)
        dest_dir = classify_item(item)
        os.makedirs(dest_dir, exist_ok=True)
        dest_path = os.path.join(dest_dir, item)

        # ファイル移動（同名の場合はタイムスタンプを付与して安全に保管）
        if os.path.exists(dest_path):
            base_name, ext = os.path.splitext(item)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            dest_path = os.path.join(dest_dir, f"{base_name}_{timestamp}{ext}")

        try:
            # 書き込み完了を少し待つ（ダウンロード中などの安全策）
            time.sleep(0.5)
            shutil.move(src_path, dest_path)
            rel_dest = os.path.relpath(dest_path, BASE_DIR)
            log(f"自動整理: '{item}' ➔ '{rel_dest}' へ移動しました")
            moved_count += 1
        except Exception as e:
            log(f"移動失敗: '{item}': {e}")

    if moved_count > 0:
        log(f"合計 {moved_count} 件のアイテムを自動整理しました。")

if __name__ == "__main__":
    organize()
