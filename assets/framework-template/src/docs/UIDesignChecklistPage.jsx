import { directoryStatusCopy, getPageUpdateKey, pageDirectory, uiDesignChecklist } from '../project/project-data.js';

export default function UIDesignChecklistPage({ pageReadVersions }) {
  return (
    <section className="checklist-stage" aria-label="UI设计清单">
      <div className="checklist-head">
        <span className="eyebrow">UI scope</span>
        <h2>UI设计清单</h2>
      </div>
      <div className="checklist-list">
        {uiDesignChecklist.map((item) => {
          const pageItem = pageDirectory.find((directoryItem) => directoryItem.id === item.pageId);
          const updateKey = pageItem ? getPageUpdateKey(pageItem) : '';
          const hasUnreadUpdate = Boolean(item.pageId && updateKey && pageReadVersions[item.pageId] !== updateKey);

          return (
            <article key={item.number} className="checklist-item">
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
            </article>
          );
        })}
      </div>
    </section>
  );
}

