import { pageDirectory } from './directory.js';
import { getStateOptions } from './states.js';

export const pageNumberMap = Object.fromEntries(pageDirectory.map((item) => [item.id, item.number]));
const cx = (...classes) => classes.filter(Boolean).join(' ');
export const primaryPageIds = new Set(pageDirectory.filter((item) => item.level === 'primary').map((item) => item.id));
export const getPageNumber = (page) => pageNumberMap[page] || '?';
export const getPageShellConfig = (page) => {
  const primary = primaryPageIds.has(page);
  const secondary = !primary;
  return {
    primary,
    secondary,
    showBackBar: secondary,
    showTabBar: primary,
    level: primary ? 'primary' : 'secondary',
    screenClassName: cx('screen', primary && 'screen--primary', secondary && 'screen--secondary')
  };
};
export const getStateNumber = (page, stateId = 'default') => {
  const stateIndex = Math.max(0, getStateOptions(page).findIndex((state) => state.id === stateId));
  return `${getPageNumber(page)}-${stateIndex + 1}`;
};
