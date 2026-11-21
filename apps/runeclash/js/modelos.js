// =============================================================
// MODELOS 3D LOW POLY
// Cada linha evolutiva tem um "construtor" que recebe o estágio (0 a 3)
// e vai acrescentando peças: a evolução parece o crescimento da forma anterior.
// A frente de todo modelo aponta para +Z.
// Modelos feitos no Blender (.glb) entram no lugar dessas formas pelo
// modelos3d.js: hoje só a forma inicial do Brasito (modelos/brasito.glb).
// =============================================================
import * as THREE from 'three';
import { ESPECIES, CRISTAIS } from './dados.js';
import { temGLB, montarGLB, animarGLB, piscarGLB, descartarGLB, tocarGolpe as tocarGolpeGLB, pararGolpe as pararGolpeGLB } from './modelos3d.js';
import { montarSerpe } from './lendarios/serpe-modelo.js';
import { montarColosso } from './lendarios/colosso-modelo.js';
import { montarGeada } from './lendarios/geada-modelo.js';
import { montarArauto } from './lendarios/arauto-modelo.js';
export { carregarModelos3D, ajustarGiro } from './modelos3d.js';

// Um golpe começou (ou parou): o modelo do Blender toca a animação; os lendários fazem a pose deles
export function tocarGolpe(modelo, tipo, prep = 0) {
  if (modelo.userData.aoGolpe) modelo.userData.aoGolpe(tipo, prep);
  else tocarGolpeGLB(modelo, tipo, prep);
}
export function pararGolpe(modelo) {
  if (modelo.userData.aoParar) modelo.userData.aoParar();
  else pararGolpeGLB(modelo);
}

