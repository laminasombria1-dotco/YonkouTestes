// =============================================================
// FAROL SUBMERSO DE SOLIS (dungeon do Arquipélago, pelo guia do Lâmina)
// Uma torre de vigia com espelhos solares que afundou no recife: você chega pela ilha,
// sobe a escada até o topo e vai descendo, do sol para o fundo do mar:
//  entrada  → a ilha, com a torre inclinada saindo da água
//  grupo 1  → Topo da Escadaria Quebrada: a plataforma ao sol no alto da torre
//  grupo 2  → Galeria dos Prismas Salinos: janelas em arco, espelhos de bronze e cristais de sal
//  grupo 3  → Câmara da Lente Submersa: meio alagada, corais e a lente gigante
//  (portão selado do Rei)
//  Rei      → Base do Recife Profundo: o salão no fundo, arcos de pedra, esponjas que brilham e feixes de sol
// =============================================================
import * as THREE from 'three';
import { GEO } from '../dungeon.js';
import { palmeira, coral, portaDeLuz, portaoSimples, emVolta, noChao, emCirculo, agua, feixe, brilhos, transparente, cristais, coluna, arcoEntre } from './pecas.js';

const SALAS = [
  { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'ilha' },                                         // 0 a ilha
  { x: 0, z: -52, r: 14, h: 12, tipo: 'plataforma', fundo: 15, tema: 'topo', etapa: 0 },             // 1 o topo da torre
  { x: 6, z: -104, r: 16, h: 7, tipo: 'gruta', tema: 'galeria', etapa: 1 },                          // 2 a galeria (dentro da torre)
  { x: -4, z: -156, r: 16, h: 3, tipo: 'gruta', tema: 'lente', etapa: 2 },                           // 3 a câmara da lente
  { x: 0, z: -212, r: 22, h: -1, tipo: 'gruta', tema: 'recife', fim: true },                         // 4 a base do recife
];
const MAR = -2.2; // a altura do mar em volta da torre
const CHAO = {
  ilha: ['#f2e6c4', '#e8dab2', '#f8eed2'], topo: ['#e8dcc0', '#ddd0b2', '#f0e6cc'], galeria: ['#d8ccb0', '#cfc2a4', '#e0d6bc'],
  lente: ['#b8d0c4', '#a8c4b8', '#c4dace'], recife: ['#e8e2cc', '#dcd6bc', '#f0ead6'],
};
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export const ARQ_FAROL = {
  paredeVisivel: 40,
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 3.2, tipo: 'plataforma', fundo: 14 },  // a escada de pedra que sobe pela torre
      { a: 1, b: 2, larg: 3.5 },                                  // a escada em espiral, para dentro
      { a: 2, b: 3, larg: 3.5 },                                  // a rampa até a linha d'água
      { a: 3, b: 4, larg: 4.5 },                                  // os arcos submersos
    ],
  },
  corSelo: '#5fe0ff',
  portoes: [{ corredor: 3 }],
  acampamentos: [{ x: 0, z: -54, etapa: 0 }, { x: 6, z: -106, etapa: 1 }, { x: -4, z: -158, etapa: 2 }],
  inicio: { x: 0, z: -8, ang: Math.PI },
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 0, z: -226, ang: 0 },
  portal: { x: 12, z: -222, ang: -0.4 },

  temas: {
    ilha: { ceu: '#8fd8ff', hemi: '#eafcff', luz: 1.8, sol: 1.4, nevoa: [45, 140], part: 'brilho', corPart: '#ffffff' },
    topo: { ceu: '#86d2ff', hemi: '#fff8e4', luz: 1.85, sol: 1.5, nevoa: [50, 150], part: 'brilho', corPart: '#fff6d0' },
    galeria: { ceu: '#a8b8c0', hemi: '#fff2dc', luz: 1.65, sol: 0.8, nevoa: [24, 95], part: 'faisca', corPart: '#fff4c0' },
    lente: { ceu: '#3a8aa0', hemi: '#d8fbff', luz: 1.55, sol: 0.55, nevoa: [22, 90], part: 'faisca', corPart: '#c8fbff' },
    recife: { ceu: '#0e4a78', hemi: '#a8e8ff', luz: 1.5, sol: 0.4, nevoa: [16, 80], part: 'faisca', corPart: '#d8f6ff' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng }) {
    const s = SALAS[sala];
    if (d <= 0.6) return c.set(sorteia(rng, CHAO[s.tema]));
    if (tipo === 'plataforma' || h < MAR + 0.5) return c.set(sorteia(rng, ['#f2ead0', '#e6dcbc', '#d8cfae'])); // o fundo de areia sob o mar
    if (tipo === 'aberta') return c.set(sorteia(rng, ['#e8dab2', '#6aa05a', '#5f9550']));
    if (s.tema === 'recife') return c.set(sorteia(rng, ['#24486a', '#2a5478', '#1e3e5e']));
    return c.set(sorteia(rng, ['#d8ccae', '#cbbf9e', '#9ab0a0']));
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#e8dcc0'), ms.brilho('#5fe0ff', 0.7), ms.mat('#7a9a7a')); },

  decorar(ms) {
    const rng = ms.rng, T = SALAS.map((s) => s.h);
    const M = {
      tronco: ms.mat('#9a7448'), folha: ms.mat('#4fa03a'), folha2: ms.mat('#62b448'),
      marfim: ms.mat('#ece0c2'), marfim2: ms.mat('#d8cba8'), bronze: ms.mat('#5f8f74'), bronzeVelho: ms.mat('#8a6a3a'),
      espelho: ms.mat('#e8f4ff', { emissive: '#bfe0ff', emissiveIntensity: 0.6 }), musgo: ms.mat('#5a8a3a'),
      sal: ms.brilho('#f4f0ff', 0.5), sal2: ms.brilho('#d8c8ff', 0.5), vidro: transparente(ms, '#bff4ff', 0.45, { emissive: '#7fd8f0', emissiveIntensity: 0.6 }),
      coralRosa: ms.mat('#ff7eb6'), coralLaranja: ms.mat('#ff9a4a'), coralRoxo: ms.mat('#b58cff'), coralAmarelo: ms.mat('#ffd23f'),
      esponja: ms.brilho('#7fffe0', 0.7), esponja2: ms.brilho('#ff9ad8', 0.6), pedraFundo: ms.mat('#9aa8a0'),
    };
    const corais = [M.coralRosa, M.coralLaranja, M.coralRoxo, M.coralAmarelo];
    const oct = ms.geo(new THREE.OctahedronGeometry(0.6, 0));
    portaDeLuz(ms, '#ece0c2', '#5fe0ff');

    // ---- a ilha e o mar em volta da torre ----
    agua(ms, '#3fd0e0', 0, MAR + 0.6, -60, 170, 190, 0.72, 0.25);
    emVolta(ms, [0], 12, 2, 12, (x, z) => palmeira(ms, M, x, z, 0.9 + rng() * 0.4));
    // a torre: o corpo de pedra marfim por baixo do topo, com anéis de bronze e trepadeiras
    const s1 = SALAS[1];
    ms.peca(GEO.cil, M.marfim, s1.x, (T[1] + MAR - 2) / 2, s1.z, s1.r * 2 + 1, T[1] - MAR + 2, s1.r * 2 + 1, 0.04, 0, 0.05, false);
    for (const y of [T[1] - 0.4, T[1] - 6]) ms.peca(GEO.cil, M.bronze, s1.x, y, s1.z, s1.r * 2 + 2, 0.7, s1.r * 2 + 2, 0, 0, 0, false);
    // a escada sem corrimão (degraus por cima do corredor que sobe da ilha)
    for (let k = 0; k < 14; k++) { const t = k / 13, z = -10 - t * 28; ms.peca(GEO.caixa, M.marfim2, 0, t * T[1] - 0.5, z, 6.4, 1, 2.4, 0, 0, 0, false); }
    // o topo: o parapeito quebrado com musgo, um espelho solar e os cristais de sal
    emCirculo(16, s1.x, s1.z, s1.r + 0.4, (x, z, a) => { if (rng() < 0.3 || Math.abs(Math.sin(a)) < 0.25) return; ms.peca(GEO.caixa, rng() < 0.3 ? M.musgo : M.marfim2, x, T[1] + 0.6, z, 2.4, 1.2 + rng(), 0.8, 0, a, 0, false); });
    ms.peca(GEO.cil, M.bronzeVelho, s1.x - 9, T[1] + 2, s1.z - 4, 0.5, 4, 0.5, 0, 0, 0, false);
    ms.peca(GEO.cil, M.espelho, s1.x - 9, T[1] + 4.4, s1.z - 4, 3.2, 0.25, 3.2, 1.2, 0.5, 0, false);
    feixe(ms, s1.x - 9, s1.z - 4, T[1] + 4.4, 30, 1.2, '#fff6c0', 0.12, 0.5);

    // ---- Galeria dos Prismas: janelas em arco que brilham, espelhos de bronze e cristais de sal ----
    const s2 = SALAS[2];
    emCirculo(10, s2.x, s2.z, s2.r + 1.6, (x, z, a) => {
      ms.peca(GEO.caixa, M.vidro, x, T[2] + 4, z, 2.2, 5, 0.3, 0, a, 0, false);       // a janela
      ms.peca(GEO.arco, M.marfim2, x, T[2] + 6.5, z, 1.3, 1.3, 1.2, 0, a + Math.PI / 2, 0, false);
      if (rng() < 0.6) { ms.peca(GEO.caixa, M.bronzeVelho, x * 0.9 + s2.x * 0.1, T[2] + 2.6, z * 0.9 + s2.z * 0.1, 1.6, 3.2, 0.25, 0, a, 0, false); ms.peca(GEO.caixa, M.espelho, x * 0.9 + s2.x * 0.1, T[2] + 2.6, z * 0.9 + s2.z * 0.1, 1.2, 2.6, 0.3, 0, a, 0, false); }
    }, 0.3);
    noChao(ms, 2, 7, 7, (x, z) => cristais(ms, oct, M.sal, M.sal2, x, z, 0.6 + rng() * 0.4, true));
    for (let k = 0; k < 3; k++) feixe(ms, s2.x - 8 + k * 8, s2.z - 6 + k * 3, T[2], 9, 1.6, '#fff0c8', 0.12, 0.6 - k * 0.3);

    // ---- Câmara da Lente: meio alagada, a lente gigante cercada de corais ----
    const s3 = SALAS[3];
    agua(ms, '#46d8e0', s3.x, T[3] + 0.35, s3.z, 36, 36, 0.48, 0.5);
    ms.peca(GEO.cil, M.bronze, s3.x + 9, T[3] + 0.6, s3.z - 6, 4, 1.2, 4, 0, 0, 0, false);
    ms.peca(GEO.cil, M.vidro, s3.x + 9, T[3] + 4.4, s3.z - 6, 5.5, 1.2, 5.5, Math.PI / 2, 0.5, 0, false);
    ms.peca(GEO.toro, M.bronze, s3.x + 9, T[3] + 4.4, s3.z - 6, 2.9, 2.9, 4, 0, 0.5, 0, false);
    ms.obst(s3.x + 9, s3.z - 6, 3);
    emVolta(ms, [3], 22, 0.3, 4, (x, z) => coral(ms, corais, x, z, 0.9 + rng() * 0.8));
    noChao(ms, 3, 8, 7, (x, z) => coral(ms, corais, x, z, 0.7, true));
    brilhos(ms, [[s3.x + 9, T[3] + 4.4, s3.z - 6]], '#bff8ff', 9, 0.5, 'lente');

    // ---- Base do Recife Profundo: arcos de pedra, esponjas que brilham, feixes de sol e bolhas ----
    const s4 = SALAS[4];
    const pil = [];
    emCirculo(10, s4.x, s4.z, s4.r - 3, (x, z) => { coluna(ms, M.pedraFundo, x, z, 9, 1.2); pil.push([x, z]); });
    for (let i = 0; i < pil.length; i++) { const [ax, az] = pil[i], [bx, bz] = pil[(i + 1) % pil.length]; arcoEntre(ms, M.pedraFundo, ax, az, bx, bz, T[4] + 8.7, 0.8); }
    emVolta(ms, [4, 3], 40, 0.3, 6, (x, z) => (rng() < 0.55 ? coral(ms, corais, x, z, 1 + rng()) : ms.peca(GEO.cil, rng() < 0.5 ? M.esponja : M.esponja2, x, 1.2, z, 0.9, 2.4 + rng() * 2, 0.9)));
    noChao(ms, 4, 10, 8, (x, z) => ms.peca(GEO.cil, rng() < 0.5 ? M.esponja : M.esponja2, x, 0.8, z, 0.7, 1.6, 0.7));
    for (let k = 0; k < 5; k++) feixe(ms, s4.x - 12 + k * 6, s4.z - 4 + (k % 2) * 8, T[4], 20, 2, '#bfefff', 0.1, (k - 2) * 0.05);
    ms.peca(GEO.cil, M.pedraFundo, ms.plano.trono.x, 0.3, ms.plano.trono.z, 8, 0.6, 8);
    const bolhas = [];
    for (let i = 0; i < 80; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 20; bolhas.push([s4.x + Math.cos(a) * r, T[4] + rng() * 12, s4.z + Math.sin(a) * r]); }
    brilhos(ms, bolhas, '#c8f4ff', 0.35, 0.7, 'bolha');
  },
};
