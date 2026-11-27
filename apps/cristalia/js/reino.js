// =============================================================
// O REINO: a região nova fora da borda do mapa (o novo centro do jogo)
//  - Um platô redondo (100 m de raio) NO MEIO do mapa, com muralha e 5 portões (um por bioma).
//  - O castelo no meio, a praça com a fonte de cura, a vila (telhados azuis)
//    com a loja de poções e a arena fechada (telhado vermelho) com a plateia
//    e os 5 treinadores no palco.
//  - Uma estrada em anel liga os 5 portões; de cada portão sai um caminho seguro
//    (a Estrada Real) com lanternas e bandeiras. Entre o anel e a muralha fica
//    espaço livre para as coisas novas do Reino.
// Para pesar pouco no celular, todas as peças paradas viram poucas malhas:
// uma com as cores normais, uma com as peças vistas dos dois lados e uma
// com o que brilha (janelas, poções, lanternas). A plateia é um lote só.
// O desenho usa coordenadas "locais" do Reino: (0, 0) é o meio do platô e
// +z aponta para o portão principal (o da Floresta). REINO.paraMundo() converte.
// =============================================================
import * as THREE from 'three';
import { REINO } from './dungeon.js';
import { ESTRADAS, RAIO_REINO, aleatorio } from './mapa/gerador.js';
import { materialFuro } from './biomas/comum.js';
import { ESPECIES, criarMonstro, formaPorNivel, especieDaEscolha } from './dados.js';

// ---------- medidas do Reino (locais) ----------
export const FONTE_REINO = { x: 0, z: 15 };          // a fonte de cura, na praça
export const NASCER_REINO = { x: 0, z: 21 };         // onde o jogador aparece (de frente para o castelo)
export const ARENA_REINO = { x: -34, z: 14 };        // centro da arena (o portão abre para a praça da fonte)
// A casa do jogador (fixa): entre a arena e o portão, virada para o caminho do portão (+x).
// Tem espaço em volta para crescer até o nível 5 e para o jardim.
export const CASA_REINO = { x: -26, z: 44, rot: Math.PI / 2 };
export const RAIO_MURALHA = RAIO_REINO - 4; // a muralha (o Reino tem 100 m de raio no mundo novo)
export const RAIO_ANEL = 66;                 // a estrada em anel que liga os 5 portões (dentro da muralha)
// Os 5 portões, um para cada bioma: ângulo no desenho do Reino (0 = +x, PI/2 = +z = o portão principal)
export const PORTOES = ESTRADAS.map((e) => {
  const l = REINO.paraLocal(e.dir.x * 50, e.dir.z * 50);
  return { bioma: e.bioma, ang: Math.atan2(l.z, l.x) };
});
const ARENA = { r0: 9, deg: 7, passo: 1.2, palco: 0.87, porta: 0.16 }; // areia, degraus, aberturas (radianos)

// Os 5 treinadores da arena, na ordem da luta: Fogo > Trevas > Luz > Água > Planta (o Campeão).
//  niveis: de que nível a que nível vão os monstros de cada um na 1ª vez.
//  Cada um fica na sua plataforma, espalhadas pela areia em zigue-zague do portão
//  até o palco, cada uma mais alta que a anterior:
//  ang = ângulo em volta do meio da arena (0 = portão), r = distância do meio, alt = altura.
//  equipe: os monstros, na ordem em que entram ("L:fogo" = da linha de Fogo, na forma do nível).
//  fala: o que ele diz antes da luta. premio: cristais da 1ª vitória (revanche: 1 Forte, e o Rei dá +1 Supremo).
//  moedas: ouro da 1ª vitória (revanche: metade).
//  revanche: o nível de todos os monstros dele nas revanches (depois de dominar a arena).
//  A forma vem do nível: do Nv.50 para cima, a forma final (a evolução rara).
export const TREINADORES = [
  { id: 'gill', nome: 'Gill', elemento: 'fogo', cor: '#d94a4a', niveis: [20, 24], ang: 55, r: 6.3, alt: 0.5,
    equipe: [['L:fogo', 20], ['vulcarapa', 22], ['L:fogo', 24]], fala: 'Gill: Ha! Vamos ver se você aguenta o calor!', premio: { comum: 3, forte: 1 }, moedas: 80, revanche: 50 },
  { id: 'cris', nome: 'Cris', elemento: 'trevas', cor: '#8a4ad9', niveis: [25, 29], ang: -55, r: 6.3, alt: 0.8,
    equipe: [['L:trevas', 25], ['L:lua', 27], ['L:trevas', 29]], fala: 'Cris: As sombras já sabem como isso termina...', premio: { comum: 3, forte: 1 }, moedas: 100, revanche: 55 },
  { id: 'lana', nome: 'Lana', elemento: 'luz', cor: '#e0b030', niveis: [30, 34], ang: 125, r: 6.3, alt: 1.1,
    equipe: [['L:luz', 30], ['L:sol', 32], ['L:luz', 34]], fala: 'Lana: Prepare os olhos. Vai brilhar!', premio: { comum: 3, forte: 2 }, moedas: 130, revanche: 60 },
  { id: 'sheyla', nome: 'Sheyla', elemento: 'agua', cor: '#3d7bd9', niveis: [40, 45], ang: -125, r: 6.3, alt: 1.4,
    equipe: [['L:agua', 40], ['aquaraia', 43], ['L:agua', 45]], fala: 'Sheyla: A maré está do meu lado. Venha!', premio: { forte: 3 }, moedas: 170, revanche: 70 },
  // o Rei já começa no Nv.50, com a forma final de todos os monstros
  // (o Espinhal dele já vem como Mandacarão, a forma final do raro)
  { id: 'julius', nome: 'Julius', elemento: 'planta', cor: '#3faf5a', niveis: [50, 50], ang: 180, r: 6.6, alt: 2, campeao: true,
    equipe: [['L:planta', 50], ['mandacarao', 50], ['L:planta', 50], ['L:planta', 50]], fala: 'Rei Julius: Chegou longe. Mostre que merece esta coroa!', premio: { forte: 3, supremo: 2 }, moedas: 500, revanche: 100 },
];
// Depois que a arena for dominada (todos vencidos 1 vez), cada um luta no seu nível de revanche
export const nivelRevanche = (tr) => tr.revanche || 50;

// Monta a equipe de um treinador (dados de monstros novos, com a vida cheia)
export function equipeDoTreinador(tr, revanche) {
  return tr.equipe.map(([e, nv], i) => {
    const nivel = revanche ? nivelRevanche(tr) : nv;
    const especie = especieDaEscolha(e, nivel, true); // treinador: forma pelo nível (até a final; os raros também)
    const d = criarMonstro(especie, nivel);
    d.onda = i + 1; // entram um de cada vez, nesta ordem
    return d;
  });
}
export const nomeEspecie = (id) => ESPECIES[id]?.nome || id;

// ---------- cores ----------
const PEDRA = '#e8dcc4', PEDRA2 = '#cbbfa6', AZUL = '#3a5aa8', AZUL2 = '#2d4a8c', ARDOSIA = '#34508f';
const TELHA = '#c4553a', MAD = '#7a4b2c', MADE = '#5a3a24', REBOCO = '#efe0c0', VIDRO = '#2c3e5c', AREIA = '#e6cf98';
const LUZ = '#ffd37a';

// ---------- peças (as geometrias iguais são reaproveitadas) ----------
const GEOS = new Map();
const geo = (k, f) => { if (!GEOS.has(k)) GEOS.set(k, f()); return GEOS.get(k); };
export const caixa = (x, y, z) => geo(`c${x}|${y}|${z}`, () => new THREE.BoxGeometry(x, y, z));
export const cil = (a, b, h, n = 8) => geo(`y${a}|${b}|${h}|${n}`, () => new THREE.CylinderGeometry(a, b, h, n));
export const cone = (r, h, n = 8) => geo(`k${r}|${h}|${n}`, () => new THREE.ConeGeometry(r, h, n));
export const esfera = (r, a = 6, b = 4) => geo(`e${r}|${a}|${b}`, () => new THREE.SphereGeometry(r, a, b));
const ico = (r, d = 0) => geo(`i${r}|${d}`, () => new THREE.IcosahedronGeometry(r, d));
// telhado de duas águas (prisma): comprimento ao longo de x
export const prisma = (larg, comp, alt) => geo(`p${larg}|${comp}|${alt}`, () => {
  const f = new THREE.Shape([new THREE.Vector2(-larg / 2, 0), new THREE.Vector2(larg / 2, 0), new THREE.Vector2(0, alt)]);
  const g = new THREE.ExtrudeGeometry(f, { depth: comp, bevelEnabled: false });
  g.translate(0, 0, -comp / 2); g.rotateY(Math.PI / 2);
  return g;
});
// parede com um arco vazado (a arena)
const painelArco = (w, h, a, hb) => geo(`a${w}|${h}|${a}|${hb}`, () => {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
  const f = new THREE.Path(); f.moveTo(a, 0.25); f.lineTo(a, hb); f.absarc(0, hb, a, 0, Math.PI, false); f.lineTo(-a, 0.25); f.closePath();
  s.holes.push(f);
  return new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: false, curveSegments: 5 });
});

// Um "rascunho": um grupo comum do Three.js. Cada peça guarda a cor e o tipo
// (normal, duplo = vista dos dois lados, brilho = acende). No fim, assar() junta tudo.
export function peca(pai, g, cor, pos = [0, 0, 0], rot = [0, 0, 0], tipo = 'normal') {
  const m = new THREE.Mesh(g);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.userData.cor = cor;
  m.userData.tipo = tipo;
  pai.add(m);
  return m;
}
export const brilho = (pai, g, cor, pos, rot) => peca(pai, g, cor, pos, rot, 'brilho');
export const duplo = (pai, g, cor, pos, rot) => peca(pai, g, cor, pos, rot, 'duplo');

// Junta todas as peças do rascunho em até 3 malhas (cores nos vértices)
const MATS = {};
function material(tipo) {
  if (!MATS[tipo]) {
    MATS[tipo] = tipo === 'brilho'
      ? new THREE.MeshBasicMaterial({ vertexColors: true })
      : tipo === 'claro' // paredes brancas do castelo: um pouco de luz própria
        ? new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#77746c' })
        : new THREE.MeshLambertMaterial({ vertexColors: true, side: tipo === 'duplo' ? THREE.DoubleSide : THREE.FrontSide });
    materialFuro(MATS[tipo]); // o que é alto (atributo furo) fica meio transparente quando tampa o jogador
    MATS[tipo].userData.fixo = true; // são do Reino inteiro: o fim da batalha não pode apagar
  }
  return MATS[tipo];
}
export function assar(rascunho, cena) {
  rascunho.updateMatrixWorld(true);
  const chao = rascunho.getWorldPosition(new THREE.Vector3()).y; // o chão do Reino (ou da vila)
  const baldes = { normal: [], duplo: [], brilho: [], claro: [] };
  rascunho.traverse((o) => { if (o.isMesh) baldes[o.userData.tipo].push(o); });
  const c = new THREE.Color(), malhas = [];
  for (const [tipo, lista] of Object.entries(baldes)) {
    if (!lista.length) continue;
    let total = 0;
    const partes = lista.map((m) => {
      const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld);
      total += g.attributes.position.count;
      g.computeBoundingBox();
      // pode ficar transparente quando tampa o jogador? só o que é alto (casas, muralha, castelo, arena, árvores)
      const bb = g.boundingBox, alta = bb.max.y - chao >= 2.2 && bb.max.y - bb.min.y >= 0.8 ? 1 : 0;
      return [g, m.userData.cor, alta];
    });
    const pos = new Float32Array(total * 3), cores = new Float32Array(total * 3), furo = new Float32Array(total);
    let o = 0;
    for (const [g, cor, alta] of partes) {
      c.set(cor);
      const a = g.attributes.position.array;
      pos.set(a, o * 3);
      furo.fill(alta, o, o + a.length / 3);
      for (let k = 0; k < a.length / 3; k++) { cores[(o + k) * 3] = c.r; cores[(o + k) * 3 + 1] = c.g; cores[(o + k) * 3 + 2] = c.b; }
      o += a.length / 3;
      g.dispose();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
    g.setAttribute('furo', new THREE.BufferAttribute(furo, 1));
    g.computeVertexNormals(); // sem índice: cada triângulo fica com a sua cor de luz (low poly)
    g.computeBoundingSphere();
    const malha = new THREE.Mesh(g, material(tipo));
    malha.userData.geometriaPropria = true;
    cena.add(malha);
    malhas.push(malha);
  }
  return malhas;
}

