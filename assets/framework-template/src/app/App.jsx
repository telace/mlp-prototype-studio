import { useEffect, useState } from 'react';
import CommandHelpModal from '../framework/CommandHelpModal.jsx';
import ConnectorOverlay from '../framework/ConnectorOverlay.jsx';
import PageDirectory from '../framework/PageDirectory.jsx';
import PhoneFrame from '../framework/PhoneFrame.jsx';
import ProjectSettingsRail from '../framework/ProjectSettingsRail.jsx';
import PrototypeStage from '../framework/PrototypeStage.jsx';
import SpecPanel from '../framework/SpecPanel.jsx';
import UpdateBanner from '../framework/UpdateBanner.jsx';
import { getDirectoryItems, supportPageIds } from '../framework/supportPages.js';
import ChangelogPage from '../docs/ChangelogPage.jsx';
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

function parseRoute() {
  if (typeof window === 'undefined') return { page: 'sample', state: 'default' };
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const directoryItems = getDirectoryItems(pageDirectory);
  const page = directoryItems.some((item) => item.id === parts[0]) ? parts[0] : 'sample';
  const options = getStateOptions(page);
  const state = options.some((item) => item.id === parts[1]) ? parts[1] : options[0]?.id || 'default';
  return { page, state };
}

function getRouteHash(page, state) {
  const options = getStateOptions(page);
  const normalizedState = options.some((item) => item.id === state) ? state : options[0]?.id || 'default';
  return normalizedState === 'default' ? `#/${page}` : `#/${page}/${normalizedState}`;
}

export default function App() {
  const initialRoute = parseRoute();
  const [page, setPage] = useState(initialRoute.page);
  const [activeState, setActiveState] = useState(initialRoute.state);
  const [activeInteraction, setActiveInteraction] = useState(null);
  const [interactionGuideEnabled, setInteractionGuideEnabled] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState('notes');
  const [commandHelpOpen, setCommandHelpOpen] = useState(false);
  const [pageReadVersions, setPageReadVersions] = useState(readPageReadVersions);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return getProjectDefaultTheme();
    const savedTheme = window.localStorage.getItem(getThemeStorageKey());
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return getProjectDefaultTheme();
  });
  const spec = pageCopy[page] || pageCopy.sample;
  const ctx = { page, state: activeState };
  const isSupportPage = supportPageIds.includes(page);

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
    if (typeof window === 'undefined') return undefined;
    const syncFromHash = () => {
      const next = parseRoute();
      setPage(next.page);
      setActiveState(next.state);
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nextHash = getRouteHash(page, activeState);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
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
      <CommandHelpModal open={commandHelpOpen} onClose={() => setCommandHelpOpen(false)} />
      <ConnectorOverlay activeInteraction={interactionGuideEnabled ? activeInteraction : null} />
      <main className="workspace">
        <ProjectSettingsRail theme={theme} toggleTheme={toggleTheme} interactionGuideEnabled={interactionGuideEnabled} toggleInteractionGuide={toggleInteractionGuide} rightPanelMode={rightPanelMode} toggleRightPanelMode={() => setRightPanelMode((current) => current === 'notes' ? 'tests' : 'notes')} openCommandHelp={() => setCommandHelpOpen(true)} />
        <PageDirectory active={page} setPage={setPage} pageReadVersions={pageReadVersions} />
        {page === 'uiChecklist' ? (
          <UIDesignChecklistPage pageReadVersions={pageReadVersions} />
        ) : page === 'uiSpec' ? (
          <UISpecPage />
        ) : page === 'changelog' ? (
          <ChangelogPage />
        ) : page === 'prompts' ? (
          <PromptDocsPage />
        ) : (
          <PrototypeStage page={page} activeState={activeState} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction}>
            <PhoneFrame page={page} activeState={activeState} setPage={setPage} setActiveState={setActiveState} setActiveInteraction={setActiveInteraction} theme={theme} />
          </PrototypeStage>
        )}
        {!isSupportPage ? (
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
