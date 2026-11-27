// =============================================================
// AS 6 DUNGEONS DA FLORESTA (Mata de Véu-Âmbar), pelo guia e pelas artes do Lâmina
//  Catedral das Cortinas de Âmbar · Observatório dos Freixos Cantantes · Pântano das Lanternas-do-Brejo
//  Torre Oca da Árvore-Mãe · Garganta das Pontes Vivas · Jardim dos Esporos Dourados
// As cores seguem as artes: casca prateada, musgo esmeralda, âmbar cor de mel e névoa azul-petróleo.
// =============================================================
import { GEO } from '../dungeon.js';
import { fazerPlano, tema, emVolta, noChao, emCirculo, agua, feixe, brilhos, samambaia, cipo, pedra, coluna, arcoEntre, corrente, arvore, cogumelo, ponteTabuas, escada, ponta } from './pecas.js';

const MATA = tema('#2a5a5a', '#e8ffd8', 1.6, 0.8, 22, 95, 'brilho', '#ffe8a0');
const BREJO = tema('#0e2a2e', '#9ff0e8', 1.35, 0.35, 16, 75, 'brilho', '#7fffe8');
const MUSGO = ['#3a7a3a', '#2f6a32', '#468a42'];
const MURO = ['#2a4a3a', '#34563e', '#3e6a44', '#4a5a5a'];
const MATS = { prata: '#b8c0c0', prata2: '#9aa4a6', musgo: '#3f8a3a', copa: '#3a7a3a', copa2: '#4a8a40', ambar: '~#ffb830', ambarSolido: '*#ffb030', samambaia: '#3f9a4a', cipo: '#4a7a3a', ardosia: '#5a6266', quartzo: '#e8e8f0', madeira: '#8a8478', ciano: '*#5fffe8', dourado: '*#ffc840', prato: '#c8ccd0', terra: '#4a3a2a' };
const vagalumes = (ms, cx, cz, y, r, n, cor = '#ffe070') => { const l = []; for (let i = 0; i < n; i++) { const a = ms.rng() * 6.28, d = Math.sqrt(ms.rng()) * r; l.push([cx + Math.cos(a) * d, y + 0.5 + ms.rng() * 8, cz + Math.sin(a) * d]); } brilhos(ms, l, cor, 0.5, 0.85, 'vag' + cor); };
// árvore de casca prateada (o carvalho-véu das artes): tronco grosso, raízes e a copa
function prateada(ms, M, x, z, e = 1, bate = true) {
  arvore(ms, M.prata, M.copa, x, z, e * 1.5, bate);
  for (let k = 0; k < 4; k++) { const a = k * 1.57 + ms.rng(); ms.peca(GEO.arco, M.prata2, x + Math.cos(a) * 1.4 * e, 0, z + Math.sin(a) * 1.4 * e, 1.4 * e, 1.6 * e, 0.9 * e, 0, -a, 0); }
}

