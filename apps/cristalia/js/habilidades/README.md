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
Brasito (Nv.1) > Brasalobo (Nv.12) > Fornalobo (Nv.30) > Magmalobo (Nv.50, evolução rara)

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
- Só a linha do Brasito usa estes golpes. A Vulcarapa e os tipos duplos com Fogo têm os deles.
- **Modelo do Blender (só o Brasito):** a batalha avisa o modelo quando um golpe começa (`tocarGolpe` em `../batalha.js`) e quando o giro começa (`ajustarGiro` em `brasito-batalha.js`). No `.glb`, a volta do Rabo de Fogo vem da animação, então o jogo não gira o modelo de novo, e o rabo cresce pela animação. Veja `../../modelos/README.md`.

**Exemplos de mudança (em `brasito.js`):**
- Lança-chamas mais longo no Magmalobo: `lancaChamasInfernal` → `jato.alcance`.
- Mais velocidade na Investida: `VELOCIDADE_INVESTIDA` (0,12 = +12%) e `DURACAO_VELOCIDADE` (segundos).
- Rabo maior: `raio` (área) e `tamanhoRabo` (quanto o rabo cresce no giro).

### Água: linha do Gotinho (`gotinho.js` e `gotinho-batalha.js`)
Gotinho (Nv.1) > Marolo (Nv.12) > Marulhão (Nv.30) > Tsunamar (Nv.50, evolução rara)

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
- Só a linha do Gotinho usa estes golpes. A Aquaraia tem os dela (veja abaixo); o Vaporito também.

**Exemplos de mudança (em `gotinho.js`):**
- Onda mais longa ou mais larga: `ondaGotinho` → `onda.distancia` e `onda.largura`.
- Empurrão maior: `onda.empurra` (ou `anel.empurra` no Maremoto), em metros.
- Escudo mais forte: `ESCUDO_INVESTIDA` (0,08 = 8% da vida), `DURACAO_ESCUDO` e `ESPERA_ESCUDO` (segundos).
- Poça maior ou que dura mais: `hidrocanhaoPoca` → `poca.raio` e `poca.duracao`.

### Planta: linha do Musguinho (`musguinho.js` e `musguinho-batalha.js`)
Musguinho (Nv.1) > Moitão (Nv.12) > Troncudo (Nv.30) > Florestral (Nv.50, evolução rara)

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
- Só a linha do Musguinho usa estes golpes. O Espinhal e o Brotobrasa têm os deles; o Silvárion continua com os de `dados.js`.

**Exemplos de mudança (em `musguinho.js`):**
- Puxão maior: `chicoteVinha` → `vinha.puxa` (metros) e `alcance`.
- Folha que vai mais longe: `folhaBumerangue` → `bumerangue.alcance`.
- Mais cura no Florestral: `folhaBumerangueViva` → `bumerangue.cura` e `bosqueVivo` → `zona.cura` (0,02 = 2% por segundo).
- Moita que dura mais: `moitaEspinhos` → `zona.duracao` e `zona.poderTick`.

### Terra: linha do Pedrisco (`pedrisco.js` e `pedrisco-batalha.js`)
Pedrisco (Nv.1) > Cascalhão (Nv.12) > Rochedrão (Nv.30) > Montanhar (Nv.50, evolução rara)

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
- Só a linha do Pedrisco usa estes golpes. O Imanito e as evoluções (Terra + Raio) continuam com os golpes de `dados.js`.

**Exemplos de mudança (em `pedrisco.js`):**
- Pedra que vai mais longe ou mais rápida: `pedregulho` → `arco.alcance` e `arco.voo` (segundos no ar).
- Mais quiques: `arco.quiques` (cada número é a força de um quique: `[0.7, 0.5]` = 2 quiques).
- Mais tempo no ar: `punhoSismico` → `espinhos.levanta` (segundos).
- Pilares que duram mais ou em maior número: `muralhaPedra` → `pilares.duracao` e `pilares.quantidade`.

### Raio: linha do Faisquinho (`faisquinho.js` e `faisquinho-batalha.js`)
Faisquinho (Nv.1) > Choquilho (Nv.12) > Trovolt (Nv.30) > Tempestor (Nv.50, evolução rara)

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
- Só a linha do Faisquinho usa estes golpes. O Imanito e as evoluções (Terra + Raio) continuam com os golpes de `dados.js`.

**Exemplos de mudança (em `faisquinho.js`):**
- Marcas que duram mais ou dão mais bônus: `MARCAS.duracao` e `MARCAS.bonus`.
- Choque mais forte: `faiscaMarcadora` → `marca.choque.poder`; mais tempo para usar: `marca.janela`.
- Dash mais longo: `dashEletrico` → `dashRaio.distancia`; aura maior: `dashRaio.aura`.
- Mais nuvens ou que duram mais: `nuvemEletrica` → `nuvens.quantidade` e `nuvens.duracao`.

### Sol: linha do Solito (`solito.js` e `solito-batalha.js`)
Solito (Nv.1) > Solário (Nv.12) > Solaurum (Nv.30) > Astrorei (Nv.50, evolução rara)

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

