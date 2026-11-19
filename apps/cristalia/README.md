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
  - **Tela enxuta:** o nome e a vida de cada inimigo ficam em cima dele. Os botões do canto são ícones: **cristal** (com a quantidade), **setinha** para escolher outro cristal (mostra a chance de cada um), **setas** para trocar de monstro, **porta** para fugir e **tela cheia**.
  - Os avisos da batalha ficam pequenos, no alto, e somem rápido.
  - O inimigo avisa antes de atacar: uma **faixa ou círculo vermelho no chão**. Saia dele ou use a esquiva.
  - No PC: J, K e L para os golpes. A esquiva não tem mais botão na tela, mas ainda funciona com Espaço.
- **Capturar:** enfraqueça o monstro e toque no botão do cristal (tecla C). O número ao lado é a chance de captura. A **setinha** ao lado do cristal abre a lista para escolher Comum, Forte ou Supremo (no PC, a tecla V passa para o próximo). Formas evoluídas são bem mais difíceis de capturar.
- **Evoluir:** cada linha tem 4 formas. A forma inicial evolui no **nível 6**, a 1ª evolução no **nível 12** e a 2ª evolução no **nível 30**. Quando seu monstro chega ao nível, aparece a animação de evolução e ele ganha atributos e golpes mais fortes.
- **Dia e noite:** um ciclo completo dura 4 minutos (2 de dia e 2 de noite). **Sol e Luz** só aparecem de dia; **Lua e Trevas**, só à noite. O relógio fica no canto superior direito.
- **Equipe:** até 3 monstros. Com a equipe cheia, o capturado vai para a reserva.
- **Reserva:** no painel Equipe, a aba **Reserva** mostra **todos** os monstros que você tem (os da equipe aparecem marcados). Perder uma batalha nunca apaga monstros: a equipe só é curada e volta para casa.
- **Proteção:** o jogo guarda uma cópia de cada monstro que você já teve. Se algum sumir da equipe e da reserva por qualquer motivo, ele volta sozinho para a Reserva, com um aviso.
- **Fonte de cura:** a fonte no centro do mapa cura todos os seus monstros.
- **Nível dos selvagens:** acompanha o nível da sua equipe e aumenta quanto mais longe do centro você vai. Nas bordas aparecem as formas evoluídas.
- O progresso é salvo automaticamente no navegador.
- **Tela cheia:** botão na tela inicial, no mapa e na batalha. Alguns navegadores não deixam (o iPhone, por exemplo); nesse caso, use "Adicionar à tela inicial".

## Casa (base portátil)

- Você começa com a casa **na mochila**. O botão no canto inferior direito muda conforme a situação:
  - **Montar casa:** monta na sua frente. Se ali estiver ocupado, o jogo procura o lugar livre mais próximo.
  - **Guardar casa:** aparece quando você está perto dela; a casa volta para a mochila.
  - **Mudar casa p/ cá:** aparece quando você está longe; a casa sai de onde estava e é montada onde você está.
- **Encostar na casa cura todos os monstros**, inclusive os desmaiados, da equipe e da reserva.
- Em volta da casa (10 m) é **área segura**: monstros não aparecem e dão meia-volta.
- Se toda a equipe desmaiar, você **acorda na casa** (ou na fonte, se a casa estiver guardada).
- A posição da casa fica salva.

## Grupos de monstros

- Pelo mapa andam **grupos de 6 monstros**: 5 comuns e 1 **líder**, que é maior e usa coroa dourada.
- **Níveis:** acompanham a sua equipe. Comuns ficam em ~1,1× o seu nível médio + 2; o líder em ~1,4× + 8. No começo do jogo (equipe Nv.3), os comuns ficam no Nv.5 e o líder no Nv.12.
- **Quantidade:** 1 grupo no começo e mais 1 a cada 5 níveis da equipe, até 5 grupos.
- **Na batalha:**
  - lutam em **ondas de no máximo 2**: a próxima onda só entra quando **os dois** da onda atual caírem (ou forem capturados);
  - nos grupos do mapa, os comuns vêm de 2 em 2 e o **líder entra por último, sozinho**;
  - nos **acampamentos das dungeons**, a ordem é por força: **2 fracos → 2 médios → 1 forte → o líder**;
  - seus golpes miram no inimigo mais perto (com um anel branco embaixo dele) e a área acerta todos dentro dela;
  - dá para capturar qualquer um no meio da luta, e a batalha continua com os outros.
