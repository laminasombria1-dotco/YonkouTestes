// =============================================================
// LINHA DO BROTOBRASA NA BATALHA (tipo duplo Fogo + Planta, o jardineiro de fogo)
// (os números ficam em brotobrasa.js)
//  - Semente: voa em arco até o ponto e vira uma FLOR DE FOGO no chão (armadilha). Ela explode
//    quando um inimigo chega perto ou quando o tempo dela acaba. Cada monstro tem um limite
//    de flores: plantar mais uma tira a mais velha.
//  - Folhas Ardentes / Galhada: golpe de perto em leque (1 ou 2 golpes). Quem está queimando
//    leva mais. A Galhada planta uma flor no fim.
//  - Anel de Brotos: brotos nascem em volta dele e explodem logo depois.
//  - Florescer Infernal: por um tempo, nascem flores por onde ele anda.
//  - Fogo no chão (Ardentroco em diante): a explosão deixa fogo que queima quem fica em cima.
// Leve para o celular de referência (Helio G95): cada flor tem só 3 peças com materiais fixos
// e o número de flores no campo é limitado.
// =============================================================
import * as THREE from 'three';

// formas (uma vez só)
const GEO_CAULE = new THREE.CylinderGeometry(0.04, 0.06, 0.4, 5).translate(0, 0.2, 0);
const GEO_PETALAS = new THREE.CylinderGeometry(0.42, 0.08, 0.22, 5).translate(0, 0.5, 0); // copo de 5 pétalas
const GEO_MIOLO = new THREE.IcosahedronGeometry(0.14, 0);
const GEO_ANEL = new THREE.RingGeometry(0.9, 1, 28).rotateX(-Math.PI / 2);
const GEO_DISCO = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2);
const GEO_BOLA = new THREE.IcosahedronGeometry(1, 1);
const GEO_FAISCA = new THREE.TetrahedronGeometry(1, 0);
const GEO_FOLHA = new THREE.PlaneGeometry(0.35, 0.16);
const GEO_BROTO = new THREE.ConeGeometry(0.12, 0.45, 5).translate(0, 0.22, 0);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1, extra = {}) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1, ...extra }));
const CAULE = fixo(new THREE.MeshLambertMaterial({ color: '#4fa24a', flatShading: true }));
const PETALAS = basico('#ff6a2a');
const MIOLO = basico('#ffe066');
const SEMENTE = basico('#ffb040');
const ANEL_MEU = basico('#ff9a4a', 0.55, { side: THREE.DoubleSide });
const ANEL_INIMIGO = basico('#ff3d5e', 0.7, { side: THREE.DoubleSide });
const FOGO_CHAO = basico('#ff5a1a', 0.3);
const FAISCAS = [basico('#ffd23f'), basico('#ff9a1a'), basico('#ff5a1a')];
const FOLHAS = [basico('#7fd35a', 1, { side: THREE.DoubleSide }), basico('#ff8a3a', 1, { side: THREE.DoubleSide })];
const COR_FOGO = '#ff7a3d';

