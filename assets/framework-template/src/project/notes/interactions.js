import localNoteEdits from './local-edits.json' with { type: 'json' };

const item = (id, type, title, effect, extra = {}) => ({
  id,
  type,
  title,
  effect,
  kind: extra.kind || 'action',
  dataSource: extra.dataSource || '前端页面配置；真实项目按接口字段替换。',
  composition: extra.composition,
  states: extra.states,
  fields: extra.fields,
  input: extra.input,
  bounds: extra.bounds,
  required: extra.required,
  exceptions: extra.exceptions,
  reviewed: false
});

const content = (id, type, title, dataSource, extra = {}) => item(id, type, title, '① 页面渲染或数据刷新时，按数据来源展示对应内容。', {
  ...extra,
  kind: 'content',
  dataSource
});

const templateItems = (prefix, count, titlePrefix = '模板卡片') => Array.from({ length: count }, (_, index) => item(
  `${prefix}-${index + 1}`,
  '模板卡片',
  `${titlePrefix} ${index + 1}`,
  '① 点击卡片后选中该模板或进入制作页；② 卡片需要展示封面和标题，视频模板展示播放标识。',
  {
    states: '默认态、选中态、加载失败态、空数据态',
    dataSource: '模板列表接口返回：id、title、coverUrl、type。',
    fields: [['id', 'string，模板 ID，后端返回'], ['title', 'string，模板名称，后端返回'], ['coverUrl', 'string，封面地址，后端返回'], ['type', 'video/image，后端返回']]
  }
));

