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

/* ========== Dữ liệu từ vựng ========== */
const WORDS = VOCAB.map((r, i) => ({ id: i, lv: r[0], w: r[1], py: r[2], vi: r[3], hv: r[4] }));
const LV_WORDS = { 1: [], 2: [], 3: [] };
WORDS.forEach(x => LV_WORDS[x.lv].push(x));
const PER = 20;
const lessonsOf = lv => { const ws = LV_WORDS[lv], out = []; for (let i = 0; i < ws.length; i += PER) out.push(ws.slice(i, i + PER)); return out; };
const LESSONS = { 1: lessonsOf(1), 2: lessonsOf(2), 3: lessonsOf(3) };
const wkey = x => x.w + '|' + x.py;
let known = new Set(store.get('known', []));
const saveKnown = () => store.set('known', [...known]);
const knownCount = ws => ws.reduce((n, x) => n + (known.has(wkey(x)) ? 1 : 0), 0);

/* ========== Pinyin tự động (ruby) ========== */
const PYW = {}, PYC = {};
WORDS.forEach(x => {
  const p = x.py.toLowerCase();
  if (!PYW[x.w]) PYW[x.w] = p;
  const ch = [...x.w], sy = p.split(/\s+/);
  if (ch.length > 1 && ch.length === sy.length) ch.forEach((c, i) => { if (!PYC[c]) PYC[c] = sy[i]; });
});
WORDS.forEach(x => { if ([...x.w].length === 1) PYC[x.w] = x.py.toLowerCase(); }); // chữ đơn có ưu tiên cao hơn
Object.assign(PYC, { 了: 'le', 的: 'de', 得: 'de', 地: 'de', 着: 'zhe', 过: 'guo', 吗: 'ma', 呢: 'ne', 吧: 'ba', 么: 'me', 们: 'men', 个: 'gè', 一: 'yī', 不: 'bù', 都: 'dōu', 还: 'hái', 子: 'zi', 和: 'hé', 么: 'me', 啊: 'a', 长: 'cháng', 行: 'xíng', 觉: 'jué', 中: 'zhōng', 好: 'hǎo', 为: 'wèi', 要: 'yào', 会: 'huì', 便: 'biàn', 只: 'zhǐ', 数: 'shù', 乐: 'lè', 头: 'tóu', 里: 'lǐ', 上: 'shàng', 下: 'xià', 儿: 'ér', 男: 'nán', 女: 'nǚ', 问: 'wèn' });
Object.assign(PYW, { 什么: 'shén me', 怎么: 'zěn me', 这么: 'zhè me', 那么: 'nà me', 一点儿: 'yì diǎnr', 哪儿: 'nǎr', 这儿: 'zhèr', 那儿: 'nàr', 觉得: 'jué de', 睡觉: 'shuì jiào', 音乐: 'yīn yuè', 银行: 'yín háng', 便宜: 'pián yi', 长大: 'zhǎng dà', 还给: 'huán gěi', 还是: 'hái shi', 头发: 'tóu fa', 东西: 'dōng xi', 朋友: 'péng you', 时候: 'shí hou' });
const isHan = c => /[㐀-鿿]/.test(c);
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
let showPy = store.get('py', true);
const zh = t => `<span class="zh">${showPy ? ruby(t) : esc(t)}</span>`;
const zhLines = t => t.split('\n').map(zh).join('<br>');
function syncPyBtn() { $('#pyToggle').classList.toggle('on', showPy); }
$('#pyToggle').onclick = () => { showPy = !showPy; store.set('py', showPy); syncPyBtn(); rerender(); };
syncPyBtn();

