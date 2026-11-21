// O Invocador: o personagem do jogador no mapa (ideia 1.3).
// Corpo feito com as peças do Blender da Arena (h_tronco, h_cabeca, h_cabelo0..5, h_braco, h_ante,
// h_coxa, h_canela, h_capa, h_ombreira) e animado por código (parado, andar e conjurar), como na Arena.
// Na mão esquerda ele segura a pedra de selamento (a mesma pedra 3D provisória do mapa).
// A aparência padrão é o Aiden (a ficha do personagem): cabelo preto, olhos roxos, sobretudo preto
// com detalhes dourados, gema roxa no peito e a pedra roxa na mão. O sobretudo longo e o rosto da ficha
// ficam para o modelo próprio do Aiden (etapa 4, personagens).
//
// Uso:
//   const inv = criarInvocador(aparencia);   // aparencia: veja APARENCIA_PADRAO
//   cena.add(inv);
//   animarInvocador(inv, dt, movendo);        // a cada quadro
//   conjurar(inv);                            // ergue a pedra por um instante (ao invocar ou guardar o monstro)
import * as THREE from 'three';
import { peca, temPeca } from './arena/pecas.js';
import { criarCristal } from './modelos.js';

// Escala no mapa: o corpo da Arena tem uns 1,9 m; o treinador antigo tinha uns 1,55 m.
const ESCALA_MAPA = 0.8;

// Cores prontas (no celular é mais fácil tocar numa bolinha do que usar o seletor de cor).
// A primeira de cada lista é a do Aiden (paleta da ficha: #0B0D13, #1B1D23, #3A0070, #7A2CFE, #C89B2E, #E6E6E6).
export const PALETAS = {
  pele: ['#eac3a2', '#f6d7bd', '#c98f65', '#9a6644', '#6b4430', '#8fa8c8'],
  cabelo: ['#0b0d13', '#3a2a20', '#7a4a2a', '#d8b26a', '#e6e6e6', '#c0392b', '#3a0070', '#2e7d6f'],
  olhos: ['#7a2cfe', '#3a2a20', '#2e7dd0', '#2e9d6f', '#c0392b', '#c89b2e'],
  roupa: ['#1b1d23', '#0b0d13', '#3a0070', '#3f6bb0', '#5a2a2a', '#2f5a3a', '#4a4a52', '#e6e6e6'],
  detalhe: ['#c89b2e', '#7a2cfe', '#c0c8d8', '#8a2a3a', '#2a9d8f', '#e6e6e6'],
};
export const PENTEADOS = ['Curto', 'Longo', 'Espetado', 'Rabo', 'Coques', 'Chapéu'];
export const NOMES_CORES = { pele: 'Pele', cabelo: 'Cabelo', olhos: 'Olhos', roupa: 'Roupa', detalhe: 'Detalhes' };

// O Aiden
export const APARENCIA_PADRAO = {
  pele: '#eac3a2', cabelo: '#0b0d13', olhos: '#7a2cfe', roupa: '#1b1d23', detalhe: '#c89b2e',
  penteado: 2, capa: true, ombreiras: false, altura: 1,
};

// Confere uma aparência vinda do jogo salvo (ou da nuvem): o que estiver errado volta ao padrão
export function limparAparencia(a) {
  const o = a && typeof a === 'object' ? a : {}, P = APARENCIA_PADRAO;
  const cor = (v, p) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : p);
  return {
    pele: cor(o.pele, P.pele), cabelo: cor(o.cabelo, P.cabelo), olhos: cor(o.olhos, P.olhos), roupa: cor(o.roupa, P.roupa), detalhe: cor(o.detalhe, P.detalhe),
    penteado: Number.isInteger(o.penteado) && o.penteado >= 0 && o.penteado < PENTEADOS.length ? o.penteado : P.penteado,
    capa: o.capa === undefined ? P.capa : !!o.capa,
    ombreiras: o.ombreiras === undefined ? P.ombreiras : !!o.ombreiras,
    altura: Math.max(0.9, Math.min(1.1, Number(o.altura) || 1)),
  };
}

// Sorteia uma aparência (botão "Sortear" do criador)
export function sortearAparencia() {
  const um = (l) => l[Math.floor(Math.random() * l.length)];
  return limparAparencia({
    pele: um(PALETAS.pele), cabelo: um(PALETAS.cabelo), olhos: um(PALETAS.olhos), roupa: um(PALETAS.roupa), detalhe: um(PALETAS.detalhe),
    penteado: Math.floor(Math.random() * PENTEADOS.length), capa: Math.random() < 0.6, ombreiras: Math.random() < 0.4,
    altura: 0.92 + Math.random() * 0.16,
  });
}

