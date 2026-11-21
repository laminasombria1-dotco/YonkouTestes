// Testes do Runeclash: o básico que nunca pode quebrar.
// Rodar (dentro de testes/runeclash): npx playwright test
// As fotos ficam em testes/runeclash/fotos/.
import { test, expect } from '@playwright/test';
import { vigiarErros, abrirJogo, entrarLocal, novoJogo, esperar, foto, semErros } from './ajuda.js';

test('abre na tela de login com o nome Runeclash', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await expect(page).toHaveTitle('Runeclash: Sealstone Legends');
  await expect(page.locator('#tela-login .logo')).toHaveText('Runeclash');
  await expect(page.locator('#tela-login .lema')).toHaveText('Sealstone Legends');
  await esperar(page, 800);
  await foto(page, '1-login');
  semErros(erros);
});

test('conta, novo jogo e jogo salvo separado do Cristalia', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'pedrisco');
  const info = await page.evaluate(() => {
    window.__jogo.salvar();
    const chaves = Object.keys(localStorage);
    const save = JSON.parse(localStorage.getItem('runeclash-save-v1:local:teste') || 'null');
    return { chaves, inicial: save?.estado?.equipe?.[0]?.especie, selvagens: window.__jogo.mundo.selvagens.length };
  });
  // o jogo salvo usa as chaves do Runeclash, e nenhuma do Cristalia
  expect(info.chaves).toContain('runeclash-save-v1:local:teste');
  expect(info.chaves).toContain('runeclash-contas');
  expect(info.chaves.filter(c => c.startsWith('cristalia'))).toEqual([]);
  expect(info.inicial).toBe('pedrisco');
  expect(info.selvagens).toBeGreaterThan(0);
  await esperar(page, 1500);
  await foto(page, '2-mapa');
  semErros(erros);
});

test('batalha e captura', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'brasito');
  // GM com "captura garantida", para o teste não depender da sorte
  await page.evaluate(async () => {
    await window.__jogo.ativarGM();
    window.__jogo.gm.capturaGarantida = true;
    window.__jogo.iniciarBatalha(window.__jogo.mundo.selvagens[0]);
  });
  await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
  await page.evaluate(() => { window.__jogo.batalha.pensarIA = () => {}; }); // inimigos parados
  await esperar(page, 1500);
  await foto(page, '3-batalha');
  await page.evaluate(() => window.__jogo.batalha.lancarCristal());
  await page.waitForFunction(() => window.__jogo.batalha?.capturados?.length === 1, null, { timeout: 60_000 });
  await foto(page, '4-captura');
  semErros(erros);
});

test('monstro invocado e golpe no modo treino', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'faisquinho');
  await page.evaluate(() => window.__jogo.pet.invocar());
  await esperar(page, 1000);
  expect(await page.evaluate(() => window.__jogo.pet.ativo)).toBe(true);
  await page.evaluate(() => window.__jogo.pet.controlar());
  await esperar(page, 500);
  expect(await page.evaluate(() => !!window.__jogo.pet.treino)).toBe(true);
  await page.evaluate(() => window.__jogo.ctrl.fila.push('golpe2')); // golpe de área (as nuvens do Faisquinho)
  await esperar(page, 1500);
  await foto(page, '5-treino');
  semErros(erros);
});

