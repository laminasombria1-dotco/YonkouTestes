// =============================================================
// LINHA DO GOTINHO NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em gotinho.js)
//  - Investida (Normal): nas evoluções, dá um Escudo d'Água (de novo só 10 s depois)
//  - Jato d'Água: tiro fino que atravessa o 1º inimigo
//  - Hidrocanhão: bola grande que explode no impacto (e deixa poça no Tsunamar)
//  - Onda / Onda Dupla: parede de água que anda para a frente e empurra
//  - Maremoto: anel de água que cresce em volta e empurra para fora
// Para ficar leve no celular: formas e materiais são criados uma vez só
// e reaproveitados; quase tudo some em menos de 1 s (a poça, em 3 s).
// Etapa 3.1: a água ganha os efeitos da Arena (js/arena/efeitos.js, em this.b.fx): borrifos de gotas
// "sólidas" (aparecem no chão claro), a coluna de água do Hidrocanhão e do Maremoto, as ondinhas no
// chão e o escudo que se parte em cacos de vidro. No Tsunamar (a última forma), a água é
// mais funda e escura (o tom trevoso).
// =============================================================
import * as THREE from 'three';
import { ESCUDO_INVESTIDA, DURACAO_ESCUDO, ESPERA_ESCUDO } from './gotinho.js';

// metros de empurrão -> velocidade inicial (o empurrão freia com exp(-8t), então anda v/8)
const EMPURRAO = 8;

// formas (uma vez só)
const GEO_GOTA = new THREE.IcosahedronGeometry(1, 0);
const GEO_BOLA = new THREE.IcosahedronGeometry(1, 1);
const GEO_JATO = new THREE.CylinderGeometry(0.16, 0.28, 1.6, 7).rotateX(Math.PI / 2);
const GEO_JATO_MIOLO = new THREE.CylinderGeometry(0.07, 0.13, 1.4, 5).rotateX(Math.PI / 2);
// perfil da onda visto de lado (frente = +x, altura = y): costas inclinadas e a crista
// curvada para a frente. É "esticado" de lado para virar a parede de água, e depois
// curvado: as pontas ficam mais baixas e um pouco para trás (vista de trás, não parece caixa).
function esticarOnda(f) {
  const g = new THREE.ExtrudeGeometry(f, { depth: 1, bevelEnabled: false, curveSegments: 5, steps: 8 })
    .rotateY(-Math.PI / 2).translate(0.5, 0, 0); // largura de -0,5 a 0,5; frente em +z
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x2 = (p.getX(i) * 2) ** 2;            // 0 no meio, 1 nas pontas
    p.setY(i, p.getY(i) * (1 - 0.55 * x2));     // pontas mais baixas
    p.setZ(i, p.getZ(i) - 0.35 * x2);           // pontas um pouco para trás
  }
  g.computeVertexNormals();
  return g;
}
const perfilOnda = new THREE.Shape();
perfilOnda.moveTo(-1.1, 0);
perfilOnda.quadraticCurveTo(-0.5, 0.15, -0.1, 0.75);   // costas subindo
perfilOnda.quadraticCurveTo(0.15, 1.08, 0.45, 1.0);    // topo
perfilOnda.quadraticCurveTo(0.7, 0.9, 0.62, 0.66);     // crista caindo para a frente
perfilOnda.quadraticCurveTo(0.42, 0.74, 0.3, 0.55);    // embaixo da crista (o "tubo")
perfilOnda.quadraticCurveTo(0.22, 0.25, 0.45, 0);      // frente descendo até o chão
perfilOnda.lineTo(-1.1, 0);
// espuma: uma faixa fina por cima da crista
const perfilEspuma = new THREE.Shape();
perfilEspuma.moveTo(-0.12, 0.8);
perfilEspuma.quadraticCurveTo(0.15, 1.13, 0.47, 1.05);
perfilEspuma.quadraticCurveTo(0.76, 0.93, 0.66, 0.62);
perfilEspuma.lineTo(0.58, 0.7);
perfilEspuma.quadraticCurveTo(0.62, 0.92, 0.44, 0.97);
perfilEspuma.quadraticCurveTo(0.15, 1.02, -0.12, 0.8);
const GEO_ONDA = esticarOnda(perfilOnda);
const GEO_CRISTA = esticarOnda(perfilEspuma);
// parede redonda do Maremoto e a espuma em cima dela
const GEO_PAREDE = new THREE.CylinderGeometry(1, 1, 1, 40, 1, true).translate(0, 0.5, 0);
const GEO_ESPUMA_ANEL = new THREE.TorusGeometry(1, 0.05, 4, 48).rotateX(Math.PI / 2);
const GEO_DISCO = new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2);
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);

