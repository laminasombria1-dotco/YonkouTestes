// =============================================================
// CLIMA DOS BIOMAS: a cor do céu, da névoa e da luz muda aos poucos com o bioma
// (pelos guias do Lâmina). Chamado no fim do atualizarCeu (mundo.js), depois
// do dia e da noite. Perto das bordas, a mistura segue o peso de cada bioma.
//  - Gelo: o chão "rebate" azul nas sombras.
//  - Floresta: névoa verde-azulada (o crepúsculo de mel e esmeralda) e sol dourado.
//  - Vulcânico: céu ferrugem e a luz laranja vindo de baixo (do magma), e a Chuva de Cinzas.
//  - Arquipélago: céu claro e turquesa e a chuva morna rara (com arco-íris no fim).
//  - Deserto: luz quente e dourada (sem ela tudo puxava para o verde) e a tempestade de Khamsin.
// As dungeons e as masmorras mudam o céu depois disso, por cima.
// =============================================================
import * as THREE from 'three';
import { pesosEm } from '../mapa/gerador.js';

// índice de cada bioma na lista de pesos (a ordem de CONFIG_MAPA.biomas.lista)
const I = { raio: 0, planta: 1, terra: 2, fogo: 3, agua: 4 };
const C = (h) => new THREE.Color(h);
// Por bioma: névoa de dia e de noite (com a força da mistura), luz do céu, do chão e do sol
const TINTAS = {
  raio: { chao: C('#8ea8c3') },
  planta: { nevoaDia: C('#9fb8a0'), nevoaNoite: C('#12282a'), forcaDia: 0.75, forcaNoite: 0.6, chao: C('#1e3f35'), sol: C('#ffd9a0') },
  fogo: { nevoaDia: C('#6a3a2c'), nevoaNoite: C('#1a0e0c'), forcaDia: 0.9, forcaNoite: 0.75, ceu: C('#c8a090'), chao: C('#ff5e1a'), sol: C('#ffb080'), brilho: 1.5 },
  agua: { nevoaDia: C('#9adcf0'), nevoaNoite: C('#101c3a'), forcaDia: 0.6, forcaNoite: 0.5, ceu: C('#e0f8ff'), sol: C('#fff4e0'), brilho: 1.8 },
  terra: { nevoaDia: C('#f0d9a8'), nevoaNoite: C('#1a1830'), forcaDia: 0.8, forcaNoite: 0.4, ceu: C('#ffe6c0'), chao: C('#e09a60'), sol: C('#ffe0a8'), brilho: 1.85 },
};
const CHAO_PADRAO = C('#5d7a3e'), KHAMSIN = C('#c8904a'), KHAMSIN_NOITE = C('#3a2a1e'), CINZAS = C('#2a1e1c'), CHUVA = C('#8a9aa8'), tmp = new THREE.Color();

// Mistura duas cores como a gente vê (em sRGB): a mistura do Three.js é em cor linear e sai clara demais
const ca = new THREE.Color(), cb = new THREE.Color();
function misturar(cor, alvo, k) {
  ca.copy(cor).convertLinearToSRGB(); cb.copy(alvo).convertLinearToSRGB();
  ca.lerp(cb, k); cor.copy(ca.convertSRGBToLinear());
}

export class ClimaBiomas {
  constructor(mundo) { this.m = mundo; }

  // Depois do dia e da noite: puxa as cores para as do bioma onde o jogador está
  aplicar() {
    const m = this.m;
    if (m.masmorras?.ativa) { m.hemi.groundColor.copy(CHAO_PADRAO); return; }
    const P = pesosEm(m.pos.x, m.pos.z), f = m.fatorNoite;
    m.hemi.groundColor.copy(CHAO_PADRAO);
    for (const [id, t] of Object.entries(TINTAS)) {
      const w = P[I[id]];
      if (w < 0.01) continue;
      if (t.chao) m.hemi.groundColor.lerp(t.chao, w * (id === 'terra' ? 1 - f : 1));
      if (t.nevoaDia) {
        tmp.copy(t.nevoaDia).lerp(t.nevoaNoite, f);
        const k = w * (t.forcaDia * (1 - f) + t.forcaNoite * f);
        misturar(m.cena.background, tmp, k);
        m.cena.fog.color.copy(m.cena.background);
      }
      const dia = w * (1 - f);
      if (t.sol && dia > 0) m.sol.color.lerp(t.sol, dia);
      if (t.ceu && dia > 0) m.hemi.color.lerp(t.ceu, dia);
      if (t.brilho && dia > 0) m.hemi.intensity += (t.brilho - m.hemi.intensity) * dia;
    }
    // a Chuva de Cinzas (Vulcânico): o céu escurece e a névoa fecha
    const kc = m.vulcao?.forcaChuva || 0;
    if (kc > 0.01) {
      misturar(m.cena.background, CINZAS, kc * 0.85);
      m.cena.fog.color.copy(m.cena.background);
      m.cena.fog.near += (8 - m.cena.fog.near) * kc;
      m.cena.fog.far += (55 - m.cena.fog.far) * kc;
      m.sol.intensity *= 1 - 0.5 * kc;
    }
    // a chuva morna (Arquipélago): o céu fica cinza-claro e a névoa fecha um pouco
    const ka = m.arquipelago?.forcaChuva || 0;
    if (ka > 0.01) {
      misturar(m.cena.background, CHUVA, ka * 0.7);
      m.cena.fog.color.copy(m.cena.background);
      m.cena.fog.near += (15 - m.cena.fog.near) * ka;
      m.cena.fog.far += (75 - m.cena.fog.far) * ka;
      m.sol.intensity *= 1 - 0.35 * ka;
    }
    // a tempestade de Khamsin (Deserto): o céu fica ocre e a névoa fecha
    const k = m.deserto?.forcaKhamsin || 0;
    if (k > 0.01) {
      tmp.copy(KHAMSIN).lerp(KHAMSIN_NOITE, f);
      misturar(m.cena.background, tmp, k * 0.9);
      m.cena.fog.color.copy(m.cena.background);
      m.cena.fog.near += (6 - m.cena.fog.near) * k;
      m.cena.fog.far += (42 - m.cena.fog.far) * k;
    }
  }
}
