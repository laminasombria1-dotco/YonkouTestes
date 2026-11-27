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
- **Cura:** a fonte na praça do castelo, no **Reino**, cura todos os seus monstros. Fora do Reino, só a **fogueira do Acampamento do Gelo** cura (veja "Bioma do Gelo").
- **Começo:** o jogo novo começa no Reino, na frente da fonte do castelo, com 3 Poções de Cura e 1 de Reviver. Saia por um dos **5 portões** do Reino (um para cada bioma) pela **Estrada Real** (veja "O Reino").
- **Bolsa:** o botão do canto de baixo (tecla **B** no PC). Dentro dela ficam a bandeira, a casa, o jardim, as frutas, os itens raros, as poções, os cristais e os ovos. Veja "Bolsa, ouro e loja".
- **Nível dos selvagens:** acompanha o nível da sua equipe e aumenta quanto mais longe do centro você vai, até o **Nv.95** (os grupos vão até o Nv.98 e os líderes até o Nv.100). Nas bordas aparecem as formas evoluídas, mas nunca a forma final. A exceção é **em volta da boca do Reino** (55 m): ali só aparecem monstros fracos (Nv.2 a 5, formas iniciais), sem grupos e sem tipo duplo.
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
- **Bolsa:** o Campeão do Reino (coroa e ouro do Reino), os **títulos** (escolha qual mostrar), a bandeira (fincar, guardar, mudar, evoluir), a casa e o jardim, as frutas e o afeto, os itens raros, as poções (cada monstro da equipe e da reserva tem o botão **Curar** ou **Reviver**), os ovos e os cristais (a fusão precisa estar perto da casa). O mundo fica parado enquanto a bolsa está aberta.
- **Na batalha:** o botão do **frasco** (tecla **P**) mostra quantas poções você tem e abre a escolha: **Cura** (no monstro que está lutando) ou **Reviver** (no 1º desmaiado da equipe; depois toque em Trocar para mandar ele de volta). Entre uma poção e outra há **10 s de recarga** (o botão escurece e vai clareando).
- **Jogos salvos antigos** começam com 0 de ouro e 3 Poções de Cura.
- **Código:** `js/bolsa.js` (preços, moedas, bolsa e loja) e o botão da batalha em `js/batalha.js`. Fica salvo em `estado.moedas` e `estado.pocoes`.

## Vilas (uma em cada bioma)

Mundo novo, passo 3 (`PLANO.md`). Cada bioma tem uma vila de **30 m de raio**, no lugar que a semente guardou (no Arquipélago, numa ilha), num chão plano.

| Vila | Bioma | Campeão (sempre do elemento do bioma) |
|---|---|---|
| Vila da Neve | Gelo (Picos Nevados) | Raio |
| Vila das Folhas | Floresta | Planta |
| Vila da Areia | Deserto | Terra |
| Vila das Cinzas | Vulcânico | Fogo |
| Vila das Marés | Arquipélago | Água |

- **O que tem:** cerca baixa com **2 entradas** (uma virada para o Reino, outra para fora), a **praça** com uma estátua de cristal na cor do elemento, a **Loja de Poções** (só poções, com os mesmos preços do Reino; as sementes ficam só na Loja do Reino), **5 casas** com a cara do bioma (no Arquipélago, sobre estacas) e, no fundo, a **arena** (coliseu de 13 m, menor que o do Reino, com ~210 bonequinhos na plateia).
- **Zona segura:** nenhum selvagem entra (eles dão meia-volta antes da cerca) e não dá para fincar a bandeira lá dentro. Uma bandeira que estava onde a vila nasceu volta para a Bolsa.
- **Arena:** 5 plataformas na areia: **4 treinadores e o Campeão** (a do Campeão é dourada, no fundo). As regras são as do Reino: em ordem, um monstro de cada vez, sem captura; depois de conquistada, todos viram **revanche**. **Os treinadores são do Lâmina** (nomes e artes dele) e as 5 vilas já estão completas. Eles entram em `TREINADORES_VILA` (`js/vilas.js`), no mesmo formato dos treinadores do Reino (níveis combinados: Nv.55, 60, 65 e 70, e o Campeão Nv.75 na forma final).
- **Vila das Cinzas** (os primeiros treinadores das vilas, feitos pelo Lâmina; o desenho de cada um segue a arte dele):

  | Ordem | Treinador | Elemento | Monstros (1ª vez) | Revanche |
  |---|---|---|---|---|
  | 1 | Sandy | Luz | Luz, Sol, Luz · Nv.55 | Nv.75 |
  | 2 | Brawn | Terra (pedra) | Terra, Terra + Raio, Terra · Nv.60 | Nv.80 |
  | 3 | Blaze | Raio | Raio, Raio, Terra + Raio · Nv.65 | Nv.85 |
  | 4 | Sotty | Água | Água, Aquaraia, Água · Nv.70 | Nv.90 |
  | 5 | **Saphira** (Campeã) | Fogo | Fogo, Vulcarapa, Fogo, Fogo · Nv.75 (forma final) | Nv.100 |

  Prêmios da 1ª vitória: Sandy e Brawn 2 Cristais Fortes (250 e 300 de ouro), Blaze e Sotty 3 Fortes (350 e 400), Saphira 3 Fortes + 2 Supremos (800); nas revanches, 1 Forte e metade do ouro.
- **Vila da Areia** (também do Lâmina, com o visual pela arte dele):

  | Ordem | Treinador | Elemento | Monstros (1ª vez) | Revanche |
  |---|---|---|---|---|
  | 1 | Nicky | Trevas | Trevas, Lua, Trevas · Nv.55 | Nv.75 |
  | 2 | Rony | Fogo | Fogo, Fogo + Planta, Fogo · Nv.60 | Nv.80 |
  | 3 | Jean | Água | Água, Água + Fogo, Água · Nv.65 | Nv.85 |
  | 4 | Nando | Planta | Planta, Espinhal, Planta · Nv.70 | Nv.90 |
  | 5 | **Pedro** (Campeão) | Terra (pedra) | Terra, Terra + Raio, Terra, Terra · Nv.75 (forma final) | Nv.100 |

  Prêmios iguais aos da Vila das Cinzas (pela ordem).
- **Vila da Neve** (também do Lâmina, com o tema do baralho):

  | Ordem | Treinador | Elemento | Monstros (1ª vez) | Revanche |
  |---|---|---|---|---|
  | 1 | Clayton | Água | Água, Aquaraia, Água · Nv.55 | Nv.75 |
  | 2 | Siberius | Planta | Planta, Fogo + Planta, Planta · Nv.60 | Nv.80 |
  | 3 | Hela | Raio | Raio, Luz, Raio · Nv.65 | Nv.85 |
  | 4 | Tila | Fogo | Fogo, Vulcarapa, Fogo · Nv.70 | Nv.90 |
  | 5 | **Joker** (Campeão) | Raio | Raio, Terra + Raio, Raio, Raio · Nv.75 (forma final) | Nv.100 |

  Prêmios iguais aos da Vila das Cinzas (pela ordem).
- **Vila das Folhas** (também do Lâmina, com o visual pela arte dele):

  | Ordem | Treinador | Elemento | Monstros (1ª vez) | Revanche |
  |---|---|---|---|---|
  | 1 | Richard | Fogo | Fogo, Fogo + Planta, Fogo · Nv.55 | Nv.75 |
  | 2 | Sally | Planta | Planta, Espinhal, Planta · Nv.60 | Nv.80 |
  | 3 | Pâmela | Água | Água, Água + Fogo, Água · Nv.65 | Nv.85 |
  | 4 | Lais | Planta | Planta, Luz, Planta · Nv.70 | Nv.90 |
  | 5 | **Rox** (Campeã) | Planta | Planta, Espinhal, Fogo + Planta, Planta · Nv.75 (forma final) | Nv.100 |

  Prêmios iguais aos da Vila das Cinzas (pela ordem).
- **Vila das Marés** (também do Lâmina, com o visual pela arte dele):

  | Ordem | Treinador | Elemento | Monstros (1ª vez) | Revanche |
  |---|---|---|---|---|
  | 1 | Karah | Fogo | Fogo, Fogo + Planta, Fogo · Nv.55 | Nv.75 |
  | 2 | Angelica | Fogo | Fogo, Vulcarapa, Fogo · Nv.60 | Nv.80 |
  | 3 | Lanny | Raio | Raio, Terra + Raio, Raio · Nv.65 | Nv.85 |
  | 4 | Ilia | Trevas | Trevas, Lua, Trevas · Nv.70 | Nv.90 |
  | 5 | **Serena** (Campeã) | Água | Água, Aquaraia, Água + Fogo, Água · Nv.75 (forma final) | Nv.100 |

  Prêmios iguais aos da Vila das Cinzas (pela ordem).
- - **Os bonecos dos treinadores** (os 5 do Reino e os das vilas) são feitos de peças por código, num estilo de desenho: cabeça maior, rosto com olhos, sobrancelhas e boca, braços com cotovelo e mãos, pernas com joelho, botas com bico e **uma pose para cada um** (pela arte do Lâmina: braço estendido, mão na cintura, braço para o alto ou punho para a frente), com o efeito (fogo, raio, água...) saindo da mão. Fica em `desenharTreinador`, `POSES` e `VISUAL` (`js/reino.js`); todas as peças viram poucas malhas.
- **Nome em cima da cabeça:** todos os treinadores (os do Reino e os das vilas) têm uma plaquinha com o nome (borda na cor do elemento). O **Campeão** de cada vila tem o nome em dourado e uma **coroa** na cabeça; o Rei Julius tem o nome dourado (ele já usa a coroa dele). Feito com `placaDeNome` (`js/reino.js`) e `nomes` (`js/vilas.js`); os das vilas só aparecem de perto. Dentro da arena da vila a câmera chega mais perto e fica mais de cima (como na arena do Reino).
- **Vencer o Campeão da vila** (1ª vez): você vira o novo campeão. Ganha o **título** ("Campeão da Vila da Areia"), **1.000 de ouro**, **1 ovo** e a vila passa a guardar **75 de ouro a cada 10 minutos de jogo** (até 300). Perder na arena: vocês acordam na fonte do castelo, curados.
- **O saquinho 💰** (embaixo do relógio): junta o ouro de Campeão do **Reino e de todas as vilas**. Mostra quanto já tem e quanto falta para o próximo; quando algum cofre enche (e para de juntar), ele **brilha dourado** com "Resgatar!". Toque nele em qualquer lugar para pegar tudo. (A fonte do castelo não entrega mais o ouro.)
- **Títulos:** cada arena conquistada dá um título. Na **Bolsa**, seção Títulos, você escolhe qual usar; ele aparece na tela inicial, com o jogo salvo.
- **Fica salvo** em `estado.vilas` (`vencidos`, `dominada` e `cofre` de cada vila) e `estado.titulo`.
- **Leve no celular:** cada vila vira 3 malhas (como o Reino) e a plateia só existe na tela de perto. Dentro de uma vila são ~37 desenhos e ~19 mil triângulos (menos que no Reino).
- **Código:** `js/vilas.js` (`Vilas`, `NOMES_VILA`, `TREINADORES_VILA`, `TESOURO_VILA`, `PREMIO_VILA`); o chão plano em `alturaBase` (`VILAS` no `js/mapa/gerador.js`); as lutas, o Campeão, o saquinho e os títulos no `js/main.js` (`encostouNoTreinadorDaVila`, `conquistarVila`, `cofres`, `atualizarSaco`, `titulos`). GM, aba Mundo: **Conquistar** cada vila, **zerar as vilas** e **encher todos os cofres**; o teleporte tem as 5 vilas.

