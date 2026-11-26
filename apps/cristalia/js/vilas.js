// =============================================================
// AS VILAS (mundo novo, passo 3): uma em cada bioma, 30 m de raio
//  - Ficam nos lugares que a semente guardou (VILAS no gerador.js), num chão plano.
//  - Cerca baixa com 2 entradas (uma virada para o Reino, outra para fora),
//    a praça com a Loja de Poções, 5 casas com a cara do bioma e, no fundo,
//    uma arena de 13 m com plateia e 5 plataformas: 4 treinadores e o Campeão
//    (o Campeão é sempre do elemento do bioma).
//  - Zona segura: nenhum selvagem entra e não dá para fincar a bandeira.
//  - Vencer o Campeão da vila: você vira o novo campeão, ganha o título
//    ("Campeão da Vila da Areia"), ouro, 1 ovo (na 1ª vez) e a vila passa a
//    guardar ouro para você (pegue no saquinho da tela).
// Para pesar pouco no celular: cada vila vira poucas malhas (como o Reino) e
// a plateia só aparece quando você está perto.
// O desenho usa coordenadas "locais" da vila: (0, 0) é o meio e +z aponta para o Reino.
// =============================================================
import * as THREE from 'three';
import { VILAS, NIVEL_AGUA } from './mapa/gerador.js';
import { alturaEm } from './mapa/altura.js';
import { peca, brilho, duplo, caixa, cil, cone, prisma, assar, criarPlateia, animarPlateia, desenharTreinador } from './reino.js';
import { ELEMENTOS } from './dados.js';
import { criarCoroa } from './modelos.js';

export const NOMES_VILA = { raio: 'Vila da Neve', planta: 'Vila das Folhas', terra: 'Vila da Areia', fogo: 'Vila das Cinzas', agua: 'Vila das Marés' };
export const ORDEM_VILAS = ['raio', 'planta', 'terra', 'fogo', 'agua'];
export const tituloDaVila = (id) => `Campeão da ${NOMES_VILA[id]}`;

// O ouro que cada vila conquistada guarda (pegue no saquinho da tela)
export const TESOURO_VILA = { ouro: 75, cada: 600, max: 300 };
// O que o Campeão da vila dá na 1ª vitória (além do título, do ouro guardado e de 1 ovo)
export const PREMIO_VILA = { ouro: 1000 };

