#!/bin/bash
# 双击运行：把 content/zh.csv 的繁体文案同步成四国语言
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1
PY="/Users/ssqc/.workbuddy/binaries/python/envs/default/bin/python"
[ -x "$PY" ] || PY="python3"
"$PY" tools/i18n.py run
echo ""
read -n 1 -s -r -p "按任意键关闭..."
echo ""
