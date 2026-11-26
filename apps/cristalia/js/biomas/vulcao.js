// =============================================================
// BIOMA VULCÂNICO: "Caldeira de Ignis-Vael" (o guia do Lâmina: fogo, lava e ácidos flamejantes)
// O esquema do guia, do fim da Estrada Real do Fogo (a entrada sul) até o vulcão do meio:
//  - Fenda das Colunas Partidas (paredões de colunas de basalto)
//  - Trilha de Basalto (lajes hexagonais com veios de lava)
//  - A Forja Primordial: a ponte de ferro sobre a fenda de lava, os pilares com correntes e
//    engrenagens, a plataforma com a bigorna colossal, o anel de lava e a cascata
//  - O rio de lava que desce do Monte Vael (o vulcão) até a fenda
//  - O Monte Vael: veios de lava descendo, pontas de rocha no cume e a pluma de fumaça
//  - A Bacia do Vitriol Ígneo: lagos de ácido verde (bloqueiam) com chamas ciano e enxofre
//  - Os Campos de Cinzas e o Cemitério de Cinza-Branca
//  - (a entrada das Cavernas de Tubos de Lava é a porta da Forja Antiga: masmorras/forja-antiga.js)
// E no bioma todo: brasas subindo, cinza caindo e, rara, a Chuva de Cinzas (só visual).
// O chão (trilha, fenda, rio, ácido) muda no gerador.js (CALDEIRA, mudarVulcao).
// As peças comuns (colunas, obsidiana, Árvores-Brasa...) saem nos chunks (as funções lá embaixo).
// =============================================================
import * as THREE from 'three';
import { NIVEL_AGUA, CALDEIRA as CV, BIOMAS, pesosEm } from '../mapa/gerador.js';
import { alturaEm } from '../mapa/altura.js';
import { Forno, pontos, juntar, rngDe } from './comum.js';

export const PAL_VULCAO = { basalto: '#1c191d', cinza: '#5c5659', magma: '#ff5e1a', nucleo: '#ffd147', acido: '#8ce62e', chama: '#2cf2c4', ferrugem: '#7a3222' };
const BAS = ['#1c191d', '#26222a', '#2e2a2c', '#221e22'];
const sorteio = (r, l) => l[Math.floor(r() * l.length)];
const Q = (ao, l) => ({ x: CV.dir.x * ao + CV.lat.x * l, z: CV.dir.z * ao + CV.lat.z * l });
const local = (x, z) => ({ ao: x * CV.dir.x + z * CV.dir.z, l: x * CV.lat.x + z * CV.lat.z });
const RY = Math.atan2(CV.dir.x, CV.dir.z);
const W = (cx, cz, ry) => (lx, lz) => ({ x: cx + lx * Math.cos(ry) + lz * Math.sin(ry), z: cz - lx * Math.sin(ry) + lz * Math.cos(ry) });
export const MONTE_VAEL = BIOMAS.find((b) => b.id === 'fogo');

