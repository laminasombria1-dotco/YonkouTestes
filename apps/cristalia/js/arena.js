// =============================================================
// ARENA DE BATALHA
// Cada região tem a sua arena: chão variado, obstáculos que bloqueiam
// movimento e disparos, clima animado (folhas, brasas, chuva...) e um
// perigo próprio que ajuda ou atrapalha conforme o elemento do monstro.
// A disposição dos obstáculos muda a cada batalha.
// =============================================================
import * as THREE from 'three';
import { ARENAS, CHANCE_PERIGO } from './dados.js';
import { coliseuDeBatalha, animarPlateia } from './reino.js';

export const RAIO_ARENA = 22;

const CORES = {
  campo:  { chao: ['#8bd65e', '#7fcb55', '#95dc68'], mancha: '#a6e37a', fora: '#6fbf4a', ceu: '#a8e0ff', obst: 'arvore', copa: ['#5fbf4a', '#6fcf5a', '#ffb3d1'] },
  planta: { chao: ['#4ea64a', '#5cb553', '#469c43'], mancha: '#3a8a3a', fora: '#2f7a3a', ceu: '#bdeccf', obst: 'arvore', copa: ['#2f7a3a', '#3f8f3a', '#4ea64a'] },
  fogo:   { chao: ['#c98b5b', '#b87048', '#d9a066'], mancha: '#7a4e33', fora: '#8a5a3a', ceu: '#ffc9a0', obst: 'lava',   copa: ['#6b4a3f', '#5a3328', '#7d5545'] },
  agua:   { chao: ['#ecd9a0', '#e2cd90', '#d9c487'], mancha: '#9fdc7a', fora: '#4fc3f7', ceu: '#b0e4ff', obst: 'pedra',  copa: ['#a8a8b4', '#b9b5aa', '#9aa3ad'] },
  terra:  { chao: ['#c9a46a', '#b8935a', '#d4b27a'], mancha: '#a8875a', fora: '#9a7a4a', ceu: '#f0dcb0', obst: 'pilar',  copa: ['#9c8a72', '#b5a083', '#8a7a64'] },
  brasas: { chao: ['#5a3a30', '#6b4535', '#4d3229'], mancha: '#2a1a16', fora: '#3a2420', ceu: '#d98a6a', obst: 'lava',   copa: ['#3a2420', '#2a1a16', '#4d3229'] },
  cratera:{ chao: ['#3a2420', '#2a1a16', '#4a2a22'], mancha: '#ff5a1f', fora: '#1f1210', ceu: '#a04a3a', obst: 'lava',   copa: ['#1f1210', '#2a1a16', '#3a2420'] },
  raio:   { chao: ['#7a7a9a', '#6c6c8c', '#86869f'], mancha: '#5a5a7a', fora: '#4a4a6a', ceu: '#6a6f95', obst: 'cristal', copa: ['#55557a', '#64648a', '#5a5a7a'] },
  raizes: { chao: ['#3f7a3a', '#4a8a40', '#36703a'], mancha: '#6a5236', fora: '#1f4a2a', ceu: '#6a9a80', obst: 'arvore', copa: ['#1f5a2a', '#2f7a3a', '#3a6a2a'] },
  reino:  { chao: ['#e6cf98', '#dcc58e', '#e9d6a2'], mancha: '#d9bd80', fora: '#cbbfa6', ceu: '#a8e0ff', obst: 'pedra', copa: ['#cbbfa6', '#b8ad96', '#d8ccb4'] },
  santuario: { chao: ['#4f6e48', '#5a7a52', '#46663f'], mancha: '#2c6a2e', fora: '#183a24', ceu: '#3f6a5a', obst: 'menir', copa: ['#1f5a2a', '#2f7a3a', '#1d4a28'] },
};
const QTD_OBST = { reino: 0, campo: 7, planta: 12, fogo: 7, agua: 6, terra: 9, raio: 7, brasas: 9, cratera: 6, raizes: 10, santuario: 7 };
// Poças do chão: quem é de casa se cura; os outros sofrem o efeito (ou dano, nos espinhos)
const POCAS = {
  lava:     { cura: ['fogo', 'igneo'], efeito: 'queimadura', dur: 1.5 },
  pocas:    { cura: ['agua'], efeito: 'encharcado', dur: 1.2 },
  espinhos: { cura: ['planta', 'silvestre'], dano: 0.02 },
};
const CEU_NOITE = new THREE.Color('#1b2550');
const GEO_DISCO = new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.9, 1, 40).rotateX(-Math.PI / 2);
const PONTOS_INICIO = [[0, 5], [0, -5]]; // onde os dois monstros começam (fica livre de obstáculos)