## Ovo Misterioso

- O **Rei Julius** entrega **1 ovo** na 1ª vitória contra ele (quando você domina a arena) e **2 ovos** na 2ª vitória.
- Eles ficam na Bolsa, com o tempo que falta, e **chocam depois de 10 minutos de jogo** (todos ao mesmo tempo, um de cada vez; o tempo só passa no mapa e na batalha, não no menu nem com o jogo fechado).
- Quando choca (no mapa), aparece uma cena: o ovo treme cada vez mais, a luz roxa de dentro aumenta, ele racha, as escamas voam e o monstro aparece.
- **Quem nasce** (na forma inicial e no **Nv.1**): **tipo duplo 70%** (Brotobrasa, Vaporito ou Imanito), **raro 25%** (Espinhal, Aquaraia ou Vulcarapa) e **lendário 5%** (Ignárion ou Silvárion). Vai para a equipe (ou para a reserva, se ela estiver cheia).
- **Código:** `js/ovo.js` (o ovo em 3D, a cena do nascimento, o tempo e `CHANCES_OVO`/`sortearDoOvo`). Fica salvo em `estado.ovos = [{ restante }]`.

## O Reino (o novo centro do jogo)

O Reino fica **no meio do mapa** (mundo novo, `PLANO.md`): é o lugar seguro onde o jogo começa, com os 5 biomas em volta. Não tem tela de carregamento: você sai andando.

- **O platô:** redondo (**100 m de raio**), plano, com uma **muralha** de torres de telhado azul e **5 portões** (2 torres com bandeira em cada), **um para cada bioma**. O portão principal (na frente do castelo) dá para a Floresta.
- **Paredes que deixam ver o boneco:** quando o castelo, a muralha, as casas (a sua também), a arena ou as árvores do Reino (e das vilas) ficam entre a câmera e o personagem, a parte que tampa fica **quase transparente** (25% visível, com a borda suave) e dá para ver o boneco através. O chão nunca muda. Fica em `materialFuro` (`js/biomas/comum.js`), usado pelo `assar` do `js/reino.js` e pela `criarCasa` do `js/modelos.js`.
- **Estrada em anel:** um calçamento de pedra a 66 m do meio liga os 5 portões. Entre o anel e a muralha fica **espaço livre** (só alguns pinheiros encostados na muralha), guardado para as coisas novas do Reino.
- **Estrada Real:** de cada portão sai um caminho curto de pedra (38 m) com lanternas e bandeiras azuis. Nele **nenhum selvagem aparece**, e os que chegam perto dão meia-volta. Os monstros também dão meia-volta antes da muralha: **ninguém entra no Reino**.
- **Anel tranquilo:** os primeiros **45 m** de cada bioma depois dos portões só têm **monstros fracos** (Nv.2 a 5, formas iniciais), sem grupos e sem tipo duplo. É a área de quem está começando.
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
  | Gill | linha do Fogo Nv.20, Vulcarapa Nv.22, linha do Fogo Nv.24 (na revanche, Nv.50, a Vulcarapa continua na forma inicial: ela evolui no Nv.55) |
  | Cris | linha de Trevas Nv.25, linha da Lua Nv.27, linha de Trevas Nv.29 |
  | Lana | linha da Luz Nv.30, linha do Sol Nv.32, linha da Luz Nv.34 |
  | Sheyla | linha da Água Nv.40, Aquaraia Nv.43, linha da Água Nv.45 (na revanche, Nv.70, a Aquaraia vem como **Mantaré**) |
  | Rei Julius | **todos no Nv.50 e na forma final**: Florestral, Mandacarão (o Espinhal na forma final), Florestral e Florestral (4 monstros) |

  A forma de cada linha depende do nível: Nv.12 em diante a 1ª evolução, Nv.30 a 2ª, e do **Nv.50** a forma final (os treinadores podem ter a forma final; os selvagens do mapa não). Os raros com formas novas também mudam pelo nível (Nv.55, 70 e 90).
- **Regras da luta:** não dá para capturar (os botões de cristal somem), e **Fugir = desistir**: você sai pelo portão da arena.
- **A Arena do Reino da batalha:** o mesmo coliseu, em volta da areia de 22 m, com a plateia (~730 bonequinhos) e o treinador assistindo da plataforma dele, do lado de lá. Cai confete. Não tem perigo e não favorece nenhum elemento. **A plateia pula** quando um monstro do treinador desmaia, e de novo no mapa quando você vence.
- **Vencer:** experiência cheia (sem o desconto de grupo), ouro (veja "Bolsa, ouro e loja") e cristais. Na 1ª vez: Gill e Cris dão 3 comuns + 1 Forte, Lana 3 comuns + 2 Fortes, Sheyla 3 Fortes e o Rei 3 Fortes + 2 Supremos. Nas revanches: 1 Forte (o Rei dá mais 1 Supremo).
- **Perder:** você acorda na fonte do castelo, com todos curados. Os treinadores que você já venceu **continuam vencidos**.
- **Dominar a arena:** vencendo o Rei Julius, você vira o **Campeão do Reino** e ganha:
  - a **Coroa do Rei**: aparece na cabeça do seu personagem (na Bolsa, seção Campeão do Reino, dá para guardar ou vestir);
  - o título **Campeão do Reino** (na Bolsa e no resumo do jogo salvo, na tela de início);
  - o **ouro do Reino**: **100 de ouro a cada 10 minutos de jogo**, guardando no máximo **600** (1 hora). Para receber, **toque no saquinho 💰** da tela (veja "Vilas");
  - **1 Ovo Misterioso** (veja abaixo). A **2ª vitória** contra o Rei dá **2 ovos**.
- **Revanches** (depois de dominar, em qualquer ordem): cada treinador fica mais forte: **Gill Nv.50, Cris Nv.55, Lana Nv.60, Sheyla Nv.70 e o Rei Nv.100** (com as formas finais).
- **Fica salvo** em `estado.arena` (`vencidos` de 0 a 5, `dominada`, `vitoriasRei`), `estado.campeao`, `estado.coroa`/`coroaVestida` e `estado.tesouro` (o ouro do Reino guardado). Os níveis de revanche ficam em `revanche` de cada treinador (`TREINADORES`, `js/reino.js`) e o ouro do Reino em `TESOURO` (`js/main.js`).
- Lá dentro não aparecem monstros, não nascem árvores do mapa e não dá para fincar a bandeira.
- **Leve no celular:** todas as peças paradas do Reino viram **4 malhas** (cores normais, peças vistas dos dois lados, o que brilha e as paredes brancas do castelo), e a plateia é **1 lote**. A colisão usa círculos na `mundo.grade`, como o resto.
- **Código:** a forma do platô é o `REINO` em `js/dungeon.js` (`ReinoCentral`, com `paraMundo` e `paraLocal`), os portões e caminhos ficam em `js/mapa/gerador.js` (`ESTRADAS`, `ANG_REINO`, `naEstradaReal`) e o cenário em `js/reino.js` (`PORTOES`, `RAIO_MURALHA`, `RAIO_ANEL`).

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

  No total: no chefe, **70%** de cair galho e **45%** de cair asa; no rei, 50% e 25%. O **Nível da Masmorra** soma **+2%** nos dois a cada nível (no nível 10: 88% e 63%; a chance de não cair nada continua 10%).

- **Fica salvo** em `estado.casaNivel` e `estado.galhos` (as Asas em `estado.asas` e os Corações em `estado.coracoes`). Os números ficam em `CASA` e `DROPS` (com `sortearDrop`), no `js/bolsa.js`; o desenho dos 5 níveis em `criarCasa(nivel)`, no `js/modelos.js` (as peças do mesmo material viram uma malha só).

## Grupos de monstros

- Pelo mapa andam **grupos de 6 monstros**: 5 comuns e 1 **líder**, que é maior e usa coroa dourada.
- **Níveis (passo 6):** acompanham a sua equipe. Comuns = o seu nível médio + 1 (+2% da média); líder = média + 2 (+5%). Ex.: equipe Nv.5 → 6/7; Nv.30 → 32/34; Nv.70 → 72/76 (`niveisDeGrupo` no `js/dados.js`).
- **Selvagens soltos:** logo depois do anel tranquilo ~0,8× a sua média; na borda do mapa ~1,1× (até o Nv.95). Perto do Reino continuam Nv.2 a 5.
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
| Fogo + Planta | Brotobrasa | Chamafolha | Ardentroco | Florinferno | Floresta, Vulcão |
| Água + Fogo | Vaporito | Fumarolo | Gêiserão | Caldeirax | Arquipélago e lagos, Vulcão |
| Terra + Raio | Imanito | Magnetito | Ferrovolt | Titanvolt | Deserto, Picos Nevados |

## Cristais de captura

| Cristal | Cor | Chance | Como conseguir |
|---|---|---|---|
| Comum | Azul | 1× | Brilhos azuis no mapa, vitórias |
| Forte | Roxo | 1,5× | Brilhos roxos no mapa (raros), líder de grupo (+1), vencer um tipo duplo (+1), fundir 3 comuns |
| Supremo | Dourado | 2,2× | Brilhos dourados (muito raros), tipos duplos evoluídos (às vezes), fundir 3 fortes |

- **Forma final** (a última forma das linhas, dos tipos duplos e dos raros): fora da sua equipe, ela só aparece nos chefes e líderes de masmorra (e nos treinadores). Para capturar, **só o Cristal Supremo** segura, e a chance cai para **40%** da normal (`CAPTURA_FORMA_FINAL`, `ehFormaFinal` e `cristalMinimo` no `dados.js`).
- **Fundir:** no painel **Equipe**, perto da sua casa, 3 cristais iguais viram 1 do tipo acima.
- Na batalha, o jogo escolhe sozinho o cristal mais fraco que funciona no alvo; o botão **Tipo** troca na mão.
- Os cristais do chão reaparecem 1 minuto depois, com a cor sorteada de novo.
- São cerca de 40 espalhados pelo mapa, mais os **lugares secretos**: embaixo do arco de pedra do Deserto e na margem do oásis (Forte), ao lado do cristal de gelo gigante da Neve (Supremo) e no píer do lago escondido da Floresta (Forte).

## Dungeons (mundo novo, passo 5)

**Dungeons são mais fáceis que as masmorras** (decisão do Lâmina): lugares isolados (área separada, como as masmorras) com **2 ou 3 grupos de monstros** e o **Rei da Dungeon**, o monstro mais forte. **Todos são capturáveis** (o Rei nunca vem na forma final, então os cristais normais seguram). O código fica em `js/dungeons/` (veja o README de lá).

