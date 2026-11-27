// =============================================================
// MUNDO ABERTO (mapa procedural)
// O mapa é gerado pela semente (js/mapa/): Campo no meio (com a fonte) e os
// biomas em volta: Floresta (planta), Deserto (terra), Picos Nevados (raio)
// e Vulcão (fogo), com rios, lagos (Lago = água) e lagos congelados.
// O chão e os objetos vêm em chunks (js/mapa/chunks.js): só o que está perto existe.
// Ciclo de dia e noite: Sol e Luz aparecem de dia; Lua e Trevas à noite.
// Monstros selvagens passeiam; encostou, começa a batalha.
// =============================================================
import * as THREE from 'three';
import { criarModelo, criarTreinador, criarCristal, pintarCristal, criarCoroa, criarCasa, animarCasa, criarBandeira, animarBandeira, animarModelo, criarAuraDupla, animarAura, descartar } from './modelos.js';
import { CameraOrbita } from './camera.js';
import { TRACADOS, REINO, tracadoPerto, prenderDungeons, dentroDungeonLivre, semCasaDungeons } from './dungeon.js';
import { Vilas, saidaDaArena, TREINADORES_VILA } from './vilas.js';
import { CaminhoDasBrasas } from './brasas.js';
import { TrilhaAncestral, CRISTAL_ESCONDIDO } from './raizes.js';
import { BiomaGelo } from './biomas/gelo.js';
import { BiomaFloresta } from './biomas/floresta.js';
import { BiomaDeserto } from './biomas/deserto.js';
import { BiomaVulcao } from './biomas/vulcao.js';
import { BiomaArquipelago } from './biomas/arquipelago.js';
import { ClimaBiomas } from './biomas/clima.js';
import { Reino, FONTE_REINO, NASCER_REINO, ARENA_REINO, CASA_REINO, nivelRevanche } from './reino.js';
import { JardimMundo, passarFome } from './jardim.js';
import { RAIO_MUNDO, NIVEL_AGUA, SEMENTE, LAGOA, RESERVAS, SEGREDOS, ESTRADA, RAIO_REINO, ANEL_TRANQUILO, aleatorio, biomaEm, lagoEm, geloEm, naEstradaReal } from './mapa/gerador.js';
import { alturaEm, bloqueadoEm } from './mapa/altura.js';
import { Grade, ListaObstaculos } from './mapa/grade.js';
import { Chunks } from './mapa/chunks.js';
import { interiorEm } from './masmorras/forma.js';
import { Masmorras } from './masmorras/masmorra.js';
import { lerQualidade } from './mapa/config.js';
import { ESPECIES, ELEMENTOS, APARICOES, PERIODO_DA_LINHA, DUPLAS, ORDEM_DUPLAS, INTERVALO_DUPLO, CRISTAIS, criarMonstro, statsDe, formaPorNivel, especieDaEscolha, nomeTipo, tetoSuave } from './dados.js';

export { RAIO_MUNDO, alturaEm, SEMENTE };
const NA_ZONA = { campo: 'no Campo', agua: 'no Lago', fogo: 'no Vulcão', planta: 'na Floresta', terra: 'no Deserto', raio: 'nos Picos Nevados' };
export const NOMES_ZONA = { campo: 'Reino', agua: 'Lago', arquipelago: 'Arquipélago', fogo: 'Vulcão', planta: 'Floresta', terra: 'Deserto', raio: 'Picos Nevados' };
const N_CRISTAIS = 110;       // cristais de captura espalhados pelo mapa (o mundo novo é quase 4 vezes maior)
const VER_CRISTAL = 75;       // até essa distância os cristais são desenhados
const VEL_JOGADOR = 7.5;
const AGUA_RASA = 0.65;      // na água rasa o jogador anda a 65% da velocidade
const MAX_SELVAGENS = 18;     // monstros soltos em volta do jogador (aparecem perto e somem quando ficam longe)
const RAIO_BANDEIRA = 0.8;    // tamanho da bandeira do Reino para colisão (ela não cura: a cura é a fonte do castelo)
const AREA_SEGURA_BANDEIRA = 10; // monstros não chegam perto da bandeira (onde você renasce)
const RAIO_CASA = 3.2;        // a casa do jogador no Reino (fixa) para colisão
const TAMANHO_GRUPO = 6;      // 5 comuns + 1 líder

// Quantos grupos andam pelo mapa: aumenta com o nível médio da sua equipe (máximo 4)
export function gruposDesejados(media) {
  return Math.min(4, 1 + Math.floor((media - 1) / 5));
}
// Espaço entre os grupos no mapa (de centro a centro, em metros)
const DIST_NASCER_GRUPOS = 40; // um grupo novo só aparece a pelo menos 40 m dos outros
const DIST_AFASTAR_GRUPOS = 32; // andando, se chegam mais perto que isso, se afastam
function raioMembro(m) { return ESPECIES[m.dados.especie].raio * (m.dados.lider ? 1.3 : 1); }
// Grupos: cada monstro anda sozinho (posição, direção, ritmo e animação próprios),
// mas em duplas soltas: ~2 m do parceiro e pelo menos 5 m das outras duplas
// (medidos entre os corpos). Todos ficam numa área em volta do "ponto" do grupo.
const DUPLA_MIN = 1.5, DUPLA_MAX = 3.5;   // espaço com o parceiro (alvo: ~2 m)
const ESPACO_ENTRE_DUPLAS = 5;            // espaço mínimo até os monstros das outras duplas
const RAIO_AREA_GRUPO = 11;               // até onde cada um se afasta do ponto do grupo
const PERSEGUE_GRUPO = 10, PERSEGUE_ACAMPAMENTO = 7; // a que distância do monstro mais perto o grupo vem atrás de você
// Níveis do grupo. Começo do jogo (equipe ~Nv.3): comuns ~Nv.5, líder ~Nv.12.
// Até o Nv.50 vale o teto de antes (48/50); depois acompanham a equipe, até o Nv.98/100.
export function niveisDoGrupo(media) {
  const comum = Math.round(tetoSuave(media * 1.1 + 2, 48, media, 3));
  const lider = Math.round(tetoSuave(media * 1.4 + 8, 50, media, 5));
  return { comum: Math.min(98, comum), lider: Math.min(100, lider) };
}
// Os selvagens soltos do mapa vão até o Nv.95 (e nunca na forma final)
export const NIVEL_MAX_SELVAGEM = 95;
// Cristais do chão: a cor mostra o tipo (sorteado de novo cada vez que reaparece)
function sortearTipoCristal() {
  const r = Math.random();
  return r < 0.05 ? 2 : r < 0.22 ? 1 : 0;
}
function sortearLista(lista) {
  const total = lista.reduce((t, [, w]) => t + w, 0);
  let r = Math.random() * total;
  for (const [e, w] of lista) { r -= w; if (r <= 0) return e; }
  return lista[0][0];
}
// Estrada Real: nenhum selvagem nasce nela nem chega perto (é segura, como a casa)
const SEGURA_ESTRADA = ESTRADA.largura + 4;
function naEstrada(x, z, folga = 0) { const e = naEstradaReal(x, z); return e.dentro && e.lat < SEGURA_ESTRADA + folga; }
// Anel tranquilo: logo depois dos portões do Reino só aparecem monstros fracos (formas iniciais), sem grupos
const FIM_ANEL = RAIO_REINO + ANEL_TRANQUILO;
export function pertoDoReino(x, z) { return Math.hypot(x, z) < FIM_ANEL; }
export const DURACAO_DIA = 240; // segundos para um ciclo completo (metade dia, metade noite)

const CEU_DIA = new THREE.Color('#9fd8ff'), CEU_NOITE = new THREE.Color('#1b2550');
const HEMI_DIA = new THREE.Color('#d6f0ff'), HEMI_NOITE = new THREE.Color('#8f9fe0');
const SOL_DIA = new THREE.Color('#fff1d6'), SOL_NOITE = new THREE.Color('#a8b8ff');
// A fonte de cura fica na praça do castelo, no Reino (o novo centro do jogo)
export const FONTE = REINO.paraMundo(FONTE_REINO.x, FONTE_REINO.z);
export const NASCER = REINO.paraMundo(NASCER_REINO.x, NASCER_REINO.z);
export const ANG_NASCER = Math.atan2(FONTE.x - NASCER.x, FONTE.z - NASCER.z); // de frente para a fonte e o castelo

export function zonaEm(x, z) {
  const f = interiorEm(x, z); // dentro de uma masmorra nova
  if (f) return f.zona;
  const t = tracadoPerto(x, z); // dentro (ou na boca) de uma dungeon aberta
  if (t) return t.zona;
  const L = lagoEm(x, z, 12, 'agua');
  if (L && !L.escondido && (!L.oasis || Math.hypot(x - L.x, z - L.z) < L.r + 5)) return 'agua'; // em volta dos lagos: região do Lago (o oásis é pequeno)
  return biomaEm(x, z);
}

function lerpAngulo(a, b, k) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}

