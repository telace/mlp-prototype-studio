import { useEffect, useState } from 'react';
import { uiComponentSpec, uiSpacingSpec, uiThemeSpec, uiTypeSpec } from '../project/project-data.js';

const readToken = (theme, token) => {
  const probe = document.querySelector(`[data-ui-token-probe="${theme}"]`);
  return probe ? getComputedStyle(probe).getPropertyValue(token).trim() : '';
};

export default function UISpecPage() {
  const [, refresh] = useState(0);
  useEffect(() => refresh((value) => value + 1), []);
  const valueFor = (token, theme = 'light') => readToken(theme, token) || `var(${token})`;

  return (
    <section className="checklist-stage ui-spec-stage" aria-label="UI规范说明">
      <i className="phone ui-token-probe" data-ui-token-probe="dark" data-theme="dark" aria-hidden="true" />
      <i className="phone ui-token-probe" data-ui-token-probe="light" data-theme="light" aria-hidden="true" />
      <div className="checklist-head">
        <span className="eyebrow">UI standard</span>
        <h2>UI规范说明</h2>
        <p>下列数值为 prototype-ui/tokens.css 中的默认参考，可按项目设计调整；不限制页面内容、布局或组件选择。</p>
      </div>
      <section className="ui-spec-section">
        <h3>主题Token</h3>
        <div className="ui-token-grid">
          {uiThemeSpec.map((item) => {
            const theme = item.theme === '暗色' ? 'dark' : 'light';
            const token = valueFor(item.variable, theme);
            return <article className="ui-token-card" key={`${item.theme}-${item.variable}`}><i style={{ background: token }} /><div><strong>{item.theme} · {item.variable}</strong><span>{token}</span><p>{item.usage}</p></div></article>;
          })}
        </div>
      </section>
      <section className="ui-spec-section"><h3>字号与行高</h3><div className="ui-spec-table">
        {uiTypeSpec.map((item) => <article key={item.role}><strong>{item.role}</strong><span>{valueFor(item.size)} / {valueFor(item.line)}</span><p>{item.usage}</p></article>)}
      </div></section>
      <section className="ui-spec-section"><h3>间距与圆角</h3><div className="ui-spec-table compact">
        {uiSpacingSpec.map((item) => <article key={item.token}><strong>{item.name}</strong><span>{valueFor(item.token)}</span><p>{item.usage}</p></article>)}
      </div></section>
      <section className="ui-spec-section"><h3>可选组件</h3><div className="ui-spec-table compact">
        {uiComponentSpec.map((item) => <article key={item.name}><strong>{item.name}</strong><span>{item.contract}</span><p>{item.usage}</p></article>)}
      </div></section>
    </section>
  );
}
