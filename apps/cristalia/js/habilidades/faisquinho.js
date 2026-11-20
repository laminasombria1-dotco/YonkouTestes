// =============================================================
// HABILIDADES DA LINHA DO FAISQUINHO (Raio)
// Faisquinho (Nv.1) > Choquilho (Nv.6) > Trovolt (Nv.12) > Tempestor (Nv.30)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, recarga, alcance,
// marcas, choque ou nuvens, mexa aqui. Como cada golpe funciona e aparece na
// batalha fica em faisquinho-batalha.js.
//
// A linha joga com MARCAS: o Dash Elétrico e o tiro marcam os inimigos (até 3
// marcas em cada um); o Choque estoura as marcas e as nuvens acertam direto
// quem estiver marcado.
//
// Só esta linha usa estes golpes. O Imanito e as evoluções (Terra + Raio)
// continuam com os golpes de Raio de sempre (em dados.js).
// =============================================================

// Marcas: quanto duram, quantas cabem e quanto aumentam o dano do Choque e das nuvens
export const MARCAS = {
  duracao: 6,          // segundos (cada marca nova renova o tempo)
  maximo: 3,           // o mesmo alvo pode ter até 3 marcas
  bonus: [1, 1.25, 1.5], // 1 marca = dano normal, 2 = +25%, 3 = +50%
};

// Golpes da linha. Campos:
//  poder     = força do golpe (no tiro, a do tiro; nas nuvens, a de cada raio)
//  recarga   = segundos até poder usar de novo
//  dashRaio  = Dash Elétrico (não causa dano): { distancia (m), duracao (s),
//              aura (m em volta dele que marca quem passar perto) }
//  marca     = o tiro marca quem acertar; depois o botão vira "Choque": { janela (s que
//              o Choque fica disponível), choque: { poder, alvos (quantos marcados ele
//              liga, pulando de um para o outro), duracao (s da ligação) } }
//  alcance   = até onde vai o tiro (m)
//  nuvens    = nuvens em volta dele: { quantidade, duracao (s), intervalo (s entre os
//              raios de cada nuvem), area (m do raio que cai no chão), espalha (m em
//              volta dele onde caem os raios quando ninguém está marcado),
//              paralisia (s da paralisia de cada raio) }
//  raio      = (nas nuvens) até onde a IA acha que vale usar o golpe
export const GOLPES_FAISQUINHO = {
  // ---- Perto: Dash Elétrico ----
  dashEletrico: {
    nome: 'Dash Elétrico', elemento: 'raio', tipo: 'corpo', poder: 0, recarga: 4, alcance: 5,
    dashRaio: { distancia: 5, duracao: 0.25, aura: 1.2 },
  },
  dashEletricoForte: {
    nome: 'Dash Elétrico', elemento: 'raio', tipo: 'corpo', poder: 0, recarga: 4, alcance: 6,
    dashRaio: { distancia: 6, duracao: 0.27, aura: 1.5 },
  },
  dashTempestade: {
    nome: 'Dash Elétrico', elemento: 'raio', tipo: 'corpo', poder: 0, recarga: 4, alcance: 7,
    dashRaio: { distancia: 7, duracao: 0.3, aura: 1.8 },
  },
  // ---- Disparo: tiro que marca; ativando de novo, o Choque ----
  faiscaMarcadora: {
    nome: 'Faísca Marcadora', elemento: 'raio', tipo: 'projetil', poder: 10, recarga: 1.6,
    velocidade: 22, raio: 0.4, alcance: 9,
    marca: { janela: 4, choque: { poder: 14, alvos: 1, duracao: 0.8 } },
  },
  relampagoMarcador: {
    nome: 'Relâmpago Marcador', elemento: 'raio', tipo: 'projetil', poder: 12, recarga: 1.6,
    velocidade: 22, raio: 0.45, alcance: 10,
    marca: { janela: 4, choque: { poder: 18, alvos: 2, duracao: 0.8 } },
  },
  relampagoTempestor: {
    nome: 'Relâmpago Marcador', elemento: 'raio', tipo: 'projetil', poder: 13, recarga: 1.6,
    velocidade: 24, raio: 0.5, alcance: 11,
    marca: { janela: 4, choque: { poder: 22, alvos: 3, duracao: 0.8 } },
  },
  // ---- Área: nuvens que soltam raios ----
  nuvemEletrica: {
    nome: 'Nuvem Elétrica', elemento: 'raio', tipo: 'area', poder: 5, recarga: 8, raio: 8,
    nuvens: { quantidade: 1, duracao: 4, intervalo: 1.5, area: 1.2, espalha: 3, paralisia: 0.7 },
  },
  nuvensTempestade: {
    nome: 'Nuvens de Tempestade', elemento: 'raio', tipo: 'area', poder: 6, recarga: 9, raio: 8,
    nuvens: { quantidade: 2, duracao: 5, intervalo: 1.5, area: 1.2, espalha: 3.5, paralisia: 0.7 },
  },
  tempestadeTempestor: {
    nome: 'Tempestade', elemento: 'raio', tipo: 'area', poder: 7, recarga: 10, raio: 8,
    nuvens: { quantidade: 3, duracao: 6, intervalo: 1.5, area: 1.3, espalha: 4, paralisia: 0.7 },
  },
};

// Golpes de cada forma: [perto, disparo, área]
// O Faisquinho começa com a Investida (Normal); a partir do Choquilho, o perto é o Dash Elétrico.
export const GOLPES_POR_FORMA_FAISQUINHO = [
  ['investida', 'faiscaMarcadora', 'nuvemEletrica'],             // Faisquinho
  ['dashEletrico', 'faiscaMarcadora', 'nuvemEletrica'],          // Choquilho: dash que marca, + paralisia
  ['dashEletricoForte', 'relampagoMarcador', 'nuvensTempestade'], // Trovolt: choque em 2, 2 nuvens
  ['dashTempestade', 'relampagoTempestor', 'tempestadeTempestor'], // Tempestor: choque em 3, 3 nuvens
];

// Melhorias desta linha (no lugar das melhorias padrão de dados.js):
// não tem disparo ×2/×3; a paralisia chega no tiro e nas nuvens no Choquilho;
// o dash só paralisa no Tempestor.
export const MELHORIAS_FAISQUINHO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: true,  efeitoDisparo: true,  forcaEfeito: 1.5 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_FAISQUINHO = [
  ['Faísca Marcadora: o raio que acerta deixa 1 marca (até 3, por 6 s). Toque de novo em até 4 s para o Choque: liga você ao marcado e estoura as marcas (+25% com 2, +50% com 3).', 'Nuvem Elétrica: 1 nuvem por 4 s; os marcados levam o raio direto, sem errar.'],
  ['Dash Elétrico: avança 5 m e marca quem passar perto (1,2 m). Não causa dano.', 'Tiro, Choque e nuvens podem causar Paralisia.'],
  ['Dash Elétrico: 6 m.', 'Relâmpago Marcador: o Choque liga até 2 marcados.', 'Nuvens de Tempestade: 2 nuvens por 5 s.'],
  ['Dash Elétrico: 7 m e pode paralisar.', 'O Choque liga até 3 marcados, pulando de um para o outro.', 'Tempestade: 3 nuvens por 6 s.', 'Paralisia dura 50% mais.'],
];
export const NOVIDADES_FAISQUINHO = [
  null,
  ['Dash Elétrico (marca)', 'tiro e nuvens agora paralisam'],
  ['Choque em 2 marcados', '2 nuvens', 'dash mais longo'],
  ['Choque em 3 marcados', 'Tempestade (3 nuvens)', 'dash paralisa'],
];