- **Recompensa:** experiência de todos os vencidos (60% de cada), **2 cristais comuns + 1 Cristal Forte garantidos pelo líder** e chance de cristal pelos outros.
- Se você fugir ou perder, os que sobraram continuam andando no mapa.

## Monstros de tipo duplo

- São mais raros: **a cada 10 monstros que aparecem no mapa, 1 é de tipo duplo**. Eles têm um anel de duas cores em volta e aparecem na região de um dos seus elementos.
- Quando um aparece, chega um aviso dizendo qual e onde.
- Também evoluem no Nv.6, 12 e 30 e ganham as mesmas melhorias. A partir da 2ª evolução, o **disparo também causa o efeito** do elemento dele, então eles causam dois efeitos diferentes.
- **Golpes:** perto e área são do 1º elemento; o disparo é do 2º.
- **Na defesa:** o golpe é comparado com os dois elementos e os multiplicadores se somam. Um monstro nunca é fraco contra o próprio elemento.
- **Captura mais difícil:** formas inicial e 1ª evolução só com **Cristal Forte** (ou melhor); 2ª evolução e forma final só com **Cristal Supremo**.
- Valem 50% a mais de experiência e, ao serem vencidos, deixam 1 Cristal Forte.

| Tipo | Nv.1 | Nv.6 | Nv.12 | Nv.30 | Onde aparece |
|---|---|---|---|---|---|
| Fogo + Planta | Brotobrasa | Chamafolha | Ardentroco | Florinferno | Floresta, Vulcão, Campo |
| Água + Fogo | Vaporito | Fumarolo | Gêiserão | Caldeirax | Lago, Vulcão, Campo |
| Terra + Raio | Imanito | Magnetito | Ferrovolt | Titanvolt | Pedreira, Planalto, Campo |

## Cristais de captura

| Cristal | Cor | Chance | Como conseguir |
|---|---|---|---|
| Comum | Azul | 1× | Brilhos azuis no mapa, vitórias |
| Forte | Roxo | 1,5× | Brilhos roxos no mapa (raros), líder de grupo (+1), vencer um tipo duplo (+1), fundir 3 comuns |
| Supremo | Dourado | 2,2× | Brilhos dourados (muito raros), tipos duplos evoluídos (às vezes), fundir 3 fortes |

- **Fundir:** no painel **Equipe**, perto da sua casa, 3 cristais iguais viram 1 do tipo acima.
- Na batalha, o jogo escolhe sozinho o cristal mais fraco que funciona no alvo; o botão **Tipo** troca na mão.
- Os cristais do chão reaparecem 1 minuto depois, com a cor sorteada de novo.

## Caminho das Brasas (dungeon aberta da região de fogo)

Sai da borda nordeste do mapa, depois do Vulcão, seguindo a estrada de braseiros. Não tem tela de carregamento: você entra andando.

- **4 etapas**, separadas por portões. Cada etapa tem 2 acampamentos com grupos (5 comuns + 1 líder). Quanto mais fundo, mais fortes:

| Etapa | Nome | Comuns (equipe Nv.3) | Líder (equipe Nv.3) | O que tem lá |
|---|---|---|---|---|
| 1 | Portão de Cinzas | Nv.5 | Nv.12 | Árvores mortas, ossadas, pedras de lava |
| 2 | Ruínas da Forja | Nv.8 | Nv.15 | Muros quebrados, colunas, fornalhas e bigornas |
| 3 | Rio de Lava | Nv.11 | Nv.18 | Um rio de lava que só se atravessa pela ponte |
| 4 | Escadaria de Obsidiana | Nv.14 | Nv.21 | Espinhos de obsidiana e estátuas de lobos |

