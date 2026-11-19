// =============================================================
// DADOS DO JOGO
// Aqui ficam as "tabelas" do jogo: elementos, golpes, linhas evolutivas
// e onde cada monstro aparece. Para balancear, quase sempre basta
// mexer nos números deste arquivo.
// =============================================================

// Ordem em que os elementos aparecem nas telas
export const ORDEM_ELEMENTOS = ['fogo', 'agua', 'planta', 'terra', 'raio', 'sol', 'lua', 'luz', 'trevas'];

// forteContra = elementos que recebem 1,5× de dano dos golpes deste elemento
export const ELEMENTOS = {
  fogo:   { nome: 'Fogo',   cor: '#ff7a3d', forteContra: ['planta'] },
  agua:   { nome: 'Água',   cor: '#3db8ff', forteContra: ['fogo', 'terra'] },
  planta: { nome: 'Planta', cor: '#5fd35a', forteContra: ['agua', 'terra'] },
  terra:  { nome: 'Terra',  cor: '#c9a46a', forteContra: ['fogo', 'raio'] },
  raio:   { nome: 'Raio',   cor: '#f7e43a', forteContra: ['agua', 'sol'] },
  sol:    { nome: 'Sol',    cor: '#ffab2e', forteContra: ['lua', 'trevas'] },
  lua:    { nome: 'Lua',    cor: '#b9b4ff', forteContra: ['sol', 'fogo'] },
  luz:    { nome: 'Luz',    cor: '#fff6c8', forteContra: ['trevas', 'lua'] },
  trevas: { nome: 'Trevas', cor: '#b57be8', forteContra: ['luz', 'planta'] },
  normal: { nome: 'Normal', cor: '#d9d2c3', forteContra: [] },
};

// Multiplicador de dano: 1.5 se o golpe é forte contra o alvo, 0.6 se é fraco.
export function multiplicador(elementoGolpe, elementoAlvo) {
  if (ELEMENTOS[elementoGolpe]?.forteContra.includes(elementoAlvo)) return 1.5;
  if (ELEMENTOS[elementoAlvo]?.forteContra.includes(elementoGolpe)) return 0.6;
  return 1;
}

