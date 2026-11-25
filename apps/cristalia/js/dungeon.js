// =============================================================
// DUNGEONS ABERTAS (base comum)
// Uma dungeon aberta é um corredor que sai da borda do mapa redondo.
// Não é "instanciada": é parte do mapa, você entra andando.
//  - 4 etapas, separadas por portões. Cada etapa tem 1 acampamento
//    com grupos (5 comuns + 1 líder), cada vez mais fortes.
//  - Monstros soltos também aparecem lá dentro, já evoluídos.
//  - No fim, uma arena redonda com um chefe super raro.
// Este arquivo tem:
//  1) Tracado: a forma do corredor (onde fica, largura, altura do chão).
//     Os dois traçados ficam aqui embaixo (BRASAS e RAIZES).
//  2) DungeonAberta: tudo que as dungeons fazem igual (portões que ficam
//     transparentes, acampamentos, monstros soltos, chefe, clima).
//     O cenário de cada uma fica em brasas.js e raizes.js.
// As medidas usam duas coordenadas:
//  s   = distância ao longo do caminho (a partir da "origem" do traçado)
//  lat = distância para o lado do caminho (0 = meio)
// No mapa procedural, cada dungeon sai pela borda do bioma dela (o Caminho
// das Brasas pela Lava, a Trilha Ancestral pela Floresta): a direção vem da
// semente do mapa e a origem fica numa linha do centro até a borda.
// =============================================================
import * as THREE from 'three';
import { criarModelo, criarCoroa, animarModelo, criarAuraDupla } from './modelos.js';
import { ESPECIES, ELEMENTOS, DUNGEONS, MASMORRA, niveisDaEtapa, nivelDoChefe, criarMonstro, statsDe, formaPorNivel, especieDaEscolha, dadosMasmorra, sortearChefe } from './dados.js';
import { SAIDAS, RAIO_MUNDO, ANG_REINO, RAIO_REINO, alturaBase } from './mapa/gerador.js';

const MAX_SOLTOS = 7;            // monstros soltos dentro de cada dungeon
const RESPAWN_ACAMPAMENTO = 120; // segundos até um acampamento vencido ter outro grupo
const ESCALA_CHEFE = 1.5;        // o chefe sorteado (forma final) fica maior que os outros

