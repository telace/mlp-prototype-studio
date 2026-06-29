import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { project } from '../src/project/meta.js';
import { pageDirectory } from '../src/project/directory.js';
import { getStateOptions } from '../src/project/states.js';
import { pageCopy, pageInteractions } from '../src/project/notes/index.js';
import { buildInteractionTestCases } from '../src/project/test-cases/index.js';

const root = process.cwd();
const exportsDir = resolve(root, 'exports');
const publicDir = resolve(root, 'public');
const outputPath = resolve(exportsDir, 'ai-handoff.md');
const publicOutputPath = resolve(publicDir, 'ai-handoff.md');
const localEditsPath = resolve(root, 'src/project/notes/local-edits.json');

const localEdits = readJson(localEditsPath, { items: {}, pages: {}, tests: {} });
const generatedAt = new Date().toISOString();

const stateNumberFor = (pageId, stateId) => {
  const page = pageDirectory.find((item) => item.id === pageId);
  const states = getStateOptions(pageId);
  const stateIndex = Math.max(0, states.findIndex((item) => item.id === stateId));
  return `${page?.number || '?'}-${stateIndex + 1}`;
};

const getPageHash = (pageId, stateId) => {
  if (['profile', 'result', 'aiVideo', 'loginCn', 'loginGlobal'].includes(pageId)) return `#/${pageId}/${stateId}`;
  return `#/${pageId}`;
};

const getCopyKey = (pageId, stateId) => {
  if (pageId === 'create' && stateId === 'empty') return 'createEmpty';
  if (pageId === 'create' && stateId === 'body') return 'createBody';
  if (pageId === 'create' && stateId === 'template') return 'createTemplate';
  return pageId;
};

const resolvePageInteractions = (pageId, stateId) => {
  const value = pageInteractions?.[pageId];
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  return value[stateId] || value.default || value.__default || [];
};

const getLocalStateBucket = (bucket, pageId, stateId) => {
  const pageValue = bucket?.[pageId] || {};
  return pageValue[stateId] || pageValue.__default || {};
};

const mergeLocalItems = (items, pageId, stateId) => {
  const overrides = getLocalStateBucket(localEdits.items, pageId, stateId);
  return items.map((item) => overrides[item.id] ? { ...item, ...overrides[item.id] } : item);
};

const mergeLocalPageCopy = (base, pageId, stateId) => {
  const override = getLocalStateBucket(localEdits.pages, pageId, stateId).__page__ || getLocalStateBucket(localEdits.pages, pageId, stateId);
  return { ...base, ...override };
};

const applyLocalTestCaseOverrides = (cases, pageId, stateId, interactionId) => {
  const override = getLocalStateBucket(localEdits.tests, pageId, stateId)?.[interactionId] || {};
  return cases.map((testCase) => ({
    ...testCase,
    ...(override.cases?.[testCase.id] || {})
  }));
};

const md = [];

push(`# ${project.name} AI 交接文档`);
push('');
push('> 这个文档用于给其他 AI、研发、测试或产品协作方读取原型上下文。它不依赖页面 JS 执行，也不包含截图。');
push('');
push('## 1. 项目信息');
push(`- 项目名称：${project.name}`);
push(`- 项目 slug：${project.slug}`);
push(`- 项目路径：${project.path}`);
push(`- 默认原型主题：${project.defaultTheme}`);
push(`- 导出时间：${generatedAt}`);
push(`- 本地导出文件：exports/ai-handoff.md`);
push(`- 部署后建议链接：${trimSlash(project.path)}ai-handoff.md`);
push('');
push('## 2. 页面目录');
for (const [group, pages] of groupBy(pageDirectory, 'group')) {
  push(`### ${group}`);
  for (const page of pages) {
    push(`- ${page.number}. ${page.label} / id=${page.id} / level=${page.level} / status=${page.status}`);
  }
  push('');
}

