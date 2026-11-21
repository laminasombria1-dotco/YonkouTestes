// =============================================================
// COMPANHEIRO: o monstro invocado que anda junto com o treinador no mapa.
//  - Invocar / Guardar: o 1º monstro da equipe sai e segue o treinador
//    (uns 2 m atrás; se ficar a mais de 15 m, aparece do lado dele).
//  - Controlar: o joystick e a câmera passam para o monstro e o treinador fica
//    parado, protegido (nenhum selvagem vem atrás dele). Os 3 golpes saem "no ar"
//    pelo modo treino (treino.js): sem inimigo e sem dano, só para mostrar.
//  - Voltar ao treinador (ou o botão Voltar do celular): o controle volta.
// Teclado: R invoca/guarda, T controla/volta, J K L golpes, Espaço esquiva.
// =============================================================
import * as THREE from 'three';
import { ESPECIES, GOLPES, ELEMENTOS } from './dados.js';
import { criarModelo, animarModelo, descartar } from './modelos.js';
import { alturaEm } from './mundo.js';
import { Treino } from './treino.js';
import { conjurar } from './invocador.js';
import { Efeitos } from './arena/efeitos.js';
import { QUALIDADES, lerQualidade } from './mapa/config.js';
import { Surgimentos } from './invocacao.js';

const DIST_ATRAS = 2.2;   // metros atrás do treinador
const DIST_LADO = 0.9;    // um pouco para o lado (não fica escondido atrás dele)
const LONGE = 15;         // mais longe que isso: aparece do lado do treinador
const VEL_SEGUIR = 8.2;   // um pouco mais rápido que o treinador (7,5), para alcançar
const TIPOS = { corpo: 'perto', projetil: 'disparo', area: 'área' };
const $ = (s) => document.querySelector(s);
const T_FX = 1.6; // s que os efeitos de invocar/guardar duram (depois disso eles param de rodar)

export class Companheiro {
  constructor(jogo) {
    this.jogo = jogo;
    this.ativo = false;
    this.dados = null;
    this.especie = null;
    this.modelo = null;
    this.pos = new THREE.Vector3();
    this.ang = 0;
    this.treino = null;
    this.t = 0;
    this.fx = null;    // efeitos da Arena no mapa (criados na primeira invocação)
    this.surg = null;  // o monstro subindo do círculo de runas (js/invocacao.js)
    this.fxT = 0;      // enquanto > 0 os efeitos rodam; parado, não gasta nada
    this.golpes = [...document.querySelectorAll('#hud-treino .golpe')];
  }

  get mundo() { return this.jogo.mundo; }
  get controlando() { return !!this.treino; }

  // ---------- invocar e guardar ----------
  efeitos() {
    if (!this.fx) {
      this.fx = new Efeitos(this.mundo.cena, { chao: alturaEm, qualidade: QUALIDADES[lerQualidade()].efeitos });
      this.surg = new Surgimentos(this.fx);
    }
    this.fx.pontos.visible = true;
    this.fxT = T_FX;
    return this.surg;
  }

  // a pedra na mão do Invocador, no mundo (para onde a luz do monstro volta)
  posPedra() {
    const p = this.mundo.jogador?.userData.J?.pedra;
    if (!p) return null;
    const v = p.getWorldPosition(new THREE.Vector3());
    return [v.x, v.y, v.z];
  }

  alternar() { if (this.ativo) this.guardar(); else this.invocar(); }

  invocar(silencioso = false) {
    const d = this.jogo.estado?.equipe[0];
    if (!d) return;
    const nome = ESPECIES[d.especie].nome;
    if (d.hp <= 0) { if (!silencioso) this.jogo.aviso(`${nome} está desmaiado. Cure na casa ou na fonte para invocar.`); return; }
    this.criarModelo(d);
    // aparece atrás do treinador
    const m = this.mundo, atras = this.pontoAtras();
    this.pos.set(atras.x, 0, atras.z);
    m.colidir(this.pos, 0.5);
    this.ang = m.ang;
    this.ativo = true;
    this.jogo.estado.pet = true;
    this.atualizarBotoes();
    if (!silencioso) {
      this.jogo.aviso(`${nome} saiu para passear com você!`);
      conjurar(m.jogador); // o Invocador ergue a pedra
      // e o monstro sobe de um círculo de runas (2.2)
      const esp = ESPECIES[d.especie];
      this.efeitos().surgir(this.modelo, { x: this.pos.x, z: this.pos.z, chao: alturaEm(this.pos.x, this.pos.z), raio: esp.raio, altura: esp.altura, cor: ELEMENTOS[esp.elemento].cor });
    }
  }

