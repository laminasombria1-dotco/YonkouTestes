// =============================================================
// BIOMA DA FLORESTA: "Mata de Véu-Âmbar" (o guia do Lâmina)
//  - As peças (usadas nos chunks e nos lugares únicos): Carvalho-Véu (casca prateada,
//    raízes em contraforte e cortinas de âmbar), Freixo-Oco, Salgueiro-Tanino,
//    samambaia, pedra com musgo, cogumelos ciano (Lanterna-do-Brejo), Fungo-Tambor
//    dourado e tronco caído com musgo.
//  - Os lugares únicos: a Catedral das Cortinas com o Observatório Submerso (a ruína
//    circular), as Pontes de Raiz e o Pântano das Lanternas Azuis.
//  - Árvores especiais (colossais) ficam transparentes quando tampam a câmera.
// As peças usam o formato do Forno (biomas/comum.js): add(forma, tipo, x, y, z, sx, sy, sz, rx, ry, rz, cor)
// com os tipos n (normal), a (âmbar), c (ciano), o (ouro). Rotação na ordem YXZ.
// O 13º valor (D = detalhe) marca o que pode sumir de longe (nos chunks longe do jogador).
// =============================================================
import * as THREE from 'three';
import { NIVEL_AGUA } from '../mapa/gerador.js';
import { alturaEm } from '../mapa/altura.js';
import { FLORESTA } from './lugares.js';
import { Forno, MAT_FORNO, pontos, juntar, pecaDesbotavel, desbotarPeca, tampaCamera, rngDe } from './comum.js';

const D = true; // detalhe: some nos chunks longe (LOD)
export const PAL_FLORESTA = { ambar: '#d99b26', musgo: '#1e3f35', prata: '#7a8489', petroleo: '#2b4652', ciano: '#45c4b0' };
const sorteio = (r, l) => l[Math.floor(r() * l.length)];