- **Quantas e onde:** **3 dungeons ativas por bioma**. Cada bioma tem **6 lugares possíveis** (`js/dungeons/lugares.js`, achados pela semente: planos, bem dentro do bioma, longe das vilas, das entradas das masmorras, da Estrada Real, dos corredores e dos lugares únicos dos biomas). **O mapa não muda:** a entrada é só posta em cima do chão, e os 6 lugares ficam sem árvore desde o começo. Cada dungeon usa uma das **6 variações do guia do Lâmina** daquele bioma (nunca duas iguais ao mesmo tempo).
- **Prontos os 5 biomas** (as 30 variações do guia do Lâmina): 15 dungeons ativas no mapa ao mesmo tempo.
- **A entrada:** um arco de pedra com o **vórtice** (o redemoinho colorido que serve de porta), o anel de pedras e a poça de brilho falso. A **25 m** aparece "Você descobriu..." e, daí em diante, um **cristal flutua em cima da entrada** (sem névoa: dá para ver de longe). Sem mapa na tela: é assim que você acha as dungeons.
- **Lá dentro:** a porta de luz do começo (sair a qualquer hora), as salas com os grupos (os mesmos níveis dos grupos do mapa, +1 a cada grupo) e o **portão selado do Rei**, que só abre quando **todos os grupos** forem vencidos. Os grupos vencidos ficam salvos até o reset (dá para sair no meio). Sem monstros soltos.
- **O Rei:** maior, com coroa, no trono da última sala. Nível (passo 6) = a sua média + 2 (+10%), +1 se forem 3 grupos, sempre acima do último líder (equipe Nv.36 → Rei Nv.42). **Prêmio:** 1 Cristal Forte, **20% de chance de um Supremo**, **80 + 10 de ouro por nível da sua equipe** e a sorte de **Galho Raro e Asa do Anjo** (`DROPS.reiDungeon` no `bolsa.js`: 50% galho, 25% asa). Vencido ou capturado, abre o portal de saída.
- **Reset:** depois de vencer o Rei, o cristal fica **cinza** e o vórtice apaga. **2 horas de tempo de jogo** depois (só conta com o jogo aberto, no mapa ou na batalha), a dungeon **se renova**: muda de lugar (para um dos lugares livres do bioma), de variação, sorteia de novo os grupos (2 ou 3) e o Rei, e precisa ser **descoberta de novo**.
- **Jogo salvo:** na conta e na nuvem, em `estado.dungeons` (`{ agua0: { lugar, variacao, grupos, vencidos, rei, achada, vencida, t } ... }`). Um save antigo ganha dungeons sorteadas na primeira vez. Fechou o jogo lá dentro? Você volta na frente da entrada. A bandeira não pode ser fincada lá dentro.
- **GM:** aba Dungeons, no começo: ir até a entrada, entrar, ir direto ao Rei, resetar agora e trocar a variação.

