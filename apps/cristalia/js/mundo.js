// =============================================================
// MUNDO ABERTO
// Regiões: Campo (centro), Floresta (planta), Lago (água), Vulcão (fogo),
// Pedreira (terra) e Planalto da Tempestade (raio).
// Ciclo de dia e noite: Sol e Luz aparecem de dia; Lua e Trevas à noite.
// Monstros selvagens passeiam; encostou, começa a batalha.
// =============================================================
import * as THREE from 'three';
import { criarModelo, criarTreinador, criarCristal, pintarCristal, criarCoroa, criarCasa, animarCasa, animarModelo, criarAuraDupla, animarAura, descartar } from './modelos.js';
import { TRACADOS, S_LAGO, tracadoPerto, foraDungeons, alturaDungeons, prenderDungeons, dentroDungeonLivre, semCasaDungeons } from './dungeon.js';
import { CaminhoDasBrasas } from './brasas.js';
import { TrilhaAncestral, LAGOA, RESERVAS_FLORESTA, CRISTAL_ESCONDIDO } from './raizes.js';
import { ESPECIES, ELEMENTOS, APARICOES, PERIODO_DA_LINHA, DUPLAS, ORDEM_DUPLAS, INTERVALO_DUPLO, CRISTAIS, criarMonstro, statsDe, formaPorNivel, nomeTipo } from './dados.js';

export const RAIO_MUNDO = 88;
const LAGO = { x: -32, z: 30, r: 15 };
// Lagos do mapa: o grande (Lago) e o lago escondido da Floresta
const LAGOS = [LAGO, LAGOA];
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
const NA_ZONA = { campo: 'no Campo', agua: 'no Lago', fogo: 'no Vulcão', planta: 'na Floresta', terra: 'na Pedreira', raio: 'no Planalto da Tempestade' };
export const NOMES_ZONA = { campo: 'Campo', agua: 'Lago', fogo: 'Vulcão', planta: 'Floresta', terra: 'Pedreira', raio: 'Planalto da Tempestade' };
const VEL_JOGADOR = 7.5;
const MAX_SELVAGENS = 18;
const RAIO_CASA = 2.6;        // tamanho da casa para colisão
const CURA_CASA = 4.6;        // encostou nessa distância, a equipe é curada
const AREA_SEGURA_CASA = 10;  // monstros não chegam perto da casa
const TAMANHO_GRUPO = 6;      // 5 comuns + 1 líder

// Quantos grupos andam pelo mapa: aumenta com o nível médio da sua equipe (máximo 5)
export function gruposDesejados(media) {
  return Math.min(5, 1 + Math.floor((media - 1) / 5));
}
// Níveis do grupo. Começo do jogo (equipe ~Nv.3): comuns ~Nv.5, líder ~Nv.12
export function niveisDoGrupo(media) {
  const comum = Math.round(media * 1.1 + 2);
  const lider = Math.round(media * 1.4 + 8);
  return { comum: Math.min(48, comum), lider: Math.min(50, lider) };
}
// Cristais do chão: a cor mostra o tipo (sorteado de novo cada vez que reaparece)
function sortearTipoCristal() {
  const r = Math.random();
  return r < 0.05 ? 2 : r < 0.22 ? 1 : 0;
}
function sortearLista(lista) {
  const total = lista.reduce((t, [, w]) => t + w, 0);
  let r = Math.random() * total;
  for (const [e, w] of lista) { r -= w; if (r <= 0) return e; }
  return lista[0][0];
}
export const DURACAO_DIA = 240; // segundos para um ciclo completo (metade dia, metade noite)

const CEU_DIA = new THREE.Color('#9fd8ff'), CEU_NOITE = new THREE.Color('#1b2550');
const HEMI_DIA = new THREE.Color('#d6f0ff'), HEMI_NOITE = new THREE.Color('#8f9fe0');
const SOL_DIA = new THREE.Color('#fff1d6'), SOL_NOITE = new THREE.Color('#a8b8ff');

export function zonaEm(x, z) {
  const t = tracadoPerto(x, z); // dentro (ou na boca) de uma dungeon aberta
  if (t) return t.zona;
  for (const zn of ZONAS) if (Math.hypot(x - zn.x, z - zn.z) < zn.r) return zn.id;
  return 'campo';
}

