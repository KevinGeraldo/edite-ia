---
name: edicao-criativos
description: Conhecimento do estúdio Edite IA para CRIATIVOS DE ANÚNCIO e vídeos de venda de PRODUTOS (anúncio para Meta/TikTok/YouTube, UGC, criativo de oferta, demonstração, lançamento), cada produto com sua própria ficha. Use sempre que o Kevin pedir criativo, anúncio, vídeo de venda, ad, peça para tráfego, ou citar um produto/cliente (Prompt Cut, Edit IA Pro ou outro), mesmo sem citar a skill. Ao terminar, registre as lições gerais aqui e as do produto na ficha dele.
---

# Criativos (anúncios de produtos)

Conhecimento separado por tipo: aqui fica só o que vale para criativo de venda. Regras gerais estão no `CLAUDE.md`.

## Cada produto tem uma ficha
- Ficha em `projetos/_produtos/<produto>/produto.md` (vai pelo Google Drive, **nunca** para o GitHub público).
- **Antes de começar um criativo, leia a ficha do produto.** Se não existir, crie a partir de `projetos/_produtos/_modelo.md` e pergunte ao Kevin o que faltar (oferta, público, promessa, prova, CTA, marca).
- **Ao terminar, registre na ficha:** o criativo feito (arquivo, formato, ângulo, duração) e, quando o Kevin trouxer, as métricas (CTR, hook rate, CPA). O que funcionou para um produto não é regra para outro.

## Ritmo (medido no anúncio do Edit IA Pro, que performou)
| Métrica | Alvo |
|---|---|
| Fala | ~3,2 palavras/s |
| Tempo com voz | ≥ 90% (quase nenhuma pausa entre frases) |
| Ações com som na tela | ~0,9–1,2 por segundo |
| Sincronia som ↔ imagem | ≥ 90% em ±40 ms (`tools/sincronia.py`) |
| Duração | 30–40 s no feed |

Meça a versão nova com a mesma tabela **antes** de mostrar. O Prompt Cut v1 saiu com 2,3 palavras/s, 71% de voz e 25 pausas (12 s): ficou "lento" mesmo com tudo sincronizado. A correção foi cortar as pausas entre frases para 0,1 s, acelerar a voz 12% com `atempo` e manter uma única pausa de efeito.

## O que prende o lead
- **Gancho com rosto ou ação já no 1º quadro.** Nunca abrir em tela escura com texto.
- **Legenda da fala para quem assiste sem som** (pílula com 2–3 palavras, palavra ativa acesa).
- **Cada frase muda a composição** (card troca de lado e tamanho, palavra grande do outro lado), no acerto do som. A tela parada com detalhes pequenos mudando lê como lenta.
- **Impacto físico nos acertos:** soco de zoom + tremor curto, flash de 2 quadros no drop, rastro de zoom nas palavras grandes, faíscas só em aprovação (✓), brilho de vidro no CTA.
- **Uma prova com número** ("00:40", "3 formatos") e **CTA único e claro** no fim (botão, seta, mensagem chegando).

## Voz e honestidade
- Voz primeiro (fluxo do `CLAUDE.md`). Escolha a voz pelas **prévias grátis** da ElevenLabs antes de gerar teste. Pronúncia de marca em inglês ("Claude", "Prompt Cut"): confira no Whisper e, se errar, refaça só a frase.
- **Narrador e apresentador de gêneros diferentes:** use takes de vlog fora de sincronia, **nunca lip sync** (desperdiçou ~34,5 mil créditos no Edit IA Pro).
- **A promessa na tela tem que ser verdadeira.** Se a voz diz "40 segundos", o cronômetro real tem que bater. Se acelerar o vídeo, regenere a frase com o número novo.
- Logo de terceiros (Claude, ChatGPT, WhatsApp): confirme com o Kevin o uso de marca antes de anúncio pago.

## Material
- Filmagem real do produto ou do cliente primeiro. Gerada (Kling na NinjaBR Hub, grátis) só quando não existir, sempre a partir da mesma imagem de referência para manter a pessoa igual.
- Tela de produto: captura real (Playwright), nunca inventada.

## Lições (preencher a cada trabalho)
- 2026-10-18 · Edit IA Pro: a fluidez veio de re-cronometrar a imagem pelos 31 efeitos do áudio do cliente (55% → 97%).
- 2026-10-18 · Prompt Cut: música gerada ignorou a estrutura pedida (silêncio/drop/parada); re-editar em compassos resolveu sem gastar outra geração.
- 2026-10-19 · Prompt Cut v3: rosto em tela cheia no 1º quadro + legenda da fala + impactos nos acertos.
