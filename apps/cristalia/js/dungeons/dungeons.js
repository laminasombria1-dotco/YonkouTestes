// =============================================================
// DUNGEONS (mundo novo, passo 5): o motor
//  - No mapa: a ENTRADA de cada dungeon (arco de pedra com o vórtice). Chegando perto,
//    aparece "Você descobriu..." e, daí em diante, um CRISTAL flutua em cima dela
//    (sem névoa: dá para ver de longe). Depois de vencer o Rei, o cristal fica cinza.
//  - Encostou no vórtice: a tela escurece e o jogo monta só a dungeon (a mesma área
//    separada das masmorras: masmorras/masmorra.js faz o chão, as saídas e o clima).
//  - Lá dentro: 2 ou 3 grupos (sorteados no reset) e o portão selado do Rei, que abre
//    quando todos os grupos forem vencidos. O Rei é capturável com os cristais normais.
//  - Reset: 2 horas de jogo depois de vencer o Rei, a dungeon muda de lugar e de variação.
// Os números ficam em lista.js; os desenhos, um arquivo por variação.
// =============================================================
import * as THREE from 'three';
import { MasmorraNova } from '../masmorras/masmorra.js';
import { Bloco, GEO, lambert, sortear } from '../dungeon.js';
import { alturaEm } from '../mapa/altura.js';
import { ESPECIES, com, criarMonstro, especieDaEscolha } from '../dados.js';
import { criarModelo, criarCoroa, animarModelo } from '../modelos.js';
import { niveisDoGrupo } from '../mundo.js';
import { texturaBrilho } from '../biomas/comum.js';
import { LUGARES_DUNGEON } from './lugares.js';
import { DUNGEON, BIOMAS_DUNGEON, VARIACOES } from './lista.js';

