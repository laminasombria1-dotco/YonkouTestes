// =============================================================
// MUNDO ABERTO
// Regiões: Campo (centro), Floresta (planta), Lago (água), Vulcão (fogo),
// Pedreira (terra) e Planalto da Tempestade (raio).
// Ciclo de dia e noite: Sol e Luz aparecem de dia; Lua e Trevas à noite.
// Monstros selvagens passeiam; encostou, começa a batalha.
// =============================================================
import * as THREE from 'three';
import { criarModelo, criarTreinador, criarCristal, animarModelo, descartar } from './modelos.js';
import { ESPECIES, ELEMENTOS, APARICOES, PERIODO_DA_LINHA, criarMonstro, statsDe, formaPorNivel } from './dados.js';

export const RAIO_MUNDO = 88;
const LAGO = { x: -32, z: 30, r: 15 };
const VULCAO = { x: 54, z: -50 };
const PEDREIRA = { x: 42, z: 38, r: 30 };
const PLANALTO = { x: 0, z: -64, r: 24 };
// A ordem importa: onde duas regiões se encostam, vale a primeira da lista
const ZONAS = [
  { id: 'raio', x: PLANALTO.x, z: PLANALTO.z, r: PLANALTO.r },
  { id: 'agua', x: -34, z: 32, r: 34 },
  { id: 'terra', x: PEDREIRA.x, z: PEDREIRA.z, r: PEDREIRA.r },
  { id: 'fogo', x: 42, z: -34, r: 32 },
  { id: 'planta', x: -40, z: -32, r: 34 },
];
export const NOMES_ZONA = { campo: 'Campo', agua: 'Lago', fogo: 'Vulcão', planta: 'Floresta', terra: 'Pedreira', raio: 'Planalto da Tempestade' };
const VEL_JOGADOR = 7.5;
const MAX_SELVAGENS = 18;
export const DURACAO_DIA = 240; // segundos para um ciclo completo (metade dia, metade noite)

const CEU_DIA = new THREE.Color('#9fd8ff'), CEU_NOITE = new THREE.Color('#1b2550');
const HEMI_DIA = new THREE.Color('#d6f0ff'), HEMI_NOITE = new THREE.Color('#8f9fe0');
const SOL_DIA = new THREE.Color('#fff1d6'), SOL_NOITE = new THREE.Color('#a8b8ff');

export function zonaEm(x, z) {
  for (const zn of ZONAS) if (Math.hypot(x - zn.x, z - zn.z) < zn.r) return zn.id;
  return 'campo';
}

export function alturaEm(x, z) {
  let h = Math.sin(x * 0.07) * Math.cos(z * 0.06) * 1.4 + Math.sin(x * 0.19 + z * 0.11) * 0.45;
  const dc = Math.hypot(x, z);
  if (dc < 12) h *= dc / 12; // centro plano para a fonte
  const dl = Math.hypot(x - LAGO.x, z - LAGO.z);
  if (dl < LAGO.r + 6) {
    const k = Math.min(1, (LAGO.r + 6 - dl) / 6);
    h = h * (1 - k) - 1.8 * k;
  }
  const dv = Math.hypot(x - 42, z + 34);
  if (dv < 30) h += (1 - dv / 30) * 3;
  const dp = Math.hypot(x - PEDREIRA.x, z - PEDREIRA.z);
  if (dp < PEDREIRA.r) h += (Math.sin(x * 0.3) * Math.cos(z * 0.27) + 1) * 1.1 * (1 - dp / PEDREIRA.r);
  const dt = Math.hypot(x - PLANALTO.x, z - PLANALTO.z);
  if (dt < PLANALTO.r) h += Math.min(1, (PLANALTO.r - dt) / 6) * 2.4; // mesa elevada
  if (dc > RAIO_MUNDO - 6) h += (dc - (RAIO_MUNDO - 6)) * 0.9;
  return h;
}

