# Edite IA

Estúdio de edição de vídeo e motion graphics feito em código. Animação desenhada em `<canvas>` como função do tempo, renderizada quadro a quadro num navegador headless e finalizada com ffmpeg. Sem After Effects, sem Premiere.

O Kevin escreve em português e espera respostas em português. Aqui entram dois tipos de trabalho, e os dois merecem capricho:

- **Caseiro:** aniversário, viagem, momentos da família. O vídeo é deles: o que importa são as pessoas e o momento.
- **Profissional:** produto, marca, lançamento, anúncio, explicativo. O vídeo precisa vender uma ideia em poucos segundos.

O prompt é uns 10% do resultado. O resto vem do processo: referência, ritmo medido, som e, principalmente, **olhar os próprios quadros e corrigir antes de entregar**.

## Antes de começar

**Regra fixa: antes de começar qualquer vídeo novo, pergunte ao Kevin o formato e a resolução** e espere a resposta. Não deduza pelo material nem pelas referências. Opções comuns:

| Formato | Resolução | Uso |
|---|---|---|
| 9:16 | 1080×1920 | Reels, Stories, TikTok (tela cheia) |
| 4:5 | 1080×1350 | Feed do Instagram/Facebook e anúncios no feed |
| 1:1 | 1080×1080 | Feed quadrado |
| 2:3 | 1080×1620 | Pinterest, alguns feeds |
| 16:9 | 1920×1080 | YouTube, telas, apresentações |

Se ele pedir mais de um formato, monte o layout parametrizado (como `const FMT` em `projetos/anuncio-v2/index.html`) e re-enquadre cada formato, em vez de cortar.

Descubra também (ou deduza do material e diga o que deduziu):
- **Para quem é e onde vai passar:** WhatsApp da família, Reels, YouTube, apresentação.
- **Tom:** emoção, humor, energia, elegância.
- **Referência:** um vídeo, um quadro, uma marca ou "algo como X". Nomear um estilo funciona melhor do que descrevê-lo.
- **Música:** um arquivo dele, o som original do vídeo ou trilha sintetizada.

Num vídeo caseiro, não trave o trabalho com perguntas: analise o material e decida com bom senso. Num profissional, mostre o roteiro de cenas antes de animar.

## Estrutura

```
lib/motion.js          molas, easings, keyframes, ruído semeado, pulso de batida
tools/render.mjs       página com window.seek(t) → MP4 (paralelo, motion blur, áudio)
tools/beats.py         áudio/vídeo → beats.json (bpm, batidas, palmas, energia, trechos)
tools/sfx.mjs          cues.json → efeitos sonoros sintetizados (WAV estéreo)
tools/critica.sh       vídeo → contact.png, phone.png, strip.png, loudness
tools/hdr2sdr.sh       vídeo HDR do iPhone → SDR bt709 com o tonemap do macOS
tools/recorte.py       remove o fundo de quadros (Vision do macOS, sem modelo para baixar) → PNG só com o sujeito
tools/sfxhits.py       acha os efeitos sonoros dentro de um áudio já mixado → hits.json (--ref video.mp4 confirma pela referência)
tools/sincronia.py     nota de sincronia: % dos efeitos com mudança na tela em ±40 ms + lista dos que falharam
templates/base/        ponto de partida de motion do zero (seek(t) + lib/motion.js)
templates/motion-grafico/  exemplo: app de delivery (10s, 9:16)
templates/edicao-video/    exemplo: aniversário da Laís (vídeo real + overlays)
projetos/<nome>/       um diretório por trabalho; copie o template, não edite o original
```

Python com `numpy`, `librosa` e `soundfile` fica em `.venv/`: rode sempre `.venv/bin/python`. Os templates de exemplo usam `puppeteer-core` com o Chrome do sistema. Projetos novos usam `tools/render.mjs` (Playwright).

## Comandos

```bash
node tools/render.mjs projetos/x/index.html --preview 0.5,2,4.2          # PNGs para olhar
node tools/render.mjs projetos/x/index.html --dur 15 --sub 4 --audio projetos/x/mix.wav
#   --w 1920 --h 1080 (16:9) · --fps 60 · --workers 6 · --jpg (longos) · --from/--to (só um trecho) · --dom (cenas HTML/CSS)
.venv/bin/python tools/beats.py musica.wav > projetos/x/beats.json       # aceita vídeo também; --start/--end
node tools/sfx.mjs projetos/x/cues.json projetos/x/sfx.wav --dur 15
tools/critica.sh projetos/x/out/final.mp4 4.2                            # 4.2 = segundo de uma ação rápida
tools/hdr2sdr.sh ~/Downloads/IMG_0000.MOV projetos/x/sdr.mov
```

## Contrato de render

