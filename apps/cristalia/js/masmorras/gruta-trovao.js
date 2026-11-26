// =============================================================
// GRUTA DO TROVÃO (Gelo, a 1ª masmorra nova do bioma)
// Uma viagem de ~600 m que começa a céu aberto e entra na montanha:
//  entrada  → a porta de luz (por onde você sai) e as tochas azuis
//  etapa 1  → Vale da Nevasca: campo de neve, pinheiros, a torre em ruínas
//  etapa 2  → Lago Congelado: gelo com buracos de água funda e um barco preso no gelo
//  (Boca da Gruta: o arco de pedra com pingentes de gelo)
//  etapa 3  → Galeria de Cristal: cristais gigantes que brilham no escuro
//  (Ponte do Abismo: a ponte de gelo sobre um buraco sem fundo)
//  etapa 4  → Salão dos Raios: pilares que soltam raios entre si e pedras que flutuam
//  etapa 5  → Escadaria Trovejante: degraus gigantes, braseiros azuis e estátuas de pássaros
//  fim      → Trono da Tempestade: céu aberto com relâmpagos, o trono de gelo e o chefe
// Só desenho: as regras ficam em masmorra.js e os números em MASMORRAS_NOVAS (dados.js).
// =============================================================
import * as THREE from 'three';
import { GEO, lambert } from '../dungeon.js';

// Escadaria: 6 degraus grandes entre z = -455 e z = -503 (do Nv. 1,4 m até 9 m)
function degraus(x, z) {
  const k = Math.max(0, Math.min(1, (-455 - z) / 48)), s = k * 6, fl = Math.floor(s), fr = s - fl;
  const sobe = fl >= 6 ? 0 : Math.max(0, Math.min(1, (fr - 0.78) / 0.22));
  return 1.4 + ((fl + sobe * sobe * (3 - 2 * sobe)) / 6) * 7.6;
}

const SALAS = [
  { x: 0, z: 0, r: 9, h: 0, tipo: 'aberta', tema: 'vale' },                                   // 0 entrada
  { x: 0, z: -62, rx: 40, rz: 44, h: 0, tipo: 'aberta', tema: 'vale', etapa: 0 },             // 1 Vale da Nevasca
  { x: 24, z: -172, rx: 46, rz: 38, h: -0.3, tipo: 'aberta', tema: 'lago', etapa: 1 },        // 2 Lago Congelado
  { x: 30, z: -268, r: 30, h: 1, tipo: 'gruta', tema: 'galeria', etapa: 2 },                  // 3 Galeria de Cristal
  { x: -6, z: -390, r: 32, h: 1.4, tipo: 'gruta', tema: 'salao', etapa: 3 },                  // 4 Salão dos Raios
  { x: 6, z: -480, rx: 26, rz: 30, h: degraus, tipo: 'gruta', tema: 'escadaria', etapa: 4 },  // 5 Escadaria Trovejante
  { x: 6, z: -560, r: 25, h: 9, tipo: 'aberta', tema: 'trono', fim: true },                   // 6 Trono da Tempestade
];
const BURACOS = [[6, -160, 4], [44, -152, 3.5], [36, -192, 5], [2, -186, 3], [52, -178, 3.2], [14, -200, 2.6]].map(([x, z, r]) => ({ x, z, r }));

