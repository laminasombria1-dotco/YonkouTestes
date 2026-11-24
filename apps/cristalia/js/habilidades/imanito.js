// =============================================================
// HABILIDADES DA LINHA DO IMANITO (tipo duplo Terra + Raio): o MESTRE DO MAGNETISMO
// Imanito (Nv.1) > Magnetito (Nv.12) > Ferrovolt (Nv.30) > Titanvolt (Nv.50, evolução rara)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, recarga, quantas pedras
// giram, a força do puxão ou do empurrão, mexa aqui. Como cada golpe funciona e
// aparece na batalha fica em imanito-batalha.js.
//
// Pedras giram em volta dele: são a munição do disparo e o escudo contra tiros.
// O Ímã PUXA os inimigos e a Repulsão EMPURRA. Chefes e o Campeão sentem só a metade.
// Leve para o celular de referência (Helio G95): no máximo 5 pedras por monstro.
// =============================================================

// Golpes da linha. Campos:
//  poder    = força do golpe
//  recarga  = segundos até poder usar de novo
//  pedras   = pedras que giram em volta dele: { max, nasce (s para nascer uma nova),
//             vel (m/s da pedra atirada), raio (tamanho do acerto), alcance (m), tam (tamanho),
//             corrente ({ raio, fator }: ao acertar, solta um raio em quem estiver perto do alvo) }
//             Sem pedras, o botão solta só uma faísca fraca (fatorSem).
//  ima      = puxa os inimigos num cone à frente: { abertura (meio ângulo), duracao (s do puxão),
//             esmaga ({ fator }: se puxar 2 ou mais, bate um contra o outro) }
//  alcance  = no Ímã, até onde ele puxa (m)
//  raio     = tamanho da Repulsão (m)
//  repulsao = empurra todos em volta: { forca (empurrão), parede ({ fator, atordoa }: quem bate
//             numa pedra ou na borda leva dano extra e fica atordoado) }
//  tempestade = (Titanvolt) por um tempo puxa todos para o centro e caem raios; no fim explode:
//             { duracao, puxa (m/s), raioCada (s entre os raios), fatorRaio }
export const GOLPES_IMANITO = {
  // ---- Disparo: Pedras Orbitais ----
  pedraMagnetica: {
    nome: 'Pedra Magnética', elemento: 'raio', tipo: 'projetil', poder: 15, recarga: 0.8,
    pedras: { max: 2, nasce: 3, vel: 18, raio: 0.45, alcance: 11, tam: 0.22, fatorSem: 0.35 },
  },
  pedraMagnetica3: {
    nome: 'Pedra Magnética', elemento: 'raio', tipo: 'projetil', poder: 15, recarga: 0.8,
    pedras: { max: 3, nasce: 3, vel: 18, raio: 0.45, alcance: 11, tam: 0.24, fatorSem: 0.35 },
  },
  pedraCorrente: {
    nome: 'Pedra de Corrente', elemento: 'raio', tipo: 'projetil', poder: 17, recarga: 0.8,
    pedras: { max: 4, nasce: 2.8, vel: 19, raio: 0.5, alcance: 12, tam: 0.27, fatorSem: 0.35, corrente: { raio: 2.5, fator: 0.5 } },
  },
  pedraTita: {
    nome: 'Pedra Titã', elemento: 'raio', tipo: 'projetil', poder: 20, recarga: 0.8,
    pedras: { max: 5, nasce: 2.5, vel: 22, raio: 0.6, alcance: 13, tam: 0.33, fatorSem: 0.35, corrente: { raio: 2.8, fator: 0.5 } },
  },
  // ---- Perto: Ímã (puxa e soca) ----
  ima: {
    nome: 'Ímã', elemento: 'terra', tipo: 'corpo', poder: 15, recarga: 3, alcance: 6,
    ima: { abertura: 0.6, duracao: 0.3 },
  },
  imaEletrico: {
    nome: 'Ímã Elétrico', elemento: 'raio', tipo: 'corpo', poder: 18, recarga: 3, alcance: 6,
    ima: { abertura: 0.65, duracao: 0.3 },
  },
  esmagamento: {
    nome: 'Esmagamento', elemento: 'raio', tipo: 'corpo', poder: 21, recarga: 3.2, alcance: 6.5,
    ima: { abertura: 0.7, duracao: 0.3, esmaga: { fator: 0.6 } },
  },
  // ---- Área: Repulsão / Tempestade Magnética ----
  repulsao: {
    nome: 'Repulsão', elemento: 'raio', tipo: 'area', poder: 16, recarga: 6, raio: 3,
    repulsao: { forca: 22 },
  },
  repulsaoParede: {
    nome: 'Repulsão', elemento: 'raio', tipo: 'area', poder: 19, recarga: 6, raio: 3.4,
    repulsao: { forca: 24, parede: { fator: 0.6, atordoa: 0.8 } },
  },
  tempestadeMagnetica: {
    nome: 'Tempestade Magnética', elemento: 'raio', tipo: 'area', poder: 24, recarga: 9, raio: 4.5,
    repulsao: { forca: 26, parede: { fator: 0.6, atordoa: 0.8 } },
    tempestade: { duracao: 2, puxa: 3, raioCada: 0.35, fatorRaio: 0.3 },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_IMANITO = [
  ['investida', 'pedraMagnetica', 'repulsao'],                   // Imanito
  ['ima', 'pedraMagnetica3', 'repulsao'],                        // Magnetito: puxa, 3 pedras, + Paralisia
  ['imaEletrico', 'pedraCorrente', 'repulsaoParede'],            // Ferrovolt: soco eletrifica, raio no acerto, parede
  ['esmagamento', 'pedraTita', 'tempestadeMagnetica'],           // Titanvolt: esmaga, 5 pedras, tempestade
];

// Melhorias desta linha (no lugar das melhorias padrão de tipo duplo):
// não tem disparo ×2/×3 (no lugar, as pedras); a Paralisia chega na pedra e na repulsão
// no Magnetito, e no soco no Ferrovolt.
export const MELHORIAS_IMANITO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: true,  efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: true,  efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_IMANITO = [
  ['Pedras Orbitais: até 2 pedras giram em volta dele (nasce 1 a cada 3 s). O disparo atira uma; cada pedra girando segura 1 tiro inimigo.', 'Repulsão: empurra todos em volta (3 m).'],
  ['Ímã: puxa os inimigos num cone de 6 m e dá um soco de pedra.', 'Até 3 pedras; a pedra e a repulsão podem causar Paralisia.'],
  ['Ímã Elétrico: o soco também pode paralisar.', 'Pedra de Corrente: até 4 pedras; ao acertar, solta um raio em quem estiver perto.', 'Repulsão: quem bate numa pedra ou na borda leva dano extra e fica atordoado.'],
  ['Esmagamento: puxa e bate um inimigo contra o outro (dano extra com 2 ou mais).', 'Pedra Titã: até 5 pedras, maiores e mais rápidas.', 'Tempestade Magnética: por 2 s puxa todos para o centro enquanto caem raios; depois explode empurrando.', 'Paralisia dura 50% mais.'],
];
export const NOVIDADES_IMANITO = [
  null,
  ['Ímã (puxa)', '3 pedras', 'pedra e repulsão agora paralisam'],
  ['Ímã Elétrico', 'Pedra de Corrente (4 pedras)', 'Repulsão contra a parede atordoa'],
  ['Esmagamento', 'Pedra Titã (5 pedras)', 'Tempestade Magnética'],
];