// ---------- 1) o traçado do corredor ----------
export class Tracado {
  // cfg: { id, zona, dir, perp, origem, curvaAmp, curvaFreq, sobe, ajusteAltura }
  constructor(cfg) {
    Object.assign(this, {
      sInicio: 84,   // portão de entrada
      sEtapa: 20,    // comprimento de cada etapa
      nEtapas: 4,
      sMin: 66,      // o corredor começa dentro do mapa principal
      sChefe: 182,   // centro da arena do chefe
      rChefe: 17,    // raio da arena do chefe
      largura: 14,   // meia largura do corredor
      curvaAmp: 7, curvaFreq: 1.3, sobe: 0.055, ajusteAltura: null, origem: { x: 0, z: 0 },
    }, cfg);
    this.sFim = this.sInicio + this.sEtapa * this.nEtapas; // portão do chefe
    this.centroChefe = this.ponto(this.sChefe, 0);
    this.angulo = Math.atan2(this.dir.z, this.dir.x);       // direção da boca no mapa redondo
  }
  // O caminho faz uma curva suave
  curva(s) { return this.curvaAmp * Math.sin(((s - this.sInicio) / 80) * Math.PI * this.curvaFreq); }
  local(x, z) {
    x -= this.origem.x; z -= this.origem.z;
    const s = x * this.dir.x + z * this.dir.z;
    return { s, lat: x * this.perp.x + z * this.perp.z - this.curva(s) };
  }
  ponto(s, lat) {
    const l = lat + this.curva(s);
    return { x: this.origem.x + this.dir.x * s + this.perp.x * l, z: this.origem.z + this.dir.z * s + this.perp.z * l };
  }
  dChefe(x, z) { return Math.hypot(x - this.centroChefe.x, z - this.centroChefe.z); }
  // Quanto um ponto está "para fora" (negativo = dentro).
  // Conta a partir de 4 m antes da parede, onde o chão começa a subir.
  fora(x, z) {
    const { s, lat } = this.local(x, z);
    const corredor = Math.max(Math.abs(lat) - (this.largura - 4), this.sMin - s, s - (this.sFim + 6));
    return Math.min(corredor, this.dChefe(x, z) - (this.rChefe - 4));
  }
  // Dentro da parte jogável (do portão de entrada em diante)?
  dentro(x, z) {
    if (this.dChefe(x, z) < this.rChefe) return true;
    const { s, lat } = this.local(x, z);
    return s >= this.sInicio - 2 && s <= this.sFim + 6 && Math.abs(lat) < this.largura;
  }
  // Perto da boca ou dentro (o mapa conta como a região da dungeon)
  perto(x, z) { return this.local(x, z).s > this.sMin + 4 && this.fora(x, z) < 6; }
  // A dungeon se decora sozinha: o mapa principal não põe árvores e pedras aqui
  reservado(x, z) { return this.local(x, z).s > this.sMin + 10 && this.fora(x, z) < 6; }
  // Onde a casa não pode ser montada
  semCasa(x, z) { return this.dentro(x, z) || this.local(x, z).s > this.sMin + 12; }
  // 0 a 3 = etapas, 4 = arena do chefe, -1 = fora
  etapaEm(x, z) {
    if (!this.dentro(x, z)) return -1;
    const { s } = this.local(x, z);
    if (s >= this.sFim) return this.nEtapas;
    return Math.max(0, Math.min(this.nEtapas - 1, Math.floor((s - this.sInicio) / this.sEtapa)));
  }
  // Altura do chão: o caminho sobe aos poucos; a arena do chefe é plana
  altura(x, z, h) {
    const { s, lat } = this.local(x, z);
    if (s < this.sMin - 2 || Math.abs(lat) > this.largura + 34) return h;
    // emenda suave com o mapa (ao longo do caminho e para os lados)
    const k0 = Math.min(1, Math.max(0, (s - (this.sMin - 2)) / 10)) * Math.min(1, (this.largura + 34 - Math.abs(lat)) / 12);
    const sobe = Math.max(0, Math.min(110, s - (this.sInicio - 10))) * this.sobe;
    let alvo = h * 0.4 + sobe;
    if (this.ajusteAltura) alvo = this.ajusteAltura(s, lat, alvo);
    const plano = (this.sChefe - this.sInicio + 10) * this.sobe;
    const dT = this.dChefe(x, z);
    if (dT < 12) alvo = plano;
    else if (dT < this.rChefe) { const k = (dT - 12) / (this.rChefe - 12); alvo = plano * (1 - k) + alvo * k; }
    return h * (1 - k0) + alvo * k0;
  }
  // Prende um ponto dentro do corredor ou da arena do chefe (o que estiver mais perto)
  prender(p, raio) {
    const { s, lat } = this.local(p.x, p.z);
    const lim = this.largura - 2 - raio;
    const a = this.ponto(Math.min(this.sFim + 6, Math.max(this.sMin, s)), Math.max(-lim, Math.min(lim, lat)));
    const c = this.centroChefe, dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz) || 1, rl = this.rChefe - 2 - raio;
    const b = d > rl ? { x: c.x + (dx / d) * rl, z: c.z + (dz / d) * rl } : { x: p.x, z: p.z };
    return Math.hypot(a.x - p.x, a.z - p.z) < Math.hypot(b.x - p.x, b.z - p.z) ? a : b;
  }
  livre(x, z, raio) {
    const { s, lat } = this.local(x, z);
    if (s >= this.sMin && s <= this.sFim + 6 && Math.abs(lat) < this.largura - 2 - raio) return true;
    return this.dChefe(x, z) < this.rChefe - 2 - raio;
  }
}

// Direção de saída (ângulo a): a boca (s = sMin) fica 18 m antes da borda do mapa
// (lado: de que lado fica o "lat" positivo; a Trilha usa o outro lado, como no mapa antigo)
function saida(a, lado = 1) {
  const dir = { x: Math.cos(a), z: Math.sin(a) };
  const o = RAIO_MUNDO - 18 - 66;
  return { dir, perp: { x: -dir.z * lado, z: dir.x * lado }, origem: { x: dir.x * o, z: dir.z * o } };
}

// Caminho das Brasas: sai pela borda do bioma de Lava (depois do Vulcão)
export const BRASAS = new Tracado({ id: 'brasas', zona: 'fogo', ...saida(SAIDAS.brasas) });

