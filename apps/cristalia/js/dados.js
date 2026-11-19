// =============================================================
// DADOS DO JOGO
// Aqui ficam as "tabelas" do jogo: elementos, golpes e espécies.
// Para balancear o jogo, quase sempre basta mexer nos números deste arquivo.
// =============================================================

// Elementos e o ciclo de vantagem: Fogo > Planta > Água > Fogo
export const ELEMENTOS = {
  fogo:   { nome: 'Fogo',   cor: '#ff7a3d', forteContra: 'planta' },
  agua:   { nome: 'Água',   cor: '#3db8ff', forteContra: 'fogo' },
  planta: { nome: 'Planta', cor: '#5fd35a', forteContra: 'agua' },
  normal: { nome: 'Normal', cor: '#d9d2c3', forteContra: null },
};

// Multiplicador de dano: 1.5 se o golpe é forte contra o alvo, 0.6 se é fraco.
export function multiplicador(elementoGolpe, elementoAlvo) {
  if (ELEMENTOS[elementoGolpe]?.forteContra === elementoAlvo) return 1.5;
  if (ELEMENTOS[elementoAlvo]?.forteContra === elementoGolpe) return 0.6;
  return 1;
}

// Tipos de golpe:
//  corpo    -> o monstro avança e acerta de perto (alcance em metros)
//  projetil -> dispara algo que voa em linha reta (quantidade > 1 = leque)
//  area     -> explode em volta do monstro (raio em metros)
// recarga = segundos até poder usar de novo
export const GOLPES = {
  investida: { nome: 'Investida',     elemento: 'normal', tipo: 'corpo',    poder: 10, recarga: 0.8, alcance: 2.3 },
  cascada:   { nome: 'Cascada',       elemento: 'normal', tipo: 'corpo',    poder: 13, recarga: 1.1, alcance: 2.5 },
  rasante:   { nome: 'Rasante',       elemento: 'agua',   tipo: 'corpo',    poder: 12, recarga: 1.0, alcance: 2.9 },
  chicote:   { nome: 'Chicote Vinha', elemento: 'planta', tipo: 'corpo',    poder: 12, recarga: 1.1, alcance: 3.4 },
  brasa:     { nome: 'Brasa',         elemento: 'fogo',   tipo: 'projetil', poder: 13, recarga: 1.3, velocidade: 15, raio: 0.45 },
  jato:      { nome: 'Jato d\'Água',  elemento: 'agua',   tipo: 'projetil', poder: 13, recarga: 1.3, velocidade: 15, raio: 0.45 },
  folhas:    { nome: 'Folha Navalha', elemento: 'planta', tipo: 'projetil', poder: 6,  recarga: 1.6, velocidade: 14, raio: 0.4, quantidade: 3 },
  bolhas:    { nome: 'Bolhas',        elemento: 'agua',   tipo: 'projetil', poder: 6,  recarga: 1.6, velocidade: 12, raio: 0.45, quantidade: 3 },
  labareda:  { nome: 'Labareda',      elemento: 'fogo',   tipo: 'area',     poder: 22, recarga: 5,   raio: 3.5 },
  erupcao:   { nome: 'Erupção',       elemento: 'fogo',   tipo: 'area',     poder: 26, recarga: 6,   raio: 4.2 },
  onda:      { nome: 'Onda',          elemento: 'agua',   tipo: 'area',     poder: 20, recarga: 5,   raio: 3.8 },
  raizes:    { nome: 'Raízes',        elemento: 'planta', tipo: 'area',     poder: 18, recarga: 5,   raio: 3.6, lentidao: 2.5 },
};

// Espécies. base = atributos no nível 1.
//  hp = vida | atk = ataque | def = defesa | vel = velocidade de movimento
//  captura = facilidade de capturar (0 a 1) | tamanho = escala do modelo 3D
export const ESPECIES = {
  brasito: {
    nome: 'Brasito', elemento: 'fogo', tamanho: 1, captura: 0.55,
    descricao: 'Raposinha de brasa. Rápida e esquentada.',
    base: { hp: 44, atk: 13, def: 9, vel: 6.6 },
    golpes: ['investida', 'brasa', 'labareda'],
  },
  vulcarapa: {
    nome: 'Vulcarapa', elemento: 'fogo', tamanho: 1.25, captura: 0.35,
    descricao: 'Tartaruga com um vulcão no casco. Lenta e muito resistente.',
    base: { hp: 62, atk: 12, def: 15, vel: 4.3 },
    golpes: ['cascada', 'brasa', 'erupcao'],
  },
  gotinho: {
    nome: 'Gotinho', elemento: 'agua', tamanho: 1, captura: 0.55,
    descricao: 'Gota de geleia saltitante. Equilibrado em tudo.',
    base: { hp: 50, atk: 11, def: 11, vel: 5.6 },
    golpes: ['investida', 'jato', 'onda'],
  },
  aquaraia: {
    nome: 'Aquaraia', elemento: 'agua', tamanho: 1.1, captura: 0.35,
    descricao: 'Arraia que plana sobre o lago. Ataca em voos rasantes.',
    base: { hp: 46, atk: 14, def: 9, vel: 7.2 },
    golpes: ['rasante', 'bolhas', 'onda'],
  },
  musguinho: {
    nome: 'Musguinho', elemento: 'planta', tamanho: 1, captura: 0.55,
    descricao: 'Bloquinho de musgo com uma flor. Defesa alta.',
    base: { hp: 54, atk: 11, def: 13, vel: 5.0 },
    golpes: ['investida', 'folhas', 'raizes'],
  },
  espinhal: {
    nome: 'Espinhal', elemento: 'planta', tamanho: 1.1, captura: 0.35,
    descricao: 'Ouriço-cacto. Chicoteia de longe e machuca muito.',
    base: { hp: 50, atk: 15, def: 11, vel: 5.6 },
    golpes: ['chicote', 'folhas', 'raizes'],
  },
};

export const INICIAIS = ['brasito', 'gotinho', 'musguinho'];

// Quais espécies aparecem em cada região do mapa (peso = chance relativa)
export const APARICOES = {
  fogo:   [['brasito', 7], ['vulcarapa', 3]],
  agua:   [['gotinho', 7], ['aquaraia', 3]],
  planta: [['musguinho', 7], ['espinhal', 3]],
  campo:  [['brasito', 1], ['gotinho', 1], ['musguinho', 1]],
};

// Atributos crescem 12% por nível
export function statsDe(especie, nivel) {
  const b = ESPECIES[especie].base;
  const f = 1 + (nivel - 1) * 0.12;
  return {
    hpMax: Math.round(b.hp * f),
    atk: b.atk * f,
    def: b.def * f,
    vel: b.vel * (1 + (nivel - 1) * 0.015),
  };
}

export function xpParaProximo(nivel) {
  return 12 + nivel * 8;
}

let contadorUid = 0;
export function criarMonstro(especie, nivel) {
  contadorUid++;
  return {
    uid: Date.now().toString(36) + '-' + contadorUid + '-' + Math.floor(Math.random() * 1e6).toString(36),
    especie,
    nivel,
    xp: 0,
    hp: statsDe(especie, nivel).hpMax,
  };
}

// Chance de captura: maior quando o monstro está com pouca vida
export function chanceCaptura(monstro) {
  const esp = ESPECIES[monstro.especie];
  const fracVida = monstro.hp / statsDe(monstro.especie, monstro.nivel).hpMax;
  const c = esp.captura * (1.7 - 1.5 * fracVida);
  return Math.min(0.95, Math.max(0.05, c));
}
