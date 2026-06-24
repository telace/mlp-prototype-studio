import { ChevronRight, Menu, WandSparkles } from 'lucide-react';
import { bindInteraction } from '../framework/interaction.js';

export default function SampleScreen({ activeState, setPage, setActiveState, setActiveInteraction }) {
  return (
    <section className="home-screen sample-screen primary-example-screen">
      <div className="home-topline">
        <div>
          <span className="eyebrow">Framework</span>
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
            <strong>进入二级页面</strong>
            <em>顶部标题栏与返回按钮</em>
          </span>
          <ChevronRight size={16} />
        </button>
        <button className="feature-entry" onClick={() => setActiveState('drawer')} {...bindInteraction('sample-open-drawer', setActiveInteraction)}>
          <span className="feature-icon"><Menu size={18} /></span>
          <span className="feature-copy">
            <strong>打开侧边抽屉</strong>
            <em>覆盖当前一级页面</em>
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
      <section className="home-section">
        <div className="section-head">
          <h2>一级页面内容</h2>
        </div>
        <div className="home-recommend-feed" {...bindInteraction('sample-card', setActiveInteraction)}>
          {[0, 1, 2, 3].map((item) => (
            <article className="home-template-card" key={item}>
              <div className={`cover-placeholder tone-${item % 3}`} />
              <strong>内容占位 {item + 1}</strong>
            </article>
          ))}
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

