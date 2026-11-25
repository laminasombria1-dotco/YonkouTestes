// =============================================================
// AQUARAIA NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em aquaraia.js)
//  - Rasante: voo baixo e reto que ATRAVESSA os inimigos (acerta cada um uma vez).
//    Nas evoluções deixa um Rastro d'Água no chão (encharca quem pisa) e, no fim,
//    o ferrão do rabo bate para trás.
//  - Bolhas: leque de bolhas; nas evoluções finais elas fazem curva até o inimigo.
//  - Mergulho: sobe (sem levar dano), cai onde o alvo estava e espirra água em volta.
//    Bate mais forte em quem está Encharcado e, nas evoluções finais, deixa um
//    Redemoinho que puxa para o centro.
// O rasante e o mergulho usam o "dash" da batalha (c.dash com rasante/mergulho):
// assim, enquanto voa, o monstro não anda, não ataca e não esquiva, como num dash normal.
// Para ficar leve no celular: formas e materiais são criados uma vez só e reaproveitados;
// no máximo 2 rastros e 1 redemoinho por monstro.
// =============================================================
import * as THREE from 'three';
import { EFEITOS } from '../dados.js';

const MAX_RASTROS = 2;   // rastros d'água de um mesmo monstro ao mesmo tempo
const EMPURRAO = 8;      // metros de empurrão -> velocidade (o empurrão freia com exp(-8t))
const ALTURA_VOO = 2.6;  // metros que sobe no mergulho (a Queda do Leviatã sobe 25% mais)

// formas (uma vez só)
const GEO_GOTA = new THREE.IcosahedronGeometry(1, 0);
const GEO_BOLHA = new THREE.SphereGeometry(1, 10, 8);
const GEO_DISCO = new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.9, 1, 32).rotateX(-Math.PI / 2);
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
const GEO_ESPIRAL = new THREE.RingGeometry(0.35, 1, 24, 1, 0, Math.PI * 1.3).rotateX(-Math.PI / 2);
const GEO_COLUNA = new THREE.CylinderGeometry(0.55, 1, 1, 12, 1, true).translate(0, 0.5, 0);
const GEO_FERRAO = new THREE.ConeGeometry(0.18, 1.6, 4).rotateX(-Math.PI / 2);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op, extra = {}) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, ...extra }));
const AGUA_CLARA = basico('#8fdcff', 0.8);
const ESPUMA = basico('#f2fbff', 0.92);
const BOLHA = basico('#9fe4ff', 0.55);
// materiais que somem (cada efeito usa uma cópia própria)
const someMat = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });
const COR_AGUA = '#3db8ff';