export class Mundo {
  constructor(jogo) {
    this.jogo = jogo;
    this.cena = new THREE.Scene();
    this.cena.background = CEU_DIA.clone();
    this.cena.fog = new THREE.Fog(CEU_DIA.clone(), 40, 115);
    this.camera = new THREE.PerspectiveCamera(50, jogo.aspecto || 1, 0.1, 300); // a proporção da tela (larga, deitado)
    this.orbita = new CameraOrbita(0); // câmera em terceira pessoa que o jogador gira
    this.hemi = new THREE.HemisphereLight(HEMI_DIA.clone(), '#5d7a3e', 1.7);
    this.sol = new THREE.DirectionalLight(SOL_DIA.clone(), 1.9);
    this.sol.position.set(30, 50, 20);
    this.cena.add(this.hemi, this.sol);

    this.rng = aleatorio(SEMENTE ^ 0x2f1);
    this.grade = new Grade();                                // todos os obstáculos, separados em quadradinhos
    this.obstaculos = new ListaObstaculos().ligar(this.grade); // os fixos (fonte, casa, dungeons)
    this.reservas = [];                                      // lugares sem árvore (cristais)
    this.nomesLugares = [];                                  // lugares com nome próprio na tela (Pântano das Lanternas Azuis...)
    this.refugios = [];                                      // lugares seguros fora do Reino (o Acampamento do Gelo): nenhum selvagem entra
    this.criarAgua();
    this.criarFonte();
    this.dungeon = new CaminhoDasBrasas(this, alturaEm);
    this.floresta = new TrilhaAncestral(this, alturaEm);
    this.dungeons = [this.dungeon, this.floresta];
    this.reino = new Reino(this, alturaEm);
    this.vilas = new Vilas(this); // as 5 vilas (uma em cada bioma), com loja e arena
    this.masmorras = new Masmorras(this); // as masmorras novas: a entrada no mapa e a área separada
    this.gelo = new BiomaGelo(this); // as peças únicas do Gelo (acampamento, trilha, lago, arco, fonte termal) e a neve caindo
    this.floresta2 = new BiomaFloresta(this); // as peças únicas da Floresta (Catedral das Cortinas, Pontes de Raiz, Pântano das Lanternas Azuis)
    this.deserto = new BiomaDeserto(this); // as peças únicas do Deserto (o caminho até as pirâmides, o oásis, a caravana) e a tempestade de Khamsin
    this.vulcao = new BiomaVulcao(this); // as peças únicas do Vulcânico (a Forja Primordial, o Monte Vael, a Bacia do Vitriol...) e a Chuva de Cinzas
    this.arquipelago = new BiomaArquipelago(this); // as peças únicas do Arquipélago (a Enseada dos Bangalôs, a Ilha da Cachoeira, o farol...), os veleiros e a chuva com arco-íris
    this.clima = new ClimaBiomas(this); // a cor do céu e da luz de cada bioma
    this.criarMontanhas();
    this.criarEstrelas();

    this.jogador = criarTreinador();
    this.cena.add(this.jogador);
    this.pos = new THREE.Vector3(NASCER.x, 0, NASCER.z);
    this.ang = ANG_NASCER;
    this.graca = 0;
    this.avisoT = 0;
    this.hora = 0.08; // 0 a 1: menos de 0.5 é dia
    this.fatorNoite = 0;
    this.relampago = 0;
    this.proxRelampago = 3;
    this.periodoAvisado = this.periodo;

    // Bandeira do Reino (portátil): começa guardada (na mochila). É onde você renasce.
    this.bandeira = criarBandeira();
    this.bandeira.visible = false;
    this.cena.add(this.bandeira);
    this.bandeiraPos = null;
    this.bandeiraObst = null;
    this.bandeiraAnim = 1;

    // A casa do jogador: fixa no Reino (lugar CASA_REINO), sobe de nível de 1 a 5
    const pc = REINO.paraMundo(CASA_REINO.x, CASA_REINO.z);
    this.casaPos = { x: pc.x, z: pc.z, rot: CASA_REINO.rot + REINO.giro }; // giro: do desenho do Reino para o mapa
    this.casaAnim = 1;
    this.casa = criarCasa(1);
    this.cena.add(this.casa);
    this.casa.position.set(pc.x, alturaEm(pc.x, pc.z), pc.z);
    this.casa.rotation.y = this.casaPos.rot;
    this.obstaculos.push({ x: pc.x, z: pc.z, r: RAIO_CASA });
    this.jardim3d = new JardimMundo(this); // os canteiros na frente da casa (jardim.js)

    this.cristais = [];
    this.criarCristaisChao();
    // o chão e os objetos vêm em chunks, em volta do jogador
    this.chunks = new Chunks(this, lerQualidade());
    this.aplicarQualidade();
    this.chunks.carregarTudoPerto(this.pos.x, this.pos.z);
    this.selvagens = [];
    this.grupos = [];
    this.timerSpawn = 0;
    this.timerGrupo = 0;
    this.contaSpawn = 0; // a cada 10 monstros que aparecem, 1 é de tipo duplo
    this.povoar();
    this.atualizarCeu(0);
    this.posicionarCamera(1);
  }

  get periodo() { return this.hora < 0.5 ? 'dia' : 'noite'; }
  zona(x, z) { return zonaEm(x, z); }

  // ---------- construção do cenário ----------
  // Qualidade gráfica (fraco, médio, forte): distância de visão e chunks carregados
  aplicarQualidade(q) {
    if (q) this.chunks.definirQualidade(q);
    this.nevoa = this.chunks.q.nevoa;
    this.camera.far = this.nevoa + 40;
    this.camera.updateProjectionMatrix();
    this.chunks.carregarTudoPerto(this.pos.x, this.pos.z);
  }

  // A água dos rios e lagos vem nos chunks; aqui só o lago escondido da Floresta (verde-água)
  criarAgua() {
    const a = new THREE.Mesh(
      new THREE.CircleGeometry(LAGOA.r + 3, 28),
      new THREE.MeshLambertMaterial({ color: '#3ab8b0', transparent: true, opacity: 0.82, flatShading: true, emissive: '#0a4a4a', emissiveIntensity: 0.4 }),
    );
    a.rotation.x = -Math.PI / 2;
    a.position.set(LAGOA.x, NIVEL_AGUA, LAGOA.z);
    this.cena.add(a);
    this.aguas = [a];
  }

  criarEstrelas() {
    const n = 420, pos = new Float32Array(n * 3), rng = aleatorio(99);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2, el = 0.15 + rng() * 1.3, r = 150;
      pos[i * 3] = Math.cos(a) * Math.cos(el) * r;
      pos[i * 3 + 1] = Math.sin(el) * r;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(el) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.estrelas = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    this.cena.add(this.estrelas);
  }

  pontoLivre(x, z, folga) {
    if (Math.hypot(x, z) < 13) return false;
    if (interiorEm(x, z)) return false; // as masmorras novas cuidam dos monstros delas
    if (TRACADOS.some((t) => t.reservado(x, z))) return false; // as dungeons e o Reino se decoram sozinhos
    if (naEstrada(x, z, folga)) return false; // a Estrada Real fica livre
    if (this.refugioEm(x, z, folga)) return false; // nem nos refúgios (o Acampamento do Gelo)
    if (this.bandeiraPos && Math.hypot(x - this.bandeiraPos.x, z - this.bandeiraPos.z) < AREA_SEGURA_BANDEIRA + 4) return false;
    if (Math.hypot(x, z) > RAIO_MUNDO - 3) return false;
    if (alturaEm(x, z) < NIVEL_AGUA + 0.2) return false; // água, lava e leito de rio
    // lugares fixos da Floresta e pontos de interesse
    for (const r of RESERVAS) if (Math.hypot(x - r.x, z - r.z) < r.r + folga) return false;
    return !this.grade.cada(x, z, folga, (o) => Math.hypot(x - o.x, z - o.z) < o.r + folga);
  }

  // O lugar com nome próprio em que o ponto está (ou null)
  lugarNomeado(x, z) {
    for (const l of this.nomesLugares) if (Math.hypot(x - l.x, z - l.z) < l.r) return l.nome;
    return null;
  }

  // O refúgio em que o ponto está (folga = metros a mais em volta)
  refugioEm(x, z, folga = 0) {
    for (const r of this.refugios) if (Math.hypot(x - r.x, z - r.z) < r.r + folga) return r;
    return null;
  }

  // Algum obstáculo bate num círculo? (usado pelo modo treino)
  obstaculoEm(x, z, raio) {
    return this.grade.cada(x, z, raio, (o) => Math.hypot(x - o.x, z - o.z) < o.r + raio);
  }

