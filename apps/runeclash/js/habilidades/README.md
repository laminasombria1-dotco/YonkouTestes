# Habilidades dos monstros

Esta pasta guarda as habilidades **próprias** de cada linha de monstros, para ficar fácil de achar e mudar.
Cada linha tem até dois arquivos:

| Arquivo | O que tem | Quando mexer |
|---|---|---|
| `<linha>.js` | **Só números e textos**: força, recarga, alcance, tamanho, velocidade e as frases do Monstruário | Para balancear (deixar mais forte, mais rápido, maior...) |
| `<linha>-batalha.js` | **Como o golpe funciona e aparece** na batalha: chamas, giros, mãos de sombra... | Para mudar o comportamento ou o visual |

Os golpes que não estão aqui (os de sempre, de cada elemento) continuam em `../dados.js`.

## Linhas com habilidades próprias

### Fogo: linha do Brasito (`brasito.js` e `brasito-batalha.js`)
Brasito (Nv.1) > Brasalobo (Nv.6) > Fornalobo (Nv.12) > Magmalobo (Nv.30)

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Brasito | Investida | **Lança-Chamas**: jato de fogo da boca, 5 m | **Rabo de Fogo**: gira e bate com o rabo, 3 m |
| Brasalobo | Investida: **+12% de velocidade por 10 s** | Lança-Chamas + **queimadura** | Rabo de Fogo + **queimadura** |
| Fornalobo | Investida: **+20% por 10 s** | **Lança-Chamas Duplo**: 2 jatos em V | Rabo de Fogo com **mini dash** de 3 m |
| Magmalobo | Investida: **+30% por 10 s** | **Lança-Chamas Infernal**: 2 jatos de **14 m** | **Rabo de Magma**: fogo maior, área de 4,5 m |

- A Investida é Normal em todas as formas, como em todos os monstros. A velocidade extra vale só na batalha e aparece em verde embaixo da vida ("Veloz +12%").
- O lança-chamas acerta em 5 pedaços enquanto o jato dura. A queimadura é sorteada **uma vez por alvo** a cada uso (23%). O Rabo de Fogo tem 45%.
- Obstáculos seguram o fogo do lança-chamas.
- Esta linha não ganha o "disparo ×2/×3" das outras: no lugar, ganha o que está na tabela.
- **Visual (etapa 3.1):** além dos pedaços de fogo, os golpes usam os efeitos da Arena (`this.b.fx`, um só por batalha): chamas "sólidas" que crescem e vão de amarelo a vermelho (`fogo()`), faíscas (`faisca()`), o brilho na boca, brasas no alvo, a roda de fogo (arcos) do Rabo, a faixa de fogo do avanço, a rachadura de lava do Rabo de Magma e o rastro verde da Investida.
- Só a linha do Brasito usa estes golpes. Vulcarapa e os tipos duplos com Fogo continuam com os golpes de Fogo de `dados.js`.
- **Modelo do Blender (só o Brasito):** a batalha avisa o modelo quando um golpe começa (`tocarGolpe` em `../batalha.js`) e quando o giro começa (`ajustarGiro` em `brasito-batalha.js`). No `.glb`, a volta do Rabo de Fogo vem da animação, então o jogo não gira o modelo de novo, e o rabo cresce pela animação. Veja `../../modelos/README.md`.

**Exemplos de mudança (em `brasito.js`):**
- Lança-chamas mais longo no Magmalobo: `lancaChamasInfernal` → `jato.alcance`.
- Mais velocidade na Investida: `VELOCIDADE_INVESTIDA` (0,12 = +12%) e `DURACAO_VELOCIDADE` (segundos).
- Rabo maior: `raio` (área) e `tamanhoRabo` (quanto o rabo cresce no giro).

