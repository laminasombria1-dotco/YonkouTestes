// =============================================================
// AS 6 DUNGEONS DO VULCÂNICO (Caldeira de Ignis-Vael), pelo guia e pelas artes do Lâmina
//  Forja Primordial das Correntes · Bacia do Vitriol Esmeralda · Catedral de Obsidiana Espelhada
//  Pináculos do Basalto Partido · Necrópole das Cinzas Silenciosas · Garganta dos Gêiseres
// Cada uma: a entrada, 3 salas com grupo (etapa 0, 1, 2) e a sala do Rei (fim).
// A lava e o ácido ficam embaixo das plataformas e nos buracos: só enfeite (não dá para andar lá).
// =============================================================
import { GEO } from '../dungeon.js';
import { fazerPlano, tema, emVolta, noChao, emCirculo, agua, feixe, brilhos, cristais, coluna, arcoEntre, corrente, hexColuna, estalactite, ponta, bigorna, ponteTabuas, escada, pedra, GEO_OCT, GEO_HEX } from './pecas.js';

const LAVA = '#ff5a14', ACIDO = '#7aff3a';
const lava = (ms, x, y, z, w, l) => agua(ms, LAVA, x, y, z, w, l, 0.95, 1);
const fagulhas = (ms, cx, cz, y0, r, n, cor = '#ffa040') => { const l = []; for (let i = 0; i < n; i++) { const a = ms.rng() * 6.28, d = Math.sqrt(ms.rng()) * r; l.push([cx + Math.cos(a) * d, y0 + ms.rng() * 12, cz + Math.sin(a) * d]); } brilhos(ms, l, cor, 0.5, 0.85, 'fag' + cor); };
const ROCHA = ['#2a2224', '#342a2a', '#221c1e', '#3a3030'];
const QUENTE = tema('#2a1410', '#ffb080', 1.35, 0.45, 22, 95, 'faisca', '#ff9a40');

