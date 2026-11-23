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

// A casa evolui com Madeira Rara (e moedas). O nível fica em estado.casaNivel.
//  1: não cura; acordar nela levanta os desmaiados com 1/4 da vida
//  2: encostar nela levanta os desmaiados com 2/3 da vida (os de pé ficam como estão)
//  3: igual ao 2 + a lojinha do lado da casa, 75% mais cara que a do Reino
export const CASA = {
  custo: { 2: { madeira: 6, moedas: 500 }, 3: { madeira: 12, moedas: 1500 } },
  fatorLojinha: 1.75,
  texto: {
    1: 'Não cura: marca onde você acorda se a equipe desmaiar (os desmaiados voltam com 1/4 da vida).',
    2: 'Encoste nela para levantar os desmaiados com 2/3 da vida. Acordar nela também levanta com 2/3.',
    3: 'Levanta os desmaiados com 2/3 da vida e tem a lojinha de poções do lado (75% mais cara que a do Reino).',
  },
};
// Madeira Rara: só de inimigos fortes (Nv.30 para cima). Os treinadores não dão.
export const MADEIRA = { chefe30: 1, chefe40: 2, lider30: 0.25, monstro40: 0.05 };
export function madeiraDe(d) {
  const e = ESPECIES[d.especie];
  if (e.chefe) return d.nivel >= 40 ? MADEIRA.chefe40 : d.nivel >= 30 ? MADEIRA.chefe30 : 0;
  if (d.lider && d.nivel >= 30) return Math.random() < MADEIRA.lider30 ? 1 : 0;
  if (d.nivel >= 40) return Math.random() < MADEIRA.monstro40 ? 1 : 0;
  return 0;
}

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
    if (typeof estado.madeira !== 'number') estado.madeira = 0;
    if (!estado.casaNivel) estado.casaNivel = 1;
  }

  ganharMoedas(n) {
    if (!n) return;
    this.est.moedas += n;
    this.jogo.aviso(`+${n} moedas de ouro.`);
    this.jogo.atualizarHudMundo();
  }

  abrir() { this.jogo.painelAberto = true; $('#painel-loja').hidden = true; $('#painel-bolsa').hidden = false; this.render(); }
  // lojinha = true: a lojinha da casa (nível 3), com os preços 75% maiores
  abrirLoja(lojinha = false) { this.fator = lojinha ? CASA.fatorLojinha : 1; this.jogo.painelAberto = true; $('#painel-bolsa').hidden = true; $('#painel-loja').hidden = false; this.renderLoja(); }
  preco(id) { return Math.round(POCOES[id].preco * (this.fator || 1)); }

  ganharMadeira(n) {
    if (!n) return;
    this.est.madeira += n;
    this.jogo.aviso(`Você conseguiu ${n} Madeira${n > 1 ? 's Raras' : ' Rara'}! (para evoluir a casa)`);
  }

  // Evolui a casa (precisa estar perto dela, montada)
  evoluirCasa() {
    const est = this.est, j = this.jogo, m = j.mundo, prox = est.casaNivel + 1, c = CASA.custo[prox];
    if (!c) return;
    if (!m.casaPos || m.distanciaCasa() > 7) { j.aviso('Vá até a sua casa montada para evoluir.'); return; }
    if (est.madeira < c.madeira || est.moedas < c.moedas) { j.aviso(`Faltam ${Math.max(0, c.madeira - est.madeira)} Madeiras Raras e ${Math.max(0, c.moedas - est.moedas)} moedas.`); return; }
    est.madeira -= c.madeira;
    est.moedas -= c.moedas;
    est.casaNivel = prox;
    m.trocarModeloCasa();
    j.aviso(`Sua casa evoluiu para o nível ${prox}!`);
    j.aviso(CASA.texto[prox]);
    j.atualizarHudMundo();
    j.salvar();
  }
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
    if (cmd === 'evoluirCasa') { this.evoluirCasa(); }
    if (cmd === 'usar') {
      const lista = [...est.equipe, ...est.reserva], m = lista[Number(d.i)];
      const txt = m && aplicarPocao(est, d.qual, m);
      if (txt) { j.aviso(txt); j.atualizarHudMundo(); j.salvar(); }
    }
    if (cmd === 'comprar') {
      const n = Number(d.n), custo = this.preco(d.qual) * n;
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
    const nv = est.casaNivel, c = CASA.custo[nv + 1], perto = m.casaPos && m.distanciaCasa() <= 7;
    const evoluir = c ? `<button class="bolsa-btn" type="button" data-bolsa="evoluirCasa" ${perto && est.madeira >= c.madeira && est.moedas >= c.moedas ? '' : 'disabled'}>Evoluir para o nível ${nv + 1}</button>
        <small>Custa ${c.madeira} Madeiras Raras e ${c.moedas} moedas${perto ? '' : ' (vá até a casa montada)'}.</small>` : '<small>Sua casa já está no nível máximo.</small>';
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
      <div class="bolsa-secao"><h3>Casa · nível ${nv}</h3>
        <div class="bolsa-linha"><button class="bolsa-btn" type="button" data-bolsa="casa">${txtCasa}</button><small>${CASA.texto[nv]}</small></div>
        <div class="bolsa-linha"><span class="item"><i class="madeira"></i>Madeira Rara ×${est.madeira}</span>${evoluir}</div>
        <small>Madeira Rara: vença chefes do Nv.30 para cima (1, ou 2 no Nv.40+), líderes de grupo Nv.30+ (às vezes) e monstros Nv.40+ (raramente).</small></div>
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
    const lojinha = (this.fator || 1) > 1;
    $('#painel-loja h2').firstChild.textContent = lojinha ? 'Lojinha da Casa ' : 'Loja de Poções ';
    $('#conteudo-loja').innerHTML = Object.entries(POCOES).map(([id, p]) => `
      <div class="loja-item"><i class="frasco ${id}"></i>
        <div><b>${p.nome}</b> <small>(você tem ${est.pocoes[id]})</small><p>${p.texto}</p></div>
        <div class="bolsa-linha"><span class="preco"><i class="moeda"></i>${this.preco(id)}</span>
          <button class="bolsa-btn" type="button" data-bolsa="comprar" data-qual="${id}" data-n="1" ${est.moedas < this.preco(id) ? 'disabled' : ''}>Comprar 1</button>
          <button class="bolsa-btn" type="button" data-bolsa="comprar" data-qual="${id}" data-n="5" ${est.moedas < this.preco(id) * 5 ? 'disabled' : ''}>Comprar 5</button></div>
      </div>`).join('') + (lojinha ? '<p class="vazio">Na lojinha da casa tudo custa 75% a mais que na loja do Reino.</p>' : '<p class="vazio">Ganhe moedas vencendo monstros, grupos, chefes e os treinadores da arena.</p>');
  }
}
