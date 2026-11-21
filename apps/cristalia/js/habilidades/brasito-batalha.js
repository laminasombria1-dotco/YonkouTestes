// =============================================================
// LINHA DO BRASITO NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em brasito.js)
//  - Investida (Normal): nas evoluções, dá velocidade extra por 10 s
//  - Lança-Chamas: jato contínuo em cone saindo da boca (1 ou 2 jatos)
//  - Rabo de Fogo: gira o corpo e bate com o rabo em volta (com mini dash nas formas finais)
// Para ficar leve no celular: formas e materiais das chamas são criados uma vez só.
// =============================================================
import * as THREE from 'three';
import { VELOCIDADE_INVESTIDA, DURACAO_VELOCIDADE } from './brasito.js';
import { ajustarGiro } from '../modelos.js';

const GEO_CHAMA = new THREE.IcosahedronGeometry(1, 0);
const GEO_ANEL = new THREE.RingGeometry(0.9, 1, 40).rotateX(-Math.PI / 2);
const GEO_DISCO = new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2);
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor) => fixo(new THREE.MeshBasicMaterial({ color: cor }));
// cores do fogo (do miolo para fora) e do magma
const FOGO = [basico('#fff2a8'), basico('#ffc23f'), basico('#ff7a2a'), basico('#e2401f')];
const MAGMA = [basico('#ffd27a'), basico('#ff6a1f'), basico('#d8281a'), basico('#5a1410')];
const VERDE_VELOZ = '#7dffa0';
const aviso = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });

