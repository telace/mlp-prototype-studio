export const project = {
  name: '通用 AI App 原型',
  slug: 'universal-ai-app-prototype',
  path: '/universal-ai-app-prototype/',
  defaultTheme: 'light'
};

export const directoryStatusCopy = {
  approved: '已定稿',
  draft: '调整中'
};
export const themeCopy = {
  dark: '暗色',
  light: '亮色'
};
export const getThemeStorageKey = () => `mlp-theme:${project.slug}`;
export const getProjectDefaultTheme = () => (project.defaultTheme === 'dark' ? 'dark' : 'light');
