// =============================================================
// HABILIDADES DA LINHA DO MUSGUINHO (Planta)
// Musguinho (Nv.1) > Moitão (Nv.12) > Troncudo (Nv.30) > Florestral (Nv.50, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, alcance, tamanho,
// recarga, puxão ou cura, mexa aqui. Como cada golpe funciona e aparece na
// batalha fica em musguinho-batalha.js.
//
// Só esta linha usa estes golpes. Espinhal, Silvárion e os tipos duplos com
// Planta (Brotobrasa e evoluções) continuam com os golpes de sempre (em dados.js).
// =============================================================

// Golpes da linha. Campos:
//  poder      = força do golpe (na folha, a força de CADA passagem: ida ou volta)
//  recarga    = segundos até poder usar de novo
//  quantidade = quantas folhas saem juntas (em V ou em leque)
//  bumerangue = folha que vai e volta: { alcance (m até virar), cura (parte da vida
//               que cada folha que acertou devolve ao voltar; 0 = não cura) }
//  vinha      = chicote que puxa: { puxa (m que o alvo é puxado), largura (m) }
//  alcance    = até onde a vinha estica (m)
//  raio       = tamanho da área (m)
//  lentidao   = segundos deixando o alvo lento (as Raízes)
//  zona       = o que fica no chão depois da área: { duracao (s), poderTick (força
//               a cada pedaço), intervalo (s entre os pedaços), cura (parte da vida
//               por segundo para quem plantou, se estiver dentro), visual }
export const GOLPES_MUSGUINHO = {
  // ---- Disparo: folhas que vão e voltam ----
  folhaBumerangue: {
    nome: 'Folha Bumerangue', elemento: 'planta', tipo: 'projetil', poder: 9, recarga: 1.5,
    velocidade: 14, raio: 0.45, quantidade: 1, bumerangue: { alcance: 8, cura: 0 },
  },
  folhaBumerangueDupla: {
    nome: 'Folha Bumerangue', elemento: 'planta', tipo: 'projetil', poder: 8, recarga: 1.7,
    velocidade: 14, raio: 0.45, quantidade: 2, bumerangue: { alcance: 8, cura: 0 },
  },
  folhaBumerangueTripla: {
    nome: 'Folha Bumerangue', elemento: 'planta', tipo: 'projetil', poder: 8, recarga: 1.9,
    velocidade: 14, raio: 0.5, quantidade: 3, bumerangue: { alcance: 9, cura: 0 },
  },
  folhaBumerangueViva: {
    nome: 'Folha Bumerangue', elemento: 'planta', tipo: 'projetil', poder: 9, recarga: 1.9,
    velocidade: 15, raio: 0.55, quantidade: 3, bumerangue: { alcance: 10, cura: 0.015 },
  },
  // ---- Perto: vinha que estica e puxa ----
  chicoteVinha: {
    nome: 'Chicote de Vinha', elemento: 'planta', tipo: 'corpo', poder: 12, recarga: 1.1,
    alcance: 4.5, vinha: { puxa: 2.5, largura: 0.6 },
  },
  chicoteVinhaForte: {
    nome: 'Chicote de Vinha', elemento: 'planta', tipo: 'corpo', poder: 18, recarga: 1.1,
    alcance: 5, vinha: { puxa: 3, largura: 0.65 },
  },
  vinhaAgarradora: {
    nome: 'Vinha Agarradora', elemento: 'planta', tipo: 'corpo', poder: 20, recarga: 1.2,
    alcance: 6, vinha: { puxa: 3.5, largura: 0.7, grossa: true },
  },
  // ---- Área ----
  raizesMusguinho: {
    nome: 'Raízes', elemento: 'planta', tipo: 'area', poder: 18, recarga: 5, raio: 3.6, lentidao: 2.5,
    raizes: true,
  },
  moitaEspinhos: {
    nome: 'Moita de Espinhos', elemento: 'planta', tipo: 'area', poder: 14, recarga: 6, raio: 3.5,
    zona: { duracao: 4, poderTick: 3, intervalo: 0.5, cura: 0, visual: 'moita' },
  },
  bosqueVivo: {
    nome: 'Bosque Vivo', elemento: 'planta', tipo: 'area', poder: 24, recarga: 8, raio: 5,
    zona: { duracao: 5, poderTick: 4, intervalo: 0.5, cura: 0.02, visual: 'bosque' },
  },
};

// Golpes de cada forma: [perto, disparo, área]
// O Musguinho começa com a Investida (Normal); a partir do Moitão, o perto é a vinha que puxa.
export const GOLPES_POR_FORMA_MUSGUINHO = [
  ['investida', 'folhaBumerangue', 'raizesMusguinho'],                // Musguinho
  ['chicoteVinha', 'folhaBumerangueDupla', 'raizesMusguinho'],        // Moitão: puxa, 2 folhas, enraíza
  ['chicoteVinhaForte', 'folhaBumerangueTripla', 'moitaEspinhos'],    // Troncudo: 3 folhas, moita
  ['vinhaAgarradora', 'folhaBumerangueViva', 'bosqueVivo'],           // Florestral: puxa e prende, cura
];

// Melhorias desta linha (no lugar das melhorias padrão de dados.js):
// não tem disparo ×2/×3 (no lugar, mais folhas); o enraizado chega no disparo e
// na área já no Moitão; a vinha só enraíza no Florestral.
export const MELHORIAS_MUSGUINHO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: true,  efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_MUSGUINHO = [
  ['Folha Bumerangue: vai 8 m e volta, acertando na ida e na volta.', 'Raízes: brotam do chão em volta (3,6 m) e deixam lento por 2,5 s.'],
  ['Chicote de Vinha: estica até 4,5 m e puxa o inimigo 2,5 m.', '2 folhas bumerangue em V.', 'Folhas e Raízes podem causar Enraizado.'],
  ['Chicote de Vinha: 5 m, puxa 3 m.', '3 folhas bumerangue em leque.', 'Moita de Espinhos: fica 4 s no chão (3,5 m) e machuca quem está dentro.'],
  ['Vinha Agarradora: 6 m, puxa 3,5 m e pode enraizar.', 'As folhas que acertam curam 1,5% da vida ao voltar.', 'Bosque Vivo: raízes gigantes (5 m) por 5 s; machuca quem está dentro e cura o Florestral 2% por segundo.', 'Enraizado dura 50% mais.'],
];
export const NOVIDADES_MUSGUINHO = [
  null,
  ['Chicote de Vinha (puxa)', '2 folhas bumerangue', 'folhas e raízes agora enraízam'],
  ['3 folhas bumerangue', 'Moita de Espinhos', 'vinha mais forte'],
  ['Vinha Agarradora', 'folhas que curam', 'Bosque Vivo'],
];
