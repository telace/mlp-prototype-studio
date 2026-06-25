export const project = {
  name: '新原型项目',
  slug: 'new-mobile-prototype',
  path: '/new-mobile-prototype/',
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
