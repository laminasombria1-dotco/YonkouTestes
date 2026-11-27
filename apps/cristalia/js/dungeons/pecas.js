// =============================================================
// PEÇAS QUE AS DUNGEONS REPETEM (para não copiar o mesmo código)
// Todas recebem a dungeon montada (ms) e usam coordenadas LOCAIS dela.
// As peças vão para o lote (ms.peca): poucos desenhos por quadro.
// Luz: só BRILHO FALSO (pontos e feixes transparentes), nunca luz de verdade.
// =============================================================
import * as THREE from 'three';
import { GEO } from '../dungeon.js';
import { texturaBrilho } from '../biomas/comum.js';
export { palmeira, coral, estrela } from '../masmorras/templo-submerso.js';
export { portaDeLuz, portaoSimples, braseiro, liquido, pontosNaSala, cristais } from '../masmorras/pecas.js';
import { liquido } from '../masmorras/pecas.js';

// Espalha coisas em volta das salas (dMin..dMax metros PARA FORA da parte andável).
// Diferente do nosMorros das masmorras, aceita lugares mais baixos (o mar em volta de um convés).
export function emVolta(ms, salas, n, dMin, dMax, fn, tentativas = n * 10) {
  const F = ms.forma, rng = ms.rng;
  for (let t = 0, feitos = 0; t < tentativas && feitos < n; t++) {
    const s = F.salas[salas[Math.floor(rng() * salas.length)]], a = rng() * Math.PI * 2;
    const k = 1 + (dMin + rng() * (dMax - dMin)) / Math.min(s.rx, s.rz);
    const x = s.x + Math.cos(a) * s.rx * k, z = s.z + Math.sin(a) * s.rz * k;
    const inf = F.andavelLocal(x, z);
    if (inf.d < dMin || inf.d > dMax) continue;
    fn(x, z, inf); feitos++;
  }
}
// Pontos andáveis numa sala (para enfeites no chão), longe do centro (onde fica o grupo)
export function noChao(ms, i, n, longe = 6, fn) {
  const s = ms.forma.salas[i];
  for (let t = 0, feitos = 0; t < n * 12 && feitos < n; t++) {
    const p = ms.pontoNaSala(i, 2);
    if (Math.hypot(p.x - s.x, p.z - s.z) < longe) continue;
    fn(p.x, p.z); feitos++;
  }
}
// Num círculo (para colunas, degraus, anéis de pedra): fn(x, z, ângulo)
export function emCirculo(n, cx, cz, r, fn, a0 = 0, arco = Math.PI * 2) {
  for (let i = 0; i < n; i++) { const a = a0 + (arco * i) / (arco >= Math.PI * 2 - 0.01 ? n : Math.max(1, n - 1)); fn(cx + Math.sin(a) * r, cz + Math.cos(a) * r, a); }
}

