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

test('Selamento: "PODE SER SELADO", correntes e o selo que falha', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'brasito');
  await page.evaluate(() => window.__jogo.iniciarBatalha(window.__jogo.mundo.selvagens[0]));
  await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
  // por enquanto o Invocador não entra na batalha, e a pedra só aparece na hora de selar
  expect(await page.evaluate(() => !!window.__jogo.batalha.selo.pedra)).toBe(false);
  // monstro fraco: aparece "PODE SER SELADO"
  await page.evaluate(() => { const b = window.__jogo.batalha; b.pensarIA = () => {}; b.ini.dados.hp = 1; });
  await expect(page.locator('.placa-ini.selavel .selar')).toBeVisible();
  // um selo que falha (o sorteio sai sempre "não"): correntes, pulsos e o monstro se solta
  const pedras = await page.evaluate(() => window.__jogo.estado.pedras.comum);
  await page.evaluate(() => { const r = Math.random; Math.random = () => 0.999; window.__jogo.batalha.lancarCristal(); Math.random = r; });
  await page.waitForFunction(() => window.__jogo.batalha.selo.ativo?.fase === 'pulsos', null, { timeout: 30_000 });
  expect(await page.evaluate(() => !!window.__jogo.batalha.selo.pedra)).toBe(true); // a pedra flutua perto do seu monstro
  await foto(page, '5-correntes');
  await page.waitForFunction(() => !window.__jogo.batalha.selo.ativo, null, { timeout: 30_000 });
  const depois = await page.evaluate(() => { const b = window.__jogo.batalha; return { captura: b.captura, visivel: b.ini.modelo.visible, selados: b.capturados.length, pedras: window.__jogo.estado.pedras.comum }; });
  expect(depois).toEqual({ captura: null, visivel: true, selados: 0, pedras: pedras - 1 });
  await page.waitForFunction(() => !window.__jogo.batalha.selo.pedra, null, { timeout: 10_000 }); // e depois some
  semErros(erros);
});

test('Invocar com runas: no mapa, ao entrar na batalha e na troca', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'brasito');
  // mapa: o companheiro sobe do círculo de runas e volta ao tamanho normal
  await page.evaluate(() => { window.__jogo.pet.guardar(true); window.__jogo.pet.invocar(); });
  expect(await page.evaluate(() => window.__jogo.pet.surg.subindo(window.__jogo.pet.modelo))).toBe(true);
  await page.waitForFunction(() => !window.__jogo.pet.surg.subindo(window.__jogo.pet.modelo), null, { timeout: 15_000 });
  await foto(page, '9-runas-mapa');
  // guardar: some do mapa (a luz volta para a pedra) e os efeitos param sozinhos depois
  await page.evaluate(() => window.__jogo.pet.guardar());
  expect(await page.evaluate(() => window.__jogo.pet.modelo)).toBe(null);
  await page.waitForFunction(() => !window.__jogo.pet.fx.pontos.visible, null, { timeout: 15_000 });
  // batalha: o seu monstro sobe das runas; na troca, o novo também
  await page.evaluate(() => { const j = window.__jogo; j.estado.equipe.push(window.D.criarMonstro('gotinho', 8)); j.iniciarBatalha(j.mundo.selvagens[0]); });
  await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
  await page.evaluate(() => { window.__jogo.batalha.pensarIA = () => {}; });
  await page.waitForFunction(() => { const b = window.__jogo.batalha; return !b.surgimentos.subindo(b.jog.modelo); }, null, { timeout: 15_000 });
  await page.waitForFunction(() => window.__jogo.batalha.trocaCd <= 0, null, { timeout: 15_000 });
  await page.evaluate(() => window.__jogo.batalha.trocar(false));
  const troca = await page.evaluate(() => { const b = window.__jogo.batalha; return { esp: b.jog.dados.especie, subindo: b.surgimentos.subindo(b.jog.modelo) }; });
  expect(troca).toEqual({ esp: 'gotinho', subindo: true });
  await esperar(page, 300);
  await foto(page, '10-runas-troca');
  await page.waitForFunction(() => { const b = window.__jogo.batalha; return !b.surgimentos.subindo(b.jog.modelo) && Math.abs(b.jog.modelo.scale.x - 1) < 1e-6; }, null, { timeout: 15_000 });
  semErros(erros);
});

