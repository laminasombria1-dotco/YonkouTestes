// =============================================================
// AS 6 DUNGEONS DO GELO (Terras Glaciais), pelo guia e pelas artes do Lâmina
//  Coração da Geleira Fendida · Mina Abandonada do Passo Norte · Templo Rúnico da Névoa Branca
//  Termas Profundas de Vapor e Gelo · Casco do Quebra-Gelo Aprisionado · Torre de Vigia da Cordilheira
// =============================================================
import { GEO } from '../dungeon.js';
import { fazerPlano, tema, emVolta, noChao, emCirculo, agua, feixe, brilhos, cristais, coluna, arcoEntre, corrente, obelisco, estalactite, ponta, lanterna, ponteTabuas, escada, casco, sino, pedra, samambaia, GEO_OCT } from './pecas.js';

const NEVE = tema('#a8bcd8', '#f0f8ff', 1.75, 1.2, 30, 115, 'neve', '#ffffff');
const AZUL = tema('#0e3a5a', '#b8f0ff', 1.6, 0.55, 20, 90, 'brilho', '#bff8ff');
const CHAO_NEVE = ['#eef4fb', '#e2ecf6', '#f6fbff'];
const MORRO_NEVE = ['#cfdbe8', '#b8c6d6', '#dfe8f2'];
const ROCHA = ['#2a3446', '#34405a', '#222a3a', '#3e4a62'];
const MATS = { gelo: '~#9fe8ff', gelo2: '*#7fd8ff', geloSolido: '#bfe8f8', neve: '#f4f9ff', rocha: '#3a4660', rocha2: '#2a3448', madeira: '#5a4632', madeira2: '#4a3a2a', ferro: '#3a3e48', ambar: '*#ffb040', runa: '*#5fe8ff', bronze: '#a06a3a', vapor: '~#e8f8ff', turquesa: '*#3ad8e0', musgo: '#4a7a4a', tabua: '#6a5a48', tabua2: '#5a4a3a', corda: '#8a7a60' };
const flocos = (ms, cx, cz, y, r, n, cor = '#ffffff', tam = 0.5) => { const l = []; for (let i = 0; i < n; i++) { const a = ms.rng() * 6.28, d = Math.sqrt(ms.rng()) * r; l.push([cx + Math.cos(a) * d, y + ms.rng() * 12, cz + Math.sin(a) * d]); } brilhos(ms, l, cor, tam, 0.8, 'floco' + cor + tam); };
const pingentes = (ms, M, salas, n, topo) => { const F = ms.forma; for (let i = 0; i < n; i++) { const s = F.salas[salas[i % salas.length]], a = ms.rng() * 6.28, r = Math.sqrt(ms.rng()) * Math.min(s.rx, s.rz); estalactite(ms, ms.rng() < 0.3 ? M.gelo2 : M.geloSolido, s.x + Math.cos(a) * r, s.z + Math.sin(a) * r, s.h + topo, 2 + ms.rng() * 4, 0.6 + ms.rng() * 0.6); } };
const ARCO_IRIS = ['#ff5a5a', '#ffa040', '#ffe050', '#60e070', '#50b0ff', '#a070ff'];

