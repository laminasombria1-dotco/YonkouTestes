// =============================================================
// SENTINELA DE GEADA NA BATALHA: os efeitos dos golpes (etapa 5.4)
// Os números dos golpes ficam em dados.js (laminasGeada, estilhacosGeada, anelGeada).
// Os efeitos são os da Arena (js/arena/efeitos.js, em this.b.fx):
//  - Lâminas Cravadas: espinhos de gelo saem do chão na frente dela, com lascas brancas
//  - Estilhaços: lascas de gelo saem das lâminas a cada disparo
//  - Anel de Gelo: anéis de gelo abrem em volta, espinhos de gelo no chão e lascas voando
// Seguem a Qualidade do menu (o fx já corta partículas e lascas no Fraco).
// =============================================================
const GELO = 0x9fdcff, CLARO = 0xdff4ff;

export class HabilidadesGeada {
  constructor(batalha) {
    this.b = batalha;
  }
  dele(c) { return c.dados.especie === 'geada'; }
  frente(c, d) { return [c.pos.x + Math.sin(c.ang) * d, c.pos.z + Math.cos(c.ang) * d]; }

  atualizar() {}

  aoPerto(c) {
    const [x, z] = this.frente(c, c.raio + 1.5);
    this.b.fx.espinhos(x, z, 1.8, 7, GELO, 1.2);
    this.b.fx.estilhacos(x, 0.4, z, 10, CLARO);
    this.b.fx.onda(x, z, 2.6, CLARO, 0.4);
  }

  aoDisparar(c) {
    const [x, z] = this.frente(c, c.raio);
    this.b.fx.estilhacos(x, c.altura * 0.55, z, 8, CLARO);
    this.b.fx.clarao(x, c.altura * 0.55, z, GELO, 0.4, 0.2);
  }

  aoUsarArea(c, gp) {
    this.b.fx.aneis(c.pos.x, 0.15, c.pos.z, gp.raio, GELO, 0.9);
    this.b.fx.onda(c.pos.x, c.pos.z, gp.raio, CLARO, 0.55);
    this.b.fx.espinhos(c.pos.x, c.pos.z, gp.raio * 0.8, 14, GELO, 1.4);
    this.b.fx.estilhacos(c.pos.x, 1, c.pos.z, 18, CLARO);
    this.b.fx.particulas({ x: c.pos.x, y: 0.6, z: c.pos.z, n: 30, raio: gp.raio * 0.7, cor: 0xffffff, vel: 2.5, cima: 1, grav: 0.5, vida: 1, tam: 0.3 });
  }
}
