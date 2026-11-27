# Dungeons (`js/dungeons/`, mundo novo passo 5)

Dungeons são **mais fáceis que as masmorras**: lugares isolados (área separada, como as masmorras) com **2 ou 3 grupos** e o **Rei da Dungeon**. Todos são capturáveis. Cada bioma tem **3 ativas**, cada uma num dos **6 lugares** do bioma e com uma das **6 variações do guia do Lâmina**. Depois de vencer o Rei, em **2 horas de jogo** ela se renova em outro lugar.

| Arquivo | O que faz |
|---|---|
| `dungeons.js` | O motor. `Dungeons` (o gerente: as vagas do jogo salvo, a entrada no mapa com o vórtice e o cristal flutuante, descobrir, entrar, o reset) e `DungeonNova` (a dungeon montada: os grupos, o portão do Rei, o Rei e o prêmio). |
| `lista.js` | Os números (`DUNGEON`: vagas, reset, prêmio), os biomas prontos (`BIOMAS_DUNGEON`: quem aparece e quem pode ser o Rei) e as variações (`VARIACOES`: nome, salas e o desenho). |
| `lugares.js` | Os 6 lugares possíveis de cada bioma (só matemática, presa à semente). A busca fica guardada no aparelho (`cristalia-dungeons-lugares:v1:...`). **Se mudar as regras da busca, suba o `v1`.** |
| `pecas.js` | As peças repetidas: `emVolta`, `noChao`, `emCirculo`, `agua`, `feixe` (luz falsa), `brilhos`, `estrelasDoCeu`, `samambaia`, `flor`, `cipo`, `pedra`, `coluna`, `arcoEntre`, `lanterna`, `casco`, `corrente`. |
| `GUIA.md` | O guia de conceito do Lâmina: as 30 variações (6 por bioma), com as áreas de cada uma. As artes ficam com ele. |
| `arq-*.js` | As 6 do Arquipélago: `arq-arcos.js`, `arq-farol.js`, `arq-galeoes.js`, `arq-santuario.js`, `arq-caldeira.js`, `arq-mangue.js`. |

## Como a dungeon usa o motor das masmorras
- `DungeonNova` é uma `MasmorraNova` (`js/masmorras/masmorra.js`) com outro plano: o chão, a porta de luz, o portal do trono, o clima de cada sala e o apagar tudo na saída são os mesmos. Quem entra e sai é o gerente das masmorras (`mundo.masmorras.abrir`), então o salvar, a bandeira e o desmaio funcionam igual.
- A forma das salas é a das masmorras (`js/masmorras/forma.js`), com um tipo novo de sala: **`plataforma`** (a beirada cai: convés, passarela sobre a água, topo de torre; `fundo` diz quantos metros o chão desce).
- Montada em `DUNGEON.origem` (x = 1800, z = 2600), longe do mapa e das masmorras. Só uma área separada existe por vez.

## Fazer uma variação nova
1. Um arquivo `<bioma>-<nome>.js` com o plano: `forma` (salas, corredores, abismos, buracos), `acampamentos` (3, com `etapa` 0, 1 e 2), `portoes: [{ corredor }]` (o do Rei), `inicio`, `saida`, `trono`, `portal`, `temas`, `corChao`, `pecasPortao` e `decorar(ms)`.
2. Comece do sul (z = 0, a porta de luz em z = 8) e vá para z negativo, como as outras. As 3 salas com grupo + a sala do Rei (`fim: true`).
3. Ponha em `VARIACOES` e na lista `variacoes` do bioma em `BIOMAS_DUNGEON` (`lista.js`). O bioma só ganha dungeons quando tiver as 6.
4. Teste com o GM (aba Dungeons: trocar a variação e entrar) e meça os desenhos por quadro.

## Regras para pesar pouco (celular de referência: Helio G95)
- As peças (`ms.peca`) são juntadas numa malha só por material: o que soma desenho é **material novo**, não peça nova.
- Luz: só brilho falso (`feixe`, `brilhos`, materiais com `emissive`), nunca luz de verdade.
- Medido (cenário, sem monstros): 25 a 59 desenhos por quadro. Com um grupo de 6 na tela: 82 a 101.
