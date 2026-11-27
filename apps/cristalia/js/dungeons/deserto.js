// =============================================================
// AS 6 DUNGEONS DO DESERTO (Areias de Djeser-Ra), pelo guia e pelas artes do Lâmina
//  Pirâmide do Espelho Solar · Hipogeu dos Escribas Azuis · Templo da Ampulheta Seca
//  Avenida das Esfinges Soterradas · Cisterna Secreta do Oásis · Doca das Barcas Solares
// =============================================================
import { GEO } from '../dungeon.js';
import { fazerPlano, tema, emVolta, noChao, emCirculo, agua, feixe, brilhos, coluna, arcoEntre, corrente, palmeira, obelisco, esfinge, anfora, barca, escada, ponteTabuas, pedra } from './pecas.js';

const SOL = tema('#f0c890', '#fff0d0', 1.8, 1.4, 36, 130, 'poeira', '#f0d8a0');
const DENTRO = tema('#3a2a1a', '#ffe0b0', 1.55, 0.5, 20, 90, 'faisca', '#ffd080');
const AREIA = ['#e8c888', '#dcb878', '#f0d498'];
const MORRO = ['#d8b070', '#c89a5a', '#e2bc80', '#b88a4a'];
const PEDRA = ['#c8a878', '#b8986a', '#d2b484'];
const ESC = ['#8a6a48', '#7a5c3e', '#6a4e34'];
const poeira = (ms, cx, cz, y, r, n) => { const l = []; for (let i = 0; i < n; i++) { const a = ms.rng() * 6.28, d = Math.sqrt(ms.rng()) * r; l.push([cx + Math.cos(a) * d, y + ms.rng() * 10, cz + Math.sin(a) * d]); } brilhos(ms, l, '#ffe8b0', 0.4, 0.7, 'poeira'); };
// coluna de papiro pintada (azul e ouro), como nas artes
function colunaPapiro(ms, M, x, z, alt, e = 1, y = 0, chao = true) {
  ms.peca(GEO.caixa, M.calc, x, y + 0.3 * e, z, 2 * e, 0.6 * e, 2 * e, 0, 0, 0, chao);
  ms.peca(GEO.cil, M.calc, x, y + alt / 2, z, 1.3 * e, alt, 1.3 * e, 0, 0, 0, chao);
  for (const t of [0.12, 0.62]) ms.peca(GEO.cil, M.azul, x, y + alt * t, z, 1.4 * e, alt * 0.12, 1.4 * e, 0, 0, 0, chao);
  ms.peca(GEO.cil, M.ouro, x, y + alt * 0.7, z, 1.42 * e, 0.25 * e, 1.42 * e, 0, 0, 0, chao);
  ms.peca(GEO.cone, M.azul, x, y + alt + 0.4 * e, z, 2.4 * e, 1.6 * e, 2.4 * e, Math.PI, 0, 0, chao);
  ms.peca(GEO.caixa, M.calc, x, y + alt + 1.3 * e, z, 2.2 * e, 0.4 * e, 2.2 * e, 0, 0, 0, chao);
  if (chao) ms.obst(x, z, 0.9 * e);
}
const MATS = { calc: '#ecdcb4', calc2: '#d8c494', azul: '#2a4ab8', ouro: '*#e8b838', arenito: '#c8784a', basalto: '#1e1e24', turquesa: '*#3ad8c8', cedro: '#6a4a2e', barro: '#b86a3a', tocha: '*#ffb040', areia: '#e8c888', palma: '#5a9a3a' };