push('## 3. 页面状态与路由');
for (const page of pageDirectory) {
  const states = getStateOptions(page.id);
  push(`### ${page.number}. ${page.label}`);
  push(`- 页面类型：${page.level}`);
  push(`- 目录分组：${page.group}`);
  push(`- 页面状态：`);
  for (const state of states) {
    push(`  - ${stateNumberFor(page.id, state.id)} ${state.label} / stateId=${state.id} / route=${getPageHash(page.id, state.id)}`);
  }
  push('');
}

push('## 4. 原型布局说明');
push('以下内容用文本树描述界面布局，供 AI 在不看截图的情况下理解页面结构。');
for (const page of pageDirectory.filter((item) => item.level !== 'docs')) {
  for (const state of getStateOptions(page.id)) {
    const stateNumber = stateNumberFor(page.id, state.id);
    const copy = mergeLocalPageCopy(pageCopy[getCopyKey(page.id, state.id)] || pageCopy[page.id] || {}, page.id, state.id);
    const interactions = mergeLocalItems(resolvePageInteractions(page.id, state.id), page.id, state.id);
    push(`### ${stateNumber} ${page.label} / ${state.label}`);
    push(`- 页面类型：${page.level}`);
    push(`- 路由：${getPageHash(page.id, state.id)}`);
    push('- 手机结构：');
    push('  - SystemStatusBar');
    if (page.level === 'primary') push('  - ScreenContent + BottomTabBar');
    else if (page.id === 'create') push('  - CustomCreationCanvas + ToolBar + Prompt/Template Area');
    else push('  - TopBackBar + ScreenContent');
    push('- 布局树：');
    for (const element of toArray(copy.elements)) push(`  - ${element}`);
    push('- 主要操作：');
    for (const action of toArray(copy.actions)) push(`  - ${action}`);
    push('- 交互映射：');
    for (const [index, item] of interactions.entries()) {
      push(`  - ${stateNumber}-${index + 1} ${item.title} -> interactionId=${item.id} / type=${item.type || '未标注'} / kind=${item.kind || 'action'} / checked=${Boolean(item.checked)}`);
    }
    push('');
  }
}

push('## 5. 页面说明');
for (const page of pageDirectory.filter((item) => item.level !== 'docs')) {
  for (const state of getStateOptions(page.id)) {
    const copy = mergeLocalPageCopy(pageCopy[getCopyKey(page.id, state.id)] || pageCopy[page.id] || {}, page.id, state.id);
    push(`### ${stateNumberFor(page.id, state.id)} ${page.label} / ${state.label}`);
    push(`- 页面功能：${text(copy.purpose)}`);
    push(`- 权限逻辑：${text(copy.permission)}`);
    push(`- 业务规则：${joinList(copy.rules)}`);
    push(`- 状态/异常：${joinList(copy.states)}`);
    push(`- 埋点建议：${joinList(copy.tracking)}`);
    push(`- 验收标准：${joinList(copy.acceptance)}`);
    push(`- checked：${Boolean(copy.checked)}`);
    push('');
  }
}

push('## 6. 交互说明');
for (const page of pageDirectory.filter((item) => item.level !== 'docs')) {
  for (const state of getStateOptions(page.id)) {
    const stateNumber = stateNumberFor(page.id, state.id);
    const interactions = mergeLocalItems(resolvePageInteractions(page.id, state.id), page.id, state.id);
    push(`### ${stateNumber} ${page.label} / ${state.label}`);
    for (const [index, item] of interactions.entries()) {
      push(`#### ${stateNumber}-${index + 1} ${item.title}`);
      push(`- interactionId：${item.id}`);
      push(`- checked：${Boolean(item.checked)}`);
      push(`- 组件类型：${text(item.type)}`);
      push(`- 组件构成：${text(item.composition || inferComposition(item))}`);
      push(`- 状态定义：${joinList(item.states || inferStates(item))}`);
      push(`- 交互行为：${text(item.effect || inferBehavior(item))}`);
      push(`- 数据说明：${text(item.fields || inferFields(item))}`);
      push('');
    }
  }
}

