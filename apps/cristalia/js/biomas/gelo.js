// =============================================================
// BIOMA DO GELO: as peças únicas (o guia do Lâmina)
//  - Acampamento do Gelo (lugar seguro que cura): cabana de toras com telhado de
//    neve, pingentes, chaminé com fumaça e janelas acesas; fogueira com bancos;
//    barraca, trenó, caixotes e barris. Nenhum selvagem entra; a fogueira cura.
//  - Trilha com postes de lanterna (do fim da Estrada Real até o acampamento).
//  - Lago congelado: rachaduras, manchas escuras, barco preso no gelo, píer e bruma.
//  - Arco de pedra antigo com runas ciano, na beira de uma floresta fechada.
//  - Fonte termal: água azul sem gelo, pedras sem neve e vapor.
//  - Neve caindo em volta do jogador (só no Gelo).
// As peças comuns (pinheiros nevados, rochas com neve, capim, cristais de gelo)
// saem nos chunks (mapa/chunks.js). Os lugares vêm de biomas/lugares.js.
// Para pesar pouco: cada área vira 1 ou 2 malhas (cor nos vértices), as luzes são
// BRILHO FALSO (pontos com uma textura redonda, sem luz de verdade) e as partículas
// são poucos pontos num desenho só.
// O desenho usa os eixos do mapa: a frente do acampamento olha para o Reino (+z,
// porque a Estrada Real do Gelo vai para -z).
// =============================================================
import * as THREE from 'three';
import { pesosEm } from '../mapa/gerador.js';
import { alturaEm } from '../mapa/altura.js';
import { GELO, meioTrilha } from './lugares.js';
import { Forno, pontos, juntar, pocasDeLuz } from './comum.js';

// A paleta do guia
export const PAL_GELO = {
  neve: '#edf4fa', neve2: '#e4eef7', sombra: '#8ea8c3', gelo: '#4a89aa', rocha: '#2b3644', rocha2: '#36424f',
  pinho: '#233d3b', pinho2: '#2b4a46', ambar: '#f28c28', icicle: '#cfeaf7',
};
const P = PAL_GELO;
export const NOME_ACAMP = 'Acampamento do Gelo';
const RAIO_SEGURO = 12;   // nenhum selvagem a menos disso do acampamento
const RAIO_CURA = 6;      // perto da fogueira: cura a equipe

// Pinheiro carregado de neve (4 andares verdes, cada um com uma camada de neve por cima).
// add(geo, tipo, ...) no formato do Forno. pesado = muita neve.
export function pinheiroNevado(add, x, y, z, e, ry, pesado) {
  add('tronco', 'n', x, y + 0.5 * e, z, 1.1 * e, 0.9 * e, 1.1 * e, 0, ry, 0, '#4a3a30');
  [[1.5, 1.5, 1.3], [1.15, 1.3, 2.3], [0.8, 1.1, 3.2], [0.45, 0.9, 4]].forEach(([R, H, Y], i) => {
    add('pinho', 'n', x, y + Y * e, z, R * e, H * e, R * e, 0, ry + i * 0.5, 0, i % 2 ? P.pinho2 : P.pinho);
    const k = pesado ? 0.84 : 0.6;
    add('pinho', 'n', x, y + (Y + H * (pesado ? 0.16 : 0.25)) * e, z, R * k * e, H * (pesado ? 0.72 : 0.55) * e, R * k * e, 0, ry + i * 0.5 + 0.26, 0, i % 2 ? P.neve : P.neve2);
  });
}

