// =============================================================
// HABILIDADES DA VULCARAPA (raro de Fogo)
// Vulcarapa (Nv.1) > Basaltuga (Nv.55) > Crateruga (Nv.70) > Colossarapa (Nv.90, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, alcance, poças,
// tempo do Modo Vulcão ou quantas bombas saem, mexa aqui. Como cada golpe
// funciona e aparece na batalha fica em vulcarapa-batalha.js.
//
// A ideia: ARTILHARIA. Lenta, quer ficar longe, bombardeia com lava em arco e
// enche o chão de poças de lava. A defesa dela é pular para trás (Recuo).
// O Modo Vulcão finca ela no chão e o vulcão das costas atira sozinho (torre).
// =============================================================

// Golpes. Campos:
//  poder, recarga = força e segundos até poder usar de novo
//  alcance = (perto) até onde a explosão da frente acerta (m)
//  recuo  = explosão na frente e pulo para trás: { distancia (m), vel (m/s), largura (ângulo do leque da
//           explosão, em radianos), poca (poça de lava onde ela estava) ou null, atordoa (s) ou 0 }
//  bomba  = bomba de lava em arco: { alcance, minimo (m), voo (s no ar), altura (m), area (m),
//           tamanho, quantidade (1 = no alvo; 2 = + uma à frente de para onde ele anda;
//           3 = + duas dos lados), espalha (m entre as bombas), poca ou null }
//  poca   = poça de lava no chão: { raio (m), duracao (s), poder (de cada pedaço, a cada meio segundo) }
//  vulcao = Modo Vulcão: { duracao (s), intervalo (s entre os tiros), bombas (por tiro), alcance (m),
//           poderTiro (força de cada bomba), erupcao (m em volta ao fincar), final: { raio, poder } ou null,
//           bomba (como a bomba do disparo, sem quantidade) }
//  Como no Sol do Solito e no casco do Vaporito, a recarga do Modo Vulcão só começa quando ele acaba.
const POCA_PEQUENA = { raio: 1.2, duracao: 2.5, poder: 4 };
const POCA_RECUO = { raio: 1.6, duracao: 3, poder: 5 };
const POCA_GRANDE = { raio: 2, duracao: 3, poder: 6 };

