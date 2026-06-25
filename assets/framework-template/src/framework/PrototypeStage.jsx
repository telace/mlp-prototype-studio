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
    activeButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    if (!scroller || !activeButton) return undefined;
    const keepActiveButtonVisible = () => {
      const scrollerRect = scroller.getBoundingClientRect();
      const activeRect = activeButton.getBoundingClientRect();
      let nextLeft = scroller.scrollLeft;
      if (activeRect.left < scrollerRect.left + 6) {
        nextLeft -= (scrollerRect.left + 6) - activeRect.left;
      }
      if (activeRect.right > scrollerRect.right - 6) {
        nextLeft += activeRect.right - (scrollerRect.right - 6);
      }
      scroller.scrollTo({ left: Math.max(0, nextLeft), behavior: 'auto' });
    };
    const frame = window.requestAnimationFrame(keepActiveButtonVisible);
    const timer = window.setTimeout(keepActiveButtonVisible, 360);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
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