### Terra + Raio (tipo duplo): linha do Imanito, o mestre do magnetismo (`imanito.js` e `imanito-batalha.js`)
Imanito (Nv.1) > Magnetito (Nv.12) > Ferrovolt (Nv.30) > Titanvolt (Nv.50, evolução rara). Pedras giram em volta dele (munição e escudo); o Ímã **puxa** e a Repulsão **empurra**.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Imanito | Investida | **Pedra Magnética**: até **2** pedras girando (nasce 1 a cada 3 s); atira uma; cada pedra segura 1 tiro | **Repulsão**: empurra todos em volta (3 m) |
| Magnetito | **Ímã**: puxa (0,3 s) num cone de 6 m e soca | **3** pedras; + Paralisia | + Paralisia |
| Ferrovolt | **Ímã Elétrico**: o soco pode paralisar | **Pedra de Corrente**: **4** pedras; ao acertar, raio em quem está perto do alvo | Quem bate numa pedra ou na borda leva +60% e fica **atordoado** |
| Titanvolt | **Esmagamento**: com 2 ou mais puxados, bate um contra o outro | **Pedra Titã**: **5** pedras, maiores e mais rápidas | **Tempestade Magnética**: 2 s puxando para o centro com raios caindo; depois explode empurrando |

- **Pedras (`pedras`):** ficam em `c.orbita` (criadas cheias na primeira vez). O disparo tira uma da órbita e ela vira o tiro, mirando no inimigo mais perto à frente; sem pedras, sai só uma faísca fraca (`fatorSem`). Quando um tiro inimigo que voa entra no círculo das pedras, a mais perto pula na frente e o segura (a folha bumerangue e o raio que marca não). Aparece "Pedras 3/4" embaixo da vida.
- **Ímã (`ima`):** em `c.ima`; os alvos param lado a lado na frente dele e ficam presos durante o puxão.
- **Chefes e o Campeão** (`resistente`): puxados e empurrados só pela metade.
- **Parede:** `vaiBater` testa o caminho do empurrão com `arena.bloqueia` e `arena.colidir` (borda).
- **IA:** atira pedra só se tiver; fica a ~4 m quando o ímã está pronto (usa de vez em quando) e chega perto quando a repulsão está pronta.
- Leve para o celular de referência: no máximo 5 pedras por monstro, materiais fixos, raios que somem em 0,2 s.

### Fogo + Planta (tipo duplo): linha do Brotobrasa, o jardineiro de fogo (`brotobrasa.js` e `brotobrasa-batalha.js`)
Brotobrasa (Nv.1) > Chamafolha (Nv.12) > Ardentroco (Nv.30) > Florinferno (Nv.50, evolução rara). Planta **flores de fogo** (armadilhas) que explodem quando o inimigo chega perto.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Brotobrasa | Investida | **Semente de Brasa**: vira uma flor até 7 m; explode com inimigo a 1,5 m (ou depois de 6 s). Até **2** flores | **Anel de Brotos**: 5 brotos em volta explodem 1 s depois |
| Chamafolha | **Folhas Ardentes**: leque de 2,5 m; **+30% em quem está queimando** | + Queimadura, até **3** flores | + Queimadura |
| Ardentroco | **Galhada em Brasa**: 2 golpes (3 m); o 2º **planta uma flor** | **Semente de Chama**: deixa **fogo no chão** 2 s; até **4** flores | **7 brotos** (3,8 m) |
| Florinferno | **Galhada Infernal** (também planta flor) | **Flor Gigante**: explosão de 2,5 m | **Florescer Infernal**: por 6 s, nasce uma flor a cada metro que ele anda (até 8) |

- **Flores (`semente`, `florescer`):** ficam em `this.flores` (todas juntas, com o dono). Cada dono tem um limite por tipo ('semente' e 'trilha'): plantar mais uma tira a mais velha. A flor arma em 0,3 s e explode uma vez só. O aviso no chão é **vermelho** quando a flor é do inimigo.
- **Fogo no chão (`semente.chao`):** em `this.fogos`, dá um pedaço de dano a cada 0,5 s em quem está em cima.
- **Leque (`leque`):** golpe de perto em `c.leque` (1 ou 2 golpes); `queimando` dá mais dano em quem tem Queimadura. A Galhada planta uma flor igual à do disparo dele.
- Leve para o celular de referência: cada flor tem 3 peças com materiais fixos; no máximo 4 flores do disparo + 8 da trilha por monstro. Quando ele sai da luta, as flores dele somem.
- **IA:** planta flor quando você está a mais de 2 m, usa o leque de perto e o anel quando você está dentro dele.

### Água + Fogo (tipo duplo): linha do Vaporito, o tanque (`vaporito.js` e `vaporito-batalha.js`)
Vaporito (Nv.1) > Fumarolo (Nv.12) > Gêiserão (Nv.30) > Caldeirax (Nv.50, evolução rara). Atributos de tanque em `DUPLAS.aguaFogo` (`../dados.js`): vida 64, ataque 13, defesa 15, velocidade 5,2.

