const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const S = __dirname;
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.route('**/estudio.html', r => r.fulfill({ body: fs.readFileSync(S + '/estudio.html'), contentType: 'text/html' }));
  await p.route('**/familias.js', r => r.fulfill({ body: fs.readFileSync(S + '/familias.js'), contentType: 'text/javascript' }));
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.goto('http://localhost:8765/estudio.html');
  await p.waitForFunction(() => window.pronto);
  const lista = process.argv.slice(2);
  const so = process.env.SO; // só uma foto de teste
  for (const [n, fam] of lista.entries()) {
    const total = await p.evaluate((f) => preparar(f), fam);
    const dir = `${S}/quadros/${fam}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const idx = so ? so.split(',').map(Number) : [...Array(total).keys()];
    for (const i of idx) {
      const url = await p.evaluate((i) => quadro(i), i);
      fs.writeFileSync(`${dir}/${String(i).padStart(4, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    }
    if (!so) {
      execSync(`ffmpeg -y -loglevel error -framerate 24 -i ${dir}/%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 23 -movflags +faststart ${S}/clipes/${String(n + 1).padStart(2,'0')}_${fam}.mp4`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
    console.log(fam, total, 'quadros');
  }
  await b.close();
})();