// ---------- Forja Primordial das Correntes ----------
export const FORJA_CORRENTES = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 9, h: 0, tipo: 'canion', tema: 'boca' },
    { x: 0, z: -46, rx: 6, rz: 20, h: 1, tipo: 'plataforma', fundo: 12, tema: 'aqueduto', etapa: 0 },
    { x: 6, z: -100, r: 16, h: 1, tipo: 'plataforma', fundo: 12, tema: 'patio', etapa: 1 },
    { x: -6, z: -150, rx: 12, rz: 16, h: 2, tipo: 'gruta', tema: 'foles', etapa: 2 },
    { x: 0, z: -204, r: 15, h: 2, tipo: 'plataforma', fundo: 14, tema: 'nucleo', fim: true },
  ],
  corredores: [
    { a: 0, b: 1, larg: 4, tipo: 'plataforma', fundo: 10 }, { a: 1, b: 2, larg: 3, tipo: 'plataforma', fundo: 12 },
    { a: 2, b: 3, larg: 4 }, { a: 3, b: 4, larg: 3, tipo: 'plataforma', fundo: 12 },
  ],
  paredeVisivel: 40,
  temas: { boca: QUENTE, aqueduto: QUENTE, patio: QUENTE, foles: tema('#1e100c', '#ffb878', 1.3, 0.35, 18, 80, 'faisca', '#ffb050'), nucleo: tema('#3a1408', '#ffc090', 1.45, 0.5, 26, 100, 'faisca', '#ffd060') },
  chao: { todos: ['#3a3234', '#2e2828', '#443a38'], foles: ['#4a3a30', '#3e3028'] },
  parede: { todos: ROCHA },
  fundo: ['#ff6a1a', '#ff8a2a', '#e04a10'],
  portao: ['#3a3234', '#ff8a2a'],
  trono: { x: 0, z: -210, ang: 0 },
  mats: { basalto: '#2e2626', ferro: '#3a3438', bronze: '#8a5a2a', lava: '*#ff6a1a', brasa: '*#ffb040', molde: '#4a4040' },
  decorar(ms, M, rng) {
    lava(ms, 0, -9, -110, 160, 260);
    // o aqueduto: as calhas de lava dos lados e os arcos embaixo
    for (const l of [-1, 1]) ms.peca(GEO.caixa, M.lava, l * 5.3, 1.05, -46, 0.8, 0.12, 40, 0, 0, 0, false);
    for (let k = 0; k < 5; k++) { const z = -30 - k * 8; ms.peca(GEO.caixa, M.basalto, 0, -4, z, 7, 10, 1.6, 0, 0, 0, false); }
    // o pátio das bigornas: a plataforma hexagonal e as bigornas e moldes
    ms.peca(GEO_HEX, M.basalto, 6, -4, -100, 34, 10, 34, 0, 0.5, 0, false);
    emCirculo(6, 6, -100, 10, (x, z, a) => (rng() < 0.6 ? bigorna(ms, M.ferro, x, z, 1.3, a) : ms.peca(GEO.caixa, M.molde, x, 0.4, z, 2.4, 0.8, 1.6, 0, a, 0)), 0.3);
    ponteTabuas(ms, { tabua: M.ferro, corda: M.ferro }, { x: 0, z: -66, h: 1 }, { x: 6, z: -84, h: 1 }, 3.6, 0, true);
    // a galeria dos foles: canos de bronze nas paredes que sopram ar quente
    for (let k = 0; k < 6; k++) for (const l of [-1, 1]) { const z = -138 - k * 5; ms.peca(GEO.cil, M.bronze, -6 + l * 13, 4 + (k % 2) * 3, z, 1.4, 6, 1.4, 0, 0, Math.PI / 2 * l * 0.7, false); }
    emVolta(ms, [3], 14, 0.5, 3, (x, z) => ms.peca(GEO.cil, M.bronze, x, 3, z, 1.8, 6, 1.8));
    fagulhas(ms, -6, -150, 2, 12, 60);
    // o núcleo: a plataforma redonda presa por 4 correntes, diante da cascata de lava
    ms.peca(GEO.cil, M.basalto, 0, -3, -204, 31, 10, 31, 0, 0, 0, false);
    for (const [x, z] of [[-12, -194], [12, -194], [-12, -216], [12, -216]]) corrente(ms, M.ferro, [x, 2, z], [x * 2.2, 26, -204 + (z + 204) * 2.2], 14, 0.6);
    ms.peca(GEO.caixa, M.lava, 0, 10, -228, 14, 30, 1.5, 0, 0, 0, false);
    feixe(ms, 0, -226, -9, 34, 7, '#ff8a2a', 0.18);
    fagulhas(ms, 0, -210, 0, 18, 90, '#ffc060');
    ms.peca(GEO.cil, M.ferro, 0, 2.25, -210, 7, 0.5, 7, 0, 0, 0, false);
  },
});

