# Animações dos monstros do Cristalia

Tem **68 monstros** no jogo. **Só o Brasito** (a primeira forma do Fogo) tem animações de verdade, feitas no Blender (8 animações). Os outros 67 se mexem **só pelo código**: o corpo inteiro sobe e desce, e algumas peças soltas (rabos, asas, coisas em órbita) balançam. Nos golpes, quem mexe é o jogo (empurra o monstro, gira, pisca).

Por isso separei os monstros em **9 tipos de corpo**. Cada tipo tem **um clipe** de referência. Onde a coluna diz *"use o clipe X"*, é aquele que já foi feito: o mesmo movimento serve, só muda o modelo.

## Os 9 clipes

| Clipe | Tipo de corpo | Exemplo no clipe | Quantos monstros usam |
|---|---|---|---|
| `01_brasito.mp4` | Quadrúpede | Brasito (.glb) | 16 |
| `02_gelatina.mp4` | Gelatina | Gotinho | 7 |
| `03_bolinha.mp4` | Bolinha com pezinhos | Solito | 11 |
| `04_tronco.mp4` | Tronco / bloco | Troncudo | 7 |
| `05_bipede.mp4` | Bípede | Plenilúnio | 9 |
| `06_passaro.mp4` | Pássaro | Trovolt | 4 |
| `07_voador.mp4` | Voador sem pernas | Prismal | 5 |
| `08_raia.mp4` | Raia | Aquaraia | 4 |
| `09_tartaruga.mp4` | Tartaruga | Vulcarapa | 5 |

Cada clipe mostra, um depois do outro: **Parado, Andar, Correr, Golpe perto, Golpe disparo, Golpe área, Levar dano e Desmaiar**. (O do Brasito mostra as 8 animações que já existem no arquivo.)

**Como ler o clipe:** à esquerda a vista 3/4, à direita a vista de lado (frente para a direita). Embaixo: o nome do movimento, o **quadro** (24 por segundo, igual ao Brasito) e a linha do tempo. Os **risquinhos amarelos** são os quadros-chave (keyframes). A **bolinha vermelha** é o quadro em que o golpe "sai" (no jogo, é aí que o dano acontece). A bolinha amarela que voa é o disparo, e o anel amarelo no chão é o golpe de área.

## Todos os monstros