// ---------- peças reaproveitáveis ----------
const GEO = {};
function geo(chave, criar) {
  if (!GEO[chave]) GEO[chave] = criar();
  return GEO[chave];
}
const G = {
  esf: (r, w = 8, h = 6) => geo(`esf|${r}|${w}|${h}`, () => new THREE.SphereGeometry(r, w, h)),
  ico: (r, d = 0) => geo(`ico|${r}|${d}`, () => new THREE.IcosahedronGeometry(r, d)),
  cone: (r, h, s = 5) => geo(`cone|${r}|${h}|${s}`, () => new THREE.ConeGeometry(r, h, s)),
  cil: (rt, rb, h, s = 6) => geo(`cil|${rt}|${rb}|${h}|${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s)),
  caixa: (x, y, z) => geo(`cx|${x}|${y}|${z}`, () => new THREE.BoxGeometry(x, y, z)),
  octa: (r) => geo(`oc|${r}`, () => new THREE.OctahedronGeometry(r, 0)),
  dode: (r) => geo(`do|${r}`, () => new THREE.DodecahedronGeometry(r, 0)),
  toro: (r, t, arco = Math.PI * 2, rs = 5, ts = 14) => geo(`to|${r}|${t}|${arco}|${rs}|${ts}`, () => new THREE.TorusGeometry(r, t, rs, ts, arco)),
};
const CIMA = new THREE.Vector3(0, 1, 0);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export const MAT_SOMBRA = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });

// Cada modelo ganha materiais próprios, para poder "piscar" sozinho ao levar dano
function mat(cor, extra = {}) {
  return new THREE.MeshLambertMaterial({ color: cor, flatShading: true, ...extra });
}
function brilho(cor, intensidade = 0.6, extra = {}) {
  return mat(cor, { emissive: cor, emissiveIntensity: intensidade, ...extra });
}

// Cria uma peça e já coloca no grupo: p(grupo, geometria, material, [x,y,z], [rotX,rotY,rotZ], escala)
function p(pai, g, m, pos = [0, 0, 0], rot = null, esc = null) {
  const o = new THREE.Mesh(g, m);
  o.position.set(pos[0], pos[1], pos[2]);
  if (rot) o.rotation.set(rot[0], rot[1], rot[2]);
  if (esc != null) {
    if (typeof esc === 'number') o.scale.setScalar(esc);
    else o.scale.set(esc[0], esc[1], esc[2]);
  }
  pai.add(o);
  return o;
}
function apontar(o, dir) {
  o.quaternion.setFromUnitVectors(CIMA, dir.clone().normalize());
  return o;
}

// Olhos: brancos com pupila, ou brilhantes com pupila em fenda (corBrilho)
function olhos(alvo, y, z, sep, r = 0.11, corBrilho = null) {
  const esfera = G.esf(1, 8, 6);
  const branco = corBrilho ? brilho(corBrilho, 0.9) : mat('#ffffff');
  const preto = mat('#1b1b30');
  for (const s of [-1, 1]) {
    p(alvo, esfera, branco, [s * sep, y, z], null, r);
    if (corBrilho) p(alvo, esfera, preto, [s * sep, y, z + r * 0.78], null, [r * 0.2, r * 0.6, r * 0.2]);
    else p(alvo, esfera, preto, [s * sep, y + r * 0.1, z + r * 0.62], null, r * 0.55);
  }
}

function patas(c, m, hL, zL = 1, xs = 0.25, zs = 0.28, r = 0.09) {
  for (const [x, z] of [[-xs, zs], [xs, zs], [-xs, -zs], [xs, -zs]]) p(c, G.cil(r * 0.85, r, hL, 5), m, [x, hL / 2, z * zL]);
}

function base(tamanho = 1, estagio = 0) {
  const raiz = new THREE.Group();
  const corpo = new THREE.Group();
  corpo.scale.setScalar(tamanho);
  raiz.add(corpo);
  const sombra = new THREE.Mesh(geo('sombra', () => new THREE.CircleGeometry(1, 16)), MAT_SOMBRA);
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.05;
  sombra.scale.setScalar(0.75 * tamanho * (1 + estagio * 0.15));
  raiz.add(sombra);
  raiz.userData = { corpo, sombra, tamanho, fase: Math.random() * 10, caudas: [], giros: [], orbitas: [], asas: [], fumacas: [], pulsos: [] };
  return raiz;
}

// =============================================================
// LINHAS EVOLUTIVAS
// =============================================================

// ---------- Fogo: Brasito > Brasalobo > Fornalobo > Magmalobo ----------
function linhaFogo(c, u, e) {
  const mC = mat(['#ff8a3d', '#f26b2c', '#e2512b', '#5c2a22'][e]);
  const mE = mat(['#d4552a', '#b8401f', '#a3331b', '#2e1512'][e]);
  const mB = e < 3 ? mat('#ffe2bd') : brilho('#ff8a2a', 0.7);
  const zL = [1.15, 1.35, 1.5, 1.6][e], hL = [0.36, 0.46, 0.56, 0.62][e];
  const yT = hL + 0.26;
  p(c, G.ico(0.5, 1), mC, [0, yT, 0], null, [1, 0.9, zL]);
  p(c, G.esf(1), mB, [0, yT - 0.07, 0.27 * zL], null, [0.32, 0.32, 0.2]);
  const zC = 0.33 * zL + 0.1, yC = yT + 0.5;
  p(c, G.ico(0.4, 1), mC, [0, yC, zC]);
  const fl = [0.32, 0.4, 0.48, 0.52][e];
  p(c, G.cone(0.16, fl, 5), mB, [0, yC - 0.08, zC + 0.3 + fl * 0.4], [Math.PI / 2, 0, 0]);
  p(c, G.esf(1), mat('#1b1b30'), [0, yC - 0.07, zC + 0.32 + fl * 0.85], null, 0.06);
  for (const s of [-1, 1]) p(c, G.cone(0.14, 0.38 + e * 0.05, 4), mE, [s * 0.22, yC + 0.38, zC - 0.06], [0, 0, -s * 0.25]);
  patas(c, mE, hL, zL);
  const nCaudas = [1, 2, 3, 3][e];
  for (let i = 0; i < nCaudas; i++) {
    const g = new THREE.Group();
    g.position.set(0, yT + 0.15, -0.45 * zL);
    g.userData.baseY = (i - (nCaudas - 1) / 2) * 0.55;
    p(g, G.cone(0.24 + e * 0.03, 0.75 + e * 0.12, 5), brilho(e === 3 ? '#ff5a1f' : '#ffc23f', 0.55), [0, 0.2, -0.28 - e * 0.04], [-0.9, 0, 0]);
    c.add(g);
    u.caudas.push(g);
  }
  if (e >= 2) {
    const k = e === 3 ? 14 : 10;
    const m = brilho(e === 3 ? '#ff4a1a' : '#ffb030', 0.6);
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2;
      const o = p(c, G.cone(0.12, 0.42 + (e - 2) * 0.12, 4), m, [Math.cos(a) * 0.38, yC - 0.05 + Math.sin(a) * 0.38, zC - 0.15]);
      apontar(o, V(Math.cos(a), Math.sin(a), -0.35));
    }
  }
  if (e === 3) {
    const lava = brilho('#ffb030', 0.9);
    for (const s of [-1, 1]) {
      apontar(p(c, G.cone(0.07, 0.45, 4), mat('#1a0c08'), [s * 0.16, yC + 0.42, zC - 0.15]), V(s * 0.3, 1, -0.8));
      for (let i = 0; i < 3; i++) p(c, G.caixa(0.04, 0.06, 0.3), lava, [s * 0.47, yT - 0.05 + i * 0.1, (i - 1) * 0.3 * zL], [0, 0, s * 0.2]);
    }
  }
  olhos(c, yC + 0.08, zC + 0.34, 0.17, 0.1, e === 3 ? '#ffb030' : null);
}

// ---------- Água: Gotinho > Marolo > Marulhão > Tsunamar ----------
function linhaAgua(c, u, e) {
  const m = mat(['#5cc4ff', '#46aef2', '#3192e0', '#1f6fc8'][e], { transparent: true, opacity: 0.9 });
  const espuma = mat('#e6f8ff');
  p(c, G.esf(0.6, 10, 8), m, [0, 0.6, 0]);
  p(c, G.cone(0.44, 0.75, 10), m, [0, 1.25, 0]);
  p(c, G.esf(1), mat('#ffffff'), [-0.25, 0.95, 0.4], null, 0.08);
  for (const s of [-1, 1]) p(c, G.esf(1), mat('#ff9ec4'), [s * 0.36, 0.55, 0.45], null, [0.09, 0.06, 0.04]);
  if (e >= 1) {
    for (let i = 0; i < 3; i++) apontar(p(c, G.cone(0.13, 0.45, 4), espuma, [0, 1.25 - i * 0.25, -0.32 - i * 0.12]), V(0, 0.7, -1));
    for (const s of [-1, 1]) apontar(p(c, G.cone(0.15, 0.42, 4), m, [s * 0.6, 0.55, -0.05]), V(s, 0.25, -0.5));
  }
  if (e >= 2) {
    for (const s of [-1, 1]) {
      apontar(p(c, G.cil(0.1, 0.14, 0.6, 6), m, [s * 0.7, 0.6, 0.2]), V(s * 0.6, -0.6, 0.5));
      p(c, G.esf(0.17, 8, 6), m, [s * 0.88, 0.38, 0.38]);
    }
    for (let i = 0; i < 5; i++) {
      const o = p(c, G.esf(0.07), brilho('#bfeaff', 0.6), [0, 0, 0]);
      u.orbitas.push({ obj: o, raio: 0.36, vel: 1.5, y: 1.72, fase: (i / 5) * Math.PI * 2 });
    }
  }
  if (e === 3) {
    p(c, G.toro(1.05, 0.2, Math.PI, 6, 16), mat('#2a86d8', { transparent: true, opacity: 0.85 }), [0, 0.9, -0.55]);
    for (let i = 0; i < 6; i++) {
      const a = 0.25 + i * 0.53;
      p(c, G.esf(0.14), espuma, [Math.cos(a) * 1.05, 0.9 + Math.sin(a) * 1.05 + 0.15, -0.55]);
    }
    const nucleo = p(c, G.esf(0.22, 8, 6), brilho('#9ff0ff', 0.9), [0, 0.65, 0.1]);
    u.pulsos.push({ obj: nucleo, base: 1, amp: 0.15, vel: 4 });
  }
  olhos(c, 0.72, 0.52, 0.2, 0.12);
  u.gelatina = true;
}

// ---------- Planta: Musguinho > Moitão > Troncudo > Florestral ----------
function linhaPlanta(c, u, e) {
  const verde = mat(['#6fcf5a', '#62c24f', '#4f9d4a', '#3f8a3f'][e]);
  const musgo = mat('#3f8f3a');
  const tronco = mat(e === 3 ? '#6a4a30' : '#8a5a3a');
  const coresFlor = [mat('#ff7eb6'), mat('#ffd23f'), mat('#ffffff')];
  const flor = (x, y, z, i = 0) => {
    p(c, G.ico(0.13, 0), coresFlor[i % 2], [x, y, z]);
    p(c, G.esf(1), coresFlor[(i + 1) % 2], [x, y + 0.02, z + 0.1], null, 0.05);
  };
  if (e === 0) {
    p(c, G.caixa(0.95, 0.85, 0.9), verde, [0, 0.57, 0]);
    p(c, G.caixa(1.02, 0.18, 0.97), musgo, [0, 1.04, 0]);
    for (const [x, z] of [[-0.3, 0.2], [0.25, -0.25], [-0.1, -0.3], [0.32, 0.25], [0, 0.05]]) p(c, G.cone(0.08, 0.26, 4), musgo, [x, 1.24, z]);
    p(c, G.cil(0.025, 0.025, 0.3, 4), musgo, [0.15, 1.28, 0.05]);
    flor(0.15, 1.46, 0.05);
    for (const s of [-1, 1]) p(c, G.caixa(0.26, 0.14, 0.32), musgo, [s * 0.26, 0.07, 0.08]);
    olhos(c, 0.66, 0.47, 0.2, 0.11);
    return;
  }
  if (e === 1) {
    p(c, G.caixa(1.0, 0.9, 0.95), verde, [0, 0.58, 0]);
    p(c, G.ico(0.62, 0), musgo, [0, 1.35, -0.02], null, [1.05, 0.8, 1]);
    flor(0.35, 1.6, 0.25, 0); flor(-0.3, 1.55, 0.3, 1); flor(0.05, 1.78, -0.2, 0);
    for (const s of [-1, 1]) {
      p(c, G.caixa(0.2, 0.45, 0.2), verde, [s * 0.62, 0.55, 0.05], [0, 0, s * 0.3]);
      p(c, G.caixa(0.28, 0.14, 0.34), musgo, [s * 0.27, 0.07, 0.08]);
    }
    olhos(c, 0.7, 0.49, 0.22, 0.12);
    return;
  }
  const g = e === 3;
  const rT = g ? 0.6 : 0.48, hT = g ? 1.45 : 1.15, y0 = 0.25;
  p(c, G.cil(rT * 0.9, rT, hT, 7), tronco, [0, y0 + hT / 2, 0]);
  p(c, G.esf(1), mat('#c9a77a'), [0, y0 + hT * 0.55, rT * 0.85], null, [rT * 0.6, rT * 0.5, 0.12]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    apontar(p(c, G.cone(0.12, 0.5, 4), tronco, [Math.cos(a) * rT * 0.9, 0.18, Math.sin(a) * rT * 0.9]), V(Math.cos(a), -0.6, Math.sin(a)));
  }
  if (!g) {
    p(c, G.ico(0.9, 0), musgo, [0, y0 + hT + 0.55, 0], null, [1.1, 0.85, 1.1]);
    flor(0.5, y0 + hT + 0.85, 0.45, 0); flor(-0.45, y0 + hT + 0.7, 0.5, 1);
  } else {
    p(c, G.ico(0.85, 0), musgo, [0, y0 + hT + 0.85, 0]);
    for (const s of [-1, 1]) p(c, G.ico(0.65, 0), mat('#2f7a3a'), [s * 0.75, y0 + hT + 0.6, 0]);
    p(c, G.ico(0.6, 0), musgo, [0, y0 + hT + 0.65, -0.6]);
    [[0.5, 1.3, 0.55], [-0.55, 1.1, 0.5], [0.1, 1.6, 0.6], [0.95, 0.9, 0.3], [-0.95, 0.85, 0.35], [0, 1.9, -0.2]].forEach(([x, y, z], i) => flor(x, y0 + hT + y - 0.2, z, i));
    for (let i = 0; i < 3; i++) {
      const fr = p(c, G.esf(0.09), brilho('#ffe14a', 0.7), [(i - 1) * 0.5, y0 + hT + 0.35, 0.65]);
      u.pulsos.push({ obj: fr, base: 1, amp: 0.25, vel: 3 + i });
    }
    p(c, G.cone(0.2, 0.4, 5), musgo, [0, y0 + hT * 0.32, rT * 0.95], [Math.PI, 0, 0]);
  }
  for (const s of [-1, 1]) {
    apontar(p(c, G.cil(0.07, 0.1, 0.8, 5), tronco, [s * (rT + 0.25), y0 + hT * 0.6, 0.05]), V(s, 0.5, 0.3));
    p(c, G.ico(0.22, 0), musgo, [s * (rT + 0.6), y0 + hT * 0.6 + 0.35, 0.2]);
  }
  olhos(c, y0 + hT * 0.62, rT * 0.85 + 0.1, 0.17, 0.11, g ? '#d8ff6a' : null);
}

// ---------- Terra: Pedrisco > Cascalhão > Rochedrão > Montanhar ----------
function linhaTerra(c, u, e) {
  const r = mat(['#9c8a72', '#8f7d66', '#7d6e5c', '#6a5e52'][e]);
  const r2 = mat('#bfae94');
  const cristal = brilho('#ffb347', 0.6);
  if (e === 0) {
    p(c, G.dode(0.55), r, [0, 0.58, 0], null, [1, 0.85, 1]);
    p(c, G.dode(0.18), r2, [0.1, 1.05, -0.05]);
    for (const s of [-1, 1]) p(c, G.caixa(0.22, 0.12, 0.26), r2, [s * 0.22, 0.06, 0.15]);
    olhos(c, 0.66, 0.46, 0.18, 0.1);
    return;
  }
  if (e === 1) {
    p(c, G.dode(0.68), r, [0, 0.78, 0]);
    for (const s of [-1, 1]) {
      p(c, G.dode(0.27), r2, [s * 0.82, 0.5, 0.15]);
      p(c, G.dode(0.2), r, [s * 0.6, 0.98, 0]);
      p(c, G.caixa(0.26, 0.14, 0.3), r2, [s * 0.26, 0.07, 0.12]);
    }
    p(c, G.octa(0.22), cristal, [0, 1.38, -0.35], [-0.5, 0, 0], [1, 2.2, 1]);
    olhos(c, 0.9, 0.62, 0.2, 0.11);
    return;
  }
  const big = e === 3;
  const W = big ? 1.35 : 1.1, H = big ? 1.15 : 0.95, D = big ? 1 : 0.82, yT = big ? 1.4 : 1.15;
  p(c, G.caixa(W, H, D), r, [0, yT, 0], [0, 0, 0.04]);
  for (const s of [-1, 1]) p(c, G.dode(0.35), r, [s * W * 0.45, yT + H * 0.4, 0]);
  const yH = yT + H / 2 + 0.32;
  p(c, G.dode(big ? 0.42 : 0.38), r2, [0, yH, D * 0.2]);
  for (const s of [-1, 1]) {
    p(c, G.cil(0.17, 0.2, 0.75, 6), r, [s * (W / 2 + 0.2), yT - 0.15, 0.05]);
    p(c, G.dode(big ? 0.48 : 0.4), r2, [s * (W / 2 + 0.25), yT - 0.65, 0.15]);
    p(c, G.caixa(0.36, yT - H / 2, 0.4), r, [s * 0.3, (yT - H / 2) / 2, 0]);
  }
  if (!big) {
    for (const s of [-1, 1]) apontar(p(c, G.octa(0.18), cristal, [s * W * 0.45, yT + H * 0.75, -0.05], null, [1, 2, 1]), V(s * 0.4, 1, 0));
  } else {
    const neve = mat('#ffffff');
    for (const [x, alt, rr] of [[0, 1.35, 0.5], [-0.5, 1.0, 0.4], [0.5, 1.05, 0.42]]) {
      const y = yT + H / 2 + alt / 2 - 0.1;
      p(c, G.cone(rr, alt, 6), r, [x, y, -D * 0.3]);
      p(c, G.cone(rr * 0.42, alt * 0.42, 6), neve, [x, y + alt * 0.3, -D * 0.3]);
    }
    for (let i = 0; i < 3; i++) p(c, G.caixa(0.05, 0.4, 0.05), cristal, [(i - 1) * 0.3, yT + 0.05, D / 2 + 0.01], [0, 0, (i - 1) * 0.5]);
  }
  olhos(c, yH + 0.04, D * 0.2 + 0.34, 0.14, 0.09, big ? '#ffb347' : null);
}

// ---------- Raio: Faisquinho > Choquilho > Trovolt > Tempestor ----------
function zigue(c, m, inicio, passos, dx, dy, dz, larg = 0.08) {
  for (let i = 0; i < passos; i++) {
    const s = i % 2 ? -1 : 1;
    p(c, G.caixa(larg, 0.22, larg), m, [inicio[0] + s * dx, inicio[1] + i * dy, inicio[2] + i * dz], [0, 0, s * 0.6]);
  }
}
function linhaRaio(c, u, e) {
  const raioM = brilho('#ffe74c', 0.7);
  if (e <= 1) {
    const corpoM = mat('#ffe14a');
    if (e === 0) p(c, G.esf(0.5, 10, 8), corpoM, [0, 0.55, 0]);
    else p(c, G.ico(0.6, 1), corpoM, [0, 0.62, 0], null, [1, 0.85, 1.2]);
    const n = e === 0 ? 5 : 11;
    for (let i = 0; i < n; i++) {
      const teta = (i / n) * Math.PI * 2 * 1.7;
      const phi = 0.35 + (i % 3) * 0.35;
      const d = V(Math.sin(phi) * Math.sin(teta), Math.cos(phi), -Math.abs(Math.sin(phi) * Math.cos(teta)) - 0.2).normalize();
      const rr = e === 0 ? 0.48 : 0.56;
      apontar(p(c, G.cone(0.1, e === 0 ? 0.42 : 0.55, 4), e === 0 ? mat('#ff9f1a') : raioM, [d.x * rr, (e ? 0.62 : 0.55) + d.y * rr, d.z * rr * (e ? 1.2 : 1)]), d);
    }
    const azul = mat('#4fc3ff');
    const zf = e === 0 ? 0.36 : 0.55;
    for (const s of [-1, 1]) {
      p(c, G.esf(1), azul, [s * 0.36, 0.5, zf], null, [0.09, 0.07, 0.05]);
      p(c, G.caixa(0.14, 0.1, 0.2), mat('#e0b020'), [s * 0.2, 0.05, 0.2]);
    }
    if (e === 1) {
      p(c, G.cone(0.14, 0.3, 5), corpoM, [0, 0.58, 0.85], [Math.PI / 2, 0, 0]);
      zigue(c, raioM, [0, 0.6, -0.75], 4, 0.1, 0.18, -0.08);
    }
    olhos(c, e === 0 ? 0.62 : 0.76, e === 0 ? 0.44 : 0.63, e === 0 ? 0.18 : 0.2, e === 0 ? 0.11 : 0.1);
    return;
  }
  const big = e === 3;
  const corpoM = mat(big ? '#3a3f6a' : '#ffd23a');
  p(c, G.ico(0.55, 1), corpoM, [0, 1.0, 0], null, [0.9, 1, 1.25]);
  p(c, G.esf(0.36, 10, 8), corpoM, [0, 1.55, 0.45]);
  p(c, G.cone(0.12, 0.35, 4), mat('#ff9a2a'), [0, 1.5, 0.88], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 3; i++) apontar(p(c, G.cone(0.07, 0.4 + i * 0.05, 4), raioM, [0, 1.85, 0.4 - i * 0.12]), V(0, 1, -0.5 - i * 0.3));
  const esc = big ? 1.15 : 0.9;
  for (const s of [-1, 1]) {
    // asa em zigue-zague: 3 pedaços encostados, levemente puxados para trás
    const asa = new THREE.Group();
    asa.position.set(s * 0.42, 1.12, 0);
    asa.rotation.y = s * 0.4;
    for (let i = 0; i < 3; i++) {
      p(asa, G.caixa(0.42, 0.05, 0.3 - i * 0.05), raioM, [s * (0.2 + i * 0.34) * esc, i % 2 ? 0.1 : -0.03, -i * 0.06], [0, 0, s * (i % 2 ? -0.35 : 0.35)], [esc, 1, esc]);
    }
    c.add(asa);
    u.asas.push({ obj: asa, lado: s, base: 0 });
    p(c, G.cil(0.04, 0.04, 0.5, 4), mat('#ff9a2a'), [s * 0.18, 0.4, 0]);
  }
  zigue(c, raioM, [0, 0.85, -0.85], 3, 0.1, 0.05, -0.18, 0.1);
  if (big) {
    const nuvem = mat('#8a8fa8', { transparent: true, opacity: 0.9 });
    for (let i = 0; i < 4; i++) {
      const n = new THREE.Group();
      p(n, G.ico(0.32, 0), nuvem, [0, 0, 0]);
      p(n, G.ico(0.24, 0), nuvem, [0.28, -0.05, 0]);
      p(n, G.ico(0.22, 0), nuvem, [-0.26, -0.04, 0.05]);
      c.add(n);
      u.orbitas.push({ obj: n, raio: 1.25, vel: 0.8, y: 1.85, fase: (i / 4) * Math.PI * 2 });
    }
  }
  olhos(c, 1.62, 0.76, 0.14, 0.09, big ? '#ffe74c' : null);
  u.voa = true;
}

// ---------- Sol: Solito > Solário > Solaurum > Astrorei ----------
function juba(c, u, centro, raio, n, comp, m, vel) {
  const g = new THREE.Group();
  g.position.copy(centro);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    apontar(p(g, G.cone(0.08 + comp * 0.15, comp, 4), m, [Math.cos(a) * raio, Math.sin(a) * raio, 0]), V(Math.cos(a), Math.sin(a), 0));
  }
  c.add(g);
  if (vel) u.giros.push({ obj: g, eixo: 'z', vel });
  return g;
}
function linhaSol(c, u, e) {
  const ouro = mat(['#ffc93c', '#ffbd2e', '#ffb020', '#ffa514'][e]);
  const raios = brilho(e >= 2 ? '#ff8a1a' : '#ff9f2a', 0.6 + e * 0.1);
  const creme = mat('#fff0c2');
  if (e === 0) {
    p(c, G.esf(0.55, 10, 8), ouro, [0, 0.66, 0]);
    juba(c, u, V(0, 0.66, -0.05), 0.55, 10, 0.32, raios, 0.6);
    p(c, G.esf(1), creme, [0, 0.55, 0.47], null, [0.2, 0.14, 0.1]);
    for (const s of [-1, 1]) p(c, G.esf(1), ouro, [s * 0.22, 0.1, 0.15], null, [0.13, 0.1, 0.18]);
    olhos(c, 0.76, 0.49, 0.19, 0.11);
    return;
  }
  const zL = [0, 1.25, 1.4, 1.45][e], hL = [0, 0.42, 0.55, 0.6][e], yT = hL + 0.28;
  p(c, G.ico(0.48, 1), ouro, [0, yT, 0], null, [1, 0.9, zL]);
  patas(c, ouro, hL, zL, 0.24, 0.27, 0.1);
  const zC = 0.4 * zL + 0.12, yC = yT + 0.48;
  p(c, G.esf(0.38, 10, 8), ouro, [0, yC, zC]);
  p(c, G.esf(1), creme, [0, yC - 0.1, zC + 0.3], null, [0.2, 0.15, 0.14]);
  p(c, G.esf(1), mat('#5a3a1a'), [0, yC - 0.04, zC + 0.43], null, 0.05);
  juba(c, u, V(0, yC, zC - 0.12), 0.42, 12, 0.35, raios, 0.4);
  if (e >= 2) juba(c, u, V(0, yC, zC - 0.2), 0.55, 10, 0.5, brilho('#ffd23f', 0.7), -0.3);
  for (const s of [-1, 1]) p(c, G.cone(0.1, 0.18, 4), ouro, [s * 0.24, yC + 0.33, zC - 0.05]);
  const cauda = new THREE.Group();
  cauda.position.set(0, yT + 0.1, -0.45 * zL);
  apontar(p(cauda, G.cil(0.04, 0.05, 0.6, 4), ouro, [0, 0.15, -0.25]), V(0, 0.5, -1));
  const bola = p(cauda, G.esf(0.14, 8, 6), brilho('#ffe14a', 0.9), [0, 0.32, -0.52]);
  u.pulsos.push({ obj: bola, base: 1, amp: 0.2, vel: 4 });
  c.add(cauda);
  u.caudas.push(cauda);
  if (e === 3) {
    const coroa = new THREE.Group();
    coroa.position.set(0, yC + 0.45, zC - 0.02);
    p(coroa, G.toro(0.22, 0.04, Math.PI * 2, 4, 16), brilho('#ffd23f', 0.8), [0, 0, 0], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      p(coroa, G.cone(0.05, 0.18, 4), brilho('#ffe14a', 0.8), [Math.cos(a) * 0.22, 0.09, Math.sin(a) * 0.22]);
    }
    c.add(coroa);
    p(c, G.toro(1.0, 0.045, Math.PI * 2, 4, 32), brilho('#ffe9a0', 0.9, { transparent: true, opacity: 0.85 }), [0, yC + 0.1, zC - 0.5]);
  }
  olhos(c, yC + 0.07, zC + 0.32, 0.15, 0.1);
}

// ---------- Lua: Lunico > Lunarelo > Crescêntio > Plenilúnio ----------
function linhaLua(c, u, e) {
  const corp = mat(['#ece8ff', '#e2dcff', '#d3cbff', '#c4baff'][e]);
  const marca = brilho('#bfb5ff', 0.8);
  const rosa = mat('#ffc2e0');
  const orelha = (x, y, z, comp, ponta) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    p(g, G.cil(0.07, 0.1, comp, 5), corp, [0, comp / 2, 0]);
    p(g, G.esf(1), rosa, [0, comp / 2, 0.06], null, [0.045, comp * 0.4, 0.03]);
    if (ponta) p(g, G.toro(0.1, 0.03, Math.PI * 1.3, 4, 10), marca, [0, comp + 0.04, 0], [0, 0, -0.6]);
    g.rotation.set(-0.15, 0, -Math.sign(x) * 0.18);
    c.add(g);
  };
  if (e <= 1) {
    const r = e === 0 ? 0.5 : 0.58;
    p(c, G.esf(r, 10, 8), corp, [0, r + 0.05, 0], null, [1, 0.95, e ? 1.15 : 1]);
    for (const s of [-1, 1]) {
      orelha(s * 0.18, r * 1.75, 0.05, e ? 0.75 : 0.6, e === 1);
      p(c, G.esf(1), corp, [s * 0.2, 0.08, 0.25], null, [0.12, 0.08, 0.2]);
    }
    p(c, G.toro(0.12, 0.035, Math.PI * 1.3, 4, 10), marca, [0, r * 1.5, r * 0.85], [0, 0, 0.9]);
    p(c, G.esf(0.16), mat('#ffffff'), [0, r * 0.7, -r * 1.05]);
    olhos(c, r * 1.15, r * 0.86, 0.18, 0.1);
    return;
  }
  const big = e === 3;
  p(c, G.esf(0.45, 10, 8), corp, [0, 1.0, 0], null, [1, 1.3, 0.9]);
  p(c, G.esf(0.36, 10, 8), corp, [0, 1.78, 0.05]);
  for (const s of [-1, 1]) {
    orelha(s * 0.15, 2.05, 0, big ? 0.85 : 0.75, true);
    p(c, G.cil(0.12, 0.14, 0.55, 6), corp, [s * 0.2, 0.3, 0]);
    p(c, G.esf(1), corp, [s * 0.2, 0.06, 0.1], null, [0.14, 0.08, 0.24]);
    p(c, G.cil(0.07, 0.08, 0.55, 5), corp, [s * 0.5, 1.05, 0.05], [0, 0, s * 0.3]);
  }
  p(c, G.toro(0.12, 0.035, Math.PI * 1.3, 4, 10), marca, [0, 1.98, 0.33], [0, 0, 0.9]);
  p(c, G.toro(0.7, 0.06, Math.PI * 1.2, 4, 18), marca, [0, 1.2, -0.45], [0, 0, -0.3]);
  if (big) {
    p(c, G.toro(0.7, 0.06, Math.PI * 1.2, 4, 18), marca, [0, 1.2, -0.5], [0, Math.PI, -0.3]);
    const lua = new THREE.Group();
    lua.position.set(0, 2.8, -0.6);
    p(lua, G.esf(0.5, 12, 10), brilho('#eeeaff', 0.7), [0, 0, 0]);
    for (const [x, y, rr] of [[0.15, 0.12, 0.1], [-0.2, -0.1, 0.08], [0.05, -0.25, 0.06]]) p(lua, G.esf(rr), mat('#c9c2f0'), [x, y, 0.45]);
    c.add(lua);
    u.pulsos.push({ obj: lua, base: 1, amp: 0.04, vel: 2 });
    u.voa = true;
  }
  olhos(c, 1.84, 0.37, 0.14, 0.09, big ? '#b9b4ff' : null);
}

// ---------- Luz: Lumino > Lumelo > Prismal > Aurealis ----------
function asaLuz(c, u, x, y, z, s, esc, m, inclin) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  p(g, G.octa(0.5), m, [s * 0.35 * esc, 0, 0], null, [esc * 0.9, 0.05, esc * 0.45]);
  g.rotation.z = s * inclin;
  c.add(g);
  u.asas.push({ obj: g, lado: s, base: s * inclin });
}
function linhaLuz(c, u, e) {
  u.voa = true;
  const asa = mat('#ffffff', { transparent: true, opacity: 0.75 });
  if (e <= 1) {
    const r = e ? 0.5 : 0.45;
    p(c, G.esf(r, 12, 10), brilho('#fff6c8', 0.8), [0, 1.0, 0]);
    const aura = p(c, G.esf(r + 0.17, 10, 8), mat('#fff3b0', { transparent: true, opacity: 0.25, depthWrite: false }), [0, 1.0, 0]);
    u.pulsos.push({ obj: aura, base: 1, amp: 0.08, vel: 3 });
    for (const s of [-1, 1]) {
      asaLuz(c, u, s * (r - 0.05), 1.1, -0.1, s, 0.6, asa, 0.4);
      if (e) asaLuz(c, u, s * (r - 0.1), 0.85, -0.1, s, 0.45, asa, -0.3);
    }
    if (e) p(c, G.octa(0.2), brilho('#9fe8ff', 0.7), [0, 0.68, -0.45], [0.8, 0, 0], [0.6, 2, 0.6]);
    olhos(c, 1.05, r - 0.04, 0.16, 0.1);
    return;
  }
  const big = e === 3;
  const corpoM = mat('#d8f6ff', { emissive: '#7fd8ff', emissiveIntensity: 0.45, transparent: true, opacity: 0.92 });
  p(c, G.octa(big ? 0.8 : 0.7), corpoM, [0, 1.3, 0], null, [1, 1.35, 1]);
  const cores = ['#ffb3e6', '#fff3a0', '#a0f0ff', '#c8b0ff'];
  const n = big ? 4 : 3;
  for (let i = 0; i < n; i++) {
    const o = p(c, G.octa(0.16), brilho(cores[i], 0.7), [0, 0, 0], null, [1, 1.5, 1]);
    u.orbitas.push({ obj: o, raio: big ? 1.45 : 1.15, vel: 1.2, y: 1.3, fase: (i / n) * Math.PI * 2 });
  }
  for (const s of [-1, 1]) {
    if (big) {
      asaLuz(c, u, s * 0.55, 1.5, -0.2, s, 1.0, asa, 0.5);
      asaLuz(c, u, s * 0.55, 1.3, -0.25, s, 0.85, asa, 0.1);
      asaLuz(c, u, s * 0.5, 1.1, -0.2, s, 0.7, asa, -0.35);
    } else asaLuz(c, u, s * 0.5, 1.4, -0.2, s, 0.8, asa, 0.3);
  }
  if (big) p(c, G.toro(0.42, 0.05, Math.PI * 2, 4, 24), brilho('#ffd96a', 0.9), [0, 2.65, 0], [Math.PI / 2, 0, 0]);
  olhos(c, 1.42, big ? 0.56 : 0.5, 0.15, 0.1);
}

// ---------- Trevas: Breuzinho > Sombrelo > Umbrafel > Noctífero ----------
function linhaTrevas(c, u, e) {
  const corp = mat(['#4a2a6a', '#3e2458', '#33204a', '#24163a'][e]);
  const olho = '#e08aff';
  if (e === 0) {
    u.voa = true;
    p(c, G.esf(0.5, 10, 8), corp, [0, 0.85, 0]);
    p(c, G.cone(0.5, 0.65, 10), corp, [0, 0.35, 0], [Math.PI, 0, 0]);
    for (const s of [-1, 1]) {
      apontar(p(c, G.cone(0.08, 0.25, 4), mat('#2a1540'), [s * 0.22, 1.3, 0]), V(s * 0.4, 1, 0));
      apontar(p(c, G.cone(0.1, 0.3, 4), corp, [s * 0.5, 0.75, 0.05]), V(s, -0.3, 0.2));
    }
    olhos(c, 0.92, 0.42, 0.17, 0.12, olho);
    return;
  }
  const zL = [0, 1.35, 1.55, 1.6][e], hL = [0, 0.38, 0.52, 0.6][e], yT = hL + 0.26;
  p(c, G.ico(0.46, 1), corp, [0, yT, 0], null, [1, 0.85, zL]);
  patas(c, corp, hL, zL, 0.23, 0.27, 0.08);
  const zC = 0.36 * zL + 0.1, yC = yT + 0.42;
  p(c, G.ico(0.36, 1), corp, [0, yC, zC]);
  for (const s of [-1, 1]) p(c, G.cone(0.12, 0.38, 4), corp, [s * 0.2, yC + 0.36, zC - 0.05], [0, 0, -s * 0.2]);
  const cauda = new THREE.Group();
  cauda.position.set(0, yT + 0.1, -0.42 * zL);
  [0.12, 0.1, 0.08, 0.07].forEach((rr, i) => p(cauda, G.esf(rr), i === 3 ? brilho(olho, 0.7) : corp, [0, 0.12 + i * 0.16, -0.12 - i * 0.12]));
  c.add(cauda);
  u.caudas.push(cauda);
  if (e >= 2) {
    const fum = mat('#8a4ac8', { transparent: true, opacity: 0.6, depthWrite: false });
    for (let i = 0; i < (e === 3 ? 5 : 3); i++) {
      const o = p(c, G.ico(0.16, 0), fum, [0, 0, 0]);
      u.fumacas.push({ obj: o, x: (i - 1) * 0.2, y: yT + 0.35, z: (i % 2 ? -0.2 : 0.1) * zL, alt: 0.9 });
    }
  }
  if (e === 3) {
    const asaM = mat('#3a1f55');
    for (const s of [-1, 1]) {
      const g = new THREE.Group();
      g.position.set(s * 0.32, yT + 0.3, -0.1);
      g.rotation.y = s * 0.45;
      p(g, G.cone(0.55, 1.0, 3), asaM, [s * 0.5, 0.25, 0], [0, 0, s * 1.2], [1, 1, 0.08]);
      c.add(g);
      u.asas.push({ obj: g, lado: s, base: 0 });
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 4 - 0.5) * 1.6;
      apontar(p(c, G.cone(0.05, 0.3, 4), mat('#1a0f28'), [Math.sin(a) * 0.3, yC + 0.3, zC - 0.1]), V(Math.sin(a), 1, -0.3));
    }
  }
  olhos(c, yC + 0.06, zC + 0.3, 0.14, 0.09, olho);
}

// =============================================================
// TIPO DUPLO
// =============================================================

// Chama: cone brilhante com um miolo amarelo que pulsa
function chama(c, u, x, y, z, tam, cor = '#ff7a2a') {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  p(g, G.cone(0.16 * tam, 0.5 * tam, 5), brilho(cor, 0.8), [0, 0.25 * tam, 0]);
  p(g, G.cone(0.08 * tam, 0.3 * tam, 4), brilho('#ffe14a', 0.9), [0, 0.17 * tam, 0.03]);
  c.add(g);
  u.pulsos.push({ obj: g, base: 1, amp: 0.18, vel: 6 + Math.random() * 3 });
  return g;
}
function folha(c, m, x, y, z, dir, tam = 1) {
  apontar(p(c, G.cone(0.16 * tam, 0.55 * tam, 4), m, [x, y, z], null, [1, 1, 0.35]), dir);
}

// ---------- Fogo + Planta: Brotobrasa > Chamafolha > Ardentroco > Florinferno ----------
function linhaFogoPlanta(c, u, e) {
  const verde = mat(['#7ccf4a', '#5fae3e', '#4d8a38', '#3c6b2e'][e]);
  const folhaM = mat(['#9be05a', '#7cc94a', '#e0a33a', '#d8512a'][e]);
  const casca = mat(e === 3 ? '#3a2018' : '#5c3a26');
  const brasa = brilho('#ff6a1f', 0.85);
  if (e <= 1) {
    const r = e ? 0.66 : 0.5;
    p(c, G.ico(r, 1), verde, [0, r + 0.08, 0], null, [1, 0.92, 1]);
    for (const s of [-1, 1]) folha(c, folhaM, s * r * 0.95, r * 0.9, 0, V(s, 0.5, 0), e ? 1.3 : 1);
    p(c, G.cil(0.04, 0.05, 0.3, 4), verde, [0, r * 2 + 0.1, 0]);
    chama(c, u, 0, r * 2 + 0.2, 0, e ? 1.3 : 1);
    if (e) {
      for (const [x, z] of [[-0.45, 0.2], [0.45, 0.15], [0, -0.45]]) chama(c, u, x, 1.2, z, 0.8, '#ff9a2a');
      for (const s of [-1, 1]) p(c, G.caixa(0.26, 0.14, 0.32), casca, [s * 0.26, 0.07, 0.1]);
    }
    for (let i = 0; i < (e ? 4 : 2); i++) p(c, G.caixa(0.05, 0.05, 0.22), brasa, [(i - 0.5 * (e ? 3 : 1)) * 0.16, r * 0.45, r * 0.95]);
    olhos(c, r + 0.18, r * 0.92, 0.18, 0.1);
    return;
  }
  const g = e === 3;
  const rT = g ? 0.58 : 0.46, hT = g ? 1.5 : 1.15, y0 = 0.22;
  p(c, G.cil(rT * 0.85, rT, hT, 7), casca, [0, y0 + hT / 2, 0]);
  // rachaduras em brasa no tronco
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    p(c, G.caixa(0.05, hT * 0.5, 0.05), brasa, [Math.cos(a) * rT * 0.92, y0 + hT * 0.45, Math.sin(a) * rT * 0.92], [0, 0, (i % 2 ? 0.3 : -0.3)]);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    apontar(p(c, G.cone(0.12, 0.5, 4), casca, [Math.cos(a) * rT * 0.9, 0.18, Math.sin(a) * rT * 0.9]), V(Math.cos(a), -0.6, Math.sin(a)));
  }
  const yC = y0 + hT + (g ? 0.7 : 0.5);
  p(c, G.ico(g ? 0.95 : 0.8, 0), folhaM, [0, yC, 0], null, [1.1, 0.8, 1.1]);
  if (g) for (const s of [-1, 1]) p(c, G.ico(0.6, 0), mat('#b8401f'), [s * 0.8, yC - 0.2, 0]);
  const n = g ? 7 : 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    chama(c, u, Math.cos(a) * (g ? 0.8 : 0.6), yC + 0.35, Math.sin(a) * (g ? 0.75 : 0.55), g ? 1.1 : 0.9);
  }
  chama(c, u, 0, yC + 0.55, 0, g ? 1.6 : 1.2);
  for (const s of [-1, 1]) {
    apontar(p(c, G.cil(0.07, 0.1, 0.8, 5), casca, [s * (rT + 0.25), y0 + hT * 0.6, 0.05]), V(s, 0.5, 0.3));
    folha(c, folhaM, s * (rT + 0.6), y0 + hT * 0.6 + 0.4, 0.2, V(s, 1, 0.2), 1.2);
  }
  if (g) {
    for (let i = 0; i < 4; i++) {
      const fl = new THREE.Group();
      p(fl, G.ico(0.13, 0), brilho('#ff4a1a', 0.7));
      p(fl, G.esf(1), brilho('#ffe14a', 0.9), [0, 0.02, 0.1], null, 0.05);
      c.add(fl);
      u.orbitas.push({ obj: fl, raio: 1.25, vel: 1.2, y: y0 + hT * 0.5, fase: (i / 4) * Math.PI * 2 });
    }
  }
  olhos(c, y0 + hT * 0.62, rT * 0.85 + 0.1, 0.17, 0.11, g ? '#ffb030' : '#ffd23f');
}

// Vapor: bolinha branca que sobe e some (cada uma com seu material)
function vapor(c, u, x, y, z, alt = 0.8, tam = 0.18) {
  const o = p(c, G.ico(tam, 0), mat('#f2f6ff', { transparent: true, opacity: 0.75 }), [x, y, z]);
  u.fumacas.push({ obj: o, x, y, z, alt });
}

// ---------- Água + Fogo: Vaporito > Fumarolo > Gêiserão > Caldeirax ----------
function linhaAguaFogo(c, u, e) {
  const agua = mat(['#5fd0e8', '#46b8e0', '#2f9ed0', '#2a7fc0'][e], { transparent: true, opacity: 0.82 });
  const magma = brilho('#ff7a2a', 0.85);
  if (e === 2) {
    // Gêiserão: tartaruga com gêiser no casco
    const pele = mat('#4fb0c8'), casco = mat('#6a3a2a');
    p(c, G.esf(1), pele, [0, 0.5, 0], null, [0.8, 0.42, 0.95]);
    p(c, G.cil(0.45, 0.95, 0.75, 7), casco, [0, 1.0, -0.05]);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      p(c, G.caixa(0.06, 0.5, 0.06), magma, [Math.cos(a) * 0.72, 0.95, Math.sin(a) * 0.72 - 0.05], [Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]);
    }
    const jato = p(c, G.cil(0.16, 0.28, 0.9, 7), agua, [0, 1.75, -0.05]);
    u.pulsos.push({ obj: jato, base: 1, amp: 0.12, vel: 5 });
    for (let i = 0; i < 3; i++) vapor(c, u, (i - 1) * 0.15, 2.1, -0.05, 1.1, 0.22);
    p(c, G.ico(0.36, 1), pele, [0, 0.62, 0.95]);
    for (const [x, z] of [[-0.55, 0.5], [0.55, 0.5], [-0.55, -0.5], [0.55, -0.5]]) p(c, G.cil(0.16, 0.18, 0.36, 6), pele, [x, 0.18, z]);
    olhos(c, 0.74, 1.22, 0.16, 0.1);
    return;
  }
  const r = [0.55, 0.65, 0, 0.9][e];
  p(c, G.esf(r, 10, 8), agua, [0, r + 0.05, 0]);
  const nucleo = p(c, G.ico(r * 0.42, 1), magma, [0, r + 0.02, 0]);
  u.pulsos.push({ obj: nucleo, base: 1, amp: 0.15, vel: 5 });
  for (const s of [-1, 1]) p(c, G.esf(1), mat('#ff9ec4'), [s * r * 0.6, r * 0.85, r * 0.78], null, [0.09, 0.06, 0.04]);
  vapor(c, u, 0, r * 2 + 0.05, 0, 0.7);
  if (e >= 1) {
    for (const s of [-1, 1]) {
      p(c, G.cil(0.09, 0.12, 0.35, 6), mat('#6a3a2a'), [s * 0.28, r * 1.5, -r * 0.75], [-0.6, 0, s * 0.3]);
      vapor(c, u, s * 0.36, r * 1.7, -r * 0.95, 0.9, 0.15);
      apontar(p(c, G.cone(0.15, 0.45, 4), magma, [s * r * 0.98, r * 0.8, 0]), V(s, 0.2, -0.4));
    }
  }
  if (e === 3) {
    for (let i = 0; i < 5; i++) {
      const pl = p(c, G.dode(0.2), brilho('#ff5a1a', 0.7), [0, 0, 0]);
      u.orbitas.push({ obj: pl, raio: 1.35, vel: 1.1, y: 1.0, fase: (i / 5) * Math.PI * 2 });
    }
    for (let i = 0; i < 4; i++) vapor(c, u, Math.cos(i * 1.6) * 0.6, 1.9, Math.sin(i * 1.6) * 0.5, 1.2, 0.24);
    p(c, G.toro(0.55, 0.08, Math.PI * 2, 4, 14), magma, [0, 1.85, 0], [Math.PI / 2, 0, 0]);
  }
  olhos(c, r * 1.12 + 0.05, r * 0.9, 0.2 * (r / 0.55) * 0.9, 0.11, e === 3 ? '#ffd23f' : null);
  u.gelatina = true;
}

// Ímã em forma de U virado para baixo (vermelho com pontas de metal)
function ima(c, x, y, z, r = 0.3) {
  p(c, G.toro(r, r * 0.3, Math.PI, 5, 10), mat('#e8443a'), [x, y, z]);
  for (const s of [-1, 1]) p(c, G.caixa(r * 0.62, r * 0.4, r * 0.62), mat('#d8dde6'), [x + s * r, y - r * 0.2, z]);
}

// ---------- Terra + Raio: Imanito > Magnetito > Ferrovolt > Titanvolt ----------
function linhaTerraRaio(c, u, e) {
  const pedra = mat(['#8a93a6', '#7a8296', '#5a6070', '#454a58'][e]);
  const claro = mat('#b9c0cc');
  const eletrico = brilho('#ffe74c', 0.8);
  if (e <= 1) {
    const r = e ? 0.66 : 0.52;
    p(c, G.dode(r), pedra, [0, r + 0.06, 0], null, [1, 0.9, 1]);
    p(c, G.dode(r * 0.35), claro, [r * 0.5, r * 1.5, -0.1]);
    ima(c, 0, r * 1.85 + 0.12, 0, e ? 0.34 : 0.26);
    zigue(c, eletrico, [0, r * 0.9, r * 0.95], 3, 0.06, 0.12, 0.01, 0.06);
    for (const s of [-1, 1]) p(c, G.caixa(0.24, 0.12, 0.28), claro, [s * 0.24, 0.06, 0.14]);
    if (e) {
      for (const s of [-1, 1]) p(c, G.dode(0.26), claro, [s * 0.84, 0.55, 0.15]);
      for (let i = 0; i < 3; i++) {
        const fa = p(c, G.octa(0.09), eletrico, [0, 0, 0], null, [1, 2, 1]);
        u.orbitas.push({ obj: fa, raio: 1.05, vel: 2.4, y: 0.8, fase: (i / 3) * Math.PI * 2 });
      }
    }
    olhos(c, r + 0.16, r * 0.9, 0.19, 0.1, e ? '#ffe74c' : null);
    return;
  }
  const big = e === 3;
  const W = big ? 1.3 : 1.05, H = big ? 1.15 : 0.95, D = big ? 0.95 : 0.8, yT = big ? 1.4 : 1.15;
  p(c, G.caixa(W, H, D), pedra, [0, yT, 0]);
  // rachaduras elétricas
  for (let i = 0; i < 3; i++) p(c, G.caixa(0.05, H * 0.6, 0.05), eletrico, [(i - 1) * W * 0.28, yT, D / 2 + 0.01], [0, 0, (i - 1) * 0.6]);
  const yH = yT + H / 2 + 0.3;
  p(c, G.dode(big ? 0.42 : 0.36), claro, [0, yH, D * 0.15]);
  ima(c, 0, yH + 0.45, D * 0.15, big ? 0.4 : 0.32);
  for (const s of [-1, 1]) {
    p(c, G.cil(0.16, 0.2, 0.75, 6), pedra, [s * (W / 2 + 0.2), yT - 0.15, 0.05]);
    p(c, G.dode(big ? 0.46 : 0.38), claro, [s * (W / 2 + 0.25), yT - 0.65, 0.15]);
    p(c, G.caixa(0.36, yT - H / 2, 0.4), pedra, [s * 0.3, (yT - H / 2) / 2, 0]);
    zigue(c, eletrico, [s * (W / 2 + 0.25), yT - 0.3, 0.4], 3, 0.06, 0.14, 0, 0.05);
  }
  const n = big ? 6 : 3;
  for (let i = 0; i < n; i++) {
    const o = i % 2 && big
      ? p(c, G.octa(0.12), eletrico, [0, 0, 0], null, [1, 2.2, 1])
      : p(c, G.dode(big ? 0.24 : 0.2), pedra, [0, 0, 0]);
    u.orbitas.push({ obj: o, raio: big ? 1.7 : 1.4, vel: big ? 1.4 : 1.1, y: yT + (i % 2) * 0.4, fase: (i / n) * Math.PI * 2 });
  }
  olhos(c, yH + 0.04, D * 0.15 + 0.32, 0.14, 0.09, '#ffe74c');
}

const LINHAS_MODELO = { fogo: linhaFogo, agua: linhaAgua, planta: linhaPlanta, terra: linhaTerra, raio: linhaRaio, sol: linhaSol, lua: linhaLua, luz: linhaLuz, trevas: linhaTrevas,
  fogoPlanta: linhaFogoPlanta, aguaFogo: linhaAguaFogo, terraRaio: linhaTerraRaio };

// =============================================================
// RAROS (sem evolução)
// =============================================================
function vulcarapa(c, u) {
  const pele = mat('#93b26c');
  p(c, G.esf(1), pele, [0, 0.45, 0], null, [0.75, 0.38, 0.9]);
  p(c, G.cil(0.32, 0.85, 0.75, 7), mat('#7a4e33'), [0, 0.95, -0.05]);
  p(c, G.cil(0.26, 0.26, 0.08, 7), brilho('#ff5a1f', 0.8), [0, 1.33, -0.05]);
  p(c, G.ico(0.33, 1), pele, [0, 0.55, 0.85]);
  for (const [x, z] of [[-0.5, 0.45], [0.5, 0.45], [-0.5, -0.45], [0.5, -0.45]]) p(c, G.cil(0.15, 0.17, 0.34, 6), pele, [x, 0.17, z]);
  const fumaca = p(c, G.ico(0.2, 0), mat('#c9c3b8', { transparent: true, opacity: 0.8 }), [0, 1.6, -0.05]);
  u.fumacas.push({ obj: fumaca, x: 0, y: 1.5, z: -0.05, alt: 0.7 });
  olhos(c, 0.66, 1.1, 0.14, 0.09);
}

function aquaraia(c, u) {
  const dorso = mat('#3a8ee0'), claro = mat('#bfe8ff');
  p(c, G.octa(1), dorso, [0, 1.1, 0], null, [1.5, 0.26, 1.0]);
  p(c, G.octa(1), claro, [0, 1.04, 0.05], null, [1.2, 0.2, 0.8]);
  p(c, G.cone(0.07, 1.4, 4), dorso, [0, 1.1, -1.4], [-Math.PI / 2, 0, 0]);
  for (const s of [-1, 1]) p(c, G.cone(0.08, 0.35, 4), claro, [s * 0.3, 1.12, 0.95], [Math.PI / 2, 0, 0]);
  olhos(c, 1.27, 0.5, 0.3, 0.1);
  u.voa = true;
  u.sombra.scale.set(1.1, 0.8, 1);
}

function espinhal(c) {
  const cacto = mat('#4f9d5a'), espinho = mat('#fff2b0');
  p(c, G.ico(0.6, 1), cacto, [0, 0.66, 0], null, [1, 0.9, 1.1]);
  for (let i = 0; i < 16; i++) {
    const teta = (i / 16) * Math.PI * 2 * 2.3;
    const phi = 0.35 + (i % 4) * 0.33;
    const n = V(Math.sin(phi) * Math.sin(teta), Math.cos(phi), -Math.abs(Math.sin(phi) * Math.cos(teta)) - 0.15).normalize();
    apontar(p(c, G.cone(0.06, 0.34, 4), espinho, [n.x * 0.6, 0.66 + n.y * 0.55, n.z * 0.62]), n);
  }
  p(c, G.esf(1), mat('#c9e6a0'), [0, 0.6, 0.45], null, [0.34, 0.3, 0.2]);
  p(c, G.esf(1), mat('#1b1b30'), [0, 0.58, 0.66], null, 0.05);
  p(c, G.ico(0.14, 0), mat('#ff4f5e'), [0, 1.25, -0.02]);
  patas(c, cacto, 0.36, 1, 0.28, 0.25, 0.1);
  olhos(c, 0.72, 0.6, 0.14, 0.09);
}

// ---------- SUPER RARO: Ignárion, o chefe do Trono de Magma ----------
// Fera de obsidiana com rachaduras de fogo ígneo, chifres, asas de brasa e cauda de chamas
function ignarion(c, u) {
  const obs = mat('#2a1a22'), obs2 = mat('#3a2430');
  const igneo = brilho('#ff3d6a', 0.9), fogoM = brilho('#ffb030', 0.9), lava = brilho('#ff6a1f', 0.85);
  const yT = 0.95;
  // corpo e peito
  p(c, G.ico(0.75, 1), obs, [0, yT, 0], null, [1, 0.85, 1.45]);
  p(c, G.ico(0.5, 1), obs2, [0, yT - 0.05, 0.75], null, [1, 0.95, 0.9]);
  // rachaduras brilhando no corpo
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    p(c, G.caixa(0.05, 0.45, 0.05), igneo, [Math.cos(a) * 0.72, yT + Math.sin(a * 2) * 0.12, Math.sin(a) * 0.9], [0, a, 0.4]);
  }
  // espinhos de fogo nas costas
  for (let i = 0; i < 6; i++) {
    const z = 0.55 - i * 0.32;
    p(c, G.cone(0.13, 0.55 - Math.abs(i - 2) * 0.05, 4), obs2, [0, yT + 0.58, z], [-0.3, 0, 0]);
    const ch = p(c, G.cone(0.08, 0.35, 4), igneo, [0, yT + 0.9, z - 0.08], [-0.3, 0, 0]);
    u.pulsos.push({ obj: ch, base: 1, amp: 0.25, vel: 6 + i });
  }
  // pescoço e cabeça
  const zC = 1.45, yC = yT + 0.75;
  p(c, G.cil(0.28, 0.38, 0.7, 6), obs, [0, yT + 0.4, 1.05], [0.9, 0, 0]);
  p(c, G.ico(0.42, 1), obs, [0, yC, zC], null, [1, 0.9, 1.15]);
  p(c, G.caixa(0.5, 0.22, 0.55), obs2, [0, yC - 0.2, zC + 0.42]);
  p(c, G.caixa(0.42, 0.06, 0.5), lava, [0, yC - 0.32, zC + 0.42]); // boca acesa
  for (const s of [-1, 1]) {
    // chifres
    apontar(p(c, G.cone(0.1, 0.75, 5), mat('#e8dcc0'), [s * 0.25, yC + 0.4, zC - 0.15]), V(s * 0.5, 1, -0.7));
    apontar(p(c, G.cone(0.07, 0.45, 5), mat('#e8dcc0'), [s * 0.36, yC + 0.12, zC - 0.2]), V(s, 0.3, -0.6));
    // patas com garras
    for (const z of [0.55, -0.6]) {
      p(c, G.cil(0.17, 0.22, 0.7, 6), obs, [s * 0.5, 0.35, z]);
      p(c, G.caixa(0.32, 0.12, 0.36), obs2, [s * 0.5, 0.06, z + 0.08]);
      for (const k of [-1, 0, 1]) p(c, G.cone(0.04, 0.16, 4), mat('#e8dcc0'), [s * 0.5 + k * 0.09, 0.06, z + 0.3], [Math.PI / 2, 0, 0]);
      p(c, G.caixa(0.04, 0.35, 0.04), igneo, [s * 0.66, 0.4, z]);
    }
    // asas de brasa (membrana em leque)
    const asa = new THREE.Group();
    asa.position.set(s * 0.55, yT + 0.5, 0.05);
    for (let k = 0; k < 4; k++) {
      const osso = p(asa, G.cil(0.03, 0.05, 1.3 - k * 0.15, 4), obs2, [0, 0, 0]);
      apontar(osso, V(s * 1, 0.6 - k * 0.32, -0.4 - k * 0.1));
      osso.position.set(s * (0.55 - k * 0.04), 0.35 - k * 0.2, -0.3 - k * 0.12);
      p(asa, G.cone(0.22, 1.15 - k * 0.12, 3), k % 2 ? lava : igneo, [s * (0.6 - k * 0.04), 0.3 - k * 0.2, -0.32 - k * 0.12], [0, 0, -s * (1.0 - k * 0.3)], [1, 1, 0.25]);
    }
    c.add(asa);
    u.asas.push({ obj: asa, base: s * 0.2, lado: s });
  }
  // cauda em segmentos com chama na ponta
  const cauda = new THREE.Group();
  cauda.position.set(0, yT, -1.0);
  for (let i = 0; i < 5; i++) {
    p(cauda, G.ico(0.27 - i * 0.04, 0), obs, [0, 0.02 - i * 0.1, -0.2 - i * 0.24], null, [1, 0.9, 1.5]);
    p(cauda, G.cone(0.05, 0.2, 4), igneo, [0, 0.22 - i * 0.12, -0.2 - i * 0.24], [-0.4, 0, 0]);
  }
  const chamaCauda = p(cauda, G.cone(0.2, 0.7, 5), fogoM, [0, -0.45, -1.55], [-1.8, 0, 0]);
  u.pulsos.push({ obj: chamaCauda, base: 1, amp: 0.3, vel: 8 });
  c.add(cauda);
  u.caudas.push(cauda);
  // brasas ígneas girando em volta
  for (let i = 0; i < 6; i++) {
    const o = p(c, G.octa(0.1), i % 2 ? igneo : fogoM, [0, 0, 0], null, [1, 1.8, 1]);
    u.orbitas.push({ obj: o, raio: 1.6, vel: 1.4, y: yT + 0.6 + (i % 3) * 0.3, fase: (i / 6) * Math.PI * 2 });
  }
  olhos(c, yC + 0.1, zC + 0.38, 0.17, 0.1, '#ff3d6a');
}

// ---------- SUPER RARO: Silvárion, o chefe do Santuário da Árvore-Mãe ----------
// Cervo ancestral de casca e musgo, com uma galhada que é uma pequena floresta,
// flores de jade brilhando, cipós pendurados e folhas girando em volta
function silvarion(c, u) {
  const casca = mat('#5a3a24'), cascaEsc = mat('#3e2818'), musgo = mat('#3f8f3a'), musgoEsc = mat('#2c6a2e');
  const folha = mat('#4ea64a'), jade = brilho('#1fe0a0', 0.9), flor = brilho('#ffe14a', 0.8), rosa = brilho('#ff7eb6', 0.7);
  const yT = 1.35;
  // corpo de casca com uma manta de musgo nas costas
  p(c, G.ico(0.75, 1), casca, [0, yT, 0], null, [0.95, 0.85, 1.5]);
  p(c, G.ico(0.72, 1), musgo, [0, yT + 0.28, -0.05], null, [0.9, 0.5, 1.35]);
  p(c, G.ico(0.5, 1), cascaEsc, [0, yT - 0.05, 0.85], null, [0.95, 1, 0.8]);
  // veios de jade na casca
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    p(c, G.caixa(0.05, 0.5, 0.05), jade, [Math.cos(a) * 0.7, yT - 0.1 + Math.sin(a * 3) * 0.1, Math.sin(a) * 1.0], [0, a, 0.5]);
  }
  // mini árvores e flores crescendo nas costas
  for (let i = 0; i < 4; i++) {
    const z = 0.45 - i * 0.35, x = (i % 2 ? 1 : -1) * 0.22;
    p(c, G.cil(0.03, 0.05, 0.3, 4), cascaEsc, [x, yT + 0.6, z]);
    const copa = p(c, G.cone(0.16, 0.42, 5), i % 2 ? musgoEsc : folha, [x, yT + 0.92, z]);
    u.pulsos.push({ obj: copa, base: 1, amp: 0.08, vel: 2 + i });
  }
  [[0.4, 0.3, rosa], [-0.38, -0.2, flor], [0.3, -0.6, flor], [-0.2, 0.55, rosa]].forEach(([x, z, m]) => p(c, G.ico(0.08, 0), m, [x, yT + 0.55, z]));
  // pernas finas com cascos de pedra
  for (const s of [-1, 1]) for (const z of [0.7, -0.75]) {
    p(c, G.cil(0.1, 0.15, 0.9, 6), casca, [s * 0.42, 0.95, z]);
    p(c, G.cil(0.08, 0.1, 0.75, 6), cascaEsc, [s * 0.42, 0.38, z + 0.05]);
    p(c, G.cil(0.13, 0.15, 0.14, 6), mat('#8f9a86'), [s * 0.42, 0.07, z + 0.05]);
    p(c, G.ico(0.13, 0), musgo, [s * 0.42, 1.3, z]); // musgo no joelho
  }
  // pescoço e cabeça de cervo
  const zC = 1.4, yC = yT + 1.05;
  p(c, G.cil(0.22, 0.34, 0.95, 6), casca, [0, yT + 0.55, 1.05], [0.65, 0, 0]);
  p(c, G.ico(0.34, 1), casca, [0, yC, zC], null, [0.9, 0.9, 1.1]);
  p(c, G.caixa(0.32, 0.26, 0.5), cascaEsc, [0, yC - 0.12, zC + 0.38]);
  p(c, G.esf(1), mat('#1b1b30'), [0, yC - 0.06, zC + 0.64], null, 0.06);
  p(c, G.ico(0.3, 0), musgo, [0, yC + 0.12, zC - 0.25], null, [1.3, 0.6, 1]); // juba de musgo
  for (const s of [-1, 1]) {
    // orelhas de folha
    apontar(p(c, G.cone(0.1, 0.38, 4), folha, [s * 0.3, yC + 0.15, zC - 0.05]), V(s, 0.4, -0.3));
    // galhada: um galho grosso que se divide em vários, com folhas e flores de jade
    const g = new THREE.Group();
    g.position.set(s * 0.17, yC + 0.25, zC - 0.08);
    const ramos = [[V(s * 0.5, 1, -0.2), 0.8, 0.06], [V(s * 1, 0.7, 0.1), 0.6, 0.045], [V(s * 0.2, 1, 0.4), 0.55, 0.045], [V(s * 0.8, 1, -0.6), 0.6, 0.04]];
    ramos.forEach(([dir, comp, r], k) => {
      const o = p(g, G.cil(r * 0.6, r, comp, 5), cascaEsc, [0, 0, 0]);
      apontar(o, dir);
      const d = dir.clone().normalize();
      const base = k === 0 ? V(0, 0, 0) : V(s * 0.1, 0.35, -0.05);
      o.position.copy(base).addScaledVector(d, comp / 2);
      const ponta = base.clone().addScaledVector(d, comp);
      p(g, G.ico(0.16 + (k === 0 ? 0.06 : 0), 0), k % 2 ? musgoEsc : folha, [ponta.x, ponta.y, ponta.z]);
      const fl = p(g, G.ico(0.07, 0), k % 2 ? flor : jade, [ponta.x, ponta.y + 0.14, ponta.z + 0.05]);
      u.pulsos.push({ obj: fl, base: 1, amp: 0.3, vel: 4 + k });
    });
    c.add(g);
    // cipós pendurados da galhada
    for (let k = 0; k < 2; k++) p(c, G.caixa(0.025, 0.5 + k * 0.2, 0.025), mat('#3a6a2a'), [s * (0.45 + k * 0.25), yC + 0.35 - k * 0.1, zC - 0.15 - k * 0.1]);
  }
  // cauda de folhas
  const cauda = new THREE.Group();
  cauda.position.set(0, yT + 0.2, -1.05);
  for (let i = 0; i < 3; i++) p(cauda, G.cone(0.12 - i * 0.02, 0.45, 4), i % 2 ? musgo : folha, [0, -i * 0.1, -0.15 - i * 0.18], [-1.2, 0, 0]);
  c.add(cauda);
  u.caudas.push(cauda);
  // folhas e esporos de jade girando em volta
  for (let i = 0; i < 8; i++) {
    const o = p(c, G.octa(0.09), i % 2 ? jade : folha, [0, 0, 0], null, [1, 0.4, 1.8]);
    u.orbitas.push({ obj: o, raio: 1.7, vel: 1.1, y: yT + 0.3 + (i % 4) * 0.35, fase: (i / 8) * Math.PI * 2 });
  }
  olhos(c, yC + 0.08, zC + 0.28, 0.15, 0.08, '#1fe0a0');
}

// LENDÁRIO: Serpe da Tormenta (peças do Blender da Arena; o modelo e a animação ficam em js/lendarios/serpe-modelo.js)
function serpe(c, u) { montarSerpe(c, u); }
// LENDÁRIO: Colosso de Basalto (js/lendarios/colosso-modelo.js)
function colosso(c, u) { montarColosso(c, u); }
// LENDÁRIO: Sentinela de Geada (js/lendarios/geada-modelo.js)
function geada(c, u) { montarGeada(c, u); }
// LENDÁRIO: Arauto das Cinzas (js/lendarios/arauto-modelo.js)
function arauto(c, u) { montarArauto(c, u); }

const RAROS_MODELO = { vulcarapa, aquaraia, espinhal, ignarion, silvarion, serpe, colosso, geada, arauto };

// =============================================================
// JUNTAR PEÇAS (deixa o jogo leve no celular)
// Cada monstro é feito de umas 30 peças. Desenhar cada uma separada custa caro:
// é um "pedido de desenho" por peça, todo quadro. Aqui as peças PARADAS que têm
// a mesma aparência (mesma cor, brilho e transparência) viram uma peça só.
// As que se mexem sozinhas (caudas, asas, pernas, peças que pulsam, giram ou
// soltam fumaça) ficam separadas, então as animações continuam iguais.
// Peças dentro de um grupo que se mexe (ex.: as partes de uma asa) são juntadas
// dentro do próprio grupo, e o grupo continua se mexendo inteiro.
// =============================================================
const SEM_INDICE = new WeakMap();
const _m3 = new THREE.Matrix3(), _v3 = new THREE.Vector3();
function chaveMaterial(m) {
  return [m.type, m.color?.getHexString(), m.emissive?.getHexString(), m.emissiveIntensity, m.transparent, m.opacity, m.side, m.flatShading].join('|');
}
function semIndice(geo) {
  if (!SEM_INDICE.has(geo)) SEM_INDICE.set(geo, geo.index ? geo.toNonIndexed() : geo);
  return SEM_INDICE.get(geo);
}
function pecasQueMexem(u) {
  const fixos = new Set([u.sombra, ...u.caudas, ...(u.pernas || []), ...(u.bracos || [])]);
  for (const lista of [u.asas, u.giros, u.orbitas, u.pulsos, u.fumacas]) for (const x of lista || []) fixos.add(x.obj);
  return fixos;
}
export function juntarPecas(raiz, fixos = new Set()) {
  const visitar = (g) => {
    const grupos = new Map();
    for (const o of g.children) {
      if (o.isMesh && !o.isInstancedMesh && !fixos.has(o) && !o.children.length) {
        const k = chaveMaterial(o.material);
        if (!grupos.has(k)) grupos.set(k, []);
        grupos.get(k).push(o);
      } else if (o.children.length) visitar(o);
    }
    for (const lista of grupos.values()) {
      if (lista.length < 2) continue;
      let total = 0;
      const geos = lista.map((o) => { const geo = semIndice(o.geometry); total += geo.attributes.position.count; return geo; });
      const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
      let k = 0;
      lista.forEach((o, i) => {
        o.updateMatrix();
        _m3.getNormalMatrix(o.matrix);
        const espelho = o.matrix.determinant() < 0; // escala negativa: inverte a ordem dos vértices
        const P = geos[i].attributes.position, N = geos[i].attributes.normal;
        for (let t = 0; t < P.count; t += 3) {
          const ordem = espelho ? [0, 2, 1] : [0, 1, 2];
          for (const d of ordem) {
            const j = t + d;
            _v3.fromBufferAttribute(P, j).applyMatrix4(o.matrix);
            pos[k] = _v3.x; pos[k + 1] = _v3.y; pos[k + 2] = _v3.z;
            if (N) _v3.fromBufferAttribute(N, j).applyMatrix3(_m3).normalize(); else _v3.set(0, 1, 0);
            nor[k] = _v3.x; nor[k + 1] = _v3.y; nor[k + 2] = _v3.z;
            k += 3;
          }
        }
        g.remove(o);
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geo.computeBoundingSphere();
      const junto = new THREE.Mesh(geo, lista[0].material);
      junto.userData.geometriaPropria = true; // é só deste modelo: some junto com ele
      g.add(junto);
    }
  };
  visitar(raiz);
  return raiz;
}

export function criarModelo(especie) {
  if (temGLB(especie)) return criarModeloGLB(especie);
  return criarModeloSimples(especie);
}

// Modelo de formas simples (o de sempre)
function criarModeloSimples(especie) {
  const esp = ESPECIES[especie];
  const m = base(esp.tamanho, esp.estagio);
  const u = m.userData;
  if (esp.linha) LINHAS_MODELO[esp.linha](u.corpo, u, esp.estagio);
  else RAROS_MODELO[especie](u.corpo, u);
  u.especie = especie;
  juntarPecas(m, pecasQueMexem(u));
  return m;
}

// Modelo do Blender (.glb), do mesmo tamanho que o modelo de formas simples da espécie
const ALTURAS_SIMPLES = {};
function alturaSimples(especie) {
  if (ALTURAS_SIMPLES[especie] == null) {
    const m = criarModeloSimples(especie);
    m.userData.sombra.visible = false;
    m.updateMatrixWorld(true);
    const caixa = new THREE.Box3().setFromObject(m.userData.corpo);
    ALTURAS_SIMPLES[especie] = caixa.max.y - caixa.min.y;
    descartar(m);
  }
  return ALTURAS_SIMPLES[especie];
}
function criarModeloGLB(especie) {
  const esp = ESPECIES[especie];
  const m = base(1, esp.estagio);                // a escala já vem certa do .glb
  m.userData.sombra.scale.setScalar(0.75 * esp.tamanho * (1 + esp.estagio * 0.15));
  m.userData.especie = especie;
  montarGLB(especie, m, alturaSimples(especie));
  return m;
}

// (O treinador antigo do Cristalia saiu: o jogador agora é o Invocador, em js/invocador.js.)

// ---------- Coroa do líder de grupo ----------
export function criarCoroa(escala = 1) {
  const g = new THREE.Group();
  const ouro = brilho('#ffd23f', 0.8);
  p(g, G.toro(0.28, 0.06, Math.PI * 2, 4, 16), ouro, [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    p(g, G.cone(0.07, 0.24, 4), ouro, [Math.cos(a) * 0.28, 0.13, Math.sin(a) * 0.28]);
  }
  p(g, G.octa(0.08), brilho('#ff4f8a', 0.8), [0, 0.05, 0.3]);
  g.scale.setScalar(escala);
  g.userData.coroa = true;
  juntarPecas(g);
  return g;
}

// ---------- Casa portátil (base) ----------
export function criarCasa() {
  const g = new THREE.Group();
  const parede = mat('#f3e3c3'), madeira = mat('#8a5a3a'), telhado = mat('#d9534f'), pedra = mat('#c9c0ad');
  p(g, G.caixa(4.4, 0.3, 3.8), pedra, [0, 0.15, 0]);
  p(g, G.caixa(3.6, 2.2, 3.0), parede, [0, 1.4, 0]);
  const teto = p(g, G.cone(3.1, 1.7, 4), telhado, [0, 3.35, 0], [0, Math.PI / 4, 0]);
  teto.scale.set(1, 1, 0.88);
  // vigas nos cantos
  for (const [x, z] of [[-1.8, 1.5], [1.8, 1.5], [-1.8, -1.5], [1.8, -1.5]]) p(g, G.caixa(0.2, 2.2, 0.2), madeira, [x, 1.4, z]);
  p(g, G.caixa(0.95, 1.45, 0.1), madeira, [0, 1.03, 1.52]);
  p(g, G.esf(0.06), mat('#ffd23f'), [0.3, 1.0, 1.59]);
  const janelas = [];
  for (const x of [-1.15, 1.15]) {
    const j = p(g, G.caixa(0.7, 0.6, 0.08), mat('#9fe0ff', { emissive: '#ffd37a', emissiveIntensity: 0.1 }), [x, 1.6, 1.52]);
    p(g, G.caixa(0.8, 0.08, 0.12), madeira, [x, 1.26, 1.55]);
    janelas.push(j);
  }
  p(g, G.caixa(0.45, 1.2, 0.45), pedra, [1.0, 3.6, -0.5]);
  // sinal de cura (cruz verde) acima da porta
  const cruz = brilho('#5fe08a', 0.8);
  p(g, G.caixa(0.5, 0.15, 0.08), cruz, [0, 2.15, 1.55]);
  p(g, G.caixa(0.15, 0.5, 0.08), cruz, [0, 2.15, 1.55]);
  p(g, G.caixa(1.2, 0.04, 0.7), mat('#c9533a'), [0, 0.32, 2.3]);
  // bandeira no telhado
  p(g, G.cil(0.03, 0.03, 1.2, 4), madeira, [-1.0, 4.0, 0.2]);
  const bandeira = p(g, G.caixa(0.6, 0.35, 0.03), mat('#8ff4ff'), [-0.7, 4.4, 0.2]);
  const fumacas = [];
  for (let i = 0; i < 3; i++) fumacas.push(p(g, G.ico(0.22, 0), mat('#e0e0e0', { transparent: true, opacity: 0.7, depthWrite: false }), [1.0, 4.3, -0.5]));
  g.userData = { janelas, fumacas, bandeira };
  return g;
}

export function animarCasa(casa, t, noite) {
  const u = casa.userData;
  u.fumacas.forEach((f, i) => {
    const k = (t * 0.35 + i / 3) % 1;
    f.position.set(1.0 + k * 0.4, 4.3 + k * 1.6, -0.5);
    f.scale.setScalar(0.6 + k * 1.2);
    f.material.opacity = 0.7 * (1 - k);
  });
  for (const j of u.janelas) j.material.emissiveIntensity = 0.1 + noite * 0.9;
  u.bandeira.rotation.y = Math.sin(t * 3) * 0.3;
}

// ---------- Pedra de selamento (provisória, até o modelo 3D do Blender) ----------
// Pedra facetada de 6 lados (como o emblema) com um anel de runa aceso em volta.
// tipo: 0 azul, 1 roxa, 2 dourada. O nome criarCristal ficou do Cristalia.
// Leve: a pedra tem 24 triângulos e o anel 72; o anel e a forma são reaproveitados por todas as pedras.
const GEO_PEDRA = new THREE.LatheGeometry([
  new THREE.Vector2(0, -0.36), new THREE.Vector2(0.2, -0.22), new THREE.Vector2(0.24, 0.12), new THREE.Vector2(0, 0.4),
], 6);
GEO_PEDRA.computeVertexNormals();
const GEO_ANEL_PEDRA = new THREE.TorusGeometry(0.3, 0.025, 3, 24);
const MAT_ANEL_PEDRA = CRISTAIS.map((c) => new THREE.MeshBasicMaterial({ color: c.cor, transparent: true, opacity: 0.9 }));

export function criarCristal(escala = 1, tipo = 0) {
  const c = CRISTAIS[tipo];
  const m = new THREE.Mesh(GEO_PEDRA, new THREE.MeshLambertMaterial({ color: c.pedra, emissive: c.emissivo, emissiveIntensity: 0.35, flatShading: true }));
  const anel = new THREE.Mesh(GEO_ANEL_PEDRA, MAT_ANEL_PEDRA[tipo]);
  anel.rotation.x = Math.PI / 2 - 0.25;
  anel.position.y = -0.02;
  m.add(anel);
  m.userData.anel = anel;
  m.scale.setScalar(escala);
  return m;
}

export function pintarCristal(m, tipo) {
  const c = CRISTAIS[tipo];
  m.material.color.set(c.pedra);
  m.material.emissive.set(c.emissivo);
  if (m.userData.anel) m.userData.anel.material = MAT_ANEL_PEDRA[tipo];
}

// Aura de tipo duplo: dois anéis girando, um de cada cor (fica em volta do monstro no mapa)
export function criarAuraDupla(cores, raio = 1) {
  const g = new THREE.Group();
  cores.forEach((cor, i) => {
    const anel = new THREE.Mesh(G.toro(raio, 0.045, Math.PI * 1.3, 4, 20), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.85 }));
    anel.rotation.x = -Math.PI / 2;
    anel.position.y = 0.15 + i * 0.12;
    g.add(anel);
  });
  g.userData.aura = true;
  return g;
}
export function animarAura(g, t) {
  g.children.forEach((a, i) => { a.rotation.z = t * (i ? -2.2 : 1.8); });
}

// ---------- Animação parada/andando ----------
export function animarModelo(modelo, t, movendo) {
  const u = modelo.userData;
  if (u.glb) { animarGLB(modelo, t, movendo); return; } // modelo do Blender: as animações do arquivo
  if (u.animar) { u.animar(t, movendo); return; }        // lendários: animação própria (js/lendarios/)
  const c = u.corpo;
  const fase = t * (movendo ? 11 : 3) + u.fase;
  if (u.voa) {
    c.position.y = 0.25 + Math.sin(fase * 0.5) * 0.15;
    c.rotation.z = Math.sin(fase * 0.4) * 0.1;
  } else if (u.gelatina) {
    const s = Math.sin(fase) * (movendo ? 0.1 : 0.05);
    c.scale.set(u.tamanho * (1 - s * 0.5), u.tamanho * (1 + s), u.tamanho * (1 - s * 0.5));
    c.position.y = movendo ? Math.abs(Math.sin(fase * 0.5)) * 0.25 : 0;
  } else {
    c.position.y = Math.abs(Math.sin(fase)) * (movendo ? 0.12 : 0.03);
  }
  for (const g of u.caudas) g.rotation.y = (g.userData.baseY || 0) + Math.sin(fase * 0.8) * 0.45;
  for (const a of u.asas) a.obj.rotation.z = a.base + a.lado * Math.sin(t * 7 + u.fase) * 0.35;
  for (const g of u.giros) g.obj.rotation[g.eixo] = t * g.vel;
  for (const o of u.orbitas) {
    const a = t * o.vel + o.fase;
    o.obj.position.set(Math.cos(a) * o.raio, o.y + Math.sin(t * 2 + o.fase) * 0.1, Math.sin(a) * o.raio);
    o.obj.rotation.y = a;
  }
  for (const pl of u.pulsos) pl.obj.scale.setScalar(pl.base * (1 + Math.sin(t * pl.vel + u.fase) * pl.amp));
  u.fumacas.forEach((f, i) => {
    const k = (t * 0.6 + u.fase + i * 0.33) % 1;
    f.obj.position.set(f.x, f.y + k * f.alt, f.z);
    f.obj.scale.setScalar(0.6 + k);
    f.obj.material.opacity = 0.75 * (1 - k);
  });
  if (u.pernas) {
    const a = movendo ? Math.sin(t * 11) * 0.7 : 0;
    u.pernas[0].rotation.x = a;
    u.pernas[1].rotation.x = -a;
    u.bracos[0].rotation.x = -a * 0.8;
    u.bracos[1].rotation.x = a * 0.8;
  }
}

// Faz o modelo brilhar com uma cor (k de 0 a 1). Usado ao levar dano e ao preparar golpes.
export function piscar(modelo, k, cor = '#ffffff') {
  if (modelo.userData.glb) { piscarGLB(modelo, k, cor); return; }
  const alvo = new THREE.Color(cor);
  modelo.traverse((o) => {
    if (!o.isMesh || !o.material.emissive || o.material === MAT_SOMBRA) return;
    // A cor original fica guardada no MATERIAL (várias peças podem dividir o mesmo material)
    const md = o.material.userData;
    if (!md.emOrig) {
      md.emOrig = o.material.emissive.clone();
      md.emIntOrig = o.material.emissiveIntensity;
    }
    if (k <= 0) {
      o.material.emissive.copy(md.emOrig);
      o.material.emissiveIntensity = md.emIntOrig;
    } else {
      o.material.emissive.copy(md.emOrig).lerp(alvo, k);
      o.material.emissiveIntensity = Math.max(md.emIntOrig, k);
    }
  });
}

export function descartar(obj) {
  if (obj.userData?.glb) descartarGLB(obj);
  obj.traverse((o) => {
    if ((o.isMesh || o.isPoints) && o.material !== MAT_SOMBRA && !o.material.userData?.fixo) {
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material.dispose();
    }
    if (o.userData.geometriaPropria) o.geometry.dispose();
  });
}
