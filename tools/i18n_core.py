#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
i18n_core — HEYDAY 多语言文案工作流核心库

职责：
  1. 解析 js/i18n.js 里的 I18N 字典（JS 对象字面量，非标准 JSON）
  2. 无损重建字典（保留文件头注释与尾部逻辑代码）
  3. 繁简检测与转换（opencc）
  4. 读写 CSV 文案表

设计要点：
  - 解析用「状态机剥离注释 + 正则提取」，能正确处理字符串里的 // 和引号转义
  - 重建沿用源语言块的行分组结构，保证四语块排版一致、diff 友好
"""
import csv
import json
import os
import re
from typing import Dict, List, Optional, Tuple

try:
    from opencc import OpenCC
except ImportError:  # pragma: no cover
    OpenCC = None

_OPENCC = {}
_CHAR_MAP = None

# 简→繁的例外字：这些字在繁体中本身就是标准/常用写法，
# opencc 会把它们转成异体字或改变词义，反而更糟。
# （以站内已人工校对的繁体文案为基准实测得出）
DEFAULT_EXCEPTIONS = ['群', '台']

# 转换后校正表：opencc 纯字形映射会产出的异体或非标准繁体写法，统一回正
DEFAULT_CORRECTIONS = {
    '聯系': '聯\u7d61',   # 联系 → 联络（繁体标准）
    '爲': '為',           # 爲是異體，標準用「為」
}

# 标点规范：全站统一用『』做引號，不用「」
DEFAULT_PUNCTUATION = {
    '「': '『',
    '」': '』',
}


def _load_char_map():
    """加载 OpenCC 的纯字符映射表 STCharacters.txt。

    与 OpenCC('s2t') 的区别：s2t 还会做词汇级替换（STPhrases），
    会把「一家」转成「一傢」、「人群」转成「人羣」这类异体字，属误伤。
    纯字符映射只处理字形，不动词汇，误报极低。
    """
    global _CHAR_MAP
    if _CHAR_MAP is not None:
        return _CHAR_MAP
    _CHAR_MAP = {}
    try:
        import opencc, os
        dic = os.path.join(os.path.dirname(opencc.__file__), 'dictionary', 'STCharacters.txt')
        with open(dic, encoding='utf-8') as f:
            for line in f:
                parts = line.rstrip('\n').split('\t')
                if len(parts) >= 2 and parts[1].strip():
                    _CHAR_MAP[parts[0]] = parts[1].split()[0]
    except Exception:
        _CHAR_MAP = {}
    return _CHAR_MAP


def get_converter(cfg_name: str = "s2t"):
    """获取 opencc 简→繁转换器（带缓存）。仅 --aggressive 模式使用。"""
    if OpenCC is None:
        return None
    if cfg_name not in _OPENCC:
        try:
            _OPENCC[cfg_name] = OpenCC(cfg_name)
        except Exception:
            return None
    return _OPENCC[cfg_name]


# --------------------------------------------------------------------------
# JS 对象字面量解析
# --------------------------------------------------------------------------

def strip_comments(src: str) -> str:
    """状态机剥离 // 与 /* */ 注释，字符串内的注释符号不处理。

    注释内容用等长空格替换，保持字符偏移不变，方便定位。
    """
    out = list(src)
    i, n = 0, len(src)
    state = None  # None | 'sq' | 'dq' | 'line' | 'block'
    while i < n:
        ch = src[i]
        nxt = src[i + 1] if i + 1 < n else ''

        if state is None:
            if ch == '/' and nxt == '/':
                state = 'line'
                out[i] = out[i + 1] = ' '
                i += 2
                continue
            if ch == '/' and nxt == '*':
                state = 'block'
                out[i] = out[i + 1] = ' '
                i += 2
                continue
            if ch == "'":
                state = 'sq'
            elif ch == '"':
                state = 'dq'
            i += 1
            continue

        if state == 'sq':
            if ch == '\\':
                i += 2
                continue
            if ch == "'":
                state = None
            i += 1
            continue

        if state == 'dq':
            if ch == '\\':
                i += 2
                continue
            if ch == '"':
                state = None
            i += 1
            continue

        if state == 'line':
            if ch == '\n':
                state = None
            else:
                out[i] = ' '
            i += 1
            continue

        if state == 'block':
            if ch == '*' and nxt == '/':
                out[i] = out[i + 1] = ' '
                state = None
                i += 2
                continue
            if ch != '\n':
                out[i] = ' '
            i += 1
            continue

    return ''.join(out)


def find_matching_brace(text: str, open_idx: int) -> int:
    """给定 '{' 的位置，返回配对的 '}' 索引（字符串/注释已预先剥离）。"""
    depth = 0
    i, n = open_idx, len(text)
    while i < n:
        ch = text[i]
        if ch == "'" or ch == '"':
            q = ch
            i += 1
            while i < n:
                if text[i] == '\\':
                    i += 2
                    continue
                if text[i] == q:
                    break
                i += 1
        elif ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError("未找到匹配的 }")


_PAIR_RE = re.compile(
    r"""(?P<key>[A-Za-z_$][\w$]*|'[^']*'|"[^"]*")\s*:\s*(?P<val>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")""",
    re.DOTALL,
)