export class HabilidadesBrasito {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
  }

  // Só a linha do Brasito usa estas habilidades
  dele(c) { return c.esp.linha === 'fogo'; }

  // ---------- chamas (partículas) ----------
  chama(pos, vel, tam, vida, magma = false) {
    const cores = magma ? MAGMA : FOGO;
    const m = new THREE.Mesh(GEO_CHAMA, cores[Math.floor(Math.random() * cores.length)]);
    m.position.copy(pos);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      e.obj.position.addScaledVector(vel, dt);
      vel.y += 2.5 * dt; // o fogo sobe um pouco
      e.obj.scale.setScalar(tam * (0.4 + k * 1.2) * (1 - k * k));
    } });
  }

  boca(c, dir) {
    return new THREE.Vector3(c.pos.x, c.altura * 0.55, c.pos.z).addScaledVector(dir, c.raio * 0.9);
  }

  // ---------- Investida: velocidade extra ----------
  aoUsarInvestida(c) {
    const bonus = VELOCIDADE_INVESTIDA[c.esp.estagio] || 0;
    if (!bonus) return;
    const novo = !c.veloz;
    c.veloz = { bonus, t: DURACAO_VELOCIDADE, rastro: 0 };
    if (novo) this.b.jogo.numero(`+${Math.round(bonus * 100)}% velocidade!`, c.pos.clone().setY(c.altura + 0.6), VERDE_VELOZ, 'pequeno');
  }

  // ---------- Lança-Chamas ----------
  iniciarJato(c, gp, dir, efeito) {
    c.jato = { gp, dir: dir.clone(), t: 0, proxTick: 0, ticks: 0, atingidos: new Set(), efeito, emitir: 0 };
  }

  // Direções dos jatos (1 jato reto ou 2 em V)
  direcoesJato(j) {
    const base = Math.atan2(j.dir.x, j.dir.z), J = j.gp.jato;
    const angs = J.jatos === 2 ? [base - J.separacao / 2, base + J.separacao / 2] : [base];
    return angs;
  }

  // O alvo está dentro de algum cone de fogo (e sem obstáculo no caminho)?
  dentroDoJato(c, alvo, angs, J) {
    const dx = alvo.pos.x - c.pos.x, dz = alvo.pos.z - c.pos.z, d = Math.hypot(dx, dz);
    if (d > J.alcance + alvo.raio) return false;
    const a = Math.atan2(dx, dz);
    const folga = Math.atan2(alvo.raio, Math.max(d, 0.5)); // monstro grande é mais fácil de pegar
    const dentro = angs.some((b) => {
      let diff = Math.abs(a - b) % (Math.PI * 2);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      return diff <= J.abertura + folga;
    });
    if (!dentro) return false;
    // obstáculos seguram o fogo (dá para se esconder atrás deles)
    for (let k = 0.25; k < 1; k += 0.25) {
      if (this.b.arena.bloqueia({ x: c.pos.x + dx * k, z: c.pos.z + dz * k }, 0.2)) return false;
    }
    return true;
  }

  atualizarJato(c, dt) {
    const j = c.jato, J = j.gp.jato;
    j.t += dt;
    const angs = this.direcoesJato(j);
    // chamas saindo da boca: ~120 por segundo em cada jato
    j.emitir += dt * 120;
    const boca = this.boca(c, j.dir);
    const vida = 0.38, velJato = J.alcance / vida;
    while (j.emitir >= 1) {
      j.emitir--;
      for (const b of angs) {
        const a = b + (Math.random() * 2 - 1) * J.abertura * 0.85;
        const v = new THREE.Vector3(Math.sin(a), (Math.random() - 0.4) * 0.12, Math.cos(a)).multiplyScalar(velJato * (0.75 + Math.random() * 0.3));
        this.chama(boca.clone(), v, 0.42 + Math.min(0.45, J.alcance * 0.035), vida, J.magma); // nasce pequena na boca e cresce
      }
    }
    // dano em 5 "pedaços" ao longo do jato; o efeito sorteia uma vez só por alvo
    const TICKS = 5;
    if (j.t >= j.proxTick && j.ticks < TICKS) {
      j.ticks++;
      j.proxTick += J.duracao / TICKS;
      for (const alvo of this.b.alvosDe(c)) {
        if (!this.dentroDoJato(c, alvo, angs, J)) continue;
        const primeira = !j.atingidos.has(alvo);
        j.atingidos.add(alvo);
        this.b.aplicarDano(c, alvo, j.gp, j.dir, { fator: 1 / TICKS, efeito: primeira ? j.efeito : null, leve: true, primeiro: primeira });
      }
    }
    if (j.t >= J.duracao) c.jato = null;
  }

  // Aviso do inimigo: fatia vermelha no chão do tamanho do jato
  avisoJato(c, gp, dir) {
    const J = gp.jato, g = new THREE.Group();
    for (const a of this.direcoesJato({ gp, dir })) {
      // fatia deitada no chão, centrada na direção do jato
      const geo = new THREE.CircleGeometry(1, 20, a - Math.PI / 2 - J.abertura, J.abertura * 2).rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(geo, aviso('#ff3d5e', 0.28));
      m.scale.set(J.alcance, 1, J.alcance);
      m.userData.geometriaPropria = true;
      g.add(m);
    }
    g.position.set(c.pos.x, 0.07, c.pos.z);
    g.userData = { segue: true, disco: new THREE.Object3D(), raio: 1 };
    this.cena.add(g);
    return g;
  }

  // ---------- Rabo de Fogo ----------
  iniciarGiro(c, gp, dir, efeito) {
    c.giro = { gp, dir: dir.clone(), t: 0, total: gp.dash ? 0.45 : 0.38, atingidos: new Set(), efeito, spin: 0, emitir: 0 };
    ajustarGiro(c.modelo, c.giro.total); // modelo do Blender: a volta da animação dura o mesmo que o giro
    this.b.efeitoAnel(c.pos, gp.raio, gp.magma ? '#ff4a1a' : '#ffb030');
  }

  atualizarGiro(c, dt) {
    const g = c.giro, gp = g.gp;
    g.t += dt;
    const k = Math.min(1, g.t / g.total);
    g.spin = k * Math.PI * 2; // uma volta completa
    // mini dash: avança girando
    if (gp.dash) c.pos.addScaledVector(g.dir, (gp.dash / g.total) * dt);
    // o rabo cresce e pega fogo durante o giro
    const cresce = 1 + (gp.tamanhoRabo - 1) * Math.sin(k * Math.PI);
    for (const cauda of c.modelo.userData.caudas) cauda.scale.setScalar(cresce);
    // rastro de fogo em roda, seguindo a ponta do rabo
    g.emitir += dt * (gp.magma ? 120 : 80);
    const angRabo = c.ang + Math.PI + g.spin;
    while (g.emitir >= 1) {
      g.emitir--;
      const a = angRabo + (Math.random() - 0.5) * 0.6, r = gp.raio * (0.55 + Math.random() * 0.4);
      const p = new THREE.Vector3(c.pos.x + Math.sin(a) * r, 0.3 + Math.random() * 0.6, c.pos.z + Math.cos(a) * r);
      const v = new THREE.Vector3(Math.cos(a) * 1.5, 1 + Math.random() * 1.5, -Math.sin(a) * 1.5);
      this.chama(p, v, gp.magma ? 0.42 : 0.3, 0.45, gp.magma);
    }
    // acerta cada adversário uma vez, quando ele estiver na roda
    for (const alvo of this.b.alvosDe(c)) {
      if (g.atingidos.has(alvo)) continue;
      const dx = alvo.pos.x - c.pos.x, dz = alvo.pos.z - c.pos.z;
      if (Math.hypot(dx, dz) <= gp.raio + alvo.raio * 0.5) {
        g.atingidos.add(alvo);
        this.b.aplicarDano(c, alvo, gp, new THREE.Vector3(dx, 0, dz).normalize(), { efeito: g.efeito });
      }
    }
    if (k >= 1) this.terminarGiro(c);
  }

  terminarGiro(c) {
    if (!c.giro) return;
    const gp = c.giro.gp;
    for (const cauda of c.modelo.userData.caudas) cauda.scale.setScalar(1);
    this.b.efeitoAnel(c.pos, gp.raio, gp.magma ? '#d8281a' : '#ff7a2a');
    c.giro = null;
  }

  // Aviso do inimigo: o círculo de sempre + uma faixa mostrando até onde ele avança
  avisoGiro(c, gp, dir, cor) {
    const g = new THREE.Group();
    const anel = new THREE.Mesh(GEO_ANEL, aviso(cor, 0.75));
    anel.scale.setScalar(gp.raio);
    const disco = new THREE.Mesh(GEO_DISCO, aviso(cor, 0.25));
    const faixa = new THREE.Mesh(GEO_FAIXA, aviso(cor, 0.22));
    faixa.scale.set(gp.raio * 2, 1, gp.dash);
    faixa.rotation.y = Math.atan2(dir.x, dir.z);
    const fim = new THREE.Mesh(GEO_ANEL, aviso(cor, 0.5));
    fim.scale.setScalar(gp.raio);
    fim.position.set(dir.x * gp.dash, 0, dir.z * gp.dash);
    g.add(anel, disco, faixa, fim);
    g.userData = { disco, raio: gp.raio, segue: true };
    g.position.set(c.pos.x, 0.06, c.pos.z);
    this.cena.add(g);
    return g;
  }

  // ---------- a cada quadro: velocidade extra passando e o rastro verde ----------
  atualizar(dt) {
    for (const l of [this.b.jog, ...this.b.inimigos]) {
      if (!l.veloz) continue;
      l.veloz.t -= dt;
      if (l.veloz.t <= 0 || l.morto) { l.veloz = null; continue; }
      l.veloz.rastro -= dt;
      if (l.veloz.rastro <= 0) {
        l.veloz.rastro = 0.1;
        this.chama(new THREE.Vector3(l.pos.x + (Math.random() - 0.5) * 0.5, 0.15, l.pos.z + (Math.random() - 0.5) * 0.5), new THREE.Vector3(0, 0.6, 0), 0.12, 0.35);
      }
    }
  }

  // Para tudo (desmaiou, capturado...)
  parar(c) {
    c.jato = null;
    this.terminarGiro(c);
  }
}
