# Edite IA no Windows

Instala, num computador Windows, o mesmo estúdio de edição de vídeo que o Claude usa no Mac do Kevin, para o Claude **de quem usa aquele computador** editar vídeos com a mesma qualidade.

Vai para o Windows:
- o método do estúdio (`CLAUDE.md`);
- as ferramentas: render, crítica dos quadros, batidas da música, recorte de fundo, legendas;
- os modelos de vídeo e as skills de vídeo;
- as fontes.

Não vai nada pessoal do Kevin: projetos, memórias, contas, permissões e plugins ficam no Mac.

## Instalar (uma vez só, uns 30 minutos)

1. Instale o **Claude** (app de desktop) e entre com a **sua própria conta**.
2. Abra o **PowerShell** (menu Iniciar → digite "PowerShell") e cole, uma linha por vez:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   iwr https://raw.githubusercontent.com/KevinGeraldo/edite-ia/main/setup/setup-windows.ps1 -OutFile setup-windows.ps1
   .\setup-windows.ps1
   ```
   O script baixa uns 4 GB e instala sozinho:
   - Git, Node, Python e ffmpeg;
   - o estúdio, na pasta `C:\Users\<você>\Edite IA`;
   - o Chromium que renderiza os vídeos;
   - o whisper, que transcreve as falas para as legendas.
   
   No fim, ele cria o `CLAUDE.local.md`, que conta ao Claude quem usa esta máquina e como falar com você.
3. No Claude, abra a aba **Code** e escolha a pasta **Edite IA**.

## Usar

Peça com as suas palavras, por exemplo:
- "Edite o vídeo do aniversário da Ana que está em Downloads, com música alegre e o nome dela no começo."
- "Junte as fotos da viagem que estão na pasta Praia num vídeo de 1 minuto para o WhatsApp."

Antes de começar, o Claude pergunta o formato (vertical para o celular, quadrado, horizontal…). O vídeo pronto vai para a **Área de Trabalho**, e ele oferece uma versão leve para o WhatsApp. Os seus arquivos originais nunca são apagados.

## Atualizar o estúdio

Quando o Kevin melhorar o estúdio, abra o PowerShell na pasta e rode:
```powershell
cd "$HOME\Edite IA"; git pull
```
