// =============================================================
// LINHA DO PEDRISCO NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em pedrisco.js)
//  - Investida (Normal): o Pedrisco rola para a frente (só o visual)
//  - Pedregulho: pedra em arco que passa por cima dos obstáculos e cai onde o alvo
//    estava; nas formas finais ela quica e cai de novo mais à frente
//  - Punho Sísmico / Punho da Montanha: fileira de espinhos que sai do chão à frente
//    e joga quem acertar para o alto (não anda nem ataca enquanto está no ar)
//  - Tremor: rachaduras em estrela e pedrinhas pulando
//  - Muralha de Pedra / Cordilheira: Tremor + pilares em roda que viram obstáculos
//    por alguns segundos (seguram tiros retos e a passagem; a pedra em arco passa por cima)
// Para ficar leve no celular: formas e materiais são criados uma vez só
// e reaproveitados; quase tudo some em menos de 1 s (os pilares, em 4 ou 5 s).
// Etapa 3.1: as pedras ganham os efeitos da Arena (js/arena/efeitos.js, em this.b.fx): nuvens de poeira
// (partículas "sólidas", que aparecem no chão claro), a onda de choque no chão, a rachadura que brilha
// (âmbar, a cor do cristal do Rochedrão) nos golpes fortes e a neve que levanta no Montanhar.
// =============================================================
import * as THREE from 'three';
import { RAIO_ARENA } from '../arena.js';

// formas (uma vez só)
const GEO_PEDRA = new THREE.DodecahedronGeometry(1, 0);
const GEO_NEVE = new THREE.IcosahedronGeometry(1, 0).scale(0.85, 0.45, 0.85).translate(0, 0.55, 0);
const GEO_LASCA = new THREE.TetrahedronGeometry(1, 0);
const GEO_ESPINHO = new THREE.ConeGeometry(0.32, 1.4, 5).translate(0, 0.7, 0);
const GEO_PONTA = new THREE.ConeGeometry(0.15, 0.42, 5).translate(0, 1.2, 0);
const GEO_PILAR = new THREE.CylinderGeometry(0.85, 1, 1, 6).translate(0, 0.5, 0);
const GEO_TOPO = new THREE.ConeGeometry(0.9, 0.5, 6).translate(0, 0.25, 0);
const GEO_RACHA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
const GEO_DISCO = new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.88, 1, 36).rotateX(-Math.PI / 2);
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);

function fixo(m) { m.userData.fixo = true; return m; }
const lambert = (cor) => fixo(new THREE.MeshLambertMaterial({ color: cor, flatShading: true }));
const transp = (cor, op) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide }));
const ROCHA = lambert('#8f7d66');
const ROCHA_CLARA = lambert('#bfae94');
const ROCHA_ESCURA = lambert('#5e5244');
const NEVE = lambert('#ffffff');
const CRISTAL = fixo(new THREE.MeshLambertMaterial({ color: '#ffb347', emissive: '#ffb347', emissiveIntensity: 0.6, flatShading: true }));
const RACHA = transp('#2a2016', 0.85);
const SOMBRA = transp('#000000', 0.28);
// marcas de onde a pedra cai: vermelha para o inimigo, cor da Terra para você
const MARCA = {
  inimigo: { anel: transp('#ff3d5e', 0.8), disco: transp('#ff3d5e', 0.28) },
  jogador: { anel: transp('#c9a46a', 0.6), disco: transp('#c9a46a', 0.18) },
};
const COR_TERRA = '#c9a46a';
// poeira (do nascer ao fim) e neve: partículas "sólidas" da Arena
const C = (h) => new THREE.Color(h);
const POEIRA = [C('#d9c49c'), C('#86725a')];
const NEVE_PO = [C('#ffffff'), C('#cfd8e6')];
const BRILHO_CRISTAL = 0xffa040;
const aviso = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });

