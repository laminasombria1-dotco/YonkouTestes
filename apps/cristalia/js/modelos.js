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
import { temGLB, montarGLB, animarGLB, piscarGLB, descartarGLB } from './modelos3d.js';
export { carregarModelos3D, tocarGolpe, ajustarGiro, pararGolpe } from './modelos3d.js';

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
  if (e === 3) { lobisomemLunar(c, u); return; }
  p(c, G.esf(0.45, 10, 8), corp, [0, 1.0, 0], null, [1, 1.3, 0.9]);
  p(c, G.esf(0.36, 10, 8), corp, [0, 1.78, 0.05]);
  for (const s of [-1, 1]) {
    orelha(s * 0.15, 2.05, 0, 0.75, true);
    p(c, G.cil(0.12, 0.14, 0.55, 6), corp, [s * 0.2, 0.3, 0]);
    p(c, G.esf(1), corp, [s * 0.2, 0.06, 0.1], null, [0.14, 0.08, 0.24]);
    p(c, G.cil(0.07, 0.08, 0.55, 5), corp, [s * 0.5, 1.05, 0.05], [0, 0, s * 0.3]);
  }
  p(c, G.toro(0.12, 0.035, Math.PI * 1.3, 4, 10), marca, [0, 1.98, 0.33], [0, 0, 0.9]);
  p(c, G.toro(0.7, 0.06, Math.PI * 1.2, 4, 18), marca, [0, 1.2, -0.45], [0, 0, -0.3]);
  olhos(c, 1.84, 0.37, 0.14, 0.09);
}

// Meia-lua de verdade (grossa no meio, fina nas pontas), achatada: formato ")"
// (para "(", use escala x negativa)
function geoMeiaLua() {
  return geo('meiaLua', () => {
    const f = new THREE.Shape();
    const n = 14;
    // borda de fora: círculo de raio 1; borda de dentro: círculo de raio 0,95 deslocado para a esquerda
    for (let i = 0; i <= n; i++) { const a = -1.89 + (3.78 * i) / n; f[i ? 'lineTo' : 'moveTo'](Math.cos(a), Math.sin(a)); }
    for (let i = 0; i <= n; i++) { const a = 1.533 - (3.066 * i) / n; f.lineTo(-0.35 + Math.cos(a) * 0.95, Math.sin(a) * 0.95); }
    return new THREE.ExtrudeGeometry(f, { depth: 0.08, bevelEnabled: false }).translate(0, 0, -0.04);
  });
}

// Plenilúnio: lobo da lua cheia com orelhas de coelho, armadura de prata,
// garras grandes, 2 luas crescentes nas costas e a lua cheia atrás. Flutua agachado.
function lobisomemLunar(c, u) {
  u.voa = true;
  const pelo = mat('#4d4182'), peloEsc = mat('#342a5e'), prata = mat('#d3d1e4'), prataEsc = mat('#9894b8');
  const garra = mat('#f0eef8'), boca = mat('#4a1428'), dente = mat('#ffffff'), orelhaIn = mat('#8e6cae'), nariz = mat('#1b1b30');
  const luz = brilho('#eeeaff', 0.55), cresc = brilho('#d8d2ff', 0.75), olho = brilho('#ffffff', 1);
  // cilindro de um ponto a outro (ossos dos braços e das pernas)
  const osso = (pai, a, b, r1, r2, m) => {
    const d = b.clone().sub(a);
    const o = p(pai, G.cil(r2, r1, 1, 6), m, [(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2]);
    apontar(o, d);
    o.scale.y = d.length();
    return o;
  };

  // ---- tronco curvado para a frente ----
  p(c, G.esf(0.38, 8, 6), pelo, [0, 1.0, -0.05], null, [1.05, 0.8, 0.9]);
  osso(c, V(0, 1.0, -0.05), V(0, 1.5, 0.08), 0.3, 0.42, peloEsc);
  p(c, G.esf(0.5, 9, 7), pelo, [0, 1.68, 0.1], [0.3, 0, 0], [1.4, 1.1, 0.95]);
  // placa de prata em V no peito
  for (const s of [-1, 1]) p(c, G.caixa(0.55, 0.1, 0.07), prata, [s * 0.23, 1.78, 0.55], [0.3, 0, s * 0.62]);
  p(c, G.octa(1), prata, [0, 1.52, 0.52], [0.3, 0, 0], [0.13, 0.22, 0.05]);
  // ombreiras com espinhos
  for (const s of [-1, 1]) {
    p(c, G.dode(0.34), prata, [s * 0.72, 1.97, 0.05], null, [1.15, 0.85, 1.05]);
    p(c, G.cone(0.13, 0.55, 5), prata, [s * 0.92, 2.22, 0], [0, 0, -s * 0.75]);
    p(c, G.cone(0.08, 0.34, 5), prataEsc, [s * 0.72, 2.16, -0.24], [-0.7, 0, -s * 0.3]);
  }
  // pelo espetado no pescoço e nas costas
  for (let i = 0; i < 7; i++) {
    const a = -1.2 + i * 0.4;
    p(c, G.cone(0.13, 0.5, 5), peloEsc, [Math.sin(a) * 0.36, 2.02, -0.18 + Math.cos(a) * 0.05], [-0.7, 0, -a * 0.6]);
  }

  // ---- cabeça de lobo (boca aberta) ----
  const cab = new THREE.Group();
  cab.position.set(0, 2.18, 0.42);
  cab.rotation.x = 0.12;
  c.add(cab);
  p(cab, G.esf(0.3, 9, 7), pelo, [0, 0, 0], null, [1.15, 0.95, 1.05]);
  p(cab, G.octa(1), prata, [0, 0.12, 0.22], null, [0.2, 0.13, 0.12]); // máscara de prata na testa
  for (const s of [-1, 1]) p(cab, G.caixa(0.06, 0.28, 0.05), prata, [s * 0.15, 0.2, 0.17], [0, 0, s * 0.5]);
  p(cab, G.cil(0.085, 0.17, 0.42, 6), pelo, [0, -0.03, 0.42], [Math.PI / 2, 0, 0]); // focinho
  p(cab, G.esf(0.06), nariz, [0, 0.01, 0.64]);
  p(cab, G.esf(0.13), boca, [0, -0.13, 0.38], null, [0.85, 0.55, 1.3]);
  p(cab, G.cil(0.065, 0.13, 0.36, 6), peloEsc, [0, -0.22, 0.35], [Math.PI / 2 + 0.38, 0, 0]); // queixo aberto
  for (const s of [-1, 1]) {
    for (const [x, z] of [[0.05, 0.56], [0.1, 0.44]]) {
      p(cab, G.cone(0.025, 0.1, 4), dente, [s * x, -0.1, z], [Math.PI, 0, 0]); // dentes de cima
      p(cab, G.cone(0.022, 0.08, 4), dente, [s * x * 0.9, -0.2, z - 0.06], [0.35, 0, 0]); // dentes de baixo
    }
    // olhos brilhando, bravos (o lado de dentro mais baixo)
    p(cab, G.esf(1), olho, [s * 0.13, 0.06, 0.28], [0, 0, s * 0.35], [0.075, 0.035, 0.03]);
    // tufos nas bochechas
    p(cab, G.cone(0.09, 0.3, 5), peloEsc, [s * 0.3, -0.06, 0.05], [0, 0, -s * 1.9]);
    // orelhas compridas de coelho
    const o = new THREE.Group();
    o.position.set(s * 0.14, 0.22, -0.08);
    o.rotation.set(-0.15, 0, -s * 0.22);
    p(o, G.cil(0.05, 0.11, 0.95, 6), pelo, [0, 0.47, 0]);
    p(o, G.esf(1), orelhaIn, [0, 0.47, 0.06], null, [0.06, 0.4, 0.03]);
    p(o, G.cone(0.05, 0.18, 6), pelo, [0, 1.03, 0]);
    cab.add(o);
  }

  // ---- braços compridos com braceletes e garras ----
  u.bracos = [-1, 1].map((s) => {
    const g = new THREE.Group();
    g.position.set(s * 0.72, 1.87, 0.05);
    const cot = V(s * 0.2, -0.5, 0.15), pulso = V(s * 0.28, -1.0, 0.38);
    osso(g, V(0, 0, 0), cot, 0.21, 0.17, pelo);
    p(g, G.esf(0.18), pelo, [cot.x, cot.y, cot.z]);
    osso(g, cot, pulso, 0.19, 0.24, pelo);
    osso(g, cot.clone().lerp(pulso, 0.25), cot.clone().lerp(pulso, 0.85), 0.24, 0.27, prata); // bracelete
    p(g, G.cone(0.08, 0.34, 5), prata, [cot.x + s * 0.24, cot.y - 0.25, cot.z + 0.05], [0, 0, -s * 1.4]);
    const mao = V(pulso.x + s * 0.03, pulso.y - 0.14, pulso.z + 0.1);
    p(g, G.esf(0.25, 8, 6), pelo, [mao.x, mao.y, mao.z], null, [1, 0.8, 1.1]);
    for (let k = 0; k < 4; k++) { // 4 garras grandes para baixo e para a frente
      p(g, G.cone(0.05, 0.46, 4), garra, [mao.x + (k - 1.5) * 0.11, mao.y - 0.2, mao.z + 0.16], [2.35, 0, 0]);
    }
    p(g, G.cone(0.05, 0.34, 4), garra, [mao.x - s * 0.22, mao.y - 0.06, mao.z + 0.1], [2.2, 0, s * 0.6]); // polegar
    c.add(g);
    return g;
  });

  // ---- pernas de lobo, agachadas ----
  u.pernas = [-1, 1].map((s) => {
    const g = new THREE.Group();
    g.position.set(s * 0.25, 0.95, -0.05);
    const joelho = V(s * 0.05, -0.35, 0.3), tornozelo = V(s * 0.05, -0.7, 0), dedos = V(s * 0.05, -0.9, 0.22);
    osso(g, V(0, 0, 0), joelho, 0.23, 0.18, pelo);
    p(g, G.octa(1), prata, [joelho.x, joelho.y, joelho.z + 0.12], null, [0.1, 0.12, 0.06]);
    osso(g, joelho, tornozelo, 0.14, 0.1, peloEsc);
    osso(g, tornozelo, dedos, 0.1, 0.12, pelo);
    for (let k = -1; k <= 1; k++) p(g, G.cone(0.03, 0.14, 4), garra, [dedos.x + k * 0.07, dedos.y + 0.02, dedos.z + 0.08], [1.9, 0, 0]);
    c.add(g);
    return g;
  });

  // ---- 2 luas crescentes nas costas, uma de cada lado: ( ) ----
  for (const s of [-1, 1]) p(c, geoMeiaLua(), cresc, [s * 0.78, 2.65, -0.5], [0, -s * 0.3, -s * 0.12], [s * 0.55, 0.88, 1]);

  // ---- a lua cheia atrás dele ----
  const lua = new THREE.Group();
  // a lua fica acima da cabeça: vista de trás (a câmera da batalha) ela não tapa o corpo
  lua.position.set(0, 3.45, -0.85);
  p(lua, G.esf(0.45, 14, 12), luz, [0, 0, 0]);
  const cratera = mat('#c3bbea');
  for (const lado of [1, -1]) { // crateras na frente e atrás
    for (const [x, y, r] of [[0.15, 0.13, 0.1], [-0.18, -0.07, 0.075], [0.03, -0.22, 0.06], [-0.07, 0.23, 0.045]]) p(lua, G.esf(r), cratera, [x * lado, y, 0.41 * lado]);
  }
  p(lua, G.esf(0.6, 12, 10), mat('#eeeaff', { transparent: true, opacity: 0.18, depthWrite: false }), [0, 0, 0]);
  c.add(lua);
  u.pulsos.push({ obj: lua, base: 1, amp: 0.04, vel: 2 });
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
  fogoPlanta: linhaFogoPlanta, aguaFogo: linhaAguaFogo, terraRaio: linhaTerraRaio,
  aquaraia: linhaAquaraia, vulcarapa: linhaVulcarapa, espinhal: linhaEspinhal, ignarion: linhaIgnarion, silvarion: linhaSilvarion }; // raros e lendários com formas novas (a chave é a da linha em LINHAS_RARAS)

// =============================================================
// LENDÁRIOS (os 3 raros com formas novas ficam em linhaVulcarapa, linhaAquaraia e linhaEspinhal)
// =============================================================
// ---------- Raro de Fogo: Vulcarapa > Basaltuga > Crateruga > Colossarapa ----------
// Tartaruga-artilharia: o vulcão do casco cresce a cada forma. A fumaça sobe da boca (u.fumacas).
function corpoTartaruga(c, pele, k, cabecaZ) {
  p(c, G.esf(1), pele, [0, 0.42 * k, 0], null, [0.8 * k, 0.36 * k, 0.95 * k]);
  p(c, G.ico(0.34 * k, 1), pele, [0, 0.55 * k, cabecaZ * k]);
  for (const [x, z] of [[-0.55, 0.5], [0.55, 0.5], [-0.55, -0.5], [0.55, -0.5]]) p(c, G.cil(0.16 * k, 0.19 * k, 0.36 * k, 6), pele, [x * k, 0.18 * k, z * k]);
}

function linhaVulcarapa(c, u, e) {
  const fumaca = (y, z, tam, alt) => u.fumacas.push({ obj: p(c, G.ico(tam, 0), mat('#c9c3b8', { transparent: true, opacity: 0.8 }), [0, y, z]), x: 0, y, z, alt });
  if (e === 0) { // Vulcarapa (a de sempre)
    const pele = mat('#93b26c');
    p(c, G.esf(1), pele, [0, 0.45, 0], null, [0.75, 0.38, 0.9]);
    p(c, G.cil(0.32, 0.85, 0.75, 7), mat('#7a4e33'), [0, 0.95, -0.05]);
    p(c, G.cil(0.26, 0.26, 0.08, 7), brilho('#ff5a1f', 0.8), [0, 1.33, -0.05]);
    p(c, G.ico(0.33, 1), pele, [0, 0.55, 0.85]);
    for (const [x, z] of [[-0.5, 0.45], [0.5, 0.45], [-0.5, -0.45], [0.5, -0.45]]) p(c, G.cil(0.15, 0.17, 0.34, 6), pele, [x, 0.17, z]);
    fumaca(1.5, -0.05, 0.2, 0.7);
    olhos(c, 0.66, 1.1, 0.14, 0.09);
    return;
  }
  if (e === 1) { // Basaltuga: placas de basalto com lava acesa nas rachaduras
    const pele = mat('#6f8a5a'), basalto = mat('#3b3a40'), lava = brilho('#ff5a1f', 0.9);
    corpoTartaruga(c, pele, 1, 0.9);
    p(c, G.esf(1, 7, 5), brilho('#ff6a1f', 0.9), [0, 0.66, -0.05], null, [0.82, 0.5, 0.94]);
    for (const [x, z] of [[0, 0], [-0.4, 0.28], [0.4, 0.28], [-0.4, -0.32], [0.4, -0.32], [0, 0.55], [0, -0.58], [-0.68, 0], [0.68, 0]]) {
      const ex = 0.86, ey = 0.52, ez = 0.98;
      const y = ey * Math.sqrt(Math.max(0.05, 1 - (x / ex) ** 2 - (z / ez) ** 2));
      apontar(p(c, G.cil(0.25, 0.27, 0.12, 6), basalto, [x, 0.68 + y, z - 0.05]), V(x / (ex * ex), y / (ey * ey), z / (ez * ez)));
    }
    p(c, G.cil(0.28, 0.5, 0.6, 7), basalto, [0, 1.3, -0.1]);
    p(c, G.cil(0.24, 0.24, 0.06, 7), lava, [0, 1.6, -0.1]);
    for (const s of [-1, 1]) { p(c, G.cil(0.08, 0.14, 0.25, 5), basalto, [s * 0.55, 1.0, -0.35], [0, 0, -s * 0.5]); p(c, G.esf(1), lava, [s * 0.6, 1.12, -0.35], null, 0.06); }
    fumaca(1.8, -0.1, 0.22, 0.8);
    olhos(c, 0.66, 1.18, 0.15, 0.09);
    return;
  }
  if (e === 2) { // Crateruga: o casco é a borda de uma cratera com um lago de lava
    const k = 1.08, pele = mat('#5a6a4a'), rocha = mat('#4a3a36'), escuro = mat('#2c2428'), lava = brilho('#ff5a1f', 1);
    corpoTartaruga(c, pele, k, 0.95);
    p(c, G.cil(0.95, 1.0, 0.55, 9), rocha, [0, 0.82, -0.05]);
    p(c, G.cil(0.78, 0.78, 0.06, 9), lava, [0, 1.11, -0.05]);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      p(c, G.cone(0.14, 0.4, 4), escuro, [Math.sin(a) * 0.88, 1.25, Math.cos(a) * 0.88 - 0.05], [Math.cos(a) * -0.3, 0, Math.sin(a) * 0.3]);
    }
    for (const [x, z, h] of [[0, -0.25, 0.6], [-0.35, 0.2, 0.38], [0.35, 0.2, 0.38]]) {
      p(c, G.cil(0.08, 0.24, h, 6), escuro, [x, 1.12 + h / 2, z]);
      p(c, G.esf(1), lava, [x, 1.12 + h, z], null, 0.08);
    }
    for (const [x, z] of [[-0.6, 0.55], [0.6, 0.55], [-0.6, -0.55], [0.6, -0.55]]) p(c, G.dode(0.16), escuro, [x * k, 0.38, z * k]);
    fumaca(1.9, -0.25, 0.22, 0.8);
    olhos(c, 0.7, 1.33, 0.16, 0.1, '#ffb030');
    return;
  }
  // Colossarapa: obsidiana com rios de lava, vulcão gigante, chifres e 3 pedras de lava girando
  const k = 1.15, pele = mat('#4a4a44'), obsidiana = mat('#1f1a22'), lava = brilho('#ff5a1f', 1), ouro = brilho('#ffb030', 0.8);
  corpoTartaruga(c, pele, k, 0.95);
  p(c, G.esf(1, 9, 6), obsidiana, [0, 0.85, -0.05], null, [1.05, 0.62, 1.15]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    p(c, G.cil(0.05, 0.08, 0.9, 4), lava, [Math.sin(a) * 0.66, 1.05, Math.cos(a) * 0.72 - 0.05], [Math.cos(a) * 0.9, 0, -Math.sin(a) * 0.9]);
  }
  p(c, G.cil(0.32, 0.75, 1.0, 8), obsidiana, [0, 1.75, -0.15]);
  p(c, G.cil(0.3, 0.3, 0.06, 8), lava, [0, 2.26, -0.15]);
  p(c, G.cone(0.2, 0.55, 6), brilho('#ffd06a', 1), [0, 2.5, -0.15]);
  for (const s of [-1, 1]) p(c, G.cone(0.08, 0.45, 4), ouro, [s * 0.2, 0.95, 1.12], [-0.5, 0, s * 0.4]);
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    p(g, G.dode(0.2), obsidiana);
    p(g, G.ico(0.13, 0), lava, [0.06, 0.06, 0.06]);
    c.add(g);
    u.orbitas.push({ obj: g, raio: 1.55, vel: 0.7, y: 1.6, fase: (i / 3) * Math.PI * 2 });
  }
  fumaca(2.9, -0.15, 0.3, 1.1);
  olhos(c, 0.72, 1.4, 0.17, 0.1, '#ff6a1f');
}