| # | Monstro | Linha | Forma | Tipo de corpo | Animação hoje no jogo | O que fazer no Blender |
|---|---|---|---|---|---|---|
| 1 | **Brasito** | Fogo | 1ª | Quadrúpede | **Já tem 8 animações do Blender** (`brasito.glb`): Parado, Parado_Ansioso, Andar, Arrancada, Correndo, Investida, LançaChamas, Rabo de Fogo | Nada: já está pronto |
| 2 | **Brasalobo** | Fogo | 2ª | Quadrúpede | sobe e desce ao andar, 2 rabos balançam | Use o clipe `01_brasito.mp4` |
| 3 | **Fornalobo** | Fogo | 3ª | Quadrúpede | sobe e desce ao andar, 3 rabos balançam | Use o clipe `01_brasito.mp4` |
| 4 | **Magmalobo** | Fogo | 4ª | Quadrúpede | sobe e desce ao andar, 3 rabos balançam | Use o clipe `01_brasito.mp4` |
| 5 | **Gotinho** | Água | 1ª | Gelatina | estica e achata (gelatina) | Use o clipe `02_gelatina.mp4` |
| 6 | **Marolo** | Água | 2ª | Gelatina | estica e achata (gelatina) | Use o clipe `02_gelatina.mp4` |
| 7 | **Marulhão** | Água | 3ª | Gelatina | estica e achata (gelatina), 5 peças em órbita | Use o clipe `02_gelatina.mp4` |
| 8 | **Tsunamar** | Água | 4ª | Gelatina | estica e achata (gelatina), 5 peças em órbita, 1 peça pulsa | Use o clipe `02_gelatina.mp4` |
| 9 | **Musguinho** | Planta | 1ª | Tronco / bloco | sobe e desce ao andar | Use o clipe `04_tronco.mp4` |
| 10 | **Moitão** | Planta | 2ª | Tronco / bloco | sobe e desce ao andar | Use o clipe `04_tronco.mp4` |
| 11 | **Troncudo** | Planta | 3ª | Tronco / bloco | sobe e desce ao andar | Use o clipe `04_tronco.mp4` |
| 12 | **Florestral** | Planta | 4ª | Tronco / bloco | sobe e desce ao andar, 3 peças pulsam | Use o clipe `04_tronco.mp4` |
| 13 | **Pedrisco** | Terra | 1ª | Bolinha com pezinhos | sobe e desce ao andar | Use o clipe `03_bolinha.mp4` — pedra com pés quadrados |
| 14 | **Cascalhão** | Terra | 2ª | Bípede | sobe e desce ao andar | Use o clipe `05_bipede.mp4` |
| 15 | **Rochedrão** | Terra | 3ª | Bípede | sobe e desce ao andar | Use o clipe `05_bipede.mp4` |
| 16 | **Montanhar** | Terra | 4ª | Bípede | sobe e desce ao andar | Use o clipe `05_bipede.mp4` |
| 17 | **Faisquinho** | Raio | 1ª | Pássaro | sobe e desce ao andar | Use o clipe `06_passaro.mp4` |
| 18 | **Choquilho** | Raio | 2ª | Pássaro | sobe e desce ao andar | Use o clipe `06_passaro.mp4` |
| 19 | **Trovolt** | Raio | 3ª | Pássaro | flutua subindo e descendo, 2 asas batem | Use o clipe `06_passaro.mp4` |
| 20 | **Tempestor** | Raio | 4ª | Pássaro | flutua subindo e descendo, 2 asas batem, 4 peças em órbita | Use o clipe `06_passaro.mp4` |
| 21 | **Solito** | Sol | 1ª | Bolinha com pezinhos | sobe e desce ao andar, 1 peça gira | Use o clipe `03_bolinha.mp4` |
| 22 | **Solário** | Sol | 2ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 1 peça gira, 1 peça pulsa | Use o clipe `01_brasito.mp4` |
| 23 | **Solaurum** | Sol | 3ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 2 peças giram, 1 peça pulsa | Use o clipe `01_brasito.mp4` |
| 24 | **Astrorei** | Sol | 4ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 2 peças giram, 1 peça pulsa | Use o clipe `01_brasito.mp4` |
| 25 | **Lunico** | Lua | 1ª | Bolinha com pezinhos | sobe e desce ao andar | Use o clipe `03_bolinha.mp4` |
| 26 | **Lunarelo** | Lua | 2ª | Bolinha com pezinhos | sobe e desce ao andar | Use o clipe `03_bolinha.mp4` |
| 27 | **Crescêntio** | Lua | 3ª | Bípede | sobe e desce ao andar | Use o clipe `05_bipede.mp4` |
| 28 | **Plenilúnio** | Lua | 4ª | Bípede | flutua subindo e descendo, 1 peça pulsa | Use o clipe `05_bipede.mp4` — já tem pernas e braços que andam no código |
| 29 | **Lumino** | Luz | 1ª | Voador sem pernas | flutua subindo e descendo, 2 asas batem, 1 peça pulsa | Use o clipe `07_voador.mp4` |
| 30 | **Lumelo** | Luz | 2ª | Voador sem pernas | flutua subindo e descendo, 4 asas batem, 1 peça pulsa | Use o clipe `07_voador.mp4` |
| 31 | **Prismal** | Luz | 3ª | Voador sem pernas | flutua subindo e descendo, 2 asas batem, 3 peças em órbita | Use o clipe `07_voador.mp4` |
| 32 | **Aurealis** | Luz | 4ª | Voador sem pernas | flutua subindo e descendo, 6 asas batem, 4 peças em órbita | Use o clipe `07_voador.mp4` |
| 33 | **Breuzinho** | Trevas | 1ª | Voador sem pernas | flutua subindo e descendo | Use o clipe `07_voador.mp4` — bola que flutua |
| 34 | **Sombrelo** | Trevas | 2ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança | Use o clipe `01_brasito.mp4` |
| 35 | **Umbrafel** | Trevas | 3ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 3 fumaças sobem | Use o clipe `01_brasito.mp4` |
| 36 | **Noctífero** | Trevas | 4ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 2 asas batem, 5 fumaças sobem | Use o clipe `01_brasito.mp4` |
| 37 | **Brotobrasa** | Fogo + Planta | 1ª | Bolinha com pezinhos | sobe e desce ao andar, 1 peça pulsa | Use o clipe `03_bolinha.mp4` |
| 38 | **Chamafolha** | Fogo + Planta | 2ª | Bolinha com pezinhos | sobe e desce ao andar, 4 peças pulsam | Use o clipe `03_bolinha.mp4` |
| 39 | **Ardentroco** | Fogo + Planta | 3ª | Tronco / bloco | sobe e desce ao andar, 5 peças pulsam | Use o clipe `04_tronco.mp4` |
| 40 | **Florinferno** | Fogo + Planta | 4ª | Tronco / bloco | sobe e desce ao andar, 4 peças em órbita, 8 peças pulsam | Use o clipe `04_tronco.mp4` |
| 41 | **Vaporito** | Água + Fogo | 1ª | Gelatina | estica e achata (gelatina), 1 peça pulsa, 1 fumaça sobe | Use o clipe `02_gelatina.mp4` — golpe área especial: **esconde no casco** |
| 42 | **Fumarolo** | Água + Fogo | 2ª | Gelatina | estica e achata (gelatina), 1 peça pulsa, 3 fumaças sobem | Use o clipe `02_gelatina.mp4` |
| 43 | **Gêiserão** | Água + Fogo | 3ª | Tartaruga | sobe e desce ao andar, 1 peça pulsa, 3 fumaças sobem | Use o clipe `09_tartaruga.mp4` — casco com gêiser em cima |
| 44 | **Caldeirax** | Água + Fogo | 4ª | Gelatina | estica e achata (gelatina), 5 peças em órbita, 1 peça pulsa, 7 fumaças sobem | Use o clipe `02_gelatina.mp4` — tem perninhas: pode usar o pulinho da gelatina |
| 45 | **Imanito** | Terra + Raio | 1ª | Bolinha com pezinhos | sobe e desce ao andar | Use o clipe `03_bolinha.mp4` |
| 46 | **Magnetito** | Terra + Raio | 2ª | Bolinha com pezinhos | sobe e desce ao andar, 3 peças em órbita | Use o clipe `03_bolinha.mp4` |
| 47 | **Ferrovolt** | Terra + Raio | 3ª | Bípede | sobe e desce ao andar, 3 peças em órbita | Use o clipe `05_bipede.mp4` |
| 48 | **Titanvolt** | Terra + Raio | 4ª | Bípede | sobe e desce ao andar, 6 peças em órbita | Use o clipe `05_bipede.mp4` |
| 49 | **Vulcarapa** | Raro (Fogo) | 1ª | Tartaruga | sobe e desce ao andar, 1 fumaça sobe | Use o clipe `09_tartaruga.mp4` |
| 50 | **Basaltuga** | Raro (Fogo) | 2ª | Tartaruga | sobe e desce ao andar, 1 fumaça sobe | Use o clipe `09_tartaruga.mp4` |
| 51 | **Crateruga** | Raro (Fogo) | 3ª | Tartaruga | sobe e desce ao andar, 1 fumaça sobe | Use o clipe `09_tartaruga.mp4` |
| 52 | **Colossarapa** | Raro (Fogo) | 4ª | Tartaruga | sobe e desce ao andar, 3 peças em órbita, 1 fumaça sobe | Use o clipe `09_tartaruga.mp4` |
| 53 | **Aquaraia** | Raro (Água) | 1ª | Raia | flutua subindo e descendo | Use o clipe `08_raia.mp4` — golpes especiais: rasante e mergulho (o código já move) |
| 54 | **Ventaraia** | Raro (Água) | 2ª | Raia | flutua subindo e descendo, 2 asas batem | Use o clipe `08_raia.mp4` |
| 55 | **Mantaré** | Raro (Água) | 3ª | Raia | flutua subindo e descendo, 2 asas batem, 3 peças em órbita | Use o clipe `08_raia.mp4` |
| 56 | **Leviaraia** | Raro (Água) | 4ª | Raia | flutua subindo e descendo, 2 asas batem, 4 peças em órbita, 1 peça pulsa | Use o clipe `08_raia.mp4` |
| 57 | **Espinhal** | Raro (Planta) | 1ª | Bolinha com pezinhos | sobe e desce ao andar | Use o clipe `03_bolinha.mp4` — golpe perto especial: **rola** como bola (o código já gira) |
| 58 | **Cactouriço** | Raro (Planta) | 2ª | Bolinha com pezinhos | sobe e desce ao andar | Use o clipe `03_bolinha.mp4` |
| 59 | **Espinhaço** | Raro (Planta) | 3ª | Bolinha com pezinhos | sobe e desce ao andar | Use o clipe `03_bolinha.mp4` |
| 60 | **Mandacarão** | Raro (Planta) | 4ª | Tronco / bloco | sobe e desce ao andar, 4 peças em órbita, 1 peça pulsa | Use o clipe `04_tronco.mp4` — na luta, a flor abre (o código já faz) |
| 61 | **Ignárion** | Lendário (Ígneo) | 1ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 2 asas batem, 1 peça pulsa | Use o clipe `01_brasito.mp4` — + fazer as **asas batendo** (o clipe não tem asas) |
| 62 | **Pirárion** | Lendário (Ígneo) | 2ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 2 asas batem, 4 peças pulsam | Use o clipe `01_brasito.mp4` — + asas batendo; pescoço longo |
| 63 | **Magmárion** | Lendário (Ígneo) | 3ª | Bípede | pernas e braços andam, 1 rabo balança, 2 asas batem, 2 peças em órbita | Use o clipe `05_bipede.mp4` — já tem pernas e braços que andam no código |
| 64 | **Infernárion** | Lendário (Ígneo) | 4ª | Bípede | pernas e braços andam, 1 rabo balança, 2 asas batem, 6 peças pulsam | Use o clipe `05_bipede.mp4` — já tem pernas e braços que andam no código; + asas |
| 65 | **Silvárion** | Lendário (Silvestre) | 1ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 2 peças pulsam | Use o clipe `01_brasito.mp4` — cervo: pernas mais compridas que o Brasito |
| 66 | **Bosquárion** | Lendário (Silvestre) | 2ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 5 peças em órbita, 6 peças pulsam | Use o clipe `01_brasito.mp4` |
| 67 | **Raizárion** | Lendário (Silvestre) | 3ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 6 peças em órbita, 6 peças pulsam | Use o clipe `01_brasito.mp4` |
| 68 | **Ancestrárion** | Lendário (Silvestre) | 4ª | Quadrúpede | sobe e desce ao andar, 1 rabo balança, 1 peça gira, 8 peças em órbita, 1 peça pulsa | Use o clipe `01_brasito.mp4` |

