import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Eraser,
  Grid2X2,
  Home,
  ImagePlus,
  Loader2,
  Mail,
  Play,
  Plus,
  Redo2,
  Search,
  Send,
  Settings,
  Share2,
  Sparkles,
  Undo2,
  User,
  WandSparkles,
  X
} from 'lucide-react';
import './styles.css';

const project = {
  name: 'AI 工具整体 App',
  slug: 'ai-tool-app',
  path: '/ai-tool-app/'
};

const categories = [
  { id: 'hot', title: '热门', icon: 'fire', items: ['OOTD', '卡通职业', '元气慵懒', '证件照'] },
  { id: 'video', title: 'AI视频', icon: 'star', items: ['换装短片', '职业形象', '旅行转场', '写真动效'] },
  { id: 'ootd', title: 'OOTD', icon: 'hat', items: ['通勤风', '街拍风', '约会风', '简约风'] }
];

const homeRecommendations = [
  { name: 'OOTD', category: '热门', group: 'recommend', tone: 0 },
  { name: '元气慵懒', category: '热门', group: 'recommend', tone: 1 },
  { name: '旅行写真', category: '旅行', group: 'recommend', tone: 2 },
  { name: '通勤风', category: 'OOTD', group: 'recommend', tone: 0 },
  { name: '棚拍写真', category: '写真', group: 'recommend', tone: 1 },
  { name: '精修证件', category: '证件照', group: 'recommend', tone: 2 },
  { name: '职业形象', category: '职业', group: 'recommend', tone: 0 },
  { name: '街拍风', category: 'OOTD', group: 'recommend', tone: 1 },
  { name: '换装短片', category: 'AI视频', group: 'video', tone: 1 },
  { name: '旅行转场', category: 'AI视频', group: 'video', tone: 0 },
  { name: '写真动效', category: 'AI视频', group: 'video', tone: 2 },
  { name: '街拍短片', category: 'AI视频', group: 'video', tone: 1 },
  { name: '职业开场', category: 'AI视频', group: 'video', tone: 0 },
  { name: '轻舞模板', category: 'AI视频', group: 'video', tone: 2 },
  { name: '聚会转场', category: 'AI视频', group: 'video', tone: 1 },
  { name: '氛围短片', category: 'AI视频', group: 'video', tone: 0 },
  { name: '通勤风', category: 'OOTD', group: 'ootd', tone: 0 },
  { name: '街拍风', category: 'OOTD', group: 'ootd', tone: 2 },
  { name: '约会风', category: 'OOTD', group: 'ootd', tone: 1 },
  { name: '简约风', category: 'OOTD', group: 'ootd', tone: 1 },
  { name: '运动风', category: 'OOTD', group: 'ootd', tone: 0 },
  { name: '校园风', category: 'OOTD', group: 'ootd', tone: 2 },
  { name: '法式风', category: 'OOTD', group: 'ootd', tone: 1 },
  { name: '度假风', category: 'OOTD', group: 'ootd', tone: 0 },
  { name: '卡通职业', category: '热门', group: 'career', tone: 2 },
  { name: '职业形象', category: 'AI视频', group: 'career', tone: 2 },
  { name: '证件照', category: '热门', group: 'career', tone: 1 },
  { name: '商务形象', category: '职业', group: 'career', tone: 0 },
  { name: '简历头像', category: '职业', group: 'career', tone: 2 },
  { name: '白领通勤', category: '职业', group: 'career', tone: 1 },
  { name: '主持人照', category: '职业', group: 'career', tone: 0 },
  { name: '创业者照', category: '职业', group: 'career', tone: 2 },
  { name: '棚拍写真', category: '写真', group: 'portrait', tone: 2 },
  { name: '自然光', category: '写真', group: 'portrait', tone: 0 },
  { name: '胶片感', category: '写真', group: 'portrait', tone: 1 },
  { name: '杂志封面', category: '写真', group: 'portrait', tone: 2 },
  { name: '黑白肖像', category: '写真', group: 'portrait', tone: 0 },
  { name: '轻奢写真', category: '写真', group: 'portrait', tone: 1 },
  { name: '户外人像', category: '写真', group: 'portrait', tone: 2 },
  { name: '复古棚拍', category: '写真', group: 'portrait', tone: 0 },
  { name: '精修证件', category: '证件照', group: 'idphoto', tone: 0 },
  { name: '白底证件', category: '证件照', group: 'idphoto', tone: 1 },
  { name: '蓝底证件', category: '证件照', group: 'idphoto', tone: 2 },
  { name: '红底证件', category: '证件照', group: 'idphoto', tone: 0 },
  { name: '护照照', category: '证件照', group: 'idphoto', tone: 1 },
  { name: '签证照', category: '证件照', group: 'idphoto', tone: 2 },
  { name: '职业证件', category: '证件照', group: 'idphoto', tone: 0 },
  { name: '学生证件', category: '证件照', group: 'idphoto', tone: 1 },
  { name: '旅行写真', category: '旅行', group: 'travel', tone: 1 },
  { name: '海边度假', category: '旅行', group: 'travel', tone: 2 },
  { name: '城市漫步', category: '旅行', group: 'travel', tone: 0 },
  { name: '雪山远景', category: '旅行', group: 'travel', tone: 1 },
  { name: '森林露营', category: '旅行', group: 'travel', tone: 2 },
  { name: '日落公路', category: '旅行', group: 'travel', tone: 0 },
  { name: '咖啡街区', category: '旅行', group: 'travel', tone: 1 },
  { name: '古城旅拍', category: '旅行', group: 'travel', tone: 2 }
];

const homeFilters = [
  { id: 'recommend', label: '推荐' },
  { id: 'video', label: '视频' },
  { id: 'ootd', label: 'OOTD' },
  { id: 'career', label: '职业' },
  { id: 'portrait', label: '写真' },
  { id: 'idphoto', label: '证件' },
  { id: 'travel', label: '旅行' }
];

const videoTemplates = ['OOTD', '通勤', '轻舞', '写真', '旅行', '街拍', '职业', '聚会', '氛围'];
const creationRecords = ['原图', '修图', '换装', '发型', '艺术'];
const bodyTemplateCases = ['丰胸', '腹肌', '增加锁骨', '瘦身', '瘦腿', '直角肩'];
const createSubstates = [
  { id: 'create', label: '工作台' },
  { id: 'createEmpty', label: '未制作' },
  { id: 'createBody', label: 'AI美体' },
  { id: 'createTemplate', label: '模板' }
];
const profileStates = [
  { id: 'loggedOut', label: '未登录' },
  { id: 'loggedInFree', label: '非会员' },
  { id: 'loggedInVip', label: '会员' }
];
const aiVideoStates = [
  { id: 'template', label: '模板选择' },
  { id: 'photoPicker', label: '选择照片' }
];
const loginCnStates = [
  { id: 'cnOneTap', label: '一键登录' },
  { id: 'cnPhoneForm', label: '验证码登录' },
  { id: 'cnCodeSent', label: '验证码已发' }
];
const loginGlobalStates = [
  { id: 'globalChoice', label: '选择方式' },
  { id: 'globalEmailForm', label: '邮箱登录' },
  { id: 'globalCodeSent', label: '验证码已发' },
  { id: 'globalGoogleAuth', label: 'Google授权' },
  { id: 'globalFailed', label: '失败弹窗' }
];
const resultStates = [
  { id: 'processing', label: '生成中' },
  { id: 'completed', label: '生成完成' },
  { id: 'failed', label: '生成失败' }
];

const pageDirectory = [
  { id: 'home', number: '1', label: '首页', group: '一级页面', level: 'primary', status: 'approved' },
  { id: 'profile', number: '2', label: '我的', group: '一级页面', level: 'primary', status: 'approved' },
  { id: 'create', number: '3', label: '创作工作台', group: '二级页面', level: 'secondary', status: 'approved' },
  { id: 'aiVideo', number: '5', label: 'AI 视频制作', group: '二级页面', level: 'secondary', status: 'approved', hasUpdate: true },
  { id: 'loginCn', number: '6', label: '国内登录', group: '登录流程', level: 'secondary', status: 'approved', hasUpdate: true },
  { id: 'loginGlobal', number: '14', label: '海外登录', group: '登录流程', level: 'secondary', status: 'approved', hasUpdate: true },
  { id: 'list', number: '7', label: '模板列表', group: '二级页面', level: 'secondary', status: 'approved' },
  { id: 'result', number: '8', label: '作品详情', group: '二级页面', level: 'secondary', status: 'approved' },
  { id: 'memberCenter', number: '11', label: '会员中心', group: '二级页面', level: 'secondary', status: 'approved' },
  { id: 'energyCenter', number: '12', label: '能量中心', group: '二级页面', level: 'secondary', status: 'approved' },
  { id: 'components', number: '9', label: '组件库', group: '规范/文档', level: 'secondary', status: 'approved' },
  { id: 'uiChecklist', number: '10', label: 'UI设计清单', group: '规范/文档', level: 'secondary', status: 'approved' },
  { id: 'uiSpec', number: '13', label: 'UI规范说明', group: '规范/文档', level: 'secondary', status: 'approved' }
];

const directoryStatusCopy = {
  approved: '已定稿',
  draft: '调整中'
};

const uiDesignChecklist = [
  { number: '1-1', page: '首页', state: '默认态', status: 'approved' },
  { number: '2-1', page: '我的', state: '未登录态', status: 'approved' },
  { number: '2-2', page: '我的', state: '已登录非会员态', status: 'approved' },
  { number: '2-3', page: '我的', state: '已登录会员态', status: 'approved' },
  { number: '3-1', page: '创作工作台', state: '工作台默认态', status: 'approved' },
  { number: '3-2', page: '创作工作台', state: '未制作态', status: 'approved' },
  { number: '3-3', page: '创作工作台', state: 'AI美体态', status: 'approved' },
  { number: '3-4', page: '创作工作台', state: '模板态', status: 'approved' },
  { number: '5-1', page: 'AI 视频制作', state: '模板选择态', status: 'approved', hasUpdate: true },
  { number: '5-2', page: 'AI 视频制作', state: '选择照片态', status: 'approved', hasUpdate: true },
  { number: '6-1', page: '国内登录', state: '手机号一键登录态', status: 'approved', hasUpdate: true },
  { number: '6-2', page: '国内登录', state: '手机号验证码登录态', status: 'approved', hasUpdate: true },
  { number: '6-3', page: '国内登录', state: '短信验证码已发送态', status: 'approved', hasUpdate: true },
  { number: '14-1', page: '海外登录', state: '选择登录方式态', status: 'approved', hasUpdate: true },
  { number: '14-2', page: '海外登录', state: '邮箱登录表单态', status: 'approved', hasUpdate: true },
  { number: '14-3', page: '海外登录', state: '邮件验证码已发送态', status: 'approved', hasUpdate: true },
  { number: '14-4', page: '海外登录', state: 'Google授权弹窗态', status: 'approved', hasUpdate: true },
  { number: '14-5', page: '海外登录', state: '失败弹窗态', status: 'approved', hasUpdate: true },
  { number: '7-1', page: '模板列表', state: '默认态', status: 'approved' },
  { number: '8-1', page: '作品详情', state: '生成中', status: 'approved' },
  { number: '8-2', page: '作品详情', state: '生成完成', status: 'approved' },
  { number: '8-3', page: '作品详情', state: '生成失败', status: 'approved' },
  { number: '11-1', page: '会员中心', state: '默认态', status: 'approved' },
  { number: '12-1', page: '能量中心', state: '默认态', status: 'approved' },
  { number: '9-1', page: '组件库', state: '默认态', status: 'approved' }
];

const primaryPages = new Set(pageDirectory.filter((item) => item.level === 'primary').map((item) => item.id));
const isPrimaryPage = (page) => primaryPages.has(page);
const createStateIds = new Set(createSubstates.map((item) => item.id));
const isCreateState = (page) => createStateIds.has(page);
const pageNumberMap = Object.fromEntries(pageDirectory.map((item) => [item.id, item.number]));
const getCanonicalPageId = (page) => isCreateState(page) ? 'create' : page;
const getPageNumber = (page) => pageNumberMap[getCanonicalPageId(page)] || '?';
const isLoginPage = (page) => page === 'loginCn' || page === 'loginGlobal';
const getLoginStates = (page) => page === 'loginCn' ? loginCnStates : loginGlobalStates;
const getDefaultLoginState = (page) => page === 'loginCn' ? 'cnOneTap' : 'globalChoice';
const getStateNumber = (page, profileState = 'loggedInVip', resultState = 'processing', aiVideoState = 'template', loginState = 'choice') => {
  if (isCreateState(page)) {
    const index = createSubstates.findIndex((item) => item.id === page);
    return `3-${index + 1}`;
  }
  if (page === 'aiVideo') {
    const index = aiVideoStates.findIndex((item) => item.id === aiVideoState);
    return `5-${Math.max(index, 0) + 1}`;
  }
  if (page === 'profile') {
    const index = profileStates.findIndex((item) => item.id === profileState);
    return `2-${index + 1}`;
  }
  if (page === 'result') {
    const index = resultStates.findIndex((item) => item.id === resultState);
    return `8-${index + 1}`;
  }
  if (isLoginPage(page)) {
    const states = getLoginStates(page);
    const index = states.findIndex((item) => item.id === loginState);
    return `${getPageNumber(page)}-${Math.max(index, 0) + 1}`;
  }
  return `${getPageNumber(page)}-1`;
};

function getProfileStateSpec(profileState) {
  const stateMap = {
    loggedOut: {
      title: '我的 - 未登录态',
      elements: ['未登录头像和昵称', '右上角设置按钮', '会员引导卡片', '能量中心入口', '图片/视频作品页签', '空作品状态'],
      actions: ['手机外层可切换到非会员或会员状态', '点击会员卡片查看登录后权益引导', '点击能量中心入口进入能量中心', '点击右上角设置入口进入设置页'],
      rules: ['不显示独立快捷登录按钮', '能量中心只保留入口，不显示能量余额和暂无可用能量文案', '作品列表为空状态', '不展示真实用户 ID'],
      states: ['未登录默认：展示游客信息和空作品状态', '异常：资产接口不请求或忽略登录资产数据']
    },
    loggedInFree: {
      title: '我的 - 已登录非会员态',
      elements: ['用户头像和昵称', '右上角设置按钮', '开通会员卡片', '能量中心入口', '图片/视频作品页签', '空作品状态'],
      actions: ['手机外层可切换到未登录或会员状态', '点击开通会员卡片进入会员购买页', '点击能量中心入口进入能量中心', '点击右上角设置入口进入设置页'],
      rules: ['会员卡片展示付费引导文案', '能量中心只保留入口，不显示能量余额和暂无可用能量文案', '作品列表为空状态', '保留底部导航'],
      states: ['非会员默认：展示开通会员和空作品状态', '异常：会员权益加载失败时保留付费引导']
    },
    loggedInVip: {
      title: '我的 - 已登录会员态',
      elements: ['用户头像和昵称', '右上角设置按钮', '会员卡片', '能量中心入口和剩余能量', '图片/视频作品页签', '双列瀑布流作品列表'],
      actions: ['手机外层可切换到未登录或非会员状态', '点击会员卡片进入会员权益页', '点击能量中心查看能量余额、充值购买和消耗明细', '点击图片/视频页签切换作品类型', '点击作品项进入作品详情页', '点击右上角设置入口进入设置页'],
      rules: ['会员卡片展示权益摘要和续费引导，不展示剩余天数', '能量中心展示剩余能量', '作品列表按图片/视频页签与双列瀑布流展示', '视频作品叠加播放图标'],
      states: ['会员默认：展示会员权益、能量和作品列表', '异常：作品加载失败时展示重试']
    }
  };
  const stateSpec = stateMap[profileState] || stateMap.loggedInVip;
  return {
    ...pageCopy.profile,
    ...stateSpec
  };
}

