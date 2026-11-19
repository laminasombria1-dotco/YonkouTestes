// =============================================================
// CAMINHO DAS BRASAS (dungeon aberta da região de fogo)
// Um corredor que sai da borda nordeste do mapa e sobe até a cratera.
// Não é "instanciada": é parte do mapa, você entra andando.
//  - 4 etapas, separadas por portões. Cada etapa tem 2 acampamentos
//    com grupos (5 comuns + 1 líder), cada vez mais fortes.
//  - Monstros soltos também aparecem lá dentro, já evoluídos.
//  - No fim, o Trono de Magma com o chefe super raro: Ignárion.
// As medidas usam duas coordenadas:
//  s   = distância ao longo do caminho (a partir do centro do mapa)
//  lat = distância para o lado do caminho (0 = meio)
// =============================================================
import * as THREE from 'three';
import { criarModelo, criarCoroa, animarModelo } from './modelos.js';
import { ESPECIES, ETAPAS, APARICOES_DUNGEON, niveisDaEtapa, nivelDoChefe, criarMonstro, statsDe, formaPorNivel } from './dados.js';

const DIR = { x: Math.SQRT1_2, z: -Math.SQRT1_2 };  // para o nordeste
const PERP = { x: Math.SQRT1_2, z: Math.SQRT1_2 };  // de lado
export const S_INICIO = 84;      // portão de entrada
const S_ETAPA = 20;              // comprimento de cada etapa
export const S_FIM = S_INICIO + S_ETAPA * ETAPAS.length; // portão do chefe (164)
const S_MIN = 66;                // o corredor começa dentro do mapa principal
export const S_CHEFE = 182;      // centro do Trono de Magma
export const R_CHEFE = 17;       // raio do Trono de Magma
export const LARGURA = 14;       // meia largura do corredor
const S_VULCAO = 212;
const MAX_SOLTOS = 7;            // monstros soltos dentro da dungeon
const RESPAWN_ACAMPAMENTO = 120; // segundos até um acampamento vencido ter outro grupo

// O caminho faz uma curva suave
function curva(s) { return 7 * Math.sin(((s - S_INICIO) / 80) * Math.PI * 1.3); }
export function local(x, z) {
  const s = x * DIR.x + z * DIR.z;
  return { s, lat: x * PERP.x + z * PERP.z - curva(s) };
}
export function ponto(s, lat) {
  const l = lat + curva(s);
  return { x: DIR.x * s + PERP.x * l, z: DIR.z * s + PERP.z * l };
}
const CENTRO_CHEFE = ponto(S_CHEFE, 0);
export { CENTRO_CHEFE };

// Quanto um ponto está "para fora" da dungeon (negativo = dentro).
// Conta a partir de 4 m antes da parede, onde o chão começa a subir.
export function foraDungeon(x, z) {
  const { s, lat } = local(x, z);
  const corredor = Math.max(Math.abs(lat) - (LARGURA - 4), S_MIN - s, s - (S_FIM + 6));
  const trono = Math.hypot(x - CENTRO_CHEFE.x, z - CENTRO_CHEFE.z) - (R_CHEFE - 4);
  return Math.min(corredor, trono);
}
// Dentro da parte jogável da dungeon (do portão de entrada em diante)?
export function naDungeon(x, z) {
  if (Math.hypot(x - CENTRO_CHEFE.x, z - CENTRO_CHEFE.z) < R_CHEFE) return true;
  const { s, lat } = local(x, z);
  return s >= S_INICIO - 2 && s <= S_FIM + 6 && Math.abs(lat) < LARGURA;
}
// 0 a 3 = etapas, 4 = Trono de Magma, -1 = fora
export function etapaEm(x, z) {
  if (!naDungeon(x, z)) return -1;
  const { s } = local(x, z);
  if (s >= S_FIM) return 4;
  return Math.max(0, Math.min(ETAPAS.length - 1, Math.floor((s - S_INICIO) / S_ETAPA)));
}
// Altura extra: o caminho sobe até a cratera; o trono é plano
export function alturaDungeon(x, z, h) {
  const { s } = local(x, z);
  if (s < S_INICIO - 10) return h;
  const sobe = Math.min(110, s - (S_INICIO - 10)) * 0.055;
  const dTrono = Math.hypot(x - CENTRO_CHEFE.x, z - CENTRO_CHEFE.z);
  const plano = (S_CHEFE - S_INICIO + 10) * 0.055;
  if (dTrono < 12) return plano;
  if (dTrono < R_CHEFE) { const k = (dTrono - 12) / (R_CHEFE - 12); return plano * (1 - k) + (h * 0.4 + sobe) * k; }
  return h * 0.4 + sobe;
}
// Prende um ponto dentro do corredor ou do trono (o que estiver mais perto)
export function prenderDungeon(p, raio) {
  const { s, lat } = local(p.x, p.z);
  const lim = LARGURA - 2 - raio;
  const sC = Math.min(S_FIM + 6, Math.max(S_MIN, s)), latC = Math.max(-lim, Math.min(lim, lat));
  const a = ponto(sC, latC);
  const dx = p.x - CENTRO_CHEFE.x, dz = p.z - CENTRO_CHEFE.z, d = Math.hypot(dx, dz) || 1, rl = R_CHEFE - 2 - raio;
  const b = d > rl ? { x: CENTRO_CHEFE.x + (dx / d) * rl, z: CENTRO_CHEFE.z + (dz / d) * rl } : { x: p.x, z: p.z };
  return Math.hypot(a.x - p.x, a.z - p.z) < Math.hypot(b.x - p.x, b.z - p.z) ? a : b;
}
export function dentroDungeonLivre(x, z, raio) {
  const { s, lat } = local(x, z);
  if (s >= S_MIN && s <= S_FIM + 6 && Math.abs(lat) < LARGURA - 2 - raio) return true;
  return Math.hypot(x - CENTRO_CHEFE.x, z - CENTRO_CHEFE.z) < R_CHEFE - 2 - raio;
}

