// =============================================================
// EFEITOS DA ARENA DAS BRASAS (trazidos para o Runeclash na etapa 0.2)
// Partículas, avisos de ataque no chão, arcos de golpe, ondas, feixes, números de dano,
// runas no chão, anéis de runas, correntes, espirais, implosões, clarões, estilhaços,
// rachaduras, faixas no chão, meteoro, cristal que voa, relâmpago, espinhos e chamas.
//
// Como usar:
//   const fx = new Efeitos(cena, { chao: alturaEm });   // chao(x, z) = altura do chão naquele ponto
//   fx.runa(x, z, 3, 0xb48cff, 1.5);                    // um círculo de runas de 3 m por 1,5 s
//   ...e a cada quadro: fx.atualizar(dt, camera, largura, altura);
//
// Opções do segundo parâmetro (todas opcionais):
//   chao(x, z)  altura do chão. No mapa, use alturaEm (js/mapa/altura.js); na arena de batalha
//               o chão é plano (o padrão, que devolve 0).
//   camada      um <div> por cima do jogo para os números de dano (texto()). Sem ele, texto() não faz nada.
//   luzes       quantas luzes de verdade os clarões usam (padrão 0). Cada luz pesa em TODOS os
//               materiais da cena, o tempo todo, mesmo apagada; com 0, o clarão vira um brilho leve.
//   qualidade   (etapa 3.2) o perfil "efeitos" da Qualidade (js/mapa/config.js): { taxa, tam, malhas,
//               galhos, max, solidas, luzes }. Sem ele, tudo sai inteiro (como no Médio).
//               definirQualidade(perfil) muda taxa/tam/malhas/galhos na hora; max e luzes só valem
//               para um Efeitos novo (na próxima batalha).
//
// Todos os efeitos recebem só números, listas e objetos simples: assim, no futuro (online),
// dá para repetir o mesmo efeito nos outros aparelhos (veja FX_REDE no fim).
// Ainda não está ligado em nenhuma parte do jogo: é material para as próximas etapas.
// =============================================================
import * as THREE from 'three';

const MAX = 6000;
const ADD = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide };
const lim = (t, a = 0, b = 1) => Math.min(b, Math.max(a, t));
const suave = t => t * t * (3 - 2 * t);

// ------------------------------------------------------------------ texturas desenhadas na hora (so no navegador)
const TEX = {};
const temTela = () => typeof document !== 'undefined' && typeof document.createElement === 'function';
function tela(n, desenhar) {
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const g = c.getContext('2d');
  if (!g) return null;
  desenhar(g, n);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function semente(s) {
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// glifo original: dois a quatro tracos dentro de uma caixa pequena
function glifo(g, r, s) {
  g.beginPath();
  g.moveTo(0, -s);
  g.lineTo(0, s);
  const n = 1 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const y = (r() * 2 - 1) * s,
      lado = r() < 0.5 ? -1 : 1,
      tipo = r();
    if (tipo < 0.4) {
      g.moveTo(0, y);
      g.lineTo(lado * s * 0.8, y - s * 0.5);
    } else if (tipo < 0.7) {
      g.moveTo(-s * 0.7, y);
      g.lineTo(s * 0.7, y);
    } else {
      g.moveTo(lado * s * 0.45 + s * 0.28, y);
      g.arc(lado * s * 0.45, y, s * 0.28, 0, Math.PI * 2);
    }
  }
  g.stroke();
}

// circulo de runas: estilo 0 = selo (hexagrama), 1 = elo (pentagrama), 2 = guerra (estrela de 8 pontas)
export function texRuna(estilo) {
  const k = 'runa' + estilo;
  if (TEX[k] !== undefined) return TEX[k];
  return (TEX[k] = temTela()
    ? tela(512, (g, n) => {
        const r = semente(11 + estilo * 37),
          R = n / 2 - 10;
        g.translate(n / 2, n / 2);
        g.strokeStyle = '#fff';
        g.fillStyle = '#fff';
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.shadowColor = '#fff';
        g.shadowBlur = 10;
        const circ = (raio, w) => {
          g.lineWidth = w;
          g.beginPath();
          g.arc(0, 0, raio, 0, Math.PI * 2);
          g.stroke();
        };
        circ(R, 7);
        circ(R - 36, 3);
        circ(R - 44, 1.5);
        g.lineWidth = 3;
        const n1 = 26;
        for (let i = 0; i < n1; i++) {
          g.save();
          g.rotate((i / n1) * Math.PI * 2);
          g.translate(0, -(R - 18));
          glifo(g, r, 10);
          g.restore();
        }
        const pontas = [6, 5, 8][estilo],
          passo = [2, 2, 3][estilo],
          r2 = R - 50,
          v = [];
        for (let i = 0; i < pontas; i++) {
          const a = (i / pontas) * Math.PI * 2 - Math.PI / 2;
          v.push([Math.cos(a) * r2, Math.sin(a) * r2]);
        }
        g.lineWidth = 4;
        g.beginPath();
        for (let i = 0; i < pontas; i++) {
          const a = v[i],
            b = v[(i + passo) % pontas];
          g.moveTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
        }
        g.stroke();
        for (const [x, y] of v) {
          g.lineWidth = 3;
          g.beginPath();
          g.arc(x, y, 15, 0, Math.PI * 2);
          g.stroke();
          g.save();
          g.translate(x, y);
          g.lineWidth = 2;
          glifo(g, r, 7);
          g.restore();
        }
        circ(r2 * 0.48, 3);
        circ(r2 * 0.42, 1.5);
        for (let i = 0; i < 12; i++) {
          g.save();
          g.rotate((i / 12) * Math.PI * 2);
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(0, -r2 * 0.42);
          g.lineTo(0, -r2 * 0.3);
          g.stroke();
          g.restore();
        }
        g.lineWidth = 5;
        g.save();
        g.scale(2.4, 2.4);
        glifo(g, r, 9);
        g.restore();
      })
    : null);
}
function texBrilho() {
  if (TEX.brilho !== undefined) return TEX.brilho;
  return (TEX.brilho = temTela()
    ? tela(64, (g, n) => {
        const d = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
        d.addColorStop(0, 'rgba(255,255,255,1)');
        d.addColorStop(0.25, 'rgba(255,255,255,0.6)');
        d.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = d;
        g.fillRect(0, 0, n, n);
      })
    : null);
}
function texRachadura() {
  if (TEX.racha !== undefined) return TEX.racha;
  return (TEX.racha = temTela()
    ? tela(512, (g, n) => {
        const r = semente(97);
        g.translate(n / 2, n / 2);
        g.strokeStyle = '#fff';
        g.lineCap = 'round';
        g.shadowColor = '#fff';
        g.shadowBlur = 8;
        const galho = (x, y, a, comp, w, prof) => {
          let px = x,
            py = y;
          g.lineWidth = w;
          g.beginPath();
          g.moveTo(px, py);
          const passos = 6;
          for (let i = 0; i < passos; i++) {
            a += (r() - 0.5) * 0.9;
            px += (Math.cos(a) * comp) / passos;
            py += (Math.sin(a) * comp) / passos;
            g.lineTo(px, py);
            if (prof < 2 && r() < 0.35) {
              g.stroke();
              galho(px, py, a + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6), comp * 0.45, w * 0.55, prof + 1);
              g.lineWidth = w;
              g.beginPath();
              g.moveTo(px, py);
            }
          }
          g.stroke();
        };
        for (let i = 0; i < 11; i++) galho(0, 0, (i / 11) * Math.PI * 2 + r() * 0.4, 150 + r() * 90, 7, 0);
        const d = g.createRadialGradient(0, 0, 0, 0, 0, 90);
        d.addColorStop(0, 'rgba(255,255,255,0.9)');
        d.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = d;
        g.beginPath();
        g.arc(0, 0, 90, 0, Math.PI * 2);
        g.fill();
      })
    : null);
}
function texFaixa() {
  if (TEX.faixa !== undefined) return TEX.faixa;
  return (TEX.faixa = temTela()
    ? tela(128, (g, n) => {
        const d = g.createLinearGradient(0, 0, n, 0);
        d.addColorStop(0, 'rgba(255,255,255,0)');
        d.addColorStop(0.5, 'rgba(255,255,255,1)');
        d.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = d;
        g.fillRect(0, 0, n, n);
      })
    : null);
}

