// =============================================================
// MODELOS 3D FEITOS NO BLENDER (.glb)
// Hoje: as formas iniciais do Brasito (modelos/brasito.glb) e do Gotinho (modelos/gotinho.glb)
// e o Ardentroco (modelos/ardentroco.glb). As outras formas continuam com os modelos de formas
// simples de modelos.js.
//
// Como funciona:
//  - carregarModelos3D() baixa os .glb uma vez, quando o jogo abre (main.js espera,
//    com limite de tempo; se não der, o jogo usa o modelo de formas simples).
//  - Cada monstro na tela é uma CÓPIA (com ossos próprios) e tem o seu próprio
//    AnimationMixer, que toca as animações do arquivo.
//  - animarGLB() é chamado por animarModelo() a cada quadro: escolhe parado,
//    arrancada -> correndo, ou o golpe que estiver tocando, e faz o fogo pulsar.
//  - A batalha avisa quando um golpe começa (tocarGolpe) e quando o giro do
//    Rabo de Fogo começa (ajustarGiro), para a animação bater com o golpe.
//  - Quem tem as animações de levar dano e desmaiar (o Gotinho) também recebe
//    tocarReacao(modelo, 'dano' | 'desmaiar') da batalha.
// =============================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as clonarComOssos } from 'three/addons/utils/SkeletonUtils.js';

// Cada modelo: arquivo, altura do modelo no arquivo (m) e as animações de cada estado.
// marco = o momento (s) da animação em que o golpe "sai" (bote, jato, começo do giro):
// a animação começa adiantada para esse momento cair junto com o golpe do jogo.
const ARQUIVOS = {
  brasito: {
    arquivo: 'modelos/brasito.glb',
    clips: {
      parado: 'Brasito_Parado',
      arrancada: 'Brasito_Arrancada',
      correndo: 'Brasito_Correndo',
      corpo: 'Brasito_Investida',
      projetil: 'Brasito_LancaChamas',
      area: 'Brasito_RaboDeFogo',
    },
    marco: { corpo: 0.22, projetil: 0.35, area: 0.12 },
    giro: { inicio: 0.12, fim: 0.71 },      // parte do Rabo de Fogo em que ele dá a volta
    semAvanco: ['Brasito_Investida'],        // o jogo já move o monstro: tira o avanço do osso root
    velArrancada: 1,                         // 1 = velocidade do arquivo (2,5 s). 2 = metade do tempo
    fogo: true,                              // o brilho das partes de fogo pulsa
  },
  // Gotinho (gota de água): o modelo do Lâmina, 0,9 m no arquivo, 8 animações
  gotinho: {
    arquivo: 'modelos/gotinho.glb',
    clips: {
      parado: 'Parado',
      arrancada: 'Andar',        // uns passinhos antes de correr
      correndo: 'Correr',
      corpo: 'GolpePerto',       // Investida
      projetil: 'GolpeDisparo',  // Jato d'Água / Hidrocanhão
      area: 'GolpeArea',         // Onda / Maremoto (pula e cai soltando a água)
      dano: 'LevarDano',
      desmaiar: 'Desmaiar',
    },
    marco: { corpo: 0.28, projetil: 0.40, area: 0.62 }, // bote, jato e a queda do pulo
    semAvanco: ['GolpePerto'],   // o bote anda 0,4 m no arquivo; o jogo já empurra o monstro
    velArrancada: 2.5,           // o Andar (1 s) vira 0,4 s de passinhos antes do Correr
    desmaioFim: 1.3,             // o Desmaiar volta a ficar de pé no fim: para deitado aqui (s)
    velDesmaio: 1.4,             // mais rápido: o monstro desmaiado some da arena em 1,3 s
  },
  // Ardentroco (3ª forma da linha do Brotobrasa): o modelo do Lâmina, 0,9 m no arquivo, 8 animações.
  // As frutas da cabeça são ossos (fruta.L e fruta.R): as animações já tiram e fazem nascer de novo.
  ardentroco: {
    arquivo: 'modelos/ardentroco.glb',
    clips: {
      parado: 'Parado',
      arrancada: 'Andar',
      correndo: 'Correr',
      corpo: 'GolpePerto',       // Fruta Ardente: pega a fruta da esquerda e come
      projetil: 'GolpeDisparo',  // Bombinhas de Fruta: arranca a fruta da direita e joga
      area: 'GolpeArea',         // Chuva de Frutas: gira balançando a cabeça
      dano: 'LevarDano',
      desmaiar: 'Desmaiar',
    },
    marco: { corpo: 0.6, projetil: 0.55, area: 0.3 }, // come a fruta, solta a fruta, começa o giro
    velArrancada: 2.5,
    desmaioFim: 1.3,
    velDesmaio: 1.4,
  },
};
const MISTURA = 0.18;          // segundos de transição entre uma animação e outra
const MISTURA_GOLPE = 0.08;

const carregados = {};         // especie -> { cena, clips, cfg }

