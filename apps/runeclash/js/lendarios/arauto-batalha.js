// =============================================================
// ARAUTO DAS CINZAS NA BATALHA: os efeitos dos golpes (etapa 5.4)
// Os números dos golpes ficam em dados.js (maoCinzas, brasasVivas, chuvaCinzas).
// Os efeitos são os da Arena (js/arena/efeitos.js, em this.b.fx):
//  - cinzas sobem dele o tempo todo
//  - Mão de Cinzas: chamas na frente dele e um clarão laranja
//  - Brasas Vivas: cada disparo sai com um clarão e faíscas nas mãos
//  - Chuva de Cinzas: meteoros de brasa caem do céu em volta dele (com o lugar marcado no chão)
// Seguem a Qualidade do menu (o fx já corta partículas no Fraco).
// =============================================================
const FOGO = 0xff6a3a, BRASA = 0xffb030, CINZA = 0x5a5050;

export class HabilidadesArauto {
  constructor(batalha) {
    this.b = batalha;
  }
  dele(c) { return c.dados.especie === 'arauto'; }
  frente(c, d) { return [c.pos.x + Math.sin(c.ang) * d, c.pos.z + Math.cos(c.ang) * d]; }

  atualizar(dt) {
    for (const c of [this.b.jog, ...this.b.inimigos]) {
      if (!c || c.morto || !this.dele(c)) continue;
      c.cinzaT = (c.cinzaT ?? 0.3) - dt;
      if (c.cinzaT > 0) continue;
      c.cinzaT = 0.2 + Math.random() * 0.3;
      this.b.fx.particulas({ x: c.pos.x, y: c.altura * 0.5, z: c.pos.z, n: 3, raio: c.raio, cor: Math.random() < 0.5 ? CINZA : BRASA, vel: 0.6, cima: 1.4, grav: -0.5, vida: 1.1, tam: 0.18 });
    }
  }

  aoPerto(c) {
    const [x, z] = this.frente(c, c.raio + 1.4);
    this.b.fx.chamas(x, z, 1.6, FOGO, 0.7);
    this.b.fx.clarao(x, c.altura * 0.5, z, FOGO, 0.6, 0.25);
  }

  aoDisparar(c) {
    const [x, z] = this.frente(c, c.raio + 0.6);
    this.b.fx.clarao(x, c.altura * 0.6, z, BRASA, 0.5, 0.2);
    this.b.fx.particulas({ x, y: c.altura * 0.6, z, n: 10, cor: BRASA, vel: 3, vida: 0.4, tam: 0.16 });
  }

  aoUsarArea(c, gp) {
    const n = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, d = 1.5 + Math.random() * (gp.raio - 1.5);
      this.b.fx.meteoro(c.pos.x + Math.cos(a) * d, c.pos.z + Math.sin(a) * d, FOGO, 0.5 + Math.random() * 0.4, 1);
    }
    this.b.fx.onda(c.pos.x, c.pos.z, gp.raio, FOGO, 0.5);
    this.b.fx.particulas({ x: c.pos.x, y: c.altura, z: c.pos.z, n: 20, raio: gp.raio * 0.6, cor: CINZA, vel: 1, cima: 0.5, grav: 1, vida: 1.2, tam: 0.3 });
  }
}
