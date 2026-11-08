/* Bass 365 — 音訊引擎：麥克風、YIN 音高偵測、合成貝斯、節拍器 */
(function () {
  let ctx = null, stream = null, src = null, inGain = null, analyser = null, buf = null, ds = null;
  let master = null, noiseBuf = null, live = [];

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  async function startMic(gain = 1) {
    ensureCtx();
    if (stream) return;
    if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const e = new Error('INSECURE'); throw e;
    }
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    src = ctx.createMediaStreamSource(stream);
    inGain = ctx.createGain(); inGain.gain.value = gain;
    analyser = ctx.createAnalyser();
    analyser.fftSize = ctx.sampleRate > 50000 ? 8192 : 4096;
    analyser.smoothingTimeConstant = 0;
    src.connect(inGain); inGain.connect(analyser);
    buf = new Float32Array(analyser.fftSize);
  }

  function stopMic() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    try { src && src.disconnect(); } catch (e) { }
    stream = src = analyser = null;
  }

  function setGain(g) { if (inGain) inGain.gain.value = g; }
  const micOn = () => !!stream;

  // YIN 音高偵測（在約 12kHz 降頻後的訊號上執行，涵蓋 35–450 Hz）
  function yin(x, n, sr) {
    const tauMin = Math.floor(sr / 450);
    const tauMax = Math.min(Math.floor(sr / 35), Math.floor(n / 2));
    const W = n - tauMax;
    const d = new Float32Array(tauMax + 1);
    for (let tau = 1; tau <= tauMax; tau++) {
      let s = 0;
      for (let j = 0; j < W; j++) { const df = x[j] - x[j + tau]; s += df * df; }
      d[tau] = s;
    }
    d[0] = 1; let run = 0;
    for (let tau = 1; tau <= tauMax; tau++) { run += d[tau]; d[tau] = run > 0 ? d[tau] * tau / run : 1; }
    const TH = 0.15;
    let tau = -1;
    for (let t = tauMin; t <= tauMax; t++) {
      if (d[t] < TH) { while (t + 1 <= tauMax && d[t + 1] < d[t]) t++; tau = t; break; }
    }
    if (tau < 0) {
      let mi = tauMin; for (let t = tauMin; t <= tauMax; t++) if (d[t] < d[mi]) mi = t;
      if (d[mi] < 0.3) tau = mi; else return { freq: 0, clarity: 0 };
    }
    let better = tau;
    if (tau > 1 && tau < tauMax) {
      const a = d[tau - 1], b = d[tau], c = d[tau + 1], den = a + c - 2 * b;
      if (den) better = tau + (a - c) / (2 * den);
    }
    return { freq: sr / better, clarity: 1 - d[tau] };
  }

  function read() {
    if (!analyser) return null;
    analyser.getFloatTimeDomainData(buf);
    const L = buf.length;
    const recent = Math.floor(ctx.sampleRate * 0.023);
    let s = 0; for (let i = L - recent; i < L; i++) s += buf[i] * buf[i];
    const rms = Math.sqrt(s / recent);
    const D = Math.max(1, Math.round(ctx.sampleRate / 12000));
    const n = Math.floor(L / D);
    if (!ds || ds.length !== n) ds = new Float32Array(n);
    for (let i = 0; i < n; i++) { let a = 0; for (let k = 0; k < D; k++) a += buf[i * D + k]; ds[i] = a / D; }
    const p = rms > 0.002 ? yin(ds, n, ctx.sampleRate / D) : { freq: 0, clarity: 0 };
    return { rms, freq: p.freq, clarity: p.clarity, t: ctx.currentTime };
  }

  // ---------- 輸出 ----------
  function out() {
    ensureCtx();
    if (!master) { master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination); }
    return master;
  }
  function track(node, stopAt) { live.push(node); node.onended = () => { live = live.filter(x => x !== node); }; node.start && node.start(stopAt[0]); node.stop && node.stop(stopAt[1]); }

  function bassNote(m, t, dur, vol = 0.45) {
    const o = out();
    const f = 440 * Math.pow(2, (m - 69) / 12);
    const end = t + Math.max(0.08, dur * 0.92);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.setTargetAtTime(vol * 0.45, t + 0.01, 0.18);
    g.gain.setTargetAtTime(0, end, 0.03);
    const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.Q.value = 2;
    flt.frequency.setValueAtTime(Math.min(4000, f * 10 + 300), t);
    flt.frequency.setTargetAtTime(f * 2.5 + 150, t + 0.01, 0.12);
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f;
    const g2 = ctx.createGain(); g2.gain.value = 0.8;
    o1.connect(flt); flt.connect(g); o2.connect(g2); g2.connect(g); g.connect(o);
    track(o1, [t, end + 0.3]); track(o2, [t, end + 0.3]);
  }

  function click(t, accent, vol = 0.6) {
    const o = out();
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = accent ? 5200 : 3400; bp.Q.value = 1.4;
    const g = ctx.createGain();
    const v = vol * (accent ? 1.0 : 0.6);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.03);
    s.connect(bp); bp.connect(g); g.connect(o);
    track(s, [t, t + 0.04]);
  }

  function stopAll() {
    live.forEach(n => { try { n.stop(0); } catch (e) { } });
    live = [];
    if (master) { try { master.disconnect(); } catch (e) { } master = null; }
  }

  window.BassAudio = {
    _yin: yin, ensureCtx, startMic, stopMic, setGain, micOn, read, bassNote, click, stopAll,
    now: () => (ctx ? ctx.currentTime : 0),
    get ctx() { return ctx; },
  };
})();