## Tabelas de quadros-chave (para copiar no Blender)

Cada linha é um **canal** (o que mexe) e cada par é `quadro: valor`. Faça no **objeto inteiro** (ou no osso raiz, `root`), com a interpolação **Bézier** (a padrão do Blender).

- **px, py, pz** = posição em metros (pz positivo = para a frente, py = para cima). Medidas para um monstro de ~1,6 m; para os maiores, aumente na mesma proporção.
- **rx, ry, rz** = giro em graus (rx positivo = inclina para a frente; ry = vira; rz = tomba de lado). **Atenção:** no Blender o "para cima" é o Z, então o **py daqui é o Z de lá**, e o pz daqui é o -Y de lá.
- **sx, sy, sz** = escala (1 = normal; sy é a altura).
- **pernas / braços** (só bípede) = giro das pernas e braços em graus, para trás positivo. `pernas` e `bracos` alternam (uma vai, a outra volta); `pernas2` e `bracos2` mexem as duas juntas; `bD` = braço direito, `bE` = braço esquerdo.
- **Golpe sai** = o quadro do dano. Se repete (loop), o último quadro é igual ao primeiro.

### Gelatina (pula, estica e achata) — `02_gelatina.mp4`

**Parado** — 48 quadros (2,00 s), repete

- `sy`: 0: 1 · 24: 1.06 · 48: 1
- `sx`: 0: 1 · 24: 0.97 · 48: 1
- `sz`: 0: 1 · 24: 0.97 · 48: 1

