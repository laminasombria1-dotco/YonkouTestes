// =============================================================
// HABILIDADES DO ESPINHAL (raro de Planta)
// Espinhal (Nv.1) > Cactouriço (Nv.55) > Espinhaço (Nv.70) > Mandacarão (Nv.90, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, quantas agulhas saem,
// quiques (ricochete) ou o Espinhado, mexa aqui. Como cada golpe funciona e aparece
// na batalha fica em espinhal-batalha.js.
//
// A ideia: espinhos que CRAVAM (Espinhado: cada espinho deixa mais lento), RICOCHETE
// (a bola e as agulhas quicam nas pedras e na borda) e agulhas para todos os lados.
// Não repete a linha do Musguinho (vinha, folha bumerangue, raízes, moita e bosque).
// =============================================================

// Golpes. Campos:
//  poder, recarga = força (de cada agulha) e segundos até poder usar de novo
//  alcance  = (perto) até onde a IA acha que o golpe chega (m)
//  rolar    = vira bola e rola: { distancia (m), vel (m/s), quiques (vezes que quica nas pedras e na
//             borda; 0 = para nelas), agulhasNoQuique (agulhas que solta a cada quique) }
//  agulhas  = leque de agulhas: { quantidade, abertura (radianos do leque), vel (m/s), alcance (m), quiques }
//  nova     = agulhas para todos os lados: { ondas, porOnda, intervalo (s entre as ondas), vel, alcance (m), quiques }
export const GOLPES_ESPINHAL = {
  // ---- Perto ----
  rolamento: {
    nome: 'Rolamento', elemento: 'planta', tipo: 'corpo', poder: 13, recarga: 1.4, alcance: 5,
    rolar: { distancia: 5, vel: 14, quiques: 0, agulhasNoQuique: 0 },
  },
  rolamentoCacto: {
    nome: 'Rolamento', elemento: 'planta', tipo: 'corpo', poder: 15, recarga: 1.4, alcance: 6,
    rolar: { distancia: 6, vel: 15, quiques: 0, agulhasNoQuique: 0 },
  },
  rolamentoRicochete: {
    nome: 'Rolamento Ricochete', elemento: 'planta', tipo: 'corpo', poder: 17, recarga: 1.5, alcance: 6,
    rolar: { distancia: 6, vel: 16, quiques: 1, agulhasNoQuique: 0 },
  },
  rolamentoTempestade: {
    nome: 'Rolamento Tempestade', elemento: 'planta', tipo: 'corpo', poder: 19, recarga: 1.6, alcance: 8,
    rolar: { distancia: 8, vel: 17, quiques: 3, agulhasNoQuique: 4 },
  },
  // ---- Disparo ----
  agulhasEspinhal: {
    nome: 'Agulhas', elemento: 'planta', tipo: 'projetil', poder: 6, recarga: 1.4,
    agulhas: { quantidade: 3, abertura: 0.5, vel: 20, alcance: 9, quiques: 0 },
  },
  agulhasRicochete: {
    nome: 'Agulhas Ricochete', elemento: 'planta', tipo: 'projetil', poder: 6, recarga: 1.5,
    agulhas: { quantidade: 5, abertura: 0.7, vel: 20, alcance: 10, quiques: 1 },
  },
  agulhasMandacaru: {
    nome: 'Agulhas Ricochete', elemento: 'planta', tipo: 'projetil', poder: 6, recarga: 1.5,
    agulhas: { quantidade: 7, abertura: 0.9, vel: 21, alcance: 11, quiques: 2 },
  },
  // ---- Área ----
  // raio = até onde a IA acha que as agulhas chegam (para escolher o golpe)
  explosaoEspinhos: {
    nome: 'Explosão de Espinhos', elemento: 'planta', tipo: 'area', poder: 8, recarga: 5, raio: 6,
    nova: { ondas: 1, porOnda: 8, intervalo: 0, vel: 16, alcance: 7, quiques: 0 },
  },
  explosaoCacto: {
    nome: 'Explosão de Espinhos', elemento: 'planta', tipo: 'area', poder: 8, recarga: 5, raio: 6,
    nova: { ondas: 1, porOnda: 10, intervalo: 0, vel: 16, alcance: 7, quiques: 0 },
  },
  explosaoDupla: {
    nome: 'Explosão Dupla', elemento: 'planta', tipo: 'area', poder: 8, recarga: 5.5, raio: 6.5,
    nova: { ondas: 2, porOnda: 10, intervalo: 0.25, vel: 17, alcance: 8, quiques: 0 },
  },
  floracaoMandacaru: {
    nome: 'Floração do Mandacaru', elemento: 'planta', tipo: 'area', poder: 8, recarga: 6, raio: 7,
    nova: { ondas: 3, porOnda: 12, intervalo: 0.25, vel: 17, alcance: 9, quiques: 0 },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_ESPINHAL = [
  ['rolamento', 'agulhasEspinhal', 'explosaoEspinhos'],                     // Espinhal
  ['rolamentoCacto', 'agulhasEspinhal', 'explosaoCacto'],                    // Cactouriço: enraizado, 10 agulhas
  ['rolamentoRicochete', 'agulhasRicochete', 'explosaoDupla'],               // Espinhaço: ricochete
  ['rolamentoTempestade', 'agulhasMandacaru', 'floracaoMandacaru'],          // Mandacarão
];

// Espinhado: cada agulha que acerta crava um espinho no inimigo.
//  lento = quanto cada espinho deixa mais lento (0,06 = 6%) | max = quantos cabem | duracao = segundos
//  (renova a cada espinho novo) | trava = (por forma) com o máximo de espinhos fica Enraizado (segundos)
//  Chefes e o Campeão do Reino ficam lentos só pela metade.
export const ESPINHADO = { lento: 0.06, max: 5, duracao: 4, trava: [0, 0, 0, 1] };

// No máximo estas agulhas no ar ao mesmo tempo (todas são desenhadas de uma vez só)
export const MAX_AGULHAS = 64;

// Melhorias (no lugar das padrão de dados.js): não tem disparo ×2/×3;
// o Enraizado chega nas agulhas e na explosão na 1ª evolução e dura 50% mais no Mandacarão.
export const MELHORIAS_ESPINHAL = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_ESPINHAL = [
  ['Rolamento: vira uma bola de espinhos e rola 5 m, acertando quem atravessar.', 'Agulhas: cada uma que acerta crava um espinho (Espinhado: 6% mais lento por espinho, até 5).', 'Explosão de Espinhos: 8 agulhas para todos os lados.'],
  ['Rolamento de 6 m.', 'Agulhas e Explosão podem causar Enraizado.', 'Explosão de 10 agulhas.'],
  ['Rolamento Ricochete: quica 1 vez nas pedras e na borda.', 'Agulhas Ricochete: 5 agulhas que quicam 1 vez.', 'Explosão Dupla: 2 ondas de 10 agulhas.'],
  ['Rolamento Tempestade: 8 m, quica até 3 vezes e solta 4 agulhas a cada batida.', '7 agulhas que quicam 2 vezes.', 'Floração do Mandacaru: 3 ondas de 12 agulhas.', 'Com 5 espinhos o inimigo fica Enraizado 1 s. Enraizado dura 50% mais.'],
];
export const NOVIDADES_ESPINHAL = [
  null,
  ['Agulhas e Explosão agora enraízam', 'Rolamento de 6 m', 'Explosão de 10 agulhas'],
  ['Rolamento Ricochete', 'Agulhas Ricochete', 'Explosão Dupla'],
  ['Rolamento Tempestade', '7 agulhas que quicam 2 vezes', 'Floração do Mandacaru', '5 espinhos enraízam'],
];