function getLoginStateSpec(page, loginState) {
  const isCn = page === 'loginCn';
  const base = isCn ? pageCopy.loginCn : pageCopy.loginGlobal;
  const stateMap = isCn ? {
    cnOneTap: {
      title: '国内登录 - 手机号一键登录态',
      purpose: '按国内运营商授权页结构，让用户确认使用本机脱敏手机号快速登录。',
      elements: ['授权页标题', '品牌/服务标识', '脱敏手机号', '本机号码一键登录按钮', '其他手机号登录入口', '运营商协议区'],
      actions: ['点击手机号一键登录进入授权页', '点击本机号码一键登录完成登录', '点击其他手机号登录切换到验证码登录表单'],
      rules: ['手机号需脱敏展示', '必须展示运营商认证服务协议入口', '用户未同意协议时不可完成授权', '运营商授权失败进入失败弹窗'],
      states: ['默认：展示脱敏手机号和一键登录按钮', '成功：获取 token 后进入已登录态', '异常：授权失败、超时、运营商维护或网络异常展示失败弹窗'],
      acceptance: ['一键登录使用授权页结构表达', '授权页不展示手机号输入框', '提供切换其他手机号登录入口']
    },
    cnPhoneForm: {
      title: '国内登录 - 验证码登录表单态',
      purpose: '用户输入手机号并获取短信验证码登录。',
      elements: ['返回选择方式按钮', '手机号输入框', '短信验证码输入框', '获取验证码按钮', '协议勾选', '登录按钮'],
      actions: ['输入手机号', '点击获取验证码', '输入短信验证码', '勾选协议后登录'],
      rules: ['手机号为 11 位中国大陆手机号', '验证码为 6 位数字', '60 秒内不可重复获取验证码'],
      states: ['默认：展示手机号和验证码输入', '异常：手机号格式错误、发送失败、验证码错误或过期'],
      tracking: ['cn_phone_form_view', 'sms_code_send_click', 'sms_login_submit_click'],
      acceptance: ['表单只在选择验证码登录后出现', '手机号输入和验证码输入分区清晰']
    },
    cnCodeSent: {
      title: '国内登录 - 短信验证码已发送态',
      elements: ['手机号输入框', '短信验证码输入框', '倒计时按钮', '验证码发送提示', '确认登录按钮'],
      actions: ['查看短信已发送提示', '输入验证码', '倒计时结束后重新发送', '点击确认登录'],
      rules: ['倒计时期间不可重复发送', '验证码有效期以服务端为准', '登录失败展示失败弹窗'],
      states: ['成功：展示验证码已发送和倒计时', '异常：短信未送达、验证码过期或错误'],
      acceptance: ['发送后有明确反馈', '确认登录按钮可进入已登录态或失败弹窗']
    }
  } : {
    globalChoice: {
      title: '海外登录 - 选择方式态',
      purpose: '面向海外用户，先选择邮箱验证码登录或 Google 登录。',
      elements: ['邮箱登录入口', 'Google 登录入口', '协议提示'],
      actions: ['点击邮箱登录进入邮箱表单', '点击 Google 登录弹出授权弹窗'],
      rules: ['默认态不展示邮箱输入框', '两个方式互斥，点击后进入对应步骤', '不展示手机号登录'],
      states: ['默认：展示邮箱和 Google 两种方式', '异常：Google 配置不可用时仍可选择邮箱登录'],
      tracking: ['login_global_view', 'global_email_click', 'global_google_click'],
      acceptance: ['海外登录默认只出现邮箱和 Google 两个入口', '点击后才展示对应表单或弹窗']
    },
    globalEmailForm: {
      title: '海外登录 - 邮箱登录表单态',
      purpose: '用户输入邮箱并获取邮件验证码登录。',
      elements: ['返回选择方式按钮', '邮箱输入框', '邮件验证码输入框', '获取验证码按钮', '协议勾选', '登录按钮'],
      actions: ['输入邮箱', '点击获取验证码', '输入邮件验证码', '勾选协议后登录'],
      rules: ['邮箱需符合标准格式', '验证码为 6 位数字或字母数字码', '60 秒内不可重复获取验证码'],
      states: ['默认：展示邮箱和验证码输入', '异常：邮箱格式错误、邮件发送失败、验证码错误或过期'],
      tracking: ['global_email_form_view', 'email_code_send_click', 'email_login_submit_click'],
      acceptance: ['邮箱表单只在选择邮箱登录后出现', '不与 Google 授权同屏展示']
    },
    globalCodeSent: {
      title: '海外登录 - 邮件验证码已发送态',
      elements: ['邮箱输入框', '邮件验证码输入框', '倒计时按钮', '验证码发送提示', '确认登录按钮'],
      actions: ['查看邮件已发送提示', '输入验证码', '倒计时结束后重新发送', '点击确认登录'],
      rules: ['倒计时期间不可重复发送', '验证码有效期以服务端为准', '登录失败展示失败弹窗'],
      states: ['成功：展示验证码已发送和倒计时', '异常：邮件未送达、验证码过期或错误'],
      acceptance: ['发送后有明确反馈', '确认登录按钮可进入已登录态或失败弹窗']
    },
    globalGoogleAuth: {
      title: '海外登录 - Google 授权弹窗态',
      elements: ['登录方式选择页', 'Google 授权弹窗', '取消按钮', '完成按钮'],
      actions: ['点击 Google 登录后弹窗', '完成授权后进入已登录态', '取消授权关闭弹窗'],
      rules: ['Google 授权不展示邮箱验证码表单', '授权失败展示失败弹窗'],
      states: ['弹窗打开：等待授权结果', '异常：用户取消、授权失败或账号冲突'],
      acceptance: ['Google 授权通过弹窗表达', '不替换登录方式选择页']
    },
    globalFailed: {
      title: '海外登录 - 失败弹窗态',
      elements: ['当前登录页', '失败弹窗', '重新选择方式按钮', '重试邮箱登录按钮'],
      actions: ['关闭弹窗重新选择方式', '回到邮箱登录表单重试'],
      rules: ['失败弹窗不挤占页面主体', '失败原因需区分授权取消、验证码错误和服务异常'],
      states: ['弹窗打开：展示失败原因和重试入口'],
      acceptance: ['失败通过弹窗表达', '用户能回到选择方式或邮箱表单']
    }
  };
  return {
    ...base,
    ...(stateMap[loginState] || stateMap[getDefaultLoginState(page)])
  };
}

function getResultStateSpec(resultState) {
  const stateMap = {
    processing: {
      title: '作品详情 - 生成中',
      purpose: '展示 AI 作品正在生成的等待状态，让用户确认任务仍在处理。',
      elements: ['全屏作品占位区', '生成中进度提示', '底部锁定生成中提示'],
      actions: ['生成中不提供取消操作，等待任务完成或失败后再处理'],
      rules: ['作品展示区铺满页面可用高度', '生成中不显示保存按钮可用态', '底部操作固定在屏幕底部', '不提供分享按钮', '不提供取消生成操作'],
      states: ['生成中：展示处理中动效和文案', '异常：生成超时后切换到生成失败状态'],
      acceptance: ['生成中状态清楚', '保存不可用', '底部操作锁定且不遮挡主要展示区']
    },
    completed: {
      title: '作品详情 - 生成完成',
      purpose: '全屏展示 AI 生成完成的作品，并提供保存和重新生成操作。',
      elements: ['全屏作品展示区', '完成状态提示', '底部锁定操作区', '保存作品按钮', '重新生成按钮'],
      actions: ['点击保存进入我的作品', '点击重新生成保留原图重试'],
      rules: ['作品展示区铺满页面可用高度', '底部按钮固定在屏幕底部', '不提供分享按钮', '免费用户结果可带轻量水印'],
      states: ['完成：展示作品预览和可用操作', '异常：保存失败时保留当前作品并提示重试'],
      acceptance: ['作品详情铺满全屏', '成功后展示保存和重新生成', '页面不出现分享按钮']
    },
    failed: {
      title: '作品详情 - 生成失败',
      purpose: '展示生成失败原因，并提供重试或重新选择模板的恢复路径。',
      elements: ['全屏失败状态区', '失败原因提示', '底部锁定操作区', '重新生成按钮', '重新选择按钮'],
      actions: ['点击重新生成使用原配置再次提交', '点击重新选择返回 AI 视频页'],
      rules: ['失败状态保留原任务上下文', '底部操作固定在屏幕底部', '失败原因需要可读但不暴露技术错误码'],
      states: ['失败：展示失败原因和恢复操作', '异常：重试仍失败时继续停留失败状态'],
      acceptance: ['失败原因清楚', '用户有明确恢复路径', '页面不出现分享按钮']
    }
  };
  const stateSpec = stateMap[resultState] || stateMap.processing;
  return {
    ...pageCopy.result,
    ...stateSpec
  };
}

function getAiVideoStateSpec(aiVideoState) {
  const stateMap = {
    template: {
      title: 'AI视频 - 模板选择态',
      purpose: '让用户先放大浏览 AI 视频模板效果，并在不上传照片的情况下完成模板选择。',
      elements: ['大模板预览区', '横向模板缩略图', '生成同款按钮', '制作消耗提示'],
      actions: ['横向滑动模板缩略图查看更多模板', '点击模板缩略图切换大预览', '点击生成同款进入选择照片态', '点击返回回到首页'],
      rules: ['AI 视频页采用两步操作：先选模板，再选照片', '进入页面默认展示一个大模板预览', '模板缩略图横向滑动且选中态清晰', '点击生成同款前不要求上传照片'],
      states: ['加载：大预览和模板缩略图显示灰阶骨架', '空状态：无模板时展示返回首页入口', '异常：模板不可用时提示并禁用生成同款'],
      permission: '浏览模板不需要登录；点击生成同款进入选择照片时需要登录态校验和相册权限预检查。',
      tracking: ['ai_video_page_view', 'ai_video_template_select', 'ai_video_make_click'],
      acceptance: ['状态编号为 5-1', '大模板预览明显大于缩略图', '点击生成同款后切换到 5-2 选择照片态']
    },
    photoPicker: {
      title: 'AI视频 - 选择照片态',
      purpose: '在已选模板的上下文中让用户从相册选择参考照片，选择后提交 AI 视频制作任务。',
      elements: ['相册选择面板', '相册取消按钮', '照片网格', '能量不足弹窗'],
      actions: ['点击取消返回模板选择态', '点击任意照片提交制作前校验能量', '能量不足时弹出充值提示', '点击去充值进入能量中心'],
      rules: ['选择照片态不改变已选模板', '照片选择成功后才真正提交制作任务', '相册面板必须保留关闭路径', '选择照片后如果能量不足不进入生成结果页'],
      states: ['加载：相册网格显示灰阶骨架', '空状态：无照片权限或无可用照片时展示授权/刷新入口', '异常：相册权限拒绝、照片不可用或能量不足时展示对应提示'],
      permission: '需要登录和相册权限；提交制作需要能量余额满足模板消耗。',
      tracking: ['ai_video_album_view', 'ai_video_album_cancel', 'ai_video_album_select', 'energy_insufficient_view'],
      acceptance: ['状态编号为 5-2', '顶部状态切换可查看选择照片态', '取消可回到模板选择态', '选择照片后的能量不足路径清楚']
    }
  };
  const stateSpec = stateMap[aiVideoState] || stateMap.template;
  return {
    ...pageCopy.aiVideo,
    ...stateSpec
  };
}

const creationBrushButtonInteractions = [
  { id: 'create-undo', title: '撤销按钮', trigger: '点击', effect: '撤销上一步画布编辑操作，例如涂抹、擦除或局部调整。', bounds: '依赖操作栈；没有可撤销步骤时按钮应置灰或点击无效。', exceptions: '撤销失败时保留当前画布并提示重试。' },
  { id: 'create-redo', title: '恢复按钮', trigger: '点击', effect: '恢复刚刚被撤销的一步画布编辑操作。', bounds: '只有执行过撤销后才可用；一旦产生新编辑，恢复栈应清空。', exceptions: '恢复失败时保留当前画布并提示重试。' },
  { id: 'create-smear', title: '涂抹按钮', trigger: '点击', effect: '进入涂抹模式，用户可在画布上标记希望 AI 处理的区域。', bounds: '需要已上传主图；笔触大小由小/中/大按钮决定。', exceptions: '无主图时提示先上传图片；蒙版同步失败时保留本地涂抹结果。' },
  { id: 'create-erase', title: '擦除按钮', trigger: '点击', effect: '进入擦除模式，用户可擦除已经涂抹的区域。', bounds: '需要存在主图和涂抹区域；擦除不影响原图，只修改蒙版。', exceptions: '无蒙版时点击不产生变化；同步失败时保留上一次蒙版。' },
  { id: 'create-brush-small', title: '小笔触按钮', trigger: '点击', effect: '将画布涂抹/擦除笔触切换为小尺寸，适合处理细节边缘。', bounds: '与中笔触、大笔触互斥；只影响后续笔触。', exceptions: '无主图时可预选笔触，但不产生画布变化。' },
  { id: 'create-brush-medium', title: '中笔触按钮', trigger: '点击', effect: '将画布涂抹/擦除笔触切换为中尺寸，作为默认笔触。', bounds: '与小笔触、大笔触互斥；只影响后续笔触。', exceptions: '无主图时可预选笔触，但不产生画布变化。' },
  { id: 'create-brush-large', title: '大笔触按钮', trigger: '点击', effect: '将画布涂抹/擦除笔触切换为大尺寸，适合快速覆盖大面积区域。', bounds: '与小笔触、中笔触互斥；只影响后续笔触。', exceptions: '无主图时可预选笔触，但不产生画布变化。' }
];

