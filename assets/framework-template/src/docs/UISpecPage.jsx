import { uiButtonSpec, uiComponentSplitSpec, uiPlaceholderSpec, uiSpacingSpec, uiThemeSpec, uiTypeSpec } from '../project/project-data.js';

export default function UISpecPage() {
  return (
    <section className="checklist-stage ui-spec-stage" aria-label="UI规范说明">
      <div className="checklist-head">
        <span className="eyebrow">UI standard</span>
        <h2>UI规范说明</h2>
        <p>框架使用两套黑白灰低保真主题。新项目必须通过全局变量切换亮色/暗色，只替换业务内容。</p>
      </div>
      <section className="ui-spec-section">
        <h3>主题颜色规范</h3>
        <div className="ui-token-grid">
          {uiThemeSpec.map((item) => (
            <article className="ui-token-card" key={`${item.theme}-${item.variable}`}>
              <i style={{ background: item.token }} />
              <div>
                <strong>{item.theme} · {item.variable}</strong>
                <span>{item.token}</span>
                <p>{item.usage}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="ui-spec-section">
        <h3>字号规范</h3>
        <div className="ui-spec-table">
          {uiTypeSpec.map((item) => (
            <article key={item.role}>
              <strong>{item.role}</strong>
              <span>{item.size} / {item.line} / {item.weight}</span>
              <p>{item.usage}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="ui-spec-section">
        <h3>间距与圆角</h3>
        <div className="ui-spec-table compact">
          {uiSpacingSpec.map((item) => (
            <article key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.value}</span>
              <p>{item.usage}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="ui-spec-section">
        <h3>按钮规范</h3>
        <div className="ui-spec-table compact">
          {uiButtonSpec.map((item) => (
            <article key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.value}</span>
              <p>{item.usage}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="ui-spec-section">
        <h3>图片占位符格式</h3>
        <div className="ui-spec-table compact">
          {uiPlaceholderSpec.map((item) => (
            <article key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.value}</span>
              <p>{item.usage}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="ui-spec-section">
        <h3>组件拆分规范</h3>
        <div className="ui-spec-table compact">
          {uiComponentSplitSpec.map((item) => (
            <article key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.value}</span>
              <p>{item.usage}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