- Cada vídeo é uma função pura do tempo: `window.seek(t)` desenha o quadro `t` (pode ser async).
- Em modo render: nada de transição CSS, `setTimeout`, `requestAnimationFrame` ou estado guardado entre quadros. A prévia ao vivo só roda quando `!navigator.webdriver`.
- Aleatoriedade sempre semeada (`rng(seed)` de `lib/motion.js`), nunca `Math.random`: o render sai idêntico toda vez e uma correção vira uma linha mais um re-render.
- Fontes e imagens carregadas antes do primeiro quadro (`window.ready`).
- Movimento rápido pede `--sub 4` (motion blur por subquadros). Se ainda aparecerem cópias "em degraus" num movimento muito rápido, suba os subquadros só naquele trecho, nunca atravessando um corte.

## Direção de arte

**O inimigo é o vídeo genérico:** título centralizado num degradê, tudo entrando com fade, partículas sem motivo, rótulos nos cantos, brilho em botão. Isso não é proibido, mas é o piloto automático. Use só quando for uma escolha.

- **Tipografia:** uma fonte de destaque e uma de leitura. Texto entra com intenção (por palavra, por letra, empurrado pela câmera, escrito à mão), não só com fade.
- **Cor:** uma cor de acento por padrão. Em vídeo caseiro, a cor vem do tema da festa ou do momento (o rosa da Laís), não de uma paleta pronta.
- **Movimento:** molas (`sp`, `track`) em interface e tipografia, com overshoot leve em UI e nenhum em tipografia grande. Easing (`keyframes`) em câmera. Valor com vários alvos usa `track()`, nunca reinicia a animação.
- **Ritmo:** algo novo a cada 2 a 4 segundos. Mudanças importantes caem nas batidas medidas; momentos grandes caem nos tempos fortes.
- **Câmera:** é o que faz parecer filmado e não montado. Aproximações lentas, punch-in nos momentos-chave, um leve tremor de mão (`noise1`) e um pulso nas batidas.
- **Gancho:** nos primeiros 2 segundos tem que acontecer algo que segure o olhar.

**No caseiro:**
- As pessoas são o centro. Gráfico não pode cobrir rostos nem competir com o momento.
- Legenda e efeito servem à emoção: confete no sopro da vela faz sentido, confete aleatório não.
- Preserve o áudio real (risadas, canto, falas) e use o ritmo dele, mesmo imperfeito.
- Corte o tempo morto com transições que escondam o pulo.

**No profissional:**
- Use a interface, o logo, as cores e as fontes reais do produto. Capture o site com Playwright e salve em `projetos/x/assets/`. Nunca invente tela de produto.
- Uma mensagem por cena. Um número que prove o valor. CTA claro no final.
- Antes de animar, escreva `docs/style_guide.md` (paleta, tipografia, ritmo, transições), a partir da referência, e `docs/shotlist.md` (cena por cena, no grid de batidas). Pegue a gramática da referência, nunca o conteúdo dela.
- Chaves de API (voz, imagem) ficam em `.env` com o nome da variável. Nunca no prompt nem no código.

## Vídeo com narração: voz primeiro

Regra do Kevin: **se o vídeo tem voz, a voz vem antes da música.** A música é composta em cima da linha do tempo da voz, nunca o contrário.

1. **Roteiro da narração** (`docs/narracao.md`), com as pausas já marcadas.
2. **Voz gerada** (ElevenLabs). Ela costuma **ignorar ou encurtar as pausas `<break>`**, e tudo bem: as pausas são feitas na edição.
3. **Voz espaçada:** recortar a narração frase por frase (whisper + corte no ponto de menor energia) e remontar com as pausas que o filme pede. Exemplo: `projetos/genealogia-oliveira/voz_espacada.py`, que gera `voz_espacada.wav` + `timeline_voz.json`. Deixar respiros longos nos momentos de emoção e trechos só instrumentais para os picos.
4. **Conferir pronúncia:** transcrever a voz e listar nomes próprios ou palavras que o whisper ouviu diferente (ex.: "Ameixoeiro" → "Amichoeiro"). Passar os segundos exatos para o Kevin ouvir. Se estiver errado, refazer só aquela frase na ElevenLabs (com grafia fonética) e trocar no recorte.
5. **Prompt da música** com os tempos reais da voz espaçada: cada seção começa no segundo em que a frase correspondente entra (ex.: `docs/musica_prompt_v2.md`). Silêncio na música onde a voz diz a frase mais dura.
6. **Música chegou:** medir com `tools/beats.py` (trechos, energia, silêncios) e ajustar as pausas da voz espaçada para as frases caírem nas viradas reais da música. A voz é flexível; a música não.
7. Só então editar a imagem, com voz e música já travadas.

