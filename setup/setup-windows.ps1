# Edite IA - instalacao completa no Windows 10/11
# Rode no PowerShell (como usuario normal):
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#   iwr https://raw.githubusercontent.com/KevinGeraldo/edite-ia/main/setup/setup-windows.ps1 -OutFile setup-windows.ps1   (repositorio publico)
#   .\setup-windows.ps1
# Ou, se a pasta ja foi clonada:   .\setup\setup-windows.ps1
param([string]$Destino = "$HOME\Edite IA", [switch]$SemModelosWhisper)
$ErrorActionPreference = 'Stop'
function Passo($m) { Write-Host "`n==> $m" -ForegroundColor Yellow }
function RecarregarPath { $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User') }

Passo '1/7 Programas (winget): Git, Node, Python 3.12, ffmpeg completo'
$pacotes = 'Git.Git','OpenJS.NodeJS','Python.Python.3.12','Gyan.FFmpeg'
foreach ($p in $pacotes) { winget install --id $p -e --accept-source-agreements --accept-package-agreements --silent | Out-Null; Write-Host "  $p ok" }
RecarregarPath

Passo '2/7 Codigo do estudio (GitHub)'
if (-not (Test-Path "$Destino\CLAUDE.md")) {
  git clone https://github.com/KevinGeraldo/edite-ia.git "$Destino"
} else { git -C "$Destino" pull }
Set-Location $Destino

Passo '3/7 Node: Playwright, Puppeteer, HyperFrames'
npm ci
npx playwright install chromium

Passo '4/7 Python (.venv com numpy, librosa, soundfile, rembg)'
if (-not (Test-Path '.venv')) { py -3.12 -m venv .venv }
.\.venv\Scripts\python -m pip install --upgrade pip | Out-Null
.\.venv\Scripts\pip install -r requirements.txt -r requirements-windows.txt

Passo '5/7 whisper.cpp (whisper-cli) e modelos small + large-v3'
$wdir = "$HOME\.local\whisper"; New-Item -ItemType Directory -Force $wdir | Out-Null
$rel = Invoke-RestMethod https://api.github.com/repos/ggml-org/whisper.cpp/releases/latest
$zip = $rel.assets | Where-Object { $_.name -match '^whisper-bin-x64\.zip$' } | Select-Object -First 1
Invoke-WebRequest $zip.browser_download_url -OutFile "$env:TEMP\whisper.zip"
Expand-Archive "$env:TEMP\whisper.zip" -DestinationPath $wdir -Force
$bin = (Get-ChildItem $wdir -Recurse -Filter 'whisper-cli.exe' | Select-Object -First 1).DirectoryName
$userPath = [Environment]::GetEnvironmentVariable('Path','User'); if ($userPath -notlike "*$bin*") { [Environment]::SetEnvironmentVariable('Path', "$userPath;$bin", 'User') }
$mdir = "$HOME\.cache\whisper"; New-Item -ItemType Directory -Force $mdir | Out-Null
$modelos = @('ggml-small.bin'); if (-not $SemModelosWhisper) { $modelos += 'ggml-large-v3.bin' }
foreach ($m in $modelos) { if (-not (Test-Path "$mdir\$m")) { Write-Host "  baixando $m ..."; Invoke-WebRequest "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/$m" -OutFile "$mdir\$m" } }

Passo '6/7 Perfil desta maquina para o Claude (CLAUDE.local.md)'
New-Item -ItemType Directory -Force 'projetos' | Out-Null
if (-not (Test-Path 'CLAUDE.local.md')) {
@'
# Quem usa este computador

Este computador NAO e o do Kevin. Quem usa o estudio aqui e a sogra dele, para editar os videos da familia dela.
Valem todas as regras de qualidade do CLAUDE.md (formato perguntado antes, voz e musica, crítica dos quadros, sem chiado),
mas leia "o Kevin" como "a usuaria" e adapte:

- Fale em portugues simples, sem jargao tecnico. Explique o que vai fazer em uma ou duas frases antes de comecar e mostre o resultado no fim.
- Os trabalhos aqui sao quase sempre caseiros (aniversarios, viagens, netos, festas): siga a parte "No caseiro" do CLAUDE.md. As pessoas sao o centro.
- Ela entrega os videos e fotos de onde estiverem (Downloads, Area de Trabalho, pendrive). Copie para projetos\<nome-do-trabalho>\ e nunca apague nem altere o original.
- Entregue o video final na Area de Trabalho, com nome claro, e sempre ofereca a versao leve para WhatsApp.
- Nao use o NinjaBR Hub nem a ElevenLabs do Kevin (sao da conta dele). Use as ferramentas locais (ffmpeg, canvas, whisper). Se ela tiver os proprios conectores e quiser usar algo que gaste creditos, avise o custo e espere o ok.
- Este computador e Windows: use .venv\Scripts\python e rode os scripts .sh pelo Git Bash (ver a secao "Dois computadores" do CLAUDE.md).
- Ignore as secoes sobre GitHub, sincronizacao e o Historico de projetos do Kevin.
'@ | Out-File -Encoding utf8 'CLAUDE.local.md'
}

Passo '7/7 Conferencia'
node -v; ffmpeg -version | Select-Object -First 1; .\.venv\Scripts\python -c "import librosa, soundfile, numpy; print('python ok, librosa', librosa.__version__)"
RecarregarPath; if (Get-Command whisper-cli -ErrorAction SilentlyContinue) { Write-Host 'whisper-cli ok' } else { Write-Host 'whisper-cli: abra um terminal novo para o PATH valer' }
node tools/render.mjs templates/base/index.html --preview 1 | Out-Null; if ($LASTEXITCODE -eq 0) { Write-Host 'render.mjs ok (templates/base)' }
Write-Host "`nPronto. Abra a pasta $Destino no Claude (aba Code) e peca, por exemplo: 'edite o video do aniversario que esta em Downloads'." -ForegroundColor Green