// ---------- os treinadores (no estilo de blocos do treinador do jogador) ----------
const PELE = '#f2c9a0', PELE2 = '#c98f62';
function casacoLongo(g, cor, forro, comp) {
  for (const s of [-1, 1]) {
    peca(g, caixa(0.2, comp, 0.08), cor, [s * 0.2, 1.02 - comp / 2, 0.14], [0.05, 0, s * -0.12]);
    peca(g, caixa(0.06, comp - 0.05, 0.06), forro, [s * 0.11, 1.02 - comp / 2, 0.17], [0.05, 0, s * -0.12]);
  }
  peca(g, caixa(0.54, comp + 0.05, 0.08), cor, [0, 1.02 - comp / 2, -0.18], [-0.08, 0, 0]);
  peca(g, caixa(0.52, 0.2, 0.1), cor, [0, 1.1, -0.06], [-0.4, 0, 0]); // gola alta
}
// Poses dos braços: [cotovelo, mão] do braço direito (o esquerdo é o espelho, x trocado de sinal)
const POSES = {
  baixo: [[0.36, 0.78, 0], [0.38, 0.55, 0.02]],
  cintura: [[0.5, 0.8, -0.04], [0.27, 0.6, 0.08]],       // mão na cintura
  estendido: [[0.52, 0.95, 0.06], [0.68, 0.86, 0.16]],   // braço para o lado, mão aberta
  alto: [[0.46, 1.18, 0.02], [0.52, 1.42, 0.08]],        // braço para cima
  frente: [[0.38, 0.84, 0.16], [0.32, 0.86, 0.4]],       // punho para a frente
};
// Onde fica a mão numa pose (lado 1 = direito, -1 = esquerdo); dy sobe um pouco (para o efeito ficar em cima da mão)
const M = (pose, lado = 1, dy = 0.08) => { const h = POSES[pose][1]; return [lado * h[0], h[1] + dy, h[2]]; };
// Um "osso" (caixa comprida) de um ponto a outro: braços com cotovelo
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _cima = new THREE.Vector3(0, 1, 0), _qo = new THREE.Quaternion(), _eo = new THREE.Euler();
function osso(g, a, b, grossura, cor) {
  _a.set(...a); _b.set(...b).sub(_a);
  const len = _b.length();
  _qo.setFromUnitVectors(_cima, _b.clone().normalize());
  _eo.setFromQuaternion(_qo);
  peca(g, caixa(grossura, len + grossura * 0.4, grossura), cor, [_a.x + _b.x / 2, _a.y + _b.y / 2, _a.z + _b.z / 2], [_eo.x, _eo.y, _eo.z]);
}
// cabelo em rabo de cavalo (do alto da cabeça para trás e para baixo)
function rabo(g, cor, anel, n = 5, longo = 1) {
  peca(g, caixa(0.12, 0.12, 0.12), anel, [0, 1.52, -0.18]);
  for (let i = 0; i < n; i++) peca(g, ico(0.12 - i * 0.012, 0), cor, [0, 1.5 - i * 0.13 * longo, -0.28 - i * 0.05], [0.3, 0, 0]);
}
const VISUAL = {
  // ---------- os treinadores da Vila das Cinzas (pela arte do Lâmina) ----------
  // Sandy (Luz): cabelo branco em rabo de cavalo, jaqueta branca e dourada, top azul, saia e botas brancas
  sandy: { pose: ['estendido', 'cintura'], sob: '#c8c8d0', roupa: '#3d8fd0', manga: '#f4f2ee', calca: '#a8703e', bota: '#f4f2ee', botaAlta: true, cinto: '#3a6aa0', pele: '#a8703e', olho: '#ffc93a', olhoBrilha: true, luva: '#2a2a33',
    extra(g) {
      for (const s of [-1, 1]) { peca(g, caixa(0.14, 0.42, 0.06), '#f4f2ee', [s * 0.19, 0.86, 0.16]); peca(g, caixa(0.03, 0.42, 0.065), '#d8b040', [s * 0.11, 0.86, 0.165]); }
      for (const s of [-1, 1]) brilho(g, new THREE.OctahedronGeometry(0.11), '#d8f0ff', [s * 0.32, 1.06, 0]);
      peca(g, caixa(0.54, 0.24, 0.34), '#f4f2ee', [0, 0.42, 0]); // saia
      peca(g, caixa(0.55, 0.04, 0.35), '#d8b040', [0, 0.31, 0]);
      peca(g, ico(0.265, 1), '#e8e8f0', [0, 1.34, -0.04]);
      rabo(g, '#e8e8f0', '#d8b040', 6, 1.1);
      brilho(g, new THREE.OctahedronGeometry(0.1), '#fff2a0', M('estendido', 1, 0.12));
    } },
  // Brawn (Terra): bandana vermelha, barba, poncho cinza, camiseta mostarda, calça escura e botas marrons
  brawn: { pose: ['estendido', 'baixo'], roupa: '#d8a040', manga: '#d8a040', calca: '#34343a', bota: '#8a4a2a', botaAlta: true, cinto: '#6a4a2a', pele: '#c98f62', olho: '#3a2a1e', luva: '#3a2a22',
    extra(g) {
      peca(g, caixa(0.6, 0.3, 0.38), '#8a8a90', [0, 0.92, 0], [0, 0, 0]); // poncho
      peca(g, cone(0.36, 0.3, 4), '#8a8a90', [0, 0.65, 0.02], [Math.PI, Math.PI / 4, 0]);
      peca(g, caixa(0.2, 0.08, 0.22), '#6a6a70', [-0.3, 1.08, 0]); // ombreira de pedra
      peca(g, ico(0.26, 1), '#3a2a1e', [0, 1.35, -0.05]);
      for (let i = 0; i < 4; i++) peca(g, cone(0.06, 0.16, 4), '#3a2a1e', [-0.12 + i * 0.08, 1.55, -0.02], [-0.3, 0, (i - 1.5) * 0.3]);
      peca(g, caixa(0.53, 0.07, 0.53), '#c8402a', [0, 1.4, -0.02]); // bandana
      peca(g, caixa(0.06, 0.2, 0.04), '#c8402a', [0.08, 1.33, -0.29], [0.4, 0, 0.3]);
      peca(g, caixa(0.3, 0.12, 0.08), '#3a2a1e', [0, 1.13, 0.2]); // barba
      { const [x, y, z] = M('estendido'); for (let i = 0; i < 3; i++) peca(g, ico(0.07, 0), '#7a6a5a', [x - 0.1 + i * 0.1, y + 0.08 + (i % 2) * 0.12, z]); brilho(g, new THREE.OctahedronGeometry(0.07), '#ffb020', [x, y + 0.32, z]); }
    } },
  // Blaze (Raio): jaqueta preta e amarela, visor amarelo, fones, calça preta com faixas e botas de sola amarela
  blaze: { pose: ['estendido', 'frente'], roupa: '#1e1e24', manga: '#1e1e24', calca: '#1e1e24', bota: '#141418', botaAlta: true, cinto: '#3a3a40', pele: '#6a4630', olho: '#2a1a10', colete: '#2fc8d8',
    extra(g) {
      for (const s of [-1, 1]) { peca(g, caixa(0.05, 0.5, 0.31), '#ffd23f', [s * 0.25, 0.8, 0]); peca(g, caixa(0.14, 0.05, 0.16), '#ffd23f', [s * 0.35, 0.58, 0]); peca(g, caixa(0.21, 0.04, 0.27), '#ffd23f', [s * 0.12, 0.02, 0.03]); peca(g, caixa(0.19, 0.04, 0.21), '#9a9aa0', [s * 0.12, 0.3, 0]); }
      peca(g, caixa(0.52, 0.18, 0.12), '#ffd23f', [0, 1.06, -0.1], [-0.3, 0, 0]); // gola
      peca(g, ico(0.26, 1), '#141418', [0, 1.36, -0.04]);
      for (let i = 0; i < 5; i++) peca(g, cone(0.07, 0.18, 4), '#141418', [-0.16 + i * 0.08, 1.56, 0], [-0.2, 0, (i - 2) * 0.25]);
      brilho(g, caixa(0.42, 0.08, 0.06), '#ffe040', [0, 1.38, 0.2]); // visor
      peca(g, new THREE.TorusGeometry(0.16, 0.035, 4, 10), '#5a5a64', [0, 1.06, 0.05], [Math.PI / 2, 0, 0]); // fones no pescoço
      { const [x, y, z] = M('frente', -1); for (let i = 0; i < 4; i++) brilho(g, new THREE.OctahedronGeometry(0.06), i % 2 ? '#7ae8ff' : '#fff27a', [x + Math.cos(i * 1.6) * 0.14, y + Math.sin(i * 1.6) * 0.14, z]); }
    } },
  // Sotty (Água): cabelo azul curto, colete azul-marinho, camiseta branca, shorts, tênis vermelhos e mochila
  sotty: { pose: ['estendido', 'estendido'], roupa: '#f4f4f4', manga: '#b88458', calca: '#b88458', bota: '#e8604a', cinto: '#3a3e48', pele: '#b88458', olho: '#7a3a10', colete: '#2a4a9a', luva: '#b88458',
    extra(g) {
      for (const s of [-1, 1]) peca(g, caixa(0.16, 0.5, 0.32), '#2a4a9a', [s * 0.18, 0.78, 0]);
      peca(g, caixa(0.48, 0.2, 0.3), '#3a3e48', [0, 0.42, 0]); // shorts
      peca(g, caixa(0.36, 0.44, 0.18), '#3a8ac0', [0, 0.82, -0.24]); // mochila
      peca(g, ico(0.28, 1), '#2a9ab0', [0, 1.34, -0.04]);
      for (const s of [-1, 1]) peca(g, caixa(0.1, 0.24, 0.3), '#2a9ab0', [s * 0.24, 1.22, -0.02]);
      brilho(g, caixa(0.1, 0.1, 0.1), '#40e0ff', M('estendido', 1, -0.02)); // pulseira
      brilho(g, new THREE.TorusGeometry(0.3, 0.04, 4, 12), '#a8e8ff', M('estendido', 1, 0.05), [0.3, 0.6, 0]);
    } },
  // ---------- os treinadores da Vila da Areia (pela arte do Lâmina) ----------
  // Nicky (Trevas): casaco longo preto e roxo, cabelo preto com mechas roxas, olhos roxos e uma esfera de trevas
  nicky: { pose: ['estendido', 'cintura'], roupa: '#1c1822', manga: '#24202c', calca: '#18161e', bota: '#141218', botaAlta: true, cinto: '#5a2a8a', pele: '#e8c8b0', olho: '#b060ff', olhoBrilha: true, luva: '#141218',
    extra(g) {
      casacoLongo(g, '#24202c', '#8a3ad0', 0.95);
      peca(g, ico(0.27, 1), '#141218', [0, 1.36, -0.04]);
      for (let i = 0; i < 4; i++) peca(g, cone(0.07, 0.24, 4), i === 1 ? '#7a3ab8' : '#141218', [-0.14 + i * 0.09, 1.44, 0.14], [0.9, 0, (i - 1.5) * 0.25]); // franja
      brilho(g, new THREE.OctahedronGeometry(0.05), '#d0d0e0', [0, 0.52, 0.17]); // meia-lua no cinto
      brilho(g, ico(0.13, 1), '#a040ff', M('estendido', 1, 0.18));
    } },
  // Rony (Fogo): cabelo vermelho espetado, jaqueta vermelha, laranja e preta, calça preta e tênis vermelhos, punhos em chamas
  rony: { pose: ['frente', 'frente'], roupa: '#1e1a1e', manga: '#c8302a', calca: '#1e1a1e', bota: '#c8302a', cinto: '#3a3a3a', pele: '#b07850', olho: '#ff9a2a', luva: '#d8c8b0',
    extra(g) {
      for (const s of [-1, 1]) { peca(g, caixa(0.17, 0.52, 0.33), '#c8302a', [s * 0.18, 0.8, 0]); peca(g, caixa(0.04, 0.5, 0.335), '#ff8a2a', [s * 0.1, 0.8, 0]); peca(g, caixa(0.21, 0.05, 0.27), '#141414', [s * 0.12, 0.03, 0.03]); }
      peca(g, caixa(0.52, 0.16, 0.12), '#ff8a2a', [0, 1.06, -0.1], [-0.3, 0, 0]); // gola
      peca(g, ico(0.25, 1), '#8a1a2a', [0, 1.36, -0.05]);
      for (let i = 0; i < 6; i++) peca(g, cone(0.07, 0.26, 4), i % 2 ? '#c83a2a' : '#8a1a2a', [-0.15 + i * 0.06, 1.56, -0.02 - (i % 2) * 0.06], [-0.3, 0, (i - 2.5) * 0.2]);
      for (const s of [-1, 1]) brilho(g, cone(0.11, 0.3, 4), '#ff8a2a', M('frente', s, 0.12));
    } },
  // Jean (Água): cabelo castanho com pontas azuis, jaqueta branca e azul-piscina, bermuda cinza, tênis azuis e mochila
  jean: { pose: ['estendido', 'baixo'], roupa: '#a8e0e8', manga: '#2ab8c8', calca: '#b07a50', bota: '#2a8ac8', cinto: '#2a3a6a', pele: '#b07a50', olho: '#2a6ac8', luva: '#b07a50',
    extra(g) {
      for (const s of [-1, 1]) { peca(g, caixa(0.16, 0.54, 0.33), '#f2f2f2', [s * 0.18, 0.79, 0]); peca(g, caixa(0.04, 0.54, 0.335), '#2a3a6a', [s * 0.1, 0.79, 0]); }
      peca(g, caixa(0.46, 0.28, 0.3), '#5a5a62', [0, 0.38, 0]); // bermuda
      peca(g, caixa(0.34, 0.4, 0.16), '#2ab8c8', [0, 0.84, -0.24]); // mochila
      peca(g, ico(0.27, 1), '#8a5a30', [0, 1.36, -0.04]);
      for (let i = 0; i < 5; i++) peca(g, cone(0.07, 0.2, 4), i % 2 ? '#2ab8c8' : '#8a5a30', [-0.16 + i * 0.08, 1.5, -0.12], [-0.6, 0, (i - 2) * 0.35]);
      brilho(g, new THREE.OctahedronGeometry(0.04), '#40e0ff', [0, 1.0, 0.17]); // colar
      brilho(g, new THREE.TorusGeometry(0.28, 0.04, 4, 12), '#a8e8ff', M('estendido', 1, 0.05), [0.3, 0.6, 0]);
    } },
  // Nando (Planta): bandana verde com folhas, colete verde com bolsos, camisa creme, calça cáqui, botas verdes e bolsa de poções
  nando: { pose: ['estendido', 'frente'], roupa: '#ece2c8', manga: '#ece2c8', calca: '#9a8460', bota: '#4a7a3a', botaAlta: true, cinto: '#5a3a24', pele: '#6a4430', olho: '#2a7a3a', luva: '#6a4a2a', colete: '#c8b48a',
    extra(g) {
      for (const s of [-1, 1]) peca(g, caixa(0.16, 0.5, 0.33), '#4a8a3a', [s * 0.18, 0.79, 0]);
      peca(g, caixa(0.06, 0.62, 0.34), '#6a4a2a', [0.02, 0.8, 0], [0, 0, -0.6]); // alça da bolsa
      peca(g, caixa(0.26, 0.2, 0.12), '#7a5a34', [0.24, 0.48, 0.1]);
      brilho(g, cil(0.04, 0.04, 0.12, 5), '#40e070', [0.2, 0.62, 0.15]);
      peca(g, ico(0.26, 1), '#4a2a1a', [0, 1.36, -0.04]);
      for (let i = 0; i < 5; i++) peca(g, cil(0.035, 0.035, 0.2, 4), '#4a2a1a', [-0.14 + i * 0.07, 1.5, -0.08], [0.3, 0, (i - 2) * 0.3]);
      peca(g, caixa(0.53, 0.08, 0.53), '#6a9a3a', [0, 1.42, -0.02]); // bandana
      for (const s of [-1, 1]) peca(g, cone(0.05, 0.16, 3), '#5ac04a', [s * 0.18, 1.5, 0.2], [0.4, 0, s * 0.5]);
      brilho(g, cone(0.06, 0.18, 3), '#90ff70', M('frente', -1, 0.12)); // o brotinho na mão
    } },
  // Pedro (Terra, o Campeão): moicano preto, cavanhaque, regata cinza, ombreira de pedra, calça oliva, joelheiras e botas de armadura
  pedro: { pose: ['frente', 'frente'], roupa: '#6a6a70', manga: '#b07a50', calca: '#5a5a3a', bota: '#8a8a90', botaAlta: true, cinto: '#6a4a2a', pele: '#b07a50', olho: '#2a2018', luva: '#7a4a2a',
    extra(g) {
      peca(g, caixa(0.3, 0.22, 0.4), '#7a7a80', [-0.3, 1.08, 0], [0, 0, 0.3]); // ombreira de pedra
      peca(g, caixa(0.2, 0.12, 0.3), '#b0603a', [-0.36, 0.98, 0]);
      peca(g, caixa(0.2, 0.36, 0.05), '#6a6a70', [0, 0.35, 0.17]); // a faixa da frente
      brilho(g, cil(0.07, 0.07, 0.04, 6), '#d8b040', [0, 0.53, 0.17]);
      for (const s of [-1, 1]) peca(g, caixa(0.2, 0.12, 0.08), '#7a7a80', [s * 0.12, 0.28, 0.12]);
      peca(g, ico(0.25, 1), '#b07a50', [0, 1.35, -0.03]);
      peca(g, caixa(0.1, 0.12, 0.42), '#141414', [0, 1.55, -0.04]); // moicano
      peca(g, caixa(0.1, 0.09, 0.07), '#141414', [0, 1.16, 0.21]); // cavanhaque
      for (let i = 0; i < 3; i++) brilho(g, new THREE.OctahedronGeometry(0.07), '#ffb020', [Math.cos(i * 2.1) * 0.5, 0.8 + i * 0.15, Math.sin(i * 2.1) * 0.3]);
    } },
  // ---------- os treinadores da Vila das Marés (pela arte do Lâmina) ----------
  // Karah (Fogo): cachos pretos com contas douradas, top vermelho, capa laranja, braceletes de ouro e anéis de fogo
  karah: { pose: ['alto', 'estendido'], roupa: '#a82a2a', manga: '#7a4a30', calca: '#8a5a38', bota: '#5a3a24', botaAlta: true, cinto: '#8a8a90', pele: '#7a4a30', olho: '#ffb030', olhoBrilha: true, luva: '#7a4a30',
    extra(g) {
      peca(g, caixa(0.5, 0.2, 0.31), '#7a4a30', [0, 0.62, 0]); // a barriga de fora
      peca(g, caixa(0.52, 0.66, 0.06), '#e0602a', [0, 0.78, -0.2], [-0.12, 0, 0]); // capa
      peca(g, caixa(0.2, 0.4, 0.05), '#a82a2a', [0, 0.32, 0.16]); // a faixa da frente
      for (const s of [-1, 1]) peca(g, caixa(0.15, 0.1, 0.16), '#d8b040', [s * 0.35, 0.6, 0]);
      peca(g, ico(0.27, 1), '#141414', [0, 1.36, -0.05]);
      for (let i = 0; i < 7; i++) peca(g, ico(0.09, 0), '#141414', [-0.2 + (i % 4) * 0.13, 1.12 - Math.floor(i / 4) * 0.12, -0.2 - (i % 2) * 0.04]);
      brilho(g, ico(0.04), '#d8b040', [0.12, 1.5, 0.1]);
      brilho(g, new THREE.TorusGeometry(0.24, 0.05, 4, 12), '#ff9a2a', M('alto', 1, 0.1), [0.2, 0.8, 0]);
      brilho(g, new THREE.TorusGeometry(0.24, 0.05, 4, 12), '#ff9a2a', M('estendido', -1, 0.05), [0.2, -0.8, 0]);
    } },
  // Angelica (Fogo): cabelo loiro preso com grampos vermelhos, casaco branco com vermelho e dourado, leque e uma espiral de fogo
  angelica: { pose: ['estendido', 'frente'], roupa: '#3a1a22', manga: '#efe6d2', calca: '#efe6d2', bota: '#4a2030', botaAlta: true, cinto: '#5a2a2a', pele: '#f2d8c8', olho: '#5a9a3a', luva: '#3a1a22',
    extra(g) {
      casacoLongo(g, '#efe6d2', '#b82a3a', 0.95);
      for (const s of [-1, 1]) peca(g, caixa(0.16, 0.06, 0.2), '#d8b040', [s * 0.3, 1.05, 0]); // dragonas
      peca(g, caixa(0.36, 0.42, 0.05), '#a82838', [0, 0.36, 0.17]); // saia vermelha
      peca(g, ico(0.265, 1), '#f0e0a8', [0, 1.35, -0.04]);
      peca(g, ico(0.14, 1), '#f0e0a8', [0, 1.58, -0.08]); // o coque
      for (const s of [-1, 1]) peca(g, caixa(0.03, 0.18, 0.03), '#c82a3a', [s * 0.06, 1.66, -0.08], [0, 0, s * 0.4]);
      peca(g, caixa(0.46, 0.6, 0.1), '#f0e0a8', [0, 1.06, -0.2]); // o cabelo comprido atrás
      peca(g, new THREE.CircleGeometry(0.28, 7, 0, Math.PI), '#e8dcc0', M('frente', -1, 0.12), [0, 0, 0], 'duplo'); // o leque
      brilho(g, new THREE.TorusGeometry(0.22, 0.05, 4, 10, Math.PI * 1.5), '#ffd070', M('estendido', 1, 0.16), [0.3, 0.7, 0]);
    } },
  // Lanny (Raio): cabelo branco com mechas roxas, jaqueta branca e roxa, blusa e meias listradas, saia roxa e fones
  lanny: { pose: ['alto', 'cintura'], sob: '#c8c8d0', roupa: '#f2eef6', manga: '#8a3ad0', calca: '#8a3ad0', bota: '#f2eef6', botaAlta: true, cinto: '#f2eef6', pele: '#f0d0c0', olho: '#a050e0', luva: '#f2eef6',
    extra(g) {
      for (let i = 0; i < 3; i++) peca(g, caixa(0.505, 0.06, 0.305), '#8a3ad0', [0, 0.62 + i * 0.13, 0]); // listras da blusa
      for (const s of [-1, 1]) { peca(g, caixa(0.15, 0.5, 0.33), '#f2eef6', [s * 0.18, 0.82, 0]); for (let i = 0; i < 3; i++) peca(g, caixa(0.19, 0.05, 0.21), '#f2eef6', [s * 0.12, 0.2 + i * 0.1, 0]); }
      peca(g, caixa(0.56, 0.2, 0.36), '#7a2ac0', [0, 0.44, 0]); // saia
      peca(g, ico(0.265, 1), '#f4f4f8', [0, 1.36, -0.04]);
      peca(g, caixa(0.18, 0.26, 0.08), '#8a3ad0', [-0.12, 1.32, 0.2], [0, 0, 0.3]); // franja roxa
      peca(g, new THREE.TorusGeometry(0.16, 0.035, 4, 10), '#f2eef6', [0, 1.06, 0.05], [Math.PI / 2, 0, 0]); // fones
      { const [x, y, z] = M('alto'); for (let i = 0; i < 4; i++) brilho(g, new THREE.OctahedronGeometry(0.06), '#d080ff', [x + (i % 2 ? 0.08 : -0.06), y + 0.06 + i * 0.12, z]); }
    } },
  // Ilia (Trevas): cabelo preto e vinho, capa com capuz e estrelas roxas, roupa preta, braceletes, frascos e adagas
  ilia: { pose: ['estendido', 'baixo'], roupa: '#24202a', manga: '#e8c8b8', calca: '#18161c', bota: '#1e1a22', botaAlta: true, cinto: '#5a3a2a', pele: '#e8c8b8', olho: '#c8b0f0', luva: '#5a3a2a',
    extra(g) {
      peca(g, caixa(0.62, 0.95, 0.06), '#1e1a24', [0, 0.62, -0.2], [-0.1, 0, 0]); // a capa
      for (let i = 0; i < 4; i++) brilho(g, ico(0.025), '#c080ff', [-0.2 + i * 0.13, 0.4 + (i % 2) * 0.3, -0.24]); // estrelas da capa
      peca(g, caixa(0.5, 0.24, 0.16), '#1e1a24', [0, 1.12, -0.16]); // o capuz caído
      for (let i = 0; i < 3; i++) brilho(g, cil(0.035, 0.035, 0.1, 5), '#b050ff', [-0.15 + i * 0.12, 0.52, 0.17]);
      peca(g, ico(0.27, 1), '#2a1418', [0, 1.36, -0.04]);
      for (let i = 0; i < 4; i++) peca(g, cone(0.08, 0.3, 4), i % 2 ? '#7a1a2a' : '#2a1418', [-0.2 + i * 0.13, 1.18, -0.1], [Math.PI, 0, (i - 1.5) * 0.3]);
      peca(g, caixa(0.04, 0.28, 0.04), '#c8c8d0', M('estendido', 1, 0.08), [0, 0, -1.2]); peca(g, caixa(0.04, 0.24, 0.04), '#c8c8d0', M('baixo', -1, -0.1), [0.3, 0, 0]); // adagas
      for (let i = 0; i < 3; i++) brilho(g, new THREE.OctahedronGeometry(0.05), '#b050ff', [0.82 + i * 0.1, 0.96 - i * 0.05, 0.2]);
    } },
  // Serena (Água, a Campeã): tranças azuis com conchas, blusa azul e branca, leggings azul-marinho, faixa turquesa e botas brancas
  serena: { pose: ['estendido', 'estendido'], roupa: '#5aa8e0', manga: '#a06a44', calca: '#1e2a5a', bota: '#f2f2f2', botaAlta: true, cinto: '#2ac0c0', pele: '#a06a44', olho: '#40b0ff', olhoBrilha: true, luva: '#a06a44',
    extra(g) {
      peca(g, caixa(0.06, 0.56, 0.31), '#f2f2f2', [0.08, 0.77, 0], [0, 0, 0.5]); // faixa branca na blusa
      peca(g, caixa(0.5, 0.3, 0.32), '#5aa8e0', [0, 0.42, 0]); // a túnica
      peca(g, caixa(0.18, 0.14, 0.08), '#7a4a2a', [-0.2, 0.46, 0.17]); // o livrinho
      peca(g, ico(0.27, 1), '#1a2a6a', [0, 1.36, -0.04]);
      for (let i = 0; i < 6; i++) peca(g, cil(0.045, 0.035, 0.5, 4), '#1a2a6a', [-0.2 + i * 0.08, 1.02, -0.2], [0.2, 0, (i - 2.5) * 0.08]);
      for (let i = 0; i < 3; i++) peca(g, ico(0.04), '#f8f0e0', [-0.15 + i * 0.15, 1.22, -0.22]); // conchas
      brilho(g, new THREE.TorusGeometry(0.3, 0.04, 4, 12), '#a8e8ff', M('estendido', 1, 0.08), [0.3, 0.6, 0]);
      brilho(g, new THREE.TorusGeometry(0.26, 0.04, 4, 12), '#a8e8ff', M('estendido', -1, 0.04), [0.5, -0.6, 0]);
    } },
  // ---------- os treinadores da Vila da Neve (pela arte do Lâmina: o tema é o baralho) ----------
  // Clayton (Água): terno azul-petróleo, colete, gravata, luvas pretas, cabelo azul com mecha prateada e cartas de gelo
  clayton: { pose: ['estendido', 'cintura'], roupa: '#1e3a44', manga: '#1e3a44', calca: '#16161c', bota: '#101014', cinto: '#16161c', pele: '#b07850', olho: '#40c0e0', luva: '#141418', colete: '#2a5a66',
    extra(g) {
      peca(g, caixa(0.14, 0.2, 0.04), '#f4f4f4', [0, 0.95, 0.165]); // camisa
      peca(g, caixa(0.05, 0.26, 0.03), '#2ab0c0', [0, 0.86, 0.18]); // gravata
      for (const s of [-1, 1]) peca(g, caixa(0.08, 0.5, 0.05), '#16262e', [s * 0.16, 0.8, 0.17], [0, 0, s * 0.15]); // lapelas
      peca(g, ico(0.26, 1), '#1a2a6a', [0, 1.37, -0.05]);
      for (let i = 0; i < 4; i++) peca(g, cone(0.07, 0.24, 4), i === 2 ? '#c8d0dc' : '#1a2a6a', [-0.12 + i * 0.08, 1.52, -0.06], [-0.5, 0, (i - 1.5) * 0.3]);
      const [x, y, z] = M('estendido');
      for (let i = 0; i < 4; i++) brilho(g, caixa(0.14, 0.2, 0.01), '#a8e8ff', [x + 0.08 + i * 0.09, y + 0.1 - i * 0.1, z + 0.05], [0, 0, -0.4 - i * 0.3]);
    } },
  // Siberius (Planta): paletó vinho e verde com bordado dourado, camisa creme, barba, mecha verde e cartas de coração com cipós
  siberius: { pose: ['estendido', 'cintura'], roupa: '#efe6cc', manga: '#5a1a2a', calca: '#16322a', bota: '#6a4024', cinto: '#4a2a1a', pele: '#9a6a44', olho: '#3aa050', luva: '#9a6a44',
    extra(g) {
      peca(g, caixa(0.17, 0.52, 0.32), '#5a1a2a', [-0.18, 0.8, 0]); // metade vinho
      peca(g, caixa(0.17, 0.52, 0.32), '#1f5a3a', [0.18, 0.8, 0]);  // metade verde
      for (const s of [-1, 1]) peca(g, caixa(0.03, 0.5, 0.33), '#d8b040', [s * 0.1, 0.8, 0]);
      brilho(g, ico(0.05), '#e02a3a', [0.2, 0.98, 0.17]); // a rosa
      peca(g, ico(0.26, 1), '#4a2e1a', [0, 1.37, -0.05]);
      peca(g, caixa(0.12, 0.2, 0.08), '#3a8a3a', [0.13, 1.4, 0.18], [0, 0, -0.3]); // mecha verde
      peca(g, caixa(0.3, 0.1, 0.08), '#4a2e1a', [0, 1.13, 0.2]); // barba
      const [x, y, z] = M('estendido');
      for (let i = 0; i < 2; i++) brilho(g, caixa(0.14, 0.2, 0.01), '#ffd0d8', [x + i * 0.1, y + 0.16, z + 0.05], [0, 0, -0.2 - i * 0.25]);
      for (let i = 0; i < 5; i++) peca(g, cone(0.04, 0.12, 3), '#4aa04a', [-0.45 + i * 0.22, 0.25 + Math.sin(i) * 0.12, 0.35 - (i % 2) * 0.2], [0, 0, i]);
      for (let i = 0; i < 3; i++) brilho(g, ico(0.045), '#e02a3a', [-0.3 + i * 0.3, 0.32 + i * 0.06, 0.3]);
    } },
  // Hela (Raio): trança loira comprida, casaco branco com ombros dourados, top preto, saia branca, botas brancas e leque de cartas douradas
  hela: { pose: ['estendido', 'baixo'], sob: '#d8c890', roupa: '#1a1a1e', manga: '#f4f2ee', calca: '#1a1a1e', bota: '#f4f2ee', botaAlta: true, cinto: '#d8b040', pele: '#4a2e20', olho: '#ffd040', olhoBrilha: true, luva: '#4a2e20',
    extra(g) {
      for (const s of [-1, 1]) { peca(g, caixa(0.15, 0.36, 0.33), '#f4f2ee', [s * 0.19, 0.9, 0]); peca(g, cone(0.14, 0.18, 4), '#d8b040', [s * 0.3, 1.1, 0], [0, 0, s * -1.2]); }
      peca(g, caixa(0.52, 0.26, 0.34), '#f4f2ee', [0, 0.4, 0], [0, 0, 0.12]); // saia
      peca(g, ico(0.265, 1), '#e8d8a0', [0, 1.36, -0.05]);
      rabo(g, '#e8d8a0', '#d8b040', 9, 1.2);
      for (const s of [-1, 1]) brilho(g, new THREE.OctahedronGeometry(0.035), '#ffd040', [s * 0.25, 1.22, 0.05]); // brincos
      const [x, y, z] = M('estendido');
      for (let i = 0; i < 4; i++) brilho(g, caixa(0.13, 0.19, 0.01), '#ffd040', [x - 0.06 + i * 0.05, y + 0.18, z + 0.05], [0, 0, 0.5 - i * 0.33]);
      for (let i = 0; i < 3; i++) brilho(g, new THREE.OctahedronGeometry(0.05), '#fff6a0', [x + 0.18 - i * 0.1, y + 0.35 + i * 0.08, z]);
    } },
  // Tila (Fogo): cabelo vermelho com mecha preta, jaqueta vermelha com ombreiras pretas, colete preto, calça preta com chamas e a carta em chamas
  tila: { pose: ['alto', 'frente'], roupa: '#1e1a1e', manga: '#a82a2a', calca: '#1e1a1e', bota: '#1e1a1e', botaAlta: true, cinto: '#5a3a2a', pele: '#c08a5a', olho: '#ff9a2a', olhoBrilha: true, luva: '#1e1a1e',
    extra(g) {
      for (const s of [-1, 1]) { peca(g, caixa(0.16, 0.36, 0.33), '#a82a2a', [s * 0.19, 0.9, 0]); peca(g, caixa(0.22, 0.08, 0.26), '#1e1a1e', [s * 0.3, 1.06, 0]); brilho(g, cone(0.05, 0.2, 4), '#ff7a2a', [s * 0.12, 0.3, 0.11]); }
      peca(g, caixa(0.5, 0.12, 0.31), '#c08a5a', [0, 0.6, 0]); // a barriga de fora
      peca(g, ico(0.26, 1), '#c8302a', [0, 1.36, -0.05]);
      for (let i = 0; i < 5; i++) peca(g, cone(0.07, 0.24, 4), i === 3 ? '#141414' : '#c8302a', [-0.14 + i * 0.07, 1.55, -0.04], [-0.3, 0, (i - 2) * 0.3]);
      const [x, y, z] = M('alto');
      brilho(g, caixa(0.14, 0.2, 0.01), '#fff4e0', [x, y + 0.1, z + 0.03]);
      brilho(g, cone(0.08, 0.22, 4), '#ff8a2a', [x, y + 0.28, z]);
      brilho(g, new THREE.TorusGeometry(0.2, 0.05, 4, 12, Math.PI * 1.6), '#ff9a2a', [x, y - 0.3, z], [0.4, 0.5, 0]);
    } },
  // Joker (Raio, o Campeão): rosto pintado, cabelo azul e prateado, gola franzida, fraque preto e azul, colete xadrez, calça listrada e a carta do coringa
  joker: { pose: ['alto', 'frente'], sob: '#3a2a4a', roupa: '#1a1a22', manga: '#1a1a22', calca: '#f2f2f2', bota: '#141418', botaAlta: true, cinto: '#d8b040', pele: '#f2eef0', olho: '#40d0e0', olhoBrilha: true, luva: '#f8f8f8',
    extra(g) {
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) peca(g, caixa(0.1, 0.11, 0.02), (i + j) % 2 ? '#2ac0c8' : '#141418', [-0.05 + j * 0.1, 0.62 + i * 0.11, 0.16]); // colete xadrez
      for (const s of [-1, 1]) { peca(g, caixa(0.16, 0.5, 0.33), s > 0 ? '#2ac0c8' : '#1a1a22', [s * 0.18, 0.8, 0]); peca(g, caixa(0.2, 0.75, 0.05), '#1a1a22', [s * 0.14, 0.55, -0.18], [-0.1, 0, s * 0.1]); } // fraque
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) peca(g, caixa(0.05, 0.42, 0.215), '#141418', [s * (0.07 + i * 0.05), 0.28, 0]); // listras da calça
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; peca(g, caixa(0.12, 0.08, 0.05), '#f2f2f2', [Math.cos(a) * 0.22, 1.08, Math.sin(a) * 0.17]); } // gola franzida
      for (const s of [-1, 1]) brilho(g, ico(0.04), '#d8b040', [s * 0.16, 0.36, 0.17]); // guizos
      peca(g, ico(0.26, 1), '#c8d0dc', [0, 1.37, -0.05]);
      for (let i = 0; i < 5; i++) peca(g, cone(0.07, 0.26, 4), i % 2 ? '#2ac0c8' : '#c8d0dc', [-0.15 + i * 0.075, 1.56, -0.03], [-0.3, 0, (i - 2) * 0.32]);
      peca(g, caixa(0.03, 0.12, 0.01), '#2ac0c8', [-0.09, 1.25, 0.25]); // pintura no rosto
      peca(g, caixa(0.03, 0.12, 0.01), '#a040c0', [0.09, 1.25, 0.25]);
      const [x, y, z] = M('alto');
      brilho(g, caixa(0.15, 0.22, 0.01), '#f4f8ff', [x, y + 0.14, z + 0.03], [0, 0, -0.2]);
      for (let i = 0; i < 4; i++) brilho(g, new THREE.OctahedronGeometry(0.05), i % 2 ? '#c070ff' : '#50e8ff', [(i % 2 ? 1 : -1) * 0.55, 0.5 + i * 0.18, 0.1]);
    } },
  // ---------- os treinadores da Vila das Folhas (pela arte do Lâmina) ----------
  // Richard (Fogo): moicano vermelho, jaqueta vermelha e cinza com ombreiras de espinhos, joelheiras, frascos acesos e os punhos de fogo
  richard: { pose: ['frente', 'frente'], roupa: '#b8402a', manga: '#b8402a', calca: '#5a4030', bota: '#8a3a24', botaAlta: true, cinto: '#4a4a50', pele: '#a8703e', olho: '#ff9a2a', olhoBrilha: true, luva: '#4a2a1a', colete: '#5a5a60',
    extra(g) {
      for (const s of [-1, 1]) { peca(g, ico(0.17, 0), '#a8402a', [s * 0.3, 1.04, 0]); for (let i = 0; i < 3; i++) peca(g, cone(0.04, 0.14, 4), '#d8603a', [s * (0.26 + i * 0.06), 1.17, -0.05 + i * 0.05]); peca(g, caixa(0.18, 0.12, 0.08), '#8a8a90', [s * 0.12, 0.3, 0.11]); }
      for (let i = 0; i < 3; i++) brilho(g, cil(0.04, 0.04, 0.12, 5), '#ff8a2a', [-0.15 + i * 0.15, 0.52, 0.17]); // frascos do cinto
      peca(g, ico(0.25, 1), '#a8703e', [0, 1.35, -0.04]);
      peca(g, caixa(0.12, 0.16, 0.42), '#a82020', [0, 1.55, -0.04]); // moicano
      for (const s of [-1, 1]) { const [x, y, z] = M('frente', s, 0.1); brilho(g, ico(0.12, 0), '#ffb030', [x, y, z]); for (let i = 0; i < 4; i++) brilho(g, cone(0.04, 0.16, 3), '#ff6a1a', [x + Math.cos(i * 1.6) * 0.16, y + Math.sin(i * 1.6) * 0.16, z], [0, 0, i * 1.6 - 1.57]); }
    } },
  // Sally (Planta): chapéu com flores e óculos, cabelo verde curto, sardas, capa verde, blusa listrada, bermuda, meias e a mochila; flores acesas na mão
  sally: { pose: ['estendido', 'baixo'], roupa: '#7a4a2a', manga: '#5a3a4a', calca: '#3a4a2a', bota: '#4a3a2a', cinto: '#3a4a2a', pele: '#e8c0a0', olho: '#3aa050', luva: '#4a3a2a',
    extra(g) {
      for (let i = 0; i < 3; i++) peca(g, caixa(0.505, 0.05, 0.305), '#5a3a4a', [0, 0.62 + i * 0.12, 0]); // listras
      peca(g, caixa(0.62, 0.3, 0.38), '#5a9a4a', [0, 0.95, 0.02]); // a capa verde
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) peca(g, caixa(0.19, 0.04, 0.21), '#1e1a1e', [s * 0.12, 0.12 + i * 0.07, 0]); // meias listradas
      peca(g, caixa(0.36, 0.42, 0.18), '#7a5a34', [0, 0.82, -0.26]); peca(g, cil(0.09, 0.09, 0.42, 6), '#4a7a3a', [0, 1.08, -0.3], [0, 0, Math.PI / 2]); // mochila
      peca(g, ico(0.265, 1), '#4a9a5a', [0, 1.34, -0.03]);
      peca(g, cil(0.36, 0.36, 0.05, 10), '#c8c0a0', [0, 1.5, 0]); peca(g, cil(0.24, 0.27, 0.18, 10), '#c8c0a0', [0, 1.6, 0]); // chapéu
      for (const s of [-1, 1]) peca(g, cil(0.06, 0.06, 0.05, 8), '#d8a030', [s * 0.08, 1.62, 0.25], [Math.PI / 2, 0, 0]); // óculos
      const [x, y, z] = M('estendido');
      peca(g, cil(0.015, 0.015, 0.3, 4), '#4a8a3a', [x, y + 0.15, z]);
      for (let i = 0; i < 3; i++) brilho(g, ico(0.06), '#d8ffd8', [x - 0.08 + i * 0.08, y + 0.3 + (i % 2) * 0.06, z]);
    } },
  // Pâmela (Água): cachos pretos com uma flor roxa, vestido roxo e azul de um ombro só, cinto prateado, sandálias de tiras e a água com flores
  pamela: { pose: ['estendido', 'baixo'], roupa: '#6a2a7a', manga: '#7a4a9a', calca: '#b07a50', bota: '#c8c8d0', botaAlta: true, cinto: '#c8c8d0', pele: '#b07a50', olho: '#c080e0', luva: '#b07a50',
    extra(g) {
      peca(g, caixa(0.52, 0.42, 0.34), '#2a6a8a', [0, 0.34, 0], [0, 0, -0.1]); // a saia (azul por baixo)
      peca(g, caixa(0.3, 0.44, 0.35), '#6a2a7a', [-0.1, 0.34, 0.01], [0, 0, -0.1]);
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) peca(g, caixa(0.19, 0.03, 0.21), '#c8c8d0', [s * 0.12, 0.22 + i * 0.08, 0]); // tiras da sandália
      peca(g, ico(0.27, 1), '#141420', [0, 1.36, -0.05]);
      for (let i = 0; i < 8; i++) peca(g, ico(0.09, 0), '#141420', [-0.24 + (i % 4) * 0.16, 1.2 - Math.floor(i / 4) * 0.14, -0.18]);
      brilho(g, new THREE.OctahedronGeometry(0.07), '#c070e0', [-0.22, 1.47, 0.08]); // a flor no cabelo
      brilho(g, new THREE.TorusGeometry(0.26, 0.04, 4, 12, Math.PI * 1.6), '#b0a8ff', M('estendido', 1, 0.08), [0.3, 0.6, 0]);
      brilho(g, new THREE.TorusGeometry(0.24, 0.04, 4, 12, Math.PI * 1.6), '#b0a8ff', [-0.55, 0.7, 0.1], [0.5, -0.6, 0]);
    } },
  // Lais (Planta): tranças azuis com presilhas prateadas, peitoral azul e prateado, ombreira, capa azul comprida e um cajado com flores
  lais: { pose: ['cintura', 'baixo'], roupa: '#4a5ab0', manga: '#3e2618', calca: '#16161e', bota: '#1e1e3a', botaAlta: true, cinto: '#c8c8d8', pele: '#3e2618', olho: '#ffc040', luva: '#c8c8d8',
    extra(g) {
      peca(g, caixa(0.34, 0.3, 0.05), '#c8c8e0', [0, 0.82, 0.16]); // peitoral prateado
      peca(g, caixa(0.2, 0.1, 0.26), '#6a7ac8', [-0.3, 1.06, 0], [0, 0, 0.4]); // ombreira
      peca(g, caixa(0.6, 1.0, 0.06), '#2a2a8a', [0, 0.58, -0.2], [-0.08, 0, 0]); // capa
      peca(g, caixa(0.44, 0.42, 0.06), '#4a5ab0', [0.05, 0.34, 0.16]); // a frente da saia
      peca(g, ico(0.265, 1), '#1a1e5a', [0, 1.36, -0.05]);
      rabo(g, '#1a1e5a', '#c8c8d8', 8, 1.15);
      const [x, y, z] = M('baixo', -1, 0);
      peca(g, cil(0.03, 0.035, 1.7, 5), '#6a5a3a', [x, y + 0.2, z + 0.02]); // o cajado
      for (let i = 0; i < 3; i++) brilho(g, ico(0.06), '#a8b0ff', [x + 0.06 - i * 0.05, y + 1.0 + i * 0.1, z]);
    } },
  // Rox (Planta, a Campeã): elfa de cabelo comprido prateado e verde, tiara de folhas, peitoral prateado com gema, casaco branco e verde e flores brancas em volta
  rox: { pose: ['estendido', 'estendido'], sob: '#c8d0c8', roupa: '#c8ccd4', manga: '#e8ece8', calca: '#1e4a2e', bota: '#d8dce4', botaAlta: true, cinto: '#c8ccd4', pele: '#f2e6e0', olho: '#40d080', olhoBrilha: true, luva: '#1e6a3e',
    extra(g) {
      casacoLongo(g, '#eef0ee', '#40b070', 0.95);
      brilho(g, new THREE.OctahedronGeometry(0.06), '#30e080', [0, 0.95, 0.17]); // a gema do peitoral
      peca(g, ico(0.27, 1), '#e8ecf0', [0, 1.36, -0.05]);
      peca(g, caixa(0.5, 0.75, 0.1), '#e8ecf0', [0, 1.0, -0.2]); // o cabelo comprido
      peca(g, caixa(0.5, 0.25, 0.11), '#60d090', [0, 0.65, -0.2]); // as pontas verdes
      for (const s of [-1, 1]) peca(g, cone(0.05, 0.16, 3), '#f2e6e0', [s * 0.27, 1.32, -0.02], [0, 0, s * -1.2]); // orelhas de elfa
      for (let i = 0; i < 5; i++) peca(g, cone(0.04, 0.14, 3), '#3aa060', [-0.16 + i * 0.08, 1.56, 0.12], [0.3, 0, (i - 2) * 0.35]); // tiara de folhas
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; brilho(g, new THREE.OctahedronGeometry(0.07), '#f0fff4', [Math.cos(a) * 0.75, 0.55 + Math.sin(a) * 0.3 + (i % 2) * 0.1, Math.sin(a) * 0.35 + 0.1]); }
    } },
  // Saphira (Fogo, a Campeã): trança vermelha longa, jaqueta vermelha e preta com chamas, gola de pelo, calça oliva
  saphira: { pose: ['estendido', 'baixo'], roupa: '#1e1a1a', manga: '#c8302a', calca: '#6a6a3a', bota: '#1e1a1a', botaAlta: true, cinto: '#6a4a2a', pele: '#d8a070', olho: '#ff9a2a', olhoBrilha: true, luva: '#5a2a1a',
    extra(g) {
      for (const s of [-1, 1]) { peca(g, caixa(0.17, 0.4, 0.33), '#c8302a', [s * 0.18, 0.87, 0]); brilho(g, cone(0.05, 0.16, 4), '#ff8a2a', [s * 0.33, 0.85, 0.08]); peca(g, caixa(0.18, 0.12, 0.2), '#8a8a8a', [s * 0.12, 0.25, 0.1]); }
      peca(g, caixa(0.56, 0.14, 0.36), '#f2ece0', [0, 1.08, 0]); // gola de pelo
      peca(g, ico(0.26, 1), '#a02040', [0, 1.35, -0.05]);
      rabo(g, '#a02040', '#d8b040', 8, 1.15);
      brilho(g, new THREE.TorusGeometry(0.28, 0.06, 4, 12), '#ffa030', M('estendido', 1, 0.1), [0.2, 0.8, 0]);
      brilho(g, cone(0.06, 0.14, 4), '#ff5a1a', [0.2, 0.5, 0.17]); // chaveiro de chama
    } },

  gill: { roupa: '#7a1f2e', manga: '#7a1f2e', calca: '#2a2020', bota: '#1e1a1a', cinto: '#5a3a22', pele: PELE, olho: '#a04010', luva: '#1e1a1a',
    extra(g) {
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; peca(g, cone(0.09, 0.32, 4), i % 2 ? '#e0642a' : '#b83a1e', [Math.cos(a) * 0.15, 1.5, Math.sin(a) * 0.15 - 0.03], [Math.sin(a) * 0.6 - 0.2, 0, -Math.cos(a) * 0.6]); }
      peca(g, ico(0.24, 1), '#c8481e', [0, 1.38, -0.04]);
      peca(g, caixa(0.52, 0.06, 0.32), '#d0a040', [0, 0.95, 0]);
      brilho(g, ico(0.12, 1), '#e0303e', [0.36, 0.45, 0.05]);
    } },
  sheyla: { roupa: '#1c2848', manga: '#2fa8b8', calca: '#1c2848', bota: '#e8ecf2', botaAlta: true, cinto: '#c0c8d8', pele: PELE, olho: '#3060c0',
    extra(g) {
      casacoLongo(g, '#2fa8b8', '#3a5fd0', 0.85);
      peca(g, ico(0.27, 1), '#2440b8', [0, 1.33, -0.05]);
      peca(g, caixa(0.5, 0.75, 0.14), '#2440b8', [0, 0.98, -0.2]);
      brilho(g, ico(0.06), '#e8f4ff', [0.14, 1.48, 0.1]);
      brilho(g, ico(0.07), '#40a8ff', [0.24, 0.5, 0.17]);
    } },
  cris: { roupa: '#1a1a22', manga: '#1a1a22', calca: '#15151b', bota: '#0e0e12', cinto: '#2a2a33', pele: '#efd2b8', olho: '#7a4ab0', luva: '#0e0e12', colete: '#3a3a44',
    extra(g) {
      casacoLongo(g, '#1a1a22', '#5a3a9a', 0.85);
      for (const s of [-1, 1]) peca(g, caixa(0.15, 0.06, 0.17), '#5a3a9a', [s * 0.35, 0.56, 0]);
      peca(g, ico(0.27, 1), '#121218', [0, 1.35, -0.03]);
      peca(g, caixa(0.22, 0.2, 0.1), '#121218', [0.07, 1.33, 0.21], [0, 0, 0.3]);
      for (let i = 0; i < 5; i++) peca(g, cone(0.07, 0.2, 4), '#121218', [-0.15 + i * 0.08, 1.52, -0.05], [-0.4, 0, (i - 2) * 0.3]);
      peca(g, caixa(0.3, 0.02, 0.02), '#b0b0c0', [0, 0.95, 0.17]);
      for (let i = 0; i < 3; i++) brilho(g, ico(0.12), '#6a3aa8', [Math.cos(i * 2.1) * 0.42, 0.12 + i * 0.1, Math.sin(i * 2.1) * 0.3]);
    } },
  lana: { roupa: '#f6f2ea', manga: '#f6f2ea', calca: '#f6f2ea', bota: '#ffffff', botaAlta: true, cinto: '#e0b84a', pele: PELE2, olho: '#ffc93a', olhoBrilha: true, luva: '#ffffff',
    extra(g) {
      for (const s of [-1, 1]) { peca(g, caixa(0.08, 0.7, 0.36), '#fbf8f0', [s * 0.36, 0.78, -0.04], [0, 0, s * 0.16]); peca(g, caixa(0.09, 0.04, 0.37), '#e0b84a', [s * 0.42, 0.44, -0.04], [0, 0, s * 0.16]); }
      peca(g, caixa(0.62, 0.72, 0.06), '#fbf8f0', [0, 0.76, -0.2], [-0.12, 0, 0]);
      peca(g, caixa(0.52, 0.04, 0.3), '#e0b84a', [0, 1.04, 0]);
      peca(g, ico(0.26, 1), '#f4f4f4', [0, 1.34, -0.04]);
      peca(g, caixa(0.5, 0.26, 0.4), '#f4f4f4', [0, 1.2, -0.04]);
      brilho(g, ico(0.12, 1), '#fff2b0', [0.4, 0.45, 0.05]);
    } },
  julius: { roupa: '#1f6a3a', manga: '#eee6d2', calca: '#eee6d2', bota: '#d0b060', cinto: '#1f6a3a', pele: PELE, olho: '#c0a030', luva: '#ffffff', colete: '#1f6a3a',
    extra(g) {
      casacoLongo(g, '#eee6d2', '#1f6a3a', 0.95);
      for (const s of [-1, 1]) peca(g, caixa(0.03, 0.9, 0.09), '#d8b450', [s * 0.3, 0.55, 0.18], [0.05, 0, s * -0.12]);
      peca(g, ico(0.26, 1), '#a8b8a8', [0, 1.36, -0.05]);
      peca(g, cil(0.24, 0.22, 0.1, 8), '#d8b450', [0, 1.5, 0]); // coroa de ouro com folhas
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; peca(g, cone(0.05, i % 2 ? 0.12 : 0.2, 4), i % 2 ? '#3fae5a' : '#d8b450', [Math.cos(a) * 0.23, 1.6, Math.sin(a) * 0.23]); }
      brilho(g, new THREE.OctahedronGeometry(0.06), '#30d070', [0, 0.98, 0.18]);
      brilho(g, ico(0.13), '#7ae08a', [0.4, 0.5, 0.08]);
    } },
};
// O boneco do treinador (estilo de desenho: cabeça grande, rosto, braços com cotovelo e uma pose).
// O que é de cada um (cabelo, casaco, efeitos) fica no "extra" do VISUAL.
export function desenharTreinador(pai, id, pos, rotY) {
  const c = VISUAL[id], g = new THREE.Group();
  g.position.set(pos[0], pos[1], pos[2]); g.rotation.y = rotY; pai.add(g);
  const [poseDir, poseEsq] = c.pose || ['baixo', 'baixo'];
  for (const s of [-1, 1]) {
    // pernas: coxa, joelho, canela e bota com bico
    peca(g, caixa(0.19, 0.25, 0.21), c.calca, [s * 0.12, 0.38, 0]);
    peca(g, caixa(0.17, 0.24, 0.19), c.botaAlta ? c.bota : c.calca, [s * 0.12, 0.17, 0]);
    peca(g, caixa(0.2, 0.1, 0.3), c.bota, [s * 0.12, 0.05, 0.04]);
    peca(g, caixa(0.18, 0.06, 0.08), c.bota, [s * 0.12, 0.04, 0.2]);
    // braço: ombro, braço, antebraço (na pose) e a mão
    const [cot, mao] = POSES[s > 0 ? poseDir : poseEsq].map(([x, y, z]) => [s * x, y, z]);
    const ombro = [s * 0.29, 1.0, 0];
    peca(g, ico(0.11, 0), c.manga, ombro);
    osso(g, ombro, cot, 0.13, c.manga);
    osso(g, cot, mao, 0.115, c.mangaCurta ? c.pele : c.manga);
    peca(g, ico(0.075, 0), c.luva || c.pele, mao);
  }
  // corpo: tronco, quadril, cinto e pescoço
  peca(g, caixa(0.5, 0.56, 0.3), c.roupa, [0, 0.77, 0]);
  peca(g, caixa(0.44, 0.12, 0.27), c.calca, [0, 0.5, 0]);
  if (c.colete) peca(g, caixa(0.26, 0.5, 0.05), c.colete, [0, 0.76, 0.16]);
  peca(g, caixa(0.5, 0.06, 0.31), c.cinto, [0, 0.52, 0]);
  peca(g, cil(0.075, 0.085, 0.12, 6), c.pele, [0, 1.08, 0]);
  // cabeça e rosto: olhos (branco, cor e brilho), sobrancelhas e boca
  peca(g, ico(0.25, 1), c.pele, [0, 1.28, 0]);
  for (const s of [-1, 1]) {
    peca(g, caixa(0.085, 0.09, 0.02), '#fbfbf8', [s * 0.085, 1.29, 0.235]);
    peca(g, caixa(0.05, 0.075, 0.02), c.olho, [s * 0.08, 1.285, 0.245], [0, 0, 0], c.olhoBrilha ? 'brilho' : 'normal');
    peca(g, caixa(0.018, 0.018, 0.01), '#ffffff', [s * 0.07, 1.305, 0.256], [0, 0, 0], 'brilho');
    peca(g, caixa(0.1, 0.022, 0.02), c.sob || '#2a1a14', [s * 0.088, 1.36, 0.235], [0, 0, s * -0.12]);
  }
  peca(g, caixa(0.07, 0.018, 0.02), '#8a3a3a', [0, 1.19, 0.238]);
  c.extra(g);
  // estilo de desenho: a cabeça (e o cabelo, o chapéu, a coroa...) fica maior
  const CAB = 1.18, K = 1.2;
  for (const m of g.children) {
    if (m.position.y <= 1.14 || Math.abs(m.position.x) > 0.36) continue; // (a mão levantada e os efeitos dela ficam onde estão)
    m.position.set(m.position.x * K, CAB + (m.position.y - CAB) * K, m.position.z * K);
    m.scale.multiplyScalar(K);
  }
  return g;
}