const pageCopy = {
  home: {
    title: '首页',
    purpose: '承接用户进入 App 后的主要决策：进入创作工作台、制作 AI 视频、浏览推荐模板。',
    elements: ['顶部工作区', '会员入口', 'AI 创作入口', 'AI 视频入口', '模板库入口', 'Banner 占位', '分类筛选', '双列推荐模板流', '底部 Tab'],
    actions: ['点击 AI 创作进入创作工作台', '点击 AI 视频进入视频制作页', '点击模板库进入模板列表页', '点击推荐分组切换当前素材流', '点击任意素材进入 AI 视频制作页', '点击底部 Tab 切换首页/创作/我的'],
    rules: ['未登录可浏览首页', '生成与保存需要登录', '会员入口常驻首屏', '首页首屏优先展示创作任务入口', '推荐模板以统一双列流展示', '推荐模板卡片仅展示 3:4 封面和标题', '推荐分组只切换当前列表，不跳转页面', '分组较多时横向滑动', '模板封面内不写文字，视频模板只叠加播放图标'],
    states: ['加载：首页骨架屏', '空状态：推荐流无数据时显示占位与刷新入口', '异常：推荐接口失败时保留主按钮'],
    permission: '浏览不需要权限；生成、保存需要登录。',
    tracking: ['home_view', 'vip_entry_click', 'create_tab_click', 'ai_video_click', 'template_library_click', 'template_card_click'],
    acceptance: ['首屏同时露出会员、AI 创作和 AI 视频', '栏目卡片可点击', '右侧说明随页面切换']
  },
  aiVideo: {
    title: 'AI视频',
    purpose: '让用户先放大浏览 AI 视频模板效果，选择模板后点击生成同款，再从相册选择照片发起制作。',
    elements: ['大模板预览区', '横向模板缩略图', '生成同款按钮', '相册选择弹层', '制作消耗提示'],
    actions: ['横向滑动模板缩略图查看更多模板', '点击模板缩略图切换大预览', '点击生成同款弹出相册选择照片', '点击相册照片后提交制作并进入作品详情页', '点击返回回到首页'],
    rules: ['AI 视频页采用两步操作：先选模板，再选照片', '进入页面默认展示一个大模板预览', '模板缩略图横向滑动且选中态清晰', '点击生成同款前不要求上传照片', '相册弹层中选择照片后才真正提交制作任务'],
    states: ['加载：大预览和模板缩略图显示灰阶骨架', '空状态：无模板时展示返回首页入口', '异常：相册权限拒绝、照片不可用或制作失败时允许重试'],
    permission: '浏览模板不需要登录；选择照片和提交制作需要登录及相册权限；部分模板或高清导出需要会员或能量。',
    tracking: ['ai_video_page_view', 'ai_video_template_select', 'ai_video_make_click', 'ai_video_album_select'],
    acceptance: ['页面为二级页，显示顶部返回与标题且不显示底部 Tab', '大模板预览明显大于缩略图', '点击生成同款后出现相册选择弹层', '选择照片后进入作品详情页']
  },
  list: {
    title: '模板列表',
    purpose: '展示某一栏目下的全部模板，支持搜索、筛选和进入 AI 制作页。',
    elements: ['搜索框', '筛选标签', '模板网格', '排序入口'],
    actions: ['点击模板进入 AI 视频制作页', '点击搜索输入关键词', '点击筛选切换模板类型'],
    rules: ['默认按热度排序', '支持按最新和热门筛选', '搜索无结果展示空状态'],
    states: ['加载：网格骨架屏', '空状态：无匹配模板', '异常：接口失败展示重试'],
    permission: '浏览不需要登录；使用模板需要登录。',
    tracking: ['template_list_view', 'template_search', 'template_filter_click'],
    acceptance: ['列表标题与来源栏目一致', '模板卡片信息完整', '搜索空状态可返回默认列表']
  },
  loginCn: {
    title: '国内登录',
    purpose: '为国内用户默认提供手机号一键登录，并在同页提供切换到短信验证码登录的入口。',
    elements: ['运营商授权页', '脱敏手机号', '本机号码一键登录按钮', '其他手机号登录入口', '手机号验证码表单'],
    actions: ['默认进入一键登录授权页', '点击本机号码一键登录完成授权登录', '点击其他手机号登录切换到手机号验证码表单', '登录成功后进入我的页面'],
    rules: ['国内登录不需要先展示选择方式页', '一键登录不展示手机号输入框', '验证码登录由授权页内的其他手机号登录进入', '手机号为 11 位中国大陆手机号', '未勾选协议时登录按钮禁用'],
    states: ['手机号一键登录授权页', '手机号验证码表单', '短信验证码已发送'],
    permission: '登录页公开访问；登录成功后可使用导入、生成、保存、会员和能量能力。',
    tracking: ['login_cn_view', 'cn_one_tap_click', 'cn_code_login_click', 'sms_code_send_click', 'sms_login_submit_click'],
    acceptance: ['国内登录独立展示', '默认直接进入一键登录授权页', '一键登录页提供其他手机号登录入口', '每一步都有可查看原型状态']
  },
  loginGlobal: {
    title: '海外登录',
    purpose: '为海外用户提供邮箱验证码登录和 Google 登录两条路径。',
    elements: ['邮箱登录入口', 'Google 登录入口', 'Google 授权弹窗', '邮箱验证码表单', '失败弹窗'],
    actions: ['先选择邮箱或 Google 登录方式', '选择邮箱后展示邮箱验证码表单', '选择 Google 后弹出授权弹窗', '登录成功后进入我的页面'],
    rules: ['默认页只提供邮箱和 Google 两种方式入口', '邮箱表单仅在用户选择后展示', 'Google 授权使用弹窗表达', '不展示手机号登录', '未勾选协议时登录按钮禁用'],
    states: ['选择方式', '邮箱登录表单', '邮件验证码已发送', 'Google 授权弹窗', '失败弹窗'],
    permission: '登录页公开访问；登录成功后可使用导入、生成、保存、会员和能量能力。',
    tracking: ['login_global_view', 'global_email_click', 'global_google_click', 'email_code_send_click', 'email_login_submit_click'],
    acceptance: ['海外登录独立展示', '默认页不展示邮箱输入框', '每一步都有可查看原型状态']
  },
  result: {
    title: '作品详情',
    purpose: '展示 AI 作品任务详情，覆盖生成中、生成完成和生成失败三个状态。',
    elements: ['全屏作品展示区', '任务状态提示', '底部锁定操作区'],
    actions: ['手机外层可切换生成中、生成完成、生成失败状态', '点击底部按钮执行保存、重试或重新选择'],
    rules: ['作品展示区铺满页面可用高度', '底部按钮固定在屏幕底部', '不提供分享按钮', '不同任务状态展示不同底部操作'],
    states: ['生成中：展示处理进度', '生成完成：展示作品和保存入口', '生成失败：展示失败原因和恢复路径'],
    permission: '需要登录；高清保存和去水印需要会员。',
    tracking: ['generation_start', 'generation_success', 'generation_retry', 'save_work_click'],
    acceptance: ['作品详情铺满全屏', '底部操作锁定且不遮挡主要作品', '三种状态可切换查看', '页面不出现分享按钮']
  },
  memberCenter: {
    title: '会员中心',
    purpose: '通过大背景图和权益文案展示会员价值，承接我的页会员卡片点击并引导开通/续费。',
    elements: ['大背景图占位', '会员权益文案', '权益亮点', '套餐选择', '开通/续费按钮'],
    actions: ['点击套餐切换选中套餐', '点击3天免费试用进入试用开通流程', '未支付点击返回时弹出挽留弹窗'],
    rules: ['二级页面显示顶部返回与标题，不显示底部 Tab', '套餐互斥选择', '会员权益用灰阶卡片表达，不展示剩余天数', '未登录进入时真实产品应先触发登录'],
    states: ['加载：权益和套餐展示骨架', '空状态：套餐不可用时保留权益说明和重试入口', '异常：支付拉起失败时提示重试'],
    permission: '浏览权益可未登录；购买、续费和支付需要登录。',
    tracking: ['member_center_view', 'member_plan_click', 'member_pay_click'],
    acceptance: ['从我的页会员卡片可进入', '能看到会员权益和套餐入口', '页面为二级页且无底部导航']
  },
  energyCenter: {
    title: '能量中心',
    purpose: '展示用户能量余额、充值购买入口和功能消耗明细，承接我的页能量中心入口。',
    elements: ['能量余额卡片', '能量充值套餐', '能量消耗明细', '能量规则说明'],
    actions: ['点击充值套餐切换选中套餐', '点击购买能量进入支付确认', '点击消耗明细查看对应功能消耗来源', '点击返回回到我的页面'],
    rules: ['二级页面显示顶部返回与标题，不显示底部 Tab', '用户使用 AI 生成、视频制作、高清导出等功能需要消耗能量', '能量不足时应引导充值购买', '能量数为非负整数'],
    states: ['加载：余额、套餐和明细展示骨架', '空状态：无消耗明细时展示空记录', '异常：能量接口失败时展示刷新入口'],
    permission: '查看完整能量资产和购买能量需要登录；能量不足时限制提交制作。',
    tracking: ['energy_center_view', 'energy_package_click', 'energy_buy_click', 'energy_record_click'],
    acceptance: ['从我的页能量入口可进入', '余额、购买套餐和消耗明细结构清楚', '页面为二级页且无底部导航']
  },
  create: {
    title: '创作工作台',
    purpose: '提供图片上传、基础编辑、提示词输入和 AI 功能切换，让用户直接进入创作状态。',
    elements: ['关闭入口', '生成记录缩略图', '保存按钮', '画布上传区', '编辑工具栏', '笔触粗细圆点', '辅助图上传', '提示词输入', 'AI 功能标签', '制作按钮'],
    actions: ['点击关闭回到首页', '点击历史缩略图切换生成结果', '点击上传区模拟上传图片', '点击底部功能标签切换创作能力', '点击制作进入作品详情页', '点击保存保留当前草稿；手机外层可用原型状态切换查看未制作和 AI美体状态'],
    rules: ['从底部 Tab 点击创作直接进入该二级页', '该页不显示底部 Tab', '历史缩略图展示在顶部栏中间，替代页面标题', '点击任一历史结果后可基于该结果继续编辑', '未上传图片时制作按钮弱化', '提示词为空时可使用当前功能默认提示词'],
    states: ['加载：画布区显示上传占位', '空状态：未上传时展示点击上传图片，顶部记录为空时仅保留占位', '异常：制作失败后保留输入内容并允许重试'],
    permission: '上传、制作和保存需要登录；部分 AI 功能需要会员。',
    tracking: ['creation_workspace_view', 'creation_upload_click', 'creation_tool_select', 'creation_make_click', 'creation_save_click'],
    acceptance: ['底部 Tab 创作直接进入二级工作台', '页面不显示底部导航', '顶部历史缩略图可点击切换', '上传、切换功能、制作交互可用', '旧 AI 编辑页面不再出现']
  },
  createEmpty: {
    title: '创作未制作',
    purpose: '展示用户尚未产生生成结果时的创作工作台初始状态。',
    elements: ['关闭入口', '保存按钮', '画布上传区', '编辑工具栏', '笔触粗细圆点', '辅助图上传', '提示词输入', 'AI 功能标签', '制作按钮'],
    actions: ['点击上传区模拟上传图片', '点击底部功能标签切换创作能力', '点击制作在未上传时保持弱化；手机外层可用原型状态切换查看工作台和 AI美体状态'],
    rules: ['未制作状态不展示历史记录', '主图区域向下填充历史记录空间', '上传图片后可进入制作流程', '制作按钮在无主图时不可提交'],
    states: ['空状态：无历史记录，画布高度填充', '加载：上传素材时显示占位', '异常：上传失败提示重试'],
    permission: '上传、制作和保存需要登录。',
    tracking: ['creation_empty_view', 'creation_upload_click', 'creation_tool_select'],
    acceptance: ['页面不展示历史记录', '主图高度填充到历史记录区域', '底部工具能力保持一致']
  },
  createBody: {
    title: 'AI美体',
    purpose: '作为创作工作台的独立子状态，支持用户选择美体模板案例后基于当前图片继续编辑。',
    elements: ['关闭入口', '生成记录缩略图', '画布上传区', '编辑工具栏', '笔触粗细圆点', '辅助图上传', '提示词输入', 'AI美体案例模板', 'AI 功能标签', '制作按钮'],
    actions: ['点击模板案例切换选中项', '点击上传区补充或替换主图', '点击辅助图片上传按钮添加参考图', '点击制作提交当前美体模板和提示词；手机外层可用原型状态切换返回工作台或未制作状态'],
    rules: ['AI美体案例以横向列表展示', '案例封面使用 3:4 灰色色块占位，封面内不写文字', '每次只允许选中一个案例', '案例选择不立即生成，必须点击制作才提交', '提示词可补充模板意图'],
    states: ['加载：案例模板显示灰色骨架', '空状态：无案例时隐藏案例行并保留提示词输入', '异常：案例不可用、图片未上传、生成失败时保留当前选择并提示重试'],
    permission: '上传、选择案例、制作和保存需要登录；部分美体模板可能需要会员。',
    tracking: ['creation_body_view', 'creation_state_switch', 'body_case_select', 'creation_make_click'],
    acceptance: ['AI美体作为独立子状态可从工作台切换进入', '案例横向滑动并可点击选中', '选中案例后制作按钮仍按主图上传状态控制', '页面不显示底部导航']
  },
  createTemplate: {
    title: '创作模板',
    purpose: '展示仅选择模板的创作状态，用户先从模板案例中选择方向，不展示提示词输入框。',
    elements: ['关闭入口', '生成记录缩略图', '画布上传区', '编辑工具栏', '笔触粗细圆点', '模板案例列表', 'AI 功能标签'],
    actions: ['点击模板案例切换选中项', '点击上传区补充或替换主图', '点击底部功能标签切换创作能力；手机外层可切换回工作台、未制作或 AI美体状态'],
    rules: ['模板态不展示输入框和发送按钮', '模板案例以横向列表展示', '案例封面使用 3:4 灰色色块占位，标题显示在封面下方', '每次只允许选中一个案例'],
    states: ['默认：展示画布、模板案例和底部功能切换', '加载：模板案例显示灰色骨架', '空状态：无模板时展示空模板提示并保留功能切换'],
    permission: '浏览模板需要登录态可选；上传、保存和后续制作需要登录；部分模板可能需要会员。',
    tracking: ['creation_template_view', 'template_case_select', 'creation_tool_select'],
    acceptance: ['模板态作为创作工作台第 4 个原型状态展示', '页面不显示输入框和发送按钮', '模板案例横向滑动并可点击选中', '页面不显示底部导航']
  },
  profile: {
    title: '我的',
    purpose: '集中展示用户身份、会员权益、能量资产、作品列表和设置入口。',
    elements: ['用户头像和昵称', '会员卡片', '能量中心入口和剩余能量', '图片/视频作品页签', '双列瀑布流作品列表', '设置入口'],
    actions: ['手机外层可切换未登录/已登录非会员/已登录会员状态', '点击会员卡片进入会员权益页', '点击能量中心查看余额、购买套餐和消耗明细', '点击图片/视频页签切换作品类型', '点击作品项进入作品详情页', '点击右上角设置入口进入设置页'],
    rules: ['我的页为一级页面，显示底部导航', '头像和昵称始终置顶', '未登录状态不显示独立快捷登录按钮', '未登录和非会员状态下能量中心只作为入口，不展示暂无可用能量文案', '非会员状态作品列表为空', '会员状态作品列表按图片/视频页签与双列瀑布流展示', '设置入口放在右上角单独一行'],
    states: ['加载：用户信息和作品列表显示骨架', '空状态：暂无作品时展示空作品占位', '异常：用户资产或作品加载失败时展示重试'],
    permission: '需要登录后查看完整内容。',
    tracking: ['profile_view', 'vip_card_click', 'energy_center_click', 'profile_work_click', 'settings_click'],
    acceptance: ['页面只保留用户信息、会员、能量、作品、设置五类内容', '能量剩余数清晰可见', '作品列表可点击进入结果页', '无多余收藏模板或使用记录入口']
  },
  components: {
    title: '组件库',
    purpose: '沉淀本项目和后续移动端低保真原型可复用的灰阶组件，保证多项目输出风格一致。',
    elements: ['手机外框', '顶部导航', 'Banner 图占位', '主按钮', '上传区', '工具宫格', '横向模板卡', '列表项', '状态卡', '会员卡片', '底部 Tab'],
    actions: ['点击目录快速查看组件库', '组件库只展示规范，不承接真实业务跳转', '后续新页面优先复用这些组件'],
    rules: ['所有组件使用实体灰阶色块', '不使用虚线框', '按钮和卡片字号必须匹配容器尺寸', '手机画布固定 375 x 812'],
    states: ['加载：使用状态卡表达', '空状态：使用浅灰占位卡表达', '异常：使用深灰提示卡表达'],
    permission: '组件库无权限限制；业务页面按各自规则处理登录、会员和资源权限。',
    tracking: ['component_library_view'],
    acceptance: ['组件库可从左侧目录进入', '展示至少 8 类可复用组件', '后续原型可按该组件体系扩展']
  },
  uiChecklist: {
    title: 'UI设计清单',
    purpose: '集中列出 UI 需要设计的全部页面和页面状态，便于确认设计范围与交付状态。',
    elements: ['页面状态编号', '页面名称', '状态名称', '定稿状态'],
    actions: ['点击左侧目录进入 UI 设计清单页', '查看每个页面状态是否需要 UI 设计或复核'],
    rules: ['清单必须包含所有页面的所有状态', '编号使用页面-状态格式，例如 1-1、2-2', '当前所有页面状态均已确认定稿'],
    states: ['默认：展示完整 UI 设计范围', '异常：清单为空时提示补齐页面状态'],
    permission: '无权限限制，仅用于原型评审和 UI 工作量确认。',
    tracking: ['ui_checklist_view'],
    acceptance: ['清单可从目录进入', '清单包含所有页面状态', '选中该页时不显示手机原型']
  }
};

