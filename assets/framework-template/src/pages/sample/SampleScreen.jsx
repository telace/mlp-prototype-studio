import { ChevronRight, Menu, WandSparkles } from 'lucide-react';
import { bindElement, bindInteraction } from '../../framework/interaction.js';

export default function SampleScreen({ activeState, setPage, setActiveState, setActiveInteraction }) {
  return (
    <section className="home-screen sample-screen primary-example-screen">
      <div className="home-topline">
        <div {...bindElement('sample-page-heading', setActiveInteraction)}>
          <span className="eyebrow" {...bindElement('sample-page-eyebrow', setActiveInteraction)}>Framework</span>
          <h1>一级页面</h1>
        </div>
        <button className="membership-pill" onClick={() => { setActiveState('default'); setPage('secondaryExample'); }} {...bindInteraction('sample-open-secondary', setActiveInteraction)}>
          <ChevronRight size={16} />
          进入二级
        </button>
      </div>
      <div className="feature-strip">
        <button className="feature-entry feature-entry-primary" onClick={() => { setActiveState('default'); setPage('secondaryExample'); }} {...bindInteraction('sample-open-secondary', setActiveInteraction)}>
          <span className="feature-icon"><WandSparkles size={18} /></span>
          <span className="feature-copy">
            <strong {...bindElement('sample-secondary-entry-title', setActiveInteraction)}>进入二级页面</strong>
            <em {...bindElement('sample-secondary-entry-desc', setActiveInteraction)}>顶部标题栏与返回按钮</em>
          </span>
          <ChevronRight size={16} />
        </button>
        <button className="feature-entry" onClick={() => setActiveState('drawer')} {...bindInteraction('sample-open-drawer', setActiveInteraction)}>
          <span className="feature-icon"><Menu size={18} /></span>
          <span className="feature-copy">
            <strong {...bindElement('sample-drawer-entry-title', setActiveInteraction)}>打开侧边抽屉</strong>
            <em {...bindElement('sample-drawer-entry-desc', setActiveInteraction)}>覆盖当前一级页面</em>
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
      <section className="home-section">
        <div className="section-head">
          <h2 {...bindElement('sample-content-section-title', setActiveInteraction)}>一级页面内容</h2>
        </div>
        <div className="home-recommend-feed">
          <article className="home-template-card" {...bindElement('sample-card-1', setActiveInteraction)}>
            <div className="cover-placeholder tone-0" {...bindElement('sample-card-1-cover', setActiveInteraction)} />
            <strong {...bindElement('sample-card-1-title', setActiveInteraction)}>内容占位 1</strong>
          </article>
          <article className="home-template-card" {...bindElement('sample-card-2', setActiveInteraction)}>
            <div className="cover-placeholder tone-1" {...bindElement('sample-card-2-cover', setActiveInteraction)} />
            <strong {...bindElement('sample-card-2-title', setActiveInteraction)}>内容占位 2</strong>
          </article>
          <article className="home-template-card" {...bindElement('sample-card-3', setActiveInteraction)}>
            <div className="cover-placeholder tone-2" {...bindElement('sample-card-3-cover', setActiveInteraction)} />
            <strong {...bindElement('sample-card-3-title', setActiveInteraction)}>内容占位 3</strong>
          </article>
          <article className="home-template-card" {...bindElement('sample-card-4', setActiveInteraction)}>
            <div className="cover-placeholder tone-0" {...bindElement('sample-card-4-cover', setActiveInteraction)} />
            <strong {...bindElement('sample-card-4-title', setActiveInteraction)}>内容占位 4</strong>
          </article>
        </div>
      </section>
      {activeState === 'drawer' ? (
        <div className="drawer-layer sample-drawer-layer" {...bindInteraction('sample-drawer', setActiveInteraction)}>
          <button className="drawer-backdrop" type="button" onClick={() => setActiveState('default')} aria-label="关闭抽屉" />
          <aside className="left-drawer">
            <div className="drawer-head">
              <strong>一级页抽屉</strong>
              <button className="icon-btn" type="button" onClick={() => setActiveState('default')} aria-label="关闭抽屉">×</button>
            </div>
            <button className="drawer-row" type="button" onClick={() => { setActiveState('default'); setPage('secondaryExample'); }}>菜单入口</button>
            <button className="drawer-row" type="button" onClick={() => setActiveState('default')}>筛选条件</button>
            <button className="drawer-row" type="button" onClick={() => { setActiveState('default'); setPage('secondaryExample'); }}>帮助说明</button>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