test('Brasito: o fogo da Arena no Lança-Chamas e no Rabo de Fogo (batalha e treino)', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'brasito');
  await page.evaluate(() => window.__jogo.iniciarBatalha(window.__jogo.mundo.selvagens[0]));
  await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
  await page.evaluate(() => { window.__jogo.batalha.pensarIA = () => {}; });
  await esperar(page, 1200);
  // Lança-Chamas: o fogo "sólido" e o brilho na boca aparecem; quando o jato acaba, o brilho some
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 1, b.ini); });
  await page.waitForFunction(() => !!window.__jogo.batalha.jog.jato, null, { timeout: 10_000 });
  await esperar(page, 200);
  expect(await page.evaluate(() => window.__jogo.batalha.fx.F.vivas)).toBeGreaterThan(0);
  await foto(page, '11-lanca-chamas');
  await page.waitForFunction(() => !window.__jogo.batalha.jog.jato, null, { timeout: 10_000 });
  // Rabo de Fogo: gira com a roda de fogo e termina
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 2, b.ini); });
  await page.waitForFunction(() => !!window.__jogo.batalha.jog.giro, null, { timeout: 10_000 });
  await page.waitForFunction(() => !window.__jogo.batalha.jog.giro, null, { timeout: 10_000 });
  await page.evaluate(() => window.__jogo.batalha.fugir());
  await page.waitForFunction(() => window.__jogo.modo === 'mundo', null, { timeout: 30_000 });
  // no modo treino (no mapa) o mesmo fogo funciona
  await page.evaluate(() => { const p = window.__jogo.pet; p.invocar(); p.controlar(); window.__jogo.ctrl.fila.push('golpe1'); });
  await page.waitForFunction(() => (window.__jogo.pet.treino?.fx.F.vivas || 0) > 0, null, { timeout: 10_000 });
  semErros(erros);
});

test('Faisquinho: relâmpagos da Arena no Choque e nas nuvens', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'faisquinho');
  await page.evaluate(() => { const j = window.__jogo; j.estado.equipe = [window.D.criarMonstro('tempestor', 35)]; j.iniciarBatalha(j.mundo.selvagens[0]); });
  await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
  // sem dano: o Tempestor (Nv.35) derrubaria o selvagem e a luta acabaria antes do fim do teste
  await page.evaluate(() => { const b = window.__jogo.batalha; b.pensarIA = () => {}; b.aplicarDano = () => false; });
  await esperar(page, 1200);
  // Choque num marcado: a ligação sólida e o relâmpago da Arena por cima
  await page.evaluate(() => {
    const b = window.__jogo.batalha; b.faisquinho.marcar(b.ini);
    b.jog.choque = { gp: b.jog.golpe(1), t: 4 }; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 1, b.ini);
  });
  expect(await page.evaluate(() => !!window.__jogo.batalha.jog.feixe)).toBe(true);
  await page.waitForFunction(() => window.__jogo.batalha.fx.temp.length > 0, null, { timeout: 10_000 });
  await foto(page, '12-choque');
  await page.waitForFunction(() => !window.__jogo.batalha.jog.feixe, null, { timeout: 10_000 });
  // as nuvens soltam raios e somem sozinhas
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 2, b.ini); });
  await page.waitForFunction(() => window.__jogo.batalha.faisquinho.nuvens.length === 3, null, { timeout: 10_000 });
  await page.waitForFunction(() => window.__jogo.batalha.faisquinho.nuvens.length === 0, null, { timeout: 20_000 });
  semErros(erros);
});