// ---------- as peças ----------
// Carvalho-Véu: a árvore dominante (e = tamanho; 0,4 a 0,55 nas comuns, 1,3+ nas especiais)
export function carvalhoVeu(add, r, x, yy, z, e) {
  const ry = r() * 6.28;
  add('cilF', 'n', x, yy + 3.5 * e, z, 2.2 * e, 7.5 * e, 2.2 * e, 0, ry, 0, sorteio(r, ['#8a9398', '#7a8489', '#949ca0']));
  for (let i = 0; i < 5; i++) { // raízes em contraforte
    const a = ry + i * 1.257 + (r() - 0.5) * 0.4, L = (1.5 + r() * 0.5) * e;
    add('cilF', 'n', x + Math.cos(a) * (0.75 * e + L * 0.3), yy + 0.45 * e, z + Math.sin(a) * (0.75 * e + L * 0.3), 0.6 * e, L, 0.6 * e, Math.sin(a) * 2.35, 0, -Math.cos(a) * 2.35, sorteio(r, ['#7a8489', '#6f797e']), D);
  }
  const galhos = [];
  for (let i = 0; i < 3; i++) {
    const a = ry + i * 2.1 + (r() - 0.5) * 0.5, L = (3 + r() * 1.5) * e, gy = yy + (5.5 + r() * 1.5) * e;
    add('cil', 'n', x + Math.cos(a) * L * 0.45, gy + L * 0.25, z + Math.sin(a) * L * 0.45, 0.55 * e, L, 0.55 * e, Math.sin(a) * 1.1, -a, -Math.cos(a) * 1.1, '#8a9398', D);
    galhos.push({ x: x + Math.cos(a) * L * 0.85, z: z + Math.sin(a) * L * 0.85, a });
  }
  for (let i = 0; i < 5; i++) { // a copa verde-musgo
    const a = ry + i * 1.26, d = (1.5 + r() * 2.5) * e;
    add('ico', 'n', x + Math.cos(a) * d, yy + (9 + r() * 1.5) * e, z + Math.sin(a) * d, (4 + r() * 2) * e, (2.6 + r()) * e, (4 + r() * 2) * e, 0, r() * 6, 0, sorteio(r, ['#1e3f35', '#24493c', '#2c5444', '#355c3a']));
  }
  for (const g of galhos) for (let k = 0; k < 4; k++) { // cortinas de âmbar pingando dos galhos
    const t = 0.15 + k * 0.22, cx = x + (g.x - x) * t * 1.15, cz = z + (g.z - z) * t * 1.15, h = (1.6 + r() * 3.2) * e, top = yy + (5.8 + t * 1.6) * e;
    const lg = (0.12 + r() * 0.14) * e;
    add('caixa', 'a', cx, top - h / 2, cz, lg, h, 0.08 * e, 0, -g.a + 1.57, 0, '#ffffff', D);
    add('cone4', 'a', cx, top - h - lg * 0.6, cz, lg * 1.5, lg * 2, lg * 1.5, Math.PI, 0, 0, '#ffffff', D); // a gota
  }
  for (let i = 0; i < 3; i++) { // seiva escorrendo no tronco
    const a = ry + 0.5 + i * 2.2;
    add('caixa', 'a', x + Math.cos(a) * 1.08 * e, yy + (2.5 + r() * 2) * e, z + Math.sin(a) * 1.08 * e, 0.12 * e, (1.6 + r() * 2) * e, 0.06 * e, 0, -a + 1.57, 0, '#ffffff', D);
  }
}
// Freixo-Oco: esguio, claro, com a fenda escura que "canta"
export function freixoOco(add, r, x, yy, z, e) {
  const ry = r() * 6.28, inc = (r() - 0.5) * 0.25;
  add('cilF', 'n', x, yy + 2 * e, z, 0.75 * e, 4 * e, 0.75 * e, inc, ry, -inc, '#cfc6b4');
  add('cilF', 'n', x + inc * 2 * e, yy + 5.4 * e, z, 0.5 * e, 3.2 * e, 0.5 * e, -inc * 1.5, ry, inc, '#d8d0be');
  add('caixa', 'n', x + Math.cos(ry) * 0.33 * e, yy + 2.6 * e, z - Math.sin(ry) * 0.33 * e, 0.12 * e, 2 * e, 0.12 * e, 0, ry, 0, '#3a3028');
  for (let i = 0; i < 4; i++) { const a = ry + i * 1.6; add('ico', 'n', x + Math.cos(a) * 1.1 * e, yy + (5 + i * 0.6) * e, z + Math.sin(a) * 1.1 * e, 1.1 * e, 0.7 * e, 1.1 * e, 0, r() * 6, 0, sorteio(r, ['#6f7a3a', '#7d8a44', '#5f6a34'])); }
}
// Salgueiro-Tanino: tronco escuro e torto, copa caída com fios de musgo
export function salgueiro(add, r, x, yy, z, e) {
  const ry = r() * 6.28;
  add('cilF', 'n', x, yy + 1.6 * e, z, 1.2 * e, 3.4 * e, 1.2 * e, 0.15, ry, 0.1, '#3a3026');
  for (let i = 0; i < 5; i++) { const a = ry + i * 1.25; add('cone4', 'n', x + Math.cos(a) * 1.3 * e, yy + 0.4 * e, z + Math.sin(a) * 1.3 * e, 0.6 * e, 2 * e, 0.45 * e, Math.sin(a) * 2, -a, -Math.cos(a) * 2, '#3a3026', D); }
  for (let i = 0; i < 3; i++) { const a = ry + i * 2.1; add('ico', 'n', x + Math.cos(a) * 1.4 * e, yy + (4.2 + r()) * e, z + Math.sin(a) * 1.4 * e, 3 * e, 1.8 * e, 3 * e, 0, r() * 6, 0, sorteio(r, ['#3f4f2a', '#4a5a30', '#36472a'])); }
  for (let i = 0; i < 9; i++) { const a = i * 0.7 + r() * 0.3, d = (2 + r() * 1.2) * e; add('cone4', 'n', x + Math.cos(a) * d, yy + (2.6 + r() * 0.6) * e, z + Math.sin(a) * d, 0.35 * e, (2 + r() * 1.5) * e, 0.18 * e, Math.PI, a, 0, sorteio(r, ['#4a5a30', '#56663a', '#3f4f2a']), D); }
}
// Samambaia-Espelho (pequena: some de longe)
export function samambaia(add, r, x, yy, z, e) {
  for (let i = 0; i < 7; i++) { const a = i * 0.9 + r() * 0.3; add('cone4', 'n', x + Math.cos(a) * 0.55 * e, yy + 0.4 * e, z + Math.sin(a) * 0.55 * e, 0.5 * e, 1.6 * e, 0.1 * e, Math.sin(a) * 1.1, -a + 1.57, -Math.cos(a) * 1.1, sorteio(r, ['#2f6f55', '#3a8060', '#2a6048'])); }
}
// Pedra de ardósia com musgo-veludo por cima
export function pedraMusgo(add, r, x, yy, z, e) {
  const ry = r() * 6;
  add('dode', 'n', x, yy + 0.3 * e, z, 2.4 * e, 1 * e, 1.6 * e, 0, ry, 0.1, sorteio(r, ['#3a4248', '#444c52']));
  add('dode', 'n', x, yy + 0.72 * e, z, 2.1 * e, 0.4 * e, 1.4 * e, 0, ry + 0.2, 0, sorteio(r, ['#3f7a3a', '#4a8a40']));
}
// Lanterna-do-Brejo: cogumelos de chapéu ciano que brilham (mais à noite)
export function cogumelos(add, r, x, yy, z, e) {
  for (let i = 0; i < 4; i++) {
    const a = r() * 6.28, d = i ? (0.3 + r() * 0.4) * e : 0, h = (i ? 0.35 + r() * 0.3 : 0.75) * e, cx = x + Math.cos(a) * d, cz = z + Math.sin(a) * d;
    add('cil', 'n', cx, yy + h / 2, cz, 0.09 * e, h, 0.09 * e, 0, 0, 0, '#bff0e8');
    add('meia', 'c', cx, yy + h - 0.02, cz, (i ? 0.38 : 0.6) * e, (i ? 0.26 : 0.4) * e, (i ? 0.38 : 0.6) * e);
  }
}
// Fungo-Tambor: bolas douradas
export function fungoTambor(add, r, x, yy, z, e) {
  for (let i = 0; i < 5; i++) {
    const a = r() * 6.28, d = i ? 0.45 * e : 0, s = (i ? 0.35 + r() * 0.2 : 0.6) * e;
    add('cil', 'n', x + Math.cos(a) * d, yy + s * 0.4, z + Math.sin(a) * d, 0.07 * e, s * 0.8, 0.07 * e, 0, 0, 0, '#5a4028');
    add('esf', 'o', x + Math.cos(a) * d, yy + s * 0.9, z + Math.sin(a) * d, s, s, s);
  }
}
// Tronco caído com musgo (a = direção)
export function troncoCaido(add, r, x, yy, z, e, a = r() * 3) {
  add('cil', 'n', x, yy + 0.45 * e, z, 0.9 * e, 6 * e, 0.9 * e, Math.PI / 2, 0, a, '#4a3a2a');
  add('cil', 'n', x, yy + 0.85 * e, z, 0.7 * e, 5 * e, 0.4 * e, Math.PI / 2, 0, a, '#3f7a3a');
  return a;
}