- Os níveis acompanham a sua equipe (os números acima são para uma equipe de Nv.3).
- **Ordem da luta nos acampamentos:** 2 fracos (comum −2 níveis) → 2 médios (comum +1) → 1 forte (entre o comum e o líder) → o líder. Cada onda só entra quando a anterior inteira cai.
- Também aparecem monstros soltos lá dentro, já evoluídos (Brasalobo, Fornalobo, Vulcarapa, Cascalhão, Umbrafel...). Nenhum monstro novo além do chefe.
- Um acampamento vencido ganha outro grupo depois de 2 minutos.
- Não dá para montar a casa lá dentro (calor demais). Monte antes da entrada.
- Quanto mais fundo, mais escuro fica o céu, com cinzas caindo e brasas subindo.

### Chefe: Ignárion (super raro)

- Fica no **Trono de Magma**, no fim do caminho, aos pés de um vulcão gigante.
- Tipo **Ígneo**, um elemento novo: um fogo mais forte, que é super efetivo contra Planta, Terra e até Fogo. Só a **Água** é forte contra ele.
- Efeito do Ígneo: **Combustão**, que tira 6% da vida por segundo e impede cura.
- Nível: 1,4× o nível da equipe + 22 (Nv.26 com equipe Nv.3).
- Com menos da metade da vida, entra em **fúria** e ataca bem mais rápido.
- Só é capturado com **Cristal Supremo**, e a chance é bem baixa.
- Vencido ou capturado, deixa 3 Cristais Fortes e 2 Supremos, e vale o dobro de experiência. Ele volta no próximo amanhecer.

## Trilha Ancestral (dungeon aberta da Floresta)

Sai da borda noroeste do mapa, depois da Floresta, seguindo as lanternas de flor. Funciona igual ao Caminho das Brasas (as duas usam a mesma base em `js/dungeon.js`).

| Etapa | Nome | Comuns (equipe Nv.3) | Líder (equipe Nv.3) | O que tem lá |
|---|---|---|---|---|
| 1 | Bosque dos Cogumelos | Nv.5 | Nv.12 | Cogumelos gigantes, troncos caídos, cogumelos e flores que brilham |
| 2 | Ruínas de Musgo | Nv.8 | Nv.15 | Muros e colunas com musgo, arcos antigos, uma cabeça de pedra com olhos de jade |
| 3 | Lago Escondido | Nv.11 | Nv.18 | Um lago atravessa o caminho: só se passa pela ponte de madeira. Vitórias-régias e cachoeiras |
| 4 | Raízes Gigantes | Nv.14 | Nv.21 | Árvores enormes, raízes em arco, cipós e frutos brilhantes |

- Quem aparece: só espécies que já existiam (Planta evoluída como Troncudo e Florestral, Espinhal, Fogo + Planta, e visitantes de Água, Terra, Luz e Trevas). Nenhum monstro novo além do chefe.
- Não dá para montar a casa lá dentro (as raízes não deixam). Monte antes da entrada.
- Quanto mais fundo, mais escuro e verde fica o céu, com folhas caindo e vaga-lumes.
- As árvores gigantes ficam transparentes quando estão entre a câmera e você.
- Arena dos grupos: **Trilha Ancestral** (favorece Planta). Perigo: **moitas de espinhos** que arranham quem pisa, mas curam monstros de Planta.

### Chefe: Silvárion (super raro)