// ---------- Catedral das Cortinas de Âmbar ----------
export const CATEDRAL_AMBAR = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'mata' },
    { x: 0, z: -48, r: 13, h: 0, tipo: 'aberta', tema: 'arco', etapa: 0 },
    { x: 0, z: -104, rx: 10, rz: 24, h: 0, tipo: 'aberta', tema: 'nave', etapa: 1 },
    { x: 8, z: -160, r: 14, h: 2.5, tipo: 'aberta', tema: 'terraco', etapa: 2 },
    { x: 0, z: -214, r: 16, h: 0, tipo: 'aberta', tema: 'altar', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 4.5, tipo: 'aberta' }, { a: 1, b: 2, larg: 4, tipo: 'aberta' }, { a: 2, b: 3, larg: 3.5, tipo: 'aberta' }, { a: 3, b: 4, larg: 3.5, tipo: 'aberta' }],
  temas: { mata: MATA, arco: MATA, nave: tema('#3a5a50', '#fff0c8', 1.7, 0.9, 22, 95, 'brilho', '#ffd870'), terraco: MATA, altar: tema('#3a5a4a', '#fff2c0', 1.75, 1, 24, 100, 'brilho', '#ffd060') },
  chao: { todos: MUSGO, nave: ['#3a6a4a', '#2e5e44', '#4a7a50'] },
  parede: { todos: MURO },
  portao: ['#9aa4a6', '#ffc840'], porta: ['#9aa4a6', '#ffc840'],
  trono: { x: 0, z: -222, ang: 0 },
  mats: MATS,
  decorar(ms, M, rng) {
    emVolta(ms, [0, 1, 2, 3, 4], 34, 1, 10, (x, z) => prateada(ms, M, x, z, 0.9 + rng() * 0.4, false));
    // o arco de raízes em contraforte (o portal da entrada)
    for (let k = 0; k < 3; k++) ms.peca(GEO.arco, M.prata2, (k - 1) * 1.2, 0, -34, 6 + k, 7, 2.2, 0, 0, 0);
    // a nave: troncos prateados em fileira com as cortinas de âmbar e os raios de sol
    for (let k = 0; k < 6; k++) for (const l of [-1, 1]) {
      const z = -84 - k * 8, x = l * 11;
      arvore(ms, M.prata, null, x, z, 1.7);
      ms.peca(GEO.caixa, M.ambar, x - l * 1.4, 8, z, 0.15, 12, 4, 0, 0, 0);
    }
    for (let k = 0; k < 4; k++) feixe(ms, (k % 2 ? 3 : -3), -88 - k * 10, 0, 22, 2.2, '#ffe090', 0.15, (k % 2 ? 0.2 : -0.2));
    vagalumes(ms, 0, -104, 0, 10, 50);
    // o terraço dos troncos entrelaçados: galhos largos e cipós
    for (let k = 0; k < 4; k++) ms.peca(GEO.cil, M.prata2, 8 + (rng() - 0.5) * 10, 7, -160 + (k - 1.5) * 6, 1.1, 22, 1.1, Math.PI / 2, 0.3 + k * 0.4, 0, false);
    emVolta(ms, [3], 12, 0.2, 2, (x, z) => cipo(ms, M.cipo, x, z, 10, 5 + rng() * 3));
    // o altar do bloco dourado: o monólito de âmbar no centro, banhado de luz
    ms.peca(GEO.dode, M.ambarSolido, 0, 2.6, -222, 3.6, 5, 3, 0, 0.4, 0); ms.obst(0, -222, 2.5);
    ms.peca(GEO.toro, M.dourado, 0, 0.1, -222, 4.5, 4.5, 2, -Math.PI / 2, 0, 0);
    feixe(ms, 0, -222, 0, 26, 6, '#ffe080', 0.2);
    emCirculo(10, 0, -214, 14, (x, z) => arvore(ms, M.prata, null, x, z, 1.6), 0.3);
    emCirculo(14, 0, -214, 11, (x, z) => ms.peca(GEO.caixa, M.ambar, x, 7, z, 0.15, 10, 2.6, 0, Math.atan2(x, z + 214), 0), 0.15);
    vagalumes(ms, 0, -214, 0, 14, 60, '#ffd060');
  },
});