// ---------- Bacia do Vitriol Esmeralda ----------
const VERDE = tema('#2a1418', '#d8ffb0', 1.4, 0.55, 24, 100, 'faisca', '#bfff60');
export const BACIA_VITRIOL = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 9, h: 6, tipo: 'canion', tema: 'topo' },
    { x: 0, z: -46, rx: 10, rz: 20, h: 4, tipo: 'canion', tema: 'fumarolas', etapa: 0 },
    { x: 8, z: -100, r: 15, h: 1, tipo: 'plataforma', fundo: 3, tema: 'travessia', etapa: 1 },
    { x: -6, z: -150, r: 15, h: 1.5, tipo: 'gruta', tema: 'cristais', etapa: 2 },
    { x: 0, z: -204, r: 14, h: 1.5, tipo: 'plataforma', fundo: 3.5, tema: 'altar', fim: true },
  ],
  corredores: [
    { a: 0, b: 1, larg: 4.5, tipo: 'canion' }, { a: 1, b: 2, larg: 3.5, tipo: 'canion' },
    { a: 2, b: 3, larg: 2.4, tipo: 'plataforma', fundo: 3 }, { a: 3, b: 4, larg: 2.4, tipo: 'plataforma', fundo: 3.5 },
  ],
  temas: { topo: tema('#6a2420', '#ffd8b0', 1.6, 0.9, 30, 110), fumarolas: VERDE, travessia: VERDE, cristais: tema('#1a1410', '#fff0a0', 1.4, 0.4, 18, 80, 'faisca', '#ffe060'), altar: tema('#20302a', '#b0fff0', 1.45, 0.5, 22, 95, 'faisca', '#60ffe0') },
  chao: { todos: ['#2a2626', '#342e2c'], travessia: ['#c8a83a', '#a88a2a', '#3a3230'], altar: ['#2a2a2e', '#36343a'] },
  parede: { todos: ['#1e1c1e', '#2a2626', '#c8a83a', '#2e2a28'] },
  fundo: ['#3a5a1a', '#4a6a20'],
  portao: ['#2a2626', '#bfff60'],
  trono: { x: 0, z: -210, ang: 0 },
  mats: { enxofre: '#e0c040', enxofre2: '#c8a02a', cristal: '*#ffe060', cristal2: '*#fff4a0', basalto: '#262224', chama: '~#3fffd0', vapor: '~#e8fff0' },
  decorar(ms, M, rng) {
    agua(ms, ACIDO, 0, -1.1, -150, 120, 170, 0.85, 0.8);
    // as fumarolas: chaminés de enxofre soltando vapor
    const vap = [];
    emVolta(ms, [1, 0], 18, 0.3, 4, (x, z) => { ponta(ms, rng() < 0.5 ? M.enxofre : M.enxofre2, x, z, 2.5 + rng() * 2.5, 1.6); for (let k = 0; k < 6; k++) vap.push([x + (rng() - 0.5), 9 + k * 1.2, z + (rng() - 0.5)]); });
    brilhos(ms, vap, '#e8fff0', 1.2, 0.45, 'vapor');
    // a travessia: ilhotas de crosta e as chamas que dançam no ácido
    emVolta(ms, [2, 4], 26, 1, 14, (x, z) => ms.peca(GEO.dode, rng() < 0.5 ? M.enxofre2 : M.basalto, x, -1.1, z, 3 + rng() * 3, 1, 3 + rng() * 3, 0, rng() * 3, 0, false));
    const fogo = []; for (let i = 0; i < 40; i++) fogo.push([(rng() - 0.5) * 60, -0.4 + rng() * 1.5, -90 - rng() * 130]);
    brilhos(ms, fogo, '#3fffd0', 1.4, 0.7, 'fogoAcido');
    // a gruta dos cristais amarelos
    emVolta(ms, [3], 24, 0.2, 4, (x, z) => cristais(ms, GEO_OCT, M.cristal, M.cristal2, x, z, 1 + rng() * 0.8));
    noChao(ms, 3, 6, 6, (x, z) => cristais(ms, GEO_OCT, M.cristal, M.cristal2, x, z, 0.6, true));
    // o altar: a ilhota de pedra escura com o pilar de fogo ciano
    ms.peca(GEO.dode, M.basalto, 0, -1, -204, 30, 4, 30, 0, 0, 0, false);
    for (let k = 0; k < 5; k++) ms.peca(GEO.cone, M.chama, (rng() - 0.5) * 3, 3 + k * 2.5, -214 + (rng() - 0.5) * 2, 3 - k * 0.4, 6, 3 - k * 0.4, 0, 0, 0, false);
    feixe(ms, 0, -214, 1.5, 26, 3.5, '#3fffd0', 0.2);
    emCirculo(8, 0, -214, 4.5, (x, z) => ponta(ms, M.basalto, x, z, 2 + rng() * 1.5, 1.4, true), 0.4);
  },
});

