# Cristalia (nome provisório)

Protótipo de jogo 3D low poly de caçar, capturar e batalhar com monstros.
Roda no navegador (celular ou PC), feito com JavaScript + [Three.js](https://threejs.org).

## Como jogar

- **Andar:** arraste o dedo em qualquer lugar livre da tela (joystick virtual). No PC: WASD ou setas.
- **Encontrar monstros:** encoste num monstro selvagem para começar a batalha.
- **Batalha em tempo real:**
  - 3 golpes: **perto** (avança e bate), **disparo** (tiro em linha reta) e **área** (explosão em volta).
  - **Esquiva:** um pulo rápido que deixa seu monstro invulnerável por um instante.
  - O inimigo avisa antes de atacar: uma **faixa ou círculo vermelho no chão**. Saia dele ou use a esquiva.
  - No PC: J, K e L para os golpes, Espaço para esquivar.
- **Capturar:** enfraqueça o monstro e toque em **Cristal** (tecla C). O número ao lado é a chance de captura, que sobe quando a vida do monstro está baixa.
- **Equipe:** até 3 monstros. Se a equipe estiver cheia, o capturado vai para a reserva. O botão **Equipe** organiza tudo.
- **Fonte de cura:** a fonte no centro do mapa cura todos os seus monstros.
- **Cristais extras:** brilhos azuis espalhados pelo mapa. Alguns monstros também deixam cair cristais quando são derrotados.
- O progresso é salvo automaticamente no navegador.

## Elementos

Fogo vence Planta, Planta vence Água, Água vence Fogo. Um golpe forte contra o alvo dá 1,5× de dano; um golpe fraco, 0,6×.

| Monstro | Elemento | Onde aparece |
|---|---|---|
| Brasito | Fogo | Região do vulcão (marrom) e campo |
| Vulcarapa | Fogo (raro) | Região do vulcão |
| Gotinho | Água | Em volta do lago e campo |
| Aquaraia | Água (raro) | Em volta do lago |
| Musguinho | Planta | Floresta e campo |
| Espinhal | Planta (raro) | Floresta |

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | A página: visual da interface (HUD, botões, telas) |
| `js/dados.js` | **Tabelas do jogo**: monstros, golpes, elementos e fórmulas. Para balancear, mexa aqui. |
| `js/modelos.js` | Os modelos 3D dos monstros, montados com formas simples |
| `js/mundo.js` | Mapa aberto, regiões, monstros selvagens, cristais e fonte |
| `js/batalha.js` | Batalha em tempo real: movimento, golpes, IA do inimigo e captura |
| `js/controles.js` | Joystick de toque, botões e teclado |
| `js/main.js` | Liga tudo: telas, equipe, experiência, salvamento |
| `lib/three.module.min.js` | Biblioteca Three.js 0.170 (licença MIT, em `lib/THREE-LICENSE.txt`) |

## Rodar no computador

A página precisa ser aberta por um servidor local, porque abrir o arquivo direto com dois cliques bloqueia os módulos JavaScript:

```bash
cd apps/cristalia
python -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.

## Próximos passos possíveis

- Trocar os modelos de formas simples por modelos feitos no Blender (`.glb`)
- Sons e música
- Evolução dos monstros e mais espécies
- Treinadores rivais e um chefe na cratera do vulcão
- Levar as regras (`dados.js`) para o Unreal Engine
