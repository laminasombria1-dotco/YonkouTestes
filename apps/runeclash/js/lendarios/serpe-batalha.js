// =============================================================
// SERPE DA TORMENTA NA BATALHA: os efeitos dos golpes (etapa 5.4)
// Os números dos golpes ficam em dados.js (mordidaTormenta, raiosTormenta, tempestadeSerpe).
// Os efeitos são os da Arena (js/arena/efeitos.js, em this.b.fx), como na luta contra ela lá:
//  - o corpo solta faíscas: de vez em quando um raiozinho estala em volta dela
//  - Mordida da Tormenta: um clarão azul e um raio na boca quando ela dá o bote
//  - Raios da Tormenta (disparo): cada tiro sai com um relâmpago da boca
//  - Tempestade (área): raios caem do céu em volta dela e o chão racha onde caem
// Seguem a Qualidade do menu (o fx já corta partículas e galhos no Fraco).
// =============================================================
const AZUL = 0x9fe8ff, CLARO = 0xbff0ff, MIOLO = 0xe8fbff;

export class HabilidadesSerpe {
  constructor(batalha) {
    this.b = batalha;
  }
  dele(c) { return c.dados.especie === 'serpe'; }

  // altura da boca (o modelo cresce com o "tamanho" da espécie)
  boca(c) {
    const d = Math.sin(c.ang), e = Math.cos(c.ang), fr = c.raio * 1.6;
    return [c.pos.x + d * fr, c.altura * 0.85, c.pos.z + e * fr];
  }

  // faíscas no corpo, o tempo todo
  atualizar(dt) {
    for (const c of [this.b.jog, ...this.b.inimigos]) {
      if (!c || c.morto || !this.dele(c)) continue;
      c.faiscaT = (c.faiscaT ?? 0.4) - dt;
      if (c.faiscaT > 0) continue;
      c.faiscaT = 0.25 + Math.random() * 0.5;
      const r = c.raio * 1.4, y = c.altura * 0.55;
      this.b.fx.relampago([c.pos.x + (Math.random() - 0.5) * r * 2, y + 1.2, c.pos.z + (Math.random() - 0.5) * r * 2], [c.pos.x, y - 0.6, c.pos.z], CLARO, 0.15, { galhos: 0, larg: 0.08 });
    }
  }

  aoPerto(c) {
    const [x, y, z] = this.boca(c);
    this.b.fx.clarao(x, y, z, AZUL, 0.7, 0.3);
    this.b.fx.relampago([x, y + 1.5, z], [x, y - 0.5, z], CLARO, 0.22, { galhos: 1, larg: 0.12 });
    this.b.fx.particulas({ x, y, z, n: 14, cor: MIOLO, vel: 5, vida: 0.4, tam: 0.18 });
  }

  aoDisparar(c, dir) {
    const [x, y, z] = this.boca(c);
    this.b.fx.relampago([x, y, z], [x + dir.x * 5, y - 0.4, z + dir.z * 5], CLARO, 0.18, { galhos: 1, larg: 0.12 });
    this.b.fx.clarao(x, y, z, AZUL, 0.5, 0.2);
  }

  aoUsarArea(c, gp) {
    const n = 7 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, d = 1.5 + Math.random() * (gp.raio - 1.5);
      const x = c.pos.x + Math.cos(a) * d, z = c.pos.z + Math.sin(a) * d;
      this.b.fx.relampago([x + (Math.random() - 0.5) * 2, 16, z + (Math.random() - 0.5) * 2], [x, 0.05, z], CLARO, 0.35, { galhos: 2, larg: 0.22 });
      this.b.fx.rachadura(x, z, 1.1, AZUL, 1.4);
    }
    this.b.fx.clarao(c.pos.x, c.altura * 0.6, c.pos.z, AZUL, 1, 0.35);
    this.b.fx.onda(c.pos.x, c.pos.z, gp.raio, AZUL, 0.5);
  }
}
