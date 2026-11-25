// =============================================================
// HABILIDADES DA AQUARAIA (raro de Água)
// Aquaraia (Nv.1) > Ventaraia (Nv.55) > Mantaré (Nv.70) > Leviaraia (Nv.90, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, alcance, tempo no ar,
// rastro, bolhas ou redemoinho, mexa aqui. Como cada golpe funciona e aparece
// na batalha fica em aquaraia-batalha.js.
//
// A ideia: ataca pelo ar e foge. O Rasante atravessa os inimigos, as Bolhas
// encharcam e o Mergulho cai do alto (bate mais forte em quem está Encharcado).
// =============================================================

// Golpes. Campos:
//  poder, recarga = força e segundos até poder usar de novo
//  alcance  = (perto) até onde a IA acha que o golpe chega
//  rasante  = voo reto que atravessa: { distancia (m), vel (m/s), largura (m de cada lado que acerta),
//             rastro: { largura (m), duracao (s), chance (de encharcar a cada meio segundo) } ou null,
//             ferrao: força da 2ª batida no fim do voo, para trás (0,6 = 60%) ou 0 }
//  bolha    = tiro de bolha: { guiada (quanto a bolha vira por segundo, em radianos; 0 = reto), alcance (m) }
//             (quantidade = quantas bolhas em leque)
//  mergulho = sobe e cai: { alcance (m), sobe (s no ar, sem levar dano), cai (s da queda),
//             empurra (m), encharcado (dano a mais em quem está Encharcado: 0,25 = +25%),
//             redemoinho: { raio (m), duracao (s), puxa (m/s), poder (de cada pedaço, a cada meio segundo) } ou null }
export const GOLPES_AQUARAIA = {
  // ---- Perto ----
  rasanteAquaraia: {
    nome: 'Rasante', elemento: 'agua', tipo: 'corpo', poder: 12, recarga: 1.2, alcance: 5,
    rasante: { distancia: 5, vel: 16, largura: 0.6, rastro: null, ferrao: 0 },
  },
  rasanteVento: {
    nome: 'Rasante de Vento', elemento: 'agua', tipo: 'corpo', poder: 14, recarga: 1.2, alcance: 6,
    rasante: { distancia: 6, vel: 17, largura: 0.7, rastro: { largura: 1.2, duracao: 2.5, chance: 0.25 }, ferrao: 0 },
  },
  rasanteFerrao: {
    nome: 'Rasante com Ferrão', elemento: 'agua', tipo: 'corpo', poder: 15, recarga: 1.3, alcance: 6.5,
    rasante: { distancia: 6.5, vel: 18, largura: 0.75, rastro: { largura: 1.3, duracao: 3, chance: 0.25 }, ferrao: 0.6 },
  },
  rasanteLeviata: {
    nome: 'Rasante do Leviatã', elemento: 'agua', tipo: 'corpo', poder: 16, recarga: 1.3, alcance: 8,
    rasante: { distancia: 8, vel: 20, largura: 0.85, rastro: { largura: 1.8, duracao: 4, chance: 0.3 }, ferrao: 0.8 },
  },
  // ---- Disparo ----
  bolhasAquaraia: {
    nome: 'Bolhas', elemento: 'agua', tipo: 'projetil', poder: 6, recarga: 1.6, velocidade: 12, raio: 0.45, quantidade: 3,
    bolha: { guiada: 0, alcance: 8 },
  },
  bolhasGuiadas: {
    nome: 'Bolhas Guiadas', elemento: 'agua', tipo: 'projetil', poder: 7, recarga: 1.6, velocidade: 11, raio: 0.45, quantidade: 3,
    bolha: { guiada: 2.2, alcance: 10 },
  },
  chuvaBolhas: {
    nome: 'Chuva de Bolhas', elemento: 'agua', tipo: 'projetil', poder: 7, recarga: 1.8, velocidade: 11, raio: 0.55, quantidade: 5,
    bolha: { guiada: 2.4, alcance: 11 },
  },
  // ---- Área ----
  // raio = tamanho da área onde ela cai
  mergulhoAquaraia: {
    nome: 'Mergulho', elemento: 'agua', tipo: 'area', poder: 20, recarga: 6, raio: 3,
    mergulho: { alcance: 6, sobe: 0.7, cai: 0.25, empurra: 2, encharcado: 0, redemoinho: null },
  },
  mergulhoMares: {
    nome: 'Mergulho das Marés', elemento: 'agua', tipo: 'area', poder: 24, recarga: 6.5, raio: 3.5,
    mergulho: { alcance: 6.5, sobe: 0.7, cai: 0.25, empurra: 1, encharcado: 0.25,
      redemoinho: { raio: 3, duracao: 3, puxa: 1.6, poder: 3 } },
  },
  quedaLeviata: {
    nome: 'Queda do Leviatã', elemento: 'agua', tipo: 'area', poder: 36, recarga: 7.5, raio: 4.5,
    mergulho: { alcance: 7, sobe: 1, cai: 0.3, empurra: 1, encharcado: 0.25,
      redemoinho: { raio: 4, duracao: 4, puxa: 2, poder: 4 } },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_AQUARAIA = [
  ['rasanteAquaraia', 'bolhasAquaraia', 'mergulhoAquaraia'], // Aquaraia
  ['rasanteVento', 'bolhasAquaraia', 'mergulhoAquaraia'],    // Ventaraia: rastro d'água e encharcado
  ['rasanteFerrao', 'bolhasGuiadas', 'mergulhoMares'],        // Mantaré: ferrão, bolhas que fazem curva, redemoinho
  ['rasanteLeviata', 'chuvaBolhas', 'quedaLeviata'],          // Leviaraia
];

// Melhorias (no lugar das padrão de dados.js): não tem disparo ×2/×3;
// o Encharcado chega no disparo e na área na 1ª evolução e dura 50% mais na Leviaraia.
export const MELHORIAS_AQUARAIA = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_AQUARAIA = [
  ['Rasante: voa 5 m reto e atravessa os inimigos (acerta cada um uma vez).', 'Mergulho: sobe 0,7 s sem levar dano e cai onde o alvo estava (3 m).'],
  ['Rasante de Vento: 6 m e deixa um Rastro d\'Água por 2,5 s que encharca quem pisa.', 'Bolhas e Mergulho podem causar Encharcado.', 'Mergulho empurra 2 m.'],
  ['Rasante com Ferrão: no fim do voo o ferrão bate para trás (60% da força).', 'Bolhas Guiadas: fazem curva até o inimigo mais perto.', 'Mergulho das Marés: deixa um Redemoinho de 3 m por 3 s que puxa para o centro.', 'O mergulho dá +25% em quem está Encharcado.'],
  ['Rasante do Leviatã: 8 m, rastro largo por 4 s e ferrão com 80%.', 'Chuva de Bolhas: 5 bolhas guiadas.', 'Queda do Leviatã: sobe 1 s e cai com área de 4,5 m; redemoinho de 4 m por 4 s.', 'Encharcado dura 50% mais.'],
];
export const NOVIDADES_AQUARAIA = [
  null,
  ['Rasante deixa Rastro d\'Água', 'Bolhas e Mergulho agora encharcam'],
  ['Ferrão no fim do Rasante', 'Bolhas Guiadas', 'Mergulho das Marés (redemoinho)'],
  ['Rasante do Leviatã', 'Chuva de Bolhas', 'Queda do Leviatã', 'Encharcado dura mais'],
];