// ---------- Observatório dos Freixos Cantantes ----------
export const OBSERVATORIO_FREIXOS = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'mata' },
    { x: 0, z: -50, rx: 9, rz: 20, h: 3, tipo: 'aberta', tema: 'degraus', etapa: 0 },
    { x: -4, z: -106, r: 16, h: 6, tipo: 'aberta', tema: 'anel', etapa: 1 },
    { x: 6, z: -156, rx: 4, rz: 13, h: 6, tipo: 'plataforma', fundo: 12, tema: 'passarela', etapa: 2 },
    { x: 0, z: -210, r: 15, h: 6, tipo: 'plataforma', fundo: 14, tema: 'cupula', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 4, tipo: 'aberta' }, { a: 1, b: 2, larg: 4, tipo: 'aberta' }, { a: 2, b: 3, larg: 3, tipo: 'plataforma', fundo: 12 }, { a: 3, b: 4, larg: 3, tipo: 'plataforma', fundo: 14 }],
  paredeVisivel: 38,
  temas: { mata: MATA, degraus: MATA, anel: tema('#2e5a5e', '#e0fff4', 1.6, 0.75, 22, 95, 'brilho', '#ffffff'), passarela: tema('#2a5a64', '#e8fff8', 1.65, 0.8, 26, 100, 'brilho', '#ffffff'), cupula: tema('#3a6a6a', '#fff8e0', 1.75, 1, 28, 110, 'brilho', '#fff0c0') },
  chao: { todos: MUSGO, degraus: ['#5a6266', '#4e5658', '#3f8a3a'], passarela: ['#c8c8d0', '#b8b8c4'], cupula: ['#9aa0a4', '#8a9094', '#aab0b4'] },
  parede: { todos: MURO, plataforma: ['#1e3a3a', '#24443e', '#2a4a44'] },
  fundo: ['#1e3a3e', '#24444a'],
  portao: ['#9aa0a4', '#e8e8ff'], porta: ['#9aa0a4', '#e8e8ff'],
  trono: { x: 0, z: -214, ang: 0 },
  mats: { ...MATS, fenda: '#2a3232', vento: '~#e8fff8' },
  decorar(ms, M, rng) {
    emVolta(ms, [0, 1], 22, 1, 10, (x, z) => (rng() < 0.6 ? samambaia(ms, M.samambaia, x, z, 1.4 + rng()) : prateada(ms, M, x, z, 0.9, false)));
    // os degraus de ardósia com musgo subindo a colina
    escada(ms, M.ardosia, 0, -32, 0.2, 0, -68, 6, 7, 16);
    // o anel dos tubos de vento: freixos esguios com as fendas verticais
    emCirculo(10, -4, -106, 14, (x, z, a) => { arvore(ms, M.prata, M.copa2, x, z, 1.4); ms.peca(GEO.caixa, M.fenda, x + Math.sin(a) * 0.65, 5, z + Math.cos(a) * 0.65, 0.3, 6, 0.4, 0, a, 0); }, 0.3);
    const vento = []; for (let i = 0; i < 70; i++) { const a = rng() * 6.28, r = 12 + rng() * 4; vento.push([-4 + Math.cos(a) * r, 6 + 2 + rng() * 8, -106 + Math.sin(a) * r]); }
    brilhos(ms, vento, '#e8fff8', 0.7, 0.55, 'vento');
    // a passarela suspensa de quartzo (a pedra com os veios brancos)
    ms.peca(GEO.caixa, M.quartzo, 6, 5.6, -156, 6, 0.8, 30, 0, 0, 0, false);
    ms.peca(GEO.arco, M.ardosia, 6, -6, -156, 12, 11, 2, 0, Math.PI / 2, 0, false);
    // a cúpula dos canais acústicos: a ruína redonda aberta ao céu, com os anéis no chão
    ms.peca(GEO.cil, M.ardosia, 0, -2, -210, 32, 16, 32, 0, 0, 0, false);
    for (const r of [4, 7.5, 11]) ms.peca(GEO.toro, M.quartzo, 0, 6.05, -210, r, r, 2.5, -Math.PI / 2, 0, 0, false);
    emCirculo(12, 0, -210, 14, (x, z, a) => { const alto = rng() < 0.7; coluna(ms, M.prata2, x, z, alto ? 6 : 3, 0.9, true); if (alto && rng() < 0.5) ms.peca(GEO.caixa, M.prata2, x, 12.3, z, 3, 0.6, 1, 0, a + Math.PI / 2, 0, false); }, 0.2);
    emVolta(ms, [4, 3], 14, 4, 18, (x, z) => arvore(ms, M.prata, M.copa, x, z, 1.8, false));
    feixe(ms, 0, -210, 6, 24, 9, '#fff6d0', 0.12);
  },
});

