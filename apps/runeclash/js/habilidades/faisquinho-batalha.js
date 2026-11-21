// =============================================================
// LINHA DO FAISQUINHO NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em faisquinho.js)
//  - Marcas: raiozinhos amarelos girando em cima do alvo (até 3, por 6 s)
//  - Dash Elétrico: avança com uma aura de raios; marca quem passar perto (sem dano)
//  - Faísca / Relâmpago Marcador: tiro que marca; ativando de novo em até 4 s vira o
//    Choque: um raio liga o monstro aos marcados, acerta sempre e estoura as marcas
//  - Nuvens: ficam em volta do monstro soltando raios; quem está marcado leva o raio
//    direto (acerto garantido); sem marcados, o raio cai no chão perto dele (com aviso)
// Para ficar leve no celular: formas e materiais são criados uma vez só
// e reaproveitados; os raios somem em menos de 0,2 s.
// Etapa 3.1: os raios ganham os efeitos da Arena (js/arena/efeitos.js, em this.b.fx): o relâmpago
// com galhos que pisca por cima do raio sólido, clarões, faíscas que brilham, o chão que racha onde o
// raio cai, a faixa elétrica do Dash e o anel da marca. No Tempestor (a última forma), o brilho é
// roxo de tempestade (o tom trevoso).
// =============================================================
import * as THREE from 'three';
import { MARCAS } from './faisquinho.js';

// forma do raiozinho (o desenho clássico de raio), em pé, centrado
const perfilRaio = new THREE.Shape();
perfilRaio.moveTo(0.12, 0.5);
perfilRaio.lineTo(-0.2, 0.02);
perfilRaio.lineTo(0.02, 0.02);
perfilRaio.lineTo(-0.12, -0.5);
perfilRaio.lineTo(0.22, 0.06);
perfilRaio.lineTo(0, 0.06);
perfilRaio.lineTo(0.12, 0.5);
const GEO_RAIOZINHO = new THREE.ExtrudeGeometry(perfilRaio, { depth: 0.08, bevelEnabled: false }).translate(0, 0, -0.04);
const GEO_BRILHO = new THREE.IcosahedronGeometry(1, 1);
const GEO_SEG = new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5); // pedaço de raio (esticado de um ponto ao outro)
const GEO_FAISCA = new THREE.OctahedronGeometry(1, 0);
const GEO_NUVEM = new THREE.IcosahedronGeometry(1, 0);
const GEO_DISCO = new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.86, 1, 32).rotateX(-Math.PI / 2);
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1 }));
const AMARELO = basico('#ffe74c');
const MIOLO = basico('#ffffff');
const BRILHO = basico('#fff59a', 0.35);
const AURA = basico('#ffe74c', 0.55);
// nuvens claras (para não parecerem as pedras da arena), com sombra no chão para mostrar que estão no ar
const NUVEM = fixo(new THREE.MeshLambertMaterial({ color: '#eef2ff', emissive: '#6a7294', flatShading: true }));
const NUVEM_ESCURA = fixo(new THREE.MeshLambertMaterial({ color: '#a9b0d6', emissive: '#3a3f66', flatShading: true }));
const SOMBRA = basico('#000000', 0.22);
const MARCA_CHAO = {
  inimigo: { anel: basico('#ff3d5e', 0.8), disco: basico('#ff3d5e', 0.25) },
  jogador: { anel: basico('#ffe74c', 0.7), disco: basico('#ffe74c', 0.2) },
};
const COR_RAIO = '#f7e43a';
// brilho dos efeitos da Arena: amarelo; no Tempestor, roxo de tempestade
const BRILHO_RAIO = 0xfff08a, BRILHO_TEMPESTADE = 0xb49cff;
const C = (h) => new THREE.Color(h);
const FAISCA_CLARA = C('#fffbe0'), FAISCA_FIM = C('#ffd21a'), FAISCA_FIM_TEMPESTADE = C('#8a6cff');
const aviso = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });

