import { ArrowLeft } from 'lucide-react';
import { getPageShellConfig, pageCopy, pageDirectory } from '../project/project-data.js';
import { renderPhoneScreen } from '../project/routes.jsx';
import { TabBar } from '../pages/index.js';

export default function PhoneFrame({ page, activeState, setPage, setActiveState, setActiveInteraction, theme }) {
  const shell = getPageShellConfig(page);
  const shouldCoverStatusbar = shell.secondary && ['sheet', 'modal'].includes(activeState);
  const fallbackPage = pageDirectory.find((item) => item.level !== 'docs')?.id || pageDirectory[0]?.id || 'home';
  return (
    <div className="phone" data-theme={theme} data-page-level={shell.level}>
      <div className="statusbar">
        <span>9:35</span>
        <span className="signals">▮▮▮ WiFi ▭</span>
      </div>
      {shouldCoverStatusbar ? (
        <button className="phone-status-scrim" type="button" onClick={() => setActiveState('default')} aria-label="关闭遮罩" />
      ) : null}
      {shell.showBackBar ? <BackBar title={pageCopy[page]?.title || '页面'} onBack={() => { setActiveState('default'); setPage(fallbackPage); }} /> : null}
      <div className={shell.screenClassName}>
        {renderPhoneScreen({ page, activeState, setPage, setActiveState, setActiveInteraction })}
      </div>
      {shell.showTabBar ? <TabBar active={page} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} /> : null}
    </div>
  );
}

function BackBar({ title, onBack }) {
  return (
    <div className="nav-bar">
      <button className="icon-btn" type="button" onClick={onBack} aria-label="返回"><ArrowLeft size={20} /></button>
      <span>{title}</span>
      <span />
    </div>
  );
}
