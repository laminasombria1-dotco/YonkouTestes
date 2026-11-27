// =============================================================
// GRUTA DAS MARÉS (Arquipélago, a 2ª masmorra do bioma: mais difícil)
// Cavernas do mar, com piratas e um polvo gigante:
//  entrada  → a porta de luz, na areia da enseada
//  etapa 1  → Enseada dos Naufrágios: o navio quebrado, a âncora, barris e caixas
//  etapa 2  → Piscinas de Maré: paredões de pedra molhada, poças com anêmonas que brilham e o arco de pedra
//  etapa 3  → Gruta de Cristal Marinho: cristais azuis e verde-água no escuro
//  etapa 4  → Esconderijo Pirata: plataformas de madeira, baús de tesouro, canhões e a bandeira preta
//  (Ponte de Cordas: tábuas e cordas em cima do mar escuro)
//  etapa 5  → Caverna do Polvo: tentáculos gigantes saindo das poças, mexendo devagar
//  fim      → Trono das Marés: a concha gigante com a pérola, pedras no mar, a tempestade e o chefe
// Só desenho: as regras ficam em masmorra.js e os números em MASMORRAS_NOVAS (dados.js).
// =============================================================
import * as THREE from 'three';
import { GEO, lambert } from '../dungeon.js';
import { nosMorros, pontosNaSala, portaDeLuz, braseiro, portaoSimples, liquido, cristais } from './pecas.js';
import { palmeira, estrela } from './templo-submerso.js';

const SALAS = [
  { x: 0, z: 0, r: 9, h: 0, tipo: 'aberta', tema: 'enseada' },                                    // 0 entrada
  { x: 0, z: -62, rx: 40, rz: 44, h: 0, tipo: 'aberta', tema: 'enseada', etapa: 0 },              // 1 Enseada dos Naufrágios
  { x: 14, z: -168, rx: 38, rz: 32, h: 0, tipo: 'canion', tema: 'piscinas', etapa: 1 },           // 2 Piscinas de Maré
  { x: -4, z: -265, r: 28, h: 0.5, tipo: 'gruta', tema: 'cristal', etapa: 2 },                    // 3 Gruta de Cristal Marinho
  { x: 8, z: -358, r: 30, h: 0.5, tipo: 'gruta', tema: 'pirata', etapa: 3 },                      // 4 Esconderijo Pirata
  { x: -6, z: -455, rx: 28, rz: 28, h: 0.5, tipo: 'gruta', tema: 'polvo', etapa: 4 },             // 5 Caverna do Polvo
  { x: 4, z: -540, r: 25, h: 0.5, tipo: 'canion', tema: 'trono', fim: true },                     // 6 Trono das Marés
];
const POCAS = [[0, -160, 3.2], [28, -160, 3], [14, -184, 3.5], [-6, -178, 2.8], [34, -178, 2.8], [-20, -445, 4.5], [10, -464, 4], [-8, -436, 3]].map(([x, z, r]) => ({ x, z, r }));
const POCAS_POLVO = POCAS.slice(5);

