// =============================================================
// O PROTAGONISTA (o jogador no mapa)
// Masculino ou feminino, com corpo de gente (pelas referências do Lâmina), cor da pele,
// cor do cabelo e a roupa (skin). Feito de formas simples, sem .glb.
// A frente aponta para +Z. As pernas e os braços giram pelo "pivô" (ombro e quadril).
// Para pesar pouco no celular: as peças sem textura levam a cor em cada vértice e usam
// um material só, e o juntarPecas junta tudo numa malha por pedaço que mexe
// (corpo, cabeça, 2 pernas e 2 braços). Só as estampas (listras, retalhos...) ficam à parte.
// =============================================================
import * as THREE from 'three';
import { juntarPecas } from './modelos.js';

// O personagem de quem ainda não escolheu (e dos jogos salvos de antes da criação de personagem)
export const PERSONAGEM_PADRAO = { genero: 'm', skin: 'explorador', pele: 1, cabelo: 1 };

const GEO = {};
const geo = (k, f) => (GEO[k] ||= f());
const G = {
  esf: (r, w = 8, h = 6) => geo(`e${r}|${w}|${h}`, () => new THREE.SphereGeometry(r, w, h)),
  meia: (r, w = 9, h = 4, fim = Math.PI / 2) => geo(`m${r}|${w}|${h}|${fim}`, () => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, fim)),
  ico: (r, d = 1) => geo(`i${r}|${d}`, () => new THREE.IcosahedronGeometry(r, d)),
  cone: (r, h, s = 5) => geo(`c${r}|${h}|${s}`, () => new THREE.ConeGeometry(r, h, s)),
  cil: (a, b, h, s = 7, aberto = false) => geo(`y${a}|${b}|${h}|${s}|${aberto}`, () => new THREE.CylinderGeometry(a, b, h, s, 1, aberto)),
  caixa: (x, y, z) => geo(`x${x}|${y}|${z}`, () => new THREE.BoxGeometry(x, y, z)),
  toro: (r, t, s = 12) => geo(`t${r}|${t}|${s}`, () => new THREE.TorusGeometry(r, t, 4, s)),
  octa: (r) => geo(`o${r}`, () => new THREE.OctahedronGeometry(r, 0)),
};
// materiais repartidos entre todos os bonecos (fixo: o descartar não apaga)
const MATS = {};
const MAT_COR = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
MAT_COR.userData.fixo = true;
let TEXTURADOS = [];
function M(c, extra) {
  if (c && c.isMaterial) return c;
  const k = c + JSON.stringify(extra || {});
  if (!MATS[k]) { MATS[k] = new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...(extra || {}) }); MATS[k].userData.fixo = true; }
  return MATS[k];
}
const brilho = (c, i = 0.9) => M(c, { emissive: c, emissiveIntensity: i });
// a mesma forma, mas com a cor pintada em cada vértice (para juntar com as outras cores)
const _cor = new THREE.Color();
function comCor(g, c) {
  const n = g.index ? g.toNonIndexed() : g.clone();
  _cor.set(c);
  const total = n.attributes.position.count, cor = new Float32Array(total * 3);
  for (let i = 0; i < total; i++) { cor[i * 3] = _cor.r; cor[i * 3 + 1] = _cor.g; cor[i * 3 + 2] = _cor.b; }
  n.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  return n;
}
// Cria uma peça: p(grupo, forma, cor ou material, [x,y,z], [rotX,rotY,rotZ], escala)
function p(pai, g, m, pos, rot, esc) {
  const o = typeof m === 'string' ? new THREE.Mesh(comCor(g, m), MAT_COR) : new THREE.Mesh(g, M(m));
  if (typeof m === 'string') o.userData.geometriaPropria = true;
  if (o.material.map) TEXTURADOS.push(o); // peças com textura não entram na junção (ela não guarda as coordenadas da textura)
  o.position.set(...pos);
  if (rot) o.rotation.set(...rot);
  if (esc != null) typeof esc === 'number' ? o.scale.setScalar(esc) : o.scale.set(...esc);
  pai.add(o);
  return o;
}

