// =============================================================
// HABILIDADES DA LINHA DO BROTOBRASA (tipo duplo Fogo + Planta): o JARDINEIRO DE FOGO
// Brotobrasa (Nv.1) > Chamafolha (Nv.12) > Ardentroco (Nv.30) > Florinferno (Nv.50, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, recarga, alcance,
// quantas flores cabem no campo ou o tamanho das explosões, mexa aqui. Como
// cada golpe funciona e aparece na batalha fica em brotobrasa-batalha.js.
//
// Ele planta FLORES DE FOGO (armadilhas): elas explodem quando um inimigo chega perto.
// Os limites de flores deixam o jogo leve no celular de referência (Helio G95).
// =============================================================

// Golpes da linha. Campos:
//  poder    = força do golpe (na semente e no anel, a de cada explosão)
//  recarga  = segundos até poder usar de novo
//  alcance  = até onde a semente vai (m) | no golpe de perto, até onde ele acerta (m)
//  semente  = joga uma semente que vira uma flor de fogo no chão:
//             { max (quantas flores ao mesmo tempo), gatilho (m: explode se um inimigo
//             chegar a essa distância), raio (tamanho da explosão, m), vida (s: explode
//             sozinha depois disso), chao ({ duracao, raio, fator }: deixa fogo no chão) }
//  leque    = golpe de perto em leque: { abertura (meio ângulo, radianos), golpes (1 ou 2),
//             intervalo (s entre os golpes), planta (o último golpe planta uma flor) }
//  queimando = golpe de perto em quem está com Queimadura dá mais dano (0,3 = +30%)
//  anel     = brotos nascem em volta dele e explodem: { n, atraso (s), fator (força de cada) }
//  florescer = por um tempo, nascem flores por onde ele anda: { duracao (s), passo (m entre
//             as flores), max, gatilho, raio, vida, fator }
export const GOLPES_BROTOBRASA = {
  // ---- Disparo: Semente de Brasa (flor de fogo) ----
  sementeBrasa: {
    nome: 'Semente de Brasa', elemento: 'fogo', tipo: 'projetil', poder: 16, recarga: 1.8, alcance: 7,
    semente: { max: 2, gatilho: 1.5, raio: 1.8, vida: 6 },
  },
  sementeBrasa3: {
    nome: 'Semente de Brasa', elemento: 'fogo', tipo: 'projetil', poder: 16, recarga: 1.8, alcance: 7,
    semente: { max: 3, gatilho: 1.5, raio: 1.8, vida: 6 },
  },
  sementeChama: {
    nome: 'Semente de Chama', elemento: 'fogo', tipo: 'projetil', poder: 18, recarga: 1.8, alcance: 7,
    semente: { max: 4, gatilho: 1.5, raio: 1.9, vida: 6, chao: { duracao: 2, raio: 1.6, fator: 0.15 } },
  },
  florGigante: {
    nome: 'Flor Gigante', elemento: 'fogo', tipo: 'projetil', poder: 22, recarga: 1.9, alcance: 7.5,
    semente: { max: 4, gatilho: 1.6, raio: 2.5, vida: 6, chao: { duracao: 2, raio: 2, fator: 0.15 } },
  },
  // ---- Perto: folhas e galhos em brasa ----
  folhasArdentes: {
    nome: 'Folhas Ardentes', elemento: 'planta', tipo: 'corpo', poder: 15, recarga: 1.1, alcance: 2.5, queimando: 0.3,
    leque: { abertura: 0.9, golpes: 1, intervalo: 0, planta: false },
  },
  galhadaBrasa: {
    nome: 'Galhada em Brasa', elemento: 'fogo', tipo: 'corpo', poder: 11, recarga: 1.4, alcance: 3, queimando: 0.3,
    leque: { abertura: 0.8, golpes: 2, intervalo: 0.25, planta: true },
  },
  galhadaInfernal: {
    nome: 'Galhada Infernal', elemento: 'fogo', tipo: 'corpo', poder: 14, recarga: 1.4, alcance: 3.2, queimando: 0.3,
    leque: { abertura: 0.85, golpes: 2, intervalo: 0.25, planta: true },
  },
  // ---- Área: brotos em volta / flores por onde passa ----
  anelBrotos: {
    nome: 'Anel de Brotos', elemento: 'fogo', tipo: 'area', poder: 16, recarga: 6, raio: 3,
    anel: { n: 5, atraso: 1, fator: 0.7 },
  },
  anelBrotos7: {
    nome: 'Anel de Brotos', elemento: 'fogo', tipo: 'area', poder: 18, recarga: 6.5, raio: 3.8,
    anel: { n: 7, atraso: 1, fator: 0.7 },
  },
  florescerInfernal: {
    nome: 'Florescer Infernal', elemento: 'fogo', tipo: 'area', poder: 20, recarga: 10, raio: 3,
    florescer: { duracao: 6, passo: 1, max: 8, gatilho: 1.2, raio: 1.5, vida: 6, fator: 0.6 },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_BROTOBRASA = [
  ['investida', 'sementeBrasa', 'anelBrotos'],              // Brotobrasa
  ['folhasArdentes', 'sementeBrasa3', 'anelBrotos'],        // Chamafolha: + Queimadura, 3 flores
  ['galhadaBrasa', 'sementeChama', 'anelBrotos7'],          // Ardentroco: galhada planta flor, fogo no chão, 7 brotos
  ['galhadaInfernal', 'florGigante', 'florescerInfernal'],  // Florinferno: flor gigante, flores por onde anda
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
  ['Galhada em Brasa: 2 golpes de galho (3 m); as faíscas do 2º plantam uma flor.', 'Semente de Chama: a explosão deixa fogo no chão por 2 s; até 4 flores.', 'Anel de 7 brotos (3,8 m).'],
  ['Galhada Infernal: mais forte, também planta flor.', 'Flor Gigante: explosão de 2,5 m.', 'Florescer Infernal: por 6 s nascem flores de fogo por onde ele anda (até 8), que explodem quando o inimigo encosta.', 'Queimadura dura 50% mais.'],
];
export const NOVIDADES_BROTOBRASA = [
  null,
  ['Folhas Ardentes (+30% em quem queima)', 'flores e brotos agora queimam', 'até 3 flores'],
  ['Galhada em Brasa (planta flor)', 'fogo no chão', 'Anel de 7 brotos'],
  ['Galhada Infernal', 'Flor Gigante', 'Florescer Infernal'],
];
