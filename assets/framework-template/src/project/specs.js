export const uiThemeSpec = [
  { theme: '暗色', variable: '--app-bg', token: '#171A1D', usage: '手机内所有页面主背景。' },
  { theme: '暗色', variable: '--surface-1', token: '#202326', usage: '列表容器、底部栏、表单、弹窗底色。' },
  { theme: '暗色', variable: '--surface-3', token: '#34373A', usage: '强控件、选中容器和深灰功能块。' },
  { theme: '暗色', variable: '--placeholder', token: '#5C5F61', usage: '模板封面、作品封面、Banner、上传预览。' },
  { theme: '暗色', variable: '--border', token: '#33373A', usage: '按钮描边、输入分隔线、控件边界。' },
  { theme: '暗色', variable: '--text-strong', token: '#F4F4F1', usage: '手机暗色背景上的主文字。' },
  { theme: '暗色', variable: '--text-muted', token: '#A7A9A8', usage: '说明、弱提示、二级信息。' },
  { theme: '暗色', variable: '--tabbar-bg', token: '#202326', usage: '手机底部导航浮层背景。' },
  { theme: '亮色', variable: '--app-bg', token: '#F6F7F8', usage: '手机内所有页面主背景。' },
  { theme: '亮色', variable: '--surface-1', token: '#FFFFFF', usage: '列表容器、功能面板、表单、弹窗底色。' },
  { theme: '亮色', variable: '--surface-3', token: '#E1E4E8', usage: '强控件、选中容器和浅色功能块。' },
  { theme: '亮色', variable: '--placeholder', token: '#B7BDC5', usage: '模板封面、作品封面、Banner、上传预览。' },
  { theme: '亮色', variable: '--border', token: '#E0E3E7', usage: '按钮描边、输入分隔线、控件边界。' },
  { theme: '亮色', variable: '--text-strong', token: '#1F2328', usage: '手机浅色背景上的主文字。' },
  { theme: '亮色', variable: '--text-muted', token: '#667085', usage: '说明、弱提示、二级信息。' },
  { theme: '亮色', variable: '--tabbar-bg', token: '#FFFFFF', usage: '手机底部导航浮层背景。' }
];

export const uiTypeSpec = [
  { role: 'App/Hero 标题', size: '26px', line: '31px', weight: '900', usage: '登录标题、关键页面主标题。' },
  { role: '大页面标题', size: '22px', line: '27px', weight: '900', usage: '页面内主标题。' },
  { role: '二级导航标题', size: '16px', line: '22px', weight: '800', usage: '二级页面顶部标题。' },
  { role: '模块标题', size: '18px', line: '22px', weight: '900', usage: '推荐、作品、权益等模块标题。' },
  { role: '卡片标题', size: '14px', line: '18px', weight: '800-900', usage: '模板名、入口名、列表标题。' },
  { role: '正文说明', size: '13px', line: '18px', weight: '700', usage: '状态说明、权益说明、字段提示。' },
  { role: '辅助说明', size: '12px', line: '16px', weight: '700', usage: '弱提示、说明和 meta。' }
];

export const uiSpacingSpec = [
  { name: '手机尺寸', value: '375 x 812', usage: '固定移动端评审画布。' },
  { name: '目录宽度', value: '210px', usage: '左侧项目卡片和页面目录固定宽度，不随内容变化。' },
  { name: '原型列宽', value: '431px', usage: '中间手机原型区域固定宽度，包含状态切换和手机外框。' },
  { name: '说明文档宽度', value: '546px', usage: '右侧 Product Notes 固定宽度，内容超出时仅面板内部滚动。' },
  { name: '三栏间距', value: '20px', usage: '目录、原型、说明文档之间统一间距；桌面总宽 1227px。' },
  { name: '目录更新标签', value: '页面级未读', usage: '页面定义 updatedAt/version，本地按项目和页面保存已读值，未读时在目录显示“更新”。' },
  { name: '页面边距', value: '16px', usage: '手机页面左右边距。' },
  { name: '模块间距', value: '16px / 22px', usage: '常规模块间距 16px，重点区块 22px。' },
  { name: '列表间距', value: '10px', usage: '卡片流、筛选、记录和宫格。' },
  { name: '卡片内边距', value: '12px / 16px', usage: '普通控件 12px，信息卡 16px。' },
  { name: '--radius-card', value: '16px', usage: '主卡片、封面、入口面板。' },
  { name: '--radius-control', value: '12px', usage: '输入框、按钮、小卡片。' },
  { name: '底部操作按钮', value: '44px 高 / 12px 圆角', usage: '底部主操作统一使用。' }
];

