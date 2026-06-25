import { useState } from 'react';
import { ArrowLeft, BadgeCheck, Layers3, Sparkles } from 'lucide-react';
import { bindElement, bindInteraction } from '../../framework/interaction.js';
import { BottomSheet, Button, Modal, Toast } from '../../prototype-ui/components/index.jsx';

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
        <article className="secondary-intro-card" {...bindElement('secondary-intro-card', setActiveInteraction)}>
          <span className="eyebrow" {...bindElement('secondary-intro-eyebrow', setActiveInteraction)}>Secondary page</span>
          <h2 {...bindElement('secondary-intro-title', setActiveInteraction)}>有顶部标题栏</h2>
          <p {...bindElement('secondary-intro-desc', setActiveInteraction)}>二级页面没有底部导航，顶部标题栏和返回按钮锁定在页面顶部。</p>
        </article>
        <div className="secondary-action-grid">
          <button onClick={() => setActiveState('sheet')} {...bindInteraction('secondary-open-sheet', setActiveInteraction)}>
            <Layers3 size={20} />
            <strong {...bindElement('secondary-sheet-button-title', setActiveInteraction)}>打开 Sheet</strong>
            <span {...bindElement('secondary-sheet-button-desc', setActiveInteraction)}>底部弹出选择面板</span>
          </button>
          <button onClick={() => setActiveState('modal')} {...bindInteraction('secondary-open-modal', setActiveInteraction)}>
            <Sparkles size={20} />
            <strong {...bindElement('secondary-modal-button-title', setActiveInteraction)}>打开弹窗</strong>
            <span {...bindElement('secondary-modal-button-desc', setActiveInteraction)}>居中阻断确认</span>
          </button>
          <button onClick={() => setActiveState('toast')} {...bindInteraction('secondary-open-toast', setActiveInteraction)}>
            <BadgeCheck size={20} />
            <strong {...bindElement('secondary-toast-button-title', setActiveInteraction)}>显示 Toast</strong>
            <span {...bindElement('secondary-toast-button-desc', setActiveInteraction)}>短反馈提示</span>
          </button>
        </div>
        <section className="secondary-list-section">
          <h3 {...bindElement('secondary-list-section-title', setActiveInteraction)}>二级页面内容</h3>
          <article className="secondary-list-row" {...bindElement('secondary-list-row-1', setActiveInteraction)}>
            <div {...bindElement('secondary-list-row-1-thumb', setActiveInteraction)} />
            <span>
              <strong {...bindElement('secondary-list-row-1-title', setActiveInteraction)}>列表内容 1</strong>
              <em {...bindElement('secondary-list-row-1-desc', setActiveInteraction)}>用于验证顶部栏锁顶和内容滚动。</em>
            </span>
          </article>
          <article className="secondary-list-row" {...bindElement('secondary-list-row-2', setActiveInteraction)}>
            <div {...bindElement('secondary-list-row-2-thumb', setActiveInteraction)} />
            <span>
              <strong {...bindElement('secondary-list-row-2-title', setActiveInteraction)}>列表内容 2</strong>
              <em {...bindElement('secondary-list-row-2-desc', setActiveInteraction)}>用于验证顶部栏锁顶和内容滚动。</em>
            </span>
          </article>
          <article className="secondary-list-row" {...bindElement('secondary-list-row-3', setActiveInteraction)}>
            <div {...bindElement('secondary-list-row-3-thumb', setActiveInteraction)} />
            <span>
              <strong {...bindElement('secondary-list-row-3-title', setActiveInteraction)}>列表内容 3</strong>
              <em {...bindElement('secondary-list-row-3-desc', setActiveInteraction)}>用于验证顶部栏锁顶和内容滚动。</em>
            </span>
          </article>
        </section>
      </div>
      <BottomSheet open={activeState === 'sheet'} title="选择操作" onClose={() => setActiveState('default')} className="secondary-sheet-layer">
        <div className="secondary-sheet-actions" {...bindInteraction('secondary-sheet', setActiveInteraction)}>
          <button className="action-sheet-row" type="button" onClick={() => showToast('已选择相册')}>从相册选择</button>
          <button className="action-sheet-row" type="button" onClick={() => showToast('已打开相机')}>拍照上传</button>
          <button className="action-sheet-row" type="button" onClick={() => showToast('已选择历史素材')}>从历史素材选择</button>
        </div>
      </BottomSheet>
      <Modal
        open={activeState === 'modal'}
        title="确认执行操作？"
        description="弹窗用于关键确认、失败提示、能量不足或离开挽留等阻断场景。"
        onClose={() => setActiveState('default')}
        className="secondary-modal"
        actions={(
          <>
            <Button block variant="ghost" type="button" onClick={() => setActiveState('default')}>取消</Button>
            <Button block type="button" onClick={() => showToast('已确认操作')} {...bindInteraction('secondary-modal', setActiveInteraction)}>确认</Button>
          </>
        )}
      />
      <Toast open={activeState === 'toast'} className="secondary-toast-message">
        <span {...bindInteraction('secondary-toast', setActiveInteraction)}>{toastMessage}</span>
      </Toast>
    </section>
  );
}
