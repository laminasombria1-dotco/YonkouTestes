// =============================================================
// PEÇAS E FERRAMENTAS COMUNS DAS MELHORIAS DOS BIOMAS
//  - UNI: as formas básicas (tamanho 1), reaproveitadas por todos os biomas
//    (e pelos chunks: mapa/chunks.js usa as mesmas formas).
//  - Forno: junta muitas peças numa malha só por material (cor nos vértices):
//    poucos desenhos por quadro, como o Bloco das masmorras.
//  - Brilho falso: pontos com uma textura redonda e macia (sem luz de verdade).
// Os tipos de material (a letra usada nas peças):
//   n = normal · b = brilho total (janela, lanterna) · a = âmbar (meio transparente)
//   c = ciano que brilha (cogumelos) · o = ouro · l = lápis-lazúli · t = turquesa · f = fogo/lava
//   e = enxofre · v = chama do ácido (soma luz) · g = obsidiana
// =============================================================
import * as THREE from 'three';

export const UNI = {
  caixa: new THREE.BoxGeometry(1, 1, 1),
  cil: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
  cilF: new THREE.CylinderGeometry(0.32, 0.5, 1, 7),       // tronco que afina para cima
  cil6: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  cone: new THREE.ConeGeometry(0.5, 1, 6),
  cone4: new THREE.ConeGeometry(0.5, 1, 4),
  pir: new THREE.ConeGeometry(0.5, 1, 4).rotateY(Math.PI / 4), // pirâmide (lados alinhados)
  ico: new THREE.IcosahedronGeometry(0.5, 0),
  esf: new THREE.IcosahedronGeometry(0.5, 1),
  dode: new THREE.DodecahedronGeometry(0.5, 0),
  meia: new THREE.SphereGeometry(0.5, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), // chapéu de cogumelo
  arco: new THREE.TorusGeometry(1, 0.13, 5, 12, Math.PI),                    // raiz em arco, costela
  prisma: new THREE.CylinderGeometry(1, 1, 1, 3),
  pinho: new THREE.ConeGeometry(1, 1, 6),
  tronco: new THREE.CylinderGeometry(0.2, 0.28, 1, 5),
  capitel: new THREE.CylinderGeometry(0.95, 0.45, 1, 10),                    // capitel de papiro (abre para cima)
  torre: new THREE.CylinderGeometry(0.62, 0.88, 1, 4).rotateY(Math.PI / 4),  // torre que afina (pilone do templo)
  obel: new THREE.CylinderGeometry(0.34, 0.5, 1, 4).rotateY(Math.PI / 4),    // obelisco
  hex: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),                            // coluna de basalto
  octa: new THREE.OctahedronGeometry(0.5, 0),                                 // cristal (obsidiana, enxofre)
  toro: new THREE.TorusGeometry(1, 0.12, 4, 14),                              // anel (de lava)
  elo: new THREE.TorusGeometry(0.5, 0.12, 4, 8),                              // elo de corrente
  disco: new THREE.CylinderGeometry(1, 1, 0.1, 14),
  dente: new THREE.CylinderGeometry(1, 1, 0.3, 12),                           // engrenagem
  // a vela do barco: um triângulo dos dois lados
  vela: (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0, 0.7, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 1, 0], 3)); return g; })(),
};

const lambert = (o) => new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, ...o });

