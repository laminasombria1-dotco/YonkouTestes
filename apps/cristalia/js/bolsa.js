// =============================================================
// BOLSA, LOJA E MOEDAS
//  - Moedas de ouro: ganhas nas vitórias (selvagens, grupos, chefes e treinadores).
//  - Poções: Cura (vermelha) cura metade da vida de 1 monstro de pé;
//    Reviver (amarela) levanta 1 monstro desmaiado com metade da vida.
//  - Bolsa (o botão do canto, no lugar da antiga casa): a casa, as poções
//    (usar em qualquer monstro), os cristais e o Ovo Misterioso.
//  - Loja: a barraca listrada da vila do Reino. Encoste nela para comprar.
// Na batalha, as poções ficam no botão do frasco (recarga de 10 s): batalha.js.
// =============================================================
import { ESPECIES, ELEMENTOS, statsDe } from './dados.js';

export const POCOES = {
  cura: { nome: 'Poção de Cura', cor: 'vermelha', preco: 40, parte: 0.5, texto: 'Cura metade da vida de um monstro de pé.' },
  reviver: { nome: 'Poção de Reviver', cor: 'amarela', preco: 120, parte: 0.5, texto: 'Levanta um monstro desmaiado com metade da vida.' },
};
export const RECARGA_POCAO = 10; // segundos entre uma poção e outra, na batalha

// Moedas de cada vitória (os treinadores têm as deles, em reino.js)
export const MOEDAS = { selvagem: [5, 10], comumGrupo: 4, liderGrupo: 10, chefe: 300 };

const $ = (s) => document.querySelector(s);

// Usa uma poção num monstro. Devolve o texto do aviso, ou null se não deu.
export function aplicarPocao(estado, qual, m) {
  const max = statsDe(m.especie, m.nivel).hpMax, nome = ESPECIES[m.especie].nome;
  if ((estado.pocoes?.[qual] || 0) <= 0) return null;
  if (qual === 'cura') {
    if (m.hp <= 0 || m.hp >= max) return null;
    const antes = m.hp;
    m.hp = Math.min(max, m.hp + Math.round(max * POCOES.cura.parte));
    estado.pocoes.cura--;
    return `${nome} recuperou ${m.hp - antes} de vida.`;
  }
  if (m.hp > 0) return null;
  m.hp = Math.round(max * POCOES.reviver.parte);
  estado.pocoes.reviver--;
  return `${nome} levantou com metade da vida!`;
}

export class Bolsa {
  constructor(jogo) {
    this.jogo = jogo;
    for (const id of ['#painel-bolsa', '#painel-loja']) {
      const el = $(id);
      el.addEventListener('click', (e) => {
        if (e.target.closest('.fechar-painel') || e.target === el) { this.fechar(); return; }
        const b = e.target.closest('[data-bolsa]');
        if (b && !b.disabled) this.comando(b.dataset.bolsa, b.dataset);
      });
    }
  }

  get est() { return this.jogo.estado; }
  get aberta() { return !$('#painel-bolsa').hidden || !$('#painel-loja').hidden; }

  // Saves antigos não têm moedas nem poções: começam com 0 moedas e 3 poções de cura
  static garantir(estado) {
    if (typeof estado.moedas !== 'number') estado.moedas = 0;
    if (!estado.pocoes) estado.pocoes = { cura: 3, reviver: 0 };
  }

  ganharMoedas(n) {
    if (!n) return;
    this.est.moedas += n;
    this.jogo.aviso(`+${n} moedas de ouro.`);
    this.jogo.atualizarHudMundo();
  }

  abrir() { this.jogo.painelAberto = true; $('#painel-loja').hidden = true; $('#painel-bolsa').hidden = false; this.render(); }
  abrirLoja() { this.jogo.painelAberto = true; $('#painel-bolsa').hidden = true; $('#painel-loja').hidden = false; this.renderLoja(); }
  fechar() {
    if (!this.aberta) return false;
    $('#painel-bolsa').hidden = true;
    $('#painel-loja').hidden = true;
    this.jogo.painelAberto = false;
    return true;
  }