export class HabilidadesFaisquinho {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.nuvens = [];  // nuvens soltando raios
    this.quedas = [];  // raios que vão cair no chão (com o círculo de aviso)
  }

  // Só a linha do Faisquinho usa estas habilidades
  dele(c) { return c.esp.linha === 'raio'; }
  naLuta(l) { return !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }

  // a cor do brilho da Arena para este monstro
  corDe(c) { return c?.esp?.estagio === 3 ? BRILHO_TEMPESTADE : BRILHO_RAIO; }

  // ---------- faíscas (partículas) ----------
  faisca(pos, vel, tam, vida) {
    if (this.b.poupar()) return; // Qualidade mais leve: só parte dos pedacinhos sai
    const m = new THREE.Mesh(GEO_FAISCA, Math.random() < 0.5 ? AMARELO : MIOLO);
    m.position.copy(pos);
    m.scale.set(tam * 0.5, tam * 0.5, tam * 1.6);
    m.lookAt(pos.x + vel.x, pos.y + vel.y, pos.z + vel.z);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      e.obj.position.addScaledVector(vel, dt);
      e.obj.scale.setScalar(tam * (1 - k));
    } });
  }
  // estalo: metade das faíscas de malha de antes e o dobro em faíscas da Arena (uma só malha para todas)
  estalo(pos, n, forca, y = 0.8, c = null) {
    const fim = c?.esp?.estagio === 3 ? FAISCA_FIM_TEMPESTADE : FAISCA_FIM;
    for (let i = 0; i < n * 2; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = new THREE.Vector3(Math.sin(a) * 4 * forca, (Math.random() * 2 + 0.5) * forca, Math.cos(a) * 4 * forca);
      if (i % 4 === 0) this.faisca(new THREE.Vector3(pos.x, y, pos.z), v, 0.14, 0.3);
      this.b.fx._ponto(pos.x, y, pos.z, v.x * 1.2, v.y, v.z * 1.2, FAISCA_CLARA, 0.3 + Math.random() * 0.2, 0.16, 5, { fim, solido: true });
    }
  }

  // ---------- raio desenhado de um ponto a outro (zigue-zague) ----------
  // Monta (ou reaproveita) um grupo de pedaços e estica de "de" até "ate"
  desenharRaio(g, de, ate, grossura, desvio) {
    const N = g.children.length / 2;
    const dir = new THREE.Vector3().subVectors(ate, de);
    const len = dir.length() || 0.01;
    const lado = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    if (lado.lengthSq() < 0.1) lado.set(1, 0, 0);
    let ant = de.clone();
    for (let i = 1; i <= N; i++) {
      const k = i / N;
      const p = de.clone().addScaledVector(dir, k);
      if (i < N) {
        const d = (Math.random() - 0.5) * desvio * Math.min(1, len / 3);
        p.addScaledVector(lado, d);
        p.y += (Math.random() - 0.5) * desvio * 0.6;
      }
      const l = ant.distanceTo(p) || 0.01;
      for (const [m, gr] of [[g.children[(i - 1) * 2], grossura], [g.children[(i - 1) * 2 + 1], grossura * 0.4]]) {
        m.position.copy(ant);
        m.lookAt(p);
        m.scale.set(gr, gr, l);
      }
      ant = p;
    }
  }
  grupoRaio(n) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) g.add(new THREE.Mesh(GEO_SEG, AMARELO), new THREE.Mesh(GEO_SEG, MIOLO));
    return g;
  }
  // um raio rápido que pisca e some
  // dono = o monstro que soltou (para a cor do brilho)
  raioRapido(de, ate, grossura = 0.12, vida = 0.18, dono = null) {
    this.b.fx.relampago([de.x, de.y, de.z], [ate.x, ate.y, ate.z], this.corDe(dono), vida + 0.08, { larg: grossura * 1.8, galhos: 2 });
    const g = this.grupoRaio(7);
    this.desenharRaio(g, de, ate, grossura, 0.9);
    this.cena.add(g);
    this.b.efeitos.push({ obj: g, vida, total: vida, upd: (e, k) => {
      if (k > 0.5 && !e.redesenhou) { e.redesenhou = true; this.desenharRaio(e.obj, de, ate, grossura * 0.7, 0.9); }
    } });
  }

  // ---------- Marcas ----------
  marcar(alvo) {
    if (!this.naLuta(alvo)) return;
    if (!alvo.marcas) {
      const g = new THREE.Group();
      for (let i = 0; i < MARCAS.maximo; i++) {
        const m = new THREE.Mesh(GEO_RAIOZINHO, AMARELO);
        m.scale.setScalar(0.55);
        g.add(m);
      }
      this.cena.add(g);
      alvo.marcas = { n: 0, t: 0, mesh: g };
    }
    const M = alvo.marcas;
    M.n = Math.min(MARCAS.maximo, M.n + 1);
    M.t = MARCAS.duracao; // cada marca nova renova o tempo
    this.b.jogo.numero(`Marca ×${M.n}`, alvo.pos.clone().setY(alvo.altura + 0.4), COR_RAIO, 'pequeno');
    this.estalo(alvo.pos, 6, 0.5, alvo.altura * 0.6);
    this.b.fx.onda(alvo.pos.x, alvo.pos.z, alvo.raio + 1, BRILHO_RAIO, 0.3);
  }

  tirarMarcas(alvo) {
    if (!alvo.marcas) return;
    this.cena.remove(alvo.marcas.mesh);
    alvo.marcas = null;
  }

  bonusDe(n) { return MARCAS.bonus[Math.max(0, Math.min(MARCAS.bonus.length, n) - 1)] ?? 1; }

  atualizarMarcas(dt) {
    for (const l of [this.b.jog, ...this.b.inimigos]) {
      const M = l.marcas;
      if (!M) continue;
      M.t -= dt;
      if (M.t <= 0 || !this.naLuta(l)) { this.tirarMarcas(l); continue; }
      // os raiozinhos giram em roda em cima da cabeça; pisca no último segundo
      M.mesh.position.set(l.pos.x, l.altura + 0.35, l.pos.z);
      M.mesh.visible = M.t > 1 || Math.sin(this.b.t * 20) > 0;
      M.mesh.children.forEach((m, i) => {
        m.visible = i < M.n;
        const a = this.b.t * 3 + (i / Math.max(1, M.n)) * Math.PI * 2;
        const r = M.n > 1 ? 0.45 * l.escala : 0;
        m.position.set(Math.sin(a) * r, Math.sin(this.b.t * 6 + i) * 0.06, Math.cos(a) * r);
        m.rotation.y = this.b.t * 4;
      });
    }
  }

  // ---------- Dash Elétrico ----------
  iniciarDash(c, gp, dir, efeito) {
    const D = gp.dashRaio;
    c.dash = { dir: dir.clone(), t: D.duracao, vel: D.distancia / D.duracao, dashRaio: gp, efeito, marcados: new Set() };
    // aura: faíscas girando em volta dele durante o dash
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(GEO_RAIOZINHO, AMARELO); m.scale.setScalar(0.7); g.add(m); }
    const anel = new THREE.Mesh(GEO_ANEL, AURA);
    anel.scale.setScalar(D.aura);
    g.add(anel);
    this.cena.add(g);
    c.auraDash = g;
    g.userData.ini = c.pos.clone(); // para a faixa elétrica no fim
    g.userData.prox = 0;
    this.estalo(c.pos, 8, 0.6, c.altura * 0.5, c);
  }

  atualizarDash(c) {
    const ds = c.dash, D = ds.dashRaio.dashRaio, g = c.auraDash;
    if (g) {
      g.position.set(c.pos.x, 0.08, c.pos.z);
      g.children.forEach((m, i) => {
        if (m.geometry === GEO_ANEL) return;
        const a = this.b.t * 18 + (i / 6) * Math.PI * 2;
        m.position.set(Math.sin(a) * D.aura * 0.9, c.altura * 0.5, Math.cos(a) * D.aura * 0.9);
        m.rotation.y = a;
      });
    }
    // raios curtos pulando do corpo para o chão em volta (efeito da Arena)
    if (g && this.b.t >= g.userData.prox) {
      g.userData.prox = this.b.t + 0.05;
      const a = Math.random() * Math.PI * 2, r = D.aura * (0.6 + Math.random() * 0.5);
      this.b.fx.relampago([c.pos.x, c.altura * 0.6, c.pos.z], [c.pos.x + Math.sin(a) * r, 0.05, c.pos.z + Math.cos(a) * r], this.corDe(c), 0.14, { larg: 0.09, galhos: 1 });
    }
    // rastro de faíscas
    if (Math.random() < 0.8) this.faisca(new THREE.Vector3(c.pos.x, c.altura * 0.5, c.pos.z), new THREE.Vector3((Math.random() - 0.5) * 2, 1, (Math.random() - 0.5) * 2), 0.16, 0.35);
    // marca quem passar perto (cada um uma vez por dash); não causa dano
    for (const o of this.b.alvosDe(c)) {
      if (ds.marcados.has(o)) continue;
      if (Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) > D.aura + o.raio) continue;
      ds.marcados.add(o);
      if (o.invul > 0) { this.b.jogo.numero('Esquivou!', o.pos.clone().setY(o.altura), '#ffffff', 'pequeno'); continue; }
      this.marcar(o);
      this.raioRapido(new THREE.Vector3(c.pos.x, c.altura * 0.5, c.pos.z), new THREE.Vector3(o.pos.x, o.altura * 0.5, o.pos.z), 0.08, 0.18, c);
      // Tempestor: o dash também pode paralisar
      if (ds.efeito && Math.random() < ds.efeito.chance) this.b.aplicarEfeito(o, ds.efeito.nome, ds.efeito.dur, c);
    }
  }

  fimDash(c) {
    if (!c.auraDash) return;
    // faixa elétrica no chão por onde ele passou
    const ini = c.auraDash.userData.ini;
    if (ini && Math.hypot(c.pos.x - ini.x, c.pos.z - ini.z) > 0.5) {
      this.b.fx.faixa([ini.x, ini.z], [c.pos.x, c.pos.z], 1.1, this.corDe(c), 0.5);
      this.estalo(c.pos, 4, 0.5, c.altura * 0.4, c);
    }
    this.cena.remove(c.auraDash);
    c.auraDash = null;
  }

  // Aviso do inimigo: faixa do tamanho do dash e da aura
  avisoDash(c, gp, dir, cor) {
    const D = gp.dashRaio;
    const m = new THREE.Mesh(GEO_FAIXA, aviso(cor, 0.3));
    m.scale.set(D.aura * 2, 1, D.distancia + D.aura);
    m.position.set(c.pos.x, 0.06, c.pos.z);
    m.rotation.y = Math.atan2(dir.x, dir.z);
    m.userData = { faixa: true };
    this.cena.add(m);
    return m;
  }

  // ---------- Faísca Marcadora (o tiro) ----------
  projetil(gp, ang, fator) {
    const g = new THREE.Group();
    const r = new THREE.Mesh(GEO_RAIOZINHO, AMARELO);
    r.scale.setScalar(gp.raio * 2.4);
    const b = new THREE.Mesh(GEO_BRILHO, BRILHO);
    b.scale.setScalar(gp.raio * 1.1);
    g.add(r, b);
    g.rotation.y = ang;
    if (fator < 1) g.scale.setScalar(0.85);
    return g;
  }

  atualizarProjetil(p, dt) {
    p.mesh.children[0].rotation.z += dt * 25; // gira e treme como faísca
    p.mesh.children[1].scale.setScalar(p.gp.raio * (1 + Math.random() * 0.4));
    if (Math.random() < 0.25) this.faisca(p.pos.clone(), new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3), 0.1, 0.2);
    const fim = p.dono?.esp?.estagio === 3 ? FAISCA_FIM_TEMPESTADE : FAISCA_FIM;
    for (let i = 0; i < 3; i++) this.b.fx._ponto(p.pos.x, p.pos.y, p.pos.z, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3, FAISCA_CLARA, 0.25, 0.18, 0, { fim, solido: true });
  }

  // O tiro acertou: marca e deixa o Choque pronto (o botão muda de nome)
  aoAcertarTiro(p, alvo) {
    const c = p.dono;
    this.marcar(alvo);
    this.estalo(p.pos, 8, 0.6, p.pos.y, c);
    this.b.fx.clarao(p.pos.x, p.pos.y, p.pos.z, this.corDe(c), 0.45, 0.25);
    if (!this.naLuta(c) || !p.gp.marca) return;
    c.choque = { gp: p.gp, t: p.gp.marca.janela };
    c.rec[1] = 0;
  }

  // Recarga normal do tiro (o inimigo tem recarga maior, como em todos os golpes)
  recargaDe(c, gp) { return gp.recarga * (c.lado === 'inimigo' ? (c.furia ? 0.95 : 1.4) : 1); }

  // ---------- Choque ----------
  // Liga o monstro aos marcados (o mais marcado primeiro), pulando de um para o outro.
  // Acerto garantido, em qualquer distância. Estoura as marcas.
  usarChoque(c, gp) {
    const C = gp.marca.choque;
    c.choque = null;
    c.rec[1] = this.recargaDe(c, gp);
    const marcados = this.b.alvosDe(c).filter((o) => o.marcas?.n > 0)
      .sort((a, b) => b.marcas.n - a.marcas.n || Math.hypot(a.pos.x - c.pos.x, a.pos.z - c.pos.z) - Math.hypot(b.pos.x - c.pos.x, b.pos.z - c.pos.z))
      .slice(0, C.alvos);
    if (!marcados.length) { this.b.jogo.numero('Sem marcas', c.pos.clone().setY(c.altura), '#ffffff', 'pequeno'); return; }
    const alvos = marcados.map((o) => {
      const mult = this.bonusDe(o.marcas.n);
      if (o.marcas.n > 1) this.b.jogo.numero(`+${Math.round((mult - 1) * 100)}%`, o.pos.clone().setY(o.altura + 0.9), COR_RAIO, 'pequeno');
      this.tirarMarcas(o); // o Choque estoura as marcas
      return { o, mult };
    });
    const g = this.grupoRaio(6 * alvos.length);
    this.cena.add(g);
    c.feixe = { gp, C, alvos, t: 0, tick: 0, ticks: 0, mesh: g, efeito: this.b.efeitoDoGolpe(c, gp), sorteados: new Set(), arena: 0 };
    this.estalo(c.pos, 10, 0.8, c.altura * 0.5, c);
    this.b.fx.onda(c.pos.x, c.pos.z, c.raio + 1.5, this.corDe(c), 0.35);
  }

  atualizarFeixe(c, dt) {
    const F = c.feixe, C = F.C;
    F.t += dt;
    const vivos = F.alvos.filter((a) => this.naLuta(a.o));
    if (!vivos.length || F.t >= C.duracao) { this.pararFeixe(c); return; }
    // desenha: monstro -> 1º marcado -> 2º -> 3º
    let de = new THREE.Vector3(c.pos.x, c.altura * 0.55, c.pos.z);
    const n = 6;
    F.arena -= dt;
    const piscar = F.arena <= 0;
    if (piscar) F.arena = 0.08;
    F.mesh.children.forEach((m) => { m.visible = false; });
    vivos.forEach((a, i) => {
      const ate = new THREE.Vector3(a.o.pos.x, a.o.altura * 0.55, a.o.pos.z);
      const sub = { children: F.mesh.children.slice(i * n * 2, (i + 1) * n * 2) };
      sub.children.forEach((m) => { m.visible = true; });
      this.desenharRaio(sub, de, ate, 0.14, 1.1);
      if (piscar) this.b.fx.relampago([de.x, de.y, de.z], [ate.x, ate.y, ate.z], this.corDe(c), 0.12, { larg: 0.28, galhos: 2 });
      de = ate;
    });
    if (vivos.length) c.angAlvo = Math.atan2(vivos[0].o.pos.x - c.pos.x, vivos[0].o.pos.z - c.pos.z);
    // dano em 4 pedaços ao longo da ligação
    const TICKS = 4;
    if (F.t >= F.tick && F.ticks < TICKS) {
      F.ticks++;
      F.tick += C.duracao / TICKS;
      for (const a of vivos) {
        const o = a.o;
        const primeiro = !F.sorteados.has(o);
        F.sorteados.add(o);
        const dir = new THREE.Vector3(o.pos.x - c.pos.x, 0, o.pos.z - c.pos.z).normalize();
        this.b.aplicarDano(c, o, F.gp, dir, { fator: (C.poder / F.gp.poder) * a.mult / TICKS, efeito: primeiro ? F.efeito : null, leve: true, primeiro, garantido: true, empurrao: 0 });
        this.estalo(o.pos, 3, 0.4, o.altura * 0.5, c);
        this.b.fx.clarao(o.pos.x, o.altura * 0.55, o.pos.z, this.corDe(c), 0.4, 0.2);
      }
    }
  }

  pararFeixe(c) {
    if (!c.feixe) return;
    this.cena.remove(c.feixe.mesh);
    c.feixe = null;
  }

  // Nome do botão do disparo: "Choque" enquanto ele está pronto
  nomeBotao(c, gp) { return gp.marca && c.choque ? 'Choque' : gp.nome; }

  // ---------- Nuvens ----------
  iniciarNuvens(c, gp, efeito) {
    const N = gp.nuvens;
    // a paralisia dos raios das nuvens é mais curta (para ninguém ficar travado sem parar)
    const ef = efeito ? { nome: efeito.nome, chance: efeito.chance, dur: N.paralisia } : null;
    for (let i = 0; i < N.quantidade; i++) {
      const g = new THREE.Group();
      const mat = c.esp.estagio === 3 ? NUVEM_ESCURA : NUVEM;
      for (const [x, y, z, s] of [[0, 0, 0, 0.42], [0.36, -0.06, 0, 0.32], [-0.34, -0.05, 0.06, 0.3], [0.05, 0.12, -0.2, 0.28]]) {
        const m = new THREE.Mesh(GEO_NUVEM, mat);
        m.position.set(x, y, z);
        m.scale.setScalar(s);
        g.add(m);
      }
      // faíscas presas na barriga da nuvem
      for (let k = 0; k < 2; k++) { const r = new THREE.Mesh(GEO_RAIOZINHO, AMARELO); r.scale.setScalar(0.45); r.position.set(k ? 0.2 : -0.18, -0.3, 0.15); g.add(r); }
      g.scale.setScalar(0.01);
      const sombra = new THREE.Mesh(GEO_DISCO, SOMBRA);
      this.cena.add(g, sombra);
      // as nuvens se revezam: cada uma solta o 1º raio num tempo diferente
      this.nuvens.push({ c, gp, efeito: ef, mesh: g, sombra, flash: 0, i, n: N.quantidade, t: 0, prox: 0.4 + (i * N.intervalo) / N.quantidade, vez: i });
    }
    this.estalo(c.pos, 12, 0.8, c.altura + 0.6, c);
    this.b.fx.particulas({ x: c.pos.x, y: c.altura + 0.7, z: c.pos.z, n: 24, raio: 1.3 + c.raio, cor: c.esp.estagio === 3 ? 0x9a8cd8 : 0xe8ecff, vel: 1, cima: 0.3, grav: 0, vida: 0.6, tam: 0.4 });
  }

  posNuvem(z) {
    const c = z.c, a = this.b.t * 0.9 + (z.i / z.n) * Math.PI * 2;
    const r = 1.3 + c.raio;
    return new THREE.Vector3(c.pos.x + Math.sin(a) * r, c.altura + 0.7 + Math.sin(this.b.t * 2 + z.i) * 0.1, c.pos.z + Math.cos(a) * r);
  }

  atualizarNuvens(dt) {
    for (let k = this.nuvens.length - 1; k >= 0; k--) {
      const z = this.nuvens[k], N = z.gp.nuvens;
      z.t += dt;
      const fim = z.t >= N.duracao || !this.naLuta(z.c);
      // aparece rápido, balança e some no fim
      const s = Math.min(1, z.t / 0.25) * Math.min(1, Math.max(0, (N.duracao - z.t) / 0.3));
      z.flash = Math.max(0, z.flash - dt);
      z.mesh.scale.setScalar(Math.max(0.01, s * 1.25 * (1 + z.flash * 1.5))); // incha um pouco ao soltar o raio
      z.mesh.position.copy(this.posNuvem(z));
      z.sombra.position.set(z.mesh.position.x, 0.06, z.mesh.position.z);
      z.sombra.scale.setScalar(Math.max(0.01, 0.6 * s));
      if (fim) { this.cena.remove(z.mesh, z.sombra); this.nuvens.splice(k, 1); continue; }
      z.prox -= dt;
      if (z.prox > 0) continue;
      z.prox = N.intervalo;
      this.soltarRaio(z);
    }
  }

  // Cada raio: vai direto num marcado (acerto garantido, sem gastar a marca) ou cai no chão perto dele
  soltarRaio(z) {
    const c = z.c, N = z.gp.nuvens, de = z.mesh.position.clone().setY(z.mesh.position.y - 0.25);
    z.flash = 0.15;
    const marcados = this.b.alvosDe(c).filter((o) => o.marcas?.n > 0);
    if (marcados.length) {
      // as nuvens se revezam entre os marcados
      const o = marcados[z.vez++ % marcados.length];
      const ate = new THREE.Vector3(o.pos.x, o.altura * 0.6, o.pos.z);
      this.raioRapido(de, ate, 0.13, 0.18, c);
      this.b.efeitoAnel(o.pos, o.raio + 0.4, COR_RAIO);
      this.b.fx.clarao(de.x, de.y, de.z, this.corDe(c), 0.35, 0.2);
      this.b.fx.clarao(ate.x, ate.y, ate.z, this.corDe(c), 0.5, 0.25);
      const dir = new THREE.Vector3(o.pos.x - c.pos.x, 0, o.pos.z - c.pos.z).normalize();
      this.b.aplicarDano(c, o, z.gp, dir, { fator: this.bonusDe(o.marcas.n), efeito: z.efeito, garantido: true, empurrao: 0 });
      return;
    }
    // ninguém marcado: o raio cai num ponto perto do monstro, com o círculo de aviso antes
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * N.espalha;
    const p = new THREE.Vector3(c.pos.x + Math.sin(a) * r, 0, c.pos.z + Math.cos(a) * r);
    const M = MARCA_CHAO[c.lado === 'inimigo' ? 'inimigo' : 'jogador'];
    const g = new THREE.Group();
    const anel = new THREE.Mesh(GEO_ANEL, M.anel), disco = new THREE.Mesh(GEO_DISCO, M.disco);
    anel.scale.setScalar(N.area);
    g.add(anel, disco);
    g.position.set(p.x, 0.07, p.z);
    this.cena.add(g);
    this.quedas.push({ z, c, p, g, disco, t: 0, total: 0.4 });
  }

  atualizarQuedas(dt) {
    for (let k = this.quedas.length - 1; k >= 0; k--) {
      const q = this.quedas[k], N = q.z.gp.nuvens;
      q.t += dt;
      q.disco.scale.setScalar(Math.max(0.01, N.area * Math.min(1, q.t / q.total)));
      if (q.t < q.total) continue;
      this.cena.remove(q.g);
      this.quedas.splice(k, 1);
      const de = q.z.mesh.position.clone();
      this.raioRapido(this.naLuta(q.c) ? de : q.p.clone().setY(6), q.p.clone().setY(0.05), 0.13, 0.18, q.c);
      this.b.efeitoAnel(q.p, N.area, COR_RAIO);
      this.estalo(q.p, 6, 0.6, 0.2, q.c);
      this.b.fx.clarao(q.p.x, 0.4, q.p.z, this.corDe(q.c), 0.55, 0.3);
      this.b.fx.rachadura(q.p.x, q.p.z, N.area * 1.1, this.corDe(q.c), 0.8);
      for (const o of this.b.alvosDe(q.c)) {
        const dx = o.pos.x - q.p.x, dz = o.pos.z - q.p.z, d = Math.hypot(dx, dz);
        if (d > N.area + o.raio * 0.5) continue;
        this.b.aplicarDano(q.c, o, q.z.gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), { efeito: q.z.efeito, empurrao: 1 });
      }
    }
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    this.atualizarMarcas(dt);
    this.atualizarNuvens(dt);
    this.atualizarQuedas(dt);
    for (const l of [this.b.jog, ...this.b.inimigos]) {
      // a janela do Choque passa; se acabar sem usar, começa a recarga normal do tiro
      if (l.choque) {
        l.choque.t -= dt;
        if (l.choque.t <= 0) { l.rec[1] = this.recargaDe(l, l.choque.gp); l.choque = null; }
      }
      if (l.feixe) this.atualizarFeixe(l, dt);
      if (l.auraDash && !l.dash?.dashRaio) this.fimDash(l);
    }
  }

  // Para o que ainda está saindo (desmaiou, capturado, trocado...). As nuvens somem sozinhas quando o dono sai.
  // tirarMarca = false quando só a captura começou (as marcas ficam se ele escapar do cristal)
  parar(c, tirarMarca = true) {
    this.pararFeixe(c);
    this.fimDash(c);
    if (c.choque) { c.choque = null; c.rec[1] = this.recargaDe(c, c.golpe(1)); }
    if (tirarMarca) this.tirarMarcas(c);
  }
}
