// =============================================================
// PLATAFORMA DE EXIBIÇÃO
// Mostra uma linha evolutiva inteira lado a lado, em pedestais,
// com setas entre as formas. É usada no Monstruário e na escolha
// do monstro inicial. Também tem a cena de evolução.
// =============================================================
import * as THREE from 'three';
import { ESPECIES, ELEMENTOS } from './dados.js';
import { criarModelo, animarModelo, piscar, descartar } from './modelos.js';

function luzes(cena) {
  cena.add(new THREE.HemisphereLight('#d6f0ff', '#5d7a3e', 1.8));
  const sol = new THREE.DirectionalLight('#fff1d6', 1.8);
  sol.position.set(4, 10, 8);
  cena.add(sol);
}

export class Plataforma {
  constructor(jogo) {
    this.jogo = jogo;
    this.cena = new THREE.Scene();
    this.cena.background = new THREE.Color('#9fd8ff');
    this.cena.fog = new THREE.Fog('#9fd8ff', 30, 80);
    luzes(this.cena);
    const chao = new THREE.Mesh(new THREE.CircleGeometry(60, 28).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#8bd65e', flatShading: true }));
    this.cena.add(chao);
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    this.grupo = new THREE.Group();
    this.cena.add(this.grupo);
    this.itens = [];
    this.sel = 0;
    this.raycaster = new THREE.Raycaster();
    this.largura = 6;
    this.altura = 2;
  }

  // ids = lista de espécies; setas = desenhar setas de evolução entre elas
  mostrar(ids, setas, sel = 0) {
    descartar(this.grupo);
    this.cena.remove(this.grupo);
    this.grupo = new THREE.Group();
    this.cena.add(this.grupo);
    this.itens = [];
    // Mede a largura real de cada modelo, para nenhum invadir o pedestal do vizinho
    const modelos = ids.map((id) => criarModelo(id));
    const caixa = new THREE.Box3();
    const larguras = modelos.map((m) => {
      caixa.setFromObject(m);
      return Math.max(1.4, Math.max(caixa.max.x - caixa.min.x, (caixa.max.z - caixa.min.z) * 0.8) + 0.15);
    });
    const vao = 0.7;
    this.largura = larguras.reduce((s, w) => s + w, 0) + vao * (ids.length - 1);
    this.altura = Math.max(...ids.map((id) => ESPECIES[id].altura)) + 0.3;
    let x = -this.largura / 2;
    const pedra = new THREE.MeshLambertMaterial({ color: '#e3dccb', flatShading: true });
    ids.forEach((id, i) => {
      const w = larguras[i];
      const cx = x + w / 2;
      const cor = ELEMENTOS[ESPECIES[id].elemento].cor;
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.42, w * 0.48, 0.3, 8), pedra.clone());
      pedestal.position.set(cx, 0.15, 0);
      const aro = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.43, w * 0.43, 0.05, 8), new THREE.MeshLambertMaterial({ color: cor, emissive: cor, emissiveIntensity: 0 }));
      aro.position.set(cx, 0.31, 0);
      const modelo = modelos[i];
      modelo.position.set(cx, 0.32, 0);
      this.grupo.add(pedestal, aro, modelo);
      this.itens.push({ id, modelo, pedestal, aro, x: cx });
      x += w;
      if (setas && i < ids.length - 1) {
        const seta = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 3), new THREE.MeshBasicMaterial({ color: '#fff6e3' }));
        seta.rotation.z = -Math.PI / 2;
        seta.position.set(x + vao / 2, 0.35, 0.3);
        this.grupo.add(seta);
      }
      x += vao;
    });
    this.sel = sel;
  }

  // Enquadra a câmera para os monstros caberem no retângulo livre da tela (em pixels)
  enquadrar(ret) {
    const W = this.jogo.palco.clientWidth, H = this.jogo.palco.clientHeight;
    if (!W || !H || !ret.width || !ret.height) return;
    this.camera.aspect = W / H;
    const tanF = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const dW = (this.largura + 0.8) / (2 * tanF * (W / H) * (ret.width / W));
    const dH = (this.altura + 0.8) / (2 * tanF * (ret.height / H));
    const d = Math.max(dW, dH, 4);
    this.camera.position.set(0, this.altura * 0.5 + d * 0.16, d);
    this.camera.lookAt(0, this.altura * 0.42, 0);
    this.camera.setViewOffset(W, H, W / 2 - (ret.left + ret.width / 2), H / 2 - (ret.top + ret.height / 2), W, H);
    this.camera.updateProjectionMatrix();
  }

  atualizar(dt, t) {
    this.itens.forEach((it, i) => {
      const escolhido = i === this.sel;
      const m = it.modelo;
      m.rotation.y = escolhido ? m.rotation.y + dt * 1.6 : Math.sin(t * 0.6 + i) * 0.35;
      m.position.y = 0.32 + (escolhido ? Math.abs(Math.sin(t * 4)) * 0.25 : 0);
      it.aro.material.emissiveIntensity = escolhido ? 0.7 : 0;
      animarModelo(m, t, escolhido);
    });
  }

  // Descobre em qual monstro o jogador tocou (x, y em pixels do palco)
  tocarEm(x, y) {
    const W = this.jogo.palco.clientWidth, H = this.jogo.palco.clientHeight;
    this.raycaster.setFromCamera(new THREE.Vector2((x / W) * 2 - 1, -(y / H) * 2 + 1), this.camera);
    const alvos = this.itens.flatMap((it) => [it.modelo, it.pedestal]);
    const hit = this.raycaster.intersectObjects(alvos, true)[0];
    if (!hit) return -1;
    return this.itens.findIndex((it) => {
      let o = hit.object;
      while (o) { if (o === it.modelo || o === it.pedestal) return true; o = o.parent; }
      return false;
    });
  }
}

