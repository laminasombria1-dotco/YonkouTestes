// =============================================================
// SENTINELA DE GEADA: o modelo e a animação (etapa 5.4, o 3º lendário)
// Era o chefe golem de gelo e pedra da Arena das Brasas. Feito das peças do Blender da Arena
// (g_nucleo, g_olho, g_estilhaco, g_ombro, g_lamina, g_base em js/arena/pecas_blender.js):
// núcleo em ovo com o olho-portal, coroa de cristais, pedregulhos nos ombros, braços com lâminas
// de gelo, pedrinhas flutuando em anel e a base de cristais no chão. A neve cai devagar em volta
// dela e as pontas dos cristais cintilam. Trazido de ARENA_PROTOTIPO/js/modelos.js (geadaBlender, animarGeada).
//   parado: flutua devagar e as lâminas balançam · andando: passos curtos das lâminas
//   golpe de perto (Lâminas Cravadas): ergue as lâminas acima da coroa e crava no chão
//   disparo (Estilhaços): ergue as duas lâminas e desce para a frente, lançando os estilhaços
//   área (Anel de Gelo): abre os braços e gira como um pião; as pedrinhas espalham
// A frente olha para +Z, como todo monstro do jogo.
// =============================================================
import * as THREE from 'three';
import { peca } from '../arena/pecas.js';

// a Sentinela da Arena tem uns 4,8 m de altura; aqui ela fica menor (a espécie ainda aumenta pelo "tamanho")
export const ESCALA_GEADA = 0.42;

const grupo = (pai, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); pai.add(g); return g; };
const lado = (nome, s) => { const o = peca(nome); o.scale.x = s; return o; };
const mix = (a, b, k) => a + (b - a) * k;
const ease = (t) => t * t * (3 - 2 * t);
const lim = (t) => Math.min(1, Math.max(0, t));

// ---- neve e cintilas: pontos redondos (textura feita uma vez só e reaproveitada)
let _texFloco = null;
function texFloco() {
  if (_texFloco) return _texFloco;
  const n = 32, d = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = ((x + 0.5) / n) * 2 - 1, dy = ((y + 0.5) / n) * 2 - 1, a = Math.max(0, 1 - Math.hypot(dx, dy)), i = (y * n + x) * 4;
    d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.round(255 * a ** 1.5);
  }
  _texFloco = new THREE.DataTexture(d, n, n); _texFloco.needsUpdate = true;
  return _texFloco;
}
// o = { n, r0, r1 (raio do cilindro), y0, y1, vel (queda), giro, cor, tam, opac, soma (aditivo); cintila + pontos: pisca no lugar, não cai }
function nuvemFlocos(pai, o) {
  const n = o.pontos ? o.pontos.length : o.n, pos = new Float32Array(n * 3), cor = new Float32Array(n * 3).fill(1), f = [];
  for (let i = 0; i < n; i++) f.push({ a: Math.random() * Math.PI * 2, r: (o.r0 ?? 0) + Math.random() * ((o.r1 ?? 0) - (o.r0 ?? 0)), y: (o.y0 ?? 0) + Math.random() * ((o.y1 ?? 0) - (o.y0 ?? 0)), v: 0.6 + Math.random() * 0.8, fase: Math.random() * 7, p: o.pontos ? o.pontos[i] : null });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  const m = new THREE.PointsMaterial({ color: o.cor, size: o.tam, map: texFloco(), transparent: true, opacity: o.opac, depthWrite: false, vertexColors: true, blending: o.soma ? THREE.AdditiveBlending : THREE.NormalBlending });
  const p = new THREE.Points(g, m);
  p.frustumCulled = false; p.renderOrder = 3; p.userData.flocos = { f, o }; p.userData.geometriaPropria = true;
  pai.add(p); mexerFlocos(p, 0, 0, 1);
  return p;
}
// forca 0..1 · vento > 0 espalha a neve para fora (giros e golpes)
function mexerFlocos(p, dt, t, forca, vento = 0) {
  const { f, o } = p.userData.flocos, A = p.geometry.attributes.position.array, K = p.geometry.attributes.color.array;
  for (let i = 0; i < f.length; i++) {
    const q = f[i];
    if (o.cintila) { // perto de um cristal, pisca (brilho de gelo)
      const b = Math.max(0, Math.sin(t * (1.6 + q.v * 1.6) + q.fase)) ** 4;
      A[i * 3] = q.p[0] + Math.sin(t * 0.8 + q.fase) * 0.08; A[i * 3 + 1] = q.p[1] + Math.sin(t * 0.6 + q.fase * 2) * 0.1; A[i * 3 + 2] = q.p[2];
      K[i * 3] = K[i * 3 + 1] = K[i * 3 + 2] = b;
      continue;
    }
    q.y -= o.vel * q.v * dt; q.a += ((o.giro + vento * 2) * dt) / Math.max(q.r, 0.5); q.r += vento * 3 * dt;
    if (q.y < o.y0 || q.r > o.r1 + 2.5) { q.y = o.y1 - Math.random() * 0.4; q.r = o.r0 + Math.random() * (o.r1 - o.r0); q.a = Math.random() * Math.PI * 2; }
    const bal = Math.sin(t * 1.3 + q.fase) * 0.18; // balança de leve enquanto cai
    A[i * 3] = Math.cos(q.a) * q.r + bal; A[i * 3 + 1] = q.y; A[i * 3 + 2] = Math.sin(q.a) * q.r + Math.cos(t * 1.1 + q.fase) * 0.12;
    const u = (q.y - o.y0) / (o.y1 - o.y0), b = Math.max(0, Math.min(1, u * 5, (1 - u) * 6)); // aparece em cima e some perto do chão
    K[i * 3] = K[i * 3 + 1] = K[i * 3 + 2] = b;
  }
  p.material.opacity = o.opac * forca;
  p.geometry.attributes.position.needsUpdate = true; p.geometry.attributes.color.needsUpdate = true;
}

