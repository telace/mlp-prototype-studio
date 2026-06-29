import { useEffect, useMemo, useRef, useState } from 'react';
import { BadgeCheck, Check, FileText, ListChecks, Pencil, Rows3, X } from 'lucide-react';
import { getPageNumber, getStateNumber, pageDirectory, pageInteractions } from '../project/project-data.js';
import { buildInteractionTestCases, getInputRules, getInteractionBoundary, getInteractionResult, inferApi, inferElementType, inferRequired } from '../project/test-cases/index.js';

export const resolvePageStateInteractions = (interactionMap, pageId, stateId) => {
  const pageValue = interactionMap?.[pageId];
  if (Array.isArray(pageValue)) return pageValue;
  if (!pageValue || typeof pageValue !== 'object') return [];
  return pageValue[stateId] || pageValue.default || pageValue.__default || [];
};

const panelTabs = [
  { id: 'overview', label: '页面说明', icon: FileText },
  { id: 'interactions', label: '交互说明', icon: Rows3 },
  { id: 'tests', label: '测试用例', icon: ListChecks }
];

const testCaseGroups = ['功能测试', '边界测试', '异常测试', '权限测试', '埋点测试'];
const editableKeys = ['kind', 'type', 'title', 'effect', 'dataSource', 'composition', 'states', 'fields'];
const stateOptions = ['默认态', '禁用态', '加载态', '聚焦态', '错误态', '选中态', '未选中态', '开启态', '关闭态', '勾选态', '未勾选态', '上传中', '上传成功', '上传失败', '空数据态', '加载失败态', '显示态', '隐藏态', '展开态', '收起态', '播放态', '暂停态'];
const inputElementTypes = ['输入框', '文本域', '搜索框', '手机号', '邮箱', '验证码', '密码'];
const uploadElementTypes = ['图片上传', '文件上传', '视频上传', '相册选择'];
const choiceElementTypes = ['单选', '多选', '开关', '下拉选择', '标签切换', '分段控制'];

const getElementKind = (item) => item.kind || item.role || 'action';
const isContentElement = (item) => getElementKind(item) === 'content';
const getDataSource = (item) => item.dataSource || item.source || '前端静态配置。';
const getType = (item) => item.type || inferElementType(item);
const isTypeIn = (item, types) => types.some((type) => getType(item).includes(type));
const needsInputRules = (item) => isTypeIn(item, inputElementTypes) || isTypeIn(item, uploadElementTypes) || isTypeIn(item, choiceElementTypes);
const needsDataState = (item) => /后端|接口|API|服务端|列表|素材|图片|数据/.test(getDataSource(item));
const isListLike = (item) => /列表|卡片|Banner|封面|图片|素材|作品|模板/.test(getType(item)) || /列表|卡片|Banner|封面|图片|素材|作品|模板/.test(item.title || '');

const getEditableFields = (item) => Object.fromEntries(editableKeys.map((key) => [key, item?.[key] || '']));

const normalizeStateList = (states) => {
  if (Array.isArray(states)) return states.map((stateItem) => {
    if (Array.isArray(stateItem)) return stateItem[0];
    if (stateItem && typeof stateItem === 'object') return stateItem.name || stateItem.state || stateItem.value || '';
    return stateItem;
  }).filter(Boolean);
  if (states && typeof states === 'object') return Object.keys(states).filter(Boolean);
  return String(states || '').split(/[、,，;；\n]/).map((item) => item.trim()).filter(Boolean);
};

const toReadableText = (value, fallback = '未配置。') => {
  if (Array.isArray(value)) return value.filter(Boolean).join('；') || fallback;
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([, itemValue]) => itemValue !== undefined && itemValue !== null && itemValue !== '')
      .map(([key, itemValue]) => `${key}：${Array.isArray(itemValue) ? itemValue.join('、') : itemValue}`)
      .join('；') || fallback;
  }
  return String(value || '').trim() || fallback;
};

const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
};

const stableHash = (value) => {
  const input = stableStringify(value);
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index);
    hash >>>= 0;
  }
  return hash.toString(16);
};

const validateInteractionDraft = (draft) => {
  const required = ['type', 'composition', 'effect', 'fields'];
  for (const key of required) {
    if (!String(draft[key] || '').trim()) return `${key} 不能为空。`;
  }
  for (const [key, value] of Object.entries(draft)) {
    if (typeof value === 'string' && value.length > 2000) return `${key} 不能超过 2000 字。`;
  }
  return '';
};

