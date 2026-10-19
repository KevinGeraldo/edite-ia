// Movimento determinístico: tudo é função pura do tempo, então seek(t) pode
// desenhar qualquer quadro sem simular os anteriores.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const mix = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

// Easings clássicos (para câmera e transições; para UI e tipografia prefira spring)
export const ease = {
  inOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  out: x => 1 - Math.pow(1 - x, 3),
  in: x => x * x * x,
  sine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  expoOut: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
};

// Mola amortecida em forma fechada, 0 → 1.
export function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k), z = d / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

// Presets: rápido (botões, bordas), padrão (cards, câmera), pesado (tipografia
// grande, logos), brincalhão (mascotes, adesivos; overshoot visível).
export const SPRING = {
  snappy: [320, 30], base: [170, 26], heavy: [90, 22], playful: [220, 14],
};
export const sp = (t, preset = 'base') => spring(t, ...SPRING[preset]);

// Valor com vários alvos: soma de uma mola por mudança. keys: [[tempo, valor], ...]
export function track(t, keys, k = 170, d = 26) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
  return v;
}

// Indicador que estica: borda da frente mais rígida que a de trás.
export function indicator(t, stops, width = 120) {
  const lead = track(t, stops, 320, 30), trail = track(t, stops, 140, 22);
  return { left: Math.min(lead, trail), right: Math.max(lead, trail) + width };
}

// Texto dentro de um container que muda: entra depois do morph, sai antes do próximo.
export const swapAlpha = (t, tIn, tOut) => Math.min(clamp((t - tIn - 0.08) / 0.12), clamp((tOut - 0.1 - t) / 0.1));

// Keyframes com easing: keys [[t, ...valores]]. Útil para câmera.
export function keyframes(t, keys, fn = ease.inOut) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const a = keys[i - 1], b = keys[i];
    return mix(a.slice(1), b.slice(1), fn((t - a[0]) / (b[0] - a[0])));
  }
  return keys[keys.length - 1].slice(1);
}

// Ruído semeado (nunca Math.random): o render sai idêntico toda vez.
export function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Ruído suave 1D (para tremor de câmera "na mão", respiração, flutuação).
export function noise1(x, seed = 1) {
  const h = i => { const r = rng(seed * 7919 + i * 104729); return r() * 2 - 1; };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u);
}

// Pulso nas batidas (beats.json): soma de decaimentos exponenciais.
export function beatPulse(t, times, amp = 1, decay = 0.12) {
  let p = 0;
  for (const b of times) { const d = t - b; if (d >= 0 && d < decay * 5) p += amp * Math.exp(-d / decay); }
  return p;
}

export const loopT = (t, dur) => ((t % dur) + dur) % dur;
