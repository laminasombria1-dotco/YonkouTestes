// =============================================================
// VULCARAPA NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em vulcarapa.js)
//  - Recuo: explosão de lava num leque na frente e um pulo para trás (usa o "dash" da batalha).
//    Nas evoluções deixa uma poça de lava onde ela estava e, na Colossarapa, atordoa.
//    Usar o Recuo termina o Modo Vulcão (é a saída de emergência).
//  - Bomba de Lava: bomba em arco que passa por cima dos obstáculos e cai onde o alvo estava
//    (o lugar fica marcado no chão desde a preparação). Nas evoluções saem 2 ou 3 e deixam poças.
//  - Modo Vulcão: finca no chão (não anda nem esquiva) e o vulcão das costas atira bombas
//    sozinho no inimigo mais perto. Na Colossarapa termina com uma grande erupção.
//  - Poças de lava: queimam quem pisa (um pedaço de dano a cada meio segundo).
// Para ficar leve no celular: formas e materiais são criados uma vez só e reaproveitados;
// cada bomba é 1 peça; no máximo MAX_POCAS_LAVA poças por monstro.
// =============================================================
import * as THREE from 'three';
import { RAIO_ARENA } from '../arena.js';
import { MAX_POCAS_LAVA } from './vulcarapa.js';

// formas (uma vez só)
const GEO_BOMBA = new THREE.DodecahedronGeometry(1, 0);
const GEO_BRASA = new THREE.TetrahedronGeometry(1, 0);
const GEO_FUMACA = new THREE.IcosahedronGeometry(1, 0);
const GEO_DISCO = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.88, 1, 32).rotateX(-Math.PI / 2);
// leque (pedaço de anel) com a abertura de cada golpe, criado uma vez por abertura
const LEQUES = new Map();
function geoLeque(abertura) {
  if (!LEQUES.has(abertura)) LEQUES.set(abertura, new THREE.RingGeometry(0.2, 1, 12, 1, 0, abertura).rotateX(-Math.PI / 2));
  return LEQUES.get(abertura);
}
const GEO_COLUNA = new THREE.CylinderGeometry(0.5, 1, 1, 10, 1, true).translate(0, 0.5, 0);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1, side: THREE.DoubleSide }));
const BOMBA = fixo(new THREE.MeshLambertMaterial({ color: '#5a2a1a', emissive: '#ff4a10', emissiveIntensity: 0.75, flatShading: true }));
const BRASA = basico('#ffb030');
const BRASA_VERMELHA = basico('#ff5a1f');
const FUMACA = basico('#6a5e58', 0.55);
// marcas de onde a bomba cai: vermelha para o inimigo, laranja para você
const MARCA = {
  inimigo: { anel: basico('#ff3d5e', 0.8), disco: basico('#ff3d5e', 0.28) },
  jogador: { anel: basico('#ff9a4a', 0.6), disco: basico('#ff9a4a', 0.18) },
};
const someMat = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });
const COR_FOGO = '#ff7a3d';

