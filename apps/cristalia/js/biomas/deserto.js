// =============================================================
// BIOMA DO DESERTO: "Areias de Djeser-Ra" (o guia do Lâmina, Antigo Egito)
// O esquema do guia, do fim da Estrada Real (a entrada sul) até o fundo do bioma:
//  - Desfiladeiro dos Pilares Partidos (paredões de arenito e pilares quebrados)
//  - Estrada Cerimonial (lajes, colunas com capitel de papiro e braseiros)
//  - Templo Solar (colunas, vigas, o portão com o disco solar alado, esfinges, obelisco caído)
//  - Avenida das Esfinges (esfinges e obeliscos de basalto com hieróglifos azuis)
//  - Planalto da Grande Necrópole (a Grande Pirâmide com o topo de ouro, a escalonada e uma menor)
//  - Oásis do Lótus Azul (tamareiras, papiro, lótus, o cais e o obelisco submerso)
//  - Mar de Dunas (a caravana soterrada e as costelas de uma criatura gigante)
//  - (o Vale das Tumbas: a entrada da Tumba das Areias, em masmorras/tumba-areias.js)
// E no deserto todo: a areia voando em volta do jogador e, de vez em quando, a
// tempestade de Khamsin (só visual). O chão do caminho é aplainado no gerador.js
// (alvoDeserto); as peças comuns (acácias, tufos...) saem nos chunks.
// Para pesar pouco: cada área vira poucas malhas (Forno) e só é desenhada de perto;
// o fogo dos braseiros e o topo de ouro são brilho falso.
// =============================================================
import * as THREE from 'three';
import { NIVEL_AGUA, LAGOS, CAMINHO_DESERTO as CD, pesosEm } from '../mapa/gerador.js';
import { alturaEm } from '../mapa/altura.js';
import { Forno, pontos, rngDe } from './comum.js';

export const PAL_DESERTO = { areia: '#e8c170', sombra: '#9e5a38', calcario: '#d9c7a3', basalto: '#2b282c', lapis: '#215e8c', turquesa: '#3ab5a8', ouro: '#f2a922' };
const CAL = ['#d9c7a3', '#d2bf98', '#e0cfac'], ARE = ['#c98a5a', '#b8784a', '#d09a66'], LAJE = ['#cfc3a8', '#bfb39a', '#d9cdb2', '#b8ab90'];
const ESCURO = '#120c08';
const sorteio = (r, l) => l[Math.floor(r() * l.length)];
const Q = (ao, l) => ({ x: CD.dir.x * ao + CD.lat.x * l, z: CD.dir.z * ao + CD.lat.z * l });
const local = (x, z) => ({ ao: x * CD.dir.x + z * CD.dir.z, l: x * CD.lat.x + z * CD.lat.z });
const RY = Math.atan2(CD.dir.x, CD.dir.z); // girar uma peça para olhar ao longo do caminho
const L0 = CD.lado;
// um ponto (lx, lz) em volta de (cx, cz), girado por ry (local +z = (sin ry, cos ry))
const W = (cx, cz, ry) => (lx, lz) => ({ x: cx + lx * Math.cos(ry) + lz * Math.sin(ry), z: cz - lx * Math.sin(ry) + lz * Math.cos(ry) });
export const OASIS = LAGOS.find((L) => L.oasis) || null;
const PIR = Q(CD.planalto.ao + 8, CD.planalto.lado); // a Grande Pirâmide

// Está no caminho ou nos lugares únicos? (os chunks não põem peças comuns ali)
export function reservadoDeserto(x, z) {
  const p = local(x, z);
  if (p.ao > CD.ao0 - 2 && p.ao < CD.ao1 + 3 && Math.abs(p.l - L0) < 16) return true;
  if (Math.hypot(x - PIR.x, z - PIR.z) < 30) return true;
  if (OASIS && Math.hypot(x - OASIS.x, z - OASIS.z) < OASIS.r + 9) return true;
  return false;
}

