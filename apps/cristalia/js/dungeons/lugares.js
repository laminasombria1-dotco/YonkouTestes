// =============================================================
// LUGARES DAS DUNGEONS (só matemática, sem nada de 3D)
// Em cada bioma, 6 lugares possíveis para as entradas das dungeons. Ficam ativos 3
// de cada vez; quando uma dungeon reseta, ela pula para um lugar livre.
// Tudo sai da semente: o mesmo mapa para todos. NADA aqui muda o relevo, os rios,
// as vilas, as masmorras nem os lugares únicos dos biomas: a entrada só é posta em
// cima do chão que já existe, num lugar plano, longe de tudo isso.
// =============================================================
import {
  BIOMAS, LUGARES, POIS, LAGOS, RESERVAS, RAIO_MUNDO, RAIO_REINO, ANEL_TRANQUILO, NIVEL_AGUA,
  SEMENTE, VERSAO_MAPA, biomaEm, geloEm, naEstradaReal, acidoEm,
} from '../mapa/gerador.js';
import { alturaEm } from '../mapa/altura.js';
import { TRACADOS } from '../dungeon.js';
import { GELO, FLORESTA, ARQ, naTrilhaGelo } from '../biomas/lugares.js';
import { reservadoDeserto } from '../biomas/deserto.js';
import { reservadoVulcao } from '../biomas/vulcao.js';
import { FORJA_ANTIGA } from '../masmorras/forja-antiga.js';

export const POR_BIOMA = 6;         // lugares possíveis em cada bioma
const PASSO = 8;                     // a busca anda de 8 em 8 metros
const ESPACO = 45;                   // metros entre dois lugares (até de biomas diferentes)

// O que as dungeons não podem tocar: vilas, masmorras, pontos de interesse, lagos e os lugares únicos
const EVITAR = [
  ...LUGARES.map((l) => ({ x: l.x, z: l.z, r: l.r + 25 })),
  ...LUGARES.filter((l) => l.tipo === 'masmorra').map((l) => ({ x: l.x, z: l.z, r: 35 })),
  ...(FORJA_ANTIGA.lugarNoMapa ? [{ x: FORJA_ANTIGA.lugarNoMapa.x, z: FORJA_ANTIGA.lugarNoMapa.z, r: 35 }] : []),
  ...POIS.map((o) => ({ x: o.x, z: o.z, r: o.r + 18 })),
  ...LAGOS.map((o) => ({ x: o.x, z: o.z, r: o.r + 10 })),
  ...RESERVAS.map((o) => ({ x: o.x, z: o.z, r: o.r + 4 })),
  ...[GELO.acamp, GELO.lago, GELO.arco, GELO.fonte, FLORESTA.catedral, FLORESTA.ponte, FLORESTA.pantano,
    ARQ.vulcao, ARQ.arco, ARQ.farol, ARQ.nau, ARQ.atol].filter((o) => o && o.x != null).map((o) => ({ x: o.x, z: o.z, r: (o.r || 0) + 22 })),
  { x: ARQ.enseada.ilha.x, z: ARQ.enseada.ilha.z, r: 30 },
];

const ANEL8 = Array.from({ length: 8 }, (_, a) => [Math.cos(a * Math.PI / 4), Math.sin(a * Math.PI / 4)]);
function desnivel(x, z, r) {
  let lo = Infinity, hi = -Infinity;
  for (const [c, s] of ANEL8) { const h = alturaEm(x + c * r, z + s * r); lo = Math.min(lo, h); hi = Math.max(hi, h); }
  return hi - lo;
}
// O ponto serve para uma entrada?
function serve(x, z, bio) {
  const d = Math.hypot(x, z);
  if (d < RAIO_REINO + ANEL_TRANQUILO + 30 || d > RAIO_MUNDO - 45) return false;
  if (EVITAR.some((o) => Math.hypot(o.x - x, o.z - z) < o.r)) return false;
  if (desnivel(x, z, 6) >= 1.3) return false;
  for (const [c, s] of ANEL8) if (biomaEm(x + c * 16, z + s * 16) !== bio) return false; // bem dentro do bioma
  if (naTrilhaGelo(x, z) < 14) return false;
  // num círculo de 16 m: nada de caminho do Deserto, lugares do Vulcânico, ácido, corredores nem Estrada Real
  for (const [c, s] of [[0, 0], ...ANEL8]) for (const r of [8, 16]) {
    const X = x + c * r, Z = z + s * r;
    if (reservadoDeserto(X, Z) || reservadoVulcao(X, Z) || acidoEm(X, Z)) return false;
    if (TRACADOS.some((t) => t.reservado(X, Z))) return false;
    const e = naEstradaReal(X, Z); if (e.dentro && e.lat < 12) return false;
    if (c === 0 && s === 0) break;
  }
  for (const [c, s] of [[0, 0], ...ANEL8]) { const X = x + c * 8, Z = z + s * 8; if (alturaEm(X, Z) < NIVEL_AGUA + 0.35 || geloEm(X, Z)) return false; }
  return true;
}

// LUGARES_DUNGEON[bioma] = [{ x, z, ang }, ...] (6 por bioma, bem espalhados).
// A busca leva uns décimos de segundo: o resultado fica guardado no aparelho (pela semente),
// e da 2ª vez em diante o jogo só lê.
const CHAVE = `cristalia-dungeons-lugares:v1:${SEMENTE}:${VERSAO_MAPA}`;
function buscar() {
  const res = {}, todos = [];
  for (const B of BIOMAS) {
    const cand = [];
    for (let x = -RAIO_MUNDO; x <= RAIO_MUNDO; x += PASSO) for (let z = -RAIO_MUNDO; z <= RAIO_MUNDO; z += PASSO) {
      const d = Math.hypot(x, z);
      if (d < RAIO_REINO + ANEL_TRANQUILO + 30 || d > RAIO_MUNDO - 45 || biomaEm(x, z) !== B.id) continue;
      if (serve(x, z, B.id)) cand.push({ x, z, v: desnivel(x, z, 6) });
    }
    cand.sort((a, b) => a.v - b.v || a.x - b.x || a.z - b.z);
    const esc = [];
    // o mais plano primeiro; depois, sempre o mais longe dos já escolhidos
    for (const c of cand) if (todos.every((t) => Math.hypot(t.x - c.x, t.z - c.z) > ESPACO)) { esc.push(c); break; }
    while (esc.length && esc.length < POR_BIOMA) {
      let m = null, md = 0;
      for (const c of cand) {
        const d = Math.min(...esc.map((e) => Math.hypot(e.x - c.x, e.z - c.z)), ...todos.map((t) => Math.hypot(t.x - c.x, t.z - c.z)));
        if (d > md) { md = d; m = c; }
      }
      if (!m || md < ESPACO) break;
      esc.push(m);
    }
    todos.push(...esc);
    // a entrada olha para o centro do mapa (de onde o jogador vem)
    res[B.id] = esc.map((e) => ({ x: e.x, z: e.z, ang: Math.atan2(-e.x, -e.z) }));
  }
  return res;
}
function carregar() {
  try { const t = localStorage.getItem(CHAVE); if (t) { const r = JSON.parse(t); if (BIOMAS.every((b) => Array.isArray(r[b.id]))) return r; } } catch { /* sem armazenamento: busca de novo */ }
  const r = buscar();
  try { localStorage.setItem(CHAVE, JSON.stringify(r)); } catch { /* tudo bem */ }
  return r;
}
export const LUGARES_DUNGEON = carregar();
