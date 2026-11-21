// =============================================================
// TRILHA ANCESTRAL (dungeon aberta da Floresta) + ambientação da Floresta
// Sai da borda do mapa pela Floresta (direção pela semente do mapa).
// A parte comum (portões, acampamentos, soltos, chefe, clima) fica em dungeon.js.
// Aqui fica o cenário:
//  Etapa 1 · Bosque dos Cogumelos  — cogumelos gigantes, troncos caídos, flores que brilham
//  Etapa 2 · Ruínas de Musgo       — muros, colunas, arcos e uma cabeça de pedra gigante
//  Etapa 3 · Lago Escondido        — o chão afunda num lago; só se atravessa pela ponte de madeira
//  Etapa 4 · Raízes Gigantes       — árvores enormes, raízes em arco e cipós
//  Fim     · Santuário da Árvore-Mãe, com o chefe super raro Silvárion
// E na Floresta do mapa principal: árvores gigantes, ruínas, cogumelos,
// flores brilhantes, vaga-lumes à noite, um lago escondido e mais monstros.
// =============================================================
import * as THREE from 'three';
import { DungeonAberta, RAIZES, S_LAGO, LARG_LAGO, GEO, Bloco, desbotar, lambert } from './dungeon.js';
import { LAGOA, PONTOS_FLORESTA, CENTRO_FLORESTA } from './mapa/gerador.js';
import { criarModelo } from './modelos.js';
import { PERIODO_DA_LINHA, criarMonstro, statsDe, niveisDaEtapa } from './dados.js';

const brilha = (cor, k = 0.8) => lambert(cor, { emissive: cor, emissiveIntensity: k });
const MAT = {
  casca: lambert('#5a3a24'),
  cascaEsc: lambert('#3e2818'),
  musgo: lambert('#3f8f3a'),
  musgoEsc: lambert('#2c6a2e'),
  folha: lambert('#2f7a3a'),
  folhaClara: lambert('#4ea64a'),
  folhaEsc: lambert('#1f5a2a'),
  pinheiro: lambert('#1d4a28'),
  pedra: lambert('#7a8a72'),
  ruina: lambert('#8f9a86'),
  cogPe: lambert('#efe4cc'),
  cogVerm: lambert('#d8483a'),
  cogRoxo: lambert('#8a5ad8'),
  pinta: lambert('#fff6e0'),
  cogBrilho: brilha('#5affd8', 0.7),
  florAmarela: brilha('#ffe14a', 0.8),
  florRosa: brilha('#ff7eb6', 0.7),
  florAzul: brilha('#7ac8ff', 0.7),
  jade: brilha('#1fe0a0', 0.9),
  lanterna: brilha('#d8ff7a', 0.9),
  cipo: lambert('#3a6a2a'),
  madeira: lambert('#7a5232'),
  madeiraEsc: lambert('#5a3a22'),
  folhaSeca: lambert('#a8743f'),
  junco: lambert('#6a8a3a'),
  espuma: lambert('#e8fbff', { emissive: '#a8e8ff', emissiveIntensity: 0.3 }),
  agua: new THREE.MeshLambertMaterial({ color: '#3aa8b8', transparent: true, opacity: 0.78, emissive: '#0a4a5a', emissiveIntensity: 0.35, flatShading: true }),
};
const FLORES = [MAT.florAmarela, MAT.florRosa, MAT.florAzul];
const S_ARVORE_MAE = 214;

// ---------- lugares fixos da Floresta (o mapa principal não põe árvores comuns aqui) ----------
// Calculados pelo gerador do mapa, em volta do centro da Floresta (mudam com a semente)
export { LAGOA };
export const CLAREIRAS = PONTOS_FLORESTA.clareiras; // acampamentos da Floresta
const GIGANTES = PONTOS_FLORESTA.gigantes.map((g) => [g.x, g.z, g.e]);
const RUINA = PONTOS_FLORESTA.ruina;
// Um cristal escondido na ponta do píer do lago
export const CRISTAL_ESCONDIDO = { x: LAGOA.x + LAGOA.r + 1.3, z: LAGOA.z };
const CF = CENTRO_FLORESTA;
const MAX_EXTRAS_FLORESTA = 6; // monstros a mais na Floresta quando você está nela

export class TrilhaAncestral extends DungeonAberta {
  constructor(mundo, alturaEm) {
    super(mundo, alturaEm, RAIZES, 7171);
  }
  get corCeu() { return new THREE.Color('#1f3a2c'); }
  get corHemi() { return new THREE.Color('#bfffd8'); }
  // vaga-lumes (amarelos) e folhas caindo
  get paletaParticulas() { return ['#d8ff7a', '#4ea64a', '#9fd35a', '#f0ff9a', '#e0a040', '#2f7a3a']; }
  get tamParticula() { return 0.26; }

  // Ângulos para girar uma peça: o eixo X dela fica ao longo do caminho (angS) ou de lado (angL)
  get angS() { return Math.atan2(-this.t.dir.z, this.t.dir.x); }
  get angL() { return Math.atan2(-this.t.perp.z, this.t.perp.x); }

  construir() {
    this.gigantes = [];
    this.timerExtra = 0;
    super.construir();
  }

