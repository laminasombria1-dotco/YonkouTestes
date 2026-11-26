// =============================================================
// MASMORRAS NOVAS (mundo novo, passo 4): a base comum
// Cada masmorra nova é uma ÁREA SEPARADA, bem longe do mapa redondo:
//  - no mapa só fica a ENTRADA, escondida no bioma (sem ícone). Chegando perto,
//    aparece "Você descobriu..." (fica salvo na conta). Encostou na porta, a tela
//    escurece e o jogo monta SÓ a masmorra. O mapa de fora some sozinho (fica longe).
//  - lá dentro: 5 etapas. Cada etapa tem um grupo com LÍDER; o portão selado da saída
//    da etapa só abre quando o líder é vencido. No fim, o chefe (forma final).
//  - sair: pela porta da entrada (a qualquer hora) ou pelo portal que aparece depois
//    do chefe. Desmaiou? Renasce na bandeira ou na fonte, do lado de fora.
//  - ao sair, tudo da masmorra é apagado da memória (só uma existe por vez).
// O desenho de cada masmorra (salas, cores, enfeites) fica no arquivo dela
// (ex.: gruta-trovao.js). Este arquivo faz o que todas fazem igual.
// =============================================================
import * as THREE from 'three';
import { criarModelo, criarCoroa, animarModelo, criarAuraDupla, descartar } from '../modelos.js';
import { Lote, Bloco, GEO, aleatorio, sortear } from '../dungeon.js';
import { alturaEm, alturaVertice, ESPACO, esquecerAlturas } from '../mapa/altura.js';
import { LUGARES } from '../mapa/gerador.js';
import {
  ESPECIES, ELEMENTOS, MASMORRAS_NOVAS, com, MASMORRA, MASMORRA_NOVA, niveisMasmorraNova, nivelChefeMasmorraNova,
  criarMonstro, statsDe, especieDaEscolha, dadosMasmorra, sortearChefe,
} from '../dados.js';
import { FormaMasmorra, INTERIOR } from './forma.js';
import { GRUTA_TROVAO } from './gruta-trovao.js';
import { TORRE_NEVASCA } from './torre-nevasca.js';
import { MINA_ABANDONADA } from './mina-abandonada.js';
import { TUMBA_AREIAS } from './tumba-areias.js';
import { PANTANO_SOMBRIO } from './pantano-sombrio.js';
import { FORJA_ANTIGA } from './forja-antiga.js';
import { TEMPLO_SUBMERSO } from './templo-submerso.js';
import { GRUTA_MARES } from './gruta-mares.js';

// Os desenhos de cada masmorra (as que ainda não existem não aparecem no mapa)
const PLANOS = { trovao: GRUTA_TROVAO, torre: TORRE_NEVASCA, mina: MINA_ABANDONADA, tumba: TUMBA_AREIAS, pantano: PANTANO_SOMBRIO, forja: FORJA_ANTIGA, templo: TEMPLO_SUBMERSO, mares: GRUTA_MARES };

const MAX_SOLTOS = 4;           // monstros soltos ao mesmo tempo (na sala onde você está)
const ESCALA_CHEFE = 1.5;       // o chefe (forma final) fica maior que os outros
const TAM_PISO = 24;            // quadrados do chão por pedaço (24 × 2,67 m = 64 m): o que está longe nem é desenhado
const TAM_LOTE = 90;            // os enfeites são juntados em quadrados de 90 m (menos desenhos por quadro)
const DIST_DESCOBRIR = 22;      // a essa distância da entrada, você "descobre" a masmorra
// Cada masmorra nova fica num lugar próprio, bem longe do mapa (o mapa tem 390 m de raio)
const ORIGEM_X = 1800, ESPACO_ORIGENS = 900;

const c3 = new THREE.Color(), c4 = new THREE.Color();
const lerpAng = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI; if (d < -Math.PI) d += Math.PI * 2; return a + d * k; };

// =============================================================
// Uma masmorra montada (só existe enquanto você está lá dentro)
// =============================================================
export class MasmorraNova {
  constructor(gerente, id) {
    this.g = gerente;
    this.m = gerente.m;
    this.id = id;
    this.cfg = MASMORRAS_NOVAS[id];
    this.plano = PLANOS[id];
    this.rng = aleatorio(0x51ed + Object.keys(MASMORRAS_NOVAS).indexOf(id) * 977);
    const k = Object.keys(MASMORRAS_NOVAS).indexOf(id);
    this.forma = new FormaMasmorra({ ...this.plano.forma, zona: this.cfg.zonaSoltos, origem: { x: ORIGEM_X + k * ESPACO_ORIGENS, z: 0 } });
    this.o = this.forma.origem;
    this.grupo = new THREE.Group();
    this.grupo.name = 'masmorra-' + id;
    this.mats = new Map();       // materiais desta masmorra (apagados na saída)
    this.geos = [];              // geometrias próprias (apagadas na saída)
    this.obstaculos = [];        // obstáculos colocados na grade do mundo (tirados na saída)
    this.animados = [];          // funções chamadas a cada quadro (enfeites que mexem)
    this.portoes = [];
    this.acampamentos = [];
    this.chefe = null;
    this.etapaAvisada = -2;
    this.avisoPortaoT = 0;
  }

