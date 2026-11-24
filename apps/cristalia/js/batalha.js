// =============================================================
// BATALHA EM TEMPO REAL
// Você controla seu monstro com o joystick e usa 3 golpes + esquiva.
// O inimigo "avisa" antes de atacar (área vermelha no chão): saia dela
// ou use a Esquiva, que deixa você invulnerável por um instante.
// Golpe 1 = corpo a corpo | Golpe 2 = disparo | Golpe 3 = área
// =============================================================
import * as THREE from 'three';
import {
  ESPECIES, GOLPES, ELEMENTOS, EFEITOS, EFEITO_DO_ELEMENTO, PODER_DISPARO_EXTRA, DURACAO_EFEITO_PERTO, DURACAO_EFEITO_DISPARO,
  multiplicadorContra, chanceCaptura, melhoriaDe, statsDe, modificadorArena, fatorDanoNivel, CRISTAIS, nomeTipo, fundoTipo, DANO_GERAL,
  fracoContraEspecie, chanceDoEfeito, pct,
} from './dados.js';
import { VisualTrevas } from './habilidades/trevas-batalha.js';
import { HabilidadesBrasito } from './habilidades/brasito-batalha.js';
import { HabilidadesGotinho } from './habilidades/gotinho-batalha.js';
import { HabilidadesMusguinho } from './habilidades/musguinho-batalha.js';
import { HabilidadesPedrisco } from './habilidades/pedrisco-batalha.js';
import { HabilidadesFaisquinho } from './habilidades/faisquinho-batalha.js';
import { HabilidadesSolito } from './habilidades/solito-batalha.js';
import { HabilidadesLunico } from './habilidades/lunico-batalha.js';
import { HabilidadesLumino } from './habilidades/lumino-batalha.js';
import { CameraOrbita } from './camera.js';
import { aplicarPocao, RECARGA_POCAO } from './bolsa.js';
import { criarModelo, criarCristal, criarCoroa, animarModelo, piscar, descartar, tocarGolpe, pararGolpe } from './modelos.js';

const MAX_ATIVOS = 2;      // quantos inimigos de um grupo lutam ao mesmo tempo (o próximo par só entra quando estes caírem)
const ESCALA_LIDER = 1.3;  // o líder do grupo é maior
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
export class Lutador {
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
    this.escala = 1;
    this.mortoT = 0;
    this.ia = { t: 0.8, strafe: Math.random() < 0.5 ? -1 : 1, troca: 1 };
  }
  get raio() { return this.esp.raio * this.escala; }
  get altura() { return this.esp.altura * this.escala; }
  get frac() { return this.dados.hp / this.stats.hpMax; }
  golpe(i) { return GOLPES[this.esp.golpes[i]]; }
  tem(efeito) { return this.status[efeito] > 0; }
  podeAndar() { return !this.tem('paralisia') && !this.tem('sono') && !this.tem('enraizado'); }
  podeAtacar() { return !this.tem('paralisia') && !this.tem('sono') && !this.tem('medo'); }
  // veloz = velocidade extra da Investida da linha do Brasito | sol = bônus do Sol da linha do Solito
  // breu = bônus de dano da área da linha de Trevas (fica em c.breu = { cfg, t })
  // luarLento / luarVel = lentidão de quem está no luar inimigo / velocidade do Plenilúnio no próprio luar
  get fatorVel() { return (this.veloz ? 1 + this.veloz.bonus : 1) * (this.sol ? 1 + this.sol.cfg.velocidade : 1) * (this.lento > 0 ? 0.5 : 1) * (this.tem('encharcado') ? 0.55 : 1) * (this.tem('parasita') ? 0.7 : 1) * (this.luarLento ? 1 - this.luarLento.f : 1) * (this.luarVel ? 1 + this.luarVel.f : 1) * (this.mod?.vel ?? 1); }
}

export class Batalha {
  constructor(jogo, selvagem, idxInicial) {
    this.jogo = jogo;
    this.selvagem = selvagem;
    this.zona = selvagem.zona;
    this.cena = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, jogo.aspecto, 0.1, 200);
    this.orbita = new CameraOrbita(0); // começa atrás do seu monstro, olhando para o inimigo
    this.efeitos = [];
    this.arena = new Arena(this);
    this.trevas = new VisualTrevas(this); // visual especial dos golpes de Trevas
    this.brasito = new HabilidadesBrasito(this); // lança-chamas, rabo de fogo e velocidade da linha do Brasito
    this.gotinho = new HabilidadesGotinho(this); // jato, hidrocanhão, ondas, maremoto e escudo da linha do Gotinho
    this.musguinho = new HabilidadesMusguinho(this); // folha bumerangue, vinha que puxa, raízes, moita e bosque da linha do Musguinho
    this.pedrisco = new HabilidadesPedrisco(this); // pedra em arco, punho sísmico, tremor e pilares da linha do Pedrisco
    this.faisquinho = new HabilidadesFaisquinho(this); // marcas, dash elétrico, tiro que marca, choque e nuvens da linha do Faisquinho
    this.solito = new HabilidadesSolito(this); // sol que dá bônus, laser e calor da linha do Solito
    this.lunico = new HabilidadesLunico(this); // combo de dashes, fases da lua e luar da linha do Lunico
    this.lumino = new HabilidadesLumino(this); // passo de luz, estilhaço e redoma da linha do Lumino
    this.periodo = jogo.mundo.periodo;

    this.idx = idxInicial;
    this.jog = new Lutador(jogo.estado.equipe[idxInicial], 'jogador');
    this.jog.pos.set(0, 0, 5);
    this.jog.ang = this.jog.angAlvo = Math.PI;
    this.cena.add(this.jog.modelo);
    this.aplicarModArena(this.jog);

    // Inimigos: um selvagem sozinho ou um grupo (o líder entra por último)
    const membros = selvagem.membros ? selvagem.membros.map((m) => m.dados) : [selvagem.dados];
    this.grupo = membros.length > 1;
    this.chefe = !!selvagem.chefe;
    this.treinador = selvagem.treinador || null; // luta na Arena do Reino: os monstros dele entram um de cada vez e não dá para capturar
    // Ondas: entram 2 de cada vez, e a próxima onda só entra quando a anterior inteira cair.
    // Grupos de dungeon vêm em ordem de força (onda 1: 2 fracos, 2: 2 médios, 3: o forte, 4: o líder).
    // Os outros grupos: os comuns de 2 em 2 e o líder sozinho no fim.
    const ordem = (d) => d.onda ?? (d.lider ? 99 : 1);
    const fila = [...membros].sort((a, b) => ordem(a) - ordem(b));
    this.ondas = [];
    for (const d of fila) {
      const ult = this.ondas[this.ondas.length - 1];
      if (ult && ordem(ult[0]) === ordem(d) && ult.length < MAX_ATIVOS && !d.lider) ult.push(d);
      else this.ondas.push([d]);
    }
    this.fila = this.ondas.flat();
    this.total = membros.length;
    this.inimigos = [];
    this.derrotados = [];
    this.capturados = [];
    this.liderDerrotado = false;
    const primeira = this.ondas.shift() || [];
    this.tamOnda = primeira.length;
    primeira.forEach((_, i) => this.entrarInimigo(i));
    this.alvo = this.inimigos[0];
    this.marcaAlvo = new THREE.Mesh(GEO_ANEL, matBrilho('#ffffff', 0.7));
    this.marcaAlvo.visible = this.grupo;
    this.cena.add(this.marcaAlvo);

