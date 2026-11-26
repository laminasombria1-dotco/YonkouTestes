// =============================================================
// DADOS DO JOGO
// Aqui ficam as "tabelas" do jogo: elementos, golpes, linhas evolutivas
// e onde cada monstro aparece. Para balancear, quase sempre basta
// mexer nos números deste arquivo.
// =============================================================

// Habilidades próprias de algumas linhas ficam na pasta js/habilidades/ (fácil de achar e mudar)
import { GOLPES_BRASITO, GOLPES_POR_FORMA_BRASITO, MELHORIAS_BRASITO, TEXTOS_BRASITO, NOVIDADES_BRASITO } from './habilidades/brasito.js';
import { GOLPES_GOTINHO, GOLPES_POR_FORMA_GOTINHO, MELHORIAS_GOTINHO, TEXTOS_GOTINHO, NOVIDADES_GOTINHO } from './habilidades/gotinho.js';
import { GOLPES_MUSGUINHO, GOLPES_POR_FORMA_MUSGUINHO, MELHORIAS_MUSGUINHO, TEXTOS_MUSGUINHO, NOVIDADES_MUSGUINHO } from './habilidades/musguinho.js';
import { GOLPES_PEDRISCO, GOLPES_POR_FORMA_PEDRISCO, MELHORIAS_PEDRISCO, TEXTOS_PEDRISCO, NOVIDADES_PEDRISCO } from './habilidades/pedrisco.js';
import { GOLPES_FAISQUINHO, GOLPES_POR_FORMA_FAISQUINHO, MELHORIAS_FAISQUINHO, TEXTOS_FAISQUINHO, NOVIDADES_FAISQUINHO } from './habilidades/faisquinho.js';
import { GOLPES_SOLITO, GOLPES_POR_FORMA_SOLITO, MELHORIAS_SOLITO, TEXTOS_SOLITO, NOVIDADES_SOLITO } from './habilidades/solito.js';
import { GOLPES_IMANITO, GOLPES_POR_FORMA_IMANITO, MELHORIAS_IMANITO, TEXTOS_IMANITO, NOVIDADES_IMANITO } from './habilidades/imanito.js';
import { GOLPES_BROTOBRASA, GOLPES_POR_FORMA_BROTOBRASA, MELHORIAS_BROTOBRASA, TEXTOS_BROTOBRASA, NOVIDADES_BROTOBRASA } from './habilidades/brotobrasa.js';
import { GOLPES_VAPORITO, GOLPES_POR_FORMA_VAPORITO, MELHORIAS_VAPORITO, TEXTOS_VAPORITO, NOVIDADES_VAPORITO } from './habilidades/vaporito.js';
import { GOLPES_LUMINO, GOLPES_POR_FORMA_LUMINO, MELHORIAS_LUMINO, TEXTOS_LUMINO, NOVIDADES_LUMINO } from './habilidades/lumino.js';
import { GOLPES_LUNICO, GOLPES_POR_FORMA_LUNICO, MELHORIAS_LUNICO, TEXTOS_LUNICO, NOVIDADES_LUNICO } from './habilidades/lunico.js';
import { GOLPES_TREVAS, GOLPES_POR_FORMA_TREVAS, MELHORIAS_TREVAS, TEXTOS_TREVAS, NOVIDADES_TREVAS } from './habilidades/trevas.js';
import { GOLPES_AQUARAIA, GOLPES_POR_FORMA_AQUARAIA, MELHORIAS_AQUARAIA, TEXTOS_AQUARAIA, NOVIDADES_AQUARAIA } from './habilidades/aquaraia.js';
import { GOLPES_VULCARAPA, GOLPES_POR_FORMA_VULCARAPA, MELHORIAS_VULCARAPA, TEXTOS_VULCARAPA, NOVIDADES_VULCARAPA } from './habilidades/vulcarapa.js';
import { GOLPES_ESPINHAL, GOLPES_POR_FORMA_ESPINHAL, MELHORIAS_ESPINHAL, TEXTOS_ESPINHAL, NOVIDADES_ESPINHAL } from './habilidades/espinhal.js';
import { GOLPES_IGNARION, GOLPES_POR_FORMA_IGNARION, MELHORIAS_IGNARION, TEXTOS_IGNARION, NOVIDADES_IGNARION } from './habilidades/ignarion.js';
import { GOLPES_SILVARION, GOLPES_POR_FORMA_SILVARION, MELHORIAS_SILVARION, TEXTOS_SILVARION, NOVIDADES_SILVARION } from './habilidades/silvarion.js';