// =============================================================
// OS TREINADORES DAS VILAS (o Lâmina vai fazer)
// 5 por vila, na ordem da luta: 4 treinadores e, por último, o Campeão
// (campeao: true, sempre do elemento do bioma). O formato é o mesmo dos
// treinadores do Reino (TREINADORES no reino.js), por exemplo:
//   { id: 'areia1', nome: 'Nome', elemento: 'fogo', cor: '#ff6a3d', niveis: [55, 55],
//     equipe: [['L:fogo', 55], ['L:fogo', 55], ['L:fogo', 55]],
//     fala: 'O que ele diz antes da luta', premio: { forte: 2 }, moedas: 400, revanche: 80 },
//   ...o 5º com campeao: true
// Níveis combinados (provisórios): treinadores Nv.55, 60, 65 e 70; o Campeão Nv.75 (forma final).
// Enquanto a lista estiver vazia, as plataformas esperam o treinador ("em breve").
// =============================================================
const cor = (el) => ELEMENTOS[el].cor;
export const TREINADORES_VILA = {
  raio: [], planta: [],
  // Vila das Marés (Arquipélago): os treinadores do Lâmina. A Campeã é a Serena (Água).
  agua: [
    { id: 'karah', nome: 'Karah', elemento: 'fogo', cor: cor('fogo'), niveis: [55, 55],
      equipe: [['L:fogo', 55], ['L:fogoPlanta', 55], ['L:fogo', 55]], fala: 'Karah: Nem o mar apaga o meu fogo. Vem!', premio: { forte: 2 }, moedas: 250, revanche: 75 },
    { id: 'angelica', nome: 'Angelica', elemento: 'fogo', cor: cor('fogo'), niveis: [60, 60],
      equipe: [['L:fogo', 60], ['vulcarapa', 60], ['L:fogo', 60]], fala: 'Angelica: Uma luta elegante, por favor. E quente.', premio: { forte: 2 }, moedas: 300, revanche: 80 },
    { id: 'lanny', nome: 'Lanny', elemento: 'raio', cor: cor('raio'), niveis: [65, 65],
      equipe: [['L:raio', 65], ['L:terraRaio', 65], ['L:raio', 65]], fala: 'Lanny: Raio na água? Você já perdeu.', premio: { forte: 3 }, moedas: 350, revanche: 85 },
    { id: 'ilia', nome: 'Ilia', elemento: 'trevas', cor: cor('trevas'), niveis: [70, 70],
      equipe: [['L:trevas', 70], ['L:lua', 70], ['L:trevas', 70]], fala: 'Ilia: As estrelas me contaram como esta luta termina.', premio: { forte: 3 }, moedas: 400, revanche: 90 },
    { id: 'serena', nome: 'Serena', elemento: 'agua', cor: cor('agua'), niveis: [75, 75], campeao: true, chamada: 'Campeã',
      equipe: [['L:agua', 75], ['aquaraia', 75], ['L:aguaFogo', 75], ['L:agua', 75]], fala: 'Serena: Estas marés me obedecem. Vamos ver se obedecem você!', premio: { forte: 3, supremo: 2 }, moedas: 800, revanche: 100 },
  ],
  // Vila da Areia (Deserto): os treinadores do Lâmina. O Campeão é o Pedro (Terra).
  terra: [
    { id: 'nicky', nome: 'Nicky', elemento: 'trevas', cor: cor('trevas'), niveis: [55, 55],
      equipe: [['L:trevas', 55], ['L:lua', 55], ['L:trevas', 55]], fala: 'Nicky: A noite chegou mais cedo pra você.', premio: { forte: 2 }, moedas: 250, revanche: 75 },
    { id: 'rony', nome: 'Rony', elemento: 'fogo', cor: cor('fogo'), niveis: [60, 60],
      equipe: [['L:fogo', 60], ['L:fogoPlanta', 60], ['L:fogo', 60]], fala: 'Rony: Tá quente aqui no deserto? Vai ficar mais!', premio: { forte: 2 }, moedas: 300, revanche: 80 },
    { id: 'jean', nome: 'Jean', elemento: 'agua', cor: cor('agua'), niveis: [65, 65],
      equipe: [['L:agua', 65], ['L:aguaFogo', 65], ['L:agua', 65]], fala: 'Jean: No deserto, a água vale ouro. Vamos ver quanto você vale!', premio: { forte: 3 }, moedas: 350, revanche: 85 },
    { id: 'nando', nome: 'Nando', elemento: 'planta', cor: cor('planta'), niveis: [70, 70],
      equipe: [['L:planta', 70], ['espinhal', 70], ['L:planta', 70]], fala: 'Nando: Até na areia a planta cresce. Prepare-se!', premio: { forte: 3 }, moedas: 400, revanche: 90 },
    { id: 'pedro', nome: 'Pedro', elemento: 'terra', cor: cor('terra'), niveis: [75, 75], campeao: true,
      equipe: [['L:terra', 75], ['L:terraRaio', 75], ['L:terra', 75], ['L:terra', 75]], fala: 'Pedro: Esta areia é minha. Pra tomar o meu lugar, vai ter que me derrubar!', premio: { forte: 3, supremo: 2 }, moedas: 800, revanche: 100 },
  ],
  // Vila das Cinzas (Vulcânico): os treinadores do Lâmina. A Campeã é a Saphira (Fogo).
  fogo: [
    { id: 'sandy', nome: 'Sandy', elemento: 'luz', cor: cor('luz'), niveis: [55, 55],
      equipe: [['L:luz', 55], ['L:sol', 55], ['L:luz', 55]], fala: 'Sandy: A luz mostra o caminho. Vamos ver o seu!', premio: { forte: 2 }, moedas: 250, revanche: 75 },
    { id: 'brawn', nome: 'Brawn', elemento: 'terra', cor: cor('terra'), niveis: [60, 60],
      equipe: [['L:terra', 60], ['L:terraRaio', 60], ['L:terra', 60]], fala: 'Brawn: Pedra não se quebra fácil. Pode vir!', premio: { forte: 2 }, moedas: 300, revanche: 80 },
    { id: 'blaze', nome: 'Blaze', elemento: 'raio', cor: cor('raio'), niveis: [65, 65],
      equipe: [['L:raio', 65], ['L:raio', 65], ['L:terraRaio', 65]], fala: 'Blaze: Fica esperto. Eu sou mais rápido que um raio!', premio: { forte: 3 }, moedas: 350, revanche: 85 },
    { id: 'sotty', nome: 'Sotty', elemento: 'agua', cor: cor('agua'), niveis: [70, 70],
      equipe: [['L:agua', 70], ['aquaraia', 70], ['L:agua', 70]], fala: 'Sotty: Até no meio do vulcão, a água apaga o fogo. Bora!', premio: { forte: 3 }, moedas: 400, revanche: 90 },
    { id: 'saphira', nome: 'Saphira', elemento: 'fogo', cor: cor('fogo'), niveis: [75, 75], campeao: true, chamada: 'Campeã',
      equipe: [['L:fogo', 75], ['vulcarapa', 75], ['L:fogo', 75], ['L:fogo', 75]], fala: 'Saphira: Esta vila é minha. Só tira de mim quem aguentar o fogo!', premio: { forte: 3, supremo: 2 }, moedas: 800, revanche: 100 },
  ],
};

