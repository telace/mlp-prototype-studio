import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import * as projectData from '../src/project/project-data.js';

const root = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const snapshotOnly = args.includes('--snapshot-only');
const updateBaseline = args.includes('--update-baseline');
const explicitCompare = args.includes('--compare');
const compare = explicitCompare || (!snapshotOnly && !updateBaseline);
const baseUrl = process.env.MLP_RUNTIME_URL || `http://127.0.0.1:${process.env.MLP_RUNTIME_PORT || '5376'}/`;
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const remoteDebuggingPort = Number(process.env.MLP_CHROME_DEBUG_PORT || 9336);
const userDataDir = mkdtempSync(resolve(tmpdir(), 'mlp-visual-chrome-'));
const visualRoot = resolve(root, '.mlp/visual');
const latestDir = resolve(visualRoot, 'latest');
const baselineDir = resolve(visualRoot, 'baseline');
const diffByteRatioThreshold = Number(process.env.MLP_VISUAL_BYTE_DIFF_RATIO || '0.02');
const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function canReach(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForReachable(url, timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await canReach(url)) return true;
    await wait(300);
  }
  return false;
}

function spawnLogged(command, commandArgs) {
  const child = spawn(command, commandArgs, {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', (chunk) => {
    if (process.env.MLP_VISUAL_VERBOSE) process.stdout.write(chunk);
  });
  child.stderr.on('data', (chunk) => {
    if (process.env.MLP_VISUAL_VERBOSE) process.stderr.write(chunk);
  });
  return child;
}

async function ensureServer() {
  if (process.env.MLP_RUNTIME_URL && await canReach(baseUrl)) return null;
  const server = spawnLogged('npx', ['vite', '--host', '127.0.0.1', '--port', String(new URL(baseUrl).port || 5376), '--strictPort']);
  const ready = await waitForReachable(baseUrl);
  if (!ready) {
    server.kill('SIGTERM');
    throw new Error(`Local preview did not become reachable: ${baseUrl}`);
  }
  return server;
}

async function launchChrome() {
  if (!existsSync(chromePath)) throw new Error(`Chrome executable not found: ${chromePath}`);
  const chrome = spawnLogged(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${remoteDebuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);
  const ready = await waitForReachable(`http://127.0.0.1:${remoteDebuggingPort}/json/version`);
  if (!ready) {
    chrome.kill('SIGTERM');
    throw new Error('Headless Chrome did not expose the DevTools endpoint.');
  }
  return chrome;
}

function createCases() {
  const {
    aiVideoStates = [],
    createSubstates = [],
    getPrototypeHash,
    getStateOptions,
    loginCnStates = [],
    loginGlobalStates = [],
    pageDirectory = [],
    profileStates = [],
    resultStates = []
  } = projectData;
  const cases = [];
  const add = (label, hash) => cases.push({ label, hash, url: `${baseUrl.replace(/\/$/, '')}/${hash}` });
  const hashFor = (pageId, stateId = 'default') => {
    if (typeof getPrototypeHash === 'function') return getPrototypeHash(pageId, stateId, stateId, stateId, stateId);
    return stateId && stateId !== 'default' ? `#/${pageId}/${stateId}` : `#/${pageId}`;
  };
  for (const page of pageDirectory) {
    if (['uiChecklist', 'uiSpec', 'prompts'].includes(page.id)) add(page.label, `#/${page.id}`);
    else if (page.id === 'profile') profileStates.forEach((state) => add(`${page.label}-${state.label}`, getPrototypeHash(page.id, state.id, 'processing', 'template', 'globalChoice')));
    else if (page.id === 'result') resultStates.forEach((state) => add(`${page.label}-${state.label}`, getPrototypeHash(page.id, 'loggedInVip', state.id, 'template', 'globalChoice')));
    else if (page.id === 'aiVideo') aiVideoStates.forEach((state) => add(`${page.label}-${state.label}`, getPrototypeHash(page.id, 'loggedInVip', 'processing', state.id, 'globalChoice')));
    else if (page.id === 'loginCn') loginCnStates.forEach((state) => add(`${page.label}-${state.label}`, getPrototypeHash(page.id, 'loggedInVip', 'processing', 'template', state.id)));
    else if (page.id === 'loginGlobal') loginGlobalStates.forEach((state) => add(`${page.label}-${state.label}`, getPrototypeHash(page.id, 'loggedInVip', 'processing', 'template', state.id)));
    else if (createSubstates.some((state) => state.id === page.id)) add(page.label, `#/${page.id}`);
    else if (typeof getStateOptions === 'function') getStateOptions(page.id).forEach((state) => add(`${page.label}-${state.label}`, hashFor(page.id, state.id)));
    else add(page.label, `#/${page.id}`);
  }
  return cases;
}

async function createCdpPage() {
  const target = await fetch(`http://127.0.0.1:${remoteDebuggingPort}/json/new`, { method: 'PUT' }).then((response) => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveSocket, rejectSocket) => {
    socket.addEventListener('open', resolveSocket, { once: true });
    socket.addEventListener('error', rejectSocket, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolveMessage, rejectMessage } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) rejectMessage(new Error(message.error.message));
    else resolveMessage(message.result);
  });
  const send = (method, params = {}) => {
    const messageId = ++id;
    socket.send(JSON.stringify({ id: messageId, method, params }));
    return new Promise((resolveMessage, rejectMessage) => pending.set(messageId, { resolveMessage, rejectMessage }));
  };
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1510, height: 920, deviceScaleFactor: 1, mobile: false });
  return { send, close: () => socket.close() };
}

