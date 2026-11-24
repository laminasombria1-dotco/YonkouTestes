// =============================================================
// HABILIDADES DA LINHA DO LUNICO (Lua)
// Lunico (Nv.1) > Lunarelo (Nv.6) > Crescêntio (Nv.12) > Plenilúnio (Nv.30)
//
// ESTE ARQUIVO SÓ TEM NÚMEROS E TEXTOS: para mudar força, recarga, alcance,
// cura ou velocidade, mexa aqui. Como cada golpe funciona e aparece na
// batalha fica em lunico-batalha.js.
//
// Só esta linha usa estes golpes. Os golpes de Lua de sempre (em dados.js)
// continuam para quem não é desta linha.
// =============================================================

// Golpes da linha. Campos:
//  poder    = força do golpe (no combo, a força do 1º dash; no luar, a do pulso inicial)
//  recarga  = segundos até poder usar de novo
//  alcance  = até onde o combo vai buscar o alvo (m)
//  combo    = dashes seguidos que cruzam o alvo: { fatores (força de cada dash: 1,5 = +50%),
//             passa (quantos metros passa do alvo), vel (m/s), pausa (s entre os dashes),
//             corteChao (o último dash deixa um corte em meia-lua no chão) }
//  fases    = o disparo muda a cada uso: Lua Nova > Lua Crescente > Lua Cheia > volta.
//             Cada fase: { nome, tiros, fator (parte da força de cada tiro), vel (m/s),
//             raio (tamanho do acerto), tam (tamanho do desenho), sono (multiplica a chance
//             de Sono), explosao ({ raio, fator }: a Lua Cheia explode ao acertar ou cair) }
//  alcanceTiro = até onde os tiros vão (m)
//  raio     = tamanho do luar (m)
//  luar     = círculo de luar que fica no chão: { duracao (s), cura (0,02 = 2% da vida por
//             segundo para quem soltou, se ficar dentro), lento (0,3 = inimigos dentro 30%
//             mais lentos), velocidade (bônus de velocidade dele dentro do luar), uivo (visual
//             do Plenilúnio: uiva e a lua cheia aparece no céu) }
const FASES = (explosao = null) => [
  { nome: 'Lua Nova', tiros: 1, fator: 0.9, vel: 21, raio: 0.4, tam: 0.6, sono: 1 },
  { nome: 'Lua Crescente', tiros: 3, fator: 0.5, vel: 16, raio: 0.45, tam: 0.8, sono: 1 },
  { nome: 'Lua Cheia', tiros: 1, fator: 1.5, vel: 11, raio: 0.85, tam: 1.3, sono: 2, explosao },
];

export const GOLPES_LUNICO = {
  // ---- Perto: dashes que cruzam o alvo ----
  saltoLunar: {
    nome: 'Salto Lunar', elemento: 'lua', tipo: 'corpo', poder: 9, recarga: 2.2, alcance: 4,
    combo: { fatores: [1, 1.5], passa: 1.6, vel: 17, pausa: 0.08 },
  },
  dancaCrescente: {
    nome: 'Dança Crescente', elemento: 'lua', tipo: 'corpo', poder: 9, recarga: 2.8, alcance: 4.2,
    combo: { fatores: [1, 1.5, 2], passa: 1.6, vel: 18, pausa: 0.07 },
  },
  cacadaLua: {
    nome: 'Caçada da Lua Cheia', elemento: 'lua', tipo: 'corpo', poder: 11, recarga: 3, alcance: 4.5,
    combo: { fatores: [1, 1.5, 2.5], passa: 1.8, vel: 19, pausa: 0.06, corteChao: true },
  },
  // ---- Disparo: Fases da Lua ----
  fasesLua: {
    nome: 'Fases da Lua', elemento: 'lua', tipo: 'projetil', poder: 14, recarga: 1.5,
    velocidade: 15, raio: 0.45, alcanceTiro: 12, fases: FASES(),
  },
  fasesLuaCheia: {
    nome: 'Fases da Lua', elemento: 'lua', tipo: 'projetil', poder: 16, recarga: 1.5,
    velocidade: 15, raio: 0.45, alcanceTiro: 12, fases: FASES({ raio: 2.5, fator: 1 }),
  },
  fasesPlenilunio: {
    nome: 'Fases da Lua', elemento: 'lua', tipo: 'projetil', poder: 18, recarga: 1.5,
    velocidade: 15, raio: 0.45, alcanceTiro: 13, fases: FASES({ raio: 3.5, fator: 1.2 }),
  },
  // ---- Área: círculo de luar que cura ----
  pocaLuar: {
    nome: 'Poça de Luar', elemento: 'lua', tipo: 'area', poder: 12, recarga: 7, raio: 3,
    luar: { duracao: 4, cura: 0.02, lento: 0.3, velocidade: 0 },
  },
  luarCrescente: {
    nome: 'Luar Crescente', elemento: 'lua', tipo: 'area', poder: 16, recarga: 7.5, raio: 3.8,
    luar: { duracao: 5, cura: 0.03, lento: 0.3, velocidade: 0 },
  },
  uivoLua: {
    nome: 'Uivo da Lua Cheia', elemento: 'lua', tipo: 'area', poder: 22, recarga: 9, raio: 5,
    luar: { duracao: 6, cura: 0.04, lento: 0.3, velocidade: 0.2, uivo: true },
  },
};