// Cores de cada vila (paredes, telhado, madeira, chão das ruas, cerca)
const ESTILO = {
  raio:   { parede: '#dfe8f0', telhado: '#5a7aa8', neve: true,  madeira: '#6a5040', rua: '#b8c4d0', cerca: '#7a6450', bandeira: '#ffe066' },
  planta: { parede: '#c8a878', telhado: '#3f7a3a', neve: false, madeira: '#6a4a2c', rua: '#9c8a6a', cerca: '#5a3a24', bandeira: '#5cd65c' },
  terra:  { parede: '#ecd6a4', telhado: '#c27a4e', neve: false, madeira: '#8a6a40', rua: '#c8a670', cerca: '#7a5230', bandeira: '#e0a040' },
  fogo:   { parede: '#5a4a44', telhado: '#2e2220', neve: false, madeira: '#3a2a24', rua: '#6a5a52', cerca: '#3a2a24', bandeira: '#ff6a3d', lava: true },
  agua:   { parede: '#e8dcc0', telhado: '#e8a23a', neve: false, madeira: '#9a7a4a', rua: '#d8c49a', cerca: '#8a6a40', bandeira: '#3db8ff', palafita: true },
};
const PEDRA = '#cbbfa6', AREIA_ARENA = '#e8d6a8', LUZ = '#ffd37a';

// Medidas da arena da vila (menor que a do Reino: 13 m)
export const ARENA_VILA = { x: 0, z: -9, r0: 7, deg: 5, passo: 1.15, sub: 0.6, porta: 0.3 };
const RP = ARENA_VILA.r0 + ARENA_VILA.deg * ARENA_VILA.passo + 0.4; // raio da parede de fora (~13 m)
// As 5 plataformas na areia (a 5ª, do Campeão, no fundo e mais alta)
const PLATAFORMAS = [[-3.9, 2.6, 0.5], [3.6, 1.6, 0.75], [-3.0, -2.4, 1.0], [3.0, -3.0, 1.25], [0, -5.0, 1.6]];
const LOJA = { x: -10, z: 17 };
// as casas olham para o meio da vila (a da frente, para a praça)
const CASAS = [[10, 17], [-19, 8], [19, 8], [-20, -5], [20, -5]].map(([x, z]) => [x, z, Math.atan2(-x, (z > 12 ? 15 : 4) - z)]);

export class Vilas {
  constructor(mundo) {
    this.m = mundo;
    this.lista = VILAS.map((v) => this.criar(v));
  }