// ---------- o Reino ----------
export class Reino {
  constructor(mundo, alturaEm) {
    this.m = mundo;
    this.altura = alturaEm;
    this.t = REINO;
    this.rng = aleatorio(0x5e1a);
    // tudo o que é desenhado no Reino fica num grupo com o giro e a altura do platô
    this.raiz = new THREE.Group();
    this.raiz.position.set(REINO.centro.x, REINO.h, REINO.centro.z);
    this.raiz.rotation.y = REINO.giro;
    this.construir();
    this.malhas = assar(this.raiz, mundo.cena);
    this.vivo = new THREE.Group(); // o que se mexe: a plateia
    this.vivo.position.copy(this.raiz.position);
    this.vivo.rotation.y = REINO.giro;
    mundo.cena.add(this.vivo);
    this.criarPlateia();
    // o nome de cada treinador em cima da cabeça (o do Rei em dourado)
    for (const n of this.nomesTreinadores) { const p = placaDeNome(n.tr.nome, n.tr.cor, !!n.tr.campeao); p.position.set(n.x, n.y, n.z); this.vivo.add(p); }
    this.criarPortas();
    this.estrada();
  }

  // O jogador está dentro da arena (no túnel ou na areia)? A câmera chega mais perto lá dentro.
  dentroArena(x, z) {
    const l = REINO.paraLocal(x, z);
    return Math.hypot(l.x - ARENA_REINO.x, l.z - ARENA_REINO.z) < (this.arenaMedidas?.RP ?? 18) + 1;
  }

