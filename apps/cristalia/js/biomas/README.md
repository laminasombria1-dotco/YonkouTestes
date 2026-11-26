# Melhorias dos biomas (`js/biomas/`)

O mapa de fora (Gelo, Floresta, Deserto, Vulcânico e Arquipélago) ganhando peças próprias, pelo **guia e pelas artes do Lâmina** (passo 4.5 do `PLANO.md`). Cada bioma: primeiro uma **maquete** com fotos, depois de aprovada vira código.

| Arquivo | O que faz |
|---|---|
| `lugares.js` | Onde ficam as peças únicas de cada bioma. Só matemática, presa à semente e aos lugares que o mapa já tem (estradas, lagos). **Não muda** o relevo, os rios, os lagos, as vilas nem as entradas das masmorras. |
| `comum.js` | As formas básicas (`UNI`), o `Forno` (junta peças numa malha só, cor nos vértices; tipos n, b, a, c, o, l, t, f), o brilho falso, as poças de luz e as peças que desbotam na frente da câmera. |
| `clima.js` | A cor do céu, da névoa e da luz de cada bioma (mistura pelo peso do bioma). |
| `floresta.js` | A Floresta: Carvalho-Véu, Freixo-Oco, Salgueiro, samambaia, cogumelos, Fungo-Tambor e a Catedral, a Ponte e o Pântano. |
| `deserto.js` | O Deserto: o caminho (Desfiladeiro, Estrada Cerimonial, Templo Solar, Avenida das Esfinges, Planalto das Pirâmides), o oásis, a caravana, a areia voando, a Khamsin e as peças comuns (acácia, tufo, arenito, fragmento, ânfora). O chão do caminho é aplainado no `gerador.js` (`alvoDeserto`). |
| `gelo.js` | O Gelo: acampamento (refúgio que cura), trilha com lanternas, lago congelado com barco e píer, arco rúnico, fonte termal, floresta fechada, neve caindo. |

As **peças comuns** de cada bioma (árvores, pedras, plantas) saem nos chunks (`js/mapa/chunks.js`, função `objeto`), e a cor do chão em `corDoChao` (o Gelo tem a `corDoGelo`).

## Regras para pesar pouco (celular de referência: Helio G95)
- Peças comuns: os objetos de cada chunk são juntados numa malha só por material (etapa 0), então uma forma nova não soma desenhos; o que soma é um **material** novo. As peças do Forno entram nos chunks com `pecaFloresta` (o 13º valor da peça marca o detalhe que some de longe).
- Peças únicas: junte numa malha só por área (o `Forno` do `gelo.js`: cor nos vértices, `n` = normal, `b` = brilho) e esconda a área quando estiver longe (na névoa).
- Luz: **brilho falso** (pontos com a textura redonda, `AdditiveBlending`), nunca luz de verdade.
- Partículas: poucas centenas de pontos num desenho só; desligadas na qualidade Fraco.
- **Nunca** ponha marcos novos na lista `POIS` do `gerador.js`: os lugares das vilas e das masmorras são sorteados depois dela e mudariam de lugar.
