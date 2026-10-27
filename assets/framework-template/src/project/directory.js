export const pageDirectory = [];





import { project } from './meta.js';

export const getPageReadStorageKey = () => `mlp-page-read:${project.slug}`;
export const getPageUpdateKey = (item) => item.updatedAt || item.version || '';
export const readPageReadVersions = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(getPageReadStorageKey()) || '{}');
  } catch {
    return {};
  }
};
export const writePageReadVersions = (versions) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getPageReadStorageKey(), JSON.stringify(versions));
};

export const uiDesignChecklist = [];
