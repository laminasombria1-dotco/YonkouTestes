// =============================================================
// BIOMA DO ARQUIPÉLAGO: "Arquipélago das Marés de Safira" (o guia do Lâmina)
// O chão não muda (as ilhas, a água rasa e os canais são os da semente). Peças únicas:
//  - Enseada dos Bangalôs: bangalôs de palha sobre a água, píer com lanternas, barco a remo,
//    rede entre coqueiros inclinados, amendoeiras, hibisco e buganvília
//  - a ilha vulcânica verdejante com a cachoeira e as falésias, e o arco de pedra no mar
//  - o farol antigo, a torre de vigia e o manguezal
//  - o naufrágio coberto de corais e o atol
//  - (a gruta marinha é a entrada da Gruta das Marés: masmorras/gruta-mares.js)
// E no bioma todo: 4 veleiros andando nos canais, o plâncton que brilha à noite na água rasa
// e, rara, a chuva morna que termina com um arco-íris (só visual).
// Os coqueiros grandes usam o material que fica transparente quando tampa a câmera (tipo p).
// As peças comuns (coqueiros, flores, corais...) saem nos chunks (as funções lá embaixo).
// =============================================================
import * as THREE from 'three';
import { NIVEL_AGUA as NA, pesosEm } from '../mapa/gerador.js';
import { alturaEm } from '../mapa/altura.js';
import { ARQ } from './lugares.js';
import { Forno, pontos, juntar, rngDe, texturaBrilho } from './comum.js';

const sorteio = (r, l) => l[Math.floor(r() * l.length)];
const FOLHA = ['#3a8a3a', '#4a9a3a', '#2f7a30', '#5aaa44'];
const CAL = ['#d9c28a', '#cdb47a', '#e2cc96'];
const W = (cx, cz, ry) => (lx, lz) => ({ x: cx + lx * Math.cos(ry) + lz * Math.sin(ry), z: cz - lx * Math.sin(ry) + lz * Math.cos(ry) });