// Material transparente (água, vidro, feixe de luz): guardado na dungeon e apagado na saída
export function transparente(ms, cor, op, extra = {}) {
  return ms.mat(cor, { transparent: true, opacity: op, depthWrite: false, ...extra });
}
// Água (ou lava) parada: um plano só. y é a altura local (sem somar o chão)
export function agua(ms, cor, lx, y, lz, larg, comp, op = 0.6, brilho = 0.3) {
  return liquido(ms, transparente(ms, cor, op, { emissive: cor, emissiveIntensity: brilho }), lx, y, lz, larg, comp);
}
// Feixe de luz (cone transparente que soma cor): o sol entrando pela claraboia, pela água...
const GEO_FEIXE = new THREE.CylinderGeometry(0.35, 1, 1, 8, 1, true);
export function feixe(ms, lx, lz, y0, altura, raio, cor = '#fff6d0', op = 0.16, inc = 0) {
  const k = 'feixe' + cor + op;
  if (!ms.mats.has(k)) ms.mats.set(k, new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  const me = new THREE.Mesh(GEO_FEIXE, ms.mats.get(k));
  me.position.set(ms.o.x + lx, y0 + altura / 2, ms.o.z + lz);
  me.scale.set(raio, altura, raio);
  me.rotation.z = inc;
  ms.grupo.add(me);
  return me;
}
// Brilho falso: muitos pontos redondos num desenho só. lista = [[lx, y, lz], ...] (y = altura do mundo)
export function brilhos(ms, lista, cor, tam = 0.6, op = 0.8, chave = cor) {
  const pos = [];
  for (const [x, y, z] of lista) pos.push(ms.o.x + x, y, ms.o.z + z);
  const g = ms.geo(new THREE.BufferGeometry());
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const k = 'brilho:' + chave + tam;
  if (!ms.mats.has(k)) ms.mats.set(k, new THREE.PointsMaterial({ color: cor, size: tam, map: texturaBrilho(), transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
  const p = new THREE.Points(g, ms.mats.get(k));
  ms.grupo.add(p);
  return p;
}
// Céu de estrelas (para as salas de noite): pontos lá no alto, sem névoa
export function estrelasDoCeu(ms, lx, lz, raio = 120, n = 260) {
  const pos = [], rng = ms.rng;
  for (let i = 0; i < n; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * raio; pos.push(ms.o.x + lx + Math.cos(a) * r, 55 + rng() * 25, ms.o.z + lz + Math.sin(a) * r); }
  const g = ms.geo(new THREE.BufferGeometry());
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: '#ffffff', size: 0.9, transparent: true, opacity: 0.9, depthWrite: false, fog: false });
  ms.mats.set('estrelas' + lx + lz, m);
  const p = new THREE.Points(g, m);
  p.frustumCulled = false;
  ms.grupo.add(p);
  return p;
}

// ---------- plantas e enfeites ----------
// Samambaia: folhas compridas abertas em leque
export function samambaia(ms, mat, x, z, e = 1, y = 0) {
  const r = ms.rng, a0 = r() * 6.28;
  for (let i = 0; i < 7; i++) { const a = a0 + (i / 7) * 6.28; ms.peca(GEO.caixa, mat, x + Math.cos(a) * 0.9 * e, y + 0.55 * e, z - Math.sin(a) * 0.9 * e, 2.1 * e, 0.08, 0.5 * e, 0, a, -0.55); }
}
// Flor (orquídea, hibisco): miolo e pétalas num ico achatado
export function flor(ms, mat, miolo, x, y, z, e = 1, chao = true) {
  ms.peca(GEO.ico, mat, x, y, z, 0.55 * e, 0.3 * e, 0.55 * e, ms.rng(), ms.rng() * 3, 0, chao);
  if (miolo) ms.peca(GEO.ico, miolo, x, y + 0.12 * e, z, 0.16 * e, 0.16 * e, 0.16 * e, 0, 0, 0, chao);
}
// Cipó pendurado (do alto da parede até perto do chão), com flores às vezes
export function cipo(ms, mat, x, z, topo, comp, flores = null, miolo = null) {
  ms.peca(GEO.cilFino, mat, x, topo - comp / 2, z, 0.16, comp, 0.16, 0, 0, (ms.rng() - 0.5) * 0.15, false);
  if (flores) for (let i = 0; i < 3; i++) if (ms.rng() < 0.6) flor(ms, flores, miolo, x + (ms.rng() - 0.5) * 0.5, topo - comp * (0.2 + i * 0.3), z + (ms.rng() - 0.5) * 0.5, 0.8, false);
}
// Pedra solta (dode achatado)
export function pedra(ms, mat, x, z, e = 1, bate = false) {
  ms.peca(GEO.dode, mat, x, 0.35 * e, z, 1.4 * e, 0.9 * e, 1.3 * e, ms.rng(), ms.rng() * 3, 0);
  if (bate) ms.obst(x, z, 0.75 * e);
}
// Coluna com base e capitel (calcário, mármore...): bate = vira obstáculo
export function coluna(ms, mat, x, z, alt, e = 1, bate = true, y = 0) {
  ms.peca(GEO.caixa, mat, x, y + 0.3 * e, z, 1.6 * e, 0.6 * e, 1.6 * e);
  ms.peca(GEO.cil, mat, x, y + alt / 2, z, 1.05 * e, alt, 1.05 * e);
  ms.peca(GEO.caixa, mat, x, y + alt - 0.25 * e, z, 1.7 * e, 0.5 * e, 1.7 * e);
  if (bate) ms.obst(x, z, 0.75 * e);
}
// Arco entre dois pontos (meio aro em cima de duas colunas): y = altura do pé do arco
export function arcoEntre(ms, mat, ax, az, bx, bz, y, grossura = 1) {
  const cx = (ax + bx) / 2, cz = (az + bz) / 2, r = Math.hypot(bx - ax, bz - az) / 2;
  ms.peca(GEO.arco, mat, cx, y, cz, r, r, grossura * 2.4, 0, Math.atan2(bx - ax, bz - az) + Math.PI / 2, 0, false);
}
// Lanterna num poste (o vidro brilha; o brilho falso fica por conta de quem chama)
export function lanterna(ms, madeira, vidro, x, z, alt = 2.2, y = null) {
  const chao = y == null, b = y ?? 0;
  ms.peca(GEO.caixa, madeira, x, b + alt / 2, z, 0.22, alt, 0.22, 0, 0, 0, chao);
  ms.peca(GEO.caixa, vidro, x, b + alt + 0.2, z, 0.45, 0.55, 0.45, 0, 0, 0, chao);
  ms.peca(GEO.cone4, madeira, x, b + alt + 0.62, z, 0.7, 0.32, 0.7, 0, Math.PI / 4, 0, chao);
}
// Casco de navio deitado no mar: o convés fica na altura "topo" (local). ang = para onde a proa aponta
export function casco(ms, M, cx, cz, topo, larg, comp, ang = 0, inclina = 0) {
  const s = Math.sin(ang), c = Math.cos(ang), P = (f, l) => [cx + s * f + c * l, cz + c * f - s * l];
  const fundo = topo - 4.2;
  // o corpo (3 faixas de tábua, mais estreito embaixo) e a proa em cunha
  for (let k = 0; k < 3; k++) {
    const y = topo - 0.7 - k * 1.25, w = larg * (1 - k * 0.14);
    ms.peca(GEO.caixa, k % 2 ? M.casco2 : M.casco, cx, y, cz, w, 1.3, comp, inclina, ang, 0, false);
  }
  const [px, pz] = P(comp / 2 + larg * 0.35, 0);
  ms.peca(GEO.cone4, M.casco, px, topo - 1.6, pz, larg * 0.72, larg * 0.95, 3.6, Math.PI / 2, ang, 0, false);
  // a amurada (as bordas do convés), com buracos de onde a madeira quebrou
  for (const l of [-1, 1]) for (let f = -comp / 2 + 1; f < comp / 2; f += 2.2) {
    if (ms.rng() < 0.2) continue;
    const [x, z] = P(f, l * (larg / 2 - 0.1));
    ms.peca(GEO.caixa, M.casco2, x, topo + 0.45, z, 0.25, 0.9, 2, 0, ang, 0, false);
  }
  return { fundo };
}
// Corrente grossa entre dois pontos (elos em cadeia: caixas alternadas). Pontos com y do mundo
export function corrente(ms, mat, a, b, elos = 10, cai = 1.2) {
  for (let i = 0; i <= elos; i++) {
    const t = i / elos, x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t, y = a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * cai;
    ms.peca(GEO.toro, mat, x, y, z, 0.6, 0.6, 2.2, i % 2 ? Math.PI / 2 : 0, Math.atan2(b[0] - a[0], b[2] - a[2]), 0, false);
  }
}
