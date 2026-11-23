// =============================================================
// JOGO PRINCIPAL
// Cuida das telas (título, monstruário/escolha, mundo, batalha, evolução),
// do salvamento e da interface (barras, avisos, painel da equipe).
// =============================================================
import * as THREE from 'three';
import { Controles } from './controles.js';
import { Mundo, SEMENTE } from './mundo.js';
import { QUALIDADES, ORDEM_QUALIDADES, lerQualidade, gravarQualidade } from './mapa/config.js';
import { Batalha } from './batalha.js';
import { Plataforma, CenaEvolucao } from './plataforma.js';
import { carregarModelos3D } from './modelos.js';
import { Companheiro } from './companheiro.js';
import { TREINADORES, equipeDoTreinador } from './reino.js';
import {
  ESPECIES, ELEMENTOS, GOLPES, ORDEM_ELEMENTOS, RAROS, NOMES_ESTAGIO, NIVEIS_EVOLUCAO,
  criarMonstro, statsDe, xpParaProximo, xpDaVitoria, verificarEvolucao, formasDaLinha, fracoContra,
  textosMelhoria, novidadesDaEvolucao, melhoriaDe, EFEITOS, EFEITO_DO_ELEMENTO, chanceDoEfeito, pct,
  CRISTAIS, CUSTO_FUSAO, ORDEM_DUPLAS, DUPLAS, nomeDupla, nomeTipo, fundoTipo, fracoContraEspecie, forteContraEspecie,
  DURACAO_EFEITO_DISPARO,
} from './dados.js';
import { chaveNome, problemaNome, ErroNuvem, criarConta, entrar, renovar, Nuvem, senhaDoGM, SENHA_MIN } from './nuvem.js';

// Cada conta tem o seu jogo salvo no aparelho: cristalia-save-v1:<id da conta>
// (o jogo salvo antigo, de antes das contas, fica em 'cristalia-save-v1' e vai para a 1ª conta que entrar)
// O jogo só roda deitado: num celular (tela de toque) em pé aparece "Vire o celular" e tudo pausa.
// (No PC, uma janela estreita não é bloqueada.)
const EM_PE = window.matchMedia('(orientation: portrait) and (pointer: coarse)');

const CHAVE_SAVE = 'cristalia-save-v1';
const CHAVE_CONTAS = 'cristalia-contas';   // contas que já entraram neste aparelho (para entrar com 1 toque)
const CHAVE_MIGRADO = 'cristalia-save-migrado';
const ENVIO_NUVEM = 30;                    // segundos entre um envio para a nuvem e outro (enquanto joga)
const MAX_EQUIPE = 3;
const $ = (s) => document.querySelector(s);
const TIPOS = { corpo: 'perto', projetil: 'disparo', area: 'área' };

// Saves antigos tinham só um número de cristais: viram cristais comuns
function migrarEstado(e) {
  if (!e.pedras) e.pedras = { comum: e.cristais ?? 5, forte: 0, supremo: 0 };
  for (const c of CRISTAIS) e.pedras[c.id] ??= 0;
  delete e.cristais;
  return e;
}

// Proteção da coleção: o jogo guarda uma cópia de cada monstro que você já teve.
// Se algum sumir da equipe e da reserva (por qualquer motivo), ele volta para a reserva.
// Devolve os nomes de quem foi recuperado.
function protegerColecao(e) {
  e.guardados ||= {};
  const todos = [...e.equipe, ...e.reserva];
  for (const m of todos) m.uid ||= Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36);
  const presentes = new Set(todos.map((m) => m.uid)), voltaram = [];
  for (const [uid, copia] of Object.entries(e.guardados)) {
    if (presentes.has(uid) || !ESPECIES[copia.especie]) continue;
    const m = { ...copia, hp: Math.max(1, copia.hp) };
    if (!e.equipe.length) e.equipe.push(m); else e.reserva.push(m);
    voltaram.push(ESPECIES[m.especie].nome);
  }
  for (const m of [...e.equipe, ...e.reserva]) e.guardados[m.uid] = { ...m };
  return voltaram;
}

// Contas deste aparelho: { ultima: id, lista: [{ id, nome, tipo: 'nuvem' | 'local', refresh, visto, resumo }] }
function lerContas() {
  try { const c = JSON.parse(localStorage.getItem(CHAVE_CONTAS)); if (c?.lista) return c; } catch { /* nada guardado */ }
  return { ultima: null, lista: [] };
}
function gravarContas(c) { try { localStorage.setItem(CHAVE_CONTAS, JSON.stringify(c)); } catch { /* sem armazenamento */ } }
const lerTexto = (chave) => { try { return localStorage.getItem(chave); } catch { return null; } };
const gravarTexto = (chave, txt) => { try { localStorage.setItem(chave, txt); return true; } catch { return false; } };
const horaDoSave = (txt) => { try { return JSON.parse(txt)?.t || 0; } catch { return 0; } };
const escHtml = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function lerSave(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    if (!bruto) return null;
    const s = JSON.parse(bruto);
    if (!s?.estado?.equipe?.length) return null;
    // ignora monstros de versões antigas que não existem mais
    s.estado.equipe = s.estado.equipe.filter((m) => ESPECIES[m.especie]);
    s.estado.reserva = (s.estado.reserva || []).filter((m) => ESPECIES[m.especie]);
    s.estado.capturados = (s.estado.capturados || []).filter((id) => ESPECIES[id]);
    // saves de antes da mudança da vida (v < 3): todos voltam curados com a vida nova
    migrarEstado(s.estado);
    s.voltaram = protegerColecao(s.estado);
    if (!(s.v >= 3)) for (const m of [...s.estado.equipe, ...s.estado.reserva]) m.hp = statsDe(m.especie, m.nivel).hpMax;
    return s.estado.equipe.length ? s : null;
  } catch { return null; }
}

// Maior valor de cada atributo entre todas as espécies (para as barrinhas)
const MAXIMOS = { hp: 0, atk: 0, def: 0, vel: 0 };
for (const e of Object.values(ESPECIES)) for (const k in MAXIMOS) MAXIMOS[k] = Math.max(MAXIMOS[k], e.base[k]);

