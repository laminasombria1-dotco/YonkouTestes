// =============================================================
// JARDIM E AFETO
//  - O jardim fica na frente da casa do jogador, no Reino. Tem nível próprio (1 a 5), subido com
//    Galhos Raros + ouro: 2, 4, 6, 8 e 10 vagas para plantar.
//  - Sementes: compradas com ouro na loja do Reino. Cada uma só pode ser plantada se a CASA tiver
//    o nível pedido. As plantas crescem em TEMPO REAL (mesmo com o jogo fechado) e MORREM se não
//    forem colhidas até 12 horas depois de prontas. Cada colheita dá FRUTAS_POR_COLHEITA frutas.
//  - Frutas: alimentam os monstros e sobem o AFETO (nível 1 a 10). Cada fruta tem uma chance de dar
//    um Coração do Guardião (cresce com o nível de afeto), e ao SUBIR de nível de afeto vem 1
//    Coração garantido. Depois de 3 frutas, o monstro fica "satisfeito" por 1 dia do jogo (4 min).
// Fica salvo em: estado.jardim = { nivel, canteiros: [{ semente, plantou } | null] },
// estado.sementes / estado.frutas = { id: quantas }, e em cada monstro m.afeto = { nivel, pontos, comeu, satisfeito }.
// Leve para o celular de referência: no máximo 10 plantas, materiais fixos, o desenho só é
// atualizado 1 vez por segundo e só perto da casa.
// =============================================================
import * as THREE from 'three';
import { REINO } from './dungeon.js';
import { CASA_REINO } from './reino.js';
import { alturaEm } from './mapa/altura.js';

// As 5 sementes (os nomes ficam em inglês, como o Lâmina pediu)
//  casa = nível mínimo da casa para plantar | preco = ouro na loja | tempo = segundos para crescer
//  afeto = pontos de afeto de cada fruta | coracao = chance extra de Coração em cada fruta
export const SEMENTES = {
  morango: { nome: 'Strawberry', casa: 1, preco: 20, tempo: 30 * 60, afeto: 1, coracao: 0, cor: '#ff4a5a' },
  maca: { nome: 'Field Apple', casa: 2, preco: 50, tempo: 60 * 60, afeto: 2, coracao: 0, cor: '#ff8a3a' },
  uva: { nome: 'Moon Grape', casa: 3, preco: 120, tempo: 2 * 3600, afeto: 3, coracao: 0, cor: '#9a6aff' },
  pessego: { nome: 'Sun Peach', casa: 4, preco: 250, tempo: 4 * 3600, afeto: 5, coracao: 0, cor: '#ffb84a' },
  cristal: { nome: 'Crystal Fruit', casa: 5, preco: 500, tempo: 8 * 3600, afeto: 8, coracao: 0.05, cor: '#8ff4ff' },
};
export const ORDEM_SEMENTES = ['morango', 'maca', 'uva', 'pessego', 'cristal'];

// O jardim: vagas por nível e o custo para subir (Galhos Raros + ouro)
export const JARDIM = {
  vagas: [2, 4, 6, 8, 10],
  custo: { 2: { galhos: 2, moedas: 300 }, 3: { galhos: 5, moedas: 1000 }, 4: { galhos: 9, moedas: 3000 }, 5: { galhos: 14, moedas: 6000 } },
  morre: 12 * 3600,        // segundos depois de pronta até a planta morrer
  frutasPorColheita: 2,
};

// O afeto: pontos para passar de cada nível, chance de Coração e o "satisfeito"
export const AFETO = {
  max: 10,
  pontos: (nivel) => 5 * nivel,                 // nível 1 -> 2 precisa de 5 pontos, 9 -> 10 de 45
  chance: (nivel) => 0.03 + 0.02 * (nivel - 1), // 3% no nível 1 ... 21% no nível 10
  porVez: 3,                                    // frutas antes de ficar satisfeito
  satisfeito: 240,                              // segundos de jogo (1 dia do jogo)
};

const agora = () => Date.now();

// Saves que ainda não têm jardim, sementes ou frutas
export function garantirJardim(estado) {
  if (!estado.jardim) estado.jardim = { nivel: 1, canteiros: [] };
  if (!estado.sementes) estado.sementes = {};
  if (!estado.frutas) estado.frutas = {};
  const vagas = JARDIM.vagas[estado.jardim.nivel - 1];
  while (estado.jardim.canteiros.length < vagas) estado.jardim.canteiros.push(null);
}

