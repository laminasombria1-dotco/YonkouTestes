// =============================================================
// CALDEIRA VERDE DA ILHA ALTA (dungeon do Arquipélago, pelo guia do Lâmina)
// Uma subida ao ar livre pelos terraços de um vulcão antigo, todo verde:
//  entrada  → a base da trilha, na mata
//  grupo 1  → Garganta das Samambaias Gigantes: degraus de pedra com musgo e folhas enormes
//  grupo 2  → Terraços das Cachoeiras Gêmeas: piscinas verde-esmeralda e as duas quedas d'água
//  grupo 3  → Ponte Pênsil dos Bambuzais: a ponte de bambu sobre o abismo e a borda da cratera
//  (portão selado do Rei)
//  Rei      → Mirante da Cratera Florido: a ruína redonda no pico, com hibiscos e o mar lá embaixo
// =============================================================
import { GEO } from '../dungeon.js';
import { palmeira, portaDeLuz, portaoSimples, emVolta, noChao, emCirculo, agua, feixe, brilhos, transparente, samambaia, flor, cipo, pedra, coluna } from './pecas.js';

const SALAS = [
  { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'base' },                                          // 0 a base da trilha
  { x: 0, z: -54, rx: 11, rz: 24, h: 3.5, tipo: 'canion', tema: 'garganta', etapa: 0 },               // 1 a garganta
  { x: -12, z: -116, r: 22, h: 7, tipo: 'aberta', tema: 'terracos', etapa: 1 },                       // 2 os terraços
  { x: 4, z: -190, rx: 15, rz: 12, h: 11, tipo: 'aberta', tema: 'borda', etapa: 2 },                  // 3 a borda depois da ponte
  { x: 6, z: -238, r: 17, h: 15, tipo: 'plataforma', fundo: 24, tema: 'mirante', fim: true },         // 4 o mirante no pico
];
const PISCINAS = [{ x: -26, z: -110, r: 5 }, { x: 0, z: -124, r: 4.5 }];
const MAR = -9; // o mar, lá embaixo do mirante
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export const ARQ_CALDEIRA = {
  paredeVisivel: 34,
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 4.5, tipo: 'canion' },
      { a: 1, b: 2, larg: 4, tipo: 'aberta' },       // a escada lateral
      { a: 2, b: 3, larg: 1.9, tipo: 'aberta' },     // a ponte pênsil de bambu (sobre o abismo)
      { a: 3, b: 4, larg: 3.5, tipo: 'aberta' },
    ],
    abismos: [{ corredor: 2, r: 16, fundo: 22 }],
    buracos: PISCINAS,
  },
  corSelo: '#7dffb0',
  portoes: [{ corredor: 3 }],
  acampamentos: [{ x: 0, z: -56, etapa: 0 }, { x: -10, z: -114, etapa: 1 }, { x: 4, z: -190, etapa: 2 }],
  inicio: { x: 0, z: -8, ang: Math.PI },
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 6, z: -244, ang: 0 },
  portal: { x: 15, z: -236, ang: -0.4 },

  temas: {
    base: { ceu: '#9adcf0', hemi: '#f0ffe8', luz: 1.75, sol: 1.35, nevoa: [36, 125], part: 'brilho', corPart: '#f8ffd0' },
    garganta: { ceu: '#a8dcc8', hemi: '#e8ffd8', luz: 1.7, sol: 1.2, nevoa: [30, 110], part: 'brilho', corPart: '#e8ffb0' },
    terracos: { ceu: '#a0e0f0', hemi: '#f4ffe8', luz: 1.8, sol: 1.4, nevoa: [40, 135], part: 'brilho', corPart: '#ffffff' },
    borda: { ceu: '#f0d8a8', hemi: '#fff0d8', luz: 1.8, sol: 1.45, nevoa: [44, 145], part: 'brilho', corPart: '#fff2c0' },
    mirante: { ceu: '#f4d8a0', hemi: '#fff2d8', luz: 1.85, sol: 1.5, nevoa: [60, 190], part: 'brilho', corPart: '#ffe8b0' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (h < hChao - 0.6) return c.set('#2fb890');                                                  // as piscinas esmeralda
      if (s.tema === 'garganta' || s.tema === 'mirante') return c.set(sorteia(rng, ['#b8b8a0', '#aab090', '#c4c4aa', '#7aa05a']));
      return c.set(sorteia(rng, ['#6ab04a', '#5fa040', '#78bc54']));
    }
    if (h < hChao - 6) return c.set(sorteia(rng, tipo === 'plataforma' ? ['#3a8a5a', '#4a9a64', '#d8d0b0'] : ['#2a4a3a', '#223e30'])); // a encosta lá embaixo
    if (tipo === 'canion') return c.set(sorteia(rng, ['#8a9a7a', '#7a8a6a', '#5a8a3a', '#a0a88a']));
    return c.set(sorteia(rng, ['#4f9a3a', '#5aa844', '#3f8a32', '#9aa08a']));
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#c8c4a8'), ms.brilho('#7dffb0', 0.7), ms.mat('#9a9a80')); },

  decorar(ms) {
    const rng = ms.rng, T = SALAS.map((s) => s.h);
    const M = {
      tronco: ms.mat('#8a6a44'), folha: ms.mat('#3f9a3a'), folha2: ms.mat('#52ac44'),
      samambaia: ms.mat('#2f8a3a'), samambaia2: ms.mat('#46a848'), musgo: ms.mat('#5a9a3a'), pedra: ms.mat('#b8b8a0'), pedra2: ms.mat('#9a9a84'),
      bromelia: ms.mat('#e8503a'), hibisco: ms.mat('#ff4a4a'), orquidea: ms.mat('#c07ae0'), miolo: ms.mat('#ffe07a'),
      bambu: ms.mat('#a8b04a'), bambu2: ms.mat('#8a9a3a'), corda: ms.mat('#c8a870'),
      cascata: transparente(ms, '#e8fbff', 0.7, { emissive: '#bfeeff', emissiveIntensity: 0.6 }), espuma: ms.brilho('#ffffff', 0.5),
      calc: ms.mat('#ece4cc'), ilha: ms.mat('#4f9a3a'),
    };
    portaDeLuz(ms, '#c8c4a8', '#7dffb0', '#e8fff0');

    // ---- a base e a garganta: mata densa, samambaias gigantes, bromélias e degraus de pedra ----
    emVolta(ms, [0], 12, 2, 12, (x, z) => (rng() < 0.6 ? palmeira(ms, M, x, z, 0.9 + rng() * 0.5) : samambaia(ms, M.samambaia, x, z, 2 + rng())));
    emVolta(ms, [1], 36, 0.5, 6, (x, z) => { const r = rng(); if (r < 0.55) samambaia(ms, rng() < 0.5 ? M.samambaia : M.samambaia2, x, z, 2.2 + rng() * 1.5); else if (r < 0.8) flor(ms, M.bromelia, M.miolo, x, 0.5, z, 1.6); else pedra(ms, M.musgo, x, z, 1.5 + rng()); });
    for (let k = 0; k < 12; k++) { const t = k / 11, z = -12 - t * 64; ms.peca(GEO.caixa, k % 2 ? M.pedra : M.pedra2, 0, 0.12, z, 7, 0.3, 1.5, 0, (rng() - 0.5) * 0.1, 0); }

    // ---- os terraços: as piscinas esmeralda, as duas cachoeiras e o arco-íris na espuma ----
    const s2 = SALAS[2];
    for (const P of PISCINAS) { agua(ms, '#2fd0a0', P.x, T[2] - 0.55, P.z, P.r * 2.4, P.r * 2.4, 0.78, 0.4); emCirculo(9, P.x, P.z, P.r + 1, (x, z) => pedra(ms, M.pedra, x, z, 0.8 + rng() * 0.5)); }
    for (const P of PISCINAS) {
      const cz = P.z - P.r - 2;                                                                     // a queda d'água atrás da piscina
      ms.peca(GEO.caixa, M.cascata, P.x, T[2] + 8, cz, 3.2, 16, 0.3, 0, 0, 0, false);
      ms.peca(GEO.caixa, M.pedra2, P.x, T[2] + 8, cz - 1.2, 9, 18, 2.5, 0, 0, 0, false);
      const sp = []; for (let i = 0; i < 30; i++) sp.push([P.x + (rng() - 0.5) * 4, T[2] + rng() * 2, cz + 1 + rng() * 3]);
      brilhos(ms, sp, '#ffffff', 0.7, 0.7, 'espuma');
    }
    const ARCO_IRIS = ['#ff5a5a', '#ffa040', '#ffe050', '#60e070', '#50b0ff', '#a070ff'];
    ARCO_IRIS.forEach((cor, i) => ms.peca(GEO.toro, transparente(ms, cor, 0.28, { emissive: cor, emissiveIntensity: 0.7 }), -13, T[2] + 2, -123, 7 + i * 0.45, 7 + i * 0.45, 1.6, 0, 0.15, 0, false));
    emVolta(ms, [2], 30, 1, 8, (x, z) => (rng() < 0.6 ? samambaia(ms, M.samambaia2, x, z, 1.6 + rng()) : palmeira(ms, M, x, z, 0.8 + rng() * 0.4)));

    // ---- a ponte pênsil de bambu: tábuas, cordas e os bambuzais nas duas pontas ----
    const A = SALAS[2], B = SALAS[3], ang = Math.atan2(B.x - A.x, B.z - A.z), L = Math.hypot(B.x - A.x, B.z - A.z);
    for (let i = 0; i <= Math.ceil(L / 1.2); i++) {
      const t = i / Math.ceil(L / 1.2), x = A.x + (B.x - A.x) * t, z = A.z + (B.z - A.z) * t, y = A.h + (B.h - A.h) * t;
      ms.peca(GEO.caixa, i % 2 ? M.bambu : M.bambu2, x, y - 0.1, z, 3.6, 0.2, 0.9, 0, ang, 0, false);
      if (i % 3 === 0) for (const l of [-1, 1]) ms.peca(GEO.cil, M.bambu2, x + Math.cos(ang) * 1.9 * l, y + 0.6, z - Math.sin(ang) * 1.9 * l, 0.15, 1.3, 0.15, 0, 0, 0, false);
    }
    for (const l of [-1, 1]) for (let i = 0; i < 20; i++) {
      const t = (i + 0.5) / 20, x = A.x + (B.x - A.x) * t + Math.cos(ang) * 1.9 * l, z = A.z + (B.z - A.z) * t - Math.sin(ang) * 1.9 * l, y = A.h + (B.h - A.h) * t + 1.2;
      ms.peca(GEO.cil, M.corda, x, y, z, 0.1, L / 20 + 0.3, 0.1, Math.PI / 2, ang, 0, false);
    }
    emVolta(ms, [3], 26, 1, 7, (x, z) => { for (let k = 0; k < 4; k++) ms.peca(GEO.cil, k % 2 ? M.bambu : M.bambu2, x + (rng() - 0.5) * 2, 4, z + (rng() - 0.5) * 2, 0.35, 8 + rng() * 3, 0.35, (rng() - 0.5) * 0.15, 0, (rng() - 0.5) * 0.15); });
    feixe(ms, (A.x + B.x) / 2, (A.z + B.z) / 2, A.h - 18, 30, 12, '#ffffff', 0.06); // a névoa do abismo

    // ---- o mirante: a ruína redonda de calcário, hibiscos, orquídeas e o mar lá embaixo ----
    const s4 = SALAS[4];
    agua(ms, '#3fc8e0', s4.x, MAR, s4.z - 30, 260, 200, 0.85, 0.25);
    for (let i = 0; i < 8; i++) { const a = rng() * 6.28, r = 60 + rng() * 60; ms.peca(GEO.dode, M.ilha, s4.x + Math.cos(a) * r, MAR + 1, s4.z - 40 + Math.sin(a) * r * 0.5, 14 + rng() * 14, 4 + rng() * 5, 12 + rng() * 10, 0, rng() * 3, 0, false); }
    emCirculo(10, s4.x, s4.z, s4.r - 2, (x, z, a) => { if (Math.abs(Math.sin(a / 2)) < 0.15) return; coluna(ms, M.calc, x, z, 6 + (rng() < 0.3 ? -2.5 : 0), 1); });
    emCirculo(20, s4.x, s4.z, s4.r - 2, (x, z, a) => { if (rng() < 0.35) return; ms.peca(GEO.caixa, M.calc, x, T[4] + 6.1, z, 3.2, 0.6, 1.2, 0, a + Math.PI / 2, 0, false); });
    noChao(ms, 4, 14, 6, (x, z) => flor(ms, rng() < 0.7 ? M.hibisco : M.orquidea, M.miolo, x, 0.35, z, 1.3 + rng() * 0.5));
    emCirculo(14, s4.x, s4.z, s4.r - 3, (x, z) => cipo(ms, M.samambaia, x, z, T[4] + 6, 2.5 + rng() * 2, M.hibisco, M.miolo));
    ms.peca(GEO.cil, M.calc, ms.plano.trono.x, 0.25, ms.plano.trono.z, 8, 0.5, 8);
  },
};