// Linhas com habilidades próprias: golpes por forma, melhorias e textos
const HABILIDADES_DA_LINHA = {
  fogo: { golpes: GOLPES_POR_FORMA_BRASITO, melhorias: MELHORIAS_BRASITO, textos: TEXTOS_BRASITO, novidades: NOVIDADES_BRASITO },
  agua: { golpes: GOLPES_POR_FORMA_GOTINHO, melhorias: MELHORIAS_GOTINHO, textos: TEXTOS_GOTINHO, novidades: NOVIDADES_GOTINHO },
  planta: { golpes: GOLPES_POR_FORMA_MUSGUINHO, melhorias: MELHORIAS_MUSGUINHO, textos: TEXTOS_MUSGUINHO, novidades: NOVIDADES_MUSGUINHO },
  terra: { golpes: GOLPES_POR_FORMA_PEDRISCO, melhorias: MELHORIAS_PEDRISCO, textos: TEXTOS_PEDRISCO, novidades: NOVIDADES_PEDRISCO },
  raio: { golpes: GOLPES_POR_FORMA_FAISQUINHO, melhorias: MELHORIAS_FAISQUINHO, textos: TEXTOS_FAISQUINHO, novidades: NOVIDADES_FAISQUINHO },
  sol: { golpes: GOLPES_POR_FORMA_SOLITO, melhorias: MELHORIAS_SOLITO, textos: TEXTOS_SOLITO, novidades: NOVIDADES_SOLITO },
  lua: { golpes: GOLPES_POR_FORMA_LUNICO, melhorias: MELHORIAS_LUNICO, textos: TEXTOS_LUNICO, novidades: NOVIDADES_LUNICO },
  luz: { golpes: GOLPES_POR_FORMA_LUMINO, melhorias: MELHORIAS_LUMINO, textos: TEXTOS_LUMINO, novidades: NOVIDADES_LUMINO },
  // tipos duplos com habilidades próprias (a chave é a da linha em DUPLAS)
  terraRaio: { golpes: GOLPES_POR_FORMA_IMANITO, melhorias: MELHORIAS_IMANITO, textos: TEXTOS_IMANITO, novidades: NOVIDADES_IMANITO },
  fogoPlanta: { golpes: GOLPES_POR_FORMA_BROTOBRASA, melhorias: MELHORIAS_BROTOBRASA, textos: TEXTOS_BROTOBRASA, novidades: NOVIDADES_BROTOBRASA },
  aguaFogo: { golpes: GOLPES_POR_FORMA_VAPORITO, melhorias: MELHORIAS_VAPORITO, textos: TEXTOS_VAPORITO, novidades: NOVIDADES_VAPORITO },
  trevas: { golpes: GOLPES_POR_FORMA_TREVAS, melhorias: MELHORIAS_TREVAS, textos: TEXTOS_TREVAS, novidades: NOVIDADES_TREVAS },
  // raros com formas novas (a chave é a da linha em LINHAS_RARAS)
  aquaraia: { golpes: GOLPES_POR_FORMA_AQUARAIA, melhorias: MELHORIAS_AQUARAIA, textos: TEXTOS_AQUARAIA, novidades: NOVIDADES_AQUARAIA },
  vulcarapa: { golpes: GOLPES_POR_FORMA_VULCARAPA, melhorias: MELHORIAS_VULCARAPA, textos: TEXTOS_VULCARAPA, novidades: NOVIDADES_VULCARAPA },
  espinhal: { golpes: GOLPES_POR_FORMA_ESPINHAL, melhorias: MELHORIAS_ESPINHAL, textos: TEXTOS_ESPINHAL, novidades: NOVIDADES_ESPINHAL },
  // lendários com formas novas (a chave também é a da linha em LINHAS_RARAS)
  ignarion: { golpes: GOLPES_POR_FORMA_IGNARION, melhorias: MELHORIAS_IGNARION, textos: TEXTOS_IGNARION, novidades: NOVIDADES_IGNARION },
  silvarion: { golpes: GOLPES_POR_FORMA_SILVARION, melhorias: MELHORIAS_SILVARION, textos: TEXTOS_SILVARION, novidades: NOVIDADES_SILVARION },
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
  // golpes próprios da Aquaraia e das formas dela (números em js/habilidades/aquaraia.js)
  ...GOLPES_AQUARAIA,
  // golpes próprios da Vulcarapa e das formas dela (números em js/habilidades/vulcarapa.js)
  ...GOLPES_VULCARAPA,
  // golpes próprios do Espinhal e das formas dele (números em js/habilidades/espinhal.js)
  ...GOLPES_ESPINHAL,
  // golpes próprios do Ignárion e das formas dele (números em js/habilidades/ignarion.js)
  ...GOLPES_IGNARION,
  // golpes próprios do Silvárion e das formas dele (números em js/habilidades/silvarion.js)
  ...GOLPES_SILVARION,
  // golpes próprios da linha do Musguinho (números em js/habilidades/musguinho.js)
  ...GOLPES_MUSGUINHO,
  // golpes próprios da linha do Pedrisco (números em js/habilidades/pedrisco.js)
  ...GOLPES_PEDRISCO,
  // golpes próprios da linha do Faisquinho (números em js/habilidades/faisquinho.js)
  ...GOLPES_FAISQUINHO,
  // golpes próprios da linha do Solito (números em js/habilidades/solito.js)
  ...GOLPES_SOLITO,
  // golpes próprios da linha do Lunico (números em js/habilidades/lunico.js)
  ...GOLPES_LUNICO,
  // golpes próprios da linha do Lumino (números em js/habilidades/lumino.js)
  ...GOLPES_LUMINO,
  // golpes próprios da linha do Imanito (números em js/habilidades/imanito.js)
  ...GOLPES_IMANITO,
  // golpes próprios da linha do Brotobrasa (números em js/habilidades/brotobrasa.js)
  ...GOLPES_BROTOBRASA,
  // golpes próprios da linha do Vaporito (números em js/habilidades/vaporito.js)
  ...GOLPES_VAPORITO,
  // golpes próprios da linha do Breuzinho (números em js/habilidades/trevas.js)
  ...GOLPES_TREVAS,
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
  { disparos: 2, efeitoArea: false, efeitoPerto: false, forcaEfeito: 1 },   // 1ª evolução (Nv.12)
  { disparos: 2, efeitoArea: true,  efeitoPerto: false, forcaEfeito: 1 },   // 2ª evolução (Nv.30)
  { disparos: 3, efeitoArea: true,  efeitoPerto: true,  forcaEfeito: 1.5 }, // forma final (Nv.50, evolução rara)
];
export const PODER_DISPARO_EXTRA = 0.75; // cada disparo extra tem 75% da força
export const DURACAO_EFEITO_PERTO = 0.6;  // efeito do golpe de perto dura 60% do normal

