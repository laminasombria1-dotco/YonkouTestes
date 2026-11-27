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
import { liquido, portaDeLuz, portaoSimples } from '../masmorras/pecas.js';

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

// =============================================================
// O MOLDE DE UMA DUNGEON (para as variações não repetirem o mesmo código)
// fazerPlano({ salas, corredores, abismos, buracos, temas, chao, parede, liquido, fundo,
//   mats, porta, portao, trono, decorar(ms, M), corChao? }) devolve o plano completo:
//  - acampamentos: o centro de cada sala com "etapa" (0, 1, 2)
//  - o portão selado: no corredor que entra na sala do Rei (fim: true)
//  - o chão: chao[tema] (lista de cores) dentro, parede[tipo] (ou parede.todos) fora,
//    "liquido" no fundo dos buracos e "fundo" embaixo das plataformas
//  - mats: { nome: '#cor' (normal), '*#cor' (brilha), '~#cor' (transparente que brilha) }
// =============================================================
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];
export function criarMats(ms, spec) {
  const M = {};
  for (const [k, v] of Object.entries(spec)) {
    if (v.startsWith('*')) M[k] = ms.brilho(v.slice(1), 0.85);
    else if (v.startsWith('~')) M[k] = transparente(ms, v.slice(1), 0.55, { emissive: v.slice(1), emissiveIntensity: 0.6 });
    else M[k] = ms.mat(v);
  }
  return M;
}
export function fazerPlano(cfg) {
  const S = cfg.salas, fim = S.findIndex((s) => s.fim);
  const corPortao = cfg.portao || ['#8a8a8a', '#7dffd8'];
  return {
    paredeVisivel: cfg.paredeVisivel ?? 30,
    forma: { salas: S, corredores: cfg.corredores, abismos: cfg.abismos || [], buracos: cfg.buracos || [] },
    corSelo: corPortao[1],
    portoes: [{ corredor: cfg.corredores.findIndex((c) => c.b === fim) }],
    acampamentos: S.map((s, i) => [s, i]).filter(([s]) => s.etapa != null).map(([s]) => ({ x: s.x + (s.ax || 0), z: s.z + (s.az || 0), etapa: s.etapa })),
    inicio: { x: 0, z: -8, ang: Math.PI },
    saida: { x: 0, z: 7.6, r: 2.2 },
    trono: cfg.trono,
    portal: cfg.portal || { x: S[fim].x + (S[fim].rx ?? S[fim].r) * 0.55, z: S[fim].z + 2, ang: -0.4 }, // (dentro da sala do Rei, ao lado do trono)
    temas: cfg.temas,
    corChao(c, info) {
      if (cfg.corChao && cfg.corChao(c, info)) return c;
      const { sala, d, h, hChao, tipo, rng } = info, s = S[sala];
      if (d <= 0.6) {
        if (h < hChao - 0.6 && cfg.liquido) return c.set(cfg.liquido);
        return c.set(sorteia(rng, cfg.chao[s.tema] || cfg.chao.todos));
      }
      if (tipo === 'plataforma' && cfg.fundo) return c.set(sorteia(rng, cfg.fundo));
      if (h < hChao - 4 && cfg.fundo) return c.set(sorteia(rng, cfg.fundo));
      return c.set(sorteia(rng, cfg.parede[s.tema] || cfg.parede[tipo] || cfg.parede.todos));
    },
    pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat(corPortao[0]), ms.brilho(corPortao[1], 0.8), ms.mat(corPortao[0])); },
    decorar(ms) {
      const M = criarMats(ms, cfg.mats || {});
      portaDeLuz(ms, (cfg.porta || corPortao)[0], (cfg.porta || corPortao)[1]);
      cfg.decorar(ms, M, ms.rng);
    },
  };
}
// O tempo de uma sala (cor do céu, da luz, da névoa e as partículas). part: brilho, faisca, neve, nevasca, poeira, nenhuma
export const tema = (ceu, hemi, luz, sol, perto, longe, part = 'brilho', corPart = '#ffffff', extra = {}) => ({ ceu, hemi, luz, sol, nevoa: [perto, longe], part, corPart, ...extra });