test('material da Arena carrega no jogo (efeitos e peças do Blender)', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'pedrisco');
  const r = await page.evaluate(async () => {
    const FX = await import('./js/arena/efeitos.js');
    const PC = await import('./js/arena/pecas.js');
    const AL = await import('./js/mapa/altura.js');
    const M = window.__jogo.mundo, j = M.jogador.position, cam = M.camera;
    // direção da câmera para o jogador: tudo aparece na frente dele
    let dx = j.x - cam.position.x, dz = j.z - cam.position.z;
    const d = Math.hypot(dx, dz); dx /= d; dz /= d;
    const ponto = (frente, lado) => ({ x: j.x + dx * frente - dz * lado, z: j.z + dz * frente + dx * lado });
    // peças do Blender em meia-lua
    const lote = new PC.LotePecas();
    ['pinheiro_nevado', 'obelisco', 'cristal_gelo', 'arco_arenito', 'palmeira', 'espinho_vulcao', 'rocha_lava', 'arvore_queimada'].forEach((n, i) => {
      const p = ponto(15, (i - 3.5) * 4.5);
      lote.por(n, PC.colocar(p.x, AL.alturaEm(p.x, p.z), p.z, Math.atan2(-dx, -dz), 1.1));
    });
    const malhas = lote.malhas();
    for (const m of malhas) M.cena.add(m);
    // efeitos: runas, anéis e correntes (o futuro Selamento), relâmpago e espinhos
    const fx = new FX.Efeitos(M.cena, { chao: AL.alturaEm });
    const c = ponto(6, 0), y = AL.alturaEm(c.x, c.z);
    fx.runa(c.x, c.z, 3.2, 0xb48cff, 8, { estilo: 0, giro: 1.2 });
    fx.aneis(c.x, y + 1.6, c.z, 1.8, 0xb48cff, 8, { aperta: 0.4 });
    fx.correntes([j.x, AL.alturaEm(j.x, j.z) + 1.4, j.z], [c.x, y + 1.4, c.z], 3, 0xb48cff, 8, { raio: 0.8 });
    const r = ponto(9, 5), yr = AL.alturaEm(r.x, r.z);
    fx.relampago([r.x + 1, yr + 14, r.z], [r.x, yr, r.z], 0x9fe8ff, 8);
    const e = ponto(9, -5);
    fx.espinhos(e.x, e.z, 2.6, 14, 0x9fdcff, 8, { alto: 2 });
    fx.clarao(c.x, y + 2, c.z, 0xb48cff, 1, 1);
    setInterval(() => fx.atualizar(1 / 30, cam, innerWidth, innerHeight), 33);
    return { pecas: PC.nomesPecas().length, malhas: malhas.length };
  });
  expect(r.pecas).toBe(66);
  expect(r.malhas).toBeGreaterThan(0);
  await esperar(page, 1200);
  await foto(page, '6-arena-vitrine');
  semErros(erros);
});

test('Invocador: criar no Novo jogo e mudar pelo menu Aparência', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  // Novo jogo abre o criador, com o Aiden (padrão) já escolhido
  await page.click('#btn-novo');
  await expect(page.locator('#tela-invocador')).toBeVisible();
  await expect(page.locator('#inv-titulo')).toHaveText('Crie seu Invocador');
  await expect(page.locator('.bola.sel[data-cor="cabelo"]')).toHaveAttribute('data-valor', '#0b0d13');
  // troca o cabelo e o penteado
  await page.click('.bola[data-cor="cabelo"][data-valor="#d8b26a"]');
  await page.click('[data-penteado="1"]');
  await esperar(page, 1200);
  await foto(page, '7-criador');
  await page.click('#inv-pronto');
  // depois vem a escolha do parceiro
  await expect(page.locator('#tela-colecao')).toBeVisible();
  await page.click('#col-escolher');
  await page.waitForFunction(() => window.__jogo.modo === 'mundo', null, { timeout: 60_000 });
  const salvo = await page.evaluate(() => window.__jogo.estado.invocador);
  expect(salvo.cabelo).toBe('#d8b26a');
  expect(salvo.penteado).toBe(1);
  expect(await page.evaluate(() => window.__jogo.mundo.jogador.userData.invocador)).toBe(true);
  // invocar o monstro faz o Invocador erguer a pedra
  await page.evaluate(() => window.__jogo.pet.invocar());
  expect(await page.evaluate(() => window.__jogo.mundo.jogador.userData.conjurar > 0)).toBe(true);
  await esperar(page, 1500);
  await foto(page, '8-invocador-mapa');
  // menu de pausa → Aparência → Aiden → Pronto: volta ao mapa com a aparência padrão salva
  await page.evaluate(() => window.__jogo.abrirMenu());
  await page.click('[data-menu="aparencia"]');
  await expect(page.locator('#inv-titulo')).toHaveText('Aparência do Invocador');
  await page.click('#inv-aiden');
  await page.click('#inv-pronto');
  expect(await page.evaluate(() => window.__jogo.modo)).toBe('mundo');
  const chave = await page.evaluate(() => window.__jogo.chaveSave());
  const doAparelho = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).estado.invocador, chave);
  expect(doAparelho.cabelo).toBe('#0b0d13');
  expect(doAparelho.penteado).toBe(2);
  semErros(erros);
});
