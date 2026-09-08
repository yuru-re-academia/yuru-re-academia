#!/bin/bash
# STUDIO自動投稿専用のChrome起動スクリプト
PROFILE_DIR="$HOME/.studio-automation-profile"
PORT=9222
URL="https://app.studio.design/projects/NxqgmljEW1/dashboard/home"

mkdir -p "$PROFILE_DIR"

# 既にChromeが9222で起動しているか確認
if curl -s "http://127.0.0.1:$PORT/json/version" > /dev/null 2>&1; then
    echo "Chrome is already running on port $PORT."
else
    echo "Launching Google Chrome with dedicated profile..."
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
        --user-data-dir="$PROFILE_DIR" \
        --remote-debugging-port=$PORT \
        --no-first-run \
        --no-default-browser-check \
        "$URL" > /dev/null 2>&1 &
    sleep 2
    echo "Chrome launched successfully on port $PORT."
fi
