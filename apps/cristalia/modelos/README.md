# Modelos 3D

## brasito.glb

Brasito (raposinha de fogo) feito no Blender. Um arquivo só, 0,7 MB.

- **Malha:** 1 malha com pele (skin), 3.340 faces, 20 ossos (`RaposaFogo_Rig`).
- **Tamanho:** 0,5 m de altura, pés em y = 0. Olha para **+Z** (o padrão do `Object3D.lookAt` do Three.js).
- **Material:** PBR com cor, normal, ORM (oclusão, rugosidade e metal) e `emissiveMap` só nas partes de fogo (ponta do rabo e rachaduras das patas). Texturas 1024 em WebP (`EXT_texture_webp`).
- **Fogo pulsando:** o brilho do Blender era animado; aqui é preciso mexer no `material.emissiveIntensity` no código (ex.: `0.7 + 0.2*sin(t*8.4) + 0.1*sin(t*31)`).

### Animações (24 quadros por segundo)

| Nome | Duração | Repete? | Uso |
|---|---|---|---|
| `Brasito_Parado` | 2,0 s | sim | parado, respirando |
| `Brasito_Arrancada` | 2,5 s | não | sai de parado e acelera até o galope; o último quadro é igual ao 1º de `Brasito_Correndo` |
| `Brasito_Correndo` | 0,42 s | sim | galope |
| `Brasito_Investida` | 0,96 s | não | golpe perto; o osso `root` avança 0,8 m (ignorar se o jogo já move o monstro) |
| `Brasito_LancaChamas` | 1,21 s | não | golpe disparo (jato sai da boca) |
| `Brasito_RaboDeFogo` | 1,04 s | não | golpe área; gira 360° e o rabo cresce 1,7× |
| `Andar` | 1,0 s | sim | andar devagar |
| `Parado_Ansioso` | 2,0 s | sim | parado agitado, com pulinhos |

Carregar com `GLTFLoader` (`three/addons/loaders/GLTFLoader.js`) e tocar com `THREE.AnimationMixer`. Os golpes usam `LoopOnce` com `clampWhenFinished = true`.

### Como o jogo usa (código em `js/modelos3d.js`)

- **Quando carrega:** o jogo baixa o `.glb` antes de abrir (`carregarModelos3D` em `main.js`, no máximo 10 s). Se não chegar, usa o Brasito de formas simples. O ajudante do app (`sw.js`) guarda uma cópia, como faz com todos os arquivos do jogo, então ele funciona sem internet depois da 1ª vez.
- **Só a forma inicial:** Brasalobo, Fornalobo e Magmalobo continuam com os modelos de formas simples (`linhaFogo` em `js/modelos.js`).
- **Tamanho:** o jogo mede a altura do Brasito de formas simples e aumenta o `.glb` até ficar igual (0,5 m no arquivo → ~1,7 m no jogo).
- **Cada Brasito na tela** é uma cópia com ossos próprios (`SkeletonUtils.clone`), o próprio `AnimationMixer` e o próprio material (as texturas são divididas). Assim o piscar e o fogo de um não mexem nos outros.

| Estado do jogo | Animação | Como |
|---|---|---|
| Parado | `Brasito_Parado` | repete |
| Andando/correndo | `Brasito_Arrancada` → `Brasito_Correndo` | a arrancada toca 1 vez e emenda no galope, que repete. Depois de um golpe, volta direto para o galope |
| Golpe perto | `Brasito_Investida` | o avanço do osso `root` foi tirado (o jogo já empurra o monstro). O bote (0,22 s da animação) cai junto com o avanço do jogo |
| Golpe disparo | `Brasito_LancaChamas` | a pose do jato (0,35 s da animação) cai junto com o começo do jato |
| Golpe área | `Brasito_RaboDeFogo` | a volta da animação (de 0,12 s a 0,71 s) é acelerada para durar o mesmo que o giro do jogo (0,38 s). O jogo **não** gira o modelo de novo, e o rabo cresce pela animação |

- **Golpe do inimigo:** ele demora mais para soltar o golpe (0,55 s), então a animação espera e começa na hora certa.
- **Transições:** 0,18 s de mistura entre parado, arrancada e galope; 0,08 s para entrar num golpe.
- **Fogo pulsando:** `emissiveIntensity = 0,7 + 0,2·sin(t·8,4) + 0,1·sin(t·31)`, cada Brasito com a sua fase.
- **Piscar (dano, preparo, evolução):** como o brilho só existe nas partes de fogo, o piscar tinge e clareia a cor da pele (`piscarGLB`).
- **Para mudar:** em `js/modelos3d.js`, `ARQUIVOS.brasito`: `clips` (qual animação em cada estado), `marco` (o momento do golpe em cada animação), `giro` e `velArrancada` (1 = 2,5 s; 2 = metade do tempo).
- **Não usadas ainda:** `Andar` e `Parado_Ansioso`.
- **Para acrescentar outro modelo:** ponha o `.glb` nesta pasta e uma entrada em `ARQUIVOS` (em `js/modelos3d.js`) com o nome da espécie.