push('## 7. 测试用例');
for (const page of pageDirectory.filter((item) => item.level !== 'docs')) {
  for (const state of getStateOptions(page.id)) {
    const stateNumber = stateNumberFor(page.id, state.id);
    const interactions = mergeLocalItems(resolvePageInteractions(page.id, state.id), page.id, state.id);
    push(`### ${stateNumber} ${page.label} / ${state.label}`);
    for (const [index, item] of interactions.entries()) {
      const cases = applyLocalTestCaseOverrides(buildInteractionTestCases(item, index, stateNumber, { page: page.id }), page.id, state.id, item.id);
      push(`#### ${stateNumber}-${index + 1} ${item.title}`);
      for (const testCase of cases) {
        push(`- ${testCase.id} / ${testCase.group} / checked=${Boolean(testCase.checked)}`);
        push(`  - 场景：${text(testCase.title)}`);
        push(`  - 步骤：${text(testCase.steps)}`);
        push(`  - 预期：${text(testCase.expected)}`);
      }
      push('');
    }
  }
}

push('## 8. AI 协作规则');
push('- `checked=true` 表示人工已经 check 或人工编辑过，默认不要覆盖其文本。');
push('- `checked=false` 或缺失时，可以补全、重构或重新生成说明，但仍应保留明确的产品事实。');
push('- 页面状态切换是原型评审控制，不一定是 App 内真实交互。');
push('- 修改项目时优先编辑 `src/pages/`、`src/project/` 和 `src/pages/styles/`，不要随意改 `src/framework/`。');
push('- 不要依赖截图理解原型；请优先读取页面目录、布局树、交互映射、交互说明和测试用例。');
push('');

mkdirSync(exportsDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });
writeFileSync(outputPath, md.join('\n'), 'utf8');
writeFileSync(publicOutputPath, md.join('\n'), 'utf8');
console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${publicOutputPath}`);

function push(line) {
  md.push(line);
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function groupBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = item[key] || '未分组';
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(item);
  }
  return map.entries();
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [String(value)];
}

function joinList(value) {
  const items = toArray(value).filter(Boolean);
  return items.length ? items.join('；') : '未配置';
}

function text(value) {
  if (Array.isArray(value)) return value.join('；');
  if (value && typeof value === 'object') return Object.entries(value).map(([key, item]) => `${key}：${item}`).join('；');
  return String(value || '未配置');
}

function trimSlash(value) {
  const base = value || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function inferComposition(item) {
  if (/卡片|列表/.test(item.type || '') || /卡片|列表|素材|作品|模板/.test(item.title || '')) return '容器 + 封面/图标 + 标题/文本 + 状态信息。';
  if (/输入|搜索|验证码|手机号|邮箱|密码/.test(item.type || '')) return '输入容器 + 占位提示 + 输入值 + 校验提示。';
  if (/弹窗|Sheet|Toast/.test(item.type || '')) return '遮罩/容器 + 标题正文 + 主次操作。';
  if (/上传|相册/.test(item.type || '')) return '上传入口 + 缩略图 + 进度/错误提示。';
  return '单一控件或内容节点。';
}

function inferStates(item) {
  const states = ['默认态'];
  if ((item.kind || 'action') !== 'content') states.push('悬停态', '按下态', '加载态', '禁用态');
  if (/输入|上传|相册|选择|验证码|邮箱|手机号/.test(`${item.type || ''}${item.title || ''}`)) states.push('聚焦态', '错误态');
  if (/接口|后端|列表|素材|图片|作品|模板/.test(`${item.dataSource || ''}${item.title || ''}`)) states.push('空数据态', '加载失败态');
  return [...new Set(states)];
}

function inferBehavior(item) {
  if (item.effect) return /[①②③④⑤⑥⑦⑧⑨]/.test(item.effect) ? item.effect : `① ${item.effect}`;
  if ((item.kind || 'action') === 'content') return '① 页面渲染或数据刷新时，组件按数据来源更新展示内容。';
  return `① 用户${item.trigger || '点击'}该组件后完成对应页面操作。`;
}

function inferFields(item) {
  const rows = [];
  rows.push(`数据来源：${item.dataSource || item.source || '前端静态配置或占位数据'}`);
  if (item.input) rows.push(`输入字段：${item.input}`);
  if (item.output) rows.push(`输出字段：${item.output}`);
  return rows.join('；');
}
