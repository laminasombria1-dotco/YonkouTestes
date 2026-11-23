# CLAUDE.md — instruções para o Claude neste repositório

Este arquivo é lido sozinho pelo Claude Code (no VS Code, no terminal ou na nuvem em claude.ai/code).
Ele diz como trabalhar aqui. Se algo mudar no projeto, atualize este arquivo junto.

## Quem é o dono e como responder

- O dono é o **Lâmina**: iniciante em programação, jogos, vídeo e sites, e quer aprender. Ele joga principalmente no **celular Android, deitado**.
- **Responda sempre em português**, de forma **explicativa** (explique termos técnicos na primeira vez que aparecerem). Use imagens ou capturas de tela quando ajudarem.
- **Não comece** com "Ótima pergunta", "Com certeza" ou "Claro". **Não repita a pergunta.**
- Se uma ideia dele tiver problema, **diga e explique**. Dê a sua **recomendação de verdade**, nunca só "depende".
- Se não der para fazer algo, diga **quem ou o que consegue** (programa, extensão, plugin).
- **Não faça nada que ele não pediu.** Para mudanças grandes (como o mapa), **faça uma proposta antes**: o que muda, como vai ficar (de preferência com imagem) e os problemas (jogo salvo, casa, dungeons, contas, peso no celular). Depois **espere ele aprovar**.
- **Nunca** coloque o nome, o e-mail ou outros dados pessoais dele em sites, serviços externos ou no código (o repositório é **público**).

## Pastas do repositório

| Pasta | O que é |
|---|---|
| `apps/cristalia/` | **O jogo Cristalia** (Three.js, roda no navegador). É o projeto principal. |
| `apps/runeclash/` | **Runeclash: Sealstone Legends**, o jogo novo: a junção do Cristalia com a Arena das Brasas. Ainda **não é publicado** (veja a seção dele abaixo). |
| `apps/cristalia-android/` | O app Android (versão 1.2) que abre o site do jogo em tela cheia |
| `criacao-de-imagem/`, `criacao-de-musica/`, `criacao-de-video/`, `edicao-de-video/` | Outros trabalhos (cada uma tem o seu README) |

## Git: branches e a `main` (IMPORTANTE)

- A **`main` publica o jogo sozinha**: o workflow `.github/workflows/cristalia-site.yml` ("Publicar Cristalia") roda a cada mudança em `apps/cristalia/**` na `main` e atualiza o site **https://laminasombria1-dotco.github.io/YonkouTestes/**. **É esse site que o app Android abre.**
- Por isso: **trabalhe numa branch** e **só junte na `main` quando ele disser "pode colocar na main"**.
- Antes de começar: atualize a partir da `main` (`git pull`, ou o botão Sync no VS Code). No fim: commit e push da branch.
- Depois de juntar na `main`: confira se o workflow "Publicar Cristalia" terminou com **sucesso** e avise para **fechar e reabrir o app** (às vezes precisa abrir 2 vezes, por causa da cópia guardada).
- O Lâmina trabalha **em dois lugares**: no **VS Code** (no PC dele) e na **nuvem** (claude.ai/code). O GitHub é o centro. Não mexa no mesmo arquivo nos dois lugares ao mesmo tempo (dá conflito).

## O jogo Cristalia (`apps/cristalia/`)

Protótipo 3D low poly de caçar, capturar e evoluir monstros. **Three.js 0.170, JavaScript puro, sem build** (sem npm). Leia primeiro:
- `apps/cristalia/README.md`: como jogar, contas e nuvem, monstro invocado, casa, regiões, **mapa procedural**, dungeons, arenas, painel GM e a lista de arquivos.
- `apps/cristalia/js/habilidades/README.md`: as habilidades de cada linha de monstros e o modo treino.
- `apps/cristalia/modelos/README.md`: os modelos `.glb` feitos no Blender (hoje o Brasito).

