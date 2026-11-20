// =============================================================
// DADOS DO JOGO
// Aqui ficam as "tabelas" do jogo: elementos, golpes, linhas evolutivas
// e onde cada monstro aparece. Para balancear, quase sempre basta
// mexer nos números deste arquivo.
// =============================================================

// Habilidades próprias de algumas linhas ficam na pasta js/habilidades/ (fácil de achar e mudar)
import { GOLPES_BRASITO, GOLPES_POR_FORMA_BRASITO, MELHORIAS_BRASITO, TEXTOS_BRASITO, NOVIDADES_BRASITO } from './habilidades/brasito.js';
import { GOLPES_GOTINHO, GOLPES_POR_FORMA_GOTINHO, MELHORIAS_GOTINHO, TEXTOS_GOTINHO, NOVIDADES_GOTINHO } from './habilidades/gotinho.js';

// Linhas com habilidades próprias: golpes por forma, melhorias e textos
const HABILIDADES_DA_LINHA = {
  fogo: { golpes: GOLPES_POR_FORMA_BRASITO, melhorias: MELHORIAS_BRASITO, textos: TEXTOS_BRASITO, novidades: NOVIDADES_BRASITO },
  agua: { golpes: GOLPES_POR_FORMA_GOTINHO, melhorias: MELHORIAS_GOTINHO, textos: TEXTOS_GOTINHO, novidades: NOVIDADES_GOTINHO },
};

// Ordem em que os elementos aparecem nas telas
export const ORDEM_ELEMENTOS = ['fogo', 'agua', 'planta', 'terra', 'raio', 'sol', 'lua', 'luz', 'trevas'];

// forteContra = elementos que recebem 1,5× de dano dos golpes deste elemento
export const ELEMENTOS = {
  fogo:   { nome: 'Fogo',   cor: '#ff7a3d', forteContra: ['planta', 'silvestre'] },
  agua:   { nome: 'Água',   cor: '#3db8ff', forteContra: ['fogo', 'terra', 'igneo'] },
  planta: { nome: 'Planta', cor: '#5fd35a', forteContra: ['agua', 'terra'] },
  terra:  { nome: 'Terra',  cor: '#c9a46a', forteContra: ['fogo', 'raio'] },
  raio:   { nome: 'Raio',   cor: '#f7e43a', forteContra: ['agua', 'sol'] },
  sol:    { nome: 'Sol',    cor: '#ffab2e', forteContra: ['lua', 'trevas'] },
  lua:    { nome: 'Lua',    cor: '#b9b4ff', forteContra: ['sol', 'fogo'] },
  luz:    { nome: 'Luz',    cor: '#fff6c8', forteContra: ['trevas', 'lua'] },
  trevas: { nome: 'Trevas', cor: '#b57be8', forteContra: ['luz', 'planta'] },
  // Ígneo: um fogo mais forte, que queima até o próprio fogo. Só o chefe da cratera tem.
  igneo:  { nome: 'Ígneo',  cor: '#ff3d6a', forteContra: ['planta', 'fogo', 'terra', 'silvestre'] },
  // Silvestre: uma planta mais forte, que vence até a própria planta. Só o chefe do Santuário tem.
  silvestre: { nome: 'Silvestre', cor: '#1fe0a0', forteContra: ['agua', 'terra', 'planta'] },
  normal: { nome: 'Normal', cor: '#d9d2c3', forteContra: [] },
};
// Todos os elementos que existem (Ígneo e Silvestre ficam fora das abas porque não têm linha evolutiva)
export const TODOS_ELEMENTOS = [...ORDEM_ELEMENTOS, 'igneo', 'silvestre'];

// Multiplicador de dano: 1.5 se o golpe é forte contra o alvo, 0.6 se é fraco.
export function multiplicador(elementoGolpe, elementoAlvo) {
  if (ELEMENTOS[elementoGolpe]?.forteContra.includes(elementoAlvo)) return 1.5;
  if (ELEMENTOS[elementoAlvo]?.forteContra.includes(elementoGolpe)) return 0.6;
  return 1;
}

export function fracoContra(elemento) {
  return TODOS_ELEMENTOS.filter((e) => ELEMENTOS[e].forteContra.includes(elemento));
}

// Tipo duplo: o golpe é comparado com os DOIS elementos do alvo e os efeitos se somam.
// Ex.: Água contra Fogo+Planta = 1,5 (fogo) × 0,6 (planta) = 0,9.
// Um monstro nunca é fraco contra o próprio elemento (Fogo+Planta não sofre super efetivo de Fogo).
export function multiplicadorContra(elementoGolpe, elementosAlvo) {
  const m = elementosAlvo.reduce((t, el) => t * multiplicador(elementoGolpe, el), 1);
  return elementosAlvo.includes(elementoGolpe) ? Math.min(1, m) : m;
}

// Fraquezas e forças de uma espécie (funciona para tipo simples e duplo)
export function fracoContraEspecie(esp) {
  return TODOS_ELEMENTOS.filter((x) => multiplicadorContra(x, esp.elementos) > 1);
}
export function forteContraEspecie(esp) {
  const lista = new Set();
  for (const el of esp.elementos) for (const x of ELEMENTOS[el].forteContra) lista.add(x);
  return TODOS_ELEMENTOS.filter((x) => lista.has(x));
}
export function temElemento(esp, el) { return esp.elementos.includes(el); }

// Nome e fundo da etiqueta do tipo ("Fogo + Planta" com as duas cores)
export function nomeTipo(esp) { return esp.elementos.map((e) => ELEMENTOS[e].nome).join(' + '); }
export function fundoTipo(esp) {
  const [a, b] = esp.elementos.map((e) => ELEMENTOS[e].cor);
  return b ? `linear-gradient(90deg, ${a} 50%, ${b} 50%)` : a;
}

