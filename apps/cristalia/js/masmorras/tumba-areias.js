// =============================================================
// TUMBA DAS AREIAS (Deserto, a 2ª masmorra do bioma: mais difícil)
// A época dos faraós (ideia do Lâmina: pirâmides e esfinges com cabeça de gato):
//  entrada  → a porta de luz, no meio das dunas
//  etapa 1  → Dunas dos Faraós: 3 pirâmides gigantes atrás das dunas, o oásis com palmeiras e obeliscos
//  etapa 2  → Avenida das Esfinges: 12 esfinges com cabeça de gato dos dois lados do caminho
//  etapa 3  → Templo do Sol: o portal com o disco do sol, colunas pintadas, o altar e obeliscos
//  etapa 4  → Câmara dos Sarcófagos: sarcófagos dourados, vasos, tochas e tesouro
//  (Poço de Areia: uma ponte de pedra sobre o buraco com espinhos)
//  etapa 5  → Galeria dos Deuses Gato: estátuas gigantes de gatos sentados e o escaravelho
//  fim      → Câmara do Faraó: o sarcófago gigante em pé, a luz do sol que cai do teto e o chefe
// Só desenho: as regras ficam em masmorra.js e os números em MASMORRAS_NOVAS (dados.js).
// =============================================================
import * as THREE from 'three';
import { GEO, lambert } from '../dungeon.js';
import { nosMorros, pontosNaSala, portaDeLuz, braseiro, portaoSimples } from './pecas.js';

const SALAS = [
  { x: 0, z: 0, r: 9, h: 0, tipo: 'aberta', tema: 'dunas' },                                         // 0 entrada
  { x: 0, z: -70, rx: 46, rz: 50, h: 0, tipo: 'aberta', tema: 'dunas', etapa: 0 },                   // 1 Dunas dos Faraós
  { x: 6, z: -185, rx: 14, rz: 50, h: 0.4, tipo: 'aberta', tema: 'avenida', etapa: 1 },              // 2 Avenida das Esfinges
  { x: 0, z: -290, r: 30, h: 1, tipo: 'gruta', ceuAberto: true, tema: 'templo', etapa: 2 },          // 3 Templo do Sol
  { x: -8, z: -385, rx: 24, rz: 30, h: 1, tipo: 'gruta', tema: 'camara', etapa: 3 },                 // 4 Câmara dos Sarcófagos
  { x: 6, z: -475, rx: 22, rz: 34, h: 1, tipo: 'gruta', tema: 'galeria', etapa: 4 },                 // 5 Galeria dos Deuses Gato
  { x: 0, z: -560, r: 25, h: 1, tipo: 'gruta', tema: 'farao', fim: true },                           // 6 Câmara do Faraó
];
const OASIS = { x: 24, z: -48, r: 5.5 };

const CHAO = {
  dunas: ['#ecd096', '#e3c58a', '#f2dba6'], avenida: ['#d8c49a', '#cbb68a', '#e0cea6'],
  templo: ['#d9c7a0', '#cfbb92', '#e2d1ac'], camara: ['#6a5636', '#5e4c30', '#74603e'],
  galeria: ['#7a6440', '#6e5a38', '#866e48'], farao: ['#c9a24a', '#b8913e', '#d4ad55'],
};
const DUNA = ['#e3c58a', '#d9b87a', '#ecd096', '#d4b072'], ARENITO = ['#c9a46a', '#bf9a60', '#d1ad72'], ARENITO_ESC = ['#5a4628', '#4e3c22', '#664f2e'];
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