**Andar (pulinhos)** — 24 quadros (1,00 s), repete

- `py`: 0: 0 · 6: 0.28 · 12: 0 · 18: 0.28 · 24: 0
- `sy`: 0: 0.85 · 3: 1.15 · 6: 1.05 · 10: 1.08 · 12: 0.85 · 15: 1.15 · 18: 1.05 · 22: 1.08 · 24: 0.85
- `sx`: 0: 1.12 · 3: 0.92 · 12: 1.12 · 15: 0.92 · 24: 1.12
- `sz`: 0: 1.12 · 3: 0.92 · 12: 1.12 · 15: 0.92 · 24: 1.12

**Correr** — 12 quadros (0,50 s), repete

- `py`: 0: 0 · 6: 0.5 · 12: 0
- `rx`: 0: 12 · 12: 12
- `sy`: 0: 0.8 · 2: 1.22 · 6: 1 · 10: 1.1 · 12: 0.8
- `sx`: 0: 1.18 · 2: 0.9 · 12: 1.18
- `sz`: 0: 1.18 · 2: 0.9 · 12: 1.18

**Golpe perto (investida)** — 24 quadros (1,00 s), golpe sai no quadro 9

- `pz`: 0: 0 · 6: -0.15 · 9: 0.45 · 12: 0.4 · 24: 0
- `rx`: 0: 0 · 6: -12 · 9: 18 · 14: 6 · 24: 0
- `sy`: 0: 1 · 6: 0.72 · 9: 0.85 · 12: 1.1 · 24: 1
- `sz`: 0: 1 · 6: 1.1 · 9: 1.4 · 12: 0.72 · 18: 1.05 · 24: 1
- `sx`: 0: 1 · 6: 1.2 · 9: 0.85 · 12: 1.25 · 24: 1

**Golpe disparo (cuspida)** — 29 quadros (1,21 s), golpe sai no quadro 11

- `pz`: 0: 0 · 8: -0.12 · 11: 0.1 · 16: 0 · 29: 0
- `rx`: 0: 0 · 8: -16 · 11: 12 · 16: -4 · 29: 0
- `sy`: 0: 1 · 8: 1.12 · 11: 0.88 · 16: 1.03 · 29: 1
- `sz`: 0: 1 · 8: 0.92 · 11: 1.22 · 16: 1 · 29: 1

**Golpe área (pula e esparrama)** — 25 quadros (1,04 s), golpe sai no quadro 16

- `py`: 0: 0 · 5: 0 · 10: 0.65 · 16: 0 · 25: 0
- `ry`: 0: 0 · 6: 0 · 16: 360 · 25: 360
- `sy`: 0: 1 · 5: 0.7 · 8: 1.25 · 14: 1 · 16: 0.6 · 20: 1.1 · 25: 1
- `sx`: 0: 1 · 5: 1.2 · 8: 0.88 · 16: 1.35 · 20: 0.95 · 25: 1
- `sz`: 0: 1 · 5: 1.2 · 8: 0.88 · 16: 1.35 · 20: 0.95 · 25: 1

**Levar dano** — 12 quadros (0,50 s)

- `pz`: 0: 0 · 2: -0.25 · 12: 0
- `rx`: 0: 0 · 2: -20 · 6: 8 · 12: 0
- `sy`: 0: 1 · 2: 0.8 · 6: 1.05 · 12: 1
- `sx`: 0: 1 · 2: 1.2 · 6: 0.95 · 12: 1