### O que já existe
- **Batalha** em tempo real: 9 linhas de 4 formas, tipos duplos, raros e 2 chefes. 6 linhas têm habilidades próprias em `js/habilidades/` (Brasito, Gotinho, Musguinho, Pedrisco, Faisquinho, Solito). Lua, Luz e Trevas ainda usam as antigas.
- **Contas na nuvem** (Firebase, projeto `cristalia-91fd6`, pela internet direto em `js/nuvem.js`): nome e senha. Cada conta tem o seu jogo salvo: `cristalia-save-v1:<id>` no celular e `jogadores/<uid>` no Firestore. A conta **GM** fica só no aparelho e abre o painel GM (`js/gm.js`).
- **Brasito 3D**: `modelos/brasito.glb` com animações (`js/modelos3d.js`, GLTFLoader em `lib/addons/`).
- **Monstro invocado** (`js/companheiro.js`) e **modo treino** (`js/treino.js`: os golpes no mapa, "no ar").
- **Só deitado**: tela "Vire o celular" (pausa), manifest `landscape`, app Android `sensorLandscape`.
- **Mapa procedural** (`js/mapa/`): semente única para todos (`CONFIG_MAPA.semente` em `js/mapa/config.js`), raio de 200 m, Campo no meio e Floresta (planta), Deserto (terra), Neve (raio) e Lava (fogo) em volta, rios, lagos e lava, em **chunks** de 32 m, com LOD e qualidade Fraco/Médio/Forte no menu de pausa.
  - `js/mapa/gerador.js`: só matemática (biomas, relevo, água, pontos de interesse, lugares da Floresta, direção das dungeons).
  - `js/mapa/altura.js`: `alturaEm(x, z)`, igual aos triângulos desenhados. **Use sempre essa função** para pôr coisas no chão.
  - `js/mapa/chunks.js`: cria e apaga o chão, a água e os objetos de cada chunk.
  - `js/mapa/grade.js`: obstáculos separados em quadradinhos (a colisão usa `mundo.grade`; os fixos ficam em `mundo.obstaculos`).
  - O jogo salvo guarda a `semente`: um save de outro mapa acorda na fonte e a casa volta para a mochila. **Trocar a semente muda o mapa de todos.**
- **Dungeons abertas** (`js/dungeon.js`, `js/brasas.js`, `js/raizes.js`): saem pela borda do bioma delas. Usam `Lote` e `Bloco` para pesar pouco.
- **O Reino** (`js/reino.js`, forma em `REINO` no `js/dungeon.js`): o novo centro do jogo, fora da borda (lado mais longe das dungeons e da Neve). Castelo com a **única fonte de cura**, vila com a loja de poções, arena fechada com plateia e os 5 treinadores, cada um na sua plataforma (ordem: Gill/Fogo Nv.20-24 > Cris/Trevas 25-29 > Lana/Luz 30-34 > Sheyla/Água 40-45 > o Campeão Julius/Planta 46-50; depois de dominada, todos no 50). A **Estrada Real** (`ESTRADA` no `gerador.js`) vai do Campo até lá e é segura. O jogo começa e acorda no castelo; a casa **não cura** (acordar nela levanta só os desmaiados, com 1/4 da vida). As **lutas da arena** já funcionam (encostar na frente da plataforma, um monstro de cada vez, sem captura, progresso em `estado.arena`; GM: aba Mundo). **Bolsa, moedas e loja** (`js/bolsa.js`): o botão do canto é a Bolsa (casa, poções, cristais, ovo); poções de Cura e Reviver (também na batalha, recarga 10 s), compradas na barraca da vila. **Ovo Misterioso** (`js/ovo.js`): o Rei entrega 1 ovo ao dominar a arena; choca em 10 min de jogo e sorteia um raro ou tipo duplo Nv.1.

### Regras do código
- **Leve para celular Android intermediário** é prioridade: poucos materiais, peças reaproveitadas, `InstancedMesh` ou `Lote`, nada de sombras nem pós-processamento, nada pesado a cada quadro.
- **Não quebre** a batalha, o monstro invocado, o modo treino, o GM, as dungeons, o login nem o salvamento.
- Comentários e textos do jogo em **português**, simples.
- Ao mudar algo, **atualize os READMEs** que falam disso.