// Tipos de golpe:
//  corpo    -> o monstro avança e acerta de perto (alcance em metros)
//  projetil -> dispara algo que voa em linha reta (quantidade > 1 = leque)
//  area     -> explode em volta do monstro (raio em metros)
// recarga = segundos até poder usar de novo | lentidao = segundos deixando o alvo lento
export const GOLPES = {
  investida:        { nome: 'Investida',        elemento: 'normal', tipo: 'corpo',    poder: 10, recarga: 0.8, alcance: 2.3 },
  cascada:          { nome: 'Cascada',          elemento: 'normal', tipo: 'corpo',    poder: 13, recarga: 1.1, alcance: 2.5 },
  // Fogo
  garraBrasa:       { nome: 'Garra de Brasa',   elemento: 'fogo',   tipo: 'corpo',    poder: 12, recarga: 1.0, alcance: 2.4 },
  brasa:            { nome: 'Brasa',            elemento: 'fogo',   tipo: 'projetil', poder: 13, recarga: 1.3, velocidade: 15, raio: 0.45 },
  labareda:         { nome: 'Labareda',         elemento: 'fogo',   tipo: 'area',     poder: 22, recarga: 5,   raio: 3.5 },
  garraIgnea:       { nome: 'Garra Ígnea',      elemento: 'fogo',   tipo: 'corpo',    poder: 18, recarga: 1.2, alcance: 2.7 },
  chuvaBrasas:      { nome: 'Chuva de Brasas',  elemento: 'fogo',   tipo: 'projetil', poder: 10, recarga: 1.8, velocidade: 15, raio: 0.45, quantidade: 3 },
  erupcao:          { nome: 'Erupção',          elemento: 'fogo',   tipo: 'area',     poder: 26, recarga: 6,   raio: 4.2 },
  inferno:          { nome: 'Inferno',          elemento: 'fogo',   tipo: 'area',     poder: 32, recarga: 7,   raio: 5 },
  // Água
  rasante:          { nome: 'Rasante',          elemento: 'agua',   tipo: 'corpo',    poder: 12, recarga: 1.0, alcance: 2.9 },
  jato:             { nome: 'Jato d\'Água',     elemento: 'agua',   tipo: 'projetil', poder: 13, recarga: 1.3, velocidade: 15, raio: 0.45 },
  bolhas:           { nome: 'Bolhas',           elemento: 'agua',   tipo: 'projetil', poder: 6,  recarga: 1.6, velocidade: 12, raio: 0.45, quantidade: 3 },
  onda:             { nome: 'Onda',             elemento: 'agua',   tipo: 'area',     poder: 20, recarga: 5,   raio: 3.8 },
  hidroimpacto:     { nome: 'Hidroimpacto',     elemento: 'agua',   tipo: 'corpo',    poder: 18, recarga: 1.2, alcance: 2.9 },
  hidrocanhao:      { nome: 'Hidrocanhão',      elemento: 'agua',   tipo: 'projetil', poder: 20, recarga: 1.8, velocidade: 18, raio: 0.6 },
  maremoto:         { nome: 'Maremoto',         elemento: 'agua',   tipo: 'area',     poder: 30, recarga: 7,   raio: 5 },
  // Planta
  chicote:          { nome: 'Chicote Vinha',    elemento: 'planta', tipo: 'corpo',    poder: 12, recarga: 1.1, alcance: 3.4 },
  folhas:           { nome: 'Folha Navalha',    elemento: 'planta', tipo: 'projetil', poder: 6,  recarga: 1.6, velocidade: 14, raio: 0.4, quantidade: 3 },
  raizes:           { nome: 'Raízes',           elemento: 'planta', tipo: 'area',     poder: 18, recarga: 5,   raio: 3.6, lentidao: 2.5 },
  troncada:         { nome: 'Troncada',         elemento: 'planta', tipo: 'corpo',    poder: 18, recarga: 1.2, alcance: 3.0 },
  tempestadeFolhas: { nome: 'Vendaval de Folhas', elemento: 'planta', tipo: 'projetil', poder: 8, recarga: 2.0, velocidade: 14, raio: 0.4, quantidade: 5 },
  espinheiro:       { nome: 'Espinheiro',       elemento: 'planta', tipo: 'area',     poder: 28, recarga: 7,   raio: 5, lentidao: 2.5 },
  // Terra
  cabecada:         { nome: 'Cabeçada',         elemento: 'terra',  tipo: 'corpo',    poder: 13, recarga: 1.1, alcance: 2.4 },
  pedrada:          { nome: 'Pedrada',          elemento: 'terra',  tipo: 'projetil', poder: 14, recarga: 1.4, velocidade: 13, raio: 0.5 },
  tremor:           { nome: 'Tremor',           elemento: 'terra',  tipo: 'area',     poder: 20, recarga: 5,   raio: 4 },
  punhoRocha:       { nome: 'Punho de Rocha',   elemento: 'terra',  tipo: 'corpo',    poder: 19, recarga: 1.3, alcance: 2.7 },
  avalanche:        { nome: 'Avalanche',        elemento: 'terra',  tipo: 'projetil', poder: 10, recarga: 1.9, velocidade: 13, raio: 0.55, quantidade: 3 },
  terremoto:        { nome: 'Terremoto',        elemento: 'terra',  tipo: 'area',     poder: 31, recarga: 7,   raio: 5.2 },
  // Raio
  choque:           { nome: 'Choque',           elemento: 'raio',   tipo: 'corpo',    poder: 12, recarga: 0.8, alcance: 2.3 },
  faisca:           { nome: 'Faísca',           elemento: 'raio',   tipo: 'projetil', poder: 12, recarga: 1.1, velocidade: 22, raio: 0.4 },
  trovao:           { nome: 'Trovão',           elemento: 'raio',   tipo: 'area',     poder: 19, recarga: 5,   raio: 3.6 },
  descarga:         { nome: 'Descarga',         elemento: 'raio',   tipo: 'corpo',    poder: 18, recarga: 1.0, alcance: 2.6 },
  relampago:        { nome: 'Relâmpago',        elemento: 'raio',   tipo: 'projetil', poder: 18, recarga: 1.5, velocidade: 26, raio: 0.45 },
  tempestade:       { nome: 'Tempestade',       elemento: 'raio',   tipo: 'area',     poder: 30, recarga: 7,   raio: 5 },
  // Sol
  investidaSolar:   { nome: 'Investida Solar',  elemento: 'sol',    tipo: 'corpo',    poder: 12, recarga: 1.0, alcance: 2.5 },
  raioSolar:        { nome: 'Raio de Sol',      elemento: 'sol',    tipo: 'projetil', poder: 14, recarga: 1.4, velocidade: 18, raio: 0.45 },
  clarao:           { nome: 'Clarão',           elemento: 'sol',    tipo: 'area',     poder: 18, recarga: 5,   raio: 3.6, lentidao: 1.5 },
  chamaSolar:       { nome: 'Chama Solar',      elemento: 'sol',    tipo: 'corpo',    poder: 18, recarga: 1.2, alcance: 2.7 },
  feixeSolar:       { nome: 'Feixe Solar',      elemento: 'sol',    tipo: 'projetil', poder: 20, recarga: 1.8, velocidade: 20, raio: 0.6 },
  supernova:        { nome: 'Supernova',        elemento: 'sol',    tipo: 'area',     poder: 32, recarga: 7,   raio: 5 },
  // Lua
  garraLunar:       { nome: 'Garra Lunar',      elemento: 'lua',    tipo: 'corpo',    poder: 12, recarga: 1.0, alcance: 2.5 },
  crescente:        { nome: 'Crescente',        elemento: 'lua',    tipo: 'projetil', poder: 7,  recarga: 1.6, velocidade: 15, raio: 0.45, quantidade: 3 },
  luar:             { nome: 'Luar',             elemento: 'lua',    tipo: 'area',     poder: 18, recarga: 5,   raio: 3.6 },
  corteLunar:       { nome: 'Corte Lunar',      elemento: 'lua',    tipo: 'corpo',    poder: 18, recarga: 1.1, alcance: 3.1 },
  chuvaLunar:       { nome: 'Chuva de Luas',    elemento: 'lua',    tipo: 'projetil', poder: 7,  recarga: 2.0, velocidade: 15, raio: 0.45, quantidade: 5 },
  eclipse:          { nome: 'Eclipse',          elemento: 'lua',    tipo: 'area',     poder: 30, recarga: 7,   raio: 4.8, lentidao: 2 },
  // Luz
  toqueRadiante:    { nome: 'Toque Radiante',   elemento: 'luz',    tipo: 'corpo',    poder: 11, recarga: 0.9, alcance: 2.4 },
  feixe:            { nome: 'Feixe de Luz',     elemento: 'luz',    tipo: 'projetil', poder: 14, recarga: 1.3, velocidade: 20, raio: 0.4 },
  aurora:           { nome: 'Aurora',           elemento: 'luz',    tipo: 'area',     poder: 18, recarga: 5,   raio: 3.8 },
  lancaLuz:         { nome: 'Lança de Luz',     elemento: 'luz',    tipo: 'corpo',    poder: 17, recarga: 1.1, alcance: 3.2 },
  prisma:           { nome: 'Prisma',           elemento: 'luz',    tipo: 'projetil', poder: 11, recarga: 1.8, velocidade: 18, raio: 0.45, quantidade: 3 },
  julgamento:       { nome: 'Julgamento',       elemento: 'luz',    tipo: 'area',     poder: 30, recarga: 7,   raio: 5 },
  // Trevas
  mordidaSombria:   { nome: 'Mordida Sombria',  elemento: 'trevas', tipo: 'corpo',    poder: 13, recarga: 1.0, alcance: 2.3 },
  bolaSombria:      { nome: 'Bola Sombria',     elemento: 'trevas', tipo: 'projetil', poder: 14, recarga: 1.4, velocidade: 13, raio: 0.55 },
  vazio:            { nome: 'Vazio',            elemento: 'trevas', tipo: 'area',     poder: 18, recarga: 5,   raio: 3.6, lentidao: 2.5 },
  garraAbissal:     { nome: 'Garra Abissal',    elemento: 'trevas', tipo: 'corpo',    poder: 19, recarga: 1.2, alcance: 2.7 },
  sombras:          { nome: 'Sombras',          elemento: 'trevas', tipo: 'projetil', poder: 10, recarga: 1.8, velocidade: 14, raio: 0.5, quantidade: 3 },
  // Ígneo (só o chefe)
  mordidaMagma:     { nome: 'Mordida de Magma', elemento: 'igneo',  tipo: 'corpo',    poder: 24, recarga: 1.2, alcance: 3.4 },
  cometaIgneo:      { nome: 'Cometa Ígneo',     elemento: 'igneo',  tipo: 'projetil', poder: 14, recarga: 1.9, velocidade: 17, raio: 0.6, quantidade: 3 },
  cataclismo:       { nome: 'Cataclismo',       elemento: 'igneo',  tipo: 'area',     poder: 36, recarga: 6.5, raio: 6 },
  // Silvestre (só o chefe do Santuário)
  galhadaAncestral: { nome: 'Galhada Ancestral', elemento: 'silvestre', tipo: 'corpo',  poder: 24, recarga: 1.2, alcance: 3.6 },
  sementeParasita:  { nome: 'Semente Parasita', elemento: 'silvestre', tipo: 'projetil', poder: 13, recarga: 1.9, velocidade: 15, raio: 0.55, quantidade: 3 },
  selvaViva:        { nome: 'Selva Viva',       elemento: 'silvestre', tipo: 'area',    poder: 34, recarga: 6.5, raio: 6, lentidao: 2 },
  abismo:           { nome: 'Abismo',           elemento: 'trevas', tipo: 'area',     poder: 31, recarga: 7,   raio: 4.8, lentidao: 2 },
  // golpes próprios da linha do Brasito (números em js/habilidades/brasito.js)
  ...GOLPES_BRASITO,
  // golpes próprios da linha do Gotinho (números em js/habilidades/gotinho.js)
  ...GOLPES_GOTINHO,
};

