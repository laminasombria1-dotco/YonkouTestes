// =============================================================
// HABILIDADES DA LINHA DO SOLITO (Sol)
// Solito (Nv.1) > Solário (Nv.12) > Solaurum (Nv.30) > Astrorei (Nv.50, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, recarga, alcance,
// bônus do sol ou calor, mexa aqui. Como cada golpe funciona e aparece na
// batalha fica em solito-batalha.js.
//
// Só esta linha usa estes golpes. Os golpes de Sol de sempre (em dados.js)
// continuam para quem não é desta linha.
// =============================================================

// Golpes da linha. Campos:
//  poder    = força do golpe (no calor, a força de CADA pedaço)
//  recarga  = segundos até poder usar de novo (no Sol, conta só DEPOIS que o sol some)
//  sol      = bola de sol que fica no campo e dá bônus a quem a soltou (no campo todo,
//             enquanto ela existir): { duracao (s), ataque (0,10 = +10% de dano),
//             defesa (0,15 = recebe 15% menos dano), velocidade (0,15 = +15%),
//             atira (o sol solta um laser junto com o do monstro, com essa parte da força) }
//  laser    = feixe fino, reto e longo que atravessa todos na linha (obstáculos seguram):
//             { alcance (m), largura (m), duracao (s que o feixe aparece) }
//  calor    = o ar em volta dele esquenta e machuca quem está perto (anda junto com ele):
//             { duracao (s), intervalo (s entre os pedaços), esquenta (cada pedaço que o
//             mesmo inimigo leva é essa parte mais forte: 0,15 = +15%), explosao (no fim:
//             { poder, raio }) }
//  raio     = tamanho da área do calor (m)
export const GOLPES_SOLITO = {
  // ---- Perto: o Sol ----
  pequenoSol: {
    nome: 'Pequeno Sol', elemento: 'sol', tipo: 'corpo', poder: 0, recarga: 15, alcance: 0,
    sol: { duracao: 20, ataque: 0.10, defesa: 0.15, velocidade: 0.15, atira: 0 },
  },
  solDourado: {
    nome: 'Sol Dourado', elemento: 'sol', tipo: 'corpo', poder: 0, recarga: 15, alcance: 0,
    sol: { duracao: 20, ataque: 0.15, defesa: 0.20, velocidade: 0.20, atira: 0 },
  },
  solRei: {
    nome: 'Sol Rei', elemento: 'sol', tipo: 'corpo', poder: 0, recarga: 15, alcance: 0,
    sol: { duracao: 20, ataque: 0.20, defesa: 0.25, velocidade: 0.25, atira: 0.6 },
  },
  // ---- Disparo: laser ----
  raioSolarSolito: {
    nome: 'Raio Solar', elemento: 'sol', tipo: 'projetil', poder: 14, recarga: 1.6, raio: 0.5,
    laser: { alcance: 10, largura: 0.5, duracao: 0.25 },
  },
  raioSolarForte: {
    nome: 'Raio Solar', elemento: 'sol', tipo: 'projetil', poder: 16, recarga: 1.2, raio: 0.8,
    laser: { alcance: 12, largura: 0.8, duracao: 0.25 },
  },
  laserReal: {
    nome: 'Laser Real', elemento: 'sol', tipo: 'projetil', poder: 20, recarga: 1.8, raio: 1,
    laser: { alcance: 14, largura: 1, duracao: 0.3 },
  },
  // ---- Área: calor em volta dele ----
  calorSolito: {
    nome: 'Calor', elemento: 'sol', tipo: 'area', poder: 4, recarga: 6, raio: 3,
    calor: { duracao: 3, intervalo: 0.5, esquenta: 0 },
  },
  ondaCalor: {
    nome: 'Onda de Calor', elemento: 'sol', tipo: 'area', poder: 4, recarga: 7, raio: 3.8,
    calor: { duracao: 4, intervalo: 0.5, esquenta: 0.15 },
  },
  supernovaAstrorei: {
    nome: 'Supernova', elemento: 'sol', tipo: 'area', poder: 5, recarga: 8, raio: 4.5,
    calor: { duracao: 5, intervalo: 0.5, esquenta: 0.15, explosao: { poder: 24, raio: 4.5 } },
  },
};

// Golpes de cada forma: [perto, disparo, área]
// O Solito começa com a Investida (Normal); a partir do Solário, o perto é o Sol.
export const GOLPES_POR_FORMA_SOLITO = [
  ['investida', 'raioSolarSolito', 'calorSolito'],   // Solito
  ['pequenoSol', 'raioSolarSolito', 'calorSolito'],  // Solário: sol, + ofuscado
  ['solDourado', 'raioSolarForte', 'ondaCalor'],     // Solaurum: sol maior, laser grosso, calor que esquenta
  ['solRei', 'laserReal', 'supernovaAstrorei'],      // Astrorei: o sol atira junto, supernova
];

// Melhorias desta linha (no lugar das melhorias padrão de dados.js):
// não tem disparo ×2/×3; o ofuscado chega no laser e no calor no Solário.
export const MELHORIAS_SOLITO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_SOLITO = [
  ['Raio Solar: laser fino de 10 m que atravessa todos na linha.', 'Calor: quem fica a até 3 m dele se queima por 3 s.'],
  ['Pequeno Sol: solta um sol que fica 20 s no campo. Enquanto ele existir: +10% de dano, 15% menos dano recebido e +15% de velocidade. Volta 15 s depois que o sol some.', 'Raio Solar e Calor podem causar Ofuscado.'],
  ['Sol Dourado: +15% de dano, 20% menos dano recebido, +20% de velocidade.', 'Raio Solar mais grosso (12 m) e com recarga menor.', 'Onda de Calor: 3,8 m por 4 s; esquenta: cada pedaço no mesmo inimigo é 15% mais forte.'],
  ['Sol Rei: +20% de dano, 25% menos dano recebido, +25% de velocidade; o sol também atira o laser (60% da força).', 'Laser Real: 14 m, mais grosso.', 'Supernova: 4,5 m por 5 s, esquenta e explode no fim.', 'Ofuscado dura 50% mais.'],
];
export const NOVIDADES_SOLITO = [
  null,
  ['Pequeno Sol (bônus)', 'laser e calor agora ofuscam'],
  ['Sol Dourado', 'laser mais grosso', 'Onda de Calor (esquenta)'],
  ['Sol Rei (o sol atira)', 'Laser Real', 'Supernova'],
];
