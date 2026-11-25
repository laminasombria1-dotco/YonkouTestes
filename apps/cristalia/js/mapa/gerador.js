// =============================================================
// GERADOR DO MAPA (só matemática, sem nada de 3D)
// A partir da SEMENTE, decide:
//  - onde fica cada bioma (em volta do Campo, com bordas onduladas);
//  - a altura do chão em cada ponto (morrinhos, dunas e cânions,
//    picos nevados, vulcão com cratera);
//  - rios, lagos, lagos congelados e rios de lava;
//  - os pontos de interesse e os lugares fixos da Floresta.
// A mesma semente sempre dá o mesmo resultado.
// =============================================================
import { CONFIG_MAPA as C } from './config.js';

// Semente: a do config, ou ?semente=123 na URL (para testes do GM)
function lerSemente() {
  try {
    const p = new URLSearchParams(location.search).get('semente');
    if (p && /^\d{1,9}$/.test(p)) return Number(p);
  } catch { /* sem URL */ }
  return C.semente;
}
export const SEMENTE = lerSemente();
export const SEMENTE_PADRAO = C.semente;
export const RAIO_MUNDO = C.raioMundo;
export const NIVEL_AGUA = C.agua.nivel;
export const FUNDO_BLOQUEIO = -1.25; // mais fundo que isso: não dá para andar (lago fundo, lava)

