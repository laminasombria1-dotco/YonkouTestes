// =============================================================
// LUGARES DAS MELHORIAS DOS BIOMAS (só matemática, sem nada de 3D)
// Onde ficam as peças únicas de cada bioma (acampamento, trilha, lago...).
// Tudo sai da semente e dos lugares que o mapa já tem (estradas, lagos):
// o mesmo lugar para todos os jogadores, e NADA aqui muda o relevo,
// os rios, os lagos, as vilas nem as entradas das masmorras.
// =============================================================
import { ESTRADAS, LAGOS, LUGARES, POIS, RESERVAS, NIVEL_AGUA, SEMENTE, aleatorio, biomaEm, lagoEm, naEstradaReal, PONTOS_FLORESTA, LAGOA, CENTRO_FLORESTA } from '../mapa/gerador.js';
import { TRACADOS } from '../dungeon.js';
import { alturaEm } from '../mapa/altura.js';

// ---------- GELO (o guia do Lâmina) ----------
// O esquema do guia: entrada pelo sul (o portão do Reino e a Estrada Real), a trilha com
// lanternas, o acampamento no meio, o lago congelado de um lado, a floresta fechada com o
// arco rúnico do mesmo lado, a fonte termal do outro e a cordilheira no fundo.
const E = ESTRADAS.find((e) => e.bioma === 'raio');
const D = E.dir, LAT = { x: -D.z, z: D.x }; // ao longo da estrada (para fora) e para o lado
const ponto = (ao, lado) => ({ x: D.x * ao + LAT.x * lado, z: D.z * ao + LAT.z * lado });
const local = (x, z) => ({ ao: x * D.x + z * D.z, lado: x * LAT.x + z * LAT.z });

// Quanto o chão sobe e desce num círculo (para achar lugar plano)
function desnivel(x, z, r) {
  let lo = Infinity, hi = -Infinity;
  for (let a = 0; a < 8; a++) { const h = alturaEm(x + Math.cos(a * 0.785) * r, z + Math.sin(a * 0.785) * r); lo = Math.min(lo, h); hi = Math.max(hi, h); }
  return hi - lo;
}
// Longe dos lugares que o mapa já guardou (vilas, masmorras, pontos de interesse, lagos)
function livreDoMapa(x, z, folga) {
  if (biomaEm(x, z) !== 'raio' || alturaEm(x, z) < NIVEL_AGUA + 0.3) return false;
  if (lagoEm(x, z, folga)) return false;
  for (const r of [...RESERVAS, ...POIS, ...LUGARES]) if (Math.hypot(x - r.x, z - r.z) < (r.r || 5) + folga) return false;
  return true;
}

// O acampamento: o lugar mais plano perto de 198 m do centro, na direção da estrada
const RAIO_ACAMP = 198;
const ACAMP = (() => {
  let melhor = null, mv = Infinity;
  for (let a = -6; a <= 6; a += 2) for (let l = -6; l <= 6; l += 2) {
    const p = ponto(RAIO_ACAMP + a, l), v = desnivel(p.x, p.z, 8);
    if (v < mv) { mv = v; melhor = p; }
  }
  return { ...melhor, r: 11 };
})();

// A trilha batida: do fim da Estrada Real até a frente do acampamento (com uma curva suave)
const TRILHA = { ao0: E.fim + 2, ao1: local(ACAMP.x, ACAMP.z).ao - 5, lado1: local(ACAMP.x, ACAMP.z).lado };
// O meio da trilha numa distância "ao" (para o lado)
export function meioTrilha(ao) {
  const t = Math.min(1, Math.max(0, (ao - TRILHA.ao0) / (TRILHA.ao1 - TRILHA.ao0)));
  return TRILHA.lado1 * t + Math.sin(t * 3.1) * 2.5;
}
// Distância do ponto até o meio da trilha (99 = longe)
export function naTrilhaGelo(x, z) {
  const l = local(x, z);
  if (l.ao < TRILHA.ao0 - 1 || l.ao > TRILHA.ao1 + 7) return 99;
  return Math.abs(l.lado - meioTrilha(l.ao));
}

// O lago congelado: o maior lago de gelo a até 55 m do acampamento
const LAGO = LAGOS.filter((L) => L.tipo === 'gelo' && Math.hypot(L.x - ACAMP.x, L.z - ACAMP.z) < 55).sort((a, b) => b.r - a.r)[0] || null;

// Um lugar plano de um lado do acampamento (lado = -1 ou 1), longe da trilha
function plano(ao, lado, raio, sinal) {
  let melhor = null, mv = Infinity;
  for (let a = -raio; a <= raio; a += 2) for (let l = -raio; l <= raio; l += 2) {
    const p = ponto(ao + a, lado + l), pl = local(p.x, p.z);
    if ((pl.lado - local(ACAMP.x, ACAMP.z).lado) * sinal < 15) continue;
    if (Math.hypot(p.x - ACAMP.x, p.z - ACAMP.z) < 16 || naTrilhaGelo(p.x, p.z) < 6 || !livreDoMapa(p.x, p.z, 6)) continue;
    const v = desnivel(p.x, p.z, 5) + Math.hypot(a, l) * 0.02;
    if (v < mv) { mv = v; melhor = p; }
  }
  return melhor;
}
const la = local(ACAMP.x, ACAMP.z);
const ARCO = plano(la.ao + 14, la.lado - 28, 16, -1);   // do lado do lago, na beira da floresta
const FONTE = plano(la.ao + 10, la.lado + 26, 16, 1);   // do outro lado

