# HEYDAY 官网多语言文案工作流

**核心思路：繁体中文是唯一来源。** 你只改一张表里的繁体文案，英文 / 俄文 / 乌兹别克文
由脚本自动生成并写回 `js/i18n.js`，最后一键部署到国内外两个站点。

```
content/zh.csv  ──(你只改这里)──►  tools/i18n.py run  ──►  js/i18n.js（四语）
                                          │
                                          ▼
                                  tools/deploy.py
                                    ├── 阿里云（国内）https://heydaygroup.bydtyr.com/
                                    └── GitHub Pages（海外）https://kinozhao9205.github.io/heyday-site/
```

---

## 日常改文案：只要三步

```bash
cd /Users/ssqc/WorkBuddy/公司产品手册/heyday-site

# 1. 用 Excel / 编辑器打开 content/zh.csv，改『zh』那一列的繁体文案
#    （用简体输入也没关系，脚本会自动转成繁体）

# 2. 一键同步（简繁修正 → 翻译 → 写回 → 体检）
python3 tools/i18n.py run

# 3. 确认无误后部署
python3 tools/deploy.py -m "更新 XX 文案"
```

> 不想敲命令的话，双击 `sync.command` / `deploy.command` 也可以。

---

## 文件说明

| 文件 | 作用 |
|---|---|
| `content/zh.csv` | **唯一需要你编辑的文件**。两列：`key`（不要改）+ `zh`（繁体文案） |
| `js/i18n.js` | 产物，四语字典。**不要手改**，由脚本生成 |
| `tools/i18n.py` | 文案同步主程序（pull / status / check / translate / apply / run） |
| `tools/deploy.py` | 部署程序（阿里云 + GitHub Pages） |
| `tools/config.json` | 配置（路径、API、服务器地址） |
| `tools/glossary.json` | 术语表，约束品牌名和固定译法 |
| `content/tm.json` | 翻译记忆（自动生成）。同样的文案第二次出现时直接复用，不重复花钱 |

---

## 命令速查

| 命令 | 用途 |
|---|---|
| `python3 tools/i18n.py pull` | 从 `i18n.js` 反向抽取繁中到 CSV（**会覆盖 CSV**，一般用不到） |
| `python3 tools/i18n.py status` | 看看这轮改了哪些（新增 / 变更 / 删除） |
| `python3 tools/i18n.py run` | **一键**：简繁修正 → 翻译 → 写回 → 体检 |
| `python3 tools/i18n.py check` | 只体检：简体检测、标点规范、四语完整性、占位符一致性 |
| `python3 tools/i18n.py check --fix` | 体检并自动修正：简体→繁体、标点规范化 |
| `python3 tools/i18n.py translate --export` | 只导出待译清单，交给 AI 翻译（不需要 API key） |
| `python3 tools/i18n.py apply` | 把填好的译文回填进 `i18n.js` |
| `python3 tools/deploy.py --dry-run` | 只打包，不上传不提交（先看看会发什么） |

---

## 编辑 CSV 的规则

- **只改第二列 `zh`**，第一列 `key` 是标识，不要动。
- **新增文案**：在末尾加一行，自己起一个 key 名（如 `about_card6_title`），
  并在 `index.html` 里用 `data-i18n="about_card6_title"` 引用它。
- **删除文案**：直接删掉那一行，四语会同步移除。
- **换行**：写 `\n` 表示换行（脚本会自动还原）。
- **输入简体没关系**：脚本会自动转成繁体。红线规则要求站内不能出现简体，
  脚本内置了保护机制，不会把『馬德里』转成『馬德裏』、『人群』转成『人羣』。
- **引号统一用 『』，不要写 「」**：`run` / `check --fix` 会自动把 「」 纠正成 『』。

---

## 只改标点不会触发重译

把 「」 改成 『』、换个破折号这类纯标点改动，**英文 / 俄文 / 乌兹别克文不受影响**，
所以脚本会自动识别成「仅标点变更」，直接沿用现有译文，不会浪费一次翻译。

```
── 仅标点变更 2 条（沿用现有译文，不重译）──
    cs02_title
      - 比亞迪「體驗日IP」體系化矩陣
      + 比亞迪『體驗日IP』體系化矩陣
```

标点规则写在 `tools/config.json` 的 `rules.punctuation_map`，想加别的规则往里加即可：

```json
"punctuation_map": {
  "「": "『",
  "」": "』"
}
```

---

## 翻译方式：二选一

### 方式 A：接 API（全自动，推荐）

1. 在 `tools/config.json` 里填：
   ```json
   "translate": {
     "mode": "api",
     "base_url": "https://api.deepseek.com/v1",
     "model": "deepseek-chat",
     "api_key": "sk-xxxxxx"
   }
   ```
   （任何 OpenAI 兼容接口都行：DeepSeek、通义、智谱、OpenAI 等）
2. 之后 `python3 tools/i18n.py run` 就全自动了。

不想把 key 写进文件，也可以用环境变量：
```bash
export HEYDAY_I18N_API_KEY=sk-xxxxxx
```

### 方式 B：导出清单让我翻译（无需 API key）

```bash
python3 tools/i18n.py run --export     # 生成 content/pending.json
# 把 content/pending.json 的内容发给我，我填好译文
python3 tools/i18n.py apply            # 回填
```

---

## 部署

```bash
python3 tools/deploy.py -m "更新案例文案"     # 国内外双站
python3 tools/deploy.py --aliyun-only         # 只更国内
python3 tools/deploy.py --github-only         # 只更海外
python3 tools/deploy.py --dry-run             # 只打包看看
```

部署脚本会自动：
1. 先跑一遍文案体检（不通过就停下，可 `--skip-check` 跳过）
2. 刷新 `index.html` 里的 `?v=` 版本号，破浏览器缓存
3. 打包 → SFTP 上传（MD5 校验，失败自动重试）
4. 服务器端自动备份旧版 → 全量替换 → `chown www:www`
5. 验证线上可访问 → `git commit & push`

---

## 术语表维护

`tools/glossary.json` 用来锁死品牌名和关键术语的译法，避免 AI 每次翻得不一样：

```json
{
  "keep_as_is": ["HEYDAY", "BYD", "CATL", "IP", "AI"],
  "terms": {
    "體驗營銷": { "en": "experiential marketing", "ru": "событийный маркетинг", "uz": "tajribaviy marketing" }
  }
}
```

发现某个词翻得不对，直接往里加一条即可，下次翻译就会遵守。
