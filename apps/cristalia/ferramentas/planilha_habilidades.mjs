// Gera a tabela de golpes e velocidades (JSON) que vai para a planilha "Habilidades do Cristalia" do Lâmina.
// Serve também para comparar a planilha editada com o jogo. Uso: node ferramentas/planilha_habilidades.mjs $PWD > golpes.json
const raiz = process.argv[2];
const D = await import(raiz + '/js/dados.js');
const ARQ = { fogo:'brasito', agua:'gotinho', planta:'musguinho', terra:'pedrisco', raio:'faisquinho', sol:'solito', lua:'lunico', luz:'lumino', trevas:'trevas', terraRaio:'imanito', fogoPlanta:'brotobrasa', aguaFogo:'vaporito', vulcarapa:'vulcarapa', aquaraia:'aquaraia', espinhal:'espinhal', ignarion:'ignarion', silvarion:'silvarion' };
const NOME_LINHA = { fogo:'Brasito (Fogo)', agua:'Gotinho (Água)', planta:'Musguinho (Planta)', terra:'Pedrisco (Terra)', raio:'Faisquinho (Raio)', sol:'Solito (Sol)', lua:'Lunico (Lua)', luz:'Lumino (Luz)', trevas:'Breuzinho (Trevas)', terraRaio:'Imanito (Terra + Raio)', fogoPlanta:'Brotobrasa (Fogo + Planta)', aguaFogo:'Vaporito (Água + Fogo)', vulcarapa:'Vulcarapa (raro, Fogo)', aquaraia:'Aquaraia (raro, Água)', espinhal:'Espinhal (raro, Planta)', ignarion:'Ignárion (lendário)', silvarion:'Silvárion (lendário)' };
const POS = ['Perto', 'Disparo', 'Área'];
const TIPO = { corpo:'perto', projetil:'disparo', area:'área' };
const textos = {};
for (const [l, a] of Object.entries(ARQ)) {
  const m = await import(`${raiz}/js/habilidades/${a}.js`);
  const k = Object.keys(m).find(x => x.startsWith('TEXTOS_')); textos[l] = k ? m[k] : [];
}
const num = (v) => typeof v === 'number' ? String(+v.toFixed(3)).replace('.', ',') : v;
function efeitos(g) {
  const fora = new Set(['nome','elemento','tipo','poder','recarga','alcance']);
  const partes = [];
  for (const [k, v] of Object.entries(g)) {
    if (fora.has(k)) continue;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const sub = Object.entries(v).map(([a, b]) => b && typeof b === 'object' && !Array.isArray(b)
        ? `${a}={${Object.entries(b).map(([c, d]) => `${c}=${num(d)}`).join('; ')}}` : `${a}=${Array.isArray(b) ? b.map(num).join('/') : num(b)}`);
      partes.push(`${k}: ${sub.join('; ')}`);
    } else partes.push(`${k}=${Array.isArray(v) ? v.map(num).join('/') : num(v)}`);
  }
  return partes.join(' | ');
}
const ordemLinhas = Object.keys(ARQ);
const linhas = {}; // golpe -> info
for (const [id, e] of Object.entries(D.ESPECIES)) {
  e.golpes.forEach((g, slot) => {
    const L = e.linha, chave = L + '|' + g;
    const r = linhas[chave] ??= { L, g, formas: [], estagio: e.estagio, slot };
    r.formas.push(`${e.nome}`); r.estagio = Math.min(r.estagio, e.estagio);
  });
}
const lista = Object.values(linhas).sort((a, b) => ordemLinhas.indexOf(a.L) - ordemLinhas.indexOf(b.L) || a.estagio - b.estagio || a.slot - b.slot);
const out = lista.map(({ L, g, formas, estagio, slot }) => {
  const G = D.GOLPES[g];
  const nomeBase = G.nome.toLowerCase();
  let desc = '';
  const T = textos[L] || []; const ordem = [...Array(T.length).keys()].filter(i => i <= estagio).reverse().concat([...Array(T.length).keys()].filter(i => i > estagio));
  for (const i of ordem) { if (desc) break;
    const t = (textos[L][i] || []).find(x => x.toLowerCase().startsWith(nomeBase)) || (textos[L][i] || []).find(x => x.toLowerCase().includes(nomeBase));
    if (t) desc = t;
  }
  if (!desc && g === 'investida') desc = 'Investida: avança e bate de perto.';
  return { linha: NOME_LINHA[L], formas: formas.join(', '), posicao: POS[slot], golpe: G.nome, tipo: TIPO[G.tipo] ?? G.tipo, elemento: D.ELEMENTOS[G.elemento]?.nome ?? G.elemento,
    poder: G.poder ?? '', recarga: G.recarga ?? '', alcance: G.alcance ?? '', efeitos: efeitos(G), descricao: desc, codigo: g };
});
const vel = Object.entries(D.ESPECIES).sort((a, b) => ordemLinhas.indexOf(a[1].linha) - ordemLinhas.indexOf(b[1].linha) || a[1].estagio - b[1].estagio).map(([id, e]) => ({
  linha: NOME_LINHA[e.linha], monstro: e.nome, forma: e.estagio + 1, vel1: +D.statsDe(id, 1).vel.toFixed(2), vel35: +D.statsDe(id, 35).vel.toFixed(2), ajuste: D.AJUSTE_VELOCIDADE[id] ?? 1, codigo: id }));
console.log(JSON.stringify({ golpes: out, vel }));