// ---------- Raro de Água: Aquaraia > Ventaraia > Mantaré > Leviaraia ----------
// A forma inicial é a arraia de sempre. Nas evoluções as asas ficam separadas para
// bater de verdade (u.asas), o rabo ganha ferrão e bolhas/gotas giram em volta (u.orbitas).
function asaRaia(c, u, s, dorso, borda, larg, prof, y, pontas, corPonta) {
  const g = new THREE.Group();
  g.position.set(s * 0.35, y, 0);
  c.add(g);
  p(g, G.octa(1), dorso, [s * larg * 0.5, 0, -0.05], null, [larg * 0.62, 0.2, prof]);
  p(g, G.octa(1), borda, [s * larg * 0.5, -0.05, 0], null, [larg * 0.5, 0.15, prof * 0.8]);
  for (let i = 0; i < pontas; i++) { // pontinhas na borda de trás da asa
    const t = (i + 1) / (pontas + 1);
    p(g, G.cone(0.1, 0.4, 4), corPonta, [s * larg * (0.2 + t * 0.75), 0.02, -prof * 0.55 * (1 - Math.abs(t - 0.5))], [-Math.PI / 2 - 0.3, 0, 0]);
  }
  u.asas.push({ obj: g, lado: s, base: 0 });
}

function linhaAquaraia(c, u, e) {
  u.voa = true;
  if (e === 0) { // Aquaraia (a de sempre)
    const dorso = mat('#3a8ee0'), claro = mat('#bfe8ff');
    p(c, G.octa(1), dorso, [0, 1.1, 0], null, [1.5, 0.26, 1.0]);
    p(c, G.octa(1), claro, [0, 1.04, 0.05], null, [1.2, 0.2, 0.8]);
    p(c, G.cone(0.07, 1.4, 4), dorso, [0, 1.1, -1.4], [-Math.PI / 2, 0, 0]);
    for (const s of [-1, 1]) p(c, G.cone(0.08, 0.35, 4), claro, [s * 0.3, 1.12, 0.95], [Math.PI / 2, 0, 0]);
    olhos(c, 1.27, 0.5, 0.3, 0.1);
    u.sombra.scale.set(1.1, 0.8, 1);
    return;
  }
  if (e === 1) { // Ventaraia: asas longas, rabo com ferrão e fitas de vento
    const dorso = mat('#2f9ad8'), claro = mat('#d8f4ff'), vento = mat('#ffffff', { transparent: true, opacity: 0.85 });
    p(c, G.octa(1), dorso, [0, 1.1, 0.1], null, [0.75, 0.3, 1.05]);
    p(c, G.octa(1), claro, [0, 1.04, 0.15], null, [0.6, 0.22, 0.85]);
    for (const s of [-1, 1]) asaRaia(c, u, s, dorso, claro, 1.25, 0.8, 1.1, 2, vento);
    p(c, G.cone(0.07, 1.9, 4), dorso, [0, 1.1, -1.75], [-Math.PI / 2, 0, 0]);
    p(c, G.cone(0.12, 0.4, 4), claro, [0, 1.1, -2.75], [-Math.PI / 2, 0, 0]);
    for (const s of [-1, 1]) p(c, G.cone(0.05, 1.1, 3), vento, [s * 0.9, 1.15, -0.95], [-Math.PI / 2, 0, s * 0.2]);
    for (const s of [-1, 1]) p(c, G.cone(0.08, 0.4, 4), claro, [s * 0.3, 1.14, 1.15], [Math.PI / 2, 0, 0]);
    olhos(c, 1.3, 0.75, 0.32, 0.11);
    u.sombra.scale.set(1.4, 0.9, 1);
    return;
  }
  if (e === 2) { // Mantaré: manta azul-escura com manchas, crista de onda e 3 bolhas
    const dorso = mat('#1f4f9a'), claro = mat('#e8f6ff'), crista = mat('#7fd6ff'), mancha = mat('#ffffff');
    p(c, G.octa(1), dorso, [0, 1.15, 0.1], null, [0.85, 0.36, 1.2]);
    p(c, G.octa(1), claro, [0, 1.07, 0.18], null, [0.7, 0.25, 1.0]);
    for (const s of [-1, 1]) asaRaia(c, u, s, dorso, claro, 1.4, 0.9, 1.15, 3, crista);
    for (const [x, z] of [[-0.35, 0.2], [0.35, 0.2], [0, -0.3], [-0.2, -0.65], [0.2, -0.65]]) p(c, G.esf(1, 6, 4), mancha, [x, 1.43, z], null, [0.13, 0.04, 0.13]);
    for (const s of [-1, 1]) p(c, G.cone(0.14, 0.6, 4), dorso, [s * 0.42, 1.12, 1.35], [Math.PI / 2 - 0.2, 0, -s * 0.5]);
    p(c, G.cone(0.08, 2.2, 4), dorso, [0, 1.15, -2.0], [-Math.PI / 2, 0, 0]);
    p(c, G.cone(0.15, 0.5, 4), brilho('#6fe0ff', 0.7), [0, 1.15, -3.15], [-Math.PI / 2, 0, 0]);
    for (let i = 0; i < 3; i++) p(c, G.cone(0.12, 0.42, 4), crista, [0, 1.55 - i * 0.05, 0.25 - i * 0.35], [-0.5, 0, 0]);
    const bolha = mat('#a8e6ff', { transparent: true, opacity: 0.7 });
    for (let i = 0; i < 3; i++) u.orbitas.push({ obj: p(c, G.esf(1, 8, 6), bolha, [0, 1.5, 0], null, 0.2), raio: 1.25, vel: 1.2, y: 1.5, fase: (i / 3) * Math.PI * 2 });
    olhos(c, 1.32, 0.9, 0.42, 0.12);
    u.sombra.scale.set(1.5, 1, 1);
    return;
  }
  // Leviaraia: manta das profundezas com pontos que brilham, coroa, rabo de cristal e anel de água
  const dorso = mat('#1b2560'), claro = mat('#9fe9ff'), luz = brilho('#4ff0ff', 0.9), ouro = brilho('#ffe9a0', 0.6);
  p(c, G.octa(1), dorso, [0, 1.25, 0.1], null, [0.95, 0.4, 1.35]);
  p(c, G.octa(1), claro, [0, 1.16, 0.18], null, [0.75, 0.27, 1.1]);
  for (const s of [-1, 1]) asaRaia(c, u, s, dorso, luz, 1.55, 1.0, 1.25, 4, luz);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) p(c, G.esf(1, 6, 4), luz, [s * (0.18 + i * 0.03), 1.6 - i * 0.02, 0.6 - i * 0.32], null, 0.07);
  for (const s of [-1, 1]) p(c, G.cone(0.16, 0.75, 4), dorso, [s * 0.48, 1.22, 1.5], [Math.PI / 2 - 0.2, 0, -s * 0.5]);
  for (const [x, h] of [[-0.22, 0.45], [0, 0.65], [0.22, 0.45]]) p(c, G.cone(0.1, h, 4), ouro, [x, 1.6 + h * 0.4, 0.75], [-0.25, 0, x]);
  p(c, G.cone(0.09, 2.6, 4), dorso, [0, 1.25, -2.25], [-Math.PI / 2, 0, 0]);
  p(c, G.octa(0.25), luz, [0, 1.25, -3.6], null, [0.7, 0.7, 1.4]);
  const anel = p(c, G.toro(0.95, 0.06, Math.PI * 2, 5, 18), mat('#6fd8ff', { transparent: true, opacity: 0.75 }), [0, 2.35, -0.1], [Math.PI / 2, 0, 0]);
  u.pulsos.push({ obj: anel, base: 1, amp: 0.06, vel: 2.5 });
  const gota = brilho('#8ff0ff', 0.6, { transparent: true, opacity: 0.85 });
  for (let i = 0; i < 4; i++) u.orbitas.push({ obj: p(c, G.ico(0.18, 0), gota, [0, 1.5, 0]), raio: 1.45, vel: 1, y: 1.5, fase: (i / 4) * Math.PI * 2 });
  olhos(c, 1.42, 1.05, 0.46, 0.12, '#7ff6ff');
  u.sombra.scale.set(1.6, 1.05, 1);
}