// ---------- Coração da Geleira Fendida ----------
export const CORACAO_GELEIRA = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 4, tipo: 'aberta', tema: 'superficie' },
    { x: 0, z: -48, rx: 5, rz: 20, h: 1, tipo: 'canion', tema: 'fenda', etapa: 0 },
    { x: 10, z: -104, rx: 9, rz: 22, h: -2, tipo: 'gruta', tema: 'galeria', etapa: 1, ax: -3 },
    { x: -8, z: -158, rx: 9, rz: 9, h: -2, tipo: 'gruta', tema: 'ponte', etapa: 2 },
    { x: 0, z: -212, r: 18, h: -2, tipo: 'gruta', tema: 'sol', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 3.5, tipo: 'canion' }, { a: 1, b: 2, larg: 3.5 }, { a: 2, b: 3, larg: 3.5 }, { a: 3, b: 4, larg: 2.4 }],
  abismos: [{ corredor: 3, r: 11, fundo: 14 }],
  temas: { superficie: NEVE, fenda: tema('#8ab8d8', '#e8f8ff', 1.7, 1, 26, 100, 'neve', '#ffffff'), galeria: AZUL, ponte: tema('#08283e', '#a8e8ff', 1.55, 0.4, 18, 85, 'brilho', '#9ff0ff'), sol: tema('#4a8ab0', '#f4fcff', 1.85, 0.9, 26, 105, 'brilho', '#ffffff') },
  chao: { superficie: CHAO_NEVE, fenda: ['#bfe0f0', '#a8d4ec', '#d0ecf8'], todos: ['#7fc8e8', '#6ab8e0', '#94d4ee'], sol: ['#a8e0f4', '#bfeaf8', '#94d4ee'] },
  parede: { aberta: MORRO_NEVE, canion: ['#5fb0e0', '#7fc8ec', '#4aa0d4'], todos: ['#3a90c8', '#4aa0d4', '#2a80b8', '#5fb0e0'] },
  fundo: ['#0a2a44', '#06203a'],
  portao: ['#5fb0e0', '#bff8ff'], porta: ['#a8d4ec', '#8fe3ff'],
  trono: { x: 0, z: -222, ang: 0 },
  mats: MATS,
  decorar(ms, M, rng) {
    // a fenda: as duas paredes de gelo azul brilhante, com a neve na borda lá em cima
    emVolta(ms, [1], 26, 0.5, 3, (x, z) => ms.peca(GEO.caixa, rng() < 0.5 ? M.gelo2 : M.geloSolido, x, 5, z, 2 + rng() * 2, 10 + rng() * 6, 3 + rng() * 3, 0, rng() * 0.3, (rng() - 0.5) * 0.2));
    // a galeria dos arcos translúcidos: as bolhas de ar presas no gelo
    for (let k = 0; k < 5; k++) arcoEntre(ms, M.gelo, 10 - 10, -88 - k * 8, 10 + 9, -88 - k * 8, -2, 1.2);
    const bolhas = []; for (let i = 0; i < 90; i++) bolhas.push([10 + (rng() < 0.5 ? -1 : 1) * (9 + rng() * 2), -1 + rng() * 9, -84 - rng() * 44]);
    brilhos(ms, bolhas, '#e8fcff', 0.5, 0.8, 'bolha');
    // a ponte de gelo espesso sobre o abismo escuro
    ms.peca(GEO.arco, M.geloSolido, -4, -16, -185, 3, 14, 18, 0, 0, 0, false);
    // a câmara do sol refratado: as facetas de gelo, os raios de luz e o arco-íris
    emCirculo(14, 0, -212, 17, (x, z, a) => ms.peca(GEO.caixa, rng() < 0.5 ? M.gelo : M.gelo2, x, 6, z, 3, 14, 1, 0.15, a, 0), 0.2);
    for (let k = 0; k < 6; k++) feixe(ms, (k - 2.5) * 3, -214 + (k % 2) * 4, -2, 24, 1.4, ARCO_IRIS[k], 0.14, (k - 2.5) * 0.12);
    feixe(ms, 0, -214, -2, 26, 7, '#ffffff', 0.1);
    flocos(ms, 0, -212, -2, 16, 80, '#ffffff', 0.4);
  },
});

