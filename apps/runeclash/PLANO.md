# Plano do Runeclash: Sealstone Legends

A junção do **Cristalia** (`apps/cristalia/`) com a **Arena das Brasas** (protótipo no PC do Lâmina, em `D:\Mod Cristalia\ARENA_PROTOTIPO`, fora do repositório).
Uma ideia por vez, sem pressa. Cada ideia é feita numa branch, com proposta antes quando for grande, e só vai para a `main` quando o Lâmina disser **"pode colocar na main"**.

## Decisões já tomadas

- **Só os monstros lutam**, como no Cristalia. O Invocador (o treinador) **não luta**.
- Da Arena das Brasas vêm só: o **selar e invocar** do Invocador, os **efeitos visuais** (runas, correntes, relâmpagos, rachaduras...), as **peças do Blender** (cenário e corpo do Invocador) e os **chefes**.
- **Tom:** os monstros começam **fofos** e ficam **trevosos** nas últimas evoluções.
- **Monstruário → Sealfolio** (álbum das criaturas seladas).
- **Cristais de captura → pedras de selamento**, nas mesmas três cores e forças de hoje: **azul** (comum), **roxa** (forte) e **dourada** (suprema), com desenho de pedra. O modelo 3D da pedra vem depois.
- O Invocador segura uma **pedra de selamento na mão**, e as **correntes saem dela**. A animação vem depois.
- **Não** vão existir Cetro, Lanterna nem Sino.
- Os **chefes da Arena** (Colosso de Basalto, Serpe da Tormenta, Cavaleiro Oco, Sentinela de Geada e Arauto das Cinzas) viram os **primeiros lendários**: os mais fortes, mais imponentes e mais difíceis de selar.
- **Online:** depois. Agora o foco é a junção, os personagens, as habilidades e os mapas.
- **Onde fica:** `apps/runeclash/`, no mesmo repositório. Roda só no PC até a etapa 6.

## Cuidados

- **Um site só por repositório:** o site do GitHub hoje é o do Cristalia (o app Android dele abre esse site). **Nunca** criar um workflow que publique só o Runeclash: ele trocaria o site do Cristalia.
- **Mesmo site = mesmo armazenamento do navegador:** por isso o Runeclash usa chaves próprias (`runeclash-*`) e o cache `runeclash-v1`.
- **Contas iguais, jogo salvo separado:** mesmo projeto do Firebase, mas o jogo salvo fica em `runeclash_jogadores/<uid>`. Falta pôr a regra dessa gaveta no Firebase (está no README, em "Contas e nuvem").
- **Cópia do Cristalia:** o que a nuvem melhorar no Cristalia depois da etapa 0.1 não passa sozinho para cá. Quando o Lâmina quiser, trazer na mão.
- **Leve para o celular** continua sendo a regra número 1.

## Etapas

### Etapa 0: Montar a base
- [x] **0.1** Criar `apps/runeclash/` como cópia do Cristalia: nome novo, jogo salvo separado (no aparelho e na nuvem), este plano e o CLAUDE.md atualizado.
- [x] **0.2** Trazer o material da Arena para subpastas próprias: os efeitos (`efeitos.js`), as 66 peças do Blender (`pecas.js`, `pecas_blender.js`) e os scripts do Blender. Ajustar para o Three.js r170 e reformatar em linhas legíveis, com comentários. A chave do app e as cópias antigas ficam de fora.
- [x] **0.3** Testes automáticos (Playwright, numa pasta fora do jogo): abrir, lutar, selar e salvar, e fotos do tamanho do celular deitado.

### Etapa 1: Identidade Runeclash (só o visual, as regras não mudam)
- [x] **1.1** Telas com cara de runas: logo, cores e menus (mais sombrio que o Cristalia, sem ficar pesado).
  Feito: roxo-runa e dourado envelhecido, fonte Cinzel só no nome e nos títulos, emblema e ícone do app viraram a pedra de selamento (desenho provisório) e uma roda de runas gira atrás do nome.
- [x] **1.2** **Monstruário → Sealfolio** e **cristais → pedras de selamento** (azul, roxa e dourada, com desenho de pedra; o modelo 3D vem depois).
  Feito: Pedra Azul, Roxa e Dourada (ícone de pedra de 6 lados e pedra 3D provisória com anel de runa), Sealfolio no menu e na tela, e "capturar" virou "selar" nos textos. Os ids do jogo salvo (comum, forte, supremo) ficaram iguais.
- [x] **1.3** O treinador vira o **Invocador**: o criador de personagem da Arena (pele, cabelo, roupa, capa, ombreiras e altura), com as peças do Blender e as animações de andar, parado e conjurar. Ele segura a pedra de selamento.
  Feito: `js/invocador.js` (corpo, animações e a pedra roxa na mão esquerda) e `js/criador.js` (a cena do criador). A aparência padrão é o **Aiden** (ficha do personagem: cabelo preto, olhos roxos, roupa preta com dourado, gema roxa no peito). Tela "Crie seu Invocador" no Novo jogo e no menu de pausa (Aparência), com cores em bolinhas prontas. A aparência fica no jogo salvo (`estado.invocador`).

### Etapa 2: Selar e invocar (o coração da junção)
- [x] **2.1** **A captura vira o Selamento em etapas:** "PODE SER SELADO" quando o monstro está fraco → círculo de runas e **correntes saindo da pedra** na mão do Invocador → canalização com partículas em espiral → sucesso (implosão, o monstro some na pedra) ou falha (as correntes se partem).
  Feito (`js/selamento.js`): "PODE SER SELADO" com 35% de vida ou menos; a pedra aparece flutuando ao lado do seu monstro e as correntes saem dela; 3 pulsos (sucesso) ou 1 a 3 (falha); a essência voa até a pedra. As regras e a chance não mudaram. **Decisão da Lâmina:** por enquanto o Invocador fica **fora da batalha** (a pedra aparece sozinha); a cena dele vem na 2.3.
