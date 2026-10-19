"""Mede a sincronia entre os efeitos sonoros e o que acontece na tela.

    .venv/bin/python tools/sincronia.py video.mp4 hits.json [--tol 0.04]

Para cada efeito sonoro de hits.json, procura uma mudança brusca de quadro no vídeo
(o "ataque" visual) e informa a porcentagem acertada dentro de ±tol, o desvio mediano
e a lista dos efeitos sem causa visível, com o segundo exato, para corrigir.
"""
import argparse, json, subprocess, tempfile, os
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('hits'); ap.add_argument('--tol', type=float, default=0.04)
a = ap.parse_args()
H = json.load(open(a.hits)); hits = [h['t'] for h in H['hits']] if isinstance(H, dict) else H

w = 90
info = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', a.video], capture_output=True, text=True).stdout.strip().split('\n')[0].split(',')
h = int(round(int(info[1]) * w / int(info[0]) / 2) * 2)
with tempfile.TemporaryDirectory() as d:
    raw = os.path.join(d, 'v.raw')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', a.video, '-vf', f'fps=60,scale={w}:{h},format=gray', '-f', 'rawvideo', raw], check=True)
    v = np.fromfile(raw, np.uint8)
n = v.size // (w * h); f = v[:n * w * h].reshape(n, h, w).astype(np.float32)
gh, gw = f.shape[1] // 6, f.shape[2] // 6
dfr = np.abs(np.diff(f, axis=0))[:, :gh * 6, :gw * 6].reshape(-1, 6, gh, 6, gw).mean(axis=(2, 4))  # mudança por região
dd = np.sort(dfr.reshape(len(dfr), -1), axis=1)[:, -3:].mean(axis=1)                              # as 3 regiões que mais mudaram
acc = np.maximum(0, dd[1:] - dd[:-1])
thr = np.percentile(acc, 85)
ev = np.array([(i + 1) / 60 for i in range(1, len(acc) - 1) if acc[i] > thr and acc[i] >= acc[i - 1] and acc[i] >= acc[i + 1]])

ok, offs, miss = 0, [], []
for t in hits:
    j = np.argmin(np.abs(ev - t)); o = ev[j] - t; offs.append(abs(o) * 1000)
    if abs(o) <= a.tol: ok += 1
    else: miss.append((t, o * 1000))
print(f'{ok}/{len(hits)} efeitos com mudança na tela em ±{a.tol*1000:.0f} ms ({100*ok/max(1,len(hits)):.0f}%) · desvio mediano {np.median(offs):.0f} ms')
for t, o in miss: print(f'  sem causa visível: {t:6.2f}s (evento visual mais próximo a {o:+.0f} ms)')