const grupo = (pai, x = 0, y = 0, z = 0) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  pai.add(g);
  return g;
};

const MAT_SOMBRA = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false });
const GEO_SOMBRA = new THREE.CircleGeometry(0.42, 16);
const GEO_GEMA = new THREE.OctahedronGeometry(0.045, 0);
const COR_BOTA = '#1e1a22';

// As peças trazem um material novo por pedaço; aqui as partes com a mesma cor passam a usar
// o mesmo material (menos trocas de material para a placa de vídeo do celular)
function compartilharMateriais(raiz) {
  const usados = new Map();
  raiz.traverse((o) => {
    if (!o.isMesh || !o.material?.userData?.slot) return;
    const k = o.material.type + '|' + o.material.color.getHexString();
    const m = usados.get(k);
    if (m) { o.material.dispose(); o.material = m; } else usados.set(k, o.material);
  });
}

// tipoPedra: 0 azul, 1 roxa, 2 dourada
export function criarInvocador(aparencia = APARENCIA_PADRAO, tipoPedra = 1) {
  const c = limparAparencia(aparencia);
  const cores = {
    pele: c.pele, roupa: c.roupa, detalhe: c.detalhe, cabelo: c.cabelo, olho: c.olhos,
    calca: '#0b0d13', metal: c.detalhe, couro: '#3a2a20', branco: '#e6e6e6',
  };
  const raiz = new THREE.Group();
  const corpo = grupo(raiz);
  corpo.scale.setScalar(ESCALA_MAPA * c.altura);
  const J = { corpo };
  if (!temPeca('h_tronco')) throw new Error('Peças do Invocador (h_*) não encontradas em pecas_blender.js');
  J.quadril = grupo(corpo, 0, 0.92, 0);
  J.tronco = grupo(J.quadril, 0, 0.04, 0);
  J.tronco.add(peca('h_tronco', cores));
  // a gema roxa no peito (da ficha do Aiden), acesa
  const gema = new THREE.Mesh(GEO_GEMA, new THREE.MeshBasicMaterial({ color: '#a46bff' }));
  gema.position.set(0, 0.4, 0.165);
  gema.scale.set(0.8, 1.3, 0.5);
  J.tronco.add(gema);
  J.cabeca = grupo(J.tronco, 0, 0.62, 0);
  J.cabeca.add(peca('h_cabeca', cores));
  if (temPeca('h_cabelo' + c.penteado)) J.cabeca.add(peca('h_cabelo' + c.penteado, cores));
  if (c.capa) {
    // a capa usa a cor da roupa (no Aiden: preta, como a cauda do sobretudo)
    J.capa = grupo(J.tronco, 0, 0.58, -0.16);
    J.capa.add(peca('h_capa', { ...cores, detalhe: c.roupa }));
  }
  for (const [s, k] of [[-1, 'E'], [1, 'D']]) {
    const b = (J['braco' + k] = grupo(J.tronco, s * 0.33, 0.55, 0));
    b.add(peca('h_braco', cores));
    if (c.ombreiras) {
      const o = peca('h_ombreira', cores);
      o.scale.x = s; // modelada no ombro direito; espelhada no esquerdo
      b.add(o);
    }
    const a = (J['ante' + k] = grupo(b, 0, -0.32, 0));
    a.add(peca('h_ante', cores));
    J['mao' + k] = grupo(a, 0, -0.32, 0);
    const p = (J['perna' + k] = grupo(J.quadril, s * 0.13, 0, 0));
    p.add(peca('h_coxa', cores));
    const cn = (J['canela' + k] = grupo(p, 0, -0.45, 0));
    cn.add(peca('h_canela', { ...cores, detalhe: COR_BOTA })); // botas escuras (como na ficha do Aiden), em vez da cor dos detalhes
  }
  compartilharMateriais(raiz);
  // a pedra de selamento na mão esquerda, um pouco à frente
  const pedra = criarCristal(0.42, tipoPedra);
  pedra.position.set(0, -0.06, 0.1);
  J.maoE.add(pedra);
  J.pedra = pedra;

  const sombra = new THREE.Mesh(GEO_SOMBRA, MAT_SOMBRA);
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.04;
  raiz.add(sombra);

  raiz.userData = { invocador: true, J, aparencia: c, t: Math.random() * 10, vel: 0, conjurar: 0 };
  return raiz;
}

