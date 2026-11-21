// =============================================================
// CHUNKS: o mapa em pedaços
// O mundo é dividido em quadrados (chunks). Só os chunks perto do jogador
// existem na memória; quando você anda, os novos são criados aos poucos
// (no máximo alguns milissegundos por quadro, para não travar) e os que
// ficaram longe são apagados.
// Cada chunk tem:
//  - o chão (triângulos coloridos pelo bioma, com "saias" nas bordas para
//    não aparecer fresta entre um chunk detalhado e um simples);
//  - água e lava (só onde o chão fica abaixo do nível);
//  - objetos (árvores, pedras, cactos...) desenhados em lote (InstancedMesh):
//    cada tipo de objeto é 1 desenho por chunk, não importa quantos tenha.
// LOD: os chunks longe têm o chão com menos triângulos e sem objetos pequenos.
// Etapa 5.1: as peças do Blender da Arena (js/arena/pecas.js) entram nos biomas: pinheiros na Floresta,
// pinheiros nevados e cristais de gelo na Neve, palmeiras no oásis, rochas, obeliscos e arcos de arenito
// no Deserto, rochas de lava, espinhos de basalto e árvores queimadas na Lava. As peças de cada chunk
// viram poucas malhas (uma por material, com LotePecas), o que deixa leve no celular.
// A decoração usa números aleatórios com semente: o chunk sai igual toda vez.
// =============================================================
import * as THREE from 'three';
import { CONFIG_MAPA as C, QUALIDADES } from './config.js';
import {
  SEMENTE, RAIO_MUNDO, NIVEL_AGUA, POIS, RESERVAS, LAGOA, aleatorio, semente3,
  pesosEm, idDoPeso, N_PESOS, biomaEm, lagoEm, geloEm,
} from './gerador.js';
import { alturaVertice, alturaEm, ESPACO } from './altura.js';
import { TRACADOS, S_LAGO, foraDungeons } from '../dungeon.js';
import { LotePecas, colocar } from '../arena/pecas.js';

const T = C.tamChunk, DIV = C.divisoes;

// ---------- peças e materiais (iguais para todos os chunks) ----------
const GEO = {
  tronco: new THREE.CylinderGeometry(0.18, 0.26, 1.3, 5),
  copa: new THREE.IcosahedronGeometry(1.15, 0),
  cone: new THREE.ConeGeometry(1, 1, 6),
  pedra: new THREE.DodecahedronGeometry(0.8, 0),
  cacto: new THREE.CylinderGeometry(0.3, 0.34, 1, 6),
  flor: new THREE.IcosahedronGeometry(0.14, 0),
  cristal: new THREE.OctahedronGeometry(0.5, 0),
  caixa: new THREE.BoxGeometry(1, 1, 1),
  disco: new THREE.CylinderGeometry(1, 1, 0.4, 12),
};
const lambert = (o) => new THREE.MeshLambertMaterial({ flatShading: true, ...o });
const MAT = {
  base: lambert({ color: '#ffffff' }), // a cor de cada objeto vem da "cor da instância"
  lava: lambert({ color: '#5a3328', emissive: '#ff5a1f', emissiveIntensity: 0.35 }),
  brilho: lambert({ color: '#fff07a', emissive: '#f7c81a', emissiveIntensity: 0.7 }),
  gelo: lambert({ color: '#e6f8ff', emissive: '#6fd0ff', emissiveIntensity: 0.45 }),
  lavaViva: lambert({ color: '#ff8a3a', emissive: '#ff5a1f', emissiveIntensity: 0.9 }),
};
const MAT_CHAO = lambert({ vertexColors: true });
const MAT_AGUA = lambert({ color: '#4fc3f7', transparent: true, opacity: 0.82 });
const MAT_LAVA = lambert({ color: '#ff7a2a', emissive: '#ff4a10', emissiveIntensity: 0.85 });

// ---------- cores ----------
const PALETA = {
  campo: ['#8bd65e', '#7fcb55', '#95dc68'],
  planta: ['#4ea64a', '#5cb553', '#469c43'],
  terra: ['#e3c58a', '#d9b87a', '#ecd096'],
  raio: ['#f4f8fc', '#e8f0f8', '#dde8f3'],
  fogo: ['#4a3530', '#3e2c28', '#56403a'],
};
const ENCOSTA = {
  campo: ['#9a9a88', '#8a8f7a'],
  planta: ['#6f7a5e', '#7d836e'],
  terra: ['#c27a4e', '#b06a42', '#cf8a5a'],
  raio: ['#8fa0b8', '#7d8ea8', '#9aabc2'],
  fogo: ['#2e2220', '#3a2a26'],
};
const BORDA = {
  campo: ['#8fa27a', '#9aae84'], planta: ['#3f6a3a', '#4a7a44'], terra: ['#c9a06a', '#b8905a'],
  raio: ['#c8d6e6', '#b4c4d8'], fogo: ['#7a5a44', '#6a4a3a'],
};
const COR = {
  copa: { campo: ['#5fbf4a', '#6fcf5a', '#5fbf4a', '#6fcf5a', '#ffb3d1'], planta: ['#3f8f3a', '#4ea64a', '#2f7a3a'] },
  pedra: { campo: ['#a8a8b4', '#b9b5aa'], planta: ['#9aa39a', '#8a948a'], terra: ['#d4a46a', '#c98f5a', '#b8804e'], raio: ['#cfe6f2', '#b8d4e6', '#dfeef8'], fogo: ['#4a3530', '#3a2a26'] },
  flor: ['#ff7eb6', '#ffd23f', '#ffffff', '#b58cff'],
};
const c3 = new THREE.Color();
// pesosEm devolve sempre a mesma lista (reaproveitada): guardamos uma referência a ela
const LISTA_PESOS = pesosEm(0, 0);
const PESOS_ATUAIS = () => LISTA_PESOS;
const sorteio = (rng, lista) => lista[Math.floor(rng() * lista.length)];