## Som

- Com música fornecida: meça com `tools/beats.py` e sincronize cortes e efeitos nas batidas.
- Sem música: sintetize (`tools/sfx.mjs` para efeitos; trilha em código se for preciso) na mesma linha do tempo da imagem.
- Efeitos com parcimônia: whoosh em transição, pop em entrada de elemento, chime ou sparkle em momento especial. Mais baixos que a voz e o canto.
- **Proibido efeito sonoro feito de ruído sintetizado:** whoosh/"ar" em transição, papel, caneta, chama, vela, vento, mar, trem de ruído. No vídeo final eles soam como **chiado**, e o Kevin já reclamou mais de uma vez. Só use efeito sonoro se for (a) uma gravação real fornecida ou (b) tonal e limpo (sino, apito, clique tonal curto de máquina de escrever). Na dúvida, prefira o silêncio e a música.
- **Música sob narração:** a música fica bem atrás da voz (comece ~50% mais baixa do que pareceria certo) e abaixa forte quando a voz entra (sidechain com ratio alto). Confira a inteligibilidade nos trechos em que a música está no pico.
- **Normalização de volume:** nunca use `loudnorm` em modo dinâmico (de uma passada) no mix final, porque ele aumenta os trechos baixos e traz o chiado à tona. Meça e aplique ganho fixo (`loudnorm` em duas passadas com `linear=true`, ou `volume=`).
- Mixagem: `-14 LUFS` para redes sociais e profissional; `-16 LUFS` para vídeo caseiro com fala. Pico em `-1.5 dBTP`, `acrossfade` de 0,25s nos cortes, fade no final.

## Sincronia som ↔ imagem (o que faz parecer "fluido")

Medido no anúncio do Edit IA Pro com `tools/sincronia.py`: a referência acertou 94% dos 31 efeitos sonoros (9 ms). A nossa v1, cronometrada pela fala, acertou 55% (26 ms). Re-cronometrada pelos efeitos, a v2 acertou **97% (14 ms)**. A diferença de "fluidez" vem daí, não de fps nem de biblioteca.

- **Um evento, duas saídas.** Cada coisa que acontece na tela (clique, pop, troca de estado, transição) é um item de uma única lista `EVENTS` no projeto. A animação lê essa lista, e o `cues.json` dos efeitos é gerado dela. Nunca escreva a lista de efeitos à mão, separada da animação.
- **Áudio pronto do cliente** (voz + trilha + efeitos já mixados): antes de animar, extraia os efeitos sonoros do áudio (ataques agudos e percussivos, conferidos contra a referência) e **re-cronometre os eventos visuais para cair neles** (±1 quadro). A palavra dita define a cena, mas o efeito sonoro define o quadro exato da ação.
- **Todo efeito sonoro tem uma causa visível, e todo "pop" visível tem um som.** Efeito tocando com a tela parada parece atraso.
- **Ataque no acerto ("estampa"):** no quadro do som o elemento já está inteiro, cerca de 28% maior, e assenta com mola (`hitS(t, t0)` em `projetos/editpro-4x5/index.html`). A ação começa **1 quadro** antes do som. Crescer do zero com mola chega 40 a 60 ms atrasado, e começar 2 quadros antes adianta demais.
- **Elemento importante no acerto tem que ser grande.** Uma xícara pequena no som não é percebida, mas um clipe laranja batendo na timeline é.
- **Whoosh:** o pico do som (metade da duração) cai no ponto mais rápido do movimento, e não no começo.
- **Troca de cena acontece num acerto** (corte, zoom, empurrão), não num fade de 0,2s solto no tempo.
- **Confira com número:** `tools/sfxhits.py audio --ref ref.mp4 > hits.json` e depois `tools/sincronia.py final.mp4 hits.json`. Mire em 90% ou mais dentro de ±40 ms e corrija pela lista de falhas.
- Os tempos dos efeitos ficam num objeto `HIT` no topo da composição, e toda ação visual referencia `HIT.nome` em vez de um número solto.

## Quando existe uma referência (o que deu errado no Edit IA Pro v1/v2)

- **Antes de codar:** escreva `docs/guia-de-estilo.md` a partir da referência (quadros a cada 0,5s, cores medidas, estrutura fixa da tela, componentes, como o texto entra) e `docs/lista-de-planos.md` com a composição de cada frase. Modelo: `projetos/editpro-v3/docs/`.
- **A filmagem tem que combinar com a narração.** Se a voz descreve edição de alguém falando para a câmera, o vídeo editado tem que ser essa pessoa. Ilustrar com outra filmagem vira encenação e derruba o resultado, por melhor que seja a animação.
- **Na crítica, compare lado a lado com a referência**, no mesmo segundo do áudio, e não com as suas intenções. Sincronia alta e checklist cumprido não garantem qualidade.
- Não reaproveite um template de outro projeto quando a referência tem uma gramática própria.

