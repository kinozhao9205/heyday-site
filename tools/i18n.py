#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
i18n.py — HEYDAY 官网多语言文案工作流

核心理念：繁体中文是唯一来源，你只改 content/zh.csv，其余三语自动生成。

常用流程：
    python3 tools/i18n.py pull        # 从 i18n.js 抽取繁中到 CSV（首次或反同步）
    #   → 用 Excel / 编辑器改 content/zh.csv 的繁体文案
    python3 tools/i18n.py status      # 看看改了哪些
    python3 tools/i18n.py run         # 一键：简繁修正 → 翻译 → 回填 → 校验
    python3 tools/deploy.py           # 部署到阿里云 + GitHub Pages

命令：
    pull        i18n.js 的繁中块 → content/zh.csv
    status      对比 CSV 与 i18n.js，列出新增/变更/删除
    check       校验：简体检测、四语完整性、空值、占位符一致性（--fix 自动转繁体）
    translate   --auto 调 API 翻译；--export 导出待译清单给 AI 翻译
    apply       把 content/pending.json 的译文回填进 i18n.js
    run         pull 后的完整一键流程（status → 简繁修正 → translate → apply → check）
    glossary    查看/追加术语表
"""
import argparse
import datetime
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from i18n_core import (I18NFile, read_csv, write_csv, read_json, write_json,
                       to_traditional, normalize_punctuation, detection_available,
                       DEFAULT_CORRECTIONS, DEFAULT_PUNCTUATION)

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
DEFAULT_CONFIG = os.path.join(HERE, 'config.json')

LANG_NAMES = {
    'en': 'English',
    'zh': '繁體中文',
    'ru': 'Russian (Русский)',
    'uz': "Uzbek (O'zbekcha, 拉丁字母)",
}

C = {
    'R': '\033[0m', 'G': '\033[32m', 'Y': '\033[33m', 'B': '\033[34m',
    'RED': '\033[31m', 'BOLD': '\033[1m', 'DIM': '\033[2m', 'CY': '\033[36m',
}


def log(msg='', color=None):
    print((C.get(color, '') + msg + C['R']) if color else msg)


def title(msg):
    print('\n' + C['BOLD'] + C['CY'] + '══ ' + msg + C['R'])


# --------------------------------------------------------------------------

class Workflow:
    def __init__(self, config_path=DEFAULT_CONFIG):
        self.cfg_path = config_path
        self.cfg = read_json(config_path) or {}
        self.site = self.cfg.get('site', {})
        self.rules = self.cfg.get('rules', {})
        self.tcfg = self.cfg.get('translate', {})

        self.i18n_path = os.path.join(SITE, self.site.get('i18n_file', 'js/i18n.js'))
        self.csv_path = os.path.join(SITE, self.site.get('content_csv', 'content/zh.csv'))
        self.pending_path = os.path.join(SITE, self.site.get('pending_file', 'content/pending.json'))
        self.tm_path = os.path.join(SITE, 'content/tm.json')
        self.glossary_path = os.path.join(HERE, 'glossary.json')

        self.src = self.site.get('source_lang', 'zh')
        self.targets = self.site.get('target_langs', ['en', 'ru', 'uz'])
        self.all_langs = self.site.get('all_langs', ['en', 'zh', 'ru', 'uz'])

        self.f = I18NFile(self.i18n_path, self.site.get('dict_var', 'I18N'))
        self.f.lang_order = self.all_langs
        self.glossary = read_json(self.glossary_path) or {}

    # ---------------- 基础数据 ----------------
    @property
    def order(self):
        """CSV 的行顺序 = i18n.js 中源语言块的行分组顺序。"""
        keys = [k for g in self.f.layout if g for k in g]  # g 为 None 表示空行
        for k in self.f.blocks.get(self.src, {}):
            if k not in keys:
                keys.append(k)
        return keys

    def src_block(self):
        return self.f.blocks.get(self.src, {})

    # ---------------- pull ----------------
    def cmd_pull(self, force=False):
        title('pull：i18n.js 繁中块 → content/zh.csv')
        if os.path.exists(self.csv_path) and not force:
            log(f'  ⚠ content/zh.csv 已存在，pull 会覆盖它。', 'Y')
            log(f'    若你已在 CSV 里改过文案，请改用 status / run，不要 pull。')
            log(f'    确认要覆盖请加 --force')
            return 1
        data = self.src_block()
        write_csv(self.csv_path, data, self.order)
        log(f'  ✓ 已写出 {len(data)} 条繁中文案 → {os.path.relpath(self.csv_path, SITE)}', 'G')
        return 0

    # ---------------- status ----------------
    def diff(self):
        """对比 CSV 与 i18n.js 的源语言，返回 added/changed/removed。"""
        csv_data = read_csv(self.csv_path)
        cur = self.src_block()
        added = [k for k in csv_data if k not in cur]
        removed = [k for k in cur if k not in csv_data]
        changed = [k for k in csv_data if k in cur and csv_data[k] != cur[k]]
        return csv_data, cur, added, changed, removed

    def cmd_status(self):
        title('status：对比 content/zh.csv 与 js/i18n.js')
        if not os.path.exists(self.csv_path):
            log('  ✗ 还没有 content/zh.csv，请先跑 pull', 'RED')
            return 1
        csv_data, cur, added, changed, removed = self.diff()

        log(f'  i18n.js 现有 {len(cur)} 条 | CSV {len(csv_data)} 条')
        log(f'  {C["G"]}新增 {len(added)}{C["R"]} | {C["Y"]}变更 {len(changed)}{C["R"]} | {C["RED"]}删除 {len(removed)}{C["R"]}')

        if changed:
            pmap = self._punct_map()
            punct = [k for k in changed
                     if cur.get(k) and normalize_punctuation(cur[k], pmap)[0] == csv_data[k]]
            real = [k for k in changed if k not in punct]
            if punct:
                log(f'\n  ── 仅标点变更 {len(punct)} 条（沿用现有译文，不重译）──', 'G')
                for k in punct[:40]:
                    log(f'    {C["DIM"]}{k}{C["R"]}')
                    log(f'      - {cur[k][:70]}')
                    log(f'      + {csv_data[k][:70]}', 'G')
            if real:
                log(f'\n  ── 变更（需重译三语）──', 'Y')
                for k in real[:40]:
                    log(f'    {C["DIM"]}{k}{C["R"]}')
                    log(f'      - {cur[k][:70]}')
                    log(f'      + {csv_data[k][:70]}', 'G')
                if len(real) > 40:
                    log(f'    … 另有 {len(real) - 40} 条')
        if added:
            log('\n  ── 新增（需翻译三语）──', 'G')
            for k in added[:40]:
                log(f'    {C["DIM"]}{k}{C["R"]}  {csv_data[k][:70]}')
            if len(added) > 40:
                log(f'    … 另有 {len(added) - 40} 条')
        if removed:
            log('\n  ── 删除（CSV 中已移除）──', 'RED')
            for k in removed[:20]:
                log(f'    {k}')
        if not (added or changed or removed):
            log('\n  ✓ 完全一致，无需翻译', 'G')
        return 0

    # ---------------- check ----------------
    def cmd_check(self, fix=False):
        title('check：文案体检')
        problems = 0

        # 1) 简体检测（红线规则）
        csv_data = read_csv(self.csv_path) if os.path.exists(self.csv_path) else {}
        target = csv_data or self.src_block()
        simp = []
        if not detection_available():
            # 无 opencc 词典时 to_traditional 会静默空转 → 必须显式失败，禁止假绿
            problems += 1
            log(f'  {C["RED"]}✗ opencc 词典不可用：简体检测被禁用（红线无法保证）{C["R"]}')
            log('    请用带 opencc 的解释器运行：sync.command，或', 'DIM')
            log('    ~/.workbuddy/binaries/python/envs/default/bin/python tools/i18n.py check', 'DIM')
        for k, v in target.items():
            if not v:
                continue
            conv, changed = to_traditional(
                v, self.rules.get('opencc_config', 's2t'),
                exceptions=self.rules.get('conversion_exceptions'),
                protect=self.rules.get('protect_phrases'),
                corrections=self.rules.get('post_corrections', DEFAULT_CORRECTIONS),
                aggressive=self.rules.get('aggressive', False))
            if changed:
                simp.append((k, v, conv))
        if simp:
            problems += len(simp)
            log(f'  {C["RED"]}✗ 发现 {len(simp)} 条简体中文（红线：i18n 内禁止简体）{C["R"]}')
            for k, v, conv in simp[:15]:
                log(f'    {C["DIM"]}{k}{C["R"]}')
                log(f'      简: {v[:70]}')
                log(f'      →繁: {conv[:70]}', 'G')
            if fix:
                for k, v, conv in simp:
                    csv_data[k] = conv
                write_csv(self.csv_path, csv_data, self.order)
                log(f'  ✓ 已自动转为繁体并写回 CSV（{len(simp)} 条）', 'G')
                problems -= len(simp)
            else:
                log('    修正：python3 tools/i18n.py check --fix', 'DIM')
        elif detection_available():
            log('  ✓ 无简体中文', 'G')
        else:
            log('    （检测被禁用，见上方报错）', 'DIM')

        # 1.5) 标点规范（如「」 → 『』）
        pmap = self.rules.get('punctuation_map', DEFAULT_PUNCTUATION)
        pbad = []
        for k, v in target.items():
            if not v:
                continue
            conv, changed = normalize_punctuation(v, pmap)
            if changed:
                pbad.append((k, v, conv))
        if pbad:
            log(f'  {C["RED"]}✗ 发现 {len(pbad)} 条标点不合规范（{self._punct_desc(pmap)}）{C["R"]}')
            for k, v, conv in pbad[:15]:
                log(f'    {C["DIM"]}{k}{C["R"]}')
                log(f'      - {v[:70]}')
                log(f'      + {conv[:70]}', 'G')
            if fix:
                for k, v, conv in pbad:
                    csv_data[k] = conv
                write_csv(self.csv_path, csv_data, self.order)
                log(f'  ✓ 已自动规范化并写回 CSV（{len(pbad)} 条）', 'G')
            else:
                problems += len(pbad)
                log('    修正：python3 tools/i18n.py check --fix', 'DIM')
        else:
            log(f'  ✓ 标点规范（{self._punct_desc(pmap)}）', 'G')

        # 2) 四语 key 完整性
        base = set(target.keys())
        for lang in self.targets:
            blk = self.f.blocks.get(lang, {})
            miss = base - set(blk)
            # 只统计「源语言有值、目标语言却空」的真空缺；
            # 源语言本身为空的（有意留空的条目）不算问题
            empty = [k for k in blk
                     if target.get(k, '').strip() and not blk.get(k, '').strip()]
            if miss:
                problems += len(miss)
                log(f'  {C["RED"]}✗ {lang} 缺 {len(miss)} 个 key{C["R"]}: {list(miss)[:5]}')
            elif empty:
                problems += len(empty)
                log(f'  {C["Y"]}! {lang} 有 {len(empty)} 个待译空值{C["R"]}: {list(empty)[:5]}')
            else:
                both_empty = sum(1 for k in blk if not target.get(k, '').strip() and not blk.get(k, '').strip())
                extra = f'（另有 {both_empty} 条源文为空，有意留空）' if both_empty else ''
                log(f'  ✓ {lang} 完整（{len(blk)} keys）{extra}', 'G')

        # 3) 占位符一致性
        ph = re.compile(r'\{[^}]+\}|%[sdf]|{\d+}')
        ph_bad = []
        for k in base:
            if k not in csv_data and k not in self.src_block():
                continue
            src_ph = set(ph.findall(target.get(k, '')))
            if not src_ph:
                continue
            for lang in self.targets:
                v = self.f.blocks.get(lang, {}).get(k, '')
                if v and set(ph.findall(v)) != src_ph:
                    ph_bad.append((k, lang))
        if ph_bad:
            problems += len(ph_bad)
            log(f'  {C["Y"]}! {len(ph_bad)} 处占位符不一致{C["R"]}: {ph_bad[:5]}')
        else:
            log('  ✓ 占位符一致', 'G')

        log('')
        if problems:
            log(f'  ✗ 共 {problems} 处待处理', 'RED')
        else:
            log('  ✓ 全部检查通过', 'G')
        return 1 if problems else 0

    # ---------------- 待译清单 ----------------
    def build_pending(self):
        """算出需要翻译的条目（复用翻译记忆，已译过的不再花钱）。"""
        csv_data, cur, added, changed, removed = self.diff()
        tm = read_json(self.tm_path) or {}
        need = {}
        reused = {}
        punct_only = {}

        # 只改了标点（如「」→『』）的条目：译文不受影响，直接沿用，不重译
        pmap = self._punct_map()
        for k in list(changed):
            old = cur.get(k, '')
            new = csv_data[k]
            if old and normalize_punctuation(old, pmap)[0] == new:
                punct_only[k] = {l: self.f.blocks.get(l, {}).get(k, '')
                                 for l in self.targets}

        todo_keys = list(dict.fromkeys(added + changed))
        for k in todo_keys:
            if k in punct_only and all(punct_only[k].get(l) for l in self.targets):
                reused[k] = punct_only[k]
                continue
            zh = csv_data[k]
            hit = tm.get(zh)
            if hit and all(hit.get(l) for l in self.targets):
                reused[k] = hit
            else:
                need[k] = zh

        return {
            'csv_data': csv_data,
            'added': added, 'changed': changed, 'removed': removed,
            'need': need, 'reused': reused, 'punct_only': punct_only,
            'tm': tm,
        }

    def _context(self, key):
        """从 key 名推断分组，给译员一点上下文。"""
        m = re.match(r'^([a-z]+?)[_\d]', key)
        return m.group(1) if m else ''

    @staticmethod
    def _punct_desc(pmap):
        return '、'.join(f'{k}→{v}' for k, v in (pmap or {}).items())

    def _punct_map(self):
        return self.rules.get('punctuation_map', DEFAULT_PUNCTUATION)

    # ---------------- translate ----------------
    def cmd_translate(self, mode=None, export=False):
        title('translate：繁中 → 英/俄/乌兹')
        mode = mode or self.tcfg.get('mode', 'api')

        if not os.path.exists(self.csv_path):
            log('  ✗ 没有 content/zh.csv，请先 pull', 'RED')
            return 1

        # 先做简繁修正 + 标点规范化（都会就地写回 CSV）
        csv_data = read_csv(self.csv_path)
        if (self.rules.get('auto_simplified_to_traditional', True)
                and not detection_available()):
            log(f'  {C["Y"]}! 警告：opencc 词典不可用，简体→繁体自动修正被跳过{C["R"]}')
            log('    CSV 若含简体将不会被纠正，最终 check 会拦截失败。', 'DIM')
            log('    建议用 sync.command（自带 opencc）运行。', 'DIM')
        fixed = 0
        punct_fixed = 0
        pmap = self.rules.get('punctuation_map', DEFAULT_PUNCTUATION)
        for k, v in list(csv_data.items()):
            if not v:
                continue
            conv = v
            if self.rules.get('auto_simplified_to_traditional', True):
                conv, changed = to_traditional(
                    conv, self.rules.get('opencc_config', 's2t'),
                    exceptions=self.rules.get('conversion_exceptions'),
                    protect=self.rules.get('protect_phrases'),
                    corrections=self.rules.get('post_corrections', DEFAULT_CORRECTIONS),
                    aggressive=self.rules.get('aggressive', False))
                if changed:
                    fixed += 1
            conv, pchanged = normalize_punctuation(conv, pmap)
            if pchanged:
                punct_fixed += 1
            if conv != v:
                csv_data[k] = conv
        if fixed:
            write_csv(self.csv_path, csv_data, self.order)
            log(f'  ✓ 简体→繁体自动修正 {fixed} 条', 'G')
        if punct_fixed:
            write_csv(self.csv_path, csv_data, self.order)
            log(f'  ✓ 标点规范化 {punct_fixed} 条（{self._punct_desc(pmap)}）', 'G')

        st = self.build_pending()
        need, reused = st['need'], st['reused']
        po = st.get('punct_only', {})
        extra = f' | 仅改标点 {len(po)} 条' if po else ''
        log(f'  待译 {len(need)} 条 | 翻译记忆复用 {len(reused)} 条'
            f' | 删除 {len(st["removed"])} 条{extra}')

        if reused:
            for k, hit in reused.items():
                for lang in self.targets:
                    self.f.blocks.setdefault(lang, {})[k] = hit[lang]
            if po:
                log(f'  ✓ {len(po)} 条只改了标点，沿用现有译文（不重译）', 'G')
            rest = len(reused) - len(po)
            if rest > 0:
                log(f'  ✓ 已从翻译记忆填充 {rest} 条', 'G')

        if not need:
            if reused or st['removed']:
                self._apply_removed(st['csv_data'], st['removed'])
                self.f.save()
                log('  ✓ 已写回 i18n.js', 'G')
            else:
                log('  ✓ 无需翻译', 'G')
            return 0

        if mode == 'export':
            self._export_pending(need)
            return 0

        return self._translate_api(need, st)

    def _export_pending(self, need):
        items = []
        for k, zh in need.items():
            row = {'key': k, 'zh': zh, 'context': self._context(k)}
            for lang in self.targets:
                row[lang] = ''
            items.append(row)
        obj = {
            '_instruction': (
                '请把每条的 en / ru / uz 填好（繁中 zh 是原文，不要改）。'
                '规则：品牌名与缩写保持原样；用术语表的固定译法；'
                '保留 HTML 标签与占位符；俄文用西里尔字母，乌兹别克文用拉丁字母。'
                '填完后运行 python3 tools/i18n.py apply 回填。'
            ),
            'generated_at': datetime.datetime.now().isoformat(timespec='seconds'),
            'source_lang': self.src,
            'target_langs': self.targets,
            'glossary': self.glossary,
            'items': items,
        }
        write_json(self.pending_path, obj)
        log(f'\n  ✓ 已导出 {len(items)} 条待译清单 → {os.path.relpath(self.pending_path, SITE)}', 'G')
        log('    请让 AI 填写 en/ru/uz 字段，然后运行：python3 tools/i18n.py apply', 'CY')
        return 0

    def _translate_api(self, need, st):
        key = self.tcfg.get('api_key') or os.environ.get(self.tcfg.get('api_key_env', ''), '')
        if not key:
            # 没配 key 就自动降级成导出模式，保证流程不断在这里
            log('\n  ! 未配置 API key，自动改用「导出待译清单」模式', 'Y')
            log(f'    想全自动：在 tools/config.json 填 translate.api_key，'
                f'或 export {self.tcfg.get("api_key_env")}=sk-xxxx', 'DIM')
            self._export_pending(need)
            return 0

        base = self.tcfg.get('base_url', 'https://api.deepseek.com/v1').rstrip('/')
        model = self.tcfg.get('model', 'deepseek-chat')
        batch = int(self.tcfg.get('batch_size', 20))
        conc = int(self.tcfg.get('concurrency', 4))

        pairs = list(need.items())
        batches = [pairs[i:i + batch] for i in range(0, len(pairs), batch)]
        log(f'  调用 {model}｜{len(pairs)} 条分 {len(batches)} 批｜并发 {conc}')

        results, failed = {}, []
        done = [0]
        t0 = time.time()

        def work(idx_chunk):
            return idx_chunk

        with ThreadPoolExecutor(max_workers=conc) as ex:
            futs = {ex.submit(self._call_api, base, key, model, b): b for b in batches}
            for fu in as_completed(futs):
                b = futs[fu]
                try:
                    res = fu.result()
                except Exception as e:
                    log(f'  ✗ 批次失败: {e}', 'RED')
                    failed.extend([k for k, _ in b])
                    continue
                if res is None:
                    failed.extend([k for k, _ in b])
                    continue
                results.update(res)
                done[0] += len(b)
                log(f'  … 进度 {done[0]}/{len(pairs)} ({time.time()-t0:.0f}s)', 'DIM')

        if failed:
            log(f'\n  ✗ {len(failed)} 条翻译失败：{failed[:10]}', 'RED')
            if results:
                log('    已成功的部分仍会写回，失败的条目下次重跑会重试')
        if not results:
            return 1

        # 回填 + 更新翻译记忆
        tm = st['tm']
        for k, vals in results.items():
            for lang in self.targets:
                v = vals.get(lang, '')
                if v:
                    self.f.blocks.setdefault(lang, {})[k] = v
            if all(vals.get(l) for l in self.targets):
                tm[need.get(k, '')] = {l: vals[l] for l in self.targets}
        write_json(self.tm_path, tm)

        self._apply_removed(st['csv_data'], st['removed'])
        self.f.save()
        log(f'\n  ✓ 翻译完成 {len(results)} 条，已写回 {os.path.relpath(self.i18n_path, SITE)}', 'G')
        return 0

    def _call_api(self, base, key, model, batch):
        """调用 OpenAI 兼容接口翻译一批。返回 {key: {lang: text}}。"""
        payload_obj = {k: v for k, v in batch}
        gloss = self.glossary
        keep = ', '.join(gloss.get('keep_as_is', []))

        rules = [
            f'你是 HEYDAY GROUP（盛世前程）官网的专业本地化译员。',
            f'把下面 JSON 里的繁体中文文案，逐条翻译成 {len(self.targets)} 种语言：'
            + ', '.join(f'{l}（{LANG_NAMES.get(l, l)}）' for l in self.targets) + '。',
            '',
            '硬性规则：',
            f'1. 这些词保持原样，绝对不要翻译或音译：{keep}',
            '2. 术语固定译法（必须遵守）：',
        ]
        terms = gloss.get('terms', {})
        for zh_t, tr in list(terms.items())[:60]:
            rules.append(f'   「{zh_t}」→ ' + ' / '.join(f'{l}: {tr.get(l, "")}' for l in self.targets if tr.get(l)))
        rules += [
            '3. 保留原文的 HTML 标签、换行符、占位符（如 {xxx}、%s）与标点风格',
            '4. 不要添加原文没有的信息，不要写解释，不要改 key',
            '5. 语气专业、简洁，符合官网品牌调性；长度与原文相当',
            '6. 俄文用西里尔字母，乌兹别克文用乌兹别克斯坦现行拉丁字母',
            '',
            f'严格输出 JSON，格式：{{"translations": {{"<原文key>": {{'
            + ', '.join(f'"{l}": "译文"' for l in self.targets) + '}}}}}}',
            '',
            '待翻译原文（JSON）：',
            json.dumps(payload_obj, ensure_ascii=False),
        ]

        body = {
            'model': model,
            'messages': [{'role': 'user', 'content': '\n'.join(rules)}],
            'temperature': float(self.tcfg.get('temperature', 0.2)),
            'response_format': {'type': 'json_object'},
        }
        req = urllib.request.Request(
            base + '/chat/completions',
            data=json.dumps(body).encode('utf-8'),
            headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key},
        )
        last_err = None
        for attempt in range(int(self.tcfg.get('max_retries', 3))):
            try:
                with urllib.request.urlopen(req, timeout=int(self.tcfg.get('timeout', 120))) as r:
                    data = json.loads(r.read().decode('utf-8'))
                content = data['choices'][0]['message']['content']
                obj = json.loads(content)
                trs = obj.get('translations', obj)
                out = {}
                for k, _ in batch:
                    v = trs.get(k)
                    if isinstance(v, dict):
                        out[k] = {l: str(v.get(l, '') or '') for l in self.targets}
                    elif isinstance(v, str):
                        out[k] = {self.targets[0]: v}
                if out:
                    return out
                last_err = '返回为空'
            except Exception as e:
                last_err = e
                detail = ''
                if isinstance(e, urllib.error.HTTPError):
                    try:
                        detail = e.read().decode('utf-8', 'replace')[:200]
                    except Exception:
                        pass
                last_err = f'{e} {detail}'
                time.sleep(2 * (attempt + 1))
        raise RuntimeError(str(last_err))

    # ---------------- 删除同步 ----------------
    def _apply_removed(self, csv_data, removed):
        """CSV 中删掉的 key，从四语块中一并移除。"""
        for k in removed:
            for lang in self.all_langs:
                self.f.blocks.get(lang, {}).pop(k, None)
        # 同步源语言块的新值（含新增 key）
        for k, v in csv_data.items():
            self.f.blocks.setdefault(self.src, {})[k] = v

    # ---------------- apply ----------------
    def cmd_apply(self):
        title('apply：回填 content/pending.json 的译文')
        obj = read_json(self.pending_path)
        if not obj:
            log('  ✗ 没有 content/pending.json，请先跑 translate --export', 'RED')
            return 1
        items = obj.get('items', [])
        filled, skipped = 0, 0
        tm = read_json(self.tm_path) or {}

        for it in items:
            k, zh = it.get('key'), it.get('zh', '')
            vals = {l: (it.get(l) or '').strip() for l in self.targets}
            if not any(vals.values()):
                skipped += 1
                continue
            for lang in self.targets:
                if vals[lang]:
                    self.f.blocks.setdefault(lang, {})[k] = vals[lang]
            if all(vals.get(l) for l in self.targets):
                tm[zh] = {l: vals[l] for l in self.targets}
            # 源语言同步
            if zh:
                self.f.blocks.setdefault(self.src, {})[k] = zh
            filled += 1

        write_json(self.tm_path, tm)
        self.f.save()
        log(f'  ✓ 回填 {filled} 条，跳过 {skipped} 条（未填）', 'G')
        log(f'  ✓ 已写入 {os.path.relpath(self.i18n_path, SITE)}', 'G')
        # 归档 pending
        if os.path.exists(self.pending_path):
            arc = self.pending_path.replace('.json', '_done.json')
            write_json(arc, obj)
            os.remove(self.pending_path)
            log(f'  ✓ 待译清单已归档 → {os.path.relpath(arc, SITE)}', 'DIM')
        return 0

    # ---------------- run ----------------
    def cmd_run(self, mode=None):
        title('run：一键同步（status → 简繁修正 → 翻译 → 回填 → 校验）')
        self.cmd_status()
        rc = self.cmd_translate(mode=mode)
        if rc == 0:
            self.cmd_check()
        return rc


# --------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(
        description='HEYDAY 多语言文案工作流（繁中为唯一来源）',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    ap.add_argument('cmd', choices=['pull', 'status', 'check', 'translate', 'apply', 'run', 'glossary'])
    ap.add_argument('--force', action='store_true', help='pull 时覆盖已有 CSV')
    ap.add_argument('--fix', action='store_true', help='check 时自动把简体转成繁体')
    ap.add_argument('--auto', action='store_true', help='translate 走 API 模式')
    ap.add_argument('--export', action='store_true', help='translate 只导出待译清单')
    ap.add_argument('--config', default=DEFAULT_CONFIG)
    args = ap.parse_args()

    wf = Workflow(args.config)

    if args.cmd == 'pull':
        return wf.cmd_pull(force=args.force)
    if args.cmd == 'status':
        return wf.cmd_status()
    if args.cmd == 'check':
        return wf.cmd_check(fix=args.fix)
    if args.cmd == 'translate':
        mode = 'export' if args.export else ('api' if args.auto else None)
        return wf.cmd_translate(mode=mode)
    if args.cmd == 'apply':
        return wf.cmd_apply()
    if args.cmd == 'glossary':
        g = wf.glossary
        log(f'keep_as_is（{len(g.get("keep_as_is", []))}）: {", ".join(g.get("keep_as_is", []))}')
        log(f'terms（{len(g.get("terms", {}))}）:')
        for k, v in g.get('terms', {}).items():
            log(f'  {k} → ' + ' / '.join(f'{l}:{v.get(l)}' for l in ['en', 'ru', 'uz'] if v.get(l)))
        log(f'\n编辑术语表：{wf.glossary_path}')
        return 0
    if args.cmd == 'run':
        mode = 'export' if args.export else None
        return wf.cmd_run(mode=mode)
    return 1


if __name__ == '__main__':
    sys.exit(main())
