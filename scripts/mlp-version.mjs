import { cpSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  ensureDir,
  getProjectSlug,
  isVersion,
  mlpDir,
  nextVersion,
  readProjectMeta,
  readVersions,
  resolveProject,
  writeJson,
  writeVersions
} from './mlp-utils.mjs';

const [command, projectArg, ...rest] = process.argv.slice(2);

if (!command || !projectArg) {
  usage();
}

const projectRoot = resolveProject(projectArg);
const meta = readProjectMeta(projectRoot);
const versionsPath = join(mlpDir(projectRoot), 'versions.json');
const releasesRoot = join(mlpDir(projectRoot), 'releases');
const currentPath = join(mlpDir(projectRoot), 'current.json');

if (command === 'list') {
  const data = readVersions(projectRoot);
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

if (command === 'release') {
  const opts = parseOptions(rest);
  const current = readVersions(projectRoot).currentVersion;
  const version = opts.version || nextVersion(current, opts.bump || 'patch');
  if (!isVersion(version)) {
    console.error(`Invalid version "${version}". Use x.x.xx, for example 1.0.01`);
    process.exit(1);
  }
  const releaseDir = join(releasesRoot, version);
  if (existsSync(releaseDir) && !opts.force) {
    console.error(`Release already exists: ${version}. Use --force to replace it.`);
    process.exit(1);
  }

  const now = new Date().toISOString();
  const versionJson = readVersions(projectRoot);
  const existing = versionJson.versions.filter((item) => item.version !== version);
  const releaseMeta = {
    version,
    title: opts.title || `Release ${version}`,
    summary: opts.summary || '',
    createdAt: now,
    projectSlug: meta.slug || getProjectSlug(projectRoot),
    distPath: `.mlp/releases/${version}/dist`
  };
  const nextData = {
    currentVersion: version,
    updatedAt: now,
    versions: [releaseMeta, ...existing].sort((a, b) => compareVersionDesc(a.version, b.version))
  };
  writeChangelog(projectRoot, nextData);
  run('npm', ['run', 'build'], projectRoot);
  if (!existsSync(join(projectRoot, 'dist'))) {
    console.error('Build did not produce dist/.');
    process.exit(1);
  }
  if (existsSync(releaseDir)) rmSync(releaseDir, { recursive: true, force: true });
  ensureDir(releaseDir);
  cpSync(join(projectRoot, 'dist'), join(releaseDir, 'dist'), { recursive: true });
  writeVersions(projectRoot, nextData);
  writeJson(currentPath, { version, updatedAt: now, distPath: releaseMeta.distPath });
  writeJson(join(mlpDir(projectRoot), 'project.json'), {
    ...meta,
    currentVersion: version,
    updatedAt: now
  });
  console.log(`Created release ${version}: ${releaseDir}`);
  process.exit(0);
}

if (command === 'rollback') {
  const version = rest[0];
  if (!isVersion(version)) {
    console.error('Rollback requires a version in x.x.xx format.');
    process.exit(1);
  }
  const data = readVersions(projectRoot);
  const target = data.versions.find((item) => item.version === version);
  if (!target) {
    console.error(`Version not found: ${version}`);
    process.exit(1);
  }
  const now = new Date().toISOString();
  data.currentVersion = version;
  data.updatedAt = now;
  writeVersions(projectRoot, data);
  writeChangelog(projectRoot, data);
  writeJson(currentPath, { version, updatedAt: now, distPath: target.distPath });
  writeJson(join(mlpDir(projectRoot), 'project.json'), {
    ...meta,
    currentVersion: version,
    updatedAt: now
  });
  console.log(`Rolled back current version to ${version}`);
  process.exit(0);
}

usage();

function usage() {
  console.error(`Usage:
  mlp-version.mjs release <project> [--version x.x.xx] [--bump patch|minor|major] [--title "..."] [--summary "..."] [--force]
  mlp-version.mjs list <project>
  mlp-version.mjs rollback <project> <version>`);
  process.exit(1);
}

function parseOptions(args) {
  const opts = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--force') opts.force = true;
    else if (arg === '--version') opts.version = args[++i];
    else if (arg === '--bump') opts.bump = args[++i];
    else if (arg === '--title') opts.title = args[++i];
    else if (arg === '--summary') opts.summary = args[++i];
    else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }
  return opts;
}

function run(commandName, args, cwd) {
  const result = spawnSync(commandName, args, { cwd: resolve(cwd), stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

function compareVersionDesc(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pb[i] - pa[i];
  }
  return 0;
}

function writeChangelog(projectRoot, data) {
  writeJson(join(projectRoot, 'public', 'changelog.json'), {
    currentVersion: data.currentVersion,
    updatedAt: data.updatedAt,
    versions: data.versions.map((item) => ({
      version: item.version,
      title: item.title,
      summary: item.summary || '',
      createdAt: item.createdAt
    }))
  });
}
