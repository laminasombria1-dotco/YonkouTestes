// =============================================================
// MODELOS 3D LOW POLY
// Cada monstro é montado com formas simples (esferas, cones, caixas).
// A frente de todo modelo aponta para +Z.
// Quando quiser trocar por modelos feitos no Blender, é aqui que
// carregaremos arquivos .glb no lugar dessas formas.
// =============================================================
import * as THREE from 'three';

// Geometrias são reaproveitadas entre modelos (economiza memória no celular)
const GEO = {};
function geo(chave, criar) {
  if (!GEO[chave]) GEO[chave] = criar();
  return GEO[chave];
}

const MAT_SOMBRA = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });

// Cada modelo ganha materiais próprios, para poder "piscar" sozinho ao levar dano
function mat(cor, extra = {}) {
  return new THREE.MeshLambertMaterial({ color: cor, flatShading: true, ...extra });
}

function peca(geometria, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometria, material);
  m.position.set(x, y, z);
  return m;
}

function olhos(alvo, y, z, sep, r = 0.11) {
  const branco = mat('#ffffff');
  const preto = mat('#1b1b30');
  const esfera = geo('olho', () => new THREE.SphereGeometry(1, 8, 6));
  for (const s of [-1, 1]) {
    const o = peca(esfera, branco, s * sep, y, z);
    o.scale.setScalar(r);
    const p = peca(esfera, preto, s * sep, y + r * 0.1, z + r * 0.62);
    p.scale.setScalar(r * 0.55);
    alvo.add(o, p);
  }
}

function base(tamanho = 1) {
  const raiz = new THREE.Group();
  const corpo = new THREE.Group();
  corpo.scale.setScalar(tamanho);
  raiz.add(corpo);
  const sombra = new THREE.Mesh(geo('sombra', () => new THREE.CircleGeometry(1, 16)), MAT_SOMBRA);
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.05;
  sombra.scale.setScalar(0.75 * tamanho);
  raiz.add(sombra);
  raiz.userData = { corpo, sombra, tamanho, fase: Math.random() * 10 };
  return raiz;
}

// ---------- Brasito (fogo) ----------
function brasito() {
  const r = base(1);
  const c = r.userData.corpo;
  const laranja = mat('#ff8a3d'), escuro = mat('#d4552a'), creme = mat('#ffe2bd');
  const tronco = peca(geo('ico05', () => new THREE.IcosahedronGeometry(0.5, 1)), laranja, 0, 0.62, 0);
  tronco.scale.set(1, 0.9, 1.15);
  const barriga = peca(geo('esf1', () => new THREE.SphereGeometry(1, 8, 6)), creme, 0, 0.55, 0.28);
  barriga.scale.set(0.32, 0.32, 0.2);
  const cabeca = peca(geo('ico04', () => new THREE.IcosahedronGeometry(0.4, 1)), laranja, 0, 1.12, 0.38);
  const focinho = peca(geo('cone-focinho', () => new THREE.ConeGeometry(0.16, 0.32, 5)), creme, 0, 1.04, 0.82);
  focinho.rotation.x = Math.PI / 2;
  const nariz = peca(geo('esf1'), mat('#1b1b30'), 0, 1.05, 0.98);
  nariz.scale.setScalar(0.06);
  c.add(tronco, barriga, cabeca, focinho, nariz);
  for (const s of [-1, 1]) {
    const orelha = peca(geo('cone-orelha', () => new THREE.ConeGeometry(0.14, 0.38, 4)), escuro, s * 0.22, 1.5, 0.32);
    orelha.rotation.z = -s * 0.25;
    c.add(orelha);
  }
  for (const [x, z] of [[-0.25, 0.28], [0.25, 0.28], [-0.25, -0.28], [0.25, -0.28]]) {
    c.add(peca(geo('pata', () => new THREE.CylinderGeometry(0.08, 0.1, 0.36, 5)), escuro, x, 0.18, z));
  }
  const cauda = new THREE.Group();
  cauda.position.set(0, 0.8, -0.5);
  const chama = peca(geo('cone-chama', () => new THREE.ConeGeometry(0.24, 0.75, 5)), mat('#ffc23f', { emissive: '#ff6a00', emissiveIntensity: 0.5 }), 0, 0.2, -0.25);
  chama.rotation.x = -0.9;
  cauda.add(chama);
  c.add(cauda);
  olhos(c, 1.2, 0.72, 0.17, 0.1);
  r.userData.cauda = cauda;
  return r;
}