// Golpes de cada forma: [perto, disparo, área]
export const GOLPES_POR_FORMA_LUNICO = [
  ['investida', 'fasesLua', 'pocaLuar'],              // Lunico
  ['saltoLunar', 'fasesLua', 'pocaLuar'],             // Lunarelo: 2 dashes, + Sono
  ['dancaCrescente', 'fasesLuaCheia', 'luarCrescente'], // Crescêntio: 3 dashes, a Lua Cheia explode
  ['cacadaLua', 'fasesPlenilunio', 'uivoLua'],        // Plenilúnio: dano maior, uivo
];

// Melhorias desta linha (no lugar das melhorias padrão de dados.js):
// não tem disparo ×2/×3 (no lugar, as fases); o Sono chega no disparo e no luar no Lunarelo.
//  despertar = golpe em quem está dormindo dá mais dano (0,3 = +30%)
export const MELHORIAS_LUNICO = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, efeitoDisparo: false, forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1, despertar: 0.3 },
  { disparos: 1, efeitoArea: true,  efeitoPerto: false, efeitoDisparo: true,  forcaEfeito: 1.5, despertar: 0.3 },
];

// Frases do Monstruário (o que cada forma tem de especial) e da tela de evolução
export const TEXTOS_LUNICO = [
  ['Fases da Lua: cada uso muda a fase. Lua Nova (1 tiro rápido) > Lua Crescente (3 em leque) > Lua Cheia (bola grande).', 'Poça de Luar: círculo de 3 m por 4 s; inimigos dentro ficam 30% mais lentos e ele recupera 2% da vida por segundo se ficar dentro.'],
  ['Salto Lunar: 2 dashes que cruzam o alvo; o 2º dá +50% de dano.', 'Fases da Lua e Poça de Luar podem causar Sono (a Lua Cheia tem o dobro da chance).'],
  ['Dança Crescente: 3 dashes que cruzam o alvo (100%, 150% e 200%).', 'A Lua Cheia explode (2,5 m).', 'Luar Crescente: 3,8 m por 5 s, cura 3% por segundo.', 'Golpes em quem está dormindo dão +30% de dano.'],
  ['Caçada da Lua Cheia: 3 dashes (100%, 150% e 250%); o último deixa um corte em meia-lua no chão.', 'A Lua Cheia explode maior (3,5 m).', 'Uivo da Lua Cheia: luar de 5 m por 6 s, cura 4% por segundo e dá +20% de velocidade dentro dele.', 'Sono dura 50% mais.'],
];
export const NOVIDADES_LUNICO = [
  null,
  ['Salto Lunar (2 dashes)', 'disparo e luar agora causam Sono'],
  ['Dança Crescente (3 dashes)', 'a Lua Cheia explode', 'Luar Crescente', '+30% de dano em quem dorme'],
  ['Caçada da Lua Cheia', 'Lua Cheia maior', 'Uivo da Lua Cheia (+20% de velocidade no luar)'],
];
