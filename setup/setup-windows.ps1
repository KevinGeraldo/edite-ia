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

Passo '1/8 Programas (winget): Git, GitHub CLI, Node, Python 3.12, ffmpeg completo'
$pacotes = 'Git.Git','OpenJS.NodeJS','Python.Python.3.12','Gyan.FFmpeg'
foreach ($p in $pacotes) { winget install --id $p -e --accept-source-agreements --accept-package-agreements --silent | Out-Null; Write-Host "  $p ok" }
RecarregarPath

Passo '2/8 Codigo do estudio (GitHub)'
if (-not (Test-Path "$Destino\CLAUDE.md")) {
  git clone https://github.com/KevinGeraldo/edite-ia.git "$Destino"
} else { git -C "$Destino" pull }
Set-Location $Destino

Passo '3/8 Node: Playwright, Puppeteer, HyperFrames'
npm ci
npx playwright install chromium

Passo '4/8 Python (.venv com numpy, librosa, soundfile, rembg)'
if (-not (Test-Path '.venv')) { py -3.12 -m venv .venv }
.\.venv\Scripts\python -m pip install --upgrade pip | Out-Null
.\.venv\Scripts\pip install -r requirements.txt -r requirements-windows.txt

Passo '5/8 whisper.cpp (whisper-cli) e modelos small + large-v3'
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

Passo '6/8 Configuracao do Claude para o Edite IA: memorias e settings'
$cl = "$HOME\.claude"; New-Item -ItemType Directory -Force $cl | Out-Null
$proj = ((Resolve-Path $Destino).Path -replace '[^A-Za-z0-9]','-')
$mem = "$cl\projects\$proj\memory"; New-Item -ItemType Directory -Force $mem | Out-Null
Copy-Item 'claude-config\memory\*' $mem -Force
if (-not (Test-Path "$cl\settings.json")) { Copy-Item 'claude-config\settings.json' "$cl\settings.json" } else { Write-Host '  settings.json ja existe: mantido (o modelo de referencia esta em claude-config\settings.json)' }

Passo '7/8 Plugins do Claude Code'
if (Get-Command claude -ErrorAction SilentlyContinue) {
  claude plugin marketplace add anthropics/claude-plugins-official
  foreach ($p in 'superpowers@claude-plugins-official','skill-creator@claude-plugins-official','vercel@claude-plugins-official') { claude plugin install $p }
} else { Write-Host '  comando "claude" nao encontrado: instale o Claude Code e rode este passo de novo (ver setup\LEIA-ME-WINDOWS.md)' }

Passo '8/8 Conferencia'
node -v; ffmpeg -version | Select-Object -First 1; .\.venv\Scripts\python -c "import librosa, soundfile, numpy; print('python ok, librosa', librosa.__version__)"
RecarregarPath; if (Get-Command whisper-cli -ErrorAction SilentlyContinue) { Write-Host 'whisper-cli ok' } else { Write-Host 'whisper-cli: abra um terminal novo para o PATH valer' }
node tools/render.mjs templates/base/index.html --preview 1 | Out-Null; if ($LASTEXITCODE -eq 0) { Write-Host 'render.mjs ok (templates/base)' }
Write-Host "`nPronto. Abra a pasta $Destino no Claude. Os projetos (codigo + midias, 9,5 GB) vem do Google Drive: veja setup\LEIA-ME-WINDOWS.md" -ForegroundColor Green
