// =============================================================
// JOGO PRINCIPAL
// Cuida das telas (título, escolha do inicial, mundo, batalha),
// do salvamento e da interface (barras, avisos, painel da equipe).
// =============================================================
import * as THREE from 'three';
import { Controles } from './controles.js';
import { Mundo } from './mundo.js';
import { Batalha } from './batalha.js';
import { ESPECIES, ELEMENTOS, GOLPES, INICIAIS, criarMonstro, statsDe, xpParaProximo } from './dados.js';
import { criarModelo, animarModelo, descartar } from './modelos.js';

const CHAVE_SAVE = 'cristalia-save-v1';
const MAX_EQUIPE = 3;
const $ = (s) => document.querySelector(s);

function lerSave() {
  try {
    const bruto = localStorage.getItem(CHAVE_SAVE);
    if (!bruto) return null;
    const s = JSON.parse(bruto);
    if (!s?.estado?.equipe?.length) return null;
    return s;
  } catch { return null; }
}

// Cena de escolha do primeiro monstro
class Vitrine {
  constructor(jogo) {
    this.jogo = jogo;
    this.cena = new THREE.Scene();
    this.cena.background = new THREE.Color('#9fd8ff');
    this.cena.add(new THREE.HemisphereLight('#d6f0ff', '#5d7a3e', 1.8));
    const sol = new THREE.DirectionalLight('#fff1d6', 1.8);
    sol.position.set(4, 10, 8);
    this.cena.add(sol);
    this.camera = new THREE.PerspectiveCamera(42, jogo.aspecto, 0.1, 100);
    const chao = new THREE.Mesh(new THREE.CircleGeometry(30, 24).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#8bd65e', flatShading: true }));
    this.cena.add(chao);
    this.modelos = INICIAIS.map((id, i) => {
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.05, 0.3, 8), new THREE.MeshLambertMaterial({ color: '#e3dccb', flatShading: true }));
      pedestal.position.set((i - 1) * 2.7, 0.15, 0);
      const m = criarModelo(id);
      m.position.set((i - 1) * 2.7, 0.3, 0);
      this.cena.add(pedestal, m);
      return m;
    });
    this.sel = -1;
  }
  atualizar(dt, t) {
    const retrato = this.jogo.aspecto < 1;
    this.camera.aspect = this.jogo.aspecto;
    this.camera.updateProjectionMatrix();
    // A câmera mira abaixo dos monstros para que eles fiquem na parte de cima da tela, acima das cartas
    this.camera.position.set(0, retrato ? 3 : 1.5, retrato ? 22 : 8.6);
    this.camera.lookAt(0, retrato ? -3.4 : -0.4, 0);
    this.modelos.forEach((m, i) => {
      const escolhido = i === this.sel;
      m.rotation.y = escolhido ? m.rotation.y + dt * 2 : Math.sin(t * 0.7 + i) * 0.35;
      m.position.y = 0.3 + (escolhido ? Math.abs(Math.sin(t * 5)) * 0.35 : 0);
      animarModelo(m, t, escolhido);
    });
  }
  descartarTudo() { descartar(this.cena); }
}

class Jogo {
  constructor(dadosQuentes) {
    this.app = $('#app');
    this.palco = $('#palco');
    this.renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.palco.appendChild(this.renderer.domElement);
    this.aspecto = 1;
    this.medir();

    this.ui = {
      bjNome: $('#bj-nome'), bjNivel: $('#bj-nivel'), bjEl: $('#bj-el'), bjVida: $('#bj-vida b'), bjHp: $('#bj-hp'), bjEquipe: $('#bj-equipe'),
      biNome: $('#bi-nome'), biNivel: $('#bi-nivel'), biEl: $('#bi-el'), biVida: $('#bi-vida b'), biHp: $('#bi-hp'),
      golpes: [...document.querySelectorAll('#hud-batalha .golpe')],
      esquiva: $('#btn-esquiva'), qtdCristal: $('#qtd-cristal'), chanceCristal: $('#chance-cristal'),
      rotulo: $('#rotulo'), numeros: $('#numeros'), avisos: $('#avisos'),
    };
    this.ctrl = new Controles(this.app, this.palco);
    this.estado = null;
    this.modo = 'titulo';
    this.mundo = new Mundo(this);
    this.vitrine = null;
    this.batalha = null;
    this.numerosAtivos = [];
    this.painelAberto = false;
    this.relogio = new THREE.Clock();
    this.t = 0;
    this.rotuloHtml = '';

    window.addEventListener('resize', () => this.medir());
    this.ligarBotoes();
    this.montarCartas();

    // Se a página foi atualizada com o jogo aberto, continua de onde estava
    if (dadosQuentes?.estado) {
      this.estado = dadosQuentes.estado;
      this.entrarNoMundo();
      if (dadosQuentes.pos) this.mundo.pos.set(dadosQuentes.pos.x, 0, dadosQuentes.pos.z);
    } else {
      this.mostrarTela('titulo');
    }
    window.claude?.hot?.snapshot?.(() => (this.estado ? { estado: this.estado, pos: { x: this.mundo.pos.x, z: this.mundo.pos.z } } : {}));
    this.quadro();
  }

