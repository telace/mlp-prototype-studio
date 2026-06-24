import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  defaultProjectRoot,
  ensureDir,
  listProjectRoots,
  readAccess,
  readProjectMeta,
  readVersions,
  writeJson
} from './mlp-utils.mjs';

const args = process.argv.slice(2);
const rootArg = args.find((arg) => arg.startsWith('--root='))?.slice('--root='.length);
const outputArg = args.find((arg) => arg.startsWith('--out='))?.slice('--out='.length);
const projectRoot = resolve(rootArg || defaultProjectRoot());
const outputRoot = resolve(outputArg || join(projectRoot, '_project-center'));

const projects = listProjectRoots(projectRoot)
  .map((projectPath) => {
    const meta = readProjectMeta(projectPath);
    const versions = readVersions(projectPath);
    const access = readAccess(projectPath);
    const packageJson = readJsonSafe(join(projectPath, 'package.json'));
    const currentVersion = versions.currentVersion || packageJson.version || '0.0.00';
    return {
      name: meta.name,
      slug: meta.slug,
      path: meta.path || `/${meta.slug}/`,
      localPath: projectPath,
      currentVersion,
      updatedAt: versions.updatedAt || null,
      access: access.mode || 'public',
      versionCount: versions.versions?.length || 0,
      url: `/${meta.slug}/`
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));

ensureDir(outputRoot);
writeJson(join(outputRoot, 'projects.json'), {
  generatedAt: new Date().toISOString(),
  projectRoot,
  projects
});

const html = renderIndex(projects);
await import('node:fs').then(({ writeFileSync }) => {
  writeFileSync(join(outputRoot, 'index.html'), html);
});

console.log(`Generated project center: ${outputRoot}`);
console.log(`Projects: ${projects.length}`);

function readJsonSafe(file) {
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderIndex(items) {
  const rows = items.map((item) => `
        <article class="project-card">
          <div class="project-main">
            <span>${escapeHtml(item.slug)}</span>
            <h2>${escapeHtml(item.name)}</h2>
            <p>${escapeHtml(item.localPath)}</p>
          </div>
          <div class="project-meta">
            <b>${escapeHtml(item.currentVersion)}</b>
            <em>${item.versionCount} versions</em>
            <strong class="access ${escapeHtml(item.access)}">${escapeHtml(item.access)}</strong>
          </div>
          <div class="project-actions">
            <a href="${escapeHtml(item.url)}">打开原型</a>
            <a href="${escapeHtml(item.url)}version.json">版本状态</a>
          </div>
        </article>`).join('\n');

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MLP 项目中心</title>
    <style>
      :root {
        color: #222;
        background: #f5f6f8;
        font-family: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
      }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; background: #f5f6f8; }
      main { width: min(1120px, calc(100vw - 48px)); margin: 0 auto; padding: 32px 0; }
      header { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: 18px; }
      h1 { margin: 0; font-size: 28px; line-height: 1.1; }
      header p { margin: 8px 0 0; color: #5f6670; font-size: 13px; }
      .count { border-radius: 999px; background: #fff; border: 1px solid #e5e7eb; padding: 8px 12px; font-weight: 800; }
      .project-list { display: grid; gap: 12px; }
      .project-card {
        min-height: 112px;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        background: #fff;
        padding: 16px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 160px 180px;
        gap: 16px;
        align-items: center;
      }
      .project-main span { display: block; color: #5f6670; font-size: 12px; text-transform: uppercase; }
      .project-main h2 { margin: 4px 0 8px; font-size: 20px; line-height: 1.15; }
      .project-main p { margin: 0; color: #5f6670; font-size: 12px; word-break: break-all; }
      .project-meta { display: grid; gap: 6px; justify-items: start; }
      .project-meta b { font-size: 18px; }
      .project-meta em { color: #5f6670; font-size: 12px; font-style: normal; }
      .access { border-radius: 999px; background: #f3f4f6; padding: 5px 9px; font-size: 12px; }
      .access.password { background: #222; color: #fff; }
      .project-actions { display: grid; gap: 8px; }
      .project-actions a {
        min-height: 36px;
        border-radius: 10px;
        background: #f3f4f6;
        color: #222;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        font-weight: 800;
        font-size: 13px;
      }
      .project-actions a:first-child { background: #222; color: #fff; }
      @media (max-width: 760px) {
        main { width: min(100vw - 28px, 560px); padding: 18px 0; }
        header { align-items: start; flex-direction: column; }
        .project-card { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          <h1>MLP 项目中心</h1>
          <p>汇总本地 MLP 原型项目、当前版本和访问状态。</p>
        </div>
        <div class="count">${items.length} projects</div>
      </header>
      <section class="project-list">
${rows || '<p>暂无项目。</p>'}
      </section>
    </main>
  </body>
</html>`;
}
