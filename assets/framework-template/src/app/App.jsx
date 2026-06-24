import { useEffect, useState } from 'react';
import ConnectorOverlay from '../framework/ConnectorOverlay.jsx';
import PageDirectory from '../framework/PageDirectory.jsx';
import PhoneFrame from '../framework/PhoneFrame.jsx';
import ProjectSettingsRail from '../framework/ProjectSettingsRail.jsx';
import PrototypeStage from '../framework/PrototypeStage.jsx';
import SpecPanel from '../framework/SpecPanel.jsx';
import UpdateBanner from '../framework/UpdateBanner.jsx';
import PromptDocsPage from '../docs/PromptDocsPage.jsx';
import UIDesignChecklistPage from '../docs/UIDesignChecklistPage.jsx';
import UISpecPage from '../docs/UISpecPage.jsx';
import {
  getPageReadStorageKey,
  getPageUpdateKey,
  getProjectDefaultTheme,
  getStateOptions,
  getThemeStorageKey,
  pageCopy,
  pageDirectory,
  readPageReadVersions,
  writePageReadVersions
} from '../project/project-data.js';

export default function App() {
  const [page, setPage] = useState('sample');
  const [activeState, setActiveState] = useState('default');
  const [activeInteraction, setActiveInteraction] = useState(null);
  const [interactionGuideEnabled, setInteractionGuideEnabled] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState('notes');
  const [pageReadVersions, setPageReadVersions] = useState(readPageReadVersions);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return getProjectDefaultTheme();
    const savedTheme = window.localStorage.getItem(getThemeStorageKey());
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return getProjectDefaultTheme();
  });
  const spec = pageCopy[page] || pageCopy.sample;
  const ctx = { page, state: activeState };

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(getThemeStorageKey(), nextTheme);
      }
      return nextTheme;
    });
  };
  const toggleInteractionGuide = () => {
    setInteractionGuideEnabled((current) => {
      if (current) setActiveInteraction(null);
      return !current;
    });
  };

  useEffect(() => {
    setActiveInteraction(null);
    const options = getStateOptions(page);
    if (!options.some((state) => state.id === activeState)) {
      setActiveState(options[0]?.id || 'default');
    }
  }, [page, activeState]);

  useEffect(() => {
    const currentPage = pageDirectory.find((item) => item.id === page);
    const updateKey = currentPage ? getPageUpdateKey(currentPage) : '';
    if (!currentPage || !updateKey || pageReadVersions[currentPage.id] === updateKey) return;
    setPageReadVersions((current) => {
      const next = { ...current, [currentPage.id]: updateKey };
      writePageReadVersions(next);
      return next;
    });
  }, [page, pageReadVersions]);

  return (
    <div className="app-shell">
      <UpdateBanner />
      <ConnectorOverlay activeInteraction={interactionGuideEnabled ? activeInteraction : null} />
      <main className="workspace">
        <ProjectSettingsRail theme={theme} toggleTheme={toggleTheme} interactionGuideEnabled={interactionGuideEnabled} toggleInteractionGuide={toggleInteractionGuide} rightPanelMode={rightPanelMode} toggleRightPanelMode={() => setRightPanelMode((current) => current === 'notes' ? 'tests' : 'notes')} />
        <PageDirectory active={page} setPage={setPage} pageReadVersions={pageReadVersions} />
        {page === 'uiChecklist' ? (
          <UIDesignChecklistPage pageReadVersions={pageReadVersions} />
        ) : page === 'uiSpec' ? (
          <UISpecPage />
        ) : page === 'prompts' ? (
          <PromptDocsPage />
        ) : (
          <PrototypeStage page={page} activeState={activeState} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction}>
            <PhoneFrame page={page} activeState={activeState} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} theme={theme} />
          </PrototypeStage>
        )}
        {!['uiChecklist', 'uiSpec', 'prompts'].includes(page) ? (
          <SpecPanel
            spec={spec}
            ctx={ctx}
            activeInteraction={activeInteraction}
            setActiveInteraction={setActiveInteraction}
            interactionGuideEnabled={interactionGuideEnabled}
            rightPanelMode={rightPanelMode}
          />
        ) : null}
      </main>
    </div>
  );
}

