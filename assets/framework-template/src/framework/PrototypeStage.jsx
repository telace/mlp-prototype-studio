import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Check, Copy, Loader2 } from 'lucide-react';
import { getStateOptions, pageDirectory } from '../project/project-data.js';

export default function PrototypeStage({ children, page, activeState, setActiveState, setActiveInteraction }) {
  const pageInfo = pageDirectory.find((item) => item.id === page);
  const stateOptions = getStateOptions(page);
  const stateScrollerRef = useRef(null);
  const stageRef = useRef(null);
  const [copyState, setCopyState] = useState('idle');

  const copyPrototypeScreenshot = async () => {
    const phone = stageRef.current?.querySelector('.phone');
    if (!phone || copyState === 'copying') return;
    setCopyState('copying');
    const expandableNodes = [...phone.querySelectorAll('*')].filter((node) => {
      const style = window.getComputedStyle(node);
      return /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
    });
    const expansionContainers = [...new Set(expandableNodes.flatMap((node) => {
      const ancestors = [];
      for (let parent = node.parentElement; parent && parent !== phone; parent = parent.parentElement) ancestors.push(parent);
      return ancestors;
    }))];
    expandableNodes.forEach((node) => node.setAttribute('data-mlp-screenshot-expand', ''));
    expansionContainers.forEach((node) => node.setAttribute('data-mlp-screenshot-container', ''));
    try {
      const canvas = await html2canvas(phone, {
        backgroundColor: null,
        scale: 1,
        width: 375,
        useCORS: true,
        logging: false,
        onclone: (clonedDocument) => {
          const clonedPhone = clonedDocument.querySelector('.phone');
          if (!clonedPhone) return;
          Object.assign(clonedPhone.style, {
            width: '375px',
            height: 'auto',
            minHeight: '812px',
            borderRadius: '0',
            overflow: 'visible',
            background: 'var(--app-bg)'
          });
          clonedPhone.querySelector('.annotation-layer')?.style.setProperty('display', 'none');
          clonedPhone.querySelectorAll('[data-mlp-screenshot-expand]').forEach((node) => {
            Object.assign(node.style, {
              height: 'auto',
              maxHeight: 'none',
              overflowY: 'visible'
            });
          });
          clonedPhone.querySelectorAll('[data-mlp-screenshot-container]').forEach((node) => {
            Object.assign(node.style, {
              height: 'auto',
              maxHeight: 'none',
              overflow: 'visible'
            });
          });
        }
      });
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Screenshot encoding failed')), 'image/png');
      });
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
        throw new Error('Image clipboard is unavailable');
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 2200);
    } finally {
      expandableNodes.forEach((node) => node.removeAttribute('data-mlp-screenshot-expand'));
      expansionContainers.forEach((node) => node.removeAttribute('data-mlp-screenshot-container'));
    }
  };

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
    <section ref={stageRef} className="phone-stage" aria-label="移动端原型">
      <div className="prototype-stage-toolbar">
        <div className="prototype-state-switch" aria-label={`${pageInfo?.label || '当前页面'}状态切换`}>
          <div ref={stateScrollerRef}>
            {stateOptions.map((state) => (
              <button key={state.id} className={activeState === state.id ? 'active' : ''} onClick={() => setActiveState(state.id)}>{state.label}</button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={`prototype-copy-button is-${copyState}`}
          aria-label={copyState === 'copied' ? '页面截图已复制' : copyState === 'error' ? '复制页面截图失败' : '复制页面截图'}
          title={copyState === 'copied' ? '已复制' : copyState === 'error' ? '复制失败，请确认浏览器剪贴板权限' : '复制页面截图'}
          onClick={copyPrototypeScreenshot}
          disabled={copyState === 'copying'}
        >
          {copyState === 'copying' ? <Loader2 className="spin" size={17} /> : copyState === 'copied' ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>
      {children}
    </section>
  );
}
