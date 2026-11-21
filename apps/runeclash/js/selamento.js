// O Selamento em etapas (ideia 2.1), com os efeitos da Arena (js/arena/efeitos.js).
// Por enquanto o Invocador NÃO entra na batalha (decisão da Lâmina): na hora de selar, a pedra de
// selamento aparece flutuando perto do seu monstro e as correntes saem dela. Mais tarde vem uma cena
// do Invocador erguendo a pedra e o selo aparecendo no monstro.
//   1. a pedra aparece: surge girando ao lado do seu monstro, com um círculo de runas no chão.
//   2. correntes: correntes de luz saem da pedra e prendem o monstro; runas no chão embaixo dele,
//      três anéis em volta se apertando e partículas puxadas em espiral.
//   3. pulsos: o monstro se debate; cada pulso é um clarão (o suspense dos "balanços" do Cristalia).
//   4a. selou: tudo é sugado para dentro, o monstro some numa implosão e a essência voa até a pedra.
//   4b. falhou: as correntes se partem em estilhaços, o círculo fica vermelho e o monstro se solta.
// As regras não mudaram: a chance é a mesma de antes (chanceCaptura, em dados.js).
import * as THREE from 'three';
import { Efeitos } from './arena/efeitos.js';
import { criarCristal } from './modelos.js';
import { CRISTAIS } from './dados.js';
import { sombraRuna } from './invocacao.js';

const T_ERGUER = 0.45;   // s até as correntes saírem da pedra
const T_PULSO = 0.6;     // s entre um pulso e outro
const T_SUGAR = 0.4;     // s do monstro encolhendo para dentro do selo
const T_VOO = 0.8;       // s da essência voando até a pedra
const COR_FALHA = 0xff6a8a;

const corHex = (c) => new THREE.Color(c).getHex();

export class Selamento {
  constructor(batalha) {
    this.b = batalha;
    this.fx = new Efeitos(batalha.cena); // o chão da arena de batalha é plano
    this.pedra = null;  // a pedra flutuando (só enquanto sela)
    this.sai = 0;       // a pedra sumindo depois do selo (segundos que faltam)
    this.ativo = null;  // o selamento em andamento
    this.n = 0;         // para os ids dos efeitos
    this.t = 0;
  }

  // onde a pedra aparece: colada ao lado do seu monstro, na altura do ombro dele
  posPedra(ini) {
    const j = this.b.jog;
    let dx = ini.pos.x - j.pos.x, dz = ini.pos.z - j.pos.z;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d; dz /= d;
    // (no alto ela pareceria perto do inimigo: a câmera da batalha olha de cima)
    return new THREE.Vector3(j.pos.x - dz * 1.1, j.altura * 0.7 + 0.4, j.pos.z + dx * 1.1);
  }

  pontaPedra() { return this.pedra.position.clone(); }

  atualizar(dt) {
    this.t += dt;
    const b = this.b, p = this.pedra;
    if (p) {
      // a pedra gira e flutua; ao aparecer cresce, ao sumir encolhe
      p.rotation.y += dt * 2.4;
      p.position.y = p.userData.y + Math.sin(this.t * 3) * 0.08;
      if (this.ativo) p.scale.setScalar(p.userData.esc * Math.min(1, (p.userData.t += dt) / 0.3));
      else if (this.sai > 0) {
        this.sai -= dt;
        p.scale.setScalar(p.userData.esc * Math.max(0, this.sai / 0.4));
        if (this.sai <= 0) this.tirarPedra();
      }
    }
    if (this.ativo) this.passo(dt);
    const W = b.jogo.palco.clientWidth, H = b.jogo.palco.clientHeight;
    this.fx.atualizar(dt, b.camera, W, H);
  }

  tirarPedra() {
    if (!this.pedra) return;
    this.b.cena.remove(this.pedra);
    this.pedra.material.dispose(); // o anel da pedra é de todas as pedras: fica
    this.pedra = null;
    this.sai = 0;
  }