/* ========== Phát âm (Text-to-Speech) ========== */
let zhVoice = null;
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  zhVoice = vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang) || /chinese|mandarin/i.test(v.name)) || null;
}
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function utter(text, pitch = 1, rate = 0.85) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN'; if (zhVoice) u.voice = zhVoice; u.rate = rate; u.pitch = pitch;
  return u;
}
function speak(text, rate) {
  if (!('speechSynthesis' in window)) { toast('Trình duyệt không hỗ trợ đọc giọng nói'); return; }
  speechSynthesis.cancel(); speechSynthesis.speak(utter(text, 1, rate));
}
// Đọc kịch bản có vai 男/女 với cao độ khác nhau
function speakScript(script, question) {
  if (!('speechSynthesis' in window)) { toast('Trình duyệt không hỗ trợ đọc giọng nói'); return; }
  speechSynthesis.cancel();
  const lines = script.split('\n');
  if (question) lines.push('问：' + question);
  lines.forEach(l => {
    const m = l.match(/^(男|女)：(.*)$/);
    if (m) speechSynthesis.speak(utter(m[2], m[1] === '男' ? 0.7 : 1.3));
    else speechSynthesis.speak(utter(l, 1));
  });
}

/* ========== Router ========== */
let cleanup = null;
function rerender() {
  if (EX && /\/exam\/go$/.test(location.hash)) { if (!EX.done) return drawQ(); return EX.view === 'review' ? drawReview() : showResult(); }
  route();
}
window.addEventListener('hashchange', route);
function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
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
    if (v === 'grammar') return grammarView(lv);
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
  <div class="hero"><div class="bub">🫧</div><h1>Học HSK 1 · 2 · 3</h1><p>Bộ từ vựng HSK 3.0 mới · ngữ pháp · luyện tập · thi thử sát đề thật</p></div>
  ${[1, 2, 3].map(lv => {
    const ws = LV_WORDS[lv], k = knownCount(ws), best = Math.max(0, ...hist.filter(h => h.lv === lv).map(h => h.total));
    return `<a class="lvcard" href="#/l/${lv}"><div class="lvbadge">${lv}</div><div class="info"><b>HSK ${lv}</b>
      <div class="muted">${ws.length} từ · ${LESSONS[lv].length} bài${best ? ` · Thi cao nhất: ${best}` : ''}</div>
      <div class="bar"><i style="width:${(k / ws.length * 100).toFixed(1)}%"></i></div>
      <div class="muted">Đã thuộc ${k}/${ws.length}</div></div><span style="font-size:22px;color:var(--pri)">›</span></a>`;
  }).join('')}
  <div class="card"><b>💡 Mẹo</b><div class="muted">Bấm nút <b>拼 Pinyin</b> trên cùng để bật/tắt phiên âm. Bấm 🔊 để nghe phát âm. Trên điện thoại, chọn “Thêm vào màn hình chính” để dùng như một ứng dụng.</div></div>
  ${hist.length ? `<div class="card"><b>📝 Lịch sử thi thử</b>${hist.slice(-6).reverse().map(h => `<div class="hist"><span>HSK ${h.lv} · ${new Date(h.at).toLocaleDateString('vi-VN')}</span><b style="color:${h.passed ? 'var(--ok)' : 'var(--bad)'}">${h.total}/${h.max}</b></div>`).join('')}</div>` : ''}`;
}

/* ========== Trang cấp độ ========== */
function levelHub(lv) {
  const ws = LV_WORDS[lv], k = knownCount(ws);
  const tiles = [
    lv === 1 ? ['#/l/1/pron', '🗣️', 'Phát âm', 'Thanh điệu, thanh mẫu, vận mẫu'] : null,
    [`#/l/${lv}/vocab`, '📚', 'Từ vựng', `${ws.length} từ · ${LESSONS[lv].length} bài`],
    [`#/l/${lv}/cards/all`, '🃏', 'Thẻ ghi nhớ', 'Lật thẻ ôn từ chưa thuộc'],
    [`#/l/${lv}/grammar`, '🧩', 'Ngữ pháp', `${GRAMMAR[lv].length} điểm ngữ pháp`],
    [`#/l/${lv}/practice`, '🎯', 'Luyện tập', 'Trắc nghiệm nhanh 4 dạng'],
    [`#/l/${lv}/exam`, '📝', 'Thi thử', `${EXAMS[lv].sections.reduce((n, s) => n + s.parts.reduce((m, p) => m + p.n, 0), 0)} câu · ${EXAMS[lv].time} phút`],
  ].filter(Boolean);
  app.innerHTML = `${back('#/', 'Trang chủ')}
  <h1>HSK ${lv}</h1>
  <div class="card"><div class="row"><b>Tiến độ từ vựng</b><span class="spacer"></span><span class="muted">${k}/${ws.length}</span></div><div class="bar"><i style="width:${k / ws.length * 100}%"></i></div></div>
  <div class="grid g3">${tiles.map(t => `<a class="tile" href="${t[0]}"><span class="ic">${t[1]}</span><b>${t[2]}</b><span class="muted">${t[3]}</span></a>`).join('')}</div>`;
}