export function montarGeada(c, u) {
  const raiz = grupo(c);
  raiz.scale.setScalar(ESCALA_GEADA);
  const J = {};
  J.corpo = grupo(raiz, 0, 2.6, 0); J.corpo.add(peca('g_nucleo'));
  J.olho = grupo(J.corpo, 0, 0.45, 1.07); J.olho.add(peca('g_olho'));
  J.anel = grupo(J.corpo, 0, 0.1, 0); J.estilhacos = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3, e = peca('g_estilhaco');
    e.position.set(Math.cos(a) * 2.9, 0.1 + Math.sin(i * 1.9) * 0.9, Math.sin(a) * 2.9);
    e.rotation.set(Math.sin(i * 2.3) * 0.5, i, Math.cos(a) * 0.4); e.scale.setScalar(i % 2 ? 0.7 : 1);
    e.userData.y0 = e.position.y; e.userData.fase = i * 0.9; J.anel.add(e); J.estilhacos.push(e);
  }
  for (const [s, k] of [[-1, 'E'], [1, 'D']]) {
    J['braco' + k] = grupo(J.corpo, s * 1.25, 1.0, 0); J['braco' + k].add(lado('g_ombro', s));
    J['ante' + k] = grupo(J['braco' + k], s * 0.55, -1.0, 0.05); J['ante' + k].add(lado('g_lamina', s));
  }
  J.base = grupo(raiz, 0, 0.5, 0); J.base.add(peca('g_base'));
  J.neve = nuvemFlocos(raiz, { n: 50, r0: 0.6, r1: 3.2, y0: 0.1, y1: 6.2, vel: 0.55, giro: 0.35, cor: 0xf4fbff, tam: 0.16 * ESCALA_GEADA * 2.2, opac: 0.85 });
  const pontas = []; // perto das pontas dos cristais da coroa e dos ombros (coordenadas do corpo)
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + 0.2; pontas.push([Math.sin(a) * 1.15, 2.1 + (i % 3) * 0.25, Math.cos(a) * 1.05]); }
  pontas.push([0, 3.05, 0], [0.3, 2.7, 0.2], [-0.3, 2.65, -0.2]);
  for (const s of [-1, 1]) pontas.push([s * 1.9, 2.05, 0.1], [s * 2.35, 1.45, -0.3], [s * 1.8, 1.8, -0.75], [s * 2.2, 1.6, 0.6]);
  J.cintilas = nuvemFlocos(J.corpo, { pontos: pontas, cintila: true, cor: 0xbff2ff, tam: 0.42 * ESCALA_GEADA * 2.2, opac: 1, soma: true });
  J.brilhos = [];
  raiz.traverse((o) => { if (o.isMesh && o.material.userData.slot?.startsWith('luz') && !J.brilhos.includes(o.material)) { o.material.userData.cor0 = o.material.color.clone(); J.brilhos.push(o.material); } });
  u.geada = { J, golpe: null, tAnt: null, giroAnel: 0 };
  u.animar = (t, movendo) => animarGeada(u, t, movendo);
  u.aoGolpe = (tipo, prep) => { u.geada.golpe = { tipo, prep: Math.max(0.05, prep), t: 0 }; };
  u.aoParar = () => { u.geada.golpe = null; };
}

const BRANCO = new THREE.Color(0xffffff);
const BATE = 0.45, VOLTA = 0.6;