// Cores do chão de cada sala e das paredes
const CHAO = {
  vale: ['#eef4fa', '#e3ecf5', '#f6f9fd', '#dce7f2'],
  lago: ['#bfe4f5', '#aedaf0', '#cdeefa', '#a3d3ec'],
  galeria: ['#2d3f5c', '#354a6c', '#283852'],
  salao: ['#3b4060', '#444a6a', '#363a56'],
  escadaria: ['#4a5576', '#535f82', '#424c6a'],
  trono: ['#d4deee', '#c6d2e6', '#e2e9f4'],
};
const ROCHA_ABERTA = ['#8193ad', '#73859f', '#8a9bb3'], NEVE = ['#e9f0f7', '#dfe8f2', '#f3f7fb'];
const ROCHA_GRUTA = ['#1d2a40', '#243450', '#18233a', '#2a3a58'];
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export const GRUTA_TROVAO = {
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 6, tipo: 'aberta' },
      { a: 1, b: 2, larg: 7, tipo: 'aberta' },
      { a: 2, b: 3, larg: 6 },              // a Boca da Gruta
      { a: 3, b: 4, larg: 2.4 },            // a Ponte do Abismo
      { a: 4, b: 5, larg: 6 },
      { a: 5, b: 6, larg: 6 },
    ],
    abismos: [{ corredor: 3, r: 19, fundo: 24 }],
    buracos: BURACOS,
  },
  corSelo: '#7fe0ff',
  // o portão de cada etapa fica no corredor que sai da sala dela
  portoes: [{ corredor: 1 }, { corredor: 2 }, { corredor: 3, depois: 2 }, { corredor: 4 }, { corredor: 5 }],
  acampamentos: [
    { x: 2, z: -66, etapa: 0 }, { x: 22, z: -170, etapa: 1 }, { x: 28, z: -270, etapa: 2 },
    { x: -6, z: -392, etapa: 3 }, { x: 6, z: -476, etapa: 4 },
  ],
  inicio: { x: 0, z: -8, ang: Math.PI },   // (um pouco para dentro: a viga da porta de luz fica atrás da câmera)       // olhando para dentro (−z)
  saida: { x: 0, z: 7.6, r: 2.2 },             // a porta de luz
  trono: { x: 6, z: -564, ang: 0 },            // o chefe olha para a entrada (+z)
  portal: { x: -9, z: -566, ang: 0.35 },

  temas: {
    vale: { ceu: '#8d9fb9', hemi: '#e8f3ff', luz: 1.65, sol: 1.25, nevoa: [34, 120], part: 'neve' },
    lago: { ceu: '#8aa3c2', hemi: '#e0f5ff', luz: 1.7, sol: 1.3, nevoa: [34, 120], part: 'neve' },
    galeria: { ceu: '#0b1526', hemi: '#86d4ff', luz: 1.35, sol: 0.3, nevoa: [18, 80], part: 'brilho', corPart: '#9fe8ff' },
    salao: { ceu: '#12172b', hemi: '#c4ccff', luz: 1.25, sol: 0.35, nevoa: [18, 80], part: 'faisca', corPart: '#ffe066' },
    escadaria: { ceu: '#17213a', hemi: '#b4ceff', luz: 1.45, sol: 0.55, nevoa: [20, 85], part: 'brilho', corPart: '#b9d8ff' },
    trono: { ceu: '#3a4262', hemi: '#c9d3ff', luz: 1.3, sol: 0.7, nevoa: [28, 105], part: 'neve', relampagos: true },
  },

  // A cor de cada triângulo do chão
  corChao(c, { sala, d, h, hChao, x, z, tipo, rng }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (h < hChao - 0.6) return c.set('#14324a');                       // fundo dos buracos do lago
      if (s.tema === 'escadaria') { const n = Math.floor((h - 1.4) / 1.267 + 0.2); return c.set(n % 2 ? '#6b78a2' : '#5a6690'); }
      return c.set(sorteia(rng, CHAO[s.tema]));
    }
    if (h < hChao - 2.5) return c.set('#0a1424').lerp(c3n.set('#03060c'), Math.min(1, (hChao - h) / 24)); // o abismo
    if (tipo === 'aberta') return c.set(h - hChao > 4.5 || rng() < 0.25 ? sorteia(rng, NEVE) : sorteia(rng, ROCHA_ABERTA));
    return c.set(sorteia(rng, ROCHA_GRUTA));
  },

  // Os pilares e a viga de cada portão selado (o "selo" de energia é feito em masmorra.js)
  pecasPortao(ms, b, { lx, lz, base, ang, larg, px, pz }) {
    const o = ms.o, pedra = ms.mat('#6d7f9c'), gelo = ms.brilho('#9fe8ff', 0.6);
    for (const lado of [-1, 1]) {
      const x = o.x + lx + px * (larg + 1.3) * lado, z = o.z + lz + pz * (larg + 1.3) * lado;
      b.add(GEO.caixa, pedra, x, base + 3.4, z, 1.7, 6.8, 1.7, 0, ang, 0);
      b.add(GEO.ico, gelo, x, base + 7.4, z, 1.1, 1.6, 1.1);
    }
    b.add(GEO.caixa, pedra, o.x + lx, base + 6.9, o.z + lz, (larg + 2.2) * 2, 1.2, 1.9, 0, ang, 0);
  },

  // Tudo o que enfeita a gruta (peças em lote: poucos desenhos por quadro)
  decorar(ms) {
    const rng = ms.rng, F = ms.forma;
    const M = {
      tronco: ms.mat('#5a4636'), pinho: ms.mat('#3f6e66'), pinho2: ms.mat('#4c7d72'), neve: ms.mat('#f2f7fb'),
      pedraNeve: ms.mat('#dfe8f1'), pedraCinza: ms.mat('#9aa6b6'), pedraEscura: ms.mat('#3d5274'),
      cristal: ms.brilho('#7fe6ff', 0.7), cristalRoxo: ms.brilho('#b58cff', 0.6), geloBrilho: ms.brilho('#bfefff', 0.45),
      madeira: ms.mat('#6b4a32'), velha: ms.mat('#d8d2c2'), metal: ms.mat('#3a3f5c'), metalBase: ms.mat('#2b2f45'),
      raio: ms.brilho('#ffd23f', 0.55), orbe: ms.brilho('#fff07a', 0.95), chama: ms.brilho('#7fd8ff', 1),
      agua: ms.mat('#1f5d7c', { emissive: '#0a2a3a', emissiveIntensity: 0.5 }), rachadura: ms.mat('#86b9d3'),
      estatua: ms.mat('#8b97b4'), bico: ms.brilho('#ffd23f', 0.4), gelo: ms.mat('#cfe9f7'),
    };
    const octa = ms.geo(new THREE.OctahedronGeometry(1, 0));
    const pinheiro = (x, z, e) => {
      ms.peca(GEO.cil, M.tronco, x, 0.8 * e, z, 0.55 * e, 1.6 * e, 0.55 * e);
      const m = rng() < 0.5 ? M.pinho : M.pinho2;
      ms.peca(GEO.cone, m, x, 2.4 * e, z, 3.2 * e, 2.6 * e, 3.2 * e);
      ms.peca(GEO.cone, m, x, 3.9 * e, z, 2.4 * e, 2.2 * e, 2.4 * e);
      ms.peca(GEO.cone, M.neve, x, 5.2 * e, z, 1.4 * e, 1.6 * e, 1.4 * e);
    };

    // ---- pinheiros nos morros em volta das áreas abertas ----
    const abertas = [0, 1, 2, 6];
    for (let t = 0, n = 0; t < 1400 && n < 170; t++) {
      const s = SALAS[abertas[Math.floor(rng() * abertas.length)]], a = rng() * Math.PI * 2;
      const rx = s.rx ?? s.r, rz = s.rz ?? s.r, k = 1 + (2 + rng() * 22) / Math.min(rx, rz);
      const x = s.x + Math.cos(a) * rx * k, z = s.z + Math.sin(a) * rz * k;
      const inf = F.andavelLocal(x, z);
      if (inf.d < 1.5 || inf.d > 24 || inf.tipo !== 'aberta' || ms.y(x, z) < inf.h - 1) continue;
      pinheiro(x, z, 0.8 + rng() * 0.8); n++;
    }
    // e alguns dentro do vale (esses batem)
    for (let n = 0; n < 16; n++) {
      const p = ms.pontoNaSala(1, 3);
      if (Math.hypot(p.x - 2, p.z + 66) < 16 || Math.hypot(p.x, p.z + 20) < 8) continue;
      const e = 0.8 + rng() * 0.5; pinheiro(p.x, p.z, e); ms.obst(p.x, p.z, 0.9 * e);
    }
    // pedras de neve no vale e na beira do lago
    for (let n = 0; n < 14; n++) {
      const p = ms.pontoNaSala(n < 9 ? 1 : 2, 2);
      if (Math.hypot(p.x - 2, p.z + 66) < 14 || Math.hypot(p.x - 22, p.z + 170) < 14) continue;
      const e = 0.9 + rng() * 1.4; ms.peca(GEO.dode, rng() < 0.6 ? M.pedraNeve : M.pedraCinza, p.x, 0.3 * e, p.z, e * 1.3, e, e * 1.2, rng(), rng() * 3, 0); ms.obst(p.x, p.z, 0.75 * e);
    }

    // ---- a entrada: a porta de luz e as tochas azuis ----
    ms.bloco((b) => {
      const o = ms.o, y0 = ms.y(0, 8);
      for (const lado of [-1, 1]) {
        b.add(GEO.caixa, M.pedraCinza, o.x + lado * 3.2, y0 + 2.8, o.z + 8.4, 1.4, 5.6, 1.4);
        b.add(GEO.cil, M.metalBase, o.x + lado * 5.6, y0 + 0.7, o.z + 5.5, 0.9, 1.4, 0.9);
        b.add(GEO.cone, M.chama, o.x + lado * 5.6, y0 + 1.9, o.z + 5.5, 0.8, 1.4, 0.8);
      }
      b.add(GEO.caixa, M.pedraCinza, o.x, y0 + 6, o.z + 8.4, 8.2, 1.1, 1.6);
    });
    const luz = ms.malha(ms.geo(new THREE.PlaneGeometry(5, 5)), new THREE.MeshBasicMaterial({ color: '#d8f6ff', transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }), 0, 2.7, 8.6);
    ms.mats.set('portaLuz', luz.material);
    ms.animar((dt, t) => { luz.material.opacity = 0.6 + Math.sin(t * 2.2) * 0.15; });
    ms.obst(-3.2, 8.4, 0.9); ms.obst(3.2, 8.4, 0.9);
    // placa de madeira
    ms.peca(GEO.caixa, M.madeira, -6, 1, -3, 0.2, 2, 0.2);
    ms.peca(GEO.caixa, M.madeira, -6, 1.8, -3, 1.6, 0.6, 0.12, 0, 0.4, 0);

    // ---- Vale da Nevasca: a torre em ruínas e o laguinho congelado ----
    const tx = -24, tz = -56;
    ms.peca(GEO.cil, M.pedraCinza, tx, 3, tz, 6.4, 6, 6.4);
    for (let i = 0; i < 7; i++) {
      if (i === 2 || i === 5) continue; // ameias quebradas
      const a = (i / 7) * Math.PI * 2;
      ms.peca(GEO.caixa, M.pedraCinza, tx + Math.cos(a) * 2.7, 6.5, tz + Math.sin(a) * 2.7, 1, 1.1, 1, 0, -a, 0);
    }
    ms.peca(GEO.disco, M.neve, tx, 6.05, tz, 2.9, 1, 2.9);
    ms.peca(GEO.caixa, ms.mat('#20283a'), tx + 3.1, 1.3, tz + 0.6, 0.4, 2.4, 1.4, 0, 0.2, 0);
    for (let i = 0; i < 5; i++) ms.peca(GEO.caixa, M.pedraCinza, tx + 4 + rng() * 4, 0.4, tz - 3 + rng() * 6, 1.2, 0.8, 1, rng(), rng() * 3, rng());
    ms.obst(tx, tz, 3.6);
    ms.peca(GEO.disco, M.geloBrilho, 22, 0.06, -44, 6, 1, 4.5);

    // ---- Lago Congelado: água nos buracos, rachaduras, pingos de gelo e o barco preso ----
    for (const b of BURACOS) {
      ms.peca(GEO.disco, M.agua, b.x, SALAS[2].h - 0.6, b.z, b.r + 0.25, 1, b.r + 0.25, 0, 0, 0, false); // a água fica abaixo do gelo
    }
    for (let n = 0; n < 46; n++) {
      const p = ms.pontoNaSala(2, 1);
      ms.peca(GEO.caixa, M.rachadura, p.x, 0.03, p.z, 0.14, 0.04, 2 + rng() * 5, 0, rng() * Math.PI, 0);
    }
    for (let t = 0, n = 0; t < 400 && n < 34; t++) {
      const a = rng() * Math.PI * 2, s = SALAS[2], k = 0.93 + rng() * 0.14;
      const x = s.x + Math.cos(a) * s.rx * k, z = s.z + Math.sin(a) * s.rz * k, d = ms.d(x, z);
      if (d < -2.5 || d > 2) continue;
      const e = 0.8 + rng() * 1.6;
      ms.peca(GEO.cone4, M.cristal, x, 1.2 * e, z, 0.9 * e, 2.6 * e, 0.9 * e, (rng() - 0.5) * 0.4, rng() * 3, (rng() - 0.5) * 0.4);
      if (d < -0.5) ms.obst(x, z, 0.6 * e);
      n++;
    }
    // o barco preso no gelo
    const bx = -6, bz = -170;
    ms.peca(GEO.caixa, M.madeira, bx, 0.2, bz, 3, 1.5, 8.5, 0.05, 0.5, 0.22);
    ms.peca(GEO.caixa, ms.mat('#55392a'), bx, 0.95, bz, 2.6, 0.2, 7.6, 0.05, 0.5, 0.22);
    ms.peca(GEO.cil, M.madeira, bx + 0.4, 4, bz, 0.35, 7, 0.35, 0.18, 0, 0.25);
    ms.peca(GEO.caixa, M.velha, bx + 0.9, 4.6, bz + 0.4, 0.08, 3.4, 2.8, 0.18, 0.5, 0.25);
    ms.peca(GEO.dode, M.neve, bx - 1.2, 0.5, bz + 2.6, 2, 0.7, 1.6);
    for (const k of [-2.6, 0, 2.6]) ms.obst(bx + Math.sin(0.5) * k, bz + Math.cos(0.5) * k, 1.8);

    // ---- a Boca da Gruta (o arco de pedra com pingentes de gelo) ----
    {
      const c = F.corredores[2], mx = c.bx - c.ux * 4, mz = c.bz - c.uz * 4, px = -c.uz, pz = c.ux, base = ms.y(mx, mz);
      for (const lado of [-1, 1]) for (let i = 0; i < 3; i++) {
        const x = mx + px * (8.5 + i * 2.2) * lado - c.ux * (i - 1) * 3, z = mz + pz * (8.5 + i * 2.2) * lado - c.uz * (i - 1) * 3;
        ms.lote.add(GEO.dode, M.pedraEscura, ms.o.x + x, base + 5 + i * 2.5, ms.o.z + z, 4.6, 10 + i * 2.5, 4.2, rng(), rng() * 3, rng() * 0.3);
      }
      for (let i = -3; i <= 3; i++) ms.lote.add(GEO.dode, M.pedraEscura, ms.o.x + mx + px * i * 2.6, base + 16.5 + Math.abs(i) * 0.6, ms.o.z + mz + pz * i * 2.6, 3.6, 2.6, 3.6, rng(), rng() * 3, 0);
      for (let i = -8; i <= 8; i++) {
        const comp = 1.2 + rng() * 2.6;
        ms.lote.add(GEO.cone4, M.geloBrilho, ms.o.x + mx + px * i * 0.9, base + 15.2 - comp / 2, ms.o.z + mz + pz * i * 0.9, 0.5, comp, 0.5, Math.PI, rng(), 0);
      }
    }

    // ---- Galeria de Cristal ----
    const cacho = (x, z, e, roxo, bate) => {
      for (let i = 0; i < 5; i++) {
        // (baixos e largos: a câmera passa por cima sem ficar presa neles)
        const a = rng() * Math.PI * 2, r = i ? rng() * 1.8 * e : 0, h = (i ? 1.6 + rng() * 1.8 : 3.4 + rng() * 1.6) * e;
        ms.peca(octa, roxo && i % 2 ? M.cristalRoxo : M.cristal, x + Math.cos(a) * r, h * 0.42, z + Math.sin(a) * r, 0.85 * e, h * 0.5, 0.85 * e, (rng() - 0.5) * 0.6, rng() * 3, (rng() - 0.5) * 0.6);
      }
      if (bate) ms.obst(x, z, 1.7 * e);
    };
    {
      const s = SALAS[3];
      for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2 + rng() * 0.3, k = 0.86; cacho(s.x + Math.cos(a) * s.r * k, s.z + Math.sin(a) * s.r * k, 0.9 + rng() * 0.6, i % 3 === 0, true); }
      cacho(s.x + 13, s.z - 9, 1.5, true, true);
      cacho(s.x - 12, s.z + 6, 1.2, false, true);
      // cristais nas paredes (o escuro brilha)
      for (let t = 0, n = 0; t < 300 && n < 26; t++) {
        const a = rng() * Math.PI * 2, k = 1.12 + rng() * 0.3, x = s.x + Math.cos(a) * s.r * k, z = s.z + Math.sin(a) * s.r * k;
        const d = ms.d(x, z); if (d < 3.5 || d > 11) continue;
        cacho(x, z, 0.6 + rng() * 0.5, rng() < 0.3, false); n++;
      }
      // estalagmites
      for (let n = 0; n < 14; n++) {
        const p = ms.pontoNaSala(3, 3);
        if (Math.hypot(p.x - 28, p.z + 270) < 13) continue;
        const e = 0.8 + rng() * 1.2;
        ms.peca(GEO.cone, M.pedraEscura, p.x, 1.6 * e, p.z, 1.3 * e, 3.4 * e, 1.3 * e); ms.obst(p.x, p.z, 0.7 * e);
      }
      for (let n = 0; n < 40; n++) { const p = ms.pontoNaSala(3, 1); ms.peca(octa, M.cristal, p.x, 0.25, p.z, 0.18, 0.4, 0.18, 0, rng() * 3, 0); }
    }

    // ---- a Ponte do Abismo ----
    {
      const c = F.corredores[3], L = Math.hypot(c.bx - c.ax, c.bz - c.az), ang = Math.atan2(c.ux, c.uz), px = -c.uz, pz = c.ux;
      for (let s = 0; s <= L; s += 1.25) {
        const x = c.ax + c.ux * s, z = c.az + c.uz * s;
        if (ms.d(x, z) > -0.1 && F.salaEm(ms.o.x + x, ms.o.z + z) >= 0) continue;
        ms.peca(GEO.caixa, M.gelo, x, -0.18, z, c.larg * 2 + 0.8, 0.4, 1.1, 0, ang, 0);
      }
      for (let s = 2; s <= L - 2; s += 4) for (const lado of [-1, 1]) {
        const x = c.ax + c.ux * s + px * (c.larg + 0.3) * lado, z = c.az + c.uz * s + pz * (c.larg + 0.3) * lado;
        ms.peca(GEO.cil, M.pedraCinza, x, 0.8, z, 0.3, 1.6, 0.3);
        ms.peca(GEO.caixa, M.madeira, x + c.ux * 2, 1.25, z + c.uz * 2, 0.08, 0.08, 4, 0, ang, 0);
      }
      // cristais lá embaixo (o abismo parece fundo)
      const ab = F.abismos[0];
      for (let n = 0; n < 18; n++) {
        const k = rng(), x = ab.a.x + (ab.b.x - ab.a.x) * k + px * (6 + rng() * 12) * (rng() < 0.5 ? -1 : 1), z = ab.a.z + (ab.b.z - ab.a.z) * k + pz * (6 + rng() * 12) * (rng() < 0.5 ? -1 : 1);
        if (ms.d(x, z) < 4) continue;
        cacho(x, z, 1 + rng(), rng() < 0.5, false);
      }
    }

    // ---- Salão dos Raios: pilares com raios entre eles e pedras flutuando ----
    {
      const s = SALAS[4], topos = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3, x = s.x + Math.cos(a) * 23, z = s.z + Math.sin(a) * 23;
        ms.peca(GEO.cil, M.metalBase, x, 0.5, z, 2.4, 1, 2.4);
        ms.peca(GEO.cil, M.metal, x, 4.4, z, 1.1, 7.4, 1.1);
        for (const hy of [2.6, 4.6, 6.6]) ms.peca(GEO.cil, M.raio, x, hy, z, 1.7, 0.22, 1.7);
        ms.peca(GEO.ico, M.orbe, x, 8.8, z, 1.5, 1.5, 1.5);
        ms.obst(x, z, 1.4);
        topos.push(new THREE.Vector3(ms.o.x + x, ms.y(x, z) + 8.8, ms.o.z + z));
      }
      // os raios: 1 desenho só, refeito várias vezes por segundo
      const nSeg = 7, pos = new Float32Array(6 * nSeg * 2 * 3);
      const g = ms.geo(new THREE.BufferGeometry());
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const linhas = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#fff6a0', transparent: true, opacity: 0.95 }));
      ms.mats.set('raios', linhas.material);
      linhas.frustumCulled = false;
      ms.grupo.add(linhas);
      let espera = 0;
      const v = new THREE.Vector3();
      ms.animar((dt) => {
        espera -= dt;
        if (espera > 0) return;
        espera = 0.08;
        linhas.visible = Math.random() < 0.85;
        let k = 0;
        for (let i = 0; i < 6; i++) {
          const a = topos[i], b = topos[(i + 1) % 6];
          let ant = a.clone();
          for (let j = 1; j <= nSeg; j++) {
            v.lerpVectors(a, b, j / nSeg);
            if (j < nSeg) v.add({ x: (Math.random() - 0.5) * 2.2, y: (Math.random() - 0.5) * 2.2, z: (Math.random() - 0.5) * 2.2 });
            pos.set([ant.x, ant.y, ant.z, v.x, v.y, v.z], k); k += 6;
            ant.copy(v);
          }
        }
        g.attributes.position.needsUpdate = true;
      });
      // pedras de ímã (do Imanito) e as que flutuam no meio
      for (let n = 0; n < 10; n++) {
        const p = ms.pontoNaSala(4, 4);
        if (Math.hypot(p.x + 6, p.z + 392) < 13) continue;
        const e = 0.9 + rng() * 1.1;
        ms.peca(GEO.dode, M.metalBase, p.x, 0.5 * e, p.z, 1.5 * e, 1.2 * e, 1.4 * e, rng(), rng() * 3, 0);
        ms.peca(GEO.ico, M.raio, p.x, 1.1 * e, p.z, 0.35 * e, 0.35 * e, 0.35 * e);
        ms.obst(p.x, p.z, 1 * e);
      }
      const voa = new THREE.InstancedMesh(GEO.dode, M.metal, 6), mx = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), vv = new THREE.Vector3(), sc = new THREE.Vector3();
      voa.frustumCulled = false;
      ms.grupo.add(voa);
      const yS = ms.y(s.x, s.z);
      ms.animar((dt, t) => {
        for (let i = 0; i < 6; i++) {
          const a = t * 0.3 + (i / 6) * Math.PI * 2, r = 9 + Math.sin(t + i) * 1.5;
          q.setFromEuler(e3.set(t * 0.5 + i, t * 0.7 + i, 0));
          voa.setMatrixAt(i, mx.compose(vv.set(ms.o.x + s.x + Math.cos(a) * r, yS + 4.5 + Math.sin(t * 1.3 + i) * 0.8, ms.o.z + s.z + Math.sin(a) * r), q, sc.setScalar(1.2 + (i % 3) * 0.4)));
        }
        voa.instanceMatrix.needsUpdate = true;
      });
    }

    // ---- Escadaria Trovejante: a borda dos degraus, braseiros e as estátuas ----
    {
      const s = SALAS[5];
      for (let n = 1; n <= 5; n++) {
        const z = -455 - 48 * (n - 1 + 0.89) / 6, k = Math.sqrt(Math.max(0, 1 - ((z - s.z) / s.rz) ** 2)), meia = s.rx * k - 1;
        for (let x = s.x - meia; x <= s.x + meia; x += 3.2) ms.peca(GEO.caixa, M.pedraCinza, x, -0.5, z, 3, 0.8, 1.4, 0, 0, 0);
        for (const lado of [-1, 1]) {
          const bxx = s.x + lado * (meia - 2.5), bzz = z - 3.5;
          ms.peca(GEO.cil, M.metalBase, bxx, 0.6, bzz, 1, 1.2, 1);
          ms.peca(GEO.cone, M.chama, bxx, 1.7, bzz, 0.8, 1.3, 0.8);
          ms.obst(bxx, bzz, 0.7);
        }
      }
      for (const lado of [-1, 1]) {
        const x = s.x + lado * 15, z = -500;
        ms.peca(GEO.caixa, M.pedraCinza, x, 1, z, 4, 2, 4);
        ms.peca(GEO.ico, M.estatua, x, 4, z, 2.2, 2.8, 2);
        ms.peca(GEO.ico, M.estatua, x, 6.6, z + 0.8, 1.2, 1.2, 1.2);
        ms.peca(GEO.cone4, M.bico, x, 6.5, z + 2.1, 0.5, 1.2, 0.5, Math.PI / 2, 0, 0);
        for (const w of [-1, 1]) ms.peca(GEO.caixa, M.estatua, x + w * 3, 5.2, z, 4.5, 0.4, 2.2, 0, 0, w * 0.6);
        ms.obst(x, z, 2.6);
      }
    }

    // ---- Trono da Tempestade: pilares de cristal, o trono e as nuvens ----
    {
      const s = SALAS[6];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 10, x = s.x + Math.cos(a) * 21, z = s.z + Math.sin(a) * 21;
        if (z > s.z + 16 && Math.abs(x - s.x) < 9) continue; // a passagem da escadaria
        const h = 6 + rng() * 3;
        ms.peca(octa, M.cristal, x, h * 0.5, z, 1.2, h * 0.55, 1.2, 0, rng() * 3, 0);
        ms.obst(x, z, 1.3);
      }
      // o círculo de runas no chão, em volta do chefe
      const anel = ms.geo(new THREE.TorusGeometry(8, 0.3, 3, 40).rotateX(Math.PI / 2));
      ms.peca(anel, M.cristal, 6, 0.12, -564, 1, 1, 1);
      ms.peca(anel, M.cristal, 6, 0.12, -564, 0.55, 1, 0.55);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ms.peca(GEO.caixa, M.cristal, 6 + Math.cos(a) * 6.2, 0.1, -564 + Math.sin(a) * 6.2, 0.4, 0.08, 2.4, 0, -a, 0); }
      const tx2 = s.x, tz2 = -573;
      ms.peca(GEO.caixa, M.gelo, tx2, 0.8, tz2, 7, 1.6, 4.5);
      ms.peca(GEO.caixa, M.gelo, tx2, 4.5, tz2 - 2.4, 7, 9, 1.4);
      for (const lado of [-1, 1]) ms.peca(GEO.caixa, M.gelo, tx2 + lado * 3.2, 2.2, tz2 + 0.3, 0.9, 1.5, 3.8);
      for (let i = -2; i <= 2; i++) ms.peca(octa, M.cristal, tx2 + i * 1.5, 9.6 + (2 - Math.abs(i)) * 0.9, tz2 - 2.4, 0.5, 1.6 + (2 - Math.abs(i)) * 0.7, 0.5);
      ms.obst(tx2, tz2 - 1, 3.6);
      // nuvens de tempestade girando devagar (1 desenho)
      const nuvens = new THREE.InstancedMesh(GEO.ico, ms.mat('#4a5070'), 9), mx = new THREE.Matrix4(), q = new THREE.Quaternion(), vv = new THREE.Vector3(), sc = new THREE.Vector3();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2, r = 10 + (i % 3) * 5;
        nuvens.setMatrixAt(i, mx.compose(vv.set(Math.cos(a) * r, (i % 2) * 2, Math.sin(a) * r), q.identity(), sc.set(9 + (i % 3) * 3, 2.5, 7)));
      }
      const gn = new THREE.Group();
      gn.add(nuvens);
      gn.position.set(ms.o.x + s.x, 9 + 25, ms.o.z + s.z);
      ms.grupo.add(gn);
      ms.animar((dt) => { gn.rotation.y += dt * 0.05; });
    }
  },

  // A entrada no mapa: um monte de pedras de gelo com uma boca escura (escondida, sem ícone)
  entrada(b, { x, z, ang, y, obst }) {
    const fx = Math.sin(ang), fz = Math.cos(ang), sx = Math.cos(ang), sz = -Math.sin(ang);
    const P = (f, s) => ({ x: x + fx * f + sx * s, z: z + fz * f + sz * s });
    const pedra = lambert('#7e90ab'), neve = lambert('#e6eef7'), escuro = lambert('#0b1220'), gelo = lambert('#bfefff', { emissive: '#6fd0ff', emissiveIntensity: 0.4 });
    const base = y(x, z);
    const pedras = [[-2.5, 0, 5, 5.5], [-1, -3.4, 3.6, 4], [-1, 3.4, 3.6, 4.2], [-4.5, -2, 3.4, 3.5], [-4.5, 2.2, 3.2, 3.2], [0.6, -2.4, 2.2, 3.2], [0.6, 2.4, 2.2, 3.4]];
    for (const [f, s, e, h] of pedras) { const p = P(f, s); b.add(GEO.dode, pedra, p.x, base + h * 0.45, p.z, e, h, e * 0.95, 0.3, f + s, 0.1); }
    for (const [f, s, e] of [[-2.5, 0, 3.6], [-1, -3.4, 2.4], [-1, 3.4, 2.4]]) { const p = P(f, s + 0.2); b.add(GEO.dode, neve, p.x, base + 5.2 + e * 0.2, p.z, e, 1.2, e); }
    const boca = P(1.3, 0);
    b.add(GEO.caixa, escuro, boca.x, base + 1.6, boca.z, 2.8, 3.2, 0.6, 0, ang, 0);
    for (let i = -3; i <= 3; i++) { const p = P(1.7, i * 0.42), comp = 0.5 + ((i * 7 + 9) % 5) * 0.18; b.add(GEO.cone4, gelo, p.x, base + 3.25 - comp / 2, p.z, 0.22, comp, 0.22, Math.PI, 0, 0); }
    for (const s of [-1.9, 1.9]) { const p = P(1.9, s); b.add(GEO.ico, gelo, p.x, base + 0.35, p.z, 0.35, 0.6, 0.35); }
    const c = P(-2.2, 0);
    obst(c.x, c.z, 4.3);
  },
};
const c3n = new THREE.Color();