// ---------- Mina Abandonada do Passo Norte ----------
export const MINA_PASSO_NORTE = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'neve' },
    { x: 0, z: -48, rx: 7, rz: 18, h: 0, tipo: 'gruta', tema: 'portico', etapa: 0 },
    { x: 0, z: -102, rx: 6, rz: 20, h: 0, tipo: 'gruta', tema: 'trilhos', etapa: 1 },
    { x: 6, z: -156, r: 14, h: -4, tipo: 'plataforma', fundo: 14, tema: 'poco', etapa: 2 },
    { x: 0, z: -212, r: 16, h: -10, tipo: 'gruta', tema: 'veio', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 4, tipo: 'aberta' }, { a: 1, b: 2, larg: 3.5 }, { a: 2, b: 3, larg: 3, tipo: 'plataforma', fundo: 10 }, { a: 3, b: 4, larg: 3, tipo: 'plataforma', fundo: 12 }],
  paredeVisivel: 36,
  temas: { neve: NEVE, portico: tema('#2a2420', '#ffd8a8', 1.5, 0.4, 18, 80, 'neve', '#ffffff'), trilhos: tema('#1a1e28', '#ffd0a0', 1.45, 0.35, 16, 75, 'nenhuma'), poco: tema('#121a28', '#b8d8ff', 1.45, 0.35, 18, 80, 'neve', '#c8e8ff'), veio: tema('#08182a', '#9ff0ff', 1.5, 0.35, 18, 85, 'brilho', '#7fe8ff') },
  chao: { neve: CHAO_NEVE, portico: ['#cfdbe8', '#4a4038'], trilhos: ['#bfe0f0', '#a8d0e4', '#3a3830'], poco: ['#5a4a3a', '#4a3e30'], veio: ['#2a3448', '#34405a'] },
  parede: { aberta: MORRO_NEVE, todos: ROCHA },
  fundo: ['#0a0e18', '#121824'],
  portao: ['#4a3a2a', '#ffb040'], porta: ['#5a4632', '#ffb040'],
  trono: { x: 0, z: -222, ang: 0 },
  mats: MATS,
  decorar(ms, M, rng) {
    // o pórtico: as vigas grossas de madeira com os pingentes e as lanternas a óleo acesas
    const luz = [];
    for (let k = 0; k < 5; k++) { const z = -34 - k * 7; for (const l of [-1, 1]) ms.peca(GEO.caixa, M.madeira, l * 5.6, 2.8, z, 0.8, 5.6, 0.8); ms.peca(GEO.caixa, M.madeira, 0, 5.8, z, 12, 0.8, 0.9); for (let p = 0; p < 4; p++) estalactite(ms, M.geloSolido, -4 + p * 2.6, z, 5.4, 1 + rng() * 1.4, 0.4); if (k % 2 === 0) { lanterna(ms, M.ferro, M.ambar, 4.6, z, 0.6, 4.8); luz.push([4.6, 5.6, z]); } }
    // os trilhos enferrujados sumindo debaixo do gelo liso
    for (let k = 0; k < 24; k++) ms.peca(GEO.caixa, M.madeira2, 0, 0.08, -26 - k * 4, 3.2, 0.16, 0.6, 0, 0, 0);
    for (const l of [-1, 1]) ms.peca(GEO.caixa, M.ferro, l * 0.9, 0.2, -72, 0.2, 0.2, 94, 0, 0, 0, false);
    agua(ms, '#bfe8f8', 0, 0.25, -110, 9, 30, 0.55, 0.3);
    for (const z of [-92, -112]) { lanterna(ms, M.ferro, M.ambar, -4, z, 0.5, 4.2); luz.push([-4, 5, z]); }
    brilhos(ms, luz, '#ffb040', 2.6, 0.75, 'lanterna');
    // o poço dos elevadores: plataformas de madeira com geada, escadas e cabos
    ms.peca(GEO.cil, M.madeira, 6, -4.6, -156, 28, 1, 28, 0, 0, 0, false);
    emCirculo(8, 6, -156, 14, (x, z) => ms.peca(GEO.cil, M.madeira2, x, -10, z, 0.5, 14, 0.5, 0, 0, 0, false));
    for (let k = 0; k < 4; k++) corrente(ms, M.corda, [6 + (k - 1.5) * 6, -4, -156 + 12], [6 + (k - 1.5) * 6, 14, -156 + 30], 10, 0);
    emVolta(ms, [3], 12, 1, 6, (x, z) => ms.peca(GEO.caixa, M.tabua, x, -10 - rng() * 6, z, 5, 0.4, 3, 0, rng() * 3, 0, false));
    // o veio do cristal ártico: as grandes formações de gelo azul que brilham na rocha escura
    emVolta(ms, [4], 26, 0.2, 4, (x, z) => ms.peca(GEO_OCT, rng() < 0.6 ? M.gelo2 : M.turquesa, x, -10 + 2 + rng() * 4, z, 1.4, 4 + rng() * 5, 1.4, (rng() - 0.5) * 1.2, rng() * 3, (rng() - 0.5) * 1.2, false));
    noChao(ms, 4, 7, 6, (x, z) => cristais(ms, GEO_OCT, M.gelo2, M.turquesa, x, z, 0.8, true));
    flocos(ms, 0, -212, -10, 14, 60, '#7fe8ff', 0.4);
  },
});

