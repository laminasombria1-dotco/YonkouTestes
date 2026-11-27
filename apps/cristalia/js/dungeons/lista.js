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

export const DUNGEON = {
  vagas: 3,                 // dungeons ativas por bioma
  reset: 2 * 60 * 60,       // 2 horas de tempo de jogo depois de vencer o Rei
  descobrir: 25,            // a essa distância da entrada você "descobre" a dungeon
  origem: { x: 1800, z: 2600 }, // onde a área separada é montada (longe do mapa e das masmorras)
  extraGrupo: 1,            // cada grupo seguinte vem +1 nível
  extraRei: 4,              // o Rei: o nível do líder do último grupo + 4
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
};