export class HabilidadesBrotobrasa {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.flores = [];  // todas as flores de fogo no campo
    this.fogos = [];   // fogo no chão
  }

  // Só a linha do Brotobrasa usa estas habilidades
  dele(c) { return c.esp.linha === 'fogoPlanta'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }

  faisca(pos, vel, tam, vida) {
    const m = new THREE.Mesh(GEO_FAISCA, FAISCAS[Math.floor(Math.random() * 3)]);
    m.position.copy(pos);
    m.scale.setScalar(tam);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      e.obj.position.addScaledVector(vel, dt);
      vel.y -= 6 * dt;
      e.obj.rotation.x += dt * 8;
      e.obj.scale.setScalar(Math.max(0.01, tam * (1 - k)));
    } });
  }

  // explosão de fogo num ponto: acerta todos os adversários de "c" no raio
  explodir(c, gp, pos, raio, fator, efeito, chao) {
    const mat = new THREE.MeshBasicMaterial({ color: '#ffb040', transparent: true, opacity: 0.7, depthWrite: false });
    const bola = new THREE.Mesh(GEO_BOLA, mat);
    bola.position.set(pos.x, 0.5, pos.z);
    this.cena.add(bola);
    this.b.efeitos.push({ obj: bola, vida: 0.35, total: 0.35, mats: [mat], upd: (e, k) => {
      e.obj.scale.setScalar(Math.max(0.01, raio * (0.3 + k * 0.8)));
      mat.opacity = 0.7 * (1 - k);
    } });
    this.b.efeitoAnel(new THREE.Vector3(pos.x, 0, pos.z), raio, COR_FOGO);
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      this.faisca(new THREE.Vector3(pos.x, 0.5, pos.z), new THREE.Vector3(Math.cos(a) * 3, 3 + Math.random() * 2, Math.sin(a) * 3), 0.1, 0.5);
    }
    if (!c.morto) {
      for (const o of this.b.alvosDe(c)) {
        const dx = o.pos.x - pos.x, dz = o.pos.z - pos.z, d = Math.hypot(dx, dz);
        if (d > raio + o.raio * 0.5) continue;
        this.b.aplicarDano(c, o, gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), { fator, efeito, empurrao: 5 });
      }
    }
    if (chao) this.fogoNoChao(c, gp, pos, chao, efeito);
  }

  // ---------- Flores de fogo (armadilhas) ----------
  // tipo = 'semente' ou 'trilha' (cada tipo tem o seu limite)
  plantar(c, gp, pos, cfg, tipo, fator = 1) {
    const minhas = this.flores.filter((f) => f.dono === c && f.tipo === tipo);
    if (minhas.length >= cfg.max) this.tirar(minhas[0], true); // tira a mais velha
    const g = new THREE.Group();
    g.position.set(pos.x, 0, pos.z);
    // a flor é 60% maior que as peças, para aparecer bem no celular (o aviso no chão não muda)
    const flor = new THREE.Group();
    flor.scale.setScalar(1.6);
    flor.add(new THREE.Mesh(GEO_CAULE, CAULE), new THREE.Mesh(GEO_PETALAS, PETALAS));
    const miolo = new THREE.Mesh(GEO_MIOLO, MIOLO);
    miolo.position.y = 0.56;
    flor.add(miolo);
    g.add(flor);
    // aviso no chão: vermelho se a flor é do inimigo (para você desviar)
    const anel = new THREE.Mesh(GEO_ANEL, c.lado === 'inimigo' ? ANEL_INIMIGO : ANEL_MEU);
    anel.scale.setScalar(cfg.gatilho);
    anel.position.y = 0.05;
    g.add(anel);
    g.scale.setScalar(0.01);
    this.cena.add(g);
    this.flores.push({ dono: c, gp, cfg, tipo, fator, pos: new THREE.Vector3(pos.x, 0, pos.z), t: 0, obj: g, miolo, anel, efeito: this.b.efeitoDoGolpe(c, gp) });
  }

  // tira a flor do campo (sumir = só some, sem explodir)
  tirar(f, sumir = false) {
    const i = this.flores.indexOf(f);
    if (i >= 0) this.flores.splice(i, 1);
    this.cena.remove(f.obj);
    if (sumir) for (let k = 0; k < 3; k++) this.faisca(f.pos.clone().setY(0.5), new THREE.Vector3((Math.random() - 0.5) * 2, 1.5, (Math.random() - 0.5) * 2), 0.07, 0.4);
  }

  atualizarFlores(dt) {
    for (let i = this.flores.length - 1; i >= 0; i--) {
      const f = this.flores[i];
      f.t += dt;
      if (!this.naLuta(f.dono)) { this.tirar(f, true); continue; }
      // nasce crescendo, balança e o miolo pisca mais rápido perto do fim
      f.obj.scale.setScalar(Math.min(1, f.t / 0.25) * (1 + Math.sin(this.b.t * 6 + i) * 0.04));
      const pisca = f.t > f.cfg.vida - 1.5 ? 18 : 5;
      f.miolo.scale.setScalar(1 + Math.max(0, Math.sin(this.b.t * pisca)) * 0.4);
      let explode = f.t >= f.cfg.vida;
      // arma depois de 0,3 s e explode quando um inimigo chega perto
      if (!explode && f.t > 0.3) {
        explode = this.b.alvosDe(f.dono).some((o) => Math.hypot(o.pos.x - f.pos.x, o.pos.z - f.pos.z) <= f.cfg.gatilho + o.raio * 0.5);
      }
      if (explode) {
        this.tirar(f);
        this.explodir(f.dono, f.gp, f.pos, f.cfg.raio, f.fator, f.efeito, f.cfg.chao);
      }
    }
  }

  // ---------- Semente de Brasa ----------
  jogarSemente(c, gp, dir, alvo) {
    const S = gp.semente;
    // cai no inimigo mais perto à frente (até o alcance) ou à frente
    if (!alvo) {
      let md = gp.alcance + 3;
      for (const o of this.b.alvosDe(c)) {
        const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
        if (d < md && (dx * dir.x + dz * dir.z) / (d || 1) > 0.5) { md = d; alvo = o; }
      }
    }
    let dist = gp.alcance;
    if (alvo?.pos) dist = Math.min(gp.alcance, Math.hypot(alvo.pos.x - c.pos.x, alvo.pos.z - c.pos.z));
    const de = c.pos.clone().setY(c.altura * 0.6);
    const ate = c.pos.clone().addScaledVector(dir, Math.max(1.5, dist)).setY(0);
    const m = new THREE.Mesh(GEO_MIOLO, SEMENTE);
    m.position.copy(de);
    this.cena.add(m);
    const vida = 0.3 + dist * 0.04;
    let plantou = false;
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k) => {
      e.obj.position.lerpVectors(de, ate, k);
      e.obj.position.y = de.y * (1 - k) + Math.sin(k * Math.PI) * (1 + dist * 0.15);
      e.obj.rotation.x += 0.3;
      if (k >= 1 && !plantou) { plantou = true; this.plantar(c, gp, ate, S, 'semente'); }
    } });
  }

  // ---------- Folhas Ardentes / Galhada ----------
  iniciarLeque(c, gp, dir, efeito) {
    c.leque = { gp, dir: dir.clone(), efeito, feitos: 0, t: 0, alvo: null };
    this.golpeLeque(c);
  }

  golpeLeque(c) {
    const L = c.leque, gp = L.gp, Q = gp.leque;
    L.feitos++;
    const base = Math.atan2(L.dir.x, L.dir.z);
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > gp.alcance + o.raio) continue;
      let diff = Math.abs(Math.atan2(dx, dz) - base) % (Math.PI * 2);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff > Q.abertura + Math.atan2(o.raio, Math.max(d, 0.5))) continue;
      // quem está queimando leva mais
      const fator = o.tem('queimadura') ? 1 + gp.queimando : 1;
      if (this.b.aplicarDano(c, o, gp, L.dir, { fator, efeito: L.efeito, empurrao: 3 })) L.alvo = L.alvo || o;
    }
    // visual: folhas em brasa varrendo o leque
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = base + (i / (n - 1) - 0.5) * Q.abertura * 2 * (L.feitos % 2 ? 1 : -1);
      const m = new THREE.Mesh(GEO_FOLHA, FOLHAS[i % 2]);
      const ini = c.pos.clone().setY(c.altura * 0.5);
      m.position.copy(ini);
      this.cena.add(m);
      const v = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)).multiplyScalar(gp.alcance / 0.25);
      this.b.efeitos.push({ obj: m, vida: 0.25, total: 0.25, upd: (e, k, dt) => {
        e.obj.position.addScaledVector(v, dt);
        e.obj.rotation.set(k * 6, a, k * 4);
        e.obj.scale.setScalar(Math.max(0.01, 1.4 * (1 - k * 0.6)));
      } });
    }
    // o último golpe da Galhada planta uma flor (no alvo ou à frente)
    if (L.feitos >= Q.golpes) {
      if (Q.planta) {
        const sem = this.sementeDe(c);
        if (sem) {
          const p = L.alvo ? L.alvo.pos.clone() : c.pos.clone().addScaledVector(L.dir, gp.alcance * 0.7);
          for (let k = 0; k < 5; k++) this.faisca(c.pos.clone().setY(c.altura * 0.5), new THREE.Vector3(L.dir.x * 5 + (Math.random() - 0.5) * 2, 2, L.dir.z * 5 + (Math.random() - 0.5) * 2), 0.08, 0.4);
          this.plantar(c, sem, p, sem.semente, 'semente');
        }
      }
      c.leque = null;
    }
  }

  // o golpe de disparo (semente) deste monstro, para a Galhada plantar a mesma flor
  sementeDe(c) {
    for (let i = 0; i < 3; i++) { const g = c.golpe(i); if (g.semente) return g; }
    return null;
  }

  atualizarLeque(c, dt) {
    const L = c.leque;
    if (!this.naLuta(c)) { c.leque = null; return; }
    L.t += dt;
    if (L.t >= L.gp.leque.intervalo * L.feitos) this.golpeLeque(c);
  }

  // ---------- Anel de Brotos ----------
  anelDeBrotos(c, gp, efeito) {
    const A = gp.anel, R = gp.raio;
    const centro = c.pos.clone();
    const r = R * 0.65, raioExp = R * 0.45;
    for (let i = 0; i < A.n; i++) {
      const a = (i / A.n) * Math.PI * 2 + Math.random() * 0.3;
      const p = new THREE.Vector3(centro.x + Math.cos(a) * r, 0, centro.z + Math.sin(a) * r);
      const g = new THREE.Group();
      g.position.copy(p);
      const broto = new THREE.Mesh(GEO_BROTO, CAULE);
      const botao = new THREE.Mesh(GEO_MIOLO, PETALAS);
      botao.position.y = 0.45;
      const aviso = new THREE.Mesh(GEO_ANEL, c.lado === 'inimigo' ? ANEL_INIMIGO : ANEL_MEU);
      aviso.scale.setScalar(raioExp);
      aviso.position.y = 0.05;
      g.add(broto, botao, aviso);
      this.cena.add(g);
      let estourou = false;
      this.b.efeitos.push({ obj: g, vida: A.atraso, total: A.atraso, upd: (e, k) => {
        e.obj.scale.setScalar(Math.min(1, k * 3) * (1 + k * 0.5));
        botao.scale.setScalar(1 + k * 1.5);
        if (k >= 1 && !estourou) { estourou = true; this.explodir(c, gp, p, raioExp, A.fator, efeito, null); }
      } });
    }
  }

  // ---------- Florescer Infernal ----------
  iniciarFlorescer(c, gp) {
    c.florescer = { gp, F: gp.florescer, t: 0, ultimo: c.pos.clone() };
    this.plantar(c, gp, c.pos, gp.florescer, 'trilha', gp.florescer.fator);
    this.b.efeitoAnel(c.pos, 2, COR_FOGO);
  }

  atualizarFlorescer(c, dt) {
    const Q = c.florescer;
    Q.t += dt;
    if (Q.t >= Q.F.duracao || !this.naLuta(c)) { c.florescer = null; return; }
    if (Math.hypot(c.pos.x - Q.ultimo.x, c.pos.z - Q.ultimo.z) >= Q.F.passo) {
      Q.ultimo.copy(c.pos);
      this.plantar(c, Q.gp, c.pos, Q.F, 'trilha', Q.F.fator);
    }
    if (Math.random() < dt * 12) this.faisca(c.pos.clone().setY(0.3), new THREE.Vector3((Math.random() - 0.5) * 1.5, 2, (Math.random() - 0.5) * 1.5), 0.07, 0.4);
  }

  // ---------- Fogo no chão ----------
  fogoNoChao(c, gp, pos, C, efeito) {
    const disco = new THREE.Mesh(GEO_DISCO, FOGO_CHAO);
    disco.position.set(pos.x, 0.06, pos.z);
    disco.scale.setScalar(C.raio);
    this.cena.add(disco);
    this.fogos.push({ dono: c, gp, C, pos: new THREE.Vector3(pos.x, 0, pos.z), t: 0, tick: 0.5, obj: disco, efeito });
  }

  atualizarFogos(dt) {
    for (let i = this.fogos.length - 1; i >= 0; i--) {
      const F = this.fogos[i];
      F.t += dt;
      if (F.t >= F.C.duracao || F.dono.morto) { this.cena.remove(F.obj); this.fogos.splice(i, 1); continue; }
      F.obj.scale.setScalar(F.C.raio * (1 + Math.sin(this.b.t * 10 + i) * 0.04));
      if (Math.random() < dt * 8) this.faisca(new THREE.Vector3(F.pos.x + (Math.random() - 0.5) * F.C.raio, 0.1, F.pos.z + (Math.random() - 0.5) * F.C.raio), new THREE.Vector3(0, 2.5, 0), 0.08, 0.4);
      if (F.t >= F.tick) {
        F.tick += 0.5;
        for (const o of this.b.alvosDe(F.dono)) {
          if (Math.hypot(o.pos.x - F.pos.x, o.pos.z - F.pos.z) > F.C.raio + o.raio * 0.3) continue;
          this.b.aplicarDano(F.dono, o, F.gp, new THREE.Vector3(0, 0, 1), { fator: F.C.fator, leve: true, empurrao: 0 });
        }
      }
    }
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (const l of [this.b.jog, ...this.b.inimigos]) if (l?.florescer) this.atualizarFlorescer(l, dt);
    this.atualizarFlores(dt);
    this.atualizarFogos(dt);
  }

  // Para tudo (desmaiou, trocado, fim da luta...): as flores dele somem
  parar(c) {
    c.leque = null;
    c.florescer = null;
    for (const f of this.flores.filter((x) => x.dono === c)) this.tirar(f, true);
    for (let i = this.fogos.length - 1; i >= 0; i--) if (this.fogos[i].dono === c) { this.cena.remove(this.fogos[i].obj); this.fogos.splice(i, 1); }
  }
}
