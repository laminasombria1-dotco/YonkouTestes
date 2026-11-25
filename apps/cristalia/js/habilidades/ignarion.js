// =============================================================
// HABILIDADES DO IGNÁRION (lendário Ígneo)
// Ignárion (Nv.1) > Pirárion (Nv.65) > Magmárion (Nv.75) > Infernárion (Nv.90)
// (as 3 evoluções são com o botão: missão + itens + ouro)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, arremesso, cometas,
// fissuras ou o Calor Ígneo, mexa aqui. Como cada golpe funciona e aparece na
// batalha fica em ignarion-batalha.js.
//
// A ideia: o CALOR ÍGNEO. Cada golpe que acerta (e cada dano que leva) enche a barra;
// cheia, ele entra em IGNIÇÃO sozinho e fica mais forte por alguns segundos.
// O chefe do Trono de Magma (o Ignárion da masmorra) também usa tudo isso.
// =============================================================

// Calor Ígneo:
//  porAcerto = quanto enche a cada golpe que acerta (0,08 = 8%) | porDano = a cada dano que leva
//  ignicao (por forma) = { duracao (s), dano (a mais: 0,2 = +20%), aura: { raio (m), poder } ou null,
//                          explosao: { raio (m), poder } no fim, ou null }
export const CALOR = {
  porAcerto: 0.08,
  porDano: 0.04,
  ignicao: [
    { duracao: 5, dano: 0.2, aura: null, explosao: null },                                          // Ignárion
    { duracao: 6, dano: 0.25, aura: null, explosao: null },                                         // Pirárion
    { duracao: 7, dano: 0.25, aura: { raio: 2, poder: 4 }, explosao: null },                        // Magmárion
    { duracao: 8, dano: 0.3, aura: { raio: 2, poder: 5 }, explosao: { raio: 5, poder: 40 } },       // Infernárion
  ],
};

// Arremesso: se o alvo bater numa pedra ou na borda, leva mais esta força e fica atordoado
export const BATIDA = { fator: 0.5, atordoa: 0.6 };