export class BiomaDeserto {
  constructor(mundo) {
    this.m = mundo;
    this.grupo = new THREE.Group();
    this.grupo.name = 'bioma-deserto';
    mundo.cena.add(this.grupo);
    this.r = rngDe(9191);
    this.areas = [];
    this.brasas = [];
    const t = (ao, l) => Q(ao, l);
    const area = (p, raio, fn) => { const f = new Forno(); fn(f.add.bind(f)); const g = new THREE.Group(); f.montar(g); this.grupo.add(g); this.areas.push({ g, x: p.x, z: p.z, r: raio }); };
    area(t(160, L0), 26, (add) => this.desfiladeiro(add));
    area(t(195, L0), 32, (add) => this.estrada(add, 150, 222));
    area(t(240, L0), 22, (add) => this.templo(add));
    area(t(284, L0), 30, (add) => { this.estrada(add, 256, 314); this.avenida(add); });
    area(PIR, 60, (add) => this.planalto(add));
    if (OASIS) area(OASIS, OASIS.r + 14, (add) => this.oasis(add));
    area(t(286, L0 + 58), 26, (add) => this.caravana(add));
    // nomes na tela
    const N = mundo.nomesLugares;
    N.push({ ...t(150, L0), r: 13, nome: 'Desfiladeiro dos Pilares Partidos' }, { ...t(239, L0), r: 16, nome: 'Templo Solar' },
      { ...t(285, L0), r: 20, nome: 'Avenida das Esfinges' }, { ...PIR, r: 44, nome: 'Planalto das Pirâmides' });
    if (OASIS) N.push({ x: OASIS.x, z: OASIS.z, r: OASIS.r + 8, nome: 'Oásis do Lótus Azul' });
    // os braseiros da entrada da Tumba das Areias (o hipogeu: masmorras/tumba-areias.js) também brilham
    const tb = mundo.masmorras?.entrada('tumba');
    if (tb) for (const sl of [-1, 1]) { const fx = Math.sin(tb.ang), fz = Math.cos(tb.ang), sx = Math.cos(tb.ang), sz = -Math.sin(tb.ang); const x = tb.x + fx * 2.6 + sx * sl * 2.6, z = tb.z + fz * 2.6 + sz * sl * 2.6; this.brasas.push(x, alturaEm(tb.x, tb.z) + 1.8, z); }
    this.particulas();
    this.khamsin = { t: 0, prox: 300 + this.r() * 400, forca: 0 };
  }

  y(x, z) { return alturaEm(x, z) - 0.05; }
  obst(x, z, r) { this.m.obstaculos.push({ x, z, r, fixo: true }); }