| Forma | Perto | "Disparo" (de perto) | Área |
|---|---|---|---|
| Vaporito | Investida | **Bafo de Vapor**: cone de 3 m | **Recolher no Casco**: 2,5 s, 50% menos dano; explosão de vapor no fim (3 m) |
| Fumarolo | **Arrancada de Vapor**: dash de 5 m, empurra; depois **Blindado** (+20% de defesa por 4 s) | + Encharcado | **Casco Quente**: quem bate de perto se queima |
| Gêiserão | **Pancada de Casco**: a arrancada termina com uma pancada em volta (2,5 m) | Bafo de 3,5 m | **Casco do Gêiser**: 3 s, 60% menos; no fim, gêiser que atordoa 0,8 s |
| Caldeirax | **Pancada do Gêiser**: a pancada deixa um gêiser que atordoa | **Bafo Fervente** (4,5 m): Encharcado e Queimadura | **Caldeira**: 3,5 s, 70% menos; a explosão ganha +50% do dano segurado (no máximo o dobro) |

- **Casco (`casco`):** fica em `c.casco`. Dentro dele não ataca nem esquiva ("No casco!") e anda na metade da velocidade (`fatorVel`). `aplicarDano` diminui o dano e chama `aoApanharNoCasco`, que soma a pressão e queima quem bateu de perto. A recarga só começa quando ele sai (como o Sol do Solito).
- **Pressão:** `aplicarDano` aceita `opcoes.bonus` (dano a mais), limitado ao **dobro** do golpe.
- **Arrancada (`arrancada`):** dash próprio em `c.arrancada`; o Blindado fica em `c.blindado` e aumenta a defesa em `aplicarDano`.
- **Bafo (`bafo`):** cone em `c.bafo`, 5 pedaços de dano, como o lança-chamas.
- **Atordoado:** usa o `stun` da batalha (não anda nem ataca).
- **IA:** entra no casco quando apanhou há pouco tempo (`ultimoDano`), usa o bafo só de perto e a arrancada para chegar.
- É o 1º tipo duplo com habilidades próprias: a chave em `HABILIDADES_DA_LINHA` é a da linha em `DUPLAS` (`aguaFogo`).

### Luz: linha do Lumino (`lumino.js` e `lumino-batalha.js`)
Lumino (Nv.1) > Lumelo (Nv.12) > Prismal (Nv.30) > Aurealis (Nv.50, evolução rara)

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Lumino | Investida | **Estilhaço de Luz**: cristal que se divide em **3** raios ao acertar alguém ou chegar a 8 m | **Redoma de Luz**: 3 m por 2 s, devolve os tiros e diminui 30% do outro dano; clarão no fim |
| Lumelo | **Passo de Luz**: teletransporte de 5 m; cristais no chão onde aparece (2 m) | + Exposto | + Exposto no clarão |
| Prismal | **Passo Prismático**: 6 m; cristais onde some **e** onde aparece | Divide em **5** | **Redoma Prismática**: 3,8 m por 3 s; tiros devolvidos voltam +50% |
| Aurealis | **Passo Celestial**: 7 m; cristais no começo, no meio e no fim (2,5 m), as asas cortam em volta (fim +30%) | **Arco-Íris**: divide em **7** raios coloridos | **Julgamento**: redoma de 4 s; no fim, **6 colunas de luz** caem nos inimigos (até 6 m). Exposto dura 50% mais |

- **Passo (`passo`):** o jogador vai para onde o **joystick aponta** (`c.mv`, guardado em `controlarJogador` e no treino); sem apontar, na direção do alvo. O inimigo vai na sua direção e para um pouco antes de você. Anda de 0,3 em 0,3 m: obstáculos seguram o passo. Fica sem levar dano por `passo.invul` segundos. Cada ponto de cristal acerta cada inimigo **uma vez**.
- **Estilhaço (`divide`):** o cristal se divide ao acertar alguém ou chegar em `alcance` (se bater num obstáculo, só quebra: `p.bateu` em `../batalha.js`). Os raios não acertam de novo quem levou o cristal.
- **Redoma (`redoma`):** fica em `c.redoma` e anda junto com ele. Devolve os tiros que voam (bolas, cristais, Bola Sombria, luas, gotas...) para quem atirou, com a força × `redoma.forca`. A folha bumerangue e o raio que marca **não** voltam. O outro dano (laser, jato, áreas, mordidas) cai `redoma.reducao` (`aplicarDano`). Aparece "Redoma 2s" embaixo da vida.
- **Julgamento:** as colunas caem primeiro em cima de cada inimigo por perto e as que sobram em volta deles, com aviso no chão. No Julgamento o clarão empurra pouco, para o inimigo ficar embaixo das colunas.
- Esta linha não ganha o "disparo ×2/×3": no lugar, o cristal se divide. A treinadora **Lana** usa esta linha (ela também devolve os seus tiros).