  // ---------- montar uma vila ----------
  criar(v) {
    const h = alturaEm(v.x, v.z); // o chão da vila (plano)
    const giro = Math.atan2(-Math.cos(v.ang), -Math.sin(v.ang)); // +z do desenho aponta para o Reino
    const c = Math.cos(giro), s = Math.sin(giro);
    const paraMundo = (lx, lz) => ({ x: v.x + lx * c + lz * s, z: v.z - lx * s + lz * c });
    const vila = { id: v.bioma, nome: NOMES_VILA[v.bioma], x: v.x, z: v.z, r: v.r, h, giro, paraMundo, estilo: ESTILO[v.bioma] };
    const raiz = new THREE.Group();
    raiz.position.set(v.x, h, v.z);
    raiz.rotation.y = giro;
    vila.obst = (lx, lz, r) => { const p = paraMundo(lx, lz); this.m.obstaculos.push({ x: p.x, z: p.z, r, fixo: true }); };
    this.cerca(vila, raiz);
    this.ruas(vila, raiz);
    this.loja(vila, raiz);
    CASAS.forEach(([x, z, rot]) => this.casa(vila, raiz, x, z, rot));
    this.arena(vila, raiz);
    vila.malhas = assar(raiz, this.m.cena);
    // a plateia (o que se mexe) num grupo à parte, que só aparece de perto
    vila.vivo = new THREE.Group();
    vila.vivo.position.copy(raiz.position);
    vila.vivo.rotation.y = giro;
    this.m.cena.add(vila.vivo);
    const A = ARENA_VILA;
    vila.plateia = criarPlateia(vila.vivo, { x: A.x, z: A.z, r0: A.r0 + 0.5, deg: A.deg, passo: A.passo, subida: A.sub, buracos: [[0, A.porta + 0.08]], espaco: 0.95, semente: 31 + ORDEM_VILAS.indexOf(v.bioma) });
    vila.festaT = 0;
    this.nomes(vila);
    vila.vivo.visible = false;
    return vila;
  }

