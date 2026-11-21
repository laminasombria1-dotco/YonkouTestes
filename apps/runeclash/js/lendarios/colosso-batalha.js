// =============================================================
// COLOSSO DE BASALTO NA BATALHA: os efeitos dos golpes (etapa 5.4)
// Os números dos golpes ficam em dados.js (esmagarColosso, arremessoColosso, terremotoColosso).
// Os efeitos são os da Arena (js/arena/efeitos.js, em this.b.fx):
//  - o núcleo solta brasas de vez em quando
//  - Esmagar: o chão racha na frente dele, com lascas de pedra e a tela tremendo
//  - Arremesso: lascas saem da mão quando ele arranca a pedra
//  - Terremoto: o chão racha em volta, onda de poeira, lascas voando e a tela treme forte
// Seguem a Qualidade do menu (o fx já corta partículas e lascas no Fraco).
// =============================================================
const MAGMA = 0xff8a2b, PEDRA = 0x5d5a66, POEIRA = 0xc8a878;

export class HabilidadesColosso {
  constructor(batalha) {
    this.b = batalha;
  }
  dele(c) { return c.dados.especie === 'colosso'; }

  // a tela treme (usa a mesma tremida do Tremor da linha do Pedrisco)
  tremer(f) { const p = this.b.pedrisco; p.tremerT = Math.max(p.tremerT || 0, f); }

  frente(c, d) { return [c.pos.x + Math.sin(c.ang) * d, c.pos.z + Math.cos(c.ang) * d]; }

  atualizar(dt) {
    for (const c of [this.b.jog, ...this.b.inimigos]) {
      if (!c || c.morto || !this.dele(c)) continue;
      c.brasaT = (c.brasaT ?? 0.5) - dt;
      if (c.brasaT > 0) continue;
      c.brasaT = 0.35 + Math.random() * 0.5;
      const [x, z] = this.frente(c, c.raio * 0.5);
      this.b.fx.particulas({ x, y: c.altura * 0.6, z, n: 3, cor: MAGMA, vel: 1.2, cima: 1.5, grav: -1, vida: 0.8, tam: 0.16 });
    }
  }

  aoPerto(c) {
    const [x, z] = this.frente(c, c.raio + 1.6);
    this.b.fx.rachadura(x, z, 2.2, MAGMA, 1.8);
    this.b.fx.estilhacos(x, 0.3, z, 12, PEDRA, { solido: true });
    this.b.fx.onda(x, z, 3, POEIRA, 0.4);
    this.tremer(0.35);
  }

  aoDisparar(c) {
    const [x, z] = this.frente(c, c.raio);
    this.b.fx.estilhacos(x, c.altura * 0.5, z, 8, PEDRA, { solido: true });
  }

  aoUsarArea(c, gp) {
    this.b.fx.rachadura(c.pos.x, c.pos.z, gp.raio, MAGMA, 2.2);
    this.b.fx.onda(c.pos.x, c.pos.z, gp.raio, POEIRA, 0.6);
    this.b.fx.estilhacos(c.pos.x, 0.4, c.pos.z, 22, PEDRA, { solido: true });
    this.b.fx.particulas({ x: c.pos.x, y: 0.4, z: c.pos.z, n: 30, raio: gp.raio * 0.8, cor: POEIRA, vel: 3, cima: 2, vida: 0.9, tam: 0.45 });
    this.tremer(0.8);
  }
}
