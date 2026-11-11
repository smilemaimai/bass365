/* Bass 365 — 音感訓練 & 樂理 */
(function () {
  // ---------- 拼字（正確的音名：F 大調的 4 級是 Bb 而不是 A#） ----------
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], LPC = [0, 2, 4, 5, 7, 9, 11];
  const ACC = { '-2': 'bb', '-1': 'b', '0': '', '1': '#', '2': '##' };
  const PCN = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
  function parse(n) { const li = LETTERS.indexOf(n[0]); const s = n.slice(1); const a = s === '#' ? 1 : s === '##' ? 2 : s === 'b' ? -1 : s === 'bb' ? -2 : 0; return { li, pc: (LPC[li] + a + 12) % 12 }; }
  function spell(root, num, semis) {
    const r = parse(root), li = (r.li + num - 1) % 7, pc = (r.pc + semis) % 12;
    let a = ((pc - LPC[li]) % 12 + 12) % 12; if (a > 6) a -= 12;
    return Math.abs(a) > 2 ? null : LETTERS[li] + ACC[a];
  }
  const IV = {
    m2: [2, 1, '小二度'], M2: [2, 2, '大二度'], m3: [3, 3, '小三度'], M3: [3, 4, '大三度'], P4: [4, 5, '完全四度'],
    A4: [4, 6, '增四度'], d5: [5, 6, '減五度'], P5: [5, 7, '完全五度'], A5: [5, 8, '增五度'], m6: [6, 8, '小六度'],
    M6: [6, 9, '大六度'], m7: [7, 10, '小七度'], M7: [7, 11, '大七度'], d7: [7, 9, '減七度'], P8: [8, 12, '完全八度'],
  };
  const TT = '三全音（增四／減五度）';
  const SEMI_ZH = { 1: '小二度', 2: '大二度', 3: '小三度', 4: '大三度', 5: '完全四度', 6: TT, 7: '完全五度', 8: '小六度', 9: '大六度', 10: '小七度', 11: '大七度', 12: '完全八度' };
  const SONG = { 1: '電影《大白鯊》主題', 2: '〈生日快樂〉開頭兩音', 4: '〈When the Saints Go Marching In〉開頭', 5: '〈結婚進行曲〉開頭', 6: '《辛普森家庭》主題開頭', 7: '〈小星星〉「一閃→一閃」', 9: '〈My Bonnie〉開頭', 12: '〈Over the Rainbow〉開頭「Some-where」' };
  const CQ = {
    '': { zh: '大三和弦', iv: ['M3', 'P5'] }, m: { zh: '小三和弦', iv: ['m3', 'P5'] }, dim: { zh: '減三和弦', iv: ['m3', 'd5'] }, aug: { zh: '增三和弦', iv: ['M3', 'A5'] },
    maj7: { zh: '大七和弦', iv: ['M3', 'P5', 'M7'] }, 7: { zh: '屬七和弦', iv: ['M3', 'P5', 'm7'] }, m7: { zh: '小七和弦', iv: ['m3', 'P5', 'm7'] },
    m7b5: { zh: '半減七和弦', iv: ['m3', 'd5', 'm7'] }, dim7: { zh: '減七和弦', iv: ['m3', 'd5', 'd7'] },
  };
  const chordTones = (root, q) => { const t = [root, ...CQ[q].iv.map(k => spell(root, IV[k][0], IV[k][1]))]; return t.includes(null) ? null : t; };
  const MAJ = [{ n: 'C', s: 0 }, { n: 'G', s: 1 }, { n: 'D', s: 2 }, { n: 'A', s: 3 }, { n: 'E', s: 4 }, { n: 'B', s: 5 }, { n: 'F#', s: 6 }, { n: 'F', s: -1 }, { n: 'Bb', s: -2 }, { n: 'Eb', s: -3 }, { n: 'Ab', s: -4 }, { n: 'Db', s: -5 }, { n: 'Gb', s: -6 }];
  const MAJ_ST = [0, 2, 4, 5, 7, 9, 11], MIN_ST = [0, 2, 3, 5, 7, 8, 10];
  const scale = (root, st) => st.map((s, i) => spell(root, i + 1, s));
  const MAJ_Q = ['', 'm', 'm', '', '', 'm', 'dim'], MAJ_R = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const MAJ_Q7 = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'], MAJ_R7 = ['Imaj7', 'iim7', 'iiim7', 'IVmaj7', 'V7', 'vim7', 'viim7b5'];
  const MIN_Q = ['m', 'dim', '', 'm', 'm', '', ''], MIN_R = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
  const MODES = [
    { k: 'ionian', zh: '伊奧尼安', deg: 1, st: [0, 2, 4, 5, 7, 9, 11], ch: '就是大調音階本身' },
    { k: 'dorian', zh: '多利安', deg: 2, st: [0, 2, 3, 5, 7, 9, 10], ch: '大六度（自然小調升高第 6 級）' },
    { k: 'phrygian', zh: '弗里吉安', deg: 3, st: [0, 1, 3, 5, 7, 8, 10], ch: '小二度 b2（自然小調降低第 2 級）' },
    { k: 'lydian', zh: '利地安', deg: 4, st: [0, 2, 4, 6, 7, 9, 11], ch: '增四度 #4（大調升高第 4 級）' },
    { k: 'mixolydian', zh: '混合利地安', deg: 5, st: [0, 2, 4, 5, 7, 9, 10], ch: '小七度 b7（大調降低第 7 級）' },
    { k: 'aeolian', zh: '愛奧利安', deg: 6, st: [0, 2, 3, 5, 7, 8, 10], ch: '就是自然小調本身' },
    { k: 'locrian', zh: '洛克里安', deg: 7, st: [0, 1, 3, 5, 6, 8, 10], ch: '減五度 b5（還有 b2）' },
  ];
  const SN = ['E', 'A', 'D', 'G'], OPEN = [28, 33, 38, 43];

  // ---------- 小工具 ----------
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function mc(answer, pool, n = 4) {
    const opts = [answer]; for (const p of shuffle(pool)) { if (opts.length >= n) break; if (p != null && !opts.includes(p)) opts.push(p); }
    return shuffle(opts);
  }
  const pcEq = (a, b) => (((a - b) % 12) + 12) % 12 === 0;
  const pcn = (m) => PCN[((m % 12) + 12) % 12];
  function posOf(m) { let best = null; for (let s = 0; s < 4; s++) { const f = m - OPEN[s]; if (f >= 0 && f <= 12 && (!best || f < best.f)) best = { s, f }; } return best ? `${SN[best.s]} 弦${best.f === 0 ? '空弦' : '第 ' + best.f + ' 格'}` : ''; }
  const mkey = (n) => MAJ.find(k => k.n === n);

  // ================= 樂理題庫 =================
  const T = {};
  T.fret = {
    title: '指板音名', icon: '🎸',
    notes: ['標準調音由低到高：E–A–D–G，相鄰兩弦差完全四度（5 格）', '每一格是半音；E–F、B–C 之間沒有黑鍵，只差一格', '第 12 格是空弦的高八度', '八度指型：往上兩條弦、往後兩格'],
    gen: [
      () => { const s = ri(0, 3), f = ri(0, 12), a = pcn(OPEN[s] + f); return { q: `${SN[s]} 弦${f === 0 ? '空弦' : `第 ${f} 格`}是什麼音？`, opts: mc(a, PCN), a, ex: `${SN[s]} 弦空弦是 ${SN[s]}，往上 ${f} 個半音就是 ${a}。` }; },
      () => { const s = ri(0, 3); const nat = [0, 2, 4, 5, 7, 9, 11]; const pc = pick(nat); const f = ((pc - OPEN[s] % 12) + 12) % 12; const a = `第 ${f} 格`; const pool = [f - 2, f - 1, f + 1, f + 2, f + 3].filter(x => x >= 0 && x <= 12).map(x => `第 ${x} 格`); return { q: `${SN[s]} 弦上的 ${LETTERS[nat.indexOf(pc)]}，在第幾格？（0–11 格內）`, opts: mc(a, pool), a: a, ex: `從 ${SN[s]} 數到 ${LETTERS[nat.indexOf(pc)]} 是 ${f} 個半音，所以在第 ${f} 格${f === 0 ? '（空弦）' : ''}。` }; },
      () => { const s = ri(0, 1), f = ri(1, 7), a = `${SN[s + 2]} 弦第 ${f + 2} 格`; const pool = [`${SN[s + 2]} 弦第 ${f + 1} 格`, `${SN[s + 1]} 弦第 ${f + 2} 格`, `${SN[s + 2]} 弦第 ${f} 格`, `${SN[s + 1]} 弦第 ${f + 7 <= 12 ? f + 7 : f + 5} 格`]; return { q: `${SN[s]} 弦第 ${f} 格（${pcn(OPEN[s] + f)}）的高八度，最近的按法是？`, opts: mc(a, pool), a, ex: '八度指型：往上兩條弦、往後兩格。' }; },
      () => { const s = ri(1, 3), f = ri(0, 4), m = OPEN[s] + f, a = `${SN[s - 1]} 弦第 ${f + 5} 格`; const pool = [`${SN[s - 1]} 弦第 ${f + 4} 格`, `${SN[s - 1]} 弦第 ${f + 7} 格`, `${SN[s - 1]} 弦第 ${f + 6} 格`]; return { q: `${SN[s]} 弦${f === 0 ? '空弦' : `第 ${f} 格`}（${pcn(m)}），在低一條弦上的同音位置是？`, opts: mc(a, pool), a, ex: '相鄰兩弦差 5 格（完全四度），所以低一條弦要往上 5 格才是同一個音。' }; },
    ],
  };
  T.interval = {
    title: '音程', icon: '↕',
    notes: ['音程＝兩個音的距離，用「度數」＋「性質」表示', '度數看字母：C→E 是 C D E，三個字母＝三度', '半音數：小二 1、大二 2、小三 3、大三 4、完全四 5、三全音 6、完全五 7、小六 8、大六 9、小七 10、大七 11、八度 12', '一度、四度、五度、八度叫「完全」；其他是大或小'],
    gen: [
      () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'F#']); const k = pick(['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8']); const u = spell(r, IV[k][0], IV[k][1]); if (!u) return null; const a = IV[k][2]; const pool = Object.keys(IV).filter(x => IV[x][1] !== IV[k][1]).map(x => IV[x][2]); return { q: `${r} 往上到 ${u}，是什麼音程？`, opts: mc(a, pool), a, ex: `${r}→${u} 跨 ${IV[k][0]} 個字母（${IV[k][0]} 度），共 ${IV[k][1]} 個半音，所以是${a}。` }; },
      () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb']); const k = pick(['M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'm7', 'M7']); const u = spell(r, IV[k][0], IV[k][1]); if (!u) return null; const pool = [spell(r, IV[k][0], IV[k][1] - 1), spell(r, IV[k][0], IV[k][1] + 1), spell(r, IV[k][0] - 1 || 1, IV[k][1] - 1), spell(r, IV[k][0] + 1, IV[k][1] + 1), spell(r, IV[k][0] + 1, IV[k][1] + 2)]; return { q: `${r} 往上一個${IV[k][2]}是哪個音？`, opts: mc(u, pool), a: u, ex: `${IV[k][2]}＝${IV[k][0]} 度、${IV[k][1]} 個半音。從 ${r} 數 ${IV[k][0]} 個字母，再調整升降到 ${IV[k][1]} 個半音，得到 ${u}。` }; },
      () => { const s = ri(1, 12); const a = `${s} 個半音`; const pool = [s - 2, s - 1, s + 1, s + 2].filter(x => x > 0 && x <= 12).map(x => `${x} 個半音`); return { q: `${SEMI_ZH[s]}有幾個半音？`, opts: mc(a, pool), a, ex: `${SEMI_ZH[s]}＝${s} 個半音，在同一條弦上就是相差 ${s} 格。${SONG[s] ? `記憶法：${SONG[s]}。` : ''}` }; },
      () => { const k = pick(['m3', 'M3', 'P4', 'P5', 'M2', 'M6']); const inv = { m3: 'M6', M3: 'm6', P4: 'P5', P5: 'P4', M2: 'm7', M6: 'm3' }[k]; const a = IV[inv][2]; const pool = ['m3', 'M3', 'P4', 'P5', 'm6', 'M6', 'm7', 'M2'].filter(x => x !== inv).map(x => IV[x][2]); return { q: `${IV[k][2]}轉位（上下顛倒）後變成什麼音程？`, opts: mc(a, pool), a, ex: `轉位規則：度數相加等於 9、大變小、小變大、完全不變。所以${IV[k][2]} → ${a}。在貝斯上，同一個音往上彈或往下彈就是這個關係。` }; },
    ],
  };
  T.scale = {
    title: '音階', icon: '🎼',
    notes: ['大調音階公式：全 全 半 全 全 全 半', '自然小調公式：全 半 全 全 半 全 全', '每個字母只出現一次，所以 F 大調寫 Bb 而不是 A#', '小調五聲：1 b3 4 5 b7；大調五聲：1 2 3 5 6；藍調音階＝小調五聲＋b5'],
    gen: [
      () => { const K = pick(MAJ).n, d = ri(2, 7), sc = scale(K, MAJ_ST), a = sc[d - 1]; const pool = [...sc.filter(x => x !== a), spell(K, d, MAJ_ST[d - 1] - 1), spell(K, d, MAJ_ST[d - 1] + 1)]; return { q: `${K} 大調的第 ${d} 級音是？`, opts: mc(a, pool), a, ex: `${K} 大調：${sc.join(' ')}。第 ${d} 級是 ${a}。` }; },
      () => { const K = pick(MAJ.filter(k => Math.abs(k.s) <= 5)).n, sc = scale(K, MAJ_ST); const d = ri(2, 7); const wrong = spell(K, d, MAJ_ST[d - 1] + (Math.random() < 0.5 ? -1 : 1)); if (!wrong) return null; const others = shuffle(sc.filter((x, i) => i !== d - 1)).slice(0, 3); return { q: `哪一個音「不」在 ${K} 大調裡？`, opts: mc(wrong, others), a: wrong, ex: `${K} 大調是 ${sc.join(' ')}，第 ${d} 級應該是 ${sc[d - 1]}，不是 ${wrong}。` }; },
      () => { const items = [['大調音階', '全 全 半 全 全 全 半'], ['自然小調', '全 半 全 全 半 全 全'], ['和聲小調', '全 半 全 全 半 增二 半']]; const [nm, a] = pick(items); const pool = ['全 全 半 全 全 全 半', '全 半 全 全 半 全 全', '全 全 全 半 全 全 半', '全 全 半 全 全 半 全', '全 半 全 全 半 增二 半']; return { q: `${nm}的全半音公式是？`, opts: mc(a, pool), a, ex: `${nm}：${a}。（全＝2 格、半＝1 格、增二＝3 格）` }; },
      () => { const K = pick(['A', 'E', 'B', 'D', 'G', 'C', 'F']), d = ri(2, 7), sc = scale(K, MIN_ST), a = sc[d - 1]; const pool = [...sc.filter(x => x !== a), spell(K, d, MIN_ST[d - 1] + 1)]; return { q: `${K} 自然小調的第 ${d} 級音是？`, opts: mc(a, pool), a, ex: `${K} 自然小調：${sc.join(' ')}。` }; },
      () => { const K = pick(['A', 'E', 'D', 'G', 'C']); const t = pick([['小調五聲', [0, 3, 5, 7, 10], [1, 3, 4, 5, 7]], ['大調五聲', [0, 2, 4, 7, 9], [1, 2, 3, 5, 6]]]); const sc = t[1].map((s, i) => spell(K, t[2][i], s)); const a = sc.join(' '); const alt = t[0] === '小調五聲' ? [[0, 2, 4, 7, 9], [1, 2, 3, 5, 6]] : [[0, 3, 5, 7, 10], [1, 3, 4, 5, 7]]; const p1 = alt[0].map((s, i) => spell(K, alt[1][i], s)).join(' '); const p2 = [0, 2, 3, 7, 10].map((s, i) => spell(K, [1, 2, 3, 5, 7][i], s)).join(' '); const p3 = [0, 3, 5, 6, 10].map((s, i) => spell(K, [1, 3, 4, 5, 7][i], s)).join(' '); return { q: `${K} ${t[0]}音階是哪五個音？`, opts: mc(a, [p1, p2, p3]), a, ex: `${t[0]}＝${t[0] === '小調五聲' ? '1 b3 4 5 b7' : '1 2 3 5 6'}，所以是 ${a}。` }; },
    ],
  };
  T.key = {
    title: '調號與五度圈', icon: '⭕',
    notes: ['升記號順序：F C G D A E B；降記號順序：B E A D G C F', '五度圈順時針（往上完全五度）每次多一個升記號：C G D A E B F#', '逆時針（往上完全四度）每次多一個降記號：C F Bb Eb Ab Db Gb', '關係小調＝大調的第 6 級，兩者調號相同'],
    gen: [
      () => { const K = pick(MAJ); const typ = K.s >= 0 ? '升' : '降', n = Math.abs(K.s); const a = n === 0 ? '沒有升降記號' : `${n} 個${typ}記號`; const pool = [0, 1, 2, 3, 4, 5, 6].filter(x => x !== n).map(x => x === 0 ? '沒有升降記號' : `${x} 個${typ}記號`).concat(n ? [`${n} 個${typ === '升' ? '降' : '升'}記號`] : []); return { q: `${K.n} 大調的調號是？`, opts: mc(a, pool), a, ex: `${K.n} 大調${n ? `有 ${n} 個${typ}記號：${(typ === '升' ? 'F# C# G# D# A# E# B#' : 'Bb Eb Ab Db Gb Cb Fb').split(' ').slice(0, n).join(' ')}` : '沒有升降記號'}。` }; },
      () => { const K = pick(MAJ.filter(k => k.s !== 0)); const typ = K.s > 0 ? '升' : '降', n = Math.abs(K.s); const pool = MAJ.map(k => k.n); return { q: `有 ${n} 個${typ}記號的大調是？`, opts: mc(K.n, pool), a: K.n, ex: `${typ === '升' ? '順' : '逆'}時針沿著五度圈數 ${n} 格：${typ === '升' ? 'C G D A E B F#' : 'C F Bb Eb Ab Db Gb'} → ${K.n}。` }; },
      () => { const K = pick(MAJ.slice(0, 11)).n, sc = scale(K, MAJ_ST), a = sc[5] + 'm'; return { q: `${K} 大調的關係小調是？`, opts: mc(a, [sc[1] + 'm', sc[2] + 'm', K + 'm', sc[4] + 'm']), a, ex: `關係小調是大調的第 6 級：${K} 大調第 6 級是 ${sc[5]}，所以是 ${a}，兩者調號相同。` }; },
      () => { const K = pick(MAJ.slice(0, 11)).n; const up = Math.random() < 0.5; const a = up ? spell(K, 5, 7) : spell(K, 4, 5); const pool = [spell(K, 5, 7), spell(K, 4, 5), spell(K, 2, 2), spell(K, 6, 9), spell(K, 3, 4)]; return { q: `五度圈上，${K} ${up ? '順時針（多一個升／少一個降）' : '逆時針（多一個降／少一個升）'}的下一個調是？`, opts: mc(a, pool), a, ex: `${up ? '順時針＝往上完全五度' : '逆時針＝往上完全四度'}：${K} → ${a}。` }; },
    ],
  };
  T.chord = {
    title: '和弦組成', icon: '🎹',
    notes: ['大三和弦＝1 3 5（大三度＋小三度）', '小三和弦＝1 b3 5；減三和弦＝1 b3 b5；增三和弦＝1 3 #5', '七和弦：maj7＝1 3 5 7、7＝1 3 5 b7、m7＝1 b3 5 b7、m7b5＝1 b3 b5 b7', '貝斯最常彈的和弦音是根音、五度，其次是三度和七度'],
    gen: [
      () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'F#']), q = pick(Object.keys(CQ)); const t = chordTones(r, q); if (!t) return null; const a = t.join('–'); const pool = Object.keys(CQ).filter(x => x !== q && CQ[x].iv.length === CQ[q].iv.length).map(x => chordTones(r, x)).filter(Boolean).map(x => x.join('–')); return { q: `${r}${q}（${CQ[q].zh}）的組成音是？`, opts: mc(a, pool), a, ex: `${CQ[q].zh}＝根音＋${CQ[q].iv.map(k => IV[k][2]).join('＋')}：${a}。` }; },
      () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb']), q = pick(Object.keys(CQ)); const t = chordTones(r, q); if (!t) return null; const a = `${r}${q}（${CQ[q].zh}）`; const pool = Object.keys(CQ).filter(x => x !== q).map(x => `${r}${x}（${CQ[x].zh}）`); return { q: `${t.join('–')} 是什麼和弦？`, opts: mc(a, pool), a, ex: `從 ${r} 往上：${CQ[q].iv.map((k, i) => `${t[i + 1]} 是${IV[k][2]}`).join('、')}，所以是${CQ[q].zh}。` }; },
      () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb']), q = pick(['', 'm', '7', 'maj7', 'm7', 'm7b5']); const t = chordTones(r, q); if (!t) return null; const i = ri(1, t.length - 1); const nm = ['', '三度', '五度', '七度'][i]; const a = t[i]; const k = CQ[q].iv[i - 1]; const pool = [spell(r, IV[k][0], IV[k][1] - 1), spell(r, IV[k][0], IV[k][1] + 1), ...t.filter(x => x !== a)]; return { q: `${r}${q} 的${nm}音是？`, opts: mc(a, pool), a, ex: `${r}${q}＝${t.join('–')}，${nm}音是 ${a}（${IV[k][2]}）。` }; },
    ],
  };
  T.diatonic = {
    title: '調內和弦與級數', icon: 'Ⅰ',
    notes: ['大調三和弦：I ii iii IV V vi vii°（大 小 小 大 大 小 減）', '大調七和弦：Imaj7 iim7 iiim7 IVmaj7 V7 vim7 viim7b5', '自然小調：i ii° III iv v VI VII', 'ii–V–I 是爵士最重要的進行；V7→I 有強烈的解決感'],
    gen: [
      () => { const K = pick(MAJ.slice(0, 11)).n, sc = scale(K, MAJ_ST), d = ri(0, 6), sev = Math.random() < 0.4; const a = sc[d] + (sev ? MAJ_Q7[d] : MAJ_Q[d]); const pool = [sc[d] + (sev ? 'maj7' : (MAJ_Q[d] === 'm' ? '' : 'm')), sc[d] + (sev ? '7' : 'dim'), sc[(d + 1) % 7] + (sev ? MAJ_Q7[(d + 1) % 7] : MAJ_Q[(d + 1) % 7]), sc[(d + 4) % 7] + (sev ? MAJ_Q7[(d + 4) % 7] : MAJ_Q[(d + 4) % 7]), sc[d] + (sev ? 'm7' : 'aug')]; return { q: `${K} 大調的 ${sev ? MAJ_R7[d] : MAJ_R[d]} 和弦是？`, opts: mc(a, pool), a, ex: `${K} 大調第 ${d + 1} 級是 ${sc[d]}，${sev ? MAJ_R7[d] : MAJ_R[d]} 是${CQ[sev ? MAJ_Q7[d] : MAJ_Q[d]].zh}，所以是 ${a}。` }; },
      () => { const K = pick(MAJ.slice(0, 11)).n, sc = scale(K, MAJ_ST), d = ri(1, 6); const ch = sc[d] + MAJ_Q[d]; return { q: `在 ${K} 大調裡，${ch} 是第幾級和弦？`, opts: mc(MAJ_R[d], MAJ_R), a: MAJ_R[d], ex: `${K} 大調：${sc.map((n, i) => n + MAJ_Q[i]).join(' ')}。${ch} 在第 ${d + 1} 個位置，就是 ${MAJ_R[d]}。` }; },
      () => { const K = pick(MAJ.slice(0, 11)).n, sc = scale(K, MAJ_ST); const a = `${sc[1]}m7 → ${sc[4]}7 → ${K}maj7`; const pool = [`${sc[1]}7 → ${sc[4]}7 → ${K}maj7`, `${sc[1]}m7 → ${sc[4]}maj7 → ${K}maj7`, `${sc[3]}maj7 → ${sc[4]}7 → ${K}maj7`, `${sc[5]}m7 → ${sc[1]}m7 → ${sc[4]}7`]; return { q: `${K} 大調的 ii–V–I 是？`, opts: mc(a, pool), a, ex: `ii＝${sc[1]}m7、V＝${sc[4]}7、I＝${K}maj7。` }; },
      () => { const K = pick(['A', 'E', 'D', 'G', 'C', 'B']), sc = scale(K, MIN_ST), d = pick([0, 2, 3, 4, 5, 6]); const a = sc[d] + MIN_Q[d]; const pool = [sc[d] + (MIN_Q[d] === 'm' ? '' : 'm'), sc[(d + 1) % 7] + MIN_Q[(d + 1) % 7], sc[(d + 3) % 7] + MIN_Q[(d + 3) % 7], sc[d] + 'dim']; return { q: `${K} 小調的 ${MIN_R[d]} 和弦是？`, opts: mc(a, pool), a, ex: `${K} 自然小調：${sc.map((n, i) => n + MIN_Q[i]).join(' ')}。` }; },
      () => { const items = [['大調中，哪一級是屬七和弦（7）？', 'V', MAJ_R], ['大調中，哪一級是減三和弦？', 'vii°', MAJ_R], ['大調中，哪三級是大三和弦？', 'I、IV、V', ['I、IV、V', 'ii、iii、vi', 'I、ii、V', 'I、IV、vi']], ['大調中，哪三級是小三和弦？', 'ii、iii、vi', ['I、IV、V', 'ii、iii、vi', 'ii、V、vi', 'iii、IV、vi']]]; const [q, a, pool] = pick(items); return { q, opts: mc(a, pool), a, ex: '大調三和弦順序：大 小 小 大 大 小 減（I ii iii IV V vi vii°）；七和弦只有 V 是屬七。' }; },
    ],
  };
  T.rhythm = {
    title: '節奏與拍號', icon: '♩',
    notes: ['全音符 4 拍、二分 2 拍、四分 1 拍、八分 ½ 拍、十六分 ¼ 拍', '附點＝原本長度再加一半：附點四分＝1.5 拍', '三連音＝把一拍平分成三份', '4/4＝每小節 4 拍、以四分音符為一拍；6/8＝每小節 6 個八分音符，常感覺成 2 大拍'],
    bank: [
      ['附點四分音符是幾拍？', '1.5 拍', ['1 拍', '2 拍', '0.75 拍']], ['附點二分音符是幾拍？', '3 拍', ['2.5 拍', '4 拍', '1.5 拍']],
      ['4/4 拍的一小節裡，最多可以放幾個十六分音符？', '16 個', ['8 個', '12 個', '32 個']], ['4/4 拍的一小節裡有幾個八分音符？', '8 個', ['4 個', '6 個', '16 個']],
      ['八分音符三連音，一拍裡有幾個音？', '3 個', ['2 個', '4 個', '6 個']], ['6/8 拍的一小節裡有幾個八分音符？', '6 個', ['3 個', '4 個', '8 個']],
      ['3/4 拍的一小節有幾拍？', '3 拍（四分音符為一拍）', ['4 拍', '6 拍', '2 拍']], ['數十六分音符時常用的口訣是？', '1 e & a', ['1 & 2 &', '1 ta ta', '1 2 3 4']],
      ['「切分音」是指？', '重音落在弱拍或反拍，並延續到下一拍', ['所有音都彈得很短', '一拍分成三份', '把音符加上附點']],
      ['Shuffle 節奏是從哪種節奏來的？', '三連音省略中間那個音（長–短）', ['十六分音符', '附點二分音符', '四分休止符']],
      ['兩個八分音符加起來等於？', '一個四分音符', ['一個二分音符', '一個附點四分', '一個十六分音符']],
      ['在 4/4 拍，一個四分休止符代表？', '休息 1 拍', ['休息 2 拍', '休息半拍', '休息 4 拍']],
      ['BPM 120 時，一個四分音符多長？', '0.5 秒', ['1 秒', '0.25 秒', '1.2 秒']], ['BPM 60 時，一個八分音符多長？', '0.5 秒', ['1 秒', '0.25 秒', '2 秒']],
      ['「Two-feel」的貝斯通常怎麼彈？', '每小節兩個二分音符', ['每拍一個音', '每小節一個全音符', '一直彈十六分音符']],
    ],
    gen: [function () { const [q, a, w] = pick(T.rhythm.bank); return { q, opts: mc(a, w), a, ex: T.rhythm.notes.join('；') + '。' }; }],
  };
  T.mode = {
    title: '調式', icon: '🌀',
    notes: ['大調音階從不同的音開始，就得到 7 個調式', '伊奧尼安(1) 多利安(2) 弗里吉安(3) 利地安(4) 混合利地安(5) 愛奧利安(6) 洛克里安(7)', '偏大調：伊奧尼安、利地安(#4)、混合利地安(b7)', '偏小調：愛奧利安、多利安(6)、弗里吉安(b2)、洛克里安(b2 b5)'],
    gen: [
      () => { const m = pick(MODES.filter(x => !['ionian', 'aeolian'].includes(x.k))); return { q: `${m.zh}調式的特色音是？`, opts: mc(m.ch, MODES.filter(x => x.k !== m.k && !['ionian', 'aeolian'].includes(x.k)).map(x => x.ch)), a: m.ch, ex: `${m.zh}＝大調音階從第 ${m.deg} 級開始。特色音：${m.ch}。` }; },
      () => { const K = pick(MAJ.filter(k => Math.abs(k.s) <= 4)).n, m = pick(MODES.slice(1)); const root = scale(K, MAJ_ST)[m.deg - 1]; return { q: `${root} ${m.zh}，用的是哪一個大調的音？`, opts: mc(K, MAJ.map(k => k.n)), a: K, ex: `${m.zh}是大調的第 ${m.deg} 級：${K} 大調的第 ${m.deg} 級是 ${root}，所以 ${root} ${m.zh}＝${K} 大調的音從 ${root} 開始。` }; },
      () => { const root = pick(['C', 'D', 'E', 'G', 'A', 'F']), m = pick(MODES); const a = scale(root, m.st); if (a.includes(null)) return null; const pool = MODES.filter(x => x.k !== m.k).map(x => scale(root, x.st)).filter(x => !x.includes(null)).map(x => x.join(' ')); return { q: `${root} ${m.zh}的音階是？`, opts: mc(a.join(' '), pool), a: a.join(' '), ex: `${m.zh}的公式：${m.st.map((s, i) => ({ '-1': 'b', '0': '', '1': '#' }[s - MAJ_ST[i]]) + (i + 1)).join(' ')}。` }; },
      () => { const items = [['哪個調式是「大調音階降第 7 級」？', '混合利地安'], ['哪個調式是「大調音階升第 4 級」？', '利地安'], ['哪個調式是「自然小調升第 6 級」？', '多利安'], ['哪個調式是「自然小調降第 2 級」？', '弗里吉安'], ['哪個調式最適合 m7b5 和弦？', '洛克里安'], ['屬七和弦（例如 G7）最常搭配哪個調式？', '混合利地安'], ['放克常用、在 m7 和弦上聽起來比自然小調更明亮的調式？', '多利安']]; const [q, a] = pick(items); return { q, opts: mc(a, MODES.map(x => x.zh)), a, ex: T.mode.notes.slice(2).join('；') + '。' }; },
    ],
  };
  const THEORY_ORDER = ['fret', 'interval', 'scale', 'key', 'chord', 'diatonic', 'rhythm', 'mode'];
  function genTheory(cat) {
    for (let tries = 0; tries < 30; tries++) {
      const c = cat === 'mix' ? pick(THEORY_ORDER) : cat;
      const q = pick(T[c].gen)();
      if (q && q.opts.length >= 3 && q.opts.includes(q.a) && new Set(q.opts).size === q.opts.length) { q.cat = c; return q; }
    }
    throw new Error('no question for ' + cat);
  }

  // ================= 音感訓練 =================
  const LV = ['入門', '中級', '進階'];
  const EAR = {
    interval: { title: '音程辨識', icon: '↗', desc: '聽兩個音，判斷音程。可以按選項，也可以直接用貝斯彈出第二個音。', canMic: true, canBtn: true },
    chord: { title: '和弦性質', icon: '♫', desc: '聽一個和弦（先分解、再一起響），判斷是大、小、減、增還是七和弦。', canBtn: true },
    melody: { title: '旋律模仿', icon: '〰', desc: '聽一段短旋律，用貝斯彈回來。第一個音一定是主音，會告訴你位置。', canMic: true },
    roots: { title: '根音聽寫', icon: '𝄢', desc: '聽一段 4 個和弦的進行，依序彈出每個和弦的根音。這是貝斯手最重要的耳朵。', canMic: true },
  };
  const IV_SET = [[2, 4, 5, 7, 12], [1, 2, 3, 4, 5, 7, 9, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]];
  const CH_SET = [['', 'm'], ['', 'm', 'dim', 'aug'], ['maj7', '7', 'm7', 'm7b5', 'dim7']];
  const CH_SEMI = { '': [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], maj7: [0, 4, 7, 11], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10], dim7: [0, 3, 6, 9] };

  function genEar(mode, lv) {
    if (mode === 'interval') {
      const s = pick(IV_SET[lv]);
      const dir = lv === 0 ? 'up' : lv === 1 ? pick(['up', 'down']) : pick(['up', 'down', 'harm']);
      let a, b;
      if (dir === 'down') { a = ri(40, 50); b = a - s; } else { a = ri(31, 43); b = a + s; }
      const dz = { up: '上行', down: '下行', harm: '同時響（和聲音程）' }[dir];
      return { mode, s, a, b, dir, answer: SEMI_ZH[s], opts: IV_SET[lv].map(x => SEMI_ZH[x]), prompt: `${dz}：這是什麼音程？`, ex: `${SEMI_ZH[s]}＝${s} 個半音（${pcn(a)} → ${pcn(b)}）。${SONG[s] ? '記憶法：' + SONG[s] + '。' : ''}`, target: b, first: a };
    }
    if (mode === 'chord') {
      const q = pick(CH_SET[lv]); const r = ri(43, 50);
      return { mode, q, r, tones: CH_SEMI[q].map(x => r + x), answer: CQ[q].zh, opts: CH_SET[lv].map(x => CQ[x].zh), prompt: '這是什麼和弦？', ex: `${CQ[q].zh}：${CQ[q].iv.map(k => IV[k][2]).join('＋')}（${pcn(r)}${q}）。${{ '': '聽起來明亮、穩定', m: '聽起來暗、憂鬱', dim: '緊張、不穩定', aug: '懸疑、像在等待', maj7: '溫暖、爵士感', 7: '藍調味、想要解決', m7: '柔和的小調', m7b5: '比 m7 更暗更緊', dim7: '非常緊張，像恐怖片' }[q]}。` };
    }
    if (mode === 'melody') {
      const st = lv === 0 ? [0, 2, 4, 7, 9] : lv === 1 ? MAJ_ST : pick([MAJ_ST, MIN_ST]);
      const len = [3, 4, 5][lv], jump = [1, 2, 3][lv];
      const tonic = ri(33, 40); let idx = 0; const seq = [tonic];
      const at = (i) => tonic + Math.floor(i / st.length) * 12 + st[((i % st.length) + st.length) % st.length];
      for (let i = 1; i < len; i++) { let n; do { n = idx + ri(-jump, jump); } while (n === idx || n < -2 || n > st.length + 2 || at(n) < 28); idx = n; seq.push(at(n)); }
      return { mode, seq, tonic, minor: st === MIN_ST, prompt: `主音是 ${pcn(tonic)}（${posOf(tonic)}）。聽完後把整段彈回來。`, ex: `答案：${seq.map(pcn).join(' → ')}` };
    }
    if (mode === 'roots') {
      const pool = [[0, 'I', ''], [5, 'IV', ''], [7, 'V', '']].concat(lv >= 1 ? [[2, 'ii', 'm'], [9, 'vi', 'm']] : []).concat(lv >= 2 ? [[4, 'iii', 'm'], [10, 'bVII', '']] : []);
      const ks = MAJ.slice(0, 8); const K = pick(ks); const tonic = 28 + ((parse(K.n).pc - 4 + 12) % 12);
      const prog = [pool[0]]; while (prog.length < 4) { const c = pick(pool.slice(1).concat([pool[0]])); if (c !== prog[prog.length - 1]) prog.push(c); }
      const roots = prog.map(c => { let m = tonic + c[0]; while (m > 40) m -= 12; return m; });
      return { mode, prog, roots, tonic, key: K.n, prompt: `${K.n} 大調，第一個和弦是 I（${K.n}，${posOf(tonic)}）。依序彈出 4 個根音。`, ex: `答案：${prog.map(c => c[1]).join(' – ')}　（${roots.map(pcn).join(' → ')}）` };
    }
  }

  // ================= 介面 =================
  function ear(el, C) {
    const A = C.A, st = C.store;
    st.ear = st.ear || {};
    let mode = 'interval', lv = 0, method = 'btn';
    let round = null, listenLoop = null, playEnd = 0;

    function home() {
      stopListen();
      el.innerHTML = `
        <section class="card">
          <h1>音感訓練</h1>
          <p class="muted">每輪 10 題。耳朵好的貝斯手不是天生的，是每天練出來的。建議每天練 5 分鐘。</p>
          <div class="seg" id="lvSeg">${LV.map((n, i) => `<button data-v="${i}" class="${i === lv ? 'on' : ''}">${n}</button>`).join('')}</div>
        </section>
        <div class="tgrid">${Object.entries(EAR).map(([k, m]) => { const r = st.ear[k + lv]; return `<button class="card tcard" data-m="${k}"><span class="ticon">${m.icon}</span><strong>${m.title}</strong><small>${m.desc}</small><em>${r ? `最佳 ${r.best}/10・練過 ${r.plays} 輪` : '還沒練過'}</em></button>`; }).join('')}</div>`;
      el.querySelectorAll('#lvSeg button').forEach(b => b.onclick = () => { lv = +b.dataset.v; home(); });
      el.querySelectorAll('.tcard').forEach(b => b.onclick = () => { mode = b.dataset.m; method = EAR[mode].canBtn ? 'btn' : 'mic'; start(); });
    }

    function stopListen() { if (listenLoop) { listenLoop.stop(); listenLoop = null; } A.stopAll(); }

    function start() { round = { i: 0, ok: 0, q: null, done: false }; next(); }

    function play(q) {
      A.ensureCtx(); A.stopAll();
      const t = A.now() + 0.15; let end = t;
      if (q.mode === 'interval') {
        if (q.dir === 'harm') { A.bassNote(q.a, t, 1.6, 0.3); A.bassNote(q.b, t, 1.6, 0.3); end = t + 1.6; }
        else { A.bassNote(q.a, t, 0.8); A.bassNote(q.b, t + 0.85, 0.9); end = t + 1.75; }
      } else if (q.mode === 'chord') {
        q.tones.forEach((m, i) => A.bassNote(m, t + i * 0.38, 0.4, 0.35));
        const tb = t + q.tones.length * 0.38 + 0.25; q.tones.forEach(m => A.bassNote(m, tb, 1.6, 0.2)); end = tb + 1.6;
      } else if (q.mode === 'melody') {
        q.seq.forEach((m, i) => A.bassNote(m, t + i * 0.6, 0.55)); end = t + q.seq.length * 0.6;
      } else if (q.mode === 'roots') {
        q.prog.forEach((c, i) => { const r = q.tonic + c[0]; const rr = r + 12 * Math.max(0, Math.ceil((45 - r) / 12)); CH_SEMI[c[2]].forEach(s => A.bassNote(rr + s, t + i * 1.2, 1.1, 0.22)); A.bassNote(q.roots[i], t + i * 1.2, 1.1, 0.3); });
        end = t + q.prog.length * 1.2;
      }
      playEnd = end + 0.3;
    }

    function next() {
      stopListen();
      if (round.i >= 10) return finish();
      round.i++;
      show(genEar(mode, lv), true);
    }
    function show(q, autoplay) {
      stopListen();
      round.q = q; round.answered = false;
      const m = EAR[mode];
      el.innerHTML = `
        <div class="crumbs"><a href="#/ear" id="back">← 音感訓練</a><span>${m.title}・${LV[lv]}</span></div>
        <section class="card quiz">
          <div class="qhead"><span>第 ${round.i} / 10 題</span><span>答對 ${round.ok}</span></div>
          <div class="bar thin"><i style="width:${(round.i - 1) * 10}%"></i></div>
          ${m.canMic && m.canBtn ? `<div class="seg small" id="mSeg"><button data-v="btn" class="${method === 'btn' ? 'on' : ''}">按選項回答</button><button data-v="mic" class="${method === 'mic' ? 'on' : ''}">🎤 用貝斯彈</button></div>` : ''}
          <p class="qtext">${method === 'mic' && mode === 'interval' ? `${q.dir === 'down' ? '下行' : q.dir === 'harm' ? '和聲' : '上行'}音程。第一個音是 <b>${pcn(q.a)}</b>（${posOf(q.a)}），請彈出<b>${q.dir === 'harm' ? '較高' : '第二個'}</b>音。` : q.prompt}</p>
          <button class="btn ghost big" id="replay">🔊 再聽一次</button>
          <div id="ans"></div>
          <div id="fb"></div>
        </section>`;
      el.querySelector('#back').onclick = (e) => { e.preventDefault(); home(); };
      el.querySelectorAll('#mSeg button').forEach(b => b.onclick = () => { if (round.answered || method === b.dataset.v) return; method = b.dataset.v; show(q, false); });
      el.querySelector('#replay').onclick = () => play(q);
      renderAnswer(q);
      if (autoplay) play(q); else playEnd = 0;
    }

    function renderAnswer(q) {
      const box = el.querySelector('#ans');
      if (method === 'btn') {
        box.innerHTML = `<div class="opts">${q.opts.map(o => `<button class="opt">${o}</button>`).join('')}</div>`;
        box.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          if (round.answered) return;
          const ok = b.textContent === q.answer;
          box.querySelectorAll('.opt').forEach(x => { if (x.textContent === q.answer) x.classList.add('right'); else if (x === b) x.classList.add('wrongc'); x.disabled = true; });
          feedback(ok, q);
        });
      } else {
        const targets = q.mode === 'interval' ? [q.target] : q.mode === 'melody' ? q.seq : q.roots;
        box.innerHTML = `<div class="micbox">
            <div class="dots">${targets.map((_, i) => `<i id="d${i}"></i>`).join('')}</div>
            <div class="cell"><small>聽到</small><b id="eHeard">–</b><div class="meter"><i id="eMeter"></i></div></div>
            <p class="muted" id="eStatus">播放完後開始收音…</p>
            <button class="btn ghost" id="giveup">看答案</button>
          </div>`;
        box.querySelector('#giveup').onclick = () => { if (!round.answered) { stopListen(); feedback(false, q, '已顯示答案'); } };
        C.needMic().then(ok => {
          if (!ok || round.q !== q || round.answered) return;
          let k = 0, mistakes = 0, pending = false, aT = 0;
          listenLoop = C.makeLoop((ev, fr) => {
            const h = el.querySelector('#eHeard'); if (!h) return;
            const mm = ev.stable ?? ev.midi; h.textContent = mm != null ? pcn(mm) : '–';
            el.querySelector('#eMeter').style.width = Math.min(100, Math.sqrt(ev.rms / 0.25) * 100) + '%';
            if (fr.t < playEnd) { pending = false; el.querySelector('#eStatus').textContent = '🔊 播放中…'; return; }
            el.querySelector('#eStatus').textContent = q.mode === 'interval' ? '🎤 請彈出答案' : `🎤 請彈第 ${k + 1} 個音`;
            if (ev.onset || ev.pitchChange) { pending = true; aT = fr.t; }
            if (pending && ev.stable !== null) {
              if (C.match(ev.stable, targets[k])) {
                pending = false; el.querySelector('#d' + k).className = 'ok'; k++;
                if (k >= targets.length) { stopListen(); feedback(mistakes === 0, q, mistakes ? `彈錯 ${mistakes} 次` : ''); }
              } else if (fr.t - aT > 0.12) {
                pending = false;
                if (q.mode === 'interval' && pcEq(ev.stable, q.a)) return;
                mistakes++;
                const d = el.querySelector('#d' + k); d.className = 'bad'; setTimeout(() => { if (d.className === 'bad') d.className = ''; }, 400);
                if (q.mode === 'interval') { stopListen(); feedback(false, q, `你彈的是 ${pcn(ev.stable)}`); }
              }
            }
          });
          C.setSess(listenLoop);
        });
      }
    }

    function feedback(ok, q, extra) {
      round.answered = true; if (ok) round.ok++;
      const fb = el.querySelector('#fb');
      fb.innerHTML = `<div class="result ${ok ? 'ok' : 'no'}"><div class="r-icon">${ok ? '✓' : '✗'}</div>
        <div class="r-body"><strong>${ok ? '答對了！' : '答錯了'}${q.answer ? `　答案：${q.answer}` : ''}</strong><p>${extra ? extra + '。' : ''}${q.ex}</p></div>
        <div class="r-act"><button class="btn ghost" id="again">🔊 再聽</button><button class="btn primary" id="nextQ">${round.i >= 10 ? '看成績' : '下一題 →'}</button></div></div>`;
      fb.querySelector('#again').onclick = () => play(q);
      fb.querySelector('#nextQ').onclick = next;
      fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function finish() {
      stopListen();
      const key = mode + lv; const r = st.ear[key] = st.ear[key] || { best: 0, plays: 0 };
      const isBest = round.ok > r.best; r.best = Math.max(r.best, round.ok); r.plays++; C.markPracticed(); C.save();
      el.innerHTML = `<section class="card quiz done">
        <div class="bigscore">${round.ok}<span>/10</span></div>
        <p>${EAR[mode].title}・${LV[lv]}${isBest ? '　🎉 新紀錄！' : `　最佳 ${r.best}/10`}</p>
        <p class="muted">${round.ok >= 9 ? '耳朵很好！可以試試下一個難度。' : round.ok >= 6 ? '不錯，再練幾輪會更穩。' : '慢慢來，每次答錯都按「再聽」比較兩個聲音的差別。'}</p>
        <div class="btnrow center"><button class="btn ghost" id="toHome">選其他項目</button><button class="btn primary" id="again">再來一輪</button></div>
      </section>`;
      el.querySelector('#toHome').onclick = home; el.querySelector('#again').onclick = start;
    }

    home();
  }

  function theory(el, C) {
    const st = C.store; st.theory = st.theory || {};
    let cat = null, round = null;
    function home() {
      el.innerHTML = `
        <section class="card"><h1>樂理</h1><p class="muted">每個主題 10 題選擇題，答完會有解說。題目每次隨機產生，可以一直練。</p></section>
        <div class="tgrid">${THEORY_ORDER.concat(['mix']).map(k => { const t = k === 'mix' ? { title: '綜合測驗', icon: '🏁', notes: ['所有主題隨機出題'] } : T[k]; const r = st.theory[k]; return `<button class="card tcard" data-c="${k}"><span class="ticon">${t.icon}</span><strong>${t.title}</strong><small>${t.notes[0]}</small><em>${r ? `最佳 ${r.best}/10・練過 ${r.plays} 輪` : '還沒練過'}</em></button>`; }).join('')}</div>`;
      el.querySelectorAll('.tcard').forEach(b => b.onclick = () => { cat = b.dataset.c; round = { i: 0, ok: 0 }; next(); });
    }
    function next() {
      if (round.i >= 10) return finish();
      round.i++;
      const q = genTheory(cat); const t = T[q.cat];
      el.innerHTML = `
        <div class="crumbs"><a href="#/theory" id="back">← 樂理</a><span>${cat === 'mix' ? '綜合測驗' : t.title}</span></div>
        <section class="card quiz">
          <div class="qhead"><span>第 ${round.i} / 10 題</span><span>答對 ${round.ok}</span></div>
          <div class="bar thin"><i style="width:${(round.i - 1) * 10}%"></i></div>
          <details class="notes"><summary>📖 重點整理：${t.title}</summary><ul>${t.notes.map(n => `<li>${C.esc(n)}</li>`).join('')}</ul></details>
          <p class="qtext">${C.esc(q.q)}</p>
          <div class="opts">${q.opts.map(o => `<button class="opt">${C.esc(o)}</button>`).join('')}</div>
          <div id="fb"></div>
        </section>`;
      el.querySelector('#back').onclick = (e) => { e.preventDefault(); home(); };
      let answered = false;
      el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        if (answered) return; answered = true;
        const ok = b.textContent === q.a; if (ok) round.ok++;
        el.querySelectorAll('.opt').forEach(x => { if (x.textContent === q.a) x.classList.add('right'); else if (x === b) x.classList.add('wrongc'); x.disabled = true; });
        const fb = el.querySelector('#fb');
        fb.innerHTML = `<div class="result ${ok ? 'ok' : 'no'}"><div class="r-icon">${ok ? '✓' : '✗'}</div><div class="r-body"><strong>${ok ? '答對了！' : `答案是：${C.esc(q.a)}`}</strong><p>${C.esc(q.ex)}</p></div><div class="r-act"><button class="btn primary" id="nextQ">${round.i >= 10 ? '看成績' : '下一題 →'}</button></div></div>`;
        fb.querySelector('#nextQ').onclick = next;
        fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
    function finish() {
      const r = st.theory[cat] = st.theory[cat] || { best: 0, plays: 0 };
      const isBest = round.ok > r.best; r.best = Math.max(r.best, round.ok); r.plays++; C.markPracticed(); C.save();
      el.innerHTML = `<section class="card quiz done">
        <div class="bigscore">${round.ok}<span>/10</span></div>
        <p>${cat === 'mix' ? '綜合測驗' : T[cat].title}${isBest ? '　🎉 新紀錄！' : `　最佳 ${r.best}/10`}</p>
        <p class="muted">${round.ok >= 9 ? '觀念很清楚！' : round.ok >= 6 ? '不錯，看一下重點整理再挑戰一次。' : '先打開「重點整理」讀一遍，再試一輪。'}</p>
        <div class="btnrow center"><button class="btn ghost" id="toHome">選其他主題</button><button class="btn primary" id="again">再來一輪</button></div>
      </section>`;
      el.querySelector('#toHome').onclick = home; el.querySelector('#again').onclick = () => { round = { i: 0, ok: 0 }; next(); };
    }
    home();
  }

  window.B365Train = { ear, theory, _test: { spell, scale, chordTones, genTheory, genEar, THEORY_ORDER, MAJ, MAJ_ST } };
})();
