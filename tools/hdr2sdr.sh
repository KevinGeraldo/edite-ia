#!/bin/bash
# Converte vídeo de iPhone (HEVC HLG/Dolby Vision) para SDR bt709: tonemap do macOS no Mac, zscale/hable no Windows (Git Bash).
#   tools/hdr2sdr.sh ~/Downloads/IMG_1234.MOV projetos/x/sdr.mov [largura altura]
# Detecta se o vídeo é vertical e mantém a orientação.
set -euo pipefail
IN="$1"; OUT="$2"
read -r SW SH <<<"$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=' ' "$IN")"
W="${3:-$SW}"; H="${4:-$SH}"
TRC=$(ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of csv=p=0 "$IN")
mkdir -p "$(dirname "$OUT")"
if [[ ( "$TRC" == "arib-std-b67" || "$TRC" == "smpte2084" ) && "$(uname)" != "Darwin" ]]; then
  # Windows/Linux: sem VideoToolbox. Tonemap pelo zscale (ffmpeg "full" do gyan.dev). Fica um pouco diferente do tonemap do macOS.
  ffmpeg -loglevel error -y -i "$IN" -map 0:v:0 -map 0:a:0? \
    -vf "zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,scale=$W:$H,format=yuv420p" \
    -c:v libx264 -crf 12 -preset fast -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a pcm_s16le "$OUT"
elif [[ "$TRC" == "arib-std-b67" || "$TRC" == "smpte2084" ]]; then
  ffmpeg -loglevel error -y -hwaccel videotoolbox -hwaccel_output_format videotoolbox_vld -i "$IN" -map 0:v:0 -map 0:a:0? \
    -vf "scale_vt=w=$W:h=$H:color_matrix=bt709:color_primaries=bt709:color_transfer=bt709,hwdownload,format=p010le,format=yuv420p" \
    -c:v libx264 -crf 12 -preset fast -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a pcm_s16le "$OUT"
else
  ffmpeg -loglevel error -y -i "$IN" -map 0:v:0 -map 0:a:0? -vf "scale=$W:$H,format=yuv420p" -c:v libx264 -crf 12 -preset fast -c:a pcm_s16le "$OUT"
fi
echo "$OUT ($TRC → bt709, ${W}x${H})"
