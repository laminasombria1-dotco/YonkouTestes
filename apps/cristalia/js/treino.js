// =============================================================
// MODO TREINO: o monstro invocado usa os golpes no mapa, "no ar".
// Reaproveita o motor da batalha (batalha.js e as habilidades de cada linha),
// então todo golpe que existe na batalha funciona aqui do mesmo jeito,
// mas SEM inimigos e SEM dano: é só para mostrar.
//
// Como encaixa no mapa:
//  - Tudo do treino fica numa "camada" (um grupo 3D) dentro da cena do mapa,
//    centrada no treinador. As posições do treino são medidas a partir dele,
//    como se fosse uma arena invisível de 22 m em volta dele.
//  - O monstro fica preso numa "coleira" de COLEIRA metros em volta do treinador.
//  - A camada sobe e desce acompanhando o chão embaixo do monstro (o mapa tem morros;
//    a arena de batalha é plana).
//  - Os obstáculos do mapa (árvores, pedras...) seguram o monstro e os tiros.
// =============================================================
import * as THREE from 'three';
import { Batalha, Lutador } from './batalha.js';
import { alturaEm } from './mundo.js';
import { descartar } from './modelos.js';
import { VisualTrevas } from './habilidades/trevas-batalha.js';
import { HabilidadesBrasito } from './habilidades/brasito-batalha.js';
import { HabilidadesGotinho } from './habilidades/gotinho-batalha.js';
import { HabilidadesMusguinho } from './habilidades/musguinho-batalha.js';
import { HabilidadesPedrisco } from './habilidades/pedrisco-batalha.js';
import { HabilidadesFaisquinho } from './habilidades/faisquinho-batalha.js';
import { HabilidadesSolito } from './habilidades/solito-batalha.js';
import { HabilidadesLunico } from './habilidades/lunico-batalha.js';
import { HabilidadesLumino } from './habilidades/lumino-batalha.js';
import { HabilidadesVaporito } from './habilidades/vaporito-batalha.js';

export const COLEIRA = 20; // metros: até onde o monstro vai longe do treinador

// Não é criado com "new": usa os métodos da Batalha com os dados do treino (Treino.criar)
export class Treino extends Batalha {
  static criar(jogo, dados, centro, posMundo, ang) {
    const t = Object.create(Treino.prototype);
    const mundo = jogo.mundo;
    t.jogo = jogo;
    t.mundo = mundo;
    t.centro = new THREE.Vector3(centro.x, 0, centro.z);
    // a camada: tudo do treino fica aqui dentro (some de uma vez no fim)
    t.cena = new THREE.Group();
    t.cena.position.set(t.centro.x, alturaEm(posMundo.x, posMundo.z), t.centro.z);
    mundo.cena.add(t.cena);
    t.camera = mundo.camera;
    t.efeitos = [];
    t.projeteis = [];
    t.inimigos = [];
    t.capturados = [];
    t.fila = [];
    t.ondas = [];
    t.derrotados = [];
    t.alvo = null;
    t.t = 2;
    t.periodo = mundo.periodo;
    t.arena = criarArena(t);
    // as mesmas habilidades da batalha
    t.trevas = new VisualTrevas(t);
    t.brasito = new HabilidadesBrasito(t);
    t.gotinho = new HabilidadesGotinho(t);
    t.musguinho = new HabilidadesMusguinho(t);
    t.pedrisco = new HabilidadesPedrisco(t);
    t.faisquinho = new HabilidadesFaisquinho(t);
    t.solito = new HabilidadesSolito(t);
    t.lunico = new HabilidadesLunico(t);
    t.lumino = new HabilidadesLumino(t);
    t.vaporito = new HabilidadesVaporito(t);
    // o monstro (posição medida a partir do treinador)
    const j = new Lutador(dados, 'jogador');
    j.pos.set(posMundo.x - t.centro.x, 0, posMundo.z - t.centro.z);
    j.ang = j.angAlvo = ang;
    t.jog = j;
    t.cena.add(j.modelo);
    return t;
  }

  // Sem inimigos e sem dano: os golpes só aparecem
  alvosDe() { return []; }
  vivos() { return []; }
  aplicarDano() { return false; }
  aplicarEfeito() {}
  desmaiar() {}
  posicionarCamera() {}
  atualizarHud() {}
  hudFases() {}
  // no mapa o luar não cura (a cura do jogo é só no castelo)
  get semCura() { return true; }