// Golpes de cada elemento: os 3 primeiros servem às formas iniciais,
// os 3 "fortes" chegam com as evoluções.
const KITS = {
  fogo:   { corpo: 'garraBrasa',     proj: 'brasa',       area: 'labareda', corpoF: 'garraIgnea',   projF: 'chuvaBrasas',      areaF: 'inferno' },
  agua:   { corpo: 'rasante',        proj: 'jato',        area: 'onda',     corpoF: 'hidroimpacto', projF: 'hidrocanhao',      areaF: 'maremoto' },
  planta: { corpo: 'chicote',        proj: 'folhas',      area: 'raizes',   corpoF: 'troncada',     projF: 'tempestadeFolhas', areaF: 'espinheiro' },
  terra:  { corpo: 'cabecada',       proj: 'pedrada',     area: 'tremor',   corpoF: 'punhoRocha',   projF: 'avalanche',        areaF: 'terremoto' },
  raio:   { corpo: 'choque',         proj: 'faisca',      area: 'trovao',   corpoF: 'descarga',     projF: 'relampago',        areaF: 'tempestade' },
  sol:    { corpo: 'investidaSolar', proj: 'raioSolar',   area: 'clarao',   corpoF: 'chamaSolar',   projF: 'feixeSolar',       areaF: 'supernova' },
  lua:    { corpo: 'garraLunar',     proj: 'crescente',   area: 'luar',     corpoF: 'corteLunar',   projF: 'chuvaLunar',       areaF: 'eclipse' },
  luz:    { corpo: 'toqueRadiante',  proj: 'feixe',       area: 'aurora',   corpoF: 'lancaLuz',     projF: 'prisma',           areaF: 'julgamento' },
  trevas: { corpo: 'mordidaSombria', proj: 'bolaSombria', area: 'vazio',    corpoF: 'garraAbissal', projF: 'sombras',          areaF: 'abismo' },
};

// Sempre 3 golpes: [perto, disparo, área]
function golpesDoEstagio(el, estagio) {
  const k = KITS[el];
  return [
    ['investida', k.proj, k.area],
    [k.corpo, k.proj, k.area],
    [k.corpoF, k.projF, k.area],
    [k.corpoF, k.projF, k.areaF],
  ][estagio];
}

