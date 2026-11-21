// =============================================================
// CONFIGURAÇÃO DO MAPA PROCEDURAL
// Tudo o que dá para ajustar no mapa fica aqui.
//  - O mapa é gerado a partir de uma SEMENTE (seed): a mesma semente
//    sempre dá o mesmo mapa. Todos os jogadores usam a mesma semente
//    (um mundo só para todos). O GM pode testar outra pela URL (?semente=123).
//  - O mundo é dividido em CHUNKS (quadrados de tamChunk metros). Só os
//    chunks perto do jogador ficam carregados; os longe são apagados da memória.
//  - QUALIDADES: perfis para celular fraco, médio e forte.
// =============================================================

export const CONFIG_MAPA = {
  semente: 20261121,      // seed do mundo (a mesma para todos os jogadores)
  raioMundo: 200,         // raio do mapa redondo, em metros
  tamChunk: 32,           // tamanho de cada chunk (m)
  divisoes: 12,           // quadrados do chão por lado do chunk (perto)
  divisoesLonge: 6,       // quadrados do chão por lado do chunk (longe: LOD)
  raioCampo: 40,          // tamanho do Campo no meio (onde fica a fonte)

  // Biomas em volta do Campo. A ordem em volta é sorteada pela semente.
  //  planta = Floresta, terra = Deserto, raio = Neve (Picos Nevados), fogo = Lava (Vulcão)
  biomas: {
    lista: ['planta', 'terra', 'raio', 'fogo'],
    quantidade: 4,        // 4 a 8 (com mais de 4, os biomas se repetem em volta)
    distanciaMin: 105,    // distância do centro de cada bioma até a fonte (m)
    distanciaMax: 140,
    tamanhoMin: 0.85,     // tamanho relativo de cada bioma (sorteado entre min e max)
    tamanhoMax: 1.25,
    tamanhoPorBioma: { planta: 1.1, terra: 1, raio: 1, fogo: 0.95 }, // distribuição: quem ocupa mais espaço
    torcao: 55,           // quanto as bordas dos biomas são onduladas (m)
    transicao: 18,        // largura da mistura entre dois biomas (m)
  },

  agua: {
    nivel: -0.55,         // altura da água (rios e lagos) e da lava
    rios: 0.04,           // largura dos rios (0 = sem rios)
  },

  // Quantos pontos (de 64 por chunk) ganham um objeto (árvore, pedra, cacto...)
  densidade: { campo: 0.12, planta: 0.42, terra: 0.15, raio: 0.3, fogo: 0.17 },
  orcamentoMs: 3,         // tempo máximo por quadro criando chunks (para não travar; sempre sai pelo menos 1)
};

// Perfis de qualidade (o jogador escolhe no menu de pausa)
//  raioChunks: quantos chunks em volta ficam carregados (distância de carregamento)
//  detalhe:    até quantos chunks de distância o chão e os objetos pequenos têm detalhe total (LOD)
//  nevoa:      distância de visão (m)
//  densidade:  multiplica a quantidade de objetos
//  pixel:      resolução máxima da tela (1 = mais leve)
//  efeitos:    os efeitos dos golpes (etapa 3.2), em js/arena/efeitos.js e nas batalhas:
//    taxa    = parte das partículas da Arena que sai (0,5 = metade)
//    tam     = as partículas que saem ficam maiores (para o golpe não parecer vazio com menos)
//    malhas  = parte dos pedacinhos 3D (lascas, gotas, folhas, brasas) e dos cacos que sai
//    galhos  = parte dos galhos de cada relâmpago
//    max     = quantas partículas podem existir ao mesmo tempo (as que brilham / as "sólidas")
//    luzes   = luzes de verdade nos clarões (iluminam monstros e chão; pesam em tudo o tempo todo)
export const QUALIDADES = {
  fraco: { nome: 'Fraco', raioChunks: 2, detalhe: 1, nevoa: 78, densidade: 0.6, pixel: 1,
    efeitos: { taxa: 0.45, tam: 1.25, malhas: 0.5, galhos: 0.5, max: 2500, solidas: 700, luzes: 0 } },
  medio: { nome: 'Médio', raioChunks: 3, detalhe: 1, nevoa: 108, densidade: 1, pixel: 1.5,
    efeitos: { taxa: 1, tam: 1, malhas: 1, galhos: 1, max: 6000, solidas: 1500, luzes: 0 } },
  forte: { nome: 'Forte', raioChunks: 4, detalhe: 2, nevoa: 138, densidade: 1.2, pixel: 1.75,
    efeitos: { taxa: 1, tam: 1, malhas: 1, galhos: 1, max: 6000, solidas: 1500, luzes: 2 } },
};
export const ORDEM_QUALIDADES = ['fraco', 'medio', 'forte'];
const CHAVE_QUALIDADE = 'runeclash-qualidade';

// Qualidade guardada no aparelho; na 1ª vez, escolhe pelo celular
export function lerQualidade() {
  try {
    const q = localStorage.getItem(CHAVE_QUALIDADE);
    if (QUALIDADES[q]) return q;
  } catch { /* sem armazenamento */ }
  const nucleos = navigator.hardwareConcurrency || 4, memoria = navigator.deviceMemory || 4;
  return nucleos <= 4 || memoria <= 3 ? 'fraco' : 'medio';
}
export function gravarQualidade(q) {
  try { localStorage.setItem(CHAVE_QUALIDADE, q); } catch { /* sem armazenamento */ }
}
