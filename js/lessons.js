/* Bass 365 — 課程產生器
 * 每一課：{ day, stage, title, goal, tips[], notes[{m,d,s,f}|{r,d}], bpm, key, flat }
 * m = MIDI 音高、d = 拍數、s = 弦 (0=E 1=A 2=D 3=G)、f = 格數、r = 休止符
 */
(function () {
  const OPEN = [28, 33, 38, 43];
  const SN = ['E', 'A', 'D', 'G'];
  const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const FLAT_PC = new Set([5, 10, 3, 8, 1]);
  const KEYS = [['C', 0], ['G', 7], ['F', 5], ['D', 2], ['A', 9], ['E', 4], ['Bb', 10], ['Eb', 3], ['B', 11], ['Ab', 8], ['F#', 6], ['Db', 1]]
    .map(([n, pc]) => ({ n, pc }));

  const SC = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10], majPent: [0, 2, 4, 7, 9], minPent: [0, 3, 5, 7, 10],
    blues: [0, 3, 5, 6, 7, 10], harmMinor: [0, 2, 3, 5, 7, 8, 11], melMinor: [0, 2, 3, 5, 7, 9, 11],
  };
  const CH = {
    maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus4: [0, 5, 7],
    maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], '7': [0, 4, 7, 10], m7b5: [0, 3, 6, 10], dim7: [0, 3, 6, 9],
  };
  const CHN = { maj: '', min: 'm', dim: 'dim', aug: 'aug', sus4: 'sus4', maj7: 'maj7', m7: 'm7', '7': '7', m7b5: 'm7b5', dim7: 'dim7' };
  const PROGS = {
    pop: [[0, 'maj'], [7, 'maj'], [9, 'min'], [5, 'maj']],
    classic: [[0, 'maj'], [5, 'maj'], [7, 'maj'], [0, 'maj']],
    fifties: [[0, 'maj'], [9, 'min'], [5, 'maj'], [7, 'maj']],
    sad: [[9, 'min'], [5, 'maj'], [0, 'maj'], [7, 'maj']],
    rock: [[0, 'maj'], [10, 'maj'], [5, 'maj'], [0, 'maj']],
    minor: [[0, 'min'], [5, 'min'], [7, 'min'], [0, 'min']],
    aeolian: [[0, 'min'], [8, 'maj'], [3, 'maj'], [10, 'maj']],
    iiVI: [[2, 'm7'], [7, '7'], [0, 'maj7'], [0, 'maj7']],
    turn: [[0, 'maj7'], [9, 'm7'], [2, 'm7'], [7, '7']],
    blues4: [[0, '7'], [5, '7'], [0, '7'], [7, '7']],
    blues: [[0, '7'], [5, '7'], [0, '7'], [0, '7'], [5, '7'], [5, '7'], [0, '7'], [0, '7'], [7, '7'], [5, '7'], [0, '7'], [7, '7']],
    mblues: [[0, 'm7'], [0, 'm7'], [0, 'm7'], [0, 'm7'], [5, 'm7'], [5, 'm7'], [0, 'm7'], [0, 'm7'], [8, '7'], [7, '7'], [0, 'm7'], [7, '7']],
    dorianVamp: [[0, 'm7'], [5, '7'], [0, 'm7'], [5, '7']],
    mixoVamp: [[0, '7'], [10, 'maj'], [0, '7'], [10, 'maj']],
  };
  const PROG_NAME = {
    pop: 'I–V–vi–IV', classic: 'I–IV–V–I', fifties: 'I–vi–IV–V', sad: 'vi–IV–I–V', rock: 'I–bVII–IV–I',
    minor: 'i–iv–v–i', aeolian: 'i–bVI–bIII–bVII', iiVI: 'ii–V–I', turn: 'I–vi–ii–V', blues4: 'I7–IV7–I7–V7',
    blues: '12 小節藍調', mblues: '12 小節小調藍調', dorianVamp: 'i7–IV7', mixoVamp: 'I7–bVII',
  };

  // ---------- helpers ----------
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const N = (m, d) => ({ m, d });
  const R = (d) => ({ r: true, d });
  const low = (pc, min = 28) => min + ((((pc - min) % 12) + 12) % 12);
  const seq = (ms, d) => ms.map(m => N(m, d));
  const scaleOf = (root, ints, oct = 1) => { const a = []; for (let o = 0; o < oct; o++) ints.forEach(i => a.push(root + 12 * o + i)); a.push(root + 12 * oct); return a; };
  const upDown = (a) => a.concat(a.slice(0, -1).reverse());
  const rep = (arr, n) => { let o = []; for (let i = 0; i < n; i++) o = o.concat(arr.map(x => ({ ...x }))); return o; };
  const kn = (key) => key.n;
  const chordName = (pc, q, flat) => (flat ? FLAT : SHARP)[pc] + CHN[q];

  function prog(keyPc, name, maxRoot = 40) {
    let prev = null;
    return PROGS[name].map(([deg, q]) => {
      const pc = (keyPc + deg) % 12;
      let r = low(pc);
      if (prev !== null && r + 12 <= maxRoot && Math.abs(r + 12 - prev) < Math.abs(r - prev)) r += 12;
      prev = r;
      return { r, c: CH[q], q, pc };
    });
  }
  const progText = (key, name) => `${PROG_NAME[name]}（${prog(key.pc, name).map(x => chordName(x.pc, x.q, FLAT_PC.has(key.pc))).join(' → ')}）`;

  // 16 格 / 12 格節奏格：x=新音 -=延長 .=休止
  function grid(pat, ints, r, c, step) {
    const out = []; let k = 0;
    for (const ch of pat) {
      if (ch === 'x') { out.push(N(r + res(ints[k++ % ints.length], c), step)); }
      else if (ch === '-') { if (out.length) out[out.length - 1].d += step; else out.push(R(step)); }
      else { const l = out[out.length - 1]; if (l && l.r) l.d += step; else out.push(R(step)); }
    }
    return out;
  }
  function res(t, c) {
    if (typeof t === 'number') return t;
    const map = { '3': c[1], '5': c[2], '7': c[3] ?? 10, '8': 12, '-5': c[2] - 12, '10': c[1] + 12, '6': 9, 'b7': 10, '-b7': -2 };
    return map[t] ?? 0;
  }
  const g16 = (pat, ints) => (r, c) => grid(pat, ints, r, c, 0.25);
  const g12 = (pat, ints) => (r, c) => grid(pat, ints, r, c, 1 / 3);
  const bars = (chords, fn) => chords.flatMap(ch => fn(ch.r, ch.c, ch));

  const PAT = {
    whole: (r) => [N(r, 4)],
    half: (r) => [N(r, 2), N(r, 2)],
    quarter: (r) => seq([r, r, r, r], 1),
    eighth: (r) => seq([r, r, r, r, r, r, r, r], 0.5),
    r5: (r, c) => seq([r, r + c[2], r, r + c[2]], 1),
    r5half: (r, c) => [N(r, 2), N(r + c[2], 2)],
    r58: (r, c) => seq([r, r + c[2], r + 12, r + c[2]], 1),
    oct8: (r) => seq([r, r + 12, r, r + 12, r, r + 12, r, r + 12], 0.5),
    octQ: (r) => seq([r, r + 12, r, r + 12], 1),
    arp: (r, c) => seq([r, r + c[1], r + c[2], r + (c[3] ?? 12)], 1),
    arpDown: (r, c) => seq([r + 12, r + (c[3] ?? c[2]), r + c[2], r + c[1]], 1),
    arp8: (r, c) => seq([r, r + c[1], r + c[2], r + (c[3] ?? 12), r + 12, r + (c[3] ?? 12), r + c[2], r + c[1]], 0.5),
    r353: (r, c) => seq([r, r + c[1], r + c[2], r + c[1]], 1),
    boogie: (r) => seq([r, r + 4, r + 7, r + 9, r + 10, r + 9, r + 7, r + 4], 0.5),
    dotted: (r, c) => [N(r, 1.5), N(r, 0.5), N(r + c[2], 2)],
    sync1: (r, c) => [N(r, 1.5), N(r, 0.5), R(0.5), N(r, 0.5), N(r + c[2], 1)],
    sync2: (r, c) => [N(r, 0.5), R(0.5), N(r, 0.5), N(r, 0.5), R(0.5), N(r, 0.5), N(r + c[2], 1)],
    rest1: (r, c) => [N(r, 1), R(1), N(r, 0.5), N(r, 0.5), N(r + c[2], 1)],
    sixteen: (r) => seq(Array(16).fill(r), 0.25),
    gallop: (r) => [0, 1, 2, 3].flatMap(() => [N(r, 0.5), N(r, 0.25), N(r, 0.25)]),
    revGallop: (r) => [0, 1, 2, 3].flatMap(() => [N(r, 0.25), N(r, 0.25), N(r, 0.5)]),
    bossa: (r, c) => [N(r, 1.5), N(r + c[2] - 12 >= 28 ? r + c[2] - 12 : r + c[2], 0.5), N(r + c[2] - 12 >= 28 ? r + c[2] - 12 : r + c[2], 2)],
    country: (r, c) => [N(r, 2), N(r + c[2] - 12 >= 28 ? r + c[2] - 12 : r + c[2], 2)],
  };

  function walk(chords, rnd) {
    const out = [];
    chords.forEach((ch, i) => {
      const { r, c } = ch;
      const nx = chords[(i + 1) % chords.length].r;
      const top = c[3] ?? 12;
      const shapes = [[c[1], c[2]], [c[2], top], [c[1], c[2] - 12 >= -5 ? c[2] : c[2]], [2, c[1]], [c[2], c[1]], [12, top]];
      const sh = shapes[Math.floor(rnd() * shapes.length)];
      let b2 = r + sh[0], b3 = r + sh[1];
      const lastBeat = b3;
      let ap = rnd() < 0.5 ? nx - 1 : nx + 1;
      if (rnd() < 0.2) ap = nx + 7 <= 52 ? nx + 7 : nx - 5;
      if (Math.abs(ap - lastBeat) > 9) ap = nx + (lastBeat > nx ? 1 : -1);
      if (ap < 28) ap = nx + 1;
      out.push(N(r, 1), N(b2, 1), N(b3, 1), N(ap, 1));
    });
    const end = chords[0].r; out.push(N(end, 4));
    return out;
  }

  function fill(notes, bpb = 4) {
    const tot = notes.reduce((a, n) => a + n.d, 0);
    const rem = Math.ceil(tot / bpb - 1e-6) * bpb - tot;
    if (rem > 1e-6) { const l = notes[notes.length - 1]; if (l.r) l.d += rem; else l.d += rem; }
    return notes;
  }

  // 自動把音放到 TAB 上（動態規劃，讓左手移動最少）
  function assignTab(notes, opt = {}) {
    const maxF = opt.maxFret ?? 17;
    const idx = [];
    notes.forEach((n, i) => {
      if (n.r) return;
      while (n.m < 28) n.m += 12;
      while (n.m > 43 + maxF) n.m -= 12;
      idx.push(i);
    });
    const cands = idx.map(i => {
      const n = notes[i];
      if (n.s !== undefined) return [{ s: n.s, f: n.f }];
      const a = [];
      for (let s = 0; s < 4; s++) {
        if (opt.string !== undefined && s !== opt.string) continue;
        const f = n.m - OPEN[s];
        if (f >= 0 && f <= maxF && !(opt.noOpen && f === 0 && opt.string === undefined)) a.push({ s, f });
      }
      return a.length ? a : [{ s: 0, f: Math.max(0, n.m - 28) }];
    });
    const base = (p) => (p.f > 12 ? (p.f - 12) * 0.6 : 0) + p.f * 0.03;
    const trans = (a, b) => {
      if (a.f === 0 || b.f === 0) return 0.6 + Math.abs(a.s - b.s) * 0.2;
      const fd = Math.abs(a.f - b.f);
      return (fd > 3 ? fd * 1.0 + 2 : fd * 0.3) + Math.abs(a.s - b.s) * 0.15;
    };
    let cost = cands[0].map(base), back = [];
    for (let k = 1; k < cands.length; k++) {
      const nc = [], bk = [];
      cands[k].forEach(p => {
        let best = Infinity, bi = 0;
        cands[k - 1].forEach((q, j) => { const v = cost[j] + trans(q, p); if (v < best) { best = v; bi = j; } });
        nc.push(best + base(p)); bk.push(bi);
      });
      cost = nc; back.push(bk);
    }
    let j = cost.indexOf(Math.min(...cost));
    for (let k = cands.length - 1; k >= 0; k--) {
      const p = cands[k][j]; notes[idx[k]].s = p.s; notes[idx[k]].f = p.f;
      if (k > 0) j = back[k - 1][j];
    }
    return notes;
  }

  // ---------- 各階段模板 ----------
  // 每個模板 (c) => { title, goal, tips, notes, bpmMul?, tab? }
  // c = { v: 第幾次循環, key, rnd, flat }
  const T = {};

  T.s1 = [
    c => {
      const orders = [[0, 1, 2, 3], [3, 2, 1, 0], [0, 2, 1, 3], [1, 3, 0, 2]]; const o = orders[c.v % 4];
      const notes = o.flatMap(s => [0, 1, 2, 3].map(() => ({ m: OPEN[s], d: 1, s, f: 0 })));
      return { title: '空弦四分音符：穩定的右手', goal: `依序彈奏空弦 ${o.map(s => SN[s]).join('、')}，每條弦 4 下四分音符。重點是每一下音量一致、間隔平均。`, tips: ['右手食指、中指交替撥弦（i-m 交替），不要同一根手指連撥', '撥完弦後讓手指靠在下一條弦上（靠弦撥法 rest stroke）', '沒在彈的弦要止音，避免殘響干擾偵測'], notes };
    },
    c => {
      const pats = [[0, 1, 2, 3, 3, 2, 1, 0], [0, 1, 0, 1, 2, 3, 2, 3], [0, 2, 1, 3, 3, 1, 2, 0]]; const p = pats[c.v % 3];
      const notes = rep(p.map(s => ({ m: OPEN[s], d: 0.5, s, f: 0 })), 4);
      return { title: '空弦八分音符：跨弦練習', goal: '八分音符在空弦之間來回移動，練右手換弦時保持節奏不亂。', tips: ['換弦時右手手腕不要大幅移動，靠手指找弦', '用「1 & 2 & 3 & 4 &」數拍', '先慢後快，穩定比速度重要'], notes };
    },
    c => {
      const f0 = [1, 2, 3, 5, 7, 4][c.v % 6]; const up = [];
      for (let s = 0; s < 4; s++) for (let k = 0; k < 4; k++) up.push({ m: OPEN[s] + f0 + k, d: 0.5, s, f: f0 + k });
      const down = []; for (let s = 3; s >= 0; s--) for (let k = 3; k >= 0; k--) down.push({ m: OPEN[s] + f0 + k, d: 0.5, s, f: f0 + k });
      return { title: `爬格子 1-2-3-4（第 ${f0} 格起）`, goal: `左手四指各管一格，從第 ${f0} 格開始，逐弦往上再往下。這是建立左手獨立性與「一指一格」最經典的練習。`, tips: ['食指、中指、無名指、小指分別按第 1、2、3、4 格', '按下一格時，前面的手指盡量留在弦上', '拇指放在琴頸後方中間，不要握太緊'], notes: up.concat(down) };
    },
    c => {
      const s = c.v % 4; const nat = [];
      for (let f = 0; f <= 12; f++) { const pc = (OPEN[s] + f) % 12; if (!SHARP[pc].includes('#')) nat.push({ m: OPEN[s] + f, d: 1, s, f }); }
      const notes = nat.concat(nat.slice(0, -1).reverse().map(n => ({ ...n })));
      return { title: `${SN[s]} 弦音名：0～12 格`, goal: `在 ${SN[s]} 弦上依序彈出所有自然音（沒有升降記號的音），從空弦一路到第 12 格再回來。邊彈邊念出音名！`, tips: ['第 12 格就是空弦的高八度，有兩個圓點標記', 'E–F、B–C 之間只差半音（相鄰一格），其他自然音之間差全音（兩格）', '彈每個音時大聲念出音名，幫助記憶指板'], notes };
    },
    c => {
      const notes = [];
      for (let s = 0; s < 4; s++) for (let f = 0; f <= 4; f++) notes.push({ m: OPEN[s] + f, d: 0.5, s, f });
      const all = notes.concat(notes.slice(0, -1).reverse().map(n => ({ ...n })));
      return { title: '第一把位半音階', goal: '在第一把位（0～4 格）彈出所有半音，往上再往下。熟悉每一格的位置和音名。', tips: ['第 1～4 格分別用食指到小指', '空弦和第 5 格會是同一個音（除了 G 弦），之後會用到', '每個音都要清楚，不要有雜音'], notes: all };
    },
    c => {
      const ch = prog(c.key.pc, 'pop', 36);
      const notes = bars(ch, PAT.octQ);
      return { title: `八度形狀（${kn(c.key)} 調）`, goal: `沿著 ${progText(c.key, 'pop')} 彈根音與高八度。八度的指型是「往上兩條弦、往後兩格」，學會它就能在指板上快速找到同一個音。`, tips: ['食指按根音，小指（或無名指）按高八度', '中間那條弦要用手指輕觸止音', '八度指型在任何位置都一樣'], notes };
    },
    c => {
      const pairs = [[0, 5, 1, 0], [1, 5, 2, 0], [2, 5, 3, 0]];
      let notes = [];
      pairs.forEach(([s1, f1, s2, f2]) => { notes.push({ m: OPEN[s1] + f1, d: 1, s: s1, f: f1 }, { m: OPEN[s2] + f2, d: 1, s: s2, f: f2 }); });
      notes = rep(notes, 2).concat([{ m: 48, d: 2, s: 3, f: 5 }, { m: 48, d: 2, s: 2, f: 10 }]);
      return { title: '同音異位：第 5 格與空弦', goal: '同一個音在不同弦上有不同的按法。E 弦第 5 格＝A 空弦、A 弦第 5 格＝D 空弦、D 弦第 5 格＝G 空弦。這也是用耳朵調音的方法。', tips: ['兩個音聽起來應該完全一樣高', '如果有「嗡嗡」的拍頻，代表弦沒調準', '練習在兩個位置之間切換'], notes };
    },
    c => {
      const ch = prog(c.key.pc, 'pop');
      const notes = rep(bars(ch, c.v % 2 ? PAT.half : PAT.whole), 2);
      return { title: `根音全音符與二分音符（${kn(c.key)} 調）`, goal: `跟著和弦進行 ${progText(c.key, 'pop')} 彈奏每個和弦的根音。音符要撐滿整個拍長，換和弦時才放開。`, tips: ['長音最考驗左手：手指要一直壓穩，聲音才不會斷', '數拍數清楚：全音符 4 拍、二分音符 2 拍', '這是貝斯在樂團裡最基本的任務：把和弦根音穩穩地放下去'], notes };
    },
    c => {
      const ch = prog(c.key.pc, 'classic');
      return { title: `根音四分音符（${kn(c.key)} 調）`, goal: `${progText(c.key, 'classic')}，每小節 4 下根音。和鼓手的大鼓、小鼓對齊就是這種感覺。`, tips: ['每一下長度一樣、力度一樣', '換和弦時提早看好下一個位置', '試著讓第 1 拍稍微重一點'], notes: rep(bars(ch, PAT.quarter), 2) };
    },
    c => {
      const ch = prog(c.key.pc, 'pop');
      return { title: `根音八分音符（${kn(c.key)} 調）`, goal: `流行／搖滾最常見的八分音符根音推進，和弦進行為 ${progText(c.key, 'pop')}。`, tips: ['右手 i-m 交替，保持均勻', '可以用右手掌側輕壓在琴橋附近做出較短的音', '要彈得像節拍器一樣穩'], notes: bars(ch, PAT.eighth) };
    },
  ];

  T.s2 = [
    c => { const ch = prog(c.key.pc, 'classic'); return { title: `根音＋五度（${kn(c.key)} 調）`, goal: `在 ${progText(c.key, 'classic')} 上彈「根音–五度」交替。五度在根音的「上一條弦、往後兩格」。`, tips: ['五度指型：食指根音、無名指（或小指）五度', '五度是最穩、最不會出錯的和弦內音', '鄉村、搖滾、流行都大量使用'], notes: rep(bars(ch, PAT.r5), 2) }; },
    c => { const ch = prog(c.key.pc, 'fifties', 36); return { title: `根音–五度–八度（${kn(c.key)} 調）`, goal: `「根–五–八–五」是貝斯最常用的線條之一。和弦進行：${progText(c.key, 'fifties')}。`, tips: ['三個音都在同一個指型裡，手不需要移動', '注意高八度要清楚，不要被悶掉', '數拍：1 2 3 4'], notes: rep(bars(ch, PAT.r58), 2) }; },
    c => { const ch = prog(c.key.pc, 'pop', 36); return { title: `八度跳躍八分音符（${kn(c.key)} 調）`, goal: `根音與高八度交替的八分音符，迪斯可和舞曲的招牌律動。進行：${progText(c.key, 'pop')}。`, tips: ['左手手指一直按住兩個位置，只動右手', '低音和高音音量要一致', '不在彈的弦一律止音'], notes: bars(ch, PAT.oct8) }; },
    c => { const ch = prog(c.key.pc, 'classic'); return { title: `附點節奏（${kn(c.key)} 調）`, goal: '附點四分音符（1.5 拍）＋八分音符（0.5 拍），讓律動開始有「推進感」。', tips: ['數「1 & 2 & 3 & 4 &」，第二個音落在第 2 拍的「&」','先跟著節拍器拍手打出節奏，再上琴', '附點音符要撐滿，不要提早放'], notes: rep(bars(ch, PAT.dotted), 2) }; },
    c => { const ch = prog(c.key.pc, 'pop'); return { title: `切分音入門（${kn(c.key)} 調）`, goal: '音符落在反拍（&）並延續到下一拍，就是切分音。這是讓貝斯聽起來「會律動」的關鍵。', tips: ['休止符跟音符一樣重要，休止時要止音', '用腳踩正拍，手彈反拍', '先放慢速度確定位置'], notes: rep(bars(ch, PAT.sync1), 2) }; },
    c => { const ch = prog(c.key.pc, 'sad'); return { title: `休止符與反拍（${kn(c.key)} 調）`, goal: `八分音符裡加入休止符，練習「在對的時候停下來」。進行：${progText(c.key, 'sad')}。`, tips: ['休止的時候用左手放鬆壓力或右手指觸弦來止音', '休止時心裡還是要數拍', '短而乾淨的音更有律動感'], notes: rep(bars(ch, PAT.sync2), 2) }; },
    c => { const ch = prog(c.key.pc, 'classic'); return { title: `四分休止符（${kn(c.key)} 調）`, goal: '第 2 拍休止、第 3 拍兩個八分音符、第 4 拍五度——練習空拍的位置感。', tips: ['休止時手不要離開琴弦太遠', '第 3 拍的兩個八分音符要平均', '可以輕聲數出「1（休）3 & 4」'], notes: rep(bars(ch, PAT.rest1), 2) }; },
    c => { const ch = prog(c.key.pc, 'aeolian'); return { title: `小調進行八分音符（${kn(c.key)}m）`, goal: `抒情搖滾常見的小調進行 ${progText(c.key, 'aeolian')}，用八分音符根音穩定推進。`, tips: ['小調聽起來比較暗、比較憂鬱', '換和弦的時候不要斷拍', '留意每個和弦根音在指板上的位置'], notes: bars(ch, PAT.eighth) }; },
    c => { const ch = prog(c.key.pc, 'blues'); return { title: `12 小節藍調根音（${kn(c.key)} 調）`, goal: '認識最重要的曲式之一：12 小節藍調。I–IV–V 三個和弦，用四分音符彈根音。', tips: ['結構：I I I I｜IV IV I I｜V IV I V（第二小節常改成 IV）', '數小節：每 4 小節一句', '藍調、搖滾、爵士都建立在這個結構上'], notes: bars(ch, PAT.quarter) }; },
    c => { const ch = prog(c.key.pc, 'rock'); return { title: `根音＋五度二分音符（${kn(c.key)} 調）`, goal: `${progText(c.key, 'rock')}，每小節彈根音（2 拍）再彈五度（2 拍），練習在長音之間換位置。`, tips: ['讓每個音完整撐到 2 拍', '五度也可以彈在根音下方（同格低一條弦）', '這是很多抒情歌的基本線條'], notes: rep(bars(ch, PAT.r5half), 2) }; },
  ];

  const scaleT = (name, label, desc, tips) => [
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} ${label}：一個八度`, goal: `${desc} 先用四分音符上行再下行。`, tips, notes: seq(upDown(scaleOf(r, SC[name])), 1) }; },
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} ${label}：八分音符`, goal: `${kn(c.key)} ${label}，用八分音符上下行兩次，速度更流暢。`, tips: ['保持一指一格，必要時才換把位', '音與音之間要連貫', ...tips.slice(0, 1)], notes: rep(seq(upDown(scaleOf(r, SC[name])), 0.5), 2) }; },
  ];

  T.s3 = [
    ...scaleT('major', '大調音階', '大調音階的公式是「全全半全全全半」。', ['指型：食指從根音開始，「2-4、1-2-4、1-3-4」', '邊彈邊唱 Do Re Mi', '下行時同樣要保持指法一致']),
    c => { const r = low(c.key.pc, 31); const s = scaleOf(r, SC.major); const ms = []; for (let i = 0; i < 7; i++) ms.push(s[i], s[i] + (SC.major[(i + 2) % 7] - SC.major[i] + 12) % 12); ms.push(r + 12); return { title: `${kn(c.key)} 大調三度音程`, goal: '把音階兩個兩個跳著彈（1-3、2-4、3-5…），這是旋律感與指板認識的好練習。', tips: ['三度音程是和弦的基本組成', '注意大三度（4 格）與小三度（3 格）的差別', '慢慢彈、聽清楚每一組'], notes: seq(ms, 0.5) }; },
    c => { const r = low(c.key.pc, 31); const s = scaleOf(r, SC.major, 2); const ms = []; for (let i = 0; i < 6; i++) ms.push(s[i], s[i + 1], s[i + 2], s[i + 3]); ms.push(s[7]); return { title: `${kn(c.key)} 大調四音模進（1234）`, goal: '1-2-3-4、2-3-4-5、3-4-5-6…以四個音一組往上推進，練手指靈活度。', tips: ['每組第一個音稍微加重，幫助穩定節奏', '八分音符：一拍兩個音', '熟練後試著自己做下行版本'], notes: seq(ms, 0.5) }; },
    c => { const r = low(c.key.pc, 31); const s = scaleOf(r, SC.major, 2); const ms = []; for (let i = 0; i < 7; i++) ms.push(s[i], s[i + 1], s[i + 2]); ms.push(s[7]); return { title: `${kn(c.key)} 大調三音模進（123）`, goal: '三個音一組（1-2-3、2-3-4…），用三連音的感覺彈出來。', tips: ['一拍三個音，數「1-ta-ta 2-ta-ta」', '每組第一音對齊拍子', '這種模進常用在過門（fill）'], notes: seq(ms, 1 / 3) }; },
    c => { const r = low(c.key.pc, 28); const s = scaleOf(r, SC.major, 2).filter(m => m >= r + 7 && m <= r + 19); return { title: `${kn(c.key)} 大調：從五度到五度`, goal: '音階不一定要從根音開始。這課從低音的 Sol 彈到高音的 Sol，跨越八度的指型。', tips: ['你會用到根音下方的音', '找出需要換把位的地方，提前準備', '把音階想成一整片地圖，而不是一個盒子'], notes: seq(upDown(s), 0.5) }; },
    c => { const ch = prog(c.key.pc, 'classic'); const notes = []; ch.forEach((x, i) => { const nx = ch[(i + 1) % 4].r; const step = nx >= x.r ? 1 : -1; const sc = scaleOf(low(c.key.pc, 28), SC.major, 2); let pos = sc.indexOf(x.r); if (pos < 0) pos = sc.findIndex(m => m % 12 === x.r % 12); notes.push(N(x.r, 1), N(x.r, 1)); notes.push(N(sc[pos + step] ?? x.r, 1), N(sc[pos + 2 * step] ?? x.r, 1)); }); return { title: `音階走句連接和弦（${kn(c.key)} 調）`, goal: `${progText(c.key, 'classic')}，每小節前兩拍彈根音，後兩拍用音階音「走」向下一個和弦。`, tips: ['這是 walking bass 的雛形', '後兩拍要往下個和弦的方向走', '聽聽看線條是不是很自然地流到下一個根音'], notes: fill(notes) }; },
  ];

  T.s4 = [
    ...scaleT('minor', '自然小調', '自然小調的公式是「全半全全半全全」，和大調相比 3、6、7 級音降低半音。', ['指型：「1-3-4、1-3-4、1-3」', '和同名大調比較，感受明暗差異', '小調是搖滾與流行抒情歌的常客']),
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 小調五聲音階`, goal: '小調五聲音階只有 5 個音（1、b3、4、5、b7），是搖滾、藍調、放克貝斯的核心。', tips: ['指型：「1-4、1-3、1-3、1-4」很好記', '這五個音幾乎怎麼彈都好聽', '試著用它即興'], notes: rep(seq(upDown(scaleOf(r, SC.minPent)), 0.5), 2) }; },
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 大調五聲音階`, goal: '大調五聲（1、2、3、5、6）明亮、開闊，鄉村和流行音樂常用。', tips: ['和小調五聲是同一組音，只是根音不同', '試著找出它和大調音階少了哪兩個音', '保持手型放鬆'], notes: rep(seq(upDown(scaleOf(r, SC.majPent)), 0.5), 2) }; },
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 藍調音階`, goal: '在小調五聲加上「b5」這個藍調音，就是藍調音階，帶有獨特的張力。', tips: ['b5 是經過音，通常不會停留在上面', '藍調音階＝ 1 b3 4 b5 5 b7', '可以用滑音（slide）經過 b5'], notes: rep(seq(upDown(scaleOf(r, SC.blues)), 0.5), 2) }; },
    c => { const r = low(c.key.pc, 31); const s = scaleOf(r, SC.minPent, 2); const ms = []; for (let i = 0; i < 8; i++) ms.push(s[i], s[i + 1], s[i + 2]); ms.push(s[8]); ms.push(s[8]); return { title: `${kn(c.key)} 小調五聲三音模進`, goal: '把小調五聲用三個音一組的模進方式彈奏，用三連音節奏。', tips: ['一拍三個音', '跨越兩個八度，需要換把位', '這種句型常出現在搖滾貝斯的過門'], notes: fill(seq(ms, 1 / 3)) }; },
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 和聲小調`, goal: '把自然小調的第 7 級升高半音，就是和聲小調——有濃厚的古典與異國風情。', tips: ['注意 b6 到 7 之間是一個增二度（3 格）', '在小調歌曲的 V 和弦常會用到', '慢慢彈，聽那個特別的音程'], notes: seq(upDown(scaleOf(r, SC.harmMinor)), 1) }; },
    c => { const ch = prog(c.key.pc, 'minor'); return { title: `小調五聲律動（${kn(c.key)}m）`, goal: `在 ${progText(c.key, 'minor')} 上，用小調五聲音做出有切分的律動。`, tips: ['重音放在第 1 拍和反拍', '休止要乾淨', '這種線條常見於放克與靈魂樂'], notes: bars(ch, g16('x-.xx-x-x-.x--x-', [0, 0, 7, 10, 12, 10, 7])) }; },
    c => { const ch = prog(c.key.pc, 'blues'); return { title: `藍調 Boogie（${kn(c.key)} 調）`, goal: '經典的藍調 boogie 線條：1-3-5-6-b7-6-5-3，走完整個 12 小節藍調。', tips: ['這是搖滾樂早期最標誌性的貝斯線', '每小節同一個指型，只要平移', '保持八分音符平均'], notes: bars(ch, PAT.boogie) }; },
  ];

  T.s5 = [
    c => { const ch = prog(c.key.pc, 'classic', 36); return { title: `大三和弦琶音（${kn(c.key)} 調）`, goal: `大三和弦＝根音、大三度、五度。在 ${progText(c.key, 'classic')} 上彈 1-3-5-8。`, tips: ['大三度是根音往上 4 格', '指型：食指根音、小指三度、無名指五度（下一條弦）', '琶音就是把和弦拆開一個一個彈'], notes: rep(bars(ch, PAT.arp), 2) }; },
    c => { const ch = prog(c.key.pc, 'minor', 36); return { title: `小三和弦琶音（${kn(c.key)}m）`, goal: `小三和弦＝根音、小三度、五度。在 ${progText(c.key, 'minor')} 上彈 1-b3-5-8。`, tips: ['小三度是根音往上 3 格', '和大三和弦只差一個音，聽感卻完全不同', '注意換和弦時手的位置'], notes: rep(bars(ch, PAT.arp), 2) }; },
    c => { const r = low(c.key.pc, 28); const qs = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']; const notes = []; SC.major.forEach((iv, i) => { const rr = r + iv; const cc = CH[qs[i]]; notes.push(N(rr, 1), N(rr + cc[1], 1), N(rr + cc[2], 1), N(rr + cc[1], 1)); }); notes.push(N(r + 12, 4)); return { title: `${kn(c.key)} 調內三和弦`, goal: '大調音階每個音上都能疊出一個三和弦：I ii iii IV V vi vii°。逐一用琶音彈出來。', tips: ['大–小–小–大–大–小–減，這個順序要背起來', '減三和弦是 1-b3-b5', '這是理解和弦進行的基礎'], notes }; },
    c => { const ch = prog(c.key.pc, 'pop', 36); const inv = c.v % 2 === 0; return { title: `三和弦轉位（${kn(c.key)} 調）`, goal: inv ? '第一轉位：從三度音開始（3-5-8）。讓線條更平順。' : '第二轉位：從五度音開始（5-8-10）。', tips: ['轉位能讓和弦之間的距離變短', '找出每個和弦最近的三度或五度', '注意指型的變化'], notes: rep(bars(ch, inv ? (r, cc) => seq([r + cc[1], r + cc[2], r + 12, r + cc[2]], 1) : (r, cc) => seq([r + cc[2] - 12 >= 28 ? r + cc[2] - 12 : r + cc[2], r, r + cc[1], r]  , 1)), 2) }; },
    c => { const ch = prog(c.key.pc, 'fifties', 36); return { title: `和弦內音律動（${kn(c.key)} 調）`, goal: `用根音、三度、五度在 ${progText(c.key, 'fifties')} 上做出八分音符律動。`, tips: ['這種「1-3-5-3」的線條常見於 50 年代流行歌', '保持音與音之間的連貫', '試著讓每小節最後一個音接到下一個和弦'], notes: bars(ch, (r, cc) => seq([r, r, r + cc[1], r + cc[1], r + cc[2], r + cc[2], r + cc[1], r + cc[1]], 0.5)) }; },
    c => { const r = low(c.key.pc, 31); return { title: `減三和弦與增三和弦（${kn(c.key)}）`, goal: '減三和弦（1-b3-b5）緊張、增三和弦（1-3-#5）懸疑。依序彈大、小、減、增四種三和弦。', tips: ['大：4+3 格、小：3+4 格、減：3+3 格、增：4+4 格', '用耳朵記住每種和弦的「顏色」', '四種三和弦是所有和弦的基礎'], notes: rep(['maj', 'min', 'dim', 'aug'].flatMap(q => seq([r, r + CH[q][1], r + CH[q][2], r + CH[q][1]], 1)), 1).concat([N(r, 4)]) }; },
    c => { const ch = prog(c.key.pc, 'classic', 36); return { title: `琶音八分音符上下行（${kn(c.key)} 調）`, goal: '1-3-5-8-8-5-3-1 的八分音符琶音，讓和弦音更流暢地在指板上移動。', tips: ['上行和下行指法對稱', '讓每個音的音量一致', '熟練後試試把速度推高'], notes: bars(ch, PAT.arp8) }; },
    c => { const ch = prog(c.key.pc, 'pop', 36); return { title: `流行和弦音律動（${kn(c.key)} 調）`, goal: `用十六分音符格子做出流行歌常見的線條，進行：${progText(c.key, 'pop')}。`, tips: ['留意每個休止符的位置', '第一拍一定要穩', '這個律動像很多 80 年代流行歌'], notes: bars(ch, g16('x--xx-x-x--xx-x-', [0, 0, 7, 12, 7, 0, '3', '5'])) }; },
  ];

  T.s6 = [
    c => { const ch = prog(c.key.pc, 'fifties'); return { title: `十六分音符根音（${kn(c.key)} 調）`, goal: '一拍四個音的十六分音符根音，考驗右手耐力與均勻度。', tips: ['數「1-e-&-a 2-e-&-a」', '右手放鬆，用小動作撥弦', '速度不夠時先降 BPM'], notes: bars(ch, PAT.sixteen), bpmMul: 0.85 }; },
    c => { const ch = prog(c.key.pc, 'rock'); return { title: `Gallop 奔馬節奏（${kn(c.key)} 調）`, goal: '「噠–噠噠」（八分＋兩個十六分）的奔馬節奏，重金屬的經典律動。', tips: ['右手指法可以用 i-m-i 或 m-i-m', '三個音要清楚分開', '保持每拍的第一下最重'], notes: bars(ch, PAT.gallop) }; },
    c => { const ch = prog(c.key.pc, 'classic'); return { title: `反向 Gallop（${kn(c.key)} 調）`, goal: '「噠噠–噠」（兩個十六分＋八分），和上一種相反的節奏型。', tips: ['兩個十六分音符要快速而平均', '後面的八分音符要撐滿', '和鼓的節奏對齊'], notes: bars(ch, PAT.revGallop) }; },
    c => { const ch = prog(c.key.pc, 'pop', 36); return { title: `搖滾十六分律動（${kn(c.key)} 調）`, goal: '在八分音符律動中加入十六分音符的裝飾，讓線條更有推進力。', tips: ['休止的地方要確實止音', '重音放在正拍', '可以想像自己在搖滾樂團裡'], notes: bars(ch, g16('x-xxx-xxx-xxx-xx', [0])), bpmMul: 0.9 }; },
    c => { const ch = prog(c.key.pc, 'fifties', 36); return { title: `Motown 靈魂律動（${kn(c.key)} 調）`, goal: '60 年代 Motown 風格：大量使用八度、五度和切分，旋律性很強的貝斯線。', tips: ['這種線條既是節奏也是旋律', '休止要短而乾淨', '想像經典靈魂樂的貝斯手'], notes: bars(ch, g16('x--x--x-x-.xx---', [0, 12, 7, 10, 7, 0])) }; },
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 大調音階十六分音符`, goal: '用十六分音符彈大調音階，結合音階指法與快速右手。', tips: ['先在 70% 速度彈到乾淨，再加速', '左右手要同步', '每拍第一個音稍重'], notes: fill(rep(seq(upDown(scaleOf(r, SC.major)), 0.25), 2)), bpmMul: 0.8 }; },
    c => { const ch = prog(c.key.pc, 'sad', 36); return { title: `流行十六分切分（${kn(c.key)} 調）`, goal: '十六分音符格子上的切分音，讓律動有彈性。', tips: ['數清楚「1-e-&-a」，找到每個音的位置', '休止的地方也是律動的一部分', '先拍手打出節奏'], notes: bars(ch, g16('x..x..x...x.x...', [0, 0, 12, 7, 0])) }; },
    c => { const ch = prog(c.key.pc, 'aeolian', 36); return { title: `十六分音符抒情律動（${kn(c.key)}m）`, goal: '抒情搖滾常見：長音加上十六分音符的連接音，帶到下一個和弦。', tips: ['長音要撐滿', '連接音要輕巧', '聽整體線條的流動'], notes: bars(ch, g16('x-----x-x---x-xx', [0, 0, 7, 12, 10, 7])) }; },
  ];

  T.s7 = [
    c => { const ch = prog(c.key.pc, 'iiVI', 36); return { title: `大七和弦琶音（${kn(c.key)} 調）`, goal: '大七和弦（1-3-5-7）溫暖、有爵士感。在 ii–V–I 上彈出每個七和弦的琶音。', tips: ['大七度是根音往下一格（高八度）', '小七度：根音往下兩格', '注意 m7、7、maj7 三種七和弦的差別'], notes: rep(bars(ch, PAT.arp), 2) }; },
    c => { const r = low(c.key.pc, 31); return { title: `四種七和弦（${kn(c.key)}）`, goal: '同一個根音上彈 maj7、7、m7、m7b5 四種七和弦，比較它們的聲音。', tips: ['maj7：1 3 5 7｜7：1 3 5 b7', 'm7：1 b3 5 b7｜m7b5：1 b3 b5 b7', '每次只改一個音，聽變化'], notes: ['maj7', '7', 'm7', 'm7b5'].flatMap(q => seq([r, r + CH[q][1], r + CH[q][2], r + CH[q][3]], 1)).concat([N(r, 4)]) }; },
    c => { const r = low(c.key.pc, 28); const qs = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5']; const notes = []; SC.major.forEach((iv, i) => { const rr = r + iv; const cc = CH[qs[i]]; notes.push(...seq([rr, rr + cc[1], rr + cc[2], rr + cc[3]], 1)); }); notes.push(N(r + 12, 4)); return { title: `${kn(c.key)} 調內七和弦`, goal: '大調每個音上的七和弦：Imaj7 iim7 iiim7 IVmaj7 V7 vim7 viim7b5。', tips: ['只有 V 是屬七和弦（7）', '記住這個順序，爵士與流行和聲就看得懂了', '慢慢彈，邊彈邊念出和弦名稱'], notes }; },
    c => { const ch = prog(c.key.pc, 'turn', 36); return { title: `七和弦下行琶音（${kn(c.key)} 調）`, goal: `從高八度往下彈 8-7-5-3，在 ${progText(c.key, 'turn')} 上練習。`, tips: ['下行琶音常用於樂句結尾', '注意每個和弦的七度位置', '保持四分音符平穩'], notes: rep(bars(ch, PAT.arpDown), 2) }; },
    c => { const ch = prog(c.key.pc, 'iiVI', 36); return { title: `ii–V–I 八分琶音（${kn(c.key)} 調）`, goal: '爵士最重要的和弦進行 ii–V–I，用八分音符琶音上下行。', tips: ['ii 是小七、V 是屬七、I 是大七', '這組進行在爵士標準曲裡無所不在', '試著聽出 V→I 的解決感'], notes: bars(ch, PAT.arp8) }; },
    c => { const ch = prog(c.key.pc, 'blues'); return { title: `屬七和弦藍調（${kn(c.key)} 調）`, goal: '12 小節藍調每個和弦都是屬七和弦，用 1-3-5-b7 琶音彈完整個曲式。', tips: ['屬七和弦的 b7 是藍調味道的來源', '每小節一個琶音', '注意第 9～10 小節 V→IV 的變化'], notes: bars(ch, PAT.arp) }; },
    c => { const r = low(c.key.pc, 31); return { title: `減七和弦（${kn(c.key)}）`, goal: '減七和弦（1-b3-b5-bb7）每個音都相差 3 格，完全對稱，常用作經過和弦。', tips: ['每隔 3 格一個音，指型很規律', '往上疊三次就回到高八度', '聽聽它強烈的緊張感'], notes: rep(seq([r, r + 3, r + 6, r + 9, r + 12, r + 9, r + 6, r + 3], 0.5), 2).concat([N(r, 4)]) }; },
    c => { const ch = prog(c.key.pc, 'turn', 36); return { title: `七和弦律動（${kn(c.key)} 調）`, goal: `用七和弦音做出靈魂樂風格的律動，進行：${progText(c.key, 'turn')}。`, tips: ['七度音讓線條更有色彩', '休止要乾淨', '感受 R&B 的流動感'], notes: bars(ch, g16('x--x-x-xx--x-x--', [0, '5', '7', 12, 0, '3', '5'])) }; },
  ];

  T.s8 = [
    c => { const ch = prog(c.key.pc, 'iiVI', 43); return { title: `Two-feel 二分音符（${kn(c.key)} 調）`, goal: '爵士的 two-feel：每小節彈根音和五度兩個二分音符，是 walking 之前的準備。', tips: ['輕鬆、有搖擺感', '五度可以在根音上方或下方', '聽起來像在「散步」之前的「踱步」'], notes: rep(bars(ch, PAT.country), 2) }; },
    c => { const ch = prog(c.key.pc, 'iiVI', 43); return { title: `和弦音 Walking（${kn(c.key)} 調）`, goal: 'Walking bass 第一步：每拍一個音，只用和弦內音 1-3-5-3。', tips: ['四分音符要很平均，像在走路', '第 1 拍永遠是根音', '音要飽滿、連貫（legato）'], notes: rep(bars(ch, PAT.r353), 2) }; },
    c => { const ch = prog(c.key.pc, 'turn', 43); const notes = []; ch.forEach((x, i) => { const nx = ch[(i + 1) % 4].r; notes.push(N(x.r, 1), N(x.r + x.c[1], 1), N(x.r + x.c[2], 1), N(nx - 1 >= 28 ? nx - 1 : nx + 1, 1)); }); notes.push(N(ch[0].r, 4)); return { title: `半音接近音（${kn(c.key)} 調）`, goal: '第 4 拍用比下一個根音低（或高）半音的音來「接近」它，這是 walking bass 的靈魂。', tips: ['接近音會自然地被拉向下一個根音', '第 1～3 拍彈 1-3-5，第 4 拍彈接近音', '聽聽看那種「快到了」的張力'], notes: rep(notes.slice(0, -1), 2).concat([N(ch[0].r, 4)]) }; },
    c => { const ch = prog(c.key.pc, 'iiVI', 43); const notes = []; ch.forEach((x, i) => { const nx = ch[(i + 1) % 4].r; const up = nx > x.r; notes.push(N(x.r, 1), N(x.r + 2, 1), N(x.r + x.c[1], 1), N(x.r + x.c[2], 1)); }); return { title: `音階式 Walking（${kn(c.key)} 調）`, goal: '用 1-2-3-5 的音階走法連接和弦，線條更像旋律。', tips: ['音階音讓線條更平順', '注意每個和弦的三度是大三還是小三', '試著讓第 4 拍更接近下一個根音'], notes: rep(notes, 2).concat([N(ch[0].r, 4)]) }; },
    c => { const ch = prog(c.key.pc, 'blues', 43); return { title: `12 小節藍調 Walking（${kn(c.key)} 調）`, goal: '把學過的和弦音、音階音、接近音組合起來，走完整首 12 小節藍調。', tips: ['每小節第 1 拍是根音', '第 4 拍盡量用接近音', '保持四分音符像時鐘一樣穩定'], notes: walk(ch, c.rnd) }; },
    c => { const ch = prog(c.key.pc, 'turn', 43); return { title: `I–vi–ii–V 循環 Walking（${kn(c.key)} 調）`, goal: '爵士最常見的循環進行，用 walking bass 繞兩圈。', tips: ['這個循環也叫「turnaround」', 'V 到 I 的接近音特別重要', '專注在時間感上'], notes: walk(ch.concat(prog(c.key.pc, 'turn', 43)), c.rnd) }; },
    c => { const ch = prog(c.key.pc, 'mblues', 43); return { title: `小調藍調 Walking（${kn(c.key)}m）`, goal: '小調藍調的 walking bass，和弦是 m7，聽起來更深沉。', tips: ['小三度要彈對', '第 9 小節的 bVI7 是新顏色', '保持搖擺的感覺'], notes: walk(ch, c.rnd) }; },
    c => { const ch = prog(c.key.pc, 'iiVI', 43).concat(prog((c.key.pc + 10) % 12, 'iiVI', 43)); return { title: `兩個調的 ii–V–I（${kn(c.key)} → ${KEYS.find(k => k.pc === (c.key.pc + 10) % 12)?.n || ''}）`, goal: '先在原調走 ii–V–I，再降一個全音走一次。爵士標準曲常這樣轉調。', tips: ['轉調時找到最近的新根音', '接近音能讓轉調更順', '注意新調的三度音'], notes: walk(ch, c.rnd) }; },
  ];

  const modeT = (name, label, desc, tips, vamp, gpat, gints) => [
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} ${label}`, goal: desc, tips, notes: rep(seq(upDown(scaleOf(r, SC[name])), 0.5), 2) }; },
    c => { const ch = prog(c.key.pc, vamp, 36); return { title: `${label}律動（${kn(c.key)}）`, goal: `在 ${progText(c.key, vamp)} 的循環上，用${label}的特色音做出律動。`, tips: [`仔細聽${label}的特色音`, '律動先求穩，再求變化', '這個聲音常出現在放克、融合爵士'], notes: bars(ch, g16(gpat, gints)) }; },
  ];

  T.s9 = [
    ...modeT('dorian', '多利安調式', '多利安＝小調音階把第 6 級升高半音（1 2 b3 4 5 6 b7）。小調卻帶點明亮，放克和爵士的最愛。', ['特色音是大六度', '和自然小調只差一個音', '聽聽看它比自然小調更「酷」'], 'dorianVamp', 'x--x-xx-x--x-x-.', [0, 0, 7, 10, 12, 9, 7]),
    ...modeT('mixolydian', '混合利地安調式', '混合利地安＝大調音階把第 7 級降低半音（1 2 3 4 5 6 b7）。藍調搖滾和放克的基礎。', ['特色音是小七度', '屬七和弦就是從這裡來的', '很多搖滾 riff 都用這個調式'], 'mixoVamp', 'x-.xx-x-x-.x-xx-', [0, 0, 4, 7, 10, 12, 10, 7]),
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 利地安調式`, goal: '利地安＝大調音階把第 4 級升高半音（1 2 3 #4 5 6 7）。夢幻、飄浮，電影配樂常用。', tips: ['特色音是增四度（#4）', '比大調更明亮', '試著在大七和弦上使用'], notes: rep(seq(upDown(scaleOf(r, SC.lydian)), 0.5), 2) }; },
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 弗里吉安調式`, goal: '弗里吉安＝自然小調把第 2 級降低半音（1 b2 b3 4 5 b6 b7）。西班牙、佛朗明哥、金屬的味道。', tips: ['特色音是 b2', '根音和 b2 之間只差一格', '試著反覆彈 1-b2-1 感受張力'], notes: rep(seq(upDown(scaleOf(r, SC.phrygian)), 0.5), 2) }; },
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 洛克里安調式`, goal: '洛克里安（1 b2 b3 4 b5 b6 b7）是最不穩定的調式，配合 m7b5 和弦使用。', tips: ['五度是減五度，所以很不穩定', '主要用在 ii–V–i 小調進行的 iim7b5', '認識它就好，不常當主調式'], notes: rep(seq(upDown(scaleOf(r, SC.locrian)), 0.5), 2) }; },
    c => { const r = low(c.key.pc, 31); return { title: `大調 vs 小調（${kn(c.key)}）`, goal: '同一個根音，先彈伊奧尼安（大調）再彈愛奧利安（自然小調），比較 3、6、7 級的差異。', tips: ['伊奧尼安＝大調、愛奧利安＝自然小調', '只看三個音的變化', '用耳朵分辨明與暗'], notes: seq(upDown(scaleOf(r, SC.major)), 0.5).concat(seq(upDown(scaleOf(r, SC.minor)), 0.5)) }; },
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 旋律小調`, goal: '旋律小調（1 2 b3 4 5 6 7）＝大調降三度。爵士常用的「小大七」色彩。', tips: ['和多利安只差第 7 級', '在 mMaj7 和弦上使用', '聲音帶有懸疑感'], notes: rep(seq(upDown(scaleOf(r, SC.melMinor)), 0.5), 2) }; },
    c => { const r = low(c.key.pc, 31); const names = ['major', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'minor', 'locrian']; const nm = names[c.v % 7]; const s = scaleOf(r, SC[nm], 2); const ms = []; for (let i = 0; i < 8; i++) ms.push(s[i], s[i + 1], s[i + 2], s[i + 3]); ms.push(s[8]); return { title: `調式四音模進（${kn(c.key)} ${{ major: '伊奧尼安', dorian: '多利安', phrygian: '弗里吉安', lydian: '利地安', mixolydian: '混合利地安', minor: '愛奧利安', locrian: '洛克里安' }[nm]}）`, goal: '用 1234 模進彈奏調式，讓每個調式的指型更熟悉。', tips: ['每組四個音，第一個音稍重', '跨兩個八度需要換把位', '熟練後試著倒過來彈'], notes: fill(seq(ms, 0.5)) }; },
  ];

  T.s10 = [
    c => { const ch = prog(c.key.pc, 'pop', 36); return { title: `迪斯可八度（${kn(c.key)} 調）`, goal: '迪斯可的招牌：八度交替的八分音符，低音在正拍、高音在反拍。', tips: ['左手可以用食指＋小指固定八度指型', '高音要短促有彈性', '跟著四分音符的大鼓踩拍'], notes: bars(ch, PAT.oct8), bpmMul: 1.1 }; },
    c => { const ch = prog(c.key.pc, 'dorianVamp', 36); return { title: `放克十六分八度（${kn(c.key)}m）`, goal: '十六分音符格子上的八度律動，放克貝斯的核心語彙。', tips: ['休止時兩手都要止音', '重音在 1 和 3 拍', '這個律動也適合用 slap 彈（偵測只看音高）'], notes: bars(ch, g16('x.xx.x.xx.x.x.xx', [0, 12, 0, 12, 0, 12])) }; },
    c => { const ch = prog(c.key.pc, 'dorianVamp', 36); return { title: `放克小七律動（${kn(c.key)}m）`, goal: '加入 b7 和五度的放克線條，留白比音符更重要。', tips: ['空拍讓律動呼吸', '音要短、乾淨', '感受「一拍」（the One）的重量'], notes: bars(ch, g16('x..x.xx.x.x..x..', [0, 12, 10, 7, 0, 10, 12])) }; },
    c => { const ch = prog(c.key.pc, 'classic', 36); return { title: `三連音琶音（${kn(c.key)} 調）`, goal: '一拍三個音的三連音，用 1-3-5 琶音彈奏。', tips: ['數「1-ta-ta 2-ta-ta」', '每拍第一音對齊節拍器', '三連音給人搖擺流動的感覺'], notes: bars(ch, g12('xxxxxxxxxxxx', [0, '3', '5', 12, '5', '3'])) }; },
    c => { const ch = prog(c.key.pc, 'blues4'); return { title: `Shuffle 搖擺節奏（${kn(c.key)} 調）`, goal: '把三連音的中間省略，變成「長–短」的 shuffle 節奏，藍調搖滾的基本律動。', tips: ['長音佔三連音的前兩格、短音佔最後一格', '聽起來像「噠～噠 噠～噠」', '保持鬆弛的感覺'], notes: rep(bars(ch, g12('x-xx-xx-xx-x', [0, 0, 4, 4, 7, 7, 9, 9])), 2) }; },
    c => { const ch = prog(c.key.pc, 'blues'); return { title: `12 小節 Shuffle 藍調（${kn(c.key)} 調）`, goal: '把 shuffle 節奏套進完整的 12 小節藍調，用 1-3-5-6-b7-6-5-3 的經典線條。', tips: ['這是藍調樂團裡最常彈的東西', '每 4 小節是一句', '專心在 shuffle 的律動感'], notes: bars(ch, g12('x-xx-xx-xx-x', [0, '3', '5', 9, 10, 9, '5', '3'])) }; },
    c => { const ch = prog(c.key.pc, 'mixoVamp', 36); return { title: `Slap 風格八度（${kn(c.key)}）`, goal: '仿 slap 的八度句型：低音用拇指敲、高音用食指勾。App 只判斷音高與節奏，你可以用指彈或 slap。', tips: ['拇指敲弦（thump）要打在指板末端', '食指勾弦（pop）力道不要太大', '先用指彈確認音和節奏正確'], notes: bars(ch, g16('x.x.x.xxx.x.x.xx', [0, 12, 0, 12, 0, 12, 10, 12])), bpmMul: 0.9 }; },
    c => { const ch = prog(c.key.pc, 'minor', 36); return { title: `小調五聲放克 Riff（${kn(c.key)}m）`, goal: '用小調五聲音階做出有十六分切分的放克 riff。', tips: ['音符之間的空隙是律動的關鍵', '左手要能快速止音', '重複練到身體自己會動'], notes: bars(ch, g16('x.xxx.x.xx.x.x..', [0, 0, 3, 5, 7, 10, 12, 10, 7])) }; },
  ];

  T.s11 = [
    c => { const r = low([4, 5, 6, 7][c.v % 4], 28); const names = ['E', 'F', 'F#', 'G']; return { title: `${names[c.v % 4]} 大調兩個八度`, goal: '兩個八度的大調音階，中間需要換把位。這是走遍整個指板的第一步。', tips: ['找好換把位的點，通常在食指或用滑音', '換把位時不要停頓', '上行和下行換把位的地方可以不同'], notes: seq(upDown(scaleOf(r, SC.major, 2)), 0.5) }; },
    c => { const r = low([4, 5, 6, 7, 9][c.v % 5], 28); return { title: `小調五聲兩個八度（${SHARP[r % 12]}m）`, goal: '小調五聲音階延伸到兩個八度，練習在指板上縱向移動。', tips: ['五聲音階每條弦兩個音，換把位很自然', '可以用滑音連接把位', '注意音量一致'], notes: seq(upDown(scaleOf(r, SC.minPent, 2)), 0.5) }; },
    c => { const s = c.v % 2 ? 1 : 2; const r = OPEN[s]; const notes = seq(upDown(scaleOf(r, SC.major)), 1); assignTab(notes, { string: s }); return { title: `單弦音階：${SN[s]} 弦換把位`, goal: `只用 ${SN[s]} 弦彈完整個大調音階。強迫自己沿著琴頸橫向移動，認識每個音在高把位的位置。`, tips: ['用 1-2-4 或 1-3-4 指法加滑動', '眼睛看指板上的記號點', '音要連貫，不要有空檔'], notes, fixed: true }; },
    c => { const f0 = [5, 7, 3, 9][c.v % 4]; const up = []; for (let s = 0; s < 4; s++) for (let k = 0; k < 4; k++) up.push({ m: OPEN[s] + f0 + k, d: 0.25, s, f: f0 + k }); const down = []; for (let s = 3; s >= 0; s--) for (let k = 3; k >= 0; k--) down.push({ m: OPEN[s] + f0 + k, d: 0.25, s, f: f0 + k }); return { title: `速度練習：十六分爬格子（第 ${f0} 格）`, goal: '用十六分音符爬格子，把左右手的同步推到更快。', tips: ['先在低 BPM 彈到 100% 乾淨', '每次只加 5 BPM', '手指離指板越近越快'], notes: rep(up.concat(down), 2), bpmMul: 0.9 }; },
    c => { const r = low([4, 5, 7, 9][c.v % 4], 28); const ms = [0, 4, 7, 12, 16, 19, 24].map(x => r + x); return { title: `兩個八度大三和弦琶音（${SHARP[r % 12]}）`, goal: '大三和弦琶音延伸到兩個八度，需要換把位。', tips: ['在第二個根音換把位', '音程距離要靠肌肉記憶', '可以用滑音輔助'], notes: seq(upDown(ms), 0.5).concat([N(r, 1.5)]) }; },
    c => { const ch = prog(c.key.pc, 'pop', 36); return { title: `跨弦八度（${kn(c.key)} 調）`, goal: '根音在 E/A 弦、高八度在 D/G 弦，十六分音符快速跨弦。', tips: ['右手要精準跳弦', '中間的弦用左手手指止音', '節奏均勻最重要'], notes: bars(ch, g16('x.xxx.xxx.xxx.xx', [0, 12, 0, 12])) }; },
    c => { const ch = prog(c.key.pc, 'classic', 36); return { title: `十度音程（${kn(c.key)} 調）`, goal: '根音加十度（高八度的三度），音域寬廣的抒情線條。', tips: ['十度＝八度＋大三度', '需要大跨度或換把位', '音色要飽滿'], notes: rep(bars(ch, (r, cc) => seq([r, r + 7, r + 12 + cc[1], r + 7], 1)), 2) }; },
    c => { const r = low(c.key.pc, 31); return { title: `${kn(c.key)} 大調十六分模進`, goal: '大調音階 1234 模進，用十六分音符彈。整合指法與速度。', tips: ['先慢後快', '每組第一個音要重', '不要讓左手搶拍'], notes: (() => { const s = scaleOf(r, SC.major, 2); const ms = []; for (let i = 0; i < 8; i++) ms.push(s[i], s[i + 1], s[i + 2], s[i + 3]); return fill(seq(ms, 0.25).concat([N(s[8], 1)])); })(), bpmMul: 0.8 }; },
  ];

  T.s12 = [
    c => { const ch = prog(c.key.pc, 'rock'); return { title: `搖滾：八分音符推進（${kn(c.key)} 調）`, goal: '經典搖滾貝斯：穩定的八分音符根音，最後一拍加入經過音。', tips: ['和大鼓完全對齊', '經過音讓換和弦更有力', '音色可以稍微撥重一點'], notes: bars(ch, g16('x-x-x-x-x-x-x-x-', [0, 0, 0, 0, 0, 0, 7, 10])) }; },
    c => { const ch = prog(c.key.pc, 'fifties', 36); return { title: `靈魂樂：旋律性貝斯（${kn(c.key)} 調）`, goal: 'Soul／R&B 風格：根音、五度、八度和經過音交織成旋律。', tips: ['線條要唱得出來', '注意休止', '輕重分明'], notes: bars(ch, g16('x--x-.x-x--xx-x-', [0, 7, 12, 10, 7, 0, '3'])) }; },
    c => { const ch = prog(c.key.pc, 'classic', 36); return { title: `雷鬼：One Drop（${kn(c.key)} 調）`, goal: '雷鬼的第一拍常常是空的！貝斯從第 2 拍進來，大量休止營造空間感。', tips: ['不要怕空拍，那正是雷鬼的味道', '音色厚、短', '律動要放鬆、往後靠'], notes: bars(ch, g16('....x-x-....x.x.', [0, 0, 7, 12, 7])) }; },
    c => { const ch = prog(c.key.pc, 'pop', 36); return { title: `迪斯可：八度＋經過音（${kn(c.key)} 調）`, goal: '迪斯可八度加上十六分音符經過音，舞池必備。', tips: ['八度要有彈性', '經過音輕巧帶過', '保持高能量'], notes: bars(ch, g16('x-x-x-x-x-x-x.xx', [0, 12, 0, 12, 0, 12, 0, 10, 12])), bpmMul: 1.1 }; },
    c => { const ch = prog(c.key.pc, 'iiVI', 36); return { title: `拉丁：Tumbao（${kn(c.key)} 調）`, goal: 'Salsa 的 tumbao 節奏：貝斯在「2 的 &」和第 4 拍出現，常常不彈第一拍。', tips: ['這是切分的極致', '第 4 拍的音會延續到下一小節', '慢慢習慣「沒有第一拍」的感覺'], notes: bars(ch, g16('......x-----x---', ['5', 0])) }; },
    c => { const ch = prog(c.key.pc, 'turn', 36); return { title: `巴薩諾瓦（${kn(c.key)} 調）`, goal: 'Bossa Nova：根音（附點四分）＋五度（八分）＋五度（二分），溫柔搖擺。', tips: ['音色柔和', '五度通常在根音下方', '節奏要輕鬆，不要搶'], notes: rep(bars(ch, PAT.bossa), 2) }; },
    c => { const ch = prog(c.key.pc, 'blues', 43); return { title: `爵士藍調 Walking（${kn(c.key)} 調）`, goal: '完整的爵士藍調 walking bass，綜合和弦音、音階、接近音。', tips: ['四分音符要「往前走」', '保持輕快的搖擺感', '試著隨速度加快'], notes: walk(ch, c.rnd) }; },
    c => { const ch = prog(c.key.pc, 'mixoVamp', 36); return { title: `放克：完整 Groove（${kn(c.key)}）`, goal: '結合八度、b7、切分與休止的完整放克律動。', tips: ['專注在「the One」', '空拍和音符一樣重要', '讓身體跟著律動'], notes: bars(ch, g16('x.xx.x.xx.x.x.xx', [0, 12, 10, 7, 0, 12, 10, 12, 7])), bpmMul: 0.9 }; },
    c => { const ch = prog(c.key.pc, 'blues4'); return { title: `藍調 Shuffle（${kn(c.key)} 調）`, goal: 'Shuffle 藍調加上 b7 的線條：1-3-5-6-b7-6-5-3。', tips: ['長短分明', '律動往後靠', '和鼓手一起搖擺'], notes: rep(bars(ch, g12('x-xx-xx-xx-x', [0, '3', '5', 9, 10, 9, '5', '3'])), 2) }; },
    c => { const ch = prog(c.key.pc, 'classic'); return { title: `鄉村：交替低音（${kn(c.key)} 調）`, goal: '鄉村音樂的 root–five 交替低音，五度在根音下方。', tips: ['二分音符要撐滿', '音色乾淨明亮', '最後一小節可以加入經過音'], notes: rep(bars(ch, (r, cc) => [N(r, 1), N(r + cc[2] - 12 >= 28 ? r + cc[2] - 12 : r + cc[2], 1), N(r, 1), N(r + cc[2] - 12 >= 28 ? r + cc[2] - 12 : r + cc[2], 1)]), 2) }; },
    c => { const ch = prog(c.key.pc, 'minor'); return { title: `金屬：Gallop Riff（${kn(c.key)}m）`, goal: '高速 gallop 節奏加上小調的經過音，重金屬貝斯。', tips: ['右手要非常穩定', '左手止音避免雜音', '耐力訓練'], notes: bars(ch, g16('x-xxx-xxx-xxx-xx', [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 7])) }; },
    c => { const ch = prog(c.key.pc, 'sad', 36); return { title: `抒情：長音與連接（${kn(c.key)} 調）`, goal: '抒情歌：長音撐住和弦，在小節結尾用經過音連到下一個和弦。', tips: ['長音要飽滿不斷', '經過音輕柔', '服務歌曲，不要搶戲'], notes: bars(ch, (r, cc) => [N(r, 2), N(r + cc[2], 1), N(r + cc[1], 0.5), N(r + 2, 0.5)]) }; },
  ];

  const STAGES = [
    { name: '基礎複習：指板與雙手', days: 30, bpm: [60, 80], keys: 4, t: T.s1, desc: '空弦、爬格子、音名、八度與根音——打穩基本功。' },
    { name: '根音律動與節奏', days: 30, bpm: [70, 95], keys: 5, t: T.s2, desc: '根音、五度、八度、切分與休止，貝斯手的節奏核心。' },
    { name: '大調音階', days: 30, bpm: [60, 100], keys: 7, t: T.s3, desc: '大調音階指型、三度、模進與音階走句。' },
    { name: '小調・五聲・藍調', days: 30, bpm: [65, 105], keys: 8, t: T.s4, desc: '自然小調、五聲音階、藍調音階與 boogie。' },
    { name: '三和弦琶音', days: 30, bpm: [70, 110], keys: 9, t: T.s5, desc: '大小減增三和弦、調內和弦、轉位與和弦內音律動。' },
    { name: '十六分音符律動', days: 30, bpm: [65, 100], keys: 10, t: T.s6, desc: '十六分音符、gallop、Motown 與流行切分。' },
    { name: '七和弦與爵士和聲', days: 30, bpm: [70, 110], keys: 12, t: T.s7, desc: '四種七和弦、調內七和弦、ii–V–I 與減七和弦。' },
    { name: 'Walking Bass', days: 30, bpm: [80, 140], keys: 12, t: T.s8, desc: 'Two-feel、和弦音、接近音、藍調與 ii–V–I 的 walking。' },
    { name: '調式', days: 30, bpm: [70, 110], keys: 12, t: T.s9, desc: '多利安、混合利地安、利地安、弗里吉安、洛克里安、旋律小調。' },
    { name: 'Funk・八度・三連音', days: 30, bpm: [75, 105], keys: 12, t: T.s10, desc: '迪斯可八度、放克十六分、三連音與 shuffle。' },
    { name: '換把位與速度', days: 30, bpm: [80, 130], keys: 12, t: T.s11, desc: '兩個八度音階與琶音、單弦換把位、速度練習。' },
    { name: '綜合曲風實戰', days: 35, bpm: [80, 125], keys: 12, t: T.s12, desc: '搖滾、靈魂、雷鬼、迪斯可、拉丁、巴薩、爵士、放克、金屬。' },
  ];

  const round5 = (x) => Math.max(40, Math.round(x / 5) * 5);

  function build() {
    const lessons = []; let day = 1; let start = 1;
    STAGES.forEach((st, si) => {
      st.start = start; st.end = start + st.days - 1; st.index = si;
      let j = 0;
      for (let i = 0; i < st.days; i++, day++) {
        const bpm0 = st.bpm[0] + (st.bpm[1] - st.bpm[0]) * (i / (st.days - 1));
        let L;
        if (day === 365) {
          const key = KEYS[0];
          const ch = prog(key.pc, 'blues', 43);
          L = { title: '畢業考：12 小節藍調 Walking ＋ 放克尾奏', goal: '恭喜走到第 365 天！把一年來學到的 walking bass 與放克律動串成一首完整的曲子。', tips: ['先用第一顆星確認每個音', '再用節奏模式挑戰完整速度', '你已經是一位真正的貝斯手了'], notes: walk(ch, rng(365)).slice(0, -1).concat(bars(prog(key.pc, 'mixoVamp', 36), g16('x.xx.x.xx.x.x.xx', [0, 12, 10, 7, 0, 12, 10, 12, 7]))).concat([N(36, 4)]), bpm: 100, key, review: false };
        } else if (day % 7 === 0 && lessons.length >= 2) {
          const a = lessons[lessons.length - 1], b = lessons[lessons.length - 2];
          L = { title: `第 ${day / 7} 週複習`, goal: `把這週的「${b.title}」和「${a.title}」串在一起，一口氣彈完。`, tips: ['兩段之間不要停', '先求準確，再求速度', '複習日也是檢查自己進步的好時機'], notes: b.notes.map(n => ({ ...n })).concat(a.notes.map(n => ({ ...n }))), bpm: Math.min(a.bpm, b.bpm), key: a.key, review: true, fixed: true };
        } else {
          const tpl = st.t[j % st.t.length];
          const v = Math.floor(j / st.t.length) + si;
          const key = KEYS[(j * 5 + si * 3) % st.keys];
          const ctx = { v, key, rnd: rng(day * 7919), flat: FLAT_PC.has(key.pc) };
          const o = tpl(ctx);
          L = { ...o, bpm: round5(bpm0 * (o.bpmMul || 1)), key };
          j++;
        }
        L.notes = fill(L.notes.map(n => ({ ...n })));
        L.notes.forEach(n => { n.d = Math.round(n.d * 120) / 120; });
        if (!L.fixed) assignTab(L.notes);
        L.day = day; L.stage = si; L.flat = FLAT_PC.has(L.key.pc);
        lessons.push(L);
      }
      start += st.days;
    });
    return lessons;
  }

  const LESSONS = build();
  const noteName = (m, flat) => (flat ? FLAT : SHARP)[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  const pcName = (m, flat) => (flat ? FLAT : SHARP)[((m % 12) + 12) % 12];
  window.BASS365 = { LESSONS, STAGES, OPEN, SN, noteName, pcName };
})();