// Trilha Ancestral: sai pela borda da Floresta. Sobe menos
// e, na etapa 3, o chão afunda num lago que só se atravessa pela ponte.
export const S_LAGO = 84 + 2 * 20 + 10;  // meio do Lago Escondido
export const LARG_LAGO = 3.2;           // meia largura do lago ao longo do caminho
export const RAIZES = new Tracado({
  id: 'raizes', zona: 'planta', ...saida(SAIDAS.raizes, -1),
  curvaAmp: 6, curvaFreq: 1.6, sobe: 0.03,
  ajusteAltura(s, lat, h) {
    const ds = Math.abs(s - S_LAGO);
    if (ds > LARG_LAGO + 2.5) return h;
    const kS = Math.min(1, (LARG_LAGO + 2.5 - ds) / 2.5);
    const kL = Math.min(1, Math.max(0, (Math.abs(lat) - 2.2) / 1.6)); // a ponte fica em terra firme
    return h - 1.7 * kS * kL;
  },
  // A água do lago: bloqueada, menos na ponte (|lat| < 1,7)
  bloqueado(s, lat, folga = 0) { return Math.abs(s - S_LAGO) < LARG_LAGO + 0.3 + folga && Math.abs(lat) > 1.7; },
  // Empurra para fora da água: para a margem ou para cima da ponte (o que for mais perto)
  empurrar(p, raio) {
    const { s, lat } = this.local(p.x, p.z), ds = s - S_LAGO, borda = LARG_LAGO + 0.3 + raio, ponte = 1.7 - raio;
    if (Math.abs(ds) >= borda || Math.abs(lat) <= ponte) return;
    const q = Math.abs(lat) - ponte < borda - Math.abs(ds)
      ? this.ponto(s, Math.sign(lat) * ponte)
      : this.ponto(S_LAGO + Math.sign(ds || 1) * borda, lat);
    p.x = q.x; p.z = q.z;
  },
});
RAIZES.yAgua = (S_LAGO - (84 - 10)) * 0.03 - 0.7; // altura da água do Lago Escondido

// O Reino: não é dungeon. No mundo novo ele fica NO MEIO do mapa: um platô redondo e plano
// (RAIO_REINO = 100 m) com muralha e 5 portões, um para cada bioma.
// Tem as mesmas funções dos traçados das dungeons (fora, dentro, perto, altura...),
// para o resto do jogo tratar todos do mesmo jeito.
class ReinoCentral {
  constructor() {
    this.id = 'reino';
    this.zona = 'campo';
    this.centro = { x: 0, z: 0 };
    this.rChefe = RAIO_REINO;   // (nome antigo: o "platô" inteiro)
    this.h = 0.8;               // altura do platô
    // giro do desenho do Reino: o eixo "frente" (+z do desenho) aponta para o portão principal (Floresta)
    this.giro = Math.atan2(Math.cos(ANG_REINO), Math.sin(ANG_REINO));
    this.angulo = ANG_REINO;
  }
  dChefe(x, z) { return Math.hypot(x - this.centro.x, z - this.centro.z); }
  etapaEm() { return -1; }
  fora(x, z) { return this.dChefe(x, z) - (RAIO_REINO - 4); }
  dentro(x, z) { return this.dChefe(x, z) < RAIO_REINO; }
  perto(x, z) { return this.dChefe(x, z) < RAIO_REINO + 4; }
  reservado(x, z) { return this.dChefe(x, z) < RAIO_REINO + 3; }
  semCasa(x, z) { return this.dChefe(x, z) < RAIO_REINO + 6; }
  livre(x, z, raio) { return this.dChefe(x, z) < RAIO_REINO - 2 - raio; }
  prender(p, raio) {
    const d = this.dChefe(p.x, p.z) || 1, rl = RAIO_REINO - 2 - raio;
    return d > rl ? { x: (p.x / d) * rl, z: (p.z / d) * rl } : { x: p.x, z: p.z };
  }
  // o platô é plano e emenda suave com o mapa em volta (até 18 m depois da muralha)
  altura(x, z, h) {
    const d = this.dChefe(x, z);
    if (d > RAIO_REINO + 18) return h;
    const k = Math.min(1, (RAIO_REINO + 18 - d) / 16);
    return h * (1 - k) + this.h * k;
  }
  // Do desenho do Reino (x, z locais; +z = portão principal) para o mapa
  paraMundo(lx, lz) {
    const c = Math.cos(this.giro), s = Math.sin(this.giro);
    return { x: this.centro.x + lx * c + lz * s, z: this.centro.z - lx * s + lz * c };
  }
  // Do mapa para o desenho do Reino
  paraLocal(x, z) {
    const dx = x - this.centro.x, dz = z - this.centro.z, c = Math.cos(this.giro), s = Math.sin(this.giro);
    return { x: dx * c - dz * s, z: dx * s + dz * c };
  }
}
export const REINO = new ReinoCentral();