// ---------- Templo Rúnico da Névoa Branca ----------
const CREP = tema('#5a6280', '#e0e8ff', 1.6, 0.8, 26, 105, 'nevasca', '#ffffff');
export const TEMPLO_RUNICO = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'plato' },
    { x: 0, z: -48, rx: 9, rz: 20, h: 3, tipo: 'aberta', tema: 'escadaria', etapa: 0 },
    { x: 0, z: -104, rx: 7, rz: 24, h: 6, tipo: 'plataforma', fundo: 8, tema: 'avenida', etapa: 1 },
    { x: 0, z: -160, r: 15, h: 6, tipo: 'plataforma', fundo: 10, tema: 'patio', etapa: 2 },
    { x: 0, z: -212, r: 15, h: 6, tipo: 'plataforma', fundo: 12, tema: 'monolito', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 5, tipo: 'aberta' }, { a: 1, b: 2, larg: 5, tipo: 'aberta' }, { a: 2, b: 3, larg: 4.5, tipo: 'plataforma', fundo: 8 }, { a: 3, b: 4, larg: 4.5, tipo: 'plataforma', fundo: 10 }],
  paredeVisivel: 40,
  temas: { plato: CREP, escadaria: CREP, avenida: CREP, patio: CREP, monolito: tema('#4a4a6a', '#d8e8ff', 1.6, 0.8, 28, 110, 'neve', '#bff8ff') },
  chao: { plato: CHAO_NEVE, escadaria: ['#8a92a8', '#e8f0f8', '#7a8298'], todos: ['#8a92a8', '#7a8298', '#dfe8f2'] },
  parede: { aberta: MORRO_NEVE, todos: ['#3a4258', '#4a5268', '#cfdbe8'] },
  fundo: ['#2a3248', '#3a4258'],
  portao: ['#3a4258', '#5fe8ff'], porta: ['#4a5268', '#5fe8ff'],
  trono: { x: 0, z: -220, ang: 0 },
  mats: { ...MATS, basalto: '#22283a' },
  decorar(ms, M, rng) {
    // a escadaria soterrada pelas derivas de neve
    escada(ms, M.rocha, 0, -30, 0.2, 0, -66, 3, 12, 14);
    for (const l of [-1, 1]) ms.peca(GEO.caixa, M.rocha2, l * 8, 1.6, -48, 1.2, 1.2, 36, 0.08, 0, 0);
    emVolta(ms, [1, 0], 14, 0.5, 6, (x, z) => ms.peca(GEO.dode, M.neve, x, 0, z, 5 + rng() * 4, 1.5 + rng(), 4 + rng() * 3, 0, rng() * 3, 0));
    // a avenida dos obeliscos rúnicos (inclinados, com as runas ciano)
    for (let k = 0; k < 5; k++) for (const l of [-1, 1]) obelisco(ms, M.basalto, l * 5.8, -88 - k * 8, 7 + rng() * 2, 1.3, M.runa);
    // o pátio do vento cortante: os arcos quebrados com o gelo sempre do mesmo lado
    emCirculo(6, 0, -160, 13, (x, z, a) => { coluna(ms, M.rocha, x, z, 7, 1.1); ms.peca(GEO.caixa, M.geloSolido, x + 0.8, 3.5, z, 0.5, 6, 1.4, 0, 0, 0); }, 0.5);
    for (const [a, b] of [[0.5, 1.55], [3.6, 4.6]]) arcoEntre(ms, M.rocha2, Math.sin(a) * 13, -160 + Math.cos(a) * 13, Math.sin(b) * 13, -160 + Math.cos(b) * 13, 6 + 6.8, 0.8);
    // o santuário do monólito: a pedra negra com a runa, o anel de degraus e as pontas de gelo
    ms.peca(GEO.caixa, M.basalto, 0, 6, -224, 3, 12, 2, 0, 0, 0); ms.obst(0, -224, 2);
    ms.peca(GEO.cone4, M.basalto, 0, 12.8, -224, 3.6, 1.6, 2.4, 0, Math.PI / 4, 0);
    ms.peca(GEO.caixa, M.runa, 0, 7, -222.9, 0.5, 6, 0.1); ms.peca(GEO.caixa, M.runa, 0.7, 8.4, -222.9, 1.4, 0.4, 0.1, 0, 0, -0.7);
    for (const r of [4, 6]) ms.peca(GEO.cil, M.rocha, 0, 0.15 + (6 - r) * 0.08, -220, r * 2, 0.3, r * 2);
    emCirculo(10, 0, -224, 4, (x, z) => ponta(ms, M.gelo2, x, z, 2 + rng() * 4, 0.9, true));
    feixe(ms, 0, -224, 6, 18, 2.5, '#5fe8ff', 0.15);
    // as montanhas lá longe
    for (let i = 0; i < 9; i++) { const a = -1.2 + i * 0.3; ms.peca(GEO.cone, i % 2 ? M.rocha2 : M.rocha, Math.sin(a) * 140, -10, -180 - Math.cos(a) * 140, 50 + rng() * 30, 60 + rng() * 40, 50, 0, rng(), 0, false); }
  },
});

