// =============================================================
// JOGO PRINCIPAL
// Cuida das telas (título, monstruário/escolha, mundo, batalha, evolução),
// do salvamento e da interface (barras, avisos, painel da equipe).
// =============================================================
import * as THREE from 'three';
import { Controles } from './controles.js';
import { Mundo } from './mundo.js';
import { Batalha } from './batalha.js';
import { Plataforma, CenaEvolucao } from './plataforma.js';
import {
  ESPECIES, ELEMENTOS, GOLPES, ORDEM_ELEMENTOS, RAROS, NOMES_ESTAGIO, NIVEIS_EVOLUCAO,
  criarMonstro, statsDe, xpParaProximo, xpDaVitoria, verificarEvolucao, formasDaLinha, fracoContra,
  textosMelhoria, novidadesDaEvolucao, melhoriaDe, EFEITOS, EFEITO_DO_ELEMENTO,
  CRISTAIS, CUSTO_FUSAO, ORDEM_DUPLAS, DUPLAS, nomeDupla, nomeTipo, fundoTipo, fracoContraEspecie, forteContraEspecie,
  DURACAO_EFEITO_DISPARO,
} from './dados.js';

const CHAVE_SAVE = 'cristalia-save-v1';
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

function lerSave() {
  try {
    const bruto = localStorage.getItem(CHAVE_SAVE);
    if (!bruto) return null;
    const s = JSON.parse(bruto);
    if (!s?.estado?.equipe?.length) return null;
    // ignora monstros de versões antigas que não existem mais
    s.estado.equipe = s.estado.equipe.filter((m) => ESPECIES[m.especie]);
    s.estado.reserva = (s.estado.reserva || []).filter((m) => ESPECIES[m.especie]);
    s.estado.capturados = (s.estado.capturados || []).filter((id) => ESPECIES[id]);
    // saves de antes da mudança da vida (v < 3): todos voltam curados com a vida nova
    migrarEstado(s.estado);
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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.palco.appendChild(this.renderer.domElement);
    this.aspecto = 1;
    this.medir();

    this.ui = {
      bjNome: $('#bj-nome'), bjNivel: $('#bj-nivel'), bjEl: $('#bj-el'), bjVida: $('#bj-vida b'), bjHp: $('#bj-hp'), bjEquipe: $('#bj-equipe'),
      biNome: $('#bi-nome'), biNivel: $('#bi-nivel'), biEl: $('#bi-el'), biVida: $('#bi-vida b'), biHp: $('#bi-hp'),
      bjStatus: $('#bj-status'), biStatus: $('#bi-status'), arenaInfo: $('#arena-info'), biTipo: $('#bi-tipo'),
      golpes: [...document.querySelectorAll('#hud-batalha .golpe')],
      esquiva: $('#btn-esquiva'), qtdCristal: $('#qtd-cristal'), chanceCristal: $('#chance-cristal'),
      nomeCristal: $('#nome-cristal'), btnCristal: $('#btn-cristal'),
      rotulo: $('#rotulo'), numeros: $('#numeros'), avisos: $('#avisos'),
    };
    this.ctrl = new Controles(this.app, this.palco);
    this.estado = null;
    this.modo = 'titulo';
    this.mundo = new Mundo(this);
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

    window.addEventListener('resize', () => this.medir());
    this.ligarBotoes();

    // Se a página foi atualizada com o jogo aberto, continua de onde estava
    if (dadosQuentes?.estado) {
      this.estado = migrarEstado(dadosQuentes.estado);
      this.entrarNoMundo();
      if (dadosQuentes.pos) this.mundo.pos.set(dadosQuentes.pos.x, 0, dadosQuentes.pos.z);
      if (dadosQuentes.hora != null) this.mundo.hora = dadosQuentes.hora;
    } else {
      this.mostrarTela('titulo');
    }
    window.claude?.hot?.snapshot?.(() => (this.estado ? { estado: this.estado, pos: { x: this.mundo.pos.x, z: this.mundo.pos.z }, hora: this.mundo.hora } : {}));
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
    $('#tela-titulo').hidden = nome !== 'titulo';
    $('#tela-colecao').hidden = nome !== 'colecao';
    $('#tela-evolucao').hidden = nome !== 'evolucao';
    $('#hud-mundo').hidden = nome !== 'mundo';
    $('#hud-batalha').hidden = nome !== 'batalha';
    this.ctrl.mostrar(nome === 'mundo' || nome === 'batalha');
    if (nome !== 'mundo') { this.mostrarRotulo(null); this.fecharEquipe(); }
    if (nome === 'titulo') $('#btn-continuar').hidden = !lerSave();
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
      this.abrirColecao('inicial');
    });
    $('#btn-continuar').addEventListener('click', () => {
      const s = lerSave();
      if (!s) return;
      this.estado = s.estado;
      if (s.hora != null) this.mundo.hora = s.hora;
      this.entrarNoMundo();
      if (s.pos) { this.mundo.pos.set(s.pos.x, 0, s.pos.z); this.mundo.posicionarCamera(1); }
      // saves antigos: evolui quem já tem nível para isso
      for (const m of [...this.estado.equipe, ...this.estado.reserva]) this.registrarEvolucoes(verificarEvolucao(m));
      if (this.filaEvo.length) this.proximaEvolucao();
    });
    $('#btn-monstruario').addEventListener('click', () => this.abrirColecao('ver'));
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
    $('#fechar-equipe').addEventListener('click', () => this.fecharEquipe());
    $('#painel-equipe').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cmd]');
      if (b) this.comandoEquipe(b.dataset.cmd, Number(b.dataset.i));
    });
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
    if (e.chefe) evo = 'Super raro: é o chefe do Caminho das Brasas, no Trono de Magma. Não evolui. Só um <b>Cristal Supremo</b> segura ele.';
    else if (e.raro) evo = 'Monstro raro: não evolui.';
    else if (e.evoluiPara) {
      const prox = novidadesDaEvolucao(id, e.evoluiPara);
      evo = `Evolui no <b>Nv.${e.nivelEvolucao}</b> para <b>${ESPECIES[e.evoluiPara].nome}</b>${prox.length ? ': ' + prox.join(', ') : ''}.`;
    } else evo = 'Forma final da linha.';
    const mel = melhoriaDe(id);
    const golpes = e.golpes.map((g) => {
      const gp = GOLPES[g];
      const nomeEf = e.elementos.includes(gp.elemento) ? EFEITOS[EFEITO_DO_ELEMENTO[gp.elemento]]?.nome : null;
      let extra = TIPOS[gp.tipo];
      if (gp.tipo === 'projetil' && mel.disparos > 1) extra += ` ×${mel.disparos}`;
      const causa = (gp.tipo === 'area' && mel.efeitoArea) || (gp.tipo === 'corpo' && mel.efeitoPerto) || (gp.tipo === 'projetil' && mel.efeitoDisparo);
      if (causa && nomeEf) extra += ` · ${nomeEf}`;
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
      if (!lugar && m.dungeon && (m.dungeon.etapaAtual >= 0 || m.pos.x * Math.SQRT1_2 - m.pos.z * Math.SQRT1_2 > 76)) {
        this.aviso('Calor demais aqui no Caminho das Brasas. Monte a casa antes da entrada.');
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
  iniciarBatalha(selvagem) {
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
      const xp = Math.round(vencidos.reduce((s, d) => s + xpDaVitoria(d.nivel) * bonus(d), 0) * (b.grupo ? 0.6 : 1));
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
      this.aviso(b.capturados.length ? 'Você capturou o chefe do Trono de Magma!' : 'Você venceu Ignárion! Ele volta no próximo amanhecer.');
    }
    for (const d of b.derrotados) {
      const esp = ESPECIES[d.especie];
      if (esp.dupla) { ganho.forte++; if (esp.estagio >= 2 && Math.random() < 0.35) ganho.supremo++; }
      else if (Math.random() < (b.grupo ? 0.2 : 0.35)) ganho.comum++;
    }
    this.ganharCristais(ganho);
    for (const novo of b.capturados) {
      novo.hp = Math.max(1, novo.hp);
      delete novo.lider;
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
    if (b.grupo) this.mundo.tirarDoGrupo(b.selvagem, vencidos.map((d) => d.uid));
    else if (vencidos.length) this.mundo.removerSelvagem(b.selvagem);
    b.descartarTudo();
    this.batalha = null;
    if (tipo === 'derrota') {
      this.curarEquipe();
      this.mundo.irParaBase();
      this.aviso(this.mundo.casaPos ? 'Sua equipe desmaiou. Vocês acordaram em casa, curados.' : 'Sua equipe desmaiou. Vocês acordaram na fonte, curados.');
    } else {
      this.mundo.graca = 2.5;
    }
    this.salvar();
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
    const tagEstilo = `style="--cor:${fundoTipo(e)}"`;
    const fVida = m.hp / s.hpMax, fXp = m.xp / xpParaProximo(m.nivel);
    const nivelVida = fVida > 0.5 ? 'alto' : fVida > 0.2 ? 'medio' : 'baixo';
    const golpes = e.golpes.map((g) => `<span style="--cor:${ELEMENTOS[GOLPES[g].elemento].cor}">${GOLPES[g].nome}</span>`).join('');
    const evo = e.evoluiPara ? `Evolui no Nv.${e.nivelEvolucao}` : e.raro ? 'Raro' : 'Forma final';
    return `<article class="ficha" style="--cor:${el.cor}">
      <header><span class="tag" ${tagEstilo}>${nomeTipo(e)}</span><strong>${e.nome}</strong><em>Nv.${m.nivel}</em></header>
      <div class="linha"><span>Vida</span><i class="vida"><b style="width:${(fVida * 100).toFixed(0)}%" data-nivel="${nivelVida}"></b></i><small>${m.hp}/${s.hpMax}</small></div>
      <div class="linha"><span>Exp.</span><i class="xp"><b style="width:${(fXp * 100).toFixed(0)}%"></b></i><small>${m.xp}/${xpParaProximo(m.nivel)}</small></div>
      <div class="atributos"><span>Ataque <b>${Math.round(s.atk)}</b></span><span>Defesa <b>${Math.round(s.def)}</b></span><span>Veloc. <b>${s.vel.toFixed(1)}</b></span><span>${evo}</span></div>
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
    $('#painel-cristais').innerHTML = this.htmlCristais();
    $('#info-colecao').textContent = `Espécies obtidas: ${est.capturados.length} de ${Object.keys(ESPECIES).length}`;
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
  salvar() {
    if (!this.estado) return;
    try {
      localStorage.setItem(CHAVE_SAVE, JSON.stringify({ v: 3, estado: this.estado, pos: { x: this.mundo.pos.x, z: this.mundo.pos.z }, hora: this.mundo.hora }));
    } catch { /* sem armazenamento: o jogo continua sem salvar */ }
  }

  // ---------- laço principal ----------
  quadro() {
    requestAnimationFrame(() => this.quadro());
    const dt = Math.min(0.05, this.relogio.getDelta());
    this.t += dt;
    let cena = this.mundo.cena, camera = this.mundo.camera;
    if (this.modo === 'titulo') {
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
      this.mundo.atualizar(dt, this.ctrl, this.t, this.painelAberto);
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
    this.ctrl.fimDoQuadro();
  }
}

const iniciar = (dados) => { window.__jogo = new Jogo(dados || {}); };
const hot = window.claude?.hot;
if (hot?.ready) hot.ready(iniciar);
else iniciar(hot?.data ?? {});