export const TRACADOS = [BRASAS, RAIZES, REINO];

// Funções para o mapa: juntam as duas dungeons
export function tracadoPerto(x, z) { return TRACADOS.find((t) => t.perto(x, z)) || null; }
export function foraDungeons(x, z) { return Math.min(...TRACADOS.map((t) => t.fora(x, z))); }
export function alturaDungeons(x, z, h) {
  for (const t of TRACADOS) h = t.altura(x, z, h);
  return h;
}
export function dentroDungeonLivre(x, z, raio) { return TRACADOS.some((t) => t.livre(x, z, raio)); }
export function prenderDungeons(p, raio) {
  let melhor = null, dm = Infinity;
  for (const t of TRACADOS) {
    const q = t.prender(p, raio), d = Math.hypot(q.x - p.x, q.z - p.z);
    if (d < dm) { dm = d; melhor = q; }
  }
  return melhor;
}
export function semCasaDungeons(x, z) { return TRACADOS.find((t) => t.semCasa(x, z)) || null; }

// ---------- materiais e peças ----------
export const lambert = (cor, extra = {}) => new THREE.MeshLambertMaterial({ color: cor, flatShading: true, ...extra });
export const GEO = {
  caixa: new THREE.BoxGeometry(1, 1, 1),
  cil: new THREE.CylinderGeometry(0.5, 0.5, 1, 7),
  cilFino: new THREE.CylinderGeometry(0.35, 0.5, 1, 6),
  cone: new THREE.ConeGeometry(0.5, 1, 6),
  cone4: new THREE.ConeGeometry(0.5, 1, 4),
  dode: new THREE.DodecahedronGeometry(0.6, 0),
  ico: new THREE.IcosahedronGeometry(0.6, 0),
  disco: new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2),
  tigela: new THREE.CylinderGeometry(0.55, 0.3, 0.4, 7),
  toro: new THREE.TorusGeometry(0.6, 0.06, 4, 10, Math.PI),
  arco: new THREE.TorusGeometry(1, 0.22, 5, 10, Math.PI),       // raiz em arco
  chapeu: new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), // chapéu de cogumelo
};

// Junta várias peças iguais num InstancedMesh (bem mais leve para o celular).
// As peças são separadas em quadrados de 40 m: assim o que está longe da câmera
// nem é desenhado (cada quadrado tem a sua "bolha" de visibilidade).
const TAM_QUADRADO = 40;
export class Lote {
  constructor() { this.itens = new Map(); }
  add(geo, mat, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
    const k = geo.uuid + '|' + mat.uuid + '|' + Math.floor(x / TAM_QUADRADO) + ',' + Math.floor(z / TAM_QUADRADO);
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
      im.computeBoundingSphere();
      cena.add(im);
    }
    this.itens.clear();
  }
}