// ---------- Raro de Planta: Espinhal > Cactouriço > Espinhaço > Mandacarão ----------
// Ouriço-cacto: a cada forma, mais espinhos; o Mandacarão é um mandacaru (cacto do sertão).
// espinhos espalhados numa bola (sem cobrir o rosto, que fica em +z)
function espinhosEmBola(c, n, cy, r, comp, m, grosso = 0.06) {
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, phi = Math.acos(1 - 2 * t), teta = i * 2.39996;
    const v = V(Math.sin(phi) * Math.cos(teta), Math.cos(phi), Math.sin(phi) * Math.sin(teta));
    if (v.z > 0.55 && v.y < 0.6) continue;
    apontar(p(c, G.cone(grosso, comp, 4), m, [v.x * r, cy + v.y * r * 0.92, v.z * r]), v);
  }
}
// braço de cacto: sai do lado e sobe
function bracoCacto(c, m, s, y, alt, r) {
  p(c, G.cil(r, r, 0.4, 7), m, [s * 0.55, y, 0], [0, 0, Math.PI / 2]);
  p(c, G.cil(r, r, alt, 7), m, [s * 0.75, y + alt / 2 - r, 0]);
  p(c, G.esf(1, 7, 5), m, [s * 0.75, y + alt - r, 0], null, r);
}
// florzinha de 5 pétalas
function florCacto(c, m, x, y, z, tam, abre = 0.45) {
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; p(c, G.cone(tam * 0.36, tam, 4), m, [x + Math.cos(a) * tam * 0.3, y, z + Math.sin(a) * tam * 0.3], [Math.sin(a) * abre, 0, -Math.cos(a) * abre]); }
}

function linhaEspinhal(c, u, e) {
  if (e === 0) { // Espinhal (o de sempre)
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
    return;
  }
  const pes = (m) => { for (const [x, z] of [[-0.3, 0.25], [0.3, 0.25], [-0.3, -0.25], [0.3, -0.25]]) p(c, G.cil(0.09, 0.11, 0.24, 5), m, [x, 0.12, z]); };
  if (e === 1) { // Cactouriço: bola cheia de espinhos, bracinhos e botão de flor
    const cacto = mat('#3f9a52'), espinho = mat('#fff2b0');
    p(c, G.ico(0.7, 1), cacto, [0, 0.78, 0], null, [1, 0.92, 1.08]);
    espinhosEmBola(c, 30, 0.78, 0.7, 0.45, espinho);
    for (const s of [-1, 1]) bracoCacto(c, cacto, s, 0.75, 0.55, 0.13);
    p(c, G.esf(1), mat('#c9e6a0'), [0, 0.7, 0.55], null, [0.38, 0.32, 0.2]);
    p(c, G.esf(1), mat('#1b1b30'), [0, 0.66, 0.76], null, 0.05);
    florCacto(c, mat('#ff6fa8'), 0, 1.47, 0, 0.22, 0.4);
    pes(cacto);
    olhos(c, 0.86, 0.66, 0.16, 0.1);
    return;
  }
  if (e === 2) { // Espinhaço: ouriço-cacto gigante com crista de espinhos dourados
    const cacto = mat('#2f7f45'), espinho = mat('#fff2b0'), grande = mat('#f4d27a'), rosa = mat('#ff5f9a');
    p(c, G.ico(0.78, 1), cacto, [0, 0.95, 0], null, [1, 1.12, 1.05]);
    espinhosEmBola(c, 44, 0.95, 0.8, 0.55, espinho, 0.07);
    for (let i = 0; i < 7; i++) {
      const ang = -0.9 + (i / 6) * 1.8;
      const v = V(0, Math.cos(ang), -Math.sin(ang) - 0.2).normalize();
      apontar(p(c, G.cone(0.13, 1.0, 4), grande, [0, 0.95 + v.y * 0.85, v.z * 0.85]), v);
    }
    for (const s of [-1, 1]) { bracoCacto(c, cacto, s, 0.9, 0.75, 0.15); florCacto(c, rosa, s * 0.75, 1.72, 0, 0.22, 0.5); }
    p(c, G.esf(1), mat('#b8dc8e'), [0, 0.9, 0.62], null, [0.42, 0.36, 0.22]);
    p(c, G.esf(1), mat('#1b1b30'), [0, 0.84, 0.85], null, 0.06);
    pes(cacto);
    olhos(c, 1.06, 0.74, 0.18, 0.11);
    return;
  }
  // Mandacarão: coluna alta com costelas, 2 braços, espinhos dourados e a grande flor branca
  const cacto = mat('#2a7a4a'), costela = mat('#3a9a5e'), ouro = brilho('#ffd36a', 0.45), branco = mat('#fffaf0');
  p(c, G.cil(0.55, 0.65, 1.9, 8), cacto, [0, 1.1, 0]);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; if (Math.cos(a) > 0.7) continue; p(c, G.cil(0.1, 0.1, 1.8, 4), costela, [Math.sin(a) * 0.62, 1.1, Math.cos(a) * 0.62]); }
  p(c, G.esf(1, 8, 5), cacto, [0, 2.05, 0], null, [0.55, 0.3, 0.55]);
  for (const s of [-1, 1]) { bracoCacto(c, cacto, s, 1.0, 1.25, 0.2); florCacto(c, branco, s * 0.75, 2.1, 0, 0.25, 0.8); }
  for (let i = 0; i < 40; i++) {
    const a = (i % 8) / 8 * Math.PI * 2 + Math.PI / 8, y = 0.35 + Math.floor(i / 8) * 0.38;
    if (Math.cos(a) > 0.7) continue;
    apontar(p(c, G.cone(0.06, 0.45, 4), ouro, [Math.sin(a) * 0.72, y, Math.cos(a) * 0.72]), V(Math.sin(a), 0.3, Math.cos(a)));
  }
  p(c, G.esf(1), mat('#b8dc8e'), [0, 1.15, 0.5], null, [0.4, 0.42, 0.2]);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; p(c, G.cone(0.14, 0.5, 4), branco, [Math.cos(a) * 0.2, 2.3, Math.sin(a) * 0.2], [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9]); }
  const miolo = p(c, G.esf(1), brilho('#ffe14a', 0.7), [0, 2.3, 0], null, 0.12);
  u.pulsos.push({ obj: miolo, base: 0.12, amp: 0.15, vel: 3 });
  // 4 espinhos dourados girando em volta
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    p(g, G.cone(0.06, 0.5, 4), ouro, [0, 0, 0], [Math.PI / 2, 0, 0]);
    c.add(g);
    u.orbitas.push({ obj: g, raio: 1.35, vel: 1.1, y: 1.4, fase: (i / 4) * Math.PI * 2 });
  }
  pes(cacto);
  olhos(c, 1.3, 0.66, 0.2, 0.11);
}

// ---------- Peças ACESAS (fogo, magma, brilho) dos lendários ----------
// Todas usam UM material só (sem luz, a cor fica gravada em cada peça). Assim as peças acesas
// de um mesmo grupo viram um desenho só (juntarPecas), o que deixa o modelo bem mais leve.
const MAT_ACESO = new THREE.MeshBasicMaterial({ vertexColors: true });
MAT_ACESO.userData.fixo = true;
const GEO_COR = new Map();
function geoCor(g, cor) {
  const k = g.uuid + '|' + cor;
  if (!GEO_COR.has(k)) {
    const c2 = g.clone(), col = new THREE.Color(cor), n = c2.attributes.position.count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
    c2.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    GEO_COR.set(k, c2);
  }
  return GEO_COR.get(k);
}
// pa = "peça acesa": como p(), mas com uma cor de fogo em vez de material
function pa(pai, g, cor, pos, rot = null, esc = null) { return p(pai, geoCor(g, cor), MAT_ACESO, pos, rot, esc); }