// ---------- Pântano das Lanternas-do-Brejo ----------
const ILHOTA = { x: 6, z: -150 };
export const PANTANO_LANTERNAS = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0.5, tipo: 'aberta', tema: 'margem' },
    { x: 0, z: -50, rx: 8, rz: 20, h: 0.3, tipo: 'aberta', tema: 'turfa', etapa: 0 },
    { x: -6, z: -102, r: 13, h: 0.6, tipo: 'plataforma', fundo: 1.8, tema: 'salgueiros', etapa: 1 },
    { x: 6, z: -150, r: 12, h: 0.8, tipo: 'aberta', tema: 'ilhota', etapa: 2 },
    { x: 0, z: -204, r: 15, h: 0.5, tipo: 'gruta', ceuAberto: true, tema: 'raizes', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 4, tipo: 'aberta' }, { a: 1, b: 2, larg: 2.2, tipo: 'plataforma', fundo: 1.8 }, { a: 2, b: 3, larg: 2.2, tipo: 'plataforma', fundo: 1.8 }, { a: 3, b: 4, larg: 3.5 }],
  temas: { margem: tema('#1e3a3a', '#b8ffe8', 1.45, 0.45, 18, 80, 'brilho', '#7fffe8'), turfa: BREJO, salgueiros: BREJO, ilhota: tema('#0a2a2e', '#8ff8f0', 1.45, 0.35, 16, 75, 'brilho', '#5fffe8'), raizes: tema('#0a2024', '#8fe8f0', 1.4, 0.3, 14, 70, 'brilho', '#5fffe8') },
  chao: { margem: ['#3a4a32', '#2e3e2a'], turfa: ['#3a2e22', '#2e261c', '#44382a'], salgueiros: ['#9a9890', '#8a8880'], ilhota: ['#4a5258', '#3e464c'], raizes: ['#2a2a24', '#34342c'] },
  parede: { todos: ['#142624', '#1a302c', '#22382e'], plataforma: ['#0e1e20', '#12262a'] },
  fundo: ['#0a1a1e', '#0e2226'],
  portao: ['#4a4a44', '#5fffe8'], porta: ['#5a5a50', '#5fffe8'],
  trono: { x: 0, z: -212, ang: 0 },
  mats: { ...MATS, salgueiro: '#3a3a30', folhaSalgueiro: '#2a6a5a', estaca: '#6a6860', tabua: '#9a9890', tabua2: '#8a8880', corda: '#7a6a50', tronco: '#3a2e24' },
  decorar(ms, M, rng) {
    agua(ms, '#0e3a3e', 0, -0.6, -110, 120, 220, 0.85, 0.25);
    // salgueiros retorcidos com os galhos caindo (cortinas verde-água)
    const salgueiro = (x, z, e) => { ms.peca(GEO.cil, M.salgueiro, x, 3 * e, z, 1.4 * e, 6 * e, 1.4 * e, (rng() - 0.5) * 0.3, 0, (rng() - 0.5) * 0.3, false); for (let k = 0; k < 7; k++) { const a = rng() * 6.28, r = 1.5 + rng() * 3 * e; ms.peca(GEO.caixa, M.folhaSalgueiro, x + Math.cos(a) * r, 4.5 * e, z + Math.sin(a) * r, 0.5, 5 * e, 0.5, 0, a, 0, false); } for (let k = 0; k < 4; k++) { const a = k * 1.57 + rng(); ms.peca(GEO.arco, M.salgueiro, x + Math.cos(a) * 1.8 * e, -0.6, z + Math.sin(a) * 1.8 * e, 1.6 * e, 2 * e, 1 * e, 0, -a, 0, false); } };
    emVolta(ms, [1, 2, 3, 4], 30, 3, 18, (x, z) => salgueiro(x, z, 1 + rng() * 0.6));
    // a passarela de tábuas prateadas sobre estacas
    ponteTabuas(ms, M, { x: 0, z: -66, h: 0.6 }, { x: -6, z: -92, h: 0.6 }, 3.6, 0, false);
    ponteTabuas(ms, M, { x: -6, z: -112, h: 0.6 }, { x: 6, z: -140, h: 0.8 }, 3.6, 0, false);
    emCirculo(14, -6, -102, 12.8, (x, z) => ms.peca(GEO.cil, M.estaca, x, -0.2, z, 0.3, 2, 0.3, 0, 0, 0, false));
    // a ilhota das lanternas azuis: cogumelos que brilham em ciano
    noChao(ms, 3, 24, 3, (x, z) => cogumelo(ms, M.prata, M.ciano, x, z, 0.6 + rng() * 0.9));
    const luz = []; for (let i = 0; i < 70; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 11; luz.push([ILHOTA.x + Math.cos(a) * r, 1 + rng() * 1.5, ILHOTA.z + Math.sin(a) * r]); }
    brilhos(ms, luz, '#5fffe8', 1, 0.75, 'lanterna');
    // a gruta das raízes submersas: o tronco gigante tombado e as raízes em volta
    ms.peca(GEO.cil, M.tronco, 0, 10, -204, 10, 40, 10, 0, 0, Math.PI / 2, false);
    emCirculo(10, 0, -204, 14, (x, z, a) => ms.peca(GEO.arco, M.tronco, x, 0, z, 3, 6, 1.6, 0, a, 0), 0.2);
    noChao(ms, 4, 16, 5, (x, z) => cogumelo(ms, M.prata, M.ciano, x, z, 0.5 + rng() * 0.6));
    vagalumes(ms, 0, -204, 0, 13, 40, '#5fffe8');
  },
});