### Água: linha do Gotinho (`gotinho.js` e `gotinho-batalha.js`)
Gotinho (Nv.1) > Marolo (Nv.6) > Marulhão (Nv.12) > Tsunamar (Nv.30)

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Gotinho | Investida | **Jato d'Água**: atravessa o 1º inimigo (o de trás leva 70%) | **Onda**: parede de água, anda 6 m, 3 m de largura, empurra 3 m |
| Marolo | Investida: **Escudo d'Água** de 8% da vida | Jato d'Água + **encharcado** | Onda + **encharcado** |
| Marulhão | Investida: escudo de **12%** | **Hidrocanhão**: explode ao acertar, respingo de 2 m (50% da força) | **Onda Dupla**: 2 ondas (0,35 s entre elas), 4 m de largura, anda 7 m |
| Tsunamar | Investida: escudo de **16%** | Hidrocanhão + **poça** de 2,5 m por 3 s (35% de encharcar a cada meio segundo) | **Maremoto**: anel que cresce de 1 a 7 m em 0,7 s, empurra 4 m |

- A Investida é Normal em todas as formas. O escudo dura 6 s e só volta **10 s** depois de ganho (usar a Investida de novo antes disso não renova).
- O escudo segura o dano antes da vida (o número azul mostra quanto ele segurou). Se segurar o golpe inteiro, o efeito do golpe não pega.
- Chances de Encharcado: Onda, Onda Dupla e Maremoto 45% (cada onda sorteia), cada tiro 23%.
- O inimigo avisa a Onda com uma **faixa vermelha** do tamanho dela e o Maremoto com o círculo vermelho de sempre. Obstáculos seguram as ondas e o anel.
- Esta linha não ganha o "disparo ×2/×3" das outras: no lugar, ganha o que está na tabela.
- Só a linha do Gotinho usa estes golpes. Aquaraia e os tipos duplos com Água continuam com os golpes de `dados.js`.

**Exemplos de mudança (em `gotinho.js`):**
- Onda mais longa ou mais larga: `ondaGotinho` → `onda.distancia` e `onda.largura`.
- Empurrão maior: `onda.empurra` (ou `anel.empurra` no Maremoto), em metros.
- Escudo mais forte: `ESCUDO_INVESTIDA` (0,08 = 8% da vida), `DURACAO_ESCUDO` e `ESPERA_ESCUDO` (segundos).
- Poça maior ou que dura mais: `hidrocanhaoPoca` → `poca.raio` e `poca.duracao`.

### Planta: linha do Musguinho (`musguinho.js` e `musguinho-batalha.js`)
Musguinho (Nv.1) > Moitão (Nv.6) > Troncudo (Nv.12) > Florestral (Nv.30)

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Musguinho | Investida | **Folha Bumerangue**: 1 folha, vai 8 m, gira e volta (9 de força na ida e 9 na volta) | **Raízes**: 3,6 m, deixam lento 2,5 s |
| Moitão | **Chicote de Vinha**: 4,5 m, puxa 2,5 m | **2 folhas** em V (8 por passagem) + **enraizado** | Raízes + **enraizado** |
| Troncudo | Chicote de Vinha: 5 m, puxa 3 m (força 18) | **3 folhas** em leque, 9 m | **Moita de Espinhos**: 14 ao brotar + 3 a cada meio segundo, 3,5 m, 4 s |
| Florestral | **Vinha Agarradora**: 6 m, puxa 3,5 m + **enraizado** (25%) | 3 folhas, 10 m; cada folha que acertou cura **1,5%** ao voltar | **Bosque Vivo**: 24 ao brotar + 4 a cada meio segundo, 5 m, 5 s; cura o Florestral **2% por segundo** dentro |

- A vinha estica em 0,2 s, segura 0,1 s e recolhe em 0,3 s. Ela puxa só até encostar e para nos obstáculos.
- A folha vai reto até o alcance, gira um instante e volta reto para quem jogou (por isso passa de novo pelo alvo). Se bater num obstáculo, some. Se o dono sair da luta, some.
- Chances de Enraizado: área 35%, vinha do Florestral 25%, folhas 18% (uma vez por inimigo a cada uso, juntando todas as folhas e passagens).
- A moita e o bosque somem se quem plantou desmaiar ou for trocado. A cura do Bosque não funciona com Combustão.
- O inimigo avisa a vinha com uma **faixa vermelha estreita** e as áreas com o círculo vermelho.
- Só a linha do Musguinho usa estes golpes. Espinhal, Silvárion e os tipos duplos com Planta continuam com os golpes de `dados.js`.

