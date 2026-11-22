// =============================================================
// CAVALEIRO OCO: o modelo e a animação (etapa 5.4, o 5º e último lendário)
// Era o duelista da Arena das Brasas. Corpo de humanoide das peças do Blender (h_tronco, h_coxa...) com a
// armadura por cima (k_elmo, k_peito, k_ombreira, k_montante em js/arena/pecas_blender.js): elmo de chifres
// com o visor aceso, peitoral, ombreiras em camadas, capa longa roxa e montante rúnico.
// Trazido de ARENA_PROTOTIPO/js/modelos.js (cavaleiro e a parte do cavaleiro em animarChefe).
//   parado: respira, a capa balança · andando: corre com a espada na mão
//   golpe de perto (Sequência Oca): corta de lado, trocando o lado a cada golpe
//   disparo (Estocada Sombria): puxa a espada para trás e investe com ela apontada para a frente
//   área (Lâminas Cruzadas): ergue a espada e gira o corpo inteiro
// A frente olha para +Z, como todo monstro do jogo.
// =============================================================
import * as THREE from 'three';
import { peca } from '../arena/pecas.js';

// o Cavaleiro da Arena tem uns 3,6 m (corpo de herói dobrado); aqui fica menor (a espécie ainda aumenta pelo "tamanho")
export const ESCALA_CAVALEIRO = 0.45 * 2.0;

const grupo = (pai, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); pai.add(g); return g; };
const lado = (nome, s) => { const o = peca(nome); o.scale.x = s; return o; };
const ease = (t) => t * t * (3 - 2 * t);
const lim = (t) => Math.min(1, Math.max(0, t));

export function montarCavaleiro(c, u) {
  const raiz = grupo(c);
  raiz.scale.setScalar(ESCALA_CAVALEIRO);
  const cores = { pele: 0x16181f, roupa: 0x2a2e3a, detalhe: 0x565d70, cabelo: 0x2a2e3a, calca: 0x1d2029, olho: 0x1c1c22, metal: 0xd5dbe6, couro: 0x5c4030, branco: 0xf2f2f2 };
  const J = {};
  J.corpo = grupo(raiz); J.quadril = grupo(J.corpo, 0, 0.92, 0); J.tronco = grupo(J.quadril, 0, 0.04, 0); J.tronco.add(peca('h_tronco', cores));
  J.cabeca = grupo(J.tronco, 0, 0.62, 0); J.cabeca.add(peca('h_cabeca', cores));
  for (const [s, k] of [[-1, 'E'], [1, 'D']]) {
    const b = J['braco' + k] = grupo(J.tronco, s * 0.33, 0.55, 0); b.add(peca('h_braco', cores));
    const a = J['ante' + k] = grupo(b, 0, -0.32, 0); a.add(peca('h_ante', cores));
    J['mao' + k] = grupo(a, 0, -0.32, 0);
    const p = J['perna' + k] = grupo(J.quadril, s * 0.13, 0, 0); p.add(peca('h_coxa', cores));
    const cn = J['canela' + k] = grupo(p, 0, -0.45, 0); cn.add(peca('h_canela', cores));
    b.add(lado('k_ombreira', s));
  }
  J.cabeca.add(peca('k_elmo')); J.tronco.add(peca('k_peito'));
  J.capa = grupo(J.tronco, 0, 0.58, -0.17);
  const capa = peca('h_capa', { ...cores, detalhe: 0x4a1f5e }); capa.scale.set(1.25, 1.35, 1.2); J.capa.add(capa);
  J.arma = grupo(J.maoD); J.arma.add(peca('k_montante'));
  J.brilhos = [];
  raiz.traverse((o) => { if (o.isMesh && o.material.userData.slot?.startsWith('luz') && !J.brilhos.includes(o.material)) { o.material.userData.cor0 = o.material.color.clone(); J.brilhos.push(o.material); } });
  u.cavaleiro = { J, golpe: null, tAnt: null, n: 0 };
  u.animar = (t, movendo) => animarCavaleiro(u, t, movendo);
  u.aoGolpe = (tipo, prep) => { const S = u.cavaleiro; S.golpe = { tipo, prep: Math.max(0.05, prep), t: 0, lado: S.n++ % 2 ? -1 : 1 }; };
  u.aoParar = () => { u.cavaleiro.golpe = null; };
}

