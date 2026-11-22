// =============================================================
// TELA DE TECLAS (menu de pausa → Teclas)
// Cada ação do teclado (andar, os 3 golpes, esquiva, pedra, trocar, fugir, monstro invocado)
// tem 2 teclas. Toque numa delas e aperte a tecla nova:
//   Esc = desiste · Backspace ou Delete = deixa a vaga vazia.
// Se a tecla nova já era de outra ação, ela sai de lá (o jogo avisa).
// Fica guardado neste aparelho (chave "runeclash-teclas"); as regras estão em js/controles.js.
// =============================================================
import { ACOES_TECLADO, TECLAS_PROIBIDAS } from './controles.js';

const NOMES = {
  Space: 'Espaço', ShiftLeft: 'Shift esq.', ShiftRight: 'Shift dir.', ControlLeft: 'Ctrl esq.', ControlRight: 'Ctrl dir.',
  AltLeft: 'Alt', AltRight: 'Alt Gr', Enter: 'Enter', NumpadEnter: 'Enter (num.)', Backquote: "'", Minus: '-', Equal: '=',
  BracketLeft: '´', BracketRight: '[', Backslash: ']', Semicolon: 'Ç', Quote: '~', Comma: ',', Period: '.', Slash: ';',
  IntlBackslash: '\\', IntlRo: '/', CapsLock: 'Caps Lock', Insert: 'Insert', Home: 'Home', End: 'End', PageUp: 'Page Up', PageDown: 'Page Down',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
};
// Nome da tecla para mostrar (teclado ABNT: Semicolon é o Ç)
export function nomeTecla(codigo) {
  if (!codigo) return '—';
  if (NOMES[codigo]) return NOMES[codigo];
  if (codigo.startsWith('Key')) return codigo.slice(3);
  if (codigo.startsWith('Digit')) return codigo.slice(5);
  if (codigo.startsWith('Numpad')) return 'Num ' + codigo.slice(6);
  return codigo;
}

export class PainelTeclas {
  constructor(ctrl, el) {
    this.ctrl = ctrl;
    this.el = el;
    this.lista = el.querySelector('#teclas-lista');
    this.msg = el.querySelector('#teclas-msg');
    this.esperando = null; // { acao, vaga }
    this.lista.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tecla]');
      if (!b) return;
      const [acao, vaga] = b.dataset.tecla.split(':');
      this.esperar(acao, Number(vaga));
    });
    el.querySelector('#teclas-padrao').addEventListener('click', () => {
      this.ctrl.cancelarEspera(); this.esperando = null;
      this.ctrl.restaurarTeclas();
      this.dizer('Teclas de volta ao padrão.');
      this.desenhar();
    });
  }

  get aberto() { return !this.el.hidden; }

  abrir() {
    this.el.hidden = false;
    this.esperando = null;
    this.dizer('Toque numa tecla e aperte a nova. Esc desiste, Backspace deixa vazia.');
    this.desenhar();
  }

  fechar() {
    this.ctrl.cancelarEspera();
    this.esperando = null;
    this.el.hidden = true;
  }

  dizer(t) { this.msg.textContent = t; }

  esperar(acao, vaga) {
    this.esperando = { acao, vaga };
    const nome = ACOES_TECLADO.find((a) => a.id === acao).nome;
    this.dizer(`Aperte a tecla para "${nome}"...`);
    this.desenhar();
    this.ctrl.esperarTecla((codigo) => this.recebeu(codigo));
  }

  recebeu(codigo) {
    const { acao, vaga } = this.esperando || {};
    this.esperando = null;
    if (!acao || codigo === 'Escape') { this.dizer('Nada mudou.'); this.desenhar(); return; }
    if (codigo === 'Backspace' || codigo === 'Delete') {
      this.ctrl.definirTecla(acao, vaga, '');
      this.dizer('A vaga ficou vazia.');
    } else if (TECLAS_PROIBIDAS.includes(codigo)) {
      this.dizer(`A tecla ${nomeTecla(codigo)} não pode ser usada. Escolha outra.`);
    } else {
      const tirou = this.ctrl.definirTecla(acao, vaga, codigo);
      this.dizer(tirou ? `${nomeTecla(codigo)} saiu de "${tirou}" e foi para cá.` : `Pronto: ${nomeTecla(codigo)}.`);
    }
    this.desenhar();
  }

  desenhar() {
    const t = this.ctrl.escolhidas, e = this.esperando;
    this.lista.innerHTML = ACOES_TECLADO.map((a) => `<div class="tecla-linha"><span>${a.nome}</span>${[0, 1].map((i) => {
      const ativo = e && e.acao === a.id && e.vaga === i;
      return `<button type="button" class="tecla${ativo ? ' esperando' : ''}${t[a.id][i] ? '' : ' vazia'}" data-tecla="${a.id}:${i}">${ativo ? '...' : nomeTecla(t[a.id][i])}</button>`;
    }).join('')}</div>`).join('');
  }
}