// ---------- Pirâmide do Espelho Solar ----------
export const PIRAMIDE_ESPELHO = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'dunas' },
    { x: 0, z: -50, rx: 10, rz: 20, h: 2, tipo: 'aberta', tema: 'rampa', etapa: 0 },
    { x: 0, z: -102, rx: 6, rz: 18, h: 4, tipo: 'gruta', tema: 'dutos', etapa: 1 },
    { x: 0, z: -152, r: 17, h: 6, tipo: 'gruta', tema: 'espelhos', etapa: 2 },
    { x: 0, z: -204, r: 12, h: 10, tipo: 'gruta', tema: 'pyramidion', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 5, tipo: 'aberta' }, { a: 1, b: 2, larg: 3 }, { a: 2, b: 3, larg: 3.5 }, { a: 3, b: 4, larg: 3.5 }],
  temas: { dunas: SOL, rampa: SOL, dutos: tema('#4a3a24', '#fff0c8', 1.6, 0.6, 20, 85, 'poeira', '#ffe8b0'), espelhos: tema('#5a4428', '#fff4d0', 1.7, 0.7, 24, 95, 'faisca', '#ffe070'), pyramidion: tema('#8a6420', '#fff0b0', 1.85, 0.9, 26, 100, 'faisca', '#ffd040') },
  chao: { dunas: AREIA, rampa: ['#ece0c4', '#e0d2b2'], todos: ['#ecdcb4', '#e0d0a6'], pyramidion: ['#f0d070', '#e8c060'] },
  parede: { aberta: MORRO, todos: ['#d8c8a0', '#ccbc94', '#e2d2ac'] },
  portao: ['#ecdcb4', '#ffd040'], porta: ['#ecdcb4', '#ffd040'],
  trono: { x: 0, z: -208, ang: 0 },
  mats: { ...MATS, bronze: '*#c8883a', espelho: '#fff4d0' },
  decorar(ms, M, rng) {
    // a pirâmide por fora: os degraus de calcário com a ponta dourada lá no fundo
    for (let k = 0; k < 7; k++) ms.peca(GEO.cone4, k ? M.calc : M.calc2, 0, -2 + k * 6, -150, 150 - k * 20, 6, 150 - k * 20, 0, Math.PI / 4, 0, false);
    ms.peca(GEO.cone4, M.ouro, 0, 44, -150, 30, 14, 30, 0, Math.PI / 4, 0, false);
    // a rampa da esfinge partida e as dunas
    esfinge(ms, M.calc2, -11, -42, 1.3, Math.PI, 0.5);
    ms.peca(GEO.caixa, M.calc2, 11, 1.4, -48, 1.6, 2.8, 2, 0.3, 0, 0.5);
    escada(ms, M.calc, 0, -32, 0, 0, -68, 2.2, 9, 14);
    // o corredor dos dutos: feixes de sol inclinados descendo do teto
    for (let k = 0; k < 6; k++) feixe(ms, 0, -88 - k * 6, 4, 14, 1, '#fff2b0', 0.2, 0.35);
    poeira(ms, 0, -102, 4, 6, 50);
    // a câmara dos espelhos de bronze: os discos que mandam a luz para o alto
    emCirculo(6, 0, -152, 13, (x, z, a) => { ms.peca(GEO.cil, M.calc2, x, 1.5, z, 1, 3, 1); ms.peca(GEO.cil, M.bronze, x, 4.6, z, 4, 0.3, 4, Math.PI / 2 - 0.4, a, 0); feixe(ms, x * 0.5, -152 + (z + 152) * 0.5, 9, 14, 1.2, '#fff0a0', 0.12, 0.2); ms.obst(x, z, 1); }, 0.5);
    emVolta(ms, [3, 2], 14, 0.2, 1.5, (x, z) => ms.peca(GEO.caixa, M.azul, x, 4, z, 0.4, 2, 3, 0, Math.atan2(x, z + 152), 0));
    // o santuário do pyramidion: banhado em luz âmbar
    feixe(ms, 0, -204, 10, 22, 8, '#ffd060', 0.22);
    poeira(ms, 0, -204, 10, 10, 70);
    ms.peca(GEO.cil, M.ouro, 0, 0.2, -208, 6, 0.4, 6);
  },
});