function fixo(m) { m.userData.fixo = true; return m; }
const transp = (cor, op, extra = {}) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, ...extra }));
const AGUA = transp('#3db8ff', 0.62, { side: THREE.DoubleSide });
const AGUA_CLARA = transp('#8fdcff', 0.75);
const ESPUMA = transp('#f2fbff', 0.92);
const MIOLO = transp('#e6f8ff', 0.95);
const ESCUDO = transp('#7fd4ff', 0.24);
const POCA = transp('#2f9ee8', 0.5);
const AZUL_ESCUDO = '#8fdcff';
// gotas da Arena (do nascer ao fim): clara; no Tsunamar, a água funda
const C = (h) => new THREE.Color(h);
const BORRIFO = [C('#f2fbff'), C('#3db8ff')];
const BORRIFO_FUNDO = [C('#bfe6ff'), C('#0f4f8a')];
const AZUL_FX = 0x8fdcff, AZUL_FUNDO_FX = 0x2f7fd0;
const aviso = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });

export class HabilidadesGotinho {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.paredes = [];   // ondas andando (e as que ainda vão sair)
    this.aneis = [];     // Maremotos crescendo
    this.pocas = [];     // poças do Hidrocanhão do Tsunamar
    this.escudos = new Set();
  }

  // Só a linha do Gotinho usa estas habilidades
  dele(c) { return c.esp.linha === 'agua'; }

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

  // água funda? (Tsunamar, a última forma)
  funda(c) { return c?.esp?.estagio === 3; }
  corDe(c) { return this.funda(c) ? AZUL_FUNDO_FX : AZUL_FX; }

  // borrifo da Arena: gotas "sólidas" que espirram e caem (uma malha só para todas)
  borrifo(x, y, z, n, forca = 1, c = null, dir = null) {
    const [a, b] = this.funda(c) ? BORRIFO_FUNDO : BORRIFO;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2, v = (1.5 + Math.random() * 2.5) * forca;
      let vx = Math.sin(ang) * v, vz = Math.cos(ang) * v;
      if (dir) { vx = vx * 0.4 + dir.x * v * 1.2; vz = vz * 0.4 + dir.z * v * 1.2; }
      this.b.fx._ponto(x, y, z, vx, (2 + Math.random() * 3) * forca, vz, a, 0.45 + Math.random() * 0.3,
        0.3 + Math.random() * 0.25, 11, { fim: b, cresce: 0.5, solido: true });
    }
  }

  // coroa de respingo (quando um tiro acerta ou o escudo estoura)
  respingo(pos, n, forca, y = 0.6) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const v = new THREE.Vector3(Math.sin(a) * 3 * forca, (3 + Math.random() * 2.5) * forca, Math.cos(a) * 3 * forca);
      this.gota(new THREE.Vector3(pos.x, y, pos.z), v, 0.09 + Math.random() * 0.06, 0.55, i % 3 ? AGUA_CLARA : ESPUMA);
    }
  }

  // ---------- Investida: Escudo d'Água ----------
  aoUsarInvestida(c) {
    const fracao = ESCUDO_INVESTIDA[c.esp.estagio] || 0;
    if (!fracao || (c.esperaEscudo || 0) > 0) return;
    const valor = Math.round(c.stats.hpMax * fracao);
    if (!c.escudo) {
      const mesh = new THREE.Mesh(GEO_BOLA, ESCUDO);
      this.cena.add(mesh);
      c.escudo = { valor, max: valor, t: DURACAO_ESCUDO, mesh };
    } else Object.assign(c.escudo, { valor, max: valor, t: DURACAO_ESCUDO });
    c.esperaEscudo = ESPERA_ESCUDO;
    this.escudos.add(c);
    this.b.jogo.numero(`Escudo +${valor}`, c.pos.clone().setY(c.altura + 0.6), AZUL_ESCUDO, 'pequeno');
    this.respingo(c.pos, 8, 0.6, c.altura * 0.5);
    // a bolha de água se forma: brilho em volta e uma ondinha no chão
    this.b.fx.esfera(c.pos.x, c.altura * 0.45, c.pos.z, c.raio * 2.2, this.corDe(c), 0.35);
    this.b.fx.onda(c.pos.x, c.pos.z, c.raio * 2.2, this.corDe(c), 0.4);
  }

  // O escudo segura o dano antes da vida. Devolve quanto passou.
  absorver(alvo, dano) {
    const e = alvo.escudo;
    if (!e) return dano;
    const segura = Math.min(e.valor, dano);
    e.valor -= segura;
    this.b.jogo.numero(`-${segura}`, alvo.pos.clone().setY(alvo.altura + 0.3), AZUL_ESCUDO, 'pequeno');
    if (e.valor <= 0) this.estourarEscudo(alvo);
    return dano - segura;
  }

  estourarEscudo(c) {
    if (!c.escudo) return;
    this.respingo(c.pos, 10, 0.8, c.altura * 0.5);
    // a bolha se parte em cacos que brilham e espirra água
    this.b.fx.estilhacos(c.pos.x, c.altura * 0.5, c.pos.z, 14, this.corDe(c), { tam: 0.2, vel: 5, cima: 4, vida: 0.8 });
    this.borrifo(c.pos.x, c.altura * 0.5, c.pos.z, 16, 1, c);
    this.cena.remove(c.escudo.mesh);
    c.escudo = null;
    this.escudos.delete(c);
  }

  // ---------- tiros: Jato d'Água e Hidrocanhão ----------
  projetil(gp, ang, fator) {
    const g = new THREE.Group();
    if (gp.visual === 'jato') {
      g.add(new THREE.Mesh(GEO_JATO, AGUA_CLARA), new THREE.Mesh(GEO_JATO_MIOLO, MIOLO));
    } else {
      const fora = new THREE.Mesh(GEO_BOLA, AGUA);
      fora.scale.setScalar(gp.raio);
      const dentro = new THREE.Mesh(GEO_BOLA, MIOLO);
      dentro.scale.setScalar(gp.raio * 0.5);
      g.add(fora, dentro);
    }
    g.rotation.y = ang;
    if (fator < 1) g.scale.setScalar(0.85);
    return g;
  }

  atualizarProjetil(p, dt) {
    p.rastro = (p.rastro ?? 0) - dt;
    if (p.gp.visual === 'canhao') {
      const k = 1 + Math.sin(this.b.t * 18) * 0.08; // a bola treme como água
      p.mesh.children[0].scale.set(p.gp.raio * k, p.gp.raio / k, p.gp.raio * k);
    }
    if (p.rastro <= 0) {
      p.rastro = p.gp.visual === 'jato' ? 0.035 : 0.05;
      const v = new THREE.Vector3((Math.random() - 0.5) * 1.5, 1 + Math.random(), (Math.random() - 0.5) * 1.5);
      if (Math.random() < 0.4) this.gota(p.pos.clone(), v, p.gp.visual === 'jato' ? 0.07 : 0.11, 0.4);
      const [a, b] = this.funda(p.dono) ? BORRIFO_FUNDO : BORRIFO, n = p.gp.visual === 'jato' ? 2 : 4;
      for (let i = 0; i < n; i++) {
        this.b.fx._ponto(p.pos.x + (Math.random() - 0.5) * 0.3, p.pos.y + (Math.random() - 0.5) * 0.3, p.pos.z + (Math.random() - 0.5) * 0.3,
          v.x * 0.6, v.y * 0.5, v.z * 0.6, a, 0.35, p.gp.visual === 'jato' ? 0.28 : 0.45, 6, { fim: b, cresce: 0.8, solido: true });
      }
    }
  }

  // Quando o tiro para (acertou ou bateu num obstáculo)
  impacto(p, alvo) {
    const gp = p.gp, c = p.dono;
    if (!gp.respingo) {
      this.respingo(p.pos, 6, 0.5, p.pos.y);
      this.borrifo(p.pos.x, p.pos.y, p.pos.z, 12, 0.7, c);
      this.b.fx.onda(p.pos.x, p.pos.z, 1.4, this.corDe(c), 0.3);
      return;
    }
    // Hidrocanhão: explode e molha quem está perto
    this.respingo(p.pos, 14, 1, p.pos.y);
    this.b.efeitoAnel(p.pos, gp.respingo.raio, '#8fdcff');
    // efeitos da Arena: coluna de água que sobe, borrifo grande e ondinha no chão
    this.b.fx.coluna(p.pos.x, p.pos.z, gp.respingo.raio * 0.45, this.corDe(c), 3, 0.4);
    this.borrifo(p.pos.x, p.pos.y, p.pos.z, 30, 1.2, c);
    this.b.fx.onda(p.pos.x, p.pos.z, gp.respingo.raio * 1.3, this.corDe(c), 0.4);
    for (const o of this.b.alvosDe(p.dono)) {
      if (o === alvo) continue;
      const dx = o.pos.x - p.pos.x, dz = o.pos.z - p.pos.z, d = Math.hypot(dx, dz);
      if (d <= gp.respingo.raio + o.raio * 0.5) {
        this.b.aplicarDano(p.dono, o, gp, new THREE.Vector3(dx, 0, dz).normalize(), { fator: gp.respingo.fator * p.fator, efeito: p.efeito });
      }
    }
    // Tsunamar: deixa uma poça que encharca quem pisa
    if (gp.poca) this.criarPoca(p, gp.poca);
  }

  // ---------- Poça ----------
  criarPoca(p, cfg) {
    const mesh = new THREE.Mesh(GEO_DISCO, POCA);
    mesh.position.set(p.pos.x, 0.07, p.pos.z);
    mesh.scale.setScalar(0.1);
    this.cena.add(mesh);
    this.pocas.push({ mesh, x: p.pos.x, z: p.pos.z, cfg, t: 0, tick: 0.5, dono: p.dono, dur: p.efeito?.dur ?? 2 });
  }

  atualizarPocas(dt) {
    for (let i = this.pocas.length - 1; i >= 0; i--) {
      const pc = this.pocas[i], cfg = pc.cfg;
      pc.t += dt;
      // cresce rápido, ondula e encolhe no fim
      const fim = Math.min(1, (cfg.duracao - pc.t) / 0.5);
      const s = cfg.raio * Math.min(1, pc.t / 0.15) * Math.max(0, fim) * (1 + Math.sin(pc.t * 7) * 0.03);
      pc.mesh.scale.setScalar(Math.max(0.01, s));
      pc.tick -= dt;
      if (pc.tick <= 0) {
        pc.tick = 0.5;
        this.b.efeitoAnel({ x: pc.x, z: pc.z }, cfg.raio * 0.8, '#8fdcff');
        this.b.fx.onda(pc.x, pc.z, cfg.raio * 0.9, this.corDe(pc.dono), 0.5);
        this.borrifo(pc.x + (Math.random() - 0.5) * cfg.raio, 0.1, pc.z + (Math.random() - 0.5) * cfg.raio, 4, 0.4, pc.dono);
        for (const o of this.b.alvosDe(pc.dono)) {
          if (Math.hypot(o.pos.x - pc.x, o.pos.z - pc.z) > cfg.raio + o.raio * 0.3) continue;
          if (Math.random() < cfg.chance) this.b.aplicarEfeito(o, 'encharcado', pc.dur, pc.dono);
        }
      }
      if (pc.t >= cfg.duracao) { this.cena.remove(pc.mesh); this.pocas.splice(i, 1); }
    }
  }

  // ---------- Onda: parede de água que anda para a frente ----------
  iniciarOnda(c, gp, dir, efeito) {
    const O = gp.onda;
    for (let n = 0; n < O.ondas; n++) {
      this.paredes.push({ c, gp, dir: dir.clone(), efeito, t: -n * O.intervalo, mesh: null, orig: null, atingidos: new Set() });
    }
  }

  // A onda nasce na frente do monstro (a 2ª nasce de onde ele estiver na hora)
  soltarOnda(w) {
    const c = w.c;
    w.orig = new THREE.Vector3(c.pos.x, 0, c.pos.z).addScaledVector(w.dir, c.raio * 0.6);
    w.perp = new THREE.Vector3(w.dir.z, 0, -w.dir.x);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(GEO_ONDA, AGUA), new THREE.Mesh(GEO_CRISTA, ESPUMA));
    g.rotation.y = Math.atan2(w.dir.x, w.dir.z);
    g.position.copy(w.orig);
    this.cena.add(g);
    w.mesh = g;
    w.emitir = 0;
    w.emitirFx = 0;
    // a água espirra para a frente quando a onda nasce
    this.borrifo(w.orig.x, 0.3, w.orig.z, 14, 0.8, c, w.dir);
  }

  // O caminho entre a onda e o alvo tem obstáculo? (dá para se esconder atrás)
  protegido(de, ate) {
    for (let k = 0.25; k < 1; k += 0.25) {
      if (this.b.arena.bloqueia({ x: de.x + (ate.x - de.x) * k, z: de.z + (ate.z - de.z) * k }, 0.2)) return true;
    }
    return false;
  }

  atualizarOnda(w, dt) {
    w.t += dt;
    if (w.t < 0) return true;           // ainda não saiu (2ª onda)
    if (w.c.morto && !w.mesh) return false;
    if (!w.mesh) this.soltarOnda(w);
    const O = w.gp.onda, k = Math.min(1, w.t / O.duracao);
    const s = O.distancia * k;
    // sobe rápido, fica alta e desmancha no fim
    const altura = (1 + O.largura * 0.12) * Math.sin(Math.min(1, k * 3) * Math.PI / 2) * (k > 0.8 ? (1 - k) / 0.2 : 1);
    w.mesh.position.copy(w.orig).addScaledVector(w.dir, s);
    w.mesh.scale.set(O.largura, Math.max(0.05, altura), 1.1);
    // espuma voando da crista
    w.emitir += dt * 20;
    w.emitirFx += dt * (60 + O.largura * 15);
    while (w.emitirFx >= 1) {
      w.emitirFx--;
      const p = w.mesh.position.clone().addScaledVector(w.perp, (Math.random() - 0.5) * O.largura);
      this.borrifo(p.x, altura * (0.6 + Math.random() * 0.4), p.z, 1, 0.8, w.c, w.dir);
    }
    while (w.emitir >= 1) {
      w.emitir--;
      const p = w.mesh.position.clone().addScaledVector(w.perp, (Math.random() - 0.5) * O.largura).setY(altura);
      this.gota(p, w.dir.clone().multiplyScalar(4 + Math.random() * 3).setY(1 + Math.random() * 2), 0.08 + Math.random() * 0.06, 0.4, Math.random() < 0.5 ? ESPUMA : AGUA_CLARA);
    }
    // acerta quem a frente da onda alcançar (cada um uma vez por onda)
    for (const alvo of this.b.alvosDe(w.c)) {
      if (w.atingidos.has(alvo)) continue;
      const rx = alvo.pos.x - w.orig.x, rz = alvo.pos.z - w.orig.z;
      const frente = rx * w.dir.x + rz * w.dir.z, lado = rx * w.perp.x + rz * w.perp.z;
      if (frente < -1 || frente > s + alvo.raio * 0.5 || Math.abs(lado) > O.largura / 2 + alvo.raio * 0.5) continue;
      w.atingidos.add(alvo);
      const de = w.orig.clone().addScaledVector(w.perp, lado);
      if (frente > 0.5 && this.protegido(de, alvo.pos)) continue;
      this.b.aplicarDano(w.c, alvo, w.gp, w.dir, { efeito: w.efeito, empurrao: O.empurra * EMPURRAO });
    }
    if (k >= 1) { this.cena.remove(w.mesh); return false; }
    return true;
  }

  // Aviso: faixa do tamanho da onda (no inimigo fica vermelha)
  avisoOnda(c, gp, dir, cor) {
    const O = gp.onda;
    const m = new THREE.Mesh(GEO_FAIXA, aviso(cor, 0.3));
    m.scale.set(O.largura, 1, O.distancia + c.raio * 0.6);
    m.position.set(c.pos.x, 0.06, c.pos.z);
    m.rotation.y = Math.atan2(dir.x, dir.z);
    m.userData = { faixa: true };
    this.cena.add(m);
    return m;
  }

  // ---------- Maremoto: anel que cresce em volta ----------
  iniciarAnel(c, gp, efeito) {
    const g = new THREE.Group();
    const espuma = new THREE.Mesh(GEO_ESPUMA_ANEL, ESPUMA);
    espuma.position.y = 1;
    g.add(new THREE.Mesh(GEO_PAREDE, AGUA), espuma);
    g.position.set(c.pos.x, 0, c.pos.z);
    this.cena.add(g);
    this.aneis.push({ c, gp, efeito, t: 0, mesh: g, centro: c.pos.clone(), atingidos: new Set(), emitir: 0, emitirFx: 0 });
    this.respingo(c.pos, 12, 1.2, 1);
    this.b.fx.coluna(c.pos.x, c.pos.z, c.raio * 1.2, this.corDe(c), 5, 0.5);
    this.b.fx.onda(c.pos.x, c.pos.z, gp.anel.ate * 1.1, this.corDe(c), gp.anel.duracao + 0.2);
  }

  atualizarAnel(a, dt) {
    a.t += dt;
    const A = a.gp.anel, k = Math.min(1, a.t / A.duracao);
    const r = A.de + (A.ate - A.de) * (1 - (1 - k) * (1 - k)); // sai rápido e vai freando
    const altura = 2.2 * Math.sin(Math.min(1, k * 4) * Math.PI / 2) * (k > 0.75 ? (1 - k) / 0.25 : 1);
    a.mesh.scale.set(r, Math.max(0.05, altura), r);
    // espuma em volta da crista
    a.emitir += dt * 30;
    a.emitirFx += dt * 120;
    while (a.emitirFx >= 1) {
      a.emitirFx--;
      const ang = Math.random() * Math.PI * 2, s = Math.sin(ang), co = Math.cos(ang);
      this.borrifo(a.centro.x + s * r, altura * (0.6 + Math.random() * 0.4), a.centro.z + co * r, 1, 0.9, a.c, { x: s, z: co });
    }
    while (a.emitir >= 1) {
      a.emitir--;
      const ang = Math.random() * Math.PI * 2, s = Math.sin(ang), co = Math.cos(ang);
      this.gota(new THREE.Vector3(a.centro.x + s * r, altura, a.centro.z + co * r), new THREE.Vector3(s * 5, 1.5 + Math.random() * 2, co * 5), 0.1 + Math.random() * 0.07, 0.4, Math.random() < 0.5 ? ESPUMA : AGUA_CLARA);
    }
    for (const alvo of this.b.alvosDe(a.c)) {
      if (a.atingidos.has(alvo)) continue;
      const dx = alvo.pos.x - a.centro.x, dz = alvo.pos.z - a.centro.z, d = Math.hypot(dx, dz);
      if (d > r + alvo.raio * 0.5) continue;
      a.atingidos.add(alvo);
      if (d > 1 && this.protegido(a.centro, alvo.pos)) continue;
      const dir = d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1);
      this.b.aplicarDano(a.c, alvo, a.gp, dir, { efeito: a.efeito, empurrao: A.empurra * EMPURRAO });
    }
    if (k >= 1) { this.cena.remove(a.mesh); return false; }
    return true;
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    this.paredes = this.paredes.filter((w) => this.atualizarOnda(w, dt));
    this.aneis = this.aneis.filter((a) => this.atualizarAnel(a, dt));
    this.atualizarPocas(dt);
    for (const l of [this.b.jog, ...this.b.inimigos]) if (l.esperaEscudo > 0) l.esperaEscudo -= dt;
    for (const l of this.escudos) {
      const e = l.escudo;
      e.t -= dt;
      const naLuta = l === this.b.jog || this.b.inimigos.includes(l);
      if (e.t <= 0 || l.morto || !naLuta || !l.modelo.visible) { this.estourarEscudo(l); continue; }
      const pulso = 1 + Math.sin(this.b.t * 5) * 0.04;
      e.mesh.position.set(l.pos.x, l.altura * 0.45, l.pos.z);
      e.mesh.scale.set(l.raio * 1.7 * pulso, l.altura * 0.62 * pulso, l.raio * 1.7 * pulso);
    }
  }

  // Para os golpes que ainda vão sair (desmaiou, capturado, trocado...)
  parar(c, tirarEscudo = true) {
    this.paredes = this.paredes.filter((w) => {
      if (w.c !== c || w.mesh) return true; // a onda que já saiu continua
      return false;
    });
    if (tirarEscudo) this.estourarEscudo(c);
  }
}