  guardar(silencioso = false) {
    if (this.treino) this.voltarAoTreinador(true);
    const nome = this.especie ? ESPECIES[this.especie].nome : '';
    if (this.modelo) {
      // vira luz e volta para a pedra na mão do Invocador (2.2)
      if (!silencioso && this.modelo.visible) {
        const esp = ESPECIES[this.especie], p = this.modelo.position;
        this.efeitos().guardar([p.x, p.y + esp.altura * 0.5, p.z], this.posPedra(), ELEMENTOS[esp.elemento].cor);
      }
      if (this.surg) this.surg.lista = this.surg.lista.filter((s) => s.modelo !== this.modelo);
      this.mundo.cena.remove(this.modelo);
      descartar(this.modelo);
    }
    this.modelo = null;
    this.dados = null;
    this.especie = null;
    this.ativo = false;
    if (this.jogo.estado) this.jogo.estado.pet = false;
    this.atualizarBotoes();
    if (!silencioso && nome) { this.jogo.aviso(`${nome} voltou para a pedra.`); conjurar(this.mundo.jogador); }
  }

  // Ao entrar no mapa (continuar o jogo, trocar de conta): invoca de novo se estava invocado
  reiniciar() {
    const querPet = !!this.jogo.estado?.pet;
    this.guardar(true);
    if (querPet) this.invocar(true);
    this.atualizarBotoes();
  }

  criarModelo(d) {
    if (this.modelo) { this.mundo.cena.remove(this.modelo); descartar(this.modelo); }
    this.dados = d;
    this.especie = d.especie;
    this.modelo = criarModelo(d.especie);
    this.mundo.cena.add(this.modelo);
  }

  pontoAtras() {
    const m = this.mundo, a = m.ang;
    return { x: m.pos.x - Math.sin(a) * DIST_ATRAS + Math.cos(a) * DIST_LADO, z: m.pos.z - Math.cos(a) * DIST_ATRAS - Math.sin(a) * DIST_LADO };
  }

  // ---------- controlar ----------
  alternarControle() { if (this.treino) this.voltarAoTreinador(); else this.controlar(); }

  controlar() {
    if (!this.ativo || this.treino) return;
    const m = this.mundo;
    this.treino = Treino.criar(this.jogo, this.dados, m.pos, this.pos, this.ang);
    this.modelo.visible = false;
    m.focoCamera = () => this.treino.posMundo();
    this.jogo.app.classList.add('controlando');
    $('#treino-nome').textContent = ESPECIES[this.especie].nome;
    this.montarBotoes();
    this.jogo.aviso(`Você está controlando ${ESPECIES[this.especie].nome}. O treinador espera protegido.`);
  }

  voltarAoTreinador(silencioso = false) {
    if (!this.treino) return;
    const w = this.treino.posMundo(), ang = this.treino.jog.ang;
    this.treino.destruir();
    this.treino = null;
    this.pos.set(w.x, 0, w.z);
    this.ang = ang;
    if (this.modelo) this.modelo.visible = true;
    this.mundo.focoCamera = null;
    this.jogo.app.classList.remove('controlando');
    // ninguém ataca o treinador logo que o controle volta
    this.mundo.graca = Math.max(this.mundo.graca, 1.5);
    if (!silencioso) this.jogo.aviso('O controle voltou para o treinador.');
  }

  // ---------- botões ----------
  atualizarBotoes() {
    const b = $('#btn-pet'), c = $('#btn-controlar');
    const d = this.ativo ? this.dados : this.jogo.estado?.equipe[0];
    const nome = d ? ESPECIES[d.especie].nome : '';
    b.hidden = !d;
    b.querySelector('span').innerHTML = `${this.ativo ? 'Guardar' : 'Invocar'}<br>${nome}`;
    b.classList.toggle('guardar', this.ativo);
    c.hidden = !this.ativo;
  }

  // Os 3 golpes do monstro nos botões (iguais aos da batalha)
  montarBotoes() {
    const j = this.treino.jog;
    this.golpes.forEach((b, i) => {
      const gp = j.golpe(i);
      b.querySelector('.nome').textContent = gp.nome;
      b.querySelector('.tipo').textContent = TIPOS[gp.tipo];
      b.style.setProperty('--cor', ELEMENTOS[gp.elemento].cor);
      b.dataset.nomeAtual = gp.nome;
    });
  }

