// =============================================================
// HABILIDADES DA LINHA DO BROTOBRASA (tipo duplo Fogo + Planta): o JARDINEIRO DE FOGO
// Brotobrasa (Nv.1) > Chamafolha (Nv.12) > Ardentroco (Nv.30) > Florinferno (Nv.50, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, recarga, alcance,
// quantas flores cabem no campo ou o tamanho das explosões, mexa aqui. Como
// cada golpe funciona e aparece na batalha fica em brotobrasa-batalha.js.
//
// Ele planta FLORES DE FOGO (armadilhas): elas explodem quando um inimigo chega perto.
// O Ardentroco e o Florinferno usam as FRUTAS DA CABEÇA: comem uma (Fruta Ardente, bônus
// de dano e velocidade, sem golpe de perto), jogam outras (Bombinhas de Fruta) e fazem
// chover frutas em volta (Chuva de Frutas), que ficam no chão como armadilhas.
// Os limites de flores e frutas deixam o jogo leve no celular de referência (Helio G95).
// =============================================================

// Golpes da linha. Campos:
//  poder    = força do golpe (na semente e no anel, a de cada explosão)
//  recarga  = segundos até poder usar de novo
//  alcance  = até onde a semente vai (m) | no golpe de perto, até onde ele acerta (m)
//  semente  = joga uma semente que vira uma flor de fogo no chão:
//             { max (quantas flores ao mesmo tempo), gatilho (m: explode se um inimigo
//             chegar a essa distância), raio (tamanho da explosão, m), vida (s: explode
//             sozinha depois disso), chao ({ duracao, raio, fator }: deixa fogo no chão) }
//             fruta: true = é uma fruta (Bombinhas de Fruta) no lugar da flor
//  leque    = golpe de perto em leque: { abertura (meio ângulo, radianos), golpes (1 ou 2),
//             intervalo (s entre os golpes) }
//  buff     = Fruta Ardente (no lugar do golpe de perto): { duracao (s), dano (0,25 = +25%),
//             vel (0,1 = +10% de velocidade) }
//  queimando = golpe de perto em quem está com Queimadura dá mais dano (0,3 = +30%)
//  anel     = brotos nascem em volta dele e explodem: { n, atraso (s), fator (força de cada) }
//  chuva    = Chuva de Frutas: ele gira e n frutas caem em volta (até "raio" m) e ficam no chão
//             como armadilhas: { n, max (quantas ao mesmo tempo), gatilho, raio (da explosão),
//             vida (s), fator (força de cada), giro (s girando), chao (fogo no chão) }
// Limite de frutas no campo (celular de referência): Ardentroco 6 + 6 = 12; Florinferno 7 + 8 = 15.
export const GOLPES_BROTOBRASA = {
  // ---- Disparo: Semente de Brasa (flor de fogo) | Bombinhas de Fruta (Ardentroco em diante) ----
  sementeBrasa: {
    nome: 'Semente de Brasa', elemento: 'fogo', tipo: 'projetil', poder: 16, recarga: 1.8, alcance: 7,
    semente: { max: 2, gatilho: 1.5, raio: 1.8, vida: 6 },
  },
  sementeBrasa3: {
    nome: 'Semente de Brasa', elemento: 'fogo', tipo: 'projetil', poder: 16, recarga: 1.8, alcance: 7,
    semente: { max: 3, gatilho: 1.5, raio: 1.8, vida: 6 },
  },
  // ele arranca uma fruta da cabeça e joga: ela fica no chão como armadilha bem mais tempo (15 s)
  bombinhasFruta: {
    nome: 'Bombinhas de Fruta', elemento: 'fogo', tipo: 'projetil', poder: 18, recarga: 1.8, alcance: 7,
    semente: { max: 6, gatilho: 1.5, raio: 1.9, vida: 15, fruta: true, chao: { duracao: 2, raio: 1.6, fator: 0.15 } },
  },
  bombinhasFrutaMax: {
    nome: 'Bombinhas de Fruta', elemento: 'fogo', tipo: 'projetil', poder: 22, recarga: 1.9, alcance: 7.5,
    semente: { max: 7, gatilho: 1.6, raio: 2.5, vida: 15, fruta: true, chao: { duracao: 2, raio: 2, fator: 0.15 } },
  },
  // ---- Perto: Folhas Ardentes (Chamafolha) ----
  folhasArdentes: {
    nome: 'Folhas Ardentes', elemento: 'planta', tipo: 'corpo', poder: 15, recarga: 1.1, alcance: 2.5, queimando: 0.3,
    leque: { abertura: 0.9, golpes: 1, intervalo: 0 },
  },
  // ---- No lugar do golpe de perto (Ardentroco em diante): Fruta Ardente, um bônus (buff) ----
  // ele come a fruta da cabeça: por "duracao" segundos causa mais dano e anda mais rápido (não ataca)
  frutaArdente: {
    nome: 'Fruta Ardente', elemento: 'planta', tipo: 'corpo', poder: 0, recarga: 15, alcance: 0,
    buff: { duracao: 10, dano: 0.25, vel: 0.1 },
  },
  frutaArdenteMax: {
    nome: 'Fruta Ardente', elemento: 'planta', tipo: 'corpo', poder: 0, recarga: 15, alcance: 0,
    buff: { duracao: 10, dano: 0.3, vel: 0.15 },
  },
  // ---- Área: Anel de Brotos | Chuva de Frutas (Ardentroco em diante) ----
  anelBrotos: {
    nome: 'Anel de Brotos', elemento: 'fogo', tipo: 'area', poder: 16, recarga: 6, raio: 3,
    anel: { n: 5, atraso: 1, fator: 0.7 },
  },
  // ele gira balançando a cabeça e as frutas caem em volta: ficam no chão como armadilhas
  chuvaFrutas: {
    nome: 'Chuva de Frutas', elemento: 'fogo', tipo: 'area', poder: 18, recarga: 8, raio: 4,
    chuva: { n: 6, max: 6, gatilho: 1.4, raio: 1.8, vida: 12, fator: 0.7, giro: 0.5, fruta: true },
  },
  chuvaFrutasMax: {
    nome: 'Chuva de Frutas', elemento: 'fogo', tipo: 'area', poder: 20, recarga: 8, raio: 4.5,
    chuva: { n: 8, max: 8, gatilho: 1.5, raio: 2, vida: 12, fator: 0.7, giro: 0.5, fruta: true, chao: { duracao: 2, raio: 1.6, fator: 0.15 } },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_BROTOBRASA = [
  ['investida', 'sementeBrasa', 'anelBrotos'],              // Brotobrasa
  ['folhasArdentes', 'sementeBrasa3', 'anelBrotos'],        // Chamafolha: + Queimadura, 3 flores
  ['frutaArdente', 'bombinhasFruta', 'chuvaFrutas'],        // Ardentroco: buff no lugar do perto, frutas-bomba
  ['frutaArdenteMax', 'bombinhasFrutaMax', 'chuvaFrutasMax'], // Florinferno: buff +5%, frutas maiores, 8 na chuva
];

// Melhorias desta linha (no lugar das melhorias padrão de tipo duplo):
// não tem disparo ×2/×3; a Queimadura chega nas flores e nos brotos na Chamafolha.
export const MELHORIAS_BROTOBRASA = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_BROTOBRASA = [
  ['Semente de Brasa: joga uma semente até 7 m que vira uma flor de fogo; ela explode quando um inimigo chega a 1,5 m (ou sozinha depois de 6 s). Até 2 flores no campo.', 'Anel de Brotos: 5 brotos nascem em volta dele e explodem 1 s depois.'],
  ['Folhas Ardentes: corte em leque de 2,5 m; quem está queimando leva +30%.', 'Flores e brotos podem causar Queimadura; até 3 flores.'],
  ['Fruta Ardente (no lugar do golpe de perto): come a fruta da cabeça e ganha +25% de dano e +10% de velocidade por 10 s (recarga 15 s).', 'Bombinhas de Fruta: joga uma fruta da cabeça que fica no chão como bomba por 15 s (fogo no chão ao explodir); até 6.', 'Chuva de Frutas: gira e 6 frutas caem em volta (4 m), ficando no chão como bombas por 12 s.'],
  ['Fruta Ardente mais forte: +30% de dano e +15% de velocidade por 10 s.', 'Bombinhas de Fruta maiores: explosão de 2,5 m; até 7.', 'Chuva de Frutas com 8 frutas (4,5 m) e fogo no chão.', 'Queimadura dura 50% mais.'],
];
export const NOVIDADES_BROTOBRASA = [
  null,
  ['Folhas Ardentes (+30% em quem queima)', 'flores e brotos agora queimam', 'até 3 flores'],
  ['Fruta Ardente (+25% de dano, +10% de velocidade)', 'Bombinhas de Fruta', 'Chuva de Frutas'],
  ['Fruta Ardente +30% / +15%', 'Bombinhas de Fruta maiores', 'Chuva de 8 frutas'],
];