export class Chunks {
  constructor(mundo, qualidade) {
    this.m = mundo;
    this.grupo = new THREE.Group();
    this.grupo.name = 'chunks';
    mundo.cena.add(this.grupo);
    this.mapa = new Map();     // chunks carregados
    this.fila = [];            // chunks esperando para serem criados
    this.centro = null;
    this.liquidos = [];        // malhas de água e lava (para balançar)
    this.stats = { gerados: 0, apagados: 0, msMax: 0, msTotal: 0 };
    this.definirQualidade(qualidade);
  }

  definirQualidade(q) {
    this.nomeQ = QUALIDADES[q] ? q : 'medio';
    this.q = QUALIDADES[this.nomeQ];
    if (this.mapa.size) this.recarregar();
  }
  // Apaga tudo e cria de novo (ao trocar a qualidade)
  recarregar() {
    for (const ch of [...this.mapa.values()]) this.descarregar(ch);
    this.centro = null;
    this.fila = [];
  }

  chave(cx, cz) { return (cx + 512) * 1024 + (cz + 512); }
  // O chunk faz parte do mundo? (o mapa redondo, a borda e as dungeons)
  existe(cx, cz) {
    const x = (cx + 0.5) * T, z = (cz + 0.5) * T;
    return Math.hypot(x, z) < RAIO_MUNDO + 34 || foraDungeons(x, z) < 34;
  }
  carregado(x, z) {
    const ch = this.mapa.get(this.chave(Math.floor(x / T), Math.floor(z / T)));
    return !!ch && ch.lod >= 0;
  }
  get raioCarregado() { return this.q.raioChunks * T; }

  // ---------- quadro a quadro ----------
  atualizar(x, z) {
    const pcx = Math.floor(x / T), pcz = Math.floor(z / T);
    if (!this.centro || this.centro.cx !== pcx || this.centro.cz !== pcz) this.replanejar(pcx, pcz);
    // teleporte: o chão em volta do jogador precisa existir já
    if (!this.carregado(x, z)) this.gerarAgora(pcx, pcz, 1);
    this.processarFila();
  }