def unquote(raw: str) -> str:
    """把带引号的 JS 字符串还原成 Python 字符串。"""
    q = raw[0]
    body = raw[1:-1]
    body = body.replace('\\' + q, q)
    body = body.replace('\\n', '\n').replace('\\t', '\t').replace('\\r', '\r')
    body = body.replace('\\\\', '\\')
    return body


def requote(val: str, prefer: Optional[str] = None) -> str:
    """把 Python 字符串安全写成 JS 字符串字面量。

    prefer 为原文件该条目使用的引号（"'" 或 '"'），重建时尽量复用，
    这样未改动的条目不会产生任何 diff。
    """
    def sq(v: str) -> str:
        return "'" + v.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"

    def dq(v: str) -> str:
        return '"' + v.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n') + '"'

    if prefer == '"':
        return dq(val)   # 原文用双引号就继续用双引号，内部的 " 转义即可
    if prefer == "'":
        return sq(val)
    # 未指定风格时，选不需要转义的那种，可读性更好
    if "'" in val and '"' not in val:
        return dq(val)
    if '"' in val and "'" not in val:
        return sq(val)
    return sq(val)


def parse_object_block(body: str) -> Tuple[Dict[str, str], List, Dict[str, str]]:
    """解析一个语言块的正文。

    返回 (成员字典, 行布局, 引号风格)。
      行布局  = [['k1','k2'], None, ['k3'], ...]，None 代表一个空行（原文件的视觉分组）
      引号风格= {key: "'"|'"'}，重建时复用，避免制造无谓的 diff
    """
    members: Dict[str, str] = {}
    layout: List = []
    line_keys: Dict[int, List[str]] = {}
    quote_style: Dict[str, str] = {}

    for m in _PAIR_RE.finditer(body):
        raw_key = m.group('key')
        key = raw_key[1:-1] if raw_key[0] in "'\"" else raw_key
        if key in members:
            continue
        raw_val = m.group('val')
        members[key] = unquote(raw_val)
        quote_style[key] = raw_val[0]
        line_no = body.count('\n', 0, m.start())
        line_keys.setdefault(line_no, []).append(key)

    if line_keys:
        body_lines = body.split('\n')
        for ln in range(max(line_keys.keys()) + 1):
            if ln in line_keys:
                layout.append(line_keys[ln])
            elif ln < len(body_lines) and not body_lines[ln].strip():
                layout.append(None)  # 空行：保留原文件的分组观感

    # 块内容第一行是 '{' 之后的换行，那一行空行由 '{' 自带，不能重复输出
    while layout and layout[0] is None:
        layout.pop(0)
    return members, layout, quote_style