// =============================================================
// Os lugares únicos da Floresta
// =============================================================
export class BiomaFloresta {
  constructor(mundo) {
    this.m = mundo;
    this.grupo = new THREE.Group();
    this.grupo.name = 'bioma-floresta';
    mundo.cena.add(this.grupo);
    this.r = rngDe(70707);
    this.areas = [];
    this.especiais = []; // árvores colossais (ficam transparentes quando tampam a câmera)
    this.ouro = []; this.ciano = []; this.nevoa = [];
    const L = FLORESTA;
    if (L.catedral) {
      mundo.reservas.push({ x: L.catedral.x, z: L.catedral.z, r: 19 });
      mundo.nomesLugares.push({ x: L.catedral.x, z: L.catedral.z, r: 17, nome: 'Catedral das Cortinas' });
      this.area(L.catedral.x, L.catedral.z, 22, (add) => this.catedral(add));
    }
    if (L.ponte) {
      mundo.reservas.push({ x: L.ponte.x, z: L.ponte.z, r: 6 }, { x: L.ponte.ax, z: L.ponte.az, r: 5 }, { x: L.ponte.bx, z: L.ponte.bz, r: 5 });
      mundo.nomesLugares.push({ x: L.ponte.x, z: L.ponte.z, r: 9, nome: 'Pontes de Raiz' });
      this.area(L.ponte.x, L.ponte.z, 14, (add) => this.ponte(add));
    }
    if (L.pantano) {
      mundo.nomesLugares.push({ x: L.pantano.x, z: L.pantano.z, r: L.pantano.r + 6, nome: 'Pântano das Lanternas Azuis' });
      this.area(L.pantano.x, L.pantano.z, L.pantano.r + 12, (add) => this.pantano(add));
    }
    this.particulas();
  }