**Exemplos de mudança (em `musguinho.js`):**
- Puxão maior: `chicoteVinha` → `vinha.puxa` (metros) e `alcance`.
- Folha que vai mais longe: `folhaBumerangue` → `bumerangue.alcance`.
- Mais cura no Florestral: `folhaBumerangueViva` → `bumerangue.cura` e `bosqueVivo` → `zona.cura` (0,02 = 2% por segundo).
- Moita que dura mais: `moitaEspinhos` → `zona.duracao` e `zona.poderTick`.

### Terra: linha do Pedrisco (`pedrisco.js` e `pedrisco-batalha.js`)
Pedrisco (Nv.1) > Cascalhão (Nv.6) > Rochedrão (Nv.12) > Montanhar (Nv.30)

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Pedrisco | Investida (rola para a frente, só visual) | **Pedregulho**: arco de 3 a 10 m, sobe 3,5 m, 0,65 s no ar, área de 1,4 m (força 15) | **Tremor**: 4 m (força 20), rachaduras em estrela |
| Cascalhão | **Punho Sísmico**: fileira de espinhos de 4 m (1,2 m de largura), joga para o alto 0,5 s (força 14) | Pedregulho + **soterrado** | Tremor + **soterrado** |
| Rochedrão | Punho Sísmico: 5 m (força 18), espinhos com cristal | **Pedregulho Quicante**: área de 1,6 m, quica 4 m à frente (2ª queda com 70%) | **Muralha de Pedra**: 4 m (força 22) + 8 pilares por 4 s |
| Montanhar | **Punho da Montanha**: 7 m (1,5 m de largura), 0,6 s no ar + **soterrado** (32%) | **Rocha Nevada**: até 12 m, área de 2 m (força 20), quica 2 vezes (70% e 50%) | **Cordilheira**: 5 m (força 30) + 10 pilares nevados por 5 s |

- A pedra em arco cai onde o alvo **estava** quando o golpe começou: quem se mexe escapa. Ela passa por cima de tudo (obstáculos e pilares) e nunca cai fora da arena.
- Os espinhos saem um atrás do outro e **param no primeiro obstáculo**. Cada inimigo é acertado uma vez. Quem é atingido fica no ar (sem andar, atacar ou esquivar) e perde o golpe que preparava.
- Os pilares entram na lista de obstáculos da arena (`arena.obstaculos`) enquanto estão de pé e saem dela quando começam a afundar. Pilar que cairia fora da arena não sobe.
- Chances de Soterrado: área 45%, Punho do Montanhar 32%, pedra 23% (uma vez por inimigo a cada pedra, juntando as quedas).
- O inimigo avisa a pedra com círculos vermelhos em cada lugar onde ela vai cair, o Punho com uma faixa vermelha e as áreas com o círculo vermelho.
- **Visual (etapa 3.1):** os efeitos da Arena (`this.b.fx`) põem nuvens de poeira "sólidas" (`poeira()`; neve no Montanhar), a onda de choque, a rachadura laranja que pinta o chão (Tremor e pedras que quicam), a faixa do Punho e a poeira dos pilares.
- Só a linha do Pedrisco usa estes golpes. O Imanito e as evoluções (Terra + Raio) continuam com os golpes de `dados.js`.

**Exemplos de mudança (em `pedrisco.js`):**
- Pedra que vai mais longe ou mais rápida: `pedregulho` → `arco.alcance` e `arco.voo` (segundos no ar).
- Mais quiques: `arco.quiques` (cada número é a força de um quique: `[0.7, 0.5]` = 2 quiques).
- Mais tempo no ar: `punhoSismico` → `espinhos.levanta` (segundos).
- Pilares que duram mais ou em maior número: `muralhaPedra` → `pilares.duracao` e `pilares.quantidade`.

### Raio: linha do Faisquinho (`faisquinho.js` e `faisquinho-batalha.js`)
Faisquinho (Nv.1) > Choquilho (Nv.6) > Trovolt (Nv.12) > Tempestor (Nv.30)

