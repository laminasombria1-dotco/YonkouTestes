// =============================================================
// PEÇAS DO BLENDER DA ARENA DAS BRASAS (trazidas para o Runeclash na etapa 0.2)
// As 66 peças (cenário, corpo do Invocador e chefes) ficam em js/arena/pecas_blender.js,
// gerado pelo Blender: apps/runeclash/blender/exportar_pecas.py (veja blender/README.md).
// Ainda não está ligado em nenhuma parte do jogo: é material para as próximas etapas.
//
// peca(nome, cores)  -> uma malha solta (personagens, objetos que se mexem)
// new LotePecas().por(nome, matriz, cores) ... .malhas()  -> junta o cenario parado em poucas malhas (uma por material),
//   o que deixa o jogo leve no celular. (Na Arena se chamava "Lote"; mudou de nome para nao
//   confundir com a Lote do js/dungeon.js, que funciona de outro jeito.)
// colocar(x, y, z, giro, escala) -> a matriz de posicao que o LotePecas.por() pede.
// nomesPecas() -> a lista com o nome de todas as pecas.
// =============================================================
// cores = { nomeDoMaterial: 0xRRGGBB } troca a cor de um material (ex.: a pedra muda com o tema da arena).
// Materiais "luz..." brilham sozinhos; "gelo..." ficam translucidos.
// Pecas com claridade por vertice (k, chefes) usam vertexColors: a cor do material e multiplicada por ela (sombra e textura).
import * as THREE from 'three';
import { PECAS } from './pecas_blender.js';

const deB64 = typeof atob === 'function' ? atob : s => Buffer.from(s, 'base64').toString('binary');
function bytes(s) {
  const t = deB64(s),
    b = new Uint8Array(t.length);
  for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i);
  return b.buffer;
}

const cache = {};
// dados crus de uma peca: posicoes, indices e grupos por material
function dados(nome) {
  if (cache[nome]) return cache[nome];
  const p = PECAS[nome];
  if (!p) return null;
  const k = p.k ? new Uint8Array(bytes(p.k)) : null,
    cor = k ? new Uint8Array(k.length * 3) : null;
  if (k) for (let i = 0; i < k.length; i++) cor[i * 3] = cor[i * 3 + 1] = cor[i * 3 + 2] = k[i];
  return (cache[nome] = {
    pos: new Float32Array(bytes(p.v)),
    idx: p.i32 ? new Uint32Array(bytes(p.i)) : new Uint16Array(bytes(p.i)),
    g: p.g,
    m: p.m,
    c: p.c,
    cor,
  });
}
export const temPeca = nome => !!PECAS[nome];
export const nomesPecas = () => Object.keys(PECAS);

// brilho proprio de alguns materiais translucidos (membrana das asas e cristais da Serpe, gelo e cristais da Geada parecem acesos por dentro, como nas referencias)
const BRILHO_GELO = { gelo_membrana: 0x3a72a8, gelo_crista: 0x2a6a8c, gelo_g: 0x3c6e96, gelo_g2: 0x4f86b0 };
export function materialPeca(slot, cor, vc = false) {
  if (slot.startsWith('luz')) return new THREE.MeshBasicMaterial({ color: cor });
  if (slot.startsWith('gelo'))
    return new THREE.MeshLambertMaterial({
      color: cor,
      flatShading: true,
      transparent: true,
      opacity: 0.86,
      emissive: BRILHO_GELO[slot] ?? 0x123a55,
      vertexColors: vc,
    });
  return new THREE.MeshLambertMaterial({ color: cor, flatShading: true, vertexColors: vc });
}

// geometria compartilhada de uma peca (todas as copias usam a mesma)
const geos = {};
export function geometriaPeca(nome) {
  if (geos[nome]) return geos[nome];
  const d = dados(nome);
  if (!d) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(d.pos, 3));
  g.setIndex(new THREE.BufferAttribute(d.idx, 1));
  if (d.cor) g.setAttribute('color', new THREE.BufferAttribute(d.cor, 3, true));
  for (const [ini, qtd, mi] of d.g) g.addGroup(ini, qtd, mi);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  g.userData.fixa = true;
  return (geos[nome] = g);
}
// um pedaco da peca com um material so (a mesma lista de posicoes, so os triangulos daquele material)
const partes = {};
function geometriaParte(nome, gi) {
  const k = nome + '#' + gi;
  if (partes[k]) return partes[k];
  const d = dados(nome),
    [ini, qtd] = d.g[gi],
    base = geometriaPeca(nome),
    g = new THREE.BufferGeometry();
  g.setAttribute('position', base.getAttribute('position'));
  g.setAttribute('normal', base.getAttribute('normal'));
  if (d.cor) g.setAttribute('color', base.getAttribute('color'));
  g.setIndex(new THREE.BufferAttribute(d.idx.slice(ini, ini + qtd), 1));
  g.computeBoundingSphere();
  g.userData.fixa = true;
  return (partes[k] = g);
}
// peca pronta: um grupo com uma malha por material (o resto do jogo espera um material por malha),
// com as cores trocadas pelo mapa "cores"
export function peca(nome, cores = {}) {
  const d = dados(nome);
  if (!d) return null;
  const grupo = new THREE.Group();
  grupo.name = nome;
  d.g.forEach(([, , mi], gi) => {
    const s = d.m[mi],
      m = materialPeca(s, cores[s] ?? d.c[mi], !!d.cor);
    m.userData.slot = s;
    const malha = new THREE.Mesh(geometriaParte(nome, gi), m);
    malha.name = nome + ':' + s;
    grupo.add(malha);
  });
  return grupo;
}

// Junta muitas copias de pecas paradas em uma malha por material+cor.
export class LotePecas {
  constructor() {
    this.partes = new Map();
  }
  // m = THREE.Matrix4 com posicao/rotacao/escala da copia
  por(nome, m, cores = {}) {
    const d = dados(nome);
    if (!d) return false;
    const v = new THREE.Vector3();
    for (const [ini, qtd, mi] of d.g) {
      const slot = d.m[mi],
        cor = cores[slot] ?? d.c[mi],
        chave = slot + '|' + cor;
      let p = this.partes.get(chave);
      if (!p) this.partes.set(chave, (p = { slot, cor, pos: [] }));
      for (let k = ini; k < ini + qtd; k++) {
        const i = d.idx[k];
        v.set(d.pos[i * 3], d.pos[i * 3 + 1], d.pos[i * 3 + 2]).applyMatrix4(m);
        p.pos.push(v.x, v.y, v.z);
      }
    }
    return true;
  }
  malhas() {
    const lista = [];
    for (const p of this.partes.values()) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(p.pos, 3));
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, materialPeca(p.slot, p.cor));
      m.name = 'lote_' + p.slot;
      lista.push(m);
    }
    this.partes.clear();
    return lista;
  }
}
// matriz de uma copia: posicao, giro no eixo vertical, inclinacao e escala
export function colocar(x, y, z, giro = 0, esc = 1, inclX = 0, inclZ = 0) {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(inclX, giro, inclZ, 'YXZ')),
    typeof esc === 'number' ? new THREE.Vector3(esc, esc, esc) : esc,
  );
}