// Tipo duplo: a partir da 2ª evolução o disparo também causa o efeito do elemento dele
export const DURACAO_EFEITO_DISPARO = 0.5;
export function melhoriaDe(especie) {
  const e = ESPECIES[especie];
  // o chefe já luta com todas as melhorias (Silvárion também planta a semente com o disparo)
  const propria = HABILIDADES_DA_LINHA[e.linha]?.melhorias;
  if (propria) return propria[e.estagio];
  if (e.chefe) return e.efeitoDisparo ? { ...MELHORIAS[3], efeitoDisparo: true } : MELHORIAS[3];
  if (e.raro) return MELHORIAS[0];
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

// Níveis em que a forma atual evolui para a próxima.
// As 2 primeiras são sozinhas, pelo nível. A do Nv.50 é a EVOLUÇÃO RARA (a forma final):
// precisa de missão + itens + ouro e é feita com um botão (veja EVOLUCAO_RARA).
export const NIVEIS_EVOLUCAO = [12, 30, 50];
export const NOMES_ESTAGIO = ['Forma inicial', '1ª evolução', '2ª evolução', 'Evolução rara'];
export const NIVEL_MAXIMO = 100;

// Evolução rara das linhas e dos tipos duplos (da 2ª evolução para a forma final, no Nv.50)
//  missaoNoNivel = a missão aparece nesse nível | contaDesde = só contam inimigos desse nível para cima
//  alvo = quantos monstros derrotar | custo = itens e ouro gastos na hora de evoluir
export const EVOLUCAO_RARA = { missaoNoNivel: 45, contaDesde: 35, alvo: 60, custo: { asas: 3, coracoes: 3, ouro: 3000 } };

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
    ['plenilunio', 'Plenilúnio', 'Lobo da lua cheia com orelhas de coelho e garras de prata. Flutua sob o luar.'],
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
    base: { hp: 64, atk: 13, def: 15, vel: 5.2 }, formas: [ // tanque: mais vida e defesa, mais lento
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
      evolucaoRara: e === 2 ? EVOLUCAO_RARA : null,
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
      golpes: HABILIDADES_DA_LINHA[k]?.golpes[e] ?? golpesDuplos(linha.elementos, e),
      evoluiPara: linha.formas[e + 1]?.[0] ?? null,
      nivelEvolucao: NIVEIS_EVOLUCAO[e] ?? null,
      evolucaoRara: e === 2 ? EVOLUCAO_RARA : null,
    };
  });
}
// =============================================================
// RAROS COM FORMAS NOVAS (fase 6: Vulcarapa, Aquaraia e Espinhal)
// A forma de hoje é a inicial (Nv.1 a 54). 1ª evolução no Nv.55 e 2ª no Nv.70, sozinhas;
// evolução rara no Nv.90, com botão (missão no Nv.85 + itens + ouro).
// Mesma regra de atributos para os 3 raros: a base da forma inicial × MULT_RARO.
// =============================================================
export const NIVEIS_EVOLUCAO_RARO = [55, 70, 90];
export const EVOLUCAO_RARA_RARO = { missaoNoNivel: 85, contaDesde: 40, alvo: 60, custo: { asas: 5, coracoes: 5, ouro: 6000 } };
const MULT_RARO = [1, 1.7, 2.0, 2.35];
const MULT_VEL_RARO = [1, 1.04, 1.08, 1.12];
const TAMANHO_RARO = [1, 1.12, 1.24, 1.36];  // multiplica o tamanho da forma inicial
const CAPTURA_RARO = [1, 0.7, 0.45, 0.25];   // multiplica a chance de captura da forma inicial
export const ORDEM_LINHAS_RARAS = ['vulcarapa', 'aquaraia', 'espinhal', 'ignarion', 'silvarion'];
// =============================================================
// LENDÁRIOS COM FORMAS NOVAS (fase 7: Ignárion e Silvárion)
// A forma de hoje é a inicial (Nv.1 a 64). As 3 evoluções (Nv.65, 75 e 90) são TODAS
// com o botão: missão + itens + ouro. Mesma regra de atributos para todos os lendários.
// A forma inicial continua sendo o chefe da masmorra (chefe, captura só com Cristal Supremo).
// =============================================================
export const NIVEIS_EVOLUCAO_LENDARIO = [65, 75, 90];
export const EVOLUCOES_LENDARIAS = [
  { missaoNoNivel: 60, contaDesde: 50, alvo: 60, custo: { asas: 2, coracoes: 2, ouro: 4000 } },
  { missaoNoNivel: 70, contaDesde: 60, alvo: 60, custo: { asas: 4, coracoes: 4, ouro: 8000 } },
  { missaoNoNivel: 85, contaDesde: 80, alvo: 60, custo: { asas: 6, coracoes: 6, ouro: 15000 } },
];
const MULT_LENDARIO = [1, 1.3, 1.6, 2.0];
export const NOMES_ESTAGIO_LENDARIO = ['Forma inicial', '1ª evolução', '2ª evolução', '3ª evolução'];

