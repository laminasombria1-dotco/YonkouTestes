// =============================================================
// HABILIDADES DA LINHA DO PEDRISCO (Terra)
// Pedrisco (Nv.1) > Cascalhão (Nv.12) > Rochedrão (Nv.30) > Montanhar (Nv.50, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, alcance, tamanho,
// recarga, quiques, tempo no ar ou pilares, mexa aqui. Como cada golpe funciona
// e aparece na batalha fica em pedrisco-batalha.js.
//
// Só esta linha usa estes golpes. O Imanito e as evoluções (Terra + Raio)
// continuam com os golpes de Terra de sempre (em dados.js).
// =============================================================

// Golpes da linha. Campos:
//  poder    = força do golpe (no Pedregulho, a força da 1ª queda)
//  recarga  = segundos até poder usar de novo
//  arco     = pedra jogada para o alto, que passa POR CIMA dos obstáculos e cai onde o alvo
//             estava: { alcance (m, o mais longe que cai), minimo (m, o mais perto),
//             voo (s no ar), altura (m que ela sobe), area (m da queda), tamanho (da pedra),
//             quiques (força de cada quique depois da 1ª queda: [0.7] = 1 quique com 70%),
//             distQuique (m que ela anda a cada quique), neve (pedra com neve) }
//  espinhos = Punho Sísmico: fileira de espinhos que sai do chão à frente: { largura (m),
//             levanta (s que o alvo fica no ar, sem andar nem atacar), duracao (s até a
//             fileira chegar ao fim), tamanho (dos espinhos), cristal / neve (visual) }
//  alcance  = até onde vai a fileira de espinhos (m)
//  raio     = tamanho da área (m)
//  pilares  = pilares de pedra que sobem em roda, na borda da área, e seguram tiros retos e
//             a passagem como as pedras da arena: { quantidade, duracao (s), raio (grossura
//             de cada pilar, m), altura (m), neve (visual) }
export const GOLPES_PEDRISCO = {
  // ---- Disparo: pedra em arco ----
  pedregulho: {
    nome: 'Pedregulho', elemento: 'terra', tipo: 'projetil', poder: 15, recarga: 1.6, raio: 0.5,
    arco: { alcance: 10, minimo: 3, voo: 0.65, altura: 3.5, area: 1.4, tamanho: 0.5, quiques: [], distQuique: 0 },
  },
  pedregulhoQuicante: {
    nome: 'Pedregulho Quicante', elemento: 'terra', tipo: 'projetil', poder: 16, recarga: 1.8, raio: 0.55,
    arco: { alcance: 10, minimo: 3, voo: 0.65, altura: 3.5, area: 1.6, tamanho: 0.6, quiques: [0.7], distQuique: 4 },
  },
  rochaNevada: {
    nome: 'Rocha Nevada', elemento: 'terra', tipo: 'projetil', poder: 20, recarga: 2.0, raio: 0.8,
    arco: { alcance: 12, minimo: 3, voo: 0.75, altura: 4.5, area: 2, tamanho: 0.95, quiques: [0.7, 0.5], distQuique: 4, neve: true },
  },
  // ---- Perto: Punho Sísmico (fileira de espinhos que joga para o alto) ----
  punhoSismico: {
    nome: 'Punho Sísmico', elemento: 'terra', tipo: 'corpo', poder: 14, recarga: 1.3, alcance: 4,
    espinhos: { largura: 1.2, levanta: 0.5, duracao: 0.25, tamanho: 1 },
  },
  punhoSismicoForte: {
    nome: 'Punho Sísmico', elemento: 'terra', tipo: 'corpo', poder: 18, recarga: 1.4, alcance: 5,
    espinhos: { largura: 1.2, levanta: 0.5, duracao: 0.25, tamanho: 1.2, cristal: true },
  },
  punhoMontanha: {
    nome: 'Punho da Montanha', elemento: 'terra', tipo: 'corpo', poder: 22, recarga: 1.5, alcance: 7,
    espinhos: { largura: 1.5, levanta: 0.6, duracao: 0.3, tamanho: 1.5, neve: true },
  },
  // ---- Área ----
  tremorPedrisco: {
    nome: 'Tremor', elemento: 'terra', tipo: 'area', poder: 20, recarga: 5, raio: 4, tremor: true,
  },
  muralhaPedra: {
    nome: 'Muralha de Pedra', elemento: 'terra', tipo: 'area', poder: 22, recarga: 7, raio: 4, tremor: true,
    pilares: { quantidade: 8, duracao: 4, raio: 0.5, altura: 2.2 },
  },
  cordilheira: {
    nome: 'Cordilheira', elemento: 'terra', tipo: 'area', poder: 30, recarga: 8, raio: 5, tremor: true,
    pilares: { quantidade: 10, duracao: 5, raio: 0.55, altura: 2.8, neve: true },
  },
};

// Golpes de cada forma: [perto, disparo, área]
// O Pedrisco começa com a Investida (Normal, rolando); a partir do Cascalhão, o perto é o Punho Sísmico.
export const GOLPES_POR_FORMA_PEDRISCO = [
  ['investida', 'pedregulho', 'tremorPedrisco'],              // Pedrisco
  ['punhoSismico', 'pedregulho', 'tremorPedrisco'],           // Cascalhão: espinhos, + soterrado
  ['punhoSismicoForte', 'pedregulhoQuicante', 'muralhaPedra'], // Rochedrão: quica, pilares
  ['punhoMontanha', 'rochaNevada', 'cordilheira'],            // Montanhar: tudo maior, soterra no perto
];

// Melhorias desta linha (no lugar das melhorias padrão de dados.js):
// não tem disparo ×2/×3; o soterrado chega no disparo e na área já no Cascalhão;
// o Punho só soterra no Montanhar.
export const MELHORIAS_PEDRISCO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: true,  efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_PEDRISCO = [
  ['Pedregulho: pedra em arco que passa por cima dos obstáculos e cai onde o alvo estava (área de 1,4 m).', 'Tremor: o chão racha em volta (4 m).'],
  ['Punho Sísmico: espinhos saem do chão 4 m à frente e jogam o inimigo para o alto (0,5 s sem agir).', 'Pedregulho e Tremor podem causar Soterrado.'],
  ['Punho Sísmico: 5 m.', 'Pedregulho Quicante: cai, quica e cai de novo 4 m à frente.', 'Muralha de Pedra: 8 pilares sobem em roda (4 m) e ficam 4 s; seguram tiros retos e a passagem.'],
  ['Punho da Montanha: 7 m, 0,6 s no ar e pode soterrar.', 'Rocha Nevada: pedra gigante que quica 2 vezes (área de 2 m).', 'Cordilheira: 10 pilares nevados (5 m) por 5 s.', 'Soterrado dura 50% mais.'],
];
export const NOVIDADES_PEDRISCO = [
  null,
  ['Punho Sísmico (joga para o alto)', 'pedregulho e tremor agora soterram'],
  ['Pedregulho Quicante', 'Muralha de Pedra (pilares)', 'punho mais longo'],
  ['Punho da Montanha', 'Rocha Nevada (quica 2 vezes)', 'Cordilheira'],
];
