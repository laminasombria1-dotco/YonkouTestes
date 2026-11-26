// =============================================================
// O OVO MISTERIOSO (prêmio do Campeão do Reino)
//  - Você ganha 1 ovo roxo ao vencer o Rei Julius pela primeira vez (dominar a arena).
//  - Ele fica na Bolsa e choca depois de 10 minutos de jogo (no mapa ou na batalha).
//  - Quem nasce é sorteado entre os raros e os de tipo duplo, na forma inicial, Nv.1.
//  - Ao chocar aparece uma cena (na mesma tela da evolução): o ovo treme, racha,
//    as escamas voam e o monstro aparece.
// Pode ter mais de um ovo (o Rei dá 2 na 2ª vitória): todos chocam juntos, um de cada vez.
// Fica salvo em estado.ovos = [{ restante: segundos }].
// Quem nasce: tipo duplo 70%, raro 25%, lendário 5% (CHANCES_OVO).
// =============================================================
import * as THREE from 'three';
import { ESPECIES, ELEMENTOS, criarMonstro, formaPorNivel, nomeTipo } from './dados.js';
import { criarModelo, animarModelo, descartar } from './modelos.js';

export const TEMPO_OVO = 600; // segundos de jogo até chocar
// Quem pode nascer: primeiro sorteia o grupo (com estas chances), depois um do grupo
export const CHANCES_OVO = { dupla: 0.70, raro: 0.25, lendario: 0.05 };
export const NASCEM_DO_OVO = {
  dupla: () => [formaPorNivel('fogoPlanta', 1), formaPorNivel('aguaFogo', 1), formaPorNivel('terraRaio', 1)],
  raro: () => ['espinhal', 'aquaraia', 'vulcarapa'],
  lendario: () => ['ignarion', 'silvarion'],
};
export function sortearDoOvo(sorte = Math.random) {
  const r = sorte();
  const grupo = r < CHANCES_OVO.lendario ? 'lendario' : r < CHANCES_OVO.lendario + CHANCES_OVO.raro ? 'raro' : 'dupla';
  const lista = NASCEM_DO_OVO[grupo]();
  return { grupo, especie: lista[Math.floor(sorte() * lista.length)] };
}

const ROXO = '#8a4ad9', BORDA = '#3a1a5a';

// O ovo em 3D: casca facetada coberta de escamas deitadas, com a ponta para cima
export function criarOvo3D(escala = 1) {
  const g = new THREE.Group(), RX = 0.45, RY = 0.62;
  const matCor = new THREE.MeshLambertMaterial({ color: ROXO, flatShading: true, side: THREE.DoubleSide });
  const matBorda = new THREE.MeshLambertMaterial({ color: BORDA, flatShading: true, side: THREE.DoubleSide, emissive: BORDA, emissiveIntensity: 0.3 });
  const casca = new THREE.Mesh(new THREE.IcosahedronGeometry(RX * 0.98, 1), matBorda);
  casca.scale.set(1, RY / RX, 1);
  g.add(casca);
  const tri = (w, h) => new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-w / 2, -h * 0.35), new THREE.Vector2(w / 2, -h * 0.35), new THREE.Vector2(0, h * 0.65)]));
  const escamas = [], alvo = new THREE.Vector3();
  for (let k = 0; k < 9; k++) {
    const y = -RY * 0.9 + (k / 8) * RY * 1.72, r = RX * Math.sqrt(Math.max(0.02, 1 - (y / RY) ** 2));
    const n = Math.max(4, Math.round((2 * Math.PI * r) / 0.16)), w = ((2 * Math.PI * r) / n) * 1.15, h = 0.24 * (0.6 + (0.4 * r) / RX);
    const gE = tri(w, h), gB = tri(w * 1.12, h * 1.1);
    for (let i = 0; i < n; i++) {
      const a = ((i + (k % 2) * 0.5) / n) * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
      const nx = x / RX / RX, ny = y / RY / RY, nz = z / RX / RX, L = Math.hypot(nx, ny, nz);
      for (const [geo, mat, fora] of [[gB, matBorda, 0.012], [gE, matCor, 0.022]]) {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x + (nx / L) * fora, y + (ny / L) * fora, z + (nz / L) * fora);
        m.lookAt(alvo.set(m.position.x + nx, m.position.y + ny, m.position.z + nz));
        m.rotateX(0.28);
        m.userData.dir = new THREE.Vector3(nx / L, ny / L, nz / L);
        g.add(m);
        escamas.push(m);
      }
    }
  }
  g.scale.setScalar(escala);
  g.userData.escamas = escamas;
  g.userData.casca = casca;
  return g;
}