const applyLocalOverrides = (items, overrides) => items.map((item) => (
  overrides[item.id] ? { ...item, ...overrides[item.id] } : item
));

const getPageRelations = (pageId) => {
  const current = pageDirectory.find((item) => item.id === pageId);
  const parent = current?.parent ? pageDirectory.find((item) => item.id === current.parent) : null;
  const children = pageDirectory.filter((item) => item.parent === pageId);
  return {
    parentLabel: parent?.label || (current?.level === 'primary' ? '无，一级页面' : '未配置上级页面'),
    childLabels: children.map((item) => item.label)
  };
};

export default function SpecPanel({ spec, ctx, activeInteraction, setActiveInteraction, interactionGuideEnabled, onDirtyChange }) {
  const panelRef = useRef(null);
  const cardRefs = useRef({});
  const panelScrollTimerRef = useRef(null);
  const suppressAnchorScrollRef = useRef(false);
  const [panelMode, setPanelMode] = useState('interactions');
  const [localOverrides, setLocalOverrides] = useState({});
  const [localPageOverride, setLocalPageOverride] = useState({});
  const [localTestOverrides, setLocalTestOverrides] = useState({});
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [sourceHash, setSourceHash] = useState('');
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });
  const pageNumber = getPageNumber(ctx.page);
  const currentStateId = ctx.state || ctx.stateId || 'default';
  const stateNumber = getStateNumber(ctx.page, currentStateId);
  const sourceInteractions = resolvePageStateInteractions(pageInteractions, ctx.page, currentStateId);
  const interactions = useMemo(() => applyLocalOverrides(sourceInteractions, localOverrides), [sourceInteractions, localOverrides]);
  const pageRelations = getPageRelations(ctx.page);
  const canEditNotes = import.meta.env.DEV;
  const draftDirty = Boolean(editing && stableHash(draft) !== sourceHash);
  const pageOverview = {
    title: spec.title,
    purpose: spec.purpose || '未填写页面功能说明。',
    parentPage: pageRelations.parentLabel,
    childPages: pageRelations.childLabels.length ? pageRelations.childLabels.join('、') : '无下级页面',
    elements: Array.isArray(spec.elements) ? spec.elements.join('；') : spec.elements || '未填写页面元素。'
  };
  const resolvedPageOverview = { ...pageOverview, ...localPageOverride };

  useEffect(() => {
    let disposed = false;
    fetch(`/src/project/notes/local-edits.json?t=${Date.now()}`)
      .then((response) => response.ok ? response.json() : { items: {} })
      .then((payload) => {
        if (disposed) return;
        const pageEdits = payload?.items?.[ctx.page] || {};
        const stateEdits = pageEdits[currentStateId] || pageEdits.__default || {};
        const pageNoteEdits = payload?.pages?.[ctx.page]?.[currentStateId] || payload?.pages?.[ctx.page]?.__default || {};
        const testEdits = payload?.tests?.[ctx.page]?.[currentStateId] || payload?.tests?.[ctx.page]?.__default || {};
        setLocalOverrides(stateEdits);
        setLocalPageOverride(pageNoteEdits);
        setLocalTestOverrides(testEdits);
      })
      .catch(() => {
        if (!disposed) {
          setLocalOverrides({});
          setLocalPageOverride({});
          setLocalTestOverrides({});
        }
      });
    return () => {
      disposed = true;
    };
  }, [ctx.page, currentStateId]);

  useEffect(() => {
    onDirtyChange?.(draftDirty);
  }, [draftDirty, onDirtyChange]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!draftDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [draftDirty]);

  useEffect(() => {
    setEditing(null);
    setDraft({});
    setSourceHash('');
    setSaveState({ status: 'idle', message: '' });
    onDirtyChange?.(false);
  }, [ctx.page, currentStateId, onDirtyChange]);

  useEffect(() => {
    if (!interactionGuideEnabled || !activeInteraction) return;
    if (suppressAnchorScrollRef.current) {
      suppressAnchorScrollRef.current = false;
      return;
    }
    const panel = panelRef.current;
    const target = cardRefs.current[activeInteraction];
    if (!panel || !target) return;
    const panelRect = panel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextTop = panel.scrollTop + targetRect.top - panelRect.top - (panel.clientHeight / 2) + (target.clientHeight / 2);
    panel.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
  }, [activeInteraction, interactionGuideEnabled, panelMode]);

  const handlePanelScroll = () => {
    panelScrollTimerRef.current = true;
    window.clearTimeout(panelScrollTimerRef.current);
    panelScrollTimerRef.current = window.setTimeout(() => {
      panelScrollTimerRef.current = null;
    }, 160);
  };

  const activateFromSpecCard = (id) => {
    if (!interactionGuideEnabled || panelScrollTimerRef.current) return;
    suppressAnchorScrollRef.current = true;
    setActiveInteraction(id);
  };

  const clearSpecCardActivation = () => {
    if (!interactionGuideEnabled || panelScrollTimerRef.current) return;
    setActiveInteraction(null);
  };

  const beginEdit = (target, item, seed) => {
    if (draftDirty && !window.confirm('当前内容尚未保存，是否放弃修改并编辑其他内容？')) return;
    const baseDraft = seed || getEditableFields(item);
    const hashBase = target === 'interaction' && item ? getEditableFields(item) : baseDraft;
    const nextDraft = target === 'interaction' && item
      ? {
          ...baseDraft,
          type: baseDraft.type || getType(item),
          composition: baseDraft.composition || inferComposition(item),
          states: normalizeStateList(baseDraft.states).length ? normalizeStateList(baseDraft.states) : inferStateRows(item),
          effect: baseDraft.effect || inferInteractionBehavior(item),
          fields: baseDraft.fields || toReadableText(inferDataFieldRows(item))
        }
      : baseDraft;
    setEditing({ target, itemId: item?.id || '__page__' });
    setDraft(nextDraft);
    setSourceHash(stableHash(hashBase));
    setSaveState({ status: 'idle', message: '' });
  };

  const cancelEdit = () => {
    if (draftDirty && !window.confirm('放弃当前未保存修改？')) return;
    setEditing(null);
    setDraft({});
    setSourceHash('');
    setSaveState({ status: 'idle', message: '' });
    onDirtyChange?.(false);
  };

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const toggleDraftState = (state) => {
    setDraft((current) => {
      const currentStates = normalizeStateList(current.states);
      const nextStates = currentStates.includes(state)
        ? currentStates.filter((item) => item !== state)
        : [...currentStates, state];
      return { ...current, states: nextStates };
    });
  };

  const updateDraftCase = (caseId, key, value) => {
    setDraft((current) => ({
      ...current,
      cases: {
        ...(current.cases || {}),
        [caseId]: {
          ...(current.cases?.[caseId] || {}),
          [key]: value
        }
      }
    }));
  };

  const saveDraft = async () => {
    const validationError = editing?.target === 'interaction' ? validateInteractionDraft(draft) : '';
    if (validationError) {
      setSaveState({ status: 'error', message: validationError });
      return;
    }
    setSaveState({ status: 'saving', message: '保存中...' });
    try {
      const response = await fetch('/__mlp/api/notes/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: editing.target,
          pageId: ctx.page,
          stateId: currentStateId === 'default' ? '__default' : currentStateId,
          itemId: editing.itemId,
          expectedHash: sourceHash,
          fields: draft
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || '保存失败，请检查本地 dev server。');
      }
      if (editing.target === 'overview') setLocalPageOverride(payload.item);
      if (editing.target === 'interaction') setLocalOverrides((current) => ({ ...current, [editing.itemId]: payload.item }));
      if (editing.target === 'test') setLocalTestOverrides((current) => ({ ...current, [editing.itemId]: payload.item }));
      setSourceHash(payload.hash || stableHash(payload.item));
      setEditing(null);
      setSaveState({ status: 'success', message: '已保存到本地文件，已标记为 check。' });
      onDirtyChange?.(false);
    } catch (error) {
      setSaveState({ status: 'error', message: error.message || '保存失败，修改内容已保留。' });
    }
  };

  const toggleChecked = async (target, itemId, currentChecked, extraPayload = {}) => {
    setSaveState({ status: 'saving', message: '更新 check 状态...' });
    try {
      const response = await fetch('/__mlp/api/notes/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          pageId: ctx.page,
          stateId: currentStateId === 'default' ? '__default' : currentStateId,
          itemId,
          ...extraPayload,
          checked: !currentChecked
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || '更新 check 状态失败。');
      }
      if (target === 'overview') setLocalPageOverride(payload.item);
      if (target === 'interaction') setLocalOverrides((current) => ({ ...current, [itemId]: payload.item }));
      if (target === 'test') setLocalTestOverrides((current) => ({ ...current, [itemId]: payload.item }));
      setSaveState({ status: 'success', message: payload.item.checked ? '已标记为 check。' : '已改为未 check。' });
    } catch (error) {
      setSaveState({ status: 'error', message: error.message || '更新 check 状态失败。' });
    }
  };

  const renderCheckButton = (target, itemId, checked, extraPayload = {}) => {
    if (!canEditNotes) return null;
    return (
      <button
        type="button"
        className={`note-check-toggle ${checked ? 'checked' : ''}`}
        aria-pressed={Boolean(checked)}
        aria-label={checked ? '改为未 check' : '标记为 check'}
        title={checked ? '改为未 check' : '标记为 check'}
        onClick={() => toggleChecked(target, itemId, Boolean(checked), extraPayload)}
      >
        <Check size={14} strokeWidth={3} />
      </button>
    );
  };

  const renderEditorField = (key, label, multiline = true) => (
    <label className="note-edit-field" key={key}>
      <span>{label}</span>
      {multiline ? (
        <textarea value={draft[key] || ''} onChange={(event) => updateDraft(key, event.target.value)} />
      ) : (
        <input value={draft[key] || ''} onChange={(event) => updateDraft(key, event.target.value)} />
      )}
    </label>
  );

  const renderStateMultiSelect = () => {
    const selectedStates = normalizeStateList(draft.states);
    return (
      <fieldset className="note-edit-field state-tag-editor">
        <legend>状态定义</legend>
        <div>
          {stateOptions.map((state) => (
            <button key={state} type="button" className={selectedStates.includes(state) ? 'active' : ''} onClick={() => toggleDraftState(state)}>
              {state}
            </button>
          ))}
        </div>
      </fieldset>
    );
  };

  const renderInteractionEditFields = () => [
    renderEditorField('type', '组件类型', false),
    renderEditorField('composition', '组件构成'),
    renderStateMultiSelect(),
    renderEditorField('effect', '交互行为'),
    renderEditorField('fields', '数据说明')
  ];

  const renderEditActions = () => (
    <>
      {saveState.message ? <p className={`note-save-message ${saveState.status}`}>{saveState.message}</p> : null}
      <div className="note-edit-actions">
        <button type="button" className="note-edit-secondary" onClick={cancelEdit}><X size={13} />取消</button>
        <button type="button" className="note-edit-primary" onClick={saveDraft} disabled={saveState.status === 'saving'}><Check size={13} />完成</button>
      </div>
    </>
  );

  const buildTestDraft = (testCase, testOverride = {}) => ({
    caseId: testCase.id,
    cases: {
      [testCase.id]: {
        title: testOverride.cases?.[testCase.id]?.title || testCase.title,
        steps: testOverride.cases?.[testCase.id]?.steps || testCase.steps,
        expected: testOverride.cases?.[testCase.id]?.expected || testCase.expected
      }
    }
  });

  const applyTestOverrides = (cases, testOverride = {}) => cases.map((testCase) => ({
    ...testCase,
    ...(testOverride.cases?.[testCase.id] || {})
  }));

  const renderTestCaseEditor = (testCase) => {
    const editedCase = draft.cases?.[testCase.id] || testCase;
    return (
      <div className="note-edit-form test-case-inline-editor">
        <label className="note-edit-field">
          <span>场景</span>
          <input value={editedCase.title || ''} onChange={(event) => updateDraftCase(testCase.id, 'title', event.target.value)} />
        </label>
        <label className="note-edit-field">
          <span>步骤</span>
          <textarea value={editedCase.steps || ''} onChange={(event) => updateDraftCase(testCase.id, 'steps', event.target.value)} />
        </label>
        <label className="note-edit-field">
          <span>预期</span>
          <textarea value={editedCase.expected || ''} onChange={(event) => updateDraftCase(testCase.id, 'expected', event.target.value)} />
        </label>
        {renderEditActions()}
      </div>
    );
  };

  const renderElementRows = (item) => {
    const rows = [
      ['元素类型', getType(item)],
      ['数据来源', getDataSource(item)]
    ];
    if (needsInputRules(item)) rows.push(['输入/选择规则', getInputRules(item)]);
    if (needsInputRules(item)) rows.push(['必填规则', item.required || inferRequired(item)]);
    if (needsInputRules(item)) rows.push(['校验边界', item.bounds || getInteractionBoundary(item)]);
    if (needsDataState(item)) rows.push(['空态/失败态', item.exceptions || '接口为空展示空状态，接口失败展示重试入口。']);
    return rows;
  };

  const inferComposition = (item) => {
    if (item.composition) return toReadableText(item.composition);
    if (/卡片|列表/.test(getType(item)) || /卡片|列表|素材|作品|模板/.test(item.title || '')) {
      return '主容器 + 封面/图标占位 + 标题文本 + 状态/标签信息；各子元素按页面数据源渲染。';
    }
    if (/输入|搜索|验证码|手机号|邮箱|密码/.test(getType(item))) {
      return '字段容器 + 输入文本 + 占位提示 + 校验/错误提示。';
    }
    if (/弹窗|Sheet|Toast/.test(getType(item))) {
      return '遮罩层 + 内容容器 + 标题/正文 + 主操作按钮 + 次操作/关闭入口。';
    }
    if (/上传|相册/.test(getType(item))) {
      return '上传入口 + 文件/图片缩略图 + 进度/错误提示 + 删除或重选入口。';
    }
    return '单一交互控件；主要由图标/文字、点击热区和状态反馈组成。';
  };

  const inferStateRows = (item) => {
    const configured = normalizeStateList(item.states);
    if (configured.length) return configured;
    const states = ['默认态'];
    if (needsInputRules(item)) states.push('聚焦态', '错误态');
    if (/上传|相册/.test(getType(item))) states.push('上传中', '上传成功', '上传失败');
    if (/开关/.test(getType(item))) states.push('开启态', '关闭态');
    if (/多选|复选|协议/.test(getType(item))) states.push('勾选态', '未勾选态');
    if (/单选|标签切换|分段控制|模板|素材|分类|卡片/.test(getType(item)) || /模板|素材|分类|选中/.test(item.title || '')) states.push('选中态', '未选中态');
    if (/弹窗|Sheet|Toast|抽屉/.test(getType(item))) states.push('显示态', '隐藏态');
    if (/视频|音频|播放|预览/.test(getType(item)) || /视频|音频|播放|预览/.test(item.title || '')) states.push('播放态', '暂停态');
    if (!isContentElement(item)) states.push('禁用态');
    if (!isContentElement(item) && /生成|提交|保存|登录|付款|制作|复制|发送|加载/.test(item.title || item.effect || '')) states.push('加载态');
    if (needsDataState(item) || isListLike(item)) states.push('空数据态', '加载失败态');
    return [...new Set(states)];
  };

  const inferDataFieldRows = (item) => {
    if (item.fields) {
      if (Array.isArray(item.fields)) return item.fields.map((field) => Array.isArray(field) ? field : [field.name || field.key || '字段', field.description || field.type || '']);
      if (typeof item.fields === 'object') return Object.entries(item.fields);
      return [['字段说明', item.fields]];
    }
    const rows = [['数据来源', getDataSource(item)]];
    if (item.input) rows.push(['输入字段', item.input]);
    if (item.output) rows.push(['输出字段', item.output]);
    if (item.api || inferApi(item) !== '否：本地 UI 状态即可完成。') rows.push(['后台接口', item.api || inferApi(item)]);
    if (needsInputRules(item)) rows.push(['是否必填', item.required || inferRequired(item)]);
    return rows;
  };

  const inferInteractionBehavior = (item) => {
    if (item.effect) return /[①②③④⑤⑥⑦⑧⑨]/.test(item.effect) ? item.effect : `① ${item.effect}`;
    if (isContentElement(item)) return '① 页面渲染或数据刷新时，组件按数据来源更新展示内容。';
    return `① 用户${item.trigger || '点击'}该组件后，${getInteractionResult(item)}`;
  };

  const renderSpecRows = (rows) => (
    <dl className="component-spec-list">
      {rows.filter(([, value]) => value !== undefined && value !== null && value !== '').map(([title, value]) => (
        <div key={title}>
          <dt>{title}</dt>
          <dd>{toReadableText(value)}</dd>
        </div>
      ))}
    </dl>
  );

  const renderSpecSection = (title, rows) => (
    <section className="component-spec-block" key={title}>
      <h4>{title}</h4>
      {renderSpecRows(rows)}
    </section>
  );

  const renderStateTags = (states) => (
    <div className="component-state-tags">
      {states.map((state) => <span key={state}>{state}</span>)}
    </div>
  );

  const renderTextSection = (title, text) => (
    <section className="component-spec-block" key={title}>
      <h4>{title}</h4>
      {renderSpecRows([['行为说明', toReadableText(text)]])}
    </section>
  );

  const renderOverview = () => {
    const isEditing = editing?.target === 'overview';
    return (
      <>
        <section className="spec-section page-overview-section">
          <div className="section-title-row">
            <h3>页面说明</h3>
            {canEditNotes && !isEditing ? (
              <div className="note-card-actions">
                {renderCheckButton('overview', '__page__', resolvedPageOverview.checked)}
                <button className="note-edit-button" type="button" aria-label="编辑页面说明" title="编辑" onClick={() => beginEdit('overview', null, resolvedPageOverview)}><Pencil size={13} /></button>
              </div>
            ) : null}
          </div>
          {isEditing ? (
            <div className="note-edit-form">
              <div className="note-edit-grid">
                {renderEditorField('title', '页面标题', false)}
                {renderEditorField('purpose', '功能概述')}
                {renderEditorField('parentPage', '上级页面', false)}
                {renderEditorField('childPages', '下级页面', false)}
                {renderEditorField('elements', '页面元素列表')}
              </div>
              {renderEditActions()}
            </div>
          ) : (
            <dl className="notes-definition-list">
              <div><dt>功能概述</dt><dd>{resolvedPageOverview.purpose}</dd></div>
              <div><dt>上级页面</dt><dd>{resolvedPageOverview.parentPage}</dd></div>
              <div><dt>下级页面</dt><dd>{resolvedPageOverview.childPages}</dd></div>
              <div><dt>页面元素</dt><dd>{resolvedPageOverview.elements}</dd></div>
            </dl>
          )}
        </section>
        <section className="spec-section">
          <h3>页面元素列表</h3>
          <div className="element-card-list">
            {interactions.map((item, index) => (
              <article key={item.id} className="element-card">
                <strong><em className="component-number">{stateNumber}-{index + 1}</em>{item.title}</strong>
                <dl>
                  {renderElementRows(item).map(([title, value]) => <div key={title}><dt>{title}</dt><dd>{value}</dd></div>)}
                </dl>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  };

  const renderInteractionSpec = (item) => {
    const sections = [
      ['1. 组件基本信息', [
        ['组件类型', getType(item)]
      ]],
      ['2. 组件构成', [
        ['内容组成', inferComposition(item)]
      ]],
      ['5. 数据说明', inferDataFieldRows(item)]
    ];
    return (
      <div className="component-spec-stack">
        {sections.slice(0, 2).map(([title, rows]) => renderSpecSection(title, rows))}
        <section className="component-spec-block" key="3. 状态定义">
          <h4>3. 状态定义</h4>
          {renderStateTags(inferStateRows(item))}
        </section>
        {renderTextSection('4. 交互行为', inferInteractionBehavior(item))}
        {renderSpecSection(sections[2][0], sections[2][1])}
      </div>
    );
  };

  const renderInteractions = () => (
      <section className="spec-section interaction-spec-section">
        <h3>交互说明</h3>
        <div className="interaction-card-list">
          {interactions.map((item, index) => {
            const isEditing = editing?.target === 'interaction' && editing.itemId === item.id;
            return (
              <article
                key={item.id}
                id={`interaction-${item.id}`}
                ref={(node) => {
                  if (node) cardRefs.current[item.id] = node;
                  else delete cardRefs.current[item.id];
                }}
                className={`interaction-card ${interactionGuideEnabled && activeInteraction === item.id ? 'active' : ''}`}
                onMouseEnter={() => activateFromSpecCard(item.id)}
                onFocus={() => activateFromSpecCard(item.id)}
                onMouseLeave={clearSpecCardActivation}
                onBlur={clearSpecCardActivation}
                tabIndex={0}
              >
                <div className="interaction-card-head">
                  <strong><em className="component-number">{stateNumber}-{index + 1}</em>{item.title}</strong>
                  {canEditNotes && !isEditing ? (
                    <div className="note-card-actions">
                      {renderCheckButton('interaction', item.id, item.checked)}
                      <button className="note-edit-button" type="button" aria-label={`编辑${item.title}`} title="编辑" onClick={() => beginEdit('interaction', item)}><Pencil size={13} /></button>
                    </div>
                  ) : null}
                </div>
                {isEditing ? (
                  <div className="note-edit-form">
                    <div className="note-edit-grid">
                      {renderInteractionEditFields(item)}
                    </div>
                    {renderEditActions()}
                  </div>
                ) : renderInteractionSpec(item)}
              </article>
            );
          })}
        </div>
      </section>
  );

  const renderTests = () => (
    <section className="spec-section test-case-section">
      {interactions.length ? (
        <div className="interaction-card-list testcase-interaction-list">
          {interactions.map((item, index) => {
            const componentNo = `${stateNumber}-${index + 1}`;
            const testOverride = localTestOverrides[item.id] || {};
            const cases = applyTestOverrides(buildInteractionTestCases(item, index, stateNumber, ctx), testOverride);
            return (
              <article
                key={item.id}
                id={`interaction-${item.id}`}
                ref={(node) => {
                  if (node) cardRefs.current[item.id] = node;
                  else delete cardRefs.current[item.id];
                }}
                className={`interaction-card testcase-interaction-card ${interactionGuideEnabled && activeInteraction === item.id ? 'active' : ''}`}
                onMouseEnter={() => activateFromSpecCard(item.id)}
                onFocus={() => activateFromSpecCard(item.id)}
                onMouseLeave={clearSpecCardActivation}
                onBlur={clearSpecCardActivation}
                tabIndex={0}
              >
                <div className="interaction-card-head">
                  <strong><em className="component-number">{componentNo}</em>{item.title}</strong>
                </div>
                  <>
                    <div className="test-case-groups-inline">
                      {testCaseGroups.map((group) => {
                        const groupCases = cases.filter((testCase) => testCase.group === group);
                        return (
                          <div className="test-case-group" key={group}>
                            <h4>{group}</h4>
                            {groupCases.length ? (
                              <div className="test-case-list">
                                {groupCases.map((testCase) => {
                                  const isEditingCase = editing?.target === 'test' && editing.itemId === item.id && draft.caseId === testCase.id;
                                  return (
                                    <article className="test-case-card compact" key={testCase.id} data-interaction-id={testCase.interactionId}>
                                      <div className="test-case-card-head">
                                        <strong>{testCase.id}</strong>
                                        {canEditNotes && !isEditingCase ? (
                                          <div className="note-card-actions">
                                            {renderCheckButton('test', item.id, Boolean(testCase.checked), { caseId: testCase.id })}
                                            <button className="note-edit-button" type="button" aria-label={`编辑${testCase.id}`} title="编辑" onClick={() => beginEdit('test', item, buildTestDraft(testCase, testOverride))}><Pencil size={13} /></button>
                                          </div>
                                        ) : null}
                                      </div>
                                      {isEditingCase ? (
                                        renderTestCaseEditor(testCase)
                                      ) : (
                                        <>
                                          <p><b>场景：</b>{testCase.title}</p>
                                          <p><b>步骤：</b>{testCase.steps}</p>
                                          <p><b>预期：</b>{testCase.expected}</p>
                                        </>
                                      )}
                                    </article>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="test-case-empty">当前元素没有适用的{group}。</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="test-case-empty">当前页面状态没有可生成测试用例的交互元素。</p>
      )}
    </section>
  );

  return (
    <aside className="spec-panel" ref={panelRef} onScroll={handlePanelScroll}>
      <div className="spec-sticky-head">
        <div className="spec-head compact">
          <BadgeCheck size={19} />
          <div>
            <div className="eyebrow">页面编号 {pageNumber} / 状态编号 {stateNumber}</div>
            <h2>{resolvedPageOverview.title || spec.title}</h2>
          </div>
        </div>
        <div className="right-panel-tabs" role="tablist" aria-label="文档类型">
          {panelTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} type="button" className={panelMode === tab.id ? 'active' : ''} onClick={() => setPanelMode(tab.id)}>
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {panelMode === 'overview' ? renderOverview() : null}
      {panelMode === 'interactions' ? renderInteractions() : null}
      {panelMode === 'tests' ? renderTests() : null}
    </aside>
  );
}