export class HabilidadesPedrisco {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
    this.pedras = [];   // pedras em arco no ar
    this.pilares = [];  // pilares de pedra na arena
  }

  // Só a linha do Pedrisco usa estas habilidades
  dele(c) { return c.esp.linha === 'terra'; }

  // ---------- lascas de pedra (partículas) ----------
  lasca(pos, vel, tam, vida, mat = ROCHA) {
    if (this.b.poupar()) return; // Qualidade mais leve: só parte dos pedacinhos sai
    const m = new THREE.Mesh(GEO_LASCA, mat);
    m.position.copy(pos);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    m.scale.setScalar(tam);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      vel.y -= 16 * dt; // pedra cai rápido
      e.obj.position.addScaledVector(vel, dt);
      if (e.obj.position.y < 0.08) { e.obj.position.y = 0.08; vel.set(vel.x * 0.5, 0, vel.z * 0.5); }
      e.obj.rotation.x += dt * 8;
      e.obj.scale.setScalar(tam * (1 - k * 0.6));
    } });
  }

  // pedrinhas e poeira subindo de um ponto do chão
  estouro(pos, n, forca, raio = 0.5) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * raio;
      const v = new THREE.Vector3(Math.sin(a) * 3 * forca, (3 + Math.random() * 4) * forca, Math.cos(a) * 3 * forca);
      const mat = i % 3 === 0 ? ROCHA_CLARA : i % 3 === 1 ? ROCHA : ROCHA_ESCURA;
      this.lasca(new THREE.Vector3(pos.x + Math.sin(a) * r, 0.2, pos.z + Math.cos(a) * r), v, 0.1 + Math.random() * 0.1, 0.7, mat);
    }
  }

  // nuvem de poeira (efeito da Arena) num ponto do chão: n partículas que se espalham e sobem devagar
  poeira(x, z, n, raio = 0.5, forca = 1, neve = false) {
    const [a, b] = neve ? NEVE_PO : POEIRA;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2, rr = raio * Math.sqrt(Math.random()), v = (1 + Math.random() * 2) * forca;
      this.b.fx._ponto(x + Math.sin(ang) * rr, 0.15 + Math.random() * 0.2, z + Math.cos(ang) * rr,
        Math.sin(ang) * v, 0.4 + Math.random() * 0.8, Math.cos(ang) * v, a, 0.6 + Math.random() * 0.4,
        (1.1 + Math.random() * 0.7) * Math.min(1.6, 0.7 + forca * 0.4), -0.2, { fim: b, cresce: 1.2, solido: true });
    }
  }

  // ---------- jogar para o alto ----------
  // Quem é atingido sobe e cai: enquanto está no ar não anda nem ataca (e perde o golpe que preparava)
  levantar(alvo, t) {
    if (alvo.morto) return;
    alvo.stun = Math.max(alvo.stun, t);
    alvo.levantado = { t: 0, total: t };
    if (alvo.prep) this.b.cancelarPreparo(alvo);
  }

  // ---------- Investida do Pedrisco: rola ----------
  aoUsarInvestida(c) {
    c.rolando = { t: 0 };
    c.modelo.rotation.order = 'YXZ'; // o giro "para a frente" acompanha para onde ele olha
  }

  // ---------- Pedregulho (pedra em arco) ----------
  // Pontos onde a pedra vai cair: onde o alvo está (entre o mínimo e o alcance) e cada quique mais à frente
  quedas(c, gp, alvoPos) {
    const A = gp.arco;
    const dir = new THREE.Vector3(alvoPos.x - c.pos.x, 0, alvoPos.z - c.pos.z);
    let d = dir.length();
    if (d < 1e-3) { dir.set(Math.sin(c.ang), 0, Math.cos(c.ang)); d = 0; }
    dir.normalize();
    d = Math.min(A.alcance, Math.max(A.minimo, d));
    const lista = [];
    let p = new THREE.Vector3(c.pos.x, 0, c.pos.z).addScaledVector(dir, d);
    for (let i = 0; i <= A.quiques.length; i++) {
      if (i > 0) p = p.clone().addScaledVector(dir, A.distQuique);
      const r = Math.hypot(p.x, p.z), lim = RAIO_ARENA - 1;
      if (r > lim) p.multiplyScalar(lim / r); // não cai fora da arena
      lista.push(p);
    }
    return lista;
  }

  // Aviso: um círculo em cada lugar onde a pedra vai cair (fica até ela cair)
  avisoArco(quedas, gp, inimigo) {
    const M = MARCA[inimigo ? 'inimigo' : 'jogador'];
    const g = new THREE.Group();
    g.userData = { ficaNoChao: true, marcas: [] };
    for (const q of quedas) {
      const m = new THREE.Group();
      const anel = new THREE.Mesh(GEO_ANEL, M.anel), disco = new THREE.Mesh(GEO_DISCO, M.disco);
      anel.scale.setScalar(gp.arco.area);
      disco.scale.setScalar(0.01);
      m.add(anel, disco);
      m.position.set(q.x, 0.07, q.z);
      m.userData.disco = disco;
      g.add(m);
      g.userData.marcas.push(m);
    }
    this.cena.add(g);
    return g;
  }

  lancar(c, gp, quedas, marcas, efeito) {
    const A = gp.arco;
    const dir = new THREE.Vector3(quedas[0].x - c.pos.x, 0, quedas[0].z - c.pos.z).normalize();
    const mesh = new THREE.Group();
    const pedra = new THREE.Mesh(GEO_PEDRA, ROCHA);
    mesh.add(pedra);
    if (A.neve) mesh.add(new THREE.Mesh(GEO_NEVE, NEVE));
    mesh.scale.setScalar(A.tamanho);
    const sombra = new THREE.Mesh(GEO_DISCO, SOMBRA);
    this.cena.add(mesh, sombra);
    const de = new THREE.Vector3(c.pos.x, c.altura * 0.75, c.pos.z).addScaledVector(dir, c.raio * 0.8);
    this.pedras.push({ c, gp, dir, quedas, marcas, efeito, mesh, sombra, de, n: 0, t: 0, voo: A.voo, altura: A.altura, sorteados: new Set() });
    this.estouro(de, 4, 0.4, 0.2);
  }

  atualizarPedra(p, dt) {
    const A = p.gp.arco, ate = p.quedas[p.n];
    p.t += dt;
    const k = Math.min(1, p.t / p.voo);
    // anda reto no chão e sobe e desce em parábola (por isso passa por cima dos obstáculos)
    p.mesh.position.set(p.de.x + (ate.x - p.de.x) * k, p.de.y * (1 - k) + 0.35 * k + p.altura * 4 * k * (1 - k), p.de.z + (ate.z - p.de.z) * k);
    p.mesh.rotation.x += dt * 9;
    p.mesh.rotation.z += dt * 4;
    p.sombra.position.set(p.mesh.position.x, 0.06, p.mesh.position.z);
    p.sombra.scale.setScalar(A.tamanho * (0.6 + 0.6 * k));
    // rastrinho de poeira atrás da pedra
    if (Math.random() < 0.5) {
      const [a, b] = A.neve ? NEVE_PO : POEIRA, q = p.mesh.position;
      this.b.fx._ponto(q.x, q.y, q.z, 0, 0.3, 0, a, 0.45, 0.8 * A.tamanho + 0.4, 0, { fim: b, cresce: 1, solido: true });
    }
    const marca = p.marcas?.userData.marcas[p.n];
    if (marca) marca.userData.disco.scale.setScalar(Math.max(0.01, A.area * k)); // o círculo enche até a pedra cair
    if (k < 1) return true;
    this.cair(p, ate);
    if (marca) marca.visible = false;
    p.n++;
    if (p.n >= p.quedas.length) { this.tirarPedra(p); return false; }
    // quica: sai de onde caiu, mais baixa e mais rápida
    p.de = ate.clone().setY(0.35);
    p.t = 0;
    p.voo *= 0.75;
    p.altura *= 0.55;
    return true;
  }

  // A pedra bate no chão: machuca quem está na área (cada quique com menos força)
  cair(p, q) {
    const A = p.gp.arco, fator = p.n === 0 ? 1 : A.quiques[p.n - 1];
    this.b.efeitoAnel(q, A.area, COR_TERRA);
    this.estouro(q, 8 + Math.round(A.tamanho * 6), 0.6 + A.tamanho * 0.4, A.area * 0.4);
    // poeira, onda de choque e, nas pedras grandes, o chão que racha brilhando
    this.poeira(q.x, q.z, Math.round(10 + A.area * 6), A.area * 0.6, 0.8 + A.tamanho * 0.3, A.neve);
    this.b.fx.onda(q.x, q.z, A.area * 1.6, 0xe8d4a8, 0.35);
    if (A.tamanho >= 1.2 || A.quiques.length) this.b.fx.rachadura(q.x, q.z, A.area * 1.2, BRILHO_CRISTAL, 0.9, true);
    if (A.neve) for (let i = 0; i < 5; i++) this.lasca(q.clone().setY(0.4), new THREE.Vector3((Math.random() - 0.5) * 4, 3 + Math.random() * 2, (Math.random() - 0.5) * 4), 0.1, 0.6, NEVE);
    for (const o of this.b.alvosDe(p.c)) {
      const dx = o.pos.x - q.x, dz = o.pos.z - q.z, d = Math.hypot(dx, dz);
      if (d > A.area + o.raio * 0.5) continue;
      // o Soterrado é sorteado uma vez só por alvo a cada pedra (juntando as quedas)
      const ef = p.efeito && !p.sorteados.has(o) ? p.efeito : null;
      if (ef) p.sorteados.add(o);
      const dir = d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : p.dir.clone();
      this.b.aplicarDano(p.c, o, p.gp, dir, { fator, efeito: ef, empurrao: 1.5 });
    }
  }

  tirarPedra(p) {
    this.cena.remove(p.mesh, p.sombra);
    if (p.marcas) this.cena.remove(p.marcas);
  }

  // ---------- Punho Sísmico ----------
  iniciarPunho(c, gp, dir, efeito) {
    c.punho = { gp, dir: dir.clone(), t: 0, feitos: 0, atingidos: new Set(), efeito, fim: null };
    c.modelo.rotation.order = 'YXZ';
    // o soco no chão: poeira na frente do monstro e uma rachadura que corre na direção dos espinhos
    const soco = new THREE.Vector3(c.pos.x, 0, c.pos.z).addScaledVector(dir, c.raio);
    this.estouro(soco, 6, 0.5, 0.3);
    this.poeira(soco.x, soco.z, 10, 0.4, 0.9, gp.espinhos.neve);
    this.b.fx.onda(soco.x, soco.z, 2, 0xe8d4a8, 0.3);
    const fim = soco.clone().addScaledVector(dir, gp.alcance);
    this.b.fx.faixa([soco.x, soco.z], [fim.x, fim.z], gp.espinhos.largura * 0.6, gp.espinhos.cristal ? BRILHO_CRISTAL : 0xcaa978, gp.espinhos.duracao + 0.4);
  }

  atualizarPunho(c, dt) {
    const P = c.punho, G = P.gp, E = G.espinhos;
    P.t += dt;
    const inicio = c.raio * 0.8, total = G.alcance;
    const N = Math.max(4, Math.round(total / 0.75)); // um espinho a cada ~0,75 m
    const k = Math.min(1, P.t / E.duracao);
    // os espinhos saem um atrás do outro; param no primeiro obstáculo
    while (P.feitos < Math.ceil(N * k) && P.fim == null) {
      const s = inicio + (total * (P.feitos + 0.5)) / N;
      const x = c.pos.x + P.dir.x * s, z = c.pos.z + P.dir.z * s;
      if (this.b.arena.bloqueia({ x, z }, 0.15)) { P.fim = s; break; }
      // em zigue-zague, um para cada lado da linha (para a fileira aparecer de qualquer ângulo)
      const lado = (P.feitos % 2 ? 1 : -1) * E.largura * 0.22;
      this.espinho(x + P.dir.z * lado, z - P.dir.x * lado, E, P.feitos, Math.sign(lado), P.dir);
      P.feitos++;
      P.alcanceAtual = s + total / N / 2;
    }
    // acerta quem estiver na fileira até onde ela já chegou (cada um uma vez)
    const ate = P.fim ?? P.alcanceAtual ?? 0;
    for (const o of this.b.alvosDe(c)) {
      if (P.atingidos.has(o)) continue;
      const rx = o.pos.x - c.pos.x, rz = o.pos.z - c.pos.z;
      const frente = rx * P.dir.x + rz * P.dir.z, lado = Math.abs(rx * P.dir.z - rz * P.dir.x);
      if (frente < 0 || frente > ate + o.raio * 0.5 || lado > E.largura / 2 + o.raio * 0.6) continue;
      P.atingidos.add(o);
      if (this.b.aplicarDano(c, o, G, P.dir, { efeito: P.efeito, empurrao: 0 })) this.levantar(o, E.levanta);
    }
    if (P.t >= E.duracao + 0.15) this.pararPunho(c);
  }

  // Um espinho de pedra que brota, fica um instante e afunda
  espinho(x, z, E, i, lado = 0, dir = null) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(GEO_ESPINHO, i % 2 ? ROCHA : ROCHA_ESCURA);
    g.add(m);
    if (E.neve) g.add(new THREE.Mesh(GEO_PONTA, NEVE));
    else if (E.cristal && i % 2 === 0) g.add(new THREE.Mesh(GEO_PONTA, CRISTAL));
    g.position.set(x, 0, z);
    // inclinado para fora da linha, como pedra rasgando o chão
    if (dir) { g.rotation.order = 'YXZ'; g.rotation.set(0, Math.atan2(dir.x, dir.z), -lado * (0.35 + Math.random() * 0.2)); }
    else g.rotation.set((Math.random() - 0.5) * 0.5, Math.random() * 3, (Math.random() - 0.5) * 0.5);
    const tam = E.tamanho * (0.8 + Math.random() * 0.4);
    this.cena.add(g);
    this.poeira(x, z, 5, 0.3, 0.6, E.neve);
    this.b.efeitos.push({ obj: g, vida: 0.6, total: 0.6, upd: (e, k) => {
      // sobe rápido, fica e afunda
      const h = k < 0.18 ? k / 0.18 : k > 0.65 ? (1 - k) / 0.35 : 1;
      e.obj.scale.set(tam, Math.max(0.01, tam * h), tam);
    } });
    this.estouro({ x, z }, 3, 0.45, 0.2);
  }

  pararPunho(c) {
    if (!c.punho) return;
    c.punho = null;
  }

  // Aviso do inimigo: faixa vermelha do tamanho da fileira de espinhos
  avisoPunho(c, gp, dir, cor) {
    const m = new THREE.Mesh(GEO_FAIXA, aviso(cor, 0.3));
    m.scale.set(gp.espinhos.largura, 1, gp.alcance + c.raio);
    m.position.set(c.pos.x, 0.06, c.pos.z);
    m.rotation.y = Math.atan2(dir.x, dir.z);
    m.userData = { faixa: true };
    this.cena.add(m);
    return m;
  }

  // ---------- Área: depois do dano normal da área, o visual e os pilares ----------
  aoUsarArea(c, gp) {
    if (gp.tremor) this.tremor(c.pos, gp.raio, !!gp.pilares?.neve);
    if (gp.pilares) this.criarPilares(c, gp);
  }

  // Rachaduras em estrela que abrem e fecham, e pedrinhas pulando
  tremor(pos, raio, neve = false) {
    const g = new THREE.Group();
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const m = new THREE.Mesh(GEO_RACHA, RACHA);
      m.rotation.y = a;
      m.scale.set(0.16, 1, raio * (0.75 + Math.random() * 0.3));
      g.add(m);
      // galhinho da rachadura
      const b = new THREE.Mesh(GEO_RACHA, RACHA);
      b.position.set(Math.sin(a) * raio * 0.45, 0, Math.cos(a) * raio * 0.45);
      b.rotation.y = a + (Math.random() < 0.5 ? 0.7 : -0.7);
      b.scale.set(0.1, 1, raio * 0.3);
      g.add(b);
    }
    g.position.set(pos.x, 0.075, pos.z);
    this.cena.add(g);
    this.b.efeitos.push({ obj: g, vida: 0.9, total: 0.9, upd: (e, k) => {
      const s = Math.min(1, k / 0.12) * (k > 0.6 ? (1 - k) / 0.4 : 1);
      e.obj.scale.set(Math.max(0.01, s), 1, Math.max(0.01, s));
    } });
    this.b.efeitoAnel(pos, raio, COR_TERRA);
    // efeitos da Arena: rachadura que brilha embaixo das escuras, onda de choque e poeira em roda
    this.b.fx.rachadura(pos.x, pos.z, raio * 1.15, BRILHO_CRISTAL, 1.1, true);
    this.b.fx.onda(pos.x, pos.z, raio * 1.4, 0xe8d4a8, 0.45);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      this.poeira(pos.x + Math.sin(a) * raio * 0.8, pos.z + Math.cos(a) * raio * 0.8, 3, 0.4, 0.8, neve);
    }
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, r = raio * Math.sqrt(Math.random());
      this.estouro({ x: pos.x + Math.sin(a) * r, z: pos.z + Math.cos(a) * r }, 1, 0.7, 0);
    }
    // a câmera treme um pouco
    this.tremerT = 0.3;
  }

  // ---------- Muralha de Pedra / Cordilheira ----------
  criarPilares(c, gp) {
    const P = gp.pilares, R = gp.raio;
    const giro = Math.random() * Math.PI;
    for (let i = 0; i < P.quantidade; i++) {
      const a = giro + (i / P.quantidade) * Math.PI * 2;
      const x = c.pos.x + Math.sin(a) * R, z = c.pos.z + Math.cos(a) * R;
      if (Math.hypot(x, z) > RAIO_ARENA - P.raio - 0.3) continue; // fora da arena não sobe
      const g = new THREE.Group();
      const corpo = new THREE.Mesh(GEO_PILAR, i % 2 ? ROCHA : ROCHA_ESCURA);
      corpo.scale.set(P.raio, P.altura, P.raio);
      const topo = new THREE.Mesh(GEO_TOPO, P.neve ? NEVE : ROCHA_CLARA);
      topo.scale.set(P.raio, P.raio * 1.4, P.raio);
      topo.position.y = P.altura;
      g.add(corpo, topo);
      g.position.set(x, 0, z);
      g.rotation.y = Math.random() * 3;
      g.scale.set(1, 0.01, 1);
      this.cena.add(g);
      // vira obstáculo de verdade (o mesmo tipo das pedras da arena)
      const obst = { x, z, r: P.raio, pilar: true };
      this.b.arena.obstaculos.push(obst);
      this.pilares.push({ mesh: g, obst, t: 0, dur: P.duracao, alt: 1, x, z, r: P.raio, neve: !!P.neve });
      this.estouro({ x, z }, 4, 0.6, P.raio);
      this.poeira(x, z, 8, P.raio, 0.9, P.neve);
    }
  }

  atualizarPilares(dt) {
    for (let i = this.pilares.length - 1; i >= 0; i--) {
      const p = this.pilares[i];
      p.t += dt;
      // sobe em 0,2 s, fica, e afunda nos últimos 0,3 s
      const s = Math.min(1, p.t / 0.2) * Math.min(1, Math.max(0, (p.dur - p.t) / 0.3));
      p.mesh.scale.set(1, Math.max(0.01, s), 1);
      if (p.t > p.dur - 0.3 && p.obst) { this.tirarObstaculo(p); this.poeira(p.x, p.z, 6, p.r, 0.6, p.neve); } // afundando já deixa passar
      if (p.t >= p.dur) { this.cena.remove(p.mesh); this.pilares.splice(i, 1); }
    }
  }

  tirarObstaculo(p) {
    const lista = this.b.arena.obstaculos, k = lista.indexOf(p.obst);
    if (k >= 0) lista.splice(k, 1);
    p.obst = null;
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    this.pedras = this.pedras.filter((p) => this.atualizarPedra(p, dt));
    this.atualizarPilares(dt);
    for (const l of [this.b.jog, ...this.b.inimigos]) {
      const m = l.modelo;
      // no ar: sobe e cai (a batalha põe o modelo no chão antes, aqui ele sobe)
      if (l.levantado) {
        const L = l.levantado;
        L.t += dt;
        const k = Math.min(1, L.t / L.total);
        m.position.y = Math.sin(k * Math.PI) * (1 + L.total);
        m.rotation.order = 'YXZ';
        m.rotation.x = Math.sin(k * Math.PI) * -0.5;
        if (k >= 1 || l.morto) {
          l.levantado = null;
          m.rotation.x = 0;
          this.estouro(l.pos, 4, 0.4, l.raio * 0.5);
        }
      }
      // Pedrisco rolando na Investida: uma volta inteira para a frente
      if (l.rolando) {
        l.rolando.t += dt;
        const k = l.rolando.t / 0.17;
        if (k >= 1 || !l.dash) { l.rolando = null; m.rotation.x = 0; }
        else m.rotation.x = k * Math.PI * 2;
      }
      // Punho: inclina para a frente no soco e volta
      if (l.punho) {
        const k = Math.min(1, l.punho.t / 0.12);
        m.rotation.x = 0.35 * Math.sin(k * Math.PI * 0.5) * (l.punho.t > 0.25 ? Math.max(0, 1 - (l.punho.t - 0.25) / 0.15) : 1);
      } else if (l.punhoInclinado) m.rotation.x = 0;
      l.punhoInclinado = !!l.punho;
    }
    // tremida da câmera no Tremor
    if (this.tremerT > 0) {
      this.tremerT -= dt;
      const f = Math.max(0, this.tremerT) * 0.5;
      this.b.camera.position.x += (Math.random() - 0.5) * f;
      this.b.camera.position.y += (Math.random() - 0.5) * f;
    }
  }

  // Para o que ainda está saindo (desmaiou, capturado, trocado...). Pedras no ar e pilares continuam.
  parar(c) {
    this.pararPunho(c);
    c.rolando = null;
    c.levantado = null;
    if (c.modelo) c.modelo.rotation.x = 0;
  }

  // Aviso cancelado antes de a pedra sair (esquivou, paralisou...)
  descartarAviso(g) {
    if (g?.userData.ficaNoChao) this.cena.remove(g);
  }
}
