import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import * as projectData from '../src/project/project-data.js';
import { getRouteItems, supportPageIds } from '../src/framework/supportPages.js';

const root = resolve(new URL('..', import.meta.url).pathname);
const usesExternalRuntimeUrl = Boolean(process.env.MLP_RUNTIME_URL);
const baseUrl = process.env.MLP_RUNTIME_URL || `http://127.0.0.1:${process.env.MLP_RUNTIME_PORT || '5375'}/`;
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const remoteDebuggingPort = Number(process.env.MLP_CHROME_DEBUG_PORT || 9335);
const userDataDir = mkdtempSync(resolve(tmpdir(), 'mlp-runtime-chrome-'));
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

function spawnLogged(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  });
  child.stdout.on('data', (chunk) => {
    if (process.env.MLP_RUNTIME_VERBOSE) process.stdout.write(chunk);
  });
  child.stderr.on('data', (chunk) => {
    if (process.env.MLP_RUNTIME_VERBOSE) process.stderr.write(chunk);
  });
  return child;
}

async function ensureServer() {
  if (usesExternalRuntimeUrl && await canReach(baseUrl)) return null;
  const server = spawnLogged('npx', ['vite', '--host', '127.0.0.1', '--port', String(new URL(baseUrl).port || 5375), '--strictPort']);
  const ready = await waitForReachable(baseUrl);
  if (!ready) {
    server.kill('SIGTERM');
    throw new Error(`Local preview did not become reachable: ${baseUrl}`);
  }
  return server;
}