// ---------- Catedral de Obsidiana Espelhada ----------
const ROXO = tema('#1c1028', '#e8c8ff', 1.6, 0.35, 18, 85, 'faisca', '#ff9040');
const RIO = [...Array(9).keys()].map((i) => ({ x: 6.5, z: -84 - i * 4.8, r: 1.9 }));
export const CATEDRAL_OBSIDIANA = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 9, h: 0, tipo: 'canion', tema: 'boca' },
    { x: 0, z: -46, r: 14, h: -1, tipo: 'gruta', tema: 'tubo', etapa: 0 },
    { x: 0, z: -104, rx: 11, rz: 26, h: -2, tipo: 'gruta', tema: 'nave', etapa: 1, ax: -4 },
    { x: -8, z: -160, r: 15, h: -2, tipo: 'gruta', tema: 'agulhas', etapa: 2 },
    { x: 0, z: -214, r: 16, h: -2, tipo: 'gruta', tema: 'santuario', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 5, tipo: 'canion' }, { a: 1, b: 2, larg: 4.5 }, { a: 2, b: 3, larg: 4.5 }, { a: 3, b: 4, larg: 4.5 }],
  buracos: RIO,
  liquido: '#ff6a1a',
  temas: { boca: tema('#8a8a90', '#f0e8ff', 1.6, 0.9, 30, 110), tubo: ROXO, nave: ROXO, agulhas: ROXO, santuario: tema('#2a0e10', '#ffb090', 1.45, 0.4, 20, 90, 'faisca', '#ffa040') },
  chao: { todos: ['#1c1424', '#241a2e', '#160f1c'], santuario: ['#5a1e10', '#6a2812', '#4a1a10'], boca: ['#6a6a70', '#5a5a60'] },
  parede: { todos: ['#140e1a', '#22182c', '#2e2038', '#100a14'], boca: ['#5a5a60', '#4a4a50', '#6a6a72'] },
  portao: ['#22182c', '#ff8a2a'],
  trono: { x: 0, z: -222, ang: 0 },
  mats: { obsidiana: '#1a1222', obsidiana2: '#3a2850', brilhoRoxo: '*#b080ff', lava: '*#ff6a1a', pedra: '#6a6a70' },
  decorar(ms, M, rng) {
    // a boca do tubo: a "mandíbula" de estalactites e estalagmites de obsidiana
    emCirculo(14, 0, -46, 13, (x, z) => { estalactite(ms, M.obsidiana2, x, z, 14, 4 + rng() * 4, 1.2); ponta(ms, M.obsidiana, x, z, 2 + rng() * 3, 1.3); });
    // a nave: o canal de lava que corre no chão e os reflexos nas paredes de vidro negro
    for (const b of RIO) lava(ms, b.x, -3.2, b.z, 4.4, 5.2);
    const ref = []; for (let i = 0; i < 70; i++) ref.push([(rng() < 0.5 ? -1 : 1) * (11 + rng() * 2), -1 + rng() * 10, -80 - rng() * 50]);
    brilhos(ms, ref, '#ff9040', 0.7, 0.75, 'reflexo');
    emVolta(ms, [2], 20, 0.2, 2, (x, z) => ms.peca(GEO.caixa, M.obsidiana2, x, 4, z, 0.8, 8 + rng() * 4, 2.5, 0, rng() * 3, 0));
    // a abóbada das agulhas: agulhas finas de obsidiana penduradas (e o calor que sobe)
    for (let i = 0; i < 46; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 14; estalactite(ms, rng() < 0.3 ? M.brilhoRoxo : M.obsidiana2, -8 + Math.cos(a) * r, -160 + Math.sin(a) * r, 13 + rng() * 2, 3 + rng() * 5, 0.35); }
    feixe(ms, -8, -160, -2, 14, 10, '#ff7a30', 0.08);
    // o santuário do vidro-de-fogo: o chão vermelho de magma por baixo e as cascatas de lava
    const mg = []; for (let i = 0; i < 110; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 15; mg.push([Math.cos(a) * r, -1.85, -214 + Math.sin(a) * r]); }
    brilhos(ms, mg, '#ff7a20', 1.1, 0.8, 'magma');
    for (const x of [-11, 11]) { ms.peca(GEO.caixa, M.lava, x, 6, -226, 2.4, 16, 0.6, 0, x > 0 ? -0.5 : 0.5, 0, false); feixe(ms, x, -225, -2, 16, 2.4, '#ff8a30', 0.14); }
    ms.peca(GEO.cil, M.obsidiana2, 0, 0.2, -222, 8, 0.4, 8);
  },
});