## Método de showreel e edição (aula "Opus 5.5 Showreel" + skill showreel-interface)

1. **Perícia da referência em 3 camadas, com números**, antes de desenhar:
   - **estrutura:** ordem dos capítulos e o loop que abre e fecha;
   - **design:** paleta, fonte e componentes;
   - **movimento medido:** quadros por corte, % de cortes a ≤2 quadros de uma batida e % do filme em quase-parada.
   Registre isso em `docs/guia-de-estilo.md`.
2. **Rajada ↔ silêncio.** O filme não se mexe o tempo todo: momentos quase parados (0,5 a 1s) preparam a rajada. Na referência da skill, 40% do tempo é quase-parada. Foi isso que faltou no Edit IA Pro v1/v2.
3. **Toda transição é feita por um elemento da cena** (texto que vira risco, chip que vira risco, card que vira tela cheia, tela que encolhe e vira card). Há sempre um elemento condutor que o olho segue. Nada de fade ou transição genérica. **A maior mudança de enquadramento cai no drop.**
4. **Física de câmera:** antecipação lenta (6–8 quadros a 30 fps) → rajada curta com motion blur (2–3) → assentamento longo (10–12). Parado é nítido, rápido é borrado.
5. **O filme é um argumento:** abre com uma provocação e fecha com a mesma frase invertida. Antes de desenhar, responda por escrito: qual é o **chip** (título de capítulo repetido, na UI da marca), qual é a **prova** e qual frase o **final inverte**.
6. **Regras de marca antes de desenhar:** leia as diretrizes oficiais (tamanho mínimo e respiro do logo). Em transição, logo só sofre corte, fade, deslocamento e escala uniforme. Nunca blur, rotação, skew, recolor, sombra ou contorno. O movimento forte fica com os elementos de interface.
7. **Cartões, selos e pílulas sobre vídeo:** fundo de vidro (liquid glass: desfoque do que está atrás + brilho sutil na borda) em vez de véu escuro.
8. **Prova real:** grave o site rolando de verdade e tire screenshots reais (Playwright). Não desenhe telas. Imagem ou vídeo gerado só quando não existir, e com etiqueta ("Imagem gerada").
9. **Música primeiro, editada em compassos:**
   - gere ou receba variações e escolha **medindo** (arco intro → entrada → cheio → parada → final, bumbo legível, fim limpo);
   - endireite o BPM para cair em quadro inteiro (`atempo`);
   - corte compassos inteiros (5 ms de crossfade);
   - escreva os eventos em **compasso.tempo** ("3.1 = drop").
   Gere a música na ElevenLabs (seção abaixo). Ferramenta de medição: `.venv/bin/python .claude/skills/showreel-interface/scripts/batida.py trilha.wav --fps 60` (e `--video render.mp4` para a % de cortes na grade; meta ≥70%, ideal ≥90%).
10. **Picture-in-picture:** quando a pessoa for entrar por cima depois, deixe o terço combinado da tela vazio e entregue também uma prévia com a voz e os efeitos.
11. **Transcrição:** `whisper-cli -m ~/.cache/whisper/ggml-large-v3.bin -l pt` (mais preciso; o `small` fica para testes rápidos). Toda animação entra no tempo exato da palavra, nunca antes.

**Skill `showreel-interface`** (MIT, Felipe Borges, em `.claude/skills/showreel-interface/`; versão em `VERSAO.txt`): use para showreel, reel de marca e promo curto. **Ressalvas:**
- O `scripts/sfx.py` dela sintetiza whoosh e swish com ruído. **Proibido aqui** (regra do chiado): use só os sons tonais do kit (clique, tique, ding), uma gravação real ou silêncio.
- O `aceite.py` depende de outra skill do mesmo autor (`motion-por-referencia`), que **não foi instalada**. Pergunte ao Kevin antes de instalar.
- Ela foi escrita para HyperFrames. Os princípios valem também no fluxo canvas.

## Ciclo de crítica (antes de mostrar qualquer coisa)

1. Renderize uma prévia, com um quadro por batida ou por momento-chave, rode `tools/critica.sh` e **olhe de verdade** o `contact.png`, o `phone.png` e o `strip.png`.
2. Dê nota de 1 a 10, com olhar de diretor exigente, não de autor orgulhoso:
   - **sempre:** gancho nos 2 primeiros segundos, leitura no celular (360 px), qualidade do movimento, variedade, composição, sincronia com o som;
   - **caseiro:** emoção e foco nas pessoas;
   - **profissional:** fidelidade à marca e clareza da mensagem.