// ---------- LENDÁRIO: Ignárion > Pirárion > Magmárion > Infernárion ----------
// Cada forma é mais espetacular que a anterior (a ideia do Lâmina):
// dragãozinho de 4 patas > dragão de pescoço longo com asas grandes > colosso de magma de pé >
// senhor do fogo de pé, com asas enormes, anel de espinhos e coração de fogo.
const COR_IGN = { corpo: '#241820', barriga: '#8a4a66', rosa: '#ff3d7a', laranja: '#ff8a2a', amarelo: '#ffd040', chifre: '#4a3440', garra: '#efe2cc' };

// Membrana de asa de morcego (forma própria, guardada uma vez por formato).
// W = pulso, F = pontas dos dedos, B = onde a asa encosta no corpo (coordenadas da asa direita:
// x para fora, y para cima, z para trás). Cores: magenta perto dos ossos, laranja nas bordas.
function geoMembrana(chave, W, F, B) {
  return geo('membrana|' + chave, () => {
    const pos = [], cor = [];
    const ROSA = new THREE.Color('#d8266a'), MEIO = new THREE.Color('#ff4a52'), BORDA = new THREE.Color('#ffa02a');
    const tri = (a, ca, b2, cb, c2, cc) => { pos.push(...a, ...b2, ...c2); cor.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b, cc.r, cc.g, cc.b); };
    const R = [0, 0, 0];
    const lerp = (p, q, k) => p.map((v, i) => v + (q[i] - v) * k);
    // entre um dedo e o próximo: um "recorte" puxado para o pulso (borda de morcego)
    const pontas = [...F, B];
    tri(R, ROSA, W, ROSA, F[0], BORDA);
    for (let i = 0; i < pontas.length - 1; i++) {
      const p = pontas[i], q = pontas[i + 1];
      const centro = i === pontas.length - 2 ? R : W;
      const rec = lerp(lerp(p, q, 0.5), centro, 0.32);
      tri(centro, ROSA, p, BORDA, rec, MEIO);
      tri(centro, ROSA, rec, MEIO, q, i === pontas.length - 2 ? ROSA : BORDA);
      if (centro === W) tri(R, ROSA, W, ROSA, q, BORDA); // fecha o miolo da asa
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
    g.computeVertexNormals();
    return g;
  });
}

// Asa de dragão: ossos escuros, membrana em degradê e chamas nas pontas. Bate (u.asas).
function asaDragao(c, u, s, pos, chave, W, F, B, k = 1, abre = 0.25, ct = 1) {
  const g = new THREE.Group();
  g.position.set(...pos);
  const m = new THREE.Group();
  m.scale.set(s * k, k, k); // espelha a asa esquerda
  g.add(m);
  const osso = mat(COR_IGN.corpo), ponta = COR_IGN.laranja, chama = COR_IGN.amarelo;
  const membrana = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#5a0a24', emissiveIntensity: 0.6, side: THREE.DoubleSide, flatShading: true });
  m.add(new THREE.Mesh(geoMembrana(chave, W, F, B), membrana));
  const vW = V(...W);
  const ossoEntre = (a, b, r) => {
    const d = V(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const o = p(m, G.cil(r * 0.6, r, d.length(), 4), osso, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
    apontar(o, d);
  };
  ossoEntre([0, 0, 0], W, 0.07);
  for (const f of F) {
    ossoEntre(W, f, 0.045);
    const d = V(f[0] - W[0], f[1] - W[1], f[2] - W[2]).normalize();
    apontar(pa(m, G.cone(0.09 * ct, 0.42 * ct, 4), chama, [f[0] + d.x * 0.15 * ct, f[1] + d.y * 0.15 * ct, f[2] + d.z * 0.15 * ct], null, [1, 1, 0.35]), d);
  }
  apontar(p(m, G.cone(0.06, 0.22, 4), mat(COR_IGN.garra), [W[0], W[1] + 0.1, W[2]]), V(0.2, 1, 0.3)); // garrinha do pulso
  // chamas pequenas no meio da borda
  for (let i = 0; i < F.length - 1; i++) {
    const mid = [(F[i][0] + F[i + 1][0]) / 2, (F[i][1] + F[i + 1][1]) / 2, (F[i][2] + F[i + 1][2]) / 2];
    const d = V(mid[0] - vW.x, mid[1] - vW.y, mid[2] - vW.z).normalize();
    apontar(pa(m, G.cone(0.07 * ct, 0.3 * ct, 4), ponta, [mid[0] - d.x * 0.25, mid[1] - d.y * 0.25, mid[2] - d.z * 0.25], null, [1, 1, 0.35]), d);
  }
  c.add(g);
  u.asas.push({ obj: g, lado: s, base: s * abre });
  return g;
}

// Chama de várias pontas (amarela por dentro, laranja e rosa por fora). Pulsa.
function chamaIgnea(pai, u, pos, tam, dir = V(0, 1, 0)) {
  const g = new THREE.Group();
  g.position.set(...pos);
  apontar(g, dir);
  const lar = COR_IGN.laranja, ama = COR_IGN.amarelo, ros = COR_IGN.rosa;
  pa(g, G.cone(0.13 * tam, 0.7 * tam, 5), ama, [0, 0.35 * tam, 0]);
  for (let i = 0; i < 5; i++) { // línguas de fogo abertas em coroa
    const a = (i / 5) * Math.PI * 2;
    pa(g, G.cone(0.09 * tam, (0.42 + (i % 2) * 0.14) * tam, 4), i % 2 ? ama : lar, [Math.cos(a) * 0.1 * tam, 0.2 * tam, Math.sin(a) * 0.1 * tam], [Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45]);
  }
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.5; pa(g, G.cone(0.06 * tam, 0.26 * tam, 4), ros, [Math.cos(a) * 0.17 * tam, 0.08 * tam, Math.sin(a) * 0.17 * tam], [Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8]); }
  pai.add(g);
  u.pulsos.push({ obj: g, base: 1, amp: 0.15, vel: 7 + Math.random() * 3 });
  return g;
}

// Tubo liso passando por vários pontos (pescoço, chifre): cilindros entre os pontos e bolinhas nas juntas
function tubo(pai, m, pts, raios, ponta = null) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b2 = pts[i + 1], d = V(b2[0] - a[0], b2[1] - a[1], b2[2] - a[2]);
    apontar(p(pai, G.cil(raios[i + 1], raios[i], d.length(), 6), m, [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2, (a[2] + b2[2]) / 2]), d);
    if (i > 0) p(pai, G.ico(raios[i], 0), m, a);
  }
  if (ponta) {
    const n = pts.length, a = pts[n - 2], b2 = pts[n - 1], d = V(b2[0] - a[0], b2[1] - a[1], b2[2] - a[2]).normalize();
    apontar(p(pai, G.cone(raios[n - 1], ponta, 5), m, [b2[0] + d.x * ponta / 2, b2[1] + d.y * ponta / 2, b2[2] + d.z * ponta / 2]), d);
  }
}

// Cauda em segmentos (balança) com espinhos e, se quiser, chama na ponta
function caudaDragao(c, u, pos, n, r0, passo, sobe, espinhos, chama) {
  const g = new THREE.Group();
  g.position.set(...pos);
  const corpo = mat(COR_IGN.corpo), esp = COR_IGN.rosa;
  let y = 0, z = 0;
  for (let i = 0; i < n; i++) {
    const r = r0 * (1 - i / (n + 1));
    y += sobe[i] ?? 0; z -= passo;
    p(g, G.ico(r, 0), corpo, [0, y, z], null, [1, 0.9, 1.5]);
    if (espinhos && i % 1 === 0) pa(g, G.cone(r * 0.45, r * 1.4, 4), esp, [0, y + r * 0.9, z], [-0.5, 0, 0]);
  }
  if (chama) chamaIgnea(g, u, [0, y + 0.1, z - passo * 0.6], chama, V(0, 0.8, -0.5));
  c.add(g);
  u.caudas.push(g);
  return g;
}

// Chifre curvo: sai da cabeça para o lado, sobe e vira para dentro (s = lado)
function chifreGrande(pai, m, base, s, tam) {
  const [x, y, z] = base, t = tam;
  tubo(pai, m, [[x, y, z], [x + s * 0.3 * t, y + 0.04 * t, z - 0.04 * t], [x + s * 0.55 * t, y + 0.22 * t, z - 0.08 * t], [x + s * 0.62 * t, y + 0.52 * t, z - 0.06 * t], [x + s * 0.48 * t, y + 0.78 * t, z]],
    [0.13 * t, 0.12 * t, 0.1 * t, 0.075 * t, 0.055 * t], 0.24 * t);
}

// Placas de magma: um miolo laranja aceso e placas escuras por cima (as frestas brilham)
function placasMagma(c, centro, raios, placas, rPlaca) {
  pa(c, G.ico(1, 1), '#ff7a1a', centro, null, raios);
  for (const [x, y] of placas) {
    // ponto na frente do elipsoide, virado para fora
    const nx = x / raios[0], ny = y / raios[1];
    const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny));
    const pos = [centro[0] + x, centro[1] + y, centro[2] + nz * raios[2] * 1.02];
    apontar(p(c, G.cil(rPlaca, rPlaca * 1.05, 0.08, 6), mat(COR_IGN.corpo), pos), V(nx / raios[0], ny / raios[1], nz / raios[2]));
  }
}

// Perna de dragão em pé (gira ao andar: u.pernas) e braço com garras (u.bracos)
function pernaDragao(c, x, quadril, coxa, canela, grossa, joelho) {
  const g = new THREE.Group();
  g.position.set(x, quadril, 0);
  const corpo = mat(COR_IGN.corpo);
  p(g, G.cil(grossa * 0.8, grossa, coxa, 6), corpo, [0, -coxa / 2, 0.05]);
  p(g, G.cil(grossa * 0.6, grossa * 0.75, canela, 6), corpo, [0, -coxa - canela / 2 + 0.05, -0.05]);
  p(g, G.caixa(grossa * 1.6, 0.16, grossa * 2.4), corpo, [0, -quadril + 0.08, 0.12]);
  for (const k of [-1, 0, 1]) p(g, G.cone(0.05, 0.2, 4), mat(COR_IGN.garra), [k * grossa * 0.5, -quadril + 0.07, 0.12 + grossa * 1.25], [Math.PI / 2, 0, 0]);
  if (joelho) pa(g, G.ico(grossa * 0.55, 0), '#ff7a1a', [0, -coxa + 0.02, grossa * 0.75]);
  c.add(g);
  return g;
}
function bracoDragao(c, s, ombro, comp, grossa, chama, u) {
  const g = new THREE.Group();
  g.position.set(...ombro);
  const corpo = mat(COR_IGN.corpo);
  p(g, G.cil(grossa * 0.8, grossa, comp * 0.5, 6), corpo, [s * 0.05, -comp * 0.25, 0], [0, 0, s * 0.15]);
  p(g, G.cil(grossa * 0.65, grossa * 0.8, comp * 0.5, 6), corpo, [s * 0.1, -comp * 0.72, 0.12], [0.35, 0, 0]);
  p(g, G.ico(grossa * 0.9, 0), corpo, [s * 0.12, -comp * 0.98, 0.22]);
  for (const k of [-1, 0, 1]) p(g, G.cone(0.045, 0.2, 4), mat(COR_IGN.garra), [s * 0.12 + k * grossa * 0.45, -comp * 1.05, 0.32], [Math.PI / 2 + 0.5, 0, 0]);
  if (chama) chamaIgnea(g, u, [s * 0.02, -comp * 0.5, -grossa * 0.9], chama, V(s * 0.3, 0.2, -1));
  c.add(g);
  return g;
}