  // Onde o monstro está no mapa
  posMundo() { return new THREE.Vector3(this.jog.pos.x + this.centro.x, this.cena.position.y, this.jog.pos.z + this.centro.z); }

  // Um ponto "no ar" na frente do monstro, para mirar o golpe (a pedra em arco cai nele)
  alvoNoAr(c, gp) {
    const d = gp.arco ? Math.min(gp.arco.alcance, 7) : gp.jato ? gp.jato.alcance : gp.alcance || 6;
    return { pos: new THREE.Vector3(c.pos.x + Math.sin(c.ang) * d, 0, c.pos.z + Math.cos(c.ang) * d), raio: 0.5 };
  }

  // A cada quadro. v = para onde o joystick aponta (já virado para o lado da câmera)
  atualizar(dt, ctrl, v) {
    this.t += dt;
    const j = this.jog;
    const mov = Math.hypot(v.x, v.z) > 0.05;
    j.mv = v; // para onde o joystick aponta (o Passo de Luz vai para lá)
    for (let i = 0; i < 3; i++) if (ctrl.consumir('golpe' + i)) this.tentarGolpe(j, i, this.alvoNoAr(j, j.golpe(i)));
    if (ctrl.consumir('esquiva')) this.esquivar(j, mov ? v : { x: Math.sin(j.ang), z: Math.cos(j.ang) }, null);
    // andar (igual à batalha: mais devagar enquanto prepara ou solta um jato)
    if (!j.dash && !j.combo && !j.arrancada && !j.giro && j.stun <= 0 && j.podeAndar()) {
      const vel = j.stats.vel * j.fatorVel * (j.prep || j.jato || j.bafo || j.punho || j.feixe ? 0.35 : 1);
      j.pos.x += v.x * vel * dt;
      j.pos.z += v.z * vel * dt;
      j.movendo = mov;
      if (j.prep) j.angAlvo = Math.atan2(j.prep.dir.x, j.prep.dir.z);
      else if (j.jato) j.angAlvo = Math.atan2(j.jato.dir.x, j.jato.dir.z);
      else if (mov) j.angAlvo = Math.atan2(v.x, v.z);
    }
    this.fisica(j, dt);
    this.atualizarProjeteis(dt);
    this.atualizarEfeitos(dt);
    this.trevas.atualizar(dt);
    this.brasito.atualizar(dt);
    this.gotinho.atualizar(dt);
    this.musguinho.atualizar(dt);
    this.pedrisco.atualizar(dt);
    this.faisquinho.atualizar(dt);
    this.solito.atualizar(dt);
    this.lunico.atualizar(dt);
    this.lumino.atualizar(dt);
    this.vaporito.atualizar(dt);
    // a camada acompanha o chão embaixo do monstro
    const w = this.posMundo();
    this.cena.position.y += (alturaEm(w.x, w.z) - this.cena.position.y) * (1 - Math.exp(-10 * dt));
  }

  // Fim do treino: tira tudo da cena
  destruir() {
    this.mundo.cena.remove(this.cena);
    descartar(this.jog.modelo);
    descartar(this.cena);
  }
}

// A "arena" do treino: obstáculos do mapa + pilares do próprio treino, e a coleira
function criarArena(t) {
  const m = t.mundo;
  const local = []; // obstáculos que os golpes criam (pilares da linha do Pedrisco)
  return {
    obstaculos: local,
    bloqueia(p, raio) {
      const x = p.x + t.centro.x, z = p.z + t.centro.z;
      if (m.obstaculoEm(x, z, raio)) return true; // árvores, pedras e peças do mapa em volta
      for (const o of local) if (Math.hypot(p.x - o.x, p.z - o.z) < o.r + raio) return true;
      return false;
    },
    colidir(pos, raio) {
      const w = { x: pos.x + t.centro.x, z: pos.z + t.centro.z };
      m.colidir(w, raio); // árvores, pedras, lagos e bordas do mapa
      pos.x = w.x - t.centro.x;
      pos.z = w.z - t.centro.z;
      for (const o of local) {
        const dx = pos.x - o.x, dz = pos.z - o.z, d = Math.hypot(dx, dz), min = o.r + raio;
        if (d < min && d > 0.0001) { pos.x = o.x + (dx / d) * min; pos.z = o.z + (dz / d) * min; }
      }
      const r = Math.hypot(pos.x, pos.z);
      if (r > COLEIRA) { pos.x *= COLEIRA / r; pos.z *= COLEIRA / r; } // coleira
    },
    escurecer() {}, // o Astro Negro (Trevas) escurece a arena; no mapa, não
  };
}
