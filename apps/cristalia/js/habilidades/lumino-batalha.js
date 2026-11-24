// =============================================================
// LINHA DO LUMINO NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em lumino.js)
//  - Passo de Luz / Prismático / Celestial: some e aparece para onde o joystick aponta
//    (sem apontar: na direção do alvo; o inimigo vai na sua direção). Cristais saem do chão
//    onde ele some e/ou onde aparece e acertam quem estiver perto. Obstáculos seguram o passo.
//  - Estilhaço: cristal que, ao acertar alguém ou chegar no alcance, se divide em vários
//    raios para a frente (eles não acertam de novo quem levou o cristal).
//  - Redoma: bolha de luz em volta dele. Devolve os tiros que voam (bolas, cristais, luas...)
//    e diminui o outro dano que ele recebe. No fim solta um clarão; no Aurealis (Julgamento)
//    também caem colunas de luz nos inimigos.
// Para ficar leve no celular: formas e materiais são criados uma vez só e reaproveitados.
// =============================================================
import * as THREE from 'three';

// formas (uma vez só)
const GEO_CRISTAL = new THREE.OctahedronGeometry(1, 0);
const GEO_ESF = new THREE.SphereGeometry(1, 14, 10);
const GEO_DOMO = new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.92, 1, 40).rotateX(-Math.PI / 2);
const GEO_DISCO = new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2);
const GEO_COLUNA = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true).translate(0, 0.5, 0);
const GEO_ASA = new THREE.PlaneGeometry(1, 0.25);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1, extra = {}) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1, ...extra }));
const CRISTAL = basico('#fffbe8');
const CRISTAL_CREME = basico('#fff1b8');
const NUCLEO = basico('#ffffff');
const BRILHO = basico('#fff6c8', 0.35);
const ARCO_IRIS = ['#ff6b6b', '#ffab2e', '#ffe066', '#7dff8a', '#5fd0ff', '#7a8cff', '#d08aff'].map((c) => basico(c));
const COR_LUZ = '#fff6c8';
const someMat = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });

export class HabilidadesLumino {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
  }

  // Só a linha do Lumino usa estas habilidades
  dele(c) { return c.esp.linha === 'luz'; }
  naLuta(l) { return !!l && !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }

  // brilho redondo que cresce e some (no lugar onde ele some/aparece)
  clarao(pos, tam, vida = 0.25) {
    const mat = someMat('#ffffff', 0.55);
    const m = new THREE.Mesh(GEO_ESF, mat);
    m.position.copy(pos);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, mats: [mat], upd: (e, k) => {
      e.obj.scale.setScalar(Math.max(0.01, tam * (0.4 + k)));
      mat.opacity = 0.55 * (1 - k);
    } });
  }

  // ---------- Passo de Luz ----------
  iniciarPasso(c, gp, dirAlvo, efeito) {
    const P = gp.passo;
    // para onde: o joystick (jogador), o alvo (inimigo) ou para a frente
    let d, dist = P.distancia;
    if (c.lado === 'inimigo') {
      d = dirAlvo.clone();
      const alvo = this.b.jog;
      if (alvo) dist = Math.min(P.distancia, Math.max(1.5, Math.hypot(alvo.pos.x - c.pos.x, alvo.pos.z - c.pos.z) - 1.2));
    } else if (c.mv && Math.hypot(c.mv.x, c.mv.z) > 0.05) d = new THREE.Vector3(c.mv.x, 0, c.mv.z).normalize();
    else d = dirAlvo.clone(); // sem apontar: na direção do alvo (ou para a frente, no treino)
    // anda de pouquinho em pouquinho: obstáculos seguram o passo
    let len = 0;
    for (let s = 0.3; s <= dist + 0.001; s += 0.3) {
      if (this.b.arena.bloqueia({ x: c.pos.x + d.x * s, z: c.pos.z + d.z * s }, c.raio * 0.8)) break;
      len = s;
    }
    const ini = c.pos.clone();
    const fim = ini.clone().addScaledVector(d, len);
    this.clarao(ini.clone().setY(c.altura * 0.5), 0.5 + c.raio * 0.5);
    c.pos.copy(fim);
    this.b.arena.colidir(c.pos, c.raio);
    c.ang = c.angAlvo = Math.atan2(d.x, d.z);
    c.invul = Math.max(c.invul || 0, P.invul);
    this.clarao(c.pos.clone().setY(c.altura * 0.5), 0.6 + c.raio * 0.5);
    this.rastro(ini, c.pos.clone());
    // cristais em cada ponto (cada ponto acerta cada inimigo uma vez)
    for (const qual of P.pontos) {
      const pt = qual === 'inicio' ? ini : qual === 'meio' ? ini.clone().lerp(c.pos, 0.5) : c.pos.clone();
      const forte = qual === 'fim' && P.asas;
      this.cristais(c, gp, pt, P.raio, efeito, forte ? 1.3 : 1);
      if (forte) this.asas(c);
    }
  }

  // linha de brilhos entre onde ele sumiu e onde apareceu
  rastro(a, b) {
    const n = Math.max(3, Math.round(a.distanceTo(b) / 0.6));
    for (let i = 0; i <= n; i++) {
      const m = new THREE.Mesh(GEO_CRISTAL, CRISTAL_CREME);
      m.position.copy(a).lerp(b, i / n).setY(0.6 + Math.random() * 0.4);
      const tam = 0.12 + Math.random() * 0.06;
      this.cena.add(m);
      this.b.efeitos.push({ obj: m, vida: 0.35, total: 0.35, upd: (e, k) => { e.obj.scale.setScalar(Math.max(0.01, tam * (1 - k))); e.obj.rotation.y += 0.2; } });
    }
  }

  // cristais que saem do chão em volta de um ponto e acertam quem está a até "raio" metros
  cristais(c, gp, pt, raio, efeito, fator = 1) {
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - pt.x, dz = o.pos.z - pt.z, d = Math.hypot(dx, dz);
      if (d > raio + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), { fator, efeito, empurrao: 3 });
    }
    const g = new THREE.Group();
    g.position.set(pt.x, 0, pt.z);
    const pecas = [];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(GEO_CRISTAL, i % 2 ? CRISTAL : CRISTAL_CREME);
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, r = raio * (0.45 + Math.random() * 0.45);
      m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      m.rotation.set((Math.random() - 0.5) * 0.6, a, (Math.random() - 0.5) * 0.6);
      m.userData.alto = 0.5 + Math.random() * 0.5;
      g.add(m);
      pecas.push(m);
    }
    const anel = new THREE.Mesh(GEO_ANEL, BRILHO);
    anel.scale.setScalar(raio);
    anel.position.y = 0.06;
    g.add(anel);
    this.cena.add(g);
    this.b.efeitos.push({ obj: g, vida: 0.55, total: 0.55, upd: (e, k) => {
      const sobe = Math.min(1, k / 0.25), some = k > 0.6 ? (k - 0.6) / 0.4 : 0;
      for (const m of pecas) {
        const h = m.userData.alto * sobe * (1 - some);
        m.scale.set(0.16 * (1 - some) + 0.01, Math.max(0.01, h), 0.16 * (1 - some) + 0.01);
        m.position.y = h * 0.5;
      }
      anel.scale.setScalar(Math.max(0.01, raio * (0.5 + sobe * 0.5) * (1 - some)));
    } });
  }

  // Aurealis: as 6 asas cortam em volta dele
  asas(c) {
    const mat = someMat('#fffbe8', 0.9);
    const g = new THREE.Group();
    g.position.set(c.pos.x, c.altura * 0.5, c.pos.z);
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(GEO_ASA, mat);
      const a = (i / 6) * Math.PI * 2;
      m.position.set(Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3);
      m.rotation.set(-Math.PI / 2, 0, -a);
      m.scale.set(1.8, 1, 1);
      g.add(m);
    }
    this.cena.add(g);
    this.b.efeitos.push({ obj: g, vida: 0.4, total: 0.4, mats: [mat], upd: (e, k) => {
      e.obj.rotation.y = k * 3;
      e.obj.scale.setScalar(0.6 + k * 0.8);
      mat.opacity = 0.9 * (1 - k);
    } });
  }

  // ---------- Estilhaço ----------
  atirarCristal(c, gp, dir, efeito) {
    const g = new THREE.Group();
    const nucleo = new THREE.Mesh(GEO_CRISTAL, NUCLEO); nucleo.scale.set(0.22, 0.32, 0.22);
    const casca = new THREE.Mesh(GEO_CRISTAL, BRILHO); casca.scale.set(0.38, 0.52, 0.38);
    g.add(nucleo, casca);
    g.rotation.y = Math.atan2(dir.x, dir.z);
    const pos = c.pos.clone().addScaledVector(dir, c.raio + 0.3).setY(0.8 * c.esp.tamanho);
    g.position.copy(pos);
    this.cena.add(g);
    this.b.projeteis.push({ mesh: g, luzCristal: { gira: nucleo, t: 0 }, fixo: true, pos, dir: dir.clone(), gp, dono: c, lado: c.lado,
      vida: gp.alcance / gp.velocidade, fator: 1, efeito });
  }

  atualizarProjetil(p, dt) {
    if (p.luzCristal) {
      p.luzCristal.t += dt;
      p.luzCristal.gira.rotation.y += dt * 10;
    } else if (p.luzRaio) p.mesh.rotation.z += dt * 12;
  }

  // o cristal se divide em raios para a frente (quem levou o cristal não leva os raios)
  dividir(p, alvo) {
    const D = p.gp.divide, n = D.raios;
    const base = Math.atan2(p.dir.x, p.dir.z);
    const atingidos = new Set(alvo ? [alvo] : []);
    this.clarao(p.pos.clone(), 0.8, 0.25);
    for (let k = 0; k < n; k++) {
      const ang = base + (n > 1 ? (k / (n - 1) - 0.5) * D.abertura : 0);
      const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
      const m = new THREE.Mesh(GEO_CRISTAL, D.arcoIris ? ARCO_IRIS[k % ARCO_IRIS.length] : CRISTAL);
      m.scale.set(0.1, 0.1, 0.45);
      const g = new THREE.Group();
      g.add(m);
      g.rotation.y = ang;
      const pos = p.pos.clone();
      g.position.copy(pos);
      this.cena.add(g);
      this.b.projeteis.push({ mesh: g, luzRaio: true, fixo: true, atingidos: new Set(atingidos), pos, dir, gp: p.gp, vel: D.vel, raio: 0.35,
        dono: p.dono, lado: p.lado, vida: D.alcance / D.vel, fator: p.fator * D.fator, efeito: p.efeito });
    }
  }

  // ---------- Redoma ----------
  iniciarRedoma(c, gp, efeito) {
    this.pararRedoma(c);
    const mat = someMat('#fff6c8', 0.22);
    const domo = new THREE.Mesh(GEO_DOMO, mat);
    const anel = new THREE.Mesh(GEO_ANEL, BRILHO);
    const g = new THREE.Group();
    g.add(domo, anel);
    g.scale.setScalar(0.01);
    this.cena.add(g);
    c.redoma = { gp, cfg: gp.redoma, R: gp.raio, t: 0, efeito, obj: g, mat, brilhoT: 0 };
    this.b.efeitoAnel(c.pos, gp.raio, COR_LUZ);
  }

  atualizarRedoma(c, dt) {
    const Q = c.redoma;
    Q.t += dt;
    if (!this.naLuta(c)) { this.pararRedoma(c); return; }
    if (Q.t >= Q.cfg.duracao) { this.fimRedoma(c); return; }
    const k = Math.min(1, Q.t / 0.2);
    Q.obj.position.set(c.pos.x, 0.05, c.pos.z);
    Q.obj.scale.setScalar(Math.max(0.01, Q.R * k * (1 + Math.sin(this.b.t * 8) * 0.015)));
    Q.mat.opacity = 0.22 + (Q.cfg.duracao - Q.t < 0.6 ? Math.sin(this.b.t * 30) * 0.08 : 0); // pisca antes de acabar
    // devolve os tiros dos inimigos que entrarem (os que voam; folha bumerangue e raio que marca não)
    for (const p of this.b.projeteis) {
      if (p.lado === c.lado || p.bumerangue || p.faisca) continue;
      if (Math.hypot(p.pos.x - c.pos.x, p.pos.z - c.pos.z) > Q.R) continue;
      const dono = p.dono;
      if (dono && !dono.morto) p.dir.set(dono.pos.x - p.pos.x, 0, dono.pos.z - p.pos.z);
      else p.dir.multiplyScalar(-1);
      if (p.dir.lengthSq() < 1e-4) p.dir.set(Math.sin(c.ang), 0, Math.cos(c.ang));
      p.dir.normalize();
      p.mesh.rotation.y = Math.atan2(p.dir.x, p.dir.z);
      p.lado = c.lado;
      p.dono = c;
      p.fator = (p.fator ?? 1) * Q.cfg.forca;
      p.atingidos = new Set();
      p.vida = Math.max(p.vida, 1.2);
      this.clarao(p.pos.clone(), 0.6, 0.2);
      if (c === this.b.jog || this.b.inimigos.includes(c)) this.b.jogo.numero('Refletiu!', p.pos.clone().setY(p.pos.y + 0.6), '#fff6c8', 'pequeno');
    }
  }

  // fim da redoma: clarão em volta (e no Julgamento, as colunas de luz)
  fimRedoma(c) {
    const Q = c.redoma;
    this.pararRedoma(c);
    this.clarao(c.pos.clone().setY(0.8), Q.R, 0.4);
    this.b.efeitoAnel(c.pos, Q.R, '#ffffff');
    this.b.particulas(c.pos, COR_LUZ, 18, 1.4);
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > Q.R + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, Q.gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), { efeito: Q.efeito, empurrao: Q.cfg.colunas ? 1 : 5 }); // no Julgamento empurra pouco: as colunas caem onde o inimigo está
    }
    if (Q.cfg.colunas) this.colunas(c, Q.gp, Q.cfg.colunas, Q.efeito);
  }

  // Julgamento: colunas de luz caem nos inimigos por perto (com aviso no chão)
  colunas(c, gp, C, efeito) {
    const perto = this.b.alvosDe(c).filter((o) => Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) <= C.alcance);
    for (let i = 0; i < C.n; i++) {
      let x, z;
      if (perto.length) {
        const o = perto[i % perto.length];
        const a = Math.random() * Math.PI * 2, r = i < perto.length ? 0 : Math.random() * 1.4;
        x = o.pos.x + Math.cos(a) * r; z = o.pos.z + Math.sin(a) * r;
      } else {
        const a = (i / C.n) * Math.PI * 2, r = C.alcance * 0.6;
        x = c.pos.x + Math.cos(a) * r; z = c.pos.z + Math.sin(a) * r;
      }
      const atraso = C.atraso + i * 0.12;
      const avisoMat = someMat('#fff6c8', 0.35), colMat = someMat('#fffbe8', 0.75);
      const g = new THREE.Group();
      g.position.set(x, 0.06, z);
      const aviso = new THREE.Mesh(GEO_DISCO, avisoMat);
      aviso.scale.setScalar(C.raio);
      const col = new THREE.Mesh(GEO_COLUNA, colMat);
      col.scale.set(C.raio * 0.8, 9, C.raio * 0.8);
      col.visible = false;
      g.add(aviso, col);
      this.cena.add(g);
      const total = atraso + 0.45;
      let caiu = false;
      this.b.efeitos.push({ obj: g, vida: total, total, mats: [avisoMat, colMat], upd: (e, k) => {
        const t = k * total;
        if (!caiu && t >= atraso) {
          caiu = true;
          col.visible = true;
          if (!c.morto) for (const o of this.b.alvosDe(c)) {
            const d = Math.hypot(o.pos.x - x, o.pos.z - z);
            if (d <= C.raio + o.raio * 0.5) this.b.aplicarDano(c, o, gp, new THREE.Vector3(0, 0, 1), { fator: C.fator, efeito, empurrao: 1 });
          }
        }
        if (!caiu) avisoMat.opacity = 0.2 + 0.25 * Math.sin(t * 20) ** 2;
        else {
          const f = (t - atraso) / 0.45;
          colMat.opacity = 0.75 * (1 - f);
          avisoMat.opacity = 0.4 * (1 - f);
          col.scale.x = col.scale.z = C.raio * 0.8 * (1 - f * 0.5);
        }
      } });
    }
  }

  pararRedoma(c) {
    const Q = c.redoma;
    if (!Q) return;
    this.cena.remove(Q.obj);
    Q.mat.dispose();
    c.redoma = null;
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (const l of [this.b.jog, ...this.b.inimigos]) if (l?.redoma) this.atualizarRedoma(l, dt);
  }

  // Para tudo (desmaiou, trocado, fim da luta...): a redoma some sem clarão
  parar(c) { this.pararRedoma(c); }
}