// brilho redondo que sempre olha para a camera (usado nos projeteis e no cristal do selo)
export function brilho(cor, escala = 1) {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texBrilho(),
      color: cor,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
    }),
  );
  s.scale.setScalar(escala);
  return s;
}

// geometrias reaproveitadas (nao sao descartadas quando o efeito acaba)
const fixa = g => {
  g.userData.fixa = true;
  return g;
};
const GEO = {};
const geo = (k, criar) => GEO[k] || (GEO[k] = fixa(criar()));

// um grupo de particulas: posicao, cor, tamanho, velocidade e vida de cada uma
function criarGrupo(n) {
  return {
    n,
    vivas: 0,
    pos: new Float32Array(n * 3),
    cor: new Float32Array(n * 4),
    tam: new Float32Array(n),
    vel: new Float32Array(n * 3),
    vida: new Float32Array(n),
    max: new Float32Array(n),
    grav: new Float32Array(n),
    t0: new Float32Array(n),
    cx: new Float32Array(n),
    cz: new Float32Array(n),
    giro: new Float32Array(n),
    puxa: new Float32Array(n),
    // fogo (3.1): a particula muda de cor enquanto vive (c0 -> cf) e cresce em vez de encolher
    c0: new Float32Array(n * 3),
    cf: new Float32Array(n * 3),
    muda: new Uint8Array(n),
    cresce: new Float32Array(n),
    i: 0,
  };
}
// normal = false: brilho (soma as cores, nucleo quase branco); true: mistura normal (fogo "solido")
function criarPontos(P, normal) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P.pos, 3));
  g.setAttribute('cor', new THREE.BufferAttribute(P.cor, 4));
  g.setAttribute('tam', new THREE.BufferAttribute(P.tam, 1));
  const mat = new THREE.ShaderMaterial({
    ...(normal ? { transparent: true, depthWrite: false } : ADD),
    uniforms: { escala: { value: 600 } },
    vertexShader:
      'attribute vec4 cor; attribute float tam; varying vec4 vCor; uniform float escala; void main(){ vCor=cor; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=tam*escala/max(0.1,-mv.z); gl_Position=projectionMatrix*mv; }',
    fragmentShader: normal
      ? // bolinha macia, com o meio um pouco mais claro
        'varying vec4 vCor; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.12,d)*vCor.a; if(a<0.02) discard; vec3 c=mix(vCor.rgb,vec3(1.0,0.95,0.7),smoothstep(0.25,0.0,d)*0.35); gl_FragColor=vec4(c,a*0.92); }'
      : // nucleo quase branco e borda na cor: parece mais quente e mais brilhante
        'varying vec4 vCor; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.05,d)*vCor.a; if(a<0.01) discard; vec3 c=mix(vCor.rgb,vec3(1.0),smoothstep(0.22,0.0,d)*0.65); gl_FragColor=vec4(c*a,a); }',
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  return pts;
}

export class Efeitos {
  constructor(cena, opcoes = {}) {
    this.cena = cena;
    this.camada = opcoes.camada || null;
    this.chao = opcoes.chao || (() => 0);
    this.temp = [];
    this.textos = [];
    this.tremor = 0;
    this.tempo = 0;
    const Q = opcoes.qualidade || {};
    this.definirQualidade(Q);
    // ---- particulas (um unico objeto Points). giro/puxa fazem a particula rodar em volta de (cx,cz) e ser puxada para o centro
    this.P = criarGrupo(Q.max ?? MAX);
    this.pontos = criarPontos(this.P, false);
    this.matP = this.pontos.material;
    if (cena) cena.add(this.pontos);
    // ---- fogo "solido" (3.1, opcoes.fogo = quantas): particulas com mistura normal, que nao somem no chao
    // claro do dia como as que brilham (a soma de laranja com grama verde vira amarelo claro)
    this.F = null;
    if (opcoes.fogo) {
      this.F = criarGrupo(Math.min(opcoes.fogo, Q.solidas ?? opcoes.fogo));
      this.pontosF = criarPontos(this.F, true);
      if (cena) cena.add(this.pontosF);
    }
    // ---- claroes: poucas luzes fixas, ligadas e desligadas (criar luzes na hora faria o jogo travar recompilando).
    // Padrao 0 luzes (leve no celular): o clarao vira um brilho, sem iluminar o cenario.
    this.luzes = [];
    for (let i = 0; i < (opcoes.luzes ?? Q.luzes ?? 0); i++) {
      const l = new THREE.PointLight(0xffffff, 0, 22, 2);
      l.userData = { vida: 0, max: 1, forca: 0 };
      this.luzes.push(l);
      if (cena) cena.add(l);
    }
  }

  // Qualidade (3.2): taxa = parte das partículas que sai; tam = quanto as que saem crescem;
  // malhas = parte dos cacos; galhos = parte dos galhos do relâmpago
  definirQualidade(q = {}) {
    this.taxa = q.taxa ?? 1;
    this.tamQ = q.tam ?? 1;
    this.malhasQ = q.malhas ?? 1;
    this.galhosQ = q.galhos ?? 1;
  }

  // o = { x,y,z, n, cor, vel, cima, vida, tam, grav, raio, alto, giro, puxa }
  particulas(o) {
    const P = this.P,
      c = new THREE.Color(o.cor ?? 0xffffff),
      n0 = o.n ?? 12,
      n = n0 > 1 && this.taxa < 1 ? Math.max(1, Math.round(n0 * this.taxa)) : n0;
    for (let k = 0; k < n; k++) {
      const i = (P.i = (P.i + 1) % P.n),
        a = Math.random() * Math.PI * 2,
        e = Math.acos(Math.random() * 2 - 1),
        v = (o.vel ?? 4) * (0.4 + Math.random() * 0.6),
        r = (o.raio ?? 0) * Math.sqrt(Math.random());
      P.pos[i * 3] = o.x + Math.cos(a) * r;
      P.pos[i * 3 + 1] = o.y + (Math.random() - 0.5) * (o.alto ?? 0);
      P.pos[i * 3 + 2] = o.z + Math.sin(a) * r;
      P.vel[i * 3] = Math.sin(e) * Math.cos(a) * v;
      P.vel[i * 3 + 1] = Math.cos(e) * v * 0.6 + (o.cima ?? 0);
      P.vel[i * 3 + 2] = Math.sin(e) * Math.sin(a) * v;
      P.cor[i * 4] = c.r;
      P.cor[i * 4 + 1] = c.g;
      P.cor[i * 4 + 2] = c.b;
      P.cor[i * 4 + 3] = 1;
      P.max[i] = P.vida[i] = (o.vida ?? 0.6) * (0.6 + Math.random() * 0.4);
      P.t0[i] = (o.tam ?? 0.25) * (0.6 + Math.random() * 0.7) * this.tamQ;
      P.grav[i] = o.grav ?? 6;
      P.cx[i] = o.x;
      P.cz[i] = o.z;
      P.giro[i] = o.giro ?? 0;
      P.puxa[i] = o.puxa ?? 0;
      P.cresce[i] = 0;
      P.muda[i] = 0;
    }
    P.vivas = P.n; // tem particula viva: o proximo quadro confere todas
  }
  // uma particula com posicao e velocidade exatas.
  // o = { fim: THREE.Color (a cor no fim da vida), cresce: quanto ela cresce (0 = encolhe, como as outras),
  //       solido: vai para o fogo "solido" (precisa de opcoes.fogo; sem ele, brilha como as outras) }
  _ponto(x, y, z, vx, vy, vz, c, vida, tam, grav = 0, o = null) {
    if (this.taxa < 1 && Math.random() > this.taxa) return; // Qualidade mais leve: só parte delas sai
    const P = o?.solido && this.F ? this.F : this.P,
      i = (P.i = (P.i + 1) % P.n);
    P.vivas = P.n;
    P.pos[i * 3] = x;
    P.pos[i * 3 + 1] = y;
    P.pos[i * 3 + 2] = z;
    P.vel[i * 3] = vx;
    P.vel[i * 3 + 1] = vy;
    P.vel[i * 3 + 2] = vz;
    P.cor[i * 4] = c.r;
    P.cor[i * 4 + 1] = c.g;
    P.cor[i * 4 + 2] = c.b;
    P.cor[i * 4 + 3] = 1;
    P.max[i] = P.vida[i] = vida;
    P.t0[i] = tam * this.tamQ;
    P.grav[i] = grav;
    P.giro[i] = 0;
    P.puxa[i] = 0;
    P.cresce[i] = o?.cresce || 0;
    P.muda[i] = o?.fim ? 1 : 0;
    if (o?.fim) {
      P.c0[i * 3] = c.r; P.c0[i * 3 + 1] = c.g; P.c0[i * 3 + 2] = c.b;
      P.cf[i * 3] = o.fim.r; P.cf[i * 3 + 1] = o.fim.g; P.cf[i * 3 + 2] = o.fim.b;
    }
  }

  // vida = segundos; passo(o, k 0..1, dt); fim(o) roda quando o efeito termina sozinho; id permite encerrar antes da hora
  _temp(malha, vida, passo, extra = {}) {
    if (this.cena) this.cena.add(malha);
    const o = { malha, vida, max: vida, passo, ...extra };
    this.temp.push(o);
    return o;
  }

  // arco de golpe (leque no ar)
  arco(x, y, z, yaw, r, ang, cor, vida = 0.22, inclina = 0) {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(r * 0.45, r, 28, 1, Math.PI / 2 - ang / 2, ang),
      new THREE.MeshBasicMaterial({ color: cor, ...ADD }),
    );
    m.rotation.order = 'YXZ';
    m.rotation.set(Math.PI / 2 + inclina, yaw, 0);
    m.position.set(x, y, z); // +Y da forma vira "para frente"
    // segunda camada mais fina e clara por dentro: o corte parece ter fio
    const fio = new THREE.Mesh(
      new THREE.RingGeometry(r * 0.86, r * 0.97, 28, 1, Math.PI / 2 - ang / 2, ang),
      new THREE.MeshBasicMaterial({ color: 0xffffff, ...ADD }),
    );
    fio.position.z = 0.01;
    m.add(fio);
    this._temp(m, vida, (o, k) => {
      o.malha.scale.setScalar(0.75 + k * 0.4);
      o.malha.material.opacity = 0.5 * (1 - k);
      fio.material.opacity = 0.7 * (1 - k) * (1 - k);
    });
  }
  // onda circular no chao
  onda(x, z, r, cor, vida = 0.45) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 48), new THREE.MeshBasicMaterial({ color: cor, ...ADD }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, this.chao(x, z) + 0.12, z);
    this._temp(m, vida, (o, k) => {
      o.malha.scale.setScalar(0.3 + (r - 0.3) * (1 - (1 - k) * (1 - k)));
      o.malha.material.opacity = 0.75 * (1 - k);
    });
  }
  // coluna de luz
  coluna(x, z, r, cor, h = 9, vida = 0.5) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: cor, ...ADD, opacity: 0.7 }),
    );
    m.position.set(x, this.chao(x, z) + h / 2, z);
    const nucleo = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.35, r * 0.35, h, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffffff, ...ADD, opacity: 0.6 }),
    );
    m.add(nucleo);
    this._temp(m, vida, (o, k) => {
      o.malha.scale.set(1 - k * 0.6, 1, 1 - k * 0.6);
      o.malha.material.opacity = 0.32 * (1 - k);
      nucleo.material.opacity = 0.5 * (1 - k) * (1 - k);
    });
  }
  // feixe entre dois pontos
  feixe(a, b, larg, cor, vida = 0.3) {
    const d = new THREE.Vector3().subVectors(b, a),
      comp = d.length();
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(larg, larg, comp),
      new THREE.MeshBasicMaterial({ color: cor, ...ADD }),
    );
    m.position.copy(a).addScaledVector(d, 0.5);
    m.lookAt(b);
    const nucleo = new THREE.Mesh(
      new THREE.BoxGeometry(larg * 0.3, larg * 0.3, comp),
      new THREE.MeshBasicMaterial({ color: 0xffffff, ...ADD }),
    );
    m.add(nucleo);
    this._temp(m, vida, (o, k) => {
      o.malha.scale.set(1 - k, 1 - k, 1);
      o.malha.material.opacity = 0.55 * (1 - k);
      nucleo.material.opacity = 0.9 * (1 - k);
    });
  }
  esfera(x, y, z, r, cor, vida = 0.35) {
    const m = new THREE.Mesh(
      geo('ico2', () => new THREE.IcosahedronGeometry(1, 2)),
      new THREE.MeshBasicMaterial({ color: cor, ...ADD, opacity: 0.8 }),
    );
    m.position.set(x, y, z);
    this._temp(m, vida, (o, k) => {
      o.malha.scale.setScalar(r * (0.3 + 0.7 * Math.sqrt(k)));
      o.malha.material.opacity = 0.45 * (1 - k);
    });
  }

  // ------------------------------------------------------------------ efeitos novos (1.2)
  // circulo de runas no chao. o = { id, estilo 0..2, giro (rad/s), cresce (s), y (altura extra), forca (opacidade) }
  runa(x, z, r, cor, vida = 1, o = {}) {
    const m = new THREE.Mesh(
      geo('plano', () => new THREE.PlaneGeometry(2, 2)),
      new THREE.MeshBasicMaterial({ color: cor, map: texRuna(o.estilo ?? 0), ...ADD, opacity: 0 }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, this.chao(x, z) + 0.09 + (o.y ?? 0), z);
    m.scale.setScalar(r);
    // segunda camada girando ao contrario, menor: da profundidade ao desenho
    const m2 = new THREE.Mesh(
      m.geometry,
      new THREE.MeshBasicMaterial({ color: 0xffffff, map: texRuna(((o.estilo ?? 0) + 1) % 3), ...ADD, opacity: 0 }),
    );
    m2.position.z = 0.02;
    m2.scale.setScalar(0.55);
    m.add(m2);
    const cresce = o.cresce ?? 0.25,
      giro = o.giro ?? 0.8,
      forca = o.forca ?? 0.85,
      base = m.rotation.z;
    this._temp(
      m,
      vida,
      (q, k) => {
        const t = k * q.max,
          entra = suave(lim(t / cresce)),
          sai = 1 - suave(lim((t - (q.max - 0.35)) / 0.35));
        m.scale.setScalar(r * (0.6 + 0.4 * entra));
        m.rotation.z = base + t * giro;
        m2.rotation.z = -t * giro * 2.1;
        const pulso = 0.85 + 0.15 * Math.sin(t * 9);
        m.material.opacity = forca * entra * sai * pulso;
        m2.material.opacity = forca * 0.7 * entra * sai;
      },
      { id: o.id },
    );
  }
  // tres aneis de runas em pe girando em volta de um ponto e se apertando. o = { id, aperta (0..1), estilo }
  aneis(x, y, z, r, cor, vida = 1.5, o = {}) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const mats = [];
    const eixos = [
      [0, 0, 0],
      [Math.PI / 2, 0.6, 0],
      [Math.PI / 2, -0.6, 0.9],
    ];
    for (const [ax, ay, az] of eixos) {
      const piv = new THREE.Group();
      piv.rotation.set(ax, ay, az);
      g.add(piv);
      const mat = new THREE.MeshBasicMaterial({ color: cor, map: texRuna(o.estilo ?? 0), ...ADD, opacity: 0 });
      mats.push(mat);
      const m = new THREE.Mesh(
        geo('plano', () => new THREE.PlaneGeometry(2, 2)),
        mat,
      );
      piv.add(m);
    }
    const aperta = o.aperta ?? 0.5;
    this._temp(
      g,
      vida,
      (q, k) => {
        const t = k * q.max,
          entra = suave(lim(t / 0.3)),
          sai = 1 - suave(lim((t - (q.max - 0.25)) / 0.25));
        g.scale.setScalar(r * (1.25 - aperta * suave(k)) * (0.7 + 0.3 * entra));
        g.children.forEach((piv, i) => {
          piv.children[0].rotation.z = t * (1.6 + i * 0.7) * (i % 2 ? -1 : 1) * (1 + k * 2);
        });
        for (const m of mats) m.opacity = 0.75 * entra * sai;
      },
      { id: o.id },
    );
  }
  // correntes de luz saindo de a ([x,y,z]) e prendendo b. raio = espalha as pontas em volta de b
  correntes(a, b, n = 3, cor = 0xb48cff, vida = 1.5, o = {}) {
    // elos solidos (nao aditivos) para aparecerem tambem sobre chao claro; a cada quatro, um elo branco brilhante
    const g = new THREE.Group(),
      elos = 18,
      mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cor).lerp(new THREE.Color(0xffffff), 0.35),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
      matN = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
    const gElo = geo('elo', () => {
      const t = new THREE.TorusGeometry(0.16, 0.05, 5, 10);
      t.rotateY(Math.PI / 2);
      t.scale(1, 1, 1.7);
      return t;
    });
    const A = new THREE.Vector3(...a),
      B = new THREE.Vector3(...b),
      raio = o.raio ?? 1,
      cadeias = [];
    for (let c = 0; c < n; c++) {
      const ang = (c / n) * Math.PI * 2 + 0.4,
        fim = B.clone().add(
          new THREE.Vector3(Math.cos(ang) * raio, (c - (n - 1) / 2) * raio * 0.45, Math.sin(ang) * raio),
        );
      const lado = new THREE.Vector3()
        .subVectors(fim, A)
        .cross(new THREE.Vector3(0, 1, 0))
        .normalize()
        .multiplyScalar((c - (n - 1) / 2) * 3.2 + 0.6);
      const l = [];
      for (let i = 0; i < elos; i++) {
        const m = new THREE.Mesh(gElo, i % 4 === 0 ? matN : mat);
        g.add(m);
        l.push(m);
      }
      cadeias.push({ fim, lado, l, fase: c * 2.1 });
    }
    const p = new THREE.Vector3(),
      q2 = new THREE.Vector3(),
      ctl = new THREE.Vector3(),
      curva = (s, cad, folga, tremor, t, out) => {
        ctl.copy(A).lerp(cad.fim, 0.5).addScaledVector(cad.lado, folga);
        ctl.y += folga * 0.8;
        const u = 1 - s;
        out.set(
          u * u * A.x + 2 * u * s * ctl.x + s * s * cad.fim.x,
          u * u * A.y + 2 * u * s * ctl.y + s * s * cad.fim.y,
          u * u * A.z + 2 * u * s * ctl.z + s * s * cad.fim.z,
        );
        const w = Math.sin(s * Math.PI) * tremor;
        out.x += Math.sin(t * 31 + s * 9 + cad.fase) * w;
        out.y += Math.cos(t * 27 + s * 7) * w;
        out.z += Math.sin(t * 23 + s * 11) * w;
        return out;
      };
    this._temp(
      g,
      vida,
      (q, k, dt) => {
        const t = k * q.max,
          estica = suave(lim(t / 0.28)),
          folga = 1.4 * (1 - suave(k)) + 0.15,
          tremor = 0.02 + 0.13 * k * k,
          sai = 1 - lim((t - (q.max - 0.12)) / 0.12);
        for (const cad of cadeias)
          cad.l.forEach((m, i) => {
            const s = (i / (elos - 1)) * estica;
            curva(s, cad, folga, tremor, t, p);
            curva(Math.min(1, s + 0.02), cad, folga, tremor, t, q2);
            m.position.copy(p);
            m.lookAt(q2);
            if (i % 2) m.rotateZ(Math.PI / 2);
            m.visible = s <= estica;
          });
        mat.opacity = 0.95 * sai;
        matN.opacity = sai;
        // faiscas correndo pela corrente em direcao ao alvo
        if (Math.random() < dt * 30) {
          const cad = cadeias[Math.floor(Math.random() * cadeias.length)];
          curva(Math.random() * estica, cad, folga, tremor, t, p);
          this._ponto(p.x, p.y, p.z, 0, 0.5, 0, mat.color, 0.3, 0.18);
        }
      },
      { id: o.id },
    );
  }
  // particulas que sobem girando e sao puxadas para o centro. o = { id, n (por segundo), giro, puxa, tam, cima }
  espiral(x, y, z, r, h, cor, vida = 1.5, o = {}) {
    const c = new THREE.Color(cor),
      ritmo = (o.n ?? 70) * this.taxa;
    let acum = 0;
    this._temp(
      new THREE.Object3D(),
      vida,
      (q, k, dt) => {
        acum += ritmo * dt;
        while (acum >= 1) {
          acum--;
          this.particulas({
            x,
            y: y + Math.random() * h,
            z,
            n: 1,
            raio: 0,
            cor: c,
            vel: 0,
            vida: 0.8,
            grav: -(o.cima ?? 1.2),
            tam: o.tam ?? 0.22,
            giro: o.giro ?? 3.5,
            puxa: o.puxa ?? 0.9,
          });
          const P = this.P,
            i = P.i,
            a = Math.random() * Math.PI * 2,
            rr = r * (0.75 + Math.random() * 0.35);
          P.pos[i * 3] = x + Math.cos(a) * rr;
          P.pos[i * 3 + 2] = z + Math.sin(a) * rr;
        }
      },
      { id: o.id },
    );
  }
  // particulas que comecam numa esfera de raio r e correm para o centro
  implosao(x, y, z, r, cor, n = 80, vida = 0.45) {
    const c = new THREE.Color(cor);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2,
        e = Math.acos(Math.random() * 2 - 1),
        rr = r * (0.8 + Math.random() * 0.4),
        dx = Math.sin(e) * Math.cos(a),
        dy = Math.cos(e),
        dz = Math.sin(e) * Math.sin(a),
        v = rr / vida;
      this._ponto(x + dx * rr, y + dy * rr * 0.7, z + dz * rr, -dx * v, -dy * v * 0.7, -dz * v, c, vida, 0.26);
    }
  }
  // clarao: uma luz de verdade que ilumina personagens e cenario por um instante.
  // Sem luzes (opcoes.luzes = 0, o padrao), vira um brilho redondo que some rapido.
  clarao(x, y, z, cor = 0xffffff, forca = 1, vida = 0.35) {
    if (!this.luzes.length) {
      const s = brilho(cor, 6 * forca);
      s.position.set(x, y, z);
      this._temp(s, vida, (q, k) => {
        s.material.opacity = 0.9 * (1 - k) * (1 - k);
      });
      return;
    }
    let l =
      this.luzes.find(o => o.userData.vida <= 0) ||
      this.luzes.reduce((a, b) => (a.userData.vida < b.userData.vida ? a : b));
    l.position.set(x, y, z);
    l.color.set(cor);
    l.userData = { vida, max: vida, forca: 90 * forca };
    l.intensity = l.userData.forca;
  }
  // estilhacos que voam, giram e quicam no chao. o = { solido (pedra), tam, vel, cima }
  estilhacos(x, y, z, n = 14, cor = 0xffffff, o = {}) {
    const g = new THREE.Group(),
      gEst = geo('tetra', () => new THREE.TetrahedronGeometry(1, 0));
    const mat = o.solido
      ? new THREE.MeshLambertMaterial({ color: cor, flatShading: true, transparent: true })
      : new THREE.MeshBasicMaterial({ color: cor, ...ADD });
    const lista = [];
    if (this.malhasQ < 1) n = Math.max(3, Math.round(n * this.malhasQ));
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(gEst, mat),
        a = Math.random() * Math.PI * 2,
        v = (o.vel ?? 7) * (0.5 + Math.random() * 0.6);
      m.position.set(x, y, z);
      m.scale.setScalar((o.tam ?? 0.16) * (0.5 + Math.random()));
      m.rotation.set(Math.random() * 6, Math.random() * 6, 0);
      g.add(m);
      lista.push({
        m,
        vx: Math.cos(a) * v,
        vy: (o.cima ?? 5) * (0.6 + Math.random() * 0.8),
        vz: Math.sin(a) * v,
        gx: (Math.random() - 0.5) * 16,
        gy: (Math.random() - 0.5) * 16,
      });
    }
    this._temp(g, o.vida ?? 1.1, (q, k, dt) => {
      for (const e of lista) {
        e.vy -= 22 * dt;
        e.m.position.x += e.vx * dt;
        e.m.position.y += e.vy * dt;
        e.m.position.z += e.vz * dt;
        e.m.rotation.x += e.gx * dt;
        e.m.rotation.y += e.gy * dt;
        const chao = this.chao(e.m.position.x, e.m.position.z) + 0.05;
        if (e.m.position.y < chao) {
          e.m.position.y = chao;
          e.vy *= -0.35;
          e.vx *= 0.6;
          e.vz *= 0.6;
          e.gx *= 0.5;
          e.gy *= 0.5;
        }
      }
      mat.opacity = 1 - suave(lim((k - 0.6) / 0.4));
    });
  }
  // rachadura brilhante no chao (impactos fortes)
  // solida = true: pinta por cima em vez de somar luz (de dia, laranja somado com a grama vira verde-limao)
  rachadura(x, z, r, cor = 0xffa040, vida = 1.6, solida = false) {
    const m = new THREE.Mesh(
      geo('plano', () => new THREE.PlaneGeometry(2, 2)),
      new THREE.MeshBasicMaterial({ color: cor, map: texRachadura(), ...(solida ? { transparent: true, depthWrite: false } : ADD), opacity: 0 }),
    );
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.random() * 6.28;
    m.position.set(x, this.chao(x, z) + 0.07, z);
    m.scale.setScalar(r);
    this._temp(m, vida, (q, k) => {
      const t = k * q.max;
      m.scale.setScalar(r * (0.7 + 0.3 * suave(lim(t / 0.12))));
      m.material.opacity = (t < 0.12 ? t / 0.12 : 1) * (1 - suave(lim((k - 0.35) / 0.65)));
    });
  }
  // faixa brilhante no chao entre a e b ([x,z]): rastro de investidas e feixes
  faixa(a, b, larg, cor, vida = 0.6) {
    const dx = b[0] - a[0],
      dz = b[1] - a[1],
      comp = Math.hypot(dx, dz) || 0.01,
      mx = (a[0] + b[0]) / 2,
      mz = (a[1] + b[1]) / 2;
    const m = new THREE.Mesh(
      geo('plano1', () => new THREE.PlaneGeometry(1, 1)),
      new THREE.MeshBasicMaterial({ color: cor, map: texFaixa(), ...ADD, opacity: 0.8 }),
    );
    m.rotation.order = 'YXZ';
    m.rotation.set(-Math.PI / 2, Math.atan2(dx, dz), 0);
    m.scale.set(larg, comp, 1);
    m.position.set(mx, this.chao(mx, mz) + 0.1, mz);
    this._temp(m, vida, (q, k) => {
      m.material.opacity = 0.85 * (1 - k);
      m.scale.x = larg * (1 + k * 0.6);
    });
  }
  // meteoro que cai do ceu e chega em (x,z) depois de "tempo" segundos
  meteoro(x, z, cor = 0xff7a3a, tempo = 1.3, tam = 1.4) {
    const chao = this.chao(x, z),
      ini = new THREE.Vector3(x - 14, chao + 42, z - 9),
      fim = new THREE.Vector3(x, chao + tam * 0.5, z);
    const g = new THREE.Group(),
      pedra = new THREE.Mesh(
        geo('dodeca', () => new THREE.DodecahedronGeometry(1, 0)),
        new THREE.MeshLambertMaterial({ color: 0x3a2a24, emissive: cor, emissiveIntensity: 0.6, flatShading: true }),
      );
    pedra.scale.setScalar(tam);
    g.add(pedra, brilho(cor, tam * 5));
    g.position.copy(ini);
    const c = new THREE.Color(cor),
      fumaca = new THREE.Color(0x553a30);
    this._temp(g, tempo, (q, k, dt) => {
      const s = k * k;
      g.position.lerpVectors(ini, fim, s);
      pedra.rotation.x += dt * 4;
      pedra.rotation.y += dt * 3;
      for (let i = 0; i < 3; i++)
        this._ponto(
          g.position.x + (Math.random() - 0.5) * tam,
          g.position.y + (Math.random() - 0.5) * tam,
          g.position.z + (Math.random() - 0.5) * tam,
          (Math.random() - 0.5) * 2,
          1 + Math.random() * 2,
          (Math.random() - 0.5) * 2,
          i ? c : fumaca,
          0.6,
          tam * (i ? 0.9 : 1.4),
          -1,
        );
    });
  }
  // cristal que voa de a para b ([x,y,z]) fazendo um arco e explode em particulas ao chegar
  voo(a, b, cor, vida = 0.9, o = {}) {
    const A = new THREE.Vector3(...a),
      B = new THREE.Vector3(...b),
      g = new THREE.Group();
    const cristal = new THREE.Mesh(
      geo('octa', () => new THREE.OctahedronGeometry(1, 0)),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    cristal.scale.set(0.22, 0.36, 0.22);
    g.add(cristal, brilho(cor, 2.2));
    g.position.copy(A);
    const c = new THREE.Color(cor),
      alto = o.alto ?? 3.5;
    this._temp(
      g,
      vida,
      (q, k) => {
        const s = suave(k);
        g.position.lerpVectors(A, B, s);
        g.position.y += Math.sin(s * Math.PI) * alto;
        cristal.rotation.y = k * 20;
        for (let i = 0; i < 2; i++)
          this._ponto(
            g.position.x,
            g.position.y,
            g.position.z,
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5,
            c,
            0.45,
            0.24,
          );
      },
      {
        fim: () => {
          this.particulas({ x: B.x, y: B.y, z: B.z, n: 40, cor, vel: 4, vida: 0.6, grav: -1 });
          this.clarao(B.x, B.y, B.z, cor, 0.6, 0.3);
        },
      },
    );
  }
  // encerra antes da hora todos os efeitos com esse id (selo interrompido, por exemplo)
  // ------------------------------------------------------------------ efeitos dos chefes (1.3)
  // relampago em zigue-zague de a ate b ([x,y,z]) com galhos; pisca enquanto some. o = { larg, galhos }
  relampago(a, b, cor, vida = 0.3, o = {}) {
    const A = new THREE.Vector3(...a),
      B = new THREE.Vector3(...b),
      g = new THREE.Group(),
      caixa = geo('caixa1', () => new THREE.BoxGeometry(1, 1, 1));
    const mat = new THREE.MeshBasicMaterial({ color: cor, ...ADD }),
      matN = new THREE.MeshBasicMaterial({ color: 0xffffff, ...ADD }),
      d = new THREE.Vector3(),
      r = new THREE.Vector3();
    const seg = (p, q, l) => {
      d.subVectors(q, p);
      const c = d.length();
      for (const [m, k] of [
        [mat, 1],
        [matN, 0.35],
      ]) {
        const s = new THREE.Mesh(caixa, m);
        s.scale.set(l * k, l * k, c + l * 0.5);
        s.position.copy(p).addScaledVector(d, 0.5);
        s.lookAt(q);
        g.add(s);
      }
    };
    const raio = (p, q, l, nivel) => {
      const n = 7,
        pts = [p],
        c = p.distanceTo(q);
      for (let i = 1; i < n; i++)
        pts.push(
          p
            .clone()
            .lerp(q, i / n)
            .add(r.set(Math.random() - 0.5, (Math.random() - 0.5) * 0.4, Math.random() - 0.5).multiplyScalar(c * 0.16)),
        );
      pts.push(q);
      for (let i = 0; i < n; i++) seg(pts[i], pts[i + 1], l);
      if (nivel > 0)
        for (let k = 0; k < Math.floor((o.galhos ?? 2) * this.galhosQ); k++) {
          const ini = pts[1 + Math.floor(Math.random() * (n - 2))];
          raio(
            ini,
            ini
              .clone()
              .add(r.set((Math.random() - 0.5) * c * 0.45, -Math.random() * c * 0.3, (Math.random() - 0.5) * c * 0.45)),
            l * 0.5,
            nivel - 1,
          );
        }
    };
    raio(A, B, o.larg ?? 0.2, 1);
    this._temp(g, vida, (q, k) => {
      const pisca = k < 0.55 ? (Math.random() < 0.75 ? 1 : 0.25) : 1 - (k - 0.55) / 0.45;
      mat.opacity = 0.8 * pisca;
      matN.opacity = pisca;
    });
    this._ponto(B.x, B.y + 0.3, B.z, 0, 0, 0, new THREE.Color(cor), 0.25, 2.2);
  }
  // espinhos (gelo ou pedra) que brotam do chao, ficam um tempo e afundam. o = { anel: raio interno, alto, solido, larg }
  espinhos(x, z, r, n, cor, vida = 1.4, o = {}) {
    const g = new THREE.Group(),
      cone = geo('cone5', () => {
        const c = new THREE.ConeGeometry(1, 1, 5);
        c.translate(0, 0.5, 0);
        return c;
      }),
      c = new THREE.Color(cor);
    const mat = o.solido
      ? new THREE.MeshLambertMaterial({ color: cor, flatShading: true, transparent: true })
      : new THREE.MeshLambertMaterial({
          color: cor,
          emissive: c.clone().multiplyScalar(0.45),
          flatShading: true,
          transparent: true,
          opacity: 0.88,
        });
    const lista = [],
      r0 = o.anel ?? 0;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2,
        d = r0 + (r - r0) * Math.sqrt(Math.random()),
        px = x + Math.cos(a) * d,
        pz = z + Math.sin(a) * d,
        alto = (o.alto ?? 1.6) * (0.55 + Math.random() * 0.7);
      const m = new THREE.Mesh(cone, mat);
      m.position.set(px, this.chao(px, pz) - 0.05, pz);
      m.rotation.set((Math.random() - 0.5) * 0.6, Math.random() * 6, (Math.random() - 0.5) * 0.6);
      m.scale.set(0.001, 0.001, 0.001);
      g.add(m);
      lista.push({ m, alto, larg: (o.larg ?? 0.32) * (0.6 + Math.random() * 0.7), atraso: Math.random() * 0.12 });
    }
    this._temp(g, vida, (q, k) => {
      const t = k * q.max;
      for (const e of lista) {
        const s = suave(lim((t - e.atraso) / 0.12)) * (1 - suave(lim((t - (q.max - 0.35)) / 0.35)));
        e.m.scale.set(e.larg * Math.max(0.001, s), e.alto * Math.max(0.001, s), e.larg * Math.max(0.001, s));
      }
      mat.opacity = (o.solido ? 1 : 0.88) * (1 - suave(lim((k - 0.85) / 0.15)));
    });
  }
  // chamas que sobem do chao durante "vida" segundos (pilar ou muralha de fogo). o = { alto, n (por segundo) }
  chamas(x, z, r, cor, vida = 0.8, o = {}) {
    const c = new THREE.Color(cor),
      quente = new THREE.Color(0xffe08a),
      fumaca = new THREE.Color(0x5a3a2a),
      y = this.chao(x, z),
      ritmo = o.n ?? 90,
      alto = o.alto ?? 3;
    let acum = 0;
    const base = brilho(cor, r * 3);
    base.position.set(x, y + 0.4, z);
    this._temp(base, vida, (q, k, dt) => {
      acum += ritmo * dt;
      base.material.opacity = 0.9 * (1 - k);
      while (acum >= 1) {
        acum--;
        const a = Math.random() * Math.PI * 2,
          d = r * Math.sqrt(Math.random()),
          u = Math.random();
        this._ponto(
          x + Math.cos(a) * d,
          y + 0.1,
          z + Math.sin(a) * d,
          (Math.random() - 0.5) * 0.6,
          alto * (1.2 + Math.random()),
          (Math.random() - 0.5) * 0.6,
          u < 0.2 ? quente : u > 0.92 ? fumaca : c,
          0.55 + Math.random() * 0.3,
          0.35 + Math.random() * 0.35,
          -1,
        );
      }
    });
  }
  encerrar(id) {
    for (const o of this.temp)
      if (o.id === id && !o.saindo) {
        o.saindo = true;
        o.vida = Math.min(o.vida, 0.15);
        o.fim = null;
      }
  }

  // aviso de ataque no chao. forma = {tipo:'circulo',x,z,r} | {tipo:'cone',x,z,yaw,ang,r} | {tipo:'ret',x,z,yaw,larg,comp}
  aviso(forma, dur, cor = 0xff3a2a) {
    const g = new THREE.Group();
    let geoB, geoF;
    if (forma.tipo === 'circulo') {
      geoB = new THREE.CircleGeometry(forma.r, 40);
      geoF = new THREE.CircleGeometry(forma.r, 40);
    } else if (forma.tipo === 'anel') {
      geoB = new THREE.RingGeometry(forma.r0, forma.r, 56);
      geoF = geoB.clone();
    } else if (forma.tipo === 'cone') {
      geoB = new THREE.CircleGeometry(forma.r, 32, Math.PI / 2 - forma.ang / 2, forma.ang);
      geoF = geoB.clone();
    } else {
      geoB = new THREE.PlaneGeometry(forma.larg, forma.comp);
      geoB.translate(0, forma.comp / 2, 0);
      geoF = geoB.clone();
    }
    const base = new THREE.Mesh(
      geoB,
      new THREE.MeshBasicMaterial({
        color: cor,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const cheio = new THREE.Mesh(
      geoF,
      new THREE.MeshBasicMaterial({
        color: cor,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    cheio.position.z = -0.01;
    g.add(base, cheio);
    g.rotation.order = 'YXZ';
    g.rotation.set(Math.PI / 2, forma.yaw ?? 0, 0);
    g.position.set(forma.x, this.chao(forma.x, forma.z) + 0.07, forma.z);
    const o = {
      malha: g,
      vida: dur,
      max: dur,
      cancelado: false,
      passo: (q, k) => {
        if (forma.tipo === 'ret') cheio.scale.set(1, Math.max(0.001, k), 1);
        else if (forma.tipo === 'anel') cheio.material.opacity = 0.1 + 0.5 * k;
        else cheio.scale.setScalar(Math.max(0.001, k));
      },
    };
    if (this.cena) this.cena.add(g);
    this.temp.push(o);
    return o;
  }

  // desloca um aviso que persegue o alvo
  moverAviso(o, x, z) {
    o.malha.position.set(x, this.chao(x, z) + 0.07, z);
  }

  // numero de dano flutuando sobre pos (THREE.Vector3). Precisa de opcoes.camada e de um estilo
  // CSS para ".num" e ".num.grande" (o Cristalia/Runeclash ainda usa os numeros de dano proprios dele).
  texto(pos, str, cor = '#fff', grande = false) {
    if (!this.camada) return;
    const el = document.createElement('div');
    el.className = 'num' + (grande ? ' grande' : '');
    el.textContent = str;
    el.style.color = cor;
    this.camada.appendChild(el);
    this.textos.push({
      el,
      p: pos
        .clone()
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.4, (Math.random() - 0.5) * 0.8)),
      vida: 0.9,
    });
    if (this.textos.length > 60) {
      const v = this.textos.shift();
      v.el.remove();
    }
  }

  // anda com as particulas de um grupo (e nao manda nada para a placa de video se ele esta vazio)
  _atualizarGrupo(P, pontos, dt, altura_) {
    if (!P.vivas) return;
    let vivas = 0;
    for (let i = 0; i < P.n; i++) {
      if (P.vida[i] <= 0) continue;
      P.vida[i] -= dt;
      const k = Math.max(0, P.vida[i] / P.max[i]);
      P.vel[i * 3 + 1] -= P.grav[i] * dt;
      P.pos[i * 3] += P.vel[i * 3] * dt;
      P.pos[i * 3 + 1] += P.vel[i * 3 + 1] * dt;
      P.pos[i * 3 + 2] += P.vel[i * 3 + 2] * dt;
      if (P.giro[i] || P.puxa[i]) {
        // gira em volta do centro e encolhe o raio
        const dx = P.pos[i * 3] - P.cx[i],
          dz = P.pos[i * 3 + 2] - P.cz[i],
          a = P.giro[i] * dt,
          c = Math.cos(a),
          s = Math.sin(a),
          f = Math.max(0, 1 - P.puxa[i] * dt);
        P.pos[i * 3] = P.cx[i] + (dx * c - dz * s) * f;
        P.pos[i * 3 + 2] = P.cz[i] + (dx * s + dz * c) * f;
      }
      if (P.muda[i]) for (let c = 0; c < 3; c++) P.cor[i * 4 + c] = P.cf[i * 3 + c] + (P.c0[i * 3 + c] - P.cf[i * 3 + c]) * k;
      if (P.cresce[i]) {
        // fogo: nasce pequeno, cresce e some devagar
        P.cor[i * 4 + 3] = Math.min(1, k * 1.6);
        P.tam[i] = P.t0[i] * (0.3 + P.cresce[i] * (1 - k));
      } else {
        P.cor[i * 4 + 3] = k;
        P.tam[i] = P.t0[i] * (0.4 + 0.6 * k);
      }
      if (P.vida[i] <= 0) P.tam[i] = 0;
      else vivas++;
    }
    P.vivas = vivas;
    const g = pontos.geometry;
    g.attributes.position.needsUpdate = g.attributes.cor.needsUpdate = g.attributes.tam.needsUpdate = true;
    pontos.material.uniforms.escala.value = altura_ * 0.9;
  }

  atualizar(dt, cam, largura, altura_) {
    this.tempo += dt;
    this._atualizarGrupo(this.P, this.pontos, dt, altura_);
    if (this.F) this._atualizarGrupo(this.F, this.pontosF, dt, altura_);
    for (const l of this.luzes) {
      const u = l.userData;
      if (u.vida > 0) {
        u.vida -= dt;
        const k = Math.max(0, u.vida / u.max);
        l.intensity = u.forca * k * k;
      } else l.intensity = 0;
    }
    for (let i = this.temp.length - 1; i >= 0; i--) {
      const o = this.temp[i];
      o.vida -= dt;
      if (o.vida <= 0 || o.cancelado) {
        if (o.vida <= 0 && !o.cancelado && o.fim) o.fim(o);
        if (this.cena) this.cena.remove(o.malha);
        o.malha.traverse(m => {
          if (m.geometry && !m.geometry.userData.fixa) m.geometry.dispose();
          if (m.material) m.material.dispose();
        });
        this.temp.splice(i, 1);
      } else if (o.saindo) {
        o.malha.traverse(m => {
          if (m.material) m.material.opacity *= Math.max(0, 1 - dt * 8);
        });
      } else o.passo(o, 1 - o.vida / o.max, dt);
    }
    const v = new THREE.Vector3();
    for (let i = this.textos.length - 1; i >= 0; i--) {
      const t = this.textos[i];
      t.vida -= dt;
      t.p.y += dt * 1.6;
      if (t.vida <= 0) {
        t.el.remove();
        this.textos.splice(i, 1);
        continue;
      }
      v.copy(t.p).project(cam);
      t.el.style.display = v.z > 1 ? 'none' : '';
      t.el.style.transform = `translate(${(v.x * 0.5 + 0.5) * largura}px, ${(-v.y * 0.5 + 0.5) * altura_}px) translate(-50%,-50%)`;
      t.el.style.opacity = Math.min(1, t.vida * 3);
    }
    this.tremor = Math.max(0, this.tremor - dt * 2.2);
  }
  tremer(f) {
    this.tremor = Math.min(1, Math.max(this.tremor, f));
  }
  limpar() {
    for (const o of this.temp) o.cancelado = true;
    for (const t of this.textos) t.el.remove();
    this.textos.length = 0;
    for (const l of this.luzes) {
      l.userData.vida = 0;
      l.intensity = 0;
    }
  }
}

// nomes dos efeitos que so recebem numeros/listas/objetos simples e podem ser repetidos pela rede
// (era usado pelo online da Arena; fica guardado para a etapa 7 do PLANO.md)
export const FX_REDE = [
  'particulas',
  'arco',
  'onda',
  'coluna',
  'esfera',
  'tremer',
  'runa',
  'aneis',
  'correntes',
  'espiral',
  'implosao',
  'clarao',
  'estilhacos',
  'rachadura',
  'faixa',
  'meteoro',
  'voo',
  'encerrar',
  'relampago',
  'espinhos',
  'chamas',
];

// testes de forma (ponto dentro da area)
export function dentro(f, px, pz, folga = 0) {
  const dx = px - f.x,
    dz = pz - f.z;
  if (f.tipo === 'circulo') return dx * dx + dz * dz <= (f.r + folga) * (f.r + folga);
  if (f.tipo === 'anel') {
    const d = Math.hypot(dx, dz);
    return d >= f.r0 - folga && d <= f.r + folga;
  }
  const s = Math.sin(f.yaw),
    c = Math.cos(f.yaw),
    frente = dx * s + dz * c,
    lado = dx * c - dz * s;
  if (f.tipo === 'cone') {
    const d = Math.hypot(dx, dz);
    if (d > f.r + folga) return false;
    if (d < folga + 0.4) return true;
    return Math.abs(Math.atan2(lado, frente)) <= f.ang / 2 + folga / Math.max(d, 1);
  }
  return frente >= -folga && frente <= f.comp + folga && Math.abs(lado) <= f.larg / 2 + folga;
}