async function launchChrome() {
  if (!existsSync(chromePath)) {
    throw new Error(`Chrome executable not found: ${chromePath}. Set CHROME_PATH to override.`);
  }
  const chrome = spawnLogged(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${remoteDebuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);
  const versionUrl = `http://127.0.0.1:${remoteDebuggingPort}/json/version`;
  const ready = await waitForReachable(versionUrl);
  if (!ready) {
    chrome.kill('SIGTERM');
    throw new Error('Headless Chrome did not expose the DevTools endpoint.');
  }
  return chrome;
}

function createRuntimeCases() {
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
  const add = (label, hash, kind = 'phone', expectedHash = hash) => {
    cases.push({ label, url: `${baseUrl.replace(/\/$/, '')}/${hash}`, kind, expectedHash });
  };
  const hashFor = (pageId, stateId = 'default') => {
    if (typeof getPrototypeHash === 'function') {
      return getPrototypeHash(pageId, stateId, stateId, stateId, stateId);
    }
    return stateId && stateId !== 'default' ? `#/${pageId}/${stateId}` : `#/${pageId}`;
  };

  const routeItems = getRouteItems(pageDirectory);
  for (const page of routeItems) {
    if (page.level === 'docs' || supportPageIds.includes(page.id)) {
      add(page.label, `#/${page.id}`, 'doc');
    } else if (page.id === 'profile') {
      for (const state of profileStates) add(`${page.label} / ${state.label}`, getPrototypeHash(page.id, state.id, 'processing', 'template', 'globalChoice'));
    } else if (page.id === 'result') {
      for (const state of resultStates) add(`${page.label} / ${state.label}`, getPrototypeHash(page.id, 'loggedInVip', state.id, 'template', 'globalChoice'));
    } else if (page.id === 'aiVideo') {
      for (const state of aiVideoStates) add(`${page.label} / ${state.label}`, getPrototypeHash(page.id, 'loggedInVip', 'processing', state.id, 'globalChoice'));
    } else if (page.id === 'loginCn') {
      for (const state of loginCnStates) add(`${page.label} / ${state.label}`, getPrototypeHash(page.id, 'loggedInVip', 'processing', 'template', state.id));
    } else if (page.id === 'loginGlobal') {
      for (const state of loginGlobalStates) add(`${page.label} / ${state.label}`, getPrototypeHash(page.id, 'loggedInVip', 'processing', 'template', state.id));
    } else if (createSubstates.some((state) => state.id === page.id)) {
      add(page.label, `#/${page.id}`);
    } else if (typeof getStateOptions === 'function') {
      for (const state of getStateOptions(page.id)) add(`${page.label} / ${state.label}`, hashFor(page.id, state.id), 'phone', null);
    } else {
      add(page.label, `#/${page.id}`);
    }
  }

  if (typeof getPrototypeHash === 'function' && pageDirectory.some((page) => page.id === 'loginGlobal') && pageDirectory.some((page) => page.id === 'loginCn')) {
    add('非法状态容错 / 海外页收到国内状态', '#/loginGlobal/cnOneTap', 'phone', '#/loginGlobal/globalChoice');
    add('非法状态容错 / 国内页收到海外状态', '#/loginCn/globalChoice', 'phone', '#/loginCn/cnOneTap');
  }
  if (typeof getPrototypeHash === 'function') {
    const fallbackPage = routeItems.find((page) => page.level !== 'docs' && !supportPageIds.includes(page.id))?.id || routeItems[0]?.id || 'sample';
    const fallbackState = typeof getStateOptions === 'function' ? getStateOptions(fallbackPage)[0]?.id : 'default';
    add('非法页面容错', '#/missing-page', 'phone', hashFor(fallbackPage, fallbackState));
  }

  return cases;
}

async function createCdpPage() {
  const newTarget = await fetch(`http://127.0.0.1:${remoteDebuggingPort}/json/new`, { method: 'PUT' }).then((response) => response.json());
  const socket = new WebSocket(newTarget.webSocketDebuggerUrl);
  await new Promise((resolveSocket, rejectSocket) => {
    socket.addEventListener('open', resolveSocket, { once: true });
    socket.addEventListener('error', rejectSocket, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const events = [];

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolveMessage, rejectMessage } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rejectMessage(new Error(message.error.message));
      else resolveMessage(message.result);
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      events.push({
        type: 'exception',
        detail: details?.exception?.description || details?.exception?.value || details?.text || 'Runtime exception'
      });
    }
    if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(message.params.entry?.level)) events.push({ type: message.params.entry.level, detail: message.params.entry.text });
  });

  const send = (method, params = {}) => {
    const messageId = ++id;
    socket.send(JSON.stringify({ id: messageId, method, params }));
    return new Promise((resolveMessage, rejectMessage) => {
      pending.set(messageId, { resolveMessage, rejectMessage });
    });
  };

  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1510,
    height: 920,
    deviceScaleFactor: 1,
    mobile: false
  });

  return { send, events, close: () => socket.close() };
}