// ---------- Hipogeu dos Escribas Azuis ----------
export const HIPOGEU_ESCRIBAS = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 6, tipo: 'canion', tema: 'penhasco' },
    { x: 0, z: -50, rx: 7, rz: 20, h: 2, tipo: 'gruta', tema: 'escadaria', etapa: 0 },
    { x: 0, z: -110, rx: 17, rz: 22, h: 0, tipo: 'gruta', tema: 'hipostilo', etapa: 1 },
    { x: 12, z: -164, r: 12, h: 0, tipo: 'gruta', tema: 'biblioteca', etapa: 2 },
    { x: -2, z: -210, rx: 12, rz: 15, h: 0, tipo: 'gruta', tema: 'cripta', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 3.5, tipo: 'canion' }, { a: 1, b: 2, larg: 3.5 }, { a: 2, b: 3, larg: 3.5 }, { a: 3, b: 4, larg: 3.5 }],
  temas: { penhasco: tema('#e8b888', '#fff0d8', 1.8, 1.3, 34, 120, 'poeira', '#f0c890'), escadaria: tema('#5a3a22', '#ffd8a0', 1.6, 0.5, 20, 85, 'poeira', '#ffd890'), hipostilo: DENTRO, biblioteca: DENTRO, cripta: tema('#101838', '#c8d0ff', 1.45, 0.35, 20, 85, 'faisca', '#ffe070') },
  chao: { penhasco: AREIA, escadaria: ['#e0c088', '#d4b47a', '#c8a878'], todos: ['#d8c8a4', '#ccbc98'], cripta: ['#c8b894', '#bcac88'] },
  parede: { canion: ['#c8784a', '#b8683e', '#d48858'], todos: ['#a0784a', '#8a6a42', '#b48a58'] },
  portao: ['#d8c8a4', '#4a6aff'], porta: ['#ecdcb4', '#ffb040'],
  trono: { x: -2, z: -218, ang: 0 },
  mats: { ...MATS, estrela: '*#ffe070', noite: '#16204a', escuro: '#2a2018', estante: '#6a4a2e', rolo: '#e8d8b0' },
  decorar(ms, M, rng) {
    // o portal do disco alado entalhado no paredão de arenito
    ms.peca(GEO.caixa, M.calc, 0, 10, -16, 14, 12, 2, 0, 0, 0, false);
    ms.peca(GEO.caixa, M.escuro, 0, 7.4, -15, 5, 7, 2.2, 0, 0, 0, false);
    ms.peca(GEO.ico, M.ouro, 0, 14.6, -14.8, 1.3, 1.3, 0.5, 0, 0, 0, false);
    for (const l of [-1, 1]) ms.peca(GEO.caixa, M.ouro, l * 2.8, 14.6, -14.8, 4, 0.7, 0.3, 0, 0, l * 0.25, false);
    // a escadaria soterrada (a rampa de areia escorrendo pelos degraus)
    escada(ms, M.calc2, 0, -32, 5, 0, -68, 2, 8, 16);
    ms.peca(GEO.dode, M.areia, -2.5, 3, -42, 4, 2, 10, 0.3, 0, 0, false);
    // o salão hipostilo: colunas de papiro azul e ouro, braseiros e os hieróglifos
    for (const lx of [-11, -4, 4, 11]) for (const lz of [-12, 0, 12]) { if (Math.abs(lx) < 5 && lz === 0) continue; colunaPapiro(ms, M, lx, -110 + lz, 8, 1.2); }
    for (const l of [-1, 1]) for (let k = 0; k < 4; k++) ms.peca(GEO.caixa, M.azul, l * 17.4, 5, -128 + k * 12, 0.3, 1.2, 9, 0, 0, 0, false);
    const tochas = [];
    emCirculo(6, 0, -110, 15, (x, z) => { ms.peca(GEO.cil, M.escuro, x, 0.9, z, 0.3, 1.8, 0.3); ms.peca(GEO.cone, M.tocha, x, 2.2, z, 0.7, 1, 0.7); tochas.push([x, 2.2, z]); });
    // a biblioteca dos escribas: estantes com rolos de papiro
    emCirculo(6, 12, -164, 10.5, (x, z, a) => { ms.peca(GEO.caixa, M.estante, x, 2, z, 3, 4, 1, 0, a, 0); for (let s = 0; s < 3; s++) ms.peca(GEO.cil, M.rolo, x, 0.9 + s * 1.2, z, 0.3, 2.2, 0.3, 0, a, Math.PI / 2); ms.obst(x, z, 1.4); }, 0.4);
    // a cripta: teto azul-noite estrelado em ouro e o sarcófago de basalto aberto
    const est = []; for (let i = 0; i < 90; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 12; est.push([-2 + Math.cos(a) * r, 12 + rng() * 2, -210 + Math.sin(a) * r]); }
    brilhos(ms, est, '#ffe070', 0.6, 0.9, 'estrela');
    ms.peca(GEO.disco, M.noite, -2, 11.5, -210, 13, 1, 15, Math.PI, 0, 0, false);
    ms.peca(GEO.caixa, M.basalto, -2, 0.7, -224, 2.6, 1.4, 5, 0, 0, 0); ms.obst(-2, -224, 2);
    ms.peca(GEO.caixa, M.basalto, 0.4, 1.5, -224, 2.4, 0.3, 5, 0, 0, 0.5);
    emCirculo(6, -2, -214, 9, (x, z) => { anfora(ms, M.barro, x, z, 0.8); ms.peca(GEO.cone, M.tocha, x, 3, z, 0.5, 0.8, 0.5); tochas.push([x, 3, z]); }, Math.PI * 0.6, Math.PI * 0.8);
    brilhos(ms, tochas, '#ffb040', 2.2, 0.7, 'tocha');
  },
});