/* ========== Từ vựng ========== */
function wordRow(x) {
  const on = known.has(wkey(x));
  return `<div class="word"><div class="hz">${esc(x.w)}</div><div class="meta"><div class="py">${esc(x.py)} <span class="hv">${esc(x.hv)}</span></div><div>${esc(x.vi)}</div></div>
  <button class="ibtn" data-say="${esc(x.w)}" aria-label="Nghe">🔊</button><button class="ibtn k ${on ? 'on' : ''}" data-k="${x.id}" aria-label="Đã thuộc">✓</button></div>`;
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
  <input type="search" id="q" placeholder="Tìm chữ Hán, pinyin hoặc nghĩa tiếng Việt…">
  <div id="res"></div>
  <h2>Danh sách bài học</h2>
  <div class="lessons">${LESSONS[lv].map((ws, i) => { const k = knownCount(ws); return `<a class="lesson ${k === ws.length ? 'done' : ''}" href="#/l/${lv}/vocab/${i}"><b>Bài ${i + 1}</b><span class="muted">${k}/${ws.length}</span></a>`; }).join('')}</div>`;
  const q = $('#q'), res = $('#res');
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  q.oninput = () => {
    const t = norm(q.value.trim());
    if (!t) { res.innerHTML = ''; return; }
    const hits = LV_WORDS[lv].filter(x => x.w.includes(q.value.trim()) || norm(x.py).replace(/\s/g, '').includes(t.replace(/\s/g, '')) || norm(x.vi).includes(t) || norm(x.hv).includes(t)).slice(0, 40);
    res.innerHTML = `<div class="card">${hits.length ? hits.map(wordRow).join('') : '<span class="muted">Không tìm thấy</span>'}</div>`;
  };
  bindWords(res);
}
function lessonView(lv, i) {
  const ws = LESSONS[lv][i]; if (!ws) return vocabList(lv);
  app.innerHTML = `${back(`#/l/${lv}/vocab`, 'Danh sách bài')}
  <div class="row"><h1>HSK ${lv} · Bài ${i + 1}</h1></div>
  <div class="row" style="margin-bottom:12px"><a class="btn" href="#/l/${lv}/cards/${i}">🃏 Thẻ ghi nhớ</a><a class="btn pink" href="#/l/${lv}/quiz/hv/${i}">🎯 Kiểm tra bài</a></div>
  <div class="card" id="list">${ws.map(wordRow).join('')}</div>
  <div class="row">${i > 0 ? `<a class="btn ghost" href="#/l/${lv}/vocab/${i - 1}">‹ Bài ${i}</a>` : ''}<span class="spacer"></span>${i < LESSONS[lv].length - 1 ? `<a class="btn ghost" href="#/l/${lv}/vocab/${i + 1}">Bài ${i + 2} ›</a>` : ''}</div>`;
  bindWords($('#list'));
}

/* ========== Thẻ ghi nhớ ========== */
function flashcards(lv, which) {
  const all = which === 'all';
  let deck = all ? LV_WORDS[lv].filter(x => !known.has(wkey(x))) : (LESSONS[lv][+which] || []);
  if (all && !deck.length) deck = LV_WORDS[lv];
  deck = shuffle(deck); if (all) deck = deck.slice(0, 30);
  let i = 0, got = 0;
  const title = all ? 'Ôn từ chưa thuộc' : `Bài ${+which + 1}`;
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
    $('#say').onclick = () => speak(x.w);
    $('#no').onclick = () => { known.delete(wkey(x)); saveKnown(); i++; ft.remove(); draw(); };
    $('#yes').onclick = () => { known.add(wkey(x)); saveKnown(); got++; i++; ft.remove(); draw(); };
    speak(x.w);
  };
  draw();
}

/* ========== Ngữ pháp ========== */
function grammarView(lv) {
  app.innerHTML = `${back(`#/l/${lv}`, 'HSK ' + lv)}<h1>Ngữ pháp HSK ${lv}</h1>
  ${GRAMMAR[lv].map((g, i) => `<details class="card gp" ${i === 0 ? 'open' : ''}><summary>${i + 1}. ${esc(g.t)}</summary>
    <div class="f">${esc(g.f)}</div><div>${esc(g.d)}</div>
    ${g.ex.map(e => `<div class="ex"><div class="row" style="flex-wrap:nowrap"><div style="flex:1">${zh(e[0])}</div><button class="ibtn" data-say="${esc(e[0])}">🔊</button></div><div class="vi">${esc(e[1])}</div></div>`).join('')}
  </details>`).join('')}
  <a class="btn block" href="#/l/${lv}/exam">📝 Làm đề thi thử HSK ${lv}</a>`;
  app.onclick = e => { const s = e.target.closest('[data-say]'); if (s) speak(s.dataset.say); };
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
    ${LESSONS[lv].map((_, i) => `<option value="${i}" ${String(i) === String(sel) ? 'selected' : ''}>Bài ${i + 1}</option>`).join('')}
  </select></div>
  <div class="grid">${Object.entries(MODES).map(([k, m]) => `<button class="tile" data-m="${k}" style="text-align:left"><span class="ic">${{ hv: '🀄', vh: '🇻🇳', ls: '🎧', py: '🔤' }[k]}</span><b>${m[0]}</b><span class="muted">${m[1]}</span></button>`).join('')}</div>`;
  app.onclick = e => { const b = e.target.closest('[data-m]'); if (b) { const s = $('#scope').value; store.set('pscope' + lv, s); location.hash = `#/l/${lv}/quiz/${b.dataset.m}/${s}`; } };
  cleanup = () => { app.onclick = null; };
}
function quiz(lv, mode, scope) {
  mode = MODES[mode] ? mode : 'hv';
  const pool = scope === 'all' || scope == null ? LV_WORDS[lv] : (LESSONS[lv][+scope] || LV_WORDS[lv]);
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
    if (mode === 'ls') { $('#play').onclick = () => speak(x.w); speak(x.w); }
    let answered = false;
    app.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const k = +b.dataset.i;
      app.querySelectorAll('.opt')[ans].classList.add('ok');
      if (k === ans) score++; else { b.classList.add('bad'); wrong.push(x); }
      $('#fb').innerHTML = `<div class="explain"><b style="font-size:20px">${esc(x.w)}</b> · ${esc(x.py)} · <span style="text-transform:capitalize">${esc(x.hv)}</span><br>${esc(x.vi)}</div>
      <button class="btn block" id="nx" style="margin-top:12px">${i + 1 < qs.length ? 'Câu tiếp ›' : 'Xem kết quả'}</button>`;
      if (mode !== 'ls') speak(x.w);
      $('#nx').onclick = () => { i++; draw(); };
    });
  };
  draw();
}

