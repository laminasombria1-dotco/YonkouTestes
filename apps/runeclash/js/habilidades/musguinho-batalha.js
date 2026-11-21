// =============================================================
// LINHA DO MUSGUINHO NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em musguinho.js)
//  - Folha Bumerangue: folha que vai, faz a curva e volta (acerta na ida e na volta)
//  - Chicote de Vinha / Vinha Agarradora: a vinha estica até o alvo e puxa
//  - Raízes: raízes pontudas brotam do chão em volta
//  - Moita de Espinhos / Bosque Vivo: ficam no chão machucando (o Bosque cura quem plantou)
// Para ficar leve no celular: formas e materiais são criados uma vez só
// e reaproveitados; a moita some em 4 s e o bosque em 5 s.
// =============================================================
import * as THREE from 'three';

// metros de puxão -> velocidade inicial (o empurrão freia com exp(-8t), então anda v/8)
const PUXAO = 8;

// formas (uma vez só)
const GEO_FOLHA = new THREE.OctahedronGeometry(1, 0).scale(0.42, 0.07, 0.26);
const GEO_NERVURA = new THREE.BoxGeometry(0.72, 0.09, 0.04);
const GEO_FOLHINHA = new THREE.OctahedronGeometry(1, 0).scale(0.16, 0.03, 0.1);
const GEO_VINHA = new THREE.CylinderGeometry(1, 1, 1, 6).rotateX(Math.PI / 2).translate(0, 0, 0.5);
const GEO_RAIZ = new THREE.ConeGeometry(0.22, 1.5, 5).translate(0, 0.75, 0);
const GEO_ESPINHO = new THREE.ConeGeometry(0.08, 0.55, 4).translate(0, 0.27, 0);
const GEO_DISCO = new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2);
const GEO_ARCO_RAIZ = new THREE.TorusGeometry(0.7, 0.16, 5, 10, Math.PI);
const GEO_FLOR = new THREE.IcosahedronGeometry(0.13, 0);
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);

function fixo(m) { m.userData.fixo = true; return m; }
const lambert = (cor) => fixo(new THREE.MeshLambertMaterial({ color: cor, flatShading: true }));
const FOLHA = fixo(new THREE.MeshLambertMaterial({ color: '#5fd35a', emissive: '#2f8a2a', emissiveIntensity: 0.5, flatShading: true }));
const NERVURA = lambert('#b8f08a');
const VINHA = lambert('#1f4f1c');
const VINHA_CLARA = lambert('#4fae44');
const RAIZ = lambert('#7a5232');
const ESPINHO = lambert('#c9e07a');
const MUSGO = fixo(new THREE.MeshLambertMaterial({ color: '#2f6a2a', transparent: true, opacity: 0.85, flatShading: true }));
const CHAO_BOSQUE = fixo(new THREE.MeshLambertMaterial({ color: '#24552a', transparent: true, opacity: 0.8, flatShading: true }));
const FLORES = [fixo(new THREE.MeshBasicMaterial({ color: '#ff9ed0' })), fixo(new THREE.MeshBasicMaterial({ color: '#ffe14a' })), fixo(new THREE.MeshBasicMaterial({ color: '#ffffff' }))];
const aviso = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });

export class HabilidadesMusguinho {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.zonas = [];   // moitas e bosques no chão
  }

  // Só a linha do Musguinho usa estas habilidades
  dele(c) { return c.esp.linha === 'planta'; }

  // folhinhas soltas (partículas)
  folhinha(pos, vel, vida, mat = FOLHA) {
    const m = new THREE.Mesh(GEO_FOLHINHA, mat);
    m.position.copy(pos);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      vel.y -= 4 * dt; // cai devagar, como folha
      e.obj.position.addScaledVector(vel, dt);
      e.obj.rotation.x += dt * 6;
      e.obj.scale.setScalar(1 - k * 0.6);
    } });
  }

  // ---------- Folha Bumerangue ----------
  projetil(gp, ang, fator) {
    const g = new THREE.Group();
    const folha = new THREE.Mesh(GEO_FOLHA, FOLHA);
    folha.add(new THREE.Mesh(GEO_NERVURA, NERVURA));
    g.add(folha);
    const s = gp.raio / 0.45 * (fator < 1 ? 0.85 : 1);
    g.scale.setScalar(s * 1.25);
    g.rotation.y = ang;
    return g;
  }

  // Cada uso sorteia o efeito uma vez só por alvo (todas as folhas e passagens juntas)
  efeitoDaFolha(p, alvo) {
    if (!p.efeito || p.sorteados.has(alvo)) return null;
    p.sorteados.add(alvo);
    return p.efeito;
  }

  // Move a folha: vai em linha reta até o alcance, gira um instante e volta reto para quem jogou
  moverFolha(p, dt) {
    const B = p.gp.bumerangue, dono = p.dono;
    const passo = p.gp.velocidade * dt;
    if (p.fase === 'ida') {
      p.pos.addScaledVector(p.dir, passo);
      p.andou += passo;
      if (p.andou >= B.alcance) { p.fase = 'volta'; p.atingidos = new Set(); } // na volta pode acertar de novo
    } else {
      const naLuta = dono === this.b.jog || this.b.inimigos.includes(dono);
      if (dono.morto || !naLuta) { p.chegou = true; return; }
      const dx = dono.pos.x - p.pos.x, dz = dono.pos.z - p.pos.z, d = Math.hypot(dx, dz) || 1;
      p.tVolta = (p.tVolta || 0) + dt;
      // no fim do caminho, para girando um instante e volta reto (passa de novo por quem acertou)
      if (p.tVolta < 0.14) { p.mesh.rotation.y += dt * 30; return; }
      p.dir.set(dx / d, 0, dz / d);
      p.pos.addScaledVector(p.dir, passo * 1.15); // acelera um pouco na volta
      if (p.tVolta > 3) { p.chegou = true; return; } // nunca fica perdida
      if (d < dono.raio + 0.6) {
        p.chegou = true;
        // Florestral: a folha que acertou alguém cura ao voltar
        if (B.cura && p.acertou) this.b.curar(dono, B.cura);
      }
    }
    p.vida = 10; // a folha some quando volta (ou bate num obstáculo), não pelo tempo
    p.mesh.rotation.y += dt * 16; // gira como bumerangue
    p.rastro = (p.rastro ?? 0) - dt;
    if (p.rastro <= 0) {
      p.rastro = 0.07;
      this.folhinha(p.pos.clone(), new THREE.Vector3((Math.random() - 0.5), 0.4, (Math.random() - 0.5)), 0.5);
    }
  }

  // ---------- Chicote de Vinha ----------
  iniciarVinha(c, gp, dir, efeito) {
    const g = new THREE.Group();
    const corpo = new THREE.Mesh(GEO_VINHA, VINHA);
    g.add(corpo);
    const folhas = [];
    for (let i = 0; i < 8; i++) { const f = new THREE.Mesh(GEO_FOLHINHA, i % 2 ? VINHA_CLARA : FOLHA); f.scale.setScalar(2.8); g.add(f); folhas.push(f); }
    this.cena.add(g);
    c.vinha = { gp, dir: dir.clone(), t: 0, estica: 0.2, segura: 0.1, volta: 0.3, alvo: null, mesh: g, corpo, folhas, efeito, ponta: null };
  }

  // Ponto de onde a vinha sai (um pouco à frente, na altura do meio do corpo)
  mao(c, dir) {
    return new THREE.Vector3(c.pos.x, c.altura * 0.45, c.pos.z).addScaledVector(dir, c.raio * 0.7);
  }

  // O caminho até o alvo tem obstáculo? (dá para se esconder atrás)
  protegido(de, ate) {
    for (let k = 0.25; k < 1; k += 0.25) {
      if (this.b.arena.bloqueia({ x: de.x + (ate.x - de.x) * k, z: de.z + (ate.z - de.z) * k }, 0.2)) return true;
    }
    return false;
  }

  // Procura quem está na frente, dentro do alcance da vinha (o mais perto)
  alvoDaVinha(c, v) {
    const G = v.gp, V = G.vinha;
    let melhor = null, md = Infinity;
    for (const o of this.b.alvosDe(c)) {
      const rx = o.pos.x - c.pos.x, rz = o.pos.z - c.pos.z;
      const frente = rx * v.dir.x + rz * v.dir.z, lado = Math.abs(rx * v.dir.z - rz * v.dir.x);
      if (frente < 0 || frente > G.alcance + o.raio * 0.5 || lado > V.largura + o.raio * 0.8) continue;
      if (frente < md && !this.protegido(c.pos, o.pos)) { md = frente; melhor = o; }
    }
    return melhor;
  }

  atualizarVinha(c, dt) {
    const v = c.vinha, G = v.gp, V = G.vinha;
    v.t += dt;
    const mao = this.mao(c, v.dir);
    let ponta;
    if (v.t <= v.estica) {
      // esticando até o alcance (ou até o primeiro que encontrar)
      const k = v.t / v.estica;
      ponta = mao.clone().addScaledVector(v.dir, G.alcance * k);
      if (!v.alvo) {
        const o = this.alvoDaVinha(c, v);
        if (o && Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) <= G.alcance * k + o.raio) {
          v.alvo = o;
          const puxar = new THREE.Vector3(c.pos.x - o.pos.x, 0, c.pos.z - o.pos.z);
          const d = puxar.length() || 1;
          puxar.divideScalar(d);
          // não puxa para dentro do monstro: para a uma distância de encostar
          const puxa = Math.max(0, Math.min(V.puxa, d - c.raio - o.raio - 0.3));
          if (this.b.aplicarDano(c, o, G, v.dir, { efeito: v.efeito, empurrao: 0 })) {
            o.emp.set(puxar.x * puxa * PUXAO, 0, puxar.z * puxa * PUXAO);
            for (let i = 0; i < 6; i++) this.folhinha(o.pos.clone().setY(o.altura * 0.5), new THREE.Vector3((Math.random() - 0.5) * 3, 1.5 + Math.random(), (Math.random() - 0.5) * 3), 0.6);
          }
        }
      }
    } else {
      // segura um instante e depois recolhe: se pegou alguém, a ponta vem grudada nele
      const k = Math.max(0, Math.min(1, (v.t - v.estica - v.segura) / v.volta));
      const fim = v.alvo && !v.alvo.morto ? v.alvo.pos.clone().setY(v.alvo.altura * 0.45) : mao.clone().addScaledVector(v.dir, G.alcance);
      ponta = v.alvo ? fim.lerp(mao, k * k) : fim.lerp(mao, k);
    }
    // desenha a vinha da mão até a ponta
    const dx = ponta.x - mao.x, dy = ponta.y - mao.y, dz = ponta.z - mao.z, len = Math.hypot(dx, dy, dz) || 0.01;
    const grossura = V.grossa ? 0.22 : 0.17;
    v.corpo.scale.set(grossura, grossura, len);
    v.mesh.position.copy(mao);
    v.mesh.lookAt(ponta);
    v.folhas.forEach((f, i) => {
      f.position.set(Math.sin(i * 2.1) * grossura * 1.4, Math.cos(i * 2.1) * grossura * 1.4, len * (i + 1) / (v.folhas.length + 1));
      f.rotation.set(i, i * 0.7, 0);
    });
    if (v.t >= v.estica + v.segura + v.volta) this.pararVinha(c);
  }

  pararVinha(c) {
    if (!c.vinha) return;
    this.cena.remove(c.vinha.mesh);
    c.vinha = null;
  }

  // Aviso do inimigo: faixa estreita do tamanho da vinha
  avisoVinha(c, gp, dir, cor) {
    const m = new THREE.Mesh(GEO_FAIXA, aviso(cor, 0.3));
    m.scale.set(gp.vinha.largura * 2, 1, gp.alcance + c.raio);
    m.position.set(c.pos.x, 0.06, c.pos.z);
    m.rotation.y = Math.atan2(dir.x, dir.z);
    m.userData = { faixa: true };
    this.cena.add(m);
    return m;
  }

  // ---------- Área: depois do dano normal da área, o visual e o que fica no chão ----------
  aoUsarArea(c, gp) {
    if (gp.raizes) this.raizes(c.pos, gp.raio, 9, 1);
    if (gp.zona) this.criarZona(c, gp);
  }

  // Raízes pontudas que brotam do chão em roda e afundam de novo
  raizes(pos, raio, n, tam) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const r = raio * (0.35 + Math.random() * 0.55);
      const m = new THREE.Mesh(GEO_RAIZ, RAIZ);
      m.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
      m.rotation.set((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6);
      m.scale.setScalar(tam * (0.7 + Math.random() * 0.6));
      g.add(m);
    }
    g.position.set(pos.x, 0, pos.z);
    this.cena.add(g);
    this.b.efeitos.push({ obj: g, vida: 0.7, total: 0.7, upd: (e, k) => {
      // sobe rápido, fica um pouco e afunda
      const h = k < 0.25 ? k / 0.25 : k > 0.7 ? (1 - k) / 0.3 : 1;
      e.obj.scale.set(1, Math.max(0.01, h), 1);
    } });
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      this.folhinha(new THREE.Vector3(pos.x + Math.sin(a) * raio * 0.6, 0.3, pos.z + Math.cos(a) * raio * 0.6), new THREE.Vector3(Math.sin(a) * 2, 2.5, Math.cos(a) * 2), 0.7, RAIZ);
    }
  }

  // ---------- Moita de Espinhos e Bosque Vivo ----------
  criarZona(c, gp) {
    const Z = gp.zona, R = gp.raio, g = new THREE.Group();
    const bosque = Z.visual === 'bosque';
    const chao = new THREE.Mesh(GEO_DISCO, bosque ? CHAO_BOSQUE : MUSGO);
    chao.scale.setScalar(R);
    chao.position.y = 0.05;
    g.add(chao);
    if (bosque) {
      // raízes gigantes em arco em volta, com flores
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const m = new THREE.Mesh(GEO_ARCO_RAIZ, RAIZ);
        m.position.set(Math.sin(a) * R * 0.82, 0, Math.cos(a) * R * 0.82);
        m.rotation.y = a + Math.PI / 2;
        m.scale.setScalar(1.1 + (i % 3) * 0.25);
        g.add(m);
      }
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2, r = R * Math.sqrt(Math.random()) * 0.9;
        const f = new THREE.Mesh(GEO_FLOR, FLORES[i % 3]);
        f.position.set(Math.sin(a) * r, 0.12, Math.cos(a) * r);
        g.add(f);
      }
    } else {
      // espinhos baixos espalhados
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * Math.PI * 2, r = R * Math.sqrt(Math.random()) * 0.92;
        const m = new THREE.Mesh(GEO_ESPINHO, i % 3 ? ESPINHO : VINHA_CLARA);
        m.position.set(Math.sin(a) * r, 0.03, Math.cos(a) * r);
        m.rotation.set((Math.random() - 0.5) * 0.7, 0, (Math.random() - 0.5) * 0.7);
        m.scale.setScalar(0.8 + Math.random() * 0.6);
        g.add(m);
      }
    }
    g.position.set(c.pos.x, 0, c.pos.z);
    g.scale.set(0.01, 1, 0.01);
    this.cena.add(g);
    if (bosque) this.raizes(c.pos, R, 12, 1.5);
    this.zonas.push({ c, gp, mesh: g, x: c.pos.x, z: c.pos.z, t: 0, tick: Z.intervalo, curaT: 1, primeiro: new Set() });
  }

  atualizarZonas(dt) {
    for (let i = this.zonas.length - 1; i >= 0; i--) {
      const z = this.zonas[i], Z = z.gp.zona, R = z.gp.raio;
      z.t += dt;
      // cresce rápido, ondula de leve e encolhe no fim
      const s = Math.min(1, z.t / 0.25) * Math.min(1, (Z.duracao - z.t) / 0.4);
      z.mesh.scale.set(Math.max(0.01, s), Math.max(0.01, s), Math.max(0.01, s));
      const naLuta = z.c === this.b.jog || this.b.inimigos.includes(z.c);
      if (z.t >= Z.duracao || z.c.morto || !naLuta) { this.cena.remove(z.mesh); this.zonas.splice(i, 1); continue; }
      // machuca quem está dentro, a cada pedaço
      z.tick -= dt;
      if (z.tick <= 0) {
        z.tick = Z.intervalo;
        for (const o of this.b.alvosDe(z.c)) {
          const dx = o.pos.x - z.x, dz = o.pos.z - z.z, d = Math.hypot(dx, dz);
          if (d > R + o.raio * 0.3) continue;
          const primeiro = !z.primeiro.has(o);
          z.primeiro.add(o);
          this.b.aplicarDano(z.c, o, z.gp, new THREE.Vector3(dx, 0, dz).normalize(), { fator: Z.poderTick / z.gp.poder, leve: true, primeiro, empurrao: 0 });
          this.folhinha(o.pos.clone().setY(0.4), new THREE.Vector3((Math.random() - 0.5) * 2, 2, (Math.random() - 0.5) * 2), 0.5, Z.visual === 'bosque' ? RAIZ : ESPINHO);
        }
      }
      // Bosque Vivo: cura quem plantou enquanto estiver dentro (a cada segundo)
      if (Z.cura) {
        z.curaT -= dt;
        const c = z.c;
        if (z.curaT <= 0) {
          z.curaT = 1;
          if (Math.hypot(c.pos.x - z.x, c.pos.z - z.z) <= R) {
            this.b.curar(c, Z.cura);
            this.b.particulas(c.pos, '#7dff8a', 6, 0.6);
          }
        }
      }
    }
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    this.atualizarZonas(dt);
  }

  // Para a vinha (desmaiou, capturado, trocado...). Moita e bosque somem sozinhos quando o dono sai.
  parar(c) {
    this.pararVinha(c);
  }
}
