---
name: plano-de-edicao
description: Lê trabalho/transcricao.json e estilo/ESTILO.md, entende o assunto do vídeo e monta um plano de edição com cortes (pausas longas, repetições, retomadas) e onde entram letreiros, gráficos, listas e zooms, salvo em trabalho/plano.json. Use quando o usuário pedir plano de edição, cortes, "o que editar", ou depois da transcrição. Sempre mostra o plano para aprovação antes de criar qualquer coisa.
---

# Plano de edição

## Entradas
- `trabalho/transcricao.json` (se não existir, rode a skill `transcricao` primeiro).
- `estilo/ESTILO.md` (cores, fontes, ritmo, tipo de letreiro). Se não existir, avise e pergunte o estilo básico; não invente em silêncio.

## Como pensar
1. Entenda o assunto e a estrutura do vídeo (gancho, partes, conclusão) e resuma em 2–3 linhas.
2. **Cortes** — procure: pausas longas (lacunas > ~1,0 s entre frases), repetições da mesma ideia, frases abandonadas e retomadas ("então... quer dizer..."), hesitações. Cada corte tem início, fim e motivo. Prefira cortar a menos do que a mais.
3. **Elementos visuais** — onde entram: `letreiro` (título/ênfase), `grafico`, `lista` (itens falados em sequência), `zoom` (momentos de ênfase). Cada um com início, fim, descrição e o texto exato que aparece. Respeite o ESTILO.md.
4. Os tempos são do vídeo original; garanta que não haja sobreposição com cortes.

## Saída: `trabalho/plano.json`
```json
{
  "resumo": "...",
  "cortes": [{"inicio": 12.4, "fim": 15.1, "motivo": "pausa longa"}],
  "elementos": [{"tipo": "letreiro|grafico|lista|zoom", "inicio": 30.0, "fim": 34.0, "descricao": "...", "texto": "..."}]
}
```

## Aprovação (obrigatória)
Depois de salvar, mostre o plano ao usuário em tabela legível (tempo mm:ss, tipo, descrição, motivo) e pergunte se aprova ou quer ajustes. Não crie vídeo, composição HyperFrames nem arquivo em `final/` antes de um "aprovado" explícito. Ajustes: edite o plano.json e mostre de novo.