// Peças grandes da tumba (coordenadas locais; f = para a frente, s = para o lado)
function lugar(x, z, ang) {
  const sa = Math.sin(ang), ca = Math.cos(ang);
  return (f, s) => [x + sa * f + ca * s, z + ca * f - sa * s];
}
// Esfinge deitada com cabeça de gato (olha para "ang")
function esfinge(ms, M, x, z, ang, e = 1, obst = true) {
  const P = lugar(x, z, ang), pc = (geo, mat, f, s, y, sx, sy, sz, rx = 0, rz = 0) => { const [px, pz] = P(f * e, s * e); ms.peca(geo, mat, px, y * e, pz, sx * e, sy * e, sz * e, rx, ang, rz); };
  pc(GEO.caixa, M.pedraEsc, 0, 0, 0.5, 3.6, 1, 7.2);
  pc(GEO.caixa, M.arenito, -0.8, 0, 1.9, 2.6, 1.8, 4.6);
  pc(GEO.caixa, M.arenito, -2.6, 0, 2.1, 2.8, 2.2, 1.6);
  for (const l of [-0.8, 0.8]) pc(GEO.caixa, M.arenito, 2.3, l, 1.3, 0.8, 0.6, 2.8);
  pc(GEO.caixa, M.arenito, 1.4, 0, 2.6, 2.2, 2.4, 1.4);
  pc(GEO.caixa, M.azul, 1.2, 0, 4.2, 2.3, 1.8, 1);           // o pano da cabeça (azul, como os faraós)
  for (const y of [3.6, 4.4]) pc(GEO.caixa, M.ouro, 1.2, 0, y, 2.36, 0.22, 1.04);
  pc(GEO.caixa, M.arenito, 1.95, 0, 4.4, 1.7, 1.5, 1.5);      // cabeça de gato
  for (const l of [-0.55, 0.55]) pc(GEO.cone4, M.arenito, 1.95, l, 5.5, 0.6, 1, 0.5);
  pc(GEO.caixa, M.areiaClara, 2.75, 0, 4.05, 0.8, 0.5, 0.4);
  for (const l of [-0.4, 0.4]) pc(GEO.caixa, M.olho, 2.72, l, 4.6, 0.34, 0.2, 0.08);
  pc(GEO.caixa, M.arenito, -1.4, 1.45, 1.2, 0.3, 0.3, 2.6);
  if (obst) for (const f of [1.6, -1.8]) { const [px, pz] = P(f * e, 0); ms.obst(px, pz, 1.8 * e); }
}
// Estátua de gato sentado (preta e dourada)
function gatoSentado(ms, M, x, z, ang, e = 1) {
  const P = lugar(x, z, ang), pc = (geo, mat, f, s, y, sx, sy, sz, rx = 0, rz = 0) => { const [px, pz] = P(f * e, s * e); ms.peca(geo, mat, px, y * e, pz, sx * e, sy * e, sz * e, rx, ang, rz); };
  pc(GEO.caixa, M.arenito, 0, 0, 0.6, 3, 1.2, 3.4);
  pc(GEO.ico, M.preto, -0.2, 0, 3.4, 1.5, 2.6, 1.7);
  for (const l of [-0.55, 0.55]) pc(GEO.caixa, M.preto, 0.9, l, 2.3, 0.45, 2.3, 0.45);
  pc(GEO.cil, M.ouro, 0.1, 0, 4.9, 1.4, 0.3, 1.4);
  pc(GEO.ico, M.preto, 0.3, 0, 5.8, 1, 0.95, 1);
  for (const l of [-0.48, 0.48]) pc(GEO.cone4, M.preto, 0.2, l, 6.75, 0.38, 0.85, 0.32);
  for (const l of [-0.3, 0.3]) pc(GEO.caixa, M.ouroBrilho, 0.95, l, 6, 0.06, 0.16, 0.3);
  pc(GEO.ico, M.ouro, 0.3, 0.62, 6, 0.14, 0.22, 0.14);
  pc(GEO.caixa, M.preto, -1.2, 0.6, 1.5, 0.3, 0.3, 2.2, 0, 0.3);
  const [ox, oz] = P(0, 0); ms.obst(ox, oz, 1.9 * e);
}
function palmeira(ms, M, x, z, e = 1) {
  const r = ms.rng, inc = (r() - 0.5) * 0.4;
  ms.peca(GEO.cil, M.tronco, x, 3 * e, z, 0.4 * e, 6 * e, 0.4 * e, inc * 0.5, 0, inc);
  const tx = x - Math.sin(inc) * 3 * e, tz = z + Math.sin(inc * 0.5) * 3 * e, ty = 6 * e;
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + r(); ms.peca(GEO.caixa, i % 2 ? M.folha : M.folha2, tx + Math.cos(a) * 1.5 * e, ty - 0.4 * e, tz - Math.sin(a) * 1.5 * e, 3.4 * e, 0.12, 0.8 * e, 0, a, -0.45); }
  for (let i = 0; i < 3; i++) ms.peca(GEO.ico, M.tronco, tx + (r() - 0.5) * 0.5, ty - 0.5 * e, tz + (r() - 0.5) * 0.5, 0.25 * e, 0.25 * e, 0.25 * e);
}
function coluna(ms, M, x, z, h = 7) {
  ms.peca(GEO.cil, M.arenito, x, 0.25, z, 1.8, 0.5, 1.8);
  ms.peca(GEO.cil, M.arenito, x, h / 2, z, 1.2, h, 1.2);
  ms.peca(GEO.cil, M.azul, x, h - 1.4, z, 1.25, 0.5, 1.25);
  ms.peca(GEO.cil, M.ouro, x, h - 0.95, z, 1.25, 0.25, 1.25);
  ms.peca(GEO.cone, M.arenito, x, h + 0.4, z, 2.4, 1.2, 2.4, Math.PI, 0, 0);
  ms.peca(GEO.caixa, M.arenito, x, h + 1.15, z, 2.2, 0.4, 2.2);
  ms.obst(x, z, 0.9);
}
function obelisco(ms, M, x, z, h = 9, inc = 0) {
  ms.peca(GEO.caixa, M.arenito, x, h / 2, z, 1.1, h, 1.1, inc, 0, inc * 0.6);
  ms.peca(GEO.cone4, M.ouroBrilho, x + Math.sin(-inc * 0.6) * h * 0.5, h + 0.5, z + Math.sin(inc) * h * 0.5, 1.4, 1.2, 1.4, inc, Math.PI / 4, inc * 0.6);
  ms.obst(x, z, 0.9);
}