export const basePageInteractions = {
  home: [
    content('home-hero', '标题区', '首页标题区', '前端页面配置。', { composition: '辅助标签 + 页面标题 + 会员入口。' }),
    item('home-member-entry', '按钮', '会员入口', '① 点击进入会员购买页；② 默认展示 Android 购买流程。', { states: '默认态、禁用态' }),
    item('home-ai-video-entry', '功能入口卡片', 'AI 视频入口', '① 点击进入 AI 视频生成页；② 页面显示上传区、模板案例和提示词输入。', { states: '默认态、禁用态' }),
    item('home-works-entry', '功能入口卡片', '作品入口', '① 点击进入作品列表；② 展示用户全部作品。'),
    item('home-credits-entry', '功能入口卡片', '积分入口', '① 点击进入积分中心；② 展示余额、套餐和历史记录。'),
    item('home-profile-entry', '功能入口卡片', '个人中心入口', '① 点击切换到底部 Tab 的我的页面。'),
    item('home-activity-banner', '活动 Banner', '首页活动 Banner', '① 点击进入活动或套餐页；② 如果活动已结束，展示默认积分包。', { dataSource: '运营活动接口返回标题、副标题、跳转目标。', fields: [['title', 'string，活动标题'], ['subtitle', 'string，活动说明'], ['target', 'string，跳转页面']] }),
    item('home-create-more', '按钮', '去制作按钮', '① 点击进入 AI 视频生成页。'),
    item('home-template-groups', '横向标签切换', '推荐分组', '① 横向滑动查看更多分组；② 点击分组后刷新下方推荐流，不跳转页面。', { states: '默认态、选中态、加载态' }),
    content('home-template-feed', '双列列表', '推荐模板列表', '推荐列表接口返回。', { composition: '模板列表容器 + 模板封面 + 模板标题。', states: '加载态、空数据态、加载失败态' }),
    ...templateItems('home-template', 6, '首页推荐模板'),
    item('home-recent-more', '文本按钮', '最近作品查看更多', '① 点击进入作品列表页。'),
    ...templateItems('home-recent', 3, '最近作品'),
    item('home-upload-shortcut', '上传入口', '快速上传入口', '① 点击进入 AI 视频生成页并准备上传参考图。', { states: '默认态、禁用态' }),
    item('global-tabs', '底部导航', '底部 Tab', '① 点击首页/作品/我的切换一级页面；② 一级页面底部导航锁底；③ 二级页面隐藏底部导航。', { states: '默认态、选中态' })
  ],
  works: {
    default: [
      content('works-title', '标题区', '作品列表标题区', '前端页面配置。'),
      item('works-search', '按钮', '作品搜索入口', '① 点击后进入搜索或打开搜索输入；② 空关键词不触发查询。', { states: '默认态、禁用态' }),
      item('works-tabs', '分段控制', '作品类型切换', '① 点击全部/视频/草稿切换列表筛选；② 保持当前页面不跳转。', { states: '默认态、选中态' }),
      content('works-list', '双列作品列表', '作品列表', '作品列表接口返回。', { states: '加载态、空数据态、加载失败态', fields: [['items', 'array，作品列表，后端返回'], ['status', 'generating/success/failed，后端返回']] }),
      ...templateItems('works-card', 6, '作品卡片')
    ],
    empty: [
      item('works-search', '按钮', '作品搜索入口', '① 空状态下点击搜索仍可进入搜索；② 没有结果时继续显示空状态。'),
      item('works-tabs', '分段控制', '作品类型切换', '① 切换筛选类型；② 当前类型无数据时展示空作品状态。')
    ]
  },
  profile: [
    item('profile-settings', '按钮', '设置入口', '① 点击进入设置页或设置面板；② 设置页包含账号、协议、客服和隐私入口。'),
    item('profile-user-card', '用户信息卡片', '头像昵称区域', '① 点击头像或登录文案可触发登录流程；② 已登录时展示头像、昵称和用户 ID。', { dataSource: '用户信息接口返回头像、昵称、用户 ID、登录状态。', states: '已登录、未登录、加载失败态' }),
    item('profile-copy-id', '按钮', '复制用户 ID', '① 点击复制用户 ID；② 成功后展示 Toast。', { states: '默认态、加载态、禁用态' }),
    item('profile-member-card', '会员卡片', '会员中心入口', '① 点击进入会员购买页；② 非会员展示付费引导，会员展示权益入口。', { dataSource: '会员权益接口返回会员状态和权益摘要。' }),
    item('profile-credits-entry', '功能入口卡片', '积分中心入口', '① 点击进入积分中心。'),
    item('profile-works-entry', '功能入口卡片', '作品列表入口', '① 点击进入作品列表。'),
    ...templateItems('profile-work', 4, '个人中心作品')
  ],
  aiVideo: {
    default: [
      item('ai-video-style-tabs', '横向标签切换', '视频风格标签', '① 横向滑动查看更多风格；② 点击风格后更新模板案例。', { states: '默认态、选中态' }),
      item('ai-video-upload', '图片上传', '参考图片上传区', '① 点击上传区或底部加号打开相册 Sheet；② 未上传时生成按钮触发相册选择。', { states: '默认态、上传中、上传成功、上传失败', input: '参考图片', required: '是', bounds: 'JPG/PNG/HEIC/WEBP，单图 ≤20MB，建议短边 ≥512px。' }),
      content('ai-video-template-cases', '横向模板列表', '模板案例列表', '模板案例接口返回。', { states: '默认态、选中态、空数据态、加载失败态' }),
      ...templateItems('ai-video-case', 6, '模板案例'),
      item('ai-video-prompt-box', '文本域', '提示词输入框', '① 输入生成提示词；② 加号上传辅助图；③ 发送按钮发起生成。', { input: '提示词、辅助图片', required: '否', bounds: '提示词 0-200 字；辅助图片最多 1 张。' }),
      item('ai-video-generate', '按钮', '生成按钮', '① 已上传图片时点击发起生成；② 未上传图片时先打开相册选择；③ 积分不足时展示积分不足弹窗。', { states: '默认态、加载态、禁用态' })
    ],
    uploaded: [
      item('ai-video-upload', '图片上传', '已上传参考图', '① 展示已上传图片；② 点击删除按钮可移除并回到未上传状态。', { states: '上传成功、上传失败' }),
      item('ai-video-generate', '按钮', '生成按钮', '① 点击后提交图片、模板和提示词；② 进入生成加载弹窗。', { states: '默认态、加载态、禁用态' })
    ],
    template: [
      item('ai-video-style-tabs', '横向标签切换', '视频风格标签', '① 点击不同风格后仅切换模板案例，不跳转页面。'),
      ...templateItems('ai-video-case', 6, '模板案例')
    ],
    album: [
      item('ai-video-album-sheet', '底部 Sheet', '相册选择 Sheet', '① 点击图片缩略图后选中图片并回到已上传状态；② 点击遮罩关闭 Sheet。', { states: '显示态、隐藏态、加载失败态', dataSource: '系统相册授权和本地图片列表。' })
    ],
    loading: [
      item('ai-video-generate', '加载弹窗', '作品生成加载弹窗', '① 展示生成进度；② 点击查看作品详情进入作品详情生成中状态。', { states: '显示态、加载态' })
    ],
    noCredits: [
      item('ai-video-generate', '弹窗', '积分不足弹窗', '① 积分不足时阻断生成；② 点击去充值进入积分中心。', { states: '显示态、隐藏态' })
    ]
  },
  workDetail: [
    content('work-detail-preview', '作品预览', '作品预览区域', '作品详情接口返回视频 URL、封面和生成状态。', { states: '生成中、播放态、失败态、加载失败态' }),
    content('work-detail-meta', '状态信息', '作品状态信息', '作品详情接口返回标题、状态、生成时间和失败原因。'),
    item('work-detail-download', '按钮', '保存作品按钮', '① 完成状态点击保存到相册；② 生成中状态禁用。', { states: '默认态、禁用态、加载态' }),
    item('work-detail-delete', '按钮', '删除作品按钮', '① 点击后触发删除确认；② 删除成功返回作品列表。'),
    item('work-detail-retry', '按钮', '重新制作按钮', '① 失败状态点击进入 AI 视频生成页，并保留原模板参数。')
  ],
  member: [
    content('member-hero', '权益背景区', '会员权益主视觉', '会员配置接口返回标题、权益摘要和平台价格。'),
    item('member-platform-switch', '分段控制', 'iOS/Android 平台切换', '① 点击 Android 或 iOS 切换对应购买规则；② 当前页面不跳转。', { states: '选中态、未选中态' }),
    content('member-benefits', '权益列表', '会员权益列表', '会员配置接口返回权益项。', { fields: [['benefits', 'array，权益名称与描述，后端返回']] }),
    item('member-plan-list', '单选列表', '会员套餐选择', '① 点击套餐后选中；② 底部购买按钮使用当前套餐价格。', { states: '选中态、未选中态' }),
    item('member-agreement', '复选框', '会员协议确认', '① Android 购买前必须手动勾选会员协议和续费协议；② 未勾选点击购买需要阻断提示。', { states: '勾选态、未勾选态、错误态', required: '是' }),
    content('member-ios-note', '说明文本', 'iOS 订阅说明', '前端根据 iOS 平台规则展示。'),
    item('member-pay-button', '按钮', '3 天免费试用按钮', '① 点击后进入支付确认或系统支付；② 支付成功返回来源页面。', { states: '默认态、加载态、禁用态' }),
    item('member-leave', '文本按钮', '暂不开通按钮', '① 点击后展示离开挽留弹窗。'),
    item('member-platform-switch', '弹窗', '挽留/倒计时弹窗', '① 用户离开时展示挽留；② 继续查看后展示倒计时优惠；③ 倒计时结束恢复普通购买页。')
  ],
  credits: [
    content('credits-balance', '余额卡片', '积分余额', '积分账户接口返回余额和冻结积分。', { fields: [['balance', 'number，当前可用积分'], ['frozen', 'number，冻结积分']] }),
    item('credits-package-1', '充值套餐', '600 积分套餐', '① 点击后选中套餐；② 支付按钮按当前套餐创建订单。'),
    item('credits-package-2', '充值套餐', '1800 积分套餐', '① 点击后选中套餐；② 支付按钮按当前套餐创建订单。'),
    item('credits-package-3', '充值套餐', '5000 积分套餐', '① 点击后选中套餐；② 支付按钮按当前套餐创建订单。'),
    item('credits-pay-button', '按钮', '确认充值按钮', '① 点击创建充值订单；② 支付成功后积分到账并写入历史记录。', { states: '默认态、加载态、禁用态' }),
    content('credits-history', '列表', '积分历史记录', '积分流水接口返回充值和消耗记录。', { states: '默认态、空数据态、加载失败态', fields: [['type', 'recharge/consume'], ['amount', 'number，积分变化'], ['createdAt', 'datetime，流水时间']] })
  ],
  components: [
    content('components-preview', '组件示例', '组件示例', '前端组件库静态示例。')
  ]
};

const editItems = localNoteEdits?.items || {};

const mergeInteractionList = (pageId, stateId, list) => {
  const pageEdits = editItems[pageId] || {};
  const stateEdits = pageEdits[stateId] || pageEdits.__default || {};
  if (!Array.isArray(list) || !Object.keys(stateEdits).length) return list;
  return list.map((entry) => stateEdits[entry.id] ? { ...entry, ...stateEdits[entry.id] } : entry);
};

export const pageInteractions = Object.fromEntries(
  Object.entries(basePageInteractions).map(([pageId, value]) => {
    if (Array.isArray(value)) return [pageId, mergeInteractionList(pageId, '__default', value)];
    return [
      pageId,
      Object.fromEntries(
        Object.entries(value).map(([stateId, list]) => [stateId, mergeInteractionList(pageId, stateId, list)])
      )
    ];
  })
);
