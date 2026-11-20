// =============================================================
// HABILIDADES DA LINHA DO GOTINHO (Água)
// Gotinho (Nv.1) > Marolo (Nv.6) > Marulhão (Nv.12) > Tsunamar (Nv.30)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, alcance, tamanho,
// recarga, empurrão ou escudo, mexa aqui. Como cada golpe funciona e aparece
// na batalha fica em gotinho-batalha.js.
//
// Só esta linha usa estes golpes. Aquaraia e os tipos duplos com Água
// (Vaporito e evoluções) continuam com os golpes de Água de sempre (em dados.js).
// =============================================================

// Golpes da linha. Campos:
//  poder     = força do golpe (na Onda Dupla, a força de CADA onda)
//  recarga   = segundos até poder usar de novo
//  velocidade, raio = do tiro (metros por segundo / tamanho da bola)
//  atravessa = quantos inimigos o tiro atravessa antes de parar
//  fatorAtravessa = quanto da força sobra para o inimigo atravessado (0,7 = 70%)
//  respingo  = explosão quando o tiro acerta: { raio (m), fator (força, 0,5 = 50%) }
//  poca      = poça que fica no chão onde o tiro acerta: { raio (m), duracao (s),
//              chance de encharcar a cada meio segundo }
//  onda      = parede de água que anda para a frente: { largura (m), distancia (m),
//              duracao (s), empurra (m), ondas (1 ou 2), intervalo (s entre as ondas) }
//  anel      = anel de água que cresce em volta: { de (m), ate (m), duracao (s), empurra (m) }
export const GOLPES_GOTINHO = {
  // ---- Disparo ----
  jatoGotinho: {
    nome: 'Jato d\'Água', elemento: 'agua', tipo: 'projetil', poder: 13, recarga: 1.3,
    velocidade: 18, raio: 0.4, atravessa: 1, fatorAtravessa: 0.7, visual: 'jato',
  },
  hidrocanhaoGotinho: {
    nome: 'Hidrocanhão', elemento: 'agua', tipo: 'projetil', poder: 20, recarga: 1.8,
    velocidade: 18, raio: 0.65, respingo: { raio: 2, fator: 0.5 }, visual: 'canhao',
  },
  hidrocanhaoPoca: {
    nome: 'Hidrocanhão', elemento: 'agua', tipo: 'projetil', poder: 20, recarga: 1.8,
    velocidade: 18, raio: 0.7, respingo: { raio: 2, fator: 0.5 }, visual: 'canhao',
    poca: { raio: 2.5, duracao: 3, chance: 0.35 },
  },
  // ---- Área ----
  // raio = até onde a IA acha que a onda chega (para escolher o golpe)
  ondaGotinho: {
    nome: 'Onda', elemento: 'agua', tipo: 'area', poder: 20, recarga: 5, raio: 6,
    onda: { largura: 3, distancia: 6, duracao: 0.5, empurra: 3, ondas: 1, intervalo: 0 },
  },
  ondaDupla: {
    nome: 'Onda Dupla', elemento: 'agua', tipo: 'area', poder: 13, recarga: 5.5, raio: 7,
    onda: { largura: 4, distancia: 7, duracao: 0.5, empurra: 3, ondas: 2, intervalo: 0.35 },
  },
  maremotoGotinho: {
    nome: 'Maremoto', elemento: 'agua', tipo: 'area', poder: 32, recarga: 7, raio: 7,
    anel: { de: 1, ate: 7, duracao: 0.7, empurra: 4 },
  },
};

// Golpes de cada forma: [perto, disparo, área]
// O perto é sempre a Investida (Normal), como todo monstro.
export const GOLPES_POR_FORMA_GOTINHO = [
  ['investida', 'jatoGotinho', 'ondaGotinho'],          // Gotinho
  ['investida', 'jatoGotinho', 'ondaGotinho'],          // Marolo: + escudo e encharcado
  ['investida', 'hidrocanhaoGotinho', 'ondaDupla'],     // Marulhão: tiro que explode, 2 ondas
  ['investida', 'hidrocanhaoPoca', 'maremotoGotinho'],  // Tsunamar: deixa poça, anel de 7 m
];

// Escudo d'Água depois de usar a Investida: quanto da vida máxima ele segura, por forma
export const ESCUDO_INVESTIDA = [0, 0.08, 0.12, 0.16];
export const DURACAO_ESCUDO = 6;  // segundos que o escudo fica
export const ESPERA_ESCUDO = 10;  // segundos até poder ganhar o escudo de novo

// Melhorias desta linha (no lugar das melhorias padrão de dados.js):
// não tem disparo ×2/×3; o encharcado chega no disparo e na área já na 1ª evolução.
export const MELHORIAS_GOTINHO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_GOTINHO = [
  ['Jato d\'Água: atravessa o 1º inimigo e acerta o de trás (70% da força).', 'Onda: parede de água que anda 6 m à frente e empurra 3 m.'],
  ['Investida dá um Escudo d\'Água de 8% da vida por 6 s (de novo só 10 s depois).', 'Jato d\'Água e Onda podem causar Encharcado.'],
  ['Escudo d\'Água: 12% da vida.', 'Hidrocanhão: explode quando acerta e molha quem está a até 2 m (50% da força).', 'Onda Dupla: 2 ondas seguidas, 4 m de largura, andam 7 m.'],
  ['Escudo d\'Água: 16% da vida.', 'Hidrocanhão deixa uma poça de 2,5 m por 3 s que encharca quem pisa.', 'Maremoto: anel de água que cresce até 7 m e empurra 4 m para fora.', 'Encharcado dura 50% mais.'],
];
export const NOVIDADES_GOTINHO = [
  null,
  ['Investida agora dá Escudo d\'Água', 'Jato d\'Água e Onda agora encharcam'],
  ['Hidrocanhão (explode)', 'Onda Dupla', 'escudo: 12% da vida'],
  ['Hidrocanhão deixa poça', 'Maremoto (anel de 7 m)', 'escudo: 16% da vida'],
];