function linhaIgnarion(c, u, e) {
  const corpo = mat(COR_IGN.corpo), barriga = mat(COR_IGN.barriga), chifre = mat(COR_IGN.chifre);
  const rosa = COR_IGN.rosa, magma = '#ff7a1a';
  const garra = mat(COR_IGN.garra);
  // pata de 4 patas: coxa grossa, canela e pé com 3 garras
  const pata = (x, z, alto, gr) => {
    p(c, G.cil(gr * 0.85, gr * 1.15, alto * 0.55, 6), corpo, [x, alto * 0.7, z]);
    p(c, G.cil(gr * 0.65, gr * 0.8, alto * 0.5, 6), corpo, [x, alto * 0.28, z + 0.04]);
    p(c, G.caixa(gr * 1.7, gr * 0.6, gr * 2.2), corpo, [x, gr * 0.3, z + gr * 0.5]);
    for (const k of [-1, 0, 1]) p(c, G.cone(gr * 0.22, gr * 0.75, 4), garra, [x + k * gr * 0.55, gr * 0.28, z + gr * 1.65], [Math.PI / 2, 0, 0]);
  };
  if (e === 0) {
    // ---- Ignárion: dragãozinho de 4 patas, cabeça grande, asinhas e chama na cauda ----
    p(c, G.ico(0.45, 1), corpo, [0, 0.62, -0.05], null, [0.85, 0.75, 1.35]);
    p(c, G.ico(0.45, 1), barriga, [0, 0.52, 0.08], null, [0.68, 0.55, 1.2]);
    tubo(c, corpo, [[0, 0.72, 0.45], [0, 0.88, 0.75], [0, 1.02, 0.95]], [0.24, 0.2, 0.19]);
    p(c, G.ico(0.36, 1), corpo, [0, 1.1, 1.08], null, [0.95, 0.85, 1.05]);
    p(c, G.ico(0.28, 1), corpo, [0, 1.0, 1.42], null, [0.8, 0.62, 1.05]);
    pa(c, G.caixa(0.26, 0.04, 0.3), rosa, [0, 0.9, 1.48]);
    for (const s of [-1, 1]) {
      chifreGrande(c, chifre, [s * 0.16, 1.32, 0.98], s, 0.55);
      pata(s * 0.3, 0.38, 0.5, 0.1);
      pata(s * 0.3, -0.42, 0.5, 0.1);
      asaDragao(c, u, s, [s * 0.25, 0.92, 0.1], 'ign0', [0.42, 0.42, -0.05], [[0.95, 0.7, -0.25], [0.95, 0.2, -0.45], [0.6, -0.1, -0.55]], [0.05, -0.08, -0.5], 1, 0.35, 0.55);
    }
    for (let i = 0; i < 4; i++) pa(c, G.cone(0.06, 0.22, 4), rosa, [0, 1.0 - i * 0.03, 0.35 - i * 0.26], [-0.4, 0, 0]);
    caudaDragao(c, u, [0, 0.58, -0.62], 6, 0.16, 0.2, [0, 0.04, 0.08, 0.12, 0.15, 0.17], false, 0.55);
    olhos(c, 1.16, 1.33, 0.17, 0.09, COR_IGN.rosa);
    u.sombra.scale.set(0.9, 1.4, 1);
    return;
  }
  if (e === 1) {
    // ---- Pirárion: pescoço longo, crista de fogo, asas grandes e cauda com chama ----
    p(c, G.ico(0.55, 1), corpo, [0, 1.0, -0.05], null, [0.85, 0.72, 1.4]);
    p(c, G.ico(0.55, 1), barriga, [0, 0.88, 0.08], null, [0.68, 0.55, 1.25]);
    // pescoço liso em S e a barriga clara na frente dele
    tubo(c, corpo, [[0, 1.2, 0.55], [0, 1.6, 0.82], [0, 2.0, 0.92], [0, 2.32, 0.95]], [0.3, 0.24, 0.2, 0.18]);
    tubo(c, barriga, [[0, 1.12, 0.72], [0, 1.55, 0.96], [0, 1.95, 1.05], [0, 2.22, 1.06]], [0.2, 0.16, 0.13, 0.11]);
    // cabeça
    p(c, G.ico(0.32, 1), corpo, [0, 2.5, 1.02], null, [0.9, 0.82, 1.1]);
    p(c, G.ico(0.25, 1), corpo, [0, 2.4, 1.36], null, [0.78, 0.6, 1.15]);
    pa(c, G.caixa(0.22, 0.04, 0.3), rosa, [0, 2.3, 1.42]);
    for (const s of [-1, 1]) {
      chifreGrande(c, chifre, [s * 0.16, 2.7, 0.9], s, 0.5);
      apontar(p(c, G.cone(0.05, 0.4, 4), chifre, [s * 0.26, 2.55, 0.84]), V(s * 0.8, 0.3, -1));
      pata(s * 0.36, 0.48, 0.75, 0.14);
      pata(s * 0.36, -0.5, 0.75, 0.14);
      asaDragao(c, u, s, [s * 0.3, 1.4, 0.05], 'ign1', [0.9, 0.85, -0.1], [[2.1, 1.25, -0.45], [2.15, 0.45, -0.8], [1.7, -0.2, -1.0], [1.0, -0.45, -0.95]], [0.15, -0.25, -0.85], 1, 0.35);
    }
    // crista de fogo na cabeça (várias chamas para trás)
    chamaIgnea(c, u, [0, 2.75, 0.98], 0.75, V(0, 1, -0.25));
    chamaIgnea(c, u, [0, 2.68, 0.78], 0.6, V(0, 0.7, -0.8));
    chamaIgnea(c, u, [0, 2.5, 0.66], 0.45, V(0, 0.4, -1));
    for (let i = 0; i < 6; i++) pa(c, G.cone(0.08, 0.32, 4), rosa, [0, 1.42 - i * 0.04, 0.35 - i * 0.26], [-0.5, 0, 0]);
    caudaDragao(c, u, [0, 0.95, -0.7], 8, 0.22, 0.27, [0, -0.06, -0.08, -0.06, 0, 0.06, 0.12, 0.15], true, 0.75);
    olhos(c, 2.57, 1.28, 0.17, 0.085, COR_IGN.rosa);
    u.sombra.scale.set(1.1, 1.6, 1);
    return;
  }
  if (e === 2) {
    // ---- Magmárion: colosso de pé, coberto de placas de magma rachadas, chifres grandes ----
    u.pernas = [pernaDragao(c, -0.42, 1.05, 0.55, 0.5, 0.3, true), pernaDragao(c, 0.42, 1.05, 0.55, 0.5, 0.3, true)];
    p(c, G.ico(0.75, 1), corpo, [0, 1.65, 0], null, [1.05, 1.0, 0.85]);
    // placas escuras por cima de um miolo aceso: só as frestas brilham
    // grade de placas hexagonais bem juntas: sobram só as frestas finas acesas
    const grade = [];
    for (let lin = 0; lin < 7; lin++) {
      const y = 0.58 - lin * 0.2;
      for (let col = -3; col <= 3; col++) {
        const x = col * 0.21 + (lin % 2) * 0.105;
        if ((x / 0.64) ** 2 + (y / 0.74) ** 2 < 0.97) grade.push([x, y]);
      }
    }
    placasMagma(c, [0, 1.62, 0.12], [0.66, 0.76, 0.6], grade, 0.12);
    for (const s of [-1, 1]) {
      p(c, G.dode(0.36), corpo, [s * 0.78, 2.15, 0]);
      pa(c, G.caixa(0.04, 0.3, 0.04), magma, [s * 0.86, 2.15, 0.33], [0, 0, s * 0.5]);
    }
    u.bracos = [bracoDragao(c, -1, [-1.0, 2.05, -0.05], 1.2, 0.24, 0, u), bracoDragao(c, 1, [1.0, 2.05, -0.05], 1.2, 0.24, 0, u)];
    for (const s of [-1, 1]) for (const [y, r] of [[1.78, 0.4], [1.45, -0.3]]) pa(c, G.caixa(0.04, 0.32, 0.04), magma, [s * 0.74, y, 0.25], [0.3, 0, s * r]); // rachaduras dos lados
    // cabeça de touro, olhos acesos e chifres grandes curvos
    p(c, G.ico(0.34, 1), corpo, [0, 2.55, 0.3], null, [1.05, 0.85, 1.0]);
    p(c, G.ico(0.25, 1), corpo, [0, 2.45, 0.58], null, [0.9, 0.62, 0.85]);
    pa(c, G.caixa(0.04, 0.2, 0.04), magma, [0, 2.62, 0.62], [0, 0, 0]); // racha na testa
    for (const s of [-1, 1]) chifreGrande(c, chifre, [s * 0.26, 2.7, 0.22], s, 1.0);
    for (const s of [-1, 1]) asaDragao(c, u, s, [s * 0.4, 2.2, -0.45], 'ign2', [0.9, 0.95, -0.2], [[2.0, 1.4, -0.5], [2.1, 0.55, -0.75], [1.65, -0.15, -0.9], [0.95, -0.45, -0.8]], [0.1, -0.4, -0.6], 1, 0.3);
    caudaDragao(c, u, [0, 1.05, -0.55], 6, 0.3, 0.3, [0, -0.12, -0.12, -0.08, -0.04, 0], true, 0);
    for (let i = 0; i < 2; i++) u.orbitas.push({ obj: pa(c, G.octa(0.13), '#ff6a2a', [0, 0, 0], null, [1, 1.7, 1]), raio: 1.0, vel: 0.9, y: 3.0, fase: i * Math.PI });
    olhos(c, 2.6, 0.58, 0.16, 0.075, '#ffb030');
    u.sombra.scale.set(1.3, 1.3, 1);
    return;
  }
  // ---- Infernárion: senhor do fogo de pé, asas enormes, anel de espinhos e coração de fogo ----
  u.pernas = [pernaDragao(c, -0.32, 1.25, 0.65, 0.6, 0.26, false), pernaDragao(c, 0.32, 1.25, 0.65, 0.6, 0.26, false)];
  p(c, G.ico(0.6, 1), corpo, [0, 1.95, 0], null, [1.05, 1.25, 0.8]);
  p(c, G.ico(0.5, 1), barriga, [0, 1.9, 0.2], null, [0.82, 1.18, 0.7]);
  // coração de fogo no peito, com rachaduras saindo dele
  const coracao = new THREE.Group();
  coracao.position.set(0, 2.05, 0.56);
  const fogoC = '#ffa020', luzC = '#fff0a0';
  for (const s of [-1, 1]) pa(coracao, G.ico(0.15, 1), fogoC, [s * 0.12, 0.1, 0], null, [1, 1, 0.45]);
  pa(coracao, G.cone(0.26, 0.36, 6), fogoC, [0, -0.1, 0], [Math.PI, 0, 0], [1, 1, 0.45]);
  for (const s of [-1, 1]) pa(coracao, G.ico(0.08, 1), luzC, [s * 0.07, 0.07, 0.06], null, [1, 1, 0.45]);
  pa(coracao, G.cone(0.14, 0.22, 6), luzC, [0, -0.06, 0.06], [Math.PI, 0, 0], [1, 1, 0.45]);
  c.add(coracao);
  u.pulsos.push({ obj: coracao, base: 1, amp: 0.1, vel: 4 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    pa(c, G.caixa(0.04, 0.34, 0.03), magma, [Math.sin(a) * 0.36, 2.05 + Math.cos(a) * 0.42, 0.52], [0, 0, -a]);
  }
  for (const s of [-1, 1]) p(c, G.dode(0.28), corpo, [s * 0.66, 2.6, 0]);
  u.bracos = [bracoDragao(c, -1, [-0.72, 2.55, 0.05], 1.25, 0.18, 0.65, u), bracoDragao(c, 1, [0.72, 2.55, 0.05], 1.25, 0.18, 0.65, u)];
  // pescoço, cabeça, chifres curvos e coroa de fogo
  tubo(c, corpo, [[0, 2.7, 0.0], [0, 3.0, 0.12]], [0.26, 0.2]);
  p(c, G.ico(0.32, 1), corpo, [0, 3.25, 0.22], null, [0.95, 0.85, 1.05]);
  p(c, G.ico(0.23, 1), corpo, [0, 3.15, 0.52], null, [0.8, 0.6, 1.05]);
  pa(c, G.caixa(0.2, 0.04, 0.22), rosa, [0, 3.05, 0.58]);
  for (const s of [-1, 1]) chifreGrande(c, chifre, [s * 0.24, 3.42, 0.12], s, 0.8);
  chamaIgnea(c, u, [0, 3.48, 0.2], 0.9, V(0, 1, -0.1));
  // anel de espinhos (auréola) atrás da cabeça
  const anel = new THREE.Group();
  anel.position.set(0, 3.3, -0.55);
  pa(anel, G.toro(1.1, 0.075, Math.PI * 2, 5, 28), '#ff3d8a', [0, 0, 0]);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    apontar(pa(anel, G.cone(0.07, i % 2 ? 0.32 : 0.5, 4), i % 2 ? '#ff3d8a' : COR_IGN.amarelo, [Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0]), V(Math.cos(a), Math.sin(a), 0));
  }
  c.add(anel);
  u.pulsos.push({ obj: anel, base: 1, amp: 0.04, vel: 2 });
  // asas enormes
  const W = [1.1, 1.2, -0.15], F = [[2.9, 1.9, -0.45], [3.1, 0.9, -0.7], [2.7, -0.1, -0.9], [2.0, -0.75, -0.95], [1.1, -0.95, -0.8]];
  for (const s of [-1, 1]) asaDragao(c, u, s, [s * 0.35, 2.5, -0.35], 'ign3', W, F, [0.1, -0.7, -0.55], 1, 0.3);
  caudaDragao(c, u, [0, 1.35, -0.45], 7, 0.24, 0.28, [-0.1, -0.15, -0.12, -0.08, -0.02, 0.05, 0.1], true, 0.8);
  olhos(c, 3.28, 0.5, 0.15, 0.075, COR_IGN.rosa);
  u.sombra.scale.set(1.4, 1.3, 1);
}

