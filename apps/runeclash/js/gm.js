// =============================================================
// PAINEL GM (administrador para testes)
// Só é carregado quando a conta GM entra (import dinâmico em main.js):
// para as outras contas o jogo não fica nem um pouco mais pesado.
//
// No mapa: botão "GM" no alto abre o painel (o mundo para enquanto ele está aberto).
// Abas: Monstros, Dungeons, Equipe, Mundo e Testes.
// Na batalha: botão "GM" ao lado dos ícones abre uma gaveta do lado direito
// (invencível, recarga zero, captura garantida, inimigos parados, dano ×10,
// encher a vida e vencer agora). Fecha ao tocar fora dela.
//
// Ganchos no resto do jogo (todos só funcionam com o GM ligado):
//  - batalha.js: jogo.gm.invencivel / recargaZero / capturaGarantida / parados / dano
//  - mundo.js: jogo.gm.vel, jogo.gm.invisivel, jogo.gm.relogioParado
//  - main.js: gm.quadro(dt), gm.depoisDaBatalha(b), gm.fecharPainel()
// =============================================================
import {
  ESPECIES, ELEMENTOS, ORDEM_ELEMENTOS, ORDEM_DUPLAS, RAROS, NOMES_ESTAGIO, ARENAS, DUNGEONS, CRISTAIS,
  formasDaLinha, formaPorNivel, criarMonstro, statsDe, xpParaProximo, niveisDaEtapa, nivelDoChefe, nomeDupla, nomeTipo, verificarEvolucao,
} from './dados.js';
import { criarModelo, criarCoroa, criarAuraDupla } from './modelos.js';
import { zonaEm, NOMES_ZONA } from './mundo.js';
import { SEMENTE, SEMENTE_PADRAO, centroDe, LAGOS, POIS } from './mapa/gerador.js';

const MAX_NIVEL = 50;
const MAX_EQUIPE = 3;
const TAMANHO_GRUPO = 6; // 5 comuns + 1 líder

// Lugares do teleporte (o centro de cada bioma vem da semente do mapa; o jogo procura um ponto livre perto)
const arco = POIS.find((p) => p.tipo === 'arco'); // o Deserto: ao lado do arco de pedra
const lagoGrande = LAGOS.find((L) => L.tipo === 'agua' && !L.escondido && L.bioma === 'planta') || LAGOS[0];
const perto = (c, d = 0) => { const a = Math.atan2(c.z, c.x); return [c.x - Math.cos(a) * d, c.z - Math.sin(a) * d]; };
const LUGARES = [
  ['fonte', 'Fonte', 0, 4.5], ['campo', 'Campo', 16, 16], ['planta', 'Floresta', ...perto(centroDe('planta'))],
  ['agua', 'Lago', ...perto(lagoGrande, -(lagoGrande.r + 4))],
  ['fogo', 'Vulcão', ...perto(centroDe('fogo'), 16)], ['terra', 'Deserto', ...(arco ? [arco.x + Math.cos(arco.ang + 1.57) * 7, arco.z + Math.sin(arco.ang + 1.57) * 7] : perto(centroDe('terra')))],
  ['raio', 'Neve', ...perto(centroDe('raio'))],
];
// ruínas rúnicas (5.2): na frente do primeiro círculo de pedra e do primeiro altar de selo
for (const [tipo, k, nome] of [['circulo', 'ruina', 'Ruína'], ['altar', 'altar', 'Altar']]) {
  const p = POIS.find((q) => q.tipo === tipo);
  if (p) LUGARES.push([k, nome, p.x + Math.cos(p.ang) * (p.r + 3), p.z + Math.sin(p.ang) * (p.r + 3)]);
}
// Arenas que dá para escolher no "Lutar agora"
const NOMES_ARENA = Object.fromEntries(Object.entries(ARENAS).map(([k, a]) => [k, a.nome]));

