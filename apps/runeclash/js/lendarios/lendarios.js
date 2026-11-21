// =============================================================
// LENDÁRIOS NO MAPA (etapa 5.4)
// Os chefes da Arena das Brasas viram os lendários do Runeclash: cada um mora num lugar fixo
// do mapa, fica parado esperando (encoste para lutar), luta com as regras de chefe (entra em
// FÚRIA com metade da vida) e só é selado com a Pedra Dourada, com chance baixa.
// Vencido ou selado, volta no próximo amanhecer (como os chefes das dungeons).
// Hoje: a Serpe da Tormenta, no círculo de pedra rúnico da Neve, o Colosso de Basalto, no do Deserto,
// a Sentinela de Geada, na frente do Cristal Gigante da Neve, e o Arauto das Cinzas, atrás do altar de selo da Lava.
// =============================================================
import { ESPECIES, criarMonstro, nivelDoChefe } from '../dados.js';
import { criarModelo, criarCoroa } from '../modelos.js';
import { POIS } from '../mapa/gerador.js';
import { alturaEm } from '../mapa/altura.js';

// especie | onde mora (o ponto de interesse e o bioma; frente = quantos metros na frente dele, olhando para fora;
// negativo = atrás, olhando por cima dele)
// lugar = nome mostrado | zona = arena da luta
export const LENDARIOS = [
  { especie: 'serpe', poi: 'circulo', bioma: 'raio', lugar: 'Círculo da Tormenta', zona: 'raio' },
  { especie: 'colosso', poi: 'circulo', bioma: 'terra', lugar: 'Círculo das Dunas', zona: 'terra' },
  { especie: 'geada', poi: 'cristalGelo', frente: 5, lugar: 'Cristal Gigante', zona: 'raio' },
  { especie: 'arauto', poi: 'altar', bioma: 'fogo', frente: -2.2, lugar: 'Altar das Cinzas', zona: 'fogo' },
];

// O ponto do mapa onde o lendário mora (ou null)
export function casaDoLendario(cfg) {
  const p = POIS.find((q) => q.tipo === cfg.poi && (!cfg.bioma || q.bioma === cfg.bioma));
  if (!p) return null;
  if (!cfg.frente) return { x: p.x, z: p.z, ang: p.ang, r: p.r, giro: p.ang + Math.PI };
  const dx = Math.cos(p.ang), dz = Math.sin(p.ang);
  return { x: p.x + dx * cfg.frente, z: p.z + dz * cfg.frente, ang: p.ang, r: p.r - cfg.frente, giro: Math.atan2(dx, dz) };
}

export class Lendarios {
  constructor(mundo) {
    this.m = mundo;
    this.lista = LENDARIOS.map((cfg) => ({ cfg, casa: casaDoLendario(cfg), s: null, espera: false, periodoVisto: null, avisado: false }));
  }

  aparecer(l) {
    const m = this.m, id = l.cfg.especie, esp = ESPECIES[id];
    const dados = criarMonstro(id, nivelDoChefe(m.mediaEquipe()));
    const modelo = criarModelo(id);
    const coroa = criarCoroa(1.6);
    coroa.position.y = esp.altura + 0.4;
    modelo.add(coroa);
    const { x, z } = l.casa;
    const ang = l.casa.giro; // olhando para a entrada do círculo (ou para fora do lugar)
    modelo.position.set(x, alturaEm(x, z), z);
    modelo.rotation.y = ang;
    m.cena.add(modelo);
    l.s = { dados, modelo, chefe: true, lendario: true, fixo: true, x, z, ang, estado: 'parado', t: 99, zona: l.cfg.zona, periodo: null, vel: 0 };
    m.selvagens.push(l.s);
  }

  // GM: volta agora (se tinha sido vencido)
  voltar(especie) {
    const l = this.lista.find((x) => x.cfg.especie === especie);
    if (!l || l.s) return false;
    l.espera = false;
    this.aparecer(l);
    return true;
  }

  atualizar() {
    const m = this.m;
    for (const l of this.lista) {
      if (!l.casa) continue;
      if (l.s && !m.selvagens.includes(l.s)) {
        // vencido ou selado: volta no próximo amanhecer. (Se sumiu por outro motivo, volta já.)
        l.espera = !!l.s.vencido;
        l.periodoVisto = m.periodo;
        l.s = null;
      }
      if (!l.s && l.espera && m.periodo !== l.periodoVisto) {
        l.periodoVisto = m.periodo;
        if (m.periodo === 'dia') {
          l.espera = false;
          this.aparecer(l);
          if (m.jogo.estado) m.jogo.aviso(`${ESPECIES[l.cfg.especie].nome} voltou ao ${l.cfg.lugar}.`);
        }
      }
      if (!l.s && !l.espera) this.aparecer(l);
      // aviso quando o jogador chega perto do lugar
      const d = Math.hypot(m.pos.x - l.casa.x, m.pos.z - l.casa.z);
      if (d < 26 && !l.avisado && m.jogo.estado) {
        l.avisado = true;
        const nome = ESPECIES[l.cfg.especie].nome;
        m.jogo.mostrarZona?.(l.cfg.lugar);
        m.jogo.aviso(l.s ? `Lendário: ${nome} (Nv.${l.s.dados.nivel}) guarda o ${l.cfg.lugar}. Só a Pedra Dourada sela um lendário.` : `O ${l.cfg.lugar} está vazio. ${nome} volta no próximo amanhecer.`);
      } else if (d > 40) l.avisado = false;
    }
  }
}
// (a animação do lendário parado é feita junto com os outros selvagens, em mundo.js)
