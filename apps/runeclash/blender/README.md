# Peças do Blender (vindas da Arena das Brasas)

As peças de cenário, o corpo do Invocador e os chefes (futuros lendários) são **modelados por código** no Blender e exportados para o jogo em `js/arena/pecas_blender.js`.
Trazido da Arena das Brasas na etapa 0.2 do [PLANO.md](../PLANO.md).

| Arquivo | O que faz |
|---|---|
| `arena_pecas.blend` | O arquivo com todas as peças (abra no Blender) |
| `modelar_cenario.py` | Cria a coleção `PECAS_CENARIO`: piso da arena, pilares, arcos, pinheiros, pedras, braseiro, obeliscos, palmeira, arcos de arenito, cristais, espinhos de basalto, árvore queimada, rocha de lava |
| `modelar_personagens.py` | Cria `PECAS_PERSONAGENS`: as partes do corpo do Invocador (`h_...`) e do Colosso de Basalto (`c_...`) |
| `modelar_chefes.py` | Cria `PECAS_CHEFES`: Serpe da Tormenta (`s_...`), Sentinela de Geada (`g_...`), Arauto das Cinzas (`a_...`), Cavaleiro Oco (`k_...`) e as costas do Colosso (`c_costas`) |
| `exportar_pecas.py` | Grava **`js/arena/pecas_blender.js`** com todas as peças das 3 coleções |

## Como mudar uma peça

1. Abra o `arena_pecas.blend` no Blender (5.2 ou mais novo).
2. Mude a peça na mão, **ou** mude o script dela e rode de novo (aba **Scripting** → Abrir → Executar). Também dá para eu fazer isso pelo Blender ligado ao Claude Code (MCP).
3. Rode o `exportar_pecas.py` (aba Scripting → Abrir → Executar). Ele grava o `js/arena/pecas_blender.js` sozinho, no lugar certo.
4. Salve o `.blend` e recarregue o jogo.

Sem abrir a janela do Blender (pelo terminal, dentro de `apps/runeclash/blender`):
```
"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b arena_pecas.blend --python exportar_pecas.py
```

## Regras das peças

- **O nome do objeto é o nome da peça** no jogo.
- A **posição do objeto no Blender não conta** (serve só para organizar a cena): vale a malha em volta da origem.
- **Coordenadas:** o Blender usa Z para cima e o jogo Y para cima. A frente da peça (−Y no Blender) vira +Z no jogo.
- **Cenário:** em metros, com a base no chão (Z = 0) e o centro em X = Y = 0.
- **Partes do corpo** (Invocador e chefes): a origem fica na **junta** (ombro, cotovelo, joelho...) e as medidas seguem as da animação. Mudar muito o tamanho desencaixa a animação.
- **O nome do material importa:**
  - `pele`, `roupa`, `detalhe`, `cabelo` e `calca` recebem as cores escolhidas no criador de personagem (etapa 1.3);
  - `piso`, `pedra` e `ouro` podem ter a cor trocada pelo jogo (ex.: pelo bioma);
  - materiais que começam com **`luz`** brilham sozinhos; os que começam com **`gelo`** ficam translúcidos.
- **Sombreado pintado:** os chefes têm a camada de cor por vértice `cor` (mais escuro embaixo e nas dobras). Ela vai junto na exportação.
- O `.blend1` (cópia automática do Blender) não vai para o repositório.

## Conferido na etapa 0.2

Exportado pelo Blender 5.2 a partir desta pasta: as 66 peças saíram **iguais** às da Arena.
