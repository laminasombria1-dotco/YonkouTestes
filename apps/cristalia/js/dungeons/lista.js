// =============================================================
// DUNGEONS (mundo novo, passo 5): os números e os nomes
// Dungeons são MAIS FÁCEIS que as masmorras: lugares isolados (área separada, como
// as masmorras) com 2 ou 3 grupos de monstros e o REI DA DUNGEON (o mais forte).
// Todos são capturáveis (o Rei nunca vem na forma final).
//  - 3 dungeons ativas por bioma, cada uma num dos 6 lugares do bioma (lugares.js)
//    e com uma das 6 variações do guia do Lâmina (a arte e as salas).
//  - Venceu o Rei: depois de 2 horas de jogo ela reseta: muda de lugar, de variação,
//    sorteia de novo os grupos (2 ou 3) e o Rei, e precisa ser descoberta de novo.
//  - Fica salvo na conta e na nuvem: estado.dungeons.
// Os desenhos de cada variação ficam um arquivo cada (ex.: arq-arcos.js).
// =============================================================
import { MASMORRAS_NOVAS } from '../dados.js';
import { ARQ_ARCOS } from './arq-arcos.js';
import { ARQ_FAROL } from './arq-farol.js';
import { ARQ_GALEOES } from './arq-galeoes.js';
import { ARQ_SANTUARIO } from './arq-santuario.js';
import { ARQ_CALDEIRA } from './arq-caldeira.js';
import { ARQ_MANGUE } from './arq-mangue.js';
import { VULCAO } from './vulcao.js';
import { DESERTO } from './deserto.js';
import { FLORESTA } from './floresta.js';
import { GELO } from './gelo.js';

export const DUNGEON = {
  vagas: 3,                 // dungeons ativas por bioma
  reset: 2 * 60 * 60,       // 2 horas de tempo de jogo depois de vencer o Rei
  descobrir: 25,            // a essa distância da entrada você "descobre" a dungeon
  origem: { x: 1800, z: 2600 }, // onde a área separada é montada (longe do mapa e das masmorras)
  extraGrupo: 1,            // cada grupo seguinte vem +1 nível
  // prêmio do Rei (decisão do Lâmina): 1 Cristal Forte, 20% de um Supremo, 80 + 10 de ouro por
  // nível da sua equipe e a sorte de Galho Raro e Asa do Anjo (DROPS.reiDungeon, bolsa.js)
  premio: { forte: 1, chanceSupremo: 0.2, ouroBase: 80, ouroPorNivel: 10 },
};

// Os biomas que já têm dungeons (as 6 variações prontas). Quem aparece nos grupos
// e quem pode ser o Rei (só linhas que evoluem: o Rei vem evoluído, nunca na forma final).
export const BIOMAS_DUNGEON = {
  agua: {
    nome: 'Arquipélago', zona: 'agua', cor: '#5fe0ff',
    aparicoes: MASMORRAS_NOVAS.templo.aparicoes,
    rei: [['L:agua', 6], ['aquaraia', 3], ['L:aguaFogo', 1]],
    variacoes: ['arcos', 'farol', 'galeoes', 'santuario', 'caldeira', 'mangue'],
  },
  fogo: {
    nome: 'Vulcânico', zona: 'fogo', cor: '#ff7a3a',
    aparicoes: MASMORRAS_NOVAS.forja.aparicoes,
    rei: [['L:fogo', 6], ['vulcarapa', 3], ['L:aguaFogo', 1], ['L:fogoPlanta', 1]],
    variacoes: ['forjaCorrentes', 'vitriol', 'obsidiana', 'pinaculos', 'necropole', 'geiseres'],
  },
  terra: {
    nome: 'Deserto', zona: 'terra', cor: '#ffd36b',
    aparicoes: MASMORRAS_NOVAS.mina.aparicoes,
    rei: [['L:terra', 7], ['L:terraRaio', 2], ['L:sol', 1]],
    variacoes: ['espelho', 'hipogeu', 'ampulheta', 'esfinges', 'cisterna', 'barcas'],
  },
  planta: {
    nome: 'Floresta', zona: 'planta', cor: '#7dffa0',
    aparicoes: MASMORRAS_NOVAS.pantano.aparicoes,
    rei: [['L:planta', 6], ['espinhal', 3], ['L:fogoPlanta', 1]],
    variacoes: ['catedral', 'observatorio', 'lanternas', 'arvoreMae', 'pontes', 'esporos'],
  },
  raio: {
    nome: 'Gelo', zona: 'raio', cor: '#8fe3ff',
    aparicoes: MASMORRAS_NOVAS.trovao.aparicoes,
    rei: [['L:raio', 7], ['L:terraRaio', 2], ['L:luz', 1]],
    variacoes: ['geleira', 'minaNorte', 'runico', 'termas', 'quebraGelo', 'vigia'],
  },
};

