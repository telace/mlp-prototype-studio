import { useEffect, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function AnnotationLayer({ mode, annotations, onCreate, onSelect, selectedId, onRequestElementDeletion }) {
  const [, rerender] = useState(0);

  useEffect(() => {
    const refresh = () => rerender((value) => value + 1);
    const phone = document.querySelector('.phone');
    const screen = phone?.querySelector(':scope > .screen');
    window.addEventListener('resize', refresh);
    screen?.addEventListener('scroll', refresh, { passive: true });
    return () => {
      window.removeEventListener('resize', refresh);
      screen?.removeEventListener('scroll', refresh);
    };
  }, [mode]);

  const getMarkerPosition = (annotation) => {
    const phone = document.querySelector('.phone');
    const screen = phone?.querySelector(':scope > .screen');
    if (!phone) return { x: annotation.x, y: annotation.y, visible: true };
    const phoneRect = phone.getBoundingClientRect();
    const scale = phoneRect.width / 375 || 1;
    if (annotation.anchorType === 'element' && annotation.elementId) {
      const nodes = [...phone.querySelectorAll('[data-interaction-id]')];
      const target = nodes.find((node) => node.dataset.interactionId === annotation.elementId && node.getBoundingClientRect().width > 0);
      if (target) {
        const rect = target.getBoundingClientRect();
        return { x: (rect.right - phoneRect.left) / scale, y: (rect.top - phoneRect.top) / scale, visible: true };
      }
      return { x: annotation.x, y: annotation.y, visible: false };
    }
    if (annotation.coordinateSpace === 'content' && screen) {
      const screenRect = screen.getBoundingClientRect();
      const y = (screenRect.top - phoneRect.top) / scale + annotation.y - screen.scrollTop;
      return { x: annotation.x, y, visible: y >= 0 && y <= 812 };
    }
    return { x: annotation.x, y: annotation.y, visible: true };
  };

  const handleClick = (event) => {
    if (event.target.closest('.annotation-marker')) return;
    event.preventDefault();
    event.stopPropagation();
    const phone = event.currentTarget.closest('.phone');
    const phoneRect = phone.getBoundingClientRect();
    const scale = phoneRect.width / 375 || 1;
    const screen = phone.querySelector(':scope > .screen');
    const screenRect = screen?.getBoundingClientRect();
    const point = {
      x: clamp((event.clientX - phoneRect.left) / scale, 0, 375),
      y: clamp((event.clientY - phoneRect.top) / scale, 0, 812)
    };

    if (mode === 'element' || mode === 'delete-element') {
      const target = document.elementsFromPoint(event.clientX, event.clientY)
        .map((node) => node.closest?.('[data-interaction-id]'))
        .find((node) => node && phone.contains(node));
      if (!target) {
        return;
      }
      if (mode === 'delete-element') {
        onRequestElementDeletion?.({
          elementId: target.dataset.interactionId,
          title: target.getAttribute('aria-label') || target.textContent?.trim().slice(0, 40) || target.dataset.interactionId
        });
        return;
      }
      const rect = target.getBoundingClientRect();
      onCreate({
        anchorType: 'element',
        coordinateSpace: 'viewport',
        elementId: target.dataset.interactionId,
        x: clamp((rect.right - phoneRect.left) / scale, 0, 375),
        y: clamp((rect.top - phoneRect.top) / scale, 0, 812),
        title: target.getAttribute('aria-label') || target.textContent?.trim().slice(0, 30) || target.dataset.interactionId
      });
      return;
    }

    const insideScreen = screenRect && event.clientY >= screenRect.top && event.clientY <= screenRect.bottom;
    onCreate({
      anchorType: 'coordinate',
      coordinateSpace: insideScreen ? 'content' : 'viewport',
      x: point.x,
      y: insideScreen ? (event.clientY - screenRect.top) / scale + screen.scrollTop : point.y,
      title: '自由标注'
    });
  };

  return (
    <div className={'annotation-layer annotation-layer--' + mode} onClick={mode === 'preview' ? undefined : handleClick} aria-label="原型标注层">
      {annotations.map((annotation, index) => {
        const position = getMarkerPosition(annotation);
        if (!position.visible) return null;
        return (
          <button
            key={annotation.id}
            type="button"
            className={'annotation-marker' + (selectedId === annotation.id ? ' active' : '')}
            style={{ left: position.x, top: position.y }}
            title={annotation.title}
            onClick={(event) => { event.stopPropagation(); onSelect(annotation); }}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
