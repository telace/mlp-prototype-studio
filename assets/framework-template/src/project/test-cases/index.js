export const getInteractionPurpose = (item) => item.purpose || `用于完成“${item.title}”相关的核心页面操作。`;

export const getInteractionResult = (item) => item.output ? `${item.effect} 结果：${item.output}` : item.effect;

export const isContentElement = (item) => (item.kind || item.role) === 'content';

export const inferElementType = (item) => {
  if (isContentElement(item)) return item.type || '内容展示组件';
  const text = `${item.title} ${item.trigger || ''} ${item.input || ''}`;
  if (/上传|照片|图片|相册/.test(text)) return '上传/素材组件';
  if (/输入|验证码|手机号|邮箱|提示词|搜索/.test(text)) return '表单输入组件';
  if (/列表|卡片|模板|作品|记录|缩略图/.test(text)) return '列表/卡片组件';
  if (/弹窗|Sheet|面板|遮罩/.test(text)) return '弹层组件';
  if (/按钮|登录|保存|购买|制作|生成|重试|返回|关闭/.test(text)) return '按钮/操作组件';
  if (/导航|页签|标签|分组|筛选/.test(text)) return '导航/切换组件';
  return '内容展示组件';
};

export const inferRequired = (item) => {
  const text = `${item.title} ${item.input || ''} ${item.bounds || ''}`;
  if (/必须|必填|主图|验证码|手机号|邮箱|协议|选中模板|案例必选/.test(text)) return '是/条件必填';
  if (/查看|浏览|筛选|记录|设置|返回|关闭/.test(text)) return '否';
  return '视业务条件';
};

export const inferApi = (item) => {
  if (isContentElement(item) && /(接口|后端|服务端|API)/.test(item.dataSource || item.source || '')) {
    return '是：展示内容来自后端，需要确认接口字段、空值、加载失败和缓存策略。';
  }
  const text = `${item.title} ${item.effect} ${item.input || ''} ${item.output || ''} ${item.exceptions || ''}`;
  if (/上传|生成|制作|保存|登录|验证码|购买|支付|能量|会员|接口|网络|服务端|订单|模板列表|作品/.test(text)) {
    return '是：需要研发确认接口名称、请求参数、失败码和重试策略。';
  }
  if (/埋点|上报/.test(text)) return '是：至少涉及行为上报接口。';
  return '否：本地 UI 状态即可完成。';
};

export const getInputRules = (item) => {
  if (isContentElement(item)) return '不涉及用户输入；需要校验展示内容的数据来源、字段格式、空值和超长策略。';
  const text = `${item.title} ${item.input || ''} ${item.bounds || ''}`;
  if (/图片|照片|主图|辅助图|相册/.test(text)) return '涉及上传：JPG/PNG/HEIC/WEBP，默认单图，辅助图最多 1 张，单文件 ≤20MB，建议短边 ≥512px、长边 ≤4096px。';
  if (/视频/.test(text)) return '涉及上传/处理：MP4/MOV，默认 ≤200MB，时长 3-60 秒，建议 720p 以上。';
  if (/提示词|文本|内容描述/.test(text)) return '涉及输入：默认 0-200 字；为空时按功能默认参数执行；超长、敏感词、仅空格需要提示。';
  if (/手机号/.test(text)) return '涉及输入：中国大陆手机号 11 位，仅允许数字，需校验格式与风控。';
  if (/邮箱/.test(text)) return '涉及输入：邮箱最长 64 字符，需符合邮箱格式，首尾空格自动去除。';
  if (/验证码/.test(text)) return '涉及输入：验证码默认 4-6 位，有效期和尝试次数以服务端为准。';
  if (item.input) return `涉及输入/参数：${item.input}。${item.bounds || ''}`;
  return '不涉及用户上传或输入。';
};

export const getInteractionBoundary = (item) => {
  if (isContentElement(item)) return item.bounds || '需要定义展示字段的长度、空值、加载失败和截断规则。';
  const parts = [];
  if (item.input) parts.push(`输入：${item.input}`);
  if (item.bounds) parts.push(item.bounds);
  return parts.length ? parts.join('；') : '不涉及特殊数据边界。';
};

export const buildInteractionTestCases = (item, index, stateNumber, ctx) => {
  const componentNo = `${stateNumber}-${index + 1}`;
  const caseMeta = {
    interactionId: item.id,
    componentNo,
    componentTitle: item.title,
    stateNumber
  };
  const isContent = isContentElement(item);
  const cases = [{
    ...caseMeta,
    group: '功能测试',
    id: `TC-${componentNo}-F01`,
    title: isContent ? `${item.title}展示校验` : `${item.title}正常操作`,
    steps: isContent ? `打开当前页面状态，查看 ${item.title} 是否按设计展示。` : `按“${item.trigger}”操作 ${item.title}。`,
    expected: isContent ? `${item.title}展示正确；数据来源：${item.dataSource || item.source || '未标注'}。` : getInteractionResult(item)
  }];
  if (isContent || item.input || item.bounds) {
    cases.push({
      ...caseMeta,
      group: '边界测试',
      id: `TC-${componentNo}-B01`,
      title: isContent ? `${item.title}内容边界校验` : `${item.title}输入/边界校验`,
      steps: getInputRules(item),
      expected: getInteractionBoundary(item)
    });
  }
  if (item.exceptions) {
    cases.push({
      ...caseMeta,
      group: '异常测试',
      id: `TC-${componentNo}-E01`,
      title: `${item.title}异常处理`,
      steps: '模拟接口失败、资源不可用、用户取消或业务限制场景。',
      expected: item.exceptions
    });
  }
  if (!isContent && /未登录|会员|权限|能量|协议|授权|风控/.test(`${item.bounds || ''} ${item.exceptions || ''} ${item.effect || ''}`)) {
    cases.push({
      ...caseMeta,
      group: '权限测试',
      id: `TC-${componentNo}-P01`,
      title: `${item.title}权限/资格校验`,
      steps: '分别使用未登录、无权限、无会员/能量不足或未同意协议等账号状态验证。',
      expected: item.exceptions || item.bounds || '不满足权限时不能继续主流程，并给出明确引导。'
    });
  }
  cases.push({
    ...caseMeta,
    group: '埋点测试',
    id: `TC-${componentNo}-T01`,
    title: `${item.title}埋点验证`,
    steps: isContent ? `曝光 ${item.title}，检查曝光埋点或页面渲染日志。` : `触发 ${item.title}，检查前端埋点和必要的服务端日志。`,
    expected: `事件应包含 page=${ctx.page}、state=${stateNumber}、component=${componentNo}、action=${isContent ? 'view' : item.trigger}。`
  });
  return cases;
};

export const buildTestCases = (items, stateNumber, ctx) => {
  const cases = items.flatMap((item, index) => buildInteractionTestCases(item, index, stateNumber, ctx));
  return ['功能测试', '边界测试', '异常测试', '权限测试', '埋点测试'].map((group) => [
    group,
    cases.filter((item) => item.group === group)
  ]);
};