# --------------------------------------------------------------------------
# I18N 文件读写
# --------------------------------------------------------------------------

class I18NFile:
    """js/i18n.js 的解析器与重建器。"""

    def __init__(self, path: str, dict_var: str = "I18N", sections: Optional[List[dict]] = None):
        self.path = path
        self.dict_var = dict_var
        # sections: [{"path": "", "type": "flat"}, ...] 预留多站点扩展
        self.sections = sections or [{"path": "", "type": "flat"}]
        self.raw = self._read(path)
        self.head = ""
        self.tail = ""
        self.blocks: Dict[str, Dict[str, str]] = {}       # lang -> {key: value}
        self.layout: List[List[str]] = []                 # 源语言块的行分组
        self.layouts: Dict[str, List] = {}                # lang -> 该块自己的行布局
        self.block_comments: Dict[str, str] = {}          # lang -> 块前注释
        self.quote_styles: Dict[str, Dict[str, str]] = {} # lang -> {key: 引号}
        self.lang_order: Optional[List[str]] = None       # 重建时的语言顺序
        self.decl_start = 0
        self._parse()

    # -- 基础 IO --
    @staticmethod
    def _read(path: str) -> str:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

    def save(self, path: Optional[str] = None, backup: bool = True) -> str:
        """重建并写回文件。返回写入路径。"""
        target = path or self.path
        if backup and os.path.exists(target):
            bak = target + '.bak'
            with open(bak, 'w', encoding='utf-8') as f:
                f.write(self._read(target))
        text = self.render()
        with open(target, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        return target

    # -- 解析 --
    def _parse(self):
        src = strip_comments(self.raw)
        # 优先匹配 `var I18N = {`，其次回退到 `I18N = {`
        m = re.search(r'\b(?:var|const|let)\s+' + re.escape(self.dict_var) + r'\s*=\s*\{', src)
        if not m:
            m = re.search(r'\b' + re.escape(self.dict_var) + r'\s*=\s*\{', src)
        if not m:
            raise ValueError(f"在 {self.path} 中找不到 `var {self.dict_var} = {{`")

        self.decl_start = m.start()
        open_idx = m.end() - 1
        close_idx = find_matching_brace(src, open_idx)
        dict_body = src[open_idx + 1:close_idx]
        raw_body_start = open_idx + 1  # strip_comments 等长替换，偏移可直接映射回原文

        self.head = self.raw[:self.decl_start].rstrip()
        self.tail = self.raw[close_idx + 1:]  # 以 ';' 开头

        # 逐个语言块解析
        for lm in re.finditer(r'(?m)^(?P<ind>[ \t]*)(?P<lang>[A-Za-z_$][\w$]*)\s*:\s*\{', dict_body):
            name = lm.group('lang')
            if name in ('LANGS', 'HTML_LANG'):  # 结构字段，跳过
                continue
            b_open = lm.end() - 1
            b_close = find_matching_brace(dict_body, b_open)
            members, layout, qstyle = parse_object_block(dict_body[b_open + 1:b_close])
            if not members:
                continue
            self.blocks[name] = members
            self.quote_styles[name] = qstyle
            self.layouts[name] = layout
            # 块前注释：strip_comments 后注释已变空格，须从原文等长区间取回
            raw_prefix = self.raw[raw_body_start:raw_body_start + lm.start()]
            cm = re.search(r'/\*(?:(?!\*/).)*\*/\s*$', raw_prefix, re.DOTALL)
            if cm:
                self.block_comments[name] = cm.group(0).strip()

        if not self.blocks:
            raise ValueError("未解析到任何语言块")

        # 行分组以源语言块为准（决定重建时的排版）
        src_lang = self._guess_source_lang()
        lm = re.search(r'(?m)^(?P<ind>[ \t]*)' + re.escape(src_lang) + r'\s*:\s*\{', dict_body)
        if lm:
            b_open = lm.end() - 1
            b_close = find_matching_brace(dict_body, b_open)
            _, self.layout, _ = parse_object_block(dict_body[b_open + 1:b_close])

    def _guess_source_lang(self) -> str:
        for cand in ('zh', 'zh-Hant', 'zh_Hant'):
            if cand in self.blocks:
                return cand
        return list(self.blocks.keys())[0]

    # -- 重建 --
    def render(self) -> str:
        src_lang = self._guess_source_lang()
        layout = self.layout or [[k] for k in self.blocks.get(src_lang, {})]
        # layout 里的 None 代表空行，展平时跳过
        all_keys = [k for group in layout if group for k in group]

        # 补齐 layout 之外的 key（新增的 key 挂到最后）
        known = set(all_keys)
        extra = [k for k in self.blocks.get(src_lang, {}) if k not in known]
        if extra:
            layout = layout + [extra]
            all_keys.extend(extra)

        out = [self.head, '', '  var ' + self.dict_var + ' = {']

        # 语言顺序：源语言优先，其余按 lang_order（若提供）
        if self.lang_order:
            lo = [l for l in self.lang_order if l in self.blocks]
            rest = [l for l in self.blocks if l not in lo]
            ordered = lo + rest
        else:
            ordered = [src_lang] + [l for l in self.blocks if l != src_lang]

        for bi, lang in enumerate(ordered):
            if bi > 0:
                out.append('')  # 语言块之间的空行（第一个块紧跟 `var I18N = {`）
            members = self.blocks[lang]
            qstyle = self.quote_styles.get(lang, {})
            if lang in self.block_comments:
                out.append('    ' + self.block_comments[lang])
            out.append(f'    {lang}: {{')

            # 每个语言块沿用自己原本的行排版，保证未改动的块零 diff。
            # 该语言有、而排版里没有的 key（新增的）追加到末尾。
            lay = self.layouts.get(lang) or layout
            in_lay = {k for g in lay if g for k in g}
            extra_keys = [k for k in members if k not in in_lay]
            if extra_keys:
                lay = list(lay) + [extra_keys]

            # None 表示该位置是原文件里的空行（视觉分组），原样保留
            rendered = [None if g is None else
                        ', '.join(f'{k}: {requote(members.get(k, ""), qstyle.get(k))}' for k in g)
                        for g in lay]
            last_i = max((i for i, g in enumerate(rendered) if g is not None), default=-1)
            for i, g in enumerate(rendered):
                out.append('' if g is None else '      ' + g + ('' if i == last_i else ','))

            out.append('    }' + (',' if bi < len(ordered) - 1 else ''))

        out.append('  }')
        # tail 以 ';' 开头，直接拼接
        return '\n'.join(out) + self.tail


# --------------------------------------------------------------------------
# 繁简处理
# --------------------------------------------------------------------------

def to_traditional(text: str, cfg: str = "s2t",
                   exceptions: Optional[List[str]] = None,
                   protect: Optional[List[str]] = None,
                   corrections: Optional[Dict[str, str]] = None,
                   aggressive: bool = False) -> Tuple[str, bool]:
    """简体→繁体。返回 (转换后文本, 是否发生了变化)。

    保守路径（默认）= 词组保护 + 纯字符映射 + 例外字：
      - protect：整词豁免。音译地名（馬德里、塔什干）与名词（風采）
        里的「里/干/采」若按单字转换会变成 裏/幹/採，属误伤，故整词跳过。
      - 纯字符映射：只换字形，不做 opencc 的词汇级替换，
        避免「一家→一傢」「人群→人羣」这类异体字误伤。
      - exceptions：单字豁免（群、台）。

    aggressive=True 时用 opencc 完整 s2t（含词汇转换），
    适合整段简体原文的一次性大批量转换。
    """
    if not text:
        return text, False

    if aggressive:
        cc = get_converter(cfg)
        if cc is None:
            return text, False
        conv = cc.convert(text)
        return conv, conv != text

    cmap = _load_char_map()
    if not cmap:  # 词典不可用时回退到 opencc
        cc = get_converter(cfg)
        if cc is None:
            return text, False
        conv = cc.convert(text)
        return conv, conv != text

    original = text  # 比较基准：占位符替换会改写 text，须先留存原文

    # 1) 词组保护：先把整词挖成占位符
    slots = {}
    if protect:
        for i, ph in enumerate(protect):
            if ph and ph in text:
                token = '\x00%d\x00' % i
                slots[token] = ph
                text = text.replace(ph, token)

    # 2) 纯字符映射（跳过例外字）
    exc = set(exceptions if exceptions is not None else DEFAULT_EXCEPTIONS)
    out = ''.join(c if (c in exc or c not in cmap) else cmap[c] for c in text)

    # 3) 还原被保护的词组
    for token, ph in slots.items():
        out = out.replace(token, ph)

    # 4) 转换后校正：opencc 会产出一些异体/非标准写法，统一回正。
    #    仅在「确实发生了转换」时才校正 —— 否则会把存量文案里的「爲」也改成「為」，
    #    凭空制造差异、触发不必要的重译。
    if corrections and out != original:
        for wrong, right in corrections.items():
            if wrong in out:
                out = out.replace(wrong, right)

    return out, out != original


def detection_available() -> bool:
    """简体→繁体转换能力是否可用（opencc 词典或转换器就绪）。

    i18n 全链路依赖 opencc 才能做简体检测/自动修正。若不可用（例如
    用未装 opencc 的裸 python 运行），detection/to_traditional 会静默
    空转并误报全绿 —— 调用方（i18n.py）应据此显式报错，而非假通过。
    """
    return bool(_load_char_map()) or get_converter() is not None


def normalize_punctuation(text: str, mapping: Optional[Dict[str, str]] = None
                          ) -> Tuple[str, bool]:
    """按术语/排版规范统一标点（如「」 → 『』）。返回 (规范化后文本, 是否变化)。

    映射表来自 config.json 的 rules.punctuation_map。
    """
    if not text:
        return text, False
    mapping = mapping or DEFAULT_PUNCTUATION
    if not mapping:
        return text, False
    original = text
    for src, dst in mapping.items():
        if src and src in text:
            text = text.replace(src, dst)
    return text, text != original


# --------------------------------------------------------------------------
# CSV 文案表
# --------------------------------------------------------------------------

def read_csv(path: str) -> Dict[str, str]:
    """读取两列文案表 key,zh（首行为表头）。"""
    data = {}
    if not os.path.exists(path):
        return data
    with open(path, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.reader(f)
        header_seen = False
        for row in reader:
            if not row or not row[0].strip():
                continue
            if not header_seen:
                header_seen = True
                if row[0].strip().lower() in ('key', '鍵', 'id'):
                    continue
            key = row[0].strip()
            val = row[1] if len(row) > 1 else ''
            # CSV 里的 \n 字面量还原成真换行
            val = val.replace('\\n', '\n')
            data[key] = val
    return data


def write_csv(path: str, data: Dict[str, str], order: Optional[List[str]] = None):
    """写入两列文案表 key,zh。"""
    os.makedirs(os.path.dirname(os.path.abspath(path)) or '.', exist_ok=True)
    keys = order if order else list(data.keys())
    keys = [k for k in keys if k in data]
    for k in data:
        if k not in keys:
            keys.append(k)
    with open(path, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(['key', 'zh'])
        for k in keys:
            v = (data[k] or '').replace('\n', '\\n')
            w.writerow([k, v])


def read_json(path: str):
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def write_json(path: str, obj):
    os.makedirs(os.path.dirname(os.path.abspath(path)) or '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
