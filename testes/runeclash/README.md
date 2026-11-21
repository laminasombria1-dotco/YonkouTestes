# Testes automáticos do Runeclash

Testes que **abrem o jogo sozinhos** num navegador sem janela, fazem as coisas principais e conferem se nada quebrou. Usam o **Playwright** (uma ferramenta que controla o navegador por código).
Ficam **fora** de `apps/runeclash`: nada daqui vai para o jogo nem pesa no celular.

## O que é testado

| Teste | O que confere | Foto |
|---|---|---|
| Abre na tela de login | O título "Runeclash: Sealstone Legends", o logo e o "Sealstone Legends" | `1-login.png` |
| Conta, novo jogo e jogo salvo | Entra numa conta só do aparelho, começa com o Pedrisco, o mapa tem monstros e o jogo salvo usa as chaves `runeclash-*` (**nenhuma** do Cristalia) | `2-mapa.png` |
| Batalha e captura | Entra numa batalha (com o Brasito) e sela o monstro (com a "captura garantida" do GM, para não depender da sorte) | `3-batalha.png`, `4-captura.png` |
| Selamento | Monstro fraco mostra **PODE SER SELADO**; um selo que falha (o sorteio forçado a dar "não"): a pedra aparece ao lado do seu monstro, as correntes prendem, o monstro se solta, a pedra é gasta e some | `5-correntes.png` |
| Invocar com runas | No mapa o companheiro sobe das runas e volta ao tamanho normal; ao guardar, some e os efeitos desligam sozinhos; na batalha o seu monstro sobe das runas, e na troca o novo (Gotinho) também | `9-runas-mapa.png`, `10-runas-troca.png` |
| Fogo do Brasito | Lança-Chamas com o fogo da Arena (o fogo "sólido" aparece e o brilho da boca some no fim do jato) e o Rabo de Fogo até o fim; no modo treino o mesmo fogo funciona | `11-lanca-chamas.png` |
| Raios do Faisquinho | Tempestor: o Choque num marcado (a ligação e o relâmpago da Arena por cima) e as 3 nuvens que soltam raios e somem sozinhas | `12-choque.png` |
| Pedras do Pedrisco | Montanhar: a Cordilheira levanta poeira e os pilares sobem; a Rocha Nevada cai, quica e some | `13-cordilheira.png` |
| Monstro invocado e modo treino | Invoca o Faisquinho, passa o controle para ele e usa o golpe de área no treino | `5-treino.png` |
| Material da Arena | Os efeitos e as 66 peças do Blender (`js/arena/`) carregam e aparecem no mapa | `6-arena-vitrine.png` |
| Invocador | O **Novo jogo** abre o criador com o Aiden escolhido, troca cabelo e penteado, escolhe o parceiro, confere o jogo salvo, ergue a pedra ao invocar o monstro e muda a aparência pelo menu **Aparência** | `7-criador.png`, `8-invocador-mapa.png` |

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
