import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import * as projectData from '../src/project/project-data.js';
import { getDirectoryItems, supportPageIds } from '../src/framework/supportPages.js';

const root = resolve(new URL('..', import.meta.url).pathname);
const srcRoot = resolve(root, 'src');

const collectFiles = (dir, extensions) => readdirSync(dir)
  .flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) return collectFiles(fullPath, extensions);
    return extensions.includes(extname(fullPath)) ? [fullPath] : [];
  })
  .sort();

const sourceFiles = collectFiles(srcRoot, ['.js', '.jsx']);
const source = sourceFiles
  .map((file) => `\n/* ${relative(root, file)} */\n${readFileSync(file, 'utf8')}`)
  .join('\n');

const uniq = (items) => [...new Set(items)].filter(Boolean).sort();

function extractBoundElementIds(text) {
  const ids = [];
  for (const match of text.matchAll(/bind(?:Interaction|Element)\(\s*['"`]([^'"`]+)['"`]/g)) {
    ids.push(match[1]);
  }
  return uniq(ids);
}

function resolvePageStateInteractions(interactionMap, pageId, stateId) {
  const pageValue = interactionMap?.[pageId];
  if (Array.isArray(pageValue)) return pageValue;
  if (!pageValue || typeof pageValue !== 'object') return [];
  return pageValue[stateId] || pageValue.default || pageValue.__default || [];
}

const {
  getStateOptions = () => [{ id: 'default', label: '默认态' }],
  pageDirectory = [],
  pageInteractions = {}
} = projectData;

const directoryItems = getDirectoryItems(pageDirectory);
const prototypePages = directoryItems.filter((page) => page.level !== 'docs' && !supportPageIds.includes(page.id));
const boundIds = extractBoundElementIds(source);
const documentedItems = [];
const pageStateFindings = [];

for (const page of prototypePages) {
  const states = getStateOptions(page.id);
  for (const state of states) {
    const interactions = resolvePageStateInteractions(pageInteractions, page.id, state.id);
    if (!interactions.length) {
      pageStateFindings.push(`${page.label || page.id}/${state.label || state.id} 没有交互说明`);
    }
    for (const item of interactions) {
      documentedItems.push({ page, state, item });
    }
  }
}

const documentedIds = uniq(documentedItems.map(({ item }) => item.id));
const missingDocs = boundIds.filter((id) => !documentedIds.includes(id));
const missingSources = documentedIds.filter((id) => !boundIds.includes(id));
const unreviewedDocs = documentedItems
  .filter(({ item }) => item.reviewed !== true)
  .map(({ page, state, item }) => `${page.label || page.id}/${state.label || state.id}/${item.title || item.id}`);
const incompleteDocs = documentedItems.flatMap(({ page, state, item }) => {
  const prefix = `${page.label || page.id}/${state.label || state.id}/${item.title || item.id}`;
  const missing = [];
  const kind = item.kind || item.role || 'action';
  if (!item.id) missing.push('id');
  if (!item.title) missing.push('title');
  if (!item.kind) missing.push('kind');
  if (!item.type) missing.push('type');
  if (!item.purpose) missing.push('purpose');
  if (kind === 'content') {
    if (!item.dataSource && !item.source) missing.push('dataSource');
  } else {
    if (!item.trigger) missing.push('trigger');
    if (!item.effect) missing.push('effect');
  }
  if (!item.bounds) missing.push('bounds');
  if (!item.exceptions) missing.push('exceptions');
  return missing.length ? [`${prefix} 缺少字段: ${missing.join(', ')}`] : [];
});

const checks = [
  {
    name: '原型元素绑定',
    pass: boundIds.length > 0,
    detail: boundIds.length ? `发现 ${boundIds.length} 个原型元素` : '没有发现 bindInteraction/bindElement 原型元素'
  },
  {
    name: '说明覆盖原型元素',
    pass: missingDocs.length === 0,
    detail: missingDocs.length ? `缺少元素说明: ${missingDocs.join(', ')}` : `已覆盖 ${boundIds.length} 个原型元素`
  },
  {
    name: '交互说明都有页面来源',
    pass: missingSources.length === 0,
    detail: missingSources.length ? `说明没有对应原型元素: ${missingSources.join(', ')}` : `已匹配 ${documentedIds.length} 条交互说明`
  },
  {
    name: '页面状态交互完整',
    pass: pageStateFindings.length === 0,
    detail: pageStateFindings.length ? pageStateFindings.join('；') : '每个原型页面状态都有交互说明'
  },
  {
    name: '交互说明字段完整',
    pass: incompleteDocs.length === 0,
    detail: incompleteDocs.length ? incompleteDocs.join('；') : '每条说明包含操作、结果、边界和异常字段'
  },
  {
    name: '编辑审核确认',
    pass: unreviewedDocs.length === 0,
    detail: unreviewedDocs.length ? `未确认: ${unreviewedDocs.join('；')}` : '所有交互说明已标记 reviewed: true'
  }
];

console.log('MLP prototype acceptance');
for (const [index, check] of checks.entries()) {
  console.log(`${index + 1}. ${check.pass ? 'PASS' : 'FAIL'} ${check.name} - ${check.detail}`);
}

if (checks.some((check) => !check.pass)) {
  process.exitCode = 1;
}