// ---------- materiais e peças ----------
const lambert = (cor, extra = {}) => new THREE.MeshLambertMaterial({ color: cor, flatShading: true, ...extra });
const MAT = {
  obsidiana: lambert('#2a1f2e'),
  basalto: lambert('#4a3a36'),
  pedra: lambert('#6b5a52'),
  ruina: lambert('#8a7466'),
  ferro: lambert('#3a3a42'),
  madeira: lambert('#4a2e1e'),
  osso: lambert('#e8dcc0'),
  lava: lambert('#ff6a1f', { emissive: '#ff3a00', emissiveIntensity: 0.95 }),
  chama: lambert('#ffb030', { emissive: '#ff7a1a', emissiveIntensity: 1 }),
  chamaIgnea: lambert('#ff5a8a', { emissive: '#ff2a5a', emissiveIntensity: 1 }),
  brasa: lambert('#ff4a1a', { emissive: '#ff3a00', emissiveIntensity: 0.6 }),
  morta: lambert('#2e2420'),
};
const GEO = {
  caixa: new THREE.BoxGeometry(1, 1, 1),
  cil: new THREE.CylinderGeometry(0.5, 0.5, 1, 7),
  cilFino: new THREE.CylinderGeometry(0.35, 0.5, 1, 6),
  cone: new THREE.ConeGeometry(0.5, 1, 6),
  cone4: new THREE.ConeGeometry(0.5, 1, 4),
  dode: new THREE.DodecahedronGeometry(0.6, 0),
  disco: new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2),
  tigela: new THREE.CylinderGeometry(0.55, 0.3, 0.4, 7),
  toro: new THREE.TorusGeometry(0.6, 0.06, 4, 10, Math.PI),
};

// Junta várias peças iguais num InstancedMesh (bem mais leve para o celular)
class Lote {
  constructor() { this.itens = new Map(); }
  add(geo, mat, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
    const k = geo.uuid + '|' + mat.uuid;
    if (!this.itens.has(k)) this.itens.set(k, { geo, mat, lista: [] });
    this.itens.get(k).lista.push([x, y, z, sx, sy, sz, rx, ry, rz]);
  }
  montar(cena) {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
    for (const { geo, mat, lista } of this.itens.values()) {
      const im = new THREE.InstancedMesh(geo, mat, lista.length);
      lista.forEach(([x, y, z, sx, sy, sz, rx, ry, rz], i) => {
        q.setFromEuler(e.set(rx, ry, rz));
        im.setMatrixAt(i, m4.compose(v.set(x, y, z), q, s.set(sx, sy, sz)));
      });
      cena.add(im);
    }
  }
}

