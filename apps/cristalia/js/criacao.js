// =============================================================
// CRIAÇÃO DE PERSONAGEM (e o Guarda-roupa da casa)
// Passo 1: masculino ou feminino, cor da pele e do cabelo.
// Passo 2: a roupa (as bloqueadas mostram como ganhar).
// No "Novo jogo" o passo 3 é a escolha do parceiro (a tela do Monstruário).
// No Guarda-roupa (modo 'guarda') o botão do fim é "Vestir".
// A cena 3D é pequena: chão, 1 ou 2 pedestais e os bonecos. Só existe enquanto a tela está aberta.
// =============================================================
import * as THREE from 'three';
import { criarPersonagem, normalizarPersonagem, SKINS, PELES, CABELOS } from './personagem.js';
import { animarModelo, descartar } from './modelos.js';

const $ = (s) => document.querySelector(s);
const NOMES_PELE = ['Clara', 'Média clara', 'Média', 'Morena', 'Escura'];
const NOMES_CABELO = ['Preto', 'Castanho', 'Loiro', 'Ruivo', 'Azul', 'Branco'];

// Como ganhar cada roupa bloqueada
export function comoGanhar(id) {
  const s = SKINS[id];
  if (s.como === 'campeao') return 'Ganhe ao virar Campeão do Reino (vencendo o Rei Julius na arena).';
  if (s.como === 'loja') return `Compre na Loja do Reino por ${s.preco.toLocaleString('pt-BR')} de ouro.`;
  return 'Liberada.';
}

export class Criacao {
  constructor(jogo) {
    this.jogo = jogo;
    this.cena = null;
    this.passo = 1;
    this.pp = normalizarPersonagem();
    this.bonecos = [];
    this.raycaster = new THREE.Raycaster();
    this.ligarBotoes();
  }

  // op: { modo: 'novo' | 'guarda', personagem, liberadas: [ids], nome, coroa, aoTerminar(pp), aoVoltar() }
  abrir(op, passo = 1) {
    this.op = op;
    this.pp = normalizarPersonagem(op.personagem);
    if (!op.liberadas.includes(this.pp.skin)) this.pp.skin = op.liberadas[0];
    this.montarCena();
    this.jogo.mostrarTela('personagem');
    this.irPara(passo);
  }

  // Volta para a tela (o "Voltar" da escolha do parceiro), com o que já foi escolhido
  reabrir(passo = 2) {
    if (!this.op) return;
    this.montarCena();
    this.jogo.mostrarTela('personagem');
    this.irPara(passo);
  }

  fechar() {
    if (!this.cena) return;
    for (const b of this.bonecos) descartar(b.modelo);
    this.bonecos = [];
    descartar(this.cena);
    this.cena = null;
  }

