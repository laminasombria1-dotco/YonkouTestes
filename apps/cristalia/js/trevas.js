// =============================================================
// VISUAL DOS GOLPES DE TREVAS
// Só muda a aparência: dano, alcance e efeitos continuam em batalha.js.
// Cada forma da linha de Trevas ganha algo novo:
//  Breuzinho  -> bola com olhos, poça de breu com tentáculos, rastro de fumaça
//  Sombrelo   -> bocarra de sombra, olhos que se abrem no impacto e na poça
//  Umbrafel   -> cópias sombrias no avanço, marcas de garra, lâminas de sombra,
//                mãos que saem do chão e agarram quem foi atingido
//  Noctífero  -> garra gigante do chão, morcegos de sombra, cópia que atira junto,
//                Abismo com o Astro Negro (a arena escurece) e um anel de olhos
// Tudo que aparece fica DENTRO da área que o golpe acerta de verdade.
// Para ficar leve no celular: as formas (geometrias) são criadas uma vez só
// e os materiais "fixos" são divididos entre todos os golpes.
// =============================================================
import * as THREE from 'three';
import { MAT_SOMBRA } from './modelos.js';

// ---------- formas (criadas uma vez) ----------
function triangulo() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.75, 0.05, 0.1, 0.4, 0, -0.38, 0, 0, 0, 0.4, 0, -0.38, 0.15, 0, -0.2], 3));
  g.computeVertexNormals();
  return g;
}
const G = {
  poca: new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2),
  anel: new THREE.RingGeometry(0.86, 1, 36).rotateX(-Math.PI / 2),
  esf: new THREE.SphereGeometry(1, 10, 8),
  fumaca: new THREE.IcosahedronGeometry(1, 0),
  cone: new THREE.ConeGeometry(1, 1, 5).translate(0, 0.5, 0),   // base no chão, ponta para cima
  dente: new THREE.ConeGeometry(1, 1, 4).translate(0, -0.5, 0), // ponta para baixo
  caixa: new THREE.BoxGeometry(1, 1, 1),
  lamina: new THREE.OctahedronGeometry(1, 0),
  corte: new THREE.PlaneGeometry(1, 1),
  coroa: new THREE.TorusGeometry(1, 0.07, 5, 36),
  asa: triangulo(),
};

// ---------- materiais fixos (não são descartados no fim da batalha) ----------
function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1, extra = {}) => new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1, ...extra });
const MAT = {
  preto: fixo(basico('#0b0414')),
  fumaca: fixo(basico('#1c0b2e', 0.7)),
  olho: fixo(basico('#f2b0ff')),
  casca: fixo(basico('#9a4ae0', 0.35)),
  asa: fixo(basico('#1a0a2a', 1, { side: THREE.DoubleSide })),
};
// materiais de um golpe só (para sumirem juntos, sem afetar os outros golpes)
function matsDoGolpe() {
  return {
    preto: basico('#0b0414', 0.9),
    roxo: basico('#b57be8', 0.85, { side: THREE.DoubleSide }),
    sombra: basico('#12061e', 0.55),
    mao: basico('#3a1658', 0.95), // roxo bem escuro: aparece em cima da poça preta
  };
}

const sobe = (k, ini, fim) => Math.min(1, Math.max(0, (k - ini) / (fim - ini)));

