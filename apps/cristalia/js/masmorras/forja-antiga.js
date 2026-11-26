// =============================================================
// FORJA ANTIGA (Vulcânico; a outra masmorra do bioma é o Caminho das Brasas)
// A oficina esquecida dos ferreiros gigantes, dentro do vulcão:
//  entrada  → a porta de luz, no meio das cinzas
//  etapa 1  → Campo de Cinzas: árvores queimadas, pedras de lava e poças de lava; a cinza cai do céu
//  etapa 2  → Rio de Lava: um rio de lava que corta a sala, com uma ponte de pedras no meio
//  etapa 3  → Portão da Forja: as estátuas dos ferreiros gigantes com martelos e o portão de runas
//  etapa 4  → Salão das Bigornas: bigornas, fornos acesos, canais de lava no chão e correntes penduradas
//  (Ponte de Obsidiana: ponte de pedra preta em cima de um mar de lava)
//  etapa 5  → Fundição: degraus que sobem, caldeirões despejando lava e engrenagens gigantes girando
//  fim      → Coração da Forja: a grande fornalha com fogo, a bigorna-altar, as cascatas de lava e o chefe
// Só desenho: as regras ficam em masmorra.js e os números em MASMORRAS_NOVAS (dados.js).
// =============================================================
import * as THREE from 'three';
import { GEO, lambert } from '../dungeon.js';
import { nosMorros, pontosNaSala, portaDeLuz, braseiro, portaoSimples, liquido, arvoreMorta } from './pecas.js';

// Fundição: 5 degraus que sobem de 0,5 m (z = -424) até 8 m (z = -472)
function subida(x, z) {
  const k = Math.max(0, Math.min(1, (-424 - z) / 48)), s = k * 5, fl = Math.floor(s), fr = s - fl;
  const sobe = fl >= 5 ? 0 : Math.max(0, Math.min(1, (fr - 0.75) / 0.25));
  return 0.5 + ((fl + sobe * sobe * (3 - 2 * sobe)) / 5) * 7.5;
}

const SALAS = [
  { x: 0, z: 0, r: 9, h: 0, tipo: 'canion', tema: 'cinzas' },                                   // 0 entrada
  { x: 0, z: -60, rx: 38, rz: 44, h: 0, tipo: 'canion', tema: 'cinzas', etapa: 0 },             // 1 Campo de Cinzas
  { x: 10, z: -160, rx: 40, rz: 32, h: 0, tipo: 'canion', tema: 'rio', etapa: 1 },              // 2 Rio de Lava
  { x: 0, z: -258, r: 28, h: 0.5, tipo: 'gruta', ceuAberto: true, tema: 'portao', etapa: 2 },   // 3 Portão da Forja
  { x: -8, z: -350, r: 30, h: 0.5, tipo: 'gruta', tema: 'bigornas', etapa: 3 },                 // 4 Salão das Bigornas
  { x: 8, z: -450, rx: 26, rz: 30, h: subida, tipo: 'gruta', tema: 'fundicao', etapa: 4 },      // 5 Fundição
  { x: 2, z: -530, r: 25, h: 8, tipo: 'gruta', tema: 'coracao', fim: true },                    // 6 Coração da Forja
];
// poças de lava no Campo de Cinzas e o rio de lava (com o vão da ponte de pedras em x = 4 a 16)
const LAVAS = [
  [-20, -40, 3.5], [18, -46, 3], [-24, -82, 4], [22, -88, 3.2],
  ...[-28, -21, -14, -7, -0.5].map((x, i) => [x, -141 + (i % 2) * 1.5, 3.6]),
  ...[20.5, 27, 34, 41, 47].map((x, i) => [x, -141 + (i % 2) * 1.5, 3.6]),
].map(([x, z, r]) => ({ x, z, r }));