  comando(cmd, d) {
    const j = this.jogo, est = this.est;
    if (cmd === 'casa') { this.fechar(); j.acaoCasa(); return; }
    if (cmd === 'usar') {
      const lista = [...est.equipe, ...est.reserva], m = lista[Number(d.i)];
      const txt = m && aplicarPocao(est, d.qual, m);
      if (txt) { j.aviso(txt); j.atualizarHudMundo(); j.salvar(); }
    }
    if (cmd === 'comprar') {
      const p = POCOES[d.qual], n = Number(d.n), custo = p.preco * n;
      if (est.moedas < custo) { j.aviso(`Faltam ${custo - est.moedas} moedas.`); return; }
      est.moedas -= custo;
      est.pocoes[d.qual] += n;
      j.aviso(`Você comprou ${n} ${n > 1 ? 'Poções' : 'Poção'} de ${d.qual === 'cura' ? 'Cura' : 'Reviver'}.`);
      j.atualizarHudMundo();
      j.salvar();
      this.renderLoja();
      return;
    }
    if (cmd === 'fundir') { j.fundir(Number(d.i)); }
    if (cmd === 'chocar') { j.ovo?.chocarAgora(); }
    this.render();
  }

  // ---------- o painel da bolsa ----------
  render() {
    const est = this.est, j = this.jogo, m = j.mundo;
    $('#bolsa-moedas').textContent = est.moedas;
    const txtCasa = !m.casaPos ? 'Montar casa aqui' : m.distanciaCasa() < 7 ? 'Guardar a casa' : 'Mudar a casa para cá';
    const lista = [...est.equipe, ...est.reserva];
    const fichas = lista.map((mm, i) => {
      const e = ESPECIES[mm.especie], max = statsDe(mm.especie, mm.nivel).hpMax, caido = mm.hp <= 0;
      const podeCura = !caido && mm.hp < max && est.pocoes.cura > 0, podeRev = caido && est.pocoes.reviver > 0;
      return `<div class="bolsa-monstro${caido ? ' desmaiado' : ''}" style="--cor:${ELEMENTOS[e.elemento].cor}">
        <header>${e.nome} <span>${caido ? 'desmaiado' : `${mm.hp}/${max}`}</span></header>
        <i class="vida"><b style="width:${(Math.max(0, mm.hp) / max * 100).toFixed(0)}%" data-nivel="${mm.hp / max > 0.5 ? 'alto' : mm.hp / max > 0.2 ? 'medio' : 'baixo'}"></b></i>
        <div class="cmds">${caido
          ? `<button class="bolsa-btn" type="button" data-bolsa="usar" data-qual="reviver" data-i="${i}" ${podeRev ? '' : 'disabled'}>Reviver</button>`
          : `<button class="bolsa-btn" type="button" data-bolsa="usar" data-qual="cura" data-i="${i}" ${podeCura ? '' : 'disabled'}>Curar</button>`}</div>
      </div>`;
    }).join('');
    $('#conteudo-bolsa').innerHTML = `
      <div class="bolsa-secao"><h3>Casa</h3>
        <div class="bolsa-linha"><button class="bolsa-btn" type="button" data-bolsa="casa">${txtCasa}</button>
        <small>A casa não cura: ela marca onde você acorda se a equipe desmaiar (os desmaiados voltam com 1/4 da vida).</small></div></div>
      <div class="bolsa-secao"><h3>Poções</h3>
        <div class="bolsa-linha"><span class="item"><i class="frasco cura"></i>Cura ×${est.pocoes.cura}</span><span class="item"><i class="frasco reviver"></i>Reviver ×${est.pocoes.reviver}</span>
        <small>Compre mais na loja de poções do Reino.</small></div>
        <div class="bolsa-monstros">${fichas}</div></div>
      ${j.ovo ? j.ovo.htmlBolsa() : ''}
      <div class="bolsa-secao"><h3>Cristais</h3><div id="bolsa-cristais">${j.htmlCristais().replaceAll('data-cmd="fundir"', 'data-bolsa="fundir"')}</div></div>`;
  }

  // ---------- a loja ----------
  renderLoja() {
    const est = this.est;
    $('#loja-moedas').textContent = est.moedas;
    $('#conteudo-loja').innerHTML = Object.entries(POCOES).map(([id, p]) => `
      <div class="loja-item"><i class="frasco ${id}"></i>
        <div><b>${p.nome}</b> <small>(você tem ${est.pocoes[id]})</small><p>${p.texto}</p></div>
        <div class="bolsa-linha"><span class="preco"><i class="moeda"></i>${p.preco}</span>
          <button class="bolsa-btn" type="button" data-bolsa="comprar" data-qual="${id}" data-n="1" ${est.moedas < p.preco ? 'disabled' : ''}>Comprar 1</button>
          <button class="bolsa-btn" type="button" data-bolsa="comprar" data-qual="${id}" data-n="5" ${est.moedas < p.preco * 5 ? 'disabled' : ''}>Comprar 5</button></div>
      </div>`).join('') + '<p class="vazio">Ganhe moedas vencendo monstros, grupos, chefes e os treinadores da arena.</p>';
  }
}