// ---------- Torre Oca da Árvore-Mãe ----------
// a subida pela espiral de âmbar dentro do tronco: as salas sobem em volta do centro
export const TORRE_ARVORE_MAE = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'mata' },
    { x: 0, z: -52, r: 14, h: 0, tipo: 'gruta', tema: 'raizes', etapa: 0 },
    { x: 26, z: -96, r: 11, h: 6, tipo: 'plataforma', fundo: 8, tema: 'espiral', etapa: 1 },
    { x: -24, z: -126, r: 11, h: 12, tipo: 'plataforma', fundo: 14, tema: 'galhos', etapa: 2 },
    { x: 4, z: -170, r: 15, h: 18, tipo: 'plataforma', fundo: 20, tema: 'copa', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 4.5, tipo: 'aberta' }, { a: 1, b: 2, larg: 3, tipo: 'plataforma', fundo: 6 }, { a: 2, b: 3, larg: 3, tipo: 'plataforma', fundo: 10 }, { a: 3, b: 4, larg: 3, tipo: 'plataforma', fundo: 16 }],
  paredeVisivel: 42,
  temas: { mata: MATA, raizes: tema('#14302a', '#c8f0d8', 1.45, 0.4, 16, 75, 'brilho', '#9fffd0'), espiral: tema('#3a3418', '#fff0c0', 1.6, 0.6, 22, 95, 'brilho', '#ffd060'), galhos: tema('#3a6a6a', '#f0fff0', 1.65, 0.8, 26, 110, 'brilho', '#ffffff'), copa: tema('#f0d890', '#fff6d8', 1.9, 1.4, 40, 150, 'brilho', '#fff0a0') },
  chao: { mata: MUSGO, raizes: ['#3a4a3a', '#2e3e30'], todos: ['#e8a840', '#d89430', '#f0b850'], copa: ['#c8a050', '#5a9a3a', '#e8b850'] },
  parede: { todos: ['#9aa4a6', '#8a9496', '#b8c0c0'], aberta: MURO },
  fundo: ['#2a4a40', '#345a48'],
  liquido: '#3ac8b0',
  buracos: [{ x: 6, z: -48, r: 3.5 }],
  portao: ['#9aa4a6', '#ffb830'], porta: ['#9aa4a6', '#ffb830'],
  trono: { x: 4, z: -176, ang: 0 },
  mats: MATS,
  decorar(ms, M, rng) {
    // o tronco colossal por fora: a casca prateada que sobe até acima da copa
    emVolta(ms, [1, 2, 3, 4], 26, 12, 22, (x, z) => ms.peca(GEO.caixa, rng() < 0.5 ? M.prata : M.prata2, x, 12, z, 12, 44, 3, 0, Math.atan2(x, z + 112), 0, false));
    // a base úmida: poças e samambaias-espelho entre as raízes
    agua(ms, '#3ac8b0', 6, -0.6, -48, 8, 8, 0.75, 0.4);
    noChao(ms, 1, 10, 5, (x, z) => samambaia(ms, M.samambaia, x, z, 1.1 + rng() * 0.5));
    emCirculo(8, 0, -52, 13, (x, z, a) => ms.peca(GEO.arco, M.prata2, x, 0, z, 2.2, 4, 1.4, 0, a, 0), 0.3);
    // a espiral de seiva endurecida: as rampas de âmbar (por baixo dos corredores)
    for (const [A, B] of [[1, 2], [2, 3], [3, 4]]) {
      const S = ms.forma.salas, a = S[A], b = S[B];
      for (let k = 0; k <= 10; k++) { const t = k / 10, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t, y = a.h + (b.h - a.h) * t; ms.peca(GEO.dode, M.ambarSolido, x, y - 1.4, z, 5, 2.4, 5, 0, t * 3, 0, false); }
    }
    for (const i of [2, 3]) { const s = ms.forma.salas[i]; ms.peca(GEO.cil, M.ambarSolido, s.x, s.h - 2, s.z, s.r * 2, 4, s.r * 2, 0, 0, 0, false); }
    // as varandas dos galhos ocos: o mar de névoa lá fora e as cortinas de resina
    const nevoa = []; for (let i = 0; i < 100; i++) nevoa.push([-60 + rng() * 120, 8 + rng() * 4, -80 - rng() * 100]);
    brilhos(ms, nevoa, '#bfe8e8', 4, 0.25, 'nevoa');
    emVolta(ms, [3], 10, 1, 4, (x, z) => ms.peca(GEO.caixa, M.ambar, x, 14, z, 0.15, 7, 2.2, 0, rng() * 3, 0, false));
    // o ninho da copa solar: a plataforma redonda no alto, com as folhas em volta e a luz dourada
    ms.peca(GEO.cil, M.prata2, 4, 14, -170, 30, 8, 30, 0, 0, 0, false);
    emCirculo(14, 4, -170, 23, (x, z) => ms.peca(GEO.ico, rng() < 0.5 ? M.copa : M.copa2, x, 15 + rng() * 2, z, 7, 3.5, 7, 0, rng() * 3, 0, false));
    feixe(ms, 4, -176, 18, 24, 7, '#fff0a0', 0.18);
    vagalumes(ms, 4, -170, 18, 13, 50, '#fff0a0');
  },
});

