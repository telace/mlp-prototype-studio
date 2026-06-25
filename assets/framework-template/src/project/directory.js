export const pageDirectory = [
  { id: 'sample', number: '1', label: '一级页面示例', group: '示例页面', level: 'primary', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'secondaryExample', number: '2', label: '二级页面示例', group: '示例页面', level: 'secondary', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'components', number: '3', label: '组件库', group: '示例页面', level: 'secondary', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'uiChecklist', number: '4', label: 'UI设计清单', group: '规范/文档', level: 'docs', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'uiSpec', number: '5', label: 'UI规范说明', group: '规范/文档', level: 'docs', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'prompts', number: '6', label: '提示词', group: '提示词', level: 'docs', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' }
];





import { project } from './meta.js';

export const getPageReadStorageKey = () => `mlp-page-read:${project.slug}`;
export const getPageUpdateKey = (item) => item.updatedAt || item.version || '';
export const readPageReadVersions = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(getPageReadStorageKey()) || '{}');
  } catch {
    return {};
  }
};
export const writePageReadVersions = (versions) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getPageReadStorageKey(), JSON.stringify(versions));
};

export const uiDesignChecklist = [
  { number: '1-1', pageId: 'sample', page: '一级页面示例', state: '默认态', status: 'draft' },
  { number: '1-2', pageId: 'sample', page: '一级页面示例', state: '抽屉态', status: 'draft' },
  { number: '2-1', pageId: 'secondaryExample', page: '二级页面示例', state: '默认态', status: 'draft' },
  { number: '2-2', pageId: 'secondaryExample', page: '二级页面示例', state: 'Sheet 态', status: 'draft' },
  { number: '2-3', pageId: 'secondaryExample', page: '二级页面示例', state: '弹窗态', status: 'draft' },
  { number: '2-4', pageId: 'secondaryExample', page: '二级页面示例', state: 'Toast 态', status: 'draft' }
];