export class HabilidadesAquaraia {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.rastros = [];      // rastros d'água no chão
    this.redemoinhos = [];  // redemoinhos do mergulho
  }

  // Só a Aquaraia e as formas dela usam estas habilidades
  dele(c) { return c.esp.linha === 'aquaraia'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }
  // chefes e o Campeão são puxados só pela metade (igual ao ímã do Imanito)
  resistente(o) { return !!o.esp.chefe || (!!this.b.treinador?.campeao && o.lado === 'inimigo'); }

  // ---------- gotinhas (partículas) ----------
  gota(pos, vel, tam, vida, mat = AGUA_CLARA) {
    const m = new THREE.Mesh(GEO_GOTA, mat);
    m.position.copy(pos);
    m.scale.setScalar(tam);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      vel.y -= 14 * dt; // a água cai
      e.obj.position.addScaledVector(vel, dt);
      if (e.obj.position.y < 0.05) { e.obj.position.y = 0.05; vel.set(0, 0, 0); }
      e.obj.scale.setScalar(tam * (1 - k * 0.7));
    } });
  }

  respingo(pos, n, forca, y = 0.6) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const v = new THREE.Vector3(Math.sin(a) * 3 * forca, (3 + Math.random() * 2.5) * forca, Math.cos(a) * 3 * forca);
      this.gota(new THREE.Vector3(pos.x, y, pos.z), v, 0.09 + Math.random() * 0.06, 0.55, i % 3 ? AGUA_CLARA : ESPUMA);
    }
  }

  // ---------- Rasante ----------
  iniciarRasante(c, gp, dir, efeito) {
    const R = gp.rasante;
    c.dash = { dir: dir.clone(), t: R.distancia / R.vel, vel: R.vel,
      rasante: { gp, R, efeito, atingidos: new Set(), inicio: c.pos.clone(), gotaT: 0 } };
    c.angAlvo = c.ang = Math.atan2(dir.x, dir.z);
    this.respingo(c.pos, 5, 0.5, 0.8);
  }

  // a cada quadro do voo (o movimento é o do dash da batalha)
  atualizarRasante(c, ds, dt) {
    const S = ds.rasante, R = S.R;
    // acerta cada inimigo que encostar, uma vez, e segue voando
    for (const o of this.b.alvosDe(c)) {
      if (S.atingidos.has(o)) continue;
      if (Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) < c.raio * 0.5 + o.raio + R.largura) {
        S.atingidos.add(o);
        this.b.aplicarDano(c, o, S.gp, ds.dir, { efeito: S.efeito, empurrao: 2 });
        this.respingo(o.pos, 4, 0.6, o.altura * 0.5);
      }
    }
    // gotas saindo das pontas das asas
    S.gotaT -= dt;
    if (S.gotaT <= 0) {
      S.gotaT = 0.08;
      const lado = Math.random() < 0.5 ? -1 : 1, larg = c.raio * 1.6;
      const p = new THREE.Vector3(c.pos.x + ds.dir.z * lado * larg, 0.6 + Math.random() * 0.4, c.pos.z - ds.dir.x * lado * larg);
      this.gota(p, new THREE.Vector3(-ds.dir.x * 2, 1.5, -ds.dir.z * 2), 0.08, 0.4, Math.random() < 0.3 ? ESPUMA : AGUA_CLARA);
    }
    if (ds.t > 0) return;
    // fim do voo: rastro d'água no caminho e o ferrão batendo para trás
    if (R.rastro) this.criarRastro(c, S.inicio, c.pos.clone(), R.rastro);
    if (R.ferrao) this.ferrao(c, S, ds.dir);
  }

  ferrao(c, S, dir) {
    const atras = new THREE.Vector3(-dir.x, 0, -dir.z);
    // o inimigo mais perto atrás dela, até 3,5 m
    let alvo = null, md = 3.5;
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d - o.raio < md && (dx * atras.x + dz * atras.z) / (d || 1) > 0.2) { md = d - o.raio; alvo = o; }
    }
    // o ferrão aparece e chicoteia (visual)
    const mat = someMat('#c9f2ff', 0.95);
    const m = new THREE.Mesh(GEO_FERRAO, mat);
    const base = c.pos.clone().setY(c.altura * 0.45);
    m.position.copy(base);
    m.rotation.y = Math.atan2(atras.x, atras.z);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida: 0.3, total: 0.3, mats: [mat], upd: (e, k) => {
      e.obj.position.copy(base).addScaledVector(atras, 0.6 + Math.sin(k * Math.PI) * 1.4);
      e.obj.scale.setScalar(0.6 + c.esp.tamanho * 0.5);
      mat.opacity = 0.95 * (1 - k * k);
    } });
    if (!alvo) return;
    this.b.aplicarDano(c, alvo, S.gp, atras, { fator: S.R.ferrao, efeito: S.efeito, empurrao: 3 });
    this.respingo(alvo.pos, 5, 0.5, alvo.altura * 0.5);
  }

  // ---------- Rastro d'Água ----------
  criarRastro(c, a, b, Rr) {
    const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
    if (len < 0.5) return;
    // no máximo MAX_RASTROS por monstro: o mais velho some
    const dele = this.rastros.filter((r) => r.dono === c);
    if (dele.length >= MAX_RASTROS) this.removerRastro(dele[0]);
    const mat = someMat('#3db8ff', 0.45);
    const m = new THREE.Mesh(GEO_FAIXA, mat);
    m.position.set(a.x, 0.07, a.z);
    m.rotation.y = Math.atan2(dx, dz);
    m.scale.set(Rr.largura, 1, len);
    this.cena.add(m);
    this.rastros.push({ dono: c, a: a.clone().setY(0), b: b.clone().setY(0), Rr, t: 0, tick: 0.25, mesh: m, mat, gotaT: 0 });
  }

  // distância do ponto até o segmento a-b (no chão)
  distSegmento(p, a, b) {
    const vx = b.x - a.x, vz = b.z - a.z, l2 = vx * vx + vz * vz || 1;
    const k = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.z - a.z) * vz) / l2));
    return Math.hypot(p.x - (a.x + vx * k), p.z - (a.z + vz * k));
  }

  atualizarRastro(r, dt) {
    r.t += dt;
    const D = r.Rr.duracao;
    if (r.t >= D || !this.naLuta(r.dono)) { this.removerRastro(r); return; }
    r.mat.opacity = 0.45 * Math.min(1, r.t / 0.15) * Math.min(1, (D - r.t) / 0.5);
    // gotinhas pulando da água de vez em quando
    r.gotaT -= dt;
    if (r.gotaT <= 0) {
      r.gotaT = 0.3;
      const k = Math.random();
      const p = new THREE.Vector3(r.a.x + (r.b.x - r.a.x) * k, 0.1, r.a.z + (r.b.z - r.a.z) * k);
      this.gota(p, new THREE.Vector3(0, 2 + Math.random(), 0), 0.07, 0.35);
    }
    // a cada meio segundo: quem está em cima pode ficar Encharcado
    if (r.t < r.tick) return;
    r.tick += 0.5;
    const c = r.dono, dur = EFEITOS.encharcado.duracao * (c.melhoria?.forcaEfeito ?? 1) * 0.5;
    for (const o of this.b.alvosDe(c)) {
      if (this.distSegmento(o.pos, r.a, r.b) > r.Rr.largura / 2 + o.raio * 0.5) continue;
      if (Math.random() < r.Rr.chance) this.b.aplicarEfeito(o, 'encharcado', dur, c);
    }
  }

  removerRastro(r) {
    this.cena.remove(r.mesh);
    r.mat.dispose();
    this.rastros.splice(this.rastros.indexOf(r), 1);
  }

  // ---------- Bolhas ----------
  // cria a bolha (a batalha cuida de andar e acertar)
  projetil(gp, fator) {
    const g = new THREE.Mesh(GEO_BOLHA, BOLHA); // 1 peça só (são até 5 ao mesmo tempo)
    const s = gp.raio * (fator < 1 ? 0.85 : 1);
    g.scale.setScalar(s);
    g.userData.s = s;
    return g;
  }

  // a cada quadro, depois que a bolha andou: balança e (guiada) vira para o inimigo mais perto
  atualizarProjetil(p, dt) {
    const B = p.gp.bolha, info = p.aquaBolha;
    info.t += dt;
    const s = p.mesh.userData.s;
    p.mesh.scale.set(s * (1 + Math.sin(info.t * 14) * 0.08), s * (1 - Math.sin(info.t * 14) * 0.08), s);
    p.pos.y = info.y + Math.sin(info.t * 7 + info.fase) * 0.12;
    p.mesh.position.copy(p.pos);
    if (!B.guiada || info.t < 0.12) return;
    let alvo = null, md = Infinity;
    for (const o of this.b.alvosDe(p.dono)) {
      const dx = o.pos.x - p.pos.x, dz = o.pos.z - p.pos.z, d = Math.hypot(dx, dz);
      if (d < md && (dx * p.dir.x + dz * p.dir.z) / (d || 1) > -0.2) { md = d; alvo = o; } // só os que estão na frente ou do lado
    }
    if (!alvo) return;
    // vira no máximo B.guiada radianos por segundo (dá para fugir correndo de lado)
    const atual = Math.atan2(p.dir.x, p.dir.z), quer = Math.atan2(alvo.pos.x - p.pos.x, alvo.pos.z - p.pos.z);
    let dif = quer - atual;
    while (dif > Math.PI) dif -= Math.PI * 2;
    while (dif < -Math.PI) dif += Math.PI * 2;
    const giro = Math.max(-B.guiada * dt, Math.min(B.guiada * dt, dif));
    p.dir.set(Math.sin(atual + giro), 0, Math.cos(atual + giro));
  }

  // a bolha estoura (acertou, bateu ou chegou no fim): só uma bolha maior que some, sem gotas
  estourar(p) {
    const mat = someMat('#dff6ff', 0.8);
    const m = new THREE.Mesh(GEO_BOLHA, mat);
    m.position.copy(p.pos);
    this.cena.add(m);
    const s = p.mesh.userData.s;
    this.b.efeitos.push({ obj: m, vida: 0.18, total: 0.18, mats: [mat], upd: (e, k) => {
      e.obj.scale.setScalar(s * (1 + k * 0.8));
      mat.opacity = 0.8 * (1 - k);
    } });
  }

  // ---------- Mergulho ----------
  // onde ela vai cair: onde o alvo está agora, até o alcance
  pontoMergulho(c, gp, alvoPos) {
    const M = gp.mergulho;
    const d = new THREE.Vector3(alvoPos.x - c.pos.x, 0, alvoPos.z - c.pos.z);
    const len = d.length();
    if (len > M.alcance) d.multiplyScalar(M.alcance / len);
    return new THREE.Vector3(c.pos.x + d.x, 0, c.pos.z + d.z);
  }

  // círculo no chão onde ela vai cair (vermelho quando é do inimigo). Fica até ela cair.
  avisoMergulho(ponto, gp, inimigo) {
    const cor = inimigo ? '#ff3d5e' : COR_AGUA;
    const g = new THREE.Group();
    const mA = someMat(cor, 0.8), mD = someMat(cor, 0.22);
    const anel = new THREE.Mesh(GEO_ANEL, mA), disco = new THREE.Mesh(GEO_DISCO, mD);
    g.add(anel, disco);
    g.scale.setScalar(gp.raio);
    g.position.set(ponto.x, 0.06, ponto.z);
    g.userData = { ficaNoChao: true, disco, mats: [mA, mD] };
    this.cena.add(g);
    return g;
  }

  tirarAviso(av) {
    if (!av) return;
    this.cena.remove(av);
    for (const m of av.userData.mats || []) m.dispose();
  }

  iniciarMergulho(c, gp, ponto, aviso, efeito) {
    const M = gp.mergulho, total = M.sobe + M.cai;
    const d = new THREE.Vector3(ponto.x - c.pos.x, 0, ponto.z - c.pos.z);
    const len = d.length();
    if (len > 0.01) d.divideScalar(len); else d.set(Math.sin(c.ang), 0, Math.cos(c.ang));
    const mg = { gp, M, ponto, aviso, efeito, t: 0, total, altura: ALTURA_VOO * (M.sobe >= 1 ? 1.25 : 1) };
    c.dash = { dir: d, t: total, vel: len / total, mergulho: mg };
    c.aquaMergulho = mg; // para limpar o aviso se ela sair da luta no meio do voo
    c.invul = Math.max(c.invul, M.sobe); // lá em cima não leva dano
    c.angAlvo = c.ang = Math.atan2(d.x, d.z);
    this.respingo(c.pos, 6, 0.7, 0.4);
    this.b.efeitoAnel(c.pos, 1.5, '#8fdcff');
    this.b.jogo.numero('No alto!', c.pos.clone().setY(c.altura + 0.6), '#bfe8ff', 'pequeno');
  }

  // a cada quadro do mergulho (o movimento no chão é o do dash da batalha)
  atualizarMergulho(c, ds, dt) {
    const mg = ds.mergulho;
    mg.t += dt;
    if (mg.aviso) {
      const k = Math.min(1, mg.t / mg.total);
      mg.aviso.userData.disco.scale.setScalar(Math.max(0.01, k));
    }
    if (ds.t > 0) return;
    this.cair(c, mg);
  }

  // altura do voo: sobe rápido, para lá em cima e cai de uma vez (chamado depois da animação)
  alturaDoVoo(c) {
    const mg = c.dash?.mergulho;
    const m = c.modelo;
    if (!mg) { if (m.rotation.x) m.rotation.x = 0; return; }
    const M = mg.M;
    let h, inclina;
    if (mg.t < M.sobe) {
      const k = mg.t / M.sobe;
      h = mg.altura * Math.sin(k * Math.PI / 2);
      inclina = -0.5 * (1 - k);         // sobe de bico para cima
    } else {
      const k = Math.min(1, (mg.t - M.sobe) / M.cai);
      h = mg.altura * (1 - k * k);
      inclina = 0.7 * k;                // desce de bico para baixo
    }
    m.userData.corpo.position.y += h;
    m.rotation.x = inclina;
  }

  cair(c, mg) {
    const gp = mg.gp, M = mg.M, R = gp.raio;
    this.tirarAviso(mg.aviso);
    mg.aviso = null;
    c.aquaMergulho = null;
    c.modelo.rotation.x = 0;
    // a água espirra em volta e quem está dentro leva o golpe (Encharcado leva mais)
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > R + o.raio * 0.5) continue;
      const dir = d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1);
      const fator = 1 + (M.encharcado && o.tem('encharcado') ? M.encharcado : 0);
      this.b.aplicarDano(c, o, gp, dir, { fator, efeito: mg.efeito, empurrao: M.empurra * EMPURRAO });
    }
    this.b.efeitoAnel(c.pos, R, '#e6f8ff');
    this.b.efeitoAnel(c.pos, R * 0.7, COR_AGUA);
    this.respingo(c.pos, 10, 1.1, 0.3);
    this.coluna(c.pos, R);
    if (M.redemoinho) this.criarRedemoinho(c, c.pos.clone(), M.redemoinho, gp);
  }

  // coluna de água que sobe e desmancha onde ela caiu
  coluna(pos, R) {
    const mat = someMat('#8fdcff', 0.6);
    const m = new THREE.Mesh(GEO_COLUNA, mat);
    m.position.set(pos.x, 0, pos.z);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida: 0.45, total: 0.45, mats: [mat], upd: (e, k) => {
      e.obj.scale.set(R * (0.4 + k * 0.6), 2.6 * Math.sin(k * Math.PI) + 0.01, R * (0.4 + k * 0.6));
      mat.opacity = 0.6 * (1 - k);
    } });
  }

  // ---------- Redemoinho ----------
  criarRedemoinho(c, pos, Rd, gp) {
    // 1 por monstro: o novo tira o velho
    for (const r of this.redemoinhos.filter((x) => x.dono === c)) this.removerRedemoinho(r);
    const g = new THREE.Group();
    g.position.set(pos.x, 0.08, pos.z);
    const mD = someMat('#2f9ee8', 0.35), mE = someMat('#bfeaff', 0.7);
    const disco = new THREE.Mesh(GEO_DISCO, mD);
    const e1 = new THREE.Mesh(GEO_ESPIRAL, mE), e2 = new THREE.Mesh(GEO_ESPIRAL, mE);
    e2.rotation.y = Math.PI;
    e1.position.y = e2.position.y = 0.02;
    g.add(disco, e1, e2);
    g.scale.setScalar(0.01);
    this.cena.add(g);
    this.redemoinhos.push({ dono: c, pos: pos.setY(0), Rd, gp, t: 0, tick: 0.5, obj: g, mats: [mD, mE], gotaT: 0 });
  }

  atualizarRedemoinho(r, dt) {
    r.t += dt;
    const Rd = r.Rd, c = r.dono;
    if (r.t >= Rd.duracao || !this.naLuta(c)) { this.removerRedemoinho(r); return; }
    const k = Math.min(1, r.t / 0.3) * Math.min(1, (Rd.duracao - r.t) / 0.5);
    r.obj.scale.setScalar(Math.max(0.01, Rd.raio * k));
    r.obj.rotation.y -= dt * 5; // gira
    r.mats[0].opacity = 0.35 * k;
    r.mats[1].opacity = 0.7 * k;
    // gotas girando em espiral para o centro
    r.gotaT -= dt;
    if (r.gotaT <= 0) {
      r.gotaT = 0.2;
      const a = Math.random() * Math.PI * 2, rr = Rd.raio * 0.9;
      const p = new THREE.Vector3(r.pos.x + Math.cos(a) * rr, 0.25, r.pos.z + Math.sin(a) * rr);
      this.gota(p, new THREE.Vector3(-Math.cos(a) * 3 + Math.sin(a) * 3, 1.2, -Math.sin(a) * 3 - Math.cos(a) * 3), 0.07, 0.4);
    }
    // puxa quem está dentro para o centro (devagar)
    for (const o of this.b.alvosDe(c)) {
      const dx = r.pos.x - o.pos.x, dz = r.pos.z - o.pos.z, d = Math.hypot(dx, dz);
      if (d > Rd.raio + o.raio * 0.5 || d < 0.3) continue;
      const v = Math.min(d - 0.3, Rd.puxa * (this.resistente(o) ? 0.5 : 1) * dt);
      o.pos.x += (dx / d) * v;
      o.pos.z += (dz / d) * v;
      this.b.arena.colidir(o.pos, o.raio);
    }
    // a cada meio segundo, um pedaço de dano em quem está dentro
    if (r.t < r.tick) return;
    r.tick += 0.5;
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - r.pos.x, dz = o.pos.z - r.pos.z, d = Math.hypot(dx, dz);
      if (d > Rd.raio + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, r.gp, d > 0.01 ? new THREE.Vector3(-dx / d, 0, -dz / d) : new THREE.Vector3(0, 0, 1),
        { fator: Rd.poder / r.gp.poder, leve: true, empurrao: 0 });
    }
  }

  removerRedemoinho(r) {
    this.cena.remove(r.obj);
    for (const m of r.mats) m.dispose();
    this.redemoinhos.splice(this.redemoinhos.indexOf(r), 1);
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (let i = this.rastros.length - 1; i >= 0; i--) this.atualizarRastro(this.rastros[i], dt);
    for (let i = this.redemoinhos.length - 1; i >= 0; i--) this.atualizarRedemoinho(this.redemoinhos[i], dt);
  }

  // Para tudo (desmaiou, trocado, fim da luta...)
  parar(c) {
    if (c.aquaMergulho) { this.tirarAviso(c.aquaMergulho.aviso); c.aquaMergulho = null; }
    if (c.dash?.mergulho || c.dash?.rasante) c.dash = null;
    if (c.modelo) c.modelo.rotation.x = 0;
    for (const r of this.rastros.filter((x) => x.dono === c)) this.removerRastro(r);
    for (const r of this.redemoinhos.filter((x) => x.dono === c)) this.removerRedemoinho(r);
  }
}