// ---------- peças dos outros biomas ----------
const HEX = new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
export const GEO_HEX = HEX;
// Coluna hexagonal de basalto (do chão até "alt")
export function hexColuna(ms, mat, x, z, alt, larg = 2, bate = true, y = null) {
  ms.peca(HEX, mat, x, (y ?? 0) + alt / 2, z, larg, alt, larg, 0, ms.rng() * 3, 0, y == null);
  if (bate) ms.obst(x, z, larg * 0.5);
}
// Estalactite (cone de ponta para baixo) pendurada em "topo" (altura do mundo)
export function estalactite(ms, mat, x, z, topo, comp, larg = 0.7) { ms.peca(GEO.cone, mat, x, topo - comp / 2, z, larg, comp, larg, Math.PI, 0, 0, false); }
// Estalagmite / ponta de gelo / cristal fino no chão
export function ponta(ms, mat, x, z, alt, larg = 0.8, bate = false) { ms.peca(GEO.cone, mat, x, alt / 2, z, larg, alt, larg, (ms.rng() - 0.5) * 0.2, ms.rng() * 3, (ms.rng() - 0.5) * 0.2); if (bate) ms.obst(x, z, larg * 0.5); }
// Bigorna (base, corpo e o chifre)
export function bigorna(ms, mat, x, z, e = 1, ang = 0) {
  ms.peca(GEO.caixa, mat, x, 0.45 * e, z, 1 * e, 0.9 * e, 0.8 * e, 0, ang, 0);
  ms.peca(GEO.caixa, mat, x, 1.05 * e, z, 2 * e, 0.4 * e, 0.9 * e, 0, ang, 0);
  ms.peca(GEO.cone, mat, x + Math.cos(ang) * 1.3 * e, 1.05 * e, z - Math.sin(ang) * 1.3 * e, 0.45 * e, 0.9 * e, 0.45 * e, 0, ang, Math.PI / 2);
  ms.obst(x, z, 1 * e);
}
// Obelisco (pilar de 4 lados com a ponta)
export function obelisco(ms, mat, x, z, alt, larg = 1.4, runa = null) {
  ms.peca(GEO.caixa, mat, x, alt / 2, z, larg, alt, larg, 0, ms.rng() * 0.3, 0);
  ms.peca(GEO.cone4, mat, x, alt + larg * 0.45, z, larg * 1.42, larg * 0.9, larg * 1.42, 0, Math.PI / 4, 0);
  if (runa) ms.peca(GEO.caixa, runa, x, alt * 0.55, z, larg * 1.04, alt * 0.6, 0.2, 0, 0, 0);
  ms.obst(x, z, larg * 0.7);
}
// Esfinge deitada (corpo, patas, peito e a cabeça com o lenço do faraó). ang = para onde olha
export function esfinge(ms, mat, x, z, e = 1, ang = 0, enterrada = 0) {
  const fx = Math.sin(ang), fz = Math.cos(ang), y = -enterrada;
  ms.peca(GEO.caixa, mat, x, y + 0.9 * e, z, 2 * e, 1.6 * e, 4.4 * e, 0, ang, 0);
  ms.peca(GEO.caixa, mat, x + fx * 3 * e, y + 0.35 * e, z + fz * 3 * e, 1.8 * e, 0.6 * e, 2 * e, 0, ang, 0);
  ms.peca(GEO.caixa, mat, x + fx * 1.8 * e, y + 2 * e, z + fz * 1.8 * e, 1.6 * e, 1.6 * e, 1.3 * e, 0, ang, 0);
  ms.peca(GEO.cone4, mat, x + fx * 1.7 * e, y + 2.6 * e, z + fz * 1.7 * e, 2.4 * e, 1.6 * e, 1.6 * e, 0, ang + Math.PI / 4, 0);
  ms.obst(x + fx * e, z + fz * e, 2 * e);
}
// Ânfora de barro (corpo, pescoço e boca)
export function anfora(ms, mat, x, z, e = 1) {
  ms.peca(GEO.ico, mat, x, 0.7 * e, z, 1 * e, 1.3 * e, 1 * e);
  ms.peca(GEO.cil, mat, x, 1.55 * e, z, 0.4 * e, 0.6 * e, 0.4 * e);
  ms.peca(GEO.cil, mat, x, 1.9 * e, z, 0.6 * e, 0.15 * e, 0.6 * e);
}
// Barca cerimonial (casco, as pontas curvas e a cabine). ang = direção da proa
export function barca(ms, M, x, y, z, comp, ang = 0) {
  const s = Math.sin(ang), c = Math.cos(ang);
  ms.peca(GEO.caixa, M.cedro, x, y + 0.8, z, comp * 0.28, 1.6, comp * 0.75, 0, ang, 0, false);
  for (const k of [-1, 1]) {
    ms.peca(GEO.cone, M.cedro, x + s * comp * 0.42 * k, y + 1.6, z + c * comp * 0.42 * k, 1.2, 3.2, 1.2, -k * 0.7, ang, 0, false);
    ms.peca(GEO.ico, M.ouro, x + s * comp * 0.5 * k, y + 3.1, z + c * comp * 0.5 * k, 0.8, 0.8, 0.8, 0, 0, 0, false);
  }
  ms.peca(GEO.caixa, M.ouro, x, y + 1.65, z, comp * 0.3, 0.2, comp * 0.76, 0, ang, 0, false);
  ms.peca(GEO.caixa, M.azul, x, y + 2.6, z, comp * 0.18, 1.8, comp * 0.22, 0, ang, 0, false);
}
// Cogumelo (pé e chapéu). chapeu pode brilhar
export function cogumelo(ms, pe, chapeu, x, z, e = 1, y = null) {
  const chao = y == null, b = y ?? 0;
  ms.peca(GEO.cil, pe, x, b + 0.6 * e, z, 0.35 * e, 1.2 * e, 0.35 * e, 0, 0, 0, chao);
  ms.peca(GEO.chapeu, chapeu, x, b + 1.15 * e, z, 0.9 * e, 0.6 * e, 0.9 * e, 0, 0, 0, chao);
}
// Árvore de tronco alto e copa (prateada, morta, nevada...)
export function arvore(ms, tronco, copa, x, z, e = 1, bate = true) {
  ms.peca(GEO.cil, tronco, x, 4 * e, z, 1.3 * e, 8 * e, 1.3 * e, (ms.rng() - 0.5) * 0.08, 0, (ms.rng() - 0.5) * 0.08);
  if (copa) ms.peca(GEO.ico, copa, x, 9 * e, z, 5.5 * e, 3.6 * e, 5.5 * e, 0, ms.rng() * 3, 0);
  if (bate) ms.obst(x, z, 0.9 * e);
}
// Ponte de tábuas (com corda dos lados) entre duas salas, seguindo a altura das duas
export function ponteTabuas(ms, M, A, B, larg = 3.4, cai = 0.3, corda = true) {
  const n = Math.ceil(Math.hypot(B.x - A.x, B.z - A.z) / 1.4), ang = Math.atan2(B.x - A.x, B.z - A.z);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = A.x + (B.x - A.x) * t, z = A.z + (B.z - A.z) * t, y = A.h + (B.h - A.h) * t - Math.sin(t * Math.PI) * cai;
    ms.peca(GEO.caixa, i % 2 ? M.tabua : (M.tabua2 || M.tabua), x, y - 0.12, z, larg, 0.22, 1, 0, ang, 0, false);
  }
  if (corda) for (const l of [-1, 1]) { const ox = Math.cos(ang) * (larg / 2 + 0.2) * l, oz = -Math.sin(ang) * (larg / 2 + 0.2) * l; corrente(ms, M.corda, [A.x + ox, A.h + 1.1, A.z + oz], [B.x + ox, B.h + 1.1, B.z + oz], 14, 0.5); }
}
// Degraus (uma escada reta) de A até B, com a altura de cada ponta
export function escada(ms, mat, ax, az, ah, bx, bz, bh, larg = 5, n = 12) {
  const ang = Math.atan2(bx - ax, bz - az);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; ms.peca(GEO.caixa, mat, ax + (bx - ax) * t, ah + (bh - ah) * t - 0.25, az + (bz - az) * t, larg, 0.5, Math.hypot(bx - ax, bz - az) / n + 0.1, 0, ang, 0, false); }
}
// Sino de bronze pendurado
export function sino(ms, mat, x, y, z, e = 1) {
  ms.peca(GEO.chapeu, mat, x, y, z, 1.2 * e, 1.8 * e, 1.2 * e, 0, 0, 0, false);
  ms.peca(GEO.ico, mat, x, y - 0.3 * e, z, 0.3 * e, 0.3 * e, 0.3 * e, 0, 0, 0, false);
}
export const GEO_OCT = new THREE.OctahedronGeometry(0.6, 0); // (cristais)