// ---------- Vulcarapa (fogo) ----------
function vulcarapa() {
  const r = base(1.25);
  const c = r.userData.corpo;
  const pele = mat('#93b26c'), casco = mat('#7a4e33');
  const corpo = peca(geo('esf1', () => new THREE.SphereGeometry(1, 8, 6)), pele, 0, 0.45, 0);
  corpo.scale.set(0.75, 0.38, 0.9);
  const cascoM = peca(geo('casco', () => new THREE.CylinderGeometry(0.32, 0.85, 0.75, 7)), casco, 0, 0.95, -0.05);
  const cratera = peca(geo('cratera', () => new THREE.CylinderGeometry(0.26, 0.26, 0.08, 7)), mat('#ff5a1f', { emissive: '#ff3a00', emissiveIntensity: 0.8 }), 0, 1.33, -0.05);
  const cabeca = peca(geo('ico036', () => new THREE.IcosahedronGeometry(0.33, 1)), pele, 0, 0.55, 0.85);
  c.add(corpo, cascoM, cratera, cabeca);
  for (const [x, z] of [[-0.5, 0.45], [0.5, 0.45], [-0.5, -0.45], [0.5, -0.45]]) {
    c.add(peca(geo('pata-grossa', () => new THREE.CylinderGeometry(0.15, 0.17, 0.34, 6)), pele, x, 0.17, z));
  }
  const fumaca = peca(geo('ico02', () => new THREE.IcosahedronGeometry(0.2, 0)), mat('#c9c3b8', { transparent: true, opacity: 0.8 }), 0, 1.6, -0.05);
  c.add(fumaca);
  olhos(c, 0.66, 1.1, 0.14, 0.09);
  r.userData.fumaca = fumaca;
  return r;
}

// ---------- Gotinho (água) ----------
function gotinho() {
  const r = base(1);
  const c = r.userData.corpo;
  const agua = mat('#5cc4ff', { transparent: true, opacity: 0.9 });
  const gota = peca(geo('esf-gota', () => new THREE.SphereGeometry(0.6, 10, 8)), agua, 0, 0.6, 0);
  const ponta = peca(geo('cone-gota', () => new THREE.ConeGeometry(0.44, 0.75, 10)), agua, 0, 1.25, 0);
  const brilho = peca(geo('esf1', () => new THREE.SphereGeometry(1, 8, 6)), mat('#ffffff'), -0.25, 0.95, 0.4);
  brilho.scale.setScalar(0.08);
  c.add(gota, ponta, brilho);
  for (const s of [-1, 1]) {
    const bochecha = peca(geo('esf1'), mat('#ff9ec4'), s * 0.36, 0.55, 0.45);
    bochecha.scale.set(0.09, 0.06, 0.04);
    c.add(bochecha);
  }
  olhos(c, 0.72, 0.52, 0.2, 0.12);
  r.userData.gelatina = true;
  return r;
}

// ---------- Aquaraia (água) ----------
function aquaraia() {
  const r = base(1.1);
  const c = r.userData.corpo;
  const dorso = mat('#3a8ee0'), claro = mat('#bfe8ff');
  const corpo = peca(geo('octa1', () => new THREE.OctahedronGeometry(1, 0)), dorso, 0, 1.1, 0);
  corpo.scale.set(1.5, 0.26, 1.0);
  const barriga = peca(geo('octa1'), claro, 0, 1.04, 0.05);
  barriga.scale.set(1.2, 0.2, 0.8);
  const cauda = peca(geo('cone-cauda', () => new THREE.ConeGeometry(0.07, 1.4, 4)), dorso, 0, 1.1, -1.4);
  cauda.rotation.x = -Math.PI / 2;
  c.add(corpo, barriga, cauda);
  for (const s of [-1, 1]) {
    const chifre = peca(geo('cone-chifre', () => new THREE.ConeGeometry(0.08, 0.35, 4)), claro, s * 0.3, 1.12, 0.95);
    chifre.rotation.x = Math.PI / 2;
    c.add(chifre);
  }
  olhos(c, 1.27, 0.5, 0.3, 0.1);
  r.userData.voa = true;
  r.userData.sombra.scale.set(1.1, 0.8, 1);
  return r;
}

