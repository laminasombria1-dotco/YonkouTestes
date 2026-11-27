// =============================================================
// GRUTA DOS ARCOS DE MARÉ (dungeon do Arquipélago, pelo guia do Lâmina)
// Caverna costeira de calcário esculpida pelas marés:
//  entrada  → a praia de areia branca, com palmeiras e o mar atrás
//  grupo 1  → Fenda da Maré Baixa: paredões de calcário dourado, conchas e cracas
//  grupo 2  → Salão dos Pilares de Calcário: colunas claras em arcos, água rasa turquesa
//  grupo 3  → Câmaras de Sifão: túneis baixos de arcos de coral seco
//  (portão selado do Rei)
//  Rei      → Lagoa do Teto Aberto: a lagoa com a claraboia, samambaias e orquídeas
// Só desenho: as regras ficam em dungeons.js e os números em lista.js.
// =============================================================
import { GEO } from '../dungeon.js';
import { palmeira, coral, estrela, portaDeLuz, portaoSimples, emVolta, noChao, emCirculo, agua, feixe, brilhos, samambaia, flor, cipo, pedra, coluna, arcoEntre } from './pecas.js';

const SALAS = [
  { x: 0, z: 0, r: 10, h: 0, tipo: 'aberta', tema: 'praia' },                                   // 0 entrada (a praia)
  { x: 0, z: -52, rx: 11, rz: 24, h: -0.5, tipo: 'canion', tema: 'fenda', etapa: 0 },           // 1 Fenda da Maré Baixa
  { x: 8, z: -114, r: 24, h: -1.5, tipo: 'gruta', tema: 'pilares', etapa: 1 },                  // 2 Salão dos Pilares
  { x: -6, z: -172, rx: 15, rz: 18, h: -1.5, tipo: 'gruta', tema: 'sifao', etapa: 2 },          // 3 Câmaras de Sifão
  { x: 0, z: -228, r: 24, h: -1.5, tipo: 'gruta', ceuAberto: true, tema: 'lagoa', fim: true },  // 4 Lagoa do Teto Aberto
];
const LAGOA = { x: -11, z: -222, r: 7.5 };
const CHAO = {
  praia: ['#f4ecd6', '#ece2c6', '#faf4e2'], fenda: ['#e8d8b0', '#dccb9e', '#f0e2be'],
  pilares: ['#d8cda8', '#cfc39c', '#e2d8b6'], sifao: ['#c8b890', '#bcad86', '#d2c39c'], lagoa: ['#e0d4ae', '#d6c9a2', '#e8ddba'],
};
const PAREDE = { aberta: ['#c9b27a', '#b8a06a', '#6a9a6a', '#5f8f5a'], canion: ['#d9b878', '#cfa866', '#e2c488', '#c49a5c'], gruta: ['#b89c6c', '#a88c5e', '#c4a878', '#9a7f54'] };
const sorteia = (rng, l) => l[Math.floor(rng() * l.length)];