// ---------- as peças comuns (formato do Forno; usadas também nos chunks) ----------
// Grupo de colunas de basalto hexagonais (rachas = veios de magma)
export function basaltoColunas(add, r, x, yy, z, e, rachas = true) {
  for (let i = 0; i < 6; i++) {
    const a = r() * 6.28, d = i ? (0.6 + r() * 0.6) * e : 0, h = (i ? 1 + r() * 1.8 : 2.4 + r()) * e, cx = x + Math.cos(a) * d, cz = z + Math.sin(a) * d;
    add('hex', 'n', cx, yy + h / 2 - 0.2, cz, 1.1 * e, h, 1.1 * e, 0, r(), 0, sorteio(r, BAS));
    add('hex', 'n', cx, yy + h - 0.15, cz, 1.12 * e, 0.08, 1.12 * e, 0, 0, 0, '#5c5659');
    if (rachas && r() < 0.6) add('caixa', 'f', cx + 0.3 * e, yy + h * 0.5, cz + 0.3 * e, 0.06, h * 0.7, 0.5 * e, 0, a, 0);
  }
}
// Cacho de obsidiana (com brilho de lava em alguns)
export function obsidiana(add, r, x, yy, z, e) {
  for (let i = 0; i < 6; i++) {
    const a = r() * 6.28, d = i ? 0.5 * e : 0, h = (i ? 1 + r() * 0.8 : 2.4) * e, t = i ? 0.4 : 0.04;
    add('octa', 'g', x + Math.cos(a) * d, yy + h * 0.4, z + Math.sin(a) * d, 0.55 * e, h, 0.55 * e, Math.cos(a) * t, r() * 3, Math.sin(a) * t);
    if (i && r() < 0.4) add('octa', 'f', x + Math.cos(a) * d * 1.05, yy + h * 0.25, z + Math.sin(a) * d * 1.05, 0.2 * e, 0.4 * e, 0.2 * e);
  }
}
// Árvore-Brasa: retorcida, seiva laranja nas fendas e folhas de cobre (folhas = false: a seca)
export function arvoreBrasa(add, r, x, yy, z, e, folhas = true) {
  const ry = r() * 6.28; let px = x, pz = z, ph = yy;
  for (let i = 0; i < 4; i++) {
    const a = ry + Math.sin(i * 1.7) * 0.6, nx = px + Math.cos(a) * 0.25 * e, nz = pz + Math.sin(a) * 0.25 * e;
    add('cilF', 'n', (px + nx) / 2, ph + 0.55 * e, (pz + nz) / 2, (0.55 - i * 0.08) * e, 1.15 * e, (0.55 - i * 0.08) * e, Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3, '#3a2a24');
    add('caixa', 'f', (px + nx) / 2 + 0.2 * e, ph + 0.55 * e, (pz + nz) / 2, 0.05, 0.9 * e, 0.12 * e, 0, a, 0.1);
    px = nx; pz = nz; ph += 1.05 * e;
  }
  for (let i = 0; i < 5; i++) {
    const a = ry + i * 1.26, L = (1.2 + r() * 0.8) * e;
    add('cilF', 'n', px + Math.cos(a) * L * 0.45, ph + L * 0.25, pz + Math.sin(a) * L * 0.45, 0.22 * e, L, 0.22 * e, Math.sin(a), -a, -Math.cos(a), '#3a2a24');
    if (folhas) add('ico', 'n', px + Math.cos(a) * L * 0.9, ph + L * 0.5 + 0.2, pz + Math.sin(a) * L * 0.9, 1.4 * e, 0.8 * e, 1.4 * e, 0, r() * 6, 0, sorteio(r, ['#c8743a', '#b8642a', '#d8884a']));
  }
  for (let i = 0; i < 4; i++) { const a = ry + i * 1.57; add('cilF', 'n', x + Math.cos(a) * 0.6 * e, yy + 0.15, z + Math.sin(a) * 0.6 * e, 0.2 * e, 1.3 * e, 0.2 * e, Math.sin(a) * 1.4, 0, -Math.cos(a) * 1.4, '#3a2a24'); }
}
// Tronco petrificado (deitado ou em pé)
export function petrificado(add, r, x, yy, z, e) {
  const a = r() * 3;
  if (r() < 0.5) add('cil', 'n', x, yy + 0.4 * e, z, 0.9 * e, 4 * e, 0.9 * e, Math.PI / 2, 0, a, '#8a8486');
  else { const h = (1.5 + r() * 2) * e; add('cilF', 'n', x, yy + h / 2, z, 0.9 * e, h, 0.9 * e, 0, 0, 0, '#9a9496'); add('cilF', 'n', x + 0.3, yy + h * 0.8, z, 0.3 * e, h * 0.5, 0.3 * e, 0.6, a, 0, '#8a8486'); }
}
// Cardo-Vitriol: suculenta azulada numa pedra com enxofre (perto do ácido)
export function cardo(add, r, x, yy, z, e) {
  add('dode', 'n', x, yy + 0.2, z, 1.6 * e, 0.6 * e, 1.4 * e, 0, r() * 6, 0, '#26222a');
  add('dode', 'e', x + 0.2, yy + 0.4 * e, z, 1.2 * e, 0.2, 1 * e, 0, r() * 6, 0);
  for (let i = 0; i < 8; i++) { const a = i * 0.785 + r() * 0.2, rr = i < 5 ? 0.35 : 0.15, t = i < 5 ? 1.1 : 0.5; add('cone4', 'n', x + Math.cos(a) * rr * e, yy + 0.75 * e, z + Math.sin(a) * rr * e, 0.35 * e, 0.8 * e, 0.12 * e, Math.sin(a) * t, -a + 1.57, -Math.cos(a) * t, sorteio(r, ['#6a8a9a', '#7a9aaa', '#5a7a8a'])); }
}
// Cristais de enxofre
export function cristaisEnxofre(add, r, x, yy, z, e) {
  for (let i = 0; i < 5; i++) { const a = r() * 6.28, d = i ? 0.4 * e : 0, h = (i ? 0.6 + r() * 0.5 : 1.3) * e; add('octa', 'e', x + Math.cos(a) * d, yy + h * 0.4, z + Math.sin(a) * d, 0.5 * e, h, 0.5 * e, Math.cos(a) * 0.4, r() * 3, Math.sin(a) * 0.4); }
}
// Minério ignita: pedras escuras com o veio laranja
export function ignita(add, r, x, yy, z, e) {
  for (let i = 0; i < 5; i++) { const a = r() * 6.28, d = i ? 0.5 * e : 0; add('dode', 'n', x + Math.cos(a) * d, yy + 0.3 * e, z + Math.sin(a) * d, 0.8 * e, 0.6 * e, 0.7 * e, r(), r() * 6, 0, sorteio(r, BAS)); }
  add('dode', 'f', x, yy + 0.25 * e, z, 1.4 * e, 0.3 * e, 1.2 * e, 0, r() * 6, 0);
  add('octa', 'f', x + 0.3, yy + 0.6 * e, z, 0.25, 0.6, 0.25, 0.3, 0, 0.2);
}
// Junco-de-Enxofre (pequeno)
export function juncoEnxofre(add, r, x, yy, z, e) {
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + r() * 0.3; add('cone', 'n', x + Math.cos(a) * 0.1, yy + 0.35 * e, z + Math.sin(a) * 0.1, 0.07 * e, 0.8 * e, 0.07 * e, Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45, sorteio(r, ['#8a8a3a', '#a8a040', '#c8b84a'])); }
}
// Fungo-Crisol: bolas laranja que brilham
export function fungoCrisol(add, r, x, yy, z, e) {
  for (let i = 0; i < 4; i++) { const a = r() * 6.28, d = i ? 0.4 * e : 0, h = (i ? 0.4 + r() * 0.3 : 0.8) * e, s = (i ? 0.35 : 0.6) * e; add('cil', 'n', x + Math.cos(a) * d, yy + h / 2, z + Math.sin(a) * d, 0.08 * e, h, 0.08 * e, 0, 0, 0, '#6a4a2a'); add('esf', 'o', x + Math.cos(a) * d, yy + h + s * 0.3, z + Math.sin(a) * d, s, s * 0.85, s); }
}

