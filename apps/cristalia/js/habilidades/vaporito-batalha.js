// =============================================================
// LINHA DO VAPORITO NA BATALHA (tipo duplo Água + Fogo, o tanque)
// (os números ficam em vaporito.js)
//  - Arrancada de Vapor: dash pelos jatos das costas; bate no primeiro que encostar e
//    empurra. Depois fica Blindado (+defesa). Gêiserão: termina com uma pancada do casco
//    em volta. Caldeirax: a pancada deixa um gêiser que atordoa.
//  - Bafo de Vapor: cone de vapor saindo da boca (5 pedaços de dano; o efeito é sorteado
//    uma vez por alvo). Caldeirax: também pode queimar.
//  - Casco: ele se esconde no casco. Recebe menos dano, não ataca e anda devagar. Quem bate
//    de perto se queima (Fumarolo em diante). O dano que ele segura vira pressão (Caldeirax).
//    No fim, o casco explode em vapor; no Gêiserão em diante, um gêiser atordoa.
//    A recarga do casco só começa quando ele sai.
// Para ficar leve no celular: formas e materiais são criados uma vez só e reaproveitados.
// =============================================================
import * as THREE from 'three';
import { EFEITOS, chanceDoEfeito, DURACAO_EFEITO_DISPARO } from '../dados.js';

// formas (uma vez só)
const GEO_FUMACA = new THREE.IcosahedronGeometry(1, 0);
const GEO_DOMO = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.9, 1, 36).rotateX(-Math.PI / 2);
const GEO_COLUNA = new THREE.CylinderGeometry(0.6, 1, 1, 9, 1, true).translate(0, 0.5, 0);
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1, extra = {}) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1, ...extra }));
const VAPOR = basico('#f4f8ff', 0.55);
const VAPOR_QUENTE = basico('#ffd9c2', 0.55);
const CASCO = fixo(new THREE.MeshLambertMaterial({ color: '#5c8a78', flatShading: true, transparent: true, opacity: 0.7 }));
const BORDA = basico('#ff9a4a', 0.8, { side: THREE.DoubleSide });
const AGUA = basico('#bfe8ff', 0.65, { side: THREE.DoubleSide });
const COR_VAPOR = '#dfeeff';