function aleatorio(semente) {
  return () => {
    semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COR_BRASA = new THREE.Color('#5a2620');
const HEMI_BRASA = new THREE.Color('#ffb08a');

export class Dungeon {
  constructor(mundo, alturaEm) {
    this.m = mundo;
    this.altura = alturaEm;
    this.cena = mundo.cena;
    this.rng = aleatorio(4242);
    this.obstaculos = mundo.obstaculos;
    this.acampamentos = [];
    this.chefe = null;
    this.chefeVolta = 0;          // segundos até o chefe poder reaparecer (espera o amanhecer)
    this.esperaAmanhecer = false;
    this.etapaAvisada = -1;
    this.fator = 0;               // 0 = fora, 1 = no fundo da dungeon (para o clima)
    this.lote = new Lote();
    this.chamines = [];
    this.portoes = [];
    this.construir();
    this.lote.montar(this.cena);
    this.criarParticulas();
  }

  y(x, z) { return this.altura(x, z); }
  obst(x, z, r) { this.obstaculos.push({ x, z, r }); }

  // ---------- construção do cenário ----------
  construir() {
    const L = this.lote, rng = this.rng;
    // Portões: entrada de cada etapa + portão do trono
    for (let i = 0; i <= ETAPAS.length; i++) this.portao(S_INICIO + i * S_ETAPA, i === ETAPAS.length);
    // Braseiros dos dois lados do caminho
    for (let s = S_INICIO - 14; s < S_FIM; s += 7) for (const lado of [-1, 1]) {
      const p = ponto(s, lado * (LARGURA - 3.2));
      this.braseiro(p.x, p.z, 1.6);
    }
    // Estrada de pedras no meio do caminho (só visual)
    for (let s = S_INICIO - 20; s < S_FIM + 4; s += 1.6) {
      const p = ponto(s, (rng() - 0.5) * 2);
      L.add(GEO.caixa, MAT.pedra, p.x, this.y(p.x, p.z) + 0.02, p.z, 1.1 + rng() * 0.6, 0.08, 0.9 + rng() * 0.5, 0, rng() * 3, 0);
    }
    this.etapa1(); this.etapa2(); this.etapa3(); this.etapa4();
    this.trono();
    this.vulcao();
    this.estradaDeFora();
    this.criarAcampamentos();
  }

  // Duas colunas de obsidiana com uma viga e chamas em cima.
  // Cada portão é um grupo próprio: fica transparente quando você passa por baixo (para não tampar a câmera)
  portao(s, doChefe) {
    const grupo = new THREE.Group();
    const mats = {};
    const tr = (m) => (mats[m.uuid] ||= m.clone());
    const L = { add: (geo, m, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
      const o = new THREE.Mesh(geo, tr(m));
      o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(rx, ry, rz);
      grupo.add(o);
    } };
    const h = doChefe ? 7 : 5.2, abre = doChefe ? 5 : 4.2;
    for (const lado of [-1, 1]) {
      const p = ponto(s, lado * abre), y = this.y(p.x, p.z);
      L.add(GEO.caixa, MAT.obsidiana, p.x, y + h / 2, p.z, 1.3, h, 1.3, 0, Math.PI / 4, 0);
      L.add(GEO.caixa, MAT.basalto, p.x, y + 0.4, p.z, 1.9, 0.8, 1.9, 0, Math.PI / 4, 0);
      L.add(GEO.tigela, MAT.ferro, p.x, y + h + 0.2, p.z, 1.2, 1, 1.2);
      L.add(GEO.cone, doChefe ? MAT.chamaIgnea : MAT.chama, p.x, y + h + 0.9, p.z, 0.9, 1.4, 0.9);
      this.obst(p.x, p.z, 1.1);
      // muros saindo do portão até a parede
      for (let k = abre + 2; k < LARGURA - 1; k += 2) {
        const q = ponto(s, lado * k);
        L.add(GEO.caixa, MAT.basalto, q.x, this.y(q.x, q.z) + 0.9, q.z, 2, 1.8 + Math.sin(k) * 0.4, 1, 0, Math.PI / 4, 0);
        this.obst(q.x, q.z, 1.1);
      }
    }
    const a = ponto(s, -abre), b = ponto(s, abre);
    const yv = Math.max(this.y(a.x, a.z), this.y(b.x, b.z)) + h + 0.5;
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
    L.add(GEO.caixa, MAT.obsidiana, mx, yv, mz, abre * 2 + 2, 0.9, 1.4, 0, Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2, 0);
    L.add(GEO.cone4, doChefe ? MAT.chamaIgnea : MAT.brasa, mx, yv + 1, mz, 0.9, 1.2, 0.9);
    for (const m of Object.values(mats)) m.transparent = true;
    this.cena.add(grupo);
    this.portoes.push({ x: mx, z: mz, s, mats: Object.values(mats), op: 1 });
  }

  braseiro(x, z, alt) {
    const L = this.lote, y = this.y(x, z);
    L.add(GEO.cilFino, MAT.ferro, x, y + alt / 2, z, 0.35, alt, 0.35);
    L.add(GEO.tigela, MAT.ferro, x, y + alt + 0.15, z, 0.9, 1, 0.9);
    L.add(GEO.dode, MAT.brasa, x, y + alt + 0.3, z, 0.5, 0.35, 0.5);
    L.add(GEO.cone, MAT.chama, x, y + alt + 0.75, z, 0.55, 0.9, 0.55);
    this.obst(x, z, 0.4);
  }

  // Lugar livre dentro de uma etapa (longe do meio do caminho e de outros obstáculos)
  lugarNaEtapa(e, latMin, folga) {
    for (let t = 0; t < 60; t++) {
      const s = S_INICIO + e * S_ETAPA + 2.5 + this.rng() * (S_ETAPA - 5);
      const lat = (this.rng() < 0.5 ? -1 : 1) * (latMin + this.rng() * (LARGURA - 3.5 - latMin));
      const p = ponto(s, lat);
      if (this.obstaculos.every((o) => Math.hypot(o.x - p.x, o.z - p.z) > o.r + folga)) return p;
    }
    return null;
  }

  // Etapa 1: Portão de Cinzas — árvores mortas, ossos e pedras de lava
  etapa1() {
    const L = this.lote, rng = this.rng;
    for (let i = 0; i < 9; i++) {
      const p = this.lugarNaEtapa(0, 5, 1.5); if (!p) continue;
      const y = this.y(p.x, p.z), h = 2.2 + rng() * 1.5;
      L.add(GEO.cilFino, MAT.morta, p.x, y + h / 2, p.z, 0.45, h, 0.45, 0, 0, (rng() - 0.5) * 0.2);
      for (let k = 0; k < 3; k++) L.add(GEO.cone4, MAT.morta, p.x + Math.cos(k * 2.1) * 0.5, y + h * (0.6 + k * 0.12), p.z + Math.sin(k * 2.1) * 0.5, 0.18, 1.3, 0.18, Math.cos(k * 2.1) * 0.9, 0, Math.sin(k * 2.1) * 0.9);
      this.obst(p.x, p.z, 0.45);
    }
    for (let i = 0; i < 4; i++) { // costelas de uma fera antiga
      const p = this.lugarNaEtapa(0, 6, 2); if (!p) continue;
      const y = this.y(p.x, p.z), r = rng() * 3;
      for (let k = 0; k < 4; k++) L.add(GEO.toro, MAT.osso, p.x + Math.sin(r) * (k - 1.5) * 0.5, y + 0.1, p.z + Math.cos(r) * (k - 1.5) * 0.5, 1.4 - Math.abs(k - 1.5) * 0.2, 1.4, 1, 0, r + Math.PI / 2, 0);
      L.add(GEO.dode, MAT.osso, p.x + Math.sin(r) * 1.4, y + 0.3, p.z + Math.cos(r) * 1.4, 0.5, 0.4, 0.6);
      this.obst(p.x, p.z, 1);
    }
    this.pedrasDeLava(0, 8);
  }

  // Etapa 2: Ruínas da Forja — muros quebrados, colunas, bigornas e fornalhas
  etapa2() {
    const L = this.lote, rng = this.rng;
    for (let i = 0; i < 7; i++) {
      const p = this.lugarNaEtapa(1, 5, 1.8); if (!p) continue;
      const y = this.y(p.x, p.z), r = rng() * 3, comp = 2 + rng() * 2.5, alt = 0.8 + rng() * 1.6;
      L.add(GEO.caixa, MAT.ruina, p.x, y + alt / 2, p.z, comp, alt, 0.7, 0, r, 0);
      L.add(GEO.caixa, MAT.ruina, p.x + Math.cos(r) * comp * 0.3, y + alt + 0.25, p.z - Math.sin(r) * comp * 0.3, comp * 0.35, 0.5, 0.7, 0, r, 0.2);
      this.obst(p.x, p.z, comp * 0.45);
    }
    for (let i = 0; i < 6; i++) {
      const p = this.lugarNaEtapa(1, 4, 1.2); if (!p) continue;
      const y = this.y(p.x, p.z), h = 1.5 + rng() * 2.8;
      L.add(GEO.cil, MAT.ruina, p.x, y + h / 2, p.z, 0.8, h, 0.8);
      L.add(GEO.caixa, MAT.ruina, p.x, y + h + 0.15, p.z, 1.1, 0.3, 1.1, 0, rng(), 0);
      this.obst(p.x, p.z, 0.55);
    }
    for (let i = 0; i < 2; i++) { // fornalhas com a boca acesa e chaminé
      const p = this.lugarNaEtapa(1, 7, 2.5); if (!p) continue;
      const y = this.y(p.x, p.z);
      L.add(GEO.caixa, MAT.basalto, p.x, y + 1.2, p.z, 3, 2.4, 2.6);
      L.add(GEO.caixa, MAT.lava, p.x, y + 0.8, p.z + 1.31, 1.2, 0.9, 0.05);
      L.add(GEO.caixa, MAT.lava, p.x - 1.51, y + 0.8, p.z, 0.05, 0.9, 1.2);
      L.add(GEO.cil, MAT.basalto, p.x + 0.8, y + 3.4, p.z - 0.6, 0.7, 2.4, 0.7);
      this.obst(p.x, p.z, 1.9);
      this.chamines.push({ x: p.x + 0.8, y: y + 4.6, z: p.z - 0.6 });
      for (const k of [-1, 1]) { // bigornas
        const bx = p.x + k * 2.6, bz = p.z + 1.6;
        L.add(GEO.caixa, MAT.ferro, bx, y + 0.5, bz, 0.5, 1, 0.5);
        L.add(GEO.caixa, MAT.ferro, bx, y + 1.1, bz, 1.1, 0.3, 0.5);
        this.obst(bx, bz, 0.5);
      }
    }
    this.pedrasDeLava(1, 5);
  }

  // Etapa 3: Rio de Lava — um rio atravessa o caminho; só dá para passar pela ponte
  etapa3() {
    const L = this.lote, sR = S_INICIO + 2 * S_ETAPA + 10;
    for (let lat = -LARGURA + 1; lat < LARGURA - 1; lat += 1.4) {
      const p = ponto(sR, lat), y = this.y(p.x, p.z);
      L.add(GEO.disco, MAT.lava, p.x, y + 0.05, p.z, 1.6, 1, 1.6);
      if (Math.abs(lat) > 2.6) this.obst(p.x, p.z, 1.1);
    }
    // ponte de pedra
    const a = ponto(sR - 3, 0), b = ponto(sR + 3, 0);
    const ang = Math.atan2(b.x - a.x, b.z - a.z);
    const meio = ponto(sR, 0), ym = this.y(meio.x, meio.z);
    L.add(GEO.caixa, MAT.pedra, meio.x, ym + 0.3, meio.z, 3.6, 0.4, 7, 0, ang, 0);
    for (const lado of [-1, 1]) for (const k of [-2.6, 0, 2.6]) {
      const q = ponto(sR + k, lado * 1.9);
      L.add(GEO.caixa, MAT.basalto, q.x, ym + 0.8, q.z, 0.4, 0.8, 0.4);
    }
    // poças de lava espalhadas
    for (let i = 0; i < 7; i++) {
      const p = this.lugarNaEtapa(2, 4, 2.2); if (!p) continue;
      const r = 1.2 + this.rng() * 1.3;
      L.add(GEO.disco, MAT.lava, p.x, this.y(p.x, p.z) + 0.06, p.z, r, 1, r);
      L.add(GEO.dode, MAT.basalto, p.x + r, this.y(p.x, p.z) + 0.2, p.z, 0.8, 0.5, 0.8);
      this.obst(p.x, p.z, r * 0.9);
    }
    this.pedrasDeLava(2, 8);
  }

  // Etapa 4: Escadaria de Obsidiana — degraus, espinhos de obsidiana e estátuas
  etapa4() {
    const L = this.lote, rng = this.rng, s0 = S_INICIO + 3 * S_ETAPA;
    for (let k = 0; k < 6; k++) { // degraus largos (visual)
      const p = ponto(s0 + 3 + k * 2.6, 0);
      L.add(GEO.caixa, MAT.obsidiana, p.x, this.y(p.x, p.z) + 0.05, p.z, 9, 0.18, 1.4, 0, Math.PI / 4 + 0.1 * Math.cos(k), 0);
    }
    for (let i = 0; i < 16; i++) {
      const p = this.lugarNaEtapa(3, 5, 1); if (!p) continue;
      const h = 1.5 + rng() * 3.5;
      L.add(GEO.cone4, MAT.obsidiana, p.x, this.y(p.x, p.z) + h / 2, p.z, 0.7 + rng() * 0.5, h, 0.7, (rng() - 0.5) * 0.3, rng() * 3, (rng() - 0.5) * 0.3);
      this.obst(p.x, p.z, 0.5);
    }
    // estátuas de lobos de pedra guardando o caminho
    for (const lado of [-1, 1]) for (const k of [5, 14]) {
      const p = ponto(s0 + k, lado * 7), y = this.y(p.x, p.z);
      L.add(GEO.caixa, MAT.basalto, p.x, y + 0.6, p.z, 1.8, 1.2, 1.8, 0, Math.PI / 4, 0);
      L.add(GEO.dode, MAT.pedra, p.x, y + 1.7, p.z, 1.1, 0.9, 1.4);
      L.add(GEO.dode, MAT.pedra, p.x - lado * 0.4, y + 2.5, p.z - lado * 0.4, 0.7, 0.7, 0.7);
      for (const o of [-1, 1]) L.add(GEO.cone4, MAT.pedra, p.x - lado * 0.4 + o * 0.25, y + 3.1, p.z - lado * 0.4 - o * 0.25, 0.25, 0.6, 0.25);
      this.obst(p.x, p.z, 1.3);
    }
    this.pedrasDeLava(3, 6);
  }

  pedrasDeLava(e, n) {
    for (let i = 0; i < n; i++) {
      const p = this.lugarNaEtapa(e, 4, 1); if (!p) continue;
      const esc = 0.5 + this.rng() * 0.8;
      this.lote.add(GEO.dode, this.rng() < 0.5 ? MAT.brasa : MAT.basalto, p.x, this.y(p.x, p.z) + 0.2 * esc, p.z, esc, esc * 0.7, esc, this.rng(), this.rng() * 6, this.rng());
      this.obst(p.x, p.z, 0.6 * esc);
    }
  }

  // Trono de Magma: arena redonda com pilares, chão de pedra e o trono do chefe
  trono() {
    const L = this.lote, c = CENTRO_CHEFE, y = this.y(c.x, c.z);
    L.add(GEO.cil, MAT.pedra, c.x, y - 0.15, c.z, 24, 0.4, 24);
    L.add(GEO.cil, MAT.basalto, c.x, y - 0.1, c.z, 16, 0.42, 16);
    // anel de lava no chão
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2, r = 9.5;
      L.add(GEO.caixa, MAT.lava, c.x + Math.cos(a) * r, y + 0.12, c.z + Math.sin(a) * r, 2.2, 0.05, 0.4, 0, -a, 0);
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3, r = R_CHEFE - 3.5;
      const x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
      const lp = local(x, z);
      if (lp.s < S_CHEFE - 8 && Math.abs(lp.lat) < 6) continue; // deixa a entrada livre
      const h = 5 + (i % 3) * 1.5;
      L.add(GEO.caixa, MAT.obsidiana, x, y + h / 2, z, 1.2, h, 1.2, 0, a, 0);
      L.add(GEO.tigela, MAT.ferro, x, y + h + 0.2, z, 1.1, 1, 1.1);
      L.add(GEO.cone, MAT.chamaIgnea, x, y + h + 0.85, z, 0.8, 1.3, 0.8);
      this.obst(x, z, 0.9);
    }
    // o trono, atrás do chefe
    const t = ponto(S_CHEFE + 8, 0), yt = this.y(t.x, t.z), ang = Math.PI / 4 + Math.PI;
    L.add(GEO.caixa, MAT.obsidiana, t.x, yt + 0.6, t.z, 6, 1.2, 3.5, 0, ang, 0);
    L.add(GEO.caixa, MAT.obsidiana, t.x + DIR.x * 1.2, yt + 3, t.z + DIR.z * 1.2, 5, 4.5, 1, 0, ang, 0);
    for (const lado of [-1, 1]) {
      const q = { x: t.x + PERP.x * lado * 2.8, z: t.z + PERP.z * lado * 2.8 };
      L.add(GEO.cone4, MAT.obsidiana, q.x, yt + 5.5, q.z, 0.8, 3, 0.8);
      L.add(GEO.cone, MAT.chamaIgnea, q.x, yt + 7.3, q.z, 0.7, 1.2, 0.7);
    }
    L.add(GEO.caixa, MAT.lava, t.x + DIR.x * 0.65, yt + 3.6, t.z + DIR.z * 0.65, 1.2, 1.2, 0.05, 0, ang, Math.PI / 4);
    this.obst(t.x, t.z, 3);
  }

  // O vulcão gigante no fundo, com cascatas de lava
  vulcao() {
    const p = ponto(S_VULCAO, 0), y = this.y(p.x, p.z);
    const monte = new THREE.Mesh(new THREE.CylinderGeometry(7, 34, 40, 10), lambert('#3a2420'));
    monte.position.set(p.x, y + 16, p.z);
    const boca = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.4, 0.5, 10), MAT.lava);
    boca.position.set(p.x, y + 36.1, p.z);
    this.cena.add(monte, boca);
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * 0.75 + (i - 2) * 0.32; // virado para o trono
      const cascata = new THREE.Mesh(GEO.caixa, MAT.lava);
      const r = 20;
      cascata.position.set(p.x + Math.cos(a) * r, y + 18, p.z + Math.sin(a) * r);
      cascata.scale.set(1.4, 34, 0.6);
      cascata.lookAt(p.x, y + 18, p.z);
      cascata.rotateX(-0.5);
      this.cena.add(cascata);
    }
    this.bocaVulcao = { x: p.x, y: y + 37, z: p.z };
  }

  // Na parte de fora (região de fogo do mapa principal): braseiros guiando até a entrada
  estradaDeFora() {
    for (let s = 40; s < S_INICIO - 14; s += 9) for (const lado of [-1, 1]) {
      const p = ponto(s, lado * 5);
      if (this.obstaculos.some((o) => Math.hypot(o.x - p.x, o.z - p.z) < o.r + 1)) continue;
      this.braseiro(p.x, p.z, 1.3);
    }
  }

  // ---------- partículas: cinzas caindo e brasas subindo ----------
  criarParticulas() {
    const n = 360, pos = new Float32Array(n * 3), cor = new Float32Array(n * 3), c = new THREE.Color();
    const paleta = ['#ff9a3a', '#ffcf5a', '#ff5a1f', '#7a6a66', '#9a8a86', '#5a4a46'];
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * 26;
      pos[i * 3 + 1] = Math.random() * 16;
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * 26;
      c.set(paleta[i % paleta.length]);
      cor.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
    this.particulas = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, opacity: 0, depthWrite: false }));
    this.particulas.frustumCulled = false;
    this.cena.add(this.particulas);
    // fumaça das chaminés e do vulcão
    this.fumacas = [];
    const fontes = [...this.chamines, this.bocaVulcao];
    for (const f of fontes) for (let k = 0; k < 4; k++) {
      const grande = f === this.bocaVulcao;
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(grande ? 3 : 0.6, 0), new THREE.MeshLambertMaterial({ color: '#5a5050', transparent: true, opacity: 0.6, flatShading: true }));
      this.cena.add(m);
      this.fumacas.push({ m, f, fase: k / 4, alt: grande ? 22 : 5 });
    }
  }

  // ---------- acampamentos de grupos ----------
  criarAcampamentos() {
    for (let e = 0; e < ETAPAS.length; e++) {
      for (const [k, lado] of [[6, -1], [14, 1]]) {
        const p = ponto(S_INICIO + e * S_ETAPA + k, lado * 6.5);
        // fogueira do acampamento (visual)
        const y = this.y(p.x, p.z);
        for (let i = 0; i < 6; i++) this.lote.add(GEO.dode, MAT.basalto, p.x + Math.cos(i) * 4.4, y + 0.15, p.z + Math.sin(i) * 4.4, 0.4, 0.3, 0.4);
        this.acampamentos.push({ x: p.x, z: p.z, etapa: e, grupo: null, espera: 0 });
      }
    }
  }

  // Cria (ou desfaz) os grupos dos acampamentos conforme você se aproxima
  atualizarAcampamentos(dt) {
    const m = this.m;
    for (const a of this.acampamentos) {
      const d = Math.hypot(m.pos.x - a.x, m.pos.z - a.z);
      if (a.grupo && !m.grupos.includes(a.grupo)) { a.grupo = null; a.espera = RESPAWN_ACAMPAMENTO; }
      if (a.espera > 0) { a.espera -= dt; continue; }
      if (!a.grupo && d < 42 && d > 16) {
        a.grupo = m.spawnarGrupo({ x: a.x, z: a.z, zona: 'brasas', niveis: niveisDaEtapa(m.mediaEquipe(), a.etapa), lista: APARICOES_DUNGEON, acampamento: a });
      } else if (a.grupo && d > 60) {
        m.removerGrupo(a.grupo, true);
        a.grupo = null;
      }
    }
  }

  // Monstros soltos (já evoluídos) dentro da dungeon, perto de você
  atualizarSoltos(dentro) {
    const m = this.m;
    const soltos = m.selvagens.filter((s) => s.dungeon);
    for (const s of soltos) if (Math.hypot(s.x - m.pos.x, s.z - m.pos.z) > 70) m.removerSelvagem(s);
    if (!dentro || soltos.length >= MAX_SOLTOS) return;
    const { s: sJ } = local(m.pos.x, m.pos.z);
    for (let t = 0; t < 12; t++) {
      const s = sJ + 14 + Math.random() * 18 * (Math.random() < 0.3 ? -1 : 1);
      if (s < S_INICIO + 1 || s > S_FIM - 1) continue;
      const p = ponto(s, (Math.random() * 2 - 1) * (LARGURA - 5));
      if (Math.hypot(p.x - m.pos.x, p.z - m.pos.z) < 12) continue;
      if (this.obstaculos.some((o) => Math.hypot(o.x - p.x, o.z - p.z) < o.r + 1)) continue;
      const etapa = etapaEm(p.x, p.z);
      if (etapa < 0 || etapa > 3) continue;
      const nv = niveisDaEtapa(m.mediaEquipe(), etapa).comum + Math.round(Math.random() * 2);
      const escolha = sortear(APARICOES_DUNGEON);
      const especie = escolha.startsWith('L:') ? formaPorNivel(escolha.slice(2), nv) : escolha;
      const dados = criarMonstro(especie, nv);
      const modelo = criarModelo(especie);
      modelo.position.set(p.x, this.y(p.x, p.z), p.z);
      this.cena.add(modelo);
      m.selvagens.push({ dados, modelo, dungeon: true, x: p.x, z: p.z, ang: Math.random() * 6.28, estado: 'parado', t: Math.random() * 2, zona: 'brasas', periodo: null, vel: statsDe(especie, nv).vel * 0.45 });
      return;
    }
  }

  // ---------- chefe ----------
  spawnarChefe() {
    const m = this.m, c = CENTRO_CHEFE;
    const nivel = nivelDoChefe(m.mediaEquipe());
    const dados = criarMonstro('ignarion', nivel);
    const modelo = criarModelo('ignarion');
    const coroa = criarCoroa(1.6);
    coroa.position.y = ESPECIES.ignarion.altura + 0.2;
    modelo.add(coroa);
    const pos = ponto(S_CHEFE + 3, 0);
    modelo.position.set(pos.x, this.y(pos.x, pos.z), pos.z);
    modelo.rotation.y = Math.atan2(-DIR.x, -DIR.z); // olhando para a entrada
    this.cena.add(modelo);
    this.chefe = { dados, modelo, chefe: true, fixo: true, x: pos.x, z: pos.z, ang: modelo.rotation.y, estado: 'parado', t: 99, zona: 'cratera', periodo: null, vel: 0 };
    m.selvagens.push(this.chefe);
  }

  atualizarChefe(dt) {
    const m = this.m;
    if (this.chefe && !m.selvagens.includes(this.chefe)) {
      // foi vencido ou capturado: volta no próximo amanhecer
      this.chefe = null;
      this.esperaAmanhecer = true;
      this.periodoVisto = m.periodo;
    }
    if (!this.chefe && this.esperaAmanhecer) {
      if (m.periodo !== this.periodoVisto) {
        this.periodoVisto = m.periodo;
        if (m.periodo === 'dia') {
          this.esperaAmanhecer = false;
          this.spawnarChefe();
          if (m.jogo.estado) m.jogo.aviso('Ignárion voltou ao Trono de Magma.');
        }
      }
    }
    if (!this.chefe && !this.esperaAmanhecer) this.spawnarChefe();
  }

  // ---------- quadro a quadro ----------
  atualizar(dt, t) {
    const m = this.m;
    const etapa = etapaEm(m.pos.x, m.pos.z);
    this.etapaAtual = etapa;
    const dentro = etapa >= 0;
    // aviso de etapa ao entrar em cada parte
    if (etapa !== this.etapaAvisada && m.jogo.estado) {
      if (etapa >= 0 && etapa < 4 && etapa > this.etapaAvisada) {
        const nv = niveisDaEtapa(m.mediaEquipe(), etapa);
        m.jogo.mostrarZona(ETAPAS[etapa].nome);
        m.jogo.aviso(`Grupos daqui: comuns Nv.${nv.comum}, líderes Nv.${nv.lider}.`);
      } else if (etapa === 4) {
        m.jogo.mostrarZona('Trono de Magma');
        if (this.chefe) m.jogo.aviso(`O chefe Ignárion (Nv.${this.chefe.dados.nivel}) dorme no trono. Encoste nele para lutar.`);
        else m.jogo.aviso('O trono está vazio. Ignárion volta no próximo amanhecer.');
      } else if (etapa === -1 && this.etapaAvisada >= 0) {
        m.jogo.mostrarZona('Vulcão');
      }
      this.etapaAvisada = etapa;
    }
    // clima: quanto mais fundo, mais escuro e cheio de cinzas
    const { s } = local(m.pos.x, m.pos.z);
    const alvo = Math.max(0, Math.min(1, (s - (S_INICIO - 12)) / 50)) * (foraDungeon(m.pos.x, m.pos.z) < 6 ? 1 : 0);
    this.fator += (alvo - this.fator) * Math.min(1, dt * 1.5);
    const f = this.fator;
    if (f > 0.001) {
      m.cena.background.lerp(COR_BRASA, f * 0.75);
      m.cena.fog.color.copy(m.cena.background);
      m.hemi.color.lerp(HEMI_BRASA, f * 0.5);
    }
    m.cena.fog.near = 40 - 18 * f;
    m.cena.fog.far = 115 - 40 * f;
    this.particulas.material.opacity = Math.min(0.9, f * 1.2);
    if (f > 0.01) this.moverParticulas(dt, t);
    for (const fu of this.fumacas) {
      const k = (t * (fu.alt > 10 ? 0.08 : 0.25) + fu.fase) % 1;
      fu.m.position.set(fu.f.x + Math.sin(k * 6 + fu.fase * 9) * 0.6, fu.f.y + k * fu.alt, fu.f.z);
      fu.m.scale.setScalar(0.6 + k * 1.6);
      fu.m.material.opacity = 0.6 * (1 - k);
    }
    // portões ficam transparentes quando você está logo antes ou embaixo deles
    for (const pt of this.portoes) {
      const ds = s - pt.s;
      const alvoOp = ds > -3 && ds < 9 && Math.hypot(m.pos.x - pt.x, m.pos.z - pt.z) < 14 ? 0.18 : 1;
      if (Math.abs(alvoOp - pt.op) > 0.01) {
        pt.op += (alvoOp - pt.op) * Math.min(1, dt * 6);
        for (const mt of pt.mats) { mt.opacity = pt.op; mt.depthWrite = pt.op > 0.9; }
      }
    }
    this.atualizarAcampamentos(dt);
    this.atualizarSoltos(dentro);
    this.atualizarChefe(dt);
    if (this.chefe) {
      animarModelo(this.chefe.modelo, t, false);
      this.chefe.modelo.position.y = this.y(this.chefe.x, this.chefe.z);
    }
  }

  moverParticulas(dt, t) {
    const m = this.m, p = this.particulas.geometry.attributes.position, a = p.array;
    this.particulas.position.set(m.pos.x, m.pos.y, m.pos.z);
    for (let i = 0; i < p.count; i++) {
      const k = i * 3;
      const brasa = i % 6 < 3;
      a[k + 1] += (brasa ? 1.6 + (i % 4) * 0.4 : -0.8) * dt;
      a[k] += Math.sin(t * 1.5 + i) * 0.6 * dt;
      if (a[k + 1] > 16) a[k + 1] -= 16;
      if (a[k + 1] < 0) a[k + 1] += 16;
    }
    p.needsUpdate = true;
  }
}

function sortear(lista) {
  const total = lista.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [e, w] of lista) { r -= w; if (r <= 0) return e; }
  return lista[0][0];
}