const CHAO = {
  enseada: ['#ecd8a4', '#e3cc8e', '#f2e2b4'], piscinas: ['#7a8a8a', '#6a7a7a', '#86969a'],
  cristal: ['#1e3a48', '#24444f', '#1a3240'], pirata: ['#4a3a2a', '#544232', '#403224'],
  polvo: ['#2a2040', '#322648', '#241c38'], trono: ['#7a8a8a', '#6e7e80', '#86969a'],
};
const AREIA_MORRO = ['#c9b27a', '#b8a06a', '#d4be88'], ROCHA_MAR = ['#5a6a72', '#4a5a62', '#6a7a80', '#3e4c54'], GRUTA = ['#18303c', '#1e3844', '#142630'];
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export const GRUTA_MARES = {
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 6, tipo: 'aberta' },
      { a: 1, b: 2, larg: 7, tipo: 'canion' },
      { a: 2, b: 3, larg: 5 },               // a boca da gruta
      { a: 3, b: 4, larg: 5 },
      { a: 4, b: 5, larg: 2.4 },             // a Ponte de Cordas
      { a: 5, b: 6, larg: 6, tipo: 'canion' },
    ],
    abismos: [{ corredor: 4, r: 15, fundo: 10 }],
    buracos: POCAS,
  },
  corSelo: '#5fe0ff',
  portoes: [{ corredor: 1 }, { corredor: 2 }, { corredor: 3 }, { corredor: 4, depois: 2 }, { corredor: 5 }],
  acampamentos: [
    { x: 0, z: -64, etapa: 0 }, { x: 14, z: -170, etapa: 1 }, { x: -4, z: -267, etapa: 2 },
    { x: 8, z: -360, etapa: 3 }, { x: -6, z: -455, etapa: 4 },
  ],
  inicio: { x: 0, z: -8, ang: Math.PI },   // (um pouco para dentro: a viga da porta de luz fica atrás da câmera)
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 4, z: -546, ang: 0 },
  portal: { x: -10, z: -548, ang: 0.3 },

  temas: {
    enseada: { ceu: '#9fd0e8', hemi: '#f0fbff', luz: 1.7, sol: 1.35, nevoa: [36, 125], part: 'brilho', corPart: '#ffffff' },
    piscinas: { ceu: '#88c4de', hemi: '#e8f8ff', luz: 1.7, sol: 1.3, nevoa: [34, 120], part: 'brilho', corPart: '#dff8ff' },
    cristal: { ceu: '#08202e', hemi: '#7fe8ff', luz: 1.4, sol: 0.3, nevoa: [18, 80], part: 'brilho', corPart: '#9ff4ff' },
    pirata: { ceu: '#140e0a', hemi: '#ffd08a', luz: 1.4, sol: 0.3, nevoa: [18, 78], part: 'brilho', corPart: '#ffcc66' },
    polvo: { ceu: '#140c24', hemi: '#c8a8ff', luz: 1.4, sol: 0.3, nevoa: [16, 72], part: 'faisca', corPart: '#cfa8ff' },
    trono: { ceu: '#3a5a7a', hemi: '#d8f0ff', luz: 1.5, sol: 0.9, nevoa: [26, 95], part: 'brilho', corPart: '#e8f8ff', relampagos: true },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (h < hChao - 0.6) return c.set(s.tema === 'polvo' ? '#2a1a40' : '#2a8a9a');  // o fundo das poças
      return c.set(sorteia(rng, CHAO[s.tema]));
    }
    if (h < hChao - 2.5) return c.set('#081820');                                    // o mar escuro embaixo da ponte
    if (tipo === 'canion') { const f = Math.floor((h - hChao) / 2.2); return c.set(f === 0 && rng() < 0.4 ? '#e8f4f8' : ROCHA_MAR[((f % 4) + 4) % 4]); } // espuma na base
    return c.set(sorteia(rng, tipo === 'gruta' ? GRUTA : AREIA_MORRO));
  },

  // Portão de madeira de navio, com uma lanterna
  pecasPortao(ms, b, { lx, lz, base, ang, larg, px, pz }) {
    const o = ms.o, mad = ms.mat('#5a4030'), luz = ms.brilho('#ffcc55', 0.9);
    for (const lado of [-1, 1]) b.add(GEO.caixa, mad, o.x + lx + px * (larg + 1.1) * lado, base + 3.2, o.z + lz + pz * (larg + 1.1) * lado, 1.2, 6.4, 1.2, 0, ang, 0);
    b.add(GEO.caixa, mad, o.x + lx, base + 6.6, o.z + lz, (larg + 2) * 2, 1, 1.3, 0, ang, 0);
    b.add(GEO.ico, luz, o.x + lx, base + 5.7, o.z + lz, 0.45, 0.6, 0.45);
  },

  decorar(ms) {
    const rng = ms.rng, F = ms.forma;
    const M = {
      tronco: ms.mat('#8a6440'), folha: ms.mat('#4f9a3a'), folha2: ms.mat('#5fae48'), estrela: ms.mat('#ff6a4a'),
      madeira: ms.mat('#5a4030'), madeira2: ms.mat('#7a5a40'), vela: ms.mat('#d8d0bc'), ferro: ms.mat('#2e2e34'), corda: ms.mat('#a08a60'),
      pedra: ms.mat('#6a7a80'), pedraEsc: ms.mat('#3e4c54'), espuma: ms.mat('#e8f4f8'),
      anemona: ms.brilho('#ff7eb6', 0.6), anemona2: ms.brilho('#7dffb0', 0.6), cristal: ms.brilho('#5fe0ff', 0.7), cristal2: ms.brilho('#7dffd8', 0.6),
      ouro: ms.brilho('#ffd23f', 0.6), lampiao: ms.brilho('#ffcc55', 0.95), preto: ms.mat('#1a1a1e'), branco: ms.mat('#f0f0f0'),
      polvo: ms.mat('#8a4aa8'), polvo2: ms.mat('#b07ad0'), concha: ms.mat('#f4c8d0'), conchaEsc: ms.mat('#d898a8'), perola: ms.brilho('#f4faff', 0.85),
      agua: ms.mat('#1a6a8a', { emissive: '#0a3a4a', emissiveIntensity: 0.4, transparent: true, opacity: 0.85 }),
      aguaPolvo: ms.mat('#3a2a6a', { emissive: '#1a0a3a', emissiveIntensity: 0.5, transparent: true, opacity: 0.85 }),
    };
    portaDeLuz(ms, '#7a8a8a', '#ffcc55', '#fff1d0');
    const barril = (x, z) => { ms.peca(GEO.cil, M.madeira2, x, 0.65, z, 1.1, 1.3, 1.1); ms.peca(GEO.cil, M.ferro, x, 0.65, z, 1.15, 0.12, 1.15); ms.obst(x, z, 0.6); };
    const bau = (x, z, ang) => {
      ms.peca(GEO.caixa, M.madeira, x, 0.5, z, 1.6, 1, 1.1, 0, ang, 0);
      ms.peca(GEO.caixa, M.madeira2, x - Math.sin(ang) * 0.4, 1.3, z - Math.cos(ang) * 0.4, 1.6, 0.15, 1, -0.9, ang, 0);
      ms.peca(GEO.dode, M.ouro, x, 1.05, z, 0.8, 0.3, 0.55, 0, ang, 0);
      ms.obst(x, z, 0.9);
    };
    const lampiao = (x, z) => { ms.peca(GEO.cil, M.madeira, x, 1.3, z, 0.18, 2.6, 0.18); ms.peca(GEO.ico, M.lampiao, x, 2.8, z, 0.32, 0.42, 0.32); ms.obst(x, z, 0.3); };

    nosMorros(ms, [0, 1], 50, 2, 18, (x, z) => { if (rng() < 0.6) palmeira(ms, M, x, z, 0.9 + rng() * 0.5); else ms.peca(GEO.dode, M.pedra, x, 1, z, 2 + rng() * 3, 1.5 + rng() * 2, 2 + rng() * 3, rng(), rng() * 3, 0); });
    for (const p of POCAS) {
      const s = SALAS[F.salaPerto(ms.o.x + p.x, ms.o.z + p.z)], polvo = s.tema === 'polvo';
      ms.peca(GEO.disco, polvo ? M.aguaPolvo : M.agua, p.x, s.h - 0.55, p.z, p.r + 0.3, 1, p.r + 0.3, 0, 0, 0, false);
      if (!polvo) for (let i = 0; i < 4; i++) { const a = rng() * Math.PI * 2; ms.peca(GEO.ico, i % 2 ? M.anemona : M.anemona2, p.x + Math.cos(a) * (p.r + 0.6), 0.2, p.z + Math.sin(a) * (p.r + 0.6), 0.45, 0.35, 0.45); }
    }

    // ---- Enseada dos Naufrágios: o navio quebrado e a âncora ----
    {
      const nx = -18, nz = -74, ang = 0.5;
      const P = (f, s2) => [nx + Math.sin(ang) * f + Math.cos(ang) * s2, nz + Math.cos(ang) * f - Math.sin(ang) * s2];
      for (const [f, comp, alt] of [[-3, 10, 3.6], [5, 6, 3]]) { const [x, z] = P(f, 0); ms.peca(GEO.caixa, M.madeira, x, alt / 2 - 0.6, z, 5, alt, comp, 0, ang, 0.2); }
      const [cx, cz] = P(-2, 0); ms.peca(GEO.caixa, M.madeira2, cx, 2.7, cz, 4.4, 0.25, 9, 0, ang, 0.2);
      for (let i = 0; i < 4; i++) { const [x, z] = P(9 + i * 1.6, 0); ms.peca(GEO.arco, M.madeira, x, 0, z, 2.6, 3.4, 2, 0, ang + Math.PI / 2, 0); } // as costelas quebradas
      const [mx, mz] = P(-2, 0); ms.peca(GEO.cil, M.madeira, mx, 6, mz, 0.45, 9, 0.45, 0.2, ang, 0.25);
      ms.peca(GEO.caixa, M.vela, mx + 0.8, 7, mz, 0.06, 3.6, 3.4, 0.2, ang, 0.25);
      for (const f of [-6, -1, 4]) { const [x, z] = P(f, 0); ms.obst(x, z, 3); }
      // a âncora enfiada na areia
      const ax = 18, az = -40;
      ms.peca(GEO.cil, M.ferro, ax, 1.8, az, 0.35, 3.6, 0.35, 0, 0, 0.15);
      ms.peca(GEO.caixa, M.ferro, ax - 0.45, 3.3, az, 2, 0.3, 0.3, 0, 0, 0.15);
      ms.peca(GEO.arco, M.ferro, ax + 0.2, 0.6, az, 1.4, -1.2, 1, 0, 0, 0.15);
      ms.obst(ax, az, 1.1);
      for (const p of pontosNaSala(ms, 1, 10, 3, [{ x: 0, z: -64 }, { x: nx, z: nz }], 12)) { if (rng() < 0.6) barril(p.x, p.z); else { ms.peca(GEO.caixa, M.madeira2, p.x, 0.5, p.z, 1, 1, 1, 0, rng() * 3, 0); ms.obst(p.x, p.z, 0.7); } }
      for (const p of pontosNaSala(ms, 1, 12, 1, [{ x: 0, z: -64 }], 6)) estrela(ms, M.estrela, p.x, p.z);
    }

    // ---- Piscinas de Maré: o arco de pedra e as anêmonas ----
    {
      const s = SALAS[2];
      ms.peca(GEO.arco, M.pedra, s.x, 0, s.z + 4, 16, 11, 5, 0, 0.2, 0);
      for (const l of [-1, 1]) ms.obst(s.x + Math.cos(0.2) * 16 * l, s.z + 4 - Math.sin(0.2) * 16 * l, 2.6);
      for (const p of pontosNaSala(ms, 2, 8, 3, [{ x: 14, z: -170 }, ...POCAS], 8)) { const e = 1 + rng() * 1.2; ms.peca(GEO.dode, M.pedraEsc, p.x, 0.5 * e, p.z, 1.8 * e, 1.2 * e, 1.5 * e, rng(), rng() * 3, 0); ms.peca(GEO.ico, M.anemona2, p.x, 1.2 * e, p.z, 0.4, 0.3, 0.4); ms.obst(p.x, p.z, 1.1 * e); }
      nosMorros(ms, [2, 6], 30, 0.2, 2, (x, z) => ms.peca(GEO.ico, M.espuma, x, 0.2, z, 1.6 + rng(), 0.4, 1.2 + rng(), 0, rng() * 3, 0)); // espuma das ondas
    }

    // ---- Gruta de Cristal Marinho ----
    {
      const s = SALAS[3], octa = ms.geo(new THREE.OctahedronGeometry(1, 0));
      for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2 + rng() * 0.3; cristais(ms, octa, M.cristal, i % 3 ? M.cristal2 : null, s.x + Math.sin(a) * s.r * 0.86, s.z + Math.cos(a) * s.r * 0.86, 0.9 + rng() * 0.6, true); }
      nosMorros(ms, [3], 24, 3.5, 10, (x, z) => cristais(ms, octa, M.cristal, M.cristal2, x, z, 0.6 + rng() * 0.5));
      for (let n = 0; n < 30; n++) { const p = ms.pontoNaSala(3, 1); ms.peca(octa, M.cristal2, p.x, 0.25, p.z, 0.18, 0.4, 0.18, 0, rng() * 3, 0); }
    }

    // ---- Esconderijo Pirata ----
    {
      const s = SALAS[4], centro = { x: 8, z: -360 };
      for (let i = 0; i < 6; i++) { // plataformas de madeira na beira
        const a = (i / 6) * Math.PI * 2 + 0.4, x = s.x + Math.sin(a) * 24, z = s.z + Math.cos(a) * 24;
        for (const q of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) ms.peca(GEO.cil, M.madeira, x + q[0], 1.2, z + q[1], 0.3, 2.4, 0.3);
        ms.peca(GEO.caixa, M.madeira2, x, 2.5, z, 4, 0.3, 4, 0, a, 0);
        if (i % 2) barril(x, z); else lampiao(x, z);
        ms.obst(x, z, 2.2);
      }
      for (const p of pontosNaSala(ms, 4, 5, 3, [centro], 11)) bau(p.x, p.z, rng() * 3);
      for (const p of pontosNaSala(ms, 4, 8, 2, [centro], 9)) ms.peca(GEO.dode, M.ouro, p.x, 0.2, p.z, 1.3, 0.5, 1.1, 0, rng() * 3, 0);
      for (const [x, z, a] of [[s.x - 14, s.z - 8, 0.8], [s.x + 15, s.z - 6, -0.9]]) { // canhões
        ms.peca(GEO.cil, M.ferro, x, 1.1, z, 0.8, 3.2, 0.8, Math.PI / 2 - 0.2, a, 0);
        for (const l of [-0.8, 0.8]) ms.peca(GEO.cil, M.madeira, x + Math.cos(a) * l, 0.5, z - Math.sin(a) * l, 1, 0.3, 1, 0, a, Math.PI / 2);
        ms.obst(x, z, 1.4);
      }
      // a bandeira preta com a caveira
      const bx = s.x - 6, bz = s.z + 18;
      ms.peca(GEO.cil, M.madeira, bx, 4, bz, 0.3, 8, 0.3); ms.obst(bx, bz, 0.4);
      ms.peca(GEO.caixa, M.preto, bx + 1.6, 6.8, bz, 3, 2, 0.06);
      ms.peca(GEO.ico, M.branco, bx + 1.6, 7, bz + 0.05, 0.45, 0.45, 0.06);
      for (const l of [-1, 1]) ms.peca(GEO.caixa, M.branco, bx + 1.6, 6.4, bz + 0.05, 1.4, 0.16, 0.05, 0, 0, l * 0.6);
    }

    // ---- Ponte de Cordas ----
    {
      const c = F.corredores[4], L = Math.hypot(c.bx - c.ax, c.bz - c.az), ang = Math.atan2(c.ux, c.uz), ab = F.abismos[0], px = -c.uz, pz = c.ux;
      const mx = (ab.a.x + ab.b.x) / 2, mz = (ab.a.z + ab.b.z) / 2, comp = Math.hypot(ab.b.x - ab.a.x, ab.b.z - ab.a.z);
      liquido(ms, M.agua, mx, ms.y(c.ax, c.az) - 5, mz, ab.r * 2 + 6, comp + ab.r * 2, ang);
      for (let s = 0; s <= L; s += 0.9) {
        const x = c.ax + c.ux * s, z = c.az + c.uz * s;
        if (F.salaEm(ms.o.x + x, ms.o.z + z) >= 0) continue;
        ms.peca(GEO.caixa, (Math.round(s / 0.9) % 2) ? M.madeira : M.madeira2, x, -0.1, z, c.larg * 2 + 0.4, 0.15, 0.7, 0, ang, (rng() - 0.5) * 0.08);
      }
      for (let s = 2; s <= L - 2; s += 6) for (const l of [-1, 1]) {
        const x = c.ax + c.ux * s + px * (c.larg + 0.2) * l, z = c.az + c.uz * s + pz * (c.larg + 0.2) * l;
        ms.peca(GEO.cil, M.madeira, x, 0.7, z, 0.2, 1.4, 0.2);
        ms.peca(GEO.caixa, M.corda, x + c.ux * 3, 1.15, z + c.uz * 3, 0.08, 0.08, 6, 0, ang, 0);
      }
    }

    // ---- Caverna do Polvo: tentáculos gigantes saindo das poças ----
    {
      const s = SALAS[5];
      // os segmentos são "pontos" invisíveis (Object3D) que só servem para a conta;
      // todos os segmentos são desenhados de uma vez (1 InstancedMesh: 1 desenho só)
      const grupos = [], segs = [];
      POCAS_POLVO.forEach((p, k) => {
        const g = new THREE.Object3D();
        for (let t = 0; t < 3; t++) {
          const a = (t / 3) * Math.PI * 2 + k, tent = new THREE.Object3D();
          let y = -0.5, r = 0.9, inc = 0;
          for (let i = 0; i < 7; i++) {
            const seg = new THREE.Object3D();
            seg.scale.set(r * 2, 1.6, r * 2);
            seg.position.set(Math.sin(inc) * i * 0.5, y + 0.8, 0);
            seg.rotation.z = -inc;
            tent.add(seg); segs.push({ seg, cor: i % 2 });
            y += Math.cos(inc) * 1.5; inc += 0.18; r *= 0.82;
          }
          tent.position.set(Math.cos(a) * p.r * 0.45, 0, Math.sin(a) * p.r * 0.45);
          tent.rotation.y = -a;
          g.add(tent);
        }
        g.position.set(ms.o.x + p.x, s.h - 0.5, ms.o.z + p.z);
        grupos.push({ g, k });
      });
      const inst = new THREE.InstancedMesh(GEO.cil, ms.mat('#ffffff'), segs.length), c1 = new THREE.Color('#8a4aa8'), c2 = new THREE.Color('#b07ad0');
      segs.forEach((sg, i) => inst.setColorAt(i, sg.cor ? c2 : c1));
      inst.frustumCulled = false;
      ms.grupo.add(inst);
      ms.animar((dt, t) => {
        for (const { g, k } of grupos) { g.children.forEach((tent, i) => { tent.rotation.z = Math.sin(t * 0.9 + i * 2 + k) * 0.18; }); g.updateMatrixWorld(true); }
        segs.forEach((sg, i) => inst.setMatrixAt(i, sg.seg.matrixWorld));
        inst.instanceMatrix.needsUpdate = true;
      });
      for (const p of pontosNaSala(ms, 5, 9, 2, [{ x: -6, z: -455 }, ...POCAS_POLVO], 8)) ms.peca(GEO.ico, rng() < 0.5 ? M.anemona : M.polvo2, p.x, 0.2, p.z, 0.5, 0.35, 0.5);
      nosMorros(ms, [5], 18, 2, 8, (x, z) => ms.peca(GEO.dode, M.pedraEsc, x, 1, z, 2 + rng() * 2, 2 + rng() * 2, 2 + rng() * 2, rng(), rng(), 0));
    }

    // ---- Trono das Marés: a concha gigante com a pérola e as pedras no mar ----
    {
      const s = SALAS[6], cx = s.x, cz = -558;
      ms.peca(GEO.chapeu, M.concha, cx, 0.1, cz, 6, 2, 5, Math.PI, 0, 0);
      ms.peca(GEO.chapeu, M.conchaEsc, cx, 1.2, cz - 2.6, 6, 5, 5, -1.2, 0, 0);
      ms.peca(GEO.ico, M.perola, cx, 1.9, cz, 1.8, 1.8, 1.8);
      ms.obst(cx, cz, 5);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8, x = s.x + Math.sin(a) * 19, z = s.z + Math.cos(a) * 19;
        if (z > s.z + 14 && Math.abs(x - s.x) < 9) continue;
        if (z < s.z - 12 && Math.abs(x - s.x) < 10) continue;
        ms.peca(GEO.cil, M.madeira, x, 1.6, z, 0.4, 3.2, 0.4); ms.peca(GEO.ico, M.lampiao, x, 3.4, z, 0.4, 0.5, 0.4);
        ms.obst(x, z, 0.5);
      }
      nosMorros(ms, [6], 10, 6, 20, (x, z) => ms.peca(GEO.dode, M.pedra, x, 4, z, 3 + rng() * 2, 10 + rng() * 8, 3 + rng() * 2, 0, rng() * 3, 0)); // pedras altas no mar
      const anel = ms.geo(new THREE.TorusGeometry(7, 0.3, 3, 40).rotateX(Math.PI / 2));
      ms.peca(anel, M.cristal, s.x, 0.12, -546, 1, 1, 1);
    }
  },

  // A entrada no mapa (a arte do Lâmina: a gruta marinha de calcário, à vista): o arco claro em 4
  // anéis, as rochas cobertas de mata, a boca escura com o reflexo da água lá dentro, estalactites,
  // samambaias penduradas, orquídeas, o barco a remo e uma lanterna. A porta fica na frente da boca.
  entrada(b, { x, z, ang, y, obst }) {
    const fx = Math.sin(ang), fz = Math.cos(ang), sx = Math.cos(ang), sz = -Math.sin(ang);
    const P = (f, s) => ({ x: x + fx * f + sx * s, z: z + fz * f + sz * s });
    const cal = lambert('#d6d0bc'), cal2 = lambert('#c8c4b4'), cal3 = lambert('#d9c28a'), escuro = lambert('#0a1418'), mata = lambert('#3a8a3a'), mata2 = lambert('#4a9a3a');
    const agua = lambert('#9ae8ff', { emissive: '#4ac8e8', emissiveIntensity: 0.5 }), orq = lambert('#e85ad8'), orq2 = lambert('#c83ac8');
    const mad = lambert('#7a5232'), mad2 = lambert('#8a6240'), luz = lambert('#ffd890', { emissive: '#f2a030', emissiveIntensity: 1 }), ferro = lambert('#3a3024');
    const b0 = Math.max(-0.55, y(P(4, 0).x, P(4, 0).z)) - 0.3, R = 4;
    // o arco de calcário (4 anéis, cada um maior e mais para trás)
    for (let k = 0; k < 4; k++) for (let i = 0; i <= 10; i++) {
      const t = (i / 10) * Math.PI, p = P(1.5 - k * 1.3, Math.cos(t) * (R + k * 1.2));
      b.add(GEO.caixa, k ? (i % 2 ? cal2 : cal) : cal, p.x, b0 + Math.sin(t) * (R + k * 1.2) * 1.05, p.z, 1.6, 1.4, 1.6, 0, ang, t + Math.PI / 2);
    }
    // as rochas em volta, com a mata por cima
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI, d = R + 5, p = P(-1 - Math.sin(a) * 2, Math.cos(a) * d); b.add(GEO.dode, i % 2 ? cal2 : cal3, p.x, b0 + Math.sin(a) * 5 + 1.2, p.z, 4.5, 4, 4, i * 0.7, i * 1.3, 0); b.add(GEO.ico, i % 2 ? mata : mata2, p.x, b0 + Math.sin(a) * 5 + 3.4, p.z, 3.5, 1.2, 3.5, 0, i, 0); }
    // a boca escura e o reflexo da água lá dentro
    { const p = P(0.2, 0); b.add(GEO.caixa, escuro, p.x, b0 + R * 0.45, p.z, R * 1.7, R * 0.95, 3, 0, ang, 0); const g = P(-1.2, 0.5); b.add(GEO.ico, agua, g.x, b0 + 0.8, g.z, 3.2, 1.2, 0.3, 0, ang, 0); }
    // estalactites
    for (let i = -5; i <= 5; i++) { const t = Math.PI / 2 + i * 0.22, p = P(1.8, Math.cos(t) * (R - 0.4)), h = 0.6 + ((i * 7 + 13) % 5) * 0.3; b.add(GEO.cone, cal2, p.x, b0 + Math.sin(t) * (R - 0.4) * 1.05 - h / 2, p.z, 0.35, h, 0.35, Math.PI, 0, 0); }
    // samambaias penduradas e orquídeas
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) { const p = P(2.2, s * (2 + k * 0.6)); b.add(GEO.cone4, mata, p.x, b0 + 3.4 - k * 0.3, p.z, 0.25, 1.6 + k * 0.4, 0.08, Math.PI, 0, 0); }
      const o = P(2.4, s * 4.2); b.add(GEO.ico, orq, o.x, b0 + 2.4, o.z, 0.4, 0.3, 0.4); b.add(GEO.ico, orq2, o.x, b0 + 2.7, o.z + 0.2, 0.35, 0.25, 0.35);
    }
    // o barco a remo e a lanterna
    { const bc = P(4.5, 1.2), ry = ang + 0.3, bs = Math.cos(ry), bz = -Math.sin(ry), yy = -0.5;
      b.add(GEO.caixa, mad, bc.x, yy + 0.05, bc.z, 1.2, 0.3, 3, 0, ry, 0);
      for (const s of [-1, 1]) b.add(GEO.caixa, mad2, bc.x + bs * s * 0.6, yy + 0.3, bc.z + bz * s * 0.6, 0.1, 0.5, 3, 0, ry, s * 0.2);
      obst(bc.x, bc.z, 1.2); }
    { const l = P(3, -3), ly = Math.max(-0.25, y(l.x, l.z)); b.add(GEO.cil, mad, l.x, ly + 0.6, l.z, 0.12, 1.2, 0.12); b.add(GEO.caixa, luz, l.x, ly + 1.35, l.z, 0.3, 0.42, 0.3); b.add(GEO.cone4, ferro, l.x, ly + 1.65, l.z, 0.42, 0.22, 0.42, 0, 0.785, 0); obst(l.x, l.z, 0.3); }
    // a gruta é sólida (só a boca é a porta)
    const c = P(-3, 0); obst(c.x, c.z, 4.6);
    for (const s of [-1, 1]) { const q = P(0.5, s * 4.8); obst(q.x, q.z, 1.6); }
  },
};