// ---------- Templo da Ampulheta Seca ----------
export const TEMPLO_AMPULHETA = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'dunas' },
    { x: 0, z: -50, r: 16, h: 0, tipo: 'aberta', tema: 'patio', etapa: 0 },
    { x: -6, z: -106, r: 15, h: -4, tipo: 'gruta', tema: 'funis', etapa: 1 },
    { x: 6, z: -158, rx: 10, rz: 16, h: -6, tipo: 'gruta', tema: 'galeria', etapa: 2 },
    { x: 0, z: -212, r: 16, h: -8, tipo: 'gruta', tema: 'contrapeso', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 5, tipo: 'aberta' }, { a: 1, b: 2, larg: 3.5 }, { a: 2, b: 3, larg: 4 }, { a: 3, b: 4, larg: 4 }],
  buracos: [{ x: 0, z: -206, r: 4.5 }],
  liquido: '#c8a05a',
  temas: { dunas: SOL, patio: SOL, funis: DENTRO, galeria: tema('#4a3420', '#ffe4b8', 1.6, 0.55, 20, 90, 'poeira', '#ffe0a0'), contrapeso: tema('#3a2a18', '#ffe0a8', 1.6, 0.5, 22, 95, 'poeira', '#ffd890') },
  chao: { dunas: AREIA, patio: ['#e0d0a8', '#d4c49c', '#e8c888'], todos: AREIA },
  parede: { aberta: MORRO, todos: PEDRA },
  portao: ['#c8a878', '#ffd040'], porta: ['#d8c494', '#ffd040'],
  trono: { x: 0, z: -224, ang: 0 },
  mats: { ...MATS, vidro: '~#f0e8c8', bronze: '#6a4a2a', areiaCai: '~#f0c870' },
  decorar(ms, M, rng) {
    // o pátio das colunas inclinadas e o poço quadrado para baixo
    emCirculo(8, 0, -50, 13, (x, z, a) => { const c = rng() < 0.5; ms.peca(GEO.cil, M.calc2, x, 3, z, 1.3, c ? 4 : 6, 1.3, (rng() - 0.5) * 0.4, 0, (rng() - 0.5) * 0.4); ms.obst(x, z, 0.8); }, 0.4);
    // os funis de pedra: 4 ampulhetas nas paredes derramando cortinas de areia
    emCirculo(4, -6, -106, 12.5, (x, z, a) => {
      ms.peca(GEO.cone, M.calc, x, 7, z, 3, 3, 3, Math.PI, 0, 0); ms.peca(GEO.cone, M.calc, x, 3, z, 3, 3, 3, 0, 0, 0);
      ms.peca(GEO.cil, M.vidro, x, 5, z, 1.4, 6, 1.4); ms.peca(GEO.cil, M.areiaCai, x, 2.5, z, 0.35, 5, 0.35);
      ms.peca(GEO.chapeu, M.areia, x, 0, z, 2.4, 1, 2.4); ms.obst(x, z, 1.6);
    }, 0.6);
    poeira(ms, -6, -106, -4, 13, 60);
    // a galeria da areia escorrente: ondas de areia no chão e feixes de luz cortando a poeira
    for (let k = 0; k < 8; k++) ms.peca(GEO.dode, M.areia, 6 + (rng() - 0.5) * 12, -0.3, -146 - k * 4, 6, 0.8, 2.5, 0, rng() * 0.3, 0);
    for (let k = 0; k < 4; k++) feixe(ms, 6 + (k - 1.5) * 4, -150 - k * 5, -6, 12, 0.8, '#fff2c0', 0.18, 0.3);
    // a câmara do contrapeso: o disco de pedra e ouro preso por correntes sobre o fosso de areia
    agua(ms, '#d8b068', 0, -9.5, -206, 10, 10, 1, 0.1);
    ms.peca(GEO.cil, M.calc2, 0, 7, -206, 9, 1.8, 9, 0, 0, 0, false);
    ms.peca(GEO.cil, M.ouro, 0, 7, -206, 7, 2, 7, 0, 0, 0, false);
    for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.78; corrente(ms, M.bronze, [Math.sin(a) * 3.5, 8, -206 + Math.cos(a) * 3.5], [Math.sin(a) * 5, 22, -206 + Math.cos(a) * 5], 10, 0); }
    emCirculo(8, 0, -212, 14.5, (x, z) => coluna(ms, M.calc2, x, z, 14, 1.4), 0.2);
    feixe(ms, 0, -206, -8, 30, 3, '#fff0c0', 0.12);
  },
});

