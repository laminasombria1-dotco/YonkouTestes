// =============================================================
// BOLSA, LOJA E OURO
//  - Ouro (no código e no jogo salvo continua "moedas"): ganho nas vitórias
//    (selvagens, grupos, chefes e treinadores).
//  - Itens raros: Galho Raro (evolui a casa), Asa do Anjo e Coração do Guardião
//    (evolução rara). Galhos e asas caem por sorte dos chefes de masmorra (DROPS).
//  - Poções: Cura (vermelha) cura metade da vida de 1 monstro de pé;
//    Reviver (amarela) levanta 1 monstro desmaiado com metade da vida.
//  - Bolsa (o botão do canto): a bandeira do Reino, a casa do Reino, os itens raros,
//    as poções (usar em qualquer monstro), os cristais e o Ovo Misterioso.
//  - Loja: a barraca listrada da vila do Reino. Encoste nela para comprar.
// Na batalha, as poções ficam no botão do frasco (recarga de 10 s): batalha.js.
// =============================================================
import { ESPECIES, ELEMENTOS, statsDe } from './dados.js';
import { SEMENTES, ORDEM_SEMENTES, JARDIM, AFETO, garantirJardim, faseDo, tempoTexto, plantar, colher, afetoDe, alimentar } from './jardim.js';

export const POCOES = {
  cura: { nome: 'Poção de Cura', cor: 'vermelha', preco: 40, parte: 0.5, texto: 'Cura metade da vida de um monstro de pé.' },
  reviver: { nome: 'Poção de Reviver', cor: 'amarela', preco: 120, parte: 0.5, texto: 'Levanta um monstro desmaiado com metade da vida.' },
};
export const RECARGA_POCAO = 10; // segundos entre uma poção e outra, na batalha

// A CASA fica fixa no Reino (entre a arena e o portão) e sobe do nível 1 ao 5 com
// Galhos Raros + ouro (vá até ela). Ela não cura nem tem loja: é o lar do jogador
// (o jardim, para plantar frutas, vem na próxima fase). O nível fica em estado.casaNivel.
export const CASA = {
  custo: { 2: { galhos: 4, moedas: 500 }, 3: { galhos: 8, moedas: 1500 }, 4: { galhos: 14, moedas: 4000 }, 5: { galhos: 22, moedas: 8000 } },
  texto: {
    1: 'Uma cabana simples. Perto dela dá para fundir cristais.',
    2: 'Um sobrado com 2º andar e telhado azul.',
    3: 'Ganha uma varanda coberta e uma cerca com flores.',
    4: 'Uma casa grande, mais larga, com uma torrezinha.',
    5: 'O casarão: ala nova, torre de telhado dourado com a bandeira do Reino e lanternas.',
  },
};
// A BANDEIRA DO REINO é portátil: você finca onde quiser renascer. Se a equipe desmaiar, você
// acorda nela e os desmaiados levantam com 1/4 da vida (nível 2: 2/4). Sem ela, acorda na fonte.
// Sobe de nível com Galhos Raros + ouro (perto dela). Fica salva em estado.bandeira e estado.bandeiraNivel.
export const BANDEIRA = {
  custo: { 2: { galhos: 3, moedas: 400 } },
  parte: { 1: 0.25, 2: 0.5 },
  texto: {
    1: 'Finque onde quiser renascer: se a equipe desmaiar, os desmaiados levantam com 1/4 da vida.',
    2: 'Os desmaiados levantam com 2/4 da vida.',
  },
};
// Galho Raro e Asa do Anjo: só POR SORTE dos chefes de masmorra e dos reis de dungeon.
// Os monstros do mapa, os acampamentos e os treinadores não dão.
//  galho = chance de cair o galho | asa = chance de cair a asa | os2 = chance de cair os dois juntos
//  (os2 já está dentro das outras: no chefe, 25% os 2, 45% só o galho, 20% só a asa, 10% nada)
export const DROPS = {
  chefeMasmorra: { galho: 0.70, asa: 0.45, os2: 0.25 },
  reiDungeon: { galho: 0.50, asa: 0.25, os2: 0.10 }, // as dungeons ainda vão ser feitas
};
export function sortearDrop(qual, sorte = Math.random()) {
  const D = DROPS[qual], soGalho = D.galho - D.os2, soAsa = D.asa - D.os2;
  if (sorte < D.os2) return { galhos: 1, asas: 1 };
  if (sorte < D.os2 + soGalho) return { galhos: 1, asas: 0 };
  if (sorte < D.os2 + soGalho + soAsa) return { galhos: 0, asas: 1 };
  return { galhos: 0, asas: 0 };
}

