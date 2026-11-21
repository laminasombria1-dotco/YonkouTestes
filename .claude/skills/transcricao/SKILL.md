---
name: transcricao
description: Transcreve o vídeo da pasta bruto/ com Whisper local, em português, e salva em trabalho/ o texto com o tempo de início e fim de cada frase. Use sempre que o usuário pedir para transcrever, legendar, "ver o que eu falei" ou começar a editar um vídeo do YouTube, mesmo sem citar a palavra transcrição.
---

# Transcrição

1. Procure o vídeo em `bruto/` (mp4, mov, mkv, webm, mp3, wav). Se houver mais de um, pergunte qual. Se não houver nenhum, avise o usuário para colocar o arquivo lá.
2. Rode: `python3 .claude/skills/transcricao/scripts/transcrever.py "bruto/<arquivo>" trabalho small`
   - Usa faster-whisper, em português, no processador (grátis, sem internet depois de baixar o modelo na 1ª vez).
   - Vídeo longo/PC fraco: use modelo `base`. Mais precisão: `medium`.
3. Saídas em `trabalho/`: `transcricao.txt` (legível, `[início --> fim] frase`) e `transcricao.json` (para a skill plano-de-edicao).
4. Mostre ao usuário as primeiras linhas e a duração total, e avise que nomes próprios/termos técnicos podem sair errados.

Se faltar o faster-whisper (`pip install faster-whisper`) ou o ffmpeg, peça permissão antes de instalar.
