// =============================================================
// LINHA DO SOLITO NA BATALHA: como os golpes funcionam e aparecem
// (os números ficam em solito.js)
//  - Sol (Pequeno Sol / Sol Dourado / Sol Rei): bola de sol que fica no campo por 20 s.
//    Enquanto ela existir, quem a soltou causa mais dano, recebe menos e anda mais rápido
//    (no campo todo). A recarga só começa quando o sol some. No Astrorei, o sol atira junto.
//  - Raio Solar / Laser Real: feixe fino, reto e longo que atravessa todos na linha
//    (obstáculos seguram)
//  - Calor / Onda de Calor / Supernova: o ar em volta dele esquenta e machuca quem está perto,
//    andando junto com ele; nas formas finais, "esquenta" (cada pedaço mais forte) e a
//    Supernova explode no fim
// Para ficar leve no celular: formas e materiais são criados uma vez só e reaproveitados.
// Etapa 3.1: o sol ganha os efeitos da Arena (js/arena/efeitos.js, em this.b.fx): o brilho em volta
// do sol, a espiral dourada quando ele nasce, o feixe que brilha por cima do laser com clarões na
// boca e na ponta, a faixa de luz no chão, faíscas "sólidas" (aparecem no chão claro), as brasas e
// as ondas do Calor e a Supernova que explode com coluna de luz e chão queimado. No Astrorei (a
// última forma), o brilho é vermelho de eclipse (o tom trevoso).
// =============================================================
import * as THREE from 'three';
import { brilho } from '../arena/efeitos.js';

// formas (uma vez só)
const GEO_NUCLEO = new THREE.IcosahedronGeometry(1, 1);
const GEO_RAIO_SOL = new THREE.ConeGeometry(0.12, 0.5, 4).translate(0, 0.25, 0);
const GEO_FEIXE = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5);
const GEO_FAIXA = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
const GEO_DISCO = new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2);
const GEO_ANEL = new THREE.RingGeometry(0.9, 1, 40).rotateX(-Math.PI / 2);
const GEO_BRASA = new THREE.TetrahedronGeometry(1, 0);

function fixo(m) { m.userData.fixo = true; return m; }
const basico = (cor, op = 1, extra = {}) => fixo(new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1, ...extra }));
const NUCLEO = basico('#fff3a0');
const RAIOS_SOL = basico('#ffb02e');
const HALO = basico('#ffd23f', 0.3);
const LUZ_CHAO = basico('#ffd23f', 0.18);
const FEIXE_FORA = basico('#ff9a1a', 0.55, { side: THREE.DoubleSide });
const FEIXE_MIOLO = basico('#fffbe0');
const QUEIMADO = basico('#3a2410', 0.45);
const BRILHO_DOURADO = basico('#ffe066');
// o calor vai do laranja ao vermelho quando esquenta
const CALOR_ANEL = [basico('#ffb02e', 0.7, { side: THREE.DoubleSide }), basico('#ff7a1a', 0.75, { side: THREE.DoubleSide }), basico('#ff3d1a', 0.8, { side: THREE.DoubleSide })];
const CALOR_CHAO = [basico('#ffb02e', 0.12), basico('#ff7a1a', 0.16), basico('#ff3d1a', 0.2)];
const BRASAS = [basico('#ffd23f'), basico('#ff9a1a'), basico('#ff5a1a')];
const COR_SOL = '#ffab2e';
const aviso = (cor, op) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });
// efeitos da Arena: dourado; no Astrorei, vermelho de eclipse
const BRILHO_SOL = 0xffc84a, BRILHO_ECLIPSE = 0xff4a5a;
const C = (h) => new THREE.Color(h);
const FAISCA_SOL = [C('#fff6c0'), C('#ff9a1a')];
const FAISCA_ECLIPSE = [C('#ffd8b0'), C('#a01a3a')];
// as brasas do calor do laranja ao vermelho (do nascer ao fim)
const BRASA_FX = [[C('#ffd23f'), C('#ff7a1a')], [C('#ffb02e'), C('#ff3d1a')], [C('#ff7a1a'), C('#a0180a')]];
const ONDA_CALOR = [0xffb02e, 0xff7a1a, 0xff3d1a];
let idSol = 0;

