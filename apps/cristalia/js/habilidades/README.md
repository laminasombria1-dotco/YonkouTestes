# Habilidades dos monstros

Esta pasta guarda as habilidades **próprias** de cada linha de monstros, para ficar fácil de achar e mudar.
Cada linha tem até dois arquivos:

| Arquivo | O que tem | Quando mexer |
|---|---|---|
| `<linha>.js` | **Só números e textos**: força, recarga, alcance, tamanho, velocidade e as frases do Monstruário | Para balancear (deixar mais forte, mais rápido, maior...) |
| `<linha>-batalha.js` | **Como o golpe funciona e aparece** na batalha: chamas, giros, mãos de sombra... | Para mudar o comportamento ou o visual |

Os golpes que não estão aqui (os de sempre, de cada elemento) continuam em `../dados.js`.

## Linhas com habilidades próprias

### Fogo: linha do Brasito (`brasito.js` e `brasito-batalha.js`)
Brasito (Nv.1) > Brasalobo (Nv.6) > Fornalobo (Nv.12) > Magmalobo (Nv.30)

| Forma | Perto | Disparo | Área |
|---|---|---|---|
| Brasito | Investida | **Lança-Chamas**: jato de fogo da boca, 5 m | **Rabo de Fogo**: gira e bate com o rabo, 3 m |
| Brasalobo | Investida: **+12% de velocidade por 10 s** | Lança-Chamas + **queimadura** | Rabo de Fogo + **queimadura** |
| Fornalobo | Investida: **+20% por 10 s** | **Lança-Chamas Duplo**: 2 jatos em V | Rabo de Fogo com **mini dash** de 3 m |
| Magmalobo | Investida: **+30% por 10 s** | **Lança-Chamas Infernal**: 2 jatos de **14 m** | **Rabo de Magma**: fogo maior, área de 4,5 m |

- A Investida é Normal em todas as formas, como em todos os monstros. A velocidade extra vale só na batalha e aparece em verde embaixo da vida ("Veloz +12%").
- O lança-chamas acerta em 5 pedaços enquanto o jato dura. A queimadura é sorteada **uma vez por alvo** a cada uso (23%). O Rabo de Fogo tem 45%.
- Obstáculos seguram o fogo do lança-chamas.
- Esta linha não ganha o "disparo ×2/×3" das outras: no lugar, ganha o que está na tabela.
- Só a linha do Brasito usa estes golpes. Vulcarapa e os tipos duplos com Fogo continuam com os golpes de Fogo de `dados.js`.

**Exemplos de mudança (em `brasito.js`):**
- Lança-chamas mais longo no Magmalobo: `lancaChamasInfernal` → `jato.alcance`.
- Mais velocidade na Investida: `VELOCIDADE_INVESTIDA` (0,12 = +12%) e `DURACAO_VELOCIDADE` (segundos).
- Rabo maior: `raio` (área) e `tamanhoRabo` (quanto o rabo cresce no giro).

### Trevas: linha do Breuzinho (`trevas-batalha.js`)
Só o **visual** (poça de breu, tentáculos, mãos de sombra, olhos, bocarra, cópias sombrias, morcegos e o Astro Negro). Os números dos golpes de Trevas continuam em `../dados.js` (Mordida Sombria, Bola Sombria, Vazio, Garra Abissal, Sombras, Abismo).

## Como acrescentar outra linha
1. Crie `<linha>.js` com os golpes (no mesmo formato de `brasito.js`).
2. Em `../dados.js`, importe e coloque a linha em `HABILIDADES_DA_LINHA`.
3. Se o golpe funciona de um jeito novo, crie `<linha>-batalha.js` e ligue em `../batalha.js`.