// ---------- Avenida das Esfinges Soterradas ----------
const TARDE = tema('#f0a868', '#ffe0c0', 1.8, 1.4, 40, 140, 'poeira', '#f0c890');
export const AVENIDA_ESFINGES = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 3, tipo: 'aberta', tema: 'duna' },
    { x: 0, z: -50, rx: 9, rz: 20, h: 1, tipo: 'aberta', tema: 'obeliscos', etapa: 0 },
    { x: 0, z: -102, rx: 6, rz: 18, h: 0, tipo: 'gruta', tema: 'tunel', etapa: 1 },
    { x: 0, z: -156, r: 19, h: 0, tipo: 'aberta', tema: 'altar', etapa: 2, ax: -7 },
    { x: 0, z: -214, r: 15, h: 0.5, tipo: 'aberta', tema: 'capela', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 5, tipo: 'aberta' }, { a: 1, b: 2, larg: 4.5, tipo: 'aberta' }, { a: 2, b: 3, larg: 4.5 }, { a: 3, b: 4, larg: 5, tipo: 'aberta' }],
  temas: { duna: TARDE, obeliscos: TARDE, tunel: tema('#3a2a1a', '#ffd8a8', 1.55, 0.45, 18, 80, 'poeira', '#e8c890'), altar: TARDE, capela: TARDE },
  chao: { duna: AREIA, todos: ['#e8dcc0', '#dccfb0', '#e8c888'], tunel: ['#c8b898', '#bcac8a'] },
  parede: { todos: MORRO, gruta: ['#a88850', '#c8a060', '#8a6a3a'] },
  portao: ['#2a2a30', '#3ad8c8'], porta: ['#2a2a30', '#3ad8c8'],
  trono: { x: 0, z: -218, ang: 0 },
  mats: MATS,
  decorar(ms, M, rng) {
    // os obeliscos gêmeos de granito negro saindo da duna
    for (const l of [-1, 1]) obelisco(ms, M.basalto, l * 6.5, -38, 13, 1.8);
    // as vigas de cedro escorando o túnel debaixo da duna
    for (let k = 0; k < 7; k++) { const z = -88 - k * 5; for (const l of [-1, 1]) ms.peca(GEO.caixa, M.cedro, l * 5.2, 2.5, z, 0.8, 5, 0.8); ms.peca(GEO.caixa, M.cedro, 0, 5.2, z, 11.4, 0.8, 0.9); }
    ms.peca(GEO.dode, M.areia, 0, 7, -102, 22, 6, 40, 0, 0, 0, false);
    // o pátio do altar rachado: esfinges sem cabeça meio enterradas em volta
    emCirculo(6, 0, -156, 15.5, (x, z, a) => esfinge(ms, M.calc2, x, z, 1.1, a + Math.PI, 0.7), 0.5);
    ms.peca(GEO.caixa, M.calc2, -7, 0.4, -156, 4, 0.8, 2.4, 0, 0.3, 0.1); ms.obst(-7, -156, 2);
    // a capela de basalto negro com as faixas turquesa e os braseiros acesos
    ms.peca(GEO.caixa, M.basalto, 0, 4.5, -226, 12, 9, 7, 0, 0, 0); for (let k = 0; k < 3; k++) ms.peca(GEO.caixa, M.turquesa, 0, 2 + k * 3, -222.4, 12.2, 0.3, 0.2, 0, 0, 0);
    ms.peca(GEO.caixa, M.turquesa, 0, 2.8, -222.4, 2.6, 5, 0.25, 0, 0, 0);
    ms.obst(0, -226, 5); ms.obst(-4, -226, 3); ms.obst(4, -226, 3);
    const fogo = [];
    for (const l of [-1, 1]) { ms.peca(GEO.cil, M.basalto, l * 4.5, 0.7, -219, 1.2, 1.4, 1.2); ms.peca(GEO.cone, M.tocha, l * 4.5, 1.9, -219, 1, 1.4, 1); fogo.push([l * 4.5, 2, -219]); ms.obst(l * 4.5, -219, 0.8); }
    brilhos(ms, fogo, '#ffb040', 3, 0.7, 'tocha');
    emVolta(ms, [3, 4], 16, 2, 14, (x, z) => ms.peca(GEO.dode, M.areia, x, 0, z, 8 + rng() * 6, 2 + rng() * 2, 6 + rng() * 6, 0, rng() * 3, 0));
  },
});

