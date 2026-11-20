'use strict';
/* ========== Tiện ích ========== */
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const L = 'ABCDEF';
const store = {
  get(k, d) { try { const v = localStorage.getItem('hsk_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('hsk_' + k, JSON.stringify(v)); } catch (e) {} },
};
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); }

/* ========== Dữ liệu: từ vựng (Đề cương thi HSK 2025) & bài học (giáo trình 《新HSK教程》) ========== */
const isHan = c => /[㐀-鿿]/.test(c);
const WORDS = VOCAB.map((r, i) => ({ id: i, lv: r[0], w: r[1], py: r[2], syl: r[3], pos: r[4], vi: r[5], hv: r[6] }));
const LV_WORDS = { 1: [], 2: [], 3: [] };
WORDS.forEach(x => LV_WORDS[x.lv].push(x));
const LESSONS = {}, WORD_LESSON = {};
[1, 2, 3].forEach(b => {
  LESSONS[b] = BOOKS[b].map(l => {
    const words = l.w.map(i => WORDS[i]), sup = l.s.map(i => WORDS[i]);
    const ext = l.x.map(r => ({ w: r[0], py: r[1], syl: r[2], vi: r[3], hv: r[4], ext: true }));
    return { n: l.n, zh: l.zh, vi: l.vi, g: l.g, words, sup, ext, all: words.concat(sup) };
  });
});
[1, 2, 3].forEach(b => LESSONS[b].forEach(l => l.all.forEach(x => {
  const cur = WORD_LESSON[x.id];
  if (!cur || (cur.b !== x.lv && b === x.lv)) WORD_LESSON[x.id] = { b, n: l.n };
})));
const POSVI = { 名: 'danh từ', 动: 'động từ', 形: 'tính từ', 副: 'phó từ', 代: 'đại từ', 数: 'số từ', 量: 'lượng từ', 助: 'trợ từ', 介: 'giới từ', 连: 'liên từ', 叹: 'thán từ', 前缀: 'tiền tố', 后缀: 'hậu tố', 拟声: 'tượng thanh' };
const posVi = p => (p || '').replace(/（[^）]*）/g, '').split('、').map(s => POSVI[s.trim()] || '').filter(Boolean).join(', ');
const wkey = x => x.w + '|' + x.py;
let known = new Set(store.get('known', []));
const saveKnown = () => store.set('known', [...known]);
const knownCount = ws => ws.reduce((n, x) => n + (known.has(wkey(x)) ? 1 : 0), 0);

/* ========== Pinyin tự động (ruby) ========== */
const PYW = {}, PYC = {};
const ALLW = WORDS.concat(...[1, 2, 3].map(b => LESSONS[b].flatMap(l => l.ext)));
ALLW.forEach(x => {
  const s = (x.syl || '').toLowerCase(); if (!s) return;
  const ch = [...x.w].filter(isHan), sy = s.split(' ');
  if (ch.length === 1) { if (!PYC[ch[0]]) PYC[ch[0]] = sy[0]; return; }
  if (ch.length === [...x.w].length && !PYW[x.w]) PYW[x.w] = s;
});
ALLW.forEach(x => {
  const ch = [...x.w].filter(isHan), sy = (x.syl || '').toLowerCase().split(' ');
  if (ch.length > 1 && ch.length === sy.length) ch.forEach((c, i) => { if (!PYC[c]) PYC[c] = sy[i]; });
});
Object.assign(PYC, { 了: 'le', 的: 'de', 得: 'de', 地: 'de', 着: 'zhe', 过: 'guo', 吗: 'ma', 呢: 'ne', 吧: 'ba', 么: 'me', 们: 'men', 个: 'gè', 一: 'yī', 不: 'bù', 都: 'dōu', 还: 'hái', 子: 'zi', 和: 'hé', 啊: 'a', 长: 'cháng', 只: 'zhǐ', 会: 'huì', 要: 'yào', 为: 'wèi', 中: 'zhōng', 好: 'hǎo', 里: 'lǐ', 上: 'shàng', 下: 'xià', 儿: 'ér', 男: 'nán', 女: 'nǚ', 问: 'wèn', 行: 'xíng', 看: 'kàn', 教: 'jiāo', 少: 'shǎo', 差: 'chà', 发: 'fā', 重: 'zhòng', 种: 'zhǒng', 空: 'kōng', 分: 'fēn', 正: 'zhèng', 难: 'nán', 便: 'biàn' });
Object.assign(PYW, { 一只: 'yì zhī', 两只: 'liǎng zhī', 这只: 'zhè zhī', 那只: 'nà zhī', 几只: 'jǐ zhī', 长得: 'zhǎng de', 长大: 'zhǎng dà', 还给: 'huán gěi', 还书: 'huán shū', 地上: 'dì shang', 一个: 'yí gè', 不是: 'bú shì', 不去: 'bú qù', 不会: 'bú huì' });
function ruby(text) {
  const ch = [...text]; let out = '', i = 0;
  while (i < ch.length) {
    if (!isHan(ch[i])) { out += esc(ch[i]); i++; continue; }
    let done = false;
    for (let n = Math.min(4, ch.length - i); n >= 2; n--) {
      const w = ch.slice(i, i + n).join('');
      if (PYW[w]) {
        const sy = PYW[w].split(/\s+/);
        if (sy.length === n) out += ch.slice(i, i + n).map((c, k) => `<ruby>${c}<rt>${sy[k]}</rt></ruby>`).join('');
        else out += `<ruby>${w}<rt>${PYW[w].replace(/\s+/g, '')}</rt></ruby>`;
        i += n; done = true; break;
      }
    }
    if (!done) { const c = ch[i]; const p = PYC[c] || (PYW[c] ? PYW[c] : ''); out += p ? `<ruby>${c}<rt>${p}</rt></ruby>` : c; i++; }
  }
  return out;
}
// Bật/tắt pinyin: nút 拼 trên cùng và công tắc trong bài dùng chung một trạng thái.
// Pinyin luôn được vẽ sẵn và chỉ ẩn bằng CSS (body.nopy), nên bật/tắt không làm mất vị trí đang đọc.
let showPy = store.get('py', true);
const zh = t => `<span class="zh">${ruby(t)}</span>`;
const zhLines = t => t.split('\n').map(zh).join('<br>');
const pySwitch = () => `<div class="pybar"><div class="pyl"><b>拼 Pinyin</b><span class="muted if-py">Đang hiện toàn bộ phiên âm</span><span class="muted if-nopy">Đang ẩn · chạm vào từ hoặc câu để xem</span></div><button class="sw" data-pysw role="switch" aria-checked="${showPy}" aria-label="Hiện pinyin"><i></i></button></div>`;
function setPy(v) {
  showPy = v; store.set('py', v);
  document.body.classList.toggle('nopy', !v);
  $('#pyToggle').classList.toggle('on', v);
  document.querySelectorAll('[data-pysw]').forEach(b => b.setAttribute('aria-checked', v));
  document.querySelectorAll('.peek').forEach(e => e.classList.remove('peek'));
}
$('#pyToggle').onclick = () => { setPy(!showPy); toast(showPy ? 'Đã bật pinyin' : 'Đã tắt pinyin'); };
document.addEventListener('click', e => {
  if (e.target.closest('[data-pysw]')) return setPy(!showPy);
  // Khi đang ẩn: chạm vào một từ (hoặc câu ví dụ, tên bài) để xem riêng phiên âm của nó
  if (showPy || e.target.closest('button, a, input, textarea, select')) return;
  const t = e.target.closest('.word, .ex .zh, h1 .zh');
  if (t) t.classList.toggle('peek');
});
setPy(showPy);

/* ========== Phát âm (giọng đọc có sẵn trên máy – Web Speech API) ========== */
// Tự chọn giọng tiếng Phổ thông tự nhiên nhất mà máy có; hội thoại dùng giọng nam/nữ thật nếu máy có,
// đọc từng lượt và nghỉ giữa các lượt nói. Đổi giọng, tốc độ trong bảng 🔊 trên cùng.
const HAS_TTS = 'speechSynthesis' in window;
const TTS = { voices: [], main: null, male: null, female: null, gen: 0, timer: 0, cur: null };
const ttsCfg = Object.assign({ main: '', male: '', rate: 0.9 }, store.get('tts', {}));
const NOVELTY = /\b(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Albert|Bahh|Bells|Boing|Bubbles|Cellos|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Kathy|Ralph)\b|Good News|Bad News/i;
const isMale = v => /Yunxi|Yunyang|Yunjian|Yunxia|Yunfeng|Yunhao|Yunye|Yunze|YunJhe|Kangkang|Li-?mu/i.test(v.name);
const isFemale = v => /Xiao[a-z]|Hsiao|Huihui|Yaoyao|Ting-?Ting|Lili|Yu-?shu|Mei-?Jia|Google/i.test(v.name);
const voiceId = v => v.voiceURI || v.name;
const voiceLabel = v => v.name.replace(/^Microsoft\s+/, '').replace(/\s+-\s+.*$/, '');
function vScore(v) {
  const l = v.lang.replace(/_/g, '-').toLowerCase(), n = v.name;
  if (!/^(zh|cmn)(-|$)/.test(l) || /-(hk|mo)\b|yue/.test(l) || /cantonese|粤|粵/i.test(n)) return -1; // chỉ lấy tiếng Phổ thông
  let s = /^(zh|cmn)(-(cn|hans|sg)\b|$)/.test(l) ? 100 : 60;   // giọng Đại lục trước, Đài Loan sau
  if (/^zh-cn-[a-z]/.test(l)) s -= 50;                           // giọng phương ngữ (Liêu Ninh, Thiểm Tây…)
  if (/natural|neural|online/i.test(n)) s += 50;                 // giọng AI tự nhiên (Edge)
  if (/premium/i.test(n)) s += 45; else if (/enhanced/i.test(n)) s += 40; // giọng tải thêm (iPhone, Mac)
  if (/google/i.test(n)) s += 30;
  if (NOVELTY.test(n)) s -= 80;                                   // giọng hiệu ứng vui của Apple
  if (/Yunxia|Yunjian/i.test(n)) s -= 10;                         // giọng trẻ con, bình luận thể thao
  if (/Xiaoxiao|Yunxi\b/i.test(n)) s += 3;
  return s;
}
function pickVoices() {
  if (!HAS_TTS) return;
  const vs = speechSynthesis.getVoices().filter(v => vScore(v) >= 0).sort((a, b) => vScore(b) - vScore(a));
  const find = id => (id && vs.find(v => voiceId(v) === id)) || null;
  TTS.voices = vs;
  TTS.main = find(ttsCfg.main) || vs.find(v => !isMale(v)) || vs[0] || null;
  TTS.male = ttsCfg.male === 'none' ? null : find(ttsCfg.male) || vs.find(v => isMale(v) && v !== TTS.main) || null;
  TTS.female = TTS.main && isMale(TTS.main) ? vs.find(isFemale) || null : TTS.main;
}
if (HAS_TTS) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
// Giọng cho từng vai: ưu tiên giọng nam/nữ thật; máy chỉ có một giọng thì đổi nhẹ cao độ
function roleVoice(role) {
  const F = TTS.main;
  if (role === '男') return TTS.male && TTS.male !== F ? { v: TTS.male, p: 1 } : { v: F, p: F && isMale(F) ? 1 : 0.8 };
  if (role === '女') return TTS.female ? { v: TTS.female, p: 1 } : { v: F, p: 1.2 };
  return { v: F, p: 1 };
}
// Câu dài chia theo dấu câu (≤ 60 chữ mỗi đoạn) để máy không bị ngắt giữa chừng
function chunks(t) {
  const out = []; let cur = '';
  (t.match(/[^。！？!?]+[。！？!?]*/g) || [t]).forEach(s => { if (cur && (cur + s).length > 60) { out.push(cur); cur = s; } else cur += s; });
  if (cur.trim()) out.push(cur);
  return out;
}
function ttsStop() { TTS.gen++; clearTimeout(TTS.timer); if (HAS_TTS) speechSynthesis.cancel(); }
// Đọc lần lượt từng đoạn {t: chữ, v: giọng, p: cao độ, r: tốc độ, gap: ms nghỉ sau đoạn}
function ttsPlay(items) {
  if (!HAS_TTS) { toast('Trình duyệt không hỗ trợ đọc giọng nói'); return; }
  if (!TTS.voices.length) pickVoices();
  ttsStop(); const gen = TTS.gen;
  const next = () => {
    const it = items.shift(); if (!it || gen !== TTS.gen) return;
    const u = new SpeechSynthesisUtterance(it.t);
    u.lang = it.v ? it.v.lang : 'zh-CN'; if (it.v) u.voice = it.v;
    u.rate = it.r || ttsCfg.rate; u.pitch = it.p || 1;
    let done = false, wd = 0;
    const fin = () => { if (done) return; done = true; clearTimeout(wd); if (gen === TTS.gen) TTS.timer = setTimeout(next, it.gap || 0); };
    wd = setTimeout(fin, 3000 + [...it.t].length * 600 / u.rate); // phòng khi máy không báo đã đọc xong
    u.onend = fin; u.onerror = fin;
    TTS.cur = u; // giữ tham chiếu để Chrome không bỏ dở câu đang đọc
    if (speechSynthesis.paused) speechSynthesis.resume();
    speechSynthesis.speak(u);
  };
  next();
}
function speak(text, rate) { ttsPlay(chunks(text).map(t => ({ t, v: TTS.main, r: rate, gap: 250 }))); }
// Bài nghe: vai 男/女 đọc bằng giọng khác nhau, nghỉ khi đổi lượt và trước câu hỏi như đề thật
function speakScript(script, question) {
  const items = [];
  script.split('\n').forEach(l => {
    const m = l.match(/^(男|女)：(.*)$/), t = (m ? m[2] : l).trim(); if (!t) return;
    const r = roleVoice(m ? m[1] : '');
    chunks(t).forEach(c => items.push({ t: c, v: r.v, p: r.p, gap: 250 }));
    items[items.length - 1].gap = 650;
  });
  if (question) { if (items.length) items[items.length - 1].gap = 900; items.push({ t: '问：' + question, v: TTS.main }); }
  ttsPlay(items);
}
// Chữ đa âm đứng một mình: máy hay đọc theo âm thường gặp, nên đọc bằng chữ đồng âm để đúng âm của từ
const SAY_FIX = { '还|hái': '孩', '还|huán': '环', '只|zhī': '知', '只|zhǐ': '纸', '长|cháng': '常', '长|zhǎng': '掌', '地|de': '的', '得|de': '的', '为|wèi': '位', '干|gàn': '赣', '差|chà': '岔', '种|zhǒng': '肿', '教|jiāo': '交', '角|jiǎo': '脚', '行|xíng': '形' };
const sayText = x => SAY_FIX[x.w + '|' + x.py] || x.w.replace(/（.*?）/g, '');

/* Bảng chọn giọng đọc (nút 🔊 trên cùng) */
const SAMPLE_SAY = '你好，我们一起学习汉语吧。';
function ttsSheet() {
  pickVoices();
  const vs = TTS.voices;
  const opt = (v, sel) => `<option value="${esc(voiceId(v))}" ${v === sel ? 'selected' : ''}>${esc(voiceLabel(v))}${isMale(v) ? ' · nam' : isFemale(v) ? ' · nữ' : ''}${v.localService ? '' : ' · cần mạng'}</option>`;
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box">
  <div class="row"><b style="font-size:18px">🔊 Giọng đọc</b><span class="spacer"></span><button class="chip" id="cl" style="background:var(--pri-s);color:var(--pri-d)">Đóng</button></div>
  ${!HAS_TTS ? '<p class="warnbox">Trình duyệt này không đọc được giọng nói. Hãy mở trang bằng Chrome, Edge hoặc Safari.</p>'
    : !vs.length ? '<p class="warnbox">⚠️ Máy chưa có giọng đọc tiếng Trung. Xem cách cài ở dưới rồi mở lại trang.</p>'
    : `<label class="fld">Giọng chính <span class="muted">— đọc từ, câu ví dụ, vai nữ</span><select id="vMain">${vs.map(v => opt(v, TTS.main)).join('')}</select></label>
  <label class="fld">Giọng vai nam <span class="muted">— trong bài nghe hội thoại</span><select id="vMale"><option value="none" ${TTS.male ? '' : 'selected'}>Không có · hạ tông giọng chính</option>${vs.map(v => opt(v, TTS.male)).join('')}</select></label>
  <div class="fld">Tốc độ đọc<div class="seg">${[[0.7, 'Chậm'], [0.9, 'Vừa'], [1, 'Tự nhiên']].map(([r, t]) => `<button data-r="${r}" class="${ttsCfg.rate === r ? 'on' : ''}">${t}</button>`).join('')}</div></div>
  <button class="btn block" id="vTest" style="margin-top:16px">▶ Nghe thử hội thoại</button>`}
  <details class="tips"><summary>Cách có giọng đọc hay hơn</summary><ul>
    <li><b>iPhone, iPad:</b> Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Trung → tải giọng có chữ “Nâng cao” hoặc “Cao cấp” (Tingting, Lili, Yu-shu…), rồi mở lại trang và chọn giọng đó ở trên.</li>
    <li><b>Android:</b> Cài đặt → tìm “Chuyển văn bản thành giọng nói” → chọn Dịch vụ giọng nói của Google → tải dữ liệu giọng Tiếng Trung (Trung Quốc).</li>
    <li><b>Máy tính:</b> mở trang bằng Microsoft Edge để có giọng AI rất tự nhiên (Xiaoxiao nữ, Yunxi nam).</li>
  </ul></details></div>`;
  document.body.appendChild(m);
  const save = () => { store.set('tts', ttsCfg); pickVoices(); };
  m.onclick = e => {
    if (e.target === m || e.target.id === 'cl') { ttsStop(); m.remove(); return; }
    const r = e.target.closest('[data-r]');
    if (r) { ttsCfg.rate = +r.dataset.r; save(); m.querySelectorAll('[data-r]').forEach(b => b.classList.toggle('on', b === r)); speak(SAMPLE_SAY); }
    if (e.target.id === 'vTest') speakScript('女：你好！你是哪国人？\n男：我是越南人，我在学习汉语。\n女：你的汉语说得很好！');
  };
  m.onchange = e => {
    if (e.target.id === 'vMain') { ttsCfg.main = e.target.value; save(); speak(SAMPLE_SAY); }
    if (e.target.id === 'vMale') { ttsCfg.male = e.target.value; save(); speakScript('男：你好，我们一起学习汉语吧。'); }
  };
}
// Máy còn giữ index.html cũ (chưa có nút 🔊) thì tự thêm nút, tránh lỗi trắng trang
if (!$('#ttsBtn')) {
  const py = $('#pyToggle'), w = document.createElement('div'); w.className = 'tools';
  py.replaceWith(w); w.innerHTML = '<button id="ttsBtn" class="chip" title="Giọng đọc" aria-label="Chọn giọng đọc">🔊</button>'; w.appendChild(py);
}
$('#ttsBtn').onclick = ttsSheet;

/* ========== Router ========== */
let cleanup = null;
window.addEventListener('hashchange', route);
function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  ttsStop();
  const foot = $('.foot'); if (foot) foot.remove();
  const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  window.scrollTo(0, 0);
  if (!p.length) return home();
  if (p[0] === 'l') {
    const lv = +p[1]; if (![1, 2, 3].includes(lv)) return home();
    const v = p[2];
    if (!v) return levelHub(lv);
    if (v === 'vocab') return p[3] != null ? lessonView(lv, +p[3]) : vocabList(lv);
    if (v === 'cards') return flashcards(lv, p[3]);
    if (v === 'grammar') return grammarView(lv, p[3]);
    if (v === 'practice') return practiceMenu(lv);
    if (v === 'quiz') return quiz(lv, p[3], p[4]);
    if (v === 'exam') return p[3] === 'go' ? examRun(lv) : examIntro(lv);
    if (v === 'pron') return pronView();
  }
  home();
}
const back = (href, label) => `<a class="back" href="${href}">‹ ${label}</a>`;

/* ========== Trang chủ ========== */
function home() {
  const hist = store.get('exams', []);
  app.innerHTML = `
  <div class="hero"><div class="bub">🫧</div><h1>Học HSK 1 · 2 · 3</h1><p>Từ vựng theo Đề cương HSK 2025 · bài học theo giáo trình 《新HSK教程》 · luyện tập · thi thử</p></div>
  ${[1, 2, 3].map(lv => {
    const ws = LV_WORDS[lv], k = knownCount(ws), best = Math.max(0, ...hist.filter(h => h.lv === lv).map(h => h.total));
    return `<a class="lvcard" href="#/l/${lv}"><div class="lvbadge">${lv}</div><div class="info"><b>HSK ${lv}</b>
      <div class="muted">${ws.length} từ · ${LESSONS[lv].length} bài${best ? ` · Thi cao nhất: ${best}` : ''}</div>
      <div class="bar"><i style="width:${(k / ws.length * 100).toFixed(1)}%"></i></div>
      <div class="muted">Đã thuộc ${k}/${ws.length}</div></div><span style="font-size:22px;color:var(--pri)">›</span></a>`;
  }).join('')}
  <div class="card"><b>💡 Mẹo</b><div class="muted">Bấm nút <b>拼 Pinyin</b> trên cùng (hoặc công tắc Pinyin trong mỗi bài) để ẩn/hiện toàn bộ phiên âm; khi đang ẩn, chạm vào một từ để xem riêng phiên âm của từ đó. Bấm 🔊 cạnh mỗi từ để nghe; bấm 🔊 trên cùng để chọn giọng đọc và tốc độ. Trên điện thoại, chọn “Thêm vào màn hình chính” để dùng như một ứng dụng.</div></div>
  ${hist.length ? `<div class="card"><b>📝 Lịch sử thi thử</b>${hist.slice(-6).reverse().map(h => `<div class="hist"><span>HSK ${h.lv} · ${new Date(h.at).toLocaleDateString('vi-VN')}</span><b style="color:${h.passed ? 'var(--ok)' : 'var(--bad)'}">${h.total}/${h.max}</b></div>`).join('')}</div>` : ''}`;
}

/* ========== Trang cấp độ ========== */
function levelHub(lv) {
  const ws = LV_WORDS[lv], k = knownCount(ws);
  const tiles = [
    lv === 1 ? ['#/l/1/pron', '🗣️', 'Phát âm', 'Thanh điệu, thanh mẫu, vận mẫu'] : null,
    [`#/l/${lv}/vocab`, '📚', 'Từ vựng', `${ws.length} từ · ${LESSONS[lv].length} bài`],
    [`#/l/${lv}/cards/all`, '🃏', 'Thẻ ghi nhớ', 'Lật thẻ ôn từ chưa thuộc'],
    [`#/l/${lv}/grammar`, '🧩', 'Ngữ pháp', `${LESSONS[lv].reduce((n, l) => n + l.g.length, 0)} điểm theo bài`],
    [`#/l/${lv}/practice`, '🎯', 'Luyện tập', 'Trắc nghiệm nhanh 4 dạng'],
    [`#/l/${lv}/exam`, '📝', 'Thi thử', `${EXAMS[lv].sections.reduce((n, s) => n + s.parts.reduce((m, p) => m + p.n, 0), 0)} câu · ${EXAMS[lv].time} phút`],
  ].filter(Boolean);
  app.innerHTML = `${back('#/', 'Trang chủ')}
  <h1>HSK ${lv}</h1>
  <div class="card"><div class="row"><b>Tiến độ từ vựng</b><span class="spacer"></span><span class="muted">${k}/${ws.length}</span></div><div class="bar"><i style="width:${k / ws.length * 100}%"></i></div></div>
  <div class="grid g3">${tiles.map(t => `<a class="tile" href="${t[0]}"><span class="ic">${t[1]}</span><b>${t[2]}</b><span class="muted">${t[3]}</span></a>`).join('')}</div>`;
}

