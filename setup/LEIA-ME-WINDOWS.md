# Edite IA no Windows (mesmo estúdio do Mac)

O estúdio do Mac vai para o Windows. Pelo GitHub (repositório **público** https://github.com/KevinGeraldo/edite-ia) vão:
- as instruções (`CLAUDE.md`);
- as bibliotecas e ferramentas (`lib/`, `tools/`, `templates/`);
- as skills do projeto (`.claude/skills/`: showreel-interface, hyperframes…);
- as memórias do projeto (como o mapa do NinjaBR Hub);
- os plugins da loja oficial (superpowers, skill-creator, vercel).

Os **projetos** (`projetos/`) não vão para o GitHub, por ter dados de clientes e de famílias. Eles vão inteiros pelo Google Drive (seção 2).

## 1. Uma vez só, no Windows

1. **Instale o Claude** (app de desktop) e entre **com a mesma conta** do Mac.
   - Os conectores vêm sozinhos: ElevenLabs, Gmail, Drive, Calendar etc.
   - Se algum pedir login de novo, conecte em claude.ai → Configurações → Conectores.
2. Abra o **PowerShell** (não precisa ser administrador) e rode:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   iwr https://raw.githubusercontent.com/KevinGeraldo/edite-ia/main/setup/setup-windows.ps1 -OutFile setup-windows.ps1
   .\setup-windows.ps1
   ```
   O script leva de 20 a 40 minutos. Ele baixa uns 4 GB, a maior parte é o modelo `large-v3` do whisper. Se quiser pular esse modelo, use `.\setup-windows.ps1 -SemModelosWhisper`. O que ele faz:
   - instala Git, Node, Python 3.12 e o ffmpeg completo;
   - clona o estúdio em `C:\Users\<você>\Edite IA`;
   - instala Playwright, Chromium, HyperFrames, librosa e o rembg (recorte de fundo no Windows);
   - instala o whisper-cli com os modelos small e large-v3;
   - copia as memórias do projeto e reinstala os plugins.
3. **NinjaBR Hub:** abra o navegador interno do Claude, entre em https://ninjabrhub.io e faça login uma vez.
4. Abra a pasta `Edite IA` no Claude.

## 2. Projetos e mídias (Google Drive)

A pasta `projetos/` (código e mídias, 9,5 GB) vai pelo Google Drive para computador:

1. Instale o **Google Drive para computador** nos dois computadores, com a mesma conta.
2. **No Mac** (peça ao Claude: "mova as mídias dos projetos para o Drive"):
   - `projetos/` vai para `Meu Drive/Edite IA - projetos/`, e fica um atalho no lugar original;
   - os renders (`out/`, `prev/`, `frames/`) podem ficar de fora, porque se refazem.
3. **No Windows**, peça ao Claude: "ligue os projetos do Drive ao estúdio". Ele cria o mesmo atalho (junction) em `Edite IA\projetos`.

## 3. No dia a dia

- **Mudou algo num computador** (CLAUDE.md, ferramentas, skill ou memória do projeto):
  - **Mac:** `setup/exportar-config-mac.sh`, depois `git add -A`, `git commit` e `git push`.
  - **Windows:** `git add -A`, `git commit` e `git push`.
  - Ou peça ao Claude: "sincroniza o estúdio".
- **No outro computador:** `git pull`. Se mudaram skills ou memórias, rode também `.\setup\setup-windows.ps1` (ele só atualiza o que falta).

## Diferenças do Windows (o Claude já sabe, está no CLAUDE.md)

| | Mac | Windows |
|---|---|---|
| Python | `.venv/bin/python` | `.venv\Scripts\python` |
| Scripts `.sh` (critica, hdr2sdr) | Terminal | **Git Bash** (vem com o Git) |
| Recorte de fundo | Vision do macOS | rembg (baixa um modelo na primeira vez) |
| HDR do iPhone → SDR | tonemap do macOS | zscale + hable (fica um pouco diferente) |
| Fontes Avenir, Palatino, Snell Roundhand | do sistema | substitutos livres em `lib/fonts/` via `lib/fonts.css` |
| Simulador de iPhone, Swift, PyObjC | sim | não existem |

Os renders de projetos antigos que usam fontes do Mac saem com as fontes substitutas no Windows. Para um render final idêntico, renderize no Mac ou inclua `lib/fonts.css` na composição.