// ---------- Termas Profundas de Vapor e Gelo ----------
const PISC = [[-10, -100, 4], [8, -96, 4], [-4, -112, 3.5]].map(([x, z, r]) => ({ x, z, r }));
const FONTE = { x: 0, z: -206, r: 6.5 };
export const TERMAS_VAPOR = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 2, tipo: 'aberta', tema: 'neve' },
    { x: 0, z: -48, rx: 5, rz: 18, h: 0, tipo: 'gruta', tema: 'bruma', etapa: 0 },
    { x: 0, z: -104, r: 17, h: -2, tipo: 'gruta', tema: 'terracos', etapa: 1 },
    { x: 6, z: -156, rx: 4, rz: 12, h: -2, tipo: 'plataforma', fundo: 4, tema: 'condensacao', etapa: 2 },
    { x: 0, z: -210, r: 17, h: -2, tipo: 'gruta', tema: 'domo', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 3.5, tipo: 'aberta' }, { a: 1, b: 2, larg: 3.5 }, { a: 2, b: 3, larg: 2.8, tipo: 'plataforma', fundo: 4 }, { a: 3, b: 4, larg: 2.8, tipo: 'plataforma', fundo: 4 }],
  buracos: [...PISC, FONTE],
  liquido: '#2ad0d8',
  temas: { neve: NEVE, bruma: tema('#a8a8b0', '#fff4e8', 1.6, 0.6, 14, 70, 'brilho', '#ffffff'), terracos: tema('#3a3a40', '#ffe8d8', 1.6, 0.5, 18, 80, 'brilho', '#fff0e0'), condensacao: tema('#2a3a48', '#d8f0ff', 1.55, 0.4, 18, 80, 'neve', '#bfe8ff'), domo: tema('#0e2a40', '#b8f4ff', 1.6, 0.45, 20, 90, 'brilho', '#9ff0ff') },
  chao: { neve: CHAO_NEVE, bruma: ['#4a4a50', '#3e3e44'], terracos: ['#2a2a30', '#34343a', '#4a7a4a'], condensacao: ['#3a3a42', '#46464e'], domo: ['#7fb8d0', '#94c8dc', '#6aa8c4'] },
  parede: { aberta: MORRO_NEVE, todos: ['#1e2028', '#2a2c34', '#34363e', '#4a6a4a'], domo: ['#3a90c8', '#4aa0d4', '#2a80b8'] },
  fundo: ['#0e3a4a', '#124452'],
  portao: ['#2a2c34', '#3ad8e0'], porta: ['#3a3c44', '#3ad8e0'],
  trono: { x: 0, z: -220, ang: 0 },
  mats: MATS,
  decorar(ms, M, rng) {
    // a entrada: o frio de fora encontra as nuvens de vapor morno
    const vap = (cx, cz, r, n, y) => { const l = []; for (let i = 0; i < n; i++) { const a = rng() * 6.28, d = Math.sqrt(rng()) * r; l.push([cx + Math.cos(a) * d, y + rng() * 6, cz + Math.sin(a) * d]); } brilhos(ms, l, '#fff4e8', 3, 0.28, 'vapor'); };
    vap(0, -48, 5, 50, 0);
    feixe(ms, 0, -40, 0, 14, 3, '#fff0d8', 0.14, 0.3);
    // os terraços: as piscinas turquesa fumegantes em degraus, com musgo nas bordas
    for (const P of PISC) { agua(ms, '#2ad8e0', P.x, -2.6, P.z, P.r * 2.4, P.r * 2.4, 0.8, 0.7); emCirculo(9, P.x, P.z, P.r + 0.8, (x, z) => pedra(ms, rng() < 0.4 ? M.musgo : M.rocha2, x, z, 0.8)); vap(P.x, P.z, P.r, 25, -2); }
    for (let k = 0; k < 3; k++) ms.peca(GEO.caixa, M.vapor, -10 + k * 9, 0, -116, 2, 3, 0.3, 0, 0, 0, false);
    // a passarela da condensação: a ponte de pedra sobre a piscina funda, com as gotas caindo
    agua(ms, '#2ad0d8', 6, -5, -156, 20, 30, 0.8, 0.6);
    const gotas = []; for (let i = 0; i < 70; i++) gotas.push([6 + (rng() - 0.5) * 10, -2 + rng() * 14, -156 + (rng() - 0.5) * 26]);
    brilhos(ms, gotas, '#bfe8ff', 0.35, 0.8, 'gota');
    ms.peca(GEO.arco, M.rocha2, 6, -6, -156, 4, 4, 22, 0, 0, 0, false);
    // o domo de vapor e cristal: as estalactites ciano gigantes sobre a fonte que brilha
    agua(ms, '#3ae0f0', FONTE.x, -2.6, FONTE.z, FONTE.r * 2.4, FONTE.r * 2.4, 0.85, 1);
    for (let i = 0; i < 22; i++) { const a = rng() * 6.28, r = 2 + Math.sqrt(rng()) * 14; estalactite(ms, rng() < 0.5 ? M.gelo2 : M.turquesa, Math.cos(a) * r, -210 + Math.sin(a) * r, 16, 4 + rng() * 8, 1 + rng() * 1.2); }
    feixe(ms, FONTE.x, FONTE.z, -2.6, 18, 5, '#9ff0ff', 0.15);
    vap(0, -206, 7, 40, -2);
    brilhos(ms, [[12, 1, -218]], '#ff9a40', 8, 0.5, 'calor'); // o brilho laranja no fundo da caverna (a arte)
  },
});

