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