// Como está um canteiro agora: { fase: 'vazio' | 'crescendo' | 'pronto' | 'morto', falta (s), k (0 a 1) }
export function faseDo(c, t = agora()) {
  if (!c) return { fase: 'vazio' };
  const S = SEMENTES[c.semente], pronto = c.plantou + S.tempo * 1000;
  if (t < pronto) return { fase: 'crescendo', falta: (pronto - t) / 1000, k: 1 - (pronto - t) / (S.tempo * 1000) };
  if (t < pronto + JARDIM.morre * 1000) return { fase: 'pronto', falta: (pronto + JARDIM.morre * 1000 - t) / 1000, k: 1 };
  return { fase: 'morto', k: 1 };
}

// Texto do tempo: "23 min", "1 h 05 min"
export function tempoTexto(s) {
  s = Math.max(0, Math.ceil(s));
  if (s < 60) return `${s} s`;
  const m = Math.ceil(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
}

// Planta a semente "id" no canteiro i. Devolve o texto do aviso (ou do problema).
export function plantar(estado, i, id) {
  const S = SEMENTES[id], J = estado.jardim;
  if (!S || i >= J.canteiros.length || J.canteiros[i]) return null;
  if ((estado.casaNivel || 1) < S.casa) return `${S.nome} só cresce com a casa no nível ${S.casa}.`;
  if ((estado.sementes[id] || 0) <= 0) return `Você não tem sementes de ${S.nome}. Compre na loja do Reino.`;
  estado.sementes[id]--;
  J.canteiros[i] = { semente: id, plantou: agora() };
  return `Você plantou ${S.nome}! Fica pronta em ${tempoTexto(S.tempo)}.`;
}

// Colhe (ou limpa a planta morta) do canteiro i. Devolve o texto do aviso.
export function colher(estado, i) {
  const J = estado.jardim, c = J.canteiros[i], f = faseDo(c);
  if (f.fase === 'morto') { J.canteiros[i] = null; return 'A planta tinha morrido. O canteiro está livre de novo.'; }
  if (f.fase !== 'pronto') return null;
  const S = SEMENTES[c.semente];
  estado.frutas[c.semente] = (estado.frutas[c.semente] || 0) + JARDIM.frutasPorColheita;
  J.canteiros[i] = null;
  return `Você colheu ${JARDIM.frutasPorColheita} ${S.nome}!`;
}

// ---------- afeto ----------
export function afetoDe(m) { return (m.afeto ||= { nivel: 1, pontos: 0, comeu: 0, satisfeito: 0 }); }

// Dá a fruta "id" ao monstro m. Devolve { texto, coracoes } ou { texto } se não deu.
export function alimentar(estado, m, id, sorte = Math.random) {
  const S = SEMENTES[id], A = afetoDe(m);
  if (!S || (estado.frutas[id] || 0) <= 0) return { texto: null };
  if (A.satisfeito > 0) return { texto: `Está satisfeito. Volte daqui a ${tempoTexto(A.satisfeito)}.` };
  estado.frutas[id]--;
  let coracoes = 0;
  // chance de Coração em cada fruta (cresce com o afeto; a Crystal Fruit dá mais)
  if (sorte() < AFETO.chance(A.nivel) + S.coracao) coracoes++;
  // pontos de afeto: ao subir de nível, 1 Coração garantido
  let subiu = 0;
  if (A.nivel < AFETO.max) {
    A.pontos += S.afeto;
    while (A.nivel < AFETO.max && A.pontos >= AFETO.pontos(A.nivel)) { A.pontos -= AFETO.pontos(A.nivel); A.nivel++; subiu++; coracoes++; }
    if (A.nivel >= AFETO.max) A.pontos = 0;
  }
  A.comeu++;
  if (A.comeu >= AFETO.porVez) { A.comeu = 0; A.satisfeito = AFETO.satisfeito; }
  estado.coracoes = (estado.coracoes || 0) + coracoes;
  return { texto: `Comeu ${S.nome}!`, coracoes, subiu };
}

// O tempo de "satisfeito" passa enquanto você joga
export function passarFome(estado, dt) {
  for (const m of [...estado.equipe, ...estado.reserva]) if (m.afeto?.satisfeito > 0) m.afeto.satisfeito = Math.max(0, m.afeto.satisfeito - dt);
}

// ---------- o jardim em 3D (na frente da casa, no Reino) ----------
const GEO = {
  terra: new THREE.BoxGeometry(1.4, 0.18, 1.4),
  broto: new THREE.ConeGeometry(0.12, 0.5, 5).translate(0, 0.25, 0),
  folha: new THREE.SphereGeometry(0.32, 6, 4),
  fruta: new THREE.IcosahedronGeometry(0.16, 0),
};
const fixo = (m) => { m.userData.fixo = true; return m; };
const MAT = {
  terra: fixo(new THREE.MeshLambertMaterial({ color: '#6a4a2a', flatShading: true })),
  folha: fixo(new THREE.MeshLambertMaterial({ color: '#4f9a45', flatShading: true })),
  morta: fixo(new THREE.MeshLambertMaterial({ color: '#8a7a5a', flatShading: true })),
  frutas: Object.fromEntries(ORDEM_SEMENTES.map((id) => [id, fixo(new THREE.MeshLambertMaterial({ color: SEMENTES[id].cor, emissive: SEMENTES[id].cor, emissiveIntensity: 0.35, flatShading: true }))])),
};

// Onde fica o canteiro i (coordenadas do Reino): 2 colunas na frente da casa, do lado do caminho
function lugarDoCanteiro(i) {
  const col = i % 2, lin = Math.floor(i / 2);
  return { x: CASA_REINO.x + 7 + col * 1.9, z: CASA_REINO.z - 3.8 + lin * 1.9 };
}

export class JardimMundo {
  constructor(mundo) {
    this.mundo = mundo;
    this.grupo = new THREE.Group();
    mundo.cena.add(this.grupo);
    this.canteiros = [];
    this.t = 0;
    this.prontos = new Set(); // para avisar só uma vez quando fica pronto
  }

  // Monta os canteiros conforme o nível do jardim (só a terra; as plantas vêm em atualizar)
  montar(estado) {
    const vagas = estado.jardim.canteiros.length;
    while (this.canteiros.length < vagas) {
      const i = this.canteiros.length, l = lugarDoCanteiro(i), p = REINO.paraMundo(l.x, l.z);
      const g = new THREE.Group();
      g.position.set(p.x, alturaEm(p.x, p.z), p.z);
      g.rotation.y = REINO.giro;
      const terra = new THREE.Mesh(GEO.terra, MAT.terra); terra.position.y = 0.09;
      const broto = new THREE.Mesh(GEO.broto, MAT.folha); broto.position.y = 0.18;
      const folha = new THREE.Mesh(GEO.folha, MAT.folha); folha.position.y = 0.55;
      const frutas = [0, 1, 2].map((k) => { const f = new THREE.Mesh(GEO.fruta, MAT.frutas.morango); f.position.set(Math.cos(k * 2.1) * 0.28, 0.6 + (k % 2) * 0.12, Math.sin(k * 2.1) * 0.28); return f; });
      g.add(terra, broto, folha, ...frutas);
      this.grupo.add(g);
      this.canteiros.push({ g, broto, folha, frutas });
    }
    this.t = 1; // redesenha já
  }

  // 1 vez por segundo (e só perto da casa): o desenho de cada planta e o aviso de "pronta"
  atualizar(dt, estado, perto) {
    this.t += dt;
    if (this.t < 1) return;
    this.t = 0;
    if (this.canteiros.length < estado.jardim.canteiros.length) this.montar(estado);
    const t = agora();
    estado.jardim.canteiros.forEach((c, i) => {
      const v = this.canteiros[i], f = faseDo(c, t);
      // aviso quando uma planta fica pronta (enquanto você joga)
      const chave = c ? `${i}:${c.plantou}` : null;
      if (f.fase === 'pronto' && chave && !this.prontos.has(chave)) {
        this.prontos.add(chave);
        if (f.falta > JARDIM.morre - 5) this.mundo.jogo.aviso(`${SEMENTES[c.semente].nome} está pronta no jardim! Colha na Bolsa, perto da casa.`);
      }
      if (!v || !perto) return;
      const vivo = f.fase === 'crescendo' || f.fase === 'pronto';
      v.broto.visible = vivo || f.fase === 'morto';
      v.broto.material = f.fase === 'morto' ? MAT.morta : MAT.folha;
      const k = f.fase === 'crescendo' ? 0.4 + f.k * 0.6 : 1;
      v.broto.scale.setScalar(k);
      v.folha.visible = f.fase !== 'vazio' && (f.fase !== 'crescendo' || f.k > 0.35);
      v.folha.material = f.fase === 'morto' ? MAT.morta : MAT.folha;
      v.folha.scale.setScalar(k);
      for (const fr of v.frutas) {
        fr.visible = f.fase === 'pronto';
        if (c) fr.material = MAT.frutas[c.semente];
      }
    });
  }

  descartar() { this.mundo.cena.remove(this.grupo); }
}