    this.projeteis = [];
    this.captura = null;
    this.tipoCristal = 0;          // 0 comum, 1 forte, 2 supremo
    this.cristalEscolhido = false; // o jogador trocou na mão? então respeita a escolha
    this.fim = null;
    this.t = 0;
    this.trocaCd = 0;
    this.trocaAuto = 0;
    this.pocaoCd = 0; // recarga das poções (10 s entre uma e outra)
    this.posicionarCamera(1);
    this.montarHud();
    if (this.treinador) {
      const tr = this.treinador;
      jogo.aviso(`${tr.nome} vai lutar com ${this.total} monstros${selvagem.revanche ? ' (revanche, Nv.50)' : ''}!`);
      jogo.aviso(`${tr.nome} mandou ${this.ini.esp.nome} Nv.${this.ini.dados.nivel}!`);
      jogo.aviso('Monstros de treinador não podem ser capturados.');
    } else if (this.grupo) {
      const lider = membros.find((m) => m.lider);
      jogo.aviso(`Um grupo de ${this.total} monstros atacou!`);
      if (lider) jogo.aviso(`O líder é um ${ESPECIES[lider.especie].nome} Nv.${lider.nivel}. Ele entra por último.`);
    } else if (this.chefe) {
      const esp = this.ini.esp;
      this.chefeEspecie = this.ini.dados.especie;
      jogo.aviso(`O chefe ${esp.nome} Nv.${this.ini.dados.nivel} acordou!`);
      const fracos = fracoContraEspecie(esp).map((el) => ELEMENTOS[el].nome);
      if (fracos.length) jogo.aviso(`Golpes de ${fracos.join(' e ')} são super efetivos contra ${nomeTipo(esp)}.`);
    } else jogo.aviso(`Um ${this.ini.esp.nome} selvagem apareceu!`);
    if (this.arena.cfg.descricaoPerigo) jogo.aviso(this.arena.cfg.descricaoPerigo);
  }

  // O inimigo que o jogador está mirando (o mais perto)
  get ini() { return this.alvo; }

  // Coloca o próximo monstro da fila na arena
  entrarInimigo(posicaoInicial) {
    const dados = this.fila.shift();
    if (!dados) return;
    const l = new Lutador(dados, 'inimigo');
    if (dados.lider) {
      l.escala = ESCALA_LIDER;
      l.modelo.scale.setScalar(ESCALA_LIDER);
      const coroa = criarCoroa(1.2);
      coroa.position.y = l.esp.altura + 0.15;
      l.modelo.add(coroa);
      l.coroa = coroa;
    }
    if (posicaoInicial != null) {
      l.pos.set((posicaoInicial - (this.tamOnda - 1) / 2) * 4.5, 0, -5 - (posicaoInicial % 2) * 2);
    } else {
      // reforço: entra pela borda do lado de lá da arena
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      l.pos.set(Math.cos(a) * (RAIO_ARENA - 3), 0, Math.sin(a) * (RAIO_ARENA - 3));
      l.stun = 0.8;
      this.particulas(l.pos, '#ffffff', 14, 1.2);
      if (dados.lider) this.jogo.aviso(`O líder ${l.esp.nome} entrou na luta!`);
    }
    l.ia.t = 0.8 + this.inimigos.length * 0.6;
    l.angAlvo = l.ang = Math.atan2(this.jog.pos.x - l.pos.x, this.jog.pos.z - l.pos.z);
    this.cena.add(l.modelo);
    this.aplicarModArena(l);
    this.inimigos.push(l);
    return l;
  }

  vivos() { return this.inimigos.filter((l) => !l.morto && l.modelo.visible); }

  // Quem um lutador pode acertar
  alvosDe(c) {
    if (c.lado === 'jogador') return this.vivos();
    return this.jog.morto ? [] : [this.jog];
  }

  escolherAlvo() {
    const v = this.vivos();
    if (!v.length) return;
    let melhor = v[0], md = Infinity;
    for (const l of v) { const d = dist(l, this.jog); if (d < md) { md = d; melhor = l; } }
    this.alvo = melhor;
  }

  // Bônus ou penalidade que a arena (e o dia/noite) dão ao monstro
  aplicarModArena(l) {
    l.mod = modificadorArena(this.arena.zona, l.esp.elementos, this.periodo);
  }

  // Dano do cenário (pedras, raios): uma fração da vida máxima
  danoAmbiente(l, fracao, cor) {
    if (l.morto || l.invul > 0) return;
    const dano = Math.max(1, Math.round(l.stats.hpMax * fracao));
    l.dados.hp = Math.max(0, l.dados.hp - dano);
    l.flash = 0.18;
    l.stun = 0.25;
    if (l.tem('sono')) l.status.sono = 0;
    this.jogo.numero(String(dano), l.pos.clone().setY(l.altura), cor, '');
    if (l.dados.hp <= 0) this.desmaiar(l);
  }

  curar(l, fracao) {
    if (l.morto || l.dados.hp >= l.stats.hpMax || l.tem('combustao')) return;
    const cura = Math.max(1, Math.round(l.stats.hpMax * fracao));
    l.dados.hp = Math.min(l.stats.hpMax, l.dados.hp + cura);
    this.jogo.numero('+' + cura, l.pos.clone().setY(l.altura), '#5fe08a', 'pequeno');
  }

  camPadrao() {
    return this.jogo.aspecto < 1 ? { dist: 19.5, pitch: 0.83 } : { dist: 13, pitch: 0.72 }; // um pouco mais longe
  }

  posicionarCamera(k) {
    const alvo = this.ini || this.jog;
    const meio = new THREE.Vector3().addVectors(this.jog.pos, alvo.pos).multiplyScalar(0.5);
    // A câmera se afasta quando os monstros ficam longe um do outro (e um pouco mais em grupo)
    const afast = Math.min(10, Math.max(0, dist(this.jog, alvo) - 4)) * 0.07 + (this.grupo ? 1.15 : 1) + (this.chefe ? 0.35 : 0);
    const { dist: d, pitch } = this.camPadrao();
    const destino = meio.clone().add(this.orbita.deslocamento(d * afast, pitch));
    // fora da arena o chão sobe: a câmera não entra nele
    const r = Math.hypot(destino.x, destino.z);
    destino.y = Math.max(destino.y, 1.5, (r - RAIO_ARENA - 1) * 0.35 + 2);
    this.camera.position.lerp(destino, k);
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
      if (ctrl.consumir('cristal')) { this.fecharSeletor(); this.lancarCristal(); }
      if (ctrl.consumir('tipoCristal') && !this.treinador) this.abrirSeletor();
      if (ctrl.consumir('proxCristal')) this.trocarCristal();
      for (let k = 0; k < CRISTAIS.length; k++) if (ctrl.consumir('cristal' + k)) this.escolherCristal(k);
      if (ctrl.consumir('trocar')) this.trocar(false);
      if (ctrl.consumir('pocao')) this.abrirPocoes();
      if (ctrl.consumir('pocaoCura')) this.usarPocao('cura');
      if (ctrl.consumir('pocaoReviver')) this.usarPocao('reviver');
    }
    this.pocaoCd = Math.max(0, this.pocaoCd - dt);
    if (!this.captura) this.escolherAlvo();
    const vivos = this.vivos();
    const podeAgir = !this.fim && !this.captura && liberado;
    // câmera: gira com o que o jogador arrastou; dois toques põem ela atrás do seu monstro
    const giro = ctrl.consumirGiro();
    const atras = e ? Math.atan2(j.pos.x - e.pos.x, j.pos.z - e.pos.z) : this.orbita.yaw;
    this.orbita.girar(giro, atras, this.camPadrao().pitch, dt);
    const girandoCam = giro.x || giro.y || giro.zoom || this.orbita.voltarPara != null;
    if (podeAgir && !j.morto && e) this.controlarJogador(j, e, ctrl.vetorDaCamera(this.orbita.yaw), dt, ctrl);
    const gm = this.jogo.gm; // painel GM (só na conta GM)
    if (podeAgir && !j.morto && !gm?.parados) for (const ini of vivos) this.pensarIA(ini, j, dt, vivos.length);

    this.fisica(this.jog, dt);
    gm?.quadroBatalha(this);
    for (const ini of this.inimigos) this.fisica(ini, dt);
    // ninguém ocupa o mesmo lugar que outro
    const todos = [this.jog, ...vivos];
    for (let a = 0; a < todos.length; a++) for (let b = a + 1; b < todos.length; b++) {
      const A = todos[a], B = todos[b];
      if (A.morto) continue;
      if (A.combo?.dash || B.combo?.dash) continue; // combo da linha do Lunico: o dash atravessa o alvo
      const d = dist(A, B), min = A.raio + B.raio;
      if (d < min && d > 0.001) {
        const ex = (A.pos.x - B.pos.x) / d, ez = (A.pos.z - B.pos.z) / d, f = (min - d) / 2;
        A.pos.x += ex * f; A.pos.z += ez * f;
        B.pos.x -= ex * f; B.pos.z -= ez * f;
      }
    }
    // desmaiados somem depois de um tempo e o próximo da fila entra
    for (let i = this.inimigos.length - 1; i >= 0; i--) {
      const l = this.inimigos[i];
      if (!l.morto) continue;
      l.mortoT += dt;
      if (l.mortoT > 1.3) {
        this.cena.remove(l.modelo);
        descartar(l.modelo);
        this.inimigos.splice(i, 1);
      }
    }
    // próxima onda: só quando todos os da onda atual caíram (ou foram capturados)
    if (!this.fim && !this.captura && this.vivos().length === 0 && this.ondas.length && this.t > 1) {
      this.reforcoT = (this.reforcoT || 0) + dt;
      if (this.reforcoT > 1.2) {
        this.reforcoT = 0;
        const onda = this.ondas.shift();
        if (this.treinador) this.jogo.aviso(`${this.treinador.nome} mandou ${ESPECIES[onda[0].especie].nome} Nv.${onda[0].nivel}!`);
        else if (!onda[0].lider) this.jogo.aviso(onda.length > 1 ? `Mais ${onda.length} entraram na luta!` : `Mais um ${ESPECIES[onda[0].especie].nome} entrou na luta!`);
        for (const _ of onda) this.entrarInimigo(null);
      }
    }
    // marca no chão embaixo do inimigo que você está mirando
    if (this.grupo && this.ini && !this.ini.morto) {
      this.marcaAlvo.visible = true;
      this.marcaAlvo.position.set(this.ini.pos.x, 0.08, this.ini.pos.z);
      this.marcaAlvo.scale.setScalar(this.ini.raio * 1.5 + Math.sin(this.t * 6) * 0.08);
    } else this.marcaAlvo.visible = false;

    this.atualizarProjeteis(dt);
    this.arena.atualizar(dt, this.t);
    this.atualizarEfeitos(dt);
    this.trevas.atualizar(dt);
    this.brasito.atualizar(dt);
    this.gotinho.atualizar(dt);
    this.musguinho.atualizar(dt);
    this.pedrisco.atualizar(dt);
    this.faisquinho.atualizar(dt);
    this.solito.atualizar(dt);
    this.lunico.atualizar(dt);
    this.lumino.atualizar(dt);
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
    this.posicionarCamera(1 - Math.exp((girandoCam ? -18 : -4) * dt));
    this.atualizarHud();
  }

  controlarJogador(j, e, v, dt, ctrl) {
    const mov = Math.hypot(v.x, v.z) > 0.05;
    j.mv = v; // para onde o joystick aponta (o Passo de Luz vai para lá)
    for (let i = 0; i < 3; i++) if (ctrl.consumir('golpe' + i)) this.tentarGolpe(j, i, e);
    if (ctrl.consumir('esquiva')) this.esquivar(j, mov ? v : null, e);
    if (!j.dash && !j.combo && !j.giro && j.stun <= 0 && j.podeAndar()) {
      const vel = j.stats.vel * j.fatorVel * (j.prep || j.jato || j.punho || j.feixe ? 0.35 : 1);
      j.pos.x += v.x * vel * dt;
      j.pos.z += v.z * vel * dt;
      j.movendo = mov;
      if (j.prep) j.angAlvo = Math.atan2(j.prep.dir.x, j.prep.dir.z);
      else if (j.jato) j.angAlvo = Math.atan2(j.jato.dir.x, j.jato.dir.z);
      else if (mov) j.angAlvo = Math.atan2(v.x, v.z);
    }
  }

  // Inteligência do monstro selvagem
  pensarIA(e, j, dt, ativos = 1) {
    const ia = e.ia;
    ia.t -= dt;
    ia.troca -= dt;
    const d = dist(e, j);
    if (ia.troca <= 0) { ia.strafe = Math.random() < 0.5 ? -1 : 1; ia.troca = 1.5 + Math.random() * 2; }
    if (ia.t <= 0 && !e.prep && !e.dash && !e.combo && e.stun <= 0 && e.podeAtacar()) {
      // com vários inimigos ao mesmo tempo, cada um ataca com menos frequência
      ia.t = (0.3 + Math.random() * 0.4) * (1 + 0.6 * (ativos - 1)) * (e.furia ? 0.6 : 1);
      const opcoes = [];
      for (let i = 0; i < 3; i++) {
        if (e.rec[i] > 0) continue;
        const gp = e.golpe(i);
        if (gp.sol) { if (!e.sol) opcoes.push(i, i, i); continue; }             // solta o sol quando não tem
        if (gp.laser) { if (d < gp.laser.alcance) opcoes.push(i, i); continue; } // laser
        if (gp.passo) { if (d < gp.passo.distancia + 1) opcoes.push(i, i); continue; } // passo de luz: aparece perto de você
        if (gp.onda) { if (d < gp.onda.distancia * 0.9) opcoes.push(i, i, i); } // onda que anda para a frente
        else if (gp.tipo === 'area' && d < gp.raio * 0.85 + (gp.dash || 0)) opcoes.push(i, i, i);
        if (gp.tipo === 'corpo' && d < gp.alcance + 1.2) opcoes.push(i, i);
        if (gp.marca && e.choque) opcoes.push(i, i, i, i); // Choque pronto: acerto garantido
        else if (gp.marca) { if (d > 2 && d < gp.alcance) opcoes.push(i, i); } // tiro que marca
        else if (gp.jato) { if (d < gp.jato.alcance * 0.9) opcoes.push(i, i); }
        else if (gp.arco) { if (d > 2.5 && d < gp.arco.alcance + 1) opcoes.push(i, i); } // pedra em arco
        else if (gp.olhos) { if (d > 2 && d < gp.alcance * 0.9) opcoes.push(i, i); } // bola com olhos (alcance curto)
        else if (gp.tipo === 'projetil' && d > 2.5 && d < 12) opcoes.push(i);
      }
      if (opcoes.length && Math.random() < 0.75) this.tentarGolpe(e, opcoes[Math.floor(Math.random() * opcoes.length)], j);
    }
    if (!e.dash && !e.combo && !e.giro && e.stun <= 0 && e.podeAndar()) {
      const ax = (j.pos.x - e.pos.x) / (d || 1), az = (j.pos.z - e.pos.z) / (d || 1);
      // distância preferida depende de qual golpe está pronto
      const g0 = e.golpe(0);
      const vinha = g0.vinha || g0.espinhos ? g0.alcance * 0.7 : g0.sol ? 6 : 1.8; // com a vinha ou o punho sísmico fica mais longe; o sol não é de perto
      const prefere = e.rec[0] <= 0.2 ? vinha : (e.rec[1] <= 0.3 ? 6 : 4.5);
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
      const vel = e.stats.vel * 0.85 * e.fatorVel * (e.prep || e.jato || e.punho || e.feixe ? 0.2 : 1);
      e.pos.x += (fx / l) * vel * dt;
      e.pos.z += (fz / l) * vel * dt;
      e.movendo = true;
      e.angAlvo = e.prep ? Math.atan2(e.prep.dir.x, e.prep.dir.z) : e.jato ? Math.atan2(e.jato.dir.x, e.jato.dir.z) : Math.atan2(ax, az);
    }
  }

  tentarGolpe(c, i, alvo) {
    if (c.prep || c.rec[i] > 0 || c.stun > 0 || c.dash || c.combo || c.morto || c.rajada || c.jato || c.giro || c.vinha || c.punho || c.feixe) return;
    if (!c.podeAtacar()) {
      // avisa o jogador por que o golpe não saiu
      if (c.lado === 'jogador' && this.t - (this.avisoBloqueio || 0) > 0.8) {
        this.avisoBloqueio = this.t;
        const nome = c.tem('medo') ? 'Com medo!' : c.tem('sono') ? 'Dormindo!' : 'Paralisado!';
        this.jogo.numero(nome, c.pos.clone().setY(c.altura), '#ffffff', 'pequeno');
      }
      return;
    }
    const gp = c.golpe(i);
    // linha do Faisquinho: depois do tiro acertar, o mesmo botão solta o Choque (na hora)
    if (gp.marca && c.choque) { this.faisquinho.usarChoque(c, gp); return; }
    const inimigo = c.lado === 'inimigo';
    c.rec[i] = gp.recarga * (inimigo ? (c.furia ? 0.95 : 1.4) : 1);
    let prep = gp.tipo === 'area' ? 0.35 : gp.tipo === 'corpo' ? 0.1 : 0.06;
    if (inimigo) prep = prep * 2 + 0.35; // o inimigo demora mais: tempo para você reagir
    const dir = new THREE.Vector3(alvo.pos.x - c.pos.x, 0, alvo.pos.z - c.pos.z);
    if (dir.lengthSq() < 1e-4) dir.set(Math.sin(c.ang), 0, Math.cos(c.ang));
    dir.normalize();
    if (gp.arco) {
      // pedra em arco: os lugares onde ela cai ficam marcados desde já (e não mudam)
      const quedas = this.pedrisco.quedas(c, gp, alvo.pos);
      c.prep = { gp, t: prep, total: prep, dir, quedas, aviso: this.pedrisco.avisoArco(quedas, gp, inimigo) };
    } else c.prep = { gp, t: prep, total: prep, dir, aviso: this.criarAviso(c, gp, dir, inimigo) };
    c.angAlvo = Math.atan2(dir.x, dir.z);
    tocarGolpe(c.modelo, gp.tipo, prep); // modelo do Blender (.glb): toca a animação do golpe
  }

  criarAviso(c, gp, dir, inimigo) {
    const cor = inimigo ? '#ff3d5e' : ELEMENTOS[gp.elemento].cor;
    if (gp.jato) return inimigo ? this.brasito.avisoJato(c, gp, dir) : null;   // lança-chamas
    if (gp.tamanhoRabo && gp.dash) return this.brasito.avisoGiro(c, gp, dir, cor); // rabo de fogo com dash
    if (gp.onda) return this.gotinho.avisoOnda(c, gp, dir, cor);                    // onda que anda para a frente
    if (gp.vinha) return inimigo ? this.musguinho.avisoVinha(c, gp, dir, cor) : null; // vinha que puxa
    if (gp.espinhos) return inimigo ? this.pedrisco.avisoPunho(c, gp, dir, cor) : null; // punho sísmico
    if (gp.dashRaio) return inimigo ? this.faisquinho.avisoDash(c, gp, dir, cor) : null; // dash elétrico
    if (gp.nuvens) return null; // as nuvens avisam cada raio que cai no chão
    if (gp.sol) return null;    // o sol não ataca
    if (gp.laser) return inimigo ? this.solito.avisoLaser(c, gp, dir, cor) : null; // laser
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
    const comp = gp.passo ? gp.passo.distancia : gp.tipo === 'corpo' ? gp.alcance + 2.2 : (gp.marca || gp.olhos ? gp.alcance : 12);
    const larg = gp.tipo === 'corpo' ? 1.4 : (gp.quantidade > 1 ? 2.6 : 1);
    const m = new THREE.Mesh(GEO_FAIXA, matBrilho(cor, 0.3));
    m.scale.set(larg, 1, comp);
    m.position.set(c.pos.x, 0.06, c.pos.z);
    m.rotation.y = Math.atan2(dir.x, dir.z);
    m.userData = { faixa: true };
    this.cena.add(m);
    return m;
  }

  // forcar = tira também a marca da pedra em arco (que normalmente fica até a pedra cair)
  removerAviso(c, forcar = false) {
    const av = c.prep?.aviso;
    if (!av || (av.userData.ficaNoChao && !forcar)) return;
    this.cena.remove(av);
    descartar(av);
  }

  cancelarPreparo(c) {
    this.removerAviso(c, true);
    c.prep = null;
    piscar(c.modelo, 0);
    c.brilhando = false;
    pararGolpe(c.modelo); // modelo do Blender: a animação do golpe para
  }

  // Efeito que um golpe causa, conforme a evolução do monstro (ou null)
  // O efeito é o do elemento do golpe (no tipo duplo, cada golpe traz o efeito do seu elemento)
  efeitoDoGolpe(c, gp) {
    const nome = EFEITO_DO_ELEMENTO[gp.elemento];
    const m = c.melhoria;
    if (!nome || !c.esp.elementos.includes(gp.elemento)) return null;
    // chance = probabilidade de o efeito pegar a cada acerto (fica em dados.js)
    const chance = chanceDoEfeito(nome, gp.tipo);
    if (gp.tipo === 'area' && m.efeitoArea) return { nome, chance, dur: EFEITOS[nome].duracao * m.forcaEfeito };
    if (gp.tipo === 'corpo' && m.efeitoPerto) return { nome, chance, dur: EFEITOS[nome].duracao * m.forcaEfeito * DURACAO_EFEITO_PERTO };
    if (gp.tipo === 'projetil' && m.efeitoDisparo) return { nome, chance, dur: EFEITOS[nome].duracao * m.forcaEfeito * DURACAO_EFEITO_DISPARO };
    return null;
  }

  executar(c, p) {
    const gp = p.gp, dir = p.dir;
    if (gp.vinha) {
      this.musguinho.iniciarVinha(c, gp, dir, this.efeitoDoGolpe(c, gp)); // chicote de vinha: estica e puxa
    } else if (gp.espinhos) {
      this.pedrisco.iniciarPunho(c, gp, dir, this.efeitoDoGolpe(c, gp)); // punho sísmico: espinhos à frente
    } else if (gp.arco) {
      this.pedrisco.lancar(c, gp, p.quedas, p.aviso, this.efeitoDoGolpe(c, gp)); // pedra em arco
    } else if (gp.dashRaio) {
      this.faisquinho.iniciarDash(c, gp, dir, this.efeitoDoGolpe(c, gp)); // dash elétrico: marca, sem dano
    } else if (gp.nuvens) {
      this.faisquinho.iniciarNuvens(c, gp, this.efeitoDoGolpe(c, gp)); // nuvens que soltam raios
    } else if (gp.sol) {
      this.solito.soltarSol(c, gp);                                      // sol que dá bônus
    } else if (gp.laser) {
      this.solito.atirarLaser(c, gp, dir, this.efeitoDoGolpe(c, gp));   // laser
    } else if (gp.calor) {
      this.solito.iniciarCalor(c, gp, this.efeitoDoGolpe(c, gp));       // calor em volta
    } else if (gp.passo) {
      this.lumino.iniciarPasso(c, gp, dir, this.efeitoDoGolpe(c, gp));  // teletransporte com cristais
    } else if (gp.divide) {
      this.lumino.atirarCristal(c, gp, dir, this.efeitoDoGolpe(c, gp)); // cristal que se divide
    } else if (gp.redoma) {
      this.lumino.iniciarRedoma(c, gp, this.efeitoDoGolpe(c, gp));      // redoma que devolve tiros
    } else if (gp.combo) {
      this.lunico.iniciarCombo(c, gp, dir, this.efeitoDoGolpe(c, gp));  // dashes que cruzam o alvo
    } else if (gp.fases) {
      this.lunico.atirarFase(c, gp, dir, this.efeitoDoGolpe(c, gp));    // fases da lua
    } else if (gp.luar) {
      this.lunico.iniciarLuar(c, gp, this.efeitoDoGolpe(c, gp));        // círculo de luar
    } else if (gp.tipo === 'corpo') {
      c.dash = { dir: dir.clone(), t: 0.17, vel: 12, gp, acertou: false, efeito: this.efeitoDoGolpe(c, gp) };
      if (this.trevas.dele(c)) this.trevas.avancar(c);
      if (this.brasito.dele(c) && gp === GOLPES.investida) this.brasito.aoUsarInvestida(c);
      if (this.gotinho.dele(c) && gp === GOLPES.investida) this.gotinho.aoUsarInvestida(c);
      if (this.pedrisco.dele(c) && gp === GOLPES.investida) this.pedrisco.aoUsarInvestida(c);
    } else if (gp.onda) {
      this.gotinho.iniciarOnda(c, gp, dir, this.efeitoDoGolpe(c, gp)); // onda / onda dupla
    } else if (gp.anel) {
      this.gotinho.iniciarAnel(c, gp, this.efeitoDoGolpe(c, gp));      // maremoto
    } else if (gp.jato) {
      this.brasito.iniciarJato(c, gp, dir, this.efeitoDoGolpe(c, gp)); // lança-chamas
    } else if (gp.tamanhoRabo) {
      this.brasito.iniciarGiro(c, gp, dir, this.efeitoDoGolpe(c, gp)); // rabo de fogo
    } else if (gp.tipo === 'projetil') {
      this.disparar(c, gp, dir, 1);
      if (this.trevas.dele(c) && gp.elemento === 'trevas') this.trevas.aoDisparar(c, dir);
      // Evoluções disparam de novo em sequência (rajada)
      if (c.melhoria.disparos > 1) c.rajada = { gp, dir: dir.clone(), restantes: c.melhoria.disparos - 1, t: 0.16 };
    } else {
      const cor = ELEMENTOS[gp.elemento].cor;
      const efeito = this.efeitoDoGolpe(c, gp);
      const sombrio = this.trevas.dele(c) && gp.elemento === 'trevas';
      this.efeitoAnel(c.pos, gp.raio, cor);
      if (efeito) this.efeitoAnel(c.pos, gp.raio * 0.7, EFEITOS[efeito.nome].cor);
      if (!sombrio) this.particulas(c.pos, cor, 14, 1.2);
      // a área acerta todos os adversários dentro do círculo
      const atingidos = [];
      for (const alvo of this.alvosDe(c)) {
        if (dist(c, alvo) <= gp.raio + alvo.raio * 0.5) {
          if (this.aplicarDano(c, alvo, gp, new THREE.Vector3(alvo.pos.x - c.pos.x, 0, alvo.pos.z - c.pos.z).normalize(), { efeito })) atingidos.push(alvo);
        }
      }
      if (sombrio) this.trevas.area(c, gp, atingidos);
      if (this.musguinho.dele(c)) this.musguinho.aoUsarArea(c, gp); // raízes, moita ou bosque
      if (this.pedrisco.dele(c)) this.pedrisco.aoUsarArea(c, gp);   // tremor e pilares
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
    const topo = alvo.pos.clone().setY(alvo.altura);
    // opcoes.garantido = acerto garantido (Choque e raios das nuvens nos marcados): não dá para esquivar nem errar
    if (alvo.invul > 0 && !opcoes.garantido) {
      this.jogo.numero('Esquivou!', topo, '#ffffff', 'pequeno');
      return false;
    }
    // Ofuscado: quem ataca pode errar
    if (at.tem('ofuscado') && !opcoes.garantido && Math.random() < 0.4) {
      this.jogo.numero('Errou!', topo, '#ffab2e', 'pequeno');
      return false;
    }
    const mult = multiplicadorContra(gp.elemento, alvo.esp.elementos);
    const def = alvo.stats.def * (alvo.tem('soterrado') ? 0.7 : 1);
    const exposto = alvo.tem('exposto') ? 1.3 : 1;
    const nivel = fatorDanoNivel(at.dados.nivel);  // dano cresce com o nível de quem ataca
    const arena = at.mod?.dano ?? 1;               // bônus/penalidade da arena
    // Sol da linha do Solito: quem soltou causa mais dano e recebe menos
    const sol = (1 + (at.sol?.cfg.ataque ?? 0)) * (1 - (alvo.sol?.cfg.defesa ?? 0));
    const breu = 1 + (at.breu?.cfg.dano ?? 0); // área da linha de Trevas: +5% a +15% de dano
    // linha do Lunico (Crescêntio em diante): golpe em quem está dormindo dá mais dano
    // Redoma da linha do Lumino: quem está dentro recebe menos dano
    const redoma = alvo.redoma ? 1 - alvo.redoma.cfg.reducao : 1;
    const despertar = alvo.tem('sono') && at.melhoria?.despertar ? 1 + at.melhoria.despertar : 1;
    const gmDano = at.lado === 'jogador' ? (this.jogo.gm?.dano || 1) : 1; // GM: dano ×10
    const dano = Math.max(1, Math.round(DANO_GERAL * gp.poder * (opcoes.fator ?? 1) * (at.stats.atk / def) * mult * exposto * nivel * arena * sol * breu * despertar * redoma * gmDano * (0.9 + Math.random() * 0.2)));
    // Escudo d'Água (linha do Gotinho) segura o dano antes da vida
    const passou = this.gotinho.absorver(alvo, dano);
    alvo.dados.hp = Math.max(0, alvo.dados.hp - passou);
    if (alvo.tem('sono')) { alvo.status.sono = 0; this.jogo.numero('Acordou!', topo.clone().setY(topo.y + 0.5), '#b9b4ff', 'pequeno'); }
    alvo.flash = 0.18;
    // dano "leve" (cada pedaço do lança-chamas): empurra e trava menos
    alvo.stun = opcoes.leve ? 0.06 : 0.18;
    // opcoes.empurrao = empurrão maior (as ondas da linha do Gotinho)
    const emp = opcoes.empurrao ?? (opcoes.leve ? 2 : 7);
    alvo.emp.set(dir.x * emp, 0, dir.z * emp);
    if (gp.lentidao) alvo.lento = gp.lentidao;
    const cor = alvo.lado === 'inimigo' ? '#ffe066' : '#ff6b81';
    if (passou > 0) this.jogo.numero(String(passou), topo, cor, mult > 1 ? 'grande' : '');
    const avisaTipo = !opcoes.leve || opcoes.primeiro; // no lança-chamas, só no 1º pedaço
    if (mult > 1 && avisaTipo) this.jogo.numero('Super efetivo!', topo.clone().setY(topo.y + 0.9), '#ffd23f', 'pequeno');
    else if (mult < 1 && avisaTipo) this.jogo.numero('Pouco efetivo', topo.clone().setY(topo.y + 0.9), '#c9d6e8', 'pequeno');
    this.particulas(alvo.pos, ELEMENTOS[gp.elemento].cor, 8, 0.9);
    if (alvo.dados.hp <= 0) { this.desmaiar(alvo); return true; }
    if (alvo.esp.chefe && !alvo.furia && alvo.frac < 0.5) {
      alvo.furia = true;
      const corFuria = ELEMENTOS[alvo.esp.elemento].cor;
      piscar(alvo.modelo, 0.6, corFuria);
      this.particulas(alvo.pos, corFuria, 30, 2);
      this.jogo.aviso(`${alvo.esp.nome} entrou em FÚRIA! Ataca mais rápido.`);
    }
    // o efeito só pega se passar no sorteio da chance (ex.: 30% para Medo na área)
    // se o escudo segurou tudo, o efeito também não pega
    if (opcoes.efeito && passou > 0 && Math.random() < (opcoes.efeito.chance ?? 1)) this.aplicarEfeito(alvo, opcoes.efeito.nome, opcoes.efeito.dur, at);
    return true;
  }

  aplicarEfeito(alvo, nome, dur, causador) {
    if (alvo.morto) return;
    const ef = EFEITOS[nome];
    const novo = !alvo.tem(nome);
    alvo.status[nome] = Math.max(alvo.status[nome] || 0, dur);
    if (nome === 'queimadura' || nome === 'combustao') { alvo.fonteFogo = causador; alvo.tickFogo = 0.5; }
    if (nome === 'parasita') { alvo.fonteParasita = causador; if (novo) alvo.tickParasita = 0.5; }
    if ((nome === 'paralisia' || nome === 'sono') && alvo.prep) this.cancelarPreparo(alvo);
    if (novo) {
      this.jogo.numero(ef.nome + '!', alvo.pos.clone().setY(alvo.altura + 0.7), ef.cor, 'pequeno');
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
    if (c.tem('queimadura') || c.tem('combustao')) {
      c.tickFogo -= dt;
      if (c.tickFogo <= 0) {
        c.tickFogo = 0.5;
        // Combustão (Ígneo) queima 3% a cada meio segundo; queimadura comum, 2%
        const dano = Math.max(1, Math.round(c.stats.hpMax * (c.tem('combustao') ? 0.03 : 0.02)));
        c.dados.hp = Math.max(0, c.dados.hp - dano);
        this.jogo.numero(String(dano), c.pos.clone().setY(c.altura * 0.8), '#ff9a4a', 'pequeno');
        if (c.dados.hp <= 0) { this.desmaiar(c); return; }
      }
    }
    // Parasita (Silvestre): suga 2,5% da vida a cada meio segundo e cura quem plantou a semente
    if (c.tem('parasita')) {
      c.tickParasita = (c.tickParasita ?? 0.5) - dt;
      if (c.tickParasita <= 0) {
        c.tickParasita = 0.5;
        const dano = Math.max(1, Math.round(c.stats.hpMax * 0.025));
        c.dados.hp = Math.max(0, c.dados.hp - dano);
        this.jogo.numero(String(dano), c.pos.clone().setY(c.altura * 0.8), '#1fe0a0', 'pequeno');
        const f = c.fonteParasita;
        if (f && !f.morto && !f.tem('combustao') && f.dados.hp < f.stats.hpMax) {
          f.dados.hp = Math.min(f.stats.hpMax, f.dados.hp + dano);
          this.jogo.numero('+' + dano, f.pos.clone().setY(f.altura), '#5fe08a', 'pequeno');
        }
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
        if (c.tem('sono') && Math.random() < 0.5) this.jogo.numero('z', c.pos.clone().setY(c.altura + 0.3), '#dcd6ff', 'pequeno');
      }
    }
  }

  desmaiar(l) {
    if (l.morto) return;
    // GM invencível: seu monstro não desmaia (a vida volta a encher)
    if (l.lado === 'jogador' && this.jogo.gm?.invencivel) { l.dados.hp = l.stats.hpMax; return; }
    l.morto = true;
    if (l.prep) this.cancelarPreparo(l);
    l.dash = null;
    l.rajada = null;
    this.brasito.parar(l);
    this.gotinho.parar(l);
    this.musguinho.parar(l);
    this.pedrisco.parar(l);
    this.faisquinho.parar(l);
    this.solito.parar(l);
    this.lunico.parar(l);
    this.lumino.parar(l);
    l.veloz = null;
    l.breu = null;
    if (l.lado === 'inimigo') {
      this.derrotados.push(l.dados);
      if (l.dados.lider) this.liderDerrotado = true;
      const resta = this.restantes();
      if (this.treinador) {
        this.jogo.aviso(`${l.esp.nome} de ${this.treinador.nome} desmaiou!` + (resta ? ` Faltam ${resta}.` : ''));
        this.arena.festa(resta ? 1.4 : 4); // a plateia comemora
      } else this.jogo.aviso(l.dados.lider ? `O líder ${l.esp.nome} desmaiou!` : `${l.esp.nome} selvagem desmaiou!` + (this.grupo && resta ? ` Restam ${resta}.` : ''));
      this.verificarFim();
    } else {
      this.jogo.aviso(`${l.esp.nome} desmaiou!`);
      if (this.proximoDePe() >= 0) this.trocaAuto = 1.2;
      else this.fim = { tipo: 'derrota', t: 1.8 };
    }
  }

  // Quantos inimigos ainda faltam (na arena + esperando na fila)
  restantes() {
    return this.inimigos.filter((l) => !l.morto && !this.capturados.includes(l.dados)).length + this.fila.length;
  }

  verificarFim() {
    if (!this.fim && this.restantes() === 0) this.fim = { tipo: 'vitoria', t: 1.6 };
  }

  esquivar(c, mv, outro) {
    if (c.cdEsq > 0 || c.dash || c.combo || c.stun > 0 || c.morto || !c.podeAndar()) return;
    const dir = mv ? new THREE.Vector3(mv.x, 0, mv.z) : new THREE.Vector3(c.pos.x - outro.pos.x, 0, c.pos.z - outro.pos.z);
    if (dir.lengthSq() < 1e-4) dir.set(1, 0, 0);
    dir.normalize();
    if (c.prep) this.cancelarPreparo(c);
    c.dash = { dir, t: 0.2, vel: 17, esquiva: true };
    c.invul = 0.34;
    c.cdEsq = 1.0;
  }

  fisica(c, dt) {
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
        this.executar(c, p);
      }
    }

    if (c.jato) this.brasito.atualizarJato(c, dt);
    if (c.giro) this.brasito.atualizarGiro(c, dt);
    if (c.vinha) this.musguinho.atualizarVinha(c, dt);
    if (c.punho) this.pedrisco.atualizarPunho(c, dt);
    if (c.combo) this.lunico.atualizarCombo(c, dt);

    if (c.dash) {
      const ds = c.dash;
      c.pos.addScaledVector(ds.dir, ds.vel * dt);
      ds.t -= dt;
      if (ds.dashRaio) this.faisquinho.atualizarDash(c); // dash elétrico marca quem passar perto
      if (ds.gp && !ds.acertou) {
        // o golpe de perto acerta o primeiro adversário que encostar
        const alvo = this.alvosDe(c).find((o) => dist(c, o) < c.raio + o.raio + 0.5);
        if (alvo) {
          ds.acertou = true;
          if (this.aplicarDano(c, alvo, ds.gp, ds.dir, { efeito: ds.efeito }) && this.trevas.dele(c)) this.trevas.acertoPerto(c, alvo);
          ds.t = 0;
        }
      }
      if (ds.t <= 0) {
        if (ds.gp && !ds.acertou) {
          const alvo = this.alvosDe(c).find((o) => {
            const tx = o.pos.x - c.pos.x, tz = o.pos.z - c.pos.z, d = Math.hypot(tx, tz);
            return d <= ds.gp.alcance + o.raio * 0.5 && (tx * ds.dir.x + tz * ds.dir.z) / (d || 1) > 0.5;
          });
          if (alvo && this.aplicarDano(c, alvo, ds.gp, ds.dir, { efeito: ds.efeito }) && this.trevas.dele(c)) this.trevas.acertoPerto(c, alvo);
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
    // no modelo do Blender a volta do Rabo de Fogo já está na animação
    m.rotation.y = c.ang + (c.dash?.esquiva ? (0.2 - c.dash.t) * 30 : 0) + (c.giro && !m.userData.glb ? c.giro.spin : 0);
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
    if (this.trevas.dele(c) && gp.elemento === 'trevas') {
      // tiro de Trevas: bola com olhos, lâmina ou morcego (depende da forma)
      const info = this.trevas.projetil(c, ang, gp);
      const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
      const pos = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(0.8 * c.esp.tamanho);
      info.obj.position.copy(pos);
      if (fator < 1) info.obj.scale.setScalar(0.85);
      this.cena.add(info.obj);
      // a bola com olhos some quando chega no alcance; a Bola Sombria do Breuzinho vai longe (1,4 s)
      const vida = gp.alcance ? gp.alcance / gp.velocidade : 1.4;
      this.projeteis.push({ mesh: info.obj, trevas: info, pos, dir, gp, dono: c, lado: c.lado, vida, fator, efeito: this.efeitoDoGolpe(c, gp) });
      return;
    }
    if (this.musguinho.dele(c) && gp.bumerangue) {
      // folha bumerangue da linha do Musguinho: vai, faz a curva e volta
      const obj = this.musguinho.projetil(gp, ang, fator);
      const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
      const pos = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(0.8 * c.esp.tamanho);
      obj.position.copy(pos);
      this.cena.add(obj);
      // as folhas do mesmo uso dividem a lista de quem já sorteou o efeito
      const sorteados = this.sorteadosFolha?.dono === c && this.sorteadosFolha.t === this.t ? this.sorteadosFolha.lista : new Set();
      this.sorteadosFolha = { dono: c, t: this.t, lista: sorteados };
      this.projeteis.push({ mesh: obj, bumerangue: true, fixo: true, fase: 'ida', andou: 0, atingidos: new Set(), sorteados, pos, dir, gp, dono: c, lado: c.lado, vida: 10, fator, efeito: this.efeitoDoGolpe(c, gp) });
      return;
    }
    if (this.faisquinho.dele(c) && gp.marca) {
      // tiro da linha do Faisquinho: raiozinho que marca quem acertar
      const obj = this.faisquinho.projetil(gp, ang, fator);
      const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
      const pos = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(0.8 * c.esp.tamanho);
      obj.position.copy(pos);
      this.cena.add(obj);
      this.projeteis.push({ mesh: obj, faisca: true, fixo: true, pos, dir, gp, dono: c, lado: c.lado, vida: gp.alcance / gp.velocidade, fator, efeito: this.efeitoDoGolpe(c, gp) });
      return;
    }
    if (this.gotinho.dele(c) && gp.visual) {
      // tiro da linha do Gotinho: jato fino (atravessa) ou bola do Hidrocanhão (explode)
      const obj = this.gotinho.projetil(gp, ang, fator);
      const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
      const pos = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(0.8 * c.esp.tamanho);
      obj.position.copy(pos);
      this.cena.add(obj);
      this.projeteis.push({ mesh: obj, gotinho: true, fixo: true, atravessa: gp.atravessa || 0, atingidos: new Set(), pos, dir, gp, dono: c, lado: c.lado, vida: 1.4, fator, efeito: this.efeitoDoGolpe(c, gp) });
      return;
    }
    const mesh = new THREE.Mesh(GEO_PROJ[gp.elemento] || GEO_PROJ.normal, new THREE.MeshLambertMaterial({ color: gp.elemento === 'trevas' ? '#3a1a5a' : cor, emissive: cor, emissiveIntensity: 0.6, flatShading: true, transparent: gp.elemento === 'agua', opacity: 0.85 }));
    if (gp.elemento === 'planta') mesh.scale.set(1, 0.3, 1.7);
    if (gp.elemento === 'raio') mesh.scale.set(0.7, 0.7, 2.4);
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const pos = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(0.8 * c.esp.tamanho);
    mesh.position.copy(pos);
    mesh.rotation.y = ang;
    this.cena.add(mesh);
    if (fator < 1) mesh.scale.multiplyScalar(0.8);
    this.projeteis.push({ mesh, pos, dir, gp, dono: c, lado: c.lado, vida: 1.4, fator, efeito: this.efeitoDoGolpe(c, gp) });
  }

  atualizarProjeteis(dt) {
    for (let i = this.projeteis.length - 1; i >= 0; i--) {
      const p = this.projeteis[i];
      if (p.bumerangue) this.musguinho.moverFolha(p, dt); // folha que vai e volta
      else p.pos.addScaledVector(p.dir, (p.vel ?? p.gp.velocidade) * dt);
      p.vida -= dt;
      p.mesh.position.copy(p.pos);
      if (p.trevas) this.trevas.atualizarProjetil(p, dt);
      else if (p.gotinho) this.gotinho.atualizarProjetil(p, dt);
      else if (p.faisca) this.faisquinho.atualizarProjetil(p, dt);
      else if (p.luaFase) this.lunico.atualizarProjetil(p, dt);
      else if (p.luzCristal || p.luzRaio) this.lumino.atualizarProjetil(p, dt);
      else if (p.bumerangue) { /* a folha gira em moverFolha */ }
      else if (p.gp.elemento === 'lua') p.mesh.rotation.y += dt * 14;
      else if (p.gp.elemento !== 'planta' && p.gp.elemento !== 'raio') p.mesh.rotation.x += dt * 8;
      const alvos = p.lado === 'jogador' ? this.vivos() : (this.jog.morto ? [] : [this.jog]);
      let acabou = p.vida <= 0 || p.chegou || Math.hypot(p.pos.x, p.pos.z) > RAIO_ARENA + 1;
      // obstáculos seguram os disparos: dá para se esconder atrás deles
      if (!acabou && this.arena.bloqueia(p.pos, (p.raio ?? p.gp.raio) * 0.6)) {
        acabou = true;
        p.bateu = true; // bateu num obstáculo (o cristal da Luz não se divide)
        this.particulas(p.pos, ELEMENTOS[p.gp.elemento].cor, 5, 0.6);
      }
      const alvo = acabou ? null : alvos.find((o) => !p.atingidos?.has(o) && Math.hypot(p.pos.x - o.pos.x, p.pos.z - o.pos.z) < (p.raio ?? p.gp.raio) + o.raio);
      if (alvo) {
        const acertou = this.aplicarDano(p.dono, alvo, p.gp, p.dir, { fator: p.fator, efeito: p.bumerangue ? this.musguinho.efeitoDaFolha(p, alvo) : p.efeito });
        if (p.faisca && acertou) this.faisquinho.aoAcertarTiro(p, alvo); // marca e deixa o Choque pronto
        if (p.bumerangue) {
          // folha bumerangue: passa pelo alvo e segue (acerta cada um uma vez na ida e uma na volta)
          p.atingidos.add(alvo);
          p.acertou = true;
        } else if (p.atravessa > 0) {
          // Jato d'Água: atravessa e segue com menos força
          p.atravessa--;
          p.atingidos.add(alvo);
          p.fator *= p.gp.fatorAtravessa ?? 1;
          this.gotinho.respingo(p.pos, 5, 0.5, p.pos.y);
        } else acabou = true;
        if (p.trevas) this.trevas.impacto(p);
        if (p.gotinho && acabou) this.gotinho.impacto(p, alvo);
      } else if (acabou && p.trevas && p.vida > 0) this.trevas.impacto(p);
      else if (acabou && p.gotinho && p.vida > 0) this.gotinho.impacto(p, null);
      if (acabou && p.luaFase) this.lunico.impacto(p, alvo); // a Lua Cheia explode
      if (acabou && p.luzCristal && !p.bateu) this.lumino.dividir(p, alvo); // o cristal se divide em raios
      if (acabou) {
        this.cena.remove(p.mesh);
        if (!p.trevas && !p.fixo) p.mesh.material.dispose(); // os tiros de Trevas usam materiais fixos
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
        // efeitos de Trevas são grupos com materiais próprios (e.mats) ou fixos
        if (e.mats) e.mats.forEach((m) => m.dispose());
        else if (e.obj.material && !e.obj.material.userData?.fixo) e.obj.material.dispose();
        this.efeitos.splice(i, 1);
      }
    }
  }

  // ---------- captura ----------
  // Escolhe sozinho o cristal mais fraco que funciona no alvo (para não gastar os fortes à toa)
  cristalAutomatico() {
    const min = this.ini?.esp.cristalMin || 0, p = this.jogo.estado.pedras;
    for (let k = min; k < CRISTAIS.length; k++) if (p[CRISTAIS[k].id] > 0) return k;
    return min;
  }

  // Setinha ao lado do cristal: abre (ou fecha) a lista para escolher o tipo
  abrirSeletor() {
    const el = this.jogo.ui.seletor;
    if (!el.hidden) { this.fecharSeletor(); return; }
    el.hidden = false;
  }
  fecharSeletor() { this.jogo.ui.seletor.hidden = true; }
  escolherCristal(k) {
    const min = this.ini?.esp.cristalMin || 0;
    if (k < min) { this.jogo.aviso(`Precisa de ${CRISTAIS[min].nome} ou melhor.`); return; }
    if (this.jogo.estado.pedras[CRISTAIS[k].id] <= 0) { this.jogo.aviso(`Sem ${CRISTAIS[k].nome}.`); return; }
    this.tipoCristal = k;
    this.cristalEscolhido = true;
    this.fecharSeletor();
  }

  // Tecla V: passa para o próximo cristal que você tem
  trocarCristal() {
    const p = this.jogo.estado.pedras;
    for (let k = 1; k <= CRISTAIS.length; k++) {
      const n = (this.tipoCristal + k) % CRISTAIS.length;
      if (p[CRISTAIS[n].id] > 0) { this.tipoCristal = n; this.cristalEscolhido = true; return; }
    }
    this.jogo.aviso('Você só tem esse tipo de cristal.');
  }

  lancarCristal() {
    if (this.fim || this.captura || this.jog.morto || !this.ini || this.ini.morto) return;
    if (this.treinador) { this.jogo.aviso('Não dá para capturar o monstro de um treinador!'); return; }
    const est = this.jogo.estado, tipo = CRISTAIS[this.tipoCristal];
    const garantida = !!this.jogo.gm?.capturaGarantida; // GM: qualquer cristal segura qualquer monstro
    const min = garantida ? 0 : this.ini.esp.cristalMin || 0;
    if (this.tipoCristal < min) {
      this.jogo.aviso(`${this.ini.esp.nome} é de tipo duplo: só um ${CRISTAIS[min].nome} (ou melhor) segura ele.`);
      return;
    }
    if (est.pedras[tipo.id] <= 0) {
      this.jogo.aviso(this.tipoCristal === 0 ? 'Sem cristais! Procure brilhos azuis pelo mapa.' : `Sem ${tipo.nome}! Junte cristais na sua casa ou vença líderes.`);
      return;
    }
    est.pedras[tipo.id]--;
    const sucesso = garantida || Math.random() < chanceCaptura(this.ini.dados, this.tipoCristal);
    if (this.jog.prep) this.cancelarPreparo(this.jog);
    for (const l of this.inimigos) { if (l.prep) this.cancelarPreparo(l); l.dash = null; l.rajada = null; this.brasito.parar(l); this.gotinho.parar(l, false); this.musguinho.parar(l); this.pedrisco.parar(l); this.faisquinho.parar(l, false); this.lunico.parar(l); this.lumino.parar(l); }
    const cr = criarCristal(1.1, this.tipoCristal);
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
      if (k >= 1) { c.fase = 'sugando'; c.t = 0; this.particulas(ini.pos, CRISTAIS[this.tipoCristal].cor, 12, 1); }
    } else if (c.fase === 'sugando') {
      const k = Math.min(1, c.t / 0.35);
      ini.modelo.scale.setScalar(ini.escala * (1 - k));
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
            this.capturados.push(ini.dados);
            if (ini.dados.lider) this.liderDerrotado = true;
            // tira o capturado da arena; se ainda há inimigos, a luta continua
            this.inimigos.splice(this.inimigos.indexOf(ini), 1);
            this.cena.remove(ini.modelo);
            descartar(ini.modelo);
            this.verificarFim();
            if (!this.fim) {
              const crCapturado = cr;
              this.efeitos.push({ obj: crCapturado, vida: 0.8, total: 0.8, upd: (e, k) => { e.obj.position.y = 0.4 + k * 3; e.obj.scale.setScalar(1.1 * (1 - k)); } });
              this.captura = null;
              this.escolherAlvo();
            }
          } else {
            this.particulas(ini.pos, '#8ff4ff', 16, 1.4);
            this.cena.remove(cr);
            cr.material.dispose();
            ini.modelo.visible = true;
            ini.modelo.scale.setScalar(ini.escala);
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

  // ---------- poções ----------
  abrirPocoes() {
    const el = document.getElementById('seletor-pocao');
    this.fecharSeletor();
    el.hidden = !el.hidden;
  }
  fecharPocoes() { const el = document.getElementById('seletor-pocao'); if (el) el.hidden = true; }
  // Cura: o monstro que está lutando. Reviver: o 1º desmaiado da equipe (depois é só trocar para ele).
  usarPocao(qual) {
    this.fecharPocoes();
    if (this.fim || this.captura) return;
    const est = this.jogo.estado;
    if (this.pocaoCd > 0) { this.jogo.aviso(`Espere ${Math.ceil(this.pocaoCd)} s para usar outra poção.`); return; }
    if ((est.pocoes?.[qual] || 0) <= 0) { this.jogo.aviso(`Sem ${qual === 'cura' ? 'Poções de Cura' : 'Poções de Reviver'}. Compre na loja do Reino.`); return; }
    let alvo;
    if (qual === 'cura') {
      alvo = this.jog.morto ? null : this.jog.dados;
      if (alvo && alvo.hp >= this.jog.stats.hpMax) { this.jogo.aviso(`${this.jog.esp.nome} já está com a vida cheia.`); return; }
    } else {
      alvo = est.equipe.find((m) => m.hp <= 0);
      if (!alvo) { this.jogo.aviso('Ninguém da equipe está desmaiado.'); return; }
    }
    const antes = alvo?.hp ?? 0;
    const txt = alvo && aplicarPocao(est, qual, alvo);
    if (!txt) return;
    this.pocaoCd = RECARGA_POCAO;
    this.jogo.aviso(txt);
    if (qual === 'cura') {
      this.jogo.numero('+' + (alvo.hp - antes), this.jog.pos.clone().setY(this.jog.altura), '#5fe08a', '');
      this.particulas(this.jog.pos, '#ff8a8a', 14, 1);
    } else this.jogo.aviso('Toque em Trocar para mandar ele de volta à luta.');
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
    this.gotinho.parar(velho);
    this.musguinho.parar(velho);
    this.pedrisco.parar(velho);
    this.faisquinho.parar(velho);
    this.solito.parar(velho);
    this.lunico.parar(velho);
    this.lumino.parar(velho);
    this.cena.remove(velho.modelo);
    descartar(velho.modelo);
    this.particulas(velho.pos, '#8ff4ff', 12, 1);
    const novo = new Lutador(this.jogo.estado.equipe[prox], 'jogador');
    novo.pos.copy(velho.pos);
    const mira = this.ini || velho;
    novo.ang = novo.angAlvo = Math.atan2(mira.pos.x - novo.pos.x, mira.pos.z - novo.pos.z);
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
    this.jogo.aviso(this.treinador ? `Você desistiu da luta com ${this.treinador.nome}.` : 'Você fugiu da batalha.');
    this.fim = { tipo: 'fuga', t: 0.5 };
  }

  // ---------- interface ----------
  // Ao mirar em outro inimigo: escolhe o cristal certo para ele e avisa se é tipo duplo
  montarHudInimigo() {
    const e = this.ini;
    this.alvoHud = e;
    if (!e) return;
    if (!this.cristalEscolhido || this.tipoCristal < (e.esp.cristalMin || 0)) this.tipoCristal = this.cristalAutomatico();
    if (e.esp.dupla && !this.avisouDuplo?.has(e)) {
      (this.avisouDuplo ||= new Set()).add(e);
      this.jogo.aviso(`Tipo duplo: só ${CRISTAIS[e.esp.cristalMin].nome} ou melhor.`);
    }
  }

  montarHud() {
    this.jogo.ui.placas.innerHTML = '';
    // luta de treinador: sem cristais (os botões somem)
    this.jogo.ui.btnCristal.hidden = !!this.treinador;
    const tipo = document.getElementById('btn-tipo-cristal');
    if (tipo) tipo.hidden = !!this.treinador;
    this.placas = new Map();
    this.fecharSeletor();
    this.montarHudInimigo();
    this.montarBotoes();
  }

  montarBotoes() {
    const ui = this.jogo.ui, j = this.jog;
    ui.bjNome.textContent = j.esp.nome;
    ui.bjNivel.textContent = 'Nv.' + j.dados.nivel;
    const tipos = { corpo: 'perto', projetil: 'disparo', area: 'área' };
    ui.golpes.forEach((b, i) => {
      const gp = j.golpe(i);
      // Fases da Lua: o botão mostra a próxima fase
      b.querySelector('.nome').textContent = gp.fases ? this.lunico.faseAtual(j, gp).nome : gp.nome;
      const extra = gp.tipo === 'projetil' && j.melhoria.disparos > 1 ? ` ×${j.melhoria.disparos}` : '';
      const efB = this.efeitoDoGolpe(j, gp);
      b.querySelector('.tipo').textContent = tipos[gp.tipo] + extra + (efB ? ' ' + pct(efB.chance) : '');
      b.style.setProperty('--cor', ELEMENTOS[gp.elemento].cor);
      // bolinha na cor do efeito quando o golpe causa um efeito negativo
      const ef = this.efeitoDoGolpe(j, gp);
      b.classList.toggle('com-efeito', !!ef);
      if (ef) { b.style.setProperty('--ef', EFEITOS[ef.nome].cor); b.title = `${pct(ef.chance)} de chance de causar ${EFEITOS[ef.nome].nome}`; }
      else b.removeAttribute('title');
    });
  }

  // Fases da Lua: atualiza o nome do botão de disparo
  hudFases() { this.montarBotoes(); }

  // Só os efeitos ativos (os bônus de arena não aparecem mais, para limpar a tela)
  htmlStatus(l) {
    const veloz = l.veloz ? `<span style="--cor:#7dffa0">Veloz +${Math.round(l.veloz.bonus * 100)}% ${l.veloz.t.toFixed(0)}s</span>` : '';
    const escudo = l.escudo ? `<span style="--cor:#8fdcff">Escudo ${l.escudo.valor} ${l.escudo.t.toFixed(0)}s</span>` : '';
    const sol = l.sol ? `<span style="--cor:#ffab2e">Sol +${Math.round(l.sol.cfg.ataque * 100)}% ${l.sol.t.toFixed(0)}s</span>` : '';
    const redoma = l.redoma ? `<span style="--cor:#fff6c8">Redoma ${Math.max(0, l.redoma.cfg.duracao - l.redoma.t).toFixed(0)}s</span>` : '';
    const luar = l.luarVel ? `<span style="--cor:#e2ddff">Fúria Lunar +${Math.round(l.luarVel.f * 100)}%</span>` : '';
    const breu = l.breu ? `<span style="--cor:#b57be8">Trevas +${Math.round(l.breu.cfg.dano * 100)}% ${l.breu.t.toFixed(0)}s</span>` : '';
    const marcas = l.marcas ? `<span style="--cor:#f7e43a">Marcado ×${l.marcas.n} ${l.marcas.t.toFixed(0)}s</span>` : '';
    return veloz + escudo + sol + breu + luar + redoma + marcas + Object.entries(l.status).map(([k, v]) => `<span style="--cor:${EFEITOS[k].cor}">${EFEITOS[k].nome} ${v.toFixed(1)}s</span>`).join('');
  }

  // Placa em cima de cada inimigo: só o nome e uma barrinha de vida
  atualizarPlacas() {
    const ui = this.jogo.ui, vistos = new Set();
    for (const l of this.inimigos) {
      if (l.morto || !l.modelo.visible) continue;
      vistos.add(l);
      let p = this.placas.get(l);
      if (!p) {
        const el = document.createElement('div');
        el.className = 'placa-ini';
        el.innerHTML = `<span></span><small style="color:#f7e43a;margin-left:4px"></small><i class="vida"><b></b></i>`;
        el.querySelector('span').textContent = l.esp.nome;
        ui.placas.appendChild(el);
        p = { el, barra: el.querySelector('b'), marca: el.querySelector('small'), txtMarca: '' };
        this.placas.set(l, p);
      }
      const f = Math.max(0, l.frac);
      p.barra.style.width = (f * 100).toFixed(1) + '%';
      p.barra.dataset.nivel = f > 0.5 ? 'alto' : f > 0.2 ? 'medio' : 'baixo';
      p.el.classList.toggle('alvo', this.grupo && l === this.ini);
      p.el.classList.toggle('chefe', this.chefe);
      p.el.classList.toggle('lider', !!l.dados.lider);
      p.el.classList.toggle('furia', !!l.furia);
      // marcas da linha do Faisquinho: "⚡2" ao lado do nome
      const txtMarca = l.marcas ? '⚡' + l.marcas.n : '';
      if (p.txtMarca !== txtMarca) { p.txtMarca = txtMarca; p.marca.textContent = txtMarca; }
      const pos = this.jogo.projetar(l.pos.clone().setY(l.altura + 0.6), this.camera);
      p.el.hidden = pos.atras;
      p.x = pos.x; p.y = pos.y; p.w = p.el.offsetWidth || 70; p.h = p.el.offsetHeight || 26;
    }
    for (const [l, p] of this.placas) if (!vistos.has(l)) { p.el.remove(); this.placas.delete(l); }
    // não deixa uma placa em cima da outra: a de trás sobe um pouco
    const lista = [...this.placas.values()].sort((a, b) => b.y - a.y);
    for (let i = 0; i < lista.length; i++) for (let k = 0; k < i; k++) {
      const a = lista[k], b = lista[i];
      if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 4 && b.y > a.y - a.h - 2) b.y = a.y - a.h - 2;
    }
    // e mantém dentro da tela
    const W = this.jogo.palco.clientWidth;
    for (const p of lista) {
      const x = Math.min(W - p.w / 2 - 6, Math.max(p.w / 2 + 6, p.x)), y = Math.max(p.h + 4, p.y);
      p.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    }
  }

  // Lista do seletor: cada cristal com a quantidade e a chance no alvo atual
  atualizarSeletor(e) {
    const el = this.jogo.ui.seletor;
    if (el.hidden) return;
    if (!el.children.length) { // os botões são criados uma vez só (trocar no meio do toque faria perder o toque)
      el.innerHTML = CRISTAIS.map((c, k) => `<button type="button" data-acao="cristal${k}" style="--c:${c.cor}"><span class="losango"></span><span></span><small></small></button>`).join('');
    }
    const p = this.jogo.estado.pedras, min = e.esp.cristalMin || 0;
    CRISTAIS.forEach((c, k) => {
      const bt = el.children[k], [, nome, chance] = bt.children;
      const tn = `${c.curto} ×${p[c.id]}`, tc = k < min ? 'não segura' : Math.round(chanceCaptura(e.dados, k) * 100) + '%';
      if (nome.textContent !== tn) nome.textContent = tn;
      if (chance.textContent !== tc) chance.textContent = tc;
      bt.classList.toggle('ativo', k === this.tipoCristal);
      bt.disabled = p[c.id] <= 0 || k < min;
    });
  }

  atualizarHud() {
    const ui = this.jogo.ui, j = this.jog, e = this.ini;
    if (!e) return;
    if (this.alvoHud !== e) this.montarHudInimigo();
    const f = Math.max(0, j.frac);
    ui.bjVida.style.width = (f * 100).toFixed(1) + '%';
    ui.bjVida.dataset.nivel = f > 0.5 ? 'alto' : f > 0.2 ? 'medio' : 'baixo';
    ui.bjHp.textContent = `${j.dados.hp}/${j.stats.hpMax}`;
    ui.golpes.forEach((b, i) => {
      const gp = j.golpe(i);
      const r = j.rec[i] / gp.recarga;
      // linha do Faisquinho: o botão do disparo vira "Choque" enquanto ele está pronto
      if (gp.marca) { const nome = this.faisquinho.nomeBotao(j, gp); if (b.dataset.nomeAtual !== nome) { b.dataset.nomeAtual = nome; b.querySelector('.nome').textContent = nome; } }
      b.style.setProperty('--p', r.toFixed(3));
      b.classList.toggle('carregando', r > 0);
      b.classList.toggle('bloqueado', !j.podeAtacar());
    });
    const sj = this.htmlStatus(j);
    if (ui.bjStatus.innerHTML !== sj) ui.bjStatus.innerHTML = sj;
    this.atualizarPlacas();
    const cr = CRISTAIS[this.tipoCristal], min = e.esp.cristalMin || 0;
    const txtCr = `${cr.id}|${this.jogo.estado.pedras[cr.id]}|${this.tipoCristal < min}`;
    if (this.txtCristal !== txtCr) {
      this.txtCristal = txtCr;
      ui.qtdCristal.textContent = this.jogo.estado.pedras[cr.id];
      ui.btnCristal.style.setProperty('--crist', cr.cor);
      ui.btnCristal.classList.toggle('fraco', this.tipoCristal < min);
      ui.btnCristal.title = `${cr.nome}: ${this.tipoCristal < min ? 'não segura este monstro' : Math.round(chanceCaptura(e.dados, this.tipoCristal) * 100) + '% de chance'}`;
    }
    this.atualizarSeletor(e);
    // botão das poções: quantas tem e a recarga
    const pc = this.jogo.estado.pocoes || { cura: 0, reviver: 0 }, bp = document.getElementById('btn-pocao');
    const txtP = `${pc.cura + pc.reviver}|${this.pocaoCd > 0}`;
    if (this.txtPocao !== txtP) {
      this.txtPocao = txtP;
      document.getElementById('qtd-pocao').textContent = pc.cura + pc.reviver;
      bp.classList.toggle('esperando', this.pocaoCd > 0);
      const sel = document.getElementById('seletor-pocao');
      sel.children[0].querySelector('small').textContent = `×${pc.cura} · no monstro da luta`;
      sel.children[1].querySelector('small').textContent = `×${pc.reviver} · num desmaiado`;
      sel.children[0].disabled = pc.cura <= 0; sel.children[1].disabled = pc.reviver <= 0;
    }
    bp.style.setProperty('--p', (this.pocaoCd / RECARGA_POCAO).toFixed(3));
    const eq = this.jogo.estado.equipe;
    const marcas = eq.map((m, i) => `<i class="${m.hp <= 0 ? 'fora' : ''} ${i === this.idx ? 'atual' : ''}"></i>`).join('');
    if (ui.bjEquipe.innerHTML !== marcas) ui.bjEquipe.innerHTML = marcas;
  }

  // Libera a memória dos materiais da arena quando a batalha acaba
  descartarTudo() {
    this.jogo.ui.placas.innerHTML = '';
    this.fecharPocoes();
    this.jogo.ui.btnCristal.hidden = false;
    const tipo = document.getElementById('btn-tipo-cristal');
    if (tipo) tipo.hidden = false;
    this.fecharSeletor();
    descartar(this.cena);
  }
}