  y(x, z) { return alturaEm(x, z) - 0.05; }
  obst(x, z, r) { this.m.obstaculos.push({ x, z, r, fixo: true }); }
  area(x, z, r, fn) { const f = new Forno(); fn(f.add.bind(f)); const g = new THREE.Group(); f.montar(g); this.grupo.add(g); this.areas.push({ g, x, z, r }); }
  // Árvore colossal: num bloco próprio que fica transparente quando tampa a câmera
  especial(fn, x, z, e, alcance) {
    const b = pecaDesbotavel(this.grupo, (add) => fn(add, this.r, x, this.y(x, z), z, e), x, z, alcance);
    this.especiais.push(b);
    this.obst(x, z, 1.1 * e);
    return b;
  }

  // ---------- A Catedral das Cortinas e o Observatório Submerso ----------
  catedral(add) {
    const c = FLORESTA.catedral, r = this.r, cy = this.y(c.x, c.z);
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3, d = 15 + r() * 2; this.especial(carvalhoVeu, c.x + Math.cos(a) * d, c.z + Math.sin(a) * d, 1.35 + r() * 0.3, 6); }
    const R = 3.4; // a ruína circular de ardósia (com uma abertura)
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 6.28; if (i === 3 || i === 4) continue;
      const h = 0.9 + ((i * 7) % 5) * 0.25;
      for (let k = 0; k < Math.ceil(h / 0.45); k++) add('caixa', 'n', c.x + Math.cos(a) * R, cy + 0.22 + k * 0.45, c.z + Math.sin(a) * R, 1.0, 0.43, 0.7, 0, -a, 0, k % 2 ? '#6a7479' : '#7a8489');
      this.obst(c.x + Math.cos(a) * R, c.z + Math.sin(a) * R, 0.6);
    }
    add('cil', 'n', c.x, cy + 0.05, c.z, 2 * R + 1.6, 0.25, 2 * R + 1.6, 0, 0, 0, '#5f696e'); add('cil', 'n', c.x, cy + 0.12, c.z, 3, 0.2, 3, 0, 0, 0, '#1a2a2e');
    add('caixa', 'n', c.x + 0.6, cy + 2.2, c.z - R + 0.3, 0.9, 3.6, 0.7, 0.05, 0.2, 0, '#7a8489'); add('caixa', 'n', c.x + 0.6, cy + 4.1, c.z - R + 0.3, 1.2, 0.3, 0.9, 0, 0.2, 0.1, '#6a7479');
    for (const [a, s] of [[0.4, 1.3], [2.6, 1.1], [4.4, 1.2], [5.6, 0.9]]) add('arco', 'n', c.x + Math.cos(a) * (R - 0.2), cy + 0.2, c.z + Math.sin(a) * (R - 0.2), 1.6 * s, 1.5 * s, 1.6 * s, 0, -a, 0, sorteio(r, ['#4a3a2a', '#3f5a30']));
    for (const [a, d] of [[1.2, 5.2], [3.3, 5], [5.1, 5.4]]) { // blocos de âmbar com silhuetas preservadas
      const x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d, yy = this.y(x, z);
      add('caixa', 'a', x, yy + 1.1, z, 1.5, 2.2, 0.9, 0.1, -a + 1.57, 0.12);
      add('caixa', 'n', x + Math.cos(a) * 0.47, yy + 1.1, z + Math.sin(a) * 0.47, 0.35, 1.3, 0.04, 0.1, -a + 1.57, 0.12, '#5a3a14');
      add('ico', 'n', x + Math.cos(a) * 0.48, yy + 1.85, z + Math.sin(a) * 0.48, 0.32, 0.32, 0.04, 0.1, -a + 1.57, 0, '#5a3a14');
      this.ouro.push(x, yy + 1.2, z); this.obst(x, z, 0.9);
    }
    for (let i = 0; i < 8; i++) { const a = r() * 6.28, d = 4.5 + r() * 4, x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; cogumelos(add, r, x, this.y(x, z), z, 0.7); this.ciano.push(x, this.y(x, z) + 0.5, z); }
    for (let i = 0; i < 6; i++) { const a = r() * 6.28, d = 5 + r() * 6, x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; samambaia(add, r, x, this.y(x, z), z, 1); }
    // raios de sol (faixas de luz falsas, somam luz)
    const mat = new THREE.MeshBasicMaterial({ color: '#ffcc66', transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    mat.userData.fixo = true; this.matRaios = mat;
    const geos = [];
    for (let i = 0; i < 5; i++) { const g = new THREE.PlaneGeometry(2.2 + r() * 1.5, 22); g.rotateZ(0.35); g.rotateY(0.6 + r() * 0.3); g.translate(c.x - 3 + i * 1.8, cy + 9, c.z - 2 + r() * 4); geos.push(g); }
    const pos = []; for (const g of geos) { const a = g.toNonIndexed().attributes.position.array; for (const v of a) pos.push(v); }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.computeBoundingSphere();
    this.raios = new THREE.Mesh(gg, mat); this.grupo.add(this.raios);
    for (let k = 0; k < 70; k++) { const a = r() * 6.28, d = r() * 14; this.nevoa.push(c.x + Math.cos(a) * d, cy + 0.3 + r() * 0.8, c.z + Math.sin(a) * d); }
    for (let k = 0; k < 60; k++) this.ouro.push(c.x + (r() - 0.5) * 24, cy + 1 + r() * 7, c.z + (r() - 0.5) * 24);
  }

  // ---------- As Pontes de Raiz ----------
  ponte(add) {
    const p = FLORESTA.ponte, r = this.r, a = p.ang, py = Math.max(this.y(p.ax, p.az), this.y(p.bx, p.bz));
    for (let i = 0; i < 6; i++) {
      const off = (i - 2.5) * 0.35, ox = -Math.sin(a) * off, oz = Math.cos(a) * off;
      add('arco', 'n', p.x + ox, py - 0.6 + (i % 3) * 0.12, p.z + oz, p.w / 2 + 0.3 + (i % 2) * 0.4, 1.1 + (i % 3) * 0.2, 1.4, (i - 2.5) * 0.08, -a, 0, sorteio(r, ['#4a3a2a', '#5a4630', '#3f3224']));
    }
    add('arco', 'n', p.x, py - 0.45, p.z, p.w / 2 + 0.5, 1.2, 3, 0, -a, 0, '#3f7a3a');
    for (const [ex, ez] of [[p.ax, p.az], [p.bx, p.bz]]) {
      this.especial(carvalhoVeu, ex + Math.sin(a) * 5 + (ex - p.x) * 0.5, ez - Math.cos(a) * 5 + (ez - p.z) * 0.5, 1.3, 6);
      for (let k = 0; k < 3; k++) { const x = ex + (r() - 0.5) * 4, z = ez + (r() - 0.5) * 4; cogumelos(add, r, x, this.y(x, z), z, 0.6); this.ciano.push(x, this.y(x, z) + 0.4, z); }
      const sx = ex + Math.sin(a) * 2.5, sz = ez - Math.cos(a) * 2.5; samambaia(add, r, sx, this.y(sx, sz), sz, 1.1);
    }
    for (let k = 0; k < 40; k++) this.nevoa.push(p.x + (r() - 0.5) * 16, NIVEL_AGUA + 0.3 + r() * 0.6, p.z + (r() - 0.5) * 16);
  }

  // ---------- O Pântano das Lanternas Azuis ----------
  pantano(add) {
    const P = FLORESTA.pantano, r = this.r, wy = NIVEL_AGUA;
    for (let i = 0; i < 6; i++) { // ilhotas de musgo
      const a = r() * 6.28, d = r() * P.r * 0.7, x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d;
      add('dode', 'n', x, wy - 0.1, z, 2 + r() * 2, 0.5, 1.5 + r() * 1.5, 0, r() * 6, 0, '#3f7a3a');
      if (r() < 0.7) { cogumelos(add, r, x, wy + 0.1, z, 0.7); this.ciano.push(x, wy + 0.6, z); }
    }
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + r() * 0.4, d = P.r + 1 + r() * 2; add('arco', 'n', P.x + Math.cos(a) * d, wy - 0.3, P.z + Math.sin(a) * d, 2.2, 1.8, 2.2, 0, -a + 1.57, 0, sorteio(r, ['#5a5048', '#4a4038'])); }
    for (let i = 0; i < 3; i++) { // troncos caídos na água, com cogumelos em cima
      const a = r() * 6.28, d = P.r * 0.8, x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d;
      const dir = troncoCaido(add, r, x, wy - 0.25, z, 1);
      for (let k = 0; k < 3; k++) { const cx = x + Math.cos(dir) * (k - 1) * 1.5, cz = z - Math.sin(dir) * (k - 1) * 1.5; cogumelos(add, r, cx, wy + 0.45, cz, 0.55); }
      this.ciano.push(x, wy + 1, z);
    }
    for (let i = 0; i < 26; i++) { // muitos cogumelos na margem
      const a = r() * 6.28, d = P.r + 1.5 + r() * 7, x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d;
      if (!FLORESTA.livre(x, z, -P.r) || alturaEm(x, z) < wy + 0.2) continue;
      cogumelos(add, r, x, this.y(x, z), z, 0.7 + r() * 0.7); if (i % 2) this.ciano.push(x, this.y(x, z) + 0.6, z);
    }
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + r() * 0.3, d = P.r + 6 + r() * 4; this.especial(salgueiro, P.x + Math.cos(a) * d, P.z + Math.sin(a) * d, 1.1 + r() * 0.3, 4); }
    for (let k = 0; k < 90; k++) { const a = r() * 6.28, d = Math.sqrt(r()) * (P.r + 6); this.nevoa.push(P.x + Math.cos(a) * d, wy + 0.3 + r() * 1.1, P.z + Math.sin(a) * d); }
    for (let k = 0; k < 50; k++) { const a = r() * 6.28, d = r() * (P.r + 8); this.ciano.push(P.x + Math.cos(a) * d, wy + 0.5 + r() * 3, P.z + Math.sin(a) * d); }
  }

  // ---------- o ar: pontinhos dourados, vaga-lumes ciano e névoa ----------
  particulas() {
    const [pos, cor] = juntar([this.ouro, '#ffb84a'], [this.ciano, '#45c4b0']);
    this.ptBrilho = pontos(pos, '#ffffff', 1.4, 0.7, true, cor); this.grupo.add(this.ptBrilho);
    this.ptNevoa = pontos(this.nevoa, '#9fc8c0', 7, 0.28, false); this.grupo.add(this.ptNevoa);
  }

  atualizar(dt, t) {
    const m = this.m, px = m.pos.x, pz = m.pos.z, dentro = !m.masmorras?.ativa;
    this.grupo.visible = dentro;
    if (!dentro) return;
    for (const a of this.areas) a.g.visible = Math.hypot(px - a.x, pz - a.z) < a.r + m.nevoa;
    for (const b of this.especiais) {
      const perto = Math.hypot(px - b.x, pz - b.z) < m.nevoa + 12;
      b.grupo.visible = perto;
      if (perto) desbotarPeca(b, tampaCamera(b, m.camera, px, pz) && Math.hypot(px - b.x, pz - b.z) < 22 ? 0.22 : 1, dt);
    }
    const f = m.fatorNoite;
    MAT_FORNO.c.emissiveIntensity = 0.5 + 0.6 * f; // os cogumelos brilham mais à noite
    this.ptBrilho.material.opacity = 0.45 + 0.5 * f;
    this.ptNevoa.position.y = Math.sin(t * 0.3) * 0.2;
    if (this.raios) this.raios.visible = f < 0.6;
  }
}
