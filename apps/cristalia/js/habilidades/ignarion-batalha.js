// =============================================================
// IGNÁRION NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em ignarion.js)
//  - Calor Ígneo: cada golpe que acerta (e cada dano que leva) enche a barra (c.calorIgneo, de 0 a 1).
//    Cheia, ele entra em IGNIÇÃO sozinho (c.ignicao): mais dano por alguns segundos; nas formas
//    finais, uma aura que queima quem chega perto e, no Infernárion, uma explosão no fim.
//  - Mordida e Arremesso: morde o inimigo da frente e joga ele por cima da cabeça, para trás.
//    Se ele bater numa pedra ou na borda, leva mais dano e fica atordoado. Nas formas finais,
//    explode onde cai.
//  - Cometa Ígneo: leque de cometas que explodem ao acertar (no Infernárion, mais um gigante).
//  - Cataclismo: área em volta e, nas evoluções, fissuras de fogo que correm pelo chão para fora.
// Para ficar leve no celular: formas e materiais são criados uma vez só; no máximo
// MAX_COMETAS cometas no ar e 8 fissuras por monstro.
// =============================================================
import * as THREE from 'three';
import { RAIO_ARENA } from '../arena.js';
import { EFEITOS } from '../dados.js';
import { CALOR, BATIDA } from './ignarion.js';

const MAX_COMETAS = 10;

// formas (uma vez só)
const GEO_COMETA = new THREE.IcosahedronGeometry(1, 0);
const GEO_BRASA = new THREE.TetrahedronGeometry(1, 0);
const GEO_ANEL = new THREE.RingGeometry(0.9, 1, 32).rotateX(-Math.PI / 2);
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
const GEO_COLUNA = new THREE.CylinderGeometry(0.5, 1, 1, 10, 1, true).translate(0, 0.5, 0);
const GEO_MORDIDA = new THREE.TorusGeometry(0.6, 0.08, 4, 12, Math.PI);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1 }));
const COMETA = fixo(new THREE.MeshLambertMaterial({ color: '#ff3d6a', emissive: '#ff3d6a', emissiveIntensity: 0.9, flatShading: true }));
const BRASA = basico('#ffb030');
const BRASA_ROSA = basico('#ff3d6a');
const someMat = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });
const COR_IGNEO = '#ff3d6a';

