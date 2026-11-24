// =============================================================
// HABILIDADES DA LINHA DO BREUZINHO (Trevas)
// Breuzinho (Nv.1) > Sombrelo (Nv.6) > Umbrafel (Nv.12) > Noctífero (Nv.30)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, alcance, recarga
// ou o bônus de dano, mexa aqui. Como cada golpe aparece na batalha fica em
// trevas-batalha.js.
//
// O Breuzinho continua com os golpes de Trevas de sempre (em dados.js).
// Só esta linha usa estes golpes.
// =============================================================

// Golpes da linha. Campos:
//  poder    = força do golpe
//  recarga  = segundos até poder usar de novo
//  alcance  = no perto: até onde a mordida chega (m) | no disparo: até onde a bola vai (m)
//  olhos    = tiro de bola com olhos (a bola some quando chega no alcance)
//  tamanho  = tamanho da bola com olhos
//  raio     = tamanho da área (m)
//  lentidao = a área deixa os atingidos lentos por esses segundos
//  trevas   = bônus da área para quem a usou: { dano (0,05 = +5% de dano em todos os
//             golpes), duracao (s), escuro (s que a arena fica escura) }
//             Não acumula: usar de novo só renova o tempo.
export const GOLPES_TREVAS = {
  // ---- Perto: a mordida ----
  // (o Sombrelo usa a Mordida Sombria de dados.js)
  mordidaAbissal: {
    nome: 'Mordida Abissal', elemento: 'trevas', tipo: 'corpo', poder: 19, recarga: 1.1, alcance: 2.6,
  },
  mordidaNoite: {
    nome: 'Mordida da Noite Eterna', elemento: 'trevas', tipo: 'corpo', poder: 24, recarga: 1.2, alcance: 2.9,
  },
  // ---- Disparo: bola com olhos, de alcance curto ----
  olharSombrio: {
    nome: 'Olhar Sombrio', elemento: 'trevas', tipo: 'projetil', poder: 14, recarga: 1.4,
    velocidade: 13, raio: 0.55, alcance: 8, olhos: true, tamanho: 1,
  },
  olharAbissal: {
    nome: 'Olhar Abissal', elemento: 'trevas', tipo: 'projetil', poder: 16, recarga: 1.4,
    velocidade: 13, raio: 0.6, alcance: 9, olhos: true, tamanho: 1.2,
  },
  olharNoite: {
    nome: 'Olhar da Noite', elemento: 'trevas', tipo: 'projetil', poder: 17, recarga: 1.5,
    velocidade: 14, raio: 0.65, alcance: 10, olhos: true, tamanho: 1.3, morcegos: true,
  },
  // ---- Área: escurece a arena e dá mais dano ----
  vazioSombrio: {
    nome: 'Vazio', elemento: 'trevas', tipo: 'area', poder: 18, recarga: 5, raio: 3.6, lentidao: 2.5,
    trevas: { dano: 0.05, duracao: 8, escuro: 1.1 },
  },
  vazioAbissal: {
    nome: 'Vazio Abissal', elemento: 'trevas', tipo: 'area', poder: 20, recarga: 5.5, raio: 3.9, lentidao: 2.5,
    trevas: { dano: 0.10, duracao: 8, escuro: 1.3 },
  },
  abismoNoite: {
    nome: 'Abismo', elemento: 'trevas', tipo: 'area', poder: 31, recarga: 7, raio: 4.8, lentidao: 2,
    trevas: { dano: 0.15, duracao: 8, escuro: 1.8 },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_TREVAS = [
  ['investida', 'bolaSombria', 'vazio'],                 // Breuzinho: igual a antes
  ['mordidaSombria', 'olharSombrio', 'vazioSombrio'],    // Sombrelo: tiro curto, +5% de dano
  ['mordidaAbissal', 'olharAbissal', 'vazioAbissal'],    // Umbrafel: +10%, a área causa Medo
  ['mordidaNoite', 'olharNoite', 'abismoNoite'],         // Noctífero: +15%, a mordida causa Medo
];

// Melhorias desta linha (iguais às padrão de dados.js): disparo ×2 e ×3,
// Medo na área a partir do Umbrafel e na mordida no Noctífero.
export const MELHORIAS_TREVAS = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 2, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 2, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 3, efeitoArea: true,  efeitoPerto: true,  efeitoDisparo: false, forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_TREVAS = [
  [],
  ['Mordida Sombria: a bocarra de sombra morde o alvo.', 'Olhar Sombrio: 2 bolas com olhos seguidas, até 8 m.', 'Vazio escurece a arena e dá +5% de dano por 8 s.'],
  ['Mordida Abissal: bocarra maior e mais forte.', 'Olhar Abissal: 2 bolas com olhos maiores, até 9 m.', 'Vazio Abissal: +10% de dano por 8 s e pode causar Medo.'],
  ['Mordida da Noite Eterna: bocarra gigante e a garra do chão; pode causar Medo.', 'Olhar da Noite: 3 bolas com olhos e morcegos, até 10 m.', 'Abismo: o Astro Negro sobe, a arena escurece e dá +15% de dano por 8 s.', 'Medo dura 50% mais.'],
];
export const NOVIDADES_TREVAS = [
  null,
  ['Mordida Sombria', 'Olhar Sombrio (2 tiros, 8 m)', 'Vazio agora dá +5% de dano'],
  ['Mordida Abissal', 'Olhar Abissal (9 m)', 'Vazio Abissal: +10% de dano e Medo'],
  ['Mordida da Noite Eterna', 'Olhar da Noite com morcegos (3 tiros)', 'Abismo: +15% de dano'],
];