- [x] **2.2** **Invocar com runas:** o monstro sobe de um círculo de runas ao entrar na batalha, ao trocar e ao ser invocado no mapa. Ao guardar (e o que sai na troca), ele vira luz e volta para a pedra (`js/invocacao.js`).
- [ ] **2.3** **Cena do Invocador** erguendo a pedra e o selo aparecendo no monstro que vai ser selado (a Lâmina vai fazer a cena), junto com o modelo 3D da pedra. O corpo do Invocador já tem a pose de segurar a pedra erguida (`canal` em `js/invocador.js`).

### Etapa 3: Habilidades melhores
- [ ] **3.1** Os efeitos da Arena nos golpes de hoje, **uma linha de monstros por vez** (ex.: relâmpago com galhos no Faisquinho, rachaduras e estilhaços no Pedrisco, chamas no Brasito).
  - [x] **Brasito:** chamas que crescem e mudam de cor, faíscas, brilho na boca, brasas no alvo, roda de fogo no Rabo, faixa de fogo no avanço, chão rachado em lava no Rabo de Magma e rastro verde da Investida. O fogo tem uma camada "sólida" (mistura normal) para não sumir no chão claro do dia.
  - [x] **Faisquinho:** o relâmpago da Arena (com galhos) pisca por cima de todo raio; clarões, faíscas que brilham, chão que racha onde o raio cai, anel da marca, raios curtos e faixa elétrica no Dash. O Tempestor tem brilho roxo de tempestade (aparece mais à noite).
  - [x] **Pedrisco:** nuvens de poeira (neve no Montanhar), onda de choque, rachadura laranja que "pinta" o chão no Tremor e nas pedras que quicam, faixa do Punho e poeira dos pilares.
  - [ ] Gotinho · [ ] Musguinho · [ ] Solito
- [ ] **3.2** Os efeitos respeitam a Qualidade (Fraco/Médio/Forte) para não pesar no celular.
- [ ] **3.3** Habilidades próprias para **Lua, Luz e Trevas**. Trevas primeiro, já no tom trevoso.
- [ ] **3.4** Rebalancear dano, vida e chances depois das mudanças.

### Etapa 4: Personagens (os monstros)
- [ ] **4.1** **Guia de estilo "fofo → trevoso":** forma inicial fofa, última evolução imponente ou assustadora. Limite de peso por monstro, com o Brasito como medida (~3 a 5 mil faces, ~20 ossos, texturas de 1024).
- [ ] **4.2** **Caminho para fazer cada modelo:** imagem (ComfyUI) → modelo 3D (Trellis2) → Blender (malha leve, textura, ossos e animações padrão: parado, andar, correr, 3 golpes, dano, desmaio) → `.glb` → jogo.
- [ ] **4.3** **Brasalobo** a partir do `lobo_fogo` (hoje com 100 mil triângulos; precisa ficar com ~5 mil). É o primeiro teste do caminho.
- [ ] **4.4** Depois, um monstro por vez, começando pelas formas iniciais das 9 linhas.
- [ ] **4.5** (mais tarde) Monstros trevosos novos ou versões "corrompidas".
- [ ] **4.6** **Modelo próprio do Aiden** (o Invocador padrão), seguindo a ficha do personagem: sobretudo longo preto com detalhes dourados e roxos, gola alta, cabelo bagunçado, olhos roxos, gema no peito e a pedra de selamento na mão. Hoje ele é montado com as peças da Arena, que não têm o sobretudo longo nem o rosto da ficha. A ficha está em `blender/referencias/aiden_ficha.jpg`.

### Etapa 5: Mapas e lendários
- [ ] **5.1** As peças da Arena nos biomas: pinheiros nevados, palmeiras, obeliscos, arcos de arenito, cristais de gelo, espinhos de basalto e árvores queimadas.
- [ ] **5.2** **Ruínas rúnicas** pelo mapa: círculos de pedra e altares de selo.
- [ ] **5.3** Arenas de batalha com os 4 temas da Arena (Ruínas do Vale, Dunas de Âmbar, Lago Congelado e Cratera Ardente).
- [ ] **5.4** **Os 5 lendários** (os chefes da Arena): lutam contra os seus monstros e só são selados com a pedra **dourada**, com chance baixa. Cada um no seu lugar do mapa (ex.: Arauto das Cinzas na Lava, Sentinela de Geada na Neve, Cavaleiro Oco só à noite). Um por vez.
- [ ] **5.5** Lugares fixos desenhados no Blender e dungeons nos outros biomas.
- [ ] **5.6** Clima mais sombrio: noite mais escura e lugares amaldiçoados.

### Etapa 6: Publicar (quando o Lâmina quiser que outros joguem)
- [ ] Uma publicação só para os dois jogos: o Cristalia no endereço de sempre e o Runeclash em `/runeclash/`. Mexe na publicação do Cristalia, então só com "pode colocar na main".
- [ ] Pôr a regra de `runeclash_jogadores` no Firebase.
- [ ] Ver se o nome "Runeclash" já é usado por outro jogo nas lojas.

### Etapa 7: Online (depois)
- [ ] Cooperativo e PvP, usando como base o servidor da Arena ou o Firebase. Decidir quando chegar aqui.