// ---------- Pináculos do Basalto Partido ----------
const OCRE = tema('#c88a50', '#ffe0b8', 1.7, 1.2, 34, 120, 'faisca', '#ffa040');
export const PINACULOS_BASALTO = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 9, h: 0, tipo: 'aberta', tema: 'base' },
    { x: 0, z: -48, rx: 10, rz: 20, h: 3, tipo: 'aberta', tema: 'escada', etapa: 0 },
    { x: -6, z: -104, r: 16, h: 6, tipo: 'plataforma', fundo: 10, tema: 'plato', etapa: 1 },
    { x: 6, z: -162, r: 13, h: 9, tipo: 'plataforma', fundo: 13, tema: 'borda', etapa: 2 },
    { x: 0, z: -214, r: 15, h: 13, tipo: 'plataforma', fundo: 17, tema: 'coroa', fim: true },
  ],
  corredores: [
    { a: 0, b: 1, larg: 5, tipo: 'aberta' }, { a: 1, b: 2, larg: 4, tipo: 'aberta' },
    { a: 2, b: 3, larg: 2.2, tipo: 'plataforma', fundo: 12 }, { a: 3, b: 4, larg: 3, tipo: 'plataforma', fundo: 15 },
  ],
  paredeVisivel: 40,
  temas: { base: OCRE, escada: OCRE, plato: OCRE, borda: OCRE, coroa: tema('#d89a58', '#fff0d0', 1.8, 1.3, 40, 140, 'faisca', '#ffb050') },
  chao: { todos: ['#3a3434', '#2e2a2a', '#46403e'] },
  parede: { todos: ['#2a2626', '#3a3434', '#ff7a2a', '#221e1e'] },
  fundo: ['#ff6a1a', '#ff8a2a', '#2a2222'],
  portao: ['#2e2a2a', '#ff9a40'],
  trono: { x: 0, z: -222, ang: 0 },
  mats: { basalto: '#2a2626', basalto2: '#3a3434', pomes: '#6a6460', lava: '*#ff6a1a' },
  decorar(ms, M, rng) {
    const LV = -4;
    lava(ms, 0, LV, -130, 150, 220);
    // a escadaria: blocos hexagonais em degraus dos dois lados
    for (let k = 0; k < 9; k++) for (const l of [-1, 1]) hexColuna(ms, k % 2 ? M.basalto : M.basalto2, l * (12 + rng() * 3), -30 - k * 5, 2 + k * 0.8 + rng() * 2, 3.2, false);
    // os pináculos: colunas embaixo de cada plataforma e outras soltas no mar de lava
    for (const [cx, cz, h, r] of [[-6, -104, 6, 16], [6, -162, 9, 13], [0, -214, 13, 15]]) {
      emCirculo(Math.round(r * 0.9), cx, cz, r - 2, (x, z) => hexColuna(ms, rng() < 0.5 ? M.basalto : M.basalto2, x, z, h - LV, 3.6, false, LV));
      ms.peca(GEO_HEX, M.basalto2, cx, (h + LV) / 2, cz, r * 1.7, h - LV, r * 1.7, 0, 0, 0, false);
    }
    emVolta(ms, [2, 3, 4], 50, 4, 30, (x, z) => hexColuna(ms, rng() < 0.5 ? M.basalto : M.basalto2, x, z, 6 + rng() * 16, 2.6 + rng() * 2, false, LV));
    // a ponte de pedra-pomes (o arco poroso sobre o vão)
    arcoEntre(ms, M.pomes, -6, -118, 6, -150, LV, 2.5);
    // a coroa: 7 colunas gigantes no alto
    emCirculo(7, 0, -214, 12, (x, z) => hexColuna(ms, M.basalto2, x, z, 14, 3, true), 0.45);
    const vap = []; for (let i = 0; i < 80; i++) vap.push([(rng() - 0.5) * 70, LV + rng() * 14, -90 - rng() * 140]);
    brilhos(ms, vap, '#ffe0c0', 1.4, 0.35, 'vapor');
    ms.peca(GEO_HEX, M.basalto, 0, 13.2, -222, 8, 0.4, 8, 0, 0, 0, false);
  },
});