function safeName(value) {
  return value.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'screen';
}

function hashBuffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readManifest(dir) {
  const path = join(dir, 'manifest.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function copyDir(source, target) {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source)) {
    copyFileSync(join(source, entry), join(target, entry));
  }
}

let server;
let chrome;
let cdp;

try {
  server = await ensureServer();
  chrome = await launchChrome();
  cdp = await createCdpPage();
  rmSync(latestDir, { recursive: true, force: true });
  mkdirSync(latestDir, { recursive: true });
  const cases = createCases();
  const screenshots = [];
  const visualFindings = [];
  for (const [index, testCase] of cases.entries()) {
    await cdp.send('Page.navigate', { url: testCase.url });
    await wait(900);
    const visualAudit = await cdp.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const findings = [];
        const rectOf = (selector) => {
          const node = document.querySelector(selector);
          if (!node) return null;
          const rect = node.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
        };
        const workspace = document.querySelector('.workspace');
        const phone = document.querySelector('.phone');
        const directoryButton = document.querySelector('.page-directory button');
        const checklistPreview = document.querySelector('.checklist-preview, .checklist-phone-preview, .checklist-preview-panel .phone, .checklist-stage-with-preview .phone');
        const rootText = document.querySelector('#root')?.innerText?.trim() || '';
        const workspaceStyle = workspace ? getComputedStyle(workspace) : null;
        const buttonStyle = directoryButton ? getComputedStyle(directoryButton) : null;
        const phoneRect = rectOf('.phone');
        const workspaceRect = rectOf('.workspace');
        if (!workspace) findings.push('workspace missing');
        else if (workspaceStyle.display !== 'grid') findings.push('workspace is not grid');
        if (workspaceRect && workspaceRect.width < 1100) findings.push('workspace width abnormal');
        if (rootText.length < 20) findings.push('root text nearly blank');
        if (phoneRect) {
          if (phoneRect.width < 340 || phoneRect.height < 760) findings.push('phone too small or collapsed');
          if (phoneRect.x < -2 || phoneRect.right > window.innerWidth + 2) findings.push('phone clipped outside viewport');
        }
        if (directoryButton && buttonStyle) {
          if (buttonStyle.borderStyle === 'outset' || buttonStyle.backgroundColor === 'rgb(239, 239, 239)') findings.push('directory button appears as browser default');
        }
        if (window.location.hash.includes('uiChecklist') && !checklistPreview) findings.push('ui checklist preview missing');
        const bodyRect = document.body.getBoundingClientRect();
        const blankRatio = rootText.length < 80 && bodyRect.width * bodyRect.height > 500000 ? 1 : 0;
        if (blankRatio) findings.push('page appears mostly blank');
        return findings;
      })()`
    });
    const findings = visualAudit.result.value || [];
    if (findings.length) visualFindings.push({ label: testCase.label, hash: testCase.hash, findings });
    const png = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    const buffer = Buffer.from(png.data, 'base64');
    const filename = `${String(index + 1).padStart(2, '0')}-${safeName(testCase.label)}.png`;
    writeFileSync(join(latestDir, filename), buffer);
    screenshots.push({ label: testCase.label, hash: testCase.hash, filename, sha256: hashBuffer(buffer), bytes: buffer.length });
  }
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    count: screenshots.length,
    visualFindings,
    screenshots
  };
  writeFileSync(join(latestDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  if (updateBaseline) {
    copyDir(latestDir, baselineDir);
    console.log(`MLP visual baseline updated: ${baselineDir}`);
  }

  const baseline = readManifest(baselineDir);
  if (compare && baseline) {
    const baselineByName = new Map(baseline.screenshots.map((item) => [item.filename, item]));
    const changed = screenshots.filter((item) => {
      const prior = baselineByName.get(item.filename);
      if (!prior) return true;
      if (prior.sha256 === item.sha256) return false;
      const byteDeltaRatio = Math.abs((prior.bytes || 0) - item.bytes) / Math.max(prior.bytes || 1, item.bytes || 1);
      return byteDeltaRatio > diffByteRatioThreshold;
    });
    const softChanged = screenshots.filter((item) => {
      const prior = baselineByName.get(item.filename);
      if (!prior || prior.sha256 === item.sha256) return false;
      const byteDeltaRatio = Math.abs((prior.bytes || 0) - item.bytes) / Math.max(prior.bytes || 1, item.bytes || 1);
      return byteDeltaRatio <= diffByteRatioThreshold;
    });
    const missing = baseline.screenshots.filter((item) => !screenshots.some((current) => current.filename === item.filename));
    console.log(`MLP visual review: ${screenshots.length - changed.length - softChanged.length}/${screenshots.length} unchanged, ${softChanged.length} soft-changed, ${changed.length} changed, ${missing.length} missing`);
    if (softChanged.length) {
      console.log(`Soft changes are below byte-delta threshold ${diffByteRatioThreshold}.`);
    }
    if (changed.length || missing.length) {
      console.log(`Latest screenshots: ${latestDir}`);
      console.log(`Baseline screenshots: ${baselineDir}`);
      fail('Visual screenshots differ from baseline. Review the latest screenshots and update baseline only when the change is expected.');
    }
  } else if (explicitCompare && !baseline) {
    fail(`Visual baseline is missing: ${baselineDir}. Run node scripts/mlp-visual-review.mjs --update-baseline after an approved visual state.`);
  } else {
    console.log(`MLP visual snapshot complete: ${screenshots.length} screenshot(s) in ${latestDir}`);
  }
  if (visualFindings.length) {
    console.log('MLP visual heuristic findings:');
    for (const item of visualFindings.slice(0, 30)) {
      console.log(`- ${item.label} ${item.hash}: ${item.findings.join('；')}`);
    }
    fail(`Visual heuristic review failed with ${visualFindings.length} route(s). Screenshots are in ${latestDir}`);
  }
} finally {
  cdp?.close();
  chrome?.kill('SIGTERM');
  server?.kill('SIGTERM');
  await wait(250);
  chrome?.kill('SIGKILL');
  server?.kill('SIGKILL');
  rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