// ---------- a cena do nascimento (mesma interface da CenaEvolucao) ----------
export class CenaNascimento {
  constructor(jogo, especie) {
    this.jogo = jogo;
    this.nascimento = especie;
    this.cena = new THREE.Scene();
    this.cena.background = new THREE.Color('#1f1638');
    this.cena.add(new THREE.HemisphereLight('#ffffff', '#4a3a6a', 1.8));
    const sol = new THREE.DirectionalLight('#fff1e0', 1.6); sol.position.set(3, 6, 5); this.cena.add(sol);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.3, 10), new THREE.MeshLambertMaterial({ color: '#e3dccb', flatShading: true }));
    pedestal.position.y = 0.15;
    this.cena.add(pedestal);
    this.anel = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.05, 4, 40), new THREE.MeshBasicMaterial({ color: '#c79bff', transparent: true, opacity: 0.8 }));
    this.anel.rotation.x = Math.PI / 2; this.anel.position.y = 0.4;
    this.cena.add(this.anel);
    this.camera = new THREE.PerspectiveCamera(40, jogo.aspecto, 0.1, 100);
    this.ovo = criarOvo3D(1.6);
    this.ovo.position.y = 0.3 + 0.62 * 1.6;
    this.cena.add(this.ovo);
    this.novo = criarModelo(especie);
    this.novo.position.y = 0.3;
    this.novo.visible = false;
    this.cena.add(this.novo);
    this.altura = Math.max(2.2, ESPECIES[especie].altura);
    this.t = 0;
    this.trocou = false;
    this.particulas = [];
  }

  get pronto() { return this.t > 3.6; }

  atualizar(dt, t) {
    this.t += dt;
    const d = (this.altura + 1.5) / (2 * Math.tan(THREE.MathUtils.degToRad(20)) * Math.min(1, this.jogo.aspecto)) + 1;
    this.camera.aspect = this.jogo.aspecto;
    this.camera.position.set(0, this.altura * 0.55 + 1.2, d);
    this.camera.lookAt(0, this.altura * 0.45, 0);
    this.camera.updateProjectionMatrix();
    this.anel.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    this.anel.rotation.z = t;
    if (!this.trocou) {
      // o ovo treme cada vez mais forte (e dá pulinhos no fim)
      const k = Math.min(1, this.t / 2.6);
      this.ovo.rotation.z = Math.sin(this.t * (8 + k * 30)) * 0.25 * k;
      this.ovo.position.y = 0.3 + 0.62 * 1.6 + (this.t > 1.8 ? Math.abs(Math.sin(this.t * 14)) * 0.15 : 0);
      this.ovo.userData.casca.material.emissiveIntensity = 0.3 + k * 1.2; // a luz roxa de dentro aumenta
      if (this.t >= 2.6) {
        this.trocou = true;
        this.rachar();
        this.novo.visible = true;
      }
    } else {
      this.novo.rotation.y += dt * 0.8;
      animarModelo(this.novo, t, false);
      const k = Math.min(1, (this.t - 2.6) / 0.4);
      this.novo.scale.setScalar(0.3 + 0.7 * k + Math.sin(k * Math.PI) * 0.15);
    }
    for (let i = this.particulas.length - 1; i >= 0; i--) {
      const pt = this.particulas[i];
      pt.vida -= dt;
      pt.v.y -= 7 * dt;
      pt.obj.position.addScaledVector(pt.v, dt);
      pt.obj.rotation.x += dt * 6; pt.obj.rotation.y += dt * 4;
      if (pt.vida <= 0) { pt.obj.visible = false; this.particulas.splice(i, 1); }
    }
  }

  // O ovo racha: as escamas voam para fora e a casca some
  rachar() {
    const ovo = this.ovo;
    ovo.updateMatrixWorld(true);
    for (const m of ovo.userData.escamas) {
      const p = new THREE.Vector3(); m.getWorldPosition(p);
      const q = new THREE.Quaternion(); m.getWorldQuaternion(q);
      ovo.remove(m);
      m.position.copy(p); m.quaternion.copy(q); m.scale.setScalar(1.6);
      this.cena.add(m);
      const f = 3 + Math.random() * 4;
      this.particulas.push({ obj: m, v: m.userData.dir.clone().multiplyScalar(f).add(new THREE.Vector3(0, 2 + Math.random() * 3, 0)), vida: 1.4 });
    }
    ovo.visible = false;
    const cor = ELEMENTOS[ESPECIES[this.nascimento].elemento].cor, g = new THREE.IcosahedronGeometry(0.14, 0);
    for (let i = 0; i < 30; i++) {
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: i % 3 ? cor : '#c79bff' }));
      m.position.set(0, 1.2, 0);
      const a = Math.random() * Math.PI * 2, f = 3 + Math.random() * 5;
      this.cena.add(m);
      this.particulas.push({ obj: m, v: new THREE.Vector3(Math.cos(a) * f, 2 + Math.random() * 5, Math.sin(a) * f), vida: 1.2 });
    }
  }

  textos() {
    const e = ESPECIES[this.nascimento];
    return this.trocou
      ? { titulo: `Nasceu um ${e.nome}!`, sub: `${e.dupla ? 'Tipo duplo' : 'Raro'} · ${nomeTipo(e)} · Nv.1 · ${this.destino || ''}` }
      : { titulo: 'O Ovo Misterioso está chocando!', sub: '' };
  }

  descartarTudo() { descartar(this.cena); }
}