async function inspectCase(cdp, testCase) {
  cdp.events.length = 0;
  await cdp.send('Page.navigate', { url: 'about:blank' });
  await wait(120);
  await cdp.send('Page.navigate', { url: testCase.url });
  await wait(900);
  const evaluation = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const root = document.querySelector('#root');
      const workspace = document.querySelector('.workspace');
      const phone = document.querySelector('.phone');
      const spec = document.querySelector('.spec-panel');
      const docStage = document.querySelector('.checklist-stage, .ui-spec-stage');
      const stateSwitch = document.querySelector('.prototype-state-switch');
      const activeStateChip = document.querySelector('.prototype-state-switch button.active');
      const checklistPreview = document.querySelector('.checklist-preview, .checklist-phone-preview, .checklist-preview-panel .phone, .checklist-stage-with-preview .phone');
      const rectOf = (node) => {
        if (!node) return null;
        const rect = node.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
      };
      const rootText = root?.innerText?.trim() || '';
      const phoneText = phone?.innerText?.trim() || '';
      return {
        hash: window.location.hash,
        rootTextLength: rootText.length,
        phoneTextLength: phoneText.length,
        hasWorkspace: !!workspace,
        hasPhone: !!phone,
        hasSpecPanel: !!spec,
        hasDocStage: !!docStage,
        hasActiveStateChip: !!activeStateChip,
        hasChecklistPreview: !!checklistPreview,
        workspaceDisplay: workspace ? getComputedStyle(workspace).display : '',
        workspaceColumns: workspace ? getComputedStyle(workspace).gridTemplateColumns : '',
        workspaceRect: rectOf(workspace),
        phoneRect: rectOf(phone),
        specRect: rectOf(spec),
        stateSwitchRect: rectOf(stateSwitch),
        activeStateChipRect: rectOf(activeStateChip),
        viewport: { width: window.innerWidth, height: window.innerHeight },
        rootText: rootText.slice(0, 160),
        title: document.querySelector('.spec-title h1, .ui-spec-title h1, .checklist-title h1, .nav-bar span:nth-child(2)')?.textContent?.trim() || ''
      };
    })()`
  });
  const value = evaluation.result.value;
  const failures = [];
  if (cdp.events.some((event) => event.type === 'exception')) failures.push(`runtime exception: ${cdp.events.map((event) => event.detail).join(' | ')}`);
  if (!value.hasWorkspace) failures.push('missing .workspace');
  if (value.hasWorkspace && value.workspaceDisplay !== 'grid') failures.push(`workspace display is ${value.workspaceDisplay || 'empty'}, expected grid`);
  if (value.workspaceColumns && value.workspaceColumns.split(' ').filter(Boolean).length < 4) failures.push(`workspace grid has too few columns: ${value.workspaceColumns}`);
  if (value.workspaceRect && value.workspaceRect.width < 1100) failures.push(`workspace width too small: ${Math.round(value.workspaceRect.width)}px`);
  if (value.rootTextLength < 20) failures.push('empty #root text');
  if (testCase.kind === 'phone') {
    if (!value.hasPhone) failures.push('missing .phone');
    if (!value.hasSpecPanel) failures.push('missing .spec-panel');
    if (value.phoneTextLength < 10) failures.push('empty phone content');
    if (!value.hasActiveStateChip) failures.push('missing active prototype state chip');
    if (value.phoneRect) {
      if (value.phoneRect.width < 340 || value.phoneRect.height < 760) failures.push(`phone box too small: ${Math.round(value.phoneRect.width)}x${Math.round(value.phoneRect.height)}`);
      if (value.phoneRect.x < -2 || value.phoneRect.right > value.viewport.width + 2) failures.push(`phone box outside viewport: x=${Math.round(value.phoneRect.x)}, right=${Math.round(value.phoneRect.right)}, viewport=${value.viewport.width}`);
    }
    if (value.specRect && value.phoneRect && value.specRect.x < value.phoneRect.right) failures.push('spec panel overlaps or appears before phone');
    if (value.activeStateChipRect && value.stateSwitchRect) {
      if (value.activeStateChipRect.x < value.stateSwitchRect.x - 1 || value.activeStateChipRect.right > value.stateSwitchRect.right + 1) failures.push('active state chip is clipped outside state switch');
    }
  }
  if (testCase.kind === 'doc' && !value.hasDocStage) failures.push('missing docs stage');
  if (testCase.kind === 'doc' && /UI设计清单/.test(testCase.label) && !value.hasChecklistPreview) failures.push('missing UI checklist phone preview');
  if (testCase.expectedHash && value.hash !== testCase.expectedHash) failures.push(`unexpected hash ${value.hash}, expected ${testCase.expectedHash}`);
  return { ...testCase, ...value, failures };
}

async function setPrototypeTheme(cdp, theme) {
  const storageKey = typeof projectData.getThemeStorageKey === 'function'
    ? projectData.getThemeStorageKey()
    : `mlp-theme:${projectData.project?.slug || 'prototype'}`;
  await cdp.send('Runtime.evaluate', {
    expression: `localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(theme)});`
  });
}

async function inspectPhoneContrast(cdp, testCase, theme) {
  if (testCase.kind !== 'phone') return [];
  await setPrototypeTheme(cdp, theme);
  await cdp.send('Page.navigate', { url: testCase.url });
  await wait(700);
  const evaluation = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(() => {
      const parseColor = (value) => {
        const match = value.match(/rgba?\\(([^)]+)\\)/);
        if (!match) return null;
        const parts = match[1].split(',').map((item) => Number.parseFloat(item));
        return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
      };
      const luminance = ({ r, g, b }) => {
        const channel = (value) => {
          value /= 255;
          return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };
      const contrast = (foreground, background) => {
        const a = luminance(foreground);
        const b = luminance(background);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      };
      const directText = (element) => Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent.trim())
        .join('')
        .trim();
      const visibleBackground = (element) => {
        let current = element;
        while (current && current !== document) {
          const color = parseColor(getComputedStyle(current).backgroundColor);
          if (color && color.a > 0.95) return color;
          current = current.parentElement;
        }
        return parseColor(getComputedStyle(document.body).backgroundColor);
      };
      const findings = [];
      document.querySelectorAll('.phone *').forEach((element) => {
        const text = directText(element);
        if (!text) return;
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return;
        if (Number.parseFloat(style.fontSize) < 9) return;
        const rect = element.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        const foreground = parseColor(style.color);
        const background = visibleBackground(element);
        if (!foreground || !background) return;
        const ratio = contrast(foreground, background);
        if (ratio < 3.2) {
          findings.push({
            text: text.slice(0, 32),
            tag: element.tagName.toLowerCase(),
            className: String(element.className || '').slice(0, 80),
            contrast: Number(ratio.toFixed(2)),
            color: style.color,
            background: getComputedStyle(element).backgroundColor
          });
        }
      });
      return findings.slice(0, 20);
    })()`
  });
  return evaluation.result.value || [];
}

