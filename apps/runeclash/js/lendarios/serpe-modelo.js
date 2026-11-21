// =============================================================
// SERPE DA TORMENTA: o modelo e a animação (etapa 5.4, o 1º lendário)
// Era o chefe dragão da Arena das Brasas. O corpo é feito das peças do Blender da Arena
// (s_corpo, s_asa, s_cauda... em js/arena/pecas_blender.js), com as mesmas juntas de lá:
// corpo, pescoço, cabeça, mandíbula, asas, patas da frente (braço e antebraço), patas de trás
// (coxa e canela) e a cauda em 8 gomos com cristais. A animação foi trazida de
// ARENA_PROTOTIPO/js/modelos.js (animarSerpe), sem os raios vivos do corpo.
//   parado: respira e mexe a cauda · andando: trota em diagonal
//   golpe de perto (Mordida): recua o pescoço, abre a boca e dá o bote
//   disparo e área (Raios e Tempestade): fica de pé, abre as asas de frente e ruge
// A frente olha para +Z, como todo monstro do jogo.
// =============================================================
import * as THREE from 'three';
import { peca } from '../arena/pecas.js';

// a Serpe da Arena tem uns 4,3 m de altura; aqui ela fica menor (a espécie ainda aumenta pelo "tamanho")
export const ESCALA_SERPE = 0.42;

const grupo = (pai, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); pai.add(g); return g; };
const ladoPeca = (nome, s) => { const o = peca(nome); o.scale.x = s; return o; };
const mix = (a, b, k) => a + (b - a) * k;
const ease = (t) => t * t * (3 - 2 * t);
const lim = (t) => Math.min(1, Math.max(0, t));

// Monta a Serpe dentro de "c" (o corpo do modelo) e guarda as juntas em u.serpe
export function montarSerpe(c, u) {
  const raiz = grupo(c);
  raiz.scale.setScalar(ESCALA_SERPE);
  const J = {};
  J.corpo = grupo(raiz, 0, 2.35, 0); J.corpo.add(peca('s_corpo'));
  J.pescoco = grupo(J.corpo, 0, 0.45, 1.75); J.pescoco.add(peca('s_pescoco'));
  J.cabeca = grupo(J.pescoco, 0, 1.55, 1.05); J.cabeca.add(peca('s_cabeca'));
  J.mandibula = grupo(J.cabeca, 0, -0.144, 0.06); J.mandibula.add(peca('s_mandibula'));
  for (const [s, k] of [[-1, 'E'], [1, 'D']]) {
    J['asa' + k] = grupo(J.corpo, s * 0.5, 0.72, 0.75); J['asa' + k].add(ladoPeca('s_asa', s));
    J['braco' + k] = grupo(J.corpo, s * 0.62, -0.25, 1.05); J['braco' + k].add(ladoPeca('s_braco', s));
    J['ante' + k] = grupo(J['braco' + k], s * 0.06, -0.95, -0.25); J['ante' + k].add(ladoPeca('s_antebraco', s));
    J['coxa' + k] = grupo(J.corpo, s * 0.66, -0.05, -1.25); J['coxa' + k].add(ladoPeca('s_coxa', s));
    J['canela' + k] = grupo(J['coxa' + k], s * 0.08, -0.85, 0.45); J['canela' + k].add(ladoPeca('s_canela', s));
  }
  let pai = J.corpo; J.cauda = [];
  for (let i = 0; i < 8; i++) { // cauda longa: cada gomo mais fino, com cristais cada vez maiores na crista
    const g = grupo(pai, 0, i ? 0 : 0.05, i ? -0.8 : -1.95), m = peca('s_cauda'), e = peca('s_espinho'), k = 1 - i * 0.085;
    m.scale.set(k, k, 1); e.position.set(0, 0.36 * k, -0.4); e.scale.setScalar(0.42 + 0.07 * i); g.add(m, e); J.cauda.push(g); pai = g;
  }
  J.ponta = grupo(pai, 0, 0, -0.75); const pt = peca('s_ponta'); pt.scale.setScalar(0.75); J.ponta.add(pt);
  // brilhos (materiais "luz..."): pulsam e clareiam quando ela prepara um golpe
  J.brilhos = [];
  raiz.traverse((o) => { if (o.isMesh && o.material.userData.slot?.startsWith('luz') && !J.brilhos.includes(o.material)) { o.material.userData.cor0 = o.material.color.clone(); J.brilhos.push(o.material); } });
  u.serpe = { J, golpe: null, tAnt: null };
  u.animar = (t, movendo) => animarSerpe(u, t, movendo);
  u.aoGolpe = (tipo, prep) => { u.serpe.golpe = { tipo, prep: Math.max(0.05, prep), t: 0 }; };
  u.aoParar = () => { u.serpe.golpe = null; };
}

const BRANCO = new THREE.Color(0xffffff);
const BATE = 0.35, VOLTA = 0.55; // segundos do bote e da volta à pose normal

