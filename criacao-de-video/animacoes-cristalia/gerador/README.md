# Gerador dos clipes

Scripts que gravaram os vídeos desta pasta (Playwright + ffmpeg). Não fazem parte do jogo.

- `familias.js`: as animações de cada tipo de corpo (quadros-chave a 24 qps). **Para mudar um movimento, mude aqui.**
- `estudio.html`: a página que monta o monstro e desenha as duas vistas.
- `inventario.js`: lista os monstros e as peças que se mexem (gera `inventario.json`).
- `gravar.js`: grava os clipes. `lista.js`: escreve a `LISTA_DE_ANIMACOES.md`.

Como rodar (copie esta pasta para fora do repositório, ex.: uma pasta de testes):
1. Dentro de `apps/cristalia`: `python3 -m http.server 8765`.
2. Na pasta copiada: `node inventario.js ./estudio.html ./inventario.json`, depois
   `mkdir clipes && node gravar.js brasito gelatina bolinha tronco bipede passaro voador raia tartaruga` e `node lista.js`.
Precisa do `ffmpeg` e do Playwright com o Chromium.
