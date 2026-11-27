// =============================================================
// LABIRINTO DO MANGUEZAL TRANSLÚCIDO (dungeon do Arquipélago, pelo guia do Lâmina)
// Passarelas de madeira clara entre as raízes gigantes do mangue, a palmos de uma
// laguna rasa e transparente (dá para ver a areia branca lá embaixo):
//  entrada  → a praia de areia, na beira da laguna
//  grupo 1  → Portal das Raízes em Arco: o túnel de raízes por cima da água
//  grupo 2  → Passarela dos Espelhos Rasos: o cruzamento das passarelas (com becos sem saída)
//  grupo 3  → Clareira das Árvores-Gaiola: a cúpula de galhos e cipós floridos
//  (portão selado do Rei)
//  Rei      → Relicário da Maré Parada: a plataforma octogonal de pedra branca, com nenúfares
// =============================================================
import * as THREE from 'three';
import { GEO } from '../dungeon.js';
import { palmeira, portaDeLuz, portaoSimples, emVolta, noChao, emCirculo, agua, feixe, brilhos, samambaia, flor, cipo } from './pecas.js';

const P = { tipo: 'plataforma', fundo: 1.8, h: 0.6 }; // as passarelas: 1,8 m acima do fundo de areia
const SALAS = [
  { x: 0, z: 0, r: 10, h: 0.3, tipo: 'aberta', tema: 'praia' },                       // 0 a praia
  { ...P, x: 0, z: -50, rx: 8, rz: 18, tema: 'tunel', etapa: 0 },                     // 1 o túnel de raízes
  { ...P, x: 4, z: -108, r: 13, tema: 'espelhos', etapa: 1 },                         // 2 o cruzamento
  { ...P, x: 30, z: -96, r: 5, tema: 'espelhos' },                                    // 3 beco sem saída (leste)
  { ...P, x: -24, z: -118, r: 5, tema: 'espelhos' },                                  // 4 beco sem saída (oeste)
  { ...P, x: -12, z: -160, r: 13, tema: 'gaiola', etapa: 2 },                         // 5 a clareira das árvores-gaiola
  { ...P, x: 0, z: -214, r: 15, h: 1.2, fundo: 2.4, tema: 'relicario', fim: true },   // 6 o relicário
];
const MAR = -0.55; // a superfície da laguna (o fundo de areia fica em -1,2)
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export const ARQ_MANGUE = {
  paredeVisivel: 34,
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 2.4, ...P },
      { a: 1, b: 2, larg: 1.9, ...P },
      { a: 2, b: 3, larg: 1.6, ...P },
      { a: 2, b: 4, larg: 1.6, ...P },
      { a: 2, b: 5, larg: 1.9, ...P },
      { a: 5, b: 6, larg: 2.2, ...P },
    ],
  },
  corSelo: '#7dffd8',
  portoes: [{ corredor: 5 }],
  acampamentos: [{ x: 0, z: -52, etapa: 0 }, { x: 4, z: -108, etapa: 1 }, { x: -12, z: -160, etapa: 2 }],
  inicio: { x: 0, z: -8, ang: Math.PI },
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 0, z: -220, ang: 0 },
  portal: { x: 10, z: -212, ang: -0.4 },

  temas: {
    praia: { ceu: '#9ae0f0', hemi: '#f0fff4', luz: 1.8, sol: 1.4, nevoa: [40, 135], part: 'brilho', corPart: '#ffffff' },
    tunel: { ceu: '#7ab8a0', hemi: '#e8fff0', luz: 1.65, sol: 0.95, nevoa: [28, 105], part: 'brilho', corPart: '#f0ffd8' },
    espelhos: { ceu: '#a0e4f0', hemi: '#f4fff8', luz: 1.85, sol: 1.45, nevoa: [40, 140], part: 'brilho', corPart: '#ffffff' },
    gaiola: { ceu: '#6aa890', hemi: '#e0ffe8', luz: 1.6, sol: 0.85, nevoa: [26, 100], part: 'brilho', corPart: '#f8ffc8' },
    relicario: { ceu: '#a8e8f4', hemi: '#fffff4', luz: 1.85, sol: 1.45, nevoa: [42, 145], part: 'brilho', corPart: '#fffbe0' },
  },

  corChao(c, { sala, d, rng, x, z }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (s.tema === 'praia') return c.set(sorteia(rng, ['#f6eed8', '#eee6cc']));
      if (s.tema === 'relicario') return c.set(sorteia(rng, ['#f2f0e8', '#e8e6dc', '#faf8f0']));
      return c.set(Math.floor((x * 0.7 + z * 0.7) / 1.1) % 2 ? '#e2d8c0' : '#d4c8ac');                 // as tábuas branqueadas pelo sol
    }
    if (s.tema === 'praia') return c.set(sorteia(rng, ['#f2e8cc', '#6aa860', '#5f9a54']));
    return c.set(sorteia(rng, ['#f4eed8', '#ece4cc', '#e2dac0', '#c8dcc0']));                        // a areia branca no fundo
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#d8ccae'), ms.brilho('#7dffd8', 0.7), ms.mat('#8a6a44')); },

  decorar(ms) {
    const rng = ms.rng, F = ms.forma;
    const M = {
      tronco: ms.mat('#8a6a44'), folha: ms.mat('#4fa03a'), folha2: ms.mat('#62b448'),
      raiz: ms.mat('#8a6a48'), raiz2: ms.mat('#7a5a3c'), copa: ms.mat('#4a9a3a'), copa2: ms.mat('#5aac44'),
      tabua: ms.mat('#e2d8c0'), estaca: ms.mat('#b8a888'), corda: ms.mat('#c8b080'),
      pedraBranca: ms.mat('#f2f0e6'), pedraBranca2: ms.mat('#dcd8cc'), nenufar: ms.mat('#4aa04a'),
      hibisco: ms.mat('#ff5a4a'), orquidea: ms.mat('#d07ae0'), amarela: ms.mat('#ffc840'), miolo: ms.mat('#ffe07a'),
      samambaia: ms.mat('#3f9a4a'), cipo: ms.mat('#4a8a3a'), pedraFundo: ms.mat('#a8b0a0'),
    };
    portaDeLuz(ms, '#d8ccae', '#7dffd8', '#e8fff8');
    // a laguna clarinha de ponta a ponta
    agua(ms, '#6fe8e0', 0, MAR, -110, 150, 260, 0.38, 0.25);
    emVolta(ms, [0], 10, 2, 12, (x, z) => palmeira(ms, M, x, z, 0.9 + rng() * 0.4));

    // ---- árvore do mangue: tronco, raízes em arco entrando na água e a copa ----
    const mangue = (x, z, e = 1) => {
      const base = MAR + 2.2 * e;
      ms.peca(GEO.cil, M.raiz, x, base + 2.5 * e, z, 1.1 * e, 5 * e, 1.1 * e, 0, 0, 0, false);
      for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.28 + rng(); ms.peca(GEO.arco, k % 2 ? M.raiz : M.raiz2, x + Math.cos(a) * 1.6 * e, MAR - 0.6, z + Math.sin(a) * 1.6 * e, 1.8 * e, 3 * e, 1.2 * e, 0, -a, 0, false); }
      ms.peca(GEO.ico, rng() < 0.5 ? M.copa : M.copa2, x, base + 6.5 * e, z, 5.5 * e, 3 * e, 5.5 * e, 0, rng() * 3, 0, false);
      ms.obst(x, z, 1.2 * e);
    };
    emVolta(ms, [1, 2, 3, 4, 5, 6], 46, 3, 20, (x, z) => mangue(x, z, 0.9 + rng() * 0.6));
    // as estacas e as cordas das passarelas (em volta de cada sala e corredor)
    for (let i = 1; i < SALAS.length; i++) emCirculo(Math.round(SALAS[i].rx * 1.1), SALAS[i].x, SALAS[i].z, SALAS[i].rx + 0.3, (x, z) => ms.peca(GEO.cil, M.estaca, x, -0.2, z, 0.3, 2, 0.3, 0, 0, 0, false));
    for (const c of F.corredores.slice(1)) {
      const n = Math.ceil(Math.hypot(c.bx - c.ax, c.bz - c.az) / 3.2), ang = Math.atan2(c.ux, c.uz);
      for (let i = 0; i <= n; i++) for (const l of [-1, 1]) {
        const t = i / n, x = c.ax + (c.bx - c.ax) * t + Math.cos(ang) * (c.larg + 0.2) * l, z = c.az + (c.bz - c.az) * t - Math.sin(ang) * (c.larg + 0.2) * l;
        ms.peca(GEO.cil, M.estaca, x, 0.1, z, 0.22, 2.6, 0.22, 0, 0, 0, false);
        if (i < n) ms.peca(GEO.cil, M.corda, x + c.ux * 1.6, 1.1, z + c.uz * 1.6, 0.08, 3.2, 0.08, Math.PI / 2, ang, 0, false);
      }
    }

    // ---- o túnel de raízes em arco por cima da passarela ----
    const s1 = SALAS[1];
    for (let k = 0; k < 7; k++) { const z = s1.z + 16 - k * 5.4; ms.peca(GEO.arco, k % 2 ? M.raiz : M.raiz2, s1.x + (rng() - 0.5), 0.2, z, s1.rx + 1.5, 7 + rng() * 2, 2.2, 0, 0, 0, false); }
    emVolta(ms, [1], 16, 0.5, 3, (x, z) => cipo(ms, M.cipo, x, z, 7, 3 + rng() * 3, rng() < 0.5 ? M.orquidea : null, M.miolo));

    // ---- os espelhos rasos: reflexos de sol na água, flores nas pontas dos becos ----
    const ref = [];
    for (let i = 0; i < 90; i++) ref.push([(rng() - 0.5) * 90, MAR + 0.05, -80 - rng() * 60]);
    brilhos(ms, ref, '#ffffff', 0.5, 0.75, 'espelho');
    for (const i of [3, 4]) emCirculo(5, SALAS[i].x, SALAS[i].z, 2.5, (x, z) => flor(ms, rng() < 0.5 ? M.hibisco : M.amarela, M.miolo, x, 0.3, z, 1.1));

    // ---- a clareira das árvores-gaiola: a cúpula de galhos curvos e os cipós floridos ----
    const s5 = SALAS[5];
    for (let k = 0; k < 8; k++) ms.peca(GEO.arco, k % 2 ? M.raiz : M.raiz2, s5.x, 0.4, s5.z, s5.r + 1.5, 11, 1.6, 0, (k / 8) * Math.PI, 0, false);
    ms.peca(GEO.ico, M.copa, s5.x, 12.5, s5.z, s5.r * 1.6, 3, s5.r * 1.6, 0, 0, 0, false);
    emCirculo(14, s5.x, s5.z, s5.r - 1, (x, z) => cipo(ms, M.cipo, x, z, 10.5, 4 + rng() * 4, rng() < 0.6 ? M.hibisco : M.orquidea, M.miolo));
    for (let k = 0; k < 4; k++) feixe(ms, s5.x - 6 + k * 4, s5.z - 4 + (k % 2) * 6, 0.6, 12, 1.3, '#fff6c8', 0.13, (k - 1.5) * 0.1);

    // ---- o relicário: a plataforma octogonal de pedra branca, os nenúfares e as flores ----
    const s6 = SALAS[6], oct = ms.geo(new THREE.CylinderGeometry(1, 1, 1, 8));
    ms.peca(oct, M.pedraBranca2, s6.x, s6.h - 1.4, s6.z, s6.r + 1.2, 2.6, s6.r + 1.2, 0, Math.PI / 8, 0, false);
    ms.peca(oct, M.pedraBranca, s6.x, s6.h - 0.05, s6.z, 5, 0.2, 5, 0, Math.PI / 8, 0, false);
    for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + (k / 8) * 6.28; ms.peca(GEO.caixa, M.pedraBranca2, s6.x + Math.sin(a) * 9, s6.h + 0.04, s6.z + Math.cos(a) * 9, 0.4, 0.1, 7, 0, a, 0, false); }
    emCirculo(22, s6.x, s6.z, s6.r + 3.5, (x, z) => { ms.peca(GEO.disco, M.nenufar, x + (rng() - 0.5) * 3, MAR + 0.04, z + (rng() - 0.5) * 3, 1 + rng() * 0.6, 1, 1 + rng() * 0.6, 0, 0, 0, false); if (rng() < 0.4) flor(ms, rng() < 0.5 ? M.hibisco : M.orquidea, M.miolo, x, MAR + 0.25, z, 0.9, false); });
    emCirculo(10, s6.x, s6.z, s6.r - 1.5, (x, z) => (rng() < 0.5 ? samambaia(ms, M.samambaia, x, z, 0.9) : flor(ms, [M.hibisco, M.orquidea, M.amarela][Math.floor(rng() * 3)], M.miolo, x, 0.3, z, 1.2)), 0.4, Math.PI * 1.2);
  },
};
