// Invocar com runas (ideia 2.2): o monstro sobe de um círculo de runas.
// Usado na batalha (quando o seu monstro entra e quando você troca) e no mapa (quando o
// companheiro é invocado para passear). Ao guardar, o monstro vira luz e volta para a pedra.
//
// Uso:
//   const s = new Surgimentos(fx);           // fx = new Efeitos(cena, ...) (js/arena/efeitos.js)
//   s.surgir(modelo, { x, z, chao, raio, altura, escala, cor });
//   ...e a cada quadro, DEPOIS de o jogo pôr o modelo no lugar: s.atualizar(dt)
//   (o surgimento só mexe na altura e no tamanho do modelo por cima do que o jogo já pôs)
import * as THREE from 'three';

export const COR_RUNA = 0xb98cff; // o roxo-runa do Runeclash
const T_SUBIR = 0.7;

// Sombra escura embaixo de um círculo de runas: o brilho roxo some na grama clara do dia sem ela
const GEO_SOMBRA = new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2);
GEO_SOMBRA.userData.fixa = true; // os efeitos não apagam esta forma (ela é de todas as sombras)
export function sombraRuna(fx, x, z, r, vida, id) {
  const m = new THREE.Mesh(GEO_SOMBRA, new THREE.MeshBasicMaterial({ color: 0x120a22, transparent: true, opacity: 0, depthWrite: false }));
  m.position.set(x, fx.chao(x, z) + 0.06, z);
  m.scale.setScalar(r * 0.92);
  m.renderOrder = -1;
  fx._temp(m, vida, (q, k) => {
    const t = k * q.max, entra = Math.min(1, t / 0.25), sai = Math.min(1, (q.max - t) / 0.3);
    m.material.opacity = 0.42 * entra * sai;
  }, { id });
}

const suave = (t) => t * t * (3 - 2 * t);

export class Surgimentos {
  constructor(fx) {
    this.fx = fx;
    this.lista = [];
  }

  // o = { x, z, chao (altura do chão ali), raio, altura (do monstro), cor (do elemento), escala (se não vier, usa o tamanho atual do modelo) }
  surgir(modelo, o) {
    const fx = this.fx, r = Math.max(0.8, o.raio || 1), y = o.chao || 0, cor = new THREE.Color(o.cor ?? COR_RUNA).getHex();
    const velho = this.lista.find((s) => s.modelo === modelo);
    const escala = o.escala ?? (velho ? velho.escala : modelo.scale.x); // o tamanho normal do modelo
    this.lista = this.lista.filter((s) => s.modelo !== modelo);
    this.lista.push({ modelo, t: 0, altura: o.altura || 1, escala });
    sombraRuna(fx, o.x, o.z, r * 2.2, 1.4);
    fx.runa(o.x, o.z, r * 2.2, COR_RUNA, 1.4, { estilo: 0, giro: 1.6, cresce: 0.25 });
    fx.runa(o.x, o.z, r * 1.3, cor, 1.1, { estilo: 2, giro: -3, cresce: 0.15, y: 0.02 });
    fx.coluna(o.x, o.z, r * 0.9, cor, 3 + (o.altura || 1) * 1.5, 0.55);
    fx.onda(o.x, o.z, r * 2.8, COR_RUNA, 0.5);
    fx.particulas({ x: o.x, y: y + 0.2, z: o.z, n: 36, raio: r, cor, vel: 1.5, cima: 4, grav: -1, vida: 0.9, tam: 0.2 });
    modelo.scale.setScalar(0.3 * escala);
  }

  // o monstro vira luz e volta para a pedra (de = [x,y,z] do monstro, para = [x,y,z] da pedra, ou null)
  guardar(de, para, cor) {
    const fx = this.fx, c = new THREE.Color(cor ?? COR_RUNA).getHex();
    sombraRuna(fx, de[0], de[2], 1.6, 0.8);
    fx.runa(de[0], de[2], 1.6, COR_RUNA, 0.8, { estilo: 1, giro: -2.5, cresce: 0.15 });
    fx.implosao(de[0], de[1], de[2], 1.6, 0xe0d0ff, 40, 0.35);
    fx.particulas({ x: de[0], y: de[1], z: de[2], n: 24, raio: 0.6, cor: c, vel: 2.5, cima: 2, vida: 0.5, tam: 0.18 });
    if (para) fx.voo(de, para, c, 0.6, { alto: 1.5 });
  }

  // está subindo agora?
  subindo(modelo) { return this.lista.some((s) => s.modelo === modelo); }

  atualizar(dt) {
    for (let i = this.lista.length - 1; i >= 0; i--) {
      const s = this.lista[i];
      s.t += dt;
      const k = Math.min(1, s.t / T_SUBIR), e = suave(k);
      s.modelo.position.y -= (1 - e) * s.altura * 1.1; // sobe de dentro do chão
      s.modelo.scale.setScalar(s.escala * (0.3 + 0.7 * e));
      s.modelo.rotation.y += (1 - e) * Math.PI * 1.5; // gira um pouco enquanto sobe
      if (k >= 1) { s.modelo.scale.setScalar(s.escala); this.lista.splice(i, 1); }
    }
  }
}
