---
name: ninjabr-hub
description: "NinjaBR Hub (ninjabrhub.io) do Kevin — mapa das ferramentas de IA, como operar pelo navegador interno e limitações descobertas"
metadata:
  node_type: memory
  type: reference
  originSessionId: 08c811de-a82c-4a00-9dfc-810d0d9c80cc
  modified: 2026-10-18T23:26:20.577Z
---

O Kevin assina o **NinjaBR Hub** (https://ninjabrhub.io/studio, logado no navegador interno). Ele pediu (2026-10-18) para usar o hub sempre que estiver disponível e fizer sentido nas próximas edições, em vez de gastar créditos da ElevenLabs em vídeo.

**Studio** (`/studio`): uma caixa de prompt única com seletor "Imagem de IA / Vídeo de IA" e seletor de modelo. O histórico de gerações fica na mesma página (cuidado: tem gerações de outros trabalhos do Kevin, não mexer).
- **Vídeo:** NinjaFly ("sem limite": Veo 3.1 Fast 4/6/8s com som, Runway 4.5, Ray 3.14, Kling 3.0 t2v/i2v, Kling 2.5 Turbo i2v, Kling 3.0 Omni i2v). Kling 3.0: duração 5–10s, aspect 16:9 / 9:16 / 1:1, "Com som" ligado por padrão (desligar), campo "Imagem (opcional, vira i2v)". Também Seedance 2.0 Ultra (primeiro + último quadro), Artlist (11: Veo 3.1 Lite, Kling 2.6/2.5/2.1, Wan 2.7, LTX 2.3 Pro, Seedance 2 Mini…), Veo 3.1, Wan 3.0 (até 15s), Ninja Enhance (upscale, suavizar movimento, restaurar rosto), Grok Imagine, Pixverse, Lip Sync.
- **Imagem:** Ideogram (Ideogram 4/4.5, Nano Banana 2/Pro, GPT Image 2, Z-Image), Artlist (11), Dzine (14), Google Flow (3), Leonardo (6), Pixverse (10), FLUX/SDXL (sem créditos), Vetorizador. GPT Image 2: proporção, resolução até 2K, quantidade.
- Outras: NinjaVoice/Clone (voz PT), NinjaDub, Suno, NinjaSTOCK (bancos de imagem/vídeo), Artlist Stock (Premium), NinjaClips, Submagic, espionagem de anúncios.

**Como operar:** navegador interno (`mcp__Claude_Browser__*`). Os menus de modelo são popovers: ler com JS `[data-radix-popper-content-wrapper]` e clicar pelo `find`.

**Receita que funciona (testada em 2026-10-18):**
- **Imagem de referência sem upload:** o `fetch` de dentro da página funciona para URLs do próprio hub (`pub-…r2.dev`) e do Wikimedia (`upload.wikimedia.org`, arquivo original, não o `/thumb/`). Monte um `File` a partir do blob, coloque no `input[type=file][accept="image/*"]` da caixa com `DataTransfer` e dispare um `change`. Assim dá para gerar uma imagem no hub (GPT Image 2, 2K) e animá-la, ou animar fotos reais de domínio público.
- **Se o `fetch` falhar** ("Failed to fetch": a página sobrescreve `window.fetch`), use `XMLHttpRequest` com `responseType='blob'` na mesma URL do r2.dev (testado em 2026-10-18). A imagem anexada aparece como `img` de `supabase.co/.../temp-uploads/`.
- **Kling 3.0 i2v em 9:16:** saída 716×1284, 24 qps, 10s em ~100s. Boa consistência de rosto/roupa/sala com a mesma imagem inicial (3 takes da apresentadora do Prompt Cut: erro+"ops", gestos de vlog, CTA apontando e joinha).
- **Trocar o prompt:** cmd+a NÃO seleciona o texto do textarea; o texto novo é anexado ao antigo. Use o setter nativo: `Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(ta, txt); ta.dispatchEvent(new Event('input',{bubbles:true}))`. Depois de cada geração, o textarea volta ao prompt anterior.
- **Uma geração de vídeo por vez:** o botão Enviar fica desabilitado enquanto há uma processando.
- **Saída do NinjaFly Kling 3.0:** 960×960, 24 qps, 10s em ~4 min. Consistência boa em 10s (a família de Lisboa não morfou). A resolução é menor que a do Kling da ElevenLabs (1440): suba com lanczos e interpole.
- **Seedance 2.0 Ultra** (grupo próprio no menu): imagem inicial + frame final opcional + até 4 referências, 4–10s, aspect Auto/16:9/9:16/21:9/4:3/3:4/1:1, resolução 480p/720p (entregou 960×960 em 1:1). Excelente para **transição por elemento**: na genealogia, a foto real de 1909 (Wikimedia) virou o cais de Lisboa e terminou exatamente no 1º quadro do clipe seguinte (frame final = imagem que gerou esse clipe). Na emenda: transição com `fo` ≈0 e próximo clipe com `fi` ≈0, e zoom contínuo entre os dois.
- **Foto real animada (Kling i2v):** prompt de "cinemagraph" (só fumaça, água e bandeiras; "static camera, no zoom") preserva o documento. Já o prompt de "multidão andando" recompôs as pessoas: falsifica o arquivo, então não use. Etiqueta: "Fotografia real · movimento gerado por IA".
- **Material de época:** a API do Wikimedia Commons (`list=search&srnamespace=6`, depois `prop=imageinfo&iiprop=url|extmetadata` para a licença) achou o próprio vapor Frísia de 1909 (Stadsarchief Amsterdam, domínio público). Registre a licença em `assets/reais/CREDITOS.txt` e nos créditos do filme. CC BY-SA pede crédito ao autor.
- **Interpolação local:** `minterpolate=fps=72:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1` ficou limpa em planos lentos. Use antes de colocar clipes de 24 qps num filme de 60 qps.
- **Ler resultado:** URL do vídeo em `main video` → `currentSrc` (r2.dev); baixar com curl.
- **NinjaSTOCK** só baixa a partir de link de banco pago (Envato, Storyblocks, Freepik/Magnific). Licença incerta para cliente: prefira o Wikimedia Commons para material de época.

**Limitações:**
- **Enviar arquivo local não funciona** pelo navegador interno: servidor local foi bloqueado pelo modo auto e o `fetch` de URL externa dá erro de CORS. Saída: gerar a imagem de referência no próprio hub e animar a partir do histórico, ou usar o Claude in Chrome (que tem `file_upload`) com o ok do Kevin.
- Baixar o resultado: pegar a URL pública da mídia no DOM e baixar com curl, em vez do botão Baixar.

Ver também [[elevenlabs-creditos]].
