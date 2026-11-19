// =============================================================
// CAMINHO DAS BRASAS (dungeon aberta da região de fogo)
// Sai da borda nordeste do mapa e sobe até a cratera.
// A parte comum (portões, acampamentos, soltos, chefe, clima) fica em dungeon.js;
// aqui fica só o cenário: braseiros, árvores mortas, forja, rio de lava,
// escadaria de obsidiana, o Trono de Magma e o vulcão gigante.
// =============================================================
import * as THREE from 'three';
import { DungeonAberta, BRASAS, GEO, lambert } from './dungeon.js';

const MAT = {
  obsidiana: lambert('#2a1f2e'),
  basalto: lambert('#4a3a36'),
  pedra: lambert('#6b5a52'),
  ruina: lambert('#8a7466'),
  ferro: lambert('#3a3a42'),
  osso: lambert('#e8dcc0'),
  lava: lambert('#ff6a1f', { emissive: '#ff3a00', emissiveIntensity: 0.95 }),
  chama: lambert('#ffb030', { emissive: '#ff7a1a', emissiveIntensity: 1 }),
  chamaIgnea: lambert('#ff5a8a', { emissive: '#ff2a5a', emissiveIntensity: 1 }),
  brasa: lambert('#ff4a1a', { emissive: '#ff3a00', emissiveIntensity: 0.6 }),
  morta: lambert('#2e2420'),
};
const S_VULCAO = 212;

export class CaminhoDasBrasas extends DungeonAberta {
  constructor(mundo, alturaEm) {
    super(mundo, alturaEm, BRASAS, 4242);
  }
  get corCeu() { return new THREE.Color('#5a2620'); }
  get corHemi() { return new THREE.Color('#ffb08a'); }
  get paletaParticulas() { return ['#ff9a3a', '#ffcf5a', '#ff5a1f', '#7a6a66', '#9a8a86', '#5a4a46']; }

  construir() {
    this.chamines = [];
    super.construir();
  }

  // Duas colunas de obsidiana com uma viga e chamas em cima
  pecasPortao(L, s, doChefe) {
    const T = this.t, h = doChefe ? 7 : 5.2, abre = doChefe ? 5 : 4.2;
    for (const lado of [-1, 1]) {
      const p = this.ponto(s, lado * abre), y = this.y(p.x, p.z);
      L.add(GEO.caixa, MAT.obsidiana, p.x, y + h / 2, p.z, 1.3, h, 1.3, 0, Math.PI / 4, 0);
      L.add(GEO.caixa, MAT.basalto, p.x, y + 0.4, p.z, 1.9, 0.8, 1.9, 0, Math.PI / 4, 0);
      L.add(GEO.tigela, MAT.ferro, p.x, y + h + 0.2, p.z, 1.2, 1, 1.2);
      L.add(GEO.cone, doChefe ? MAT.chamaIgnea : MAT.chama, p.x, y + h + 0.9, p.z, 0.9, 1.4, 0.9);
      this.obst(p.x, p.z, 1.1);
      // muros saindo do portão até a parede
      for (let k = abre + 2; k < T.largura - 1; k += 2) {
        const q = this.ponto(s, lado * k);
        L.add(GEO.caixa, MAT.basalto, q.x, this.y(q.x, q.z) + 0.9, q.z, 2, 1.8 + Math.sin(k) * 0.4, 1, 0, Math.PI / 4, 0);
        this.obst(q.x, q.z, 1.1);
      }
    }
    const a = this.ponto(s, -abre), b = this.ponto(s, abre);
    const yv = Math.max(this.y(a.x, a.z), this.y(b.x, b.z)) + h + 0.5;
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
    L.add(GEO.caixa, MAT.obsidiana, mx, yv, mz, abre * 2 + 2, 0.9, 1.4, 0, Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2, 0);
    L.add(GEO.cone4, doChefe ? MAT.chamaIgnea : MAT.brasa, mx, yv + 1, mz, 0.9, 1.2, 0.9);
  }