export async function carregarModelos3D(limiteMs = 10000) {
  const loader = new GLTFLoader();
  const tarefas = Object.entries(ARQUIVOS).map(async ([especie, cfg]) => {
    const gltf = await loader.loadAsync(cfg.arquivo);
    const clips = {};
    for (const c of gltf.animations) clips[c.name] = c;
    for (const nome of cfg.semAvanco || []) if (clips[nome]) tirarAvanco(clips[nome]);
    gltf.scene.traverse((o) => {
      if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; }
    });
    carregados[especie] = { cena: gltf.scene, clips, cfg };
  });
  const limite = new Promise((ok) => setTimeout(ok, limiteMs));
  try { await Promise.race([Promise.allSettled(tarefas), limite]); } catch { /* segue com os modelos simples */ }
  return Object.keys(carregados);
}

// Investida: o osso "root" avança 0,8 m no arquivo, mas o jogo já empurra o monstro.
// Deixa só a subida e descida (y) e zera o avanço (x e z).
function tirarAvanco(clip) {
  for (const tr of clip.tracks) {
    if (!/^root\.position$/.test(tr.name)) continue;
    const v = tr.values;
    for (let i = 0; i < v.length; i += 3) { v[i] = v[0]; v[i + 2] = v[2]; }
  }
}

export function temGLB(especie) { return !!carregados[especie]; }

