// =============================================================
// BATALHA EM TEMPO REAL
// Você controla seu monstro com o joystick e usa 3 golpes + esquiva.
// O inimigo "avisa" antes de atacar (área vermelha no chão): saia dela
// ou use a Esquiva, que deixa você invulnerável por um instante.
// Golpe 1 = corpo a corpo | Golpe 2 = disparo | Golpe 3 = área
// =============================================================
import * as THREE from 'three';
import {
  ESPECIES, GOLPES, ELEMENTOS, EFEITOS, EFEITO_DO_ELEMENTO, PODER_DISPARO_EXTRA, DURACAO_EFEITO_PERTO,
  multiplicador, chanceCaptura, melhoriaDe, statsDe, modificadorArena, fatorDanoNivel,
} from './dados.js';
import { criarModelo, criarCristal, animarModelo, piscar, descartar } from './modelos.js';
import { Arena, RAIO_ARENA } from './arena.js';

export { RAIO_ARENA };

const GEO_PARTICULA = new THREE.IcosahedronGeometry(0.12, 0);
const GEO_PROJ = {
  fogo: new THREE.IcosahedronGeometry(0.32, 0),
  agua: new THREE.SphereGeometry(0.3, 8, 6),
  planta: new THREE.OctahedronGeometry(0.25, 0),
  normal: new THREE.IcosahedronGeometry(0.28, 0),
  terra: new THREE.DodecahedronGeometry(0.32, 0),
  raio: new THREE.OctahedronGeometry(0.22, 0),
  sol: new THREE.IcosahedronGeometry(0.34, 1),
  lua: new THREE.TorusGeometry(0.26, 0.07, 4, 10, Math.PI * 1.2),
  luz: new THREE.OctahedronGeometry(0.26, 0),
  trevas: new THREE.SphereGeometry(0.32, 8, 6),
};
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
const GEO_DISCO = new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.9, 1, 40).rotateX(-Math.PI / 2);

function matBrilho(cor, opacidade = 0.4) {
  return new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: opacidade, depthWrite: false });
}

function lerpAngulo(a, b, k) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}

function dist(a, b) {
  return Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z);
}

// Um monstro dentro da batalha
class Lutador {
  constructor(dados, lado) {
    this.dados = dados;
    this.lado = lado;
    this.esp = ESPECIES[dados.especie];
    this.stats = statsDe(dados.especie, dados.nivel);
    this.modelo = criarModelo(dados.especie);
    this.pos = new THREE.Vector3();
    this.ang = 0;
    this.angAlvo = 0;
    this.rec = [0, 0, 0];
    this.cdEsq = 0;
    this.invul = 0;
    this.prep = null;
    this.lento = 0;
    this.stun = 0;
    this.emp = new THREE.Vector3();
    this.dash = null;
    this.flash = 0;
    this.morto = dados.hp <= 0;
    this.movendo = false;
    this.brilhando = false;
    this.melhoria = melhoriaDe(dados.especie);
    this.status = {};     // efeitos negativos ativos: { paralisia: segundosRestantes, ... }
    this.tickFogo = 0;
    this.visT = 0;
    this.rajada = null;   // disparos extras na fila
  }
  get raio() { return this.esp.raio; }
  get frac() { return this.dados.hp / this.stats.hpMax; }
  golpe(i) { return GOLPES[this.esp.golpes[i]]; }
  tem(efeito) { return this.status[efeito] > 0; }
  podeAndar() { return !this.tem('paralisia') && !this.tem('sono') && !this.tem('enraizado'); }
  podeAtacar() { return !this.tem('paralisia') && !this.tem('sono') && !this.tem('medo'); }
  get fatorVel() { return (this.lento > 0 ? 0.5 : 1) * (this.tem('encharcado') ? 0.55 : 1) * (this.mod?.vel ?? 1); }
}

export class Batalha {
  constructor(jogo, selvagem, idxInicial) {
    this.jogo = jogo;
    this.selvagem = selvagem;
    this.zona = selvagem.zona;
    this.cena = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, jogo.aspecto, 0.1, 200);
    this.efeitos = [];
    this.arena = new Arena(this);
    this.periodo = jogo.mundo.periodo;

    this.idx = idxInicial;
    this.jog = new Lutador(jogo.estado.equipe[idxInicial], 'jogador');
    this.ini = new Lutador(selvagem.dados, 'inimigo');
    this.jog.pos.set(0, 0, 5);
    this.jog.ang = this.jog.angAlvo = Math.PI;
    this.ini.pos.set(0, 0, -5);
    this.cena.add(this.jog.modelo, this.ini.modelo);
    this.aplicarModArena(this.jog);
    this.aplicarModArena(this.ini);