export class HabilidadesVulcarapa {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.bombas = [];  // bombas de lava no ar
    this.pocas = [];   // poças de lava no chão
    this.ultimaPos = new Map(); // para saber para onde cada um está andando (Bomba Dupla)
    this.velocidades = new Map();
  }

  // Só a Vulcarapa e as formas dela usam estas habilidades
  dele(c) { return c.esp.linha === 'vulcarapa'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }
  recargaDe(c, gp) { return gp.recarga * (c.lado === 'inimigo' ? (c.furia ? 0.95 : 1.4) : 1); }

  // ---------- brasas e fumaça (partículas) ----------
  brasa(pos, vel, tam, vida, mat = BRASA) {
    const m = new THREE.Mesh(GEO_BRASA, mat);
    m.position.copy(pos);
    m.scale.setScalar(tam);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      vel.y -= 12 * dt;
      e.obj.position.addScaledVector(vel, dt);
      if (e.obj.position.y < 0.05) { e.obj.position.y = 0.05; vel.set(0, 0, 0); }
      e.obj.rotation.x += dt * 8;
      e.obj.scale.setScalar(Math.max(0.01, tam * (1 - k)));
    } });
  }

  estouro(pos, n, forca, y = 0.4) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const v = new THREE.Vector3(Math.sin(a) * 3 * forca, (3 + Math.random() * 3) * forca, Math.cos(a) * 3 * forca);
      this.brasa(new THREE.Vector3(pos.x, y, pos.z), v, 0.08 + Math.random() * 0.06, 0.6, i % 2 ? BRASA : BRASA_VERMELHA);
    }
  }

  fumaca(pos, tam, vida) {
    const m = new THREE.Mesh(GEO_FUMACA, FUMACA);
    m.position.copy(pos);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      e.obj.position.y += dt * 1.2;
      e.obj.scale.setScalar(tam * (0.6 + k));
    } });
  }

  // ---------- Recuo ----------
  iniciarRecuo(c, gp, dir, efeito) {
    const R = gp.recuo;
    if (c.vulcao) this.pararVulcao(c, true); // saída de emergência do Modo Vulcão
    // explosão de lava num leque na frente
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > gp.alcance + c.raio + o.raio * 0.5) continue;
      if (d > 0.3 && (dx * dir.x + dz * dir.z) / d < Math.cos(R.largura / 2 + 0.25)) continue;
      const v = d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : dir.clone();
      if (this.b.aplicarDano(c, o, gp, v, { efeito, empurrao: 5 }) && R.atordoa) this.atordoar(o, R.atordoa);
    }
    this.leque(c, gp, dir);
    if (R.poca) this.criarPoca(c, c.pos.clone(), R.poca, gp, efeito);
    // pulo para trás (olhando para a frente)
    c.dash = { dir: dir.clone().negate(), t: R.distancia / R.vel, vel: R.vel, recuo: true };
    c.angAlvo = c.ang = Math.atan2(dir.x, dir.z);
    this.fumaca(c.pos.clone().setY(0.4), 0.35, 0.5);
  }

  // leque de fogo no chão na frente (visual da explosão)
  leque(c, gp, dir) {
    const R = gp.recuo, mat = someMat('#ff8a3a', 0.85);
    const m = new THREE.Mesh(geoLeque(R.largura), mat);
    m.position.set(c.pos.x, 0.08, c.pos.z);
    // o meio do leque aponta para (cos, 0, -sen) da metade da abertura: gira até ele olhar para "dir"
    const meio = R.largura / 2;
    m.rotation.y = Math.atan2(dir.x, dir.z) - Math.atan2(Math.cos(meio), -Math.sin(meio));
    this.cena.add(m);
    const alc = gp.alcance + c.raio;
    this.b.efeitos.push({ obj: m, vida: 0.35, total: 0.35, mats: [mat], upd: (e, k) => {
      const s = alc * (0.4 + 0.6 * Math.sqrt(k));
      e.obj.scale.set(s, 1, s);
      mat.opacity = 0.85 * (1 - k);
    } });
    for (let i = 0; i < 8; i++) {
      const a = Math.atan2(dir.x, dir.z) + (Math.random() - 0.5) * R.largura;
      const v = new THREE.Vector3(Math.sin(a) * (4 + Math.random() * 3), 2 + Math.random() * 2, Math.cos(a) * (4 + Math.random() * 3));
      this.brasa(c.pos.clone().setY(0.6), v, 0.1, 0.5, i % 2 ? BRASA : BRASA_VERMELHA);
    }
  }

  atordoar(o, t) {
    if (o.morto) return;
    o.stun = Math.max(o.stun, t);
    if (o.prep) this.b.cancelarPreparo(o);
    this.b.jogo.numero('Atordoado!', o.pos.clone().setY(o.altura + 0.6), '#ffc08a', 'pequeno');
  }

  // ---------- Bomba de Lava ----------
  // para onde o lutador está andando (metros por segundo), medido entre os quadros
  velDe(l) { return this.velocidades.get(l) || new THREE.Vector3(); }

  limitar(p) {
    const r = Math.hypot(p.x, p.z), lim = RAIO_ARENA - 1;
    if (r > lim) p.multiplyScalar(lim / r); // não cai fora da arena
    return p;
  }

  // Lugares onde as bombas vão cair (marcados desde a preparação)
  pontosBomba(c, B, alvo) {
    const dir = new THREE.Vector3(alvo.pos.x - c.pos.x, 0, alvo.pos.z - c.pos.z);
    let d = dir.length();
    if (d < 1e-3) { dir.set(Math.sin(c.ang), 0, Math.cos(c.ang)); d = 0; }
    dir.normalize();
    d = Math.min(B.alcance, Math.max(B.minimo, d));
    const base = new THREE.Vector3(c.pos.x, 0, c.pos.z).addScaledVector(dir, d);
    const lado = new THREE.Vector3(dir.z, 0, -dir.x);
    const lista = [this.limitar(base.clone())];
    if (B.quantidade === 2) {
      // a 2ª cai um pouco à frente de para onde o alvo anda (parado: de um lado)
      const v = this.velDe(alvo);
      const p = v.lengthSq() > 0.25 ? base.clone().addScaledVector(v.clone().normalize(), B.espalha) : base.clone().addScaledVector(lado, B.espalha * (Math.random() < 0.5 ? -1 : 1));
      lista.push(this.limitar(p));
    } else if (B.quantidade >= 3) {
      lista.push(this.limitar(base.clone().addScaledVector(lado, B.espalha)), this.limitar(base.clone().addScaledVector(lado, -B.espalha)));
    }
    return lista;
  }

  // Aviso: um círculo em cada lugar onde uma bomba vai cair (fica até ela cair)
  avisoBombas(pontos, area, inimigo) {
    const M = MARCA[inimigo ? 'inimigo' : 'jogador'];
    const g = new THREE.Group();
    g.userData = { ficaNoChao: true, marcas: [], restam: pontos.length };
    for (const q of pontos) {
      const m = new THREE.Group();
      const anel = new THREE.Mesh(GEO_ANEL, M.anel), disco = new THREE.Mesh(GEO_DISCO, M.disco);
      anel.scale.setScalar(area);
      disco.scale.setScalar(0.01);
      m.add(anel, disco);
      m.position.set(q.x, 0.07, q.z);
      m.userData.disco = disco;
      g.add(m);
      g.userData.marcas.push(m);
    }
    this.cena.add(g);
    return g;
  }

  lancarBombas(c, gp, pontos, aviso, efeito) {
    const B = gp.bomba;
    const de = new THREE.Vector3(c.pos.x, c.altura * 0.85, c.pos.z);
    pontos.forEach((q, i) => this.criarBomba(c, gp, B, de, q, aviso, i, efeito, 1, i * 0.12));
    this.fumaca(de.clone(), 0.3, 0.6);
    this.estouro(de, 2, 0.4, de.y);
  }

  // aviso = grupo das marcas; i = qual marca é desta bomba; atraso = segundos até ela sair
  criarBomba(c, gp, B, de, ate, aviso, i, efeito, fator, atraso = 0) {
    const mesh = new THREE.Mesh(GEO_BOMBA, BOMBA);
    mesh.scale.setScalar(B.tamanho);
    mesh.visible = atraso <= 0;
    mesh.position.copy(de);
    this.cena.add(mesh);
    this.bombas.push({ c, gp, B, de: de.clone(), ate: ate.clone(), aviso, i, efeito, fator, atraso, t: 0, mesh, fumacaT: 0 });
  }

  atualizarBomba(bm, dt) {
    if (bm.atraso > 0) {
      bm.atraso -= dt;
      if (bm.atraso > 0) return true;
      bm.mesh.visible = true;
    }
    const B = bm.B, ate = bm.ate;
    bm.t += dt;
    const k = Math.min(1, bm.t / B.voo);
    // anda reto no chão e sobe e desce em parábola (por isso passa por cima dos obstáculos)
    bm.mesh.position.set(bm.de.x + (ate.x - bm.de.x) * k, bm.de.y * (1 - k) + 0.3 * k + B.altura * 4 * k * (1 - k), bm.de.z + (ate.z - bm.de.z) * k);
    bm.mesh.rotation.x += dt * 7;
    bm.mesh.rotation.z += dt * 3;
    const marca = bm.aviso?.userData.marcas[bm.i];
    if (marca) marca.userData.disco.scale.setScalar(Math.max(0.01, B.area * k)); // o círculo enche até a bomba cair
    // rastro de fumaça curto (poucas peças)
    bm.fumacaT -= dt;
    if (bm.fumacaT <= 0) { bm.fumacaT = 0.25; this.fumaca(bm.mesh.position.clone(), B.tamanho * 0.7, 0.3); }
    if (k < 1) return true;
    this.cair(bm);
    if (marca) marca.visible = false;
    if (bm.aviso && --bm.aviso.userData.restam <= 0) this.cena.remove(bm.aviso);
    this.cena.remove(bm.mesh);
    return false;
  }

  // A bomba bate no chão: machuca quem está na área e (nas evoluções) deixa uma poça de lava
  cair(bm) {
    const B = bm.B, q = bm.ate, c = bm.c;
    this.b.efeitoAnel(q, B.area, COR_FOGO);
    this.estouro(q, 4, 0.7, 0.3);
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - q.x, dz = o.pos.z - q.z, d = Math.hypot(dx, dz);
      if (d > B.area + o.raio * 0.5) continue;
      const dir = d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1);
      this.b.aplicarDano(c, o, bm.gp, dir, { fator: bm.fator, efeito: bm.efeito, empurrao: 2, particulas: 3 });
    }
    if (B.poca) this.criarPoca(c, q.clone(), B.poca, bm.gp, bm.efeito);
  }

  // ---------- Poças de lava ----------
  criarPoca(c, pos, P, gp, efeito) {
    const dele = this.pocas.filter((x) => x.dono === c);
    if (dele.length >= MAX_POCAS_LAVA) this.removerPoca(dele[0]); // a mais velha some
    const mat = someMat('#ff5a1f', 0.7);
    const m = new THREE.Mesh(GEO_DISCO, mat);
    m.position.set(pos.x, 0.06 + this.pocas.length * 0.002, pos.z); // um pouquinho acima da outra (não pisca)
    m.scale.setScalar(0.01);
    this.cena.add(m);
    // a chance de queimar a cada pedaço é a metade da do golpe
    const ef = efeito ? { ...efeito, chance: efeito.chance * 0.5 } : null;
    this.pocas.push({ dono: c, pos: pos.setY(0), P, gp, efeito: ef, t: 0, tick: 0.5, mesh: m, mat, brasaT: 0 });
  }

  atualizarPoca(pc, dt) {
    pc.t += dt;
    const P = pc.P, c = pc.dono;
    if (pc.t >= P.duracao || !this.naLuta(c)) { this.removerPoca(pc); return; }
    const k = Math.min(1, pc.t / 0.2) * Math.min(1, (P.duracao - pc.t) / 0.5);
    pc.mesh.scale.setScalar(Math.max(0.01, P.raio * k));
    pc.mat.opacity = 0.7 * k * (0.85 + Math.sin(this.b.t * 8 + pc.pos.x) * 0.15); // borbulha
    pc.brasaT -= dt;
    if (pc.brasaT <= 0) {
      pc.brasaT = 0.7;
      const a = Math.random() * Math.PI * 2, r = P.raio * 0.7 * Math.random();
      this.brasa(new THREE.Vector3(pc.pos.x + Math.cos(a) * r, 0.1, pc.pos.z + Math.sin(a) * r), new THREE.Vector3(0, 2.5, 0), 0.07, 0.4);
    }
    if (pc.t < pc.tick) return;
    pc.tick += 0.5;
    for (const o of this.b.alvosDe(c)) {
      if (Math.hypot(o.pos.x - pc.pos.x, o.pos.z - pc.pos.z) > P.raio + o.raio * 0.3) continue;
      this.b.aplicarDano(c, o, pc.gp, new THREE.Vector3(0, 0, 1), { fator: P.poder / pc.gp.poder, leve: true, empurrao: 0, efeito: pc.efeito, particulas: 1 });
    }
  }

  removerPoca(pc) {
    this.cena.remove(pc.mesh);
    pc.mat.dispose();
    this.pocas.splice(this.pocas.indexOf(pc), 1);
  }

  // ---------- Modo Vulcão ----------
  iniciarVulcao(c, gp, efeito) {
    const V = gp.vulcao;
    this.pararVulcao(c, false);
    // erupção em volta ao fincar
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > gp.raio + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), { efeito });
    }
    this.b.efeitoAnel(c.pos, gp.raio, COR_FOGO);
    this.estouro(c.pos, 10, 0.9, 0.3);
    // anel de lava no chão em volta dela enquanto está fincada
    const mat = someMat('#ff6a1f', 0.55);
    const anel = new THREE.Mesh(GEO_ANEL, mat);
    anel.position.set(c.pos.x, 0.07, c.pos.z);
    anel.scale.setScalar(c.raio * 1.6);
    this.cena.add(anel);
    c.vulcao = { gp, V, efeito, t: 0, prox: 0.45, anel, mat, fumacaT: 0, tranco: 0 };
    c.rec[2] = 1e4; // a recarga só começa quando o Modo Vulcão acabar
    this.b.jogo.numero('Modo Vulcão!', c.pos.clone().setY(c.altura + 0.6), '#ffb030', 'pequeno');
  }

  atualizarVulcao(c, dt) {
    const Q = c.vulcao, V = Q.V;
    if (!this.naLuta(c)) { this.pararVulcao(c, false); return; }
    Q.t += dt;
    Q.tranco = Math.max(0, Q.tranco - dt);
    Q.anel.position.set(c.pos.x, 0.07, c.pos.z);
    Q.mat.opacity = 0.4 + Math.sin(Q.t * 6) * 0.15;
    Q.fumacaT -= dt;
    if (Q.fumacaT <= 0) { Q.fumacaT = 0.5; this.fumaca(new THREE.Vector3(c.pos.x, c.altura * 1.05, c.pos.z), 0.3, 0.7); }
    Q.prox -= dt;
    if (Q.prox <= 0 && Q.t < V.duracao) {
      Q.prox = V.intervalo;
      this.atirarDoVulcao(c, Q);
    }
    if (Q.t >= V.duracao) {
      if (V.final) this.erupcaoFinal(c, Q);
      this.pararVulcao(c, true);
    }
  }

  // o vulcão atira sozinho no(s) inimigo(s) mais perto(s) dentro do alcance
  atirarDoVulcao(c, Q) {
    const V = Q.V, B = V.bomba;
    let alvos = this.b.alvosDe(c)
      .map((o) => ({ o, d: Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) }))
      .filter((x) => x.d <= V.alcance).sort((a, b) => a.d - b.d).slice(0, V.bombas).map((x) => x.o.pos.clone().setY(0));
    // no treino (no mapa, sem inimigos) as bombas caem à frente, em pontos sorteados até 8 m
    if (!alvos.length && this.b.semCura) {
      alvos = [];
      for (let i = 0; i < V.bombas; i++) {
        const a = c.ang + (Math.random() - 0.5) * 1.6, d = 4 + Math.random() * 4;
        alvos.push(new THREE.Vector3(c.pos.x + Math.sin(a) * d, 0, c.pos.z + Math.cos(a) * d));
      }
    }
    if (!alvos.length) return;
    const de = new THREE.Vector3(c.pos.x, c.altura * 1.05, c.pos.z);
    const pontos = alvos.map((p) => this.limitar(p));
    const aviso = this.avisoBombas(pontos, B.area, c.lado === 'inimigo');
    const fator = V.poderTiro / Q.gp.poder;
    pontos.forEach((q, i) => this.criarBomba(c, Q.gp, B, de, q, aviso, i, Q.efeito, fator, i * 0.1));
    Q.tranco = 0.15; // o casco dá um tranco a cada tiro
    this.estouro(de, 2, 0.5, de.y);
  }

  // Colossarapa: no fim do Modo Vulcão, uma grande erupção em volta
  erupcaoFinal(c, Q) {
    const F = Q.V.final;
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > F.raio + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, Q.gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), { fator: F.poder / Q.gp.poder, efeito: Q.efeito, empurrao: 9 });
    }
    this.b.efeitoAnel(c.pos, F.raio, '#ffd06a');
    this.b.efeitoAnel(c.pos, F.raio * 0.7, COR_FOGO);
    this.estouro(c.pos, 14, 1.3, 0.4);
    const mat = someMat('#ff7a2a', 0.6);
    const m = new THREE.Mesh(GEO_COLUNA, mat);
    m.position.set(c.pos.x, 0, c.pos.z);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida: 0.5, total: 0.5, mats: [mat], upd: (e, k) => {
      e.obj.scale.set(F.raio * (0.3 + k * 0.7), 4 * Math.sin(k * Math.PI) + 0.01, F.raio * (0.3 + k * 0.7));
      mat.opacity = 0.6 * (1 - k);
    } });
    this.b.jogo.numero('ERUPÇÃO!', c.pos.clone().setY(c.altura + 0.9), '#ffd06a', 'grande');
  }

  // recarga = começa a recarga do Modo Vulcão (não começa quando ela sai da luta)
  pararVulcao(c, recarga) {
    const Q = c.vulcao;
    if (!Q) return;
    this.cena.remove(Q.anel);
    Q.mat.dispose();
    c.vulcao = null;
    if (recarga) c.rec[2] = this.recargaDe(c, Q.gp);
  }

  // Fincada no chão: o corpo fica um pouco mais baixo e dá um tranco a cada tiro (depois da animação)
  visualModelo(c) {
    if (!c.vulcao) return;
    c.modelo.userData.corpo.position.y += -0.08 - c.vulcao.tranco * 0.6;
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    // para onde cada um está andando (a Bomba Dupla mira um pouco à frente)
    for (const l of [this.b.jog, ...this.b.inimigos]) {
      if (!l) continue;
      const ant = this.ultimaPos.get(l);
      if (ant && dt > 0) {
        const v = this.velocidades.get(l) || new THREE.Vector3();
        v.lerp(new THREE.Vector3((l.pos.x - ant.x) / dt, 0, (l.pos.z - ant.z) / dt), 0.3);
        this.velocidades.set(l, v);
        ant.copy(l.pos);
      } else this.ultimaPos.set(l, l.pos.clone());
      if (l.vulcao) this.atualizarVulcao(l, dt);
    }
    this.bombas = this.bombas.filter((bm) => this.atualizarBomba(bm, dt));
    for (let i = this.pocas.length - 1; i >= 0; i--) this.atualizarPoca(this.pocas[i], dt);
  }

  // Para o que é dela (desmaiou, trocada, fim da luta...). Bombas no ar continuam e caem.
  parar(c) {
    this.pararVulcao(c, false);
    if (c.dash?.recuo) c.dash = null;
    for (const pc of this.pocas.filter((x) => x.dono === c)) this.removerPoca(pc);
    this.ultimaPos.delete(c);
    this.velocidades.delete(c);
  }
}
