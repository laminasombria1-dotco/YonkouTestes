// =============================================================
// CLIMA DOS BIOMAS: a cor do céu, da névoa e da luz muda aos poucos com o bioma
// (pelos guias do Lâmina). Chamado no fim do atualizarCeu (mundo.js), depois
// do dia e da noite. Perto das bordas, a mistura segue o peso de cada bioma.
//  - Gelo: o chão "rebate" azul nas sombras.
//  - Floresta: névoa verde-azulada (o crepúsculo de mel e esmeralda) e sol dourado.
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
  terra: { nevoaDia: C('#f0d9a8'), nevoaNoite: C('#1a1830'), forcaDia: 0.8, forcaNoite: 0.4, ceu: C('#ffe6c0'), chao: C('#e09a60'), sol: C('#ffe0a8'), brilho: 1.85 },
};
const CHAO_PADRAO = C('#5d7a3e'), KHAMSIN = C('#c8904a'), KHAMSIN_NOITE = C('#3a2a1e'), tmp = new THREE.Color();

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
        m.cena.background.lerp(tmp, k);
        m.cena.fog.color.lerp(tmp, k);
      }
      const dia = w * (1 - f);
      if (t.sol && dia > 0) m.sol.color.lerp(t.sol, dia);
      if (t.ceu && dia > 0) m.hemi.color.lerp(t.ceu, dia);
      if (t.brilho && dia > 0) m.hemi.intensity += (t.brilho - m.hemi.intensity) * dia;
    }
    // a tempestade de Khamsin (Deserto): o céu fica ocre e a névoa fecha
    const k = m.deserto?.forcaKhamsin || 0;
    if (k > 0.01) {
      tmp.copy(KHAMSIN).lerp(KHAMSIN_NOITE, f);
      m.cena.background.lerp(tmp, k * 0.9);
      m.cena.fog.color.lerp(tmp, k * 0.9);
      m.cena.fog.near += (6 - m.cena.fog.near) * k;
      m.cena.fog.far += (42 - m.cena.fog.far) * k;
    }
  }
}
