import { Grid2X2 } from 'lucide-react';
import { bindInteraction } from '../framework/interaction.js';

export default function ComponentLibraryScreen({ setActiveInteraction }) {
  return (
    <section className="component-screen" {...bindInteraction('components-preview', setActiveInteraction)}>
      <h2>组件库</h2>
      <p>保留框架内置低保真组件，新业务页面优先复用。</p>

      <div className="component-section">
        <h3>按钮与标签</h3>
        <div className="component-grid">
          <button className="primary-btn">主按钮</button>
          <button className="secondary-btn">次按钮</button>
          <span className="chip active">选中标签</span>
          <span className="chip">默认标签</span>
          <button className="icon-btn" aria-label="图标按钮">
            <Grid2X2 size={18} />
          </button>
          <button className="flow-text-btn">切换方式</button>
        </div>
      </div>

      <div className="component-section">
        <h3>输入与占位</h3>
        <div className="form-field">
          <span>邮箱</span>
          <b>name@example.com</b>
        </div>
        <div className="cover-placeholder" />
        <article className="state-card">
          <Grid2X2 size={18} />
          <strong>信息卡片</strong>
          <span>低保真组件占位</span>
        </article>
      </div>

      <div className="component-section bottom-action-example">
        <h3>底部按钮规范</h3>
        <div className="bottom-action-bar dual">
          <button className="ghost-cta">返回调整</button>
          <button className="bottom-cta">下一步</button>
        </div>
        <div className="bottom-action-bar single">
          <button className="bottom-cta">确认提交</button>
        </div>
      </div>

      <div className="component-section">
        <h3>弹层与反馈</h3>
        <div className="component-overlay-preview">
          <div className="toast-message">已保存修改</div>
          <div className="left-drawer">
            <div className="drawer-head">
              <strong>左侧抽屉</strong>
              <button className="icon-btn">×</button>
            </div>
            <button className="drawer-row">菜单入口</button>
            <button className="drawer-row">筛选条件</button>
          </div>
          <div className="prototype-modal component-modal-preview">
            <strong>确认弹窗</strong>
            <p>用于阻断确认、失败提示、能量不足等状态。</p>
            <div className="modal-actions">
              <button>取消</button>
              <button>确认</button>
            </div>
          </div>
          <div className="bottom-sheet component-sheet-preview">
            <i />
            <strong>底部 Sheet</strong>
            <button className="action-sheet-row">相册选择</button>
            <button className="action-sheet-row">拍照上传</button>
          </div>
        </div>
      </div>
    </section>
  );
}