const pageInteractions = {
  home: [
    { id: 'home-create', title: 'AI 创作入口', trigger: '点击', effect: '直接进入创作工作台二级页，不经过一级创作页。', input: '无输入。', output: '打开上传画布、提示词和 AI 功能工具区。', bounds: '未上传图片时制作按钮保持弱化；提示词可为空。', exceptions: '草稿加载失败时仍进入工作台，并显示空画布。' },
    { id: 'home-video', title: 'AI 视频入口', trigger: '点击', effect: '进入 AI 视频制作页。', input: '无输入。', output: '展示大模板预览、横向模板缩略图和生成同款按钮。', bounds: '点击生成同款后再弹出相册选择照片；进入页面时不要求先选择照片。', exceptions: '模板加载失败时展示空状态和重试入口。' },
    { id: 'home-list', title: '模板库入口', trigger: '点击', effect: '进入模板列表页，浏览更多模板。', input: '当前默认栏目。', output: '打开模板列表页。', bounds: '模板库仅作为浏览入口；点击具体模板后进入 AI 视频制作页。', exceptions: '模板列表加载失败时展示重试入口。' },
    { id: 'home-filter', title: '推荐分组', trigger: '横向滑动 / 点击', effect: '横向滑动浏览更多分组；点击分组后只切换当前推荐流，不跳转页面。', input: '分组 id，当前包括推荐、视频、OOTD、职业、写真、证件、旅行。', output: '下方双列素材流刷新为对应分组。', bounds: '分组按钮不换行；最少 1 个分组，超过屏宽必须横向滚动。', exceptions: '分组无数据时显示空状态；接口失败时保留上一次可用列表。' },
    { id: 'home-template', title: '推荐素材卡片', trigger: '点击', effect: '进入 AI 视频制作页，并把当前素材作为默认选中模板。', input: '模板名称、分类、媒体类型。', output: 'AI 视频页底部摘要显示当前模板名称。', bounds: '封面比例固定 3:4；封面内不写文字；视频素材仅叠加播放图标。', exceptions: '模板下架时提示不可用并停留首页；模板缺图时使用灰色色块占位。' },
    { id: 'home-tabs', title: '底部导航', trigger: '点击', effect: '切换首页、创作工作台或我的页面。', input: '目标 tab id。', output: '首页/我的为一级页；创作直接进入二级工作台。', bounds: '一级页显示底部导航；创作页不显示底部导航。', exceptions: '目标页加载失败时保留当前页并提示重试。' }
  ],
  aiVideo: [
    { id: 'video-preview', title: '大模板预览', trigger: '查看', effect: '展示当前选中模板的大尺寸效果预览，帮助用户判断是否生成同款。', input: '当前模板 id。', output: '大预览区同步模板名称和预览占位。', bounds: '低保真阶段使用灰色色块占位；真实产品应播放或展示模板示例视频。', exceptions: '模板预览加载失败时展示灰阶占位和重试提示。' },
    { id: 'video-template', title: '模板缩略图', trigger: '横向滑动 / 点击', effect: '横向滑动查看更多模板；点击缩略图后切换选中态，并刷新大模板预览。', input: '模板 id。', output: '当前选中模板。', bounds: '缩略图可横向滚动；封面 3:4；封面内不写文字，只显示播放图标；标题显示在封面下方。', exceptions: '模板下架、权益不足、模板加载失败时提示并保留当前选中模板。' },
    { id: 'video-make', title: '生成同款按钮', trigger: '点击', effect: '不直接提交制作，而是弹出相册选择照片。', input: '当前选中模板。', output: '相册选择弹层。', bounds: '点击前不需要先上传照片；按钮固定在页面底部区域。', exceptions: '模板不可用或能量不足时先提示原因，不打开相册。' },
    { id: 'video-album', title: '相册照片选择', trigger: '点击', effect: '选择一张照片后校验能量余额，余额充足时提交制作，余额不足时弹出能量不足弹窗。', input: '照片文件 + 模板 id + 消耗能量。', output: '生成任务 id或能量不足弹窗。', bounds: '支持单张照片；建议主体清晰；大小不超过 20MB；单次消耗 20 能量。', exceptions: '相册权限拒绝、照片格式不支持、未检测到人物、能量不足、生成排队超时或服务失败时保留当前上下文并提示重试。' },
    { id: 'energy-insufficient', title: '能量不足弹窗', trigger: '选图后余额不足触发', effect: '提示当前能量不足，并提供去充值或稍后再说。', input: '当前余额、所需能量。', output: '去充值进入能量中心；稍后再说关闭弹窗。', bounds: '弹窗不清空已选模板；关闭后停留 AI 视频页。', exceptions: '余额刷新失败时保留弹窗并提示重试。' }
  ],
  loginCn: [
    { id: 'login-state', title: '原型状态切换', trigger: '点击', purpose: '用于评审国内登录页的一键登录、验证码登录和验证码已发三个步骤，不属于 App 内部组件。', effect: '切换当前国内登录步骤，右侧 Product Notes 同步切换。', input: '状态 id：cnOneTap、cnPhoneForm、cnCodeSent。', output: '对应国内登录步骤画面。', bounds: '三个状态互斥；切换状态不代表真实登录动作。', exceptions: '状态配置缺失时保持一键登录态。' },
    { id: 'login-method-back', title: '返回一键登录', trigger: '点击', purpose: '让用户从手机号验证码登录回到默认一键登录授权页。', effect: '清除验证码输入和错误提示，回到展示脱敏本机号码的一键登录态。', input: '当前登录状态。', output: '国内一键登录授权页。', bounds: '返回不提交表单；可保留手机号草稿，也可按产品策略清空。', exceptions: '无特殊异常状态。' },
    { id: 'login-cn-one-tap', title: '一键登录授权页', trigger: '页面展示 / 点击本机号码一键登录', purpose: '让用户确认使用本机号码快速登录。', effect: '点击主按钮后获取运营商 token，成功后建立 App 登录态并进入我的页。', input: '运营商 token、脱敏手机号、协议勾选状态。', output: 'App 登录态、用户资料、会员状态和能量余额。', bounds: '手机号必须脱敏展示；授权请求需防重复提交；未同意协议时不可完成；必须提供切换其他手机号登录。', exceptions: '用户取消授权、运营商 token 失效、号码校验失败、账号封禁或服务端异常时展示失败弹窗。' },
    { id: 'login-cn-code-option', title: '其他手机号登录入口', trigger: '点击', purpose: '让用户不用当前本机号码，改用短信验证码登录。', effect: '从一键登录授权页切换到手机号验证码登录表单。', input: '无。', output: '手机号、短信验证码和协议勾选表单。', bounds: '入口位于一键登录主按钮下方；不需要先进入选择方式页。', exceptions: '短信服务不可用时提示稍后重试。' },
    { id: 'login-phone', title: '手机号输入框', trigger: '点击 / 输入', effect: '输入用于短信验证码登录的中国大陆手机号。', input: '手机号。', output: '手机号字段值。', bounds: '必须为 11 位中国大陆手机号；自动过滤空格和非法字符。', exceptions: '手机号为空、格式错误、号码被禁用或风控拦截时展示提示。' },
    { id: 'login-send-code', title: '发送短信验证码', trigger: '点击', effect: '向当前手机号发送短信验证码，并进入倒计时状态。', input: '合法手机号。', output: '验证码发送状态和 60 秒倒计时。', bounds: '手机号合法后才可发送；60 秒内不可重复发送；每日发送次数需限制。', exceptions: '手机号格式错误、发送过于频繁、短信服务失败、风控拦截时提示原因。' },
    { id: 'login-code', title: '短信验证码输入框', trigger: '点击 / 输入', effect: '输入手机收到的验证码。', input: '6 位数字验证码。', output: '验证码字段值。', bounds: '验证码 6 位；有效期以服务端为准；输入为空时不可提交。', exceptions: '验证码错误、过期、已使用或尝试次数过多时提示重新获取。' },
    { id: 'login-agreement', title: '协议勾选', trigger: '点击', purpose: '确认用户同意用户协议和隐私政策后再允许继续登录。', effect: '切换勾选状态，并影响一键登录和验证码登录是否可继续。', input: '勾选状态。', output: '登录按钮可用性。', bounds: '默认未勾选；未勾选时不能提交登录或完成一键授权。', exceptions: '协议内容加载失败时点击协议入口提示重试。' },
    { id: 'login-submit', title: '确认登录按钮', trigger: '点击', effect: '校验协议、手机号和短信验证码后提交登录。', input: '手机号、短信验证码、协议勾选状态。', output: '登录成功进入我的页面；失败时在当前表单内提示错误并保留输入。', bounds: '未勾选协议、手机号为空或验证码为空时禁用；提交中防重复点击。', exceptions: '验证码错误、验证码过期、账号冻结、服务异常时保留表单内容并允许重试。' }
  ],
  loginGlobal: [
    { id: 'login-state', title: '原型状态切换', trigger: '点击', purpose: '用于评审海外登录页的选择方式、邮箱表单、验证码已发、Google 授权和失败弹窗五个步骤，不属于 App 内部组件。', effect: '切换当前海外登录步骤，右侧 Product Notes 同步切换。', input: '状态 id：globalChoice、globalEmailForm、globalCodeSent、globalGoogleAuth、globalFailed。', output: '对应海外登录步骤画面。', bounds: '五个状态互斥；切换状态不代表真实登录动作。', exceptions: '状态配置缺失时保持选择方式态。' },
    { id: 'login-email-option', title: '邮箱验证码登录入口', trigger: '点击', purpose: '让海外用户选择邮箱验证码登录。', effect: '进入邮箱登录表单态，展示邮箱、验证码和协议勾选。', input: '登录来源页。', output: '邮箱登录表单。', bounds: '点击邮箱方式前不展示邮箱输入框。', exceptions: '邮箱登录服务不可用时提示稍后重试。' },
    { id: 'login-google-option', title: 'Google 登录入口', trigger: '点击', purpose: '让海外用户选择通过 Google 账号登录。', effect: '在当前登录页上弹出 Google 授权弹窗，不展示邮箱验证码表单。', input: '登录来源页、协议提示状态。', output: 'Google 授权弹窗。', bounds: '默认选择页只展示入口；点击后才弹出授权流程。', exceptions: 'Google 登录配置不可用、网络失败或授权页无法拉起时展示失败弹窗。' },
    { id: 'login-method-back', title: '返回选择方式', trigger: '点击', purpose: '让用户从具体登录流程回到海外登录方式选择页。', effect: '清除授权中/错误提示，回到只展示邮箱和 Google 两种登录方式的状态。', input: '当前登录状态。', output: '海外登录选择方式态。', bounds: '返回不提交表单；可保留邮箱草稿，也可按产品策略清空。', exceptions: '无特殊异常状态。' },
    { id: 'login-google', title: 'Google 授权弹窗', trigger: '弹窗展示 / 点击完成', purpose: '让用户不输入验证码即可通过 Google 账号完成登录或注册。', effect: '在弹窗内展示授权进度，真实产品会拉起系统浏览器或内置授权页并等待 Google 回调。', input: 'Google OAuth 请求参数、当前来源页、协议勾选状态。', output: 'Google 授权请求或错误提示。', bounds: '授权请求必须携带 state 防 CSRF；重复点击需防抖。', exceptions: '用户未安装可用浏览器、网络失败、授权页拉起失败或用户取消授权时展示失败弹窗。' },
    { id: 'login-google-callback', title: 'Google 授权回调', trigger: '系统返回 / 点击完成', purpose: '处理 Google 授权结果并建立 App 登录态。', effect: '授权成功后换取服务端登录凭证，刷新用户资料、会员状态和能量资产，并进入我的页。', input: 'Google code/token、state、来源页。', output: 'App 登录态、用户资料、会员信息和能量余额。', bounds: '同一 Google 邮箱已绑定账号时直接登录；未绑定时自动创建账号或进入绑定流程；回调只能消费一次。', exceptions: '用户取消授权、state 校验失败、账号冲突、账号被封禁、服务端换 token 失败时进入登录失败态。' },
    { id: 'login-email', title: '邮箱输入框', trigger: '点击 / 输入', effect: '输入用于登录或注册的邮箱地址。', input: '邮箱地址。', output: '邮箱字段值。', bounds: '必须符合邮箱格式；建议最大 64 个字符；首尾空格自动去除。', exceptions: '邮箱为空、格式错误、邮箱被禁用或账号不存在时展示提示。' },
    { id: 'login-send-code', title: '发送邮件验证码', trigger: '点击', effect: '向当前邮箱发送登录验证码，并进入倒计时状态。', input: '合法邮箱地址。', output: '验证码发送状态和倒计时。', bounds: '邮箱合法后才可发送；60 秒内不可重复发送；每日发送次数需限制。', exceptions: '邮箱格式错误、发送过于频繁、邮件服务失败或邮件被退回时提示原因。' },
    { id: 'login-code', title: '邮件验证码输入框', trigger: '点击 / 输入', effect: '输入邮箱收到的验证码。', input: '6 位数字或字母数字验证码。', output: '验证码字段值。', bounds: '验证码 6 位；有效期由服务端控制；输入为空时不可提交。', exceptions: '验证码错误、过期、已使用或尝试次数过多时提示重新获取。' },
    { id: 'login-agreement', title: '协议勾选', trigger: '点击', purpose: '确认用户同意用户协议和隐私政策后再允许继续登录。', effect: '切换勾选状态，并影响 Google 登录和邮件登录是否可继续。', input: '勾选状态。', output: '登录按钮可用性。', bounds: '默认未勾选；未勾选时不能提交登录或拉起 Google 授权。', exceptions: '协议内容加载失败时点击协议入口提示重试。' },
    { id: 'login-submit', title: '邮件登录按钮', trigger: '点击', effect: '校验协议、邮箱和验证码后提交登录。', input: '邮箱、邮件验证码、协议勾选状态。', output: '登录成功进入我的页面；失败展示错误。', bounds: '未勾选协议、邮箱为空或验证码为空时禁用；提交中防重复点击。', exceptions: '验证码错误、验证码过期、账号冻结、服务异常时保留表单内容并允许重试。' },
    { id: 'login-error-retry', title: '失败弹窗操作', trigger: '点击', purpose: '让用户从错误弹窗回到可继续操作的海外登录流程。', effect: '关闭失败弹窗，可重新选择登录方式或回到邮箱登录表单。', input: '错误类型和失败来源。', output: '选择方式态或邮箱登录表单态。', bounds: '账号封禁类错误不应直接清除，应展示客服或申诉入口。', exceptions: '网络仍不可用时保留错误弹窗。' }
  ],
  list: [
    { id: 'list-search', title: '搜索框', trigger: '点击 / 输入', effect: '聚焦搜索并按关键词筛选模板。', input: '关键词字符串。', output: '模板列表按关键词刷新。', bounds: '关键词 0-20 个字符；空关键词展示默认列表。', exceptions: '无结果显示空状态；搜索接口失败显示重试。' },
    { id: 'list-filter', title: '列表筛选', trigger: '点击', effect: '切换全部、热门、最新、收藏筛选。', input: '筛选类型。', output: '列表刷新并保留当前搜索词。', bounds: '筛选项互斥；收藏需要登录。', exceptions: '未登录点击收藏筛选时引导登录；接口失败保留当前列表。' },
    { id: 'list-template', title: '模板卡片', trigger: '点击', effect: '进入 AI 视频制作页并选中该模板。', input: '模板名称与分类。', output: 'AI 视频制作页显示当前模板。', bounds: '封面 3:4，封面不写文字。', exceptions: '模板不可用、权益不足、模板下架时提示不可使用。' }
  ],
  result: [
    { id: 'result-state', title: '原型状态切换', trigger: '点击', effect: '在手机外层切换生成中、生成完成、生成失败三种作品详情状态，不属于 App 页面内部组件。', bounds: '三个状态互斥；切换状态时右侧说明同步切换。', exceptions: '状态配置缺失时保持当前状态。' },
    { id: 'result-save', title: '保存作品', trigger: '点击', effect: '将生成完成的作品保存到我的作品。', input: '作品 id。', output: '作品记录和保存成功提示。', bounds: '仅生成完成状态可用；高清保存可能需要会员。', exceptions: '未登录引导登录；保存失败、空间不足、审核失败时提示原因。' },
    { id: 'result-retry', title: '重新生成/重新选择', trigger: '点击', effect: '生成完成或失败时重新提交任务，或返回 AI 视频页重新选择模板。', input: '原素材或当前任务配置。', output: '新任务或导入页。', bounds: '失败任务可重试；成功任务也可重新生成。', exceptions: '原素材失效时要求重新导入。' }
  ],
  memberCenter: [
    { id: 'member-benefits', title: '会员权益概览', trigger: '查看', effect: '展示当前会员可获得的高清导出、去水印、专属模板和生成加速权益。', bounds: '不展示剩余天数；权益文案需要和套餐实际权益一致。', exceptions: '权益接口失败时展示默认权益占位和刷新提示。' },
    { id: 'member-plan', title: '套餐选择', trigger: '点击', effect: '切换选中的会员套餐，底部开通/续费按钮同步套餐金额和周期。', input: '套餐 id。', output: '当前选中套餐。', bounds: '套餐互斥；至少保留 1 个可选套餐。', exceptions: '套餐下架或价格更新时提示刷新。' },
    { id: 'member-pay', title: '3天免费试用按钮', trigger: '点击', effect: '进入 3 天免费试用开通流程。', input: '选中套餐、用户登录态。', output: '试用订单或登录引导。', bounds: '未登录先引导登录；已登录按试用套餐创建订单。', exceptions: '试用资格不足、支付取消、创建订单失败时保留当前套餐。' },
    { id: 'member-retention', title: '离开挽留弹窗', trigger: '未支付时点击返回', effect: '提示用户可先试用 3 天；点击继续试用关闭弹窗留在会员页，点击仍然离开返回我的页。', input: '会员页未支付状态。', output: '留在会员页或返回我的页。', bounds: '只在未完成试用/购买时触发；已开通用户返回不应挽留。', exceptions: '弹窗展示失败时直接返回我的页。' }
  ],
  energyCenter: [
    { id: 'energy-balance', title: '能量余额卡片', trigger: '查看', effect: '展示当前剩余能量和最近更新时间。', bounds: '能量为非负整数；未登录或接口失败时展示占位和刷新入口。', exceptions: '能量接口超时或数据异常时不展示负数。' },
    { id: 'energy-package', title: '能量充值套餐', trigger: '点击', effect: '切换当前选中的能量套餐，购买按钮同步套餐能量数量和金额。', input: '套餐 id。', output: '当前选中充值套餐。', bounds: '套餐互斥；至少保留 1 个可购买套餐；价格和赠送能量以后端配置为准。', exceptions: '套餐下架、价格变化、网络失败时提示刷新。' },
    { id: 'energy-buy', title: '购买能量按钮', trigger: '点击', effect: '创建能量充值订单并进入支付确认。', input: '选中套餐、用户登录态。', output: '支付订单或登录引导。', bounds: '未登录先引导登录；重复点击需防抖；支付成功后刷新能量余额。', exceptions: '支付取消、订单创建失败、支付超时或余额未到账时保留当前页面并提示重试。' },
    { id: 'energy-record', title: '能量消耗明细', trigger: '点击', effect: '查看某条功能消耗记录的功能名称、时间和消耗能量。', input: '能量记录 id。', output: '记录详情。', bounds: '明细按时间倒序；无记录时展示空状态；消耗为负数展示。', exceptions: '记录被清理或接口失败时展示重试。' }
  ],
  create: [
    { id: 'create-close', title: '关闭创作', trigger: '点击', effect: '关闭工作台并回到首页。', input: '当前草稿状态。', output: '页面切回首页。', bounds: '有未保存草稿时真实产品应二次确认。', exceptions: '草稿保存失败时提示保留或放弃。' },
    { id: 'create-state', title: '原型状态切换', trigger: '点击', effect: '在手机外层查看创作工作台、未制作、AI美体、模板四个状态，不属于 App 页面内部组件。', input: '状态 id：create、createEmpty、createBody、createTemplate。', output: '原型画布切换为对应状态，右侧说明同步切换并定位到当前页面说明。', bounds: '四个状态互斥；切换不清空当前图片、提示词和历史记录；未制作状态不展示历史缩略图；模板态不展示输入框。', exceptions: '目标状态配置缺失时保持当前状态；切换中数据读取失败时展示当前状态并提示重试。' },
    { id: 'create-save', title: '保存草稿', trigger: '点击', effect: '保存当前图片、选中功能、提示词、辅助图和历史记录选择。', input: '当前工作台配置。', output: '草稿 id、保存时间和成功反馈。', bounds: '无主图时可保存空草稿但不可提交制作；草稿应按用户维度隔离。', exceptions: '未登录引导登录；网络失败、空间不足或服务异常时保留当前编辑内容。' },
    { id: 'create-record', title: '生成记录缩略图', trigger: '横向滑动 / 点击', effect: '在顶部栏中间横向浏览历史生成结果；点击任意记录后切换当前画布。', input: '生成记录 id。', output: '画布切换到对应历史结果。', bounds: '替代 AI 创作标题；最多展示最近若干条；缩略图保持正方形小图，超出横向滚动；未制作状态显示空占位。', exceptions: '记录被删除、加载失败时显示占位并允许跳过。' },
    { id: 'create-upload', title: '画布上传区', trigger: '点击', effect: '模拟上传图片并启用制作能力。', input: '图片文件。', output: '画布显示已上传状态。', bounds: '支持单图；图片不超过 20MB。', exceptions: '格式不支持、上传失败、内容审核失败时提示重新上传。' },
    ...creationBrushButtonInteractions,
    { id: 'create-assist', title: '辅助图片上传', trigger: '点击', effect: '在输入框内添加辅助参考图，用于补充风格、姿势或局部参考。', input: '辅助图片文件。', output: '输入框内展示辅助图缩略图，并随制作任务提交。', bounds: '辅助图最多 1 张；支持 JPG/PNG/HEIC；建议不超过 20MB；不会替换主画布图片。', exceptions: '格式不支持、文件过大、上传失败或图片违规时提示删除并重新上传。' },
    { id: 'create-prompt', title: '提示词输入', trigger: '点击 / 输入', effect: '输入想生成的内容描述。', input: '中文或英文文本。', output: '制作任务携带提示词。', bounds: '建议 0-200 字；为空时使用当前功能默认提示词。', exceptions: '敏感词、超长、仅空格时提示调整。' },
    { id: 'create-tool', title: 'AI 功能标签', trigger: '横向滑动 / 点击', effect: '横向浏览功能；点击切换当前创作能力。', input: '工具类型。', output: '当前功能高亮，制作逻辑切换。', bounds: '功能互斥；部分功能需要会员。', exceptions: '权益不足时引导会员；功能维护时置灰不可用。' },
    { id: 'create-make', title: '制作按钮', trigger: '点击', effect: '提交当前画布、提示词和功能配置。', input: '图片、工具、笔触粗细、提示词。', output: '进入作品详情页。', bounds: '未上传图片时应禁用或提示先上传。', exceptions: '生成失败、队列超时、额度不足时保留输入并允许重试。' }
  ],
  createEmpty: [
    { id: 'create-close', title: '关闭创作', trigger: '点击', effect: '关闭未制作状态并回到首页。', input: '当前空草稿状态。', output: '页面切回首页。', bounds: '未产生历史记录时无需二次确认；有输入内容时真实产品应提示保存草稿。', exceptions: '草稿保存失败时提示保留或放弃。' },
    { id: 'create-state', title: '原型状态切换', trigger: '点击', effect: '在手机外层切换到创作工作台或 AI美体状态，不占用 App 页面空间。', input: '状态 id。', output: '原型状态切换，右侧说明同步切换。', bounds: '未制作状态不展示历史记录；切换状态不自动生成图片。', exceptions: '目标状态加载失败时保持未制作状态。' },
    { id: 'create-save', title: '保存空草稿', trigger: '点击', effect: '保存当前未制作草稿。', input: '提示词、辅助图和选中工具。', output: '草稿记录。', bounds: '无主图时只能保存草稿，不能发起制作。', exceptions: '未登录、网络失败或草稿空间不足时提示。' },
    { id: 'create-upload', title: '画布上传区', trigger: '点击', effect: '上传主图后进入可制作状态。', input: '图片文件。', output: '主图上传成功，制作按钮可用。', bounds: '单张主图；不超过 20MB；主体需可识别。', exceptions: '格式不支持、上传失败、内容审核失败时提示重新上传。' },
    ...creationBrushButtonInteractions,
    { id: 'create-assist', title: '辅助图片上传', trigger: '点击', effect: '添加辅助参考图，但不替代主图。', input: '辅助图片文件。', output: '辅助图缩略图显示在输入框内。', bounds: '最多 1 张；无主图时也可先添加辅助图。', exceptions: '格式不支持、文件过大或上传失败时提示。' },
    { id: 'create-prompt', title: '提示词输入', trigger: '点击 / 输入', effect: '先输入制作意图，等待上传主图后提交。', input: '0-200 字文本。', output: '保存到草稿或后续制作任务。', bounds: '为空允许；超长截断或提示。', exceptions: '敏感词或仅空格时提示调整。' },
    { id: 'create-tool', title: 'AI 功能标签', trigger: '横向滑动 / 点击', effect: '切换待使用的 AI 能力；点击 AI美体会进入 AI美体子状态。', input: '工具类型。', output: '当前工具高亮或页面状态切换。', bounds: '工具互斥；无主图时只改变配置不提交。', exceptions: '权益不足或功能维护时提示。' },
    { id: 'create-make', title: '制作按钮', trigger: '点击', effect: '无主图时不提交制作。', input: '主图状态、提示词、工具类型。', output: '主图缺失提示。', bounds: '必须上传主图后才可提交。', exceptions: '连续点击需防抖；无主图时提示先上传。' }
  ],
  createBody: [
    { id: 'create-close', title: '关闭 AI美体', trigger: '点击', effect: '关闭 AI美体子状态并回到首页。', input: '当前美体编辑草稿。', output: '页面切回首页。', bounds: '有未保存模板选择或提示词时真实产品应二次确认。', exceptions: '草稿保存失败时提示保留或放弃。' },
    { id: 'create-state', title: '原型状态切换', trigger: '点击', effect: '在手机外层切换工作台、未制作、AI美体三个查看状态。', input: '状态 id。', output: '切换原型状态，保留主图和提示词。', bounds: 'AI美体状态固定展示案例模板；切换回工作台后隐藏案例行。', exceptions: '状态切换失败时保持当前 AI美体页面。' },
    { id: 'create-save', title: '保存 AI美体草稿', trigger: '点击', effect: '保存当前主图、美体案例、提示词、辅助图和历史记录选择。', input: 'AI美体配置。', output: '草稿 id 和保存成功反馈。', bounds: '无主图时只能保存草稿；模板选择必须有且只能有一个。', exceptions: '未登录、空间不足、网络失败时保留编辑内容。' },
    { id: 'create-record', title: '生成记录缩略图', trigger: '横向滑动 / 点击', effect: '在顶部栏中间切换某次生成结果作为继续美体的基础图。', input: '生成记录 id。', output: '主画布替换为选中历史结果。', bounds: '历史缩略图替代页面标题；尺寸较小，支持横向滑动。', exceptions: '记录失效或加载失败时显示灰色占位并提示不可用。' },
    { id: 'create-upload', title: '画布上传区', trigger: '点击', effect: '上传或替换 AI美体主图。', input: '人物图片。', output: '主画布进入已上传状态。', bounds: '建议单人清晰半身或全身图；不超过 20MB。', exceptions: '未检测到人体、多人冲突、格式不支持或上传失败时提示换图。' },
    ...creationBrushButtonInteractions,
    { id: 'create-assist', title: '辅助图片上传', trigger: '点击', effect: '上传姿势、身材或风格参考图。', input: '辅助参考图。', output: '输入框内展示辅助图缩略图。', bounds: '最多 1 张；不会替代主图；随制作任务一起提交。', exceptions: '参考图无法识别、格式错误或上传失败时提示删除重传。' },
    { id: 'create-prompt', title: '提示词输入', trigger: '点击 / 输入', effect: '补充美体意图，例如“自然一点”“不要改变脸部”。', input: '0-200 字文本。', output: '制作任务中的文本约束。', bounds: '为空时按选中案例默认参数执行。', exceptions: '敏感词、超长、和模板冲突时提示调整。' },
    { id: 'create-case', title: 'AI美体模板案例', trigger: '横向滑动 / 点击', effect: '横向浏览案例；点击后切换选中案例，但不立即生成。', input: '案例 id：丰胸、腹肌、增加锁骨、瘦身、瘦腿、直角肩。', output: '案例选中态更新，制作任务携带该案例参数。', bounds: '案例单选；封面固定 3:4；封面内不写文字；标题在封面下方。', exceptions: '案例下架、权益不足或加载失败时保持当前选中案例并提示。' },
    { id: 'create-tool', title: 'AI 功能标签', trigger: '横向滑动 / 点击', effect: '点击非 AI美体能力时返回普通创作工作台；点击 AI美体保持当前子状态。', input: '工具类型。', output: '当前功能高亮或页面状态切换。', bounds: 'AI美体与其他功能互斥；横向滑动浏览全部能力。', exceptions: '功能维护或权益不足时提示并保留当前状态。' },
    { id: 'create-make', title: '制作按钮', trigger: '点击', effect: '提交主图、美体案例、提示词、辅助图和蒙版配置。', input: '主图、案例 id、提示词、辅助图、笔触蒙版。', output: '进入作品详情页，展示任务进度。', bounds: '主图必填；案例必选；提示词可空。', exceptions: '未上传主图、生成失败、额度不足、审核失败或队列超时时保留配置并允许重试。' }
  ],
  createTemplate: [
    { id: 'create-close', title: '关闭模板态', trigger: '点击', effect: '关闭模板态并回到首页。', input: '当前模板选择。', output: '页面切回首页。', bounds: '有未保存模板选择时真实产品应二次确认。', exceptions: '草稿保存失败时提示保留或放弃。' },
    { id: 'create-state', title: '原型状态切换', trigger: '点击', effect: '在手机外层切换工作台、未制作、AI美体、模板四个查看状态。', input: '状态 id。', output: '切换原型状态，保留主图和模板选择。', bounds: '模板态只展示模板案例和功能切换，不展示输入框和发送按钮。', exceptions: '状态切换失败时保持当前模板态。' },
    { id: 'create-save', title: '保存模板草稿', trigger: '点击', effect: '保存当前主图、模板案例和历史记录选择。', input: '模板配置。', output: '草稿 id 和保存成功反馈。', bounds: '无主图时只能保存模板草稿；模板选择必须有且只能有一个。', exceptions: '未登录、空间不足、网络失败时保留编辑内容。' },
    { id: 'create-record', title: '生成记录缩略图', trigger: '横向滑动 / 点击', effect: '在顶部栏中间切换某次生成结果作为模板继续编辑的基础图。', input: '生成记录 id。', output: '主画布替换为选中历史结果。', bounds: '历史缩略图替代页面标题；支持横向滑动。', exceptions: '记录失效或加载失败时显示灰色占位并提示不可用。' },
    { id: 'create-upload', title: '画布上传区', trigger: '点击', effect: '上传或替换模板主图。', input: '人物图片。', output: '主画布进入已上传状态。', bounds: '建议单人清晰半身或全身图；不超过 20MB。', exceptions: '未检测到人体、多人冲突、格式不支持或上传失败时提示换图。' },
    ...creationBrushButtonInteractions,
    { id: 'create-case', title: '模板案例', trigger: '横向滑动 / 点击', effect: '横向浏览模板；点击后切换选中案例，但不立即生成。', input: '模板案例 id。', output: '模板选中态更新。', bounds: '案例单选；封面固定 3:4；封面内不写文字；标题在封面下方。', exceptions: '模板下架、权益不足或加载失败时保持当前选中案例并提示。' },
    { id: 'create-tool', title: 'AI 功能标签', trigger: '横向滑动 / 点击', effect: '点击非 AI美体能力时返回普通创作工作台；点击 AI美体保持模板相关状态。', input: '工具类型。', output: '当前功能高亮或页面状态切换。', bounds: '功能互斥；横向滑动浏览全部能力。', exceptions: '功能维护或权益不足时提示并保留当前状态。' }
  ],
  profile: [
    { id: 'profile-state', title: '原型状态切换', trigger: '点击', effect: '在手机外层切换未登录、已登录非会员、已登录会员三种我的页状态，不属于 App 页面内部组件。', bounds: '状态切换只用于原型评审；不进入页面目录；不占用手机 UI 空间。', exceptions: '状态数据缺失时保持当前状态。' },
    { id: 'profile-vip', title: '会员卡片', trigger: '点击', effect: '进入会员权益页；非会员和未登录状态展示付费引导文案，会员状态展示权益摘要和续费入口。', bounds: '卡片高度需要容纳权益说明和付费引导；不在卡片内展示剩余天数。', exceptions: '会员权益加载失败时保留卡片并提示重试。' },
    { id: 'profile-points', title: '能量中心入口', trigger: '点击', effect: '进入能量中心，查看剩余能量、充值购买套餐和功能消耗明细。', bounds: '会员状态展示剩余能量；未登录和非会员状态只显示能量中心入口，不写暂无可用能量。', exceptions: '能量接口失败时保留入口并提示刷新。' },
    { id: 'profile-work-tabs', title: '作品类型页签', trigger: '点击', effect: '切换图片作品和视频作品列表。', bounds: '页签互斥；切换只刷新作品列表，不离开我的页。', exceptions: '对应类型无作品时展示空作品状态。' },
    { id: 'profile-works', title: '作品瀑布流卡片', trigger: '点击', effect: '进入对应作品详情页，查看成品、保存或重新生成。', bounds: '会员状态双列瀑布流展示；封面使用灰色色块占位；视频作品叠加播放图标；非会员状态展示空作品状态。', exceptions: '作品被删除、审核中或加载失败时提示不可查看。' },
    { id: 'profile-settings', title: '右上角设置按钮', trigger: '点击', effect: '进入设置页，用于账号、安全、通知、协议和缓存管理。', bounds: '设置入口固定在用户信息行右上角，独立于会员、能量和作品列表。', exceptions: '设置页加载失败时停留我的页并提示重试。' }
  ],
  components: [
    { id: 'components-preview', title: '组件示例', trigger: '滚动 / 查看', effect: '查看当前低保真组件规范，不承接业务跳转。', input: '无输入。', output: '组件视觉与交互基线。', bounds: '组件只做规范展示。', exceptions: '组件缺失时应补齐再进入业务页面复用。' }
  ]
};

