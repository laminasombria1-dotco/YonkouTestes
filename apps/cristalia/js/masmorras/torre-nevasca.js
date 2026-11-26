// =============================================================
// TORRE DA NEVASCA (Gelo, a 2ª masmorra do bioma: mais difícil)
// Uma subida no meio da nevasca até o sino no alto da montanha:
//  entrada  → a porta de luz, no pé da montanha
//  etapa 1  → Trilha do Penhasco: a rampa que sobe, com cerca de madeira e bandeirinhas
//  etapa 2  → Acampamento Abandonado: barracas cobertas de neve, fogueira apagada, caixas e um trenó
//  etapa 3  → Pátio da Torre: muralha, cavaleiros de gelo e a fonte congelada. A torre aparece no fundo
//  etapa 4  → Salão do Gelo Eterno: dentro da torre, pilares de gelo, o tapete e o lustre de cristal
//  (Ponte das Correntes: ponte de pedra sobre o abismo, presa por correntes)
//  etapa 5  → Cume Gelado: espinhos de gelo gigantes, árvores mortas e montes de neve
//  fim      → Sino da Nevasca: o sino gigante que balança no vento e o chefe
// Só desenho: as regras ficam em masmorra.js e os números em MASMORRAS_NOVAS (dados.js).
// =============================================================
import * as THREE from 'three';
import { GEO, lambert } from '../dungeon.js';
import { pinheiro, cristais, nosMorros, pontosNaSala, portaDeLuz, braseiro, portaoSimples } from './pecas.js';

const rampa = (x, z) => 8 * Math.max(0, Math.min(1, (-20 - z) / 80)); // a trilha sobe 8 m

const SALAS = [
  { x: 0, z: 0, r: 9, h: 0, tipo: 'aberta', tema: 'base' },                                     // 0 entrada
  { x: 8, z: -60, rx: 16, rz: 46, h: rampa, tipo: 'aberta', tema: 'trilha', etapa: 0 },          // 1 Trilha do Penhasco
  { x: 0, z: -150, rx: 36, rz: 30, h: 8, tipo: 'aberta', tema: 'acampamento', etapa: 1 },        // 2 Acampamento Abandonado
  { x: -10, z: -236, r: 30, h: 10, tipo: 'aberta', tema: 'patio', etapa: 2 },                    // 3 Pátio da Torre
  { x: -4, z: -322, r: 28, h: 10.5, tipo: 'gruta', tema: 'salao', etapa: 3 },                     // 4 Salão do Gelo Eterno
  { x: 18, z: -432, rx: 30, rz: 26, h: 13, tipo: 'aberta', tema: 'cume', etapa: 4 },             // 5 Cume Gelado
  { x: 8, z: -512, r: 24, h: 16, tipo: 'aberta', tema: 'topo', fim: true },                      // 6 Sino da Nevasca
];

const CHAO = {
  base: ['#eef4fa', '#e3ecf5', '#f6f9fd'], trilha: ['#e6edf4', '#dbe4ee', '#eef3f8'],
  acampamento: ['#e2e8ef', '#d6dee8', '#ecf1f6'], patio: ['#9aa4b4', '#a7b0bf', '#8e98a9'],
  salao: ['#a9d4ea', '#b8dcef', '#9ccbe3'], cume: ['#eaf2f8', '#dfe9f2', '#f3f8fb'], topo: ['#cfe8f5', '#c2e0f0', '#d9eef8'],
};
const ROCHA = ['#8193ad', '#73859f', '#8a9bb3'], NEVE = ['#e9f0f7', '#dfe8f2', '#f3f7fb'], PEDRA_TORRE = ['#5a6478', '#4e586c', '#646e82'];
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];
const c3n = new THREE.Color();