// ---------- números aleatórios e ruído ----------
export function aleatorio(semente) {
  return () => {
    semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Mistura 3 números inteiros num número de 0 a 1 (sempre o mesmo para os mesmos números)
function hash(ix, iz, s) {
  let h = (Math.imul(ix | 0, 0x27d4eb2d) ^ Math.imul(iz | 0, 0x165667b1) ^ Math.imul(s | 0, 0x9e3779b1)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
export function semente3(a, b, c) { return Math.floor(hash(a, b, c) * 2147483647); }
// Ruído suave (value noise): -1 a 1
export function ruido(x, z, s) {
  const ix = Math.floor(x), iz = Math.floor(z);
  let fx = x - ix, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz, s), b = hash(ix + 1, iz, s), c = hash(ix, iz + 1, s), d = hash(ix + 1, iz + 1, s);
  return ((a + (b - a) * fx) * (1 - fz) + (c + (d - c) * fx) * fz) * 2 - 1;
}
// Várias camadas de ruído (detalhes grandes + pequenos)
export function fbm(x, z, s, oitavas) {
  let t = 0, a = 1, n = 0;
  for (let o = 0; o < oitavas; o++) { t += ruido(x, z, s + o * 131) * a; n += a; a *= 0.5; x *= 2.03; z *= 2.03; }
  return t / n;
}
// Transição suave: 0 em a, 1 em b (a pode ser maior que b)
export function suave(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
const S = SEMENTE;

// ---------- biomas ----------
// Mundo novo: o Reino no meio e os 5 biomas em fatias em volta, numa ORDEM FIXA
// (config.js). A semente decide o relevo, os rios, as ilhas e os lugares, não a ordem.
const B = C.biomas;
export const RAIO_REINO = C.raioReino;
export const ANEL_TRANQUILO = C.anelTranquilo;
export const VERSAO_MAPA = C.versaoMapa;
const N_BIOMAS = B.lista.length;
// Centros dos biomas: no meio de cada fatia
export const BIOMAS = [];
{
  const ang0 = (B.angulo0 * Math.PI) / 180, passo = (Math.PI * 2) / N_BIOMAS;
  B.lista.forEach((id, i) => {
    const a = ang0 + i * passo;
    BIOMAS.push({ id, x: Math.cos(a) * B.distancia, z: Math.sin(a) * B.distancia, ang: a, peso: B.tamanhoPorBioma?.[id] ?? 1 });
  });
}
export const centroDe = (id) => BIOMAS.find((b) => b.id === id);
// 'campo' = o chão dentro do Reino (o Campo antigo virou o Reino)
const IDS = [...BIOMAS.map((b) => b.id), 'campo'];
const PESOS = new Float32Array(N_BIOMAS + 1); // o último é o chão do Reino
const DIST = new Float32Array(N_BIOMAS);
let tx = 0, tz = 0;
function torcer(x, z, amp) {
  tx = x + fbm(x / 150, z / 150, S + 11, 3) * amp * 2;
  tz = z + fbm(x / 150 + 40.7, z / 150 - 13.1, S + 23, 3) * amp * 2;
}
// Quanto cada bioma "vale" num ponto (soma 1). Perto das bordas, dois valem um pouco cada.
export function pesosEm(x, z) {
  // perto do Reino as bordas ficam mais retas (cada portão cai no meio do seu bioma); longe, onduladas
  torcer(x, z, B.torcao * Math.min(1, Math.max(0.12, (Math.hypot(x, z) - RAIO_REINO) / 170)));
  let dmin = Infinity;
  for (let i = 0; i < N_BIOMAS; i++) {
    const b = BIOMAS[i];
    // fatias: conta o ângulo (e um pouco a distância), para cada bioma ir do Reino até a borda
    const ang = Math.atan2(tz, tx), dAng = Math.abs(Math.atan2(Math.sin(ang - b.ang), Math.cos(ang - b.ang)));
    DIST[i] = (dAng * 230 + Math.abs(Math.hypot(tx, tz) - B.distancia) * 0.08) / b.peso;
    if (DIST[i] < dmin) dmin = DIST[i];
  }
  let soma = 0;
  for (let i = 0; i < N_BIOMAS; i++) { const w = Math.max(0, 1 - (DIST[i] - dmin) / B.transicao); PESOS[i] = w; soma += w; }
  // o Reino é um círculo certinho (sem torcer)
  const c = suave(RAIO_REINO + 6, RAIO_REINO - 6, Math.hypot(x, z));
  for (let i = 0; i < N_BIOMAS; i++) PESOS[i] = (PESOS[i] / soma) * (1 - c);
  PESOS[N_BIOMAS] = c;
  return PESOS;
}
export const idDoPeso = (i) => IDS[i];
export const N_PESOS = N_BIOMAS + 1;
// O bioma de um ponto (o que vale mais)
export function biomaEm(x, z) {
  const P = pesosEm(x, z);
  let im = 0;
  for (let i = 1; i < P.length; i++) if (P[i] > P[im]) im = i;
  return IDS[im];
}

// ---------- saídas das dungeons (pela borda do bioma delas) ----------
export const SAIDAS = { brasas: centroDe('fogo').ang, raizes: centroDe('planta').ang };
// ---------- o Reino (no meio) e os 5 caminhos seguros ----------
// O Reino fica no meio do mapa, com um portão para cada bioma. De cada portão sai um caminho
// curto e seguro (a "Estrada Real"): nenhum selvagem nasce nele nem chega perto.
export const ESTRADAS = BIOMAS.map((b) => ({
  ang: b.ang, bioma: b.id, dir: { x: Math.cos(b.ang), z: Math.sin(b.ang) }, inicio: RAIO_REINO - 8, fim: RAIO_REINO + 38, largura: 3,
}));
export const ESTRADA = ESTRADAS[0]; // (medidas iguais para todas: largura, começo e fim)
// O portão principal do Reino (a frente do castelo) é o da Floresta
export const ANG_REINO = ESTRADAS.find((e) => e.bioma === 'planta').ang;
// Onde um ponto fica em relação ao caminho mais perto: ao = ao longo (distância do centro), lat = para o lado
const RES_ESTRADA = { ao: 0, lat: 0, dentro: false, dir: ESTRADA.dir };
export function naEstradaReal(x, z) {
  let melhor = null;
  for (const e of ESTRADAS) {
    const ao = x * e.dir.x + z * e.dir.z;
    if (ao < 0) continue;
    const lat = Math.abs(-x * e.dir.z + z * e.dir.x);
    if (!melhor || lat < melhor.lat) melhor = { ao, lat, e };
  }
  if (!melhor) { RES_ESTRADA.dentro = false; RES_ESTRADA.lat = 999; return RES_ESTRADA; }
  RES_ESTRADA.ao = melhor.ao; RES_ESTRADA.lat = melhor.lat; RES_ESTRADA.dir = melhor.e.dir;
  RES_ESTRADA.dentro = melhor.ao > melhor.e.inicio && melhor.ao < melhor.e.fim + 8;
  return RES_ESTRADA;
}

// 0 perto do caminho de uma dungeon (sem rio nem lago ali), 1 longe
function longeDasSaidas(x, z) {
  let f = 1;
  for (const a of Object.values(SAIDAS)) {
    const c = Math.cos(a), s = Math.sin(a);
    const ao = x * c + z * s, lat = Math.abs(-x * s + z * c);
    if (ao > RAIO_MUNDO - 75) f *= suave(18, 34, lat);
  }
  return f;
}

// ---------- Floresta: lugares fixos (relativos ao centro da Floresta) ----------
// (no mapa antigo a Floresta ficava em -40, -32 e a Trilha saía a noroeste: o desenho é o mesmo, só girado)
const F = centroDe('planta');
const giroF = F.ang - Math.atan2(-32, -40);
function naFloresta(ox, oz) {
  const c = Math.cos(giroF), s = Math.sin(giroF);
  return { x: F.x + ox * c - oz * s, z: F.z + ox * s + oz * c };
}
export const CENTRO_FLORESTA = { x: F.x, z: F.z };
export const LAGOA = { ...naFloresta(-20, 16), r: 6.5, tipo: 'agua', fundo: -1.8, escondido: true };
export const PONTOS_FLORESTA = {
  clareiras: [[16, -24], [-18, 2]].map(([a, b]) => ({ ...naFloresta(a, b), r: 8 })),
  gigantes: [[-4, 12, 1.1], [24, 2, 0.95], [-31, 4, 1.05], [2, -26, 1], [-10, 28, 0.9]].map(([a, b, e]) => ({ ...naFloresta(a, b), e })),
  ruina: { ...naFloresta(12, -10), r: 6 },
};

// ---------- pontos de interesse (POIs) ----------
// vulcao: no centro de cada bioma de Lava (cratera com lava)
// arco: arco de pedra no Deserto · cristalGelo: cristal de gelo gigante na Neve
// (os lugares do futuro são preenchidos mais abaixo; declarados aqui porque o relevo do Arquipélago usa)
export const LUGARES = [];
let LUGARES_AGUA = [];
export const POIS = [];
const rngPoi = aleatorio(S ^ 0x2545f491);
for (const b of BIOMAS) {
  if (b.id === 'fogo') POIS.push({ tipo: 'vulcao', x: b.x, z: b.z, r: 9, ang: 0 });
  const tipo = b.id === 'terra' ? 'arco' : b.id === 'raio' ? 'cristalGelo' : null;
  if (!tipo) continue;
  for (let t = 0; t < 200; t++) {
    const a = rngPoi() * Math.PI * 2, d = 10 + rngPoi() * 40;
    const x = b.x + Math.cos(a) * d, z = b.z + Math.sin(a) * d;
    if (biomaEm(x, z) !== b.id || Math.hypot(x, z) > RAIO_MUNDO - 30) continue;
    if (tipo === 'cristalGelo' && alturaBioma(x, z) > 7) continue; // num vale, não no pico
    POIS.push({ tipo, x, z, r: tipo === 'arco' ? 7 : 6, ang: rngPoi() * Math.PI });
    break;
  }
}

// ---------- lugares guardados para o futuro (mundo novo) ----------
// Em cada bioma: 1 VILA com arena (passo 3) e as MASMORRAS novas (passo 4; 2 por bioma,
// contando o Caminho das Brasas no Vulcânico e a Trilha Ancestral na Floresta).
// Ficam presos à semente (o mesmo lugar para todos). Nada nasce em cima deles (nem rio nem lago).
// No Arquipélago, cada lugar ganha uma ilha.
{
  const rngV = aleatorio(S ^ 0x3c6ef372);
  const acha = (b, tipo, d0, d1, a0, a1, r) => {
    for (let t = 0; t < 300; t++) {
      const a = b.ang + a0 + rngV() * (a1 - a0), d = d0 + rngV() * (d1 - d0);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (biomaEm(x, z) !== b.id) continue;
      if ([...POIS, ...LUGARES, LAGOA, ...PONTOS_FLORESTA.clareiras, PONTOS_FLORESTA.ruina].some((o) => Math.hypot(o.x - x, o.z - z) < (o.r || 6) + r + 20)) continue;
      if (b.id !== 'agua' && b.id !== 'fogo' && b.id !== 'raio' && alturaBioma(x, z) < 0.3) continue;
      LUGARES.push({ tipo, bioma: b.id, x, z, r, ang: a });
      return;
    }
  };
  for (const b of BIOMAS) {
    acha(b, 'vila', 190, 240, 0.22, 0.42, 30);
    const corredor = b.id === 'fogo' || b.id === 'planta'; // já tem a masmorra de hoje (no meio da borda)
    if (!corredor) acha(b, 'masmorra', 300, 345, -0.5, -0.28, 12);
    acha(b, 'masmorra', 300, 345, 0.28, 0.5, 12);
  }
}
LUGARES_AGUA = LUGARES.filter((l) => l.bioma === 'agua');

// ---------- lagos ----------
// agua: lago normal (o do Campo, o da Floresta e um oásis no Deserto)
// gelo: lago congelado na Neve (dá para andar em cima)
export const LAGOS = [];
{
  const rngL = aleatorio(S ^ 0x68e31da4);
  const pedidos = [
    { bioma: 'planta', tipo: 'agua', r: [12, 16], d: [170, 330] },
    { bioma: 'planta', tipo: 'agua', r: [9, 12], d: [170, 330] },
    { bioma: 'terra', tipo: 'agua', r: [8, 10], d: [170, 330], oasis: true },
    { bioma: 'raio', tipo: 'gelo', r: [9, 12], d: [170, 330] },
    { bioma: 'raio', tipo: 'gelo', r: [6, 9], d: [170, 330] },
    { bioma: 'raio', tipo: 'gelo', r: [7, 10], d: [170, 330] },
  ];
  const evitar = [LAGOA, ...PONTOS_FLORESTA.clareiras, PONTOS_FLORESTA.ruina, ...POIS, ...LUGARES];
  for (const p of pedidos) {
    for (let t = 0; t < 400; t++) {
      const a = rngL() * Math.PI * 2, d = p.d[0] + rngL() * (p.d[1] - p.d[0]), r = p.r[0] + rngL() * (p.r[1] - p.r[0]);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x, z) < r + 16 || Math.hypot(x, z) > RAIO_MUNDO - r - 22) continue;
      // o lago inteiro dentro do bioma
      if ([[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => biomaEm(x + dx * (r + 4), z + dz * (r + 4)) !== p.bioma)) continue;
      if (longeDasSaidas(x, z) < 1) continue;
      if (LAGOS.some((L) => Math.hypot(L.x - x, L.z - z) < L.r + r + 25)) continue;
      if (evitar.some((e) => Math.hypot(e.x - x, e.z - z) < (e.r || 5) + r + 10)) continue;
      LAGOS.push({ x, z, r, tipo: p.tipo, fundo: p.tipo === 'gelo' ? -0.15 : -2.4, oasis: !!p.oasis, bioma: p.bioma });
      break;
    }
  }
  LAGOS.push(LAGOA);
}
// O lago mais perto (até "margem" metros da borda)
export function lagoEm(x, z, margem = 0, tipo = null) {
  for (const L of LAGOS) if ((!tipo || L.tipo === tipo) && Math.hypot(x - L.x, z - L.z) < L.r + margem) return L;
  return null;
}
export function geloEm(x, z) { const L = lagoEm(x, z, 0.3, 'gelo'); return !!L; }

// ---------- lugares secretos: cristais fortes escondidos ----------
export const SEGREDOS = [];
for (const p of POIS) {
  if (p.tipo === 'arco') SEGREDOS.push({ x: p.x, z: p.z, tipo: 1 }); // embaixo do arco
  if (p.tipo === 'cristalGelo') SEGREDOS.push({ x: p.x + Math.cos(p.ang) * 3.6, z: p.z + Math.sin(p.ang) * 3.6, tipo: 2 }); // ao lado do cristal de gelo
}
for (const L of LAGOS) if (L.oasis) SEGREDOS.push({ x: L.x + L.r + 3, z: L.z, tipo: 1 }); // na margem do oásis

// Lugares onde o mapa não põe árvores nem pedras (as dungeons e os POIs se decoram sozinhos)
export const RESERVAS = [
  { x: LAGOA.x, z: LAGOA.z, r: LAGOA.r + 5 }, ...PONTOS_FLORESTA.clareiras, PONTOS_FLORESTA.ruina,
  ...PONTOS_FLORESTA.gigantes.map((g) => ({ x: g.x, z: g.z, r: 5 * g.e })),
  ...POIS.map((p) => ({ x: p.x, z: p.z, r: p.r + 2 })),
  ...SEGREDOS.map((s) => ({ x: s.x, z: s.z, r: 2 })),
  ...LUGARES.map((l) => ({ x: l.x, z: l.z, r: l.r })),
];
// Lugares sem rio passando
const SEM_RIO = [...RESERVAS, ...LAGOS.map((L) => ({ x: L.x, z: L.z, r: L.r }))];

// ---------- altura do chão ----------
const FATOR_RIO = { campo: 0, planta: 1, terra: 0.55, raio: 0.75, fogo: 0, agua: 0 };
// Relevo de cada bioma
function alturaDoBioma(id, i, x, z, base) {
  switch (id) {
    case 'campo': return 0.35 + base * 0.55;
    case 'planta': return 0.4 + base * 1.1 + Math.max(0, fbm(x / 28, z / 28, S + 41, 2)) * 5;
    case 'terra': { // Deserto: planalto de areia com dunas e cânions
      const u = (x * 0.8 + z * 0.6) / 7 + fbm(x / 60, z / 60, S + 43, 2) * 6;
      const duna = (0.5 + 0.5 * Math.sin(u)) ** 2 * 1.7;
      const canion = suave(0.06, 0.015, Math.abs(fbm(x / 75, z / 75, S + 47, 3)));
      return 3 + duna + base * 0.4 - canion * 2.9; // o fundo do cânion fica seco (acima da água)
    }
    case 'raio': { // Neve: cadeias de montanhas (mais altas no meio do bioma)
      const b = BIOMAS[i];
      const crista = Math.max(0, 1 - Math.abs(fbm(x / 60, z / 60, S + 53, 4) * 2));
      const massa = Math.min(1, Math.max(0.25, 1.25 - Math.hypot(x - b.x, z - b.z) / (120 * b.peso)));
      return 1.5 + crista ** 2.4 * 19 * massa + base * 0.6;
    }
    case 'fogo': { // Lava: chão vulcânico, vulcão com cratera no meio e rios de lava
      const b = BIOMAS[i], dv = Math.hypot(x - b.x, z - b.z);
      let h = 1.5 + base * 1.1;
      const cone = (d) => 15 * Math.max(0, 1 - d / 50) ** 1.25;
      if (dv < 7) h += cone(7) - 3.5 * suave(7, 4.5, dv); // cratera
      else h += cone(dv);
      const canal = suave(0.05, 0.018, Math.abs(fbm(x / 55, z / 55, S + 59, 2)))
        * suave(-0.25, 0, ruido(x / 30, z / 30, S + 61)) * suave(36, 46, dv);
      return h * (1 - canal) - 1.7 * canal;
    }
    case 'agua': { // Arquipélago: quase tudo água rasa (dá para andar, mais devagar), ilhas e canais fundos
      let ilha = fbm(x / 48, z / 48, S + 81, 3);
      for (const l of LUGARES_AGUA) ilha += 0.9 * suave(l.r + 28, l.r + 4, Math.hypot(x - l.x, z - l.z)); // ilha da vila e das masmorras
      const t = suave(0.07, 0.27, ilha);
      const h = -0.85 + t * (1.9 + Math.max(0, base) * 0.8 + Math.max(0, ilha - 0.27) * 6);
      // canais fundos (não dá para passar), cortados em pedaços: sempre tem caminho por água rasa
      const canal = suave(0.045, 0.012, Math.abs(fbm(x / 70, z / 70, S + 83, 2))) * suave(-0.15, 0.15, ruido(x / 34, z / 34, S + 85)) * (1 - t);
      return h * (1 - canal) - 2.3 * canal;
    }
  }
  return base;
}
// Morrinhos comuns a todos (os vales são mais rasos que os morros: menos poças)
function relevoBase(x, z) {
  const b = fbm(x / 45, z / 45, S + 31, 3) * 3.2 + ruido(x / 13, z / 13, S + 37) * 0.35;
  return b > 0 ? b : b * 0.35;
}
// Altura sem os rios e lagos (usada para escolher os POIs)
function alturaBioma(x, z) {
  const P = pesosEm(x, z);
  const base = relevoBase(x, z);
  let h = 0;
  for (let i = 0; i < P.length; i++) if (P[i] > 1e-4) h += P[i] * alturaDoBioma(IDS[i], i, x, z, base);
  return h;
}
// Altura do chão (sem as dungeons e a borda: isso o mundo.js junta)
export function alturaBase(x, z) {
  const P = pesosEm(x, z);
  const base = relevoBase(x, z);
  let h = 0, fRio = 0;
  for (let i = 0; i < P.length; i++) {
    if (P[i] < 1e-4) continue;
    h += P[i] * alturaDoBioma(IDS[i], i, x, z, base);
    fRio += P[i] * FATOR_RIO[IDS[i]];
  }
  const dc = Math.hypot(x, z);
  // perto do Reino o chão fica suave (o anel tranquilo: sem paredão de montanha nem mar fundo nos portões)
  { const k = suave(RAIO_REINO + ANEL_TRANQUILO + 20, RAIO_REINO + 8, dc) * 0.8; if (k > 0) h = h * (1 - k) + (0.7 + base * 0.3) * k; }
  // rios: onde um ruído bem largo passa perto de zero
  fRio *= suave(RAIO_REINO + 12, RAIO_REINO + 30, dc) * longeDasSaidas(x, z);
  { const e = naEstradaReal(x, z); if (e.ao > ESTRADA.inicio - 10 && e.ao < ESTRADA.fim + 20) fRio *= suave(7, 16, e.lat); } // sem rio nos caminhos do Reino
  if (fRio > 0.02 && C.agua.rios > 0) {
    for (const r of SEM_RIO) { const d = Math.hypot(x - r.x, z - r.z); if (d < r.r + 14) fRio *= suave(r.r + 2, r.r + 14, d); }
  }
  if (fRio > 0.02 && C.agua.rios > 0) { // (de novo: perto dos lugares guardados o rio pode ter zerado)
    const L = C.agua.rios * fRio;
    const k = suave(L, L * 0.3, Math.abs(fbm(x / 120, z / 120, S + 67, 3)));
    h = h * (1 - k) - 1.15 * k;
  }
  // lagos (com a borda um pouco irregular)
  for (const L of LAGOS) {
    const borda = L.r + 6, d0 = Math.hypot(x - L.x, z - L.z);
    if (d0 > borda + 2) continue;
    const dl = d0 + ruido(x / 6, z / 6, S + 71) * 1.8;
    if (dl < borda) {
      const k = L.escondido ? Math.min(1, (borda - dl) / 6) : suave(borda, L.r * 0.55, dl);
      h = h * (1 - k) + L.fundo * k;
    }
  }
  return h;
}
