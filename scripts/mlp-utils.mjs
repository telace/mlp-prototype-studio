import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

export const defaultProjectRoot = () => resolve(process.env.MLP_PROJECT_ROOT || `${process.env.HOME}/Documents/Codex/mlp-projects`);

export function resolveProject(projectArg) {
  if (!projectArg) throw new Error('Missing project slug or absolute path');
  const projectRoot = projectArg.startsWith('/') || projectArg === '.' || projectArg.startsWith('./') || projectArg.startsWith('../') || projectArg.includes('/')
    ? resolve(projectArg)
    : resolve(defaultProjectRoot(), projectArg);
  const packagePath = join(projectRoot, 'package.json');
  if (!existsSync(packagePath)) throw new Error(`Not an MLP project: ${projectRoot}`);
  return projectRoot;
}

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

export function readJson(file, fallback = null) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function writeJson(file, data) {
  ensureDir(dirname(file));
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

export function mlpDir(projectRoot) {
  return join(projectRoot, '.mlp');
}

export function getProjectSlug(projectRoot) {
  const meta = readProjectMeta(projectRoot);
  return meta.slug || basename(projectRoot);
}

export function readProjectMeta(projectRoot) {
  const packageJson = readJson(join(projectRoot, 'package.json'), {});
  const sources = [
    join(projectRoot, 'src/project/project-data.js'),
    join(projectRoot, 'src/legacy/LegacyApp.jsx'),
    join(projectRoot, 'src/main.jsx')
  ];
  const meta = {
    name: packageJson.name || basename(projectRoot),
    slug: basename(projectRoot),
    path: `/${basename(projectRoot)}/`,
    defaultTheme: 'light'
  };
  for (const sourcePath of sources) {
    if (!existsSync(sourcePath)) continue;
    const source = readFileSync(sourcePath, 'utf8');
    const projectBlock = source.match(/const\s+project\s*=\s*\{([\s\S]*?)\n\};|export\s+const\s+project\s*=\s*\{([\s\S]*?)\n\};/);
    const block = projectBlock?.[1] || projectBlock?.[2] || '';
    if (!block) continue;
    for (const key of ['name', 'slug', 'path', 'defaultTheme']) {
      const match = block.match(new RegExp(`${key}\\s*:\\s*['"\`]([^'"\`]+)['"\`]`));
      if (match) meta[key] = match[1];
    }
    break;
  }
  return meta;
}

export function listProjectRoots(projectRoot = defaultProjectRoot()) {
  if (!existsSync(projectRoot)) return [];
  return readdirSync(projectRoot)
    .map((entry) => join(projectRoot, entry))
    .filter((entry) => statSync(entry).isDirectory())
    .filter((entry) => existsSync(join(entry, 'package.json')))
    .sort();
}

export function readVersions(projectRoot) {
  return readJson(join(mlpDir(projectRoot), 'versions.json'), { currentVersion: null, versions: [] });
}

export function writeVersions(projectRoot, data) {
  writeJson(join(mlpDir(projectRoot), 'versions.json'), data);
}

export function readAccess(projectRoot) {
  return readJson(join(mlpDir(projectRoot), 'access.json'), { mode: 'public' });
}

export function hashPassword(password, salt = cryptoSalt()) {
  return {
    algorithm: 'sha256',
    salt,
    hash: createHash('sha256').update(`${salt}:${password}`).digest('hex')
  };
}

function cryptoSalt() {
  return createHash('sha256').update(`${Date.now()}:${Math.random()}`).digest('hex').slice(0, 16);
}

export function isVersion(value) {
  return /^\d+\.\d+\.\d{2}$/.test(value);
}

export function nextVersion(current, bump = 'patch') {
  if (!current || !isVersion(current)) return '1.0.01';
  const [majorRaw, minorRaw, patchRaw] = current.split('.');
  let major = Number(majorRaw);
  let minor = Number(minorRaw);
  let patch = Number(patchRaw);
  if (bump === 'major') {
    major += 1;
    minor = 0;
    patch = 1;
  } else if (bump === 'minor') {
    minor += 1;
    patch = 1;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${String(patch).padStart(2, '0')}`;
}
