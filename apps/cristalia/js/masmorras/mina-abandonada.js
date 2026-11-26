// =============================================================
// MINA ABANDONADA (Deserto, a 1ª masmorra do bioma)
// Do cânion ao sol até o fundo da terra:
//  entrada  → a porta de luz, no começo do cânion
//  etapa 1  → Cânion Vermelho: paredões listrados, mesas de pedra, cactos e a caveira gigante
//  etapa 2  → Pátio da Mina: barracos de madeira, a caixa d'água, trilhos, vagonetes e barris
//  etapa 3  → Túneis de Madeira: vigas a cada poucos metros, lampiões e trilhos
//  (Ponte dos Trilhos: o trilho passa por cima de um buraco escuro, sobre cavaletes)
//  etapa 4  → Caverna de Minério: cristais âmbar e dourados, pedras de ímã e a perfuradora quebrada
//  etapa 5  → Poço Profundo: descida em degraus, com corrimão, escadas e o guincho
//  fim      → Coração da Terra: o geodo gigante e o chefe
// Só desenho: as regras ficam em masmorra.js e os números em MASMORRAS_NOVAS (dados.js).
// =============================================================
import * as THREE from 'three';
import { GEO, lambert } from '../dungeon.js';
import { cristais, nosMorros, pontosNaSala, portaDeLuz, braseiro } from './pecas.js';

// Poço Profundo: 5 degraus descendo de -1 m (z = -424) até -12 m (z = -476)
function descida(x, z) {
  const k = Math.max(0, Math.min(1, (-424 - z) / 52)), s = k * 5, fl = Math.floor(s), fr = s - fl;
  const desce = fl >= 5 ? 0 : Math.max(0, Math.min(1, (fr - 0.75) / 0.25));
  return -1 - ((fl + desce * desce * (3 - 2 * desce)) / 5) * 11;
}

const SALAS = [
  { x: 0, z: 0, r: 9, h: 0, tipo: 'canion', tema: 'canion' },                                     // 0 entrada
  { x: 4, z: -60, rx: 30, rz: 44, h: 0, tipo: 'canion', tema: 'canion', etapa: 0 },               // 1 Cânion Vermelho
  { x: -10, z: -160, rx: 40, rz: 34, h: 0.5, tipo: 'canion', tema: 'patio', etapa: 1 },           // 2 Pátio da Mina
  { x: 6, z: -262, rx: 10, rz: 40, h: 0, tipo: 'gruta', tema: 'tunel', etapa: 2 },                // 3 Túneis de Madeira
  { x: 0, z: -355, r: 32, h: -1, tipo: 'gruta', tema: 'minerio', etapa: 3 },                      // 4 Caverna de Minério
  { x: 14, z: -450, rx: 26, rz: 32, h: descida, tipo: 'gruta', tema: 'poco', etapa: 4 },          // 5 Poço Profundo
  { x: 6, z: -530, r: 25, h: -12, tipo: 'gruta', tema: 'coracao', fim: true },                    // 6 Coração da Terra
];