**Exemplos de mudança (em `lumino.js`):**
- Distância do passo: `passoLuz` → `passo.distancia`; alcance dos cristais: `passo.raio`.
- Raios do estilhaço: `estilhaco` → `divide.raios`, `divide.abertura` (leque) e `divide.fator` (força de cada um).
- Redoma: `redomaLuz` → `redoma.duracao`, `redoma.reducao` (0,3 = 30%) e `redoma.forca`.

### Lua: linha do Lunico (`lunico.js` e `lunico-batalha.js`)
Lunico (Nv.1) > Lunarelo (Nv.12) > Crescêntio (Nv.30) > Plenilúnio (Nv.50, evolução rara)

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Lunico | Investida | **Fases da Lua**: Lua Nova (1 tiro rápido) > Lua Crescente (3 em leque) > **Lua Cheia** (bola grande) > volta | **Poça de Luar**: 3 m por 4 s, inimigos 30% mais lentos, ele cura 2%/s dentro |
| Lunarelo | **Salto Lunar**: 2 dashes (100% e 150%) | Fases da Lua + Sono (a Lua Cheia tem o dobro da chance) | Poça de Luar + Sono |
| Crescêntio | **Dança Crescente**: 3 dashes (100%, 150%, 200%) | A Lua Cheia **explode** (2,5 m) | **Luar Crescente**: 3,8 m por 5 s, cura 3%/s |
| Plenilúnio | **Caçada da Lua Cheia**: 3 dashes (100%, 150%, 250%) + corte em meia-lua no chão | Lua Cheia explode maior (3,5 m) | **Uivo da Lua Cheia**: 5 m por 6 s, cura 4%/s, **+20% de velocidade** dentro (Fúria Lunar) |

- **Combo de dashes (`combo`):** cada dash termina do outro lado do alvo, girando em volta dele (2 dashes: vai e volta; 3: um triângulo, frente > um lado > o outro). Os próximos dashes seguem o alvo se ele andar. Cada dash acerta **uma vez**, com a força multiplicada por `combo.fatores`. Durante o dash, o monstro **atravessa** o alvo (a regra "ninguém ocupa o mesmo lugar" fica desligada para ele). Bater numa pedra ou na borda para o dash ali.
- **Fases da Lua (`fases`):** `c.faseLua` guarda a próxima fase, e o botão mostra o nome dela (`hudFases` em `../batalha.js`). Os tiros vão até `alcanceTiro`. A explosão da Lua Cheia não acerta de novo quem já levou o tiro.
- **Luar (`luar`):** o círculo fica parado no chão onde foi usado. A cada meio segundo, inimigos dentro ganham `luarLento` e ele, dentro, se cura (e ganha `luarVel` no Plenilúnio). `fatorVel` em `../batalha.js` usa os dois. **No treino não cura** (`semCura` em `../treino.js`): a cura do jogo é só no castelo.
- **Despertar** (Crescêntio em diante, `despertar` nas melhorias): golpe em quem está dormindo dá **+30% de dano** (`aplicarDano`). O combo é feito para isso: a Lua Cheia faz dormir e os dashes acordam batendo forte.
- Esta linha não ganha o "disparo ×2/×3": no lugar, ganha as fases. Os selvagens da Lua também se curam no luar.

**Exemplos de mudança (em `lunico.js`):**
- Força dos dashes: `dancaCrescente` → `combo.fatores` (1,5 = +50%); mais longe do alvo: `combo.passa`.
- Fases: em `FASES`, `tiros`, `fator` e `vel` de cada fase; explosão: `fasesLuaCheia` → `{ raio, fator }`.
- Cura do luar: `pocaLuar` → `luar.cura` (0,02 = 2% por segundo); tempo: `luar.duracao`; tamanho: `raio`.

### Trevas: linha do Breuzinho (`trevas.js` e `trevas-batalha.js`)
Breuzinho (Nv.1) > Sombrelo (Nv.12) > Umbrafel (Nv.30) > Noctífero (Nv.50, evolução rara)

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Breuzinho | Investida | Bola Sombria (de `../dados.js`, vai longe) | Vazio (de `../dados.js`) |
| Sombrelo | **Mordida Sombria** (13) | **Olhar Sombrio**: bola com olhos, 14, **8 m**, ×2 | **Vazio**: escurece a arena, **+5% de dano por 8 s** |
| Umbrafel | **Mordida Abissal** (19) | **Olhar Abissal**: 16, **9 m**, ×2, bola maior | **Vazio Abissal**: **+10%**, pode causar Medo |
| Noctífero | **Mordida da Noite Eterna** (24), pode causar Medo | **Olhar da Noite**: 17, **10 m**, ×3, com morcegos | **Abismo** com o Astro Negro: **+15%**, Medo dura 50% mais |