  // Portão: dois troncos com uma raiz em arco por cima, cipós e uma flor-lanterna
  pecasPortao(L, s, doChefe) {
    const T = this.t, h = doChefe ? 7.2 : 5.8, abre = doChefe ? 5 : 4.4, rng = this.rng;
    const luz = doChefe ? MAT.jade : MAT.lanterna;
    for (const lado of [-1, 1]) {
      const p = this.ponto(s, lado * abre), y = this.y(p.x, p.z);
      L.add(GEO.cil, MAT.casca, p.x, y + h / 2, p.z, 1.5, h, 1.5);
      L.add(GEO.cone, MAT.cascaEsc, p.x, y + 0.6, p.z, 2.6, 1.4, 2.6);
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1 + lado;
        L.add(GEO.cone4, MAT.casca, p.x + Math.cos(a) * 0.9, y + 0.3, p.z + Math.sin(a) * 0.9, 0.5, 1.6, 0.5, Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1);
      }
      L.add(GEO.ico, MAT.folhaEsc, p.x, y + h + 0.7, p.z, 3.2, 2.4, 3.2, 0, lado, 0);
      L.add(GEO.ico, MAT.musgo, p.x, y + h * 0.35, p.z, 1.45, 0.6, 1.45);
      const q = this.ponto(s, lado * (abre - 0.8));
      L.add(GEO.ico, luz, q.x, y + 2.3, q.z, 0.45, 0.6, 0.45);
      this.obst(p.x, p.z, 1.2);
      // moitas fechando do portão até a parede
      for (let k = abre + 2; k < T.largura - 1; k += 2) {
        const m = this.ponto(s, lado * k);
        L.add(GEO.ico, MAT.musgoEsc, m.x, this.y(m.x, m.z) + 1, m.z, 2.8, 2.4 + Math.sin(k) * 0.5, 2.6, 0, k, 0);
        this.obst(m.x, m.z, 1.1);
      }
    }
    const c = this.ponto(s, 0), a = this.ponto(s, -abre), b = this.ponto(s, abre);
    const yv = Math.max(this.y(a.x, a.z), this.y(b.x, b.z)) + h - 0.6, alt = abre * 0.45;
    L.add(GEO.arco, MAT.casca, c.x, yv, c.z, abre, alt, 2.2, 0, this.angL, 0);
    for (let i = -3; i <= 3; i++) { // cipós pendurados no arco
      const lat = (i / 4) * abre, q = this.ponto(s, lat), comp = 1.2 + rng() * 1.8;
      const topo = yv + Math.sqrt(Math.max(0, 1 - (lat / abre) ** 2)) * alt;
      L.add(GEO.caixa, MAT.cipo, q.x, topo - comp / 2, q.z, 0.09, comp, 0.09);
      if (i % 2 === 0) L.add(GEO.ico, FLORES[(i + 3) % 3], q.x, topo - comp, q.z, 0.22, 0.22, 0.22);
    }
    L.add(GEO.ico, luz, c.x, yv + alt + 0.45, c.z, 0.8, 0.8, 0.8);
  }

  // Lanternas de flor dos dois lados, pedras de musgo no meio e paredes de pinheiros
  caminho() {
    const T = this.t, L = this.lote, rng = this.rng;
    for (let s = T.sInicio - 14; s < T.sFim; s += 7) for (const lado of [-1, 1]) {
      const p = this.ponto(s, lado * (T.largura - 3.2));
      this.lanterna(p.x, p.z, 1.7);
    }
    for (let s = T.sInicio - 20; s < T.sFim + 4; s += 1.8) {
      if (Math.abs(s - S_LAGO) < 5.5) continue; // ali é a ponte
      const p = this.ponto(s, (rng() - 0.5) * 2.2);
      L.add(GEO.caixa, rng() < 0.4 ? MAT.musgoEsc : MAT.pedra, p.x, this.y(p.x, p.z) + 0.02, p.z, 1 + rng() * 0.6, 0.08, 0.9 + rng() * 0.5, 0, rng() * 3, 0);
    }
    // folhas secas no chão (só visual)
    for (let i = 0; i < 160; i++) {
      const s = T.sInicio - 16 + rng() * (T.sFim - T.sInicio + 20);
      if (Math.abs(s - S_LAGO) < 5) continue;
      const p = this.ponto(s, (rng() * 2 - 1) * (T.largura - 2.5));
      L.add(GEO.caixa, rng() < 0.5 ? MAT.folhaSeca : MAT.folhaClara, p.x, this.y(p.x, p.z) + 0.03, p.z, 0.35, 0.03, 0.22, 0, rng() * 6, 0);
    }
    // pinheiros em cima das paredes (fazem o corredor parecer uma floresta fechada)
    for (let s = T.sMin + 2; s < T.sFim + 8; s += 4.2) for (const lado of [-1, 1]) for (let fila = 0; fila < 2; fila++) {
      const p = this.ponto(s + fila * 2, lado * (T.largura + 1.5 + fila * 4 + rng() * 2.5));
      this.pinheiro(p.x, p.z, 1 + rng() * 0.6 + fila * 0.3);
    }
    const c = T.centroChefe;
    for (let i = 0; i < 30; i++) { // em volta do Santuário
      const a = (i / 30) * Math.PI * 2, r = T.rChefe + 1.5 + rng() * 5;
      const x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r, lp = T.local(x, z);
      if (lp.s < T.sChefe - 6 && Math.abs(lp.lat) < T.largura + 1) continue;
      this.pinheiro(x, z, 1.2 + rng() * 0.6);
    }
  }

  pinheiro(x, z, esc) {
    const L = this.lote, y = this.y(x, z);
    L.add(GEO.cil, MAT.cascaEsc, x, y + 0.8 * esc, z, 0.6 * esc, 1.6 * esc, 0.6 * esc);
    for (let k = 0; k < 3; k++) L.add(GEO.cone, k === 1 ? MAT.folhaEsc : MAT.pinheiro, x, y + (2 + k * 1.3) * esc, z, (3.4 - k * 0.8) * esc, 2.4 * esc, (3.4 - k * 0.8) * esc, 0, k, 0);
  }

  lanterna(x, z, alt) {
    const L = this.lote, y = this.y(x, z);
    L.add(GEO.cilFino, MAT.madeiraEsc, x, y + alt / 2, z, 0.3, alt, 0.3);
    L.add(GEO.ico, MAT.lanterna, x, y + alt + 0.25, z, 0.55, 0.7, 0.55);
    L.add(GEO.cone, MAT.folha, x, y + alt + 0.75, z, 0.9, 0.5, 0.9);
    this.obst(x, z, 0.4);
  }

  etapa(e) { [this.etapa1, this.etapa2, this.etapa3, this.etapa4][e].call(this); }

  // ---------- peças da floresta (usadas na dungeon e na região) ----------
  cogumeloGigante(L, x, z, esc, colide = true) {
    // baixos o bastante para não tampar a câmera (que fica no alto, atrás de você)
    const rng = this.rng, y = this.y(x, z), h = (1.8 + rng() * 1.3) * esc, rC = (1.4 + rng() * 0.8) * esc;
    L.add(GEO.cil, MAT.cogPe, x, y + h / 2, z, 0.9 * esc, h, 0.9 * esc, (rng() - 0.5) * 0.12, 0, (rng() - 0.5) * 0.12);
    L.add(GEO.cil, MAT.cogPe, x, y + h * 0.62, z, 1.35 * esc, 0.12, 1.35 * esc); // anel do pé
    L.add(GEO.chapeu, rng() < 0.6 ? MAT.cogVerm : MAT.cogRoxo, x, y + h - 0.1, z, rC, rC * 0.55, rC, 0, rng() * 6, 0);
    for (let k = 0; k < 6; k++) { // pintas
      const a = (k / 6) * Math.PI * 2 + rng(), r = rC * (0.35 + rng() * 0.4);
      L.add(GEO.ico, MAT.pinta, x + Math.cos(a) * r, y + h - 0.1 + Math.sqrt(1 - (r / rC) ** 2) * rC * 0.55, z + Math.sin(a) * r, 0.35 * esc, 0.12, 0.35 * esc);
    }
    if (colide) this.obst(x, z, 0.6 * esc);
  }
  cogumelinhos(L, x, z, n = 3) {
    const rng = this.rng;
    for (let k = 0; k < n; k++) {
      const px = x + (rng() - 0.5) * 1.4, pz = z + (rng() - 0.5) * 1.4, y = this.y(px, pz), h = 0.25 + rng() * 0.35;
      L.add(GEO.cilFino, MAT.cogPe, px, y + h / 2, pz, 0.12, h, 0.12);
      L.add(GEO.chapeu, MAT.cogBrilho, px, y + h, pz, 0.22 + rng() * 0.12, 0.16, 0.22 + rng() * 0.12);
    }
  }
  flor(L, x, z) {
    const y = this.y(x, z), h = 0.3 + this.rng() * 0.4;
    L.add(GEO.cilFino, MAT.cipo, x, y + h / 2, z, 0.06, h, 0.06);
    L.add(GEO.ico, FLORES[Math.floor(this.rng() * 3)], x, y + h + 0.06, z, 0.26, 0.2, 0.26, 0, this.rng() * 6, 0);
  }
  troncoCaido(L, x, z, esc = 1) {
    const rng = this.rng, y = this.y(x, z), r = rng() * Math.PI, comp = (3.5 + rng() * 2) * esc;
    L.add(GEO.cil, MAT.casca, x, y + 0.45 * esc, z, 1.1 * esc, comp, 1.1 * esc, 0, r, Math.PI / 2);
    L.add(GEO.caixa, MAT.musgo, x, y + 0.95 * esc, z, comp * 0.7, 0.14, 0.7 * esc, 0, r, 0);
    for (const k of [-1, 1]) {
      const px = x + Math.cos(r) * k * comp * 0.3, pz = z - Math.sin(r) * k * comp * 0.3;
      this.obst(px, pz, 0.75 * esc);
    }
    this.cogumelinhos(L, x + Math.sin(r) * 0.9, z + Math.cos(r) * 0.9, 2);
  }
  pedraMusgo(L, x, z, esc) {
    const y = this.y(x, z);
    L.add(GEO.dode, MAT.pedra, x, y + 0.25 * esc, z, esc * 1.3, esc * 0.9, esc * 1.2, this.rng(), this.rng() * 6, this.rng() * 0.4);
    L.add(GEO.ico, MAT.musgo, x, y + 0.7 * esc, z, esc * 1.05, esc * 0.35, esc, 0, this.rng() * 6, 0);
    this.obst(x, z, 0.75 * esc);
  }
  coluna(L, x, z, h, caida = false) {
    const y = this.y(x, z);
    if (caida) {
      const r = this.rng() * 3;
      L.add(GEO.cil, MAT.ruina, x, y + 0.4, z, 0.8, h, 0.8, 0, r, Math.PI / 2);
      L.add(GEO.caixa, MAT.musgo, x, y + 0.82, z, h * 0.6, 0.1, 0.5, 0, r, 0);
      this.obst(x, z, h * 0.35);
      return;
    }
    L.add(GEO.cil, MAT.ruina, x, y + h / 2, z, 0.8, h, 0.8);
    L.add(GEO.caixa, MAT.ruina, x, y + h + 0.15, z, 1.1, 0.3, 1.1, 0, this.rng(), 0);
    L.add(GEO.ico, MAT.musgo, x, y + h + 0.38, z, 1.1, 0.35, 1.1);
    const comp = 0.8 + this.rng() * 1.5; // cipó descendo da coluna
    L.add(GEO.caixa, MAT.cipo, x + 0.42, y + h - comp / 2, z, 0.07, comp, 0.07);
    this.obst(x, z, 0.55);
  }
  // Árvore gigante: fica num bloco próprio que fica transparente quando tampa a câmera
  arvoreGigante(x, z, esc) {
    const rng = this.rng, b = new Bloco(), y = this.y(x, z), h = 9 * esc, r = 1.7 * esc;
    const copaA = rng() < 0.5 ? MAT.folha : MAT.folhaEsc, copaB = rng() < 0.5 ? MAT.folhaClara : MAT.folha;
    b.add(GEO.cil, MAT.casca, x, y + h / 2, z, r * 2, h, r * 2);
    b.add(GEO.cone, MAT.casca, x, y + 1 * esc, z, r * 3.6, 2 * esc, r * 3.6);
    const giro = rng() * 6;
    for (let i = 0; i < 5; i++) { // raízes em arco saindo do tronco
      const a = (i / 5) * Math.PI * 2 + giro, d = r * 1.5;
      b.add(GEO.arco, MAT.casca, x + Math.cos(a) * d, y - 0.25, z + Math.sin(a) * d, 1.9 * esc, 1.2 * esc, 1.3 * esc, 0, -a, 0);
    }
    for (let i = 0; i < 3; i++) { // galhos
      const a = (i / 3) * Math.PI * 2 + giro + 0.5;
      b.add(GEO.cilFino, MAT.casca, x + Math.cos(a) * 1.6 * esc, y + h - 0.4, z + Math.sin(a) * 1.6 * esc, 0.9 * esc, 3.6 * esc, 0.9 * esc, Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    }
    b.add(GEO.ico, copaA, x, y + h + 1.8 * esc, z, 6.6 * esc, 4.6 * esc, 6.6 * esc, 0, giro, 0);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + giro;
      b.add(GEO.ico, i % 2 ? copaA : copaB, x + Math.cos(a) * 3.4 * esc, y + h + 0.4 * esc, z + Math.sin(a) * 3.4 * esc, 4.6 * esc, 3.4 * esc, 4.6 * esc, 0, a, 0);
    }
    for (let i = 0; i < 9; i++) { // cipós pendurados e frutos brilhantes
      const a = rng() * Math.PI * 2, d = (2.4 + rng() * 2.4) * esc, comp = (2.5 + rng() * 3) * esc;
      const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, topo = y + h - 0.2 * esc;
      b.add(GEO.caixa, MAT.cipo, px, topo - comp / 2, pz, 0.1, comp, 0.1);
      if (i % 2 === 0) b.add(GEO.ico, MAT.jade, px, topo - comp, pz, 0.3, 0.38, 0.3);
    }
    const blk = b.montar(this.cena);
    blk.x = x; blk.z = z; blk.alcance = 7 * esc;
    this.gigantes.push(blk);
    this.obst(x, z, r * 1.15);
  }

  // Etapa 1: Bosque dos Cogumelos
  etapa1() {
    const L = this.lote;
    for (let i = 0; i < 11; i++) { const p = this.lugarNaEtapa(0, 4.5, 2.2); if (p) this.cogumeloGigante(L, p.x, p.z, 0.85 + this.rng() * 0.35); }
    for (let i = 0; i < 3; i++) { const p = this.lugarNaEtapa(0, 5, 2.5); if (p) this.troncoCaido(L, p.x, p.z); }
    for (let i = 0; i < 16; i++) { const p = this.lugarNaEtapa(0, 3, 0.6); if (p) this.cogumelinhos(L, p.x, p.z, 3 + Math.floor(this.rng() * 3)); }
    for (let i = 0; i < 22; i++) { const p = this.lugarNaEtapa(0, 2.5, 0.4); if (p) this.flor(L, p.x, p.z); }
  }

  // Etapa 2: Ruínas de Musgo
  etapa2() {
    const L = this.lote, rng = this.rng, s0 = this.sEtapa(1);
    for (let i = 0; i < 7; i++) { // muros quebrados cobertos de musgo
      const p = this.lugarNaEtapa(1, 5, 1.8); if (!p) continue;
      const y = this.y(p.x, p.z), r = rng() * 3, comp = 2 + rng() * 2.5, alt = 0.8 + rng() * 1.6;
      L.add(GEO.caixa, MAT.ruina, p.x, y + alt / 2, p.z, comp, alt, 0.7, 0, r, 0);
      L.add(GEO.caixa, MAT.musgo, p.x, y + alt + 0.06, p.z, comp * 1.02, 0.14, 0.8, 0, r, 0);
      L.add(GEO.caixa, MAT.ruina, p.x + Math.cos(r) * comp * 0.3, y + alt + 0.3, p.z - Math.sin(r) * comp * 0.3, comp * 0.35, 0.5, 0.7, 0, r, 0.2);
      this.obst(p.x, p.z, comp * 0.45);
    }
    for (let i = 0; i < 7; i++) {
      const p = this.lugarNaEtapa(1, 4, 1.2); if (!p) continue;
      this.coluna(L, p.x, p.z, 1.6 + rng() * 2.8, i % 3 === 2);
    }
    // dois arcos antigos ao lado do caminho
    for (const lado of [-1, 1]) {
      const k = lado < 0 ? 6 : 14, ys = [];
      for (const d of [-1.7, 1.7]) {
        const q = this.ponto(s0 + k + d, lado * 8.5), y = this.y(q.x, q.z);
        ys.push(y);
        L.add(GEO.caixa, MAT.ruina, q.x, y + 1.6, q.z, 0.9, 3.2, 0.9);
        this.obst(q.x, q.z, 0.7);
      }
      const c = this.ponto(s0 + k, lado * 8.5), yt = Math.max(...ys) + 3.4;
      L.add(GEO.caixa, MAT.ruina, c.x, yt, c.z, 4.6, 0.6, 1, 0, this.angS, 0);
      L.add(GEO.caixa, MAT.musgo, c.x, yt + 0.36, c.z, 4.7, 0.14, 1.1, 0, this.angS, 0);
      L.add(GEO.caixa, MAT.cipo, c.x, yt - 1, c.z, 0.08, 1.6, 0.08);
    }
    // cabeça de pedra gigante, meio enterrada, com olhos de jade
    const p = this.ponto(s0 + 10, -9.5), y = this.y(p.x, p.z), D = this.t.perp;
    L.add(GEO.dode, MAT.ruina, p.x, y + 1, p.z, 3.4, 3, 3.2, 0.1, 0.4, 0);
    L.add(GEO.ico, MAT.musgo, p.x, y + 2.6, p.z, 3, 0.9, 2.8);
    for (const o of [-1, 1]) {
      const ox = p.x + D.x * 1.6 + this.t.dir.x * o * 0.7, oz = p.z + D.z * 1.6 + this.t.dir.z * o * 0.7;
      L.add(GEO.ico, MAT.jade, ox, y + 1.6, oz, 0.35, 0.25, 0.35);
    }
    this.obst(p.x, p.z, 2);
    for (let i = 0; i < 14; i++) { const q = this.lugarNaEtapa(1, 2.5, 0.4); if (q) this.flor(L, q.x, q.z); }
    for (let i = 0; i < 4; i++) { const q = this.lugarNaEtapa(1, 4, 1.2); if (q) this.pedraMusgo(L, q.x, q.z, 0.7 + rng() * 0.6); }
  }

  // Etapa 3: Lago Escondido — atravessa o caminho; só a ponte de madeira passa
  etapa3() {
    const T = this.t, L = this.lote, rng = this.rng, yA = T.yAgua;
    const c = this.ponto(S_LAGO, 0);
    L.add(GEO.caixa, MAT.agua, c.x, yA, c.z, 2 * (LARG_LAGO + 2.2), 0.06, 2 * (T.largura + 4), 0, this.angS, 0);
    // a água bloqueia (menos na ponte): a regra fica em RAIZES.empurrar, no dungeon.js
    // ponte de tábuas com corrimão
    for (let k = -5.4; k <= 5.4; k += 0.6) {
      const q = this.ponto(S_LAGO + k, 0), y = this.y(q.x, q.z);
      L.add(GEO.caixa, (Math.round(k / 0.6) % 3) ? MAT.madeira : MAT.madeiraEsc, q.x, y + 0.03, q.z, 0.5, 0.12, 3.4, 0, this.angS + (rng() - 0.5) * 0.04, 0);
    }
    for (const lado of [-1, 1]) {
      for (const k of [-5.2, -2.6, 0, 2.6, 5.2]) {
        const q = this.ponto(S_LAGO + k, lado * 1.75), y = this.y(q.x, q.z);
        L.add(GEO.cilFino, MAT.madeiraEsc, q.x, y + 0.55, q.z, 0.22, 1.1, 0.22);
      }
      const m = this.ponto(S_LAGO, lado * 1.75);
      L.add(GEO.caixa, MAT.madeira, m.x, this.y(m.x, m.z) + 1.05, m.z, 10.6, 0.1, 0.12, 0, this.angS, 0);
    }
    // vitórias-régias, flores de lótus, juncos e pedras na margem
    for (let i = 0; i < 18; i++) {
      const s = S_LAGO + (rng() * 2 - 1) * LARG_LAGO, lat = (rng() < 0.5 ? -1 : 1) * (3.4 + rng() * (T.largura - 4.5));
      const q = this.ponto(s, lat), r = 0.5 + rng() * 0.5;
      L.add(GEO.cil, MAT.folhaClara, q.x, yA + 0.05, q.z, r * 2, 0.05, r * 2);
      if (i % 3 === 0) L.add(GEO.ico, MAT.florRosa, q.x, yA + 0.2, q.z, 0.3, 0.22, 0.3);
    }
    for (const lado of [-1, 1]) for (const bordaS of [-1, 1]) for (let i = 0; i < 6; i++) {
      const s = S_LAGO + bordaS * (LARG_LAGO + 1 + rng()), lat = lado * (3 + rng() * (T.largura - 4));
      const q = this.ponto(s, lat), y = Math.max(this.y(q.x, q.z), yA);
      for (let k = 0; k < 3; k++) L.add(GEO.cone4, MAT.junco, q.x + (rng() - 0.5) * 0.6, y + 0.5, q.z + (rng() - 0.5) * 0.6, 0.1, 1 + rng() * 0.6, 0.1, (rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.3);
    }
    // cachoeiras descendo das paredes
    for (const lado of [-1, 1]) {
      const q = this.ponto(S_LAGO + lado * 1.2, lado * (T.largura + 1.2)), alt = 6 + lado;
      L.add(GEO.caixa, MAT.agua, q.x, yA + alt / 2, q.z, 2.2, alt, 0.5, 0, this.angL + Math.PI / 2, 0);
      L.add(GEO.ico, MAT.espuma, q.x, yA + 0.15, q.z, 1.8, 0.5, 1.6);
    }
    for (let i = 0; i < 6; i++) { const q = this.lugarNaEtapa(2, 4, 1.4); if (q) this.pedraMusgo(L, q.x, q.z, 0.6 + rng() * 0.6); }
    for (let i = 0; i < 12; i++) { const q = this.lugarNaEtapa(2, 2.5, 0.4, (s) => Math.abs(s - S_LAGO) > LARG_LAGO + 2.5); if (q) this.flor(L, q.x, q.z); }
    for (let i = 0; i < 4; i++) { const q = this.lugarNaEtapa(2, 5, 2.2, (s) => Math.abs(s - S_LAGO) > LARG_LAGO + 4); if (q) this.cogumeloGigante(L, q.x, q.z, 0.8); }
  }
  // na etapa do lago os acampamentos ficam longe da água
  posAcampamentos(e) { return e === 2 ? [[16.5, 0.5]] : [[10, 0]]; }

  // Etapa 4: Raízes Gigantes — árvores enormes, raízes em arco por cima do chão e cipós
  etapa4() {
    const L = this.lote, rng = this.rng, s0 = this.sEtapa(3);
    for (const [k, lat] of [[4, -8.5], [10, 8.5], [16, -8]]) {
      const p = this.ponto(s0 + k, lat);
      this.arvoreGigante(p.x, p.z, 0.95 + rng() * 0.15);
    }
    for (let i = 0; i < 6; i++) { // raízes em arco ao lado do caminho
      const lado = i % 2 ? 1 : -1, s = s0 + 3 + i * 2.8, lat = lado * (4.5 + rng() * 2.5);
      const p = this.ponto(s, lat), y = this.y(p.x, p.z);
      if (this.obstaculos.some((o) => Math.hypot(o.x - p.x, o.z - p.z) < o.r + 2.5)) continue;
      L.add(GEO.arco, MAT.casca, p.x, y - 0.3, p.z, 3, 2.2, 1.8, 0, this.angS, 0);
      for (const d of [-2.7, 2.7]) { const q = this.ponto(s + d, lat); this.obst(q.x, q.z, 0.8); }
    }
    for (let i = 0; i < 10; i++) { // raízes baixas atravessando o chão (dá para passar por cima)
      const p = this.ponto(s0 + 1 + rng() * 18, (rng() - 0.5) * 6);
      L.add(GEO.arco, MAT.cascaEsc, p.x, this.y(p.x, p.z) - 0.15, p.z, 1.8, 0.45, 1, 0, this.angL + (rng() - 0.5) * 0.8, 0);
    }
    for (let i = 0; i < 18; i++) { const q = this.lugarNaEtapa(3, 2.5, 0.4); if (q) this.flor(L, q.x, q.z); }
    for (let i = 0; i < 8; i++) { const q = this.lugarNaEtapa(3, 3, 0.6); if (q) this.cogumelinhos(L, q.x, q.z, 3); }
  }

  // Santuário da Árvore-Mãe: chão de pedra com musgo, anel de flores, pedras com runas e o altar
  fim() {
    const T = this.t, L = this.lote, c = T.centroChefe, y = this.y(c.x, c.z), rng = this.rng;
    L.add(GEO.cil, MAT.pedra, c.x, y - 0.15, c.z, 24, 0.4, 24);
    L.add(GEO.cil, MAT.musgoEsc, c.x, y - 0.1, c.z, 17, 0.42, 17);
    for (let i = 0; i < 36; i++) { // anel de flores e cogumelos brilhantes
      const a = (i / 36) * Math.PI * 2, r = 9.6 + (i % 2) * 0.5;
      L.add(GEO.ico, i % 3 === 0 ? MAT.jade : FLORES[i % 3], c.x + Math.cos(a) * r, y + 0.2, c.z + Math.sin(a) * r, 0.32, 0.26, 0.32);
    }
    for (let i = 0; i < 9; i++) { // menires com runas de jade
      const a = (i / 9) * Math.PI * 2 + 0.2, r = T.rChefe - 3.5;
      const x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
      const lp = T.local(x, z);
      if (lp.s < T.sChefe - 8 && Math.abs(lp.lat) < 6) continue; // deixa a entrada livre
      const h = 3.6 + (i % 3) * 1, inc = (rng() - 0.5) * 0.15;
      L.add(GEO.caixa, MAT.ruina, x, y + h / 2, z, 1.2, h, 0.8, inc, -a, inc);
      L.add(GEO.ico, MAT.musgo, x, y + h + 0.1, z, 1.1, 0.4, 0.8);
      L.add(GEO.caixa, MAT.jade, x - Math.cos(a) * 0.42, y + h * 0.55, z - Math.sin(a) * 0.42, 0.5, h * 0.45, 0.5, 0, -a, 0);
      this.obst(x, z, 0.9);
    }
    // altar atrás do chefe, emoldurado por duas raízes e com cristais de jade
    const t = this.ponto(T.sChefe + 8, 0), yt = this.y(t.x, t.z);
    L.add(GEO.caixa, MAT.pedra, t.x, yt + 0.6, t.z, 6, 1.2, 3.4, 0, this.angL, 0);
    L.add(GEO.caixa, MAT.musgo, t.x, yt + 1.25, t.z, 6.1, 0.14, 3.5, 0, this.angL, 0);
    L.add(GEO.arco, MAT.casca, t.x, yt + 0.8, t.z, 4, 4.4, 2, 0, this.angL, 0);
    for (let k = 0; k < 5; k++) {
      const q = this.ponto(T.sChefe + 8 + (rng() - 0.5) * 1.6, (k - 2) * 1.1);
      L.add(GEO.cone4, MAT.jade, q.x, yt + 2, q.z, 0.5, 1.2 + rng() * 1.4, 0.5, (rng() - 0.5) * 0.4, rng(), (rng() - 0.5) * 0.4);
    }
    this.obst(t.x, t.z, 3);
    for (let i = 0; i < 10; i++) { // cogumelinhos espalhados pelo chão
      const a = rng() * Math.PI * 2, r = 4 + rng() * 9;
      this.cogumelinhos(L, c.x + Math.cos(a) * r, c.z + Math.sin(a) * r, 2);
    }
    for (let i = 0; i < 26; i++) { // samambaias e raízes baixas no chão do Santuário
      const a = rng() * Math.PI * 2, r = 3 + rng() * 11, x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
      if (i % 3 === 0) L.add(GEO.arco, MAT.cascaEsc, x, y - 0.15, z, 1.6, 0.4, 1, 0, rng() * 6, 0);
      else for (let k = 0; k < 4; k++) L.add(GEO.cone4, k % 2 ? MAT.folhaClara : MAT.folha, x, y + 0.3, z, 0.25, 0.9, 0.5, 0.9, (k / 4) * Math.PI * 2 + rng(), 0);
    }
  }

  // A Árvore-Mãe no fundo: tronco enorme, raízes e copa que cobre o Santuário
  fundo() {
    const p = this.ponto(S_ARVORE_MAE, 0), y = this.y(p.x, p.z) - 2;
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 9, 36, 10), MAT.casca);
    tronco.position.set(p.x, y + 18, p.z);
    this.cena.add(tronco);
    const L = this.lote, rng = this.rng;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      L.add(GEO.arco, MAT.casca, p.x + Math.cos(a) * 9, y + 1, p.z + Math.sin(a) * 9, 6, 5, 3.5, 0, -a, 0);
    }
    const cores = [MAT.folhaEsc, MAT.folha, MAT.folhaClara];
    L.add(GEO.ico, MAT.folha, p.x, y + 44, p.z, 26, 15, 26);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3, d = 14 + rng() * 6;
      L.add(GEO.ico, cores[i % 3], p.x + Math.cos(a) * d, y + 36 + rng() * 6, p.z + Math.sin(a) * d, 17, 11, 17, 0, a, 0);
    }
    this.orbes = [];
    for (let i = 0; i < 16; i++) { // frutos de jade pendurados
      const a = rng() * Math.PI * 2, d = 8 + rng() * 14, comp = 3 + rng() * 6;
      const x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d, topo = y + 32;
      L.add(GEO.caixa, MAT.cipo, x, topo - comp / 2, z, 0.18, comp, 0.18);
      L.add(GEO.ico, MAT.jade, x, topo - comp, z, 0.9, 1.1, 0.9);
    }
  }

  // Lanternas guiando da Floresta até a entrada, e a ambientação da região
  estradaDeFora() {
    for (let s = 40; s < this.t.sInicio - 14; s += 8) for (const lado of [-1, 1]) {
      const p = this.ponto(s, lado * 5);
      if (this.obstaculos.some((o) => Math.hypot(o.x - p.x, o.z - p.z) < o.r + 1)) continue;
      this.lanterna(p.x, p.z, 1.4);
    }
    this.decorarRegiao();
  }

  fogueira(p) {
    // anel de cogumelos brilhantes em volta do acampamento
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      this.cogumelinhos(this.lote, p.x + Math.cos(a) * 4.6, p.z + Math.sin(a) * 4.6, 2);
    }
  }

  // ---------- a Floresta do mapa principal ----------
  decorarRegiao() {
    const m = this.m, L = this.lote, rng = this.rng;
    const naFloresta = (x, z, folga) => m.zona(x, z) === 'planta' && m.pontoLivre(x, z, folga);
    const sortearPonto = (folga) => {
      for (let t = 0; t < 80; t++) {
        const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 36;
        const x = CF.x + Math.cos(a) * r, z = CF.z + Math.sin(a) * r;
        if (naFloresta(x, z, folga)) return { x, z };
      }
      return null;
    };
    for (const [x, z, e] of GIGANTES) this.arvoreGigante(x, z, e);
    // ruína com arco e colunas
    {
      const { x, z } = RUINA, y = this.y(x, z);
      for (const d of [-2, 2]) { L.add(GEO.caixa, MAT.ruina, x + d, y + 1.7, z, 0.9, 3.4, 0.9); this.obst(x + d, z, 0.7); }
      L.add(GEO.caixa, MAT.ruina, x, y + 3.65, z, 5.2, 0.6, 1);
      L.add(GEO.caixa, MAT.musgo, x, y + 4.02, z, 5.3, 0.14, 1.1);
      L.add(GEO.caixa, MAT.cipo, x + 1, y + 2.6, z, 0.08, 1.6, 0.08);
      L.add(GEO.caixa, MAT.cipo, x - 0.6, y + 2.9, z, 0.08, 1, 0.08);
      this.coluna(L, x - 4.2, z + 2.2, 2.6);
      this.coluna(L, x + 4.4, z - 1.8, 1.8);
      this.coluna(L, x + 3.5, z + 3.2, 3, true);
      this.pedraMusgo(L, x - 3, z - 3.5, 0.9);
      for (let i = 0; i < 6; i++) this.flor(L, x + (rng() - 0.5) * 8, z + (rng() - 0.5) * 8);
    }
    // clareiras dos acampamentos da Floresta
    for (const cl of CLAREIRAS) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        this.cogumelinhos(L, cl.x + Math.cos(a) * 6, cl.z + Math.sin(a) * 6, 2);
      }
      this.acampamentos.push({ x: cl.x, z: cl.z, etapa: 0, regiao: true, grupo: null, espera: 0 });
    }
    // o lago escondido: pedras com musgo, juncos, vitórias-régias e um píer de madeira
    {
      const { x, z, r } = LAGOA;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2 + rng() * 0.2;
        if (Math.abs(a) < 0.35 || Math.abs(a - Math.PI * 2) < 0.35) continue; // lado do píer
        const d = r + 0.8 + rng() * 0.8, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, y = this.y(px, pz);
        if (i % 2) L.add(GEO.dode, MAT.pedra, px, y + 0.2, pz, 1.1, 0.7, 1, rng(), rng() * 6, 0);
        else for (let k = 0; k < 3; k++) L.add(GEO.cone4, MAT.junco, px + (rng() - 0.5) * 0.6, y + 0.5, pz + (rng() - 0.5) * 0.6, 0.1, 1.1 + rng() * 0.6, 0.1, (rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.3);
      }
      for (let i = 0; i < 10; i++) {
        const a = rng() * Math.PI * 2, d = rng() * (r - 1.2), rr = 0.45 + rng() * 0.4;
        L.add(GEO.cil, MAT.folhaClara, x + Math.cos(a) * d, -0.5, z + Math.sin(a) * d, rr * 2, 0.05, rr * 2);
        if (i % 2 === 0) L.add(GEO.ico, i % 4 ? MAT.florRosa : MAT.florAzul, x + Math.cos(a) * d, -0.36, z + Math.sin(a) * d, 0.28, 0.2, 0.28);
      }
      const yP = -0.3; // píer de madeira entrando na água (o cristal fica no começo dele)
      for (let k = 0; k < 9; k++) L.add(GEO.caixa, k % 3 ? MAT.madeira : MAT.madeiraEsc, x + r + 0.3 - k * 0.55, yP, z, 0.48, 0.1, 1.8);
      for (const dz of [-0.85, 0.85]) for (const k of [0, 4, 8]) L.add(GEO.cilFino, MAT.madeiraEsc, x + r + 0.3 - k * 0.55, yP - 0.6, z + dz, 0.2, 1.2, 0.2);
      this.lanterna(x + r + 2.8, z + 1.6, 1.3);
    }
    // espalhados: cogumelos gigantes, troncos caídos, pedras com musgo, colunas, flores e moitas
    for (let i = 0; i < 14; i++) { const p = sortearPonto(2.4); if (p) this.cogumeloGigante(L, p.x, p.z, 0.6 + rng() * 0.5); }
    for (let i = 0; i < 6; i++) { const p = sortearPonto(3); if (p) this.troncoCaido(L, p.x, p.z, 0.85); }
    for (let i = 0; i < 9; i++) { const p = sortearPonto(1.6); if (p) this.pedraMusgo(L, p.x, p.z, 0.6 + rng() * 0.7); }
    for (let i = 0; i < 5; i++) { const p = sortearPonto(1.6); if (p) this.coluna(L, p.x, p.z, 1.4 + rng() * 2, i % 2 === 1); }
    for (let i = 0; i < 26; i++) { const p = sortearPonto(0.8); if (p) this.cogumelinhos(L, p.x, p.z, 2 + Math.floor(rng() * 3)); }
    for (let i = 0; i < 60; i++) { const p = sortearPonto(0.4); if (p) this.flor(L, p.x, p.z); }
    for (let i = 0; i < 30; i++) { // samambaias e moitas baixas (sem colisão)
      const p = sortearPonto(0.6); if (!p) continue;
      const y = this.y(p.x, p.z);
      for (let k = 0; k < 4; k++) L.add(GEO.cone4, k % 2 ? MAT.folhaClara : MAT.folha, p.x, y + 0.3, p.z, 0.25, 0.9, 0.5, 0.9, (k / 4) * Math.PI * 2 + rng(), 0);
    }
    this.criarVagalumes();
  }

  // Vaga-lumes da Floresta: só aparecem à noite
  criarVagalumes() {
    const n = 160, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 34;
      const x = CF.x + Math.cos(a) * r, z = CF.z + Math.sin(a) * r;
      pos.set([x, this.y(x, z) + 0.5 + Math.random() * 3, z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.basesVagalumes = pos.slice();
    this.vagalumes = new THREE.Points(g, new THREE.PointsMaterial({ color: '#e8ff7a', size: 0.32, transparent: true, opacity: 0, depthWrite: false }));
    this.vagalumes.visible = false;
    this.cena.add(this.vagalumes);
  }

  // Monstros a mais na Floresta (com mais formas evoluídas), perto de você
  atualizarRegiao(dt) {
    const m = this.m;
    const extras = m.selvagens.filter((s) => s.regiao === this);
    for (const s of extras) if (Math.hypot(s.x - m.pos.x, s.z - m.pos.z) > 75) m.removerSelvagem(s);
    this.timerExtra -= dt;
    if (this.timerExtra > 0) return;
    this.timerExtra = 2.5;
    if (extras.length >= MAX_EXTRAS_FLORESTA || m.zona(m.pos.x, m.pos.z) !== 'planta' || this.t.dentro(m.pos.x, m.pos.z)) return;
    for (let t = 0; t < 20; t++) {
      const a = Math.random() * Math.PI * 2, r = 18 + Math.random() * 22;
      const x = m.pos.x + Math.cos(a) * r, z = m.pos.z + Math.sin(a) * r;
      if (m.zona(x, z) !== 'planta' || !m.pontoLivre(x, z, 1) || this.t.perto(x, z)) continue;
      const escolha = m.sortearAparicao('planta');
      const { especie, nivel } = m.especieDe(escolha, Math.min(45, m.nivelSelvagem(x, z, false) + 1 + Math.round(Math.random() * 2)));
      const dados = criarMonstro(especie, nivel);
      const modelo = criarModelo(especie);
      modelo.position.set(x, this.y(x, z), z);
      this.cena.add(modelo);
      const periodo = escolha.startsWith('L:') ? PERIODO_DA_LINHA[escolha.slice(2)] || null : null;
      m.selvagens.push({ dados, modelo, regiao: this, x, z, ang: Math.random() * 6.28, estado: 'parado', t: Math.random() * 2, zona: 'planta', periodo, vel: statsDe(especie, nivel).vel * 0.45 });
      return;
    }
  }

  // Grupos das clareiras usam a arena normal da Floresta
  atualizarAcampamentos(dt) {
    const m = this.m;
    for (const a of this.acampamentos) {
      if (!a.regiao) continue;
      const d = Math.hypot(m.pos.x - a.x, m.pos.z - a.z);
      if (a.grupo && !m.grupos.includes(a.grupo)) { a.grupo = null; a.espera = 120; }
      if (a.espera > 0) { a.espera -= dt; continue; }
      if (!a.grupo && d < 45 && d > 18) a.grupo = m.spawnarGrupo({ x: a.x, z: a.z, zona: 'planta', niveis: niveisDaEtapa(m.mediaEquipe(), 0, this.id), acampamento: a });
      else if (a.grupo && d > 65) { m.removerGrupo(a.grupo, true); a.grupo = null; }
    }
    // os acampamentos da dungeon seguem a regra comum
    const todos = this.acampamentos;
    this.acampamentos = todos.filter((a) => !a.regiao);
    super.atualizarAcampamentos(dt);
    this.acampamentos = todos;
  }

  // ---------- clima ----------
  moverParticula(a, k, i, dt, t) {
    if (i % 3 === 0) { // vaga-lume: flutua devagar
      a[k] += Math.sin(t * 0.7 + i) * 0.8 * dt;
      a[k + 1] += Math.cos(t * 0.9 + i * 1.3) * 0.6 * dt;
      a[k + 2] += Math.sin(t * 0.5 + i * 2) * 0.8 * dt;
    } else { // folha: cai balançando
      a[k + 1] -= (0.6 + (i % 5) * 0.15) * dt;
      a[k] += (Math.sin(t * 1.2 + i) * 1.2 + 0.4) * dt;
      a[k + 2] += Math.cos(t * 0.8 + i) * 0.6 * dt;
    }
  }
  atualizarExtras(dt, t) {
    const m = this.m;
    // árvores gigantes ficam transparentes quando estão entre a câmera e você
    for (const g of this.gigantes) {
      const dx = g.x - m.pos.x, dz = g.z - m.pos.z;
      const tampa = dz > -2 && dz < 16 && Math.abs(dx) < g.alcance && Math.hypot(dx, dz) < 18;
      desbotar(g, tampa ? 0.22 : 1, dt);
    }
    MAT.jade.emissiveIntensity = 0.75 + Math.sin(t * 2) * 0.25;
    MAT.lanterna.emissiveIntensity = 0.6 + m.fatorNoite * 0.5;
    MAT.cogBrilho.emissiveIntensity = 0.4 + m.fatorNoite * 0.7;
    // vaga-lumes da região (à noite)
    const perto = Math.hypot(m.pos.x - CF.x, m.pos.z - CF.z) < 60;
    const op = m.fatorNoite * (perto ? 0.95 : 0);
    this.vagalumes.visible = op > 0.02;
    if (this.vagalumes.visible) {
      this.vagalumes.material.opacity = op * (0.75 + Math.sin(t * 3) * 0.25);
      const p = this.vagalumes.geometry.attributes.position, a = p.array, b = this.basesVagalumes;
      for (let i = 0; i < p.count; i++) {
        const k = i * 3;
        a[k] = b[k] + Math.sin(t * 0.6 + i) * 1.2;
        a[k + 1] = b[k + 1] + Math.sin(t * 0.9 + i * 1.7) * 0.5;
        a[k + 2] = b[k + 2] + Math.cos(t * 0.5 + i * 2.3) * 1.2;
      }
      p.needsUpdate = true;
    }
    this.atualizarRegiao(dt);
  }
}