const CHAO = {
  canion: ['#e3c58a', '#d9b87a', '#ecd096'], patio: ['#c9a46a', '#bf9a60', '#d1ad72'],
  tunel: ['#5a4232', '#4e3a2c', '#634a38'], minerio: ['#3a2e2a', '#443630', '#332824'],
  poco: ['#4a3a30', '#54423a', '#42342a'], coracao: ['#5a3a2a', '#4e3224', '#643f2e'],
};
// faixas dos paredões do cânion (pela altura)
const FAIXAS = ['#c27a4e', '#d99a62', '#b06a42', '#e0b07a', '#9a5a3a', '#cf8a5a'];
const ROCHA_MINA = ['#3a2a20', '#45342a', '#30231a'];
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export const MINA_ABANDONADA = {
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 6, tipo: 'canion' },
      { a: 1, b: 2, larg: 7, tipo: 'canion' },
      { a: 2, b: 3, larg: 5 },                // a boca da mina
      { a: 3, b: 4, larg: 2.8 },              // a Ponte dos Trilhos
      { a: 4, b: 5, larg: 5 },
      { a: 5, b: 6, larg: 6 },
    ],
    abismos: [{ corredor: 3, r: 12, fundo: 20 }],
  },
  corSelo: '#ffb347',
  portoes: [{ corredor: 1 }, { corredor: 2 }, { corredor: 3, depois: 2 }, { corredor: 4 }, { corredor: 5 }],
  acampamentos: [
    { x: 4, z: -62, etapa: 0 }, { x: -10, z: -160, etapa: 1 }, { x: 6, z: -264, etapa: 2 },
    { x: 0, z: -357, etapa: 3 }, { x: 14, z: -448, etapa: 4 },
  ],
  inicio: { x: 0, z: -1, ang: Math.PI },
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 6, z: -535, ang: 0 },
  portal: { x: -9, z: -538, ang: 0.3 },

  temas: {
    canion: { ceu: '#e9b57a', hemi: '#ffe6c2', luz: 1.7, sol: 1.4, nevoa: [40, 130], part: 'poeira', corPart: '#e8c08a' },
    patio: { ceu: '#e3ad72', hemi: '#ffe2bc', luz: 1.7, sol: 1.35, nevoa: [40, 130], part: 'poeira', corPart: '#e8c08a' },
    tunel: { ceu: '#140d08', hemi: '#ffcf8a', luz: 1.35, sol: 0.3, nevoa: [16, 72], part: 'brilho', corPart: '#ffcc66' },
    minerio: { ceu: '#100c14', hemi: '#e2c4ff', luz: 1.35, sol: 0.3, nevoa: [18, 80], part: 'brilho', corPart: '#ffd36b' },
    poco: { ceu: '#0c0a0a', hemi: '#ffc98a', luz: 1.3, sol: 0.3, nevoa: [16, 76], part: 'brilho', corPart: '#ffb347' },
    coracao: { ceu: '#140a06', hemi: '#ffb070', luz: 1.45, sol: 0.35, nevoa: [20, 86], part: 'faisca', corPart: '#ffb347' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (s.tema === 'poco') { const n = Math.floor((-1 - h) / 2.2 + 0.2); return c.set(n % 2 ? '#5d4a3c' : '#4a3a30'); }
      return c.set(sorteia(rng, CHAO[s.tema]));
    }
    if (h < hChao - 2.5) return c.set('#1a100a').lerp(new THREE.Color('#050302'), Math.min(1, (hChao - h) / 18)); // o buraco
    if (tipo === 'canion') { const f = Math.floor((h - hChao) / 2.3); return c.set(FAIXAS[((f % 6) + 6) % 6]).offsetHSL(0, 0, (rng() - 0.5) * 0.04); }
    return c.set(sorteia(rng, ROCHA_MINA));
  },

  // Portão de madeira (vigas e um lampião no meio)
  pecasPortao(ms, b, { lx, lz, base, ang, larg, px, pz }) {
    const o = ms.o, mad = ms.mat('#6b4a32'), luz = ms.brilho('#ffcc55', 0.9);
    for (const lado of [-1, 1]) b.add(GEO.caixa, mad, o.x + lx + px * (larg + 1.1) * lado, base + 3.2, o.z + lz + pz * (larg + 1.1) * lado, 1.2, 6.4, 1.2, 0, ang, 0);
    b.add(GEO.caixa, mad, o.x + lx, base + 6.6, o.z + lz, (larg + 2) * 2, 1, 1.3, 0, ang, 0);
    for (const lado of [-1, 1]) b.add(GEO.caixa, mad, o.x + lx + px * (larg - 0.2) * lado, base + 5.4, o.z + lz + pz * (larg - 0.2) * lado, 0.4, 0.4, 3, 0, ang + Math.PI / 2, lado * 0.8);
    b.add(GEO.ico, luz, o.x + lx, base + 5.7, o.z + lz, 0.45, 0.6, 0.45);
  },

  decorar(ms) {
    const rng = ms.rng, F = ms.forma;
    const M = {
      rocha: ms.mat('#b06a42'), rocha2: ms.mat('#c98a5a'), rochaEsc: ms.mat('#4a3426'), cacto: ms.mat('#4f8a3a'), cacto2: ms.mat('#5f9a48'),
      osso: ms.mat('#ece4d0'), madeira: ms.mat('#6b4a32'), madeira2: ms.mat('#8a6440'), telhado: ms.mat('#5a3a28'), ferro: ms.mat('#4a4a52'),
      trilho: ms.mat('#8a8a94'), lampiao: ms.brilho('#ffcc55', 0.95), ambar: ms.brilho('#ffb347', 0.7), ouro: ms.brilho('#ffd23f', 0.55),
      azul: ms.brilho('#7fd0ff', 0.6), roxo: ms.brilho('#b58cff', 0.65), barril: ms.mat('#7a5232'), agua: ms.mat('#5a7a8a'),
      ima: ms.mat('#30344a'), raio: ms.brilho('#ffd23f', 0.5), chama: ms.brilho('#ff9a3a', 1), corda: ms.mat('#a08a60'),
    };
    const octa = ms.geo(new THREE.OctahedronGeometry(1, 0));
    portaDeLuz(ms, '#b07a50', '#ff9a3a', '#ffe9c2');

    // ---- trilho: dormentes de madeira e 2 barras de ferro, de um ponto local a outro ----
    const trilho = (ax, az, bx, bz, y = 0, chao = true) => {
      const L = Math.hypot(bx - ax, bz - az), ang = Math.atan2(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, px = -uz, pz = ux;
      for (let s = 0.6; s < L; s += 1.6) ms.peca(GEO.caixa, M.madeira, ax + ux * s, y + 0.06, az + uz * s, 2.2, 0.14, 0.5, 0, ang, 0, chao);
      for (const l of [-0.65, 0.65]) for (let s = 0; s < L; s += 8) { const sl = Math.min(8, L - s); ms.peca(GEO.caixa, M.trilho, ax + ux * (s + sl / 2) + px * l, y + 0.18, az + uz * (s + sl / 2) + pz * l, 0.12, 0.12, sl, 0, ang, 0, chao); }
    };
    const vagonete = (x, z, ang, virado = false) => {
      ms.peca(GEO.caixa, M.ferro, x, virado ? 0.7 : 1, z, 1.6, 1.1, 2.2, 0, ang, virado ? 1.3 : 0);
      ms.peca(GEO.caixa, M.rochaEsc, x, virado ? 0.8 : 1.5, z, 1.3, 0.3, 1.9, 0, ang, virado ? 1.3 : 0);
      if (!virado) for (const a of [-0.7, 0.7]) for (const b of [-0.7, 0.7]) ms.peca(GEO.cil, M.trilho, x + Math.cos(ang) * a + Math.sin(ang) * b, 0.35, z - Math.sin(ang) * a + Math.cos(ang) * b, 0.6, 0.2, 0.6, 0, ang, Math.PI / 2);
      ms.obst(x, z, 1.3);
    };
    const lampiao = (x, z, y) => { ms.peca(GEO.ico, M.lampiao, x, y, z, 0.35, 0.5, 0.35); ms.peca(GEO.caixa, M.ferro, x, y + 0.45, z, 0.06, 0.4, 0.06); };

    // ---- Cânion Vermelho: mesas de pedra nos paredões, cactos e a caveira gigante ----
    nosMorros(ms, [0, 1, 2], 46, 2, 18, (x, z) => { const e = 2 + rng() * 3; ms.peca(GEO.dode, rng() < 0.5 ? M.rocha : M.rocha2, x, 2 + e, z, e * 1.4, e * 2.4, e * 1.3, 0, rng() * 3, 0); });
    {
      const centro = { x: 4, z: -62 };
      for (const p of pontosNaSala(ms, 1, 6, 4, [centro], 14)) { const e = 1.2 + rng() * 1.2; ms.peca(GEO.dode, M.rocha, p.x, e * 1.4, p.z, e * 1.6, e * 3.2, e * 1.5, 0, rng() * 3, 0); ms.peca(GEO.cil, M.rocha2, p.x, e * 3.1, p.z, e * 2.6, e * 0.6, e * 2.6); ms.obst(p.x, p.z, e * 1.2); }
      const cacto = (x, z, e) => {
        const m = rng() < 0.5 ? M.cacto : M.cacto2;
        ms.peca(GEO.cil, m, x, 1.3 * e, z, 0.7 * e, 2.6 * e, 0.7 * e);
        ms.peca(GEO.cil, m, x + 0.55 * e, 1.5 * e, z, 0.35 * e, 0.9 * e, 0.35 * e, 0, 0, 1.57);
        ms.peca(GEO.cil, m, x + 0.9 * e, 2 * e, z, 0.35 * e, 1 * e, 0.35 * e);
        ms.peca(GEO.cil, m, x - 0.5 * e, 1.1 * e, z, 0.3 * e, 0.8 * e, 0.3 * e, 0, 0, 1.57);
        ms.peca(GEO.cil, m, x - 0.8 * e, 1.5 * e, z, 0.3 * e, 0.8 * e, 0.3 * e);
      };
      for (const p of pontosNaSala(ms, 1, 14, 3, [centro], 12)) { const e = 0.8 + rng() * 0.6; cacto(p.x, p.z, e); ms.obst(p.x, p.z, 0.5 * e); }
      for (const p of pontosNaSala(ms, 0, 3, 3, [{ x: 0, z: 0 }], 4)) cacto(p.x, p.z, 0.7);
      // a caveira gigante de um bicho antigo (meio enterrada)
      const kx = -14, kz = -48;
      ms.peca(GEO.dode, M.osso, kx, 1.2, kz, 3.4, 2.4, 4, 0.2, 0.6, 0);
      for (const l of [-1, 1]) { ms.peca(GEO.ico, M.rochaEsc, kx + l * 1.1, 1.8, kz + 1.6, 0.6, 0.6, 0.4); ms.peca(GEO.cone, M.osso, kx + l * 2.2, 2.6, kz - 0.6, 0.6, 3, 0.6, 0.4, 0, -l * 0.9); }
      for (let i = 0; i < 5; i++) ms.peca(GEO.caixa, M.osso, kx + 4 + i * 1.6, 0.6, kz - 2 + i * 0.4, 0.4, 2.4 - i * 0.2, 0.4, 0, 0, 0.5);
      ms.obst(kx, kz, 3);
      // a placa da mina
      ms.peca(GEO.cil, M.madeira, 6, 1.3, -12, 0.25, 2.6, 0.25);
      ms.peca(GEO.caixa, M.madeira2, 6, 2.3, -12, 2.4, 0.9, 0.15, 0, 0.1, 0);
    }

    // ---- Pátio da Mina: barracos, caixa d'água, trilhos, vagonetes e barris ----
    {
      const s = SALAS[2], centro = { x: -10, z: -160 };
      const barraco = (x, z, ang, e) => {
        ms.peca(GEO.caixa, M.madeira2, x, 1.6 * e, z, 5 * e, 3.2 * e, 4 * e, 0, ang, 0);
        for (const l of [-1, 1]) ms.peca(GEO.caixa, M.telhado, x + Math.cos(ang) * l * 1.3 * e, 3.6 * e, z - Math.sin(ang) * l * 1.3 * e, 2.9 * e, 0.25, 4.6 * e, 0, ang, l * 0.5);
        ms.peca(GEO.caixa, M.rochaEsc, x + Math.sin(ang) * 2.02 * e, 1.1 * e, z + Math.cos(ang) * 2.02 * e, 1.1 * e, 2.2 * e, 0.1, 0, ang, 0);
        ms.obst(x, z, 3 * e);
      };
      const casas = [[-38, -150, 1.4], [-30, -182, 1.1], [14, -176, -0.6]].filter(([x, z]) => ms.d(x, z) < -4);
      for (const [x, z, a] of casas) barraco(x, z, a, 1 + rng() * 0.2);
      // caixa d'água
      const wx = 14, wz = -142;
      for (const a of [-1, 1]) for (const b2 of [-1, 1]) ms.peca(GEO.cil, M.madeira, wx + a * 1.6, 3, wz + b2 * 1.6, 0.35, 6, 0.35);
      ms.peca(GEO.cil, M.barril, wx, 7.4, wz, 4.6, 3, 4.6);
      ms.peca(GEO.cone, M.telhado, wx, 9.6, wz, 5.2, 1.6, 5.2);
      ms.obst(wx, wz, 2.4);
      // trilho do pátio até a boca da mina
      const c = F.corredores[2];
      trilho(s.x + 6, s.z + 8, c.bx, c.bz);
      vagonete(s.x + 10, s.z - 4, Math.atan2(c.bx - s.x - 6, c.bz - s.z - 8));
      vagonete(-26, -170, 0.6, true);
      for (const p of pontosNaSala(ms, 2, 12, 3, [centro, ...casas.map(([x, z]) => ({ x, z }))], 7)) {
        if (rng() < 0.5) { ms.peca(GEO.cil, M.barril, p.x, 0.65, p.z, 1.1, 1.3, 1.1); ms.peca(GEO.cil, M.ferro, p.x, 0.65, p.z, 1.15, 0.12, 1.15); ms.obst(p.x, p.z, 0.6); }
        else { ms.peca(GEO.caixa, M.madeira, p.x, 0.5, p.z, 1, 1, 1, 0, rng() * 3, 0); ms.obst(p.x, p.z, 0.7); }
      }
      // a boca da mina: moldura grande de vigas
      const bx = c.bx - c.ux * 6, bz = c.bz - c.uz * 6, ang = Math.atan2(c.ux, c.uz), px = -c.uz, pz = c.ux;
      for (const l of [-1, 1]) ms.peca(GEO.caixa, M.madeira, bx + px * 6.3 * l, 4, bz + pz * 6.3 * l, 1.4, 8, 1.4, 0, ang, 0);
      ms.peca(GEO.caixa, M.madeira, bx, 8.3, bz, 15, 1.4, 1.6, 0, ang, 0);
      ms.peca(GEO.caixa, M.madeira2, bx, 9.6, bz, 6, 1.4, 0.3, 0, ang, 0);
      lampiao(bx + px * 5, bz + pz * 5, 7);
      lampiao(bx - px * 5, bz - pz * 5, 7);
    }

    // ---- Túneis de Madeira: vigas, lampiões e o trilho no meio ----
    {
      const s = SALAS[3];
      trilho(s.x, s.z + s.rz, s.x, s.z - s.rz);
      for (let z = s.z + s.rz - 4; z > s.z - s.rz + 2; z -= 7) {
        const meia = s.rx * Math.sqrt(Math.max(0, 1 - ((z - s.z) / s.rz) ** 2)) + 0.6;
        // (vigas baixas: a câmera passa por cima delas e não tampa o jogador)
        for (const l of [-1, 1]) ms.peca(GEO.caixa, M.madeira, s.x + l * meia, 2.2, z, 0.9, 4.4, 0.9);
        ms.peca(GEO.caixa, M.madeira, s.x, 4.5, z, meia * 2 + 1.5, 0.6, 0.8, 0, 0, 0);
        if (Math.round(z) % 2 === 0) lampiao(s.x + meia - 1.2, z, 3.7);
      }
      for (let n = 0; n < 16; n++) { const p = ms.pontoNaSala(3, 1); ms.peca(GEO.dode, M.rochaEsc, p.x, 0.2, p.z, 0.7, 0.4, 0.6, rng(), rng(), 0); }
    }

    // ---- Ponte dos Trilhos (sobre o buraco, em cavaletes) ----
    {
      const c = F.corredores[3], L = Math.hypot(c.bx - c.ax, c.bz - c.az), ang = Math.atan2(c.ux, c.uz), px = -c.uz, pz = c.ux;
      for (let s = 0; s <= L; s += 1.2) {
        const x = c.ax + c.ux * s, z = c.az + c.uz * s;
        if (F.salaEm(ms.o.x + x, ms.o.z + z) >= 0) continue;
        ms.peca(GEO.caixa, M.madeira2, x, -0.15, z, c.larg * 2 + 0.6, 0.3, 1, 0, ang, 0);
      }
      trilho(c.ax, c.az, c.bx, c.bz, ms.y(c.ax, c.az) - 0.05, false);
      for (let s = 3; s < L - 2; s += 6) for (const l of [-1, 1]) {
        const x = c.ax + c.ux * s + px * c.larg * l, z = c.az + c.uz * s + pz * c.larg * l, y0 = ms.y(c.ax + c.ux * s, c.az + c.uz * s);
        ms.peca(GEO.caixa, M.madeira, x, y0 - 9, z, 0.5, 18, 0.5, 0, ang, 0, false);
        ms.peca(GEO.caixa, M.madeira, x + c.ux * 1.5, y0 - 4, z + c.uz * 1.5, 0.3, 7, 0.3, 0.45, ang, 0, false);
        ms.peca(GEO.caixa, M.corda, x, y0 + 0.9, z, 0.1, 0.1, 6, 0, ang, 0, false);
        ms.peca(GEO.cil, M.madeira, x, y0 + 0.5, z, 0.2, 1, 0.2, 0, 0, 0, false);
      }
    }

    // ---- Caverna de Minério ----
    {
      const s = SALAS[4], centro = { x: 0, z: -357 };
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + rng() * 0.3; cristais(ms, octa, i % 3 ? M.ambar : M.ouro, i % 4 === 0 ? M.azul : null, s.x + Math.sin(a) * s.r * 0.86, s.z + Math.cos(a) * s.r * 0.86, 0.9 + rng() * 0.6, true); }
      nosMorros(ms, [4, 5, 6], 34, 3, 10, (x, z) => cristais(ms, octa, rng() < 0.5 ? M.ambar : M.roxo, M.ouro, x, z, 0.6 + rng() * 0.5));
      for (const p of pontosNaSala(ms, 4, 8, 4, [centro], 13)) { const e = 0.9 + rng(); ms.peca(GEO.dode, M.ima, p.x, 0.5 * e, p.z, 1.5 * e, 1.2 * e, 1.4 * e, rng(), rng() * 3, 0); ms.peca(GEO.ico, M.raio, p.x, 1.1 * e, p.z, 0.35 * e, 0.35 * e, 0.35 * e); ms.obst(p.x, p.z, e); }
      // a perfuradora quebrada
      const dx = s.x - 16, dz = s.z + 8;
      ms.peca(GEO.caixa, M.ferro, dx, 1.2, dz, 3, 2.4, 4.5, 0, 0.5, 0);
      ms.peca(GEO.cil, M.ferro, dx + 1.6, 1.6, dz - 2.4, 1.4, 2, 1.4, 1.2, 0.5, 0);
      ms.peca(GEO.cone, M.trilho, dx + 2.3, 1.6, dz - 3.6, 1.2, 2.2, 1.2, -1.9, 0.5, 0);
      for (const l of [-1.2, 1.2]) ms.peca(GEO.cil, M.rochaEsc, dx + l, 0.5, dz, 1, 0.5, 1, 0, 0.5, Math.PI / 2);
      ms.obst(dx, dz, 2.6);
      vagonete(s.x + 14, s.z - 12, 2.2, true);
      for (const [x, z] of [[s.x - 6, s.z + 26], [s.x + 22, s.z + 10], [s.x - 24, s.z - 10]]) { ms.peca(GEO.cil, M.madeira, x, 2.2, z, 0.3, 4.4, 0.3); lampiao(x, z, 4.6); ms.obst(x, z, 0.4); }
    }

    // ---- Poço Profundo: corrimão nos degraus, escadas e o guincho ----
    {
      const s = SALAS[5];
      for (let n = 1; n <= 4; n++) {
        const z = -424 - 52 * (n - 1 + 0.87) / 5, k = Math.sqrt(Math.max(0, 1 - ((z - s.z) / s.rz) ** 2)), meia = s.rx * k - 1;
        for (let x = s.x - meia; x <= s.x + meia; x += 4) {
          if (Math.abs(x - s.x) < 3.5) continue; // a passagem no meio
          ms.peca(GEO.cil, M.madeira, x, 0.6, z + 0.8, 0.2, 1.2, 0.2);
          ms.peca(GEO.caixa, M.madeira2, x + 2, 1.1, z + 0.8, 4, 0.14, 0.14);
        }
        for (const l of [-1, 1]) { // escadinhas de madeira
          const x = s.x + l * 2.3;
          for (const q of [-0.5, 0.5]) ms.peca(GEO.caixa, M.madeira, x + q, 0.2, z + 0.6, 0.15, 0.15, 3.2, -0.6, 0, 0);
        }
        lampiao(s.x + meia - 0.5, z + 1.5, 2.6);
        lampiao(s.x - meia + 0.5, z + 1.5, 2.6);
      }
      // o guincho com a corda e o balde lá no fundo
      const gx = s.x - 18, gz = -430;
      ms.peca(GEO.caixa, M.madeira, gx, 4, gz, 0.6, 8, 0.6); ms.peca(GEO.caixa, M.madeira, gx + 4, 7.7, gz, 8.6, 0.6, 0.6);
      ms.peca(GEO.cil, M.ferro, gx + 1.5, 7.7, gz, 1, 1.2, 1, Math.PI / 2, 0, 0);
      ms.peca(GEO.caixa, M.corda, gx + 7.8, 3.8, gz, 0.08, 7.6, 0.08);
      ms.peca(GEO.cil, M.barril, gx + 7.8, 0, gz, 1, 1.1, 1);
      ms.obst(gx, gz, 0.8);
    }

    // ---- Coração da Terra: o geodo gigante atrás do chefe ----
    {
      const s = SALAS[6], gz = s.z - 13;
      for (let i = 0; i < 16; i++) {
        const a = -1.3 + (i / 15) * 2.6, x = s.x + Math.sin(a) * 10, z = gz - Math.cos(a) * 5, h = 5 + Math.cos(a) * 5 + rng() * 2;
        ms.peca(octa, i % 3 ? M.roxo : M.ambar, x, h * 0.45, z, 1.3, h * 0.55, 1.3, (rng() - 0.5) * 0.5, rng() * 3, Math.sin(a) * 0.4);
      }
      ms.peca(GEO.dode, M.rochaEsc, s.x, 4, gz - 4, 14, 10, 6, 0, 0, 0);
      ms.obst(s.x, gz, 6);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8, x = s.x + Math.sin(a) * 19, z = s.z + Math.cos(a) * 19;
        if (z > s.z + 14 && Math.abs(x - s.x) < 9) continue;
        if (z < s.z - 10 && Math.abs(x - s.x) < 13) continue; // o geodo
        braseiro(ms, M.ferro, M.chama, x, z, 1);
      }
      for (let n = 0; n < 10; n++) { const p = ms.pontoNaSala(6, 4); if (Math.hypot(p.x - 6, p.z + 535) < 9) continue; ms.peca(GEO.dode, M.ouro, p.x, 0.2, p.z, 1.4, 0.5, 1.2, 0, rng() * 3, 0); }
      const anel = ms.geo(new THREE.TorusGeometry(7, 0.3, 3, 40).rotateX(Math.PI / 2));
      ms.peca(anel, M.ambar, s.x, 0.12, -535, 1, 1, 1);
      trilho(s.x - 3, s.z + s.r - 2, s.x - 3, s.z + 8);
    }
  },

  // A entrada no mapa: uma boca de mina de madeira numa pedra vermelha, com trilho e vagonete (sem ícone)
  entrada(b, { x, z, ang, y, obst }) {
    const fx = Math.sin(ang), fz = Math.cos(ang), sx = Math.cos(ang), sz = -Math.sin(ang);
    const P = (f, s) => ({ x: x + fx * f + sx * s, z: z + fz * f + sz * s });
    const rocha = lambert('#b06a42'), rocha2 = lambert('#c98a5a'), mad = lambert('#6b4a32'), escuro = lambert('#0d0805'), ferro = lambert('#8a8a94'), luz = lambert('#ffcc55', { emissive: '#ffb347', emissiveIntensity: 0.9 });
    const base = y(x, z);
    for (const [f, s, e, h, m] of [[-3, 0, 6, 6, rocha], [-1.5, -4, 4, 4, rocha2], [-1.5, 4, 4, 4.4, rocha], [-5, -2.5, 4, 3.6, rocha2], [-5, 2.5, 4, 3.8, rocha]]) { const p = P(f, s); b.add(GEO.dode, m, p.x, base + h * 0.4, p.z, e, h, e * 0.95, 0.15, f * s, 0); }
    for (const s of [-1.6, 1.6]) { const p = P(0.6, s); b.add(GEO.caixa, mad, p.x, base + 1.9, p.z, 0.6, 3.8, 0.6, 0, ang, 0); }
    const v = P(0.6, 0); b.add(GEO.caixa, mad, v.x, base + 3.9, v.z, 4.2, 0.6, 0.7, 0, ang, 0);
    const d = P(0.2, 0); b.add(GEO.caixa, escuro, d.x, base + 1.7, d.z, 2.7, 3.4, 0.4, 0, ang, 0);
    const l = P(1, 1.6); b.add(GEO.ico, luz, l.x, base + 3.2, l.z, 0.3, 0.42, 0.3);
    for (let i = 0; i < 4; i++) { const p = P(1.4 + i * 1.2, 0); b.add(GEO.caixa, mad, p.x, base + 0.07, p.z, 2, 0.14, 0.4, 0, ang + Math.PI / 2, 0); }
    for (const s of [-0.6, 0.6]) { const p = P(3.2, s); b.add(GEO.caixa, ferro, p.x, base + 0.18, p.z, 0.1, 0.1, 4.6, 0, ang, 0); }
    const vg = P(2.2, 3.4); b.add(GEO.caixa, lambert('#4a4a52'), vg.x, base + 0.6, vg.z, 1.4, 1, 1.9, 0, ang, 0.4);
    const c = P(-3, 0);
    obst(c.x, c.z, 4.4);
    obst(vg.x, vg.z, 1.1);
  },
};
