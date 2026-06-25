import { useMemo, useState } from 'react';
import PhoneFrame from '../framework/PhoneFrame.jsx';
import { directoryStatusCopy, getPageUpdateKey, getStateOptions, pageDirectory, uiDesignChecklist } from '../project/project-data.js';

export default function UIDesignChecklistPage({ pageReadVersions }) {
  const [selectedNumber, setSelectedNumber] = useState(uiDesignChecklist[0]?.number);
  const selectedItem = uiDesignChecklist.find((item) => item.number === selectedNumber) || uiDesignChecklist[0];
  const selectedTarget = useMemo(() => {
    const pageId = selectedItem?.pageId || pageDirectory.find((item) => item.level !== 'docs')?.id || 'sample';
    const states = getStateOptions(pageId);
    const state = states.find((item) => item.label === selectedItem?.state) || states[0] || { id: 'default' };
    return { pageId, stateId: state.id };
  }, [selectedItem]);
  const setPreviewPage = () => {};
  const setPreviewState = () => {};
  const setPreviewInteraction = () => {};

  return (
    <section className="checklist-stage checklist-stage-with-preview" aria-label="UI设计清单">
      <div className="checklist-panel">
        <div className="checklist-head">
          <span className="eyebrow">UI scope</span>
          <h2>UI设计清单</h2>
          <div className="checklist-stats single" aria-label="页面数量统计">
            <span>
              <strong>{uiDesignChecklist.length}</strong>
              <em>状态数量</em>
            </span>
          </div>
        </div>
        <div className="checklist-list">
          {uiDesignChecklist.map((item) => {
            const pageItem = pageDirectory.find((directoryItem) => directoryItem.id === item.pageId);
            const updateKey = pageItem ? getPageUpdateKey(pageItem) : '';
            const hasUnreadUpdate = Boolean(item.pageId && updateKey && pageReadVersions[item.pageId] !== updateKey);

            return (
              <button key={item.number} className={`checklist-item ${selectedItem?.number === item.number ? 'active' : ''}`} type="button" onClick={() => setSelectedNumber(item.number)}>
                <span className="checklist-number">{item.number}</span>
                <span className="checklist-copy">
                  <strong>{item.page}</strong>
                  <em>{item.state}</em>
                </span>
                <span className="checklist-status">
                  <i className={`status-dot ${item.status}`} aria-label={directoryStatusCopy[item.status]} />
                  <span>{directoryStatusCopy[item.status]}</span>
                  {hasUnreadUpdate ? <em className="update-badge" title={`更新时间：${updateKey}`}>更新</em> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <aside className="checklist-preview-panel" aria-label="UI设计预览">
        <PhoneFrame
          page={selectedTarget.pageId}
          activeState={selectedTarget.stateId}
          setPage={setPreviewPage}
          setActiveState={setPreviewState}
          setActiveInteraction={setPreviewInteraction}
          theme="light"
        />
      </aside>
    </section>
  );
}