// ---------- texturas pequenas (desenhadas uma vez) ----------
function textura(w, h, desenhar, cor = '#fffffe') {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  desenhar(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  const m = new THREE.MeshLambertMaterial({ color: cor, map: t, flatShading: true });
  m.userData.fixo = true;
  return m;
}
let TEX;
function texturas() {
  if (TEX) return TEX;
  TEX = {
    listras: textura(64, 8, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f6e6dc' : '#d8504a'; g.fillRect(i * 8, 0, 8, h); } }, '#fffffe'),
    retalhos: textura(64, 64, (g, w, h) => {
      const cores = ['#e8553f', '#f0b43c', '#3fa58a', '#3a4a7a', '#e98b3a', '#7ab8c8', '#f2e2c4'];
      let k = 0;
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) for (const t of [0, 1]) {
        g.fillStyle = cores[(k++ * 3 + y) % cores.length]; g.beginPath();
        const X = x * 16, Y = y * 16;
        if (t) { g.moveTo(X, Y); g.lineTo(X + 16, Y); g.lineTo(X, Y + 16); } else { g.moveTo(X + 16, Y); g.lineTo(X + 16, Y + 16); g.lineTo(X, Y + 16); }
        g.fill();
      }
      g.fillStyle = '#f5d76e';
      for (const [x, y] of [[10, 40], [44, 12], [50, 50], [26, 22]]) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 2 : 5; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill(); }
    }, '#fffffd'),
    bolinhas: textura(32, 16, (g, w, h) => { g.fillStyle = '#f2cc3a'; g.fillRect(0, 0, w, h); const c = ['#e8553f', '#3a8ee0', '#4fae5a']; for (let i = 0; i < 6; i++) { g.fillStyle = c[i % 3]; g.beginPath(); g.arc(3 + i * 5.3, i % 2 ? 4 : 11, 2.2, 0, 7); g.fill(); } }, '#fffffc'),
    arminho: textura(32, 16, (g, w, h) => { g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a2a'; for (let i = 0; i < 5; i++) g.fillRect(3 + i * 6, i % 2 ? 3 : 10, 2, 3); }, '#fffffb'),
    chapeuPalhaco: textura(8, 32, (g, w, h) => { const c = ['#e8553f', '#f0b43c', '#4fae5a', '#3a8ee0']; for (let i = 0; i < 8; i++) { g.fillStyle = c[i % 4]; g.fillRect(0, i * 4, w, 4); } }, '#fffffa'),
  };
  return TEX;
}

export const PELES = ['#f7d9bd', '#efc39c', '#d39a6c', '#a06a45', '#6a432c'];
export const CABELOS = ['#2a1d17', '#5a3a26', '#c9963f', '#b8432f', '#3b4fa8', '#e8e8f0'];

// ---------- as roupas (skins) ----------
// tronco/mangas/calça: cor ou material; mangas 'longa' | 'curta'; calca 'curta' | 'longa' | 'bufante'
// como: 'gratis' | 'campeao' (Campeão do Reino) | 'loja' (Loja do Reino, com ouro)
export const SKINS = {
  explorador: { nome: 'Explorador(a)', como: 'gratis', icone: '🧢', texto: 'Boné com cristal, colete de bolsos, bermuda cargo, botas e luvas.', tronco: '#efe3c8', mangas: 'longa', corManga: '#efe3c8', dobra: true, calca: 'curta', corCalca: '#3c3f45', bolsos: true,
    sapato: 'bota', corSapato: '#6b4630', luvas: '#4a3328', relogio: true, colete: '#5f6b74', bone: '#c9474d', mochila: '#7a5236', cachecol: false },
  utilitario: { nome: 'Utilitário', como: 'gratis', icone: '🎒', texto: 'Jaqueta utilitária, colar de dentes, calça cargo, mochila e cachecol.', tronco: '#efe3c8', mangas: 'longa', corManga: '#6f7f8f', dobra: true, calca: 'longa', corCalca: '#3a3c42', bolsos: true,
    sapato: 'bota', corSapato: '#5e3e2c', luvas: '#4a3328', relogio: true, jaqueta: '#6f7f8f', bone: '#c9474d', mochila: '#b49a64', colar: true, cachecol: '#7a5236' },
  real: { nome: 'Traje Real', como: 'campeao', icone: '👑', texto: 'Manto com arminho, botas e manoplas douradas e o cetro.', tronco: '#7a1630', mangas: 'longa', corManga: '#7a1630', calca: 'longa', corCalca: '#5a1024', sapato: 'botaReal', corSapato: '#c9a247',
    luvas: 'manopla', manto: '#7a1630', cetro: true },
  palhaco: { nome: 'Palhaço', como: 'loja', preco: 2000, icone: '🤡', texto: 'Gola de babado, camisa listrada, calça de retalhos e os sapatões.', tronco: 'listras', mangas: 'longa', corManga: 'listras', calca: 'bufante', corCalca: 'retalhos', sapato: 'palhaco', golaPalhaco: true, chapeuPalhaco: true, pompons: true },
};

// Só o que é válido (jogo salvo antigo ou mexido): o resto volta para o padrão
export function normalizarPersonagem(pp) {
  const o = { ...PERSONAGEM_PADRAO, ...(pp || {}) };
  if (o.genero !== 'f') o.genero = 'm';
  if (!SKINS[o.skin]) o.skin = PERSONAGEM_PADRAO.skin;
  o.pele = Math.min(PELES.length - 1, Math.max(0, Math.floor(+o.pele) || 0));
  o.cabelo = Math.min(CABELOS.length - 1, Math.max(0, Math.floor(+o.cabelo) || 0));
  return { genero: o.genero, skin: o.skin, pele: o.pele, cabelo: o.cabelo };
}

// coroa: a Coroa do Rei na cabeça (o chapéu sai)
export function criarPersonagem({ genero = 'm', skin = 'explorador', pele = 1, cabelo = 1, olhos = '#d99a2b', coroa = false } = {}) {
  const T = texturas();
  TEXTURADOS = [];
  const s = SKINS[skin] || SKINS.explorador;
  const mat = (c) => (typeof c === 'string' && T[c]) ? T[c] : c;
  const f = genero === 'f';
  const r = new THREE.Group();
  const c = new THREE.Group();
  r.add(c);
  const corPele = PELES[pele] || PELES[1], corCab = CABELOS[cabelo] || CABELOS[1];
  const tronco = mat(s.tronco), manga = mat(s.corManga || corPele), calca = mat(s.corCalca);
  // ---- medidas (masculino; o feminino é um pouco menor e mais fino) ----
  const k = f ? 0.95 : 1;
  const yQuadril = 0.86 * k, yOmbro = 1.4 * k, yCabeca = 1.6 * k;
  const larOmbro = f ? 0.19 : 0.235, larQuadril = f ? 0.115 : 0.1;
  const pernas = [], bracos = [];
  for (const lado of [-1, 1]) {
    // perna: coxa e canela; a calça cobre conforme o modelo
    const pv = new THREE.Group(); pv.position.set(lado * larQuadril, yQuadril, 0);
    const coxaR = f ? 0.085 : 0.08;
    const canela = s.calca === 'longa' || s.calca === 'bufante' ? calca : corPele;
    if (s.calca === 'bufante') {
      p(pv, G.cil(0.1, 0.13, 0.42, 7), calca, [0, -0.2, 0]);
      p(pv, G.cil(0.13, 0.08, 0.36, 7), calca, [0, -0.58, 0]);
      p(pv, G.cil(0.06, 0.06, 0.04, 7), '#e8553f', [0, -0.77, 0]);
    } else {
      p(pv, G.cil(coxaR, coxaR * 0.88, 0.2, 7), calca, [0, -0.1, 0]);
      p(pv, G.cil(coxaR * 0.88, 0.064, 0.21, 7), calca, [0, -0.305, 0]);
      if (s.calca === 'curta') p(pv, G.cil(0.082, 0.082, 0.05, 7), calca, [0, -0.39, 0], null, [1.12, 1, 1.12]); // barra dobrada
      p(pv, G.cil(0.062, 0.045, 0.4, 7), canela, [0, -0.61, 0]);
      if (s.calca === 'longa') p(pv, G.cil(0.06, 0.06, 0.06, 7), calca, [0, -0.73, 0], null, [1.15, 1, 1.15]);
    }
    if (s.bolsos) p(pv, G.caixa(0.04, 0.1, 0.08), calca, [lado * 0.07, s.calca === 'curta' ? -0.27 : -0.3, 0.0]);
    // pé
    if (!s.sapato) p(pv, G.caixa(0.09, 0.06, 0.22), corPele, [0, -0.83, 0.045]);
    if (s.sapato === 'bota') { p(pv, G.cil(0.065, 0.068, 0.14, 7), s.corSapato, [0, -0.77, 0]); p(pv, G.caixa(0.11, 0.08, 0.22), s.corSapato, [0, -0.82, 0.045]); p(pv, G.caixa(0.12, 0.03, 0.235), '#3a2a20', [0, -0.85, 0.045]); }
    if (s.sapato === 'botaReal') { p(pv, G.cil(0.075, 0.065, 0.24, 7), s.corSapato, [0, -0.72, 0]); p(pv, G.caixa(0.1, 0.07, 0.22), s.corSapato, [0, -0.82, 0.05]); p(pv, G.caixa(0.11, 0.06, 0.1), s.corSapato, [0, -0.6, 0.02]); }
    if (s.sapato === 'palhaco') { p(pv, G.caixa(0.13, 0.1, 0.18), '#d8443a', [0, -0.8, 0.0]); p(pv, G.ico(0.1, 0), '#f0b43c', [0, -0.81, 0.15], null, [1.1, 0.75, 1.2]); p(pv, G.caixa(0.15, 0.03, 0.34), '#7a2a22', [0, -0.85, 0.07]); }
    c.add(pv); pernas.push(pv);
    // braço: um pouco aberto (pose A leve), braço e antebraço
    const pb = new THREE.Group(); pb.position.set(lado * larOmbro, yOmbro - 0.03, 0); pb.rotation.z = lado * 0.12;
    const bR = f ? 0.045 : 0.052;
    p(pb, G.cil(bR, bR * 0.85, 0.29, 6), manga, [0, -0.15, 0]);
    p(pb, G.cil(bR * 0.85, bR * 0.7, 0.27, 6), s.mangas === 'longa' ? manga : corPele, [0, -0.43, 0]);
    if (s.dobra) p(pb, G.cil(bR * 0.95, bR * 0.95, 0.06, 6), s.tronco === '#efe3c8' ? '#efe3c8' : manga, [0, -0.37, 0]);
    if (s.luvas === 'manopla') { p(pb, G.cil(0.05, 0.065, 0.12, 6), '#c9a247', [0, -0.53, 0]); p(pb, G.caixa(0.08, 0.12, 0.09), '#c9a247', [0, -0.64, 0.0]); p(pb, G.octa(0.025), brilho('#6fc8ff'), [lado * 0.0, -0.52, 0.06]); }
    else if (s.luvas) { p(pb, G.caixa(0.07, 0.08, 0.085), s.luvas, [0, -0.6, 0]); p(pb, G.caixa(0.065, 0.05, 0.07), corPele, [0, -0.665, 0.005]); }
    else p(pb, G.caixa(0.065, 0.12, 0.08), corPele, [0, -0.62, 0]);
    if (s.relogio && lado < 0) { p(pb, G.cil(0.045, 0.045, 0.03, 6), '#5a3a26', [0, -0.53, 0]); p(pb, G.octa(0.022), brilho('#7ab8ff', 0.7), [0, -0.53, 0.045]); }
    if (s.cetro && lado > 0) { p(pb, G.cil(0.015, 0.015, 0.7, 5), '#b8864a', [0, -0.6, 0.08]); p(pb, G.ico(0.045, 0), brilho('#5ab0ff', 1), [0, -0.22, 0.08]); p(pb, G.cil(0.03, 0.02, 0.05, 5), '#c9a247', [0, -0.26, 0.08]); }
    c.add(pb); bracos.push(pb);
  }
  // ---- tronco ----
  const zE = f ? 0.62 : 0.6;
  p(c, G.cil(f ? 0.16 : 0.15, f ? 0.17 : 0.155, 0.16, 8), calca, [0, yQuadril + 0.04, 0], null, [1, 1, zE + 0.05]); // quadril
  p(c, G.cil(f ? 0.125 : 0.145, f ? 0.155 : 0.15, 0.2, 8), tronco, [0, yQuadril + 0.21, 0], null, [1, 1, zE]); // barriga
  p(c, G.cil(f ? 0.17 : 0.215, f ? 0.13 : 0.15, 0.25, 8), tronco, [0, yOmbro - 0.115, 0], null, [1, 1, zE]); // peito
  if (f) for (const lado of [-1, 1]) p(c, G.esf(0.05, 6, 4), tronco, [lado * 0.056, yOmbro - 0.16, 0.055], null, [1, 0.8, 0.5]);
  for (const lado of [-1, 1]) p(c, G.esf(f ? 0.048 : 0.056, 6, 4), manga, [lado * (larOmbro - 0.01), yOmbro - 0.045, 0]); // ombros
  // cinto
  { p(c, G.cil(f ? 0.162 : 0.157, f ? 0.162 : 0.157, 0.035, 8), '#6b5240', [0, yQuadril + 0.11, 0], null, [1, 1, zE + 0.07]); p(c, G.caixa(0.05, 0.035, 0.02), '#b9b2a4', [0, yQuadril + 0.11, f ? 0.11 : 0.105]); }
  // pescoço e cabeça
  p(c, G.cil(0.045, 0.05, 0.1, 6), corPele, [0, yOmbro + 0.04, 0]);
  const cab = new THREE.Group(); cab.position.set(0, yCabeca, 0); cab.scale.setScalar(1.1); c.add(cab);
  p(cab, G.ico(0.12, 1), corPele, [0, 0, 0], null, [f ? 0.92 : 0.95, 1.15, 1]);
  p(cab, G.cone(0.075, 0.08, 5), corPele, [0, -0.08, 0.035], [Math.PI, 0, 0], [1.2, 1, 0.9]); // queixo
  p(cab, G.cone(0.016, 0.045, 4), corPele, [0, -0.035, 0.125], [Math.PI / 2 + 0.3, 0, 0]); // nariz
  for (const lado of [-1, 1]) {
    p(cab, G.caixa(0.04, 0.024, 0.01), '#ffffff', [lado * 0.042, -0.005, 0.112]);
    p(cab, G.caixa(0.018, 0.024, 0.01), olhos, [lado * 0.042, -0.005, 0.117]);
    p(cab, G.caixa(0.008, 0.014, 0.01), '#1b1b20', [lado * 0.042, -0.005, 0.12]);
    p(cab, G.caixa(0.05, 0.012, 0.012), f ? corCab : '#3a2a20', [lado * 0.044, 0.026, 0.112], [0, 0, lado * (f ? -0.12 : -0.05)]); // sobrancelha
    p(cab, G.caixa(0.012, 0.035, 0.03), corPele, [lado * 0.11, 0.0, 0]); // orelha
  }
  p(cab, G.caixa(0.035, 0.008, 0.01), '#b56a5a', [0, -0.075, 0.1]); // boca
  // cabelo (sem chapéu, ou embaixo do boné)
  const temBone = !!s.bone && !coroa, temCoroa = coroa;
  p(cab, G.meia(0.13, 9, 4), corCab, [0, 0.03, -0.015], [-0.3, 0, 0], [1.02, 1.1, 1.08]);
  if (f) {
    // franja de lado, mechas na frente das orelhas e rabo de cavalo alto
    p(cab, G.cone(0.055, 0.15, 4), corCab, [-0.05, 0.07, 0.095], [2.3, 0, -0.5], [1, 1, 0.45]);
    p(cab, G.cone(0.045, 0.12, 4), corCab, [0.05, 0.08, 0.095], [2.4, 0, 0.6], [1, 1, 0.45]);
    for (const lado of [-1, 1]) p(cab, G.cone(0.035, 0.18, 4), corCab, [lado * 0.105, -0.04, 0.05], [Math.PI, 0, lado * 0.15], [1, 1, 0.6]);
    p(cab, G.caixa(0.2, 0.12, 0.06), corCab, [0, -0.0, -0.1]);
    if (temBone) { p(cab, G.cil(0.03, 0.03, 0.03, 6), '#5a6a9a', [0, 0.06, -0.15], [1.2, 0, 0]); } // sai pelo buraco de trás do boné
    else {
      p(cab, G.esf(0.05, 6, 4), corCab, [0, 0.15, -0.1]);
      p(cab, G.cil(0.032, 0.032, 0.03, 6), '#5a6a9a', [0, 0.19, -0.11], [-0.3, 0, 0]); // prendedor
      p(cab, G.cone(0.06, 0.12, 5), corCab, [0, 0.25, -0.13], [-0.4, 0, 0]); // rabo de cavalo subindo
    }
    p(cab, G.cone(0.065, 0.3, 5), corCab, [0, 0.08, -0.22], [-2.85, 0, 0]); // e caindo nas costas
  } else {
    // repicado: pontas para frente e dos lados
    for (const [x, y, z, rx, rz] of [[-0.07, 0.08, 0.08, 2.3, -0.4], [-0.01, 0.09, 0.09, 2.4, 0.1], [0.06, 0.085, 0.085, 2.35, 0.5], [-0.105, 0.04, 0.04, 2.7, -0.55], [0.11, 0.04, 0.04, 2.7, 0.55], [0.0, 0.14, -0.02, -0.5, 0.2]])
      p(cab, G.cone(0.045, 0.12, 4), corCab, [x, y, z], [rx, 0, rz], [1, 1, 0.5]);
    for (const lado of [-1, 1]) p(cab, G.cone(0.035, 0.13, 4), corCab, [lado * 0.11, -0.03, -0.01], [Math.PI, 0, lado * 0.1], [1, 1, 0.6]);
    p(cab, G.caixa(0.2, 0.09, 0.04), corCab, [0, -0.03, -0.112]);
  }
  // ---- acessórios ----
  if (temBone) {
    p(cab, G.meia(0.138, 8, 3), s.bone, [0, 0.045, -0.01], [-0.22, 0, 0], [1.02, 0.95, 1.1]);
    p(cab, G.caixa(0.17, 0.015, 0.11), s.bone, [0, 0.06, 0.17], [0.1, 0, 0]);
    p(cab, G.cil(0.012, 0.012, 0.02, 5), s.bone, [0, 0.16, 0]);
    p(cab, G.cil(0.035, 0.035, 0.012, 6), '#c9a27a', [0, 0.1, 0.12], [Math.PI / 2 - 0.45, 0, 0]);
    p(cab, G.octa(0.025), brilho('#5a8cff', 1.1), [0, 0.1, 0.13], null, [1, 1, 0.5]);
  }
  if (temCoroa) {
    const ouro = M('#d4a83a', { emissive: '#7a5a10', emissiveIntensity: 0.35 });
    p(cab, G.cil(0.125, 0.12, 0.05, 8, true), ouro, [0, 0.11, 0]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; p(cab, G.cone(0.035, i % 2 ? 0.07 : 0.11, 4), ouro, [Math.sin(a) * 0.118, 0.17 + (i % 2 ? -0.02 : 0), Math.cos(a) * 0.118]); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 8; p(cab, G.octa(0.016), brilho(i % 2 ? '#3fc06a' : '#e0384a', 0.5), [Math.sin(a) * 0.128, 0.11, Math.cos(a) * 0.128]); }
  }
  if (s.chapeuPalhaco && !coroa) { p(cab, G.cone(0.05, 0.13, 8), T.chapeuPalhaco, [0.05, 0.15, 0.0], [0, 0, -0.35]); p(cab, G.ico(0.018, 0), '#f0b43c', [0.078, 0.215, 0]); }
  if (s.colete) {
    // colete aberto na frente, com bolsos e o cristal no bolso do peito
    for (const lado of [-1, 1]) {
      p(c, G.caixa(0.15, 0.4, 0.035), s.colete, [lado * 0.11, yOmbro - 0.2, 0.11], [0, lado * -0.25, 0]);
      for (const y of [0.12, 0.27]) p(c, G.caixa(0.075, 0.06, 0.03), '#9a7a58', [lado * 0.105, yOmbro - y - 0.12, 0.135], [0, lado * -0.25, 0]);
    }
    p(c, G.caixa(0.38, 0.4, 0.04), s.colete, [0, yOmbro - 0.2, -0.105]);
    p(c, G.octa(0.025), brilho('#bfa6ff', 0.6), [0.1, yOmbro - 0.1, 0.15], null, [0.6, 1.4, 0.6]);
  }
  if (s.jaqueta) {
    for (const lado of [-1, 1]) {
      p(c, G.caixa(0.13, 0.42, 0.035), s.jaqueta, [lado * 0.14, yOmbro - 0.2, 0.105], [0, lado * -0.3, 0]);
      p(c, G.caixa(0.06, 0.12, 0.03), '#c9b88a', [lado * 0.15, yOmbro - 0.33, 0.13], [0, lado * -0.3, 0]);
    }
    p(c, G.caixa(0.42, 0.42, 0.04), s.jaqueta, [0, yOmbro - 0.2, -0.1]);
    p(c, G.cil(0.09, 0.12, 0.08, 7, true), '#8090a0', [0, yOmbro + 0.03, -0.01], null, [1, 1, 0.8]); // gola alta
  }
  if (s.colar) for (let i = -1; i <= 1; i++) p(c, G.cone(0.012, 0.045, 4), '#e8e2d2', [i * 0.035, yOmbro - 0.1 - Math.abs(i) * -0.01, 0.12], [Math.PI, 0, i * 0.3]);
  if (s.mochila) {
    p(c, G.caixa(0.3, 0.36, 0.14), s.mochila, [0, yOmbro - 0.22, -0.2]);
    p(c, G.caixa(0.24, 0.13, 0.06), '#8a5a3a', [0, yOmbro - 0.32, -0.29]);
    p(c, G.caixa(0.31, 0.06, 0.15), '#8a5a3a', [0, yOmbro - 0.05, -0.2]);
    for (const lado of [-1, 1]) p(c, G.caixa(0.028, 0.32, 0.015), '#4a3020', [lado * 0.13, yOmbro - 0.14, 0.13], [0, 0, lado * 0.08]);
  }
  if (s.cachecol) { p(c, G.toro(0.075, 0.03, 8), s.cachecol, [0, yOmbro + 0.0, 0.0], [Math.PI / 2, 0, 0], [1, 1.2, 1]); p(c, G.caixa(0.06, 0.16, 0.02), s.cachecol, [0.04, yOmbro - 0.1, 0.13], [0, 0, 0.15]); }
  if (s.manto) {
    // manto com gola de arminho, barra dourada e punhos de arminho
    p(c, G.cil(0.24, 0.34, 1.0, 8, true), s.manto, [0, yOmbro - 0.5, -0.03], null, [1, 1, 0.75]);
    p(c, G.cil(0.15, 0.25, 0.1, 8), T.arminho, [0, yOmbro + 0.0, 0], null, [1, 1, 0.8]);
    p(c, G.cil(0.343, 0.343, 0.04, 8, true), '#d4a83a', [0, yOmbro - 0.99, -0.03], null, [1, 1, 0.75]);
    p(c, G.caixa(0.03, 0.55, 0.02), '#d4a83a', [0, yOmbro - 0.38, 0.1]);
    p(c, G.cil(0.157, 0.157, 0.05, 8), '#8a5a2a', [0, yQuadril + 0.12, 0], null, [1, 1, zE + 0.1]);
    for (const b of bracos) p(b, G.cil(0.06, 0.06, 0.07, 6), T.arminho, [0, -0.5, 0]);
  }
  if (s.golaPalhaco) { const g = p(c, G.cil(0.13, 0.25, 0.07, 14), T.bolinhas, [0, yOmbro + 0.0, 0], null, [1, 1, 0.85]); }
  if (s.pompons) [['#e86aa8', 0.05], ['#a6d83a', -0.07], ['#3a5ae0', -0.19]].forEach(([cor, dy]) => p(c, G.ico(0.025, 0), cor, [0, yOmbro - 0.1 + dy, 0.13]));
  if (s.calca === 'bufante') for (const lado of [-1, 1]) p(c, G.ico(0.07, 0), '#a89888', [lado * 0.2, yQuadril - 0.02, 0.02], null, [0.7, 1, 1]);
  r.userData = { corpo: c, pernas, bracos, caudas: [], asas: [], giros: [], orbitas: [], pulsos: [], fumacas: [], fase: 0, tamanho: 1, cabeca: cab, personagem: true };
  // sombra redonda no chão (como a dos monstros)
  const sombra = new THREE.Mesh(GEO_SOMBRA, MAT_SOMBRA_P);
  sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.05; sombra.scale.setScalar(0.42);
  r.add(sombra);
  r.userData.sombra = sombra;
  juntarPecas(r, new Set([...pernas, ...bracos, cab, sombra, ...TEXTURADOS]));
  return r;
}
const GEO_SOMBRA = new THREE.CircleGeometry(1, 16);
const MAT_SOMBRA_P = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
MAT_SOMBRA_P.userData.fixo = true;

// para os testes: quantas malhas (≈ pedidos de desenho) e triângulos
export function contarDesenhos(o) { let n = 0; o.traverse((x) => { if (x.isMesh) n++; }); return n; }
export function contarTriangulos(o) { let n = 0; o.traverse((x) => { if (x.isMesh) { const g = x.geometry; n += (g.index ? g.index.count : g.attributes.position.count) / 3; } }); return n; }