3. Liste os 3 piores problemas com o segundo exato. Procure: texto sobreposto em troca, algo deslizando sem easing, texto borrado por escala, segundo morto, emenda do loop pulando, legenda fora de tempo, gráfico cobrindo rosto.
4. Corrija, re-renderize só o trecho afetado (`--from/--to`) e repita até tudo ficar com 8 ou mais.
5. Só então faça o render completo e verifique o MP4 final (quadros nos cortes, duração, fps, loudness).

## Edição de vídeo real

1. Inspecione com `ffprobe`. Vídeo de iPhone costuma vir em HEVC 10-bit HLG/Dolby Vision: converta com `tools/hdr2sdr.sh` (a conversão ingênua fica lavada).
2. Analise antes de editar:
   - mosaico de miniaturas a cada 2s;
   - mosaicos densos (4 fps) nos momentos-chave;
   - `tools/beats.py` no vídeo, que dá palmas, trechos e energia (silêncio antes de soprar a vela, por exemplo).
3. Para legendas de fala: `whisper-cli -m ~/.cache/whisper/ggml-small.bin -l pt`. Ele **falha em canto de coro** (alucina ou devolve "[MÚSICA]"). Nesse caso, sincronize por trecho usando palmas e energia e avise o Kevin que a legenda é aproximada.
4. Extraia os quadros do SDR (`-q:v 2`), com índice `round(S * fps_real)` (59.94 no iPhone), e componha como em `templates/edicao-video/comp.html`:
   - mapa de tempo com os cortes;
   - keyframes de câmera `[S, zoom, cx, cy, rot]`;
   - gradação (soft-light + vinheta);
   - legendas, abertura e encerramento.

## Lições já aprendidas

- **O ffmpeg desta máquina não tem** `drawtext`, `subtitles`/`ass`, `zscale` nem `libplacebo`. Texto e gráfico vão sempre no canvas.
- **Fontes que funcionam:** "Avenir Next" (600/700/800), "Snell Roundhand" (cursiva), "SF Pro Display"/`system-ui`, "Apple Color Emoji". Para outras, use um arquivo local `.woff2`/`.ttf` com `@font-face`.
- **Recorte com `evenodd`:** sempre `moveTo(cx + r, cy)` antes do `arc`, senão aparece uma cunha diagonal.
- **Câmera:** zoom mínimo de ~1.04, `cx/cy` limitados a `0.5/zoom`, rotação compensada com mais zoom. Assim nunca aparece borda.
- **Corte disfarçado:** zoom e desfoque saindo (0,28s) + flash + zoom e desfoque entrando (0,38s).
- **Contador que rola:** não deixe o número anterior passar do valor inicial. Se o número troca mais de ~2 vezes por segundo, não faça rolar: com motion blur ele vira borrão. Use número firme com um "pulo" curto a cada troca.
- **Transição por mergulho:** zoom até um traço cobrir a tela inteira com uma cor sólida, depois íris abrindo na cena nova. Sobras translúcidas da cena antiga por cima da nova ficam feias.
- **Título grande:** meça com `measureText` e reduza a fonte para caber na largura. Não confie no tamanho fixo.
- **Texto sobre vídeo** precisa de véu ou degradê atrás. Confira na prévia.
- **Material de terceiros:** antes de usar vídeo que não é do Kevin num anúncio, avise sobre direito autoral e sobre a promessa implícita (a filmagem profissional não foi feita pela IA). Corte logos e cartelas, mas deixe claro que isso não resolve o direito de uso.
- **Swift está quebrado nesta máquina** (SDK e compilador desalinhados). Para frameworks da Apple (Vision etc.), use PyObjC no `.venv`.
- **Manchete palavra por palavra:** a frase anterior tem que terminar de sair **antes** da próxima entrar (saída em `[t1-0,14, t1]`, com `t1` limitado ao início da próxima). Senão as duas se sobrepõem.
- **Material de terceiros no vídeo editado:** confira quadro a quadro os trechos usados. Telas de produto, pôsteres e logos aparecem no meio da filmagem e precisam ser evitados.
- **Mapas com texto no topo:** enquadre a câmera para que nenhum lugar citado caia embaixo do bloco de texto. Isso já falhou duas vezes (travessia e caminho de volta).
- **Documento em tela cheia:** limite a câmera às bordas do papel (`clamp` de ox/oy), senão aparece faixa preta.
- **Natural Earth:** GeoJSON oficial em `raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/`. Na simplificação Douglas-Peucker, anéis fechados (início = fim) colapsam: simplifique em duas metades (`dpr` em `geoprep.py`). O relevo SR_50M é grosseiro (~3,7 km/px): reprojete com interpolação bilinear e desfoque conforme o zoom. O rio Mondego não existe na base 10m.
- **Destaque em documento = câmera vai até ele:** quando um trecho é destacado (holofote ou círculo), a câmera centraliza e aproxima até o item ocupar boa parte da tela, no momento em que a voz o cita. Confira na prévia se a moldura cai exatamente sobre a palavra dita; posições estimadas a olho erram.
- **Transições profissionais:** dissolver com desfoque e leve aproximação, sem achatamento de "virada de página", sem revelação por círculo ou recorte seco e sem texto que aparece cortado. Texto entra letra a letra com fade, não por máscara que corta.
- **Buracos de tela vazia:** olhe o mosaico de 1 quadro a cada 5s do vídeo inteiro. Duas cenas que "se encostam" no papel podem deixar segundos pretos entre elas.
- **Caminhos com espaço** ("Edite IA"): em Node, use `fileURLToPath`, nunca `new URL(...).pathname`.

