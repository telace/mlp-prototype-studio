import { useEffect, useRef } from 'react';
import { BadgeCheck } from 'lucide-react';
import { getPageNumber, getStateNumber, pageInteractions } from '../project/project-data.js';

export default function SpecPanel({ spec, ctx, activeInteraction, setActiveInteraction, interactionGuideEnabled, rightPanelMode }) {
  const panelRef = useRef(null);
  const cardRefs = useRef({});
  const pageNumber = getPageNumber(ctx.page);
  const stateNumber = getStateNumber(ctx.page, ctx.state);
  const interactions = pageInteractions[ctx.page] || [];
  const getInteractionPurpose = (item) => item.purpose || `用于完成“${item.title}”相关页面操作。`;
  const getInteractionResult = (item) => item.effect;
  const inferElementType = (item) => {
    const text = `${item.title} ${item.trigger} ${item.input || ''}`;
    if (/上传|照片|图片|相册/.test(text)) return '上传/素材组件';
    if (/输入|验证码|手机号|邮箱|提示词|搜索/.test(text)) return '表单输入组件';
    if (/列表|卡片|模板|作品|记录|缩略图/.test(text)) return '列表/卡片组件';
    if (/弹窗|Sheet|面板|遮罩/.test(text)) return '弹层组件';
    if (/按钮|登录|保存|购买|制作|生成|重试|返回|关闭/.test(text)) return '按钮/操作组件';
    if (/导航|页签|标签|分组|筛选/.test(text)) return '导航/切换组件';
    return '内容展示组件';
  };
  const inferRequired = (item) => {
    const text = `${item.title} ${item.input || ''} ${item.bounds || ''}`;
    if (/必须|必填|主图|验证码|手机号|邮箱|协议|选中模板/.test(text)) return '是/条件必填';
    if (/查看|浏览|筛选|记录|设置|返回|关闭/.test(text)) return '否';
    return '视业务条件';
  };
  const inferApi = (item) => {
    const text = `${item.title} ${item.effect} ${item.input || ''} ${item.exceptions || ''}`;
    if (/上传|生成|制作|保存|登录|验证码|购买|支付|能量|会员|接口|网络|服务端|订单|模板|作品/.test(text)) {
      return '是：需要研发确认接口名称、请求参数、失败码和重试策略。';
    }
    return '否：本地 UI 状态即可完成。';
  };
  const getInputRules = (item) => {
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
  const getInteractionBoundary = (item) => {
    const parts = [];
    if (item.input) parts.push(`输入：${item.input}`);
    if (item.bounds) parts.push(item.bounds);
    return parts.length ? parts.join('；') : '不涉及特殊数据边界。';
  };
  const buildInteractionTestCases = (item, index) => {
    const componentNo = `${stateNumber}-${index + 1}`;
    const cases = [{
      group: '功能测试',
      id: `TC-${componentNo}-F01`,
      title: `${item.title}正常操作`,
      steps: `按“${item.trigger}”操作 ${item.title}。`,
      expected: getInteractionResult(item)
    }];
    if (item.input || item.bounds) {
      cases.push({
        group: '边界测试',
        id: `TC-${componentNo}-B01`,
        title: `${item.title}输入/边界校验`,
        steps: getInputRules(item),
        expected: getInteractionBoundary(item)
      });
    }
    if (item.exceptions) {
      cases.push({
        group: '异常测试',
        id: `TC-${componentNo}-E01`,
        title: `${item.title}异常处理`,
        steps: '模拟接口失败、资源不可用、用户取消或业务限制场景。',
        expected: item.exceptions
      });
    }
    if (/未登录|会员|权限|能量|协议|授权|风控/.test(`${item.bounds || ''} ${item.exceptions || ''} ${item.effect || ''}`)) {
      cases.push({
        group: '权限测试',
        id: `TC-${componentNo}-P01`,
        title: `${item.title}权限/资格校验`,
        steps: '分别使用未登录、无权限、无会员/能量不足或未同意协议等账号状态验证。',
        expected: item.exceptions || item.bounds || '不满足权限时不能继续主流程，并给出明确引导。'
      });
    }
    cases.push({
      group: '埋点测试',
      id: `TC-${componentNo}-T01`,
      title: `${item.title}埋点验证`,
      steps: `触发 ${item.title}，检查前端埋点和必要的服务端日志。`,
      expected: `事件应包含 page=${ctx.page}、state=${stateNumber}、component=${componentNo}、action=${item.trigger}。`
    });
    return cases;
  };
  const buildTestCases = (items) => {
    const componentNo = (index) => `${stateNumber}-${index + 1}`;
    const functional = items.map((item, index) => ({
      id: `TC-${componentNo(index)}-F01`,
      title: `${item.title}正常操作`,
      steps: `按“${item.trigger}”操作 ${item.title}。`,
      expected: getInteractionResult(item)
    }));
    const indexedItems = items.map((item, index) => ({ item, index }));
    const boundary = indexedItems.filter(({ item }) => item.input || item.bounds).map(({ item, index }) => ({
      id: `TC-${componentNo(index)}-B01`,
      title: `${item.title}输入/边界校验`,
      steps: getInputRules(item),
      expected: getInteractionBoundary(item)
    }));
    const exception = indexedItems.filter(({ item }) => item.exceptions).map(({ item, index }) => ({
      id: `TC-${componentNo(index)}-E01`,
      title: `${item.title}异常处理`,
      steps: '模拟接口失败、资源不可用、用户取消或业务限制场景。',
      expected: item.exceptions
    }));
    const permission = indexedItems.filter(({ item }) => /未登录|会员|权限|能量|协议|授权|风控/.test(`${item.bounds || ''} ${item.exceptions || ''} ${item.effect || ''}`)).map(({ item, index }) => ({
      id: `TC-${componentNo(index)}-P01`,
      title: `${item.title}权限/资格校验`,
      steps: '分别使用未登录、无权限、无会员/能量不足或未同意协议等账号状态验证。',
      expected: item.exceptions || item.bounds || '不满足权限时不能继续主流程，并给出明确引导。'
    }));
    const tracking = items.map((item, index) => ({
      id: `TC-${componentNo(index)}-T01`,
      title: `${item.title}埋点验证`,
      steps: `触发 ${item.title}，检查前端埋点和必要的服务端日志。`,
      expected: `事件应包含 page=${ctx.page}、state=${stateNumber}、component=${componentNo(index)}、action=${item.trigger}。`
    }));
    return [['功能测试', functional], ['边界测试', boundary], ['异常测试', exception], ['权限测试', permission], ['埋点测试', tracking]];
  };

  useEffect(() => {
    if (!interactionGuideEnabled || !activeInteraction) return;
    const panel = panelRef.current;
    const target = cardRefs.current[activeInteraction];
    if (!panel || !target) return;
    const panelRect = panel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextTop = panel.scrollTop + targetRect.top - panelRect.top - (panel.clientHeight / 2) + (target.clientHeight / 2);
    panel.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
  }, [activeInteraction, interactionGuideEnabled]);

  const pageOverviewRows = [
    ['页面用途', spec.purpose],
    ['页面结构', Array.isArray(spec.elements) ? spec.elements.join('；') : spec.elements],
    ['基础行为', Array.isArray(spec.actions) ? spec.actions.join('；') : spec.actions]
  ];
  const stateRows = [
    ['字段规则', spec.rules],
    ['异常/空/加载状态', spec.states],
    ['权限逻辑', spec.permission],
    ['埋点说明', spec.tracking],
    ['验收标准', spec.acceptance]
  ];
  const testCaseGroups = buildTestCases(interactions);

  if (rightPanelMode === 'tests') {
    return (
      <aside className="spec-panel testcases-panel" ref={panelRef}>
        <div className="spec-head">
          <BadgeCheck size={20} />
          <div>
            <div className="eyebrow">Test Cases</div>
            <h2>{spec.title}</h2>
          </div>
        </div>
        <div className="context-strip">
          页面编号：{pageNumber} / 状态编号：{stateNumber} / 当前页面：{spec.title}
        </div>
        <section className="spec-section test-case-section">
          {testCaseGroups.map(([group, cases]) => (
            <div className="test-case-group" key={group}>
              <h4>{group}</h4>
              {cases.length ? (
                <div className="test-case-list">
                  {cases.map((testCase) => (
                    <article className="test-case-card" key={testCase.id}>
                      <strong>{testCase.id}</strong>
                      <p><b>场景：</b>{testCase.title}</p>
                      <p><b>步骤：</b>{testCase.steps}</p>
                      <p><b>预期：</b>{testCase.expected}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="test-case-empty">当前页面状态没有适用的{group}。</p>
              )}
            </div>
          ))}
        </section>
      </aside>
    );
  }

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
      </div>
      <section className="spec-section">
        <h3>Product Notes</h3>
        <div className="notes-subsection">
          <h4>1. 页面说明</h4>
          <dl className="notes-definition-list">
            {pageOverviewRows.map(([title, value]) => (
              <div key={title}><dt>{title}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </div>
      </section>
      {interactions.length ? (
        <>
        <section className="spec-section">
          <h3>2. 页面元素清单</h3>
          <div className="element-card-list">
            {interactions.map((item, index) => (
              <article key={item.id} className="element-card">
                <strong><em className="component-number">{stateNumber}-{index + 1}</em>{item.title}</strong>
                <dl>
                  <div><dt>类型</dt><dd>{item.type || inferElementType(item)}</dd></div>
                  <div><dt>用途</dt><dd>{getInteractionPurpose(item)}</dd></div>
                  <div><dt>必填</dt><dd>{item.required || inferRequired(item)}</dd></div>
                  <div><dt>后台接口</dt><dd>{item.api || inferApi(item)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>
        <section className="spec-section interaction-spec-section">
          <h3>3. 交互说明</h3>
          <div className="interaction-note">仅说明手机页面内真实 App 元素。开启交互引导后，鼠标悬停或键盘聚焦原型控件时，对应说明会高亮、定位并显示连接线。</div>
          <div className="interaction-card-list">
            {interactions.map((item, index) => {
              return (
                <article
                  key={item.id}
                  id={`interaction-${item.id}`}
                  ref={(node) => {
                    if (node) cardRefs.current[item.id] = node;
                    else delete cardRefs.current[item.id];
                  }}
                  className={`interaction-card ${interactionGuideEnabled && activeInteraction === item.id ? 'active' : ''}`}
                  onMouseEnter={() => interactionGuideEnabled && setActiveInteraction(item.id)}
                  onFocus={() => interactionGuideEnabled && setActiveInteraction(item.id)}
                  onMouseLeave={() => interactionGuideEnabled && setActiveInteraction(null)}
                  onBlur={() => interactionGuideEnabled && setActiveInteraction(null)}
                  tabIndex={0}
                >
                  <div className="interaction-card-head">
                    <strong><em className="component-number">{stateNumber}-{index + 1}</em>{item.title}</strong>
                    <span>{item.trigger}</span>
                  </div>
                  <dl>
                    <div><dt>基础操作</dt><dd>{item.trigger}；{getInteractionResult(item)}</dd></div>
                    <div><dt>输入/上传</dt><dd>{getInputRules(item)}</dd></div>
                    <div><dt>后台接口</dt><dd>{item.api || inferApi(item)}</dd></div>
                    <div><dt>是否必填</dt><dd>{item.required || inferRequired(item)}</dd></div>
                    <div><dt>异常处理</dt><dd>{item.exceptions || '无特殊异常状态。'}</dd></div>
                    <div><dt>数据边界</dt><dd>{getInteractionBoundary(item)}</dd></div>
                  </dl>
                </article>
              );
            })}
          </div>
        </section>
        </>
      ) : null}
      <section className="spec-section">
        <h3>4. 状态/异常矩阵</h3>
        <dl className="notes-definition-list">
          {stateRows.map(([title, value]) => (
            <div key={title}><dt>{title}</dt><dd>{Array.isArray(value) ? value.join('；') : value}</dd></div>
          ))}
        </dl>
      </section>
    </aside>
  );
}

