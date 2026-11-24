// =============================================================
// HABILIDADES DA LINHA DO VAPORITO (tipo duplo Água + Fogo): o TANQUE
// Vaporito (Nv.1) > Fumarolo (Nv.6) > Gêiserão (Nv.12) > Caldeirax (Nv.30)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, recarga, alcance,
// quanto o casco protege ou a pressão, mexa aqui. Como cada golpe funciona e
// aparece na batalha fica em vaporito-batalha.js.
//
// Tanque = aguenta muito, luta colado e pune quem bate nele.
// (os atributos dele, com mais vida e defesa e menos velocidade, ficam em
// DUPLAS.aguaFogo, no dados.js)
// =============================================================

// Golpes da linha. Campos:
//  poder     = força do golpe (no bafo, a soma de todo o jato; no casco, a da explosão do fim)
//  recarga   = segundos até poder usar de novo (no casco, conta só DEPOIS que ele sai)
//  arrancada = dash com os jatos de vapor das costas: { distancia (m), vel (m/s),
//              blindado (+defesa depois: 0,2 = +20%), blindadoT (s), empurrao,
//              pancada ({ raio, fator }: no fim, salta e bate o casco no chão em volta),
//              geiser ({ raio, atordoa (s) }: a pancada deixa um gêiser que atordoa) }
//  alcance   = no bafo, até onde o vapor chega (m)
//  bafo      = cone de vapor saindo da boca: { abertura (meio ângulo, em radianos),
//              duracao (s), queima (também pode causar Queimadura: Caldeirax) }
//  casco     = ele se esconde no casco: { duracao (s), reducao (0,5 = recebe 50% menos dano),
//              queima (quem bater de perto se queima), pressao (o dano que ele segura vira
//              força extra da explosão: 0,5 = +50%; no máximo o dobro), geiser ({ atordoa }) }
//  raio      = tamanho da explosão do casco (m)
export const GOLPES_VAPORITO = {
  // ---- Perto: Arrancada de Vapor ----
  arrancadaVapor: {
    nome: 'Arrancada de Vapor', elemento: 'agua', tipo: 'corpo', poder: 16, recarga: 2.6, alcance: 5,
    arrancada: { distancia: 5, vel: 16, blindado: 0.2, blindadoT: 4, empurrao: 9 },
  },
  arrancadaCasco: {
    nome: 'Pancada de Casco', elemento: 'agua', tipo: 'corpo', poder: 18, recarga: 2.8, alcance: 5.5,
    arrancada: { distancia: 5.5, vel: 16, blindado: 0.2, blindadoT: 4, empurrao: 9, pancada: { raio: 2.5, fator: 0.8 } },
  },
  arrancadaGeiser: {
    nome: 'Pancada do Gêiser', elemento: 'agua', tipo: 'corpo', poder: 21, recarga: 3, alcance: 6,
    arrancada: { distancia: 6, vel: 17, blindado: 0.25, blindadoT: 4, empurrao: 9, pancada: { raio: 3, fator: 0.8 }, geiser: { raio: 1.6, atordoa: 0.8 } },
  },
  // ---- "Disparo" (de perto): Bafo de Vapor ----
  bafoVapor: {
    nome: 'Bafo de Vapor', elemento: 'agua', tipo: 'projetil', poder: 13, recarga: 1.6, alcance: 3,
    bafo: { abertura: 0.45, duracao: 0.55 },
  },
  bafoLargo: {
    nome: 'Bafo de Vapor', elemento: 'agua', tipo: 'projetil', poder: 15, recarga: 1.6, alcance: 3.5,
    bafo: { abertura: 0.6, duracao: 0.6 },
  },
  bafoFervente: {
    nome: 'Bafo Fervente', elemento: 'agua', tipo: 'projetil', poder: 18, recarga: 1.7, alcance: 4.5,
    bafo: { abertura: 0.6, duracao: 0.65, queima: true },
  },
  // ---- Área: o casco ----
  cascoVapor: {
    nome: 'Recolher no Casco', elemento: 'fogo', tipo: 'area', poder: 16, recarga: 7, raio: 3,
    casco: { duracao: 2.5, reducao: 0.5, queima: false, pressao: 0 },
  },
  cascoQuente: {
    nome: 'Casco Quente', elemento: 'fogo', tipo: 'area', poder: 18, recarga: 7, raio: 3,
    casco: { duracao: 2.5, reducao: 0.5, queima: true, pressao: 0 },
  },
  cascoGeiser: {
    nome: 'Casco do Gêiser', elemento: 'fogo', tipo: 'area', poder: 22, recarga: 8, raio: 3.5,
    casco: { duracao: 3, reducao: 0.6, queima: true, pressao: 0, geiser: { atordoa: 0.8 } },
  },
  caldeira: {
    nome: 'Caldeira', elemento: 'fogo', tipo: 'area', poder: 26, recarga: 9, raio: 4.5,
    casco: { duracao: 3.5, reducao: 0.7, queima: true, pressao: 0.5, geiser: { atordoa: 0.8 } },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_VAPORITO = [
  ['investida', 'bafoVapor', 'cascoVapor'],             // Vaporito
  ['arrancadaVapor', 'bafoVapor', 'cascoQuente'],       // Fumarolo: arrancada e blindado, bafo encharca, casco queima
  ['arrancadaCasco', 'bafoLargo', 'cascoGeiser'],       // Gêiserão: pancada do casco, gêiser no fim do casco
  ['arrancadaGeiser', 'bafoFervente', 'caldeira'],      // Caldeirax: gêiser na pancada, bafo fervente, pressão
];

// Melhorias desta linha (no lugar das melhorias padrão de tipo duplo):
// não tem disparo ×2/×3; o Encharcado chega no bafo no Fumarolo.
export const MELHORIAS_VAPORITO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_VAPORITO = [
  ['Tanque: muita vida e defesa, mas é lento.', 'Bafo de Vapor: cone de vapor de 3 m saindo da boca.', 'Recolher no Casco: por 2,5 s recebe 50% menos dano (não ataca e anda devagar); no fim, explode em vapor (3 m).'],
  ['Arrancada de Vapor: dispara 5 m pelos jatos das costas, bate e empurra; depois fica Blindado (+20% de defesa por 4 s).', 'Bafo de Vapor pode causar Encharcado.', 'Casco Quente: quem bater nele de perto se queima.'],
  ['Pancada de Casco: a arrancada termina com um salto e uma pancada do casco em volta (2,5 m).', 'Bafo mais largo (3,5 m).', 'Casco do Gêiser: 3 s, 60% menos dano; no fim, um gêiser joga os inimigos para cima (atordoados por 0,8 s).'],
  ['Pancada do Gêiser: a pancada deixa um gêiser que atordoa.', 'Bafo Fervente (4,5 m): causa Encharcado e Queimadura.', 'Caldeira: 3,5 s, 70% menos dano; o dano que ele segura vira pressão, e a explosão ganha +50% desse dano (no máximo o dobro).', 'Efeitos duram 50% mais.'],
];
export const NOVIDADES_VAPORITO = [
  null,
  ['Arrancada de Vapor (Blindado)', 'o bafo agora encharca', 'Casco Quente (queima quem bate)'],
  ['Pancada de Casco', 'bafo mais largo', 'Casco do Gêiser (atordoa)'],
  ['Pancada do Gêiser', 'Bafo Fervente', 'Caldeira (pressão)'],
];
