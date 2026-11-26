// =============================================================
// PÂNTANO SOMBRIO (Floresta; a outra masmorra do bioma é a Trilha Ancestral)
// Um brejo escuro e cheio de névoa, com coisas que brilham:
//  entrada  → a porta de luz, na beira do brejo
//  etapa 1  → Charco das Névoas: poças fundas com vitórias-régias, juncos e árvores tortas
//  etapa 2  → Bosque dos Cogumelos: cogumelos gigantes roxos, verdes e rosa que brilham
//  (Passarela do Brejo: uma passarela de madeira estreita em cima da água funda)
//  etapa 3  → Cabana da Bruxa: a cabana em palafitas, o caldeirão que borbulha, totens e lampiões
//  etapa 4  → Raízes Afogadas: dentro de um emaranhado de raízes gigantes, com musgo que brilha
//  etapa 5  → Lagoa dos Vaga-lumes: lagoas, lanternas de pedra e vaga-lumes
//  fim      → Árvore Morta Ancestral: a árvore gigante com olhos que brilham, as pedras de runas e o chefe
// Só desenho: as regras ficam em masmorra.js e os números em MASMORRAS_NOVAS (dados.js).
// =============================================================
import * as THREE from 'three';
import { GEO, lambert } from '../dungeon.js';
import { nosMorros, pontosNaSala, portaDeLuz, braseiro, portaoSimples, liquido, arvoreMorta } from './pecas.js';

const SALAS = [
  { x: 0, z: 0, r: 9, h: 0, tipo: 'aberta', tema: 'borda' },                                    // 0 entrada
  { x: 0, z: -62, rx: 40, rz: 44, h: 0, tipo: 'aberta', tema: 'charco', etapa: 0 },             // 1 Charco das Névoas
  { x: 14, z: -170, rx: 38, rz: 34, h: 0, tipo: 'aberta', tema: 'cogumelos', etapa: 1 },        // 2 Bosque dos Cogumelos
  { x: -6, z: -275, r: 28, h: 0, tipo: 'aberta', tema: 'cabana', etapa: 2 },                    // 3 Cabana da Bruxa
  { x: 8, z: -370, r: 30, h: 0.5, tipo: 'gruta', tema: 'raizes', etapa: 3 },                    // 4 Raízes Afogadas
  { x: -4, z: -460, rx: 30, rz: 28, h: 0.5, tipo: 'aberta', tema: 'lagoa', etapa: 4 },          // 5 Lagoa dos Vaga-lumes
  { x: 4, z: -545, r: 25, h: 1, tipo: 'aberta', tema: 'arvore', fim: true },                    // 6 Árvore Morta Ancestral
];
const POCAS = [[-22, -50, 4], [18, -40, 3.5], [24, -80, 5], [-16, -88, 3.5], [-30, -70, 3], [6, -100, 2.6], [14, -452, 6], [-20, -470, 4.5]].map(([x, z, r]) => ({ x, z, r }));

