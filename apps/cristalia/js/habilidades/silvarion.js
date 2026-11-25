// =============================================================
// HABILIDADES DO SILVÁRION (lendário Silvestre)
// Silvárion (Nv.1) > Bosquárion (Nv.65) > Raizárion (Nv.75) > Ancestrárion (Nv.90)
// (as 3 evoluções são com o botão: missão + itens + ouro)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar a investida, o Elo Vital, os
// cervos-espírito ou a Seiva Vital, mexa aqui. Como cada golpe funciona e aparece
// na batalha fica em silvarion-batalha.js.
//
// A ideia: a SEIVA VITAL. Cada vez que a Parasita ou o Elo Vital suga vida, a barra
// enche; o golpe de área gasta toda a Seiva: cura e solta mais cervos-espírito.
// O chefe do Santuário da Árvore-Mãe (o Silvárion da masmorra) também usa tudo isso.
// =============================================================

// Seiva Vital:
//  porSugada = quanto enche a cada pedaço da Parasita | porElo = a cada pedaço do Elo Vital
//  curaPor25 = quanto da vida ele cura a cada 25% de Seiva gasta (só na batalha; no treino não cura)
//  cervoPor25 = cervos-espírito a mais a cada 25% gasta
export const SEIVA = { porSugada: 0.06, porElo: 0.05, curaPor25: 0.03, cervoPor25: 1 };

// Investida: se o inimigo levado bater numa pedra ou na borda, leva mais esta força
export const BATIDA_GALHADA = { fator: 0.5 };

// Golpes. Campos:
//  investida = corre e leva o 1º inimigo enganchado na galhada; onde para, brota uma árvore:
//              { distancia (m), vel (m/s), enraiza (s de Enraizado), explosao: { raio, fator } ou null }
//  elo       = a semente que acerta prende um cipó entre os dois e suga vida:
//              { max (cipós ao mesmo tempo), duracao (s), alcance (m: mais longe, arrebenta),
//                fator (força de cada pedaço, a cada meio segundo), cura (da vida dele, a cada pedaço) }
//  selva     = área em volta (a Selva Viva de sempre) que gasta a Seiva para curar
//  manada    = cervos-espírito que correm para fora em leque, atravessando os inimigos:
//              { n, abertura (radianos), vel (m/s), alcance (m), fator (força de cada cervo), selva (também a área) }
export const GOLPES_SILVARION = {
  // ---- Perto ----
  investidaGalhada: {
    nome: 'Investida da Galhada', elemento: 'silvestre', tipo: 'corpo', poder: 22, recarga: 1.8, alcance: 6,
    investida: { distancia: 6, vel: 15, enraiza: 1, explosao: null },
  },
  investidaRaiz: {
    nome: 'Investida da Galhada', elemento: 'silvestre', tipo: 'corpo', poder: 25, recarga: 1.8, alcance: 7,
    investida: { distancia: 7, vel: 16, enraiza: 1.5, explosao: null },
  },
  investidaAncestral: {
    nome: 'Investida Ancestral', elemento: 'silvestre', tipo: 'corpo', poder: 28, recarga: 1.8, alcance: 8,
    investida: { distancia: 8, vel: 17, enraiza: 1.5, explosao: { raio: 2.5, fator: 0.6 } },
  },
  // ---- Disparo ----
  sementeElo: {
    nome: 'Semente Parasita', elemento: 'silvestre', tipo: 'projetil', poder: 13, recarga: 1.9, velocidade: 15, raio: 0.55, quantidade: 3,
    elo: { max: 1, duracao: 3, alcance: 11, fator: 0.25, cura: 0.012 },
  },
  sementeEloDupla: {
    nome: 'Semente Parasita', elemento: 'silvestre', tipo: 'projetil', poder: 13, recarga: 1.9, velocidade: 15, raio: 0.55, quantidade: 4,
    elo: { max: 2, duracao: 3, alcance: 11, fator: 0.25, cura: 0.012 },
  },
  floracaoParasita: {
    nome: 'Floração Parasita', elemento: 'silvestre', tipo: 'projetil', poder: 14, recarga: 2, velocidade: 15, raio: 0.6, quantidade: 5,
    elo: { max: 2, duracao: 3, alcance: 12, fator: 0.5, cura: 0.024 },
  },
  // ---- Área ----
  // raio = tamanho da área em volta / até onde a IA acha que os cervos chegam
  selvaVivaLenda: {
    nome: 'Selva Viva', elemento: 'silvestre', tipo: 'area', poder: 34, recarga: 6.5, raio: 6, lentidao: 2,
    selva: true, manada: null,
  },
  manadaEspiritual: {
    nome: 'Manada Espiritual', elemento: 'silvestre', tipo: 'area', poder: 20, recarga: 6.5, raio: 7,
    selva: false, manada: { n: 3, abertura: 1.0, vel: 13, alcance: 9, fator: 1 },
  },
  manadaRaiz: {
    nome: 'Manada Espiritual', elemento: 'silvestre', tipo: 'area', poder: 22, recarga: 6.5, raio: 7,
    selva: false, manada: { n: 5, abertura: 1.5, vel: 13, alcance: 10, fator: 1 },
  },
  despertarFloresta: {
    nome: 'Despertar da Floresta', elemento: 'silvestre', tipo: 'area', poder: 30, recarga: 7, raio: 6, lentidao: 2,
    selva: true, manada: { n: 7, abertura: 2.4, vel: 14, alcance: 11, fator: 0.8 },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_SILVARION = [
  ['galhadaAncestral', 'sementeParasita', 'selvaVivaLenda'],          // Silvárion (perto e disparo de sempre, de dados.js)
  ['investidaGalhada', 'sementeElo', 'manadaEspiritual'],             // Bosquárion
  ['investidaRaiz', 'sementeEloDupla', 'manadaRaiz'],                 // Raizárion
  ['investidaAncestral', 'floracaoParasita', 'despertarFloresta'],    // Ancestrárion
];

// Melhorias (no lugar das padrão de dados.js): lendário já nasce com a Parasita em tudo
// (como o chefe de sempre); não tem disparo ×2/×3 (no lugar, ganha mais sementes).
export const MELHORIAS_SILVARION = [0, 1, 2, 3].map(() => ({ disparos: 1, efeitoArea: true, efeitoPerto: true, efeitoDisparo: true, forcaEfeito: 1.5 }));

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_SILVARION = [
  ['Seiva Vital: cada vez que a Parasita suga vida, a barra enche.', 'Selva Viva gasta a Seiva: cura 3% da vida a cada 25%.', 'Todos os golpes podem causar Parasita.'],
  ['Investida da Galhada: corre 6 m levando o inimigo; onde para, brota uma árvore que enraíza.', 'Elo Vital: a semente prende um cipó que suga vida por 3 s.', 'Manada Espiritual: 3 cervos-espírito (+1 a cada 25% de Seiva).'],
  ['Investida de 7 m (enraíza 1,5 s).', 'Elo Vital em até 2 inimigos.', '5 cervos-espírito.'],
  ['Investida Ancestral: a árvore explode em flores.', 'Floração Parasita: 5 sementes; os Elos sugam o dobro.', 'Despertar da Floresta: 7 cervos e a Selva Viva em volta.'],
];
export const NOVIDADES_SILVARION = [
  null,
  ['Investida da Galhada', 'Elo Vital', 'Manada Espiritual'],
  ['Investida de 7 m', 'Elo em 2 inimigos', '5 cervos-espírito'],
  ['Investida Ancestral', 'Floração Parasita', 'Despertar da Floresta'],
];