| Forma | Perto | Disparo (tiro → Choque) | Área |
|---|---|---|---|
| Faisquinho | Investida | **Faísca Marcadora**: força 10, 9 m, 22 m/s, +1 marca. **Choque**: força 14, 1 alvo | **Nuvem Elétrica**: 1 nuvem, 4 s, raio de força 5 a cada 1,5 s |
| Choquilho | **Dash Elétrico**: 5 m em 0,25 s, aura de 1,2 m, **sem dano**, recarga 4 s | Faísca Marcadora + **paralisia** | Nuvem Elétrica + **paralisia** (0,7 s) |
| Trovolt | Dash: 6 m, aura de 1,5 m | **Relâmpago Marcador**: força 12, 10 m. Choque: força 18, até 2 alvos | **Nuvens de Tempestade**: 2 nuvens, 5 s, força 6 |
| Tempestor | Dash: 7 m, aura de 1,8 m + **paralisia** (21%) | Relâmpago Marcador: força 13, 11 m. Choque: força **28**, até 2 alvos | **Tempestade**: 3 nuvens, 6 s, força 7 |

- **Marcas** (`MARCAS` em `faisquinho.js`): duram 6 s, cabem 3 e dão o bônus `[1, 1.25, 1.5]` no Choque e nas nuvens.
- **Botão em duas partes:** se o tiro acertar, o botão do disparo vira "Choque" e fica pronto por 4 s (`marca.janela`). O Choque liga os marcados (o mais marcado primeiro), dá o dano em 4 pedaços e estoura as marcas. Se a janela passar, começa a recarga normal do tiro.
- **Acerto garantido:** o Choque e os raios das nuvens nos marcados usam `garantido: true` em `aplicarDano`: passam pela esquiva e pelo Ofuscado e não têm limite de distância.
- As nuvens se revezam: cada uma solta o 1º raio num tempo diferente e, com vários marcados, cada raio vai num deles. Sem marcados, o raio cai a até `espalha` metros do monstro, com o círculo de aviso.
- Chances de Paralisia: nuvens 30% (0,7 s), tiro e Choque 15% (um sorteio por inimigo a cada Choque), dash do Tempestor 21%.
- Só lutam 2 inimigos ao mesmo tempo (`MAX_ATIVOS` em `../batalha.js`), por isso o Choque liga no máximo 2; no Tempestor, no lugar de um 3º alvo, ele ficou mais forte.
- **Visual (etapa 3.1):** os raios sólidos de sempre ganham por cima o relâmpago da Arena com galhos (`this.b.fx.relampago`), clarões, faíscas que brilham (o `estalo`), o chão que racha onde o raio cai, o anel da marca, os raios curtos e a faixa elétrica do Dash. No Tempestor o brilho é roxo de tempestade (`corDe()`).
- Só a linha do Faisquinho usa estes golpes. O Imanito e as evoluções (Terra + Raio) continuam com os golpes de `dados.js`.

**Exemplos de mudança (em `faisquinho.js`):**
- Marcas que duram mais ou dão mais bônus: `MARCAS.duracao` e `MARCAS.bonus`.
- Choque mais forte: `faiscaMarcadora` → `marca.choque.poder`; mais tempo para usar: `marca.janela`.
- Dash mais longo: `dashEletrico` → `dashRaio.distancia`; aura maior: `dashRaio.aura`.
- Mais nuvens ou que duram mais: `nuvemEletrica` → `nuvens.quantidade` e `nuvens.duracao`.