  // Montanhas em volta do mapa (fora da borda) e dos dois lados das dungeons.
  // São poucas peças iguais num lote só (1 desenho).
  criarMontanhas() {
    const rng = this.rng;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();
    const eixoY = new THREE.Vector3(0, 1, 0);
    const cor = new THREE.Color();
    const NM = Math.round((Math.PI * 2 * RAIO_MUNDO) / 13);
    const extras = [];
    for (const t of TRACADOS) if (t !== REINO) for (let sd = 90; sd < 215; sd += 8) for (const lado of [-1, 1]) extras.push([t, sd, lado]);
    const NR = 0; // (o Reino agora fica no meio do mapa: sem montanhas em volta)
    const monts = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 6), new THREE.MeshLambertMaterial({ flatShading: true }), NM + extras.length + NR);
    let nm = 0;
    for (let i = 0; i < NM; i++) {
      const a = (i / NM) * Math.PI * 2 + rng() * 0.1;
      // boca das dungeons: sem montanha
      if (TRACADOS.some((t) => t !== REINO && Math.abs(Math.atan2(Math.sin(a - t.angulo), Math.cos(a - t.angulo))) < 0.3 * 200 / RAIO_MUNDO)) continue;
      const r = RAIO_MUNDO + 6 + rng() * 8;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const larg = 9 + rng() * 7, alt = 10 + rng() * 12;
      q.setFromAxisAngle(eixoY, rng() * 6);
      m4.compose(v.set(x, alturaEm(x, z) + alt / 2 - 1, z), q, s.set(larg, alt, larg));
      monts.setMatrixAt(nm, m4);
      const zn = biomaEm(x * 0.9, z * 0.9);
      monts.setColorAt(nm++, cor.set(zn === 'fogo' ? '#6a4a3a' : zn === 'raio' ? (rng() < 0.5 ? '#e8f0f8' : '#c8d6e6') : zn === 'terra' ? '#c49a62' : zn === 'planta' ? (rng() < 0.5 ? '#3f6a3a' : '#4a7a44') : (rng() < 0.5 ? '#7fa36a' : '#8fb07a')));
    }
    // montanhas dos dois lados de cada dungeon (vulcânicas nas Brasas, morros de floresta na Trilha)
    for (const [t, sd, lado] of extras) {
      const { x, z } = t.ponto(sd, lado * (24 + rng() * 6) * (sd > 165 ? 1.25 : 1));
      const larg = 9 + rng() * 6, alt = 14 + rng() * 14;
      q.setFromAxisAngle(eixoY, rng() * 6);
      m4.compose(v.set(x, alturaEm(x, z) + alt / 2 - 2, z), q, s.set(larg, alt, larg));
      monts.setMatrixAt(nm, m4);
      monts.setColorAt(nm++, cor.set(t.id === 'brasas' ? (rng() < 0.5 ? '#3a2824' : '#4a322a') : (rng() < 0.5 ? '#1f4426' : '#2a5230')));
    }
    // montanhas verdes em volta do Reino (menos na frente, onde chega o corredor)
    for (let i = 0; i < NR; i++) {
      const a = (i / NR) * Math.PI * 2 + rng() * 0.08;
      const lx = Math.sin(a), lz = Math.cos(a);
      if (lz > 0.93) continue; // a boca do corredor (a frente do Reino aponta para o mapa)
      const r = REINO.rChefe + 9 + rng() * 9, { x, z } = REINO.paraMundo(lx * r, lz * r);
      const larg = 12 + rng() * 9, alt = 14 + rng() * 16;
      q.setFromAxisAngle(eixoY, rng() * 6);
      m4.compose(v.set(x, alturaEm(x, z) + alt / 2 - 2, z), q, s.set(larg, alt, larg));
      monts.setMatrixAt(nm, m4);
      monts.setColorAt(nm++, cor.set(rng() < 0.5 ? '#5f8f44' : '#6e9f4c'));
    }
    monts.count = nm;
    this.cena.add(monts);
  }

  // A fonte de cura do castelo: a bacia é desenhada pelo reino.js; aqui fica o cristal que gira
  criarFonte() {
    this.cristalFonte = criarCristal(2.2);
    this.yFonte = REINO.h + 3.4;
    this.cristalFonte.position.set(FONTE.x, this.yFonte, FONTE.z);
    this.cena.add(this.cristalFonte);
  }

  // Cristais de captura no chão: posições sorteadas pela semente, mais os
  // lugares secretos (perto dos pontos de interesse) e o do píer da Floresta.
  criarCristaisChao() {
    const rng = aleatorio(SEMENTE ^ 777);
    const novo = (x, z, tipo) => {
      const m = criarCristal(1, tipo);
      m.position.set(x, alturaEm(x, z) + 0.8, z);
      m.visible = false;
      this.cena.add(m);
      this.cristais.push({ mesh: m, x, z, ativo: true, volta: 0, tipo });
      this.reservas.push({ x, z, r: 1.6 });
    };
    novo(CRISTAL_ESCONDIDO.x, CRISTAL_ESCONDIDO.z, 1); // no píer do lago da Floresta (começa como Cristal Forte)
    for (const sg of SEGREDOS) novo(sg.x, sg.z, sg.tipo);
    let n = 0;
    for (let tent = 0; tent < 3000 && n < N_CRISTAIS; tent++) {
      const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * (RAIO_MUNDO - 10);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (!this.pontoLivre(x, z, 1.5) || this.cristais.some((c) => Math.hypot(c.x - x, c.z - z) < 14)) continue;
      novo(x, z, sortearTipoCristal());
      n++;
    }
  }

  // ---------- dia e noite ----------
  atualizarCeu(dt) {
    this.hora = (this.hora + dt / DURACAO_DIA) % 1;
    // transição suave perto de 0 (amanhecer) e de 0.5 (anoitecer)
    const h = this.hora;
    const suave = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    let f;                                   // 0 = dia claro, 1 = noite fechada
    if (h < 0.44) f = 0;                     // dia
    else if (h < 0.5) f = suave(0.44, 0.5, h); // entardecer
    else if (h < 0.94) f = 1;                // noite
    else f = 1 - suave(0.94, 1, h);          // amanhecer
    this.fatorNoite = f;
    this.cena.background.lerpColors(CEU_DIA, CEU_NOITE, f);
    this.cena.fog.color.copy(this.cena.background);
    let brilhoExtra = 0;
    if (this.relampago > 0) { this.relampago -= dt; brilhoExtra = 2.2 * Math.max(0, this.relampago / 0.15); }
    this.hemi.color.lerpColors(HEMI_DIA, HEMI_NOITE, f);
    this.hemi.intensity = THREE.MathUtils.lerp(1.7, 0.8, f) + brilhoExtra;
    this.sol.color.lerpColors(SOL_DIA, SOL_NOITE, f);
    this.sol.intensity = THREE.MathUtils.lerp(1.9, 0.55, f);
    this.estrelas.material.opacity = f;
    this.cena.fog.near = this.nevoa * 0.55; // a névoa só começa depois da metade da visão (as dungeons fecham a névoa por cima disso)
    this.cena.fog.far = this.nevoa;
    this.clima?.aplicar(); // as cores de cada bioma (biomas/clima.js)
  }

  // ---------- monstros selvagens ----------
  mediaEquipe() {
    const eq = this.jogo.estado?.equipe;
    if (!eq?.length) return 3;
    return eq.reduce((s, m) => s + m.nivel, 0) / eq.length;
  }

  // Quanto mais longe do centro, mais forte. E acompanha o nível da sua equipe.
  nivelSelvagem(x, z, perto) {
    const media = this.mediaEquipe();
    const frac = Math.min(1, Math.hypot(x, z) / RAIO_MUNDO);
    let n = Math.round(media * (0.55 + 0.65 * frac) + Math.random() * 2 - 1);
    if (perto) n = Math.min(n, Math.max(1, Math.round(media) - 1));
    if (pertoDoReino(x, z)) n = Math.min(n, 2 + Math.floor(Math.random() * 4)); // em volta do Reino: Nv.2 a 5
    return Math.max(1, Math.min(NIVEL_MAX_SELVAGEM, n));
  }

  povoar() {
    this.povoando = true;
    this.masmorras?.resetar(); // nenhuma masmorra nova aberta
    for (const s of [...this.selvagens]) this.removerSelvagem(s);
    for (const g of [...this.grupos]) this.removerGrupo(g);
    for (let i = 0; i < 3; i++) this.spawnarSelvagem(true);
    for (let i = 0; i < MAX_SELVAGENS - 4; i++) this.spawnarSelvagem(false);
    for (let i = 0; i < gruposDesejados(this.mediaEquipe()); i++) this.spawnarGrupo();
    for (const d of this.dungeons || []) for (const a of d.acampamentos) a.grupo = null;
    for (const d of this.dungeons || []) d.aoCarregar?.(); // o chefe de cada masmorra volta como estava salvo
    this.povoando = false;
  }

  // Sorteia quem aparece numa região (devolve a linha 'L:xx' ou uma espécie rara)
  sortearAparicao(zona) {
    const lista = APARICOES[zona][this.periodo];
    const total = lista.reduce((s, [, peso]) => s + peso, 0);
    let sorteio = Math.random() * total;
    for (const [e, peso] of lista) { sorteio -= peso; if (sorteio <= 0) return e; }
    return lista[0][0];
  }

  especieDe(escolha, nivel) {
    if (escolha.startsWith('L:')) return { especie: formaPorNivel(escolha.slice(2), nivel), nivel };
    const nv = Math.max(3, nivel + 1);
    return { especie: especieDaEscolha(escolha, nv), nivel: nv }; // raro com formas novas: forma pelo nível
  }

  // ---------- grupos de monstros ----------
  // opcoes (usado pela dungeon): { x, z, zona, niveis, lista, acampamento }
  spawnarGrupo(opcoes = null) {
    for (let tent = 0; tent < 80; tent++) {
      let x, z;
      if (opcoes) { x = opcoes.x; z = opcoes.z; } else {
        const a = Math.random() * Math.PI * 2, r = 34 + Math.random() * Math.max(10, this.raioSpawn() - 34);
        x = this.pos.x + Math.cos(a) * r; z = this.pos.z + Math.sin(a) * r;
        if (Math.hypot(x, z) < FIM_ANEL + 15 || Math.hypot(x, z) > RAIO_MUNDO - 12 || !this.chunks.carregado(x, z)) continue; // no anel tranquilo, só monstros soltos e fracos
        if (this.grupos.some((o) => Math.hypot(o.x - x, o.z - z) < DIST_NASCER_GRUPOS)) continue; // longe dos outros grupos
        if (!this.pontoLivre(x, z, 3)) continue;
      }
      const zona = opcoes?.zona || zonaEm(x, z);
      const nv = opcoes?.niveis || niveisDoGrupo(this.mediaEquipe());
      // Grupos de dungeon: 2 fracos, 2 médios, 1 forte e o líder (a ordem em que entram na luta)
      const FORCA = [null, ['fraco', 1, -2], ['fraco', 1, -2], ['medio', 2, 1], ['medio', 2, 1], ['forte', 3, 0]];
      const membros = [];
      for (let i = 0; i < TAMANHO_GRUPO; i++) {
        const lider = i === 0;
        let escolha = opcoes?.lista ? sortearLista(opcoes.lista) : this.sortearAparicao(zona);
        // o líder é sempre de uma linha evolutiva (assim ele aparece evoluído)
        const forca = opcoes?.escalonado && !lider ? FORCA[i] : null;
        if ((lider || forca?.[0] === 'forte') && !escolha.startsWith('L:')) escolha = 'L:' + ESPECIES[escolha].elemento;
        let nivel = lider ? nv.lider : Math.max(1, nv.comum + Math.round(Math.random() * 2 - 1));
        if (forca) nivel = forca[0] === 'forte' ? Math.round(nv.comum + (nv.lider - nv.comum) * 0.6) : Math.max(1, nv.comum + forca[2]);
        let { especie, nivel: nivelFinal } = this.especieDe(escolha, nivel);
        // masmorra a partir do Nível 5: o líder pode vir na forma final (se tiver nível para ela)
        if (lider && opcoes?.finalLider && escolha.startsWith('L:')) especie = formaPorNivel(escolha.slice(2), nivelFinal, true);
        const dados = criarMonstro(especie, nivelFinal);
        if (lider) dados.lider = true;
        if (opcoes?.escalonado) { dados.onda = lider ? 4 : forca[1]; dados.forca = lider ? 'lider' : forca[0]; }
        const modelo = criarModelo(especie);
        if (lider) {
          modelo.scale.setScalar(1.3);
          const coroa = criarCoroa(1.2);
          coroa.position.y = ESPECIES[especie].altura + 0.15;
          modelo.add(coroa);
        }
        this.cena.add(modelo);
        membros.push({ dados, modelo, ox: 0, oz: 0 });
      }
      this.espalharGrupo(membros, x, z);
      this.contaSpawn += TAMANHO_GRUPO;
      const velMin = Math.min(...membros.map((m) => statsDe(m.dados.especie, m.dados.nivel).vel));
      const g = { grupo: true, membros, x, z, ang: Math.random() * 6.28, estado: 'parado', t: 2, zona, vel: velMin * 0.35, acampamento: opcoes?.acampamento || null };
      this.grupos.push(g);
      return g;
    }
    return null;
  }

  // Espalha o grupo em 3 duplas soltas, em lugares aleatórios (sem fileiras):
  // 1ª dupla, 2ª dupla e o 5º monstro junto do líder (a ordem da luta não muda: está nos dados).
  // membros[0] é o líder; membros[1..5] estão na ordem da luta.
  espalharGrupo(membros, cx, cz) {
    const [lider, ...comuns] = membros;
    const unidades = [];
    for (let i = 0; i < comuns.length; i += 2) unidades.push(comuns.slice(i, i + 2));
    const ultima = unidades.length && unidades[unidades.length - 1].length === 1 ? unidades.pop() : [];
    unidades.push([...ultima, lider]);
    const centros = [];
    unidades.forEach((u, k) => {
      // centro da dupla: sorteado, longe dos centros das outras duplas
      let c = null;
      // (12 m entre centros = 5 m livres entre as duplas, mesmo com monstros grandes)
      for (let tent = 0; tent < 200 && !c; tent++) {
        const a = Math.random() * Math.PI * 2, d = Math.random() * (RAIO_AREA_GRUPO - 3);
        const p = { x: cx + Math.cos(a) * d, z: cz + Math.sin(a) * d };
        if (centros.every((o) => Math.hypot(o.x - p.x, o.z - p.z) > 12)) c = p;
      }
      if (!c) { const a = (k / 3) * Math.PI * 2 + Math.random(); c = { x: cx + Math.cos(a) * 7.5, z: cz + Math.sin(a) * 7.5 }; }
      centros.push(c);
      const eixo = Math.random() * Math.PI * 2;
      u.forEach((m, i) => {
        const r = raioMembro(m), lado = u.length === 1 ? 0 : (i ? 1 : -1);
        const dist = lado * (1 + r); // 2 m de espaço entre os dois
        m.unidade = k;
        m.x = c.x + Math.cos(eixo) * dist;
        m.z = c.z + Math.sin(eixo) * dist;
        m.ang = Math.random() * Math.PI * 2;
        m.estado = 'parado';
        m.t = Math.random() * 3;         // cada um troca de parado/andando na sua hora
        m.vel = statsDe(m.dados.especie, m.dados.nivel).vel * 0.42;
      });
    });
    // arrumação rápida ao nascer: afasta quem ficou perto demais de outra dupla
    for (let it = 0; it < 40; it++) {
      for (const a of membros) for (const b of membros) {
        if (a === b || a.unidade === b.unidade) continue;
        const dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz) || 0.01;
        const falta = ESPACO_ENTRE_DUPLAS + 0.3 - (d - raioMembro(a) - raioMembro(b));
        if (falta > 0) for (const m of membros) if (m.unidade === a.unidade) { m.x += (dx / d) * falta * 0.25; m.z += (dz / d) * falta * 0.25; }
      }
    }
  }

  // Move cada monstro do grupo sozinho. Devolve true se o grupo está vindo atrás de você.
  moverMembros(g, dt, t, pausado, perseguindo) {
    const ms = g.membros;
    for (const m of ms) {
      let fx = 0, fz = 0, anda = false;
      const r = raioMembro(m);
      if (perseguindo) {
        // todos vêm atrás de você, cada um na sua velocidade
        const dx = this.pos.x - m.x, dz = this.pos.z - m.z, l = Math.hypot(dx, dz) || 1;
        fx = dx / l; fz = dz / l; anda = true;
      } else {
        // passeio próprio: anda um pouco, para, olha para outro lado...
        m.t -= dt;
        if (m.t <= 0) {
          if (m.estado === 'parado') { m.estado = 'andando'; m.t = 1 + Math.random() * 2.5; m.ang = Math.random() * Math.PI * 2; }
          else { m.estado = 'parado'; m.t = 1 + Math.random() * 3.5; }
        }
        if (m.estado === 'andando') { fx = Math.sin(m.ang); fz = Math.cos(m.ang); anda = true; }
        // longe demais do ponto do grupo: volta para perto
        const dx = g.x - m.x, dz = g.z - m.z, dc = Math.hypot(dx, dz);
        if (dc > RAIO_AREA_GRUPO) { fx = dx / dc; fz = dz / dc; anda = true; }
      }
      // espaço entre eles: ~2 m do parceiro, 5 m dos outros
      let ex = 0, ez = 0;
      for (const o of ms) {
        if (o === m) continue;
        const dx = m.x - o.x, dz = m.z - o.z, d = Math.hypot(dx, dz) || 0.01;
        const gap = d - r - raioMembro(o), ux = dx / d, uz = dz / d;
        if (o.unidade === m.unidade) {
          if (gap < DUPLA_MIN) { ex += ux * (DUPLA_MIN - gap) * 1.5; ez += uz * (DUPLA_MIN - gap) * 1.5; }
          else if (gap > DUPLA_MAX && !perseguindo) { ex -= ux * Math.min(1, (gap - DUPLA_MAX) * 0.5); ez -= uz * Math.min(1, (gap - DUPLA_MAX) * 0.5); }
        } else if (gap < ESPACO_ENTRE_DUPLAS * (perseguindo ? 0.5 : 1)) {
          const k = (ESPACO_ENTRE_DUPLAS - gap) * 1.2;
          ex += ux * k; ez += uz * k;
        }
      }
      const el = Math.hypot(ex, ez);
      if (el > 0.05) { fx += ex; fz += ez; anda = true; }
      // não entram na área segura da bandeira
      if (this.bandeiraPos) {
        const dx = m.x - this.bandeiraPos.x, dz = m.z - this.bandeiraPos.z, d = Math.hypot(dx, dz);
        if (d < AREA_SEGURA_BANDEIRA + 1) { fx = dx / (d || 1); fz = dz / (d || 1); anda = true; }
      }
      const fl = Math.hypot(fx, fz);
      if (anda && fl > 0.01 && !pausado) {
        const vel = m.vel * (perseguindo ? 1 : 0.55) * Math.min(1, fl);
        const p = { x: m.x + (fx / fl) * vel * dt, z: m.z + (fz / fl) * vel * dt };
        this.colidir(p, r * 0.8);
        m.x = p.x; m.z = p.z;
        m.virar = Math.atan2(fx, fz);
      }
      m.andando = anda && fl > 0.2 && !pausado;
      m.modelo.position.set(m.x, alturaEm(m.x, m.z), m.z);
      if (m.virar != null) m.modelo.rotation.y = lerpAngulo(m.modelo.rotation.y, m.virar, 1 - Math.exp(-6 * dt));
      animarModelo(m.modelo, t, m.andando); // cada modelo já tem o seu próprio ritmo (fase)
    }
  }

  removerGrupo(g) {
    const i = this.grupos.indexOf(g);
    if (i >= 0) this.grupos.splice(i, 1);
    for (const m of g.membros) { this.cena.remove(m.modelo); descartar(m.modelo); }
  }

  // Depois de uma batalha: tira do grupo quem foi derrotado ou capturado
  tirarDoGrupo(g, uids) {
    for (const m of g.membros.filter((mm) => uids.includes(mm.dados.uid))) { this.cena.remove(m.modelo); descartar(m.modelo); }
    g.membros = g.membros.filter((m) => !uids.includes(m.dados.uid));
    if (!g.membros.length) this.removerGrupo(g);
  }

  // A Coroa do Rei na cabeça do jogador (o Campeão do Reino pode vestir ou tirar)
  vestirCoroa(sim) {
    if (sim && !this.coroaJogador) {
      this.coroaJogador = criarCoroa(0.85);
      this.coroaJogador.position.set(0, 1.53, 0); // em cima do boné
      this.jogador.userData.corpo.add(this.coroaJogador);
    }
    if (this.coroaJogador) this.coroaJogador.visible = !!sim;
  }

  // ---------- bandeira do Reino (onde você renasce) ----------
  podeFincarBandeira(x, z) {
    if (interiorEm(x, z)) return false; // nem dentro das masmorras novas
    if (Math.hypot(x, z) > RAIO_MUNDO - 8) return false;
    if (semCasaDungeons(x, z)) return false; // dentro ou na boca das masmorras não
    if (this.vilas?.vilaEm(x, z, 4)) return false; // nem dentro das vilas
    if (Math.hypot(x, z) < 6) return false; // em cima da placa do Campo não
    if (!this.chunks.carregado(x, z)) return false;
    if (alturaEm(x, z) < NIVEL_AGUA + 0.3) return false; // nem na água, nem na lava
    const r = RAIO_BANDEIRA + 0.6;
    return !this.grade.cada(x, z, r, (o) => o !== this.bandeiraObst && Math.hypot(x - o.x, z - o.z) < o.r + r);
  }

  // Nível da bandeira (1: levanta com 1/4 da vida; 2: com 2/4) e da casa (1 a 5): ver bolsa.js
  get nivelBandeira() { return this.jogo.estado?.bandeiraNivel || 1; }
  get nivelCasa() { return this.jogo.estado?.casaNivel || 1; }

  trocarModeloBandeira() {
    if (this.bandeira.userData.nivel === this.nivelBandeira) return;
    const vis = this.bandeira.visible, pos = this.bandeira.position.clone(), rot = this.bandeira.rotation.y;
    this.cena.remove(this.bandeira);
    descartar(this.bandeira);
    this.bandeira = criarBandeira(this.nivelBandeira);
    this.bandeira.position.copy(pos); this.bandeira.rotation.y = rot; this.bandeira.visible = vis;
    this.cena.add(this.bandeira);
    if (this.bandeiraPos) this.bandeiraAnim = 0;
  }

  // A casa do Reino troca de desenho quando sobe de nível
  trocarModeloCasa() {
    if (this.casa.userData.nivel === this.nivelCasa) return;
    const pos = this.casa.position.clone(), rot = this.casa.rotation.y;
    this.cena.remove(this.casa);
    descartar(this.casa);
    this.casa = criarCasa(this.nivelCasa);
    this.casa.position.copy(pos); this.casa.rotation.y = rot;
    this.cena.add(this.casa);
    this.casaAnim = 0; // pulinho de "casa nova"
  }

  fincarBandeira(x, z, rot, animar = true) {
    if (this.bandeira.userData.nivel !== this.nivelBandeira) { this.cena.remove(this.bandeira); descartar(this.bandeira); this.bandeira = criarBandeira(this.nivelBandeira); this.cena.add(this.bandeira); }
    if (this.bandeiraObst) this.obstaculos.tirar(this.bandeiraObst);
    this.bandeiraPos = { x, z, rot };
    this.bandeiraObst = { x, z, r: RAIO_BANDEIRA };
    this.obstaculos.push(this.bandeiraObst);
    this.bandeira.position.set(x, alturaEm(x, z), z);
    this.bandeira.rotation.y = rot;
    this.bandeira.visible = true;
    this.bandeiraAnim = animar ? 0 : 1;
    // monstros que estavam em cima do lugar vão embora
    for (const s of [...this.selvagens]) if (Math.hypot(s.x - x, s.z - z) < AREA_SEGURA_BANDEIRA) this.removerSelvagem(s);
    for (const g of [...this.grupos]) if (Math.hypot(g.x - x, g.z - z) < AREA_SEGURA_BANDEIRA + 3) this.removerGrupo(g);
  }

  tirarBandeira() {
    if (this.bandeiraObst) this.obstaculos.tirar(this.bandeiraObst);
    this.bandeiraObst = null;
    this.bandeiraPos = null;
    this.bandeira.visible = false;
  }

  // Procura um lugar livre para a bandeira: primeiro na frente do jogador, depois em volta dele
  acharLugarBandeira() {
    for (const d of [2.2, 3.4, 4.6]) {
      for (let i = 0; i <= 16; i++) {
        // alterna esquerda/direita a partir da frente
        const a = this.ang + Math.ceil(i / 2) * (i % 2 ? 1 : -1) * (Math.PI / 8);
        const x = this.pos.x + Math.sin(a) * d, z = this.pos.z + Math.cos(a) * d;
        if (this.podeFincarBandeira(x, z)) return { x, z, rot: Math.atan2(this.pos.x - x, this.pos.z - z) };
      }
    }
    return null;
  }

  distanciaBandeira() {
    return this.bandeiraPos ? Math.hypot(this.pos.x - this.bandeiraPos.x, this.pos.z - this.bandeiraPos.z) : Infinity;
  }
  distanciaCasa() {
    return Math.hypot(this.pos.x - this.casaPos.x, this.pos.z - this.casaPos.z);
  }

  // Ao perder a batalha: acorda na bandeira (se ela estiver fincada) ou na fonte
  irParaBase() {
    if (!this.bandeiraPos) { this.irParaFonte(); return; }
    const { x, z, rot } = this.bandeiraPos;
    this.pos.set(x + Math.sin(rot) * (RAIO_BANDEIRA + 1.6), 0, z + Math.cos(rot) * (RAIO_BANDEIRA + 1.6));
    this.ang = rot;
    this.orbita.yaw = rot + Math.PI;
    this.graca = 3;
    this.posicionarCamera(1);
  }

  spawnarSelvagem(perto) {
    for (let tent = 0; tent < 60; tent++) {
      let x, z;
      if (perto) {
        const a = Math.random() * Math.PI * 2, r = 16 + Math.random() * 10;
        x = this.pos.x + Math.cos(a) * r; z = this.pos.z + Math.sin(a) * r;
      } else {
        // em volta do jogador, nos chunks carregados (longe demais eles somem sozinhos)
        const a = Math.random() * Math.PI * 2, r = 22 + Math.random() * (this.raioSpawn() - 22);
        x = this.pos.x + Math.cos(a) * r; z = this.pos.z + Math.sin(a) * r;
      }
      if (!this.chunks.carregado(x, z) || !this.pontoLivre(x, z, 1)) continue;
      const zona = zonaEm(x, z);
      // o 10º monstro (sem ser o que aparece colado em você) é de tipo duplo
      if (!perto && this.contaSpawn + 1 >= INTERVALO_DUPLO && !pertoDoReino(x, z)) {
        this.contaSpawn = 0;
        this.spawnarDuplo(x, z, zona);
        return;
      }
      this.contaSpawn++;
      const lista = APARICOES[zona][this.periodo];
      const total = lista.reduce((s, [, peso]) => s + peso, 0);
      let sorteio = Math.random() * total, escolha = lista[0][0];
      for (const [e, peso] of lista) { sorteio -= peso; if (sorteio <= 0) { escolha = e; break; } }
      let nivel = this.nivelSelvagem(x, z, perto);
      let especie, periodo = null;
      if (escolha.startsWith('L:')) {
        const linha = escolha.slice(2);
        especie = formaPorNivel(linha, nivel);
        periodo = PERIODO_DA_LINHA[linha] || null;
      } else {
        especie = escolha;
        nivel = Math.max(3, nivel + 1);
      }
      const dados = criarMonstro(especie, nivel);
      const modelo = criarModelo(especie);
      modelo.position.set(x, alturaEm(x, z), z);
      this.cena.add(modelo);
      this.selvagens.push({ dados, modelo, x, z, ang: Math.random() * 6.28, estado: 'parado', t: Math.random() * 2, zona, periodo, vel: statsDe(especie, nivel).vel * 0.45 });
      return;
    }
  }

  // Monstro de tipo duplo: escolhe uma linha que combine com a região; é um pouco mais forte
  spawnarDuplo(x, z, zona) {
    const opcoes = ORDEM_DUPLAS.filter((k) => DUPLAS[k].zonas.includes(zona));
    const k = opcoes[Math.floor(Math.random() * opcoes.length)] || ORDEM_DUPLAS[0];
    const nivel = Math.min(NIVEL_MAX_SELVAGEM + 2, this.nivelSelvagem(x, z, false) + 2);
    const especie = formaPorNivel(k, nivel);
    const esp = ESPECIES[especie];
    const dados = criarMonstro(especie, nivel);
    const modelo = criarModelo(especie);
    const aura = criarAuraDupla(esp.elementos.map((el) => ELEMENTOS[el].cor), esp.raio * 1.5);
    modelo.add(aura);
    modelo.position.set(x, alturaEm(x, z), z);
    this.cena.add(modelo);
    this.selvagens.push({ dados, modelo, aura, dupla: true, x, z, ang: Math.random() * 6.28, estado: 'parado', t: Math.random() * 2, zona, periodo: null, vel: statsDe(especie, nivel).vel * 0.45 });
    if (!this.povoando && this.jogo.estado) this.jogo.aviso(`Um monstro de tipo duplo apareceu: ${esp.nome} (${nomeTipo(esp)}) ${NA_ZONA[zona]}!`);
  }

  // Até onde os monstros aparecem em volta do jogador (dentro dos chunks carregados)
  raioSpawn() { return Math.max(40, Math.min(95, this.chunks.raioCarregado - 8)); }

  removerSelvagem(s) {
    const i = this.selvagens.indexOf(s);
    if (i >= 0) this.selvagens.splice(i, 1);
    this.cena.remove(s.modelo);
    descartar(s.modelo);
  }

  // Sai pelo túnel da arena de uma vila (quando desiste de uma luta lá)
  sairDaArenaDaVila(id) {
    const p = saidaDaArena(this.vilas.vila(id));
    this.pos.set(p.x, 0, p.z);
    this.ang = p.ang;
    this.orbita.yaw = this.ang + Math.PI;
    this.graca = 2.5;
    this.posicionarCamera(1);
  }

  // Sai pelo portão da arena do Reino (quando desiste de uma luta)
  sairDaArena() {
    const fora = REINO.paraMundo(ARENA_REINO.x + 25, ARENA_REINO.z), dentro = REINO.paraMundo(ARENA_REINO.x, ARENA_REINO.z);
    this.pos.set(fora.x, 0, fora.z);
    this.ang = Math.atan2(fora.x - dentro.x, fora.z - dentro.z);
    this.orbita.yaw = this.ang + Math.PI;
    this.graca = 2.5;
    this.posicionarCamera(1);
  }

  // Acorda na praça do castelo, de frente para a fonte
  irParaFonte() {
    this.pos.set(NASCER.x, 0, NASCER.z);
    this.ang = ANG_NASCER;
    this.orbita.yaw = this.ang + Math.PI; // a câmera atrás do jogador, olhando para o castelo
    this.orbita.voltarPara = null;
    this.chunks.carregarTudoPerto(NASCER.x, NASCER.z);
    this.graca = 3;
    this.posicionarCamera(1);
  }

  colidir(p, raio) {
    // só os obstáculos em volta (a grade separa o mapa em quadradinhos)
    this.grade.cada(p.x, p.z, raio, (o) => {
      const dx = p.x - o.x, dz = p.z - o.z;
      const d = Math.hypot(dx, dz), min = o.r + raio;
      if (d < min && d > 0.0001) { p.x = o.x + (dx / d) * min; p.z = o.z + (dz / d) * min; }
    });
    // dentro de uma masmorra nova: os limites são os dela (salas, corredores, buracos)
    const f = interiorEm(p.x, p.z);
    if (f) {
      f.empurrar(p, raio);
      if (!f.livre(p.x, p.z, raio)) { const q = f.prender(p, raio); p.x = q.x; p.z = q.z; }
      return;
    }
    for (const t of TRACADOS) t.empurrar?.(p, raio); // água do Lago Escondido (dentro da dungeon)
    if (bloqueadoEm(p.x, p.z)) this.sairDoLiquido(p); // lago fundo e lava (rio raso dá para atravessar)
    // limites: o mapa redondo ou o corredor de uma dungeon (vale o mais perto)
    const dc = Math.hypot(p.x, p.z);
    if (dc > RAIO_MUNDO - 4 && !dentroDungeonLivre(p.x, p.z, raio)) {
      const mx = p.x * (RAIO_MUNDO - 4) / dc, mz = p.z * (RAIO_MUNDO - 4) / dc;
      const d = prenderDungeons(p, raio);
      if (Math.hypot(d.x - p.x, d.z - p.z) < Math.hypot(mx - p.x, mz - p.z)) { p.x = d.x; p.z = d.z; } else { p.x = mx; p.z = mz; }
    }
  }

  // Leva o ponto para a beirada mais perto (fora da água funda ou da lava)
  sairDoLiquido(p) {
    for (let r = 0.4; r <= 12; r += 0.4) {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
        if (!bloqueadoEm(x, z)) { p.x = x; p.z = z; return; }
      }
    }
  }

  // Distância e altura padrão da câmera (com o celular em pé ela fica mais longe e mais alta)
  camPadrao() {
    // dentro da arena do Reino: mais perto e mais de cima (senão a câmera fica atrás do telhado)
    if (this.reino?.dentroArena(this.pos.x, this.pos.z)) return { dist: 11, pitch: 0.72 };
    if (this.vilas?.dentroArena(this.pos.x, this.pos.z)) return { dist: 10, pitch: 0.78 }; // arena das vilas (menor): mais perto e de cima
    return this.jogo.aspecto < 1 ? { dist: 26, pitch: 0.82 } : { dist: 19, pitch: 0.71 }; // um pouco mais longe do personagem
  }

  posicionarCamera(k) {
    const { dist, pitch } = this.camPadrao();
    // controlando o monstro invocado: a câmera segue ele (focoCamera); senão, o treinador
    const foco = this.focoCamera?.();
    const alvo = foco ? new THREE.Vector3(foco.x, foco.y + 1, foco.z) : new THREE.Vector3(this.pos.x, this.pos.y + 1, this.pos.z);
    const destino = alvo.clone().add(this.orbita.deslocamento(dist, pitch));
    // não deixa a câmera entrar no chão (as bordas do mapa sobem)
    destino.y = Math.max(destino.y, alturaEm(destino.x, destino.z) + 1.2);
    this.camera.position.lerp(destino, k);
    this.camera.lookAt(alvo);
  }

  // ---------- quadro a quadro ----------
  atualizar(dt, ctrl, t, pausado = false) {
    // câmera: gira com o que o jogador arrastou; o andar segue o lado que a câmera olha
    const giro = ctrl.consumirGiro();
    if (!pausado) this.orbita.girar(giro, this.ang + Math.PI, this.camPadrao().pitch, dt);
    this.girandoCam = !pausado && (giro.x || giro.y || giro.zoom || this.orbita.voltarPara != null);
    // controlando o monstro invocado, o treinador fica parado (o joystick é do monstro)
    const protegido = !!this.jogo.pet?.controlando; // e ninguém vem atrás dele
    const v = pausado || protegido ? { x: 0, z: 0 } : ctrl.vetorDaCamera(this.orbita.yaw);
    const movendo = Math.hypot(v.x, v.z) > 0.05;
    if (movendo) {
      // na água rasa (rios e o Arquipélago) anda mais devagar
      // (no Gelo os rios são congelados: anda normal)
      const naAgua = alturaEm(this.pos.x, this.pos.z) < NIVEL_AGUA - 0.1 && !geloEm(this.pos.x, this.pos.z) && biomaEm(this.pos.x, this.pos.z) !== 'raio';
      const vel = VEL_JOGADOR * (naAgua ? AGUA_RASA : 1) * (this.jogo.gm?.vel || 1); // GM: andar ×2 ou ×3
      this.pos.x += v.x * vel * dt;
      this.pos.z += v.z * vel * dt;
      this.ang = lerpAngulo(this.ang, Math.atan2(v.x, v.z), 1 - Math.exp(-14 * dt));
    }
    this.colidir(this.pos, 0.4);
    this.pos.y = alturaEm(this.pos.x, this.pos.z);
    this.jogador.position.copy(this.pos);
    this.jogador.rotation.y = this.ang;
    animarModelo(this.jogador, t, movendo);
    this.graca = Math.max(0, this.graca - dt);
    this.avisoT = Math.max(0, this.avisoT - dt);
    this.jogador.visible = this.graca <= 0 || Math.floor(t * 10) % 2 === 0;

    this.cristalFonte.rotation.y += dt * 1.2;
    this.cristalFonte.position.y = this.yFonte + Math.sin(t * 2) * 0.15;
    for (const a of this.aguas) a.position.y = NIVEL_AGUA + Math.sin(t * 1.3) * 0.05;
    // chunks: cria os novos em volta (aos poucos) e apaga os que ficaram longe
    this.chunks.atualizar(this.pos.x, this.pos.z);
    this.chunks.animar(t);
    this.gelo.atualizar(dt, t);
    this.floresta2.atualizar(dt, t);
    this.deserto.atualizar(dt, t, pausado);
    this.vulcao.atualizar(dt, t, pausado);
    this.arquipelago.atualizar(dt, t, pausado);

    // Relâmpagos nos Picos Nevados (região de Raio)
    const zonaAtual = zonaEm(this.pos.x, this.pos.z);
    if (zonaAtual === 'raio' && !this.masmorras.ativa) { // (a masmorra cuida dos relâmpagos dela)
      this.proxRelampago -= dt;
      if (this.proxRelampago <= 0) { this.relampago = 0.15; this.proxRelampago = 2.5 + Math.random() * 4; }
    }
    this.atualizarCeu(pausado || this.jogo.gm?.relogioParado ? 0 : dt); // GM: relógio parado
    if (this.periodo !== this.periodoAvisado) {
      this.periodoAvisado = this.periodo;
      if (this.jogo.estado) this.jogo.aviso(this.periodo === 'noite' ? 'Anoiteceu. Monstros de Lua e Trevas saíram!' : 'Amanheceu. Monstros de Sol e Luz estão por aí!');
    }
    const vilaAqui = this.vilas.vilaEm(this.pos.x, this.pos.z), refugioAqui = this.refugioEm(this.pos.x, this.pos.z);
    const nomeZona = this.masmorras.ativa ? this.masmorras.ativa.nomeAqui() : vilaAqui ? vilaAqui.nome : refugioAqui ? refugioAqui.nome : (this.lugarNomeado(this.pos.x, this.pos.z) || (REINO.perto(this.pos.x, this.pos.z) ? 'Reino' : naEstrada(this.pos.x, this.pos.z) ? 'Estrada Real' : NOMES_ZONA[zonaAtual === 'agua' && biomaEm(this.pos.x, this.pos.z) === 'agua' ? 'arquipelago' : zonaAtual]));
    if (this.zonaAvisada !== nomeZona) {
      this.zonaAvisada = nomeZona;
      if (this.jogo.estado) this.jogo.mostrarZona(nomeZona);
    }

    const est = this.jogo.estado;
    // Fonte de cura (na praça do castelo)
    const naFonte = est && Math.hypot(this.pos.x - FONTE.x, this.pos.z - FONTE.z) < 4.8;
    if (naFonte && this.jogo.precisaCura()) {
      this.jogo.curarEquipe();
      this.jogo.aviso('A fonte do castelo curou sua equipe!');
    }
    // A fogueira do Acampamento do Gelo também cura
    if (est && this.gelo.pertoDaFogueira(this.pos.x, this.pos.z) && this.jogo.precisaCura()) {
      this.jogo.curarEquipe();
      this.jogo.aviso('A fogueira do acampamento aqueceu e curou sua equipe!');
    }

    // Bandeira: animação de fincar, o pano balançando e a área segura (ela não cura)
    // área segura: em volta da bandeira, na Estrada Real e no Reino
    const naAreaSegura = this.distanciaBandeira() < AREA_SEGURA_BANDEIRA || naEstrada(this.pos.x, this.pos.z, -2) || REINO.perto(this.pos.x, this.pos.z) || !!this.vilas.vilaEm(this.pos.x, this.pos.z, 2) || !!this.refugioEm(this.pos.x, this.pos.z, 2);
    if (this.bandeiraPos) {
      if (this.bandeiraAnim < 1) {
        this.bandeiraAnim = Math.min(1, this.bandeiraAnim + dt * 2.5);
        const k = this.bandeiraAnim; // sobe do chão
        this.bandeira.scale.set(1, Math.max(0.01, k), 1);
      } else this.bandeira.scale.setScalar(1);
      animarBandeira(this.bandeira, t);
    }
    // Jardim (plantas em tempo real) e o "satisfeito" dos monstros passando
    if (est) { this.jardim3d.atualizar(dt, est, this.distanciaCasa() < 70); if (!pausado) passarFome(est, dt); }
    // Casa do Reino: fumaça, janelas acesas à noite e o pulinho quando sobe de nível
    if (this.distanciaCasa() < 70) {
      if (this.casaAnim < 1) {
        this.casaAnim = Math.min(1, this.casaAnim + dt * 2.2);
        const k = this.casaAnim, pulo = Math.sin(k * Math.PI) * 0.15;
        this.casa.scale.set(1 + pulo, 1 + pulo, 1 + pulo);
      }
      animarCasa(this.casa, t, this.fatorNoite);
    }

    // Cristais no chão (só os perto são desenhados)
    for (const c of this.cristais) {
      if (!c.ativo) {
        c.volta -= dt;
        if (c.volta <= 0) { c.ativo = true; c.tipo = sortearTipoCristal(); pintarCristal(c.mesh, c.tipo); }
        continue;
      }
      c.mesh.visible = Math.abs(this.pos.x - c.x) < VER_CRISTAL && Math.abs(this.pos.z - c.z) < VER_CRISTAL;
      if (!c.mesh.visible) continue;
      c.mesh.rotation.y += dt * 2;
      c.mesh.position.y = alturaEm(c.x, c.z) + 0.8 + Math.sin(t * 3 + c.x) * 0.12;
      if (est && Math.hypot(this.pos.x - c.x, this.pos.z - c.z) < 1.4) {
        c.ativo = false; c.mesh.visible = false; c.volta = 60;
        est.pedras[CRISTAIS[c.tipo].id]++;
        this.jogo.aviso(c.tipo === 0 ? 'Você achou um cristal de captura!' : `Você achou um ${CRISTAIS[c.tipo].nome}!`);
        this.jogo.atualizarHudMundo();
        this.jogo.salvar();
      }
    }

    // Selvagens
    this.timerSpawn -= dt;
    if (this.timerSpawn <= 0 && this.selvagens.filter((x) => !x.dungeon && !x.chefe && !x.regiao).length < MAX_SELVAGENS) { this.timerSpawn = 3; this.spawnarSelvagem(false); }
    let maisPerto = null, menorD = 9;
    const longe = this.raioSpawn() + 35;
    for (const s of [...this.selvagens]) {
      const dx = this.pos.x - s.x, dz = this.pos.z - s.z, d = Math.hypot(dx, dz);
      // ficou longe (fora dos chunks): some, e outro aparece perto de você
      if (d > longe && !s.dungeon && !s.chefe && !s.regiao) { this.removerSelvagem(s); continue; }
      // Monstro de dia some à noite (e vice-versa) quando está longe de você
      if (s.periodo && s.periodo !== this.periodo && d > 24) { this.removerSelvagem(s); continue; }
      s.t -= dt;
      if (s.t <= 0) {
        if (s.estado === 'parado') { s.estado = 'andando'; s.t = 1.5 + Math.random() * 2; s.ang = Math.random() * 6.28; }
        else { s.estado = 'parado'; s.t = 1 + Math.random() * 2.5; }
      }
      let andando = s.estado === 'andando' && !s.fixo;
      if (d < 7 && this.graca <= 0 && est && !naAreaSegura && !s.fixo && !this.jogo.gm?.invisivel && !protegido) { s.ang = Math.atan2(dx, dz); andando = true; }
      andando = (!s.fixo && this.fugirDaCasa(s)) || andando;
      if (andando && !pausado) this.andar(s, s.vel * dt, 0.6);
      s.modelo.position.set(s.x, alturaEm(s.x, s.z), s.z);
      s.modelo.rotation.y = lerpAngulo(s.modelo.rotation.y, s.ang, 1 - Math.exp(-8 * dt));
      animarModelo(s.modelo, t, andando);
      if (s.aura) animarAura(s.aura, t);
      if (d < menorD) { menorD = d; maisPerto = s; }
    }

    // Dungeons abertas: acampamentos, monstros soltos, chefe e clima
    for (const d of this.dungeons) d.atualizar(dt, t);
    // Masmorras novas: a entrada no mapa ou, lá dentro, as etapas, os portões e o chefe
    this.masmorras.atualizar(dt, t, pausado);
    if (this.jogo.batalha) return;

    // Grupos: andam juntos em formação; aparecem mais conforme sua equipe fica forte
    this.timerGrupo -= dt;
    if (this.timerGrupo <= 0) {
      this.timerGrupo = 20;
      if (est && this.grupos.filter((g) => !g.acampamento).length < gruposDesejados(this.mediaEquipe())) this.spawnarGrupo();
    }
    for (const g of [...this.grupos]) {
      if (!g.acampamento && Math.hypot(this.pos.x - g.x, this.pos.z - g.z) > longe + 15) { this.removerGrupo(g); continue; }
      g.t -= dt;
      if (g.t <= 0) {
        if (g.estado === 'parado') { g.estado = 'andando'; g.t = 2 + Math.random() * 3; g.ang = Math.random() * 6.28; }
        else { g.estado = 'parado'; g.t = 2 + Math.random() * 3; }
      }
      const ac = g.acampamento;
      const longeDeCasa = ac ? Math.hypot(g.x - ac.x, g.z - ac.z) : 0;
      // distância até o monstro do grupo que está mais perto de você
      let dMembro = Infinity;
      for (const m of g.membros) dMembro = Math.min(dMembro, Math.hypot(this.pos.x - m.x, this.pos.z - m.z) - raioMembro(m));
      // vem atrás de você quando chega perto de QUALQUER um deles
      // (os de acampamento só de perto e sem se afastar muito da fogueira)
      const perseguindo = !pausado && !!est && this.graca <= 0 && !naAreaSegura && !this.jogo.gm?.invisivel && !protegido
        && dMembro < (ac ? PERSEGUE_ACAMPAMENTO : PERSEGUE_GRUPO) && longeDeCasa < 12;
      let andando = g.estado === 'andando';
      if (perseguindo) {
        // o ponto do grupo acompanha os monstros (no meio deles)
        g.x = g.membros.reduce((a, m) => a + m.x, 0) / g.membros.length;
        g.z = g.membros.reduce((a, m) => a + m.z, 0) / g.membros.length;
      } else {
        if (ac && longeDeCasa > 4) { g.ang = Math.atan2(ac.x - g.x, ac.z - g.z); andando = true; }
        // grupos soltos não andam colados uns nos outros
        if (!ac) {
          const perto = this.grupos.find((o) => o !== g && Math.hypot(o.x - g.x, o.z - g.z) < DIST_AFASTAR_GRUPOS);
          if (perto) { g.ang = Math.atan2(g.x - perto.x, g.z - perto.z); andando = true; }
        }
        andando = this.fugirDaCasa(g) || andando;
        if (andando && !pausado) this.andar(g, g.vel * dt, 3);
      }
      this.moverMembros(g, dt, t, pausado, perseguindo);
      for (const m of g.membros) {
        const d = Math.hypot(this.pos.x - m.x, this.pos.z - m.z) - raioMembro(m);
        if (d < menorD) { menorD = d; maisPerto = { grupoDe: g, membro: m }; }
      }
    }

    // Treinadores da arena do Reino: encostou na frente da plataforma, ele fala (ou começa a luta)
    this.reino.atualizar(dt, t);
    const tp = est ? this.reino.treinadorPerto(this.pos.x, this.pos.z) : null;
    if (tp && tp.d < 1.4 && this.reino.armado[tp.i] && !pausado && this.graca <= 0 && !protegido) {
      this.reino.desarmar(tp.i);
      this.jogo.encostouNoTreinador(tp.i);
      if (this.jogo.batalha) return;
    }

    // Treinadores das arenas das vilas (os mesmos passos do Reino)
    this.vilas.atualizar(dt, t);
    const tv = est ? this.vilas.treinadorPerto(this.pos.x, this.pos.z) : null;
    if (tv && tv.d < 1.4 && tv.p.armado && !pausado && this.graca <= 0 && !protegido) {
      tv.p.armado = false;
      this.jogo.encostouNoTreinadorDaVila(tv.vila.id, tv.i);
      if (this.jogo.batalha) return;
    }

    // Lojas de poções (a barraca listrada do Reino e a de cada vila): encostou na frente, a loja abre
    let lj = this.reino.loja, dLoja = est && lj ? Math.hypot(this.pos.x - lj.x, this.pos.z - lj.z) : Infinity;
    for (const l of this.vilas.lojas) { const d = est ? Math.hypot(this.pos.x - l.x, this.pos.z - l.z) : Infinity; if (d < dLoja) { dLoja = d; lj = l; } }
    if (dLoja > 3) this.reino.armadoLoja = true;
    if (dLoja < 1.6 && this.reino.armadoLoja !== false && !pausado) { this.reino.armadoLoja = false; this.jogo.bolsa.abrirLoja(lj.nome || null); }

    // Encontro!
    const raioEncontro = maisPerto?.grupoDe ? 0.9 : 0.9 + (maisPerto ? ESPECIES[maisPerto.dados.especie].raio : 0);
    if (maisPerto && est && !pausado && this.graca <= 0 && !naAreaSegura && !protegido && menorD < raioEncontro) {
      if (maisPerto.grupoDe) maisPerto = maisPerto.grupoDe;
      if (this.jogo.temMonstroDePe()) {
        this.jogo.iniciarBatalha(maisPerto);
        return;
      } else if (this.avisoT <= 0) {
        this.avisoT = 3;
        this.graca = 1.5;
        this.jogo.aviso('Sua equipe está desmaiada. Volte à fonte do castelo, no Reino!');
      }
    }

    // Plaquinha com nome do monstro mais perto (ou do grupo)
    if (maisPerto?.grupoDe && est) {
      const g = maisPerto.grupoDe;
      const lider = g.membros.find((m) => m.dados.lider) || g.membros[0];
      const esp = ESPECIES[lider.dados.especie];
      this.jogo.mostrarRotulo(`<i style="background:#ffd23f"></i>Grupo de ${g.membros.length} · ${lider.dados.lider ? 'Líder ' : ''}${esp.nome} <b>Nv.${lider.dados.nivel}</b>`,
        new THREE.Vector3(lider.x, lider.modelo.position.y + esp.altura * 1.3 + 0.8, lider.z), this.camera);
    } else if (maisPerto && est) {
      const esp = ESPECIES[maisPerto.dados.especie];
      const bolinhas = esp.elementos.map((el) => `<i style="background:${ELEMENTOS[el].cor}"></i>`).join('');
      const marca = esp.chefe || maisPerto.dados.chefe ? '<span class="duplo">Chefe · </span>' : esp.dupla ? '<span class="duplo">Tipo duplo · </span>' : '';
      this.jogo.mostrarRotulo(`${bolinhas}${marca}${esp.nome} <b>Nv.${maisPerto.dados.nivel}</b>`,
        new THREE.Vector3(maisPerto.x, maisPerto.modelo.position.y + esp.altura + 0.3, maisPerto.z), this.camera);
    } else if (dLoja < 7) {
      this.jogo.mostrarRotulo('<i style="background:#e8474a"></i>Loja de Poções <b>encoste para comprar</b>', new THREE.Vector3(lj.x, alturaEm(lj.x, lj.z) + 3, lj.z), this.camera);
    } else if (tv) {
      // placa em cima da plataforma da vila: o treinador (ou "em breve", enquanto ele não chegou)
      const prog = this.jogo.progressoVila(tv.vila.id), tr = tv.tr;
      if (!tr) this.jogo.mostrarRotulo(`<i style="background:#9a9a9a"></i>${tv.p.campeao ? 'Campeão' : 'Treinador ' + (tv.i + 1)} da ${tv.vila.nome} <b>em breve</b>`, new THREE.Vector3(tv.topo.x, tv.topo.y, tv.topo.z), this.camera);
      else {
        const nv = prog.dominada ? `Nv.${tr.revanche || 80}` : tr.niveis[0] === tr.niveis[1] ? `Nv.${tr.niveis[0]}` : `Nv.${tr.niveis[0]}–${tr.niveis[1]}`;
        const marca = prog.dominada ? ' · revanche' : tv.i < prog.vencidos ? ' · vencido ✓' : tv.i === prog.vencidos ? ' · sua vez!' : ' · depois';
        this.jogo.mostrarRotulo(`<i style="background:${tr.cor || ELEMENTOS[tr.elemento].cor}"></i>${tr.campeao ? (tr.chamada || 'Campeão') + ' ' : ''}${tr.nome} · ${ELEMENTOS[tr.elemento].nome} <b>${nv}</b>${marca}`, new THREE.Vector3(tv.topo.x, tv.topo.y, tv.topo.z), this.camera);
      }
    } else if (tp) {
      // placa em cima do treinador: nome, elemento, níveis e se já foi vencido
      const prog = this.jogo.progressoArena(), tr = tp.tr;
      const nv = prog.dominada ? `Nv.${nivelRevanche(tr)}` : tr.niveis[0] === tr.niveis[1] ? `Nv.${tr.niveis[0]}` : `Nv.${tr.niveis[0]}–${tr.niveis[1]}`;
      const marca = prog.dominada ? ' · revanche' : tp.i < prog.vencidos ? ' · vencido ✓' : tp.i === prog.vencidos ? ' · sua vez!' : ' · depois';
      this.jogo.mostrarRotulo(`<i style="background:${tr.cor}"></i>${tr.campeao ? 'Rei ' : ''}${tr.nome} · ${ELEMENTOS[tr.elemento].nome} <b>${nv}</b>${marca}`,
        new THREE.Vector3(tp.topo.x, tp.topo.y, tp.topo.z), this.camera);
    } else this.jogo.mostrarRotulo(null);

    this.posicionarCamera(1 - Math.exp((this.girandoCam ? -18 : -6) * dt)); // girando: responde na hora
  }

  // Move um monstro (ou grupo) para frente; se bater em algo, vira
  andar(s, passo, raio) {
    s.x += Math.sin(s.ang) * passo;
    s.z += Math.cos(s.ang) * passo;
    const p = { x: s.x, z: s.z };
    this.colidir(p, raio);
    if (p.x !== s.x || p.z !== s.z) s.ang += Math.PI * 0.5;
    s.x = p.x; s.z = p.z;
  }

  // Monstros dão meia-volta quando chegam perto da casa (ou da Estrada Real)
  fugirDaCasa(s) { // (da Estrada Real e da bandeira)
    const e = naEstradaReal(s.x, s.z), m = s.grupo ? 3 : 0;
    if (e.dentro && e.lat < SEGURA_ESTRADA + m) {
      const d = e.dir, lado = -s.x * d.z + s.z * d.x >= 0 ? 1 : -1; // de que lado do caminho ele está
      s.ang = Math.atan2(-d.z * lado, d.x * lado);
      return true;
    }
    // ninguém entra no Reino: dá meia-volta antes da muralha
    if (Math.hypot(s.x, s.z) < RAIO_REINO + 8 + m) { s.ang = Math.atan2(s.x, s.z); return true; }
    // nem nas vilas (dá meia-volta antes da cerca)
    const v = this.vilas?.vilaEm(s.x, s.z, 6 + m);
    if (v) { s.ang = Math.atan2(s.x - v.x, s.z - v.z); return true; }
    // nem nos refúgios (o Acampamento do Gelo)
    const rf = this.refugioEm(s.x, s.z, 6 + m);
    if (rf) { s.ang = Math.atan2(s.x - rf.x, s.z - rf.z); return true; }
    if (!this.bandeiraPos) return false;
    const dx = s.x - this.bandeiraPos.x, dz = s.z - this.bandeiraPos.z;
    if (Math.hypot(dx, dz) > AREA_SEGURA_BANDEIRA + (s.grupo ? 3 : 0)) return false;
    s.ang = Math.atan2(dx, dz);
    return true;
  }

  // Câmera girando devagar em volta do castelo, para a tela de título
  orbitar(t) {
    const a = t * 0.08, c = REINO.paraMundo(0, -12), y = REINO.h;
    this.camera.position.set(c.x + Math.sin(a) * 62, y + 30, c.z + Math.cos(a) * 62);
    this.camera.lookAt(c.x, y + 10, c.z);
    this.chunks.atualizar(c.x, c.z);
    this.chunks.animar(t);
    for (const s of this.selvagens) animarModelo(s.modelo, t, false);
    for (const g of this.grupos) for (const m of g.membros) {
      m.modelo.position.set(m.x, alturaEm(m.x, m.z), m.z);
      animarModelo(m.modelo, t, false);
    }
    this.cristalFonte.rotation.y = t;
  }
}