**Desmaiar (derrete)** — 48 quadros (2,00 s)

- `sy`: 0: 1 · 6: 1.12 · 20: 0.42 · 32: 0.32 · 48: 0.32
- `sx`: 0: 1 · 6: 0.92 · 20: 1.4 · 32: 1.5 · 48: 1.5
- `sz`: 0: 1 · 6: 0.92 · 20: 1.4 · 32: 1.5 · 48: 1.5

### Bolinha com pezinhos (bamboleia) — `03_bolinha.mp4`

**Parado** — 48 quadros (2,00 s), repete

- `sy`: 0: 1 · 24: 1.04 · 48: 1
- `rz`: 0: -2 · 24: 2 · 48: -2

**Andar (bamboleando)** — 24 quadros (1,00 s), repete

- `rz`: 0: -9 · 12: 9 · 24: -9
- `py`: 0: 0 · 6: 0.12 · 12: 0 · 18: 0.12 · 24: 0
- `rx`: 0: 4 · 24: 4

**Correr** — 12 quadros (0,50 s), repete

- `rz`: 0: -7 · 6: 7 · 12: -7
- `py`: 0: 0 · 3: 0.22 · 6: 0 · 9: 0.22 · 12: 0
- `rx`: 0: 14 · 12: 14

**Golpe perto (cabeçada)** — 24 quadros (1,00 s), golpe sai no quadro 10

- `pz`: 0: 0 · 7: -0.18 · 10: 0.45 · 14: 0.35 · 24: 0
- `rx`: 0: 0 · 7: -18 · 10: 28 · 14: 20 · 24: 0
- `sy`: 0: 1 · 7: 0.85 · 10: 1.08 · 24: 1

**Golpe disparo** — 29 quadros (1,21 s), golpe sai no quadro 11

- `rx`: 0: 0 · 8: -14 · 11: 10 · 16: -3 · 29: 0
- `pz`: 0: 0 · 8: -0.1 · 11: 0.08 · 29: 0
- `sy`: 0: 1 · 8: 1.1 · 11: 0.92 · 16: 1 · 29: 1

**Golpe área (pião)** — 25 quadros (1,04 s), golpe sai no quadro 16

- `py`: 0: 0 · 4: 0 · 8: 0.35 · 16: 0 · 25: 0
- `ry`: 0: 0 · 4: 0 · 16: 720 · 25: 720
- `sy`: 0: 1 · 4: 0.8 · 8: 1.1 · 16: 0.78 · 20: 1.05 · 25: 1

**Levar dano** — 12 quadros (0,50 s)

- `pz`: 0: 0 · 2: -0.25 · 12: 0
- `rz`: 0: 0 · 2: -18 · 6: 8 · 12: 0
- `rx`: 0: 0 · 2: -12 · 12: 0

**Desmaiar (tomba de lado)** — 48 quadros (2,00 s)

- `rz`: 0: 0 · 6: -8 · 20: 92 · 24: 84 · 28: 90 · 48: 90
- `py`: 0: 0 · 6: 0.1 · 20: 0 · 48: 0

### Tronco / bloco (duro, balança) — `04_tronco.mp4`

**Parado** — 48 quadros (2,00 s), repete

- `rz`: 0: -3 · 24: 3 · 48: -3
- `ry`: 0: -4 · 24: 4 · 48: -4

**Andar (gingando)** — 24 quadros (1,00 s), repete

- `rz`: 0: -10 · 12: 10 · 24: -10
- `ry`: 0: 8 · 12: -8 · 24: 8
- `py`: 0: 0 · 6: 0.1 · 12: 0 · 18: 0.1 · 24: 0

**Correr** — 12 quadros (0,50 s), repete

- `rz`: 0: -12 · 6: 12 · 12: -12
- `py`: 0: 0 · 3: 0.16 · 6: 0 · 9: 0.16 · 12: 0
- `rx`: 0: 10 · 12: 10

**Golpe perto (pancada)** — 24 quadros (1,00 s), golpe sai no quadro 12

- `rx`: 0: 0 · 8: -12 · 12: 34 · 16: 30 · 24: 0
- `pz`: 0: 0 · 8: -0.1 · 12: 0.3 · 24: 0

**Golpe disparo (sacode e lança)** — 29 quadros (1,21 s), golpe sai no quadro 11

- `ry`: 0: 0 · 8: -24 · 11: 16 · 15: -6 · 20: 2 · 29: 0
- `rx`: 0: 0 · 8: -8 · 11: 10 · 29: 0

**Golpe área (gira e pisa)** — 25 quadros (1,04 s), golpe sai no quadro 18

- `ry`: 0: 0 · 4: 0 · 18: 360 · 25: 360
- `py`: 0: 0 · 4: 0 · 10: 0.3 · 18: 0 · 25: 0
- `sy`: 0: 1 · 4: 0.9 · 10: 1.05 · 18: 0.85 · 22: 1.03 · 25: 1