// Põe a cópia do .glb dentro do "corpo" do modelo, na altura do Brasito de formas simples
export function montarGLB(especie, raiz, alturaAlvo) {
  const c = carregados[especie];
  const copia = clonarComOssos(c.cena);
  const caixa = new THREE.Box3().setFromObject(c.cena);
  const altura = Math.max(0.01, caixa.max.y - caixa.min.y);
  copia.scale.setScalar(alturaAlvo / altura);
  // material próprio de cada cópia (as texturas continuam divididas): assim o piscar
  // e o fogo pulsando de um monstro não mexem nos outros
  const materiais = [];
  copia.traverse((o) => {
    if (!o.isMesh) return;
    o.material = o.material.clone();
    o.material.userData.glb = true;
    materiais.push(o.material);
  });
  const u = raiz.userData;
  u.corpo.add(copia);
  const mixer = new THREE.AnimationMixer(copia);
  const acoes = {};
  for (const [estado, nome] of Object.entries(c.cfg.clips)) {
    const clip = c.clips[nome];
    if (!clip) continue;
    const a = mixer.clipAction(clip);
    if (estado === 'parado' || estado === 'correndo') a.setLoop(THREE.LoopRepeat, Infinity);
    else { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
    acoes[estado] = a;
  }
  // estado = parado | arrancada | correndo (null durante um golpe); atual = a animação tocando agora
  u.glb = { especie, cfg: c.cfg, mixer, acoes, materiais, estado: null, golpe: null, atual: null, tAnt: null };
  mixer.addEventListener('finished', (e) => {
    const g = u.glb;
    if (e.action === g.acoes.arrancada && g.estado === 'arrancada') trocar(g, 'correndo');
    if (g.golpe && e.action === g.golpe) g.golpe = null; // o golpe acabou: volta para parado ou correndo
  });
  trocar(u.glb, 'parado', 0);
  return copia;
}

function trocar(g, estado, mistura = MISTURA) {
  if (g.estado === estado) return;
  const nova = g.acoes[estado];
  if (!nova) return;
  nova.reset();
  if (estado === 'arrancada') nova.timeScale = g.cfg.velArrancada || 1;
  tocar(g, nova, mistura);
  g.estado = estado;
}

// Começa uma animação misturando com a que estava tocando
function tocar(g, nova, mistura) {
  nova.enabled = true;
  nova.setEffectiveWeight(1);
  nova.play();
  if (g.atual && g.atual !== nova) nova.crossFadeFrom(g.atual, mistura, false);
  g.atual = nova;
}

// A cada quadro (chamado por animarModelo)
export function animarGLB(modelo, t, movendo) {
  const g = modelo.userData.glb;
  // o jogo passa o tempo total (t); o mixer precisa de quanto passou desde o último quadro
  const dt = g.tAnt == null ? 0 : Math.min(0.1, Math.max(0, t - g.tAnt));
  g.tAnt = t;
  // desmaiado: só deixa a animação de cair tocar, e para deitado
  if (g.desmaiado) {
    g.mixer.update(dt);
    const a = g.acoes.desmaiar;
    if (g.cfg.desmaioFim && a.time >= g.cfg.desmaioFim) a.paused = true;
    return;
  }
  // golpe esperando o momento certo de começar (o inimigo demora mais para soltar o golpe)
  if (g.pendente) {
    g.pendente.espera -= dt;
    if (g.pendente.espera <= 0) { const tipo = g.pendente.tipo; g.pendente = null; comecarGolpe(g, tipo, g.cfg.marco[tipo] || 0); }
  }
  if (!g.golpe) {
    // parado -> arrancada -> correndo (depois de um golpe, já volta correndo)
    if (movendo) { if (g.estado !== 'arrancada' && g.estado !== 'correndo') trocar(g, g.estado === 'parado' ? 'arrancada' : 'correndo'); }
    else if (g.estado !== 'parado') trocar(g, 'parado');
  }
  g.mixer.update(dt);
  if (!g.cfg.fogo) return;
  // fogo pulsando (o brilho do Blender era animado): só nas partes de fogo (emissiveMap)
  const fase = modelo.userData.fase || 0;
  const brilho = 0.7 + 0.2 * Math.sin(t * 8.4 + fase) + 0.1 * Math.sin(t * 31 + fase * 3);
  for (const m of g.materiais) if (!m.userData.piscando) m.emissiveIntensity = brilho;
}

// Um golpe começou a ser preparado. tipo: 'corpo' | 'projetil' | 'area'; prep = segundos até ele sair
export function tocarGolpe(modelo, tipo, prep = 0) {
  const g = modelo.userData.glb;
  if (!g?.acoes[tipo]) return;
  const marco = g.cfg.marco[tipo] || 0;
  g.pendente = null;
  // preparo mais longo que a "subida" da animação: espera um pouco antes de começar
  if (prep > marco + 0.02) { g.pendente = { tipo, espera: prep - marco }; return; }
  comecarGolpe(g, tipo, prep);
}

function comecarGolpe(g, tipo, prep) {
  const acao = g.acoes[tipo];
  const marco = g.cfg.marco[tipo] || 0;
  acao.reset();
  acao.timeScale = 1;
  acao.time = Math.max(0, marco - prep); // começa adiantada para o "momento do golpe" cair na hora certa
  tocar(g, acao, MISTURA_GOLPE);
  g.golpe = acao;
  g.estado = null; // depois do golpe, entra de novo em parado ou correndo
}

// Rabo de Fogo: o jogo gira o monstro por "duracao" segundos. A animação já tem a volta
// inteira (de giro.inicio a giro.fim): acelera essa parte para durar o mesmo tempo.
export function ajustarGiro(modelo, duracao) {
  const g = modelo.userData.glb;
  const acao = g?.acoes.area;
  if (!acao) return false;
  g.pendente = null;
  if (g.golpe !== acao) comecarGolpe(g, 'area', g.cfg.giro.inicio);
  acao.time = g.cfg.giro.inicio;
  acao.timeScale = (g.cfg.giro.fim - g.cfg.giro.inicio) / Math.max(0.05, duracao);
  return true;
}

// Levou dano ou desmaiou (só nos modelos que têm essas animações).
// Devolve true se a animação tocou (no desmaio, a batalha não precisa tombar o modelo).
export function tocarReacao(modelo, tipo) {
  const g = modelo?.userData.glb;
  const acao = g?.acoes[tipo];
  if (!acao || g.desmaiado) return false;
  if (tipo === 'desmaiar') {
    g.pendente = null;
    g.golpe = null;
    acao.reset();
    acao.timeScale = g.cfg.velDesmaio || 1;
    tocar(g, acao, MISTURA_GOLPE);
    g.desmaiado = true;
    g.estado = null;
    return true;
  }
  // levar dano: não corta um golpe que está saindo
  if (g.golpe || g.pendente) return false;
  acao.reset();
  acao.timeScale = 1;
  tocar(g, acao, MISTURA_GOLPE);
  g.golpe = acao; // quando acabar, volta para parado ou correndo
  g.estado = null;
  return true;
}

// O golpe foi cancelado (o monstro levou um golpe, foi capturado...): volta ao normal
export function pararGolpe(modelo) {
  const g = modelo.userData.glb;
  if (!g) return;
  g.pendente = null;
  if (!g.golpe) return;
  g.golpe = null; // no próximo quadro animarGLB mistura de volta para parado ou correndo
  g.estado = null;
}

// Piscar (dano, preparo, evolução) num modelo .glb: o brilho de fogo só existe nas partes
// de fogo, então o piscar tinge a cor da pele (e clareia, para o branco da evolução aparecer).
const _branco = new THREE.Color(1, 1, 1), _c = new THREE.Color();
export function piscarGLB(modelo, k, cor) {
  for (const m of modelo.userData.glb.materiais) {
    if (k <= 0) { m.color.copy(_branco); m.userData.piscando = false; continue; }
    _c.set(cor);
    m.color.copy(_branco).lerp(_c, k).multiplyScalar(1 + k * 1.5);
    m.emissiveIntensity = Math.max(1, k * 2);
    m.userData.piscando = true;
  }
}

// Libera o que é só desta cópia (os ossos têm uma textura própria na placa de vídeo)
export function descartarGLB(modelo) {
  const g = modelo.userData.glb;
  if (!g) return;
  g.mixer.stopAllAction();
  modelo.traverse((o) => { if (o.isSkinnedMesh) o.skeleton.dispose(); });
}
