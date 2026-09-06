'use client';

// ============================================================
// 生成式成都氛围音景 —— Web Audio 实时合成
// 无需任何音频文件:雨声/茶馆/竹林/晨鸟/夜市/晚钟
// 全部由噪声、滤波器、随机事件合成,可无限循环
// ============================================================

type Ctx = AudioContext;
type Builder = (ctx: Ctx, out: GainNode) => () => void;

interface SceneDef {
  id: string;
  builder: Builder;
}

type Timer = ReturnType<typeof setTimeout>;

/* ---------- 噪声 buffer ---------- */
function noiseBuffer(ctx: Ctx, type: 'white' | 'pink' | 'brown', seconds = 3): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (type === 'white') {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.03;
      b1 = 0.985 * b1 + w * 0.015;
      b2 = 0.95 * b2 + w * 0.05;
      d[i] = (b0 + b1 + b2) * 0.5;
    }
  } else {
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  return buf;
}

function noiseSrc(ctx: Ctx, type: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuffer(ctx, type);
  s.loop = true;
  return s;
}

/* ---------- 随机事件循环(min/max 秒),返回取消函数 ---------- */
function every(ctx: Ctx, min: number, max: number, cb: (t: number) => void): () => void {
  let alive = true;
  let timer: Timer;
  const tick = () => {
    if (!alive) return;
    timer = setTimeout(() => {
      cb(ctx.currentTime + 0.05);
      tick();
    }, (min + Math.random() * (max - min)) * 1000);
  };
  tick();
  return () => { alive = false; clearTimeout(timer); };
}

