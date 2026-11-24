// =============================================================
// HABILIDADES DA LINHA DO LUMINO (Luz)
// Lumino (Nv.1) > Lumelo (Nv.12) > Prismal (Nv.30) > Aurealis (Nv.50, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, recarga, distância
// ou tamanho, mexa aqui. Como cada golpe funciona e aparece na batalha fica
// em lumino-batalha.js.
//
// Só esta linha usa estes golpes. Os golpes de Luz de sempre (em dados.js)
// continuam para quem não é desta linha.
// =============================================================

// Golpes da linha. Campos:
//  poder    = força do golpe (no passo, a de cada explosão de cristais; no estilhaço, a do
//             cristal; na redoma, a do clarão do fim)
//  recarga  = segundos até poder usar de novo
//  passo    = teletransporte para onde o joystick aponta (sem apontar: na direção do alvo):
//             { distancia (m), raio (até onde os cristais acertam, m), pontos ('inicio' = onde
//             ele some, 'meio' = no caminho, 'fim' = onde aparece), asas (Aurealis: as asas
//             cortam em volta), invul (s sem levar dano) }
//  alcance  = no estilhaço, até onde o cristal vai antes de se dividir (m)
//  divide   = o cristal se divide ao acertar alguém ou chegar no alcance:
//             { raios (quantos), abertura (ângulo total do leque, em radianos), fator (força
//             de cada raio), alcance (m), vel (m/s), arcoIris (raios coloridos) }
//  raio     = tamanho da redoma (m)
//  redoma   = bolha de luz em volta dele: { duracao (s), reducao (0,3 = recebe 30% menos
//             dano), forca (os tiros devolvidos voltam com essa força: 1,5 = +50%),
//             colunas (Aurealis: no fim caem colunas de luz nos inimigos:
//             { n, alcance (m), raio (m), fator, atraso (s) }) }
export const GOLPES_LUMINO = {
  // ---- Perto: Passo de Luz (teletransporte com cristais) ----
  passoLuz: {
    nome: 'Passo de Luz', elemento: 'luz', tipo: 'corpo', poder: 15, recarga: 2.5, alcance: 2,
    passo: { distancia: 5, raio: 2, pontos: ['fim'], invul: 0.25 },
  },
  passoPrismatico: {
    nome: 'Passo Prismático', elemento: 'luz', tipo: 'corpo', poder: 14, recarga: 2.5, alcance: 2,
    passo: { distancia: 6, raio: 2, pontos: ['inicio', 'fim'], invul: 0.25 },
  },
  passoCelestial: {
    nome: 'Passo Celestial', elemento: 'luz', tipo: 'corpo', poder: 15, recarga: 2.8, alcance: 2.5,
    passo: { distancia: 7, raio: 2.5, pontos: ['inicio', 'meio', 'fim'], asas: true, invul: 0.3 },
  },
  // ---- Disparo: Estilhaço (cristal que se divide) ----
  estilhaco: {
    nome: 'Estilhaço de Luz', elemento: 'luz', tipo: 'projetil', poder: 14, recarga: 1.5,
    velocidade: 18, raio: 0.45, alcance: 8,
    divide: { raios: 3, abertura: 0.5, fator: 0.5, alcance: 5, vel: 22 },
  },
  estilhacoPrisma: {
    nome: 'Estilhaço Prismático', elemento: 'luz', tipo: 'projetil', poder: 16, recarga: 1.5,
    velocidade: 18, raio: 0.5, alcance: 8,
    divide: { raios: 5, abertura: 0.8, fator: 0.45, alcance: 5.5, vel: 22 },
  },
  estilhacoArcoIris: {
    nome: 'Estilhaço Arco-Íris', elemento: 'luz', tipo: 'projetil', poder: 18, recarga: 1.6,
    velocidade: 19, raio: 0.55, alcance: 9,
    divide: { raios: 7, abertura: 1.0, fator: 0.4, alcance: 6, vel: 23, arcoIris: true },
  },
  // ---- Área: Redoma (devolve tiros e protege) ----
  redomaLuz: {
    nome: 'Redoma de Luz', elemento: 'luz', tipo: 'area', poder: 16, recarga: 8, raio: 3,
    redoma: { duracao: 2, reducao: 0.3, forca: 1 },
  },
  redomaPrisma: {
    nome: 'Redoma Prismática', elemento: 'luz', tipo: 'area', poder: 20, recarga: 9, raio: 3.8,
    redoma: { duracao: 3, reducao: 0.3, forca: 1.5 },
  },
  julgamentoLuz: {
    nome: 'Julgamento', elemento: 'luz', tipo: 'area', poder: 24, recarga: 10, raio: 4.2,
    redoma: { duracao: 4, reducao: 0.3, forca: 1.5, colunas: { n: 6, alcance: 6, raio: 1.2, fator: 0.4, atraso: 0.5 } },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_LUMINO = [
  ['investida', 'estilhaco', 'redomaLuz'],                  // Lumino
  ['passoLuz', 'estilhaco', 'redomaLuz'],                   // Lumelo: teletransporte, + Exposto
  ['passoPrismatico', 'estilhacoPrisma', 'redomaPrisma'],   // Prismal: cristais nos 2 lugares, 5 raios
  ['passoCelestial', 'estilhacoArcoIris', 'julgamentoLuz'], // Aurealis: asas, 7 raios, colunas de luz
];

// Melhorias desta linha (no lugar das melhorias padrão de dados.js):
// não tem disparo ×2/×3 (no lugar, o cristal se divide); o Exposto chega no
// estilhaço e no clarão da redoma no Lumelo.
export const MELHORIAS_LUMINO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_LUMINO = [
  ['Estilhaço de Luz: cristal que se divide em 3 raios ao acertar alguém ou chegar a 8 m.', 'Redoma de Luz: bolha de 3 m por 2 s que devolve os tiros dos inimigos e diminui 30% do outro dano; solta um clarão no fim.'],
  ['Passo de Luz: some e aparece 5 m para onde você aponta; cristais saem do chão e acertam quem estiver a até 2 m.', 'Estilhaço e o clarão da Redoma podem causar Exposto.'],
  ['Passo Prismático: 6 m; os cristais saem onde ele some e onde aparece.', 'Estilhaço Prismático: divide em 5 raios.', 'Redoma Prismática: 3,8 m por 3 s; os tiros devolvidos voltam 50% mais fortes.'],
  ['Passo Celestial: 7 m; cristais no começo, no meio e no fim (2,5 m) e as asas cortam em volta.', 'Estilhaço Arco-Íris: divide em 7 raios coloridos.', 'Julgamento: redoma de 4 s e, no fim, 6 colunas de luz caem nos inimigos.', 'Exposto dura 50% mais.'],
];
export const NOVIDADES_LUMINO = [
  null,
  ['Passo de Luz (teletransporte)', 'Estilhaço e Redoma agora causam Exposto'],
  ['Passo Prismático (cristais nos 2 lugares)', 'Estilhaço em 5 raios', 'Redoma Prismática (tiros voltam +50%)'],
  ['Passo Celestial (asas)', 'Estilhaço Arco-Íris (7 raios)', 'Julgamento (colunas de luz)'],
];
