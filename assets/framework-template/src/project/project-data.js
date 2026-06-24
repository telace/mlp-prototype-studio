export const project = {
  name: '新原型项目',
  slug: 'new-mobile-prototype',
  path: '/new-mobile-prototype/',
  defaultTheme: 'light'
};

export const pageDirectory = [
  { id: 'sample', number: '1', label: '一级页面示例', group: '示例页面', level: 'primary', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'secondaryExample', number: '2', label: '二级页面示例', group: '示例页面', level: 'secondary', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'components', number: '3', label: '组件库', group: '规范/文档', level: 'docs', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'uiChecklist', number: '4', label: 'UI设计清单', group: '规范/文档', level: 'docs', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'uiSpec', number: '5', label: 'UI规范说明', group: '规范/文档', level: 'docs', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' },
  { id: 'prompts', number: '6', label: '提示词', group: '提示词', level: 'docs', status: 'draft', updatedAt: '2026-06-22T10:00:00+08:00' }
];

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

export const sampleStates = [
  { id: 'default', label: '默认态' },
  { id: 'drawer', label: '抽屉态' }
];

export const secondaryExampleStates = [
  { id: 'default', label: '默认态' },
  { id: 'sheet', label: 'Sheet 态' },
  { id: 'modal', label: '弹窗态' },
  { id: 'toast', label: 'Toast 态' }
];

export const pageStateOptions = {
  sample: sampleStates,
  secondaryExample: secondaryExampleStates,
  components: [{ id: 'default', label: '默认态' }]
};

export const pageNumberMap = Object.fromEntries(pageDirectory.map((item) => [item.id, item.number]));
const cx = (...classes) => classes.filter(Boolean).join(' ');
export const primaryPageIds = new Set(pageDirectory.filter((item) => item.level === 'primary').map((item) => item.id));
export const getPageNumber = (page) => pageNumberMap[page] || '?';
export const getStateOptions = (page) => pageStateOptions[page] || [{ id: 'default', label: '默认态' }];
export const getPageShellConfig = (page) => {
  const primary = primaryPageIds.has(page);
  const secondary = !primary;
  return {
    primary,
    secondary,
    showBackBar: secondary,
    showTabBar: primary,
    level: primary ? 'primary' : 'secondary',
    screenClassName: cx('screen', primary && 'screen--primary', secondary && 'screen--secondary')
  };
};
export const getStateNumber = (page, stateId = 'default') => {
  const stateIndex = Math.max(0, getStateOptions(page).findIndex((state) => state.id === stateId));
  return `${getPageNumber(page)}-${stateIndex + 1}`;
};

export const pageCopy = {
  sample: {
    title: '一级页面示例',
    purpose: '展示一级页面标准结构：无顶部标题栏，有锁底底部导航，可进入二级页面或打开左侧抽屉。',
    elements: ['顶部状态栏', '页面内容区', '进入二级页面按钮', '打开抽屉按钮', '锁底底部导航'],
    actions: ['点击进入二级页面按钮跳转到二级页面示例', '点击打开抽屉按钮切换到抽屉态', '点击底部导航保持一级页面结构'],
    rules: ['一级页面不显示顶部标题栏和返回按钮', '底部导航必须锁定在手机底部', '页面内容滚动时底部导航保持可见'],
    states: ['默认态：展示一级页面内容和入口按钮', '抽屉态：左侧抽屉覆盖在一级页面上方'],
    permission: '无登录或权限逻辑。后续根据产品需求补充。',
    tracking: '框架初始化阶段不定义业务埋点。后续页面定稿后补充。',
    acceptance: '一级页面没有顶部标题栏；底部导航锁底；按钮可进入二级页面；抽屉态可通过状态查看。'
  },
  secondaryExample: {
    title: '二级页面示例',
    purpose: '展示二级页面标准结构：有锁顶标题栏和返回按钮，没有底部导航，并包含 Sheet、弹窗、Toast 触发示例。',
    elements: ['锁顶标题栏', '返回按钮', '内容滚动区', 'Sheet 触发按钮', '弹窗触发按钮', 'Toast 触发按钮'],
    actions: ['点击返回按钮回到一级页面示例', '点击 Sheet 按钮切换到底部 Sheet 状态', '点击弹窗按钮切换到确认弹窗状态', '点击 Toast 按钮切换到 Toast 状态'],
    rules: ['二级页面必须显示顶部标题栏和返回按钮', '二级页面不显示底部导航', '顶部标题栏在内容滚动时保持可见'],
    states: ['默认态：展示二级页面内容和组件触发按钮', 'Sheet 态：底部 Sheet 覆盖当前页面', '弹窗态：居中阻断弹窗', 'Toast 态：短反馈提示'],
    permission: '无真实权限逻辑。真实项目可按相册、支付、登录等权限补充。',
    tracking: '框架初始化阶段不定义业务埋点。后续页面定稿后补充。',
    acceptance: '二级页面顶部标题栏锁顶；没有底部导航；Sheet、弹窗、Toast 状态可独立查看。'
  },
  components: {
    title: '组件库',
    purpose: '展示框架内置低保真组件样式，后续项目页面应优先复用。',
    elements: ['按钮', '标签', '封面占位', '功能入口', '说明卡片'],
    actions: ['查看组件样式，不承接业务跳转'],
    rules: ['组件库用于规范展示，不作为真实 App 页面'],
    states: ['默认态：展示基础组件'],
    permission: '无权限限制。',
    tracking: '不记录业务埋点。',
    acceptance: '组件样式与工作台视觉保持一致。'
  }
};

export const pageInteractions = {
  sample: [
    { id: 'sample-open-secondary', title: '进入二级页面按钮', trigger: '点击', purpose: '演示一级页面进入二级任务页的导航方式。', effect: '页面切换到二级页面示例，顶部显示标题栏和返回按钮，底部导航隐藏。', bounds: '不提交业务数据。真实项目应替换为具体业务入口。', exceptions: '目标页面不存在时保持当前页并提示。' },
    { id: 'sample-open-drawer', title: '打开左侧抽屉按钮', trigger: '点击', purpose: '演示一级页面内打开左侧抽屉的方式。', effect: '切换到抽屉态，左侧抽屉覆盖当前页面内容。', bounds: '抽屉宽度不超过手机宽度的 78%。', exceptions: '抽屉内容过多时内部滚动。' },
    { id: 'sample-card', title: '一级页面内容卡片', trigger: '悬停 / 查看', purpose: '展示一级页面内卡片和列表的统一层级。', effect: '用于后续替换为真实业务模块。', bounds: '卡片内容由新项目需求决定。', exceptions: '需求未定义时保持占位。' },
    { id: 'sample-tabs', title: '锁底底部导航', trigger: '点击', purpose: '演示一级页面底部导航锁底。', effect: '当前示例保持在一级页面；真实项目可切换一级 Tab。', bounds: '一级页面才显示底部导航。', exceptions: '二级页面不得显示底部导航。' },
    { id: 'sample-drawer', title: '左侧抽屉', trigger: '点击 / 关闭', purpose: '展示菜单、筛选或分层导航的抽屉模式。', effect: '点击遮罩或关闭按钮回到一级页默认态；点击菜单入口或帮助说明进入二级页面；点击筛选条件关闭抽屉并停留在一级页面。', bounds: '使用统一抽屉宽度、间距、圆角和描边变量。', exceptions: '无结果、权限不足、加载失败时需要补充状态。' }
  ],
  secondaryExample: [
    { id: 'secondary-back', title: '顶部返回按钮', trigger: '点击', purpose: '二级页面返回上一级页面。', effect: '返回一级页面示例，并重置到默认态。', bounds: '不提交业务数据。', exceptions: '存在未保存内容时真实项目应增加确认弹窗。' },
    { id: 'secondary-open-sheet', title: '打开 Sheet 按钮', trigger: '点击', purpose: '演示二级页面触发底部 Sheet。', effect: '切换到 Sheet 态，底部面板展示来源选择。', bounds: 'Sheet 内容超出 70% 高度时内部滚动。', exceptions: '数据为空或权限拒绝时展示空/错状态。' },
    { id: 'secondary-open-modal', title: '打开弹窗按钮', trigger: '点击', purpose: '演示二级页面触发阻断确认弹窗。', effect: '切换到弹窗态，居中弹窗显示主次操作。', bounds: '弹窗主操作不超过 1 个，次操作不超过 1 个。', exceptions: '失败、权限不足、能量不足等场景应提供恢复动作。' },
    { id: 'secondary-open-toast', title: '显示 Toast 按钮', trigger: '点击', purpose: '演示二级页面触发短反馈。', effect: '切换到 Toast 态，页面顶部显示短反馈提示。', bounds: '真实产品中 Toast 通常 2-3 秒自动消失。', exceptions: 'Toast 不承载复杂错误说明，复杂错误应使用弹窗或状态页。' },
    { id: 'secondary-sheet', title: '底部 Sheet', trigger: '选择 / 关闭', purpose: '承载临时选择、相册来源、筛选或补充操作。', effect: '点击遮罩关闭 Sheet 回到默认态；点击相册、拍照、历史素材会关闭 Sheet 并切换到顶部 Toast 反馈。', bounds: 'Sheet 遮罩覆盖完整手机画布，包含手机状态栏；使用统一 Sheet 圆角、边距、描边和按钮规范。', exceptions: '相册权限拒绝、素材为空、加载失败时需要补充状态。' },
    { id: 'secondary-modal', title: '确认弹窗', trigger: '确认 / 取消', purpose: '承载阻断确认、失败提示、能量不足或支付挽留。', effect: '点击遮罩或取消按钮关闭弹窗回到默认态；点击确认按钮关闭弹窗并切换到顶部 Toast 反馈。', bounds: '弹窗遮罩覆盖完整手机画布，包含手机状态栏；弹窗宽度和按钮样式使用全局变量。', exceptions: '网络异常或支付失败时提供恢复路径。' },
    { id: 'secondary-toast', title: 'Toast 提示', trigger: '系统反馈', purpose: '承载保存成功、复制成功等轻量反馈。', effect: '真实产品中自动消失；示例中作为状态展示。', bounds: '文案应短，不放操作按钮。', exceptions: '复杂错误不得用 Toast 替代。' }
  ],
  components: [
    { id: 'components-preview', title: '组件示例', trigger: '查看', purpose: '展示框架组件基线。', effect: '后续真实页面复用这些样式。', bounds: '不涉及业务输入输出。', exceptions: '组件缺失时补充组件库。' }
  ]
};

export const uiThemeSpec = [
  { theme: '暗色', variable: '--app-bg', token: '#171A1D', usage: '手机内所有页面主背景。' },
  { theme: '暗色', variable: '--surface-1', token: '#202326', usage: '列表容器、底部栏、表单、弹窗底色。' },
  { theme: '暗色', variable: '--surface-3', token: '#34373A', usage: '强控件、选中容器和深灰功能块。' },
  { theme: '暗色', variable: '--placeholder', token: '#5C5F61', usage: '模板封面、作品封面、Banner、上传预览。' },
  { theme: '暗色', variable: '--border', token: '#33373A', usage: '按钮描边、输入分隔线、控件边界。' },
  { theme: '暗色', variable: '--text-strong', token: '#F4F4F1', usage: '手机暗色背景上的主文字。' },
  { theme: '暗色', variable: '--text-muted', token: '#A7A9A8', usage: '说明、弱提示、二级信息。' },
  { theme: '暗色', variable: '--tabbar-bg', token: '#202326', usage: '手机底部导航浮层背景。' },
  { theme: '亮色', variable: '--app-bg', token: '#F5F5F2', usage: '手机内所有页面主背景。' },
  { theme: '亮色', variable: '--surface-1', token: '#FFFFFF', usage: '列表容器、功能面板、表单、弹窗底色。' },
  { theme: '亮色', variable: '--surface-3', token: '#E3E3DF', usage: '强控件、选中容器和浅色功能块。' },
  { theme: '亮色', variable: '--placeholder', token: '#B8B8B1', usage: '模板封面、作品封面、Banner、上传预览。' },
  { theme: '亮色', variable: '--border', token: '#E1E1DD', usage: '按钮描边、输入分隔线、控件边界。' },
  { theme: '亮色', variable: '--text-strong', token: '#1C1C1A', usage: '手机浅色背景上的主文字。' },
  { theme: '亮色', variable: '--text-muted', token: '#74746E', usage: '说明、弱提示、二级信息。' },
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

export const promptDocs = [
  {
    title: '示例提示词',
    content: '这里放置项目中的可复用提示词。每条提示词应作为独立卡片展示，并支持一键复制全文。'
  }
];

export { cx };
