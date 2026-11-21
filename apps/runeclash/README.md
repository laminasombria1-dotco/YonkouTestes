# Runeclash: Sealstone Legends

Jogo 3D low poly de caçar, **selar**, evoluir e batalhar com monstros. Os monstros começam fofos e ficam trevosos nas últimas evoluções.
Roda no navegador (celular ou PC), feito com JavaScript + [Three.js](https://threejs.org).

**De onde veio:** é a junção de dois jogos do Lâmina:
- o **Cristalia** (`apps/cristalia/`, feito na nuvem): toda a base (mapa, monstros, batalha, contas, salvamento);
- a **Arena das Brasas** (protótipo no PC, fora do repositório): o Invocador que **sela** e **invoca**, os efeitos, as peças do Blender e os chefes, que vão virar os primeiros **lendários**.

Só os **monstros** lutam; o Invocador não luta. O plano, etapa por etapa, fica em **[PLANO.md](PLANO.md)**.

> **Hoje (ideia 3.1, começando pelo Brasito)** o Runeclash joga como o Cristalia, com o nome novo, o jogo salvo separado e o visual próprio: roxo-runa e dourado, fonte Cinzel nos títulos, o **Sealfolio** (o antigo Monstruário), as **pedras de selamento** (azul, roxa e dourada) no lugar dos cristais, o **Invocador** (o Aiden, com o criador de personagem) no mapa o **Selamento** com correntes na batalha e o monstro que **sobe de um círculo de runas** quando é invocado. Os golpes das linhas do Brasito, do Faisquinho, do Pedrisco e do Gotinho já usam os efeitos da Arena (fogo, relâmpagos, pedras e água). As regras da batalha e da chance de selar ainda são as do Cristalia.

## Como jogar

- **Só deitado:** o jogo é feito para o celular deitado. Com o celular em pé, aparece **"Vire o celular"** e tudo pausa (mapa, batalha, monstro invocado) até você virar. No PC, uma janela estreita não é bloqueada. O app Android (versão 1.2 em diante) e o app instalado pelo Chrome já abrem sempre deitados.
- **Login (toda vez que o jogo abre):** digite o **nome de usuário** e a **senha** e toque em **Entrar** (ou **Criar conta**, se o nome é novo). Embaixo aparecem as contas que já entraram neste aparelho: **1 toque** entra, sem digitar a senha. Veja "Contas e nuvem" abaixo.
- **O Invocador:** é você no mapa. No **Novo jogo**, primeiro aparece **Crie seu Invocador** (pele, cabelo, olhos, penteado, roupa, detalhes, capa, ombreiras e altura, com cores em bolinhas prontas; **Aiden** volta para a aparência padrão e **Sortear** sorteia uma). Depois dá para mudar pelo menu de pausa, em **Aparência**. Ele segura a pedra de selamento na mão esquerda e a ergue ao invocar ou guardar o monstro. Na batalha ele não aparece (só os monstros lutam): ao selar, só a pedra aparece. A cena dele erguendo a pedra é a ideia 2.3.
- **Tela de início:** mostra "Olá, nome" e onde o jogo está salvo (☁ na nuvem ou ⚠ só no celular). Tem **Continuar** (mostra o seu parceiro, o nível e quantos monstros você tem), **Novo jogo** (se já existe um jogo salvo, pede um 2º toque para confirmar), **Sealfolio**, **Instalar app** (só aparece quando dá para instalar), **Trocar conta** e **Sair do jogo**.
- **Menu de pausa:** o botão de menu (três risquinhos) no mapa, **Esc** no PC ou o botão **Voltar** do celular. Tem **Continuar jogando**, **Qualidade** (Fraco, Médio ou Forte: veja "Mapa procedural"), **Voltar ao início** e **Sair do jogo**. Tudo salva antes.
- **Sair do jogo:** no app Android, fecha o app. No navegador, a página não pode se fechar sozinha: o jogo salva e avisa que já pode fechar a aba.
- **Botão Voltar do celular (app Android):** fecha o que estiver aberto (painel, Sealfolio, painel GM), abre o menu de pausa no mapa e fecha o app na tela de início e no login. Na batalha não faz nada (use Fugir).
- **Começar:** em "Novo jogo", escolha um dos 9 monstros iniciais (um de cada elemento). A tela mostra a linha evolutiva inteira dele.
- **Sealfolio (Álbum de criaturas seladas, o antigo Monstruário):** na tela inicial ou no botão **Monstros** durante o jogo. Mostra todas as linhas, as evoluções, os atributos, os golpes e as vantagens de cada um.
- **Andar:** arraste o dedo no **lado esquerdo** da tela (joystick virtual). No PC: WASD ou setas. O andar segue a câmera: "para cima" anda para onde a câmera está olhando.
- **Câmera (terceira pessoa):** fica um pouco afastada do personagem (no mapa e na batalha). arraste o **controle de câmera** (círculo com setinhas, do lado direito, acima da casa ou das habilidades) ou qualquer parte livre do **lado direito** da tela. Para os lados gira em volta do personagem; para cima e para baixo muda a altura. **Dois toques rápidos** no controle colocam a câmera de volta atrás do personagem. Funciona no mapa e na batalha.
- **Câmera no PC:** arraste com o mouse para girar e use a **rodinha** para aproximar ou afastar.
- **Encontrar monstros:** encoste num monstro selvagem para começar a batalha.
- **Batalha em tempo real:**
  - 3 golpes: **perto** (avança e bate), **disparo** (tiro em linha reta) e **área** (explosão em volta).
  - **Tela enxuta:** o nome e a vida de cada inimigo ficam em cima dele. Os botões do canto são ícones: **pedra de selamento** (com a quantidade), **setinha** para escolher outra pedra (mostra a chance de cada uma), **setas** para trocar de monstro, **porta** para fugir e **tela cheia**.
  - Os avisos da batalha ficam pequenos, no alto, e somem rápido.
  - O inimigo avisa antes de atacar: uma **faixa ou círculo vermelho no chão**. Saia dele ou use a esquiva.
  - No PC: J, K e L para os golpes. A esquiva não tem mais botão na tela, mas ainda funciona com Espaço.
- **Monstro invocado:** veja "Monstro invocado (companheiro)" abaixo.
- **Selar (o Selamento):** enfraqueça o monstro e toque no botão da pedra (tecla C). O número ao lado é a chance de selar. A **setinha** ao lado da pedra abre a lista para escolher a Azul, a Roxa ou a Dourada (no PC, a tecla V passa para a próxima). Formas evoluídas são bem mais difíceis de selar.
  - Com **35% de vida ou menos**, a placa do monstro mostra **PODE SER SELADO** e o botão da pedra pisca (dá para tentar antes, com chance baixa).
  - O Selamento (`js/selamento.js`, com os efeitos da Arena): a **pedra aparece flutuando ao lado do seu monstro** → **correntes** saem dela e prendem o monstro (runas no chão, anéis se apertando, partículas em espiral), na cor da pedra → o monstro se debate em **pulsos** (3 quando vai dar certo, 1 a 3 quando vai falhar) → **selou:** implosão, coluna de luz e a essência voa até a pedra; **falhou:** as correntes se partem e o círculo fica vermelho. Enquanto sela, ninguém age.
  - **Invocar com runas** (`js/invocacao.js`): quando a luta começa e quando você troca, o seu monstro sobe de um círculo de runas (roxo por fora, na cor do elemento por dentro) com uma coluna de luz; o que sai na troca vira luz.
- **Evoluir:** cada linha tem 4 formas. A forma inicial evolui no **nível 6**, a 1ª evolução no **nível 12** e a 2ª evolução no **nível 30**. Quando seu monstro chega ao nível, aparece a animação de evolução e ele ganha atributos e golpes mais fortes.
- **Dia e noite:** um ciclo completo dura 4 minutos (2 de dia e 2 de noite). **Sol e Luz** só aparecem de dia; **Lua e Trevas**, só à noite. O relógio fica no canto superior direito.
- **Equipe:** até 3 monstros. Com a equipe cheia, o selado vai para a reserva.
- **Reserva:** no painel Equipe, a aba **Reserva** mostra **todos** os monstros que você tem (os da equipe aparecem marcados). Perder uma batalha nunca apaga monstros: a equipe só é curada e volta para casa.
- **Proteção:** o jogo guarda uma cópia de cada monstro que você já teve. Se algum sumir da equipe e da reserva por qualquer motivo, ele volta sozinho para a Reserva, com um aviso.
- **Fonte de cura:** a fonte no centro do mapa cura todos os seus monstros.
- **Nível dos selvagens:** acompanha o nível da sua equipe e aumenta quanto mais longe do centro você vai. Nas bordas aparecem as formas evoluídas.
- **Monstros perto de você:** os selvagens e os grupos aparecem em volta do jogador (até ~90 m) e somem quando ficam longe; assim o mapa grande não fica mais pesado.
- O progresso é salvo sozinho: no celular a cada 5 s e na nuvem (veja abaixo).
- **Tela cheia:** botão na tela inicial, no mapa e na batalha. Alguns navegadores não deixam (o iPhone, por exemplo); nesse caso, use "Adicionar à tela inicial".

## Contas e nuvem (Firebase)

- **Mesmas contas do Cristalia, jogo salvo separado.** O Runeclash usa o mesmo projeto do Firebase (`cristalia-91fd6`): quem tem conta no Cristalia entra com o mesmo nome e senha. Mas o jogo salvo do Runeclash fica numa "gaveta" própria (`runeclash_jogadores/<uid>`), então um jogo nunca apaga o do outro.
- **Cada conta tem o seu jogo salvo.** A conta fica na **nuvem**: entre com o mesmo nome e senha em qualquer celular.
- **Nome:** de 2 a 16 letras, números, espaço, - ou _. Acento e maiúscula não mudam a conta ("Lâmina" e "lamina" são a mesma). Cada nome tem um dono só.
- **Senha:** pelo menos 6 letras ou números (é o mínimo do Firebase).
- **Como o nome vira conta:** o jogo transforma o nome num "e-mail de mentira" (`lamina@cristalia.jogo`). Por isso **não existe "esqueci a senha"**: perdeu a senha, perdeu a conta.
- **Quando salva na nuvem:** a cada 30 s enquanto você joga, no fim de cada batalha, ao voltar para o início, ao trocar de conta, ao sair e quando o app é minimizado. No celular continua salvando a cada 5 s.
- **Ao entrar:** o jogo compara a cópia da nuvem com a do celular e **fica com a mais recente**. Jogando em 2 celulares, vale o que salvou por último.
- **Sem internet:** o 1 toque numa conta que já entrou no aparelho funciona com a cópia do celular, e o jogo sobe para a nuvem quando a internet voltar ("⚠ sem internet" na tela de início). Entrar com senha precisa de internet; se não der, aparece **Jogar só neste aparelho (sem nuvem)**, que cria uma conta que não vai para a nuvem.
- **O jogo salvo de antes das contas** vai sozinho para a 1ª conta que entrar (aparece um aviso). A cópia antiga continua guardada no aparelho, por segurança.
- **Conta GM:** nome **GM** e a senha do GM. Ela fica **só no aparelho** (não vai para a nuvem), não aparece na lista de 1 toque e abre o painel GM. O nome GM é reservado: ninguém cria uma conta na nuvem com ele.
- **Segurança:** a `apiKey` que está no código não é secreta (ela só diz qual projeto usar). Quem protege os dados são as **regras do Firestore**: cada jogador só lê e grava `runeclash_jogadores/<o próprio uid>` (e `jogadores/<o próprio uid>` no Cristalia). A senha do GM não fica no código, só a "impressão digital" dela (SHA-256). Mesmo assim, uma senha de 4 números dá para descobrir testando todas.
- **No aparelho** (localStorage): `runeclash-contas` (contas que já entraram, para o 1 toque), `runeclash-save-v1:<id da conta>` (o jogo de cada conta) e `runeclash-qualidade`. São nomes diferentes dos do Cristalia de propósito: quando os dois estiverem no mesmo site, um não mexe no outro.
- O ajudante do app (`sw.js`) **nunca guarda** as conversas com o Firebase: elas vão sempre direto para a internet.
- **Regras do Firestore** (no console do Firebase, Firestore → Regras). A parte `runeclash_jogadores` é **nova**: até ela ser colocada lá, o Runeclash entra na conta normalmente, mas o jogo salvo fica só no aparelho (a nuvem recusa a gravação). A parte `jogadores` é a do Cristalia e não muda:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /jogadores/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      match /runeclash_jogadores/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
  ```

## Instalar no celular (ainda não publicado)

O Runeclash **ainda não tem site**: por enquanto ele roda só no computador (veja "Rodar no computador", no fim).

- **Por que ainda não:** o GitHub dá **um site só por repositório**, e esse site hoje é o do Cristalia (é ele que o app Android do Cristalia abre). Publicar o Runeclash com um workflow próprio **trocaria** o site do Cristalia. Isso fica para a etapa 6 do [PLANO.md](PLANO.md): uma publicação só, com o Cristalia no endereço de sempre e o Runeclash em `/runeclash/`.
- Quando estiver publicado, ele vai ser um **PWA** (aplicativo web instalável) como o Cristalia: abrir no Chrome do Android e tocar em **Instalar app**.

**Arquivos do app:** `manifest.webmanifest` (nome, ícone, cores do app e `"orientation": "landscape"`: o app instalado abre sempre deitado), `sw.js` (o "ajudante" que guarda o jogo e busca as atualizações) e `icones/` (a pedra de selamento em 192, 512, 512 "máscara" do Android e 180 para iPhone).

## Monstro invocado (companheiro)

- **Invocar:** o botão com a patinha, ao lado de "Montar casa", invoca o **1º monstro da equipe** (o mesmo que entra primeiro na batalha). Para trocar qual vem, use "Pôr na frente" no painel Equipe. O botão vira **Guardar**. No PC: tecla **R**. Ele sobe de um círculo de runas ao ser invocado e, ao guardar, vira luz e volta para a pedra na mão do Invocador (os efeitos só rodam esse pouquinho e depois desligam).
- **Seguir:** ele anda uns 2 m atrás do treinador, com as animações de parado e correndo, desviando de árvores e pedras. Se ficar a mais de 15 m (teleporte, fim de batalha), aparece do lado do treinador.
- **Controlar** (tecla **T**): o joystick e a câmera passam para o monstro e o **treinador fica parado e protegido**: nenhum selvagem vem atrás dele nem começa batalha.
  - Aparecem os **3 golpes**, iguais aos da batalha e com a mesma recarga. Eles saem para a frente do monstro, **no ar**: não precisam de inimigo e **não machucam** ninguém (é só para mostrar). Espaço faz a esquiva.
  - O monstro tem uma **coleira de 20 m** em volta do treinador.
  - **Voltar ao treinador** (botão no alto, tecla T, Esc ou o botão Voltar do celular) devolve o controle.
- **Golpes que precisam de alvo:** no ar, o disparo do Faisquinho nunca vira **Choque** (só vira se o tiro acertar alguém), a vinha do Musguinho estica mas não puxa nada e o Pedregulho cai a 7 m à frente.
- **Batalha:** se o treinador encostar num selvagem, o companheiro some e a batalha começa normal; depois ele volta a seguir.
- Se o monstro desmaiar, ele volta sozinho para a pedra. Se a equipe mudar (outro na frente ou evolução), o companheiro troca sozinho.
- Fica salvo se ele estava invocado (`estado.pet`).
- **Código:** `js/companheiro.js` (seguir, botões, trocar o controle) e `js/treino.js` (o modo treino). O modo treino usa o **mesmo motor da batalha**: os golpes de todas as linhas funcionam igual, sem inimigos e sem dano. Tudo do treino fica numa "camada" centrada no treinador, como uma arena invisível de 22 m, que sobe e desce acompanhando o chão embaixo do monstro. Os obstáculos do mapa seguram o monstro e os tiros.
- **Limite:** o mapa tem morros e a arena de batalha é plana. Num golpe longo num morro, uma parte do efeito pode entrar no chão ou flutuar um pouco.

## Casa (base portátil)

- Você começa com a casa **na mochila**. O botão no canto inferior direito muda conforme a situação:
  - **Montar casa:** monta na sua frente. Se ali estiver ocupado, o jogo procura o lugar livre mais próximo.
  - **Guardar casa:** aparece quando você está perto dela; a casa volta para a mochila.
  - **Mudar casa p/ cá:** aparece quando você está longe; a casa sai de onde estava e é montada onde você está.
- **Encostar na casa cura todos os monstros**, inclusive os desmaiados, da equipe e da reserva.
- Em volta da casa (10 m) é **área segura**: monstros não aparecem e dão meia-volta.
- Se toda a equipe desmaiar, você **acorda na casa** (ou na fonte, se a casa estiver guardada).
- A posição da casa fica salva. A casa não pode ser montada na água nem na lava.
- Se o mapa mudar (o jogo salvo é do mapa antigo ou de outra semente), a casa volta para a mochila e você acorda na fonte.

## Grupos de monstros

- Pelo mapa andam **grupos de 6 monstros**: 5 comuns e 1 **líder**, que é maior e usa coroa dourada.
- **Níveis:** acompanham a sua equipe. Comuns ficam em ~1,1× o seu nível médio + 2; o líder em ~1,4× + 8. No começo do jogo (equipe Nv.3), os comuns ficam no Nv.5 e o líder no Nv.12.
- **Quantidade:** 1 grupo no começo e mais 1 a cada 5 níveis da equipe, até **4 grupos**.
- **Cada monstro do grupo se move sozinho:** tem posição, direção, ritmo e animação próprios (uns andam enquanto outros param). Não ficam em fileira: ficam soltos numa área de ~11 m em volta do ponto do grupo.
- **Duplas soltas:** cada um fica a **~2 m do parceiro** (entre 1,5 e 3,5 m) e a **pelo menos 5 m das outras duplas** (medidos entre os corpos). As duplas são: 1ª e 2ª dupla (as que lutam primeiro) e o 5º monstro junto do líder.
- **Perseguição:** quando você chega a ~10 m de **qualquer** monstro do grupo (7 m nos acampamentos), todos vêm atrás de você, cada um na sua velocidade.
- **Espaço entre grupos:** um grupo novo só aparece a pelo menos **40 m** dos outros, e grupos que se aproximam a menos de **32 m** se afastam.
- **Na batalha:**
  - lutam em **ondas de no máximo 2**: a próxima onda só entra quando **os dois** da onda atual caírem (ou forem selados);
  - nos grupos do mapa, os comuns vêm de 2 em 2 e o **líder entra por último, sozinho**;
  - nos **acampamentos das dungeons**, a ordem é por força: **2 fracos → 2 médios → 1 forte → o líder**;
  - seus golpes miram no inimigo mais perto (com um anel branco embaixo dele) e a área acerta todos dentro dela;
  - dá para selar qualquer um no meio da luta, e a batalha continua com os outros.
- **Recompensa:** experiência de todos os vencidos (60% de cada), **2 Pedras Azuis + 1 Pedra Roxa garantidas pelo líder** e chance de pedra pelos outros.
- Se você fugir ou perder, os que sobraram continuam andando no mapa.

## Monstros de tipo duplo

- São mais raros: **a cada 10 monstros que aparecem no mapa, 1 é de tipo duplo**. Eles têm um anel de duas cores em volta e aparecem na região de um dos seus elementos.
- Quando um aparece, chega um aviso dizendo qual e onde.
- Também evoluem no Nv.6, 12 e 30 e ganham as mesmas melhorias. A partir da 2ª evolução, o **disparo também causa o efeito** do elemento dele, então eles causam dois efeitos diferentes.
- **Golpes:** perto e área são do 1º elemento; o disparo é do 2º.
- **Na defesa:** o golpe é comparado com os dois elementos e os multiplicadores se somam. Um monstro nunca é fraco contra o próprio elemento.
- **Mais difíceis de selar:** formas inicial e 1ª evolução só com a **Pedra Roxa** (ou melhor); 2ª evolução e forma final só com a **Pedra Dourada**.
- Valem 50% a mais de experiência e, ao serem vencidos, deixam 1 Pedra Roxa.

| Tipo | Nv.1 | Nv.6 | Nv.12 | Nv.30 | Onde aparece |
|---|---|---|---|---|---|
| Fogo + Planta | Brotobrasa | Chamafolha | Ardentroco | Florinferno | Floresta, Vulcão, Campo |
| Água + Fogo | Vaporito | Fumarolo | Gêiserão | Caldeirax | Lago, Vulcão, Campo |
| Terra + Raio | Imanito | Magnetito | Ferrovolt | Titanvolt | Deserto, Picos Nevados, Campo |

## Pedras de selamento

São os antigos "cristais de captura" do Cristalia. No código e no jogo salvo elas ainda se chamam `CRISTAIS` e `comum`, `forte` e `supremo` (assim os jogos salvos continuam valendo).
O desenho 3D de agora é provisório (uma pedra de 6 lados com um anel de runa); o modelo do Blender vem na ideia 2.3.

| Pedra | No código | Chance | Como conseguir |
|---|---|---|---|
| Pedra Azul | `comum` | 1× | Brilhos azuis no mapa, vitórias |
| Pedra Roxa | `forte` | 1,5× | Brilhos roxos no mapa (raros), líder de grupo (+1), vencer um tipo duplo (+1), fundir 3 azuis |
| Pedra Dourada | `supremo` | 2,2× | Brilhos dourados (muito raros), tipos duplos evoluídos (às vezes), fundir 3 roxas |

- **Fundir:** no painel **Equipe**, perto da sua casa, 3 pedras da mesma cor viram 1 da cor acima.
- Na batalha, o jogo escolhe sozinho a pedra mais fraca que funciona no alvo; a **setinha** troca na mão.
- As pedras do chão reaparecem 1 minuto depois, com a cor sorteada de novo.
- São cerca de 40 espalhados pelo mapa, mais os **lugares secretos**: embaixo do arco de pedra do Deserto e na margem do oásis (Roxa), ao lado do cristal de gelo gigante da Neve (Dourada) e no píer do lago escondido da Floresta (Roxa).

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
- Não dá para montar a casa lá dentro (calor demais). Monte antes da entrada.
- Quanto mais fundo, mais escuro fica o céu, com cinzas caindo e brasas subindo.

### Chefe: Ignárion (super raro)

- Fica no **Trono de Magma**, no fim do caminho, aos pés de um vulcão gigante.
- Tipo **Ígneo**, um elemento novo: um fogo mais forte, que é super efetivo contra Planta, Terra e até Fogo. Só a **Água** é forte contra ele.
- Efeito do Ígneo: **Combustão**, que tira 6% da vida por segundo e impede cura.
- Nível: 1,4× o nível da equipe + 22 (Nv.26 com equipe Nv.3).
- Com menos da metade da vida, entra em **fúria** e ataca bem mais rápido.
- Só é selado com a **Pedra Dourada**, e a chance é bem baixa.
- Vencido ou selado, deixa 3 Pedras Roxas e 2 Douradas, e vale o dobro de experiência. Ele volta no próximo amanhecer.

## Trilha Ancestral (dungeon aberta da Floresta)

Sai da borda do mapa pela Floresta, seguindo as lanternas de flor (a direção depende da semente do mapa). Funciona igual ao Caminho das Brasas (as duas usam a mesma base em `js/dungeon.js`).

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
- Só é selado com a **Pedra Dourada**. Vencido ou selado, deixa 3 Pedras Roxas e 2 Douradas e volta no próximo amanhecer.

## Floresta (região de Planta)

- Os lugares fixos da Floresta (árvores gigantes, ruína, clareiras e lago escondido) ficam em volta do centro dela, no mesmo desenho de antes (só girado para o lado da Trilha Ancestral).
- Tem **5 árvores gigantes**, uma **ruína com arco e colunas**, cogumelos gigantes, troncos caídos, pedras com musgo, samambaias e muitas flores que brilham.
- **Lago escondido**, cercado de árvores gigantes, com um píer de madeira. No começo do píer tem uma **pedra escondida** (começa como Pedra Roxa).
- **2 clareiras** com anel de cogumelos: cada uma tem um grupo (5 + líder) que volta 2 minutos depois de vencido.
- Enquanto você está na Floresta, aparecem **até 6 monstros a mais**, com nível um pouco maior (mais formas evoluídas).
- À noite, **vaga-lumes** voam pela Floresta.

## Regiões

| Região | Bioma | Quem aparece |
|---|---|---|
| Campo | No centro (com a fonte) | Um pouco de tudo; Sol e Luz de dia, Lua e Trevas à noite |
| Floresta | Floresta: árvores, pinheiros, clareiras e morrinhos | Planta (Musguinho), Espinhal (raro); Luz de dia, Trevas à noite. Daqui sai a Trilha Ancestral |
| Lago | Em volta dos lagos (no Campo, na Floresta e o oásis do Deserto) | Água (Gotinho), Aquaraia (raro); Lua à noite |
| Vulcão | Lava: chão vulcânico, vulcão com cratera, rios de lava | Fogo (Brasito), Vulcarapa (raro). Daqui sai o Caminho das Brasas |
| Deserto | Deserto: dunas, cânions, cactos, arco de pedra e oásis | Terra (Pedrisco) |
| Picos Nevados | Neve: montanhas, pinheiros nevados, rochas congeladas, lagos congelados e o cristal de gelo gigante | Raio (Faisquinho), com relâmpagos |

Os monstros de cada região são os mesmos de antes: o Deserto ocupa o lugar da Pedreira (Terra) e os Picos Nevados, o do Planalto da Tempestade (Raio). Onde fica cada bioma depende da semente do mapa (veja abaixo).

## Mapa procedural

O mapa é **gerado por uma semente** (seed): um número que decide tudo (onde fica cada bioma, o relevo, os rios, os lagos, as árvores). A mesma semente sempre dá o mesmo mapa. **Todos os jogadores usam a mesma semente**: o mundo é um só para todos. O código fica em `js/mapa/`.

- **Tamanho:** mapa redondo de **200 m de raio** (cerca de 5 vezes a área do mapa antigo; atravessar leva ~55 s andando). Na borda o chão sobe e há montanhas.
- **Biomas:** o **Campo** fica no meio, com a fonte. Em volta, os 4 biomas (Floresta, Deserto, Neve e Lava), em ordem sorteada, com tamanhos diferentes e **bordas onduladas**. Onde dois se encontram, as cores e o relevo se misturam aos poucos.
- **Relevo:** morrinhos no Campo e na Floresta, dunas e cânions no Deserto, cadeias de montanhas na Neve (com neve no alto dos picos) e um vulcão com cratera de lava no meio da Lava.
- **Água:** rios (rasos: dá para atravessar andando), lagos (o meio é fundo: não dá para entrar), lagos congelados na Neve (dá para andar em cima) e rios de lava (não dá para entrar).
- **Pontos de interesse:** o vulcão com lava na cratera, o arco de pedra do Deserto, o oásis com palmeiras, o cristal de gelo gigante da Neve, os lugares fixos da Floresta e as entradas das duas dungeons. Perto de alguns tem cristal escondido.
- **Chunks:** o mapa é dividido em quadrados de **32 m**. Só os chunks perto de você existem na memória; os novos são criados aos poucos enquanto você anda (no máximo ~3 ms por quadro) e os que ficam longe são apagados.
- **Leve no celular:**
  - cada tipo de objeto (árvore, pedra, cacto...) é desenhado **num lote só por chunk** (InstancedMesh);
  - o que está fora da tela não é desenhado;
  - os chunks longe têm o chão mais simples e não têm os objetos pequenos (LOD);
  - as pedras longe não são desenhadas;
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

**Trocar a semente muda o mapa de todo mundo:** o jogo salvo de quem estava em outro mapa acorda na fonte, com a casa na mochila (os monstros, itens e níveis não mudam).

### Para os monstros de cada bioma (futuro)

`zonaEm(x, z)` (em `js/mundo.js`) diz a região de cada ponto (`campo`, `planta`, `terra`, `raio`, `fogo`, `agua`) e `APARICOES` (em `js/dados.js`) diz quem aparece em cada uma. Para pôr monstros novos num bioma, basta mudar `APARICOES`.

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
- **Na tela:** os bônus aparecem embaixo da barra de vida de cada monstro, e a faixa da arena fica abaixo dos botões Pedra, Trocar e Fugir.

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
- Na batalha, o botão do golpe mostra a chance (ex.: "ÁREA 30%"). O Sealfolio também mostra.
- Para mudar, mexa em `chance` dentro de `EFEITOS` e em `CHANCE_POR_TIPO`, no `dados.js`.

Dica: trocar de monstro na batalha tira os efeitos negativos de quem saiu.

## Golpes da linha do Brasito (Fogo)

**Modelo do Blender:** a forma inicial (Brasito) usa o modelo `modelos/brasito.glb`, com animações de parado, arrancada → correndo e os 3 golpes. As outras formas continuam com os modelos de formas simples. Detalhes em `modelos/README.md`.

A linha do Brasito tem golpes próprios. Os números ficam em `js/habilidades/brasito.js`; como funcionam e aparecem, em `js/habilidades/brasito-batalha.js`. Desde a etapa 3.1 eles usam o fogo da Arena: chamas que crescem e mudam de cor, faíscas, a roda de fogo do Rabo e o chão que racha em lava no Rabo de Magma.

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
- Aquaraia e os tipos duplos com Água (Vaporito e evoluções) continuam com os golpes de Água de sempre.

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

## Golpes de Trevas (visual)

Os golpes da linha de Trevas invocam coisas da escuridão, e cada evolução ganha algo novo. É só a aparência: dano, alcance e efeitos são os mesmos de antes. Tudo aparece **dentro da área que o golpe acerta**. O código fica em `js/habilidades/trevas-batalha.js`.

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Breuzinho | Investida com rastro de fumaça preta | Bola Sombria: núcleo de breu **com olhos** e rastro de fumaça | Vazio: **poça de breu** com 6 tentáculos |
| Sombrelo | Mordida Sombria: uma **bocarra de sombra** fecha no alvo | Onde a bola acerta, **um par de olhos se abre** no ar | **Olhos se abrem** dentro da poça |
| Umbrafel | Garra Abissal: **cópias sombrias** no avanço e **marcas de garra** roxas | Sombras viram **lâminas de sombra** | **Mãos de sombra** saem do chão; quem é atingido é **agarrado** por dedos |
| Noctífero | **Garra gigante** brota do chão embaixo do alvo | **Morcegos de sombra**, e uma **cópia sombria** aparece atrás e atira junto | Abismo: o **Astro Negro** (esfera preta com coroa roxa) sobe, a **arena escurece**, um **anel de olhos** se abre e 9 mãos agarram |

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
| **Mundo** | **Hora:** amanhecer, meio-dia, anoitecer, meia-noite ou **parar o relógio**. **Teleporte:** fonte, as 6 regiões (o lugar de cada uma vem da semente do mapa) e a casa. **Andar ×1, ×2 ou ×3.** **Invisível:** os monstros não vêm atrás de você, mas encostar neles ainda começa a batalha. **Mostrar FPS** (embaixo, no meio da tela), com os números do mapa (chunks, objetos, desenhos e triângulos por quadro, tempo para criar um chunk). **Mapa:** ver outra semente (digitada ou aleatória) e voltar à de todos: recarrega o jogo com outro mapa só neste aparelho, até fechar (pela URL `?semente=123`). |
| **Testes** | **Invencível** (a vida não desce, nem com efeitos e perigos da arena), **recarga zero**, **selamento garantido** (qualquer pedra sela qualquer monstro, até os chefes), **inimigos parados**, **dano ×10**. Na gaveta da batalha também: **encher minha vida** e **vencer agora** (derrota todos, até os que estão esperando nas ondas). |

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
| `js/plataforma.js` | A vitrine 3D do Sealfolio e a animação de evolução |
| `js/invocador.js` | O **Invocador** (o jogador no mapa): o corpo com as peças do Blender da Arena (`h_*`), as cores, os penteados, as animações (parado, andar e conjurar) e a pedra na mão. A aparência padrão é o **Aiden** |
| `js/invocacao.js` | **Invocar com runas:** o monstro subindo do círculo de runas e virando luz ao ser guardado (na batalha e no mapa); também a sombra escura embaixo das runas, usada pelo Selamento |
| `js/selamento.js` | O **Selamento** na batalha: a pedra que aparece ao lado do seu monstro, as correntes, os pulsos, o selo que fecha ou quebra (usa `js/arena/efeitos.js`) |
| `js/criador.js` | A cena 3D da tela **Crie seu Invocador** (o pedestal com runas; arrastar gira o personagem) |
| `js/mundo.js` | Mapa aberto: regiões, dia e noite, monstros selvagens e grupos (em volta do jogador), pedras de selamento, fonte, casa, colisão e câmera |
| `js/mapa/config.js` | Configurações do mapa procedural e os perfis de qualidade |
| `js/mapa/gerador.js` | O gerador do mapa (só matemática): ruído com semente, biomas, altura do chão, rios, lagos, pontos de interesse, lugares da Floresta e direção das dungeons |
| `js/mapa/altura.js` | `alturaEm(x, z)`: a altura do chão igual aos triângulos desenhados (com as dungeons e a borda), e onde não dá para andar (lago fundo e lava) |
| `js/mapa/chunks.js` | Os chunks: cria o chão, a água, a lava e os objetos de cada pedaço do mapa, carrega e apaga conforme você anda, e o LOD |
| `js/mapa/grade.js` | Grade de obstáculos: guarda as árvores, pedras e peças em quadradinhos de 8 m, para a colisão só olhar o que está perto |
| `js/batalha.js` | Batalha em tempo real: movimento, golpes, efeitos, IA do inimigo e selamento (captura) |
| `js/dungeon.js` | Base das dungeons abertas: a forma do corredor (`Tracado`), portões transparentes, acampamentos, monstros soltos, chefe e clima. Também o `Lote` e o `Bloco`, que juntam peças para ficar leve no celular |
| `js/brasas.js` | Cenário do Caminho das Brasas (braseiros, forja, rio de lava, Trono de Magma, vulcão) |
| `js/raizes.js` | Cenário da Trilha Ancestral e da Floresta (cogumelos, ruínas, lago, raízes, Árvore-Mãe, vaga-lumes, monstros extras) |
| `js/arena.js` | Arenas: chão, obstáculos, clima animado e perigos de cada região (com chance), e o escurecer do Astro Negro |
| `js/habilidades/` | **Habilidades próprias das linhas de monstros** (uma pasta só para isso). Veja o `README.md` de lá. Hoje: linha do Brasito (`brasito.js` com os números, `brasito-batalha.js` com o lança-chamas, o rabo de fogo e a velocidade), linha do Gotinho (`gotinho.js` e `gotinho-batalha.js`, com o jato, o hidrocanhão, as ondas, o maremoto e o escudo), linha do Musguinho (`musguinho.js` e `musguinho-batalha.js`, com a folha bumerangue, a vinha que puxa, as raízes, a moita e o bosque), linha do Pedrisco (`pedrisco.js` e `pedrisco-batalha.js`, com a pedra em arco que quica, o punho sísmico, o tremor e os pilares), linha do Faisquinho (`faisquinho.js` e `faisquinho-batalha.js`, com as marcas, o dash elétrico, o tiro que marca, o choque e as nuvens), linha do Solito (`solito.js` e `solito-batalha.js`, com o sol que dá bônus, o laser e o calor) e o visual de Trevas (`trevas-batalha.js`) |
| `js/nuvem.js` | Contas e jogo salvo na nuvem (Firebase, direto pela internet, sem a biblioteca do Firebase): criar conta, entrar, entrar de novo com 1 toque, ler e gravar o jogo salvo, e a senha do GM |
| `js/companheiro.js` | O monstro invocado: invocar e guardar, seguir o treinador, os botões e a troca de controle (o treinador fica parado e protegido) |
| `js/treino.js` | O modo treino: os golpes do monstro invocado no mapa, "no ar", usando o mesmo motor da batalha (sem inimigos e sem dano) |
| `js/gm.js` | Painel GM (só para a conta GM): fazer monstros, grupos, acampamentos e chefes aparecerem, XP, evolução, teleporte, hora e as chaves de teste da batalha. Só é baixado quando a conta GM entra |
| `js/controles.js` | Joystick de toque (lado esquerdo), câmera (lado direito, controle de câmera e mouse), botões e teclado (R invoca, T controla o monstro). Enquanto você escreve num campo (login, painel GM), as teclas não viram atalhos |
| `js/camera.js` | Câmera em terceira pessoa: gira em volta do personagem, sobe e desce, aproxima e afasta |
| `js/main.js` | Liga tudo: login e contas, telas, equipe, experiência, evolução, salvamento (no celular e na nuvem) |
| `lib/three.module.min.js` | Biblioteca Three.js 0.170 (licença MIT, em `lib/THREE-LICENSE.txt`) |
| `lib/addons/` | Peças extras do Three.js 0.170 (mesma licença): `loaders/GLTFLoader.js` (abre os `.glb`), `utils/SkeletonUtils.js` (copia um modelo com ossos) e `utils/BufferGeometryUtils.js` (usado pelo GLTFLoader). No `index.html`, o caminho `three/addons/` aponta para esta pasta |
| `js/arena/` | **Material da Arena das Brasas** (etapa 0.2; hoje usado no Selamento, no Invocar com runas, no fogo do Brasito, nos raios do Faisquinho, nas pedras do Pedrisco e na água do Gotinho): `efeitos.js` (runas, correntes, relâmpagos, rachaduras, espinhos, chamas...), `pecas.js` (lê as peças do Blender; `LotePecas` junta muitas numa malha só) e `pecas_blender.js` (as 66 peças, gerado pelo Blender). Veja o `README.md` de lá |
| `blender/` | O `arena_pecas.blend` e os scripts que modelam as peças (cenário, corpo do Invocador e chefes) e exportam para `js/arena/pecas_blender.js`. Veja o `README.md` de lá |
| `PLANO.md` | O plano do Runeclash: as decisões e as etapas |

## Rodar no computador

A página precisa ser aberta por um servidor local, porque abrir o arquivo direto com dois cliques bloqueia os módulos JavaScript:

```bash
cd apps/runeclash
python -m http.server 8766
```

Depois abra `http://localhost:8766` no navegador. (A porta 8766 é só para não brigar com o Cristalia, que costuma rodar na 8765.) O erro 404 do `versao.json` é normal no teste local.

**Testes automáticos:** veja `testes/runeclash/README.md` na raiz do repositório (`npx playwright test` dentro de `testes/runeclash`).

## Próximos passos possíveis

- Trocar os outros modelos de formas simples por modelos feitos no Blender (`.glb`), como já foi feito com o Brasito
- Sons e música
- Treinadores rivais
- Dungeons abertas nos outros biomas (Lago, Deserto, Neve) usando a mesma base de `dungeon.js`
- Levar as regras (`dados.js`) para o Unreal Engine