// =============================================================
// EFEITOS NEGATIVOS (um por elemento)
// duracao = segundos | as regras de cada efeito ficam em batalha.js
// chance  = chance de o efeito pegar num golpe de ÁREA (0,3 = 30%).
//           Os golpes de perto e de disparo têm uma parte disso (veja CHANCE_POR_TIPO).
//           Os efeitos que travam o monstro (Medo, Paralisia, Sono) têm chance menor.
// =============================================================
export const EFEITOS = {
  queimadura: { nome: 'Queimadura', cor: '#ff7a3d', duracao: 4, chance: 0.45,   descricao: 'perde vida a cada segundo' },
  encharcado: { nome: 'Encharcado', cor: '#3db8ff', duracao: 4, chance: 0.45,   descricao: 'fica 45% mais lento' },
  enraizado:  { nome: 'Enraizado',  cor: '#5fd35a', duracao: 1.8, chance: 0.35, descricao: 'não consegue andar, mas ainda ataca' },
  soterrado:  { nome: 'Soterrado',  cor: '#c9a46a', duracao: 5, chance: 0.45,   descricao: 'a defesa cai 30%' },
  paralisia:  { nome: 'Paralisia',  cor: '#f7e43a', duracao: 1.4, chance: 0.3, descricao: 'não anda nem ataca' },
  ofuscado:   { nome: 'Ofuscado',   cor: '#ffab2e', duracao: 4, chance: 0.4,   descricao: '40% de chance de errar os golpes' },
  sono:       { nome: 'Sono',       cor: '#b9b4ff', duracao: 3, chance: 0.3,   descricao: 'dorme até levar um golpe' },
  exposto:    { nome: 'Exposto',    cor: '#fff6c8', duracao: 5, chance: 0.4,   descricao: 'recebe 30% a mais de dano' },
  medo:       { nome: 'Medo',       cor: '#b57be8', duracao: 2.2, chance: 0.3, descricao: 'não consegue atacar' },
  combustao:  { nome: 'Combustão',  cor: '#ff3d6a', duracao: 3, chance: 0.5,   descricao: 'perde vida a cada segundo e não pode ser curado' },
  parasita:   { nome: 'Parasita',   cor: '#1fe0a0', duracao: 3.5, chance: 0.5, descricao: 'uma semente suga a vida (quem causou se cura) e deixa 30% mais lento' },
};
// Quanto da chance cada tipo de golpe usa. O disparo tem a menor porque
// cada tiro tenta de novo (uma rajada ×3 tem 3 chances).
// Ex.: Medo (30%) -> área 30%, perto 21%, cada disparo 15%.
export const CHANCE_POR_TIPO = { area: 1, corpo: 0.7, projetil: 0.5 };
export function chanceDoEfeito(nome, tipo) {
  return EFEITOS[nome].chance * (CHANCE_POR_TIPO[tipo] ?? 1);
}
export function pct(x) { return Math.round(x * 100) + '%'; }

export const EFEITO_DO_ELEMENTO = {
  fogo: 'queimadura', agua: 'encharcado', planta: 'enraizado', terra: 'soterrado', raio: 'paralisia',
  sol: 'ofuscado', lua: 'sono', luz: 'exposto', trevas: 'medo', igneo: 'combustao', silvestre: 'parasita',
};

// =============================================================
// MELHORIAS POR EVOLUÇÃO
// Cada evolução acrescenta algo às habilidades:
//  disparos     = quantas vezes o golpe de disparo atira em sequência
//  efeitoArea   = o golpe de área causa o efeito do elemento
//  efeitoPerto  = o golpe de perto também causa o efeito (mais curto)
//  forcaEfeito  = multiplica a duração dos efeitos
// =============================================================
export const MELHORIAS = [
  { disparos: 1, efeitoArea: false, efeitoPerto: false, forcaEfeito: 1 },   // forma inicial
  { disparos: 2, efeitoArea: false, efeitoPerto: false, forcaEfeito: 1 },   // 1ª evolução (Nv.6)
  { disparos: 2, efeitoArea: true,  efeitoPerto: false, forcaEfeito: 1 },   // 2ª evolução (Nv.12)
  { disparos: 3, efeitoArea: true,  efeitoPerto: true,  forcaEfeito: 1.5 }, // forma final (Nv.30)
];
export const PODER_DISPARO_EXTRA = 0.75; // cada disparo extra tem 75% da força
export const DURACAO_EFEITO_PERTO = 0.6;  // efeito do golpe de perto dura 60% do normal

// Tipo duplo: a partir da 2ª evolução o disparo também causa o efeito do elemento dele
export const DURACAO_EFEITO_DISPARO = 0.5;
export function melhoriaDe(especie) {
  const e = ESPECIES[especie];
  // o chefe já luta com todas as melhorias (Silvárion também planta a semente com o disparo)
  if (e.chefe) return e.efeitoDisparo ? { ...MELHORIAS[3], efeitoDisparo: true } : MELHORIAS[3];
  if (e.raro) return MELHORIAS[0];
  const propria = HABILIDADES_DA_LINHA[e.linha]?.melhorias;
  if (propria) return propria[e.estagio];
  const m = MELHORIAS[e.estagio];
  return e.dupla ? { ...m, efeitoDisparo: e.estagio >= 2 } : m;
}

// Efeito que um golpe pode causar: o do elemento do golpe (golpe Normal não causa)
export function efeitoDoElementoDoGolpe(golpe) {
  const nome = EFEITO_DO_ELEMENTO[GOLPES[golpe].elemento];
  return nome ? EFEITOS[nome] : null;
}

function seg(n) { return n.toFixed(1).replace('.', ',').replace(',0', '') + 's'; }

// Frases que explicam o que cada forma tem de especial
export function textosMelhoria(especie) {
  const e = ESPECIES[especie];
  const proprios = HABILIDADES_DA_LINHA[e.linha]?.textos;
  if (proprios) return proprios[e.estagio];
  const m = melhoriaDe(especie);
  const [efP, efD, efA] = e.golpes.map(efeitoDoElementoDoGolpe);
  const [perto, disparo, area] = e.golpes.map((g) => GOLPES[g].nome);
  const lista = [];
  if (m.disparos > 1) lista.push(`${disparo} dispara ${m.disparos} vezes seguidas.`);
  if (m.efeitoArea && efA) lista.push(`${area} tem ${pct(efA.chance * CHANCE_POR_TIPO.area)} de chance de causar ${efA.nome}: ${efA.descricao} (${seg(efA.duracao * m.forcaEfeito)}).`);
  if (m.efeitoDisparo && efD) lista.push(`${disparo}: cada tiro tem ${pct(efD.chance * CHANCE_POR_TIPO.projetil)} de chance de causar ${efD.nome}: ${efD.descricao} (${seg(efD.duracao * m.forcaEfeito * DURACAO_EFEITO_DISPARO)}).`);
  if (m.efeitoPerto && efP) lista.push(`${perto} também tem ${pct(efP.chance * CHANCE_POR_TIPO.corpo)} de chance de causar ${efP.nome} (${seg(efP.duracao * m.forcaEfeito * DURACAO_EFEITO_PERTO)}).`);
  return lista;
}

// O que muda ao evoluir de uma forma para a outra (mostrado na tela de evolução)
export function novidadesDaEvolucao(de, para) {
  const a = melhoriaDe(de), b = melhoriaDe(para);
  const e = ESPECIES[para];
  const proprias = HABILIDADES_DA_LINHA[e.linha]?.novidades;
  if (proprias?.[e.estagio]) return proprias[e.estagio];
  const [efP, efD, efA] = e.golpes.map(efeitoDoElementoDoGolpe);
  const [perto, disparo, area] = e.golpes.map((g) => GOLPES[g].nome);
  const lista = [];
  if (b.disparos > a.disparos) lista.push(`${disparo} agora dispara ${b.disparos} vezes`);
  if (b.efeitoArea && !a.efeitoArea && efA) lista.push(`${area} agora causa ${efA.nome}`);
  if (b.efeitoDisparo && !a.efeitoDisparo && efD) lista.push(`${disparo} agora causa ${efD.nome}`);
  if (b.efeitoPerto && !a.efeitoPerto && efP) lista.push(`${perto} agora causa ${efP.nome}`);
  if (b.forcaEfeito > a.forcaEfeito) lista.push('efeitos duram mais');
  return lista;
}

// Níveis em que a forma atual evolui para a próxima
export const NIVEIS_EVOLUCAO = [6, 12, 30];
export const NOMES_ESTAGIO = ['Forma inicial', '1ª evolução', '2ª evolução', 'Forma final'];