// ---------- Casco do Quebra-Gelo Aprisionado ----------
export const QUEBRA_GELO = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'lago' },
    { x: 0, z: -50, r: 15, h: 0, tipo: 'aberta', tema: 'trilha', etapa: 0 },
    { x: 0, z: -106, rx: 8, rz: 20, h: 5, tipo: 'plataforma', fundo: 6, tema: 'conves', etapa: 1 },
    { x: 0, z: -156, rx: 6, rz: 14, h: 1.5, tipo: 'gruta', tema: 'porao', etapa: 2 },
    { x: 0, z: -204, r: 12, h: 8, tipo: 'plataforma', fundo: 9, tema: 'capitao', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 5, tipo: 'aberta' }, { a: 1, b: 2, larg: 2.6, tipo: 'plataforma', fundo: 4 }, { a: 2, b: 3, larg: 3, tipo: 'plataforma', fundo: 5 }, { a: 3, b: 4, larg: 2.6, tipo: 'plataforma', fundo: 7 }],
  paredeVisivel: 36,
  temas: { lago: NEVE, trilha: tema('#b8cce0', '#f0faff', 1.75, 1.1, 32, 120, 'neve', '#ffffff'), conves: NEVE, porao: tema('#1a2a3a', '#a8e0ff', 1.5, 0.35, 16, 75, 'brilho', '#9fe8ff'), capitao: tema('#c8d8ec', '#fff8f0', 1.8, 1.1, 32, 120, 'neve', '#ffffff') },
  chao: { lago: ['#bfe8f8', '#a8dcf0', '#d0f0fa'], trilha: ['#9fe0f4', '#bfeaf8', '#7fd0ec'], todos: ['#8a7a68', '#7a6a58', '#e8f0f8'], porao: ['#5a4a3a', '#4a3e30'] },
  parede: { aberta: ['#bfe8f8', '#a8dcf0', '#eef4fb'], gruta: ['#4a3a2a', '#5a4632', '#7fd0ec'], todos: ['#bfe8f8', '#a8dcf0'] },
  fundo: ['#9fd8ee', '#86c8e4', '#bfe8f8'],
  portao: ['#5a4632', '#9fe8ff'], porta: ['#a8dcf0', '#8fe3ff'],
  trono: { x: 0, z: -208, ang: 0 },
  mats: { ...MATS, casco: '#5a4a3a', casco2: '#4a3a2c', vidro: '~#d8f4ff' },
  decorar(ms, M, rng) {
    // o lago congelado: as placas de gelo rachado (água escura por baixo)
    agua(ms, '#0e3a5a', 0, -2.5, -110, 160, 260, 0.9, 0.2);
    emVolta(ms, [0, 1, 2, 3, 4], 60, 1, 30, (x, z) => ms.peca(GEO_OCT, rng() < 0.5 ? M.geloSolido : M.gelo, x, -0.6, z, 6 + rng() * 6, 1.2, 5 + rng() * 6, 0, rng() * 3, 0, false));
    const bolhas = []; for (let i = 0; i < 60; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 14; bolhas.push([Math.cos(a) * r, -0.2, -50 + Math.sin(a) * r]); }
    brilhos(ms, bolhas, '#e8fcff', 0.4, 0.8, 'bolha');
    // o navio inclinado: o casco escuro, os mastros quebrados com pingentes e as cordas congeladas
    casco(ms, M, 0, -108, 5, 18, 42, Math.PI, 0.1);
    for (const z of [-96, -116]) { ms.peca(GEO.cil, M.madeira, 0, 5 + 4, z, 0.8, 8, 0.8, 0, 0, (rng() - 0.5) * 0.3, false); for (let p = 0; p < 4; p++) estalactite(ms, M.geloSolido, (p - 1.5) * 0.4, z, 12.5, 1.5, 0.3); ms.obst(0, z, 0.8); }
    for (let k = 0; k < 4; k++) corrente(ms, M.corda, [(k - 1.5) * 3, 13, -96], [(k - 1.5) * 4, 5.5, -88], 8, 0.4);
    escada(ms, M.tabua, 0, -64, 0, 0, -86, 5, 4.4, 12);
    emVolta(ms, [2], 10, 0.2, 2, (x, z) => ms.peca(GEO.dode, M.neve, x, 5.2, z, 2.5, 0.8, 2, 0, rng(), 0, false));
    // o porão: as colunas de gelo azul rasgando as tábuas e as máquinas antigas
    for (const [x, z] of [[-3.5, -150], [3.5, -160], [-3, -166]]) { ms.peca(GEO.cil, M.gelo2, x, 4, z, 2, 8, 2, 0, 0, 0, false); ms.obst(x, z, 1); }
    for (const [x, z] of [[4, -146], [-4.5, -158]]) { ms.peca(GEO.cil, M.ferro, x, 2.4, z, 1.6, 1.8, 1.6, Math.PI / 2, 0, 0, false); ms.obst(x, z, 1); }
    // a câmara do capitão: a popa envidraçada, os vidros quebrados e os pingentes
    ms.peca(GEO.cil, M.casco, 0, 4, -204, 25, 8, 25, 0, 0, 0, false);
    emCirculo(8, 0, -204, 12, (x, z, a) => { ms.peca(GEO.caixa, M.vidro, x, 10.5, z, 4, 4.5, 0.2, 0, a, 0, false); ms.peca(GEO.caixa, M.madeira2, x, 13, z, 4.6, 0.4, 0.5, 0, a, 0, false); for (let p = 0; p < 3; p++) estalactite(ms, M.geloSolido, x, z, 12.8, 1.2 + rng(), 0.35); }, Math.PI * 0.5, Math.PI);
    ms.peca(GEO.caixa, M.gelo, -6, 9, -210, 2.4, 2, 1.6, 0, 0.3, 0, false); ms.obst(-6, -210, 1.4); // os móveis presos no gelo
  },
});