/* ========== Thi thử ========== */
function poolFor(lv, key) {
  // Ưu tiên câu của cấp hiện tại, sau đó bổ sung từ cấp thấp hơn
  let out = [];
  for (let l = lv; l >= 1; l--) if (BANK[l][key]) out = out.concat(shuffle(BANK[l][key]).map(it => ({ it, l })));
  return out;
}
function allPics(lv) { const s = []; for (let l = 1; l <= lv; l++) { BANK[l].pics.forEach(p => s.push(p[1])); (BANK[l].sents || []).forEach(p => s.push(p[1])); (BANK[l].dpics || []).forEach(p => s.push(p[1])); } return [...new Set(s)]; }
function picOpts(lv, correct, n = 3) { const o = [correct, ...pick(allPics(lv).filter(e => e !== correct), n - 1)]; return shuffle(o); }
const TF = ['✓ Đúng', '✗ Sai'];

function buildExam(lv) {
  const E = EXAMS[lv], used = {}, qs = [];
  const take = key => { used[key] = used[key] || poolFor(lv, key); return used[key].shift(); };
  E.sections.forEach((sec, si) => sec.parts.forEach((pt, pi) => {
    for (let k = 0; k < pt.n; k++) {
      const q = { si, pi, part: pt.t, sec: sec.name };
      const g = pt.g;
      if (g === 'picTF') {
        const a = take('pics'); if (!a) continue; const [w, e] = a.it;
        const truth = Math.random() < 0.5; let shown = e;
        if (!truth) shown = pick(allPics(lv).filter(x => x !== e), 1)[0];
        Object.assign(q, { kind: 'mc', pic: shown, audio: pt.audio ? w : null, text: pt.audio ? null : w, opts: TF, ans: truth ? 0 : 1, exp: `${w} = ${e}${truth ? '' : ' (tranh không khớp)'}`, script: w });
      } else if (g === 'sentPic') {
        const a = take('sents'); if (!a) continue; const [s, e, t] = a.it; const o = picOpts(lv, e, pt.audio ? 3 : 4);
        Object.assign(q, { kind: 'mc', audio: pt.audio ? s : null, text: pt.audio ? null : s, picOpts: true, opts: o, ans: o.indexOf(e), script: s, exp: t });
      } else if (g === 'sentTF') {
        const a = take('sents'); if (!a) continue; const [s, e, t] = a.it; const truth = Math.random() < 0.5;
        const shown = truth ? e : pick(allPics(lv).filter(x => x !== e), 1)[0];
        Object.assign(q, { kind: 'mc', pic: shown, audio: s, opts: TF, ans: truth ? 0 : 1, script: s, exp: t + ` (tranh đúng: ${e})` });
      } else if (g === 'dpic') {
        const a = take('dpics'); if (!a) continue; const [s, e, t] = a.it; const o = picOpts(lv, e, 6);
        Object.assign(q, { kind: 'mc', audio: s, script: s, picOpts: true, opts: o, ans: o.indexOf(e), exp: t });
      } else if (g === 'dialog') {
        const a = take(pt.pool); if (!a) continue; const [s, qq, o, an, t] = a.it;
        Object.assign(q, { kind: 'mc', audio: s, question: qq, script: s + '\n问：' + qq, opts: o, ans: an, exp: t });
      } else if (g === 'qa') {
        const a = take('qa'); if (!a) continue; const [qq, aa, t] = a.it;
        const dist = pick(poolFor(lv, 'qa').map(x => x.it[1]).filter(x => x !== aa), 3); const o = shuffle([aa, ...dist]);
        Object.assign(q, { kind: 'mc', text: qq, opts: o, ans: o.indexOf(aa), exp: t });
      } else if (g === 'fill') {
        const a = take('fill'); if (!a) continue; const [s, w, t] = a.it;
        const dist = pick([...new Set(poolFor(lv, 'fill').map(x => x.it[1]))].filter(x => x !== w), 3); const o = shuffle([w, ...dist]);
        Object.assign(q, { kind: 'mc', text: s, opts: o, ans: o.indexOf(w), exp: s.replace('（　）', `【${w}】`) + ' — ' + t });
      } else if (g === 'judge') {
        const a = take('judge'); if (!a) continue; const [p, st, tr, t] = a.it;
        Object.assign(q, { kind: 'mc', audio: pt.audio ? p : null, text: pt.audio ? null : p, star: st, opts: TF, ans: tr ? 0 : 1, script: p, exp: t });
      } else if (g === 'read') {
        const a = take('read'); if (!a) continue; const [p, qq, o, an, t] = a.it;
        Object.assign(q, { kind: 'mc', text: p, question: qq, opts: o, ans: an, exp: t, passage: true });
      } else if (g === 'order') {
        const a = take('order'); if (!a) continue; const toks = a.it[0].split('|');
        let sh = shuffle(toks); let guard = 0; while (sh.join('') === toks.join('') && guard++ < 5) sh = shuffle(toks);
        Object.assign(q, { kind: 'order', tokens: sh, ans: toks.join(''), exp: toks.join('') + '。 — ' + a.it[1] });
      } else if (g === 'write') {
        const a = take('write'); if (!a) continue; const [s, py, c, t] = a.it;
        Object.assign(q, { kind: 'write', text: s, py, ans: c, exp: s.replace('（　）', `【${c}】`) + ' — ' + t });
      }
      if (q.kind) qs.push(q);
    }
  }));
  return qs;
}