- Fica no **Santuário da Árvore-Mãe**, no fim da trilha, aos pés de uma árvore gigantesca.
- Tipo **Silvestre**, um elemento novo: uma planta mais forte, super efetiva contra Água, Terra e até Planta. Só **Fogo** (e o Ígneo) são fortes contra ele.
- Efeito do Silvestre: **Parasita**: uma semente suga 2,5% da vida a cada meio segundo, cura quem a plantou e deixa 30% mais lento. Os três golpes dele (Galhada Ancestral, Semente Parasita e Selva Viva) causam o efeito.
- Arena própria: **Santuário da Árvore-Mãe** (favorece Silvestre). Perigo: **raízes saem do chão** onde aparece um círculo verde; machucam e prendem (Planta e Silvestre não sentem).
- Nível: 1,4× o nível da equipe + 22 (Nv.26 com equipe Nv.3). Com menos da metade da vida, entra em **fúria**.
- Só é capturado com **Cristal Supremo**. Vencido ou capturado, deixa 3 Cristais Fortes e 2 Supremos e volta no próximo amanhecer.

## Floresta (região de Planta)

- Agora tem **5 árvores gigantes**, uma **ruína com arco e colunas**, cogumelos gigantes, troncos caídos, pedras com musgo, samambaias e muitas flores que brilham.
- **Lago escondido** a oeste, cercado de árvores gigantes, com um píer de madeira. No começo do píer tem um **cristal escondido** (começa como Cristal Forte).
- **2 clareiras** com anel de cogumelos: cada uma tem um grupo (5 + líder) que volta 2 minutos depois de vencido.
- Enquanto você está na Floresta, aparecem **até 6 monstros a mais**, com nível um pouco maior (mais formas evoluídas).
- À noite, **vaga-lumes** voam pela Floresta.

## Regiões

| Região | Onde fica | Quem aparece |
|---|---|---|
| Campo | Centro | Um pouco de tudo; Sol e Luz de dia, Lua e Trevas à noite |
| Floresta | Noroeste | Planta (Musguinho), Espinhal (raro); Luz de dia, Trevas à noite. Daqui sai a Trilha Ancestral |
| Lago | Sudoeste | Água (Gotinho), Aquaraia (raro); Lua à noite |
| Vulcão | Nordeste | Fogo (Brasito), Vulcarapa (raro). Daqui sai o Caminho das Brasas |
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
Super raros (chefes): Ignárion (Ígneo, Caminho das Brasas) e Silvárion (Silvestre, Trilha Ancestral).

## Vida e dano

- A vida começa em **2,2×** o valor base da espécie e cresce **20% por nível**.
- O dano cresce **15% por nível** de quem ataca, um pouco menos que a vida. Por isso as batalhas de nível alto duram um pouco mais.
- Todo dano de golpe (o seu e o dos inimigos) passa por `DANO_GERAL` (0,7 = 30% menos). Num confronto neutro, são necessários uns **10 disparos** no começo e uns **17** no nível 30. Vantagem e desvantagem de elemento mudam bastante esse número.
- Esses valores ficam em `dados.js`: `VIDA_BASE`, `VIDA_POR_NIVEL`, `DANO_POR_NIVEL` e `DANO_GERAL`.

## Arenas de batalha

Cada região tem a sua arena, com raio de 22 m e obstáculos que **bloqueiam o movimento e os disparos** (dá para se esconder atrás deles). A posição dos obstáculos muda a cada batalha.

| Região | Arena | Clima | Favorece (+25% dano, +10% velocidade) | Atrapalha (−20% dano) | Perigo |
|---|---|---|---|---|---|
| Campo | Campo Aberto | Pólen | Ninguém | Ninguém | Nenhum |
| Floresta | Coração da Floresta | Vento de folhas | Planta | Água, Terra | O vento empurra quem não é Planta |
| Vulcão | Cratera do Vulcão | Brasas | Fogo | Planta | Lava queima, mas cura Fogo |
| Lago | Margem do Lago | Chuva | Água | Fogo, Terra | Poças encharcam, mas curam Água |
| Trilha Ancestral | Trilha Ancestral | Vaga-lumes | Planta | Água, Terra | Moitas de espinhos arranham, mas curam Planta |
| Santuário | Santuário da Árvore-Mãe | Esporos brilhantes | Silvestre | Água, Terra, Planta | Raízes saem do chão e prendem |
| Pedreira | Fundo da Pedreira | Poeira | Terra | Fogo, Raio | Pedras caem (Terra não sente) |
| Planalto | Topo da Tempestade | Relâmpagos | Raio | Água, Sol | Raios caem e paralisam (Raio não sente) |