function animarSerpe(u, t, movendo) {
  const S = u.serpe, J = S.J;
  const dt = S.tAnt == null ? 0 : Math.min(0.1, Math.max(0, t - S.tAnt));
  S.tAnt = t;
  // o golpe em curso: prep (0..1 preparando), bate (0..1 golpeando e voltando)
  let prep = 0, bate = 0, at = '';
  const g = S.golpe;
  if (g) {
    g.t += dt;
    at = g.tipo === 'corpo' ? 'mordida' : 'rugido';
    if (g.t < g.prep) prep = ease(lim(g.t / g.prep));
    else if (g.t < g.prep + BATE) bate = ease(lim((g.t - g.prep) / BATE * 1.6));
    else if (g.t < g.prep + BATE + VOLTA) bate = 1 - ease(lim((g.t - g.prep - BATE) / VOLTA));
    else S.golpe = null;
  }
  const rugido = at === 'rugido', morde = at === 'mordida';
  const a = movendo ? 1 : 0, resp = Math.sin(t * 1.6);
  const empina = rugido ? Math.max(prep, bate * 0.85) : 0, livre = 1 - empina;
  const f = t * 7, sobe = Math.abs(Math.cos(f)) * a * livre;
  J.corpo.position.y = 2.35 + resp * 0.04 + sobe * 0.08 + empina * 0.55;
  J.corpo.position.z = morde ? -prep * 0.35 + bate * 0.7 : 0;
  J.corpo.rotation.x = -empina * 0.62 + (morde ? -prep * 0.08 + bate * 0.16 : 0);
  J.corpo.rotation.z = Math.sin(f) * 0.03 * a * livre;
  J.corpo.rotation.y = Math.sin(f) * 0.04 * a * livre;
  // patas: trote em diagonal (frente esquerda junto com trás direita); de pé no rugido
  for (const [k, fase] of [['E', 0], ['D', Math.PI]]) {
    const pf = Math.sin(f + fase) * a * livre, ergue = Math.max(0, -Math.cos(f + fase)) * a * livre, ergueT = Math.max(0, Math.cos(f + fase)) * a * livre;
    const garra = Math.sin(t * 9 + fase) * 0.25 * empina; // de pé, as patas da frente arranham o ar
    J['braco' + k].rotation.x = -pf * 0.45 - empina * 0.55 + garra;
    J['ante' + k].rotation.x = ergue * 0.7 + empina * 1.0 - garra * 0.5;
    J['coxa' + k].rotation.x = pf * 0.4 + empina * 0.3;
    J['canela' + k].rotation.x = ergueT * 0.6 + empina * 0.45;
  }
  // asas: erguidas acima das costas; abertas de frente no rugido
  let wz = 0.75 + resp * 0.05 + Math.sin(f) * 0.04 * a, wy = 0.35, wx = 0;
  wz = mix(wz, 0.45 + Math.sin(t * 4.5) * 0.3, empina); wy = mix(wy, -0.1, empina); wx = mix(wx, -0.5, empina);
  if (morde) wz += prep * 0.2 - bate * 0.1;
  J.asaE.rotation.set(wx, -wy, -wz); J.asaD.rotation.set(wx, wy, wz);
  // pescoço, cabeça e boca
  const pesc = Math.sin(t * 1.3);
  J.pescoco.rotation.x = pesc * 0.05 + (morde ? -prep * 0.4 + bate * 0.85 : 0) - empina * 0.15;
  J.pescoco.rotation.y = Math.sin(t * 0.7) * 0.18 * (1 - prep);
  J.cabeca.rotation.x = -pesc * 0.04 + (morde ? -prep * 0.2 + bate * 0.25 : 0) - empina * 0.55;
  J.cabeca.rotation.y = Math.sin(t * 1.1) * 0.12 * (1 - prep);
  J.mandibula.rotation.x = Math.max(0, 0.05 + 0.04 * Math.sin(t * 2.3) + prep * (morde ? 0.8 : 0.75) - bate * (morde ? 0.9 : 0) + (rugido ? bate * 0.55 : 0));
  // cauda: onda de lado; levanta do chão quando ela empina; chicoteia no bote
  J.cauda.forEach((k, i) => {
    k.rotation.y = Math.sin(t * 1.8 - i * 0.55) * (0.07 + i * 0.012) + Math.sin(f - i * 0.5) * 0.04 * a + (morde ? Math.sin(i * 0.8) * bate * 0.12 : 0);
    k.rotation.x = i === 0 ? 0.12 + empina * 0.55 : -0.035 + Math.sin(t * 1.3 - i * 0.5) * 0.025;
  });
  // brilho dos raios do corpo: pisca como eletricidade e fica mais forte ao preparar um golpe
  const fagulha = Math.sin(t * 37.3) * Math.sin(t * 17.1) > 0.8 ? 0.25 : 0;
  const forca = Math.min(1, 0.72 + 0.12 * Math.sin(t * 11) + fagulha + prep * 0.2);
  for (const m of J.brilhos) m.color.copy(m.userData.cor0).multiplyScalar(forca).lerp(BRANCO, prep * 0.45);
}
