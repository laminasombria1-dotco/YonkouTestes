// =============================================================
// ARAUTO DAS CINZAS: o modelo e a animação (etapa 5.4, o 4º lendário)
// Era o chefe conjurador da Arena das Brasas. Feito das peças do Blender da Arena
// (a_corpo, a_cabeca, a_braco, a_capa, a_orbe em js/arena/pecas_blender.js): manto rasgado com
// runas acesas, capuz com chifres de cinza, mãos de cinza, a capa que balança e 5 orbes de brasa
// girando em volta. Ele flutua. Trazido de ARENA_PROTOTIPO/js/modelos.js (arautoBlender e a parte
// do arauto em animarChefe).
//   parado: flutua e as mãos desenham pequenos círculos · andando: inclina para a frente e a capa voa
//   golpe de perto (Mão de Cinzas): as duas mãos vão para a frente
//   disparo (Brasas Vivas): aponta para a frente e as orbes sobem
//   área (Chuva de Cinzas): ergue as mãos para o céu e as orbes sobem alto
// A frente olha para +Z, como todo monstro do jogo.
// =============================================================
import * as THREE from 'three';
import { peca } from '../arena/pecas.js';

// o Arauto da Arena tem uns 4,4 m de altura; aqui ele fica menor (a espécie ainda aumenta pelo "tamanho")
export const ESCALA_ARAUTO = 0.45;

const grupo = (pai, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); pai.add(g); return g; };
const lado = (nome, s) => { const o = peca(nome); o.scale.x = s; return o; };
const ease = (t) => t * t * (3 - 2 * t);
const lim = (t) => Math.min(1, Math.max(0, t));

export function montarArauto(c, u) {
  const raiz = grupo(c);
  raiz.scale.setScalar(ESCALA_ARAUTO);
  const J = {};
  J.corpo = grupo(raiz, 0, 1.2, 0); J.corpo.add(peca('a_corpo'));
  J.cabeca = grupo(J.corpo, 0, 2.55, 0.05); J.cabeca.add(peca('a_cabeca'));
  for (const [s, k] of [[-1, 'E'], [1, 'D']]) { J['braco' + k] = grupo(J.corpo, s * 0.85, 2.1, 0.1); J['braco' + k].add(lado('a_braco', s)); }
  J.orbes = grupo(J.corpo, 0, 1.6, 0);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2, o = peca('a_orbe');
    o.position.set(Math.cos(a) * 1.9, Math.sin(i * 2.3) * 0.4, Math.sin(a) * 1.9); o.userData.y0 = o.position.y; J.orbes.add(o);
  }
  J.capa = grupo(J.corpo, 0, 2.2, -0.34); J.capa.add(peca('a_capa'));
  J.brilhos = [];
  raiz.traverse((o) => { if (o.isMesh && o.material.userData.slot?.startsWith('luz') && !J.brilhos.includes(o.material)) { o.material.userData.cor0 = o.material.color.clone(); J.brilhos.push(o.material); } });
  u.arauto = { J, golpe: null, tAnt: null };
  u.animar = (t, movendo) => animarArauto(u, t, movendo);
  u.aoGolpe = (tipo, prep) => { u.arauto.golpe = { tipo, prep: Math.max(0.05, prep), t: 0 }; };
  u.aoParar = () => { u.arauto.golpe = null; };
}

const BRANCO = new THREE.Color(0xffffff);
const BATE = 0.35, VOLTA = 0.55;

function animarArauto(u, t, movendo) {
  const S = u.arauto, J = S.J;
  const dt = S.tAnt == null ? 0 : Math.min(0.1, Math.max(0, t - S.tAnt));
  S.tAnt = t;
  let prep = 0, bate = 0, at = '';
  const g = S.golpe;
  if (g) {
    g.t += dt;
    at = g.tipo === 'corpo' ? 'mao' : g.tipo === 'projetil' ? 'vivas' : 'chuva';
    if (g.t < g.prep) prep = ease(lim(g.t / g.prep));
    else if (g.t < g.prep + BATE) bate = ease(lim((g.t - g.prep) / BATE * 2.5));
    else if (g.t < g.prep + BATE + VOLTA) bate = 1 - ease(lim((g.t - g.prep - BATE) / VOLTA * 1.3));
    else S.golpe = null;
  }
  const a = movendo ? 1 : 0, ceu = at === 'chuva', aponta = at === 'vivas';
  J.corpo.position.y = 1.2 + Math.sin(t * 1.8) * 0.18 + prep * 0.35;
  J.corpo.rotation.x = 0.1 * a;
  J.corpo.rotation.z = Math.sin(t * 1.1) * 0.05; J.corpo.rotation.y = Math.sin(t * 0.6) * 0.08;
  // mãos: em repouso desenham pequenos círculos; ao conjurar sobem para o céu ou apontam para a frente
  for (const [k, s1, fase] of [['E', -1, 0], ['D', 1, 1.6]]) {
    let x = -0.3 + Math.sin(t * 1.7 + fase) * 0.12, z = s1 * (0.25 + Math.cos(t * 1.7 + fase) * 0.08);
    if (ceu) { x += -prep * 2.6 + bate * 0.7; z += s1 * prep * 0.3; }
    else if (aponta) { x += -prep * 1.4 + bate * 0.3; z -= s1 * prep * 0.15; }
    else { x += -prep * 2.2 + bate * 1.6; z += s1 * prep * 0.5; }
    J['braco' + k].rotation.x = x; J['braco' + k].rotation.z = z;
  }
  J.cabeca.rotation.x = 0.1 - prep * (ceu ? 0.6 : 0.3); J.cabeca.rotation.y = Math.sin(t * 0.9) * 0.15 * (1 - prep);
  J.capa.rotation.x = 0.45 + 0.35 * a + 0.08 * Math.sin(t * 2.5) + 0.04 * Math.sin(t * 6.1) + prep * 0.15;
  J.orbes.rotation.y = t * (1.4 + prep * 6); J.orbes.position.y = 1.6 + prep * (ceu ? 1.6 : 1.0);
  J.orbes.scale.setScalar(1 + prep * 0.3 + bate * 0.25);
  J.orbes.children.forEach((o, i) => { o.position.y = o.userData.y0 + Math.sin(t * 3 + i * 1.3) * 0.15; o.rotation.y = t * 2 + i; });
  // fogo tremulando
  const forca = Math.min(1, 0.78 + 0.12 * Math.sin(t * 13) + 0.1 * Math.sin(t * 7.3));
  for (const m of J.brilhos) m.color.copy(m.userData.cor0).multiplyScalar(forca).lerp(BRANCO, prep * 0.45);
}