  // Cerca baixa de madeira com 2 entradas (+z: para o Reino; -z: para fora) e um portal em cada
  cerca(vila, g) {
    const E = vila.estilo, R = vila.r - 0.5, ABRE = 2.6 / R;
    const noPortao = (a) => [0, Math.PI].some((e) => Math.abs(Math.atan2(Math.sin(a - e), Math.cos(a - e))) < ABRE);
    const N = 72;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2; // (como no Lathe: 0 = +z, PI/2 = +x)
      const x = Math.sin(a) * R, z = Math.cos(a) * R;
      if (noPortao(a)) continue;
      peca(g, caixa(0.25, 1.3, 0.25), E.cerca, [x, 0.65, z]);
      if (!noPortao(a + Math.PI / N)) peca(g, caixa(0.12, 0.14, (2 * Math.PI * R) / N + 0.1), E.madeira, [Math.sin(a + Math.PI / N) * R, 0.95, Math.cos(a + Math.PI / N) * R], [0, a + Math.PI / N + Math.PI / 2, 0]);
    }
    for (let i = 0; i < 160; i++) { const a = (i / 160) * Math.PI * 2; if (!noPortao(a)) vila.obst(Math.sin(a) * R, Math.cos(a) * R, 0.55); }
    // portais com a bandeirinha da vila e lanternas
    for (const lado of [1, -1]) {
      const z = lado * R;
      for (const x of [-2.4, 2.4]) {
        peca(g, caixa(0.5, 4, 0.5), E.madeira, [x, 2, z]);
        brilho(g, caixa(0.35, 0.4, 0.35), LUZ, [x, 4.25, z]);
        vila.obst(x, z, 0.45);
      }
      peca(g, caixa(5.4, 0.5, 0.4), E.madeira, [0, 3.7, z]);
      duplo(g, caixa(1.6, 0.9, 0.08), E.bandeira, [0, 3.0, z]);
    }
  }

  // A rua da entrada do Reino até a praça (e a praça com uma estátua do elemento)
  ruas(vila, g) {
    const E = vila.estilo;
    peca(g, caixa(4.2, 0.1, 9), E.rua, [0, 0.05, 25.5]);
    peca(g, cil(6, 6, 0.1, 20), E.rua, [0, 0.05, 15]);
    peca(g, caixa(3.4, 0.1, 6), E.rua, [0, 0.05, 6.5]);   // da praça até o túnel da arena
    peca(g, caixa(4.2, 0.1, 6), E.rua, [0, 0.05, -26.5]); // a entrada de fora
    // estátua: base de pedra e um cristal na cor do elemento do bioma
    peca(g, cil(1.4, 1.6, 1, 8), PEDRA, [0, 0.5, 15]);
    brilho(g, new THREE.OctahedronGeometry(0.8, 0), ELEMENTOS[vila.id].cor, [0, 2.1, 15]);
    vila.obst(0, 15, 1.6);
  }

  // Casa simples com a cara do bioma (paredes, telhado, porta e janelas acesas)
  casa(vila, raiz, x, z, rot, larg = 5, fundo = 4.4) {
    const E = vila.estilo, g = new THREE.Group();
    g.position.set(x, 0, z); g.rotation.y = rot; raiz.add(g);
    const y0 = E.palafita ? 0.8 : 0; // no Arquipélago, as casas ficam em cima de estacas
    if (E.palafita) for (const [px, pz] of [[-2, -1.7], [2, -1.7], [-2, 1.7], [2, 1.7]]) peca(g, caixa(0.3, 1, 0.3), E.madeira, [px, 0.5, pz]);
    peca(g, caixa(larg + 0.3, 0.3, fundo + 0.3), E.madeira, [0, y0 + 0.15, 0]);
    peca(g, caixa(larg, 2.6, fundo), E.parede, [0, y0 + 1.6, 0]);
    peca(g, prisma(fundo + 0.8, larg + 0.6, 1.8), E.telhado, [0, y0 + 2.9, 0], [0, Math.PI / 2, 0]);
    if (E.neve) peca(g, prisma(fundo + 0.9, larg + 0.7, 0.5), '#f4f8fc', [0, y0 + 4.25, 0], [0, Math.PI / 2, 0]);
    peca(g, caixa(1.1, 1.8, 0.12), E.madeira, [0, y0 + 1.2, fundo / 2 + 0.02]);
    for (const xx of [-1.6, 1.6]) brilho(g, caixa(0.8, 0.7, 0.1), E.lava ? '#ff8a3a' : LUZ, [xx, y0 + 1.8, fundo / 2 + 0.03]);
    const c = Math.cos(rot), s = Math.sin(rot);
    for (const [ox, oz] of [[-1.5, 0], [1.5, 0]]) vila.obst(x + ox * c + oz * s, z - ox * s + oz * c, 2.3);
  }

  // A Loja de Poções: uma casa com a barraca listrada na frente (encoste na barraca para comprar)
  loja(vila, raiz) {
    const E = vila.estilo;
    this.casa(vila, raiz, LOJA.x, LOJA.z, Math.PI / 2 + 0.6, 6, 5);
    const b = new THREE.Group(); b.position.set(LOJA.x + 4.2, 0, LOJA.z - 2.2); b.rotation.y = Math.PI / 2 + 0.6; raiz.add(b);
    peca(b, caixa(2.6, 1, 1), E.madeira, [0, 0.5, 0]);
    for (const xx of [-1.25, 1.25]) peca(b, caixa(0.12, 2.4, 0.12), E.madeira, [xx, 1.2, -0.4]);
    for (let i = 0; i < 6; i++) duplo(b, caixa(0.46, 0.08, 1.4), i % 2 ? '#ffffff' : E.bandeira, [-1.15 + i * 0.46, 2.4, -0.1], [0.3, 0, 0]);
    brilho(b, cil(0.14, 0.14, 0.4, 6), '#e8474a', [-0.6, 1.2, 0]);
    brilho(b, cil(0.14, 0.14, 0.4, 6), '#ffd23f', [0.6, 1.2, 0]);
    vila.obst(LOJA.x + 4.2, LOJA.z - 2.2, 1.2);
    // onde o jogador fica para comprar (na frente da barraca)
    const c = Math.cos(b.rotation.y), s = Math.sin(b.rotation.y);
    vila.loja = { ...vila.paraMundo(b.position.x + 1.7 * s, b.position.z + 1.7 * c), nome: vila.nome };
  }

  // A arena (coliseu menor, 13 m): arquibancada em degraus, parede de fora, túnel e as 5 plataformas
  arena(vila, raiz) {
    const A = ARENA_VILA, E = vila.estilo, g = new THREE.Group();
    g.position.set(A.x, 0, A.z); raiz.add(g);
    const pts = [new THREE.Vector2(A.r0, 0)];
    for (let i = 0; i < A.deg; i++) { pts.push(new THREE.Vector2(A.r0 + i * A.passo, A.sub * (i + 1))); pts.push(new THREE.Vector2(A.r0 + (i + 1) * A.passo, A.sub * (i + 1))); }
    const R = A.r0 + A.deg * A.passo, H = A.sub * A.deg;
    pts.push(new THREE.Vector2(R, H + 1.2), new THREE.Vector2(RP, H + 1.2), new THREE.Vector2(RP, 0));
    // (no Lathe o ângulo 0 aponta para +z: o túnel do portão, virado para a praça)
    duplo(g, new THREE.LatheGeometry(pts, 28, A.porta, Math.PI * 2 - 2 * A.porta), PEDRA);
    // faixa na cor da vila em cima da parede
    duplo(g, new THREE.LatheGeometry([new THREE.Vector2(RP + 0.02, H + 0.6), new THREE.Vector2(RP + 0.02, H + 1.2)], 28, A.porta, Math.PI * 2 - 2 * A.porta), E.telhado);
    // areia
    peca(g, cil(A.r0 + 0.2, A.r0 + 0.2, 0.1, 24), AREIA_ARENA, [0, 0.06, 0]);
    // túnel do portão: 2 paredes e o arco com a bandeira
    const zt = (A.r0 + RP) / 2, comp = RP - A.r0 + 0.6, xT = Math.sin(A.porta) * A.r0;
    for (const lado of [-1, 1]) {
      peca(g, caixa(0.6, H + 1.2, comp), PEDRA, [lado * (xT + 0.3), (H + 1.2) / 2, zt]);
      for (let k = 0; k <= 4; k++) vila.obst(A.x + lado * (xT + 0.3), A.z + A.r0 + (k / 4) * (RP - A.r0), 0.6);
    }
    peca(g, caixa(xT * 2 + 1.2, 0.8, 0.8), PEDRA, [0, H + 1.6, RP]);
    duplo(g, caixa(1.8, 1, 0.08), E.bandeira, [0, H + 0.6, RP + 0.45]);
    // colisão: a arquibancada (por fora e pela areia), menos o túnel
    const fora = (a) => Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < A.porta;
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2; if (fora(a)) continue;
      vila.obst(A.x + Math.sin(a) * (RP + 0.2), A.z + Math.cos(a) * (RP + 0.2), 0.7);
      vila.obst(A.x + Math.sin(a) * (A.r0 + 0.5), A.z + Math.cos(a) * (A.r0 + 0.5), 0.6);
    }
    // as 5 plataformas (a do Campeão é dourada e mais alta)
    vila.plataformas = PLATAFORMAS.map(([x, z, alt], i) => {
      const campeao = i === PLATAFORMAS.length - 1;
      peca(g, cil(1.25, 1.45, alt, 10), PEDRA, [x, alt / 2, z]);
      peca(g, cil(1.3, 1.3, 0.12, 10), campeao ? '#ffd23f' : E.madeira, [x, alt + 0.06, z]);
      peca(g, cil(0.05, 0.05, 2.4, 4), E.madeira, [x + 1, alt + 1.2, z - 0.6]);
      const tr = TREINADORES_VILA[vila.id][i];
      duplo(g, caixa(0.05, 0.7, 0.9), tr ? tr.cor : campeao ? ELEMENTOS[vila.id].cor : '#9a9a9a', [x + 1, alt + 2.05, z - 0.15]);
      if (tr) { // o treinador em cima da plataforma, de frente para o túnel
        brilho(g, cil(1.32, 1.32, 0.06, 10), tr.cor, [x, alt + 0.1, z]);
        desenharTreinador(g, tr.id, [x, alt + 0.13, z], Math.atan2(-x, 7 - z));
      }
      vila.obst(A.x + x, A.z + z, 1.5);
      // a frente da plataforma (virada para o túnel) é onde o jogador encosta para falar
      const d = Math.hypot(x, z - 7) || 1, fx = x + (-x / d) * 1.9, fz = z + ((7 - z) / d) * 1.9;
      // (a placa com o nível fica acima do nome que está em cima da cabeça)
      return { frente: vila.paraMundo(A.x + fx, A.z + fz), topo: { ...vila.paraMundo(A.x + x, A.z + z), y: vila.h + alt + (tr ? (campeao ? 2.85 : 2.55) : 1.9) }, campeao, armado: true };
    });
  }

  // O nome de cada treinador em cima da cabeça (e uma coroa dourada no Campeão).
  // Ficam no grupo "vivo" da vila: só aparecem quando você está perto.
  nomes(vila) {
    const A = ARENA_VILA;
    TREINADORES_VILA[vila.id].forEach((tr, i) => {
      const [x, z, alt] = PLATAFORMAS[i], base = alt + 0.13;
      if (tr.campeao) {
        const coroa = criarCoroa(1.15);
        coroa.position.set(A.x + x, base + 1.68, A.z + z);
        vila.vivo.add(coroa);
      }
      const placa = placaDeNome(tr.nome, tr.cor, !!tr.campeao);
      placa.position.set(A.x + x, base + (tr.campeao ? 2.3 : 2.0), A.z + z);
      vila.vivo.add(placa);
    });
  }

  // ---------- consultas ----------
  // A vila em que o ponto está (folga = metros a mais em volta)
  vilaEm(x, z, folga = 0) {
    for (const v of this.lista) if (Math.hypot(x - v.x, z - v.z) < v.r + folga) return v;
    return null;
  }
  vila(id) { return this.lista.find((v) => v.id === id); }
  // O jogador está dentro da arena de uma vila (no túnel ou na areia)? A câmera chega mais perto lá dentro.
  dentroArena(x, z) {
    const v = this.vilaEm(x, z);
    if (!v) return false;
    const c = v.paraMundo(ARENA_VILA.x, ARENA_VILA.z);
    return Math.hypot(x - c.x, z - c.z) < RP + 1;
  }
  get lojas() { return this.lista.map((v) => v.loja); }

  // A plataforma mais perto (até 8 m) da vila onde o jogador está
  treinadorPerto(x, z) {
    const v = this.vilaEm(x, z);
    if (!v) return null;
    let melhor = null, md = 8;
    v.plataformas.forEach((p, i) => {
      const dc = Math.hypot(x - p.topo.x, z - p.topo.z);
      if (dc < md) { md = dc; melhor = { vila: v, i, tr: TREINADORES_VILA[v.id][i] || null, d: Math.hypot(x - p.frente.x, z - p.frente.z), topo: p.topo, p }; }
      if (!p.armado && Math.hypot(x - p.frente.x, z - p.frente.z) > 3) p.armado = true;
    });
    return melhor;
  }

  // A plateia pula por alguns segundos (quando você vence alguém na arena da vila)
  festa(id, seg) { const v = this.vila(id); if (v) v.festaT = Math.max(v.festaT, seg); }

  // Quadro a quadro: a plateia só existe na tela de perto (e só se mexe na festa)
  atualizar(dt, t) {
    const m = this.m;
    for (const v of this.lista) {
      const perto = Math.hypot(m.pos.x - v.x, m.pos.z - v.z) < v.r + 45;
      v.vivo.visible = perto;
      if (!perto) continue;
      if (v.festaT > 0 || v.plateia.pulando) {
        v.festaT = Math.max(0, v.festaT - dt);
        animarPlateia(v.plateia, v.festaT, t);
      }
    }
  }
}