- **Bola com olhos (`olhos: true`):** a bola some quando anda `alcance` metros (o tempo de vida é `alcance / velocidade`). A IA só atira se o alvo estiver a menos de 90% do alcance, e a faixa de aviso do inimigo tem o tamanho do alcance. `tamanho` aumenta a bola; `morcegos` põe 2 morcegos voando em volta dela.
- **Bônus da área (`trevas`):** ao usar a área, quem usou ganha `c.breu` (`{ cfg, t }`). `batalha.js` usa o bônus no dano (`aplicarDano`, "breu") e mostra "Trevas +5%" embaixo da vida. O tempo é contado em `atualizar(dt)` de `trevas-batalha.js`. Não acumula: usar de novo só renova. A arena escurece por `trevas.escuro` segundos (no treino, não escurece).
- As melhorias são as padrão (disparo ×2/×3, Medo na área e depois na mordida). Os selvagens de Trevas também ganham o bônus.
- Visual: poça de breu, tentáculos, mãos de sombra, olhos, bocarra, cópias sombrias, morcegos e o Astro Negro.

**Exemplos de mudança (em `trevas.js`):**
- Bônus de dano: `vazioSombrio` → `trevas.dano` (0,05 = 5%); tempo: `trevas.duracao`; quanto escurece: `trevas.escuro`.
- Tiro mais longe: `olharSombrio` → `alcance` (em metros).

### Água (raro): Aquaraia (`aquaraia.js` e `aquaraia-batalha.js`)
Aquaraia (Nv.1) > Ventaraia (Nv.55) > Mantaré (Nv.70) > Leviaraia (Nv.90, evolução rara). **Ataca pelo ar e foge.**
É o 1º raro com formas novas: a chave em `HABILIDADES_DA_LINHA` é a da linha em `LINHAS_RARAS` (`aquaraia`).

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Aquaraia | **Rasante**: voo de 5 m (16 m/s) que **atravessa** os inimigos, força 12 | **Bolhas**: 3 em leque, 8 m, força 6 | **Mergulho**: sobe 0,7 s (sem levar dano), cai até 6 m à frente, área de 3 m, força 20 |
| Ventaraia | **Rasante de Vento**: 6 m + **Rastro d'Água** (1,2 m de largura, 2,5 s, 25% de encharcar a cada 0,5 s) | Bolhas + **encharcado** | Mergulho + **encharcado**, empurra 2 m |
| Mantaré | **Rasante com Ferrão**: 6,5 m; no fim, o ferrão bate no inimigo mais perto atrás dela (até 3,5 m) com 60% | **Bolhas Guiadas**: viram até 2,2 rad/s na direção do inimigo, 10 m | **Mergulho das Marés**: 3,5 m (força 24) + **Redemoinho** de 3 m por 3 s (puxa 1,6 m/s, força 3 a cada 0,5 s); **+25% em quem está Encharcado** |
| Leviaraia | **Rasante do Leviatã**: 8 m, rastro de 1,8 m por 4 s, ferrão 80% | **Chuva de Bolhas**: 5 bolhas guiadas, 11 m | **Queda do Leviatã**: sobe 1 s, área de 4,5 m (força 36), redemoinho de 4 m por 4 s (puxa 2 m/s). Encharcado dura 50% mais |

- **Rasante e Mergulho usam o dash da batalha** (`c.dash.rasante` e `c.dash.mergulho`): enquanto voa, não anda, não ataca e não esquiva, e passa por cima dos outros (a regra "ninguém ocupa o mesmo lugar" fica desligada para ela). Bater numa pedra ou na borda para o voo ali.
- **Mergulho:** o lugar onde ela cai é marcado já na preparação (`pontoMergulho` e `avisoMergulho`, como a pedra em arco do Pedrisco) e não muda. Na subida ela fica sem levar dano (`invul`). A altura do voo é aplicada depois da animação (`alturaDoVoo`), e a sombra fica no chão.
- **Rastro (`rastro`):** uma faixa no chão, do começo ao fim do voo. No máximo 2 por monstro (o mais velho some).
- **Redemoinho (`redemoinho`):** 1 por monstro. Chefes e o Campeão são puxados só pela metade (igual ao ímã do Imanito).
- **Bolhas (`bolha`):** 1 peça cada e poucas faíscas ao acertar (`particulas: 3` em `aplicarDano`), porque saem 5 juntas. As guiadas só viram para inimigos na frente ou do lado.
- **IA:** usa o mergulho com você a mais de 1,5 m e até o alcance; o rasante e as bolhas como os golpes de sempre.
- Leve para o celular de referência: modelos de 5 a 16 malhas; no pior quadro a Leviaraia fica perto do Plenilúnio em desenhos por quadro.

**Exemplos de mudança (em `aquaraia.js`):**
- Voo mais longo: `rasanteLeviata` → `rasante.distancia`; rastro que dura mais: `rasante.rastro.duracao`.
- Bolhas que viram mais: `bolhasGuiadas` → `bolha.guiada` (radianos por segundo).
- Mais tempo no ar: `mergulhoAquaraia` → `mergulho.sobe`; bônus no Encharcado: `mergulho.encharcado` (0,25 = +25%).
- Redemoinho mais forte: `quedaLeviata` → `mergulho.redemoinho.puxa` e `poder`.