### As 6 do Arquipélago (o guia do Lâmina)
| Variação | Grupo 1 | Grupo 2 | Grupo 3 | O Rei |
|---|---|---|---|---|
| **Gruta dos Arcos de Maré** | Fenda da Maré Baixa (paredões dourados, conchas, cracas) | Salão dos Pilares de Calcário (colunas em arcos, água turquesa) | Câmaras de Sifão (arcos de coral seco) | Lagoa do Teto Aberto (claraboia, samambaias e orquídeas) |
| **Farol Submerso de Solis** | Topo da Escadaria Quebrada (no alto da torre, ao sol) | Galeria dos Prismas Salinos (janelas, espelhos, cristais de sal) | Câmara da Lente Submersa (meio alagada, a lente gigante) | Base do Recife Profundo (arcos de pedra, esponjas que brilham, bolhas) |
| **Cemitério dos Galeões de Coral** | Convés Inclinado da Proa | Porão dos Jardins de Esponja (navio partido, poças, frestas de sol) | Passarela das Âncoras Suspensas (vigas e correntes sobre o canal) | Câmara do Leme Cristalino (a popa com os vitrais) |
| **Santuário das Águas Bioluminescentes** (sempre de noite) | Cais das Lanternas Âmbar | Corredor das Marés Luminosas (o chão alagado brilha) | Anfiteatro das Conchas Gigantes (degraus em roda da piscina) | Poço Estelar (o espelho d'água sob as estrelas) |
| **Caldeira Verde da Ilha Alta** (subida ao ar livre) | Garganta das Samambaias Gigantes | Terraços das Cachoeiras Gêmeas (piscinas esmeralda, arco-íris) | Ponte Pênsil dos Bambuzais (sobre o abismo) | Mirante da Cratera Florido (a ruína no pico, o mar lá embaixo) |
| **Labirinto do Manguezal Translúcido** | Portal das Raízes em Arco | Passarela dos Espelhos Rasos (o cruzamento, com becos) | Clareira das Árvores-Gaiola (a cúpula de galhos) | Relicário da Maré Parada (a plataforma octogonal branca) |

### As 24 dos outros biomas (o guia e as artes do Lâmina; Rei → a última sala)
| Bioma | Variações |
|---|---|
| **Vulcânico** (`js/dungeons/vulcao.js`) | **Forja Primordial das Correntes** (aqueduto de escória, pátio das bigornas, galeria dos foles, núcleo preso por correntes diante da cascata de lava) · **Bacia do Vitriol Esmeralda** (fumarolas de enxofre, crostas sobre o ácido em chamas, gruta dos cristais amarelos, altar da chama ciano) · **Catedral de Obsidiana Espelhada** (boca de estalactites, nave com o canal de lava, abóbada das agulhas, chão de magma) · **Pináculos do Basalto Partido** (degraus hexagonais, platô das colunas sobre a lava, ponte de pedra-pomes, coroa das 7 colunas) · **Necrópole das Cinzas Silenciosas** (avenida das estátuas, pátio com as cascatas de cinza, arquivos de pedra, câmara da brasa eterna) · **Garganta dos Gêiseres** (a espiral pela parede da cratera, gêiseres, túnel dos fungos laranja, o anel de ferro sobre o magma) |
| **Deserto** (`js/dungeons/deserto.js`) | **Pirâmide do Espelho Solar** (rampa da esfinge, dutos de luz, espelhos de bronze, pyramidion dourado) · **Hipogeu dos Escribas Azuis** (portal do disco alado no penhasco, escadaria soterrada, salão das colunas de papiro azul e ouro, biblioteca, cripta estrelada com o sarcófago) · **Templo da Ampulheta Seca** (pátio inclinado, funis derramando areia, galeria das ondas de areia, o contrapeso dourado nas correntes) · **Avenida das Esfinges Soterradas** (obeliscos negros, túnel escorado sob a duna, pátio das esfinges, capela de basalto com turquesa) · **Cisterna Secreta do Oásis** (poço das tamareiras, aqueduto de faiança turquesa, salão alagado das colunas de lótus, cofre das ânforas) · **Doca das Barcas Solares** (portas falsas, a 1ª barca, a ponte de cordas, a barca solar real) |
| **Floresta** (`js/dungeons/floresta.js`) | **Catedral das Cortinas de Âmbar** (arco de raízes, nave dos troncos prateados com as cortinas de âmbar, terraço dos galhos, o bloco dourado) · **Observatório dos Freixos Cantantes** (degraus de ardósia, anel dos freixos com o vento, passarela de quartzo, cúpula com os anéis) · **Pântano das Lanternas-do-Brejo** (turfa, passarela entre os salgueiros, ilhota dos cogumelos ciano, gruta sob a árvore tombada) · **Torre Oca da Árvore-Mãe** (base das raízes, a espiral de âmbar subindo, galhos sobre a névoa, o ninho na copa) · **Garganta das Pontes Vivas** (as pontes de raízes em 3 alturas sobre o rio, cipós-lira, a cascata de seiva) · **Jardim dos Esporos Dourados** (túnel de samambaias, prado dos fungos-tambor, o tronco caído com as orelhas-de-prata, a lagoa com o castelo de fungos e a nuvem de esporos) |
| **Gelo** (`js/dungeons/gelo.js`) | **Coração da Geleira Fendida** (a fenda azul, galeria das bolhas, ponte de gelo sobre o abismo, a câmara do sol com o arco-íris) · **Mina Abandonada do Passo Norte** (pórtico com as lanternas, trilhos congelados, poço dos elevadores, o veio de cristal azul) · **Templo Rúnico da Névoa Branca** (escadaria com as derivas, avenida dos obeliscos rúnicos, pátio dos arcos quebrados, o monólito) · **Termas Profundas de Vapor e Gelo** (bruma quente, piscinas turquesa em degraus, a ponte sob as gotas, o domo das estalactites) · **Casco do Quebra-Gelo Aprisionado** (o lago rachado, o convés inclinado, o porão com o gelo, a popa envidraçada) · **Torre de Vigia da Cordilheira** (o desfiladeiro, a ponte pênsil congelada, o salão da lareira, o mirante do sino) |

- **Leve:** as peças de cada dungeon são juntadas numa malha só por material. O cenário custa **8 a 59 desenhos por quadro** (as masmorras ficam entre 37 e 58); com um grupo de 6 monstros na tela, 82 a 101 (como no mapa de fora). A entrada no mapa custa ~8 desenhos. A busca dos lugares leva ~0,15 s no PC na primeira vez e depois fica guardada no aparelho.

## Masmorras novas (áreas separadas, mundo novo passo 4)

São **2 por bioma** (o Caminho das Brasas e a Trilha Ancestral contam como uma delas e continuam como corredores abertos), nos lugares que a semente guardou em `LUGARES` (`js/mapa/gerador.js`). **Masmorras são difíceis e demoradas; dungeons são fáceis** (passo 5, veja "Dungeons" acima). Prontas: **Gruta do Trovão** e **Torre da Nevasca** (Gelo), **Mina Abandonada** e **Tumba das Areias** (Deserto), **Pântano Sombrio** (Floresta), **Forja Antiga** (Vulcânico), **Templo Submerso** e **Gruta das Marés** (Arquipélago): as 8 completas.

- **Entrada escondida:** no mapa só fica a porta, **sem ícone**. As exceções, bem à vista, pelas artes do Lâmina: a **Gruta do Trovão** (a caverna de gelo: paredão de rocha escura, vigas de mina, pingentes, brilho ciano lá dentro e uma lanterna) a **Tumba das Areias** (o hipogeu no penhasco de arenito, com o disco solar alado e 2 colossos) a **Forja Antiga** (a entrada das Cavernas de Tubos de Lava, no flanco do Monte Vael; a porta mudou para lá) e a **Gruta das Marés** (a gruta marinha de calcário, com samambaias, orquídeas e o barco). A 22 m dela aparece **"Você descobriu a Gruta do Trovão!"** (fica salvo: `estado.masmorras.trovao.achada`). Encostou na boca, a tela escurece e o jogo monta **só a masmorra**.
- **Área separada:** cada masmorra fica **bem longe do mapa redondo** (x = 1800, 2700, ...). Lá dentro, `alturaEm`, a colisão e a região perguntam à forma da masmorra (`interiorEm` em `js/masmorras/forma.js`); o mapa de fora some sozinho (os chunks ficam longe e são apagados) e os monstros dele somem. Ao sair, **tudo da masmorra é apagado da memória** (só uma existe por vez).
- **5 etapas + o chefe.** Cada etapa tem **1 grupo com líder** e até 4 monstros soltos. O **portão selado** (a parede de energia azul) da saída da etapa **só abre quando o líder é vencido**. Cada vez que você entra, os portões começam fechados de novo.
- **Monstros:** só os tipos do bioma (na Gruta: linha Raio e Imanito); Sol, Luz, Lua e Trevas como visitantes raros (`aparicoes`).
- **Níveis:** acompanham a equipe (como as masmorras de hoje), mas com um **piso**: a 1ª masmorra do bioma começa com comuns Nv.55, líder Nv.62 e chefe Nv.72; a 2ª com Nv.62/70/80. Acima do piso: comuns = a equipe + 3, líder = + 5 e chefe = + 12 (passo 6). Cada etapa soma +2. O **Nível da Masmorra** (1 a 10) soma +3 por nível, até o Nv.98/100 (`niveisMasmorraNova`, `nivelChefeMasmorraNova`).
- **Chefe:** sorteado entre as formas finais do tipo (Gruta: Tempestor ou Titanvolt). **Sem lendário** em Gelo, Deserto e Arquipélago até o Lâmina criar os lendários desses tipos. Só o **Cristal Supremo** captura, com **metade da chance** de uma forma final (`fatorCaptura`). Prêmio: 3 cristais fortes, 2 supremos, a sorte de Galho e Asa e **300 + 50 de ouro por Nível da Masmorra**. **Não dá ovo.** Vencido, volta no próximo amanhecer (sorteado de novo).
- **Sair:** pela **porta de luz** do começo (a qualquer hora) ou pelo **portal** que aparece no trono depois do chefe. Desmaiou lá dentro? Renasce na bandeira ou na fonte, do lado de fora. **Fechou o jogo lá dentro?** O jogo salva a posição na frente da porta, do lado de fora. A **bandeira não pode ser fincada** lá dentro.
- **Leve:** o chão é feito dos mesmos triângulos de `alturaEm`, em pedaços de 64 m; os enfeites são juntados em lotes de 90 m. O cenário da Gruta custa 37 a 58 desenhos por quadro (o Reino custa ~50); os monstros custam igual ao mapa de fora. No máximo 260 partículas e nenhuma luz extra (os brilhos são cor própria dos materiais).

### Gruta do Trovão (Gelo)
~600 m de caminho, do céu aberto para dentro da montanha:
1. **Vale da Nevasca:** campo de neve, pinheiros nos morros, pedras, a torre em ruínas e um laguinho congelado.
2. **Lago Congelado:** chão de gelo com rachaduras, buracos de água funda (empurram para fora), pingos de gelo na margem e um barco preso no gelo. Depois, a **Boca da Gruta** (arco de pedra com pingentes de gelo).
3. **Galeria de Cristal:** escuro, com cristais azuis e roxos que brilham (no chão e nas paredes) e estalagmites. Depois, a **Ponte do Abismo** (ponte de gelo sobre um buraco sem fundo, com cristais lá embaixo).
4. **Salão dos Raios:** 6 pilares que soltam raios entre si (1 desenho só, refeito várias vezes por segundo), pedras de ímã e pedras flutuando.
5. **Escadaria Trovejante:** 6 degraus gigantes, braseiros de fogo azul e duas estátuas de pássaros do trovão.
- **Trono da Tempestade:** céu aberto com relâmpagos, pilares de cristal, o círculo de runas, o trono de gelo, nuvens girando e o chefe.

### Torre da Nevasca (Gelo, a 2ª do bioma: comuns Nv.62, líder Nv.70, chefe Nv.80)
Uma subida no meio da nevasca (o vento leva a neve de lado):
1. **Trilha do Penhasco:** a rampa que sobe 8 m, com cerca de madeira e bandeirinhas coloridas.
2. **Acampamento Abandonado:** barracas cobertas de neve, fogueira apagada (ainda com brasas), caixas, um trenó e uma bandeira rasgada.
3. **Pátio da Torre:** muralha com torrinhas, 5 cavaleiros de gelo e a fonte congelada.
4. **Salão do Gelo Eterno:** dentro da torre (de fora ela é um tubo de pedra com telhado), pilares de cristal, o tapete e o lustre que gira. Depois, a **Ponte das Correntes** sobre o abismo.
5. **Cume Gelado:** espinhos de gelo gigantes, árvores mortas e montes de neve.
- **Sino da Nevasca:** o sino gigante balançando no arco, braseiros azuis e o chefe (Tempestor ou Titanvolt).

### Mina Abandonada (Deserto, a 1ª do bioma)
Do sol do cânion até o fundo da terra:
1. **Cânion Vermelho:** paredões listrados (a cor muda com a altura), mesas de pedra, cactos e a caveira gigante de um bicho antigo.
2. **Pátio da Mina:** barracos, a caixa d'água, o trilho até a boca da mina, vagonetes e barris.
3. **Túneis de Madeira:** vigas baixas (a câmera passa por cima), lampiões e o trilho. Depois, a **Ponte dos Trilhos** sobre cavaletes, em cima de um buraco escuro.
4. **Caverna de Minério:** cristais âmbar, dourados e azuis, pedras de ímã (do Imanito) e a perfuradora quebrada.
5. **Poço Profundo:** 5 degraus descendo 11 m, com corrimão, escadinhas e o guincho com o balde.
- **Coração da Terra:** o geodo gigante de cristais atrás do chefe (Montanhar ou Titanvolt).

### Tumba das Areias (Deserto, a 2ª do bioma: comuns Nv.62, líder Nv.70, chefe Nv.80)
A época dos faraós (ideia do Lâmina): pirâmides e esfinges com cabeça de gato.
1. **Dunas dos Faraós:** 2 pirâmides em degraus na beira do caminho e 3 gigantes atrás das dunas (aparecem melhor girando a câmera para o horizonte), o oásis com palmeiras e obeliscos tortos.
2. **Avenida das Esfinges:** 12 esfinges deitadas com cabeça de gato, o pano azul e dourado dos faraós e olhos verdes que brilham.
3. **Templo do Sol:** o portal gigante com o disco do sol, colunas pintadas, o altar dourado e obeliscos. As paredes das salas da tumba têm faixas vermelha, azul e dourada.
4. **Câmara dos Sarcófagos:** 6 sarcófagos, vasos, tochas e tesouro. Depois, o **Poço de Areia** (ponte de pedra sobre espinhos).
5. **Galeria dos Deuses Gato:** 6 gatos gigantes sentados (pretos e dourados), tesouro e o escaravelho.
- **Câmara do Faraó:** o sarcófago gigante em pé, 2 gatos guardiões, colunas, ouro e a luz do sol que cai do teto (transparente, sem luz de verdade) em cima do chefe (Montanhar ou Titanvolt).

### Pântano Sombrio (Floresta; comuns Nv.62, líder Nv.70, chefe Nv.80)
A outra masmorra da Floresta é a Trilha Ancestral (sem piso), então esta usa o piso mais alto. Tem o **lendário Silvárion** a partir do Nível 9 (15%), como a Trilha.
1. **Charco das Névoas:** névoa fechada, poças fundas com vitórias-régias e flores, juncos e árvores tortas e mortas.
2. **Bosque dos Cogumelos:** cogumelos gigantes roxos, verdes e rosa que brilham. Depois, a **Passarela do Brejo** (madeira estreita em cima da água funda, com lampiões verdes).
3. **Cabana da Bruxa:** a cabana em palafitas com janelas verdes, o caldeirão que borbulha, totens com olhos e lampiões.
4. **Raízes Afogadas:** arcos de raízes gigantes por cima do caminho e musgo que brilha.
5. **Lagoa dos Vaga-lumes:** lagoas, lanternas de pedra e vaga-lumes amarelos.
- **Árvore Morta Ancestral:** a árvore gigante com olhos verdes, as raízes, as pedras de runas e o chefe (Florestral, Florinferno, Mandacarão no Nível 5+ ou o Silvárion).

### Forja Antiga (Vulcânico; comuns Nv.62, líder Nv.70, chefe Nv.80)
A outra do Vulcânico é o Caminho das Brasas (sem piso), então esta usa o piso mais alto. Tem o **lendário Ignárion** a partir do Nível 9 (15%).
1. **Campo de Cinzas:** cinza caindo do céu, árvores queimadas, pedras com rachaduras de lava e poças de lava (empurram para fora).
2. **Rio de Lava:** um rio de lava corta a sala; só se passa pela ponte de pedras no meio.
3. **Portão da Forja:** as estátuas dos ferreiros gigantes com martelos e runas acesas nas paredes.
4. **Salão das Bigornas:** bigornas, fornos acesos, canais de lava no chão e correntes penduradas. Depois, a **Ponte de Obsidiana** sobre um mar de lava.
5. **Fundição:** 5 degraus que sobem, caldeirões despejando lava e engrenagens gigantes girando nas paredes.
- **Coração da Forja:** a grande fornalha com o fogo mexendo, a bigorna-altar, cascatas de lava e o chefe (Magmalobo, Caldeirax, Florinferno, Colossarapa no Nível 5+ ou o Ignárion). A lava pulsa (1 material só).

### Templo Submerso (Arquipélago, a 1ª do bioma)
1. **Praia dos Corais:** palmeiras, corais coloridos, conchas, estrelas-do-mar, poças de maré e o mastro de um barco enterrado.
2. **Recife Raso:** a água cobre os pés (um plano de água transparente), corais grandes e algas.
3. **Átrio Afundado:** colunas quebradas (uma caída), a estátua do deus do mar com o tridente e canais de água.
4. **Salão das Conchas:** conchas gigantes abertas com pérolas que brilham, o chão em mosaico de círculos e raios de luz entrando. Depois, a **Ponte do Abismo Azul**.
5. **Jardim de Algas:** algas altas e 9 águas-vivas flutuando (1 desenho só).
- **Santuário do Tridente:** o tridente gigante dourado, o altar da pérola, cascatas nas paredes e o chefe (Tsunamar, Leviaraia ou Caldeirax).

### Gruta das Marés (Arquipélago, a 2ª do bioma: comuns Nv.62, líder Nv.70, chefe Nv.80)
1. **Enseada dos Naufrágios:** o navio quebrado (com as costelas de madeira), a âncora, barris e caixas.
2. **Piscinas de Maré:** paredões de pedra com espuma na base, poças com anêmonas que brilham e um arco de pedra.
3. **Gruta de Cristal Marinho:** cristais azuis e verde-água.
4. **Esconderijo Pirata:** plataformas de madeira, baús de tesouro abertos, canhões, ouro e a bandeira preta com a caveira. Depois, a **Ponte de Cordas** sobre o mar escuro.
5. **Caverna do Polvo:** tentáculos gigantes saindo das poças, mexendo devagar (todos os pedaços num desenho só).
- **Trono das Marés:** a concha gigante com a pérola, pedras altas no mar, lampiões, relâmpagos e o chefe (Tsunamar, Leviaraia ou Caldeirax).

- **Textos:** cada masmorra guarda se o nome é feminino (`fem`, `fimFem` em `MASMORRAS_NOVAS`), para os avisos saírem certos ("no Pântano", "na Câmara do Faraó"; função `com` no `dados.js`).
- **Código:** `js/masmorras/forma.js` (a forma: salas, corredores, abismos, buracos; só matemática; as salas são `aberta`, `canion` ou `gruta`), `js/masmorras/masmorra.js` (a base: entrar e sair, chão, portões, grupos, soltos, chefe, clima e as entradas no mapa), `js/masmorras/pecas.js` (peças que todas usam: pinheiro, cristais, porta de luz, braseiro, árvore morta, plano de água ou lava, espalhar nos morros) e um arquivo por masmorra com o desenho dela: `gruta-trovao.js`, `torre-nevasca.js`, `mina-abandonada.js`, `tumba-areias.js`, `pantano-sombrio.js`, `forja-antiga.js`, `templo-submerso.js` e `gruta-mares.js`. Os números ficam em `MASMORRAS_NOVAS` e `MASMORRA_NOVA` (`js/dados.js`). GM, aba **Dungeons**: entrar no começo, em cada etapa ou no trono, ir para a porta no mapa, abrir os portões, o Nível da Masmorra, o chefe volta já e sortear outro chefe.

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

### Nível da Masmorra e chefes sorteados (fase 8.1)

Vale para o Caminho das Brasas e para a Trilha Ancestral (cada uma tem o seu nível).

- **Nível da Masmorra de 1 a 10**, salvo na conta (`estado.masmorras`). Aparece na entrada: **"Caminho das Brasas · Nível 3"**.
- **Cada vitória contra o chefe** (vencido ou capturado) sobe 1 nível.
- Cada nível soma **+3 níveis** em todos os monstros de lá (acampamentos, soltos e chefe), até o Nv.100.
- **A partir do nível 5**, metade dos líderes vem na **forma final** (se tiver nível para ela).
- **O chefe é sorteado** cada vez que volta (no amanhecer depois de vencido), entre as formas finais do tipo da masmorra. Ele vem maior, de coroa, entra em **fúria** com menos da metade da vida e deixa o mesmo tesouro (cristais, 300 de ouro, Galho e Asa por sorte). **Não dá ovo.**

  | Masmorra | Chefes | A partir do nível 5 | A partir do nível 9 |
  |---|---|---|---|
  | Caminho das Brasas | Magmalobo, Florinferno, Caldeirax | + Colossarapa | o **Ignárion** pode despertar (15%) |
  | Trilha Ancestral | Florestral, Florinferno | + Mandacarão | o **Silvárion** pode despertar (15%) |

- Quando o lendário vem, aparece o aviso **"O Ignárion despertou no Trono de Magma!"**.
- O sorteio fica salvo: fechar e abrir o jogo não troca o chefe.
- Nível do chefe (passo 6): a equipe + 12 (`CHEFE_ACIMA`). Os acampamentos usam a regra dos grupos do mapa mais o extra de cada etapa.
- Tudo isso fica em `MASMORRA`, `dadosMasmorra`, `sortearChefe`, `niveisDaEtapa` e `nivelDoChefe` (`js/dados.js`), e em `spawnarChefe` e `chefeVencido` (`js/dungeon.js`).

### Chefe: Ignárion (lendário)

- Desde a fase 8.1, ele só aparece **a partir do Nível 9 da masmorra**, por sorteio (15% cada vez que o chefe volta). Antes disso, o chefe é sorteado (veja acima).

- Fica no **Trono de Magma**, no fim do caminho, aos pés de um vulcão gigante.
- Tipo **Ígneo**, um elemento novo: um fogo mais forte, que é super efetivo contra Planta, Terra e até Fogo. Só a **Água** é forte contra ele.
- Efeito do Ígneo: **Combustão**, que tira 6% da vida por segundo e impede cura.
- Nível: o da equipe + 12 (Nv.15 com equipe Nv.3).
- Com menos da metade da vida, entra em **fúria** e ataca bem mais rápido.
- Usa os golpes de lendário (veja "Golpes do Ignárion"), com o **Calor Ígneo**: quando a barra enche, entra em **Ignição** (mais dano por 5 s). A placa mostra "Calor N%".
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

### Chefe: Silvárion (lendário)

- Desde a fase 8.1, ele só aparece **a partir do Nível 9 da masmorra**, por sorteio (15%), como o Ignárion.

- Fica no **Santuário da Árvore-Mãe**, no fim da trilha, aos pés de uma árvore gigantesca.
- Tipo **Silvestre**, um elemento novo: uma planta mais forte, super efetiva contra Água, Terra e até Planta. Só **Fogo** (e o Ígneo) são fortes contra ele.
- Efeito do Silvestre: **Parasita**: uma semente suga 2,5% da vida a cada meio segundo, cura quem a plantou e deixa 30% mais lento. Os três golpes dele (Galhada Ancestral, Semente Parasita e Selva Viva) causam o efeito.
- Arena própria: **Santuário da Árvore-Mãe** (favorece Silvestre). Perigo: **raízes saem do chão** onde aparece um círculo verde; machucam e prendem (Planta e Silvestre não sentem).
- Nível: o da equipe + 12 (Nv.15 com equipe Nv.3). Com menos da metade da vida, entra em **fúria**.
- É um **filhote de cervo** (a forma inicial do lendário) e usa a **Seiva Vital**: a Parasita enche a barra e a Selva Viva gasta a Seiva para curar. A placa mostra "Seiva N%". Veja "Golpes do Silvárion".
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
| Reino | No meio do mapa: castelo, vila, loja, arena e os 5 portões | Ninguém (é seguro). Logo depois dos portões, o anel tranquilo (monstros fracos) |
| Picos Nevados | **Gelo**: montanhas, pinheiros carregados de neve, rochas escuras com neve, rios e lagos congelados, o Acampamento do Gelo e o cristal de gelo gigante (veja "Bioma do Gelo") | Raio (Faisquinho), com relâmpagos; Luz de dia, Trevas à noite |
| Floresta | **Mata de Véu-Âmbar**: Carvalhos-Véu com cortinas de âmbar, freixos, salgueiros, samambaias, cogumelos ciano, a Catedral das Cortinas, as Pontes de Raiz e o Pântano das Lanternas Azuis (veja "Bioma da Floresta") | Planta (Musguinho), Espinhal (raro); Luz de dia, Trevas à noite. Daqui sai a Trilha Ancestral |
| Deserto | **Areias de Djeser-Ra** (Antigo Egito): dunas, cânions, acácias, o caminho até as pirâmides, o Templo Solar, a Avenida das Esfinges, o Oásis do Lótus Azul e a tempestade de Khamsin (veja "Bioma do Deserto") | Terra (Pedrisco); Sol de dia, Lua à noite |
| Vulcão | **Caldeira de Ignis-Vael**: colunas de basalto, obsidiana, Árvores-Brasa, a Forja Primordial, o Monte Vael, a Bacia do Vitriol (ácido) e a Chuva de Cinzas (veja "Bioma Vulcânico") | Fogo (Brasito), Vulcarapa (raro); Sol de dia, Trevas à noite. Daqui sai o Caminho das Brasas |
| Arquipélago | **Marés de Safira**: água rasa turquesa (dá para andar, mais devagar), ilhas com praia, coqueiros e mata, canais fundos azul-safira, a Enseada dos Bangalôs, a Ilha da Cachoeira, o farol e os veleiros (veja "Bioma do Arquipélago") | Água (Gotinho), Aquaraia (raro); Luz de dia, Lua à noite |
| Lago | Em volta dos lagos da Floresta e do oásis do Deserto | Água (Gotinho), Aquaraia (raro) |

**Sol, Luz, Lua e Trevas** são **visitantes raros** (cerca de 1 em cada 10 monstros): Sol e Luz de dia, Lua e Trevas à noite. Cada bioma tem só os seus tipos (`APARICOES` no `dados.js`).

## Bioma do Gelo (melhorias dos biomas: o guia do Lâmina)

O Gelo segue o guia e as artes do Lâmina: **paleta glacial com acentos âmbar** (neve `#EDF4FA`, sombras `#8EA8C3`, gelo `#4A89AA`, rocha `#2B3644`, pinheiro `#233D3B`, âmbar `#F28C28` só nas luzes). O lugar já tinha o esquema do guia: a Estrada Real do Gelo termina entre os 2 lagos congelados, com as montanhas atrás.

- **Peças comuns** (nos chunks, `js/mapa/chunks.js`): pinheiros carregados de neve (com muita ou pouca neve), árvores mortas congeladas, rochas escuras com 20%, 50% ou 80% de neve, cristais de gelo ciano, montes de neve, capim seco dourado e montinhos (os pequenos somem de longe). O chão: neve clara no plano, azul-ardósia nas ladeiras e rocha escura nos paredões.
- **Rios e lagos congelados:** no Gelo a água vira gelo ciano (sem a água por cima) e dá para andar normal (sem a lentidão da água rasa).
- **Trilha com lanternas:** do fim da Estrada Real até o acampamento, neve batida com lama nas bordas e postes tortos com lanternas âmbar.
- **Acampamento do Gelo (lugar seguro que cura):** cabana de toras (telhado de neve, pingentes, chaminé com fumaça, janelas acesas, varanda e lenha), fogueira com bancos, barraca, trenó, caixotes e barris. **Nenhum selvagem nasce nem entra a menos de 12 m** e **a fogueira cura a equipe** (a 6 m dela). Não tem loja e você não acorda nele (acorda na bandeira ou no castelo).
- **Lago congelado:** rachaduras, manchas escuras, o barco preso no gelo, um píer e bruma por cima.
- **Floresta fechada e arco rúnico:** pinheiros mais juntos ao lado do acampamento, com um arco de pedra antigo de runas ciano na beira.
- **Fonte termal:** água azul sem gelo, pedras sem neve e vapor subindo (só enfeite).
- **Entrada da Gruta do Trovão:** a caverna de gelo da arte (deixou de ser escondida).
- **Neve caindo** em volta do jogador (só no Gelo; desligada na qualidade Fraco) e a luz do chão puxando para o azul.
- **Leve no celular:** as peças comuns usam as mesmas formas que o mapa já tinha (não somam desenhos); cada área única vira 1 ou 2 malhas (cor nos vértices) e só é desenhada de perto; as luzes são **brilho falso** (pontos com uma textura redonda, sem luz de verdade). Medido na qualidade Médio: de +5 a +10 desenhos por quadro (no lago, até menos); na Fraco, quase igual.
- **Código:** os lugares em `js/biomas/lugares.js` (`GELO`, `naTrilhaGelo`: só matemática, presos à semente, sem mexer no relevo, nos rios, nas vilas nem nas masmorras); as peças em `js/biomas/gelo.js` (`BiomaGelo`); os refúgios (`refugios`, `refugioEm`) e a cura da fogueira no `js/mundo.js`; a entrada da Gruta em `js/masmorras/gruta-trovao.js`. GM: teleporte **Acampamento do Gelo**.

## Bioma da Floresta: Mata de Véu-Âmbar (o guia do Lâmina)

Paleta do guia: âmbar `#D99B26`, musgo profundo `#1E3F35`, prata `#7A8489`, azul-petróleo `#2B4652` e ciano `#45C4B0`.

- **Peças comuns** (nos chunks): **Carvalho-Véu** (casca prateada, raízes em contraforte, copa verde-musgo e cortinas de âmbar um pouco transparentes pingando dos galhos), **Freixo-Oco** (claro e esguio, com a fenda escura), **Salgueiro-Tanino** (perto da água, com fios de musgo), samambaias, pedras de ardósia com musgo, **Lanternas-do-Brejo** (cogumelos ciano que brilham mais à noite), **Fungos-Tambor** (bolas douradas) e troncos caídos. Chão de musgo com ardósia nas ladeiras e lama nas margens; rios e lagos com **água escura de tanino**.
- **Catedral das Cortinas:** clareira com 7 Carvalhos-Véu colossais em roda, o **Observatório Submerso** (ruína circular de ardósia com raízes), blocos de âmbar com silhuetas, raios de sol (faixas de luz falsas, de dia) e névoa.
- **Pontes de Raiz:** raízes vivas atravessando um rio, com Carvalhos-Véu nas margens.
- **Pântano das Lanternas Azuis:** o maior lago da Floresta, com ilhotas de musgo, raízes em arco, troncos caídos, salgueiros e muitos cogumelos ciano (bonito à noite). O nome aparece na tela.
- **No centro da Floresta** (onde sai a Trilha Ancestral): as 5 árvores gigantes viraram Carvalhos-Véu colossais e os cogumelos gigantes vermelhos e roxos viraram Lanternas-do-Brejo e Fungos-Tambor. A Trilha Ancestral (dungeon) não mudou.
- **Árvores especiais** (as colossais e os salgueiros do pântano) ficam transparentes quando tampam a câmera.
- **Clima:** névoa verde-azulada e sol dourado (o crepúsculo de mel e esmeralda do guia), misturando aos poucos na borda do bioma (`js/biomas/clima.js`).
- **Leve no celular:** a Floresta ficou **mais leve que antes** (de 15 a 35 desenhos a menos por quadro), graças à etapa 0 (os objetos de cada chunk juntados numa malha só) e às partes pequenas que somem de longe.
- **Código:** `js/biomas/floresta.js` (as peças e `BiomaFloresta`), os lugares em `FLORESTA` (`js/biomas/lugares.js`), as peças nos chunks (`pecaFloresta` e `corDaFloresta` no `js/mapa/chunks.js`) e o centro no `js/raizes.js`.

## Bioma do Deserto: Areias de Djeser-Ra (o guia do Lâmina, Antigo Egito)

Paleta do guia: areia `#E8C170`, terracota `#9E5A38`, calcário `#D9C7A3`, basalto `#2B282C`, lápis-lazúli `#215E8C`, turquesa `#3AB5A8` e ouro `#F2A922`.

O esquema do guia, do fim da Estrada Real do Deserto (a entrada sul) até o fundo do bioma:
- **Desfiladeiro dos Pilares Partidos:** paredões de arenito em camadas e pilares quebrados.
- **Estrada Cerimonial:** lajes rachadas, colunas com capitel de papiro e braseiros de bronze com fogo (brilho falso, mais forte à noite).
- **Templo Solar:** colunas e vigas quebradas, o portão (pilone) com o disco solar alado, escadas, braseiros, esfinges e o obelisco de basalto caído com hieróglifos turquesa.
- **Avenida das Esfinges:** esfinges (uma sem cabeça) e obeliscos de basalto com hieróglifos azuis.
- **Planalto das Pirâmides:** a Grande Pirâmide com o topo de ouro e a entrada selada, a pirâmide escalonada meio soterrada e uma menor.
- **Oásis do Lótus Azul:** água turquesa, tamareiras com tâmaras, papiro, lótus azul, o cais com colunas e o obelisco submerso.
- **Mar de Dunas:** a caravana soterrada e as costelas de uma criatura gigante.
- **Vale das Tumbas:** a entrada da **Tumba das Areias** virou o hipogeu escavado no penhasco (não é mais escondida).
- **No deserto todo:** acácias, tufos secos, pedras de arenito, pedaços de coluna e ânforas (**sem cactos**), areia voando em volta do jogador e a luz quente e dourada.
- **Tempestade de Khamsin:** rara (de 5 a 12 minutos no deserto entre uma e outra, 90 s cada). O céu fica ocre, a névoa fecha e voa muita areia. Só visual.
- **O caminho aplainado:** só no caminho (estrada, pátio do templo e planalto) o chão fica plano (`CAMINHO_DESERTO` e `alvoDeserto` no `js/mapa/gerador.js`, como o chão das vilas). Não muda a semente, as vilas, as masmorras, os rios nem o oásis.
- **Leve no celular:** o Deserto ficou mais leve que antes (de 5 a 17 desenhos a menos por quadro).
- **Código:** `js/biomas/deserto.js` (`BiomaDeserto` e as peças comuns), o hipogeu em `js/masmorras/tumba-areias.js`, o chão e as peças nos chunks (`corDoDeserto`) e a Khamsin no `js/biomas/clima.js`.

## Bioma Vulcânico: Caldeira de Ignis-Vael (o guia do Lâmina)

Paleta do guia: basalto `#1C191D`, cinza `#5C5659`, magma `#FF5E1A` e `#FFD147`, ácido `#8CE62E`, chama ciano `#2CF2C4` e céu ferrugem `#7A3222`.

Do fim da Estrada Real do Fogo (a entrada sul) até o vulcão do meio do bioma:
- **Fenda das Colunas Partidas:** paredões de colunas de basalto hexagonais.
- **Trilha de Basalto:** lajes de 6 lados com veios de lava, plana, com colunas dos dois lados.
- **Forja Primordial:** uma **fenda de lava** cruza a trilha; a **ponte de ferro** passa por cima (é o único lugar para atravessar) entre 2 pilares com correntes e engrenagens. Do outro lado, a plataforma com a **bigorna colossal**, o anel de lava, os dutos e a cascata caindo na fenda.
- **Rio de lava:** desce do Monte Vael até a fenda (não dá para entrar).
- **Monte Vael:** o vulcão do meio, com veios de lava descendo, pontas de rocha no cume e a pluma de fumaça com brasas.
- **Bacia do Vitriol Ígneo:** lagos de **ácido verde** (bloqueiam como a lava) com chamas ciano, crosta e cristais de enxofre, fumarolas e cardos azulados.
- **Cavernas de Tubos de Lava:** a entrada (arco de obsidiana, estalactites, rio de lava saindo e fungos laranja) é a **porta da masmorra Forja Antiga**, à vista, no flanco do vulcão.
- **Campos de Cinzas** e o **Cemitério de Cinza-Branca** (viajantes e animais petrificados).
- **No bioma todo:** colunas de basalto, obsidiana, Árvores-Brasa com folhas de cobre, minério ignita, cristais de enxofre, troncos petrificados e junco; brasas subindo e cinza caindo; céu ferrugem e a luz laranja vindo de baixo.
- **Chuva de Cinzas:** rara (de 6 a 13 minutos no Vulcânico entre uma e outra, 90 s cada). O céu escurece, a névoa fecha, cai muita cinza e relâmpagos piscam. Só visual.
- **O chão:** muda só na trilha, na fenda, no rio e na bacia (`CALDEIRA` e `mudarVulcao` no `js/mapa/gerador.js`). A Vila das Cinzas e o Caminho das Brasas não mudam.
- **Peso:** de 5 a 22 desenhos a mais por quadro (o pior é perto do vulcão, ~109 no Médio).
- **Código:** `js/biomas/vulcao.js` (`BiomaVulcao` e as peças comuns), a porta em `js/masmorras/forja-antiga.js` (`lugarNoMapa`), o chão nos chunks (`corDoVulcao`) e o céu no `js/biomas/clima.js`.

## Bioma do Arquipélago: Marés de Safira (o guia do Lâmina)

O chão não muda (as ilhas, a água rasa e os canais são os da semente); mudam as cores e as peças.
- **Cores:** água rasa turquesa e verde-esmeralda (o mar ficou mais transparente), canais fundos azul-safira, praia de areia marfim, falésias de calcário dourado e mata tropical no alto das ilhas.
- **Peças comuns** (nos chunks): coqueiros inclinados com cocos, amendoeiras, hibisco e buganvília, pedras calcárias e, no alto, bananeiras, bambu e samambaias; corais coloridos no fundo da água rasa, estrelas-do-mar e conchas na areia.
- **Enseada dos Bangalôs:** na ilha logo depois da Estrada Real: 2 bangalôs de palha sobre a água, o píer com lanternas, o barco a remo, a rede entre os coqueiros, amendoeiras e flores.
- **Ilha da Cachoeira e Arco de Pedra:** a ilha grande vira um pico verde com rochas e a cachoeira caindo na enseada; na frente, o arco de calcário gigante no mar.
- **Farol Antigo:** o farol de pedra com musgo (a luz brilha à noite), a torre de vigia, muros caídos, pedras entalhadas e o manguezal no canal ao lado.
- **Naufrágio do Mercante** (no raso, com corais) e o **Atol de Coral**.
- **Gruta das Marés:** a entrada virou a gruta marinha de calcário da arte do Lâmina (à vista).
- **Veleiros:** 4 barcos brancos vão e voltam pelos canais (só enfeite).
- **Coqueiros que desbotam:** cada coqueiro fica transparente sozinho quando tampa a câmera (`materialDesbota` no `js/biomas/comum.js`: a placa de vídeo faz a conta, sem custo extra).
- **Plâncton:** à noite, a água rasa perto de você brilha em azul-elétrico.
- **Chuva morna com arco-íris:** rara (de 7 a 14 minutos no Arquipélago entre uma e outra, 75 s). O céu fica cinza e cai a chuva; quando acaba, um arco-íris aparece sobre o mar por 40 s (arraste a tela para baixo para olhar o horizonte). Só visual.
- **Peso:** de 5 a 17 desenhos a mais por quadro (era o bioma mais leve; o pior é a gruta, ~94 no Médio).
- **Código:** `js/biomas/arquipelago.js` (`BiomaArquipelago` e as peças comuns), os lugares em `ARQ` (`js/biomas/lugares.js`), a gruta em `js/masmorras/gruta-mares.js`, o chão nos chunks (`corDoArquipelago`) e o céu no `js/biomas/clima.js`.

## Mapa procedural

O mapa é **gerado por uma semente** (seed): um número que decide tudo (onde fica cada bioma, o relevo, os rios, os lagos, as árvores). A mesma semente sempre dá o mesmo mapa. **Todos os jogadores usam a mesma semente**: o mundo é um só para todos. O código fica em `js/mapa/`.

- **Tamanho (mundo novo, versão 2 do mapa):** mapa redondo de **390 m de raio**, quase 4 vezes o anterior. Do portão do Reino até a borda são ~39 s andando. Na borda o chão sobe e há montanhas.
- **Biomas:** o **Reino** fica no meio. Em volta, os **5 biomas em fatias** (cada um com ~90.000 m², como um quadrado de 300 × 300), numa **ordem fixa** em que cada um fica ao lado de vizinhos que combinam: **Gelo > Floresta > Deserto > Vulcânico > Arquipélago** (e de volta ao Gelo). Perto do Reino as bordas são quase retas (cada portão cai no meio do seu bioma); longe, ficam **onduladas**. Onde dois se encontram, as cores e o relevo se misturam aos poucos.
- **Relevo:** morrinhos na Floresta, dunas e cânions no Deserto, cadeias de montanhas no Gelo (com neve no alto dos picos), um vulcão com cratera de lava no meio do Vulcânico e as ilhas do Arquipélago. Perto do Reino o chão fica suave (sem paredão de montanha nem mar fundo nos portões).
- **Arquipélago:** a maior parte é **água rasa** (dá para andar, a **65% da velocidade**), com **ilhas** de areia e palmeiras e **canais fundos** cortados em pedaços (não dá para entrar neles, mas sempre tem caminho pela água rasa).
- **Lugares guardados:** a semente já escolheu os lugares das **5 vilas** (passo 3) e das **8 masmorras novas** (passo 4; 2 por bioma, contando o Caminho das Brasas e a Trilha Ancestral). Ali não nasce árvore, rio nem lago, e no Arquipélago cada um ganha uma ilha. Ficam em `LUGARES` (`js/mapa/gerador.js`) e o GM tem um teleporte para cada um (aba Mundo).
- **Água:** rios (rasos: dá para atravessar andando, mais devagar), lagos (o meio é fundo: não dá para entrar), rios e lagos congelados no Gelo (dá para andar em cima) e rios de lava (não dá para entrar).
- **Pontos de interesse:** o vulcão com lava na cratera, o arco de pedra do Deserto, o oásis com palmeiras, o cristal de gelo gigante da Neve, os lugares fixos da Floresta, as entradas das duas dungeons e os 5 portões do Reino. Perto de alguns tem cristal escondido.
- **Chunks:** o mapa é dividido em quadrados de **32 m**. Só os chunks perto de você existem na memória; os novos são criados aos poucos enquanto você anda (no máximo ~3 ms por quadro) e os que ficam longe são apagados.
- **Leve no celular:**
  - todos os objetos de um chunk (árvores, pedras, cactos...) são **juntados numa malha só por material** (a cor de cada peça vai nos vértices): poucos desenhos por quadro;
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

Tudo dá para ajustar lá: a semente, o tamanho do mundo, o tamanho dos chunks, os quadrados do chão por chunk (perto e longe), o tamanho do Reino e do anel tranquilo, a ordem dos biomas, a distância do centro de cada bioma (e quanto cada um ocupa), o quanto as bordas são onduladas, a largura da mistura entre biomas, o nível da água, a largura dos rios, a densidade de objetos de cada bioma, o tempo máximo por quadro criando chunks e os 3 perfis de qualidade.

**Trocar a semente (ou a `versaoMapa`) muda o mapa de todo mundo:** o jogo salvo de quem estava em outro mapa acorda no castelo, com a bandeira na mochila (os monstros, itens e níveis não mudam).

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
Atributos (passo 6): veja "Vida e dano". Os raros são ×1,1 em tudo (e têm papel, como os normais), ficam mais fortes sozinhos nos Nv.12, 30 e 50 (como os normais) e cada forma deles dá +10% / +20% / +30%.

| Raro | Forma inicial (Nv.1) | 1ª evolução (Nv.55) | 2ª evolução (Nv.70) | Evolução rara (Nv.90) |
|---|---|---|---|---|
| Fogo | Vulcarapa | Basaltuga | Crateruga | Colossarapa |
| Água | Aquaraia | Ventaraia | Mantaré | Leviaraia |
| Planta | Espinhal | Cactouriço | Espinhaço | Mandacarão |
Lendários (os chefes das masmorras; fase 7 do `PLANO.md`): a forma de hoje vale do Nv.1 ao 64 e as **3 evoluções são todas com o botão**
(missão + itens + ouro): Nv.65 (missão no Nv.60, inimigos do Nv.50+; 2 Asas, 2 Corações, 4.000 de ouro), Nv.75 (Nv.70, Nv.60+; 4/4/8.000)
e Nv.90 (Nv.85, Nv.80+; 6/6/15.000). Atributos (passo 6): ×1,3 em tudo (a base e o que cresce por nível), com a mesma regra de forma dos raros.

| Lendário | Forma inicial (Nv.1) | 1ª evolução (Nv.65) | 2ª evolução (Nv.75) | 3ª evolução (Nv.90) |
|---|---|---|---|---|
| Ígneo | Ignárion (dragãozinho de 4 patas) | Pirárion (pescoço longo, crista de fogo) | Magmárion (de pé, placas de magma) | Infernárion (asas enormes, anel de espinhos, coração de fogo) |
| Silvestre | Silvárion (filhote de cervo com brotinhos) | Bosquárion (cervo jovem com galhada florida) | Raizárion (colosso de casca, raízes e copa nos chifres) | Ancestrárion (cervo-espírito com uma árvore acesa na galhada) |

Todos os raros e lendários já têm formas novas: no Monstruário cada um tem a sua aba (a aba "Raros" sumiu).

## Vida e dano (atributos, passo 6)

- **Nv.1:** todo monstro começa com **Vida 40, Ataque 10 e Defesa 10** (`ATRIBUTOS_NV1`).
- **A cada nível** ganha um pouco em cada atributo: **+2 no Nv.2**, e o ganho sobe **+0,1 por nível** (Nv.12: +3, Nv.22: +4, Nv.50: +6,8). **Depois do Nv.50 o ganho vale a metade** (Nv.51: +3,45; Nv.100: +5,9). Soma: Nv.10 = +22, Nv.30 = +99, Nv.50 = +216, Nv.100 = +449 (`ganhoDoNivel` e `crescimento`).
- **Forma:** as evoluções multiplicam tudo: ×1,22 (Nv.12), ×1,5 (Nv.30), ×1,85 (evolução rara). Raros e lendários sobem sozinhos nesses níveis e cada forma deles dá +10%/+20%/+30%.
- **Raridade** (`RARIDADE`): tipo duplo ×1,05, raro ×1,1, lendário ×1,3.
- **Papel** (`PAPEIS` e `PAPEIS_DOS_MONSTROS`): cada monstro pode ser de **Ataque** (+20% ataque), **Defesa** (+20% defesa) ou **Vida** (+35% vida e −10% defesa). Os três ficam empatados em força. Escolhidos pelo Lâmina na planilha "Papéis dos Monstros" (também os raros e lendários): **Ataque** = Fogo, Água, Raio, Sol, Lua, Luz, Trevas, Brotobrasa, Vulcarapa, Espinhal e Ignárion (todas as formas); **Defesa** = Terra, Vaporito e Imanito; **Vida** = Planta, Aquaraia e Silvárion. Quem não está na lista fica sem papel. O Monstruário mostra o papel.
- Exemplos (Vida / Ataque): Brasito Nv.1 40/10; Fornalobo Nv.30 208/163; Magmalobo Nv.50 473/417 e Nv.100 905/850; Infernárion Nv.100 1.530/1.436.
- **Dano:** `DANO_GERAL` (0,25) × poder do golpe × Ataque ÷ Defesa × elemento × **a escala do nível do alvo** (`escalaDoNivel`: a vida-base do nível dele ÷ 40). Assim dois monstros do mesmo nível levam o mesmo número de golpes no Nv.1 e no Nv.100, e a diferença de nível pesa pelo Ataque ÷ Defesa. Medido (Investida de Fogo em Água, mesmo nível): 22 golpes no Nv.3, 24 no Nv.15, 31 no Nv.30, 29 no Nv.50 e 30 no Nv.80, quase igual a antes.
- **A vantagem de elemento** continua fixa (×1,5 forte, ×0,6 fraco); não cresce com o nível.
- **Velocidade:** a de cada linha, como antes.
- **Jogo salvo:** os atributos são calculados na hora (o monstro guarda só espécie, nível, experiência e vida). Na 1ª vez com a regra nova, a vida salva vira a mesma porcentagem na vida nova (`estado.versaoAtributos = 2`, `vidaMaxAntiga`).
- **Experiência:** para subir, cada nível pede `12 + 8 × nível`; do **Nv.50 para cima, o dobro** (`XP_DEPOIS_DO_CORTE`). A vitória dá `10 + 7 × nível do inimigo`, com **+20% do Nv.10 ao Nv.45** (sobe aos poucos do Nv.5 ao 10 e some aos poucos até o Nv.55), porque os grupos e o Rei da Dungeon ficaram mais baixos no passo 6.

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

## Golpes da Vulcarapa (raro de Fogo)

A Vulcarapa é a **artilharia**: lenta, quer ficar **longe**, bombardeia com lava em arco e enche o chão de **poças de lava**. A defesa dela é **pular para trás**. No **Modo Vulcão** ela finca no chão e o vulcão das costas atira sozinho, como uma torre. Os números ficam em `js/habilidades/vulcarapa.js`; como funcionam e aparecem, em `js/habilidades/vulcarapa-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Vulcarapa (Nv.1) | **Recuo de Lava**: explosão na frente e pula **4 m para trás** | **Bomba de Lava**: arco de 3 a 11 m, cai onde o alvo estava | **Modo Vulcão**: finca 4 s (não anda) e o vulcão atira sozinho a cada 1,2 s |
| Basaltuga (Nv.55) | Recuo de 5 m | Bomba + queimadura | Modo Vulcão de 5 s + queimadura |
| Crateruga (Nv.70) | **Recuo Explosivo**: deixa uma **poça de lava** onde estava | **Bomba Dupla**: 2 bombas com **poças** | **Cratera Viva**: 6 s, uma bomba a cada 0,9 s, com poças |
| Colossarapa (Nv.90, rara) | **Recuo do Colosso**: 6 m e **atordoa** | **Chuva de Meteoros**: 3 bombas | **Erupção Ancestral**: 8 s, 2 bombas por vez e uma **grande erupção** de 5 m no fim; queimadura dura 50% mais |

- O **Recuo termina o Modo Vulcão** (é a saída de emergência). Fincada, ela pode usar o disparo, mas não anda nem esquiva.
- Cada bomba marca no chão onde vai cair (círculo **vermelho** quando é do inimigo) e passa por cima dos obstáculos.
- A IA usa o Modo Vulcão só com você longe e o Recuo quando você chega perto; ela tenta ficar a uns 7 m.
- Mais detalhes em `js/habilidades/README.md`.

## Golpes do Espinhal (raro de Planta)

O Espinhal é um ouriço-cacto: os espinhos **cravam** (cada um deixa o inimigo mais lento), a bola e as agulhas **ricocheteiam** nas pedras e na borda, e a área solta **agulhas para todos os lados**. Os números ficam em `js/habilidades/espinhal.js`; como funcionam e aparecem, em `js/habilidades/espinhal-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Espinhal (Nv.1) | **Rolamento**: vira bola de espinhos e rola 5 m | **Agulhas**: 3 em leque, 9 m; cada uma crava um espinho | **Explosão de Espinhos**: 8 agulhas para todos os lados |
| Cactouriço (Nv.55) | Rolamento de 6 m | Agulhas + enraizado | 10 agulhas + enraizado |
| Espinhaço (Nv.70) | **Rolamento Ricochete**: quica 1 vez nas pedras e na borda | **Agulhas Ricochete**: 5 que quicam 1 vez | **Explosão Dupla**: 2 ondas de 10 |
| Mandacarão (Nv.90, rara) | **Rolamento Tempestade**: 8 m, quica até 3 vezes, solta 4 agulhas a cada batida | 7 agulhas que quicam 2 vezes | **Floração do Mandacaru**: 3 ondas de 12 agulhas; enraizado dura 50% mais |

- **Espinhado:** cada espinho cravado deixa **6% mais lento** (até 5 = 30%), por 4 s (renova a cada espinho). No Mandacarão, com 5 espinhos o inimigo fica **Enraizado** 1 s e os espinhos caem. Aparece ao lado do nome do inimigo ("Espinhos 3") e embaixo da sua vida quando é você. Chefes e o Campeão ficam lentos só pela metade.
- O **Rei Julius** usa o **Mandacarão** (já no Nv.50 e na revanche no Nv.100).
- Mais detalhes em `js/habilidades/README.md`.

## Golpes do Ignárion (lendário Ígneo)

O Ignárion tem o **Calor Ígneo**: cada golpe que acerta enche 8% da barra (e cada dano que leva, 4%). Cheia, ele entra em **Ignição** sozinho e bate mais forte. Os números ficam em `js/habilidades/ignarion.js`; como funcionam e aparecem, em `js/habilidades/ignarion-batalha.js`.

| Forma | Perto | Disparo | Área | Ignição |
|---|---|---|---|---|
| Ignárion (Nv.1) | **Mordida de Magma** | **Cometa Ígneo**: 3 cometas que explodem | **Cataclismo**: 6 m em volta | 5 s, +20% |
| Pirárion (Nv.65) | **Mordida e Arremesso**: joga o alvo 5 m por cima da cabeça, para trás (bateu numa pedra: +50% e atordoa) | 4 cometas | Cataclismo + **5 Fissuras Ígneas** que correm pelo chão | 6 s, +25% |
| Magmárion (Nv.75) | Arremesso de 7 m e o alvo **explode** onde cai | 5 cometas | 7 fissuras | 7 s, +25%, **aura** que queima perto |
| Infernárion (Nv.90) | **Fauces do Inferno**: 8 m, explosão de 3 m e Combustão garantida | **Cometa Supremo**: 5 + 1 gigante | **Apocalipse Ígneo**: 8 fissuras que deixam fogo no chão | 8 s, +30%, aura e **explosão** no fim |

- Todos os golpes podem causar **Combustão** (já na forma inicial, como o chefe de sempre).
- O chefe do Trono de Magma (forma inicial) usa tudo isso, inclusive o Calor.
- Chefes e o Campeão são arremessados só pela metade da distância.
- Mais detalhes em `js/habilidades/README.md`.

## Golpes do Silvárion (lendário Silvestre)

O Silvárion tem a **Seiva Vital**: cada vez que a Parasita ou o Elo Vital suga vida, a barra enche. O golpe de **área gasta toda a Seiva**: a cada 25%, cura 3% da vida (só na batalha) e solta **mais 1 cervo-espírito**. Os números ficam em `js/habilidades/silvarion.js`; como funcionam e aparecem, em `js/habilidades/silvarion-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Silvárion (Nv.1) | **Galhada Ancestral** | **Semente Parasita**: 3 sementes | **Selva Viva**: 6 m, deixa lento (gasta a Seiva para curar) |
| Bosquárion (Nv.65) | **Investida da Galhada**: corre 6 m levando o inimigo enganchado; onde para, **brota uma árvore** que enraíza 1 s (bateu numa pedra: +50%) | **Semente + Elo Vital**: a semente que acerta prende um **cipó** que suga vida por 3 s | **Manada Espiritual**: 3 cervos-espírito em leque |
| Raizárion (Nv.75) | Investida de 7 m (enraíza 1,5 s) | 4 sementes; Elo em até 2 inimigos | 5 cervos |
| Ancestrárion (Nv.90) | **Investida Ancestral**: 8 m e a árvore **explode em flores** | **Floração Parasita**: 5 sementes; os Elos sugam o dobro | **Despertar da Floresta**: 7 cervos + a Selva Viva em volta |

- Todos os golpes podem causar **Parasita** (já na forma inicial).
- O chefe do Santuário da Árvore-Mãe (forma inicial) usa tudo isso, inclusive a Seiva.
- O cipó arrebenta se os dois ficarem a mais de 11 m. No treino a Seiva não cura.
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
- O Espinhal e o Brotobrasa têm golpes próprios; o Silvárion continua com os golpes de sempre.

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
| **Dungeons** | Para as **masmorras novas** (uma caixa para cada): entrar no começo, em cada etapa ou no trono, ir para a porta no mapa, **abrir todos os portões**, Nível da Masmorra, o chefe volta já e sortear outro chefe. Para o Caminho das Brasas e a Trilha Ancestral: **ir para** a entrada, cada etapa ou o chefe; **lutar contra o acampamento** de cada etapa (na ordem 2 fracos → 2 médios → 1 forte → líder, no nível que a sua equipe enfrentaria); **Nível da Masmorra** (1, 3, 5, 9 ou 10); **lutar com o chefe de agora** no nível escolhido; **o chefe volta já** (sem esperar o amanhecer); **sortear outro chefe**; **chamar o lendário**; **monstro da dungeon perto**. |
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
| `js/vilas.js` | As 5 vilas: cerca, praça, loja, casas, arena com plateia e plataformas, os treinadores das vilas (`TREINADORES_VILA`, o Lâmina vai fazer) e o ouro de cada vila |
| `js/reino.js` | O Reino: castelo, praça e fonte, vila e loja, arena fechada com plateia e os 5 treinadores, muralha com os 5 portões, a estrada em anel e as lanternas dos 5 caminhos (tudo junto em poucas malhas) |
| `js/mapa/config.js` | Configurações do mapa procedural e os perfis de qualidade |
| `js/mapa/gerador.js` | O gerador do mapa (só matemática): ruído com semente, biomas, altura do chão, rios, lagos, pontos de interesse, lugares da Floresta, direção das dungeons, os 5 caminhos do Reino e os lugares guardados (vilas e masmorras) e a Estrada Real |
| `js/mapa/altura.js` | `alturaEm(x, z)`: a altura do chão igual aos triângulos desenhados (com as dungeons, a borda e as masmorras novas), e onde não dá para andar (lago fundo e lava) |
| `js/biomas/lugares.js` | Onde ficam as peças únicas das melhorias dos biomas (Gelo: acampamento, trilha, lago, arco, fonte termal, floresta). Só matemática |
| `js/biomas/comum.js` | As formas e ferramentas das melhorias dos biomas: o `Forno` (junta peças numa malha só), o brilho falso e as peças que ficam transparentes na frente da câmera |
| `js/biomas/floresta.js` | A Floresta (Mata de Véu-Âmbar): as peças e a Catedral das Cortinas, as Pontes de Raiz e o Pântano das Lanternas Azuis |
| `js/biomas/deserto.js` | O Deserto (Areias de Djeser-Ra): o caminho até as pirâmides, o oásis, a caravana, a areia voando, a Khamsin e as peças comuns |
| `js/biomas/vulcao.js` | O Vulcânico (Caldeira de Ignis-Vael): a Forja Primordial, o Monte Vael, a Bacia do Vitriol, as cinzas, a Chuva de Cinzas e as peças comuns |
| `js/biomas/arquipelago.js` | O Arquipélago (Marés de Safira): a Enseada dos Bangalôs, a Ilha da Cachoeira, o arco, o farol, o naufrágio, o atol, os veleiros, o plâncton, a chuva com arco-íris e as peças comuns |
| `js/biomas/clima.js` | A cor do céu, da névoa e da luz de cada bioma |
| `js/dungeons/dungeons.js` | As dungeons (passo 5): as entradas no mapa, o cristal flutuante, descobrir, entrar, os grupos, o portão do Rei, o Rei, o reset de 2 horas e o jogo salvo (`estado.dungeons`) |
| `js/dungeons/lista.js` | Os números das dungeons (vagas, reset, prêmio) e as variações de cada bioma |
| `js/dungeons/lugares.js` | Os 6 lugares possíveis das dungeons em cada bioma. Só matemática, guardada no aparelho |
| `js/dungeons/pecas.js` | As peças que as dungeons repetem (água, feixe de luz, brilho falso, samambaia, flor, cipó, coluna, arco, casco de navio, corrente) |
| `js/dungeons/arq-*.js` | As 6 dungeons do Arquipélago (arcos, farol, galeões, santuário, caldeira, mangue) |
| `js/dungeons/vulcao.js`, `deserto.js`, `floresta.js`, `gelo.js` | As 6 dungeons de cada um dos outros biomas (feitas com o molde `fazerPlano` do `pecas.js`) |
| `js/biomas/gelo.js` | As peças únicas do Gelo (`BiomaGelo`), o brilho falso, a neve caindo e o pinheiro nevado |
| `js/mapa/chunks.js` | Os chunks: cria o chão, a água, a lava e os objetos de cada pedaço do mapa, carrega e apaga conforme você anda, e o LOD |
| `js/mapa/grade.js` | Grade de obstáculos: guarda as árvores, pedras e peças em quadradinhos de 8 m, para a colisão só olhar o que está perto |
| `js/batalha.js` | Batalha em tempo real: movimento, golpes, efeitos, IA do inimigo e captura |
| `js/dungeon.js` | Base das dungeons abertas: a forma do corredor (`Tracado`) e a do Reino (`REINO`), portões transparentes, acampamentos, monstros soltos, chefe e clima. Também o `Lote` e o `Bloco`, que juntam peças para ficar leve no celular |
| `js/masmorras/` | As **masmorras novas** (áreas separadas): `forma.js` (a forma, só matemática), `masmorra.js` (a base e as entradas no mapa), `pecas.js` (peças repetidas) e um arquivo por masmorra com o desenho dela (`gruta-trovao.js`, `torre-nevasca.js`, `mina-abandonada.js`, `tumba-areias.js`, `pantano-sombrio.js`, `forja-antiga.js`, `templo-submerso.js`, `gruta-mares.js`) |
| `js/brasas.js` | Cenário do Caminho das Brasas (braseiros, forja, rio de lava, Trono de Magma, vulcão) |
| `js/raizes.js` | Cenário da Trilha Ancestral e da Floresta (cogumelos, ruínas, lago, raízes, Árvore-Mãe, vaga-lumes, monstros extras) |
| `js/arena.js` | Arenas: chão, obstáculos, clima animado e perigos de cada região (com chance), e o escurecer do Astro Negro |
| `js/habilidades/` | **Habilidades próprias das linhas de monstros** (uma pasta só para isso). Veja o `README.md` de lá. Hoje: linha do Brasito (`brasito.js` com os números, `brasito-batalha.js` com o lança-chamas, o rabo de fogo e a velocidade), linha do Gotinho (`gotinho.js` e `gotinho-batalha.js`, com o jato, o hidrocanhão, as ondas, o maremoto e o escudo), linha do Musguinho (`musguinho.js` e `musguinho-batalha.js`, com a folha bumerangue, a vinha que puxa, as raízes, a moita e o bosque), linha do Pedrisco (`pedrisco.js` e `pedrisco-batalha.js`, com a pedra em arco que quica, o punho sísmico, o tremor e os pilares), linha do Faisquinho (`faisquinho.js` e `faisquinho-batalha.js`, com as marcas, o dash elétrico, o tiro que marca, o choque e as nuvens), linha do Solito (`solito.js` e `solito-batalha.js`, com o sol que dá bônus, o laser e o calor), linha do Lunico (`lunico.js` e `lunico-batalha.js`, com o combo de dashes, as fases da lua e o luar que cura), linha do Lumino (`lumino.js` e `lumino-batalha.js`, com o passo de luz, o estilhaço que se divide e a redoma que devolve os tiros), linha do Imanito, tipo duplo Terra + Raio (`imanito.js` e `imanito-batalha.js`, as pedras orbitais, o ímã e a repulsão), linha do Brotobrasa, tipo duplo Fogo + Planta (`brotobrasa.js` e `brotobrasa-batalha.js`, as flores de fogo que explodem), linha do Vaporito, tipo duplo Água + Fogo (`vaporito.js` e `vaporito-batalha.js`, o tanque: arrancada, bafo de vapor e casco), a Aquaraia, raro de Água (`aquaraia.js` e `aquaraia-batalha.js`, o rasante que atravessa, as bolhas guiadas, o mergulho, o rastro e o redemoinho), a Vulcarapa, raro de Fogo (`vulcarapa.js` e `vulcarapa-batalha.js`, a artilharia: o recuo, as bombas de lava em arco, o Modo Vulcão e as poças de lava), o Espinhal, raro de Planta (`espinhal.js` e `espinhal-batalha.js`, o rolamento que quica, as agulhas que cravam e a explosão de espinhos), o Ignárion, lendário Ígneo (`ignarion.js` e `ignarion-batalha.js`, o Calor e a Ignição, o arremesso, os cometas e as fissuras), o Silvárion, lendário Silvestre (`silvarion.js` e `silvarion-batalha.js`, a Seiva Vital, a investida, o Elo Vital e os cervos-espírito) e a linha do Breuzinho (`trevas.js` e `trevas-batalha.js`, com a mordida, a bola com olhos de alcance curto e a área que escurece e dá bônus de dano) |
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
