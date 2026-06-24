import { useEffect, useState } from 'react';
import { getVisibleInteractionSource } from './interaction.js';

export default function ConnectorOverlay({ activeInteraction }) {
  const [line, setLine] = useState(null);

  useEffect(() => {
    let frame = null;

    const updateLine = () => {
      if (!activeInteraction || typeof document === 'undefined') {
        setLine(null);
        return;
      }

      const source = getVisibleInteractionSource(activeInteraction);
      const target = document.getElementById(`interaction-${activeInteraction}`);

      if (!source || !target) {
        setLine(null);
        return;
      }

      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const startX = sourceRect.right;
      const startY = sourceRect.top + sourceRect.height / 2;
      const endX = targetRect.left;
      const endY = targetRect.top + targetRect.height / 2;
      const controlGap = Math.max(36, Math.min(120, Math.abs(endX - startX) / 2));

      setLine({
        startX,
        startY,
        endX,
        endY,
        path: `M ${startX} ${startY} C ${startX + controlGap} ${startY}, ${endX - controlGap} ${endY}, ${endX} ${endY}`
      });
    };

    const scheduleUpdate = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateLine);
    };

    scheduleUpdate();
    const timers = [window.setTimeout(scheduleUpdate, 180), window.setTimeout(scheduleUpdate, 420)];
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
    };
  }, [activeInteraction]);

  if (!line) return null;

  return (
    <svg className="interaction-connector-layer" aria-hidden="true">
      <path className="interaction-connector-path" d={line.path} />
      <circle className="interaction-connector-dot source" cx={line.startX} cy={line.startY} r="4" />
      <circle className="interaction-connector-dot target" cx={line.endX} cy={line.endY} r="4" />
    </svg>
  );
}

