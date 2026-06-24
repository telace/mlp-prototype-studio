import { ChevronRight } from 'lucide-react';
import { directoryStatusCopy, getPageUpdateKey, pageDirectory } from '../project/project-data.js';

export default function PageDirectory({ active, setPage, pageReadVersions }) {
  const groups = pageDirectory.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className="left-rail">
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
        <div className="directory-scroll">
          {Object.entries(groups).map(([group, items]) => (
            <section key={group} className="directory-group">
              <div className="directory-group-title">{group}</div>
              {items.map((item) => {
                const updateKey = getPageUpdateKey(item);
                const hasUnreadUpdate = Boolean(updateKey && pageReadVersions[item.id] !== updateKey);

                return (
                  <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>
                    <span className="directory-label">
                      <i className={`status-dot ${item.status}`} aria-label={directoryStatusCopy[item.status]} />
                      <span>{item.label}</span>
                      {hasUnreadUpdate ? <em className="update-badge" title={`更新时间：${updateKey}`}>更新</em> : null}
                    </span>
                    <ChevronRight size={14} />
                  </button>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}

