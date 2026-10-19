#!/bin/bash
# Gera as imagens do ciclo de crítica de um vídeo renderizado.
#   tools/critica.sh projetos/x/out/final.mp4 [tempo_da_acao_rapida]
# Saída ao lado do vídeo: contact.png (2 quadros/s), phone.png (como fica a 360 px),
# strip.png (12 quadros seguidos em volta de uma ação rápida) e info.txt.
set -euo pipefail
PY=$(command -v python3 || command -v python)   # no Windows (Git Bash) o executável é "python"
V="$1"; T="${2:-}"; D="$(dirname "$V")"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$V" | head -1 | cut -d, -f1)
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$V" | head -1 | cut -d, -f1)
COLS=6; [ "$W" -gt "$H" ] && COLS=4
ROWS=$("$PY" -c "import math;print(max(1,math.ceil(float('$DUR')*2/$COLS)))")
ffmpeg -loglevel error -y -i "$V" -vf "fps=2,scale=270:-1,tile=${COLS}x${ROWS}:padding=4:color=white" -frames:v 1 "$D/contact.png"
ffmpeg -loglevel error -y -i "$V" -vf "fps=1,scale=360:-1,tile=5x3:padding=4:color=white" -frames:v 1 "$D/phone.png"
if [ -n "$T" ]; then
  ffmpeg -loglevel error -y -ss "$("$PY" -c "print(max(0,$T-0.1))")" -i "$V" -vf "scale=320:-1,tile=12x1" -frames:v 1 "$D/strip.png"
fi
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact "$V" > "$D/info.txt"
ffmpeg -hide_banner -i "$V" -af ebur128=framelog=quiet -f null - 2>&1 | grep -E "^\s+I:" | head -1 >> "$D/info.txt" || true
echo "$D/contact.png  $D/phone.png  ${T:+$D/strip.png}  $D/info.txt"