// ---------- o ovo do jogador ----------
export class Ovo {
  constructor(jogo) { this.jogo = jogo; }
  // a lista de ovos (saves com o ovo antigo, estado.ovo, passam para a lista)
  get lista() {
    const est = this.jogo.estado;
    if (!est) return [];
    if (!est.ovos) est.ovos = [];
    if (est.ovo) { est.ovos.push(est.ovo); est.ovo = null; }
    return est.ovos;
  }
  get dados() { return this.lista[0] || null; }

  // O Rei Julius entrega ovos (n = quantos)
  // quem: quem entrega o ovo (o Rei Julius, ou o campeão de uma vila)
  receber(n = 1, quem = 'Rei Julius') {
    for (let k = 0; k < n; k++) this.lista.push({ restante: TEMPO_OVO });
    if (quem === 'Rei Julius') delete this.jogo.progressoArena().ovoPendente;
    this.jogo.aviso(`${quem}: ${n > 1 ? `${n} Ovos Misteriosos` : 'um Ovo Misterioso'} para o Campeão! Está${n > 1 ? 'ão' : ''} na sua Bolsa.`);
    this.jogo.aviso('Choca depois de 10 minutos de jogo. Pode nascer um tipo duplo, um raro ou até um lendário!');
  }

  // A cada quadro (no mapa e na batalha): o tempo de todos passa; no mapa, o que acabou choca
  atualizar(dt) {
    const j = this.jogo, lista = this.lista;
    if (!lista.length || (j.modo !== 'mundo' && j.modo !== 'batalha')) return;
    for (const o of lista) o.restante = Math.max(0, o.restante - dt);
    if (lista.some((o) => o.restante <= 0) && j.modo === 'mundo' && !j.painelAberto && !j.batalha) this.chocar();
  }

  chocarAgora() { if (this.dados) { this.dados.restante = 0; this.jogo.bolsa.fechar(); } } // GM

  chocar() {
    const j = this.jogo, est = j.estado, lista = this.lista;
    const i = lista.findIndex((o) => o.restante <= 0);
    if (i < 0) return;
    const { grupo, especie } = sortearDoOvo();
    const m = criarMonstro(especie, 1);
    lista.splice(i, 1);
    if (grupo === 'lendario') j.aviso(`Um LENDÁRIO nasceu do ovo: ${ESPECIES[especie].nome}!`);
    if (!est.capturados.includes(especie)) est.capturados.push(especie);
    if (est.equipe.length < 3) est.equipe.push(m); else est.reserva.push(m);
    j.pet.voltarAoTreinador?.(true);
    j.cenaEvo = new CenaNascimento(j, especie);
    j.cenaEvo.destino = est.equipe.includes(m) ? 'foi para a sua equipe' : 'foi para a reserva';
    j.evoAtual = { nascimento: especie };
    j.evoAnunciada = false;
    document.querySelector('#evo-texto').textContent = 'O Ovo Misterioso está chocando!';
    document.querySelector('#evo-novidades').textContent = '';
    document.querySelector('#evo-continuar').hidden = true;
    j.mostrarTela('evolucao');
    j.salvar();
  }

  // A parte dos ovos na Bolsa
  htmlBolsa() {
    const lista = this.lista;
    if (!lista.length) return '';
    const gm = this.jogo.gm ? '<button class="bolsa-btn" type="button" data-bolsa="chocar">GM: chocar agora</button>' : '';
    const ovos = lista.map((o) => {
      const s = Math.ceil(o.restante), feito = 1 - o.restante / TEMPO_OVO;
      return `<div class="ovo-caixa"><div class="ovo-desenho"></div><div style="flex:1"><b>Choca em ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</b>
        <div class="barra-ovo"><b style="width:${(feito * 100).toFixed(0)}%"></b></div></div></div>`;
    }).join('');
    return `<div class="bolsa-secao"><h3>${lista.length > 1 ? `Ovos Misteriosos (${lista.length})` : 'Ovo Misterioso'}</h3>${ovos}
      <small>Pode nascer um tipo duplo (70%), um raro (25%) ou um lendário (5%). O tempo só passa enquanto você joga.</small>${gm}</div>`;
  }
}