class Jogo {
  constructor(dadosQuentes) {
    this.app = $('#app');
    this.palco = $('#palco');
    this.renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALIDADES[lerQualidade()].pixel)); // resolução pela qualidade gráfica
    this.palco.appendChild(this.renderer.domElement);
    this.aspecto = 1;
    this.medir();

    this.ui = {
      bjNome: $('#bj-nome'), bjNivel: $('#bj-nivel'), bjEl: $('#bj-el'), bjVida: $('#bj-vida b'), bjHp: $('#bj-hp'), bjEquipe: $('#bj-equipe'),
      bjStatus: $('#bj-status'),
      golpes: [...document.querySelectorAll('#hud-batalha .golpe')],
      qtdCristal: $('#qtd-cristal'), btnCristal: $('#btn-cristal'),
      seletor: $('#seletor-cristal'), placas: $('#placas-inimigos'),
      rotulo: $('#rotulo'), numeros: $('#numeros'), avisos: $('#avisos'),
    };
    this.ctrl = new Controles(this.app, this.palco);
    this.estado = null;
    this.modo = 'titulo';
    this.mundo = new Mundo(this);
    this.pet = new Companheiro(this); // monstro invocado que segue o treinador
    this.plataforma = null;
    this.batalha = null;
    this.cenaEvo = null;
    this.filaEvo = [];
    this.numerosAtivos = [];
    this.painelAberto = false;
    this.relogio = new THREE.Clock();
    this.t = 0;
    this.rotuloHtml = '';
    this.colecao = { modo: 'inicial', aba: 'fogo', volta: 'titulo' };
    this.conta = null;          // { id, nome, tipo: 'nuvem' | 'local' | 'gm', nuvem }
    this.estadoNuvem = null;    // 'ok' | 'offline' | 'erro' (aparece na tela de início)
    this.envioT = 0;

    window.addEventListener('resize', () => this.medir());
    this.ligarBotoes();

    // Se a página foi atualizada com o jogo aberto, continua de onde estava
    if (dadosQuentes?.estado && dadosQuentes.conta) {
      this.restaurarConta(dadosQuentes.conta);
      this.estado = migrarEstado(dadosQuentes.estado);
      protegerColecao(this.estado);
      this.entrarNoMundo();
      if (dadosQuentes.pos) this.mundo.pos.set(dadosQuentes.pos.x, 0, dadosQuentes.pos.z);
      if (dadosQuentes.hora != null) this.mundo.hora = dadosQuentes.hora;
    } else {
      this.mostrarLogin();
    }
    window.claude?.hot?.snapshot?.(() => (this.estado ? { estado: this.estado, conta: this.conta && { id: this.conta.id, nome: this.conta.nome, tipo: this.conta.tipo }, pos: { x: this.mundo.pos.x, z: this.mundo.pos.z }, hora: this.mundo.hora } : {}));
    // App minimizado ou fechado: salva e manda para a nuvem na hora
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.salvar(); this.enviarNuvem(true, true); } });
    window.addEventListener('pagehide', () => { this.salvar(); this.enviarNuvem(true, true); });
    this.quadro();
  }

  medir() {
    const w = this.palco.clientWidth || window.innerWidth;
    const h = this.palco.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    this.aspecto = w / h;
    for (const cam of [this.mundo?.camera, this.batalha?.camera]) {
      if (cam) { cam.aspect = this.aspecto; cam.updateProjectionMatrix(); }
    }
    this.ctrl?.repousar();
  }

  // ---------- telas ----------
  mostrarTela(nome) {
    this.modo = nome;
    $('#tela-login').hidden = nome !== 'login';
    $('#tela-titulo').hidden = nome !== 'titulo';
    $('#tela-colecao').hidden = nome !== 'colecao';
    $('#tela-evolucao').hidden = nome !== 'evolucao';
    $('#hud-mundo').hidden = nome !== 'mundo';
    $('#hud-batalha').hidden = nome !== 'batalha';
    this.app.classList.toggle('em-batalha', nome === 'batalha');
    this.ctrl.mostrar(nome === 'mundo' || nome === 'batalha');
    if (nome !== 'mundo') { this.mostrarRotulo(null); this.fecharEquipe(); }
    if (nome === 'titulo') this.atualizarTitulo();
    if (nome !== 'mundo') this.fecharMenu();
    this.gm?.aoMudarTela(nome);
  }

  // ---------- painel GM ----------
  // Só a conta GM carrega o painel (js/gm.js); as outras contas nem baixam o arquivo.
  async ativarGM() {
    if (this.gm) return this.gm;
    const { PainelGM } = await import('./gm.js');
    this.gm = new PainelGM(this);
    return this.gm;
  }

  desativarGM() {
    this.gm?.destruir();
    this.gm = null;
  }

  ligarBotoes() {
    const btnNovo = $('#btn-novo');
    btnNovo.addEventListener('click', () => {
      // já tem jogo salvo: o 1º toque só avisa; o 2º (em até 3,5 s) apaga e começa
      if (lerSave(this.chaveSave()) && !btnNovo.dataset.confirmar) {
        const [titulo, linha] = [btnNovo.querySelector('b'), btnNovo.querySelector('small')];
        btnNovo.dataset.confirmar = '1';
        btnNovo.classList.add('confirmar');
        titulo.textContent = 'Apagar e começar?';
        linha.textContent = 'Toque de novo para confirmar';
        setTimeout(() => {
          delete btnNovo.dataset.confirmar;
          btnNovo.classList.remove('confirmar');
          titulo.textContent = 'Novo jogo';
          linha.textContent = 'Escolha seu primeiro parceiro';
        }, 3500);
        return;
      }
      this.abrirColecao('inicial');
    });
    $('#btn-continuar').addEventListener('click', () => {
      const s = lerSave(this.chaveSave());
      if (!s) return;
      this.estado = s.estado;
      if (s.voltaram?.length) setTimeout(() => this.aviso(`Recuperados para a reserva: ${s.voltaram.join(', ')}.`), 600);
      if (s.hora != null) this.mundo.hora = s.hora;
      // jogo salvo em outro mapa (o mapa antigo, ou outra semente): acorda no castelo e a casa volta para a mochila
      const outroMapa = s.semente !== SEMENTE;
      if (outroMapa && this.estado.casa) this.estado.casa = null;
      this.entrarNoMundo();
      if (s.pos && !outroMapa) { this.mundo.pos.set(s.pos.x, 0, s.pos.z); this.mundo.chunks.carregarTudoPerto(s.pos.x, s.pos.z); this.mundo.posicionarCamera(1); }
      if (outroMapa) setTimeout(() => this.aviso('O mapa é novo! Você acordou no castelo e a casa voltou para a mochila.'), 900);
      // saves antigos: evolui quem já tem nível para isso
      for (const m of [...this.estado.equipe, ...this.estado.reserva]) this.registrarEvolucoes(verificarEvolucao(m));
      if (this.filaEvo.length) this.proximaEvolucao();
    });
    $('#btn-monstruario').addEventListener('click', () => this.abrirColecao('ver'));
    // Login: Entrar, Criar conta, contas deste aparelho (1 toque) e Trocar conta
    $('#form-login').addEventListener('submit', (e) => { e.preventDefault(); this.loginComSenha(false); });
    $('#btn-criar-conta').addEventListener('click', () => this.loginComSenha(true));
    $('#btn-sem-nuvem').addEventListener('click', () => this.entrarSemNuvem());
    $('#contas-aparelho').addEventListener('click', (e) => {
      const b = e.target.closest('[data-conta]');
      if (b) this.entrarComUmToque(b.dataset.conta);
    });
    $('#btn-trocar-conta').addEventListener('click', () => this.trocarConta());
    // com o teclado aberto (celular deitado), o quadro do login sobe para o campo ficar à vista
    // (só quando o foco está num campo de texto: tocar num botão não pode esconder nada no meio do toque)
    $('#form-login').addEventListener('focusin', (e) => { if (e.target.tagName === 'INPUT') $('#tela-login').classList.add('digitando'); });
    $('#form-login').addEventListener('focusout', () => setTimeout(() => {
      if (document.activeElement?.tagName !== 'INPUT') $('#tela-login').classList.remove('digitando');
    }, 50));
    // Menu de pausa e saída
    $('#btn-sair').addEventListener('click', () => this.sairDoJogo());
    $('#btn-menu').addEventListener('click', () => this.abrirMenu());
    document.querySelectorAll('[data-menu]').forEach((b) => b.addEventListener('click', () => {
      const acao = b.dataset.menu;
      if (acao === 'continuar') this.fecharMenu();
      else if (acao === 'inicio') this.voltarAoInicio();
      else if (acao === 'qualidade') this.trocarQualidade();
      else if (acao === 'sair') this.sairDoJogo();
      else if (acao === 'voltar-saida') $('#tela-saida').hidden = true;
    }));
    // Esc no PC abre/fecha o menu
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.voltar(); });
    // Botão Voltar do celular (o app Android chama esta função)
    window.__voltar = () => this.voltar();
    $('#btn-monstros').addEventListener('click', () => this.abrirColecao('ver'));
    $('#col-voltar').addEventListener('click', () => this.fecharColecao());
    $('#col-escolher').addEventListener('click', () => {
      if (this.colecao.modo === 'inicial') this.novoJogo(formasDaLinha(this.colecao.aba)[0]);
    });
    $('#col-abas').addEventListener('click', (e) => {
      const b = e.target.closest('[data-aba]');
      if (b) this.selecionarAba(b.dataset.aba, 0);
    });
    $('#col-formas').addEventListener('click', (e) => {
      const b = e.target.closest('[data-forma]');
      if (b) this.selecionarForma(Number(b.dataset.forma));
    });
    this.palco.addEventListener('click', (e) => {
      if (this.modo !== 'colecao') return;
      const r = this.palco.getBoundingClientRect();
      const i = this.plataforma.tocarEm(e.clientX - r.left, e.clientY - r.top);
      if (i >= 0) this.selecionarForma(i);
    });
    $('#evo-continuar').addEventListener('click', () => this.fecharEvolucao());
    $('#btn-equipe').addEventListener('click', () => this.abrirEquipe());
    $('#btn-casa').addEventListener('click', () => this.acaoCasa());
    // Monstro invocado: invocar/guardar, controlar e voltar ao treinador
    $('#btn-pet').addEventListener('click', () => this.pet.alternar());
    $('#btn-controlar').addEventListener('click', () => this.pet.controlar());
    $('#btn-voltar-treinador').addEventListener('click', () => this.pet.voltarAoTreinador());
    // Tela cheia: precisa ser no "clique" (o navegador só deixa logo depois de um toque)
    document.querySelectorAll('.btn-tela-cheia').forEach((b) => b.addEventListener('click', () => this.alternarTelaCheia()));
    const marcarTela = () => document.querySelectorAll('.btn-tela-cheia').forEach((b) => b.classList.toggle('ativa', !!(document.fullscreenElement || document.webkitFullscreenElement)));
    document.addEventListener('fullscreenchange', () => { marcarTela(); this.medir(); });
    document.addEventListener('webkitfullscreenchange', () => { marcarTela(); this.medir(); });
    $('#fechar-equipe').addEventListener('click', () => this.fecharEquipe());
    document.querySelectorAll('[data-aba-painel]').forEach((b) => b.addEventListener('click', () => {
      this.abaPainel = b.dataset.abaPainel;
      this.renderizarEquipe();
      $('#painel-equipe').scrollTop = 0;
    }));
    $('#painel-equipe').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cmd]');
      if (b) this.comandoEquipe(b.dataset.cmd, Number(b.dataset.i));
    });
  }

  // ---------- tela de início ----------
  // Mostra "Continuar" com um resumo do jogo salvo (parceiro, nível, quantos monstros)
  atualizarTitulo() {
    const c = this.conta;
    if (c) {
      const nuvem = c.tipo === 'gm' ? 'conta GM: salvo só neste aparelho'
        : c.tipo === 'local' ? 'salvo só neste aparelho'
        : this.estadoNuvem === 'ok' ? '☁ salvo na nuvem'
        : this.estadoNuvem === 'offline' ? '⚠ sem internet: salvo no celular, sobe para a nuvem depois'
        : this.estadoNuvem === 'erro' ? '⚠ a nuvem não respondeu: salvo no celular' : '☁ nuvem';
      $('#ola').innerHTML = `Olá, <b>${escHtml(c.nome)}</b>! <small>${nuvem}</small>`;
    }
    const s = this.conta ? lerSave(this.chaveSave()) : null;
    $('#btn-continuar').hidden = !s;
    if (!s) return;
    const lider = s.estado.equipe[0], esp = ESPECIES[lider.especie];
    const total = s.estado.equipe.length + s.estado.reserva.length;
    $('#resumo-save').textContent = `${esp.nome} Nv.${lider.nivel} · ${total} ${total === 1 ? 'monstro' : 'monstros'}${s.estado.arena?.dominada ? ' · 👑 Campeão do Reino' : ''}`;
  }

  // ---------- menu de pausa e sair ----------
  abrirMenu() {
    if (this.modo !== 'mundo') return;
    this.fecharEquipe();
    this.painelAberto = true; // o mundo para enquanto o menu está aberto
    this.atualizarBotaoQualidade();
    $('#menu-pausa').hidden = false;
  }

  fecharMenu() {
    const el = $('#menu-pausa');
    if (el.hidden) return;
    el.hidden = true;
    this.painelAberto = false;
  }

  // Qualidade gráfica (Fraco → Médio → Forte): menos chunks e objetos = mais leve
  trocarQualidade() {
    const atual = this.mundo.chunks.nomeQ;
    const q = ORDEM_QUALIDADES[(ORDEM_QUALIDADES.indexOf(atual) + 1) % ORDEM_QUALIDADES.length];
    gravarQualidade(q);
    this.mundo.aplicarQualidade(q);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALIDADES[q].pixel));
    this.medir();
    this.atualizarBotaoQualidade();
  }
  atualizarBotaoQualidade() {
    const el = $('#menu-qualidade');
    if (el) el.textContent = QUALIDADES[this.mundo.chunks.nomeQ].nome;
  }

  voltarAoInicio() {
    this.pet.voltarAoTreinador(true);
    this.salvar();
    this.enviarNuvem(true);
    this.fecharMenu();
    this.mostrarTela('titulo');
  }

  // Salva e fecha. No app Android, fecha o app de verdade. No navegador, a página
  // não pode se fechar sozinha: tenta e, se não der, mostra "Progresso salvo, pode fechar".
  sairDoJogo() {
    this.salvar();
    this.enviarNuvem(true, true);
    this.fecharMenu();
    if (window.CristaliaApp?.sair) { window.CristaliaApp.sair(); return; }
    if (this.modo === 'mundo') this.mostrarTela('titulo');
    try { window.close(); } catch { /* o navegador não deixou */ }
    setTimeout(() => { $('#tela-saida').hidden = false; }, 300);
  }

  // Botão Voltar (celular) ou Esc (PC): fecha o que estiver aberto, um passo de cada vez.
  // Devolve 'sair' quando não há mais nada para fechar (o app Android então fecha).
  voltar() {
    if (!$('#tela-saida').hidden) { $('#tela-saida').hidden = true; return 'ok'; }
    if (!$('#menu-pausa').hidden) { this.fecharMenu(); return 'ok'; }
    if (this.gm?.fecharPainel()) return 'ok';
    if (this.painelAberto) { this.fecharEquipe(); return 'ok'; }
    if (this.modo === 'colecao') { this.fecharColecao(); return 'ok'; }
    if (this.modo === 'mundo' && this.pet.controlando) { this.pet.voltarAoTreinador(); return 'ok'; }
    if (this.modo === 'mundo') { this.abrirMenu(); return 'ok'; }
    if (this.modo === 'titulo') { this.salvar(); this.enviarNuvem(true, true); return 'sair'; }
    if (this.modo === 'login') return 'sair';
    return 'ok'; // na batalha e na evolução, o Voltar não faz nada (use Fugir)
  }

  // ---------- tela cheia ----------
  alternarTelaCheia() {
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen)?.call(d); return; }
    const pedir = el.requestFullscreen || el.webkitRequestFullscreen;
    const falhou = () => this.aviso('Este navegador não deixou usar a tela cheia aqui. No celular, abra o link no Chrome e use "Adicionar à tela inicial".');
    if (!pedir) { falhou(); return; }
    try {
      Promise.resolve(pedir.call(el, { navigationUI: 'hide' }))
        .then(() => screen.orientation?.lock?.('landscape').catch(() => {})) // deita a tela, se o celular deixar
        .catch(falhou);
    } catch { falhou(); }
  }

  // ---------- monstruário / escolha do inicial ----------
  abrirColecao(modo) {
    const voltaPara = this.modo === 'colecao' ? this.colecao.volta : this.modo;
    this.colecao.modo = modo;
    this.colecao.volta = voltaPara;
    if (!this.plataforma) this.plataforma = new Plataforma(this);
    $('#col-titulo').textContent = modo === 'inicial' ? 'Escolha seu primeiro parceiro' : 'Monstruário';
    $('#col-escolher').hidden = modo !== 'inicial';
    // no modo "ver" aparecem também os de tipo duplo e os raros
    const abas = [...ORDEM_ELEMENTOS, ...(modo === 'ver' ? [...ORDEM_DUPLAS, 'raros'] : [])];
    $('#col-abas').innerHTML = abas.map((a) => {
      let cor, nome;
      if (a === 'raros') { cor = '#ffffff'; nome = 'Raros'; }
      else if (DUPLAS[a]) { const [x, y] = DUPLAS[a].elementos.map((el) => ELEMENTOS[el].cor); cor = x; nome = nomeDupla(a); return `<button type="button" data-aba="${a}" class="dupla" style="--cor:${x};--cor2:${y}"><i></i>${nome}</button>`; }
      else { cor = ELEMENTOS[a].cor; nome = ELEMENTOS[a].nome; }
      return `<button type="button" data-aba="${a}" style="--cor:${cor}"><i></i>${nome}</button>`;
    }).join('');
    this.mostrarTela('colecao');
    const aba = modo === 'inicial' && !ORDEM_ELEMENTOS.includes(this.colecao.aba) ? 'fogo' : this.colecao.aba;
    this.selecionarAba(aba, 0);
  }

  fecharColecao() {
    const volta = this.colecao.volta;
    this.mostrarTela(volta === 'mundo' && this.estado ? 'mundo' : 'titulo');
  }

  selecionarAba(aba, forma) {
    this.colecao.aba = aba;
    const ids = aba === 'raros' ? RAROS : formasDaLinha(aba);
    this.colecao.ids = ids;
    this.plataforma.mostrar(ids, aba !== 'raros', forma);
    document.querySelectorAll('#col-abas [data-aba]').forEach((b) => b.classList.toggle('ativa', b.dataset.aba === aba));
    $(`#col-abas [data-aba="${aba}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
    $('#col-formas').innerHTML = ids.map((id, i) => {
      const e = ESPECIES[id];
      const nv = e.superRaro ? 'Super raro' : e.raro ? 'Raro' : `Nv.${i === 0 ? 1 : NIVEIS_EVOLUCAO[i - 1]}`;
      return `<button type="button" data-forma="${i}" style="--cor:${ELEMENTOS[e.elemento].cor}"><small>${nv}</small>${e.nome}</button>`;
    }).join('');
    $('#col-escolher').textContent = aba !== 'raros' ? `Escolher ${ESPECIES[ids[0]].nome}` : '';
    this.selecionarForma(forma);
    this.enquadrarColecao();
  }

  selecionarForma(i) {
    const id = this.colecao.ids[i];
    if (!id) return;
    this.plataforma.sel = i;
    document.querySelectorAll('#col-formas [data-forma]').forEach((b) => b.classList.toggle('ativa', Number(b.dataset.forma) === i));
    const e = ESPECIES[id], el = ELEMENTOS[e.elemento];
    const barra = (k, nome, txt) => `<div class="stat"><span>${nome}</span><i><b style="width:${Math.round((e.base[k] / MAXIMOS[k]) * 100)}%"></b></i><em>${txt}</em></div>`;
    // atributos mostrados no nível em que a forma aparece
    const nivelForma = e.chefe ? 25 : e.raro ? 1 : [1, ...NIVEIS_EVOLUCAO][e.estagio];
    const st = statsDe(id, nivelForma);
    let evo;
    if (e.chefe) evo = `Super raro: é o chefe ${e.onde}. Não evolui. Só um <b>Cristal Supremo</b> segura ele.`;
    else if (e.raro) evo = 'Monstro raro: não evolui.';
    else if (e.evoluiPara) {
      const prox = novidadesDaEvolucao(id, e.evoluiPara);
      evo = `Evolui no <b>Nv.${e.nivelEvolucao}</b> para <b>${ESPECIES[e.evoluiPara].nome}</b>${prox.length ? ': ' + prox.join(', ') : ''}.`;
    } else evo = 'Forma final da linha.';
    const mel = melhoriaDe(id);
    const golpes = e.golpes.map((g) => {
      const gp = GOLPES[g];
      const idEf = e.elementos.includes(gp.elemento) ? EFEITO_DO_ELEMENTO[gp.elemento] : null;
      const nomeEf = idEf ? EFEITOS[idEf]?.nome : null;
      let extra = TIPOS[gp.tipo];
      if (gp.tipo === 'projetil' && mel.disparos > 1) extra += ` ×${mel.disparos}`;
      const causa = (gp.tipo === 'area' && mel.efeitoArea) || (gp.tipo === 'corpo' && mel.efeitoPerto) || (gp.tipo === 'projetil' && mel.efeitoDisparo);
      if (causa && nomeEf) extra += ` · ${nomeEf} ${pct(chanceDoEfeito(idEf, gp.tipo))}`;
      return `<span style="--cor:${ELEMENTOS[gp.elemento].cor}">${gp.nome} <small>${extra}</small></span>`;
    }).join('');
    const textos = textosMelhoria(id);
    const melhorias = textos.length
      ? `<ul class="melhorias">${textos.map((t) => `<li>${t}</li>`).join('')}</ul>`
      : '<ul class="melhorias vazio"><li>Sem melhorias ainda: elas chegam com as evoluções.</li></ul>';
    const forte = forteContraEspecie(e).map((x) => ELEMENTOS[x].nome).join(', ') || 'nenhum';
    const fraco = fracoContraEspecie(e).map((x) => ELEMENTOS[x].nome).join(', ') || 'nenhum';
    const captura = e.dupla
      ? `<p class="evo duplo">Tipo duplo (raro): aparece 1 a cada 10 monstros. Só é capturado com <b style="color:${CRISTAIS[e.cristalMin].cor}">${CRISTAIS[e.cristalMin].nome}</b> ou melhor.</p>`
      : '';
    let status = '';
    if (this.colecao.modo === 'ver') {
      const tem = this.estado?.capturados?.includes(id);
      status = `<p class="status ${tem ? 'sim' : ''}">${tem ? 'Já é seu' : 'Ainda não capturado'}</p>`;
    } else if (e.estagio > 0) {
      status = `<p class="status">Você começa com ${ESPECIES[this.colecao.ids[0]].nome}. Esta forma vem com a evolução.</p>`;
    }
    $('#col-detalhe').innerHTML = `
      <div class="cab"><span class="tag" style="--cor:${fundoTipo(e)}">${nomeTipo(e)}</span><span class="estagio">${e.superRaro ? 'Super raro · Chefe' : e.raro ? 'Raro' : NOMES_ESTAGIO[e.estagio]}</span></div>
      <h3>${e.nome}</h3>
      <p class="desc">${e.descricao}</p>
      <p class="evo">${evo}</p>
      ${captura}
      <div class="stats" style="--cor:${el.cor}">
        <small class="nivel-stats">Atributos no Nv.${nivelForma}</small>
        ${barra('hp', 'Vida', st.hpMax)}${barra('atk', 'Ataque', Math.round(st.atk))}
        ${barra('def', 'Defesa', Math.round(st.def))}${barra('vel', 'Veloc.', st.vel.toFixed(1))}
      </div>
      <div class="golpes-lista">${golpes}</div>
      ${melhorias}
      <p class="vant">Forte contra: <b>${forte}</b><br>Fraco contra: <b>${fraco}</b></p>
      ${status}`;
  }

  enquadrarColecao() {
    if (!this.plataforma) return;
    const a = this.palco.getBoundingClientRect(), r = $('#col-palco').getBoundingClientRect();
    this.plataforma.enquadrar({ left: r.left - a.left, top: r.top - a.top, width: r.width, height: r.height });
  }

  novoJogo(especie) {
    this.estado = { equipe: [criarMonstro(especie, 3)], reserva: [], pedras: { comum: 5, forte: 0, supremo: 0 }, capturados: [especie], casa: null };
    this.mundo.hora = 0.08;
    this.entrarNoMundo();
    this.mundo.povoar();
    this.salvar();
    this.aviso(`${ESPECIES[especie].nome} agora é seu parceiro!`);
    this.aviso('Siga a Estrada Real para sair do Reino e caçar monstros.');
    this.aviso('Encoste num monstro selvagem para batalhar.');
    this.aviso('Você tem uma casa na mochila: toque em "Montar casa".');
  }

  entrarNoMundo() {
    // a casa salva volta para o lugar onde estava
    if (this.estado.casa) this.mundo.montarCasa(this.estado.casa.x, this.estado.casa.z, this.estado.casa.rot, false);
    else this.mundo.guardarCasa();
    this.mundo.irParaBase();
    this.mostrarTela('mundo');
    this.atualizarHudMundo();
    this.pet.reiniciar(); // estava invocado? sai de novo
  }

  // ---------- casa ----------
  // O botão muda conforme a situação: montar, guardar ou trazer a casa para perto
  acaoCasa() {
    const m = this.mundo;
    if (m.casaPos && m.distanciaCasa() < 7) {
      m.guardarCasa();
      this.estado.casa = null;
      this.aviso('Casa guardada na mochila.');
    } else {
      const lugar = m.acharLugarCasa();
      const dg = !lugar && m.dungeons?.find((d) => d.t.semCasa(m.pos.x, m.pos.z));
      if (dg) {
        this.aviso(dg.cfg.semCasa);
        return;
      }
      if (!lugar) {
        this.aviso('Não há espaço aqui. Procure um lugar mais aberto, longe de árvores, pedras e água.');
        return;
      }
      const mudou = !!m.casaPos;
      m.montarCasa(lugar.x, lugar.z, lugar.rot);
      this.estado.casa = { ...m.casaPos };
      this.aviso(mudou ? 'Você mudou a casa para cá!' : 'Casa montada! Encoste nela para curar a equipe.');
    }
    this.salvar();
  }

  atualizarBotaoCasa() {
    const m = this.mundo;
    const txt = !m.casaPos ? 'Montar casa' : m.distanciaCasa() < 7 ? 'Guardar casa' : 'Mudar casa p/ cá';
    const b = $('#btn-casa');
    if (b.dataset.txt !== txt) { b.dataset.txt = txt; b.querySelector('span').textContent = txt; }
  }

  // ---------- regras da equipe ----------
  temMonstroDePe() { return this.estado.equipe.some((m) => m.hp > 0); }

  precisaCura() {
    return [...this.estado.equipe, ...this.estado.reserva].some((m) => m.hp < statsDe(m.especie, m.nivel).hpMax);
  }

  // Os monstros desmaiados levantam com uma parte da vida (os outros ficam como estão)
  levantarDesmaiados(parte) {
    for (const m of [...this.estado.equipe, ...this.estado.reserva]) {
      if (m.hp <= 0) m.hp = Math.max(1, Math.round(statsDe(m.especie, m.nivel).hpMax * parte));
    }
    this.atualizarHudMundo();
    this.salvar();
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
    this.registrarEvolucoes(verificarEvolucao(m));
    return subiu;
  }

  registrarEvolucoes(lista) {
    for (const ev of lista) {
      this.filaEvo.push(ev);
      if (!this.estado.capturados.includes(ev.para)) this.estado.capturados.push(ev.para);
    }
  }

  // ---------- evolução ----------
  proximaEvolucao() {
    const ev = this.filaEvo.shift();
    this.cenaEvo = new CenaEvolucao(this, ev.de, ev.para);
    this.evoAtual = ev;
    this.evoAnunciada = false;
    $('#evo-texto').textContent = `${ESPECIES[ev.de].nome} está evoluindo!`;
    $('#evo-novidades').textContent = '';
    $('#evo-continuar').hidden = true;
    this.mostrarTela('evolucao');
  }

  fecharEvolucao() {
    if (!this.cenaEvo?.pronto) return;
    this.cenaEvo.descartarTudo();
    this.cenaEvo = null;
    if (this.filaEvo.length) { this.proximaEvolucao(); return; }
    this.mostrarTela('mundo');
    this.atualizarHudMundo();
    this.salvar();
  }

  // ---------- batalha ----------
  // ---------- arena do Reino ----------
  // Quantos treinadores você já venceu (em ordem) e se a arena já foi dominada
  progressoArena() { return (this.estado.arena ||= { vencidos: 0, dominada: false }); }

  // O jogador encostou na frente da plataforma de um treinador
  encostouNoTreinador(i) {
    const prog = this.progressoArena(), tr = TREINADORES[i];
    if (!this.temMonstroDePe()) { this.aviso(`${tr.nome}: Sua equipe está desmaiada. Cure na fonte do castelo e volte!`); return; }
    if (!prog.dominada && i > prog.vencidos) { this.aviso(`${tr.nome}: Primeiro vença ${TREINADORES[prog.vencidos].nome}.`); return; }
    if (!prog.dominada && i < prog.vencidos) { this.aviso(`${tr.nome}: Você já me venceu. Agora é com ${TREINADORES[prog.vencidos].nome}!`); return; }
    this.lutarComTreinador(i);
  }

  // Começa a luta (depois de dominar a arena, é revanche: todos no Nv.50)
  lutarComTreinador(i) {
    const tr = TREINADORES[i], revanche = !!this.progressoArena().dominada;
    this.aviso(tr.fala);
    const membros = equipeDoTreinador(tr, revanche).map((dados) => ({ dados }));
    this.iniciarBatalha({ treinador: tr, indice: i, revanche, membros, zona: 'reino' });
  }

  // Fim de uma luta de treinador: progresso, prêmio e para onde o jogador vai
  fimLutaTreinador(tipo, b) {
    const tr = b.treinador, i = b.selvagem.indice, prog = this.progressoArena();
    if (tipo === 'vitoria') {
      const primeira = !prog.dominada && i === prog.vencidos;
      this.aviso(`Você venceu ${tr.campeao ? 'o Rei ' : ''}${tr.nome}${primeira ? '' : ' de novo'}!`);
      this.ganharCristais({ comum: 0, forte: 0, supremo: 0, ...(primeira ? tr.premio : tr.campeao ? { forte: 1, supremo: 1 } : { forte: 1 }) });
      if (primeira) prog.vencidos = i + 1;
      if (primeira && tr.campeao) {
        prog.dominada = true;
        prog.ovoPendente = true; // o Ovo Misterioso (próxima parte)
        this.aviso('Você dominou a arena! Agora você é o Campeão do Reino!');
        this.aviso('Nas revanches, todos os treinadores lutam no nível 50.');
      } else if (primeira) this.aviso(`Próximo desafio: ${TREINADORES[i + 1].nome}.`);
      this.mundo.reino.festa(5); // a plateia comemora
      this.mundo.graca = 2.5;
    } else if (tipo === 'derrota') {
      this.curarEquipe();
      this.mundo.irParaFonte();
      this.aviso(`${tr.nome} venceu. Vocês acordaram na fonte do castelo, curados.`);
      if (prog.vencidos && !prog.dominada) this.aviso('Os treinadores que você já venceu continuam vencidos.');
    } else this.mundo.sairDaArena(); // desistiu: sai pelo portão da arena
    this.mundo.reino.desarmar(i); // só luta de novo depois de se afastar da plataforma
  }

  iniciarBatalha(selvagem) {
    this.pet.voltarAoTreinador(true);
    const idx = this.estado.equipe.findIndex((m) => m.hp > 0);
    this.batalha = new Batalha(this, selvagem, idx);
    this.mostrarTela('batalha');
  }

  terminarBatalha(tipo, b) {
    const ativo = b.jog.dados, nomeAtivo = ESPECIES[ativo.especie].nome;
    const vencidos = [...b.derrotados, ...b.capturados];
    // Experiência: soma de todos os derrotados/capturados (em grupo, 60% de cada)
    if (vencidos.length && ativo.hp > 0) {
      // tipo duplo vale 50% a mais
      const bonus = (d) => (ESPECIES[d.especie].chefe ? 2 : ESPECIES[d.especie].dupla ? 1.5 : 1);
      const xp = Math.round(vencidos.reduce((s, d) => s + xpDaVitoria(d.nivel) * bonus(d), 0) * (b.grupo && !b.treinador ? 0.6 : 1));
      const subiu = this.ganharXp(ativo, xp);
      this.aviso(`${nomeAtivo} ganhou ${xp} de experiência.`);
      if (subiu) this.aviso(`${nomeAtivo} subiu para o nível ${ativo.nivel}!`);
    }
    // Cristais: o líder sempre deixa 2 comuns + 1 forte; os outros às vezes deixam 1 comum.
    // Vencer um tipo duplo dá 1 forte (e as formas evoluídas às vezes dão 1 supremo).
    const ganho = { comum: 0, forte: 0, supremo: 0 };
    if (b.grupo && b.liderDerrotado) { ganho.comum += 2; ganho.forte += 1; }
    // o chefe deixa um tesouro, vencido ou capturado
    if (b.chefe && vencidos.length) {
      ganho.forte += 3; ganho.supremo += 2;
      const chefe = ESPECIES[b.chefeEspecie] || ESPECIES.ignarion;
      this.aviso(b.capturados.length ? `Você capturou ${chefe.nome}, o chefe ${chefe.onde}!` : `Você venceu ${chefe.nome}! Ele volta no próximo amanhecer.`);
    }
    for (const d of b.treinador ? [] : b.derrotados) { // treinador: o prêmio é fixo (fimLutaTreinador)
      const esp = ESPECIES[d.especie];
      if (esp.dupla) { ganho.forte++; if (esp.estagio >= 2 && Math.random() < 0.35) ganho.supremo++; }
      else if (Math.random() < (b.grupo ? 0.2 : 0.35)) ganho.comum++;
    }
    this.ganharCristais(ganho);
    for (const novo of b.capturados) {
      novo.hp = Math.max(1, novo.hp);
      delete novo.lider; delete novo.onda; delete novo.forca;
      if (!this.estado.capturados.includes(novo.especie)) this.estado.capturados.push(novo.especie);
      if (this.estado.equipe.length < MAX_EQUIPE) {
        this.estado.equipe.push(novo);
        this.aviso(`${ESPECIES[novo.especie].nome} entrou na sua equipe.`);
      } else {
        this.estado.reserva.push(novo);
        this.aviso(`Equipe cheia: ${ESPECIES[novo.especie].nome} foi para a reserva.`);
      }
    }
    // No mapa: some quem foi vencido (num grupo, os que sobraram continuam andando)
    if (b.treinador) { /* os monstros do treinador não estão no mapa */ }
    else if (b.grupo) this.mundo.tirarDoGrupo(b.selvagem, vencidos.map((d) => d.uid));
    else if (vencidos.length) this.mundo.removerSelvagem(b.selvagem);
    this.gm?.depoisDaBatalha(b); // GM: tira do mapa o monstro do "Lutar agora" que sobrou
    b.descartarTudo();
    this.batalha = null;
    if (b.treinador) this.fimLutaTreinador(tipo, b);
    else if (tipo === 'derrota') {
      // Na casa: só os desmaiados levantam, com 1/4 da vida. Sem casa: acorda na fonte do castelo, curado.
      if (this.mundo.casaPos) this.levantarDesmaiados(0.25);
      else this.curarEquipe();
      this.mundo.irParaBase();
      this.aviso(this.mundo.casaPos ? 'Sua equipe desmaiou. Vocês acordaram em casa: os desmaiados voltaram com 1/4 da vida.' : 'Sua equipe desmaiou. Vocês acordaram na fonte do castelo, curados.');
      this.aviso('Ninguém foi perdido: todos os seus monstros estão em Equipe → Reserva.');
    } else {
      this.mundo.graca = 2.5;
    }
    this.salvar();
    this.enviarNuvem(true); // fim de batalha: manda para a nuvem na hora
    if (this.filaEvo.length) { this.proximaEvolucao(); return; }
    this.mostrarTela('mundo');
    this.atualizarHudMundo();
  }

  // ---------- cristais ----------
  ganharCristais(ganho) {
    const partes = [];
    for (const c of CRISTAIS) {
      const n = ganho[c.id] || 0;
      if (!n) continue;
      this.estado.pedras[c.id] += n;
      partes.push(`${n} ${n > 1 ? c.plural : c.id === 'comum' ? 'cristal' : c.nome}`);
    }
    if (partes.length) this.aviso('Você ganhou ' + partes.join(' e ') + '!');
    this.atualizarHudMundo();
  }

  // Fundir 3 cristais em 1 mais forte: só perto da casa
  podeFundir() { return !!this.mundo.casaPos && this.mundo.distanciaCasa() < 9; }

  fundir(i) {
    const de = CRISTAIS[i], para = CRISTAIS[i + 1];
    if (!para || !this.podeFundir() || this.estado.pedras[de.id] < CUSTO_FUSAO) return;
    this.estado.pedras[de.id] -= CUSTO_FUSAO;
    this.estado.pedras[para.id]++;
    this.aviso(`${CUSTO_FUSAO} ${de.plural} viraram 1 ${para.nome}!`);
    this.renderizarEquipe();
    this.atualizarHudMundo();
    this.salvar();
  }

  htmlCristais() {
    const p = this.estado.pedras, perto = this.podeFundir();
    const contas = CRISTAIS.map((c) => `<span class="cr" style="--c:${c.cor}"><span class="losango"></span>${c.nome} <b>${p[c.id]}</b></span>`).join('');
    const botoes = CRISTAIS.slice(0, -1).map((c, i) => `<button class="btn-hud" type="button" data-cmd="fundir" data-i="${i}" ${perto && p[c.id] >= CUSTO_FUSAO ? '' : 'disabled'}>Fundir ${CUSTO_FUSAO} ${c.curto} → 1 ${CRISTAIS[i + 1].curto}</button>`).join('');
    const dica = perto ? 'Sua casa tem uma bancada: junte 3 cristais iguais para fazer 1 mais forte.' : 'Para fundir cristais, vá até a sua casa.';
    return `<div class="linha-cr">${contas}</div><div class="linha-cr">${botoes}</div>
      <small>${dica} Forte: 1,5× a chance. Supremo: 2,2×. Tipo duplo exige Forte (formas iniciais) ou Supremo (2ª evolução e final).</small>`;
  }

  // ---------- painel da equipe ----------
  abrirEquipe(aba = 'equipe') {
    this.painelAberto = true;
    this.abaPainel = aba;
    this.renderizarEquipe();
    $('#painel-equipe').hidden = false;
    $('#painel-equipe').scrollTop = 0; // abre sempre no topo, com a equipe à vista
  }

  fecharEquipe() {
    this.painelAberto = false;
    $('#painel-equipe').hidden = true;
  }

  cartaoMonstro(m, botoes, onde = '') {
    const e = ESPECIES[m.especie], el = ELEMENTOS[e.elemento], s = statsDe(m.especie, m.nivel);
    const tagEstilo = `style="--cor:${fundoTipo(e)}"`;
    const fVida = m.hp / s.hpMax, fXp = m.xp / xpParaProximo(m.nivel);
    const nivelVida = fVida > 0.5 ? 'alto' : fVida > 0.2 ? 'medio' : 'baixo';
    const golpes = e.golpes.map((g) => `<span style="--cor:${ELEMENTOS[GOLPES[g].elemento].cor}">${GOLPES[g].nome}</span>`).join('');
    const evo = e.evoluiPara ? `Evolui no Nv.${e.nivelEvolucao}` : e.raro ? 'Raro' : 'Forma final';
    const marca = onde ? `<span class="onde ${onde === 'Na equipe' ? 'eq' : ''}">${onde}</span>` : '';
    return `<article class="ficha${m.hp <= 0 ? ' desmaiado' : ''}" style="--cor:${el.cor}">
      ${marca ? `<div class="cab-onde">${marca}</div>` : ''}
      <header><span class="tag" ${tagEstilo}>${nomeTipo(e)}</span><strong>${e.nome}</strong><em>Nv.${m.nivel}</em></header>
      <div class="linha"><span>Vida</span><i class="vida"><b style="width:${(fVida * 100).toFixed(0)}%" data-nivel="${nivelVida}"></b></i><small>${m.hp}/${s.hpMax}</small></div>
      <div class="linha"><span>Exp.</span><i class="xp"><b style="width:${(fXp * 100).toFixed(0)}%"></b></i><small>${m.xp}/${xpParaProximo(m.nivel)}</small></div>
      <div class="atributos"><span>Ataque <b>${Math.round(s.atk)}</b></span><span>Defesa <b>${Math.round(s.def)}</b></span><span>Veloc. <b>${s.vel.toFixed(1)}</b></span><span>${evo}</span></div>
      <div class="golpes-lista">${golpes}</div>
      <div class="cmds">${botoes}</div>
    </article>`;
  }

  renderizarEquipe() {
    const est = this.estado, aba = this.abaPainel || 'equipe';
    document.querySelectorAll('[data-aba-painel]').forEach((b) => b.classList.toggle('ativa', b.dataset.abaPainel === aba));
    $('#vista-equipe').hidden = aba !== 'equipe';
    $('#vista-reserva').hidden = aba !== 'reserva';
    $('#n-todos').textContent = est.equipe.length + est.reserva.length;
    $('#lista-equipe').innerHTML = est.equipe.map((m, i) => this.cartaoMonstro(m,
      (i > 0 ? `<button data-cmd="lider" data-i="${i}" type="button">Pôr na frente</button>` : '<span class="lider">Entra primeiro na batalha</span>') +
      (est.equipe.length > 1 ? `<button data-cmd="guardar" data-i="${i}" type="button">Mandar para reserva</button>` : ''))).join('');
    // Reserva: TODOS os monstros que você tem (os da equipe aparecem primeiro, marcados)
    const daEquipe = est.equipe.map((m, i) => this.cartaoMonstro(m,
      est.equipe.length > 1 ? `<button data-cmd="guardar" data-i="${i}" type="button">Mandar para reserva</button>` : '<span class="lider">Precisa ficar pelo menos 1 na equipe</span>', 'Na equipe'));
    const guardados = est.reserva.map((m, i) => this.cartaoMonstro(m,
      `<button data-cmd="usar" data-i="${i}" type="button">${est.equipe.length < MAX_EQUIPE ? 'Levar na equipe' : 'Trocar pelo 3º da equipe'}</button>`, 'Na reserva'));
    $('#lista-todos').innerHTML = [...daEquipe, ...guardados].join('');
    $('#painel-cristais').innerHTML = this.htmlCristais();
    $('#info-colecao').textContent = `Você tem ${est.equipe.length + est.reserva.length} monstros · Espécies obtidas: ${est.capturados.length} de ${Object.keys(ESPECIES).length}`;
  }

  comandoEquipe(cmd, i) {
    const est = this.estado;
    if (cmd === 'fundir') { this.fundir(i); return; }
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
    const p = this.estado.pedras;
    // mostra só os tipos que você tem (o comum sempre)
    $('#contador-cristais').innerHTML = CRISTAIS.filter((c, i) => i === 0 || p[c.id] > 0)
      .map((c) => `<span><span class="losango ${c.id}"></span>${p[c.id]}</span>`).join('');
  }

  atualizarRelogio() {
    const noite = this.mundo.periodo === 'noite';
    const h = this.mundo.hora;
    const resta = Math.ceil(((noite ? 1 : 0.5) - h) * 240);
    const txt = `${noite ? 'Noite' : 'Dia'} ${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, '0')}`;
    const el = $('#relogio');
    if (el.dataset.txt !== txt) { el.dataset.txt = txt; $('#relogio-texto').textContent = txt; el.classList.toggle('noite', noite); }
  }

  mostrarZona(nome) {
    const el = $('#zona-nome');
    el.textContent = nome;
    el.classList.remove('mostrar');
    void el.offsetWidth; // reinicia a animação
    el.classList.add('mostrar');
  }

  // ---------- avisos e números flutuantes ----------
  aviso(texto) {
    const el = document.createElement('div');
    el.className = 'aviso';
    el.textContent = texto;
    this.ui.avisos.appendChild(el);
    // na batalha os avisos são curtos (no máximo 2 na tela) para não tampar a luta
    const batalha = this.modo === 'batalha';
    while (this.ui.avisos.children.length > (batalha ? 2 : 3)) this.ui.avisos.firstChild.remove();
    setTimeout(() => el.remove(), batalha ? 1500 : 2800);
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
      if (n.t > 0.9 || this.modo !== 'batalha') { n.el.remove(); this.numerosAtivos.splice(i, 1); }
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
  // Salva no aparelho (na chave da conta). A nuvem recebe no máximo a cada 30 s (e na hora em momentos importantes).
  salvar() {
    if (!this.estado || !this.conta) return;
    const voltaram = protegerColecao(this.estado);
    if (voltaram.length) { this.aviso(`Recuperados para a reserva: ${voltaram.join(', ')}.`); this.atualizarHudMundo?.(); }
    gravarTexto(this.chaveSave(), JSON.stringify({ v: 3, t: Date.now(), estado: this.estado, pos: { x: this.mundo.pos.x, z: this.mundo.pos.z }, hora: this.mundo.hora, semente: SEMENTE }));
    if (this.conta.nuvem) this.nuvemPendente = true;
  }

  // ---------- contas ----------
  chaveSave() { return this.conta ? `${CHAVE_SAVE}:${this.conta.id}` : null; }

  mostrarLogin(mensagem = '') {
    this.mostrarTela('login');
    document.activeElement?.blur?.();
    $('#tela-login').classList.remove('digitando');
    const contas = lerContas();
    const ordem = [...contas.lista].sort((a, b) => (b.id === contas.ultima) - (a.id === contas.ultima) || b.visto - a.visto);
    $('#contas-aparelho').innerHTML = ordem.length ? '<small>Já entraram neste aparelho (1 toque)</small>' + ordem.map((c) => {
      const cor = ['#ff7a3d', '#4fc3ff', '#5fe08a', '#c79bff', '#ffd23f'][c.nome.length % 5];
      const resumo = (c.resumo ? c.resumo + ' · ' : '') + (c.tipo === 'local' ? 'só neste aparelho' : '☁ nuvem');
      return `<button type="button" class="conta ${c.id === contas.ultima ? 'ultima' : ''}" data-conta="${escHtml(c.id)}" style="--cor:${cor}">
        <span class="av">${escHtml(c.nome[0].toUpperCase())}</span><span class="txt"><b>${escHtml(c.nome)}</b><small>${escHtml(resumo)}</small></span></button>`;
    }).join('') : '';
    $('#btn-sem-nuvem').hidden = true;
    this.mensagemLogin(mensagem);
    this.ocupado(false);
  }

  mensagemLogin(txt, erro = true) {
    const el = $('#msg-login');
    el.textContent = txt;
    el.hidden = !txt;
    el.classList.toggle('erro', erro);
  }

  ocupado(sim) {
    for (const el of document.querySelectorAll('#tela-login button, #tela-login input')) el.disabled = sim;
    $('#form-login').classList.toggle('esperando', sim);
  }

  // Entrar (criar = false) ou Criar conta (criar = true) com nome e senha
  async loginComSenha(criar) {
    const nome = $('#nome-login').value.trim(), senha = $('#senha-login').value;
    // conta GM: só neste aparelho, com a senha do GM
    if (chaveNome(nome) === 'gm') {
      if (criar) { this.mensagemLogin('O nome GM é reservado.'); return; }
      if (await senhaDoGM(senha)) { $('#senha-login').value = ''; await this.entrarConta({ id: 'gm', nome: 'GM', tipo: 'gm' }); }
      else this.mensagemLogin('Senha do GM errada.');
      return;
    }
    const problema = problemaNome(nome);
    if (problema) { this.mensagemLogin(problema); $('#nome-login').focus(); return; }
    if (senha.length < SENHA_MIN) { this.mensagemLogin(`A senha precisa ter pelo menos ${SENHA_MIN} letras ou números.`); $('#senha-login').focus(); return; }
    this.ocupado(true);
    this.mensagemLogin(criar ? 'Criando a conta...' : 'Entrando...', false);
    try {
      const sessao = criar ? await criarConta(nome, senha) : await entrar(nome, senha);
      $('#senha-login').value = '';
      await this.entrarNuvem(nome, sessao, criar);
    } catch (e) {
      this.ocupado(false);
      this.mensagemLogin(e.message || 'Não deu para entrar.');
      // sem internet (ou a página não deixa falar com a nuvem): oferece jogar só neste aparelho
      if (e instanceof ErroNuvem && e.tipo === 'rede') {
        this.mensagemLogin('Sem conexão com a nuvem. Confira a internet e tente de novo, ou jogue só neste aparelho (sem nuvem).');
        $('#btn-sem-nuvem').hidden = false;
      }
    }
  }

  // Conta só deste aparelho (quando a nuvem não está ao alcance)
  async entrarSemNuvem() {
    const nome = $('#nome-login').value.trim();
    const problema = problemaNome(nome);
    if (problema) { this.mensagemLogin(problema); return; }
    await this.entrarConta({ id: 'local:' + chaveNome(nome), nome, tipo: 'local' });
  }

  // Toque numa conta que já entrou neste aparelho
  async entrarComUmToque(id) {
    const c = lerContas().lista.find((x) => x.id === id);
    if (!c) return;
    if (c.tipo === 'local') { await this.entrarConta({ id: c.id, nome: c.nome, tipo: 'local' }); return; }
    this.ocupado(true);
    this.mensagemLogin('Entrando...', false);
    try {
      const sessao = await renovar(c.refresh);
      await this.entrarNuvem(c.nome, sessao, false);
    } catch (e) {
      this.ocupado(false);
      if (e instanceof ErroNuvem && e.tipo === 'rede') {
        // sem internet: entra com a cópia do celular e manda para a nuvem quando a internet voltar
        await this.entrarConta({ id: c.id, nome: c.nome, tipo: 'nuvem', nuvem: new Nuvem({ uid: c.id, refreshToken: c.refresh }) }, 'offline');
      } else {
        $('#nome-login').value = c.nome;
        $('#senha-login').focus();
        this.mensagemLogin(e.message || 'Entre de novo com a sua senha.');
      }
    }
  }

  // Entrou na nuvem: junta o jogo salvo da nuvem com o do celular (vale o mais recente)
  async entrarNuvem(nome, sessao, nova) {
    const nuvem = new Nuvem(sessao);
    const conta = { id: sessao.uid, nome, tipo: 'nuvem', nuvem };
    const chave = `${CHAVE_SAVE}:${conta.id}`;
    let estadoNuvem = 'ok';
    try {
      const daNuvem = nova ? null : await nuvem.ler();
      if (daNuvem?.nome) conta.nome = daNuvem.nome; // o nome do jeito que foi criado (com acento e maiúsculas)
      const local = lerTexto(chave);
      if (daNuvem?.save && (!local || daNuvem.atualizado > horaDoSave(local))) gravarTexto(chave, daNuvem.save);
      else if (!daNuvem?.save && !local) this.migrarSaveAntigo(chave, conta.nome);
      const agora = lerTexto(chave);
      // o celular tem algo mais novo (ou a nuvem está vazia): manda para a nuvem
      if (agora && (!daNuvem?.save || horaDoSave(agora) > daNuvem.atualizado)) await nuvem.gravar(conta.nome, agora, horaDoSave(agora) || Date.now());
      else if (!daNuvem) await nuvem.gravar(conta.nome, '', 0); // conta nova: já guarda o nome
    } catch (e) {
      estadoNuvem = e instanceof ErroNuvem && e.tipo === 'rede' ? 'offline' : 'erro';
    }
    await this.entrarConta(conta, estadoNuvem);
  }

  // O jogo salvo de antes das contas vai para a 1ª conta que entrar (a cópia antiga continua guardada)
  migrarSaveAntigo(chave, nome) {
    if (lerTexto(CHAVE_MIGRADO)) return;
    const antigo = lerTexto(CHAVE_SAVE);
    if (!antigo || !lerSave(CHAVE_SAVE)) return;
    const s = JSON.parse(antigo);
    s.t = Date.now();
    gravarTexto(chave, JSON.stringify(s));
    gravarTexto(CHAVE_MIGRADO, chave);
    this.avisoMigrado = `O seu jogo salvo de antes agora é da conta ${nome}.`;
  }

  async entrarConta(conta, estadoNuvem = null) {
    this.conta = conta;
    this.estadoNuvem = estadoNuvem;
    this.estado = null;
    this.filaEvo = [];
    if (conta.tipo !== 'gm') {
      // guarda a conta na lista do aparelho (para o 1 toque) com um resumo do jogo
      const contas = lerContas();
      const s = lerSave(this.chaveSave());
      const lider = s?.estado.equipe[0];
      const item = { id: conta.id, nome: conta.nome, tipo: conta.tipo, refresh: conta.nuvem?.refreshToken || null, visto: Date.now(),
        resumo: lider ? `${ESPECIES[lider.especie].nome} Nv.${lider.nivel}` : '' };
      contas.lista = [item, ...contas.lista.filter((x) => x.id !== conta.id)];
      contas.ultima = conta.id;
      gravarContas(contas);
    }
    if (conta.tipo === 'gm') await this.ativarGM(); else this.desativarGM();
    this.mostrarTela('titulo');
    if (this.avisoMigrado) { this.aviso(this.avisoMigrado); this.avisoMigrado = null; }
  }

  // Volta a conta depois de uma atualização da página (artifact)
  restaurarConta(c) {
    const item = lerContas().lista.find((x) => x.id === c.id);
    this.conta = { ...c, nuvem: c.tipo === 'nuvem' && item?.refresh ? new Nuvem({ uid: c.id, refreshToken: item.refresh }) : null };
    if (c.tipo === 'gm') this.ativarGM();
  }

  trocarConta() {
    this.salvar();
    this.enviarNuvem(true);
    this.pet.guardar(true); // tira o monstro invocado do mapa (o "invocado" já ficou salvo)
    this.estado = null;
    this.conta = null;
    this.desativarGM();
    this.mostrarLogin();
  }

  // Manda o jogo salvo para a nuvem. agora = sem esperar os 30 s; fechando = o app pode fechar logo depois
  async enviarNuvem(agora = false, fechando = false) {
    const c = this.conta;
    if (!c?.nuvem || !this.nuvemPendente) return;
    if (!agora && this.envioT < ENVIO_NUVEM) return;
    if (this.enviando && !fechando) return;
    const txt = lerTexto(this.chaveSave());
    if (!txt) return;
    this.nuvemPendente = false;
    this.envioT = 0;
    this.enviando = true;
    try {
      await c.nuvem.gravar(c.nome, txt, horaDoSave(txt) || Date.now(), fechando);
      this.estadoNuvem = 'ok';
      // guarda o refresh token novo (ele pode mudar)
      const contas = lerContas(), item = contas.lista.find((x) => x.id === c.id);
      if (item && item.refresh !== c.nuvem.refreshToken) { item.refresh = c.nuvem.refreshToken; gravarContas(contas); }
    } catch (e) {
      this.nuvemPendente = true; // tenta de novo daqui a pouco
      this.estadoNuvem = e instanceof ErroNuvem && e.tipo === 'rede' ? 'offline' : 'erro';
    } finally {
      this.enviando = false;
    }
    if (this.modo === 'titulo') this.atualizarTitulo();
  }

  // GM: copia o jogo salvo de outra conta deste aparelho para a conta GM (para testar com a equipe de verdade)
  copiarJogoParaGM(id) {
    if (this.conta?.tipo !== 'gm') return false;
    const txt = lerTexto(`${CHAVE_SAVE}:${id}`);
    if (!txt) return false;
    const s = JSON.parse(txt);
    s.t = Date.now();
    gravarTexto(this.chaveSave(), JSON.stringify(s));
    this.estado = null;   // não deixa o jogo atual do GM gravar por cima da cópia
    this.filaEvo = [];
    this.gm?.fecharPainel();
    this.mostrarTela('titulo');
    return true;
  }

  contasDoAparelho() { return lerContas().lista; }

  // ---------- laço principal ----------
  quadro() {
    requestAnimationFrame(() => this.quadro());
    // celular em pé: mostra "Vire o celular" e o tempo do jogo para (dt = 0) até virar
    const emPe = EM_PE.matches;
    if (emPe !== this.emPe) {
      this.emPe = emPe;
      $('#vire').hidden = !emPe;
      if (emPe) { this.ctrl.soltar(); this.ctrl.soltarCamera(); }
    }
    const dt = emPe ? (this.relogio.getDelta(), 0) : Math.min(0.05, this.relogio.getDelta());
    this.t += dt;
    let cena = this.mundo.cena, camera = this.mundo.camera;
    this.envioT += dt;
    if (this.nuvemPendente && this.envioT >= ENVIO_NUVEM) this.enviarNuvem();
    if (this.modo === 'titulo' || this.modo === 'login') {
      this.mundo.orbitar(this.t);
    } else if (this.modo === 'colecao') {
      this.enquadrarColecao();
      this.plataforma.atualizar(dt, this.t);
      cena = this.plataforma.cena; camera = this.plataforma.camera;
    } else if (this.modo === 'evolucao') {
      this.cenaEvo.atualizar(dt, this.t);
      if (this.cenaEvo.trocou && !this.evoAnunciada) {
        this.evoAnunciada = true;
        $('#evo-texto').textContent = `${ESPECIES[this.evoAtual.de].nome} evoluiu para ${ESPECIES[this.evoAtual.para].nome}!`;
        const nov = novidadesDaEvolucao(this.evoAtual.de, this.evoAtual.para);
        $('#evo-novidades').textContent = nov.length ? 'Novo: ' + nov.join(' · ') : '';
      }
      if (this.cenaEvo.pronto) $('#evo-continuar').hidden = false;
      cena = this.cenaEvo.cena; camera = this.cenaEvo.camera;
    } else if (this.modo === 'mundo') {
      const pausado = this.painelAberto || emPe;
      this.mundo.atualizar(dt, this.ctrl, this.t, pausado);
      if (this.modo === 'mundo') this.pet.atualizar(dt, this.ctrl, this.t, pausado);
      this.atualizarRelogio();
      if (this.modo === 'mundo') this.atualizarBotaoCasa();
      this.salvarT = (this.salvarT || 0) + dt;
      if (this.salvarT > 5) { this.salvarT = 0; this.salvar(); }
    } else if (this.modo === 'batalha') {
      this.batalha.atualizar(dt, this.ctrl);
    }
    if (this.modo === 'batalha' && this.batalha) { cena = this.batalha.cena; camera = this.batalha.camera; }
    if (this.modo === 'evolucao' && this.cenaEvo) { cena = this.cenaEvo.cena; camera = this.cenaEvo.camera; }
    this.renderer.render(cena, camera);
    this.atualizarNumeros(camera, dt);
    this.gm?.quadro(dt);
    this.ctrl.fimDoQuadro();
  }
}

// Os modelos feitos no Blender (.glb) são baixados antes de o jogo abrir (no máximo 10 s;
// se não chegarem, o jogo usa os modelos de formas simples)
const modelos3D = carregarModelos3D(10000);
const iniciar = async (dados) => { await modelos3D; window.__jogo = new Jogo(dados || {}); };
const hot = window.claude?.hot;
if (hot?.ready) hot.ready(iniciar);
else iniciar(hot?.data ?? {});