export const ARQ_ARCOS = {
  forma: {
    salas: SALAS,
    corredores: [
      { a: 0, b: 1, larg: 5, tipo: 'canion' },
      { a: 1, b: 2, larg: 4.5 },             // o corredor inclinado que desce para o salão
      { a: 2, b: 3, larg: 4 },               // as passarelas de coral seco
      { a: 3, b: 4, larg: 5 },
    ],
    buracos: [LAGOA],
  },
  corSelo: '#5fe0ff',
  portoes: [{ corredor: 3 }],
  acampamentos: [{ x: 0, z: -54, etapa: 0 }, { x: 8, z: -116, etapa: 1 }, { x: -6, z: -172, etapa: 2 }],
  inicio: { x: 0, z: -8, ang: Math.PI },
  saida: { x: 0, z: 7.6, r: 2.2 },
  trono: { x: 6, z: -240, ang: 0 },
  portal: { x: 16, z: -232, ang: -0.4 },

  temas: {
    praia: { ceu: '#8fd8ff', hemi: '#eafcff', luz: 1.8, sol: 1.4, nevoa: [40, 130], part: 'brilho', corPart: '#ffffff' },
    fenda: { ceu: '#9fd6f0', hemi: '#fff4dc', luz: 1.75, sol: 1.3, nevoa: [34, 115], part: 'brilho', corPart: '#fff6d8' },
    pilares: { ceu: '#2a6a7a', hemi: '#d8fbff', luz: 1.6, sol: 0.6, nevoa: [24, 95], part: 'faisca', corPart: '#bff6ff' },
    sifao: { ceu: '#24505a', hemi: '#c8f0ec', luz: 1.5, sol: 0.45, nevoa: [20, 85], part: 'faisca', corPart: '#c8fff0' },
    lagoa: { ceu: '#7fc8a8', hemi: '#f2fff0', luz: 1.75, sol: 1.1, nevoa: [30, 110], part: 'brilho', corPart: '#fffbe0' },
  },

  corChao(c, { sala, d, h, hChao, tipo, rng }) {
    const s = SALAS[sala];
    if (d <= 0.6) { if (h < hChao - 0.6) return c.set('#2fc4cc'); return c.set(sorteia(rng, CHAO[s.tema])); }
    return c.set(sorteia(rng, PAREDE[tipo] || PAREDE.gruta));
  },

  pecasPortao(ms, b, p) { portaoSimples(ms, b, p, ms.mat('#e2d2a6'), ms.brilho('#5fe0ff', 0.7), ms.mat('#c8b48a')); },

  // a entrada no mapa é a do motor (dungeons.js)
  decorar(ms) {
    const rng = ms.rng;
    const M = {
      tronco: ms.mat('#9a7448'), folha: ms.mat('#4fa03a'), folha2: ms.mat('#62b448'),
      calc: ms.mat('#ecdcb4'), calc2: ms.mat('#d8c494'), dourado: ms.mat('#e8c27a'), pedraMar: ms.mat('#8a8a7a'),
      concha: ms.mat('#f6d6d8'), craca: ms.mat('#cfc8b8'), estrela: ms.mat('#ff7a4a'),
      coralSeco: ms.mat('#d8b890'), coralSeco2: ms.mat('#c8a07a'), esponja: ms.mat('#b07a4a'),
      coralRosa: ms.mat('#ff7eb6'), coralLaranja: ms.mat('#ff9a4a'),
      samambaia: ms.mat('#3f9a4a'), cipo: ms.mat('#4a8a3a'), orquidea: ms.mat('#d07ae0'), miolo: ms.mat('#ffe07a'),
    };
    const T = SALAS.map((s) => s.h);
    portaDeLuz(ms, '#ecdcb4', '#5fe0ff', '#e0fbff');

    // ---- a praia: palmeiras nos morros, o mar atrás da porta, conchas na areia ----
    emVolta(ms, [0], 14, 2, 14, (x, z) => palmeira(ms, M, x, z, 0.9 + rng() * 0.4));
    agua(ms, '#3fd0e0', 0, -0.25, 40, 140, 60, 0.75, 0.25);           // o mar (atrás da porta de luz)
    noChao(ms, 0, 8, 3, (x, z) => (rng() < 0.5 ? estrela(ms, M.estrela, x, z) : ms.peca(GEO.ico, M.concha, x, 0.12, z, 0.45, 0.22, 0.35, 0, rng() * 3, 0)));

    // ---- Fenda da Maré Baixa: paredões dourados, conchas e pedras com cracas ----
    emVolta(ms, [1], 30, 1, 5, (x, z) => ms.peca(GEO.dode, rng() < 0.5 ? M.dourado : M.calc2, x, 2 + rng() * 3, z, 3 + rng() * 3, 4 + rng() * 5, 3 + rng() * 2, rng(), rng() * 3, 0));
    noChao(ms, 1, 14, 5, (x, z) => {
      if (rng() < 0.5) { pedra(ms, M.pedraMar, x, z, 0.8 + rng() * 0.6); for (let k = 0; k < 4; k++) ms.peca(GEO.cone, M.craca, x + (rng() - 0.5) * 1.2, 0.75, z + (rng() - 0.5) * 1.2, 0.25, 0.25, 0.25); }
      else ms.peca(GEO.ico, M.concha, x, 0.12, z, 0.5, 0.25, 0.4, 0, rng() * 3, 0);
    });

    // ---- Salão dos Pilares: colunas claras em fileiras, ligadas por arcos; água rasa turquesa ----
    const s2 = SALAS[2];
    agua(ms, '#46d8e0', s2.x, T[2] + 0.18, s2.z, 40, 40, 0.42, 0.45);
    const pil = [];
    for (const lx of [-13, -5, 5, 13]) for (const lz of [-12, 0, 12]) {
      if (Math.abs(lx) < 6 && Math.abs(lz) < 6) continue; // o meio fica livre para o grupo
      const x = s2.x + lx, z = s2.z + lz;
      coluna(ms, M.calc, x, z, 8.5, 1.15);
      pil.push([x, z]);
    }
    for (const [x, z] of pil) for (const [x2, z2] of pil) if (x2 > x && z2 === z && x2 - x < 10) arcoEntre(ms, M.calc2, x, z, x2, z2, T[2] + 8.2, 0.8);
    for (let k = 0; k < 4; k++) feixe(ms, s2.x - 14 + k * 9, s2.z - 18 + (k % 2) * 6, T[2], 16, 2.2, '#cfffff', 0.12, (k - 1.5) * 0.12);
    const ref = [];
    for (let i = 0; i < 70; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 20; ref.push([s2.x + Math.cos(a) * r, T[2] + 0.3 + rng() * 5, s2.z + Math.sin(a) * r]); }
    brilhos(ms, ref, '#8ff6ff', 0.5, 0.7);

    // ---- Câmaras de Sifão: arcos baixos de coral seco, esponjas e corais ----
    const s3 = SALAS[3];
    for (let k = 0; k < 5; k++) {
      const z = s3.z + 14 - k * 7, w = 7 + (k % 2) * 2;
      arcoEntre(ms, k % 2 ? M.coralSeco : M.coralSeco2, s3.x - w, z, s3.x + w, z, T[3], 1.3);
    }
    emVolta(ms, [3], 26, 0.5, 4, (x, z) => (rng() < 0.5 ? coral(ms, [M.coralSeco, M.coralSeco2, M.esponja], x, z, 1 + rng()) : ms.peca(GEO.dode, M.esponja, x, 1 + rng() * 3, z, 1.6, 1.3, 1.6, rng(), 0, 0)));
    noChao(ms, 3, 8, 6, (x, z) => coral(ms, [M.coralRosa, M.coralLaranja, M.coralSeco], x, z, 0.7, true));
    agua(ms, '#3ac8d0', s3.x, T[3] + 0.12, s3.z, 26, 32, 0.35, 0.4);

    // ---- Lagoa do Teto Aberto: a lagoa, a claraboia de luz, samambaias, orquídeas e cipós ----
    const s4 = SALAS[4];
    agua(ms, '#2fd6d8', LAGOA.x, T[4] - 0.6, LAGOA.z, LAGOA.r * 2.4, LAGOA.r * 2.4, 0.75, 0.5);
    feixe(ms, s4.x - 4, s4.z + 2, T[4], 26, 9, '#fff6c8', 0.13);
    feixe(ms, LAGOA.x, LAGOA.z, T[4], 22, 5, '#fffbe0', 0.1);
    emVolta(ms, [4], 34, 0.5, 6, (x, z, inf) => {
      const r = rng();
      if (r < 0.45) samambaia(ms, M.samambaia, x, z, 1.4 + rng());
      else if (r < 0.8) cipo(ms, M.cipo, x, z, inf.h + 9 + rng() * 4, 5 + rng() * 4, M.orquidea, M.miolo);
      else flor(ms, M.orquidea, M.miolo, x, 0.4, z, 1.5);
    });
    emCirculo(10, LAGOA.x, LAGOA.z, LAGOA.r + 1.5, (x, z) => (rng() < 0.6 ? samambaia(ms, M.samambaia, x, z, 0.9) : flor(ms, M.orquidea, M.miolo, x, 0.3, z, 1.1)));
    // o trono do Rei: um degrau de calcário com conchas
    ms.peca(GEO.cil, M.calc, ms.plano.trono.x, 0.25, ms.plano.trono.z, 8, 0.5, 8);
    emCirculo(8, ms.plano.trono.x, ms.plano.trono.z, 4.6, (x, z) => ms.peca(GEO.ico, M.concha, x, 0.7, z, 0.9, 0.6, 0.7, 0, rng() * 3, 0));
    const luz = [];
    for (let i = 0; i < 50; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * 9; luz.push([s4.x - 4 + Math.cos(a) * r, T[4] + 1 + rng() * 14, s4.z + 2 + Math.sin(a) * r]); }
    brilhos(ms, luz, '#fff2b0', 0.45, 0.75);
  },
};