test('Pedrisco: poeira, rachaduras e pilares com os efeitos da Arena', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'pedrisco');
  await page.evaluate(() => { const j = window.__jogo; j.estado.equipe = [window.D.criarMonstro('montanhar', 35)]; j.iniciarBatalha(j.mundo.selvagens[0]); });
  await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
  // sem dano: o Montanhar (Nv.35) derrubaria o selvagem e a luta acabaria antes do fim do teste
  await page.evaluate(() => { const b = window.__jogo.batalha; b.pensarIA = () => {}; b.aplicarDano = () => false; });
  await esperar(page, 1200);
  // Cordilheira: o tremor levanta poeira ("sólida") e os pilares sobem
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 2, b.ini); });
  await page.waitForFunction(() => window.__jogo.batalha.pedrisco.pilares.length > 0, null, { timeout: 10_000 });
  expect(await page.evaluate(() => window.__jogo.batalha.fx.F.vivas)).toBeGreaterThan(0);
  await foto(page, '13-cordilheira');
  // Rocha Nevada: cai, quica e some
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 1, b.ini); });
  await page.waitForFunction(() => window.__jogo.batalha.pedrisco.pedras.length > 0, null, { timeout: 10_000 });
  await page.waitForFunction(() => window.__jogo.batalha.pedrisco.pedras.length === 0, null, { timeout: 10_000 });
  semErros(erros);
});

test('Gotinho: borrifos, coluna de água e o escudo que se parte', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'gotinho');
  await page.evaluate(() => { const j = window.__jogo; j.estado.equipe = [window.D.criarMonstro('tsunamar', 35)]; j.iniciarBatalha(j.mundo.selvagens[0]); });
  await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
  // sem dano: o Tsunamar (Nv.35) derrubaria o selvagem e a luta acabaria antes do fim do teste
  await page.evaluate(() => { const b = window.__jogo.batalha; b.pensarIA = () => {}; b.aplicarDano = () => false; });
  await esperar(page, 1200);
  // Maremoto: o anel cresce com espuma da Arena e some
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 2, b.ini); });
  await page.waitForFunction(() => window.__jogo.batalha.gotinho.aneis.length > 0, null, { timeout: 10_000 });
  expect(await page.evaluate(() => window.__jogo.batalha.fx.F.vivas)).toBeGreaterThan(0);
  await foto(page, '14-maremoto');
  await page.waitForFunction(() => window.__jogo.batalha.gotinho.aneis.length === 0, null, { timeout: 10_000 });
  // Hidrocanhão: sai e acerta (ou bate) e acaba
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 1, b.ini); });
  await page.waitForFunction(() => window.__jogo.batalha.projeteis.length > 0, null, { timeout: 10_000 });
  await page.waitForFunction(() => window.__jogo.batalha.projeteis.length === 0, null, { timeout: 10_000 });
  // Escudo d'Água: ganha com a Investida e se parte
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.jog.esperaEscudo = 0; b.tentarGolpe(b.jog, 0, b.ini); });
  await page.waitForFunction(() => !!window.__jogo.batalha.jog.escudo, null, { timeout: 10_000 });
  await page.evaluate(() => { const b = window.__jogo.batalha; b.gotinho.estourarEscudo(b.jog); });
  expect(await page.evaluate(() => window.__jogo.batalha.jog.escudo)).toBe(null);
  semErros(erros);
});

test('Musguinho: raízes que racham o chão, vinha e o Bosque Vivo com vaga-lumes', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'musguinho');
  await page.evaluate(() => { const j = window.__jogo; j.estado.equipe = [window.D.criarMonstro('florestral', 35)]; j.iniciarBatalha(j.mundo.selvagens[0]); });
  await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
  // sem dano: o Florestral (Nv.35) derrubaria o selvagem e a luta acabaria antes do fim do teste
  await page.evaluate(() => { const b = window.__jogo.batalha; b.pensarIA = () => {}; b.aplicarDano = () => false; });
  await esperar(page, 1200);
  // Bosque Vivo: brota com raízes e terra da Arena e fica no chão
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 2, b.ini); });
  await page.waitForFunction(() => window.__jogo.batalha.musguinho.zonas.length > 0, null, { timeout: 10_000 });
  expect(await page.evaluate(() => window.__jogo.batalha.fx.F.vivas)).toBeGreaterThan(0);
  await esperar(page, 600);
  await foto(page, '15-bosque');
  // Vinha Agarradora: estica e recolhe
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 0, b.ini); });
  await page.waitForFunction(() => !!window.__jogo.batalha.jog.vinha, null, { timeout: 10_000 });
  await page.waitForFunction(() => !window.__jogo.batalha.jog.vinha, null, { timeout: 10_000 });
  // e o bosque some sozinho
  await page.waitForFunction(() => window.__jogo.batalha.musguinho.zonas.length === 0, null, { timeout: 15_000 });
  semErros(erros);
});