  // ---------- ajudantes para o desenho de cada masmorra ----------
  // (todas as coordenadas são LOCAIS: em volta da origem da masmorra)
  mat(cor, extra = null) {
    const k = cor + (extra ? JSON.stringify(extra) : '');
    if (!this.mats.has(k)) this.mats.set(k, new THREE.MeshLambertMaterial({ color: cor, flatShading: true, ...(extra || {}) }));
    return this.mats.get(k);
  }
  brilho(cor, forca = 0.6) { return this.mat(cor, { emissive: cor, emissiveIntensity: forca }); }
  y(lx, lz) { return alturaEm(this.o.x + lx, this.o.z + lz); }
  w(lx, lz) { return { x: this.o.x + lx, z: this.o.z + lz }; }
  d(lx, lz) { return this.forma.andavelLocal(lx, lz).d; }
  // peça no lote (instanciada): y relativo ao chão quando chao = true
  peca(geo, mat, lx, y, lz, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, chao = true) {
    this.lote.add(geo, mat, this.o.x + lx, (chao ? this.y(lx, lz) : 0) + y, this.o.z + lz, sx, sy, sz, rx, ry, rz);
  }
  obst(lx, lz, r) {
    const o = { x: this.o.x + lx, z: this.o.z + lz, r };
    this.m.obstaculos.push(o);
    this.obstaculos.push(o);
  }
  malha(geo, mat, lx, y, lz, chao = true) {
    const me = new THREE.Mesh(geo, mat);
    me.position.set(this.o.x + lx, (chao ? this.y(lx, lz) : 0) + y, this.o.z + lz);
    this.grupo.add(me);
    return me;
  }
  geo(g) { this.geos.push(g); return g; }
  // Bloco (uma malha só por material): para peças grandes e únicas
  bloco(fn) { const b = new Bloco(); fn(b); const blk = b.montar(this.grupo); (this.blocos ||= []).push(blk); return blk; }
  animar(fn) { this.animados.push(fn); }
  // Ponto andável sorteado numa sala (longe da beirada)
  pontoNaSala(i, folga = 3, rng = this.rng) {
    const s = this.forma.salas[i];
    for (let t = 0; t < 40; t++) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(rng());
      const lx = s.x + Math.cos(a) * s.rx * r, lz = s.z + Math.sin(a) * s.rz * r;
      if (this.d(lx, lz) < -folga && this.forma.buracos.every((b) => Math.hypot(lx - b.x, lz - b.z) > b.r + folga)) return { x: lx, z: lz };
    }
    return { x: s.x, z: s.z };
  }

  // ---------- montar ----------
  construir() {
    const c = this.forma.caixa;
    esquecerAlturas(this.o.x + c.x0 - 40, this.o.z + c.z0 - 40, this.o.x + c.x1 + 40, this.o.z + c.z1 + 40);
    INTERIOR.forma = this.forma; // daqui para frente, alturaEm() usa a masmorra
    this.m.cena.add(this.grupo);
    this.lote = new Lote(TAM_LOTE);
    this.criarChao();
    this.criarPortoes();
    this.criarAcampamentos();
    this.plano.decorar(this);
    this.criarSaidas();
    this.lote.montar(this.grupo);
    this.criarParticulas();
    this.prepararClima();
    this.prepararChefe();
  }

  // O chão: os mesmos triângulos de alturaEm (nada flutua nem afunda), em pedaços de 40 m.
  // Cada triângulo tem uma cor só (o visual "low poly" do jogo).
  criarChao() {
    const c = this.forma.caixa, o = this.o, P = this.plano;
    const i0 = Math.floor((o.x + c.x0) / ESPACO), i1 = Math.ceil((o.x + c.x1) / ESPACO);
    const j0 = Math.floor((o.z + c.z0) / ESPACO), j1 = Math.ceil((o.z + c.z1) / ESPACO);
    const pedacos = new Map(), rng = aleatorio(77);
    const v = (i, j) => [i * ESPACO, alturaVertice(i, j), j * ESPACO];
    for (let i = i0; i < i1; i++) for (let j = j0; j < j1; j++) {
      const cx = (i + 0.5) * ESPACO - o.x, cz = (j + 0.5) * ESPACO - o.z;
      const info = this.forma.andavelLocal(cx, cz);
      if (info.d > (P.paredeVisivel ?? 26)) continue; // longe demais da parte andável: ninguém vê
      const k = Math.floor(i / TAM_PISO) + ',' + Math.floor(j / TAM_PISO);
      if (!pedacos.has(k)) pedacos.set(k, { pos: [], cor: [] });
      const pd = pedacos.get(k);
      const sala = this.forma.salaPerto(o.x + cx, o.z + cz);
      for (const tri of [[v(i, j), v(i, j + 1), v(i + 1, j)], [v(i + 1, j + 1), v(i + 1, j), v(i, j + 1)]]) {
        const hm = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        P.corChao(c3, { sala, d: info.d, h: hm, hChao: info.h, x: cx, z: cz, tipo: info.tipo, rng, masmorra: this });
        for (const p of tri) { pd.pos.push(p[0], p[1], p[2]); pd.cor.push(c3.r, c3.g, c3.b); }
      }
    }
    const mat = this.mat('#ffffff', { vertexColors: true });
    for (const { pos, cor } of pedacos.values()) {
      const g = this.geo(new THREE.BufferGeometry());
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
      g.computeVertexNormals();
      g.computeBoundingSphere();
      this.grupo.add(new THREE.Mesh(g, mat));
    }
    this.nPedacos = pedacos.size;
  }

  // ---------- portões selados ----------
  // O portão da etapa e fica na saída da sala da etapa (no corredor para a próxima sala).
  // Fecha o corredor com uma fileira de obstáculos; abre quando o líder da etapa é vencido.
  criarPortoes() {
    const F = this.forma, P = this.plano;
    for (const pt of P.portoes) {
      const c = F.corredores[pt.corredor], ux = c.ux, uz = c.uz, sa = c.sa;
      const s = c.ra + (pt.depois ?? 3), lx = sa.x + ux * s, lz = sa.z + uz * s; // logo depois da beirada da sala
      const ang = Math.atan2(ux, uz), larg = c.larg;
      const b = new Bloco(), base = this.y(lx, lz);
      const px = -uz, pz = ux; // para o lado
      P.pecasPortao(this, b, { lx, lz, base, ang, larg, px, pz });
      const blk = b.montar(this.grupo);
      // a parede de energia (some quando abre)
      const parede = new THREE.Mesh(this.geo(new THREE.PlaneGeometry(larg * 2 + 1, 5.5)), new THREE.MeshBasicMaterial({ color: P.corSelo, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }));
      this.mats.set('selo' + this.portoes.length, parede.material);
      parede.position.set(this.o.x + lx, base + 2.6, this.o.z + lz);
      parede.rotation.y = ang;
      this.grupo.add(parede);
      const obs = [];
      for (let t = -larg - 0.6; t <= larg + 0.6; t += 1.4) {
        const o = { x: this.o.x + lx + px * t, z: this.o.z + lz + pz * t, r: 1.1 };
        this.m.obstaculos.push(o); this.obstaculos.push(o); obs.push(o);
      }
      this.portoes.push({ lx, lz, ang, parede, obs, aberto: false, abrir: 0, blk });
    }
  }
  abrirPortao(i, avisar = true) {
    const p = this.portoes[i];
    if (!p || p.aberto) return;
    p.aberto = true;
    for (const o of p.obs) { this.m.obstaculos.tirar(o); this.obstaculos.splice(this.obstaculos.indexOf(o), 1); }
    if (avisar && this.m.jogo.estado) this.m.jogo.aviso(i === this.portoes.length - 1 ? `O portão ${com('de', this.cfg.fimFem)} ${this.cfg.fim} se abriu! O chefe espera lá dentro.` : 'O portão selado se abriu! Siga para a próxima etapa.');
  }

  // ---------- grupos (1 por etapa, com líder) ----------
  criarAcampamentos() {
    for (const a of this.plano.acampamentos) this.acampamentos.push({ lx: a.x, lz: a.z, ...this.w(a.x, a.z), etapa: a.etapa, grupo: null, vencido: false });
  }
  atualizarAcampamentos() {
    const m = this.m;
    for (const a of this.acampamentos) {
      const d = Math.hypot(m.pos.x - a.x, m.pos.z - a.z);
      if (a.grupo) {
        // o grupo sumiu do mapa (todos vencidos) ou ficou sem o líder: etapa vencida
        const sumiu = !m.grupos.includes(a.grupo);
        if (sumiu || !a.grupo.membros.some((mb) => mb.dados.lider)) {
          a.vencido = true;
          if (sumiu) a.grupo = null;
          this.abrirPortao(a.etapa);
          continue;
        }
        if (d > 75) { m.removerGrupo(a.grupo); a.grupo = null; }
      } else if (!a.vencido && d < 58) {
        a.grupo = m.spawnarGrupo({ x: a.x, z: a.z, zona: this.cfg.zonaSoltos, niveis: this.niveis(a.etapa), lista: this.cfg.aparicoes, acampamento: a, escalonado: true, finalLider: this.liderFinal() });
      }
    }
  }
  niveis(etapa) { return niveisMasmorraNova(this.m.mediaEquipe(), etapa, this.id, this.nivelMasmorra); }
  liderFinal() { return this.nivelMasmorra >= MASMORRA.finalLider && Math.random() < MASMORRA.chanceFinalLider; }

  // ---------- monstros soltos (na sala onde você está) ----------
  atualizarSoltos() {
    const m = this.m, soltos = m.selvagens.filter((s) => s.dungeon === this);
    for (const s of soltos) if (Math.hypot(s.x - m.pos.x, s.z - m.pos.z) > 62) m.removerSelvagem(s);
    if (soltos.length >= MAX_SOLTOS || Math.random() > 0.04) return;
    const i = this.forma.salaEm(m.pos.x, m.pos.z), sala = this.forma.salas[i];
    if (i < 0 || sala.etapa == null) return;
    const p = this.pontoNaSala(i, 3, Math.random);
    const w = this.w(p.x, p.z), dj = Math.hypot(w.x - m.pos.x, w.z - m.pos.z);
    if (dj < 14 || dj > 45) return;
    if (this.acampamentos.some((a) => a.grupo && Math.hypot(a.x - w.x, a.z - w.z) < 16)) return;
    if (m.obstaculoEm(w.x, w.z, 1.2)) return;
    const nv = Math.min(98, this.niveis(sala.etapa).comum + Math.round(Math.random() * 2));
    const especie = especieDaEscolha(sortear(this.cfg.aparicoes), nv), esp = ESPECIES[especie];
    const dados = criarMonstro(especie, nv), modelo = criarModelo(especie);
    let aura = null;
    if (esp.dupla) { aura = criarAuraDupla(esp.elementos.map((el) => ELEMENTOS[el].cor), esp.raio * 1.5); modelo.add(aura); }
    modelo.position.set(w.x, alturaEm(w.x, w.z), w.z);
    m.cena.add(modelo);
    m.selvagens.push({ dados, modelo, aura, dupla: !!esp.dupla, dungeon: this, x: w.x, z: w.z, ang: Math.random() * 6.28, estado: 'parado', t: Math.random() * 2, zona: this.cfg.zonaSoltos, periodo: null, vel: statsDe(especie, nv).vel * 0.45 });
  }

  // ---------- chefe (salvo na conta, como nas masmorras de hoje) ----------
  get salvo() { return this.m.jogo.estado ? dadosMasmorra(this.m.jogo.estado, this.id) : null; }
  get nivelMasmorra() { return this.salvo?.nivel || 1; }
  idDoChefe() {
    const sv = this.salvo;
    if (!sv) return MASMORRA.chefes[this.id][0][0];
    if (!sv.chefe || !ESPECIES[sv.chefe]) sv.chefe = sortearChefe(this.id, sv.nivel);
    return sv.chefe;
  }
  get nomeChefe() { return ESPECIES[this.chefe?.dados.especie || this.idDoChefe()].nome; }
  prepararChefe() {
    this.esperaAmanhecer = !!this.salvo?.espera;
    this.periodoVisto = this.m.periodo;
    if (!this.esperaAmanhecer) this.spawnarChefe();
  }
  spawnarChefe() {
    const m = this.m, id = this.idDoChefe(), esp = ESPECIES[id], tr = this.plano.trono;
    const dados = criarMonstro(id, nivelChefeMasmorraNova(m.mediaEquipe(), this.id, this.nivelMasmorra));
    dados.chefe = true;                            // Fúria, coroa e o tesouro
    dados.fatorCaptura = MASMORRA_NOVA.captura;    // só com o Supremo, e com metade da chance
    const modelo = criarModelo(id);
    const escala = esp.chefe ? 1 : ESCALA_CHEFE;
    modelo.scale.setScalar(escala);
    const coroa = criarCoroa(1.6 / escala);
    coroa.position.y = esp.altura + 0.2 / escala;
    modelo.add(coroa);
    const w = this.w(tr.x, tr.z);
    modelo.position.set(w.x, alturaEm(w.x, w.z), w.z);
    modelo.rotation.y = tr.ang;
    m.cena.add(modelo);
    this.chefe = { dados, modelo, chefe: true, masmorra: this, fixo: true, x: w.x, z: w.z, ang: tr.ang, estado: 'parado', t: 99, zona: this.cfg.zonaChefe, periodo: null, vel: 0 };
    m.selvagens.push(this.chefe);
  }
  // Ouro do chefe: 300 + 50 por Nível da Masmorra (lido pelo main.js no fim da luta)
  // (vale o nível em que a luta foi: o chefeVencido sobe o nível antes de o ouro ser contado)
  get ouroChefe() { return MASMORRA_NOVA.ouroBase + MASMORRA_NOVA.ouroPorNivel * (this.nivelDaLuta || this.nivelMasmorra); }
  // Vitória contra o chefe (vencido ou capturado): o Nível da Masmorra sobe 1
  chefeVencido() {
    const sv = this.salvo;
    if (!sv) return;
    this.nivelDaLuta = sv.nivel;
    sv.vitorias++;
    sv.chefe = null;
    sv.espera = true;
    if (sv.nivel < MASMORRA.nivelMax) {
      sv.nivel++;
      this.m.jogo.aviso(`${this.cfg.nome} subiu para o Nível ${sv.nivel}! Os monstros de lá ficaram mais fortes.`);
      if (sv.nivel === MASMORRA.finalLider) this.m.jogo.aviso('Agora os líderes de lá podem vir na forma final.');
    }
  }
  atualizarChefe() {
    const m = this.m;
    if (this.chefe && !m.selvagens.includes(this.chefe)) {
      this.chefe = null;
      this.esperaAmanhecer = true;
      this.periodoVisto = m.periodo;
      if (m.jogo.estado) m.jogo.aviso('O portal de saída se abriu no trono.');
    }
    if (!this.chefe && this.esperaAmanhecer && m.periodo !== this.periodoVisto) {
      this.periodoVisto = m.periodo;
      if (m.periodo === 'dia') {
        this.esperaAmanhecer = false;
        if (this.salvo) this.salvo.espera = false;
        this.spawnarChefe();
        if (m.jogo.estado) m.jogo.aviso(`${this.nomeChefe} é o novo chefe ${com('de', this.cfg.fimFem)} ${this.cfg.fim}.`);
      }
    }
    if (this.chefe) {
      animarModelo(this.chefe.modelo, this.tempo, false);
      this.chefe.modelo.position.y = alturaEm(this.chefe.x, this.chefe.z);
    }
  }

  // ---------- saídas: a porta da entrada e o portal do trono ----------
  criarSaidas() {
    const P = this.plano;
    this.saidaInicio = { ...this.w(P.saida.x, P.saida.z), r: P.saida.r ?? 2.2 };
    // o portal do trono (aparece quando o chefe não está lá)
    const pt = P.portal, w = this.w(pt.x, pt.z), y = this.y(pt.x, pt.z);
    this.portal = new THREE.Group();
    const anel = new THREE.Mesh(this.geo(new THREE.TorusGeometry(2, 0.3, 6, 18)), this.brilho(P.corSelo, 0.9));
    anel.position.y = 2.4;
    const miolo = new THREE.Mesh(this.geo(new THREE.CircleGeometry(1.75, 18)), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
    this.mats.set('portal', miolo.material);
    miolo.position.y = 2.4;
    this.portal.add(anel, miolo);
    this.portal.position.set(w.x, y, w.z);
    this.portal.rotation.y = pt.ang || 0;
    this.portal.visible = false;
    this.grupo.add(this.portal);
    this.portalPos = { x: w.x, z: w.z };
    this.armadoSaida = false;
  }
  atualizarSaidas(dt) {
    const m = this.m, est = m.jogo.estado;
    this.portal.visible = !this.chefe;
    if (this.portal.visible) { this.portal.children[0].rotation.z += dt * 1.5; this.portal.children[1].material.opacity = 0.4 + Math.sin(this.tempo * 3) * 0.15; }
    const dS = Math.hypot(m.pos.x - this.saidaInicio.x, m.pos.z - this.saidaInicio.z);
    if (dS > this.saidaInicio.r + 2) this.armadoSaida = true;
    if (!est || this.g.mudando) return;
    if (this.armadoSaida && dS < this.saidaInicio.r) { this.g.sair(); return; }
    if (this.portal.visible && Math.hypot(m.pos.x - this.portalPos.x, m.pos.z - this.portalPos.z) < 1.8) this.g.sair();
  }

  // ---------- clima de cada sala (céu, névoa, luz e partículas) ----------
  criarParticulas() {
    const n = 260, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() * 2 - 1) * 26; pos[i * 3 + 1] = Math.random() * 16; pos[i * 3 + 2] = (Math.random() * 2 - 1) * 26; }
    const g = this.geo(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.particulas = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.3, color: '#ffffff', transparent: true, opacity: 0.85, depthWrite: false }));
    this.mats.set('particulas', this.particulas.material);
    this.particulas.frustumCulled = false;
    this.grupo.add(this.particulas);
  }
  moverParticulas(dt, tema) {
    const m = this.m, p = this.particulas.geometry.attributes.position, a = p.array, t = this.tempo;
    this.particulas.position.set(m.pos.x, m.pos.y, m.pos.z);
    const neve = tema.part === 'neve', sobe = tema.part === 'faisca', nevasca = tema.part === 'nevasca', poeira = tema.part === 'poeira';
    for (let i = 0; i < p.count; i++) {
      const k = i * 3;
      if (nevasca) { a[k + 1] -= dt * 3; a[k] += dt * 9; a[k + 2] += Math.sin(t * 2 + i) * dt * 1.5; }   // vento forte
      else if (poeira) { a[k] += dt * 3.5; a[k + 1] += Math.sin(t + i) * dt * 0.6; }                    // areia no vento
      else if (neve) { a[k + 1] -= dt * 2.2; a[k] += dt * 1.6; a[k + 2] += Math.sin(t + i) * dt * 0.5; }
      else if (sobe) { a[k + 1] += dt * (0.8 + (i % 5) * 0.3); a[k] += Math.sin(t * 3 + i) * dt * 0.8; }
      else { a[k + 1] += Math.sin(t * 0.8 + i) * dt * 0.4; a[k] += Math.cos(t * 0.6 + i) * dt * 0.3; }
      if (a[k + 1] > 16) a[k + 1] -= 16; else if (a[k + 1] < 0) a[k + 1] += 16;
      if (a[k] > 26) a[k] -= 52; else if (a[k] < -26) a[k] += 52;
      if (a[k + 2] > 26) a[k + 2] -= 52; else if (a[k + 2] < -26) a[k + 2] += 52;
    }
    p.needsUpdate = true;
  }
  prepararClima() {
    const t = this.plano.temas[this.forma.salas[0].tema];
    this.clima = { ceu: new THREE.Color(t.ceu), hemi: new THREE.Color(t.hemi), int: t.luz, sol: t.sol, perto: t.nevoa[0], longe: t.nevoa[1] };
  }
  atualizarClima(dt) {
    const m = this.m, sala = this.forma.salas[this.forma.salaPerto(m.pos.x, m.pos.z)], tema = this.plano.temas[sala.tema];
    const k = 1 - Math.exp(-2.2 * dt), C = this.clima;
    c4.set(tema.ceu);
    const aberto = sala.ceuAberto ?? sala.tipo !== 'gruta'; // céu aberto: escurece à noite
    if (aberto) c4.lerp(c3.set('#1b2550'), m.fatorNoite * 0.55);
    C.ceu.lerp(c4, k);
    C.hemi.lerp(c4.set(tema.hemi), k);
    C.int += (tema.luz * (aberto ? 1 - m.fatorNoite * 0.4 : 1) - C.int) * k;
    C.sol += (tema.sol * (aberto ? 1 - m.fatorNoite * 0.5 : 1) - C.sol) * k;
    C.perto += (tema.nevoa[0] - C.perto) * k;
    C.longe += (tema.nevoa[1] - C.longe) * k;
    m.cena.background.copy(C.ceu);
    m.cena.fog.color.copy(C.ceu);
    m.cena.fog.near = C.perto;
    m.cena.fog.far = Math.min(C.longe, m.nevoa + 20);
    m.hemi.color.copy(C.hemi);
    m.hemi.intensity = C.int + (this.flash > 0 ? 2.4 * this.flash / 0.15 : 0);
    m.sol.intensity = C.sol;
    m.estrelas.material.opacity = 0;
    this.flash = Math.max(0, (this.flash || 0) - dt);
    // relâmpagos onde o tema pede (o Trono da Tempestade)
    if (tema.relampagos) { this.proxFlash = (this.proxFlash ?? 3) - dt; if (this.proxFlash <= 0) { this.flash = 0.15; this.proxFlash = 2 + Math.random() * 4; } }
    const pm = this.particulas.material;
    pm.color.set(tema.corPart || '#ffffff');
    pm.size = tema.part === 'neve' || tema.part === 'nevasca' ? 0.3 : tema.part === 'poeira' ? 0.16 : 0.2;
    this.particulas.visible = tema.part !== 'nenhuma';
    if (this.particulas.visible) this.moverParticulas(dt, tema);
  }

  // ---------- avisos de etapa ----------
  etapaAqui() {
    const i = this.forma.salaEm(this.m.pos.x, this.m.pos.z);
    if (i < 0) return null;
    const s = this.forma.salas[i];
    return s.etapa != null ? s.etapa : s.fim ? 'fim' : null;
  }
  nomeAqui() {
    const e = this.etapaAqui();
    if (e === 'fim') return this.cfg.fim;
    if (e != null) return this.cfg.etapas[e].nome.replace(/^Etapa \d+ · /, '');
    return this.cfg.nome;
  }
  avisarEtapa() {
    const m = this.m, e = this.etapaAqui();
    if (e == null || e === this.etapaAvisada || !m.jogo.estado) return;
    this.etapaAvisada = e;
    if (e === 'fim') {
      if (this.chefe) m.jogo.aviso(`O chefe ${this.nomeChefe} (Nv.${this.chefe.dados.nivel}) espera ${com('em', this.cfg.fimFem)} ${this.cfg.fim}. Encoste nele para lutar.`);
      else m.jogo.aviso(`${com('O', this.cfg.fimFem)} ${this.cfg.fim} está ${this.cfg.fimFem ? 'vazia' : 'vazio'}. Um novo chefe chega no próximo amanhecer. Use o portal para sair.`);
      return;
    }
    const nv = this.niveis(e), a = this.acampamentos.find((x) => x.etapa === e);
    m.jogo.aviso(`${this.cfg.etapas[e].nome}: comuns Nv.${nv.comum}, líder Nv.${nv.lider}.`);
    if (a && !a.vencido) m.jogo.aviso('Vença o líder do grupo para abrir o portão selado.');
  }
  // Encostou num portão fechado: lembra o que fazer
  avisarPortao(dt) {
    this.avisoPortaoT = Math.max(0, this.avisoPortaoT - dt);
    if (this.avisoPortaoT > 0 || !this.m.jogo.estado) return;
    const m = this.m;
    for (const p of this.portoes) {
      if (p.aberto) continue;
      if (Math.hypot(m.pos.x - this.o.x - p.lx, m.pos.z - this.o.z - p.lz) < 4) {
        m.jogo.aviso('Portão selado: vença o líder do grupo desta etapa para abrir.');
        this.avisoPortaoT = 6;
        return;
      }
    }
  }

  // ---------- quadro a quadro ----------
  atualizar(dt, t, pausado) {
    this.tempo = t;
    this.atualizarClima(dt);
    for (const p of this.portoes) {
      if (!p.aberto || p.abrir >= 1) continue;
      p.abrir = Math.min(1, p.abrir + dt * 0.8);
      p.parede.material.opacity = 0.42 * (1 - p.abrir);
      p.parede.scale.y = Math.max(0.01, 1 - p.abrir);
      if (p.abrir >= 1) p.parede.visible = false;
    }
    for (const p of this.portoes) if (!p.aberto) p.parede.material.opacity = 0.34 + Math.sin(t * 2.5) * 0.08; // o selo pulsa
    for (const fn of this.animados) fn(dt, t);
    if (pausado) return;
    this.avisarEtapa();
    this.avisarPortao(dt);
    this.atualizarAcampamentos();
    this.atualizarSoltos();
    this.atualizarChefe();
    this.atualizarSaidas(dt);
  }

  // ---------- apagar tudo (ao sair) ----------
  destruir() {
    const m = this.m;
    for (const a of this.acampamentos) if (a.grupo && m.grupos.includes(a.grupo)) m.removerGrupo(a.grupo);
    for (const s of m.selvagens.filter((x) => x.dungeon === this || x === this.chefe)) m.removerSelvagem(s);
    // grupos que sobraram de uma luta (sem o acampamento) também saem
    for (const g of m.grupos.filter((x) => x.acampamento && this.acampamentos.includes(x.acampamento))) m.removerGrupo(g);
    for (const o of this.obstaculos) m.obstaculos.tirar(o);
    this.obstaculos = [];
    m.cena.remove(this.grupo);
    this.grupo.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
    for (const g of this.geos) g.dispose();
    for (const mt of this.mats.values()) mt.dispose();
    // os blocos (portões) têm materiais e geometrias próprios
    for (const p of this.portoes) { for (const mt of p.blk.mats) mt.dispose(); p.blk.grupo.traverse((o) => o.isMesh && o.geometry.dispose()); }
    for (const b of this.blocos || []) { for (const mt of b.mats) mt.dispose(); b.grupo.traverse((o) => o.isMesh && o.geometry.dispose()); }
    if (INTERIOR.forma === this.forma) INTERIOR.forma = null;
    const c = this.forma.caixa;
    esquecerAlturas(this.o.x + c.x0 - 40, this.o.z + c.z0 - 40, this.o.x + c.x1 + 40, this.o.z + c.z1 + 40);
  }
}