### Fogo (raro): Vulcarapa (`vulcarapa.js` e `vulcarapa-batalha.js`)
Vulcarapa (Nv.1) > Basaltuga (Nv.55) > Crateruga (Nv.70) > Colossarapa (Nv.90, evolução rara). **Artilharia**: lenta, quer ficar longe, bombardeia em arco e enche o chão de poças de lava. Não repete o Vaporito (o tanque).

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Vulcarapa | **Recuo de Lava**: leque de fogo na frente (2,5 m, força 12) e pula 4 m para trás | **Bomba de Lava**: arco de 3 a 11 m, área de 1,5 m, força 16 | **Modo Vulcão**: erupção de 3 m ao fincar; 4 s fincada; 1 bomba a cada 1,2 s (força 10, até 11 m) |
| Basaltuga | Recuo de 5 m (força 14) | Bomba + **queimadura** | Modo Vulcão de 5 s + **queimadura** |
| Crateruga | **Recuo Explosivo**: poça de lava de 1,6 m por 3 s onde ela estava | **Bomba Dupla**: a 2ª cai 2 m à frente de para onde o alvo anda (parado: de um lado); poças de 1,2 m por 2,5 s | **Cratera Viva**: 6 s, 1 bomba a cada 0,9 s, com poças |
| Colossarapa | **Recuo do Colosso**: 6 m, poça de 2 m, **atordoa** 0,5 s | **Chuva de Meteoros**: 3 bombas (no alvo e 2,2 m para cada lado) | **Erupção Ancestral**: 8 s, 2 bombas a cada 0,9 s (nos 2 inimigos mais perto) e erupção final de 5 m (força 34) |

- **Recuo (`recuo`):** usa o dash da batalha (`c.dash.recuo`), olhando para a frente. Para no obstáculo e na borda. Termina o Modo Vulcão.
- **Bomba (`bomba`):** como a pedra em arco do Pedrisco (os lugares ficam marcados na preparação, `pontosBomba` e `avisoBombas`), mas com outro campo (`bomba`, não `arco`). Cada bomba é 1 peça. A Bomba Dupla mede para onde o alvo anda entre os quadros (`velDe`).
- **Modo Vulcão (`vulcao`):** fica em `c.vulcao`. `podeAndar()` em `../batalha.js` devolve falso enquanto ele existe (não anda nem esquiva). A recarga só começa quando ele acaba (como o Sol do Solito). No treino, sem inimigos, as bombas caem à frente, em pontos sorteados até 8 m.
- **Poças (`poca`):** 1 disco cada, no máximo `MAX_POCAS_LAVA` (4) por monstro; um pedaço de dano a cada 0,5 s e metade da chance de queimar do golpe. Somem quando a dona sai da luta.
- **IA:** fica a uns 7 m (`artilharia` em `pensarIA`), usa o Modo Vulcão com você a mais de 4 m e o Recuo quando você chega perto.
- Leve para o celular de referência: modelos de 7 a 15 malhas; no pior quadro (Chuva de Meteoros + Modo Vulcão) a Colossarapa fica na faixa do Plenilúnio em desenhos por quadro.

**Exemplos de mudança (em `vulcarapa.js`):**
- Pulo maior: `recuoLava` → `recuo.distancia`.
- Bomba mais longe: `bombaLava` → `bomba.alcance`; mais bombas: `bomba.quantidade`.
- Torre mais rápida ou mais longa: `modoVulcao` → `vulcao.intervalo` e `vulcao.duracao`.
- Poças maiores ou mais fortes: `POCA_PEQUENA`, `POCA_RECUO` e `POCA_GRANDE` no começo do arquivo.

### Planta (raro): Espinhal (`espinhal.js` e `espinhal-batalha.js`)
Espinhal (Nv.1) > Cactouriço (Nv.55) > Espinhaço (Nv.70) > Mandacarão (Nv.90, evolução rara). Ouriço-cacto: **espinhos que cravam**, **ricochete** e **agulhas para todos os lados**. Não repete o Musguinho.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Espinhal | **Rolamento**: 5 m (14 m/s), atravessa (força 13) | **Agulhas**: 3 em leque, 20 m/s, 9 m (força 6 cada) | **Explosão de Espinhos**: 8 agulhas, 7 m (força 8 cada) |
| Cactouriço | Rolamento de 6 m | Agulhas + **enraizado** | 10 agulhas + **enraizado** |
| Espinhaço | **Rolamento Ricochete**: 6 m, quica 1 vez | **Agulhas Ricochete**: 5, quicam 1 vez, 10 m | **Explosão Dupla**: 2 ondas de 10 (0,25 s entre elas) |
| Mandacarão | **Rolamento Tempestade**: 8 m, quica 3 vezes, 4 agulhas (40% da força) a cada batida | 7 agulhas, quicam 2 vezes, 11 m | **Floração do Mandacaru**: 3 ondas de 12 agulhas, 9 m |

