export const supportPages = [
  { id: 'uiChecklist', number: 'S1', label: 'UI设计清单', group: '规范/文档', level: 'docs', status: 'draft' },
  { id: 'uiSpec', number: 'S2', label: 'UI规范说明', group: '规范/文档', level: 'docs', status: 'draft' },
  { id: 'changelog', number: 'S3', label: '更新日志', group: '规范/文档', level: 'docs', status: 'draft' },
  { id: 'prompts', number: 'S4', label: '提示词', group: '提示词', level: 'docs', status: 'draft' }
];

export const supportPageIds = supportPages.map((page) => page.id);

export function getDirectoryItems(projectPages = []) {
  const existingIds = new Set(projectPages.map((page) => page.id));
  return [
    ...projectPages,
    ...supportPages.filter((page) => !existingIds.has(page.id))
  ];
}