function getAiVideoStateInteractions(aiVideoState) {
  const stateInteractions = {
    template: [
      { id: 'ai-video-state', title: '原型状态切换', trigger: '点击', effect: '在手机外层切换模板选择态和选择照片态，不属于 App 页面内部组件。', bounds: '状态切换只用于原型评审；切换状态时右侧说明同步切换。', exceptions: '状态配置缺失时保持模板选择态。' },
      { id: 'video-preview', title: '大模板预览', trigger: '查看', effect: '展示当前选中模板的大尺寸效果预览，帮助用户判断是否生成同款。', input: '当前模板 id。', output: '大预览区同步模板名称和预览占位。', bounds: '低保真阶段使用灰色色块占位；真实产品应播放或展示模板示例视频。', exceptions: '模板预览加载失败时展示灰阶占位和重试提示。' },
      { id: 'video-template', title: '模板缩略图', trigger: '横向滑动 / 点击', effect: '横向滑动查看更多模板；点击缩略图后切换选中态，并刷新大模板预览。', input: '模板 id。', output: '当前选中模板。', bounds: '缩略图可横向滚动；封面 3:4；封面内不写文字，只显示播放图标；标题显示在封面下方。', exceptions: '模板下架、权益不足、模板加载失败时提示并保留当前选中模板。' },
      { id: 'video-make', title: '生成同款按钮', trigger: '点击', effect: '不直接提交制作，而是切换到 5-2 选择照片态。', input: '当前选中模板。', output: '选择照片态。', bounds: '点击前不需要先上传照片；按钮固定在页面底部区域。', exceptions: '模板不可用时提示原因，不进入选择照片态。' }
    ],
    photoPicker: [
      { id: 'ai-video-state', title: '原型状态切换', trigger: '点击', effect: '在手机外层切换模板选择态和选择照片态，不属于 App 页面内部组件。', bounds: '状态切换只用于原型评审；选择照片态不改变已选模板。', exceptions: '状态配置缺失时保持当前状态。' },
      { id: 'video-album', title: '相册照片选择', trigger: '点击', effect: '选择一张照片后校验能量余额，余额充足时提交制作，余额不足时弹出能量不足弹窗。', input: '照片文件 + 模板 id + 消耗能量。', output: '生成任务 id或能量不足弹窗。', bounds: '支持单张照片；建议主体清晰；大小不超过 20MB；单次消耗 20 能量。', exceptions: '相册权限拒绝、照片格式不支持、未检测到人物、能量不足、生成排队超时或服务失败时保留当前上下文并提示重试。' },
      { id: 'video-album-cancel', title: '取消选择照片', trigger: '点击', effect: '关闭相册选择面板并返回 5-1 模板选择态。', input: '无输入。', output: '模板选择态。', bounds: '不清空已选模板。', exceptions: '返回失败时保持当前相册面板并允许再次点击。' },
      { id: 'energy-insufficient', title: '能量不足弹窗', trigger: '选图后余额不足触发', effect: '提示当前能量不足，并提供去充值或稍后再说。', input: '当前余额、所需能量。', output: '去充值进入能量中心；稍后再说关闭弹窗。', bounds: '弹窗不清空已选模板；关闭后停留选择照片态。', exceptions: '余额刷新失败时保留弹窗并提示重试。' }
    ]
  };
  return stateInteractions[aiVideoState] || stateInteractions.template;
}

const validPageIds = new Set([...pageDirectory.map((item) => item.id), ...createSubstates.map((item) => item.id)]);
const validProfileStates = new Set(profileStates.map((item) => item.id));
const validResultStates = new Set(resultStates.map((item) => item.id));
const validAiVideoStates = new Set(aiVideoStates.map((item) => item.id));
const validLoginStates = new Set([...loginCnStates, ...loginGlobalStates].map((item) => item.id));

function parsePrototypeHash() {
  if (typeof window === 'undefined') {
    return { page: 'home', profileState: 'loggedInVip', resultState: 'processing', aiVideoState: 'template', loginState: 'globalChoice' };
  }
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const page = validPageIds.has(parts[0]) ? parts[0] : 'home';
  return {
    page,
    profileState: page === 'profile' && validProfileStates.has(parts[1]) ? parts[1] : 'loggedInVip',
    resultState: page === 'result' && validResultStates.has(parts[1]) ? parts[1] : 'processing',
    aiVideoState: page === 'aiVideo' && validAiVideoStates.has(parts[1]) ? parts[1] : 'template',
    loginState: isLoginPage(page) && validLoginStates.has(parts[1]) ? parts[1] : getDefaultLoginState(page)
  };
}

function getPrototypeHash(page, profileState, resultState, aiVideoState, loginState) {
  if (page === 'profile') return `#/${page}/${profileState}`;
  if (page === 'result') return `#/${page}/${resultState}`;
  if (page === 'aiVideo') return `#/${page}/${aiVideoState}`;
  if (isLoginPage(page)) return `#/${page}/${loginState}`;
  return `#/${page}`;
}

function bindInteraction(id, setActiveInteraction) {
  if (!setActiveInteraction) return {};
  return {
    onMouseEnter: () => setActiveInteraction(id),
    onFocus: () => setActiveInteraction(id),
    onMouseLeave: () => setActiveInteraction(null),
    onBlur: () => setActiveInteraction(null)
  };
}

const VERSION_POLL_INTERVAL_MS = 180000;

async function readPrototypeVersion() {
  if (typeof window === 'undefined') return null;
  const url = new URL('version.json', window.location.href);
  url.searchParams.set('t', Date.now().toString());
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return null;
  const data = await response.json();
  return typeof data.version === 'string' ? data.version : null;
}

function UpdateBanner() {
  const currentVersionRef = useRef(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    let disposed = false;
    const checkVersion = async () => {
      try {
        const nextVersion = await readPrototypeVersion();
        if (disposed || !nextVersion) return;
        if (!currentVersionRef.current) {
          currentVersionRef.current = nextVersion;
          return;
        }
        if (currentVersionRef.current !== nextVersion) {
          setHasUpdate(true);
        }
      } catch {
        // Version checks are best-effort and should never interrupt prototype review.
      }
    };

    checkVersion();
    const timer = window.setInterval(checkVersion, VERSION_POLL_INTERVAL_MS);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, []);

  if (!hasUpdate) return null;

  return (
    <button className="update-banner" type="button" onClick={() => window.location.reload()}>
      原型已更新，点击刷新查看最新版本
    </button>
  );
}