export function fracoContra(elemento) {
  return ORDEM_ELEMENTOS.filter((e) => ELEMENTOS[e].forteContra.includes(elemento));
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
  abismo:           { nome: 'Abismo',           elemento: 'trevas', tipo: 'area',     poder: 31, recarga: 7,   raio: 4.8, lentidao: 2 },
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
// =============================================================
export const EFEITOS = {
  queimadura: { nome: 'Queimadura', cor: '#ff7a3d', duracao: 4,   descricao: 'perde vida a cada segundo' },
  encharcado: { nome: 'Encharcado', cor: '#3db8ff', duracao: 4,   descricao: 'fica 45% mais lento' },
  enraizado:  { nome: 'Enraizado',  cor: '#5fd35a', duracao: 1.8, descricao: 'não consegue andar, mas ainda ataca' },
  soterrado:  { nome: 'Soterrado',  cor: '#c9a46a', duracao: 5,   descricao: 'a defesa cai 30%' },
  paralisia:  { nome: 'Paralisia',  cor: '#f7e43a', duracao: 1.4, descricao: 'não anda nem ataca' },
  ofuscado:   { nome: 'Ofuscado',   cor: '#ffab2e', duracao: 4,   descricao: '40% de chance de errar os golpes' },
  sono:       { nome: 'Sono',       cor: '#b9b4ff', duracao: 3,   descricao: 'dorme até levar um golpe' },
  exposto:    { nome: 'Exposto',    cor: '#fff6c8', duracao: 5,   descricao: 'recebe 30% a mais de dano' },
  medo:       { nome: 'Medo',       cor: '#b57be8', duracao: 2.2, descricao: 'não consegue atacar' },
};
export const EFEITO_DO_ELEMENTO = {
  fogo: 'queimadura', agua: 'encharcado', planta: 'enraizado', terra: 'soterrado', raio: 'paralisia',
  sol: 'ofuscado', lua: 'sono', luz: 'exposto', trevas: 'medo',
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

export function melhoriaDe(especie) {
  const e = ESPECIES[especie];
  return e.raro ? MELHORIAS[0] : MELHORIAS[e.estagio];
}

function seg(n) { return n.toFixed(1).replace('.', ',').replace(',0', '') + 's'; }

// Frases que explicam o que cada forma tem de especial
export function textosMelhoria(especie) {
  const e = ESPECIES[especie];
  const m = melhoriaDe(especie);
  const ef = EFEITOS[EFEITO_DO_ELEMENTO[e.elemento]];
  const [perto, disparo, area] = e.golpes.map((g) => GOLPES[g].nome);
  const lista = [];
  if (m.disparos > 1) lista.push(`${disparo} dispara ${m.disparos} vezes seguidas.`);
  if (m.efeitoArea && ef) lista.push(`${area} causa ${ef.nome}: ${ef.descricao} (${seg(ef.duracao * m.forcaEfeito)}).`);
  if (m.efeitoPerto && ef) lista.push(`${perto} também causa ${ef.nome} (${seg(ef.duracao * m.forcaEfeito * DURACAO_EFEITO_PERTO)}).`);
  return lista;
}

// O que muda ao evoluir de uma forma para a outra (mostrado na tela de evolução)
export function novidadesDaEvolucao(de, para) {
  const a = melhoriaDe(de), b = melhoriaDe(para);
  const e = ESPECIES[para];
  const ef = EFEITOS[EFEITO_DO_ELEMENTO[e.elemento]];
  const [perto, disparo, area] = e.golpes.map((g) => GOLPES[g].nome);
  const lista = [];
  if (b.disparos > a.disparos) lista.push(`${disparo} agora dispara ${b.disparos} vezes`);
  if (b.efeitoArea && !a.efeitoArea) lista.push(`${area} agora causa ${ef.nome}`);
  if (b.efeitoPerto && !a.efeitoPerto) lista.push(`${perto} agora causa ${ef.nome}`);
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

// Quanto cada estágio multiplica os atributos, o tamanho e a dificuldade de captura
const MULT = [1, 1.22, 1.5, 1.85];
const MULT_VEL = [1, 1.04, 1.08, 1.12];
const TAMANHO = [1, 1.1, 1.25, 1.4];
const CAPTURA = [0.55, 0.4, 0.25, 0.12];

// Espécies: geradas a partir das linhas + 3 monstros raros sem evolução
export const ESPECIES = {};
for (const [el, linha] of Object.entries(LINHAS)) {
  linha.formas.forEach(([id, nome, descricao], e) => {
    ESPECIES[id] = {
      nome, descricao, elemento: el, linha: el, estagio: e,
      tamanho: TAMANHO[e], captura: CAPTURA[e],
      raio: 0.65 * TAMANHO[e] * (1 + e * 0.12),
      altura: (1.7 + e * 0.45) * TAMANHO[e],
      base: { hp: linha.base.hp * MULT[e], atk: linha.base.atk * MULT[e], def: linha.base.def * MULT[e], vel: linha.base.vel * MULT_VEL[e] },
      golpes: golpesDoEstagio(el, e),
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
export const RAROS = ['vulcarapa', 'aquaraia', 'espinhal'];

// Monstros iniciais: a primeira forma de cada linha
export const INICIAIS = ORDEM_ELEMENTOS.map((el) => LINHAS[el].formas[0][0]);

export function formasDaLinha(el) {
  return LINHAS[el].formas.map((f) => f[0]);
}

// Qual forma um monstro selvagem tem num certo nível
export function formaPorNivel(el, nivel) {
  const estagio = NIVEIS_EVOLUCAO.filter((n) => nivel >= n).length;
  return LINHAS[el].formas[estagio][0];
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
export const BONUS_ARENA = { favorecido: 1.25, velFavorecido: 1.1, prejudicado: 0.8, periodo: 1.15 };

// Modificadores que a arena (e o dia/noite) dão a um elemento
export function modificadorArena(zona, elemento, periodo) {
  const a = ARENAS[zona] || ARENAS.campo;
  let dano = 1, vel = 1;
  const textos = [];
  if (a.favorece === elemento) { dano *= BONUS_ARENA.favorecido; vel *= BONUS_ARENA.velFavorecido; textos.push({ t: 'Arena +25%', bom: true }); }
  else if (a.favorece && ELEMENTOS[a.favorece].forteContra.includes(elemento)) { dano *= BONUS_ARENA.prejudicado; textos.push({ t: 'Arena −20%', bom: false }); }
  const doPeriodo = periodo === 'dia' ? ['sol', 'luz'] : ['lua', 'trevas'];
  if (doPeriodo.includes(elemento)) { dano *= BONUS_ARENA.periodo; textos.push({ t: (periodo === 'dia' ? 'Dia' : 'Noite') + ' +15%', bom: true }); }
  return { dano, vel, textos };
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

// Chance de captura: maior quando o monstro está com pouca vida
export function chanceCaptura(monstro) {
  const esp = ESPECIES[monstro.especie];
  const fracVida = monstro.hp / statsDe(monstro.especie, monstro.nivel).hpMax;
  const c = esp.captura * (1.7 - 1.5 * fracVida);
  return Math.min(0.95, Math.max(0.05, c));
}
