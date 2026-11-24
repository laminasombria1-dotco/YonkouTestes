// =============================================================
// LINHA DO LUNICO NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em lunico.js)
//  - Combo de dashes (Salto Lunar / Dança Crescente / Caçada da Lua Cheia): dashes seguidos
//    que CRUZAM o alvo. O 1º vai reto; os outros giram em volta dele (2 dashes: vai e volta;
//    3 dashes: um triângulo em volta do alvo, frente > um lado > o outro). Cada dash acerta
//    uma vez e é mais forte que o anterior.
//  - Fases da Lua: o disparo muda a cada uso (Lua Nova > Lua Crescente > Lua Cheia > volta).
//    O botão mostra a próxima fase. A Lua Cheia explode nas evoluções finais.
//  - Luar (Poça de Luar / Luar Crescente / Uivo da Lua Cheia): círculo de luar que fica no chão.
//    Inimigos dentro ficam lentos; ele recupera vida se ficar dentro (no treino, não cura).
//    No Plenilúnio ele uiva, a lua cheia aparece no céu e ele fica mais rápido no luar.
// Para ficar leve no celular: formas e materiais são criados uma vez só e reaproveitados.
// =============================================================
import * as THREE from 'three';

// formas (uma vez só)
const GEO_LUA = new THREE.SphereGeometry(1, 12, 10);
const GEO_CRESC = new THREE.TorusGeometry(0.5, 0.12, 4, 14, Math.PI * 1.25);
const GEO_DISCO = new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.92, 1, 40).rotateX(-Math.PI / 2);
const GEO_BRILHO = new THREE.OctahedronGeometry(1, 0);
const GEO_CORTE_CHAO = new THREE.RingGeometry(0.8, 1, 24, 1, 0, Math.PI * 1.2).rotateX(-Math.PI / 2);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1, extra = {}) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1, ...extra }));
const LUA_BRANCA = basico('#f1eeff');
const CRATERA = basico('#c9c2f0');
const LUA_NOVA = basico('#3b3270');
const BORDA_NOVA = basico('#cfc8ff', 0.85);
const HALO = basico('#dcd6ff', 0.3);
const CRESC = basico('#e8e4ff');
const BRILHO = basico('#eae6ff');
const LILAS = basico('#b9b4ff', 0.7);
const LUAR_CHAO = basico('#cfc8ff', 0.16);
const LUAR_ANEL = basico('#e2ddff', 0.7, { side: THREE.DoubleSide });
const COR_LUA = '#b9b4ff';
// materiais que somem (cada efeito usa uma cópia própria)
const someMat = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });

export class HabilidadesLunico {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
  }

  // Só a linha do Lunico usa estas habilidades
  dele(c) { return c.esp.linha === 'lua'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }

  // brilhinho de luar que sobe e some
  brilho(pos, vel, tam, vida, mat = BRILHO) {
    const m = new THREE.Mesh(GEO_BRILHO, mat);
    m.position.copy(pos);
    m.scale.setScalar(tam);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      e.obj.position.addScaledVector(vel, dt);
      e.obj.rotation.y += dt * 4;
      e.obj.scale.setScalar(Math.max(0.01, tam * (1 - k)));
    } });
  }

  // ---------- Combo de dashes ----------
  iniciarCombo(c, gp, dir, efeito) {
    // o alvo é o adversário mais perto dentro do alcance; sem ninguém, um ponto à frente
    let alvo = null, md = gp.alcance + 2;
    for (const o of this.b.alvosDe(c)) {
      const d = Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z);
      if (d < md) { md = d; alvo = o; }
    }
    const ponto = alvo ? alvo.pos.clone() : c.pos.clone().addScaledVector(dir, Math.min(gp.alcance, 3));
    c.combo = { gp, efeito, alvo, ponto, i: -1, pausa: 0, dash: null, base: null, rastroT: 0 };
    this.proximoDash(c);
  }

  // onde está o alvo agora (se ele andou, os próximos dashes vão atrás)
  centro(C) { return this.naLuta(C.alvo) ? C.alvo.pos : C.ponto; }

  proximoDash(c) {
    const C = c.combo, K = C.gp.combo, n = K.fatores.length;
    C.i++;
    if (C.i >= n) { c.combo = null; return; }
    const P = this.centro(C);
    if (!C.base) { // direção do 1º dash: de onde ele está até o alvo
      C.base = new THREE.Vector3(P.x - c.pos.x, 0, P.z - c.pos.z);
      if (C.base.lengthSq() < 0.01) C.base.set(Math.sin(c.ang), 0, Math.cos(c.ang));
      C.base.normalize();
    }
    // cada dash termina do outro lado do alvo, girando em volta dele
    // (2 dashes: 0° e 180°; 3 dashes: 0°, 120° e 240°)
    const a = (C.i / n) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a);
    const bx = C.base.x * cs + C.base.z * sn, bz = -C.base.x * sn + C.base.z * cs;
    const fim = new THREE.Vector3(P.x + bx * K.passa, 0, P.z + bz * K.passa);
    const d = new THREE.Vector3(fim.x - c.pos.x, 0, fim.z - c.pos.z);
    const len = Math.min(d.length(), C.gp.alcance + K.passa + 1);
    if (len < 0.01) d.set(bx, 0, bz); else d.normalize();
    C.dash = { dir: d, t: len / K.vel, acertou: false };
    c.angAlvo = c.ang = Math.atan2(d.x, d.z);
    this.b.particulas(c.pos, COR_LUA, 4, 0.6);
  }

  atualizarCombo(c, dt) {
    const C = c.combo, K = C.gp.combo, n = K.fatores.length;
    if (!this.naLuta(c) || c.stun > 0.2) { c.combo = null; return; }
    if (C.dash) {
      c.pos.addScaledVector(C.dash.dir, K.vel * dt);
      C.dash.t -= dt;
      // rastro de luar
      C.rastroT -= dt;
      if (C.rastroT <= 0) {
        C.rastroT = 0.03;
        this.brilho(c.pos.clone().setY(0.3 + Math.random() * c.altura * 0.6), new THREE.Vector3(0, 0.6, 0), 0.09, 0.4);
      }
      // cada dash acerta o primeiro adversário que encostar (uma vez)
      if (!C.dash.acertou) {
        const alvo = this.b.alvosDe(c).find((o) => Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) < c.raio + o.raio + 0.6);
        if (alvo) {
          C.dash.acertou = true;
          // empurrão pequeno: o alvo fica no meio para os próximos dashes
          this.b.aplicarDano(c, alvo, C.gp, C.dash.dir, { fator: K.fatores[C.i], efeito: C.efeito, empurrao: 0.6 });
          this.corteNoAr(alvo, C.dash.dir, 0.8 + C.i * 0.35);
        }
      }
      if (C.dash.t <= 0) {
        C.dash = null;
        C.pausa = K.pausa;
        if (C.i === n - 1 && K.corteChao) this.corteChao(this.centro(C), C.gp.alcance * 0.6);
      }
    } else {
      C.pausa -= dt;
      if (C.pausa <= 0) this.proximoDash(c);
    }
  }

  // meia-lua branca rasgando o ar onde o dash acertou (maior a cada dash)
  corteNoAr(alvo, dir, tam) {
    const mat = someMat('#f1eeff', 0.95);
    const m = new THREE.Mesh(GEO_CRESC, mat);
    m.position.copy(alvo.pos).setY(alvo.altura * 0.55);
    m.lookAt(this.b.camera.position);
    m.rotation.z = Math.atan2(dir.x, dir.z) + Math.random();
    const s = (0.9 + alvo.raio * 0.6) * tam;
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida: 0.35, total: 0.35, mats: [mat], upd: (e, k) => {
      e.obj.scale.setScalar(s * (0.6 + k * 0.6));
      mat.opacity = 0.95 * (1 - k);
    } });
  }

  // Plenilúnio: o último dash deixa um corte em meia-lua no chão
  corteChao(P, raio) {
    const mat = someMat('#e2ddff', 0.85);
    const m = new THREE.Mesh(GEO_CORTE_CHAO, mat);
    m.position.set(P.x, 0.07, P.z);
    m.rotation.y = Math.random() * Math.PI * 2;
    m.scale.setScalar(Math.max(1.5, raio));
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida: 1.2, total: 1.2, mats: [mat], upd: (e, k) => { mat.opacity = 0.85 * (1 - k * k); } });
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      this.brilho(new THREE.Vector3(P.x + Math.cos(a) * raio, 0.2, P.z + Math.sin(a) * raio), new THREE.Vector3(0, 1.5, 0), 0.1, 0.7);
    }
  }

  // ---------- Fases da Lua ----------
  // c.faseLua = qual fase sai no próximo uso (0 = Nova, 1 = Crescente, 2 = Cheia)
  faseAtual(c, gp) { return gp.fases[(c.faseLua || 0) % gp.fases.length]; }

  atirarFase(c, gp, dir, efeito) {
    const i = (c.faseLua || 0) % gp.fases.length, F = gp.fases[i];
    c.faseLua = (i + 1) % gp.fases.length;
    const base = Math.atan2(dir.x, dir.z);
    // a Lua Cheia tem mais chance de fazer dormir
    const ef = efeito ? { ...efeito, chance: Math.min(1, efeito.chance * F.sono) } : null;
    for (let k = 0; k < F.tiros; k++) this.criarTiro(c, gp, i, F, base + (k - (F.tiros - 1) / 2) * 0.26, ef);
    if (c === this.b.jog) this.b.hudFases?.(); // o botão mostra a próxima fase
  }

  criarTiro(c, gp, i, F, ang, efeito) {
    const g = new THREE.Group();
    g.rotation.y = ang;
    const info = { i, F, t: 0, brilhoT: 0 };
    if (i === 0) { // Lua Nova: bolinha escura com a borda brilhando
      const lua = new THREE.Mesh(GEO_LUA, LUA_NOVA); lua.scale.setScalar(0.28);
      const borda = new THREE.Mesh(GEO_CRESC, BORDA_NOVA); borda.scale.setScalar(0.62); borda.rotation.y = Math.PI / 2;
      g.add(lua, borda);
    } else if (i === 1) { // Lua Crescente: meia-lua que gira
      const m = new THREE.Mesh(GEO_CRESC, CRESC); m.scale.setScalar(0.75); m.rotation.x = Math.PI / 2;
      g.add(m);
      info.gira = m;
    } else { // Lua Cheia: bola grande com crateras e um halo
      const lua = new THREE.Mesh(GEO_LUA, LUA_BRANCA); lua.scale.setScalar(0.5);
      const halo = new THREE.Mesh(GEO_LUA, HALO); halo.scale.setScalar(0.75);
      g.add(lua, halo);
      for (const [x, y, r] of [[0.18, 0.15, 0.12], [-0.2, -0.08, 0.1], [0.05, -0.28, 0.08]]) {
        const cr = new THREE.Mesh(GEO_LUA, CRATERA); cr.scale.setScalar(r); cr.position.set(x, y, 0.42); g.add(cr);
      }
      info.halo = halo;
    }
    g.scale.multiplyScalar(F.tam);
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const pos = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(0.8 * c.esp.tamanho);
    g.position.copy(pos);
    this.cena.add(g);
    this.b.projeteis.push({ mesh: g, luaFase: info, fixo: true, pos, dir, gp, vel: F.vel, raio: F.raio, dono: c, lado: c.lado,
      vida: gp.alcanceTiro / F.vel, fator: F.fator, efeito });
  }

  // a cada quadro, depois que o tiro andou
  atualizarProjetil(p, dt) {
    const info = p.luaFase;
    info.t += dt;
    if (info.gira) info.gira.rotation.z += dt * 16;
    if (info.halo) info.halo.scale.setScalar(0.75 * (1 + Math.sin(info.t * 18) * 0.06));
    info.brilhoT -= dt;
    if (info.brilhoT <= 0) {
      info.brilhoT = info.i === 2 ? 0.04 : 0.07;
      this.brilho(p.pos.clone(), new THREE.Vector3(0, 0.4, 0), 0.06 * info.F.tam, 0.3, info.i === 0 ? LILAS : BRILHO);
    }
  }

  // quando o tiro acerta alguém, bate num obstáculo ou chega no fim
  impacto(p, alvo) {
    const E = p.luaFase.F.explosao;
    this.b.particulas(p.pos, COR_LUA, E ? 6 : 4, 0.6);
    if (!E) return;
    // a Lua Cheia explode: acerta todos em volta (menos quem já levou o tiro)
    const c = p.dono;
    const mat = someMat('#f1eeff', 0.6);
    const bola = new THREE.Mesh(GEO_LUA, mat);
    bola.position.copy(p.pos);
    this.cena.add(bola);
    this.b.efeitos.push({ obj: bola, vida: 0.45, total: 0.45, mats: [mat], upd: (e, k) => {
      e.obj.scale.setScalar(Math.max(0.01, E.raio * Math.sqrt(k)));
      mat.opacity = 0.6 * (1 - k);
    } });
    const chao = new THREE.Vector3(p.pos.x, 0, p.pos.z);
    this.b.efeitoAnel(chao, E.raio, '#f1eeff');
    this.b.efeitoAnel(chao, E.raio * 0.7, COR_LUA);
    if (c.morto) return;
    for (const o of this.b.alvosDe(c)) {
      if (o === alvo) continue;
      const dx = o.pos.x - p.pos.x, dz = o.pos.z - p.pos.z, d = Math.hypot(dx, dz);
      if (d > E.raio + o.raio * 0.5) continue;
      const dir = d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1);
      this.b.aplicarDano(c, o, p.gp, dir, { fator: E.fator, efeito: p.efeito, empurrao: 4 });
    }
  }

  // ---------- Luar ----------
  iniciarLuar(c, gp, efeito) {
    this.pararLuar(c);
    const L = gp.luar, R = gp.raio;
    // pulso de luar: dano em quem está dentro (com a chance de Sono)
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > R + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), { efeito, empurrao: 2 });
    }
    const g = new THREE.Group();
    g.position.set(c.pos.x, 0.06, c.pos.z);
    const disco = new THREE.Mesh(GEO_DISCO, LUAR_CHAO), anel = new THREE.Mesh(GEO_ANEL, LUAR_ANEL);
    const chao = new THREE.Group();
    chao.add(disco, anel);
    chao.scale.setScalar(0.01);
    g.add(chao);
    // 3 meias-luas flutuando em volta
    const luas = [0, 1, 2].map((k) => {
      const m = new THREE.Mesh(GEO_CRESC, CRESC);
      m.scale.setScalar(0.35);
      m.userData.fase = (k / 3) * Math.PI * 2;
      g.add(m);
      return m;
    });
    this.cena.add(g);
    let lua = null;
    if (L.uivo) { // Plenilúnio: uiva e a lua cheia aparece no céu
      lua = new THREE.Group();
      const corpo = new THREE.Mesh(GEO_LUA, LUA_BRANCA), halo = new THREE.Mesh(GEO_LUA, HALO);
      halo.scale.setScalar(1.5);
      lua.add(corpo, halo);
      for (const [x, y, r] of [[0.35, 0.3, 0.22], [-0.4, -0.15, 0.18], [0.1, -0.5, 0.14]]) {
        const cr = new THREE.Mesh(GEO_LUA, CRATERA); cr.scale.setScalar(r); cr.position.set(x, y, 0.85); lua.add(cr);
      }
      lua.position.set(c.pos.x, 7, c.pos.z);
      lua.scale.setScalar(0.01);
      this.cena.add(lua);
      this.b.jogo.numero('Auuuu!', c.pos.clone().setY(c.altura + 0.6), '#e2ddff', 'grande');
    }
    c.luar = { gp, L, R, t: 0, tick: 0, pos: c.pos.clone(), obj: g, chao, luas, lua, brilhoT: 0 };
    this.b.efeitoAnel(c.pos, R, '#e2ddff');
    this.b.particulas(c.pos, COR_LUA, 14, 1.1);
  }

  dentro(l, Q) { return Math.hypot(l.pos.x - Q.pos.x, l.pos.z - Q.pos.z) <= Q.R + l.raio * 0.3; }

  atualizarLuar(c, dt) {
    const Q = c.luar, L = Q.L;
    Q.t += dt;
    if (Q.t >= L.duracao || !this.naLuta(c)) { this.pararLuar(c); return; }
    // aparece crescendo e some no último meio segundo
    const k = Math.min(1, Q.t / 0.3) * Math.min(1, (L.duracao - Q.t) / 0.5);
    Q.chao.scale.setScalar(Math.max(0.01, Q.R * k));
    for (const m of Q.luas) {
      const a = this.b.t * 0.8 + m.userData.fase;
      m.position.set(Math.cos(a) * Q.R * 0.7, 0.5 + Math.sin(this.b.t * 2 + m.userData.fase) * 0.15, Math.sin(a) * Q.R * 0.7);
      m.rotation.y = -a;
      m.scale.setScalar(0.35 * k + 0.001);
    }
    if (Q.lua) {
      Q.lua.scale.setScalar(Math.max(0.01, 1.3 * k));
      Q.lua.lookAt(this.b.camera.position);
    }
    Q.brilhoT -= dt;
    if (Q.brilhoT <= 0) {
      Q.brilhoT = 0.08;
      const a = Math.random() * Math.PI * 2, r = Q.R * Math.sqrt(Math.random());
      this.brilho(new THREE.Vector3(Q.pos.x + Math.cos(a) * r, 0.1, Q.pos.z + Math.sin(a) * r), new THREE.Vector3(0, 1.2 + Math.random(), 0), 0.07, 0.8);
    }
    // a cada meio segundo: inimigos dentro ficam lentos; ele, dentro, se cura e (Plenilúnio) fica rápido
    if (Q.t >= Q.tick) {
      Q.tick += 0.5;
      for (const o of this.b.alvosDe(c)) if (this.dentro(o, Q)) o.luarLento = { f: L.lento, t: 0.6 };
      if (this.dentro(c, Q)) {
        if (L.velocidade) c.luarVel = { f: L.velocidade, t: 0.6 };
        // no treino (no mapa) não cura: a cura do jogo é só no castelo
        if (!this.b.semCura && !c.tem('combustao') && c.dados.hp < c.stats.hpMax) {
          const q = Math.max(1, Math.round(c.stats.hpMax * L.cura * 0.5));
          c.dados.hp = Math.min(c.stats.hpMax, c.dados.hp + q);
          this.b.jogo.numero('+' + q, c.pos.clone().setY(c.altura), '#5fe08a', 'pequeno');
        }
      }
    }
  }

  pararLuar(c) {
    const Q = c.luar;
    if (!Q) return;
    this.cena.remove(Q.obj);
    if (Q.lua) this.cena.remove(Q.lua);
    c.luar = null;
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (const l of [this.b.jog, ...this.b.inimigos]) {
      if (!l) continue;
      if (l.luar) this.atualizarLuar(l, dt);
      // lentidão e velocidade do luar vão acabando
      if (l.luarLento && (l.luarLento.t -= dt) <= 0) l.luarLento = null;
      if (l.luarVel && (l.luarVel.t -= dt) <= 0) l.luarVel = null;
    }
  }

  // Para tudo (desmaiou, trocado, fim da luta...)
  parar(c) {
    c.combo = null;
    this.pararLuar(c);
    c.luarVel = null;
  }
}