### Sol: linha do Solito (`solito.js` e `solito-batalha.js`)
Solito (Nv.1) > Solário (Nv.6) > Solaurum (Nv.12) > Astrorei (Nv.30)

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Solito | Investida | **Raio Solar**: força 14, 10 m, 0,5 m de largura, recarga 1,6 s | **Calor**: 4 por pedaço, 3 m, 3 s (6 pedaços), recarga 6 s |
| Solário | **Pequeno Sol**: 20 s; +10% de dano, −15% de dano recebido, +15% de velocidade; recarga 15 s depois que some | Raio Solar + **ofuscado** (20%) | Calor + **ofuscado** (40%) |
| Solaurum | **Sol Dourado**: +15% / −20% / +20% | Raio Solar: força 16, 12 m, 0,8 m de largura, **recarga 1,2 s** | **Onda de Calor**: 4 por pedaço, 3,8 m, 4 s, esquenta +15% por pedaço, recarga 7 s |
| Astrorei | **Sol Rei**: +20% / −25% / +25%; o sol atira junto (60%) | **Laser Real**: força 20, 14 m, 1 m de largura, recarga 1,8 s | **Supernova**: 5 por pedaço, 4,5 m, 5 s, esquenta; explosão de força 24 no fim, recarga 8 s |

- **Sol:** `soltarSol` cria a bola ao lado e acima do monstro; enquanto ela existir, `c.sol` guarda o bônus. `batalha.js` usa o bônus no dano (`aplicarDano`) e na velocidade (`fatorVel`). O bônus vale no campo todo. Enquanto o sol existe, a recarga fica travada; quando ele some, começa a recarga de 15 s (`recarga` do golpe).
- **Laser:** acerta todos com o corpo na faixa (largura + metade do monstro), até o primeiro obstáculo. No Astrorei, o sol solta um 2º laser do alto, no inimigo mais perto dele, com `sol.atira` da força.
- **Calor:** um pedaço a cada `calor.intervalo` em quem está a até `raio` dele. Com `esquenta`, o pedaço número N no mesmo inimigo tem `(1 + esquenta)^N` da força. A Supernova termina com `calor.explosao`.
- Só a linha do Solito usa estes golpes. Os de Sol de sempre continuam em `dados.js`.

**Exemplos de mudança (em `solito.js`):**
- Bônus do sol: `pequenoSol` → `sol.ataque`, `sol.defesa` e `sol.velocidade` (0,15 = 15%); tempo: `sol.duracao`; espera: `recarga`.
- Laser mais longo ou mais grosso: `raioSolarSolito` → `laser.alcance` e `laser.largura`.
- Calor mais forte ou mais longo: `calorSolito` → `poder` (cada pedaço), `calor.duracao` e `raio`.
- Calor que esquenta mais rápido: `ondaCalor` → `calor.esquenta`.

### Trevas: linha do Breuzinho (`trevas-batalha.js`)
Só o **visual** (poça de breu, tentáculos, mãos de sombra, olhos, bocarra, cópias sombrias, morcegos e o Astro Negro). Os números dos golpes de Trevas continuam em `../dados.js` (Mordida Sombria, Bola Sombria, Vazio, Garra Abissal, Sombras, Abismo).

## Modo treino (monstro invocado no mapa)

Os golpes desta pasta também rodam no mapa, no modo treino (`../treino.js`), quando você controla o monstro invocado. O treino usa a mesma `Batalha`, mas sem inimigos e sem dano (`alvosDe` e `vivos` devolvem lista vazia, e `aplicarDano` não faz nada).

- Tudo é desenhado numa "camada" centrada no treinador, como uma arena invisível de 22 m: as contas com `RAIO_ARENA` continuam valendo. O monstro fica preso a 20 m do treinador.
- `this.b.arena` no treino tem `bloqueia`, `colidir` e `obstaculos` (os obstáculos do mapa mais os pilares do próprio treino) e um `escurecer` que não faz nada.
- **Golpe novo:** se ele só usar o que a batalha já oferece (`cena`, `efeitos`, `alvosDe`, `aplicarDano`, `arena.bloqueia`...), funciona no treino sem mudar nada. Se precisar de um alvo para acontecer (como o Choque), no treino ele simplesmente não acontece.

## Como acrescentar outra linha
1. Crie `<linha>.js` com os golpes (no mesmo formato de `brasito.js`).
2. Em `../dados.js`, importe e coloque a linha em `HABILIDADES_DA_LINHA`.
3. Se o golpe funciona de um jeito novo, crie `<linha>-batalha.js` e ligue em `../batalha.js`.
