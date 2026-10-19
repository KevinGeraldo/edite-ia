#!/bin/bash
# Copia para claude-config/ a parte da configuração do Claude Code que é do Edite IA (vai para o GitHub PÚBLICO):
# memórias do projeto, permissões/modelo e plugins da loja oficial. Skills e comandos pessoais NÃO vão.
# Rode antes de cada commit em que mudou skill, comando ou memória:   setup/exportar-config-mac.sh
set -euo pipefail
cd "$(dirname "$0")/.."
D=claude-config; rm -rf "$D"; mkdir -p "$D/memory"
cp "$HOME"/.claude/projects/-Users-kevingeraldo-Edite-IA/memory/*.md "$D/memory/" 2>/dev/null || true
python3 - "$D" <<'PY'
import json, os, sys
d = sys.argv[1]; h = os.path.expanduser('~/.claude')
s = json.load(open(f'{h}/settings.json'))
# hooks do Orca e caminhos do Mac ficam de fora; leva só permissões, modelo e plugins
out = {k: s[k] for k in ('permissions', 'model') if k in s}
out['enabledPlugins'] = {k: v for k, v in s.get('enabledPlugins', {}).items() if k.endswith('@claude-plugins-official')}
json.dump(out, open(f'{d}/settings.json', 'w'), indent=2, ensure_ascii=False)
ip = json.load(open(f'{h}/plugins/installed_plugins.json')); km = json.load(open(f'{h}/plugins/known_marketplaces.json'))
with open(f'{d}/plugins.txt', 'w') as f:
    f.write('marketplace claude-plugins-official anthropics/claude-plugins-official\n')
    for p in (ip.get('plugins', ip)).keys():
        if p.endswith('@claude-plugins-official'): f.write(f'plugin {p}\n')
PY
echo "claude-config/ atualizado (memórias: $(ls "$D/memory" | tr '\n' ' '))"
