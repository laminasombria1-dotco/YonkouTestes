// =============================================================
// HABILIDADES DA LINHA DO BRASITO (Fogo)
// Brasito (Nv.1) > Brasalobo (Nv.12) > Fornalobo (Nv.30) > Magmalobo (Nv.50, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, alcance, tamanho,
// recarga ou velocidade, mexa aqui. Como cada golpe funciona e aparece na
// batalha fica em brasito-batalha.js.
//
// Só esta linha usa estes golpes. Vulcarapa e os tipos duplos com Fogo
// continuam com os golpes de Fogo de sempre (em dados.js).
// =============================================================

// Golpes da linha. Campos:
//  poder    = força do golpe (no lança-chamas, é a soma de todo o jato)
//  recarga  = segundos até poder usar de novo
//  jato     = lança-chamas: { alcance (m), abertura (meio ângulo do cone, em radianos),
//             jatos (1 ou 2), separacao (ângulo entre os 2 jatos), duracao (s) }
//  raio     = tamanho da área do Rabo de Fogo (m)
//  dash     = quantos metros ele avança girando o rabo (0 = gira parado)
//  tamanhoRabo = quanto o rabo cresce durante o giro
export const GOLPES_BRASITO = {
  // ---- Lança-Chamas (no lugar da bola de fogo): jato contínuo saindo da boca ----
  lancaChamas: {
    nome: 'Lança-Chamas', elemento: 'fogo', tipo: 'projetil', poder: 14, recarga: 1.4,
    jato: { alcance: 5, abertura: 0.42, jatos: 1, separacao: 0, duracao: 0.55 },
  },
  lancaChamasDuplo: {
    nome: 'Lança-Chamas Duplo', elemento: 'fogo', tipo: 'projetil', poder: 18, recarga: 1.7,
    jato: { alcance: 5.5, abertura: 0.3, jatos: 2, separacao: 0.62, duracao: 0.6 },
  },
  lancaChamasInfernal: {
    nome: 'Lança-Chamas Infernal', elemento: 'fogo', tipo: 'projetil', poder: 22, recarga: 1.9,
    jato: { alcance: 14, abertura: 0.17, jatos: 2, separacao: 0.36, duracao: 0.7, magma: true },
  },
  // ---- Rabo de Fogo (no lugar da área): gira o corpo e bate com o rabo ----
  raboDeFogo: {
    nome: 'Rabo de Fogo', elemento: 'fogo', tipo: 'area', poder: 22, recarga: 5, raio: 3,
    dash: 0, tamanhoRabo: 1.7,
  },
  raboDeFogoDash: {
    nome: 'Rabo de Fogo', elemento: 'fogo', tipo: 'area', poder: 26, recarga: 5.5, raio: 3.2,
    dash: 3, tamanhoRabo: 1.9,
  },
  raboDeMagma: {
    nome: 'Rabo de Magma', elemento: 'fogo', tipo: 'area', poder: 32, recarga: 6.5, raio: 4.5,
    dash: 3.5, tamanhoRabo: 2.6, magma: true,
  },
};

// Golpes de cada forma: [perto, disparo, área]
// O perto é sempre a Investida (Normal), como todo monstro.
export const GOLPES_POR_FORMA_BRASITO = [
  ['investida', 'lancaChamas', 'raboDeFogo'],           // Brasito
  ['investida', 'lancaChamas', 'raboDeFogo'],           // Brasalobo: + queimadura
  ['investida', 'lancaChamasDuplo', 'raboDeFogoDash'],  // Fornalobo: 2 jatos, mini dash
  ['investida', 'lancaChamasInfernal', 'raboDeMagma'],  // Magmalobo: alcance enorme, rabo maior
];

// Velocidade extra depois de usar a Investida (0,12 = +12%), por forma, e quanto dura
export const VELOCIDADE_INVESTIDA = [0, 0.12, 0.20, 0.30];
export const DURACAO_VELOCIDADE = 10; // segundos

// Melhorias desta linha (no lugar das melhorias padrão de dados.js):
// não tem disparo ×2/×3; a queimadura chega no lança-chamas e no rabo já na 1ª evolução.
export const MELHORIAS_BRASITO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_BRASITO = [
  ['Lança-Chamas: jato de fogo saindo da boca, 5 m à frente.', 'Rabo de Fogo: gira e bate com o rabo em volta (3 m).'],
  ['Investida dá +12% de velocidade por 10 s.', 'Lança-Chamas e Rabo de Fogo podem causar Queimadura.'],
  ['Investida dá +20% de velocidade por 10 s.', 'Lança-Chamas Duplo: 2 jatos em V.', 'Rabo de Fogo com mini dash: avança 3 m girando.'],
  ['Investida dá +30% de velocidade por 10 s.', 'Lança-Chamas Infernal: os 2 jatos chegam a 14 m.', 'Rabo de Magma: fogo maior, área de 4,5 m.', 'Queimaduras duram 50% mais.'],
];
export const NOVIDADES_BRASITO = [
  null,
  ['Investida agora dá +12% de velocidade', 'Lança-Chamas e Rabo de Fogo agora queimam'],
  ['Lança-Chamas Duplo', 'Rabo de Fogo ganha mini dash', 'velocidade da Investida: +20%'],
  ['Lança-Chamas Infernal (14 m)', 'Rabo de Magma', 'velocidade da Investida: +30%'],
];