export const uiButtonSpec = [
  { name: '描边线宽', value: '1px solid', usage: '所有普通按钮、输入边界、控件分隔线统一使用 1px。' },
  { name: '主按钮', value: '44px 高 / 12px 圆角', usage: '背景 #2A2A2A，描边 #2A2A2A，文字 #FFFFFF。' },
  { name: '次按钮', value: '44px 高 / 12px 圆角', usage: '背景 #1C1C1C，描边 #3A3A3A，文字 #F2F2F2。' },
  { name: '按钮间距', value: '10px / 8px', usage: '双按钮操作组间距 10px，紧凑标签和图标按钮间距 8px。' },
  { name: '紧凑标签', value: '32px 高 / 999px 圆角 / 8px 间距', usage: '筛选、状态、分组切换使用；选中态反白。' },
  { name: '图标按钮', value: '32px 或 36px / 10px 圆角 / 8px 间距', usage: '工具按钮和导航按钮；图标尺寸 16-20px。' },
  { name: '登录授权按钮', value: '48px 高 / 24px 圆角 / 12px 纵向间距', usage: '仅一键登录等登录授权场景使用，不用于底部操作组。' }
];

export const uiPlaceholderSpec = [
  { name: '模板/素材封面', value: '3:4 / 12px 圆角', usage: '纯灰色色块，标题放封面下方，封面内不写文字。' },
  { name: '视频封面', value: '3:4 / 12px 圆角', usage: '同素材封面，仅允许叠加 16-18px 播放图标。' },
  { name: '历史缩略图', value: '1:1 / 8px 圆角', usage: '用于生成记录、历史结果横向列表。' },
  { name: 'Banner 占位', value: '16:7 或固定高度 / 16px 圆角', usage: '纯色块，不放文字、图标或嵌套小块。' },
  { name: '大预览区', value: '4:5 左右 / 16px 圆角', usage: '用于 AI 视频、作品预览等主视觉区域。' },
  { name: '上传占位', value: '自适应稳定高度 / 16px 圆角', usage: '可放一个图标、一行动作文案和一行短提示。' }
];

export const uiComponentSplitSpec = [
  { name: '拆分原则', value: '复用优先 / 功能内聚 / 可独立配置', usage: '同一 UI 块出现 2 次以上、内部交互复杂或有独立状态生命周期时，应拆成可复用组件。' },
  { name: '原子组件', value: '按钮、输入框、图标、头像、标签、占位图', usage: '不可再拆的最小单元，负责单一视觉或交互能力。' },
  { name: '分子组件', value: '搜索栏、商品/模板卡片、上传字段、验证码行', usage: '多个原子组成一个功能块，需定义输入数据、输出事件和内部状态。' },
  { name: '区块组件', value: '顶部导航、Banner 区、瀑布流、底部 Tab、弹窗/Sheet', usage: '多个分子组成页面区域，可跨页面复用并承载加载、空、错误等状态。' },
  { name: '不拆场景', value: '一次性静态文案 / 传参过重的页面布局', usage: '只出现一次且无复用预期，或拆分后参数比直接写更复杂时，保持页面内实现。' },
  { name: '文档颗粒度', value: '组件整体 + 有意义子元素', usage: '卡片、弹窗、工具栏可作为整体说明；内部按钮、输入、封面、标题、价格、徽标等有独立数据或行为时也要单独编号说明。' }
];