// Golpes. Campos:
//  arremesso = morde, segura e joga o alvo por cima da cabeça, para trás:
//              { distancia (m), voo (s), altura (m), explosao: { raio, fator } ou null, combustao (garantida) }
//  cometas   = { quantidade, abertura (radianos do leque), vel (m/s), alcance (m), explosao (raio em m),
//               tamanho, gigante: { tamanho, explosao, fator (força), vel } ou null }
//  cataclismo = área em volta + fissuras: { fissuras: { n, alcance (m), vel (m/s), fator (força de cada uma),
//               fogo (s que o fogo fica no chão; 0 = não fica), fogoPoder } ou null }
export const GOLPES_IGNARION = {
  // ---- Perto ----
  mordidaArremesso: {
    nome: 'Mordida e Arremesso', elemento: 'igneo', tipo: 'corpo', poder: 24, recarga: 1.6, alcance: 3.4,
    arremesso: { distancia: 5, voo: 0.55, altura: 2.6, explosao: null, combustao: false },
  },
  arremessoMagma: {
    nome: 'Mordida e Arremesso', elemento: 'igneo', tipo: 'corpo', poder: 27, recarga: 1.6, alcance: 3.5,
    arremesso: { distancia: 7, voo: 0.6, altura: 3, explosao: { raio: 2, fator: 0.6 }, combustao: false },
  },
  faucesInferno: {
    nome: 'Fauces do Inferno', elemento: 'igneo', tipo: 'corpo', poder: 30, recarga: 1.6, alcance: 3.6,
    arremesso: { distancia: 8, voo: 0.65, altura: 3.4, explosao: { raio: 3, fator: 0.7 }, combustao: true },
  },
  // ---- Disparo ----
  cometaIgneoLenda: {
    nome: 'Cometa Ígneo', elemento: 'igneo', tipo: 'projetil', poder: 14, recarga: 1.9,
    cometas: { quantidade: 3, abertura: 0.5, vel: 17, alcance: 12, explosao: 1.5, tamanho: 0.32, gigante: null },
  },
  cometaPirarion: {
    nome: 'Cometa Ígneo', elemento: 'igneo', tipo: 'projetil', poder: 14, recarga: 1.9,
    cometas: { quantidade: 4, abertura: 0.6, vel: 17, alcance: 12, explosao: 1.5, tamanho: 0.34, gigante: null },
  },
  cometaMagmarion: {
    nome: 'Cometa Ígneo', elemento: 'igneo', tipo: 'projetil', poder: 15, recarga: 1.9,
    cometas: { quantidade: 5, abertura: 0.7, vel: 17, alcance: 12, explosao: 2, tamanho: 0.36, gigante: null },
  },
  cometaSupremo: {
    nome: 'Cometa Supremo', elemento: 'igneo', tipo: 'projetil', poder: 16, recarga: 2.1,
    cometas: { quantidade: 5, abertura: 0.8, vel: 17, alcance: 13, explosao: 2, tamanho: 0.38,
      gigante: { tamanho: 0.85, explosao: 3, fator: 1.8, vel: 12 } },
  },
  // ---- Área ----
  cataclismoLenda: {
    nome: 'Cataclismo', elemento: 'igneo', tipo: 'area', poder: 36, recarga: 6.5, raio: 6,
    cataclismo: { fissuras: null },
  },
  cataclismoFissuras: {
    nome: 'Cataclismo', elemento: 'igneo', tipo: 'area', poder: 36, recarga: 6.5, raio: 6,
    cataclismo: { fissuras: { n: 5, alcance: 7, vel: 14, fator: 0.5, fogo: 0, fogoPoder: 0 } },
  },
  cataclismoMagma: {
    nome: 'Cataclismo', elemento: 'igneo', tipo: 'area', poder: 38, recarga: 6.5, raio: 6,
    cataclismo: { fissuras: { n: 7, alcance: 8, vel: 15, fator: 0.5, fogo: 0, fogoPoder: 0 } },
  },
  apocalipseIgneo: {
    nome: 'Apocalipse Ígneo', elemento: 'igneo', tipo: 'area', poder: 42, recarga: 7, raio: 7,
    cataclismo: { fissuras: { n: 8, alcance: 9, vel: 16, fator: 0.5, fogo: 2, fogoPoder: 4 } },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_IGNARION = [
  ['mordidaMagma', 'cometaIgneoLenda', 'cataclismoLenda'],   // Ignárion (a mordida de sempre, de dados.js)
  ['mordidaArremesso', 'cometaPirarion', 'cataclismoFissuras'], // Pirárion
  ['arremessoMagma', 'cometaMagmarion', 'cataclismoMagma'],     // Magmárion
  ['faucesInferno', 'cometaSupremo', 'apocalipseIgneo'],        // Infernárion
];

// Melhorias (no lugar das padrão de dados.js): lendário já nasce com a Combustão em tudo
// (como o chefe de sempre); não tem disparo ×2/×3 (no lugar, ganha mais cometas).
export const MELHORIAS_IGNARION = [0, 1, 2, 3].map(() => ({ disparos: 1, efeitoArea: true, efeitoPerto: true, efeitoDisparo: true, forcaEfeito: 1.5 }));

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_IGNARION = [
  ['Calor Ígneo: cada golpe que acerta enche a barra; cheia, entra em Ignição (5 s, +20% de dano).', 'Cometa Ígneo: 3 cometas que explodem ao acertar.', 'Todos os golpes podem causar Combustão.'],
  ['Mordida e Arremesso: joga o alvo 5 m para trás; se bater numa pedra, +50% e atordoa.', '4 cometas.', 'Cataclismo com 5 fissuras de fogo que correm pelo chão.', 'Ignição: 6 s, +25%.'],
  ['Arremesso de 7 m: o alvo explode onde cai.', '5 cometas.', '7 fissuras.', 'Ignição: 7 s, com aura que queima quem chega perto.'],
  ['Fauces do Inferno: arremesso de 8 m, explosão de 3 m e Combustão garantida.', 'Cometa Supremo: 5 cometas e um gigante.', 'Apocalipse Ígneo: 8 fissuras que deixam fogo no chão.', 'Ignição: 8 s, +30%, e explode no fim.'],
];
export const NOVIDADES_IGNARION = [
  null,
  ['Mordida e Arremesso', '4 cometas', 'Fissuras Ígneas', 'Ignição mais longa'],
  ['O arremesso explode', '5 cometas', '7 fissuras', 'Aura da Ignição'],
  ['Fauces do Inferno', 'Cometa Supremo', 'Apocalipse Ígneo', 'Explosão no fim da Ignição'],
];