// ---------- Cisterna Secreta do Oásis ----------
const FRESCO = tema('#0e3a3a', '#c8fff0', 1.55, 0.45, 20, 90, 'faisca', '#a8fff0');
const CANAIS = [[-9, -110, 3], [-9, -96, 3], [9, -110, 3], [9, -96, 3]].map(([x, z, r]) => ({ x, z, r }));
export const CISTERNA_OASIS = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'oasis' },
    { x: 0, z: -50, r: 12, h: -3, tipo: 'canion', tema: 'poco', etapa: 0 },
    { x: 0, z: -104, rx: 14, rz: 18, h: -6, tipo: 'gruta', tema: 'aqueduto', etapa: 1 },
    { x: 6, z: -158, r: 16, h: -6, tipo: 'gruta', tema: 'lotus', etapa: 2 },
    { x: -2, z: -210, rx: 12, rz: 13, h: -4, tipo: 'gruta', tema: 'cofre', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 4, tipo: 'canion' }, { a: 1, b: 2, larg: 3.5 }, { a: 2, b: 3, larg: 3.5 }, { a: 3, b: 4, larg: 3.5 }],
  buracos: CANAIS,
  liquido: '#2ac8c0',
  temas: { oasis: SOL, poco: tema('#c8a878', '#fff0d8', 1.7, 0.9, 26, 100, 'poeira', '#f0d8a0'), aqueduto: FRESCO, lotus: FRESCO, cofre: DENTRO },
  chao: { oasis: AREIA, poco: ['#ecdcb4', '#e0d0a6'], todos: ['#d8ccae', '#ccc0a0'], lotus: ['#2ac8c0', '#36d4cc'], cofre: ['#d8c8a4', '#ccbc98'] },
  parede: { aberta: ['#e8c888', '#5a9a3a', '#4a8a30'], canion: ['#ecdcb4', '#d8c494'], todos: ['#2a8a8a', '#348e8a', '#c8b894', '#1e7070'] },
  portao: ['#d8c8a4', '#3ad8c8'], porta: ['#ecdcb4', '#3ad8c8'],
  trono: { x: -2, z: -218, ang: 0 },
  mats: { ...MATS, faianca: '*#2ac8c0', faianca2: '#1e9a98', lotus: '#3a5ac8', bau: '#6a4a2e' },
  decorar(ms, M, rng) {
    // o oásis lá em cima: tamareiras, juncos e o poço de pedra branca
    emVolta(ms, [0], 12, 2, 12, (x, z) => palmeira(ms, { tronco: M.cedro, folha: M.palma, folha2: M.palma }, x, z, 1 + rng() * 0.4));
    emCirculo(14, 0, -50, 12.5, (x, z, a) => ms.peca(GEO.caixa, M.calc, x, 1.2, z, 3, 2.4, 1.4, 0, a, 0), 0, Math.PI * 1.75);
    escada(ms, M.calc2, 6, -40, -0.5, 6, -60, -3, 4, 10);
    // o aqueduto: arcos de faiança turquesa e os canais de água cristalina
    for (const b of CANAIS) agua(ms, '#2ad8d0', b.x, -7, b.z, b.r * 2.3, b.r * 2.3, 0.75, 0.7);
    agua(ms, '#2ad8d0', -9, -7, -103, 5, 18, 0.7, 0.7); agua(ms, '#2ad8d0', 9, -7, -103, 5, 18, 0.7, 0.7);
    for (let k = 0; k < 4; k++) for (const l of [-1, 1]) { const z = -92 - k * 8; ms.peca(GEO.caixa, M.faianca2, l * 14.6, -1, z, 1.2, 10, 1.2, 0, 0, 0, false); arcoEntre(ms, M.faianca, l * 14.6, z, l * 14.6, z - 8, 2, 0.6); }
    // a câmara do lótus: o salão alagado com as colunas de lótus refletidas
    agua(ms, '#2ad8d0', 6, -5.85, -158, 30, 30, 0.45, 0.7);
    emCirculo(7, 6, -158, 11, (x, z) => colunaPapiro(ms, { calc: M.calc, azul: M.lotus, ouro: M.ouro }, x, z, 9, 1.1), 0.3);
    feixe(ms, 6, -158, -6, 18, 3.5, '#e8fff8', 0.14);
    const ref = []; for (let i = 0; i < 60; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 14; ref.push([6 + Math.cos(a) * r, -5.7, -158 + Math.sin(a) * r]); }
    brilhos(ms, ref, '#c8fff8', 0.5, 0.8, 'reflexo');
    // o cofre das ânforas seladas: fileiras de ânforas e baús de cedro
    for (let k = 0; k < 7; k++) for (const l of [-1, 1]) anfora(ms, M.barro, -2 + l * (8 + (k % 2)), -204 - k * 2, 0.9 + rng() * 0.3);
    for (const l of [-1, 1]) { ms.peca(GEO.caixa, M.bau, -2 + l * 5, 0.5, -220, 2.4, 1, 1.4); ms.peca(GEO.caixa, M.ouro, -2 + l * 5, 1.05, -220, 2.5, 0.12, 1.5); ms.obst(-2 + l * 5, -220, 1.2); }
    const tochas = []; for (const l of [-1, 1]) for (const z of [-204, -216]) { ms.peca(GEO.cone, M.tocha, -2 + l * 11, 3, z, 0.5, 0.8, 0.5); tochas.push([-2 + l * 11, 3, z]); }
    brilhos(ms, tochas, '#ffb040', 2, 0.7, 'tocha');
  },
});