/* ---------- 简单包络 ---------- */
function env(gain: AudioParam, t: number, peak: number, attack: number, decay: number) {
  gain.setValueAtTime(0.0001, t);
  gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

/* ---------- 收集可停止资源的小工具 ---------- */
function kit() {
  const nodes: AudioNode[] = [];
  const sources: AudioScheduledSourceNode[] = [];
  const stoppers: Array<() => void> = [];
  return {
    add<T extends AudioNode>(n: T): T { nodes.push(n); return n; },
    src<T extends AudioScheduledSourceNode>(s: T): T { sources.push(s); return s; },
    onStop(fn: () => void) { stoppers.push(fn); },
    stop() {
      stoppers.forEach(fn => { try { fn(); } catch { /* noop */ } });
      sources.forEach(s => { try { s.stop(); } catch { /* noop */ } });
      nodes.forEach(n => { try { n.disconnect(); } catch { /* noop */ } });
    },
  };
}

/* ================= 六段音景 ================= */

const SCENES: SceneDef[] = [
  {
    // 1. 盖碗茶馆:低频人声嗡嗡 + 瓷器轻碰
    id: 'teahouse',
    builder: (ctx, out) => {
      const k = kit();

      const rumble = k.src(noiseSrc(ctx, 'brown'));
      const rumbleFilter = k.add(ctx.createBiquadFilter());
      rumbleFilter.type = 'lowpass'; rumbleFilter.frequency.value = 650;
      const rumbleGain = k.add(ctx.createGain()); rumbleGain.gain.value = 0.2;
      rumble.connect(rumbleFilter).connect(rumbleGain).connect(out);
      rumble.start();

      const murmur = k.src(noiseSrc(ctx, 'brown'));
      const murmurBP = k.add(ctx.createBiquadFilter());
      murmurBP.type = 'bandpass'; murmurBP.frequency.value = 380; murmurBP.Q.value = 0.6;
      const murmurGain = k.add(ctx.createGain()); murmurGain.gain.value = 0.09;
      const lfo = k.add(ctx.createOscillator()); lfo.frequency.value = 0.13;
      const lfoGain = k.add(ctx.createGain()); lfoGain.gain.value = 0.045;
      lfo.connect(lfoGain).connect(murmurGain.gain);
      murmur.connect(murmurBP).connect(murmurGain).connect(out);
      murmur.start(); lfo.start();

      // 盖碗轻碰
      const cancel = every(ctx, 6, 18, (t) => {
        const f = 1900 + Math.random() * 2400;
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.72;
        const g = ctx.createGain(); env(g.gain, t, 0.05, 0.005, 0.14);
        const g2 = ctx.createGain(); env(g2.gain, t, 0.015, 0.005, 0.09);
        o.connect(g).connect(out); o2.connect(g2).connect(out);
        o.start(t); o2.start(t); o.stop(t + 0.3); o2.stop(t + 0.2);
      });
      k.onStop(cancel);
      return () => k.stop();
    },
  },
  {
    // 2. 雨夜锦里:白噪声雨幕 + 低频闷响
    id: 'rain',
    builder: (ctx, out) => {
      const k = kit();

      const rain = k.src(noiseSrc(ctx, 'white'));
      const bp = k.add(ctx.createBiquadFilter());
      bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 0.35;
      const g = k.add(ctx.createGain()); g.gain.value = 0.3;
      const lfo = k.add(ctx.createOscillator()); lfo.frequency.value = 0.08;
      const lg = k.add(ctx.createGain()); lg.gain.value = 0.07;
      lfo.connect(lg).connect(g.gain);
      rain.connect(bp).connect(g).connect(out);
      rain.start(); lfo.start();

      const rumble = k.src(noiseSrc(ctx, 'brown'));
      const lp = k.add(ctx.createBiquadFilter());
      lp.type = 'lowpass'; lp.frequency.value = 200;
      const rg = k.add(ctx.createGain()); rg.gain.value = 0.09;
      rumble.connect(lp).connect(rg).connect(out);
      rumble.start();

      return () => k.stop();
    },
  },
  {
    // 3. 望江竹风:缓慢扫频的风 + 竹叶沙沙
    id: 'bamboo-wind',
    builder: (ctx, out) => {
      const k = kit();

      const wind = k.src(noiseSrc(ctx, 'pink'));
      const lp = k.add(ctx.createBiquadFilter());
      lp.type = 'lowpass'; lp.frequency.value = 550;
      const wg = k.add(ctx.createGain()); wg.gain.value = 0.28;
      const lfo = k.add(ctx.createOscillator()); lfo.frequency.value = 0.05;
      const lg = k.add(ctx.createGain()); lg.gain.value = 320;
      lfo.connect(lg).connect(lp.frequency);
      wind.connect(lp).connect(wg).connect(out);
      wind.start(); lfo.start();

      // 竹叶沙沙
      const cancel = every(ctx, 2.5, 7, (t) => {
        const dur = 0.4 + Math.random() * 0.9;
        const s = ctx.createBufferSource();
        s.buffer = noiseBuffer(ctx, 'white', 2);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 3200 + Math.random() * 2600; bp.Q.value = 5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.045, t + dur * 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(bp).connect(g).connect(out);
        s.start(t); s.stop(t + dur + 0.1);
      });
      k.onStop(cancel);
      return () => k.stop();
    },
  },
  {
    // 4. 锦江晨鸟:水声底 + 鸟鸣啁啾
    id: 'river-birds',
    builder: (ctx, out) => {
      const k = kit();

      const water = k.src(noiseSrc(ctx, 'brown'));
      const lp = k.add(ctx.createBiquadFilter());
      lp.type = 'lowpass'; lp.frequency.value = 300;
      const wg = k.add(ctx.createGain()); wg.gain.value = 0.07;
      water.connect(lp).connect(wg).connect(out);
      water.start();

      const air = k.src(noiseSrc(ctx, 'pink'));
      const hp = k.add(ctx.createBiquadFilter());
      hp.type = 'highpass'; hp.frequency.value = 2200;
      const ag = k.add(ctx.createGain()); ag.gain.value = 0.02;
      air.connect(hp).connect(ag).connect(out);
      air.start();

      // 鸟鸣:2-4 声快速啁啾
      const chirp = (t: number, f: number) => {
        const o = ctx.createOscillator(); o.type = 'sine';
        const g = ctx.createGain();
        o.frequency.setValueAtTime(f, t);
        const notes = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < notes; i++) {
          const tt = t + i * 0.09;
          o.frequency.setValueAtTime(f * (1 + Math.random() * 0.25), tt);
          o.frequency.exponentialRampToValueAtTime(f * 0.8, tt + 0.06);
          env(g.gain, tt, 0.04, 0.01, 0.08);
        }
        o.connect(g).connect(out);
        o.start(t); o.stop(t + notes * 0.09 + 0.15);
      };
      const cancel = every(ctx, 1.6, 4.5, (t) => {
        chirp(t, 2400 + Math.random() * 1800);
        if (Math.random() < 0.35) chirp(t + 0.4, 2400 + Math.random() * 1800);
      });
      k.onStop(cancel);
      return () => k.stop();
    },
  },
  {
    // 5. 夜市灯火:人群低频嗡鸣 + 金属叮叮
    id: 'night-market',
    builder: (ctx, out) => {
      const k = kit();

      const crowd = k.src(noiseSrc(ctx, 'brown'));
      const bp = k.add(ctx.createBiquadFilter());
      bp.type = 'bandpass'; bp.frequency.value = 320; bp.Q.value = 0.7;
      const cg = k.add(ctx.createGain()); cg.gain.value = 0.17;
      crowd.connect(bp).connect(cg).connect(out);
      crowd.start();

      const shimmer = k.src(noiseSrc(ctx, 'white'));
      const hp = k.add(ctx.createBiquadFilter());
      hp.type = 'highpass'; hp.frequency.value = 6500;
      const sg = k.add(ctx.createGain()); sg.gain.value = 0.02;
      shimmer.connect(hp).connect(sg).connect(out);
      shimmer.start();

      // 五声音阶金属叮
      const penta = [523.25, 587.33, 659.25, 783.99, 880];
      const cancel = every(ctx, 4, 11, (t) => {
        const f = penta[Math.floor(Math.random() * penta.length)];
        [[1, 0.045, 1.6], [2.01, 0.018, 1.0], [2.74, 0.01, 0.7]].forEach(([mult, peak, dec]) => {
          const o = ctx.createOscillator(); o.type = 'sine';
          o.frequency.value = f * (mult as number) * (1 + (Math.random() - 0.5) * 0.004);
          const g = ctx.createGain(); env(g.gain, t, dec as number * 0.05 + (peak as number) * 0.4, 0.005, dec as number);
          o.connect(g).connect(out);
          o.start(t); o.stop(t + (dec as number) + 0.2);
        });
      });
      k.onStop(cancel);
      return () => k.stop();
    },
  },
  {
    // 6. 古寺晚钟:持续低鸣 drone + 周期性 FM 钟声
    id: 'temple-bell',
    builder: (ctx, out) => {
      const k = kit();

      const lp = k.add(ctx.createBiquadFilter());
      lp.type = 'lowpass'; lp.frequency.value = 500;
      const dg = k.add(ctx.createGain()); dg.gain.value = 1;
      lp.connect(dg).connect(out);
      [[110, 0.05], [110.4, 0.045], [220.2, 0.014]].forEach(([f, v]) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f as number;
        const g = ctx.createGain(); g.gain.value = v as number;
        o.connect(g).connect(lp); o.start();
        k.src(o);
      });

      const bell = (t: number) => {
        const f = 196; // G3
        const car = ctx.createOscillator(); car.type = 'sine'; car.frequency.value = f;
        const mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.value = f * 2.76;
        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(f * 1.4, t);
        modGain.gain.exponentialRampToValueAtTime(f * 0.05, t + 4);
        mod.connect(modGain).connect(car.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.11, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 8);
        car.connect(g).connect(out);
        car.start(t); mod.start(t); car.stop(t + 8.5); mod.stop(t + 8.5);
        // 敲击瞬间的噪声敲击感
        const s = ctx.createBufferSource(); s.buffer = noiseBuffer(ctx, 'white', 0.1);
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
        const ng = ctx.createGain(); env(ng.gain, t, 0.035, 0.002, 0.05);
        s.connect(hp).connect(ng).connect(out);
        s.start(t); s.stop(t + 0.1);
      };
      bell(ctx.currentTime + 0.8);
      const cancel = every(ctx, 15, 22, (t) => bell(t));
      k.onStop(cancel);
      return () => k.stop();
    },
  },
];