- **Agulhas:** NÃO entram em `batalha.projeteis`: ficam em `this.agulhas` e são todas desenhadas num **InstancedMesh** só (no máximo `MAX_AGULHAS` = 64 no ar e 24 cravadas). Por isso a redoma do Lumino e as pedras do Imanito não seguram as agulhas. Cada agulha acerta um inimigo e some; o efeito (Enraizado) é sorteado uma vez por inimigo a cada uso.
- **Ricochete (`quicar`):** na borda redonda, reflete na normal; nos obstáculos, testa virar só o x, só o z ou voltar (funciona com as pedras da arena e com as árvores do mapa no treino). Depois de quicar, pode acertar de novo quem já acertou.
- **Rolamento (`rolar`):** usa o dash da batalha (`c.dash.rolar`) e atravessa os inimigos. Sem quiques, para na pedra ou na borda. O modelo gira para a frente (`visualModelo`).
- **Espinhado (`ESPINHADO` em `espinhal.js`):** fica em `l.espinhos = { n, t, f }`; `fatorVel` em `../batalha.js` usa `1 - n × f`. A placa do inimigo mostra "Espinhos N" (como o "⚡" das marcas do Faisquinho). No Mandacarão (`trava`), com 5 espinhos aplica Enraizado e zera os espinhos.
- **IA:** usa os golpes como os de sempre (corpo de perto, disparo de 2,5 a 12 m, área com você dentro do `raio`).
- Leve para o celular de referência: modelos de 7 a 13 malhas e todas as agulhas num desenho só; no pior quadro o Mandacarão fica bem abaixo do Plenilúnio.
- O **Rei Julius** usa o Mandacarão (`'mandacarao'` na equipe dele em `../reino.js`), já no Nv.50.

**Exemplos de mudança (em `espinhal.js`):**
- Mais quiques: `rolamentoTempestade` → `rolar.quiques`; agulhas que quicam mais: `agulhasMandacaru` → `agulhas.quiques`.
- Mais agulhas: `agulhas.quantidade` ou `nova.porOnda` e `nova.ondas`.
- Espinhado mais forte: `ESPINHADO.lento` (0,06 = 6% por espinho) e `ESPINHADO.max`.

### Ígneo (lendário): Ignárion (`ignarion.js` e `ignarion-batalha.js`)
Ignárion (Nv.1) > Pirárion (Nv.65) > Magmárion (Nv.75) > Infernárion (Nv.90). As 3 evoluções são **com o botão** (`EVOLUCOES_LENDARIAS` em `../dados.js`). A forma inicial continua sendo o **chefe** do Trono de Magma (fúria, Cristal Supremo) e usa tudo isto.

| Forma | Perto | Disparo | Área | Ignição |
|---|---|---|---|---|
| Ignárion | Mordida de Magma (de `../dados.js`, força 24) | **Cometa Ígneo**: 3, explosão de 1,5 m (força 14) | **Cataclismo**: 6 m (força 36) | 5 s, +20% |
| Pirárion | **Mordida e Arremesso**: 5 m, voo 0,55 s | 4 cometas | Cataclismo + 5 fissuras de 7 m (50% da força) | 6 s, +25% |
| Magmárion | Arremesso de 7 m + explosão de 2 m (60%) | 5 cometas, explosão de 2 m | 7 fissuras de 8 m | 7 s, +25%, aura de 2 m (força 4 a cada 0,5 s) |
| Infernárion | **Fauces do Inferno**: 8 m + explosão de 3 m (70%) + Combustão garantida | **Cometa Supremo**: 5 + 1 gigante (explosão de 3 m, 180%) | **Apocalipse Ígneo**: 7 m (força 42) + 8 fissuras com fogo no chão por 2 s | 8 s, +30%, aura e explosão de 5 m (força 40) no fim |

- **Calor (`CALOR`):** fica em `c.calorIgneo` (de 0 a 1; **não** use `c.calor`, que é a área do Solito). `aplicarDano` em `../batalha.js` chama `aoAcertar` e `aoApanhar` quando o dano passa; a Ignição fica em `c.ignicao` e entra no dano (`ignicao`). Aparece "Calor N%" / "IGNIÇÃO Ns" embaixo da vida e na placa do inimigo.
- **Arremesso (`arremesso`):** morde o inimigo da frente; ele fica em `alvo.arremesso` (atordoado, voando em arco com cambalhota) e cai atrás de quem mordeu. Se bater numa pedra ou na borda no caminho, para ali e leva `BATIDA` (+50%, atordoa 0,6 s).
- **Cometas (`cometas`):** ficam em `this.cometas` (no máximo 10), 1 peça cada; explodem ao acertar, na pedra, na borda ou no fim do alcance.
- **Fissuras (`cataclismo.fissuras`):** faixas de fogo que crescem do centro para fora e acertam cada inimigo uma vez; uma leva por monstro.
- **IA:** usa os golpes como os de sempre (mordida de perto, cometas de 2,5 a 12 m, área com você dentro do `raio`).
- **Modelos** (`linhaIgnarion` em `../modelos.js`, feitos pela arte do Lâmina): as peças acesas usam um material só com a cor em cada peça (`pa` e `MAT_ACESO`), para juntarem num desenho só. Infernárion: 31 peças (o Plenilúnio tem 34).