export class BiomaGelo {
  constructor(mundo) {
    this.m = mundo;
    this.grupo = new THREE.Group();
    this.grupo.name = 'bioma-gelo';
    mundo.cena.add(this.grupo);
    let sem = 7771;
    this.rng = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
    const L = GELO;
    this.acamp = L.acamp;
    // lugar seguro (nenhum selvagem entra) e a fogueira que cura
    mundo.refugios.push({ x: L.acamp.x, z: L.acamp.z - 1, r: RAIO_SEGURO, nome: NOME_ACAMP });
    // as peças comuns do mapa não nascem em cima das únicas
    mundo.reservas.push({ x: L.acamp.x, z: L.acamp.z - 2, r: 11 });
    if (L.arco) mundo.reservas.push({ x: L.arco.x, z: L.arco.z, r: 5 });
    if (L.fonte) mundo.reservas.push({ x: L.fonte.x, z: L.fonte.z, r: 5 });
    for (const p of L.pinheiros) mundo.reservas.push({ x: p.x, z: p.z, r: 1.6 });
    for (let ao = L.trilha.ao0; ao < L.trilha.ao1 + 6; ao += 3) { const p = L.ponto(ao, 0); mundo.reservas.push({ x: p.x + L.lat.x * meioTrilha(ao), z: p.z + L.lat.z * meioTrilha(ao), r: 3.2 }); }
    this.brilhos = []; this.brilhosCiano = []; this.pocas = []; this.nevoa = []; this.vapor = [];
    this.areas = [];
    const area = (nome, x, z, r, fn) => { const f = new Forno(); fn(f.add.bind(f)); const g = new THREE.Group(); g.name = nome; f.montar(g); this.grupo.add(g); this.areas.push({ g, x, z, r }); };
    area('acampamento', L.acamp.x, L.acamp.z, 15, (add) => this.acampamento(add));
    { const m = L.ponto((L.trilha.ao0 + L.trilha.ao1) / 2, 0); area('trilha', m.x, m.z, 32, (add) => this.trilha(add)); }
    if (L.lago) area('lago', L.lago.x, L.lago.z, L.lago.r + 6, (add) => this.lago(add));
    if (L.arco) area('arco', L.arco.x, L.arco.z, 5, (add) => this.arco(add));
    if (L.fonte) area('fonte', L.fonte.x, L.fonte.z, 5, (add) => this.fonte(add));
    area('floresta', L.acamp.x - 31, L.acamp.z - 11, 22, (add) => { for (const p of L.pinheiros) { pinheiroNevado(add, p.x, this.y(p.x, p.z), p.z, p.e, p.ry, p.pesado); this.obst(p.x, p.z, 0.7 * p.e); } });
    this.brilhoDaGruta();
    this.particulas();
  }

  // A entrada da Gruta do Trovão (a caverna de gelo da arte do Lâmina): o brilho falso da
  // lanterna âmbar e do gelo ciano lá dentro (o desenho dela fica em masmorras/gruta-trovao.js)
  brilhoDaGruta() {
    const e = this.m.masmorras?.entrada('trovao');
    if (!e) return;
    const fx = Math.sin(e.ang), fz = Math.cos(e.ang), sx = Math.cos(e.ang), sz = -Math.sin(e.ang), base = alturaEm(e.x, e.z);
    const P = (f, s) => [e.x + fx * f + sx * s, e.z + fz * f + sz * s];
    const [lx, lz] = P(2.6, 1.75), [bx, bz] = P(1.5, 0.1);
    this.brilhos.push(lx, base + 2.45, lz); this.pocas.push([lx, lz, 4.5]);
    this.brilhosCiano.push(bx, base + 1.05, bz);
  }

  y(x, z) { return alturaEm(x, z) - 0.05; }
  obst(x, z, r) { this.m.obstaculos.push({ x, z, r, fixo: true }); }