  // ---------- cena 3D ----------
  montarCena() {
    if (this.cena) return;
    const cena = new THREE.Scene();
    cena.background = new THREE.Color('#9fd8ff');
    cena.fog = new THREE.Fog('#9fd8ff', 20, 60);
    cena.add(new THREE.HemisphereLight('#e6f4ff', '#6f8a52', 1.9));
    const sol = new THREE.DirectionalLight('#fff3dc', 1.9);
    sol.position.set(3, 8, 7);
    cena.add(sol);
    cena.add(new THREE.Mesh(new THREE.CircleGeometry(50, 24).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#8bd65e', flatShading: true })));
    this.pedestais = [-0.75, 0.75, 0].map((x) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.22, 12), new THREE.MeshLambertMaterial({ color: '#e3dccb', flatShading: true })));
      g.children[0].position.y = 0.11;
      const aro = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.03, 4, 24), new THREE.MeshLambertMaterial({ color: '#8ff4ff', emissive: '#8ff4ff', emissiveIntensity: 0.2 }));
      aro.rotation.x = Math.PI / 2; aro.position.y = 0.23;
      g.add(aro);
      g.userData.aro = aro;
      g.position.x = x;
      cena.add(g);
      return g;
    });
    cena.traverse((o) => { if (o.isMesh) o.userData.geometriaPropria = true; }); // some tudo junto ao fechar
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    this.cena = cena;
  }

  // Monta os bonecos do passo: no 1, os dois (masculino e feminino); no 2, só o escolhido
  montarBonecos() {
    for (const b of this.bonecos) { this.cena.remove(b.modelo); descartar(b.modelo); }
    this.bonecos = [];
    const lista = this.passo === 1 ? [['m', 0], ['f', 1]] : [[this.pp.genero, 2]];
    for (const [genero, ped] of lista) {
      const modelo = criarPersonagem({ ...this.pp, genero, coroa: !!this.op.coroa }); // no Guarda-roupa, com a coroa (se estiver vestida)
      const p = this.pedestais[ped];
      modelo.position.set(p.position.x, 0.23, 0);
      modelo.rotation.y = this.passo === 1 ? (genero === 'm' ? 0.35 : -0.35) : 0.4;
      this.cena.add(modelo);
      this.bonecos.push({ genero, modelo, ped });
    }
    this.pedestais.forEach((p, i) => { p.visible = this.passo === 1 ? i < 2 : i === 2; });
    this.largura = this.passo === 1 ? 2.8 : 1.5;
  }

  // Enquadra a câmera para os bonecos caberem no retângulo livre da tela (em pixels)
  enquadrar() {
    const palco = this.jogo.palco, el = $('#per-palco');
    if (!this.cena || !el) return;
    const W = palco.clientWidth, H = palco.clientHeight;
    const a = palco.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (!W || !H || !r.width || !r.height) return;
    const ret = { left: r.left - a.left, top: r.top - a.top, width: r.width, height: r.height };
    const altura = 2.1;
    this.camera.aspect = W / H;
    const tanF = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const dW = (this.largura + 0.4) / (2 * tanF * (W / H) * (ret.width / W));
    const dH = (altura + 0.3) / (2 * tanF * (ret.height / H));
    const d = Math.max(dW, dH, 3);
    this.camera.position.set(0, altura * 0.55 + d * 0.08, d);
    this.camera.lookAt(0, altura * 0.47, 0);
    this.camera.setViewOffset(W, H, W / 2 - (ret.left + ret.width / 2), H / 2 - (ret.top + ret.height / 2), W, H);
    this.camera.updateProjectionMatrix();
  }

  atualizar(dt, t) {
    if (!this.cena) return;
    this.enquadrar();
    for (const b of this.bonecos) {
      const escolhido = b.genero === this.pp.genero;
      if (this.passo === 2) b.modelo.rotation.y += dt * 0.6; // gira devagar para ver a roupa toda
      b.modelo.position.y = 0.23 + (this.passo === 1 && escolhido ? Math.abs(Math.sin(t * 3)) * 0.06 : 0);
      this.pedestais[b.ped].userData.aro.material.emissiveIntensity = escolhido ? 0.8 : 0.1;
      animarModelo(b.modelo, t, false);
    }
  }

  // Tocou num boneco do passo 1: escolhe aquele gênero
  tocarEm(x, y) {
    if (!this.cena || this.passo !== 1) return;
    const W = this.jogo.palco.clientWidth, H = this.jogo.palco.clientHeight;
    this.raycaster.setFromCamera(new THREE.Vector2((x / W) * 2 - 1, -(y / H) * 2 + 1), this.camera);
    const hit = this.raycaster.intersectObjects([...this.bonecos.map((b) => b.modelo), ...this.pedestais.slice(0, 2)], true)[0];
    if (!hit) return;
    let o = hit.object;
    while (o) {
      const b = this.bonecos.find((bb) => bb.modelo === o);
      if (b) { this.mudar('genero', b.genero); return; }
      const i = this.pedestais.indexOf(o);
      if (i === 0 || i === 1) { this.mudar('genero', i === 0 ? 'm' : 'f'); return; }
      o = o.parent;
    }
  }

  // ---------- painel ----------
  irPara(passo) {
    this.passo = passo;
    this.montarBonecos();
    this.desenharPainel();
  }

  mudar(campo, valor) {
    if (this.pp[campo] === valor) return;
    this.pp[campo] = valor;
    this.montarBonecos();
    this.desenharPainel();
  }

  desenharPainel() {
    const novo = this.op.modo === 'novo', pp = this.pp;
    $('#per-titulo').textContent = novo ? (this.passo === 1 ? 'Crie o seu personagem' : 'Escolha a roupa') : 'Guarda-roupa';
    const passos = novo ? ['Personagem', 'Roupa', 'Parceiro'] : ['Personagem', 'Roupa'];
    $('#per-passos').innerHTML = passos.map((n, i) => `<button type="button" data-passo="${i + 1}" class="${i + 1 === this.passo ? 'ativo' : ''}" ${i === 2 ? 'disabled' : ''}>${i + 1} · ${n}</button>`).join('');
    const info = $('#per-info');
    if (this.passo === 1) {
      info.innerHTML = `
        <div class="per-lbl">Personagem</div>
        <div class="per-gen">
          <button type="button" data-genero="m" class="${pp.genero === 'm' ? 'ativo' : ''}">♂ Masculino</button>
          <button type="button" data-genero="f" class="${pp.genero === 'f' ? 'ativo' : ''}">♀ Feminino</button>
        </div>
        <div class="per-lbl">Cor da pele</div>
        <div class="per-cores">${PELES.map((c, i) => `<button type="button" data-pele="${i}" class="${pp.pele === i ? 'ativo' : ''}" style="--c:${c}" title="${NOMES_PELE[i]}" aria-label="Pele ${NOMES_PELE[i]}"></button>`).join('')}</div>
        <div class="per-lbl">Cor do cabelo</div>
        <div class="per-cores">${CABELOS.map((c, i) => `<button type="button" data-cabelo="${i}" class="${pp.cabelo === i ? 'ativo' : ''}" style="--c:${c}" title="${NOMES_CABELO[i]}" aria-label="Cabelo ${NOMES_CABELO[i]}"></button>`).join('')}</div>
        ${this.op.nome ? `<div class="per-nome">Nome: <b>${this.op.nome.replace(/[<>&]/g, '')}</b><small>(o nome da conta)</small></div>` : ''}
        <button type="button" class="btn-grande" data-acao="proximo">Próximo: a roupa →</button>`;
    } else {
      const livre = this.op.liberadas.includes(pp.skin), s = SKINS[pp.skin];
      const fim = novo ? 'Próximo: o parceiro →' : 'Vestir';
      info.innerHTML = `
        <div class="per-lbl">Roupas</div>
        <div class="per-skins">${Object.entries(SKINS).map(([id, k]) => {
          const ok = this.op.liberadas.includes(id);
          return `<button type="button" data-skin="${id}" class="${id === pp.skin ? 'ativo' : ''} ${ok ? '' : 'trancada'}">${ok ? '' : '<i class="cadeado">🔒</i>'}<em>${k.icone}</em>${k.nome}</button>`;
        }).join('')}</div>
        <div class="per-det"><b>${s.nome}</b>${livre ? s.texto : '🔒 ' + comoGanhar(pp.skin)}</div>
        <button type="button" class="btn-grande" data-acao="fim" ${livre ? '' : 'disabled'}>${livre ? fim : '🔒 Bloqueada'}</button>`;
    }
  }

  ligarBotoes() {
    $('#per-info').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (b.dataset.genero) this.mudar('genero', b.dataset.genero);
      else if (b.dataset.pele) this.mudar('pele', Number(b.dataset.pele));
      else if (b.dataset.cabelo) this.mudar('cabelo', Number(b.dataset.cabelo));
      else if (b.dataset.skin) this.mudar('skin', b.dataset.skin);
      else if (b.dataset.acao === 'proximo') this.irPara(2);
      else if (b.dataset.acao === 'fim') this.terminar();
    });
    $('#per-passos').addEventListener('click', (e) => {
      const b = e.target.closest('[data-passo]');
      if (!b || b.disabled) return;
      const n = Number(b.dataset.passo);
      if (n === 3) return;
      if (n === 2 && !this.op.liberadas.includes(this.pp.skin)) this.pp.skin = this.op.liberadas[0];
      this.irPara(n);
    });
    $('#per-voltar').addEventListener('click', () => this.voltar());
  }

  // Voltar: do passo 2 para o 1; do passo 1, sai
  voltar() {
    if (this.passo === 2) { this.irPara(1); return; }
    const op = this.op;
    this.fechar();
    op.aoVoltar?.();
  }

  terminar() {
    if (!this.op.liberadas.includes(this.pp.skin)) return;
    const pp = normalizarPersonagem(this.pp), op = this.op;
    this.fechar();
    op.aoTerminar(pp);
  }
}