**Exemplos de mudança (em `ignarion.js`):**
- Ignição mais longa ou mais forte: `CALOR.ignicao` → `duracao` e `dano`; barra que enche mais rápido: `CALOR.porAcerto`.
- Arremesso mais longe: `mordidaArremesso` → `arremesso.distancia`.
- Mais fissuras: `cataclismoFissuras` → `cataclismo.fissuras.n`.

### Silvestre (lendário): Silvárion (`silvarion.js` e `silvarion-batalha.js`)
Silvárion (Nv.1) > Bosquárion (Nv.65) > Raizárion (Nv.75) > Ancestrárion (Nv.90). As 3 evoluções são **com o botão**. A forma inicial (um filhote de cervo) continua sendo o **chefe** do Santuário da Árvore-Mãe e usa tudo isto.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Silvárion | Galhada Ancestral (de `../dados.js`, força 24) | Semente Parasita (de `../dados.js`) | **Selva Viva**: 6 m (força 34), lentidão 2 s, gasta a Seiva |
| Bosquárion | **Investida da Galhada**: 6 m (15 m/s), força 22, Enraizado 1 s | **Semente + Elo Vital** (1 cipó, 3 s, até 11 m) | **Manada Espiritual**: 3 cervos (força 20), 9 m |
| Raizárion | Investida: 7 m, força 25, Enraizado 1,5 s | 4 sementes, até **2 cipós** | 5 cervos, 10 m |
| Ancestrárion | **Investida Ancestral**: 8 m, força 28 + flores (2,5 m, 60%) | **Floração Parasita**: 5 sementes, 2 cipós que sugam o dobro (12 m) | **Despertar da Floresta**: Selva Viva (6 m, força 30) + 7 cervos (80%), 11 m |

- **Seiva (`SEIVA`):** fica em `c.seiva` (0 a 1). Enche `porSugada` a cada pedaço da Parasita (`atualizarStatus` em `../batalha.js` chama `aoSugar`) e `porElo` a cada pedaço do Elo. A área (`selva`/`manada`) gasta tudo: cada 25% = cura `curaPor25` e +1 cervo. No treino não cura (`semCura`). Aparece "Seiva N%" embaixo da vida e na placa do inimigo.
- **Investida (`investida`):** usa o dash da batalha (`c.dash.investida`); leva o 1º inimigo enganchado na frente da galhada (atordoado) e, onde para, brota uma árvore (sobe do chão, some em 2 s) que aplica Enraizado. Chefes e o Campeão: só metade do caminho. Se o levado bater numa pedra ou na borda, para ali e leva `BATIDA_GALHADA`.
- **Elo Vital (`elo`):** a semente é o tiro de sempre (`batalha.projeteis`); quando acerta, `aoAcertarSemente` prende um cipó (1 peça esticada entre os dois). A cada 0,5 s: dano (`fator`), cura (`cura` da vida dele) e Seiva. Arrebenta com a distância (`alcance`) ou no fim.
- **Cervos-espírito (`manada`):** 1 peça cada (uma forma juntada uma vez só, `GEO_CERVO`), atravessam e acertam cada inimigo uma vez. No máximo 7 + 4 (Seiva cheia) por uso.
- **IA:** usa os golpes como os de sempre (investida de perto, sementes de 2,5 a 12 m, área com você dentro do `raio`).
- **Modelos** (`linhaSilvarion` em `../modelos.js`): peças acesas com o material único (`pa`). Ancestrárion: 24 peças.

**Exemplos de mudança (em `silvarion.js`):**
- Seiva que enche mais rápido: `SEIVA.porSugada` e `SEIVA.porElo`; mais cura: `SEIVA.curaPor25`.
- Investida mais longa: `investidaGalhada` → `investida.distancia`; mais tempo enraizado: `investida.enraiza`.
- Mais cervos: `manadaEspiritual` → `manada.n`.

## Modo treino (monstro invocado no mapa)

Os golpes desta pasta também rodam no mapa, no modo treino (`../treino.js`), quando você controla o monstro invocado. O treino usa a mesma `Batalha`, mas sem inimigos e sem dano (`alvosDe` e `vivos` devolvem lista vazia, e `aplicarDano` não faz nada).

- Tudo é desenhado numa "camada" centrada no treinador, como uma arena invisível de 22 m: as contas com `RAIO_ARENA` continuam valendo. O monstro fica preso a 20 m do treinador.
- `this.b.arena` no treino tem `bloqueia`, `colidir` e `obstaculos` (os obstáculos do mapa mais os pilares do próprio treino) e um `escurecer` que não faz nada.
- **Golpe novo:** se ele só usar o que a batalha já oferece (`cena`, `efeitos`, `alvosDe`, `aplicarDano`, `arena.bloqueia`...), funciona no treino sem mudar nada. Se precisar de um alvo para acontecer (como o Choque), no treino ele simplesmente não acontece.

## Como acrescentar outra linha
1. Crie `<linha>.js` com os golpes (no mesmo formato de `brasito.js`).
2. Em `../dados.js`, importe e coloque a linha em `HABILIDADES_DA_LINHA`.
3. Se o golpe funciona de um jeito novo, crie `<linha>-batalha.js` e ligue em `../batalha.js`.
