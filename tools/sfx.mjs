// Efeitos sonoros sintetizados em código, posicionados por uma lista de cues.
//
//   node tools/sfx.mjs projetos/x/cues.json projetos/x/sfx.wav [--dur 12]
//   cues.json: [{"t": 0.5, "type": "pop", "gain": 1}, {"t": 2, "type": "whoosh", "len": 0.5}]
//
// Tipos: click, tick, pop, thump, boom, whoosh, swish, riser, chime, sparkle, shutter.
// Saída: WAV 48 kHz estéreo 16-bit. "pan" (-1..1) por cue é opcional.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , cuesFile, outFile, ...rest] = process.argv;
if (!cuesFile || !outFile) { console.error('uso: node tools/sfx.mjs cues.json saida.wav [--dur s]'); process.exit(1); }
const cues = JSON.parse(readFileSync(cuesFile, 'utf8'));
const SR = 48000, di = rest.indexOf('--dur');
const DUR = di >= 0 ? +rest[di + 1] : Math.max(...cues.map(c => c.t)) + 3;
const L = new Float32Array(Math.ceil(DUR * SR)), R = new Float32Array(L.length);

let seed = 42; const noise = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2147483648 - 1;
const TAU = Math.PI * 2;
// filtro passa-banda simples (estado por voz)
function bp() { let lp = 0, bpv = 0; return (x, f, q = 0.7) => { const a = 2 * Math.sin(Math.PI * f / SR); lp += a * bpv; const hp = x - lp - q * bpv; bpv += a * hp; return bpv; }; }

const VOICES = {
  click: { len: 0.04, fn: t => Math.sin(TAU * 2200 * t) * Math.exp(-t * 140) * 0.45 },
  tick: { len: 0.03, fn: t => (noise() * 0.5 + Math.sin(TAU * 3800 * t)) * Math.exp(-t * 260) * 0.3 },
  pop: { len: 0.16, fn: t => Math.sin(TAU * (500 * t + 600 * t * t)) * Math.exp(-t * 28) * 0.42 },
  thump: { len: 0.5, fn: t => Math.sin(TAU * (95 * t - 55 * t * t)) * Math.exp(-t * 9) * 0.9 },
  boom: { len: 1.4, fn: t => (Math.sin(TAU * (60 * t - 18 * t * t)) * 0.9 + noise() * 0.15 * Math.exp(-t * 12)) * Math.exp(-t * 3.2) },
  whoosh: { len: 0.5, make: len => { const f = bp(); return t => { const p = t / len; return f(noise(), 300 + 3500 * Math.sin(Math.PI * p) ** 2, 0.5) * Math.sin(Math.PI * p) ** 1.5 * 0.55; }; } },
  swish: { len: 0.25, make: len => { const f = bp(); return t => { const p = t / len; return f(noise(), 6000 - 4000 * p, 0.6) * Math.sin(Math.PI * p) * 0.35; }; } },
  riser: { len: 1.5, make: len => { const f = bp(); return t => { const p = t / len; return (f(noise(), 200 + 5000 * p * p, 0.4) * 0.5 + Math.sin(TAU * (200 * t + 400 * t * t / len)) * 0.12) * p ** 2 * (1 - Math.max(0, p - 0.95) * 20); }; } },
  chime: { len: 1.6, fn: t => [1, 2.76, 5.4].reduce((s, h, i) => s + Math.sin(TAU * 1046 * h * t) * Math.exp(-t * (3 + i * 3)) / (i + 1), 0) * 0.22 },
  sparkle: { len: 0.9, fn: t => { let s = 0; for (let i = 0; i < 6; i++) { const ti = t - i * 0.07; if (ti > 0) s += Math.sin(TAU * (1800 + i * 420) * ti) * Math.exp(-ti * 18); } return s * 0.1; } },
  shutter: { len: 0.12, fn: t => noise() * (Math.exp(-t * 90) + (t > 0.06 ? Math.exp(-(t - 0.06) * 120) : 0)) * 0.35 },
};

for (const c of cues) {
  const v = VOICES[c.type]; if (!v) { console.error('tipo desconhecido:', c.type); continue; }
  const len = c.len || v.len, fn = v.make ? v.make(len) : v.fn, g = c.gain ?? 1, pan = c.pan ?? 0;
  const gl = g * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2, gr = g * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
  const s0 = Math.floor(c.t * SR), fade = Math.floor(0.004 * SR), n = Math.floor(len * SR);
  for (let i = 0; i < n && s0 + i < L.length; i++) {
    if (s0 + i < 0) continue;
    const env = Math.min(1, i / fade, (n - i) / fade), x = fn(i / SR) * env;
    L[s0 + i] += x * gl; R[s0 + i] += x * gr;
  }
}
// limitador suave
const sat = x => Math.tanh(x * 1.1) / Math.tanh(1.1);
const b = Buffer.alloc(44 + L.length * 4);
b.write('RIFF', 0); b.writeUInt32LE(36 + L.length * 4, 4); b.write('WAVEfmt ', 8);
b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24);
b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(L.length * 4, 40);
for (let i = 0; i < L.length; i++) {
  b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sat(L[i]))) * 32767), 44 + i * 4);
  b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sat(R[i]))) * 32767), 46 + i * 4);
}
writeFileSync(outFile, b);
console.log(outFile, `${DUR.toFixed(1)}s, ${cues.length} cues`);