export const TORRE_NEVASCA = {
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 6, tipo: 'aberta' },
      { a: 1, b: 2, larg: 6, tipo: 'aberta' },
      { a: 2, b: 3, larg: 7, tipo: 'aberta' },
      { a: 3, b: 4, larg: 5 },                 // a porta da torre
      { a: 4, b: 5, larg: 2.6 },               // a Ponte das Correntes
      { a: 5, b: 6, larg: 6, tipo: 'aberta' },
    ],
    abismos: [{ corredor: 4, r: 18, fundo: 26 }],
  },
  corSelo: '#9fe8ff',
  portoes: [{ corredor: 1 }, { corredor: 2 }, { corredor: 3 }, { corredor: 4, depois: 2 }, { corredor: 5 }],
  acampamentos: [
    { x: 8, z: -62, etapa: 0 }, { x: 0, z: -150, etapa: 1 }, { x: -10, z: -238, etapa: 2 },
    { x: -4, z: -324, etapa: 3 }, { x: 18, z: -432, etapa: 4 },
  ],
  inicio: { x: 0, z: -8, ang: Math.PI },   // (um pouco para dentro: a viga da porta de luz fica atrás da câmera)
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 8, z: -517, ang: 0 },
  portal: { x: -7, z: -520, ang: 0.3 },

  temas: {
    base: { ceu: '#a7b4c6', hemi: '#eef6ff', luz: 1.6, sol: 1.1, nevoa: [28, 100], part: 'neve' },
    trilha: { ceu: '#a2afc2', hemi: '#eaf3ff', luz: 1.6, sol: 1.05, nevoa: [22, 88], part: 'nevasca' },
    acampamento: { ceu: '#9aa8bd', hemi: '#e6f0ff', luz: 1.55, sol: 1, nevoa: [22, 88], part: 'nevasca' },
    patio: { ceu: '#8f9db3', hemi: '#e0ebff', luz: 1.55, sol: 1, nevoa: [26, 96], part: 'neve' },
    salao: { ceu: '#101a2e', hemi: '#9fd8ff', luz: 1.4, sol: 0.35, nevoa: [18, 80], part: 'brilho', corPart: '#cfefff' },
    cume: { ceu: '#7f8ea8', hemi: '#dde8ff', luz: 1.5, sol: 0.95, nevoa: [20, 82], part: 'nevasca' },
    topo: { ceu: '#5d6a88', hemi: '#d2dcff', luz: 1.45, sol: 0.8, nevoa: [24, 90], part: 'nevasca' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng }) {
    const s = SALAS[sala];
    if (d <= 0.6) return c.set(sorteia(rng, CHAO[s.tema]));
    if (h < hChao - 2.5) return c.set('#c9d6e4').lerp(c3n.set('#3a4a64'), Math.min(1, (hChao - h) / 22)); // o abismo (neblina lá embaixo)
    if (tipo === 'gruta') return c.set(sorteia(rng, PEDRA_TORRE));
    return c.set(h - hChao > 3.5 || rng() < 0.35 ? sorteia(rng, NEVE) : sorteia(rng, ROCHA));
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#7d889c'), ms.brilho('#9fe8ff', 0.6)); },

  decorar(ms) {
    const rng = ms.rng, F = ms.forma;
    const M = {
      tronco: ms.mat('#5a4636'), pinho: ms.mat('#3f6e66'), pinho2: ms.mat('#4c7d72'), neve: ms.mat('#f2f7fb'),
      pedra: ms.mat('#7d889c'), pedraClara: ms.mat('#a3adbd'), madeira: ms.mat('#6b4a32'), madeiraVelha: ms.mat('#7d6a58'),
      cristal: ms.brilho('#9fe8ff', 0.7), cristal2: ms.brilho('#c9f2ff', 0.5), gelo: ms.mat('#cfe9f7'), geloEsc: ms.mat('#8fb6cf'),
      barraca1: ms.mat('#8a4a44'), barraca2: ms.mat('#4a5a7a'), barraca3: ms.mat('#6a7a4a'), carvao: ms.mat('#2a2622'),
      brasa: ms.brilho('#ff8a3a', 0.6), metal: ms.mat('#3a3f5c'), corrente: ms.mat('#555c6a'), tapete: ms.mat('#6a2c3a'),
      dourado: ms.brilho('#ffd23f', 0.35), chama: ms.brilho('#7fd8ff', 1), arvore: ms.mat('#4a4038'),
      flag: [ms.mat('#d9544d'), ms.mat('#3a7bd5'), ms.mat('#f2c94c'), ms.mat('#4caf50'), ms.mat('#f4f4f4')],
    };
    const octa = ms.geo(new THREE.OctahedronGeometry(1, 0));
    portaDeLuz(ms, '#a3adbd', '#7fd8ff');

    // ---- pinheiros nos morros de baixo (mais alto, só neve e pedra) ----
    nosMorros(ms, [0, 1, 2], 150, 2, 22, (x, z) => pinheiro(ms, M, x, z, 0.7 + rng() * 0.8));
    nosMorros(ms, [3, 5, 6], 40, 3, 20, (x, z) => ms.peca(GEO.dode, rng() < 0.5 ? M.neve : M.pedraClara, x, 0.5, z, 2 + rng() * 3, 1.2 + rng() * 2, 2 + rng() * 3, rng(), rng() * 3, 0));

    // ---- Trilha do Penhasco: cerca de madeira dos dois lados e bandeirinhas ----
    {
      const s = SALAS[1];
      for (let z = s.z + s.rz - 6; z > s.z - s.rz + 6; z -= 7) {
        const meia = s.rx * Math.sqrt(Math.max(0, 1 - ((z - s.z) / s.rz) ** 2)) - 1.5;
        for (const lado of [-1, 1]) {
          const x = s.x + lado * meia;
          ms.peca(GEO.cil, M.madeira, x, 0.7, z, 0.3, 1.4, 0.3);
          ms.peca(GEO.caixa, M.madeiraVelha, x, 1.1, z - 3.5, 0.12, 0.12, 7, 0, 0, 0);
        }
      }
      for (const z of [-34, -64, -94]) {
        const meia = s.rx * Math.sqrt(Math.max(0, 1 - ((z - s.z) / s.rz) ** 2)) - 2;
        for (const lado of [-1, 1]) { ms.peca(GEO.cil, M.madeira, s.x + lado * meia, 2.8, z, 0.3, 5.6, 0.3); ms.obst(s.x + lado * meia, z, 0.4); }
        for (let i = 0; i < 10; i++) {
          const x = s.x - meia + (i + 0.5) * (meia * 2 / 10);
          ms.peca(GEO.caixa, M.flag[i % 5], x, 4.9 - Math.sin((i + 0.5) / 10 * Math.PI) * 0.8, z, 0.9, 0.9, 0.05, 0, 0, 0.2);
        }
      }
    }

    // ---- Acampamento Abandonado ----
    {
      const centro = { x: 0, z: -150 };
      const tendas = pontosNaSala(ms, 2, 6, 5, [centro], 13);
      tendas.forEach((p, i) => {
        const e = 0.9 + rng() * 0.4;
        ms.peca(GEO.cone4, [M.barraca1, M.barraca2, M.barraca3][i % 3], p.x, 1.6 * e, p.z, 4 * e, 3.2 * e, 4 * e, 0, Math.PI / 4 + rng(), 0);
        ms.peca(GEO.cone4, M.neve, p.x, 2.7 * e, p.z, 1.9 * e, 1.1 * e, 1.9 * e, 0, Math.PI / 4, 0);
        ms.obst(p.x, p.z, 2.4 * e);
      });
      // a fogueira apagada (ainda tem umas brasas)
      const fx = centro.x + 13, fz = centro.z + 7;
      for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; ms.peca(GEO.dode, M.pedraClara, fx + Math.cos(a) * 1.3, 0.2, fz + Math.sin(a) * 1.3, 0.5, 0.4, 0.5, rng(), rng(), 0); }
      for (let i = 0; i < 3; i++) ms.peca(GEO.caixa, M.carvao, fx, 0.25, fz, 0.3, 0.3, 2, 0, i * 1.05, 0);
      ms.peca(GEO.ico, M.brasa, fx, 0.2, fz, 0.6, 0.25, 0.6);
      ms.obst(fx, fz, 1.6);
      // caixas, o trenó e o mastro com a bandeira rasgada
      for (const p of pontosNaSala(ms, 2, 7, 3, [centro, ...tendas], 6)) { const e = 0.8 + rng() * 0.5; ms.peca(GEO.caixa, M.madeira, p.x, 0.5 * e, p.z, e, e, e, 0, rng() * 3, 0); ms.peca(GEO.caixa, M.neve, p.x, e + 0.05, p.z, e * 0.9, 0.12, e * 0.9, 0, rng(), 0); ms.obst(p.x, p.z, 0.8 * e); }
      const tx = centro.x - 16, tz = centro.z - 6;
      ms.peca(GEO.caixa, M.madeira, tx, 0.6, tz, 1.6, 0.3, 3.6, 0, 0.4, 0);
      for (const l of [-0.7, 0.7]) ms.peca(GEO.caixa, M.metal, tx + Math.cos(0.4) * l, 0.25, tz - Math.sin(0.4) * l, 0.12, 0.2, 3.9, 0, 0.4, 0);
      ms.peca(GEO.caixa, M.barraca2, tx, 1.05, tz, 1.3, 0.6, 2, 0, 0.4, 0);
      ms.obst(tx, tz, 1.8);
      ms.peca(GEO.cil, M.madeira, centro.x - 6, 3.5, centro.z + 16, 0.3, 7, 0.3); ms.obst(centro.x - 6, centro.z + 16, 0.4);
      ms.peca(GEO.caixa, M.barraca1, centro.x - 4.8, 6, centro.z + 16, 2.2, 1.4, 0.06, 0, 0, 0.12);
    }

    // ---- Pátio da Torre: muralha, cavaleiros de gelo e a fonte congelada ----
    {
      const s = SALAS[3], R = s.r + 1.6, portas = [F.corredores[2], F.corredores[3]].map((c) => Math.atan2(c === F.corredores[2] ? -c.ux : c.ux, c === F.corredores[2] ? -c.uz : c.uz));
      const N = 18;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2; // ângulo no sentido do seno/cosseno (x = sin, z = cos)
        if (portas.some((p) => Math.abs(Math.atan2(Math.sin(a - p), Math.cos(a - p))) < 0.3)) continue;
        const x = s.x + Math.sin(a) * R, z = s.z + Math.cos(a) * R;
        ms.peca(GEO.caixa, M.pedra, x, 2.2, z, 10.6, 5, 1.6, 0, a + Math.PI / 2, 0);
        for (const k of [-3.6, 0, 3.6]) ms.peca(GEO.caixa, M.pedra, x + Math.cos(a) * k, 5.1, z - Math.sin(a) * k, 1.4, 1, 1.6, 0, a + Math.PI / 2, 0);
        if (i % 3 === 0) { ms.peca(GEO.cil, M.pedraClara, x, 3.5, z, 3.2, 7, 3.2); ms.peca(GEO.cone, M.neve, x, 7.8, z, 3.4, 1.8, 3.4); }
      }
      // cavaleiros de gelo (estátuas)
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.6, x = s.x + Math.sin(a) * 20, z = s.z + Math.cos(a) * 20, olha = a + Math.PI;
        ms.peca(GEO.caixa, M.pedra, x, 0.5, z, 2.2, 1, 2.2, 0, olha, 0);
        ms.peca(GEO.caixa, M.gelo, x, 2.3, z, 1.3, 2.4, 0.9, 0, olha, 0);
        ms.peca(GEO.ico, M.gelo, x, 4, z, 0.6, 0.7, 0.6);
        ms.peca(GEO.cone4, M.geloEsc, x, 4.6, z, 0.55, 0.6, 0.55, 0, Math.PI / 4, 0);
        ms.peca(GEO.caixa, M.geloEsc, x + Math.sin(olha + 1.57) * 0.9, 2.4, z + Math.cos(olha + 1.57) * 0.9, 0.2, 1.6, 1.2, 0, olha, 0);
        ms.peca(GEO.caixa, M.cristal, x - Math.sin(olha + 1.57) * 0.9, 4, z - Math.cos(olha + 1.57) * 0.9, 0.18, 3.4, 0.18, 0, olha, 0.15);
        ms.obst(x, z, 1.4);
      }
      // a fonte congelada
      const fx = s.x + 14, fz = s.z + 7;
      ms.peca(GEO.cil, M.pedraClara, fx, 0.4, fz, 6, 0.8, 6);
      ms.peca(GEO.disco, M.gelo, fx, 0.82, fz, 2.7, 1, 2.7);
      ms.peca(GEO.cil, M.pedraClara, fx, 1.6, fz, 0.8, 2, 0.8);
      ms.peca(GEO.cone4, M.cristal, fx, 3.2, fz, 1.2, 1.8, 1.2, Math.PI, 0, 0);
      ms.obst(fx, fz, 3.1);
    }

    // ---- A torre (vista de fora): um tubo de pedra com 2 aberturas (a porta e a saída para a ponte) ----
    {
      const s = SALAS[4], R = s.r + 3, H = 26, mt = ms.mat('#7d889c', { side: THREE.FrontSide });
      const vaos = [F.corredores[3], F.corredores[4]].map((c, i) => { const ux = i === 0 ? -c.ux : c.ux, uz = i === 0 ? -c.uz : c.uz; return Math.atan2(ux, uz); }).sort((a, b) => a - b);
      const meio = 0.3; // meia abertura (radianos)
      const partes = [[vaos[0] + meio, vaos[1] - vaos[0] - 2 * meio], [vaos[1] + meio, Math.PI * 2 - (vaos[1] - vaos[0]) - 2 * meio]];
      const yBase = s.h - 2;
      for (const [ini, comp] of partes) {
        const g = ms.geo(new THREE.CylinderGeometry(R, R, H, 28, 1, true, ini, comp));
        const t = ms.malha(g, mt, s.x, yBase + H / 2, s.z, false);
        t.position.set(ms.o.x + s.x, yBase + H / 2, ms.o.z + s.z);
      }
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        if (vaos.some((v) => Math.abs(Math.atan2(Math.sin(a - v), Math.cos(a - v))) < meio)) continue;
        ms.peca(GEO.caixa, M.pedra, s.x + Math.sin(a) * R, yBase + H + 0.7, s.z + Math.cos(a) * R, 2.6, 1.4, 1.4, 0, a + Math.PI / 2, 0, false);
      }
      ms.peca(GEO.cone, ms.mat('#4a5a7a'), s.x, yBase + H + 6, s.z, R * 2.2, 12, R * 2.2, 0, 0, 0, false);
    }

    // ---- Salão do Gelo Eterno (dentro da torre) ----
    {
      const s = SALAS[4];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8, x = s.x + Math.sin(a) * 20, z = s.z + Math.cos(a) * 20;
        ms.peca(GEO.cil, M.pedra, x, 0.4, z, 2.6, 0.8, 2.6);
        ms.peca(octa, M.cristal, x, 4, z, 1.1, 4, 1.1, 0, rng(), 0);
        ms.obst(x, z, 1.4);
      }
      ms.peca(GEO.caixa, M.tapete, s.x, 0.04, s.z, 4, 0.06, s.r * 2 - 4);
      for (const lado of [-1, 1]) ms.peca(GEO.caixa, M.dourado, s.x + lado * 2.1, 0.06, s.z, 0.25, 0.06, s.r * 2 - 4);
      for (const lado of [-1, 1]) braseiro(ms, M.metal, M.chama, s.x + lado * 5, s.z + s.r - 6, 1);
      // o lustre de cristal (gira devagar)
      const lustre = new THREE.Group();
      lustre.add(new THREE.Mesh(GEO.ico, M.cristal2));
      lustre.children[0].scale.setScalar(2.2);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, c = new THREE.Mesh(GEO.cone4, M.cristal); c.position.set(Math.cos(a) * 2.6, -1, Math.sin(a) * 2.6); c.scale.set(0.5, 2.4, 0.5); c.rotation.x = Math.PI; lustre.add(c); }
      lustre.position.set(ms.o.x + s.x, s.h + 11, ms.o.z + s.z);
      ms.grupo.add(lustre);
      ms.animar((dt, t) => { lustre.rotation.y += dt * 0.25; lustre.position.y = s.h + 11 + Math.sin(t) * 0.3; });
    }

    // ---- Ponte das Correntes ----
    {
      const c = F.corredores[4], L = Math.hypot(c.bx - c.ax, c.bz - c.az), ang = Math.atan2(c.ux, c.uz), px = -c.uz, pz = c.ux;
      for (let s = 0; s <= L; s += 1.3) {
        const x = c.ax + c.ux * s, z = c.az + c.uz * s;
        if (F.salaEm(ms.o.x + x, ms.o.z + z) >= 0) continue;
        ms.peca(GEO.caixa, M.pedraClara, x, -0.2, z, c.larg * 2 + 0.8, 0.45, 1.2, 0, ang, 0);
      }
      for (let s = 4; s <= L - 4; s += 7) for (const lado of [-1, 1]) {
        const x = c.ax + c.ux * s + px * (c.larg + 0.4) * lado, z = c.az + c.uz * s + pz * (c.larg + 0.4) * lado;
        ms.peca(GEO.caixa, M.pedra, x, 1.6, z, 0.6, 3.2, 0.6, 0, ang, 0);
        ms.peca(GEO.caixa, M.corrente, x + c.ux * 1.75, 2.4, z + c.uz * 1.75, 0.12, 0.12, 3.6, 0.35, ang, 0);
        ms.peca(GEO.caixa, M.corrente, x + c.ux * 5.25, 2.4, z + c.uz * 5.25, 0.12, 0.12, 3.6, -0.35, ang, 0);
      }
      const ab = F.abismos[0];
      for (let n = 0; n < 12; n++) {
        const k = rng(), lado = rng() < 0.5 ? -1 : 1, x = ab.a.x + (ab.b.x - ab.a.x) * k + px * (6 + rng() * 11) * lado, z = ab.a.z + (ab.b.z - ab.a.z) * k + pz * (6 + rng() * 11) * lado;
        if (ms.d(x, z) < 4) continue;
        cristais(ms, octa, M.cristal, M.cristal2, x, z, 1 + rng());
      }
    }

    // ---- Cume Gelado: espinhos de gelo, árvores mortas e montes de neve ----
    {
      const centro = { x: 18, z: -432 };
      for (const p of pontosNaSala(ms, 5, 9, 3, [centro], 12)) {
        const e = 1 + rng() * 1.3;
        for (let i = 0; i < 3; i++) ms.peca(GEO.cone4, M.cristal, p.x + (rng() - 0.5) * 2 * e, 2 * e, p.z + (rng() - 0.5) * 2 * e, 0.9 * e, (3 + rng() * 2) * e, 0.9 * e, (rng() - 0.5) * 0.5, rng() * 3, (rng() - 0.5) * 0.5);
        ms.obst(p.x, p.z, 1.5 * e);
      }
      for (const p of pontosNaSala(ms, 5, 6, 3, [centro], 12)) {
        ms.peca(GEO.cil, M.arvore, p.x, 1.8, p.z, 0.45, 3.6, 0.45, 0.08, 0, 0.05);
        for (let i = 0; i < 3; i++) ms.peca(GEO.caixa, M.arvore, p.x, 2.4 + i * 0.6, p.z, 0.15, 0.15, 2.2 - i * 0.4, 0.7 - i * 0.2, i * 2, 0);
        ms.obst(p.x, p.z, 0.5);
      }
      for (let n = 0; n < 12; n++) { const p = ms.pontoNaSala(5, 1); ms.peca(GEO.dode, M.neve, p.x, 0, p.z, 2 + rng() * 2, 0.6, 1.6 + rng() * 2, 0, rng() * 3, 0); }
    }

    // ---- Sino da Nevasca: o arco com o sino que balança e os braseiros ----
    {
      const s = SALAS[6];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8, x = s.x + Math.sin(a) * 19, z = s.z + Math.cos(a) * 19;
        if (z > s.z + 14 && Math.abs(x - s.x) < 9) continue; // a passagem de quem chega
        ms.peca(GEO.caixa, M.pedra, x, 1.2, z, 1.6, 2.4, 1.6);
        braseiro(ms, M.metal, M.chama, x, z, 0.9, false);
        ms.obst(x, z, 1.1);
      }
      const bx = s.x, bz = -527;
      for (const lado of [-1, 1]) { ms.peca(GEO.caixa, M.pedra, bx + lado * 7, 6, bz, 2, 12, 2); ms.obst(bx + lado * 7, bz, 1.4); }
      ms.peca(GEO.caixa, M.pedra, bx, 12.6, bz, 17, 1.6, 2.4);
      const sino = new THREE.Group(), mtSino = ms.mat('#8fb3c9'), yTopo = ms.y(bx, bz) + 11.8;
      const corpo = new THREE.Mesh(GEO.cone, mtSino); corpo.scale.set(4.4, 5, 4.4); corpo.position.y = -3.2;
      const boca = new THREE.Mesh(GEO.cil, mtSino); boca.scale.set(4.9, 0.6, 4.9); boca.position.y = -5.6;
      const badalo = new THREE.Mesh(GEO.ico, M.dourado); badalo.scale.setScalar(0.9); badalo.position.y = -5.4;
      const argola = new THREE.Mesh(GEO.cil, M.metal); argola.scale.set(0.4, 1.2, 0.4); argola.position.y = -0.4;
      sino.add(corpo, boca, badalo, argola);
      sino.position.set(ms.o.x + bx, yTopo, ms.o.z + bz);
      ms.grupo.add(sino);
      ms.animar((dt, t) => { sino.rotation.x = Math.sin(t * 0.9) * 0.14; badalo.position.z = Math.sin(t * 0.9 - 0.6) * 0.5; });
      const anel = ms.geo(new THREE.TorusGeometry(7, 0.3, 3, 40).rotateX(Math.PI / 2));
      ms.peca(anel, M.cristal, s.x, 0.12, -517, 1, 1, 1);
    }
  },

  // A entrada no mapa: um arco de pedra meio enterrado na neve, com escada para dentro (escondida, sem ícone)
  entrada(b, { x, z, ang, y, obst }) {
    const fx = Math.sin(ang), fz = Math.cos(ang), sx = Math.cos(ang), sz = -Math.sin(ang);
    const P = (f, s) => ({ x: x + fx * f + sx * s, z: z + fz * f + sz * s });
    const pedra = lambert('#8a95a8'), neve = lambert('#eef3f9'), escuro = lambert('#0b1220'), gelo = lambert('#bfefff', { emissive: '#6fd0ff', emissiveIntensity: 0.4 });
    const base = y(x, z);
    for (const [f, s, e, h] of [[-3, 0, 6, 4.5], [-1.5, -4, 4, 3.4], [-1.5, 4, 4, 3.6], [-5, -2.5, 4, 3], [-5, 2.5, 4, 3.2]]) { const p = P(f, s); b.add(GEO.dode, neve, p.x, base + h * 0.35, p.z, e, h, e * 0.95, 0.2, f * s, 0); }
    for (const s of [-1.9, 1.9]) { const p = P(0.6, s); b.add(GEO.caixa, pedra, p.x, base + 2.4, p.z, 1.1, 4.8, 1.1, 0, ang, 0); b.add(GEO.ico, gelo, p.x, base + 5.2, p.z, 0.45, 0.7, 0.45); }
    const v = P(0.6, 0); b.add(GEO.caixa, pedra, v.x, base + 4.9, v.z, 5.2, 0.8, 1.3, 0, ang, 0);
    const d = P(0.2, 0); b.add(GEO.caixa, escuro, d.x, base + 2.1, d.z, 2.7, 4.2, 0.4, 0, ang, 0);
    for (let i = 0; i < 3; i++) { const p = P(1.4 + i * 0.7, 0); b.add(GEO.caixa, pedra, p.x, base + 0.15 - i * 0.12, p.z, 3, 0.3, 0.7, 0, ang, 0); }
    const c = P(-3, 0);
    obst(c.x, c.z, 4.2);
  },
};