export const TUMBA_AREIAS = {
  paredeVisivel: 40, // as pirâmides ficam longe: o chão das dunas vai mais longe
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 6, tipo: 'aberta' },
      { a: 1, b: 2, larg: 8, tipo: 'aberta' },
      { a: 2, b: 3, larg: 7 },               // o portal do templo
      { a: 3, b: 4, larg: 4 },               // a entrada da tumba
      { a: 4, b: 5, larg: 2.6 },             // a ponte sobre o Poço de Areia
      { a: 5, b: 6, larg: 5 },
    ],
    abismos: [{ corredor: 4, r: 12, fundo: 14 }],
    buracos: [OASIS],
  },
  corSelo: '#ffd23f',
  portoes: [{ corredor: 1 }, { corredor: 2 }, { corredor: 3 }, { corredor: 4, depois: 2 }, { corredor: 5 }],
  acampamentos: [
    { x: 0, z: -76, etapa: 0 }, { x: 6, z: -185, etapa: 1 }, { x: 0, z: -292, etapa: 2 },
    { x: -8, z: -387, etapa: 3 }, { x: 6, z: -477, etapa: 4 },
  ],
  inicio: { x: 0, z: -8, ang: Math.PI },   // (um pouco para dentro: a viga da porta de luz fica atrás da câmera)
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 0, z: -566, ang: 0 },
  portal: { x: -12, z: -566, ang: 0.3 },

  temas: {
    dunas: { ceu: '#f2c98a', hemi: '#fff0d0', luz: 1.75, sol: 1.5, nevoa: [45, 140], part: 'poeira', corPart: '#f0d29a' },
    avenida: { ceu: '#eebf7c', hemi: '#ffeccb', luz: 1.75, sol: 1.45, nevoa: [42, 135], part: 'poeira', corPart: '#f0d29a' },
    templo: { ceu: '#e8b56e', hemi: '#ffe4b0', luz: 1.65, sol: 1.25, nevoa: [36, 120], part: 'poeira', corPart: '#f0d29a' },
    camara: { ceu: '#120c06', hemi: '#ffcf8a', luz: 1.3, sol: 0.3, nevoa: [16, 72], part: 'brilho', corPart: '#ffd27a' },
    galeria: { ceu: '#140e08', hemi: '#ffd9a0', luz: 1.4, sol: 0.35, nevoa: [18, 80], part: 'brilho', corPart: '#ffd27a' },
    farao: { ceu: '#1a1206', hemi: '#ffe08a', luz: 1.6, sol: 0.4, nevoa: [22, 90], part: 'brilho', corPart: '#ffe680' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng, x, z }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (h < hChao - 0.6) return c.set('#2f8f8a');                          // o fundo do oásis
      return c.set(sorteia(rng, CHAO[s.tema]));
    }
    if (h < hChao - 2.5) return c.set('#c9a46a').lerp(new THREE.Color('#3a2a16'), Math.min(1, (hChao - h) / 12)); // o Poço de Areia
    if (tipo === 'gruta') {
      // paredes pintadas: faixas vermelha, azul e dourada (como as tumbas do Egito)
      const a = h - hChao, escuro = s.tema !== 'templo';
      if (a > 1.2 && a < 1.7) return c.set('#a04030');
      if (a > 3 && a < 3.8) return c.set('#2f5fa0');
      if (a > 3.8 && a < 4.4) return c.set('#d9a83a');
      return c.set(sorteia(rng, escuro ? ARENITO_ESC : ARENITO));
    }
    return c.set(sorteia(rng, DUNA));
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#c9a46a'), ms.brilho('#ffd23f', 0.5), ms.mat('#2f5fa0')); },

  decorar(ms) {
    const rng = ms.rng, F = ms.forma;
    const M = {
      arenito: ms.mat('#d9b77a'), pedraEsc: ms.mat('#b8955a'), areiaClara: ms.mat('#ecd8a8'), azul: ms.mat('#2f5fa0'),
      ouro: ms.mat('#e0b03a', { emissive: '#e0b03a', emissiveIntensity: 0.25 }), ouroBrilho: ms.brilho('#ffd23f', 0.6), olho: ms.brilho('#9affb0', 0.9),
      preto: ms.mat('#26262e'), tronco: ms.mat('#8a6440'), folha: ms.mat('#4f9a3a'), folha2: ms.mat('#5fae48'), agua: ms.mat('#3ab8b0', { emissive: '#0a4a4a', emissiveIntensity: 0.4 }),
      vermelho: ms.mat('#a04030'), chama: ms.brilho('#ff9a3a', 1), metal: ms.mat('#3a2e22'), espinho: ms.mat('#8a8070'),
      escaravelho: ms.brilho('#2fb39a', 0.45), piramide: ms.mat('#efdcae'), piramide2: ms.mat('#c9a46a'), piramideClara: ms.mat('#f4e4bc'),
    };
    portaDeLuz(ms, '#d9b77a', '#ff9a3a', '#fff1c8');

    // ---- Dunas dos Faraós: 3 pirâmides gigantes atrás das dunas ----
    for (const [x, z, W, H, m] of [[-84, -52, 64, 46, M.piramide], [78, -88, 52, 38, M.piramide], [58, -6, 30, 22, M.piramide]]) {
      const base = 2.5;
      ms.peca(GEO.cone4, m, x, base + H / 2, z, W * 1.414, H, W * 1.414, 0, Math.PI / 4 + 0.15, 0, false);
      ms.peca(GEO.cone4, M.ouroBrilho, x, base + H * 0.95, z, W * 0.14, H * 0.1, W * 0.14, 0, Math.PI / 4 + 0.15, 0, false);
    }
    // e 2 pirâmides na beira das dunas, perto do caminho (a câmera de cima mostra estas)
    for (const [x, z, W, H, ang] of [[-38, -84, 30, 22, 0.2], [37, -104, 22, 16, -0.3]]) {
      // em degraus: cada degrau tem a sua sombra (de cima, lê melhor que uma pirâmide lisa)
      const n = 7;
      for (let i = 0; i < n; i++) ms.peca(GEO.caixa, i % 2 ? M.piramideClara : M.piramide, x, (i + 0.5) * H / n, z, W * (1 - i / n), H / n, W * (1 - i / n), 0, ang, 0);
      ms.peca(GEO.cone4, M.ouroBrilho, x, H + W / n * 0.4, z, W / n * 1.3, W / n * 0.8, W / n * 1.3, 0, Math.PI / 4 + ang, 0);
      ms.obst(x, z, W * 0.45);
    }
    // dunas: montinhos e obeliscos tortos
    nosMorros(ms, [0, 1], 24, 3, 20, (x, z) => ms.peca(GEO.dode, M.areiaClara, x, 0.6, z, 4 + rng() * 4, 1.2 + rng(), 3 + rng() * 4, 0, rng() * 3, 0));
    {
      const centro = { x: 0, z: -76 };
      for (const p of pontosNaSala(ms, 1, 5, 5, [centro, OASIS, { x: -38, z: -84 }, { x: 37, z: -104 }], 18)) obelisco(ms, M, p.x, p.z, 7 + rng() * 5, (rng() - 0.5) * 0.3);
      // o oásis com palmeiras
      ms.peca(GEO.disco, M.agua, OASIS.x, SALAS[1].h - 0.5, OASIS.z, OASIS.r + 0.3, 1, OASIS.r + 0.3, 0, 0, 0, false);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + rng() * 0.4, x = OASIS.x + Math.cos(a) * (OASIS.r + 2.4), z = OASIS.z + Math.sin(a) * (OASIS.r + 2.4); palmeira(ms, M, x, z, 0.9 + rng() * 0.3); ms.obst(x, z, 0.5); }
      for (const p of pontosNaSala(ms, 1, 6, 4, [centro, OASIS, { x: -38, z: -84 }, { x: 37, z: -104 }], 16)) { palmeira(ms, M, p.x, p.z, 0.8 + rng() * 0.4); ms.obst(p.x, p.z, 0.5); }
      for (const p of pontosNaSala(ms, 0, 2, 3, [{ x: 0, z: 0 }], 4)) palmeira(ms, M, p.x, p.z, 0.8);
      // pedras quebradas de uma estátua antiga (meio enterrada)
      ms.peca(GEO.caixa, M.arenito, -20, 0.6, -98, 3, 1.8, 2.2, 0.2, 0.4, 0.1);
      ms.peca(GEO.caixa, M.azul, -22.5, 0.5, -95, 2.2, 1.2, 1, 0.4, 0.8, 0.3);
      ms.peca(GEO.caixa, M.arenito, -18, 1.6, -94, 1.6, 1.4, 1.5, 0, 0.3, 0.6);
      ms.obst(-20, -97, 2.4);
    }

    // ---- Avenida das Esfinges ----
    {
      const s = SALAS[2];
      for (let z = s.z + 36; z >= s.z - 36; z -= 14.4) for (const lado of [-1, 1]) esfinge(ms, M, s.x + lado * 10.6, z, lado < 0 ? Math.PI / 2 : -Math.PI / 2, 0.85);
      for (const z of [s.z + 46, s.z - 46]) for (const lado of [-1, 1]) coluna(ms, M, s.x + lado * 7, z, 7);
    }

    // ---- Templo do Sol: o portal (pílono), colunas, o altar com o disco do sol e obeliscos ----
    {
      const c = F.corredores[2], s = SALAS[3], ang = Math.atan2(c.ux, c.uz), px = -c.uz, pz = c.ux;
      const gx = c.ax + c.ux * 15, gz = c.az + c.uz * 15; // (depois do portão selado)
      for (const l of [-1, 1]) {
        ms.peca(GEO.caixa, M.arenito, gx + px * 9 * l, 6, gz + pz * 9 * l, 9, 12, 4, 0, ang, 0);
        ms.peca(GEO.caixa, M.azul, gx + px * 9 * l, 9.5, gz + pz * 9 * l, 9.1, 0.8, 4.1, 0, ang, 0);
        ms.peca(GEO.caixa, M.vermelho, gx + px * 9 * l, 3, gz + pz * 9 * l, 9.1, 0.5, 4.1, 0, ang, 0);
      }
      ms.peca(GEO.caixa, M.arenito, gx, 11.5, gz, 9, 2, 3.4, 0, ang, 0);
      ms.peca(GEO.cil, M.ouroBrilho, gx + c.ux * 1.8, 11.5, gz + c.uz * 1.8, 1.6, 0.3, 1.6, Math.PI / 2, ang, 0);
      for (const l of [-1, 1]) ms.peca(GEO.caixa, M.azul, gx + c.ux * 1.75 + px * 2.6 * l, 11.6, gz + c.uz * 1.75 + pz * 2.6 * l, 3.6, 0.7, 0.2, 0, ang, l * 0.2);
      // colunas em volta do pátio
      const portas = [F.corredores[2], F.corredores[3]].map((cc, i) => Math.atan2(i === 0 ? -cc.ux : cc.ux, i === 0 ? -cc.uz : cc.uz));
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        if (portas.some((p) => Math.abs(Math.atan2(Math.sin(a - p), Math.cos(a - p))) < 0.32)) continue;
        coluna(ms, M, s.x + Math.sin(a) * 25, s.z + Math.cos(a) * 25, 8);
      }
      // o altar com o disco do sol (brilha)
      const ax = s.x + 13, az = s.z + 8;
      ms.peca(GEO.caixa, M.arenito, ax, 0.7, az, 3.6, 1.4, 2.4);
      ms.peca(GEO.cil, M.ouroBrilho, ax, 3.4, az, 3.2, 0.35, 3.2, Math.PI / 2, 0, 0);
      for (const l of [-1, 1]) ms.peca(GEO.caixa, M.azul, ax + l * 3, 3.4, az, 2.8, 0.8, 0.2, 0, 0, -l * 0.25);
      ms.obst(ax, az, 2.2);
      for (const l of [-1, 1]) { braseiro(ms, M.metal, M.chama, ax + l * 3.4, az + 2.6, 1); }
      const sai = F.corredores[3];
      for (const l of [-1, 1]) obelisco(ms, M, sai.ax - sai.ux * 4 - sai.uz * 6 * l, sai.az - sai.uz * 4 + sai.ux * 6 * l, 10);
    }

    // ---- Câmara dos Sarcófagos ----
    {
      const s = SALAS[4], centro = { x: -8, z: -387 };
      const sarcofago = (x, z, ang) => {
        ms.peca(GEO.caixa, M.azul, x, 0.55, z, 1.7, 1.1, 3.8, 0, ang, 0);
        ms.peca(GEO.caixa, M.ouro, x, 1.2, z, 1.5, 0.3, 3.5, 0, ang, 0);
        ms.peca(GEO.caixa, M.ouroBrilho, x + Math.sin(ang) * 1.3, 1.5, z + Math.cos(ang) * 1.3, 1.1, 0.4, 0.9, 0, ang, 0);
        ms.obst(x, z, 1.6);
      };
      for (const lado of [-1, 1]) for (const k of [-1, 0, 1]) sarcofago(s.x + lado * 14, s.z + k * 11, 0);
      for (let i = 0; i < 12; i++) { // tochas nas paredes
        const a = (i / 12) * Math.PI * 2, k = 0.95, x = s.x + Math.sin(a) * s.rx * k, z = s.z + Math.cos(a) * s.rz * k;
        if (ms.d(x, z) > -0.5) continue;
        ms.peca(GEO.cil, M.metal, x, 1.4, z, 0.25, 2.8, 0.25); ms.peca(GEO.cone, M.chama, x, 3.1, z, 0.6, 0.9, 0.6);
      }
      for (const p of pontosNaSala(ms, 4, 10, 3, [centro], 10)) {
        if (rng() < 0.5) { ms.peca(GEO.cil, rng() < 0.5 ? M.arenito : M.azul, p.x, 0.45, p.z, 0.6, 0.9, 0.6); ms.peca(GEO.ico, M.ouro, p.x, 1.05, p.z, 0.32, 0.32, 0.32); ms.obst(p.x, p.z, 0.45); }
        else { ms.peca(GEO.dode, M.ouroBrilho, p.x, 0.15, p.z, 1.4, 0.5, 1.2, 0, rng() * 3, 0); }
      }
    }

    // ---- O Poço de Areia: ponte de pedra e espinhos lá embaixo ----
    {
      const c = F.corredores[4], L = Math.hypot(c.bx - c.ax, c.bz - c.az), ang = Math.atan2(c.ux, c.uz), px = -c.uz, pz = c.ux;
      for (let s = 0; s <= L; s += 1.3) { const x = c.ax + c.ux * s, z = c.az + c.uz * s; if (F.salaEm(ms.o.x + x, ms.o.z + z) >= 0) continue; ms.peca(GEO.caixa, M.pedraEsc, x, -0.25, z, c.larg * 2 + 0.8, 0.5, 1.25, 0, ang, 0); }
      const ab = F.abismos[0];
      for (let n = 0; n < 40; n++) {
        const k = rng(), lado = rng() < 0.5 ? -1 : 1, x = ab.a.x + (ab.b.x - ab.a.x) * k + px * (4 + rng() * 7) * lado, z = ab.a.z + (ab.b.z - ab.a.z) * k + pz * (4 + rng() * 7) * lado;
        if (ms.d(x, z) < 2) continue;
        ms.peca(GEO.cone4, M.espinho, x, 0.8, z, 0.5, 1.8, 0.5);
      }
    }

    // ---- Galeria dos Deuses Gato: gatos gigantes, tesouro e o escaravelho ----
    {
      const s = SALAS[5];
      for (const z of [s.z + 20, s.z, s.z - 20]) for (const lado of [-1, 1]) gatoSentado(ms, M, s.x + lado * 15, z, lado < 0 ? Math.PI / 2 : -Math.PI / 2, 1.25);
      for (const p of pontosNaSala(ms, 5, 9, 3, [{ x: 6, z: -477 }], 11)) { ms.peca(GEO.dode, M.ouroBrilho, p.x, 0.2, p.z, 1.6, 0.6, 1.3, 0, rng() * 3, 0); ms.peca(GEO.cil, M.ouro, p.x + 0.7, 0.1, p.z + 0.5, 0.5, 0.08, 0.5); }
      const ex = s.x, ez = s.z + 26; // o escaravelho (olha para quem chega)
      ms.peca(GEO.caixa, M.arenito, ex, 0.5, ez, 3, 1, 3);
      ms.peca(GEO.ico, M.escaravelho, ex, 1.8, ez, 1.4, 0.8, 1.7);
      ms.peca(GEO.ico, M.escaravelho, ex, 1.7, ez + 1.6, 0.7, 0.5, 0.6);
      for (const l of [-1, 1]) for (const f of [-0.8, 0, 0.8]) ms.peca(GEO.caixa, M.preto, ex + l * 1.3, 1.3, ez + f, 1.2, 0.12, 0.12, 0, 0, l * 0.5);
      ms.peca(GEO.cil, M.ouroBrilho, ex, 2.9, ez, 1, 0.15, 1, Math.PI / 2, 0, 0);
      ms.obst(ex, ez, 1.8);
    }

    // ---- Câmara do Faraó: o sarcófago gigante em pé, gatos guardiões e a luz do sol ----
    {
      const s = SALAS[6], tx = s.x, tz = -578;
      ms.peca(GEO.caixa, M.arenito, tx, 0.6, tz, 7, 1.2, 4);
      ms.peca(GEO.caixa, M.ouro, tx, 5.5, tz, 3.8, 9, 2);
      ms.peca(GEO.caixa, M.azul, tx, 9.2, tz + 0.2, 4.2, 2.6, 2.2);
      for (const y of [8.4, 10]) ms.peca(GEO.caixa, M.ouroBrilho, tx, y, tz + 0.25, 4.3, 0.3, 2.25);
      ms.peca(GEO.caixa, M.ouroBrilho, tx, 9.3, tz + 1.15, 1.8, 1.8, 0.2);
      for (const l of [-1, 1]) ms.peca(GEO.caixa, M.azul, tx + l * 0.5, 6.4, tz + 1.05, 2.8, 0.5, 0.2, 0, 0, l * 0.7);
      ms.obst(tx, tz, 3.4);
      for (const l of [-1, 1]) gatoSentado(ms, M, tx + l * 9, tz + 2, 0, 1.5);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8, x = s.x + Math.sin(a) * 20, z = s.z + Math.cos(a) * 20;
        if (z > s.z + 14 && Math.abs(x - s.x) < 9) continue;
        if (z < s.z - 12 && Math.abs(x - s.x) < 14) continue;
        coluna(ms, M, x, z, 7); braseiro(ms, M.metal, M.chama, x + Math.sin(a + 1.57) * 2.2, z + Math.cos(a + 1.57) * 2.2, 0.8);
      }
      for (let n = 0; n < 12; n++) { const p = ms.pontoNaSala(6, 3); if (Math.hypot(p.x, p.z + 566) < 9) continue; ms.peca(GEO.dode, M.ouroBrilho, p.x, 0.2, p.z, 1.5, 0.6, 1.3, 0, rng() * 3, 0); }
      const anel = ms.geo(new THREE.TorusGeometry(7, 0.3, 3, 40).rotateX(Math.PI / 2));
      ms.peca(anel, M.ouroBrilho, s.x, 0.12, -566, 1, 1, 1);
      // a luz do sol que cai do teto, em cima do chefe (transparente, sem luz de verdade)
      const raio = new THREE.Mesh(ms.geo(new THREE.CylinderGeometry(3.4, 5, 34, 14, 1, true)), new THREE.MeshBasicMaterial({ color: '#ffe9a0', transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      ms.mats.set('raioSol', raio.material);
      raio.position.set(ms.o.x + s.x, ms.y(s.x, -566) + 17, ms.o.z - 566);
      ms.grupo.add(raio);
      ms.animar((dt, t) => { raio.material.opacity = 0.13 + Math.sin(t * 1.4) * 0.04; });
    }
  },

  // A entrada no mapa (a arte do Lâmina: o hipogeu do Vale das Tumbas, que NÃO é mais escondido):
  // o portal escavado no penhasco de arenito em camadas, o disco solar alado em azul e ouro,
  // hieróglifos azuis nos batentes, 2 colossos de faraó, a escada, braseiros, ânforas e a luz do
  // teto lá dentro. A porta (onde encostar) fica na frente da boca.
  entrada(b, { x, z, ang, y, obst }) {
    const fx = Math.sin(ang), fz = Math.cos(ang), sx = Math.cos(ang), sz = -Math.sin(ang);
    const P = (f, s) => ({ x: x + fx * f + sx * s, z: z + fz * f + sz * s });
    const aren1 = lambert('#9e5a38'), aren2 = lambert('#b8714a'), calc = lambert('#d9c09a'), estatua = lambert('#d9c08a'), coroa = lambert('#e8e0d0'), escuro = lambert('#0d0805');
    const azul = lambert('#2f6fa8', { emissive: '#215e8c', emissiveIntensity: 0.45 }), ouro = lambert('#f2c040', { emissive: '#f2a922', emissiveIntensity: 0.55 }), sol = lambert('#c0502a');
    const fogo = lambert('#ffb040', { emissive: '#ff6a10', emissiveIntensity: 1 }), bronze = lambert('#8a7a3a'), barro = lambert('#a8603a'), areia = lambert('#e8c170');
    const base = y(x, z);
    // o penhasco de arenito em camadas (com a abertura da porta)
    for (let i = -6; i <= 6; i++) for (let k = 0; k < 7; k++) {
      if (Math.abs(i) < 2 && k < 3) continue;
      const p = P(-1.5 - Math.abs(i) * 0.25 - ((i * 7 + k * 3) % 5) * 0.12, i * 1.9);
      b.add(GEO.caixa, k % 2 ? aren2 : aren1, p.x, base + k * 1.4 + 0.7, p.z, 2.6 + ((i + k) % 3) * 0.35, 1.4, 2.2, 0, ang + (((i * 3 + k) % 5) - 2) * 0.02, 0);
    }
    // os batentes com hieróglifos azuis, a viga com o disco solar alado e a boca escura
    for (const s of [-1, 1]) {
      const p = P(-0.2, s * 2.0); b.add(GEO.caixa, calc, p.x, base + 2.4, p.z, 0.9, 4.8, 0.9, 0, ang, s * 0.08);
      for (let k = 0; k < 3; k++) { const g = P(0.27, s * 2.0); b.add(GEO.caixa, azul, g.x, base + 1.4 + k * 1.2, g.z, 0.6, 0.8, 0.04, 0, ang, 0); }
    }
    { const p = P(-0.2, 0); b.add(GEO.caixa, calc, p.x, base + 5.3, p.z, 5.6, 1.3, 1.1, 0, ang, 0); b.add(GEO.caixa, escuro, p.x, base + 2.1, p.z, 3.0, 4.2, 0.9, 0, ang, 0);
      const f = P(0.36, 0); b.add(GEO.cil, sol, f.x, base + 5.3, f.z, 0.9, 0.06, 0.9, Math.PI / 2, ang, 0);
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const w = P(0.36, s * (1.05 + k * 0.5)); b.add(GEO.caixa, k % 2 ? ouro : azul, w.x, base + 5.4 - k * 0.1, w.z, 0.55, 0.2, 0.04, 0, ang, s * 0.12); } }
    // os 2 colossos de faraó (em pé, com a coroa branca)
    for (const s of [-1, 1]) {
      const p = P(0.6, s * 3.6);
      b.add(GEO.caixa, calc, p.x, base + 0.4, p.z, 1.4, 0.8, 1.4, 0, ang, 0);
      b.add(GEO.caixa, estatua, p.x, base + 1.6, p.z, 0.9, 1.7, 0.6, 0, ang, 0);
      b.add(GEO.caixa, estatua, p.x, base + 2.85, p.z, 1.0, 0.8, 0.65, 0, ang, 0);
      b.add(GEO.caixa, estatua, p.x, base + 3.85, p.z, 1.2, 1.3, 0.6, 0, ang, 0);
      b.add(GEO.caixa, estatua, p.x, base + 4.85, p.z, 0.6, 0.7, 0.55, 0, ang, 0);
      b.add(GEO.cil, coroa, p.x, base + 5.55, p.z, 0.55, 0.9, 0.55);
      obst(p.x, p.z, 0.9);
    }
    // a escada, os braseiros e as ânforas
    for (let k = 0; k < 4; k++) { const p = P(1.2 + k * 0.7, 0); b.add(GEO.caixa, calc, p.x, base + 0.12, p.z, 3.4, 0.25, 0.7, 0, ang, 0); }
    for (const s of [-1, 1]) {
      const p = P(2.6, s * 2.6);
      b.add(GEO.caixa, calc, p.x, base + 0.3, p.z, 1.1, 0.6, 1.1, 0, ang, 0); b.add(GEO.cil, bronze, p.x, base + 1.2, p.z, 1, 0.3, 1);
      b.add(GEO.cilFino, bronze, p.x, base + 0.85, p.z, 0.25, 0.6, 0.25); b.add(GEO.cone, fogo, p.x, base + 1.65, p.z, 0.55, 0.8, 0.55);
      obst(p.x, p.z, 0.6);
      const a = P(1.0, s * 1.5); b.add(GEO.ico, barro, a.x, base + 0.35, a.z, 0.55, 0.7, 0.55);
      const m = P(1.4, s * 3); b.add(GEO.ico, areia, m.x, base + 0.3, m.z, 3, 0.9, 2.4);
    }
    const c = P(-3.4, 0);
    obst(c.x, c.z, 4.6);
    for (const s of [-1, 1]) { const q = P(-1.6, s * 6); obst(q.x, q.z, 3.2); }
  },
};
