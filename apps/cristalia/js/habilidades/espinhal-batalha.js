// =============================================================
// ESPINHAL NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em espinhal.js)
//  - Rolamento: vira uma bola de espinhos e rola (usa o "dash" da batalha), acertando
//    quem atravessar. Nas evoluções finais QUICA nas pedras e na borda (ricochete) e,
//    no Mandacarão, solta agulhas a cada batida.
//  - Agulhas: leque de agulhas finas e rápidas. Cada uma que acerta CRAVA um espinho
//    (Espinhado: mais lento a cada espinho). Nas evoluções finais quicam nas pedras e na borda.
//  - Explosão de Espinhos: agulhas para todos os lados (1, 2 ou 3 ondas).
// Para ficar leve no celular: TODAS as agulhas (as que voam e as cravadas nos inimigos)
// são desenhadas de uma vez só, com um InstancedMesh (uma peça que se repete).
// =============================================================
import * as THREE from 'three';
import { RAIO_ARENA } from '../arena.js';
import { ESPINHADO, MAX_AGULHAS } from './espinhal.js';

const MAX_CRAVADOS = 24; // espinhos cravados desenhados ao mesmo tempo (5 por monstro)

// formas e materiais (uma vez só)
const GEO_AGULHA = new THREE.ConeGeometry(0.12, 0.95, 4).rotateX(Math.PI / 2); // aponta para +z
const GEO_FAISCA = new THREE.TetrahedronGeometry(1, 0);
function fixo(m) { m.userData.fixo = true; return m; }
const MAT_AGULHA = fixo(new THREE.MeshLambertMaterial({ color: '#fff2a0', emissive: '#c9a830', emissiveIntensity: 0.6, flatShading: true }));
const MAT_FAISCA = fixo(new THREE.MeshBasicMaterial({ color: '#c9f08a' }));
const COR_PLANTA = '#5fd35a';

// peças de conta (reaproveitadas a cada quadro)
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(0, 0, 0, 'YXZ'), UM = new THREE.Vector3(1, 1, 1), P = new THREE.Vector3();