// A floresta fechada: pinheiros a mais num quadrado ao lado do acampamento (do lado do arco)
const PINHEIROS = (() => {
  const rng = aleatorio(SEMENTE ^ 0x6e1a0), lista = [];
  for (let t = 0; t < 500 && lista.length < 26; t++) {
    const p = ponto(la.ao + 11 + (rng() - 0.5) * 30, la.lado - 31 + (rng() - 0.5) * 30);
    const e = 1 + rng() * 0.7, ry = rng() * 6.28, pesado = rng() < 0.7;
    if (!livreDoMapa(p.x, p.z, 2) || naTrilhaGelo(p.x, p.z) < 4 || Math.hypot(p.x - ACAMP.x, p.z - ACAMP.z) < 14) continue;
    if (ARCO && Math.hypot(p.x - ARCO.x, p.z - ARCO.z) < 6) continue;
    if (LAGO && Math.hypot(p.x - LAGO.x, p.z - LAGO.z) < LAGO.r + 4) continue;
    if (desnivel(p.x, p.z, 1) > 1.5 || lista.some((q) => Math.hypot(q.x - p.x, q.z - p.z) < 3.2)) continue;
    lista.push({ x: p.x, z: p.z, e, ry, pesado });
  }
  return lista;
})();

export const GELO = { estrada: E, dir: D, lat: LAT, ponto, local, acamp: ACAMP, trilha: TRILHA, lago: LAGO, arco: ARCO, fonte: FONTE, pinheiros: PINHEIROS };

// ---------- FLORESTA: "Mata de Véu-Âmbar" (o guia do Lâmina) ----------
// A Catedral das Cortinas (com o Observatório Submerso no meio): a clareira mais plana e livre;
// as Pontes de Raiz: um rio estreito (6 a 10 m) longe do centro; o Pântano das Lanternas Azuis: o maior lago.
function livreFloresta(x, z, folga) {
  if (biomaEm(x, z) !== 'planta' || alturaEm(x, z) < NIVEL_AGUA + 0.35) return false;
  if (TRACADOS.some((t) => t.reservado(x, z))) return false;
  { const e = naEstradaReal(x, z); if (e.dentro && e.lat < 8) return false; }
  if (lagoEm(x, z, folga)) return false;
  for (const r of [...RESERVAS, ...POIS, ...LUGARES]) if (Math.hypot(x - r.x, z - r.z) < (r.r || 5) + folga) return false;
  return true;
}
const CATEDRAL = (() => {
  let melhor = null, mv = Infinity;
  for (let x = 180; x <= 300; x += 4) for (let z = -140; z <= -10; z += 4) {
    if (biomaEm(x, z) !== 'planta' || lagoEm(x, z, 14)) continue;
    if ([...PONTOS_FLORESTA.clareiras, PONTOS_FLORESTA.ruina, LAGOA, ...LUGARES].some((o) => Math.hypot(o.x - x, o.z - z) < (o.r || 6) + 16)) continue;
    if (![[0, 0], [8, 0], [-8, 0], [0, 8], [0, -8]].every(([a, b]) => livreFloresta(x + a, z + b, 1))) continue;
    const v = desnivel(x, z, 10) + Math.hypot(x - CENTRO_FLORESTA.x, z - CENTRO_FLORESTA.z) * 0.01;
    if (v < mv) { mv = v; melhor = { x, z }; }
  }
  return melhor && { ...melhor, r: 19 };
})();
const PONTE = (() => {
  let melhor = null, mw = Infinity;
  for (let x = 120; x <= 340; x += 3) for (let z = -240; z <= 60; z += 3) {
    if (biomaEm(x, z) !== 'planta' || lagoEm(x, z, 8) || alturaEm(x, z) > NIVEL_AGUA - 0.4) continue;
    if (Math.hypot(x - CENTRO_FLORESTA.x, z - CENTRO_FLORESTA.z) < 50 || TRACADOS.some((t) => t.reservado(x, z))) continue;
    if (CATEDRAL && Math.hypot(x - CATEDRAL.x, z - CATEDRAL.z) < 35) continue;
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 8, c = Math.cos(a), s = Math.sin(a);
      let d1 = 0, d2 = 0;
      while (d1 < 12 && alturaEm(x + c * d1, z + s * d1) < NIVEL_AGUA + 0.4) d1 += 0.5;
      while (d2 < 12 && alturaEm(x - c * d2, z - s * d2) < NIVEL_AGUA + 0.4) d2 += 0.5;
      const w = d1 + d2;
      if (d1 >= 12 || d2 >= 12 || w <= 6 || w >= 10) continue;
      if (!livreFloresta(x + c * (d1 + 3), z + s * (d1 + 3), 1) || !livreFloresta(x - c * (d2 + 3), z - s * (d2 + 3), 1)) continue;
      if (Math.abs(w - 7.5) < Math.abs(mw - 7.5)) { mw = w; melhor = { ax: x + c * (d1 + 0.5), az: z + s * (d1 + 0.5), bx: x - c * (d2 + 0.5), bz: z - s * (d2 + 0.5), w: w + 1 }; }
    }
  }
  if (!melhor) return null;
  return { ...melhor, x: (melhor.ax + melhor.bx) / 2, z: (melhor.az + melhor.bz) / 2, ang: Math.atan2(melhor.bz - melhor.az, melhor.bx - melhor.ax) };
})();
const PANTANO = LAGOS.filter((L) => L.bioma === 'planta' && !L.escondido).sort((a, b) => b.r - a.r)[0] || null;
export const FLORESTA = { catedral: CATEDRAL, ponte: PONTE, pantano: PANTANO, livre: livreFloresta };