- **Chance dos perigos** (`CHANCE_PERIGO` no `dados.js`):
  - **Lava, poças e espinhos:** a cada meio segundo em cima, 35% de chance de queimar ou encharcar; nos espinhos, 50% de chance de arranhar.
  - **Raios e raízes:** o dano é certo, porque o círculo avisa antes. Só o efeito tem chance: 40% de paralisar e 45% de prender.
  - **Vento:** vem em **rajadas**. A cada 3 s, 50% de chance de soprar e empurrar pelos 3 s seguintes. Quando as folhas correm, é rajada; quando só flutuam, está calmo.
  - **Pedras:** só dão dano e não têm efeito, por isso não têm chance.
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

"Causar o efeito" quer dizer ter uma **chance** de causar (veja a tabela de efeitos abaixo).

Na batalha, o botão mostra "×2" ou "×3" no disparo e uma bolinha colorida nos golpes que causam efeito. Os efeitos ativos aparecem embaixo da barra de vida.

### Efeito de cada elemento

| Elemento | Efeito | O que faz | Duração | Chance (área / perto / cada disparo) |
|---|---|---|---|---|
| Fogo | Queimadura | Perde 4% da vida por segundo | 4 s | 45% / 32% / 23% |
| Ígneo (chefe) | Combustão | Perde 6% da vida por segundo e não pode ser curado | 3 s | 50% / 35% / 25% |
| Silvestre (chefe) | Parasita | Perde 5% da vida por segundo, que vai para quem causou; 30% mais lento | 3,5 s | 50% / 35% / 25% |
| Água | Encharcado | Fica 45% mais lento | 4 s | 45% / 32% / 23% |
| Planta | Enraizado | Não consegue andar, mas ainda ataca | 1,8 s | 35% / 25% / 18% |
| Terra | Soterrado | Defesa cai 30% | 5 s | 45% / 32% / 23% |
| Raio | Paralisia | Não anda nem ataca | 1,4 s | 30% / 21% / 15% |
| Sol | Ofuscado | 40% de chance de errar os golpes | 4 s | 40% / 28% / 20% |
| Lua | Sono | Dorme até levar um golpe | 3 s | 30% / 21% / 15% |
| Luz | Exposto | Recebe 30% a mais de dano | 5 s | 40% / 28% / 20% |
| Trevas | Medo | Não consegue atacar | 2,2 s | 30% / 21% / 15% |

**Chance dos efeitos:** um golpe que "causa efeito" não causa sempre. A cada acerto o jogo sorteia:
- A chance cheia vale para o golpe de **área**. O golpe de **perto** usa 70% dela, e cada **disparo** usa 50%, porque cada tiro de uma rajada sorteia de novo.
- Os efeitos que travam o monstro (Medo, Paralisia, Sono) têm a chance mais baixa.
- Na batalha, o botão do golpe mostra a chance (ex.: "ÁREA 30%"). O Monstruário também mostra.
- Para mudar, mexa em `chance` dentro de `EFEITOS` e em `CHANCE_POR_TIPO`, no `dados.js`.

Dica: trocar de monstro na batalha tira os efeitos negativos de quem saiu.

## Golpes de Trevas (visual)

