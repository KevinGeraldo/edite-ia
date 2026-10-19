// node rend.js preview T1,T2,...  |  node rend.js all [workers]
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('puppeteer-core');
const DIR = __dirname, TOTAL = 81 * 60;
const srv = http.createServer((q, r) => { const p = path.join(DIR, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': p.endsWith('.html') ? 'text/html' : 'image/jpeg' }); r.end(d); }); }).listen(0);
(async () => {
  const port = srv.address().port, [mode, arg] = process.argv.slice(2);
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--force-color-profile=srgb'] });
  const mk = async () => { const p = await browser.newPage(); await p.setViewport({ width: 1920, height: 1080 }); await p.goto(`http://127.0.0.1:${port}/comp.html`); await p.evaluate(() => window.ready); return p; };
  if (mode === 'preview') {
    const p = await mk(); fs.mkdirSync(path.join(DIR, 'prev'), { recursive: true });
    for (const t of arg.split(',')) { const b = await p.evaluate(k => renderFrame(k), Math.round(+t * 60)); fs.writeFileSync(path.join(DIR, 'prev', `p_${t}.jpg`), Buffer.from(b, 'base64')); }
  } else {
    const N = +(arg || 4); fs.mkdirSync(path.join(DIR, 'out'), { recursive: true });
    const per = Math.ceil(TOTAL / N); let done = 0; const t0 = Date.now();
    await Promise.all([...Array(N)].map(async (_, w) => {
      const p = await mk();
      for (let k = w * per; k < Math.min(TOTAL, (w + 1) * per); k++) {
        const f = path.join(DIR, 'out', `o_${String(k).padStart(5, '0')}.jpg`);
        if (fs.existsSync(f)) { done++; continue; }
        fs.writeFileSync(f, Buffer.from(await p.evaluate(k => renderFrame(k), k), 'base64'));
        if (++done % 200 === 0) console.log(done, '/', TOTAL, ((Date.now() - t0) / 1000).toFixed(0) + 's');
      }
    }));
  }
  await browser.close(); srv.close();
})();
