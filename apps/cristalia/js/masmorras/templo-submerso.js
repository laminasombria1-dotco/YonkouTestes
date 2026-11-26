// =============================================================
// TEMPLO SUBMERSO (Arquipélago, a 1ª masmorra do bioma)
// Um templo antigo que o mar engoliu:
//  entrada  → a porta de luz, na areia da praia
//  etapa 1  → Praia dos Corais: palmeiras, corais coloridos, conchas, estrelas-do-mar e poças de maré
//  etapa 2  → Recife Raso: a água cobre os pés; corais, algas e estrelas-do-mar
//  etapa 3  → Átrio Afundado: colunas quebradas, a estátua do deus do mar com o tridente e canais de água
//  etapa 4  → Salão das Conchas: conchas gigantes com pérolas que brilham e raios de luz que entram pelo teto
//  (Ponte do Abismo Azul: ponte de pedra sobre a água funda)
//  etapa 5  → Jardim de Algas: algas altas e águas-vivas que flutuam
//  fim      → Santuário do Tridente: o tridente gigante, o altar da pérola, as cascatas e o chefe
// Só desenho: as regras ficam em masmorra.js e os números em MASMORRAS_NOVAS (dados.js).
// =============================================================
import * as THREE from 'three';
import { GEO, lambert } from '../dungeon.js';
import { nosMorros, pontosNaSala, portaDeLuz, braseiro, portaoSimples, liquido } from './pecas.js';

const SALAS = [
  { x: 0, z: 0, r: 9, h: 0, tipo: 'aberta', tema: 'praia' },                                     // 0 entrada
  { x: 0, z: -60, rx: 38, rz: 44, h: 0, tipo: 'aberta', tema: 'praia', etapa: 0 },               // 1 Praia dos Corais
  { x: 10, z: -165, rx: 40, rz: 32, h: 0, tipo: 'aberta', tema: 'recife', etapa: 1 },            // 2 Recife Raso
  { x: 0, z: -262, r: 28, h: 0.5, tipo: 'gruta', ceuAberto: true, tema: 'atrio', etapa: 2 },     // 3 Átrio Afundado
  { x: -8, z: -355, r: 30, h: 0.5, tipo: 'gruta', tema: 'conchas', etapa: 3 },                   // 4 Salão das Conchas
  { x: 8, z: -450, rx: 26, rz: 30, h: 0.5, tipo: 'gruta', tema: 'algas', etapa: 4 },             // 5 Jardim de Algas
  { x: 2, z: -530, r: 25, h: 1, tipo: 'gruta', tema: 'santuario', fim: true },                   // 6 Santuário do Tridente
];
const POCAS = [[-20, -40, 3.5], [20, -48, 3], [-24, -84, 3.5], [22, -86, 3.2]].map(([x, z, r]) => ({ x, z, r }));

const CHAO = {
  praia: ['#ecd8a4', '#e3cc8e', '#f2e2b4'], recife: ['#d8c890', '#cdbd84', '#e0d29c'],
  atrio: ['#9ab8b8', '#8aaaa8', '#a6c4c2'], conchas: ['#3a6a7a', '#33606e', '#417484'],
  algas: ['#2a5a4e', '#245046', '#306454'], santuario: ['#4a7a8a', '#42707e', '#528494'],
};
const AREIA_MORRO = ['#c9b27a', '#b8a06a', '#d4be88', '#6a9a6a'], PEDRA_MAR = ['#1e3a48', '#24444f', '#18303c', '#2a4a56'];
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export function palmeira(ms, M, x, z, e = 1) {
  const r = ms.rng, inc = (r() - 0.5) * 0.4;
  ms.peca(GEO.cil, M.tronco, x, 3 * e, z, 0.4 * e, 6 * e, 0.4 * e, inc * 0.5, 0, inc);
  const tx = x - Math.sin(inc) * 3 * e, tz = z + Math.sin(inc * 0.5) * 3 * e, ty = 6 * e;
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + r(); ms.peca(GEO.caixa, i % 2 ? M.folha : M.folha2, tx + Math.cos(a) * 1.5 * e, ty - 0.4 * e, tz - Math.sin(a) * 1.5 * e, 3.4 * e, 0.12, 0.8 * e, 0, a, -0.45); }
}
// Coral (galhos coloridos)
export function coral(ms, mats, x, z, e = 1, bate = false) {
  const r = ms.rng, m = mats[Math.floor(r() * mats.length)];
  for (let i = 0; i < 5; i++) { const a = r() * Math.PI * 2, inc = 0.3 + r() * 0.5; ms.peca(GEO.cil, m, x + Math.cos(a) * 0.4 * e, 0.8 * e, z + Math.sin(a) * 0.4 * e, 0.25 * e, (1.4 + r()) * e, 0.25 * e, Math.sin(a) * inc, 0, -Math.cos(a) * inc); }
  ms.peca(GEO.ico, m, x, 0.3 * e, z, 0.7 * e, 0.5 * e, 0.7 * e);
  if (bate) ms.obst(x, z, 0.8 * e);
}
export function estrela(ms, mat, x, z, y = 0.06, chao = true) {
  const a0 = ms.rng() * 6.28;
  for (let i = 0; i < 5; i++) { const a = a0 + (i / 5) * Math.PI * 2; ms.peca(GEO.caixa, mat, x + Math.cos(a) * 0.3, y, z - Math.sin(a) * 0.3, 0.6, 0.08, 0.18, 0, a, 0, chao); }
}