/* ================= 单例控制 ================= */

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let currentId: string | null = null;
let fadeTimer: Timer | null = null;
let stopCurrent: (() => void) | null = null;
const listeners = new Set<(id: string | null) => void>();

function emit() {
  listeners.forEach(fn => fn(currentId));
}

function ensureCtx(): Ctx {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function playScene(id: string) {
  if (typeof window === 'undefined') return;
  const c = ensureCtx();
  if (c.state === 'suspended') c.resume();
  stopScene();

  const def = SCENES.find(s => s.id === id);
  if (!def) return;

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(1, c.currentTime + 1.5);
  g.connect(master!);

  const stop = def.builder(c, g);
  stopCurrent = () => {
    try {
      g.gain.cancelScheduledValues(c.currentTime);
      g.gain.setTargetAtTime(0.0001, c.currentTime, 0.3);
      fadeTimer = setTimeout(() => { stop(); try { g.disconnect(); } catch { /* noop */ } }, 1000);
    } catch {
      stop();
    }
  };
  currentId = id;
  emit();
}

export function stopScene() {
  if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
  if (stopCurrent) { stopCurrent(); stopCurrent = null; }
  if (currentId) { currentId = null; emit(); }
}

export function getPlayingId(): string | null {
  return currentId;
}

export function onPlayingChange(fn: (id: string | null) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