// ---------- Necrópole das Cinzas Silenciosas ----------
const CINZA = tema('#8a8a8e', '#e8e8ec', 1.55, 0.7, 20, 85, 'neve', '#c8c8cc');
export const NECROPOLE_CINZAS = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 9, h: 0, tipo: 'aberta', tema: 'cinza' },
    { x: 0, z: -50, rx: 11, rz: 24, h: 0, tipo: 'aberta', tema: 'avenida', etapa: 0 },
    { x: 6, z: -108, r: 16, h: -3, tipo: 'gruta', tema: 'patio', etapa: 1 },
    { x: -4, z: -160, rx: 10, rz: 16, h: -3, tipo: 'gruta', tema: 'arquivos', etapa: 2 },
    { x: 0, z: -212, r: 15, h: -3, tipo: 'gruta', tema: 'brasa', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 5, tipo: 'aberta' }, { a: 1, b: 2, larg: 4 }, { a: 2, b: 3, larg: 4 }, { a: 3, b: 4, larg: 4 }],
  buracos: [{ x: 0, z: -208, r: 3.5 }],
  liquido: '#ff6a1a',
  temas: { cinza: CINZA, avenida: CINZA, patio: tema('#3a3a40', '#d0d0d8', 1.4, 0.3, 16, 75, 'neve', '#9a9aa0'), arquivos: tema('#3a3a44', '#e0e0ea', 1.65, 0.4, 16, 75, 'nenhuma'), brasa: tema('#2a1810', '#ffc8a0', 1.4, 0.3, 18, 80, 'faisca', '#ff9a40') },
  chao: { todos: ['#8a8a8e', '#7a7a80', '#9a9aa0'], patio: ['#4a4a52', '#3e3e46'], arquivos: ['#3a3a42', '#46464e'], brasa: ['#5a5a62', '#4e4e56'] },
  parede: { todos: ['#6a6a70', '#5a5a60', '#7a7a80'], gruta: ['#2a2a30', '#34343a', '#3e3a3a'] },
  portao: ['#5a5a60', '#ffb060'],
  trono: { x: 0, z: -221, ang: 0 },
  mats: { pedra: '#9a9aa0', pedra2: '#6a6a72', branca: '#d8d8dc', vitrificada: '#3a4a5a', estante: '#4a4040', cinzaQueda: '~#b8b8bc', brasa: '*#ff8a30' },
  decorar(ms, M, rng) {
    // a avenida: telhados e frontões meio enterrados na cinza e estátuas de pedra branca
    emVolta(ms, [0, 1], 16, 1, 10, (x, z) => ms.peca(GEO.cone4, M.pedra2, x, 0.5, z, 5 + rng() * 3, 3 + rng() * 2, 6 + rng() * 3, 0, Math.PI / 4 + rng() * 0.3, (rng() - 0.5) * 0.4));
    for (let k = 0; k < 6; k++) for (const l of [-1, 1]) { const x = l * 8.5, z = -32 - k * 7; ms.peca(GEO.caixa, M.branca, x, 1.2, z, 1, 2.4, 0.8); ms.peca(GEO.ico, M.branca, x, 2.9, z, 0.8, 0.9, 0.8); ms.peca(GEO.caixa, M.branca, x + l * 0.4, 2.4, z, 0.3, 1.6, 0.3, 0, 0, l * 0.9); ms.obst(x, z, 0.8); }
    // o pátio subterrâneo: cascatas de cinza que caem do teto rachado, colunas e arcos
    for (const [x, z] of [[-2, -100], [14, -104], [6, -118]]) { ms.peca(GEO.caixa, M.cinzaQueda, x, 8, z, 1.8, 18, 1.8, 0, rng(), 0, false); ms.peca(GEO.ico, M.pedra, x, -2.6, z, 4, 1.2, 4, 0, 0, 0, false); }
    emCirculo(8, 6, -108, 14, (x, z) => coluna(ms, M.pedra2, x, z, 8), 0.2);
    // os arquivos: estantes de pedra derretida dos dois lados
    for (let k = 0; k < 5; k++) for (const l of [-1, 1]) { const z = -150 - k * 5; ms.peca(GEO.caixa, M.estante, -4 + l * 9, 2.5, z, 1.4, 5, 3.6); for (let s = 0; s < 3; s++) ms.peca(GEO.caixa, M.vitrificada, -4 + l * 8.2, 1 + s * 1.5, z, 0.3, 0.4, 3); ms.obst(-4 + l * 9, z, 1.6); }
    // a câmara da brasa eterna: o poço de lava, as estátuas encapuzadas nos nichos e as colunas
    agua(ms, '#ff6a1a', 0, -4.2, -208, 8, 8, 0.95, 1);
    feixe(ms, 0, -208, -3.5, 10, 3, '#ff8a30', 0.15);
    emCirculo(10, 0, -212, 13.5, (x, z) => { coluna(ms, M.pedra2, x, z, 8); }, 0.3);
    emCirculo(5, 0, -212, 11, (x, z, a) => { ms.peca(GEO.cone, M.pedra, x, 1.6, z, 1.4, 3.2, 1.4); ms.peca(GEO.ico, M.pedra, x, 3.3, z, 0.7, 0.8, 0.7); ms.obst(x, z, 0.8); }, Math.PI * 0.7, Math.PI * 0.6);
    emCirculo(3, 0, -208, 3.5, () => {}, 0);
    ms.peca(GEO.cil, M.pedra2, 0, 0.2, -221, 7, 0.4, 7);
  },
});