  // ---------- o acampamento ----------
  acampamento(add) {
    const C = this.acamp, r = this.rng, y = (x, z) => this.y(x, z);
    const neveTopo = (x, yy, z, sx, sz) => add('caixa', 'n', x, yy, z, sx, 0.18, sz, 0, 0, 0, P.neve);
    const monte = (x, z, s) => add('ico', 'n', x, y(x, z) + 0.1 * s, z, 2.2 * s, 0.7 * s, 1.6 * s, 0, r() * 6, 0, P.neve2);
    // --- a cabana de toras ---
    const W = 6.4, D = 4.6, cx = C.x - 3, cz = C.z - 5;
    const cantos = [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]].map(([a, b]) => alturaEm(cx + a, cz + b));
    const y0 = Math.max(...cantos) + 0.15, baixo = Math.min(...cantos), wallH = 2.6, top = y0 + wallH, Hr = 2.1;
    add('caixa', 'n', cx, (y0 + baixo - 1) / 2, cz, W + 0.4, y0 - baixo + 1, D + 0.4, 0, 0, 0, '#4a5562'); // alicerce de pedra
    add('caixa', 'n', cx, y0 + wallH / 2, cz, W - 0.3, wallH, D - 0.3, 0, 0, 0, '#3e2a1e');
    for (let i = 0; i < 6; i++) {
      const yy = y0 + 0.22 + i * 0.43, c = i % 2 ? '#5a3f2c' : '#6a4a33';
      for (const s of [-1, 1]) {
        add('cil', 'n', cx, yy, cz + s * D / 2, 0.44, W + 0.5, 0.44, 0, 0, Math.PI / 2, c);
        add('cil', 'n', cx + s * W / 2, yy + 0.2, cz, 0.44, D + 0.5, 0.44, Math.PI / 2, 0, 0, c);
      }
    }
    add('prisma', 'n', cx, top + 0.5 * Hr / 1.5, cz, W / 1.732, D - 0.2, Hr / 1.5, -Math.PI / 2, 0, 0, '#4e3626'); // o oitão (triângulo das paredes)
    const a = Math.atan2(Hr, W / 2), Ls = Math.hypot(W / 2, Hr) + 0.9;
    for (const s of [-1, 1]) {
      const px = cx + s * (W / 4 + 0.12), py = top + Hr / 2 + 0.12;
      add('caixa', 'n', px, py, cz, Ls, 0.22, D + 1, 0, 0, -s * a, '#3a2a20');
      add('caixa', 'n', px - s * Math.sin(a) * 0.28, py + Math.cos(a) * 0.28, cz, Ls - 0.1, 0.38, D + 1.1, 0, 0, -s * a, P.neve);
      for (let i = 0; i < 11; i++) { const z = cz - D / 2 - 0.4 + i * ((D + 0.8) / 10); add('cone', 'n', cx + s * (W / 2 + 0.75), top - 0.25 - r() * 0.2, z, 0.14, 0.35 + r() * 0.5, 0.14, Math.PI, 0, 0, P.icicle); }
    }
    for (let i = 0; i < 9; i++) add('cone', 'n', cx - W / 2 + 0.4 + i * (W - 0.8) / 8, top - 0.1, cz + D / 2 + 0.32, 0.13, 0.3 + r() * 0.5, 0.13, Math.PI, 0, 0, P.icicle);
    const chx = cx + W / 2 - 1.3, chz = cz - 0.6;
    add('caixa', 'n', chx, y0 + 2.6, chz, 0.9, 5.2, 0.9, 0, 0, 0, '#5a6370'); neveTopo(chx, y0 + 5.25, chz, 1.05, 1.05);
    this.chamine = { x: chx, y: y0 + 5.4, z: chz };
    add('caixa', 'n', cx - 0.6, y0 + 0.95, cz + D / 2 + 0.24, 1.05, 1.9, 0.1, 0, 0, 0, '#3a281c'); // porta
    for (const wx of [-2.2, 1.4]) {
      add('caixa', 'n', cx + wx, y0 + 1.45, cz + D / 2 + 0.23, 1.0, 0.9, 0.06, 0, 0, 0, '#2a1d14');
      add('caixa', 'b', cx + wx, y0 + 1.45, cz + D / 2 + 0.27, 0.8, 0.7, 0.04, 0, 0, 0, '#ffc070');
      this.brilhos.push(cx + wx, y0 + 1.45, cz + D / 2 + 0.5);
    }
    add('caixa', 'b', cx - W / 2 - 0.27, y0 + 1.45, cz, 0.04, 0.7, 0.8, 0, 0, 0, '#ffc070'); this.brilhos.push(cx - W / 2 - 0.5, y0 + 1.45, cz);
    add('caixa', 'n', cx, y0 + 0.05, cz + D / 2 + 0.9, W, 0.2, 1.4, 0, 0, 0, '#7a5a3e'); // varanda
    for (let i = 0; i < 3; i++) for (let j = 0; j < 5 - i; j++) add('cil', 'n', cx - W / 2 - 1.1, y0 + 0.2 + i * 0.36, cz - 1.2 + j * 0.38 + i * 0.19, 0.36, 1.2, 0.36, Math.PI / 2, 0, 0, j % 2 ? '#9a6a44' : '#8a6040');
    neveTopo(cx - W / 2 - 1.1, y0 + 1.25, cz - 0.4, 1.2, 1.3);
    for (const [ox, oz, s] of [[-W / 2, -D / 2, 1], [W / 2 + 0.3, -D / 2 + 0.6, 0.9], [W / 2 + 0.4, D / 2 - 0.3, 0.7], [-W / 2 - 0.4, D / 2 + 0.4, 0.6]]) monte(cx + ox, cz + oz, s);
    this.obst(cx - 1.7, cz, 2.9); this.obst(cx + 1.7, cz, 2.9); this.obst(cx - W / 2 - 1.1, cz - 0.4, 0.9);
    // --- a fogueira (é ela que cura) e os bancos ---
    const fx = C.x + 3.2, fz = C.z + 1.5, fy = y(fx, fz);
    this.fogueira = { x: fx, z: fz, y: fy };
    for (let i = 0; i < 9; i++) { const an = i * 0.7; add('dode', 'n', fx + Math.cos(an) * 1.05, fy + 0.18, fz + Math.sin(an) * 1.05, 0.55, 0.42, 0.5, r(), r() * 6, 0, '#4a4f58'); }
    for (let i = 0; i < 3; i++) add('cil', 'n', fx, fy + 0.2, fz, 0.22, 1.4, 0.22, Math.PI / 2, i * 1.05, 0.25, '#5a3a24');
    add('cone', 'b', fx, fy + 0.75, fz, 0.9, 1.3, 0.9, 0, 0, 0, '#ff7a1a'); add('cone', 'b', fx + 0.15, fy + 0.6, fz - 0.1, 0.5, 0.8, 0.5, 0, 0, 0, '#ffd23f');
    this.brilhos.push(fx, fy + 1, fz); this.pocas.push([fx, fz, 7]);
    this.obst(fx, fz, 1.3);
    for (const an of [0.6, 2.3, 4.3]) add('cil', 'n', fx + Math.cos(an) * 2.6, fy + 0.25, fz + Math.sin(an) * 2.6, 0.5, 1.6, 0.5, Math.PI / 2, -an + Math.PI / 2, 0, '#6a4a33');
    // --- barraca, trenó, caixotes e barris ---
    const tx = C.x + 7.5, tz = C.z - 2.5, ty = y(tx, tz);
    add('cone4', 'n', tx, ty + 1.2, tz, 3.4, 2.4, 3.8, 0, 0.785, 0, '#a89a6a'); add('cone4', 'n', tx, ty + 2.1, tz, 1.3, 0.75, 1.45, 0, 0.785, 0, P.neve);
    add('caixa', 'n', tx, ty + 0.55, tz + 1.3, 0.8, 1.1, 0.05, 0, 0, 0, '#3a3424');
    this.obst(tx, tz, 1.8);
    const sx = C.x + 0.8, sz = C.z - 0.9, sy = y(sx, sz);
    for (const l of [-0.35, 0.35]) { add('caixa', 'n', sx + l, sy + 0.1, sz, 0.06, 0.08, 2, 0, 0, 0, '#5a4030'); add('cil', 'n', sx + l, sy + 0.25, sz + 1.0, 0.1, 0.4, 0.1, 0.6, 0, 0, '#5a4030'); }
    for (let i = 0; i < 5; i++) add('caixa', 'n', sx, sy + 0.42, sz - 0.7 + i * 0.35, 0.9, 0.06, 0.26, 0, 0, 0, '#9a7048');
    const caixote = (x, z, yy, s = 1) => { add('caixa', 'n', x, yy + 0.45 * s, z, 0.9 * s, 0.9 * s, 0.9 * s, 0, r() * 0.4, 0, '#8a6a48'); add('caixa', 'n', x, yy + 0.45 * s, z, 0.94 * s, 0.12 * s, 0.94 * s, 0, 0, 0, '#5a4430'); neveTopo(x, yy + 0.95 * s, z, 0.8 * s, 0.8 * s); };
    const barril = (x, z) => { const yy = y(x, z); add('cil', 'n', x, yy + 0.5, z, 0.8, 1, 0.8, 0, 0, 0, '#7a5636'); for (const h of [0.25, 0.75]) add('cil', 'n', x, yy + h, z, 0.84, 0.07, 0.84, 0, 0, 0, '#3a3a40'); add('cil', 'n', x, yy + 1.04, z, 0.7, 0.08, 0.7, 0, 0, 0, P.neve); this.obst(x, z, 0.45); };
    const y1 = y(C.x + 5.5, C.z + 3.6);
    caixote(C.x + 5.5, C.z + 3.6, y1); caixote(C.x + 6.4, C.z + 3.9, y(C.x + 6.4, C.z + 3.9), 0.8); caixote(C.x + 5.9, C.z + 3.7, y1 + 0.9, 0.75);
    this.obst(C.x + 5.9, C.z + 3.7, 1);
    barril(C.x + 1.5, C.z - 2.4); barril(C.x + 2.3, C.z - 2.1); barril(C.x + 9.6, C.z + 1);
    this.lanterna(add, C.x - 7.5, C.z + 3, 1); this.lanterna(add, C.x + 10.5, C.z + 4.5, -1);
  }

  // Poste torto com braço e lanterna âmbar (a luz é brilho falso)
  lanterna(add, x, z, lado, placa = false) {
    const yy = this.y(x, z), inc = (this.rng() - 0.5) * 0.12;
    add('caixa', 'n', x, yy + 1.6, z, 0.22, 3.2, 0.22, inc, 0, inc, '#5a4030'); add('caixa', 'n', x, yy + 3.25, z, 0.3, 0.18, 0.3, 0, 0, 0, P.neve);
    add('caixa', 'n', x + lado * 0.5, yy + 3.0, z, 1.1, 0.16, 0.16, 0, 0, 0, '#5a4030');
    add('caixa', 'n', x + lado * 0.25, yy + 2.7, z, 0.1, 0.7, 0.1, 0, 0, lado * 0.8, '#5a4030');
    add('caixa', 'b', x + lado * 0.9, yy + 2.6, z, 0.3, 0.42, 0.3, 0, 0, 0, '#ffb050'); add('cone4', 'n', x + lado * 0.9, yy + 2.9, z, 0.42, 0.22, 0.42, 0, 0.785, 0, '#2a2a30');
    this.brilhos.push(x + lado * 0.9, yy + 2.6, z); this.pocas.push([x + lado * 0.9, z, 4.5]);
    if (placa) for (const [h, a] of [[1.9, 0.3], [1.45, -0.4]]) add('caixa', 'n', x - lado * 0.5, yy + h, z, 1.3, 0.28, 0.08, 0, a, 0, '#7a5a3e');
    this.obst(x, z, 0.3);
  }

  // Os postes de lanterna dos dois lados da trilha, alternados
  trilha(add) {
    const T = GELO.trilha;
    for (let i = 0, ao = T.ao0 + 4; ao < T.ao1 - 4; ao += 9, i++) {
      const s = i % 2 ? 1 : -1, l = meioTrilha(ao) + s * 2.8, p = GELO.ponto(ao, l);
      this.lanterna(add, p.x, p.z, -s * Math.sign(GELO.lat.x || 1), i === 0);
    }
  }

  // ---------- o lago congelado ----------
  lago(add) {
    const LG = GELO.lago, r = this.rng, yl = alturaEm(LG.x, LG.z) + 0.03;
    for (let k = 0; k < 9; k++) { // rachaduras
      let x = LG.x + (r() - 0.5) * LG.r * 1.3, z = LG.z + (r() - 0.5) * LG.r * 1.3, a = r() * 6.28;
      for (let s = 0; s < 5; s++) {
        const len = 1.2 + r() * 2.2; a += (r() - 0.5) * 1.4;
        const nx = x + Math.cos(a) * len, nz = z + Math.sin(a) * len;
        if (Math.hypot(nx - LG.x, nz - LG.z) > LG.r - 0.5) break;
        add('caixa', 'n', (x + nx) / 2, yl, (z + nz) / 2, len, 0.03, 0.07, 0, -a, 0, '#e8f6ff');
        x = nx; z = nz;
      }
    }
    for (let k = 0; k < 6; k++) { const a = r() * 6.28, d = r() * LG.r * 0.7; add('cil', 'n', LG.x + Math.cos(a) * d, yl - 0.005, LG.z + Math.sin(a) * d, 1.5 + r() * 2, 0.02, 1.2 + r() * 1.5, 0, r() * 3, 0, '#2f6f90'); }
    // o barco preso (de lado e meio afundado)
    const bx = LG.x + 2.5, bz = LG.z + 1.5, ba = 0.9, bt = 0.18;
    const B = (lx, lz) => [bx + Math.cos(ba) * lx + Math.sin(ba) * lz, bz - Math.sin(ba) * lx + Math.cos(ba) * lz];
    { const [x, z] = B(0, 0); add('caixa', 'n', x, yl + 0.05, z, 1.3, 0.3, 3.4, 0, ba, bt, '#5a4a3a'); add('caixa', 'n', x, yl + 0.55, z, 1.2, 0.12, 2.6, 0, ba, bt, P.neve); this.obst(x, z, 1.5); }
    for (const s of [-1, 1]) { const [x, z] = B(s * 0.7, 0); add('caixa', 'n', x, yl + 0.32 + s * 0.06, z, 0.12, 0.6, 3.5, 0, ba, bt + s * 0.25, s > 0 ? '#7a6a58' : '#6a5a4a'); }
    for (const s of [-1, 1]) { const [x, z] = B(0, s * 1.85); add('cone4', 'n', x, yl + 0.3, z, 1.15, 0.8, 0.9, s * 1.5708, ba + 0.785, 0, '#6a5a4a'); }
    for (const lz of [-0.6, 0.7]) { const [x, z] = B(0, lz); add('caixa', 'n', x, yl + 0.42, z, 1.3, 0.08, 0.32, 0, ba, bt, '#8a7a66'); }
    for (let k = 0; k < 4; k++) { const [x, z] = B((r() - 0.5) * 2.5, (r() - 0.5) * 4); add('dode', 'n', x, yl + 0.05, z, 0.8 + r() * 0.6, 0.15, 0.6 + r() * 0.5, 0, r() * 6, 0, '#dff1fb'); }
    // o píer de madeira (na margem do lado do acampamento)
    const lado = Math.sign(GELO.acamp.x - LG.x) || 1, px0 = LG.x + lado * (LG.r + 2.5), pz = LG.z + 2;
    for (let i = 0; i < 6; i++) { const x = px0 - lado * i * 0.75; add('caixa', 'n', x, yl + 0.55, pz, 0.68, 0.14, 2, 0, (r() - 0.5) * 0.06, 0, i % 2 ? '#7a6656' : '#6a5848'); add('caixa', 'n', x, yl + 0.66, pz + (r() - 0.5) * 0.4, 0.5, 0.08, 1.2, 0, 0, 0, P.neve); }
    for (const [ox, oz] of [[0, -1], [0, 1], [-3.8, -1], [-3.8, 1]]) {
      const x = px0 + lado * ox;
      add('caixa', 'n', x, yl + 0.3, pz + oz, 0.22, 1.5, 0.22, 0, 0, 0, '#4a3a30'); add('caixa', 'n', x, yl + 1.08, pz + oz, 0.3, 0.14, 0.3, 0, 0, 0, P.neve);
      for (let k = 0; k < 2; k++) add('cone', 'n', x + (k - 0.5) * 0.5, yl + 0.32, pz + oz, 0.1, 0.4, 0.1, Math.PI, 0, 0, P.icicle);
    }
    for (let k = 0; k < 45; k++) { const a = r() * 6.28, d = Math.sqrt(r()) * (LG.r + 3); this.nevoa.push(LG.x + Math.cos(a) * d, yl + 0.4 + r() * 1.1, LG.z + Math.sin(a) * d); }
  }

  // ---------- o arco de pedra com runas ----------
  arco(add) {
    const { x: ax, z: az } = GELO.arco, r = this.rng, ay = this.y(ax, az) - 0.1, R = 2.3, hP = 3.4;
    for (const s of [-1, 1]) {
      for (let i = 0; i < 4; i++) add('caixa', 'n', ax + s * R + (r() - 0.5) * 0.08, ay + 0.45 + i * 0.85, az, 1.15, 0.82, 1.15, 0, (r() - 0.5) * 0.1, 0, i % 2 ? '#4a5462' : '#55606e');
      for (let i = 0; i < 3; i++) add('caixa', 'b', ax + s * R, ay + 0.8 + i * 0.85, az + 0.59, 0.32, 0.18, 0.03, 0, 0, 0, '#7ff0ff');
      this.brilhosCiano.push(ax + s * R, ay + 1.6, az + 0.8);
      add('ico', 'n', ax + s * R, ay + 0.2, az + 0.4, 2, 0.6, 1.4, 0, r() * 6, 0, P.neve2);
      this.obst(ax + s * R, az, 0.85);
    }
    for (let i = 0; i < 7; i++) {
      const t = (i / 6) * Math.PI, x = ax + Math.cos(t) * R, yy = ay + hP + Math.sin(t) * R;
      add('caixa', 'n', x, yy, az, 1.15, 0.85, 1.15, 0, 0, t + Math.PI / 2, i % 2 ? '#4a5462' : '#55606e');
      if (i > 0 && i < 6) add('caixa', 'n', ax + Math.cos(t) * (R + 0.52), ay + hP + Math.sin(t) * (R + 0.52), az, 1.05, 0.3, 1.3, 0, 0, t + Math.PI / 2, P.neve);
      if (i === 3) add('caixa', 'b', x, yy, az + 0.59, 0.4, 0.4, 0.03, 0, 0, 0, '#7ff0ff');
    }
    for (let k = 0; k < 4; k++) add('cone', 'n', ax + (k - 1.5) * 0.9, ay + hP + R - 0.65, az + 0.3, 0.14, 0.5 + r() * 0.4, 0.14, Math.PI, 0, 0, P.icicle);
  }

  // ---------- a fonte termal ----------
  fonte(add) {
    const { x: fx, z: fz } = GELO.fonte, r = this.rng, fy = this.y(fx, fz);
    add('cil', 'n', fx, fy + 0.1, fz, 4.4, 0.08, 3.6, 0, 0.4, 0, '#3fb8c8'); add('cil', 'n', fx, fy + 0.11, fz, 2.6, 0.08, 2, 0, 0.4, 0, '#7fe0e8');
    for (let i = 0; i < 12; i++) { const a = i * 0.52; add('dode', 'n', fx + Math.cos(a) * 2.5, fy + 0.2, fz + Math.sin(a) * 2.05, 0.9, 0.55, 0.8, r(), r() * 6, 0, i % 3 ? '#3a4450' : '#4a3a34'); }
    this.obst(fx, fz, 2.3);
    for (let k = 0; k < 70; k++) { const a = r() * 6.28, d = r() * 1.8, h = r() * 4; this.vapor.push(fx + Math.cos(a) * d * (1 + h * 0.2), fy + 0.4 + h, fz + Math.sin(a) * d * (1 + h * 0.2)); }
  }

  // ---------- luzes falsas, bruma, vapor, fumaça e neve ----------
  particulas() {
    const g = this.grupo;
    // as luzes âmbar (lanternas, janelas, fogueira) e as runas ciano: um desenho só
    { const [pos, cor] = juntar([this.brilhos, '#ffb050'], [this.brilhosCiano, '#3fd8ff']); this.ptBrilho = pontos(pos, '#ffffff', 3, 0.5, true, cor); g.add(this.ptBrilho); }
    { const im = pocasDeLuz(this.pocas.map(([x, z, t]) => [x, alturaEm(x, z), z, t]), '#ff9a3a', 0.25); this.matPoca = im.material; g.add(im); } // poças de luz no chão (1 desenho)
    // bruma do lago, vapor da fonte e fumaça da chaminé: um desenho só (sobem juntos, devagar)
    { const f = [], c = this.chamine, r = this.rng; for (let k = 0; k < 40; k++) { const h = r() * 6; f.push(c.x + (r() - 0.5) * (0.4 + h * 0.3) + h * 0.3, c.y + h, c.z + (r() - 0.5) * (0.4 + h * 0.3)); }
      const [pos, cor] = juntar([this.nevoa, '#c8d8e6'], [this.vapor, '#ffffff'], [f, '#b8bcc4']); this.ptFumaca = pontos(pos, '#ffffff', 3, 0.35, false, cor); g.add(this.ptFumaca); }
    // a neve caindo: uma caixa de pontos que acompanha o jogador
    const n = 600, pos = new Float32Array(n * 3), r = this.rng;
    for (let i = 0; i < n; i++) { pos[i * 3] = (r() - 0.5) * 70; pos[i * 3 + 1] = r() * 22; pos[i * 3 + 2] = (r() - 0.5) * 70; }
    this.neve = pontos(pos, '#ffffff', 0.32, 0.9, false);
    this.neve.frustumCulled = false; // acompanha o jogador (sempre na tela)
    this.neve.visible = false;
    this.m.cena.add(this.neve);
  }

  // Quadro a quadro: luzes de noite, fumaça e vapor subindo, neve caindo
  atualizar(dt, t) {
    const m = this.m, px = m.pos.x, pz = m.pos.z;
    const dentro = !m.masmorras?.ativa;
    const perto = dentro && Math.hypot(px - this.acamp.x, pz - this.acamp.z) < 170;
    this.grupo.visible = perto;
    for (const a of this.areas) a.g.visible = perto && Math.hypot(px - a.x, pz - a.z) < a.r + m.nevoa; // longe (na névoa): nem desenha
    if (perto) {
      const f = m.fatorNoite;
      this.ptBrilho.material.opacity = 0.45 + 0.55 * f;
      this.ptBrilho.material.size = 3 + 1.2 * f;
      this.matPoca.opacity = 0.2 + 0.4 * f;
      this.ptFumaca.position.y = (t * 0.4) % 1.2;  // a fumaça, o vapor e a bruma sobem devagar (e voltam)
    }
    // neve: só no Gelo (some na borda do bioma) e não na qualidade Fraco
    const pg = dentro ? pesosEm(px, pz)[0] : 0; // 0 = 'raio' (o 1º bioma da lista)
    const nv = this.neve;
    nv.visible = pg > 0.05 && m.chunks.nomeQ !== 'fraco';
    if (nv.visible) {
      nv.material.opacity = 0.9 * Math.min(1, pg * 1.5);
      const a = nv.geometry.attributes.position, arr = a.array, cair = dt * 2.2, vento = dt * 0.6;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] -= cair; arr[i] += vento;
        if (arr[i + 1] < 0) arr[i + 1] += 22;
        if (arr[i] > 35) arr[i] -= 70;
      }
      a.needsUpdate = true;
      nv.position.set(px, alturaEm(px, pz) - 2, pz);
    }
    // (a luz do chão azulada do Gelo fica no biomas/clima.js)
  }

  // A fogueira cura? (o mundo chama a cada quadro)
  pertoDaFogueira(x, z) { return this.fogueira && Math.hypot(x - this.fogueira.x, z - this.fogueira.z) < RAIO_CURA; }
}
