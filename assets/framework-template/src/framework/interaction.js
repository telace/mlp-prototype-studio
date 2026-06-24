export function bindInteraction(id, setActiveInteraction) {
  if (!setActiveInteraction) return {};
  return {
    'data-interaction-id': id,
    onMouseEnter: () => setActiveInteraction(id),
    onFocus: () => setActiveInteraction(id),
    onMouseLeave: () => setActiveInteraction(null),
    onBlur: () => setActiveInteraction(null)
  };
}

export function getVisibleInteractionSource(id) {
  if (typeof document === 'undefined' || !id) return null;
  const nodes = Array.from(document.querySelectorAll('[data-interaction-id]'));
  return nodes.find((node) => {
    if (node.getAttribute('data-interaction-id') !== id) return false;
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
  }) || null;
}