// ---------- LENDÁRIO: Silvárion > Bosquárion > Raizárion > Ancestrárion ----------
// Cervo da floresta: filhote com brotinhos > cervo jovem com galhada florida > colosso de casca
// e raízes com uma copa nos chifres > cervo-espírito com uma árvore inteira acesa na galhada.
const COR_SIL = { casca: '#6a4a2c', cascaEsc: '#3e2818', musgo: '#3f8f3a', folha: '#4ea64a', folhaEsc: '#2c6a2e', claro: '#c8a878', jade: '#1fe0a0', amarelo: '#ffe14a', rosa: '#ff7eb6', espirito: '#9fffd8', branco: '#fffaf0' };

// galho (tubo) com uma bolota de folhas e, às vezes, uma flor acesa na ponta
function galhoComFolhas(pai, u, base, pontos, raios, folha, tamFolha, flor) {
  const pts = [base, ...pontos];
  tubo(pai, mat(COR_SIL.cascaEsc), pts, raios);
  const ponta = pts[pts.length - 1];
  p(pai, G.ico(tamFolha, 0), folha, ponta);
  if (flor) { const f = pa(pai, G.ico(tamFolha * 0.4, 0), flor, [ponta[0], ponta[1] + tamFolha * 0.8, ponta[2]]); u.pulsos.push({ obj: f, base: 1, amp: 0.3, vel: 3 + Math.random() * 2 }); }
}

// pata de cervo: fina e comprida, com casco
function pataCervo(c, x, z, alto, gr, casca, casco, joelhoMusgo) {
  p(c, G.cil(gr * 0.75, gr, alto * 0.5, 6), casca, [x, alto * 0.72, z]);
  p(c, G.cil(gr * 0.55, gr * 0.7, alto * 0.5, 6), casca, [x, alto * 0.25, z + 0.03]);
  p(c, G.cil(gr * 0.8, gr * 0.9, alto * 0.1, 6), casco, [x, alto * 0.05, z + 0.04]);
  if (joelhoMusgo) p(c, G.ico(gr * 1.1, 0), joelhoMusgo, [x, alto * 0.95, z]);
}

