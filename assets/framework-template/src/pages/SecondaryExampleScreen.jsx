import { useState } from 'react';
import { ArrowLeft, BadgeCheck, Layers3, Sparkles } from 'lucide-react';
import { bindInteraction } from '../framework/interaction.js';

export default function SecondaryExampleScreen({ activeState, setPage, setActiveState, setActiveInteraction }) {
  const [toastMessage, setToastMessage] = useState('已保存修改');
  const showToast = (message) => {
    setToastMessage(message);
    setActiveState('toast');
  };

  return (
    <section className="secondary-example-screen">
      <div className="secondary-topbar">
        <button className="icon-btn" onClick={() => { setActiveState('default'); setPage('sample'); }} {...bindInteraction('secondary-back', setActiveInteraction)} aria-label="返回一级页面">
          <ArrowLeft size={20} />
        </button>
        <strong>二级页面</strong>
        <span />
      </div>
      <div className="secondary-scroll">
        <article className="secondary-intro-card">
          <span className="eyebrow">Secondary page</span>
          <h2>有顶部标题栏</h2>
          <p>二级页面没有底部导航，顶部标题栏和返回按钮锁定在页面顶部。</p>
        </article>
        <div className="secondary-action-grid">
          <button onClick={() => setActiveState('sheet')} {...bindInteraction('secondary-open-sheet', setActiveInteraction)}>
            <Layers3 size={20} />
            <strong>打开 Sheet</strong>
            <span>底部弹出选择面板</span>
          </button>
          <button onClick={() => setActiveState('modal')} {...bindInteraction('secondary-open-modal', setActiveInteraction)}>
            <Sparkles size={20} />
            <strong>打开弹窗</strong>
            <span>居中阻断确认</span>
          </button>
          <button onClick={() => setActiveState('toast')} {...bindInteraction('secondary-open-toast', setActiveInteraction)}>
            <BadgeCheck size={20} />
            <strong>显示 Toast</strong>
            <span>短反馈提示</span>
          </button>
        </div>
        <section className="secondary-list-section">
          <h3>二级页面内容</h3>
          {[0, 1, 2].map((item) => (
            <article key={item} className="secondary-list-row">
              <div />
              <span>
                <strong>列表内容 {item + 1}</strong>
                <em>用于验证顶部栏锁顶和内容滚动。</em>
              </span>
            </article>
          ))}
        </section>
      </div>
      {activeState === 'sheet' ? (
        <div className="bottom-sheet-layer secondary-sheet-layer" {...bindInteraction('secondary-sheet', setActiveInteraction)}>
          <button className="sheet-backdrop" type="button" onClick={() => setActiveState('default')} aria-label="关闭 Sheet" />
          <div className="bottom-sheet">
            <i />
            <strong>选择操作</strong>
            <button className="action-sheet-row" type="button" onClick={() => showToast('已选择相册')}>从相册选择</button>
            <button className="action-sheet-row" type="button" onClick={() => showToast('已打开相机')}>拍照上传</button>
            <button className="action-sheet-row" type="button" onClick={() => showToast('已选择历史素材')}>从历史素材选择</button>
          </div>
        </div>
      ) : null}
      {activeState === 'modal' ? (
        <div className="modal-layer" {...bindInteraction('secondary-modal', setActiveInteraction)}>
          <button className="modal-backdrop" type="button" onClick={() => setActiveState('default')} aria-label="关闭弹窗" />
          <div className="prototype-modal">
            <strong>确认执行操作？</strong>
            <p>弹窗用于关键确认、失败提示、能量不足或离开挽留等阻断场景。</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setActiveState('default')}>取消</button>
              <button type="button" onClick={() => showToast('已确认操作')}>确认</button>
            </div>
          </div>
        </div>
      ) : null}
      {activeState === 'toast' ? (
        <div className="toast-message secondary-toast-message" {...bindInteraction('secondary-toast', setActiveInteraction)}>
          {toastMessage}
        </div>
      ) : null}
    </section>
  );
}