  // ---------- peças ----------
  coluna(add, x, z, h = 4.6, quebrada = false, e = 1) {
    const r = this.r, yy = this.y(x, z) - 0.3;
    add('cil', 'n', x, yy + h / 2, z, 1.05 * e, h, 1.05 * e, 0, 0, 0, sorteio(r, CAL));
    for (let k = 1; k < 4 && k * 1.1 < h; k++) add('cil', 'n', x, yy + k * 1.1, z, 1.12 * e, 0.12, 1.12 * e, 0, 0, 0, '#bca67e');
    if (!quebrada) { add('capitel', 'n', x, yy + h + 0.45 * e, z, 1.1 * e, 0.9 * e, 1.1 * e, 0, 0, 0, '#d2bf98'); add('caixa', 'n', x, yy + h + 1.0 * e, z, 1.8 * e, 0.25 * e, 1.8 * e, 0, 0, 0, '#c9b68f'); }
    add('ico', 'n', x, yy + 0.25, z, 2.2 * e, 0.7, 2.2 * e, 0, r() * 6, 0, sorteio(r, ['#e8c170', '#e2b964']));
    this.obst(x, z, 0.6 * e);
    return yy + h + (quebrada ? 0 : 1.12 * e);
  }
  braseiro(add, x, z, s = 1) {
    const yy = this.y(x, z);
    add('caixa', 'n', x, yy + 0.3, z, 1.2 * s, 0.6, 1.2 * s, 0, RY, 0, '#cdbb94');
    for (let i = 0; i < 3; i++) { const a = i * 2.09; add('cil6', 'n', x + Math.cos(a) * 0.32 * s, yy + 0.95, z + Math.sin(a) * 0.32 * s, 0.08 * s, 0.75, 0.08 * s, Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25, '#6a5a2e'); }
    add('cil', 'n', x, yy + 1.35, z, 1.1 * s, 0.3, 1.1 * s, 0, 0, 0, '#8a7a3a');
    add('cone', 'f', x, yy + 1.8, z, 0.6 * s, 0.9 * s, 0.6 * s); add('cone', 'o', x + 0.1, yy + 1.65, z, 0.32 * s, 0.6 * s, 0.32 * s);
    this.brasas.push(x, yy + 1.9, z);
    this.obst(x, z, 0.65 * s);
  }
  obelisco(add, x, z, h = 7, cor = '#2b282c') {
    const yy = this.y(x, z), P = W(x, z, RY);
    add('caixa', 'n', x, yy + 0.35, z, 1.9, 0.7, 1.9, 0, RY, 0, '#3a3638'); add('obel', 'n', x, yy + 0.7 + h / 2, z, 1.25, h, 1.25, 0, RY, 0, cor);
    add('pir', 'n', x, yy + 0.7 + h + 0.4, z, 0.92, 0.8, 0.92, 0, RY, 0, cor);
    for (const [fx, fz, rr] of [[0, 0.6, 0], [0, -0.6, 0], [0.6, 0, 1], [-0.6, 0, 1]]) for (let k = 0; k < 5; k++) { // hieróglifos azuis nas 4 faces
      const hh = yy + 1.4 + k * h * 0.17, w = 0.56 - k * 0.04, p = P(fx * (1 - k * 0.06), fz * (1 - k * 0.06));
      add('caixa', 'l', p.x, hh, p.z, rr ? 0.04 : 0.32 * w * 1.6, h * 0.11, rr ? 0.32 * w * 1.6 : 0.04, 0, RY, 0);
    }
    this.obst(x, z, 1);
  }
  obeliscoCaido(add, x, z, h, ry) {
    const yy = this.y(x, z) + 0.55, P = W(x, z, ry);
    add('obel', 'n', x, yy, z, 1.2, h, 1.2, Math.PI / 2, ry, 0.08, '#2b282c');
    const t = P(0, h / 2 + 0.4); add('pir', 'n', t.x, yy + 0.05, t.z, 1, 0.8, 1, Math.PI / 2, ry, 0, '#2b282c');
    for (let k = -2; k <= 2; k++) { const g = P(0, k * h * 0.17); add('caixa', 't', g.x, yy + 0.62, g.z, 0.28, 0.04, h * 0.12, 0, ry, 0); add('caixa', 't', g.x + Math.cos(ry) * 0.25, yy + 0.62, g.z - Math.sin(ry) * 0.25, 0.1, 0.04, h * 0.08, 0, ry, 0); }
    add('ico', 'n', x, this.y(x, z) + 0.2, z, h * 0.5, 0.6, 2, 0, ry, 0, '#e8c170');
    for (let k = -1; k <= 1; k++) { const p = P(0, k * h * 0.33); this.obst(p.x, p.z, 0.9); }
  }
  esfinge(add, x, z, ry, cabeca = true, e = 1) {
    const r = this.r, yy = this.y(x, z), P = W(x, z, ry), c = '#d9c08a', c2 = '#cdb27a';
    add('caixa', 'n', x, yy + 0.45 * e, z, 2.2 * e, 0.9 * e, 4.6 * e, 0, ry, 0, '#cdbb94');
    let p = P(0, -0.3 * e); add('caixa', 'n', p.x, yy + 1.4 * e, p.z, 1.5 * e, 1.0 * e, 2.8 * e, 0, ry, 0, c);
    p = P(0, -1.5 * e); add('caixa', 'n', p.x, yy + 1.45 * e, p.z, 1.6 * e, 1.1 * e, 1.0 * e, 0, ry, 0, c2);
    for (const s of [-0.45, 0.45]) { p = P(s * e, 1.6 * e); add('caixa', 'n', p.x, yy + 1.05 * e, p.z, 0.42 * e, 0.3 * e, 1.6 * e, 0, ry, 0, c2); }
    p = P(0, 0.95 * e); add('caixa', 'n', p.x, yy + 2.0 * e, p.z, 1.3 * e, 1.3 * e, 1.0 * e, 0, ry, 0, c);
    if (cabeca) {
      p = P(0, 1.1 * e); add('caixa', 'n', p.x, yy + 2.95 * e, p.z, 0.7 * e, 0.85 * e, 0.72 * e, 0, ry, 0, '#dcc591');
      p = P(0, 0.95 * e); add('torre', 'n', p.x, yy + 2.9 * e, p.z, 1.25 * e, 1.25 * e, 0.9 * e, 0, ry, 0, '#cdb27a');           // o lenço (nemes)
      for (const s of [-1, 1]) { p = P(s * 0.48 * e, 1.25 * e); add('caixa', 'l', p.x, yy + 2.55 * e, p.z, 0.26 * e, 0.9 * e, 0.18 * e, 0, ry, 0); }
      p = P(0, 1.48 * e); add('caixa', 'n', p.x, yy + 2.75 * e, p.z, 0.45 * e, 0.4 * e, 0.05 * e, 0, ry, 0, '#c4a874'); add('caixa', 'n', p.x, yy + 2.35 * e, p.z, 0.14 * e, 0.4 * e, 0.12 * e, 0, ry, 0, '#bca06a');
    }
    add('ico', 'n', x, yy + 0.2, z, 3 * e, 0.6, 5.5 * e, 0, ry, 0, sorteio(r, ['#e8c170', '#e2b964']));
    for (const k of [-1, 1]) { const q = P(0, k * 1.4 * e); this.obst(q.x, q.z, 1.2 * e); }
  }
  laje(add, x, z) { const r = this.r; add('caixa', 'n', x, this.y(x, z) + 0.06, z, 1.7 * (0.8 + r() * 0.4), 0.14, 1.3 * (0.8 + r() * 0.4), 0, RY + (r() - 0.5) * 0.15, (r() - 0.5) * 0.05, sorteio(r, LAJE)); }
  anfora(add, x, z, s = 1) { const yy = this.y(x, z); add('esf', 'n', x, yy + 0.45 * s, z, 0.75 * s, 0.95 * s, 0.75 * s, 0, 0, 0, sorteio(this.r, ['#a8603a', '#b8704a', '#9a5a36'])); add('cil', 'n', x, yy + 1.0 * s, z, 0.3 * s, 0.35 * s, 0.3 * s, 0, 0, 0, '#a8603a'); }
  tamareira(add, x, z, e = 1) {
    const r = this.r, yy = this.y(x, z), inc = (r() - 0.5) * 0.35, ry = r() * 6.28;
    let px = x, pz = z, ph = yy;
    for (let i = 0; i < 6; i++) {
      const nx = px + Math.sin(ry) * inc * 0.9 * e, nz = pz + Math.cos(ry) * inc * 0.9 * e;
      add('cil6', 'n', (px + nx) / 2, ph + 0.55 * e, (pz + nz) / 2, (0.62 - i * 0.04) * e, 1.15 * e, (0.62 - i * 0.04) * e, Math.cos(ry) * inc, 0, -Math.sin(ry) * inc, i % 2 ? '#8a6a44' : '#7a5a3a');
      px = nx; pz = nz; ph += 1.05 * e;
    }
    for (let i = 0; i < 9; i++) {
      const a = i * 0.7 + r() * 0.2, c = Math.cos(a), s = Math.sin(a);
      add('cone4', 'n', px + c * 0.9 * e, ph + 0.35 * e, pz + s * 0.9 * e, 0.5 * e, 2.2 * e, 0.1 * e, s * 1.25, -a + Math.PI / 2, -c * 1.25, sorteio(r, ['#3a663b', '#4a7a3a', '#2f5a30']));
      add('cone4', 'n', px + c * 2.3 * e, ph - 0.25 * e, pz + s * 2.3 * e, 0.42 * e, 1.8 * e, 0.08 * e, s * 2.1, -a + Math.PI / 2, -c * 2.1, sorteio(r, ['#3a663b', '#4a7a3a']));
    }
    for (let i = 0; i < 3; i++) { const a = r() * 6.28; add('ico', 'n', px + Math.cos(a) * 0.45 * e, ph - 0.35 * e, pz + Math.sin(a) * 0.45 * e, 0.45 * e, 0.75 * e, 0.45 * e, 0, 0, 0, '#c8962a'); } // tâmaras
    this.obst(x, z, 0.4 * e);
  }
  papiro(add, x, z, e = 1) {
    const r = this.r, yy = this.y(x, z);
    for (let i = 0; i < 6; i++) {
      const a = r() * 6.28, d = r() * 0.6, h = (1.6 + r() * 1.1) * e, cx = x + Math.cos(a) * d, cz = z + Math.sin(a) * d, t = (r() - 0.5) * 0.2;
      add('cil6', 'n', cx, yy + h / 2, cz, 0.06, h, 0.06, t, 0, t, '#5a8a3a'); add('ico', 'n', cx, yy + h, cz, 0.55 * e, 0.28 * e, 0.55 * e, 0, r() * 3, 0, sorteio(r, ['#7aaa44', '#6a9a3a']));
    }
  }
  tufo(add, x, z, e = 1) { const r = this.r, yy = this.y(x, z); for (let i = 0; i < 6; i++) { const a = i * 1.05 + r() * 0.3; add('cone', 'n', x + Math.cos(a) * 0.12, yy + 0.3 * e, z + Math.sin(a) * 0.12, 0.08 * e, 0.7 * e, 0.08 * e, Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5, sorteio(r, ['#b8a070', '#a8905e', '#c4ac7a'])); } add('ico', 'n', x, yy + 0.05, z, 0.9 * e, 0.22, 0.8 * e, 0, r() * 6, 0, '#e2b964'); }