// Cena de evolução: o monstro gira, brilha e alterna com a nova forma
export class CenaEvolucao {
  constructor(jogo, de, para) {
    this.jogo = jogo;
    this.cena = new THREE.Scene();
    this.cena.background = new THREE.Color('#1b2550');
    luzes(this.cena);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.3, 10), new THREE.MeshLambertMaterial({ color: '#e3dccb', flatShading: true }));
    pedestal.position.y = 0.15;
    this.cena.add(pedestal);
    this.anel = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.05, 4, 40), new THREE.MeshBasicMaterial({ color: ELEMENTOS[ESPECIES[para].elemento].cor, transparent: true, opacity: 0.8 }));
    this.anel.rotation.x = Math.PI / 2;
    this.anel.position.y = 0.4;
    this.cena.add(this.anel);
    this.camera = new THREE.PerspectiveCamera(40, jogo.aspecto, 0.1, 100);
    this.velho = criarModelo(de);
    this.novo = criarModelo(para);
    for (const m of [this.velho, this.novo]) { m.position.y = 0.3; this.cena.add(m); }
    this.novo.visible = false;
    this.altura = Math.max(ESPECIES[de].altura, ESPECIES[para].altura);
    this.t = 0;
    this.trocou = false;
    this.particulas = [];
  }

  get pronto() { return this.t > 3.4; }

  atualizar(dt, t) {
    this.t += dt;
    const d = (this.altura + 1.5) / (2 * Math.tan(THREE.MathUtils.degToRad(20)) * Math.min(1, this.jogo.aspecto)) + 1;
    this.camera.aspect = this.jogo.aspecto;
    this.camera.position.set(0, this.altura * 0.55 + 1.2, d);
    this.camera.lookAt(0, this.altura * 0.45, 0);
    this.camera.updateProjectionMatrix();
    this.anel.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    this.anel.rotation.z = t;
    if (!this.trocou) {
      const k = Math.min(1, this.t / 2.4);
      this.velho.rotation.y += dt * (2 + k * 14);
      this.novo.rotation.y = this.velho.rotation.y;
      piscar(this.velho, k, '#ffffff');
      piscar(this.novo, 1, '#ffffff');
      // nos últimos instantes, alterna entre a forma velha e a nova
      if (this.t > 1.3) {
        const alterna = Math.floor(this.t * (6 + this.t * 4)) % 2 === 0;
        this.velho.visible = alterna;
        this.novo.visible = !alterna;
      }
      if (this.t >= 2.4) {
        this.trocou = true;
        this.velho.visible = false;
        this.novo.visible = true;
        piscar(this.novo, 0);
        this.explodir();
      }
    } else {
      this.novo.rotation.y += dt * 0.8;
      animarModelo(this.novo, t, false);
    }
    for (let i = this.particulas.length - 1; i >= 0; i--) {
      const pt = this.particulas[i];
      pt.vida -= dt;
      pt.v.y -= 6 * dt;
      pt.obj.position.addScaledVector(pt.v, dt);
      pt.obj.scale.setScalar(Math.max(0.01, pt.vida));
      if (pt.vida <= 0) { this.cena.remove(pt.obj); pt.obj.material.dispose(); this.particulas.splice(i, 1); }
    }
  }

  explodir() {
    const cor = ELEMENTOS[ESPECIES[this.novo.userData.especie].elemento].cor;
    const g = new THREE.IcosahedronGeometry(0.14, 0);
    for (let i = 0; i < 40; i++) {
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: i % 3 ? cor : '#ffffff' }));
      m.position.set(0, this.altura * 0.5, 0);
      const a = Math.random() * Math.PI * 2, f = 3 + Math.random() * 5;
      this.cena.add(m);
      this.particulas.push({ obj: m, v: new THREE.Vector3(Math.cos(a) * f, 2 + Math.random() * 5, Math.sin(a) * f), vida: 1.2 });
    }
  }

  descartarTudo() { descartar(this.cena); }
}