// ---------- Doca das Barcas Solares ----------
export const DOCA_BARCAS = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'dunas' },
    { x: 0, z: -48, rx: 7, rz: 18, h: -2, tipo: 'gruta', tema: 'selos', etapa: 0 },
    { x: 0, z: -104, rx: 7, rz: 22, h: -2, tipo: 'plataforma', fundo: 3, tema: 'nave1', etapa: 1 },
    { x: 0, z: -158, rx: 3.5, rz: 12, h: -2, tipo: 'plataforma', fundo: 4, tema: 'ponte', etapa: 2 },
    { x: 0, z: -210, rx: 14, rz: 18, h: -2, tipo: 'plataforma', fundo: 3, tema: 'horizonte', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 3.5 }, { a: 1, b: 2, larg: 3.5, tipo: 'plataforma', fundo: 3 }, { a: 2, b: 3, larg: 2.5, tipo: 'plataforma', fundo: 4 }, { a: 3, b: 4, larg: 2.5, tipo: 'plataforma', fundo: 3 }],
  temas: { dunas: SOL, selos: DENTRO, nave1: tema('#5a4428', '#ffe8c0', 1.65, 0.6, 22, 95, 'poeira', '#ffe8b0'), ponte: tema('#5a4428', '#ffe8c0', 1.65, 0.6, 22, 95, 'poeira', '#ffe8b0'), horizonte: tema('#6a5030', '#fff0c8', 1.75, 0.7, 26, 105, 'poeira', '#fff0b0') },
  chao: { dunas: AREIA, todos: ['#e0d0aa', '#d4c49c', '#e8d8b4'], ponte: ['#8a6a48', '#7a5c3e'] },
  parede: { aberta: MORRO, todos: ['#d8c8a0', '#ccbc94'] },
  fundo: ['#c8a868', '#b8985a', '#a88848'],
  portao: ['#d8c8a0', '#ffd040'], porta: ['#ecdcb4', '#ffd040'],
  trono: { x: 0, z: -222, ang: 0 },
  mats: { ...MATS, tabua: '#8a6a48', tabua2: '#7a5c3e', corda: '#c8a870' },
  decorar(ms, M, rng) {
    // as portas falsas de pedra inclinadas da antecâmara
    for (let k = 0; k < 3; k++) { const z = -38 - k * 9, l = k % 2 ? 1 : -1; ms.peca(GEO.caixa, M.calc2, l * 5, 3, z, 3, 6, 0.8, 0, 0, l * 0.3); ms.obst(l * 5, z, 1.5); }
    // as paredes das naves com os hieróglifos (faixas azuis e ouro) e as fendas de sol no teto
    for (const [cz, comp] of [[-104, 44], [-210, 36]]) for (const l of [-1, 1]) { ms.peca(GEO.caixa, M.azul, l * 15, 5, cz, 0.3, 0.8, comp, 0, 0, 0, false); ms.peca(GEO.caixa, M.ouro, l * 15, 6, cz, 0.35, 0.25, comp, 0, 0, 0, false); }
    for (let k = 0; k < 6; k++) feixe(ms, (k % 2 ? 2 : -2), -90 - k * 24, -2, 16, 1.4, '#fff0c0', 0.18, (k % 2 ? 0.25 : -0.25));
    // a 1ª barca no berço de pedra, ao lado da passarela
    barca(ms, M, 10, -4, -104, 26, 0);
    for (const z of [-110, -98]) ms.peca(GEO.caixa, M.calc2, 10, -4.4, z, 4, 1.2, 1.2, 0, 0, 0, false);
    // a ponte de cordas sobre o fosso seco
    ponteTabuas(ms, M, { x: 0, z: -127, h: -2 }, { x: 0, z: -192, h: -2 }, 6.6, 0, true);
    // o salão do horizonte: a barca solar real com os discos de ouro
    barca(ms, M, 0, -4.5, -210, 34, Math.PI / 2);
    ms.peca(GEO.cil, M.ouro, 0, 3.5, -210, 3, 0.3, 3, Math.PI / 2, 0, 0, false);
    for (const l of [-1, 1]) barca(ms, M, l * 12, -4.5, -220, 16, 0.2 * l);
    poeira(ms, 0, -210, -2, 14, 80);
    ms.peca(GEO.cil, M.ouro, 0, -1.8, -222, 6, 0.3, 6, 0, 0, 0, false);
  },
});

export const DESERTO = { espelho: PIRAMIDE_ESPELHO, hipogeu: HIPOGEU_ESCRIBAS, ampulheta: TEMPLO_AMPULHETA, esfinges: AVENIDA_ESFINGES, cisterna: CISTERNA_OASIS, barcas: DOCA_BARCAS };