  medir() {
    const w = this.palco.clientWidth || window.innerWidth;
    const h = this.palco.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    this.aspecto = w / h;
    for (const cam of [this.mundo?.camera, this.batalha?.camera, this.vitrine?.camera]) {
      if (cam) { cam.aspect = this.aspecto; cam.updateProjectionMatrix(); }
    }
    this.ctrl?.repousar();
  }

  // ---------- telas ----------
  mostrarTela(nome) {
    this.modo = nome;
    $('#tela-titulo').hidden = nome !== 'titulo';
    $('#tela-inicial').hidden = nome !== 'inicial';
    $('#hud-mundo').hidden = nome !== 'mundo';
    $('#hud-batalha').hidden = nome !== 'batalha';
    this.ctrl.mostrar(nome === 'mundo' || nome === 'batalha');
    if (nome !== 'mundo') this.mostrarRotulo(null);
    if (nome !== 'mundo') this.fecharEquipe();
    if (nome === 'titulo') {
      $('#btn-continuar').hidden = !lerSave();
    }
  }

  ligarBotoes() {
    const btnNovo = $('#btn-novo');
    btnNovo.addEventListener('click', () => {
      if (lerSave() && !btnNovo.dataset.confirmar) {
        btnNovo.dataset.confirmar = '1';
        btnNovo.textContent = 'Apagar progresso e começar?';
        setTimeout(() => { delete btnNovo.dataset.confirmar; btnNovo.textContent = 'Novo jogo'; }, 3500);
        return;
      }
      this.abrirEscolha();
    });
    $('#btn-continuar').addEventListener('click', () => {
      const s = lerSave();
      if (!s) return;
      this.estado = s.estado;
      this.entrarNoMundo();
      if (s.pos) { this.mundo.pos.set(s.pos.x, 0, s.pos.z); this.mundo.posicionarCamera(1); }
    });
    $('#btn-escolher').addEventListener('click', () => {
      if (this.vitrine?.sel >= 0) this.novoJogo(INICIAIS[this.vitrine.sel]);
    });
    $('#btn-equipe').addEventListener('click', () => this.abrirEquipe());
    $('#fechar-equipe').addEventListener('click', () => this.fecharEquipe());
    $('#painel-equipe').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cmd]');
      if (b) this.comandoEquipe(b.dataset.cmd, Number(b.dataset.i));
    });
  }

  montarCartas() {
    const caixa = $('#cartas-iniciais');
    const maximos = { hp: 62, atk: 15, def: 15, vel: 7.2 };
    const nomes = { hp: 'Vida', atk: 'Ataque', def: 'Defesa', vel: 'Veloc.' };
    caixa.innerHTML = INICIAIS.map((id, i) => {
      const e = ESPECIES[id], el = ELEMENTOS[e.elemento];
      const barras = Object.keys(nomes).map((k) => `<div class="stat"><span>${nomes[k]}</span><i><b style="width:${Math.round((e.base[k] / maximos[k]) * 100)}%"></b></i></div>`).join('');
      return `<button class="carta" data-i="${i}" style="--cor:${el.cor}" type="button">
        <span class="tag">${el.nome}</span><strong>${e.nome}</strong><p>${e.descricao}</p>${barras}</button>`;
    }).join('');
    caixa.addEventListener('click', (ev) => {
      const c = ev.target.closest('.carta');
      if (!c) return;
      this.vitrine.sel = Number(c.dataset.i);
      caixa.querySelectorAll('.carta').forEach((x) => x.classList.toggle('escolhida', x === c));
      const b = $('#btn-escolher');
      b.disabled = false;
      b.textContent = `Escolher ${ESPECIES[INICIAIS[this.vitrine.sel]].nome}`;
    });
  }

  abrirEscolha() {
    if (!this.vitrine) this.vitrine = new Vitrine(this);
    this.mostrarTela('inicial');
  }

  novoJogo(especie) {
    this.estado = { equipe: [criarMonstro(especie, 3)], reserva: [], cristais: 5, capturados: [especie] };
    this.vitrine?.descartarTudo();
    this.vitrine = null;
    this.entrarNoMundo();
    this.salvar();
    this.aviso(`${ESPECIES[especie].nome} agora é seu parceiro!`);
    this.aviso('Encoste num monstro selvagem para batalhar.');
  }

  entrarNoMundo() {
    this.mundo.irParaFonte();
    this.mostrarTela('mundo');
    this.atualizarHudMundo();
  }

  // ---------- regras da equipe ----------
  temMonstroDePe() { return this.estado.equipe.some((m) => m.hp > 0); }

  precisaCura() {
    return [...this.estado.equipe, ...this.estado.reserva].some((m) => m.hp < statsDe(m.especie, m.nivel).hpMax);
  }

  curarEquipe() {
    for (const m of [...this.estado.equipe, ...this.estado.reserva]) m.hp = statsDe(m.especie, m.nivel).hpMax;
    this.atualizarHudMundo();
    this.salvar();
  }

  ganharXp(m, qtd) {
    let subiu = false;
    m.xp += qtd;
    while (m.xp >= xpParaProximo(m.nivel) && m.nivel < 50) {
      m.xp -= xpParaProximo(m.nivel);
      const antes = statsDe(m.especie, m.nivel).hpMax;
      m.nivel++;
      const depois = statsDe(m.especie, m.nivel).hpMax;
      m.hp = Math.min(depois, m.hp + (depois - antes));
      subiu = true;
    }
    return subiu;
  }

  // ---------- batalha ----------
  iniciarBatalha(selvagem) {
    const idx = this.estado.equipe.findIndex((m) => m.hp > 0);
    this.batalha = new Batalha(this, selvagem, idx);
    this.mostrarTela('batalha');
  }

  terminarBatalha(tipo, b) {
    const ini = b.ini.dados, ativo = b.jog.dados, nomeAtivo = ESPECIES[ativo.especie].nome;
    if ((tipo === 'vitoria' || tipo === 'captura') && ativo.hp > 0) {
      const xp = 10 + ini.nivel * 6;
      const subiu = this.ganharXp(ativo, xp);
      this.aviso(`${nomeAtivo} ganhou ${xp} de experiência.`);
      if (subiu) this.aviso(`${nomeAtivo} subiu para o nível ${ativo.nivel}!`);
    }
    if (tipo === 'vitoria' && Math.random() < 0.35) {
      this.estado.cristais++;
      this.aviso('O monstro deixou cair um cristal!');
    }
    if (tipo === 'captura') {
      ini.hp = Math.max(1, ini.hp);
      if (!this.estado.capturados.includes(ini.especie)) this.estado.capturados.push(ini.especie);
      if (this.estado.equipe.length < MAX_EQUIPE) {
        this.estado.equipe.push(ini);
        this.aviso(`${ESPECIES[ini.especie].nome} entrou na sua equipe.`);
      } else {
        this.estado.reserva.push(ini);
        this.aviso(`Equipe cheia: ${ESPECIES[ini.especie].nome} foi para a reserva.`);
      }
    }
    if (tipo === 'vitoria' || tipo === 'captura') this.mundo.removerSelvagem(b.selvagem);
    b.descartarTudo();
    this.batalha = null;
    this.mostrarTela('mundo');
    if (tipo === 'derrota') {
      this.curarEquipe();
      this.mundo.irParaFonte();
      this.aviso('Sua equipe desmaiou. Vocês acordaram na fonte, curados.');
    } else {
      this.mundo.graca = 2.5;
    }
    this.atualizarHudMundo();
    this.salvar();
  }

  // ---------- painel da equipe ----------
  abrirEquipe() {
    this.painelAberto = true;
    this.renderizarEquipe();
    $('#painel-equipe').hidden = false;
  }

  fecharEquipe() {
    this.painelAberto = false;
    $('#painel-equipe').hidden = true;
  }

  cartaoMonstro(m, botoes) {
    const e = ESPECIES[m.especie], el = ELEMENTOS[e.elemento], s = statsDe(m.especie, m.nivel);
    const fVida = m.hp / s.hpMax, fXp = m.xp / xpParaProximo(m.nivel);
    const nivelVida = fVida > 0.5 ? 'alto' : fVida > 0.2 ? 'medio' : 'baixo';
    const golpes = e.golpes.map((g) => `<span style="--cor:${ELEMENTOS[GOLPES[g].elemento].cor}">${GOLPES[g].nome}</span>`).join('');
    return `<article class="ficha" style="--cor:${el.cor}">
      <header><span class="tag">${el.nome}</span><strong>${e.nome}</strong><em>Nv.${m.nivel}</em></header>
      <div class="linha"><span>Vida</span><i class="vida"><b style="width:${(fVida * 100).toFixed(0)}%" data-nivel="${nivelVida}"></b></i><small>${m.hp}/${s.hpMax}</small></div>
      <div class="linha"><span>Exp.</span><i class="xp"><b style="width:${(fXp * 100).toFixed(0)}%"></b></i><small>${m.xp}/${xpParaProximo(m.nivel)}</small></div>
      <div class="atributos"><span>Ataque <b>${Math.round(s.atk)}</b></span><span>Defesa <b>${Math.round(s.def)}</b></span><span>Veloc. <b>${s.vel.toFixed(1)}</b></span></div>
      <div class="golpes-lista">${golpes}</div>
      <div class="cmds">${botoes}</div>
    </article>`;
  }

  renderizarEquipe() {
    const est = this.estado;
    $('#lista-equipe').innerHTML = est.equipe.map((m, i) => this.cartaoMonstro(m,
      (i > 0 ? `<button data-cmd="lider" data-i="${i}" type="button">Pôr na frente</button>` : '<span class="lider">Entra primeiro na batalha</span>') +
      (est.equipe.length > 1 ? `<button data-cmd="guardar" data-i="${i}" type="button">Mandar para reserva</button>` : ''))).join('');
    $('#lista-reserva').innerHTML = est.reserva.length
      ? est.reserva.map((m, i) => this.cartaoMonstro(m, `<button data-cmd="usar" data-i="${i}" type="button">${est.equipe.length < MAX_EQUIPE ? 'Levar na equipe' : 'Trocar pelo 3º da equipe'}</button>`)).join('')
      : '<p class="vazio">Monstros capturados com a equipe cheia aparecem aqui.</p>';
    $('#info-colecao').textContent = `Espécies capturadas: ${est.capturados.length} de ${Object.keys(ESPECIES).length}`;
  }

  comandoEquipe(cmd, i) {
    const est = this.estado;
    if (cmd === 'lider') { const [m] = est.equipe.splice(i, 1); est.equipe.unshift(m); }
    if (cmd === 'guardar' && est.equipe.length > 1) { const [m] = est.equipe.splice(i, 1); est.reserva.push(m); }
    if (cmd === 'usar') {
      const [m] = est.reserva.splice(i, 1);
      if (est.equipe.length < MAX_EQUIPE) est.equipe.push(m);
      else { est.reserva.push(est.equipe[MAX_EQUIPE - 1]); est.equipe[MAX_EQUIPE - 1] = m; }
    }
    this.renderizarEquipe();
    this.atualizarHudMundo();
    this.salvar();
  }

  atualizarHudMundo() {
    if (!this.estado) return;
    $('#equipe-chips').innerHTML = this.estado.equipe.map((m) => {
      const e = ESPECIES[m.especie], f = m.hp / statsDe(m.especie, m.nivel).hpMax;
      return `<div class="chip ${m.hp <= 0 ? 'desmaiado' : ''}" style="--cor:${ELEMENTOS[e.elemento].cor}">
        <span class="nome">${e.nome}</span><span class="nv">Nv.${m.nivel}</span>
        <i class="vida"><b style="width:${(f * 100).toFixed(0)}%" data-nivel="${f > 0.5 ? 'alto' : f > 0.2 ? 'medio' : 'baixo'}"></b></i></div>`;
    }).join('');
    $('#contador-cristais').textContent = this.estado.cristais;
  }

  // ---------- avisos e números flutuantes ----------
  aviso(texto) {
    const el = document.createElement('div');
    el.className = 'aviso';
    el.textContent = texto;
    this.ui.avisos.appendChild(el);
    while (this.ui.avisos.children.length > 3) this.ui.avisos.firstChild.remove();
    setTimeout(() => el.remove(), 2800);
  }

  projetar(pos, camera) {
    const v = pos.clone().project(camera);
    return { x: (v.x * 0.5 + 0.5) * this.palco.clientWidth, y: (-v.y * 0.5 + 0.5) * this.palco.clientHeight, atras: v.z > 1 };
  }

  numero(texto, pos, cor, classe = '') {
    const el = document.createElement('div');
    el.className = 'numero ' + classe;
    el.textContent = texto;
    el.style.color = cor;
    this.ui.numeros.appendChild(el);
    this.numerosAtivos.push({ el, pos: pos.clone(), t: 0 });
  }

  atualizarNumeros(camera, dt) {
    for (let i = this.numerosAtivos.length - 1; i >= 0; i--) {
      const n = this.numerosAtivos[i];
      n.t += dt;
      n.pos.y += dt * 1.4;
      const p = this.projetar(n.pos, camera);
      n.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${1 + Math.max(0, 0.25 - n.t) * 2})`;
      n.el.style.opacity = String(Math.max(0, 1 - Math.max(0, n.t - 0.5) / 0.4));
      if (n.t > 0.9 || !camera) { n.el.remove(); this.numerosAtivos.splice(i, 1); }
    }
  }

  mostrarRotulo(html, pos, camera) {
    const el = this.ui.rotulo;
    if (!html) { el.hidden = true; return; }
    if (html !== this.rotuloHtml) { el.innerHTML = html; this.rotuloHtml = html; }
    const p = this.projetar(pos, camera);
    el.hidden = p.atras;
    el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -100%)`;
  }

  // ---------- salvar ----------
  salvar() {
    if (!this.estado) return;
    try {
      localStorage.setItem(CHAVE_SAVE, JSON.stringify({ v: 1, estado: this.estado, pos: { x: this.mundo.pos.x, z: this.mundo.pos.z } }));
    } catch { /* sem armazenamento: o jogo continua sem salvar */ }
  }

  // ---------- laço principal ----------
  quadro() {
    requestAnimationFrame(() => this.quadro());
    const dt = Math.min(0.05, this.relogio.getDelta());
    this.t += dt;
    let cena, camera;
    if (this.modo === 'titulo') {
      this.mundo.orbitar(this.t);
    } else if (this.modo === 'inicial') {
      this.vitrine.atualizar(dt, this.t);
    } else if (this.modo === 'mundo') {
      this.mundo.atualizar(dt, this.ctrl, this.t, this.painelAberto);
      this.salvarT = (this.salvarT || 0) + dt;
      if (this.salvarT > 5) { this.salvarT = 0; this.salvar(); }
    } else if (this.modo === 'batalha') {
      this.batalha.atualizar(dt, this.ctrl);
    }
    if (this.modo === 'inicial') { cena = this.vitrine.cena; camera = this.vitrine.camera; }
    else if (this.modo === 'batalha' && this.batalha) { cena = this.batalha.cena; camera = this.batalha.camera; }
    else { cena = this.mundo.cena; camera = this.mundo.camera; }
    this.renderer.render(cena, camera);
    this.atualizarNumeros(camera, dt);
    this.ctrl.fimDoQuadro();
  }
}

const iniciar = (dados) => { window.__jogo = new Jogo(dados || {}); };
const hot = window.claude?.hot;
if (hot?.ready) hot.ready(iniciar);
else iniciar(hot?.data ?? {});