  // ---------- Desfiladeiro dos Pilares Partidos (a entrada sul) ----------
  desfiladeiro(add) {
    const r = this.r;
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) {
      const p = Q(140 + i * 3.2, L0 + s * (10 + r() * 1.5)), h = 6 + r() * 3.5, yy = this.y(p.x, p.z) - 0.5;
      for (let k = 0; k < Math.ceil(h / 1.3); k++) add('caixa', 'n', p.x, yy + k * 1.3 + 0.65, p.z, 4 - k * 0.15 + r() * 0.5, 1.3, 3.4 + r() * 0.5, 0, RY + (r() - 0.5) * 0.2, 0, k % 2 ? '#b8714a' : '#9e5a38');
      this.obst(p.x, p.z, 1.9);
    }
    for (const s of [-1, 1]) { const p = Q(147, L0 + s * 4.6); this.coluna(add, p.x, p.z, s > 0 ? 3.2 : 5.2, s > 0); }
  }
  // ---------- Estrada Cerimonial: lajes, colunas de papiro e braseiros ----------
  estrada(add, de, ate) {
    const r = this.r;
    for (let ao = de; ao < ate; ao += 1.6) for (let l = -2.4; l <= 2.4; l += 1.6) if (r() < 0.72) { const p = Q(ao, L0 + l); this.laje(add, p.x, p.z); }
    if (de >= 222) return;
    for (let i = 0, ao = 156; ao < 222; ao += 12, i++) for (const s of [-1, 1]) {
      const p = Q(ao, L0 + s * 5.6); this.coluna(add, p.x, p.z, 4.2 + r() * 0.8, (i + (s > 0 ? 1 : 0)) % 3 === 2);
      const b = Q(ao + 6, L0 + s * 4.4); this.braseiro(add, b.x, b.z);
    }
  }
  // ---------- Templo Solar ----------
  templo(add) {
    const r = this.r, C = Q(240, L0), P = W(C.x, C.z, RY);
    for (let ao = 222; ao < 256; ao += 1.6) for (let l = -2.4; l <= 2.4; l += 1.6) if (r() < 0.72) { const p = Q(ao, L0 + l); this.laje(add, p.x, p.z); }
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { // colunas e vigas (algumas quebradas)
      const p = P(s * 8, -8 + i * 5), top = this.coluna(add, p.x, p.z, 5.2, i === 3 && s < 0, 1.15);
      if (i < 3 && !(i === 2 && s < 0)) { const q = P(s * 8, -5.5 + i * 5); add('caixa', 'n', q.x, top + 0.45, q.z, 1.6, 0.9, 5.4, 0.02, RY, (r() - 0.5) * 0.05, '#d2bf98'); }
    }
    for (const s of [-1, 1]) { // as duas torres do portão (pilone) com hieróglifos
      const p = P(s * 5.8, 10), yy = this.y(p.x, p.z);
      add('torre', 'n', p.x, yy + 4.2, p.z, 5.2, 8.4, 3.6, 0, RY, 0, sorteio(r, CAL)); add('caixa', 'n', p.x, yy + 8.55, p.z, 4.8, 0.4, 3.4, 0, RY, 0, '#c9b68f');
      for (let k = 0; k < 3; k++) { const g = P(s * 5.8, 10 - 1.85); add('caixa', 'l', g.x + Math.cos(RY) * (k - 1) * 0.9, yy + 3 + k * 1.3, g.z - Math.sin(RY) * (k - 1) * 0.9, 0.5, 0.9, 0.05, 0, RY, 0); }
      this.obst(p.x, p.z, 2.4);
    }
    { // a viga do portão com o disco solar alado e a porta escura
      const p = P(0, 10), yy = this.y(p.x, p.z);
      add('caixa', 'n', p.x, yy + 6.6, p.z, 7.2, 1.4, 2.6, 0, RY, 0, '#d9c7a3'); add('caixa', 'n', p.x, yy + 2.9, p.z, 3.6, 5.8, 1.6, 0, RY, 0, ESCURO);
      const f = P(0, 8.68); add('cil', 'n', f.x, yy + 6.6, f.z, 1.1, 0.1, 1.1, Math.PI / 2, RY, 0, '#c0502a');
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const w = P(s * (1.3 + k * 0.55), 8.66); add('caixa', k % 2 ? 'o' : 'l', w.x, yy + 6.75 - k * 0.12, w.z, 0.6, 0.22, 0.05, 0, RY, s * 0.12); }
      this.obst(p.x, p.z, 1.9);
    }
    for (let k = 0; k < 3; k++) { const p = P(0, 6.6 - k * 0.9); add('caixa', 'n', p.x, this.y(p.x, p.z) + 0.15 + (2 - k) * 0.25, p.z, 5, 0.3 + (2 - k) * 0.5, 0.9, 0, RY, 0, '#cdbb94'); }
    for (const s of [-1, 1]) { const p = P(s * 3.4, 6.2); this.braseiro(add, p.x, p.z, 1.15); }
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const p = P(s * 5.4, -6 + i * 6.5); this.esfinge(add, p.x, p.z, RY - s * Math.PI / 2, true, 0.75); }
    { const p = P(-2, -1.5); this.obeliscoCaido(add, p.x, p.z, 9, RY + 1.15); }
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { // os muros quebrados em volta
      const p = P(s * 11, -9 + i * 4.5), yy = this.y(p.x, p.z), h = 1 + r() * 2.5;
      add('caixa', 'n', p.x, yy + h / 2, p.z, 1.2, h, 4.2, 0, RY, 0, sorteio(r, CAL)); add('ico', 'n', p.x - s * 1.5, yy + 0.3, p.z, 3, 1.2, 4.5, 0, RY, 0, '#e8c170');
      this.obst(p.x, p.z, 1.3);
    }
    for (let i = 0; i < 8; i++) { const p = P((r() - 0.5) * 18, (r() - 0.5) * 18); if (Math.abs(local(p.x, p.z).l - L0) > 3) this.tufo(add, p.x, p.z, 0.9); }
  }
  // ---------- Avenida das Esfinges ----------
  avenida(add) {
    for (let i = 0, ao = 263; ao < 306; ao += 9, i++) for (const s of [-1, 1]) { const p = Q(ao, L0 + s * 7); this.esfinge(add, p.x, p.z, RY - s * Math.PI / 2, !(i === 3 && s > 0), 1.3); }
    for (const ao of [258, 308]) for (const s of [-1, 1]) { const p = Q(ao, L0 + s * 3.6); this.obelisco(add, p.x, p.z, 7.5); }
  }
  // ---------- O Planalto da Grande Necrópole ----------
  planalto(add) {
    const r = this.r;
    const yy = Math.min(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => this.y(PIR.x + a * 12, PIR.z + b * 12))) - 1;
    add('pir', 'n', PIR.x, yy + 11, PIR.z, 30, 22, 30, 0, RY, 0, '#ddcba6'); // a Grande Pirâmide
    for (let k = 0; k < 7; k++) { const t = 1 - (1.2 + k * 1.6) / 22; add('pir', 'n', PIR.x, yy + 1.2 + k * 1.6, PIR.z, 30.4 * t, 0.06, 30.4 * t, 0, RY, 0, '#c9b68f'); }
    add('pir', 'o', PIR.x, yy + 21, PIR.z, 3.1, 2.3, 3.1, 0, RY, 0); this.topo = { x: PIR.x, y: yy + 21.6, z: PIR.z };   // o topo de ouro (pyramidion)
    const P = W(PIR.x, PIR.z, RY), d = P(0, -9.3); add('caixa', 'n', d.x, yy + 3.2, d.z, 2.2, 3, 0.4, -0.85, RY, 0, ESCURO); // a entrada selada
    for (let i = 0; i < 6; i++) { const a = r() * 6.28, q = P(Math.cos(a) * 15, Math.sin(a) * 15); add('ico', 'n', q.x, this.y(q.x, q.z) + 0.4, q.z, 6, 1.6, 4, 0, a, 0, '#e8c170'); }
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; this.obst(PIR.x + Math.cos(a) * 9, PIR.z + Math.sin(a) * 9, 6); }
    this.obst(PIR.x, PIR.z, 10);
    // a pirâmide escalonada meio soterrada
    const pe = Q(CD.planalto.ao - 8, L0 - 22), ye = this.y(pe.x, pe.z) - 1.6;
    for (let k = 0; k < 6; k++) add('caixa', 'n', pe.x, ye + k * 1.5 + 0.75, pe.z, 16 - k * 2.6, 1.5, 16 - k * 2.6, 0, RY, 0, k % 2 ? '#c9b68f' : '#d2bf98');
    add('ico', 'n', pe.x + 4, ye + 2.2, pe.z + 3, 14, 4, 12, 0, 0.5, 0, '#e8c170');
    this.obst(pe.x, pe.z, 8);
    // a pirâmide menor
    const pm = Q(CD.planalto.ao - 16, L0 + 46), ym = this.y(pm.x, pm.z) - 0.6;
    add('pir', 'n', pm.x, ym + 6, pm.z, 15, 12, 15, 0, RY, 0, '#ddcba6'); add('pir', 'o', pm.x, ym + 11.6, pm.z, 1.6, 1.2, 1.6, 0, RY, 0);
    this.obst(pm.x, pm.z, 6.5);
  }
  // ---------- O Oásis do Lótus Azul ----------
  oasis(add) {
    const O = OASIS, r = this.r, wy = NIVEL_AGUA;
    for (let i = 0; i < 9; i++) { const a = i * 0.7 + r() * 0.3 + 1.2, d = O.r + 3 + r() * 4; this.tamareira(add, O.x + Math.cos(a) * d, O.z + Math.sin(a) * d, 0.95 + r() * 0.3); }
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = O.r + 0.5 + r() * 1.8; this.papiro(add, O.x + Math.cos(a) * d, O.z + Math.sin(a) * d, 0.9 + r() * 0.4); }
    for (let i = 0; i < 16; i++) { // folhas e flores de lótus azul
      const a = r() * 6.28, d = r() * O.r * 0.85, x = O.x + Math.cos(a) * d, z = O.z + Math.sin(a) * d;
      add('cil', 'n', x, wy + 0.06, z, 0.9, 0.04, 0.9, 0, r() * 3, 0, '#3a7a3a');
      if (r() < 0.55) { add('cone4', 'l', x + 0.1, wy + 0.2, z, 0.42, 0.3, 0.42, 0, r() * 3, 0); add('cone4', 'l', x + 0.1, wy + 0.24, z, 0.42, 0.3, 0.42, 0, r() * 3 + 0.8, 0); add('ico', 'o', x + 0.1, wy + 0.25, z, 0.1, 0.08, 0.1); }
    }
    const ad = Math.atan2(-O.x, -O.z) + 0.7, P = W(O.x + Math.sin(ad) * (O.r + 1.5), O.z + Math.cos(ad) * (O.r + 1.5), ad + Math.PI);
    for (let k = 0; k < 5; k++) { const p = P(0, k * 0.8 - 1.6); add('caixa', 'n', p.x, wy + 0.05 + (4 - k) * 0.3, p.z, 4.5, 0.32, 0.9, 0, ad, 0, '#d2bf98'); } // o cais em degraus
    for (const s of [-1, 1]) { const p = P(s * 2.8, -3); this.coluna(add, p.x, p.z, 3.6, false, 0.9); const w = P(s * 2.8, -5.2); add('caixa', 'n', w.x, this.y(w.x, w.z) + 1.4, w.z, 1.2, 2.8, 3.2, 0, ad, 0, sorteio(r, CAL)); this.obst(w.x, w.z, 1.2); }
    { const p = P(0, -3); add('caixa', 'n', p.x, this.y(p.x, p.z) + 4.5, p.z, 7, 0.7, 1.3, 0, ad, 0, '#d9c7a3'); }
    { const p = { x: O.x + Math.sin(ad + 2.2) * O.r * 0.4, z: O.z + Math.cos(ad + 2.2) * O.r * 0.4 }; // o obelisco submerso
      add('obel', 'n', p.x, wy + 2.2, p.z, 1.1, 6.5, 1.1, 0.42, ad + 0.6, 0.15, '#d2bf98'); add('pir', 'n', p.x + 1.3, wy + 5.2, p.z, 0.8, 0.7, 0.8, 0.42, ad + 0.6, 0.15, '#d2bf98'); }
    for (let i = 0; i < 4; i++) { const a = ad + 3 + i * 0.4, d = O.r + 9, x = O.x + Math.sin(a) * d, z = O.z + Math.cos(a) * d; add('caixa', 'n', x, this.y(x, z) + 0.6, z, 3, 1.2 + r(), 1.2, 0.05, a, 0.1, sorteio(r, CAL)); this.obst(x, z, 1.4); }
  }
  // ---------- A Caravana Soterrada e as ossadas (Mar de Dunas) ----------
  caravana(add) {
    const r = this.r, c = Q(276, L0 + 46), P = W(c.x, c.z, 0.7), yy = this.y(c.x, c.z);
    add('caixa', 'n', c.x, yy + 0.7, c.z, 2.2, 0.35, 4, 0.12, 0.7, 0.25, '#8a6a44');
    for (const s of [-1, 1]) { const p = P(s * 1.25, 0.8); add('cil', 'n', p.x, yy + 0.7, p.z, 1.4, 0.15, 1.4, 0, 0.7, Math.PI / 2 + s * 0.2, '#6a4a32'); }
    for (let i = 0; i < 4; i++) { const p = P(2.5 + r() * 2, -1 + r() * 3); if (r() < 0.5) this.anfora(add, p.x, p.z, 0.9); else add('caixa', 'n', p.x, this.y(p.x, p.z) + 0.35, p.z, 0.8, 0.7, 0.8, 0, r() * 3, 0.15, '#7a5a3a'); }
    { const p = P(-3, 2); add('cil6', 'n', p.x, this.y(p.x, p.z) + 1.6, p.z, 0.12, 3.2, 0.12, 0.15, 0, 0, '#5a4030'); add('caixa', 'n', p.x + 0.5, this.y(p.x, p.z) + 2.6, p.z, 1.1, 0.9, 0.04, 0, 0.7, 0.1, '#a83a2a'); }
    add('ico', 'n', c.x + 1, yy + 0.4, c.z - 1, 6, 1.4, 5, 0, 0.7, 0, '#e8c170');
    this.obst(c.x, c.z, 2.2);
    const o = Q(296, L0 + 70), Po = W(o.x, o.z, 0.3);
    for (let i = 0; i < 7; i++) { const p = Po(0, i * 1.6); add('arco', 'n', p.x, this.y(p.x, p.z) - 0.2, p.z, 2.4 + i * 0.12, 3 + i * 0.2, 2.6, 0, 0.3 + Math.PI / 2, 0, '#efe6cc'); }
    { const p = Po(0, -2.4); add('dode', 'n', p.x, this.y(p.x, p.z) + 0.8, p.z, 2.6, 1.8, 3.4, 0.2, 0.3, 0, '#efe6cc'); this.obst(p.x, p.z, 1.6); }
  }

  // ---------- fogo dos braseiros, o topo de ouro e a areia voando ----------
  particulas() {
    const lista = [...this.brasas]; if (this.topo) lista.push(this.topo.x, this.topo.y, this.topo.z);
    this.ptBrasa = pontos(lista, '#ffb050', 3, 0.6, true); this.grupo.add(this.ptBrasa);
    const n = 320, pos = new Float32Array(n * 3), r = this.r;
    for (let i = 0; i < n; i++) { pos[i * 3] = (r() - 0.5) * 70; pos[i * 3 + 1] = r() * 6; pos[i * 3 + 2] = (r() - 0.5) * 70; }
    this.areia = pontos(pos, '#f2dca0', 0.4, 0.5, false);
    this.areia.frustumCulled = false; this.areia.visible = false;
    this.m.cena.add(this.areia);
  }

  // A tempestade de Khamsin (rara, só no Deserto): devolve a força (0 a 1) para o clima
  get forcaKhamsin() { return this.khamsin.forca; }

  atualizar(dt, t, pausado) {
    const m = this.m, px = m.pos.x, pz = m.pos.z, dentro = !m.masmorras?.ativa;
    this.grupo.visible = dentro;
    const pd = dentro ? pesosEm(px, pz)[2] : 0; // 2 = 'terra' (o Deserto) na lista dos biomas
    // Khamsin: de 5 a 12 minutos de deserto entre uma e outra, 90 s cada
    const K = this.khamsin;
    if (!pausado && pd > 0.5) {
      if (K.t > 0) K.t -= dt;
      else if ((K.prox -= dt) <= 0) { K.t = 90; K.prox = 300 + Math.random() * 420; if (m.jogo.estado) m.jogo.aviso('Uma tempestade de areia (Khamsin) chegou! O céu ficou ocre.'); }
    }
    const alvo = K.t > 0 && pd > 0.05 ? Math.min(1, K.t / 6, (90 - K.t) / 6 + 0.01) * pd : 0;
    K.forca += (alvo - K.forca) * Math.min(1, dt * 1.5);
    if (dentro) {
      for (const a of this.areas) a.g.visible = Math.hypot(px - a.x, pz - a.z) < a.r + m.nevoa + 10;
      const f = m.fatorNoite;
      this.ptBrasa.material.opacity = 0.5 + 0.5 * f;
      this.ptBrasa.material.size = 2.6 + 1.2 * f;
    }
    // a areia voando: só no Deserto (e não na qualidade Fraco, menos na tempestade)
    const ar = this.areia;
    ar.visible = pd > 0.05 && (m.chunks.nomeQ !== 'fraco' || K.forca > 0.05);
    if (ar.visible) {
      ar.material.opacity = (0.35 + 0.5 * K.forca) * Math.min(1, pd * 1.5);
      ar.material.size = 0.4 + 0.25 * K.forca;
      const a = ar.geometry.attributes.position, arr = a.array, vento = dt * (3 + 14 * K.forca);
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] += vento; arr[i + 1] += Math.sin(t * 2 + i) * dt * 0.4;
        if (arr[i] > 35) { arr[i] -= 70; arr[i + 1] = Math.random() * 6; }
      }
      a.needsUpdate = true;
      ar.position.set(px, alturaEm(px, pz), pz);
    }
  }
}