## Entregas

- Vídeo final na `~/Desktop/` com o nome pedido. Se não houver nome, use um descritivo sem acento (`Aniversario-Lais-Martins.mp4`).
- Nunca sobrescreva nem apague o arquivo original do Kevin.
- No profissional: entregue `final.mp4` + `contact.png` + um quadro de capa e os formatos pedidos.
- Para WhatsApp, ofereça uma versão leve (CRF 23 ou 720p).
- Na resposta: o que foi feito, o que é aproximado (legenda de canto, data tirada dos metadados), tamanho do arquivo e o que você melhoraria na próxima versão.

## HyperFrames (instalado em 2026-10-18, para comparação)

- CLI `hyperframes@0.8.172` em `devDependencies` (`npx hyperframes ...`); código-fonte lido em `vendor/hyperframes/` (Apache 2.0; os arquivos de teste em Git LFS não foram baixados).
- Skills copiadas do clone para `.claude/skills/` (router `hyperframes`, `hyperframes-*`, `media-use`, `general-video`, `product-launch-video`, `talking-head-recut`).
- **A skill `hyperframes` se diz "framework padrão". Aqui ela NÃO é o padrão:** use HyperFrames só quando o Kevin pedir ("faz no HyperFrames", "versão HyperFrames"). Fora isso, siga o fluxo canvas + `tools/render.mjs` deste arquivo.
- Rode sempre com `HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_SKIP_SKILLS=1` (sem telemetria anônima e sem o `init` reescrever as skills a partir do GitHub).
- Projetos HyperFrames ficam em `projetos/<nome>-hf/`, ao lado da versão canvas, para comparar lado a lado (mesmo áudio, mesmo formato, mesmas métricas: `tools/sincronia.py` e `tools/critica.sh`).
- As regras deste CLAUDE.md (formato perguntado antes, voz primeiro, proibição de ruído sintetizado, -14/-16 LUFS, crítica lado a lado com a referência) continuam valendo dentro do HyperFrames.

## ElevenLabs (conector completo, conectado em 2026-10-18)

O conector da ElevenLabs do Kevin gera **música** (Eleven Music v2.5, até 600 s, instrumental), **efeitos sonoros** (Sound Effects v2, 0,5–30 s), **voz** (v4/v3, com as vozes da conta), **imagem** (GPT Image 2.5, Nano Banana Pro, Seedream, Flux), **vídeo** (Seedance 2.5, Veo 3.1, Kling 3.0, Runway) e ainda faz isolamento de voz, transcrição (Scribe), música a partir de um vídeo e remoção de fundo. Ele substitui o Higgsfield da aula.

- **Gasta créditos do Kevin.** Antes de gerar, diga o que vai gerar, quantas variações e a duração, e espere o ok. Ler e listar não custa nada.
- **Música:** escreva a estrutura em segundos no prompt (intro, entrada, drop, parada, final), gere 2–3 variações, escolha **medindo** (`batida.py`, `beats.py`) e edite em compassos.
- **Efeitos sonoros gerados:** são sons "gravados", não ruído sintetizado. Mesmo assim, ouça e meça cada um antes de usar (regra do chiado). Na dúvida, fica o silêncio.
- **Imagem e vídeo gerados:** só quando não existir material real, sempre com etiqueta ("Imagem gerada") e usando só os trechos limpos (sem mão deformada, sem texto ilegível).
- Baixe tudo para `projetos/<nome>/assets/` e trabalhe com os arquivos locais.

## NinjaBR Hub (assinatura do Kevin, mapeado em 2026-10-18)

