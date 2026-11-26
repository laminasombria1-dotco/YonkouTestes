// =============================================================
// FORMA DE UMA MASMORRA NOVA (só matemática, sem desenho)
// As masmorras novas são ÁREAS SEPARADAS: cada uma fica num lugar bem longe
// do mapa redondo (a "origem" dela). Enquanto você está lá dentro, o mapa de
// fora some sozinho (os chunks ficam longe e são apagados) e o jogo usa esta
// forma para saber a altura do chão, onde dá para andar e o que bloqueia.
//
// A forma é feita de:
//  - salas: elipses (rx, rz) com a altura do chão (número ou função) e o tipo
//    'aberta' (céu aberto: morros em volta), 'canion' (céu aberto, paredões de pedra)
//    ou 'gruta' (paredes altas de pedra, sem céu);
//  - corredores: ligam o centro de uma sala ao de outra (meia largura "larg");
//  - abismos: cápsulas em volta de uma ponte, onde o chão cai (não dá para andar);
//  - buracos: círculos de água funda (no Lago Congelado), que empurram para fora.
// Tudo usa coordenadas LOCAIS (em volta da origem). As funções públicas recebem
// as coordenadas do mundo (x, z) e já convertem.
// =============================================================

// Só UMA masmorra fica ativa por vez. altura.js e mundo.js perguntam aqui.
export const INTERIOR = { forma: null };
// A forma ativa, se (x, z) estiver dentro da área dela (senão null)
export function interiorEm(x, z) {
  const f = INTERIOR.forma;
  return f && f.contem(x, z) ? f : null;
}

const pesoD = (d) => Math.exp(-0.35 * Math.max(-12, Math.min(30, d)));

