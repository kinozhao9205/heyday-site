/*! HEYDAY 訪問線路切換（國內阿里雲 / 海外 GitHub Pages）
 *  三站通用組件：官網 heyday-site、AI 創意站 video-site、推廣視頻站 shengshi-videos
 *
 *  目標：客戶感覺卡頓時，一鍵切到另一條線路；切換後停留在【同一頁面、同一位置】，
 *        並保留當前語言，讓客戶察覺不到「換了服務器」。
 *
 *  做法：
 *   1) 點擊懸浮球 → 選「國內節點 / 海外節點 / 自動」
 *   2) 把「當前滾動位置 + 當前語言」放進 URL 帶過去
 *      （bydtyr.com 與 github.io 屬不同域，localStorage/sessionStorage 無法共享）
 *   3) 落地頁立刻用 history.replaceState 抹掉這些參數，地址欄不留痕跡
 *   4) 離場淡出 + 入場淡入，形成一次連續溶接，避免「白屏／跳頁」感
 *   5) 偏好寫入 localStorage，routeByRegion() 據此決定導航連結指向哪一側
 *
 *  依賴：各站 i18n 會更新 <html lang>，本組件據此切換文案（無需改動各站翻譯字典）。
 */
(function () {
  'use strict';

  var PREF_KEY = 'heyday_node_pref';   // auto | cn | os
  var POS_KEY = 'heyday_hop_pos';      // 同域切換時的滾動位置備份
  var HINT_KEY = 'heyday_node_hint';   // 首次訪問提示只顯示一次

  var HOST = (location.hostname || '').toLowerCase();
  var PATH = location.pathname || '';
  var IS_GH = /(^|\.)github\.io$/.test(HOST);

  /* 三站在兩種線路下的入口地址 */
  var NODES = {
    official: { cn: 'https://heydaygroup.bydtyr.com/', os: 'https://kinozhao9205.github.io/heyday-site/' },
    ai: { cn: 'http://video.bydtyr.com/', os: 'https://kinozhao9205.github.io/heyday-videos/' },
    promo: { cn: 'https://tuiguang.bydtyr.com/', os: 'https://kinozhao9205.github.io/shengshi-videos/' }
  };

  var L10N = {
    zh: {
      title: '訪問線路', now: '目前',
      auto: '自動選擇', autoSub: '依訪問地區',
      cn: '國內節點', cnSub: '阿里雲 · 大陸',
      os: '海外節點', osSub: 'GitHub · 海外',
      tip: '點此切換訪問線路', done: '已切換線路', aria: '切換訪問線路'
    },
    en: {
      title: 'Access route', now: 'Now',
      auto: 'Automatic', autoSub: 'By region',
      cn: 'China node', cnSub: 'Aliyun · Mainland',
      os: 'Global node', osSub: 'GitHub · Overseas',
      tip: 'Switch access route', done: 'Route switched', aria: 'Switch access route'
    },
    uz: {
      title: "Ulanish yo'li", now: 'Joriy',
      auto: 'Avtomatik', autoSub: 'Hududga qarab',
      cn: 'Xitoy serveri', cnSub: 'Aliyun · Materik',
      os: 'Xorij serveri', osSub: 'GitHub · Xorij',
      tip: "Ulanish yo'lini almashtirish", done: "Yo'l almashtirildi", aria: "Ulanish yo'lini almashtirish"
    }
  };

  /* ---------- 小工具 ---------- */
  function siteId() {
    if (/tuiguang\.bydtyr\.com/.test(HOST)) return 'promo';
    if (/video\.bydtyr\.com/.test(HOST)) return 'ai';
    if (/heydaygroup\.bydtyr\.com/.test(HOST)) return 'official';
    if (/shengshi-videos/.test(PATH)) return 'promo';
    if (/heyday-videos|\/video-site\//.test(PATH)) return 'ai';
    return 'official';
  }

  function curNode() { return IS_GH ? 'os' : 'cn'; }

  function readPref() {
    try {
      var v = localStorage.getItem(PREF_KEY);
      return (v === 'cn' || v === 'os') ? v : 'auto';
    } catch (e) { return 'auto'; }
  }

  function writePref(v) {
    try {
      if (v === 'auto') localStorage.removeItem(PREF_KEY);
      else localStorage.setItem(PREF_KEY, v);
    } catch (e) { /* 隱私模式等，忽略 */ }
  }

  function curLang() {
    var l = (document.documentElement.lang || 'en').toLowerCase();
    if (l.indexOf('zh') === 0) return 'zh';
    if (l.indexOf('uz') === 0) return 'uz';
    return 'en';
  }

  function txt() { return L10N[curLang()] || L10N.en; }

  function nodeName(t, n) { return n === 'os' ? t.os : t.cn; }

  /* 當前語言在該站 i18n 中的代碼（各站不同：en / zh-Hant / zh / uz） */
  function langCode() {
    var b = document.querySelector('[data-lang-btn].active');
    if (b) return b.getAttribute('data-lang-btn') || '';
    return document.documentElement.lang || '';
  }

  /* ---------- URL 參數（承接上一頁帶來的語言 / 位置 / 標記） ---------- */
  var Q = (function () {
    var o = {}, s = (location.search || '').replace(/^\?/, '');
    if (!s) return o;
    s.split('&').forEach(function (kv) {
      var i = kv.indexOf('='), k = i < 0 ? kv : kv.slice(0, i);
      if (!k) return;
      o[k] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1));
    });
    return o;
  })();

  var INCOMING_HOP = Q.hop === '1';
  var INCOMING_LANG = Q.hl || '';
  var INCOMING_Y = parseInt(Q.y, 10) || 0;

  /* 參數用完即抹掉，地址欄保持乾淨，客戶看不出「換站」痕跡 */
  if (Q.hop || Q.hl || Q.y) {
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
  }

  /* ---------- 構建組件 ---------- */
  var wrap = document.createElement('div');
  wrap.className = 'node-switcher';
  wrap.id = 'nodeSwitcher';
  wrap.innerHTML = [
    '<div class="node-label" aria-hidden="true"></div>',
    '<div class="node-panel" role="dialog" aria-modal="false">',
    '  <div class="node-head">',
    '    <span class="node-head-title"></span>',
    '    <span class="node-head-now"><i class="node-live"></i><b></b></span>',
    '  </div>',
    '  <button type="button" class="node-opt" data-node="auto"><span class="no-dot"></span><span class="no-txt"></span><span class="no-sub"></span></button>',
    '  <button type="button" class="node-opt" data-node="cn"><span class="no-dot"></span><span class="no-txt"></span><span class="no-sub"></span></button>',
    '  <button type="button" class="node-opt" data-node="os"><span class="no-dot"></span><span class="no-txt"></span><span class="no-sub"></span></button>',
    '</div>',
    '<button type="button" class="node-ball" id="nodeBall" aria-haspopup="dialog" aria-expanded="false">',
    '  <svg class="node-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">',
    '    <path d="M4 8h13l-3.4-3.4"/><path d="M20 16H7l3.4 3.4"/>',
    '  </svg>',
    '</button>',
    '<div class="node-toast" id="nodeToast" role="status" aria-live="polite"></div>'
  ].join('');
  document.body.appendChild(wrap);

  var $ = function (sel) { return wrap.querySelector(sel); };
  var ball = $('#nodeBall');
  var label = $('.node-label');
  var toast = $('#nodeToast');
  var opts = Array.prototype.slice.call(wrap.querySelectorAll('.node-opt'));

  var toastTimer = null;
  function showToast(msg, ms) {
    toast.textContent = msg;
    wrap.classList.add('toast-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { wrap.classList.remove('toast-on'); }, ms || 1800);
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var t = txt();
    var pref = readPref();
    var node = curNode();

    wrap.setAttribute('data-node', node);
    ball.setAttribute('aria-label', t.aria);
    ball.title = t.tip;
    label.textContent = nodeName(t, node);

    $('.node-head-title').textContent = t.title;
    $('.node-head-now b').textContent = t.now + ' · ' + nodeName(t, node);

    opts.forEach(function (el) {
      var k = el.getAttribute('data-node');
      el.querySelector('.no-txt').textContent = t[k];
      el.querySelector('.no-sub').textContent = t[k === 'auto' ? 'autoSub' : (k === 'cn' ? 'cnSub' : 'osSub')];
      el.classList.toggle('active', k === pref);
      el.setAttribute('aria-pressed', k === pref ? 'true' : 'false');
    });
  }

  /* ---------- 展開 / 收起 ---------- */
  function open() {
    wrap.classList.add('open');
    ball.setAttribute('aria-expanded', 'true');
  }
  function close() {
    wrap.classList.remove('open');
    ball.setAttribute('aria-expanded', 'false');
  }
  function toggle() { wrap.classList.contains('open') ? close() : open(); }

  ball.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
  document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  /* ---------- 切換線路 ---------- */
  function hop(want) {
    var site = siteId();
    var base = (NODES[site] || NODES.official)[want];
    if (!base) return;

    var y = Math.round(window.pageYOffset || window.scrollY || 0);

    /* 同域時備份一份，作為 URL 參數之外的第二重保險 */
    try {
      sessionStorage.setItem(POS_KEY, JSON.stringify({ s: site, y: y, t: Date.now() }));
    } catch (e) {}

    var url = base + '?hop=1';
    var lc = langCode();
    if (lc) url += '&hl=' + encodeURIComponent(lc);
    /* 有錨點就交給瀏覽器定位；否則用像素位置還原，兩側版面一致所以可靠 */
    if (!location.hash && y > 40) url += '&y=' + y;
    if (location.hash) url += location.hash;

    var veil = document.getElementById('nodeVeil');
    if (!veil) {
      veil = document.createElement('div');
      veil.id = 'nodeVeil';
      veil.className = 'node-veil';
      document.body.appendChild(veil);
    }
    void veil.offsetWidth;           // 觸發重排，讓淡入動畫生效
    veil.classList.add('on');
    close();

    setTimeout(function () { location.replace(url); }, 190);
    /* 兜底：若跳轉失敗（網絡異常），3.2s 後恢復頁面，避免客戶卡在遮罩上 */
    setTimeout(function () { veil.classList.remove('on'); }, 3200);
  }

  opts.forEach(function (el) {
    el.addEventListener('click', function () {
      var want = el.getAttribute('data-node');
      var t = txt();
      if (want === 'auto') {
        writePref('auto');
        render();
        close();
        showToast(t.auto + ' · ' + nodeName(t, curNode()), 1600);
        return;
      }
      if (want === curNode()) {          // 已經在這一側，無需跳轉
        writePref(want);
        render();
        close();
        showToast(t.now + ' · ' + nodeName(t, want), 1600);
        return;
      }
      writePref(want);
      render();
      showToast(t.done + ' · ' + nodeName(t, want), 1500);
      hop(want);
    });
  });

  /* ---------- 語言變化時同步文案 ---------- */
  if (window.MutationObserver) {
    new MutationObserver(function () { render(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  /* ---------- 落地：還原語言 / 還原滾動位置 ---------- */
  function applyLangFromUrl() {
    if (!INCOMING_LANG) return;
    var tries = 0;
    var timer = setInterval(function () {
      var btn = document.querySelector('[data-lang-btn="' + INCOMING_LANG + '"]');
      if (btn) {
        if (!btn.classList.contains('active')) {
          try { btn.click(); } catch (e) {}
        } else {
          clearInterval(timer);
        }
      }
      if (++tries > 16) clearInterval(timer);
    }, 110);
  }

  function restoreScroll() {
    var y = INCOMING_Y;
    if (!y) {
      try {
        var raw = sessionStorage.getItem(POS_KEY);
        if (raw) {
          sessionStorage.removeItem(POS_KEY);
          var d = JSON.parse(raw);
          if (d && d.s === siteId() && Date.now() - d.t < 20000) y = d.y || 0;
        }
      } catch (e) {}
    }
    if (!y || location.hash) return;    // 有錨點時由瀏覽器定位，不搶

    var stopped = false;
    var stop = function () { stopped = true; };
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, stop, { passive: true, once: true });
    });

    var go = function () { if (!stopped) { try { window.scrollTo(0, y); } catch (e) {} } };
    requestAnimationFrame(function () { requestAnimationFrame(go); });
    window.addEventListener('load', function () { setTimeout(go, 120); });
    setTimeout(go, 400);
    setTimeout(go, 1100);
  }

  /* 首次訪問提示（一個瀏覽器只出現一次） */
  function firstVisitHint() {
    var seen = true;
    try { seen = !!localStorage.getItem(HINT_KEY); } catch (e) { seen = true; }
    if (seen) return;
    try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {}
    setTimeout(function () { showToast(txt().tip, 5000); }, INCOMING_HOP ? 700 : 1900);
  }

  render();
  applyLangFromUrl();
  restoreScroll();
  firstVisitHint();

  /* 溶接遮罩用過即除，避免殘留圖層 */
  if (INCOMING_HOP) {
    setTimeout(function () { document.documentElement.classList.remove('hop-in'); }, 1200);
  }

  /* 供其他腳本讀取當前偏好（routeByRegion 用同一個 key） */
  window.HEYDAY_NODE = { get: readPref, node: curNode, site: siteId };
})();