  // Braseiros dos dois lados e estrada de pedras no meio (só visual)
  caminho() {
    const T = this.t, L = this.lote, rng = this.rng;
    for (let s = T.sInicio - 14; s < T.sFim; s += 7) for (const lado of [-1, 1]) {
      const p = this.ponto(s, lado * (T.largura - 3.2));
      this.braseiro(p.x, p.z, 1.6);
    }
    for (let s = T.sInicio - 20; s < T.sFim + 4; s += 1.6) {
      const p = this.ponto(s, (rng() - 0.5) * 2);
      L.add(GEO.caixa, MAT.pedra, p.x, this.y(p.x, p.z) + 0.02, p.z, 1.1 + rng() * 0.6, 0.08, 0.9 + rng() * 0.5, 0, rng() * 3, 0);
    }
  }

  braseiro(x, z, alt) {
    const L = this.lote, y = this.y(x, z);
    L.add(GEO.cilFino, MAT.ferro, x, y + alt / 2, z, 0.35, alt, 0.35);
    L.add(GEO.tigela, MAT.ferro, x, y + alt + 0.15, z, 0.9, 1, 0.9);
    L.add(GEO.dode, MAT.brasa, x, y + alt + 0.3, z, 0.5, 0.35, 0.5);
    L.add(GEO.cone, MAT.chama, x, y + alt + 0.75, z, 0.55, 0.9, 0.55);
    this.obst(x, z, 0.4);
  }

