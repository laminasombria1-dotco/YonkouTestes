// =============================================================
// MODELOS 3D LOW POLY
// Cada linha evolutiva tem um "construtor" que recebe o estágio (0 a 3)
// e vai acrescentando peças: a evolução parece o crescimento da forma anterior.
// A frente de todo modelo aponta para +Z.
// Quando quiser trocar por modelos feitos no Blender, é aqui que
// carregaremos arquivos .glb no lugar dessas formas.
// =============================================================
import * as THREE from 'three';
import { ESPECIES } from './dados.js';

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

const MAT_SOMBRA = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });

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

const LINHAS_MODELO = { fogo: linhaFogo, agua: linhaAgua, planta: linhaPlanta, terra: linhaTerra, raio: linhaRaio, sol: linhaSol, lua: linhaLua, luz: linhaLuz, trevas: linhaTrevas };

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

const RAROS_MODELO = { vulcarapa, aquaraia, espinhal };

export function criarModelo(especie) {
  const esp = ESPECIES[especie];
  const m = base(esp.tamanho, esp.estagio);
  const u = m.userData;
  if (esp.linha) LINHAS_MODELO[esp.linha](u.corpo, u, esp.estagio);
  else RAROS_MODELO[especie](u.corpo, u);
  u.especie = especie;
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
  return r;
}

// ---------- Cristal de captura ----------
export function criarCristal(escala = 1) {
  const m = new THREE.Mesh(G.octa(0.28), new THREE.MeshLambertMaterial({ color: '#8ff4ff', emissive: '#2ab8d8', emissiveIntensity: 0.6, flatShading: true }));
  m.scale.set(escala, escala * 1.45, escala);
  return m;
}

// ---------- Animação parada/andando ----------
export function animarModelo(modelo, t, movendo) {
  const u = modelo.userData;
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
  obj.traverse((o) => {
    if ((o.isMesh || o.isPoints) && o.material !== MAT_SOMBRA) {
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material.dispose();
    }
  });
}