// Cada raro: elemento, atributos e medidas da forma inicial + as 4 formas [id, nome, descrição]
// Lendários (lendario: true): tamanho, raio e altura de cada forma (as formas mudam muito) e
// "inicial" = o que só a forma inicial tem (é o chefe da masmorra).
export const LINHAS_RARAS = {
  vulcarapa: { elemento: 'fogo', base: { hp: 62, atk: 12, def: 15, vel: 4.3 }, tamanho: 1.25, captura: 0.35, raio: 0.85, altura: 2.3, formas: [
    ['vulcarapa', 'Vulcarapa', 'Tartaruga com um vulcão no casco. Lenta, gosta de atacar de longe.'],
    ['basaltuga', 'Basaltuga', 'O casco virou placas de basalto, com lava acesa nas rachaduras.'],
    ['crateruga', 'Crateruga', 'Carrega uma cratera inteira nas costas, com um lago de lava borbulhando.'],
    ['colossarapa', 'Colossarapa', 'Colosso de obsidiana com um vulcão gigante no casco. Onde finca, chove lava.'],
  ] },
  aquaraia: { elemento: 'agua', base: { hp: 46, atk: 14, def: 9, vel: 7.2 }, tamanho: 1.1, captura: 0.35, raio: 0.8, altura: 2.1, formas: [
    ['aquaraia', 'Aquaraia', 'Arraia que plana sobre o lago. Ataca em voos rasantes.'],
    ['ventaraia', 'Ventaraia', 'Arraia de asas longas que surfa no vento. O rabo virou um ferrão.'],
    ['mantare', 'Mantaré', 'Manta gigante com uma crista de onda nas costas. Bolhas giram em volta dela.'],
    ['leviaraia', 'Leviaraia', 'Manta das profundezas que aprendeu a voar. Brilha como o fundo do mar e carrega um anel de água.'],
  ] },
  espinhal: { elemento: 'planta', base: { hp: 50, atk: 15, def: 11, vel: 5.6 }, tamanho: 1.1, captura: 0.35, raio: 0.75, altura: 2, formas: [
    ['espinhal', 'Espinhal', 'Ouriço-cacto. Rola como uma bola de espinhos e machuca muito.'],
    ['cactourico', 'Cactouriço', 'Bola de cacto cheia de espinhos, com dois bracinhos e um botão de flor.'],
    ['espinhaco', 'Espinhaço', 'Ouriço-cacto gigante com uma crista de espinhos dourados nas costas.'],
    ['mandacarao', 'Mandacarão', 'Um mandacaru do sertão. Quando a grande flor branca abre, chovem agulhas.'],
  ] },
  ignarion: { elemento: 'igneo', lendario: true, base: { hp: 95, atk: 18, def: 16, vel: 6.2 }, captura: 0.04, cristalMin: 2,
    tamanhos: [1.5, 1.6, 1.7, 1.8], raios: [1.5, 1.6, 1.7, 1.8], alturas: [2.4, 4.2, 4.6, 5.6],
    inicial: { chefe: true, onde: 'do Caminho das Brasas, no Trono de Magma' }, formas: [
    ['ignarion', 'Ignárion', 'Dragãozinho do fogo ígneo. Dorme no Trono de Magma e acorda a cada amanhecer. Seu fogo queima até monstros de fogo.'],
    ['pirarion', 'Pirárion', 'Dragão de pescoço longo com uma crista de fogo e asas de brasa.'],
    ['magmarion', 'Magmárion', 'Ficou de pé: o corpo virou placas de magma rachadas e os chifres cresceram.'],
    ['infernarion', 'Infernárion', 'O senhor do fogo ígneo. Asas enormes, um anel de espinhos nas costas e um coração de fogo no peito.'],
  ] },
  silvarion: { elemento: 'silvestre', lendario: true, base: { hp: 100, atk: 17, def: 17, vel: 6.0 }, captura: 0.04, cristalMin: 2,
    tamanhos: [1.5, 1.6, 1.7, 1.8], raios: [1.3, 1.6, 1.8, 1.9], alturas: [2.8, 4.4, 5.6, 6.8],
    inicial: { chefe: true, onde: 'da Trilha Ancestral, no Santuário da Árvore-Mãe' }, formas: [
    ['silvarion', 'Silvárion', 'Filhote de cervo da floresta, com dois brotinhos na cabeça. Guarda a Árvore-Mãe e acorda a cada amanhecer. Sua força silvestre vence até monstros de planta.'],
    ['bosquarion', 'Bosquárion', 'Cervo jovem com uma manta de musgo e a galhada florida. Vaga-lumes o seguem.'],
    ['raizarion', 'Raizárion', 'Colosso de casca: raízes saem dos cascos e a galhada virou galhos de árvore.'],
    ['ancestrarion', 'Ancestrárion', 'O espírito da floresta. Uma árvore inteira, com flores e frutos acesos, cresce na sua galhada.'],
  ] },
};
for (const [k, L] of Object.entries(LINHAS_RARAS)) {
  L.formas.forEach(([id, nome, descricao], e) => {
    const t = TAMANHO_RARO[e], lenda = !!L.lendario;
    const mult = lenda ? MULT_LENDARIO[e] : MULT_RARO[e];
    ESPECIES[id] = {
      nome, descricao, elemento: L.elemento, elementos: [L.elemento], linha: k, linhaRara: true, raro: true, estagio: e,
      lendario: lenda, superRaro: lenda, cristalMin: L.cristalMin ?? 0,
      tamanho: lenda ? L.tamanhos[e] : L.tamanho * t, captura: L.captura * (lenda ? 1 : CAPTURA_RARO[e]),
      raio: lenda ? L.raios[e] : L.raio * t, altura: lenda ? L.alturas[e] : L.altura * t,
      base: { hp: L.base.hp * mult, atk: L.base.atk * mult, def: L.base.def * mult, vel: L.base.vel * MULT_VEL_RARO[e] },
      golpes: HABILIDADES_DA_LINHA[k].golpes[e],
      evoluiPara: L.formas[e + 1]?.[0] ?? null,
      nivelEvolucao: (lenda ? NIVEIS_EVOLUCAO_LENDARIO : NIVEIS_EVOLUCAO_RARO)[e] ?? null,
      evolucaoRara: lenda ? EVOLUCOES_LENDARIAS[e] ?? null : e === 2 ? EVOLUCAO_RARA_RARO : null,
      ...(e === 0 ? L.inicial : null),
    };
  });
}
// O Ignárion (chefe do Trono de Magma, no fim do Caminho das Brasas) agora fica em LINHAS_RARAS (lendário).
// O Silvárion (chefe do Santuário da Árvore-Mãe, no fim da Trilha Ancestral) agora fica em LINHAS_RARAS (lendário).
export const RAROS = ['vulcarapa', 'aquaraia', 'espinhal', 'ignarion', 'silvarion'];
for (const id of RAROS) Object.assign(ESPECIES[id], { elementos: ESPECIES[id].elementos || [ESPECIES[id].elemento], cristalMin: ESPECIES[id].cristalMin || 0 });

// Monstros iniciais: a primeira forma de cada linha
export const INICIAIS = ORDEM_ELEMENTOS.map((el) => LINHAS[el].formas[0][0]);

// Serve para as linhas simples ('fogo') e as duplas ('fogoPlanta')
export function formasDaLinha(k) {
  return (LINHAS[k] || DUPLAS[k] || LINHAS_RARAS[k]).formas.map((f) => f[0]);
}

// Qual forma um monstro tem num certo nível.
// final = pode estar na forma final (só treinadores e chefes de masmorra);
// os selvagens do mapa param na 2ª evolução.
export function formaPorNivel(k, nivel, final = false) {
  const rara = LINHAS_RARAS[k];
  let estagio = (rara ? NIVEIS_EVOLUCAO_RARO : NIVEIS_EVOLUCAO).filter((n) => nivel >= n).length;
  if (!final) estagio = Math.min(estagio, 2);
  return (LINHAS[k] || DUPLAS[k] || rara).formas[estagio][0];
}

// Espécie de uma escolha das tabelas de aparição e dos treinadores:
// "L:fogo" = alguém da linha (forma pelo nível); um raro com formas novas também
// muda de forma pelo nível; os outros nomes ficam como estão.
export function especieDaEscolha(escolha, nivel, final = false) {
  if (escolha.startsWith('L:')) return formaPorNivel(escolha.slice(2), nivel, final);
  const e = ESPECIES[escolha];
  if (e?.linhaRara && !e.lendario && e.estagio === 0) return formaPorNivel(e.linha, nivel, final); // lendário: só pelo botão
  return escolha;
}

