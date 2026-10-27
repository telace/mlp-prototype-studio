import { ArrowLeft } from 'lucide-react';
import { getPageShellConfig, pageCopy, pageDirectory } from '../project/project-data.js';
import { renderPhoneScreen } from '../project/routes.jsx';
import { IconButton } from '../prototype-ui/components/index.jsx';
import AnnotationLayer from './AnnotationLayer.jsx';

export default function PhoneFrame({ page, activeState, setPage, setActiveState, setActiveInteraction, theme, annotationMode = 'preview', annotations = [], selectedAnnotationId, onCreateAnnotation, onSelectAnnotation, onRequestElementDeletion }) {
  const shell = getPageShellConfig(page);
  const shouldCoverStatusbar = shell.secondary && ['sheet', 'modal'].includes(activeState);
  const fallbackPage = pageDirectory.find((item) => item.level !== 'docs')?.id || pageDirectory[0]?.id || page;
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
      <AnnotationLayer mode={annotationMode} annotations={annotations} selectedId={selectedAnnotationId} onCreate={onCreateAnnotation} onSelect={onSelectAnnotation} onRequestElementDeletion={onRequestElementDeletion} />
    </div>
  );
}

function BackBar({ title, onBack }) {
  return (
    <div className="nav-bar">
      <IconButton icon={<ArrowLeft size={20} />} label="返回" onClick={onBack} />
      <span>{title}</span>
      <span />
    </div>
  );
}