    this.projeteis = [];
    this.captura = null;
    this.fim = null;
    this.t = 0;
    this.trocaCd = 0;
    this.trocaAuto = 0;
    this.ia = { t: 0.8, strafe: 1, troca: 1 };
    this.posicionarCamera(1);
    this.montarHud();
    jogo.aviso(`Um ${this.ini.esp.nome} selvagem apareceu!`);
    if (this.arena.cfg.descricaoPerigo) jogo.aviso(this.arena.cfg.descricaoPerigo);
  }

  // Bônus ou penalidade que a arena (e o dia/noite) dão ao monstro
  aplicarModArena(l) {
    l.mod = modificadorArena(this.arena.zona, l.esp.elemento, this.periodo);
  }

  // Dano do cenário (pedras, raios): uma fração da vida máxima
  danoAmbiente(l, fracao, cor) {
    if (l.morto || l.invul > 0) return;
    const dano = Math.max(1, Math.round(l.stats.hpMax * fracao));
    l.dados.hp = Math.max(0, l.dados.hp - dano);
    l.flash = 0.18;
    l.stun = 0.25;
    if (l.tem('sono')) l.status.sono = 0;
    this.jogo.numero(String(dano), l.pos.clone().setY(l.esp.altura), cor, '');
    if (l.dados.hp <= 0) this.desmaiar(l);
  }

  curar(l, fracao) {
    if (l.morto || l.dados.hp >= l.stats.hpMax) return;
    const cura = Math.max(1, Math.round(l.stats.hpMax * fracao));
    l.dados.hp = Math.min(l.stats.hpMax, l.dados.hp + cura);
    this.jogo.numero('+' + cura, l.pos.clone().setY(l.esp.altura), '#5fe08a', 'pequeno');
  }

  posicionarCamera(k) {
    const meio = new THREE.Vector3().addVectors(this.jog.pos, this.ini.pos).multiplyScalar(0.5);
    // A câmera se afasta quando os monstros ficam longe um do outro
    const afast = Math.min(10, Math.max(0, dist(this.jog, this.ini) - 4)) * 0.07 + 1;
    const off = this.jogo.aspecto < 1 ? new THREE.Vector3(0, 12.5, 11.5) : new THREE.Vector3(0, 7.5, 8.5);
    off.multiplyScalar(afast);
    this.camera.position.lerp(meio.clone().add(off), k);
    this.camera.lookAt(meio.x, 0.8, meio.z);
  }

  // ---------- quadro a quadro ----------
  atualizar(dt, ctrl) {
    this.t += dt;
    const j = this.jog, e = this.ini;
    this.trocaCd = Math.max(0, this.trocaCd - dt);
    const liberado = this.t > 0.9;

    if (!this.fim && liberado) {
      if (ctrl.consumir('fugir')) this.fugir();
      if (ctrl.consumir('cristal')) this.lancarCristal();
      if (ctrl.consumir('trocar')) this.trocar(false);
    }
    const podeAgir = !this.fim && !this.captura && liberado;
    if (podeAgir && !j.morto) this.controlarJogador(j, e, ctrl.vetor(), dt, ctrl);
    if (podeAgir && !e.morto && !j.morto) this.pensarIA(e, j, dt);

    this.fisica(this.jog, this.ini, dt);
    this.fisica(this.ini, this.jog, dt);
    // não deixa os dois ocuparem o mesmo lugar
    const d = dist(this.jog, this.ini), min = this.jog.raio + this.ini.raio;
    if (d < min && d > 0.001 && !this.ini.morto && this.ini.modelo.visible) {
      const ex = (this.jog.pos.x - this.ini.pos.x) / d, ez = (this.jog.pos.z - this.ini.pos.z) / d, f = (min - d) / 2;
      this.jog.pos.x += ex * f; this.jog.pos.z += ez * f;
      this.ini.pos.x -= ex * f; this.ini.pos.z -= ez * f;
    }

    this.atualizarProjeteis(dt);
    this.arena.atualizar(dt, this.t);
    this.atualizarEfeitos(dt);
    if (this.captura) this.atualizarCaptura(dt);

    if (this.trocaAuto > 0) {
      this.trocaAuto -= dt;
      if (this.trocaAuto <= 0) this.trocar(true);
    }
    if (this.fim && !this.fim.feito) {
      this.fim.t -= dt;
      if (this.fim.t <= 0) {
        this.fim.feito = true;
        this.jogo.terminarBatalha(this.fim.tipo, this);
        return;
      }
    }
    this.posicionarCamera(1 - Math.exp(-4 * dt));
    this.atualizarHud();
  }

  controlarJogador(j, e, v, dt, ctrl) {
    const mov = Math.hypot(v.x, v.z) > 0.05;
    for (let i = 0; i < 3; i++) if (ctrl.consumir('golpe' + i)) this.tentarGolpe(j, i, e);
    if (ctrl.consumir('esquiva')) this.esquivar(j, mov ? v : null, e);
    if (!j.dash && j.stun <= 0 && j.podeAndar()) {
      const vel = j.stats.vel * j.fatorVel * (j.prep ? 0.35 : 1);
      j.pos.x += v.x * vel * dt;
      j.pos.z += v.z * vel * dt;
      j.movendo = mov;
      if (j.prep) j.angAlvo = Math.atan2(j.prep.dir.x, j.prep.dir.z);
      else if (mov) j.angAlvo = Math.atan2(v.x, v.z);
    }
  }

  // Inteligência do monstro selvagem
  pensarIA(e, j, dt) {
    const ia = this.ia;
    ia.t -= dt;
    ia.troca -= dt;
    const d = dist(e, j);
    if (ia.troca <= 0) { ia.strafe = Math.random() < 0.5 ? -1 : 1; ia.troca = 1.5 + Math.random() * 2; }
    if (ia.t <= 0 && !e.prep && !e.dash && e.stun <= 0 && e.podeAtacar()) {
      ia.t = 0.3 + Math.random() * 0.4;
      const opcoes = [];
      for (let i = 0; i < 3; i++) {
        if (e.rec[i] > 0) continue;
        const gp = e.golpe(i);
        if (gp.tipo === 'area' && d < gp.raio * 0.85) opcoes.push(i, i, i);
        if (gp.tipo === 'corpo' && d < gp.alcance + 1.2) opcoes.push(i, i);
        if (gp.tipo === 'projetil' && d > 2.5 && d < 12) opcoes.push(i);
      }
      if (opcoes.length && Math.random() < 0.75) this.tentarGolpe(e, opcoes[Math.floor(Math.random() * opcoes.length)], j);
    }
    if (!e.dash && e.stun <= 0 && e.podeAndar()) {
      const ax = (j.pos.x - e.pos.x) / (d || 1), az = (j.pos.z - e.pos.z) / (d || 1);
      // distância preferida depende de qual golpe está pronto
      const prefere = e.rec[0] <= 0.2 ? 1.8 : (e.rec[1] <= 0.3 ? 6 : 4.5);
      let fx = 0, fz = 0;
      if (d > prefere + 0.5) { fx += ax; fz += az; } else if (d < prefere - 0.5) { fx -= ax; fz -= az; }
      fx += -az * ia.strafe * 0.7;
      fz += ax * ia.strafe * 0.7;
      let l = Math.hypot(fx, fz) || 1;
      // se há um obstáculo logo à frente, desvia para o lado
      if (this.arena.bloqueia({ x: e.pos.x + (fx / l) * 1.8, z: e.pos.z + (fz / l) * 1.8 }, e.raio)) {
        const ang = ia.strafe * 1.2, cs = Math.cos(ang), sn = Math.sin(ang);
        [fx, fz] = [fx * cs - fz * sn, fx * sn + fz * cs];
        l = Math.hypot(fx, fz) || 1;
      }
      const vel = e.stats.vel * 0.85 * e.fatorVel * (e.prep ? 0.2 : 1);
      e.pos.x += (fx / l) * vel * dt;
      e.pos.z += (fz / l) * vel * dt;
      e.movendo = true;
      e.angAlvo = e.prep ? Math.atan2(e.prep.dir.x, e.prep.dir.z) : Math.atan2(ax, az);
    }
  }

  tentarGolpe(c, i, alvo) {
    if (c.prep || c.rec[i] > 0 || c.stun > 0 || c.dash || c.morto || c.rajada) return;
    if (!c.podeAtacar()) {
      // avisa o jogador por que o golpe não saiu
      if (c.lado === 'jogador' && this.t - (this.avisoBloqueio || 0) > 0.8) {
        this.avisoBloqueio = this.t;
        const nome = c.tem('medo') ? 'Com medo!' : c.tem('sono') ? 'Dormindo!' : 'Paralisado!';
        this.jogo.numero(nome, c.pos.clone().setY(c.esp.altura), '#ffffff', 'pequeno');
      }
      return;
    }
    const gp = c.golpe(i);
    const inimigo = c.lado === 'inimigo';
    c.rec[i] = gp.recarga * (inimigo ? 1.4 : 1);
    let prep = gp.tipo === 'area' ? 0.35 : gp.tipo === 'corpo' ? 0.1 : 0.06;
    if (inimigo) prep = prep * 2 + 0.35; // o inimigo demora mais: tempo para você reagir
    const dir = new THREE.Vector3(alvo.pos.x - c.pos.x, 0, alvo.pos.z - c.pos.z);
    if (dir.lengthSq() < 1e-4) dir.set(Math.sin(c.ang), 0, Math.cos(c.ang));
    dir.normalize();
    c.prep = { gp, t: prep, total: prep, dir, aviso: this.criarAviso(c, gp, dir, inimigo) };
    c.angAlvo = Math.atan2(dir.x, dir.z);
  }

  criarAviso(c, gp, dir, inimigo) {
    const cor = inimigo ? '#ff3d5e' : ELEMENTOS[gp.elemento].cor;
    if (gp.tipo === 'area') {
      const g = new THREE.Group();
      const anel = new THREE.Mesh(GEO_ANEL, matBrilho(cor, 0.75));
      anel.scale.setScalar(gp.raio);
      const disco = new THREE.Mesh(GEO_DISCO, matBrilho(cor, 0.25));
      g.add(anel, disco);
      g.userData = { disco, raio: gp.raio, segue: true };
      g.position.set(c.pos.x, 0.06, c.pos.z);
      this.cena.add(g);
      return g;
    }
    if (!inimigo) return null;
    const comp = gp.tipo === 'corpo' ? gp.alcance + 2.2 : 12;
    const larg = gp.tipo === 'corpo' ? 1.4 : (gp.quantidade > 1 ? 2.6 : 1);
    const m = new THREE.Mesh(GEO_FAIXA, matBrilho(cor, 0.3));
    m.scale.set(larg, 1, comp);
    m.position.set(c.pos.x, 0.06, c.pos.z);
    m.rotation.y = Math.atan2(dir.x, dir.z);
    m.userData = { faixa: true };
    this.cena.add(m);
    return m;
  }

  removerAviso(c) {
    if (c.prep?.aviso) this.cena.remove(c.prep.aviso);
  }

  cancelarPreparo(c) {
    this.removerAviso(c);
    c.prep = null;
    piscar(c.modelo, 0);
    c.brilhando = false;
  }

  // Efeito que um golpe causa, conforme a evolução do monstro (ou null)
  efeitoDoGolpe(c, gp) {
    const nome = EFEITO_DO_ELEMENTO[c.esp.elemento];
    const m = c.melhoria;
    if (!nome || gp.elemento === 'normal') return null;
    if (gp.tipo === 'area' && m.efeitoArea) return { nome, dur: EFEITOS[nome].duracao * m.forcaEfeito };
    if (gp.tipo === 'corpo' && m.efeitoPerto) return { nome, dur: EFEITOS[nome].duracao * m.forcaEfeito * DURACAO_EFEITO_PERTO };
    return null;
  }

  executar(c, alvo, p) {
    const gp = p.gp, dir = p.dir;
    if (gp.tipo === 'corpo') {
      c.dash = { dir: dir.clone(), t: 0.17, vel: 12, gp, acertou: false, efeito: this.efeitoDoGolpe(c, gp) };
    } else if (gp.tipo === 'projetil') {
      this.disparar(c, gp, dir, 1);
      // Evoluções disparam de novo em sequência (rajada)
      if (c.melhoria.disparos > 1) c.rajada = { gp, dir: dir.clone(), restantes: c.melhoria.disparos - 1, t: 0.16 };
    } else {
      const cor = ELEMENTOS[gp.elemento].cor;
      const efeito = this.efeitoDoGolpe(c, gp);
      this.efeitoAnel(c.pos, gp.raio, cor);
      if (efeito) this.efeitoAnel(c.pos, gp.raio * 0.7, EFEITOS[efeito.nome].cor);
      this.particulas(c.pos, cor, 14, 1.2);
      if (!alvo.morto && dist(c, alvo) <= gp.raio + alvo.raio * 0.5) {
        this.aplicarDano(c, alvo, gp, new THREE.Vector3(alvo.pos.x - c.pos.x, 0, alvo.pos.z - c.pos.z).normalize(), { efeito });
      }
    }
  }

  disparar(c, gp, dir, fator) {
    const n = gp.quantidade || 1;
    const base = Math.atan2(dir.x, dir.z);
    for (let k = 0; k < n; k++) this.criarProjetil(c, gp, base + (k - (n - 1) / 2) * 0.24, fator);
  }

  // opcoes.fator = multiplica a força | opcoes.efeito = { nome, dur } | opcoes.queimadura = dano fixo do fogo
  aplicarDano(at, alvo, gp, dir, opcoes = {}) {
    if (alvo.morto || this.captura || !alvo.modelo.visible) return false;
    const topo = alvo.pos.clone().setY(alvo.esp.altura);
    if (alvo.invul > 0) {
      this.jogo.numero('Esquivou!', topo, '#ffffff', 'pequeno');
      return false;
    }
    // Ofuscado: quem ataca pode errar
    if (at.tem('ofuscado') && Math.random() < 0.4) {
      this.jogo.numero('Errou!', topo, '#ffab2e', 'pequeno');
      return false;
    }
    const mult = multiplicador(gp.elemento, alvo.esp.elemento);
    const def = alvo.stats.def * (alvo.tem('soterrado') ? 0.7 : 1);
    const exposto = alvo.tem('exposto') ? 1.3 : 1;
    const nivel = fatorDanoNivel(at.dados.nivel);  // dano cresce com o nível de quem ataca
    const arena = at.mod?.dano ?? 1;               // bônus/penalidade da arena
    const dano = Math.max(1, Math.round(gp.poder * (opcoes.fator ?? 1) * (at.stats.atk / def) * mult * exposto * nivel * arena * (0.9 + Math.random() * 0.2)));
    alvo.dados.hp = Math.max(0, alvo.dados.hp - dano);
    if (alvo.tem('sono')) { alvo.status.sono = 0; this.jogo.numero('Acordou!', topo.clone().setY(topo.y + 0.5), '#b9b4ff', 'pequeno'); }
    alvo.flash = 0.18;
    alvo.stun = 0.18;
    alvo.emp.set(dir.x * 7, 0, dir.z * 7);
    if (gp.lentidao) alvo.lento = gp.lentidao;
    const cor = alvo.lado === 'inimigo' ? '#ffe066' : '#ff6b81';
    this.jogo.numero(String(dano), topo, cor, mult > 1 ? 'grande' : '');
    if (mult > 1) this.jogo.numero('Super efetivo!', topo.clone().setY(topo.y + 0.9), '#ffd23f', 'pequeno');
    else if (mult < 1) this.jogo.numero('Pouco efetivo', topo.clone().setY(topo.y + 0.9), '#c9d6e8', 'pequeno');
    this.particulas(alvo.pos, ELEMENTOS[gp.elemento].cor, 8, 0.9);
    if (alvo.dados.hp <= 0) { this.desmaiar(alvo); return true; }
    if (opcoes.efeito) this.aplicarEfeito(alvo, opcoes.efeito.nome, opcoes.efeito.dur, at);
    return true;
  }

  aplicarEfeito(alvo, nome, dur, causador) {
    if (alvo.morto) return;
    const ef = EFEITOS[nome];
    const novo = !alvo.tem(nome);
    alvo.status[nome] = Math.max(alvo.status[nome] || 0, dur);
    if (nome === 'queimadura') { alvo.fonteFogo = causador; alvo.tickFogo = 0.5; }
    if ((nome === 'paralisia' || nome === 'sono') && alvo.prep) this.cancelarPreparo(alvo);
    if (novo) {
      this.jogo.numero(ef.nome + '!', alvo.pos.clone().setY(alvo.esp.altura + 0.7), ef.cor, 'pequeno');
      this.particulas(alvo.pos, ef.cor, 12, 1);
    }
  }

  // Efeitos negativos passando com o tempo
  atualizarStatus(c, dt) {
    for (const k in c.status) {
      c.status[k] = Math.max(0, c.status[k] - dt);
      if (c.status[k] <= 0) delete c.status[k];
    }
    if (c.morto) { c.status = {}; return; }
    if (c.tem('queimadura')) {
      c.tickFogo -= dt;
      if (c.tickFogo <= 0) {
        c.tickFogo = 0.5;
        const dano = Math.max(1, Math.round(c.stats.hpMax * 0.02));
        c.dados.hp = Math.max(0, c.dados.hp - dano);
        this.jogo.numero(String(dano), c.pos.clone().setY(c.esp.altura * 0.8), '#ff9a4a', 'pequeno');
        if (c.dados.hp <= 0) { this.desmaiar(c); return; }
      }
    }
    // partículas da cor do efeito saindo do monstro
    const ativos = Object.keys(c.status);
    if (ativos.length) {
      c.visT -= dt;
      if (c.visT <= 0) {
        c.visT = 0.35;
        const ef = EFEITOS[ativos[Math.floor(Math.random() * ativos.length)]];
        this.particulas(c.pos, ef.cor, 2, 0.35);
        if (c.tem('sono') && Math.random() < 0.5) this.jogo.numero('z', c.pos.clone().setY(c.esp.altura + 0.3), '#dcd6ff', 'pequeno');
      }
    }
  }

  desmaiar(l) {
    l.morto = true;
    if (l.prep) this.cancelarPreparo(l);
    l.dash = null;
    if (l === this.ini) {
      this.jogo.aviso(`${l.esp.nome} selvagem desmaiou!`);
      this.fim = { tipo: 'vitoria', t: 1.5 };
    } else {
      this.jogo.aviso(`${l.esp.nome} desmaiou!`);
      if (this.proximoDePe() >= 0) this.trocaAuto = 1.2;
      else this.fim = { tipo: 'derrota', t: 1.8 };
    }
  }

  esquivar(c, mv, outro) {
    if (c.cdEsq > 0 || c.dash || c.stun > 0 || c.morto || !c.podeAndar()) return;
    const dir = mv ? new THREE.Vector3(mv.x, 0, mv.z) : new THREE.Vector3(c.pos.x - outro.pos.x, 0, c.pos.z - outro.pos.z);
    if (dir.lengthSq() < 1e-4) dir.set(1, 0, 0);
    dir.normalize();
    if (c.prep) this.cancelarPreparo(c);
    c.dash = { dir, t: 0.2, vel: 17, esquiva: true };
    c.invul = 0.34;
    c.cdEsq = 1.0;
  }

  fisica(c, outro, dt) {
    for (let i = 0; i < 3; i++) c.rec[i] = Math.max(0, c.rec[i] - dt);
    c.cdEsq = Math.max(0, c.cdEsq - dt);
    c.invul = Math.max(0, c.invul - dt);
    c.lento = Math.max(0, c.lento - dt);
    c.stun = Math.max(0, c.stun - dt);
    c.flash = Math.max(0, c.flash - dt);
    this.atualizarStatus(c, dt);

    // disparos extras da rajada (evoluções)
    if (c.rajada) {
      c.rajada.t -= dt;
      if (c.morto || !c.podeAtacar() || this.captura) c.rajada = null;
      else if (c.rajada.t <= 0) {
        this.disparar(c, c.rajada.gp, c.rajada.dir, PODER_DISPARO_EXTRA);
        c.rajada.restantes--;
        c.rajada.t = 0.16;
        if (c.rajada.restantes <= 0) c.rajada = null;
      }
    }

    if (c.prep) {
      const p = c.prep;
      p.t -= dt;
      const k = 1 - Math.max(0, p.t) / p.total;
      if (p.aviso?.userData.segue) {
        p.aviso.position.set(c.pos.x, 0.06, c.pos.z);
        p.aviso.userData.disco.scale.setScalar(p.aviso.userData.raio * k);
      } else if (p.aviso?.userData.faixa) {
        p.aviso.position.set(c.pos.x, 0.06, c.pos.z);
        p.aviso.material.opacity = 0.2 + 0.25 * k;
      }
      piscar(c.modelo, (c.lado === 'inimigo' ? 0.6 : 0.3) * k, ELEMENTOS[p.gp.elemento].cor);
      c.brilhando = true;
      if (p.t <= 0) {
        this.removerAviso(c);
        c.prep = null;
        piscar(c.modelo, 0);
        c.brilhando = false;
        this.executar(c, outro, p);
      }
    }

    if (c.dash) {
      const ds = c.dash;
      c.pos.addScaledVector(ds.dir, ds.vel * dt);
      ds.t -= dt;
      if (ds.gp && !ds.acertou && !outro.morto && dist(c, outro) < c.raio + outro.raio + 0.5) {
        ds.acertou = true;
        this.aplicarDano(c, outro, ds.gp, ds.dir, { efeito: ds.efeito });
        ds.t = 0;
      }
      if (ds.t <= 0) {
        if (ds.gp && !ds.acertou && !outro.morto) {
          const tx = outro.pos.x - c.pos.x, tz = outro.pos.z - c.pos.z, d = Math.hypot(tx, tz);
          if (d <= ds.gp.alcance + outro.raio * 0.5 && (tx * ds.dir.x + tz * ds.dir.z) / (d || 1) > 0.5) this.aplicarDano(c, outro, ds.gp, ds.dir, { efeito: ds.efeito });
        }
        c.dash = null;
      }
    }

    c.pos.addScaledVector(c.emp, dt);
    c.emp.multiplyScalar(Math.exp(-8 * dt));
    this.arena.colidir(c.pos, c.raio); // obstáculos e borda da arena

    c.ang = lerpAngulo(c.ang, c.angAlvo, 1 - Math.exp(-14 * dt));
    const m = c.modelo;
    m.position.set(c.pos.x, 0, c.pos.z);
    m.rotation.y = c.ang + (c.dash?.esquiva ? (0.2 - c.dash.t) * 30 : 0);
    if (c.morto) {
      m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, 1.5, 1 - Math.exp(-6 * dt));
      m.userData.corpo.position.y = 0;
    } else if (c.tem('sono')) {
      m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, 0.35, 1 - Math.exp(-6 * dt)); // tomba de lado, dormindo
      animarModelo(m, this.t * 0.3, false);
    } else {
      m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, 0, 1 - Math.exp(-10 * dt));
      animarModelo(m, this.t, c.movendo);
      if (c.tem('paralisia')) m.position.x += (Math.random() - 0.5) * 0.12; // treme com o choque
    }
    // piscar vermelho ao levar dano / transparente durante a esquiva
    if (c.flash > 0) { piscar(m, c.flash / 0.18, '#ff3d5e'); c.brilhando = true; }
    else if (c.brilhando && !c.prep) { piscar(m, 0); c.brilhando = false; }
    if (c.lento > 0 && !c.morto) m.userData.corpo.position.y *= 0.3;
    c.movendo = false;
  }

  // ---------- projéteis e efeitos ----------
  criarProjetil(c, gp, ang, fator = 1) {
    const cor = ELEMENTOS[gp.elemento].cor;
    const mesh = new THREE.Mesh(GEO_PROJ[gp.elemento] || GEO_PROJ.normal, new THREE.MeshLambertMaterial({ color: gp.elemento === 'trevas' ? '#3a1a5a' : cor, emissive: cor, emissiveIntensity: 0.6, flatShading: true, transparent: gp.elemento === 'agua', opacity: 0.85 }));
    if (gp.elemento === 'planta') mesh.scale.set(1, 0.3, 1.7);
    if (gp.elemento === 'raio') mesh.scale.set(0.7, 0.7, 2.4);
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const pos = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(0.8 * c.esp.tamanho);
    mesh.position.copy(pos);
    mesh.rotation.y = ang;
    this.cena.add(mesh);
    if (fator < 1) mesh.scale.multiplyScalar(0.8);
    this.projeteis.push({ mesh, pos, dir, gp, dono: c, lado: c.lado, vida: 1.4, fator });
  }

  atualizarProjeteis(dt) {
    for (let i = this.projeteis.length - 1; i >= 0; i--) {
      const p = this.projeteis[i];
      p.pos.addScaledVector(p.dir, p.gp.velocidade * dt);
      p.vida -= dt;
      p.mesh.position.copy(p.pos);
      if (p.gp.elemento === 'lua') p.mesh.rotation.y += dt * 14;
      else if (p.gp.elemento !== 'planta' && p.gp.elemento !== 'raio') p.mesh.rotation.x += dt * 8;
      const alvo = p.lado === 'jogador' ? this.ini : this.jog;
      let acabou = p.vida <= 0 || Math.hypot(p.pos.x, p.pos.z) > RAIO_ARENA + 1;
      // obstáculos seguram os disparos: dá para se esconder atrás deles
      if (!acabou && this.arena.bloqueia(p.pos, p.gp.raio * 0.6)) {
        acabou = true;
        this.particulas(p.pos, ELEMENTOS[p.gp.elemento].cor, 5, 0.6);
      }
      if (!acabou && !alvo.morto && alvo.modelo.visible && Math.hypot(p.pos.x - alvo.pos.x, p.pos.z - alvo.pos.z) < p.gp.raio + alvo.raio) {
        this.aplicarDano(p.dono, alvo, p.gp, p.dir, { fator: p.fator });
        acabou = true;
      }
      if (acabou) {
        this.cena.remove(p.mesh);
        p.mesh.material.dispose();
        this.projeteis.splice(i, 1);
      }
    }
  }

  efeitoAnel(pos, raio, cor) {
    const m = new THREE.Mesh(GEO_ANEL, matBrilho(cor, 0.9));
    m.position.set(pos.x, 0.1, pos.z);
    this.cena.add(m);
    this.efeitos.push({ obj: m, vida: 0.35, total: 0.35, upd: (e, k) => {
      const s = 0.3 + 0.7 * Math.sqrt(k);
      e.obj.scale.set(raio * s, 1, raio * s);
      e.obj.material.opacity = 0.9 * (1 - k);
    } });
  }

  particulas(pos, cor, n, forca) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(GEO_PARTICULA, new THREE.MeshBasicMaterial({ color: cor, transparent: true }));
      m.position.set(pos.x, 0.8, pos.z);
      const v = new THREE.Vector3((Math.random() - 0.5) * 8 * forca, (2 + Math.random() * 5) * forca, (Math.random() - 0.5) * 8 * forca);
      this.cena.add(m);
      this.efeitos.push({ obj: m, vida: 0.6, total: 0.6, upd: (e, k, dt) => {
        v.y -= 18 * dt;
        e.obj.position.addScaledVector(v, dt);
        e.obj.scale.setScalar(1 - k);
      } });
    }
  }

  atualizarEfeitos(dt) {
    for (let i = this.efeitos.length - 1; i >= 0; i--) {
      const e = this.efeitos[i];
      e.vida -= dt;
      e.upd(e, 1 - Math.max(0, e.vida) / e.total, dt);
      if (e.vida <= 0) {
        this.cena.remove(e.obj);
        e.obj.material.dispose();
        this.efeitos.splice(i, 1);
      }
    }
  }

  // ---------- captura ----------
  lancarCristal() {
    if (this.fim || this.captura || this.jog.morto || this.ini.morto) return;
    const est = this.jogo.estado;
    if (est.cristais <= 0) { this.jogo.aviso('Sem cristais! Procure brilhos azuis pelo mapa.'); return; }
    est.cristais--;
    const sucesso = Math.random() < chanceCaptura(this.ini.dados);
    if (this.jog.prep) this.cancelarPreparo(this.jog);
    if (this.ini.prep) this.cancelarPreparo(this.ini);
    this.ini.dash = null;
    const cr = criarCristal(1.1);
    this.cena.add(cr);
    this.captura = {
      fase: 'voando', t: 0, cr, sucesso,
      balancos: sucesso ? 3 : 1 + Math.floor(Math.random() * 3), n: 0,
      de: this.jog.pos.clone().setY(1), ate: this.ini.pos.clone(),
    };
  }

  atualizarCaptura(dt) {
    const c = this.captura, cr = c.cr, ini = this.ini;
    c.t += dt;
    if (c.fase === 'voando') {
      const k = Math.min(1, c.t / 0.55);
      cr.position.lerpVectors(c.de, c.ate, k);
      cr.position.y = 1 + Math.sin(k * Math.PI) * 2.5;
      cr.rotation.y += dt * 12;
      if (k >= 1) { c.fase = 'sugando'; c.t = 0; this.particulas(ini.pos, '#8ff4ff', 12, 1); }
    } else if (c.fase === 'sugando') {
      const k = Math.min(1, c.t / 0.35);
      ini.modelo.scale.setScalar(1 - k);
      cr.position.set(c.ate.x, 1.2, c.ate.z);
      if (k >= 1) { ini.modelo.visible = false; c.fase = 'caindo'; c.t = 0; }
    } else if (c.fase === 'caindo') {
      const k = Math.min(1, c.t / 0.3);
      cr.position.y = 1.2 - k * 0.8;
      if (k >= 1) { c.fase = 'balanco'; c.t = 0; }
    } else if (c.fase === 'balanco') {
      const ciclo = 0.65;
      const k = c.t / ciclo;
      cr.rotation.z = k < 0.5 ? Math.sin(k * 2 * Math.PI * 2) * 0.45 : 0;
      if (c.t >= ciclo) {
        c.t = 0;
        c.n++;
        if (c.n >= c.balancos) {
          if (c.sucesso) {
            c.fase = 'sucesso';
            cr.material.emissive.set('#ffd23f');
            cr.material.emissiveIntensity = 1;
            this.particulas(ini.pos, '#ffd23f', 22, 1.3);
            this.jogo.aviso(`Você capturou ${ini.esp.nome}!`);
            this.fim = { tipo: 'captura', t: 1.7 };
          } else {
            this.particulas(ini.pos, '#8ff4ff', 16, 1.4);
            this.cena.remove(cr);
            cr.material.dispose();
            ini.modelo.visible = true;
            ini.modelo.scale.setScalar(1);
            ini.rec = [0, 0, 0];
            ini.stun = 0;
            this.jogo.aviso(`${ini.esp.nome} escapou do cristal!`);
            this.captura = null;
          }
        }
      }
    } else if (c.fase === 'sucesso') {
      cr.rotation.y += dt * 3;
      cr.position.y = 0.4 + Math.min(1, c.t) * 0.6;
    }
  }

  // ---------- trocar e fugir ----------
  proximoDePe() {
    const eq = this.jogo.estado.equipe;
    for (let k = 1; k <= eq.length; k++) {
      const i = (this.idx + k) % eq.length;
      if (i !== this.idx && eq[i].hp > 0) return i;
    }
    return -1;
  }

  trocar(auto) {
    if (this.fim || this.captura) return;
    if (!auto && (this.trocaCd > 0 || this.trocaAuto > 0)) return;
    const prox = this.proximoDePe();
    if (prox < 0) { if (!auto) this.jogo.aviso('Nenhum outro monstro de pé na equipe.'); return; }
    const velho = this.jog;
    if (velho.prep) this.cancelarPreparo(velho);
    this.cena.remove(velho.modelo);
    descartar(velho.modelo);
    this.particulas(velho.pos, '#8ff4ff', 12, 1);
    const novo = new Lutador(this.jogo.estado.equipe[prox], 'jogador');
    novo.pos.copy(velho.pos);
    novo.ang = novo.angAlvo = Math.atan2(this.ini.pos.x - novo.pos.x, this.ini.pos.z - novo.pos.z);
    novo.stun = 0.4;
    this.cena.add(novo.modelo);
    this.aplicarModArena(novo);
    this.jog = novo;
    this.idx = prox;
    this.trocaCd = 1.5;
    this.jogo.aviso(`Vai, ${novo.esp.nome}!`);
    this.montarBotoes();
  }

  fugir() {
    if (this.fim || this.captura) return;
    this.jogo.aviso('Você fugiu da batalha.');
    this.fim = { tipo: 'fuga', t: 0.5 };
  }

  // ---------- interface ----------
  montarHud() {
    const ui = this.jogo.ui;
    const e = this.ini;
    ui.biNome.textContent = e.esp.nome;
    ui.biNivel.textContent = 'Nv.' + e.dados.nivel;
    ui.biEl.textContent = ELEMENTOS[e.esp.elemento].nome;
    ui.biEl.style.setProperty('--cor', ELEMENTOS[e.esp.elemento].cor);
    // faixa no topo com o nome da arena e quem ela favorece
    const a = this.arena.cfg;
    const fav = a.favorece ? `<b style="color:${ELEMENTOS[a.favorece].cor}">${ELEMENTOS[a.favorece].nome} +25%</b>` : 'sem bônus de elemento';
    const per = this.periodo === 'dia' ? 'Sol e Luz +15%' : 'Lua e Trevas +15%';
    ui.arenaInfo.innerHTML = `<strong>${a.nome}</strong> · ${a.clima} · ${fav} · ${per}`;
    this.montarBotoes();
  }

  montarBotoes() {
    const ui = this.jogo.ui, j = this.jog;
    ui.bjNome.textContent = j.esp.nome;
    ui.bjNivel.textContent = 'Nv.' + j.dados.nivel;
    ui.bjEl.textContent = ELEMENTOS[j.esp.elemento].nome;
    ui.bjEl.style.setProperty('--cor', ELEMENTOS[j.esp.elemento].cor);
    const tipos = { corpo: 'perto', projetil: 'disparo', area: 'área' };
    ui.golpes.forEach((b, i) => {
      const gp = j.golpe(i);
      b.querySelector('.nome').textContent = gp.nome;
      const extra = gp.tipo === 'projetil' && j.melhoria.disparos > 1 ? ` ×${j.melhoria.disparos}` : '';
      b.querySelector('.tipo').textContent = tipos[gp.tipo] + extra;
      b.style.setProperty('--cor', ELEMENTOS[gp.elemento].cor);
      // bolinha na cor do efeito quando o golpe causa um efeito negativo
      const ef = this.efeitoDoGolpe(j, gp);
      b.classList.toggle('com-efeito', !!ef);
      if (ef) { b.style.setProperty('--ef', EFEITOS[ef.nome].cor); b.title = `Causa ${EFEITOS[ef.nome].nome}`; }
      else b.removeAttribute('title');
    });
  }

  htmlStatus(l) {
    const mods = (l.mod?.textos || []).map((m) => `<span class="mod ${m.bom ? 'bom' : 'ruim'}">${m.t}</span>`).join('');
    return mods + Object.entries(l.status).map(([k, v]) => `<span style="--cor:${EFEITOS[k].cor}">${EFEITOS[k].nome} ${v.toFixed(1)}s</span>`).join('');
  }

  atualizarHud() {
    const ui = this.jogo.ui, j = this.jog, e = this.ini;
    const barra = (el, txt, l) => {
      const f = Math.max(0, l.frac);
      el.style.width = (f * 100).toFixed(1) + '%';
      el.dataset.nivel = f > 0.5 ? 'alto' : f > 0.2 ? 'medio' : 'baixo';
      txt.textContent = `${l.dados.hp}/${l.stats.hpMax}`;
    };
    barra(ui.bjVida, ui.bjHp, j);
    barra(ui.biVida, ui.biHp, e);
    ui.golpes.forEach((b, i) => {
      const gp = j.golpe(i);
      const f = j.rec[i] / gp.recarga;
      b.style.setProperty('--p', f.toFixed(3));
      b.classList.toggle('carregando', f > 0);
      b.classList.toggle('bloqueado', !j.podeAtacar());
    });
    ui.esquiva.classList.toggle('bloqueado', !j.podeAndar());
    const sj = this.htmlStatus(j), si = this.htmlStatus(e);
    if (ui.bjStatus.innerHTML !== sj) ui.bjStatus.innerHTML = sj;
    if (ui.biStatus.innerHTML !== si) ui.biStatus.innerHTML = si;
    ui.esquiva.style.setProperty('--p', (j.cdEsq / 1.0).toFixed(3));
    ui.esquiva.classList.toggle('carregando', j.cdEsq > 0);
    ui.qtdCristal.textContent = this.jogo.estado.cristais;
    ui.chanceCristal.textContent = e.morto ? '' : Math.round(chanceCaptura(e.dados) * 100) + '%';
    const eq = this.jogo.estado.equipe;
    const marcas = eq.map((m, i) => `<i class="${m.hp <= 0 ? 'fora' : ''} ${i === this.idx ? 'atual' : ''}"></i>`).join('');
    if (ui.bjEquipe.innerHTML !== marcas) ui.bjEquipe.innerHTML = marcas;
  }

  // Libera a memória dos materiais da arena quando a batalha acaba
  descartarTudo() {
    descartar(this.cena);
  }
}