// ---------- Musguinho (planta) ----------
function musguinho() {
  const r = base(1);
  const c = r.userData.corpo;
  const verde = mat('#6fcf5a'), musgo = mat('#3f8f3a');
  const corpo = peca(geo('caixa-corpo', () => new THREE.BoxGeometry(0.95, 0.85, 0.9)), verde, 0, 0.57, 0);
  const topo = peca(geo('caixa-topo', () => new THREE.BoxGeometry(1.02, 0.18, 0.97)), musgo, 0, 1.04, 0);
  c.add(corpo, topo);
  const tufos = [[-0.3, 0.2], [0.25, -0.25], [-0.1, -0.3], [0.32, 0.25], [0, 0.05]];
  for (const [x, z] of tufos) {
    c.add(peca(geo('tufo', () => new THREE.ConeGeometry(0.08, 0.26, 4)), musgo, x, 1.24, z));
  }
  const caule = peca(geo('caule', () => new THREE.CylinderGeometry(0.025, 0.025, 0.3, 4)), musgo, 0.15, 1.28, 0.05);
  const flor = peca(geo('ico013', () => new THREE.IcosahedronGeometry(0.14, 0)), mat('#ff7eb6'), 0.15, 1.46, 0.05);
  const miolo = peca(geo('esf1', () => new THREE.SphereGeometry(1, 8, 6)), mat('#ffd23f'), 0.15, 1.47, 0.17);
  miolo.scale.setScalar(0.06);
  c.add(caule, flor, miolo);
  for (const s of [-1, 1]) {
    c.add(peca(geo('pe', () => new THREE.BoxGeometry(0.26, 0.14, 0.32)), musgo, s * 0.26, 0.07, 0.08));
  }
  olhos(c, 0.66, 0.47, 0.2, 0.11);
  return r;
}

// ---------- Espinhal (planta) ----------
function espinhal() {
  const r = base(1.1);
  const c = r.userData.corpo;
  const cacto = mat('#4f9d5a'), espinho = mat('#fff2b0'), rosto = mat('#c9e6a0');
  const corpo = peca(geo('ico06', () => new THREE.IcosahedronGeometry(0.6, 1)), cacto, 0, 0.66, 0);
  corpo.scale.set(1, 0.9, 1.1);
  c.add(corpo);
  // Espinhos espalhados nas costas, cada um apontando para fora do corpo
  const cima = new THREE.Vector3(0, 1, 0);
  const coneEsp = geo('espinho', () => new THREE.ConeGeometry(0.06, 0.34, 4));
  for (let i = 0; i < 16; i++) {
    const teta = (i / 16) * Math.PI * 2 * 2.3;
    const phi = 0.35 + (i % 4) * 0.33;
    const n = new THREE.Vector3(Math.sin(phi) * Math.sin(teta), Math.cos(phi), -Math.abs(Math.sin(phi) * Math.cos(teta)) - 0.15).normalize();
    const e = peca(coneEsp, espinho, n.x * 0.6, 0.66 + n.y * 0.55, n.z * 0.62);
    e.quaternion.setFromUnitVectors(cima, n);
    c.add(e);
  }
  const face = peca(geo('esf1', () => new THREE.SphereGeometry(1, 8, 6)), rosto, 0, 0.6, 0.45);
  face.scale.set(0.34, 0.3, 0.2);
  const nariz = peca(geo('esf1'), mat('#1b1b30'), 0, 0.58, 0.66);
  nariz.scale.setScalar(0.05);
  const flor = peca(geo('ico013', () => new THREE.IcosahedronGeometry(0.14, 0)), mat('#ff4f5e'), 0, 1.25, -0.02);
  c.add(face, nariz, flor);
  for (const [x, z] of [[-0.28, 0.25], [0.28, 0.25], [-0.28, -0.25], [0.28, -0.25]]) {
    c.add(peca(geo('pata', () => new THREE.CylinderGeometry(0.08, 0.1, 0.36, 5)), cacto, x, 0.16, z));
  }
  olhos(c, 0.72, 0.6, 0.14, 0.09);
  return r;
}