  // começa um selamento. aoFim(sucesso) é chamado quando o monstro já foi selado (ou se soltou)
  iniciar(ini, tipo, sucesso, pulsos, aoFim) {
    const cor = corHex(CRISTAIS[tipo].cor);
    this.tirarPedra();
    this.ativo = { ini, tipo, cor, sucesso, pulsos, feitos: 0, fase: 'erguer', t: 0, id: 'selo' + ++this.n, aoFim, rot: ini.modelo.rotation.z };
    // 1) a pedra aparece ao lado do seu monstro
    const pos = this.posPedra(ini);
    this.pedra = criarCristal(1, tipo);
    this.pedra.position.copy(pos);
    this.pedra.userData.y = pos.y;
    this.pedra.userData.esc = 1;
    this.pedra.userData.t = 0;
    this.pedra.scale.setScalar(0.001);
    this.b.cena.add(this.pedra);
    const vida = T_ERGUER + pulsos * T_PULSO + 0.6;
    sombraRuna(this.fx, pos.x, pos.z, 1.2, vida, this.ativo.id);
    this.fx.runa(pos.x, pos.z, 1.2, cor, vida, { id: this.ativo.id, estilo: 1, giro: -2.2, cresce: 0.2 });
    this.fx.clarao(pos.x, pos.y, pos.z, cor, 0.8, 0.4);
    this.fx.particulas({ x: pos.x, y: pos.y, z: pos.z, n: 20, raio: 0.3, cor, vel: 2.5, vida: 0.5, tam: 0.16 });
  }

  centro(ini) { return [ini.pos.x, Math.max(0.5, ini.altura * 0.5), ini.pos.z]; }

  passo(dt) {
    const s = this.ativo, ini = s.ini, fx = this.fx;
    s.t += dt;
    const [cx, cy, cz] = this.centro(ini), raio = Math.max(0.8, ini.raio);
    if (s.fase === 'erguer' && s.t >= T_ERGUER) {
      // 2) as correntes saem da pedra e prendem o monstro
      s.fase = 'pulsos'; s.t = 0;
      const d = s.pulsos * T_PULSO + 0.3, pc = this.pontaPedra();
      fx.clarao(pc.x, pc.y, pc.z, s.cor, 0.7, 0.4);
      sombraRuna(fx, cx, cz, raio * 2.6, d + 0.25, s.id);
      fx.runa(cx, cz, raio * 2.6, s.cor, d + 0.25, { id: s.id, estilo: 0, giro: 0.9, cresce: 0.35 });
      fx.aneis(cx, cy, cz, Math.max(1.3, raio * 1.45), s.cor, d, { id: s.id, aperta: 0.45 });
      fx.correntes([pc.x, pc.y, pc.z], [cx, cy, cz], 3, s.cor, d, { id: s.id, raio: raio * 0.7 });
      fx.espiral(cx, 0.2, cz, raio * 2.4, ini.altura * 1.1, 0xd8c4ff, d, { id: s.id, n: 50, giro: 3, puxa: 0.8 });
    } else if (s.fase === 'pulsos') {
      // 3) o monstro se debate; um clarão a cada pulso
      ini.modelo.rotation.z = s.rot + Math.sin(s.t * 38) * 0.08;
      if (s.t >= T_PULSO) {
        s.t = 0; s.feitos++;
        fx.clarao(cx, cy, cz, s.cor, 0.8 + s.feitos * 0.15, 0.3);
        fx.onda(cx, cz, raio * 2.4, s.cor, 0.35);
        fx.particulas({ x: cx, y: cy, z: cz, n: 14, raio: raio * 0.8, alto: ini.altura * 0.6, cor: 0xd8c4ff, vel: 5, vida: 0.35, grav: 2, tam: 0.2 });
        if (s.feitos >= s.pulsos) {
          ini.modelo.rotation.z = s.rot;
          if (s.sucesso) { s.fase = 'sugar'; s.t = 0; this.fecharSelo(); } else this.quebrarSelo();
        }
      }
    } else if (s.fase === 'sugar') {
      // 4a) o monstro encolhe para dentro do selo
      const k = Math.min(1, s.t / T_SUGAR);
      ini.modelo.scale.setScalar(ini.escala * (1 - k));
      if (k >= 1) {
        ini.modelo.visible = false;
        s.fase = 'voo'; s.t = 0;
        const pc = this.pontaPedra();
        fx.voo([cx, cy + 1, cz], [pc.x, pc.y, pc.z], s.cor, T_VOO);
      }
    } else if (s.fase === 'voo' && s.t >= T_VOO) {
      // a essência chega na pedra: ela brilha
      const pc = this.pontaPedra();
      fx.clarao(pc.x, pc.y, pc.z, s.cor, 1.2, 0.5);
      fx.particulas({ x: pc.x, y: pc.y, z: pc.z, n: 30, raio: 0.2, cor: s.cor, vel: 3, vida: 0.6, tam: 0.18 });
      this.terminar(true);
    }
  }