const ESCALA_REI = 1.5;
const DIST_PORTA = 2.0;     // encostar no vórtice
// O visual da entrada em cada bioma (arco, pedras em volta, cor do vórtice e do cristal)
const ESTILO = {
  raio:   { pedra: '#8b9bb4', pedra2: '#6d7d96', topo: '#f2f8ff', cor: '#8fe3ff' },
  planta: { pedra: '#5a4630', pedra2: '#3f5a2c', topo: '#5f9a3a', cor: '#7dffa0' },
  terra:  { pedra: '#d4a870', pedra2: '#b98a52', topo: '#e8c890', cor: '#ffd36b' },
  fogo:   { pedra: '#2e2628', pedra2: '#4a3a36', topo: '#ff7a2a', cor: '#ff7a3a' },
  agua:   { pedra: '#e6d8bc', pedra2: '#ff9aa8', topo: '#5fc0a0', cor: '#5fe0ff' },
};
const CINZA = new THREE.Color('#8a8f99');
const SEM_INDICE = new Map(); // as formas sem índice (para juntar), feitas uma vez só
const hashTxt = (t) => { let h = 2166136261; for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const mmss = (s) => { const m = Math.ceil(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };

// =============================================================
// Uma dungeon montada (só existe enquanto você está lá dentro)
// =============================================================
class DungeonNova extends MasmorraNova {
  constructor(gerente, vaga) {
    const v = VARIACOES[vaga.sv.variacao], B = BIOMAS_DUNGEON[v.bioma];
    const cfg = {
      ...v, zonaSoltos: B.zona, zonaChefe: B.zona, aparicoes: B.aparicoes,
      semCasa: 'A bandeira não pode ser fincada dentro de uma dungeon. Finque do lado de fora.',
      etapas: v.etapas.map((nome) => ({ nome })),
    };
    // o gerente da área separada é o das masmorras (entrar, sair, a cortina); o das dungeons fica em this.dg
    super(gerente.m.masmorras, vaga.id, { cfg, plano: { tamLote: 600, ...v.plano }, origem: DUNGEON.origem, semente: hashTxt(vaga.sv.variacao) });
    this.vaga = vaga;
    this.dg = gerente;
  }
  get sv() { return this.vaga.sv; }

  // ---------- peças juntadas: uma malha só por material (menos desenhos por quadro) ----------
  // (as masmorras usam o Lote, um desenho por tipo de peça; a dungeon é pequena e junta tudo)
  peca(geo, mat, lx, y, lz, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, chao = true) {
    if (!this.junta) this.junta = new Map();
    if (!this.junta.has(mat)) this.junta.set(mat, []);
    this.junta.get(mat).push([geo, this.o.x + lx, (chao ? this.y(lx, lz) : 0) + y, this.o.z + lz, sx, sy, sz, rx, ry, rz]);
  }
  construir() {
    super.construir();
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), pt = new THREE.Vector3(), nm = new THREE.Matrix3();
    for (const [mat, lista] of this.junta || []) {
      const geos = lista.map(([g]) => (g.index ? (SEM_INDICE.get(g) || SEM_INDICE.set(g, g.toNonIndexed()).get(g)) : g));
      const total = geos.reduce((t, g) => t + g.attributes.position.count, 0);
      const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
      let o = 0;
      lista.forEach(([, x, y, z, sx, sy, sz, rx, ry, rz], i) => {
        m4.compose(v.set(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), sc.set(sx, sy, sz));
        nm.getNormalMatrix(m4);
        const a = geos[i].attributes.position, n = geos[i].attributes.normal;
        for (let k = 0; k < a.count; k++, o += 3) {
          pt.fromBufferAttribute(a, k).applyMatrix4(m4); pos[o] = pt.x; pos[o + 1] = pt.y; pos[o + 2] = pt.z;
          pt.fromBufferAttribute(n, k).applyMatrix3(nm).normalize(); nor[o] = pt.x; nor[o + 1] = pt.y; nor[o + 2] = pt.z;
        }
      });
      const g = this.geo(new THREE.BufferGeometry());
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      g.computeBoundingSphere();
      this.grupo.add(new THREE.Mesh(g, mat));
    }
    this.junta = null;
  }
  tituloTela() { return `${this.cfg.nome} · Dungeon`; }
  get nivelMasmorra() { return 1; }

  // ---------- os grupos: 2 ou 3 (os vencidos ficam salvos até o reset) ----------
  criarAcampamentos() {
    this.plano.acampamentos.slice(0, this.sv.grupos).forEach((a, i) => {
      this.acampamentos.push({ lx: a.x, lz: a.z, ...this.w(a.x, a.z), etapa: a.etapa, i, grupo: null, vencido: !!this.sv.vencidos[i] });
    });
    if (this.todosVencidos()) this.abrirPortao(0, false);
  }
  todosVencidos() { return this.acampamentos.every((a) => a.vencido); }
  faltam() { return this.acampamentos.filter((a) => !a.vencido).length; }
  etapaVencida(a) {
    this.sv.vencidos[a.i] = true;
    if (this.todosVencidos()) this.abrirPortao(0, false), this.m.jogo.aviso(`O portão ${com('de', this.cfg.fimFem)} ${this.cfg.fim} se abriu! O Rei da Dungeon espera lá dentro.`);
    else this.m.jogo.aviso(`Grupo vencido! Falta${this.faltam() > 1 ? 'm' : ''} ${this.faltam()} para abrir o portão do Rei.`);
    this.m.jogo.salvar?.();
  }
  // Níveis: os mesmos dos grupos do mapa (a sua equipe), +1 a cada grupo. Bem mais fácil que as masmorras.
  niveis(etapa) {
    const nv = niveisDoGrupo(this.m.mediaEquipe()), e = DUNGEON.extraGrupo * etapa;
    return { comum: Math.min(95, nv.comum + e), lider: Math.min(95, nv.lider + e) };
  }
  liderFinal() { return false; }
  atualizarSoltos() { /* dungeon: só os grupos e o Rei */ }

  // ---------- o Rei da Dungeon ----------
  get nivelRei() { return Math.min(95, this.niveis(Math.max(0, this.sv.grupos - 1)).lider + DUNGEON.extraRei); }
  idDoChefe() { return especieDaEscolha(this.sv.rei, this.nivelRei); } // nunca a forma final
  prepararChefe() { if (!this.sv.vencida) this.spawnarChefe(); }
  spawnarChefe() {
    const m = this.m, id = this.idDoChefe(), esp = ESPECIES[id], tr = this.plano.trono;
    const dados = criarMonstro(id, this.nivelRei);
    dados.chefe = true; // Fúria e o tesouro (capturável com os cristais normais)
    const modelo = criarModelo(id);
    modelo.scale.setScalar(ESCALA_REI);
    const coroa = criarCoroa(1.6 / ESCALA_REI);
    coroa.position.y = esp.altura + 0.2 / ESCALA_REI;
    modelo.add(coroa);
    const w = this.w(tr.x, tr.z);
    modelo.position.set(w.x, alturaEm(w.x, w.z), w.z);
    modelo.rotation.y = tr.ang;
    m.cena.add(modelo);
    this.chefe = { dados, modelo, chefe: true, masmorra: this, fixo: true, x: w.x, z: w.z, ang: tr.ang, estado: 'parado', t: 99, zona: this.cfg.zonaChefe, periodo: null, vel: 0 };
    m.selvagens.push(this.chefe);
  }
  get nomeChefe() { return ESPECIES[this.chefe?.dados.especie || this.idDoChefe()].nome; }
  // O prêmio do Rei (lido pelo main.js no fim da luta)
  premioRei() {
    const P = DUNGEON.premio;
    return { forte: P.forte, supremo: Math.random() < P.chanceSupremo ? 1 : 0, ouro: P.ouroBase + P.ouroPorNivel * Math.round(this.m.mediaEquipe()), drop: 'reiDungeon' };
  }
  textoRei(capturado) {
    return capturado ? `Você capturou ${this.nomeChefe}, o Rei ${com('de', this.cfg.fem)} ${this.cfg.nome}!` : `Você venceu ${this.nomeChefe}, o Rei ${com('de', this.cfg.fem)} ${this.cfg.nome}!`;
  }
  // Rei vencido ou capturado: daqui a 2 horas de jogo a dungeon reseta (e muda de lugar)
  chefeVencido() {
    this.sv.vencida = true;
    this.sv.t = 0;
    this.m.jogo.aviso(`Daqui a 2 horas de jogo ${com('o', this.cfg.fem)} ${this.cfg.nome} se renova em outro lugar.`);
    this.dg.atualizarIcone(this.vaga);
  }
  atualizarChefe() {
    const m = this.m;
    if (this.chefe && !m.selvagens.includes(this.chefe)) {
      this.chefe = null;
      if (m.jogo.estado) m.jogo.aviso('O portal de saída se abriu no trono.');
    }
    if (this.chefe) {
      animarModelo(this.chefe.modelo, this.tempo, false);
      this.chefe.modelo.position.y = alturaEm(this.chefe.x, this.chefe.z);
    }
  }

  // ---------- avisos ----------
  avisarEtapa() {
    const m = this.m, e = this.etapaAqui();
    if (e == null || e === this.etapaAvisada || !m.jogo.estado) return;
    this.etapaAvisada = e;
    if (e === 'fim') {
      if (this.chefe) m.jogo.aviso(`O Rei ${this.nomeChefe} (Nv.${this.chefe.dados.nivel}) espera ${com('em', this.cfg.fimFem)} ${this.cfg.fim}. Encoste nele para lutar.`);
      else m.jogo.aviso('O Rei já foi vencido. Use o portal para sair.');
      return;
    }
    const a = this.acampamentos.find((x) => x.etapa === e);
    if (!a) { m.jogo.aviso(`${this.cfg.etapas[e].nome}: vazio desta vez.`); return; }
    const nv = this.niveis(e);
    m.jogo.aviso(a.vencido ? `${this.cfg.etapas[e].nome}: grupo já vencido.` : `${this.cfg.etapas[e].nome}: grupo Nv.${nv.comum}, líder Nv.${nv.lider}.`);
  }
  avisarPortao(dt) {
    this.avisoPortaoT = Math.max(0, this.avisoPortaoT - dt);
    if (this.avisoPortaoT > 0 || !this.m.jogo.estado) return;
    const m = this.m;
    for (const p of this.portoes) {
      if (p.aberto) continue;
      if (Math.hypot(m.pos.x - this.o.x - p.lx, m.pos.z - this.o.z - p.lz) < 4) {
        m.jogo.aviso(`Portão do Rei selado: vença os grupos da dungeon (falta${this.faltam() > 1 ? 'm' : ''} ${this.faltam()}).`);
        this.avisoPortaoT = 6;
        return;
      }
    }
  }
}

// =============================================================
// O gerente: as vagas (3 por bioma), as entradas no mapa, o reset e entrar
// =============================================================
export class Dungeons {
  constructor(mundo) {
    this.m = mundo;
    this.grupo = new THREE.Group();
    this.grupo.name = 'entradas-dungeons';
    mundo.cena.add(this.grupo);
    this.vagas = [];
    this.biomas = Object.keys(BIOMAS_DUNGEON).filter((b) => LUGARES_DUNGEON[b]?.length >= DUNGEON.vagas);
    // os 6 lugares de cada bioma ficam sem árvore desde já (assim nada aparece ou some quando a dungeon muda de lugar)
    for (const b of this.biomas) for (const l of LUGARES_DUNGEON[b]) mundo.reservas.push({ x: l.x, z: l.z, r: 7 });
    this.geoIcone = new THREE.OctahedronGeometry(0.6, 0);
    this.geoVortice = new THREE.CircleGeometry(1.45, 18);
    this.geoHalo = new THREE.BufferGeometry();
    this.geoHalo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
  }

  get estado() { return this.m.jogo.estado; }
  vaga(id) { return this.vagas.find((v) => v.id === id); }

  // Ao começar ou continuar um jogo: as vagas do jogo salvo (cria as que faltam)
  prepararEstado() {
    for (const v of this.vagas) this.apagarEntrada(v);
    this.vagas = [];
    const est = this.estado;
    if (!est) return;
    est.dungeons ||= {};
    for (const b of this.biomas) for (let k = 0; k < DUNGEON.vagas; k++) {
      const id = b + k;
      let sv = est.dungeons[id];
      const ok = sv && VARIACOES[sv.variacao]?.bioma === b && LUGARES_DUNGEON[b][sv.lugar]
        && !this.vagas.some((o) => o.bioma === b && (o.sv.lugar === sv.lugar || o.sv.variacao === sv.variacao));
      if (!ok) sv = est.dungeons[id] = this.sortearVaga(b);
      const vaga = { id, bioma: b, sv };
      this.vagas.push(vaga);
      this.montarEntrada(vaga);
    }
  }
  // Sorteia uma dungeon nova para a vaga: lugar e variação livres no bioma, 2 ou 3 grupos e o Rei
  sortearVaga(b, menos = null) {
    const outras = this.vagas.filter((o) => o.bioma === b && o !== menos);
    const livres = (n, usados) => [...Array(n).keys()].filter((i) => !usados.includes(i));
    const lugares = livres(LUGARES_DUNGEON[b].length, outras.map((o) => o.sv.lugar).concat(menos ? [menos.sv.lugar] : []));
    const vars = BIOMAS_DUNGEON[b].variacoes, usadas = outras.map((o) => o.sv.variacao).concat(menos ? [menos.sv.variacao] : []);
    const varLivres = vars.filter((v) => !usadas.includes(v));
    const pega = (l) => l[Math.floor(Math.random() * l.length)];
    return {
      lugar: pega(lugares.length ? lugares : [...LUGARES_DUNGEON[b].keys()]),
      variacao: pega(varLivres.length ? varLivres : vars),
      grupos: Math.random() < 0.5 ? 2 : 3,
      vencidos: [],
      rei: sortear(BIOMAS_DUNGEON[b].rei),
      achada: false, vencida: false, t: 0,
    };
  }

  // ---------- a entrada no mapa ----------
  montarEntrada(vaga) {
    const L = LUGARES_DUNGEON[vaga.bioma][vaga.sv.lugar], E = ESTILO[vaga.bioma], cfg = VARIACOES[vaga.sv.variacao];
    const { x, z, ang } = L, y0 = alturaEm(x, z);
    const fx = Math.sin(ang), fz = Math.cos(ang), sx = Math.cos(ang), sz = -Math.sin(ang);
    const P = (f, s) => ({ x: x + fx * f + sx * s, z: z + fz * f + sz * s });
    const pedra = lambert(E.pedra), pedra2 = lambert(E.pedra2), topo = lambert(E.topo, vaga.bioma === 'fogo' ? { emissive: E.topo, emissiveIntensity: 0.8 } : {});
    const runa = lambert(E.cor, { emissive: E.cor, emissiveIntensity: 0.9 });
    const b = new Bloco(), e = 1.25;
    vaga.obstaculos = [];
    b.add(GEO.cil, pedra2, x, y0 + 0.12, z, 8.6 * e, 0.5, 8.6 * e);                     // o degrau redondo
    for (let i = 0; i < 9; i++) {                                                     // o anel de pedras (aberto na frente)
      const a = (i / 9) * Math.PI * 2, c = Math.cos(a);
      if (c > 0.6) continue;
      const p = P(c * 4.5 * e, Math.sin(a) * 4.5 * e);
      b.add(GEO.dode, pedra, p.x, y0 + 0.4, p.z, 1.6 * e, 1.2 * e, 1.6 * e, i, i, 0);
    }
    for (const l of [-1, 1]) {                                                        // o arco: 2 pilares e a viga
      const p = P(0, l * 1.9 * e);
      b.add(GEO.caixa, pedra, p.x, y0 + 2.1 * e, p.z, 1.1 * e, 4.2 * e, 1.1 * e, 0, ang, -l * 0.06);
      b.add(GEO.dode, topo, p.x, y0 + 4.4 * e, p.z, 1.4 * e, 0.8 * e, 1.4 * e);
      const o = { x: p.x, z: p.z, r: 0.9 };
      this.m.obstaculos.push(o); vaga.obstaculos.push(o);
    }
    b.add(GEO.caixa, pedra, x, y0 + 4.5 * e, z, 5.2 * e, 0.9 * e, 1.3 * e, 0, ang, 0);
    const pr = P(0.7 * e, 0);
    b.add(this.geoIcone, runa, pr.x, y0 + 4.5 * e, pr.z, 0.45 * e, 0.6 * e, 0.2 * e, 0, ang, 0);
    const blk = b.montar(this.grupo);
    // o vórtice (a porta), a poça de luz e o cristal flutuante (brilho falso, sem névoa)
    const cor = new THREE.Color(E.cor);
    const vort = new THREE.Mesh(this.geoVortice, new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
    vort.position.set(x, y0 + 2.05 * e, z); vort.rotation.y = ang; vort.scale.set(e, 1.35 * e, 1);
    const icone = new THREE.Group();
    const cristal = new THREE.Mesh(this.geoIcone, new THREE.MeshBasicMaterial({ color: cor.clone(), fog: false }));
    cristal.scale.set(1.1, 1.6, 1.1);
    const halo = new THREE.Points(this.geoHalo, new THREE.PointsMaterial({ color: cor.clone(), size: 5, map: texturaBrilho(), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    icone.add(cristal, halo);
    icone.position.set(x, y0 + 7.5, z);
    this.grupo.add(vort, icone);
    const porta = P(0.4, 0), fora = P(6, 0);
    vaga.entrada = { x, z, ang, y0, cfg, porta, fora, blk, vort, icone, cristal, halo, cor };
    this.atualizarIcone(vaga);
  }
  apagarEntrada(vaga) {
    const e = vaga.entrada;
    if (!e) return;
    for (const o of vaga.obstaculos || []) this.m.obstaculos.tirar(o);
    this.grupo.remove(e.blk.grupo, e.vort, e.icone);
    for (const mt of e.blk.mats) mt.dispose();
    e.blk.grupo.traverse((o) => o.isMesh && o.geometry.dispose());
    e.vort.material.dispose(); e.cristal.material.dispose(); e.halo.material.dispose();
    vaga.entrada = null;
  }
  // O cristal só aparece depois de descoberta; cinza enquanto o Rei não volta
  atualizarIcone(vaga) {
    const e = vaga.entrada;
    if (!e) return;
    e.icone.visible = !!vaga.sv.achada;
    const c = vaga.sv.vencida ? CINZA : e.cor;
    e.cristal.material.color.copy(c);
    e.halo.material.color.copy(c);
    e.halo.material.opacity = vaga.sv.vencida ? 0.3 : 0.8;
    e.vort.material.color.copy(c);
    e.vort.visible = !vaga.sv.vencida;
  }

  // ---------- o tempo do reset (chamado pelo main.js, só com o jogo aberto) ----------
  passarTempo(dt) {
    for (const v of this.vagas) {
      if (!v.sv.vencida) continue;
      v.sv.t += dt;
      if (v.sv.t >= DUNGEON.reset && this.m.masmorras.ativa?.vaga !== v) this.resetar(v);
    }
  }
  // A dungeon se renova: outro lugar, outra variação, grupos e Rei sorteados de novo
  resetar(vaga, avisar = true) {
    const antes = VARIACOES[vaga.sv.variacao].nome, achada = vaga.sv.achada;
    this.apagarEntrada(vaga);
    vaga.sv = this.estado.dungeons[vaga.id] = this.sortearVaga(vaga.bioma, vaga);
    this.montarEntrada(vaga);
    if (avisar && achada) this.m.jogo.aviso(`${antes} se renovou: uma dungeon nova apareceu em outro lugar ${com('de', false)} ${BIOMAS_DUNGEON[vaga.bioma].nome}.`);
    this.m.jogo.salvar?.();
  }

  // ---------- entrar ----------
  entrar(vaga, onde = 'inicio') {
    this.m.masmorras.abrir(() => new DungeonNova(this, vaga), vaga.entrada, onde);
  }

  // ---------- quadro a quadro ----------
  atualizar(dt, t, pausado) {
    const m = this.m, est = this.estado;
    if (m.masmorras.ativa) return;
    for (const v of this.vagas) {
      const e = v.entrada;
      if (!e) continue;
      if (e.icone.visible) { e.cristal.rotation.y = t * 1.5; e.icone.position.y = e.y0 + 7.5 + Math.sin(t * 2) * 0.3; }
      if (e.vort.visible) { e.vort.rotation.z = t; e.vort.material.opacity = 0.6 + Math.sin(t * 3) * 0.12; }
    }
    if (!est || pausado) return;
    for (const v of this.vagas) {
      const e = v.entrada, d = Math.hypot(m.pos.x - e.x, m.pos.z - e.z);
      if (d > DUNGEON.descobrir + 5) continue;
      if (!v.sv.achada && d < DUNGEON.descobrir) {
        v.sv.achada = true;
        this.atualizarIcone(v);
        m.jogo.mostrarZona?.(e.cfg.nome);
        m.jogo.aviso(`Você descobriu ${com('o', e.cfg.fem)} ${e.cfg.nome}! Dungeon fácil: ${v.sv.grupos} grupos e o Rei.`);
        m.jogo.salvar?.();
      }
      if (m.graca > 0 || Math.hypot(m.pos.x - e.porta.x, m.pos.z - e.porta.z) > DIST_PORTA) continue;
      if (v.sv.vencida) {
        if (!this.avisoT || t - this.avisoT > 6) { this.avisoT = t; m.jogo.aviso(`O Rei já foi vencido. Esta dungeon se renova em ${mmss(DUNGEON.reset - v.sv.t)} de jogo, em outro lugar.`); }
        continue;
      }
      this.entrar(v);
      return;
    }
  }
}
