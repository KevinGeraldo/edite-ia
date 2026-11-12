---
name: edicao-historias
description: Conhecimento do estúdio Edite IA para VÍDEOS DE HISTÓRIAS narrados — genealogia, história de família, biografia, documentário curto, "a história de X", vídeos com mapas, documentos antigos, fotos de época, linha do tempo e narração emocional (de 1 a 10 min). Use sempre que o Kevin pedir para contar uma história em vídeo, mesmo sem citar a skill. Ao terminar, registre aqui as lições novas.
---

# Vídeos de histórias

Conhecimento separado por tipo: aqui fica só o que vale para histórias narradas. Regras gerais (voz primeiro, som, crítica, entregas) estão no `CLAUDE.md`. Projeto-modelo: `projetos/genealogia-oliveira/` (A Travessia de José de Oliveira, v4 a v12).

## Roteiro e voz
- Briefing → roteiro cinematográfico cena por cena → narração (`docs/narracao.md`) com as pausas marcadas.
- **Voz espaçada** (`voz_espacada.py`): respiros longos nos momentos de emoção e trechos só instrumentais nos picos. Aqui o ritmo é o **oposto** do criativo: o silêncio é parte da história.
- Confira nomes próprios e lugares no Whisper e passe os segundos exatos para o Kevin ouvir.
- −16 LUFS (fala com emoção). Música bem atrás da voz, ~10 dB abaixo no luto.
- Duas músicas podem ser emendadas num silêncio da narração.

## Material visual
- **Material real antes do gerado:** fotos de época no Wikimedia Commons (API `list=search&srnamespace=6`, depois `prop=imageinfo&iiprop=url|extmetadata` para a licença). Registre os créditos em `assets/reais/CREDITOS.txt` e no fim do filme.
- Foto real animada (Kling i2v na hub): prompt de cinemagraph (só fumaça, água, bandeiras; câmera parada). Nunca recompor pessoas. Etiqueta "Fotografia real · movimento gerado por IA".
- Transição por elemento com Seedance 2.0 Ultra (foto real → cena recriada, último quadro = primeiro quadro do próximo clipe).
- Imagem gerada sempre com etiqueta.

## Documentos
- **Destaque = a câmera vai até ele:** quando um trecho é destacado (holofote ou círculo), a câmera centraliza e aproxima até o item ocupar boa parte da tela, no momento em que a voz o cita. Confira na prévia se a moldura cai exatamente sobre a palavra dita; posições estimadas a olho erram.
- **Documento em tela cheia:** limite a câmera às bordas do papel (`clamp` de ox/oy), senão aparece faixa preta.
- Citação "em tinta", holofote dourado.

## Mapas
- **Natural Earth** oficial em `raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/`. Na simplificação Douglas-Peucker, anéis fechados (início = fim) colapsam: simplifique em duas metades (`dpr` em `geoprep.py`).
- O relevo SR_50M é grosseiro (~3,7 km/px): reprojete com interpolação bilinear e desfoque conforme o zoom. O rio Mondego não existe na base 10m.
- **Mapas com texto no topo:** enquadre a câmera para que nenhum lugar citado caia embaixo do bloco de texto. Isso já falhou duas vezes (travessia e caminho de volta).

## Revisão
- **Buracos de tela vazia:** olhe o mosaico de 1 quadro a cada 5 s do vídeo inteiro. Duas cenas que "se encostam" no papel podem deixar segundos pretos entre elas.
- Entregue também a versão leve para WhatsApp: a família assiste no celular.

## Lições (preencher a cada trabalho)
- 2026-10-18 · genealogia v4: primeiro projeto no fluxo voz primeiro (26 frases recortadas, duas músicas emendadas no silêncio).