  // obstáculo (posição local do Reino)
  obst(lx, lz, r) { const p = REINO.paraMundo(lx, lz); this.m.obstaculos.push({ x: p.x, z: p.z, r }); }
  // vários obstáculos ao longo de uma linha (paredes)
  linha(x1, z1, x2, z2, r) {
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, z2 - z1) / (r * 1.2)));
    for (let i = 0; i <= n; i++) this.obst(x1 + ((x2 - x1) * i) / n, z1 + ((z2 - z1) * i) / n, r);
  }
  // um retângulo cheio de obstáculos (cx, cz, largura em x, fundo em z, giro)
  retangulo(cx, cz, w, d, rot = 0, r = 1.6) {
    const c = Math.cos(rot), s = Math.sin(rot);
    const nx = Math.max(1, Math.round(w / (r * 1.4))), nz = Math.max(1, Math.round(d / (r * 1.4)));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const ox = -w / 2 + r * 0.7 + ((w - r * 1.4) * i) / Math.max(1, nx - 1), oz = -d / 2 + r * 0.7 + ((d - r * 1.4) * j) / Math.max(1, nz - 1);
      this.obst(cx + ox * c + oz * s, cz - ox * s + oz * c, r);
    }
  }

  construir() {
    const R = this.raiz;
    // chão: estrada do portão até a praça, a praça e o caminho da arena
    const CALCADA = '#a8a090';
    peca(R, caixa(6, 0.1, 36), CALCADA, [0, 0.05, 45]);
    // a estrada em anel e os caminhos do anel até cada portão
    const nAnel = 84;
    for (let i = 0; i < nAnel; i++) {
      const a = (i / nAnel) * Math.PI * 2;
      peca(R, caixa(5.4, 0.1, 5.6), CALCADA, [Math.cos(a) * RAIO_ANEL, 0.05, Math.sin(a) * RAIO_ANEL], [0, -a, 0]);
    }
    for (const p of PORTOES) {
      const meio = (RAIO_ANEL + RAIO_MURALHA + 2) / 2, comp = RAIO_MURALHA + 2 - RAIO_ANEL;
      peca(R, caixa(6, 0.1, comp), CALCADA, [Math.cos(p.ang) * meio, 0.05, Math.sin(p.ang) * meio], [0, Math.PI / 2 - p.ang, 0]);
    }
    peca(R, cil(12, 12, 0.12, 24), AREIA, [0, 0.06, 15]);
    peca(R, cil(11, 11, 0.13, 24), '#e3d2a2', [0, 0.065, 15]);
    peca(R, caixa(6, 0.1, 5), CALCADA, [-12.8, 0.05, 14]); // do portão da arena até a praça
    this.castelo();
    this.fonte();
    this.arena();
    this.vila();
    this.muralha();
    this.arvores();
  }

  // ---------- castelo (referência: castelo branco de conto de fadas) ----------
  // Muralha branca em quadrado com ameias, 4 torres redondas nos cantos (telhado pontudo
  // cinza-azulado com ponta dourada), o palácio no meio com janelinhas no telhado, a torre
  // de menagem e 2 torres altas e finas, a entrada com arco, varanda e escada, e a base de
  // pedra com grama e pinheiros. A frente (+z) dá para a praça da fonte.
  castelo() {
    const g = new THREE.Group(); this.raiz.add(g);
    const BR = '#f4f1e8', BR2 = '#dcd6c8', TETO = '#56637a', OURO = '#e0b84a', ROCHA = '#9a9488', GRAMA = '#5f9a44';
    // as paredes brancas usam o material "claro" (brilha um pouco: fica branco até na sombra)
    const pc = (pai, geo, cor, pos, rot) => peca(pai, geo, cor, pos, rot, cor === BR || cor === BR2 ? 'claro' : 'normal');
    const F = 1, T = -29, MX = 14;   // frente (z), fundo (z) e lado (x) da muralha
    const cz = (F + T) / 2;
    // ponta dourada no alto de cada telhado
    const ponta = (x, y, z, e = 1) => { pc(g, cil(0.06 * e, 0.06 * e, 1.2 * e, 4), OURO, [x, y + 0.6 * e, z]); brilho(g, ico(0.16 * e), OURO, [x, y + 1.25 * e, z]); };
    // telhado cônico com ponta (n lados)
    const coneTeto = (x, y, z, r, h, n = 10) => { pc(g, cone(r, h, n), TETO, [x, y + h / 2, z]); ponta(x, y + h, z, Math.max(0.7, r / 2.6)); };
    // ameias em cima de uma parede reta (de a até b, na altura y)
    const ameias = (x1, z1, x2, z2, y) => {
      const n = Math.round(Math.hypot(x2 - x1, z2 - z1) / 1.3);
      for (let i = 0; i <= n; i++) pc(g, caixa(0.6, 0.7, 0.6), BR, [x1 + ((x2 - x1) * i) / n, y + 0.35, z1 + ((z2 - z1) * i) / n]);
    };
    // janelas em fila numa fachada
    const janelas = (x0, y, z, n, passo, eixo = 'x', acesas = false) => {
      for (let i = 0; i < n; i++) {
        const o = (i - (n - 1) / 2) * passo;
        const pos = eixo === 'x' ? [x0 + o, y, z] : [x0, y, z + o];
        (acesas ? brilho : peca)(g, eixo === 'x' ? caixa(0.6, 1.2, 0.15) : caixa(0.15, 1.2, 0.6), acesas ? LUZ : VIDRO, pos);
      }
    };

    // a base de pedra com grama e pedras em volta
    pc(g, caixa(2 * MX + 6, 1.2, F - T + 6), ROCHA, [0, 0.6, cz]);
    pc(g, caixa(2 * MX + 5, 0.1, F - T + 5), GRAMA, [0, 1.25, cz]);
    const rng = aleatorio(77);
    for (let i = 0; i < 26; i++) {
      const lado = i % 4, k = rng() * 2 - 1;
      const x = lado < 2 ? k * (MX + 2.5) : (lado === 2 ? -1 : 1) * (MX + 3.2), z = lado < 2 ? (lado === 0 ? F + 3.2 : T - 3.2) : cz + k * ((F - T) / 2 + 2.5);
      if (lado === 0 && Math.abs(x) < 5) continue; // a escada da entrada
      const e = 0.8 + rng() * 1.1;
      pc(g, ico(e), rng() < 0.5 ? ROCHA : '#8a857a', [x, e * 0.5, z], [rng(), rng(), rng()]);
    }
    for (const [x, z] of [[-MX - 1.2, F + 1.2], [MX + 1.2, F + 1.2], [-MX - 1.5, T - 1.5], [MX + 1.5, T - 1.5], [-7, F + 2.3], [7, F + 2.3]]) {
      pc(g, cil(0.25, 0.3, 1.2, 5), MAD, [x, 1.8, z]);
      pc(g, cone(1.3, 3.6, 6), '#3f7a3a', [x, 4, z]);
      pc(g, cone(1, 2.6, 6), '#4a8a40', [x, 5.4, z]);
    }

    // a muralha branca (4 paredes) com ameias
    const H = 7, y0 = 1.2;
    pc(g, caixa(2 * MX, H, 1.4), BR, [0, y0 + H / 2, F]);
    pc(g, caixa(2 * MX, H, 1.4), BR, [0, y0 + H / 2, T]);
    for (const x of [-MX, MX]) pc(g, caixa(1.4, H, F - T), BR, [x, y0 + H / 2, cz]);
    ameias(-MX + 2.5, F + 0.5, MX - 2.5, F + 0.5, y0 + H);
    ameias(-MX + 2.5, T - 0.5, MX - 2.5, T - 0.5, y0 + H);
    for (const x of [-MX - 0.5, MX + 0.5]) ameias(x, F - 2.5, x, T + 2.5, y0 + H);
    // arcos baixos na muralha da frente (como na referência)
    for (const x of [-9, -5.5, 5.5, 9]) { pc(g, caixa(1.6, 2.4, 0.3), MADE, [x, y0 + 1.2, F + 0.72]); pc(g, cil(0.8, 0.8, 0.3, 8), MADE, [x, y0 + 2.4, F + 0.72], [Math.PI / 2, 0, 0]); }

    // as 4 torres redondas dos cantos
    for (const x of [-MX, MX]) for (const z of [F, T]) {
      pc(g, cil(2.6, 2.8, 16, 12), BR, [x, y0 + 8, z]);
      pc(g, cil(3, 2.6, 1.2, 12), BR2, [x, y0 + 16.4, z]);                   // a "saia" de pedra no alto
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; pc(g, caixa(0.5, 0.6, 0.5), BR, [x + Math.cos(a) * 2.75, y0 + 17.3, z + Math.sin(a) * 2.75]); }
      coneTeto(x, y0 + 17, z, 3.2, 8);
      for (const y of [6, 11]) pc(g, caixa(0.6, 1.3, 0.15), VIDRO, [x, y0 + y, z + Math.sign(F - z + 0.1) * 2.75]);
    }

    // o palácio do meio (telhado de duas águas com janelinhas) e a ala da direita
    const palacio = (x, z, w, d, h, rot = 0) => {
      const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = rot; g.add(p);
      pc(p, caixa(w, h, d), BR, [0, y0 + h / 2, 0]);
      const t = pc(p, prisma(d + 0.6, w + 0.4, d * 0.55), TETO, [0, y0 + h, 0]);
      for (let i = 0; i < Math.floor(w / 3); i++) { // janelinhas no telhado
        const xx = (i - (Math.floor(w / 3) - 1) / 2) * 3;
        pc(p, caixa(0.9, 1.1, 0.9), BR, [xx, y0 + h + 0.9, d / 2 - 0.9]);
        pc(p, prisma(1.1, 1.1, 0.7), TETO, [xx, y0 + h + 1.45, d / 2 - 0.9]).rotation.y = Math.PI / 2;
        pc(p, caixa(0.5, 0.6, 0.1), VIDRO, [xx, y0 + h + 0.9, d / 2 - 0.42]);
      }
      for (const y of [3, 6.5, 10]) if (y < h - 1) for (let i = 0; i < Math.floor(w / 2.2); i++) {
        const xx = (i - (Math.floor(w / 2.2) - 1) / 2) * 2.2;
        (y === 3 ? brilho : peca)(p, caixa(0.6, 1.3, 0.15), y === 3 ? LUZ : VIDRO, [xx, y0 + y, d / 2 + 0.05]);
      }
      return t;
    };
    palacio(-3, -16, 15, 9, 12);
    palacio(7.5, -7.5, 9, 6, 9, -Math.PI / 2 + 0.0001);
    palacio(-8.5, -7, 6, 6, 8);

    // a torre de menagem (quadrada) e as 2 torres altas e finas
    pc(g, caixa(5, 22, 5), BR, [3.5, y0 + 11, -15]);
    pc(g, caixa(5.8, 1, 5.8), BR2, [3.5, y0 + 22.2, -15]);
    ameias(1, -12.3, 6, -12.3, y0 + 22.7); ameias(1, -17.7, 6, -17.7, y0 + 22.7);
    pc(g, cone(3.8, 9, 4), TETO, [3.5, y0 + 27.2, -15], [0, Math.PI / 4, 0]); ponta(3.5, y0 + 31.7, -15, 1.2);
    for (let i = 0; i < 4; i++) pc(g, caixa(0.7, 1.6, 0.15), VIDRO, [3.5, y0 + 8 + i * 3.4, -12.45]);
    for (const [x, z, h] of [[-4, -10.5, 27], [10, -16, 24]]) {
      pc(g, cil(1.5, 1.6, h, 10), BR, [x, y0 + h / 2, z]);
      pc(g, cil(1.85, 1.5, 1, 10), BR2, [x, y0 + h + 0.2, z]);
      coneTeto(x, y0 + h + 0.6, z, 1.9, 7);
      for (let i = 0; i < 3; i++) pc(g, caixa(0.5, 1.2, 0.15), VIDRO, [x, y0 + 8 + i * 5, z + 1.5]);
    }
    // torrinhas finas nos cantos do palácio
    for (const [x, z] of [[-10.5, -11.5], [4.5, -11.5], [-10.5, -20.5], [12, -4.5], [3, -4.5]]) {
      pc(g, cil(0.8, 0.8, 4, 8), BR, [x, y0 + 12, z]);
      coneTeto(x, y0 + 14, z, 1, 3.4, 8);
    }

    // a entrada da frente: torre do portão com arco, varanda de madeira e 2 torrinhas
    pc(g, caixa(7, 12, 3.4), BR, [0, y0 + 6, F + 0.6]);
    pc(g, prisma(3.8, 7.4, 2.4), TETO, [0, y0 + 12, F + 0.6]).rotation.y = Math.PI / 2;
    pc(g, caixa(2.8, 4, 0.3), MADE, [0, y0 + 2, F + 2.35]);                    // a porta
    pc(g, cil(1.4, 1.4, 0.3, 10), MADE, [0, y0 + 4, F + 2.35], [Math.PI / 2, 0, 0]);
    pc(g, caixa(4.4, 0.4, 1.6), MAD, [0, y0 + 6.6, F + 2.9]);                  // varanda
    for (let i = 0; i < 7; i++) pc(g, caixa(0.12, 1, 0.12), MAD, [-2 + i * 0.66, y0 + 7.3, F + 3.6]);
    pc(g, caixa(4.4, 0.12, 0.14), MAD, [0, y0 + 7.8, F + 3.6]);
    janelas(0, y0 + 9.4, F + 2.36, 3, 1.4, 'x', true);
    for (const x of [-3.9, 3.9]) { pc(g, cil(1.1, 1.1, 13, 8), BR, [x, y0 + 6.5, F + 1.8]); coneTeto(x, y0 + 13, F + 1.8, 1.4, 4.5, 8); }
    pc(g, cil(1.25, 1.25, 0.1, 10), OURO, [0, y0 + 10.9, F + 2.37], [Math.PI / 2, 0, 0]); // brasão dourado
    duplo(g, caixa(1.4, 2.2, 0.06), AZUL, [0, y0 + 10.9, F + 2.4]);
    // a escada até a praça
    for (let i = 0; i < 4; i++) pc(g, caixa(6 - i * 0.2, 0.3, 1.1), BR2, [0, 0.15 + i * 0.3, F + 6.3 - i * 1.05]);
    // bandeiras azuis nas torres da frente
    for (const x of [-MX, MX]) { pc(g, cil(0.06, 0.06, 2.2, 4), MAD, [x, y0 + 27.5, F]); duplo(g, caixa(1.3, 0.8, 0.05), AZUL, [x + 0.7, y0 + 28.1, F]); }

    // colisão: o castelo inteiro (com a base) e as torres dos cantos
    this.retangulo(0, cz, 2 * MX + 4, F - T + 4, 0, 1.8);
    for (const x of [-MX, MX]) for (const z of [F, T]) this.obst(x, z, 3.2);
    this.obst(0, F + 3.2, 2.2); // a escada (você para na frente dela)
  }

  fonte() {
    // a fonte de cura (o cristal que gira é do mundo.js)
    const g = this.raiz, { x, z } = FONTE_REINO;
    peca(g, cil(3.2, 3.4, 0.8, 12), PEDRA2, [x, 0.4, z]);
    brilho(g, cil(2.8, 2.8, 0.1, 12), '#7fe3ff', [x, 0.82, z]);
    peca(g, cil(0.5, 0.6, 2.2, 6), PEDRA, [x, 1.6, z]);
    this.obst(x, z, 3.4);
  }

  // ---------- arena fechada (coliseu da referência, com palco) ----------
  arena() {
    const A = ARENA, g = new THREE.Group();
    g.position.set(ARENA_REINO.x, 0, ARENA_REINO.z); this.raiz.add(g);
    const { r0, deg, passo, palco: PALCO, porta: PORTA } = A;
    const R = r0 + deg * passo, H = 0.7 + (deg - 1) * 0.7, RP = R + 1.2;
    this.arenaMedidas = { R, H, RP };
    // arquibancada em degraus, a volta toda (menos o palco e o túnel do portão)
    const pts = [new THREE.Vector2(r0, 0)];
    for (let i = 0; i < deg; i++) { pts.push(new THREE.Vector2(r0 + i * passo, 0.7 + i * 0.7)); pts.push(new THREE.Vector2(r0 + (i + 1) * passo, 0.7 + i * 0.7)); }
    pts.push(new THREE.Vector2(R, H + 1.2), new THREE.Vector2(R + 0.8, H + 1.2), new THREE.Vector2(R + 0.8, 0));
    const fatia = Math.PI - PALCO - PORTA;
    // (no Lathe, o ângulo 0 aponta para +z e PI/2 para +x: o portão)
    duplo(g, new THREE.LatheGeometry(pts, 16, Math.PI / 2 + PORTA, fatia), PEDRA);
    duplo(g, new THREE.LatheGeometry(pts, 16, Math.PI * 1.5 + PALCO, fatia), PEDRA);
    // parede de fora: 2 andares de arcos
    const N = 26, w = (2 * Math.PI * RP) / N + 0.15;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, x = Math.cos(a) * RP, z = Math.sin(a) * RP, rot = [0, -a + Math.PI / 2, 0];
      if (i === 0) { // o portão: arco grande
        duplo(g, painelArco(w, 6, 1.7, 3.8), PEDRA, [x, 0, z], rot);
        peca(g, caixa(w, 2.5, 0.7), PEDRA, [x, 7.25, z], rot);
        continue;
      }
      duplo(g, painelArco(w, 4.5, 1.25, 2.8), PEDRA, [x, 0, z], rot);
      duplo(g, painelArco(w, 4, 1.15, 2.5), PEDRA, [x, 4.5, z], rot);
      peca(g, caixa(0.5, 8.5, 0.9), PEDRA2, [Math.cos(a + Math.PI / N) * (RP + 0.45), 4.25, Math.sin(a + Math.PI / N) * (RP + 0.45)], rot);
    }
    // o portão: 2 torres com telhado vermelho dos lados, a faixa com as cores dos treinadores
    // em cima do arco e as 2 portas de madeira (elas abrem quando você chega perto: criarPortas)
    for (const zt of [-3.4, 3.4]) {
      peca(g, caixa(2.6, 11, 2.6), PEDRA2, [RP + 0.9, 5.5, zt]);
      peca(g, cone(2.2, 3.4, 4), TELHA, [RP + 0.9, 12.7, zt], [0, Math.PI / 4, 0]);
      for (const [dx, dz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) peca(g, caixa(0.6, 0.7, 0.6), PEDRA, [RP + 0.9 + dx * 1.05, 11.3, zt + dz * 1.05]);
      peca(g, caixa(0.2, 1.6, 0.7), VIDRO, [RP + 2.25, 7.5, zt]);
      duplo(g, caixa(0.06, 2.6, 1.2), TELHA, [RP + 2.25, 4.6, zt]);   // estandarte vermelho na torre
    }
    TREINADORES.forEach((tr, i) => duplo(g, caixa(0.06, 1.3, 0.62), tr.cor, [RP + 0.78, 6.9, (i - 2) * 0.64]));
    peca(g, caixa(0.5, 0.35, 3.6), PEDRA2, [RP + 0.85, 7.7, 0]);
    this.obst(ARENA_REINO.x + RP + 0.9, ARENA_REINO.z - 3.4, 1.8);
    this.obst(ARENA_REINO.x + RP + 0.9, ARENA_REINO.z + 3.4, 1.8);
    this.portaoArena = { x: RP + 0.75, abre: 0 };
    // faixas e o "sótão" liso no alto (anéis abertos: só a parede, sem tampa)
    for (const [r, h, y, cor] of [[RP + 0.75, 0.35, 4.5, PEDRA2], [RP + 0.75, 1.2, 9.1, PEDRA], [RP + 0.8, 0.3, 9.8, PEDRA2], [RP + 0.05, 9.9, 4.95, PEDRA2]])
      duplo(g, new THREE.CylinderGeometry(r, r, h, N * 2, 1, true), cor, [0, y, 0]);
    // telhado vermelho de telhas, a volta toda (menos em cima do palco)
    const tp = [new THREE.Vector2(R - 3.6, 11.4), new THREE.Vector2(RP + 1.1, 9.95)];
    duplo(g, new THREE.LatheGeometry(tp, 24, Math.PI * 1.5 + PALCO - 0.05, Math.PI * 2 - 2 * PALCO + 0.1), TELHA);
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI * 1.5 + PALCO + (i / 16) * (Math.PI * 2 - 2 * PALCO);
      peca(g, cil(0.22, 0.22, 11.2 - H, 5), '#f2ead8', [Math.sin(a) * (R - 3.3), H + (11.2 - H) / 2 - 1.2, Math.cos(a) * (R - 3.3)]);
    }
    // túnel do portão até a areia (sem teto: a câmera passa por cima)
    for (const z of [-1.9, 1.9]) peca(g, caixa(R - r0 + 1.4, 4, 0.6), PEDRA2, [(R + r0) / 2 + 0.6, 2, z]);
    // o chão da luta
    peca(g, cil(R, R, 0.1, 28), PEDRA2, [0, 0.05, 0]);
    peca(g, cil(r0, r0, 0.3, 28), AREIA, [0, 0.15, 0]);
    peca(g, cil(r0 - 2, r0 - 2, 0.32, 28), '#d9bd80', [0, 0.16, 0]);
    peca(g, cil(1.4, 1.4, 0.34, 12), '#c9a060', [0, 0.17, 0]);
    // o palco e o prédio de 2 andares atrás dele
    const p = new THREE.Group(); p.position.set(-(r0 + 1.4), 0, 0); g.add(p);
    peca(p, caixa(3, 1, 15), PEDRA2, [0, 0.5, 0]);
    peca(p, caixa(3, 0.4, 3), PEDRA2, [1.8, 0.2, 0]);
    peca(p, caixa(2.6, 10.5, 20), PEDRA, [-2.6, 5.25, 0]);
    for (let i = -3; i <= 3; i++) {
      for (const [y, h] of [[1, 4], [5.6, 3.6]]) peca(p, cil(0.3, 0.3, h, 6), '#f2ead8', [-1.1, y + h / 2, i * 2.6]);
      peca(p, caixa(0.2, 2.4, 1.3), VIDRO, [-1.25, 2.6, i * 2.6 + 1.3]);
      peca(p, caixa(0.2, 2, 1.1), VIDRO, [-1.25, 7, i * 2.6 + 1.3]);
    }
    peca(p, caixa(1.2, 0.4, 20), PEDRA2, [-1.1, 5.3, 0]);
    peca(p, prisma(4.6, 21, 2), TELHA, [-2.6, 10.5, 0]).rotation.y = Math.PI / 2;
    for (const s of [-1, 1]) { // alas que ligam o palco à parede de fora
      const a = new THREE.Group(); a.position.set(-(r0 + 3.2), 0, s * 11.2); a.rotation.y = s * 0.55; g.add(a);
      peca(a, caixa(5, 10, 3), PEDRA, [-1.5, 5, 0]);
      for (const y of [2.5, 6.8]) peca(a, caixa(1.3, 2, 0.2), VIDRO, [-1.5, y, -s * 1.55]);
      peca(a, prisma(3.6, 5.4, 1.6), TELHA, [-1.5, 10, 0]);
    }
    // as 5 bandeiras em cima do palco
    TREINADORES.forEach((tr, i) => {
      const z = (i - 2) * 4;
      peca(p, cil(0.05, 0.05, 3, 4), MAD, [-2.6, 13.2, z]);
      duplo(p, caixa(0.06, 0.9, 1.4), tr.cor, [-2.6, 14.1, z + 0.75]);
    });
    // a plataforma de cada treinador, na areia, e ele em cima, de frente para o meio da arena
    this.posTreinadores = [];   // onde o jogador encosta para lutar (na frente do degrau)
    this.topoTreinadores = [];  // em cima da cabeça dele (para a placa com o nome)
    this.armado = TREINADORES.map(() => true);
    this.nomesTreinadores = []; // o nome em cima da cabeça (as plaquinhas vão para o grupo vivo)
    for (const tr of TREINADORES) {
      const a = (tr.ang * Math.PI) / 180, x = Math.cos(a) * tr.r, z = Math.sin(a) * tr.r, h = tr.alt;
      const rb = tr.campeao ? 1.7 : 1.45;                                        // raio da plataforma
      const virar = Math.atan2(-x, -z);                                          // de frente para o meio
      peca(g, cil(rb + 0.15, rb + 0.25, 0.3, 10), PEDRA2, [x, 0.3, z]);           // base
      peca(g, cil(rb, rb + 0.1, h, 10), PEDRA, [x, 0.3 + h / 2, z]);              // a plataforma
      brilho(g, cil(rb + 0.04, rb + 0.04, 0.12, 10), tr.cor, [x, 0.3 + h - 0.08, z]); // faixa da cor do elemento
      peca(g, cil(rb * 0.75, rb * 0.75, 0.06, 10), tr.cor, [x, 0.33 + h, z]);    // o centro colorido
      const fx = x - Math.sin(virar) * (rb - 0.2), fz = z - Math.cos(virar) * (rb - 0.2);
      peca(g, cil(0.06, 0.06, 3.2, 4), MAD, [fx, 0.3 + h + 1.6, fz]);            // mastro atrás dele
      duplo(g, caixa(0.06, 1, 1.3), tr.cor, [fx, 0.3 + h + 2.6, fz], [0, virar + Math.PI / 2, 0]);
      if (tr.campeao) for (let k = 0; k < 6; k++) {                              // coroa de pontas na plataforma do Rei
        const ak = (k / 6) * Math.PI * 2;
        brilho(g, cone(0.18, 0.5, 4), '#d8b450', [x + Math.cos(ak) * (rb + 0.05), 0.3 + h + 0.2, z + Math.sin(ak) * (rb + 0.05)]);
      }
      // degrau na frente, para subir
      const dx = Math.sin(virar) * (rb + 0.35), dz = Math.cos(virar) * (rb + 0.35);
      peca(g, caixa(1.2, Math.max(0.3, h * 0.5), 0.7), PEDRA2, [x + dx, 0.3 + Math.max(0.3, h * 0.5) / 2, z + dz], [0, virar, 0]);
      desenharTreinador(g, tr.id, [x, 0.33 + h, z], virar);
      this.obst(ARENA_REINO.x + x, ARENA_REINO.z + z, rb + 0.25);
      this.posTreinadores.push(REINO.paraMundo(ARENA_REINO.x + x + dx * 1.6, ARENA_REINO.z + z + dz * 1.6)); // onde o jogador fala com ele
      this.topoTreinadores.push({ ...REINO.paraMundo(ARENA_REINO.x + x, ARENA_REINO.z + z), y: REINO.h + 0.33 + h + (tr.campeao ? 2.85 : 2.55) }); // (acima do nome)
      this.nomesTreinadores.push({ tr, x: ARENA_REINO.x + x, y: 0.33 + h + (tr.campeao ? 2.3 : 2.0), z: ARENA_REINO.z + z });
    }
    // estandartes coloridos do lado de fora
    for (let i = 1; i < N; i += 3) {
      const a = (i / N) * Math.PI * 2 + Math.PI / N;
      duplo(g, caixa(1, 2.2, 0.08), TREINADORES[i % 5].cor, [Math.cos(a) * (RP + 1), 8, Math.sin(a) * (RP + 1)], [0, -a + Math.PI / 2, 0]);
    }
    // colisão: parede de fora (menos o portão), a borda da arquibancada e o túnel
    const ax = ARENA_REINO.x, az = ARENA_REINO.z;
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2, x = Math.cos(a), z = Math.sin(a);
      if (!(x > 0 && Math.abs(z * RP) < 2.6)) this.obst(ax + x * (RP + 0.3), az + z * (RP + 0.3), 1.1);
      if (!(x > 0 && Math.abs(z * (r0 + 0.8)) < 2.2)) this.obst(ax + x * (r0 + 0.8), az + z * (r0 + 0.8), 0.9);
    }
    for (const s of [-1, 1]) this.linha(ax + r0 + 0.8, az + s * 2.5, ax + RP, az + s * 2.5, 0.6);
    this.retangulo(ax - (r0 + 4), az, 6, 22, 0, 1.4); // o prédio do palco
  }

  // ---------- a vila (kit de telhados azuis) ----------
  casa(x, z, rot, esc = 1, loja = false, torre = false) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; g.scale.setScalar(esc); this.raiz.add(g);
    peca(g, caixa(5.4, 0.4, 4.4), '#9a9488', [0, 0.2, 0]);
    peca(g, caixa(5, 1.3, 4), '#a8a294', [0, 1.05, 0]);
    peca(g, caixa(5.2, 2.2, 4.2), REBOCO, [0, 2.8, 0]);
    for (const xx of [-2.55, -0.9, 0.9, 2.55]) peca(g, caixa(0.2, 2.2, 4.3), MADE, [xx, 2.8, 0]);
    for (const xx of [-1.75, 1.75]) peca(g, caixa(1.7, 0.16, 0.1), MADE, [xx, 2.8, 2.12], [0, 0, xx > 0 ? 0.7 : -0.7]);
    peca(g, caixa(5.3, 0.2, 4.3), MADE, [0, 3.9, 0]);
    peca(g, prisma(5.6, 6, 3), AZUL, [0, 4, 0]);
    peca(g, caixa(1.4, 1.2, 1), REBOCO, [0, 5, 1.7]);
    peca(g, prisma(1.6, 1.4, 0.8), AZUL2, [0, 5.6, 1.7]);
    brilho(g, caixa(0.6, 0.6, 0.12), LUZ, [0, 5, 2.22]);
    peca(g, caixa(0.7, 2.2, 0.7), '#8a8478', [1.6, 5.4, -1]);
    peca(g, caixa(1.2, 1.9, 0.15), MADE, [0, 1.35, 2.05]);
    for (const xx of [-1.6, 1.6]) { brilho(g, caixa(0.8, 0.9, 0.12), LUZ, [xx, 2.9, 2.16]); brilho(g, caixa(0.8, 0.9, 0.12), LUZ, [xx, 1.2, 2.06]); }
    duplo(g, caixa(2, 0.12, 1), AZUL2, [0, 2.45, 2.5], [0.4, 0, 0]);
    if (torre) { peca(g, caixa(2.2, 6, 2.2), REBOCO, [-1.6, 6, -1]); peca(g, cone(1.9, 4, 4), AZUL, [-1.6, 11, -1], [0, Math.PI / 4, 0]); }
    const c = Math.cos(rot), s = Math.sin(rot), loc = (ox, oz) => [x + (ox * c + oz * s) * esc, z + (-ox * s + oz * c) * esc];
    this.retangulo(x, z, 5.4 * esc, 4.4 * esc, rot, 1.5 * esc);
    if (loja) {
      // placa pendurada com uma poção desenhada
      peca(g, caixa(0.15, 3.4, 0.15), MADE, [-3.2, 1.7, 2.6]);
      peca(g, caixa(1.6, 0.15, 0.15), MADE, [-2.6, 3.3, 2.6]);
      duplo(g, caixa(1, 0.8, 0.1), '#c89a5a', [-2.3, 2.7, 2.6]);
      brilho(g, esfera(0.22), '#e8474a', [-2.3, 2.62, 2.68]);
      peca(g, caixa(0.1, 0.18, 0.05), '#ffffff', [-2.3, 2.9, 2.68]);
      // barraca listrada azul e branca com as poções (vermelha = cura, amarela = reviver)
      const b = new THREE.Group(); b.position.set(1.4, 0, 3.6); g.add(b);
      peca(b, caixa(2.6, 1, 1), MADE, [0, 0.5, 0]);
      for (const xx of [-1.25, 1.25]) peca(b, caixa(0.12, 2.4, 0.12), MADE, [xx, 1.2, -0.4]);
      for (let i = 0; i < 6; i++) duplo(b, caixa(0.46, 0.08, 1.4), i % 2 ? '#ffffff' : AZUL, [-1.15 + i * 0.46, 2.4, -0.1], [0.3, 0, 0]);
      for (const [cc, xx] of [['#e8474a', -0.9], ['#e8474a', -0.45], ['#ffd23f', 0.45], ['#ffd23f', 0.9]]) {
        brilho(b, esfera(0.2), cc, [xx, 1.2, 0]); peca(b, cil(0.06, 0.06, 0.2, 4), '#ffffff', [xx, 1.45, 0]);
      }
      const [bx, bz] = loc(1.4, 3.6); this.obst(bx, bz, 1.4);
      const [px, pz] = loc(-3.2, 2.6); this.obst(px, pz, 0.35);
      this.loja = { ...REINO.paraMundo(...loc(1.4, 5.2)) }; // onde o jogador fica para comprar (parte 2)
    }
  }
  vila() {
    this.casa(9, 32, -0.4, 1.15, true);
    // (nenhuma casa do lado da arena: as que ficavam lá foram para o lado leste da vila)
    for (const [x, z, r, e] of [[38, 20, -1.3, 1], [40, 34, -1, 0.9], [20, -38, -2.6, 1], [17, 42, -0.6, 0.95], [24, 26, -1.2, 1.05], [30, 10, -1.5, 0.9], [-8, 46, 0.1, 0.85], [12, 50, -0.2, 0.9]])
      this.casa(x, z, r, e);
    this.casa(28, 38, -0.9, 1, false, true); // a casa com torre
    // lago com jardim
    brilho(this.raiz, cil(9, 9, 0.1, 18), '#4aa0d8', [36, 0.06, -26]);
    peca(this.raiz, cil(9.8, 9.8, 0.08, 18), '#5a9a4a', [36, 0.04, -26]);
    this.obst(36, -26, 9);
  }

  // ---------- muralha com torres e os 5 portões ----------
  muralha() {
    const RM = RAIO_MURALHA, g = this.raiz, ABRE = 4.6 / RM; // meia abertura de cada portão (radianos)
    const noPortao = (a, folga = 0) => PORTOES.some((p) => Math.abs(Math.atan2(Math.sin(a - p.ang), Math.cos(a - p.ang))) < ABRE + folga);
    const N = 76, angulos = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2; if (noPortao(a, 0.02)) continue;
      angulos.push(a);
      peca(g, caixa(8.4, 5, 1.5), PEDRA2, [Math.cos(a) * RM, 2.5, Math.sin(a) * RM], [0, -a + Math.PI / 2, 0]);
      if (i % 6 === 3 && !noPortao(a, 0.08)) { peca(g, cil(2, 2, 8, 8), PEDRA, [Math.cos(a) * RM, 4, Math.sin(a) * RM]); peca(g, cone(2.6, 4, 8), AZUL, [Math.cos(a) * RM, 10, Math.sin(a) * RM]); }
    }
    // emenda: um pedaço de muro do último trecho até a torre do portão (sem buraco dos lados)
    const dif = (x, y) => Math.atan2(Math.sin(x - y), Math.cos(x - y));
    const MEIO = 4.2 / RM; // meio trecho de muro (radianos)
    for (const p of PORTOES) for (const lado of [-1, 1]) {
      const aTorre = p.ang + lado * 4.5 / RM; // o meio da torre
      let aMuro = null;
      for (const a of angulos) { const d = dif(a, p.ang) * lado; if (d > 0 && (aMuro == null || d < dif(aMuro, p.ang) * lado)) aMuro = a; }
      if (aMuro == null) continue;
      const ini = aTorre, fim = aMuro - lado * MEIO; // da torre até a ponta do trecho
      if (dif(fim, ini) * lado <= 0) continue;
      const meio = ini + dif(fim, ini) / 2, comp = Math.abs(dif(fim, ini)) * RM + 1.2;
      peca(g, caixa(comp, 5, 1.5), PEDRA2, [Math.cos(meio) * RM, 2.5, Math.sin(meio) * RM], [0, -meio + Math.PI / 2, 0]);
    }
    // cada portão: 2 torres com bandeira azul
    for (const p of PORTOES) {
      const tx = -Math.sin(p.ang), tz = Math.cos(p.ang); // direção ao longo da muralha
      for (const lado of [-1, 1]) {
        const x = Math.cos(p.ang) * RM + tx * 4.5 * lado, z = Math.sin(p.ang) * RM + tz * 4.5 * lado;
        peca(g, cil(2, 2, 9, 8), PEDRA, [x, 4.5, z]); peca(g, cone(2.6, 4, 8), AZUL, [x, 11, z]);
        duplo(g, caixa(0.05, 1.8, 1), AZUL, [x + Math.cos(p.ang) * 2.1, 5, z + Math.sin(p.ang) * 2.1], [0, Math.PI / 2 - p.ang, 0]);
        this.obst(x, z, 2.1);
      }
    }
    // colisão: a muralha toda, menos os portões
    for (let i = 0; i < 440; i++) {
      const a = (i / 440) * Math.PI * 2; if (noPortao(a)) continue;
      this.obst(Math.cos(a) * RM, Math.sin(a) * RM, 1.1);
    }
  }

  arvores() {
    const rng = this.rng;
    // pinheiros encostados por dentro da muralha (longe dos portões); o resto, entre o anel e a muralha, fica livre
    for (let i = 0; i < 70; i++) {
      const a = rng() * Math.PI * 2, d = RAIO_MURALHA - 5 - rng() * 4, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (PORTOES.some((p) => Math.abs(Math.atan2(Math.sin(a - p.ang), Math.cos(a - p.ang))) < 0.16)) continue;
      const e = 0.9 + rng() * 0.5;
      peca(this.raiz, cil(0.3 * e, 0.4 * e, 1.6 * e, 5), MAD, [x, 0.8 * e, z]);
      peca(this.raiz, cone(1.8 * e, 4 * e, 6), rng() < 0.5 ? '#3f8a3a' : '#4a9a40', [x, 3.4 * e, z]);
      this.obst(x, z, 0.5);
    }
    for (let i = 0; i < 60; i++) {
      const a = rng() * Math.PI * 2, d = 20 + rng() * 34, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x - ARENA_REINO.x, z - ARENA_REINO.z) < 23 || (Math.abs(x) < 15 && z > -16 && z < 60) || (Math.abs(x) < 21 && z > -36 && z < 8) || Math.hypot(x - 36, z + 26) < 12) continue;
      if (Math.hypot(x - 22, z - 30) < 22 || Math.hypot(x - 20, z + 38) < 8) continue; // a vila
      if (Math.hypot(x - CASA_REINO.x, z - CASA_REINO.z) < 13) continue; // o terreno da casa do jogador (e do jardim)
      const e = 0.8 + rng() * 0.5;
      peca(this.raiz, cil(0.3 * e, 0.4 * e, 1.6 * e, 5), MAD, [x, 0.8 * e, z]);
      peca(this.raiz, cone(1.8 * e, 4 * e, 6), rng() < 0.5 ? '#3f8a3a' : '#4a9a40', [x, 3.4 * e, z]);
      this.obst(x, z, 0.5);
    }
  }

  // ---------- plateia: bonequinhos nos degraus (2 lotes: corpos e cabeças) ----------
  criarPlateia() {
    const { r0, deg, passo, palco: PALCO, porta: PORTA } = ARENA;
    this.plateia = criarPlateia(this.vivo, { x: ARENA_REINO.x, z: ARENA_REINO.z, r0: r0 + 0.55, deg, passo, subida: 0.7, buracos: [[Math.PI / 2, PORTA + 0.06], [Math.PI * 1.5, PALCO + 0.04]], espaco: 0.85, semente: 11 });
    this.festaT = 0;
  }
  // As 2 portas de madeira do portão da arena (presas nas dobradiças dos lados do arco)
  criarPortas() {
    const madeira = new THREE.MeshLambertMaterial({ color: '#7a4b2c', flatShading: true });
    const ferro = new THREE.MeshLambertMaterial({ color: '#3a3a44', flatShading: true });
    const tabua = new THREE.BoxGeometry(0.2, 4.7, 1.7), faixa = new THREE.BoxGeometry(0.26, 0.16, 1.74), argola = new THREE.TorusGeometry(0.16, 0.04, 4, 8);
    this.portas = [];
    for (const lado of [-1, 1]) {
      const pivo = new THREE.Group();
      pivo.position.set(ARENA_REINO.x + this.portaoArena.x, 0, ARENA_REINO.z + lado * 1.7); // a dobradiça
      const porta = new THREE.Mesh(tabua, madeira); porta.position.set(0, 2.35, -lado * 0.85);
      pivo.add(porta);
      for (const y of [0.9, 2.4, 3.9]) { const f = new THREE.Mesh(faixa, ferro); f.position.set(0, y, -lado * 0.85); pivo.add(f); }
      const a = new THREE.Mesh(argola, ferro); a.position.set(0.14, 2.2, -lado * 1.45); a.rotation.y = Math.PI / 2; pivo.add(a);
      pivo.userData.lado = lado;
      this.vivo.add(pivo);
      this.portas.push(pivo);
    }
    this.meioPortao = REINO.paraMundo(ARENA_REINO.x + this.portaoArena.x + 1, ARENA_REINO.z);
  }
  // Abre quando o jogador chega a 13 m do portão (ou está dentro da arena) e fecha quando ele se afasta
  animarPortas(dt) {
    const m = this.m, d = Math.hypot(m.pos.x - this.meioPortao.x, m.pos.z - this.meioPortao.z);
    const alvo = d < 13 || this.dentroArena(m.pos.x, m.pos.z) ? 1 : 0, p = this.portaoArena;
    if (Math.abs(alvo - p.abre) < 0.001) return;
    p.abre += (alvo - p.abre) * Math.min(1, dt * 3);
    if (Math.abs(alvo - p.abre) < 0.002) p.abre = alvo;
    for (const pv of this.portas) pv.rotation.y = -pv.userData.lado * p.abre * 1.75; // abrem para fora
  }

  // A plateia pula por alguns segundos (quando você vence alguém na arena)
  festa(seg) { this.festaT = Math.max(this.festaT, seg); }
  atualizar(dt, t) {
    this.animarPortas(dt);
    if (this.festaT > 0 || this.plateia.pulando) {
      this.festaT = Math.max(0, this.festaT - dt);
      animarPlateia(this.plateia, this.festaT, t);
    }
  }

  // ---------- os treinadores no mapa: placa com o nome e encostar para lutar ----------
  // Devolve o treinador mais perto (até 8 m da plataforma) e a que distância o jogador está da frente da plataforma dele
  treinadorPerto(x, z) {
    // o mais perto é o da plataforma mais perto (os pontos de encostar ficam perto do meio da arena)
    let melhor = null, md = 8;
    this.topoTreinadores.forEach((c, i) => {
      const dc = Math.hypot(x - c.x, z - c.z);
      if (dc < md) { md = dc; const p = this.posTreinadores[i]; melhor = { i, tr: TREINADORES[i], d: Math.hypot(x - p.x, z - p.z), topo: c }; }
    });
    // depois de falar ou lutar, só chama de novo quando o jogador se afasta um pouco
    this.posTreinadores.forEach((p, i) => { if (!this.armado[i] && Math.hypot(x - p.x, z - p.z) > 3) this.armado[i] = true; });
    return melhor;
  }
  desarmar(i) { this.armado[i] = false; }

  // ---------- os 5 caminhos (Estrada Real): lanternas e bandeiras do portão para fora ----------
  estrada() {
    const g = new THREE.Group(), y = this.altura;
    for (const E of ESTRADAS) {
      const d = E.dir, perp = { x: -d.z, z: d.x };
      for (let ao = RAIO_REINO + 4, k = 0; ao < E.fim - 2; ao += 12, k++) {
        for (const lado of [-1, 1]) {
          const x = d.x * ao + perp.x * lado * (E.largura + 1.4), z = d.z * ao + perp.z * lado * (E.largura + 1.4), h = y(x, z);
          if ((k + (lado > 0 ? 1 : 0)) % 2 === 0) { // lanterna
            peca(g, caixa(0.18, 2.6, 0.18), MADE, [x, h + 1.3, z]);
            peca(g, caixa(0.6, 0.12, 0.12), MADE, [x, h + 2.5, z]);
            brilho(g, caixa(0.34, 0.42, 0.34), LUZ, [x, h + 2.25, z]);
          } else {                                   // bandeira azul do Reino
            peca(g, cil(0.06, 0.06, 3.4, 4), MADE, [x, h + 1.7, z]);
            duplo(g, caixa(0.06, 1.2, 0.8), AZUL, [x, h + 2.7, z], [0, -E.ang, 0]);
          }
          this.m.obstaculos.push({ x, z, r: 0.3 });
        }
      }
    }
    this.malhasEstrada = assar(g, this.m.cena);
  }
}