// Cada linha: atributos da forma inicial + as 4 formas [id, nome, descrição]
export const LINHAS = {
  fogo: { base: { hp: 44, atk: 13, def: 9, vel: 6.6 }, formas: [
    ['brasito', 'Brasito', 'Raposinha de brasa. Rápida e esquentada.'],
    ['brasalobo', 'Brasalobo', 'Lobinho de duas caudas em chamas. Corre mais que o vento quente.'],
    ['fornalobo', 'Fornalobo', 'Lobo com uma juba de fogo que nunca apaga.'],
    ['magmalobo', 'Magmalobo', 'Lobo de rocha derretida. Onde pisa, o chão vira lava.'],
  ] },
  agua: { base: { hp: 50, atk: 11, def: 11, vel: 5.6 }, formas: [
    ['gotinho', 'Gotinho', 'Gota de geleia saltitante. Equilibrado em tudo.'],
    ['marolo', 'Marolo', 'Ganhou uma crista de onda e nadadeiras.'],
    ['marulhao', 'Marulhão', 'Gigante de água com braços que viram jatos.'],
    ['tsunamar', 'Tsunamar', 'Carrega uma onda inteira nas costas.'],
  ] },
  planta: { base: { hp: 54, atk: 11, def: 13, vel: 5.0 }, formas: [
    ['musguinho', 'Musguinho', 'Bloquinho de musgo com uma flor. Defesa alta.'],
    ['moitao', 'Moitão', 'Virou uma moita florida que anda.'],
    ['troncudo', 'Troncudo', 'Tronco antigo que acordou e ganhou raízes no lugar dos pés.'],
    ['florestral', 'Florestral', 'Uma floresta inteira cresce na sua copa.'],
  ] },
  terra: { base: { hp: 58, atk: 12, def: 14, vel: 4.6 }, formas: [
    ['pedrisco', 'Pedrisco', 'Pedrinha curiosa que rola em vez de andar.'],
    ['cascalhao', 'Cascalhão', 'Ganhou mãos de pedra e um cristal nas costas.'],
    ['rochedrao', 'Rochedrão', 'Golem de rocha com punhos do tamanho de pedregulhos.'],
    ['montanhar', 'Montanhar', 'Montanha viva com picos nevados nas costas.'],
  ] },
  raio: { base: { hp: 42, atk: 14, def: 9, vel: 7.0 }, formas: [
    ['faisquinho', 'Faisquinho', 'Bolinha elétrica de espinhos em zigue-zague.'],
    ['choquilho', 'Choquilho', 'Ouriço que solta faíscas quando fica bravo.'],
    ['trovolt', 'Trovolt', 'Ave de asas em zigue-zague. Voa junto com o trovão.'],
    ['tempestor', 'Tempestor', 'Senhor da tempestade, cercado de nuvens carregadas.'],
  ] },
  sol: { base: { hp: 48, atk: 13, def: 10, vel: 6.0 }, formas: [
    ['solito', 'Solito', 'Filhote do sol. Esquenta quem está por perto. Só aparece de dia.'],
    ['solario', 'Solário', 'Leãozinho com juba de raios de sol.'],
    ['solaurum', 'Solaurum', 'Leão dourado que brilha mais que o meio-dia.'],
    ['astrorei', 'Astrorei', 'Rei do céu do dia, com coroa e auréola de luz.'],
  ] },
  lua: { base: { hp: 46, atk: 12, def: 11, vel: 6.4 }, formas: [
    ['lunico', 'Lunico', 'Coelhinho com uma lua crescente na testa. Só sai à noite.'],
    ['lunarelo', 'Lunarelo', 'As pontas das orelhas brilham como luas finas.'],
    ['crescentio', 'Crescêntio', 'Coelho guerreiro com uma lâmina lunar nas costas.'],
    ['plenilunio', 'Plenilúnio', 'Guardião da lua cheia. Flutua sob o luar.'],
  ] },
  luz: { base: { hp: 44, atk: 12, def: 10, vel: 6.6 }, formas: [
    ['lumino', 'Lumino', 'Bolinha de luz com asinhas. Só aparece de dia.'],
    ['lumelo', 'Lumelo', 'Arrasta uma cauda de cristal brilhante.'],
    ['prismal', 'Prismal', 'Cristal vivo cercado de pedras que flutuam.'],
    ['aurealis', 'Aurealis', 'Ser de luz pura, com auréola e seis asas.'],
  ] },
  trevas: { base: { hp: 46, atk: 14, def: 10, vel: 6.2 }, formas: [
    ['breuzinho', 'Breuzinho', 'Sombrinha de olhos roxos. Aparece de noite.'],
    ['sombrelo', 'Sombrelo', 'Gato de sombra com rabo de fumaça.'],
    ['umbrafel', 'Umbrafel', 'Pantera das sombras. Some e reaparece sem barulho.'],
    ['noctifero', 'Noctífero', 'Fera da noite eterna, com asas e coroa de chifres.'],
  ] },
};

// =============================================================
// MONSTROS DE TIPO DUPLO (mais raros)
// Aparece 1 a cada 10 monstros que surgem no mapa, na região dos seus elementos.
// Golpes: perto e área do 1º elemento, disparo do 2º elemento.
// Só são capturados com cristais mais fortes (veja CRISTAIS lá embaixo).
// =============================================================
export const ORDEM_DUPLAS = ['fogoPlanta', 'aguaFogo', 'terraRaio'];
export const DUPLAS = {
  fogoPlanta: { elementos: ['fogo', 'planta'], zonas: ['planta', 'fogo', 'campo'],
    base: { hp: 54, atk: 15, def: 12, vel: 6.0 }, formas: [
    ['brotobrasa', 'Brotobrasa', 'Broto com uma brasa no lugar da flor. Nunca se queima.'],
    ['chamafolha', 'Chamafolha', 'Arbusto de folhas que ardem sem virar cinza.'],
    ['ardentroco', 'Ardentroco', 'Tronco de casca em brasa. Os galhos soltam faíscas.'],
    ['florinferno', 'Florinferno', 'Árvore de chamas eternas. Onde passa, brotam flores de fogo.'],
  ] },
  aguaFogo: { elementos: ['agua', 'fogo'], zonas: ['agua', 'fogo', 'campo'],
    base: { hp: 56, atk: 14, def: 12, vel: 5.8 }, formas: [
    ['vaporito', 'Vaporito', 'Bolinha de água fervendo. Chia quando está feliz.'],
    ['fumarolo', 'Fumarolo', 'Solta jatos de vapor pelas costas para correr.'],
    ['geiserao', 'Gêiserão', 'Tartaruga com um gêiser fervente no casco.'],
    ['caldeirax', 'Caldeirax', 'Colosso de água fervente, sempre cercado de névoa.'],
  ] },
  terraRaio: { elementos: ['terra', 'raio'], zonas: ['terra', 'raio', 'campo'],
    base: { hp: 60, atk: 14, def: 14, vel: 5.4 }, formas: [
    ['imanito', 'Imanito', 'Pedrinha magnética que gruda em tudo que é de metal.'],
    ['magnetito', 'Magnetito', 'Ganhou um ímã na cabeça e solta faíscas pelas pedras.'],
    ['ferrovolt', 'Ferrovolt', 'Golem de ferro com raios correndo pelas rachaduras.'],
    ['titanvolt', 'Titanvolt', 'Titã de rocha magnetizada. Pedras e raios giram em volta dele.'],
  ] },
};
export function nomeDupla(k) { return DUPLAS[k].elementos.map((e) => ELEMENTOS[e].nome).join(' + '); }
export const INTERVALO_DUPLO = 10; // 1 monstro de tipo duplo a cada 10 que aparecem