// ---------- peças comuns do Deserto (usadas nos chunks; formato do Forno) ----------
const sorteioR = (r, l) => l[Math.floor(r() * l.length)];
// Acácia-do-Vento: baixa, retorcida, copa achatada
export function acacia(add, r, x, yy, z, e) {
  const ry = r() * 6.28, cx = x + Math.cos(ry) * 0.45 * e, cz = z - Math.sin(ry) * 0.45 * e;
  add('cil6', 'n', x, yy + 0.8 * e, z, 0.35 * e, 1.7 * e, 0.35 * e, 0.25, ry, 0, '#5a4030');
  add('cil6', 'n', cx, yy + 2.0 * e, cz, 0.25 * e, 1.2 * e, 0.25 * e, -0.5, ry, 0.3, '#5a4030');
  add('ico', 'n', cx + 0.3, yy + 2.75 * e, cz, 3.6 * e, 0.6 * e, 3 * e, 0, ry, 0, sorteioR(r, ['#7a8a40', '#6f7f3a', '#8a9448']));
}
// Tufo seco (Espinho-de-Areia) com o montinho de areia em volta
export function tufoSeco(add, r, x, yy, z, e) {
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + r() * 0.3; add('cone', 'n', x + Math.cos(a) * 0.12, yy + 0.3 * e, z + Math.sin(a) * 0.12, 0.08 * e, 0.7 * e, 0.08 * e, Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5, sorteioR(r, ['#b8a070', '#a8905e', '#c4ac7a'])); }
  add('ico', 'n', x, yy + 0.05, z, 0.9 * e, 0.22, 0.8 * e, 0, r() * 6, 0, '#e2b964');
}
// Pedra de arenito
export function pedraArenito(add, r, x, yy, z, e) { add('dode', 'n', x, yy + 0.3 * e, z, 1.8 * e, 1.1 * e, 1.5 * e, r(), r() * 6, 0.1, sorteioR(r, ARE)); }
// Pedaço de coluna caída ou bloco de calcário meio enterrado
export function fragmento(add, r, x, yy, z, e) {
  if (r() < 0.5) add('cil', 'n', x, yy + 0.25 * e, z, 1.05 * e, 0.9 * e, 1.05 * e, Math.PI / 2, r() * 6, 0, sorteioR(r, CAL));
  else add('caixa', 'n', x, yy + 0.25 * e, z, 1.4 * e, 0.7 * e, 0.9 * e, 0.1, r() * 6, 0.08, sorteioR(r, CAL));
  add('ico', 'n', x, yy + 0.05, z, 1.6 * e, 0.3, 1.2 * e, 0, r() * 6, 0, '#e2b964');
}
// Ânfora de barro
export function anforaBarro(add, r, x, yy, z, e) {
  add('esf', 'n', x, yy + 0.45 * e, z, 0.75 * e, 0.95 * e, 0.75 * e, 0, 0, 0, sorteioR(r, ['#a8603a', '#b8704a', '#9a5a36']));
  add('cil', 'n', x, yy + 1.0 * e, z, 0.3 * e, 0.35 * e, 0.3 * e, 0, 0, 0, '#a8603a');
}