export class VisualTrevas {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.medo = new Map(); // olhos que flutuam atrás de quem está com Medo
  }

  // Este lutador usa o visual de Trevas? (só a linha de Trevas)
  dele(c) { return c.esp.linha === 'trevas'; }

  // registra um efeito que se apaga sozinho (a batalha cuida do tempo)
  efeito(obj, vida, upd, mats = null) {
    this.cena.add(obj);
    this.b.efeitos.push({ obj, vida, total: vida, upd, mats: mats ? Object.values(mats) : [] });
  }

  apagar(mats, f) {
    for (const m of Object.values(mats)) {
      if (m.userData.op0 == null) m.userData.op0 = m.opacity;
      m.opacity = m.userData.op0 * f;
    }
  }

  // ---------- peças ----------
  // par de olhos (amendoados) que piscam
  parOlhos(tam = 1) {
    const g = new THREE.Group();
    for (const s of [-1, 1]) {
      const o = new THREE.Mesh(G.esf, MAT.olho);
      o.scale.set(0.13 * tam, 0.06 * tam, 0.05 * tam);
      o.position.x = s * 0.17 * tam;
      o.rotation.z = -s * 0.25;
      g.add(o);
    }
    return g;
  }

  fumaca(pos, tam = 0.22, vida = 0.45) {
    const m = new THREE.Mesh(G.fumaca, MAT.fumaca);
    m.position.copy(pos);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    const v = new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.6 + Math.random() * 0.6, (Math.random() - 0.5) * 0.8);
    this.efeito(m, vida, (e, k, dt) => {
      e.obj.position.addScaledVector(v, dt);
      e.obj.scale.setScalar(tam * (0.6 + k * 0.8) * (1 - k * k));
    });
  }

  nuvem(pos, n = 6, tam = 0.3) {
    for (let i = 0; i < n; i++) {
      const p = pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.6, (Math.random() - 0.5) * 0.8));
      this.fumaca(p, tam * (0.7 + Math.random() * 0.6), 0.5 + Math.random() * 0.3);
    }
  }

  // olhos que se abrem num ponto, piscam e fecham
  olhosEm(pos, tam = 1, vida = 0.7, deitado = false) {
    const g = this.parOlhos(tam);
    g.position.copy(pos);
    if (deitado) g.rotation.x = -Math.PI / 2;
    else g.lookAt(this.b.camera.position);
    g.rotation.z += (Math.random() - 0.5) * 0.3;
    const atraso = Math.random() * 0.2;
    this.efeito(g, vida + atraso, (e, k) => {
      const t = Math.max(0, k * (vida + atraso) - atraso) / vida;
      const aberto = Math.sin(Math.min(1, t) * Math.PI);
      e.obj.scale.set(1, Math.max(0.02, aberto * (t > 0.45 && t < 0.55 ? 0.2 : 1)), 1); // pisca no meio
    });
  }

  // Cópia sombria: uma silhueta preta do monstro, na pose de agora, que some
  copiaSombria(c, desloc = null, vida = 0.45, comOlhos = false) {
    const mats = { sombra: matsDoGolpe().sombra };
    const g = new THREE.Group();
    c.modelo.updateMatrixWorld(true);
    c.modelo.traverse((o) => {
      if (!o.isMesh || o.material === MAT_SOMBRA || !o.visible) return;
      const m = new THREE.Mesh(o.geometry, mats.sombra);
      m.matrixAutoUpdate = false;
      m.matrix.copy(o.matrixWorld);
      g.add(m);
    });
    if (desloc) g.position.copy(desloc);
    if (comOlhos) {
      const o = this.parOlhos(1.2);
      const frente = new THREE.Vector3(Math.sin(c.ang), 0, Math.cos(c.ang));
      o.position.copy(c.pos).addScaledVector(frente, c.raio * 0.9).setY(c.altura * 0.62);
      o.rotation.y = c.ang;
      g.add(o);
    }
    this.efeito(g, vida, (e, k) => this.apagar(mats, k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8), mats);
  }

  // ---------- golpe de perto ----------
  // chamado quando o monstro começa a avançar
  avancar(c) {
    const est = c.esp.estagio;
    const obj = new THREE.Group();
    let feitas = 0;
    this.efeito(obj, 0.2, (e, k) => {
      if (est < 2) { // Breuzinho e Sombrelo: rastro de fumaça preta
        if (Math.random() < 0.7) this.fumaca(c.pos.clone().setY(0.5 + Math.random() * 0.5), 0.28);
      } else if (k >= feitas / 3 && feitas < 3) { // Umbrafel e Noctífero: 3 cópias sombrias pelo caminho
        feitas++;
        this.copiaSombria(c, null, 0.45);
      }
    });
  }

  // chamado quando o golpe de perto acerta
  acertoPerto(c, alvo) {
    const est = c.esp.estagio;
    const dir = new THREE.Vector3(alvo.pos.x - c.pos.x, 0, alvo.pos.z - c.pos.z).normalize();
    if (est === 0) { this.nuvem(alvo.pos.clone().setY(0.7), 5); return; }
    if (est === 1) { this.bocarra(alvo, dir); return; }
    this.cortes(alvo, est === 3 ? 4 : 3);
    if (est === 3) this.garraDoChao(alvo);
  }

  // Sombrelo: uma bocarra de sombra aparece em volta do alvo e fecha
  bocarra(alvo, dir) {
    const mats = matsDoGolpe();
    mats.dente = basico('#f2b0ff', 0.95);
    const s = 0.9 + alvo.raio * 0.8;
    const g = new THREE.Group();
    g.position.copy(alvo.pos).setY(alvo.altura * 0.45);
    g.rotation.y = Math.atan2(-dir.x, -dir.z); // a boca "olha" para quem mordeu
    g.scale.setScalar(s);
    const maxila = (lado) => {
      const q = new THREE.Group();
      q.position.z = -0.7; // dobradiça atrás do alvo
      const placa = new THREE.Mesh(G.esf, mats.sombra);
      placa.scale.set(0.8, 0.13, 0.75);
      placa.position.set(0, lado * 0.07, 0.7);
      q.add(placa);
      // dentes na frente e dos lados
      for (let i = 0; i < 9; i++) {
        const t = new THREE.Mesh(G.dente, mats.dente);
        const a = (i / 8 - 0.5) * 2.6;
        t.position.set(Math.sin(a) * 0.66, 0, 0.7 + Math.cos(a) * 0.62);
        t.scale.set(0.09, 0.42, 0.09);
        if (lado < 0) t.rotation.x = Math.PI;
        q.add(t);
      }
      q.userData.lado = lado;
      g.add(q);
      return q;
    };
    const cima = maxila(1), baixo = maxila(-1);
    cima.position.y = 0.55; baixo.position.y = -0.45;
    this.efeito(g, 0.6, (e, k) => {
      const fecha = sobe(k, 0, 0.3);
      const abre = (1 - fecha * fecha) * 0.9;
      cima.rotation.x = -abre;
      baixo.rotation.x = abre * 0.7;
      cima.position.y = 0.55 - fecha * 0.4;
      baixo.position.y = -0.45 + fecha * 0.3;
      e.obj.scale.setScalar(s * (1 + (k > 0.3 ? (k - 0.3) * 0.25 : 0)));
      this.apagar(mats, k < 0.45 ? 1 : 1 - (k - 0.45) / 0.55);
    }, mats);
  }

  // Umbrafel e Noctífero: marcas de garra roxas rasgando o ar
  cortes(alvo, n) {
    const mats = matsDoGolpe();
    const g = new THREE.Group();
    g.position.copy(alvo.pos).setY(alvo.altura * 0.55);
    g.lookAt(this.b.camera.position);
    const s = 1 + alvo.raio * 0.6;
    const riscos = [];
    for (let i = 0; i < n; i++) {
      const r = new THREE.Mesh(G.corte, mats.roxo);
      r.position.x = (i - (n - 1) / 2) * 0.32 * s;
      r.rotation.z = 0.6;
      r.scale.set(0.1 * s, 0.01, 1);
      g.add(r);
      riscos.push(r);
    }
    this.efeito(g, 0.5, (e, k) => {
      riscos.forEach((r, i) => { r.scale.y = 2.1 * s * sobe(k, i * 0.05, i * 0.05 + 0.15); });
      this.apagar(mats, 1 - sobe(k, 0.35, 1));
    }, mats);
  }

  // Noctífero: uma garra gigante de 4 unhas brota do chão embaixo do alvo e fecha
  garraDoChao(alvo) {
    const mats = matsDoGolpe();
    const g = new THREE.Group();
    g.position.set(alvo.pos.x, 0, alvo.pos.z);
    const unhas = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const u = new THREE.Group();
      u.position.set(Math.cos(a) * (alvo.raio + 0.5), 0, Math.sin(a) * (alvo.raio + 0.5));
      u.rotation.order = 'YXZ';
      u.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); // aponta para o centro
      const m = new THREE.Mesh(G.cone, mats.mao);
      m.scale.set(0.24, 2.6 + alvo.altura * 0.4, 0.24);
      u.add(m);
      g.add(u);
      unhas.push(u);
    }
    const poca = new THREE.Mesh(G.poca, mats.preto);
    poca.position.y = 0.05;
    poca.scale.setScalar(alvo.raio + 1);
    const borda = new THREE.Mesh(G.anel, mats.roxo);
    borda.position.y = 0.06;
    borda.scale.setScalar(alvo.raio + 1);
    g.add(poca, borda);
    this.efeito(g, 0.75, (e, k) => {
      const ergue = sobe(k, 0, 0.25), fecha = sobe(k, 0.25, 0.45), desce = sobe(k, 0.7, 1);
      for (const u of unhas) {
        u.position.y = -2.8 * (1 - ergue) - 2.8 * desce;
        u.rotation.x = -0.5 + fecha * 1.0; // de aberta (para fora) a fechada (para dentro)
      }
      this.apagar(mats, 1 - desce);
    }, mats);
  }

  // ---------- disparo ----------
  // Devolve o objeto 3D do tiro de Trevas conforme a forma
  projetil(c, ang) {
    const est = c.esp.estagio;
    const g = new THREE.Group();
    g.rotation.y = ang;
    const info = { obj: g, est, t: 0, fumacaT: 0, ang };
    if (est <= 1) { // bola de breu com olhos
      const nucleo = new THREE.Mesh(G.esf, MAT.preto); nucleo.scale.setScalar(0.3);
      const casca = new THREE.Mesh(G.esf, MAT.casca); casca.scale.setScalar(0.42);
      const olhos = this.parOlhos(0.75); olhos.position.set(0, 0.05, 0.3);
      g.add(nucleo, casca, olhos);
      info.casca = casca;
    } else if (est === 2) { // lâmina de sombra
      const nucleo = new THREE.Mesh(G.lamina, MAT.preto); nucleo.scale.set(0.16, 0.2, 0.75);
      const casca = new THREE.Mesh(G.lamina, MAT.casca); casca.scale.set(0.26, 0.3, 0.95);
      g.add(nucleo, casca);
      info.casca = casca;
    } else { // morcego de sombra
      const corpo = new THREE.Mesh(G.esf, MAT.preto); corpo.scale.set(0.16, 0.14, 0.22);
      const olhos = this.parOlhos(0.45); olhos.position.set(0, 0.06, 0.18);
      g.add(corpo, olhos);
      info.asas = [-1, 1].map((s) => {
        const a = new THREE.Group();
        const m = new THREE.Mesh(G.asa, MAT.asa);
        m.scale.set(s * 0.9, 1, 0.9);
        a.add(m);
        g.add(a);
        return a;
      });
    }
    return info;
  }

  // a cada quadro, depois que o tiro andou
  atualizarProjetil(p, dt) {
    const info = p.trevas;
    info.t += dt;
    info.fumacaT -= dt;
    if (info.fumacaT <= 0) { info.fumacaT = 0.07; this.fumaca(p.pos.clone(), info.est === 3 ? 0.14 : 0.2, 0.35); }
    if (info.casca) info.casca.scale.multiplyScalar(1 + Math.sin(info.t * 25) * 0.04);
    if (info.est === 2) { // ondula de leve (só o desenho; o tiro continua em linha reta)
      const lado = Math.sin(info.t * 22) * 0.18;
      p.mesh.position.x += Math.cos(info.ang) * lado;
      p.mesh.position.z -= Math.sin(info.ang) * lado;
    }
    if (info.asas) {
      const bate = Math.sin(info.t * 30) * 0.7;
      info.asas[0].rotation.z = -bate;
      info.asas[1].rotation.z = bate;
      p.mesh.position.y += Math.sin(info.t * 15) * 0.08;
    }
  }

  // quando o tiro acerta alguém ou bate num obstáculo
  impacto(p) {
    const pos = p.pos.clone();
    this.nuvem(pos, 4, 0.26);
    if (p.trevas.est >= 1) this.olhosEm(pos.clone().setY(pos.y + 0.4), 1.1, 0.6);
  }

  // Noctífero: uma cópia sombria aparece atrás e atira junto (só o desenho)
  aoDisparar(c, dir) {
    if (c.esp.estagio < 3) return;
    this.copiaSombria(c, dir.clone().multiplyScalar(-1.6).setY(0.15), 0.7, true);
  }

  // ---------- área ----------
  // atingidos = quem levou dano (as mãos agarram cada um)
  area(c, gp, atingidos) {
    const est = c.esp.estagio, R = gp.raio;
    const mats = matsDoGolpe();
    const final = est === 3;
    const vida = final ? 1.8 : est === 2 ? 1.3 : 1.1;
    const g = new THREE.Group();
    g.position.set(c.pos.x, 0, c.pos.z);

    // a poça de breu que se espalha
    const poca = new THREE.Mesh(G.poca, mats.preto);
    poca.position.y = 0.05;
    const borda = new THREE.Mesh(G.anel, mats.roxo);
    borda.position.y = 0.07;
    g.add(poca, borda);

    // tentáculos (Breuzinho e Sombrelo) ou mãos (Umbrafel e Noctífero)
    const pecas = [];
    const qtd = est < 2 ? 6 : final ? 9 : 6;
    for (let i = 0; i < qtd; i++) {
      const a = (i / qtd) * Math.PI * 2 + Math.random() * 0.4;
      const d = R * (est < 2 ? 0.35 + Math.random() * 0.45 : 0.72);
      const peca = est < 2 ? this.tentaculo(mats) : this.mao(mats, final ? 1.35 : 1);
      peca.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      peca.rotation.order = 'YXZ';
      peca.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); // de frente para o centro
      peca.userData.atraso = Math.random() * 0.12;
      peca.userData.fase = Math.random() * 6;
      g.add(peca);
      pecas.push(peca);
    }

    // olhos dentro da poça (Sombrelo em diante) ou um anel de olhos (Noctífero)
    if (est >= 1) {
      const nOlhos = final ? 10 : 4;
      for (let i = 0; i < nOlhos; i++) {
        const a = (i / nOlhos) * Math.PI * 2 + (final ? 0 : Math.random());
        const d = final ? R * 0.93 : R * (0.25 + Math.random() * 0.5);
        this.olhosEm(new THREE.Vector3(c.pos.x + Math.cos(a) * d, 0.1, c.pos.z + Math.sin(a) * d), final ? 1.4 : 1.2, vida * 0.75, true);
      }
    }

    // mãos que agarram quem foi atingido (Umbrafel em diante)
    if (est >= 2) for (const alvo of atingidos) this.agarrar(alvo, final);

    // Noctífero: o Astro Negro sobe e a arena escurece
    if (final) {
      this.astroNegro(c, vida);
      this.b.arena.escurecer(vida);
    }

    this.efeito(g, vida, (e, k, dt) => {
      const abre = sobe(k, 0, 0.22), some = sobe(k, 0.72, 1);
      poca.scale.setScalar(R * (0.2 + 0.8 * abre));
      borda.scale.setScalar(R * (0.2 + 0.8 * abre));
      for (const p of pecas) {
        const kk = Math.max(0, k - p.userData.atraso);
        const ergue = sobe(kk, 0.08, 0.32), desce = sobe(kk, 0.66, 0.95);
        p.position.y = -1.6 * (1 - ergue) - 1.8 * desce;
        if (est < 2) { // tentáculo se contorce
          p.rotation.x = 0.35 + Math.sin(this.b.t * 6 + p.userData.fase) * 0.35;
          p.rotation.z = Math.cos(this.b.t * 5 + p.userData.fase) * 0.3;
        } else { // a mão se inclina para dentro, agarrando
          p.rotation.x = -0.3 + sobe(kk, 0.32, 0.5) * 1.2;
        }
      }
      if (Math.random() < (final ? 0.5 : 0.25)) {
        const a = Math.random() * Math.PI * 2, d = Math.random() * R * 0.8;
        this.fumaca(new THREE.Vector3(c.pos.x + Math.cos(a) * d, 0.2, c.pos.z + Math.sin(a) * d), 0.35, 0.6);
      }
      this.apagar(mats, 1 - some);
    }, mats);
  }

  tentaculo(mats) {
    const t = new THREE.Group();
    const base = new THREE.Mesh(G.cone, mats.mao);
    base.scale.set(0.24, 2.3, 0.24);
    const ponta = new THREE.Mesh(G.esf, mats.roxo);
    ponta.scale.setScalar(0.1);
    ponta.position.y = 2.0;
    t.add(base, ponta);
    return t;
  }

  // mão de sombra: palma, 4 dedos e o polegar (o pulso fica no chão)
  mao(mats, s = 1) {
    const m = new THREE.Group();
    const palma = new THREE.Mesh(G.caixa, mats.mao);
    palma.scale.set(0.5, 0.6, 0.14);
    palma.position.y = 0.6;
    const pulso = new THREE.Mesh(G.cone, mats.mao);
    pulso.scale.set(0.2, 0.45, 0.12);
    m.add(palma, pulso);
    for (let i = 0; i < 4; i++) {
      const d = new THREE.Mesh(G.cone, mats.mao);
      d.scale.set(0.065, 0.5 + (i === 1 || i === 2 ? 0.1 : 0), 0.065);
      d.position.set((i - 1.5) * 0.13, 0.88, 0);
      d.rotation.x = 0.35; // dedos curvados, como garras
      m.add(d);
    }
    const pol = new THREE.Mesh(G.cone, mats.mao);
    pol.scale.set(0.06, 0.38, 0.06);
    pol.position.set(0.28, 0.5, 0);
    pol.rotation.z = -0.8;
    m.add(pol);
    m.scale.setScalar(s * 1.3);
    return m;
  }

  // 5 dedos saem do chão em volta do alvo e se fecham sobre ele
  agarrar(alvo, final) {
    const mats = matsDoGolpe();
    const g = new THREE.Group();
    g.position.set(alvo.pos.x, 0, alvo.pos.z);
    const dedos = [];
    const r = alvo.raio + 0.25;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const d = new THREE.Group();
      d.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      d.rotation.order = 'YXZ';
      d.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
      const m = new THREE.Mesh(G.cone, mats.mao);
      m.scale.set(0.13, alvo.altura * (final ? 0.95 : 0.8), 0.13);
      d.add(m);
      g.add(d);
      dedos.push(d);
    }
    this.efeito(g, 1.0, (e, k) => {
      const ergue = sobe(k, 0.1, 0.3), fecha = sobe(k, 0.3, 0.5), desce = sobe(k, 0.75, 1);
      for (const d of dedos) {
        d.position.y = -alvo.altura * (1 - ergue) - alvo.altura * desce;
        d.rotation.x = -0.25 + fecha * 0.75;
      }
      this.apagar(mats, 1 - desce);
    }, mats);
  }

  // Esfera preta com uma coroa de fogo roxo, bem acima do Noctífero
  astroNegro(c, vida) {
    const mats = matsDoGolpe();
    const g = new THREE.Group();
    const astro = new THREE.Mesh(G.esf, mats.preto);
    const brilho = new THREE.Mesh(G.esf, mats.sombra);
    brilho.material = mats.roxo.clone();
    brilho.material.opacity = 0.22;
    mats.brilho = brilho.material;
    const coroa = new THREE.Mesh(G.coroa, mats.roxo);
    const coroa2 = new THREE.Mesh(G.coroa, mats.roxo);
    g.add(astro, brilho, coroa, coroa2);
    g.position.set(c.pos.x, 2.5, c.pos.z);
    // raios de sombra saindo da coroa
    const raios = [];
    for (let i = 0; i < 10; i++) {
      const r = new THREE.Mesh(G.lamina, mats.roxo);
      const a = (i / 10) * Math.PI * 2;
      r.position.set(Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0);
      r.rotation.z = a;
      r.scale.set(0.42, 0.06, 0.06);
      raios.push(r);
    }
    const disco = new THREE.Group();
    disco.add(coroa, coroa2, ...raios);
    g.add(disco);
    this.efeito(g, vida, (e, k) => {
      const ergue = sobe(k, 0, 0.25), some = sobe(k, 0.75, 1);
      e.obj.position.y = 1.6 + ergue * 1.5 + c.altura * 0.35;
      const s = 0.3 + ergue * 0.9 - some * 0.5;
      astro.scale.setScalar(1.05 * s);
      brilho.scale.setScalar(1.7 * s * (1 + Math.sin(this.b.t * 10) * 0.05));
      disco.lookAt(this.b.camera.position);
      disco.rotateZ(this.b.t * 0.8);
      coroa.scale.setScalar(1.3 * s);
      coroa2.scale.setScalar(1.12 * s * (1 + Math.sin(this.b.t * 14) * 0.06));
      for (const r of raios) r.position.setLength(1.55 * s);
      raios.forEach((r) => r.scale.setScalar(1).set(0.42 * s * (1 + Math.sin(this.b.t * 12 + r.rotation.z * 3) * 0.3), 0.06 * s, 0.06 * s));
      this.apagar(mats, 1 - some);
    }, mats);
  }

  // ---------- Medo: olhos roxos flutuando atrás de quem está com medo ----------
  atualizar() {
    const b = this.b;
    const presentes = new Set([b.jog, ...b.inimigos]);
    for (const [l, olhos] of this.medo) {
      if (!presentes.has(l) || !l.tem('medo') || l.morto || !l.modelo.visible) {
        this.cena.remove(olhos);
        this.medo.delete(l);
      }
    }
    for (const l of presentes) {
      if (l.morto || !l.tem('medo') || !l.modelo.visible) continue;
      let olhos = this.medo.get(l);
      if (!olhos) {
        olhos = this.parOlhos(1.7);
        this.cena.add(olhos);
        this.medo.set(l, olhos);
      }
      const atras = new THREE.Vector3(-Math.sin(l.ang), 0, -Math.cos(l.ang));
      olhos.position.copy(l.pos).addScaledVector(atras, l.raio + 0.6).setY(l.altura + 0.35 + Math.sin(b.t * 2.5) * 0.12);
      olhos.lookAt(b.camera.position);
      const ciclo = (b.t * 0.7) % 1; // pisca de vez em quando
      olhos.scale.y = ciclo > 0.92 ? 0.15 : 1;
    }
  }
}