// ---------- Garganta dos Gêiseres (Ouvido da Cratera) ----------
// uma espiral que desce pela parede da cratera, em volta do lago de magma
const C = { x: 0, z: -120 };
const VAPOR = tema('#3a3438', '#ffd8c0', 1.5, 0.6, 26, 105, 'faisca', '#ffffff');
export const GARGANTA_GEISERES = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 9, h: 10, tipo: 'aberta', tema: 'borda' },
    { x: 0, z: -62, r: 12, h: 10, tipo: 'plataforma', fundo: 18, tema: 'beiral', etapa: 0 },
    { x: 38, z: -112, r: 12, h: 6, tipo: 'plataforma', fundo: 14, tema: 'rampa', etapa: 1 },
    { x: 24, z: -164, r: 12, h: 3, tipo: 'gruta', tema: 'tunel', etapa: 2 },
    { x: -14, z: -150, r: 14, h: 1, tipo: 'plataforma', fundo: 10, tema: 'olho', fim: true },
  ],
  corredores: [
    { a: 0, b: 1, larg: 4, tipo: 'aberta' }, { a: 1, b: 2, larg: 3, tipo: 'plataforma', fundo: 16 },
    { a: 2, b: 3, larg: 3.5 }, { a: 3, b: 4, larg: 3, tipo: 'plataforma', fundo: 10 },
  ],
  buracos: [{ x: -14, z: -150, r: 5.5 }],
  paredeVisivel: 40,
  temas: { borda: tema('#4a4248', '#f0e0d8', 1.6, 0.9, 30, 120, 'faisca', '#ffffff'), beiral: VAPOR, rampa: VAPOR, tunel: tema('#1e1410', '#ffc890', 1.4, 0.35, 16, 75, 'faisca', '#ffa040'), olho: tema('#3a1408', '#ffc090', 1.5, 0.5, 26, 100, 'faisca', '#ffd060') },
  chao: { todos: ['#4a4448', '#3e383c'], beiral: ['#3a3438', '#5a4a40'], rampa: ['#3a3438', '#4a4040'], olho: ['#2e2a2e', '#3a3438'] },
  parede: { todos: ['#2e2a2e', '#3a3438', '#262224'], aberta: ['#3a3438', '#4a4448', '#5a5254'] },
  fundo: ['#ff6a1a', '#ff8a2a', '#2a2224'],
  liquido: '#ff6a1a',
  portao: ['#3a3438', '#ffd060'],
  trono: { x: -24, z: -150, ang: Math.PI / 2 },
  portal: { x: -14, z: -139, ang: 0 },
  mats: { ferro: '#2e2a2e', pedra: '#4a4448', fungo: '*#ff9a30', lava: '*#ff6a1a', vapor: '~#f0f0f0', grade: '#4a3a30' },
  decorar(ms, M, rng) {
    lava(ms, C.x - 6, -8, C.z - 20, 110, 120);
    agua(ms, LAVA, -14, -0.6, -150, 13, 13, 0.95, 1);
    // os gêiseres: colunas de vapor que sobem do fundo (feixes e pontos)
    for (const [x, z] of [[18, -90], [-20, -96], [44, -140], [4, -186], [-36, -126]]) { feixe(ms, x, z, -8, 30, 2.2, '#ffffff', 0.12); ponta(ms, M.pedra, x, z, 3, 3); }
    // os passadiços de ferro com grade (as pontes da espiral)
    ponteTabuas(ms, { tabua: M.grade, tabua2: M.ferro, corda: M.ferro }, { x: 4, z: -73, h: 10 }, { x: 31, z: -103, h: 6 }, 3.4, 0, true);
    ponteTabuas(ms, { tabua: M.grade, tabua2: M.ferro, corda: M.ferro }, { x: 13, z: -162, h: 3 }, { x: -2, z: -154, h: 1 }, 3.4, 0, true);
    // as paredes da cratera em volta (rocha escura com veios de lava)
    emVolta(ms, [1, 2, 4], 30, 6, 30, (x, z) => ms.peca(GEO.dode, rng() < 0.2 ? M.lava : M.pedra, x, -8, z, 5 + rng() * 6, 10 + rng() * 14, 5 + rng() * 6, 0, rng() * 3, 0, false));
    // o túnel de resfriamento: pedra-pomes com os fungos laranja que brilham
    emVolta(ms, [3], 24, 0.2, 3, (x, z) => { ms.peca(GEO.chapeu, M.fungo, x, 1 + rng() * 3, z, 1 + rng(), 0.4, 1 + rng(), Math.PI / 2, rng() * 6, 0); });
    // o olho da caldeira: o anel de ferro em volta do poço de magma, com as correntes
    emCirculo(10, -14, -150, 7, (x, z) => ms.peca(GEO.caixa, M.ferro, x, 1.05, z, 2.2, 0.15, 4.5, 0, Math.atan2(x + 14, z + 150), 0, false));
    for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.6; corrente(ms, M.ferro, [-14 + Math.sin(a) * 12, 1.5, -150 + Math.cos(a) * 12], [-14 + Math.sin(a) * 26, 20, -150 + Math.cos(a) * 26], 12, 0.8); }
    feixe(ms, -14, -150, -1, 14, 4, '#ff9a30', 0.16);
  },
});

export const VULCAO = { forjaCorrentes: FORJA_CORRENTES, vitriol: BACIA_VITRIOL, obsidiana: CATEDRAL_OBSIDIANA, pinaculos: PINACULOS_BASALTO, necropole: NECROPOLE_CINZAS, geiseres: GARGANTA_GEISERES };