// Libera os materiais de um Invocador que saiu de cena (as formas das peças são reaproveitadas)
export function descartarInvocador(inv) {
  const feitos = new Set();
  inv.traverse((o) => {
    if (!o.isMesh || o.material === MAT_SOMBRA || feitos.has(o.material)) return;
    if (o.parent === inv.userData.J.pedra) return; // o anel da pedra é de todas as pedras
    feitos.add(o.material);
    o.material.dispose();
  });
}

// ergue a pedra por um instante (ao invocar ou guardar o monstro)
export function conjurar(inv) {
  if (inv?.userData?.invocador) inv.userData.conjurar = 0.0001;
}

const DUR_CONJURAR = 0.9;
const ease = (t) => t * t * (3 - 2 * t);
const JUNTAS = ['tronco', 'cabeca', 'bracoE', 'bracoD', 'anteE', 'anteD', 'pernaE', 'pernaD', 'canelaE', 'canelaD'];

// Animação calculada por código, a mesma da Arena (parado e andar), mais o "conjurar".
export function animarInvocador(inv, dt, movendo) {
  const u = inv.userData, J = u.J;
  u.t += dt;
  // a velocidade sobe e desce suave (não pula de parado para correndo)
  u.vel += ((movendo ? 1 : 0) - u.vel) * Math.min(1, dt * 10);
  const t = u.t, v = u.vel, f = t * 11;
  for (const k of JUNTAS) J[k].rotation.set(0, 0, 0);
  J.tronco.rotation.x = 0.04 * Math.sin(t * 2) + 0.2 * v;
  J.pernaE.rotation.x = Math.sin(f) * 0.95 * v;
  J.pernaD.rotation.x = -Math.sin(f) * 0.95 * v;
  J.canelaE.rotation.x = Math.max(0, -Math.cos(f)) * 1.2 * v;
  J.canelaD.rotation.x = Math.max(0, Math.cos(f)) * 1.2 * v;
  // braço esquerdo (o da pedra) balança menos e fica com a pedra à frente
  J.bracoE.rotation.x = -0.35 - Math.sin(f) * 0.35 * v;
  J.anteE.rotation.x = -0.9;
  J.bracoD.rotation.x = Math.sin(f) * 0.7 * v;
  J.anteD.rotation.x = -0.25 - 0.5 * v;
  J.bracoE.rotation.z = -0.1;
  J.bracoD.rotation.z = 0.08;
  J.corpo.position.y = Math.abs(Math.sin(f)) * 0.06 * v;
  // selando (ideia 2.1): a pedra fica erguida, apontada para o monstro, até o selo terminar
  u.canalK = Math.max(0, Math.min(1, (u.canalK || 0) + (u.canal ? dt / 0.3 : -dt / 0.35)));
  if (u.canalK > 0) {
    const k = ease(u.canalK);
    u.conjurar = 0;
    J.bracoE.rotation.x += (-1.75 - J.bracoE.rotation.x) * k; // braço da pedra esticado para a frente e um pouco para cima
    J.anteE.rotation.x += (-0.15 - J.anteE.rotation.x) * k;
    J.bracoE.rotation.z += (-0.05 - J.bracoE.rotation.z) * k;
    J.bracoD.rotation.x += (-0.7 - J.bracoD.rotation.x) * k;  // a outra mão ajuda, mais baixa
    J.anteD.rotation.x += (-0.9 - J.anteD.rotation.x) * k;
    J.tronco.rotation.x += (-0.08 - J.tronco.rotation.x) * k;
    J.pernaE.rotation.x += (-0.25 - J.pernaE.rotation.x) * k; // pé da frente firme
    J.pernaD.rotation.x += (0.2 - J.pernaD.rotation.x) * k;
  } else if (u.conjurar > 0) {
    u.conjurar += dt;
    const p = Math.min(1, u.conjurar / DUR_CONJURAR), sp = Math.sin(p * Math.PI);
    J.bracoE.rotation.x = -0.35 - 2.3 * ease(sp); // ergue a pedra
    J.anteE.rotation.x = -0.9 * (1 - sp);
    J.bracoD.rotation.x = -1.6 * sp;
    J.bracoD.rotation.z = 0.08 + 0.5 * sp;
    J.tronco.rotation.x = -0.12 * sp;
    J.corpo.position.y = 0.1 * sp;
    if (p >= 1) u.conjurar = 0;
  }
  // a pedra gira devagar na mão; a capa balança com o passo
  J.pedra.rotation.y = t * 1.5;
  if (J.capa) J.capa.rotation.x = 0.12 + 0.55 * v + 0.06 * Math.sin(t * 3);
}