const CHAO = {
  borda: ['#4a5a34', '#3e4e2c', '#55663a'], charco: ['#3a4a2e', '#334228', '#41522f'],
  cogumelos: ['#3c3a52', '#45425c', '#353348'], cabana: ['#4a4a30', '#41412a', '#525236'],
  raizes: ['#2e3a24', '#34421f', '#28331e'], lagoa: ['#3a5030', '#33472b', '#425a36'], arvore: ['#3a3428', '#423b2e', '#332e24'],
};
const MORRO = ['#2f3f2a', '#384a30', '#2a3826', '#3f5234'], RAIZ = ['#3a2a1e', '#2e2218', '#45322a'];
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export const PANTANO_SOMBRIO = {
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 6, tipo: 'aberta' },
      { a: 1, b: 2, larg: 7, tipo: 'aberta' },
      { a: 2, b: 3, larg: 2.6, tipo: 'aberta' },   // a Passarela do Brejo
      { a: 3, b: 4, larg: 5 },                    // a entrada das raízes
      { a: 4, b: 5, larg: 5 },
      { a: 5, b: 6, larg: 6, tipo: 'aberta' },
    ],
    abismos: [{ corredor: 2, r: 16, fundo: 3.2 }],   // água funda dos dois lados da passarela
    buracos: POCAS,
  },
  corSelo: '#9affb0',
  portoes: [{ corredor: 1 }, { corredor: 2, depois: 2 }, { corredor: 3 }, { corredor: 4 }, { corredor: 5 }],
  acampamentos: [
    { x: 0, z: -64, etapa: 0 }, { x: 14, z: -172, etapa: 1 }, { x: -6, z: -277, etapa: 2 },
    { x: 8, z: -372, etapa: 3 }, { x: -4, z: -460, etapa: 4 },
  ],
  inicio: { x: 0, z: -8, ang: Math.PI },   // (um pouco para dentro: a viga da porta de luz fica atrás da câmera)
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 4, z: -551, ang: 0 },
  portal: { x: -11, z: -553, ang: 0.3 },

  temas: {
    borda: { ceu: '#4a5a4a', hemi: '#cfe8c0', luz: 1.45, sol: 0.85, nevoa: [22, 85], part: 'brilho', corPart: '#d8ff8a' },
    charco: { ceu: '#3e4c40', hemi: '#c8e4bc', luz: 1.45, sol: 0.8, nevoa: [14, 66], part: 'brilho', corPart: '#d8ff8a' },
    cogumelos: { ceu: '#2a2440', hemi: '#d6c2ff', luz: 1.4, sol: 0.6, nevoa: [18, 78], part: 'brilho', corPart: '#c9a0ff' },
    cabana: { ceu: '#2e3a30', hemi: '#c8f0b0', luz: 1.4, sol: 0.6, nevoa: [16, 72], part: 'brilho', corPart: '#9affb0' },
    raizes: { ceu: '#0f1a12', hemi: '#a8ffb0', luz: 1.35, sol: 0.3, nevoa: [16, 70], part: 'brilho', corPart: '#9affb0' },
    lagoa: { ceu: '#1e2a3a', hemi: '#c0e0ff', luz: 1.4, sol: 0.55, nevoa: [20, 85], part: 'brilho', corPart: '#fff27a' },
    arvore: { ceu: '#2a2030', hemi: '#e0c8ff', luz: 1.4, sol: 0.55, nevoa: [22, 88], part: 'brilho', corPart: '#b8ff8a' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (h < hChao - 0.6) return c.set('#1a2a1e');                     // o fundo das poças
      return c.set(sorteia(rng, CHAO[s.tema]));
    }
    if (h < hChao - 1) return c.set('#1e2e22');                          // a água funda da passarela
    return c.set(sorteia(rng, tipo === 'gruta' ? RAIZ : MORRO));
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#4a3a2a'), ms.brilho('#9affb0', 0.7), ms.mat('#3a2e22')); },

  decorar(ms) {
    const rng = ms.rng, F = ms.forma;
    const M = {
      tronco: ms.mat('#3a3026'), copa: ms.mat('#3f5a3a'), copa2: ms.mat('#34503a'), musgo: ms.mat('#6a7a4a'), morta: ms.mat('#4a4038'),
      haste: ms.mat('#e8dcc8'), roxo: ms.brilho('#b58cff', 0.6), verde: ms.brilho('#5fe0c8', 0.6), rosa: ms.brilho('#ff7eb6', 0.55), pinta: ms.mat('#f6f0ff'),
      agua: ms.mat('#24463c', { emissive: '#0a2a22', emissiveIntensity: 0.5, transparent: true, opacity: 0.88 }), folhaAgua: ms.mat('#4f8a3a'), flor: ms.mat('#ff9ac8'),
      junco: ms.mat('#6a8a3a'), madeira: ms.mat('#6b5238'), madeiraEsc: ms.mat('#4a3a2a'), telhado: ms.mat('#3a2e26'),
      luzVerde: ms.brilho('#9affb0', 0.95), luzAmarela: ms.brilho('#fff27a', 0.9), caldeirao: ms.mat('#2a2a30'), pocao: ms.brilho('#7dff6a', 0.9),
      pedra: ms.mat('#6a6a64'), runa: ms.brilho('#b8ff8a', 0.9), olho: ms.brilho('#c6ff5a', 1), escuro: ms.mat('#14100c'), raiz: ms.mat('#4a3626'),
    };
    portaDeLuz(ms, '#6a6a5a', '#9affb0', '#e6ffd8');
    const arvoreBrejo = (x, z, e) => {
      ms.peca(GEO.cil, M.tronco, x, 2 * e, z, 0.6 * e, 4 * e, 0.6 * e, (rng() - 0.5) * 0.2, 0, (rng() - 0.5) * 0.2);
      ms.peca(GEO.ico, rng() < 0.5 ? M.copa : M.copa2, x, 4.8 * e, z, 3.4 * e, 2.2 * e, 3.4 * e, 0, rng() * 3, 0);
      for (let i = 0; i < 3; i++) { const a = rng() * Math.PI * 2; ms.peca(GEO.caixa, M.musgo, x + Math.cos(a) * 2.4 * e, 3.4 * e, z + Math.sin(a) * 2.4 * e, 0.12, 1.8 * e, 0.4 * e, 0, a, 0); }
    };
    const cogumelo = (x, z, e, mat, bate = true) => {
      ms.peca(GEO.cil, M.haste, x, e, z, 0.55 * e, 2 * e, 0.55 * e);
      ms.peca(GEO.chapeu, mat, x, 2 * e, z, 1.8 * e, 1.1 * e, 1.8 * e);
      for (let i = 0; i < 3; i++) { const a = rng() * Math.PI * 2; ms.peca(GEO.ico, M.pinta, x + Math.cos(a) * e, 2.7 * e, z + Math.sin(a) * e, 0.22 * e, 0.12 * e, 0.22 * e); }
      if (bate) ms.obst(x, z, 0.6 * e + 0.3);
    };
    const juncos = (x, z, n = 5) => { for (let i = 0; i < n; i++) ms.peca(GEO.cil, M.junco, x + (rng() - 0.5) * 1.6, 0.9, z + (rng() - 0.5) * 1.6, 0.08, 1.8 + rng(), 0.08, (rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.3); };
    const lampiao = (x, z, mat = M.luzVerde) => { ms.peca(GEO.cil, M.madeiraEsc, x, 1.3, z, 0.18, 2.6, 0.18); ms.peca(GEO.ico, mat, x, 2.8, z, 0.32, 0.42, 0.32); ms.obst(x, z, 0.3); };

    // ---- árvores do brejo nos morros e as poças com vitórias-régias ----
    nosMorros(ms, [0, 1, 2, 3, 5, 6], 150, 2, 22, (x, z) => arvoreBrejo(x, z, 0.8 + rng() * 0.7));
    for (const p of POCAS) {
      const s = SALAS[F.salaPerto(ms.o.x + p.x, ms.o.z + p.z)];
      ms.peca(GEO.disco, M.agua, p.x, s.h - 0.55, p.z, p.r + 0.3, 1, p.r + 0.3, 0, 0, 0, false);
      for (let i = 0; i < 3; i++) { const a = rng() * Math.PI * 2, r = rng() * p.r * 0.7; ms.peca(GEO.disco, M.folhaAgua, p.x + Math.cos(a) * r, s.h - 0.5, p.z + Math.sin(a) * r, 0.7, 1, 0.7, 0, 0, 0, false); if (i === 0) ms.peca(GEO.ico, M.flor, p.x + Math.cos(a) * r, s.h - 0.35, p.z + Math.sin(a) * r, 0.2, 0.15, 0.2, 0, 0, 0, false); }
      for (let i = 0; i < 4; i++) { const a = rng() * Math.PI * 2; juncos(p.x + Math.cos(a) * (p.r + 0.8), p.z + Math.sin(a) * (p.r + 0.8), 4); }
    }

    // ---- Charco das Névoas: árvores tortas e mortas ----
    {
      const centro = { x: 0, z: -64 };
      for (const p of pontosNaSala(ms, 1, 10, 3, [centro, ...POCAS], 9)) { if (rng() < 0.5) arvoreMorta(ms, M.morta, p.x, p.z, 1 + rng() * 0.5); else arvoreBrejo(p.x, p.z, 0.8); ms.obst(p.x, p.z, 0.7); }
      for (const p of pontosNaSala(ms, 1, 10, 2, [centro], 8)) juncos(p.x, p.z, 6);
      for (const p of pontosNaSala(ms, 0, 3, 3, [{ x: 0, z: 0 }], 4)) cogumelo(p.x, p.z, 0.5, M.verde, false);
    }

    // ---- Bosque dos Cogumelos: gigantes que brilham ----
    {
      const centro = { x: 14, z: -172 }, cores = [M.roxo, M.verde, M.rosa];
      for (const p of pontosNaSala(ms, 2, 11, 4, [centro], 13)) cogumelo(p.x, p.z, 2 + rng() * 2.2, cores[Math.floor(rng() * 3)]);
      for (const p of pontosNaSala(ms, 2, 26, 1.5, [centro], 9)) cogumelo(p.x, p.z, 0.4 + rng() * 0.5, cores[Math.floor(rng() * 3)], false);
      nosMorros(ms, [2], 18, 1, 8, (x, z) => cogumelo(x, z, 1.5 + rng() * 2.5, cores[Math.floor(rng() * 3)], false));
    }

    // ---- Passarela do Brejo ----
    {
      const c = F.corredores[2], L = Math.hypot(c.bx - c.ax, c.bz - c.az), ang = Math.atan2(c.ux, c.uz), px = -c.uz, pz = c.ux, ab = F.abismos[0];
      const mx = (ab.a.x + ab.b.x) / 2, mz = (ab.a.z + ab.b.z) / 2, comp = Math.hypot(ab.b.x - ab.a.x, ab.b.z - ab.a.z);
      liquido(ms, M.agua, mx, -1.1, mz, ab.r * 2 + 6, comp + ab.r * 2, ang);
      for (let s = 0; s <= L; s += 1.1) {
        const x = c.ax + c.ux * s, z = c.az + c.uz * s;
        if (F.salaEm(ms.o.x + x, ms.o.z + z) >= 0) continue;
        ms.peca(GEO.caixa, (Math.round(s / 1.1) % 3) ? M.madeira : M.madeiraEsc, x, -0.12, z, c.larg * 2 + 0.6, 0.25, 0.95, 0, ang, (rng() - 0.5) * 0.05);
      }
      for (let s = 3; s <= L - 2; s += 4.5) for (const l of [-1, 1]) {
        const x = c.ax + c.ux * s + px * (c.larg + 0.3) * l, z = c.az + c.uz * s + pz * (c.larg + 0.3) * l;
        ms.peca(GEO.cil, M.madeiraEsc, x, -0.6, z, 0.25, 2.6, 0.25);
        if (Math.round(s / 4.5) % 2 === 0 && l > 0) ms.peca(GEO.ico, M.luzVerde, x, 0.9, z, 0.3, 0.4, 0.3);
      }
      for (let n = 0; n < 26; n++) {
        const k = rng(), l = rng() < 0.5 ? -1 : 1, x = ab.a.x + (ab.b.x - ab.a.x) * k + px * (4 + rng() * 11) * l, z = ab.a.z + (ab.b.z - ab.a.z) * k + pz * (4 + rng() * 11) * l;
        if (ms.d(x, z) < 2) continue;
        if (n % 3 === 0) arvoreMorta(ms, M.morta, x, z, 0.9 + rng() * 0.5);
        else if (n % 3 === 1) ms.peca(GEO.disco, M.folhaAgua, x, -1.05, z, 0.8, 1, 0.8, 0, 0, 0, false);
        else juncos(x, z, 5);
      }
    }

    // ---- Cabana da Bruxa ----
    {
      const s = SALAS[3], hx = s.x + 12, hz = s.z - 6;
      for (const a of [-2.2, 2.2]) for (const b of [-2.2, 2.2]) ms.peca(GEO.cil, M.madeiraEsc, hx + a, 1.5, hz + b, 0.4, 3, 0.4);
      ms.peca(GEO.caixa, M.madeira, hx, 3.1, hz, 5.4, 0.4, 5.4);
      ms.peca(GEO.caixa, M.madeira, hx, 4.8, hz, 4.4, 3, 4.4, 0, 0.05, 0);
      ms.peca(GEO.cone4, M.telhado, hx, 7.6, hz, 7.2, 3.2, 7.2, 0.08, Math.PI / 4, 0.06);
      ms.peca(GEO.caixa, M.escuro, hx - 2.22, 4.4, hz + 0.6, 0.1, 2, 1.2);
      ms.peca(GEO.caixa, M.luzVerde, hx - 2.22, 5.2, hz - 1.2, 0.1, 0.8, 0.8);
      ms.peca(GEO.caixa, M.luzVerde, hx + 0.4, 5.2, hz + 2.22, 0.9, 0.8, 0.1);
      for (const q of [-0.45, 0.45]) ms.peca(GEO.caixa, M.madeiraEsc, hx - 3.6, 1.6, hz + 0.6 + q, 0.12, 3.6, 0.12, 0, 0, -0.5);
      ms.obst(hx, hz, 3.6);
      // o caldeirão que borbulha
      const cx = s.x - 12, cz = s.z + 8;
      for (let i = 0; i < 3; i++) ms.peca(GEO.caixa, M.morta, cx, 0.2, cz, 0.3, 0.3, 2.4, 0, i * 1.05, 0);
      ms.peca(GEO.cil, M.caldeirao, cx, 0.9, cz, 2.4, 1.4, 2.4);
      ms.peca(GEO.disco, M.pocao, cx, 1.62, cz, 1.05, 1, 1.05);
      const bolhas = new THREE.InstancedMesh(GEO.ico, M.pocao, 5), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), y0 = ms.y(cx, cz) + 1.6;
      bolhas.frustumCulled = false; ms.grupo.add(bolhas);
      ms.animar((dt, t) => { for (let i = 0; i < 5; i++) { const k = (t * 0.6 + i / 5) % 1; bolhas.setMatrixAt(i, m4.compose(v.set(ms.o.x + cx + Math.sin(i * 2.4) * 0.6, y0 + k * 1.6, ms.o.z + cz + Math.cos(i * 2.4) * 0.6), q, sc.setScalar(0.22 * (1 - k) + 0.05))); } bolhas.instanceMatrix.needsUpdate = true; });
      ms.obst(cx, cz, 1.5);
      // totens com olhos que brilham e lampiões
      for (const [tx, tz] of [[s.x - 18, s.z - 12], [s.x + 2, s.z + 20], [s.x - 20, s.z + 14]]) {
        for (let i = 0; i < 3; i++) ms.peca(GEO.caixa, i % 2 ? M.madeira : M.madeiraEsc, tx, 0.7 + i * 1.3, tz, 1.2, 1.3, 1.2, 0, 0.3 * i, 0);
        for (const l of [-0.28, 0.28]) ms.peca(GEO.caixa, M.luzVerde, tx + l, 3.3, tz + 0.62, 0.22, 0.16, 0.05);
        ms.peca(GEO.cone4, M.telhado, tx, 4.6, tz, 1.3, 0.9, 1.3, 0, Math.PI / 4, 0);
        ms.obst(tx, tz, 0.9);
      }
      for (const p of pontosNaSala(ms, 3, 6, 2, [{ x: s.x, z: s.z - 2 }, { x: hx, z: hz }, { x: cx, z: cz }], 9)) lampiao(p.x, p.z);
    }

    // ---- Raízes Afogadas: arcos de raízes gigantes por cima e musgo que brilha ----
    {
      const s = SALAS[4], arco = GEO.arco;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI + rng() * 0.3, e = 9 + rng() * 5, ax = s.x + (rng() - 0.5) * 8, az = s.z + (rng() - 0.5) * 8;
        ms.peca(arco, M.raiz, ax, 0, az, e * 1.6, e * 1.15, e * 1.2, 0, a, 0);
        for (const l of [-1, 1]) { const px = ax + Math.cos(a) * e * 1.6 * l, pz = az - Math.sin(a) * e * 1.6 * l; if (ms.d(px, pz) < 0) ms.obst(px, pz, 2.2); } // as pontas do arco batem
      }
      nosMorros(ms, [4], 30, 0.5, 6, (x, z) => ms.peca(GEO.caixa, M.raiz, x, 1, z, 1.1, 1.1, 6 + rng() * 6, (rng() - 0.5) * 0.6, rng() * 3, 0.3));
      for (let n = 0; n < 40; n++) { const p = ms.pontoNaSala(4, 1); ms.peca(GEO.ico, M.luzVerde, p.x, 0.12, p.z, 0.3, 0.15, 0.3); }
      for (const p of pontosNaSala(ms, 4, 8, 3, [{ x: 8, z: -372 }], 12)) { cogumelo(p.x, p.z, 0.9 + rng() * 0.7, M.verde); }
    }

    // ---- Lagoa dos Vaga-lumes: lanternas de pedra ----
    {
      for (const p of pontosNaSala(ms, 5, 8, 3, [{ x: -4, z: -460 }, ...POCAS], 9)) {
        ms.peca(GEO.caixa, M.pedra, p.x, 0.6, p.z, 0.8, 1.2, 0.8);
        ms.peca(GEO.caixa, M.luzAmarela, p.x, 1.5, p.z, 0.9, 0.6, 0.9);
        ms.peca(GEO.cone4, M.pedra, p.x, 2.15, p.z, 1.5, 0.7, 1.5, 0, Math.PI / 4, 0);
        ms.obst(p.x, p.z, 0.6);
      }
      for (const p of pontosNaSala(ms, 5, 10, 2, [{ x: -4, z: -460 }], 8)) juncos(p.x, p.z, 5);
    }

    // ---- Árvore Morta Ancestral: o tronco gigante com olhos, as raízes e as pedras de runas ----
    {
      const s = SALAS[6], tx = s.x, tz = -566;
      ms.peca(GEO.cone, M.morta, tx, 3, tz, 13, 6, 13);
      ms.peca(GEO.cil, M.morta, tx, 11, tz, 6.5, 18, 6.5, 0.04, 0, 0.03);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.4; ms.peca(GEO.caixa, M.morta, tx + Math.cos(a) * 4, 18 + (i % 3), tz + Math.sin(a) * 4, 1.2, 1.2, 12, -0.6, -a + Math.PI / 2, 0); }
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ms.peca(GEO.caixa, M.raiz, tx + Math.cos(a) * 6, 0.5, tz + Math.sin(a) * 6, 1, 1, 7, 0.15, -a + Math.PI / 2, 0); }
      for (const l of [-1.3, 1.3]) ms.peca(GEO.caixa, M.olho, tx + l, 10, tz + 3.3, 0.9, 0.5, 0.2, 0, 0, -l * 0.25);
      ms.peca(GEO.caixa, M.escuro, tx, 7.6, tz + 3.3, 2.2, 1.2, 0.2);
      ms.obst(tx, tz, 5.6);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + 0.2, x = s.x + Math.sin(a) * 20, z = s.z + Math.cos(a) * 20;
        if (z > s.z + 14 && Math.abs(x - s.x) < 9) continue;
        if (z < s.z - 13 && Math.abs(x - s.x) < 10) continue;
        ms.peca(GEO.caixa, M.pedra, x, 2.4, z, 1.5, 4.8, 1, 0, a, (rng() - 0.5) * 0.12);
        ms.peca(GEO.caixa, M.runa, x + Math.sin(a + Math.PI) * 0.52, 2.8, z + Math.cos(a + Math.PI) * 0.52, 0.6, 1.4, 0.05, 0, a, 0);
        ms.obst(x, z, 1.1);
      }
      const anel = ms.geo(new THREE.TorusGeometry(7, 0.3, 3, 40).rotateX(Math.PI / 2));
      ms.peca(anel, M.runa, s.x, 0.12, -551, 1, 1, 1);
    }
  },

  // A entrada no mapa: um tronco oco gigante, com raízes e cogumelos que brilham (escondida, sem ícone)
  entrada(b, { x, z, ang, y, obst }) {
    const fx = Math.sin(ang), fz = Math.cos(ang), sx = Math.cos(ang), sz = -Math.sin(ang);
    const P = (f, s) => ({ x: x + fx * f + sx * s, z: z + fz * f + sz * s });
    const madeira = lambert('#4a4038'), raiz = lambert('#3a2c20'), escuro = lambert('#0c0a08'), musgo = lambert('#4f7a3a'), luz = lambert('#5fe0c8', { emissive: '#5fe0c8', emissiveIntensity: 0.6 }), haste = lambert('#e8dcc8');
    const base = y(x, z), c = P(-1.6, 0);
    b.add(GEO.cone, madeira, c.x, base + 1.6, c.z, 7.4, 3.2, 7.4);
    b.add(GEO.cil, madeira, c.x, base + 5, c.z, 4.6, 10, 4.6);
    b.add(GEO.ico, musgo, c.x, base + 10.4, c.z, 3.4, 1.6, 3.4);
    const d = P(0.7, 0); b.add(GEO.caixa, escuro, d.x, base + 1.8, d.z, 2.2, 3.4, 0.4, 0, ang, 0);
    for (let i = 0; i < 7; i++) { const a = ang + (i / 7) * Math.PI * 2 + 0.4, p = { x: c.x + Math.sin(a) * 4, z: c.z + Math.cos(a) * 4 }; b.add(GEO.caixa, raiz, p.x, base + 0.4, p.z, 0.8, 0.8, 4.4, 0.2, a, 0); }
    for (const [f, s, e] of [[1.6, -2.6, 0.6], [1.2, 2.8, 0.5], [2.2, 2.2, 0.35]]) { const p = P(f, s); b.add(GEO.cil, haste, p.x, base + e, p.z, 0.5 * e, 2 * e, 0.5 * e); b.add(GEO.chapeu, luz, p.x, base + 2 * e, p.z, 1.7 * e, 1 * e, 1.7 * e); }
    obst(c.x, c.z, 3.6);
  },
};
