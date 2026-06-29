export const supportPages = [
  { id: 'uiChecklist', number: 'S1', label: 'UI设计清单', group: '规范/文档', level: 'docs', status: 'draft' },
  { id: 'uiSpec', number: 'S2', label: 'UI规范说明', group: '规范/文档', level: 'docs', status: 'draft' },
  { id: 'testAcceptance', number: 'S3', label: '测试验收必测点', group: '规范/文档', level: 'docs', status: 'draft', placement: 'settings' },
  { id: 'changelog', number: 'S4', label: '更新日志', group: '规范/文档', level: 'docs', status: 'draft', placement: 'settings' },
  { id: 'prompts', number: 'S5', label: '提示词', group: '提示词', level: 'docs', status: 'draft' }
];

export const supportPageIds = supportPages.map((page) => page.id);
export const settingsRailPageIds = ['components', ...supportPages.filter((page) => page.placement === 'settings').map((page) => page.id)];

export const settingsRailPages = [
  { id: 'components', label: '组件库', description: '复用组件与组件拆分规范' },
  { id: 'testAcceptance', label: '测试验收必测点', description: '上线前高频必测清单' },
  { id: 'changelog', label: '更新日志', description: '版本发布记录' }
];

export function getDirectoryItems(projectPages = []) {
  const existingIds = new Set(projectPages.map((page) => page.id));
  return [
    ...projectPages.filter((page) => !settingsRailPageIds.includes(page.id)),
    ...supportPages.filter((page) => !existingIds.has(page.id) && page.placement !== 'settings')
  ];
}

export function getRouteItems(projectPages = []) {
  const existingIds = new Set(projectPages.map((page) => page.id));
  return [
    ...projectPages,
    ...supportPages.filter((page) => !existingIds.has(page.id))
  ];
}
