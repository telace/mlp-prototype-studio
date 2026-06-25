import { useEffect, useRef } from 'react';
import { BadgeCheck } from 'lucide-react';
import { getPageNumber, getStateNumber, pageInteractions } from '../project/project-data.js';
import { buildInteractionTestCases, getInputRules, getInteractionBoundary, getInteractionPurpose, getInteractionResult, inferApi, inferElementType, inferRequired } from '../project/test-cases/index.js';

export const resolvePageStateInteractions = (interactionMap, pageId, stateId) => {
  const pageValue = interactionMap?.[pageId];
  if (Array.isArray(pageValue)) return pageValue;
  if (!pageValue || typeof pageValue !== 'object') return [];
  return pageValue[stateId] || pageValue.default || pageValue.__default || [];
};

const testCaseGroups = ['功能测试', '边界测试', '异常测试', '权限测试', '埋点测试'];

const getElementKind = (item) => item.kind || item.role || 'action';
const isContentElement = (item) => getElementKind(item) === 'content';
const getDataSource = (item) => item.dataSource || item.source || '未标注数据来源。';
const getBaseOperation = (item) => {
  if (isContentElement(item)) return '展示元素；无点击操作。';
  return `${item.trigger}；${getInteractionResult(item)}`;
};

export default function SpecPanel({ spec, ctx, activeInteraction, setActiveInteraction, interactionGuideEnabled, rightPanelMode }) {
  const panelRef = useRef(null);
  const cardRefs = useRef({});
  const pageNumber = getPageNumber(ctx.page);
  const currentStateId = ctx.state || ctx.stateId || 'default';
  const stateNumber = getStateNumber(ctx.page, currentStateId);
  const interactions = resolvePageStateInteractions(pageInteractions, ctx.page, currentStateId);
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
          {interactions.length ? (
            <div className="interaction-card-list testcase-interaction-list">
              {interactions.map((item, index) => {
                const componentNo = `${stateNumber}-${index + 1}`;
                const cases = buildInteractionTestCases(item, index, stateNumber, ctx);
                return (
                  <article
                    key={item.id}
                    id={`interaction-${item.id}`}
                    ref={(node) => {
                      if (node) cardRefs.current[item.id] = node;
                      else delete cardRefs.current[item.id];
                    }}
                    className={`interaction-card testcase-interaction-card ${interactionGuideEnabled && activeInteraction === item.id ? 'active' : ''}`}
                    onMouseEnter={() => interactionGuideEnabled && setActiveInteraction(item.id)}
                    onFocus={() => interactionGuideEnabled && setActiveInteraction(item.id)}
                    onMouseLeave={() => interactionGuideEnabled && setActiveInteraction(null)}
                    onBlur={() => interactionGuideEnabled && setActiveInteraction(null)}
                    tabIndex={0}
                  >
                    <div className="interaction-card-head">
                      <strong><em className="component-number">{componentNo}</em>{item.title}</strong>
                    </div>
                    <div className="test-case-groups-inline">
                      {testCaseGroups.map((group) => {
                        const groupCases = cases.filter((testCase) => testCase.group === group);
                        return (
                          <div className="test-case-group" key={group}>
                            <h4>{group}</h4>
                            {groupCases.length ? (
                              <div className="test-case-list">
                                {groupCases.map((testCase) => (
                                  <article className="test-case-card compact" key={testCase.id} data-interaction-id={testCase.interactionId}>
                                    <strong>{testCase.id}</strong>
                                    <p><b>场景：</b>{testCase.title}</p>
                                    <p><b>步骤：</b>{testCase.steps}</p>
                                    <p><b>预期：</b>{testCase.expected}</p>
                                  </article>
                                ))}
                              </div>
                            ) : (
                              <p className="test-case-empty">当前元素没有适用的{group}。</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="test-case-empty">当前页面状态没有可生成测试用例的交互元素。</p>
          )}
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
                  <div><dt>数据来源</dt><dd>{getDataSource(item)}</dd></div>
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
                  </div>
                  <dl>
                    <div><dt>基础操作</dt><dd>{getBaseOperation(item)}</dd></div>
                    <div><dt>内容/数据来源</dt><dd>{getDataSource(item)}</dd></div>
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