// Quanto cada estágio multiplica os atributos, o tamanho e a dificuldade de captura
const MULT = [1, 1.22, 1.5, 1.85];
const MULT_VEL = [1, 1.04, 1.08, 1.12];
const TAMANHO = [1, 1.1, 1.25, 1.4];
const CAPTURA = [0.55, 0.4, 0.25, 0.12];
const CAPTURA_DUPLA = [0.3, 0.22, 0.12, 0.06];
// Cristal mínimo para capturar: 0 = comum, 1 = forte, 2 = supremo
const CRISTAL_MIN_DUPLA = [1, 1, 2, 2];

// Golpes de tipo duplo: perto e área do 1º elemento, disparo do 2º
function golpesDuplos([a, b], estagio) {
  const A = KITS[a], B = KITS[b];
  return [
    ['investida', B.proj, A.area],
    [A.corpo, B.proj, A.area],
    [A.corpoF, B.projF, A.area],
    [A.corpoF, B.projF, A.areaF],
  ][estagio];
}

// Espécies: geradas a partir das linhas + 3 monstros raros sem evolução
export const ESPECIES = {};
for (const [el, linha] of Object.entries(LINHAS)) {
  linha.formas.forEach(([id, nome, descricao], e) => {
    ESPECIES[id] = {
      nome, descricao, elemento: el, elementos: [el], linha: el, estagio: e, cristalMin: 0,
      tamanho: TAMANHO[e], captura: CAPTURA[e],
      raio: 0.65 * TAMANHO[e] * (1 + e * 0.12),
      altura: (1.7 + e * 0.45) * TAMANHO[e],
      base: { hp: linha.base.hp * MULT[e], atk: linha.base.atk * MULT[e], def: linha.base.def * MULT[e], vel: linha.base.vel * MULT_VEL[e] },
      golpes: HABILIDADES_DA_LINHA[el]?.golpes[e] ?? golpesDoEstagio(el, e),
      evoluiPara: linha.formas[e + 1]?.[0] ?? null,
      nivelEvolucao: NIVEIS_EVOLUCAO[e] ?? null,
    };
  });
}
for (const [k, linha] of Object.entries(DUPLAS)) {
  linha.formas.forEach(([id, nome, descricao], e) => {
    ESPECIES[id] = {
      nome, descricao, elemento: linha.elementos[0], elemento2: linha.elementos[1], elementos: linha.elementos,
      linha: k, dupla: true, estagio: e, cristalMin: CRISTAL_MIN_DUPLA[e],
      tamanho: TAMANHO[e], captura: CAPTURA_DUPLA[e],
      raio: 0.65 * TAMANHO[e] * (1 + e * 0.12),
      altura: (1.7 + e * 0.45) * TAMANHO[e],
      base: { hp: linha.base.hp * MULT[e], atk: linha.base.atk * MULT[e], def: linha.base.def * MULT[e], vel: linha.base.vel * MULT_VEL[e] },
      golpes: golpesDuplos(linha.elementos, e),
      evoluiPara: linha.formas[e + 1]?.[0] ?? null,
      nivelEvolucao: NIVEIS_EVOLUCAO[e] ?? null,
    };
  });
}
Object.assign(ESPECIES, {
  vulcarapa: {
    nome: 'Vulcarapa', elemento: 'fogo', linha: null, estagio: 0, raro: true, tamanho: 1.25, captura: 0.35, raio: 0.85, altura: 2.3,
    descricao: 'Tartaruga com um vulcão no casco. Lenta e muito resistente.',
    base: { hp: 62, atk: 12, def: 15, vel: 4.3 }, golpes: ['cascada', 'brasa', 'erupcao'], evoluiPara: null, nivelEvolucao: null,
  },
  aquaraia: {
    nome: 'Aquaraia', elemento: 'agua', linha: null, estagio: 0, raro: true, tamanho: 1.1, captura: 0.35, raio: 0.8, altura: 2.1,
    descricao: 'Arraia que plana sobre o lago. Ataca em voos rasantes.',
    base: { hp: 46, atk: 14, def: 9, vel: 7.2 }, golpes: ['rasante', 'bolhas', 'onda'], evoluiPara: null, nivelEvolucao: null,
  },
  espinhal: {
    nome: 'Espinhal', elemento: 'planta', linha: null, estagio: 0, raro: true, tamanho: 1.1, captura: 0.35, raio: 0.75, altura: 2,
    descricao: 'Ouriço-cacto. Chicoteia de longe e machuca muito.',
    base: { hp: 50, atk: 15, def: 11, vel: 5.6 }, golpes: ['chicote', 'folhas', 'raizes'], evoluiPara: null, nivelEvolucao: null,
  },
});
// SUPER RARO: o chefe do Trono de Magma, no fim do Caminho das Brasas
ESPECIES.ignarion = {
  onde: 'do Caminho das Brasas, no Trono de Magma',
  nome: 'Ignárion', elemento: 'igneo', elementos: ['igneo'], linha: null, estagio: 3, raro: true, superRaro: true, chefe: true,
  tamanho: 1.9, captura: 0.04, cristalMin: 2, raio: 1.7, altura: 3.6,
  descricao: 'Senhor da cratera. Dorme no Trono de Magma e acorda a cada amanhecer. Seu fogo ígneo queima até monstros de fogo.',
  base: { hp: 95, atk: 18, def: 16, vel: 6.2 }, golpes: ['mordidaMagma', 'cometaIgneo', 'cataclismo'], evoluiPara: null, nivelEvolucao: null,
};
// SUPER RARO: o chefe do Santuário da Árvore-Mãe, no fim da Trilha Ancestral (Floresta)
ESPECIES.silvarion = {
  onde: 'da Trilha Ancestral, no Santuário da Árvore-Mãe',
  nome: 'Silvárion', elemento: 'silvestre', elementos: ['silvestre'], linha: null, estagio: 3, raro: true, superRaro: true, chefe: true,
  tamanho: 1.9, captura: 0.04, cristalMin: 2, raio: 1.7, altura: 3.8, efeitoDisparo: true,
  descricao: 'Cervo ancestral com uma floresta inteira na galhada. Guarda a Árvore-Mãe e acorda a cada amanhecer. Sua força silvestre vence até monstros de planta.',
  base: { hp: 100, atk: 17, def: 17, vel: 6.0 }, golpes: ['galhadaAncestral', 'sementeParasita', 'selvaViva'], evoluiPara: null, nivelEvolucao: null,
};
export const RAROS = ['vulcarapa', 'aquaraia', 'espinhal', 'ignarion', 'silvarion'];
for (const id of RAROS) Object.assign(ESPECIES[id], { elementos: ESPECIES[id].elementos || [ESPECIES[id].elemento], cristalMin: ESPECIES[id].cristalMin || 0 });