export const TEMPLO_SUBMERSO = {
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 6, tipo: 'aberta' },
      { a: 1, b: 2, larg: 7, tipo: 'aberta' },
      { a: 2, b: 3, larg: 6 },               // a escadaria do templo
      { a: 3, b: 4, larg: 5 },
      { a: 4, b: 5, larg: 2.6 },             // a Ponte do Abismo Azul
      { a: 5, b: 6, larg: 6 },
    ],
    abismos: [{ corredor: 4, r: 15, fundo: 10 }],
    buracos: POCAS,
  },
  corSelo: '#5fe0ff',
  portoes: [{ corredor: 1 }, { corredor: 2 }, { corredor: 3 }, { corredor: 4, depois: 2 }, { corredor: 5 }],
  acampamentos: [
    { x: 0, z: -62, etapa: 0 }, { x: 10, z: -166, etapa: 1 }, { x: 0, z: -262, etapa: 2 },
    { x: -8, z: -356, etapa: 3 }, { x: 8, z: -452, etapa: 4 },
  ],
  inicio: { x: 0, z: -8, ang: Math.PI },   // (um pouco para dentro: a viga da porta de luz fica atrás da câmera)
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 2, z: -535, ang: 0 },
  portal: { x: -12, z: -537, ang: 0.3 },

  temas: {
    praia: { ceu: '#8fd8ff', hemi: '#e8fbff', luz: 1.75, sol: 1.4, nevoa: [40, 130], part: 'brilho', corPart: '#ffffff' },
    recife: { ceu: '#7fd0ef', hemi: '#e2f8ff', luz: 1.75, sol: 1.35, nevoa: [38, 125], part: 'brilho', corPart: '#dff8ff' },
    atrio: { ceu: '#4fa0c0', hemi: '#d0f4ff', luz: 1.6, sol: 1, nevoa: [26, 95], part: 'faisca', corPart: '#cfefff' },
    conchas: { ceu: '#0e2a3a', hemi: '#9fe8ff', luz: 1.45, sol: 0.35, nevoa: [18, 80], part: 'faisca', corPart: '#bfefff' },
    algas: { ceu: '#0a2a26', hemi: '#9fffe0', luz: 1.45, sol: 0.35, nevoa: [16, 74], part: 'faisca', corPart: '#9fffe0' },
    santuario: { ceu: '#0c2238', hemi: '#a8d8ff', luz: 1.55, sol: 0.4, nevoa: [20, 86], part: 'faisca', corPart: '#d8f4ff' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng, x, z }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (h < hChao - 0.6) return c.set('#2a8a9a');                       // o fundo das poças de maré
      if (s.tema === 'conchas') { const r = Math.hypot(x - s.x, z - s.z); return c.set(Math.floor(r / 3) % 2 ? '#3a6a7a' : '#5a8a96'); } // mosaico em círculos
      return c.set(sorteia(rng, CHAO[s.tema]));
    }
    if (h < hChao - 2.5) return c.set('#0a2a3a');                         // o abismo azul
    return c.set(sorteia(rng, tipo === 'gruta' ? PEDRA_MAR : AREIA_MORRO));
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#8aaaa8'), ms.brilho('#5fe0ff', 0.7), ms.mat('#6a9090')); },

  decorar(ms) {
    const rng = ms.rng, F = ms.forma;
    const M = {
      tronco: ms.mat('#8a6440'), folha: ms.mat('#4f9a3a'), folha2: ms.mat('#5fae48'),
      coralRosa: ms.mat('#ff7eb6'), coralLaranja: ms.mat('#ff9a4a'), coralRoxo: ms.mat('#b58cff'), coralAmarelo: ms.mat('#ffd23f'),
      estrela: ms.mat('#ff6a4a'), concha: ms.mat('#f4c8d0'), conchaEsc: ms.mat('#e0a8b4'), perola: ms.brilho('#f4faff', 0.8),
      pedra: ms.mat('#9ab8b8'), pedraEsc: ms.mat('#6a8a8a'), ouro: ms.brilho('#ffd23f', 0.5), alga: ms.mat('#3a8a4a'), alga2: ms.mat('#4aa05a'),
      agua: ms.mat('#3ab8d0', { emissive: '#0a4a5a', emissiveIntensity: 0.35, transparent: true, opacity: 0.55, depthWrite: false }),
      aguaFunda: ms.mat('#1a6a8a', { emissive: '#0a3a4a', emissiveIntensity: 0.4, transparent: true, opacity: 0.85 }),
      cascata: ms.mat('#7fd8ff', { emissive: '#3a9ac0', emissiveIntensity: 0.5, transparent: true, opacity: 0.6, depthWrite: false }),
      madeira: ms.mat('#6b5238'), vela: ms.mat('#e8e0cc'), chama: ms.brilho('#5fe0ff', 1), metal: ms.mat('#2a3a44'),
      agua2: ms.brilho('#ff9ad8', 0.6),
    };
    const corais = [M.coralRosa, M.coralLaranja, M.coralRoxo, M.coralAmarelo];
    portaDeLuz(ms, '#9ab8b8', '#5fe0ff', '#e0fbff');

    // ---- morros de areia com palmeiras e pedras ----
    nosMorros(ms, [0, 1, 2], 70, 2, 18, (x, z) => { if (rng() < 0.6) palmeira(ms, M, x, z, 0.9 + rng() * 0.5); else ms.peca(GEO.dode, M.pedraEsc, x, 1, z, 2 + rng() * 3, 1.5 + rng() * 2, 2 + rng() * 3, rng(), rng() * 3, 0); });
    for (const p of POCAS) {
      ms.peca(GEO.disco, M.aguaFunda, p.x, -0.5, p.z, p.r + 0.3, 1, p.r + 0.3, 0, 0, 0, false);
      for (let i = 0; i < 2; i++) estrela(ms, M.estrela, p.x + (rng() - 0.5) * p.r, p.z + (rng() - 0.5) * p.r, -0.45, false);
    }

    // ---- Praia dos Corais ----
    {
      const centro = { x: 0, z: -62 };
      for (const p of pontosNaSala(ms, 1, 8, 3, [centro, ...POCAS], 12)) { palmeira(ms, M, p.x, p.z, 0.9 + rng() * 0.4); ms.obst(p.x, p.z, 0.5); }
      for (const p of pontosNaSala(ms, 1, 10, 2, [centro, ...POCAS], 9)) coral(ms, corais, p.x, p.z, 0.9 + rng() * 0.6, true);
      for (const p of pontosNaSala(ms, 1, 16, 1, [centro], 6)) { if (rng() < 0.5) estrela(ms, M.estrela, p.x, p.z); else ms.peca(GEO.chapeu, rng() < 0.5 ? M.concha : M.conchaEsc, p.x, 0, p.z, 0.5, 0.3, 0.4, 0, rng() * 3, 0); }
      // o mastro de um barco enterrado na areia
      ms.peca(GEO.cil, M.madeira, 22, 4, -70, 0.45, 8, 0.45, 0, 0, 0.3);
      ms.peca(GEO.caixa, M.vela, 21, 5, -70.2, 0.06, 3, 3, 0, 0, 0.3);
      ms.peca(GEO.caixa, M.madeira, 23.5, 0.4, -69, 3, 0.8, 1.6, 0.3, 0.4, 0.2);
      ms.obst(22.5, -70, 1.4);
    }

    // ---- Recife Raso: a água cobre os pés ----
    {
      const s = SALAS[2], centro = { x: 10, z: -166 };
      liquido(ms, M.agua, s.x, 0.28, s.z, s.rx * 2 + 16, s.rz * 2 + 16, 0);
      for (const p of pontosNaSala(ms, 2, 14, 3, [centro], 12)) coral(ms, corais, p.x, p.z, 1.1 + rng() * 0.9, true);
      for (const p of pontosNaSala(ms, 2, 16, 1, [centro], 8)) { if (rng() < 0.5) estrela(ms, M.estrela, p.x, p.z); else for (let i = 0; i < 3; i++) ms.peca(GEO.caixa, rng() < 0.5 ? M.alga : M.alga2, p.x + (rng() - 0.5), 0.8, p.z + (rng() - 0.5), 0.15, 1.6 + rng(), 0.4, (rng() - 0.5) * 0.3, rng() * 3, 0); }
      nosMorros(ms, [2], 20, 0.5, 4, (x, z) => coral(ms, corais, x, z, 1.4 + rng()));
    }

    // ---- Átrio Afundado: colunas quebradas, a estátua do deus do mar e os canais ----
    {
      const s = SALAS[3];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.26, x = s.x + Math.sin(a) * 23, z = s.z + Math.cos(a) * 23, h = 2 + rng() * 6;
        if (i % 4 === 3) { ms.peca(GEO.cil, M.pedra, x, 0.7, z, 1.4, 6, 1.4, Math.PI / 2, a, 0); ms.obst(x, z, 1.2); continue; } // caída
        ms.peca(GEO.cil, M.pedra, x, 0.3, z, 2, 0.6, 2);
        ms.peca(GEO.cil, M.pedra, x, h / 2, z, 1.3, h, 1.3);
        coral(ms, corais, x + 0.6, z, 0.5);
        ms.obst(x, z, 1);
      }
      const ex = s.x + 14, ez = s.z + 6;
      ms.peca(GEO.caixa, M.pedraEsc, ex, 0.8, ez, 3.4, 1.6, 3.4);
      ms.peca(GEO.caixa, M.pedra, ex, 3.6, ez, 2, 4, 1.4);
      ms.peca(GEO.ico, M.pedra, ex, 6.3, ez, 1, 1.1, 1);
      ms.peca(GEO.cone4, M.pedra, ex + 0.4, 5.6, ez, 0.9, 1.6, 0.6, Math.PI, 0, 0);
      ms.peca(GEO.cone4, M.ouro, ex, 7.4, ez, 1.1, 0.8, 1.1, 0, Math.PI / 4, 0);
      ms.peca(GEO.cil, M.ouro, ex - 1.4, 4.6, ez, 0.2, 8, 0.2);
      for (const l of [-0.5, 0, 0.5]) ms.peca(GEO.cone4, M.ouro, ex - 1.4, 9 + (l ? 0 : 0.3), ez + l, 0.25, 1, 0.25);
      ms.peca(GEO.caixa, M.ouro, ex - 1.4, 8.4, ez, 0.2, 0.2, 1.2);
      ms.obst(ex, ez, 2.2);
      for (const l of [-1, 1]) ms.peca(GEO.caixa, M.aguaFunda, s.x + l * 9, 0.04, s.z, 1.4, 0.06, s.r * 1.6);
    }

    // ---- Salão das Conchas: conchas gigantes com pérolas e raios de luz ----
    {
      const s = SALAS[4];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + 0.3, x = s.x + Math.sin(a) * 22, z = s.z + Math.cos(a) * 22, olha = a + Math.PI, e = 1 + rng() * 0.5;
        ms.peca(GEO.chapeu, M.concha, x, 0, z, 3 * e, 1.2 * e, 2.6 * e, Math.PI, olha, 0);
        ms.peca(GEO.chapeu, M.conchaEsc, x - Math.sin(olha) * 0.6 * e, 0.4 * e, z - Math.cos(olha) * 0.6 * e, 3 * e, 1.6 * e, 2.6 * e, -0.9, olha, 0);
        ms.peca(GEO.ico, M.perola, x, 0.9 * e, z, 0.9 * e, 0.9 * e, 0.9 * e);
        ms.obst(x, z, 2.4 * e);
      }
      for (let i = 0; i < 3; i++) {
        const p = ms.pontoNaSala(4, 6), raio = new THREE.Mesh(ms.geo(new THREE.CylinderGeometry(2, 3, 24, 10, 1, true)), new THREE.MeshBasicMaterial({ color: '#bff4ff', transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
        ms.mats.set('raioLuz' + i, raio.material);
        raio.position.set(ms.o.x + p.x, ms.y(p.x, p.z) + 12, ms.o.z + p.z);
        ms.grupo.add(raio);
      }
      nosMorros(ms, [4], 20, 1, 6, (x, z) => coral(ms, corais, x, z, 1.2 + rng()));
    }

    // ---- Ponte do Abismo Azul ----
    {
      const c = F.corredores[4], L = Math.hypot(c.bx - c.ax, c.bz - c.az), ang = Math.atan2(c.ux, c.uz), ab = F.abismos[0], px = -c.uz, pz = c.ux;
      const mx = (ab.a.x + ab.b.x) / 2, mz = (ab.a.z + ab.b.z) / 2, comp = Math.hypot(ab.b.x - ab.a.x, ab.b.z - ab.a.z);
      liquido(ms, M.aguaFunda, mx, ms.y(c.ax, c.az) - 4, mz, ab.r * 2 + 6, comp + ab.r * 2, ang);
      for (let s = 0; s <= L; s += 1.4) {
        const x = c.ax + c.ux * s, z = c.az + c.uz * s;
        if (F.salaEm(ms.o.x + x, ms.o.z + z) >= 0) continue;
        ms.peca(GEO.caixa, M.pedra, x, -0.3, z, c.larg * 2 + 0.8, 0.6, 1.35, 0, ang, 0);
        if (Math.round(s / 1.4) % 5 === 0) coral(ms, corais, x + px * (c.larg + 0.3), z + pz * (c.larg + 0.3), 0.4);
      }
    }

    // ---- Jardim de Algas: algas altas e águas-vivas que flutuam ----
    {
      const s = SALAS[5], centro = { x: 8, z: -452 };
      for (const p of pontosNaSala(ms, 5, 34, 2, [centro], 11)) {
        const h = 5 + rng() * 6;
        for (let i = 0; i < 2; i++) ms.peca(GEO.caixa, rng() < 0.5 ? M.alga : M.alga2, p.x + (rng() - 0.5), h / 2, p.z + (rng() - 0.5), 0.5, h, 0.15, (rng() - 0.5) * 0.15, rng() * 3, (rng() - 0.5) * 0.15);
        if (rng() < 0.25) ms.obst(p.x, p.z, 0.5);
      }
      nosMorros(ms, [5], 24, 0.5, 5, (x, z) => ms.peca(GEO.caixa, M.alga, x, 4, z, 0.6, 8 + rng() * 4, 0.2, 0, rng() * 3, 0));
      const vivas = new THREE.InstancedMesh(GEO.chapeu, M.agua2, 9), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
      const pos = Array.from({ length: 9 }, () => ms.pontoNaSala(5, 3)), y0 = ms.y(s.x, s.z);
      vivas.frustumCulled = false; ms.grupo.add(vivas);
      ms.animar((dt, t) => { pos.forEach((p, i) => { const k = 1 + Math.sin(t * 2 + i) * 0.12; vivas.setMatrixAt(i, m4.compose(v.set(ms.o.x + p.x, y0 + 5 + (i % 3) * 1.5 + Math.sin(t * 0.8 + i * 1.3) * 0.8, ms.o.z + p.z), q, sc.set(0.9 * k, 0.7 / k, 0.9 * k))); }); vivas.instanceMatrix.needsUpdate = true; });
    }

    // ---- Santuário do Tridente: o tridente gigante, o altar da pérola e as cascatas ----
    {
      const s = SALAS[6], tx = s.x, tz = -550;
      ms.peca(GEO.caixa, M.pedraEsc, tx, 1, tz, 5, 2, 5);
      ms.peca(GEO.cil, M.ouro, tx, 10, tz, 0.9, 16, 0.9);
      ms.peca(GEO.caixa, M.ouro, tx, 17.5, tz, 7, 0.9, 0.9);
      for (const l of [-3, 0, 3]) ms.peca(GEO.cone4, M.ouro, tx + l, 19.4 + (l ? 0 : 0.8), tz, 0.9, 3.2 + (l ? 0 : 1), 0.9, 0, Math.PI / 4, 0);
      ms.obst(tx, tz, 2.6);
      const ax = s.x, az = -543;
      ms.peca(GEO.cil, M.pedra, ax, 0.6, az, 3, 1.2, 3);
      ms.peca(GEO.chapeu, M.concha, ax, 1.2, az, 2, 0.8, 2, Math.PI, 0, 0);
      ms.peca(GEO.ico, M.perola, ax, 2, az, 1.2, 1.2, 1.2);
      ms.obst(ax, az, 1.6);
      for (let i = 0; i < 6; i++) { // cascatas nas paredes
        const a = (i / 6) * Math.PI * 2 + 0.5, x = s.x + Math.sin(a) * 27, z = s.z + Math.cos(a) * 27;
        if (z > s.z + 18) continue;
        ms.peca(GEO.caixa, M.cascata, x, 7, z, 2.2, 14, 1, 0, a, 0);
        ms.peca(GEO.disco, M.agua, x - Math.sin(a) * 2, 0.08, z - Math.cos(a) * 2, 2.6, 1, 2.6);
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8, x = s.x + Math.sin(a) * 19, z = s.z + Math.cos(a) * 19;
        if (z > s.z + 14 && Math.abs(x - s.x) < 9) continue;
        if (z < s.z - 12 && Math.abs(x - s.x) < 9) continue;
        ms.peca(GEO.cil, M.pedra, x, 3, z, 1.3, 6, 1.3); coral(ms, corais, x + 0.8, z, 0.5);
        braseiro(ms, M.metal, M.chama, x + Math.sin(a + 1.57) * 2, z + Math.cos(a + 1.57) * 2, 0.8);
        ms.obst(x, z, 1);
      }
      const anel = ms.geo(new THREE.TorusGeometry(7, 0.3, 3, 40).rotateX(Math.PI / 2));
      ms.peca(anel, M.chama, s.x, 0.12, -535, 1, 1, 1);
    }
  },

  // A entrada no mapa: a frente de um templo meio enterrado na areia da ilha, com corais (escondida, sem ícone)
  entrada(b, { x, z, ang, y, obst }) {
    const fx = Math.sin(ang), fz = Math.cos(ang), sx = Math.cos(ang), sz = -Math.sin(ang);
    const P = (f, s) => ({ x: x + fx * f + sx * s, z: z + fz * f + sz * s });
    const pedra = lambert('#9ab8b8'), pedra2 = lambert('#7a9a9a'), escuro = lambert('#081820'), areia = lambert('#e3cc8e'), coralR = lambert('#ff7eb6'), coralL = lambert('#ff9a4a'), luz = lambert('#5fe0ff', { emissive: '#5fe0ff', emissiveIntensity: 0.7 });
    const base = y(x, z);
    for (const [f, s, e] of [[-3, 0, 7], [-1, -4.5, 4.5], [-1, 4.5, 4.5], [-5, -3, 5], [-5, 3, 5]]) { const p = P(f, s); b.add(GEO.dode, areia, p.x, base + 0.8, p.z, e, 2.6, e); }
    for (const s of [-2.2, -0.75, 0.75, 2.2]) { if (Math.abs(s) < 1) continue; const p = P(0.6, s); b.add(GEO.cil, pedra, p.x, base + 2.4, p.z, 0.9, 4.8, 0.9); }
    const v = P(0.6, 0); b.add(GEO.caixa, pedra2, v.x, base + 5, v.z, 5.6, 0.8, 1.4, 0, ang, 0);
    b.add(GEO.cone4, pedra, v.x, base + 6.1, v.z, 4.4, 1.4, 1.2, 0, ang + Math.PI / 4, 0);
    const d = P(0.2, 0); b.add(GEO.caixa, escuro, d.x, base + 2.1, d.z, 2.8, 4.2, 0.4, 0, ang, 0);
    b.add(GEO.ico, luz, v.x + fx * 0.75, base + 5, v.z + fz * 0.75, 0.35, 0.35, 0.2);
    for (const [f, s, m] of [[1.6, -3, coralR], [1.3, 3.1, coralL], [2.3, 2.2, coralR]]) { const p = P(f, s); for (let i = 0; i < 3; i++) b.add(GEO.cil, m, p.x + (i - 1) * 0.25, base + 0.7, p.z, 0.22, 1.4, 0.22, 0, 0, (i - 1) * 0.4); }
    const c = P(-3, 0);
    obst(c.x, c.z, 4.6);
  },
};
