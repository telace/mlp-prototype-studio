// Reference values for the optional bundled toolkit, not approved design scales.
// Projects may replace these entries to describe their actual design.
export const uiThemeSpec = [
  { theme: '暗色', variable: '--app-bg', usage: '页面主背景' },
  { theme: '暗色', variable: '--surface-1', usage: '主要表面' },
  { theme: '暗色', variable: '--surface-3', usage: '强调表面' },
  { theme: '暗色', variable: '--placeholder', usage: '媒体占位' },
  { theme: '暗色', variable: '--border', usage: '普通边界' },
  { theme: '暗色', variable: '--text-strong', usage: '主要文字' },
  { theme: '暗色', variable: '--text-muted', usage: '辅助文字' },
  { theme: '亮色', variable: '--app-bg', usage: '页面主背景' },
  { theme: '亮色', variable: '--surface-1', usage: '主要表面' },
  { theme: '亮色', variable: '--surface-3', usage: '强调表面' },
  { theme: '亮色', variable: '--placeholder', usage: '媒体占位' },
  { theme: '亮色', variable: '--border', usage: '普通边界' },
  { theme: '亮色', variable: '--text-strong', usage: '主要文字' },
  { theme: '亮色', variable: '--text-muted', usage: '辅助文字' }
];

export const uiTypeSpec = [
  { role: '页面标题', size: '--mlp-type-page-title-size', line: '--mlp-type-page-title-line', usage: '页面内最高层级标题' },
  { role: '大内容标题', size: '--mlp-type-content-title-size', line: '--mlp-type-content-title-line', usage: '关键内容标题' },
  { role: '导航标题', size: '--mlp-type-nav-title-size', line: '--mlp-type-nav-title-line', usage: 'TopBar和Sheet标题' },
  { role: '条目标题', size: '--mlp-type-item-title-size', line: '--mlp-type-item-title-line', usage: '卡片、列表和区块标题' },
  { role: '正文', size: '--mlp-type-body-size', line: '--mlp-type-body-line', usage: '正文说明' },
  { role: '控件文字', size: '--mlp-type-control-size', line: '--mlp-type-control-line', usage: '按钮和输入内容' },
  { role: '辅助信息', size: '--mlp-type-meta-size', line: '--mlp-type-meta-line', usage: '元数据和弱说明' },
  { role: '最小帮助文字', size: '--mlp-type-helper-size', line: '--mlp-type-helper-line', usage: '字段帮助和卡片附注' }
];

export const uiSpacingSpec = [
  { name: '页面水平边距', token: '--space-page-x', usage: '手机页面左右边距' },
  { name: '区块间距', token: '--space-section', usage: '普通页面区块' },
  { name: '大区块间距', token: '--space-section-lg', usage: '重点内容区块' },
  { name: '列表间距', token: '--space-list', usage: '重复条目与卡片' },
  { name: '行内间距', token: '--space-inline', usage: '图标、标签和文字' },
  { name: '卡片内边距', token: '--space-card', usage: '普通卡片' },
  { name: '大卡片内边距', token: '--space-card-lg', usage: '高信息密度卡片' },
  { name: '控件圆角', token: '--radius-control', usage: '按钮和输入框' },
  { name: '卡片圆角', token: '--radius-card', usage: '内容卡片' },
  { name: 'Sheet圆角', token: '--radius-sheet', usage: '底部Sheet' },
  { name: '描边宽度', token: '--line-width', usage: '组件边界和分割线' }
];

export const uiComponentSpec = [
  { name: 'Button', contract: 'prototype-ui', usage: '普通、小号、大号、禁用和加载动作' },
  { name: 'FormField', contract: 'prototype-ui', usage: '标签、输入、帮助和错误状态' },
  { name: 'SelectionChips', contract: 'prototype-ui', usage: '多项选择和紧凑筛选' },
  { name: 'SurfaceCard / MediaCard', contract: 'prototype-ui', usage: '内容与媒体重复项' },
  { name: 'SettingsRow', contract: 'prototype-ui', usage: '标签、值和尾部动作行' },
  { name: 'BottomSheet / Modal / Toast', contract: 'prototype-ui', usage: '反馈层和独立页面状态' },
  { name: 'ScrollablePageWithActions', contract: 'prototype-ui', usage: '带锁底动作的滚动页面' }
];