https://ninjabrhub.io/studio, logado no navegador interno. **Use o hub sempre que fizer sentido**, de preferência a gastar créditos da ElevenLabs em vídeo e imagem: o NinjaFly tem Kling 3.0 (5–10s, i2v), Veo 3.1, Runway e Seedance 2.0 Ultra (primeiro + último quadro) "sem limite". Mapa completo, receita de operação e limitações na memória `ninjabr-hub` (upload só por `fetch` de URL do hub ou do Wikimedia, uma geração de vídeo por vez, saída 960×960 24 qps → interpolar com `minterpolate` para 72 qps).
- **Material real antes do gerado:** procure foto de época no Wikimedia Commons (API) antes de gerar uma cena. Foto real pode virar ponto de partida de uma transição Seedance (foto → cena recriada).

## Dois computadores: Mac e Windows (desde 2026-10-19)

O estúdio roda nos dois. As instruções, as ferramentas, as skills do projeto e as memórias ficam no **GitHub público `KevinGeraldo/edite-ia`**. Os projetos (`projetos/`, com dados de clientes e de famílias) **nunca vão para o GitHub**: vão pelo **Google Drive**. Passo a passo em `setup/LEIA-ME-WINDOWS.md` (instalação: `setup/setup-windows.ps1`).
- **Antes de mexer, veja em qual máquina está** (`uname` / `$env:OS`). Se for **Windows**:
  - use `.venv\Scripts\python` em vez de `.venv/bin/python`;
  - rode `tools/*.sh` pelo Git Bash;
  - `tools/recorte.py` usa rembg (não existe Vision);
  - não há simulador de iOS, Swift nem PyObjC.
- **Fontes:** composição nova inclui `<link rel="stylesheet" href="../../lib/fonts.css">`. Assim, Avenir Next, Palatino, Snell Roundhand, American Typewriter e SF Pro caem em substitutos livres (`lib/fonts/`) quando a máquina não tem a fonte do Mac.
- **Sincronizar** ("sincroniza o estúdio"):
  - no Mac, `setup/exportar-config-mac.sh` (copia `~/.claude` skills/comandos/memória/plugins para `claude-config/`) + commit + push;
  - no Windows, commit + push;
  - na outra máquina, `git pull` (e `setup/setup-windows.ps1` se mudou skill ou memória).
  - O repositório é **público**: nunca suba `.env`, chaves, `projetos/`, skills pessoais nem dados de clientes (o `.gitignore` já barra `projetos/`). Antes de cada push, confira `git diff --stat` em busca de algo pessoal.
- Memórias novas: grave também em `claude-config/memory/` para irem às duas máquinas.

## Instalação

**Já instalado nesta máquina:** Node 23, ffmpeg 8, Python 3 com `.venv` (`numpy`, `librosa`, `soundfile`), Playwright + Chromium, `puppeteer-core` e `whisper-cli` com o modelo small.

**Opcional, ainda não instalado.** Instale quando um trabalho pedir e o Kevin concordar:
- `npx skills add remotion-dev/skills`: vídeos em React (bom para séries e templates com dados).
- `claude plugin marketplace add buildwithhanif/claude-animation-skill`: visual desenhado à mão. É de terceiros: leia o código antes de instalar.

**Modelo:** Opus 5.5. Use esforço **xhigh** para vídeos novos, **max** quando os primeiros segundos carregam um lançamento e **medium** para ajustes e re-renders.

## Histórico

- **2026-10-18:** `PromptCut-Edicao-ao-Vivo-4x5.mp4` (53,6 s, 4:5, 30 fps, `projetos/promptcut/`), o primeiro anúncio da **Prompt Cut**, empresa do Kevin que ensina a editar com IA. Formato próprio: um cronômetro corre enquanto o narrador edita um vlog ao vivo e para em 00:40.0. O editor embaixo vai sendo preenchido no quadro de cada edição. Feito no fluxo "voz primeiro":
  - narração Will (v4), com o "Claude" refeito à parte;
  - música da ElevenLabs re-editada em compassos, porque ignorou a estrutura pedida;
  - 10 efeitos gerados (~170 créditos);
  - takes da apresentadora gerados no Kling 3.0 da hub, fora de sincronia com a voz.
  
  `events.js` alimenta a animação e o `mix_sfx.py`. Sincronia 91%, −14,4 LUFS. Lição: **narração masculina + apresentadora mulher = takes de vlog fora de sincronia, nunca lip sync** (o lip sync OmniHuman de ~34,5 mil créditos foi desperdício).

- **2026-10-18:** `EditIAPro-v3-avatar-4x5.mp4`: a v3 HyperFrames com a apresentadora gerada (rosto Nano Banana Pro na NinjaBR Hub + lip sync OmniHuman 1.5 720p na ElevenLabs, ~34,5 mil créditos) no lugar da filmagem da on.design. O vídeo do avatar já sai alinhado à narração (offset 0), então `data-media-start = data-start`. O fundo trocado é um recorte do Vision quadro a quadro sobre um estúdio gerado em código (`assets/avatar_fundo.mp4`). Sincronia 97%, -14,8 LUFS. O botão "Baixar" do nó baixa o `content.mp4` (704×1248); a `<video>` da página é só a prévia (478×850). Backup da versão anterior em `versoes/index-v3b-ondesign.html.bak`.