// =============================================================
// O gerente: as entradas no mapa, entrar e sair
// =============================================================
export class Masmorras {
  constructor(mundo) {
    this.m = mundo;
    this.ativa = null;
    this.mudando = false;
    this.entradas = [];
    this.grupo = new THREE.Group();
    this.grupo.name = 'entradas-masmorras';
    mundo.cena.add(this.grupo);
    for (const [id, cfg] of Object.entries(MASMORRAS_NOVAS)) {
      const plano = PLANOS[id];
      if (!plano) continue;
      const lugar = LUGARES.filter((l) => l.tipo === 'masmorra' && l.bioma === cfg.bioma)[cfg.lugar - 1];
      if (!lugar) continue;
      // a porta olha para o centro do mapa (de onde o jogador vem)
      const ang = Math.atan2(-lugar.x, -lugar.z);
      const e = { id, cfg, x: lugar.x, z: lugar.z, ang };
      e.porta = { x: lugar.x + Math.sin(ang) * 3.2, z: lugar.z + Math.cos(ang) * 3.2 };   // onde encostar
      e.fora = { x: lugar.x + Math.sin(ang) * 7, z: lugar.z + Math.cos(ang) * 7 };        // onde você aparece ao sair
      const b = new Bloco();
      plano.entrada(b, { x: lugar.x, z: lugar.z, ang, y: (x, z) => alturaEm(x, z), obst: (x, z, r) => mundo.obstaculos.push({ x, z, r }) });
      e.blk = b.montar(this.grupo);
      this.entradas.push(e);
    }
  }