function App() {
  const initialRoute = useRef(parsePrototypeHash());
  const [page, setPage] = useState(initialRoute.current.page);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedTemplate, setSelectedTemplate] = useState({ name: 'OOTD', category: '热门' });
  const [pickedImage, setPickedImage] = useState(false);
  const [selectedCreationTool, setSelectedCreationTool] = useState('AI修图');
  const [selectedCreationRecord, setSelectedCreationRecord] = useState(0);
  const [selectedCreationCase, setSelectedCreationCase] = useState(0);
  const [videoReferencePicked, setVideoReferencePicked] = useState(false);
  const [selectedVideoTemplate, setSelectedVideoTemplate] = useState(0);
  const [aiVideoState, setAiVideoState] = useState(initialRoute.current.aiVideoState);
  const [homeFilter, setHomeFilter] = useState('recommend');
  const [profileState, setProfileState] = useState(initialRoute.current.profileState);
  const [profileWorkTab, setProfileWorkTab] = useState('图片');
  const [resultState, setResultState] = useState(initialRoute.current.resultState);
  const [loginState, setLoginState] = useState(initialRoute.current.loginState);
  const [memberRetentionOpen, setMemberRetentionOpen] = useState(false);
  const [activeInteraction, setActiveInteraction] = useState(null);

  const spec = page === 'profile'
    ? getProfileStateSpec(profileState)
    : page === 'result'
      ? getResultStateSpec(resultState)
      : page === 'aiVideo'
        ? getAiVideoStateSpec(aiVideoState)
        : isLoginPage(page)
          ? getLoginStateSpec(page, loginState)
          : pageCopy[page];
  useEffect(() => {
    setActiveInteraction(null);
  }, [page]);
  useEffect(() => {
    if (!isLoginPage(page)) return;
    const stateBelongsToPage = getLoginStates(page).some((item) => item.id === loginState);
    if (!stateBelongsToPage) {
      setLoginState(getDefaultLoginState(page));
    }
  }, [page, loginState]);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncFromHash = () => {
      const next = parsePrototypeHash();
      setPage(next.page);
      setProfileState(next.profileState);
      setResultState(next.resultState);
      setAiVideoState(next.aiVideoState);
      setLoginState(next.loginState);
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nextHash = getPrototypeHash(page, profileState, resultState, aiVideoState, loginState);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }, [page, profileState, resultState, aiVideoState, loginState]);
  const navToList = (category) => {
    setSelectedCategory(category);
    setPage('list');
  };
  const openTemplateForAiVideo = (name, category) => {
    setSelectedTemplate({ name, category });
    const matchedVideoIndex = videoTemplates.findIndex((item) => item === name);
    if (matchedVideoIndex >= 0) {
      setSelectedVideoTemplate(matchedVideoIndex);
    }
    setAiVideoState('template');
    setPage('aiVideo');
  };
  const ctx = useMemo(
    () => ({ page, selectedCategory, selectedTemplate, pickedImage, selectedCreationTool, selectedCreationRecord, selectedCreationCase, videoReferencePicked, selectedVideoTemplate, aiVideoState, homeFilter, profileState, profileWorkTab, resultState, loginState }),
    [page, selectedCategory, selectedTemplate, pickedImage, selectedCreationTool, selectedCreationRecord, selectedCreationCase, videoReferencePicked, selectedVideoTemplate, aiVideoState, homeFilter, profileState, profileWorkTab, resultState, loginState]
  );

  return (
    <div className="app-shell">
      <UpdateBanner />
      <main className="workspace">
        <PageDirectory active={page} setPage={setPage} />
        {page === 'uiChecklist' ? (
          <UIDesignChecklistPage />
        ) : page === 'uiSpec' ? (
          <UISpecPage />
        ) : (
          <PrototypeStage page={page} setPage={setPage} profileState={profileState} setProfileState={setProfileState} resultState={resultState} setResultState={setResultState} aiVideoState={aiVideoState} setAiVideoState={setAiVideoState} loginState={loginState} setLoginState={setLoginState} setActiveInteraction={setActiveInteraction}>
            <PhoneFrame
              page={page}
              ctx={ctx}
              setPage={setPage}
              setProfileState={setProfileState}
              setLoginState={setLoginState}
              setPickedImage={setPickedImage}
              setSelectedTemplate={setSelectedTemplate}
              setSelectedCreationTool={setSelectedCreationTool}
              setSelectedCreationRecord={setSelectedCreationRecord}
              setSelectedCreationCase={setSelectedCreationCase}
              setVideoReferencePicked={setVideoReferencePicked}
              setSelectedVideoTemplate={setSelectedVideoTemplate}
              setAiVideoState={setAiVideoState}
              setHomeFilter={setHomeFilter}
              setProfileWorkTab={setProfileWorkTab}
              setResultState={setResultState}
              memberRetentionOpen={memberRetentionOpen}
              setMemberRetentionOpen={setMemberRetentionOpen}
              setActiveInteraction={setActiveInteraction}
              navToList={navToList}
              openTemplateForAiVideo={openTemplateForAiVideo}
            />
          </PrototypeStage>
        )}
        {!['uiChecklist', 'uiSpec'].includes(page) ? <SpecPanel spec={spec} ctx={ctx} activeInteraction={activeInteraction} /> : null}
      </main>
    </div>
  );
}