export class HabilidadesVaporito {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
  }

  // Só a linha do Vaporito usa estas habilidades
  dele(c) { return c.esp.linha === 'aguaFogo'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }
  recargaDe(c, gp) { return gp.recarga * (c.lado === 'inimigo' ? (c.furia ? 0.95 : 1.4) : 1); }

  // nuvenzinha de vapor que cresce e some
  fumaca(pos, vel, tam, vida, mat = VAPOR) {
    const m = new THREE.Mesh(GEO_FUMACA, mat);
    m.position.copy(pos);
    m.scale.setScalar(tam * 0.4);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      e.obj.position.addScaledVector(vel, dt);
      e.obj.rotation.y += dt * 2;
      e.obj.scale.setScalar(Math.max(0.01, tam * (0.4 + k * 1.2) * (k > 0.7 ? (1 - k) / 0.3 : 1)));
    } });
  }

  // ---------- Arrancada de Vapor ----------
  iniciarArrancada(c, gp, dir, efeito) {
    const A = gp.arrancada;
    c.arrancada = { gp, A, dir: dir.clone(), t: A.distancia / A.vel, acertou: false, efeito, rastroT: 0 };
    c.angAlvo = c.ang = Math.atan2(dir.x, dir.z);
  }

  atualizarArrancada(c, dt) {
    const R = c.arrancada, A = R.A;
    if (!this.naLuta(c)) { c.arrancada = null; return; }
    c.pos.addScaledVector(R.dir, A.vel * dt);
    R.t -= dt;
    // jatos de vapor saindo das costas
    R.rastroT -= dt;
    if (R.rastroT <= 0) {
      R.rastroT = 0.03;
      const tras = c.pos.clone().addScaledVector(R.dir, -c.raio * 0.8).setY(c.altura * 0.45);
      this.fumaca(tras, R.dir.clone().multiplyScalar(-3).setY(0.6), 0.35, 0.45);
    }
    // bate no primeiro adversário que encostar
    if (!R.acertou) {
      const alvo = this.b.alvosDe(c).find((o) => Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) < c.raio + o.raio + 0.4);
      if (alvo) {
        R.acertou = true;
        this.b.aplicarDano(c, alvo, R.gp, R.dir, { efeito: R.efeito, empurrao: A.empurrao });
        R.t = 0;
      }
    }
    if (R.t <= 0) this.fimArrancada(c);
  }

  fimArrancada(c) {
    const R = c.arrancada, A = R.A;
    c.arrancada = null;
    // fica Blindado (+defesa)
    if (A.blindado) c.blindado = { f: A.blindado, t: A.blindadoT };
    if (A.pancada) this.pancada(c, R.gp, A, R.dir);
  }

  // Gêiserão em diante: salta e bate o casco no chão em volta
  pancada(c, gp, A, dir) {
    const P = A.pancada;
    this.b.efeitoAnel(c.pos, P.raio, COR_VAPOR);
    this.b.efeitoAnel(c.pos, P.raio * 0.6, '#ff9a4a');
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      this.fumaca(c.pos.clone().setY(0.3), new THREE.Vector3(Math.cos(a) * 4, 0.6, Math.sin(a) * 4), 0.4, 0.5);
    }
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > P.raio + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : dir.clone(), { fator: P.fator, empurrao: 5 });
    }
    // Caldeirax: um gêiser sobe na frente dele e atordoa
    if (A.geiser) this.geiser(c, c.pos.clone().addScaledVector(dir, c.raio + 0.6), A.geiser.raio, A.geiser.atordoa);
  }

  // gêiser: coluna de água fervendo; quem estiver em cima fica atordoado
  geiser(c, pos, raio, atordoa) {
    const mat = new THREE.MeshBasicMaterial({ color: '#dff4ff', transparent: true, opacity: 0.75, depthWrite: false, side: THREE.DoubleSide });
    const col = new THREE.Mesh(GEO_COLUNA, mat);
    col.position.set(pos.x, 0, pos.z);
    this.cena.add(col);
    this.b.efeitos.push({ obj: col, vida: 0.7, total: 0.7, mats: [mat], upd: (e, k) => {
      const sobe = Math.min(1, k / 0.25);
      e.obj.scale.set(raio * 0.6, Math.max(0.01, 4 * sobe), raio * 0.6);
      mat.opacity = 0.75 * (k > 0.5 ? (1 - k) / 0.5 : 1);
    } });
    for (let i = 0; i < 6; i++) this.fumaca(new THREE.Vector3(pos.x, 3 + Math.random(), pos.z), new THREE.Vector3((Math.random() - 0.5) * 3, 1, (Math.random() - 0.5) * 3), 0.45, 0.7);
    for (const o of this.b.alvosDe(c)) {
      if (Math.hypot(o.pos.x - pos.x, o.pos.z - pos.z) > raio + o.raio * 0.5) continue;
      this.atordoar(o, atordoa);
    }
  }

  atordoar(o, t) {
    if (o.morto) return;
    o.stun = Math.max(o.stun, t);
    if (o.prep) this.b.cancelarPreparo(o);
    this.b.jogo.numero('Atordoado!', o.pos.clone().setY(o.altura + 0.6), '#bfe8ff', 'pequeno');
  }

  // ---------- Bafo de Vapor ----------
  iniciarBafo(c, gp, dir, efeito) {
    const B = gp.bafo;
    // Bafo Fervente: também pode queimar (como um efeito de disparo)
    const queima = B.queima ? { nome: 'queimadura', chance: chanceDoEfeito('queimadura', 'projetil'), dur: EFEITOS.queimadura.duracao * c.melhoria.forcaEfeito * DURACAO_EFEITO_DISPARO } : null;
    c.bafo = { gp, B, dir: dir.clone(), t: 0, prox: 0, ticks: 0, atingidos: new Set(), efeito, queima, emitir: 0 };
  }

  dentroDoBafo(c, alvo, base, gp) {
    const dx = alvo.pos.x - c.pos.x, dz = alvo.pos.z - c.pos.z, d = Math.hypot(dx, dz);
    if (d > gp.alcance + alvo.raio) return false;
    let diff = Math.abs(Math.atan2(dx, dz) - base) % (Math.PI * 2);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;
    return diff <= gp.bafo.abertura + Math.atan2(alvo.raio, Math.max(d, 0.5));
  }

  atualizarBafo(c, dt) {
    const F = c.bafo, B = F.B, gp = F.gp;
    if (!this.naLuta(c)) { c.bafo = null; return; }
    F.t += dt;
    const base = Math.atan2(F.dir.x, F.dir.z);
    c.angAlvo = base;
    // vapor saindo da boca
    F.emitir += dt * 60;
    const boca = c.pos.clone().addScaledVector(F.dir, c.raio * 0.9).setY(c.altura * 0.5);
    const vida = 0.45, vel = gp.alcance / vida;
    while (F.emitir >= 1) {
      F.emitir--;
      const a = base + (Math.random() * 2 - 1) * B.abertura * 0.8;
      const v = new THREE.Vector3(Math.sin(a), 0.15 + Math.random() * 0.2, Math.cos(a)).multiplyScalar(vel * (0.75 + Math.random() * 0.3));
      this.fumaca(boca.clone(), v, 0.5 + gp.alcance * 0.09, vida, B.queima && Math.random() < 0.4 ? VAPOR_QUENTE : VAPOR);
    }
    // 5 pedaços de dano; o efeito é sorteado uma vez por alvo
    const TICKS = 5;
    if (F.t >= F.prox && F.ticks < TICKS) {
      F.ticks++;
      F.prox += B.duracao / TICKS;
      for (const alvo of this.b.alvosDe(c)) {
        if (!this.dentroDoBafo(c, alvo, base, gp)) continue;
        const primeira = !F.atingidos.has(alvo);
        F.atingidos.add(alvo);
        const ok = this.b.aplicarDano(c, alvo, gp, F.dir, { fator: 1 / TICKS, efeito: primeira ? F.efeito : null, leve: true, primeiro: primeira });
        if (ok && primeira && F.queima && Math.random() < F.queima.chance) this.b.aplicarEfeito(alvo, 'queimadura', F.queima.dur, c);
      }
    }
    if (F.t >= B.duracao) c.bafo = null;
  }

  // Aviso do inimigo: faixa larga e curta na frente dele
  avisoBafo(c, gp, dir) {
    const m = new THREE.Mesh(GEO_FAIXA, new THREE.MeshBasicMaterial({ color: '#ff3d5e', transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }));
    m.scale.set(Math.tan(gp.bafo.abertura) * gp.alcance * 2, 1, gp.alcance + c.raio);
    m.position.set(c.pos.x, 0.06, c.pos.z);
    m.rotation.y = Math.atan2(dir.x, dir.z);
    m.userData = { faixa: true };
    this.cena.add(m);
    return m;
  }

  // ---------- Casco ----------
  iniciarCasco(c, gp) {
    this.pararCasco(c, false);
    const g = new THREE.Group();
    const domo = new THREE.Mesh(GEO_DOMO, CASCO);
    const borda = new THREE.Mesh(GEO_ANEL, BORDA);
    borda.position.y = 0.05;
    g.add(domo, borda);
    g.scale.setScalar(0.01);
    this.cena.add(g);
    c.casco = { gp, C: gp.casco, t: 0, pressao: 0, obj: g, domo, fumacaT: 0 };
    c.rec[2] = 1e4; // a recarga só começa quando ele sai do casco
    if (c.prep) this.b.cancelarPreparo(c);
    this.b.efeitoAnel(c.pos, c.raio * 1.6, '#5c8a78');
  }

  atualizarCasco(c, dt) {
    const Q = c.casco;
    if (!this.naLuta(c)) { this.pararCasco(c, false); return; }
    Q.t += dt;
    const k = Math.min(1, Q.t / 0.15);
    const r = c.raio * 1.5, h = c.altura * 0.7;
    Q.obj.position.set(c.pos.x, 0.02, c.pos.z);
    Q.obj.scale.set(r * k, h * k, r * k);
    // fica tremendo antes de explodir; no Caldeirax, treme mais com a pressão
    const fim = Q.C.duracao - Q.t;
    if (fim < 0.6) Q.obj.position.x += (Math.random() - 0.5) * 0.08;
    Q.fumacaT -= dt;
    if (Q.fumacaT <= 0) {
      Q.fumacaT = Q.C.pressao && Q.pressao > 0 ? 0.06 : 0.14;
      const a = Math.random() * Math.PI * 2;
      this.fumaca(new THREE.Vector3(c.pos.x + Math.cos(a) * r * 0.5, h, c.pos.z + Math.sin(a) * r * 0.5), new THREE.Vector3(0, 1.8, 0), 0.3, 0.6, Q.C.queima ? VAPOR_QUENTE : VAPOR);
    }
    if (Q.t >= Q.C.duracao) this.fimCasco(c);
  }

  // Chamado pela batalha quando ele leva um golpe dentro do casco
  aoApanharNoCasco(c, at, gp, absorvido) {
    const Q = c.casco;
    Q.pressao += absorvido;
    // Casco Quente: quem bate de perto se queima
    if (Q.C.queima && gp.tipo === 'corpo' && at && at !== c && !at.morto) {
      this.b.aplicarEfeito(at, 'queimadura', EFEITOS.queimadura.duracao * c.melhoria.forcaEfeito, c);
    }
  }

  // Sai do casco: explosão de vapor (com a pressão guardada) e, no Gêiserão em diante, gêiser
  fimCasco(c) {
    const Q = c.casco, C = Q.C, gp = Q.gp, R = gp.raio;
    this.pararCasco(c, true);
    this.b.efeitoAnel(c.pos, R, COR_VAPOR);
    this.b.efeitoAnel(c.pos, R * 0.7, '#ff9a4a');
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.fumaca(c.pos.clone().setY(0.6), new THREE.Vector3(Math.cos(a) * R * 1.6, 1 + Math.random(), Math.sin(a) * R * 1.6), 0.55, 0.6, i % 2 ? VAPOR_QUENTE : VAPOR);
    }
    // a pressão: +50% do dano segurado (aplicarDano limita ao dobro do golpe)
    const bonus = C.pressao ? Q.pressao * C.pressao : 0;
    if (bonus > 0) this.b.jogo.numero('Pressão!', c.pos.clone().setY(c.altura + 0.6), '#ff9a4a', 'grande');
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > R + o.raio * 0.5) continue;
      const dir = d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1);
      const acertou = this.b.aplicarDano(c, o, gp, dir, { empurrao: C.geiser ? 1 : 7, bonus });
      if (acertou && C.geiser) this.geiser(c, o.pos.clone(), 0.9, C.geiser.atordoa);
    }
  }

  // tira o casco; recarga = true começa a recarga do casco agora
  pararCasco(c, recarga = true) {
    const Q = c.casco;
    if (!Q) return;
    this.cena.remove(Q.obj);
    c.casco = null;
    if (recarga) c.rec[2] = this.recargaDe(c, Q.gp);
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (const l of [this.b.jog, ...this.b.inimigos]) {
      if (!l) continue;
      if (l.casco) this.atualizarCasco(l, dt);
      if (l.blindado && (l.blindado.t -= dt) <= 0) l.blindado = null;
    }
  }

  // Para tudo (desmaiou, trocado, fim da luta...)
  parar(c) {
    c.arrancada = null;
    c.bafo = null;
    c.blindado = null;
    this.pararCasco(c, true);
  }
}