  // Decide quais chunks devem existir (e com que detalhe) em volta do jogador
  replanejar(pcx, pcz) {
    this.centro = { cx: pcx, cz: pcz };
    const r = this.q.raioChunks, quer = new Map();
    for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
      const d = Math.hypot(dx, dz);
      if (d > r + 0.5) continue;
      const cx = pcx + dx, cz = pcz + dz;
      if (!this.existe(cx, cz)) continue;
      quer.set(this.chave(cx, cz), { cx, cz, d, lod: Math.max(Math.abs(dx), Math.abs(dz)) <= this.q.detalhe ? 0 : 1 });
    }
    // os que ficaram longe (com 1 chunk de folga, para não ficar criando e apagando na beirada)
    for (const ch of [...this.mapa.values()]) {
      if (!quer.has(this.chave(ch.cx, ch.cz)) && Math.hypot(ch.cx - pcx, ch.cz - pcz) > r + 1.5) this.descarregar(ch);
    }
    this.fila = [...quer.values()]
      .filter((w) => this.mapa.get(this.chave(w.cx, w.cz))?.lod !== w.lod)
      .sort((a, b) => a.d - b.d);
  }

  processarFila() {
    const t0 = performance.now();
    let n = 0;
    while (this.fila.length && (n === 0 || performance.now() - t0 < C.orcamentoMs)) {
      const w = this.fila.shift();
      this.gerar(w.cx, w.cz, w.lod);
      n++;
    }
  }

  gerarAgora(pcx, pcz, raio) {
    for (let dx = -raio; dx <= raio; dx++) for (let dz = -raio; dz <= raio; dz++) {
      const cx = pcx + dx, cz = pcz + dz;
      if (!this.existe(cx, cz) || this.mapa.get(this.chave(cx, cz))?.lod === 0) continue;
      this.gerar(cx, cz, 0);
      this.fila = this.fila.filter((w) => w.cx !== cx || w.cz !== cz);
    }
  }

  // Cria na hora todos os chunks em volta (ao abrir o jogo, ao continuar, no teleporte do GM)
  carregarTudoPerto(x, z) {
    this.centro = null;
    this.replanejar(Math.floor(x / T), Math.floor(z / T));
    while (this.fila.length) { const w = this.fila.shift(); this.gerar(w.cx, w.cz, w.lod); }
  }

  // Só para testes: carrega o mundo inteiro (simplificado), para ver de cima
  carregarMundoTodo() {
    const n = Math.ceil((RAIO_MUNDO + 160) / T);
    for (let cx = -n; cx <= n; cx++) for (let cz = -n; cz <= n; cz++) {
      if (this.existe(cx, cz) && !this.mapa.has(this.chave(cx, cz))) this.gerar(cx, cz, 1);
    }
    this.centro = { cx: 9999, cz: 9999 }; // não apaga nada até o jogador andar
  }

  // ---------- criar e apagar um chunk ----------
  gerar(cx, cz, lod) {
    const t0 = performance.now();
    const k = this.chave(cx, cz);
    let ch = this.mapa.get(k);
    if (!ch) {
      ch = { cx, cz, lod: -1, malhas: [], dados: this.decorar(cx, cz) };
      this.mapa.set(k, ch);
      for (const o of ch.dados.obst) this.m.grade.add(o);
    }
    this.limpar(ch);
    ch.lod = lod;
    this.criarChao(ch);
    this.criarLiquidos(ch);
    this.criarObjetos(ch);
    const ms = performance.now() - t0;
    this.stats.gerados++;
    this.stats.msTotal += ms;
    this.stats.msMax = Math.max(this.stats.msMax, ms);
  }

  limpar(ch) {
    for (const m of ch.malhas) {
      this.grupo.remove(m);
      if (m.isInstancedMesh) m.dispose(); // as peças são de todos: não apaga a geometria
      else m.geometry.dispose();
    }
    if (ch.liquidos) this.liquidos = this.liquidos.filter((m) => !ch.liquidos.includes(m));
    ch.malhas = [];
    ch.liquidos = [];
  }

  descarregar(ch) {
    this.limpar(ch);
    for (const o of ch.dados.obst) this.m.grade.remover(o);
    this.mapa.delete(this.chave(ch.cx, ch.cz));
    this.stats.apagados++;
  }

  adicionar(ch, malha) {
    malha.matrixAutoUpdate = false;
    malha.updateMatrix();
    this.grupo.add(malha);
    ch.malhas.push(malha);
  }

  // ---------- chão ----------
  criarChao(ch) {
    const passo = ch.lod ? DIV / C.divisoesLonge : 1, n = DIV / passo;
    const i0 = ch.cx * DIV, j0 = ch.cz * DIV, E = ESPACO;
    const nTri = n * n * 2 + 4 * n * 4;
    const pos = new Float32Array(nTri * 9), cor = new Float32Array(nTri * 9);
    const rng = aleatorio(semente3(SEMENTE, ch.cx * 7 + 3, ch.cz * 5 + 1));
    let o = 0;
    const tri = (ax, ay, az, bx, by, bz, qx, qy, qz, hex) => {
      pos[o] = ax; pos[o + 1] = ay; pos[o + 2] = az; pos[o + 3] = bx; pos[o + 4] = by; pos[o + 5] = bz; pos[o + 6] = qx; pos[o + 7] = qy; pos[o + 8] = qz;
      c3.set(hex);
      for (let k = 0; k < 3; k++) { cor[o + k * 3] = c3.r; cor[o + k * 3 + 1] = c3.g; cor[o + k * 3 + 2] = c3.b; }
      o += 9;
    };
    // cor de um triângulo (pelo centro dele e pela inclinação)
    const corTri = (ax, ay, az, bx, by, bz, qx, qy, qz) => {
      const ux = bx - ax, uy = by - ay, uz = bz - az, vx = qx - ax, vy = qy - ay, vz = qz - az;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const inc = ny / (Math.hypot(nx, ny, nz) || 1);
      return this.corDoChao((ax + bx + qx) / 3, (az + bz + qz) / 3, (ay + by + qy) / 3, inc, rng, true);
    };
    const h = (i, j) => alturaVertice(i, j);
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
      const i = i0 + a * passo, j = j0 + b * passo, ip = i + passo, jp = j + passo;
      const x0 = i * E, x1 = ip * E, z0 = j * E, z1 = jp * E;
      const h00 = h(i, j), h10 = h(ip, j), h01 = h(i, jp), h11 = h(ip, jp);
      pesosEm((x0 + x1) / 2, (z0 + z1) / 2); // o bioma do quadrado (os 2 triângulos usam o mesmo)
      tri(x0, h00, z0, x0, h01, z1, x1, h10, z0, corTri(x0, h00, z0, x0, h01, z1, x1, h10, z0));
      tri(x1, h10, z0, x0, h01, z1, x1, h11, z1, corTri(x1, h10, z0, x0, h01, z1, x1, h11, z1));
    }
    // saias: paredes curtas para baixo em volta do chunk (tapam frestas entre chunks com detalhes diferentes)
    const corSaia = this.corDoChao((i0 + DIV / 2) * E, (j0 + DIV / 2) * E, h(i0 + DIV / 2, j0 + DIV / 2), 0.3, rng); // uma cor só (quase nunca aparece)
    const saia = (xa, za, ha, xb, zb, hb) => {
      const y = Math.min(ha, hb) - 3, hex = corSaia;
      tri(xa, ha, za, xb, hb, zb, xa, y, za, hex); tri(xb, hb, zb, xb, y, zb, xa, y, za, hex);
      tri(xa, ha, za, xa, y, za, xb, hb, zb, hex); tri(xb, hb, zb, xa, y, za, xb, y, zb, hex);
    };
    for (let a = 0; a < n; a++) {
      const ia = i0 + a * passo, ib = ia + passo, ja = j0 + a * passo, jb = ja + passo;
      saia(ia * E, j0 * E, h(ia, j0), ib * E, j0 * E, h(ib, j0));
      saia(ia * E, (j0 + DIV) * E, h(ia, j0 + DIV), ib * E, (j0 + DIV) * E, h(ib, j0 + DIV));
      saia(i0 * E, ja * E, h(i0, ja), i0 * E, jb * E, h(i0, jb));
      saia((i0 + DIV) * E, ja * E, h(i0 + DIV, ja), (i0 + DIV) * E, jb * E, h(i0 + DIV, jb));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    this.adicionar(ch, new THREE.Mesh(g, MAT_CHAO));
  }

  // jaCalculado: os pesos dos biomas deste ponto já foram calculados (pesosEm) logo antes
  corDoChao(x, z, y, inc, rng, jaCalculado = false) {
    // dungeons: chão de basalto (Brasas) e de floresta fechada (Trilha), como antes
    const tr = TRACADOS.find((t) => t.local(x, z).s > t.sMin + 8 && t.fora(x, z) < 8);
    if (tr?.id === 'brasas') {
      const fd = tr.fora(x, z);
      return fd > 2 ? (rng() < 0.5 ? '#3a2a26' : '#2e2220') : (rng() < 0.08 ? '#c8461a' : sorteio(rng, ['#5a3a30', '#6b4535', '#4d3229']));
    }
    if (tr) {
      const fd = tr.fora(x, z), lp = tr.local(x, z);
      if (fd > 2) return sorteio(rng, ['#1f4a2a', '#26522e', '#1a4024']);
      if (Math.abs(lp.s - S_LAGO) < 4.2 && Math.abs(lp.lat) > 2.6) return '#2a6a6a';
      return rng() < 0.1 ? '#6a5236' : sorteio(rng, ['#3f7a3a', '#4a8a40', '#36703a', '#2f6a34']);
    }
    // o lago escondido da Floresta (cores do mapa antigo)
    const dl = Math.hypot(x - LAGOA.x, z - LAGOA.z);
    if (dl < LAGOA.r + 1) return '#3a8a8a';
    if (dl < LAGOA.r + 5) return sorteio(rng, ['#5a8a3a', '#6a9a4a']);
    // bioma do ponto (perto das bordas, sorteado pelo peso de cada um: a mistura fica natural)
    const P = jaCalculado ? PESOS_ATUAIS() : pesosEm(x, z);
    let r = rng(), id = 'campo';
    for (let i = 0; i < N_PESOS; i++) { r -= P[i]; if (r <= 0) { id = idDoPeso(i); break; } }
    if (Math.hypot(x, z) > RAIO_MUNDO - 4) return sorteio(rng, BORDA[id]);
    if (geloEm(x, z)) return sorteio(rng, ['#bfe6f7', '#cfeefb', '#b4def2']);
    if (y < NIVEL_AGUA - 0.15) return id === 'fogo' ? '#3a1a12' : '#4f9fb8';
    if (y < NIVEL_AGUA + 0.45) return id === 'fogo' ? sorteio(rng, ['#c8461a', '#8a2e14']) : id === 'raio' ? '#d8e8f2' : sorteio(rng, ['#e2cd90', '#ecd9a0']);
    if (y > 13 && id !== 'fogo' && inc > 0.55) return sorteio(rng, PALETA.raio); // neve no alto dos picos
    if (inc < 0.72) {
      if (id === 'terra') return Math.floor(y * 1.3) % 2 ? '#c27a4e' : '#b06a42'; // camadas do cânion
      return sorteio(rng, ENCOSTA[id]);
    }
    return sorteio(rng, PALETA[id]);
  }

  // ---------- água e lava ----------
  criarLiquidos(ch) {
    const passo = ch.lod ? DIV / C.divisoesLonge : 1, n = DIV / passo;
    const i0 = ch.cx * DIV, j0 = ch.cz * DIV, E = ESPACO;
    const agua = [], lava = [];
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
      const i = i0 + a * passo, j = j0 + b * passo, ip = i + passo, jp = j + passo;
      const hmin = Math.min(alturaVertice(i, j), alturaVertice(ip, j), alturaVertice(i, jp), alturaVertice(ip, jp));
      if (hmin > NIVEL_AGUA - 0.02) continue;
      const mx = (i + passo / 2) * E, mz = (j + passo / 2) * E;
      if (foraDungeons(mx, mz) < 4) continue;                                // as dungeons têm a água delas
      if (Math.hypot(mx - LAGOA.x, mz - LAGOA.z) < LAGOA.r + 8) continue;      // o lago escondido tem a dele
      (biomaEm(mx, mz) === 'fogo' ? lava : agua).push(i * E, j * E, ip * E, jp * E);
    }
    const malha = (lista, mat, y) => {
      if (!lista.length) return;
      const pos = new Float32Array((lista.length / 4) * 18);
      for (let q = 0, o = 0; q < lista.length; q += 4, o += 18) {
        const [x0, z0, x1, z1] = lista.slice(q, q + 4);
        pos.set([x0, 0, z0, x0, 0, z1, x1, 0, z0, x1, 0, z0, x0, 0, z1, x1, 0, z1], o);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.computeVertexNormals();
      g.computeBoundingSphere();
      const m = new THREE.Mesh(g, mat);
      m.position.y = y;
      m.userData.y0 = y;
      this.adicionar(ch, m);
      m.matrixAutoUpdate = true;
      ch.liquidos.push(m);
      this.liquidos.push(m);
    };
    malha(agua, MAT_AGUA, NIVEL_AGUA);
    malha(lava, MAT_LAVA, NIVEL_AGUA + 0.04);
  }

  // A água sobe e desce um pouquinho; a lava pulsa
  animar(t) {
    for (const m of this.liquidos) m.position.y = m.userData.y0 + Math.sin(t * 1.3) * 0.05;
    MAT_LAVA.emissiveIntensity = 0.75 + Math.sin(t * 2.2) * 0.15;
    MAT.lavaViva.emissiveIntensity = 0.8 + Math.sin(t * 2.6) * 0.2;
  }

  // ---------- objetos ----------
  criarObjetos(ch) {
    const grupos = new Map();
    for (const r of ch.dados.recs) {
      if (r.p && ch.lod > 0) continue; // longe: sem objetos pequenos
      const k = r.t + '|' + r.m;
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(r);
    }
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
    for (const lista of grupos.values()) {
      const { t, m } = lista[0];
      const im = new THREE.InstancedMesh(GEO[t], MAT[m], lista.length);
      lista.forEach((r, i) => {
        im.setMatrixAt(i, m4.compose(v.set(r.x, r.y, r.z), q.setFromEuler(e.set(r.rx, r.ry, r.rz)), s.set(r.sx, r.sy, r.sz)));
        if (m === 'base') im.setColorAt(i, c3.set(r.cor || '#ffffff'));
      });
      im.computeBoundingSphere();
      this.adicionar(ch, im);
    }
    // peças da Arena: todas do chunk juntas, uma malha por material
    if (ch.dados.pecas.length) {
      const lote = new LotePecas({ compartilhar: true });
      for (const pc of ch.dados.pecas) lote.por(pc.nome, colocar(pc.x, pc.y, pc.z, pc.ry, pc.e, pc.ix || 0, pc.iz || 0));
      for (const malha of lote.malhas()) { malha.geometry.computeBoundingSphere(); this.adicionar(ch, malha); }
    }
  }

  // Um ponto do chunk pode ganhar um objeto?
  livre(x, z) {
    const dc = Math.hypot(x, z);
    if (dc < 13 || dc > RAIO_MUNDO - 3) return false;
    for (const t of TRACADOS) if (t.reservado(x, z)) return false;
    for (const r of RESERVAS) if (Math.hypot(x - r.x, z - r.z) < r.r) return false;
    for (const r of this.m.reservas) if (Math.hypot(x - r.x, z - r.z) < r.r) return false;
    const h = alturaEm(x, z);
    if (h < NIVEL_AGUA + 0.35 || geloEm(x, z)) return false;
    // penhasco: sem objeto (senão a árvore fica enfiada na ladeira)
    const a1 = alturaEm(x + 1, z), a2 = alturaEm(x - 1, z), a3 = alturaEm(x, z + 1), a4 = alturaEm(x, z - 1);
    if (Math.max(h, a1, a2, a3, a4) - Math.min(h, a1, a2, a3, a4) > 1.5) return false;
    // peças fixas (fonte, dungeons, Floresta)
    return !this.m.grade.cada(x, z, 1.2, (o) => o.fixo && Math.hypot(x - o.x, z - o.z) < o.r + 1.2);
  }

  // Monta a lista de objetos do chunk (e os obstáculos). Sempre igual para o mesmo chunk.
  decorar(cx, cz) {
    const rng = aleatorio(semente3(SEMENTE ^ 0x51ed27, cx, cz));
    const recs = [], obst = [], pecas = [];
    const add = (t, m, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0, cor = null, p = false) => recs.push({ t, m, x, y, z, sx, sy, sz, rx, ry, rz, cor, p });
    const ob = (x, z, r) => obst.push({ x, z, r });
    const pc = (nome, x, y, z, ry, e, ix = 0, iz = 0) => pecas.push({ nome, x, y, z, ry, e, ix, iz }); // peça da Arena
    const k = { add, ob, rng, pc };
    for (const p of POIS) if (Math.floor(p.x / T) === cx && Math.floor(p.z / T) === cz) this.pontoDeInteresse(p, k);
    const G = 8, cel = T / G, dq = this.q.densidade;
    for (let a = 0; a < G; a++) for (let b = 0; b < G; b++) {
      const x = (cx * G + a + 0.15 + rng() * 0.7) * cel, z = (cz * G + b + 0.15 + rng() * 0.7) * cel;
      const r1 = rng(), r2 = rng(), r3 = rng(), esc = rng();
      if (!this.livre(x, z)) continue;
      const P = pesosEm(x, z);
      let r = r1, id = 'campo';
      for (let i = 0; i < N_PESOS; i++) { r -= P[i]; if (r <= 0) { id = idDoPeso(i); break; } }
      if (r2 < C.densidade[id] * dq) this.objeto(id, x, z, r3, esc, k);
      else if ((id === 'campo' || id === 'planta') && r2 > 0.78) add('flor', 'base', x, alturaEm(x, z) + 0.12, z, 1, 1, 1, 0, 0, 0, sorteio(rng, COR.flor), true);
      else if (id === 'terra' && r2 > 0.93) this.arbusto(x, z, 0.6 + esc * 0.4, sorteio(rng, ['#a8743f', '#9a8a4a']), k);
      else if (id === 'raio' && r2 > 0.95) this.pedra(x, z, 0.3 + esc * 0.3, sorteio(rng, COR.pedra.raio), k, true);
    }
    return { recs, obst, pecas };
  }

  // Chão onde o objeto encosta (o ponto mais baixo em volta: nada fica flutuando na ladeira)
  pe(x, z, r) {
    return Math.min(alturaEm(x, z), alturaEm(x + r, z), alturaEm(x - r, z), alturaEm(x, z + r), alturaEm(x, z - r)) - 0.06;
  }

  objeto(id, x, z, r3, esc, k) {
    const { rng } = k;
    switch (id) {
      case 'campo':
        if (r3 < 0.5) this.arvore(x, z, 0.8 + esc * 0.7, sorteio(rng, COR.copa.campo), k);
        else if (r3 < 0.75) this.pedra(x, z, 0.5 + esc * 0.9, sorteio(rng, COR.pedra.campo), k);
        else this.arbusto(x, z, 0.8 + esc * 0.5, '#6fcf5a', k);
        return;
      case 'planta':
        if (r3 < 0.72) this.arvore(x, z, 0.9 + esc * 0.7, sorteio(rng, COR.copa.planta), k);
        else if (r3 < 0.84) this.peca('pinheiro', x, z, (0.8 + esc * 0.6) * 0.62, 0.6, k);
        else if (r3 < 0.93) this.pedra(x, z, 0.5 + esc * 0.8, sorteio(rng, COR.pedra.planta), k);
        else this.arbusto(x, z, 0.8 + esc * 0.6, '#3f8f3a', k);
        return;
      case 'terra':
        if (lagoEm(x, z, 9, 'agua')?.oasis) {
          if (r3 < 0.7) this.peca('palmeira', x, z, (0.85 + esc * 0.4) * 0.72, 0.45, k, 0.06); else this.arbusto(x, z, 0.8, '#5cb553', k);
        } else if (r3 < 0.42) this.cacto(x, z, 0.8 + esc * 0.6, k);
        else if (r3 < 0.62) this.pedra(x, z, esc < 0.25 ? 1.6 + esc * 4 : 0.6 + esc * 0.9, sorteio(rng, COR.pedra.terra), k);
        else if (r3 < 0.82) this.peca('rocha_arenito', x, z, esc < 0.25 ? 1.2 + esc * 2.4 : 0.55 + esc * 0.6, 0.85, k);
        // monumentos do deserto (raros): obelisco, obelisco quebrado e arco de arenito
        else if (r3 < 0.845) this.peca('obelisco', x, z, 0.6 + esc * 0.35, 0.9, k);
        else if (r3 < 0.87) this.peca('obelisco_quebrado', x, z, 0.7 + esc * 0.3, 1.3, k);
        else if (r3 < 0.89) this.arco(x, z, 0.85 + esc * 0.3, k);
        else this.arbusto(x, z, 0.6 + esc * 0.5, '#a8743f', k);
        return;
      case 'raio':
        if (r3 < 0.55) this.peca('pinheiro_nevado', x, z, (0.8 + esc * 0.7) * 0.62, 0.6, k);
        else if (r3 < 0.82) this.pedra(x, z, 0.6 + esc * 1.1, sorteio(rng, COR.pedra.raio), k);
        else if (r3 < 0.92) this.peca('cristal_gelo', x, z, 0.45 + esc * 0.45, 0.7, k, 0.12);
        else this.cristal(x, z, 0.6 + esc * 0.8, k);
        return;
      case 'fogo':
        if (r3 < 0.3) this.pedra(x, z, 0.6 + esc * 1.1, sorteio(rng, COR.pedra.fogo), k);
        else if (r3 < 0.6) this.peca('rocha_lava', x, z, 0.5 + esc * 0.7, 0.9, k);
        else if (r3 < 0.68) this.peca('espinho_vulcao', x, z, 0.45 + esc * 0.35, 0.9, k, 0.1);
        else this.peca('arvore_queimada', x, z, (0.8 + esc * 0.6) * 0.62, 0.45, k, 0.08);
    }
  }

  // Peça da Arena no chão: e = escala, raio = obstáculo (m, multiplicado pela escala),
  // incl = quanto ela pode sair torta (palmeiras e espinhos não nascem retinhos)
  peca(nome, x, z, e, raio, { ob, rng, pc }, incl = 0) {
    const y = this.pe(x, z, raio * e);
    pc(nome, x, y, z, rng() * 6.28, e, (rng() - 0.5) * incl * 2, (rng() - 0.5) * incl * 2);
    ob(x, z, raio * e);
  }
  // Arco de arenito: dá para passar por baixo; só as duas colunas seguram
  arco(x, z, e, { ob, rng, pc }) {
    const ry = rng() * 6.28, dx = Math.cos(ry) * 2.3 * e, dz = -Math.sin(ry) * 2.3 * e;
    const y = Math.min(this.pe(x + dx, z + dz, 0.6 * e), this.pe(x - dx, z - dz, 0.6 * e));
    pc('arco_arenito', x, y, z, ry, e);
    ob(x + dx, z + dz, 0.75 * e);
    ob(x - dx, z - dz, 0.75 * e);
  }
  arvore(x, z, e, cor, { add, ob, rng }) {
    const y = this.pe(x, z, 0.3 * e), ry = rng() * 6.28;
    add('tronco', 'base', x, y + 0.65 * e, z, e, e, e, 0, ry, 0, '#8a5a3a');
    add('copa', 'base', x, y + 1.9 * e, z, e, e * 1.15, e, 0, ry, 0, cor);
    ob(x, z, 0.55 * e);
  }
  pinheiro(x, z, e, cor, topo, { add, ob, rng }) {
    const y = this.pe(x, z, 0.3 * e), ry = rng() * 6.28;
    add('tronco', 'base', x, y + 0.45 * e, z, e, 0.7 * e, e, 0, ry, 0, '#6a4a32');
    add('cone', 'base', x, y + 1.6 * e, z, 1.3 * e, 2 * e, 1.3 * e, 0, ry, 0, cor);
    add('cone', 'base', x, y + 2.6 * e, z, 0.95 * e, 1.6 * e, 0.95 * e, 0, ry + 0.5, 0, cor);
    add('cone', 'base', x, y + 3.45 * e, z, 0.55 * e, 1.1 * e, 0.55 * e, 0, ry, 0, topo);
    ob(x, z, 0.6 * e);
  }
  pedra(x, z, e, cor, { add, ob, rng }, pequena = false, lava = false) {
    const y = this.pe(x, z, 0.5 * e);
    add('pedra', lava ? 'lava' : 'base', x, y + 0.2 * e, z, e, e * 0.75, e, rng(), rng() * 6, rng(), cor, pequena);
    if (!pequena) ob(x, z, 0.7 * e);
  }
  arbusto(x, z, e, cor, { add, rng }) {
    const y = this.pe(x, z, 0.4 * e);
    add('copa', 'base', x, y + 0.3 * e, z, 0.55 * e, 0.45 * e, 0.55 * e, 0, rng() * 6, 0, cor, true);
  }
  cacto(x, z, e, { add, ob, rng }) {
    const y = this.pe(x, z, 0.3 * e), h = 2.2 * e, cor = rng() < 0.5 ? '#5a9a4a' : '#4f8f40';
    add('cacto', 'base', x, y + h / 2, z, e, h, e, 0, rng() * 6, 0, cor);
    const bracos = rng() < 0.3 ? 1 : 2, a0 = rng() * 6.28;
    for (let b = 0; b < bracos; b++) {
      const a = a0 + b * Math.PI, dx = Math.cos(a), dz = -Math.sin(a), alt = y + h * (0.4 + rng() * 0.2);
      add('cacto', 'base', x + dx * 0.35 * e, alt, z + dz * 0.35 * e, 0.55 * e, 0.8 * e, 0.55 * e, 0, a, Math.PI / 2, cor);
      add('cacto', 'base', x + dx * 0.72 * e, alt + 0.45 * e, z + dz * 0.72 * e, 0.55 * e, 1 * e, 0.55 * e, 0, 0, 0, cor);
    }
    ob(x, z, 0.45 * e);
  }
  palmeira(x, z, e, { add, ob, rng }) {
    const y = this.pe(x, z, 0.3 * e), inc = (rng() - 0.5) * 0.3;
    add('tronco', 'base', x, y + 1.7 * e, z, 0.8 * e, 2.6 * e, 0.8 * e, inc, 0, inc, '#a88454');
    add('copa', 'base', x + inc * 3.4 * e, y + 3.4 * e, z - inc * 3.4 * e, 1.3 * e, 0.45 * e, 1.3 * e, 0, rng() * 6, 0, '#4aa64a');
    ob(x, z, 0.45 * e);
  }
  arvoreMorta(x, z, e, { add, ob, rng }) {
    const y = this.pe(x, z, 0.3 * e), ry = rng() * 6.28;
    add('tronco', 'base', x, y + 1.1 * e, z, 0.9 * e, 1.8 * e, 0.9 * e, 0, ry, 0, '#3a2a24');
    add('tronco', 'base', x + Math.cos(ry) * 0.35 * e, y + 1.9 * e, z - Math.sin(ry) * 0.35 * e, 0.5 * e, 0.9 * e, 0.5 * e, 0, ry, 0.8, '#3a2a24');
    ob(x, z, 0.4 * e);
  }
  cristal(x, z, e, { add, ob, rng }) {
    const y = this.pe(x, z, 0.3 * e);
    add('cristal', 'brilho', x, y + 0.6 * e, z, e * 0.7, e * 2.2, e * 0.7, (rng() - 0.5) * 0.6, rng() * 6, (rng() - 0.5) * 0.6);
    ob(x, z, 0.4 * e);
  }

  // ---------- pontos de interesse ----------
  pontoDeInteresse(p, k) {
    const { add, ob, rng } = k;
    if (p.tipo === 'vulcao') {
      // cratera com lava no fundo e pedras de lava na beirada
      const y = alturaEm(p.x, p.z);
      add('disco', 'lavaViva', p.x, y + 0.12, p.z, 4.4, 1, 4.4);
      ob(p.x, p.z, 4.4);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + rng() * 0.3, d = 7.6 + rng() * 1.2;
        this.pedra(p.x + Math.cos(a) * d, p.z + Math.sin(a) * d, 0.6 + rng() * 0.6, null, k, false, true);
      }
    } else if (p.tipo === 'arco') {
      // arco de pedra no meio do deserto (um cristal forte escondido embaixo)
      const dx = Math.cos(p.ang), dz = Math.sin(p.ang), ys = [];
      for (const lado of [-1, 1]) {
        const x = p.x + dx * 3.4 * lado, z = p.z + dz * 3.4 * lado, y = this.pe(x, z, 0.9);
        ys.push(y);
        add('caixa', 'base', x, y + 3, z, 1.7, 6.2, 1.7, 0, -p.ang + 0.2 * lado, 0, '#c98a5a');
        add('pedra', 'base', x, y + 0.3, z, 1.6, 1, 1.6, rng(), rng() * 6, 0, '#b8804e');
        ob(x, z, 1.15);
      }
      add('caixa', 'base', p.x, Math.max(...ys) + 6.3, p.z, 8.8, 1.4, 2, 0, -p.ang, 0.04, '#b87a4e');
      add('caixa', 'base', p.x, Math.max(...ys) + 7.1, p.z, 6, 0.6, 1.6, 0, -p.ang, -0.03, '#d4a46a');
      for (let i = 0; i < 5; i++) {
        const a = rng() * 6.28, d = 5 + rng() * 3;
        this.pedra(p.x + Math.cos(a) * d, p.z + Math.sin(a) * d, 0.5 + rng() * 0.7, sorteio(rng, COR.pedra.terra), k);
      }
    } else if (p.tipo === 'cristalGelo') {
      // cristal de gelo gigante cercado de cristais menores
      const y = this.pe(p.x, p.z, 1.5);
      add('cristal', 'gelo', p.x, y + 3.2, p.z, 2.4, 7, 2.4, 0.08, p.ang, -0.06);
      ob(p.x, p.z, 1.9);
      for (let i = 0; i < 5; i++) {
        const a = p.ang + 0.6 + (i / 5) * Math.PI * 1.6, d = 2.4 + rng() * 0.8;
        const x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
        add('cristal', 'gelo', x, this.pe(x, z, 0.4) + 1.1, z, 0.9, 2.8, 0.9, Math.sin(a) * 0.4, rng() * 6, -Math.cos(a) * 0.4);
        ob(x, z, 0.6);
      }
    }
  }

  // ---------- números (para o GM e os testes) ----------
  info() {
    let malhas = 0, instancias = 0, tri = 0;
    for (const ch of this.mapa.values()) for (const m of ch.malhas) {
      malhas++;
      const g = m.geometry, nt = (g.index ? g.index.count : g.attributes.position.count) / 3;
      if (m.isInstancedMesh) { instancias += m.count; tri += nt * m.count; } else tri += nt;
    }
    return { chunks: this.mapa.size, fila: this.fila.length, malhas, instancias, triangulos: Math.round(tri), obstaculos: this.m.grade.total,
      msMedio: this.stats.gerados ? +(this.stats.msTotal / this.stats.gerados).toFixed(2) : 0, msMax: +this.stats.msMax.toFixed(2),
      gerados: this.stats.gerados, apagados: this.stats.apagados, qualidade: this.nomeQ };
  }
}