**Levar dano** — 12 quadros (0,50 s)

- `rx`: 0: 0 · 2: -16 · 5: 6 · 8: -3 · 12: 0
- `pz`: 0: 0 · 2: -0.18 · 12: 0

**Desmaiar (cai como madeira)** — 48 quadros (2,00 s)

- `rx`: 0: 0 · 8: 6 · 24: -90 · 28: -82 · 32: -90 · 48: -90

### Bípede (anda em pé, com braços) — `05_bipede.mp4`

**Parado** — 48 quadros (2,00 s), repete

- `sy`: 0: 1 · 24: 1.03 · 48: 1
- `bracos`: 0: 4 · 24: 10 · 48: 4

**Andar** — 24 quadros (1,00 s), repete

- `pernas`: 0: 30 · 12: -30 · 24: 30
- `bracos`: 0: -25 · 12: 25 · 24: -25
- `py`: 0: 0 · 6: 0.06 · 12: 0 · 18: 0.06 · 24: 0
- `rz`: 0: -3 · 12: 3 · 24: -3

**Correr** — 12 quadros (0,50 s), repete

- `pernas`: 0: 55 · 6: -55 · 12: 55
- `bracos`: 0: -45 · 6: 45 · 12: -45
- `py`: 0: 0 · 3: 0.14 · 6: 0 · 9: 0.14 · 12: 0
- `rx`: 0: 12 · 12: 12

**Golpe perto (soco)** — 24 quadros (1,00 s), golpe sai no quadro 11

- `ry`: 0: 0 · 8: -22 · 11: 20 · 16: 14 · 24: 0
- `bD`: 0: 0 · 8: 60 · 11: -110 · 16: -100 · 24: 0
- `bE`: 0: 0 · 8: -20 · 11: 30 · 24: 0
- `pz`: 0: 0 · 8: -0.1 · 11: 0.3 · 24: 0
- `rx`: 0: 0 · 11: 10 · 24: 0

**Golpe disparo (empurra com as mãos)** — 29 quadros (1,21 s), golpe sai no quadro 11

- `bracos2`: 0: 0 · 8: 45 · 11: -90 · 18: -85 · 29: 0
- `rx`: 0: 0 · 8: -10 · 11: 8 · 29: 0
- `pz`: 0: 0 · 8: -0.08 · 11: 0.06 · 29: 0

**Golpe área (pula e bate no chão)** — 25 quadros (1,04 s), golpe sai no quadro 16

- `py`: 0: 0 · 5: 0 · 11: 0.7 · 16: 0 · 25: 0
- `sy`: 0: 1 · 5: 0.85 · 11: 1.05 · 16: 0.82 · 21: 1.02 · 25: 1
- `bracos2`: 0: 0 · 5: 30 · 11: -160 · 16: -50 · 25: 0
- `pernas2`: 0: 0 · 5: 25 · 11: -10 · 16: 25 · 25: 0

**Levar dano** — 12 quadros (0,50 s)

- `rx`: 0: 0 · 2: -18 · 6: 6 · 12: 0
- `pz`: 0: 0 · 2: -0.2 · 12: 0
- `bracos2`: 0: 0 · 2: 35 · 12: 0

**Desmaiar (cai de costas)** — 48 quadros (2,00 s)

- `rx`: 0: 0 · 8: 8 · 26: -88 · 30: -80 · 34: -88 · 48: -88
- `bracos2`: 0: 0 · 8: -20 · 26: -150 · 48: -150
- `py`: 0: 0 · 26: 0.15 · 48: 0.15

### Pássaro (2 patinhas e asas) — `06_passaro.mp4`

**Parado (bicando o ar)** — 48 quadros (2,00 s), repete

- `rx`: 0: 0 · 18: 0 · 22: 18 · 26: 0 · 48: 0
- `py`: 0: 0 · 48: 0

**Andar (pulinhos)** — 24 quadros (1,00 s), repete

- `py`: 0: 0 · 3: 0.12 · 6: 0 · 9: 0.12 · 12: 0 · 15: 0.12 · 18: 0 · 21: 0.12 · 24: 0
- `rz`: 0: -5 · 12: 5 · 24: -5
- `rx`: 0: 6 · 24: 6

**Correr (asas abertas)** — 12 quadros (0,50 s), repete

- `py`: 0: 0 · 3: 0.25 · 6: 0 · 9: 0.25 · 12: 0
- `rx`: 0: 22 · 12: 22

**Golpe perto (bicada)** — 24 quadros (1,00 s), golpe sai no quadro 10

- `rx`: 0: 0 · 6: -16 · 10: 42 · 14: 30 · 24: 0
- `pz`: 0: 0 · 6: -0.12 · 10: 0.38 · 24: 0

**Golpe disparo (enche o peito)** — 29 quadros (1,21 s), golpe sai no quadro 11

- `rx`: 0: 0 · 8: -20 · 11: 15 · 16: 0 · 29: 0
- `sy`: 0: 1 · 8: 1.12 · 11: 0.92 · 16: 1 · 29: 1
- `sz`: 0: 1 · 8: 0.95 · 11: 1.15 · 16: 1 · 29: 1