function PageDirectory({ active, setPage }) {
  const groups = pageDirectory.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className="left-rail">
      <div className="project-card">
        <div>
          <span className="eyebrow">Low-fi prototype</span>
          <strong>{project.name}</strong>
        </div>
        <div className="project-meta">
          <span>{project.slug}</span>
          <span>{project.path}</span>
        </div>
      </div>
      <div className="page-directory">
        <div className="directory-head">
          <div className="eyebrow">Pages</div>
          <h2>页面目录</h2>
          <div className="directory-status-legend" aria-label="页面状态说明">
            {Object.entries(directoryStatusCopy).map(([status, label]) => (
              <span key={status}><i className={`status-dot ${status}`} />{label}</span>
            ))}
          </div>
        </div>
        {Object.entries(groups).map(([group, items]) => (
          <section key={group} className="directory-group">
            <div className="directory-group-title">{group}</div>
            {items.map((item) => (
              <button key={item.id} className={active === item.id || (item.id === 'create' && isCreateState(active)) ? 'active' : ''} onClick={() => setPage(item.id)}>
                <span className="directory-label">
                  <i className={`status-dot ${item.status}`} aria-label={directoryStatusCopy[item.status]} />
                  <span>{item.label}</span>
                  {item.hasUpdate ? <em className="update-badge">更新</em> : null}
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </section>
        ))}
      </div>
    </aside>
  );
}

function UIDesignChecklistPage() {
  return (
    <section className="checklist-stage" aria-label="UI设计清单">
      <div className="checklist-head">
        <span className="eyebrow">UI scope</span>
        <h2>UI设计清单</h2>
      </div>
      <div className="checklist-list">
        {uiDesignChecklist.map((item) => (
          <article key={item.number} className="checklist-item">
            <span className="checklist-number">{item.number}</span>
            <span className="checklist-copy">
              <strong>{item.page}</strong>
              <em>{item.state}</em>
            </span>
            <span className="checklist-status">
              <i className={`status-dot ${item.status}`} aria-label={directoryStatusCopy[item.status]} />
              <span>{directoryStatusCopy[item.status]}</span>
              {item.hasUpdate ? <em className="update-badge">更新</em> : null}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

const uiColorSpec = [
  { name: '页面底色', token: '#111111', usage: '手机内所有页面主背景，保持黑色深底。' },
  { name: '主卡片', token: '#1C1C1C', usage: '列表容器、功能面板、表单、弹窗底色。' },
  { name: '次级面板', token: '#222222', usage: '次级面板、暗色输入区域、弱化控件。' },
  { name: '强控件', token: '#2A2A2A', usage: '主按钮、选中态、强操作控件。' },
  { name: '封面占位', token: '#333333', usage: '模板封面、作品封面、Banner、上传预览。' },
  { name: '描边分隔', token: '#3A3A3A', usage: '按钮描边、输入分隔线、控件边界。' },
  { name: '主文字', token: '#F2F2F2', usage: '深色背景上的标题、按钮文字。' },
  { name: '辅助文字', token: '#A8A8A8', usage: '说明、弱提示、二级信息。' },
  { name: '反白操作', token: '#F2F2F2 / #111111', usage: '仅用于高强调选中态或一键登录主操作。' }
];

const uiTypeSpec = [
  { role: 'App/Hero 标题', size: '26px', line: '31px', weight: '900', usage: '登录标题、关键页面主标题。' },
  { role: '大页面标题', size: '22px', line: '27px', weight: '900', usage: '页面内主标题。' },
  { role: '二级导航标题', size: '16px', line: '22px', weight: '800', usage: '二级页面顶部标题。' },
  { role: '模块标题', size: '18px', line: '22px', weight: '900', usage: '推荐、作品、权益等模块标题。' },
  { role: '卡片标题', size: '14px', line: '18px', weight: '800-900', usage: '模板名、入口名、列表标题。' },
  { role: '正文说明', size: '13px', line: '18px', weight: '700', usage: '状态说明、权益说明、字段提示。' },
  { role: '辅助说明', size: '12px', line: '16px', weight: '700', usage: '弱提示、说明和 meta。' },
  { role: '底部导航', size: '11px', line: '15px', weight: '700', usage: '一级页底部 Tab。' }
];

const uiSpacingSpec = [
  { name: '手机尺寸', value: '375 x 812', usage: '固定移动端评审画布。' },
  { name: '目录宽度', value: '210px', usage: '左侧项目卡片和页面目录固定宽度，不随内容变化。' },
  { name: '原型列宽', value: '431px', usage: '中间手机原型区域固定宽度，包含状态切换和手机外框。' },
  { name: '说明文档宽度', value: '420px', usage: '右侧 Product Notes 固定宽度，内容超出时仅面板内部滚动。' },
  { name: '三栏间距', value: '20px', usage: '目录、原型、说明文档之间统一间距；桌面总宽 1101px。' },
  { name: '页面边距', value: '16px', usage: '一级页和多数二级页左右边距。' },
  { name: '模块间距', value: '16px / 22px', usage: '常规模块间距 16px，重点区块 22px。' },
  { name: '列表间距', value: '10px', usage: '卡片流、筛选、记录和宫格。' },
  { name: '卡片内边距', value: '12px / 16px', usage: '普通控件 12px，信息卡 16px。' },
  { name: '卡片圆角', value: '16px', usage: '主卡片、封面、入口面板。' },
  { name: '控件圆角', value: '12px', usage: '输入框、按钮、小卡片。' },
  { name: '底部操作按钮', value: '44px 高 / 12px 圆角', usage: 'AI 视频、作品详情、会员中心、能量中心、登录等底部主操作统一使用。' },
  { name: '胶囊圆角', value: '999px', usage: '筛选、会员入口和小型标签按钮。' }
];

const uiButtonSpec = [
  { name: '描边线宽', value: '1px solid', usage: '所有普通按钮、输入边界、控件分隔线统一使用 1px。' },
  { name: '主按钮', value: '44px 高 / 12px 圆角', usage: '背景 #2A2A2A，描边 #2A2A2A，文字 #FFFFFF。' },
  { name: '次按钮', value: '44px 高 / 12px 圆角', usage: '背景 #1C1C1C，描边 #3A3A3A，文字 #F2F2F2。' },
  { name: '按钮间距', value: '10px / 8px', usage: '双按钮操作组间距 10px，紧凑标签和图标按钮间距 8px。' },
  { name: '紧凑标签', value: '32px 高 / 999px 圆角 / 8px 间距', usage: '筛选、状态、分组切换使用；选中态反白。' },
  { name: '图标按钮', value: '32px 或 36px / 10px 圆角 / 8px 间距', usage: '工具按钮和导航按钮；图标尺寸 16-20px。' },
  { name: '登录授权按钮', value: '48px 高 / 24px 圆角 / 12px 纵向间距', usage: '仅一键登录等登录授权场景使用，不用于底部操作组。' }
];

const uiPlaceholderSpec = [
  { name: '模板/素材封面', value: '3:4 / 12px 圆角', usage: '纯灰色色块，标题放封面下方，封面内不写文字。' },
  { name: '视频封面', value: '3:4 / 12px 圆角', usage: '同素材封面，仅允许叠加 16-18px 播放图标。' },
  { name: '历史缩略图', value: '1:1 / 8px 圆角', usage: '用于生成记录、历史结果横向列表。' },
  { name: 'Banner 占位', value: '16:7 或固定高度 / 16px 圆角', usage: '纯色块，不放文字、图标或嵌套小块。' },
  { name: '大预览区', value: '4:5 左右 / 16px 圆角', usage: '用于 AI 视频、作品预览等主视觉区域。' },
  { name: '上传占位', value: '自适应稳定高度 / 16px 圆角', usage: '可放一个图标、一行动作文案和一行短提示。' }
];

function UISpecPage() {
  return (
    <section className="checklist-stage ui-spec-stage" aria-label="UI规范说明">
      <div className="checklist-head">
        <span className="eyebrow">UI standard</span>
        <h2>UI规范说明</h2>
        <p>本项目使用黑白灰低保真风格，所有页面必须复用固定颜色、字号、间距、圆角和按钮规范，不新增彩色强调或半透明效果。</p>
      </div>
      <section className="ui-spec-section">
        <h3>颜色规范</h3>
        <div className="ui-token-grid">
          {uiColorSpec.map((item) => (
            <article className="ui-token-card" key={item.name}>
              <i style={{ background: item.token }} />
              <div>
                <strong>{item.name}</strong>
                <span>{item.token}</span>
                <p>{item.usage}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="ui-spec-section">
        <h3>字号规范</h3>
        <div className="ui-spec-table">
          {uiTypeSpec.map((item) => (
            <article key={item.role}>
              <strong>{item.role}</strong>
              <span>{item.size} / {item.line} / {item.weight}</span>
              <p>{item.usage}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="ui-spec-section">
        <h3>间距与圆角</h3>
        <div className="ui-spec-table compact">
          {uiSpacingSpec.map((item) => (
            <article key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.value}</span>
              <p>{item.usage}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="ui-spec-section">
        <h3>按钮规范</h3>
        <div className="ui-spec-table compact">
          {uiButtonSpec.map((item) => (
            <article key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.value}</span>
              <p>{item.usage}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="ui-spec-section">
        <h3>图片占位符格式</h3>
        <div className="ui-spec-table compact">
          {uiPlaceholderSpec.map((item) => (
            <article key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.value}</span>
              <p>{item.usage}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function PrototypeStage({ children, page, setPage, profileState, setProfileState, resultState, setResultState, aiVideoState, setAiVideoState, loginState, setLoginState, setActiveInteraction }) {
  const pageInfo = pageDirectory.find((item) => item.id === (isCreateState(page) ? 'create' : page));
  const stateControlId = page === 'profile' ? 'profile-state' : page === 'result' ? 'result-state' : page === 'aiVideo' ? 'ai-video-state' : isLoginPage(page) ? 'login-state' : isCreateState(page) ? 'create-state' : 'page-state';
  const stateOptions = isCreateState(page)
    ? createSubstates.map((state, index) => ({ ...state, number: `3-${index + 1}`, active: page === state.id, onClick: () => setPage(state.id) }))
    : page === 'profile'
      ? profileStates.map((state, index) => ({ ...state, number: `2-${index + 1}`, active: profileState === state.id, onClick: () => setProfileState(state.id) }))
      : page === 'result'
        ? resultStates.map((state, index) => ({ ...state, number: `8-${index + 1}`, active: resultState === state.id, onClick: () => setResultState(state.id) }))
        : page === 'aiVideo'
          ? aiVideoStates.map((state, index) => ({ ...state, number: `5-${index + 1}`, active: aiVideoState === state.id, onClick: () => setAiVideoState(state.id) }))
          : isLoginPage(page)
            ? getLoginStates(page).map((state, index) => ({ ...state, number: `${getPageNumber(page)}-${index + 1}`, active: loginState === state.id, onClick: () => setLoginState(state.id) }))
            : [{ id: `${page}-default`, number: `${getPageNumber(page)}-1`, label: '默认态', active: true, onClick: () => {} }];
  return (
    <section className="phone-stage" aria-label="移动端原型">
      <div className="prototype-state-switch" aria-label={`${pageInfo?.label || '当前页面'}状态切换`} {...bindInteraction(stateControlId, setActiveInteraction)}>
        <div>
          {stateOptions.map((state) => (
            <button
              key={state.id}
              className={state.active ? 'active' : ''}
              onClick={state.onClick}
              aria-disabled={stateOptions.length === 1 ? 'true' : undefined}
            >
              {state.label}
            </button>
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}

function PhoneFrame(props) {
  const { page, setPage, setActiveInteraction, setMemberRetentionOpen } = props;
  const primary = isPrimaryPage(page);
  const customTop = page === 'create' || page === 'createEmpty' || page === 'createBody' || page === 'createTemplate';
  const handleBack = () => {
    if (page === 'memberCenter') {
      setMemberRetentionOpen?.(true);
      return;
    }
    setPage(page === 'energyCenter' ? 'profile' : 'home');
  };
  return (
    <div className="phone">
      <div className="statusbar">
        <span>9:35</span>
        <span className="signals">▮▮▮ WiFi ▭</span>
      </div>
      {!primary && !customTop ? <BackBar title={pageCopy[page].title} onBack={handleBack} /> : null}
      <div className={`screen ${page === 'create' || page === 'createEmpty' || page === 'createBody' || page === 'createTemplate' ? 'creation-screen-wrap' : ''}`}>
        {page === 'home' && <HomeScreen {...props} />}
        {page === 'aiVideo' && <AiVideoScreen {...props} videoReferencePicked={props.ctx.videoReferencePicked} selectedVideoTemplate={props.ctx.selectedVideoTemplate} />}
        {page === 'loginCn' && <LoginScreen {...props} region="cn" />}
        {page === 'loginGlobal' && <LoginScreen {...props} region="global" />}
        {page === 'list' && <ListScreen {...props} />}
        {page === 'result' && <ResultScreen {...props} pickedImage={props.ctx.pickedImage} />}
        {page === 'memberCenter' && <MemberCenterScreen {...props} />}
        {page === 'energyCenter' && <EnergyCenterScreen {...props} />}
        {page === 'create' && <CreateScreen {...props} />}
        {page === 'createEmpty' && <CreateScreen {...props} emptyState />}
        {page === 'createBody' && <CreateScreen {...props} bodyState />}
        {page === 'createTemplate' && <CreateScreen {...props} templateOnly />}
        {page === 'profile' && <ProfileScreen {...props} />}
        {page === 'components' && <ComponentLibraryScreen setActiveInteraction={setActiveInteraction} />}
      </div>
      {primary ? <TabBar active={page} setPage={setPage} setActiveInteraction={setActiveInteraction} /> : null}
    </div>
  );
}

function BackBar({ title, onBack }) {
  return (
    <div className="nav-bar">
      <button className="icon-btn" onClick={onBack} aria-label="返回"><ChevronLeft size={20} /></button>
      <span>{title}</span>
      <span />
    </div>
  );
}

function HomeScreen({ setPage, openTemplateForAiVideo, navToList, ctx, setHomeFilter, setAiVideoState, setActiveInteraction }) {
  const visibleRecommendations = homeRecommendations.filter((item) => item.group === ctx.homeFilter);
  const openRecommendation = (item) => {
    openTemplateForAiVideo(item.name, item.category);
  };

  return (
    <div className="home-screen">
      <div className="home-head">
        <div>
          <span>AI Studio</span>
          <strong>开始创作</strong>
        </div>
        <button onClick={() => setPage('profile')}><Crown size={15} />会员</button>
      </div>

      <section className="home-task-board">
        <button className="task-primary" onClick={() => setPage('create')} {...bindInteraction('home-create', setActiveInteraction)}>
          <WandSparkles size={30} />
          <strong>AI创作</strong>
          <span>上传图片并输入想法</span>
        </button>
        <div className="task-secondary-stack">
          <button onClick={() => { setAiVideoState('template'); setPage('aiVideo'); }} {...bindInteraction('home-video', setActiveInteraction)}>
            <Play size={19} />
            <strong>AI视频</strong>
          </button>
          <button onClick={() => navToList({ title: '推荐模板', items: videoTemplates })} {...bindInteraction('home-list', setActiveInteraction)}>
            <Grid2X2 size={19} />
            <strong>模板库</strong>
          </button>
        </div>
      </section>

      <BannerPlaceholder />

      <section className="home-recommend-feed">
        <div className="home-feed-head">
          <div>
            <span>{homeFilters.find((item) => item.id === ctx.homeFilter)?.label || '推荐'}</span>
            <strong>为你精选</strong>
          </div>
        </div>
        <div className="home-feed-filters" aria-label="推荐分类" {...bindInteraction('home-filter', setActiveInteraction)}>
          {homeFilters.map((filter) => (
            <button
              key={filter.id}
              className={ctx.homeFilter === filter.id ? 'active' : ''}
              onClick={() => setHomeFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="home-template-grid">
          {visibleRecommendations.map((item) => (
            <button className="home-template-card" key={`${item.category}-${item.name}`} onClick={() => openRecommendation(item)} {...bindInteraction('home-template', setActiveInteraction)}>
              <span className={`home-template-thumb tone-${item.tone}`}>
                {item.group === 'video' ? <Play size={17} /> : null}
              </span>
              <strong>{item.name}</strong>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function BannerPlaceholder() {
  return (
    <section className="banner-placeholder" aria-label="Banner 图占位" />
  );
}

function AiVideoScreen({ setPage, ctx, videoReferencePicked, setVideoReferencePicked, selectedVideoTemplate, setSelectedVideoTemplate, setSelectedTemplate, setAiVideoState, setActiveInteraction }) {
  const [energyModalOpen, setEnergyModalOpen] = useState(false);
  const selectedTemplateName = ctx.selectedTemplate?.name || videoTemplates[selectedVideoTemplate] || videoTemplates[0];
  const albumPhotos = ['最近照片', '自拍', '人像', '全身照', '收藏'];
  const selectVideoTemplate = (name, index) => {
    setSelectedVideoTemplate(index);
    setSelectedTemplate({ name, category: 'AI视频' });
  };
  const startVideoMake = () => {
    setSelectedTemplate({ name: selectedTemplateName, category: 'AI视频' });
    setVideoReferencePicked(true);
    setAiVideoState('photoPicker');
  };
  const showEnergyInsufficient = () => {
    setSelectedTemplate({ name: selectedTemplateName, category: 'AI视频' });
    setVideoReferencePicked(true);
    setEnergyModalOpen(true);
  };
  return (
    <div className="ai-video-screen">
      <section className="video-preview-panel" {...bindInteraction('video-preview', setActiveInteraction)}>
        <div className={`video-preview-media tone-${selectedVideoTemplate % 3}`}>
          <Play size={34} />
          <span>{selectedTemplateName}</span>
        </div>
      </section>

      <section className="video-template-strip" aria-label="视频模板">
        <div className="ai-video-template-grid">
          {videoTemplates.map((name, index) => (
            <button
              key={`${name}-${index}`}
              className={`ai-video-template ${selectedVideoTemplate === index ? 'selected' : ''}`}
              onClick={() => selectVideoTemplate(name, index)}
              {...bindInteraction('video-template', setActiveInteraction)}
            >
              <div className={`ai-video-thumb tone-${index % 3}`}>
                <Play size={16} />
              </div>
              <strong>{name}</strong>
            </button>
          ))}
        </div>
      </section>

      <div className="video-slogan">
        <strong>AI 视频生成</strong>
        <span>AI 生成视频特效 · 消耗 20 能量</span>
      </div>

      <div className="ai-video-bottom compact">
        <button className="ai-video-make" onClick={startVideoMake} {...bindInteraction('video-make', setActiveInteraction)}>
          <span>生成同款</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {ctx.aiVideoState === 'photoPicker' ? (
        <div className="album-sheet" role="dialog" aria-label="选择照片">
          <button className="album-backdrop" onClick={() => setAiVideoState('template')} aria-label="关闭相册选择" {...bindInteraction('video-album-cancel', setActiveInteraction)} />
          <section className="album-panel" {...bindInteraction('video-album', setActiveInteraction)}>
            <div className="album-head">
              <strong>选择照片</strong>
              <button onClick={() => setAiVideoState('template')} {...bindInteraction('video-album-cancel', setActiveInteraction)}>取消</button>
            </div>
            <div className="album-grid">
              {albumPhotos.map((photo, index) => (
                <button key={photo} onClick={showEnergyInsufficient}>
                  <span className={`album-thumb tone-${index % 3}`}>
                    {index === 0 ? <ImagePlus size={20} /> : null}
                  </span>
                  <em>{photo}</em>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
      {energyModalOpen ? (
        <div className="modal-layer" role="dialog" aria-label="能量不足">
          <button className="modal-backdrop" onClick={() => setEnergyModalOpen(false)} aria-label="关闭能量不足弹窗" />
          <section className="prototype-modal energy-insufficient-modal" {...bindInteraction('energy-insufficient', setActiveInteraction)}>
            <strong>能量不足</strong>
            <p>当前模板需要消耗 20 能量，余额不足时无法生成同款。</p>
            <div className="modal-actions">
              <button onClick={() => setPage('energyCenter')}>去充值</button>
              <button onClick={() => setEnergyModalOpen(false)}>稍后再说</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function ListScreen({ ctx, openTemplateForAiVideo, setActiveInteraction }) {
  const list = [...ctx.selectedCategory.items, '商务形象', '旅行写真', '节日氛围', '极简棚拍'];
  return (
    <div className="padded">
      <div className="search-box" {...bindInteraction('list-search', setActiveInteraction)}><Search size={17} /> 搜索{ctx.selectedCategory.title}模板</div>
      <div className="chips" {...bindInteraction('list-filter', setActiveInteraction)}><span>全部</span><span>热门</span><span>最新</span><span>收藏</span></div>
      <div className="grid-list">
        {list.map((name, index) => (
          <button key={name} className="template-card tall" onClick={() => openTemplateForAiVideo(name, ctx.selectedCategory.title)} {...bindInteraction('list-template', setActiveInteraction)}>
            <div className="avatar-placeholder" />
            <strong>{name}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultScreen({ ctx, setPage, setResultState, setAiVideoState, setActiveInteraction }) {
  const state = ctx.resultState || 'processing';
  const isCompleted = state === 'completed';
  const isFailed = state === 'failed';
  const retry = () => setResultState?.('processing');
  return (
    <div className={`result-screen ${state}`}>
      <div className={`result-box full ${isCompleted ? 'ready' : ''} ${isFailed ? 'failed' : ''}`}>
        {isCompleted ? (
          <><Sparkles size={46} /><strong>生成完成</strong><span>作品预览铺满展示区域</span></>
        ) : isFailed ? (
          <><X size={44} /><strong>生成失败</strong><span>照片识别失败或服务繁忙，请重新生成</span></>
        ) : (
          <><Loader2 className="spin" size={42} /><strong>生成中</strong><span>预计 20 秒内完成，请勿关闭页面</span></>
        )}
      </div>
      <div className="result-actions">
        {isCompleted ? (
          <>
            <button className="bottom-cta result-save" onClick={() => setPage('profile')} {...bindInteraction('result-save', setActiveInteraction)}><Download size={18} />保存作品</button>
            <button className="ghost-cta result-retry" onClick={retry} {...bindInteraction('result-retry', setActiveInteraction)}>重新生成</button>
          </>
        ) : isFailed ? (
          <>
            <button className="bottom-cta result-save" onClick={retry} {...bindInteraction('result-retry', setActiveInteraction)}>重新生成</button>
            <button className="ghost-cta result-retry" onClick={() => { setAiVideoState('template'); setPage('aiVideo'); }} {...bindInteraction('result-retry', setActiveInteraction)}>重新选择模板</button>
          </>
        ) : (
          <>
            <button className="bottom-cta result-save result-processing" aria-disabled="true" {...bindInteraction('result-save', setActiveInteraction)}><Loader2 size={18} className="spin" />生成中</button>
          </>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ setPage, setProfileState, setLoginState, ctx, setActiveInteraction, region = 'global' }) {
  const isCn = region === 'cn';
  const state = ctx.loginState || (isCn ? 'cnOneTap' : 'globalChoice');
  const isChoice = !isCn && ['globalChoice', 'globalGoogleAuth', 'globalFailed'].includes(state);
  const showPhoneForm = ['cnPhoneForm', 'cnCodeSent'].includes(state);
  const showEmailForm = ['globalEmailForm', 'globalCodeSent'].includes(state);
  const isCodeSent = state === 'cnCodeSent' || state === 'globalCodeSent';
  const isCarrierAuth = state === 'cnOneTap';
  const isDomesticCodeForm = showPhoneForm;
  const isAuthModal = state === 'globalGoogleAuth';
  const isFailed = state === 'globalFailed';
  const choiceState = isCn ? 'cnOneTap' : 'globalChoice';
  const formState = isCn ? 'cnPhoneForm' : 'globalEmailForm';
  const sentState = isCn ? 'cnCodeSent' : 'globalCodeSent';
  const failedState = isCn ? 'cnPhoneForm' : 'globalFailed';
  const finishLogin = () => {
    setProfileState?.('loggedInFree');
    setLoginState?.(choiceState);
    setPage('profile');
  };
  return (
    <div className={`login-screen login-${state}`}>
      {!isCn ? (
        <section className="global-login-heading">
          <strong>登录你的账号</strong>
          <span>同步作品和能量记录</span>
        </section>
      ) : null}

      {isChoice ? (
        <section className="login-method-panel">
          <button className="login-method-option primary" onClick={() => setLoginState('globalEmailForm')} {...bindInteraction('login-email-option', setActiveInteraction)}>
            <Mail size={22} />
            <div>
              <strong>邮箱验证码登录</strong>
              <em>接收验证码完成登录</em>
            </div>
            <ChevronRight size={18} />
          </button>
          <button className="login-method-option" onClick={() => setLoginState('globalGoogleAuth')} {...bindInteraction('login-google-option', setActiveInteraction)}>
            <span>G</span>
            <div>
              <strong>Google 登录</strong>
              <em>快速授权登录</em>
            </div>
            <ChevronRight size={18} />
          </button>
          <p className="login-method-policy">继续即代表同意用户协议和隐私政策</p>
        </section>
      ) : null}

      {isCarrierAuth ? (
        <section className="carrier-auth-page">
          <div className="carrier-phone" {...bindInteraction('login-cn-one-tap', setActiveInteraction)}>
            <em>本机号码</em>
            <strong>138****0000</strong>
            <span>中国移动认证</span>
          </div>
          <button className="carrier-primary" onClick={finishLogin} {...bindInteraction('login-cn-one-tap', setActiveInteraction)}>本机号码一键登录</button>
          <button className="carrier-switch" onClick={() => setLoginState('cnPhoneForm')} {...bindInteraction('login-cn-code-option', setActiveInteraction)}>其他手机号登录</button>
          <label className="agreement-row carrier-agreement" {...bindInteraction('login-agreement', setActiveInteraction)}>
            <input type="checkbox" readOnly checked />
            <span>已阅读并同意用户协议、隐私政策和运营商认证服务协议</span>
          </label>
        </section>
      ) : null}

      {isFailed ? (
        <div className="login-modal-backdrop">
          <div className="login-modal login-error-modal" {...bindInteraction('login-error-retry', setActiveInteraction)}>
            <strong>登录失败</strong>
            <span>请重新选择登录方式或稍后再试。</span>
            <div className="login-error-actions">
              <button onClick={() => setLoginState(choiceState)}>{isCn ? '返回一键登录' : '重新选择方式'}</button>
              <button onClick={() => setLoginState(formState)}>重试</button>
            </div>
          </div>
        </div>
      ) : null}

      {isAuthModal ? (
        <div className="login-modal-backdrop">
          <section className="login-modal google-auth-panel">
            <button className="login-sub-back" onClick={() => setLoginState(choiceState)} {...bindInteraction('login-method-back', setActiveInteraction)}><ChevronLeft size={16} />关闭</button>
            <div className="google-auth-main" {...bindInteraction(isCn ? 'login-cn-one-tap' : 'login-google', setActiveInteraction)}>
              <Loader2 size={24} className="spin" />
              <div>
                <strong>{isCn ? '确认本机号码' : '正在连接 Google'}</strong>
                <p>{isCn ? '使用当前手机号一键登录。' : '请在弹出的授权页完成确认。'}</p>
              </div>
            </div>
          <div className="google-auth-actions" {...bindInteraction(isCn ? 'login-cn-one-tap' : 'login-google-callback', setActiveInteraction)}>
              <button onClick={() => setLoginState(choiceState)}>取消</button>
              <button onClick={finishLogin}>完成</button>
          </div>
          </section>
        </div>
      ) : null}

      {(showEmailForm || showPhoneForm) ? (
        <section className={`code-login-panel email-login-panel ${isCn ? 'sms-login-panel' : ''}`}>
          {isCn ? (
            <div className="sms-login-title">
              <strong>手机号登录</strong>
              <span>未注册手机号验证后自动创建账号</span>
            </div>
          ) : null}
          <label className="login-field">
            <span>{isCn ? '手机号' : '邮箱'}</span>
            <input value={isCn ? '138 0000 0000' : 'pm@example.com'} readOnly aria-label={isCn ? '手机号' : '邮箱'} {...bindInteraction(isCn ? 'login-phone' : 'login-email', setActiveInteraction)} />
          </label>
          <label className="login-field code-field">
            <span>验证码</span>
            <input value={isCodeSent ? '428619' : ''} readOnly placeholder={isCn ? '输入短信验证码' : '输入邮件验证码'} aria-label={isCn ? '短信验证码' : '邮件验证码'} {...bindInteraction('login-code', setActiveInteraction)} />
            <button onClick={() => setLoginState(sentState)} {...bindInteraction('login-send-code', setActiveInteraction)}>{isCodeSent ? '48s' : '获取验证码'}</button>
          </label>
          {isCodeSent ? <div className="login-code-hint">{isCn ? '短信验证码已发送' : '邮件验证码已发送'}</div> : null}
          <label className="agreement-row" {...bindInteraction('login-agreement', setActiveInteraction)}>
            <input type="checkbox" readOnly checked={isCodeSent} />
            <span>同意用户协议和隐私政策</span>
          </label>
          <button className="bottom-cta login-submit" aria-disabled={isCodeSent ? undefined : 'true'} onClick={isCodeSent ? finishLogin : () => setLoginState(failedState)} {...bindInteraction('login-submit', setActiveInteraction)}>
            {isCodeSent ? '确认登录' : '登录'}
          </button>
          <button className="login-flow-switch" onClick={() => setLoginState(choiceState)} {...bindInteraction('login-method-back', setActiveInteraction)}>
            <ChevronLeft size={14} />
            <span>{isCn ? '返回一键登录' : '选择其他方式'}</span>
          </button>
        </section>
      ) : null}
    </div>
  );
}

function CreateScreen({ setPage, setPickedImage, ctx, setSelectedCreationTool, setSelectedCreationRecord, setSelectedCreationCase, setActiveInteraction, emptyState = false, bodyState = false, templateOnly = false }) {
  const creationTools = ['AI修图', 'AI旅拍', 'AI换装', 'AI换发型', 'AI艺术照', 'AI美体'];
  const hasImage = emptyState ? false : ctx.pickedImage;
  const activeCreationTool = (bodyState || templateOnly) ? 'AI美体' : ctx.selectedCreationTool === 'AI美体' ? 'AI修图' : ctx.selectedCreationTool;
  const showBodyCases = bodyState || templateOnly;
  const selectRecord = (index) => {
    setSelectedCreationRecord(index);
    setPickedImage(true);
  };
  const selectCreationTool = (tool) => {
    setSelectedCreationTool(tool);
    if (tool === 'AI美体') {
      setPage(templateOnly ? 'createTemplate' : 'createBody');
      return;
    }
    if (bodyState || templateOnly) {
      setPage('create');
    }
  };
  const quickTools = [
    { id: 'create-undo', label: '撤销', icon: Undo2 },
    { id: 'create-redo', label: '恢复', icon: Redo2 },
    { id: 'create-smear', label: '涂抹', icon: WandSparkles },
    { id: 'create-erase', label: '擦除', icon: Eraser }
  ];
  const startMake = () => setPage('result');
  return (
    <div className={`creation-workbench ${emptyState ? 'empty-workbench' : ''} ${showBodyCases ? 'with-case-row' : ''} ${templateOnly ? 'template-only' : ''}`}>
      <div className="creation-topbar">
        <button className="creation-icon-btn" onClick={() => setPage('home')} aria-label="关闭" {...bindInteraction('create-close', setActiveInteraction)}><X size={26} /></button>
        <div className="creation-title">
          {!emptyState ? (
            <div className="creation-record-strip" aria-label="生成记录" {...bindInteraction('create-record', setActiveInteraction)}>
              {creationRecords.map((record, index) => (
                <button
                  key={record}
                  className={ctx.selectedCreationRecord === index ? 'active' : ''}
                  onClick={() => selectRecord(index)}
                  aria-label={`选择${record}`}
                >
                  <span className={`record-thumb tone-${index % 3}`} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button className="save-pill" {...bindInteraction('create-save', setActiveInteraction)}>保存</button>
      </div>

      <main className={`creation-stage ${emptyState ? 'no-history' : ''}`}>
        <div className="creation-canvas-wrap">
          <button className={`creation-canvas ${hasImage ? 'selected' : ''}`} onClick={() => setPickedImage(true)} {...bindInteraction('create-upload', setActiveInteraction)}>
            <ImagePlus size={44} />
            <strong>{hasImage ? '已上传图片' : '点击上传图片'}</strong>
            <span>{hasImage ? '可继续调整提示词和工具' : '上传后可使用下方 AI 能力'}</span>
          </button>

          <div className="canvas-tool-strip">
            <div className="creation-tool-row">
              {quickTools.map(({ id, label, icon: Icon }) => (
                <button key={label} {...bindInteraction(id, setActiveInteraction)}>
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="strength-control compact">
              <button aria-label="小笔触" {...bindInteraction('create-brush-small', setActiveInteraction)}><span className="brush-dot small" /></button>
              <button className="active" aria-label="中笔触" {...bindInteraction('create-brush-medium', setActiveInteraction)}><span className="brush-dot medium" /></button>
              <button aria-label="大笔触" {...bindInteraction('create-brush-large', setActiveInteraction)}><span className="brush-dot large" /></button>
            </div>
          </div>

        </div>
      </main>

      <section className="creation-panel">
        {!templateOnly ? (
          <div className="creation-primary-row">
            <div className="prompt-row" {...bindInteraction('create-prompt', setActiveInteraction)}>
              <div className="assist-row">
                <button className="assist-upload-btn" aria-label="上传辅助图片" {...bindInteraction('create-assist', setActiveInteraction)}><Plus size={22} /></button>
                <span className="assist-thumb" />
              </div>
              <div className="prompt-input-shell">
                <span className="prompt-placeholder">输入想生成的内容，如“戴上墨镜”</span>
              </div>
            </div>
            <button className="make-pill" aria-label="发送制作" aria-disabled={!hasImage} onClick={() => hasImage ? startMake() : null} {...bindInteraction('create-make', setActiveInteraction)}><Send size={20} /></button>
          </div>
        ) : null}

        {showBodyCases ? (
          <div className="creation-case-strip" aria-label="AI美体模板案例" {...bindInteraction('create-case', setActiveInteraction)}>
            {bodyTemplateCases.map((name, index) => (
              <button
                key={name}
                className={ctx.selectedCreationCase === index ? 'active' : ''}
                onClick={() => setSelectedCreationCase(index)}
                aria-label={`选择${name}`}
              >
                <span className={`case-cover tone-${index % 3}`} />
                <strong>{name}</strong>
              </button>
            ))}
          </div>
        ) : null}

        <div className="creation-tabs" {...bindInteraction('create-tool', setActiveInteraction)}>
          {creationTools.map((tool) => (
            <button
              key={tool}
              className={activeCreationTool === tool ? 'active' : ''}
              onClick={() => selectCreationTool(tool)}
            >
              <WandSparkles size={18} />
              <span>{tool}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProfileScreen({ setPage, ctx, setProfileWorkTab, setActiveInteraction }) {
  const workTabs = ['图片', '视频'];
  const works = [
    { title: '通勤头像', type: '图片', tone: 0, size: 'short' },
    { title: 'AI美体草稿', type: '图片', tone: 1, size: 'tall' },
    { title: '旅行写真', type: '图片', tone: 2, size: 'medium' },
    { title: '换装短片', type: '视频', tone: 1, size: 'tall' },
    { title: '职业转场', type: '视频', tone: 2, size: 'medium' },
    { title: 'OOTD 动效', type: '视频', tone: 0, size: 'short' }
  ];
  const isLoggedOut = ctx.profileState === 'loggedOut';
  const isVip = ctx.profileState === 'loggedInVip';
  const isPointsEmpty = isLoggedOut || !isVip;
  const activeWorkTab = ctx.profileWorkTab || '图片';
  const visibleWorks = isVip ? works.filter((work) => work.type === activeWorkTab) : [];
  return (
    <div className={`profile-screen ${isLoggedOut ? 'logged-out' : ''}`}>
      <div className="profile-head-row">
        <div className="profile-head">
          <div className="avatar-circle"><User size={30} /></div>
          <div><strong>{isLoggedOut ? '未登录用户' : '小雨同学'}</strong><span>{isLoggedOut ? '登录后查看作品和能量' : 'ID 820164'}</span></div>
        </div>
        <button className="settings-icon-entry" aria-label="设置" {...bindInteraction('profile-settings', setActiveInteraction)}>
          <Settings size={18} />
        </button>
      </div>

      <button className="vip-card" onClick={() => setPage('memberCenter')} {...bindInteraction('profile-vip', setActiveInteraction)}>
        <div className="vip-card-top">
          <span className="vip-mark"><Crown size={18} /></span>
          <span className="vip-title-copy">
            <strong>{isVip ? '会员中心' : '开通会员'}</strong>
            <em>{isLoggedOut ? '登录后解锁完整权益' : isVip ? '高清导出 · 专属模板 · 去水印保存' : '高清导出、专属模板、去水印保存'}</em>
          </span>
        </div>
        <div className="vip-benefit-grid">
          <span>高清导出</span>
          <span>专属模板</span>
          <span>去水印</span>
        </div>
        <p>{isVip ? '继续保持会员权益，作品导出和模板使用不中断。' : '开通后提升生成额度和导出质量，适合高频创作。'}</p>
      </button>

      <button className={`points-card ${isPointsEmpty ? 'empty' : ''}`} onClick={() => setPage('energyCenter')} {...bindInteraction('profile-points', setActiveInteraction)}>
        <Sparkles size={19} />
        <span><strong>能量中心</strong>{isPointsEmpty ? null : <em>剩余能量</em>}</span>
        {isPointsEmpty ? null : <b>1280</b>}
        <ChevronRight size={16} />
      </button>

      <section className="profile-section">
        <div className="profile-section-head">
          <strong>作品列表</strong>
          <span>{visibleWorks.length} 个</span>
        </div>
        <div className="works-tabs" aria-label="作品类型页签" {...bindInteraction('profile-work-tabs', setActiveInteraction)}>
          {workTabs.map((tab) => (
            <button key={tab} className={activeWorkTab === tab ? 'active' : ''} onClick={() => setProfileWorkTab(tab)}>{tab}</button>
          ))}
        </div>
        {visibleWorks.length ? (
          <div className="works-list">
          {visibleWorks.map((work, index) => (
            <button key={work.title} className={`work-item ${work.size}`} onClick={() => setPage('result')} {...bindInteraction('profile-works', setActiveInteraction)}>
              <span className={`work-thumb tone-${work.tone}`}>
                {work.type === '视频' ? <Play size={16} /> : null}
              </span>
              <span><strong>{work.title}</strong><em>{work.type} · {index === 0 ? '今天 14:20' : `6月${9 - index}日`}</em></span>
            </button>
          ))}
          </div>
        ) : (
          <div className="profile-empty-works" {...bindInteraction('profile-works', setActiveInteraction)}>{isLoggedOut ? '登录后查看作品' : '暂无作品'}</div>
        )}
      </section>
    </div>
  );
}

function MemberCenterScreen({ setPage, memberRetentionOpen, setMemberRetentionOpen, setActiveInteraction }) {
  const benefits = ['高清导出', '去水印保存', '专属模板', '生成加速'];
  const plans = [
    { title: '月度会员', desc: '适合短期体验', active: false },
    { title: '年度会员', desc: '适合高频创作', active: true }
  ];
  return (
    <div className="member-center-screen">
      <section className="member-hero member-hero-large" {...bindInteraction('member-benefits', setActiveInteraction)}>
        <div className="member-bg-visual" aria-label="会员背景图占位" />
        <div className="member-hero-copy">
          <span className="eyebrow">VIP</span>
          <strong>解锁高频创作权益</strong>
          <p>高清导出、专属模板和生成加速，适合持续产出作品的用户。</p>
        </div>
        <div className="member-benefit-copy">
          {benefits.map((benefit) => <span key={benefit}>{benefit}</span>)}
        </div>
      </section>

      <section className="member-plan-list" aria-label="会员套餐" {...bindInteraction('member-plan', setActiveInteraction)}>
        {plans.map((plan) => (
          <button key={plan.title} className={plan.active ? 'active' : ''}>
            <span>
              <strong>{plan.title}</strong>
              <em>{plan.desc}</em>
            </span>
            <b>{plan.active ? '推荐' : '可选'}</b>
          </button>
        ))}
      </section>

      <button className="member-pay-button" {...bindInteraction('member-pay', setActiveInteraction)}>3天免费试用</button>
      {memberRetentionOpen ? (
        <MemberRetentionModal
          onStay={() => setMemberRetentionOpen(false)}
          onLeave={() => {
            setMemberRetentionOpen(false);
            setPage('profile');
          }}
          setActiveInteraction={setActiveInteraction}
        />
      ) : null}
    </div>
  );
}

function MemberRetentionModal({ onStay, onLeave, setActiveInteraction }) {
  return (
    <div className="modal-layer member-retention-layer" role="dialog" aria-label="会员离开挽留">
      <button className="modal-backdrop" onClick={onStay} aria-label="关闭会员挽留弹窗" />
      <section className="prototype-modal member-retention-modal" {...bindInteraction('member-retention', setActiveInteraction)}>
        <strong>先试用 3 天再决定</strong>
        <p>试用期间可体验高清导出、专属模板和生成加速，离开后本次优惠入口不保留。</p>
        <div className="modal-actions">
          <button onClick={onStay}>继续试用</button>
          <button onClick={onLeave}>仍然离开</button>
        </div>
      </section>
    </div>
  );
}

function EnergyCenterScreen({ setActiveInteraction }) {
  const packages = [
    { title: '100 能量', desc: '轻量体验', active: false },
    { title: '500 能量', desc: '常用推荐', active: true },
    { title: '1200 能量', desc: '高频创作', active: false }
  ];
  const records = [
    { title: 'AI 视频制作', value: '-20', time: '今天 14:20' },
    { title: '高清导出', value: '-8', time: '今天 12:36' },
    { title: 'AI美体生成', value: '-15', time: '6月8日' }
  ];
  return (
    <div className="padded points-center-screen">
      <section className="points-balance-card" {...bindInteraction('energy-balance', setActiveInteraction)}>
        <span>当前能量</span>
        <strong>1280</strong>
        <em>最近更新 今天 14:20</em>
      </section>

      <section className="points-block">
        <div className="points-block-head">
          <strong>购买能量</strong>
          <span>充值套餐</span>
        </div>
        <div className="points-task-list energy-package-list" {...bindInteraction('energy-package', setActiveInteraction)}>
          {packages.map((pkg, index) => (
            <button key={pkg.title} className={pkg.active ? 'active' : ''}>
              <span className={`task-dot tone-${index}`} />
              <strong>{pkg.title}</strong>
              <em>{pkg.desc}</em>
            </button>
          ))}
        </div>
        <button className="energy-buy-button" {...bindInteraction('energy-buy', setActiveInteraction)}>购买选中套餐</button>
      </section>

      <section className="points-block">
        <div className="points-block-head">
          <strong>消耗明细</strong>
        </div>
        <div className="points-record-list" {...bindInteraction('energy-record', setActiveInteraction)}>
          {records.map((record) => (
            <button key={`${record.title}-${record.time}`}>
              <span>
                <strong>{record.title}</strong>
                <em>{record.time}</em>
              </span>
              <b>{record.value}</b>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ComponentLibraryScreen({ setActiveInteraction }) {
  const tools = ['主按钮', '次按钮', '禁用态', '工具卡'];
  return (
    <div className="padded component-screen" {...bindInteraction('components-preview', setActiveInteraction)}>
      <h2>低保真组件库</h2>
      <p className="muted">后续页面优先复用这些组件，保持灰阶、实体块面和真实手机尺寸。</p>

      <section className="component-section">
        <h3>Banner 图占位</h3>
        <BannerPlaceholder />
      </section>

      <section className="component-section">
        <h3>核心操作</h3>
        <button className="bottom-cta"><ImagePlus size={18} />主操作按钮</button>
        <button className="ghost-cta"><Share2 size={17} />次操作按钮</button>
      </section>

      <section className="component-section">
        <h3>工具宫格</h3>
        <div className="tool-grid">
          {tools.map((tool, index) => (
            <button key={tool} className={`tool-card ${index === 0 ? 'active' : ''}`}>
              <WandSparkles size={20} />
              <span>{tool}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="component-section">
        <h3>内容卡片</h3>
        <div className="card-row">
          {['模板', '视频', '空态'].map((item, index) => (
            <button className="template-card" key={item}>
              {index === 1 ? <Play className="play-dot" size={18} /> : null}
              <div className="avatar-placeholder" />
              <strong>{item}卡片</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="component-section">
        <h3>状态与列表</h3>
        <div className="result-box compact">
          <Sparkles size={30} />
          <strong>状态卡</strong>
          <span>用于加载、空状态、异常和成功反馈</span>
        </div>
        <div className="mini-list">
          {['列表项', '可进入项', '设置项'].map((item) => <button className="mini-item" key={item}>{item}<ChevronRight size={16} /></button>)}
        </div>
      </section>
    </div>
  );
}

function TabBar({ active, setPage, setActiveInteraction }) {
  const tabs = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'create', label: '创作', icon: Grid2X2 },
    { id: 'profile', label: '我的', icon: User }
  ];
  return (
    <nav className="tabbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return <button key={tab.id} className={isActive ? 'active' : ''} onClick={() => setPage(tab.id)} {...bindInteraction('home-tabs', setActiveInteraction)}><Icon size={21} />{tab.label}</button>;
      })}
    </nav>
  );
}

function SpecPanel({ spec, ctx, activeInteraction }) {
  const panelRef = useRef(null);
  const cardRefs = useRef({});
  const pageNumber = getPageNumber(ctx.page);
  const stateNumber = getStateNumber(ctx.page, ctx.profileState, ctx.resultState, ctx.aiVideoState, ctx.loginState);
  const contextTemplate = ctx.page === 'aiVideo'
    ? videoTemplates[ctx.selectedVideoTemplate]
    : ['home', 'list'].includes(ctx.page) ? ctx.selectedTemplate?.name : null;
  const interactions = ctx.page === 'aiVideo'
    ? getAiVideoStateInteractions(ctx.aiVideoState)
    : pageInteractions[ctx.page] || [];
  const getInteractionPurpose = (item) => item.purpose || `用于完成“${item.title}”相关的核心页面操作。`;
  const getInteractionResult = (item) => item.output ? `${item.effect} 结果：${item.output}` : item.effect;
  const getInteractionBoundary = (item) => {
    const parts = [];
    if (item.input) parts.push(`输入：${item.input}`);
    if (item.bounds) parts.push(item.bounds);
    return parts.length ? parts.join('；') : '不涉及特殊数据边界。';
  };
  useEffect(() => {
    if (!activeInteraction) return;
    const panel = panelRef.current;
    const target = cardRefs.current[activeInteraction];
    if (!panel || !target) return;
    const panelRect = panel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextTop = panel.scrollTop + targetRect.top - panelRect.top - (panel.clientHeight / 2) + (target.clientHeight / 2);
    panel.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
  }, [activeInteraction]);
  const rows = [
    ['页面用途', spec.purpose],
    ['页面元素说明', spec.elements],
    ['基础行为', spec.actions],
    ['字段规则', spec.rules],
    ['异常/空/加载状态', spec.states],
    ['权限逻辑', spec.permission],
    ['埋点说明', spec.tracking],
    ['验收标准', spec.acceptance]
  ];
  return (
    <aside className="spec-panel" ref={panelRef}>
      <div className="spec-head">
        <BadgeCheck size={20} />
        <div>
          <div className="eyebrow">Product notes</div>
          <h2>{spec.title}</h2>
        </div>
      </div>
      <div className="context-strip">
        页面编号：{pageNumber} / 状态编号：{stateNumber} / 当前页面：{spec.title}
        {contextTemplate ? ` / 模板：${contextTemplate}` : ''}
      </div>
      {interactions.length ? (
        <section className="spec-section interaction-spec-section">
          <h3>交互点说明</h3>
          <div className="interaction-note">鼠标悬停或键盘聚焦左侧原型控件时，下方对应说明会高亮。</div>
          <div className="interaction-card-list">
            {interactions.map((item, index) => (
              <article
                key={item.id}
                id={`interaction-${item.id}`}
                ref={(node) => {
                  if (node) {
                    cardRefs.current[item.id] = node;
                  } else {
                    delete cardRefs.current[item.id];
                  }
                }}
                className={`interaction-card ${activeInteraction === item.id ? 'active' : ''}`}
              >
                <div className="interaction-card-head">
                  <strong><em className="component-number">{stateNumber}-{index + 1}</em>{item.title}</strong>
                  <span>{item.trigger}</span>
                </div>
                <dl>
                  <div><dt>1. 组件或元素</dt><dd>{item.title}</dd></div>
                  <div><dt>2. 做什么用处</dt><dd>{getInteractionPurpose(item)}</dd></div>
                  <div><dt>3. 如何交互</dt><dd>{item.trigger}</dd></div>
                  <div><dt>4. 交互结果</dt><dd>{getInteractionResult(item)}</dd></div>
                  <div><dt>5. 是否有异常状态</dt><dd>{item.exceptions || '无特殊异常状态。'}</dd></div>
                  <div><dt>6. 是否有数据边界</dt><dd>{getInteractionBoundary(item)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {rows.map(([title, value]) => (
        <section key={title} className="spec-section">
          <h3>{title}</h3>
          {Array.isArray(value) ? <ul>{value.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{value}</p>}
        </section>
      ))}
    </aside>
  );
}

createRoot(document.getElementById('root')).render(<App />);