// Uma plaquinha com o nome (sempre virada para a câmera): fundo escuro, borda na cor do elemento.
// O nome do Campeão fica dourado.
function placaDeNome(nome, cor, campeao) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const c = cv.getContext('2d');
  c.font = 'bold 34px system-ui, sans-serif';
  const w = Math.min(244, c.measureText(nome).width + 40), x0 = (256 - w) / 2;
  c.fillStyle = 'rgba(16, 20, 36, 0.82)'; c.strokeStyle = cor; c.lineWidth = 5;
  c.beginPath(); if (c.roundRect) c.roundRect(x0, 8, w, 48, 24); else c.rect(x0, 8, w, 48); c.fill(); c.stroke();
  c.fillStyle = campeao ? '#ffd23f' : '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(nome, 128, 33);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.scale.set(2.3, 0.575, 1);
  return sp;
}

// O ponto de saída da arena de uma vila (pelo túnel, de costas para a arena)
export function saidaDaArena(v) {
  const fora = v.paraMundo(ARENA_VILA.x, ARENA_VILA.z + RP + 4), dentro = v.paraMundo(ARENA_VILA.x, ARENA_VILA.z);
  return { ...fora, ang: Math.atan2(fora.x - dentro.x, fora.z - dentro.z) };
}
// (para não haver água dentro da vila: o chão é plano e acima da água)
export const ALTURA_MINIMA_VILA = NIVEL_AGUA + 0.9;
