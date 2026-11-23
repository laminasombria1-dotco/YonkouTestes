// =============================================================
// CONTROLES
// Toque: lado ESQUERDO da tela = joystick de andar;
//        lado DIREITO (ou o controle de câmera acima das habilidades) = girar a câmera.
//        Dois toques rápidos no controle de câmera: volta a câmera para trás do personagem.
//        + botões na tela (qualquer elemento com data-acao="...").
// Mouse: arrastar gira a câmera; a rodinha aproxima e afasta.
// Teclado: WASD/setas andam, J K L (ou 1 2 3) golpes, Espaço esquiva,
//          C cristal, V próximo cristal, Q trocar, F fugir,
//          R invocar/guardar o monstro, T controlar o monstro/voltar ao treinador.
// O andar é relativo à câmera: "para cima" anda para onde a câmera olha.
// =============================================================

const TECLAS_MOV = {
  KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0],
};
// Sensibilidade da câmera (radianos por pixel arrastado)
const SENS_TOQUE = 0.0065, SENS_MOUSE = 0.005;

const TECLAS_ACAO = {
  KeyJ: 'golpe0', Digit1: 'golpe0', KeyK: 'golpe1', Digit2: 'golpe1', KeyL: 'golpe2', Digit3: 'golpe2',
  Space: 'esquiva', ShiftLeft: 'esquiva', KeyC: 'cristal', KeyV: 'proxCristal', KeyQ: 'trocar', KeyF: 'fugir',
  KeyR: 'pet', KeyT: 'controlar', // monstro invocado: invocar/guardar e controlar/voltar
  KeyP: 'pocao', KeyB: 'bolsa', // poções (na batalha) e a bolsa (no mapa)
};

// O foco está num campo de texto? (aí W, A, S, D, C, Espaço... são letras, não atalhos)
const digitando = (e) => !!e.target?.closest?.('input, select, textarea');

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
    // câmera: um dedo (ou o mouse) por vez; o giro acumulado é lido pelo mapa/batalha a cada quadro
    this.cam = { id: null, x: 0, y: 0, ox: 0, oy: 0 };
    this.giro = { x: 0, y: 0, zoom: 0, centralizar: false };
    this.ultimoToqueCam = 0;
    this.pad = document.getElementById('camera-pad');
    this.padManete = this.pad.querySelector('.manete');
    this.pad.addEventListener('pointerdown', (e) => { e.preventDefault(); this.inicioCamera(e, true); });

    palco.addEventListener('pointerdown', (e) => this.inicio(e));
    palco.addEventListener('contextmenu', (e) => e.preventDefault());
    palco.addEventListener('wheel', (e) => { if (!this.el.hidden) { this.giro.zoom += Math.sign(e.deltaY) * 0.08; e.preventDefault(); } }, { passive: false });
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
      if (digitando(e)) return; // escrevendo num campo (login, painel GM): as teclas são letras, não atalhos
      if (TECLAS_MOV[e.code]) { this.teclas.add(e.code); e.preventDefault(); }
      const a = TECLAS_ACAO[e.code];
      if (a) { e.preventDefault(); if (!e.repeat) this.fila.push(a); }
    });
    window.addEventListener('keyup', (e) => this.teclas.delete(e.code));
    window.addEventListener('blur', () => { this.teclas.clear(); this.soltar(); this.soltarCamera(); });
    this.repousar();
  }

  posLocal(e) {
    const r = this.app.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  inicio(e) {
    if (this.el.hidden) return;
    const p = this.posLocal(e);
    // mouse: arrastar sempre gira a câmera (no PC, anda-se com o teclado)
    // toque: lado direito da tela gira a câmera, lado esquerdo é o joystick
    if (e.pointerType === 'mouse' || p.x > this.app.clientWidth * 0.5) { this.inicioCamera(e, false); return; }
    if (this.joy.id !== null) return;
    this.joy = { id: e.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0 };
    this.el.classList.add('ativo');
    this.desenhar();
  }

  inicioCamera(e, noPad) {
    if (this.cam.id !== null || this.el.hidden) return;
    if (noPad) { // dois toques rápidos no controle: câmera volta para trás do personagem
      const agora = performance.now();
      if (agora - this.ultimoToqueCam < 300) this.giro.centralizar = true;
      this.ultimoToqueCam = agora;
    }
    this.cam = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY, sens: e.pointerType === 'mouse' ? SENS_MOUSE : SENS_TOQUE };
    this.pad.classList.add('ativo');
  }

  mover(e) {
    if (e.pointerId === this.cam.id) {
      this.giro.x += (e.clientX - this.cam.x) * this.cam.sens;
      this.giro.y += (e.clientY - this.cam.y) * this.cam.sens;
      this.cam.x = e.clientX; this.cam.y = e.clientY;
      // a bolinha do controle acompanha o dedo (só para mostrar que está girando)
      let dx = e.clientX - this.cam.ox, dy = e.clientY - this.cam.oy;
      const l = Math.hypot(dx, dy), max = 22;
      if (l > max) { dx = dx / l * max; dy = dy / l * max; }
      this.padManete.style.transform = `translate(${dx}px, ${dy}px)`;
      return;
    }
    if (e.pointerId !== this.joy.id) return;
    const p = this.posLocal(e);
    this.joy.dx = p.x - this.joy.ox;
    this.joy.dy = p.y - this.joy.oy;
    this.desenhar();
  }

  fim(e) {
    if (e.pointerId === this.joy.id) this.soltar();
    if (e.pointerId === this.cam.id) this.soltarCamera();
  }

  soltarCamera() {
    this.cam.id = null;
    this.pad.classList.remove('ativo');
    this.padManete.style.transform = '';
  }

  // Giro da câmera desde o último quadro (o mapa e a batalha chamam uma vez por quadro)
  consumirGiro() {
    const g = { ...this.giro };
    this.giro.x = this.giro.y = this.giro.zoom = 0;
    this.giro.centralizar = false;
    return g;
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
    this.pad.hidden = !visivel;
    if (!visivel) { this.soltar(); this.soltarCamera(); }
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

  // O mesmo vetor, mas virado para o lado que a câmera olha (yaw = giro da câmera em volta do personagem)
  vetorDaCamera(yaw) {
    const { x, z } = this.vetor();
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return { x: x * c + z * s, z: -x * s + z * c };
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