test('Solito: o sol que brilha, o laser e a Supernova com os efeitos da Arena', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'musguinho');
  await page.evaluate(() => { const j = window.__jogo; j.estado.equipe = [window.D.criarMonstro('astrorei', 35)]; j.iniciarBatalha(j.mundo.selvagens[0]); });
  await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
  // sem dano: o Astrorei (Nv.35) derrubaria o selvagem e a luta acabaria antes do fim do teste
  await page.evaluate(() => { const b = window.__jogo.batalha; b.pensarIA = () => {}; b.aplicarDano = () => false; });
  await esperar(page, 1200);
  const golpe = (i) => page.evaluate((i) => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, i, b.ini); }, i);
  // Sol Rei: nasce com o brilho da Arena em volta
  await golpe(0);
  await page.waitForFunction(() => !!window.__jogo.batalha.jog.sol, null, { timeout: 10_000 });
  // Laser Real (o sol atira junto)
  await esperar(page, 400);
  await golpe(1);
  await esperar(page, 400);
  // Supernova: o calor fica em volta e explode no fim
  await golpe(2);
  await page.waitForFunction(() => !!window.__jogo.batalha.jog.calor, null, { timeout: 10_000 });
  expect(await page.evaluate(() => window.__jogo.batalha.fx.F.vivas)).toBeGreaterThan(0);
  await page.waitForFunction(() => !window.__jogo.batalha.jog.calor, null, { timeout: 15_000 });
  await esperar(page, 150);
  await foto(page, '16-supernova');
  semErros(erros);
});

test('Qualidade: no Fraco os efeitos saem mais leves, e mudar no menu vale na hora', async ({ page }) => {
  const erros = vigiarErros(page);
  await page.addInitScript(() => { try { if (!sessionStorage.getItem('q')) { localStorage.setItem('runeclash-qualidade', 'fraco'); sessionStorage.setItem('q', '1'); } } catch {} });
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'brasito');
  const entrar = async () => {
    await page.evaluate(() => { const j = window.__jogo; j.estado.equipe = [window.D.criarMonstro('magmalobo', 35)]; j.iniciarBatalha(j.mundo.selvagens[0]); });
    await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.ini, null, { timeout: 30_000 });
    await page.evaluate(() => { const b = window.__jogo.batalha; b.pensarIA = () => {}; b.aplicarDano = () => false; });
  };
  await entrar();
  // Fraco: menos partículas (e maiores), limite menor e sem luzes
  expect(await page.evaluate(() => { const fx = window.__jogo.batalha.fx; return [fx.taxa < 1, fx.tamQ > 1, fx.P.n, fx.luzes.length]; })).toEqual([true, true, 2500, 0]);
  await esperar(page, 800);
  await page.evaluate(() => { const b = window.__jogo.batalha; b.jog.rec = [0, 0, 0]; b.tentarGolpe(b.jog, 1, b.ini); });
  await esperar(page, 500);
  expect(await page.evaluate(() => window.__jogo.batalha.fx.F.vivas)).toBeGreaterThan(0);
  // Fraco → Médio no menu: os efeitos saem inteiros na hora
  await page.evaluate(() => window.__jogo.trocarQualidade());
  expect(await page.evaluate(() => [window.__jogo.batalha.fx.taxa, window.__jogo.batalha.qfx.malhas])).toEqual([1, 1]);
  // Médio → Forte: na próxima batalha, os clarões têm luz de verdade
  await page.evaluate(() => window.__jogo.trocarQualidade());
  await page.evaluate(() => window.__jogo.batalha.fugir());
  await page.waitForFunction(() => window.__jogo.modo === 'mundo', null, { timeout: 20_000 });
  await entrar();
  expect(await page.evaluate(() => window.__jogo.batalha.fx.luzes.length)).toBe(2);
  // volta para o Fraco (a ordem é Fraco → Médio → Forte → Fraco)
  await page.evaluate(() => window.__jogo.trocarQualidade());
  expect(await page.evaluate(() => window.__jogo.batalha.fx.taxa)).toBeLessThan(1);
  semErros(erros);
});