const CHAO = {
  cinzas: ['#4a3e3a', '#3e3430', '#55494a'], rio: ['#3a2c28', '#433330', '#32261f'],
  portao: ['#4a3a34', '#544038', '#3f322c'], bigornas: ['#3e302a', '#4a3a32', '#362a24'],
  fundicao: ['#3a2a24', '#45322a', '#30231e'], coracao: ['#4a2a1e', '#552f22', '#3f2418'],
};
const BASALTO = ['#2e2220', '#3a2a26', '#4a3530', '#2a1e1c'], OBSIDIANA = ['#1e1618', '#261c1e', '#2c2022'];
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

// Estátua de ferreiro gigante segurando o martelo (olha para "ang")
function ferreiro(ms, M, x, z, ang, e = 1) {
  const sa = Math.sin(ang), ca = Math.cos(ang);
  const pc = (geo, mat, f, s, y, sx, sy, sz, rx = 0, rz = 0) => ms.peca(geo, mat, x + (sa * f + ca * s) * e, y * e, z + (ca * f - sa * s) * e, sx * e, sy * e, sz * e, rx, ang, rz);
  pc(GEO.caixa, M.basalto, 0, 0, 0.6, 4, 1.2, 4);
  for (const l of [-0.7, 0.7]) pc(GEO.caixa, M.estatua, 0, l, 2.4, 1, 2.4, 1.1);
  pc(GEO.caixa, M.estatua, 0, 0, 5, 3, 2.8, 1.9);
  pc(GEO.caixa, M.cobre, 0, 0, 3.75, 3.1, 0.4, 2);
  pc(GEO.caixa, M.estatua, 0.1, 0, 7.2, 1.5, 1.5, 1.5);
  pc(GEO.cone4, M.cobre, 0.85, 0, 6.2, 1.3, 1.8, 0.5, Math.PI, 0);            // a barba
  pc(GEO.cone4, M.basalto, 0, 0, 8.3, 1.9, 1, 1.9);                          // o capacete
  for (const l of [-1, 1]) pc(GEO.cone, M.cobre, 0, l * 1.1, 8.5, 0.35, 1.3, 0.35, 0, -l * 0.9);
  pc(GEO.caixa, M.estatua, 0.4, -1.9, 5.4, 0.8, 2.6, 0.8, -0.5, 0);
  pc(GEO.caixa, M.estatua, 0.4, 1.9, 5, 0.8, 2.6, 0.8, -0.2, 0);
  pc(GEO.cil, M.madeira, 1.3, -1.9, 7.2, 0.25, 4, 0.25, -0.3, 0);             // o cabo do martelo
  pc(GEO.caixa, M.metal, 1.9, -1.9, 9, 1.8, 1.1, 1.1);                        // a cabeça do martelo
  ms.obst(x, z, 2.4 * e);
}
function bigorna(ms, M, x, z, ang, e = 1) {
  ms.peca(GEO.caixa, M.basalto, x, 0.5 * e, z, 1.3 * e, 1 * e, 1.3 * e, 0, ang, 0);
  ms.peca(GEO.caixa, M.metal, x, 1.2 * e, z, 0.7 * e, 0.5 * e, 0.7 * e, 0, ang, 0);
  ms.peca(GEO.caixa, M.metal, x, 1.7 * e, z, 2.2 * e, 0.6 * e, 1 * e, 0, ang, 0);
  ms.peca(GEO.cone, M.metal, x + Math.cos(ang) * 1.5 * e, 1.7 * e, z - Math.sin(ang) * 1.5 * e, 0.5 * e, 1.2 * e, 0.5 * e, 0, ang, -Math.PI / 2);
  ms.obst(x, z, 1.1 * e);
}

