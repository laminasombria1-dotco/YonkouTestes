# Cristalia (nome provisório)

Protótipo de jogo 3D low poly de caçar, capturar, evoluir e batalhar com monstros.
Roda no navegador (celular ou PC), feito com JavaScript + [Three.js](https://threejs.org).

## Como jogar

- **Começar:** em "Novo jogo", escolha um dos 9 monstros iniciais (um de cada elemento). A tela mostra a linha evolutiva inteira dele.
- **Monstruário:** na tela inicial ou no botão **Monstros** durante o jogo. Mostra todas as linhas, as evoluções, os atributos, os golpes e as vantagens de cada um.
- **Andar:** arraste o dedo em qualquer lugar livre da tela (joystick virtual). No PC: WASD ou setas.
- **Encontrar monstros:** encoste num monstro selvagem para começar a batalha.
- **Batalha em tempo real:**
  - 3 golpes: **perto** (avança e bate), **disparo** (tiro em linha reta) e **área** (explosão em volta).
  - **Esquiva:** um pulo rápido que deixa seu monstro invulnerável por um instante.
  - O inimigo avisa antes de atacar: uma **faixa ou círculo vermelho no chão**. Saia dele ou use a esquiva.
  - No PC: J, K e L para os golpes, Espaço para esquivar.
- **Capturar:** enfraqueça o monstro e toque em **Cristal** (tecla C). O número ao lado é a chance de captura. Formas evoluídas são bem mais difíceis de capturar.
- **Evoluir:** cada linha tem 4 formas. A forma inicial evolui no **nível 6**, a 1ª evolução no **nível 12** e a 2ª evolução no **nível 30**. Quando seu monstro chega ao nível, aparece a animação de evolução e ele ganha atributos e golpes mais fortes.
- **Dia e noite:** um ciclo completo dura 4 minutos (2 de dia e 2 de noite). **Sol e Luz** só aparecem de dia; **Lua e Trevas**, só à noite. O relógio fica no canto superior direito.
- **Equipe:** até 3 monstros. Com a equipe cheia, o capturado vai para a reserva.
- **Fonte de cura:** a fonte no centro do mapa cura todos os seus monstros.
- **Nível dos selvagens:** acompanha o nível da sua equipe e aumenta quanto mais longe do centro você vai. Nas bordas aparecem as formas evoluídas.
- O progresso é salvo automaticamente no navegador.

## Regiões

| Região | Onde fica | Quem aparece |
|---|---|---|
| Campo | Centro | Um pouco de tudo; Sol e Luz de dia, Lua e Trevas à noite |
| Floresta | Noroeste | Planta (Musguinho), Espinhal (raro); Luz de dia, Trevas à noite |
| Lago | Sudoeste | Água (Gotinho), Aquaraia (raro); Lua à noite |
| Vulcão | Nordeste | Fogo (Brasito), Vulcarapa (raro) |
| Pedreira | Sudeste | Terra (Pedrisco) |
| Planalto da Tempestade | Extremo norte | Raio (Faisquinho), com relâmpagos |

## Linhas evolutivas

| Elemento | Nv.1 | Nv.6 | Nv.12 | Nv.30 |
|---|---|---|---|---|
| Fogo | Brasito | Brasalobo | Fornalobo | Magmalobo |
| Água | Gotinho | Marolo | Marulhão | Tsunamar |
| Planta | Musguinho | Moitão | Troncudo | Florestral |
| Terra | Pedrisco | Cascalhão | Rochedrão | Montanhar |
| Raio | Faisquinho | Choquilho | Trovolt | Tempestor |
| Sol | Solito | Solário | Solaurum | Astrorei |
| Lua | Lunico | Lunarelo | Crescêntio | Plenilúnio |
| Luz | Lumino | Lumelo | Prismal | Aurealis |
| Trevas | Breuzinho | Sombrelo | Umbrafel | Noctífero |

Raros sem evolução: Vulcarapa (fogo), Aquaraia (água), Espinhal (planta).

## Vida e dano

- A vida começa em **2,2×** o valor base da espécie e cresce **20% por nível**.
- O dano cresce **15% por nível** de quem ataca, um pouco menos que a vida. Por isso as batalhas de nível alto duram um pouco mais.
- Num confronto neutro, são necessários uns **7 disparos** no começo e uns **12** no nível 30. Vantagem e desvantagem de elemento mudam bastante esse número.
- Esses valores ficam em `dados.js`: `VIDA_BASE`, `VIDA_POR_NIVEL` e `DANO_POR_NIVEL`.

## Arenas de batalha

Cada região tem a sua arena, com raio de 22 m e obstáculos que **bloqueiam o movimento e os disparos** (dá para se esconder atrás deles). A posição dos obstáculos muda a cada batalha.

| Região | Arena | Clima | Favorece (+25% dano, +10% velocidade) | Atrapalha (−20% dano) | Perigo |
|---|---|---|---|---|---|
| Campo | Campo Aberto | Pólen | Ninguém | Ninguém | Nenhum |
| Floresta | Coração da Floresta | Vento de folhas | Planta | Água, Terra | O vento empurra quem não é Planta |
| Vulcão | Cratera do Vulcão | Brasas | Fogo | Planta | Lava queima, mas cura Fogo |
| Lago | Margem do Lago | Chuva | Água | Fogo, Terra | Poças encharcam, mas curam Água |
| Pedreira | Fundo da Pedreira | Poeira | Terra | Fogo, Raio | Pedras caem (Terra não sente) |
| Planalto | Topo da Tempestade | Relâmpagos | Raio | Água, Sol | Raios caem e paralisam (Raio não sente) |

- **Atrapalha:** o lugar enfraquece quem é fraco contra o elemento dele.
- **Pedras e raios:** um círculo no chão avisa onde vão cair.
- **Dia e noite:** de dia, Sol e Luz ganham +15%; à noite, Lua e Trevas.
- **Na tela:** os bônus aparecem embaixo da barra de vida de cada monstro, e a faixa da arena fica abaixo dos botões Cristal, Trocar e Fugir.

## Melhorias a cada evolução

Cada evolução acrescenta algo às habilidades. Os monstros selvagens evoluídos usam essas melhorias contra você também.

| Forma | O que ganha |
|---|---|
| Inicial (Nv.1) | Golpes básicos |
| 1ª evolução (Nv.6) | O **disparo** atira **2 vezes** seguidas |
| 2ª evolução (Nv.12) | A **área** passa a causar o **efeito do elemento** |
| Forma final (Nv.30) | Disparo **3 vezes**, o golpe **perto** também causa o efeito e os efeitos duram 50% mais |

Na batalha, o botão mostra "×2" ou "×3" no disparo e uma bolinha colorida nos golpes que causam efeito. Os efeitos ativos aparecem embaixo da barra de vida.

### Efeito de cada elemento

| Elemento | Efeito | O que faz | Duração |
|---|---|---|---|
| Fogo | Queimadura | Perde 4% da vida por segundo | 4 s |
| Água | Encharcado | Fica 45% mais lento | 4 s |
| Planta | Enraizado | Não consegue andar, mas ainda ataca | 1,8 s |
| Terra | Soterrado | Defesa cai 30% | 5 s |
| Raio | Paralisia | Não anda nem ataca | 1,4 s |
| Sol | Ofuscado | 40% de chance de errar os golpes | 4 s |
| Lua | Sono | Dorme até levar um golpe | 3 s |
| Luz | Exposto | Recebe 30% a mais de dano | 5 s |
| Trevas | Medo | Não consegue atacar | 2,2 s |

Dica: trocar de monstro na batalha tira os efeitos negativos de quem saiu.

## Vantagens entre elementos

Um golpe forte contra o alvo dá **1,5×** de dano; um golpe fraco, **0,6×**.

| Elemento | Forte contra |
|---|---|
| Fogo | Planta |
| Água | Fogo, Terra |
| Planta | Água, Terra |
| Terra | Fogo, Raio |
| Raio | Água, Sol |
| Sol | Lua, Trevas |
| Lua | Sol, Fogo |
| Luz | Trevas, Lua |
| Trevas | Luz, Planta |

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | A página: visual da interface (HUD, botões, telas) |
| `js/dados.js` | **Tabelas do jogo**: elementos, golpes, linhas evolutivas, níveis de evolução, onde cada monstro aparece. Para balancear, mexa aqui. |
| `js/modelos.js` | Os modelos 3D: um construtor por linha que acrescenta peças a cada evolução |
| `js/plataforma.js` | A vitrine 3D do Monstruário e a animação de evolução |
| `js/mundo.js` | Mapa aberto, regiões, dia e noite, monstros selvagens, cristais e fonte |
| `js/batalha.js` | Batalha em tempo real: movimento, golpes, efeitos, IA do inimigo e captura |
| `js/arena.js` | Arenas: chão, obstáculos, clima animado e perigos de cada região |
| `js/controles.js` | Joystick de toque, botões e teclado |
| `js/main.js` | Liga tudo: telas, equipe, experiência, evolução, salvamento |
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
- Treinadores rivais e um chefe na cratera do vulcão
- Levar as regras (`dados.js`) para o Unreal Engine
