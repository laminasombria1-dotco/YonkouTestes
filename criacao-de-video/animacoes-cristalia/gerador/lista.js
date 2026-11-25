const fs = require('fs'); const S = __dirname;
global.window = {}; eval(fs.readFileSync(S + '/familias.js', 'utf8')); const F = window.FAMILIAS;
const inv = JSON.parse(fs.readFileSync(S + '/inventario.json'));
const GRUPO = {
  quadrupede: 'brasito brasalobo fornalobo magmalobo sombrelo umbrafel noctifero solario solaurum astrorei silvarion bosquarion raizarion ancestrarion ignarion pirarion',
  gelatina: 'gotinho marolo marulhao tsunamar vaporito fumarolo caldeirax',
  bolinha: 'solito lunico lunarelo brotobrasa chamafolha imanito magnetito espinhal cactourico espinhaco pedrisco',
  tronco: 'musguinho moitao troncudo florestral ardentroco florinferno mandacarao',
  bipede: 'cascalhao rochedrao montanhar ferrovolt titanvolt crescentio plenilunio magmarion infernarion',
  passaro: 'faisquinho choquilho trovolt tempestor',
  voador: 'lumino lumelo prismal aurealis breuzinho',
  raia: 'aquaraia ventaraia mantare leviaraia',
  tartaruga: 'vulcarapa basaltuga crateruga colossarapa geiserao',
};
const CLIPE = { quadrupede: '01_brasito.mp4', gelatina: '02_gelatina.mp4', bolinha: '03_bolinha.mp4', tronco: '04_tronco.mp4', bipede: '05_bipede.mp4', passaro: '06_passaro.mp4', voador: '07_voador.mp4', raia: '08_raia.mp4', tartaruga: '09_tartaruga.mp4' };
const NOMEG = { quadrupede: 'Quadrúpede', gelatina: 'Gelatina', bolinha: 'Bolinha com pezinhos', tronco: 'Tronco / bloco', bipede: 'Bípede', passaro: 'Pássaro', voador: 'Voador sem pernas', raia: 'Raia', tartaruga: 'Tartaruga' };
const grupoDe = {}; for (const [g, l] of Object.entries(GRUPO)) for (const id of l.split(' ')) grupoDe[id] = g;
const EXTRA = { brasito: '**Já tem 8 animações do Blender** (`brasito.glb`)', ignarion: '+ fazer as **asas batendo** (o clipe não tem asas)', pirarion: '+ asas batendo; pescoço longo', silvarion: 'cervo: pernas mais compridas que o Brasito', magmarion: 'já tem pernas e braços que andam no código', infernarion: 'já tem pernas e braços que andam no código; + asas', plenilunio: 'já tem pernas e braços que andam no código', espinhal: 'golpe perto especial: **rola** como bola (o código já gira)', vaporito: 'golpe área especial: **esconde no casco**', caldeirax: 'tem perninhas: pode usar o pulinho da gelatina', mandacarao: 'na luta, a flor abre (o código já faz)', aquaraia: 'golpes especiais: rasante e mergulho (o código já move)', breuzinho: 'bola que flutua', pedrisco: 'pedra com pés quadrados', geiserao: 'casco com gêiser em cima' };
function hoje(x) {
  if (x.id === 'brasito') return 'Parado, Parado_Ansioso, Andar, Arrancada, Correndo, Investida, LançaChamas, Rabo de Fogo';
  const t = [x.voa ? 'flutua subindo e descendo' : x.gel ? 'estica e achata (gelatina)' : x.pernas ? 'pernas e braços andam' : 'sobe e desce ao andar'];
  const c = (n, um, v) => n ? t.push(`${n} ${n > 1 ? v : um}`) : 0;
  c(x.caudas, 'rabo balança', 'rabos balançam'); c(x.asas, 'asa bate', 'asas batem'); c(x.giros, 'peça gira', 'peças giram');
  c(x.orbitas, 'peça em órbita', 'peças em órbita'); c(x.pulsos, 'peça pulsa', 'peças pulsam'); c(x.fumacas, 'fumaça sobe', 'fumaças sobem');
  return t.join(', ');
}
let md = `# Animações dos monstros do Cristalia\n\n`;
md += `Tem **${inv.length} monstros** no jogo. **Só o Brasito** (a primeira forma do Fogo) tem animações de verdade, feitas no Blender (8 animações). Os outros ${inv.length - 1} se mexem **só pelo código**: o corpo inteiro sobe e desce, e algumas peças soltas (rabos, asas, coisas em órbita) balançam. Nos golpes, quem mexe é o jogo (empurra o monstro, gira, pisca).\n\n`;
md += `Por isso separei os monstros em **9 tipos de corpo**. Cada tipo tem **um clipe** de referência. Onde a coluna diz *"use o clipe X"*, é aquele que já foi feito: o mesmo movimento serve, só muda o modelo.\n\n`;
md += `## Os 9 clipes\n\n| Clipe | Tipo de corpo | Exemplo no clipe | Quantos monstros usam |\n|---|---|---|---|\n`;
for (const g of Object.keys(GRUPO)) md += `| \`${CLIPE[g]}\` | ${NOMEG[g]} | ${g === 'quadrupede' ? 'Brasito (.glb)' : inv.find((x) => x.id === F[g].rep).nome} | ${GRUPO[g].split(' ').length} |\n`;
md += `\nCada clipe mostra, um depois do outro: **Parado, Andar, Correr, Golpe perto, Golpe disparo, Golpe área, Levar dano e Desmaiar**. (O do Brasito mostra as 8 animações que já existem no arquivo.)\n\n`;
md += `**Como ler o clipe:** à esquerda a vista 3/4, à direita a vista de lado (frente para a direita). Embaixo: o nome do movimento, o **quadro** (24 por segundo, igual ao Brasito) e a linha do tempo. Os **risquinhos amarelos** são os quadros-chave (keyframes). A **bolinha vermelha** é o quadro em que o golpe "sai" (no jogo, é aí que o dano acontece). A bolinha amarela que voa é o disparo, e o anel amarelo no chão é o golpe de área.\n\n`;
md += `## Todos os monstros\n\n| # | Monstro | Linha | Forma | Tipo de corpo | Animação hoje no jogo | O que fazer no Blender |\n|---|---|---|---|---|---|---|\n`;
inv.forEach((x, i) => {
  const g = grupoDe[x.id];
  const faz = x.id === 'brasito' ? 'Nada: já está pronto' : `Use o clipe \`${CLIPE[g]}\`` + (EXTRA[x.id] ? ` — ${EXTRA[x.id]}` : '');
  md += `| ${i + 1} | **${x.nome}** | ${({fogo:'Fogo',agua:'Água',planta:'Planta',terra:'Terra',raio:'Raio',sol:'Sol',lua:'Lua',luz:'Luz',trevas:'Trevas',fogoPlanta:'Fogo + Planta',aguaFogo:'Água + Fogo',terraRaio:'Terra + Raio',vulcarapa:'Raro (Fogo)',aquaraia:'Raro (Água)',espinhal:'Raro (Planta)',ignarion:'Lendário (Ígneo)',silvarion:'Lendário (Silvestre)'})[x.linha]} | ${x.est + 1}ª | ${NOMEG[g]} | ${x.id === 'brasito' ? EXTRA.brasito + ': ' : ''}${hoje(x)} | ${faz} |\n`;
});
md += `\n## Tabelas de quadros-chave (para copiar no Blender)\n\nCada linha é um **canal** (o que mexe) e cada par é \`quadro: valor\`. Faça no **objeto inteiro** (ou no osso raiz, \`root\`), com a interpolação **Bézier** (a padrão do Blender).\n\n- **px, py, pz** = posição em metros (pz positivo = para a frente, py = para cima). Medidas para um monstro de ~1,6 m; para os maiores, aumente na mesma proporção.\n- **rx, ry, rz** = giro em graus (rx positivo = inclina para a frente; ry = vira; rz = tomba de lado). **Atenção:** no Blender o "para cima" é o Z, então o **py daqui é o Z de lá**, e o pz daqui é o -Y de lá.\n- **sx, sy, sz** = escala (1 = normal; sy é a altura).\n- **pernas / braços** (só bípede) = giro das pernas e braços em graus, para trás positivo. \`pernas\` e \`bracos\` alternam (uma vai, a outra volta); \`pernas2\` e \`bracos2\` mexem as duas juntas; \`bD\` = braço direito, \`bE\` = braço esquerdo.\n- **Golpe sai** = o quadro do dano. Se repete (loop), o último quadro é igual ao primeiro.\n\n`;
for (const [g, fam] of Object.entries(F)) {
  md += `### ${fam.nome} — \`${CLIPE[g]}\`\n\n`;
  for (const e of fam.estados) {
    md += `**${e.nome}** — ${e.q} quadros (${(e.q / 24).toFixed(2).replace('.', ',')} s)${e.loop ? ', repete' : ''}${(e.ev || []).filter((v) => v.t !== 'dano').map((v) => `, golpe sai no quadro ${v.f}`).join('')}\n\n`;
    for (const [ch, ks] of Object.entries(e.k)) md += `- \`${ch}\`: ${ks.map(([f, v]) => `${f}: ${typeof v === 'number' ? +v.toFixed(2) : 'chão'}`).join(' · ')}\n`;
    md += '\n';
  }
}
md += `## Dicas para fazer no Blender\n\n1. **Um tipo de corpo de cada vez.** Comece pela Gelatina (só escala e posição, sem ossos) e pelos Quadrúpedes (já tem o Brasito pronto para copiar).\n2. **Use os mesmos nomes** das animações do Brasito (ex.: \`Gotinho_Parado\`, \`Gotinho_Investida\`), assim fica fácil ligar no jogo depois (\`ARQUIVOS\` em \`js/modelos3d.js\`).\n3. **Golpe perto no lugar:** o jogo já empurra o monstro para a frente. Faça o avanço pequeno (como no clipe) ou tire o avanço do osso \`root\`, como foi feito no Brasito.\n4. **Exporte em .glb** com 24 quadros por segundo e os pés em y = 0, olhando para +Z (o padrão do Brasito).\n5. Lembre do celular: **poucos ossos** (o Brasito tem 20) e texturas de 1024.\n`;
fs.writeFileSync(S + '/clipes/LISTA_DE_ANIMACOES.md', md);
console.log(md.length, Object.keys(grupoDe).length);
