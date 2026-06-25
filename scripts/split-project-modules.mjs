import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const projectRoot = resolve(process.argv[2] || process.cwd());
const pagesRoot = resolve(projectRoot, 'src/pages');
const notesRoot = resolve(projectRoot, 'src/project/notes');

const write = (filePath, content) => {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${content.trim()}\n`);
};

function findBodyStart(source, start) {
  const paren = source.indexOf('(', start);
  let depth = 0;
  for (let i = paren; i < source.length; i += 1) {
    const char = source[i];
    if (char === '(') depth += 1;
    if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        const body = source.indexOf('{', i);
        if (body < 0) throw new Error('Missing function body.');
        return body;
      }
    }
  }
  throw new Error('Missing function params end.');
}

function sliceFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start < 0) return null;
  const bodyStart = findBodyStart(source, start);
  let depth = 0;
  for (let i = bodyStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Unterminated function ${name}.`);
}

function exportFunction(source, name) {
  return source.replace(`function ${name}`, `export function ${name}`);
}

function splitAiToolScreens() {
  const sourcePath = join(pagesRoot, 'AiToolScreens.jsx');
  if (!existsSync(sourcePath)) return false;
  const source = readFileSync(sourcePath, 'utf8');
  if (!/function\s+\w+Screen\s*\(/.test(source)) return false;

  const screenFiles = [
    ['HomeScreen', 'home/HomeScreen.jsx', ['BannerPlaceholder']],
    ['AiVideoScreen', 'ai-video/AiVideoScreen.jsx', []],
    ['ListScreen', 'templates/ListScreen.jsx', []],
    ['ResultScreen', 'result/ResultScreen.jsx', []],
    ['LoginScreen', 'login/LoginScreen.jsx', []],
    ['CreateScreen', 'create/CreateScreen.jsx', []],
    ['ProfileScreen', 'profile/ProfileScreen.jsx', []],
    ['MemberCenterScreen', 'member/MemberCenterScreen.jsx', ['MemberRetentionModal']],
    ['EnergyCenterScreen', 'energy/EnergyCenterScreen.jsx', []],
    ['ComponentLibraryScreen', 'components/ComponentLibraryScreen.jsx', []],
    ['TabBar', 'shared/TabBar.jsx', []]
  ];
  const commonImports = [
    "import { useState } from 'react';",
    "import { BadgeCheck, ChevronLeft, ChevronRight, Crown, Download, Eraser, Grid2X2, Home, ImagePlus, Loader2, Mail, Play, Plus, Redo2, Search, Send, Settings, Share2, Sparkles, Undo2, User, WandSparkles, X } from 'lucide-react';",
    "import { bindInteraction } from '../../framework/interaction.js';",
    "import { BottomSheet, BottomTabBar, Button, ChipScroller, EmptyState, FormField, IconButton, LoadingState, Modal, PhonePage, PlaceholderImage, SegmentedControl, TemplateCard, Toast, TopBar } from '../../prototype-ui/components/index.jsx';",
    "import { bodyTemplateCases, categories, creationRecords, getDefaultLoginState, homeFilters, homeRecommendations, pageCopy, videoTemplates } from '../../project/project-data.js';"
  ].join('\n');

  const exports = [];
  for (const [name, relativePath, helpers] of screenFiles) {
    const screenSource = sliceFunction(source, name);
    if (!screenSource) continue;
    const helperSource = helpers
      .map((helper) => sliceFunction(source, helper))
      .filter(Boolean)
      .join('\n\n');
    write(join(pagesRoot, relativePath), `${commonImports}\n\n${exportFunction(screenSource, name)}\n\n${helperSource}`);
    exports.push(`export { ${name} } from './${relativePath}';`);
  }

  write(join(pagesRoot, 'index.js'), exports.join('\n'));
  write(sourcePath, "// Compatibility barrel. New code should import from src/pages/index.js or page-specific modules.\nexport * from './index.js';");
  return true;
}

function replaceImport(filePath, from, to) {
  if (!existsSync(filePath)) return;
  const next = readFileSync(filePath, 'utf8').replaceAll(from, to);
  writeFileSync(filePath, next);
}

function splitNotes() {
  const indexPath = join(notesRoot, 'index.js');
  if (!existsSync(indexPath)) return false;
  const source = readFileSync(indexPath, 'utf8');
  if (!source.includes('export const pageCopy') || !source.includes('export const pageInteractions')) return false;

  const getSection = (start, end) => {
    const startIndex = source.indexOf(start);
    if (startIndex < 0) return '';
    const endIndex = end ? source.indexOf(end, startIndex) : source.length;
    if (endIndex < 0) throw new Error(`Missing notes section end ${end}.`);
    return source.slice(startIndex, endIndex).trim();
  };
  const stateSpecs = getSection('export function getProfileStateSpec', 'export const creationBrushButtonInteractions');
  const brushInteractions = getSection('export const creationBrushButtonInteractions', 'export const pageCopy');
  const pageCopy = getSection('export const pageCopy', 'export const pageInteractions');
  const pageInteractions = getSection('export const pageInteractions', null);

  write(join(notesRoot, 'page-copy.js'), pageCopy);
  if (stateSpecs) {
    write(join(notesRoot, 'state-specs.js'), `import { getDefaultLoginState } from '../states.js';\nimport { pageCopy } from './page-copy.js';\n\n${stateSpecs}`);
  }
  write(join(notesRoot, 'interactions.js'), `${brushInteractions}\n\n${pageInteractions}`);
  write(indexPath, [
    "export * from './page-copy.js';",
    stateSpecs ? "export * from './state-specs.js';" : null,
    "export * from './interactions.js';"
  ].filter(Boolean).join('\n'));
  return true;
}

const pagesSplit = splitAiToolScreens();
replaceImport(resolve(projectRoot, 'src/project/routes.jsx'), "} from '../pages/AiToolScreens.jsx';", "} from '../pages/index.js';");
replaceImport(resolve(projectRoot, 'src/framework/PhoneFrame.jsx'), "import { TabBar } from '../pages/AiToolScreens.jsx';", "import { TabBar } from '../pages/index.js';");
const notesSplit = splitNotes();

console.log(`MLP module split complete: pages=${pagesSplit ? 'updated' : 'unchanged'}, notes=${notesSplit ? 'updated' : 'unchanged'}`);