let server;
let chrome;
let cdp;

try {
  server = await ensureServer();
  chrome = await launchChrome();
  cdp = await createCdpPage();
  const cases = createRuntimeCases();
  const results = [];
  for (const testCase of cases) {
    results.push(await inspectCase(cdp, testCase));
  }

  const failures = results.filter((result) => result.failures.length);
  console.log(`MLP runtime review: ${results.length - failures.length}/${results.length} passed`);
  for (const result of results) {
    const status = result.failures.length ? 'FAIL' : 'PASS';
    console.log(`${status} ${result.label} ${result.url.replace(baseUrl.replace(/\/$/, ''), '')}`);
    if (result.failures.length) console.log(`  - ${result.failures.join('\n  - ')}`);
  }

  if (failures.length) fail(`Runtime review failed with ${failures.length} failing route(s).`);

  const contrastFailures = [];
  for (const theme of ['light', 'dark']) {
    for (const testCase of cases) {
      const findings = await inspectPhoneContrast(cdp, testCase, theme);
      if (findings.length) {
        contrastFailures.push({ theme, testCase, findings });
      }
    }
  }
  console.log(`MLP contrast review: ${contrastFailures.length ? 'FAIL' : 'PASS'} checked ${cases.filter((item) => item.kind === 'phone').length} phone route(s) in light/dark themes`);
  for (const item of contrastFailures.slice(0, 20)) {
    console.log(`FAIL contrast ${item.theme} ${item.testCase.label} ${item.testCase.url.replace(baseUrl.replace(/\/$/, ''), '')}`);
    for (const finding of item.findings.slice(0, 6)) {
      console.log(`  - ${finding.tag}.${finding.className} "${finding.text}" contrast ${finding.contrast}`);
    }
  }
  if (contrastFailures.length) fail(`Contrast review failed with ${contrastFailures.length} route/theme issue(s).`);
} finally {
  cdp?.close();
  chrome?.kill('SIGTERM');
  server?.kill('SIGTERM');
  await wait(250);
  chrome?.kill('SIGKILL');
  server?.kill('SIGKILL');
  rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
