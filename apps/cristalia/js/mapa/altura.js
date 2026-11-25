// =============================================================
// ALTURA DO CHÃO (o que todo o jogo usa: jogador, monstros, câmera, casa...)
// O chão desenhado é feito de triângulos numa grade de pontos
// (tamChunk / divisoes metros entre eles). alturaEm(x, z) devolve a altura
// EXATA desses triângulos: assim nada flutua nem afunda no chão desenhado.
// A altura de cada ponto da grade é calculada uma vez e guardada.
// =============================================================
import { CONFIG_MAPA } from './config.js';
import { alturaBase, biomaEm, RAIO_MUNDO, NIVEL_AGUA, FUNDO_BLOQUEIO } from './gerador.js';
import { alturaDungeons, foraDungeons } from '../dungeon.js';

export const ESPACO = CONFIG_MAPA.tamChunk / CONFIG_MAPA.divisoes; // metros entre os pontos da grade
const cache = new Map();

// Altura "contínua": gerador + dungeons + a borda do mapa que sobe
function alturaContinua(x, z) {
  let h = alturaDungeons(x, z, alturaBase(x, z));
  const fora = Math.min(Math.hypot(x, z) - (RAIO_MUNDO - 6), foraDungeons(x, z));
  if (fora > 0) h += Math.min(18, fora * 0.9);
  return h;
}

// Altura de um ponto da grade (i, j) = (x / ESPACO, z / ESPACO)
export function alturaVertice(i, j) {
  const k = (i + 32768) * 65536 + (j + 32768);
  let h = cache.get(k);
  if (h === undefined) {
    h = alturaContinua(i * ESPACO, j * ESPACO);
    if (cache.size > 300000) cache.clear(); // nunca deveria chegar aqui (o mapa inteiro tem ~100 mil pontos)
    cache.set(k, h);
  }
  return h;
}

// Altura do chão em qualquer ponto (igual aos triângulos desenhados)
export function alturaEm(x, z) {
  const gx = x / ESPACO, gz = z / ESPACO, i = Math.floor(gx), j = Math.floor(gz), u = gx - i, v = gz - j;
  if (u + v <= 1) {
    const h00 = alturaVertice(i, j);
    return h00 + (alturaVertice(i + 1, j) - h00) * u + (alturaVertice(i, j + 1) - h00) * v;
  }
  const h11 = alturaVertice(i + 1, j + 1);
  return h11 + (alturaVertice(i, j + 1) - h11) * (1 - u) + (alturaVertice(i + 1, j) - h11) * (1 - v);
}

// Não dá para andar aqui? (lago fundo ou lava; rios rasos dá para atravessar)
export function bloqueadoEm(x, z) {
  const h = alturaEm(x, z);
  if (h >= NIVEL_AGUA + 0.05) return false;
  if (foraDungeons(x, z) < 6) return false; // dentro das dungeons quem manda é a dungeon
  if (h < FUNDO_BLOQUEIO) return true;
  return biomaEm(x, z) === 'fogo'; // lava, mesmo rasa
}

// Quantos pontos já foram calculados (para testes)
export function tamanhoCache() { return cache.size; }
