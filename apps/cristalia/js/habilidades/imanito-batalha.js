// =============================================================
// LINHA DO IMANITO NA BATALHA (tipo duplo Terra + Raio, o mestre do magnetismo)
// (os números ficam em imanito.js)
//  - Pedras Orbitais: pedras giram em volta dele e nascem sozinhas com o tempo. O disparo
//    atira uma pedra (sem pedras, só uma faísca fraca). Cada pedra girando segura 1 tiro
//    inimigo que voa (a folha bumerangue e o raio que marca não). Ferrovolt em diante: a
//    pedra solta um raio em quem estiver perto do alvo.
//  - Ímã: puxa rápido (0,3 s) os inimigos num cone à frente e dá um soco. Titanvolt: se puxar
//    2 ou mais, bate um contra o outro.
//  - Repulsão: empurra todos em volta. Ferrovolt em diante: quem bate numa pedra ou na borda
//    leva dano extra e fica atordoado.
//  - Tempestade Magnética (Titanvolt): puxa todos para o centro enquanto caem raios e no fim
//    explode empurrando.
//  Chefes e o Campeão são puxados e empurrados só pela metade.
// Leve para o celular de referência (Helio G95): no máximo 5 pedras, materiais fixos,
// raios que somem rápido.
// =============================================================
import * as THREE from 'three';

// formas (uma vez só)
const GEO_PEDRA = new THREE.DodecahedronGeometry(1, 0);
const GEO_FAISCA = new THREE.TetrahedronGeometry(1, 0);
const GEO_RAIO = new THREE.CylinderGeometry(1, 1, 1, 4, 1, true).translate(0, 0.5, 0);
const GEO_ANEL = new THREE.RingGeometry(0.85, 1, 32).rotateX(-Math.PI / 2);
const GEO_DISCO = new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1, extra = {}) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1, ...extra }));
const PEDRA = fixo(new THREE.MeshLambertMaterial({ color: '#8a7a64', flatShading: true, emissive: '#3a3010', emissiveIntensity: 0.3 }));
const FAISCA = basico('#f7e43a');
const RAIO = basico('#fff6a0', 0.9);
const AZUL = basico('#7ad8ff', 0.6, { side: THREE.DoubleSide });
const AMARELO = basico('#f7e43a', 0.6, { side: THREE.DoubleSide });
const CHAO = basico('#7ad8ff', 0.15);
const COR = '#f7e43a';