// Junta várias peças numa malha só por material (1 desenho por material).
// Usado em coisas grandes que precisam ficar transparentes juntas (árvores gigantes).
const SEM_INDICE = new Map();
export class Bloco {
  constructor() { this.pecas = new Map(); }
  add(geo, mat, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
    if (!this.pecas.has(mat)) this.pecas.set(mat, []);
    this.pecas.get(mat).push([geo, x, y, z, sx, sy, sz, rx, ry, rz]);
  }
  // Devolve um grupo com uma malha por material (os materiais são copiados para poder desbotar)
  montar(cena) {
    const grupo = new THREE.Group(), mats = [];
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    for (const [mat, lista] of this.pecas) {
      let total = 0;
      const geos = lista.map(([geo]) => {
        if (!SEM_INDICE.has(geo)) SEM_INDICE.set(geo, geo.index ? geo.toNonIndexed() : geo);
        const g = SEM_INDICE.get(geo);
        total += g.attributes.position.count;
        return g;
      });
      const pos = new Float32Array(total * 3);
      let o = 0;
      lista.forEach(([, x, y, z, sx, sy, sz, rx, ry, rz], i) => {
        m4.compose(v.set(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), sc.set(sx, sy, sz));
        const a = geos[i].attributes.position;
        for (let k = 0; k < a.count; k++, o += 3) {
          p.fromBufferAttribute(a, k).applyMatrix4(m4);
          pos[o] = p.x; pos[o + 1] = p.y; pos[o + 2] = p.z;
        }
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.computeVertexNormals();
      const m = mat.clone();
      m.transparent = true;
      mats.push(m);
      grupo.add(new THREE.Mesh(g, m));
    }
    cena.add(grupo);
    return { grupo, mats, op: 1 };
  }
}
// Deixa um bloco transparente aos poucos (alvo: 1 = normal, ~0.2 = quase invisível)
export function desbotar(b, alvo, dt) {
  if (Math.abs(alvo - b.op) < 0.01) return;
  b.op += (alvo - b.op) * Math.min(1, dt * 6);
  for (const m of b.mats) { m.opacity = b.op; m.depthWrite = b.op > 0.9; }
}

export function aleatorio(semente) {
  return () => {
    semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sortear(lista) {
  const total = lista.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [e, w] of lista) { r -= w; if (r <= 0) return e; }
  return lista[0][0];
}

// ---------- 2) o que todas as dungeons fazem igual ----------
// Uma subclasse precisa criar: caminho(), etapa(e), fim(), fundo(), estradaDeFora(),
// pecasPortao(L, s, doChefe) e pode trocar as cores do clima e das partículas.
export class DungeonAberta {
  constructor(mundo, alturaEm, tracado, semente) {
    this.m = mundo;
    this.t = tracado;
    this.id = tracado.id;
    this.cfg = DUNGEONS[tracado.id];
    this.altura = alturaEm;
    this.cena = mundo.cena;
    this.rng = aleatorio(semente);
    this.obstaculos = mundo.obstaculos;
    this.acampamentos = [];
    this.chefe = null;
    this.esperaAmanhecer = false;  // vencido: espera o próximo amanhecer para voltar
    this.etapaAvisada = -1;
    this.etapaAtual = -1;
    this.fator = 0;                // 0 = fora, 1 = no fundo da dungeon (para o clima)
    this.lote = new Lote();
    this.portoes = [];
    this.construir();
    this.lote.montar(this.cena);
    this.criarParticulas();
  }

  // Valores que cada dungeon troca
  get corCeu() { return new THREE.Color('#5a2620'); }
  get corHemi() { return new THREE.Color('#ffb08a'); }
  get paletaParticulas() { return ['#ffffff']; }
  get tamParticula() { return 0.28; }

  y(x, z) { return this.altura(x, z); }
  obst(x, z, r) { this.obstaculos.push({ x, z, r }); }
  ponto(s, lat) { return this.t.ponto(s, lat); }
  sEtapa(e) { return this.t.sInicio + e * this.t.sEtapa; }

  // ---------- construção do cenário ----------
  construir() {
    const T = this.t;
    for (let i = 0; i <= T.nEtapas; i++) this.portao(T.sInicio + i * T.sEtapa, i === T.nEtapas);
    this.caminho();
    for (let e = 0; e < T.nEtapas; e++) this.etapa(e);
    this.fim();
    this.fundo();
    this.estradaDeFora();
    this.criarAcampamentos();
  }

  // Cada portão é um grupo próprio: fica transparente quando você passa por baixo (para não tampar a câmera)
  // (as peças de cada portão viram uma malha só por material: bem menos desenhos por quadro)
  portao(s, doChefe) {
    const b = new Bloco();
    this.pecasPortao(b, s, doChefe);
    const blk = b.montar(this.cena), c = this.ponto(s, 0);
    this.portoes.push({ x: c.x, z: c.z, s, mats: blk.mats, op: 1 });
  }

  // Ângulo (rotação Y) para uma peça ficar atravessada no caminho
  get angPortao() { return Math.atan2(this.t.perp.x, this.t.perp.z); }

  // Lugar livre dentro de uma etapa (longe do meio do caminho e de outros obstáculos)
  lugarNaEtapa(e, latMin, folga, filtro = null) {
    const T = this.t;
    for (let t = 0; t < 60; t++) {
      const s = this.sEtapa(e) + 2.5 + this.rng() * (T.sEtapa - 5);
      const lat = (this.rng() < 0.5 ? -1 : 1) * (latMin + this.rng() * (T.largura - 3.5 - latMin));
      const p = this.ponto(s, lat);
      if (filtro && !filtro(s, lat)) continue;
      if (T.bloqueado?.(s, lat, folga)) continue;
      if (this.obstaculos.every((o) => Math.hypot(o.x - p.x, o.z - p.z) > o.r + folga)) return p;
    }
    return null;
  }

  // ---------- partículas do clima ----------
  criarParticulas() {
    const n = 360, pos = new Float32Array(n * 3), cor = new Float32Array(n * 3), c = new THREE.Color();
    const paleta = this.paletaParticulas;
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
    this.particulas = new THREE.Points(g, new THREE.PointsMaterial({ size: this.tamParticula, vertexColors: true, transparent: true, opacity: 0, depthWrite: false }));
    this.particulas.frustumCulled = false;
    this.particulas.visible = false;
    this.cena.add(this.particulas);
  }
  moverParticula(a, k, i, dt, t) { a[k + 1] -= dt; }
  moverParticulas(dt, t) {
    const m = this.m, p = this.particulas.geometry.attributes.position, a = p.array;
    this.particulas.position.set(m.pos.x, m.pos.y, m.pos.z);
    for (let i = 0; i < p.count; i++) {
      const k = i * 3;
      this.moverParticula(a, k, i, dt, t);
      if (a[k + 1] > 16) a[k + 1] -= 16;
      if (a[k + 1] < 0) a[k + 1] += 16;
      if (a[k] > 26) a[k] -= 52; else if (a[k] < -26) a[k] += 52;
      if (a[k + 2] > 26) a[k + 2] -= 52; else if (a[k + 2] < -26) a[k + 2] += 52;
    }
    p.needsUpdate = true;
  }

  // ---------- acampamentos de grupos ----------
  // [distância dentro da etapa, lado] de cada acampamento
  // 1 acampamento por etapa, no meio (com a formação em duplas, 2 por etapa ficavam colados)
  posAcampamentos() { return [[10, 0]]; }
  fogueira(p) {}
  criarAcampamentos() {
    for (let e = 0; e < this.t.nEtapas; e++) {
      for (const [k, lado] of this.posAcampamentos(e)) {
        const p = this.ponto(this.sEtapa(e) + k, lado * 6.5);
        this.fogueira(p);
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
        a.grupo = m.spawnarGrupo({ x: a.x, z: a.z, zona: this.cfg.zonaSoltos, niveis: niveisDaEtapa(m.mediaEquipe(), a.etapa, this.id, this.nivelMasmorra), lista: this.cfg.aparicoes, acampamento: a, escalonado: true, finalLider: this.liderFinal() });
      } else if (a.grupo && d > 60) {
        m.removerGrupo(a.grupo, true);
        a.grupo = null;
      }
    }
  }

  // Monstros soltos (já evoluídos) dentro da dungeon, perto de você
  atualizarSoltos(dentro) {
    const m = this.m, T = this.t;
    const soltos = m.selvagens.filter((s) => s.dungeon === this);
    for (const s of soltos) if (Math.hypot(s.x - m.pos.x, s.z - m.pos.z) > 70) m.removerSelvagem(s);
    if (!dentro || soltos.length >= MAX_SOLTOS) return;
    const { s: sJ } = T.local(m.pos.x, m.pos.z);
    for (let t = 0; t < 12; t++) {
      const s = sJ + 14 + Math.random() * 18 * (Math.random() < 0.3 ? -1 : 1);
      if (s < T.sInicio + 1 || s > T.sFim - 1) continue;
      const lat = (Math.random() * 2 - 1) * (T.largura - 5), p = this.ponto(s, lat);
      if (T.bloqueado?.(s, lat, 1)) continue;
      if (Math.hypot(p.x - m.pos.x, p.z - m.pos.z) < 12) continue;
      if (this.obstaculos.some((o) => Math.hypot(o.x - p.x, o.z - p.z) < o.r + 1)) continue;
      const etapa = T.etapaEm(p.x, p.z);
      if (etapa < 0 || etapa >= T.nEtapas) continue;
      const nv = Math.min(98, niveisDaEtapa(m.mediaEquipe(), etapa, this.id, this.nivelMasmorra).comum + Math.round(Math.random() * 2));
      const escolha = sortear(this.cfg.aparicoes);
      const especie = especieDaEscolha(escolha, nv);
      const esp = ESPECIES[especie];
      const dados = criarMonstro(especie, nv);
      const modelo = criarModelo(especie);
      let aura = null;
      if (esp.dupla) { aura = criarAuraDupla(esp.elementos.map((el) => ELEMENTOS[el].cor), esp.raio * 1.5); modelo.add(aura); }
      modelo.position.set(p.x, this.y(p.x, p.z), p.z);
      this.cena.add(modelo);
      m.selvagens.push({ dados, modelo, aura, dupla: !!esp.dupla, dungeon: this, x: p.x, z: p.z, ang: Math.random() * 6.28, estado: 'parado', t: Math.random() * 2, zona: this.cfg.zonaSoltos, periodo: null, vel: statsDe(especie, nv).vel * 0.45 });
      return;
    }
  }

  // ---------- Nível da Masmorra (salvo na conta) ----------
  get salvo() { return this.m.jogo.estado ? dadosMasmorra(this.m.jogo.estado, this.id) : null; }
  get nivelMasmorra() { return this.salvo?.nivel || 1; }
  // a partir do nível 5, metade dos líderes vem na forma final
  liderFinal() { return this.nivelMasmorra >= MASMORRA.finalLider && Math.random() < MASMORRA.chanceFinalLider; }

  // ---------- chefe ----------
  // Cada vez que o chefe volta, ele é sorteado entre as formas finais do tipo da masmorra
  // (MASMORRA.chefes). O lendário só pode aparecer a partir do nível 9. O sorteio fica salvo,
  // para não trocar de chefe ao fechar e abrir o jogo.
  idDoChefe() {
    const sv = this.salvo;
    if (!sv) return this.cfg.chefe;
    if (!sv.chefe || !ESPECIES[sv.chefe]) sv.chefe = sortearChefe(this.id, sv.nivel);
    return sv.chefe;
  }
  get nomeChefe() { return ESPECIES[this.chefe?.dados.especie || this.idDoChefe()].nome; }

  spawnarChefe() {
    const m = this.m, T = this.t, id = this.idDoChefe(), esp = ESPECIES[id];
    const dados = criarMonstro(id, nivelDoChefe(m.mediaEquipe(), this.nivelMasmorra));
    dados.chefe = true; // chefe de masmorra: Fúria, coroa e o tesouro (sai quando é capturado)
    const modelo = criarModelo(id);
    const escala = esp.chefe ? 1 : ESCALA_CHEFE; // o lendário já é grande
    modelo.scale.setScalar(escala);
    const coroa = criarCoroa(1.6 / escala);
    coroa.position.y = esp.altura + 0.2 / escala;
    modelo.add(coroa);
    const pos = this.ponto(T.sChefe + 3, 0);
    modelo.position.set(pos.x, this.y(pos.x, pos.z), pos.z);
    modelo.rotation.y = Math.atan2(-T.dir.x, -T.dir.z); // olhando para a entrada
    this.cena.add(modelo);
    this.chefe = { dados, modelo, chefe: true, masmorra: this, fixo: true, x: pos.x, z: pos.z, ang: modelo.rotation.y, estado: 'parado', t: 99, zona: this.cfg.zonaChefe, periodo: null, vel: 0 };
    m.selvagens.push(this.chefe);
    if (esp.lendario && m.jogo.estado && !this.povoando) m.jogo.aviso(`O ${esp.nome} despertou no ${this.cfg.fim}!`);
  }

  // Vitória contra o chefe (vencido ou capturado): o Nível da Masmorra sobe 1
  // e o próximo chefe será sorteado de novo no amanhecer
  chefeVencido() {
    const sv = this.salvo;
    if (!sv) return;
    sv.vitorias++;
    sv.chefe = null;
    sv.espera = true;
    if (sv.nivel < MASMORRA.nivelMax) {
      sv.nivel++;
      this.m.jogo.aviso(`${this.cfg.nome} subiu para o Nível ${sv.nivel}! Os monstros de lá ficaram mais fortes.`);
      if (sv.nivel === MASMORRA.finalLider) this.m.jogo.aviso('Agora os líderes de lá podem vir na forma final.');
      if (sv.nivel === MASMORRA.lendarioDesde) this.m.jogo.aviso(`Dizem que o ${ESPECIES[this.cfg.chefe].nome} pode despertar no ${this.cfg.fim}...`);
    }
  }

  // Ao entrar no jogo (novo ou carregado): o chefe volta como estava salvo
  aoCarregar() {
    if (this.chefe && this.m.selvagens.includes(this.chefe)) this.m.removerSelvagem(this.chefe);
    this.chefe = null;
    this.esperaAmanhecer = !!this.salvo?.espera;
    this.periodoVisto = this.m.periodo;
    this.etapaAvisada = -1;
    this.povoando = true;
    if (!this.esperaAmanhecer) this.spawnarChefe();
    this.povoando = false;
  }

  atualizarChefe() {
    const m = this.m;
    if (this.chefe && !m.selvagens.includes(this.chefe)) {
      // foi vencido ou capturado: volta no próximo amanhecer
      this.chefe = null;
      this.esperaAmanhecer = true;
      this.periodoVisto = m.periodo;
    }
    if (!this.chefe && this.esperaAmanhecer && m.periodo !== this.periodoVisto) {
      this.periodoVisto = m.periodo;
      if (m.periodo === 'dia') {
        this.esperaAmanhecer = false;
        if (this.salvo) this.salvo.espera = false;
        this.spawnarChefe();
        if (m.jogo.estado && !ESPECIES[this.chefe.dados.especie].lendario) m.jogo.aviso(`${this.nomeChefe} é o novo chefe do ${this.cfg.fim}.`);
      }
    }
    if (!this.chefe && !this.esperaAmanhecer) this.spawnarChefe();
  }

  // ---------- quadro a quadro ----------
  atualizarExtras(dt, t) {}
  atualizar(dt, t) {
    const m = this.m, T = this.t;
    const etapa = T.etapaEm(m.pos.x, m.pos.z);
    this.etapaAtual = etapa;
    const dentro = etapa >= 0;
    // aviso de etapa ao entrar em cada parte
    if (etapa !== this.etapaAvisada && m.jogo.estado) {
      const nomeChefe = this.nomeChefe;
      if (etapa >= 0 && etapa < T.nEtapas && etapa > this.etapaAvisada) {
        const nv = niveisDaEtapa(m.mediaEquipe(), etapa, this.id, this.nivelMasmorra);
        m.jogo.mostrarZona(etapa === 0 && this.etapaAvisada < 0 ? `${this.cfg.nome} · Nível ${this.nivelMasmorra}` : this.cfg.etapas[etapa].nome);
        if (etapa === 0 && this.etapaAvisada < 0) m.jogo.aviso(this.cfg.etapas[0].nome + '.');
        m.jogo.aviso(`Grupos daqui: comuns Nv.${nv.comum}, líderes Nv.${nv.lider}.`);
      } else if (etapa === T.nEtapas) {
        m.jogo.mostrarZona(this.cfg.fim);
        if (this.chefe) m.jogo.aviso(`O chefe ${nomeChefe} (Nv.${this.chefe.dados.nivel}) espera no ${this.cfg.fim}. Encoste nele para lutar.`);
        else m.jogo.aviso(`O ${this.cfg.fim} está vazio. Um novo chefe chega no próximo amanhecer.`);
      } else if (etapa === -1 && this.etapaAvisada >= 0) {
        m.jogo.mostrarZona(this.cfg.regiao);
      }
      this.etapaAvisada = etapa;
    }
    // clima: quanto mais fundo, mais escuro e cheio de partículas
    const { s } = T.local(m.pos.x, m.pos.z);
    const alvo = Math.max(0, Math.min(1, (s - (T.sInicio - 12)) / 50)) * (T.fora(m.pos.x, m.pos.z) < 6 ? 1 : 0);
    this.fator += (alvo - this.fator) * Math.min(1, dt * 1.5);
    const f = this.fator;
    if (f > 0.001) {
      m.cena.background.lerp(this.corCeu, f * 0.75);
      m.cena.fog.color.copy(m.cena.background);
      m.hemi.color.lerp(this.corHemi, f * 0.5);
      m.cena.fog.near = 40 - 18 * f;
      m.cena.fog.far = 115 - 40 * f;
    }
    this.particulas.visible = f > 0.01;
    this.particulas.material.opacity = Math.min(0.9, f * 1.2);
    if (this.particulas.visible) this.moverParticulas(dt, t);
    // portões ficam transparentes quando você está logo antes ou embaixo deles
    for (const pt of this.portoes) {
      const ds = s - pt.s;
      const alvoOp = ds > -3 && ds < 9 && Math.hypot(m.pos.x - pt.x, m.pos.z - pt.z) < 14 ? 0.18 : 1;
      if (Math.abs(alvoOp - pt.op) > 0.01) {
        pt.op += (alvoOp - pt.op) * Math.min(1, dt * 6);
        for (const mt of pt.mats) { mt.opacity = pt.op; mt.depthWrite = pt.op > 0.9; }
      }
    }
    this.atualizarExtras(dt, t);
    this.atualizarAcampamentos(dt);
    this.atualizarSoltos(dentro);
    this.atualizarChefe();
    if (this.chefe) {
      animarModelo(this.chefe.modelo, t, false);
      this.chefe.modelo.position.y = this.y(this.chefe.x, this.chefe.z);
    }
  }
}
