"""Mede o ritmo de um áudio (música ou vídeo) e grava um beats.json.

    .venv/bin/python tools/beats.py trilha.wav > projetos/x/beats.json
    .venv/bin/python tools/beats.py video.MOV --start 12 --end 60 > beats.json

Campos: bpm, beats (mudanças de estado), downbeats (momentos grandes),
hits (picos para efeitos sonoros), claps (transientes agudos: palmas, batidas),
energy (volume a cada 0,1 s, 0-1) e sections (trechos de energia parecida).
Os tempos são em segundos do arquivo original.
"""
import argparse, json, subprocess, sys, tempfile, os
import numpy as np, librosa

ap = argparse.ArgumentParser()
ap.add_argument('arquivo'); ap.add_argument('--start', type=float, default=0); ap.add_argument('--end', type=float)
a = ap.parse_args()

src = a.arquivo
if not src.lower().endswith(('.wav', '.flac', '.mp3', '.ogg', '.m4a', '.aac')):  # vídeo: extrai o áudio
    tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False).name
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-vn', '-ac', '1', '-ar', '22050', tmp], check=True)
    src = tmp
y, sr = librosa.load(src, sr=22050, mono=True, offset=a.start, duration=(a.end - a.start) if a.end else None)
off = a.start
r = lambda xs: [round(float(x) + off, 3) for x in xs]

tempo, frames = librosa.beat.beat_track(y=y, sr=sr, units='frames')
beats = librosa.frames_to_time(frames, sr=sr)
onset = librosa.onset.onset_strength(y=y, sr=sr)
peaks = librosa.util.peak_pick(onset, pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.5, wait=10)

# palmas e transientes agudos: onset só da banda alta
yh = librosa.effects.preemphasis(y, coef=0.97)
S = np.abs(librosa.stft(yh))
freqs = librosa.fft_frequencies(sr=sr)
oh = librosa.onset.onset_strength(S=librosa.amplitude_to_db(S[freqs > 2500]), sr=sr)
claps = librosa.onset.onset_detect(onset_envelope=oh, sr=sr, units='time', backtrack=False, delta=0.25, wait=4)

# energia a cada 0,1 s e trechos (mudanças grandes de energia/timbre)
hop = int(sr * 0.1)
rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]
energy = (rms / (rms.max() + 1e-9)).round(3)
mf = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, hop_length=hop)
k = max(2, min(10, int(len(y) / sr / 8)))
bounds = librosa.segment.agglomerative(np.vstack([mf, rms[None, :mf.shape[1]] * 50]), k)
btimes = librosa.frames_to_time(bounds, sr=sr, hop_length=hop).tolist() + [len(y) / sr]
sections = [{'start': round(btimes[i] + off, 2), 'end': round(btimes[i + 1] + off, 2),
             'energy': round(float(energy[int(btimes[i] / 0.1):max(int(btimes[i] / 0.1) + 1, int(btimes[i + 1] / 0.1))].mean()), 3)}
            for i in range(len(btimes) - 1)]

json.dump({
    'bpm': round(float(np.atleast_1d(tempo)[0]), 2),
    'beats': r(beats), 'downbeats': r(beats[::4]),
    'hits': r(librosa.frames_to_time(peaks, sr=sr)), 'claps': r(claps),
    'energy_step': 0.1, 'energy_start': off, 'energy': energy.tolist(),
    'sections': sections,
}, sys.stdout, indent=1)
if src != a.arquivo: os.unlink(src)
