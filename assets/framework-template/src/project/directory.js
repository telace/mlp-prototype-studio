export const pageDirectory = [
  { id: 'home', number: '1', label: '首页', group: '一级页面', level: 'primary', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'works', number: '2', label: '作品列表', group: '一级页面', level: 'primary', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'profile', number: '3', label: '个人中心', group: '一级页面', level: 'primary', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'aiVideo', number: '4', label: 'AI视频生成', group: '二级页面', level: 'secondary', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'workDetail', number: '5', label: '作品详情', group: '二级页面', level: 'secondary', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'member', number: '6', label: '会员购买', group: '二级页面', level: 'secondary', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'credits', number: '7', label: '积分中心', group: '二级页面', level: 'secondary', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'components', number: '8', label: '组件库', group: '规范/文档', level: 'secondary', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'uiChecklist', number: '9', label: 'UI设计清单', group: '规范/文档', level: 'docs', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'uiSpec', number: '10', label: 'UI规范说明', group: '规范/文档', level: 'docs', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' },
  { id: 'prompts', number: '11', label: '提示词', group: '提示词', level: 'docs', status: 'draft', updatedAt: '2026-06-29T10:00:00+08:00' }
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
  { number: '1-1', pageId: 'home', page: '首页', state: '默认态', status: 'draft' },
  { number: '2-1', pageId: 'works', page: '作品列表', state: '作品流', status: 'draft' },
  { number: '2-2', pageId: 'works', page: '作品列表', state: '空状态', status: 'draft' },
  { number: '3-1', pageId: 'profile', page: '个人中心', state: '已登录', status: 'draft' },
  { number: '3-2', pageId: 'profile', page: '个人中心', state: '未登录', status: 'draft' },
  { number: '4-1', pageId: 'aiVideo', page: 'AI视频生成', state: '未上传', status: 'draft' },
  { number: '4-2', pageId: 'aiVideo', page: 'AI视频生成', state: '已上传', status: 'draft' },
  { number: '4-3', pageId: 'aiVideo', page: 'AI视频生成', state: '相册选择', status: 'draft' },
  { number: '4-4', pageId: 'aiVideo', page: 'AI视频生成', state: '生成加载', status: 'draft' },
  { number: '5-1', pageId: 'workDetail', page: '作品详情', state: '生成中', status: 'draft' },
  { number: '5-2', pageId: 'workDetail', page: '作品详情', state: '完成', status: 'draft' },
  { number: '5-3', pageId: 'workDetail', page: '作品详情', state: '失败', status: 'draft' },
  { number: '6-1', pageId: 'member', page: '会员购买', state: 'Android', status: 'draft' },
  { number: '6-2', pageId: 'member', page: '会员购买', state: 'iOS', status: 'draft' },
  { number: '6-3', pageId: 'member', page: '会员购买', state: '挽留弹窗', status: 'draft' },
  { number: '6-4', pageId: 'member', page: '会员购买', state: '倒计时优惠', status: 'draft' },
  { number: '7-1', pageId: 'credits', page: '积分中心', state: '默认态', status: 'draft' },
  { number: '7-2', pageId: 'credits', page: '积分中心', state: '支付确认', status: 'draft' }
];
