// =============================================================
// SILVÁRION NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em silvarion.js)
//  - Seiva Vital (c.seiva, de 0 a 1): enche quando a Parasita ou o Elo Vital suga vida.
//    O golpe de área gasta toda a Seiva: cura e solta mais cervos-espírito.
//  - Investida da Galhada: corre (usa o "dash" da batalha) levando o 1º inimigo enganchado
//    na galhada; onde para, brota uma árvore embaixo dele, que enraíza. Se o inimigo bater numa
//    pedra ou na borda, leva mais dano. No Ancestrárion a árvore explode em flores.
//  - Semente + Elo Vital: a semente (o tiro de sempre) que acerta prende um cipó brilhante
//    entre os dois, que suga vida por alguns segundos (arrebenta se ficarem longe).
//  - Selva Viva / Manada Espiritual: área em volta e/ou cervos-espírito que correm para fora
//    em leque, atravessando os inimigos.
// Para ficar leve no celular: cada cervo-espírito é 1 peça (uma forma só, criada uma vez);
// no máximo 2 cipós e 1 árvore por monstro.
// =============================================================
import * as THREE from 'three';
import { RAIO_ARENA } from '../arena.js';
import { SEIVA, BATIDA_GALHADA } from './silvarion.js';

// junta várias formas simples numa só (para o cervo-espírito ser 1 peça)
function juntarFormas(lista) {
  const pos = [], nor = [];
  for (const [g0, m] of lista) {
    const g = g0.index ? g0.toNonIndexed() : g0.clone();
    g.applyMatrix4(m);
    pos.push(...g.attributes.position.array);
    nor.push(...g.attributes.normal.array);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}
const M = (x, y, z, rx = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, 0)), new THREE.Vector3(sx, sy, sz));
// cervo-espírito: corpo, pescoço, cabeça, 4 patas e a galhada (frente em +z)
const GEO_CERVO = juntarFormas([
  [new THREE.BoxGeometry(0.5, 0.45, 1.1), M(0, 1.0, 0)],
  [new THREE.BoxGeometry(0.22, 0.6, 0.25), M(0, 1.35, 0.5, -0.5)],
  [new THREE.BoxGeometry(0.28, 0.28, 0.45), M(0, 1.65, 0.68)],
  ...[[-0.18, 0.38], [0.18, 0.38], [-0.18, -0.4], [0.18, -0.4]].map(([x, z]) => [new THREE.BoxGeometry(0.1, 0.8, 0.1), M(x, 0.4, z)]),
  [new THREE.ConeGeometry(0.05, 0.55, 4), M(-0.15, 2.0, 0.6, -0.3)],
  [new THREE.ConeGeometry(0.05, 0.55, 4), M(0.15, 2.0, 0.6, -0.3)],
  [new THREE.ConeGeometry(0.04, 0.35, 4), M(-0.28, 1.95, 0.55, 0.4, 1, 1, 1)],
  [new THREE.ConeGeometry(0.04, 0.35, 4), M(0.28, 1.95, 0.55, 0.4, 1, 1, 1)],
]);
const GEO_FOLHA = new THREE.OctahedronGeometry(1, 0);
const GEO_CIPO = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5); // comprimento em z
const GEO_TRONCO = new THREE.CylinderGeometry(0.18, 0.3, 1.6, 6).translate(0, 0.8, 0);
const GEO_COPA = new THREE.IcosahedronGeometry(0.85, 0).translate(0, 1.9, 0);
const GEO_ANEL = new THREE.RingGeometry(0.9, 1, 32).rotateX(-Math.PI / 2);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1 }));
const FOLHA = fixo(new THREE.MeshLambertMaterial({ color: '#4ea64a', flatShading: true }));
const FOLHA_JADE = basico('#1fe0a0');
const FLOR = basico('#ff7eb6');
const TRONCO = fixo(new THREE.MeshLambertMaterial({ color: '#4a3020', flatShading: true }));
const COPA = fixo(new THREE.MeshLambertMaterial({ color: '#3f9a46', flatShading: true }));
const someMat = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });
const COR_SILVESTRE = '#1fe0a0';