  atualizarRecargas() {
    const j = this.treino.jog;
    this.golpes.forEach((b, i) => {
      const gp = j.golpe(i);
      const r = j.rec[i] / gp.recarga;
      // linha do Faisquinho: o disparo vira "Choque" (no ar ele nunca vira, porque precisa acertar alguém)
      if (gp.marca) { const nome = this.treino.faisquinho.nomeBotao(j, gp); if (b.dataset.nomeAtual !== nome) { b.dataset.nomeAtual = nome; b.querySelector('.nome').textContent = nome; } }
      b.style.setProperty('--p', r.toFixed(3));
      b.classList.toggle('carregando', r > 0);
      b.classList.toggle('bloqueado', !j.podeAtacar());
    });
  }

  // ---------- a cada quadro (no mapa) ----------
  atualizar(dt, ctrl, t, pausado) {
    this.t = t;
    this.atualizarEfeitos(dt);
    if (!pausado) {
      if (ctrl.consumir('pet')) this.alternar();
      if (ctrl.consumir('controlar')) { if (this.ativo) this.alternarControle(); }
    }
    const equipe = this.jogo.estado?.equipe || [];
    if (!this.ativo) {
      // o botão mostra o nome do 1º da equipe (ele pode mudar no painel Equipe)
      if ((equipe[0]?.especie || null) !== this.ultimoNome) { this.ultimoNome = equipe[0]?.especie || null; this.atualizarBotoes(); }
      return;
    }
    // a equipe mudou (outro na frente, evoluiu ou desmaiou): troca ou guarda o companheiro
    const d = equipe[0];
    if (!d || d.hp <= 0) { const nome = ESPECIES[this.especie].nome; this.guardar(true); if (d) this.jogo.aviso(`${nome} precisa descansar e voltou para a pedra.`); return; }
    if (d !== this.dados || d.especie !== this.especie) {
      const tinhaControle = !!this.treino;
      if (tinhaControle) this.voltarAoTreinador(true);
      this.criarModelo(d);
      this.atualizarBotoes();
      if (tinhaControle) this.controlar();
    }
    if (this.treino) {
      const v = pausado ? { x: 0, z: 0 } : ctrl.vetorDaCamera(this.mundo.orbita.yaw);
      if (!pausado) this.treino.atualizar(dt, ctrl, v);
      this.atualizarRecargas();
      return;
    }
    this.seguir(dt, t, pausado);
  }

  // Anda atrás do treinador
  seguir(dt, t, pausado) {
    const m = this.mundo, alvo = this.pontoAtras();
    const dx = alvo.x - this.pos.x, dz = alvo.z - this.pos.z, d = Math.hypot(dx, dz);
    let movendo = false;
    if (d > LONGE) {
      // ficou muito para trás (teleporte, fim de batalha): aparece do lado do treinador
      this.pos.set(alvo.x, 0, alvo.z);
      m.colidir(this.pos, 0.5);
      this.ang = m.ang;
    } else if (!pausado && d > 0.5) {
      const vel = Math.min(VEL_SEGUIR * (this.jogo.gm?.vel || 1), d * 5); // com o GM ×2/×3, ele acompanha
      this.pos.x += (dx / d) * vel * dt;
      this.pos.z += (dz / d) * vel * dt;
      m.colidir(this.pos, 0.5);
      this.ang = virar(this.ang, Math.atan2(dx, dz), 1 - Math.exp(-10 * dt));
      movendo = d > 0.9;
    } else {
      this.ang = virar(this.ang, m.ang, 1 - Math.exp(-4 * dt)); // parado: olha para onde o treinador olha
    }
    this.modelo.position.set(this.pos.x, alturaEm(this.pos.x, this.pos.z), this.pos.z);
    this.modelo.rotation.y = this.ang;
    animarModelo(this.modelo, t, movendo);
    this.surg?.atualizar(dt); // subindo das runas: por cima do lugar certo
  }

  // os efeitos só rodam por um tempinho depois de invocar ou guardar
  atualizarEfeitos(dt) {
    if (!this.fx || this.fxT <= 0) return;
    this.fxT -= dt;
    const W = this.jogo.palco.clientWidth, H = this.jogo.palco.clientHeight;
    this.fx.atualizar(dt, this.mundo.camera, W, H);
    if (this.fxT <= 0) {
      if (this.fx.temp.length) this.fxT = 0.2; // ainda tem efeito no ar: espera ele acabar
      else this.fx.pontos.visible = false;
    }
  }
}

function virar(a, b, k) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}
