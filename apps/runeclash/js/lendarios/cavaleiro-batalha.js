// =============================================================
// CAVALEIRO OCO NA BATALHA: os efeitos dos golpes (etapa 5.4)
// Os números dos golpes ficam em dados.js (sequenciaOca, estocadaSombria, laminasCruzadas).
// Os efeitos são os da Arena (js/arena/efeitos.js, em this.b.fx), todos roxos:
//  - Sequência Oca: um arco de corte na frente dele
//  - Estocada Sombria: clarão e faíscas na ponta da espada
//  - Lâminas Cruzadas: um anel roxo se abre em volta e faíscas giram com ele
// Seguem a Qualidade do menu (o fx já corta partículas no Fraco).
// =============================================================
const ROXO = 0xc86bff, CLARO = 0xe9cfff;

export class HabilidadesCavaleiro {
  constructor(batalha) {
    this.b = batalha;
  }
  dele(c) { return c.dados.especie === 'cavaleiro'; }
  frente(c, d) { return [c.pos.x + Math.sin(c.ang) * d, c.pos.z + Math.cos(c.ang) * d]; }

  atualizar() {}

  aoPerto(c) {
    const [x, z] = this.frente(c, c.raio + 1.2);
    this.b.fx.onda(x, z, 2.4, ROXO, 0.3);
    this.b.fx.clarao(x, c.altura * 0.45, z, ROXO, 0.5, 0.2);
    this.b.fx.particulas({ x, y: c.altura * 0.45, z, n: 8, cor: CLARO, vel: 3, vida: 0.35, tam: 0.14 });
  }

  aoDisparar(c) {
    const [x, z] = this.frente(c, c.raio + 0.8);
    this.b.fx.clarao(x, c.altura * 0.5, z, ROXO, 0.6, 0.25);
    this.b.fx.particulas({ x, y: c.altura * 0.5, z, n: 10, cor: CLARO, vel: 4, vida: 0.4, tam: 0.14 });
  }

  aoUsarArea(c, gp) {
    this.b.fx.onda(c.pos.x, c.pos.z, gp.raio, ROXO, 0.5);
    this.b.fx.aneis(c.pos.x, 0.15, c.pos.z, gp.raio, ROXO, 0.7);
    this.b.fx.particulas({ x: c.pos.x, y: c.altura * 0.4, z: c.pos.z, n: 24, raio: gp.raio * 0.6, cor: CLARO, vel: 2.5, cima: 0.6, grav: 0.5, vida: 0.8, tam: 0.2 });
  }
}
