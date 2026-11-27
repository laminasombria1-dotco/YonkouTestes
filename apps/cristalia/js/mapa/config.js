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
  raioMundo: 390,         // raio do mapa redondo, em metros (mundo novo: 5 biomas de ~300 m em volta do Reino)
  versaoMapa: 2,          // sobe quando o desenho do mapa muda (o jogo salvo de outro mapa acorda no castelo)
  tamChunk: 32,           // tamanho de cada chunk (m)
  divisoes: 12,           // quadrados do chão por lado do chunk (perto)
  divisoesLonge: 6,       // quadrados do chão por lado do chunk (longe: LOD)
  raioReino: 100,         // o Reino fica no meio do mapa (platô redondo com muralha)
  anelTranquilo: 45,      // depois dos portões, esses metros de cada bioma só têm monstros fracos (sem grupos)

  // Biomas em fatias em volta do Reino, na ORDEM FIXA abaixo (cada um ao lado de vizinhos que combinam):
  // Gelo > Floresta > Deserto > Vulcânico > Água > (volta ao Gelo).
  //  raio = Gelo (Picos Nevados), planta = Floresta, terra = Deserto, fogo = Vulcânico, agua = Arquipélago
  biomas: {
    lista: ['raio', 'planta', 'terra', 'fogo', 'agua'],
    angulo0: -90,         // o 1º bioma (Gelo) fica para o "norte" (graus; -90 = -z)
    distancia: 250,       // distância do centro de cada bioma até o meio do Reino (m)
    tamanhoPorBioma: { raio: 1, planta: 1, terra: 1, fogo: 1, agua: 1 }, // quem ocupa mais espaço
    torcao: 60,           // quanto as bordas dos biomas são onduladas (m)
    transicao: 22,        // largura da mistura entre dois biomas (m)
  },

  agua: {
    nivel: -0.55,         // altura da água (rios e lagos) e da lava
    rios: 0.04,           // largura dos rios (0 = sem rios)
  },

  // Quantos pontos (de 64 por chunk) ganham um objeto (árvore, pedra, cacto...)
  densidade: { campo: 0.12, planta: 0.3, terra: 0.15, raio: 0.3, fogo: 0.17, agua: 0.16 },
  orcamentoMs: 3,         // tempo máximo por quadro criando chunks (para não travar; sempre sai pelo menos 1)
};

// Perfis de qualidade (o jogador escolhe no menu de pausa)
//  raioChunks: quantos chunks em volta ficam carregados (distância de carregamento)
//  detalhe:    até quantos chunks de distância o chão e os objetos pequenos têm detalhe total (LOD)
//  nevoa:      distância de visão (m)
//  densidade:  multiplica a quantidade de objetos
//  pixel:      resolução máxima da tela (1 = mais leve)
export const QUALIDADES = {
  fraco: { nome: 'Fraco', raioChunks: 2, detalhe: 1, nevoa: 78, densidade: 0.6, pixel: 1 },
  medio: { nome: 'Médio', raioChunks: 3, detalhe: 1, nevoa: 108, densidade: 1, pixel: 1.5 },
  forte: { nome: 'Forte', raioChunks: 4, detalhe: 2, nevoa: 138, densidade: 1.2, pixel: 1.75 },
};
export const ORDEM_QUALIDADES = ['fraco', 'medio', 'forte'];
const CHAVE_QUALIDADE = 'cristalia-qualidade';

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