  etapa(e) { [this.etapa1, this.etapa2, this.etapa3, this.etapa4][e].call(this); }

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
    const T = this.t, L = this.lote, sR = this.sEtapa(2) + 10;
    for (let lat = -T.largura + 1; lat < T.largura - 1; lat += 1.4) {
      const p = this.ponto(sR, lat), y = this.y(p.x, p.z);
      L.add(GEO.disco, MAT.lava, p.x, y + 0.05, p.z, 1.6, 1, 1.6);
      if (Math.abs(lat) > 2.6) this.obst(p.x, p.z, 1.1);
    }
    // ponte de pedra
    const a = this.ponto(sR - 3, 0), b = this.ponto(sR + 3, 0);
    const ang = Math.atan2(b.x - a.x, b.z - a.z);
    const meio = this.ponto(sR, 0), ym = this.y(meio.x, meio.z);
    L.add(GEO.caixa, MAT.pedra, meio.x, ym + 0.3, meio.z, 3.6, 0.4, 7, 0, ang, 0);
    for (const lado of [-1, 1]) for (const k of [-2.6, 0, 2.6]) {
      const q = this.ponto(sR + k, lado * 1.9);
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
    const L = this.lote, rng = this.rng, s0 = this.sEtapa(3);
    for (let k = 0; k < 6; k++) { // degraus largos (visual)
      const p = this.ponto(s0 + 3 + k * 2.6, 0);
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
      const p = this.ponto(s0 + k, lado * 7), y = this.y(p.x, p.z);
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
  fim() {
    const T = this.t, L = this.lote, c = T.centroChefe, y = this.y(c.x, c.z);
    L.add(GEO.cil, MAT.pedra, c.x, y - 0.15, c.z, 24, 0.4, 24);
    L.add(GEO.cil, MAT.basalto, c.x, y - 0.1, c.z, 16, 0.42, 16);
    for (let i = 0; i < 28; i++) { // anel de lava no chão
      const a = (i / 28) * Math.PI * 2, r = 9.5;
      L.add(GEO.caixa, MAT.lava, c.x + Math.cos(a) * r, y + 0.12, c.z + Math.sin(a) * r, 2.2, 0.05, 0.4, 0, -a, 0);
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3, r = T.rChefe - 3.5;
      const x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
      const lp = T.local(x, z);
      if (lp.s < T.sChefe - 8 && Math.abs(lp.lat) < 6) continue; // deixa a entrada livre
      const h = 5 + (i % 3) * 1.5;
      L.add(GEO.caixa, MAT.obsidiana, x, y + h / 2, z, 1.2, h, 1.2, 0, a, 0);
      L.add(GEO.tigela, MAT.ferro, x, y + h + 0.2, z, 1.1, 1, 1.1);
      L.add(GEO.cone, MAT.chamaIgnea, x, y + h + 0.85, z, 0.8, 1.3, 0.8);
      this.obst(x, z, 0.9);
    }
    // o trono, atrás do chefe
    const t = this.ponto(T.sChefe + 8, 0), yt = this.y(t.x, t.z), ang = Math.PI / 4 + Math.PI;
    const D = T.dir, P = T.perp;
    L.add(GEO.caixa, MAT.obsidiana, t.x, yt + 0.6, t.z, 6, 1.2, 3.5, 0, ang, 0);
    L.add(GEO.caixa, MAT.obsidiana, t.x + D.x * 1.2, yt + 3, t.z + D.z * 1.2, 5, 4.5, 1, 0, ang, 0);
    for (const lado of [-1, 1]) {
      const q = { x: t.x + P.x * lado * 2.8, z: t.z + P.z * lado * 2.8 };
      L.add(GEO.cone4, MAT.obsidiana, q.x, yt + 5.5, q.z, 0.8, 3, 0.8);
      L.add(GEO.cone, MAT.chamaIgnea, q.x, yt + 7.3, q.z, 0.7, 1.2, 0.7);
    }
    L.add(GEO.caixa, MAT.lava, t.x + D.x * 0.65, yt + 3.6, t.z + D.z * 0.65, 1.2, 1.2, 0.05, 0, ang, Math.PI / 4);
    this.obst(t.x, t.z, 3);
  }

  // O vulcão gigante no fundo, com cascatas de lava
  fundo() {
    const p = this.ponto(S_VULCAO, 0), y = this.y(p.x, p.z);
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
    for (let s = 40; s < this.t.sInicio - 14; s += 9) for (const lado of [-1, 1]) {
      const p = this.ponto(s, lado * 5);
      if (this.obstaculos.some((o) => Math.hypot(o.x - p.x, o.z - p.z) < o.r + 1)) continue;
      this.braseiro(p.x, p.z, 1.3);
    }
  }

  fogueira(p) {
    const y = this.y(p.x, p.z);
    for (let i = 0; i < 6; i++) this.lote.add(GEO.dode, MAT.basalto, p.x + Math.cos(i) * 4.4, y + 0.15, p.z + Math.sin(i) * 4.4, 0.4, 0.3, 0.4);
  }

  // ---------- clima: cinzas caindo, brasas subindo e fumaça ----------
  criarParticulas() {
    super.criarParticulas();
    this.fumacas = [];
    for (const f of [...this.chamines, this.bocaVulcao]) for (let k = 0; k < 4; k++) {
      const grande = f === this.bocaVulcao;
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(grande ? 3 : 0.6, 0), new THREE.MeshLambertMaterial({ color: '#5a5050', transparent: true, opacity: 0.6, flatShading: true }));
      this.cena.add(m);
      this.fumacas.push({ m, f, fase: k / 4, alt: grande ? 22 : 5 });
    }
  }
  moverParticula(a, k, i, dt, t) {
    const brasa = i % 6 < 3;
    a[k + 1] += (brasa ? 1.6 + (i % 4) * 0.4 : -0.8) * dt;
    a[k] += Math.sin(t * 1.5 + i) * 0.6 * dt;
  }
  atualizarExtras(dt, t) {
    for (const fu of this.fumacas) {
      const k = (t * (fu.alt > 10 ? 0.08 : 0.25) + fu.fase) % 1;
      fu.m.position.set(fu.f.x + Math.sin(k * 6 + fu.fase * 9) * 0.6, fu.f.y + k * fu.alt, fu.f.z);
      fu.m.scale.setScalar(0.6 + k * 1.6);
      fu.m.material.opacity = 0.6 * (1 - k);
    }
  }
}