  entrada(id) { return this.entradas.find((e) => e.id === id); }

  // Onde o jogo salva a posição (dentro da masmorra, salva na porta de fora)
  posSalvar() {
    if (!this.ativa) return null;
    const e = this.entrada(this.ativa.id);
    return { x: e.fora.x, z: e.fora.z };
  }

  // Ao começar ou continuar um jogo: nenhuma masmorra aberta
  resetar() {
    if (!this.ativa) return;
    this.ativa.destruir();
    this.ativa = null;
  }

  // Tela preta rápida (some aos poucos depois)
  cortina() {
    const el = document.getElementById('cortina');
    if (!el) return;
    el.style.transition = 'none';
    el.style.opacity = '1';
    void el.offsetWidth;
    setTimeout(() => { el.style.transition = 'opacity .6s ease'; el.style.opacity = '0'; }, 80);
  }

  // Entra (onde: 'inicio', uma etapa 0..4 ou 'chefe'; o GM usa as outras)
  entrar(id, onde = 'inicio') {
    if (!PLANOS[id] || this.mudando) return;
    this.mudando = true;
    this.cortina();
    const m = this.m;
    m.jogo.pet?.voltarAoTreinador?.(true);
    this.resetar();
    const ms = new MasmorraNova(this, id);
    ms.construir();
    this.ativa = ms;
    const P = ms.plano;
    let p = P.inicio, ang = P.inicio.ang;
    if (onde === 'chefe') { p = ms.pontoPerto(P.trono, 12); ang = P.trono.ang + Math.PI; }
    else if (onde === 'fim') { p = ms.pontoPerto(P.acampamentos.at(-1), 22); }
    else if (typeof onde === 'number') { const a = P.acampamentos[onde]; p = { x: a.x, z: a.z + 20 }; }
    const w = ms.w(p.x, p.z);
    m.pos.set(w.x, 0, w.z);
    if (typeof onde === 'number' || onde === 'chefe') { const q = { x: w.x, z: w.z }; m.colidir(q, 0.6); m.pos.set(q.x, 0, q.z); }
    m.ang = ang;
    m.orbita.yaw = ang + Math.PI;
    m.orbita.voltarPara = null;
    m.graca = 2.5;
    m.chunks.atualizar(m.pos.x, m.pos.z); // o mapa de fora fica longe: os chunks são apagados
    m.posicionarCamera(1);
    m.zonaAvisada = null;
    m.jogo.mostrarZona?.(ms.cfg.nome + ' · Nível ' + ms.nivelMasmorra);
    if (m.jogo.estado) m.jogo.aviso(`Você entrou ${com('em', ms.cfg.fem)} ${ms.cfg.nome}. Encoste na porta de luz para sair a qualquer hora.`);
    this.mudando = false;
  }