const CSS = `
  .btn-gm { border: 2px solid #ff5fd2 !important; color: #ffb3ee; font-family: var(--f-titulo); font-weight: 700 !important; letter-spacing: .04em; }
  .btn-icone.btn-gm { font-size: .8rem; }
  #painel-gm { position: absolute; inset: 0; background: rgba(10, 18, 34, 0.78); display: flex; justify-content: center; align-items: flex-start; overflow-y: auto;
    touch-action: pan-y; z-index: 15; padding-block: 12px; padding-left: max(12px, env(safe-area-inset-left, 0px)); padding-right: max(12px, env(safe-area-inset-right, 0px)); }
  .gm-caixa { width: min(760px, 100%); background: var(--noite); border: 2px solid #ff5fd2; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
  .gm-cab { display: flex; align-items: center; gap: 8px; }
  .gm-cab h2 { margin: 0; font-family: var(--f-titulo); font-weight: 600; font-size: 1.2rem; color: #ffb3ee; }
  .gm-cab .btn-hud { margin-left: auto; }
  .gm-abas { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; touch-action: pan-x; flex: none; }
  .gm-abas::-webkit-scrollbar { display: none; }
  .gm-abas button { flex: none; border: 2px solid transparent; border-radius: 999px; padding: 5px 14px; background: var(--painel); font-family: var(--f-titulo); font-weight: 600; font-size: .95rem; }
  .gm-abas button.ativa { border-color: #ff5fd2; background: #3a2350; }
  .gm-bloco { background: var(--painel); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
  .gm-bloco h3 { margin: 0; font-size: .8rem; font-weight: 800; color: var(--creme-suave); text-transform: uppercase; letter-spacing: .06em; }
  .gm-linha { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .gm-linha > small { font-weight: 800; color: var(--creme-suave); }
  .gm-linha select, .gm-linha input { padding: 8px 10px; border-radius: 10px; border: 2px solid var(--painel-borda); background: rgba(5,12,26,.6); color: var(--creme);
    font: 700 .9rem var(--f-corpo); user-select: text; -webkit-user-select: text; }
  .gm-linha select { flex: 1; min-width: 170px; }
  .gm-nivel { display: inline-flex; align-items: center; gap: 4px; }
  .gm-nivel input { width: 56px; text-align: center; }
  .gm-nivel button, .gm-btn { border: 0; border-radius: 10px; padding: 8px 12px; background: #2a4a7a; font-weight: 800; font-size: .82rem; }
  .gm-btn.forte { background: #8a2c74; }
  .gm-btn.verde, .gm-btn.sim { background: #2f8a4f; }
  .gm-btn:active, .gm-nivel button:active { transform: scale(.95); }
  .gm-dica { margin: 0; font-size: .7rem; color: var(--creme-suave); }
  .gm-grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; }
  .gm-info { font-size: .78rem; font-weight: 700; color: var(--creme); }
  .gm-info b { color: var(--sol); }
  /* na batalha: o botão GM fica embaixo da fileira de ícones (do lado direito) e a gaveta abre ao lado dele */
  #gm-btn-batalha { --tam: clamp(40px, 8.5vmin, 52px); position: absolute; top: calc(max(10px, env(safe-area-inset-top, 0px)) + var(--tam) + 8px);
    right: max(10px, env(safe-area-inset-right, 0px)); }
  #gm-gaveta { --tam: clamp(40px, 8.5vmin, 52px); position: absolute; top: calc(max(10px, env(safe-area-inset-top, 0px)) + var(--tam) + 8px);
    right: calc(max(10px, env(safe-area-inset-right, 0px)) + var(--tam) + 8px);
    display: grid; grid-template-columns: 1fr; gap: 5px; padding: 8px; border-radius: 12px; background: var(--painel); border: 2px solid #ff5fd2; pointer-events: auto; width: 172px; z-index: 5; }
  #gm-gaveta b { font-family: var(--f-titulo); color: #ffb3ee; font-size: .85rem; grid-column: 1 / -1; }
  @media (orientation: landscape) and (max-height: 500px) { #gm-gaveta { grid-template-columns: 1fr 1fr; width: 320px; } }
  #gm-gaveta button { border: 0; border-radius: 8px; padding: 6px 8px; background: #2a4a7a; font-weight: 800; font-size: .74rem; text-align: left; }
  #gm-gaveta button.sim { background: #2f8a4f; }
  #gm-gaveta button.forte { background: #8a2c74; }
  #gm-fps { position: absolute; left: 50%; bottom: max(4px, env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); padding: 2px 8px; border-radius: 999px;
    background: rgba(5, 12, 26, .75); border: 1px solid #ff5fd2; font: 800 .7rem var(--f-corpo); color: #ffb3ee; pointer-events: none; z-index: 30; font-variant-numeric: tabular-nums; }
`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class PainelGM {
  constructor(jogo) {
    this.jogo = jogo;
    // chaves dos testes (lidas pela batalha e pelo mundo)
    this.invencivel = false;
    this.recargaZero = false;
    this.capturaGarantida = false;
    this.parados = false;
    this.dano = 1;
    this.vel = 1;
    this.invisivel = false;
    this.relogioParado = false;
    this.fps = false;
    this.aba = 'monstros';
    this.temporarios = new Set(); // monstros criados só para uma luta ("Lutar agora")
    this.fpsConta = { n: 0, t: 0 };

    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    // botão GM no mapa (antes de "Monstros") e na batalha (antes do cristal)
    const app = jogo.app;
    this.btnMapa = document.createElement('button');
    this.btnMapa.className = 'btn-hud btn-gm';
    this.btnMapa.type = 'button';
    this.btnMapa.textContent = 'GM';
    this.btnMapa.title = 'Painel GM';
    app.querySelector('#btn-monstros').before(this.btnMapa);
    this.btnMapa.addEventListener('click', () => this.abrirPainel());

    this.btnBatalha = document.createElement('button');
    this.btnBatalha.className = 'btn-icone btn-gm';
    this.btnBatalha.id = 'gm-btn-batalha';
    this.btnBatalha.type = 'button';
    this.btnBatalha.textContent = 'GM';
    this.btnBatalha.title = 'GM na batalha';
    app.querySelector('#hud-batalha').appendChild(this.btnBatalha);
    this.btnBatalha.addEventListener('click', () => this.alternarGaveta());

    // painel do mapa
    this.painel = document.createElement('div');
    this.painel.id = 'painel-gm';
    this.painel.hidden = true;
    app.querySelector('#avisos').before(this.painel);
    this.painel.addEventListener('click', (e) => this.clique(e));
    this.painel.addEventListener('change', (e) => this.mudou(e));

    // gaveta da batalha
    this.gaveta = document.createElement('div');
    this.gaveta.id = 'gm-gaveta';
    this.gaveta.hidden = true;
    app.querySelector('#hud-batalha').appendChild(this.gaveta);
    this.gaveta.addEventListener('click', (e) => this.clique(e));
    // fecha a gaveta ao tocar fora dela (menos no próprio botão GM)
    document.addEventListener('pointerdown', (e) => {
      if (this.gaveta.hidden || this.gaveta.contains(e.target) || this.btnBatalha.contains(e.target)) return;
      this.gaveta.hidden = true;
    });

    this.elFps = document.createElement('div');
    this.elFps.id = 'gm-fps';
    this.elFps.hidden = true;
    app.appendChild(this.elFps);

    // valores escolhidos nos campos (guardados para o painel abrir igual)
    this.sel = { especie: 'magmalobo', nivel: 30, arena: 'auto', alvo: 0, nivelAlvo: 30, nivelChefe: 0 };
  }

  // Tira os botões e o painel da tela (ao sair da conta GM)
  destruir() {
    for (const el of [this.btnMapa, this.btnBatalha, this.painel, this.gaveta, this.elFps]) el.remove();
  }

  get mundo() { return this.jogo.mundo; }
  get estado() { return this.jogo.estado; }

  // ---------- painel ----------
  abrirPainel(aba) {
    if (this.jogo.modo !== 'mundo') return;
    if (aba) this.aba = aba;
    this.jogo.fecharEquipe();
    this.jogo.painelAberto = true; // o mundo para enquanto o painel está aberto
    this.painel.hidden = false;
    this.renderizar();
    this.painel.scrollTop = 0;
  }

  fecharPainel() {
    if (this.painel.hidden) return false;
    this.painel.hidden = true;
    this.jogo.painelAberto = false;
    // se alguma ação do painel fez um monstro evoluir, mostra a animação agora
    if (this.jogo.filaEvo.length && this.jogo.modo === 'mundo') this.jogo.proximaEvolucao();
    return true;
  }

  aberto() { return !this.painel.hidden; }

  // a gaveta da batalha começa sempre fechada
  aoMudarTela() { this.gaveta.hidden = true; }

  renderizar() {
    const abas = [['monstros', 'Monstros'], ['dungeons', 'Dungeons'], ['equipe', 'Equipe'], ['mundo', 'Mundo'], ['testes', 'Testes']];
    const conteudo = { monstros: () => this.abaMonstros(), dungeons: () => this.abaDungeons(), equipe: () => this.abaEquipe(), mundo: () => this.abaMundo(), testes: () => this.abaTestes() }[this.aba]();
    this.painel.innerHTML = `<div class="gm-caixa">
      <div class="gm-cab"><h2>Painel GM</h2><span class="tag" style="--cor:#ff5fd2">conta GM</span><button class="btn-hud" type="button" data-gm="fechar">Fechar</button></div>
      <nav class="gm-abas">${abas.map(([k, n]) => `<button type="button" data-gm-aba="${k}" class="${k === this.aba ? 'ativa' : ''}">${n}</button>`).join('')}</nav>
      ${conteudo}
    </div>`;
  }

  // Lista de todas as espécies, separadas por linha
  opcoesEspecies(escolhida) {
    const op = (id) => {
      const e = ESPECIES[id];
      const etapa = e.chefe ? 'chefe' : e.raro ? 'raro' : NOMES_ESTAGIO[e.estagio].toLowerCase();
      return `<option value="${id}" ${id === escolhida ? 'selected' : ''}>${esc(e.nome)} (${etapa})</option>`;
    };
    const grupos = [
      ...ORDEM_ELEMENTOS.map((el) => [ELEMENTOS[el].nome, formasDaLinha(el)]),
      ...ORDEM_DUPLAS.map((k) => [nomeDupla(k) + ' (tipo duplo)', formasDaLinha(k)]),
      ['Raros e chefes', RAROS],
    ];
    return grupos.map(([nome, ids]) => `<optgroup label="${esc(nome)}">${ids.map(op).join('')}</optgroup>`).join('');
  }

  campoNivel(nome, valor) {
    return `<span class="gm-nivel"><button type="button" data-gm="menos" data-campo="${nome}">−</button><input type="number" inputmode="numeric" min="1" max="${MAX_NIVEL}" data-campo="${nome}" value="${valor}"><button type="button" data-gm="mais" data-campo="${nome}">+</button></span>`;
  }

  abaMonstros() {
    const s = this.sel;
    const arenas = `<option value="auto" ${s.arena === 'auto' ? 'selected' : ''}>Da região onde estou</option>` +
      Object.entries(NOMES_ARENA).map(([k, n]) => `<option value="${k}" ${s.arena === k ? 'selected' : ''}>${esc(n)}</option>`).join('');
    return `
      <div class="gm-bloco">
        <h3>Fazer um monstro aparecer</h3>
        <div class="gm-linha"><select data-campo="especie">${this.opcoesEspecies(s.especie)}</select>${this.campoNivel('nivel', s.nivel)}</div>
        <div class="gm-linha">
          <button class="gm-btn" type="button" data-gm="aparecer">Aparecer perto</button>
          <button class="gm-btn forte" type="button" data-gm="lutar">Lutar agora</button>
          <button class="gm-btn" type="button" data-gm="grupo">Grupo (5 + líder)</button>
          <button class="gm-btn forte" type="button" data-gm="lutarGrupo">Lutar com grupo</button>
          <button class="gm-btn verde" type="button" data-gm="dar">Dar para mim</button>
        </div>
        <div class="gm-linha"><small>Arena do "Lutar agora":</small><select data-campo="arena" style="flex:0 1 auto">${arenas}</select></div>
        <p class="gm-dica">Todas as ${Object.keys(ESPECIES).length} espécies: as 9 linhas, os tipos duplos, os raros e os chefes. "Aparecer perto" e "Grupo" põem o monstro no mapa, 8 m na sua frente (ele vem atrás de você). "Lutar agora" já começa a batalha.</p>
      </div>
      <div class="gm-bloco">
        <h3>Rápido</h3>
        <div class="gm-grade">
          <button class="gm-btn" type="button" data-gm="selvagemAleatorio">Selvagem aleatório</button>
          <button class="gm-btn" type="button" data-gm="duploAleatorio">Tipo duplo aleatório</button>
          <button class="gm-btn" type="button" data-gm="grupoAleatorio">Grupo aleatório</button>
          <button class="gm-btn forte" type="button" data-gm="limpar">Limpar monstros do mapa</button>
        </div>
      </div>`;
  }

  abaDungeons() {
    const media = this.mundo.mediaEquipe();
    const nvChefe = this.sel.nivelChefe || nivelDoChefe(media);
    return Object.entries(DUNGEONS).map(([id, cfg]) => {
      const etapas = cfg.etapas.map((e, i) => {
        const nv = niveisDaEtapa(media, i, id);
        return `<button class="gm-btn forte" type="button" data-gm="acampamento" data-dg="${id}" data-etapa="${i}">Etapa ${i + 1} · Nv.${nv.comum}/${nv.lider}</button>`;
      }).join('');
      const irEtapas = cfg.etapas.map((_, i) => `<button class="gm-btn" type="button" data-gm="irDungeon" data-dg="${id}" data-onde="${i}">Etapa ${i + 1}</button>`).join('');
      const chefe = ESPECIES[cfg.chefe];
      return `<div class="gm-bloco">
        <h3>${esc(cfg.nome)} (${esc(cfg.regiao)})</h3>
        <div class="gm-linha"><small>Ir para:</small><button class="gm-btn" type="button" data-gm="irDungeon" data-dg="${id}" data-onde="entrada">Entrada</button>${irEtapas}<button class="gm-btn" type="button" data-gm="irDungeon" data-dg="${id}" data-onde="chefe">${esc(chefe.nome)}</button></div>
        <div class="gm-linha"><small>Lutar contra o acampamento:</small></div>
        <div class="gm-grade">${etapas}</div>
        <div class="gm-linha">
          <button class="gm-btn forte" type="button" data-gm="chefeAgora" data-dg="${id}">Lutar com ${esc(chefe.nome)} Nv.${nvChefe}</button>
          <button class="gm-btn" type="button" data-gm="chefeVolta" data-dg="${id}">${esc(chefe.nome)} volta já</button>
          <button class="gm-btn" type="button" data-gm="soltoDungeon" data-dg="${id}">Monstro da dungeon perto</button>
        </div>
      </div>`;
    }).join('') + `<div class="gm-bloco"><h3>Nível do chefe</h3><div class="gm-linha">${this.campoNivel('nivelChefe', nvChefe)}<small>(normal para a sua equipe: Nv.${nivelDoChefe(media)})</small></div>
      <p class="gm-dica">Os níveis dos acampamentos acompanham a sua equipe (comuns/líder). A luta vem na ordem 2 fracos → 2 médios → 1 forte → líder, como no jogo.</p></div>`;
  }

  todosMonstros() {
    const est = this.estado;
    return [...est.equipe.map((m) => [m, 'Equipe']), ...est.reserva.map((m) => [m, 'Reserva'])];
  }

  abaEquipe() {
    const lista = this.todosMonstros();
    if (this.sel.alvo >= lista.length) this.sel.alvo = 0;
    const [m, onde] = lista[this.sel.alvo];
    const e = ESPECIES[m.especie], s = statsDe(m.especie, m.nivel);
    const opcoes = lista.map(([x, o], i) => `<option value="${i}" ${i === this.sel.alvo ? 'selected' : ''}>${esc(ESPECIES[x.especie].nome)} Nv.${x.nivel} (${o})</option>`).join('');
    const anterior = Object.keys(ESPECIES).find((id) => ESPECIES[id].evoluiPara === m.especie);
    const evo = e.evoluiPara ? `evolui no Nv.${e.nivelEvolucao} para ${esc(ESPECIES[e.evoluiPara].nome)}` : 'forma final';
    const p = this.estado.pedras;
    return `
      <div class="gm-bloco">
        <h3>Monstro alvo</h3>
        <div class="gm-linha"><select data-campo="alvo">${opcoes}</select></div>
        <p class="gm-info">${esc(e.nome)} <b>Nv.${m.nivel}</b> · ${esc(nomeTipo(e))} · vida ${m.hp}/${s.hpMax} · exp. ${m.xp}/${xpParaProximo(m.nivel)} · ${evo}</p>
        <h3>Adicionar XP</h3>
        <div class="gm-linha">
          <button class="gm-btn" type="button" data-gm="xp" data-qtd="50">+50 XP</button>
          <button class="gm-btn" type="button" data-gm="xp" data-qtd="500">+500 XP</button>
          <button class="gm-btn" type="button" data-gm="xpNivel">+1 nível</button>
        </div>
        <div class="gm-linha"><small>Até o nível:</small>${this.campoNivel('nivelAlvo', this.sel.nivelAlvo)}<button class="gm-btn verde" type="button" data-gm="xpAte">Subir até lá</button></div>
        <p class="gm-dica">A XP sobe como no jogo: se chegar no nível de evolução, ele evolui (a animação aparece quando você fecha o painel).</p>
        <h3>Forma</h3>
        <div class="gm-linha">
          <button class="gm-btn verde" type="button" data-gm="evoluir" ${e.evoluiPara ? '' : 'disabled'}>Evoluir agora</button>
          <button class="gm-btn" type="button" data-gm="voltarForma" ${anterior ? '' : 'disabled'}>Voltar uma forma</button>
          <button class="gm-btn" type="button" data-gm="curarAlvo">Curar</button>
          <button class="gm-btn forte" type="button" data-gm="pularNivel">Mudar para o Nv. acima (sem evoluir)</button>
        </div>
      </div>
      <div class="gm-bloco">
        <h3>Equipe e pedras</h3>
        <div class="gm-linha"><button class="gm-btn verde" type="button" data-gm="curarTodos">Curar todos</button></div>
        <p class="gm-info">Pedras: ${CRISTAIS.map((c) => `${c.nome} <b>${p[c.id]}</b>`).join(' · ')}</p>
        <div class="gm-linha">
          <button class="gm-btn" type="button" data-gm="cristais" data-qtd="10">+10 de cada</button>
          <button class="gm-btn" type="button" data-gm="cristais" data-qtd="99">99 de cada</button>
          <button class="gm-btn" type="button" data-gm="cristais" data-qtd="0">Zerar</button>
        </div>
      </div>
      ${this.blocoCopiar()}`;
  }

  // Copiar o jogo de uma conta deste aparelho para o GM (o jogo atual do GM é trocado pela cópia)
  blocoCopiar() {
    const contas = this.jogo.contasDoAparelho?.() || [];
    if (!contas.length) return '';
    return `<div class="gm-bloco">
      <h3>Copiar jogo de outra conta</h3>
      <div class="gm-linha"><select data-campo="copiarDe">${contas.map((c) => `<option value="${esc(c.id)}">${esc(c.nome)}${c.resumo ? ' · ' + esc(c.resumo) : ''}</option>`).join('')}</select>
        <button class="gm-btn forte" type="button" data-gm="copiar">Copiar para o GM</button></div>
      <p class="gm-dica">Usa a cópia que está neste aparelho. O jogo atual do GM é trocado pela cópia, e a conta original não muda (o GM nunca grava nela).</p>
    </div>`;
  }

  abaMundo() {
    const m = this.mundo, noite = m.periodo === 'noite';
    const casa = m.casaPos ? `<button class="gm-btn" type="button" data-gm="ir" data-onde="casa">Casa</button>` : '';
    const vel = [1, 2, 3].map((v) => `<button class="gm-btn ${this.vel === v ? 'sim' : ''}" type="button" data-gm="vel" data-v="${v}">×${v}</button>`).join('');
    return `
      <div class="gm-bloco">
        <h3>Hora (agora: ${noite ? 'noite' : 'dia'})</h3>
        <div class="gm-linha">
          <button class="gm-btn" type="button" data-gm="hora" data-h="0.08">Amanhecer</button>
          <button class="gm-btn" type="button" data-gm="hora" data-h="0.25">Meio-dia</button>
          <button class="gm-btn" type="button" data-gm="hora" data-h="0.56">Anoitecer</button>
          <button class="gm-btn" type="button" data-gm="hora" data-h="0.75">Meia-noite</button>
          ${this.botaoChave('relogioParado', 'Parar o relógio')}
        </div>
      </div>
      <div class="gm-bloco">
        <h3>Teleporte</h3>
        <div class="gm-grade">${LUGARES.map(([k, n]) => `<button class="gm-btn" type="button" data-gm="ir" data-onde="${k}">${n}</button>`).join('')}${casa}</div>
        <p class="gm-dica">As dungeons e os chefes ficam na aba Dungeons.</p>
      </div>
      <div class="gm-bloco">
        <h3>Andar</h3>
        <div class="gm-linha"><small>Velocidade:</small>${vel}${this.botaoChave('invisivel', 'Invisível (não te perseguem)')}</div>
        <p class="gm-dica">Invisível: os monstros não vêm atrás de você, mas encostar neles ainda começa a batalha.</p>
      </div>
      <div class="gm-bloco">
        <h3>Celular</h3>
        <div class="gm-linha">${this.botaoChave('fps', 'Mostrar FPS')}</div>
        <p class="gm-dica">FPS = quadros por segundo. 50 a 60 é liso; abaixo de 30 o jogo começa a "travar".</p>
        ${this.infoMapa()}
      </div>
      <div class="gm-bloco">
        <h3>Mapa (semente ${SEMENTE}${SEMENTE === SEMENTE_PADRAO ? ', a de todos' : ', só neste teste'})</h3>
        <div class="gm-linha"><input type="number" data-campo-livre="semente" value="${SEMENTE}" min="1" max="999999999" style="width:9em">
          <button class="gm-btn" type="button" data-gm="semente">Ver esta semente</button>
          <button class="gm-btn" type="button" data-gm="sementeAleatoria">Semente aleatória</button>
          <button class="gm-btn" type="button" data-gm="sementePadrao">Voltar à de todos</button></div>
        <p class="gm-dica">Trocar a semente recarrega o jogo com outro mapa, só neste aparelho e só até fechar. Com outra semente, você acorda na fonte e a casa volta para a mochila. Os jogadores sempre usam a semente ${SEMENTE_PADRAO}.</p>
      </div>`;
  }

  // Números do mapa: chunks carregados e quanto o celular desenha por quadro
  infoMapa() {
    const i = this.mundo.chunks.info(), r = this.jogo.renderer.info.render;
    return `<p class="gm-dica">Mapa: ${i.chunks} chunks (qualidade ${i.qualidade}), ${i.instancias} objetos, ${i.obstaculos} obstáculos.
      Último quadro: ${r.calls} desenhos, ${Math.round(r.triangles / 1000)} mil triângulos. Cada chunk leva ${i.msMedio} ms para ser criado (máx. ${i.msMax} ms).</p>`;
  }

  // Recarrega a página com outra semente (só para testes do GM)
  trocarSemente(n) {
    this.jogo.salvar();
    const u = new URL(location.href);
    if (n === SEMENTE_PADRAO) u.searchParams.delete('semente'); else u.searchParams.set('semente', String(n));
    location.href = u.toString();
  }

  botaoChave(chave, nome) {
    return `<button class="gm-btn ${this[chave] ? 'sim' : ''}" type="button" data-gm="chave" data-chave="${chave}">${this[chave] ? '✓ ' : ''}${nome}</button>`;
  }

  abaTestes() {
    return `
      <div class="gm-bloco">
        <h3>Batalha</h3>
        <div class="gm-grade">
          ${this.botaoChave('invencivel', 'Invencível')}
          ${this.botaoChave('recargaZero', 'Recarga zero')}
          ${this.botaoChave('capturaGarantida', 'Selamento garantido')}
          ${this.botaoChave('parados', 'Inimigos parados')}
          <button class="gm-btn ${this.dano > 1 ? 'sim' : ''}" type="button" data-gm="dano">${this.dano > 1 ? '✓ ' : ''}Dano ×10</button>
        </div>
        <p class="gm-dica">Valem até você desligar (também dá para mudar na gaveta do botão GM, durante a batalha). Selamento garantido: qualquer pedra sela qualquer monstro, até os chefes. Invencível: sua vida não desce, nem com os efeitos e os perigos da arena.</p>
      </div>`;
  }

  // Gaveta da batalha: só as chaves e duas ações
  renderizarGaveta() {
    const ch = (chave, nome) => `<button type="button" class="${this[chave] ? 'sim' : ''}" data-gm="chave" data-chave="${chave}">${this[chave] ? '✓ ' : ''}${nome}</button>`;
    this.gaveta.innerHTML = `<b>GM</b>${ch('invencivel', 'Invencível')}${ch('recargaZero', 'Recarga zero')}${ch('capturaGarantida', 'Selamento garantido')}${ch('parados', 'Inimigos parados')}
      <button type="button" class="${this.dano > 1 ? 'sim' : ''}" data-gm="dano">${this.dano > 1 ? '✓ ' : ''}Dano ×10</button>
      <button type="button" data-gm="encher">Encher minha vida</button><button type="button" class="forte" data-gm="vencer">Vencer agora</button>`;
  }

  alternarGaveta() {
    this.gaveta.hidden = !this.gaveta.hidden;
    if (!this.gaveta.hidden) this.renderizarGaveta();
  }

  // ---------- campos ----------
  mudou(e) {
    const c = e.target.dataset.campo;
    if (!c || e.target.tagName === 'BUTTON') return;
    if (c === 'especie' || c === 'arena' || c === 'copiarDe') this.sel[c] = e.target.value;
    else if (c === 'alvo') { this.sel.alvo = Number(e.target.value); this.renderizar(); }
    else this.sel[c] = this.limitarNivel(e.target.value);
  }

  limitarNivel(v) { return Math.min(MAX_NIVEL, Math.max(1, Math.round(Number(v) || 1))); }

  lerCampos() {
    for (const el of this.painel.querySelectorAll('input[data-campo], select[data-campo]')) {
      const c = el.dataset.campo;
      if (c === 'especie' || c === 'arena' || c === 'copiarDe') this.sel[c] = el.value;
      else if (c === 'alvo') this.sel.alvo = Number(el.value);
      else this.sel[c] = this.limitarNivel(el.value);
    }
  }

  // ---------- ações ----------
  clique(e) {
    const aba = e.target.closest('[data-gm-aba]');
    if (aba) { this.lerCampos(); this.aba = aba.dataset.gmAba; this.renderizar(); return; }
    const b = e.target.closest('[data-gm]');
    if (!b || b.disabled) return;
    if (this.painel.contains(b)) this.lerCampos();
    const acao = b.dataset.gm, d = b.dataset;
    const naGaveta = this.gaveta.contains(b);
    switch (acao) {
      case 'fechar': this.fecharPainel(); return;
      case 'menos': case 'mais': {
        const inp = this.painel.querySelector(`input[data-campo="${d.campo}"]`);
        inp.value = this.limitarNivel(Number(inp.value) + (acao === 'mais' ? 1 : -1));
        this.sel[d.campo] = Number(inp.value);
        if (d.campo === 'nivelChefe') this.renderizar(); // os botões mostram o nível
        return;
      }
      case 'aparecer': this.aparecer(this.sel.especie, this.sel.nivel); break;
      case 'lutar': this.lutar(this.sel.especie, this.sel.nivel); return;
      case 'grupo': this.grupo(this.sel.especie, this.sel.nivel, false); break;
      case 'lutarGrupo': this.grupo(this.sel.especie, this.sel.nivel, true); return;
      case 'dar': this.dar(this.sel.especie, this.sel.nivel); break;
      case 'selvagemAleatorio': this.mundo.spawnarSelvagem(true); this.jogo.aviso('GM: um selvagem apareceu perto de você.'); break;
      case 'duploAleatorio': this.duploAleatorio(); break;
      case 'grupoAleatorio': this.grupoAleatorio(); break;
      case 'limpar': this.limpar(); break;
      case 'irDungeon': this.irDungeon(d.dg, d.onde); this.fecharPainel(); return;
      case 'semente': { const n = Math.round(Number(this.painel.querySelector('[data-campo-livre="semente"]').value)); if (n >= 1 && n <= 999999999) this.trocarSemente(n); return; }
      case 'sementeAleatoria': this.trocarSemente(1 + Math.floor(Math.random() * 999999998)); return;
      case 'sementePadrao': this.trocarSemente(SEMENTE_PADRAO); return;
      case 'acampamento': this.acampamento(d.dg, Number(d.etapa)); return;
      case 'chefeAgora': this.chefeAgora(d.dg); return;
      case 'chefeVolta': this.chefeVolta(d.dg); break;
      case 'soltoDungeon': this.soltoDungeon(d.dg); break;
      case 'xp': this.darXp(Number(d.qtd)); break;
      case 'xpNivel': { const m = this.alvo(); this.darXp(xpParaProximo(m.nivel) - m.xp); break; }
      case 'xpAte': this.xpAte(this.sel.nivelAlvo); break;
      case 'evoluir': this.evoluir(); break;
      case 'voltarForma': this.voltarForma(); break;
      case 'pularNivel': this.pularNivel(); break;
      case 'curarAlvo': { const m = this.alvo(); m.hp = statsDe(m.especie, m.nivel).hpMax; this.salvar(); break; }
      case 'curarTodos': this.jogo.curarEquipe(); this.jogo.aviso('GM: todos curados.'); break;
      case 'cristais': this.cristais(Number(d.qtd)); break;
      case 'copiar': {
        const conta = this.jogo.contasDoAparelho().find((c) => c.id === this.sel.copiarDe);
        if (conta && this.jogo.copiarJogoParaGM(conta.id)) this.jogo.aviso(`GM: jogo de ${conta.nome} copiado. Toque em Continuar.`);
        else this.jogo.aviso('GM: essa conta ainda não tem jogo salvo neste aparelho.');
        return;
      }
      case 'hora': this.mundo.hora = Number(d.h); this.mundo.atualizarCeu(0); break;
      case 'ir': this.ir(d.onde); this.fecharPainel(); return;
      case 'vel': this.vel = Number(d.v); break;
      case 'chave': this[d.chave] = !this[d.chave]; if (d.chave === 'fps') this.elFps.hidden = !this.fps; break;
      case 'dano': this.dano = this.dano > 1 ? 1 : 10; break;
      case 'encher': this.encher(); break;
      case 'vencer': this.vencer(); this.gaveta.hidden = true; return;
    }
    if (naGaveta) this.renderizarGaveta();
    else if (!this.painel.hidden) this.renderizar();
  }

  // ponto livre 8 m na frente do jogador (ou o mais perto disso)
  pontoNaFrente(dist = 8) {
    const m = this.mundo;
    for (let k = 0; k < 12; k++) {
      const a = m.ang + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.5;
      const p = { x: m.pos.x + Math.sin(a) * dist, z: m.pos.z + Math.cos(a) * dist };
      const antes = { ...p };
      m.colidir(p, 1);
      if (Math.hypot(p.x - antes.x, p.z - antes.z) < 0.5) return p;
    }
    const p = { x: m.pos.x + Math.sin(m.ang) * dist, z: m.pos.z + Math.cos(m.ang) * dist };
    m.colidir(p, 1);
    return p;
  }

  // Monstro selvagem no mapa (o mesmo formato do mundo.js)
  criarSelvagem(especie, nivel, p, extra = {}) {
    const m = this.mundo, esp = ESPECIES[especie];
    const dados = criarMonstro(especie, nivel);
    const modelo = criarModelo(especie);
    let aura = null;
    if (esp.dupla) { aura = criarAuraDupla(esp.elementos.map((el) => ELEMENTOS[el].cor), esp.raio * 1.5); modelo.add(aura); }
    modelo.position.set(p.x, m.jogador.position.y, p.z);
    m.cena.add(modelo);
    const s = { dados, modelo, aura, dupla: !!esp.dupla, x: p.x, z: p.z, ang: Math.random() * 6.28, estado: 'parado', t: 2, zona: zonaEm(p.x, p.z), periodo: null,
      vel: statsDe(especie, nivel).vel * 0.45, gm: true, ...extra };
    if (esp.chefe) { s.chefe = true; s.fixo = true; s.zona = esp.elemento === 'igneo' ? 'cratera' : 'santuario'; }
    m.selvagens.push(s);
    return s;
  }

  aparecer(especie, nivel) {
    this.criarSelvagem(especie, nivel, this.pontoNaFrente());
    this.mundo.graca = 1.5;
    this.jogo.aviso(`GM: ${ESPECIES[especie].nome} Nv.${nivel} apareceu na sua frente.`);
  }

  zonaDaLuta(especie) {
    if (this.sel.arena !== 'auto') return this.sel.arena;
    const esp = ESPECIES[especie];
    if (esp?.chefe) return esp.elemento === 'igneo' ? 'cratera' : 'santuario';
    return zonaEm(this.mundo.pos.x, this.mundo.pos.z);
  }

  podeLutar() {
    if (this.jogo.modo !== 'mundo') return false;
    if (!this.jogo.temMonstroDePe()) { this.jogo.aviso('GM: sua equipe está desmaiada. Use "Curar todos" na aba Equipe.'); return false; }
    return true;
  }

  lutar(especie, nivel) {
    if (!this.podeLutar()) return;
    const s = this.criarSelvagem(especie, nivel, this.pontoNaFrente(30), { zona: this.zonaDaLuta(especie) });
    s.modelo.visible = false; // só existe para a luta
    this.temporarios.add(s);
    this.fecharPainel();
    this.jogo.iniciarBatalha(s);
  }

  // Grupo de 6 da espécie escolhida: 5 no nível escolhido e o líder 1,3× maior
  grupo(especie, nivel, lutarJa) {
    if (lutarJa && !this.podeLutar()) return;
    const m = this.mundo, p = this.pontoNaFrente(lutarJa ? 30 : 12);
    const membros = [];
    for (let i = 0; i < TAMANHO_GRUPO; i++) {
      const lider = i === 0;
      const dados = criarMonstro(especie, nivel);
      if (lider) dados.lider = true;
      const modelo = criarModelo(especie);
      if (lider) {
        modelo.scale.setScalar(1.3);
        const coroa = criarCoroa(1.2);
        coroa.position.y = ESPECIES[especie].altura + 0.15;
        modelo.add(coroa);
      }
      m.cena.add(modelo);
      membros.push({ dados, modelo, ox: 0, oz: 0 });
    }
    m.espalharGrupo(membros, p.x, p.z);
    const zona = lutarJa ? this.zonaDaLuta(especie) : zonaEm(p.x, p.z);
    const g = { grupo: true, membros, x: p.x, z: p.z, ang: 0, estado: 'parado', t: 2, zona, vel: statsDe(especie, nivel).vel * 0.35, acampamento: null, gm: true };
    m.grupos.push(g);
    if (lutarJa) {
      for (const mb of membros) mb.modelo.visible = false;
      this.temporarios.add(g);
      this.fecharPainel();
      this.jogo.iniciarBatalha(g);
    } else {
      m.graca = 1.5;
      this.jogo.aviso(`GM: um grupo de ${ESPECIES[especie].nome} Nv.${nivel} apareceu na sua frente.`);
    }
  }

  dar(especie, nivel) {
    const est = this.estado, novo = criarMonstro(especie, nivel);
    if (!est.capturados.includes(especie)) est.capturados.push(especie);
    if (est.equipe.length < MAX_EQUIPE) est.equipe.push(novo); else est.reserva.push(novo);
    this.jogo.aviso(`GM: ${ESPECIES[especie].nome} Nv.${nivel} foi para a sua ${est.equipe.includes(novo) ? 'equipe' : 'reserva'}.`);
    this.salvar();
  }

  duploAleatorio() {
    const p = this.pontoNaFrente(), m = this.mundo;
    const antes = m.selvagens.length;
    m.spawnarDuplo(p.x, p.z, zonaEm(p.x, p.z));
    const s = m.selvagens[antes];
    if (s) { s.periodo = null; s.gm = true; }
    m.graca = 1.5;
  }

  grupoAleatorio() {
    const p = this.pontoNaFrente(14), m = this.mundo;
    const g = m.spawnarGrupo({ x: p.x, z: p.z });
    if (g) { g.gm = true; m.graca = 1.5; this.jogo.aviso('GM: um grupo apareceu na sua frente.'); }
  }

  // Tira do mapa os selvagens e os grupos soltos (os chefes e os acampamentos ficam)
  limpar() {
    const m = this.mundo;
    let n = 0;
    for (const s of [...m.selvagens]) if (!s.chefe) { m.removerSelvagem(s); n++; }
    for (const g of [...m.grupos]) if (!g.acampamento) { m.removerGrupo(g); n++; }
    m.timerSpawn = 20; // dá um tempo antes de aparecerem de novo
    m.timerGrupo = 60;
    this.jogo.aviso(`GM: ${n} ${n === 1 ? 'monstro (ou grupo) saiu' : 'monstros (ou grupos) saíram'} do mapa.`);
  }

  // ---------- dungeons ----------
  dungeon(id) { return this.mundo.dungeons.find((d) => d.id === id); }

  irDungeon(id, onde) {
    const d = this.dungeon(id), T = d.t;
    let s, lat = 0;
    if (onde === 'entrada') s = T.sInicio - 6;
    else if (onde === 'chefe') s = T.sChefe - 9;
    else { s = d.sEtapa(Number(onde)) + 3; lat = -4; }
    const p = d.ponto(s, lat);
    this.teleportar(p.x, p.z, Math.atan2(T.dir.x, T.dir.z));
    this.jogo.aviso(`GM: ${onde === 'entrada' ? 'entrada do ' + d.cfg.nome : onde === 'chefe' ? d.cfg.fim : d.cfg.etapas[Number(onde)].nome}.`);
  }

  acampamento(id, etapa) {
    if (!this.podeLutar()) return;
    const d = this.dungeon(id), m = this.mundo;
    const p = this.pontoNaFrente(30);
    const g = m.spawnarGrupo({ x: p.x, z: p.z, zona: d.cfg.zonaSoltos, niveis: niveisDaEtapa(m.mediaEquipe(), etapa, id), lista: d.cfg.aparicoes, escalonado: true });
    if (!g) return;
    g.gm = true;
    for (const mb of g.membros) mb.modelo.visible = false;
    this.temporarios.add(g);
    this.fecharPainel();
    this.jogo.iniciarBatalha(g);
  }

  chefeAgora(id) {
    const d = this.dungeon(id);
    const nv = this.sel.nivelChefe || nivelDoChefe(this.mundo.mediaEquipe());
    const antes = this.sel.arena;
    this.sel.arena = d.cfg.zonaChefe;
    this.lutar(d.cfg.chefe, nv);
    this.sel.arena = antes;
  }

  chefeVolta(id) {
    const d = this.dungeon(id);
    if (d.chefe) { this.jogo.aviso(`GM: ${ESPECIES[d.cfg.chefe].nome} já está no ${d.cfg.fim}.`); return; }
    d.esperaAmanhecer = false;
    d.atualizarChefe();
    this.jogo.aviso(`GM: ${ESPECIES[d.cfg.chefe].nome} voltou ao ${d.cfg.fim}.`);
  }

  // Um dos monstros que aparecem soltos na dungeon, no nível da etapa 1, na sua frente
  soltoDungeon(id) {
    const d = this.dungeon(id), lista = d.cfg.aparicoes;
    const total = lista.reduce((t, [, w]) => t + w, 0);
    let r = Math.random() * total, escolha = lista[0][0];
    for (const [e, w] of lista) { r -= w; if (r <= 0) { escolha = e; break; } }
    const nv = niveisDaEtapa(this.mundo.mediaEquipe(), 0, id).comum;
    const especie = escolha.startsWith('L:') ? formaPorNivel(escolha.slice(2), nv) : escolha;
    this.aparecer(especie, nv);
  }

  // ---------- equipe ----------
  alvo() {
    const lista = this.todosMonstros();
    return (lista[this.sel.alvo] || lista[0])[0];
  }

  darXp(qtd) {
    const m = this.alvo(), nome = ESPECIES[m.especie].nome, antes = m.nivel;
    if (m.nivel >= MAX_NIVEL) { this.jogo.aviso(`GM: ${nome} já está no nível máximo (${MAX_NIVEL}).`); return; }
    this.jogo.ganharXp(m, Math.max(1, qtd));
    this.jogo.aviso(`GM: ${nome} ganhou ${qtd} de experiência${m.nivel > antes ? ` e subiu para o Nv.${m.nivel}` : ''}.`);
    this.salvar();
  }

  xpAte(nivel) {
    const m = this.alvo();
    if (nivel <= m.nivel) { this.jogo.aviso(`GM: ${ESPECIES[m.especie].nome} já está no Nv.${m.nivel}. Escolha um nível maior.`); return; }
    let qtd = xpParaProximo(m.nivel) - m.xp;
    for (let n = m.nivel + 1; n < nivel; n++) qtd += xpParaProximo(n);
    this.darXp(qtd);
  }

  evoluir() {
    const m = this.alvo(), e = ESPECIES[m.especie];
    if (!e.evoluiPara) return;
    if (m.nivel < e.nivelEvolucao) this.xpAte(e.nivelEvolucao);
    else { this.jogo.registrarEvolucoes(verificarEvolucao(m)); this.salvar(); }
  }

  // Volta para a forma anterior da linha, no nível logo abaixo da evolução (para não evoluir de novo sozinho)
  voltarForma() {
    const m = this.alvo();
    const anterior = Object.keys(ESPECIES).find((id) => ESPECIES[id].evoluiPara === m.especie);
    if (!anterior) return;
    const frac = m.hp / statsDe(m.especie, m.nivel).hpMax;
    // a animação de evolução que ainda não apareceu deixa de valer
    this.jogo.filaEvo = this.jogo.filaEvo.filter((ev) => ev.uid !== m.uid);
    m.especie = anterior;
    m.nivel = Math.min(m.nivel, ESPECIES[anterior].nivelEvolucao - 1);
    m.xp = 0;
    m.hp = Math.max(1, Math.round(frac * statsDe(m.especie, m.nivel).hpMax));
    this.jogo.aviso(`GM: voltou para ${ESPECIES[anterior].nome} Nv.${m.nivel}.`);
    this.salvar();
  }

  // Sobe 1 nível sem passar pela evolução (para testar uma forma em níveis altos)
  pularNivel() {
    const m = this.alvo();
    if (m.nivel >= MAX_NIVEL) return;
    const e = ESPECIES[m.especie];
    if (e.evoluiPara && m.nivel + 1 >= e.nivelEvolucao) { this.jogo.aviso(`GM: no Nv.${e.nivelEvolucao} ${e.nome} evolui. Use "Voltar uma forma" depois, se quiser.`); }
    m.nivel++;
    m.xp = 0;
    m.hp = statsDe(m.especie, m.nivel).hpMax;
    this.salvar();
  }

  cristais(qtd) {
    const p = this.estado.pedras;
    for (const c of CRISTAIS) p[c.id] = qtd === 0 ? 0 : qtd === 99 ? 99 : p[c.id] + qtd;
    this.salvar();
  }

  salvar() {
    this.jogo.atualizarHudMundo();
    this.jogo.salvar();
  }

  // ---------- mundo ----------
  teleportar(x, z, ang = this.mundo.ang) {
    const m = this.mundo, p = { x, z };
    m.chunks.carregarTudoPerto(x, z); // o chão de lá precisa existir antes de chegar
    m.colidir(p, 0.6);
    m.pos.set(p.x, 0, p.z);
    m.ang = ang;
    m.graca = 2.5; // ninguém ataca logo que você chega
    m.orbita.voltarPara = m.ang + Math.PI;
    m.posicionarCamera(1);
  }

  ir(onde) {
    if (onde === 'casa') {
      const c = this.mundo.casaPos;
      if (c) this.teleportar(c.x + Math.sin(c.rot) * 4.2, c.z + Math.cos(c.rot) * 4.2, c.rot);
      return;
    }
    const l = LUGARES.find((x) => x[0] === onde);
    if (!l) return;
    this.teleportar(l[2], l[3], onde === 'fonte' ? 0 : this.mundo.ang);
    this.jogo.aviso(`GM: ${l[1]}${NOMES_ZONA[onde] && NOMES_ZONA[onde] !== l[1] ? ' (' + NOMES_ZONA[onde] + ')' : ''}.`);
  }

  // ---------- batalha ----------
  // chamado pela batalha a cada quadro
  quadroBatalha(b) {
    const j = b.jog;
    if (this.invencivel && !j.morto) {
      j.dados.hp = j.stats.hpMax;
      for (const k of ['queimadura', 'combustao', 'parasita']) if (j.status[k]) delete j.status[k];
    }
    if (this.recargaZero) for (let i = 0; i < 3; i++) j.rec[i] = 0;
  }

  encher() {
    const b = this.jogo.batalha;
    if (!b || b.jog.morto) return;
    b.jog.dados.hp = b.jog.stats.hpMax;
    b.jog.status = {};
    this.jogo.aviso('GM: vida cheia e efeitos tirados.');
  }

  // Derrota todos os inimigos (os da arena e os que estão esperando nas ondas)
  vencer() {
    const b = this.jogo.batalha;
    if (!b || b.fim || b.captura) return;
    for (const d of b.fila) { b.derrotados.push(d); if (d.lider) b.liderDerrotado = true; }
    b.fila.length = 0;
    b.ondas.length = 0;
    for (const l of b.vivos()) { l.dados.hp = 0; b.desmaiar(l); }
    b.verificarFim();
  }

  // Depois da luta: o monstro do "Lutar agora" que sobrou (fuga ou derrota) sai do mapa
  depoisDaBatalha(b) {
    const s = b.selvagem;
    if (!this.temporarios.has(s)) return;
    this.temporarios.delete(s);
    const m = this.mundo;
    if (s.grupo) { if (m.grupos.includes(s)) m.removerGrupo(s); }
    else if (m.selvagens.includes(s)) m.removerSelvagem(s);
  }

  // ---------- a cada quadro ----------
  quadro(dt) {
    if (!this.fps) return;
    const f = this.fpsConta;
    f.n++; f.t += dt;
    if (f.t >= 0.5) { this.elFps.textContent = `${Math.round(f.n / f.t)} FPS`; f.n = 0; f.t = 0; }
  }
}
