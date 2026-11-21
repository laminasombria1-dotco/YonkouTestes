// Cena 3D da tela "Crie seu Invocador" (ideia 1.3): o Invocador num pedestal de pedra com um círculo
// de runas, numa sala escura. Usa o mesmo canvas do jogo (como a vitrine do Sealfolio):
// a tela em HTML só reserva o espaço (#inv-palco) e a câmera é deslocada para desenhar ali.
// Arrastar o dedo (ou o mouse) em cima do personagem gira ele.
import * as THREE from 'three';
import { criarInvocador, animarInvocador, descartarInvocador } from './invocador.js';

export class CenaCriador {
  constructor(jogo) {
    this.jogo = jogo;
    this.cena = new THREE.Scene();
    this.cena.background = new THREE.Color('#140e22');
    this.cena.fog = new THREE.Fog('#140e22', 8, 22);
    this.cena.add(new THREE.HemisphereLight('#efe6ff', '#2a1f40', 1.5));
    const sol = new THREE.DirectionalLight('#ffffff', 1.7);
    sol.position.set(3, 6, 5);
    this.cena.add(sol);
    const contra = new THREE.DirectionalLight('#b98cff', 1.1); // luz roxa por trás, contorna o personagem
    contra.position.set(-3, 3, -4);
    this.cena.add(contra);
    // chão e pedestal de 6 lados, com um anel de runas aceso
    const chao = new THREE.Mesh(new THREE.CircleGeometry(30, 24).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#1d1530' }));
    chao.position.y = -0.14;
    this.cena.add(chao);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.14, 6), new THREE.MeshLambertMaterial({ color: '#3a3049', flatShading: true }));
    pedestal.position.y = -0.07;
    this.cena.add(pedestal);
    this.anel = new THREE.Group();
    const roxo = new THREE.MeshBasicMaterial({ color: '#b98cff' });
    const anelGrande = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.018, 3, 48), roxo);
    const anelPequeno = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.01, 3, 48), roxo);
    this.anel.add(anelGrande, anelPequeno);
    for (let i = 0; i < 12; i++) { // tracinhos de runa entre os dois anéis
      const a = (i / 12) * Math.PI * 2;
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.005, 0.09), roxo);
      r.position.set(Math.cos(a) * 0.71, 0, Math.sin(a) * 0.71);
      r.rotation.y = -a + (i % 2 ? 0.5 : 0);
      this.anel.add(r);
    }
    this.anel.rotation.x = 0;
    this.anel.children.slice(0, 2).forEach((m) => { m.rotation.x = Math.PI / 2; });
    this.anel.position.y = 0.006;
    this.cena.add(this.anel);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    this.inv = null;
    this.giro = 0.5;
    this.arrastando = null;
    this.ligarArrasto();
  }

  // monta (ou troca) o Invocador com uma aparência
  mostrar(aparencia) {
    const giro = this.inv ? this.inv.rotation.y : this.giro;
    if (this.inv) { this.cena.remove(this.inv); descartarInvocador(this.inv); }
    this.inv = criarInvocador(aparencia);
    this.inv.rotation.y = giro;
    this.cena.add(this.inv);
  }

  conjurar() { if (this.inv) this.inv.userData.conjurar = 0.0001; }

  // ret = o espaço de #inv-palco dentro do palco (em pixels)
  enquadrar(ret) {
    const W = this.jogo.palco.clientWidth, H = this.jogo.palco.clientHeight;
    if (!W || !H || !ret.width || !ret.height) return;
    this.ret = ret;
    this.camera.aspect = W / H;
    const tanF = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const altura = 2.5, largura = 2.1; // o que precisa caber: personagem + pedestal
    const dH = altura / (2 * tanF * (ret.height / H));
    const dW = largura / (2 * tanF * (W / H) * (ret.width / W));
    const d = Math.max(dH, dW, 3);
    this.camera.position.set(0, 1.0 + d * 0.12, d);
    this.camera.lookAt(0, 0.82, 0);
    this.camera.setViewOffset(W, H, W / 2 - (ret.left + ret.width / 2), H / 2 - (ret.top + ret.height / 2), W, H);
    this.camera.updateProjectionMatrix();
  }

  atualizar(dt) {
    if (!this.inv) return;
    if (!this.arrastando) this.inv.rotation.y += dt * 0.35; // gira devagar sozinho
    animarInvocador(this.inv, dt, false);
    this.anel.rotation.y -= dt * 0.25;
  }

  // arrastar em cima do espaço do personagem gira ele
  ligarArrasto() {
    const palco = this.jogo.palco;
    const dentro = (e) => {
      if (this.jogo.modo !== 'invocador' || !this.ret) return false;
      const r = palco.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, q = this.ret;
      return x >= q.left && x <= q.left + q.width && y >= q.top && y <= q.top + q.height;
    };
    window.addEventListener('pointerdown', (e) => { if (dentro(e)) this.arrastando = { x: e.clientX, id: e.pointerId }; });
    window.addEventListener('pointermove', (e) => {
      if (!this.arrastando || e.pointerId !== this.arrastando.id || !this.inv) return;
      this.inv.rotation.y += (e.clientX - this.arrastando.x) * 0.012;
      this.arrastando.x = e.clientX;
    });
    const soltar = (e) => { if (this.arrastando && e.pointerId === this.arrastando.id) this.arrastando = null; };
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
  }
}
