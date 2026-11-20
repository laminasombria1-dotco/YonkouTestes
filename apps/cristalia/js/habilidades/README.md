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
- Só a linha do Brasito usa estes golpes. Vulcarapa e os tipos duplos com Fogo continuam com os golpes de Fogo de `dados.js`.

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
- Só a linha do Pedrisco usa estes golpes. O Imanito e as evoluções (Terra + Raio) continuam com os golpes de `dados.js`.

**Exemplos de mudança (em `pedrisco.js`):**
- Pedra que vai mais longe ou mais rápida: `pedregulho` → `arco.alcance` e `arco.voo` (segundos no ar).
- Mais quiques: `arco.quiques` (cada número é a força de um quique: `[0.7, 0.5]` = 2 quiques).
- Mais tempo no ar: `punhoSismico` → `espinhos.levanta` (segundos).
- Pilares que duram mais ou em maior número: `muralhaPedra` → `pilares.duracao` e `pilares.quantidade`.

### Trevas: linha do Breuzinho (`trevas-batalha.js`)
Só o **visual** (poça de breu, tentáculos, mãos de sombra, olhos, bocarra, cópias sombrias, morcegos e o Astro Negro). Os números dos golpes de Trevas continuam em `../dados.js` (Mordida Sombria, Bola Sombria, Vazio, Garra Abissal, Sombras, Abismo).

## Como acrescentar outra linha
1. Crie `<linha>.js` com os golpes (no mesmo formato de `brasito.js`).
2. Em `../dados.js`, importe e coloque a linha em `HABILIDADES_DA_LINHA`.
3. Se o golpe funciona de um jeito novo, crie `<linha>-batalha.js` e ligue em `../batalha.js`.