export class FormaMasmorra {
  // cfg: { origem, zona, salas, corredores, abismos, buracos, margem }
  constructor(cfg) {
    this.origem = cfg.origem;
    this.zona = cfg.zona;
    this.salas = cfg.salas.map((s) => ({ tipo: 'gruta', ...s, rx: s.rx ?? s.r, rz: s.rz ?? s.r }));
    // cada corredor vai da BEIRADA de uma sala até a beirada da outra (entra 3 m em cada uma):
    // assim ele não mexe na altura do chão dentro das salas
    this.corredores = (cfg.corredores || []).map((c) => {
      const a = this.salas[c.a], b = this.salas[c.b];
      const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
      const ra = 1 / Math.hypot(ux / a.rx, uz / a.rz), rb = 1 / Math.hypot(ux / b.rx, uz / b.rz);
      const ax = a.x + ux * (ra - 3), az = a.z + uz * (ra - 3), bx = b.x - ux * (rb - 3), bz = b.z - uz * (rb - 3);
      return { tipo: 'gruta', ...c, sa: a, sb: b, ux, uz, ra, ax, az, bx, bz, ha: this.hSala(a, ax, az), hb: this.hSala(b, bx, bz) };
    });
    // abismo em volta de um corredor (a ponte): a cápsula vai de uma beirada à outra
    this.abismos = (cfg.abismos || []).map((ab) => {
      const c = this.corredores[ab.corredor];
      return { ...ab, a: { x: c.ax + c.ux * 3, z: c.az + c.uz * 3 }, b: { x: c.bx - c.ux * 3, z: c.bz - c.uz * 3 } };
    });
    this.buracos = cfg.buracos || [];
    // caixa em volta de tudo (local), com folga para as paredes
    const m = cfg.margem ?? 40;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const s of this.salas) { x0 = Math.min(x0, s.x - s.rx); x1 = Math.max(x1, s.x + s.rx); z0 = Math.min(z0, s.z - s.rz); z1 = Math.max(z1, s.z + s.rz); }
    this.caixa = { x0: x0 - m, x1: x1 + m, z0: z0 - m, z1: z1 + m };
  }

  hSala(s, x, z) { return typeof s.h === 'function' ? s.h(x, z) : s.h || 0; }
  contem(x, z) {
    const lx = x - this.origem.x, lz = z - this.origem.z, c = this.caixa;
    return lx > c.x0 - 30 && lx < c.x1 + 30 && lz > c.z0 - 30 && lz < c.z1 + 30;
  }
  paraMundo(lx, lz) { return { x: this.origem.x + lx, z: this.origem.z + lz }; }

  // ---------- distâncias (negativo = dentro) ----------
  dSala(s, x, z) {
    const k = Math.hypot((x - s.x) / s.rx, (z - s.z) / s.rz);
    return (k - 1) * Math.min(s.rx, s.rz);
  }
  tCorredor(c, x, z) {
    const dx = c.bx - c.ax, dz = c.bz - c.az, L2 = dx * dx + dz * dz || 1;
    return Math.max(0, Math.min(1, ((x - c.ax) * dx + (z - c.az) * dz) / L2));
  }
  dCorredor(c, x, z) {
    const t = this.tCorredor(c, x, z);
    return Math.hypot(x - c.ax - (c.bx - c.ax) * t, z - c.az - (c.bz - c.az) * t) - c.larg;
  }
  dSegmento(a, b, x, z) {
    const dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / L2));
    return Math.hypot(x - a.x - dx * t, z - a.z - dz * t);
  }

  // Onde dá para andar (local): d (negativo = dentro), a altura do chão e o tipo mais perto
  andavelLocal(x, z) {
    let d = Infinity, soma = 0, somaH = 0, tipo = 'gruta', dTipo = Infinity;
    for (const s of this.salas) {
      const di = this.dSala(s, x, z), w = pesoD(di);
      soma += w; somaH += w * this.hSala(s, x, z);
      if (di < d) d = di;
      if (di < dTipo) { dTipo = di; tipo = s.tipo; }
    }
    for (const c of this.corredores) {
      const di = this.dCorredor(c, x, z), w = pesoD(di) * (c.forte || 1);
      const t = this.tCorredor(c, x, z);
      soma += w; somaH += w * (c.h ?? (c.ha + (c.hb - c.ha) * t));
      if (di < d) d = di;
      if (di < dTipo - 1) { dTipo = di; tipo = c.tipo; }
    }
    return { d, h: soma > 0 ? somaH / soma : 0, tipo };
  }

  // ---------- altura do chão (local) ----------
  alturaLocal(x, z) {
    const { d, h, tipo } = this.andavelLocal(x, z);
    // buracos de água funda (o fundo fica escuro lá embaixo)
    for (const b of this.buracos) {
      const db = Math.hypot(x - b.x, z - b.z) - b.r;
      if (db < 1.5 && d < 0) return h - 2.6 * Math.min(1, (1.5 - db) / 1.5);
    }
    if (d <= 0) {
      // chão quase plano; nas salas abertas, uma ondulação leve
      return h + (tipo !== 'gruta' ? 0.22 * Math.sin(x * 0.31) * Math.cos(z * 0.27) : 0.06 * Math.sin(x * 0.9 + z * 0.7));
    }
    // abismo em volta das pontes: o chão despenca
    for (const a of this.abismos) {
      if (this.dSegmento(a.a, a.b, x, z) < a.r) return h - Math.min(a.fundo, d * 5);
    }
    // paredes: morros nas áreas abertas, rocha alta nas grutas
    const ruido = (Math.sin(x * 0.21 + z * 0.13) * Math.sin(z * 0.17 - x * 0.07) + 0.5 * Math.sin(x * 0.53 - z * 0.41)) * Math.min(1, d / 4);
    if (tipo === 'aberta') return h + Math.min(14, d * 0.5 + d * d * 0.012) + ruido * 1.6;
    if (tipo === 'canion') return h + Math.min(16, d * 1.7) + ruido * 1.4; // paredões de pedra, céu aberto
    return h + Math.min(17, d * 2.1) + ruido * 1.2;
  }

  // ---------- o que o jogo chama (coordenadas do mundo) ----------
  altura(x, z) { return this.alturaLocal(x - this.origem.x, z - this.origem.z); }
  distancia(x, z) { return this.andavelLocal(x - this.origem.x, z - this.origem.z).d; }
  livre(x, z, raio) {
    const lx = x - this.origem.x, lz = z - this.origem.z;
    return this.andavelLocal(lx, lz).d < -raio - 0.25;
  }
  // Leva um ponto para dentro da parte andável mais perto
  prender(p, raio) {
    const lx = p.x - this.origem.x, lz = p.z - this.origem.z, folga = raio + 0.3;
    let melhor = null, dm = Infinity;
    const tenta = (x, z) => { const d = Math.hypot(x - lx, z - lz); if (d < dm) { dm = d; melhor = { x, z }; } };
    for (const s of this.salas) {
      const k = Math.hypot((lx - s.x) / s.rx, (lz - s.z) / s.rz) || 1;
      const lim = Math.max(0, 1 - folga / Math.min(s.rx, s.rz));
      if (k <= lim) { tenta(lx, lz); continue; }
      tenta(s.x + (lx - s.x) * lim / k, s.z + (lz - s.z) * lim / k);
    }
    for (const c of this.corredores) {
      const t = this.tCorredor(c, lx, lz), cx = c.ax + (c.bx - c.ax) * t, cz = c.az + (c.bz - c.az) * t;
      const dx = lx - cx, dz = lz - cz, d = Math.hypot(dx, dz) || 1, lim = Math.max(0, c.larg - folga);
      tenta(d > lim ? cx + (dx / d) * lim : lx, d > lim ? cz + (dz / d) * lim : lz);
    }
    return { x: melhor.x + this.origem.x, z: melhor.z + this.origem.z };
  }
  // Empurra para fora dos buracos de água
  empurrar(p, raio) {
    const lx = p.x - this.origem.x, lz = p.z - this.origem.z;
    for (const b of this.buracos) {
      const dx = lx - b.x, dz = lz - b.z, d = Math.hypot(dx, dz) || 0.01, min = b.r + raio;
      if (d < min) { p.x = this.origem.x + b.x + (dx / d) * min; p.z = this.origem.z + b.z + (dz / d) * min; }
    }
  }
  // Em que sala está (índice; -1 = corredor ou fora)
  salaEm(x, z) {
    const lx = x - this.origem.x, lz = z - this.origem.z;
    let melhor = -1, dm = 0;
    this.salas.forEach((s, i) => { const d = this.dSala(s, lx, lz); if (d < dm) { dm = d; melhor = i; } });
    return melhor;
  }
  // A sala mais perto (mesmo nos corredores), para o clima
  salaPerto(x, z) {
    const lx = x - this.origem.x, lz = z - this.origem.z;
    let melhor = 0, dm = Infinity;
    this.salas.forEach((s, i) => { const d = this.dSala(s, lx, lz); if (d < dm) { dm = d; melhor = i; } });
    return melhor;
  }
}