// Uma plaquinha com o nome (sempre virada para a câmera): fundo escuro, borda na cor do elemento.
// O nome do Campeão fica dourado.
export function placaDeNome(nome, cor, campeao) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const c = cv.getContext('2d');
  c.font = 'bold 34px system-ui, sans-serif';
  const w = Math.min(244, c.measureText(nome).width + 40), x0 = (256 - w) / 2;
  c.fillStyle = 'rgba(16, 20, 36, 0.82)'; c.strokeStyle = cor; c.lineWidth = 5;
  c.beginPath(); if (c.roundRect) c.roundRect(x0, 8, w, 48, 24); else c.rect(x0, 8, w, 48); c.fill(); c.stroke();
  c.fillStyle = campeao ? '#ffd23f' : '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(nome, 128, 33);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(2.3, 0.575, 1);
  return sp;
}

// ---------- plateia (usada no mapa e na batalha) ----------
// c: { x, z, r0, deg, passo, subida, buracos: [[ângulo, meia abertura]], espaco, semente }
// (os ângulos seguem o Lathe: 0 = +z, PI/2 = +x)
const CORES_PLATEIA = ['#d94a4a', '#3d7bd9', '#5fbf4a', '#e0b030', '#8a4ad9', '#f08a3a', '#f2f2f2', '#4ac0c0'];
const PELES_PLATEIA = ['#f2c9a0', '#c98f62', '#8a5a3a', '#f6d8b8'];
export function criarPlateia(pai, c) {
  const rng = aleatorio(c.semente), lugares = [];
  const longe = (a, b) => Math.abs(((a - b + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  for (let i = 0; i < c.deg; i++) {
    const r = c.r0 + i * c.passo, y = c.subida * (i + 1), n = Math.floor((2 * Math.PI * r) / c.espaco);
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2;
      if (c.buracos.some(([b, w]) => longe(a, b) < w) || rng() < 0.25) continue;
      lugares.push([c.x + Math.sin(a) * r, y, c.z + Math.cos(a) * r, a, rng() * 6.28]);
    }
  }
  const mat = new THREE.MeshLambertMaterial({ flatShading: true });
  const corpos = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.55, 0.32), mat, lugares.length);
  const cabecas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.17, 0), mat, lugares.length);
  corpos.userData.geometriaPropria = cabecas.userData.geometriaPropria = true;
  const cor = new THREE.Color();
  lugares.forEach((_, k) => {
    corpos.setColorAt(k, cor.set(CORES_PLATEIA[Math.floor(rng() * CORES_PLATEIA.length)]));
    cabecas.setColorAt(k, cor.set(PELES_PLATEIA[Math.floor(rng() * PELES_PLATEIA.length)]));
  });
  const p = { corpos, cabecas, lugares, pulando: true };
  animarPlateia(p, 0, 0);
  pai.add(corpos, cabecas);
  return p;
}
// Põe cada bonequinho no lugar; com festa > 0 eles pulam e balançam os braços (só enquanto dura)
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _um = new THREE.Vector3(1, 1, 1);
export function animarPlateia(p, festa, t) {
  const forca = Math.min(1, festa);
  p.lugares.forEach(([x, y, z, a, fase], k) => {
    const pulo = forca > 0 ? Math.abs(Math.sin(t * 9 + fase)) * 0.45 * forca : 0;
    _q.setFromEuler(_e.set(0, a + Math.PI, forca > 0 ? Math.sin(t * 12 + fase) * 0.25 * forca : 0));
    p.corpos.setMatrixAt(k, _m4.compose(_v.set(x, y + 0.28 + pulo, z), _q, _um));
    p.cabecas.setMatrixAt(k, _m4.compose(_v.set(x, y + 0.72 + pulo, z), _q, _um));
  });
  p.corpos.instanceMatrix.needsUpdate = p.cabecas.instanceMatrix.needsUpdate = true;
  p.pulando = forca > 0; // depois da festa, uma última vez para todos voltarem a sentar
}