function linhaSilvarion(c, u, e) {
  const casca = mat(COR_SIL.casca), escura = mat(COR_SIL.cascaEsc), musgo = mat(COR_SIL.musgo), folha = mat(COR_SIL.folha), folhaEsc = mat(COR_SIL.folhaEsc);
  const claro = mat(COR_SIL.claro), casco = mat('#8f9a86');
  if (e === 0) {
    // ---- Silvárion: filhote de cervo com pintinhas de musgo e dois brotinhos na cabeça ----
    p(c, G.ico(0.42, 1), casca, [0, 0.95, 0], null, [0.8, 0.75, 1.3]);
    p(c, G.ico(0.38, 1), claro, [0, 0.86, 0.08], null, [0.65, 0.6, 1.1]);
    for (const [x, z] of [[0.22, 0.15], [-0.2, -0.1], [0.12, -0.35], [-0.15, 0.32], [0.25, -0.15]]) p(c, G.ico(0.06, 0), musgo, [x, 1.22, z], null, [1, 0.4, 1]);
    for (const s of [-1, 1]) for (const z of [0.32, -0.36]) pataCervo(c, s * 0.2, z, 0.75, 0.065, casca, casco, null);
    tubo(c, casca, [[0, 1.08, 0.38], [0, 1.35, 0.55], [0, 1.55, 0.62]], [0.16, 0.13, 0.12]);
    p(c, G.ico(0.24, 1), casca, [0, 1.68, 0.7], null, [0.9, 0.85, 1.05]);
    p(c, G.ico(0.15, 1), claro, [0, 1.6, 0.92], null, [0.8, 0.65, 1.1]);
    p(c, G.esf(1), mat('#1b1b30'), [0, 1.62, 1.06], null, 0.045);
    for (const s of [-1, 1]) {
      apontar(p(c, G.cone(0.08, 0.32, 4), folha, [s * 0.22, 1.82, 0.62]), V(s, 0.5, -0.3)); // orelhas de folha
      galhoComFolhas(c, u, [s * 0.1, 1.85, 0.66], [[s * 0.18, 2.1, 0.6], [s * 0.28, 2.25, 0.55]], [0.035, 0.03, 0.022], folha, 0.1, COR_SIL.rosa);
    }
    const cauda = new THREE.Group(); cauda.position.set(0, 1.05, -0.5);
    p(cauda, G.cone(0.09, 0.3, 4), folha, [0, 0.05, -0.1], [-1.1, 0, 0]);
    c.add(cauda); u.caudas.push(cauda);
    olhos(c, 1.72, 0.88, 0.12, 0.08, COR_SIL.jade);
    u.sombra.scale.set(0.8, 1.2, 1);
    return;
  }
  if (e === 1) {
    // ---- Bosquárion: cervo jovem com manta de musgo e galhada florida; vaga-lumes em volta ----
    p(c, G.ico(0.6, 1), casca, [0, 1.35, 0], null, [0.9, 0.82, 1.45]);
    p(c, G.ico(0.58, 1), musgo, [0, 1.6, -0.05], null, [0.85, 0.45, 1.3]);
    p(c, G.ico(0.45, 1), claro, [0, 1.25, 0.25], null, [0.75, 0.65, 0.95]);
    for (const s of [-1, 1]) for (const z of [0.55, -0.6]) pataCervo(c, s * 0.34, z, 1.15, 0.1, casca, casco, musgo);
    tubo(c, casca, [[0, 1.5, 0.7], [0, 1.95, 0.95], [0, 2.3, 1.05]], [0.26, 0.21, 0.19]);
    p(c, G.ico(0.32, 1), casca, [0, 2.45, 1.15], null, [0.9, 0.85, 1.1]);
    p(c, G.ico(0.2, 1), escura, [0, 2.36, 1.45], null, [0.85, 0.7, 1.1]);
    p(c, G.esf(1), mat('#1b1b30'), [0, 2.36, 1.63], null, 0.055);
    p(c, G.ico(0.26, 0), musgo, [0, 2.55, 0.95], null, [1.3, 0.6, 1.1]); // juba de musgo
    for (const s of [-1, 1]) {
      apontar(p(c, G.cone(0.1, 0.4, 4), folha, [s * 0.3, 2.6, 1.05]), V(s, 0.4, -0.3));
      const b = [s * 0.14, 2.7, 1.08];
      galhoComFolhas(c, u, b, [[s * 0.3, 3.05, 1.0], [s * 0.38, 3.45, 0.9]], [0.06, 0.05, 0.035], folha, 0.18, COR_SIL.amarelo);
      galhoComFolhas(c, u, [s * 0.3, 3.05, 1.0], [[s * 0.75, 3.25, 1.05]], [0.045, 0.03], folhaEsc, 0.15, COR_SIL.rosa);
      galhoComFolhas(c, u, [s * 0.36, 3.3, 0.92], [[s * 0.65, 3.6, 0.7]], [0.035, 0.025], folha, 0.14, COR_SIL.jade);
    }
    for (const [x, z, cor] of [[0.3, 0.3, COR_SIL.rosa], [-0.32, -0.2, COR_SIL.amarelo], [0.2, -0.6, COR_SIL.rosa]]) pa(c, G.ico(0.08, 0), cor, [x, 1.9, z]);
    const cauda = new THREE.Group(); cauda.position.set(0, 1.5, -0.85);
    for (let i = 0; i < 2; i++) p(cauda, G.cone(0.12 - i * 0.03, 0.42, 4), i ? musgo : folha, [0, -i * 0.1, -0.15 - i * 0.18], [-1.2, 0, 0]);
    c.add(cauda); u.caudas.push(cauda);
    for (let i = 0; i < 5; i++) u.orbitas.push({ obj: pa(c, G.ico(0.06, 0), COR_SIL.amarelo, [0, 0, 0]), raio: 1.5, vel: 1.3, y: 1.6 + (i % 3) * 0.45, fase: (i / 5) * Math.PI * 2 });
    olhos(c, 2.5, 1.38, 0.15, 0.08, COR_SIL.jade);
    u.sombra.scale.set(1.0, 1.5, 1);
    return;
  }
  if (e === 2) {
    // ---- Raizárion: colosso de casca com raízes nos cascos, veios de jade e uma copa nos chifres ----
    p(c, G.ico(0.8, 1), escura, [0, 1.75, 0], null, [0.95, 0.85, 1.45]);
    for (let i = 0; i < 9; i++) { // placas de casca por cima
      const a = (i / 9) * Math.PI * 2;
      p(c, G.dode(0.32), casca, [Math.cos(a) * 0.55, 1.95 + Math.sin(a * 2) * 0.12, Math.sin(a) * 0.9]);
    }
    p(c, G.ico(0.72, 1), musgo, [0, 2.2, -0.1], null, [0.85, 0.4, 1.3]);
    for (let i = 0; i < 7; i++) { // veios de jade acesos
      const a = (i / 7) * Math.PI * 2;
      pa(c, G.caixa(0.05, 0.55, 0.05), COR_SIL.jade, [Math.cos(a) * 0.76, 1.7 + Math.sin(a * 3) * 0.12, Math.sin(a) * 1.12], [0, a, 0.45]);
    }
    for (const s of [-1, 1]) for (const z of [0.7, -0.75]) {
      pataCervo(c, s * 0.48, z, 1.4, 0.17, casca, escura, musgo);
      for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; apontar(p(c, G.cone(0.07, 0.55, 4), escura, [s * 0.48 + Math.cos(a) * 0.22, 0.08, z + Math.sin(a) * 0.22]), V(Math.cos(a), -0.25, Math.sin(a))); } // raízes
    }
    tubo(c, escura, [[0, 2.0, 0.9], [0, 2.55, 1.2], [0, 2.95, 1.3]], [0.36, 0.3, 0.27]);
    p(c, G.ico(0.4, 1), casca, [0, 3.1, 1.4], null, [0.9, 0.85, 1.1]);
    p(c, G.ico(0.26, 1), escura, [0, 2.98, 1.78], null, [0.85, 0.7, 1.1]);
    p(c, G.esf(1), mat('#1b1b30'), [0, 2.98, 2.0], null, 0.065);
    p(c, G.ico(0.38, 0), musgo, [0, 3.25, 1.12], null, [1.4, 0.6, 1.2]);
    for (const s of [-1, 1]) {
      apontar(p(c, G.cone(0.12, 0.5, 4), folha, [s * 0.38, 3.28, 1.3]), V(s, 0.4, -0.3));
      // galhada grossa como galhos de árvore, cheia de folhas
      const b = [s * 0.18, 3.4, 1.32];
      galhoComFolhas(c, u, b, [[s * 0.42, 3.85, 1.2], [s * 0.55, 4.35, 1.0]], [0.09, 0.075, 0.055], folha, 0.32, COR_SIL.amarelo);
      galhoComFolhas(c, u, [s * 0.42, 3.85, 1.2], [[s * 1.0, 4.1, 1.25], [s * 1.35, 4.45, 1.1]], [0.065, 0.05, 0.035], folhaEsc, 0.28, COR_SIL.rosa);
      galhoComFolhas(c, u, [s * 0.5, 4.2, 1.05], [[s * 0.95, 4.7, 0.75]], [0.05, 0.035], folha, 0.26, COR_SIL.jade);
      galhoComFolhas(c, u, [s * 0.3, 3.7, 1.25], [[s * 0.25, 4.25, 1.55]], [0.045, 0.03], folhaEsc, 0.22, null);
      for (let k = 0; k < 2; k++) p(c, G.caixa(0.03, 0.7 + k * 0.3, 0.03), mat('#3a6a2a'), [s * (0.8 + k * 0.35), 3.85 - k * 0.15, 1.15 - k * 0.1]); // cipós
    }
    const cauda = new THREE.Group(); cauda.position.set(0, 1.9, -1.15);
    for (let i = 0; i < 3; i++) p(cauda, G.cone(0.15 - i * 0.03, 0.5, 4), i % 2 ? musgo : folha, [0, -i * 0.12, -0.18 - i * 0.2], [-1.2, 0, 0]);
    c.add(cauda); u.caudas.push(cauda);
    for (let i = 0; i < 6; i++) u.orbitas.push({ obj: p(c, G.octa(0.11), i % 2 ? folha : musgo, [0, 0, 0], null, [1, 0.4, 1.8]), raio: 2.0, vel: 0.9, y: 2.0 + (i % 3) * 0.5, fase: (i / 6) * Math.PI * 2 });
    olhos(c, 3.15, 1.7, 0.17, 0.09, COR_SIL.jade);
    u.sombra.scale.set(1.3, 1.6, 1);
    return;
  }
  // ---- Ancestrárion: cervo-espírito colossal, com uma árvore inteira acesa na galhada e auréola de folhas ----
  const espirito = COR_SIL.espirito;
  p(c, G.ico(0.85, 1), escura, [0, 2.0, 0], null, [0.95, 0.85, 1.5]);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; p(c, G.dode(0.34), casca, [Math.cos(a) * 0.6, 2.2 + Math.sin(a * 2) * 0.12, Math.sin(a) * 0.98]); }
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.3; pa(c, G.caixa(0.05, 0.6, 0.05), COR_SIL.jade, [Math.cos(a) * 0.82, 1.95 + Math.sin(a * 3) * 0.12, Math.sin(a) * 1.2], [0, a, 0.45]); }
  // manta de musgo florida nas costas
  p(c, G.ico(0.78, 1), musgo, [0, 2.45, -0.1], null, [0.85, 0.42, 1.35]);
  for (let i = 0; i < 6; i++) { const f = pa(c, G.ico(0.1, 0), i % 2 ? COR_SIL.rosa : COR_SIL.amarelo, [(i % 2 ? 0.3 : -0.3), 2.75, 0.6 - i * 0.28]); }
  // juba de espírito (verde clara acesa) e cascos acesos
  for (let i = 0; i < 5; i++) pa(c, G.cone(0.14, 0.7, 4), espirito, [0, 2.9 - i * 0.12, 1.0 - i * 0.22], [-0.9, 0, (i % 2 ? 0.2 : -0.2)]);
  for (const s of [-1, 1]) for (const z of [0.75, -0.8]) {
    pataCervo(c, s * 0.5, z, 1.6, 0.18, casca, escura, musgo);
    pa(c, G.cil(0.2, 0.22, 0.12, 6), espirito, [s * 0.5, 0.06, z + 0.04]);
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; apontar(p(c, G.cone(0.08, 0.65, 4), escura, [s * 0.5 + Math.cos(a) * 0.24, 0.08, z + Math.sin(a) * 0.24]), V(Math.cos(a), -0.25, Math.sin(a))); }
  }
  tubo(c, escura, [[0, 2.3, 0.95], [0, 2.9, 1.25], [0, 3.35, 1.35]], [0.4, 0.33, 0.3]);
  p(c, G.ico(0.44, 1), casca, [0, 3.5, 1.45], null, [0.9, 0.85, 1.1]);
  p(c, G.ico(0.28, 1), escura, [0, 3.38, 1.86], null, [0.85, 0.7, 1.1]);
  p(c, G.esf(1), mat('#1b1b30'), [0, 3.38, 2.1], null, 0.07);
  for (const s of [-1, 1]) apontar(p(c, G.cone(0.13, 0.55, 4), folha, [s * 0.42, 3.7, 1.35]), V(s, 0.4, -0.3));
  // a galhada é uma árvore: dois troncos que sobem e se abrem numa copa grande com flores e frutos acesos
  const arvore = new THREE.Group(); arvore.position.set(0, 3.8, 1.3);
  for (const s of [-1, 1]) {
    tubo(arvore, escura, [[s * 0.18, 0, 0], [s * 0.45, 0.5, -0.05], [s * 0.6, 1.05, -0.15], [s * 0.45, 1.6, -0.3]], [0.11, 0.095, 0.075, 0.06]);
    tubo(arvore, escura, [[s * 0.45, 0.5, -0.05], [s * 1.05, 0.85, 0.0], [s * 1.45, 1.25, -0.1]], [0.08, 0.06, 0.045]);
    tubo(arvore, escura, [[s * 0.6, 1.05, -0.15], [s * 1.0, 1.55, -0.25]], [0.06, 0.045]);
  }
  // copa: bolotas de folhas
  for (const [x, y, z, r, esc] of [[0, 1.95, -0.35, 0.65, 0], [-0.8, 1.75, -0.3, 0.5, 1], [0.8, 1.75, -0.3, 0.5, 1], [-1.45, 1.35, -0.1, 0.42, 0], [1.45, 1.35, -0.1, 0.42, 0], [-0.45, 2.2, -0.2, 0.42, 1], [0.45, 2.2, -0.2, 0.42, 1], [0, 1.6, 0.1, 0.4, 0]]) p(arvore, G.ico(r, 1), esc ? folhaEsc : folha, [x, y, z]);
  // flores e frutos acesos na copa
  for (let i = 0; i < 12; i++) { const a = i * 2.39996, r = 0.35 + (i % 4) * 0.35; pa(arvore, G.ico(0.09, 0), [COR_SIL.rosa, COR_SIL.amarelo, COR_SIL.jade, COR_SIL.branco][i % 4], [Math.cos(a) * r * 1.3, 1.6 + Math.sin(a) * 0.45 + (i % 3) * 0.15, -0.1 + Math.sin(a) * 0.35]); }
  c.add(arvore);
  u.pulsos.push({ obj: arvore, base: 1, amp: 0.02, vel: 1.5 });
  // auréola de folhas e cipós atrás da cabeça
  const anel = new THREE.Group(); anel.position.set(0, 3.55, 0.75);
  p(anel, G.toro(1.0, 0.06, Math.PI * 2, 5, 24), mat('#3a6a2a'), [0, 0, 0]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    if (i % 3 === 0) pa(anel, G.ico(0.09, 0), i % 2 ? COR_SIL.rosa : COR_SIL.amarelo, [Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0.05]);
    else apontar(p(anel, G.cone(0.08, 0.3, 4), folha, [Math.cos(a) * 1.08, Math.sin(a) * 1.08, 0]), V(Math.cos(a), Math.sin(a), 0));
  }
  c.add(anel);
  u.giros.push({ obj: anel, eixo: 'z', vel: 0.3 });
  const cauda = new THREE.Group(); cauda.position.set(0, 2.1, -1.25);
  for (let i = 0; i < 3; i++) pa(cauda, G.cone(0.16 - i * 0.03, 0.55, 4), espirito, [0, -i * 0.12, -0.2 - i * 0.22], [-1.2, 0, 0]);
  c.add(cauda); u.caudas.push(cauda);
  // luzes de espírito girando em volta
  for (let i = 0; i < 8; i++) u.orbitas.push({ obj: pa(c, G.ico(0.08, 0), i % 2 ? espirito : COR_SIL.jade, [0, 0, 0]), raio: 2.3, vel: 0.8, y: 1.8 + (i % 4) * 0.55, fase: (i / 8) * Math.PI * 2 });
  olhos(c, 3.55, 1.76, 0.18, 0.1, espirito);
  u.sombra.scale.set(1.4, 1.7, 1);
}

const RAROS_MODELO = {}; // todos os raros e lendários já têm formas novas (LINHAS_MODELO)

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
  return [m.type, m.color?.getHexString(), m.emissive?.getHexString(), m.emissiveIntensity, m.transparent, m.opacity, m.side, m.flatShading, m.vertexColors].join('|');
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
      // peças com cor em cada vértice (material "aceso" dos lendários): a cor vai junto
      const temCor = geos.every((g2) => g2.attributes.color);
      const cor = temCor ? new Float32Array(total * 3) : null;
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
            if (cor) { const C = geos[i].attributes.color; cor[k] = C.getX(j); cor[k + 1] = C.getY(j); cor[k + 2] = C.getZ(j); }
            k += 3;
          }
        }
        g.remove(o);
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      if (cor) geo.setAttribute('color', new THREE.BufferAttribute(cor, 3));
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

// ---------- Treinador (o jogador no mundo) ----------
export function criarTreinador() {
  const r = base(1);
  const c = r.userData.corpo;
  const calca = mat('#2d3a5c'), jaqueta = mat('#ffb03b'), pele = mat('#f2c9a0'), bone = mat('#e8443a'), mochila = mat('#3a8ee0');
  const pernas = [], bracos = [];
  for (const s of [-1, 1]) {
    const pivo = new THREE.Group();
    pivo.position.set(s * 0.12, 0.5, 0);
    p(pivo, G.caixa(0.18, 0.48, 0.2), calca, [0, -0.24, 0]);
    c.add(pivo);
    pernas.push(pivo);
    const pb = new THREE.Group();
    pb.position.set(s * 0.33, 1.0, 0);
    p(pb, G.caixa(0.13, 0.46, 0.15), jaqueta, [0, -0.22, 0]);
    c.add(pb);
    bracos.push(pb);
  }
  p(c, G.caixa(0.5, 0.56, 0.3), jaqueta, [0, 0.77, 0]);
  p(c, G.ico(0.25, 1), pele, [0, 1.28, 0]);
  p(c, G.cil(0.26, 0.26, 0.13, 8), bone, [0, 1.45, 0]);
  p(c, G.caixa(0.3, 0.04, 0.22), bone, [0, 1.4, 0.24]);
  p(c, G.caixa(0.38, 0.42, 0.18), mochila, [0, 0.82, -0.24]);
  olhos(c, 1.3, 0.21, 0.09, 0.05);
  r.userData.pernas = pernas;
  r.userData.bracos = bracos;
  juntarPecas(r, pecasQueMexem(r.userData));
  return r;
}

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