export class HabilidadesSilvarion {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.elos = [];
    this.cervos = [];
    this.arvores = [];
  }

  // Só o Silvárion e as formas dele usam estas habilidades
  dele(c) { return c?.esp.linha === 'silvarion'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }
  resistente(o) { return !!o.esp.chefe || (!!this.b.treinador?.campeao && o.lado === 'inimigo'); }

  // ---------- folhinhas (partículas) ----------
  folha(pos, vel, tam, vida, mat = FOLHA) {
    const m = new THREE.Mesh(GEO_FOLHA, mat);
    m.position.copy(pos);
    m.scale.set(tam, tam * 0.35, tam * 1.6);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      vel.y -= 4 * dt;
      e.obj.position.addScaledVector(vel, dt);
      e.obj.rotation.y += dt * 6; e.obj.rotation.x += dt * 3;
      e.obj.scale.setScalar(Math.max(0.01, tam * (1 - k)));
    } });
  }
  revoada(pos, n, forca, y = 0.6) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      this.folha(new THREE.Vector3(pos.x, y, pos.z), new THREE.Vector3(Math.sin(a) * 3 * forca, (1.5 + Math.random() * 2) * forca, Math.cos(a) * 3 * forca), 0.12, 0.7, i % 3 === 0 ? FLOR : i % 3 === 1 ? FOLHA_JADE : FOLHA);
    }
  }
  curar(c, frac) {
    if (this.b.semCura || c.morto || c.tem('combustao') || frac <= 0) return; // no treino não cura
    const q = Math.max(1, Math.round(c.stats.hpMax * frac));
    if (c.dados.hp >= c.stats.hpMax) return;
    c.dados.hp = Math.min(c.stats.hpMax, c.dados.hp + q);
    this.b.jogo.numero('+' + q, c.pos.clone().setY(c.altura), '#5fe08a', 'pequeno');
  }
  area(c, gp, pos, raio, opcoes) {
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - pos.x, dz = o.pos.z - pos.z, d = Math.hypot(dx, dz);
      if (d > raio + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), opcoes);
    }
  }

  // ---------- Seiva Vital ----------
  // a Parasita de "quem" sugou vida (chamado pela batalha a cada pedaço)
  aoSugar(quem) { if (this.dele(quem)) this.encher(quem, SEIVA.porSugada); }
  encher(c, q) { if (!c.morto) c.seiva = Math.min(1, (c.seiva || 0) + q); }
  // gasta toda a Seiva: devolve quantos "quartos" (25%) foram gastos e cura
  gastarSeiva(c) {
    const quartos = Math.floor((c.seiva || 0) / 0.25 + 1e-6);
    c.seiva = 0;
    if (quartos > 0) {
      this.curar(c, quartos * SEIVA.curaPor25);
      this.b.jogo.numero(`Seiva ×${quartos}`, c.pos.clone().setY(c.altura + 0.8), COR_SILVESTRE, 'pequeno');
    }
    return quartos;
  }

  // ---------- Investida da Galhada ----------
  iniciarInvestida(c, gp, dir, efeito) {
    const I = gp.investida;
    c.dash = { dir: dir.clone(), t: I.distancia / I.vel, vel: I.vel, investida: { gp, I, efeito, levando: null } };
    c.angAlvo = c.ang = Math.atan2(dir.x, dir.z);
    this.revoada(c.pos, 5, 0.5, 0.3);
  }

  // a cada quadro da investida (o movimento é o do dash da batalha)
  atualizarInvestida(c, ds, dt) {
    const S = ds.investida;
    if (!S.levando) {
      for (const o of this.b.alvosDe(c)) {
        const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
        if (d > c.raio + o.raio + 0.3 || (d > 0.2 && (dx * ds.dir.x + dz * ds.dir.z) / d < 0.2)) continue;
        if (!this.b.aplicarDano(c, o, S.gp, ds.dir, { efeito: S.efeito, empurrao: 0 }) || o.morto) break;
        S.levando = o;
        if (o.prep) this.b.cancelarPreparo(o);
        o.dash = null;
        if (this.resistente(o)) ds.t *= 0.5; // chefes: só metade do caminho
        break;
      }
    }
    const o = S.levando;
    if (o && !o.morto) {
      // leva o inimigo enganchado na frente da galhada
      const P = c.pos.clone().addScaledVector(ds.dir, c.raio + o.raio * 0.8).setY(0);
      o.stun = Math.max(o.stun, 0.2);
      o.emp.set(0, 0, 0);
      if (this.b.arena.bloqueia(P, o.raio * 0.7) || Math.hypot(P.x, P.z) > RAIO_ARENA - o.raio * 0.5) {
        this.b.aplicarDano(c, o, S.gp, ds.dir, { fator: BATIDA_GALHADA.fator, empurrao: 0 }); // bateu numa pedra
        ds.t = 0;
      } else o.pos.copy(P);
    }
    if (ds.t > 0) return;
    if (o && !o.morto) this.brotar(c, o, S);
  }

  // brota uma árvore embaixo do inimigo: Enraizado (e, no Ancestrárion, explode em flores)
  brotar(c, o, S) {
    const I = S.I;
    for (const a of this.arvores.filter((x) => x.dono === c)) this.tirarArvore(a); // uma por vez
    const g = new THREE.Group();
    g.add(new THREE.Mesh(GEO_TRONCO, TRONCO), new THREE.Mesh(GEO_COPA, COPA));
    g.position.set(o.pos.x, -2.4, o.pos.z);
    g.scale.setScalar(0.8 + o.raio * 0.4);
    this.cena.add(g);
    this.arvores.push({ dono: c, obj: g, t: 0, pos: o.pos.clone() });
    this.b.aplicarEfeito(o, 'enraizado', I.enraiza, c);
    this.revoada(o.pos, 8, 0.8, 0.4);
    if (I.explosao) {
      this.area(c, S.gp, o.pos, I.explosao.raio, { fator: I.explosao.fator, efeito: S.efeito, empurrao: 2, particulas: 2 });
      this.b.efeitoAnel(o.pos, I.explosao.raio, '#ff7eb6');
      this.revoada(o.pos, 10, 1.2, 1.5);
    }
  }

  atualizarArvore(a, dt) {
    a.t += dt;
    // sobe do chão em 0,25 s, fica e afunda no fim (2 s ao todo)
    const y = a.t < 0.25 ? -2.4 * (1 - a.t / 0.25) : a.t > 1.7 ? -2.4 * Math.min(1, (a.t - 1.7) / 0.3) : 0;
    a.obj.position.y = y;
    if (a.t >= 2) this.tirarArvore(a);
  }
  tirarArvore(a) { this.cena.remove(a.obj); this.arvores.splice(this.arvores.indexOf(a), 1); }

  // ---------- Elo Vital ----------
  // a semente acertou: prende um cipó entre o Silvárion e o alvo
  aoAcertarSemente(p, alvo) {
    const c = p.dono, E = p.gp.elo;
    if (!E || !this.naLuta(c) || alvo.morto) return;
    const dele = this.elos.filter((x) => x.dono === c);
    if (dele.some((x) => x.alvo === alvo)) { dele.find((x) => x.alvo === alvo).t = E.duracao; return; } // renova
    if (dele.length >= E.max) this.tirarElo(dele[0]);
    const mat = someMat('#7dffcf', 0.75);
    const mesh = new THREE.Mesh(GEO_CIPO, mat);
    this.cena.add(mesh);
    this.elos.push({ dono: c, alvo, gp: p.gp, E, t: E.duracao, tick: 0.5, mesh, mat, folhaT: 0 });
  }

  atualizarElo(l, dt) {
    const c = l.dono, o = l.alvo;
    l.t -= dt;
    const d = Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z);
    if (l.t <= 0 || !this.naLuta(c) || !this.naLuta(o) || d > l.E.alcance) { this.tirarElo(l); return; }
    // o cipó vai do peito dele até o alvo
    const de = c.pos.clone().setY(c.altura * 0.45), ate = o.pos.clone().setY(o.altura * 0.5);
    l.mesh.position.copy(de);
    l.mesh.lookAt(ate);
    l.mesh.scale.set(0.1 + Math.sin(this.b.t * 10) * 0.02, 0.1, de.distanceTo(ate));
    l.mat.opacity = 0.55 + Math.sin(this.b.t * 8) * 0.2;
    // folhinhas indo do alvo para ele (a vida passando)
    l.folhaT -= dt;
    if (l.folhaT <= 0) {
      l.folhaT = 0.2;
      const v = de.clone().sub(ate).multiplyScalar(2.2);
      this.folha(ate.clone(), v, 0.08, 0.45, FOLHA_JADE);
    }
    if ((l.tick -= dt) > 0) return;
    l.tick = 0.5;
    if (this.b.aplicarDano(c, o, l.gp, new THREE.Vector3(c.pos.x - o.pos.x, 0, c.pos.z - o.pos.z).normalize(), { fator: l.E.fator, leve: true, empurrao: 0, particulas: 1 })) {
      this.curar(c, l.E.cura);
      this.encher(c, SEIVA.porElo);
    }
  }
  tirarElo(l) {
    this.cena.remove(l.mesh);
    l.mat.dispose();
    const i = this.elos.indexOf(l);
    if (i >= 0) this.elos.splice(i, 1);
  }

  // ---------- Selva Viva / Manada Espiritual ----------
  usarArea(c, gp, dir, efeito) {
    const quartos = this.gastarSeiva(c);
    if (gp.selva) {
      this.area(c, gp, c.pos, gp.raio, { efeito });
      this.b.efeitoAnel(c.pos, gp.raio, COR_SILVESTRE);
      this.b.efeitoAnel(c.pos, gp.raio * 0.7, '#4ea64a');
      this.revoada(c.pos, 12, 1.2);
    }
    const Mn = gp.manada;
    if (!Mn) return;
    const n = Mn.n + quartos * SEIVA.cervoPor25, base = Math.atan2(dir.x, dir.z);
    for (let i = 0; i < n; i++) {
      const ang = base + (n > 1 ? (i / (n - 1) - 0.5) * (Mn.abertura + quartos * 0.15) : 0);
      this.criarCervo(c, gp, ang, Mn, efeito);
    }
    this.b.jogo.numero('Manada!', c.pos.clone().setY(c.altura + 0.5), COR_SILVESTRE, 'pequeno');
  }

  criarCervo(c, gp, ang, Mn, efeito) {
    const mat = someMat('#9fffd8', 0.7);
    const mesh = new THREE.Mesh(GEO_CERVO, mat);
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const pos = c.pos.clone().setY(0).addScaledVector(dir, c.raio * 0.6);
    mesh.position.copy(pos);
    mesh.rotation.y = ang;
    mesh.scale.setScalar(0.9);
    this.cena.add(mesh);
    this.cervos.push({ dono: c, gp, Mn, efeito, pos, dir, resta: Mn.alcance, t: 0, atingidos: new Set(), mesh, mat });
  }

  atualizarCervo(k, dt) {
    k.t += dt;
    const passo = k.Mn.vel * dt;
    k.pos.addScaledVector(k.dir, passo);
    k.resta -= passo;
    k.mesh.position.set(k.pos.x, Math.abs(Math.sin(k.t * 12)) * 0.35, k.pos.z); // galopando
    k.mat.opacity = 0.7 * Math.min(1, k.t / 0.15) * Math.min(1, k.resta / 1.5 + 0.1);
    for (const o of this.b.alvosDe(k.dono)) {
      if (k.atingidos.has(o) || Math.hypot(o.pos.x - k.pos.x, o.pos.z - k.pos.z) > o.raio + 0.5) continue;
      k.atingidos.add(o);
      this.b.aplicarDano(k.dono, o, k.gp, k.dir, { fator: k.Mn.fator, efeito: k.efeito, empurrao: 3, particulas: 2 });
    }
    if (k.resta > 0 && Math.hypot(k.pos.x, k.pos.z) < RAIO_ARENA) return true;
    this.cena.remove(k.mesh);
    k.mat.dispose();
    return false;
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (let i = this.elos.length - 1; i >= 0; i--) if (this.elos[i]) this.atualizarElo(this.elos[i], dt);
    this.cervos = this.cervos.filter((k) => this.atualizarCervo(k, dt));
    for (let i = this.arvores.length - 1; i >= 0; i--) if (this.arvores[i]) this.atualizarArvore(this.arvores[i], dt);
  }

  // Para o que é dele (desmaiou, trocado, fim da luta...). Os cervos que já saíram continuam.
  parar(c) {
    if (c.dash?.investida) c.dash = null;
    c.seiva = 0;
    for (const l of this.elos.filter((x) => x.dono === c || x.alvo === c)) this.tirarElo(l);
  }
}
