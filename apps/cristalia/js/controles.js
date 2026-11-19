// =============================================================
// CONTROLES
// Toque: joystick virtual (encoste o dedo em qualquer lugar livre da tela e arraste)
//        + botões na tela (qualquer elemento com data-acao="...").
// Teclado: WASD/setas andam, J K L (ou 1 2 3) golpes, Espaço esquiva,
//          C cristal, Q trocar, F fugir.
// =============================================================

const TECLAS_MOV = {
  KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0],
};
const TECLAS_ACAO = {
  KeyJ: 'golpe0', Digit1: 'golpe0', KeyK: 'golpe1', Digit2: 'golpe1', KeyL: 'golpe2', Digit3: 'golpe2',
  Space: 'esquiva', ShiftLeft: 'esquiva', KeyC: 'cristal', KeyV: 'tipoCristal', KeyQ: 'trocar', KeyF: 'fugir',
};

export class Controles {
  constructor(app, palco) {
    this.app = app;
    this.fila = [];
    this.teclas = new Set();
    this.joy = { id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
    this.raio = 55;
    this.el = document.getElementById('joystick');
    this.base = this.el.querySelector('.base');
    this.manete = this.el.querySelector('.manete');

    palco.addEventListener('pointerdown', (e) => this.inicio(e));
    window.addEventListener('pointermove', (e) => this.mover(e));
    window.addEventListener('pointerup', (e) => this.fim(e));
    window.addEventListener('pointercancel', (e) => this.fim(e));

    // Botões de ação reagem no "apertar" (mais rápido que o clique no celular)
    document.addEventListener('pointerdown', (e) => {
      const b = e.target.closest?.('[data-acao]');
      if (!b || b.disabled) return;
      e.preventDefault();
      this.fila.push(b.dataset.acao);
      b.classList.add('apertado');
      setTimeout(() => b.classList.remove('apertado'), 130);
    });

    window.addEventListener('keydown', (e) => {
      if (TECLAS_MOV[e.code]) { this.teclas.add(e.code); e.preventDefault(); }
      const a = TECLAS_ACAO[e.code];
      if (a) { e.preventDefault(); if (!e.repeat) this.fila.push(a); }
    });
    window.addEventListener('keyup', (e) => this.teclas.delete(e.code));
    window.addEventListener('blur', () => { this.teclas.clear(); this.soltar(); });
    this.repousar();
  }

  posLocal(e) {
    const r = this.app.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  inicio(e) {
    if (this.joy.id !== null || this.el.hidden) return;
    const p = this.posLocal(e);
    this.joy = { id: e.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0 };
    this.el.classList.add('ativo');
    this.desenhar();
  }

  mover(e) {
    if (e.pointerId !== this.joy.id) return;
    const p = this.posLocal(e);
    this.joy.dx = p.x - this.joy.ox;
    this.joy.dy = p.y - this.joy.oy;
    this.desenhar();
  }

  fim(e) {
    if (e.pointerId === this.joy.id) this.soltar();
  }

  soltar() {
    this.joy.id = null;
    this.joy.dx = this.joy.dy = 0;
    this.el.classList.remove('ativo');
    this.repousar();
  }

  repousar() {
    const h = this.app.clientHeight || window.innerHeight;
    this.joy.ox = 96;
    this.joy.oy = h - 96;
    this.desenhar();
  }

  desenhar() {
    let { dx, dy } = this.joy;
    const l = Math.hypot(dx, dy);
    if (l > this.raio) { dx = (dx / l) * this.raio; dy = (dy / l) * this.raio; }
    this.base.style.transform = `translate(${this.joy.ox}px, ${this.joy.oy}px)`;
    this.manete.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  mostrar(visivel) {
    this.el.hidden = !visivel;
    if (!visivel) this.soltar();
    else this.repousar();
  }

  // Vetor de movimento (x = direita, z = para baixo na tela), comprimento máximo 1
  vetor() {
    let x = 0, z = 0;
    for (const k of this.teclas) {
      const v = TECLAS_MOV[k];
      if (v) { x += v[0]; z += v[1]; }
    }
    if (this.joy.id !== null) {
      let jx = this.joy.dx / this.raio, jz = this.joy.dy / this.raio;
      const l = Math.hypot(jx, jz);
      if (l > 1) { jx /= l; jz /= l; }
      if (l > 0.18) { x += jx; z += jz; }
    }
    const l = Math.hypot(x, z);
    if (l > 1) { x /= l; z /= l; }
    return { x, z };
  }

  consumir(acao) {
    const i = this.fila.indexOf(acao);
    if (i < 0) return false;
    this.fila.splice(i, 1);
    return true;
  }

  fimDoQuadro() {
    this.fila.length = 0;
  }
}