// Onde e quando cada monstro aparece. "L:fogo" = alguém da linha de fogo
// (a forma depende do nível). Os outros nomes são espécies raras.
export const APARICOES = {
  // Mundo novo: cada bioma só com os seus tipos (e os raros dele). Sol, Luz, Lua e Trevas
  // são VISITANTES RAROS (~1 em 10): Sol e Luz de dia, Lua e Trevas de noite.
  // campo = dentro do Reino (lá não nasce ninguém; fica para o GM e as arenas)
  campo:  { dia:   [['L:fogo', 2], ['L:agua', 2], ['L:planta', 2], ['L:sol', 3], ['L:luz', 3]],
            noite: [['L:fogo', 1], ['L:agua', 1], ['L:planta', 1], ['L:lua', 3], ['L:trevas', 3]] },
  fogo:   { dia:   [['L:fogo', 7], ['vulcarapa', 2], ['L:sol', 1]],
            noite: [['L:fogo', 7], ['vulcarapa', 2], ['L:trevas', 1]] },
  agua:   { dia:   [['L:agua', 7], ['aquaraia', 2], ['L:luz', 1]],
            noite: [['L:agua', 7], ['aquaraia', 2], ['L:lua', 1]] },
  planta: { dia:   [['L:planta', 7], ['espinhal', 2], ['L:luz', 1]],
            noite: [['L:planta', 7], ['espinhal', 2], ['L:trevas', 1]] },
  terra:  { dia:   [['L:terra', 9], ['L:sol', 1]],
            noite: [['L:terra', 9], ['L:lua', 1]] },
  raio:   { dia:   [['L:raio', 9], ['L:luz', 1]],
            noite: [['L:raio', 9], ['L:trevas', 1]] },
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
  reino:  { nome: 'Arena do Reino',      clima: 'Confete no ar',    favorece: null,     perigo: null,
            descricaoPerigo: '' },
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
    semCasa: 'Calor demais aqui no Caminho das Brasas. Finque a bandeira antes da entrada.',
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
    semCasa: 'As raízes da Trilha Ancestral não deixam fincar a bandeira. Finque antes da entrada.',
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
// Teto suave dos níveis: até o Nv.50 vale a conta antiga (com o teto de antes, 48/50);
// depois, os níveis acompanham a equipe (média + folga), até o Nv.100.
export function tetoSuave(bruto, tetoAntigo, media, folga) {
  return Math.min(bruto, Math.max(tetoAntigo, media + folga));
}
export function niveisDaEtapa(media, etapa, dungeon = 'brasas', nivelMasmorra = 1) {
  const e = DUNGEONS[dungeon].etapas[etapa];
  const extra = MASMORRA.niveisPorNivel * (nivelMasmorra - 1); // Nível da Masmorra: +3 níveis por nível
  return {
    comum: Math.min(98, Math.round(tetoSuave(media * 1.1 + 2 + e.extraComum, 48, media, 3 + e.extraComum) + extra)),
    lider: Math.min(100, Math.round(tetoSuave(media * 1.4 + 8 + e.extraLider, 50, media, 5 + e.extraLider) + extra)),
  };
}
// O chefe fica sempre acima do líder da última etapa
export function nivelDoChefe(media, nivelMasmorra = 1) {
  return Math.min(100, Math.round(tetoSuave(media * 1.4 + 22, 50, media, 16) + MASMORRA.niveisPorNivel * (nivelMasmorra - 1)));
}

// =============================================================
// NÍVEL DA MASMORRA (fase 8.1): cada masmorra tem o seu, de 1 a 10, salvo na conta
// (estado.masmorras). Cada vitória contra o chefe sobe 1 nível.
//  niveisPorNivel = níveis a mais em todos os monstros de lá, a cada nível
//  dropPorNivel   = chance a mais de Galho e de Asa, a cada nível
//  finalLider     = a partir deste nível, os líderes podem vir na forma final (chanceFinalLider)
//  chefes         = quem pode ser o chefe (sorteado cada vez que ele volta); desde = nível mínimo
//  lendario       = o lendário só aparece a partir do nível 9, por sorteio (chanceLendario)
// =============================================================
export const MASMORRA = {
  nivelMax: 10, niveisPorNivel: 3, dropPorNivel: 0.02,
  finalLider: 5, chanceFinalLider: 0.5,
  lendarioDesde: 9, chanceLendario: 0.15,
  chefes: {
    brasas: [['magmalobo', 1], ['florinferno', 1], ['caldeirax', 1], ['colossarapa', 5]],
    raizes: [['florestral', 1], ['florinferno', 1], ['mandacarao', 5]],
    // masmorras novas (passo 4). Sem lendário do tipo: o chefe fica só entre as formas finais
    // (o Lâmina vai criar os lendários de Gelo, Deserto e Arquipélago mais para frente)
    trovao: [['tempestor', 1], ['titanvolt', 1]],
    torre: [['tempestor', 1], ['titanvolt', 1]],
    mina: [['montanhar', 1], ['titanvolt', 1]],
    tumba: [['montanhar', 1], ['titanvolt', 1]],
    pantano: [['florestral', 1], ['florinferno', 1], ['mandacarao', 5]],
    forja: [['magmalobo', 1], ['caldeirax', 1], ['florinferno', 1], ['colossarapa', 5]],
    templo: [['tsunamar', 1], ['leviaraia', 1], ['caldeirax', 1]],
    mares: [['tsunamar', 1], ['leviaraia', 1], ['caldeirax', 1]],
  },
};

// =============================================================
// MASMORRAS NOVAS (mundo novo, passo 4): ÁREAS SEPARADAS
// Você encosta na porta escondida no bioma, a tela escurece e o jogo carrega só ela.
// São difíceis e demoradas: 5 etapas, cada uma com um portão selado que só abre
// quando você vence o LÍDER do grupo daquela etapa. No fim, o chefe (forma final).
//  lugar   = qual masmorra do bioma em LUGARES (gerador.js): 1 = a primeira, 2 = a segunda
//  piso    = níveis mínimos no Nível da Masmorra 1 (nunca ficam mais fáceis que isso);
//            depois somam +3 por Nível da Masmorra, como as de hoje (até o Nv.98/100)
//  extra   = níveis a mais em cada etapa
//  captura = o chefe só com o Cristal Supremo e com metade da chance de uma forma final (20%)
//  ouro    = o chefe dá 300 + 50 por Nível da Masmorra (e não dá ovo)
//  chefe   = o lendário do tipo (null = ainda não tem: fica só o sorteio das formas finais)
// =============================================================
export const MASMORRAS_NOVAS = {
  trovao: {
    fem: true, fimFem: false, // feminino? (para os textos: na/no, da/do)
    nome: 'Gruta do Trovão', bioma: 'raio', lugar: 1, regiao: 'Picos Nevados', chefe: null, fim: 'Trono da Tempestade',
    zonaSoltos: 'raio', zonaChefe: 'raio',
    semCasa: 'O vento da Gruta do Trovão arranca a bandeira. Finque do lado de fora.',
    piso: { comum: 55, lider: 62, chefe: 72 },
    etapas: [
      { nome: 'Etapa 1 · Vale da Nevasca',      extra: 0 },
      { nome: 'Etapa 2 · Lago Congelado',       extra: 2 },
      { nome: 'Etapa 3 · Galeria de Cristal',   extra: 4 },
      { nome: 'Etapa 4 · Salão dos Raios',      extra: 6 },
      { nome: 'Etapa 5 · Escadaria Trovejante', extra: 8 },
    ],
    // Só Raio (e o Imanito, Terra + Raio); Sol, Luz, Lua e Trevas como visitantes raros
    aparicoes: [['L:raio', 9], ['L:terraRaio', 3], ['L:sol', 0.5], ['L:luz', 0.5], ['L:lua', 0.5], ['L:trevas', 0.5]],
  },
  torre: {
    fem: true, fimFem: false, // feminino? (para os textos: na/no, da/do)
    nome: 'Torre da Nevasca', bioma: 'raio', lugar: 2, regiao: 'Picos Nevados', chefe: null, fim: 'Sino da Nevasca',
    zonaSoltos: 'raio', zonaChefe: 'raio',
    semCasa: 'A nevasca da Torre não deixa fincar a bandeira. Finque do lado de fora.',
    piso: { comum: 62, lider: 70, chefe: 80 }, // a 2ª do bioma: mais difícil
    etapas: [
      { nome: 'Etapa 1 · Trilha do Penhasco',      extra: 0 },
      { nome: 'Etapa 2 · Acampamento Abandonado',  extra: 2 },
      { nome: 'Etapa 3 · Pátio da Torre',          extra: 4 },
      { nome: 'Etapa 4 · Salão do Gelo Eterno',    extra: 6 },
      { nome: 'Etapa 5 · Cume Gelado',             extra: 8 },
    ],
    aparicoes: [['L:raio', 9], ['L:terraRaio', 3], ['L:sol', 0.5], ['L:luz', 0.5], ['L:lua', 0.5], ['L:trevas', 0.5]],
  },
  mina: {
    fem: true, fimFem: false, // feminino? (para os textos: na/no, da/do)
    nome: 'Mina Abandonada', bioma: 'terra', lugar: 1, regiao: 'Deserto', chefe: null, fim: 'Coração da Terra',
    zonaSoltos: 'terra', zonaChefe: 'terra',
    semCasa: 'O chão da mina treme demais para fincar a bandeira. Finque do lado de fora.',
    piso: { comum: 55, lider: 62, chefe: 72 },
    etapas: [
      { nome: 'Etapa 1 · Cânion Vermelho',   extra: 0 },
      { nome: 'Etapa 2 · Pátio da Mina',     extra: 2 },
      { nome: 'Etapa 3 · Túneis de Madeira', extra: 4 },
      { nome: 'Etapa 4 · Caverna de Minério', extra: 6 },
      { nome: 'Etapa 5 · Poço Profundo',     extra: 8 },
    ],
    // Só Terra (e o Imanito, Terra + Raio: os ímãs da mina)
    aparicoes: [['L:terra', 9], ['L:terraRaio', 3], ['L:sol', 0.5], ['L:luz', 0.5], ['L:lua', 0.5], ['L:trevas', 0.5]],
  },
  tumba: {
    fem: true, fimFem: true, // feminino? (para os textos: na/no, da/do)
    nome: 'Tumba das Areias', bioma: 'terra', lugar: 2, regiao: 'Deserto', chefe: null, fim: 'Câmara do Faraó',
    zonaSoltos: 'terra', zonaChefe: 'terra',
    semCasa: 'A areia da Tumba engole a bandeira. Finque do lado de fora.',
    piso: { comum: 62, lider: 70, chefe: 80 }, // a 2ª do bioma: mais difícil
    etapas: [
      { nome: 'Etapa 1 · Dunas dos Faraós',         extra: 0 },
      { nome: 'Etapa 2 · Avenida das Esfinges',     extra: 2 },
      { nome: 'Etapa 3 · Templo do Sol',            extra: 4 },
      { nome: 'Etapa 4 · Câmara dos Sarcófagos',    extra: 6 },
      { nome: 'Etapa 5 · Galeria dos Deuses Gato',  extra: 8 },
    ],
    // Terra; na tumba, Sol e Trevas aparecem um pouco mais (os deuses do sol e da escuridão)
    aparicoes: [['L:terra', 10], ['L:terraRaio', 2], ['L:sol', 0.8], ['L:luz', 0.4], ['L:lua', 0.4], ['L:trevas', 0.8]],
  },
  // Floresta e Vulcânico: a outra masmorra do bioma é a de hoje (Trilha Ancestral / Caminho das Brasas),
  // que acompanha a equipe sem piso. Por isso estas duas usam o piso mais alto (o da 2ª do bioma).
  pantano: {
    fem: false, fimFem: true, // feminino? (para os textos: na/no, da/do)
    nome: 'Pântano Sombrio', bioma: 'planta', lugar: 1, regiao: 'Floresta', chefe: 'silvarion', fim: 'Árvore Morta Ancestral',
    zonaSoltos: 'planta', zonaChefe: 'planta',
    semCasa: 'O chão do Pântano é mole demais para a bandeira. Finque do lado de fora.',
    piso: { comum: 62, lider: 70, chefe: 80 },
    etapas: [
      { nome: 'Etapa 1 · Charco das Névoas',        extra: 0 },
      { nome: 'Etapa 2 · Bosque dos Cogumelos',      extra: 2 },
      { nome: 'Etapa 3 · Cabana da Bruxa',           extra: 4 },
      { nome: 'Etapa 4 · Raízes Afogadas',           extra: 6 },
      { nome: 'Etapa 5 · Lagoa dos Vaga-lumes',      extra: 8 },
    ],
    // Planta, o Espinhal e o Brotobrasa (Fogo + Planta); no pântano escuro, Lua e Trevas aparecem um pouco mais
    aparicoes: [['L:planta', 9], ['espinhal', 2], ['L:fogoPlanta', 1.5], ['L:sol', 0.3], ['L:luz', 0.3], ['L:lua', 0.7], ['L:trevas', 0.7]],
  },
  forja: {
    fem: true, fimFem: false, // feminino? (para os textos: na/no, da/do)
    nome: 'Forja Antiga', bioma: 'fogo', lugar: 1, regiao: 'Vulcão', chefe: 'ignarion', fim: 'Coração da Forja',
    zonaSoltos: 'fogo', zonaChefe: 'fogo',
    semCasa: 'O chão da Forja queima a bandeira. Finque do lado de fora.',
    piso: { comum: 62, lider: 70, chefe: 80 },
    etapas: [
      { nome: 'Etapa 1 · Campo de Cinzas',      extra: 0 },
      { nome: 'Etapa 2 · Rio de Lava',          extra: 2 },
      { nome: 'Etapa 3 · Portão da Forja',      extra: 4 },
      { nome: 'Etapa 4 · Salão das Bigornas',   extra: 6 },
      { nome: 'Etapa 5 · Fundição',             extra: 8 },
    ],
    // Fogo, a Vulcarapa, o Vaporito (Água + Fogo) e o Brotobrasa (Fogo + Planta)
    aparicoes: [['L:fogo', 9], ['vulcarapa', 2], ['L:aguaFogo', 1.5], ['L:fogoPlanta', 1], ['L:sol', 0.5], ['L:luz', 0.5], ['L:lua', 0.5], ['L:trevas', 0.5]],
  },
  templo: {
    fem: false, fimFem: false, // feminino? (para os textos: na/no, da/do)
    nome: 'Templo Submerso', bioma: 'agua', lugar: 1, regiao: 'Arquipélago', chefe: null, fim: 'Santuário do Tridente',
    zonaSoltos: 'agua', zonaChefe: 'agua',
    semCasa: 'A maré do Templo leva a bandeira embora. Finque do lado de fora.',
    piso: { comum: 55, lider: 62, chefe: 72 },
    etapas: [
      { nome: 'Etapa 1 · Praia dos Corais',   extra: 0 },
      { nome: 'Etapa 2 · Recife Raso',        extra: 2 },
      { nome: 'Etapa 3 · Átrio Afundado',     extra: 4 },
      { nome: 'Etapa 4 · Salão das Conchas',  extra: 6 },
      { nome: 'Etapa 5 · Jardim de Algas',    extra: 8 },
    ],
    // Só Água, a Aquaraia e o Vaporito (Água + Fogo); Sol, Luz, Lua e Trevas como visitantes raros
    aparicoes: [['L:agua', 9], ['aquaraia', 2], ['L:aguaFogo', 1.5], ['L:sol', 0.5], ['L:luz', 0.5], ['L:lua', 0.5], ['L:trevas', 0.5]],
  },
  mares: {
    fem: true, fimFem: false, // feminino? (para os textos: na/no, da/do)
    nome: 'Gruta das Marés', bioma: 'agua', lugar: 2, regiao: 'Arquipélago', chefe: null, fim: 'Trono das Marés',
    zonaSoltos: 'agua', zonaChefe: 'agua',
    semCasa: 'As ondas da Gruta derrubam a bandeira. Finque do lado de fora.',
    piso: { comum: 62, lider: 70, chefe: 80 }, // a 2ª do bioma: mais difícil
    etapas: [
      { nome: 'Etapa 1 · Enseada dos Naufrágios',     extra: 0 },
      { nome: 'Etapa 2 · Piscinas de Maré',           extra: 2 },
      { nome: 'Etapa 3 · Gruta de Cristal Marinho',   extra: 4 },
      { nome: 'Etapa 4 · Esconderijo Pirata',         extra: 6 },
      { nome: 'Etapa 5 · Caverna do Polvo',           extra: 8 },
    ],
    aparicoes: [['L:agua', 9], ['aquaraia', 2], ['L:aguaFogo', 1.5], ['L:sol', 0.5], ['L:luz', 0.5], ['L:lua', 0.5], ['L:trevas', 0.5]],
  },
};
// Artigo e preposição certos para o nome (fem = feminino): com('em', true) = 'na', com('de', false) = 'do'
export function com(prep, fem) { return { em: fem ? 'na' : 'no', de: fem ? 'da' : 'do', o: fem ? 'a' : 'o', O: fem ? 'A' : 'O' }[prep]; }
export const MASMORRA_NOVA = { captura: 0.5, ouroBase: 300, ouroPorNivel: 50 };
// Níveis das etapas de uma masmorra nova (com o piso)
export function niveisMasmorraNova(media, etapa, id, nivelMasmorra = 1) {
  const c = MASMORRAS_NOVAS[id], e = c.etapas[etapa].extra, extra = MASMORRA.niveisPorNivel * (nivelMasmorra - 1);
  const comum = Math.max(tetoSuave(media * 1.1 + 2 + e, 48, media, 3 + e), c.piso.comum + e);
  const lider = Math.max(tetoSuave(media * 1.4 + 8 + e, 50, media, 5 + e), c.piso.lider + e);
  return { comum: Math.min(98, Math.round(comum + extra)), lider: Math.min(100, Math.round(lider + extra)) };
}
export function nivelChefeMasmorraNova(media, id, nivelMasmorra = 1) {
  const c = MASMORRAS_NOVAS[id];
  return Math.min(100, Math.round(Math.max(tetoSuave(media * 1.4 + 22, 50, media, 16), c.piso.chefe) + MASMORRA.niveisPorNivel * (nivelMasmorra - 1)));
}
// Os dados da masmorra no jogo salvo (cria se não tiver: saves antigos começam no nível 1)
export function dadosMasmorra(estado, id) {
  estado.masmorras ||= {};
  return (estado.masmorras[id] ||= { nivel: 1, vitorias: 0, chefe: null, espera: false });
}
// Sorteia o chefe da masmorra para o nível dela (o lendário só a partir do nível 9)
export function sortearChefe(id, nivel, sorte = Math.random) {
  const lenda = (DUNGEONS[id] || MASMORRAS_NOVAS[id])?.chefe; // as masmorras novas sem lendário pulam isso
  if (lenda && nivel >= MASMORRA.lendarioDesde && sorte() < MASMORRA.chanceLendario) return lenda;
  const lista = MASMORRA.chefes[id].filter(([, desde]) => nivel >= desde);
  return lista[Math.floor(sorte() * lista.length)][0];
}

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

// Depois do Nv.50 os atributos crescem pela METADE por nível (decisão do Lâmina, fase 8.1).
// Assim um Nv.100 fica ~4 vezes mais forte que um Nv.50 (sem isso, ~13 vezes).
export const NIVEL_CORTE = 50;
export const CRESCE_DEPOIS_DO_CORTE = 0.5;
// Quantos "níveis de crescimento" o monstro tem (Nv.1 = 0; no Nv.100 = 49 + 25 = 74)
export function niveisDeCrescimento(nivel) {
  if (nivel <= NIVEL_CORTE) return nivel - 1;
  return NIVEL_CORTE - 1 + (nivel - NIVEL_CORTE) * CRESCE_DEPOIS_DO_CORTE;
}

export function fatorDanoNivel(nivel) {
  return 1 + niveisDeCrescimento(nivel) * DANO_POR_NIVEL;
}

// Ataque e defesa crescem 12% por nível; a vida cresce 20% (metade disso depois do Nv.50)
export function statsDe(especie, nivel) {
  const b = ESPECIES[especie].base;
  const n = niveisDeCrescimento(nivel);
  const f = 1 + n * 0.12;
  return {
    hpMax: Math.round(b.hp * VIDA_BASE * (1 + n * VIDA_POR_NIVEL)),
    atk: b.atk * f,
    def: b.def * f,
    vel: b.vel * (1 + n * 0.015),
  };
}

// Experiência para subir: do Nv.50 para cima pede o DOBRO (o conteúdo novo dura mais)
export const XP_DEPOIS_DO_CORTE = 2;
export function xpParaProximo(nivel) {
  return (12 + nivel * 8) * (nivel >= NIVEL_CORTE ? XP_DEPOIS_DO_CORTE : 1);
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

// Troca o monstro para a próxima forma (a vida continua na mesma proporção)
export function evoluirUmaVez(m) {
  const de = m.especie;
  const fracao = m.hp / statsDe(de, m.nivel).hpMax;
  m.especie = ESPECIES[de].evoluiPara;
  const max = statsDe(m.especie, m.nivel).hpMax;
  m.hp = fracao > 0 ? Math.max(1, Math.round(fracao * max)) : 0;
  delete m.missao; // a missão era desta forma
  return { uid: m.uid, de, para: m.especie };
}

// Evolui o monstro quantas vezes o nível permitir (menos a evolução rara, que é com botão).
// Devolve a lista de evoluções.
export function verificarEvolucao(m) {
  const feitas = [];
  let esp = ESPECIES[m.especie];
  while (esp?.evoluiPara && m.nivel >= esp.nivelEvolucao && !esp.evolucaoRara) {
    feitas.push(evoluirUmaVez(m));
    esp = ESPECIES[m.especie];
  }
  return feitas;
}

// ---------- Missão e evolução rara ----------
// A missão do monstro (ou null se ainda não tem): { alvo, contaDesde, conta, pronta }
// Fica salva no monstro em m.missao = { de: espécie, conta }
export function missaoDe(m) {
  const R = ESPECIES[m.especie]?.evolucaoRara;
  if (!R || m.nivel < R.missaoNoNivel) return null;
  if (m.missao?.de !== m.especie) m.missao = { de: m.especie, conta: 0 };
  return { alvo: R.alvo, contaDesde: R.contaDesde, conta: m.missao.conta, pronta: m.missao.conta >= R.alvo };
}

// Um inimigo desmaiou enquanto este monstro lutava. Devolve 'contou', 'completa' ou null.
export function contarNaMissao(m, nivelInimigo) {
  const M = missaoDe(m);
  if (!M || M.pronta || nivelInimigo < M.contaDesde) return null;
  m.missao.conta++;
  return m.missao.conta >= M.alvo ? 'completa' : 'contou';
}

// O que falta para a evolução rara: { nivel, missao, asas, coracoes, ouro, tudo } (true = ok)
export function requisitosEvolucaoRara(m, estado) {
  const e = ESPECIES[m.especie], R = e?.evolucaoRara;
  if (!R || !e.evoluiPara) return null;
  const M = missaoDe(m), c = R.custo;
  const r = {
    nivel: m.nivel >= e.nivelEvolucao, missao: !!M?.pronta,
    asas: (estado.asas || 0) >= c.asas, coracoes: (estado.coracoes || 0) >= c.coracoes, ouro: (estado.moedas || 0) >= c.ouro,
  };
  r.tudo = r.nivel && r.missao && r.asas && r.coracoes && r.ouro;
  return r;
}

// Faz a evolução rara (gasta os itens e o ouro). Devolve a evolução feita ou null.
export function fazerEvolucaoRara(m, estado) {
  const r = requisitosEvolucaoRara(m, estado);
  if (!r?.tudo) return null;
  const c = ESPECIES[m.especie].evolucaoRara.custo;
  estado.asas -= c.asas;
  estado.coracoes -= c.coracoes;
  estado.moedas -= c.ouro;
  return evoluirUmaVez(m);
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
  if (tipoCristal < cristalMinimo(monstro)) return 0;
  const fracVida = monstro.hp / statsDe(monstro.especie, monstro.nivel).hpMax;
  // fatorCaptura: o chefe das masmorras novas tem metade da chance (MASMORRA_NOVA.captura)
  const dificil = (ehFormaFinal(esp) ? CAPTURA_FORMA_FINAL : 1) * (monstro.fatorCaptura || 1);
  const c = esp.captura * dificil * CRISTAIS[tipoCristal].poder * (1.7 - 1.5 * fracVida);
  return Math.min(0.95, Math.max(dificil < 1 ? 0.02 : 0.05, c));
}
// Forma final (a última forma das linhas, tipos duplos e raros; o lendário tem as regras dele):
// fora da equipe do jogador ela só aparece nos chefes e líderes de masmorra e nos treinadores.
// Para capturar: só o Cristal Supremo, e com chance menor (decisão do Lâmina, fase 8.1).
export const CAPTURA_FORMA_FINAL = 0.4;
export function ehFormaFinal(esp) {
  return !esp.lendario && esp.estagio === 3 && !esp.evoluiPara;
}
export function cristalMinimo(monstro) {
  const esp = ESPECIES[monstro.especie];
  return ehFormaFinal(esp) ? 2 : esp.cristalMin || 0;
}