export class HabilidadesImanito {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
  }

  // Só a linha do Imanito usa estas habilidades
  dele(c) { return c.esp.linha === 'terraRaio'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }
  // chefes e o Campeão sentem só a metade do puxão e do empurrão
  resistente(o) { return !!(o.esp.chefe || o.dados.chefe) || (!!this.b.treinador?.campeao && o.lado === 'inimigo'); }

  faisca(pos, vel, tam, vida) {
    const m = new THREE.Mesh(GEO_FAISCA, FAISCA);
    m.position.copy(pos);
    m.scale.setScalar(tam);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      e.obj.position.addScaledVector(vel, dt);
      e.obj.rotation.y += dt * 10;
      e.obj.scale.setScalar(Math.max(0.01, tam * (1 - k)));
    } });
  }

  // raio (visual) de um ponto a outro
  raio(de, ate, grossura = 0.06, vida = 0.15) {
    const m = new THREE.Mesh(GEO_RAIO, RAIO);
    const d = ate.clone().sub(de);
    m.position.copy(de);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    m.scale.set(grossura, d.length(), grossura);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k) => { e.obj.scale.x = e.obj.scale.z = Math.max(0.005, grossura * (1 - k)); } });
  }

  // raio que cai do céu num ponto
  raioDoCeu(pos) {
    this.raio(new THREE.Vector3(pos.x + (Math.random() - 0.5) * 0.6, 8, pos.z + (Math.random() - 0.5) * 0.6), new THREE.Vector3(pos.x, 0, pos.z), 0.1, 0.18);
    this.b.efeitoAnel(new THREE.Vector3(pos.x, 0, pos.z), 0.9, COR);
  }

  // ---------- Pedras Orbitais ----------
  // as pedras deste monstro (cria na primeira vez, já cheias)
  orbita(c) {
    if (c.orbita) return c.orbita;
    let gp = null;
    for (let i = 0; i < 3; i++) if (c.golpe(i).pedras) gp = c.golpe(i);
    if (!gp) return null;
    c.orbita = { gp, P: gp.pedras, pedras: [], t: 0 };
    for (let i = 0; i < gp.pedras.max; i++) this.novaPedra(c);
    return c.orbita;
  }

  novaPedra(c) {
    const O = c.orbita;
    const m = new THREE.Mesh(GEO_PEDRA, PEDRA);
    m.scale.setScalar(O.P.tam);
    m.position.copy(c.pos);
    this.cena.add(m);
    O.pedras.push(m);
  }

  atualizarOrbita(c, dt) {
    const O = this.orbita(c);
    if (!O) return;
    const P = O.P, n = O.pedras.length;
    // nasce uma pedra nova a cada "nasce" segundos
    if (n < P.max) {
      O.t += dt;
      if (O.t >= P.nasce) { O.t = 0; this.novaPedra(c); this.faisca(c.pos.clone().setY(c.altura * 0.6), new THREE.Vector3(0, 2, 0), 0.08, 0.3); }
    } else O.t = 0;
    const r = c.raio + 0.55, y = c.altura * 0.55;
    O.pedras.forEach((m, i) => {
      const a = this.b.t * 2.4 + (i / O.pedras.length) * Math.PI * 2;
      m.position.set(c.pos.x + Math.cos(a) * r, y + Math.sin(this.b.t * 3 + i) * 0.12, c.pos.z + Math.sin(a) * r);
      m.rotation.x += dt * 2; m.rotation.y += dt * 3;
    });
    if (n && Math.random() < dt * 3) { const m = O.pedras[Math.floor(Math.random() * n)]; this.faisca(m.position.clone(), new THREE.Vector3(0, 1, 0), 0.05, 0.25); }
    // cada pedra segura 1 tiro inimigo que voa: quando o tiro entra no círculo das pedras,
    // a pedra mais perto pula na frente dele
    for (const p of this.b.projeteis) {
      if (!O.pedras.length) break;
      if (p.lado === c.lado || p.bumerangue || p.faisca || p.vida <= 0) continue;
      if (Math.hypot(p.pos.x - c.pos.x, p.pos.z - c.pos.z) > r + (p.raio ?? p.gp.raio) + 0.3) continue;
      let k = 0, md = Infinity;
      O.pedras.forEach((m, i) => { const d = Math.hypot(m.position.x - p.pos.x, m.position.z - p.pos.z); if (d < md) { md = d; k = i; } });
      const m = O.pedras.splice(k, 1)[0];
      this.cena.remove(m);
      p.vida = -1; p.bateu = true; // o tiro acaba aqui
      this.raio(m.position.clone(), p.pos.clone(), 0.04, 0.15);
      for (let i = 0; i < 5; i++) this.faisca(p.pos.clone(), new THREE.Vector3((Math.random() - 0.5) * 4, 2, (Math.random() - 0.5) * 4), 0.07, 0.35);
      if (c === this.b.jog || this.b.inimigos.includes(c)) this.b.jogo.numero('Bloqueou!', p.pos.clone().setY(p.pos.y + 0.6), '#d8c8a8', 'pequeno');
    }
  }

  quantas(c) { return c.orbita ? c.orbita.pedras.length : 0; }

  atirarPedra(c, gp, dir, efeito) {
    const O = this.orbita(c), P = gp.pedras;
    let mesh, fator = 1, raio = P.raio, pos;
    if (O && O.pedras.length) {
      mesh = O.pedras.pop(); // a pedra sai da órbita e vira o tiro
      pos = mesh.position.clone();
      mesh.scale.setScalar(P.tam * 1.2);
    } else { // sem pedras: só uma faísca fraca
      mesh = new THREE.Mesh(GEO_FAISCA, FAISCA);
      mesh.scale.setScalar(0.15);
      pos = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(0.8 * c.esp.tamanho);
      this.cena.add(mesh);
      fator = P.fatorSem; raio = 0.3;
    }
    pos.y = Math.max(0.5, pos.y);
    mesh.position.copy(pos);
    // mira no inimigo mais perto à frente (a pedra sai do lado, de onde estava girando)
    let alvo = null, md = P.alcance;
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d < md && (dx * dir.x + dz * dir.z) / (d || 1) > 0.5) { md = d; alvo = o; }
    }
    const mira = alvo ? alvo.pos : c.pos.clone().addScaledVector(dir, P.alcance * 0.7);
    const d2 = new THREE.Vector3(mira.x - pos.x, 0, mira.z - pos.z);
    const ida = d2.lengthSq() > 0.01 ? d2.normalize() : dir.clone();
    this.b.projeteis.push({ mesh, pedraIma: true, fixo: true, pos, dir: ida, gp, vel: P.vel, raio, dono: c, lado: c.lado,
      vida: P.alcance / P.vel, fator, efeito });
  }

  atualizarProjetil(p, dt) {
    p.mesh.rotation.x += dt * 12;
    if (Math.random() < dt * 20) this.faisca(p.pos.clone(), new THREE.Vector3(0, 0.5, 0), 0.05, 0.2);
  }

  // Ferrovolt em diante: a pedra que acerta solta um raio em quem estiver perto do alvo
  aoAcertar(p, alvo) {
    const C = p.gp.pedras.corrente;
    if (!C || !alvo || p.fator < 1) return;
    for (const o of this.b.alvosDe(p.dono)) {
      if (o === alvo || Math.hypot(o.pos.x - alvo.pos.x, o.pos.z - alvo.pos.z) > C.raio + o.raio * 0.5) continue;
      this.raio(alvo.pos.clone().setY(alvo.altura * 0.5), o.pos.clone().setY(o.altura * 0.5), 0.05, 0.2);
      this.b.aplicarDano(p.dono, o, p.gp, p.dir, { fator: C.fator, efeito: p.efeito, empurrao: 1 });
    }
  }

  // ---------- Ímã ----------
  iniciarIma(c, gp, dir, efeito) {
    const I = gp.ima, base = Math.atan2(dir.x, dir.z);
    const alvos = [];
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > gp.alcance + o.raio) continue;
      let diff = Math.abs(Math.atan2(dx, dz) - base) % (Math.PI * 2);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff > I.abertura + Math.atan2(o.raio, Math.max(d, 0.5))) continue;
      alvos.push(o);
    }
    // cada um para na frente dele (lado a lado se forem vários); chefes vêm só a metade
    const lado = new THREE.Vector3(dir.z, 0, -dir.x);
    const lista = alvos.map((o, k) => {
      const frente = c.pos.clone().addScaledVector(dir, c.raio + o.raio + 0.3).addScaledVector(lado, (k - (alvos.length - 1) / 2) * (o.raio * 2 + 0.2));
      const ate = this.resistente(o) ? o.pos.clone().lerp(frente, 0.5) : frente;
      return { o, de: o.pos.clone(), ate };
    });
    c.ima = { gp, I, efeito, dir: dir.clone(), alvos: lista, t: 0 };
    // ondas magnéticas indo do fim do cone até ele
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(GEO_ANEL, k % 2 ? AZUL : AMARELO);
      m.rotation.x = Math.PI / 2; // de pé, virado para ele
      const g = new THREE.Group();
      g.add(m);
      g.rotation.y = base;
      this.cena.add(g);
      const ini = c.pos.clone().addScaledVector(dir, gp.alcance).setY(1), fim = c.pos.clone().addScaledVector(dir, c.raio).setY(1);
      const vida = 0.3 + k * 0.06;
      this.b.efeitos.push({ obj: g, vida, total: vida, upd: (e, kk) => {
        e.obj.position.lerpVectors(ini, fim, kk);
        e.obj.scale.setScalar(Math.max(0.05, 1.4 * (1 - kk * 0.7)));
      } });
    }
  }

  atualizarIma(c, dt) {
    const M = c.ima;
    if (!this.naLuta(c)) { c.ima = null; return; }
    M.t += dt;
    const k = Math.min(1, M.t / M.I.duracao), s = k * k * (3 - 2 * k);
    for (const a of M.alvos) {
      if (a.o.morto) continue;
      a.o.pos.lerpVectors(a.de, a.ate, s);
      a.o.emp.set(0, 0, 0);
      a.o.stun = Math.max(a.o.stun, 0.1);
      if (Math.random() < dt * 25) this.faisca(a.o.pos.clone().setY(a.o.altura * 0.5), new THREE.Vector3(0, 1.5, 0), 0.06, 0.25);
    }
    if (k < 1) return;
    // o soco no fim
    const vivos = M.alvos.filter((a) => !a.o.morto).map((a) => a.o);
    for (const o of vivos) this.b.aplicarDano(c, o, M.gp, M.dir, { efeito: M.efeito, empurrao: 3 });
    // Titanvolt: bate um contra o outro
    if (M.I.esmaga && vivos.length >= 2) {
      for (const o of vivos) this.b.aplicarDano(c, o, M.gp, M.dir, { fator: M.I.esmaga.fator, empurrao: 2 });
      this.b.jogo.numero('Esmagou!', vivos[0].pos.clone().setY(vivos[0].altura + 0.8), COR, 'grande');
    }
    this.b.particulas(c.pos.clone().addScaledVector(M.dir, c.raio + 0.6), COR, 8, 0.8);
    c.ima = null;
  }

  // ---------- Repulsão ----------
  repulsar(c, gp, centro, R, efeito, fator = 1) {
    const Rp = gp.repulsao;
    this.b.efeitoAnel(centro, R, '#7ad8ff');
    this.b.efeitoAnel(centro, R * 0.6, COR);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      this.faisca(centro.clone().setY(0.6), new THREE.Vector3(Math.cos(a) * 7, 1, Math.sin(a) * 7), 0.08, 0.35);
    }
    if (c.morto) return;
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - centro.x, dz = o.pos.z - centro.z, d = Math.hypot(dx, dz);
      if (d > R + o.raio * 0.5) continue;
      const dir = d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(Math.sin(c.ang), 0, Math.cos(c.ang));
      const forca = Rp.forca * (this.resistente(o) ? 0.5 : 1);
      if (!this.b.aplicarDano(c, o, gp, dir, { fator, efeito, empurrao: forca })) continue;
      // Ferrovolt em diante: vai bater numa pedra ou na borda?
      if (Rp.parede && this.vaiBater(o, dir, forca / 8)) {
        this.b.aplicarDano(c, o, gp, dir, { fator: Rp.parede.fator, empurrao: 0 });
        o.stun = Math.max(o.stun, Rp.parede.atordoa);
        if (o.prep) this.b.cancelarPreparo(o);
        this.b.jogo.numero('Bateu!', o.pos.clone().setY(o.altura + 0.7), '#d8c8a8', 'pequeno');
      }
    }
  }

  // o empurrão leva até "dist" metros: tem obstáculo ou a borda no caminho?
  vaiBater(o, dir, dist) {
    for (let s = 0.5; s <= dist; s += 0.5) {
      const p = { x: o.pos.x + dir.x * s, z: o.pos.z + dir.z * s };
      if (this.b.arena.bloqueia(p, o.raio * 0.8)) return true;
      const q = new THREE.Vector3(p.x, 0, p.z);
      this.b.arena.colidir(q, o.raio);
      if (Math.hypot(q.x - p.x, q.z - p.z) > 0.2) return true; // a borda segurou
    }
    return false;
  }

  // ---------- Tempestade Magnética ----------
  iniciarTempestade(c, gp, efeito) {
    const disco = new THREE.Mesh(GEO_DISCO, CHAO);
    const anel = new THREE.Mesh(GEO_ANEL, AZUL);
    const g = new THREE.Group();
    g.add(disco, anel);
    g.position.set(c.pos.x, 0.06, c.pos.z);
    g.scale.setScalar(gp.raio);
    this.cena.add(g);
    c.tempestade = { gp, T: gp.tempestade, efeito, centro: c.pos.clone(), t: 0, prox: 0.2, obj: g };
  }

  atualizarTempestade(c, dt) {
    const Q = c.tempestade, T = Q.T, R = Q.gp.raio;
    if (!this.naLuta(c)) { this.tirarTempestade(c); return; }
    Q.t += dt;
    Q.obj.rotation.y += dt * 3;
    // puxa todos para o centro
    const perto = [];
    for (const o of this.b.alvosDe(c)) {
      const dx = Q.centro.x - o.pos.x, dz = Q.centro.z - o.pos.z, d = Math.hypot(dx, dz);
      if (d > R * 1.3) continue;
      if (d <= R + o.raio * 0.5) perto.push(o);
      if (d < 1) continue;
      const v = T.puxa * (this.resistente(o) ? 0.5 : 1) * dt;
      o.pos.x += (dx / d) * v; o.pos.z += (dz / d) * v;
    }
    // raios caindo em quem está dentro
    if (Q.t >= Q.prox) {
      Q.prox += T.raioCada;
      const o = perto[Math.floor(Math.random() * perto.length)];
      const a = Math.random() * Math.PI * 2, r = Math.random() * R;
      const pos = o ? o.pos.clone() : new THREE.Vector3(Q.centro.x + Math.cos(a) * r, 0, Q.centro.z + Math.sin(a) * r);
      this.raioDoCeu(pos);
      if (o) this.b.aplicarDano(c, o, Q.gp, new THREE.Vector3(0, 0, 1), { fator: T.fatorRaio, efeito: Q.efeito, empurrao: 0, leve: true });
    }
    if (Q.t >= T.duracao) {
      this.tirarTempestade(c);
      this.repulsar(c, Q.gp, Q.centro, R, Q.efeito, 1); // no fim explode empurrando
    }
  }

  tirarTempestade(c) {
    if (!c.tempestade) return;
    this.cena.remove(c.tempestade.obj);
    c.tempestade = null;
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (const l of [this.b.jog, ...this.b.inimigos]) {
      if (!l || !this.dele(l) || l.morto || !l.modelo.visible) continue;
      this.atualizarOrbita(l, dt);
      if (l.ima) this.atualizarIma(l, dt);
      if (l.tempestade) this.atualizarTempestade(l, dt);
    }
  }

  // Para tudo (desmaiou, trocado, fim da luta...): as pedras somem
  parar(c) {
    c.ima = null;
    this.tirarTempestade(c);
    if (c.orbita) { for (const m of c.orbita.pedras) this.cena.remove(m); c.orbita = null; }
  }
}