// Monstros iniciais: a primeira forma de cada linha
export const INICIAIS = ORDEM_ELEMENTOS.map((el) => LINHAS[el].formas[0][0]);

// Serve para as linhas simples ('fogo') e as duplas ('fogoPlanta')
export function formasDaLinha(k) {
  return (LINHAS[k] || DUPLAS[k]).formas.map((f) => f[0]);
}

// Qual forma um monstro selvagem tem num certo nível
export function formaPorNivel(k, nivel) {
  const estagio = NIVEIS_EVOLUCAO.filter((n) => nivel >= n).length;
  return (LINHAS[k] || DUPLAS[k]).formas[estagio][0];
}

// Onde e quando cada monstro aparece. "L:fogo" = alguém da linha de fogo
// (a forma depende do nível). Os outros nomes são espécies raras.
export const APARICOES = {
  campo:  { dia:   [['L:fogo', 2], ['L:agua', 2], ['L:planta', 2], ['L:sol', 3], ['L:luz', 3]],
            noite: [['L:fogo', 1], ['L:agua', 1], ['L:planta', 1], ['L:lua', 3], ['L:trevas', 3]] },
  fogo:   { dia:   [['L:fogo', 6], ['vulcarapa', 3], ['L:sol', 2]],
            noite: [['L:fogo', 6], ['vulcarapa', 3], ['L:trevas', 2]] },
  agua:   { dia:   [['L:agua', 6], ['aquaraia', 3], ['L:luz', 1]],
            noite: [['L:agua', 5], ['aquaraia', 2], ['L:lua', 3]] },
  planta: { dia:   [['L:planta', 6], ['espinhal', 3], ['L:luz', 2]],
            noite: [['L:planta', 5], ['espinhal', 2], ['L:trevas', 3]] },
  terra:  { dia:   [['L:terra', 8], ['L:sol', 1]],
            noite: [['L:terra', 8], ['L:lua', 1]] },
  raio:   { dia:   [['L:raio', 8], ['L:luz', 1]],
            noite: [['L:raio', 7], ['L:trevas', 1]] },
};

// =============================================================
// ARENAS DE BATALHA (uma por região)
// favorece = elemento que ganha +25% de dano e +10% de velocidade ali
// Quem é fraco contra esse elemento perde 20% de dano.
// perigo = armadilha do mapa (as regras ficam em batalha.js)
// =============================================================
export const ARENAS = {
  cratera: { nome: 'Trono de Magma',     clima: 'Chuva de cinzas',  favorece: 'igneo',  perigo: 'lava',
            descricaoPerigo: 'Lava por todo lado: queima quem pisa, mas cura Fogo e Ígneo.' },
  brasas: { nome: 'Caminho das Brasas',  clima: 'Brasas no ar',     favorece: 'fogo',   perigo: 'lava',
            descricaoPerigo: 'Lava queima quem pisa, mas cura monstros de Fogo.' },
  santuario: { nome: 'Santuário da Árvore-Mãe', clima: 'Esporos brilhantes', favorece: 'silvestre', perigo: 'raizes',
            descricaoPerigo: 'Raízes saem do chão (um círculo verde avisa): machucam e prendem. Planta e Silvestre não sentem.' },
  raizes: { nome: 'Trilha Ancestral',    clima: 'Vaga-lumes',       favorece: 'planta', perigo: 'espinhos',
            descricaoPerigo: 'Moitas de espinhos machucam quem pisa, mas curam monstros de Planta.' },
  campo:  { nome: 'Campo Aberto',        clima: 'Pólen no ar',      favorece: null,     perigo: null,
            descricaoPerigo: '' },
  planta: { nome: 'Coração da Floresta', clima: 'Vento de folhas',  favorece: 'planta', perigo: 'vento',
            descricaoPerigo: 'O vento empurra quem não é de Planta.' },
  fogo:   { nome: 'Cratera do Vulcão',   clima: 'Brasas no ar',     favorece: 'fogo',   perigo: 'lava',
            descricaoPerigo: 'Lava queima quem pisa, mas cura monstros de Fogo.' },
  agua:   { nome: 'Margem do Lago',      clima: 'Chuva',            favorece: 'agua',   perigo: 'pocas',
            descricaoPerigo: 'Poças encharcam quem pisa, mas curam monstros de Água.' },
  terra:  { nome: 'Fundo da Pedreira',   clima: 'Poeira',           favorece: 'terra',  perigo: 'pedras',
            descricaoPerigo: 'Pedras caem do alto. Terra não sente.' },
  raio:   { nome: 'Topo da Tempestade',  clima: 'Relâmpagos',       favorece: 'raio',   perigo: 'raios',
            descricaoPerigo: 'Raios caem e paralisam. Raio não sente.' },
};
// Chance de cada perigo do mapa pegar em quem está nele:
//  lava, poças e espinhos: a cada meio segundo em cima, tenta de novo
//  raios e raízes: o dano é certo (o círculo avisa antes); a chance é só do efeito (paralisia, prender)
//  vento: a cada 3 s sorteia se vem uma rajada (que empurra por 3 s) ou se fica calmo
//  pedras: só dano, sem efeito (o círculo avisa antes), então não têm chance
export const CHANCE_PERIGO = { lava: 0.35, pocas: 0.35, espinhos: 0.5, raios: 0.4, raizes: 0.45, vento: 0.5 };
export const BONUS_ARENA = { favorecido: 1.25, velFavorecido: 1.1, prejudicado: 0.8, periodo: 1.15 };

// Modificadores que a arena (e o dia/noite) dão a um elemento
// Tipo duplo: basta um dos elementos ser o favorecido; só é prejudicado se nenhum for
export function modificadorArena(zona, elementos, periodo) {
  if (!Array.isArray(elementos)) elementos = [elementos];
  const a = ARENAS[zona] || ARENAS.campo;
  let dano = 1, vel = 1;
  const textos = [];
  if (elementos.includes(a.favorece)) { dano *= BONUS_ARENA.favorecido; vel *= BONUS_ARENA.velFavorecido; textos.push({ t: 'Arena +25%', bom: true }); }
  else if (a.favorece && elementos.some((el) => ELEMENTOS[a.favorece].forteContra.includes(el))) { dano *= BONUS_ARENA.prejudicado; textos.push({ t: 'Arena −20%', bom: false }); }
  const doPeriodo = periodo === 'dia' ? ['sol', 'luz'] : ['lua', 'trevas'];
  if (elementos.some((el) => doPeriodo.includes(el))) { dano *= BONUS_ARENA.periodo; textos.push({ t: (periodo === 'dia' ? 'Dia' : 'Noite') + ' +15%', bom: true }); }
  return { dano, vel, textos };
}