export function alturaEm(x, z) {
  let h = Math.sin(x * 0.07) * Math.cos(z * 0.06) * 1.4 + Math.sin(x * 0.19 + z * 0.11) * 0.45;
  const dc = Math.hypot(x, z);
  if (dc < 12) h *= dc / 12; // centro plano para a fonte
  for (const L of LAGOS) {
    const dl = Math.hypot(x - L.x, z - L.z);
    if (dl < L.r + 6) {
      const k = Math.min(1, (L.r + 6 - dl) / 6);
      h = h * (1 - k) - 1.8 * k;
    }
  }
  const dv = Math.hypot(x - 42, z + 34);
  if (dv < 30) h += (1 - dv / 30) * 3;
  const dp = Math.hypot(x - PEDREIRA.x, z - PEDREIRA.z);
  if (dp < PEDREIRA.r) h += (Math.sin(x * 0.3) * Math.cos(z * 0.27) + 1) * 1.1 * (1 - dp / PEDREIRA.r);
  const dt = Math.hypot(x - PLANALTO.x, z - PLANALTO.z);
  if (dt < PLANALTO.r) h += Math.min(1, (PLANALTO.r - dt) / 6) * 2.4; // mesa elevada
  // Dungeons abertas (Caminho das Brasas a nordeste, Trilha Ancestral a noroeste)
  h = alturaDungeons(x, z, h);
  // bordas: o chão sobe (no mapa redondo e nas paredes das dungeons)
  const fora = Math.min(dc - (RAIO_MUNDO - 6), foraDungeons(x, z));
  if (fora > 0) h += Math.min(18, fora * 0.9);
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
    this.criarDecoracao();
    this.dungeon = new CaminhoDasBrasas(this, alturaEm);
    this.floresta = new TrilhaAncestral(this, alturaEm);
    this.dungeons = [this.dungeon, this.floresta];
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

    // Casa portátil: começa guardada (na mochila)
    this.casa = criarCasa();
    this.casa.visible = false;
    this.cena.add(this.casa);
    this.casaPos = null;
    this.casaObst = null;
    this.casaAnim = 1;
    this.curaCasaAvisada = 0;

    this.cristais = [];
    this.criarCristaisChao();
    this.selvagens = [];
    this.grupos = [];
    this.timerSpawn = 0;
    this.timerGrupo = 0;
    this.contaSpawn = 0; // a cada 10 monstros que aparecem, 1 é de tipo duplo
    this.povoar();
    this.atualizarCeu(0);
    this.posicionarCamera(1);
  }

  get periodo() { return this.hora < 0.5 ? 'dia' : 'noite'; }
  zona(x, z) { return zonaEm(x, z); }

  // ---------- construção do cenário ----------
  criarTerreno() {
    // o chão cobre o mapa redondo e as duas dungeons (nordeste e noroeste)
    let g = new THREE.PlaneGeometry(380, 315, 136, 113);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -32);
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
      const dc = Math.hypot(cx, cz);
      let hex;
      const lago = LAGOS.find((L) => Math.hypot(cx - L.x, cz - L.z) < L.r + 5);
      const dl = lago ? Math.hypot(cx - lago.x, cz - lago.z) : Infinity;
      const tr = TRACADOS.find((t) => t.local(cx, cz).s > t.sMin + 8 && t.fora(cx, cz) < 8);
      const sorte = (lista) => lista[Math.floor(this.rng() * lista.length)];
      if (tr?.id === 'brasas') {
        // chão de basalto da dungeon, com rachaduras de lava; paredes escuras
        const fd = tr.fora(cx, cz);
        hex = fd > 2 ? (this.rng() < 0.5 ? '#3a2a26' : '#2e2220') : (this.rng() < 0.08 ? '#c8461a' : sorte(['#5a3a30', '#6b4535', '#4d3229']));
      } else if (tr) {
        // chão de floresta fechada (musgo e terra); paredes verde-escuras; fundo do lago
        const fd = tr.fora(cx, cz), lp = tr.local(cx, cz);
        if (fd > 2) hex = sorte(['#1f4a2a', '#26522e', '#1a4024']);
        else if (Math.abs(lp.s - S_LAGO) < 4.2 && Math.abs(lp.lat) > 2.6) hex = '#2a6a6a';
        else hex = this.rng() < 0.1 ? '#6a5236' : sorte(['#3f7a3a', '#4a8a40', '#36703a', '#2f6a34']);
      } else if (dl < lago?.r + 1) hex = lago === LAGO ? '#5aa7c0' : '#3a8a8a';
      else if (lago) hex = lago === LAGO ? (this.rng() < 0.5 ? '#ecd9a0' : '#e2cd90') : sorte(['#5a8a3a', '#6a9a4a']);
      else if (dc > RAIO_MUNDO - 4) {
        const zb = zonaEm(cx * 0.85, cz * 0.85);
        hex = zb === 'fogo' ? (this.rng() < 0.5 ? '#7a5a44' : '#6a4a3a') : zb === 'planta' ? sorte(['#3f6a3a', '#4a7a44']) : (this.rng() < 0.5 ? '#8fa27a' : '#9aae84');
      }
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
    this.aguas = LAGOS.map((L) => {
      const a = new THREE.Mesh(
        new THREE.CircleGeometry(L.r + 3, 28),
        new THREE.MeshLambertMaterial({ color: L === LAGO ? '#4fc3f7' : '#3ab8b0', transparent: true, opacity: 0.82, flatShading: true, emissive: L === LAGO ? '#000000' : '#0a4a4a', emissiveIntensity: 0.4 }),
      );
      a.rotation.x = -Math.PI / 2;
      a.position.set(L.x, -0.55, L.z);
      this.cena.add(a);
      return a;
    });
    this.agua = this.aguas[0];
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
    if (TRACADOS.some((t) => t.reservado(x, z))) return false; // as dungeons se decoram sozinhas
    if (this.casaPos && Math.hypot(x - this.casaPos.x, z - this.casaPos.z) < AREA_SEGURA_CASA + 4) return false;
    for (const L of LAGOS) if (Math.hypot(x - L.x, z - L.z) < L.r + 4) return false;
    // lugares fixos da Floresta (árvores gigantes, ruína, clareiras, lago escondido)
    for (const r of RESERVAS_FLORESTA) if (Math.hypot(x - r.x, z - r.z) < r.r + folga) return false;
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
    const quer = { planta: 58, campo: 26, agua: 16, fogo: 6, terra: 5, raio: 0 };
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
      if (zn === 'fogo' || zn === 'raio' || zn === 'terra' || LAGOS.some((L) => Math.hypot(x - L.x, z - L.z) < L.r + 4) || Math.hypot(x, z) > RAIO_MUNDO - 4 || Math.hypot(x, z) < 3) continue;
      m4.compose(v.set(x, alturaEm(x, z) + 0.12, z), q.identity(), s.set(1, 1, 1));
      flores.setMatrixAt(n, m4);
      flores.setColorAt(n, cor.set(coresFlor[Math.floor(rng() * coresFlor.length)]));
      n++;
    }
    flores.count = n;
    this.cena.add(flores);

    // Montanhas na borda do mapa
    const extras = [];
    for (const t of TRACADOS) for (let sd = 90; sd < 215; sd += 8) for (const lado of [-1, 1]) extras.push([t, sd, lado]);
    const monts = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 6), new THREE.MeshLambertMaterial({ flatShading: true }), 46 + extras.length);
    let nm = 0;
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + rng() * 0.1;
      // boca das dungeons: sem montanha
      if (TRACADOS.some((t) => Math.abs(Math.atan2(Math.sin(a - t.angulo), Math.cos(a - t.angulo))) < 0.3)) continue;
      const r = RAIO_MUNDO + 6 + rng() * 8;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const larg = 9 + rng() * 7, alt = 10 + rng() * 12;
      q.setFromAxisAngle(eixoY, rng() * 6);
      m4.compose(v.set(x, alturaEm(x, z) + alt / 2 - 1, z), q, s.set(larg, alt, larg));
      monts.setMatrixAt(nm, m4);
      const zn = zonaEm(x * 0.8, z * 0.8);
      monts.setColorAt(nm++, cor.set(zn === 'fogo' ? '#9a6a4a' : zn === 'raio' ? '#5a5a7a' : zn === 'terra' ? '#a8906a' : zn === 'planta' ? (rng() < 0.5 ? '#3f6a3a' : '#4a7a44') : (rng() < 0.5 ? '#7fa36a' : '#8fb07a')));
    }
    // montanhas dos dois lados de cada dungeon (vulcânicas nas Brasas, morros de floresta na Trilha)
    for (const [t, sd, lado] of extras) {
      const { x, z } = t.ponto(sd, lado * (24 + rng() * 6) * (sd > 165 ? 1.25 : 1));
      const larg = 9 + rng() * 6, alt = 14 + rng() * 14;
      q.setFromAxisAngle(eixoY, rng() * 6);
      m4.compose(v.set(x, alturaEm(x, z) + alt / 2 - 2, z), q, s.set(larg, alt, larg));
      monts.setMatrixAt(nm, m4);
      monts.setColorAt(nm++, cor.set(t.id === 'brasas' ? (rng() < 0.5 ? '#3a2824' : '#4a322a') : (rng() < 0.5 ? '#1f4426' : '#2a5230')));
    }
    monts.count = nm;
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

  criarCristaisChao() {
    const rng = aleatorio(777);
    let n = 0;
    { // o cristal escondido no píer do lago da Floresta (começa como Cristal Forte)
      const { x, z } = CRISTAL_ESCONDIDO, m = criarCristal(1, 1);
      m.position.set(x, alturaEm(x, z) + 0.8, z);
      this.cena.add(m);
      this.cristais.push({ mesh: m, x, z, ativo: true, volta: 0, tipo: 1 });
    }
    for (let tent = 0; tent < 800 && n < 14; tent++) {
      const x = (rng() * 2 - 1) * (RAIO_MUNDO - 8), z = (rng() * 2 - 1) * (RAIO_MUNDO - 8);
      if (!this.pontoLivre(x, z, 1.5)) continue;
      const tipo = sortearTipoCristal();
      const m = criarCristal(1, tipo);
      m.position.set(x, alturaEm(x, z) + 0.8, z);
      this.cena.add(m);
      this.cristais.push({ mesh: m, x, z, ativo: true, volta: 0, tipo });
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
    this.cena.fog.near = 40; // as dungeons fecham a névoa por cima disso
    this.cena.fog.far = 115;
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
    this.povoando = true;
    for (const s of [...this.selvagens]) this.removerSelvagem(s);
    for (const g of [...this.grupos]) this.removerGrupo(g);
    for (let i = 0; i < 3; i++) this.spawnarSelvagem(true);
    for (let i = 0; i < MAX_SELVAGENS - 4; i++) this.spawnarSelvagem(false);
    for (let i = 0; i < gruposDesejados(this.mediaEquipe()); i++) this.spawnarGrupo();
    for (const d of this.dungeons || []) for (const a of d.acampamentos) a.grupo = null;
    this.povoando = false;
  }

  // Sorteia quem aparece numa região (devolve a linha 'L:xx' ou uma espécie rara)
  sortearAparicao(zona) {
    const lista = APARICOES[zona][this.periodo];
    const total = lista.reduce((s, [, peso]) => s + peso, 0);
    let sorteio = Math.random() * total;
    for (const [e, peso] of lista) { sorteio -= peso; if (sorteio <= 0) return e; }
    return lista[0][0];
  }

  especieDe(escolha, nivel) {
    if (escolha.startsWith('L:')) return { especie: formaPorNivel(escolha.slice(2), nivel), nivel };
    return { especie: escolha, nivel: Math.max(3, nivel + 1) };
  }

  // ---------- grupos de monstros ----------
  // opcoes (usado pela dungeon): { x, z, zona, niveis, lista, acampamento }
  spawnarGrupo(opcoes = null) {
    for (let tent = 0; tent < 80; tent++) {
      let x, z;
      if (opcoes) { x = opcoes.x; z = opcoes.z; } else {
        x = (Math.random() * 2 - 1) * (RAIO_MUNDO - 12); z = (Math.random() * 2 - 1) * (RAIO_MUNDO - 12);
        if (Math.hypot(x, z) < 22 || Math.hypot(x - this.pos.x, z - this.pos.z) < 30) continue;
        if (!this.pontoLivre(x, z, 3)) continue;
      }
      const zona = opcoes?.zona || zonaEm(x, z);
      const nv = opcoes?.niveis || niveisDoGrupo(this.mediaEquipe());
      // Grupos de dungeon: 2 fracos, 2 médios, 1 forte e o líder (a ordem em que entram na luta)
      const FORCA = [null, ['fraco', 1, -2], ['fraco', 1, -2], ['medio', 2, 1], ['medio', 2, 1], ['forte', 3, 0]];
      const membros = [];
      for (let i = 0; i < TAMANHO_GRUPO; i++) {
        const lider = i === 0;
        let escolha = opcoes?.lista ? sortearLista(opcoes.lista) : this.sortearAparicao(zona);
        // o líder é sempre de uma linha evolutiva (assim ele aparece evoluído)
        const forca = opcoes?.escalonado && !lider ? FORCA[i] : null;
        if ((lider || forca?.[0] === 'forte') && !escolha.startsWith('L:')) escolha = 'L:' + ESPECIES[escolha].elemento;
        let nivel = lider ? nv.lider : Math.max(1, nv.comum + Math.round(Math.random() * 2 - 1));
        if (forca) nivel = forca[0] === 'forte' ? Math.round(nv.comum + (nv.lider - nv.comum) * 0.6) : Math.max(1, nv.comum + forca[2]);
        const { especie, nivel: nivelFinal } = this.especieDe(escolha, nivel);
        const dados = criarMonstro(especie, nivelFinal);
        if (lider) dados.lider = true;
        if (opcoes?.escalonado) { dados.onda = lider ? 4 : forca[1]; dados.forca = lider ? 'lider' : forca[0]; }
        const modelo = criarModelo(especie);
        if (lider) {
          modelo.scale.setScalar(1.3);
          const coroa = criarCoroa(1.2);
          coroa.position.y = ESPECIES[especie].altura + 0.15;
          modelo.add(coroa);
        }
        // formação: líder no meio, os outros em roda
        const a = ((i - 1) / (TAMANHO_GRUPO - 1)) * Math.PI * 2;
        const ox = lider ? 0 : Math.cos(a) * 2.6, oz = lider ? 0 : Math.sin(a) * 2.6;
        this.cena.add(modelo);
        membros.push({ dados, modelo, ox, oz });
      }
      this.contaSpawn += TAMANHO_GRUPO;
      const velMin = Math.min(...membros.map((m) => statsDe(m.dados.especie, m.dados.nivel).vel));
      const g = { grupo: true, membros, x, z, ang: Math.random() * 6.28, estado: 'parado', t: 2, zona, vel: velMin * 0.35, acampamento: opcoes?.acampamento || null };
      this.grupos.push(g);
      return g;
    }
    return null;
  }

  removerGrupo(g) {
    const i = this.grupos.indexOf(g);
    if (i >= 0) this.grupos.splice(i, 1);
    for (const m of g.membros) { this.cena.remove(m.modelo); descartar(m.modelo); }
  }

  // Depois de uma batalha: tira do grupo quem foi derrotado ou capturado
  tirarDoGrupo(g, uids) {
    for (const m of g.membros.filter((mm) => uids.includes(mm.dados.uid))) { this.cena.remove(m.modelo); descartar(m.modelo); }
    g.membros = g.membros.filter((m) => !uids.includes(m.dados.uid));
    if (!g.membros.length) this.removerGrupo(g);
  }

  // ---------- casa ----------
  podeMontarCasa(x, z) {
    if (LAGOS.some((L) => Math.hypot(x - L.x, z - L.z) < L.r + 5)) return false;
    if (Math.hypot(x, z) > RAIO_MUNDO - 8) return false;
    if (semCasaDungeons(x, z)) return false; // dentro ou na boca das dungeons não
    if (Math.hypot(x, z) < 6) return false; // em cima da fonte não
    for (const o of this.obstaculos) {
      if (o === this.casaObst) continue;
      if (Math.hypot(x - o.x, z - o.z) < o.r + RAIO_CASA + 0.8) return false;
    }
    return true;
  }

  montarCasa(x, z, rot, animar = true) {
    if (this.casaObst) this.obstaculos.splice(this.obstaculos.indexOf(this.casaObst), 1);
    this.casaPos = { x, z, rot };
    this.casaObst = { x, z, r: RAIO_CASA };
    this.obstaculos.push(this.casaObst);
    this.casa.position.set(x, alturaEm(x, z), z);
    this.casa.rotation.y = rot;
    this.casa.visible = true;
    this.casaAnim = animar ? 0 : 1;
    // monstros que estavam em cima do lugar vão embora
    for (const s of [...this.selvagens]) if (Math.hypot(s.x - x, s.z - z) < AREA_SEGURA_CASA) this.removerSelvagem(s);
    for (const g of [...this.grupos]) if (Math.hypot(g.x - x, g.z - z) < AREA_SEGURA_CASA + 3) this.removerGrupo(g);
  }

  guardarCasa() {
    if (this.casaObst) this.obstaculos.splice(this.obstaculos.indexOf(this.casaObst), 1);
    this.casaObst = null;
    this.casaPos = null;
    this.casa.visible = false;
  }

  // Lugar na frente do jogador onde a casa seria montada
  lugarNaFrente() {
    const d = RAIO_CASA + 2.2;
    return { x: this.pos.x + Math.sin(this.ang) * d, z: this.pos.z + Math.cos(this.ang) * d, rot: this.ang + Math.PI };
  }

  // Procura um lugar livre: primeiro na frente do jogador, depois em volta dele
  acharLugarCasa() {
    const frente = this.lugarNaFrente();
    if (this.podeMontarCasa(frente.x, frente.z)) return frente;
    for (const d of [RAIO_CASA + 2.2, RAIO_CASA + 4, RAIO_CASA + 6]) {
      for (let i = 1; i <= 16; i++) {
        // alterna esquerda/direita a partir da frente
        const a = this.ang + Math.ceil(i / 2) * (i % 2 ? 1 : -1) * (Math.PI / 8);
        const x = this.pos.x + Math.sin(a) * d, z = this.pos.z + Math.cos(a) * d;
        if (this.podeMontarCasa(x, z)) return { x, z, rot: Math.atan2(this.pos.x - x, this.pos.z - z) };
      }
    }
    return null;
  }

  distanciaCasa() {
    return this.casaPos ? Math.hypot(this.pos.x - this.casaPos.x, this.pos.z - this.casaPos.z) : Infinity;
  }

  // Ao perder a batalha: acorda na casa (se ela estiver montada) ou na fonte
  irParaBase() {
    if (!this.casaPos) { this.irParaFonte(); return; }
    const { x, z, rot } = this.casaPos;
    this.pos.set(x + Math.sin(rot) * (RAIO_CASA + 1.6), 0, z + Math.cos(rot) * (RAIO_CASA + 1.6));
    this.ang = rot;
    this.graca = 3;
    this.posicionarCamera(1);
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
      // o 10º monstro (sem ser o que aparece colado em você) é de tipo duplo
      if (!perto && this.contaSpawn + 1 >= INTERVALO_DUPLO) {
        this.contaSpawn = 0;
        this.spawnarDuplo(x, z, zona);
        return;
      }
      this.contaSpawn++;
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

  // Monstro de tipo duplo: escolhe uma linha que combine com a região; é um pouco mais forte
  spawnarDuplo(x, z, zona) {
    const opcoes = ORDEM_DUPLAS.filter((k) => DUPLAS[k].zonas.includes(zona));
    const k = opcoes[Math.floor(Math.random() * opcoes.length)] || ORDEM_DUPLAS[0];
    const nivel = Math.min(48, this.nivelSelvagem(x, z, false) + 2);
    const especie = formaPorNivel(k, nivel);
    const esp = ESPECIES[especie];
    const dados = criarMonstro(especie, nivel);
    const modelo = criarModelo(especie);
    const aura = criarAuraDupla(esp.elementos.map((el) => ELEMENTOS[el].cor), esp.raio * 1.5);
    modelo.add(aura);
    modelo.position.set(x, alturaEm(x, z), z);
    this.cena.add(modelo);
    this.selvagens.push({ dados, modelo, aura, dupla: true, x, z, ang: Math.random() * 6.28, estado: 'parado', t: Math.random() * 2, zona, periodo: null, vel: statsDe(especie, nivel).vel * 0.45 });
    if (!this.povoando && this.jogo.estado) this.jogo.aviso(`Um monstro de tipo duplo apareceu: ${esp.nome} (${nomeTipo(esp)}) ${NA_ZONA[zona]}!`);
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
    for (const t of TRACADOS) t.empurrar?.(p, raio); // água do Lago Escondido
    for (const L of LAGOS) {
      const dx = p.x - L.x, dz = p.z - L.z, dl = Math.hypot(dx, dz);
      if (dl < L.r + 0.5) { p.x = L.x + (dx / dl) * (L.r + 0.5); p.z = L.z + (dz / dl) * (L.r + 0.5); }
    }
    // limites: o mapa redondo ou o corredor de uma dungeon (vale o mais perto)
    const dc = Math.hypot(p.x, p.z);
    if (dc > RAIO_MUNDO - 4 && !dentroDungeonLivre(p.x, p.z, raio)) {
      const mx = p.x * (RAIO_MUNDO - 4) / dc, mz = p.z * (RAIO_MUNDO - 4) / dc;
      const d = prenderDungeons(p, raio);
      if (Math.hypot(d.x - p.x, d.z - p.z) < Math.hypot(mx - p.x, mz - p.z)) { p.x = d.x; p.z = d.z; } else { p.x = mx; p.z = mz; }
    }
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
    for (const a of this.aguas) a.position.y = -0.55 + Math.sin(t * 1.3) * 0.05;

    // Relâmpagos no Planalto da Tempestade
    const zonaAtual = zonaEm(this.pos.x, this.pos.z);
    if (zonaAtual === 'raio') {
      this.proxRelampago -= dt;
      if (this.proxRelampago <= 0) { this.relampago = 0.15; this.proxRelampago = 2.5 + Math.random() * 4; }
    }
    this.atualizarCeu(pausado ? 0 : dt);
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

    // Casa: animação de montar, fumaça, cura e área segura
    const naAreaSegura = this.distanciaCasa() < AREA_SEGURA_CASA;
    if (this.casaPos) {
      if (this.casaAnim < 1) {
        this.casaAnim = Math.min(1, this.casaAnim + dt * 2.2);
        const k = this.casaAnim, pulo = Math.sin(k * Math.PI) * 0.15;
        this.casa.scale.set(k + pulo, k * (1 + pulo), k + pulo);
      } else this.casa.scale.setScalar(1);
      animarCasa(this.casa, t, this.fatorNoite);
      if (est && this.distanciaCasa() < CURA_CASA && this.jogo.precisaCura()) {
        this.jogo.curarEquipe();
        this.jogo.aviso('Sua casa curou toda a equipe!');
      }
    }

    // Cristais no chão
    for (const c of this.cristais) {
      if (!c.ativo) {
        c.volta -= dt;
        if (c.volta <= 0) { c.ativo = true; c.mesh.visible = true; c.tipo = sortearTipoCristal(); pintarCristal(c.mesh, c.tipo); }
        continue;
      }
      c.mesh.rotation.y += dt * 2;
      c.mesh.position.y = alturaEm(c.x, c.z) + 0.8 + Math.sin(t * 3 + c.x) * 0.12;
      if (est && Math.hypot(this.pos.x - c.x, this.pos.z - c.z) < 1.4) {
        c.ativo = false; c.mesh.visible = false; c.volta = 60;
        est.pedras[CRISTAIS[c.tipo].id]++;
        this.jogo.aviso(c.tipo === 0 ? 'Você achou um cristal de captura!' : `Você achou um ${CRISTAIS[c.tipo].nome}!`);
        this.jogo.atualizarHudMundo();
        this.jogo.salvar();
      }
    }

    // Selvagens
    this.timerSpawn -= dt;
    if (this.timerSpawn <= 0 && this.selvagens.filter((x) => !x.dungeon && !x.chefe && !x.regiao).length < MAX_SELVAGENS) { this.timerSpawn = 3; this.spawnarSelvagem(false); }
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
      let andando = s.estado === 'andando' && !s.fixo;
      if (d < 7 && this.graca <= 0 && est && !naAreaSegura && !s.fixo) { s.ang = Math.atan2(dx, dz); andando = true; }
      andando = (!s.fixo && this.fugirDaCasa(s)) || andando;
      if (andando && !pausado) this.andar(s, s.vel * dt, 0.6);
      s.modelo.position.set(s.x, alturaEm(s.x, s.z), s.z);
      s.modelo.rotation.y = lerpAngulo(s.modelo.rotation.y, s.ang, 1 - Math.exp(-8 * dt));
      animarModelo(s.modelo, t, andando);
      if (s.aura) animarAura(s.aura, t);
      if (d < menorD) { menorD = d; maisPerto = s; }
    }

    // Dungeons abertas: acampamentos, monstros soltos, chefe e clima
    for (const d of this.dungeons) d.atualizar(dt, t);

    // Grupos: andam juntos em formação; aparecem mais conforme sua equipe fica forte
    this.timerGrupo -= dt;
    if (this.timerGrupo <= 0) {
      this.timerGrupo = 20;
      if (est && this.grupos.filter((g) => !g.acampamento).length < gruposDesejados(this.mediaEquipe())) this.spawnarGrupo();
    }
    for (const g of this.grupos) {
      g.t -= dt;
      if (g.t <= 0) {
        if (g.estado === 'parado') { g.estado = 'andando'; g.t = 2 + Math.random() * 3; g.ang = Math.random() * 6.28; }
        else { g.estado = 'parado'; g.t = 2 + Math.random() * 3; }
      }
      const dg = Math.hypot(this.pos.x - g.x, this.pos.z - g.z);
      let andando = g.estado === 'andando';
      const ac = g.acampamento;
      const longeDeCasa = ac ? Math.hypot(g.x - ac.x, g.z - ac.z) : 0;
      // grupos de acampamento perseguem só de perto e não se afastam muito da fogueira
      if (dg < (ac ? 9 : 12) && this.graca <= 0 && est && !naAreaSegura && longeDeCasa < 10) { g.ang = Math.atan2(this.pos.x - g.x, this.pos.z - g.z); andando = true; }
      else if (ac && longeDeCasa > 4) g.ang = Math.atan2(ac.x - g.x, ac.z - g.z);
      andando = this.fugirDaCasa(g) || andando;
      if (andando && !pausado) this.andar(g, g.vel * dt, 3);
      const cs = Math.cos(g.ang), sn = Math.sin(g.ang);
      for (const m of g.membros) {
        const x = g.x + m.ox * cs + m.oz * sn, z = g.z - m.ox * sn + m.oz * cs;
        m.x = x; m.z = z;
        m.modelo.position.set(x, alturaEm(x, z), z);
        m.modelo.rotation.y = lerpAngulo(m.modelo.rotation.y, g.ang, 1 - Math.exp(-6 * dt));
        animarModelo(m.modelo, t, andando);
        const d = Math.hypot(this.pos.x - x, this.pos.z - z) - ESPECIES[m.dados.especie].raio * (m.dados.lider ? 1.3 : 1);
        if (d < menorD) { menorD = d; maisPerto = { grupoDe: g, membro: m }; }
      }
    }

    // Encontro!
    const raioEncontro = maisPerto?.grupoDe ? 0.9 : 0.9 + (maisPerto ? ESPECIES[maisPerto.dados.especie].raio : 0);
    if (maisPerto && est && !pausado && this.graca <= 0 && !naAreaSegura && menorD < raioEncontro) {
      if (maisPerto.grupoDe) maisPerto = maisPerto.grupoDe;
      if (this.jogo.temMonstroDePe()) {
        this.jogo.iniciarBatalha(maisPerto);
        return;
      } else if (this.avisoT <= 0) {
        this.avisoT = 3;
        this.graca = 1.5;
        this.jogo.aviso(this.casaPos ? 'Sua equipe está desmaiada. Volte para casa ou para a fonte!' : 'Sua equipe está desmaiada. Monte sua casa ou volte à fonte!');
      }
    }

    // Plaquinha com nome do monstro mais perto (ou do grupo)
    if (maisPerto?.grupoDe && est) {
      const g = maisPerto.grupoDe;
      const lider = g.membros.find((m) => m.dados.lider) || g.membros[0];
      const esp = ESPECIES[lider.dados.especie];
      this.jogo.mostrarRotulo(`<i style="background:#ffd23f"></i>Grupo de ${g.membros.length} · ${lider.dados.lider ? 'Líder ' : ''}${esp.nome} <b>Nv.${lider.dados.nivel}</b>`,
        new THREE.Vector3(lider.x, lider.modelo.position.y + esp.altura * 1.3 + 0.8, lider.z), this.camera);
    } else if (maisPerto && est) {
      const esp = ESPECIES[maisPerto.dados.especie];
      const bolinhas = esp.elementos.map((el) => `<i style="background:${ELEMENTOS[el].cor}"></i>`).join('');
      const marca = esp.chefe ? '<span class="duplo">Chefe · </span>' : esp.dupla ? '<span class="duplo">Tipo duplo · </span>' : '';
      this.jogo.mostrarRotulo(`${bolinhas}${marca}${esp.nome} <b>Nv.${maisPerto.dados.nivel}</b>`,
        new THREE.Vector3(maisPerto.x, maisPerto.modelo.position.y + esp.altura + 0.3, maisPerto.z), this.camera);
    } else this.jogo.mostrarRotulo(null);

    this.posicionarCamera(1 - Math.exp(-6 * dt));
  }

  // Move um monstro (ou grupo) para frente; se bater em algo, vira
  andar(s, passo, raio) {
    s.x += Math.sin(s.ang) * passo;
    s.z += Math.cos(s.ang) * passo;
    const p = { x: s.x, z: s.z };
    this.colidir(p, raio);
    if (p.x !== s.x || p.z !== s.z) s.ang += Math.PI * 0.5;
    s.x = p.x; s.z = p.z;
  }

  // Monstros dão meia-volta quando chegam perto da casa
  fugirDaCasa(s) {
    if (!this.casaPos) return false;
    const dx = s.x - this.casaPos.x, dz = s.z - this.casaPos.z;
    if (Math.hypot(dx, dz) > AREA_SEGURA_CASA + (s.grupo ? 3 : 0)) return false;
    s.ang = Math.atan2(dx, dz);
    return true;
  }

  // Câmera girando devagar para a tela de título
  orbitar(t) {
    const a = t * 0.08;
    this.camera.position.set(Math.sin(a) * 34, 20, Math.cos(a) * 34);
    this.camera.lookAt(0, 0, 0);
    for (const s of this.selvagens) animarModelo(s.modelo, t, false);
    for (const g of this.grupos) for (const m of g.membros) {
      m.modelo.position.set(g.x + m.ox, alturaEm(g.x + m.ox, g.z + m.oz), g.z + m.oz);
      animarModelo(m.modelo, t, false);
    }
    this.cristalFonte.rotation.y = t;
  }
}