// ---------- material que fica transparente quando tampa a câmera ----------
// Cada peça guarda o "centro" dela (o pé da árvore) num atributo. A placa de vídeo vê, para cada
// ponto, se esse centro está entre a câmera e o jogador e, se estiver, deixa a peça transparente.
// Assim cada coqueiro desbota sozinho, mesmo juntado com os outros numa malha só (sem custo extra).
// As posições da câmera e do jogador são atualizadas a cada quadro (atualizarDesbota).
export const UNIF_DESBOTA = { uCam: { value: new THREE.Vector3(0, 1e5, 0) }, uJog: { value: new THREE.Vector3(0, 1e5, 0) } };
export function materialDesbota(base, raio = 3.2) {
  const m = base.clone();
  m.transparent = true;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uCam = UNIF_DESBOTA.uCam; sh.uniforms.uJog = UNIF_DESBOTA.uJog;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
attribute vec3 centro;
uniform vec3 uCam; uniform vec3 uJog;
varying float vFade;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
{ vec2 c = centro.xz, a = uCam.xz, d = uJog.xz - uCam.xz;
  float t = dot(c - a, d) / max(dot(d, d), 0.0001);
  float dist = length(c - (a + d * clamp(t, 0.0, 1.0)));
  vFade = (t > 0.0 && t < 0.97) ? mix(0.22, 1.0, smoothstep(${(raio * 0.55).toFixed(2)}, ${raio.toFixed(2)}, dist)) : 1.0; }`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vFade;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vFade;');
  };
  m.customProgramCacheKey = () => 'desbota' + raio;
  m.userData.fixo = true;
  return m;
}
// ---------- parede que abre um "furo" quando fica entre a câmera e o jogador ----------
// Para peças grandes (muralhas, castelo, casas), onde o centro da peça não serve: a placa de vídeo
// vê, para cada ponto da parede, se ele está perto da linha câmera → jogador. Se estiver, fica
// quase transparente (25% visível, pedido do Lâmina): dá para ver o boneco através. O chão nunca muda
// (só o que está acima dos pés do jogador) e nem o que está colado nele.
export function materialFuro(m, raio = 3.4) {
  if (m.transparent || m.userData.semFuro) return m; // o que já é transparente (água, brilhos) fica como está
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uCam = UNIF_DESBOTA.uCam; sh.uniforms.uJog = UNIF_DESBOTA.uJog;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMundo;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
vMundo = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
#else
vMundo = (modelMatrix * vec4(transformed, 1.0)).xyz;
#endif`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
uniform vec3 uCam; uniform vec3 uJog; varying vec3 vMundo; float vTransp = 0.0;`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
{ vec3 a = uCam, d = uJog + vec3(0.0, 1.0, 0.0) - uCam;
  float t = dot(vMundo - a, d) / max(dot(d, d), 0.0001);
  if (t > 0.0 && t < 0.93 && vMundo.y > uJog.y + 0.35) {
    float r = ${raio.toFixed(2)} * (0.6 + 0.4 * t); // perto da câmera a área é um pouco menor
    vTransp = 1.0 - smoothstep(r * 0.6, r, length(vMundo - (a + d * t))); // 1 = bem na frente do jogador
  } }`)
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= 1.0 - 0.75 * vTransp; // fica 25% visível: dá para ver o boneco através');
  };
  m.transparent = true; // a parede na frente fica meio transparente (como os coqueiros)
  m.customProgramCacheKey = () => 'furo' + raio + m.type + (m.side || 0);
  return m;
}
export function atualizarDesbota(camera, pos) { UNIF_DESBOTA.uCam.value.copy(camera.position); UNIF_DESBOTA.uJog.value.set(pos.x, pos.y, pos.z); }
export const MAT_FORNO = {
  n: lambert({}),
  b: new THREE.MeshBasicMaterial({ vertexColors: true }),
  // (a cor de base vem do material; as peças desses tipos usam cor branca nos vértices)
  a: lambert({ color: '#e8a838', emissive: '#d99b26', emissiveIntensity: 0.55, transparent: true, opacity: 0.78 }),
  c: lambert({ color: '#9ff0e0', emissive: '#45c4b0', emissiveIntensity: 0.8 }),
  o: lambert({ color: '#f2c040', emissive: '#f2a922', emissiveIntensity: 0.55 }),
  l: lambert({ color: '#2f6fa8', emissive: '#215e8c', emissiveIntensity: 0.45 }),
  t: lambert({ color: '#5fd8c8', emissive: '#3ab5a8', emissiveIntensity: 0.8 }),
  f: lambert({ color: '#ffb040', emissive: '#ff6a10', emissiveIntensity: 1 }),
  e: lambert({ color: '#f2d84a', emissive: '#c8a810', emissiveIntensity: 0.35 }),                          // enxofre
  v: new THREE.MeshBasicMaterial({ color: '#2cf2c4', transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }), // chama de ácido
  g: lambert({ color: '#1c191d', emissive: '#3a1a10', emissiveIntensity: 0.2 }),                          // obsidiana
};
MAT_FORNO.p = materialDesbota(MAT_FORNO.n); // p = peça que desbota na frente da câmera (coqueiros)
// as outras peças dos biomas ficam meio transparentes quando tampam o jogador
for (const [k, m] of Object.entries(MAT_FORNO)) if (k !== 'p') materialFuro(m);
for (const m of Object.values(MAT_FORNO)) m.userData.fixo = true;

const SEM_INDICE = new Map();
export const semIndice = (g) => { if (!SEM_INDICE.has(g)) SEM_INDICE.set(g, g.index ? g.toNonIndexed() : g); return SEM_INDICE.get(g); };