// Gerador de números aleatórios com semente: o mapa sai igual toda vez
function aleatorio(semente) {
  return () => {
    semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerpAngulo(a, b, k) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}

export class Mundo {
  constructor(jogo) {
    this.jogo = jogo;
    this.cena = new THREE.Scene();
    this.cena.background = CEU_DIA.clone();
    this.cena.fog = new THREE.Fog(CEU_DIA.clone(), 40, 115);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
    this.hemi = new THREE.HemisphereLight(HEMI_DIA.clone(), '#5d7a3e', 1.7);
    this.sol = new THREE.DirectionalLight(SOL_DIA.clone(), 1.9);
    this.sol.position.set(30, 50, 20);
    this.cena.add(this.hemi, this.sol);

    this.rng = aleatorio(20261119);
    this.obstaculos = [];
    this.criarTerreno();
    this.criarAgua();
    this.criarFonte();
    this.criarVulcao();
    this.criarDecoracao();
    this.criarEstrelas();

    this.jogador = criarTreinador();
    this.cena.add(this.jogador);
    this.pos = new THREE.Vector3(0, 0, 7);
    this.ang = Math.PI;
    this.graca = 0;
    this.avisoT = 0;
    this.hora = 0.08; // 0 a 1: menos de 0.5 é dia
    this.fatorNoite = 0;
    this.relampago = 0;
    this.proxRelampago = 3;
    this.periodoAvisado = this.periodo;

    this.cristais = [];
    this.criarCristaisChao();
    this.selvagens = [];
    this.timerSpawn = 0;
    this.povoar();
    this.atualizarCeu(0);
    this.posicionarCamera(1);
  }

  get periodo() { return this.hora < 0.5 ? 'dia' : 'noite'; }

  // ---------- construção do cenário ----------
  criarTerreno() {
    let g = new THREE.PlaneGeometry(200, 200, 76, 76);
    g.rotateX(-Math.PI / 2);
    g = g.toNonIndexed();
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, alturaEm(p.getX(i), p.getZ(i)));
    const cores = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    const pal = {
      campo: ['#8bd65e', '#7fcb55', '#95dc68'],
      planta: ['#4ea64a', '#5cb553', '#469c43'],
      fogo: ['#c98b5b', '#b87048', '#d9a066'],
      agua: ['#9fdc7a', '#a9e086', '#93d270'],
      terra: ['#c9a46a', '#b8935a', '#d4b27a'],
      raio: ['#7a7a9a', '#6c6c8c', '#86869f'],
    };
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      const dl = Math.hypot(cx - LAGO.x, cz - LAGO.z);
      const dc = Math.hypot(cx, cz);
      let hex;
      if (dl < LAGO.r + 1) hex = '#5aa7c0';
      else if (dl < LAGO.r + 5) hex = this.rng() < 0.5 ? '#ecd9a0' : '#e2cd90';
      else if (dc > RAIO_MUNDO - 4) hex = this.rng() < 0.5 ? '#8fa27a' : '#9aae84';
      else {
        const lista = pal[zonaEm(cx, cz)];
        hex = lista[Math.floor(this.rng() * lista.length)];
      }
      c.set(hex);
      for (let k = 0; k < 3; k++) { cores[(i + k) * 3] = c.r; cores[(i + k) * 3 + 1] = c.g; cores[(i + k) * 3 + 2] = c.b; }
    }
    g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
    g.computeVertexNormals();
    this.cena.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  }

  criarAgua() {
    this.agua = new THREE.Mesh(
      new THREE.CircleGeometry(LAGO.r + 3, 28),
      new THREE.MeshLambertMaterial({ color: '#4fc3f7', transparent: true, opacity: 0.82, flatShading: true }),
    );
    this.agua.rotation.x = -Math.PI / 2;
    this.agua.position.set(LAGO.x, -0.55, LAGO.z);
    this.cena.add(this.agua);
  }

  criarEstrelas() {
    const n = 420, pos = new Float32Array(n * 3), rng = aleatorio(99);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2, el = 0.15 + rng() * 1.3, r = 150;
      pos[i * 3] = Math.cos(a) * Math.cos(el) * r;
      pos[i * 3 + 1] = Math.sin(el) * r;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(el) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.estrelas = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    this.cena.add(this.estrelas);
  }

  pontoLivre(x, z, folga) {
    if (Math.hypot(x, z) < 13) return false;
    if (Math.hypot(x - LAGO.x, z - LAGO.z) < LAGO.r + 4) return false;
    if (Math.hypot(x, z) > RAIO_MUNDO - 3) return false;
    for (const o of this.obstaculos) if (Math.hypot(x - o.x, z - o.z) < o.r + folga) return false;
    return true;
  }

  criarDecoracao() {
    const rng = this.rng;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();
    const eixoY = new THREE.Vector3(0, 1, 0);
    const cor = new THREE.Color();

    // Árvores: quantas por região
    const arvores = [];
    const quer = { planta: 70, campo: 26, agua: 16, fogo: 6, terra: 5, raio: 0 };
    const conta = { planta: 0, campo: 0, agua: 0, fogo: 0, terra: 0, raio: 0 };
    for (let tent = 0; tent < 3000; tent++) {
      const x = (rng() * 2 - 1) * RAIO_MUNDO, z = (rng() * 2 - 1) * RAIO_MUNDO;
      const zn = zonaEm(x, z);
      if (conta[zn] >= quer[zn]) continue;
      const esc = 0.8 + rng() * 0.7;
      if (!this.pontoLivre(x, z, 1.5)) continue;
      conta[zn]++;
      arvores.push({ x, z, esc, zn });
      this.obstaculos.push({ x, z, r: 0.55 * esc });
    }
    const troncos = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.26, 1.3, 5), new THREE.MeshLambertMaterial({ color: '#8a5a3a', flatShading: true }), arvores.length);
    const copas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.15, 0), new THREE.MeshLambertMaterial({ flatShading: true }), arvores.length);
    const verdes = { planta: ['#3f8f3a', '#4ea64a', '#2f7a3a'], campo: ['#5fbf4a', '#6fcf5a', '#ffb3d1'], agua: ['#58b85a', '#77c96a'], fogo: ['#a8743f', '#8a6a3a'], terra: ['#8fa04a', '#a0a85a'], raio: ['#5a5a7a'] };
    arvores.forEach((a, i) => {
      const y = alturaEm(a.x, a.z);
      q.setFromAxisAngle(eixoY, rng() * 6.28);
      m4.compose(v.set(a.x, y + 0.65 * a.esc, a.z), q, s.set(a.esc, a.esc, a.esc));
      troncos.setMatrixAt(i, m4);
      m4.compose(v.set(a.x, y + 1.9 * a.esc, a.z), q, s.set(a.esc, a.esc * 1.15, a.esc));
      copas.setMatrixAt(i, m4);
      const lista = verdes[a.zn];
      copas.setColorAt(i, cor.set(lista[Math.floor(rng() * lista.length)]));
    });
    this.cena.add(troncos, copas);

    // Pedras (e pedras de lava no vulcão, cristais elétricos no planalto)
    const pedras = [], lavas = [], eletricos = [];
    const temPedra = { fogo: 1, terra: 1, raio: 1 };
    for (let tent = 0; tent < 3000 && pedras.length + lavas.length < 130; tent++) {
      const x = (rng() * 2 - 1) * RAIO_MUNDO, z = (rng() * 2 - 1) * RAIO_MUNDO;
      if (!this.pontoLivre(x, z, 1.2)) continue;
      const zn = zonaEm(x, z);
      if (!temPedra[zn] && rng() < 0.65) continue;
      const esc = (zn === 'terra' ? 0.8 : 0.5) + rng() * (zn === 'terra' ? 1.4 : 0.9);
      (zn === 'fogo' && rng() < 0.35 ? lavas : pedras).push({ x, z, esc, zn });
      this.obstaculos.push({ x, z, r: 0.7 * esc });
    }
    for (let tent = 0; tent < 800 && eletricos.length < 26; tent++) {
      const a = rng() * Math.PI * 2, r = rng() * (PLANALTO.r - 3);
      const x = PLANALTO.x + Math.cos(a) * r, z = PLANALTO.z + Math.sin(a) * r;
      if (!this.pontoLivre(x, z, 1)) continue;
      const esc = 0.6 + rng() * 0.8;
      eletricos.push({ x, z, esc });
      this.obstaculos.push({ x, z, r: 0.4 * esc });
    }
    const geoPedra = new THREE.DodecahedronGeometry(0.8, 0);
    const coresPedra = { fogo: ['#6b4a3f', '#7d5545'], terra: ['#9c8a72', '#b5a083', '#8a7a64'], raio: ['#55557a', '#64648a'], campo: ['#a8a8b4', '#b9b5aa'], planta: ['#a8a8b4', '#9aa39a'], agua: ['#b9b5aa', '#c7c2b5'] };
    const mPedras = new THREE.InstancedMesh(geoPedra, new THREE.MeshLambertMaterial({ flatShading: true }), pedras.length);
    pedras.forEach((p, i) => {
      q.setFromEuler(new THREE.Euler(rng(), rng() * 6, rng()));
      m4.compose(v.set(p.x, alturaEm(p.x, p.z) + 0.2 * p.esc, p.z), q, s.set(p.esc, p.esc * 0.75, p.esc));
      mPedras.setMatrixAt(i, m4);
      const lista = coresPedra[p.zn];
      mPedras.setColorAt(i, cor.set(lista[Math.floor(rng() * lista.length)]));
    });
    const mLavas = new THREE.InstancedMesh(geoPedra, new THREE.MeshLambertMaterial({ color: '#5a3328', emissive: '#ff5a1f', emissiveIntensity: 0.35, flatShading: true }), lavas.length);
    lavas.forEach((p, i) => {
      q.setFromEuler(new THREE.Euler(rng(), rng() * 6, rng()));
      m4.compose(v.set(p.x, alturaEm(p.x, p.z) + 0.2 * p.esc, p.z), q, s.set(p.esc, p.esc * 0.75, p.esc));
      mLavas.setMatrixAt(i, m4);
    });
    const mEletricos = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.5, 0), new THREE.MeshLambertMaterial({ color: '#fff07a', emissive: '#f7c81a', emissiveIntensity: 0.7, flatShading: true }), eletricos.length);
    eletricos.forEach((p, i) => {
      q.setFromEuler(new THREE.Euler((rng() - 0.5) * 0.6, rng() * 6, (rng() - 0.5) * 0.6));
      m4.compose(v.set(p.x, alturaEm(p.x, p.z) + 0.6 * p.esc, p.z), q, s.set(p.esc * 0.7, p.esc * 2.2, p.esc * 0.7));
      mEletricos.setMatrixAt(i, m4);
    });
    this.cena.add(mPedras, mLavas, mEletricos);

    // Flores (sem colisão)
    const flores = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.14, 0), new THREE.MeshLambertMaterial({ flatShading: true }), 220);
    const coresFlor = ['#ff7eb6', '#ffd23f', '#ffffff', '#b58cff'];
    let n = 0;
    for (let tent = 0; tent < 3000 && n < 220; tent++) {
      const x = (rng() * 2 - 1) * RAIO_MUNDO, z = (rng() * 2 - 1) * RAIO_MUNDO;
      const zn = zonaEm(x, z);
      if (zn === 'fogo' || zn === 'raio' || zn === 'terra' || Math.hypot(x - LAGO.x, z - LAGO.z) < LAGO.r + 4 || Math.hypot(x, z) > RAIO_MUNDO - 4 || Math.hypot(x, z) < 3) continue;
      m4.compose(v.set(x, alturaEm(x, z) + 0.12, z), q.identity(), s.set(1, 1, 1));
      flores.setMatrixAt(n, m4);
      flores.setColorAt(n, cor.set(coresFlor[Math.floor(rng() * coresFlor.length)]));
      n++;
    }
    flores.count = n;
    this.cena.add(flores);

    // Montanhas na borda do mapa
    const monts = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 6), new THREE.MeshLambertMaterial({ flatShading: true }), 46);
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + rng() * 0.1;
      const r = RAIO_MUNDO + 6 + rng() * 8;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const larg = 9 + rng() * 7, alt = 10 + rng() * 12;
      q.setFromAxisAngle(eixoY, rng() * 6);
      m4.compose(v.set(x, alturaEm(x, z) + alt / 2 - 1, z), q, s.set(larg, alt, larg));
      monts.setMatrixAt(i, m4);
      const zn = zonaEm(x * 0.8, z * 0.8);
      monts.setColorAt(i, cor.set(zn === 'fogo' ? '#9a6a4a' : zn === 'raio' ? '#5a5a7a' : zn === 'terra' ? '#a8906a' : (rng() < 0.5 ? '#7fa36a' : '#8fb07a')));
    }
    this.cena.add(monts);
  }

  criarFonte() {
    const pedra = new THREE.MeshLambertMaterial({ color: '#e3dccb', flatShading: true });
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.4, 0.6, 8), pedra);
    base.position.y = 0.3;
    const espelho = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.1, 8), new THREE.MeshLambertMaterial({ color: '#7fe3ff', emissive: '#2a9ec8', emissiveIntensity: 0.4 }));
    espelho.position.y = 0.62;
    const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 1.3, 6), pedra);
    pilar.position.y = 1.2;
    this.cristalFonte = criarCristal(2.2);
    this.cristalFonte.position.y = 2.9;
    g.add(base, espelho, pilar, this.cristalFonte);
    this.cena.add(g);
    this.obstaculos.push({ x: 0, z: 0, r: 2.3 });
  }

  criarVulcao() {
    const g = new THREE.Group();
    const monte = new THREE.Mesh(new THREE.CylinderGeometry(4, 15, 16, 9), new THREE.MeshLambertMaterial({ color: '#7a4e33', flatShading: true }));
    monte.position.y = 8;
    const lava = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.4, 9), new THREE.MeshLambertMaterial({ color: '#ff6a1f', emissive: '#ff3a00', emissiveIntensity: 0.9 }));
    lava.position.y = 16;
    g.add(monte, lava);
    g.position.set(VULCAO.x, alturaEm(VULCAO.x, VULCAO.z) - 1, VULCAO.z);
    this.cena.add(g);
    this.obstaculos.push({ x: VULCAO.x, z: VULCAO.z, r: 14 });
  }

  criarCristaisChao() {
    const rng = aleatorio(777);
    let n = 0;
    for (let tent = 0; tent < 800 && n < 14; tent++) {
      const x = (rng() * 2 - 1) * (RAIO_MUNDO - 8), z = (rng() * 2 - 1) * (RAIO_MUNDO - 8);
      if (!this.pontoLivre(x, z, 1.5)) continue;
      const m = criarCristal(1);
      m.position.set(x, alturaEm(x, z) + 0.8, z);
      this.cena.add(m);
      this.cristais.push({ mesh: m, x, z, ativo: true, volta: 0 });
      n++;
    }
  }

  // ---------- dia e noite ----------
  atualizarCeu(dt) {
    this.hora = (this.hora + dt / DURACAO_DIA) % 1;
    // transição suave perto de 0 (amanhecer) e de 0.5 (anoitecer)
    const h = this.hora;
    const suave = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    let f;                                   // 0 = dia claro, 1 = noite fechada
    if (h < 0.44) f = 0;                     // dia
    else if (h < 0.5) f = suave(0.44, 0.5, h); // entardecer
    else if (h < 0.94) f = 1;                // noite
    else f = 1 - suave(0.94, 1, h);          // amanhecer
    this.fatorNoite = f;
    this.cena.background.lerpColors(CEU_DIA, CEU_NOITE, f);
    this.cena.fog.color.copy(this.cena.background);
    let brilhoExtra = 0;
    if (this.relampago > 0) { this.relampago -= dt; brilhoExtra = 2.2 * Math.max(0, this.relampago / 0.15); }
    this.hemi.color.lerpColors(HEMI_DIA, HEMI_NOITE, f);
    this.hemi.intensity = THREE.MathUtils.lerp(1.7, 0.8, f) + brilhoExtra;
    this.sol.color.lerpColors(SOL_DIA, SOL_NOITE, f);
    this.sol.intensity = THREE.MathUtils.lerp(1.9, 0.55, f);
    this.estrelas.material.opacity = f;
  }

  // ---------- monstros selvagens ----------
  mediaEquipe() {
    const eq = this.jogo.estado?.equipe;
    if (!eq?.length) return 3;
    return eq.reduce((s, m) => s + m.nivel, 0) / eq.length;
  }

  // Quanto mais longe do centro, mais forte. E acompanha o nível da sua equipe.
  nivelSelvagem(x, z, perto) {
    const media = this.mediaEquipe();
    const frac = Math.min(1, Math.hypot(x, z) / RAIO_MUNDO);
    let n = Math.round(media * (0.55 + 0.65 * frac) + Math.random() * 2 - 1);
    if (perto) n = Math.min(n, Math.max(1, Math.round(media) - 1));
    return Math.max(1, Math.min(45, n));
  }

  povoar() {
    for (const s of [...this.selvagens]) this.removerSelvagem(s);
    for (let i = 0; i < 3; i++) this.spawnarSelvagem(true);
    for (let i = 0; i < MAX_SELVAGENS - 4; i++) this.spawnarSelvagem(false);
  }

  spawnarSelvagem(perto) {
    for (let tent = 0; tent < 60; tent++) {
      let x, z;
      if (perto) {
        const a = Math.random() * Math.PI * 2, r = 16 + Math.random() * 10;
        x = this.pos.x + Math.cos(a) * r; z = this.pos.z + Math.sin(a) * r;
      } else {
        x = (Math.random() * 2 - 1) * (RAIO_MUNDO - 6); z = (Math.random() * 2 - 1) * (RAIO_MUNDO - 6);
        if (Math.hypot(x - this.pos.x, z - this.pos.z) < 22) continue;
      }
      if (!this.pontoLivre(x, z, 1)) continue;
      const zona = zonaEm(x, z);
      const lista = APARICOES[zona][this.periodo];
      const total = lista.reduce((s, [, peso]) => s + peso, 0);
      let sorteio = Math.random() * total, escolha = lista[0][0];
      for (const [e, peso] of lista) { sorteio -= peso; if (sorteio <= 0) { escolha = e; break; } }
      let nivel = this.nivelSelvagem(x, z, perto);
      let especie, periodo = null;
      if (escolha.startsWith('L:')) {
        const linha = escolha.slice(2);
        especie = formaPorNivel(linha, nivel);
        periodo = PERIODO_DA_LINHA[linha] || null;
      } else {
        especie = escolha;
        nivel = Math.max(3, nivel + 1);
      }
      const dados = criarMonstro(especie, nivel);
      const modelo = criarModelo(especie);
      modelo.position.set(x, alturaEm(x, z), z);
      this.cena.add(modelo);
      this.selvagens.push({ dados, modelo, x, z, ang: Math.random() * 6.28, estado: 'parado', t: Math.random() * 2, zona, periodo, vel: statsDe(especie, nivel).vel * 0.45 });
      return;
    }
  }

  removerSelvagem(s) {
    const i = this.selvagens.indexOf(s);
    if (i >= 0) this.selvagens.splice(i, 1);
    this.cena.remove(s.modelo);
    descartar(s.modelo);
  }

  irParaFonte() {
    this.pos.set(0, 0, 4.5);
    this.ang = 0;
    this.graca = 3;
    this.posicionarCamera(1);
  }

  colidir(p, raio) {
    for (const o of this.obstaculos) {
      const dx = p.x - o.x, dz = p.z - o.z;
      const d = Math.hypot(dx, dz), min = o.r + raio;
      if (d < min && d > 0.0001) { p.x = o.x + (dx / d) * min; p.z = o.z + (dz / d) * min; }
    }
    const dx = p.x - LAGO.x, dz = p.z - LAGO.z, dl = Math.hypot(dx, dz);
    if (dl < LAGO.r + 0.5) { p.x = LAGO.x + (dx / dl) * (LAGO.r + 0.5); p.z = LAGO.z + (dz / dl) * (LAGO.r + 0.5); }
    const dc = Math.hypot(p.x, p.z);
    if (dc > RAIO_MUNDO - 4) { p.x *= (RAIO_MUNDO - 4) / dc; p.z *= (RAIO_MUNDO - 4) / dc; }
  }

  posicionarCamera(k) {
    const retrato = this.jogo.aspecto < 1;
    const off = retrato ? new THREE.Vector3(0, 15, 14) : new THREE.Vector3(0, 9.5, 11);
    const alvo = new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z);
    this.camera.position.lerp(alvo.clone().add(off), k);
    this.camera.lookAt(alvo);
  }

  // ---------- quadro a quadro ----------
  atualizar(dt, ctrl, t, pausado = false) {
    const v = pausado ? { x: 0, z: 0 } : ctrl.vetor();
    const movendo = Math.hypot(v.x, v.z) > 0.05;
    if (movendo) {
      this.pos.x += v.x * VEL_JOGADOR * dt;
      this.pos.z += v.z * VEL_JOGADOR * dt;
      this.ang = lerpAngulo(this.ang, Math.atan2(v.x, v.z), 1 - Math.exp(-14 * dt));
    }
    this.colidir(this.pos, 0.4);
    this.pos.y = alturaEm(this.pos.x, this.pos.z);
    this.jogador.position.copy(this.pos);
    this.jogador.rotation.y = this.ang;
    animarModelo(this.jogador, t, movendo);
    this.graca = Math.max(0, this.graca - dt);
    this.avisoT = Math.max(0, this.avisoT - dt);
    this.jogador.visible = this.graca <= 0 || Math.floor(t * 10) % 2 === 0;

    this.cristalFonte.rotation.y += dt * 1.2;
    this.cristalFonte.position.y = 2.9 + Math.sin(t * 2) * 0.15;
    this.agua.position.y = -0.55 + Math.sin(t * 1.3) * 0.05;

    // Relâmpagos no Planalto da Tempestade
    const zonaAtual = zonaEm(this.pos.x, this.pos.z);
    if (zonaAtual === 'raio') {
      this.proxRelampago -= dt;
      if (this.proxRelampago <= 0) { this.relampago = 0.15; this.proxRelampago = 2.5 + Math.random() * 4; }
    }
    if (!pausado) this.atualizarCeu(dt);
    if (this.periodo !== this.periodoAvisado) {
      this.periodoAvisado = this.periodo;
      if (this.jogo.estado) this.jogo.aviso(this.periodo === 'noite' ? 'Anoiteceu. Monstros de Lua e Trevas saíram!' : 'Amanheceu. Monstros de Sol e Luz estão por aí!');
    }
    if (this.zonaAvisada !== zonaAtual) {
      this.zonaAvisada = zonaAtual;
      if (this.jogo.estado) this.jogo.mostrarZona(NOMES_ZONA[zonaAtual]);
    }

    const est = this.jogo.estado;
    // Fonte de cura
    if (est && Math.hypot(this.pos.x, this.pos.z) < 3.8 && this.jogo.precisaCura()) {
      this.jogo.curarEquipe();
      this.jogo.aviso('A fonte curou sua equipe!');
    }

    // Cristais no chão
    for (const c of this.cristais) {
      if (!c.ativo) {
        c.volta -= dt;
        if (c.volta <= 0) { c.ativo = true; c.mesh.visible = true; }
        continue;
      }
      c.mesh.rotation.y += dt * 2;
      c.mesh.position.y = alturaEm(c.x, c.z) + 0.8 + Math.sin(t * 3 + c.x) * 0.12;
      if (est && Math.hypot(this.pos.x - c.x, this.pos.z - c.z) < 1.4) {
        c.ativo = false; c.mesh.visible = false; c.volta = 60;
        est.cristais++;
        this.jogo.aviso('Você achou um cristal de captura!');
        this.jogo.atualizarHudMundo();
        this.jogo.salvar();
      }
    }

    // Selvagens
    this.timerSpawn -= dt;
    if (this.timerSpawn <= 0 && this.selvagens.length < MAX_SELVAGENS) { this.timerSpawn = 3; this.spawnarSelvagem(false); }
    let maisPerto = null, menorD = 9;
    for (const s of [...this.selvagens]) {
      const dx = this.pos.x - s.x, dz = this.pos.z - s.z, d = Math.hypot(dx, dz);
      // Monstro de dia some à noite (e vice-versa) quando está longe de você
      if (s.periodo && s.periodo !== this.periodo && d > 24) { this.removerSelvagem(s); continue; }
      s.t -= dt;
      if (s.t <= 0) {
        if (s.estado === 'parado') { s.estado = 'andando'; s.t = 1.5 + Math.random() * 2; s.ang = Math.random() * 6.28; }
        else { s.estado = 'parado'; s.t = 1 + Math.random() * 2.5; }
      }
      let andando = s.estado === 'andando';
      if (d < 7 && this.graca <= 0 && est) { s.ang = Math.atan2(dx, dz); andando = true; }
      if (andando && !pausado) {
        s.x += Math.sin(s.ang) * s.vel * dt;
        s.z += Math.cos(s.ang) * s.vel * dt;
        const p = { x: s.x, z: s.z };
        this.colidir(p, 0.6);
        if (p.x !== s.x || p.z !== s.z) s.ang += Math.PI * 0.5;
        s.x = p.x; s.z = p.z;
      }
      s.modelo.position.set(s.x, alturaEm(s.x, s.z), s.z);
      s.modelo.rotation.y = lerpAngulo(s.modelo.rotation.y, s.ang, 1 - Math.exp(-8 * dt));
      animarModelo(s.modelo, t, andando);
      if (d < menorD) { menorD = d; maisPerto = s; }
    }

    // Encontro!
    if (maisPerto && est && !pausado && this.graca <= 0 && menorD < 0.9 + ESPECIES[maisPerto.dados.especie].raio) {
      if (this.jogo.temMonstroDePe()) {
        this.jogo.iniciarBatalha(maisPerto);
        return;
      } else if (this.avisoT <= 0) {
        this.avisoT = 3;
        this.graca = 1.5;
        this.jogo.aviso('Sua equipe está desmaiada. Volte à fonte no centro!');
      }
    }

    // Plaquinha com nome do monstro mais perto
    if (maisPerto && est) {
      const esp = ESPECIES[maisPerto.dados.especie];
      this.jogo.mostrarRotulo(`<i style="background:${ELEMENTOS[esp.elemento].cor}"></i>${esp.nome} <b>Nv.${maisPerto.dados.nivel}</b>`,
        new THREE.Vector3(maisPerto.x, maisPerto.modelo.position.y + esp.altura + 0.3, maisPerto.z), this.camera);
    } else this.jogo.mostrarRotulo(null);

    this.posicionarCamera(1 - Math.exp(-6 * dt));
  }

  // Câmera girando devagar para a tela de título
  orbitar(t) {
    const a = t * 0.08;
    this.camera.position.set(Math.sin(a) * 34, 20, Math.cos(a) * 34);
    this.camera.lookAt(0, 0, 0);
    for (const s of this.selvagens) animarModelo(s.modelo, t, false);
    this.cristalFonte.rotation.y = t;
  }
}