// =============================================================
// CAMINHO DAS BRASAS (dungeon aberta da região de fogo)
// 4 etapas: quanto mais fundo, mais fortes os grupos. No fim, o chefe.
// extra = níveis somados aos grupos normais em cada etapa
// =============================================================
// Cada dungeon aberta: etapas, quem aparece, o chefe e as arenas.
//  zonaSoltos = arena de quem aparece no caminho | zonaChefe = arena do chefe
//  aparicoes  = quem aparece nos grupos e soltos ("L:planta" = a forma depende do nível)
export const DUNGEONS = {
  brasas: {
    nome: 'Caminho das Brasas', regiao: 'Vulcão', chefe: 'ignarion', fim: 'Trono de Magma',
    zonaSoltos: 'brasas', zonaChefe: 'cratera',
    semCasa: 'Calor demais aqui no Caminho das Brasas. Monte a casa antes da entrada.',
    etapas: [
      { nome: 'Etapa 1 · Portão de Cinzas',       extraComum: 0, extraLider: 0 },
      { nome: 'Etapa 2 · Ruínas da Forja',        extraComum: 3, extraLider: 3 },
      { nome: 'Etapa 3 · Rio de Lava',            extraComum: 6, extraLider: 6 },
      { nome: 'Etapa 4 · Escadaria de Obsidiana', extraComum: 9, extraLider: 9 },
    ],
    // as linhas de fogo vêm evoluídas por causa do nível alto
    aparicoes: [['L:fogo', 7], ['vulcarapa', 2], ['L:terra', 2], ['L:sol', 1], ['L:trevas', 1]],
  },
  raizes: {
    nome: 'Trilha Ancestral', regiao: 'Floresta', chefe: 'silvarion', fim: 'Santuário da Árvore-Mãe',
    zonaSoltos: 'raizes', zonaChefe: 'santuario',
    semCasa: 'As raízes da Trilha Ancestral não deixam montar a casa. Monte antes da entrada.',
    etapas: [
      { nome: 'Etapa 1 · Bosque dos Cogumelos', extraComum: 0, extraLider: 0 },
      { nome: 'Etapa 2 · Ruínas de Musgo',      extraComum: 3, extraLider: 3 },
      { nome: 'Etapa 3 · Lago Escondido',       extraComum: 6, extraLider: 6 },
      { nome: 'Etapa 4 · Raízes Gigantes',      extraComum: 9, extraLider: 9 },
    ],
    // Nenhum monstro novo: Planta evoluída, Espinhal, Fogo+Planta (tipo duplo) e visitantes
    aparicoes: [['L:planta', 8], ['espinhal', 2], ['L:fogoPlanta', 1], ['L:agua', 1], ['L:terra', 1], ['L:luz', 1], ['L:trevas', 1]],
  },
};
// Mantido para o código antigo: etapas e aparições do Caminho das Brasas
export const ETAPAS = DUNGEONS.brasas.etapas;
export const APARICOES_DUNGEON = DUNGEONS.brasas.aparicoes;
export function niveisDaEtapa(media, etapa, dungeon = 'brasas') {
  const e = DUNGEONS[dungeon].etapas[etapa];
  return {
    comum: Math.min(48, Math.round(media * 1.1 + 2 + e.extraComum)),
    lider: Math.min(50, Math.round(media * 1.4 + 8 + e.extraLider)),
  };
}
// O chefe fica sempre acima do líder da última etapa
export function nivelDoChefe(media) { return Math.min(50, Math.round(media * 1.4 + 22)); }

// Linhas que só existem de dia ou de noite
export const PERIODO_DA_LINHA = { sol: 'dia', luz: 'dia', lua: 'noite', trevas: 'noite' };

// VIDA: multiplicador inicial e quanto cresce por nível.
// Ex.: Brasito Nv.1 = 44 × 2,2 = 97 de vida; no Nv.10 = 97 × 2,8 = 271.
export const VIDA_BASE = 2.2;
export const VIDA_POR_NIVEL = 0.2;
// DANO: quanto o dano cresce por nível de quem ataca (menos que a vida,
// para as batalhas de nível alto durarem um pouco mais)
export const DANO_POR_NIVEL = 0.15;
// DANO GERAL: multiplica o dano de todos os golpes (seus e dos inimigos).
// 0,7 = 30% menos que antes. Para deixar as lutas mais rápidas, suba; mais longas, desça.
export const DANO_GERAL = 0.7;

export function fatorDanoNivel(nivel) {
  return 1 + (nivel - 1) * DANO_POR_NIVEL;
}

// Ataque e defesa crescem 12% por nível; a vida cresce 20%
export function statsDe(especie, nivel) {
  const b = ESPECIES[especie].base;
  const f = 1 + (nivel - 1) * 0.12;
  return {
    hpMax: Math.round(b.hp * VIDA_BASE * (1 + (nivel - 1) * VIDA_POR_NIVEL)),
    atk: b.atk * f,
    def: b.def * f,
    vel: b.vel * (1 + (nivel - 1) * 0.015),
  };
}

export function xpParaProximo(nivel) {
  return 12 + nivel * 8;
}

export function xpDaVitoria(nivelInimigo) {
  return 10 + nivelInimigo * 7;
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

// Evolui o monstro quantas vezes o nível permitir. Devolve a lista de evoluções.
export function verificarEvolucao(m) {
  const feitas = [];
  let esp = ESPECIES[m.especie];
  while (esp?.evoluiPara && m.nivel >= esp.nivelEvolucao) {
    const de = m.especie;
    const fracao = m.hp / statsDe(de, m.nivel).hpMax;
    m.especie = esp.evoluiPara;
    const max = statsDe(m.especie, m.nivel).hpMax;
    m.hp = fracao > 0 ? Math.max(1, Math.round(fracao * max)) : 0;
    feitas.push({ uid: m.uid, de, para: m.especie });
    esp = ESPECIES[m.especie];
  }
  return feitas;
}

// =============================================================
// CRISTAIS DE CAPTURA
// poder = multiplica a chance de captura
// Monstros de tipo duplo exigem um cristal mínimo (cristalMin na espécie):
// formas inicial e 1ª evolução -> Forte; 2ª evolução e forma final -> Supremo.
// =============================================================
export const CRISTAIS = [
  { id: 'comum',   nome: 'Cristal',         plural: 'cristais',          curto: 'Comum',   cor: '#8ff4ff', emissivo: '#2ab8d8', poder: 1 },
  { id: 'forte',   nome: 'Cristal Forte',   plural: 'Cristais Fortes',   curto: 'Forte',   cor: '#c79bff', emissivo: '#7a3ad8', poder: 1.5 },
  { id: 'supremo', nome: 'Cristal Supremo', plural: 'Cristais Supremos', curto: 'Supremo', cor: '#ffd23f', emissivo: '#e08a10', poder: 2.2 },
];
// Fusão na casa: 3 cristais de um tipo viram 1 do tipo acima
export const CUSTO_FUSAO = 3;

// Chance de captura: maior quando o monstro está com pouca vida e com cristal mais forte.
// Devolve 0 se o cristal for fraco demais para essa espécie.
export function chanceCaptura(monstro, tipoCristal = 0) {
  const esp = ESPECIES[monstro.especie];
  if (tipoCristal < (esp.cristalMin || 0)) return 0;
  const fracVida = monstro.hp / statsDe(monstro.especie, monstro.nivel).hpMax;
  const c = esp.captura * CRISTAIS[tipoCristal].poder * (1.7 - 1.5 * fracVida);
  return Math.min(0.95, Math.max(0.05, c));
}