function lambert(cor, extra = {}) { return new THREE.MeshLambertMaterial({ color: cor, flatShading: true, ...extra }); }
function basico(cor, opacidade) { return new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: opacidade, depthWrite: false }); }
const sorteia = (lista) => lista[Math.floor(Math.random() * lista.length)];

export class Arena {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.zona = ARENAS[batalha.zona] ? batalha.zona : 'campo';
    this.cfg = ARENAS[this.zona];
    this.cores = CORES[this.zona];
    this.noite = batalha.jogo.mundo.fatorNoite;
    this.obstaculos = [];
    this.pocas = [];
    this.alertas = [];
    this.vento = { ang: Math.random() * Math.PI * 2, alvo: 0, troca: 0 };
    this.vento.alvo = this.vento.ang;
    // o vento vem em rajadas: a cada 3 s sorteia se sopra ou se fica calmo
    this.vento.soprando = Math.random() < CHANCE_PERIGO.vento;
    this.vento.rajadaT = 3;
    this.escuroT = 0;      // Astro Negro (Noctífero): a arena escurece por um tempo
    this.escuroTotal = 1;
    this.perigoT = 3;
    this.flash = 0;
    this.tickPoca = 0;
    this.criarLuzes();
    this.criarChao();
    this.criarObstaculos();
    this.criarPocas();
    this.criarClima();
    // Arena do Reino: o coliseu com a plateia e o treinador na plataforma dele
    if (this.zona === 'reino') { this.coliseu = coliseuDeBatalha(this.cena, RAIO_ARENA, batalha.treinador); this.festaT = 0; }
  }

  // A plateia pula por alguns segundos (só na Arena do Reino)
  festa(seg) { if (this.coliseu) this.festaT = Math.max(this.festaT, seg); }

  // ---------- construção ----------
  criarLuzes() {
    const ceu = new THREE.Color(this.cores.ceu).lerp(CEU_NOITE, this.noite * 0.85);
    this.cena.background = ceu;
    this.ceuBase = ceu.clone();
    this.cena.fog = new THREE.Fog(ceu, 40, 95);
    this.intensidadeHemi = THREE.MathUtils.lerp(1.7, 0.85, this.noite) * (this.zona === 'raio' ? 0.8 : 1);
    this.hemi = new THREE.HemisphereLight(new THREE.Color('#d6f0ff').lerp(new THREE.Color('#8f9fe0'), this.noite), '#5d7a3e', this.intensidadeHemi);
    const sol = new THREE.DirectionalLight(new THREE.Color('#fff1d6').lerp(new THREE.Color('#a8b8ff'), this.noite), THREE.MathUtils.lerp(1.9, 0.6, this.noite));
    sol.position.set(20, 40, 25);
    this.sol = sol;
    this.intensidadeSol = sol.intensity;
    this.cena.add(this.hemi, sol);
  }

  criarChao() {
    // Chão com pequenas variações de cor e manchas; fora da arena o terreno sobe
    let g = new THREE.PlaneGeometry(110, 110, 52, 52);
    g.rotateX(-Math.PI / 2);
    g = g.toNonIndexed();
    const p = g.attributes.position;
    const fase = Math.random() * 10;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      const fora = Math.max(0, r - RAIO_ARENA - 1);
      p.setY(i, fora > 0 ? fora * 0.35 + Math.sin(x * 0.3 + fase) * Math.cos(z * 0.27) * Math.min(1, fora * 0.3) : 0);
    }
    const cores = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      const r = Math.hypot(cx, cz);
      const mancha = Math.sin(cx * 0.22 + fase) * Math.cos(cz * 0.19 - fase) > 0.55;
      if (r > RAIO_ARENA + 1) c.set(this.cores.fora);
      else c.set(mancha ? this.cores.mancha : sorteia(this.cores.chao));
      for (let k = 0; k < 3; k++) { cores[(i + k) * 3] = c.r; cores[(i + k) * 3 + 1] = c.g; cores[(i + k) * 3 + 2] = c.b; }
    }
    g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
    g.computeVertexNormals();
    this.cena.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
    const borda = new THREE.Mesh(new THREE.RingGeometry(RAIO_ARENA + 0.1, RAIO_ARENA + 0.5, 72).rotateX(-Math.PI / 2), basico('#ffffff', 0.5));
    borda.position.y = 0.04;
    this.cena.add(borda);

    // Decoração em volta (fora da arena; na Arena do Reino quem fica em volta é o coliseu)
    for (let i = 0; i < (this.zona === 'reino' ? 0 : 44); i++) {
      const a = (i / 44) * Math.PI * 2 + Math.random() * 0.1;
      const r = RAIO_ARENA + 3 + Math.random() * 9;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const y = (r - RAIO_ARENA - 1) * 0.35;
      this.criarPeca(this.cores.obst === 'lava' ? 'pedra' : this.cores.obst, x, z, 0.9 + Math.random() * 0.9, y);
    }
  }

  // Cria uma peça de cenário e devolve o raio de colisão dela
  criarPeca(tipo, x, z, esc, y = 0) {
    const grupo = new THREE.Group();
    grupo.position.set(x, y, z);
    grupo.rotation.y = Math.random() * 6;
    let raio = 0.7 * esc;
    if (tipo === 'arvore') {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.5, 5), lambert('#8a5a3a'));
      t.position.y = 0.75;
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 0), lambert(sorteia(this.cores.copa)));
      c.position.y = 2.1; c.scale.set(1, 1.15, 1);
      grupo.add(t, c);
      raio = 0.55 * esc;
    } else if (tipo === 'pilar') {
      const h = 2.2 + Math.random() * 2;
      const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.95, h, 6), lambert(sorteia(this.cores.copa)));
      pl.position.y = h / 2;
      const topo = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 0), lambert(sorteia(this.cores.copa)));
      topo.position.y = h;
      grupo.add(pl, topo);
      raio = 0.95 * esc;
    } else if (tipo === 'cristal') {
      const pe = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), lambert('#55557a'));
      pe.position.y = 0.3;
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), lambert('#fff07a', { emissive: '#f7c81a', emissiveIntensity: 0.7 }));
      cr.position.y = 1.5; cr.scale.set(0.8, 2.6, 0.8);
      grupo.add(pe, cr);
      raio = 0.75 * esc;
    } else if (tipo === 'cogumelo') {
      const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.8, 6), lambert('#efe4cc'));
      pe.position.y = 0.9;
      const ch = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), lambert(Math.random() < 0.6 ? '#d8483a' : '#8a5ad8'));
      ch.position.y = 1.75; ch.scale.y = 0.6;
      grupo.add(pe, ch);
      raio = 0.6 * esc;
    } else if (tipo === 'menir') {
      const h = 2.6 + Math.random() * 1.4;
      const pd = new THREE.Mesh(new THREE.BoxGeometry(1.1, h, 0.8), lambert('#8f9a86'));
      pd.position.y = h / 2; pd.rotation.z = (Math.random() - 0.5) * 0.15;
      const mg = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), lambert('#3f8f3a'));
      mg.position.y = h; mg.scale.set(1, 0.4, 0.8);
      const runa = new THREE.Mesh(new THREE.BoxGeometry(0.4, h * 0.4, 0.05), lambert('#1fe0a0', { emissive: '#1fe0a0', emissiveIntensity: 0.9 }));
      runa.position.set(0, h * 0.55, 0.42);
      grupo.add(pd, mg, runa);
      raio = 0.75 * esc;
    } else if (tipo === 'lava') {
      const pd = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), lambert('#5a3328', { emissive: '#ff5a1f', emissiveIntensity: 0.35 }));
      pd.position.y = 0.45; pd.scale.set(1.2, 0.9, 1.1);
      grupo.add(pd);
      raio = 1.05 * esc;
    } else {
      const pd = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), lambert(sorteia(this.cores.copa)));
      pd.position.y = 0.4; pd.scale.set(1.3, 0.85, 1.15); pd.rotation.set(Math.random(), 0, Math.random() * 0.4);
      grupo.add(pd);
      raio = 1.1 * esc;
    }
    grupo.scale.setScalar(esc);
    this.cena.add(grupo);
    return raio;
  }

  lugarLivre(x, z, r, folgaInicio = 4.5) {
    if (Math.hypot(x, z) > RAIO_ARENA - r - 1.5) return false;
    for (const [px, pz] of PONTOS_INICIO) if (Math.hypot(x - px, z - pz) < folgaInicio + r) return false;
    for (const o of this.obstaculos) if (Math.hypot(x - o.x, z - o.z) < o.r + r + 2.4) return false;
    for (const pc of this.pocas) if (Math.hypot(x - pc.x, z - pc.z) < pc.r + r + 1) return false;
    return true;
  }

  criarObstaculos() {
    const quer = QTD_OBST[this.zona];
    const tipo = this.cores.obst;
    for (let tent = 0; tent < 400 && this.obstaculos.length < quer; tent++) {
      const a = Math.random() * Math.PI * 2, d = 3 + Math.random() * (RAIO_ARENA - 4);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      const esc = 0.8 + Math.random() * 0.6;
      // no campo, metade dos obstáculos são pedras; na Trilha Ancestral, metade são cogumelos gigantes
      const metade = this.obstaculos.length % 2;
      const t = this.zona === 'campo' && metade ? 'pedra' : this.zona === 'raizes' && metade ? 'cogumelo' : tipo;
      const rEstimado = 1.1 * esc;
      if (!this.lugarLivre(x, z, rEstimado)) continue;
      const r = this.criarPeca(t, x, z, esc);
      this.obstaculos.push({ x, z, r });
    }
  }

  criarPocas() {
    const perigo = this.cfg.perigo;
    if (!POCAS[perigo]) return;
    const espinhos = perigo === 'espinhos';
    const mat = perigo === 'lava'
      ? lambert('#ff6a1f', { emissive: '#ff3a00', emissiveIntensity: 0.9 })
      : espinhos ? lambert('#4a3a22')
        : new THREE.MeshLambertMaterial({ color: '#4fc3f7', transparent: true, opacity: 0.8, emissive: '#1a6a9a', emissiveIntensity: 0.3 });
    const matEspinho = espinhos ? lambert('#6a8a3a') : null;
    const maxPocas = this.zona === 'cratera' ? 8 : this.zona === 'brasas' || espinhos ? 6 : 5;
    for (let tent = 0; tent < 300 && this.pocas.length < maxPocas; tent++) {
      const a = Math.random() * Math.PI * 2, d = 4 + Math.random() * (RAIO_ARENA - 7);
      const x = Math.cos(a) * d, z = Math.sin(a) * d, r = 1.8 + Math.random() * 1.4;
      if (!this.lugarLivre(x, z, r, 3)) continue;
      const m = new THREE.Mesh(new THREE.CircleGeometry(r, 18).rotateX(-Math.PI / 2), mat);
      m.position.set(x, 0.05, z);
      if (espinhos) { // moita de espinhos: cones em cima do chão escuro
        for (let k = 0; k < 9; k++) {
          const a2 = Math.random() * Math.PI * 2, d2 = Math.random() * r * 0.85;
          const e = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6 + Math.random() * 0.5, 4), matEspinho);
          e.position.set(Math.cos(a2) * d2, 0.3, Math.sin(a2) * d2);
          e.rotation.set((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6);
          m.add(e);
        }
      }
      this.cena.add(m);
      this.pocas.push({ x, z, r, mesh: m });
    }
  }

  criarClima() {
    const n = this.zona === 'agua' ? 420 : 300;
    const pos = new Float32Array(n * 3), cor = new Float32Array(n * 3);
    const paletas = {
      campo: ['#ffffff', '#fff3a0'], planta: ['#5fbf4a', '#9fd35a', '#e0a040'], fogo: ['#ffb030', '#ff6a1f', '#ffe14a'],
      agua: ['#cfefff', '#9fd8ff'], terra: ['#e8d4a8', '#c9a46a'], raio: ['#fff07a', '#ffffff'],
      brasas: ['#ffb030', '#ff6a1f', '#ffe14a'], cratera: ['#ff3d6a', '#ff6a1f', '#6a5a5a', '#8a7a7a'],
      raizes: ['#d8ff7a', '#4ea64a', '#9fd35a', '#e0a040'], reino: ['#ff5a5a', '#5a8aff', '#ffd23f', '#5fdf7a', '#c07aff', '#ffffff'], santuario: ['#1fe0a0', '#d8ff7a', '#7affd8', '#4ea64a'],
    };
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * 30;
      pos[i * 3 + 1] = Math.random() * 14;
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * 30;
      c.set(sorteia(paletas[this.zona]));
      cor[i * 3] = c.r; cor[i * 3 + 1] = c.g; cor[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
    const tam = { reino: 0.22, campo: 0.18, planta: 0.32, fogo: 0.2, agua: 0.12, terra: 0.25, raio: 0.16, brasas: 0.22, cratera: 0.26, raizes: 0.26, santuario: 0.28 }[this.zona];
    this.clima = new THREE.Points(g, new THREE.PointsMaterial({ size: tam, vertexColors: true, transparent: true, opacity: this.zona === 'terra' ? 0.55 : 0.9, depthWrite: false }));
    this.cena.add(this.clima);
  }

  // ---------- regras usadas pela batalha ----------
  colidir(p, raio) {
    for (const o of this.obstaculos) {
      const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), min = o.r + raio;
      if (d < min && d > 0.0001) { p.x = o.x + (dx / d) * min; p.z = o.z + (dz / d) * min; }
    }
    const dc = Math.hypot(p.x, p.z), lim = RAIO_ARENA - raio;
    if (dc > lim) { p.x *= lim / dc; p.z *= lim / dc; }
  }

  bloqueia(p, raio) {
    for (const o of this.obstaculos) if (Math.hypot(p.x - o.x, p.z - o.z) < o.r + raio) return true;
    return false;
  }

  pocaEm(p) {
    return this.pocas.find((pc) => Math.hypot(p.x - pc.x, p.z - pc.z) < pc.r);
  }

  // ---------- quadro a quadro ----------
  atualizar(dt, t) {
    this.atualizarClima(dt, t);
    if (this.coliseu && (this.festaT > 0 || this.coliseu.plateia.pulando)) {
      this.festaT = Math.max(0, this.festaT - dt);
      animarPlateia(this.coliseu.plateia, this.festaT, t);
    }
    for (const pc of this.pocas) pc.mesh.position.y = 0.05 + Math.sin(t * 2 + pc.x) * 0.02;
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt);
    // escuridão do Astro Negro: entra rápido, segura e volta devagar
    let escuro = 0;
    if (this.escuroT > 0) {
      this.escuroT = Math.max(0, this.escuroT - dt);
      const k = 1 - this.escuroT / this.escuroTotal;
      escuro = Math.min(1, k / 0.15, (1 - k) / 0.3);
      this.cena.background.copy(this.ceuBase).multiplyScalar(1 - 0.75 * escuro);
      this.cena.fog.color.copy(this.cena.background);
      if (this.escuroT === 0) { this.cena.background.copy(this.ceuBase); this.cena.fog.color.copy(this.ceuBase); }
    }
    this.hemi.intensity = (this.intensidadeHemi + this.flash * 12) * (1 - 0.7 * escuro);
    this.sol.intensity = this.intensidadeSol * (1 - 0.8 * escuro);

    const b = this.b;
    const ativo = !b.fim && !b.captura && b.t > 1.5;
    const lutadores = [b.jog, ...b.vivos()].filter((l) => !l.morto && l.modelo.visible);
    if (ativo) this.aplicarPerigos(dt, lutadores);
    this.atualizarAlertas(dt, lutadores, ativo);
  }

  escurecer(dur) {
    this.escuroT = this.escuroTotal = dur;
  }

  atualizarClima(dt, t) {
    const p = this.clima.geometry.attributes.position;
    const a = p.array;
    if (this.cfg.perigo === 'vento') {
      this.vento.troca -= dt;
      if (this.vento.troca <= 0) { this.vento.troca = 6; this.vento.alvo += (Math.random() - 0.5) * 2.4; }
      this.vento.ang += (this.vento.alvo - this.vento.ang) * Math.min(1, dt * 0.8);
      this.vento.rajadaT -= dt;
      if (this.vento.rajadaT <= 0) { this.vento.rajadaT = 3; this.vento.soprando = Math.random() < CHANCE_PERIGO.vento; }
    }
    const forcaVento = this.vento.soprando ? 1 : 0.25; // sem rajada, as folhas só flutuam
    const vx = Math.cos(this.vento.ang), vz = Math.sin(this.vento.ang);
    for (let i = 0; i < p.count; i++) {
      const k = i * 3;
      switch (this.zona) {
        case 'planta': a[k] += vx * 6 * forcaVento * dt; a[k + 2] += vz * 6 * forcaVento * dt; a[k + 1] -= (1 + Math.sin(t * 3 + i)) * dt; break;
        case 'cratera': a[k + 1] += (i % 2 ? -1.2 : 2) * dt; a[k] += Math.sin(t * 2 + i) * 0.8 * dt; break;
        case 'raizes':
        case 'santuario': // vaga-lumes e esporos flutuando, folhas caindo
          if (i % 3 === 0) { a[k] += Math.sin(t * 0.7 + i) * 0.9 * dt; a[k + 1] += (this.zona === 'santuario' ? 0.6 : 0) * dt + Math.cos(t + i) * 0.5 * dt; a[k + 2] += Math.cos(t * 0.6 + i) * 0.9 * dt; }
          else { a[k + 1] -= 0.8 * dt; a[k] += Math.sin(t * 1.3 + i) * 1.1 * dt; }
          break;
        case 'brasas':
        case 'fogo': a[k + 1] += (1.5 + (i % 5) * 0.3) * dt; a[k] += Math.sin(t * 2 + i) * 0.8 * dt; break;
        case 'agua': a[k + 1] -= 22 * dt; a[k] += 1.5 * dt; break;
        case 'terra': a[k] += Math.cos(t * 0.3) * 2 * dt; a[k + 2] += Math.sin(t * 0.25) * 2 * dt; a[k + 1] += Math.sin(t + i) * 0.3 * dt; break;
        case 'reino': a[k + 1] -= (0.9 + (i % 4) * 0.25) * dt; a[k] += Math.sin(t * 2.2 + i) * 1.2 * dt; a[k + 2] += Math.cos(t * 1.7 + i) * 0.8 * dt; break; // confete
        case 'raio': a[k + 1] -= 4 * dt; a[k] += (Math.random() - 0.5) * 2 * dt; break;
        default: a[k] += 0.6 * dt; a[k + 1] += Math.sin(t * 1.5 + i) * 0.4 * dt; break;
      }
      // volta para dentro da "caixa" de clima
      if (a[k + 1] < 0) a[k + 1] += 14;
      if (a[k + 1] > 14) a[k + 1] -= 14;
      if (a[k] > 30) a[k] -= 60; else if (a[k] < -30) a[k] += 60;
      if (a[k + 2] > 30) a[k + 2] -= 60; else if (a[k + 2] < -30) a[k + 2] += 60;
    }
    p.needsUpdate = true;
    if (this.zona === 'raio') this.clima.material.opacity = 0.5 + Math.random() * 0.5;
  }

  aplicarPerigos(dt, lutadores) {
    const b = this.b, perigo = this.cfg.perigo;
    if (perigo === 'vento' && this.vento.soprando) {
      // o vento empurra quem não é de planta
      const vx = Math.cos(this.vento.ang), vz = Math.sin(this.vento.ang);
      for (const l of lutadores) if (!l.esp.elementos.includes('planta')) { l.pos.x += vx * 1.4 * dt; l.pos.z += vz * 1.4 * dt; }
    }
    const pc = POCAS[perigo];
    if (pc) {
      this.tickPoca -= dt;
      const tick = this.tickPoca <= 0;
      if (tick) this.tickPoca = 0.5;
      for (const l of lutadores) {
        if (!this.pocaEm(l.pos)) continue;
        if (l.esp.elementos.some((el) => pc.cura.includes(el))) { if (tick) b.curar(l, 0.015); }
        // lava e poças: a cada meio segundo em cima, uma chance de pegar o efeito
        else if (pc.efeito) { if (tick && Math.random() < CHANCE_PERIGO[perigo]) b.aplicarEfeito(l, pc.efeito, pc.dur, null); }
        else if (tick && !l.morto && l.invul <= 0 && Math.random() < CHANCE_PERIGO[perigo]) { // espinhos: um arranhão a cada meio segundo
          const dano = Math.max(1, Math.round(l.stats.hpMax * pc.dano));
          l.dados.hp = Math.max(0, l.dados.hp - dano);
          l.flash = 0.12;
          this.b.jogo.numero(String(dano), l.pos.clone().setY(l.altura), '#9fd35a', 'pequeno');
          if (l.dados.hp <= 0) b.desmaiar(l);
        }
      }
    }
    if (perigo === 'pedras' || perigo === 'raios' || perigo === 'raizes') {
      this.perigoT -= dt;
      if (this.perigoT <= 0 && lutadores.length) {
        this.perigoT = perigo === 'raios' ? 2.2 + Math.random() * 1.8 : perigo === 'raizes' ? 2.4 + Math.random() * 1.8 : 2.6 + Math.random() * 2;
        const alvo = sorteia(lutadores);
        const a = Math.random() * Math.PI * 2, d = Math.random() * 2.5;
        const p = new THREE.Vector3(alvo.pos.x + Math.cos(a) * d, 0, alvo.pos.z + Math.sin(a) * d);
        this.criarAlerta(perigo, p);
      }
    }
  }

  // Círculo de aviso no chão antes da pedra ou do raio cair
  criarAlerta(tipo, p) {
    const raio = tipo === 'raios' ? 1.7 : tipo === 'raizes' ? 2.2 : 2;
    const cor = tipo === 'raios' ? '#ffe74c' : tipo === 'raizes' ? '#1fe0a0' : '#7a5a3a';
    const g = new THREE.Group();
    const anel = new THREE.Mesh(GEO_ANEL, basico(cor, 0.9));
    anel.scale.setScalar(raio);
    const disco = new THREE.Mesh(GEO_DISCO, basico(cor, 0.3));
    g.add(anel, disco);
    g.position.set(p.x, 0.07, p.z);
    this.cena.add(g);
    const total = tipo === 'raios' ? 1.0 : 1.3;
    this.alertas.push({ tipo, p, raio, t: total, total, g, disco, queda: null });
  }

  atualizarAlertas(dt, lutadores, ativo) {
    const b = this.b;
    for (let i = this.alertas.length - 1; i >= 0; i--) {
      const al = this.alertas[i];
      al.t -= dt;
      const k = 1 - Math.max(0, al.t) / al.total;
      al.disco.scale.setScalar(al.raio * k);
      if (al.tipo === 'pedras' && !al.queda && al.t < 0.3) {
        al.queda = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), lambert(sorteia(this.cores.copa)));
        this.cena.add(al.queda);
      }
      if (al.queda) al.queda.position.set(al.p.x, Math.max(0.6, al.t / 0.3 * 12), al.p.z);
      if (al.t > 0) continue;
      // impacto
      if (ativo) {
        for (const l of lutadores) {
          if (Math.hypot(l.pos.x - al.p.x, l.pos.z - al.p.z) > al.raio + l.raio * 0.5) continue;
          if (al.tipo === 'raios' && !l.esp.elementos.includes('raio')) { b.danoAmbiente(l, 0.06, '#ffe74c'); if (Math.random() < CHANCE_PERIGO.raios) b.aplicarEfeito(l, 'paralisia', 0.8, null); }
          if (al.tipo === 'pedras' && !l.esp.elementos.includes('terra')) b.danoAmbiente(l, 0.08, '#c9a46a');
          if (al.tipo === 'raizes' && !l.esp.elementos.some((el) => el === 'planta' || el === 'silvestre')) { b.danoAmbiente(l, 0.07, '#1fe0a0'); if (Math.random() < CHANCE_PERIGO.raizes) b.aplicarEfeito(l, 'enraizado', 1, null); }
        }
      }
      if (al.tipo === 'raios') this.raioVisual(al.p);
      if (al.tipo === 'raizes') this.raizesVisual(al.p, al.raio);
      b.particulas(al.p, al.tipo === 'raios' ? '#ffe74c' : al.tipo === 'raizes' ? '#1fe0a0' : '#c9a46a', 14, 1.3);
      this.cena.remove(al.g);
      al.g.children.forEach((m) => m.material.dispose());
      if (al.queda) {
        const q = al.queda;
        // a pedra fica um instante no chão e some
        b.efeitos.push({ obj: q, vida: 0.8, total: 0.8, upd: (e, kk) => { e.obj.scale.setScalar(1 - kk * 0.9); } });
      }
      this.alertas.splice(i, 1);
    }
  }

  // Raízes pontudas saindo do chão e voltando para baixo
  raizesVisual(p, raio) {
    const mat = lambert('#5a3a24');
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.random(), d = Math.random() * raio * 0.7;
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.28, 2.2, 5), mat);
      m.position.set(p.x + Math.cos(a) * d, 0, p.z + Math.sin(a) * d);
      m.rotation.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5);
      this.cena.add(m);
      this.b.efeitos.push({ obj: m, vida: 0.9, total: 0.9, upd: (e, k) => { e.obj.position.y = Math.sin(Math.min(1, k * 1.2) * Math.PI) * 1.1 - 0.4; } });
    }
  }

  raioVisual(p) {
    this.flash = 0.18;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.25, 22, 0.25), basico('#fff7b0', 0.95));
    m.position.set(p.x, 11, p.z);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida: 0.22, total: 0.22, upd: (e, k) => { e.obj.material.opacity = 0.95 * (1 - k); e.obj.scale.x = 1 + k * 2; } });
  }
}
