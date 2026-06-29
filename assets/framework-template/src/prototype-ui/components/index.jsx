import {
  ChevronLeft,
  ImagePlus,
  Loader2,
  X
} from 'lucide-react';

const cx = (...classes) => classes.filter(Boolean).join(' ');

export function PhonePage({ children, className, variant = 'default', padded = true, scroll = true, ...props }) {
  return (
    <div className={cx('mlp-phone-page', `mlp-phone-page--${variant}`, padded && 'mlp-phone-page--padded', scroll && 'mlp-phone-page--scroll', className)} {...props}>
      {children}
    </div>
  );
}

export function TopBar({ title, onBack, left, right, className, backLabel = '返回' }) {
  return (
    <div className={cx('mlp-topbar', className)}>
      <div className="mlp-topbar__side">
        {left || (onBack ? (
          <IconButton icon={<ChevronLeft size={20} />} label={backLabel} onClick={onBack} />
        ) : null)}
      </div>
      <strong className="mlp-topbar__title">{title}</strong>
      <div className="mlp-topbar__side mlp-topbar__side--right">{right}</div>
    </div>
  );
}

export function BottomTabBar({ tabs = [], active, onChange, className }) {
  return (
    <nav className={cx('mlp-bottom-tabbar', className)} aria-label="底部导航">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        const Icon = tab.icon;
        return (
          <button key={tab.id} className={cx('mlp-bottom-tabbar__item', selected && 'active')} onClick={() => onChange?.(tab.id)} aria-current={selected ? 'page' : undefined}>
            {tab.iconNode || (Icon ? <Icon size={18} /> : null)}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function Button({ children, variant = 'primary', size = 'md', block = false, icon, iconRight, className, ...props }) {
  return (
    <button className={cx('mlp-button', `mlp-button--${variant}`, `mlp-button--${size}`, block && 'mlp-button--block', className)} {...props}>
      {icon ? <span className="mlp-button__icon">{icon}</span> : null}
      <span>{children}</span>
      {iconRight ? <span className="mlp-button__icon">{iconRight}</span> : null}
    </button>
  );
}

export function IconButton({ icon, label, className, ...props }) {
  return (
    <button className={cx('mlp-icon-button', className)} aria-label={label} title={label} {...props}>
      {icon}
    </button>
  );
}

export function SegmentedControl({ options = [], value, onChange, className, ariaLabel = '分段控制' }) {
  return (
    <div className={cx('mlp-segmented', className)} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button key={option.value} className={selected ? 'active' : ''} onClick={() => onChange?.(option.value)} aria-pressed={selected}>
            {option.icon ? <span>{option.icon}</span> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ChipScroller({ chips = [], active, onChange, className, ariaLabel = '选项' }) {
  return (
    <div className={cx('mlp-chip-scroller', className)} aria-label={ariaLabel}>
      {chips.map((chip) => {
        const selected = chip.id === active;
        return (
          <button key={chip.id} className={selected ? 'active' : ''} onClick={() => onChange?.(chip.id)} aria-pressed={selected}>
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

export function PlaceholderImage({ ratio = '3 / 4', tone = 0, video = false, icon, className, children, ...props }) {
  return (
    <div className={cx('mlp-placeholder-image', `tone-${tone}`, className)} style={{ '--mlp-placeholder-ratio': ratio }} {...props}>
      {video || icon ? <span className={cx('mlp-placeholder-image__icon', video && !icon && 'is-video')} aria-hidden={video && !icon ? 'true' : undefined}>{icon || null}</span> : null}
      {children}
    </div>
  );
}

export function TemplateCard({ title, subtitle, selected = false, video = false, ratio = '3 / 4', tone = 0, onClick, className, ...props }) {
  return (
    <button className={cx('mlp-template-card', selected && 'selected', className)} onClick={onClick} {...props}>
      <PlaceholderImage ratio={ratio} tone={tone} video={video} />
      <strong>{title}</strong>
      {subtitle ? <span>{subtitle}</span> : null}
    </button>
  );
}

export function FormField({ label, helper, action, error, className, children, ...props }) {
  return (
    <label className={cx('mlp-form-field', error && 'has-error', className)} {...props}>
      <span className="mlp-form-field__label">{label}</span>
      <div className="mlp-form-field__control">
        {children}
        {action ? <span className="mlp-form-field__action">{action}</span> : null}
      </div>
      {error || helper ? <span className="mlp-form-field__helper">{error || helper}</span> : null}
    </label>
  );
}

export function BottomSheet({ open = true, title, children, actions, onClose, className }) {
  if (!open) return null;
  return (
    <div className={cx('mlp-layer', 'mlp-bottom-sheet-layer', className)} role="presentation">
      <button className="mlp-layer__scrim" onClick={onClose} aria-label="关闭" />
      <section className="mlp-bottom-sheet" role="dialog" aria-modal="true" aria-label={title || '底部面板'}>
        <div className="mlp-bottom-sheet__handle" />
        {title ? (
          <header className="mlp-bottom-sheet__head">
            <strong>{title}</strong>
            {onClose ? <IconButton icon={<X size={18} />} label="关闭" onClick={onClose} /> : null}
          </header>
        ) : null}
        <div className="mlp-bottom-sheet__body">{children}</div>
        {actions ? <footer className="mlp-bottom-sheet__actions">{actions}</footer> : null}
      </section>
    </div>
  );
}

export function Modal({ open = true, title, description, children, actions, onClose, className }) {
  if (!open) return null;
  return (
    <div className={cx('mlp-layer', 'mlp-modal-layer', className)} role="presentation">
      <button className="mlp-layer__scrim" onClick={onClose} aria-label="关闭" />
      <section className="mlp-modal" role="dialog" aria-modal="true" aria-label={title || '弹窗'}>
        {onClose ? <IconButton className="mlp-modal__close" icon={<X size={18} />} label="关闭" onClick={onClose} /> : null}
        {title ? <strong className="mlp-modal__title">{title}</strong> : null}
        {description ? <p className="mlp-modal__description">{description}</p> : null}
        {children ? <div className="mlp-modal__body">{children}</div> : null}
        {actions ? <footer className="mlp-modal__actions">{actions}</footer> : null}
      </section>
    </div>
  );
}

export function Toast({ open = true, children, position = 'top', className }) {
  if (!open) return null;
  return (
    <div className={cx('mlp-toast', `mlp-toast--${position}`, className)} role="status">
      {children}
    </div>
  );
}

export function EmptyState({ icon, title = '暂无内容', description, action, className }) {
  return (
    <section className={cx('mlp-state', 'mlp-empty-state', className)}>
      <div className="mlp-state__icon">{icon || <ImagePlus size={28} />}</div>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action ? <div className="mlp-state__action">{action}</div> : null}
    </section>
  );
}

export function LoadingState({ title = '加载中', description, className }) {
  return (
    <section className={cx('mlp-state', 'mlp-loading-state', className)}>
      <div className="mlp-state__icon"><Loader2 size={28} className="spin" /></div>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </section>
  );
}
