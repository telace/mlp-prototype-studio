import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageDirectory, getStateOptions } from '../src/project/project-data.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const editsPath = resolve(root, 'src/project/notes/local-edits.json');
const file = existsSync(editsPath) ? JSON.parse(readFileSync(editsPath, 'utf8')) : {};
const annotations = file.annotations || {};
const validPages = new Set(pageDirectory.map((item) => item.id));
const findings = [];
let count = 0;

const collectSource = (dir) => readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry);
  if (statSync(path).isDirectory()) return collectSource(path);
  return ['.js', '.jsx'].includes(extname(path)) ? [readFileSync(path, 'utf8')] : [];
}).join('\n');
const source = collectSource(resolve(root, 'src'));
const literalIds = new Set([...source.matchAll(/bind(?:Interaction|Element)\(\s*['"]([^'"]+)['"]/g)].map((match) => match[1]));
const templatePatterns = [...source.matchAll(/bind(?:Interaction|Element)\(\s*\`([^\`]+)\`/g)].map((match) => {
  const escaped = match[1].replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
  return new RegExp('^' + escaped.replace(/\\\$\\\{[^}]+\\\}/g, '[^-\\s]+') + '$');
});
const hasBoundSource = (id) => literalIds.has(id) || templatePatterns.some((pattern) => pattern.test(id));
const inRange = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;

for (const [pageId, states] of Object.entries(annotations)) {
  if (!validPages.has(pageId)) findings.push('未知页面: ' + pageId);
  const validStates = validPages.has(pageId) ? new Set(getStateOptions(pageId).map((item) => item.id)) : new Set();
  for (const [stateId, items] of Object.entries(states || {})) {
    if (stateId !== '__default' && !validStates.has(stateId)) findings.push('未知状态: ' + pageId + '/' + stateId);
    for (const [id, item] of Object.entries(items || {})) {
      count += 1;
      if (item.id !== id) findings.push('标注 ID 不一致: ' + id);
      if (item.pageId !== pageId || item.stateId !== stateId) findings.push('标注页面/状态归属不一致: ' + id);
      if (!['element', 'coordinate'].includes(item.anchorType)) findings.push('锚点类型无效: ' + id);
      if (item.anchorType === 'element') {
        if (!item.elementId) findings.push('元素标注缺少 elementId: ' + id);
        else if (!hasBoundSource(item.elementId)) findings.push('元素锚点没有 bindInteraction/bindElement 来源: ' + id + ' -> ' + item.elementId);
      }
      if (item.anchorType === 'coordinate') {
        if (!['viewport', 'content'].includes(item.coordinateSpace)) findings.push('坐标空间无效: ' + id);
        if (!inRange(item.x, 0, 375)) findings.push('坐标 x 超出 0-375: ' + id);
        if (item.coordinateSpace === 'viewport' && !inRange(item.y, 0, 812)) findings.push('viewport y 超出 0-812: ' + id);
        if (item.coordinateSpace === 'content' && (!Number.isFinite(item.y) || item.y < 0)) findings.push('content y 必须为非负有限数值: ' + id);
      }
      if (!item.title || !item.description) findings.push('标注名称或说明为空: ' + id);
    }
  }
}

console.log('MLP manual annotation acceptance');
console.log(findings.length ? 'FAIL' : 'PASS', count + ' annotation(s) checked');
for (const finding of findings) console.log('- ' + finding);
if (findings.length) process.exitCode = 1;