function animarGeada(u, t, movendo) {
  const S = u.geada, J = S.J;
  const dt = S.tAnt == null ? 0 : Math.min(0.1, Math.max(0, t - S.tAnt));
  S.tAnt = t;
  // W = pose de preparo (continua no começo do golpe e cede para a pose do golpe, B): nada pula de uma pose para outra
  let W = 0, B = 0, volta = 0, prep = 0, at = '';
  const g = S.golpe;
  if (g) {
    g.t += dt;
    at = g.tipo === 'corpo' ? 'solo' : g.tipo === 'projetil' ? 'estilhacos' : 'anel';
    if (g.t < g.prep) { prep = W = ease(lim(g.t / g.prep)); volta = W * W; }
    else if (g.t < g.prep + BATE) { B = ease(lim((g.t - g.prep) / BATE * 2.5)); W = 1 - B; volta = B; }
    else if (g.t < g.prep + BATE + VOLTA) { const k = ease(lim((g.t - g.prep - BATE) / VOLTA * 1.3)); B = 1 - k; volta = 2 - B; }
    else S.golpe = null;
  }
  const gira = at === 'anel', lanca = at === 'estilhacos', crava = at === 'solo';
  const a = movendo ? 1 : 0, ab = Math.max(W, B), resp = Math.sin(t * 1.6), livre = 1 - ab;
  J.corpo.position.y = 2.6 + resp * 0.13 + (crava ? W * 0.6 - B * 0.6 : gira ? ab * 0.35 : W * 0.2 - B * 0.2);
  J.corpo.rotation.y = Math.sin(t * 0.7) * 0.12 * livre + (gira ? volta * Math.PI * 2 : 0); // giro: sempre para a frente
  J.corpo.rotation.x = a * 0.1 + (lanca ? -W * 0.12 + B * 0.22 : crava ? -W * 0.15 + B * 0.2 : 0);
  J.corpo.rotation.z = Math.sin(t * 0.9) * 0.03 * livre;
  for (const [k, sl, fase] of [['E', -1, 0], ['D', 1, Math.PI]]) {
    const passo = Math.sin(t * 4 + fase) * 0.28 * a * livre, balanco = Math.sin(t * 1.6 + fase * 0.3) * 0.06 * (1 - ab);
    let bx = passo + balanco, bz = 0.04 + Math.sin(t * 1.2 + fase) * 0.03, ex = -0.05 - Math.max(0, passo) * 0.4;
    if (lanca) { bx = mix(mix(bx, -2.5, W), -0.6, B); ex = mix(mix(ex, -0.6, W), -0.2, B); bz = mix(mix(bz, 0.25, W), 0.1, B); } // ergue e desce para a frente
    if (crava) { bx = mix(mix(bx, -2.9, W), -0.5, B); ex = mix(mix(ex, -0.35, W), -0.1, B); bz = mix(bz, 0.12, ab); }             // acima da coroa e crava no chão
    if (gira) { bz = mix(bz, 1.3, ab); ex = mix(ex, 0.15, ab); bx = mix(bx, 0, ab); }                                              // braços abertos girando
    J['braco' + k].rotation.set(bx, 0, sl * bz); J['ante' + k].rotation.set(ex, 0, sl * (gira ? ab * 0.15 : 0));
  }
  J.olho.rotation.z = -t * 1.4; J.olho.scale.setScalar(1 + 0.06 * Math.sin(t * 3) + W * 0.2);
  // pedrinhas: anel girando devagar; aperta ao preparar o giro e espalha no golpe
  S.giroAnel += dt * W * 3; J.anel.rotation.y = t * (0.45 + a * 0.4) + S.giroAnel; J.anel.rotation.x = Math.sin(t * 0.5) * 0.08;
  J.anel.scale.setScalar(Math.max(0.05, 1 + W * (gira ? -0.2 : 0.15) + B * (gira ? 0.45 : -0.1)));
  J.estilhacos.forEach((e) => { e.position.y = e.userData.y0 + Math.sin(t * 1.7 + e.userData.fase) * 0.18; e.rotation.y = t * 0.9 + e.userData.fase; });
  const forca = 0.82 + 0.18 * Math.sin(t * 3);
  for (const m of J.brilhos) m.color.copy(m.userData.cor0).multiplyScalar(forca).lerp(BRANCO, prep * 0.45);
  // neve: cai devagar em volta; o giro e o golpe espalham
  mexerFlocos(J.neve, dt, t, 1, gira ? W * 0.4 + B * 1.2 : B * 0.3);
  mexerFlocos(J.cintilas, dt, t, 0.75 + W * 0.5);
}
