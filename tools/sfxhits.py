"""Encontra os efeitos sonoros (cliques, pops, whooshes) dentro de um áudio já mixado
(voz + trilha + efeitos), para a animação ser cronometrada neles.

    .venv/bin/python tools/sfxhits.py audio.wav > hits.json
    .venv/bin/python tools/sfxhits.py audio.wav --ref referencia.mp4 > hits.json

Sem --ref: candidatos = ataques da parte percussiva acima de 2 kHz, filtrados para não pegar
sílabas da voz (o "s", o "ch"): o ataque precisa ser bem mais forte que o ruído agudo ao redor.
Com --ref (o vídeo original de onde o áudio saiu): só fica o candidato que tem uma mudança
brusca na tela da referência em ±50 ms. É a forma mais confiável, porque quem editou a
referência colocou cada efeito num evento visual.

Saída: {"hits": [{"t": 3.02, "kind": "pop|click|whoosh", "strength": 0..1, "ref": true}], ...}
"""
import argparse, json, subprocess, sys, tempfile, os
import numpy as np, librosa

ap = argparse.ArgumentParser()
ap.add_argument('audio'); ap.add_argument('--ref'); ap.add_argument('--tol', type=float, default=0.05)
a = ap.parse_args()

y, sr = librosa.load(a.audio, sr=22050, mono=True)
_, yp = librosa.effects.hpss(y, margin=3.0)                      # só a parte percussiva
S = np.abs(librosa.stft(yp, hop_length=256)); fr = librosa.fft_frequencies(sr=sr)
hi = librosa.amplitude_to_db(S[fr > 2000], ref=np.max)
env = librosa.onset.onset_strength(S=hi, sr=sr, hop_length=256)
fps = sr / 256
on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=256, units='frames', delta=0.25, wait=4, backtrack=False)

# energia aguda total (para classificar e medir o destaque do ataque)
Sh = np.abs(librosa.stft(y, hop_length=256)); band = Sh[fr > 2000].mean(axis=0)
cands = []
for f in on:
    lo, hi_ = max(0, f - int(.25 * fps)), min(len(env), f + int(.25 * fps))
    local = np.median(env[lo:hi_]) + 1e-6
    prom = env[f] / local                                              # destaque sobre o entorno
    # duração do som agudo depois do ataque → clique curto x whoosh longo
    b0 = band[f]; k = f
    while k < len(band) - 1 and band[k] > b0 * 0.35 and (k - f) < fps * 0.8: k += 1
    dur = (k - f) / fps
    # whoosh: energia sobe antes do ataque (pré-subida)
    pre = band[max(0, f - int(.2 * fps)):f]; rise = (pre[-1] / (pre[0] + 1e-9)) if len(pre) > 2 else 1
    kind = 'whoosh' if (dur > .22 or rise > 3) else ('click' if dur < .06 else 'pop')
    cands.append({'t': round(f / fps, 3), 'kind': kind, 'prom': float(prom), 'dur': round(dur, 3)})

def vis_events(path):
    w = 90
    with tempfile.TemporaryDirectory() as d:
        raw = os.path.join(d, 'v.raw')
        info = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip().split('\n')[0].split(',')
        h = int(round(int(info[1]) * w / int(info[0]) / 2) * 2)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-vf', f'fps=60,scale={w}:{h},format=gray', '-f', 'rawvideo', raw], check=True)
        v = np.fromfile(raw, np.uint8)
    n = v.size // (w * h); f = v[:n * w * h].reshape(n, h, w).astype(np.float32)
    gh, gw = f.shape[1] // 6, f.shape[2] // 6
    dfr = np.abs(np.diff(f, axis=0))[:, :gh * 6, :gw * 6].reshape(-1, 6, gh, 6, gw).mean(axis=(2, 4))  # mudança por região
    dd = np.sort(dfr.reshape(len(dfr), -1), axis=1)[:, -3:].mean(axis=1)                              # as 3 regiões que mais mudaram
    acc = np.maximum(0, dd[1:] - dd[:-1]); thr = np.percentile(acc, 85)
    return np.array([(i + 1) / 60 for i in range(1, len(acc) - 1) if acc[i] > thr and acc[i] >= acc[i - 1] and acc[i] >= acc[i + 1]])

if a.ref:
    ve = vis_events(a.ref)
    hits = [dict(c, ref=True) for c in cands if ve.size and np.min(np.abs(ve - c['t'])) <= a.tol]
else:
    hits = [dict(c, ref=False) for c in cands if c['prom'] > 3.0]
mx = max([h['prom'] for h in hits] + [1])
for h in hits: h['strength'] = round(min(1, h.pop('prom') / mx), 3)
json.dump({'source': os.path.basename(a.audio), 'ref': bool(a.ref), 'n': len(hits), 'hits': hits}, sys.stdout, indent=1)