  // Sai (para a frente da porta, no mapa). Se você saiu por outro jeito (desmaiou, GM), só apaga.
  sair(paraPorta = true) {
    if (!this.ativa) return;
    const m = this.m, e = this.entrada(this.ativa.id);
    if (paraPorta) this.cortina();
    m.jogo.pet?.voltarAoTreinador?.(true);
    this.ativa.destruir();
    this.ativa = null;
    if (paraPorta) {
      m.pos.set(e.fora.x, 0, e.fora.z);
      m.ang = e.ang;
      m.orbita.yaw = e.ang + Math.PI;
      m.graca = 2.5;
      m.jogo.aviso(`Você saiu ${com('de', e.cfg.fem)} ${e.cfg.nome}.`);
    }
    m.chunks.carregarTudoPerto(m.pos.x, m.pos.z);
    m.zonaAvisada = null;
    m.posicionarCamera(1);
    m.jogo.salvar?.();
  }

  atualizar(dt, t, pausado) {
    const m = this.m, est = m.jogo.estado;
    if (this.ativa) {
      // saiu da área (desmaiou e renasceu fora, ou o GM levou para outro lugar): apaga a masmorra
      if (!this.ativa.forma.contem(m.pos.x, m.pos.z)) { this.sair(false); return; }
      this.ativa.atualizar(dt, t, pausado);
      return;
    }
    if (!est || pausado) return;
    for (const e of this.entradas) {
      const d = Math.hypot(m.pos.x - e.x, m.pos.z - e.z);
      if (d > DIST_DESCOBRIR + 5) continue;
      const sv = dadosMasmorra(est, e.id);
      if (!sv.achada && d < DIST_DESCOBRIR) {
        sv.achada = true;
        m.jogo.mostrarZona?.(e.cfg.nome);
        m.jogo.aviso(`Você descobriu ${com('o', e.cfg.fem)} ${e.cfg.nome}! Masmorra difícil · Nível ${sv.nivel}.`);
        m.jogo.salvar?.();
      }
      if (m.graca <= 0 && Math.hypot(m.pos.x - e.porta.x, m.pos.z - e.porta.z) < 1.9) { this.entrar(e.id); return; }
    }
  }
}

// Um ponto andável perto de outro (para o GM): primeiro na frente dele (para onde ele olha)
MasmorraNova.prototype.pontoPerto = function (p, dist) {
  for (let t = 0; t < 24; t++) {
    const a = (p.ang || 0) + (t % 2 ? 1 : -1) * Math.ceil(t / 2) * 0.26;
    const x = p.x + Math.sin(a) * dist, z = p.z + Math.cos(a) * dist;
    if (this.d(x, z) < -2) return { x, z };
  }
  return { x: p.x, z: p.z };
};
