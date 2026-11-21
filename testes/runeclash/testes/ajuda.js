// Ajudantes dos testes do Runeclash: abrir o jogo, entrar numa conta, começar um jogo,
// tirar fotos e juntar os erros do navegador.
import { expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FOTOS = join(dirname(fileURLToPath(import.meta.url)), '..', 'fotos');
mkdirSync(FOTOS, { recursive: true });

// Erros que são normais no teste local e não contam
const IGNORAR = [
  /versao\.json/, // só existe no site publicado (o GitHub cria na hora de publicar)
];

// Começa a anotar os erros da página (exceções e console.error). Chame antes de abrir o jogo.
export function vigiarErros(page) {
  const erros = [];
  page.on('pageerror', e => erros.push('EXCEÇÃO: ' + e.message));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const texto = m.text() + ' ' + (m.location()?.url || '');
    if (!IGNORAR.some(r => r.test(texto))) erros.push('CONSOLE: ' + texto);
  });
  return erros;
}

// Abre o jogo e espera ele ficar pronto (window.__jogo só existe depois que o .glb carrega)
export async function abrirJogo(page) {
  await page.goto('/');
  await page.waitForFunction(() => !!window.__jogo, null, { timeout: 60_000 });
}

// Entra numa conta "só neste aparelho" (sem internet, não mexe na nuvem)
export async function entrarLocal(page, nome = 'Teste') {
  await page.evaluate(async n => {
    await window.__jogo.entrarConta({ id: 'local:' + n.toLowerCase(), nome: n, tipo: 'local' });
  }, nome);
}

// Começa um jogo novo com o inicial escolhido e espera o mapa ter monstros
export async function novoJogo(page, inicial = 'pedrisco') {
  await page.evaluate(async i => {
    window.D = await import('./js/dados.js');
    window.__jogo.novoJogo(i);
  }, inicial);
  await page.waitForFunction(() => window.__jogo.modo === 'mundo' && window.__jogo.mundo.selvagens.length > 0, null, {
    timeout: 60_000,
  });
}

// Espera alguns quadros do jogo passarem (o 3D por software é lento, então espera por tempo)
export const esperar = (page, ms) => page.waitForTimeout(ms);

// Foto do tamanho do celular deitado, em testes/runeclash/fotos/<nome>.png
export async function foto(page, nome) {
  await page.screenshot({ path: join(FOTOS, nome + '.png') });
}

// No fim de cada teste: nenhum erro de verdade
export function semErros(erros) {
  expect(erros, 'erros no navegador:\n' + erros.join('\n')).toEqual([]);
}