// ---------- as peças comuns (formato do Forno; usadas também nos chunks) ----------
// Coqueiro inclinado com cocos (dir = para onde inclina; o tronco e as folhas são do tipo p: desbotam)
// (o centro para desbotar fica perto da copa, que é o que tampa a câmera: o coqueiro é inclinado)
export function coqueiro(add0, r, x, yy, z, e, dir = null) {
  const ry = dir ?? r() * 6.28, inc = 0.18 + r() * 0.2; let px = x, pz = z, ph = yy;
  let lean = 0; for (let i = 0; i < 7; i++) lean += inc * (1 + i * 0.12) * 1.1 * e;
  const cx = x + Math.sin(ry) * lean * 0.7, cz = z + Math.cos(ry) * lean * 0.7;
  const add = (g, t, ...a) => add0(g, t, ...a.slice(0, 9), a[9] ?? '#ffffff', undefined, cx, cz);
  for (let i = 0; i < 7; i++) {
    const k = inc * (1 + i * 0.12), nx = px + Math.sin(ry) * k * 1.1 * e, nz = pz + Math.cos(ry) * k * 1.1 * e;
    add('cil6', 'p', (px + nx) / 2, ph + 0.55 * e, (pz + nz) / 2, (0.5 - i * 0.035) * e, 1.15 * e, (0.5 - i * 0.035) * e, Math.cos(ry) * k, 0, -Math.sin(ry) * k, i % 2 ? '#9a7a52' : '#8a6a46');
    px = nx; pz = nz; ph += 1.08 * e;
  }
  for (let i = 0; i < 8; i++) {
    const a = i * 0.785 + r() * 0.2, c = Math.cos(a), s = Math.sin(a);
    add('cone4', 'p', px + c * 1.3 * e, ph - 0.1 * e, pz + s * 1.3 * e, 0.55 * e, 2.9 * e, 0.1 * e, s * 1.5, -a + Math.PI / 2, -c * 1.5, sorteio(r, FOLHA));
    add('cone4', 'p', px + c * 2.6 * e, ph - 0.85 * e, pz + s * 2.6 * e, 0.45 * e, 1.6 * e, 0.08 * e, s * 2.3, -a + Math.PI / 2, -c * 2.3, sorteio(r, FOLHA));
  }
  for (let i = 0; i < 3; i++) add('esf', 'p', px + Math.cos(i * 2.1) * 0.3 * e, ph - 0.3 * e, pz + Math.sin(i * 2.1) * 0.3 * e, 0.42 * e, 0.42 * e, 0.42 * e, 0, 0, 0, '#6a4a26');
}
// Amendoeira-da-praia: copa larga em andares
export function amendoeira(add, r, x, yy, z, e) {
  const ry = r() * 6;
  add('cilF', 'n', x, yy + 1.2 * e, z, 0.7 * e, 2.4 * e, 0.7 * e, 0.1, ry, 0, '#6a5038');
  for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) { const a = ry + i * 1.57 + k, d = (1.2 + k * 0.4) * e; add('ico', 'n', x + Math.cos(a) * d, yy + (2.4 + k * 0.55) * e, z + Math.sin(a) * d, (2.6 - k * 0.4) * e, 0.6 * e, (2.6 - k * 0.4) * e, 0, r() * 6, 0, sorteio(r, ['#4a8a2e', '#5a9a34', '#3f7a2a'])); }
}
// Moita de hibisco ou buganvília (flores coral, magenta e amarelas)
export function flores(add, r, x, yy, z, e) {
  add('ico', 'n', x, yy + 0.5 * e, z, 1.6 * e, 1.1 * e, 1.4 * e, 0, r() * 6, 0, sorteio(r, ['#2f7a30', '#3a8a3a']));
  for (let i = 0; i < 7; i++) { const a = r() * 6.28; add('ico', 'n', x + Math.cos(a) * 0.65 * e, yy + (0.6 + r() * 0.45) * e, z + Math.sin(a) * 0.55 * e, 0.3 * e, 0.22 * e, 0.3 * e, 0, r() * 3, 0, sorteio(r, ['#ff5a5a', '#ff7a3a', '#e83a9a', '#c83ac8', '#ffd23f'])); }
}
export function bananeira(add, r, x, yy, z, e) {
  add('cilF', 'n', x, yy + 1.1 * e, z, 0.45 * e, 2.2 * e, 0.45 * e, 0, 0, 0, '#7a8a3a');
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + r() * 0.3, c = Math.cos(a), s = Math.sin(a); add('cone4', 'n', x + c * 1.1 * e, yy + 2.4 * e, z + s * 1.1 * e, 0.9 * e, 2.4 * e, 0.06 * e, s * 1.2, -a + Math.PI / 2, -c * 1.2, sorteio(r, ['#6ab83a', '#5aa834', '#7ac844'])); }
}
export function bambu(add, r, x, yy, z, e) {
  for (let i = 0; i < 7; i++) { const a = r() * 6.28, d = r() * 0.7 * e, h = (4 + r() * 2.5) * e, t = (r() - 0.5) * 0.12; add('cil6', 'n', x + Math.cos(a) * d, yy + h / 2, z + Math.sin(a) * d, 0.16, h, 0.16, t, 0, t, sorteio(r, ['#9ab84a', '#8aa83e'])); add('cone4', 'n', x + Math.cos(a) * d, yy + h, z + Math.sin(a) * d, 0.8, 1.2, 0.2, 0.6, a, 0, '#5aa834'); }
}
export function samambaiaTropical(add, r, x, yy, z, e) {
  for (let i = 0; i < 7; i++) { const a = i * 0.9 + r() * 0.3; add('cone4', 'n', x + Math.cos(a) * 0.55 * e, yy + 0.4 * e, z + Math.sin(a) * 0.55 * e, 0.5 * e, 1.6 * e, 0.1 * e, Math.sin(a) * 1.1, -a + 1.57, -Math.cos(a) * 1.1, sorteio(r, ['#3a9a44', '#4aaa4a', '#2f8a3a'])); }
}
export function pedraCalcaria(add, r, x, yy, z, e) { add('dode', 'n', x, yy + 0.25 * e, z, 1.6 * e, 1 * e, 1.4 * e, r(), r() * 6, 0, sorteio(r, ['#d9c28a', '#cdb47a', '#a8a08a'])); }
// Coral colorido no fundo da água rasa (yy = o fundo)
export function coral(add, r, x, yy, z, e) {
  const cor = sorteio(r, ['#ff6a8a', '#ff9a3a', '#b46aff', '#ffd23f', '#ff5a5a', '#ff7ab8']), k = r();
  if (k < 0.4) for (let i = 0; i < 4; i++) add('cone', 'n', x + (r() - 0.5) * e, yy + 0.4 * e, z + (r() - 0.5) * e, 0.4 * e, (1.2 + r() * 0.6) * e, 0.4 * e, (r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6, cor);
  else if (k < 0.75) add('esf', 'n', x, yy + 0.3 * e, z, 1.5 * e, 0.9 * e, 1.5 * e, 0, 0, 0, cor);
  else add('meia', 'n', x, yy, z, 1.8 * e, 0.6 * e, 1.8 * e, 0, r() * 3, 0, cor);
}
// Estrela-do-mar ou concha na areia
export function conchinha(add, r, x, yy, z, e) {
  if (r() < 0.5) add('cone', 'n', x, yy + 0.04, z, 0.6 * e, 0.08, 0.6 * e, 0, r() * 3, 0, sorteio(r, ['#ff7a3a', '#ff5a8a']));
  else add('meia', 'n', x, yy, z, 0.5 * e, 0.35 * e, 0.6 * e, 0, r() * 3, 0, sorteio(r, ['#fff0e0', '#ffc8b0']));
}

export class BiomaArquipelago {
  constructor(mundo) {
    this.m = mundo;
    this.grupo = new THREE.Group();
    this.grupo.name = 'bioma-arquipelago';
    mundo.cena.add(this.grupo);
    this.r = rngDe(6161);
    this.areas = []; this.luzes = []; this.respingo = [];
    const L = ARQ;
    const area = (p, raio, fn) => { const f = new Forno(); fn(f); const g = new THREE.Group(); f.montar(g); this.grupo.add(g); this.areas.push({ g, x: p.x, z: p.z, r: raio }); };
    const R = mundo.reservas;
    if (L.enseada.costa) { R.push({ x: L.enseada.costa.x, z: L.enseada.costa.z, r: 14 }); area(L.enseada.costa, 22, (f) => this.enseada(f)); }
    R.push({ x: L.vulcao.x, z: L.vulcao.z, r: 17 }, { x: L.arco.x, z: L.arco.z, r: 8 }, { x: L.farol.x, z: L.farol.z, r: 12 }, { x: L.nau.x, z: L.nau.z, r: 7 }, { x: L.atol.x, z: L.atol.z, r: 12 });
    area(L.vulcao, 34, (f) => { this.vulcao(f); this.arco(f); });
    area(L.farol, 26, (f) => this.farol(f));
    area(L.nau, 20, (f) => { this.naufragio(f); this.atol(f); });
    const N = mundo.nomesLugares;
    if (L.enseada.costa) N.push({ x: L.enseada.costa.x, z: L.enseada.costa.z, r: 13, nome: 'Enseada dos Bangalôs' });
    N.push({ x: L.vulcao.x, z: L.vulcao.z, r: 22, nome: 'Ilha da Cachoeira' }, { x: L.arco.x, z: L.arco.z, r: 9, nome: 'Arco de Pedra' },
      { x: L.farol.x, z: L.farol.z, r: 14, nome: 'Farol Antigo' }, { x: L.nau.x, z: L.nau.z, r: 8, nome: 'Naufrágio do Mercante' }, { x: L.atol.x, z: L.atol.z, r: 11, nome: 'Atol de Coral' });
    this.veleiros();
    this.particulas();
    this.chuva = { t: 0, prox: 420 + this.r() * 420, forca: 0, arco: 0 };
  }

  y(x, z) { return alturaEm(x, z) - 0.05; }
  obst(x, z, r) { this.m.obstaculos.push({ x, z, r, fixo: true }); }
  // um coqueiro que desbota na frente da câmera
  coq(f, x, z, e, dir) { f.centro = [x, z]; coqueiro(f.add.bind(f), this.r, x, this.y(x, z), z, e, dir); f.centro = null; this.obst(x, z, 0.45 * e); }
  lanterna(add, x, z, yy) { add('cil', 'n', x, yy + 0.6, z, 0.12, 1.2, 0.12, 0, 0, 0, '#5a4030'); add('caixa', 'b', x, yy + 1.35, z, 0.3, 0.42, 0.3, 0, 0, 0, '#ffc070'); add('cone4', 'n', x, yy + 1.65, z, 0.42, 0.22, 0.42, 0, 0.785, 0, '#3a3024'); this.luzes.push(x, yy + 1.35, z); }
  barco(add, x, z, ry, yy = NA + 0.05) {
    const P = W(x, z, ry);
    add('caixa', 'n', x, yy + 0.05, z, 1.2, 0.3, 3, 0, ry, 0, '#7a5232');
    for (const s of [-1, 1]) { const p = P(s * 0.6, 0); add('caixa', 'n', p.x, yy + 0.3, p.z, 0.1, 0.5, 3, 0, ry, s * 0.2, '#8a6240'); const pp = P(0, s * 1.6); add('cone4', 'n', pp.x, yy + 0.25, pp.z, 1.05, 0.6, 0.6, s * Math.PI / 2, ry + 0.785, 0, '#8a6240'); }
    add('caixa', 'n', x, yy + 0.4, z, 1.1, 0.08, 0.3, 0, ry, 0, '#9a7250');
    const re = P(0.9, 0.3); add('caixa', 'n', re.x, yy + 0.45, re.z, 0.08, 0.06, 2.4, 0, ry + 0.4, 0.3, '#6a4a30');
    this.obst(x, z, 1.2);
  }

  // ---------- A Enseada dos Bangalôs ----------
  enseada(f) {
    const add = f.add.bind(f), r = this.r, { ilha, costa: c } = ARQ.enseada, a = c.a, P = W(c.x, c.z, a);
    for (let k = 0; k < 7; k++) { // o píer (com lanternas)
      const p = P(0, k * 1.3 - 1); add('caixa', 'n', p.x, NA + 0.55, p.z, 2.2, 0.15, 1.2, 0, a, 0, k % 2 ? '#9a7048' : '#8a6040'); this.obst(p.x, p.z, 1.1);
      if (k % 2 === 0) for (const s of [-1, 1]) { const q = P(s * 1.05, k * 1.3 - 1); add('cil', 'n', q.x, NA - 0.2, q.z, 0.25, 1.8, 0.25, 0, 0, 0, '#6a4a30'); if (k > 0 && s > 0) this.lanterna(add, q.x, q.z, NA + 0.6); }
    }
    const T0 = P(0, 8.5); for (let k = 0; k < 6; k++) { const p = W(T0.x, T0.z, a)(k * 1.3 + 1.2, 0); add('caixa', 'n', p.x, NA + 0.55, p.z, 1.2, 0.15, 2.2, 0, a, 0, k % 2 ? '#9a7048' : '#8a6040'); this.obst(p.x, p.z, 1.1); }
    for (const [lx, lz] of [[3.6, 11], [8.6, 10.5]]) { // os bangalôs de palha sobre a água
      const b = P(lx, lz), Pb = W(b.x, b.z, a + Math.PI), by = NA + 0.6;
      for (const [ox, oz] of [[-1.8, -1.6], [1.8, -1.6], [-1.8, 1.6], [1.8, 1.6], [-1.8, -3.4], [1.8, -3.4]]) { const q = Pb(ox, oz); add('cil', 'n', q.x, by - 0.9, q.z, 0.26, 2.2, 0.26, 0, 0, 0, '#5a4028'); }
      add('caixa', 'n', b.x, by + 0.08, b.z, 4.2, 0.2, 7.2, 0, a, 0, '#8a6040'); add('caixa', 'n', b.x, by + 1.3, b.z, 3.4, 2.3, 3.4, 0, a, 0, '#9a7048');
      add('cone4', 'n', b.x, by + 3.3, b.z, 5.4, 2.0, 5.4, 0, a + 0.785, 0, '#b89a5a'); add('cone4', 'n', b.x, by + 3.32, b.z, 5.6, 0.25, 5.6, 0, a + 0.785, 0, '#a88a4a');
      for (const s of [-1, 1]) { const w = Pb(s * 0.8, -1.72); add('caixa', 'b', w.x, by + 1.5, w.z, 0.7, 0.6, 0.05, 0, a, 0, '#ffc070'); this.luzes.push(w.x, by + 1.5, w.z); }
      const pd = Pb(0, -1.72); add('caixa', 'n', pd.x, by + 1, pd.z, 0.8, 1.6, 0.05, 0, a, 0, '#5a3a22');
      for (let i = 0; i < 6; i++) { const q = Pb(-2 + i * 0.8, -3.6); add('caixa', 'n', q.x, by + 0.55, q.z, 0.08, 0.8, 0.08, 0, a, 0, '#6a4a30'); }
      const rl = Pb(0, -3.6); add('caixa', 'n', rl.x, by + 0.95, rl.z, 4.2, 0.08, 0.1, 0, a, 0, '#6a4a30');
      this.obst(b.x, b.z, 2.4); const fr = Pb(0, -2.6); this.obst(fr.x, fr.z, 1.8);
    }
    this.barco(add, P(-2.2, 5).x, P(-2.2, 5).z, a + 0.3);
    for (const i of [-4, -2, 1, 3, 4]) { const p = P(i * 3.4, -2.5 - Math.abs(i) * 0.4); this.coq(f, p.x, p.z, 1 + r() * 0.2, a + (r() - 0.5) * 0.6); } // coqueiros inclinados sobre a água
    { const p1 = P(-5.5, -5), p2 = P(-2.5, -5.6); this.coq(f, p1.x, p1.z, 1, a + 0.4); this.coq(f, p2.x, p2.z, 1, a - 0.2); // a rede
      const L = Math.hypot(p2.x - p1.x, p2.z - p1.z), ry = Math.atan2(p2.x - p1.x, p2.z - p1.z), h0 = this.y(p1.x, p1.z) + 1.6, cai = 0.6, inc = Math.atan2(cai, L / 2);
      for (const t of [0.25, 0.75]) { const x = p1.x + (p2.x - p1.x) * t, z = p1.z + (p2.z - p1.z) * t; add('caixa', 'n', x, h0 - cai / 2, z, 0.9, 0.05, L / 2 + 0.1, t < 0.5 ? inc : -inc, ry, 0, '#f0e6d0'); } }
    for (let i = 0; i < 3; i++) { const p = P(-9 + i * 8, -9 - r() * 2); amendoeira(add, r, p.x, this.y(p.x, p.z), p.z, 1.1); this.obst(p.x, p.z, 0.6); }
    for (let i = 0; i < 9; i++) { const p = P(-12 + i * 3 + r(), -6.5 - r() * 2); flores(add, r, p.x, this.y(p.x, p.z), p.z, 0.9 + r() * 0.4); }
    for (let i = 0; i < 18; i++) { const p = P((r() - 0.5) * 26, 1 + r() * 10); if (alturaEm(p.x, p.z) < NA - 0.15) coral(add, r, p.x, alturaEm(p.x, p.z), p.z, 0.8); }
    for (let i = 0; i < 12; i++) { const t = r() * 6.28, d = 4 + r() * 12, p = { x: ilha.x + Math.cos(t) * d, z: ilha.z + Math.sin(t) * d }; if (alturaEm(p.x, p.z) > NA + 0.5 && Math.hypot(p.x - c.x, p.z - c.z) > 7) { if (i % 3) this.coq(f, p.x, p.z, 0.9 + r() * 0.3); else { bananeira(add, r, p.x, this.y(p.x, p.z), p.z, 1); this.obst(p.x, p.z, 0.4); } } }
  }
  // ---------- A ilha vulcânica com a cachoeira e as falésias ----------
  vulcao(f) {
    const add = f.add.bind(f), r = this.r, v = ARQ.vulcao, vy = this.y(v.x, v.z), D = ARQ.dir, LT = ARQ.lat;
    add('cone', 'n', v.x, vy + 8, v.z, 30, 18, 28, 0, 0.4, 0, '#3f8a3a'); add('cone', 'n', v.x + 1, vy + 17, v.z, 15, 16, 14, 0, 1, 0, '#5a7a44');
    add('cone', 'n', v.x + 1.5, vy + 27, v.z, 8, 10, 7, 0.1, 0.2, 0, '#6a5a4a'); add('cone', 'n', v.x - 7, vy + 18, v.z + 5, 7, 12, 7, 0, 0.7, 0.1, '#5a5a48'); add('cone', 'n', v.x + 8, vy + 15, v.z - 4, 6, 9, 6, 0, 0.3, -0.1, '#6a5a4a');
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 6 + r() * 4; add('ico', 'n', v.x + Math.cos(a) * d, vy + 6 + r() * 5, v.z + Math.sin(a) * d, 4, 2.5, 4, 0, r() * 6, 0, sorteio(r, FOLHA)); }
    for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.28; this.obst(v.x + Math.cos(a) * 9, v.z + Math.sin(a) * 9, 5); }
    this.obst(v.x, v.z, 9);
    // a cachoeira, virada para a estrada
    const dc = { x: -D.x * 0.7 - LT.x * 0.7, z: -D.z * 0.7 - LT.z * 0.7 }, top = { x: v.x + dc.x * 6, z: v.z + dc.z * 6 }, pe = { x: v.x + dc.x * 12, z: v.z + dc.z * 12 }, ry = Math.atan2(dc.x, dc.z);
    add('caixa', 't', (top.x + pe.x) / 2, vy + 5.5, (top.z + pe.z) / 2, 2.6, 11, 0.6, -0.5, ry, 0); add('caixa', 'b', (top.x + pe.x) / 2, vy + 5.5, (top.z + pe.z) / 2, 1.4, 11.2, 0.7, -0.5, ry, 0, '#e8fbff');
    for (let k = 0; k < 80; k++) this.respingo.push(pe.x + (r() - 0.5) * 5, NA + r() * 3, pe.z + (r() - 0.5) * 5);
    for (let k = 0; k < 7; k++) { const x = pe.x + dc.x * (2 + k * 1.2) + (r() - 0.5) * 3, z = pe.z + dc.z * (2 + k * 1.2) + (r() - 0.5) * 3; pedraCalcaria(add, r, x, this.y(x, z), z, 1.2); }
    for (let i = 0; i < 18; i++) { const a = r() * 6.28, d = 10 + r() * 8, x = v.x + Math.cos(a) * d, z = v.z + Math.sin(a) * d; if (alturaEm(x, z) > NA + 0.6) [bananeira, bambu, samambaiaTropical][i % 3](add, r, x, this.y(x, z), z, 1); }
    for (let i = 0; i < 9; i++) { // falésias calcárias em degraus
      const a = ry + 1.2 + i * 0.22, x = v.x + Math.sin(a) * 14, z = v.z + Math.cos(a) * 14, h = 6 + r() * 4, yy = this.y(x, z) - 1.5;
      for (let k = 0; k < Math.ceil(h / 1.6); k++) add('caixa', 'n', x, yy + k * 1.6 + 0.8, z, 3.4 - k * 0.12, 1.6, 2.6, 0, a + (r() - 0.5) * 0.15, 0, sorteio(r, CAL));
      add('ico', 'n', x, yy + h + 0.4, z, 3.6, 1, 2.8, 0, r() * 6, 0, sorteio(r, FOLHA)); this.obst(x, z, 1.6);
    }
  }
  // ---------- O arco de pedra no mar ----------
  arco(f) {
    const add = f.add.bind(f), r = this.r, A = ARQ.arco, ry = Math.atan2(ARQ.lat.x, ARQ.lat.z), P = W(A.x, A.z, ry), R = 6, by = NA - 0.8;
    for (const s of [-1, 1]) { const p = P(s * R, 0); for (let k = 0; k < 6; k++) add('caixa', 'n', p.x + (r() - 0.5) * 0.3, by + k * 1.6 + 0.8, p.z, 3.2 - k * 0.05, 1.6, 3.4, 0, ry + (r() - 0.5) * 0.1, 0, sorteio(r, CAL)); this.obst(p.x, p.z, 1.9); }
    for (let i = 0; i <= 12; i++) { const t = (i / 12) * Math.PI, p = P(Math.cos(t) * R, 0); add('caixa', 'n', p.x, by + 9 + Math.sin(t) * R * 0.75, p.z, 3.2, 2.4, 3.4, 0, ry, -(t - Math.PI / 2) * 0.9, sorteio(r, ['#d9c28a', '#cdb47a'])); }
    for (let i = 0; i < 6; i++) { const t = 0.4 + i * 0.47, p = P(Math.cos(t) * R, 0); add('ico', 'n', p.x, by + 10.8 + Math.sin(t) * R * 0.75, p.z, 2.6, 0.9, 3, 0, r() * 6, 0, sorteio(r, FOLHA)); }
  }
  // ---------- O farol antigo, a torre de vigia e o manguezal ----------
  farol(f) {
    const add = f.add.bind(f), r = this.r, F = ARQ.farol, fy = this.y(F.x, F.z) - 0.2;
    for (let k = 0; k < 8; k++) add('cil', 'n', F.x, fy + k * 1.4 + 0.7, F.z, 3.2 - k * 0.16, 1.4, 3.2 - k * 0.16, 0, 0, 0, k % 3 === 2 ? '#a8b08a' : sorteio(r, ['#e0d8c0', '#d6ccb0']));
    add('cil', 'n', F.x, fy + 11.5, F.z, 2.4, 0.3, 2.4, 0, 0, 0, '#8a8270'); add('cil', 'b', F.x, fy + 12.4, F.z, 1.5, 1.6, 1.5, 0, 0, 0, '#ffd890');
    for (let i = 0; i < 6; i++) { const a = i * 1.05; add('caixa', 'n', F.x + Math.cos(a) * 0.85, fy + 12.4, F.z + Math.sin(a) * 0.85, 0.15, 1.6, 0.15, 0, -a, 0, '#4a4438'); }
    add('meia', 'n', F.x, fy + 13.2, F.z, 1.9, 1.3, 1.9, 0, 0, 0, '#8a6a3a'); add('cone', 'n', F.x, fy + 14.1, F.z, 0.3, 0.6, 0.3, 0, 0, 0, '#6a5a3a');
    this.luzes.push(F.x, fy + 12.4, F.z); this.luzFarol = { x: F.x, y: fy + 12.4, z: F.z };
    for (let i = 0; i < 6; i++) { const a = r() * 6.28; add('ico', 'n', F.x + Math.cos(a) * 1.5, fy + 1 + r() * 7, F.z + Math.sin(a) * 1.5, 1.2, 0.9, 0.6, 0, a, 0, '#6a8a3a'); } // o musgo
    this.obst(F.x, F.z, 1.8);
    const tw = { x: F.x + 7, z: F.z + 4 }, ty = this.y(tw.x, tw.z) - 0.2; // a torre de vigia
    for (let k = 0; k < 5; k++) add('caixa', 'n', tw.x, ty + k * 1.3 + 0.65, tw.z, 3, 1.3, 3, 0, 0.3, 0, sorteio(r, ['#e0d8c0', '#d6ccb0', '#a8b08a']));
    for (let i = 0; i < 8; i++) { const a = i * 0.785; add('caixa', 'n', tw.x + Math.cos(a + 0.3) * 1.3, ty + 7.0, tw.z - Math.sin(a + 0.3) * 1.3, 0.6, 0.7, 0.6, 0, 0.3, 0, '#d6ccb0'); }
    this.obst(tw.x, tw.z, 2);
    for (let i = 0; i < 6; i++) { const p = { x: F.x + 2 + i * 1.1, z: F.z + 2 + i * 0.4 }, h = 0.6 + r() * 1.2; add('caixa', 'n', p.x, this.y(p.x, p.z) + h / 2, p.z, 1.1, h, 0.9, 0, 0.3, 0, sorteio(r, ['#d6ccb0', '#c8bea0'])); this.obst(p.x, p.z, 0.6); }
    for (const [ox, oz] of [[-4, 3], [3, -4]]) { const p = { x: F.x + ox, z: F.z + oz }; add('caixa', 'n', p.x, this.y(p.x, p.z) + 0.9, p.z, 1.8, 1.8, 1.4, 0, 0.5, 0, '#d6ccb0'); add('cil', 'n', p.x + 0.72, this.y(p.x, p.z) + 1, p.z + 0.2, 0.8, 0.05, 0.8, Math.PI / 2, 0.5, 0, '#8a8270'); this.obst(p.x, p.z, 1); } // pedras entalhadas
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 5 + r() * 9, x = F.x + Math.cos(a) * d, z = F.z + Math.sin(a) * d; if (alturaEm(x, z) <= NA + 0.6) continue; if (i % 3 === 2) this.coq(f, x, z, 1); else (i % 3 ? flores : samambaiaTropical)(add, r, x, this.y(x, z), z, 1); }
    for (let i = 0; i < 9; i++) { // o manguezal no canal raso ao lado
      const p = ARQ.ponto(258 + r() * 22, -108 + r() * 10), h = alturaEm(p.x, p.z); if (h > NA - 0.05 || h < -1.2) continue;
      for (let k = 0; k < 4; k++) add('arco', 'n', p.x + (r() - 0.5), NA - 0.3, p.z + (r() - 0.5), 0.9, 1.2, 0.9, 0, r() * 6, 0, '#6a5a44');
      add('cil', 'n', p.x, NA + 1.2, p.z, 0.3, 1.6, 0.3, 0, 0, 0, '#6a5a44'); add('ico', 'n', p.x, NA + 2.6, p.z, 3, 1.6, 3, 0, r() * 6, 0, sorteio(r, ['#3a7a30', '#4a8a34'])); this.obst(p.x, p.z, 0.8);
    }
  }
  // ---------- O naufrágio e o atol ----------
  naufragio(f) {
    const add = f.add.bind(f), r = this.r, N = ARQ.nau, a = 0.7, P = W(N.x, N.z, a), by = alturaEm(N.x, N.z) + 0.3, tilt = 0.28;
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const p = P(s * 1.6, -3 + k * 2); add('caixa', 'n', p.x, by + 0.8 + k * 0.05, p.z, 0.3, 1.8, 2.1, 0, a, s * 0.3 + tilt, k === 3 && s > 0 ? '#5a4632' : '#6a5038'); }
    add('caixa', 'n', N.x, by, N.z, 3, 0.4, 8, 0, a, tilt, '#5a4632'); const pr = P(0, 4.6); add('cone4', 'n', pr.x, by + 0.9, pr.z, 2.6, 2.6, 1.8, Math.PI / 2, a + 0.785, tilt, '#6a5038');
    const m1 = P(0, 0.5); add('cil', 'n', m1.x, by + 2.6, m1.z, 0.3, 5, 0.3, 0.25, a, tilt + 0.2, '#5a4632'); add('caixa', 'n', m1.x + 0.6, by + 4.3, m1.z, 3.2, 0.2, 0.2, 0, a + 1.4, 0.3, '#5a4632');
    for (let i = 0; i < 10; i++) { const p = P((r() - 0.5) * 3, (r() - 0.5) * 8); coral(add, r, p.x, alturaEm(p.x, p.z), p.z, 0.6); }
    for (let k = -1; k <= 1; k++) { const p = P(0, k * 3); this.obst(p.x, p.z, 1.8); }
  }
  atol(f) {
    const add = f.add.bind(f), r = this.r, A = ARQ.atol;
    for (let i = 0; i < 26; i++) { const t = (i / 26) * 6.28, rr = 10 + Math.sin(i * 1.7) * 1.2, x = A.x + Math.cos(t) * rr, z = A.z + Math.sin(t) * rr * 0.8; add('ico', 'n', x, NA + 0.05, z, 3.4, 0.5, 2.6, 0, t, 0, i % 4 === 0 ? '#ff9a7a' : '#f6ecd2'); if (i % 3 === 0) coral(add, r, x, alturaEm(x, z), z, 0.7); }
    for (let i = 0; i < 3; i++) { const t = i * 2.1 + 0.4, x = A.x + Math.cos(t) * 10.5, z = A.z + Math.sin(t) * 8.4; f.centro = [x, z]; coqueiro(add, r, x, NA, z, 0.8); f.centro = null; this.obst(x, z, 0.4); }
  }

  // ---------- os veleiros (cada um vira 1 malha só e vai e volta na rota dele) ----------
  veleiros() {
    this.barcos = [];
    for (const rt of ARQ.veleiros) {
      const f = new Forno(), add = f.add.bind(f);
      add('caixa', 'n', 0, 0.3, 0, 1.4, 0.6, 4, 0, 0, 0, '#f4f2ea'); add('cone4', 'n', 0, 0.3, 2.4, 1.2, 1.2, 0.7, Math.PI / 2, Math.PI / 4, 0, '#f4f2ea');
      add('caixa', 'n', 0, 0.62, 0, 1.2, 0.05, 3.6, 0, 0, 0, '#7a5232'); add('cil', 'n', 0, 3.2, 0.2, 0.12, 5.4, 0.12, 0, 0, 0, '#7a5232');
      add('vela', 'n', 0.02, 0.9, -1.4, 4.5, 4.6, 4.6, 0, -Math.PI / 2, 0, '#fbfbf6'); add('vela', 'n', 0.02, 1.2, 0.4, 3.4, 4.2, 2.6, 0, Math.PI / 2, 0, '#fbfbf6');
      const g = new THREE.Group(); f.montar(g); for (const mm of g.children) mm.matrixAutoUpdate = true;
      this.grupo.add(g);
      this.barcos.push({ g, rt, t: this.r(), vel: 0.012 + this.r() * 0.008 });
    }
  }

  // ---------- luzes, respingos, plâncton, chuva e arco-íris ----------
  particulas() {
    const g = this.grupo;
    this.ptLuz = pontos(this.luzes, '#ffb050', 3, 0.5, true); g.add(this.ptLuz);
    this.ptRespingo = pontos(this.respingo, '#ffffff', 1.6, 0.55, false); g.add(this.ptRespingo);
    // o plâncton: pontinhos na água rasa em volta do jogador (refeitos quando ele anda)
    const n = 260; this.plPos = new Float32Array(n * 3);
    this.plancton = pontos(this.plPos, '#3ad8ff', 1.5, 0, true);
    this.plancton.frustumCulled = false; this.plancton.visible = false; this.plCentro = null;
    this.m.cena.add(this.plancton);
    // a chuva: riscos caindo em volta do jogador
    const nc = 420, pc = new Float32Array(nc * 3), r = this.r;
    for (let i = 0; i < nc; i++) { pc[i * 3] = (r() - 0.5) * 60; pc[i * 3 + 1] = r() * 18; pc[i * 3 + 2] = (r() - 0.5) * 60; }
    this.ptChuva = pontos(pc, '#dff4ff', 0.28, 0.7, false); this.ptChuva.frustumCulled = false; this.ptChuva.visible = false; this.m.cena.add(this.ptChuva);
    // o arco-íris: 7 faixas numa malha só (aparece no fim da chuva)
    const cores = ['#ff3a3a', '#ff9a2a', '#ffe23a', '#4ae04a', '#3ab8ff', '#4a5aff', '#a84aff'], pos = [], cor = [], c = new THREE.Color();
    cores.forEach((h, i) => { const tg = new THREE.TorusGeometry(46 - i * 1.4, 0.7, 3, 40, Math.PI).toNonIndexed(), a = tg.attributes.position.array; c.set(h); for (let k = 0; k < a.length; k += 3) { pos.push(a[k], a[k + 1], a[k + 2]); cor.push(c.r, c.g, c.b); } });
    const ag = new THREE.BufferGeometry(); ag.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ag.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
    const am = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide });
    am.userData.fixo = true;
    this.arcoIris = new THREE.Mesh(ag, am); this.arcoIris.visible = false; this.arcoIris.frustumCulled = false; this.m.cena.add(this.arcoIris);
  }
  refazerPlancton(px, pz) {
    const a = this.plancton.geometry.attributes.position.array, r = this.r; let n = 0; // (o array de verdade do desenho)
    for (let t = 0; t < 1200 && n < a.length / 3; t++) {
      const x = px + (r() - 0.5) * 70, z = pz + (r() - 0.5) * 70, h = alturaEm(x, z);
      if (h > NA - 0.1 || h < -1.6) continue;
      a[n * 3] = x; a[n * 3 + 1] = NA + 0.06; a[n * 3 + 2] = z; n++;
    }
    for (let i = n; i < a.length / 3; i++) a[i * 3 + 1] = -100;
    this.plancton.geometry.attributes.position.needsUpdate = true;
    this.plCentro = { x: px, z: pz };
  }

  // A chuva (rara, só no Arquipélago): devolve a força (0 a 1) para o clima
  get forcaChuva() { return this.chuva.forca; }

  atualizar(dt, t, pausado) {
    const m = this.m, px = m.pos.x, pz = m.pos.z, dentro = !m.masmorras?.ativa;
    this.grupo.visible = dentro;
    const pa = dentro ? pesosEm(px, pz)[4] : 0; // 4 = 'agua' (o Arquipélago) na lista dos biomas
    const f = m.fatorNoite;
    if (dentro) {
      for (const a of this.areas) a.g.visible = Math.hypot(px - a.x, pz - a.z) < a.r + m.nevoa * 0.8;
      this.ptLuz.material.opacity = 0.45 + 0.55 * f;
      this.ptRespingo.position.y = Math.sin(t * 3) * 0.2;
      for (const b of this.barcos) { // os veleiros vão e voltam
        const perto = Math.hypot(px - b.rt.a.x, pz - b.rt.a.z) < m.nevoa + 60;
        b.g.visible = perto; if (!perto) continue;
        if (!pausado) b.t += dt * b.vel;
        const k = (Math.sin(b.t * Math.PI * 2 - Math.PI / 2) + 1) / 2, ida = Math.cos(b.t * Math.PI * 2 - Math.PI / 2) >= 0;
        const { a, b: c } = b.rt;
        b.g.position.set(a.x + (c.x - a.x) * k, NA + 0.05 + Math.sin(t * 1.4 + b.vel * 100) * 0.06, a.z + (c.z - a.z) * k);
        b.g.rotation.set(Math.sin(t * 1.1) * 0.04, Math.atan2(c.x - a.x, c.z - a.z) + (ida ? 0 : Math.PI), Math.sin(t * 0.9) * 0.05);
      }
    }
    // o plâncton: só à noite, no Arquipélago
    const pl = this.plancton;
    pl.visible = pa > 0.1 && f > 0.3;
    if (pl.visible) {
      if (!this.plCentro || Math.hypot(px - this.plCentro.x, pz - this.plCentro.z) > 18) this.refazerPlancton(px, pz);
      pl.material.opacity = (0.6 + Math.sin(t * 2.3) * 0.25) * Math.min(1, (f - 0.3) * 2) * Math.min(1, pa * 1.5);
    }
    // a chuva morna: de 7 a 14 minutos de Arquipélago entre uma e outra, 75 s, e o arco-íris por 40 s
    const C = this.chuva;
    if (!pausado && pa > 0.5) {
      if (C.t > 0) { C.t -= dt; if (C.t <= 0) { C.arco = 40; if (m.jogo.estado && f < 0.5) m.jogo.aviso('A chuva passou e um arco-íris apareceu no céu! (Arraste a tela para baixo para olhar o horizonte.)'); } }
      else if (C.arco > 0) C.arco -= dt;
      else if ((C.prox -= dt) <= 0) { C.t = 75; C.prox = 420 + Math.random() * 420; if (m.jogo.estado) m.jogo.aviso('Uma pancada de chuva morna chegou às ilhas.'); }
    }
    const alvo = C.t > 0 && pa > 0.05 ? Math.min(1, C.t / 5, (75 - C.t) / 5 + 0.01) * pa : 0;
    C.forca += (alvo - C.forca) * Math.min(1, dt * 1.5);
    const ch = this.ptChuva;
    ch.visible = C.forca > 0.03;
    if (ch.visible) {
      ch.material.opacity = 0.75 * C.forca;
      const a = ch.geometry.attributes.position, arr = a.array, cai = dt * 14;
      for (let i = 1; i < arr.length; i += 3) { arr[i] -= cai; if (arr[i] < 0) arr[i] += 18; }
      a.needsUpdate = true;
      ch.position.set(px, alturaEm(px, pz) - 1, pz);
    }
    // o arco-íris: lá na frente da câmera, sobre o mar (só de dia)
    const ai = this.arcoIris, alvoA = C.arco > 0 && f < 0.5 && pa > 0.3 ? Math.min(1, C.arco / 5, (40 - C.arco) / 4) * 0.55 : 0;
    ai.material.opacity += (alvoA - ai.material.opacity) * Math.min(1, dt * 2);
    ai.visible = ai.material.opacity > 0.01;
    if (ai.visible) {
      const cam = m.camera.position, dx = px - cam.x, dz = pz - cam.z, L = Math.hypot(dx, dz) || 1;
      ai.position.set(px + (dx / L) * 95, NA - 22, pz + (dz / L) * 95); // (aparece com a câmera baixa, olhando o horizonte)
      ai.rotation.set(0, Math.atan2(dx, dz), 0); // o arco de frente para a câmera
    }
  }
}
