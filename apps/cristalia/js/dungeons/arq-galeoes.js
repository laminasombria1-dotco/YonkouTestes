// =============================================================
// CEMITÉRIO DOS GALEÕES DE CORAL (dungeon do Arquipélago, pelo guia do Lâmina)
// Uma enseada rasa onde três galeões antigos encalharam e foram presos pelos corais:
//  entrada  → a praia da enseada
//  grupo 1  → Convés Inclinado da Proa: o convés do 1º navio (a proa bem alta)
//  grupo 2  → Porão dos Jardins de Esponja: o navio partido ao meio, poças com corais e frestas de sol
//  grupo 3  → Passarela das Âncoras Suspensas: vigas e correntes por cima do canal azul-safira
//  (portão selado do Rei)
//  Rei      → Câmara do Leme Cristalino: a popa ornamentada com os vitrais
// Os conveses são plataformas: em volta, a água rasa e clara (dá para ver a areia lá embaixo).
// =============================================================
import { GEO } from '../dungeon.js';
import { palmeira, coral, estrela, portaDeLuz, portaoSimples, emVolta, noChao, agua, feixe, brilhos, transparente, casco, corrente } from './pecas.js';

const SALAS = [
  { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'praia' },                                          // 0 a praia
  { x: -4, z: -56, rx: 8, rz: 20, h: 3, tipo: 'plataforma', fundo: 4.4, tema: 'conves', etapa: 0 },    // 1 o convés da proa
  { x: 22, z: -110, rx: 10, rz: 15, h: 1.2, tipo: 'plataforma', fundo: 2.6, tema: 'porao', etapa: 1 }, // 2 o porão partido
  { x: 2, z: -162, rx: 15, rz: 9, h: 3, tipo: 'plataforma', fundo: 6.5, tema: 'ancoras', etapa: 2 },   // 3 a passarela das âncoras
  { x: -6, z: -214, r: 15, h: 4.5, tipo: 'plataforma', fundo: 6, tema: 'popa', fim: true },            // 4 a popa
];
const MAR = -0.9;
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export const ARQ_GALEOES = {
  paredeVisivel: 42,
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 2.2, tipo: 'plataforma', fundo: 3.6 },  // a rampa de tábuas até a proa
      { a: 1, b: 2, larg: 1.8, tipo: 'plataforma', fundo: 4 },    // a ponte de cordas
      { a: 2, b: 3, larg: 1.8, tipo: 'plataforma', fundo: 5 },    // a ponte de correntes
      { a: 3, b: 4, larg: 2.4, tipo: 'plataforma', fundo: 6 },
    ],
  },
  corSelo: '#5fe0ff',
  portoes: [{ corredor: 3 }],
  acampamentos: [{ x: -4, z: -58, etapa: 0 }, { x: 22, z: -110, etapa: 1 }, { x: 2, z: -162, etapa: 2 }],
  inicio: { x: 0, z: -8, ang: Math.PI },
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: -6, z: -222, ang: 0 },
  portal: { x: 4, z: -216, ang: -0.4 },

  temas: {
    praia: { ceu: '#8fd8ff', hemi: '#eafcff', luz: 1.8, sol: 1.45, nevoa: [45, 145], part: 'brilho', corPart: '#ffffff' },
    conves: { ceu: '#8cd6ff', hemi: '#fff8e8', luz: 1.85, sol: 1.45, nevoa: [45, 145], part: 'brilho', corPart: '#fffbe8' },
    porao: { ceu: '#7cc8e8', hemi: '#ffeed8', luz: 1.7, sol: 1.1, nevoa: [36, 125], part: 'faisca', corPart: '#fff2c8' },
    ancoras: { ceu: '#7cc4f0', hemi: '#e8f8ff', luz: 1.8, sol: 1.35, nevoa: [40, 140], part: 'brilho', corPart: '#ffffff' },
    popa: { ceu: '#88d0ff', hemi: '#fff4e0', luz: 1.8, sol: 1.4, nevoa: [42, 145], part: 'brilho', corPart: '#fff6d0' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng, x, z }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (s.tema === 'praia') return c.set(sorteia(rng, ['#f6eed6', '#eee4c8']));
      return c.set(Math.floor((x + z * 0.15) / 1.1) % 2 ? '#a8946c' : '#94805a');                        // as tábuas do convés
    }
    if (tipo === 'aberta') return c.set(sorteia(rng, ['#f2e8cc', '#e6dcbc', '#5f9a50']));
    const fundo = hChao - h;                                                                             // quanto mais fundo, mais azul
    if (fundo > 5.5) return c.set(sorteia(rng, ['#2a6aa0', '#24609a']));
    if (fundo > 3.5) return c.set(sorteia(rng, ['#5ab8c8', '#4cacbe']));
    return c.set(sorteia(rng, ['#f2ead0', '#e8dec0', '#dcd2b2']));
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#8a7450'), ms.brilho('#5fe0ff', 0.7), ms.mat('#6a5638')); },

  decorar(ms) {
    const rng = ms.rng, T = SALAS.map((s) => s.h);
    const M = {
      tronco: ms.mat('#9a7448'), folha: ms.mat('#4fa03a'), folha2: ms.mat('#62b448'),
      casco: ms.mat('#9a8a6a'), casco2: ms.mat('#7e6e52'), tabua: ms.mat('#a8946c'), ouro: ms.brilho('#e8c060', 0.35),
      corda: ms.mat('#c8a870'), ferro: ms.mat('#5a4a3e'), mastro: ms.mat('#8a7450'),
      coralRosa: ms.mat('#ff7eb6'), coralLaranja: ms.mat('#ff9a4a'), coralMagenta: ms.mat('#e04aa0'), coralAmarelo: ms.mat('#ffc040'),
      estrela: ms.mat('#ff6a4a'), alga: ms.mat('#4a9a5a'),
      vitral1: ms.brilho('#7f6aff', 0.7), vitral2: ms.brilho('#ff7ab0', 0.7), vitral3: ms.brilho('#5fe0c0', 0.7),
    };
    const corais = [M.coralRosa, M.coralLaranja, M.coralMagenta, M.coralAmarelo];
    portaDeLuz(ms, '#c8b48a', '#5fe0ff');

    // ---- o mar raso e claro de ponta a ponta, as ilhas com palmeiras ----
    agua(ms, '#46d6e6', 0, MAR, -110, 170, 270, 0.55, 0.3);
    emVolta(ms, [0], 12, 2, 12, (x, z) => palmeira(ms, M, x, z, 0.9 + rng() * 0.4));
    noChao(ms, 0, 6, 3, (x, z) => estrela(ms, M.estrela, x, z));
    // corais e algas no fundo, em volta de tudo
    emVolta(ms, [1, 2, 3, 4], 70, 2, 26, (x, z) => (rng() < 0.75 ? coral(ms, corais, x, z, 1 + rng() * 1.2) : ms.peca(GEO.cilFino, M.alga, x, 1, z, 0.3, 2 + rng() * 2, 0.3, (rng() - 0.5) * 0.4, 0, 0)));

    // ---- o 1º navio: o convés inclinado da proa, o mastro quebrado ----
    const s1 = SALAS[1];
    casco(ms, M, s1.x, s1.z, T[1], s1.rx * 2 + 1, s1.rz * 2 + 1, Math.PI, 0);
    ms.peca(GEO.cil, M.mastro, s1.x, T[1] + 5, s1.z + 4, 0.7, 10, 0.7, 0.35, 0, 0.2, false);
    ms.peca(GEO.cil, M.mastro, s1.x, T[1] + 4, s1.z + 18, 0.5, 9, 0.5, 1.1, 0, 0, false);   // o gurupés, apontando para fora
    ms.obst(s1.x, s1.z + 4, 0.8);
    // a rampa de tábuas da praia até a proa
    for (let k = 0; k < 10; k++) { const t = k / 9, z = -9 - t * 27; ms.peca(GEO.caixa, M.tabua, -t * 4, t * T[1] - 0.2, z, 4.6, 0.3, 2.6, 0, 0, 0, false); }

    // ---- o 2º navio, partido ao meio: as costelas de madeira, as poças com corais e as frestas de sol ----
    const s2 = SALAS[2];
    casco(ms, M, s2.x, s2.z, T[2] - 0.4, s2.rx * 2 + 1, s2.rz * 2 + 2, Math.PI * 0.92, 0);
    for (let k = 0; k < 6; k++) { const z = s2.z - 12 + k * 5; ms.peca(GEO.arco, M.casco2, s2.x, T[2] + 0.2, z, s2.rx + 0.5, 6, 1.4, 0, Math.PI / 2, 0, false); }
    noChao(ms, 2, 7, 5, (x, z) => { agua(ms, '#5fe0e8', x, T[2] + 0.08, z, 3, 3, 0.6, 0.6); coral(ms, [M.coralMagenta, M.coralRosa], x, z, 0.6); });
    for (let k = 0; k < 4; k++) feixe(ms, s2.x - 6 + k * 4, s2.z - 9 + k * 6, T[2], 9, 1.1, '#fff2c0', 0.13, (k - 1.5) * 0.18);

    // ---- a passarela das âncoras: vigas quebradas, correntes grossas e âncoras penduradas sobre o canal ----
    const s3 = SALAS[3];
    casco(ms, M, s3.x - 14, s3.z + 4, T[3] - 1.5, 8, 20, Math.PI * 0.6, 0.05);                        // o navio do meio, encalhado de lado
    for (let k = -2; k <= 2; k++) ms.peca(GEO.caixa, M.tabua, s3.x + k * 5.8, T[3] - 0.25, s3.z + (k % 2) * 0.8, 5.4, 0.5, s3.rz * 2 - 1, 0, (rng() - 0.5) * 0.15, 0, false);
    for (const l of [-1, 1]) {
      corrente(ms, M.ferro, [s3.x - 14, T[3] + 6, s3.z + l * 8], [s3.x + 14, T[3] + 6, s3.z + l * 8], 16, 2.4);
      ms.peca(GEO.cil, M.mastro, s3.x - 14, T[3] + 3, s3.z + l * 8, 0.6, 7, 0.6, 0, 0, 0, false);
      ms.peca(GEO.cil, M.mastro, s3.x + 14, T[3] + 3, s3.z + l * 8, 0.6, 7, 0.6, 0, 0, 0, false);
    }
    for (const lx of [-8, 8]) { ms.peca(GEO.toro, M.ferro, s3.x + lx, T[3] - 3, s3.z + 11, 1.6, 1.6, 3, 0, 0, Math.PI, false); ms.peca(GEO.cil, M.ferro, s3.x + lx, T[3] - 1.4, s3.z + 11, 0.3, 3.2, 0.3, 0, 0, 0, false); }
    // as pontes de corda e de corrente (os corredores): tábuas e cordas dos lados
    const ponte = (a, b) => {
      const A = SALAS[a], B = SALAS[b], n = Math.ceil(Math.hypot(B.x - A.x, B.z - A.z) / 1.6);
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = A.x + (B.x - A.x) * t, z = A.z + (B.z - A.z) * t, y = A.h + (B.h - A.h) * t - Math.sin(t * Math.PI) * 0.3, ang = Math.atan2(B.x - A.x, B.z - A.z);
        ms.peca(GEO.caixa, M.tabua, x, y - 0.12, z, 3.4, 0.22, 1.1, 0, ang, 0, false);
      }
      for (const l of [-1, 1]) { const ang = Math.atan2(B.x - A.x, B.z - A.z), ox = Math.cos(ang) * 1.9 * l, oz = -Math.sin(ang) * 1.9 * l; corrente(ms, M.corda, [A.x + ox, A.h + 1.1, A.z + oz], [B.x + ox, B.h + 1.1, B.z + oz], 14, 0.5); }
    };
    ponte(1, 2); ponte(2, 3); ponte(3, 4);

    // ---- a popa ornamentada: o castelo de popa com os vitrais e os corais calcificados ----
    const s4 = SALAS[4], tz = s4.z - 13;
    casco(ms, M, s4.x, s4.z + 2, T[4], s4.r * 2 + 1, s4.r * 2 - 2, 0, 0);
    ms.peca(GEO.caixa, M.casco, s4.x, T[4] + 4, tz, s4.r * 2 - 2, 8, 2, 0, 0, 0, false);              // a parede da popa
    ms.peca(GEO.caixa, M.ouro, s4.x, T[4] + 8.3, tz + 0.2, s4.r * 2 - 1, 0.8, 2.4, 0, 0, 0, false);
    for (let k = -2; k <= 2; k++) {
      ms.peca(GEO.caixa, [M.vitral1, M.vitral2, M.vitral3][(k + 3) % 3], s4.x + k * 4.6, T[4] + 4.3, tz + 1.05, 3, 4.2, 0.2, 0, 0, 0, false);
      ms.peca(GEO.arco, M.ouro, s4.x + k * 4.6, T[4] + 6.4, tz + 1.1, 1.5, 1.5, 0.8, 0, Math.PI / 2, 0, false);
    }
    for (let i = 0; i < 9; i++) coral(ms, corais, s4.x - 13 + i * 3.2, tz + 2, 0.8 + rng() * 0.5);
    ms.peca(GEO.cil, M.ouro, ms.plano.trono.x, T[4] + 0.2, ms.plano.trono.z, 7, 0.35, 7, 0, 0, 0, false);  // o leme e o tapete dourado
    ms.peca(GEO.toro, M.mastro, s4.x + 9, T[4] + 2.2, s4.z - 4, 1.6, 1.6, 2, 0, 0.4, 0, false);
    const luz = [];
    for (let i = 0; i < 40; i++) luz.push([s4.x - 12 + rng() * 24, T[4] + 1 + rng() * 6, tz + 2 + rng() * 6]);
    brilhos(ms, luz, '#ffd8ff', 0.5, 0.65, 'vitral');
  },
};
