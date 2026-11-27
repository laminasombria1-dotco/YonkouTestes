// =============================================================
// SANTUÁRIO DAS ÁGUAS BIOLUMINESCENTES (dungeon do Arquipélago, pelo guia do Lâmina)
// Um templo de pedra vulcânica negra numa baía fechada. Lá dentro é SEMPRE de noite:
// a maré traz plâncton que brilha e ilumina cada sala como neon.
//  entrada  → a prainha escura, com palmeiras e o céu de estrelas
//  grupo 1  → Cais das Lanternas Âmbar: o píer de madeira e basalto, e o portal esculpido
//  grupo 2  → Corredor das Marés Luminosas: o chão alagado brilha em azul-elétrico
//  grupo 3  → Anfiteatro das Conchas Gigantes: degraus em roda de uma piscina que brilha
//  (portão selado do Rei)
//  Rei      → Poço Estelar: o espelho d'água parado embaixo do céu estrelado
// =============================================================
import { GEO } from '../dungeon.js';
import { palmeira, portaDeLuz, portaoSimples, emVolta, noChao, emCirculo, agua, feixe, brilhos, estrelasDoCeu, lanterna, coluna, samambaia } from './pecas.js';

const SALAS = [
  { x: 0, z: 0, r: 10, h: 0.5, tipo: 'aberta', tema: 'praia' },                                       // 0 a prainha
  { x: 0, z: -50, rx: 7, rz: 20, h: 1, tipo: 'plataforma', fundo: 2.6, tema: 'cais', etapa: 0 },      // 1 o cais
  { x: 0, z: -110, rx: 12, rz: 24, h: 0.5, tipo: 'gruta', tema: 'mares', etapa: 1 },                  // 2 o corredor alagado
  { x: 8, z: -170, r: 22, h: 0.5, tipo: 'gruta', ceuAberto: true, tema: 'anfiteatro', etapa: 2 },     // 3 o anfiteatro
  { x: 0, z: -228, r: 21, h: 0.5, tipo: 'gruta', ceuAberto: true, tema: 'poco', fim: true },          // 4 o Poço Estelar
];
const PISCINA = { x: 8, z: -170, r: 6.5 };
const ESPELHO = { x: 0, z: -222, r: 7 };
const MAR = -0.5;
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];
// noite: o céu fica escuro sempre (ceuAberto, mas a cor já é de noite)
const NOITE = { ceu: '#0b1638', hemi: '#7fa8e0', luz: 1.15, sol: 0.25 };