test('Mapa: as peças da Arena nos biomas (pinheiros nevados, obeliscos, palmeiras, rochas de lava)', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'pedrisco');
  // vai até cada bioma e conta as malhas das peças da Arena (os "lotes", uma por material)
  const lotes = await page.evaluate(async () => {
    const G = await import('./js/mapa/gerador.js');
    const m = window.__jogo.mundo, achou = {};
    for (const id of ['planta', 'terra', 'raio', 'fogo']) {
      const b = G.centroDe(id), x = b.x * 0.8, z = b.z * 0.8;
      m.pos.set(x, 0, z); m.chunks.carregarTudoPerto(x, z);
      const nomes = new Set();
      m.chunks.grupo.traverse((o) => { if (o.name.startsWith('lote_')) nomes.add(o.name.slice(5)); });
      achou[id] = [...nomes];
    }
    return achou;
  });
  expect(lotes.raio).toContain('neve');     // pinheiro nevado e cristal de gelo
  expect(lotes.terra).toContain('arenito'); // rochas, obeliscos e arcos de arenito
  expect(lotes.fogo).toContain('luz_lava'); // rochas de lava e espinhos de basalto
  expect(lotes.planta).toContain('folha');  // pinheiros da Arena
  semErros(erros);
});

test('Ruínas rúnicas: um círculo e um altar em cada bioma, no seco, com a runa no chão', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'pedrisco');
  const r = await page.evaluate(async () => {
    const G = await import('./js/mapa/gerador.js');
    const A = await import('./js/mapa/altura.js');
    const ru = G.POIS.filter((p) => p.tipo === 'circulo' || p.tipo === 'altar');
    const m = window.__jogo.mundo, p0 = ru[0];
    m.pos.set(p0.x, 0, p0.z); m.chunks.carregarTudoPerto(p0.x, p0.z);
    let runas = 0; m.chunks.grupo.traverse((o) => { if (o.isMesh && o.material.map && o.material.color.getHexString() === 'b98cff') runas++; });
    return {
      n: ru.length,
      biomas: new Set(ru.map((p) => p.bioma)).size,
      secos: ru.every((p) => A.alturaEm(p.x, p.z) > G.NIVEL_AGUA + 0.3 && !G.lagoEm(p.x, p.z, 2)),
      altarComCristal: G.SEGREDOS.length >= ru.filter((p) => p.tipo === 'altar').length,
      runas,
    };
  });
  expect(r.n).toBe(8);
  expect(r.biomas).toBe(4);
  expect(r.secos).toBe(true);
  expect(r.altarComCristal).toBe(true);
  expect(r.runas).toBeGreaterThan(0);
  semErros(erros);
});

test('Arenas de batalha com os temas da Arena (Ruínas, Dunas, Lago Congelado, Cratera)', async ({ page }) => {
  const erros = vigiarErros(page);
  await abrirJogo(page);
  await entrarLocal(page);
  await novoJogo(page, 'brasito');
  const r = [];
  for (const [zona, marco] of [['campo', 'musgo'], ['terra', 'arenito'], ['raio', 'gelo'], ['fogo', 'luz_lava'], ['agua', null]]) {
    await page.evaluate((zona) => {
      const j = window.__jogo; if (j.modo === 'batalha') { j.batalha.fugir(); j.batalha = null; }
      j.modo = 'mundo'; const s = j.mundo.selvagens[0]; s.zona = zona; j.iniciarBatalha(s);
    }, zona);
    await page.waitForFunction(() => window.__jogo.modo === 'batalha' && !!window.__jogo.batalha?.arena);
    r.push(await page.evaluate(([zona, marco]) => {
      const a = window.__jogo.batalha.arena, nomes = new Set();
      a.cena.traverse((o) => { if (o.isMesh && o.name.startsWith('lote_')) nomes.add(o.name.slice(5)); });
      return { zona, tema: !!a.tema, piso: nomes.has('piso'), marco: marco ? nomes.has(marco) : true, obst: a.obstaculos.length };
    }, [zona, marco]));
  }
  for (const x of r.slice(0, 4)) expect(x).toEqual({ zona: x.zona, tema: true, piso: true, marco: true, obst: x.obst });
  for (const x of r) expect(x.obst).toBeGreaterThan(0);
  expect(r[4].tema).toBe(false); // a Margem do Lago fica como era
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