export class HabilidadesIgnarion {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.cometas = [];
    this.fissuras = [];
    this.voando = new Set(); // inimigos sendo arremessados
  }

  // Só o Ignárion e as formas dele usam estas habilidades
  dele(c) { return c?.esp.linha === 'ignarion'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }
  // chefes e o Campeão são arremessados só pela metade da distância
  resistente(o) { return !!o.esp.chefe || (!!this.b.treinador?.campeao && o.lado === 'inimigo'); }

  // ---------- brasas (partículas) ----------
  brasa(pos, vel, tam, vida, mat = BRASA) {
    const m = new THREE.Mesh(GEO_BRASA, mat);
    m.position.copy(pos);
    m.scale.setScalar(tam);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      vel.y -= 9 * dt;
      e.obj.position.addScaledVector(vel, dt);
      e.obj.rotation.x += dt * 8;
      e.obj.scale.setScalar(Math.max(0.01, tam * (1 - k)));
    } });
  }
  estouro(pos, n, forca, y = 0.5) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      this.brasa(new THREE.Vector3(pos.x, y, pos.z), new THREE.Vector3(Math.sin(a) * 3 * forca, (2.5 + Math.random() * 3) * forca, Math.cos(a) * 3 * forca), 0.09 + Math.random() * 0.06, 0.55, i % 2 ? BRASA : BRASA_ROSA);
    }
  }
  coluna(pos, raio, alto, cor = '#ff5a3a') {
    const mat = someMat(cor, 0.55);
    const m = new THREE.Mesh(GEO_COLUNA, mat);
    m.position.set(pos.x, 0, pos.z);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida: 0.5, total: 0.5, mats: [mat], upd: (e, k) => {
      e.obj.scale.set(raio * (0.3 + k * 0.7), alto * Math.sin(k * Math.PI) + 0.01, raio * (0.3 + k * 0.7));
      mat.opacity = 0.55 * (1 - k);
    } });
  }
  // dano em todos os inimigos de "c" dentro de um círculo
  area(c, gp, pos, raio, opcoes) {
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - pos.x, dz = o.pos.z - pos.z, d = Math.hypot(dx, dz);
      if (d > raio + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), opcoes);
    }
  }

  // ---------- Calor Ígneo e Ignição ----------
  aoAcertar(at) { if (this.dele(at)) this.encher(at, CALOR.porAcerto); }
  aoApanhar(alvo) { if (this.dele(alvo)) this.encher(alvo, CALOR.porDano); }
  encher(c, q) {
    if (c.ignicao || c.morto) return;
    c.calorIgneo = Math.min(1, (c.calorIgneo || 0) + q);
    if (c.calorIgneo >= 1) this.acender(c);
  }

  acender(c) {
    const I = CALOR.ignicao[c.esp.estagio] || CALOR.ignicao[0];
    const mat = someMat(COR_IGNEO, 0.6);
    const anel = new THREE.Mesh(GEO_ANEL, mat);
    anel.position.set(c.pos.x, 0.08, c.pos.z);
    anel.scale.setScalar(I.aura ? I.aura.raio : c.raio * 1.3);
    this.cena.add(anel);
    c.ignicao = { I, t: I.duracao, anel, mat, tick: 0.5, brasaT: 0 };
    c.calorIgneo = 0;
    this.b.efeitoAnel(c.pos, 3, '#ffd06a');
    this.estouro(c.pos, 10, 0.9, 0.6);
    this.b.jogo.numero('IGNIÇÃO!', c.pos.clone().setY(c.altura + 0.8), '#ffb030', 'grande');
    if (c.lado === 'inimigo') this.b.jogo.aviso(`${c.esp.nome} entrou em IGNIÇÃO! Bate mais forte por ${I.duracao} s.`);
  }

  atualizarIgnicao(c, dt) {
    const Q = c.ignicao, I = Q.I;
    if (!this.naLuta(c)) { this.apagar(c); return; }
    Q.t -= dt;
    Q.anel.position.set(c.pos.x, 0.08, c.pos.z);
    Q.mat.opacity = 0.45 + Math.sin(this.b.t * 10) * 0.15;
    // brasas subindo do corpo
    Q.brasaT -= dt;
    if (Q.brasaT <= 0) {
      Q.brasaT = 0.2;
      const a = Math.random() * Math.PI * 2;
      this.brasa(new THREE.Vector3(c.pos.x + Math.cos(a) * c.raio * 0.6, c.altura * (0.3 + Math.random() * 0.5), c.pos.z + Math.sin(a) * c.raio * 0.6), new THREE.Vector3(0, 2.5, 0), 0.1, 0.5, Math.random() < 0.5 ? BRASA : BRASA_ROSA);
    }
    // aura: queima quem está perto a cada meio segundo
    if (I.aura && (Q.tick -= dt) <= 0) {
      Q.tick = 0.5;
      const gp = c.golpe(2);
      this.area(c, gp, c.pos, I.aura.raio, { fator: I.aura.poder / gp.poder, leve: true, empurrao: 0, particulas: 1 });
    }
    if (Q.t > 0) return;
    // Infernárion: explosão no fim da Ignição
    if (I.explosao) {
      const gp = c.golpe(2);
      this.area(c, gp, c.pos, I.explosao.raio, { fator: I.explosao.poder / gp.poder, efeito: this.b.efeitoDoGolpe(c, gp), empurrao: 9 });
      this.b.efeitoAnel(c.pos, I.explosao.raio, '#ffd06a');
      this.b.efeitoAnel(c.pos, I.explosao.raio * 0.7, COR_IGNEO);
      this.coluna(c.pos, I.explosao.raio, 5);
      this.estouro(c.pos, 14, 1.3);
      this.b.jogo.numero('EXPLOSÃO ÍGNEA!', c.pos.clone().setY(c.altura + 0.9), '#ffd06a', 'grande');
    }
    this.apagar(c);
  }

  apagar(c) {
    const Q = c.ignicao;
    if (!Q) return;
    this.cena.remove(Q.anel);
    Q.mat.dispose();
    c.ignicao = null;
  }

  // ---------- Mordida e Arremesso ----------
  morder(c, gp, dir, efeito) {
    const A = gp.arremesso;
    // a mordida na frente (visual)
    const mat = someMat('#ffb030', 0.9);
    const m = new THREE.Mesh(GEO_MORDIDA, mat);
    const frente = c.pos.clone().addScaledVector(dir, c.raio + 0.6).setY(c.altura * 0.4);
    m.position.copy(frente);
    m.rotation.set(0, Math.atan2(dir.x, dir.z), Math.PI / 2);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida: 0.25, total: 0.25, mats: [mat], upd: (e, k) => { e.obj.scale.setScalar(1.4 - k * 0.6); mat.opacity = 0.9 * (1 - k); } });
    // quem está na frente, mais perto
    let alvo = null, md = Infinity;
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > gp.alcance + c.raio * 0.5 + o.raio * 0.5 || (d > 0.3 && (dx * dir.x + dz * dir.z) / d < 0.3)) continue;
      if (d < md) { md = d; alvo = o; }
    }
    if (!alvo) return;
    if (!this.b.aplicarDano(c, alvo, gp, dir, { efeito, empurrao: 0 }) || alvo.morto) return;
    // joga por cima da cabeça, para trás de quem mordeu
    const dist = A.distancia * (this.resistente(alvo) ? 0.5 : 1);
    const ate = c.pos.clone().addScaledVector(dir, -dist).setY(0);
    const r = Math.hypot(ate.x, ate.z), lim = RAIO_ARENA - alvo.raio;
    if (r > lim) ate.multiplyScalar(lim / r);
    if (alvo.prep) this.b.cancelarPreparo(alvo);
    alvo.dash = null;
    alvo.arremesso = { de: alvo.pos.clone().setY(0), ate, t: 0, A, dono: c, gp, efeito, dir: ate.clone().sub(alvo.pos).setY(0).normalize() };
    alvo.stun = Math.max(alvo.stun, A.voo + 0.15);
    this.voando.add(alvo);
  }

  atualizarArremesso(o, dt) {
    const R = o.arremesso, A = R.A;
    if (o.morto || !o.modelo.visible) { this.terminarArremesso(o, false, true); return; }
    R.t += dt;
    const k = Math.min(1, R.t / A.voo);
    const P = R.de.clone().lerp(R.ate, k);
    o.emp.set(0, 0, 0);
    o.stun = Math.max(o.stun, 0.1);
    // bateu numa pedra (ou na borda) no caminho: para ali
    if (this.b.arena.bloqueia(P, o.raio * 0.7) || Math.hypot(P.x, P.z) > RAIO_ARENA - o.raio * 0.5) { this.terminarArremesso(o, true); return; }
    o.pos.set(P.x, 0, P.z);
    const m = o.modelo;
    m.position.set(o.pos.x, Math.sin(k * Math.PI) * A.altura, o.pos.z);
    m.rotation.order = 'YXZ';
    m.rotation.x = -k * Math.PI * 2; // dá uma cambalhota no ar
    if (k >= 1) this.terminarArremesso(o, false);
  }

  terminarArremesso(o, bateu, cancelado = false) {
    const R = o.arremesso;
    o.arremesso = null;
    this.voando.delete(o);
    o.modelo.position.y = 0;
    o.modelo.rotation.x = 0;
    if (cancelado || !R) return;
    const c = R.dono, gp = R.gp, A = R.A;
    this.estouro(o.pos, 6, 0.6, 0.3);
    if (bateu) {
      this.b.aplicarDano(c, o, gp, R.dir, { fator: BATIDA.fator, empurrao: 0 });
      if (!o.morto) {
        o.stun = Math.max(o.stun, BATIDA.atordoa);
        this.b.jogo.numero('Atordoado!', o.pos.clone().setY(o.altura + 0.6), '#ffc08a', 'pequeno');
      }
    }
    if (A.explosao) {
      this.area(c, gp, o.pos, A.explosao.raio, { fator: A.explosao.fator, empurrao: 3, particulas: 3 });
      this.b.efeitoAnel(o.pos, A.explosao.raio, '#ffd06a');
      this.coluna(o.pos, A.explosao.raio, 2.5);
    }
    if (A.combustao && !o.morto) this.b.aplicarEfeito(o, 'combustao', EFEITOS.combustao.duracao * (c.melhoria?.forcaEfeito ?? 1), c);
  }

  // ---------- Cometa Ígneo ----------
  atirarCometas(c, gp, dir, efeito) {
    const C = gp.cometas, base = Math.atan2(dir.x, dir.z);
    const de = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(Math.min(1.6, c.altura * 0.45));
    for (let k = 0; k < C.quantidade; k++) {
      const ang = base + (C.quantidade > 1 ? (k / (C.quantidade - 1) - 0.5) * C.abertura : 0);
      this.criarCometa(c, gp, de, ang, C.vel, C.alcance, C.tamanho, C.explosao, 1, efeito);
    }
    const Gg = C.gigante;
    if (Gg) this.criarCometa(c, gp, de, base, Gg.vel, C.alcance, Gg.tamanho, Gg.explosao, Gg.fator, efeito);
    this.estouro(de, 4, 0.4, de.y);
  }

  criarCometa(c, gp, de, ang, vel, alcance, tam, explosao, fator, efeito) {
    if (this.cometas.length >= MAX_COMETAS) return;
    const mesh = new THREE.Mesh(GEO_COMETA, COMETA);
    mesh.scale.set(tam, tam, tam * 1.6);
    mesh.position.copy(de);
    mesh.rotation.y = ang;
    this.cena.add(mesh);
    this.cometas.push({ dono: c, gp, pos: de.clone(), dir: new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)), vel, resta: alcance, tam, explosao, fator, efeito, mesh, rastroT: 0 });
  }

  atualizarCometas(dt) {
    for (let i = this.cometas.length - 1; i >= 0; i--) {
      const k = this.cometas[i];
      const passo = k.vel * dt;
      k.pos.addScaledVector(k.dir, passo);
      k.resta -= passo;
      k.mesh.position.copy(k.pos);
      k.mesh.rotation.z += dt * 10;
      k.rastroT -= dt;
      if (k.rastroT <= 0) { k.rastroT = 0.15; this.brasa(k.pos.clone(), new THREE.Vector3(0, 0.8, 0), k.tam * 0.45, 0.25, Math.random() < 0.5 ? BRASA : BRASA_ROSA); }
      let explode = k.resta <= 0 || Math.hypot(k.pos.x, k.pos.z) > RAIO_ARENA || this.b.arena.bloqueia(k.pos, k.tam * 0.6);
      if (!explode) for (const o of this.b.alvosDe(k.dono)) if (Math.hypot(o.pos.x - k.pos.x, o.pos.z - k.pos.z) < o.raio + k.tam) { explode = true; break; }
      if (!explode) continue;
      this.explodirCometa(k);
      this.cena.remove(k.mesh);
      this.cometas.splice(i, 1);
    }
  }

  explodirCometa(k) {
    this.area(k.dono, k.gp, k.pos, k.explosao, { fator: k.fator, efeito: k.efeito, empurrao: 3, particulas: 2 });
    this.b.efeitoAnel(k.pos, k.explosao, COR_IGNEO);
    this.estouro(k.pos, k.tam > 0.6 ? 8 : 2, 0.6, k.pos.y); // o cometa gigante solta mais brasas
  }

  // ---------- Cataclismo e Fissuras Ígneas ----------
  cataclismo(c, gp, efeito) {
    this.area(c, gp, c.pos, gp.raio, { efeito });
    this.b.efeitoAnel(c.pos, gp.raio, '#ffd06a');
    this.b.efeitoAnel(c.pos, gp.raio * 0.7, COR_IGNEO);
    this.coluna(c.pos, gp.raio * 0.6, 3.5);
    this.estouro(c.pos, 8, 1.1);
    const F = gp.cataclismo.fissuras;
    if (!F) return;
    for (const f of this.fissuras.filter((x) => x.dono === c)) this.tirarFissura(f); // uma leva por vez
    const giro = Math.random() * Math.PI * 2;
    for (let i = 0; i < F.n; i++) {
      const ang = giro + (i / F.n) * Math.PI * 2;
      const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
      const mat = someMat('#ff6a2a', 0.9);
      const mesh = new THREE.Mesh(GEO_FAIXA, mat);
      const de = c.pos.clone().setY(0).addScaledVector(dir, c.raio * 0.8);
      mesh.position.set(de.x, 0.09, de.z);
      mesh.rotation.y = ang;
      mesh.scale.set(0.55, 1, 0.01);
      this.cena.add(mesh);
      this.fissuras.push({ dono: c, gp, F, de, dir, len: 0, atingidos: new Set(), efeito, mesh, mat, fogo: F.fogo, tick: 0.5, some: 0 });
    }
  }

  atualizarFissura(f, dt) {
    const F = f.F;
    if (f.len < F.alcance) {
      f.len = Math.min(F.alcance, f.len + F.vel * dt);
      f.mesh.scale.set(0.55, 1, f.len);
      // a ponta da fissura solta brasas
      if (Math.random() < 0.1) this.brasa(f.de.clone().addScaledVector(f.dir, f.len).setY(0.15), new THREE.Vector3(0, 3, 0), 0.08, 0.3);
      for (const o of this.b.alvosDe(f.dono)) {
        if (f.atingidos.has(o)) continue;
        const dx = o.pos.x - f.de.x, dz = o.pos.z - f.de.z, ao = dx * f.dir.x + dz * f.dir.z;
        if (ao < 0 || ao > f.len) continue;
        if (Math.abs(dx * f.dir.z - dz * f.dir.x) > 0.5 + o.raio * 0.5) continue;
        f.atingidos.add(o);
        this.b.aplicarDano(f.dono, o, f.gp, f.dir, { fator: F.fator, efeito: f.efeito, empurrao: 2 });
      }
      return true;
    }
    // fogo no chão (Apocalipse Ígneo): queima quem pisa por alguns segundos
    if (f.fogo > 0) {
      f.fogo -= dt;
      f.mat.opacity = 0.7 + Math.sin(this.b.t * 12 + f.len) * 0.2;
      if ((f.tick -= dt) <= 0) {
        f.tick = 0.5;
        for (const o of this.b.alvosDe(f.dono)) {
          const dx = o.pos.x - f.de.x, dz = o.pos.z - f.de.z, ao = dx * f.dir.x + dz * f.dir.z;
          if (ao < 0 || ao > f.len || Math.abs(dx * f.dir.z - dz * f.dir.x) > 0.5 + o.raio * 0.5) continue;
          this.b.aplicarDano(f.dono, o, f.gp, f.dir, { fator: F.fogoPoder / f.gp.poder, leve: true, empurrao: 0, particulas: 1 });
        }
      }
      return true;
    }
    // some devagar
    f.some += dt;
    f.mat.opacity = 0.9 * Math.max(0, 1 - f.some / 0.4);
    if (f.some < 0.4) return true;
    this.tirarFissura(f);
    return false;
  }

  tirarFissura(f) {
    this.cena.remove(f.mesh);
    f.mat.dispose();
    const i = this.fissuras.indexOf(f);
    if (i >= 0) this.fissuras.splice(i, 1);
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (const l of [this.b.jog, ...this.b.inimigos]) if (l?.ignicao) this.atualizarIgnicao(l, dt);
    for (const o of [...this.voando]) this.atualizarArremesso(o, dt);
    this.atualizarCometas(dt);
    for (let i = this.fissuras.length - 1; i >= 0; i--) if (this.fissuras[i]) this.atualizarFissura(this.fissuras[i], dt);
  }

  // Para o que é dele (desmaiou, trocado, fim da luta...). Cometas no ar continuam.
  parar(c) {
    this.apagar(c);
    c.calorIgneo = 0;
    if (c.arremesso) this.terminarArremesso(c, false, true);
    for (const f of this.fissuras.filter((x) => x.dono === c)) this.tirarFissura(f);
  }
}
