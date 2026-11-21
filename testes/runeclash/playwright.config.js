// Configuração dos testes do Runeclash (Playwright).
// - Liga sozinho o servidor do jogo (python -m http.server 8766 dentro de apps/runeclash).
//   Se ele já estiver ligado, usa o que já está.
// - Abre o navegador do tamanho de um celular deitado (844 × 390).
//   No Windows usa o Microsoft Edge que já vem instalado (não precisa baixar nada);
//   no Linux/Mac (e na nuvem) usa o Chromium do Playwright (npx playwright install chromium).
//   Para escolher outro: NAVEGADOR=chrome npx playwright test
// - Usa o desenho 3D por software (SwiftShader): funciona igual no PC e na nuvem, mesmo sem placa de vídeo.
import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const PORTA = 8766;
const PYTHON = process.platform === 'win32' ? 'python' : 'python3';

export default defineConfig({
  testDir: './testes',
  outputDir: './resultados',
  timeout: 120_000,          // o 3D por software é lento: cada teste tem até 2 minutos
  expect: { timeout: 30_000 },
  workers: 1,                // um teste por vez (o 3D por software pesa no processador)
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'relatorio', open: 'never' }]],
  use: {
    channel: process.env.NAVEGADOR || (process.platform === 'win32' ? 'msedge' : undefined),
    baseURL: `http://localhost:${PORTA}/`,
    viewport: { width: 844, height: 390 },
    screenshot: 'only-on-failure',
    launchOptions: {
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  webServer: {
    command: `${PYTHON} -m http.server ${PORTA}`,
    cwd: join(AQUI, '..', '..', 'apps', 'runeclash'),
    url: `http://localhost:${PORTA}/`,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