- **2026-10-18:** `EditIAPro-v3-HyperFrames-4x5.mp4` (`projetos/editpro-v3-hf/`), a primeira peça em HyperFrames, seguindo `projetos/editpro-v3/docs/`. Teve um cartão de vídeo persistente, palco branco, cursor, legenda falada, linha do tempo fina e o drop em tela cheia. Sincronia de 94% (empata com a referência; a v2 em canvas fez 97%), -14,8 LUFS, render de 45s. Comparativo lado a lado em `~/Desktop/EditIAPro-comparativo.mp4`. Lições:
  - no HyperFrames o vídeo entra como `<video data-media-start>` (sem extrair quadros) e o cartão é um wrapper sem `data-start`, animado pelo GSAP;
  - o `check` acusa texto sob máscara: use `mask-image` em vez de degradê por cima;
  - o `tools/sincronia.py` não enxerga eventos brancos sobre branco (confira na tira de quadros antes de "corrigir").

- **2026-10-18:** `A-Travessia-de-Jose-de-Oliveira-v4-4x5.mp4` (6:00, 4:5, `projetos/genealogia-oliveira/index-v4.html`): primeiro projeto no fluxo "voz primeiro". Narração ElevenLabs recortada em 26 frases (`voz_espacada.py`); duas músicas da ElevenLabs emendadas no silêncio (A até 3:01, B depois); mapas reais da Natural Earth (`geoprep.py`: globo 50m, Portugal e SP 10m com relevo SR_50M reprojetado com interpolação bilinear); sons de ambiente sintetizados (`sfx_gen.py`); -16 LUFS. Roteiro em `docs/roteiro-v4.md`.

- **2026-10-17:** `EditIAPro-4x5-v2.mp4`: o anúncio do Edit IA Pro re-cronometrado pelos 31 efeitos sonoros do áudio do cliente. Sincronia foi de 55% para 97%. A v1 está preservada em `index-v1.html`.

- **2026-10-17:** `A-Travessia-de-Jose-de-Oliveira-4x5.mp4` (genealogia, 4:5, 4min40, 60 fps, `projetos/genealogia-oliveira/`): briefing com 23 cenas, documentos com holofote dourado e citação em "tinta", árvore vertical, mapas antigos desenhados com o vapor Frísia, linha do tempo vertical, trilha de piano composta por cena (`music.py`, luto ~10 dB abaixo) a -16 LUFS. Versão leve para WhatsApp junto.

- **2026-10-17:** `EditIAPro-4x5.mp4` (1080×1350, 35,6s, `projetos/editpro-4x5/`) para o cliente **Edit IA Pro**. Usa a narração e a copy originais do anúncio deles (áudio extraído do anúncio em 48 kbps; peça o WAV original ao cliente). O vídeo editado é a filmagem da on.design.

- **2026-10-17:** `Anuncio-Editar-com-IA-4x5.mp4` (1080×1350): o Kevin precisava de 4:5 e não tinha dito. Daí a regra de sempre perguntar o formato. Gerado de `index-4x5.html` (cópia de `index.html` com `FMT = '4x5'`).

- **2026-10-17:** `Anuncio-Editar-com-IA-vertical.mp4` (9:16, 45s, `projetos/anuncio-v2/`), no estilo das referências "Edit IA Pro" (creme/laranja, manchete palavra por palavra, linha do tempo do próprio anúncio embaixo). Mesma narração e mesma trilha do anúncio 16:9. A vitrine ainda usa a filmagem da on.design.

- **2026-10-17:** `Anuncio-Editar-com-IA.mp4` (16:9, 45s, `projetos/anuncio-ia/`): editor animado + vitrine de 12s + CTA. A vitrine usa filmagem de terceiros (Studio Gusto/Microsoft e on.design) e precisa ser trocada antes de rodar como anúncio pago.

- **2026-10-17:** `delivery-lais.mp4` (motion 10s, 9:16, app de delivery) e `Aniversario-Lais-Martins.mp4` (10 anos da Laís, 81s, 1080p60, tema rosa, legendas do parabéns aproximadas por trecho). Os dois estão na Mesa.
- **2026-10-17:** `delivery-lais-v2.mp4`, refeito com as ferramentas novas em `projetos/delivery-v2/`: trilha 120 BPM sintetizada (`music.mjs`), efeitos por cues, mapa 3D inclinado, molas, motion blur `--sub 4`, -14 LUFS, 3 rodadas de crítica.
