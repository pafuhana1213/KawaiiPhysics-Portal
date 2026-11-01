// usage: node check_video.mjs <page-url> [page-url ...]
// Opens each page in headless Edge/Chrome over CDP and checks that the first DocVideo plays
// on screen and pauses off screen. Start the site first (see the preview skill).
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const pages = process.argv.slice(2);
if (!pages.length) {
  console.log('usage: node check_video.mjs <page-url> [page-url ...]');
  process.exit(2);
}
const exe = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!exe) {
  console.log('NO_BROWSER');
  process.exit(2);
}

const port = 9344;
const profile = mkdtempSync(join(tmpdir(), 'kp-video-'));
const browser = spawn(exe, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--window-size=1280,900', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function debuggerUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = targets.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('no CDP target');
}

const probe = `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await sleep(1500);
  const video = document.querySelector('figure video');
  if (!video) return JSON.stringify({count: 0});
  const state = () => ({src: video.currentSrc.split('/').pop(), t: video.currentTime, paused: video.paused, err: video.error && video.error.message});
  video.scrollIntoView({block: 'center'});
  await sleep(2500);
  const onA = state();
  await sleep(1500);
  const onB = state();
  window.scrollTo(0, document.body.scrollHeight);
  await sleep(1500);
  return JSON.stringify({count: document.querySelectorAll('figure video').length, onA, onB, away: state()});
})()`;

let exit = 0;
try {
  const ws = new WebSocket(await debuggerUrl());
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
  });
  const send = (method, params = {}) => new Promise(r => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({id: i, method, params}));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  for (const url of pages) {
    await send('Page.navigate', {url});
    await sleep(2500);
    const r = await send('Runtime.evaluate', {expression: probe, awaitPromise: true, returnByValue: true});
    const o = JSON.parse(r.result?.result?.value ?? '{}');
    const ok = o.count > 0 && o.onB.t > o.onA.t && !o.onB.paused && o.away.paused && o.onA.err === null;
    console.log(ok ? 'PASS' : 'FAIL', url, JSON.stringify(o));
    if (!ok) exit = 1;
  }
  console.log('page exceptions:', errors.length, errors.slice(0, 3));
  if (errors.length) exit = 1;
  ws.close();
} catch (e) {
  console.log('ERROR', e.message);
  exit = 3;
} finally {
  browser.kill();
  await sleep(500);
  try {
    rmSync(profile, {recursive: true, force: true});
  } catch {}
}
process.exit(exit);