// Junta peças numa malha só por material. As rotações usam a ordem YXZ: a peça
// inclina (rx, rz) e depois gira em volta do eixo de pé (ry).
export class Forno {
  constructor() { this.l = {}; this.centro = null; } // centro = [x, z] da peça que desbota (tipo p)
  // (cx, cz no fim: o centro da peça que desbota, quando a própria peça diz; senão vale this.centro)
  add(g, tipo, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0, cor = '#ffffff', _d, cx, cz) { (this.l[tipo] ||= []).push([g, x, y, z, sx, sy, sz, rx, ry, rz, cor, cx != null ? [cx, cz] : this.centro]); }
  get vazio() { return !Object.keys(this.l).length; }
  // clonar = true: cada material é copiado (para a peça poder ficar transparente sozinha)
  montar(pai, clonar = false) {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(0, 0, 0, 'YXZ'), v = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color(), p = new THREE.Vector3();
    const malhas = [], mats = [];
    for (const [tipo, lista] of Object.entries(this.l)) {
      let total = 0;
      for (const it of lista) total += semIndice(UNI[it[0]]).attributes.position.count;
      const pos = new Float32Array(total * 3), cor = new Float32Array(total * 3), cen = tipo === 'p' ? new Float32Array(total * 3) : null;
      let o = 0;
      for (const [g, x, y, z, sx, sy, sz, rx, ry, rz, hex, ce] of lista) {
        m4.compose(v.set(x, y, z), q.setFromEuler(e.set(rx, ry, rz, 'YXZ')), s.set(sx, sy, sz));
        const a = semIndice(UNI[g]).attributes.position;
        c.set(hex);
        for (let k = 0; k < a.count; k++, o++) {
          p.fromBufferAttribute(a, k).applyMatrix4(m4);
          pos[o * 3] = p.x; pos[o * 3 + 1] = p.y; pos[o * 3 + 2] = p.z;
          cor[o * 3] = c.r; cor[o * 3 + 1] = c.g; cor[o * 3 + 2] = c.b;
          if (cen) { cen[o * 3] = ce ? ce[0] : 1e5; cen[o * 3 + 2] = ce ? ce[1] : 1e5; }
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(cor, 3));
      if (cen) geo.setAttribute('centro', new THREE.BufferAttribute(cen, 3));
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      let mat = MAT_FORNO[tipo];
      if (clonar) { mat = mat.clone(); mat.transparent = true; mat.userData.op0 = mat.opacity; mats.push(mat); }
      const malha = new THREE.Mesh(geo, mat);
      malha.matrixAutoUpdate = false;
      pai.add(malha);
      malhas.push(malha);
    }
    return { malhas, mats };
  }
}

// Uma peça grande que fica transparente quando tampa a câmera (árvores gigantes).
// Devolve { grupo, mats, op, x, z, alcance } no formato do desbotar() do dungeon.js.
export function pecaDesbotavel(cena, fn, x, z, alcance) {
  const f = new Forno(); fn(f.add.bind(f));
  const grupo = new THREE.Group();
  const { mats } = f.montar(grupo, true);
  cena.add(grupo);
  return { grupo, mats, op: 1, x, z, alcance };
}
// Fica transparente aos poucos (alvo 1 = normal; ~0.2 = quase invisível). Respeita o âmbar (já meio transparente).
export function desbotarPeca(b, alvo, dt) {
  if (Math.abs(alvo - b.op) < 0.01) return;
  b.op += (alvo - b.op) * Math.min(1, dt * 6);
  for (const m of b.mats) { m.opacity = m.userData.op0 * b.op; m.depthWrite = b.op > 0.9 && m.userData.op0 >= 1; }
}
// A peça está entre a câmera e o jogador? (a câmera fica atrás e acima, olhando para ele)
export function tampaCamera(b, camera, px, pz) {
  const cx = camera.position.x, cz = camera.position.z, dx = px - cx, dz = pz - cz, L = Math.hypot(dx, dz) || 1;
  const t = ((b.x - cx) * dx + (b.z - cz) * dz) / (L * L);
  if (t < -0.2 || t > 1.15) return false;
  const lado = Math.abs((b.x - cx) * dz - (b.z - cz) * dx) / L;
  return lado < b.alcance;
}

// Textura redonda e macia do brilho falso (feita uma vez)
let TEX = null;
export function texturaBrilho() {
  if (TEX) return TEX;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  TEX = new THREE.CanvasTexture(cv);
  return TEX;
}
// Pontos com a textura redonda. cores = lista de cores (uma por ponto) ou null (todos com a cor do material).
export function pontos(lista, cor, tam, opacidade, aditivo, cores = null) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(lista, 3));
  if (cores) g.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
  const m = new THREE.PointsMaterial({ color: cor, size: tam, map: texturaBrilho(), transparent: true, opacity: opacidade, depthWrite: false, vertexColors: !!cores, blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending });
  m.userData.fixo = true;
  return new THREE.Points(g, m);
}
// Junta listas de pontos de cores diferentes (num desenho só)
export function juntar(...grupos) {
  const pos = [], cor = [], c = new THREE.Color();
  for (const [lista, hex] of grupos) { c.set(hex); for (let i = 0; i < lista.length; i += 3) { pos.push(lista[i], lista[i + 1], lista[i + 2]); cor.push(c.r, c.g, c.b); } }
  return [pos, cor];
}
// Poças de luz no chão (planos com a textura redonda, InstancedMesh: 1 desenho). lista = [[x, y, z, tamanho], ...]
export function pocasDeLuz(lista, cor, opacidade) {
  const geo = new THREE.PlaneGeometry(1, 1); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: cor, map: texturaBrilho(), transparent: true, opacity: opacidade, depthWrite: false, blending: THREE.AdditiveBlending });
  mat.userData.fixo = true;
  const im = new THREE.InstancedMesh(geo, mat, Math.max(1, lista.length)), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  lista.forEach(([x, y, z, s], i) => im.setMatrixAt(i, m4.compose(new THREE.Vector3(x, y + 0.06, z), q, new THREE.Vector3(s, 1, s))));
  im.count = lista.length;
  return im;
}
// Um "rng" simples e com semente (sempre o mesmo resultado)
export function rngDe(semente) { let s = Math.max(1, Math.floor(semente) % 2147483647); return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
