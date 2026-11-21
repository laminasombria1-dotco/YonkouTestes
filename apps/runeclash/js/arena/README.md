# Material da Arena das Brasas

Código trazido da **Arena das Brasas** (o protótipo de combate do Lâmina) para o Runeclash na **etapa 0.2** do [PLANO.md](../../PLANO.md).
Hoje ele é usado no **Selamento** (2.1), no **Invocar com runas** (2.2) no **fogo do Brasito**, nos **raios do Faisquinho** nas **pedras do Pedrisco** na **água do Gotinho** e nas **plantas do Musguinho** (3.1); o resto é material das próximas etapas (habilidades, mapas e lendários).

| Arquivo | O que é |
|---|---|
| `efeitos.js` | Os efeitos visuais da Arena: partículas, runas no chão, anéis de runas, **correntes**, espirais, implosão, clarão, estilhaços, rachaduras, faixas, meteoro, cristal que voa, **relâmpago com galhos**, espinhos, chamas, avisos de ataque no chão e números de dano |
| `pecas.js` | Lê as peças do Blender e monta: `peca(nome)` (uma peça solta, para o que se mexe), `LotePecas` (junta muitas peças paradas em poucas malhas, leve no celular) e `colocar(x, y, z, giro, escala)` |
| `pecas_blender.js` | **Gerado pelo Blender** (não edite à mão): as 66 peças em números. Para mudar, veja [../../blender/README.md](../../blender/README.md) |

## Como usar os efeitos

```js
import { Efeitos } from './arena/efeitos.js';
import { alturaEm } from './mapa/altura.js';

const fx = new Efeitos(cena, { chao: alturaEm });   // no mapa; na arena de batalha o chão é plano: new Efeitos(cena)
fx.runa(x, z, 3, 0xb48cff, 1.5, { estilo: 0, giro: 1.2 });    // círculo de runas de 3 m por 1,5 s
fx.correntes([x1, y1, z1], [x2, y2, z2], 3, 0xb48cff, 1.5);   // 3 correntes de um ponto até o outro
fx.relampago([x, y + 14, z], [x, y, z], 0x9fe8ff, 0.4);        // raio do céu até o chão
// a cada quadro:
fx.atualizar(dt, camera, largura, altura);
```

- **`chao(x, z)`**: a altura do chão onde o efeito encosta (runas, rachaduras, espinhos...). No mapa use `alturaEm`; o padrão é 0 (chão plano).
- **`luzes`** (padrão **0**): quantas luzes de verdade os clarões usam. Cada luz pesa em **todos** os materiais da cena, o tempo todo, mesmo apagada; por isso o padrão é 0, e o clarão vira um brilho leve. Só ligue (ex.: `luzes: 2`) onde valer a pena e o celular aguentar.
- **Peso:** as partículas ficam num objeto só, com até **6.000** de uma vez. Na etapa 3.2 isso vai seguir a Qualidade (Fraco/Médio/Forte). Quando não há partícula viva, nada vai para a placa de vídeo.
- **`fogo`** (ex.: `new Efeitos(cena, { fogo: 1500 })`): um segundo grupo de partículas com **mistura normal** (pinta por cima em vez de somar luz), para o fogo não virar amarelo claro e sumir no chão claro do dia. Use com `_ponto(..., { solido: true })`.
- **`rachadura(x, z, r, cor, vida, solida)`**: com `solida = true` a rachadura pinta por cima (de dia, laranja somado com a grama vira verde-limão).
- **`_ponto(x, y, z, vx, vy, vz, cor, vida, tam, grav, { fim, cresce, solido })`**: `fim` = a cor no fim da vida; `cresce` = quanto a partícula cresce (como uma chama), em vez de encolher.
- `texto()` (números de dano) só funciona com `camada` e o estilo CSS `.num`; o jogo ainda usa os números de dano próprios.

## Como usar as peças

```js
import { LotePecas, colocar, peca } from './arena/pecas.js';

const lote = new LotePecas();
lote.por('pinheiro_nevado', colocar(x, alturaEm(x, z), z, giro, 1.1));
lote.por('obelisco', colocar(x2, alturaEm(x2, z2), z2, giro2), { pedra: 0x8d8880 });   // troca a cor do material "pedra"
for (const malha of lote.malhas()) cena.add(malha);   // tudo vira uma malha por material
```

**As 66 peças:**
- **Cenário (19):** `arco_arenito`, `arco_ruina`, `arvore_queimada`, `braseiro`, `cristal_gelo`, `espinho_vulcao`, `obelisco`, `obelisco_quebrado`, `palmeira`, `pedra_a`, `pedra_b`, `pedra_c`, `pilar`, `pilar_quebrado`, `pinheiro`, `pinheiro_nevado`, `piso_arena`, `rocha_arenito`, `rocha_lava`.
- **Corpo do Invocador (`h_...`):** tronco, cabeça com rosto, braço, antebraço, coxa, canela com bota, ombreira, capa e 6 cabelos. A origem de cada peça fica na "junta" (ombro, cotovelo, joelho...), para a animação por código. Uso: etapa 1.3.
- **Chefes, os futuros lendários:** Colosso de Basalto (`c_...`), Serpe da Tormenta (`s_...`), Sentinela de Geada (`g_...`), Arauto das Cinzas (`a_...`) e Cavaleiro Oco (`k_...`). Uso: etapa 5.4. As animações deles (o `modelos.js` da Arena) vêm junto com cada um.

## O que mudou em relação à Arena

- Código reformatado (linhas de até ~120 letras em vez de até 470) e comentários novos no topo. O que ele faz não mudou.
- `efeitos.js`: o chão virou configurável (`chao`) e as luzes dos clarões começam desligadas (`luzes: 0`).
- `pecas.js`: a classe `Lote` virou `LotePecas`, para não confundir com a `Lote` do `js/dungeon.js`, que funciona de outro jeito.
- Testado no Three.js **r170** (a Arena usava o r160): sem erros.
