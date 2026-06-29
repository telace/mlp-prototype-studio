import { useEffect, useRef } from 'react';
import { getStateOptions, pageDirectory } from '../project/project-data.js';

export default function PrototypeStage({ children, page, activeState, setActiveState, setActiveInteraction }) {
  const pageInfo = pageDirectory.find((item) => item.id === page);
  const stateOptions = getStateOptions(page);
  const stateScrollerRef = useRef(null);

  useEffect(() => {
    const inner = stateScrollerRef.current;
    const scroller = inner?.closest('.prototype-state-switch');
    const activeButton = inner?.querySelector('button.active');
    if (!scroller || !activeButton) return undefined;
    const updateOverflowState = () => {
      const buttons = [...inner.querySelectorAll('button')];
      const innerStyle = window.getComputedStyle(inner);
      const scrollerStyle = window.getComputedStyle(scroller);
      const gap = Number.parseFloat(innerStyle.columnGap || innerStyle.gap || '0') || 0;
      const scrollerPadding = (Number.parseFloat(scrollerStyle.paddingLeft) || 0) + (Number.parseFloat(scrollerStyle.paddingRight) || 0);
      const naturalWidth = buttons.reduce((sum, button) => sum + button.offsetWidth, 0) + Math.max(0, buttons.length - 1) * gap;
      const isOverflowing = naturalWidth > scroller.clientWidth - scrollerPadding;
      scroller.classList.toggle('is-overflowing', isOverflowing);
      if (!isOverflowing) {
        scroller.scrollTo({ left: 0, behavior: 'auto' });
      }
      return isOverflowing;
    };
    const centerActiveButton = (behavior = 'smooth') => {
      if (!updateOverflowState()) return;
      const scrollerRect = scroller.getBoundingClientRect();
      const activeRect = activeButton.getBoundingClientRect();
      const activeCenterOffset = (activeRect.left - scrollerRect.left) + activeRect.width / 2;
      const nextLeft = scroller.scrollLeft + activeCenterOffset - scroller.clientWidth / 2;
      const maxLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      scroller.scrollTo({ left: Math.min(maxLeft, Math.max(0, nextLeft)), behavior });
    };
    const frame = window.requestAnimationFrame(() => centerActiveButton('smooth'));
    const timer = window.setTimeout(() => centerActiveButton('auto'), 360);
    window.addEventListener('resize', updateOverflowState);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener('resize', updateOverflowState);
    };
  }, [page, activeState]);

  return (
    <section className="phone-stage" aria-label="移动端原型">
      <div className="prototype-state-switch" aria-label={`${pageInfo?.label || '当前页面'}状态切换`}>
        <div ref={stateScrollerRef}>
          {stateOptions.map((state) => (
            <button key={state.id} className={activeState === state.id ? 'active' : ''} onClick={() => setActiveState(state.id)}>{state.label}</button>
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}
