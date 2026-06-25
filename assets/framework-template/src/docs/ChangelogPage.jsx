import { useEffect, useState } from 'react';

const fallbackChangelog = {
  currentVersion: '0.0.00',
  updatedAt: null,
  versions: [
    {
      version: '0.0.00',
      title: '暂无上线记录',
      summary: '更新日志会在上线前通过 mlp:release 生成。本地预览和普通构建不会生成更新日志。',
      createdAt: null
    }
  ]
};

function normalizeChangelog(data) {
  if (!data || !Array.isArray(data.versions)) return fallbackChangelog;
  return {
    currentVersion: data.currentVersion || data.versions[0]?.version || '0.0.00',
    updatedAt: data.updatedAt || data.versions[0]?.createdAt || null,
    versions: data.versions.length ? data.versions : fallbackChangelog.versions
  };
}

function formatDate(value) {
  if (!value) return '未上线';
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function ChangelogPage() {
  const [changelog, setChangelog] = useState(fallbackChangelog);

  useEffect(() => {
    let active = true;
    const url = new URL('changelog.json', window.location.href);
    url.searchParams.set('t', String(Date.now()));
    fetch(url, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active) setChangelog(normalizeChangelog(data));
      })
      .catch(() => {
        if (active) setChangelog(fallbackChangelog);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="checklist-stage changelog-stage" aria-label="更新日志">
      <div className="checklist-head changelog-head">
        <div>
          <span className="eyebrow">Changelog</span>
          <h2>更新日志</h2>
        </div>
        <div className="changelog-current">
          <strong>{changelog.currentVersion}</strong>
          <span>{formatDate(changelog.updatedAt)}</span>
        </div>
      </div>
      <div className="changelog-list">
        {changelog.versions.map((item) => (
          <article className="changelog-card" key={`${item.version}-${item.createdAt || item.title}`}>
            <div className="changelog-version">
              <strong>{item.version}</strong>
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <div className="changelog-copy">
              <h3>{item.title || `Release ${item.version}`}</h3>
              <p>{item.summary || '本次版本未填写更新摘要。'}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