export class HabilidadesSolito {
  constructor(batalha) {
    this.b = batalha;
    this.cena = batalha.cena;
  }

  // Só a linha do Solito usa estas habilidades
  dele(c) { return c.esp.linha === 'sol'; }
  naLuta(l) { return !l.morto && l.modelo.visible && (l === this.b.jog || this.b.inimigos.includes(l)); }
  recargaDe(c, gp) { return gp.recarga * (c.lado === 'inimigo' ? (c.furia ? 0.95 : 1.4) : 1); }

  // a cor do brilho da Arena para este monstro
  eclipse(c) { return c?.esp?.estagio === 3; }
  corDe(c) { return this.eclipse(c) ? BRILHO_ECLIPSE : BRILHO_SOL; }

  // faíscas da Arena: partículas "sólidas" que voam e caem (uma malha só para todas)
  faiscas(x, y, z, n, forca = 1, c = null) {
    const [a, b] = this.eclipse(c) ? FAISCA_ECLIPSE : FAISCA_SOL;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2, v = (2 + Math.random() * 3) * forca;
      this.b.fx._ponto(x, y, z, Math.sin(ang) * v, (1.5 + Math.random() * 3) * forca, Math.cos(ang) * v, a,
        0.35 + Math.random() * 0.25, 0.2 + Math.random() * 0.12, 6, { fim: b, solido: true });
    }
  }

  // brasinha/partícula de calor subindo
  brasa(pos, vel, tam, vida, mat = BRASAS[Math.floor(Math.random() * 3)]) {
    const m = new THREE.Mesh(GEO_BRASA, mat);
    m.position.copy(pos);
    m.scale.setScalar(tam);
    this.cena.add(m);
    this.b.efeitos.push({ obj: m, vida, total: vida, upd: (e, k, dt) => {
      e.obj.position.addScaledVector(vel, dt);
      e.obj.rotation.x += dt * 5;
      e.obj.scale.setScalar(tam * (1 - k));
    } });
  }

  // ---------- Sol ----------
  soltarSol(c, gp) {
    const S = gp.sol;
    this.tirarSol(c, false);
    const g = new THREE.Group();
    const nucleo = new THREE.Mesh(GEO_NUCLEO, NUCLEO);
    nucleo.scale.setScalar(0.45);
    const halo = new THREE.Mesh(GEO_NUCLEO, HALO);
    halo.scale.setScalar(0.75);
    const coroa = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const r = new THREE.Mesh(GEO_RAIO_SOL, RAIOS_SOL);
      const a = (i / 12) * Math.PI * 2;
      r.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0);
      r.rotation.z = a - Math.PI / 2;
      coroa.add(r);
    }
    g.add(halo, nucleo, coroa);
    const luz = new THREE.Mesh(GEO_DISCO, LUZ_CHAO);
    luz.scale.setScalar(1.6);
    // o sol fica no campo ao lado e acima de quem soltou (para não se misturar com a juba
    // nem tapar o monstro na câmera, que fica atrás dele)
    const pos = new THREE.Vector3(c.pos.x + Math.cos(c.ang) * 2, c.altura + 1.8, c.pos.z - Math.sin(c.ang) * 2);
    g.position.copy(pos);
    g.scale.setScalar(0.01);
    luz.position.set(pos.x, 0.06, pos.z);
    this.cena.add(g, luz);
    c.sol = { cfg: S, gp, t: S.duracao, obj: g, coroa, halo, luz, pos, brilhoT: 0, id: 'sol' + ++idSol };
    c.rec[0] = 1e4; // a recarga só começa quando o sol sumir
    this.b.particulas(pos, COR_SOL, 16, 1.2);
    // efeitos da Arena: a luz sobe numa espiral até o sol, clarão quando ele nasce e o brilho em volta
    const cor = this.corDe(c), sol = c.sol, aura = brilho(cor, 4.2);
    this.b.fx.espiral(c.pos.x, 0.2, c.pos.z, c.raio + 0.5, c.altura + 0.8, cor, 0.6, { n: 36, giro: 2.5, puxa: 0.2 });
    this.b.fx.onda(c.pos.x, c.pos.z, c.raio + 1.6, cor, 0.4);
    this.b.fx.clarao(pos.x, pos.y, pos.z, cor, 0.8, 0.4);
    this.faiscas(pos.x, pos.y, pos.z, 14, 0.8, c);
    this.b.fx._temp(aura, S.duracao + 1, () => {
      aura.position.copy(sol.obj.position);
      aura.material.opacity = 0.75 * Math.min(1, sol.obj.scale.x) * (0.9 + Math.sin(this.b.t * 6) * 0.1);
    }, { id: sol.id });
    this.b.jogo.numero(`Sol +${Math.round(S.ataque * 100)}%`, c.pos.clone().setY(c.altura + 0.6), COR_SOL, 'pequeno');
  }

  // O sol some: a recarga de 15 s começa agora
  tirarSol(c, comecarRecarga = true) {
    const s = c.sol;
    if (!s) return;
    this.cena.remove(s.obj, s.luz);
    this.b.fx.encerrar(s.id);
    c.sol = null;
    if (comecarRecarga) c.rec[0] = this.recargaDe(c, s.gp);
  }

  atualizarSol(c, dt) {
    const s = c.sol;
    s.t -= dt;
    if (s.t <= 0 || !this.naLuta(c)) { this.tirarSol(c); return; }
    // aparece crescendo, gira os raios, pulsa e some no último segundo
    const k = Math.min(1, (s.cfg.duracao - s.t) / 0.3) * Math.min(1, s.t / 0.6);
    s.obj.scale.setScalar(Math.max(0.01, k * (1 + Math.sin(this.b.t * 4) * 0.05)));
    s.obj.position.y = s.pos.y + Math.sin(this.b.t * 1.5) * 0.15;
    s.coroa.rotation.z += dt * 1.2;
    s.halo.scale.setScalar(0.75 + Math.sin(this.b.t * 6) * 0.06);
    s.obj.lookAt(this.b.camera.position.x, s.obj.position.y, this.b.camera.position.z); // os raios viram para a câmera
    s.luz.scale.setScalar(Math.max(0.01, 1.6 * k));
    // brilhinhos dourados em quem está com o bônus
    s.brilhoT -= dt;
    if (s.brilhoT <= 0) {
      s.brilhoT = 0.1;
      const a = Math.random() * Math.PI * 2, [ca, cb] = this.eclipse(c) ? FAISCA_ECLIPSE : FAISCA_SOL;
      this.b.fx._ponto(c.pos.x + Math.sin(a) * c.raio, Math.random() * c.altura, c.pos.z + Math.cos(a) * c.raio, 0, 1.5, 0, ca, 0.6, 0.22, 0, { fim: cb, solido: true });
    }
  }

  // ---------- Laser ----------
  // Até onde o feixe vai antes de bater num obstáculo
  comprimento(de, dir, alcance) {
    for (let s = 0.3; s <= alcance; s += 0.3) {
      if (this.b.arena.bloqueia({ x: de.x + dir.x * s, z: de.z + dir.z * s }, 0.1)) return s;
    }
    return alcance;
  }

  // Um feixe a partir de "origem" (no chão) na direção "dir"; boca = de onde ele sai, no ar
  feixe(c, gp, origem, dir, boca, fator, efeito) {
    const L = gp.laser;
    const len = this.comprimento(origem, dir, L.alcance);
    // acerta todos na linha (cada um uma vez)
    for (const o of this.b.alvosDe(c)) {
      const rx = o.pos.x - origem.x, rz = o.pos.z - origem.z;
      const frente = rx * dir.x + rz * dir.z, lado = Math.abs(rx * dir.z - rz * dir.x);
      if (frente < -o.raio || frente > len + o.raio * 0.5 || lado > L.largura / 2 + o.raio * 0.7) continue;
      this.b.aplicarDano(c, o, gp, dir, { fator, efeito, empurrao: 2 });
      this.faiscas(o.pos.x, o.altura * 0.5, o.pos.z, 8, 0.7, c);
    }
    // visual: feixe da boca até o fim, marca queimada no chão e brilho na ponta
    const fim = new THREE.Vector3(origem.x + dir.x * len, Math.min(boca.y, 1), origem.z + dir.z * len);
    const g = new THREE.Group();
    const fora = new THREE.Mesh(GEO_FEIXE, FEIXE_FORA), miolo = new THREE.Mesh(GEO_FEIXE, FEIXE_MIOLO);
    g.add(fora, miolo);
    g.position.copy(boca);
    g.lookAt(fim);
    const dist = boca.distanceTo(fim), w = L.largura * 0.5;
    this.cena.add(g);
    this.b.efeitos.push({ obj: g, vida: L.duracao, total: L.duracao, upd: (e, k) => {
      const s = Math.max(0.01, 1 - k * k);
      fora.scale.set(w * s, w * s, dist);
      miolo.scale.set(w * 0.4 * s, w * 0.4 * s, dist);
    } });
    const chao = new THREE.Mesh(GEO_FAIXA, QUEIMADO);
    chao.position.set(origem.x, 0.05, origem.z);
    chao.rotation.y = Math.atan2(dir.x, dir.z);
    this.cena.add(chao);
    this.b.efeitos.push({ obj: chao, vida: 0.9, total: 0.9, upd: (e, k) => { e.obj.scale.set(Math.max(0.01, L.largura * 0.7 * (1 - k)), 1, len); } });
    for (let i = 0; i < 2; i++) this.brasa(fim.clone(), new THREE.Vector3((Math.random() - 0.5) * 5, 1 + Math.random() * 3, (Math.random() - 0.5) * 5), 0.1, 0.4);
    // efeitos da Arena: o feixe que brilha por cima, a faixa de luz no chão, clarões e faíscas na ponta
    const cor = this.corDe(c);
    this.b.fx.feixe(boca, fim, L.largura * 1.3, cor, L.duracao + 0.05);
    this.b.fx.faixa([origem.x, origem.z], [fim.x, fim.z], L.largura * 1.8, cor, 0.55);
    this.b.fx.clarao(boca.x, boca.y, boca.z, cor, 0.5 + L.largura * 0.3, 0.25);
    this.b.fx.clarao(fim.x, fim.y, fim.z, cor, 0.6 + L.largura * 0.3, 0.3);
    this.faiscas(fim.x, fim.y, fim.z, 10 + Math.round(L.largura * 6), 0.8, c);
  }

  atirarLaser(c, gp, dir, efeito) {
    const origem = new THREE.Vector3(c.pos.x, 0, c.pos.z).addScaledVector(dir, c.raio * 0.6);
    const boca = new THREE.Vector3(c.pos.x, c.altura * 0.6, c.pos.z).addScaledVector(dir, c.raio * 0.8);
    this.feixe(c, gp, origem, dir, boca, 1, efeito);
    // Astrorei: o sol também atira, no inimigo mais perto dele
    const s = c.sol;
    if (s?.cfg.atira) {
      const sp = s.obj.position;
      let alvo = null, md = Infinity;
      for (const o of this.b.alvosDe(c)) { const d = Math.hypot(o.pos.x - sp.x, o.pos.z - sp.z); if (d < md) { md = d; alvo = o; } }
      if (alvo) {
        const d2 = new THREE.Vector3(alvo.pos.x - sp.x, 0, alvo.pos.z - sp.z);
        if (d2.lengthSq() < 0.01) d2.set(dir.x, 0, dir.z);
        d2.normalize();
        this.feixe(c, gp, new THREE.Vector3(sp.x, 0, sp.z), d2, sp.clone(), s.cfg.atira, efeito);
      }
    }
  }

  // Aviso do inimigo: faixa vermelha fina e comprida
  avisoLaser(c, gp, dir, cor) {
    const m = new THREE.Mesh(GEO_FAIXA, aviso(cor, 0.3));
    m.scale.set(gp.laser.largura, 1, gp.laser.alcance + c.raio);
    m.position.set(c.pos.x, 0.06, c.pos.z);
    m.rotation.y = Math.atan2(dir.x, dir.z);
    m.userData = { faixa: true };
    this.cena.add(m);
    return m;
  }

  // ---------- Calor ----------
  iniciarCalor(c, gp, efeito) {
    this.pararCalor(c);
    const g = new THREE.Group();
    const anel = new THREE.Mesh(GEO_ANEL, CALOR_ANEL[0]), chao = new THREE.Mesh(GEO_DISCO, CALOR_CHAO[0]);
    g.add(chao, anel);
    g.scale.setScalar(0.01);
    this.cena.add(g);
    c.calor = { gp, efeito, t: 0, tick: 0, mesh: g, anel, chao, contagem: new Map(), emitir: 0, emitirFx: 0 };
    this.b.efeitoAnel(c.pos, gp.raio, COR_SOL);
    this.b.fx.onda(c.pos.x, c.pos.z, gp.raio * 1.2, ONDA_CALOR[0], 0.4);
  }

  atualizarCalor(c, dt) {
    const Q = c.calor, gp = Q.gp, C = gp.calor, R = gp.raio;
    Q.t += dt;
    if (!this.naLuta(c)) { this.pararCalor(c); return; }
    // o anel anda junto com ele, treme e fica mais vermelho quando esquenta
    const nivel = C.esquenta ? Math.min(2, Math.floor((Q.t / C.duracao) * 3)) : 0;
    Q.anel.material = CALOR_ANEL[nivel];
    Q.chao.material = CALOR_CHAO[nivel];
    const s = Math.min(1, Q.t / 0.2) * (1 + Math.sin(this.b.t * 14) * 0.025);
    Q.mesh.scale.setScalar(Math.max(0.01, R * s));
    Q.mesh.position.set(c.pos.x, 0.07, c.pos.z);
    Q.emitir += dt * (8 + nivel * 4);
    // brasas da Arena subindo do chão quente (do laranja ao vermelho; mais e maiores quando esquenta)
    Q.emitirFx += dt * (40 + nivel * 20);
    while (Q.emitirFx >= 1) {
      Q.emitirFx--;
      const a = Math.random() * Math.PI * 2, r = R * Math.sqrt(Math.random()), [ca, cb] = BRASA_FX[nivel];
      this.b.fx._ponto(c.pos.x + Math.sin(a) * r, 0.1, c.pos.z + Math.cos(a) * r, (Math.random() - 0.5) * 0.6, 1.2 + Math.random() * 1.5, (Math.random() - 0.5) * 0.6,
        ca, 0.6 + Math.random() * 0.3, 0.42 + nivel * 0.08, 0, { fim: cb, cresce: 0.4, solido: true });
    }
    while (Q.emitir >= 1) {
      Q.emitir--;
      const a = Math.random() * Math.PI * 2, r = R * Math.sqrt(Math.random());
      this.brasa(new THREE.Vector3(c.pos.x + Math.sin(a) * r, 0.1, c.pos.z + Math.cos(a) * r), new THREE.Vector3((Math.random() - 0.5) * 0.6, 1.5 + Math.random() * 1.5, (Math.random() - 0.5) * 0.6), 0.07 + nivel * 0.02, 0.6);
    }
    // um pedaço de dano a cada intervalo, em quem está perto
    if (Q.t >= Q.tick) {
      Q.tick += C.intervalo;
      this.b.fx.onda(c.pos.x, c.pos.z, R * (1 + nivel * 0.08), ONDA_CALOR[nivel], 0.45);
      for (const o of this.b.alvosDe(c)) {
        const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
        if (d > R + o.raio * 0.5) continue;
        const n = Q.contagem.get(o) || 0;
        Q.contagem.set(o, n + 1);
        // esquenta: cada pedaço que o mesmo inimigo leva é mais forte
        const fator = Math.pow(1 + (C.esquenta || 0), n);
        const dir = d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1);
        this.b.aplicarDano(c, o, gp, dir, { fator, efeito: n === 0 ? Q.efeito : null, leve: true, primeiro: n === 0, empurrao: 0 });
      }
    }
    if (Q.t >= C.duracao) {
      if (C.explosao) this.explodir(c, gp, C.explosao);
      this.pararCalor(c);
    }
  }

  // Supernova: no fim, o calor explode
  explodir(c, gp, E) {
    const bola = new THREE.Mesh(GEO_NUCLEO, HALO);
    bola.position.set(c.pos.x, 1, c.pos.z);
    this.cena.add(bola);
    this.b.efeitos.push({ obj: bola, vida: 0.45, total: 0.45, upd: (e, k) => { e.obj.scale.setScalar(Math.max(0.01, E.raio * Math.sqrt(k))); } });
    this.b.efeitoAnel(c.pos, E.raio, '#ffffff');
    this.b.efeitoAnel(c.pos, E.raio * 0.7, COR_SOL);
    this.b.particulas(c.pos, COR_SOL, 26, 1.8);
    // efeitos da Arena: clarão forte, coluna de luz, onda, cacos, faíscas e o chão queimado
    const cor = this.corDe(c);
    this.b.fx.clarao(c.pos.x, 1.2, c.pos.z, cor, 1.6, 0.5);
    this.b.fx.coluna(c.pos.x, c.pos.z, E.raio * 0.45, cor, 7, 0.55);
    this.b.fx.onda(c.pos.x, c.pos.z, E.raio * 1.5, cor, 0.55);
    this.b.fx.estilhacos(c.pos.x, 1, c.pos.z, 18, cor, { tam: 0.22, vel: 7, cima: 5, vida: 0.9 });
    this.faiscas(c.pos.x, 1, c.pos.z, 40, 1.4, c);
    this.b.fx.rachadura(c.pos.x, c.pos.z, E.raio * 1.1, this.eclipse(c) ? 0x5a1020 : 0x6a2a0a, 1.4, true);
    for (const o of this.b.alvosDe(c)) {
      const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z, d = Math.hypot(dx, dz);
      if (d > E.raio + o.raio * 0.5) continue;
      this.b.aplicarDano(c, o, gp, d > 0.01 ? new THREE.Vector3(dx / d, 0, dz / d) : new THREE.Vector3(0, 0, 1), { fator: E.poder / gp.poder });
    }
  }

  pararCalor(c) {
    if (!c.calor) return;
    this.cena.remove(c.calor.mesh);
    c.calor = null;
  }

  // ---------- a cada quadro ----------
  atualizar(dt) {
    for (const l of [this.b.jog, ...this.b.inimigos]) {
      if (l.sol) this.atualizarSol(l, dt);
      if (l.calor) this.atualizarCalor(l, dt);
    }
  }

  // Para tudo (desmaiou, trocado...): o sol some e a recarga começa
  parar(c) {
    this.pararCalor(c);
    this.tirarSol(c);
  }
}