const BRANCO = new THREE.Color(0xffffff);
const BATE = 0.3, VOLTA = 0.5;

function animarCavaleiro(u, t, movendo) {
  const S = u.cavaleiro, J = S.J;
  const dt = S.tAnt == null ? 0 : Math.min(0.1, Math.max(0, t - S.tAnt));
  S.tAnt = t;
  let prep = 0, bate = 0, esto = false, cruz = false, d = 1;
  const g = S.golpe;
  if (g) {
    g.t += dt; d = g.lado;
    esto = g.tipo === 'projetil'; cruz = g.tipo === 'area';
    if (g.t < g.prep) prep = ease(lim(g.t / g.prep));
    else if (g.t < g.prep + BATE) bate = ease(lim((g.t - g.prep) / BATE * 2.5));
    else if (g.t < g.prep + BATE + VOLTA) bate = 1 - ease(lim((g.t - g.prep - BATE) / VOLTA * 1.3));
    else S.golpe = null;
  }
  for (const k in J) if (J[k].isGroup && k !== 'arma') J[k].rotation.set(0, 0, 0);
  const a = movendo ? 1 : 0, f = t * 7;
  J.corpo.position.set(0, Math.abs(Math.sin(f)) * 0.05 * a, 0);
  J.tronco.rotation.x = 0.12 * a + 0.03 * Math.sin(t * 1.8);
  J.pernaE.rotation.x = Math.sin(f) * 0.7 * a; J.pernaD.rotation.x = -Math.sin(f) * 0.7 * a;
  J.canelaE.rotation.x = Math.max(0, -Math.cos(f)) * 0.9 * a; J.canelaD.rotation.x = Math.max(0, Math.cos(f)) * 0.9 * a;
  J.bracoE.rotation.x = -Math.sin(f) * 0.4 * a; J.bracoD.rotation.x = -0.5 + Math.sin(t * 1.8) * 0.04; J.anteD.rotation.x = -0.7;
  J.capa.rotation.x = 0.15 + 0.5 * a + 0.1 * Math.sin(t * 3);
  J.cabeca.rotation.y = Math.sin(t * 0.7) * 0.25;
  if (prep || bate) {
    J.cabeca.rotation.y = 0;
    if (esto) {
      J.tronco.rotation.y = -prep * 0.7 + bate * 0.5; J.bracoD.rotation.x = -1.3 - bate * 0.3; J.bracoD.rotation.z = 0.15; J.anteD.rotation.x = -prep * 1.1;
      J.maoD.rotation.x = 1.5; J.bracoE.rotation.x = -0.6 * prep; J.pernaE.rotation.x = -0.6 * (prep + bate); J.pernaD.rotation.x = 0.5 * (prep + bate); J.corpo.position.z = bate * 0.35;
    } else if (cruz) {
      J.bracoD.rotation.x = -2.8 * prep * (1 - bate); J.bracoD.rotation.z = bate * 1.4; J.maoD.rotation.x = bate * 1.3; J.corpo.rotation.y = bate * Math.PI * 2; J.bracoE.rotation.z = -bate * 1.0;
    } else {
      J.tronco.rotation.y = d * (prep * 1.0 - bate * 2.0); J.bracoD.rotation.x = -1.6; J.bracoD.rotation.z = d * (prep * 1.2 - bate * 2.4) + 0.3; J.anteD.rotation.x = -0.1; J.bracoE.rotation.x = -1.0 * prep;
    }
  }
  // o visor e as runas pulsam e clareiam ao preparar o golpe
  const k = 0.75 + 0.25 * Math.sin(t * 3);
  for (const m of J.brilhos) m.color.copy(m.userData.cor0).multiplyScalar(k).lerp(BRANCO, prep * 0.45);
}