const CONSTRUTORES = { brasito, vulcarapa, gotinho, aquaraia, musguinho, espinhal };

export function criarModelo(especie) {
  const m = CONSTRUTORES[especie]();
  m.userData.especie = especie;
  return m;
}

// ---------- Treinador (o jogador no mundo) ----------
export function criarTreinador() {
  const r = base(1);
  const c = r.userData.corpo;
  const calca = mat('#2d3a5c'), jaqueta = mat('#ffb03b'), pele = mat('#f2c9a0'), bone = mat('#e8443a'), mochila = mat('#3a8ee0');
  const pernas = [];
  for (const s of [-1, 1]) {
    const pivo = new THREE.Group();
    pivo.position.set(s * 0.12, 0.5, 0);
    const perna = peca(geo('perna', () => new THREE.BoxGeometry(0.18, 0.48, 0.2)), calca, 0, -0.24, 0);
    pivo.add(perna);
    c.add(pivo);
    pernas.push(pivo);
  }
  const bracos = [];
  for (const s of [-1, 1]) {
    const pivo = new THREE.Group();
    pivo.position.set(s * 0.33, 1.0, 0);
    pivo.add(peca(geo('braco', () => new THREE.BoxGeometry(0.13, 0.46, 0.15)), jaqueta, 0, -0.22, 0));
    c.add(pivo);
    bracos.push(pivo);
  }
  c.add(peca(geo('tronco-t', () => new THREE.BoxGeometry(0.5, 0.56, 0.3)), jaqueta, 0, 0.77, 0));
  c.add(peca(geo('cabeca-t', () => new THREE.IcosahedronGeometry(0.25, 1)), pele, 0, 1.28, 0));
  c.add(peca(geo('bone', () => new THREE.CylinderGeometry(0.26, 0.26, 0.13, 8)), bone, 0, 1.45, 0));
  c.add(peca(geo('aba', () => new THREE.BoxGeometry(0.3, 0.04, 0.22)), bone, 0, 1.4, 0.24));
  c.add(peca(geo('mochila', () => new THREE.BoxGeometry(0.38, 0.42, 0.18)), mochila, 0, 0.82, -0.24));
  olhos(c, 1.3, 0.21, 0.09, 0.05);
  r.userData.pernas = pernas;
  r.userData.bracos = bracos;
  return r;
}

// ---------- Cristal de captura ----------
export function criarCristal(escala = 1) {
  const m = new THREE.Mesh(
    geo('cristal', () => new THREE.OctahedronGeometry(0.28, 0)),
    new THREE.MeshLambertMaterial({ color: '#8ff4ff', emissive: '#2ab8d8', emissiveIntensity: 0.6, flatShading: true }),
  );
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
    c.rotation.z = Math.sin(fase * 0.4) * 0.15;
  } else if (u.gelatina) {
    const s = Math.sin(fase) * (movendo ? 0.1 : 0.05);
    c.scale.set(u.tamanho * (1 - s * 0.5), u.tamanho * (1 + s), u.tamanho * (1 - s * 0.5));
    c.position.y = movendo ? Math.abs(Math.sin(fase * 0.5)) * 0.25 : 0;
  } else {
    c.position.y = Math.abs(Math.sin(fase)) * (movendo ? 0.12 : 0.03);
  }
  if (u.cauda) u.cauda.rotation.y = Math.sin(fase * 0.8) * 0.45;
  if (u.fumaca) {
    const k = (t * 0.6 + u.fase) % 1;
    u.fumaca.position.y = 1.5 + k * 0.7;
    u.fumaca.scale.setScalar(0.6 + k);
    u.fumaca.material.opacity = 0.8 * (1 - k);
  }
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
    const md = o.userData;
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
    if (o.isMesh && o.material !== MAT_SOMBRA) {
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material.dispose();
    }
  });
}