// Está no caminho ou nos lugares únicos? (os chunks não põem peças comuns ali)
export function reservadoVulcao(x, z) {
  const p = local(x, z);
  if (p.ao > CV.trilha[0] - 2 && p.ao < CV.trilha[1] + 2 && Math.abs(p.l) < 8) return true;
  if (Math.hypot(p.ao - CV.forja.ao, p.l) < CV.forja.raio + 3) return true;
  if (Math.abs(p.ao - CV.fenda) < CV.larguraFenda + 2 && Math.abs(p.l) < CV.comprimentoFenda) return true;
  const A = CV.acido; if (Math.hypot((p.ao - A.ao) / A.rx, (p.l - A.lado) / A.rz) < 1.15) return true;
  if (Math.hypot(x - CV.caverna.x, z - CV.caverna.z) < 11) return true;
  if (Math.hypot(x - MONTE_VAEL.x, z - MONTE_VAEL.z) < 10) return true;
  return false;
}

export class BiomaVulcao {
  constructor(mundo) {
    this.m = mundo;
    this.grupo = new THREE.Group();
    this.grupo.name = 'bioma-vulcao';
    mundo.cena.add(this.grupo);
    this.r = rngDe(4141);
    this.areas = []; this.brasas = []; this.verdes = []; this.fumaca = [];
    // (o enxofre e a obsidiana usam o material comum com a cor deles: menos desenhos por quadro)
    const area = (p, raio, fn) => {
      const f = new Forno(), COR = { e: '#f2d84a', g: '#1c191d' };
      fn((g, t, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0, cor) => f.add(g, COR[t] ? 'n' : t, x, y, z, sx, sy, sz, rx, ry, rz, COR[t] || cor));
      const gr = new THREE.Group(); f.montar(gr); this.grupo.add(gr); this.areas.push({ g: gr, x: p.x, z: p.z, r: raio });
    };
    area(Q(158, 0), 30, (add) => { this.fendaEntrada(add); this.trilha(add); });
    area(Q(200, -4), 30, (add) => { this.forja(add); this.rio(add); });
    area(MONTE_VAEL, 60, (add) => this.monte(add));
    area(Q(CV.acido.ao, CV.acido.lado), 34, (add) => this.bacia(add));
    area(Q(176, -40), 34, (add) => this.cinzas(add));
    mundo.reservas.push({ x: CV.caverna.x, z: CV.caverna.z, r: 10 });
    const N = mundo.nomesLugares, A = CV.acido;
    N.push({ ...Q(145, 0), r: 9, nome: 'Fenda das Colunas Partidas' }, { ...Q(196, 0), r: 13, nome: 'Forja Primordial' },
      { ...Q(A.ao, A.lado), r: 20, nome: 'Bacia do Vitriol Ígneo' }, { ...Q(176, -44), r: 12, nome: 'Cemitério de Cinza-Branca' },
      { x: MONTE_VAEL.x, z: MONTE_VAEL.z, r: 26, nome: 'Monte Vael' });
    this.particulas();
    this.chuva = { t: 0, prox: 360 + this.r() * 420, forca: 0, raio: 0 };
  }

