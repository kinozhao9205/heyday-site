#!/bin/bash
# 双击运行：部署到国内阿里云 + 海外 GitHub Pages
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1
PY="/Users/ssqc/.workbuddy/binaries/python/envs/default/bin/python"
[ -x "$PY" ] || PY="python3"
echo "此操作将把本地站点发布到线上（国内外双站）。"
read -r -p "确认发布？输入 y 继续，其它键取消：" ans
[ "$ans" = "y" ] || { echo "已取消"; exit 0; }
"$PY" tools/deploy.py
echo ""
read -n 1 -s -r -p "按任意键关闭..."
echo ""