// ---------- Casa do jogador (fixa no Reino) ----------
// nivel 1 a 5 (cada um cresce em cima do anterior):
//  1: cabana simples · 2: sobrado com 2º andar e telhado azul · 3: + varanda coberta e cerca com flores
//  4: casa grande, mais larga, com torrezinha redonda · 5: casarão com ala do lado, telhado dourado,
//     bandeira do Reino e lanternas
// As peças do mesmo material viram uma malha só (juntarPecas), para pesar pouco no celular.
export function criarCasa(nivel = 1) {
  const g = new THREE.Group();
  const parede = mat('#f3e3c3'), madeira = mat('#8a5a3a'), pedra = mat('#c9c0ad'), grama = mat('#4f9a45');
  const telhado = mat(nivel >= 2 ? '#3a5aa8' : '#d9534f'), ouro = brilho('#ffd23f', 0.5);
  const vidro = () => mat('#9fe0ff', { emissive: '#ffd37a', emissiveIntensity: 0.1 });
  const larg = nivel >= 4 ? 5.2 : 3.6;     // largura do corpo da casa
  const andar = nivel >= 2 ? 1.7 : 0;      // altura do 2º andar
  const janelas = [];
  p(g, G.caixa(larg + 0.8, 0.3, 3.8), pedra, [0, 0.15, 0]);
  p(g, G.caixa(larg, 2.2, 3.0), parede, [0, 1.4, 0]);
  if (nivel >= 2) {
    // 2º andar com madeira cruzada e janelas
    p(g, G.caixa(larg + 0.2, andar, 3.2), parede, [0, 2.5 + andar / 2, 0]);
    for (const x of [-(larg / 2 + 0.1), 0, larg / 2 + 0.1]) p(g, G.caixa(0.16, andar, 3.25), madeira, [x, 2.5 + andar / 2, 0]);
    p(g, G.caixa(larg + 0.3, 0.16, 3.3), madeira, [0, 2.5, 0]);
    const nj = nivel >= 4 ? 3 : 2;
    for (let k = 0; k < nj; k++) janelas.push(p(g, G.caixa(0.6, 0.6, 0.08), vidro(), [(k - (nj - 1) / 2) * (larg / nj), 2.5 + andar / 2, 1.62]));
  }
  const teto = p(g, G.cone((larg / 2 + 0.6) * 1.35, 1.7 + (nivel >= 4 ? 0.4 : 0), 4), telhado, [0, 3.35 + andar + (nivel >= 4 ? 0.2 : 0), 0], [0, Math.PI / 4, 0]);
  teto.scale.set(1, 1, 3.0 / larg * 0.95);
  // vigas nos cantos, porta e janelas de baixo
  for (const [x, z] of [[-larg / 2, 1.5], [larg / 2, 1.5], [-larg / 2, -1.5], [larg / 2, -1.5]]) p(g, G.caixa(0.2, 2.2, 0.2), madeira, [x, 1.4, z]);
  p(g, G.caixa(0.95, 1.45, 0.1), madeira, [0, 1.03, 1.52]);
  p(g, G.esf(0.06), ouro, [0.3, 1.0, 1.59]);
  for (const x of nivel >= 4 ? [-1.9, -1.05, 1.05, 1.9] : [-1.15, 1.15]) {
    janelas.push(p(g, G.caixa(0.6, 0.6, 0.08), vidro(), [x, 1.6, 1.52]));
    p(g, G.caixa(0.7, 0.08, 0.12), madeira, [x, 1.26, 1.55]);
  }
  const yChamine = 4.3 + andar + (nivel >= 4 ? 0.4 : 0);
  p(g, G.caixa(0.45, 1.2, 0.45), pedra, [1.0, yChamine - 0.7, -0.5]);
  p(g, G.caixa(1.2, 0.04, 0.7), mat('#c9533a'), [0, 0.32, 2.3]); // tapete na porta
  // bandeirinha no telhado
  p(g, G.cil(0.03, 0.03, 1.2, 4), madeira, [-1.0, yChamine - 0.3, 0.2]);
  const bandeira = p(g, G.caixa(0.6, 0.35, 0.03), mat(nivel >= 2 ? '#ffd23f' : '#8ff4ff'), [-0.7, yChamine + 0.1, 0.2]);
  if (nivel >= 3) {
    // varanda coberta na frente (4 postes e um telhadinho) e cerca baixa com flores
    for (const x of [-1.4, 1.4]) p(g, G.caixa(0.14, 1.9, 0.14), madeira, [x, 0.95, 2.6]);
    p(g, G.caixa(3.2, 0.12, 1.3), telhado, [0, 1.95, 2.1], [0.25, 0, 0]);
    for (let k = -4; k <= 4; k++) if (Math.abs(k) > 1) p(g, G.caixa(0.1, 0.6, 0.1), madeira, [k * 0.7, 0.3, 3.6]);
    p(g, G.caixa(6.2, 0.08, 0.08), madeira, [0, 0.5, 3.6]);
    for (const [x, c] of [[-2.4, '#ff6a9a'], [-1.9, '#ffd23f'], [1.9, '#ff6a9a'], [2.4, '#b87aff']]) {
      p(g, G.esf(0.22), grama, [x, 0.3, 3.2]);
      p(g, G.esf(0.1), mat(c), [x, 0.5, 3.25]);
    }
  }
  if (nivel >= 4) {
    // torrezinha redonda do lado esquerdo
    const tx = -(larg / 2 + 0.6);
    p(g, G.cil(0.9, 1, 4.6 + andar * 0.4, 8), pedra, [tx, (4.6 + andar * 0.4) / 2, -0.6]);
    p(g, G.cone(1.25, 1.8, 8), nivel >= 5 ? ouro : telhado, [tx, 4.6 + andar * 0.4 + 0.9, -0.6]);
    janelas.push(p(g, G.caixa(0.08, 0.6, 0.45), vidro(), [tx - 0.92, 3.2, -0.6]));
  }
  if (nivel >= 5) {
    // ala do lado direito, bandeira do Reino na torre e lanternas na frente
    const ax = larg / 2 + 1.5;
    p(g, G.caixa(2.6, 2.4, 2.6), parede, [ax, 1.5, -0.3]);
    p(g, G.cone(2.2, 1.4, 4), telhado, [ax, 3.4, -0.3], [0, Math.PI / 4, 0]);
    janelas.push(p(g, G.caixa(0.6, 0.6, 0.08), vidro(), [ax, 1.6, 1.02]));
    const tx = -(larg / 2 + 0.6);
    p(g, G.cil(0.04, 0.04, 1.6, 4), madeira, [tx, 7.3, -0.6]);
    p(g, G.caixa(0.9, 0.5, 0.04), mat('#3a5aa8'), [tx + 0.47, 7.8, -0.6]);
    p(g, G.esf(0.12), ouro, [tx + 0.47, 7.8, -0.57]);
    for (const x of [-3.4, 3.4]) {
      p(g, G.cil(0.06, 0.08, 1.5, 5), madeira, [x, 0.75, 3.9]);
      janelas.push(p(g, G.esf(0.18), vidro(), [x, 1.6, 3.9]));
    }
  }
  const fumacas = [];
  for (let i = 0; i < 3; i++) fumacas.push(p(g, G.ico(0.22, 0), mat('#e0e0e0', { transparent: true, opacity: 0.7, depthWrite: false }), [1.0, yChamine, -0.5]));
  g.userData = { janelas, fumacas, bandeira, nivel, yChamine };
  juntarPecas(g, new Set([...janelas, ...fumacas, bandeira]));
  return g;
}

export function animarCasa(casa, t, noite) {
  const u = casa.userData;
  u.fumacas.forEach((f, i) => {
    const k = (t * 0.35 + i / 3) % 1;
    f.position.set(1.0 + k * 0.4, u.yChamine + k * 1.6, -0.5);
    f.scale.setScalar(0.6 + k * 1.2);
    f.material.opacity = 0.7 * (1 - k);
  });
  for (const j of u.janelas) j.material.emissiveIntensity = 0.1 + noite * 0.9;
  u.bandeira.rotation.y = Math.sin(t * 3) * 0.3;
}

// ---------- Bandeira do Reino (portátil: onde você renasce) ----------
// nivel 1: mastro de madeira e bandeira azul com o cristal do Reino
// nivel 2: mastro mais alto com ponta dourada, bandeira maior com faixa dourada e brilho no chão
export function criarBandeira(nivel = 1) {
  const g = new THREE.Group();
  const madeira = mat('#8a5a3a'), pedra = mat('#c9c0ad'), azul = mat('#3a5aa8'), ouro = brilho('#ffd23f', 0.6);
  const alto = nivel >= 2 ? 3.6 : 3;
  // base de pedras
  for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; p(g, G.dode(0.28), pedra, [Math.cos(a) * 0.35, 0.15, Math.sin(a) * 0.35]); }
  p(g, G.cil(0.07, 0.09, alto, 6), madeira, [0, alto / 2, 0]);
  p(g, G.esf(nivel >= 2 ? 0.16 : 0.1), nivel >= 2 ? ouro : madeira, [0, alto + 0.08, 0]);
  // o pano (em um grupo que balança, preso no mastro)
  const pano = new THREE.Group();
  pano.position.set(0, alto - 0.55, 0);
  const w = nivel >= 2 ? 1.5 : 1.2, h = nivel >= 2 ? 0.9 : 0.75;
  p(pano, G.caixa(w, h, 0.04), azul, [w / 2 + 0.06, 0, 0]);
  p(pano, G.octa(0.16), brilho('#8ff4ff', 0.7), [w / 2 + 0.06, 0, 0.04], null, [1, 1.4, 0.5]); // o cristal do Reino
  if (nivel >= 2) for (const y of [-h / 2 + 0.06, h / 2 - 0.06]) p(pano, G.caixa(w, 0.08, 0.05), ouro, [w / 2 + 0.06, y, 0]);
  g.add(pano);
  if (nivel >= 2) p(g, G.cil(0.9, 0.9, 0.04, 18), brilho('#ffd23f', 0.4, { transparent: true, opacity: 0.35, depthWrite: false }), [0, 0.03, 0]);
  g.userData = { pano, nivel };
  return g;
}

export function animarBandeira(b, t) {
  const u = b.userData;
  u.pano.rotation.y = Math.sin(t * 2.6) * 0.35;
  u.pano.scale.x = 1 + Math.sin(t * 5) * 0.05;
}

// ---------- Cristal de captura ----------
// tipo: 0 comum (azul), 1 forte (roxo), 2 supremo (dourado)
export function criarCristal(escala = 1, tipo = 0) {
  const c = CRISTAIS[tipo];
  const m = new THREE.Mesh(G.octa(0.28), new THREE.MeshLambertMaterial({ color: c.cor, emissive: c.emissivo, emissiveIntensity: 0.6, flatShading: true }));
  m.scale.set(escala, escala * 1.45, escala);
  return m;
}

export function pintarCristal(m, tipo) {
  const c = CRISTAIS[tipo];
  m.material.color.set(c.cor);
  m.material.emissive.set(c.emissivo);
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
