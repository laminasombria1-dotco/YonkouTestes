# Dungeons (`js/dungeons/`, mundo novo passo 5)

Dungeons são **mais fáceis que as masmorras**: lugares isolados (área separada, como as masmorras) com **2 ou 3 grupos** e o **Rei da Dungeon**. Todos são capturáveis. Cada bioma tem **3 ativas**, cada uma num dos **6 lugares** do bioma e com uma das **6 variações do guia do Lâmina**. Depois de vencer o Rei, em **2 horas de jogo** ela se renova em outro lugar.

| Arquivo | O que faz |
|---|---|
| `dungeons.js` | O motor. `Dungeons` (o gerente: as vagas do jogo salvo, a entrada no mapa com o vórtice e o cristal flutuante, descobrir, entrar, o reset) e `DungeonNova` (a dungeon montada: os grupos, o portão do Rei, o Rei e o prêmio). |
| `lista.js` | Os números (`DUNGEON`: vagas, reset, prêmio), os biomas prontos (`BIOMAS_DUNGEON`: quem aparece e quem pode ser o Rei) e as variações (`VARIACOES`: nome, salas e o desenho). |
| `lugares.js` | Os 6 lugares possíveis de cada bioma (só matemática, presa à semente). A busca fica guardada no aparelho (`cristalia-dungeons-lugares:v1:...`). **Se mudar as regras da busca, suba o `v1`.** |
| `pecas.js` | O molde `fazerPlano` (monta o plano de uma variação: acampamentos, portão do Rei, portal, cores do chão e materiais) e `tema` (o tempo de uma sala). As peças repetidas: `hexColuna`, `estalactite`, `ponta`, `bigorna`, `obelisco`, `esfinge`, `anfora`, `barca`, `cogumelo`, `arvore`, `ponteTabuas`, `escada`, `sino`, `emVolta`, `noChao`, `emCirculo`, `agua`, `feixe` (luz falsa), `brilhos`, `estrelasDoCeu`, `samambaia`, `flor`, `cipo`, `pedra`, `coluna`, `arcoEntre`, `lanterna`, `casco`, `corrente`. |
| `GUIA.md` | O guia de conceito do Lâmina: as 30 variações (6 por bioma), com as áreas de cada uma. As artes ficam com ele. |
| `arq-*.js` | As 6 do Arquipélago: `arq-arcos.js`, `arq-farol.js`, `arq-galeoes.js`, `arq-santuario.js`, `arq-caldeira.js`, `arq-mangue.js`. |
| `vulcao.js`, `deserto.js`, `floresta.js`, `gelo.js` | As 6 de cada um dos outros biomas, num arquivo só por bioma, feitas com o molde `fazerPlano`. |

## Como a dungeon usa o motor das masmorras
- `DungeonNova` é uma `MasmorraNova` (`js/masmorras/masmorra.js`) com outro plano: o chão, a porta de luz, o portal do trono, o clima de cada sala e o apagar tudo na saída são os mesmos. Quem entra e sai é o gerente das masmorras (`mundo.masmorras.abrir`), então o salvar, a bandeira e o desmaio funcionam igual.
- A forma das salas é a das masmorras (`js/masmorras/forma.js`), com um tipo novo de sala: **`plataforma`** (a beirada cai: convés, passarela sobre a água, topo de torre; `fundo` diz quantos metros o chão desce).
- Montada em `DUNGEON.origem` (x = 1800, z = 2600), longe do mapa e das masmorras. Só uma área separada existe por vez.

## Fazer uma variação nova
**O jeito curto (como as de Vulcânico, Deserto, Floresta e Gelo):** `fazerPlano({ salas, corredores, temas, chao, parede, fundo, liquido, mats, portao, trono, decorar(ms, M, rng) })` no arquivo do bioma. As salas com `etapa` (0, 1, 2) viram os grupos; a sala com `fim: true` é a do Rei e o portão selado fica no corredor que entra nela. Materiais: `'#cor'` normal, `'*#cor'` brilha, `'~#cor'` transparente que brilha. **Não esqueça o `mats`** (sem ele as peças saem brancas).

**O jeito completo (como as do Arquipélago):**
1. Um arquivo `<bioma>-<nome>.js` com o plano: `forma` (salas, corredores, abismos, buracos), `acampamentos` (3, com `etapa` 0, 1 e 2), `portoes: [{ corredor }]` (o do Rei), `inicio`, `saida`, `trono`, `portal`, `temas`, `corChao`, `pecasPortao` e `decorar(ms)`.
2. Comece do sul (z = 0, a porta de luz em z = 8) e vá para z negativo, como as outras. As 3 salas com grupo + a sala do Rei (`fim: true`).
3. Ponha em `VARIACOES` e na lista `variacoes` do bioma em `BIOMAS_DUNGEON` (`lista.js`). O bioma só ganha dungeons quando tiver as 6.
4. Teste com o GM (aba Dungeons: trocar a variação e entrar) e meça os desenhos por quadro.

## Regras para pesar pouco (celular de referência: Helio G95)
- As peças (`ms.peca`) são juntadas numa malha só por material: o que soma desenho é **material novo**, não peça nova.
- Luz: só brilho falso (`feixe`, `brilhos`, materiais com `emissive`), nunca luz de verdade.
- Medido (cenário, sem monstros): 8 a 59 desenhos por quadro (as 30). Com um grupo de 6 na tela: 82 a 101.
- Teste automático que vale rodar: o portal, o trono, o começo e os grupos de cada variação caem em chão andável e fora dos buracos (a água ou a lava das salas).
