---
name: edicao-gameplay
description: Conhecimento do estúdio Edite IA para editar VÍDEOS DE GAMEPLAY — highlights, melhores momentos, montagens, cortes de live, clipes para Reels/TikTok/Shorts e vídeos de YouTube a partir de gravações de jogo (com ou sem facecam e voz do jogador). Use sempre que o Kevin pedir para editar gameplay, partida, live, clipe de jogo, "melhores momentos", kill, jogada, montagem de jogo, mesmo sem citar a skill. Ao terminar um trabalho de gameplay, registre aqui as lições novas.
---

# Edição de gameplay

Conhecimento separado por tipo: este arquivo guarda **só** o que vale para gameplay. Regras gerais (formato perguntado antes, render, som, sincronia, crítica, entregas) estão no `AGENTS.md` e continuam valendo.

> Estado: **base inicial, ainda sem projeto entregue.** Cada trabalho de gameplay deve refinar este arquivo (seção "Lições" no fim).

## Antes de começar (além do formato)
- **Jogo e plataforma de destino:** Shorts/Reels/TikTok (9:16, 15–60 s) ou YouTube (16:9, longo).
- **Tem facecam? Tem voz do jogador?** Isso decide o layout e a legenda.
- **Tipo:** highlight de uma partida, montagem de vários clipes, corte de live, tutorial/dica, review, meme.
- **Música:** do Kevin, gerada (ElevenLabs) ou nenhuma. **Nunca** a trilha oficial do jogo nem música comercial num vídeo que vai ser monetizado ou anunciado.

## Achar os momentos (gravações longas)
1. `ffprobe` (gameplay costuma vir em 60 fps e às vezes em HDR: converta com `tools/hdr2sdr.sh`).
2. **Picos de áudio do jogo** (`tools/beats.py` no vídeo): tiros, explosões e o som de kill/vitória aparecem como ataques fortes. Liste os trechos com mais energia.
3. **Reação do jogador:** se tem voz, `whisper-cli` large-v3 e procure gritos, risadas, palavrões, "olha isso". A reação vale mais que a jogada.
4. **Mudança de tela** (`ffmpeg select='gt(scene,0.3)'`) para achar mortes, telas de vitória e trocas de mapa.
5. Mosaico a cada 2 s e mosaico denso (4 fps) nos candidatos. Escolha olhando, não só pelo número.

## Montagem
- **Gancho = o melhor momento primeiro** (a kill, a virada, a reação), em 0–2 s. Depois, se fizer sentido, "volta" para mostrar como chegou lá.
- Corte o tempo morto sem dó: andar pelo mapa, loot e menus saem.
- Cortes no ritmo da ação (tiro, impacto) ou da música medida.
- **Punch-in** no momento-chave e slow-motion curto na jogada (interpole com `minterpolate` a partir dos 60 fps). Freeze-frame com texto para explicar a jogada.
- **Não cubra o HUD importante** (vida, munição, minimapa, killfeed) quando ele conta a história. Legenda e gráfico ficam onde não brigam com o HUD.
- **9:16 com facecam:** jogo em cima (recorte centrado na ação, acompanhe a mira) e câmera embaixo, ou facecam em PiP. Sem facecam: re-enquadre seguindo a ação, nunca só esmague o 16:9.
- Legenda da fala do jogador palavra a palavra (o feed assiste sem som).

## Som
- O áudio do jogo é parte da emoção: mantenha os tiros e impactos e baixe a música por baixo deles.
- Voz do jogador acima de tudo. Efeitos extras só tonais e limpos (regra do chiado).
- −14 LUFS.

## Direitos
- Footage de jogo costuma ser liberado para criadores, mas confira a política da publicadora para anúncio pago.
- Música e memes de terceiros podem derrubar o vídeo: avise o Kevin antes de usar.

## Lições (preencher a cada trabalho)
- (vazio)