export class HabilidadesEspinhal {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.agulhas = [];         // agulhas no ar
    this.novas = [];           // explosões com mais de uma onda
    this.cravados = new Set(); // lutadores com espinhos cravados
    this.inst = new THREE.InstancedMesh(GEO_AGULHA, MAT_AGULHA, MAX_AGULHAS + MAX_CRAVADOS);
    this.inst.count = 0;
    this.inst.frustumCulled = false;
    this.cena.add(this.inst);
  }

  // Só o Espinhal e as formas dele usam estas habilidades
  dele(c) { return c.esp.linha === 'espinhal'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }
  // chefes e o Campeão ficam lentos só pela metade
  resistente(o) { return !!(o.esp.chefe || o.dados.chefe) || (!!this.b.treinador?.campeao && o.lado === 'inimigo'); }

  faiscas(pos, n, forca) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(GEO_FAISCA, MAT_FAISCA);
      m.position.copy(pos);
      m.scale.setScalar(0.07);
      const v = new THREE.Vector3((Math.random() - 0.5) * 6 * forca, (1.5 + Math.random() * 2.5) * forca, (Math.random() - 0.5) * 6 * forca);
      this.cena.add(m);
      this.b.efeitos.push({ obj: m, vida: 0.4, total: 0.4, upd: (e, k, dt) => {
        v.y -= 12 * dt;
        e.obj.position.addScaledVector(v, dt);
        e.obj.scale.setScalar(Math.max(0.01, 0.07 * (1 - k)));
      } });
    }
  }

  // Bateu? (obstáculo ou borda da arena)
  bateu(pos, raio) {
    return this.b.arena.bloqueia(pos, raio) || Math.hypot(pos.x, pos.z) > RAIO_ARENA - raio;
  }

  // Ricochete: vira a direção para longe do que bateu (testa virar só o x, só o z ou voltar)
  quicar(pos, dir, passo, raio) {
    if (Math.hypot(pos.x, pos.z) > RAIO_ARENA - raio - passo) {
      // borda redonda: reflete na normal da borda
      const n = new THREE.Vector3(pos.x, 0, pos.z).normalize();
      dir.addScaledVector(n, -2 * dir.dot(n)).normalize();
      return;
    }
    for (const [fx, fz] of [[-1, 1], [1, -1], [-1, -1]]) {
      P.set(pos.x + dir.x * fx * passo, pos.y, pos.z + dir.z * fz * passo);
      if (!this.b.arena.bloqueia(P, raio)) { dir.set(dir.x * fx, 0, dir.z * fz).normalize(); return; }
    }
    dir.negate();
  }

  // ---------- Agulhas ----------
  // cfg = { vel, alcance, quiques } | sorteados = quem já sorteou o efeito neste uso (um sorteio por alvo)
  criarAgulha(c, gp, pos, ang, cfg, efeito, sorteados, fator = 1) {
    if (this.agulhas.length >= MAX_AGULHAS) return;
    this.agulhas.push({ dono: c, gp, pos: pos.clone(), dir: new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)), vel: cfg.vel,
      resta: cfg.alcance, quiques: cfg.quiques, atingidos: new Set(), efeito, sorteados, fator });
  }

  atirar(c, gp, dir, efeito) {
    const A = gp.agulhas, base = Math.atan2(dir.x, dir.z), sorteados = new Set();
    const de = c.pos.clone().addScaledVector(dir, c.raio + 0.2).setY(0.8 * c.esp.tamanho);
    for (let k = 0; k < A.quantidade; k++) {
      const ang = base + (A.quantidade > 1 ? (k / (A.quantidade - 1) - 0.5) * A.abertura : 0);
      this.criarAgulha(c, gp, de, ang, A, efeito, sorteados);
    }
    this.faiscas(de, 3, 0.5);
  }

  atualizarAgulhas(dt) {
    for (let i = this.agulhas.length - 1; i >= 0; i--) {
      const a = this.agulhas[i];
      const passo = a.vel * dt;
      P.copy(a.pos).addScaledVector(a.dir, passo);
      let acabou = false;
      if (this.bateu(P, 0.12)) {
        if (a.quiques > 0) {
          a.quiques--;
          this.quicar(a.pos, a.dir, passo + 0.1, 0.12);
          a.atingidos.clear(); // depois de quicar pode acertar de novo
          this.faiscas(a.pos, 2, 0.4);
        } else { acabou = true; this.faiscas(a.pos, 2, 0.4); }
      }
      if (!acabou) {
        a.pos.addScaledVector(a.dir, passo);
        a.resta -= passo;
        if (a.resta <= 0) acabou = true;
      }
      if (!acabou) {
        for (const o of this.b.alvosDe(a.dono)) {
          if (a.atingidos.has(o) || Math.hypot(o.pos.x - a.pos.x, o.pos.z - a.pos.z) > o.raio + 0.25) continue;
          a.atingidos.add(o);
          const ef = a.efeito && !a.sorteados.has(o) ? a.efeito : null;
          a.sorteados.add(o);
          if (this.b.aplicarDano(a.dono, o, a.gp, a.dir, { fator: a.fator, efeito: ef, empurrao: 1, particulas: 1 })) this.cravar(o, a.dono);
          acabou = true;
          break;
        }
      }
      if (acabou) this.agulhas.splice(i, 1);
    }
  }

  // ---------- Espinhado (espinhos cravados) ----------
  cravar(o, dono) {
    if (o.morto) return;
    const novo = !o.espinhos;
    const Es = o.espinhos || (o.espinhos = { n: 0, t: 0, f: ESPINHADO.lento * (this.resistente(o) ? 0.5 : 1) });
    Es.n = Math.min(ESPINHADO.max, Es.n + 1);
    Es.t = ESPINHADO.duracao;
    this.cravados.add(o);
    if (novo) this.b.jogo.numero('Espinhado!', o.pos.clone().setY(o.altura + 0.7), '#c9f08a', 'pequeno');
    // Mandacarão: com o máximo de espinhos, fica Enraizado (e os espinhos caem)
    const trava = ESPINHADO.trava[dono.esp.estagio] || 0;
    if (trava && Es.n >= ESPINHADO.max) {
      this.b.aplicarEfeito(o, 'enraizado', trava * (dono.melhoria?.forcaEfeito ?? 1), dono);
      Es.n = 0;
    }
  }

  atualizarCravados(dt) {
    for (const l of this.cravados) {
      const Es = l.espinhos;
      if (!Es || l.morto || (Es.t -= dt) <= 0 || Es.n <= 0) { l.espinhos = null; this.cravados.delete(l); }
    }
  }

  // ---------- Rolamento ----------
  iniciarRolamento(c, gp, dir, efeito) {
    const R = gp.rolar;
    c.dash = { dir: dir.clone(), t: R.distancia / R.vel, vel: R.vel, rolar: { gp, R, efeito, atingidos: new Set(), quiques: R.quiques, giro: 0 } };
    c.angAlvo = c.ang = Math.atan2(dir.x, dir.z);
    this.faiscas(c.pos.clone().setY(0.3), 4, 0.5);
  }

  // a cada quadro do rolamento (o movimento é o do dash da batalha)
  atualizarRolamento(c, ds, dt) {
    const S = ds.rolar, R = S.R;
    S.giro += dt * 18;
    for (const o of this.b.alvosDe(c)) {
      if (S.atingidos.has(o)) continue;
      if (Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) < c.raio * 0.6 + o.raio + 0.3) {
        S.atingidos.add(o);
        this.b.aplicarDano(c, o, S.gp, ds.dir, { efeito: S.efeito, empurrao: 3 });
      }
    }
    if (ds.t <= 0 || !this.bateu(c.pos, c.raio * 0.8)) return;
    if (S.quiques <= 0) { ds.t = 0; return; } // sem ricochete: para na pedra ou na borda
    // quica: volta um passo, vira e continua
    S.quiques--;
    c.pos.addScaledVector(ds.dir, -ds.vel * dt);
    this.quicar(c.pos, ds.dir, c.raio + 0.4, c.raio * 0.8);
    c.angAlvo = c.ang = Math.atan2(ds.dir.x, ds.dir.z);
    S.atingidos.clear();
    this.faiscas(c.pos.clone().setY(0.4), 5, 0.6);
    // Mandacarão: cada batida solta agulhas para a frente
    if (R.agulhasNoQuique) {
      const base = Math.atan2(ds.dir.x, ds.dir.z), sorteados = new Set();
      const de = c.pos.clone().setY(0.8 * c.esp.tamanho);
      for (let k = 0; k < R.agulhasNoQuique; k++) {
        const ang = base + (k / (R.agulhasNoQuique - 1) - 0.5) * 1.2;
        this.criarAgulha(c, S.gp, de, ang, { vel: 18, alcance: 7, quiques: 0 }, null, sorteados, 0.4);
      }
    }
  }

  // Rolando: o modelo gira para a frente (depois da animação)
  visualModelo(c) {
    const m = c.modelo, S = c.dash?.rolar;
    if (S) {
      m.rotation.order = 'YXZ';
      m.rotation.x = S.giro;
      m.userData.rolando = true;
    } else if (m.userData.rolando) {
      m.rotation.x = 0;
      m.userData.rolando = false;
    }
  }

  // ---------- Explosão de Espinhos ----------
  iniciarNova(c, gp, efeito) {
    const N = gp.nova, X = { c, gp, N, efeito, sorteados: new Set(), onda: 0, t: 0, giro: Math.random() * Math.PI };
    this.ondaNova(X);
    if (N.ondas > 1) this.novas.push(X);
    this.b.efeitoAnel(c.pos, c.raio * 2, COR_PLANTA);
  }

  ondaNova(X) {
    const c = X.c, N = X.N, passo = (Math.PI * 2) / N.porOnda;
    // cada onda gira meio passo para cobrir os buracos da anterior
    const base = X.giro + (X.onda % 2) * passo * 0.5;
    const de = c.pos.clone().setY(0.9 * c.esp.tamanho);
    for (let i = 0; i < N.porOnda; i++) {
      const ang = base + i * passo;
      const p = de.clone().add(new THREE.Vector3(Math.sin(ang) * c.raio * 0.8, 0, Math.cos(ang) * c.raio * 0.8));
      this.criarAgulha(c, X.gp, p, ang, N, X.efeito, X.sorteados);
    }
    X.onda++;
    this.faiscas(de, 4, 0.6);
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (let i = this.novas.length - 1; i >= 0; i--) {
      const X = this.novas[i];
      X.t += dt;
      if (!this.naLuta(X.c)) { this.novas.splice(i, 1); continue; }
      if (X.t >= X.onda * X.N.intervalo) this.ondaNova(X);
      if (X.onda >= X.N.ondas) this.novas.splice(i, 1);
    }
    this.atualizarAgulhas(dt);
    this.atualizarCravados(dt);
    this.desenhar();
  }

  // Põe todas as agulhas (no ar e cravadas) no InstancedMesh
  desenhar() {
    let n = 0;
    for (const a of this.agulhas) {
      E.set(0, Math.atan2(a.dir.x, a.dir.z), 0);
      M4.compose(a.pos, Q.setFromEuler(E), UM);
      this.inst.setMatrixAt(n++, M4);
    }
    let k = 0;
    for (const l of this.cravados) {
      const Es = l.espinhos;
      for (let i = 0; i < Es.n && k < MAX_CRAVADOS; i++, k++) {
        // espetados em volta do corpo, apontando para fora e um pouco para cima
        const ang = l.ang + 0.6 + i * 1.25;
        P.set(l.pos.x + Math.sin(ang) * l.raio * 0.75, l.altura * (0.4 + (i % 2) * 0.18), l.pos.z + Math.cos(ang) * l.raio * 0.75);
        E.set(-0.5, ang, 0);
        M4.compose(P, Q.setFromEuler(E), UM);
        this.inst.setMatrixAt(n++, M4);
      }
    }
    this.inst.count = n;
    this.inst.instanceMatrix.needsUpdate = true;
  }

  // Para o que é dele (desmaiou, trocado, fim da luta...). Agulhas no ar continuam.
  parar(c) {
    if (c.dash?.rolar) c.dash = null;
    if (c.modelo?.userData.rolando) { c.modelo.rotation.x = 0; c.modelo.userData.rolando = false; }
    this.novas = this.novas.filter((X) => X.c !== c);
    c.espinhos = null;
    this.cravados.delete(c);
  }
}