export const ARQ_SANTUARIO = {
  paredeVisivel: 34,
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 2.8, tipo: 'plataforma', fundo: 2.4 },
      { a: 1, b: 2, larg: 3.5 },        // o portal de pedra esculpido
      { a: 2, b: 3, larg: 4.5 },
      { a: 3, b: 4, larg: 3, tipo: 'plataforma', fundo: 2 }, // a ponte baixa de pedra
    ],
    buracos: [PISCINA, ESPELHO],
  },
  corSelo: '#3fe8ff',
  portoes: [{ corredor: 3 }],
  acampamentos: [{ x: 0, z: -52, etapa: 0 }, { x: 0, z: -112, etapa: 1 }, { x: 8, z: -184, etapa: 2 }],
  inicio: { x: 0, z: -8, ang: Math.PI },
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 0, z: -238, ang: 0 },
  portal: { x: 12, z: -232, ang: -0.4 },

  temas: {
    praia: { ...NOITE, nevoa: [30, 110], part: 'brilho', corPart: '#8ff0ff' },
    cais: { ...NOITE, nevoa: [30, 110], part: 'brilho', corPart: '#ffd890' },
    mares: { ceu: '#050c20', hemi: '#5fd8ff', luz: 1.2, sol: 0.2, nevoa: [18, 80], part: 'faisca', corPart: '#3fe8ff' },
    anfiteatro: { ...NOITE, hemi: '#8fe0ff', luz: 1.45, nevoa: [24, 95], part: 'faisca', corPart: '#5ff0ff' },
    poco: { ...NOITE, ceu: '#0a1840', nevoa: [26, 105], part: 'brilho', corPart: '#bff4ff' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng, x, z }) {
    const s = SALAS[sala];
    if (d <= 0.6) {
      if (h < hChao - 0.6) return c.set('#1fb8e0');                                                  // a água que brilha
      if (s.tema === 'cais') return c.set(Math.floor(z / 1.1) % 2 ? '#6a5236' : '#5a4430');           // as tábuas do píer
      if (s.tema === 'praia') return c.set(sorteia(rng, ['#4a4a5a', '#3e3e4e']));
      if (s.tema === 'anfiteatro') { const r = Math.hypot(x - PISCINA.x, z - PISCINA.z); return c.set(Math.floor(r / 2.2) % 2 ? '#3a3a4e' : '#4c4c62'); } // os degraus em roda
      return c.set(sorteia(rng, ['#22222c', '#2a2a36', '#1e1e28']));
    }
    if (tipo === 'plataforma') return c.set(sorteia(rng, ['#123a5a', '#0e3250']));                    // o fundo da baía
    if (tipo === 'aberta') return c.set(sorteia(rng, ['#1e2a2a', '#24382e', '#2a2a34']));
    return c.set(sorteia(rng, ['#16161e', '#1c1c26', '#22222e']));                                   // o basalto negro
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#2a2a36'), ms.brilho('#3fe8ff', 0.9), ms.mat('#1e1e28')); },

  decorar(ms) {
    const rng = ms.rng, T = SALAS.map((s) => s.h);
    const M = {
      tronco: ms.mat('#3a3028'), folha: ms.mat('#1e3a2a'), folha2: ms.mat('#24442e'),
      basalto: ms.mat('#24242e'), basalto2: ms.mat('#30303c'), runa: ms.brilho('#3fe8ff', 0.9),
      madeira: ms.mat('#5a4430'), ambar: ms.brilho('#ffb040', 1), concha: ms.brilho('#bfe8ff', 0.35), concha2: ms.brilho('#e8c8ff', 0.3),
      samambaia: ms.mat('#1e4a3a'),
    };
    portaDeLuz(ms, '#30303c', '#3fe8ff', '#bff8ff');
    estrelasDoCeu(ms, 0, -110, 170, 320);

    // ---- a baía escura: o mar que brilha de leve em volta de tudo ----
    agua(ms, '#0e5a8a', 0, MAR, -60, 140, 180, 0.7, 0.4);
    emVolta(ms, [0], 10, 2, 12, (x, z) => palmeira(ms, M, x, z, 0.9 + rng() * 0.4));
    const onda = [];
    for (let i = 0; i < 120; i++) onda.push([(rng() - 0.5) * 60, MAR + 0.1, -10 - rng() * 70]);
    brilhos(ms, onda, '#3fe8ff', 0.6, 0.8, 'plancton');

    // ---- o cais: estacas, tábuas, lanternas âmbar e o portal esculpido ----
    const s1 = SALAS[1], luzes = [];
    for (let z = s1.z + 18; z > s1.z - 20; z -= 3.2) for (const l of [-1, 1]) ms.peca(GEO.cil, M.madeira, s1.x + l * (s1.rx - 0.4), T[1] - 1.4, z, 0.5, 3, 0.5, 0, 0, 0, false);
    for (let k = 0; k < 5; k++) for (const l of [-1, 1]) { const z = s1.z + 16 - k * 8; lanterna(ms, M.madeira, M.ambar, s1.x + l * (s1.rx - 0.6), z, 2.4, T[1]); luzes.push([s1.x + l * (s1.rx - 0.6), T[1] + 2.6, z]); }
    brilhos(ms, luzes, '#ffb040', 3.2, 0.75, 'ambar');
    // o portal de pedra (na entrada do templo) com as runas que brilham
    const pz = s1.z - 24;
    for (const l of [-1, 1]) { ms.peca(GEO.caixa, M.basalto2, l * 4.6, T[1] + 3.5, pz, 1.8, 7, 1.8, 0, 0, 0, false); ms.peca(GEO.caixa, M.runa, l * 4.6, T[1] + 3.5, pz + 0.95, 0.4, 4.5, 0.1, 0, 0, 0, false); ms.obst(l * 4.6, pz, 1.2); }
    ms.peca(GEO.caixa, M.basalto2, 0, T[1] + 7.5, pz, 11.4, 1.6, 2.2, 0, 0, 0, false);

    // ---- o corredor das marés: o chão alagado que brilha, as paredes negras com relevos ----
    const s2 = SALAS[2];
    agua(ms, '#1fd8ff', s2.x, T[2] + 0.15, s2.z, s2.rx * 2 + 2, s2.rz * 2 + 2, 0.5, 0.9);
    const pl = [];
    for (let i = 0; i < 160; i++) pl.push([s2.x + (rng() - 0.5) * s2.rx * 2, T[2] + 0.25 + rng() * 0.4, s2.z + (rng() - 0.5) * s2.rz * 2]);
    brilhos(ms, pl, '#3fe8ff', 0.55, 0.85, 'plancton2');
    for (let k = 0; k < 6; k++) for (const l of [-1, 1]) { const z = s2.z + 18 - k * 7; ms.peca(GEO.caixa, M.basalto2, s2.x + l * (s2.rx + 0.8), T[2] + 3, z, 1.2, 6, 2.4, 0, 0, 0, false); ms.peca(GEO.caixa, M.runa, s2.x + l * (s2.rx + 0.15), T[2] + 3, z, 0.1, 2.6, 0.5, 0, 0, 0, false); }

    // ---- o anfiteatro: degraus em roda da piscina luminosa e as conchas gigantes ----
    const s3 = SALAS[3];
    agua(ms, '#2fe8ff', PISCINA.x, T[3] - 0.7, PISCINA.z, PISCINA.r * 2.3, PISCINA.r * 2.3, 0.8, 1);
    feixe(ms, PISCINA.x, PISCINA.z, T[3] - 1, 18, PISCINA.r * 0.8, '#3fe8ff', 0.1);
    for (const r of [PISCINA.r + 9, PISCINA.r + 12, PISCINA.r + 14.5]) emCirculo(Math.round(r * 1.4), PISCINA.x, PISCINA.z, r, (x, z, a) => { if (Math.abs(a - Math.PI) < 0.5 || Math.abs(a) < 0.4) return; ms.peca(GEO.caixa, M.basalto2, x, (r - PISCINA.r - 8) * 0.25 + 0.2, z, 2.2, 0.5, 1.3, 0, a, 0); });
    emCirculo(6, s3.x, s3.z, s3.r - 2.5, (x, z, a) => { ms.peca(GEO.chapeu, rng() < 0.5 ? M.concha : M.concha2, x, 0, z, 2.6, 2.2, 2.6, -0.6, a, 0); ms.obst(x, z, 2); }, 0.5);

    // ---- o Poço Estelar: o espelho d'água sob a cúpula aberta para as estrelas ----
    const s4 = SALAS[4];
    agua(ms, '#1a4aa0', ESPELHO.x, T[4] - 0.5, ESPELHO.z, ESPELHO.r * 2.3, ESPELHO.r * 2.3, 0.85, 0.7);
    const reflexo = [];
    for (let i = 0; i < 60; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * (ESPELHO.r - 0.5); reflexo.push([ESPELHO.x + Math.cos(a) * r, T[4] - 0.4, ESPELHO.z + Math.sin(a) * r]); }
    brilhos(ms, reflexo, '#e8f4ff', 0.4, 0.9, 'reflexo');
    emCirculo(12, s4.x, s4.z, s4.r - 1.5, (x, z) => { coluna(ms, M.basalto2, x, z, 7, 1.1); ms.peca(GEO.caixa, M.runa, x, 3.5, z, 0.25, 2.6, 0.25, 0, 0, 0); }, Math.PI / 12); // (nenhuma coluna na frente da entrada)
    emVolta(ms, [4, 3], 24, 0.5, 5, (x, z) => samambaia(ms, M.samambaia, x, z, 1.2 + rng()));
    ms.peca(GEO.cil, M.basalto, ms.plano.trono.x, 0.25, ms.plano.trono.z, 7, 0.5, 7);
    ms.peca(GEO.toro, M.runa, ms.plano.trono.x, 0.55, ms.plano.trono.z, 3.4, 3.4, 1, -Math.PI / 2, 0, 0);
  },
};