**Golpe área (sobe girando e desce)** — 25 quadros (1,04 s), golpe sai no quadro 18

- `py`: 0: 0 · 3: 0 · 11: 0.85 · 18: 0 · 25: 0
- `ry`: 0: 0 · 3: 0 · 18: 360 · 25: 360
- `sy`: 0: 1 · 3: 0.82 · 11: 1.05 · 18: 0.85 · 25: 1

**Levar dano** — 12 quadros (0,50 s)

- `rx`: 0: 0 · 2: -22 · 6: 8 · 12: 0
- `pz`: 0: 0 · 2: -0.22 · 12: 0
- `py`: 0: 0 · 2: 0.1 · 12: 0

**Desmaiar (tomba de lado)** — 48 quadros (2,00 s)

- `rz`: 0: 0 · 6: -10 · 20: 88 · 24: 80 · 28: 88 · 48: 88
- `py`: 0: 0 · 6: 0.15 · 20: 0 · 48: 0

### Voador sem pernas (flutua) — `07_voador.mp4`

**Parado (flutuando)** — 48 quadros (2,00 s), repete

- `py`: 0: 0.15 · 24: 0.35 · 48: 0.15
- `ry`: 0: -10 · 24: 10 · 48: -10
- `rz`: 0: -4 · 24: 4 · 48: -4

**Andar (voando devagar)** — 24 quadros (1,00 s), repete

- `py`: 0: 0.2 · 12: 0.35 · 24: 0.2
- `rx`: 0: 15 · 24: 15
- `rz`: 0: -5 · 12: 5 · 24: -5

**Correr (voo rápido)** — 12 quadros (0,50 s), repete

- `py`: 0: 0.2 · 6: 0.3 · 12: 0.2
- `rx`: 0: 30 · 12: 30

**Golpe perto (rasante)** — 24 quadros (1,00 s), golpe sai no quadro 10

- `py`: 0: 0.25 · 6: 0.45 · 10: 0.1 · 24: 0.25
- `rx`: 0: 0 · 6: -15 · 10: 35 · 16: 15 · 24: 0
- `pz`: 0: 0 · 6: -0.2 · 10: 0.6 · 24: 0

**Golpe disparo (contrai e brilha)** — 29 quadros (1,21 s), golpe sai no quadro 11

- `py`: 0: 0.25 · 29: 0.25
- `sx`: 0: 1 · 8: 0.82 · 11: 1.22 · 16: 0.97 · 29: 1
- `sy`: 0: 1 · 8: 0.82 · 11: 1.22 · 16: 0.97 · 29: 1
- `sz`: 0: 1 · 8: 0.82 · 11: 1.22 · 16: 0.97 · 29: 1
- `pz`: 0: 0 · 8: -0.1 · 11: 0.05 · 29: 0

**Golpe área (gira rápido)** — 25 quadros (1,04 s), golpe sai no quadro 20

- `py`: 0: 0.25 · 4: 0.25 · 12: 0.55 · 20: 0.25 · 25: 0.25
- `ry`: 0: 0 · 4: 0 · 20: 720 · 25: 720
- `sx`: 0: 1 · 12: 1.15 · 20: 1 · 25: 1
- `sy`: 0: 1 · 12: 1.15 · 20: 1 · 25: 1
- `sz`: 0: 1 · 12: 1.15 · 20: 1 · 25: 1

**Levar dano** — 12 quadros (0,50 s)

- `py`: 0: 0.25 · 12: 0.25
- `rz`: 0: 0 · 2: 25 · 5: -12 · 8: 5 · 12: 0
- `pz`: 0: 0 · 2: -0.25 · 12: 0

**Desmaiar (cai do ar)** — 48 quadros (2,00 s)

- `py`: 0: 0.25 · 6: 0.4 · 20: chão · 24: chão · 28: chão · 48: chão
- `rz`: 0: 0 · 20: 70 · 48: 70

### Raia (plana sobre o chão) — `08_raia.mp4`

**Parado (planando)** — 48 quadros (2,00 s), repete

- `py`: 0: 0.2 · 24: 0.35 · 48: 0.2
- `rx`: 0: -5 · 24: 5 · 48: -5
- `rz`: 0: -6 · 24: 6 · 48: -6

**Andar (bate as asas)** — 24 quadros (1,00 s), repete

- `py`: 0: 0.25 · 12: 0.4 · 24: 0.25
- `rz`: 0: -12 · 12: 12 · 24: -12
- `sy`: 0: 1 · 6: 0.85 · 12: 1 · 18: 0.85 · 24: 1

**Correr** — 12 quadros (0,50 s), repete

- `py`: 0: 0.25 · 6: 0.35 · 12: 0.25
- `rz`: 0: -14 · 6: 14 · 12: -14
- `rx`: 0: 12 · 12: 12

**Golpe perto (rasante)** — 24 quadros (1,00 s), golpe sai no quadro 10