function examIntro(lv) {
  const E = EXAMS[lv];
  const total = E.sections.length * 100;
  app.innerHTML = `${back(`#/l/${lv}`, 'HSK ' + lv)}<h1>Thi thử HSK ${lv}</h1>
  <div class="card"><div class="row"><span>⏱️ Thời gian: <b>${E.time} phút</b></span><span>🏆 Đạt: <b>${E.pass}/${total}</b></span></div>
  <p class="muted">Đề được tạo ngẫu nhiên theo đúng cấu trúc đề HSK ${lv} chính thức. Phần nghe sẽ được đọc bằng giọng máy (cần bật âm lượng); mỗi bài nghe được nghe lại tối đa 2 lần như đề thật.</p></div>
  ${E.sections.map(s => `<div class="card"><b>${esc(s.name)}</b> <span class="muted">(${s.parts.reduce((n, p) => n + p.n, 0)} câu · 100 điểm)</span><ul style="margin:6px 0 0;padding-left:20px">${s.parts.map(p => `<li>${esc(p.t)} <span class="muted">— ${p.n} câu</span></li>`).join('')}</ul></div>`).join('')}
  ${!zhVoice && 'speechSynthesis' in window ? '<div class="card" style="background:var(--pink-s)">⚠️ Chưa tìm thấy giọng đọc tiếng Trung trên thiết bị. Nếu không nghe được, hãy cài giọng “Tiếng Trung (Trung Quốc)” trong cài đặt Chuyển văn bản thành giọng nói, hoặc dùng nút “Xem lời thoại”.</div>' : ''}
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
  cleanup = () => clearInterval(timer);
  drawQ(); tick();
}
function qBody(q, sel, review) {
  let h = '';
  if (q.audio) h += `<div class="audio"><button class="ibtn" id="play">🔊</button><div style="flex:1"><b>Nghe</b><div class="muted" id="plays"></div></div>${review ? '' : '<button class="chip" id="scr" style="background:var(--pri-s);color:var(--pri-d)">Xem lời thoại</button>'}</div><div id="scrbox"></div>`;
  if (q.pic) h += `<div class="qpic">${q.pic}</div>`;
  if (q.text && q.passage) h += `<div class="passage">${zh(q.text)}</div>`;
  else if (q.text && q.kind !== 'write') h += `<div class="passage" style="text-align:center;font-size:22px">${zh(q.text)}</div>`;
  if (q.star) h += `<div class="star">${zh(q.star)}</div>`;
  if (q.question && (!q.audio || review)) h += `<div class="star">${zh(q.question)}</div>`;
  if (q.kind === 'mc') {
    h += `<div class="opts ${q.picOpts ? 'pics' : ''}">${q.opts.map((o, k) => {
      let c = sel === k ? 'sel' : '';
      if (review) c = k === q.ans ? 'ok' : (sel === k ? 'bad' : '');
      return q.picOpts ? `<button class="opt pic ${c}" data-i="${k}"><span>${o}</span><span class="l">${L[k]}</span></button>`
        : `<button class="opt ${c}" data-i="${k}"><span class="l">${L[k]}</span><span>${q.opts === TF ? esc(o) : zh(o)}</span></button>`;
    }).join('')}</div>`;
  } else if (q.kind === 'order') {
    const chosen = sel || [];
    h += `<div class="muted" style="margin-top:8px">Chạm vào các từ theo đúng thứ tự:</div>
    <div class="tokens ans" id="ans">${chosen.map((ti, k) => `<button class="tok" data-r="${k}">${esc(q.tokens[ti])}</button>`).join('') || '<span class="muted">…</span>'}</div>
    <div class="tokens" id="pool">${q.tokens.map((t, ti) => chosen.includes(ti) ? '' : `<button class="tok" data-t="${ti}">${esc(t)}</button>`).join('')}</div>`;
    if (review) h += `<div class="fb ${orderStr(q, sel) === q.ans ? 'ok' : 'bad'}">Đáp án: ${zh(q.ans + '。')}</div>`;
  } else if (q.kind === 'write') {
    h += `<div class="passage" style="text-align:center;font-size:22px">${esc(q.text).replace('（　）', `<ruby><span style="display:inline-block;min-width:1.6em;border-bottom:2px solid var(--pink)">${esc(sel || '')}</span><rt style="font-size:.6em;color:var(--pink)">${esc(q.py)}</rt></ruby>`)}</div>
    ${review ? `<div class="fb ${sel === q.ans ? 'ok' : 'bad'}">Đáp án: ${esc(q.ans)}</div>` : `<input type="text" id="wr" maxlength="2" placeholder="Viết chữ Hán (${esc(q.py)})" value="${esc(sel || '')}" style="margin-top:12px;font-size:22px;text-align:center" lang="zh-CN">`}`;
  }
  return h;
}
const orderStr = (q, sel) => (sel || []).map(i => q.tokens[i]).join('');
function isRight(q, a) {
  if (a == null) return false;
  if (q.kind === 'mc') return a === q.ans;
  if (q.kind === 'order') return orderStr(q, a) === q.ans;
  if (q.kind === 'write') return a.trim() === q.ans;
  return false;
}
function drawQ() {
  const { qs, idx, lv } = EX; const q = qs[idx];
  const prevPart = idx > 0 && qs[idx - 1].part === q.part;
  app.innerHTML = `<div class="exambar"><b>HSK ${lv}</b><span class="muted">${esc(q.sec)}</span><span class="spacer"></span><span class="timer" id="tm">--:--</span><button class="chip" id="grid" style="background:var(--pri);">☰ ${EX.ans.filter(a => a != null).length}/${qs.length}</button></div>
  <div class="card">${prevPart ? '' : ''}<div class="muted" style="font-weight:600;color:var(--pri-d)">${esc(q.part)}</div>
  <div class="qhead" style="margin-top:8px"><span class="qnum">${idx + 1}</span></div>
  ${qBody(q, EX.ans[idx], false)}</div>`;
  const ft = document.createElement('div'); ft.className = 'foot';
  ft.innerHTML = `<div class="wrap"><button class="btn ghost" id="pv" ${idx === 0 ? 'disabled' : ''}>‹ Trước</button>${idx === qs.length - 1 ? '<button class="btn pink" id="sub">Nộp bài</button>' : '<button class="btn" id="nx">Tiếp ›</button>'}</div>`;
  $('.foot') && $('.foot').remove(); document.body.appendChild(ft);
  const go = n => { EX.idx = n; drawQ(); window.scrollTo(0, 0); };
  $('#pv').onclick = () => idx > 0 && go(idx - 1);
  if ($('#nx')) $('#nx').onclick = () => go(idx + 1);
  if ($('#sub')) $('#sub').onclick = () => { const left = EX.ans.filter(a => a == null).length + (qs.length - EX.ans.length); if (confirm(left > 0 ? `Còn ${left} câu chưa làm. Nộp bài?` : 'Nộp bài?')) finishExam(); };
  $('#grid').onclick = () => navModal(false);
  bindQ(q, idx, false);
  const left = EXAMS[lv].time * 60 - Math.floor((Date.now() - EX.start) / 1000);
  $('#tm').textContent = `${String(Math.max(0, left) / 60 | 0).padStart(2, '0')}:${String(Math.max(0, left) % 60).padStart(2, '0')}`;
}
function bindQ(q, idx, review) {
  if (q.audio) {
    const pc = () => { const p = $('#plays'); if (p && !review) p.textContent = `Đã nghe ${EX.plays[idx] || 0}/2 lần`; };
    const play = () => {
      if (!review) { if ((EX.plays[idx] || 0) >= 2) { toast('Đã nghe đủ 2 lần (như đề thật)'); return; } EX.plays[idx] = (EX.plays[idx] || 0) + 1; pc(); }
      speakScript(q.audio, q.question);
    };
    $('#play').onclick = play; pc();
    if (!review && !EX.plays[idx]) setTimeout(play, 300);
    if ($('#scr')) $('#scr').onclick = () => { $('#scrbox').innerHTML = `<div class="explain zhs">${zhLines(q.audio)}</div>`; $('#scr').remove(); };
  }
  if (review) return;
  if (q.kind === 'mc') app.querySelectorAll('.opt').forEach(b => b.onclick = () => { EX.ans[idx] = +b.dataset.i; app.querySelectorAll('.opt').forEach(x => x.classList.toggle('sel', x === b)); updCount(); });
  if (q.kind === 'order') {
    $('#pool').onclick = e => { const t = e.target.closest('[data-t]'); if (!t) return; EX.ans[idx] = (EX.ans[idx] || []).concat(+t.dataset.t); if (!EX.ans[idx].length) EX.ans[idx] = null; redrawBody(q, idx); };
    $('#ans').onclick = e => { const t = e.target.closest('[data-r]'); if (!t) return; const a = EX.ans[idx].slice(); a.splice(+t.dataset.r, 1); EX.ans[idx] = a.length ? a : null; redrawBody(q, idx); };
  }
  if (q.kind === 'write') $('#wr').oninput = e => { EX.ans[idx] = e.target.value.trim() || null; updCount(); };
}
function redrawBody() { drawQ(); }
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
  speechSynthesis.cancel();
  const E = EXAMS[EX.lv];
  const secs = E.sections.map((s, si) => { const qs = EX.qs.map((q, i) => [q, i]).filter(([q]) => q.si === si); const c = qs.filter(([q, i]) => isRight(q, EX.ans[i])).length; return { name: s.name, c, n: qs.length, sc: Math.round(c / qs.length * 100) }; });
  const total = secs.reduce((a, s) => a + s.sc, 0), max = secs.length * 100, passed = total >= E.pass;
  EX.result = { secs, total, max, passed };
  const h = store.get('exams', []); h.push({ lv: EX.lv, total, max, passed, at: Date.now() }); store.set('exams', h.slice(-30));
  showResult();
}
function showResult() {
  EX.view = 'result';
  const { secs, total, max, passed } = EX.result; const lv = EX.lv;
  const f = $('.foot'); if (f) f.remove();
  const mins = Math.round((Date.now() - EX.start) / 60000);
  app.innerHTML = `${back(`#/l/${lv}`, 'HSK ' + lv)}
  <div class="card" style="text-align:center"><div class="muted">Kết quả thi thử HSK ${lv}</div><div class="score">${total}<span style="font-size:22px;color:var(--muted)">/${max}</span></div>
  <span class="pass ${passed ? 'y' : 'n'}">${passed ? '🎉 ĐẠT' : 'CHƯA ĐẠT'} (cần ${EXAMS[lv].pass})</span>
  <div class="secs">${secs.map(s => `<div class="sec"><span>${esc(s.name)}</span><b>${s.sc} điểm <span class="muted">(${s.c}/${s.n})</span></b></div>`).join('')}</div></div>
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
