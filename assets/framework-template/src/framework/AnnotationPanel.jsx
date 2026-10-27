import { useEffect, useState } from 'react';
import { Crosshair, EyeOff, MousePointer2, Pencil, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';

const blankDraft = { title: '', description: '', effect: '', dataSource: '' };
const stableStringify = (value) => {
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
};
const annotationComparable = (item) => Object.fromEntries([
  'anchorType', 'coordinateSpace', 'elementId', 'x', 'y', 'pageId', 'stateId', 'kind', 'title', 'description', 'effect', 'dataSource'
].map((key) => [key, item?.[key] ?? '']));
const stableHash = (value) => {
  const input = stableStringify(value);
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) { hash = ((hash << 5) + hash) + input.charCodeAt(index); hash >>>= 0; }
  return hash.toString(16);
};

export default function AnnotationPanel({ ctx, mode, setMode, annotations, selected, onSelect, pending, onSaved, onDeleted, onDirtyChange, elementDeletions = [], pendingElementDeletion, onConfirmElementDeletion, onCancelElementDeletion, onRestoreElement }) {
  const [draft, setDraft] = useState(blankDraft);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const current = pending || selected;

  useEffect(() => {
    setDraft(current ? {
      title: current.title || '',
      description: current.description || '',
      effect: current.effect || '',
      dataSource: current.dataSource || ''
    } : blankDraft);
    setStatus('');
    setEditing(Boolean(pending));
  }, [current?.id, Boolean(pending)]);

  const dirty = Boolean(editing && (pending || (selected && JSON.stringify(draft) !== JSON.stringify({
    title: current.title || '', description: current.description || '', effect: current.effect || '', dataSource: current.dataSource || ''
  }))));
  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);

  const save = async () => {
    if (!current || !draft.title.trim() || !draft.description.trim()) {
      setStatus('名称和说明不能为空');
      return;
    }
    setStatus('保存中');
    const item = { ...current, ...draft, id: current.id || 'annotation-' + Date.now(), updatedAt: new Date().toISOString() };
    try {
      const response = await fetch('/__mlp/api/notes/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: 'annotation', pageId: ctx.page, stateId: ctx.state || 'default', itemId: item.id,
          expectedHash: pending ? '' : stableHash(annotationComparable(current)), fields: item
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || '保存失败');
      onSaved(payload.item);
      setEditing(false);
      setStatus('已保存');
    } catch (error) { setStatus(error.message); }
  };

  const remove = async () => {
    if (!current?.id || pending) { onDeleted(current); return; }
    const response = await fetch('/__mlp/api/notes/update', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'annotation', pageId: ctx.page, stateId: ctx.state || 'default', itemId: current.id })
    });
    if (response.ok) onDeleted(current);
  };

  const discard = () => {
    if (pending) {
      onDeleted(pending);
      return;
    }
    setDraft(current ? {
      title: current.title || '',
      description: current.description || '',
      effect: current.effect || '',
      dataSource: current.dataSource || ''
    } : blankDraft);
    setStatus('');
    setEditing(false);
  };

  return (
    <aside className="spec-panel annotation-panel">
      <div className="annotation-sticky-head">
        <div className="annotation-panel-head">
          <div><span className="eyebrow">原型说明</span><h2>人工标注</h2></div>
        </div>
        <div className="annotation-add-actions" role="group" aria-label="新增标注">
          <button type="button" disabled={Boolean(pending)} className={mode === 'element' ? 'active' : ''} onClick={() => setMode(mode === 'element' ? 'preview' : 'element')}><MousePointer2 size={14} />{mode === 'element' ? '等待点击元素' : '添加元素标注'}</button>
          <button type="button" disabled={Boolean(pending)} className={mode === 'coordinate' ? 'active' : ''} onClick={() => setMode(mode === 'coordinate' ? 'preview' : 'coordinate')}><Crosshair size={14} />{mode === 'coordinate' ? '等待点击位置' : '添加坐标标注'}</button>
          <button type="button" disabled={Boolean(pending)} className={mode === 'delete-element' ? 'active danger' : 'danger'} onClick={() => setMode(mode === 'delete-element' ? 'preview' : 'delete-element')}><EyeOff size={14} />{mode === 'delete-element' ? '等待选择元素' : '删除元素'}</button>
        </div>
      </div>

      {mode !== 'preview' ? <div className="annotation-hint">{mode === 'element' ? '请在手机原型中点击一个已绑定元素；添加后自动退出。' : mode === 'delete-element' ? '请点击需要删除的已绑定元素；选择后还需要二次确认。' : '请在手机画布中点击需要说明的位置；添加后自动退出。'}</div> : null}

      {pendingElementDeletion ? (
        <div className="element-deletion-confirm" role="alertdialog" aria-label="确认删除元素">
          <strong>确认删除这个元素？</strong>
          <span>{pendingElementDeletion.title}</span>
          <code>{pendingElementDeletion.elementId}</code>
          <p>确认后立即从当前页面状态隐藏，并加入 AI 源码清理队列。</p>
          <div><button type="button" onClick={onCancelElementDeletion}>取消</button><button type="button" className="danger" onClick={onConfirmElementDeletion}>确认删除</button></div>
        </div>
      ) : null}

      {elementDeletions.length ? (
        <section className="element-deletion-list">
          <h3>待清理元素</h3>
          {elementDeletions.map((item) => (
            <div key={item.elementId}><span><strong>{item.title || item.elementId}</strong><code>{item.elementId}</code></span><button type="button" onClick={() => onRestoreElement(item)}><RotateCcw size={13} />撤销</button></div>
          ))}
        </section>
      ) : null}

      <div className="annotation-list">
        {annotations.length ? annotations.map((item, index) => (
          <div className={`annotation-list-item ${selected?.id === item.id ? 'active' : ''}`} key={item.id}>
            <button type="button" className={selected?.id === item.id ? 'active' : ''} onClick={() => onSelect(item)}>
              <span>{index + 1}</span><strong>{item.title}</strong><em>{item.anchorType === 'element' ? item.elementId : Math.round(item.x) + ', ' + Math.round(item.y)}</em>
            </button>
            {selected?.id === item.id && !editing ? (
              <div className="annotation-detail">
                <div className="annotation-anchor-meta">
                  <span>{item.anchorType === 'element' ? '元素锚点' : '坐标锚点'}</span>
                  <code>{item.elementId || Math.round(item.x) + ', ' + Math.round(item.y)}</code>
                </div>
                <dl>
                  <div><dt>说明</dt><dd>{item.description || '未填写'}</dd></div>
                  {item.effect ? <div><dt>交互结果</dt><dd>{item.effect}</dd></div> : null}
                  {item.dataSource ? <div><dt>数据来源</dt><dd>{item.dataSource}</dd></div> : null}
                </dl>
                <div className="annotation-detail-actions">
                  <button type="button" onClick={() => setEditing(true)}><Pencil size={14} />编辑</button>
                </div>
              </div>
            ) : null}
          </div>
        )) : <div className="annotation-empty">当前页面状态还没有人工标注。</div>}
      </div>

      {current && editing ? (
        <div className="annotation-editor">
          <div className={`annotation-editor-state ${pending ? 'is-new' : 'is-editing'}`}>
            {pending ? <Plus size={16} /> : <Pencil size={15} />}
            <div>
              <strong>{pending ? '新增标注' : '编辑标注'}</strong>
              <span>{pending ? '正在创建一条新标注，保存后加入当前页面状态。' : '正在修改已保存的标注内容。'}</span>
            </div>
          </div>
          <div className="annotation-anchor-meta">
            <span>{current.anchorType === 'element' ? '元素锚点' : '坐标锚点'}</span>
            <code>{current.elementId || Math.round(current.x) + ', ' + Math.round(current.y)}</code>
          </div>
          <label>名称<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label>说明<textarea rows="4" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
          <label>交互结果<textarea rows="3" value={draft.effect} onChange={(event) => setDraft({ ...draft, effect: event.target.value })} /></label>
          <label>数据来源<input value={draft.dataSource} onChange={(event) => setDraft({ ...draft, dataSource: event.target.value })} /></label>
          <div className="annotation-editor-actions">
            <button type="button" className="danger" onClick={remove}><Trash2 size={15} />删除</button>
            <button type="button" onClick={discard}><X size={15} />放弃修改</button>
            <button type="button" className="primary" onClick={save}><Save size={15} />保存</button>
          </div>
          {status ? <p className="annotation-save-status">{status}</p> : null}
        </div>
      ) : null}
    </aside>
  );
}