export const FORJA_ANTIGA = {
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 6, tipo: 'canion' },
      { a: 1, b: 2, larg: 7, tipo: 'canion' },
      { a: 2, b: 3, larg: 6 },               // a descida para dentro do vulcão
      { a: 3, b: 4, larg: 5 },               // o portão de runas
      { a: 4, b: 5, larg: 2.6 },             // a Ponte de Obsidiana
      { a: 5, b: 6, larg: 6 },
    ],
    abismos: [{ corredor: 4, r: 15, fundo: 12 }],   // o mar de lava embaixo da ponte
    buracos: LAVAS,
  },
  corSelo: '#ff8a3a',
  portoes: [{ corredor: 1 }, { corredor: 2 }, { corredor: 3 }, { corredor: 4, depois: 2 }, { corredor: 5 }],
  acampamentos: [
    { x: 0, z: -62, etapa: 0 }, { x: 10, z: -166, etapa: 1 }, { x: 0, z: -260, etapa: 2 },
    { x: -8, z: -352, etapa: 3 }, { x: 8, z: -450, etapa: 4 },
  ],
  inicio: { x: 0, z: -8, ang: Math.PI },   // (um pouco para dentro: a viga da porta de luz fica atrás da câmera)
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 2, z: -535, ang: 0 },
  portal: { x: -12, z: -537, ang: 0.3 },

  temas: {
    cinzas: { ceu: '#5a3a30', hemi: '#ffc2a0', luz: 1.5, sol: 1, nevoa: [26, 95], part: 'neve', corPart: '#a89c98' },
    rio: { ceu: '#6a3020', hemi: '#ffb08a', luz: 1.5, sol: 1, nevoa: [24, 90], part: 'faisca', corPart: '#ff8a3a' },
    portao: { ceu: '#3a1e18', hemi: '#ffb894', luz: 1.45, sol: 0.7, nevoa: [22, 88], part: 'neve', corPart: '#a89c98' },
    bigornas: { ceu: '#1a0c08', hemi: '#ffb070', luz: 1.4, sol: 0.35, nevoa: [18, 78], part: 'faisca', corPart: '#ffb347' },
    fundicao: { ceu: '#1c0a06', hemi: '#ffa060', luz: 1.4, sol: 0.35, nevoa: [18, 80], part: 'faisca', corPart: '#ff9a3a' },
    coracao: { ceu: '#240c06', hemi: '#ff9a60', luz: 1.5, sol: 0.4, nevoa: [20, 86], part: 'faisca', corPart: '#ffb347' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (h < hChao - 0.6) return c.set('#5a1a08');                        // o fundo das poças de lava
      if (s.tema === 'fundicao') { const n = Math.floor((h - 0.5) / 1.5 + 0.2); return c.set(n % 2 ? '#4a3a32' : '#3a2c26'); }
      return c.set(sorteia(rng, CHAO[s.tema]));
    }
    if (h < hChao - 2.5) return c.set('#3a1206');                         // o fundo do mar de lava
    if (tipo === 'canion') { const f = Math.floor((h - hChao) / 2.4); return c.set(f === 1 && rng() < 0.3 ? '#7a3a20' : BASALTO[((f % 4) + 4) % 4]); }
    return c.set(sorteia(rng, OBSIDIANA));
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#2e2220'), ms.brilho('#ff8a3a', 0.8), ms.mat('#3a2a26')); },

  decorar(ms) {
    const rng = ms.rng, F = ms.forma;
    const M = {
      queimada: ms.mat('#1e1816'), basalto: ms.mat('#2e2220'), pedraLava: ms.mat('#3a2a26'), rachadura: ms.brilho('#ff6a1f', 0.85),
      lava: ms.brilho('#ff7a2a', 0.9), estatua: ms.mat('#4a3e3a'), cobre: ms.mat('#c9762a', { emissive: '#7a3a10', emissiveIntensity: 0.25 }),
      madeira: ms.mat('#5a3a28'), metal: ms.mat('#4a4a52'), metalEsc: ms.mat('#2e2e34'), tijolo: ms.mat('#5a2e22'), fogo: ms.brilho('#ffb347', 1),
      chama: ms.brilho('#ff9a3a', 1), runa: ms.brilho('#ff8a3a', 0.9), corrente: ms.mat('#3a3a40'), pedraClara: ms.mat('#6a5a54'),
    };
    portaDeLuz(ms, '#4a3e3a', '#ff9a3a', '#ffe0c0');
    ms.animar((dt, t) => { M.lava.emissiveIntensity = 0.8 + Math.sin(t * 1.6) * 0.15; }); // a lava pulsa (1 material só)

    // ---- Campo de Cinzas e os paredões: árvores queimadas, pedras de lava e as poças ----
    nosMorros(ms, [0, 1, 2], 60, 2, 16, (x, z) => { if (rng() < 0.55) arvoreMorta(ms, M.queimada, x, z, 1 + rng() * 0.6); else ms.peca(GEO.dode, M.pedraLava, x, 1.5, z, 2 + rng() * 2.5, 2 + rng() * 3, 2 + rng() * 2.5, rng(), rng() * 3, 0); });
    for (const p of LAVAS) {
      const s = SALAS[F.salaPerto(ms.o.x + p.x, ms.o.z + p.z)];
      ms.peca(GEO.disco, M.lava, p.x, s.h - 0.5, p.z, p.r + 0.35, 1, p.r + 0.35, 0, 0, 0, false);
      for (let i = 0; i < 3; i++) { const a = rng() * Math.PI * 2; ms.peca(GEO.dode, M.pedraLava, p.x + Math.cos(a) * (p.r + 0.8), 0.2, p.z + Math.sin(a) * (p.r + 0.8), 0.8, 0.5, 0.7, rng(), rng(), 0); }
    }
    {
      const centro = { x: 0, z: -62 };
      for (const p of pontosNaSala(ms, 1, 10, 3, [centro, ...LAVAS], 9)) { arvoreMorta(ms, M.queimada, p.x, p.z, 1 + rng() * 0.6); ms.obst(p.x, p.z, 0.6); }
      for (const p of pontosNaSala(ms, 1, 8, 3, [centro, ...LAVAS], 9)) {
        const e = 0.9 + rng() * 1.2;
        ms.peca(GEO.dode, M.pedraLava, p.x, 0.5 * e, p.z, 1.6 * e, 1.3 * e, 1.5 * e, rng(), rng() * 3, 0);
        ms.peca(GEO.caixa, M.rachadura, p.x, 0.9 * e, p.z, 0.12, 0.1, 1.6 * e, 0, rng() * 3, 0);
        ms.obst(p.x, p.z, 0.9 * e);
      }
      for (let n = 0; n < 30; n++) { const p = ms.pontoNaSala(1, 1); ms.peca(GEO.caixa, M.rachadura, p.x, 0.02, p.z, 0.15, 0.04, 2 + rng() * 4, 0, rng() * Math.PI, 0); }
    }

    // ---- Rio de Lava: a ponte de pedras no vão do rio ----
    for (let i = 0; i < 4; i++) ms.peca(GEO.cil, M.pedraClara, 10 + (i % 2 ? 1.2 : -1.2), 0.1, -136.5 - i * 3, 2.2, 0.3, 2.2);
    for (const l of [-1, 1]) braseiro(ms, M.metalEsc, M.chama, 10 + l * 7.5, -133, 1);
    for (const p of pontosNaSala(ms, 2, 7, 3, [{ x: 10, z: -166 }, ...LAVAS], 9)) { arvoreMorta(ms, M.queimada, p.x, p.z, 1.1); ms.obst(p.x, p.z, 0.6); }

    // ---- Portão da Forja: as estátuas dos ferreiros e o portão de runas ----
    {
      const s = SALAS[3], c = F.corredores[3], ang = Math.atan2(-c.ux, -c.uz);
      for (const l of [-1, 1]) ferreiro(ms, M, c.ax - c.ux * 5 - c.uz * 10 * l, c.az - c.uz * 5 + c.ux * 10 * l, ang, 1.1);
      for (const l of [-1, 1]) ferreiro(ms, M, s.x - 20 * l, s.z + 6, l < 0 ? Math.PI / 2 : -Math.PI / 2, 0.8);
      for (const p of pontosNaSala(ms, 3, 6, 3, [{ x: 0, z: -260 }], 12)) braseiro(ms, M.metalEsc, M.chama, p.x, p.z, 1);
      // as runas acesas nas paredes
      nosMorros(ms, [3], 14, 0.5, 2, (x, z) => ms.peca(GEO.caixa, M.runa, x, 2.5 + rng() * 2, z, 0.8, 1.2, 0.8, 0, rng() * 3, 0));
    }

    // ---- Salão das Bigornas ----
    {
      const s = SALAS[4], centro = { x: -8, z: -352 };
      for (const p of pontosNaSala(ms, 4, 7, 4, [centro], 12)) bigorna(ms, M, p.x, p.z, rng() * 3, 1 + rng() * 0.3);
      for (let i = 0; i < 5; i++) { // os fornos acesos na beira
        const a = (i / 5) * Math.PI * 2 + 0.3, x = s.x + Math.sin(a) * 25, z = s.z + Math.cos(a) * 25, olha = a + Math.PI;
        ms.peca(GEO.caixa, M.tijolo, x, 1.6, z, 3.2, 3.2, 2.6, 0, olha, 0);
        ms.peca(GEO.caixa, M.fogo, x + Math.sin(olha) * 1.32, 1.3, z + Math.cos(olha) * 1.32, 1.6, 1.2, 0.1, 0, olha, 0);
        ms.peca(GEO.cil, M.tijolo, x, 5, z, 1, 4, 1);
        ms.obst(x, z, 1.9);
      }
      for (const l of [-1, 1]) ms.peca(GEO.caixa, M.lava, s.x + l * 9, 0.03, s.z, 0.7, 0.06, s.r * 1.7); // os canais de lava no chão
      ms.peca(GEO.caixa, M.lava, s.x, 0.03, s.z - 10, s.r * 1.5, 0.06, 0.7);
      for (let n = 0; n < 10; n++) { const p = ms.pontoNaSala(4, 2); const h = 6 + rng() * 5; ms.peca(GEO.caixa, M.corrente, p.x, h + (16 - h) / 2, p.z, 0.15, 16 - h, 0.15, 0, 0, 0); ms.peca(GEO.cone, M.metal, p.x, h - 0.3, p.z, 0.4, 0.7, 0.4, Math.PI, 0, 0); }
      for (const p of pontosNaSala(ms, 4, 6, 2, [centro], 9)) ms.peca(GEO.caixa, M.metal, p.x, 0.15, p.z, 0.9, 0.3, 0.5, 0, rng() * 3, 0); // martelos pelo chão
    }

    // ---- Ponte de Obsidiana sobre o mar de lava ----
    {
      const c = F.corredores[4], L = Math.hypot(c.bx - c.ax, c.bz - c.az), ang = Math.atan2(c.ux, c.uz), ab = F.abismos[0], px = -c.uz, pz = c.ux;
      const mx = (ab.a.x + ab.b.x) / 2, mz = (ab.a.z + ab.b.z) / 2, comp = Math.hypot(ab.b.x - ab.a.x, ab.b.z - ab.a.z);
      liquido(ms, M.lava, mx, ms.y(c.ax, c.az) - 7, mz, ab.r * 2 + 6, comp + ab.r * 2, ang);
      for (let s = 0; s <= L; s += 1.4) {
        const x = c.ax + c.ux * s, z = c.az + c.uz * s;
        if (F.salaEm(ms.o.x + x, ms.o.z + z) >= 0) continue;
        ms.peca(GEO.caixa, M.queimada, x, -0.3, z, c.larg * 2 + 0.8, 0.6, 1.35, 0, ang, 0);
        if (Math.round(s / 1.4) % 4 === 0) for (const l of [-1, 1]) ms.peca(GEO.caixa, M.runa, x + px * (c.larg + 0.35) * l, 0.05, z + pz * (c.larg + 0.35) * l, 0.2, 0.15, 1, 0, ang, 0);
      }
      for (let n = 0; n < 14; n++) {
        const k = rng(), l = rng() < 0.5 ? -1 : 1, x = ab.a.x + (ab.b.x - ab.a.x) * k + px * (5 + rng() * 9) * l, z = ab.a.z + (ab.b.z - ab.a.z) * k + pz * (5 + rng() * 9) * l;
        if (ms.d(x, z) < 3) continue;
        ms.peca(GEO.dode, M.basalto, x, ms.y(c.ax, c.az) - 7.5, z, 2 + rng() * 2, 2 + rng() * 2, 2 + rng() * 2, rng(), rng(), 0, false);
      }
    }

    // ---- Fundição: os caldeirões despejando lava e as engrenagens gigantes ----
    {
      const s = SALAS[5];
      for (const [x, z, l] of [[s.x - 16, -440, 1], [s.x + 16, -446, -1], [s.x - 14, -466, 1]]) {
        ms.peca(GEO.caixa, M.metalEsc, x, 1.5, z, 2, 3, 2);
        ms.peca(GEO.cil, M.metal, x, 4, z, 3, 2.6, 3, 0, 0, l * 0.6);
        ms.peca(GEO.caixa, M.lava, x + l * 2.2, 2.4, z, 0.6, 4.8, 0.6);
        ms.peca(GEO.disco, M.lava, x + l * 2.2, 0.06, z, 1.6, 1, 1.6);
        ms.obst(x, z, 1.8); ms.obst(x + l * 2.2, z, 1.2);
      }
      // engrenagens nas paredes (giram devagar: cada uma é um grupo)
      for (const [x, z, r0, vel] of [[s.x + 27, -452, 5, 0.3], [s.x - 27, -458, 4, -0.4]]) {
        const g = new THREE.Group(), roda = new THREE.Mesh(GEO.cil, M.metal);
        roda.scale.set(r0 * 2, 0.8, r0 * 2); roda.rotation.x = Math.PI / 2; g.add(roda);
        for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, d = new THREE.Mesh(GEO.caixa, M.metal); d.scale.set(1.2, 1.4, 0.8); d.position.set(Math.cos(a) * (r0 + 0.5), Math.sin(a) * (r0 + 0.5), 0); d.rotation.z = a; g.add(d); }
        const miolo = new THREE.Mesh(GEO.cil, M.cobre); miolo.scale.set(1.6, 1, 1.6); miolo.rotation.x = Math.PI / 2; g.add(miolo);
        g.position.set(ms.o.x + x, ms.y(x, z) + r0 + 2, ms.o.z + z);
        g.rotation.y = Math.PI / 2;
        ms.grupo.add(g);
        ms.animar((dt) => { g.rotation.x += dt * vel; });
      }
      // a beirada de cada degrau (grade de metal)
      for (let n = 1; n <= 4; n++) {
        const z = -424 - 48 * (n - 1 + 0.87) / 5, k = Math.sqrt(Math.max(0, 1 - ((z - s.z) / s.rz) ** 2)), meia = s.rx * k - 1;
        for (let x = s.x - meia; x <= s.x + meia; x += 3.2) ms.peca(GEO.caixa, M.metalEsc, x, -0.4, z - 0.6, 3, 0.8, 1.2);
      }
      // canos ao longo das paredes
      for (const l of [-1, 1]) ms.peca(GEO.cil, M.cobre, s.x + l * (s.rx - 1), 5, s.z, 0.7, s.rz * 1.6, 0.7, Math.PI / 2, 0, 0);
    }

    // ---- Coração da Forja: a grande fornalha, a bigorna-altar e as cascatas de lava ----
    {
      const s = SALAS[6], fx = s.x, fz = -551;
      ms.peca(GEO.caixa, M.tijolo, fx, 5, fz, 15, 10, 6);
      ms.peca(GEO.caixa, M.metalEsc, fx, 10.4, fz, 16, 1, 6.6);
      ms.peca(GEO.caixa, M.fogo, fx, 3, fz + 3.05, 7, 4.5, 0.1);
      for (const l of [-1, 1]) ms.peca(GEO.cil, M.tijolo, fx + l * 5, 15, fz - 1, 2, 10, 2);
      const chamas = new THREE.InstancedMesh(GEO.cone, M.chama, 5), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), y0 = ms.y(fx, fz);
      chamas.frustumCulled = false; ms.grupo.add(chamas);
      ms.animar((dt, t) => { for (let i = 0; i < 5; i++) { const h = 2.4 + Math.sin(t * 6 + i * 1.7) * 0.6; chamas.setMatrixAt(i, m4.compose(v.set(ms.o.x + fx - 2.8 + i * 1.4, y0 + 1 + h / 2, ms.o.z + fz + 3.4), q, sc.set(1.1, h, 1.1))); } chamas.instanceMatrix.needsUpdate = true; });
      ms.obst(fx, fz, 6.5); ms.obst(fx - 5, fz, 3); ms.obst(fx + 5, fz, 3);
      bigorna(ms, M, s.x, -543, 0, 2.2);
      for (const l of [-1, 1]) ferreiro(ms, M, s.x + l * 13, -546, 0, 1);
      for (let i = 0; i < 6; i++) { // cascatas de lava nas paredes
        const a = (i / 6) * Math.PI * 2 + 0.5, x = s.x + Math.sin(a) * 27, z = s.z + Math.cos(a) * 27;
        if (z > s.z + 18) continue;
        ms.peca(GEO.caixa, M.lava, x, 6, z, 1.6, 12, 1.6, 0, a, 0);
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8, x = s.x + Math.sin(a) * 19, z = s.z + Math.cos(a) * 19;
        if (z > s.z + 14 && Math.abs(x - s.x) < 9) continue;
        if (z < s.z - 12 && Math.abs(x - s.x) < 16) continue;
        braseiro(ms, M.metalEsc, M.chama, x, z, 1.1);
      }
      const anel = ms.geo(new THREE.TorusGeometry(7, 0.3, 3, 40).rotateX(Math.PI / 2));
      ms.peca(anel, M.runa, s.x, 0.12, -535, 1, 1, 1);
    }
  },

  // A entrada no mapa: uma porta de obsidiana com runas acesas num paredão de pedra vulcânica (sem ícone)
  entrada(b, { x, z, ang, y, obst }) {
    const fx = Math.sin(ang), fz = Math.cos(ang), sx = Math.cos(ang), sz = -Math.sin(ang);
    const P = (f, s) => ({ x: x + fx * f + sx * s, z: z + fz * f + sz * s });
    const rocha = lambert('#2e2220'), rocha2 = lambert('#3a2a26'), obs = lambert('#1e1618'), escuro = lambert('#0a0605'), runa = lambert('#ff8a3a', { emissive: '#ff6a1f', emissiveIntensity: 0.9 });
    const base = y(x, z);
    for (const [f, s, e, h, m] of [[-3, 0, 6.5, 6.5, rocha], [-1.5, -4.2, 4.2, 4.6, rocha2], [-1.5, 4.2, 4.2, 4.4, rocha], [-5, -2.5, 4.5, 4, rocha2], [-5, 2.5, 4.5, 4.2, rocha]]) { const p = P(f, s); b.add(GEO.dode, m, p.x, base + h * 0.4, p.z, e, h, e * 0.95, 0.15, f * s, 0); }
    for (const s of [-1.8, 1.8]) { const p = P(0.6, s); b.add(GEO.caixa, obs, p.x, base + 2.4, p.z, 1.1, 4.8, 1.1, 0, ang, 0); b.add(GEO.caixa, runa, p.x + fx * 0.56, base + 2.4, p.z + fz * 0.56, 0.3, 2.6, 0.06, 0, ang, 0); }
    const v = P(0.6, 0); b.add(GEO.caixa, obs, v.x, base + 5, v.z, 5, 0.9, 1.3, 0, ang, 0); b.add(GEO.caixa, runa, v.x + fx * 0.66, base + 5, v.z + fz * 0.66, 2.4, 0.25, 0.06, 0, ang, 0);
    const d = P(0.2, 0); b.add(GEO.caixa, escuro, d.x, base + 2.1, d.z, 2.5, 4.2, 0.4, 0, ang, 0);
    for (let i = 0; i < 4; i++) { const p = P(1.8 + i * 1.3, (i % 2 ? 0.6 : -0.6)); b.add(GEO.caixa, runa, p.x, base + 0.03, p.z, 0.15, 0.05, 1.6, 0, ang + (i % 2 ? 0.4 : -0.4), 0); }
    const c = P(-3, 0);
    obst(c.x, c.z, 4.5);
  },
};