- `py`: 0: 0.3 · 6: 0.7 · 10: 0.05 · 24: 0.3
- `rx`: 0: 0 · 6: -22 · 10: 25 · 24: 0
- `pz`: 0: 0 · 6: -0.2 · 10: 0.8 · 24: 0

**Golpe disparo (empina e atira)** — 29 quadros (1,21 s), golpe sai no quadro 11

- `py`: 0: 0.3 · 29: 0.3
- `rx`: 0: 0 · 8: -28 · 11: 10 · 18: -3 · 29: 0

**Golpe área (volta inclinada)** — 25 quadros (1,04 s), golpe sai no quadro 20

- `py`: 0: 0.3 · 12: 0.6 · 20: 0.3 · 25: 0.3
- `ry`: 0: 0 · 4: 0 · 20: 360 · 25: 360
- `rz`: 0: 0 · 4: 0 · 10: 40 · 16: 40 · 20: 0 · 25: 0

**Levar dano** — 12 quadros (0,50 s)

- `py`: 0: 0.3 · 12: 0.3
- `rz`: 0: 0 · 2: -28 · 6: 10 · 12: 0
- `pz`: 0: 0 · 2: -0.25 · 12: 0

**Desmaiar (pousa e achata)** — 48 quadros (2,00 s)

- `py`: 0: 0.3 · 20: chão · 48: chão
- `rz`: 0: 0 · 8: 15 · 20: 0 · 48: 0
- `sy`: 0: 1 · 20: 0.6 · 48: 0.6

### Tartaruga (pesada, lenta) — `09_tartaruga.mp4`

**Parado (respira)** — 48 quadros (2,00 s), repete

- `sy`: 0: 1 · 24: 1.03 · 48: 1
- `ry`: 0: -3 · 24: 3 · 48: -3

**Andar (devagar)** — 32 quadros (1,33 s), repete

- `rz`: 0: -4 · 16: 4 · 32: -4
- `py`: 0: 0 · 8: 0.03 · 16: 0 · 24: 0.03 · 32: 0
- `ry`: 0: 3 · 16: -3 · 32: 3

**Correr (o mais rápido que dá)** — 16 quadros (0,67 s), repete

- `rz`: 0: -6 · 8: 6 · 16: -6
- `py`: 0: 0 · 4: 0.06 · 8: 0 · 12: 0.06 · 16: 0
- `rx`: 0: 6 · 16: 6

**Golpe perto (empurra com o casco)** — 24 quadros (1,00 s), golpe sai no quadro 12

- `pz`: 0: 0 · 8: -0.15 · 12: 0.45 · 16: 0.38 · 24: 0
- `sy`: 0: 1 · 8: 0.92 · 12: 1.04 · 24: 1
- `rx`: 0: 0 · 8: -4 · 12: 8 · 24: 0

**Golpe disparo (o vulcão atira)** — 29 quadros (1,21 s), golpe sai no quadro 10

- `sy`: 0: 1 · 6: 0.85 · 10: 1.15 · 13: 0.95 · 18: 1 · 29: 1
- `py`: 0: 0 · 10: 0.05 · 18: 0 · 29: 0
- `rx`: 0: 0 · 6: -6 · 10: 4 · 29: 0

**Golpe área (levanta e finca)** — 25 quadros (1,04 s), golpe sai no quadro 12

- `py`: 0: 0 · 7: 0.22 · 12: -0.04 · 18: 0 · 25: 0
- `sy`: 0: 1 · 7: 1.05 · 12: 0.8 · 18: 1.03 · 25: 1
- `rx`: 0: 0 · 7: -10 · 12: 4 · 25: 0

**Levar dano** — 12 quadros (0,50 s)

- `rz`: 0: 0 · 2: -8 · 5: 6 · 8: -3 · 12: 0
- `pz`: 0: 0 · 2: -0.12 · 12: 0

**Desmaiar (se encolhe no casco)** — 48 quadros (2,00 s)

- `sy`: 0: 1 · 8: 1.04 · 24: 0.72 · 48: 0.72
- `py`: 0: 0 · 24: -0.08 · 48: -0.08
- `rz`: 0: 0 · 24: 18 · 48: 18

## Dicas para fazer no Blender

1. **Um tipo de corpo de cada vez.** Comece pela Gelatina (só escala e posição, sem ossos) e pelos Quadrúpedes (já tem o Brasito pronto para copiar).
2. **Use os mesmos nomes** das animações do Brasito (ex.: `Gotinho_Parado`, `Gotinho_Investida`), assim fica fácil ligar no jogo depois (`ARQUIVOS` em `js/modelos3d.js`).
3. **Golpe perto no lugar:** o jogo já empurra o monstro para a frente. Faça o avanço pequeno (como no clipe) ou tire o avanço do osso `root`, como foi feito no Brasito.
4. **Exporte em .glb** com 24 quadros por segundo e os pés em y = 0, olhando para +Z (o padrão do Brasito).
5. Lembre do celular: **poucos ossos** (o Brasito tem 20) e texturas de 1024.
