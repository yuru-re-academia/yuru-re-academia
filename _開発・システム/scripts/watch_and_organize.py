#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
アカデミアフォルダ 常駐自動整理デーモン (Watch & Organize)
ルート直下を常時監視し、新しいファイルが追加されたら即座に各フォルダへ自動分類します。
"""

import os
import sys
import time
from datetime import datetime

# 同ディレクトリの auto_organize モジュールを読み込み
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
import auto_organize

PID_FILE = os.path.join(auto_organize.BASE_DIR, "_開発・システム", "organizer.pid")

def run_watcher(interval_sec=3):
    # PID記録
    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))
    
    auto_organize.log(f"監視デーモン開始 (PID: {os.getpid()}, 監視間隔: {interval_sec}秒)")
    
    # 起動時にまず1回整理
    auto_organize.organize()

    try:
        while True:
            time.sleep(interval_sec)
            items = os.listdir(auto_organize.BASE_DIR)
            new_items = [
                item for item in items 
                if not item.startswith(".") and item not in auto_organize.ALLOWED_ROOT_ITEMS
            ]
            if new_items:
                auto_organize.log(f"新着ファイルを検知: {new_items}")
                auto_organize.organize()
    except KeyboardInterrupt:
        auto_organize.log("監視デーモン停止 (手動終了)")
    except Exception as e:
        auto_organize.log(f"監視デーモン異常終了: {e}")
    finally:
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)

if __name__ == "__main__":
    interval = 3
    if len(sys.argv) > 1:
        try:
            interval = int(sys.argv[1])
        except ValueError:
            pass
    run_watcher(interval)
