# Cristalia (nome provisório)

Protótipo de jogo 3D low poly de caçar, capturar, evoluir e batalhar com monstros.
Roda no navegador (celular ou PC), feito com JavaScript + [Three.js](https://threejs.org).

## Como jogar

- **Só deitado:** o jogo é feito para o celular deitado. Com o celular em pé, aparece **"Vire o celular"** e tudo pausa (mapa, batalha, monstro invocado) até você virar. No PC, uma janela estreita não é bloqueada. O app Android (versão 1.2 em diante) e o app instalado pelo Chrome já abrem sempre deitados.
- **Login (toda vez que o jogo abre):** digite o **nome de usuário** e a **senha** e toque em **Entrar** (ou **Criar conta**, se o nome é novo). Embaixo aparecem as contas que já entraram neste aparelho: **1 toque** entra, sem digitar a senha. Veja "Contas e nuvem" abaixo.
- **Tela de início:** mostra "Olá, nome" e onde o jogo está salvo (☁ na nuvem ou ⚠ só no celular). Tem **Continuar** (mostra o seu parceiro, o nível e quantos monstros você tem), **Novo jogo** (se já existe um jogo salvo, pede um 2º toque para confirmar), **Monstruário**, **Instalar app** (só aparece quando dá para instalar), **Trocar conta** e **Sair do jogo**.
- **Menu de pausa:** o botão de menu (três risquinhos) no mapa, **Esc** no PC ou o botão **Voltar** do celular. Tem **Continuar jogando**, **Qualidade** (Fraco, Médio ou Forte: veja "Mapa procedural"), **Voltar ao início** e **Sair do jogo**. Tudo salva antes.
- **Sair do jogo:** no app Android, fecha o app. No navegador, a página não pode se fechar sozinha: o jogo salva e avisa que já pode fechar a aba.
- **Botão Voltar do celular (app Android):** fecha o que estiver aberto (painel, Monstruário, painel GM), abre o menu de pausa no mapa e fecha o app na tela de início e no login. Na batalha não faz nada (use Fugir).
- **Começar:** em "Novo jogo", escolha um dos 9 monstros iniciais (um de cada elemento). A tela mostra a linha evolutiva inteira dele.
- **Monstruário:** na tela inicial ou no botão **Monstros** durante o jogo. Mostra todas as linhas, as evoluções, os atributos, os golpes e as vantagens de cada um.
- **Andar:** arraste o dedo no **lado esquerdo** da tela (joystick virtual). No PC: WASD ou setas. O andar segue a câmera: "para cima" anda para onde a câmera está olhando.
- **Câmera (terceira pessoa):** fica um pouco afastada do personagem (no mapa e na batalha). arraste o **controle de câmera** (círculo com setinhas, do lado direito, acima da casa ou das habilidades) ou qualquer parte livre do **lado direito** da tela. Para os lados gira em volta do personagem; para cima e para baixo muda a altura. **Dois toques rápidos** no controle colocam a câmera de volta atrás do personagem. Funciona no mapa e na batalha.
- **Câmera no PC:** arraste com o mouse para girar e use a **rodinha** para aproximar ou afastar.
- **Encontrar monstros:** encoste num monstro selvagem para começar a batalha.
- **Batalha em tempo real:**
  - 3 golpes: **perto** (avança e bate), **disparo** (tiro em linha reta) e **área** (explosão em volta).
  - **Tela enxuta:** o nome e a vida de cada inimigo ficam em cima dele. Os botões do canto são ícones: **cristal** (com a quantidade), **setinha** para escolher outro cristal (mostra a chance de cada um), **setas** para trocar de monstro, **porta** para fugir e **tela cheia**.
  - Os avisos da batalha ficam pequenos, no alto, e somem rápido.
  - O inimigo avisa antes de atacar: uma **faixa ou círculo vermelho no chão**. Saia dele ou use a esquiva.
  - No PC: J, K e L para os golpes. A esquiva não tem mais botão na tela, mas ainda funciona com Espaço.
- **Monstro invocado:** veja "Monstro invocado (companheiro)" abaixo.
- **Capturar:** enfraqueça o monstro e toque no botão do cristal (tecla C). O número ao lado é a chance de captura. A **setinha** ao lado do cristal abre a lista para escolher Comum, Forte ou Supremo (no PC, a tecla V passa para o próximo). Formas evoluídas são bem mais difíceis de capturar.
- **Evoluir:** cada linha tem 4 formas. A forma inicial evolui sozinha no **nível 12** e a 1ª evolução no **nível 30**. A última, a **evolução rara** (a forma final), é no **nível 50** e é feita com um botão no painel **Monstros**, quando o monstro tem tudo:
  - a **missão**: aparece no **Nv.45** ("derrote 60 monstros Nv.35+ com ele"; conta quando o inimigo desmaia enquanto ele está lutando);
  - **3 Asas do Anjo**, **3 Corações do Guardião** e **3.000 de ouro** (gastos na hora de evoluir).
  O cartão do monstro mostra o que já tem (✓) e o que falta (✗). Os selvagens do mapa **não** aparecem na forma final: só os treinadores (conforme o nível) e os chefes de masmorra.
- **Nível máximo: 100.** Os planos da grande atualização (itens, casa no Reino, jardim, afeto, bandeira, raros e lendários com evoluções) estão em `PLANO.md`.
- **Temporada 2:** com a evolução nova, o progresso de todos foi zerado (os jogos salvos antigos são ignorados; as contas continuam).
- **Dia e noite:** um ciclo completo dura 4 minutos (2 de dia e 2 de noite). **Sol e Luz** só aparecem de dia; **Lua e Trevas**, só à noite. O relógio fica no canto superior direito.
- **Equipe:** até 3 monstros. Com a equipe cheia, o capturado vai para a reserva.
- **Reserva:** no painel Equipe, a aba **Reserva** mostra **todos** os monstros que você tem (os da equipe aparecem marcados). Perder uma batalha nunca apaga monstros: você acorda na casa ou no castelo (veja "Casa").
- **Proteção:** o jogo guarda uma cópia de cada monstro que você já teve. Se algum sumir da equipe e da reserva por qualquer motivo, ele volta sozinho para a Reserva, com um aviso.
- **Fonte de cura:** a fonte na praça do castelo, no **Reino**, cura todos os seus monstros. É a única fonte do jogo (a do meio do Campo virou uma placa que aponta para o Reino).
- **Começo:** o jogo novo começa no Reino, na frente da fonte do castelo, com 3 Poções de Cura e 1 de Reviver. Siga a **Estrada Real** para chegar ao mapa (veja "O Reino").
- **Bolsa:** o botão do canto de baixo (tecla **B** no PC). Dentro dela ficam a bandeira, a casa, o jardim, as frutas, os itens raros, as poções, os cristais e os ovos. Veja "Bolsa, ouro e loja".
- **Nível dos selvagens:** acompanha o nível da sua equipe e aumenta quanto mais longe do centro você vai. Nas bordas aparecem as formas evoluídas. A exceção é **em volta da boca do Reino** (55 m): ali só aparecem monstros fracos (Nv.2 a 5, formas iniciais), sem grupos e sem tipo duplo.
- **Monstros perto de você:** os selvagens e os grupos aparecem em volta do jogador (até ~90 m) e somem quando ficam longe; assim o mapa grande não fica mais pesado.
- O progresso é salvo sozinho: no celular a cada 5 s e na nuvem (veja abaixo).
- **Tela cheia:** botão na tela inicial, no mapa e na batalha. Alguns navegadores não deixam (o iPhone, por exemplo); nesse caso, use "Adicionar à tela inicial".

## Contas e nuvem (Firebase)

- **Cada conta tem o seu jogo salvo.** A conta fica na **nuvem** (Firebase, projeto `cristalia-91fd6`): entre com o mesmo nome e senha em qualquer celular, no app ou no site.
- **Nome:** de 2 a 16 letras, números, espaço, - ou _. Acento e maiúscula não mudam a conta ("Lâmina" e "lamina" são a mesma). Cada nome tem um dono só.
- **Senha:** pelo menos 6 letras ou números (é o mínimo do Firebase).
- **Como o nome vira conta:** o jogo transforma o nome num "e-mail de mentira" (`lamina@cristalia.jogo`). Por isso **não existe "esqueci a senha"**: perdeu a senha, perdeu a conta.
- **Quando salva na nuvem:** a cada 30 s enquanto você joga, no fim de cada batalha, ao voltar para o início, ao trocar de conta, ao sair e quando o app é minimizado. No celular continua salvando a cada 5 s.
- **Ao entrar:** o jogo compara a cópia da nuvem com a do celular e **fica com a mais recente**. Jogando em 2 celulares, vale o que salvou por último.
- **Sem internet:** o 1 toque numa conta que já entrou no aparelho funciona com a cópia do celular, e o jogo sobe para a nuvem quando a internet voltar ("⚠ sem internet" na tela de início). Entrar com senha precisa de internet; se não der, aparece **Jogar só neste aparelho (sem nuvem)**, que cria uma conta que não vai para a nuvem.
- **O jogo salvo de antes das contas** vai sozinho para a 1ª conta que entrar (aparece um aviso). A cópia antiga continua guardada no aparelho, por segurança.
- **Conta GM:** nome **GM** e a senha do GM. Ela fica **só no aparelho** (não vai para a nuvem), não aparece na lista de 1 toque e abre o painel GM. O nome GM é reservado: ninguém cria uma conta na nuvem com ele.
- **Segurança:** a `apiKey` que está no código não é secreta (ela só diz qual projeto usar). Quem protege os dados são as **regras do Firestore**: cada jogador só lê e grava `jogadores/<o próprio uid>`. A senha do GM não fica no código, só a "impressão digital" dela (SHA-256). Mesmo assim, uma senha de 4 números dá para descobrir testando todas.
- **No aparelho** (localStorage): `cristalia-contas` (contas que já entraram, para o 1 toque), `cristalia-save-v1:<id da conta>` (o jogo de cada conta) e `cristalia-save-v1` (o jogo salvo antigo, guardado).
- O ajudante do app (`sw.js`) **nunca guarda** as conversas com o Firebase: elas vão sempre direto para a internet.
- **Regras do Firestore** (no console do Firebase, Firestore → Regras):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /jogadores/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
  ```

## Instalar no celular (app que se atualiza sozinho)

O jogo é um **PWA** (aplicativo web instalável). Ele fica no site **https://laminasombria1-dotco.github.io/YonkouTestes/** e, depois de instalado, abre como um app normal.

**No Android (Chrome):**
1. Abra o endereço acima no **Chrome**.
2. Toque em **Instalar app**, na tela inicial do jogo. Se o botão não aparecer, use o menu **⋮ → Instalar app** (ou "Adicionar à tela inicial").
3. O Cristalia aparece na gaveta de apps, com ícone próprio, e abre em tela cheia.

**Atualizações:**
- Toda vez que uma mudança no jogo entra na branch **main**, o GitHub publica o site sozinho em cerca de 1 minuto (`.github/workflows/cristalia-site.yml`).
- O app instalado baixa a versão nova ao ser aberto com internet. Se a rede estiver lenta, ele abre a versão guardada e pega a nova na próxima vez.
- A data e o código da versão aparecem embaixo, na tela inicial do jogo.
- **Sem internet**, o app abre a última versão baixada.
- O progresso salvo fica no celular (e na nuvem) e não se perde com as atualizações.

**APK para Android:** também dá para instalar como APK. O projeto do app fica em `apps/cristalia-android` (veja o README de lá). O APK abre o mesmo site, então recebe as mesmas atualizações.

**Arquivos do app:** `manifest.webmanifest` (nome, ícone, cores do app e `"orientation": "landscape"`: o app instalado abre sempre deitado), `sw.js` (o "ajudante" que guarda o jogo e busca as atualizações) e `icones/`.

## Monstro invocado (companheiro)

- **Invocar:** o botão com a patinha, ao lado de "Montar casa", invoca o **1º monstro da equipe** (o mesmo que entra primeiro na batalha). Para trocar qual vem, use "Pôr na frente" no painel Equipe. O botão vira **Guardar**. No PC: tecla **R**.
- **Seguir:** ele anda uns 2 m atrás do treinador, com as animações de parado e correndo, desviando de árvores e pedras. Se ficar a mais de 15 m (teleporte, fim de batalha), aparece do lado do treinador.
- **Controlar** (tecla **T**): o joystick e a câmera passam para o monstro e o **treinador fica parado e protegido**: nenhum selvagem vem atrás dele nem começa batalha.
  - Aparecem os **3 golpes**, iguais aos da batalha e com a mesma recarga. Eles saem para a frente do monstro, **no ar**: não precisam de inimigo e **não machucam** ninguém (é só para mostrar). Espaço faz a esquiva.
  - O monstro tem uma **coleira de 20 m** em volta do treinador.
  - **Voltar ao treinador** (botão no alto, tecla T, Esc ou o botão Voltar do celular) devolve o controle.
- **Golpes que precisam de alvo:** no ar, o disparo do Faisquinho nunca vira **Choque** (só vira se o tiro acertar alguém), a vinha do Musguinho estica mas não puxa nada e o Pedregulho cai a 7 m à frente.
- **Batalha:** se o treinador encostar num selvagem, o companheiro some e a batalha começa normal; depois ele volta a seguir.
- Se o monstro desmaiar, ele volta sozinho para o cristal. Se a equipe mudar (outro na frente ou evolução), o companheiro troca sozinho.
- Fica salvo se ele estava invocado (`estado.pet`).
- **Código:** `js/companheiro.js` (seguir, botões, trocar o controle) e `js/treino.js` (o modo treino). O modo treino usa o **mesmo motor da batalha**: os golpes de todas as linhas funcionam igual, sem inimigos e sem dano. Tudo do treino fica numa "camada" centrada no treinador, como uma arena invisível de 22 m, que sobe e desce acompanhando o chão embaixo do monstro. Os obstáculos do mapa seguram o monstro e os tiros.
- **Limite:** o mapa tem morros e a arena de batalha é plana. Num golpe longo num morro, uma parte do efeito pode entrar no chão ou flutuar um pouco.

## Bandeira do Reino (onde você renasce)

- Você começa com a **bandeira do Reino na bolsa**. Abra a **Bolsa** (botão do canto inferior direito) e use o botão da bandeira, que muda conforme a situação:
  - **Fincar a bandeira aqui:** finca na sua frente (se ali estiver ocupado, procura o lugar livre mais perto).
  - **Guardar a bandeira:** aparece quando você está perto dela.
  - **Mudar a bandeira para cá:** aparece quando você está longe.
- Em volta da bandeira (10 m) é **área segura**: monstros não aparecem e dão meia-volta.
- Se toda a equipe desmaiar numa batalha:
  - **com a bandeira fincada:** você renasce nela, e **só os desmaiados** voltam com **1/4 da vida** (**2/4** com a bandeira nível 2); os outros ficam como estavam;
  - **sem a bandeira:** você acorda na fonte do castelo, com todos curados.
- **A bandeira não cura** (a cura é a fonte do castelo e as poções). Não dá para fincar dentro das masmorras nem na água ou na lava.
- **Evolui** com Galhos Raros + ouro (vá até ela e abra a Bolsa): nível 2 = **3 Galhos + 400 de ouro** (bandeira maior, ponta e faixas douradas, brilho no chão).
- Fica salva em `estado.bandeira` (posição) e `estado.bandeiraNivel`. Os números em `BANDEIRA` (`js/bolsa.js`); o desenho em `criarBandeira(nivel)` (`js/modelos.js`).

## Casa no Reino

- A casa do jogador fica **fixa no Reino**, entre a arena e o portão (lugar `CASA_REINO` em `js/reino.js`), virada para o caminho do portão. Ela **não cura e não tem loja** (as funções antigas acabaram): para se curar fora do castelo, use poções.
- Perto dela dá para **fundir cristais** e cuidar do **jardim** (veja "Jardim e afeto").
- **Evolui do nível 1 ao 5** com Galhos Raros + ouro (vá até ela e abra a Bolsa). Veja "Evolução da casa" abaixo.

## Jardim e afeto

- **Jardim:** os canteiros ficam **na frente da casa**, no Reino (do lado do caminho do portão). Tem **nível próprio**, subido com Galhos Raros + ouro (Bolsa, perto da casa):

  | Nível | Vagas | Custo para chegar |
  |---|---|---|
  | 1 | 2 | (começo) |
  | 2 | 4 | 2 Galhos + 300 de ouro |
  | 3 | 6 | 5 Galhos + 1.000 de ouro |
  | 4 | 8 | 9 Galhos + 3.000 de ouro |
  | 5 | 10 | 14 Galhos + 6.000 de ouro |

- **Sementes** (na **Loja do Reino**, a barraca listrada). Cada uma só pode ser plantada se a **casa** tiver o nível pedido. Os nomes ficam em inglês:

  | Semente | Casa | Preço | Cresce em | Afeto de cada fruta |
  |---|---|---|---|---|
  | Strawberry | 1 | 20 | 30 min | 1 |
  | Field Apple | 2 | 50 | 1 h | 2 |
  | Moon Grape | 3 | 120 | 2 h | 3 |
  | Sun Peach | 4 | 250 | 4 h | 5 |
  | Crystal Fruit | 5 | 500 | 8 h | 8 (e +5% de chance de Coração) |

- As plantas crescem **em tempo real** (mesmo com o jogo fechado). Pronta, ela dá **2 frutas** ao colher. Se não for colhida em **12 horas**, ela **morre** (aí é só limpar o canteiro). Plantar e colher: abra a **Bolsa** perto da casa. O alimento **não é vendido** na loja: só vem do jardim.
- **Afeto** (nível 1 a 10, aparece no cartão do monstro e na Bolsa): dê frutas na seção **Frutas e afeto** da Bolsa (em qualquer lugar). Cada nível pede mais pontos (5 no nível 1, 10 no 2... 45 no 9).
  - **Coração do Guardião:** cada fruta tem chance de dar um (**3%** no afeto 1, +2% por nível, até 21% no 10), e ao **subir de nível** de afeto vem **1 garantido**.
  - Depois de **3 frutas**, o monstro fica **satisfeito** por 1 dia do jogo (4 minutos jogando). Como dá para levar até 3 monstros, é preciso cultivar para os 3.
- **Código:** `js/jardim.js` (`SEMENTES`, `JARDIM`, `AFETO`, plantar, colher, alimentar e os canteiros em 3D). Fica salvo em `estado.jardim`, `estado.sementes`, `estado.frutas` e no afeto de cada monstro (`m.afeto`). Leve no celular: no máximo 10 plantas com materiais fixos, redesenhadas 1 vez por segundo e só perto da casa.

## Bolsa, ouro e loja

- **Ouro** é a moeda do jogo (no código e no jogo salvo ela continua se chamando `moedas`).
- **Itens raros** (seção própria na Bolsa): Galho Raro, Asa do Anjo e Coração do Guardião.

- **Moedas de ouro** (a pílula dourada no alto da tela):

  | Vitória | Moedas |
  |---|---|
  | Monstro selvagem | 5 a 10 |
  | Grupo (5 + líder) | 4 por comum e 10 pelo líder (30 no total) |
  | Chefe (Ignárion, Silvárion) | 300 |
  | Treinador da arena (1ª vez) | Gill 80, Cris 100, Lana 130, Sheyla 170, Rei Julius 500 |
  | Treinador (revanche) | metade |

- **Poções:**

  | Poção | O que faz | Preço |
  |---|---|---|
  | Poção de Cura (vermelha) | Cura metade da vida de 1 monstro de pé | 40 |
  | Poção de Reviver (amarela) | Levanta 1 monstro desmaiado com metade da vida | 120 |

- **Loja:** a barraca listrada azul e branca da vila do Reino. Chegue perto (aparece "Loja de Poções") e encoste na frente dela. Dá para comprar de 1 em 1 ou de 5 em 5.
- **Bolsa:** o Campeão do Reino (coroa e ouro do Reino), a bandeira (fincar, guardar, mudar, evoluir), a casa e o jardim, as frutas e o afeto, os itens raros, as poções (cada monstro da equipe e da reserva tem o botão **Curar** ou **Reviver**), os ovos e os cristais (a fusão precisa estar perto da casa). O mundo fica parado enquanto a bolsa está aberta.
- **Na batalha:** o botão do **frasco** (tecla **P**) mostra quantas poções você tem e abre a escolha: **Cura** (no monstro que está lutando) ou **Reviver** (no 1º desmaiado da equipe; depois toque em Trocar para mandar ele de volta). Entre uma poção e outra há **10 s de recarga** (o botão escurece e vai clareando).
- **Jogos salvos antigos** começam com 0 de ouro e 3 Poções de Cura.
- **Código:** `js/bolsa.js` (preços, moedas, bolsa e loja) e o botão da batalha em `js/batalha.js`. Fica salvo em `estado.moedas` e `estado.pocoes`.

## Ovo Misterioso

- O **Rei Julius** entrega **1 ovo** na 1ª vitória contra ele (quando você domina a arena) e **2 ovos** na 2ª vitória.
- Eles ficam na Bolsa, com o tempo que falta, e **chocam depois de 10 minutos de jogo** (todos ao mesmo tempo, um de cada vez; o tempo só passa no mapa e na batalha, não no menu nem com o jogo fechado).
- Quando choca (no mapa), aparece uma cena: o ovo treme cada vez mais, a luz roxa de dentro aumenta, ele racha, as escamas voam e o monstro aparece.
- **Quem nasce** (na forma inicial e no **Nv.1**): **tipo duplo 70%** (Brotobrasa, Vaporito ou Imanito), **raro 25%** (Espinhal, Aquaraia ou Vulcarapa) e **lendário 5%** (Ignárion ou Silvárion). Vai para a equipe (ou para a reserva, se ela estiver cheia).
- **Código:** `js/ovo.js` (o ovo em 3D, a cena do nascimento, o tempo e `CHANCES_OVO`/`sortearDoOvo`). Fica salvo em `estado.ovos = [{ restante }]`.

## O Reino (o novo centro do jogo)

O Reino fica **fora da borda do mapa**, como as dungeons, mas não é dungeon: é o lugar seguro onde o jogo começa. Ele sai pela borda no lado **mais longe das duas dungeons e das montanhas da Neve** (a direção vem da semente do mapa; na semente de todos, fica depois do Deserto). Não tem tela de carregamento: você entra andando.

- **Estrada Real:** um calçamento de pedra cinza do Campo até a boca do Reino, com lanternas e bandeiras azuis dos dois lados. Na estrada **nenhum selvagem aparece**, e os que chegam perto dão meia-volta (é área segura, como a casa). Não há rio cortando a estrada. No meio do Campo, uma **placa com uma seta** aponta para ela.
- **O platô:** redondo (62 m de raio), plano, cercado de montanhas verdes, com uma **muralha** de torres de telhado azul e um **portão**.
- **Castelo** no meio, no estilo de conto de fadas: muralha branca em quadrado com ameias, 4 torres redondas nos cantos com telhado pontudo cinza-azulado e ponta dourada, o palácio com janelinhas no telhado, a torre de menagem e 2 torres altas e finas, a entrada com arco, varanda de madeira, brasão e escada, sobre uma base de pedra com grama e pinheiros. As paredes brancas usam um material com um pouco de luz própria (ficam brancas até na sombra). Na frente ficam a **praça e a fonte de cura**. É ali que você nasce e acorda.
- **Vila:** casas de pedra e madeira com telhado azul e janelas acesas. Uma delas é a **loja de poções** (placa pendurada e barraca listrada azul e branca): encoste na barraca para comprar.
- **Arena fechada** (coliseu de telhado vermelho), ao lado da praça da fonte (nenhuma casa fica perto dela). O **portão** dá para a praça: 2 torres de pedra com telhado vermelho e estandartes, a faixa com as cores dos 5 treinadores em cima do arco e **2 portas de madeira com faixas de ferro**, que **abrem sozinhas** quando você chega a 13 m (ou está lá dentro) e fecham quando você se afasta. Parede de 2 andares de arcos, arquibancada em degraus com **plateia** (~320 bonequinhos coloridos), túnel do portão até a areia (sem teto, para a câmera passar), e o **palco** com as 5 bandeiras. Dentro dela a câmera chega mais perto e fica mais alta.
- **Os treinadores** ficam **dentro da arena, cada um na sua plataforma** de pedra (com a cor do elemento e a bandeira dele), espalhadas pela areia em zigue-zague do portão até o palco. Cada plataforma é mais alta que a anterior, e a do Campeão tem uma coroa dourada em volta. Na ordem da luta:

  | # | Treinador | Elemento | Níveis dos monstros (1ª vez) | Onde fica |
  |---|---|---|---|---|
  | 1 | **Gill** | Fogo | 20 a 24 | perto do portão, à direita de quem entra |
  | 2 | **Cris** | Trevas | 25 a 29 | perto do portão, à esquerda |
  | 3 | **Lana** | Luz | 30 a 34 | no meio, à direita |
  | 4 | **Sheyla** | Água | 40 a 45 | no meio, à esquerda |
  | 5 | **Julius** (o Rei, Campeão) | Planta | 46 a 50 (o mais forte) | no fundo, na frente do palco, na plataforma mais alta |

  Depois que a arena é dominada (os 5 vencidos uma vez), **todos passam a lutar no nível 50**. Os números ficam em `TREINADORES` e `NIVEL_REVANCHE`, no `js/reino.js`.

### Lutas da arena

- **Para lutar:** chegue perto de um treinador (aparece uma placa com o nome, o elemento, os níveis e "sua vez!", "vencido ✓" ou "depois") e **encoste na frente do degrau da plataforma**. Ele fala e a luta começa. Para chamar de novo, afaste-se um pouco e volte.
- **Ordem:** só luta quem é a sua vez. Os outros dizem quem você precisa vencer antes.
- **Equipes** (entram **um de cada vez**, como nas ondas dos grupos):

  | Treinador | Monstros (1ª vez) |
  |---|---|
  | Gill | linha do Fogo Nv.20, Vulcarapa Nv.22, linha do Fogo Nv.24 |
  | Cris | linha de Trevas Nv.25, linha da Lua Nv.27, linha de Trevas Nv.29 |
  | Lana | linha da Luz Nv.30, linha do Sol Nv.32, linha da Luz Nv.34 |
  | Sheyla | linha da Água Nv.40, Aquaraia Nv.43, linha da Água Nv.45 (na revanche, Nv.70, a Aquaraia vem como **Mantaré**) |
  | Rei Julius | **todos no Nv.50 e na forma final**: Florestral, Espinhal, Florestral e Florestral (4 monstros) |

  A forma de cada linha depende do nível: Nv.12 em diante a 1ª evolução, Nv.30 a 2ª, e do **Nv.50** a forma final (os treinadores podem ter a forma final; os selvagens do mapa não). Os raros com formas novas também mudam pelo nível (Nv.55, 70 e 90).
- **Regras da luta:** não dá para capturar (os botões de cristal somem), e **Fugir = desistir**: você sai pelo portão da arena.
- **A Arena do Reino da batalha:** o mesmo coliseu, em volta da areia de 22 m, com a plateia (~730 bonequinhos) e o treinador assistindo da plataforma dele, do lado de lá. Cai confete. Não tem perigo e não favorece nenhum elemento. **A plateia pula** quando um monstro do treinador desmaia, e de novo no mapa quando você vence.
- **Vencer:** experiência cheia (sem o desconto de grupo), ouro (veja "Bolsa, ouro e loja") e cristais. Na 1ª vez: Gill e Cris dão 3 comuns + 1 Forte, Lana 3 comuns + 2 Fortes, Sheyla 3 Fortes e o Rei 3 Fortes + 2 Supremos. Nas revanches: 1 Forte (o Rei dá mais 1 Supremo).
- **Perder:** você acorda na fonte do castelo, com todos curados. Os treinadores que você já venceu **continuam vencidos**.
- **Dominar a arena:** vencendo o Rei Julius, você vira o **Campeão do Reino** e ganha:
  - a **Coroa do Rei**: aparece na cabeça do seu personagem (na Bolsa, seção Campeão do Reino, dá para guardar ou vestir);
  - o título **Campeão do Reino** (na Bolsa e no resumo do jogo salvo, na tela de início);
  - o **ouro do Reino**: **100 de ouro a cada 10 minutos de jogo**, guardando no máximo **600** (1 hora). Para receber, **passe na fonte do castelo**;
  - **1 Ovo Misterioso** (veja abaixo). A **2ª vitória** contra o Rei dá **2 ovos**.
- **Revanches** (depois de dominar, em qualquer ordem): cada treinador fica mais forte: **Gill Nv.50, Cris Nv.55, Lana Nv.60, Sheyla Nv.70 e o Rei Nv.100** (com as formas finais).
- **Fica salvo** em `estado.arena` (`vencidos` de 0 a 5, `dominada`, `vitoriasRei`), `estado.campeao`, `estado.coroa`/`coroaVestida` e `estado.tesouro` (o ouro do Reino guardado). Os níveis de revanche ficam em `revanche` de cada treinador (`TREINADORES`, `js/reino.js`) e o ouro do Reino em `TESOURO` (`js/main.js`).
- Lá dentro não aparecem monstros, não nascem árvores do mapa e não dá para fincar a bandeira.
- **Leve no celular:** todas as peças paradas do Reino viram **4 malhas** (cores normais, peças vistas dos dois lados, o que brilha e as paredes brancas do castelo), e a plateia é **1 lote**. A colisão usa círculos na `mundo.grade`, como o resto.
- **Código:** a forma (corredor + platô) é o `REINO` em `js/dungeon.js` (`TracadoReino`, com `paraMundo` e `paraLocal`), a direção e a Estrada Real ficam em `js/mapa/gerador.js` (`ANG_REINO`, `ESTRADA`, `naEstradaReal`) e o cenário em `js/reino.js`.

## Evolução da casa

| Nível | Como fica | Custo para chegar |
|---|---|---|
| 1 | Cabana simples, telhado vermelho | (começo) |
| 2 | Sobrado com 2º andar e telhado azul | 4 Galhos Raros + 500 de ouro |
| 3 | + varanda coberta e cerca com flores | 8 Galhos Raros + 1.500 de ouro |
| 4 | Casa grande, mais larga, com torrezinha redonda | 14 Galhos Raros + 4.000 de ouro |
| 5 | Casarão: ala nova, torre de telhado dourado com a bandeira do Reino e lanternas | 22 Galhos Raros + 8.000 de ouro |

- **Para evoluir:** vá até a sua casa no Reino, abra a **Bolsa** e toque em **Evoluir** (a seção Casa no Reino mostra o nível e o que falta).
- **Galho Raro** (o antigo nome era Madeira Rara; aparece na Bolsa) e **Asa do Anjo** (para a evolução rara): caem **por sorte** só dos **chefes de masmorra** (e, no futuro, dos reis de dungeon). Os monstros do mapa, os acampamentos e os treinadores **não dão**:

  | Quem você vence (ou captura) | Os 2 | Só o galho | Só a asa | Nada |
  |---|---|---|---|---|
  | Chefe de masmorra | 25% | 45% | 20% | 10% |
  | Rei de dungeon (as dungeons ainda vão ser feitas) | 10% | 40% | 15% | 35% |

  No total: no chefe, **70%** de cair galho e **45%** de cair asa; no rei, 50% e 25%.

- **Fica salvo** em `estado.casaNivel` e `estado.galhos` (as Asas em `estado.asas` e os Corações em `estado.coracoes`). Os números ficam em `CASA` e `DROPS` (com `sortearDrop`), no `js/bolsa.js`; o desenho dos 5 níveis em `criarCasa(nivel)`, no `js/modelos.js` (as peças do mesmo material viram uma malha só).

## Grupos de monstros

- Pelo mapa andam **grupos de 6 monstros**: 5 comuns e 1 **líder**, que é maior e usa coroa dourada.
- **Níveis:** acompanham a sua equipe. Comuns ficam em ~1,1× o seu nível médio + 2; o líder em ~1,4× + 8. No começo do jogo (equipe Nv.3), os comuns ficam no Nv.5 e o líder no Nv.12.
- **Quantidade:** 1 grupo no começo e mais 1 a cada 5 níveis da equipe, até **4 grupos**.
- **Cada monstro do grupo se move sozinho:** tem posição, direção, ritmo e animação próprios (uns andam enquanto outros param). Não ficam em fileira: ficam soltos numa área de ~11 m em volta do ponto do grupo.
- **Duplas soltas:** cada um fica a **~2 m do parceiro** (entre 1,5 e 3,5 m) e a **pelo menos 5 m das outras duplas** (medidos entre os corpos). As duplas são: 1ª e 2ª dupla (as que lutam primeiro) e o 5º monstro junto do líder.
- **Perseguição:** quando você chega a ~10 m de **qualquer** monstro do grupo (7 m nos acampamentos), todos vêm atrás de você, cada um na sua velocidade.
- **Espaço entre grupos:** um grupo novo só aparece a pelo menos **40 m** dos outros, e grupos que se aproximam a menos de **32 m** se afastam.
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
- Também evoluem no Nv.12, 30 e 50 (a do Nv.50 é a evolução rara) e ganham as mesmas melhorias. A partir da 2ª evolução, o **disparo também causa o efeito** do elemento dele, então eles causam dois efeitos diferentes.
- **Golpes:** perto e área são do 1º elemento; o disparo é do 2º.
- **Na defesa:** o golpe é comparado com os dois elementos e os multiplicadores se somam. Um monstro nunca é fraco contra o próprio elemento.
- **Captura mais difícil:** formas inicial e 1ª evolução só com **Cristal Forte** (ou melhor); 2ª evolução e forma final só com **Cristal Supremo**.
- Valem 50% a mais de experiência e, ao serem vencidos, deixam 1 Cristal Forte.

| Tipo | Nv.1 | Nv.12 | Nv.30 | Nv.50 (rara) | Onde aparece |
|---|---|---|---|---|---|
| Fogo + Planta | Brotobrasa | Chamafolha | Ardentroco | Florinferno | Floresta, Vulcão, Campo |
| Água + Fogo | Vaporito | Fumarolo | Gêiserão | Caldeirax | Lago, Vulcão, Campo |
| Terra + Raio | Imanito | Magnetito | Ferrovolt | Titanvolt | Deserto, Picos Nevados, Campo |

## Cristais de captura

| Cristal | Cor | Chance | Como conseguir |
|---|---|---|---|
| Comum | Azul | 1× | Brilhos azuis no mapa, vitórias |
| Forte | Roxo | 1,5× | Brilhos roxos no mapa (raros), líder de grupo (+1), vencer um tipo duplo (+1), fundir 3 comuns |
| Supremo | Dourado | 2,2× | Brilhos dourados (muito raros), tipos duplos evoluídos (às vezes), fundir 3 fortes |

- **Fundir:** no painel **Equipe**, perto da sua casa, 3 cristais iguais viram 1 do tipo acima.
- Na batalha, o jogo escolhe sozinho o cristal mais fraco que funciona no alvo; o botão **Tipo** troca na mão.
- Os cristais do chão reaparecem 1 minuto depois, com a cor sorteada de novo.
- São cerca de 40 espalhados pelo mapa, mais os **lugares secretos**: embaixo do arco de pedra do Deserto e na margem do oásis (Forte), ao lado do cristal de gelo gigante da Neve (Supremo) e no píer do lago escondido da Floresta (Forte).

## Caminho das Brasas (dungeon aberta da região de fogo)

Sai da borda do mapa pelo bioma de Lava, depois do Vulcão, seguindo a estrada de braseiros (a direção depende da semente do mapa). Não tem tela de carregamento: você entra andando.

- **4 etapas**, separadas por portões. Cada etapa tem **1 acampamento** no meio, com um grupo (5 comuns + 1 líder). Quanto mais fundo, mais fortes:

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
- Não dá para fincar a bandeira lá dentro (calor demais). Finque antes da entrada.
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

Sai da borda do mapa pela Floresta, seguindo as lanternas de flor (a direção depende da semente do mapa). Funciona igual ao Caminho das Brasas (as duas usam a mesma base em `js/dungeon.js`).

| Etapa | Nome | Comuns (equipe Nv.3) | Líder (equipe Nv.3) | O que tem lá |
|---|---|---|---|---|
| 1 | Bosque dos Cogumelos | Nv.5 | Nv.12 | Cogumelos gigantes, troncos caídos, cogumelos e flores que brilham |
| 2 | Ruínas de Musgo | Nv.8 | Nv.15 | Muros e colunas com musgo, arcos antigos, uma cabeça de pedra com olhos de jade |
| 3 | Lago Escondido | Nv.11 | Nv.18 | Um lago atravessa o caminho: só se passa pela ponte de madeira. Vitórias-régias e cachoeiras |
| 4 | Raízes Gigantes | Nv.14 | Nv.21 | Árvores enormes, raízes em arco, cipós e frutos brilhantes |

- Quem aparece: só espécies que já existiam (Planta evoluída como Troncudo e Florestral, Espinhal, Fogo + Planta, e visitantes de Água, Terra, Luz e Trevas). Nenhum monstro novo além do chefe.
- Não dá para fincar a bandeira lá dentro (as raízes não deixam). Finque antes da entrada.
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

- Os lugares fixos da Floresta (árvores gigantes, ruína, clareiras e lago escondido) ficam em volta do centro dela, no mesmo desenho de antes (só girado para o lado da Trilha Ancestral).
- Tem **5 árvores gigantes**, uma **ruína com arco e colunas**, cogumelos gigantes, troncos caídos, pedras com musgo, samambaias e muitas flores que brilham.
- **Lago escondido**, cercado de árvores gigantes, com um píer de madeira. No começo do píer tem um **cristal escondido** (começa como Cristal Forte).
- **2 clareiras** com anel de cogumelos: cada uma tem um grupo (5 + líder) que volta 2 minutos depois de vencido.
- Enquanto você está na Floresta, aparecem **até 6 monstros a mais**, com nível um pouco maior (mais formas evoluídas).
- À noite, **vaga-lumes** voam pela Floresta.

## Regiões

| Região | Bioma | Quem aparece |
|---|---|---|
| Reino | Fora da borda, no fim da Estrada Real: castelo, vila, loja e arena | Ninguém (é seguro). Em volta da boca, monstros fracos |
| Campo | No centro (com a placa que aponta para o Reino) | Um pouco de tudo; Sol e Luz de dia, Lua e Trevas à noite |
| Floresta | Floresta: árvores, pinheiros, clareiras e morrinhos | Planta (Musguinho), Espinhal (raro); Luz de dia, Trevas à noite. Daqui sai a Trilha Ancestral |
| Lago | Em volta dos lagos (no Campo, na Floresta e o oásis do Deserto) | Água (Gotinho), Aquaraia (raro); Lua à noite |
| Vulcão | Lava: chão vulcânico, vulcão com cratera, rios de lava | Fogo (Brasito), Vulcarapa (raro). Daqui sai o Caminho das Brasas |
| Deserto | Deserto: dunas, cânions, cactos, arco de pedra e oásis | Terra (Pedrisco) |
| Picos Nevados | Neve: montanhas, pinheiros nevados, rochas congeladas, lagos congelados e o cristal de gelo gigante | Raio (Faisquinho), com relâmpagos |

Os monstros de cada região são os mesmos de antes: o Deserto ocupa o lugar da Pedreira (Terra) e os Picos Nevados, o do Planalto da Tempestade (Raio). Onde fica cada bioma depende da semente do mapa (veja abaixo).

## Mapa procedural

O mapa é **gerado por uma semente** (seed): um número que decide tudo (onde fica cada bioma, o relevo, os rios, os lagos, as árvores). A mesma semente sempre dá o mesmo mapa. **Todos os jogadores usam a mesma semente**: o mundo é um só para todos. O código fica em `js/mapa/`.

- **Tamanho:** mapa redondo de **200 m de raio** (cerca de 5 vezes a área do mapa antigo; atravessar leva ~55 s andando). Na borda o chão sobe e há montanhas.
- **Biomas:** o **Campo** fica no meio, com a placa do Reino. Em volta, os 4 biomas (Floresta, Deserto, Neve e Lava), em ordem sorteada, com tamanhos diferentes e **bordas onduladas**. Onde dois se encontram, as cores e o relevo se misturam aos poucos.
- **Relevo:** morrinhos no Campo e na Floresta, dunas e cânions no Deserto, cadeias de montanhas na Neve (com neve no alto dos picos) e um vulcão com cratera de lava no meio da Lava.
- **Água:** rios (rasos: dá para atravessar andando), lagos (o meio é fundo: não dá para entrar), lagos congelados na Neve (dá para andar em cima) e rios de lava (não dá para entrar).
- **Pontos de interesse:** o vulcão com lava na cratera, o arco de pedra do Deserto, o oásis com palmeiras, o cristal de gelo gigante da Neve, os lugares fixos da Floresta, as entradas das duas dungeons e a boca do Reino. Perto de alguns tem cristal escondido.
- **Chunks:** o mapa é dividido em quadrados de **32 m**. Só os chunks perto de você existem na memória; os novos são criados aos poucos enquanto você anda (no máximo ~3 ms por quadro) e os que ficam longe são apagados.
- **Leve no celular:**
  - cada tipo de objeto (árvore, pedra, cacto...) é desenhado **num lote só por chunk** (InstancedMesh);
  - o que está fora da tela não é desenhado;
  - os chunks longe têm o chão mais simples e não têm os objetos pequenos (LOD);
  - os cristais longe não são desenhados;
  - a névoa esconde o fim da visão;
  - não há sombras nem pós-processamento.
- **Nada flutua:** a altura que o jogo usa é a mesma dos triângulos desenhados, e cada objeto encosta no ponto mais baixo em volta dele. Em penhascos não nasce nenhum objeto.

### Qualidade (menu de pausa)

| Qualidade | Chunks em volta | Distância de visão | Objetos | Resolução máx. |
|---|---|---|---|---|
| Fraco | 2 (~21 chunks) | 78 m | 60% | 1× |
| Médio | 3 (~37 chunks) | 108 m | 100% | 1,5× |
| Forte | 4 (~69 chunks) | 138 m | 120% | 1,75× |

Na primeira vez, o jogo escolhe sozinho: **Fraco** em celular com 4 núcleos ou menos (ou pouca memória) e **Médio** nos outros. A escolha fica guardada no aparelho.

### Configurações (`js/mapa/config.js`)

Tudo dá para ajustar lá: a semente, o tamanho do mundo, o tamanho dos chunks, os quadrados do chão por chunk (perto e longe), o tamanho do Campo, a quantidade de biomas (4 a 8; com mais de 4 eles se repetem em volta), a distância e o tamanho dos biomas (e quanto cada um ocupa), o quanto as bordas são onduladas, a largura da mistura entre biomas, o nível da água, a largura dos rios, a densidade de objetos de cada bioma, o tempo máximo por quadro criando chunks e os 3 perfis de qualidade.

**Trocar a semente muda o mapa de todo mundo:** o jogo salvo de quem estava em outro mapa acorda no castelo, com a casa na mochila (os monstros, itens e níveis não mudam).

### Para os monstros de cada bioma (futuro)

`zonaEm(x, z)` (em `js/mundo.js`) diz a região de cada ponto (`campo`, `planta`, `terra`, `raio`, `fogo`, `agua`) e `APARICOES` (em `js/dados.js`) diz quem aparece em cada uma. Para pôr monstros novos num bioma, basta mudar `APARICOES`.

## Linhas evolutivas

| Elemento | Nv.1 | Nv.12 | Nv.30 | Nv.50 (rara) |
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

Raros com formas novas (fase 6 do `PLANO.md`): evoluem no **Nv.55** e no **Nv.70** sozinhos e fazem a **evolução rara no Nv.90** com o botão
(missão no Nv.85: derrotar 60 monstros do Nv.40 para cima; custo: 5 Asas do Anjo, 5 Corações do Guardião e 6.000 de ouro).
Os atributos seguem a mesma regra para os 3: a base da forma inicial × 1 / 1,7 / 2,0 / 2,35 (em `LINHAS_RARAS` e `MULT_RARO`, no `js/dados.js`).

| Raro | Forma inicial (Nv.1) | 1ª evolução (Nv.55) | 2ª evolução (Nv.70) | Evolução rara (Nv.90) |
|---|---|---|---|---|
| Água | Aquaraia | Ventaraia | Mantaré | Leviaraia |

Raros ainda sem evolução (próximos da fase 6): Vulcarapa (fogo) e Espinhal (planta).
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
| Deserto | Fundo da Pedreira | Poeira | Terra | Fogo, Raio | Pedras caem (Terra não sente) |
| Picos Nevados | Topo da Tempestade | Relâmpagos | Raio | Água, Sol | Raios caem e paralisam (Raio não sente) |

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
| 1ª evolução (Nv.12) | O **disparo** atira **2 vezes** seguidas |
| 2ª evolução (Nv.30) | A **área** passa a causar o **efeito do elemento** |
| Forma final (Nv.50, evolução rara) | Disparo **3 vezes**, o golpe **perto** também causa o efeito e os efeitos duram 50% mais |

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

## Golpes da linha do Brasito (Fogo)

**Modelo do Blender:** a forma inicial (Brasito) usa o modelo `modelos/brasito.glb`, com animações de parado, arrancada → correndo e os 3 golpes. As outras formas continuam com os modelos de formas simples. Detalhes em `modelos/README.md`.

A linha do Brasito tem golpes próprios. Os números ficam em `js/habilidades/brasito.js`; como funcionam e aparecem, em `js/habilidades/brasito-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Brasito | Investida | **Lança-Chamas** (jato da boca, 5 m) | **Rabo de Fogo** (gira e bate, 3 m) |
| Brasalobo | Investida: **+12% de velocidade por 10 s** | Lança-Chamas + queimadura | Rabo de Fogo + queimadura |
| Fornalobo | Investida: **+20% por 10 s** | **Lança-Chamas Duplo** (2 jatos em V) | Rabo de Fogo com **mini dash** (3 m) |
| Magmalobo | Investida: **+30% por 10 s** | **Lança-Chamas Infernal** (2 jatos de 14 m) | **Rabo de Magma** (4,5 m) |

- O inimigo avisa o lança-chamas com uma **fatia vermelha** no chão e o Rabo de Fogo com dash com o círculo e uma faixa até onde ele vai.
- Vulcarapa e os tipos duplos com Fogo continuam com os golpes de Fogo de sempre.
- Mais detalhes em `js/habilidades/README.md`.

## Golpes da linha do Gotinho (Água)

A linha do Gotinho joga com **controle e defesa**: empurra, deixa lento e se protege. Os números ficam em `js/habilidades/gotinho.js`; como funcionam e aparecem, em `js/habilidades/gotinho-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Gotinho | Investida | **Jato d'Água**: atravessa o 1º inimigo (o de trás leva 70%) | **Onda**: parede de água que anda 6 m à frente e empurra 3 m |
| Marolo | Investida: **Escudo d'Água** de 8% da vida | Jato d'Água + encharcado | Onda + encharcado |
| Marulhão | Investida: escudo de **12%** | **Hidrocanhão**: explode ao acertar e molha quem está a 2 m (50%) | **Onda Dupla**: 2 ondas seguidas, 4 m de largura, 7 m |
| Tsunamar | Investida: escudo de **16%** | Hidrocanhão + **poça** de 2,5 m por 3 s que encharca quem pisa | **Maremoto**: anel que cresce até 7 m e empurra 4 m para fora |

- **Escudo d'Água:** segura o dano antes da vida por 6 s e só volta **10 s** depois de ganho. Aparece como uma bolha em volta do monstro e em azul embaixo da vida ("Escudo 26"). Se o escudo segurar o golpe inteiro, o efeito do golpe também não pega.
- O inimigo avisa a Onda com uma **faixa vermelha larga** e o Maremoto com o **círculo vermelho**. Obstáculos seguram as ondas (dá para se esconder atrás).
- Esta linha não ganha o "disparo ×2/×3": o encharcado chega no disparo e na área já no Marolo.
- A Aquaraia tem golpes próprios (veja "Golpes da Aquaraia"). Os tipos duplos com Água (Vaporito e evoluções) têm os deles.

## Golpes da Aquaraia (raro de Água)

A Aquaraia **ataca pelo ar e foge**: é frágil e rápida, atravessa os inimigos voando baixo, encharca com bolhas e cai do alto num mergulho. Os números ficam em `js/habilidades/aquaraia.js`; como funcionam e aparecem, em `js/habilidades/aquaraia-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Aquaraia (Nv.1) | **Rasante**: voo reto de 5 m que **atravessa** os inimigos | **Bolhas**: 3 em leque, 8 m | **Mergulho**: sobe 0,7 s **sem levar dano** e cai onde o alvo estava (3 m) |
| Ventaraia (Nv.55) | **Rasante de Vento**: 6 m e deixa um **Rastro d'Água** por 2,5 s | Bolhas + encharcado | Mergulho + encharcado, empurra 2 m |
| Mantaré (Nv.70) | **Rasante com Ferrão**: no fim, o ferrão bate para trás (60%) | **Bolhas Guiadas**: fazem curva até o inimigo | **Mergulho das Marés**: 3,5 m + **Redemoinho** de 3 m por 3 s que puxa; **+25% em quem está Encharcado** |
| Leviaraia (Nv.90, rara) | **Rasante do Leviatã**: 8 m, rastro largo por 4 s, ferrão 80% | **Chuva de Bolhas**: 5 guiadas | **Queda do Leviatã**: sobe 1 s, área de 4,5 m, redemoinho de 4 m por 4 s; encharcado dura 50% mais |

- O inimigo avisa o mergulho com o **círculo vermelho onde ele vai cair** e o rasante com a faixa vermelha.
- Mais detalhes em `js/habilidades/README.md`.

## Golpes da linha do Musguinho (Planta)

A linha do Musguinho é lenta e resistente: em vez de correr atrás, ela **puxa, prende e se cura**. Os números ficam em `js/habilidades/musguinho.js`; como funcionam e aparecem, em `js/habilidades/musguinho-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Musguinho | Investida | **Folha Bumerangue**: vai 8 m, gira e volta, acertando na ida e na volta | **Raízes**: brotam do chão em volta (3,6 m) e deixam lento 2,5 s |
| Moitão | **Chicote de Vinha**: estica até 4,5 m e **puxa** o inimigo 2,5 m | **2 folhas** em V + enraizado | Raízes + enraizado |
| Troncudo | Chicote de Vinha: 5 m, puxa 3 m | **3 folhas** em leque | **Moita de Espinhos**: fica 4 s no chão (3,5 m) e machuca quem está dentro |
| Florestral | **Vinha Agarradora**: 6 m, puxa 3,5 m + enraizado | 3 folhas; as que acertaram **curam** 1,5% da vida ao voltar | **Bosque Vivo**: raízes gigantes (5 m) por 5 s; machuca quem está dentro e **cura** o Florestral 2% por segundo |

- **Combinação:** puxe com a vinha e logo depois use as Raízes (3,6 m).
- A vinha para quando encosta: não puxa o inimigo para dentro do monstro. Obstáculos seguram a vinha.
- O inimigo avisa a vinha com uma **faixa vermelha estreita** e a área com o **círculo vermelho**. A moita e o bosque ficam visíveis no chão: saia de dentro.
- O enraizado das folhas é sorteado **uma vez por inimigo a cada uso** (18%).
- Esta linha não ganha o "disparo ×2/×3": no lugar, ganha mais folhas (1 → 2 → 3).
- Espinhal, Silvárion e os tipos duplos com Planta (Brotobrasa e evoluções) continuam com os golpes de Planta de sempre.

## Golpes da linha do Pedrisco (Terra)

A linha do Pedrisco é a **dona do terreno**: joga pedras **por cima** dos obstáculos, faz espinhos saírem do chão que **jogam para o alto** e levanta **pilares** que viram obstáculos. Os números ficam em `js/habilidades/pedrisco.js`; como funcionam e aparecem, em `js/habilidades/pedrisco-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Pedrisco | Investida (ele **rola**) | **Pedregulho**: pedra em arco (3 a 10 m) que passa por cima dos obstáculos e cai onde o alvo estava (área de 1,4 m) | **Tremor**: o chão racha em volta (4 m) |
| Cascalhão | **Punho Sísmico**: espinhos saem do chão 4 m à frente e jogam o inimigo **para o alto** (0,5 s sem andar nem atacar) | Pedregulho + soterrado | Tremor + soterrado |
| Rochedrão | Punho Sísmico: 5 m | **Pedregulho Quicante**: cai, **quica** e cai de novo 4 m à frente (70% da força) | **Muralha de Pedra**: Tremor + **8 pilares** em roda (4 m) por 4 s |
| Montanhar | **Punho da Montanha**: 7 m, 0,6 s no ar + soterrado | **Rocha Nevada**: pedra gigante (área de 2 m) que quica **2 vezes** (70% e 50%) | **Cordilheira**: **10 pilares nevados** em roda (5 m) por 5 s |

- **Pilares:** são obstáculos de verdade enquanto estão de pé: seguram **tiros retos** e a passagem (dá para sair pelos vãos de uns 2 m; monstros grandes ficam presos). A **pedra em arco passa por cima** deles. Quando é o inimigo que levanta, eles seguram os **seus** tiros também.
- **No ar:** quem é jogado para o alto perde o golpe que estava preparando. É curto e sem sorteio, para não ficar igual à Paralisia do Raio.
- O inimigo avisa o Pedregulho com **círculos vermelhos onde a pedra vai cair** (e onde vai quicar), o Punho com uma **faixa vermelha** e a área com o círculo vermelho. Os seus pedregulhos mostram onde caem com um círculo na cor da Terra.
- O soterrado de cada pedra é sorteado **uma vez por inimigo** (23%), juntando as quedas.
- Esta linha não ganha o "disparo ×2/×3": no lugar, a pedra quica.
- O Imanito e as evoluções (Terra + Raio) continuam com os golpes de Terra de sempre.

## Golpes da linha do Faisquinho (Raio)

A linha do Faisquinho joga com **marcas**: o Dash Elétrico e o tiro **marcam** os inimigos, o **Choque** estoura as marcas e as **nuvens** acertam direto quem está marcado. Os números ficam em `js/habilidades/faisquinho.js`; como funcionam e aparecem, em `js/habilidades/faisquinho-batalha.js`.

| Forma | Perto | Disparo (tiro → Choque) | Área |
|---|---|---|---|
| Faisquinho | Investida | **Faísca Marcadora**: tiro de 9 m que deixa 1 marca. Se acertar, o botão vira **Choque** por 4 s | **Nuvem Elétrica**: 1 nuvem por 4 s |
| Choquilho | **Dash Elétrico**: avança 5 m e marca quem passar perto (1,2 m). **Sem dano**, recarga 4 s | + Paralisia | + Paralisia |
| Trovolt | Dash: 6 m, aura de 1,5 m | **Relâmpago Marcador**: o Choque liga até **2** marcados | **Nuvens de Tempestade**: 2 nuvens por 5 s |
| Tempestor | Dash: 7 m, aura de 1,8 m + Paralisia | Choque **mais forte** (força 28), ligando até 2 marcados | **Tempestade**: 3 nuvens por 6 s |

- **Marcas:** até **3** no mesmo inimigo, por **6 s** (cada marca nova renova o tempo). Aparecem como raiozinhos amarelos girando em cima dele, "⚡2" ao lado do nome e, quando é você o marcado, "Marcado ×2" embaixo da sua vida.
- **Bônus das marcas** (no Choque e nas nuvens): 1 marca = dano normal, 2 = **+25%**, 3 = **+50%**.
- **Choque:** um raio liga o monstro aos marcados por 0,8 s. **Acerto garantido** (não dá para esquivar e não tem limite de distância) e **estoura as marcas**. Se os 4 s passarem sem usar, começa a recarga normal do tiro.
- **Nuvens:** cada uma solta um raio a cada 1,5 s. Quem está marcado leva o raio **direto**, com acerto garantido, e **continua marcado**. Sem ninguém marcado, o raio cai num ponto perto do monstro, com um círculo de aviso (dá para desviar). A paralisia dos raios das nuvens dura só 0,7 s.
- O inimigo avisa o tiro e o dash com uma **faixa vermelha**. O Choque e os raios nos marcados não têm aviso: para fugir deles, não deixe ele te marcar (ou troque de monstro, o que tira as marcas).
- Esta linha não ganha o "disparo ×2/×3". O Imanito e as evoluções (Terra + Raio) continuam com os golpes de Raio de sempre.

## Golpes da linha do Solito (Sol)

A linha do Solito **solta um sol no campo** que a deixa mais forte, **queima quem chega perto** e **atira longe com o laser**. Os números ficam em `js/habilidades/solito.js`; como funcionam e aparecem, em `js/habilidades/solito-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Solito | Investida | **Raio Solar**: laser fino de 10 m que atravessa todos na linha | **Calor**: queima quem está a até 3 m dele, por 3 s |
| Solário | **Pequeno Sol**: sol que fica 20 s no campo; enquanto existir: **+10% de dano, 15% menos dano recebido, +15% de velocidade** | Raio Solar + ofuscado | Calor + ofuscado |
| Solaurum | **Sol Dourado**: +15% / −20% / +20% | Raio Solar **mais grosso** (12 m) e com **recarga menor** (1,2 s) | **Onda de Calor**: 3,8 m por 4 s; **esquenta** (cada pedaço no mesmo inimigo é 15% mais forte) |
| Astrorei | **Sol Rei**: +20% / −25% / +25%; o **sol atira o laser junto** (60% da força) | **Laser Real**: 14 m, mais grosso | **Supernova**: 4,5 m por 5 s, esquenta e **explode no fim** |

- **O Sol:** o bônus vale no **campo todo** enquanto ele existir (aparece "Sol +10% 18s" embaixo da vida). A recarga de **15 s só começa quando o sol some**. Se o monstro desmaiar ou for trocado, o sol some.
- **Laser:** é na hora e atravessa todos na linha; obstáculos seguram. O inimigo avisa com uma **faixa vermelha fina e comprida**.
- **Calor:** anda junto com o monstro e dá dano a cada meio segundo em quem está perto; o anel fica mais vermelho quando esquenta. É o calor do Sol, não a Queimadura do Fogo. O ofuscado é sorteado uma vez por inimigo a cada uso.
- Esta linha não ganha o "disparo ×2/×3". Os golpes de Sol de sempre (em `dados.js`) continuam para quem não é desta linha.

## Golpes da linha do Imanito (Terra + Raio, o mestre do magnetismo)

Pedras giram em volta do Imanito: são a **munição** do disparo e o **escudo** contra tiros. O Ímã **puxa** os inimigos e a Repulsão **empurra**. Os números ficam em `js/habilidades/imanito.js` e o funcionamento em `js/habilidades/imanito-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Imanito | Investida | **Pedra Magnética**: até 2 pedras girando; atira uma; cada uma segura 1 tiro | **Repulsão**: empurra todos em volta |
| Magnetito | **Ímã**: puxa num cone de 6 m e soca | 3 pedras; + Paralisia | + Paralisia |
| Ferrovolt | **Ímã Elétrico** (pode paralisar) | **Pedra de Corrente**: 4 pedras; solta raio em quem está perto do alvo | Quem bate numa pedra ou na borda fica atordoado |
| Titanvolt | **Esmagamento**: bate um inimigo contra o outro | **Pedra Titã**: 5 pedras | **Tempestade Magnética**: puxa todos com raios caindo e depois explode |

- **Como jogar:** puxe com o Ímã, bata e empurre com a Repulsão (de preferência contra uma pedra). Cuidado para não gastar todas as pedras: elas também são o seu escudo.
- **Chefes e o Campeão** são puxados e empurrados só pela metade. O puxão do inimigo tem aviso no chão.

## Golpes da linha do Brotobrasa (Fogo + Planta, o jardineiro de fogo)

O Brotobrasa planta **flores de fogo** no chão: elas são armadilhas e **explodem quando o inimigo chega perto**. Os números ficam em `js/habilidades/brotobrasa.js` e o funcionamento em `js/habilidades/brotobrasa-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Brotobrasa | Investida | **Semente de Brasa**: vira uma flor de fogo (até 2 no campo) | **Anel de Brotos**: brotos nascem em volta e explodem |
| Chamafolha | **Folhas Ardentes**: leque; +30% em quem está queimando | + Queimadura, até 3 flores | + Queimadura |
| Ardentroco | **Galhada em Brasa**: 2 golpes; planta uma flor | **Semente de Chama**: deixa fogo no chão; até 4 flores | 7 brotos |
| Florinferno | **Galhada Infernal** | **Flor Gigante** | **Florescer Infernal**: nascem flores por onde ele anda |

- **Como jogar:** plante flores e atraia o inimigo para cima delas; termine de perto, porque quem queima leva mais.
- As flores **do inimigo** têm um aviso **vermelho** no chão: desvie delas.

## Golpes da linha do Vaporito (Água + Fogo, o tanque)

O Vaporito é uma tartaruga de vapor: **muita vida e defesa, mas lento**. Luta colado, aguenta e pune quem bate nele. Os números ficam em `js/habilidades/vaporito.js` e o funcionamento em `js/habilidades/vaporito-batalha.js`.

| Forma | Perto | "Disparo" (de perto) | Área |
|---|---|---|---|
| Vaporito | Investida | **Bafo de Vapor**: cone de vapor de 3 m | **Recolher no Casco**: 2,5 s recebendo 50% menos dano (não ataca e anda devagar); no fim, explode em vapor |
| Fumarolo | **Arrancada de Vapor**: dispara 5 m pelos jatos das costas e empurra; depois fica **Blindado** (+20% de defesa) | + Encharcado (o inimigo não consegue fugir) | **Casco Quente**: quem bater de perto se queima |
| Gêiserão | **Pancada de Casco**: no fim da arrancada, salta e bate o casco em volta | Bafo mais largo | **Casco do Gêiser**: 60% menos dano; no fim, um gêiser atordoa os inimigos |
| Caldeirax | **Pancada do Gêiser**: a pancada deixa um gêiser que atordoa | **Bafo Fervente**: Encharcado e Queimadura | **Caldeira**: 70% menos dano; o dano que ele segura vira **pressão** e deixa a explosão mais forte (no máximo o dobro) |

- **Como jogar:** chegue perto com a Arrancada, segure o inimigo com o Bafo e entre no casco quando ele atacar forte.
- **Ponto fraco:** não tem ataque de longe. Contra quem foge e atira, depende da Arrancada.
- Os selvagens também usam: um Gêiserão entra no casco quando apanha.

## Golpes da linha do Lumino (Luz)

A linha da Luz joga com a **velocidade da luz** (teletransporte), o **prisma** (o tiro se divide) e o **reflexo** (a redoma devolve os tiros). O efeito dela é o **Exposto** (recebe 30% a mais de dano). Os números ficam em `js/habilidades/lumino.js` e o funcionamento em `js/habilidades/lumino-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Lumino | Investida | **Estilhaço de Luz**: cristal que se divide em 3 raios ao acertar alguém ou chegar a 8 m | **Redoma de Luz**: bolha de 3 m por 2 s que **devolve os tiros** dos inimigos e diminui 30% do outro dano; clarão no fim |
| Lumelo | **Passo de Luz**: some e aparece 5 m **para onde você aponta o joystick**; cristais saem do chão e acertam quem estiver a até 2 m | + pode causar Exposto | + Exposto |
| Prismal | **Passo Prismático**: 6 m; cristais onde ele some e onde aparece | Divide em 5 | **Redoma Prismática**: 3,8 m por 3 s; os tiros voltam 50% mais fortes |
| Aurealis | **Passo Celestial**: 7 m; cristais no começo, no meio e no fim, e as asas cortam em volta | **Arco-Íris**: 7 raios coloridos | **Julgamento**: redoma de 4 s e, no fim, 6 colunas de luz caem nos inimigos |

- **Passo:** sem apontar o joystick, ele vai na direção do alvo. Também serve para **fugir**. Pedras seguram o passo.
- **Redoma:** só os tiros que voam voltam (a folha bumerangue e o raio que marca não). Laser, lança-chamas, ondas, áreas e golpes de perto não voltam, mas dão 30% menos dano.
- A treinadora **Lana** usa esta linha: ela também devolve os seus tiros. Espere a redoma dela acabar.
- Esta linha não ganha o "disparo ×2/×3" (no lugar, o cristal se divide). Os golpes de Luz de sempre (em `dados.js`) continuam para quem não é desta linha.

## Golpes da linha do Lunico (Lua)

O **Plenilúnio** (forma final) é um **lobo da lua cheia com orelhas de coelho**: máscara e armadura de prata, garras grandes, duas meias-luas **( )** nas costas e a lua cheia acima da cabeça. O modelo é feito de formas simples em `lobisomemLunar` (`js/modelos.js`); as peças do mesmo material viram uma só, para pesar pouco.

A linha da Lua joga com as **fases da lua**, **dashes que cruzam o alvo** e um **luar que cura**. Os números ficam em `js/habilidades/lunico.js` e o funcionamento em `js/habilidades/lunico-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Lunico | Investida | **Fases da Lua**: cada uso muda a fase (Lua Nova > Crescente > Cheia > volta); o botão mostra a próxima | **Poça de Luar**: 3 m por 4 s; inimigos dentro 30% mais lentos; ele recupera 2% da vida por segundo se ficar dentro |
| Lunarelo | **Salto Lunar**: 2 dashes (o 2º dá +50%) | + pode causar Sono (a Lua Cheia, o dobro) | + Sono |
| Crescêntio | **Dança Crescente**: 3 dashes (100%, 150%, 200%) | A Lua Cheia explode (2,5 m) | **Luar Crescente**: 3,8 m, 5 s, cura 3%/s. Golpes em quem dorme dão +30% |
| Plenilúnio | **Caçada da Lua Cheia**: 3 dashes (100%, 150%, 250%) e um corte em meia-lua no chão | Lua Cheia explode maior (3,5 m) | **Uivo da Lua Cheia**: ele uiva, a lua cheia aparece no céu; luar de 5 m por 6 s, cura 4%/s e **Fúria Lunar** (+20% de velocidade) dentro dele. Sono dura 50% mais |

- **Dashes:** o 1º vai reto no alvo e passa por ele; os outros cruzam o alvo de lado (o monstro atravessa o alvo durante o combo). Se o alvo fugir no meio, os dashes seguintes podem errar.
- **Combo com o Sono:** a Lua Cheia faz dormir e os dashes acordam o alvo com +30% de dano.
- **Luar:** cura só **na batalha** (no modo treino, no mapa, não cura). Os selvagens da Lua também se curam no luar deles.
- Esta linha não ganha o "disparo ×2/×3" (no lugar, as fases). Os golpes de Lua de sempre (em `dados.js`) continuam para quem não é desta linha.

## Golpes de Trevas

Os golpes da linha de Trevas invocam coisas da escuridão, e cada evolução ganha algo novo. Tudo aparece **dentro da área que o golpe acerta**. Os números ficam em `js/habilidades/trevas.js` e o visual em `js/habilidades/trevas-batalha.js`.

O **Breuzinho** continua com os golpes de Trevas de sempre. Das evoluções em diante:
- **Perto** é sempre uma **mordida** (a bocarra cresce a cada forma).
- **Disparo** é sempre a **bola com olhos**, mas de **alcance curto** (8, 9 e 10 m): ela some quando chega lá.
- **Área** **escurece a arena** e dá o bônus **Trevas: +5%, +10% e +15% de dano** em todos os golpes por 8 s (aparece embaixo da vida; usar de novo só renova o tempo).

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Breuzinho | Investida com rastro de fumaça preta | Bola Sombria: núcleo de breu **com olhos** e rastro de fumaça (vai longe) | Vazio: **poça de breu** com 6 tentáculos |
| Sombrelo | Mordida Sombria (13): uma **bocarra de sombra** fecha no alvo | Olhar Sombrio (14, 8 m, ×2); onde a bola acerta, **um par de olhos se abre** | Vazio: **olhos se abrem** na poça, a arena escurece, **+5%** |
| Umbrafel | Mordida Abissal (19): **cópias sombrias** no avanço e bocarra maior | Olhar Abissal (16, 9 m, ×2): bola maior | Vazio Abissal: **mãos de sombra** agarram quem é atingido, **+10%**, pode causar Medo |
| Noctífero | Mordida da Noite Eterna (24): bocarra gigante e a **garra do chão**; pode causar Medo | Olhar da Noite (17, 10 m, ×3): **2 morcegos** voam em volta de cada bola, e uma **cópia sombria** atira junto | Abismo: o **Astro Negro** sobe, a arena escurece, **anel de olhos**, 9 mãos, **+15%** |

- **Medo:** quem está com medo fica com **um par de olhos roxos** flutuando atrás dele até o efeito acabar.
- **Astro Negro** é o nome do visual do Abismo. Não é "eclipse" para não confundir com o golpe Eclipse da Lua.
- **Leve no celular:** as formas (dedo, dente, olho, morcego) são criadas uma vez só e reaproveitadas; cada golpe some em menos de 2 s.

## Painel GM (administrador, para testes)

Só a **conta GM** tem o painel. O código fica em `js/gm.js` e só é baixado quando a conta GM entra: para as outras contas o jogo não fica mais pesado. Para entrar, use o nome **GM** e a senha do GM na tela de login. Nos testes no computador, também abre pelo console do navegador (`__jogo.ativarGM()`).

- **No mapa:** botão **GM** (rosa) no alto, antes de "Monstros". O mundo para enquanto o painel está aberto. O botão Voltar do celular (ou Esc) fecha o painel.
- **Na batalha:** botão **GM** embaixo da fileira de ícones, do lado direito. Ele abre uma gaveta ao lado (deitado, em 2 colunas, para não cobrir os golpes), que fecha ao tocar fora dela.

| Aba | O que faz |
|---|---|
| **Monstros** | Escolhe qualquer espécie (todas as 53, separadas por linha) e o nível (1 a 50). **Aparecer perto** (8 m na sua frente), **Lutar agora** (na arena escolhida ou na da região), **Grupo (5 + líder)** no mapa, **Lutar com grupo** e **Dar para mim** (vai para a equipe ou a reserva). Atalhos: selvagem, tipo duplo ou grupo aleatório, e **limpar o mapa** (os chefes e os acampamentos ficam). |
| **Dungeons** | Para o Caminho das Brasas e a Trilha Ancestral: **ir para** a entrada, cada etapa ou o chefe; **lutar contra o acampamento** de cada etapa (na ordem 2 fracos → 2 médios → 1 forte → líder, no nível que a sua equipe enfrentaria); **lutar com o chefe** no nível escolhido; **chefe volta já** (sem esperar o amanhecer); **monstro da dungeon perto**. |
| **Equipe** | **Copiar jogo de outra conta** deste aparelho para o GM (para testar com a equipe de verdade; a conta original não muda). Escolhe o **monstro alvo** (equipe ou reserva) e mostra nível, vida e experiência. **Adicionar XP:** +50, +500, +1 nível ou **até o nível ___**. A XP sobe como no jogo, então ele **evolui** ao chegar no nível (a animação aparece quando o painel fecha). **Evoluir agora**, **Voltar uma forma** (fica no nível logo abaixo da evolução, para não evoluir de novo sozinho), **Curar**, **subir 1 nível sem evoluir**. Também **curar todos** e mudar os cristais (+10, 99 ou zerar). |
| **Mundo** | **Arena do Reino:** lutar com qualquer treinador na hora (sem a ordem), **dominar a arena** (já entrega o ovo), **zerar a arena** (tira o ovo também), **+1000 de ouro**, **chocar o ovo agora**, **+6 Galhos Raros** e **casa nível 1, 2 ou 3**. **Hora:** amanhecer, meio-dia, anoitecer, meia-noite ou **parar o relógio**. **Teleporte:** castelo (a fonte), arena do Reino, Estrada Real, as 6 regiões (o lugar de cada uma vem da semente do mapa) e a casa. **Andar ×1, ×2 ou ×3.** **Invisível:** os monstros não vêm atrás de você, mas encostar neles ainda começa a batalha. **Mostrar FPS** (embaixo, no meio da tela), com os números do mapa (chunks, objetos, desenhos e triângulos por quadro, tempo para criar um chunk). **Mapa:** ver outra semente (digitada ou aleatória) e voltar à de todos: recarrega o jogo com outro mapa só neste aparelho, até fechar (pela URL `?semente=123`). |
| **Testes** | **Invencível** (a vida não desce, nem com efeitos e perigos da arena), **recarga zero**, **captura garantida** (qualquer cristal segura qualquer monstro, até os chefes), **inimigos parados**, **dano ×10**. Na gaveta da batalha também: **encher minha vida** e **vencer agora** (derrota todos, até os que estão esperando nas ondas). |

- As chaves (invencível, dano ×10...) valem até você desligar.
- O monstro de um "Lutar agora" só existe para aquela luta: se você fugir, ele some do mapa.
- **Ganchos no resto do jogo** (só funcionam com o GM ligado): `batalha.js` (invencível, recarga, captura, parados, dano), `mundo.js` (velocidade, invisível, relógio) e `main.js` (`ativarGM`, `gm.quadro`, `gm.depoisDaBatalha`).

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
| `index.html` | A página: visual da interface (login, HUD, botões, telas), o botão Instalar app e a versão |
| `manifest.webmanifest`, `sw.js`, `icones/` | O app instalável: nome e ícone, o "ajudante" que guarda o jogo e busca atualizações |
| `js/dados.js` | **Tabelas do jogo**: elementos, golpes, linhas evolutivas, níveis de evolução, onde cada monstro aparece. Para balancear, mexa aqui. |
| `js/modelos.js` | Os modelos 3D (o Brasito da forma inicial vem do `.glb`, por `js/modelos3d.js`): um construtor por linha que acrescenta peças a cada evolução. No fim, `juntarPecas` une as peças paradas de mesma aparência numa só (de ~24 para ~11 peças por monstro), deixando caudas, asas, pernas e peças animadas separadas |
| `js/modelos3d.js` | Modelos feitos no Blender (`.glb`): carrega, faz uma cópia com ossos para cada monstro, toca as animações (parado, arrancada → correndo e os 3 golpes, no tempo certo de cada golpe), faz o fogo pulsar e o piscar. Hoje só o Brasito (forma inicial) |
| `modelos/` | Os arquivos `.glb` (hoje `brasito.glb`) e um README com os detalhes de cada um |
| `js/plataforma.js` | A vitrine 3D do Monstruário e a animação de evolução |
| `js/mundo.js` | Mapa aberto: regiões, dia e noite, monstros selvagens e grupos (em volta do jogador), cristais, fonte do castelo, casa, Estrada Real segura, colisão e câmera |
| `js/jardim.js` | O jardim (sementes, plantar, colher, as plantas em tempo real e os canteiros em 3D) e o afeto (alimentar, Coração do Guardião, satisfeito) |
| `js/bolsa.js` | Ouro, poções (preços e efeito), Galho Raro, Asa do Anjo e os drops (`DROPS`), a evolução da casa e da bandeira (`CASA`, `BANDEIRA`), a Bolsa (bandeira, casa, itens raros, poções, cristais, ovo) e a loja de poções do Reino |
| `js/ovo.js` | O Ovo Misterioso: o ovo roxo em 3D, o tempo para chocar, o sorteio e a cena do nascimento |
| `js/reino.js` | O Reino: castelo, praça e fonte, vila e loja, arena fechada com plateia e os 5 treinadores, muralha, lanternas da Estrada Real e a placa do Campo (tudo junto em poucas malhas) |
| `js/mapa/config.js` | Configurações do mapa procedural e os perfis de qualidade |
| `js/mapa/gerador.js` | O gerador do mapa (só matemática): ruído com semente, biomas, altura do chão, rios, lagos, pontos de interesse, lugares da Floresta, direção das dungeons e do Reino e a Estrada Real |
| `js/mapa/altura.js` | `alturaEm(x, z)`: a altura do chão igual aos triângulos desenhados (com as dungeons e a borda), e onde não dá para andar (lago fundo e lava) |
| `js/mapa/chunks.js` | Os chunks: cria o chão, a água, a lava e os objetos de cada pedaço do mapa, carrega e apaga conforme você anda, e o LOD |
| `js/mapa/grade.js` | Grade de obstáculos: guarda as árvores, pedras e peças em quadradinhos de 8 m, para a colisão só olhar o que está perto |
| `js/batalha.js` | Batalha em tempo real: movimento, golpes, efeitos, IA do inimigo e captura |
| `js/dungeon.js` | Base das dungeons abertas: a forma do corredor (`Tracado`) e a do Reino (`REINO`), portões transparentes, acampamentos, monstros soltos, chefe e clima. Também o `Lote` e o `Bloco`, que juntam peças para ficar leve no celular |
| `js/brasas.js` | Cenário do Caminho das Brasas (braseiros, forja, rio de lava, Trono de Magma, vulcão) |
| `js/raizes.js` | Cenário da Trilha Ancestral e da Floresta (cogumelos, ruínas, lago, raízes, Árvore-Mãe, vaga-lumes, monstros extras) |
| `js/arena.js` | Arenas: chão, obstáculos, clima animado e perigos de cada região (com chance), e o escurecer do Astro Negro |
| `js/habilidades/` | **Habilidades próprias das linhas de monstros** (uma pasta só para isso). Veja o `README.md` de lá. Hoje: linha do Brasito (`brasito.js` com os números, `brasito-batalha.js` com o lança-chamas, o rabo de fogo e a velocidade), linha do Gotinho (`gotinho.js` e `gotinho-batalha.js`, com o jato, o hidrocanhão, as ondas, o maremoto e o escudo), linha do Musguinho (`musguinho.js` e `musguinho-batalha.js`, com a folha bumerangue, a vinha que puxa, as raízes, a moita e o bosque), linha do Pedrisco (`pedrisco.js` e `pedrisco-batalha.js`, com a pedra em arco que quica, o punho sísmico, o tremor e os pilares), linha do Faisquinho (`faisquinho.js` e `faisquinho-batalha.js`, com as marcas, o dash elétrico, o tiro que marca, o choque e as nuvens), linha do Solito (`solito.js` e `solito-batalha.js`, com o sol que dá bônus, o laser e o calor), linha do Lunico (`lunico.js` e `lunico-batalha.js`, com o combo de dashes, as fases da lua e o luar que cura), linha do Lumino (`lumino.js` e `lumino-batalha.js`, com o passo de luz, o estilhaço que se divide e a redoma que devolve os tiros), linha do Imanito, tipo duplo Terra + Raio (`imanito.js` e `imanito-batalha.js`, as pedras orbitais, o ímã e a repulsão), linha do Brotobrasa, tipo duplo Fogo + Planta (`brotobrasa.js` e `brotobrasa-batalha.js`, as flores de fogo que explodem), linha do Vaporito, tipo duplo Água + Fogo (`vaporito.js` e `vaporito-batalha.js`, o tanque: arrancada, bafo de vapor e casco), a Aquaraia, raro de Água (`aquaraia.js` e `aquaraia-batalha.js`, o rasante que atravessa, as bolhas guiadas, o mergulho, o rastro e o redemoinho) e a linha do Breuzinho (`trevas.js` e `trevas-batalha.js`, com a mordida, a bola com olhos de alcance curto e a área que escurece e dá bônus de dano) |
| `js/nuvem.js` | Contas e jogo salvo na nuvem (Firebase, direto pela internet, sem a biblioteca do Firebase): criar conta, entrar, entrar de novo com 1 toque, ler e gravar o jogo salvo, e a senha do GM |
| `js/companheiro.js` | O monstro invocado: invocar e guardar, seguir o treinador, os botões e a troca de controle (o treinador fica parado e protegido) |
| `js/treino.js` | O modo treino: os golpes do monstro invocado no mapa, "no ar", usando o mesmo motor da batalha (sem inimigos e sem dano) |
| `js/gm.js` | Painel GM (só para a conta GM): fazer monstros, grupos, acampamentos e chefes aparecerem, XP, evolução, teleporte, hora e as chaves de teste da batalha. Só é baixado quando a conta GM entra |
| `js/controles.js` | Joystick de toque (lado esquerdo), câmera (lado direito, controle de câmera e mouse), botões e teclado (R invoca, T controla o monstro). Enquanto você escreve num campo (login, painel GM), as teclas não viram atalhos |
| `js/camera.js` | Câmera em terceira pessoa: gira em volta do personagem, sobe e desce, aproxima e afasta |
| `js/main.js` | Liga tudo: login e contas, telas, equipe, experiência, evolução, salvamento (no celular e na nuvem) |
| `lib/three.module.min.js` | Biblioteca Three.js 0.170 (licença MIT, em `lib/THREE-LICENSE.txt`) |
| `lib/addons/` | Peças extras do Three.js 0.170 (mesma licença): `loaders/GLTFLoader.js` (abre os `.glb`), `utils/SkeletonUtils.js` (copia um modelo com ossos) e `utils/BufferGeometryUtils.js` (usado pelo GLTFLoader). No `index.html`, o caminho `three/addons/` aponta para esta pasta |

## Rodar no computador

A página precisa ser aberta por um servidor local, porque abrir o arquivo direto com dois cliques bloqueia os módulos JavaScript:

```bash
cd apps/cristalia
python -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.

## Próximos passos possíveis

- Trocar os outros modelos de formas simples por modelos feitos no Blender (`.glb`), como já foi feito com o Brasito
- Sons e música
- Treinadores rivais
- Dungeons abertas nos outros biomas (Lago, Deserto, Neve) usando a mesma base de `dungeon.js`
- Levar as regras (`dados.js`) para o Unreal Engine
