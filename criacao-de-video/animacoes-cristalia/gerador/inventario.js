const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage();
  await p.route('**/estudio.html', r => r.fulfill({ body: fs.readFileSync(process.argv[2]), contentType: 'text/html' }));
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.goto('http://localhost:8765/estudio.html');
  await p.waitForFunction(() => window.pronto);
  const r = await p.evaluate(() => {
    const out = [];
    for (const [id, esp] of Object.entries(D.ESPECIES)) {
      const m = M.criarModelo(id); const u = m.userData;
      const box = new THREE.Box3().setFromObject(u.corpo);
      out.push({ id, nome: esp.nome, linha: esp.linha, est: esp.estagio, raro: !!esp.raro, dupla: !!esp.dupla,
        voa: !!u.voa, gel: !!u.gelatina, pernas: !!u.pernas, caudas: u.caudas.length, asas: u.asas.length, giros: u.giros.length,
        orbitas: u.orbitas.length, pulsos: u.pulsos.length, fumacas: u.fumacas.length, alt: +(box.max.y-box.min.y).toFixed(2) });
    }
    return out;
  });
  fs.writeFileSync(process.argv[3], JSON.stringify(r, null, 1));
  console.log(r.length); for (const x of r) console.log(Object.values(x).join(' | '));
  await b.close();
})();