Os golpes da linha de Trevas invocam coisas da escuridão, e cada evolução ganha algo novo. É só a aparência: dano, alcance e efeitos são os mesmos de antes. Tudo aparece **dentro da área que o golpe acerta**. O código fica em `js/trevas.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Breuzinho | Investida com rastro de fumaça preta | Bola Sombria: núcleo de breu **com olhos** e rastro de fumaça | Vazio: **poça de breu** com 6 tentáculos |
| Sombrelo | Mordida Sombria: uma **bocarra de sombra** fecha no alvo | Onde a bola acerta, **um par de olhos se abre** no ar | **Olhos se abrem** dentro da poça |
| Umbrafel | Garra Abissal: **cópias sombrias** no avanço e **marcas de garra** roxas | Sombras viram **lâminas de sombra** | **Mãos de sombra** saem do chão; quem é atingido é **agarrado** por dedos |
| Noctífero | **Garra gigante** brota do chão embaixo do alvo | **Morcegos de sombra**, e uma **cópia sombria** aparece atrás e atira junto | Abismo: o **Astro Negro** (esfera preta com coroa roxa) sobe, a **arena escurece**, um **anel de olhos** se abre e 9 mãos agarram |

- **Medo:** quem está com medo fica com **um par de olhos roxos** flutuando atrás dele até o efeito acabar.
- **Astro Negro** é o nome do visual do Abismo. Não é "eclipse" para não confundir com o golpe Eclipse da Lua.
- **Leve no celular:** as formas (dedo, dente, olho, morcego) são criadas uma vez só e reaproveitadas; cada golpe some em menos de 2 s.

## Vantagens entre elementos

Um golpe forte contra o alvo dá **1,5×** de dano; um golpe fraco, **0,6×**.

| Elemento | Forte contra |
|---|---|
| Fogo | Planta, Silvestre |
| Água | Fogo, Terra |
| Planta | Água, Terra |
| Terra | Fogo, Raio |
| Raio | Água, Sol |
| Sol | Lua, Trevas |
| Lua | Sol, Fogo |
| Luz | Trevas, Lua |
| Trevas | Luz, Planta |
| Ígneo | Planta, Fogo, Terra, Silvestre |
| Silvestre | Água, Terra, Planta |

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | A página: visual da interface (HUD, botões, telas) |
| `js/dados.js` | **Tabelas do jogo**: elementos, golpes, linhas evolutivas, níveis de evolução, onde cada monstro aparece. Para balancear, mexa aqui. |
| `js/modelos.js` | Os modelos 3D: um construtor por linha que acrescenta peças a cada evolução. No fim, `juntarPecas` une as peças paradas de mesma aparência numa só (de ~24 para ~11 peças por monstro), deixando caudas, asas, pernas e peças animadas separadas |
| `js/plataforma.js` | A vitrine 3D do Monstruário e a animação de evolução |
| `js/mundo.js` | Mapa aberto, regiões, dia e noite, monstros selvagens, cristais e fonte |
| `js/batalha.js` | Batalha em tempo real: movimento, golpes, efeitos, IA do inimigo e captura |
| `js/dungeon.js` | Base das dungeons abertas: a forma do corredor (`Tracado`), portões transparentes, acampamentos, monstros soltos, chefe e clima. Também o `Lote` e o `Bloco`, que juntam peças para ficar leve no celular |
| `js/brasas.js` | Cenário do Caminho das Brasas (braseiros, forja, rio de lava, Trono de Magma, vulcão) |
| `js/raizes.js` | Cenário da Trilha Ancestral e da Floresta (cogumelos, ruínas, lago, raízes, Árvore-Mãe, vaga-lumes, monstros extras) |
| `js/arena.js` | Arenas: chão, obstáculos, clima animado e perigos de cada região (com chance), e o escurecer do Astro Negro |
| `js/trevas.js` | Visual dos golpes de Trevas: poça, tentáculos, mãos, olhos, bocarra, garras, cópias sombrias, morcegos e Astro Negro |
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
- Treinadores rivais
- Dungeons abertas nas outras regiões (Lago, Pedreira, Planalto) usando a mesma base de `dungeon.js`
- Levar as regras (`dados.js`) para o Unreal Engine