// ---------- Garganta das Pontes Vivas ----------
export const GARGANTA_PONTES = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'canion', tema: 'encosta' },
    { x: 0, z: -50, rx: 8, rz: 20, h: 0, tipo: 'canion', tema: 'encosta', etapa: 0 },
    { x: 8, z: -108, rx: 9, rz: 11, h: 1, tipo: 'canion', tema: 'ponte1', etapa: 1 },
    { x: -6, z: -160, rx: 8, rz: 10, h: 6, tipo: 'canion', tema: 'lira', etapa: 2 },
    { x: 0, z: -212, r: 14, h: 11, tipo: 'canion', tema: 'cascata', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 4, tipo: 'canion' }, { a: 1, b: 2, larg: 2.8, tipo: 'canion' }, { a: 2, b: 3, larg: 2.4, tipo: 'canion' }, { a: 3, b: 4, larg: 2.8, tipo: 'canion' }],
  abismos: [{ corredor: 1, r: 12, fundo: 9 }, { corredor: 2, r: 11, fundo: 13 }],
  temas: { encosta: MATA, ponte1: tema('#2a4a50', '#d8f8f0', 1.55, 0.6, 20, 90, 'brilho', '#d8fff0'), lira: tema('#2a4a50', '#e0fff0', 1.6, 0.7, 22, 95, 'brilho', '#ffffff'), cascata: tema('#3a5a44', '#fff0c0', 1.75, 0.9, 24, 100, 'brilho', '#ffd060') },
  chao: { todos: ['#5a6a5a', '#3f8a3a', '#4e5e50'], cascata: ['#5a6266', '#3f8a3a', '#6a7276'] },
  parede: { todos: ['#5a6266', '#4a5256', '#3f7a3a', '#6a7276'] },
  fundo: ['#1e3a44', '#24444e'],
  portao: ['#5a6266', '#ffc840'], porta: ['#5a6266', '#ffc840'],
  trono: { x: 0, z: -220, ang: 0 },
  mats: { ...MATS, raizViva: '#c8d0d0', raizViva2: '#a8b4b4', corda: '#7a6a4a', aguaCai: '~#c8f4ff', seiva: '~#ffb830' },
  decorar(ms, M, rng) {
    // o rio escuro lá embaixo da garganta
    agua(ms, '#1e4a5a', 0, -10, -130, 70, 150, 0.85, 0.3);
    const nev = []; for (let i = 0; i < 80; i++) nev.push([(rng() - 0.5) * 30, -9 + rng() * 2, -90 - rng() * 90]);
    brilhos(ms, nev, '#bfe8f0', 3, 0.3, 'nevoa');
    // as pontes de raízes vivas entrelaçadas (sobre os abismos), com os cipós esticados
    for (const [A, B] of [[1, 2], [2, 3], [3, 4]]) {
      const S = ms.forma.salas, a = S[A], b = S[B];
      for (let k = 0; k < 6; k++) corrente(ms, k % 2 ? M.raizViva : M.raizViva2, [a.x + (k - 2.5) * 0.6, a.h - 0.3, a.z - a.rz + 2], [b.x + (k - 2.5) * 0.6, b.h - 0.3, b.z + b.rz - 2], 12, 0.4 + k * 0.08);
      for (const l of [-1, 1]) corrente(ms, M.corda, [a.x + l * 2.6, a.h + 1.4, a.z - a.rz + 2], [b.x + l * 2.6, b.h + 1.4, b.z + b.rz - 2], 10, 0.8);
    }
    // os cipós-lira: fios verticais que vibram dos dois lados
    for (let k = 0; k < 14; k++) cipo(ms, M.cipo, -6 + (rng() - 0.5) * 18, -160 + (rng() - 0.5) * 18, 22, 14 + rng() * 6);
    // árvores e raízes no alto dos paredões
    emVolta(ms, [1, 2, 3, 4], 26, 10, 18, (x, z, inf) => arvore(ms, M.prata, M.copa, x, z, 1.4, false));
    // o santuário da cascata de resina: o nicho com a seiva dourada ao lado da queda d'água
    ms.peca(GEO.caixa, M.seiva, -4, 18, -227, 3, 14, 0.4, 0, 0, 0, false);
    ms.peca(GEO.caixa, M.aguaCai, 6, 18, -227, 3, 14, 0.4, 0, 0, 0, false);
    ms.peca(GEO.chapeu, M.ambarSolido, -4, 11, -224, 3, 0.8, 2.4, 0, 0, 0, false);
    feixe(ms, 0, -212, 11, 26, 8, '#ffe8a0', 0.16);
    vagalumes(ms, 0, -212, 11, 12, 50, '#ffd060');
  },
});

