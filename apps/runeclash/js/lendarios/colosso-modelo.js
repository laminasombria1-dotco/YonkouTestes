// =============================================================
// COLOSSO DE BASALTO: o modelo e a animação (etapa 5.4, o 2º lendário)
// Era o chefe gigante de pedra da Arena das Brasas. O corpo é feito das peças do Blender da Arena
// (c_tronco, c_costas, c_cabeca, c_braco, c_ante, c_perna em js/arena/pecas_blender.js), com as
// mesmas juntas de lá: tronco, cabeça, braços (ombro e antebraço) e pernas, e o núcleo de magma
// no peito. A animação foi trazida de ARENA_PROTOTIPO/js/modelos.js (animarChefe, parte do colosso).
//   parado: respira e o núcleo gira · andando: passos pesados
//   golpe de perto (Esmagar): ergue os dois punhos e desce com tudo
//   disparo (Arremesso): arranca uma pedra com a direita, gira o tronco e lança
//   área (Terremoto): agacha, ergue os braços e bate no chão
// A frente olha para +Z, como todo monstro do jogo.
// =============================================================
import * as THREE from 'three';
import { peca } from '../arena/pecas.js';

// o Colosso da Arena tem uns 5,2 m de altura; aqui ele fica menor (a espécie ainda aumenta pelo "tamanho")
export const ESCALA_COLOSSO = 0.38;

const grupo = (pai, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); pai.add(g); return g; };
const lado = (nome, s) => { const o = peca(nome); o.scale.x = s; return o; };
const ease = (t) => t * t * (3 - 2 * t);
const lim = (t) => Math.min(1, Math.max(0, t));

export function montarColosso(c, u) {
  const raiz = grupo(c);
  raiz.scale.setScalar(ESCALA_COLOSSO);
  const J = {};
  J.corpo = grupo(raiz); J.tronco = grupo(J.corpo, 0, 2.3, 0); J.tronco.add(peca('c_tronco'), peca('c_costas'));
  // núcleo de magma no peito (gira e pulsa); o material é dele, para piscar sozinho
  const nucleo = new THREE.MeshBasicMaterial({ color: 0xff8a2b });
  J.nucleo = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), nucleo);
  J.nucleo.position.set(0, 0.9, 0.82); J.nucleo.userData.geometriaPropria = true; J.tronco.add(J.nucleo);
  J.cabeca = grupo(J.tronco, 0, 2.15, 0.1); J.cabeca.add(peca('c_cabeca'));
  for (const [s, k] of [[-1, 'E'], [1, 'D']]) {
    J['braco' + k] = grupo(J.tronco, s * 1.75, 1.6, 0); J['braco' + k].add(lado('c_braco', s));
    J['ante' + k] = grupo(J['braco' + k], 0, -1.45, 0); J['ante' + k].add(lado('c_ante', s));
    J['perna' + k] = grupo(J.corpo, s * 0.7, 2.0, 0); J['perna' + k].add(lado('c_perna', s));
  }
  // brilhos (rachaduras de magma): pulsam e clareiam quando ele prepara um golpe
  J.brilhos = [nucleo];
  raiz.traverse((o) => { if (o.isMesh && o.material.userData.slot?.startsWith('luz') && !J.brilhos.includes(o.material)) J.brilhos.push(o.material); });
  for (const m of J.brilhos) m.userData.cor0 = m.color.clone();
  u.colosso = { J, golpe: null, tAnt: null };
  u.animar = (t, movendo) => animarColosso(u, t, movendo);
  u.aoGolpe = (tipo, prep) => { u.colosso.golpe = { tipo, prep: Math.max(0.05, prep), t: 0 }; };
  u.aoParar = () => { u.colosso.golpe = null; };
}

const BRANCO = new THREE.Color(0xffffff);
const BATE = 0.4, VOLTA = 0.7; // ele é pesado: o golpe e a volta demoram mais que os da Serpe

function animarColosso(u, t, movendo) {
  const S = u.colosso, J = S.J;
  const dt = S.tAnt == null ? 0 : Math.min(0.1, Math.max(0, t - S.tAnt));
  S.tAnt = t;
  let prep = 0, bate = 0, at = '';
  const g = S.golpe;
  if (g) {
    g.t += dt;
    at = g.tipo === 'corpo' ? 'esmagar' : g.tipo === 'projetil' ? 'pedra' : 'terremoto';
    if (g.t < g.prep) prep = ease(lim(g.t / g.prep));
    else if (g.t < g.prep + BATE) bate = ease(lim((g.t - g.prep) / BATE * 2.5));
    else if (g.t < g.prep + BATE + VOLTA) bate = 1 - ease(lim((g.t - g.prep - BATE) / VOLTA * 1.3));
    else S.golpe = null;
  }
  const a = movendo ? 1 : 0, f = t * 4, resp = Math.sin(t * 1.7), joga = at === 'pedra', treme = at === 'terremoto';
  J.corpo.position.y = Math.abs(Math.sin(f)) * 0.12 * a - (treme ? prep * 0.55 - bate * 0.2 : 0);
  J.corpo.rotation.z = Math.sin(f) * 0.04 * a;
  J.tronco.position.y = 2.3 + resp * 0.04;
  J.pernaE.rotation.x = Math.sin(f) * 0.45 * a; J.pernaD.rotation.x = -Math.sin(f) * 0.45 * a;
  J.pernaE.rotation.z = -prep * 0.16; J.pernaD.rotation.z = prep * 0.16;
  if (joga) { // arremesso: arranca a pedra com a direita, gira o tronco e lança
    J.bracoD.rotation.x = prep * 2.3 - bate * 1.9; J.bracoE.rotation.x = -prep * 0.9 + bate * 0.4; J.bracoD.rotation.z = 0;
    J.tronco.rotation.y = -prep * 0.6 + bate * 0.7;
  } else { // esmagar e terremoto: os dois punhos sobem e descem juntos
    J.bracoE.rotation.x = -Math.sin(f) * 0.3 * a - prep * 2.7 + bate * 2.3;
    J.bracoD.rotation.x = Math.sin(f) * 0.3 * a - prep * 2.7 + bate * 2.3;
    J.bracoD.rotation.z = 0; J.tronco.rotation.y = 0;
  }
  J.bracoE.rotation.z = 0;
  J.tronco.rotation.x = -prep * (treme ? 0.45 : 0.25) + bate * 0.55 + resp * 0.025;
  J.anteE.rotation.x = J.anteD.rotation.x = -0.25 - prep * 0.45 + bate * 0.3;
  J.cabeca.rotation.y = Math.sin(t * 0.8) * 0.2 * (1 - prep); J.cabeca.rotation.x = -prep * 0.15 + bate * 0.3;
  J.nucleo.rotation.y = t * (2 + prep * 6); J.nucleo.scale.setScalar(1 + 0.15 * Math.sin(t * 4) + prep * 0.35);
  const forca = 0.8 + 0.2 * Math.sin(t * 4);
  for (const m of J.brilhos) m.color.copy(m.userData.cor0).multiplyScalar(forca).lerp(BRANCO, prep * 0.45);
}