/* ========== Từ vựng ========== */
function wordRow(x, o = {}) {
  const on = !x.ext && known.has(wkey(x));
  let tags = '';
  if (x.ext) tags += '<span class="tag">mở rộng</span>';
  else {
    if (o.b && x.lv !== o.b) tags += `<span class="tag hl">HSK ${x.lv}</span>`;
    if (x.pos) tags += `<span class="tag">${esc(posVi(x.pos))}</span>`;
    if (o.lesson && WORD_LESSON[x.id]) tags += `<span class="tag">Bài ${WORD_LESSON[x.id].n}</span>`;
  }
  return `<div class="word"><div class="hz">${esc(x.w)}</div><div class="meta"><div class="py"><span class="pyt">${esc(x.py)}</span> <span class="hv">${esc(x.hv || '')}</span></div><div>${esc(x.vi)} ${tags}</div></div>
  <button class="ibtn" data-say="${esc(sayText(x))}" aria-label="Nghe">🔊</button>${x.ext ? '<span style="width:38px;flex:none"></span>' : `<button class="ibtn k ${on ? 'on' : ''}" data-k="${x.id}" aria-label="Đã thuộc">✓</button>`}</div>`;
}
function bindWords(root) {
  root.onclick = e => {
    const s = e.target.closest('[data-say]'); if (s) return speak(s.dataset.say);
    const k = e.target.closest('[data-k]');
    if (k) { const x = WORDS[+k.dataset.k], key = wkey(x); known.has(key) ? known.delete(key) : known.add(key); saveKnown(); k.classList.toggle('on'); }
  };
}
function vocabList(lv) {
  app.innerHTML = `${back(`#/l/${lv}`, 'HSK ' + lv)}<h1>Từ vựng HSK ${lv}</h1>
  <p class="muted" style="margin-top:-6px">${LV_WORDS[lv].length} từ theo Đề cương thi HSK (công bố 11/2025), chia theo ${LESSONS[lv].length} bài của giáo trình 《新HSK教程${lv}》.</p>
  <input type="search" id="q" placeholder="Tìm chữ Hán, pinyin hoặc nghĩa tiếng Việt…">
  <div id="res"></div>
  <h2>Bài học</h2>
  <div>${LESSONS[lv].map((l, i) => { const k = knownCount(l.all); return `<a class="lessonrow ${k === l.all.length ? 'done' : ''}" href="#/l/${lv}/vocab/${i}"><span class="ln">${l.n}</span><span class="lt"><b>${zh(l.zh)}</b><span class="muted">${esc(l.vi)}</span></span><span class="muted lk">${k}/${l.all.length}</span></a>`; }).join('')}</div>`;
  const q = $('#q'), res = $('#res');
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  q.oninput = () => {
    const raw = q.value.trim(), t = norm(raw);
    if (!t) { res.innerHTML = ''; return; }
    const hits = LV_WORDS[lv].filter(x => x.w.includes(raw) || norm(x.py).replace(/\s/g, '').includes(t.replace(/\s/g, '')) || norm(x.vi).includes(t) || norm(x.hv).includes(t)).slice(0, 40);
    res.innerHTML = `<div class="card">${hits.length ? hits.map(x => wordRow(x, { lesson: true })).join('') : '<span class="muted">Không tìm thấy</span>'}</div>`;
  };
  bindWords(res);
}
function lessonView(lv, i) {
  const l = LESSONS[lv][i]; if (!l) return vocabList(lv);
  app.innerHTML = `${back(`#/l/${lv}/vocab`, 'Danh sách bài')}
  <div class="muted">新HSK教程${lv} · Bài ${l.n}</div>
  <h1 style="margin:2px 0">${zh(l.zh)}</h1><div class="muted" style="margin-bottom:12px">${esc(l.vi)}</div>
  <div class="row" style="margin-bottom:4px"><a class="btn" href="#/l/${lv}/cards/${i}">🃏 Thẻ ghi nhớ</a><a class="btn pink" href="#/l/${lv}/quiz/hv/${i}">🎯 Kiểm tra bài</a></div>
  ${pySwitch()}
  <h2>Từ mới (${l.words.length})</h2><div class="card wl">${l.words.map(x => wordRow(x, { b: lv })).join('')}</div>
  ${l.sup.length ? `<h2>Từ bổ sung theo đề cương (${l.sup.length})</h2><p class="muted" style="margin-top:-6px">Có trong đề cương HSK ${lv} nhưng không nằm trong danh sách từ mới của sách, được xếp vào bài có chủ đề gần nhất.</p><div class="card wl">${l.sup.map(x => wordRow(x, { b: lv })).join('')}</div>` : ''}
  ${l.ext.length ? `<h2>Từ mở rộng · tên riêng (${l.ext.length})</h2><p class="muted" style="margin-top:-6px">Có trong bài của sách nhưng không thuộc đề cương thi HSK 1–3.</p><div class="card wl">${l.ext.map(x => wordRow(x)).join('')}</div>` : ''}
  ${l.g.length ? `<h2>Ngữ pháp trong bài</h2><div class="card">${l.g.map((t, k) => `<div class="gline"><b>${k + 1}.</b> <span class="zh">${esc(t)}</span></div>`).join('')}<a class="btn ghost block" style="margin-top:10px" href="#/l/${lv}/grammar/${i}">Xem giải thích ngữ pháp ›</a></div>` : ''}
  <div class="row">${i > 0 ? `<a class="btn ghost" href="#/l/${lv}/vocab/${i - 1}">‹ Bài ${i}</a>` : ''}<span class="spacer"></span>${i < LESSONS[lv].length - 1 ? `<a class="btn ghost" href="#/l/${lv}/vocab/${i + 1}">Bài ${i + 2} ›</a>` : ''}</div>`;
  app.querySelectorAll('.wl').forEach(bindWords);
}

/* ========== Thẻ ghi nhớ ========== */
function flashcards(lv, which) {
  const all = which === 'all';
  let deck = all ? LV_WORDS[lv].filter(x => !known.has(wkey(x))) : (LESSONS[lv][+which] ? LESSONS[lv][+which].all : []);
  if (all && !deck.length) deck = LV_WORDS[lv];
  deck = shuffle(deck); if (all) deck = deck.slice(0, 30);
  let i = 0, got = 0;
  const title = all ? 'Ôn từ chưa thuộc' : `Bài ${LESSONS[lv][+which].n}: ${esc(LESSONS[lv][+which].zh)}`;
  const draw = () => {
    if (i >= deck.length) {
      app.innerHTML = `${back(`#/l/${lv}`, 'HSK ' + lv)}<div class="card" style="text-align:center"><div style="font-size:60px">🎉</div><h1>Hoàn thành!</h1><p>Bạn đã thuộc <b>${got}</b>/${deck.length} thẻ.</p>
      <div class="row" style="justify-content:center"><button class="btn" id="again">Ôn lại</button><a class="btn ghost" href="#/l/${lv}">Về HSK ${lv}</a></div></div>`;
      $('#again').onclick = () => flashcards(lv, which); return;
    }
    const x = deck[i];
    app.innerHTML = `${back(all ? `#/l/${lv}` : `#/l/${lv}/vocab/${which}`, 'Quay lại')}
    <div class="row"><b>${title}</b><span class="spacer"></span><span class="muted">${i + 1}/${deck.length}</span></div>
    <div class="bar"><i style="width:${i / deck.length * 100}%"></i></div>
    <div class="flash" id="fc"><div class="in">
      <div class="f"><div class="big">${esc(x.w)}</div><div class="muted" style="margin-top:14px">Chạm để lật thẻ</div></div>
      <div class="b"><div class="big" style="font-size:48px">${esc(x.w)}</div><div class="py">${esc(x.py)}</div><div class="hv" style="color:var(--pink);text-transform:capitalize">${esc(x.hv)}</div><div class="vi">${esc(x.vi)}</div></div>
    </div></div>
    <div class="row" style="justify-content:center;margin-bottom:12px"><button class="ibtn" id="say" style="width:52px;height:52px;font-size:22px">🔊</button></div>`;
    const ft = document.createElement('div'); ft.className = 'foot';
    ft.innerHTML = `<div class="wrap"><button class="btn ghost" id="no">✗ Chưa thuộc</button><button class="btn" id="yes">✓ Đã thuộc</button></div>`;
    document.body.appendChild(ft);
    $('#fc').onclick = () => { $('#fc').classList.toggle('flip'); };
    $('#say').onclick = () => speak(sayText(x));
    $('#no').onclick = () => { known.delete(wkey(x)); saveKnown(); i++; ft.remove(); draw(); };
    $('#yes').onclick = () => { known.add(wkey(x)); saveKnown(); got++; i++; ft.remove(); draw(); };
    speak(sayText(x));
  };
  draw();
}

/* ========== Ngữ pháp ========== */
function gramDetail(g) {
  return `<div class="f">${esc(g.f)}</div><div>${esc(g.d)}</div>
    ${g.ex.map(e => `<div class="ex"><div class="row" style="flex-wrap:nowrap"><div style="flex:1">${zh(e[0])}</div><button class="ibtn" data-say="${esc(e[0])}">🔊</button></div><div class="vi">${esc(e[1])}</div></div>`).join('')}`;
}
function grammarView(lv, only) {
  const GL = (typeof GRAMMAR_LESSON !== 'undefined' && GRAMMAR_LESSON[lv]) || {};
  const total = LESSONS[lv].reduce((n, l) => n + l.g.length, 0);
  const list = LESSONS[lv].map((l, i) => {
    if (!l.g.length || (only != null && i !== +only)) return '';
    const det = GL[l.n] || [];
    return `<div class="card" id="g${i}"><div class="muted">Bài ${l.n}</div><b>${zh(l.zh)}</b>
      ${l.g.map((t, k) => det[k] ? `<details class="gp" ${only != null ? 'open' : ''}><summary>${k + 1}. <span class="zh">${esc(t)}</span> <span class="muted">— ${esc(det[k].vi)}</span></summary>${gramDetail(det[k])}</details>` : `<div class="gline"><b>${k + 1}.</b> <span class="zh">${esc(t)}</span></div>`).join('')}</div>`;
  }).join('');
  app.innerHTML = `${back(only != null ? `#/l/${lv}/vocab/${only}` : `#/l/${lv}`, only != null ? 'Về bài học' : 'HSK ' + lv)}<h1>Ngữ pháp HSK ${lv}</h1>
  <p class="muted" style="margin-top:-6px">${total} điểm ngữ pháp theo từng bài của giáo trình 《新HSK教程${lv}》, đối chiếu Đề cương thi HSK 2025.</p>
  ${pySwitch()}
  <div id="gl">${list}</div>
  <a class="btn block" href="#/l/${lv}/exam">📝 Làm đề thi thử HSK ${lv}</a>`;
  app.onclick = e => {
    const s = e.target.closest('[data-say]'); if (s) return speak(s.dataset.say);
  };
  cleanup = () => { app.onclick = null; };
}

/* ========== Phát âm ========== */
function pronView() {
  const P = PRONUNCIATION;
  app.innerHTML = `${back('#/l/1', 'HSK 1')}<h1>Phát âm tiếng Trung</h1>
  <div class="card"><b>4 thanh điệu + thanh nhẹ</b>${P.tones.map(t => `<div class="tonerow"><span class="py">${t[0]}</span><span class="zh" style="font-size:24px">${t[1]}</span><span style="flex:1" class="muted">${esc(t[2])}</span><button class="ibtn" data-say="${t[1]}">🔊</button></div>`).join('')}</div>
  <div class="card"><b>Thanh mẫu (phụ âm đầu)</b><div class="pyset" style="margin-top:8px">${P.initials.split(' ').map(x => `<span>${x}</span>`).join('')}</div></div>
  <div class="card"><b>Vận mẫu (vần)</b><div class="pyset" style="margin-top:8px">${P.finals.split(' ').map(x => `<span>${x}</span>`).join('')}</div></div>
  <div class="card"><b>Quy tắc cần nhớ</b><ul>${P.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
  <div class="row">${['你好', '不是', '一个', '一天', '谢谢', '再见'].map(w => `<button class="btn ghost" data-say="${w}">🔊 ${zh(w)}</button>`).join('')}</div></div>`;
  app.onclick = e => { const s = e.target.closest('[data-say]'); if (s) speak(s.dataset.say, 0.7); };
  cleanup = () => { app.onclick = null; };
}

/* ========== Luyện tập nhanh ========== */
const MODES = { hv: ['Hán → Nghĩa', 'Nhìn chữ Hán, chọn nghĩa'], vh: ['Nghĩa → Hán', 'Nhìn nghĩa, chọn chữ Hán'], ls: ['Nghe → Hán', 'Nghe phát âm, chọn chữ'], py: ['Hán → Pinyin', 'Chọn phiên âm đúng'] };
function practiceMenu(lv) {
  const sel = store.get('pscope' + lv, 'all');
  app.innerHTML = `${back(`#/l/${lv}`, 'HSK ' + lv)}<h1>Luyện tập HSK ${lv}</h1>
  <div class="card"><b>Phạm vi</b><select id="scope" style="width:100%;margin-top:8px;padding:10px;border-radius:12px;border:2px solid var(--line);font:inherit">
    <option value="all">Toàn bộ HSK ${lv} (${LV_WORDS[lv].length} từ)</option>
    ${LESSONS[lv].map((l, i) => `<option value="${i}" ${String(i) === String(sel) ? 'selected' : ''}>Bài ${l.n}: ${esc(l.zh)}</option>`).join('')}
  </select></div>
  <div class="grid">${Object.entries(MODES).map(([k, m]) => `<button class="tile" data-m="${k}" style="text-align:left"><span class="ic">${{ hv: '🀄', vh: '🇻🇳', ls: '🎧', py: '🔤' }[k]}</span><b>${m[0]}</b><span class="muted">${m[1]}</span></button>`).join('')}</div>`;
  app.onclick = e => { const b = e.target.closest('[data-m]'); if (b) { const s = $('#scope').value; store.set('pscope' + lv, s); location.hash = `#/l/${lv}/quiz/${b.dataset.m}/${s}`; } };
  cleanup = () => { app.onclick = null; };
}
function quiz(lv, mode, scope) {
  mode = MODES[mode] ? mode : 'hv';
  const pool = scope === 'all' || scope == null ? LV_WORDS[lv] : (LESSONS[lv][+scope] ? LESSONS[lv][+scope].all : LV_WORDS[lv]);
  const qs = pick(pool, Math.min(10, pool.length));
  const distract = LV_WORDS[lv];
  let i = 0, score = 0; const wrong = [];
  const draw = () => {
    if (i >= qs.length) {
      app.innerHTML = `${back(`#/l/${lv}/practice`, 'Luyện tập')}<div class="card" style="text-align:center"><div class="score">${score}/${qs.length}</div><p>${score === qs.length ? 'Xuất sắc! 🎉' : score >= qs.length * .7 ? 'Tốt lắm! 👍' : 'Cố gắng thêm nhé! 💪'}</p>
      <div class="row" style="justify-content:center"><button class="btn" id="again">Làm lại</button><a class="btn ghost" href="#/l/${lv}/practice">Chọn dạng khác</a></div></div>
      ${wrong.length ? `<h2>Từ cần ôn lại</h2><div class="card" id="wl">${wrong.map(wordRow).join('')}</div>` : ''}`;
      $('#again').onclick = () => quiz(lv, mode, scope); if (wrong.length) bindWords($('#wl')); return;
    }
    const x = qs[i];
    const field = mode === 'hv' ? 'vi' : mode === 'py' ? 'py' : 'w';
    const others = [];
    for (const y of shuffle(distract)) { if (others.length >= 3) break; if (y[field] !== x[field] && !others.some(o => o[field] === y[field])) others.push(y); }
    const opts = shuffle([x, ...others]);
    const ans = opts.indexOf(x);
    const prompt = mode === 'hv' || mode === 'py' ? `<div class="qpic" style="font-size:64px;font-weight:700">${esc(x.w)}</div>`
      : mode === 'vh' ? `<div style="font-size:22px;text-align:center;font-weight:600;margin:20px 0">${esc(x.vi)}</div>`
        : `<div class="audio" style="justify-content:center"><button class="ibtn" id="play">🔊</button><span>Nghe và chọn từ đúng</span></div>`;
    app.innerHTML = `${back(`#/l/${lv}/practice`, 'Luyện tập')}
    <div class="row"><b>${MODES[mode][0]}</b><span class="spacer"></span><span class="muted">${i + 1}/${qs.length} · Đúng ${score}</span></div>
    <div class="bar"><i style="width:${i / qs.length * 100}%"></i></div>
    <div class="card" style="margin-top:12px">${prompt}<div class="opts">${opts.map((o, k) => `<button class="opt" data-i="${k}"><span class="l">${L[k]}</span><span>${esc(o[field])}</span></button>`).join('')}</div><div id="fb"></div></div>`;
    if (mode === 'ls') { $('#play').onclick = () => speak(sayText(x)); speak(sayText(x)); }
    let answered = false;
    app.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const k = +b.dataset.i;
      app.querySelectorAll('.opt')[ans].classList.add('ok');
      if (k === ans) score++; else { b.classList.add('bad'); wrong.push(x); }
      $('#fb').innerHTML = `<div class="explain"><b style="font-size:20px">${esc(x.w)}</b> · ${esc(x.py)} · <span style="text-transform:capitalize">${esc(x.hv)}</span><br>${esc(x.vi)}</div>
      <button class="btn block" id="nx" style="margin-top:12px">${i + 1 < qs.length ? 'Câu tiếp ›' : 'Xem kết quả'}</button>`;
      if (mode !== 'ls') speak(sayText(x));
      $('#nx').onclick = () => { i++; draw(); };
    });
  };
  draw();
}

/* ========== Thi thử (cấu trúc đề HSK mới 2026) ========== */
const qCount = lv => EXAMS[lv].sections.reduce((n, s) => n + s.parts.reduce((m, p) => m + p.n, 0), 0);
function buildExam(lv) {
  const E = EXAMS[lv], B = BANK[lv] || {}, qs = [], used = {};
  const take = (pool, n) => {
    if (!used[pool]) used[pool] = shuffle(B[pool] || []);
    const out = []; while (out.length < n && used[pool].length) out.push(used[pool].shift());
    return out;
  };
  E.sections.forEach((sec, si) => sec.parts.forEach((pt, pi) => {
    const push = q => qs.push(Object.assign({ si, pi, sec: sec.name, part: pt.t }, q));
    if (pt.g === 'pic3') {
      const allE = (B[pt.pool] || []).map(x => x[1]);
      take(pt.pool, pt.n).forEach(([text, e, vi]) => {
        const o = shuffle([e, ...pick(allE.filter(x => x !== e), 2)]);
        push({ kind: 'mc', picOpts: true, audio: pt.audio ? text : null, text: pt.audio ? null : text, opts: o, ans: o.indexOf(e), script: text, exp: vi });
      });
    } else if (pt.g === 'resp3') {
      take(pt.pool, pt.n).forEach(([qq, a, w1, w2, vi]) => { const o = shuffle([a, w1, w2]); push({ kind: 'mc', audio: qq, script: qq, opts: o, ans: o.indexOf(a), exp: vi }); });
    } else if (pt.g === 'mc3') {
      take(pt.pool, pt.n).forEach(([text, qq, o, an, vi]) => push({ kind: 'mc', audio: pt.audio ? text : null, text: pt.audio ? null : text, passage: !pt.audio, question: qq, star: !!pt.star, opts: o, ans: an, script: pt.audio ? text + '\n问：' + qq : null, exp: vi }));
    } else if (['match6pic', 'match6txt', 'fill6', 'comp6'].includes(pt.g)) {
      const keyOf = it => pt.g === 'comp6' ? it[4] : it[1];
      for (let k = 0; k < pt.n; k += 5) {
        const need = Math.min(5, pt.n - k);
        const group = [];
        for (const it of take(pt.pool, need + 3)) { if (group.length < need + 1 && !group.some(g => keyOf(g) === keyOf(it))) group.push(it); else used[pt.pool].push(it); }
        const real = group.slice(0, need), opts = shuffle(group.map(keyOf));
        real.forEach(it => {
          const key = keyOf(it), base = { kind: 'mc', opts, ans: opts.indexOf(key), six: true };
          if (pt.g === 'match6pic') push(Object.assign(base, { picOpts: true, audio: pt.audio ? it[0] : null, text: pt.audio ? null : it[0], script: it[0], exp: it[2] }));
          else if (pt.g === 'match6txt') push(Object.assign(base, { text: it[0], exp: it[2] }));
          else if (pt.g === 'fill6') push(Object.assign(base, { text: it[0], exp: it[0].replace('（　）', '【' + key + '】') + ' — ' + it[2] }));
          else push(Object.assign(base, { comp: it, picOpts: true, exp: `${it[0]} (${it[1]}): ${[...it[0]][it[2]]} = ${it[3]} + ${it[4]} — ${it[5]}` }));
        });
      }
    } else if (pt.g === 'write') {
      take(pt.pool, pt.n).forEach(([s, py, c, vi]) => push({ kind: 'write', text: s, py, ans: c, exp: s.replace('（　）', '【' + c + '】') + ' — ' + vi }));
    } else if (pt.g === 'make') {
      take(pt.pool, pt.n).forEach(([w, sample, vi]) => push({ kind: 'make', word: w, sample, exp: 'Câu mẫu: ' + sample + ' — ' + vi }));
    }
  }));
  return qs;
}

function examIntro(lv) {
  const E = EXAMS[lv];
  app.innerHTML = `${back(`#/l/${lv}`, 'HSK ' + lv)}<h1>Thi thử HSK ${lv}</h1>
  <div class="card"><div class="row"><span>📝 <b>${qCount(lv)} câu</b></span><span>⏱️ Làm bài: <b>${E.time} phút</b></span></div>
  <p class="muted">Theo cấu trúc đề HSK mới (công bố 12/2025, áp dụng từ 7/2026). Tổng thời gian thi chính thức khoảng ${E.official} phút, gồm cả thời gian điền thông tin.</p>
  <p class="muted">Đề được trộn ngẫu nhiên mỗi lần làm. Phần nghe đọc bằng giọng máy (cần bật âm lượng), mỗi bài nghe được nghe tối đa 2 lần. Bấm 🔊 trên cùng để chọn giọng đọc và tốc độ.</p></div>
  ${E.sections.map(s => `<div class="card"><b>${esc(s.name)}</b> <span class="muted">(${s.parts.reduce((n, p) => n + p.n, 0)} câu · ${s.time} phút)</span><ul style="margin:6px 0 0;padding-left:20px">${s.parts.map(p => `<li>${esc(p.t)} <span class="muted">— ${p.n} câu</span></li>`).join('')}</ul></div>`).join('')}
  ${HAS_TTS && !TTS.voices.length ? '<div class="card" style="background:var(--pink-s)">⚠️ Chưa tìm thấy giọng đọc tiếng Trung trên thiết bị. Bấm 🔊 trên cùng để xem cách cài, hoặc dùng nút “Xem lời thoại”.</div>' : ''}
  <a class="btn block pink" href="#/l/${lv}/exam/go">Bắt đầu làm bài</a>`;
}

let EX = null;
function examRun(lv) {
  if (!EX || EX.lv !== lv || EX.done) EX = { lv, qs: buildExam(lv), ans: [], plays: [], idx: 0, start: Date.now(), done: false };
  const E = EXAMS[lv];
  const tick = () => {
    const left = E.time * 60 - Math.floor((Date.now() - EX.start) / 1000);
    const t = $('#tm'); if (t) t.textContent = `${String(Math.max(0, left) / 60 | 0).padStart(2, '0')}:${String(Math.max(0, left) % 60).padStart(2, '0')}`;
    if (left <= 0 && !EX.done) { toast('Hết giờ! Bài thi đã được nộp.'); finishExam(); }
  };
  const timer = setInterval(tick, 1000);
  cleanup = () => { clearInterval(timer); clearTimeout(EX && EX.auto); };
  drawQ(); tick();
}
const makeOk = (q, a) => { const s = (a || '').trim(); const n = (s.match(/[㐀-鿿]/g) || []).length; return s.includes(q.word) && n >= [...q.word].length + 3 && /[。！？!?.]$/.test(s); };
function qBody(q, sel, review) {
  let h = '';
  if (q.audio) h += `<div class="audio"><button class="ibtn" id="play">🔊</button><div style="flex:1"><b>Nghe</b><div class="muted" id="plays"></div></div>${review ? '' : '<button class="chip" id="scr" style="background:var(--pri-s);color:var(--pri-d)">Xem lời thoại</button>'}</div><div id="scrbox"></div>`;
  if (q.comp) {
    const [w, py, ci, given] = q.comp;
    h += `<div class="passage" style="text-align:center"><div style="color:var(--pri-d);font-weight:600">${esc(py)}</div><div style="font-size:34px;letter-spacing:4px">${[...w].map((c, i) => i === ci ? `<span class="compbox">${esc(given)}<b>＋？</b></span>` : esc(c)).join('')}</div></div>`;
  }
  if (q.text && q.kind !== 'write') h += `<div class="passage" ${q.passage ? '' : 'style="text-align:center;font-size:21px"'}>${zhLines(q.text)}</div>`;
  if (q.question && (!q.audio || review)) h += `<div class="star">${q.star ? '★ ' : ''}${zh(q.question.replace(/^★\s*/, ''))}</div>`;
  if (q.kind === 'mc') {
    h += `<div class="opts ${q.picOpts ? 'pics' : ''}">${q.opts.map((o, k) => {
      let c = sel === k ? 'sel' : '';
      if (review) c = k === q.ans ? 'ok' : (sel === k ? 'bad' : '');
      return q.picOpts ? `<button class="opt pic ${c}" data-i="${k}"><span>${o}</span><span class="l">${L[k]}</span></button>`
        : `<button class="opt ${c}" data-i="${k}"><span class="l">${L[k]}</span><span>${q.comp ? `<span style="font-size:26px">${esc(o)}</span>` : zh(o)}</span></button>`;
    }).join('')}</div>`;
  } else if (q.kind === 'write') {
    h += `<div class="passage" style="text-align:center;font-size:22px">${esc(q.text).replace('（　）', `<ruby><span style="display:inline-block;min-width:1.6em;border-bottom:2px solid var(--pink)">${esc(sel || '')}</span><rt style="font-size:.6em;color:var(--pink)">${esc(q.py)}</rt></ruby>`)}</div>
    ${review ? `<div class="fb ${sel === q.ans ? 'ok' : 'bad'}">Đáp án: ${esc(q.ans)}</div>` : `<input type="text" id="wr" maxlength="2" placeholder="Viết chữ Hán (${esc(q.py)})" value="${esc(sel || '')}" style="margin-top:12px;font-size:22px;text-align:center" lang="zh-CN">`}`;
  } else if (q.kind === 'make') {
    h += `<div class="muted">Dùng từ dưới đây viết một câu tiếng Trung hoàn chỉnh:</div><div class="passage" style="text-align:center;font-size:28px">${zh(q.word)}</div>
    ${review ? `<div class="explain">Bài làm: ${esc(sel || '(chưa làm)')}</div><div class="fb ${makeOk(q, sel) ? 'ok' : 'bad'}">${makeOk(q, sel) ? 'Đạt yêu cầu cơ bản' : 'Chưa đạt yêu cầu'} (câu phải có từ “${esc(q.word)}”, đủ dài và có dấu câu cuối)</div>`
      : `<textarea id="mk" rows="3" placeholder="Ví dụ: …${esc(q.word)}…。" lang="zh-CN" style="width:100%;margin-top:12px;font-size:20px;padding:12px;border-radius:14px;border:2px solid var(--line)">${esc(sel || '')}</textarea><div class="muted" style="margin-top:6px">Câu cần có từ trên, ít nhất vài chữ và kết thúc bằng dấu “。” hoặc “？”. Máy chỉ chấm sơ bộ; hãy so với câu mẫu khi xem lại.</div>`}`;
  }
  return h;
}
function isRight(q, a) {
  if (a == null || a === '') return false;
  if (q.kind === 'mc') return a === q.ans;
  if (q.kind === 'write') return a.trim() === q.ans;
  if (q.kind === 'make') return makeOk(q, a);
  return false;
}
function drawQ() {
  const { qs, idx, lv } = EX; const q = qs[idx];
  app.innerHTML = `<div class="exambar"><b>HSK ${lv}</b><span class="muted">${esc(q.sec)}</span><span class="spacer"></span><span class="timer" id="tm">--:--</span><button class="chip" id="grid" style="background:var(--pri);">☰ ${EX.ans.filter(a => a != null).length}/${qs.length}</button></div>
  <div class="card"><div class="muted" style="font-weight:600;color:var(--pri-d)">${esc(q.part)}</div>
  <div class="qhead" style="margin-top:8px"><span class="qnum">${idx + 1}</span></div>
  ${qBody(q, EX.ans[idx], false)}</div>`;
  const ft = document.createElement('div'); ft.className = 'foot';
  ft.innerHTML = `<div class="wrap"><button class="btn ghost" id="pv" ${idx === 0 ? 'disabled' : ''}>‹ Trước</button>${idx === qs.length - 1 ? '<button class="btn pink" id="sub">Nộp bài</button>' : '<button class="btn" id="nx">Tiếp ›</button>'}</div>`;
  $('.foot') && $('.foot').remove(); document.body.appendChild(ft);
  const go = n => { EX.idx = n; drawQ(); window.scrollTo(0, 0); };
  $('#pv').onclick = () => idx > 0 && go(idx - 1);
  if ($('#nx')) $('#nx').onclick = () => go(idx + 1);
  if ($('#sub')) $('#sub').onclick = () => { const left = qs.filter((_, i) => EX.ans[i] == null).length; if (confirm(left > 0 ? `Còn ${left} câu chưa làm. Nộp bài?` : 'Nộp bài?')) finishExam(); };
  $('#grid').onclick = () => navModal(false);
  bindQ(q, idx, false);
  const left = EXAMS[lv].time * 60 - Math.floor((Date.now() - EX.start) / 1000);
  $('#tm').textContent = `${String(Math.max(0, left) / 60 | 0).padStart(2, '0')}:${String(Math.max(0, left) % 60).padStart(2, '0')}`;
}
function bindQ(q, idx, review) {
  clearTimeout(EX.auto); // bỏ lượt tự phát của câu vừa rời, tránh tính thừa lượt nghe
  if (q.audio) {
    const pc = () => { const p = $('#plays'); if (p && !review) p.textContent = `Đã nghe ${EX.plays[idx] || 0}/2 lần`; };
    const play = () => {
      if (!review) { if ((EX.plays[idx] || 0) >= 2) { toast('Đã nghe đủ 2 lần (như đề thật)'); return; } EX.plays[idx] = (EX.plays[idx] || 0) + 1; pc(); }
      speakScript(q.audio, q.question);
    };
    $('#play').onclick = play; pc();
    if (!review && !EX.plays[idx]) EX.auto = setTimeout(play, 300); // tự phát một lần khi mở câu
    if ($('#scr')) $('#scr').onclick = () => { $('#scrbox').innerHTML = `<div class="explain zhs">${zhLines(q.audio)}</div>`; $('#scr').remove(); };
  }
  if (review) return;
  if (q.kind === 'mc') app.querySelectorAll('.opt').forEach(b => b.onclick = () => { EX.ans[idx] = +b.dataset.i; app.querySelectorAll('.opt').forEach(x => x.classList.toggle('sel', x === b)); updCount(); });
  if (q.kind === 'write') $('#wr').oninput = e => { EX.ans[idx] = e.target.value.trim() || null; updCount(); };
  if (q.kind === 'make') $('#mk').oninput = e => { EX.ans[idx] = e.target.value.trim() ? e.target.value : null; updCount(); };
}
function updCount() { const g = $('#grid'); if (g) g.textContent = `☰ ${EX.ans.filter(a => a != null).length}/${EX.qs.length}`; }
function navModal(review) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box"><div class="row"><b>Danh sách câu hỏi</b><span class="spacer"></span><button class="chip" style="background:var(--pri-s);color:var(--pri-d)" id="cl">Đóng</button></div>
  <div class="navgrid" style="margin-top:12px">${EX.qs.map((q, i) => {
    let c = review ? (isRight(q, EX.ans[i]) ? 'ok' : 'bad') : (EX.ans[i] != null ? 'a' : '');
    if (i === EX.idx) c += ' cur'; return `<button class="${c}" data-n="${i}">${i + 1}</button>`;
  }).join('')}</div></div>`;
  document.body.appendChild(m);
  m.onclick = e => { const b = e.target.closest('[data-n]'); if (b) { EX.idx = +b.dataset.n; m.remove(); review ? drawReview() : drawQ(); } else if (e.target === m || e.target.id === 'cl') m.remove(); };
}
function finishExam() {
  if (EX.done) return; EX.done = true;
  if (cleanup) { cleanup(); cleanup = null; }
  ttsStop();
  const E = EXAMS[EX.lv];
  const secs = E.sections.map((s, si) => { const qs = EX.qs.map((q, i) => [q, i]).filter(([q]) => q.si === si); const c = qs.filter(([q, i]) => isRight(q, EX.ans[i])).length; return { name: s.name, c, n: qs.length, sc: qs.length ? Math.round(c / qs.length * 100) : 0 }; });
  const total = secs.reduce((a, s) => a + s.sc, 0), max = secs.length * 100, passed = total >= max * 0.6;
  EX.result = { secs, total, max, passed };
  const h = store.get('exams', []); h.push({ lv: EX.lv, total, max, passed, at: Date.now() }); store.set('exams', h.slice(-30));
  showResult();
}
function showResult() {
  EX.view = 'result';
  const { secs, total, max, passed } = EX.result; const lv = EX.lv;
  const f = $('.foot'); if (f) f.remove();
  app.innerHTML = `${back(`#/l/${lv}`, 'HSK ' + lv)}
  <div class="card" style="text-align:center"><div class="muted">Kết quả thi thử HSK ${lv}</div><div class="score">${total}<span style="font-size:22px;color:var(--muted)">/${max}</span></div>
  <span class="pass ${passed ? 'y' : 'n'}">${passed ? '🎉 ĐẠT' : 'CHƯA ĐẠT'} (mức tham khảo ${Math.round(max * 0.6)})</span>
  <div class="secs">${secs.map(s => `<div class="sec"><span>${esc(s.name)}</span><b>${s.sc} điểm <span class="muted">(${s.c}/${s.n})</span></b></div>`).join('')}</div>
  <p class="muted" style="margin-bottom:0">Điểm mỗi phần quy về thang 100. Thang điểm chính thức của đề mới chưa có trong tài liệu mẫu, mức “đạt” 60% chỉ để tham khảo.</p></div>
  <div class="row"><button class="btn" id="rv">🔍 Xem lại đáp án</button><button class="btn ghost" id="nw">🔄 Làm đề mới</button></div>`;
  $('#rv').onclick = () => { EX.idx = 0; drawReview(); };
  $('#nw').onclick = () => { EX = null; location.hash = `#/l/${lv}/exam/go`; route(); };
}
function drawReview() {
  EX.view = 'review';
  const { qs, idx } = EX; const q = qs[idx]; const ok = isRight(q, EX.ans[idx]);
  app.innerHTML = `<div class="exambar"><button class="chip" id="bk" style="background:var(--pri)">‹ Kết quả</button><span class="spacer"></span><button class="chip" id="grid" style="background:var(--pri)">☰ Câu ${idx + 1}/${qs.length}</button></div>
  <div class="card"><div class="muted" style="font-weight:600;color:var(--pri-d)">${esc(q.part)}</div>
  <div class="qhead" style="margin-top:8px"><span class="qnum">${idx + 1}</span><b style="color:${ok ? 'var(--ok)' : 'var(--bad)'}">${ok ? '✓ Đúng' : EX.ans[idx] == null ? '— Chưa làm' : '✗ Sai'}</b></div>
  ${qBody(q, EX.ans[idx], true)}
  <div class="explain">${q.script ? `<div class="zhs">${zhLines(q.script)}</div>` : ''}<div style="margin-top:6px">💬 ${esc(q.exp || '')}</div></div></div>`;
  const ft = document.createElement('div'); ft.className = 'foot';
  ft.innerHTML = `<div class="wrap"><button class="btn ghost" id="pv" ${idx === 0 ? 'disabled' : ''}>‹ Trước</button><button class="btn" id="nx" ${idx === qs.length - 1 ? 'disabled' : ''}>Tiếp ›</button></div>`;
  $('.foot') && $('.foot').remove(); document.body.appendChild(ft);
  $('#pv').onclick = () => { if (idx > 0) { EX.idx--; drawReview(); window.scrollTo(0, 0); } };
  $('#nx').onclick = () => { if (idx < qs.length - 1) { EX.idx++; drawReview(); window.scrollTo(0, 0); } };
  $('#bk').onclick = showResult;
  $('#grid').onclick = () => navModal(true);
  bindQ(q, idx, true);
}

/* ========== Khởi động ========== */
route();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
