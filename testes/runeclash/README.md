# Testes automáticos do Runeclash

Testes que **abrem o jogo sozinhos** num navegador sem janela, fazem as coisas principais e conferem se nada quebrou. Usam o **Playwright** (uma ferramenta que controla o navegador por código).
Ficam **fora** de `apps/runeclash`: nada daqui vai para o jogo nem pesa no celular.

## O que é testado

| Teste | O que confere | Foto |
|---|---|---|
| Abre na tela de login | O título "Runeclash: Sealstone Legends", o logo e o "Sealstone Legends" | `1-login.png` |
| Conta, novo jogo e jogo salvo | Entra numa conta só do aparelho, começa com o Pedrisco, o mapa tem monstros e o jogo salvo usa as chaves `runeclash-*` (**nenhuma** do Cristalia) | `2-mapa.png` |
| Batalha e captura | Entra numa batalha (com o Brasito) e captura o monstro (com a "captura garantida" do GM, para não depender da sorte) | `3-batalha.png`, `4-captura.png` |
| Monstro invocado e modo treino | Invoca o Faisquinho, passa o controle para ele e usa o golpe de área no treino | `5-treino.png` |
| Material da Arena | Os efeitos e as 66 peças do Blender (`js/arena/`) carregam e aparecem no mapa | `6-arena-vitrine.png` |

Todos os testes também falham se aparecer **qualquer erro** no navegador (menos o 404 do `versao.json`, que é normal no teste local).
As fotos são do tamanho de um celular deitado (844 × 390) e ficam em `testes/runeclash/fotos/`.

## Como rodar

Na primeira vez (dentro de `testes/runeclash`):
```
npm install
```
- **No Windows** os testes usam o **Microsoft Edge** que já vem instalado: não precisa baixar mais nada.
- **No Linux/Mac (e na nuvem)** usam o Chromium do Playwright. Se ele ainda não estiver instalado: `npx playwright install chromium`.
- Para usar outro navegador: `NAVEGADOR=chrome npx playwright test`.

Depois, sempre que quiser testar:
```
npx playwright test
```
- O teste liga sozinho o servidor do jogo (`python -m http.server 8766` em `apps/runeclash`). Se ele já estiver ligado, usa o mesmo.
- Leva uns 20 segundos no PC (pode passar de 1 minuto na nuvem): o 3D é desenhado "por software" (SwiftShader), que é lento, mas funciona igual no PC e na nuvem.
- Para ver o resultado bonito, com as fotos dos testes que falharam: `npx playwright show-report relatorio`.
- Só um teste: `npx playwright test -g "captura"`.

## Como acrescentar um teste

Copie um dos `test(...)` de `testes/jogo.spec.js`. Os ajudantes de `testes/ajuda.js`:
- `vigiarErros(page)` no começo e `semErros(erros)` no fim;
- `abrirJogo(page)`, `entrarLocal(page)`, `novoJogo(page, 'pedrisco')`;
- `esperar(page, ms)` e `foto(page, 'nome')`.

Dentro de `page.evaluate(...)` dá para mexer no jogo por `window.__jogo` (veja "Como testar" no `CLAUDE.md` da raiz).