// ---------- Torre de Vigia da Cordilheira ----------
const POR = tema('#5a5a78', '#ffe0c8', 1.65, 0.9, 30, 120, 'neve', '#ffffff');
export const TORRE_VIGIA = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'canion', tema: 'desfiladeiro' },
    { x: 0, z: -48, rx: 6, rz: 20, h: 0, tipo: 'canion', tema: 'desfiladeiro', etapa: 0 },
    { x: 4, z: -104, rx: 4, rz: 22, h: 4, tipo: 'plataforma', fundo: 24, tema: 'ponte', etapa: 1 },
    { x: 0, z: -158, r: 12, h: 6, tipo: 'gruta', tema: 'lareira', etapa: 2 },
    { x: 0, z: -206, r: 11, h: 14, tipo: 'plataforma', fundo: 30, tema: 'mirante', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 4, tipo: 'canion' }, { a: 1, b: 2, larg: 2.6, tipo: 'plataforma', fundo: 20 }, { a: 2, b: 3, larg: 2.6, tipo: 'plataforma', fundo: 22 }, { a: 3, b: 4, larg: 2.6, tipo: 'plataforma', fundo: 24 }],
  paredeVisivel: 44,
  temas: { desfiladeiro: tema('#7a8aa8', '#f0f4ff', 1.7, 0.9, 26, 105, 'neve', '#ffffff'), ponte: POR, lareira: tema('#3a2818', '#ffd0a0', 1.6, 0.4, 16, 75, 'neve', '#ffd8b0'), mirante: tema('#6a6080', '#ffe4c8', 1.75, 1, 40, 150, 'neve', '#ffffff') },
  chao: { desfiladeiro: CHAO_NEVE, ponte: ['#6a5a48', '#5a4a3a', '#e8f0f8'], lareira: ['#5a4632', '#4a3a2a'], mirante: ['#5a4632', '#e8f0f8'] },
  parede: { canion: ['#2a2e3a', '#34384a', '#e8f0f8', '#22262e'], todos: ['#4a4a52', '#3a3a42', '#5a4632'] },
  fundo: ['#c8d4e4', '#b0bcd0', '#2a2e3a'],
  portao: ['#3a3a42', '#ffb040'], porta: ['#3a3a42', '#ffb040'],
  trono: { x: 0, z: -210, ang: 0 },
  mats: { ...MATS, pedraTorre: '#5a5560', telhado: '#e8f0f8', fogo: '*#ff9a30' },
  decorar(ms, M, rng) {
    // o desfiladeiro: os penhascos escuros com neve nas saliências
    emVolta(ms, [0, 1], 24, 1, 5, (x, z) => ms.peca(GEO.dode, rng() < 0.4 ? M.neve : M.rocha2, x, 4 + rng() * 6, z, 3 + rng() * 3, 2 + rng() * 4, 3 + rng() * 3, rng(), rng() * 3, 0));
    // a ponte pênsil congelada sobre o vazio, com os pingentes nas cordas
    ponteTabuas(ms, M, { x: 0, z: -66, h: 4 }, { x: 4, z: -146, h: 6 }, 3.6, 1, true);
    for (let k = 0; k < 18; k++) estalactite(ms, M.geloSolido, 4 + (k % 2 ? 2.2 : -2.2), -76 - k * 4, 4.6, 1 + rng(), 0.25);
    agua(ms, '#dfe8f2', 0, -22, -120, 200, 220, 1, 0.1); // a neve lá no fundo do vale
    // a torre: o corpo de pedra subindo do penhasco, as toras escuras e as janelas que brilham
    ms.peca(GEO.caixa, M.pedraTorre, 0, -8, -206, 22, 43, 22, 0, 0, 0, false);
    ms.peca(GEO.caixa, M.madeira, 0, 5.8, -158, 24, 0.4, 24, 0, 0, 0, false);
    const janelas = [];
    for (const l of [-1, 1]) for (const z of [-152, -164]) { ms.peca(GEO.caixa, M.ambar, l * 12.4, 9, z, 0.2, 2, 1.6, 0, 0, 0, false); janelas.push([l * 12, 9, z]); }
    // o salão da lareira fria: a lareira de pedra, a mesa e a neve entrando pelas janelas
    ms.peca(GEO.caixa, M.pedraTorre, 0, 2.5, -169, 6, 5, 1.6); ms.peca(GEO.cone, M.fogo, 0, 0.9, -168, 1.4, 1.4, 1.4); janelas.push([0, 7.5, -168]); ms.obst(0, -169, 3);
    ms.peca(GEO.caixa, M.madeira, -6, 0.9, -156, 3, 0.25, 1.8); ms.obst(-6, -156, 1.6);
    lanterna(ms, M.ferro, M.ambar, 7, -152, 2);
    brilhos(ms, janelas, '#ffb040', 3.5, 0.7, 'janela');
    // o mirante do sino gelado: o telhado inclinado com neve e o sino de bronze congelado
    for (const [x, z] of [[-7, -199], [7, -199], [-7, -213], [7, -213]]) ms.peca(GEO.caixa, M.madeira, x, 14 + 3.5, z, 0.8, 7, 0.8, 0, 0, 0, false);
    ms.peca(GEO.cone4, M.telhado, 0, 23, -206, 22, 4, 22, 0, Math.PI / 4, 0, false);
    sino(ms, M.bronze, 0, 19.5, -206, 1.4);
    for (let p = 0; p < 8; p++) estalactite(ms, M.geloSolido, -7 + p * 2, -199, 21, 1 + rng(), 0.3);
    // os picos em volta, ao pôr do sol
    for (let i = 0; i < 10; i++) { const a = -1.4 + i * 0.3; ms.peca(GEO.cone, i % 2 ? M.neve : M.rocha2, Math.sin(a) * 160, -20, -170 - Math.cos(a) * 160, 50 + rng() * 30, 80 + rng() * 40, 50, 0, rng(), 0, false); }
  },
});

export const GELO = { geleira: CORACAO_GELEIRA, minaNorte: MINA_PASSO_NORTE, runico: TEMPLO_RUNICO, termas: TERMAS_VAPOR, quebraGelo: QUEBRA_GELO, vigia: TORRE_VIGIA };