// Ouro de cada vitória (os treinadores têm o deles, em reino.js)
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
    if (typeof estado.galhos !== 'number') estado.galhos = 0;   // Galho Raro (casa)
    if (!estado.casaNivel) estado.casaNivel = 1;
    if (!estado.bandeiraNivel) estado.bandeiraNivel = 1;
    garantirJardim(estado); // jardim, sementes e frutas
    if (typeof estado.asas !== 'number') estado.asas = 0;       // Asa do Anjo (evolução rara)
    if (typeof estado.coracoes !== 'number') estado.coracoes = 0; // Coração do Guardião (evolução rara)
  }

  ganharMoedas(n) {
    if (!n) return;
    this.est.moedas += n;
    this.jogo.aviso(`+${n} de ouro.`);
    this.jogo.atualizarHudMundo();
  }

  abrir() { this.jogo.painelAberto = true; $('#painel-loja').hidden = true; $('#painel-bolsa').hidden = false; this.render(); }
  abrirLoja() { this.jogo.painelAberto = true; $('#painel-bolsa').hidden = true; $('#painel-loja').hidden = false; this.renderLoja(); }
  preco(id) { return POCOES[id].preco; }

  // Galhos Raros e Asas do Anjo que caíram (de sortearDrop)
  ganharItens(d) {
    if (d.galhos) { this.est.galhos += d.galhos; this.jogo.aviso(`Você conseguiu ${d.galhos} Galho${d.galhos > 1 ? 's Raros' : ' Raro'}! (para evoluir a casa)`); }
    if (d.asas) { this.est.asas += d.asas; this.jogo.aviso(`Você conseguiu ${d.asas} Asa${d.asas > 1 ? 's' : ''} do Anjo! (para a evolução rara)`); }
  }

  // Paga o custo (galhos e ouro). Devolve false e avisa se faltar.
  pagar(c) {
    const est = this.est;
    if (est.galhos < c.galhos || est.moedas < c.moedas) { this.jogo.aviso(`Faltam ${Math.max(0, c.galhos - est.galhos)} Galhos Raros e ${Math.max(0, c.moedas - est.moedas)} de ouro.`); return false; }
    est.galhos -= c.galhos;
    est.moedas -= c.moedas;
    return true;
  }

  // Evolui a casa do Reino (precisa estar perto dela)
  evoluirCasa() {
    const est = this.est, j = this.jogo, m = j.mundo, prox = est.casaNivel + 1, c = CASA.custo[prox];
    if (!c) return;
    if (m.distanciaCasa() > 8) { j.aviso('Vá até a sua casa no Reino (entre a arena e o portão) para evoluir.'); return; }
    if (!this.pagar(c)) return;
    est.casaNivel = prox;
    m.trocarModeloCasa();
    j.aviso(`Sua casa evoluiu para o nível ${prox}!`);
    j.aviso(CASA.texto[prox]);
    j.atualizarHudMundo();
    j.salvar();
  }

  // Evolui o jardim (mais vagas; precisa estar perto da casa)
  evoluirJardim() {
    const est = this.est, j = this.jogo, prox = est.jardim.nivel + 1, c = JARDIM.custo[prox];
    if (!c) return;
    if (j.mundo.distanciaCasa() > 14) { j.aviso('Vá até a sua casa no Reino para evoluir o jardim.'); return; }
    if (!this.pagar(c)) return;
    est.jardim.nivel = prox;
    garantirJardim(est);
    j.aviso(`Seu jardim evoluiu para o nível ${prox}: agora cabem ${JARDIM.vagas[prox - 1]} plantas!`);
    j.salvar();
  }

  // Evolui a bandeira (precisa estar perto dela, fincada)
  evoluirBandeira() {
    const est = this.est, j = this.jogo, m = j.mundo, prox = est.bandeiraNivel + 1, c = BANDEIRA.custo[prox];
    if (!c) return;
    if (!m.bandeiraPos || m.distanciaBandeira() > 6) { j.aviso('Vá até a sua bandeira fincada para evoluir.'); return; }
    if (!this.pagar(c)) return;
    est.bandeiraNivel = prox;
    m.trocarModeloBandeira();
    j.aviso(`Sua bandeira evoluiu para o nível ${prox}! ${BANDEIRA.texto[prox]}`);
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
    if (cmd === 'bandeira') { this.fechar(); j.acaoBandeira(); return; }
    if (cmd === 'evoluirCasa') { this.evoluirCasa(); }
    if (cmd === 'evoluirBandeira') { this.evoluirBandeira(); }
    if (cmd === 'usar') {
      const lista = [...est.equipe, ...est.reserva], m = lista[Number(d.i)];
      const txt = m && aplicarPocao(est, d.qual, m);
      if (txt) { j.aviso(txt); j.atualizarHudMundo(); j.salvar(); }
    }
    if (cmd === 'comprar') {
      const n = Number(d.n), custo = this.preco(d.qual) * n;
      if (est.moedas < custo) { j.aviso(`Faltam ${custo - est.moedas} de ouro.`); return; }
      est.moedas -= custo;
      est.pocoes[d.qual] += n;
      j.aviso(`Você comprou ${n} ${n > 1 ? 'Poções' : 'Poção'} de ${d.qual === 'cura' ? 'Cura' : 'Reviver'}.`);
      j.atualizarHudMundo();
      j.salvar();
      this.renderLoja();
      return;
    }
    if (cmd === 'comprarSemente') {
      const S = SEMENTES[d.qual], n = Number(d.n), custo = S.preco * n;
      if (est.moedas < custo) { j.aviso(`Faltam ${custo - est.moedas} de ouro.`); return; }
      est.moedas -= custo;
      est.sementes[d.qual] = (est.sementes[d.qual] || 0) + n;
      j.aviso(`Você comprou ${n} semente${n > 1 ? 's' : ''} de ${S.nome}.`);
      j.atualizarHudMundo(); j.salvar(); this.renderLoja();
      return;
    }
    if (cmd === 'plantar' || cmd === 'colher') {
      if (j.mundo.distanciaCasa() > 14) { j.aviso('O jardim fica na frente da sua casa, no Reino.'); return; }
      const txt = cmd === 'plantar' ? plantar(est, Number(d.i), d.qual) : colher(est, Number(d.i));
      if (txt) { j.aviso(txt); j.salvar(); }
    }
    if (cmd === 'evoluirJardim') this.evoluirJardim();
    if (cmd === 'alimentar') {
      const m = [...est.equipe, ...est.reserva].find((x) => x.uid === d.uid);
      const r = m && alimentar(est, m, d.qual);
      if (r?.texto) {
        const nome = ESPECIES[m.especie].nome;
        j.aviso(`${nome}: ${r.texto}`);
        if (r.subiu) j.aviso(`O afeto de ${nome} subiu para o nível ${afetoDe(m).nivel}!`);
        if (r.coracoes) j.aviso(`Você ganhou ${r.coracoes} Coração${r.coracoes > 1 ? 'ões' : ''} do Guardião!`);
        j.salvar();
      }
    }
    if (cmd === 'fundir') { j.fundir(Number(d.i)); }
    if (cmd === 'chocar') { j.ovo?.chocarAgora(); }
    this.render();
  }

  // ---------- o painel da bolsa ----------
  render() {
    const est = this.est, j = this.jogo, m = j.mundo;
    $('#bolsa-moedas').textContent = est.moedas;
    // botão de evoluir (casa ou bandeira): custo, se está perto e se dá para pagar
    const botaoEvoluir = (cmd, c, nv, perto, longe, max) => c
      ? `<button class="bolsa-btn" type="button" data-bolsa="${cmd}" ${perto && est.galhos >= c.galhos && est.moedas >= c.moedas ? '' : 'disabled'}>Evoluir para o nível ${nv + 1}</button>
        <small>Custa ${c.galhos} Galhos Raros e ${c.moedas} de ouro${perto ? '' : ` (${longe})`}.</small>` : `<small>${max}</small>`;
    const txtBandeira = !m.bandeiraPos ? 'Fincar a bandeira aqui' : m.distanciaBandeira() < 5 ? 'Guardar a bandeira' : 'Mudar a bandeira para cá';
    const nb = est.bandeiraNivel, nv = est.casaNivel;
    const evoluirBandeira = botaoEvoluir('evoluirBandeira', BANDEIRA.custo[nb + 1], nb, m.bandeiraPos && m.distanciaBandeira() <= 6, 'vá até a bandeira fincada', 'Sua bandeira já está no nível máximo.');
    const evoluirCasa = botaoEvoluir('evoluirCasa', CASA.custo[nv + 1], nv, m.distanciaCasa() <= 8, 'vá até a sua casa no Reino', 'Sua casa já está no nível máximo.');
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
      <div class="bolsa-secao"><h3>Bandeira do Reino · nível ${nb}</h3>
        <div class="bolsa-linha"><button class="bolsa-btn" type="button" data-bolsa="bandeira">${txtBandeira}</button><small>${BANDEIRA.texto[nb]}</small></div>
        <div class="bolsa-linha">${evoluirBandeira}</div></div>
      <div class="bolsa-secao"><h3>Casa no Reino · nível ${nv}</h3>
        <div class="bolsa-linha"><small>${CASA.texto[nv]} Ela fica entre a arena e o portão do Reino.</small></div>
        <div class="bolsa-linha"><span class="item"><i class="madeira"></i>Galho Raro ×${est.galhos}</span>${evoluirCasa}</div></div>
      <div class="bolsa-secao"><h3>Itens raros</h3>
        <div class="bolsa-linha"><span class="item"><i class="madeira"></i>Galho Raro ×${est.galhos}</span><span class="item"><i class="asa"></i>Asa do Anjo ×${est.asas}</span><span class="item"><i class="coracao"></i>Coração do Guardião ×${est.coracoes}</span></div>
        <small>Galho Raro e Asa do Anjo: caem por sorte dos chefes das masmorras (o galho cai mais). Coração do Guardião: vem do afeto do seu monstro. A Asa e o Coração servem para a evolução rara (Nv.50).</small></div>
      <div class="bolsa-secao"><h3>Poções</h3>
        <div class="bolsa-linha"><span class="item"><i class="frasco cura"></i>Cura ×${est.pocoes.cura}</span><span class="item"><i class="frasco reviver"></i>Reviver ×${est.pocoes.reviver}</span>
        <small>Compre mais na loja de poções do Reino.</small></div>
        <div class="bolsa-monstros">${fichas}</div></div>
      ${this.htmlJardim()}
      ${this.htmlFrutas()}
      ${j.ovo ? j.ovo.htmlBolsa() : ''}
      <div class="bolsa-secao"><h3>Cristais</h3><div id="bolsa-cristais">${j.htmlCristais().replaceAll('data-cmd="fundir"', 'data-bolsa="fundir"')}</div></div>`;
  }

  // ---------- o jardim (na frente da casa do Reino) ----------
  htmlJardim() {
    const est = this.est, J = est.jardim, perto = this.jogo.mundo.distanciaCasa() <= 14;
    const fases = J.canteiros.map((c) => faseDo(c));
    const cont = (f) => fases.filter((x) => x.fase === f).length;
    const resumo = `${cont('crescendo')} crescendo · ${cont('pronto')} pronta${cont('pronto') === 1 ? '' : 's'} · ${cont('vazio')} vaga${cont('vazio') === 1 ? '' : 's'}${cont('morto') ? ` · ${cont('morto')} morta${cont('morto') > 1 ? 's' : ''}` : ''}`;
    const c = JARDIM.custo[J.nivel + 1];
    const evoluir = c ? `<button class="bolsa-btn" type="button" data-bolsa="evoluirJardim" ${perto && est.galhos >= c.galhos && est.moedas >= c.moedas ? '' : 'disabled'}>Evoluir para o nível ${J.nivel + 1} (${JARDIM.vagas[J.nivel]} vagas)</button>
        <small>Custa ${c.galhos} Galhos Raros e ${c.moedas} de ouro${perto ? '' : ' (vá até a casa)'}.</small>` : '<small>Seu jardim já está no nível máximo.</small>';
    if (!perto) return `<div class="bolsa-secao"><h3>Jardim · nível ${J.nivel} (${J.canteiros.length} vagas)</h3>
        <small>${resumo}. O jardim fica na frente da sua casa no Reino: vá até lá para plantar e colher.</small></div>`;
    const canteiros = J.canteiros.map((cn, i) => {
      const f = fases[i];
      if (f.fase === 'vazio') {
        const opc = ORDEM_SEMENTES.filter((id) => (est.sementes[id] || 0) > 0 && (est.casaNivel || 1) >= SEMENTES[id].casa)
          .map((id) => `<button class="bolsa-btn" type="button" data-bolsa="plantar" data-i="${i}" data-qual="${id}">Plantar ${SEMENTES[id].nome} (${est.sementes[id]})</button>`).join('');
        return `<div class="canteiro"><b>Vaga ${i + 1}</b> <span>vazia</span>${opc || '<small>Sem sementes (compre na loja do Reino).</small>'}</div>`;
      }
      const S = SEMENTES[cn.semente];
      if (f.fase === 'crescendo') return `<div class="canteiro"><b>${S.nome}</b> <span>crescendo: falta ${tempoTexto(f.falta)}</span><i class="xp"><b style="width:${(f.k * 100).toFixed(0)}%"></b></i></div>`;
      if (f.fase === 'pronto') return `<div class="canteiro pronto"><b>${S.nome}</b> <span>pronta! (morre em ${tempoTexto(f.falta)})</span><button class="bolsa-btn" type="button" data-bolsa="colher" data-i="${i}">Colher ${JARDIM.frutasPorColheita}</button></div>`;
      return `<div class="canteiro morto"><b>${S.nome}</b> <span>morreu (não foi colhida a tempo)</span><button class="bolsa-btn" type="button" data-bolsa="colher" data-i="${i}">Limpar</button></div>`;
    }).join('');
    return `<div class="bolsa-secao"><h3>Jardim · nível ${J.nivel}</h3>
        <small>As plantas crescem mesmo com o jogo fechado e morrem 12 horas depois de prontas.</small>
        <div class="canteiros">${canteiros}</div>
        <div class="bolsa-linha">${evoluir}</div></div>`;
  }

  // ---------- frutas e afeto ----------
  htmlFrutas() {
    const est = this.est, lista = [...est.equipe, ...est.reserva];
    const tem = ORDEM_SEMENTES.filter((id) => (est.frutas[id] || 0) > 0);
    const frutas = tem.length ? tem.map((id) => `<span class="item"><i class="fruta" style="--cor:${SEMENTES[id].cor}"></i>${SEMENTES[id].nome} ×${est.frutas[id]}</span>`).join('') : '<small>Nenhuma fruta. Plante no jardim da casa e colha.</small>';
    const fichas = lista.map((m) => {
      const e = ESPECIES[m.especie], A = afetoDe(m), max = A.nivel >= AFETO.max;
      const barra = max ? 100 : (A.pontos / AFETO.pontos(A.nivel)) * 100;
      const estado = A.satisfeito > 0 ? `<small>satisfeito (${tempoTexto(A.satisfeito)})</small>` : `<small>pode comer ${AFETO.porVez - A.comeu}</small>`;
      const botoes = A.satisfeito > 0 ? '' : tem.map((id) => `<button class="bolsa-btn" type="button" data-bolsa="alimentar" data-uid="${m.uid}" data-qual="${id}">Dar ${SEMENTES[id].nome}</button>`).join('');
      return `<div class="bolsa-monstro" style="--cor:${ELEMENTOS[e.elemento].cor}">
        <header>${e.nome} <span>Afeto Nv.${A.nivel}${max ? ' (máx.)' : ''}</span></header>
        <i class="xp"><b style="width:${barra.toFixed(0)}%"></b></i>
        <div class="cmds">${estado}${botoes}</div></div>`;
    }).join('');
    return `<div class="bolsa-secao"><h3>Frutas e afeto</h3>
        <div class="bolsa-linha">${frutas}</div>
        <small>Cada fruta sobe o afeto e tem chance de dar um Coração do Guardião (maior com mais afeto). Ao subir de nível de afeto, vem 1 Coração garantido. Depois de ${AFETO.porVez} frutas, o monstro fica satisfeito por um tempo.</small>
        <div class="bolsa-monstros">${fichas}</div></div>`;
  }

  // ---------- a loja ----------
  renderLoja() {
    const est = this.est;
    $('#loja-moedas').textContent = est.moedas;
    $('#painel-loja h2').firstChild.textContent = 'Loja do Reino ';
    $('#conteudo-loja').innerHTML = Object.entries(POCOES).map(([id, p]) => `
      <div class="loja-item"><i class="frasco ${id}"></i>
        <div><b>${p.nome}</b> <small>(você tem ${est.pocoes[id]})</small><p>${p.texto}</p></div>
        <div class="bolsa-linha"><span class="preco"><i class="moeda"></i>${this.preco(id)}</span>
          <button class="bolsa-btn" type="button" data-bolsa="comprar" data-qual="${id}" data-n="1" ${est.moedas < this.preco(id) ? 'disabled' : ''}>Comprar 1</button>
          <button class="bolsa-btn" type="button" data-bolsa="comprar" data-qual="${id}" data-n="5" ${est.moedas < this.preco(id) * 5 ? 'disabled' : ''}>Comprar 5</button></div>
      </div>`).join('') + `<h3 class="loja-titulo">Sementes</h3>` + ORDEM_SEMENTES.map((id) => {
      const S = SEMENTES[id], pode = (est.casaNivel || 1) >= S.casa;
      return `<div class="loja-item"><i class="fruta" style="--cor:${S.cor}"></i>
        <div><b>${S.nome}</b> <small>(você tem ${est.sementes[id] || 0})</small><p>Cresce em ${tempoTexto(S.tempo)} · cada fruta dá ${S.afeto} de afeto${S.coracao ? ' e mais chance de Coração' : ''} · ${pode ? `casa nível ${S.casa}+` : `<b>precisa da casa nível ${S.casa}</b>`}</p></div>
        <div class="bolsa-linha"><span class="preco"><i class="moeda"></i>${S.preco}</span>
          <button class="bolsa-btn" type="button" data-bolsa="comprarSemente" data-qual="${id}" data-n="1" ${est.moedas < S.preco ? 'disabled' : ''}>Comprar 1</button>
          <button class="bolsa-btn" type="button" data-bolsa="comprarSemente" data-qual="${id}" data-n="5" ${est.moedas < S.preco * 5 ? 'disabled' : ''}>Comprar 5</button></div>
      </div>`;
    }).join('') + '<p class="vazio">Ganhe ouro vencendo monstros, grupos, chefes e os treinadores da arena.</p>';
  }
}
