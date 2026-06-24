import { useEffect, useRef } from 'react';
import { getStateOptions, pageDirectory } from '../project/project-data.js';

export default function PrototypeStage({ children, page, activeState, setActiveState, setActiveInteraction }) {
  const pageInfo = pageDirectory.find((item) => item.id === page);
  const stateOptions = getStateOptions(page);
  const stateScrollerRef = useRef(null);

  useEffect(() => {
    const activeButton = stateScrollerRef.current?.querySelector('button.active');
    activeButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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