// ---------- Jardim dos Esporos Dourados ----------
const LAGOA = { x: 6, z: -204, r: 6 };
export const JARDIM_ESPOROS = fazerPlano({
  salas: [
    { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'mata' },
    { x: 0, z: -48, rx: 6, rz: 18, h: 0, tipo: 'gruta', ceuAberto: true, tema: 'tunel', etapa: 0 },
    { x: -6, z: -100, r: 16, h: 0, tipo: 'aberta', tema: 'prado', etapa: 1 },
    { x: 6, z: -152, rx: 6, rz: 16, h: 3, tipo: 'plataforma', fundo: 3, tema: 'tronco', etapa: 2 },
    { x: 0, z: -206, r: 16, h: 0, tipo: 'aberta', tema: 'coracao', fim: true },
  ],
  corredores: [{ a: 0, b: 1, larg: 3.5, tipo: 'aberta' }, { a: 1, b: 2, larg: 3.5, tipo: 'aberta' }, { a: 2, b: 3, larg: 3, tipo: 'plataforma', fundo: 2.5 }, { a: 3, b: 4, larg: 3, tipo: 'plataforma', fundo: 2.5 }],
  buracos: [LAGOA],
  liquido: '#6ad8c8',
  temas: { mata: MATA, tunel: tema('#2a4a2a', '#ffe8a0', 1.5, 0.4, 16, 75, 'brilho', '#ffe070'), prado: tema('#2a5a50', '#fff0c8', 1.65, 0.7, 20, 90, 'brilho', '#ffd060'), tronco: tema('#2a5a50', '#fff0c8', 1.65, 0.7, 22, 90, 'brilho', '#ffd060'), coracao: tema('#2a5a54', '#fff2c8', 1.7, 0.8, 22, 95, 'brilho', '#ffd040') },
  chao: { todos: MUSGO, tronco: ['#5a4430', '#6a5038'], tunel: ['#5a6266', '#4a5458', '#3f8a3a'] },
  parede: { todos: ['#2a5a3a', '#346a42', '#3e7a48', '#24503a'] },
  fundo: ['#2a5a3a', '#346a42'],
  portao: ['#5a6266', '#ffc840'], porta: ['#5a6266', '#ffc840'],
  trono: { x: -6, z: -214, ang: 0 },
  portal: { x: -10, z: -198, ang: 0.4 }, // (fora da lagoa)
  mats: { ...MATS, tronco: '#5a4430', esfera: '*#ffb840', torre: '*#e8b040' },
  decorar(ms, M, rng) {
    // o túnel de samambaias-espelho (as folhas cerosas que refletem a luz dourada)
    for (let k = 0; k < 8; k++) for (const l of [-1, 1]) { const z = -34 - k * 4; ms.peca(GEO.caixa, M.samambaia, l * 5, 4, z, 0.2, 7, 2.4, 0, 0, l * 0.5); }
    noChao(ms, 1, 8, 2, (x, z) => ms.peca(GEO.ico, M.esfera, x, 0.4, z, 0.7, 0.7, 0.7));
    // o prado dos fungos-tambor: as esferas ocres e o musgo
    noChao(ms, 2, 18, 6, (x, z) => { const e = 0.6 + rng() * 1.2; ms.peca(GEO.ico, M.esfera, x, e * 0.6, z, e * 1.2, e * 1.2, e * 1.2); if (e > 1.2) ms.obst(x, z, e * 0.6); });
    emVolta(ms, [1, 2, 4], 30, 1, 10, (x, z) => (rng() < 0.5 ? samambaia(ms, M.samambaia, x, z, 1.6 + rng()) : arvore(ms, M.prata2, M.copa, x, z, 1.2 + rng() * 0.5, false)));
    // o tronco colossal caído com os degraus de orelha-de-prata
    ms.peca(GEO.cil, M.tronco, 6, 0.5, -152, 5.5, 34, 5.5, Math.PI / 2, 0, 0, false);
    for (let k = 0; k < 9; k++) ms.peca(GEO.chapeu, M.prato, 6 + (k % 2 ? 3.4 : -3.4), 2.4 + (k % 3) * 0.4, -138 - k * 3.2, 2.4, 0.35, 1.8, 0, 0, 0, false);
    noChao(ms, 3, 6, 2, (x, z) => ms.peca(GEO.ico, M.esfera, x, 0.4, z, 0.8, 0.8, 0.8));
    // o coração da névoa luminosa: a lagoa, os cogumelos em cúpula e a nuvem de esporos dourados
    agua(ms, '#6ad8c8', LAGOA.x, -0.6, LAGOA.z, LAGOA.r * 2.3, LAGOA.r * 2.3, 0.8, 0.5);
    emCirculo(9, 0, -206, 13.5, (x, z) => { cogumelo(ms, M.prata2, M.prato, x, z, 3 + rng() * 1.5); ms.obst(x, z, 0.8); }, 0.3);
    // o castelo dourado de fungos atrás da lagoa (a arte)
    for (const [dx, h] of [[0, 9], [-2.5, 6], [2.5, 6.5]]) { ms.peca(GEO.cil, M.torre, LAGOA.x + dx, h / 2, LAGOA.z - 8, 1.6, h, 1.6, 0, 0, 0); ms.peca(GEO.cone, M.torre, LAGOA.x + dx, h + 1.5, LAGOA.z - 8, 1.6, 3, 1.6, 0, 0, 0); }
    ms.obst(LAGOA.x, LAGOA.z - 8, 3.5);
    const esporos = []; for (let i = 0; i < 200; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 16; esporos.push([Math.cos(a) * r, 1 + rng() * 16, -206 + Math.sin(a) * r]); }
    brilhos(ms, esporos, '#ffd040', 0.55, 0.85, 'esporo');
    feixe(ms, 0, -206, 0, 24, 9, '#fff0b0', 0.1);
  },
});

export const FLORESTA = { catedral: CATEDRAL_AMBAR, observatorio: OBSERVATORIO_FREIXOS, lanternas: PANTANO_LANTERNAS, arvoreMae: TORRE_ARVORE_MAE, pontes: GARGANTA_PONTES, esporos: JARDIM_ESPOROS };