  // 4a) o selo fecha
  fecharSelo() {
    const s = this.ativo, fx = this.fx, [cx, cy, cz] = this.centro(s.ini), raio = Math.max(0.8, s.ini.raio);
    fx.encerrar(s.id);
    fx.implosao(cx, cy, cz, raio * 3, 0xe0d0ff, 90, 0.4);
    fx.clarao(cx, cy, cz, s.cor, 1.5, 0.8);
    sombraRuna(fx, cx, cz, raio * 3, 2.5);
    fx.runa(cx, cz, raio * 3, s.cor, 2.5, { estilo: 0, giro: 0.35, cresce: 0.15, forca: 1 }); // a marca fica no chão um pouco
    fx.aneis(cx, cy, cz, Math.max(1.1, raio * 1.2), 0xffffff, 1.1, { aperta: 0.9 });
    fx.coluna(cx, cz, raio * 1.2, s.cor, 10, 1);
    fx.onda(cx, cz, raio * 5, 0xe0d0ff, 0.8);
    fx.particulas({ x: cx, y: cy, z: cz, n: 90, raio: raio * 1.4, cor: 0xc8a8ff, vel: 3, cima: 5, grav: -2, vida: 1.2, tam: 0.3 });
    fx.tremer(0.4);
    this.b.jogo.aviso(`Você selou ${s.ini.esp.nome}!`);
  }

  // 4b) as correntes se partem: estilhaços no meio do caminho e o círculo fica vermelho
  quebrarSelo() {
    const s = this.ativo, fx = this.fx, [cx, cy, cz] = this.centro(s.ini), raio = Math.max(0.8, s.ini.raio);
    fx.encerrar(s.id);
    const pc = this.pontaPedra();
    fx.estilhacos((pc.x + cx) / 2, (pc.y + cy) / 2, (pc.z + cz) / 2, 18, s.cor, { vel: 6, cima: 4, tam: 0.14 });
    fx.estilhacos(cx, cy, cz, 12, COR_FALHA, { vel: 8, cima: 5, tam: 0.18 });
    fx.clarao(cx, cy, cz, COR_FALHA, 0.8, 0.35);
    sombraRuna(fx, cx, cz, raio * 2.6, 0.6);
    fx.runa(cx, cz, raio * 2.6, COR_FALHA, 0.6, { estilo: 0, giro: 6, cresce: 0.05 });
    fx.onda(cx, cz, raio * 4, s.cor, 0.5);
    this.b.jogo.aviso(`${s.ini.esp.nome} quebrou as correntes e se soltou!`);
    this.terminar(false);
  }

  terminar(sucesso) {
    const s = this.ativo;
    this.ativo = null;
    this.sai = sucesso ? 0.4 : 0.25; // a pedra encolhe e some
    s.aoFim(sucesso);
  }

  // há um selamento em andamento?
  get selando() { return !!this.ativo; }
}
