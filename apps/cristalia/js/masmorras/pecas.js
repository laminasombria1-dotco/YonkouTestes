// =============================================================
// PEÇAS QUE AS MASMORRAS NOVAS REPETEM (para não copiar o mesmo código)
// Todas recebem a masmorra (ms) e usam coordenadas LOCAIS dela.
// As peças vão para o lote (ms.peca): poucos desenhos por quadro.
// =============================================================
import * as THREE from 'three';
import { GEO } from '../dungeon.js';

// Pinheiro com neve na ponta (e = tamanho)
export function pinheiro(ms, M, x, z, e) {
  ms.peca(GEO.cil, M.tronco, x, 0.8 * e, z, 0.55 * e, 1.6 * e, 0.55 * e);
  const m = ms.rng() < 0.5 ? M.pinho : M.pinho2;
  ms.peca(GEO.cone, m, x, 2.4 * e, z, 3.2 * e, 2.6 * e, 3.2 * e);
  ms.peca(GEO.cone, m, x, 3.9 * e, z, 2.4 * e, 2.2 * e, 2.4 * e);
  ms.peca(GEO.cone, M.neve, x, 5.2 * e, z, 1.4 * e, 1.6 * e, 1.4 * e);
}

// Cacho de cristais (5 pontas, baixas e largas: a câmera passa por cima)
export function cristais(ms, octa, mat, mat2, x, z, e, bate = false) {
  const rng = ms.rng;
  for (let i = 0; i < 5; i++) {
    const a = rng() * Math.PI * 2, r = i ? rng() * 1.8 * e : 0, h = (i ? 1.6 + rng() * 1.8 : 3.4 + rng() * 1.6) * e;
    ms.peca(octa, mat2 && i % 2 ? mat2 : mat, x + Math.cos(a) * r, h * 0.42, z + Math.sin(a) * r, 0.85 * e, h * 0.5, 0.85 * e, (rng() - 0.5) * 0.6, rng() * 3, (rng() - 0.5) * 0.6);
  }
  if (bate) ms.obst(x, z, 1.7 * e);
}

// Espalha coisas nos morros/paredes em volta das salas escolhidas
// (dMin..dMax = quantos metros para fora da parte andável). fn(x, z, info)
export function nosMorros(ms, salas, n, dMin, dMax, fn, tentativas = n * 8) {
  const F = ms.forma, rng = ms.rng;
  for (let t = 0, feitos = 0; t < tentativas && feitos < n; t++) {
    const s = F.salas[salas[Math.floor(rng() * salas.length)]], a = rng() * Math.PI * 2;
    const k = 1 + (dMin + rng() * (dMax - dMin)) / Math.min(s.rx, s.rz);
    const x = s.x + Math.cos(a) * s.rx * k, z = s.z + Math.sin(a) * s.rz * k;
    const inf = F.andavelLocal(x, z);
    if (inf.d < dMin || inf.d > dMax || ms.y(x, z) < inf.h - 1) continue; // (não no abismo)
    fn(x, z, inf); feitos++;
  }
}

// Pontos andáveis numa sala, longe do grupo (centro) e de outros pontos
export function pontosNaSala(ms, i, n, folga, longeDe = [], dist = 12) {
  const lista = [];
  for (let t = 0; t < n * 10 && lista.length < n; t++) {
    const p = ms.pontoNaSala(i, folga);
    if (longeDe.some((q) => Math.hypot(p.x - q.x, p.z - q.z) < dist)) continue;
    if (lista.some((q) => Math.hypot(p.x - q.x, p.z - q.z) < 4)) continue;
    lista.push(p);
  }
  return lista;
}

// A porta de luz do começo (por onde você sai): pilares, viga, 2 braseiros e o brilho
export function portaDeLuz(ms, corPedra, corChama, corLuz = '#d8f6ff') {
  const pedra = ms.mat(corPedra), chama = ms.brilho(corChama, 1), metal = ms.mat('#2b2f45');
  ms.bloco((b) => {
    const o = ms.o, y0 = ms.y(0, 8);
    for (const lado of [-1, 1]) {
      b.add(GEO.caixa, pedra, o.x + lado * 3.2, y0 + 2.8, o.z + 8.4, 1.4, 5.6, 1.4);
      b.add(GEO.cil, metal, o.x + lado * 5.6, y0 + 0.7, o.z + 5.5, 0.9, 1.4, 0.9);
      b.add(GEO.cone, chama, o.x + lado * 5.6, y0 + 1.9, o.z + 5.5, 0.8, 1.4, 0.8);
    }
    b.add(GEO.caixa, pedra, o.x, y0 + 6, o.z + 8.4, 8.2, 1.1, 1.6);
  });
  const luz = ms.malha(ms.geo(new THREE.PlaneGeometry(5, 5)), new THREE.MeshBasicMaterial({ color: corLuz, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }), 0, 2.7, 8.6);
  ms.mats.set('portaLuz', luz.material);
  ms.animar((dt, t) => { luz.material.opacity = 0.6 + Math.sin(t * 2.2) * 0.15; });
  ms.obst(-3.2, 8.4, 0.9); ms.obst(3.2, 8.4, 0.9);
}

// Braseiro (base escura + chama que brilha)
export function braseiro(ms, base, chama, x, z, e = 1, bate = true) {
  ms.peca(GEO.cil, base, x, 0.6 * e, z, 1 * e, 1.2 * e, 1 * e);
  ms.peca(GEO.cone, chama, x, 1.7 * e, z, 0.8 * e, 1.3 * e, 0.8 * e);
  if (bate) ms.obst(x, z, 0.7 * e);
}

// Pilares e viga do portão selado (cada masmorra passa as cores)
export function portaoSimples(ms, b, { lx, lz, base, ang, larg, px, pz }, pedra, topo, viga = pedra) {
  const o = ms.o;
  for (const lado of [-1, 1]) {
    const x = o.x + lx + px * (larg + 1.3) * lado, z = o.z + lz + pz * (larg + 1.3) * lado;
    b.add(GEO.caixa, pedra, x, base + 3.4, z, 1.7, 6.8, 1.7, 0, ang, 0);
    if (topo) b.add(GEO.ico, topo, x, base + 7.4, z, 1.1, 1.6, 1.1);
  }
  b.add(GEO.caixa, viga, o.x + lx, base + 6.9, o.z + lz, (larg + 2.2) * 2, 1.2, 1.9, 0, ang, 0);
}