### Como testar
- **Rodar:** dentro de `apps/cristalia`, `python -m http.server 8765` (no Linux e no Mac, `python3`). Depois abra `http://localhost:8765`. No VS Code também dá com a extensão **Live Server** ("Go Live"). O erro 404 do `versao.json` é normal no teste local.
- **Testes automáticos com Playwright** (o Chromium já vem na nuvem; no PC, instale com `npm i -D playwright` e `npx playwright install chromium` numa pasta de testes fora de `apps/cristalia`). Na nuvem, abra o Chromium com `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
  - O jogo abre na tela de login. Espere `window.__jogo` existir (ele espera o `.glb` carregar) e chame:
    `await page.evaluate(async () => { window.D = await import('./js/dados.js'); window.__jogo.novoJogo('pedrisco'); })`.
    Sem conta o jogo funciona, só não salva.
  - **Batalha:** `__jogo.estado.equipe = [D.criarMonstro('solario', 15)]` e `__jogo.iniciarBatalha(__jogo.mundo.selvagens[0])` (use um monstro de verdade do mapa: um falso quebra no fim da luta). A batalha fica em `__jogo.batalha`. Troque `batalha.pensarIA` por uma função vazia para os inimigos ficarem parados.
  - **GM:** `await __jogo.ativarGM()` e use `__jogo.gm`: `gm.ir('agua')`, `gm.irDungeon('brasas', 'chefe')`, `gm.aparecer('brasito', 5)`...
  - **Monstro invocado:** `__jogo.pet.invocar()`, `__jogo.pet.controlar()`. Golpe no treino: `__jogo.ctrl.fila.push('golpe0')` e rode alguns quadros.
  - **Fotos com tempo controlado:** `window.requestAnimationFrame = () => 0`, `__jogo.relogio.getDelta = () => 1/24` e chame `__jogo.quadro()` na mão.
  - **Mapa:** `__jogo.mundo.chunks.info()` dá os números; `chunks.carregarMundoTodo()` carrega tudo para uma foto de cima; outra semente: abra a página com `?semente=123`.
- Mostre **capturas de tela do tamanho de um celular deitado** (ex.: 844×390) e, se mexer no mapa, **de cima**.

### Artifact (versão de teste no claude.ai)
- Fica em **https://claude.ai/artifact/8ux9GY7VGgGghMKBpJoVcN** e só dá para publicar pela sessão na nuvem (claude.ai/code).
- **Leia o artifact antes** de publicar (ação `read`; para os arquivos que vai trocar, leia cada um com `path`). Publique **só os arquivos que mudaram ou são novos**: `index.html`, `js/**/*.js`, `lib/...`, `manifest.webmanifest`, `sw.js`, `icones/`.
- O artifact **não aceita `.glb`**: lá o Brasito aparece de formas simples.

## O jogo Runeclash (`apps/runeclash/`)

Começou (etapa 0.1) como uma **cópia do Cristalia**, e vai recebendo da **Arena das Brasas** (protótipo do Lâmina no PC dele, em `D:\Mod Cristalia\ARENA_PROTOTIPO`, fora do repositório) o selar e invocar do Invocador, os efeitos, as peças do Blender e os chefes, que viram os primeiros lendários. **Só os monstros lutam.** As regras do código e o jeito de testar são os mesmos do Cristalia.
- **Leia primeiro `apps/runeclash/PLANO.md`**: as decisões já tomadas (Sealfolio, pedras de selamento azul/roxa/dourada, tom fofo → trevoso...) e as etapas. **Uma ideia por vez**, e marque `[x]` no plano quando terminar.
- **Não publique:** o GitHub dá um site só por repositório, e ele é o do Cristalia. **Nunca crie um workflow que publique só o Runeclash** (trocaria o site que o app Android abre). A publicação dos dois juntos é a etapa 6 do plano.
- **Separado do Cristalia:** chaves no aparelho `runeclash-*`, cache `runeclash-v1` no `sw.js` e jogo salvo em `runeclash_jogadores/<uid>` no Firestore (mesmas contas do Cristalia). Não troque isso.
- **Material da Arena:** `js/arena/` (efeitos, peças do Blender; veja o README de lá) e `blender/` (o `.blend` e os scripts que modelam e exportam as peças). Para mexer nas peças, mude no Blender e rode `exportar_pecas.py`; **não edite `pecas_blender.js` à mão**.
- **Rodar:** dentro de `apps/runeclash`, `python -m http.server 8766` e abra `http://localhost:8766`.
- **Testes automáticos:** `testes/runeclash/` (Playwright, fora do jogo). Dentro dela: `npm install` na primeira vez (no Windows usa o Edge; no Linux/nuvem, `npx playwright install chromium` se faltar o Chromium), depois **`npx playwright test`** (liga o servidor sozinho, ~20 s no PC). Playwright **1.64.1**: a 1.49 trava no Node 26. Rode **antes de cada commit** do Runeclash e mostre as fotos de `testes/runeclash/fotos/`. Veja o README de lá para acrescentar testes.
- Mudanças no Runeclash **não** mexem em `apps/cristalia/` (e vice-versa). Se uma melhoria do Cristalia tiver que vir para cá, traga na mão, quando o Lâmina pedir.

## App Android (`apps/cristalia-android/`)
- Mudanças no **jogo não precisam de APK novo**: o app só abre o site. Só mexa no app quando for preciso (nome, ícone, endereço, giro de tela).
- A **assinatura** (`cristalia.jks` e `assinatura.properties`) **não fica no repositório**: está com o Lâmina. **Nunca faça commit dela e nunca mostre a senha.**
  - Se precisar de APK novo, ele manda o zip da assinatura. Monte numa **cópia do projeto fora do repositório** (na nuvem: Android SDK em `/tmp`, `platforms;android-35` e `build-tools;34.0.0`).
  - Confira com `apksigner` se a impressão digital é **A5:AC:0C:12…:43:D4**. Aumente o `versionCode` em `app/build.gradle`. **Apague as cópias no fim.**

## Ficou para depois (não faça sem ele pedir)
PvP entre 2 jogadores (a análise recomendou Firebase Realtime Database com anfitrião), habilidades novas de Lua, Luz e Trevas, arrancada do Brasito 3D mais rápida, Brasito 3D mais claro, e os botões do alto do mapa que se sobrepõem com o celular em pé.
