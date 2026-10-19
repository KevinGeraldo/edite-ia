// Renderiza uma página com window.seek(t) em vídeo.
//
//   node tools/render.mjs projetos/x/index.html --dur 15 --fps 60 --out projetos/x/out/final.mp4
//   node tools/render.mjs projetos/x/index.html --preview 0.5,2,4.2      (PNGs para olhar)
//
// Opções: --w 1080 --h 1920 --fps 60 --dur 10 --sub 1 (subquadros p/ motion blur)
//         --workers 4 --crf 16 --audio trilha.wav --from 0 --to dur --jpg (mais leve)
//         --dom (captura a página inteira em vez do <canvas>, para cenas em HTML/CSS)
//
// Contrato da página: window.seek(t) desenha o quadro t (pode ser async);
// window.ready (opcional) é uma Promise para fontes/imagens; um <canvas id="c">
// ou o primeiro <canvas> é capturado. A raiz do projeto é servida por HTTP, então
// a página pode importar ../../lib/motion.js.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const page_ = argv.find(a => !a.startsWith('--') && /\.html?$/.test(a));
if (!page_) { console.error('uso: node tools/render.mjs <pagina.html> [opções]'); process.exit(1); }
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const W = +opt('w', 1080), H = +opt('h', 1920), FPS = +opt('fps', 60), DUR = +opt('dur', 10), SUB = +opt('sub', 1);
const WORKERS = +opt('workers', Math.max(2, Math.min(6, os.cpus().length - 2))), CRF = opt('crf', '16');
const FROM = +opt('from', 0), TO = +opt('to', DUR), JPG = !!opt('jpg', false), DOM = !!opt('dom', false);
const pageAbs = path.resolve(page_), pageDir = path.dirname(pageAbs);
const OUT = path.resolve(opt('out', path.join(pageDir, 'out', 'final.mp4')));
const AUDIO = opt('audio', null);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' }); r.end(d); });
}).listen(0, '127.0.0.1');
await new Promise(r => srv.once('listening', r));
const url = `http://127.0.0.1:${srv.address().port}/${path.relative(ROOT, pageAbs).split(path.sep).map(encodeURIComponent).join('/')}`;

const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
async function openPage() {
  const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('[página]', e.message));
  await p.goto(url);
  await p.waitForFunction(() => typeof window.seek === 'function', null, { timeout: 15000 });
  await p.evaluate(async () => { await document.fonts.ready; if (window.ready) await window.ready; });
  return p;
}
async function grab(p, t, type) {
  if (DOM) { await p.evaluate(t => window.seek(t), t); return p.screenshot({ type: type === 'jpg' ? 'jpeg' : 'png', quality: type === 'jpg' ? 95 : undefined }); }
  const b64 = await p.evaluate(async ([t, type]) => {
    await window.seek(t);
    const c = document.getElementById('c') || document.querySelector('canvas');
    return c.toDataURL(type === 'jpg' ? 'image/jpeg' : 'image/png', 0.95).split(',')[1];
  }, [t, type]);
  return Buffer.from(b64, 'base64');
}
const run = (args) => new Promise((res, rej) => { const f = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'inherit'] }); f.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()); });

const prev = opt('preview', null);
if (prev) {
  const dir = path.join(pageDir, 'prev'); fs.mkdirSync(dir, { recursive: true });
  const p = await openPage();
  for (const t of String(prev).split(',').map(Number)) {
    const f = path.join(dir, `t_${t.toFixed(2)}.png`); fs.writeFileSync(f, await grab(p, t, 'png')); console.log(f);
  }
} else {
  const RATE = FPS * SUB, n0 = Math.round(FROM * RATE), n1 = Math.round(TO * RATE), ext = JPG ? 'jpg' : 'png';
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'render-'));
  const per = Math.ceil((n1 - n0) / WORKERS); let done = 0; const t0 = Date.now();
  await Promise.all([...Array(WORKERS)].map(async (_, w) => {
    const p = await openPage();
    for (let i = n0 + w * per; i < Math.min(n1, n0 + (w + 1) * per); i++) {
      fs.writeFileSync(path.join(tmp, `f_${String(i - n0).padStart(6, '0')}.${ext}`), await grab(p, i / RATE, ext));
      if (++done % (RATE * 2) === 0) process.stdout.write(`\r${(done / RATE).toFixed(0)}s / ${((n1 - n0) / RATE).toFixed(0)}s  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  }));
  console.log(`\nquadros prontos em ${((Date.now() - t0) / 1000).toFixed(1)}s, codificando…`);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const vf = SUB > 1 ? [`-vf`, `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`, '-r', String(FPS)] : [];
  const audio = AUDIO ? ['-i', path.resolve(AUDIO), '-c:a', 'aac', '-b:a', '256k', '-shortest'] : [];
  await run(['-y', '-loglevel', 'error', '-framerate', String(RATE), '-i', path.join(tmp, `f_%06d.${ext}`), ...audio, ...vf,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF), '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', OUT]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(OUT);
}
await browser.close(); srv.close();
