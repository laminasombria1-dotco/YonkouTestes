# Guia dos monstros: do fofo ao trevoso (etapa 4.1)

Este guia vale para **todo monstro novo** feito no Blender (ou gerado por imagem → 3D) para o Runeclash.
Ele diz **como cada forma deve parecer** e **quanto ela pode pesar** para rodar bem no celular.

A prancha `referencias/monstros_hoje.jpg` mostra os 36 monstros como estão hoje (formas simples do jogo).
Eles são o **ponto de partida**: a silhueta e as cores de cada linha continuam, só que mais bonitas.

---

## 1. A regra do tom: começa fofo, termina trevoso

Cada linha tem 4 formas. O monstro **cresce junto com o jogador**: nasce fofo e termina imponente ou assustador.

| Forma | Sensação | Corpo | Rosto | Cores |
|---|---|---|---|---|
| **Inicial** (Nv.1) | fofo, filhote | redondo, cabeça grande (~40% da altura), patas curtas | olhos grandes e brilhantes, bochecha | claras e alegres |
| **1ª evolução** (Nv.6) | fofo e animado | um pouco mais comprido, aparece o "detalhe" da linha (crista, juba, cauda) | olhos ainda grandes | claras, um tom mais forte |
| **2ª evolução** (Nv.12) | forte, confiante | proporções de bicho adulto, músculo, postura firme | olhos menores e mais afiados, sobrancelha | mais fundas, primeiros detalhes escuros |
| **Forma final** (Nv.30) | **imponente ou trevoso** | silhueta grande e angulosa: chifres, espinhos, coroa, asas, rachaduras | olhos que **brilham** (sem pupila ou com pupila fina) | **escuro + o brilho do elemento** (ex.: rocha preta com lava, penas escuras com raio roxo) |

**O "trevoso" do Runeclash é bonito, não nojento.**
- Sim: escuro, sombra, brilho nos olhos, rachaduras com luz, fumaça, chifres, coroa, armadura, ar de chefe.
- Não: sangue, ferida, tripa, olho saltado, bicho machucado. Nada de realista: tudo **low poly estilizado**, como o mundo do jogo.

**Para reconhecer de longe** (o jogo é visto de cima, no celular): cada forma precisa de **uma silhueta própria** e de **um ponto que brilha** (rabo de fogo, gema, olhos, coroa). Se uma forma, só pela sombra, parecer com a de outra linha, mude.

---

## 2. Direção de cada linha

A forma final já tem um tom trevoso nos efeitos dos golpes (etapa 3.1). O modelo deve combinar com ele.

| Linha | Inicial → Final | Ideia da forma final (trevosa) | Brilho da forma final |
|---|---|---|---|
| **Fogo** | Brasito → Brasalobo → Fornalobo → **Magmalobo** | lobo de rocha preta com rachaduras de lava, juba de fogo escuro, chifres de obsidiana | laranja/vermelho de lava |
| **Água** | Gotinho → Marolo → Marulhão → **Tsunamar** | gigante de água funda, quase azul-marinho, onda nas costas como uma capa, olhos de abismo | azul claro e espuma |
| **Planta** | Musguinho → Moitão → Troncudo → **Florestral** | árvore antiga com casca escura, raízes como garras, flores que brilham à noite, olhos de vaga-lume | verde-limão (vaga-lumes) |
| **Terra** | Pedrisco → Cascalhão → Rochedrão → **Montanhar** | montanha viva de pedra escura, picos nevados, cristais âmbar que brilham nas rachaduras | âmbar (cristal) |
| **Raio** | Faisquinho → Choquilho → Trovolt → **Tempestor** | ave de tempestade de penas quase pretas, nuvens carregadas em volta, raios roxos | roxo de tempestade |
| **Sol** | Solito → Solário → Solaurum → **Astrorei** | leão-rei de eclipse: juba dourada com borda vermelha escura, coroa, auréola partida | vermelho de eclipse + dourado |
| **Lua** | Lunico → Lunarelo → Crescêntio → **Plenilúnio** | coelho guardião alto e magro, manto de noite, lua cheia atrás, olhos prateados | prata e azul-lua |
| **Luz** | Lumino → Lumelo → Prismal → **Aurealis** | ser de cristal com seis asas e auréola, frio e distante (anjo severo, sem rosto fofo) | branco e arco-íris do prisma |
| **Trevas** | Breuzinho → Sombrelo → Umbrafel → **Noctífero** | fera da noite eterna com asas e coroa de chifres, corpo de fumaça, olhos roxos | roxo-runa `#7A2CFE` |

Os **tipos duplos** (Brotobrasa…, Vaporito…, Imanito…) seguem a mesma regra, misturando as cores dos dois elementos.
Os **lendários** (etapa 5.4) já nascem trevosos e podem pesar mais (veja a tabela abaixo).

---

## 3. Limite de peso (para rodar no celular)

Medida de referência: o **Brasito** (`modelos/brasito.glb`): **3.340 triângulos, 20 ossos, 1 material, 4 texturas de 1024 em WebP, 0,7 MB**.

| | Forma inicial | 1ª evolução | 2ª evolução | Forma final | Lendário |
|---|---|---|---|---|---|
| **Triângulos** | 2.500 a 4.000 | 3.000 a 4.500 | 3.500 a 5.000 | 4.000 a 6.000 | até 8.000 |
| **Ossos** | até 24 | até 24 | até 28 | até 32 (asas, caudas) | até 40 |
| **Arquivo `.glb`** | até 1 MB | até 1 MB | até 1,2 MB | até 1,5 MB | até 2 MB |

Para todos:
- **1 malha e 1 material** (se precisar de 2, por exemplo, uma parte transparente, no máximo 2).
- **Texturas de 1024** (512 serve para monstros pequenos), em **WebP**: cor, normal, ORM (oclusão, rugosidade e metal) e, se brilhar, a de emissão.
- **O brilho do elemento vai na textura de emissão**, só nas partes que brilham, como no Brasito. O jogo faz o brilho pulsar.
- **Tamanho e direção:** pés em y = 0, olhando para **+Z**. O jogo ajusta a altura sozinho (mede o modelo de formas simples).
- **Nome dos ossos** com o nome do monstro (ex.: `Magmalobo_Rig`).

## 4. Animações de todo monstro

Os nomes começam com o nome do monstro (ex.: `Magmalobo_Parado`). A 24 quadros por segundo.

| Animação | Repete? | Uso |
|---|---|---|
| `_Parado` | sim | parado, respirando |
| `_Andar` | sim | andar devagar |
| `_Correndo` | sim | correr (de preferência com `_Arrancada` antes, como o Brasito) |
| `_Perto` | não | golpe perto |
| `_Disparo` | não | golpe disparo |
| `_Area` | não | golpe área |
| `_Dano` | não | levou um golpe |
| `_Desmaio` | não | desmaiou (fica no último quadro) |

Para cada golpe, anotar o **momento do golpe** (o quadro em que o fogo sai, o soco acerta...) para o jogo encaixar o efeito (`marco` em `js/modelos3d.js`).

---

## 5. Antes de colocar no jogo (lista rápida)

- [ ] Tem a silhueta da sua linha e é diferente das outras formas?
- [ ] A forma final é escura e imponente, com um ponto que brilha?
- [ ] Está dentro do limite de triângulos, ossos e tamanho do arquivo?
- [ ] 1 malha, 1 material, texturas de 1024 em WebP?
- [ ] Pés em y = 0, olhando para +Z?
- [ ] Tem as 8 animações, com o momento de cada golpe anotado?