// As variações (o guia de conceito do Lâmina). fem/fimFem: feminino (para "na"/"no").
// etapas: o nome de cada sala com grupo (até 3); fim: a sala do Rei.
export const VARIACOES = {
  arcos: { bioma: 'agua', plano: ARQ_ARCOS, nome: 'Gruta dos Arcos de Maré', fem: true, fim: 'Lagoa do Teto Aberto', fimFem: true,
    etapas: ['Fenda da Maré Baixa', 'Salão dos Pilares de Calcário', 'Câmaras de Sifão'] },
  farol: { bioma: 'agua', plano: ARQ_FAROL, nome: 'Farol Submerso de Solis', fem: false, fim: 'Base do Recife Profundo', fimFem: true,
    etapas: ['Topo da Escadaria Quebrada', 'Galeria dos Prismas Salinos', 'Câmara da Lente Submersa'] },
  galeoes: { bioma: 'agua', plano: ARQ_GALEOES, nome: 'Cemitério dos Galeões de Coral', fem: false, fim: 'Câmara do Leme Cristalino', fimFem: true,
    etapas: ['Convés Inclinado da Proa', 'Porão dos Jardins de Esponja', 'Passarela das Âncoras Suspensas'] },
  santuario: { bioma: 'agua', plano: ARQ_SANTUARIO, nome: 'Santuário das Águas Bioluminescentes', fem: false, fim: 'Poço Estelar', fimFem: false,
    etapas: ['Cais das Lanternas Âmbar', 'Corredor das Marés Luminosas', 'Anfiteatro das Conchas Gigantes'] },
  caldeira: { bioma: 'agua', plano: ARQ_CALDEIRA, nome: 'Caldeira Verde da Ilha Alta', fem: true, fim: 'Mirante da Cratera Florido', fimFem: false,
    etapas: ['Garganta das Samambaias Gigantes', 'Terraços das Cachoeiras Gêmeas', 'Ponte Pênsil dos Bambuzais'] },
  mangue: { bioma: 'agua', plano: ARQ_MANGUE, nome: 'Labirinto do Manguezal Translúcido', fem: false, fim: 'Relicário da Maré Parada', fimFem: false,
    etapas: ['Portal das Raízes em Arco', 'Passarela dos Espelhos Rasos', 'Clareira das Árvores-Gaiola'] },

  // ---------- Vulcânico (vulcao.js) ----------
  forjaCorrentes: { bioma: 'fogo', plano: VULCAO.forjaCorrentes, nome: 'Forja Primordial das Correntes', fem: true, fim: 'Núcleo da Cascata Ígnea', fimFem: false,
    etapas: ['Aqueduto de Escória', 'Pátio das Bigornas Colossais', 'Galeria dos Foles de Bronze'] },
  vitriol: { bioma: 'fogo', plano: VULCAO.vitriol, nome: 'Bacia do Vitriol Esmeralda', fem: true, fim: 'Altar da Chama Fria-Verde', fimFem: false,
    etapas: ['Trilha das Fumarolas Amarelas', 'Travessia das Crostas Sulfurosas', 'Gruta dos Cristais Corrosivos'] },
  obsidiana: { bioma: 'fogo', plano: VULCAO.obsidiana, nome: 'Catedral de Obsidiana Espelhada', fem: true, fim: 'Santuário do Vidro-de-Fogo', fimFem: false,
    etapas: ['Boca do Tubo Vítreo', 'Nave dos Reflexos Infinitos', 'Abóbada das Agulhas Cantantes'] },
  pinaculos: { bioma: 'fogo', plano: VULCAO.pinaculos, nome: 'Pináculos do Basalto Partido', fem: false, fim: 'Coroa do Penhasco Fumegante', fimFem: true,
    etapas: ['Escadaria dos Degraus Hexagonais', 'Platô das Colunas Oscilantes', 'Ponte de Pedra-Pomes'] },
  necropole: { bioma: 'fogo', plano: VULCAO.necropole, nome: 'Necrópole das Cinzas Silenciosas', fem: true, fim: 'Câmara da Brasa Eterna', fimFem: true,
    etapas: ['Avenida das Estátuas Calcificadas', 'Pátio Subterrâneo Escavado', 'Arquivos de Pedra Vitrificada'] },
  geiseres: { bioma: 'fogo', plano: VULCAO.geiseres, nome: 'Garganta dos Gêiseres', fem: true, fim: 'Olho da Caldeira', fimFem: false,
    etapas: ['Beiral da Borda Partida', 'Rampa dos Gêiseres Rítmicos', 'Túnel de Resfriamento'] },

  // ---------- Deserto (deserto.js) ----------
  espelho: { bioma: 'terra', plano: DESERTO.espelho, nome: 'Pirâmide do Espelho Solar', fem: true, fim: 'Santuário do Pyramidion', fimFem: false,
    etapas: ['Rampa da Esfinge Partida', 'Corredor dos Dutos de Luz', 'Câmara dos Espelhos de Bronze'] },
  hipogeu: { bioma: 'terra', plano: DESERTO.hipogeu, nome: 'Hipogeu dos Escribas Azuis', fem: false, fim: 'Câmara do Sarcófago Vazio', fimFem: true,
    etapas: ['Escadaria Soterrada', 'Salão das Colunas de Papiro', 'Biblioteca dos Escribas'] },
  ampulheta: { bioma: 'terra', plano: DESERTO.ampulheta, nome: 'Templo da Ampulheta Seca', fem: false, fim: 'Câmara do Contrapeso Dourado', fimFem: true,
    etapas: ['Pátio das Colunas Inclinadas', 'Vestíbulo dos Funis de Pedra', 'Galeria da Areia Escorrente'] },
  esfinges: { bioma: 'terra', plano: DESERTO.esfinges, nome: 'Avenida das Esfinges Soterradas', fem: true, fim: 'Capela do Basalto Negro', fimFem: true,
    etapas: ['Portal dos Obeliscos Gêmeos', 'Passagem Escavada Sob a Duna', 'Pátio do Altar Rachado'] },
  cisterna: { bioma: 'terra', plano: DESERTO.cisterna, nome: 'Cisterna Secreta do Oásis', fem: true, fim: 'Cofre das Ânforas Seladas', fimFem: false,
    etapas: ['Poço em Espiral das Tamareiras', 'Aqueduto dos Arcos Turquesa', 'Câmara do Lótus Submerso'] },
  barcas: { bioma: 'terra', plano: DESERTO.barcas, nome: 'Doca das Barcas Solares', fem: true, fim: 'Salão do Horizonte de Cedro', fimFem: false,
    etapas: ['Antecâmara dos Selos de Calcário', 'Nave da Primeira Barca', 'Ponte das Cordas Antigas'] },

  // ---------- Floresta (floresta.js) ----------
  catedral: { bioma: 'planta', plano: FLORESTA.catedral, nome: 'Catedral das Cortinas de Âmbar', fem: true, fim: 'Altar do Bloco Dourado', fimFem: false,
    etapas: ['Arco das Raízes em Contraforte', 'Nave das Cortinas Translúcidas', 'Terraço dos Troncos Entrelaçados'] },
  observatorio: { bioma: 'planta', plano: FLORESTA.observatorio, nome: 'Observatório dos Freixos Cantantes', fem: false, fim: 'Cúpula dos Canais Acústicos', fimFem: true,
    etapas: ['Degraus de Ardósia e Musgo', 'Anel dos Tubos de Vento', 'Passarela Suspensa de Quartzo'] },
  lanternas: { bioma: 'planta', plano: FLORESTA.lanternas, nome: 'Pântano das Lanternas-do-Brejo', fem: false, fim: 'Gruta das Raízes Submersas', fimFem: true,
    etapas: ['Margem da Turfa Escura', 'Passarela dos Salgueiros-Tanino', 'Ilhota das Lanternas Azuis'] },
  arvoreMae: { bioma: 'planta', plano: FLORESTA.arvoreMae, nome: 'Torre Oca da Árvore-Mãe', fem: true, fim: 'Ninho da Copa Solar', fimFem: false,
    etapas: ['Base das Raízes Escavadas', 'Espiral da Seiva Endurecida', 'Câmaras dos Galhos Ocos'] },
  pontes: { bioma: 'planta', plano: FLORESTA.pontes, nome: 'Garganta das Pontes Vivas', fem: true, fim: 'Santuário da Cascata de Resina', fimFem: false,
    etapas: ['Trilha da Encosta Esmeralda', 'Primeira Ponte de Raízes', 'Cruzamento dos Cipós-Lira'] },
  esporos: { bioma: 'planta', plano: FLORESTA.esporos, nome: 'Jardim dos Esporos Dourados', fem: false, fim: 'Coração da Névoa Luminosa', fimFem: false,
    etapas: ['Túnel de Samambaias-Espelho', 'Prado dos Fungos-Tambor', 'Degraus de Orelha-de-Prata'] },

  // ---------- Gelo (gelo.js) ----------
  geleira: { bioma: 'raio', plano: GELO.geleira, nome: 'Coração da Geleira Fendida', fem: false, fim: 'Câmara do Sol Refratado', fimFem: true,
    etapas: ['Fenda Estreita da Superfície', 'Galeria dos Arcos Translúcidos', 'Ponte de Gelo Espesso'] },
  minaNorte: { bioma: 'raio', plano: GELO.minaNorte, nome: 'Mina Abandonada do Passo Norte', fem: true, fim: 'Veio do Cristal Ártico', fimFem: false,
    etapas: ['Pórtico das Estalactites', 'Túnel dos Trilhos Congelados', 'Poço dos Elevadores de Madeira'] },
  runico: { bioma: 'raio', plano: GELO.runico, nome: 'Templo Rúnico da Névoa Branca', fem: false, fim: 'Santuário do Monólito Central', fimFem: false,
    etapas: ['Escadaria Soterrada pelas Derivas', 'Avenida dos Obeliscos Rúnicos', 'Pátio do Vento Cortante'] },
  termas: { bioma: 'raio', plano: GELO.termas, nome: 'Termas Profundas de Vapor e Gelo', fem: true, fim: 'Domo de Vapor e Cristal', fimFem: false,
    etapas: ['Entrada da Bruma Quente', 'Terraços das Piscinas Turquesa', 'Passarela da Condensação'] },
  quebraGelo: { bioma: 'raio', plano: GELO.quebraGelo, nome: 'Casco do Quebra-Gelo Aprisionado', fem: false, fim: 'Câmara do Capitão Cristalizada', fimFem: true,
    etapas: ['Trilha de Gelo Rachado', 'Convés Principal Inclinado', 'Porão das Lanternas Apagadas'] },
  vigia: { bioma: 'raio', plano: GELO.vigia, nome: 'Torre de Vigia da Cordilheira', fem: true, fim: 'Mirante do Sino Gelado', fimFem: false,
    etapas: ['Base do Desfiladeiro Nevado', 'Ponte Pênsil Congelada', 'Salão da Lareira Fria'] },
};
