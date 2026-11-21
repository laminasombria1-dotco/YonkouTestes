// =============================================================
// GRADE DE OBSTÁCULOS
// Guarda os obstáculos (árvores, pedras, casa, peças das dungeons...)
// separados em quadradinhos de 8 m. Para saber se algo bate, o jogo só olha
// os quadradinhos em volta, em vez de todos os obstáculos do mapa.
// =============================================================
export class Grade {
  constructor(cel = 8) { this.cel = cel; this.mapa = new Map(); this.rMax = 1; this.total = 0; }
  chave(i, j) { return (i + 4096) * 8192 + (j + 4096); }
  add(o) {
    const k = this.chave(Math.floor(o.x / this.cel), Math.floor(o.z / this.cel));
    let a = this.mapa.get(k);
    if (!a) this.mapa.set(k, (a = []));
    a.push(o);
    o._k = k;
    if (o.r > this.rMax) this.rMax = o.r;
    this.total++;
  }
  remover(o) {
    const a = this.mapa.get(o._k);
    const i = a ? a.indexOf(o) : -1;
    if (i < 0) return;
    a[i] = a[a.length - 1];
    a.pop();
    if (!a.length) this.mapa.delete(o._k);
    this.total--;
  }
  // Chama fn(o) para cada obstáculo que pode tocar o círculo (x, z, r).
  // Se fn devolver true, para e devolve true.
  cada(x, z, r, fn) {
    const R = r + this.rMax, c = this.cel;
    const i0 = Math.floor((x - R) / c), i1 = Math.floor((x + R) / c);
    const j0 = Math.floor((z - R) / c), j1 = Math.floor((z + R) / c);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const a = this.mapa.get(this.chave(i, j));
      if (a) for (let k = 0; k < a.length; k++) if (fn(a[k]) === true) return true;
    }
    return false;
  }
}

// Lista dos obstáculos fixos (fonte, casa, dungeons). Funciona como uma lista comum
// (as dungeons fazem push e percorrem), mas também coloca cada um na grade.
export class ListaObstaculos extends Array {
  static get [Symbol.species]() { return Array; }
  ligar(grade) { this.grade = grade; return this; }
  push(...itens) {
    for (const o of itens) { o.fixo = true; this.grade?.add(o); }
    return super.push(...itens);
  }
  tirar(o) {
    const i = this.indexOf(o);
    if (i >= 0) this.splice(i, 1);
    this.grade?.remover(o);
  }
}