  y(x, z) { return alturaEm(x, z) - 0.05; }
  obst(x, z, r) { this.m.obstaculos.push({ x, z, r, fixo: true }); }
  corrente(add, ax, ay, az, bx, by, bz, cai = 1.5) {
    const n = Math.max(4, Math.round(Math.hypot(bx - ax, by - ay, bz - az) / 0.7)), ry = Math.atan2(bx - ax, bz - az);
    for (let i = 0; i <= n; i++) { const t = i / n; add('elo', 'n', ax + (bx - ax) * t, ay + (by - ay) * t - Math.sin(t * Math.PI) * cai, az + (bz - az) * t, 0.7, 0.7, 0.7, 0, ry + (i % 2 ? Math.PI / 2 : 0), 0, '#3a3236'); }
  }
  engrenagem(add, x, yy, z, R, ry) {
    add('dente', 'n', x, yy, z, R, 1, R, Math.PI / 2, ry, 0, '#6a3a22');
    const P = W(x, z, ry);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.28, p = P(Math.cos(a) * R, 0); add('caixa', 'n', p.x, yy + Math.sin(a) * R, p.z, 0.35, 0.35, 0.35, 0, ry, a, '#5a3020'); }
    add('cil', 'n', x, yy, z, 0.5, 0.4, 0.5, Math.PI / 2, ry, 0, '#2a2224');
  }

  // ---------- Fenda das Colunas Partidas e a Trilha de Basalto ----------
  fendaEntrada(add) {
    const r = this.r;
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
      const p = Q(140 + i * 3, s * (9 + r() * 2));
      for (let k = 0; k < 7; k++) { const a = r() * 6.28, d = r() * 2.2, h = 3 + r() * 6, cx = p.x + Math.cos(a) * d, cz = p.z + Math.sin(a) * d; add('hex', 'n', cx, this.y(cx, cz) + h / 2 - 0.3, cz, 1.3, h, 1.3, 0, r(), 0, sorteio(r, BAS)); add('hex', 'n', cx, this.y(cx, cz) + h - 0.25, cz, 1.32, 0.1, 1.32, 0, 0, 0, '#5c5659'); }
      this.obst(p.x, p.z, 2.4);
    }
  }
  trilha(add) {
    const r = this.r;
    for (let ao = 141; ao < 188; ao += 1.15) for (let l = -2.4; l <= 2.4; l += 1.15) if (r() < 0.8) { const p = Q(ao, l + (Math.round(ao / 1.15) % 2) * 0.55); add('hex', 'n', p.x, this.y(p.x, p.z) + 0.05, p.z, 1.2, 0.16, 1.2, 0, r(), 0, sorteio(r, ['#2a2628', '#36302f', '#221e20', '#3e3634'])); }
    for (let i = 0; i < 18; i++) { const p = Q(142 + r() * 45, (r() - 0.5) * 5); add('caixa', 'f', p.x, this.y(p.x, p.z) + 0.12, p.z, 0.12, 0.04, 0.9 + r(), 0, r() * 3, 0); }
    for (let ao = 150; ao < 186; ao += 9) for (const s of [-1, 1]) { const p = Q(ao, s * 5.5); basaltoColunas(add, r, p.x, this.y(p.x, p.z), p.z, 0.8 + r() * 0.3); this.obst(p.x, p.z, 1.2); }
  }
  // ---------- A Forja Primordial ----------
  forja(add) {
    const r = this.r, C = Q(CV.fenda, 0), P = W(C.x, C.z, RY), yy = CV.hTrilha - 0.05;
    for (const s of [-1, 1]) { // os pilares (torres) dos dois lados da ponte
      const p = P(s * 3.6, -1.2);
      for (let k = 0; k < 6; k++) add('caixa', 'n', p.x, yy + k * 1.5 + 0.75, p.z, 1.9 - k * 0.05, 1.5, 1.9, 0, RY + (r() - 0.5) * 0.06, 0, k % 2 ? '#2e2a2c' : '#3a3436');
      add('caixa', 'n', p.x + s * 0.2, yy + 9.6, p.z, 1.3, 1.2, 1.3, 0.1, RY, s * 0.15, '#26222a');
      const g = P(s * 4.9, -1.2); this.engrenagem(add, g.x, yy + 3.2, g.z, 1.4, RY + Math.PI / 2);
      this.obst(p.x, p.z, 1.3);
    }
    { const p = P(0, -1.2); add('caixa', 'n', p.x, yy + 7.6, p.z, 8.2, 1.1, 1.5, 0, RY, 0, '#2e2a2c'); }
    for (const s of [-1, 1]) {
      const a = P(s * 3.6, -1.2), b = P(s * 0.8, -1.2), f = P(s * 14, -6), fy = this.y(f.x, f.z);
      this.corrente(add, b.x, yy + 7.0, b.z, b.x, yy + 3.5, b.z, 0);
      this.corrente(add, a.x, yy + 8.5, a.z, f.x, fy + 0.6, f.z, 1.2);
      add('caixa', 'n', f.x, fy + 0.5, f.z, 0.8, 1, 0.8, 0, RY, 0, '#2a2224');
    }
    for (let k = -3; k <= 3; k++) { const p = P(0, k * 1.1); add('caixa', 'n', p.x, yy + 0.1, p.z, 4.2, 0.22, 1.0, 0, RY, 0, k % 2 ? '#3a3236' : '#2e282c'); } // a ponte de ferro
    for (const s of [-1, 1]) { const a = P(s * 2.1, -4), b = P(s * 2.1, 4); this.corrente(add, a.x, yy + 1.2, a.z, b.x, yy + 1.2, b.z, 0.3); }
    // a plataforma com a bigorna colossal e o anel de lava
    const pc = Q(CV.forja.ao, 0), py = this.y(pc.x, pc.z);
    add('hex', 'n', pc.x, py - 0.4, pc.z, 13, 1, 13, 0, RY, 0, '#2a2628');
    add('toro', 'f', pc.x, py + 0.1, pc.z, 3.6, 3.6, 0.6, Math.PI / 2, 0, 0); add('toro', 'b', pc.x, py + 0.13, pc.z, 3.6, 3.6, 0.25, Math.PI / 2, 0, 0, '#ffd147');
    add('cil', 'n', pc.x, py + 0.35, pc.z, 5.4, 0.6, 5.4, 0, 0, 0, '#3a3436');
    { const b = W(pc.x, pc.z, RY + 0.4), e = 1.4;
      add('caixa', 'n', pc.x, py + 0.6 + 0.6 * e, pc.z, 1.6 * e, 1.2 * e, 1.2 * e, 0, RY + 0.4, 0, '#4a4446'); add('caixa', 'n', pc.x, py + 0.6 + 1.6 * e, pc.z, 1.0 * e, 0.8 * e, 0.9 * e, 0, RY + 0.4, 0, '#5a5456');
      add('caixa', 'n', pc.x, py + 0.6 + 2.4 * e, pc.z, 4.2 * e, 0.9 * e, 1.4 * e, 0, RY + 0.4, 0, '#7a7476'); add('caixa', 'n', pc.x, py + 0.6 + 2.88 * e, pc.z, 4.2 * e, 0.08, 1.4 * e, 0, RY + 0.4, 0, '#9a9496');
      const pt = b(2.6 * e, 0); add('cone4', 'n', pt.x, py + 0.6 + 2.4 * e, pt.z, 1.2 * e, 1.6 * e, 0.9 * e, 0, RY + 0.4, Math.PI / 2, '#7a7476');
      this.obst(pc.x, pc.z, 2.6); }
    for (const s of [-1, 1]) { const ca = P(s * 1.2, 13.2); add('caixa', 'f', ca.x, py + 0.12, ca.z, 0.8, 0.08, 4, 0, RY + s * 0.4, 0); } // os dutos de lava
    { const cs = P(4.6, 6.4); add('caixa', 'f', cs.x, py + 0.15, cs.z, 0.9, 0.1, 3, 0, RY - 0.6, 0);
      const cf = P(6.4, 4.4); add('caixa', 'f', cf.x, py - 2.2, cf.z, 1.6, 4.6, 0.6, 0, RY - 0.6, 0); add('caixa', 'b', cf.x, py - 2.2, cf.z, 0.8, 4.6, 0.65, 0, RY - 0.6, 0, '#ffd147'); // a cascata
      for (let k = 0; k < 40; k++) this.fumaca.push(cf.x + (r() - 0.5) * 4, NIVEL_AGUA + r() * 4, cf.z + (r() - 0.5) * 4);
      this.brasas.push(cf.x, py - 1, cf.z); }
    for (let i = 0; i < 6; i++) { if (i === 0 || i === 3) continue; const a = RY + i * 1.05, x = pc.x + Math.sin(a) * 7.5, z = pc.z + Math.cos(a) * 7.5, h = 0.6 + r() * 1.4; add('caixa', 'n', x, py + h / 2, z, 1.4, h, 1.4, 0, a, 0, '#2e2a2c'); this.obst(x, z, 0.9); }
    const t = P(-9, 13); arvoreBrasa(add, r, t.x, this.y(t.x, t.z), t.z, 1.5); this.obst(t.x, t.z, 0.8);
  }
  // ---------- O rio de lava: as bordas de rocha resfriada ----------
  rio(add) {
    const r = this.r;
    for (const p of CV.rio) { for (const s of [-1, 1]) { const q = { x: p.x + CV.lat.x * s * 2.6, z: p.z + CV.lat.z * s * 2.6 }; add('dode', 'n', q.x, this.y(q.x, q.z) + 0.1, q.z, 1.4, 0.5, 1.2, 0, r() * 6, 0, '#1c191d'); } this.brasas.push(p.x, NIVEL_AGUA + 0.6, p.z); }
  }
  // ---------- O Monte Vael ----------
  monte(add) {
    const r = this.r, vx = MONTE_VAEL.x, vz = MONTE_VAEL.z;
    for (let i = 0; i < 7; i++) { // veios de lava descendo
      const a = i * 0.9 + 0.3; let px = vx + Math.cos(a) * 7.5, pz = vz + Math.sin(a) * 7.5;
      for (let k = 0; k < 14; k++) {
        const d = 7.5 + k * 2.6, nx = vx + Math.cos(a + Math.sin(k * 0.7) * 0.08) * d, nz = vz + Math.sin(a + Math.sin(k * 0.7) * 0.08) * d, h0 = this.y(px, pz), h1 = this.y(nx, nz), L = Math.hypot(nx - px, nz - pz, h1 - h0);
        add('caixa', k < 4 ? 'b' : 'f', (px + nx) / 2, (h0 + h1) / 2 + 0.12, (pz + nz) / 2, 0.9 - k * 0.04, 0.12, L, Math.atan2(h0 - h1, Math.hypot(nx - px, nz - pz)), Math.atan2(nx - px, nz - pz), 0, '#ffd147');
        px = nx; pz = nz;
      }
    }
    for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28, x = vx + Math.cos(a) * 6.8, z = vz + Math.sin(a) * 6.8, h = 3 + r() * 4; add('cone4', 'n', x, this.y(x, z) + h / 2, z, 2.6, h, 2.2, (r() - 0.5) * 0.3, r(), (r() - 0.5) * 0.3, sorteio(r, BAS)); this.obst(x, z, 1.2); }
    for (let k = 0; k < 160; k++) { const h = r() * 40, rr = 2 + h * 0.35; this.fumaca.push(vx + (r() - 0.5) * rr + h * 0.3, this.y(vx, vz) + 3 + h, vz + (r() - 0.5) * rr); }
    for (let k = 0; k < 40; k++) this.brasas.push(vx + (r() - 0.5) * 8, this.y(vx, vz) + 1 + r() * 10, vz + (r() - 0.5) * 8);
  }
  // ---------- A Bacia do Vitriol Ígneo ----------
  bacia(add) {
    const r = this.r, A = CV.acido, wy = NIVEL_AGUA;
    for (const [ao, l, rx, rz] of CV.lagos) {
      const c = Q(ao, l);
      for (let k = 0; k < Math.round(rx * 0.8); k++) { // as chamas ciano dançando no ácido
        const t = r() * 6.28, d = Math.sqrt(r()) * 0.6, p = Q(ao + Math.cos(t) * rx * d, l + Math.sin(t) * rz * d), h = 1 + r() * 1.6;
        add('cone', 'v', p.x, wy + 0.1 + h / 2, p.z, 0.5 + r() * 0.4, h, 0.5 + r() * 0.4, 0, r() * 3, 0, '#2cf2c4'); add('cone', 'v', p.x + 0.3, wy + 0.1 + h * 0.35, p.z, 0.35, h * 0.6, 0.35, 0, 0, 0.2, '#2cf2c4');
        this.verdes.push(p.x, wy + 0.6, p.z);
      }
      for (let k = 0; k < 12; k++) { const t = (k / 12) * 6.28, p = Q(ao + Math.cos(t) * rx * 1.08, l + Math.sin(t) * rz * 1.08); add('dode', 'e', p.x, this.y(p.x, p.z) + 0.05, p.z, 1 + r(), 0.25, 0.8 + r() * 0.6, 0, r() * 6, 0); } // a crosta de enxofre
      if (rx > 8) { cristaisEnxofre(add, r, c.x, wy, c.z, 2.2); add('octa', 'e', c.x - 2, wy + 1.2, c.z + 1, 1.4, 3.4, 1.4, 0.2, 0, 0.1); } // a ilha de cristal de enxofre
    }
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 1.05 + r() * 0.2, p = Q(A.ao + Math.cos(a) * A.rx * d, A.lado + Math.sin(a) * A.rz * d); if (this.y(p.x, p.z) < wy + 0.3) continue; (i % 3 ? cardo : juncoEnxofre)(add, r, p.x, this.y(p.x, p.z), p.z, 1 + r() * 0.5); }
    for (let i = 0; i < 5; i++) { // fumarolas
      const a = i * 1.26 + 0.4, p = Q(A.ao + Math.cos(a) * A.rx * 0.85, A.lado + Math.sin(a) * A.rz * 0.85), yy = this.y(p.x, p.z);
      if (yy < wy + 0.3) continue;
      add('cone', 'n', p.x, yy + 0.5, p.z, 1.8, 1.1, 1.8, 0, 0, 0, '#3a3436'); add('cil', 'e', p.x, yy + 1.02, p.z, 0.6, 0.06, 0.6);
      for (let k = 0; k < 30; k++) { const h = r() * 7; this.fumaca.push(p.x + (r() - 0.5) * (0.4 + h * 0.35), yy + 1 + h, p.z + (r() - 0.5) * (0.4 + h * 0.35)); }
      this.obst(p.x, p.z, 0.9);
    }
    for (let i = 0; i < 6; i++) { const a = r() * 6.28, p = Q(A.ao + Math.cos(a) * A.rx * 1.3, A.lado + Math.sin(a) * A.rz * 1.3); basaltoColunas(add, r, p.x, this.y(p.x, p.z), p.z, 0.9, false); this.obst(p.x, p.z, 1.1); }
  }
  // ---------- Os Campos de Cinzas e o Cemitério de Cinza-Branca ----------
  cinzas(add) {
    const r = this.r;
    for (let i = 0; i < 70; i++) {
      const p = Q(140 + r() * 75, -20 - r() * 45), yy = this.y(p.x, p.z), k = r();
      if (yy < NIVEL_AGUA + 0.3 || reservadoVulcao(p.x, p.z)) continue;
      if (k < 0.3) petrificado(add, r, p.x, yy, p.z, 0.8 + r() * 0.6);
      else if (k < 0.5) { arvoreBrasa(add, r, p.x, yy, p.z, 0.8 + r() * 0.5, r() < 0.4); this.obst(p.x, p.z, 0.5); }
      else if (k < 0.75) add('ico', 'n', p.x, yy + 0.2, p.z, 4 + r() * 3, 0.8, 3 + r() * 2, 0, r() * 6, 0, sorteio(r, ['#5c5659', '#6a6467'])); // dunas de cinza
      else if (k < 0.88) ignita(add, r, p.x, yy, p.z, 0.9);
      else { obsidiana(add, r, p.x, yy, p.z, 0.8); this.obst(p.x, p.z, 0.6); }
    }
    const c = Q(176, -44), P = W(c.x, c.z, 0.4);
    for (let i = 0; i < 5; i++) { // os viajantes petrificados
      const p = P((i - 2) * 2.4, Math.sin(i) * 1.5), yy = this.y(p.x, p.z), ry = 0.4 + (r() - 0.5) * 0.4;
      add('caixa', 'n', p.x, yy + 0.55, p.z, 0.6, 1.1, 0.45, 0, ry, 0, '#d8d4cc'); add('caixa', 'n', p.x, yy + 1.45, p.z, 0.75, 0.8, 0.5, 0.15, ry, 0, '#e0dcd4'); add('ico', 'n', p.x, yy + 2.05, p.z, 0.5, 0.5, 0.5, 0, 0, 0, '#e8e4dc');
      this.obst(p.x, p.z, 0.45);
    }
    for (const [lx, lz] of [[-5, 4], [4, 5]]) { // os animais petrificados
      const p = P(lx, lz), yy = this.y(p.x, p.z), Pa = W(p.x, p.z, 0.4);
      add('caixa', 'n', p.x, yy + 1.3, p.z, 1.4, 1.2, 3.2, 0, 0.4, 0, '#d0ccc4');
      for (const [a, b] of [[-0.5, -1.1], [0.5, -1.1], [-0.5, 1.1], [0.5, 1.1]]) { const q = Pa(a, b); add('cil', 'n', q.x, yy + 0.4, q.z, 0.3, 0.9, 0.3, 0, 0, 0, '#c8c4bc'); }
      const hd = Pa(0, 2.1); add('caixa', 'n', hd.x, yy + 2.2, hd.z, 0.6, 1.6, 0.6, 0.6, 0.4, 0, '#d8d4cc'); add('caixa', 'n', hd.x, yy + 2.8, hd.z, 0.6, 0.5, 1.1, 0, 0.4, 0, '#e0dcd4');
      this.obst(p.x, p.z, 1.6);
    }
    add('ico', 'n', c.x, this.y(c.x, c.z) + 0.15, c.z, 16, 0.5, 12, 0, 0.4, 0, '#7a7477');
  }

  // ---------- brilho falso, fumaça, brasas subindo e cinza caindo ----------
  particulas() {
    const g = this.grupo;
    { const [pos, cor] = juntar([this.brasas, '#ff8a2a'], [this.verdes, '#2cf2c4']); this.ptBrilho = pontos(pos, '#ffffff', 2.8, 0.7, true, cor); g.add(this.ptBrilho); }
    this.ptFumaca = pontos(this.fumaca, '#4a3a36', 5, 0.35, false); g.add(this.ptFumaca);
    // as brasas (laranja, sobem) e a cinza (cinza, cai): acompanham o jogador
    const n = 520, pos = new Float32Array(n * 3), cor = new Float32Array(n * 3), r = this.r, ca = new THREE.Color('#ff9a3a'), cc = new THREE.Color('#3a3436');
    for (let i = 0; i < n; i++) { pos[i * 3] = (r() - 0.5) * 70; pos[i * 3 + 1] = r() * 16; pos[i * 3 + 2] = (r() - 0.5) * 70; const c = i % 2 ? ca : cc; cor.set([c.r, c.g, c.b], i * 3); }
    this.ar = pontos(pos, '#ffffff', 0.34, 0.85, false, cor);
    this.ar.frustumCulled = false; this.ar.visible = false;
    this.m.cena.add(this.ar);
  }

  // A Chuva de Cinzas (rara, só no Vulcânico): devolve a força (0 a 1) para o clima
  get forcaChuva() { return this.chuva.forca; }

  atualizar(dt, t, pausado) {
    const m = this.m, px = m.pos.x, pz = m.pos.z, dentro = !m.masmorras?.ativa;
    this.grupo.visible = dentro;
    const pv = dentro ? pesosEm(px, pz)[3] : 0; // 3 = 'fogo' (o Vulcânico) na lista dos biomas
    // a Chuva de Cinzas: de 6 a 13 minutos de Vulcânico entre uma e outra, 90 s cada
    const C = this.chuva;
    if (!pausado && pv > 0.5) {
      if (C.t > 0) {
        C.t -= dt;
        if ((C.raio -= dt) <= 0 && C.forca > 0.5) { m.relampago = 0.15; C.raio = 3 + Math.random() * 5; } // relâmpagos na pluma do Monte Vael
      } else if ((C.prox -= dt) <= 0) { C.t = 90; C.prox = 360 + Math.random() * 420; C.raio = 2; if (m.jogo.estado) m.jogo.aviso('O Monte Vael rugiu! Começou uma chuva de cinzas.'); }
    }
    const alvo = C.t > 0 && pv > 0.05 ? Math.min(1, C.t / 6, (90 - C.t) / 6 + 0.01) * pv : 0;
    C.forca += (alvo - C.forca) * Math.min(1, dt * 1.5);
    if (dentro) {
      for (const a of this.areas) a.g.visible = Math.hypot(px - a.x, pz - a.z) < a.r + m.nevoa * 0.8;
      const f = m.fatorNoite;
      this.ptBrilho.material.opacity = 0.55 + 0.45 * f;
      this.ptFumaca.position.y = (t * 0.6) % 2;
    }
    // brasas e cinza no ar: só no Vulcânico (na qualidade Fraco só durante a chuva)
    const ar = this.ar;
    ar.visible = pv > 0.05 && (m.chunks.nomeQ !== 'fraco' || C.forca > 0.05);
    if (ar.visible) {
      ar.material.opacity = (0.6 + 0.35 * C.forca) * Math.min(1, pv * 1.5);
      ar.material.size = 0.34 + 0.2 * C.forca;
      const a = ar.geometry.attributes.position, arr = a.array, sobe = dt * 1.4, cai = dt * (1 + 4 * C.forca);
      for (let i = 0; i < arr.length; i += 3) {
        if ((i / 3) % 2) { arr[i + 1] += sobe; if (arr[i + 1] > 16) arr[i + 1] -= 16; } // brasa sobe
        else { arr[i + 1] -= cai; if (arr[i + 1] < 0) arr[i + 1] += 16; }             // cinza cai
        arr[i] += Math.sin(t + i) * dt * 0.5;
      }
      a.needsUpdate = true;
      ar.position.set(px, alturaEm(px, pz) - 1, pz);
    }
  }
}