## gotinho.glb

Gotinho (gota de água) feito no Blender pelo Lâmina (`gotinho_mobile.glb`). Um arquivo só, **0,36 MB**.

- **Malha:** 1 malha com pele, 2.036 triângulos, 13 ossos (`gotinho_rig`: root, hips, spine, head, tip, braços, mãos, pernas e pés).
- **Tamanho:** 0,9 m de altura no arquivo, pés em y = 0, olha para **+Z**. O jogo aumenta até a altura do Gotinho de formas simples.
- **Material:** cor e normal (sem brilho próprio), rugosidade 0,87, sem metal.
- **Texturas:** vieram em PNG 1024 (1,8 MB); viraram **WebP** 1024 (`EXT_texture_webp`, 75 KB + 93 KB) para pesar menos no celular. A malha, os ossos e as animações ficaram iguais ao arquivo do Lâmina. Para refazer com um arquivo novo do Blender: exporte em PNG mesmo e troque as texturas por WebP com um script (Python + Pillow) ou com o `gltf-transform webp`.

### Animações

| Nome | Duração | Uso no jogo |
|---|---|---|
| `Parado` | 2,0 s | parado (repete) |
| `Andar` | 1,0 s | os passinhos antes de correr (toca 1 vez, 2,5× mais rápido = 0,4 s) |
| `Correr` | 0,5 s | andando/correndo (repete) |
| `GolpePerto` | 1,0 s | Investida. O bote sai em **0,28 s**. O avanço de 0,4 m do osso `root` foi tirado (o jogo já empurra o monstro) |
| `GolpeDisparo` | 1,21 s | Jato d'Água / Hidrocanhão. O jato sai em **0,40 s** |
| `GolpeArea` | 1,04 s | Onda / Maremoto. Ele pula e, ao cair (**0,62 s**), a onda sai |
| `LevarDano` | 0,5 s | quando leva dano (não corta um golpe que está saindo) |
| `Desmaiar` | 2,0 s | quando desmaia. Toca 1,4× mais rápido e **para deitado em 1,3 s** (no arquivo, ele levanta no fim) |

- **Novidade no código:** `tocarReacao(modelo, 'dano' | 'desmaiar')` em `js/modelos3d.js`, chamada pela batalha (`aplicarDano` e `desmaiar`). Só os modelos que têm essas animações usam; os outros continuam piscando e tombando de lado como antes.
- **Só a forma inicial:** Marolo, Marulhão e Tsunamar continuam com as formas simples (`linhaAgua` em `js/modelos.js`).
- **Para mudar:** `ARQUIVOS.gotinho` em `js/modelos3d.js` (`clips`, `marco`, `velArrancada`, `desmaioFim`, `velDesmaio`).

## ardentroco.glb

Ardentroco (3ª forma da linha do Brotobrasa) feito no Blender pelo Lâmina (`ardentronco_mobile.glb`). Um arquivo só, **1,47 MB**.

- **Malha:** 5.004 triângulos, 23 ossos (com as duas frutas da cabeça, `fruta.L` e `fruta.R`).
- **Texturas:** viraram **WebP** (`EXT_texture_webp`); a foto lado a lado (original × WebP) saiu igual. Malha, ossos e animações ficaram como no arquivo do Lâmina.
- As animações já escondem a fruta e fazem ela **crescer de novo**: no `GolpePerto` ele leva a `fruta.L` à boca; no `GolpeDisparo` arranca e joga a `fruta.R`.

### Animações

| Nome | Duração | Uso no jogo |
|---|---|---|
| `Parado` | 2,0 s | parado (repete) |
| `Andar` | 1,0 s | os passinhos antes de correr (2,5× mais rápido) |
| `Correr` | 0,5 s | andando/correndo (repete) |
| `GolpePerto` | 1,0 s | **Fruta Ardente** (bônus). Ele come a fruta em **0,6 s** |
| `GolpeDisparo` | 1,21 s | **Bombinhas de Fruta**. A fruta sai da mão em **0,55 s** |
| `GolpeArea` | 1,04 s | **Chuva de Frutas**. O giro começa em **0,3 s** |
| `LevarDano` | 0,5 s | quando leva dano |
| `Desmaiar` | 2,0 s | quando desmaia (1,4× mais rápido, para deitado em 1,3 s) |

- **Só o Ardentroco:** Brotobrasa, Chamafolha e Florinferno continuam com as formas simples.
- **Para mudar:** `ARQUIVOS.ardentroco` em `js/modelos3d.js`.