// ---------- o coliseu da batalha (Arena do Reino) ----------
// O mesmo coliseu do mapa, maior, em volta da areia da batalha (raio = RAIO_ARENA).
// O treinador fica na plataforma dele, do lado de lá (-z), assistindo.
// treinador: o id de um treinador do Reino, ou o próprio treinador (os das vilas)
export function coliseuDeBatalha(cena, raio, treinador) {
  const g = new THREE.Group();
  const r0 = raio + 1, deg = 6, passo = 1.7, sub = 0.95, R = r0 + deg * passo, H = sub * deg, RP = R + 1;
  const BURACO = 0.2; // abertura atrás do treinador
  const pts = [new THREE.Vector2(r0, 0)];
  for (let i = 0; i < deg; i++) { pts.push(new THREE.Vector2(r0 + i * passo, sub * (i + 1))); pts.push(new THREE.Vector2(r0 + (i + 1) * passo, sub * (i + 1))); }
  pts.push(new THREE.Vector2(R, H + 1.4), new THREE.Vector2(R + 0.8, H + 1.4), new THREE.Vector2(R + 0.8, 0));
  duplo(g, new THREE.LatheGeometry(pts, 40, Math.PI + BURACO, Math.PI * 2 - 2 * BURACO), PEDRA);
  const N = 40, w = (2 * Math.PI * RP) / N + 0.15;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, x = Math.cos(a) * RP, z = Math.sin(a) * RP, rot = [0, -a + Math.PI / 2, 0];
    duplo(g, painelArco(w, 4.8, 1.3, 3), PEDRA, [x, 0, z], rot);
    duplo(g, painelArco(w, 4.4, 1.2, 2.7), PEDRA, [x, 4.8, z], rot);
    if (i % 4 === 2) duplo(g, caixa(1, 2.2, 0.08), TREINADORES[(i / 4 | 0) % 5].cor, [Math.cos(a) * (RP - 0.2), H + 3.2, Math.sin(a) * (RP - 0.2)], rot);
  }
  duplo(g, new THREE.CylinderGeometry(RP + 0.05, RP + 0.05, 9.4, N * 2, 1, true), PEDRA2, [0, 4.7, 0]);
  duplo(g, new THREE.LatheGeometry([new THREE.Vector2(R - 4, 12.6), new THREE.Vector2(RP + 1.2, 10.4)], 40), TELHA);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    peca(g, cil(0.25, 0.25, 12.4 - H, 5), '#f2ead8', [Math.sin(a) * (R - 3.7), H + (12.4 - H) / 2 - 0.4, Math.cos(a) * (R - 3.7)]);
  }
  // a plataforma do treinador, atrás do lado dele (-z)
  const tr = typeof treinador === 'object' ? treinador : TREINADORES.find((t) => t.id === treinador);
  if (tr && VISUAL[tr.id]) {
    const zt = -(raio + 2.4);
    peca(g, cil(1.9, 2.1, 2.2, 10), PEDRA, [0, 1.1, zt]);
    brilho(g, cil(1.95, 1.95, 0.14, 10), tr.cor, [0, 2.1, zt]);
    peca(g, cil(1.4, 1.4, 0.06, 10), tr.cor, [0, 2.23, zt]);
    peca(g, cil(0.07, 0.07, 3.6, 4), MAD, [0, 4, zt - 1.5]);
    duplo(g, caixa(1.6, 1.1, 0.06), tr.cor, [0.85, 5.2, zt - 1.5]);
    desenharTreinador(g, tr.id, [0, 2.26, zt], 0);
  }
  const malhas = assar(g, cena);
  const plateia = criarPlateia(cena, { x: 0, z: 0, r0: r0 + 0.6, deg, passo, subida: sub, buracos: [[Math.PI, BURACO + 0.05]], espaco: 0.95, semente: 23 });
  return { malhas, plateia };
}
