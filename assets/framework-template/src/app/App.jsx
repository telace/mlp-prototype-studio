import { useEffect, useState } from 'react';
import AIHandoffModal from '../framework/AIHandoffModal.jsx';
import AnnotationPanel from '../framework/AnnotationPanel.jsx';
import CommandHelpModal from '../framework/CommandHelpModal.jsx';
import ConnectorOverlay from '../framework/ConnectorOverlay.jsx';
import PageDirectory from '../framework/PageDirectory.jsx';
import PhoneFrame from '../framework/PhoneFrame.jsx';
import ProjectSettingsRail from '../framework/ProjectSettingsRail.jsx';
import PrototypeStage from '../framework/PrototypeStage.jsx';
import UpdateBanner from '../framework/UpdateBanner.jsx';
import { getRouteItems, supportPageIds } from '../framework/supportPages.js';
import ChangelogPage from '../docs/ChangelogPage.jsx';
import PromptDocsPage from '../docs/PromptDocsPage.jsx';
import PRDPage from '../docs/PRDPage.jsx';
import TestAcceptancePage from '../docs/TestAcceptancePage.jsx';
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
import bundledLocalEdits from '../project/notes/local-edits.json' with { type: 'json' };

function parseRoute() {
  const directoryItems = getRouteItems(pageDirectory);
  const fallbackPage = directoryItems.find((item) => item.id === 'prd')?.id || directoryItems[0]?.id || 'prd';
  if (typeof window === 'undefined') return { page: fallbackPage, state: 'default' };
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const page = directoryItems.some((item) => item.id === parts[0]) ? parts[0] : fallbackPage;
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
  const [commandHelpOpen, setCommandHelpOpen] = useState(false);
  const [aiHandoffOpen, setAiHandoffOpen] = useState(false);
  const [notesDirty, setNotesDirty] = useState(false);
  const [annotationMode, setAnnotationMode] = useState('preview');
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);
  const [elementDeletions, setElementDeletions] = useState([]);
  const [pendingElementDeletion, setPendingElementDeletion] = useState(null);
  const [pageReadVersions, setPageReadVersions] = useState(readPageReadVersions);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return getProjectDefaultTheme();
    const savedTheme = window.localStorage.getItem(getThemeStorageKey());
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return getProjectDefaultTheme();
  });
  const spec = pageCopy[page] || pageCopy[pageDirectory[0]?.id] || { title: page, purpose: '未填写页面功能说明。', elements: [] };
  const ctx = { page, state: activeState };
  const isSupportPage = supportPageIds.includes(page) || pageDirectory.some((item) => item.id === page && item.level === 'docs');

  useEffect(() => {
    let disposed = false;
    const source = import.meta.env.DEV
      ? fetch('/src/project/notes/local-edits.json?t=' + Date.now()).then((response) => response.ok ? response.json() : bundledLocalEdits)
      : Promise.resolve(bundledLocalEdits);
    source
      .then((payload) => {
        if (disposed) return;
        const stateItems = payload?.annotations?.[page]?.[activeState] || payload?.annotations?.[page]?.__default || {};
        setAnnotations(Object.values(stateItems).filter((item) => !item.deleted));
        const deletionItems = payload?.elementDeletions?.[page]?.[activeState] || payload?.elementDeletions?.[page]?.__default || {};
        setElementDeletions(Object.values(deletionItems).filter((item) => item.status === 'pending'));
        setSelectedAnnotation(null);
        setPendingAnnotation(null);
        setPendingElementDeletion(null);
      })
      .catch(() => { setAnnotations([]); setElementDeletions([]); });
    return () => { disposed = true; };
  }, [page, activeState]);

  const createAnnotation = (anchor) => {
    const item = { ...anchor, id: 'annotation-' + Date.now(), pageId: page, stateId: activeState, kind: 'note', description: '', effect: '', dataSource: '' };
    setPendingAnnotation(item);
    setSelectedAnnotation(null);
    setAnnotationMode('preview');
  };
  const saveAnnotation = (item) => {
    setAnnotations((current) => [...current.filter((entry) => entry.id !== item.id), item]);
    setPendingAnnotation(null);
    setSelectedAnnotation(item);
    setNotesDirty(false);
  };
  const deleteAnnotation = (item) => {
    setAnnotations((current) => current.filter((entry) => entry.id !== item?.id));
    setPendingAnnotation(null);
    setSelectedAnnotation(null);
    setNotesDirty(false);
  };
  const requestElementDeletion = (item) => {
    setPendingElementDeletion(item);
    setPendingAnnotation(null);
    setSelectedAnnotation(null);
    setAnnotationMode('preview');
  };
  const confirmElementDeletion = async () => {
    if (!pendingElementDeletion?.elementId) return;
    const item = { ...pendingElementDeletion, pageId: page, stateId: activeState, status: 'pending', createdAt: new Date().toISOString() };
    const response = await fetch('/__mlp/api/notes/update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'elementDeletion', pageId: page, stateId: activeState, itemId: item.elementId, fields: item })
    });
    if (!response.ok) return;
    const payload = await response.json();
    setElementDeletions((current) => [...current.filter((entry) => entry.elementId !== item.elementId), payload.item]);
    setPendingElementDeletion(null);
  };
  const restoreElement = async (item) => {
    const response = await fetch('/__mlp/api/notes/update', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'elementDeletion', pageId: page, stateId: activeState, itemId: item.elementId })
    });
    if (response.ok) setElementDeletions((current) => current.filter((entry) => entry.elementId !== item.elementId));
  };

  useEffect(() => {
    let observer;
    const applyElementDeletions = () => {
      const phone = document.querySelector('.phone');
      if (!phone) return;
      phone.querySelectorAll('[data-mlp-element-deleted]').forEach((node) => node.removeAttribute('data-mlp-element-deleted'));
      const deletedIds = new Set(elementDeletions.map((item) => item.elementId));
      phone.querySelectorAll('[data-interaction-id]').forEach((node) => {
        if (deletedIds.has(node.dataset.interactionId)) node.setAttribute('data-mlp-element-deleted', '');
      });
    };
    const frame = window.requestAnimationFrame(() => {
      applyElementDeletions();
      const phone = document.querySelector('.phone');
      if (!phone) return;
      observer = new MutationObserver(applyElementDeletions);
      observer.observe(phone, { childList: true, subtree: true });
    });
    return () => { window.cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [page, activeState, elementDeletions]);

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
  const confirmLeaveDirtyNotes = () => {
    if (!notesDirty) return true;
    return window.confirm('当前交互说明尚未保存，是否放弃修改并切换？');
  };
  const changePage = (nextPage) => {
    if (!confirmLeaveDirtyNotes()) return;
    setNotesDirty(false);
    setAnnotationMode('preview');
    setPendingElementDeletion(null);
    setPage(nextPage);
  };
  const changeState = (nextState) => {
    if (!confirmLeaveDirtyNotes()) return;
    setNotesDirty(false);
    setAnnotationMode('preview');
    setPendingElementDeletion(null);
    setActiveState(nextState);
  };

  useEffect(() => {
    setActiveInteraction(null);
    const options = getStateOptions(page);
    if (!options.some((state) => state.id === activeState)) {
      setActiveState(options[0]?.id || 'default');
    }
  }, [page, activeState]);

  useEffect(() => {
    const handleGuideShortcut = (event) => {
      if (event.key.toLowerCase() !== 'g' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable) return;
      event.preventDefault();
      toggleInteractionGuide();
    };
    window.addEventListener('keydown', handleGuideShortcut);
    return () => window.removeEventListener('keydown', handleGuideShortcut);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncFromHash = () => {
      const next = parseRoute();
      if (notesDirty && (next.page !== page || next.state !== activeState)) {
        if (!window.confirm('当前交互说明尚未保存，是否放弃修改并切换？')) {
          window.history.replaceState(null, '', getRouteHash(page, activeState));
          return;
        }
        setNotesDirty(false);
      }
      setPage(next.page);
      setActiveState(next.state);
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [activeState, notesDirty, page]);

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
      <AIHandoffModal open={aiHandoffOpen} onClose={() => setAiHandoffOpen(false)} />
      <ConnectorOverlay activeInteraction={interactionGuideEnabled ? activeInteraction : null} />
      <main className="workspace">
        <ProjectSettingsRail active={page} setPage={changePage} theme={theme} toggleTheme={toggleTheme} interactionGuideEnabled={interactionGuideEnabled} toggleInteractionGuide={toggleInteractionGuide} openCommandHelp={() => setCommandHelpOpen(true)} openAIHandoff={() => setAiHandoffOpen(true)} />
        <PageDirectory active={page} setPage={changePage} pageReadVersions={pageReadVersions} />
        {page === 'uiChecklist' ? (
          <UIDesignChecklistPage pageReadVersions={pageReadVersions} theme={theme} />
        ) : page === 'uiSpec' ? (
          <UISpecPage />
        ) : page === 'testAcceptance' ? (
          <TestAcceptancePage />
        ) : page === 'changelog' ? (
          <ChangelogPage />
        ) : page === 'prompts' ? (
          <PromptDocsPage />
        ) : page === 'prd' ? (
          <PRDPage />
        ) : (
          <PrototypeStage page={page} activeState={activeState} setActiveState={changeState} setActiveInteraction={setActiveInteraction}>
            <PhoneFrame page={page} activeState={activeState} setPage={changePage} setActiveState={changeState} setActiveInteraction={setActiveInteraction} theme={theme} annotationMode={annotationMode} annotations={annotations} selectedAnnotationId={(pendingAnnotation || selectedAnnotation)?.id} onCreateAnnotation={createAnnotation} onSelectAnnotation={(item) => { setAnnotationMode('preview'); setPendingAnnotation(null); setSelectedAnnotation(item); }} onRequestElementDeletion={requestElementDeletion} />
          </PrototypeStage>
        )}
        {!isSupportPage ? (
          <AnnotationPanel
            ctx={ctx}
            mode={annotationMode}
            setMode={setAnnotationMode}
            annotations={annotations}
            selected={selectedAnnotation}
            pending={pendingAnnotation}
            onSelect={(item) => { setPendingAnnotation(null); setSelectedAnnotation(item); }}
            onSaved={saveAnnotation}
            onDeleted={deleteAnnotation}
            onDirtyChange={setNotesDirty}
            elementDeletions={elementDeletions}
            pendingElementDeletion={pendingElementDeletion}
            onConfirmElementDeletion={confirmElementDeletion}
            onCancelElementDeletion={() => setPendingElementDeletion(null)}
            onRestoreElement={restoreElement}
          />
        ) : null}
      </main>
    </div>
  );
}
