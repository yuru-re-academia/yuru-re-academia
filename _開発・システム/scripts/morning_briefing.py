#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
morning_briefing.py
シニアアカデミア YURU-RE：（ゆるり）立ち上げプロジェクト
毎朝の「今日すべきこと」「方針決定で確認すべきこと」を自動抽出し、
スマホ（iPhone/Apple Watch/Mac）へ毎朝8:00にポップアップ通知・リマインダー配信するスクリプト。
"""

import os
import sys
import re
import json
import datetime
import subprocess
import argparse
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
TEAM_HUB_PATH = PROJECT_DIR / "team_hub.html"
LOG_DIR = Path.home() / ".gemini" / "antigravity"
LOG_DIR.mkdir(parents=True, exist_ok=True)

def parse_team_hub_tasks():
    """team_hub.htmlから全タスク情報を抽出"""
    if not TEAM_HUB_PATH.exists():
        return []
    
    with open(TEAM_HUB_PATH, "r", encoding="utf-8") as f:
        text = f.read()

    tasks = []
    m = re.search(r"tasks:\s*(\[\s*\{.*?\}\s*\])\s*,\s*meetings:", text, re.DOTALL)
    if m:
        content = m.group(1)
        pattern = re.compile(
            r'\{\s*id:\s*"([^"]+)".*?title:\s*"([^"]+)".*?description:\s*"([^"]+)".*?assignee:\s*"([^"]+)".*?status:\s*"([^"]+)".*?priority:\s*"([^"]+)".*?dueDate:\s*"([^"]+)"',
            re.DOTALL
        )
        for match in pattern.finditer(content):
            tasks.append({
                "id": match.group(1),
                "title": match.group(2),
                "description": match.group(3),
                "assignee": match.group(4),
                "status": match.group(5),
                "priority": match.group(6),
                "dueDate": match.group(7)
            })
    return tasks

def generate_daily_intelligence(target_date=None):
    """指定日（デフォルトは今日）のToDo・方針確認事項を生成"""
    if target_date is None:
        target_date = datetime.date.today()
        
    weekday_names = ["月", "火", "水", "木", "金", "土", "日"]
    weekday_str = weekday_names[target_date.weekday()]
    today_str = target_date.strftime("%Y-%m-%d")
    
    tasks = parse_team_hub_tasks()
    keita_tasks = [t for t in tasks if t["assignee"] in ["けいた", "全員"] and t["status"] in ["doing", "todo"]]
    keita_tasks.sort(key=lambda x: x["dueDate"])
    
    deadlines = [
        {"name": "米子市 令和9年度高齢者施設整備補助金 事前希望申出書 提出締切", "date": datetime.date(2026, 9, 30)},
        {"name": "株式会社ユルク組織変更 計画書作成・定款確定", "date": datetime.date(2026, 10, 15)},
        {"name": "中海ビルの物件賃貸交渉【GO/NO-GO判断リミット】", "date": datetime.date(2026, 10, 31)},
        {"name": "組織変更効力発生（株式会社ユルク正式発足目標）", "date": datetime.date(2026, 12, 1)},
    ]
    
    countdown_items = []
    for dl in deadlines:
        days_left = (dl["date"] - target_date).days
        if days_left >= 0:
            if days_left == 0:
                tag = "【本日締切！】"
            elif days_left <= 3:
                tag = f"【あと{days_left}日・超直前！】"
            elif days_left <= 10:
                tag = f"【あと{days_left}日・最重要】"
            else:
                tag = f"（あと{days_left}日）"
            countdown_items.append(f"・{dl['name']}：{dl['date'].strftime('%m/%d')} {tag}")

    today_actions = []
    if target_date.weekday() == 6: # 日曜日
        today_actions.append("【明日定例MTG準備】9/18(金)の中海テレビ森さん提案の感触・次の一手を整理（21:10〜の定例でJ・ダイちゃんへ共有）")
        today_actions.append("【9/30補助金申出書】米子市長寿社会課宛の提出書類（事前希望申出書・調査票）の概算数値を下書き作成")
    elif target_date.weekday() == 0: # 月曜日
        today_actions.append("【今夜21:10〜】3人定例オンラインミーティング本番（中海テレビ商談結果共有・車両契約協議）")
        today_actions.append("【9/30補助金申出書】申出書ドラフトを定例MTGでJ・ダイちゃんに最終共有し、週内提出準備を完了")
    elif target_date.weekday() in [1, 2, 3]: # 火・水・木
        today_actions.append("【9/30補助金申出書】米子市長寿社会課（永戸様窓口 choju@city.yonago.lg.jp）へ事前希望申出書をメール提出")
        today_actions.append("【中海テレビフォロー】森さんへ商談のお礼・追加確認事項の連絡および社内展開の打診")
    elif target_date.weekday() == 4: # 金曜日
        today_actions.append("【週次レビュー】今週の行政・物件交渉の進捗確認と来週のタスク整理")
    else: # 土曜日
        today_actions.append("【週末リサーチ】競合デイサービス動向やシニア向け最新デジタル施策の情報チェック")

    for t in keita_tasks[:3]:
        due = datetime.datetime.strptime(t["dueDate"], "%Y-%m-%d").date()
        diff = (due - target_date).days
        if diff <= 10:
            today_actions.append(f"・{t['title']}（期限: {t['dueDate']}）")

    decision_questions = [
        "🏢【中海テレビ物件】手前ロビーの段階的賃貸（スモールスタート）案について、森さん経由で社内交渉に乗せる合意が取れそうか？",
        "🚐【車両体制】Jが所有する福祉車両（スロープ式）の借用条件（月額1.5万〜2.5万円レンジ・維持費分担）を定例で合意できるか？",
        "🩺【現場調査】ダイちゃんが進める山陰・米子エリアの半日型デイ競合調査について、融資審査に耐えうる差別化要素が固まりつつあるか？",
        "🏛️【補助金】米子市の内装改修補助枠（上限350万円目安）の事前希望申出書を9/30までに提出する準備は整っているか？"
    ]

    header = f"【シニアアカデミア】{target_date.strftime('%m/%d')}({weekday_str}) 朝8時：今日すべきこと＆方針確認"
    
    body_lines = [
        f"📅 {target_date.strftime('%Y年%m月%d日')}({weekday_str}) 朝8時 デイリー・インテリジェンス\n",
        "━━━━━━━━━━━━━━━━━━",
        "🎯 【今日すべきこと（最優先アクション）】",
        "━━━━━━━━━━━━━━━━━━",
    ]
    for act in today_actions[:4]:
        body_lines.append(f"{act}")
    
    body_lines.extend([
        "\n━━━━━━━━━━━━━━━━━━",
        "❓ 【今後の方針決定で確認・判断すべきこと】",
        "━━━━━━━━━━━━━━━━━━",
    ])
    for q in decision_questions:
        body_lines.append(f"{q}\n")

    body_lines.extend([
        "━━━━━━━━━━━━━━━━━━",
        "⏳ 【重要期限カウントダウン】",
        "━━━━━━━━━━━━━━━━━━",
    ])
    for cd in countdown_items:
        body_lines.append(cd)

    body_text = "\n".join(body_lines)
    short_summary = f"{today_actions[0].replace('【', '').replace('】', '：')[:40]} 他"

    return {
        "target_date": target_date,
        "header": header,
        "short_summary": short_summary,
        "body_text": body_text,
        "today_actions": today_actions,
        "decision_questions": decision_questions
    }

def push_to_apple_reminders(intel, alarm_dt, target_list="シニアアカデミア"):
    """AppleScript経由でApple Reminders（iPhone同期）へアラーム・期日付きで登録"""
    target_date = intel["target_date"]
    date_str = alarm_dt.strftime("%Y/%m/%d %H:%M:%S")
    title = intel['header']
    notes = intel['body_text']
    escaped_notes = notes.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')

    applescript = f'''
    tell application "Reminders"
        if not (exists list "{target_list}") then
            make new list with properties {{name:"{target_list}"}}
        end if
        set targetList to list "{target_list}"

        -- 重複作成防止
        set oldRems to (reminders of targetList whose name contains "{target_date.strftime('%m/%d')}")
        if (count of oldRems) > 0 then
            repeat with r in oldRems
                delete r
            end repeat
        end if

        -- アラーム日時と期日を設定
        set remDate to date "{date_str}"
        set newRem to make new reminder in targetList with properties {{name:"{title}", body:"{escaped_notes}", due date:remDate, remind me date:remDate}}

        -- メインリスト「これ、やろ」にもToDoとして登録
        if exists list "これ、やろ" then
            set mainList to list "これ、やろ"
            set oldMainRems to (reminders of mainList whose name contains "【シニアアカデミア】{target_date.strftime('%m/%d')}")
            if (count of oldMainRems) > 0 then
                repeat with mr in oldMainRems
                    delete mr
                end repeat
            end if
            make new reminder in mainList with properties {{name:"【シニアアカデミア】{target_date.strftime('%m/%d')} 今日のToDo＆方針確認", body:"{escaped_notes}", due date:remDate, remind me date:remDate}}
        end if
    end tell
    '''
    
    res = subprocess.run(["osascript", "-e", applescript], capture_output=True, text=True)
    if res.returncode == 0:
        return True, f"Apple Remindersへ登録完了（アラーム予定: {date_str}）"
    else:
        return False, f"Reminders登録エラー: {res.stderr}"

def show_mac_notification(intel):
    """Macのポップアップバナー通知を表示"""
    title = "シニアアカデミア YURU-RE:"
    subtitle = "毎朝8時のタスク ＆ 方針決定チェック"
    message = f"{intel['short_summary']}"
    
    script = f'''
    display notification "{message}" with title "{title}" subtitle "{subtitle}" sound name "Subtle"
    '''
    subprocess.run(["osascript", "-e", script], capture_output=True)

def main():
    parser = argparse.ArgumentParser(description="シニアアカデミア毎朝通知配信スクリプト")
    parser.add_argument("--dry-run", action="store_true", help="通知を行わず本文出力のみ確認")
    parser.add_argument("--test-min", type=int, default=0, help="今すぐN分後に鳴るテストアラームを設定")
    parser.add_argument("--hour", type=int, default=8, help="朝の通知時刻（デフォルト: 8時）")
    parser.add_argument("--minute", type=int, default=0, help="朝の通知分（デフォルト: 0分）")
    args = parser.parse_args()

    now = datetime.datetime.now()
    today = datetime.date.today()

    if args.test_min > 0:
        # テスト実行: 現在時刻のN分後に設定
        alarm_dt = now + datetime.timedelta(minutes=args.test_min)
        target_date = today
        intel = generate_daily_intelligence(target_date)
    else:
        # 通常実行: 朝8時を設定
        # もし現在時刻が8時前なら「今日」の朝8時、8時を過ぎていれば「明日」の朝8時に設定
        today_8am = datetime.datetime(today.year, today.month, today.day, args.hour, args.minute, 0)
        if now < today_8am:
            alarm_dt = today_8am
            target_date = today
        else:
            tomorrow = today + datetime.timedelta(days=1)
            alarm_dt = datetime.datetime(tomorrow.year, tomorrow.month, tomorrow.day, args.hour, args.minute, 0)
            target_date = tomorrow
            
        intel = generate_daily_intelligence(target_date)

    if args.dry_run:
        print("=== [DRY RUN] 配信内容プレビュー ===")
        print(f"予定アラーム日時: {alarm_dt.strftime('%Y-%m-%d %H:%M:%S')}")
        print(intel["header"])
        print("-" * 50)
        print(intel["body_text"])
        return

    success, msg = push_to_apple_reminders(intel, alarm_dt=alarm_dt)
    show_mac_notification(intel)

    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")
    print("--------------------------------------------------")
    print(f"タイトル: {intel['header']}")
    print(f"通知予定日時: {alarm_dt.strftime('%Y年%m月%d日 %H:%M:%S')}")

if __name__ == "__main__":
    main()
