// node render.js preview <t1,t2,...>   |   node render.js video <out.mp4>
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const puppeteer = require(process.env.PPT || 'puppeteer-core');
const FPS = 60, DUR = 10;
(async () => {
  const [mode, arg] = process.argv.slice(2);
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  await page.goto('file://' + path.resolve(__dirname, 'delivery-anim.html'));
  await page.evaluate(() => document.fonts.ready);
  const grab = t => page.evaluate(t => { draw(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
  if (mode === 'preview') {
    for (const t of arg.split(',').map(Number)) fs.writeFileSync(path.join(process.env.OUT || '.', `f_${t}.png`), Buffer.from(await grab(t), 'base64'));
  } else {
    const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'slow', '-movflags', '+faststart', arg], { stdio: ['pipe', 'ignore', 'inherit'] });
    for (let i = 0; i < FPS * DUR; i++) {
      const buf = Buffer.from(await grab(i / FPS), 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