export const GOLPES_VULCARAPA = {
  // ---- Perto ----
  recuoLava: {
    nome: 'Recuo de Lava', elemento: 'fogo', tipo: 'corpo', poder: 12, recarga: 2.5, alcance: 2.5,
    recuo: { distancia: 4, vel: 14, largura: 1.2, poca: null, atordoa: 0 },
  },
  recuoBasalto: {
    nome: 'Recuo de Lava', elemento: 'fogo', tipo: 'corpo', poder: 14, recarga: 2.5, alcance: 2.6,
    recuo: { distancia: 5, vel: 15, largura: 1.2, poca: null, atordoa: 0 },
  },
  recuoExplosivo: {
    nome: 'Recuo Explosivo', elemento: 'fogo', tipo: 'corpo', poder: 16, recarga: 2.5, alcance: 2.8,
    recuo: { distancia: 5, vel: 15, largura: 1.3, poca: POCA_RECUO, atordoa: 0 },
  },
  recuoColosso: {
    nome: 'Recuo do Colosso', elemento: 'fogo', tipo: 'corpo', poder: 18, recarga: 2.5, alcance: 3,
    recuo: { distancia: 6, vel: 16, largura: 1.4, poca: POCA_GRANDE, atordoa: 0.5 },
  },
  // ---- Disparo ----
  bombaLava: {
    nome: 'Bomba de Lava', elemento: 'fogo', tipo: 'projetil', poder: 16, recarga: 1.8,
    bomba: { alcance: 11, minimo: 3, voo: 0.75, altura: 4, area: 1.5, tamanho: 0.42, quantidade: 1, espalha: 0, poca: null },
  },
  bombaDupla: {
    nome: 'Bomba Dupla', elemento: 'fogo', tipo: 'projetil', poder: 15, recarga: 1.9,
    bomba: { alcance: 11, minimo: 3, voo: 0.75, altura: 4, area: 1.5, tamanho: 0.45, quantidade: 2, espalha: 2, poca: POCA_PEQUENA },
  },
  chuvaMeteoros: {
    nome: 'Chuva de Meteoros', elemento: 'fogo', tipo: 'projetil', poder: 16, recarga: 2,
    bomba: { alcance: 12, minimo: 3, voo: 0.8, altura: 4.5, area: 1.6, tamanho: 0.5, quantidade: 3, espalha: 2.2, poca: POCA_PEQUENA },
  },
  // ---- Área (Modo Vulcão) ----
  // raio = tamanho da erupção em volta quando ela finca (a IA usa para escolher o golpe)
  modoVulcao: {
    nome: 'Modo Vulcão', elemento: 'fogo', tipo: 'area', poder: 14, recarga: 9, raio: 3,
    vulcao: { duracao: 4, intervalo: 1.2, bombas: 1, alcance: 11, poderTiro: 10, final: null,
      bomba: { voo: 0.7, altura: 5, area: 1.4, tamanho: 0.36, poca: null } },
  },
  modoVulcaoBasalto: {
    nome: 'Modo Vulcão', elemento: 'fogo', tipo: 'area', poder: 16, recarga: 9, raio: 3,
    vulcao: { duracao: 5, intervalo: 1.2, bombas: 1, alcance: 11, poderTiro: 11, final: null,
      bomba: { voo: 0.7, altura: 5, area: 1.4, tamanho: 0.38, poca: null } },
  },
  crateraViva: {
    nome: 'Cratera Viva', elemento: 'fogo', tipo: 'area', poder: 18, recarga: 10, raio: 3.2,
    vulcao: { duracao: 6, intervalo: 0.9, bombas: 1, alcance: 11, poderTiro: 12, final: null,
      bomba: { voo: 0.7, altura: 5, area: 1.5, tamanho: 0.4, poca: POCA_PEQUENA } },
  },
  erupcaoAncestral: {
    nome: 'Erupção Ancestral', elemento: 'fogo', tipo: 'area', poder: 20, recarga: 11, raio: 3.5,
    vulcao: { duracao: 8, intervalo: 0.9, bombas: 2, alcance: 12, poderTiro: 13, final: { raio: 5, poder: 34 },
      bomba: { voo: 0.7, altura: 5.5, area: 1.6, tamanho: 0.44, poca: POCA_PEQUENA } },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_VULCARAPA = [
  ['recuoLava', 'bombaLava', 'modoVulcao'],              // Vulcarapa
  ['recuoBasalto', 'bombaLava', 'modoVulcaoBasalto'],    // Basaltuga: queimadura, recuo de 5 m, 5 s de vulcão
  ['recuoExplosivo', 'bombaDupla', 'crateraViva'],       // Crateruga: poças de lava
  ['recuoColosso', 'chuvaMeteoros', 'erupcaoAncestral'], // Colossarapa
];

// No máximo estas poças de lava de um mesmo monstro ao mesmo tempo (a mais velha some)
export const MAX_POCAS_LAVA = 4;

// Melhorias (no lugar das padrão de dados.js): não tem disparo ×2/×3;
// a Queimadura chega em tudo na 1ª evolução e dura 50% mais na Colossarapa.
export const MELHORIAS_VULCARAPA = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: true,  efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: true,  efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: true,  efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_VULCARAPA = [
  ['Recuo de Lava: explode na frente e pula 4 m para trás.', 'Bomba de Lava: cai onde o alvo estava (3 a 11 m), por cima dos obstáculos.', 'Modo Vulcão: finca 4 s (não anda) e o vulcão atira sozinho a cada 1,2 s. O Recuo termina o Modo Vulcão.'],
  ['Recuo de 5 m.', 'Recuo, Bomba e Modo Vulcão podem causar Queimadura.', 'Modo Vulcão dura 5 s.'],
  ['Recuo Explosivo: deixa uma poça de lava onde ela estava.', 'Bomba Dupla: 2 bombas, cada uma deixa uma poça de lava.', 'Cratera Viva: 6 s, uma bomba a cada 0,9 s, com poças.'],
  ['Recuo do Colosso: 6 m e a explosão atordoa.', 'Chuva de Meteoros: 3 bombas.', 'Erupção Ancestral: 8 s, 2 bombas por vez e uma grande erupção de 5 m no fim.', 'Queimadura dura 50% mais.'],
];
export const NOVIDADES_VULCARAPA = [
  null,
  ['Tudo agora causa Queimadura', 'Recuo de 5 m', 'Modo Vulcão de 5 s'],
  ['Recuo Explosivo (poça de lava)', 'Bomba Dupla', 'Cratera Viva'],
  ['Recuo do Colosso (atordoa)', 'Chuva de Meteoros', 'Erupção Ancestral', 'Queimadura dura mais'],
];
