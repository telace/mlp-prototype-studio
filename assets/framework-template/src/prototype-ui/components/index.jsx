import {
  ChevronLeft,
  ImagePlus,
  Loader2,
  Search,
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

export function Button({ children, variant = 'primary', size = 'md', block = false, icon, iconRight, loading = false, ...props }) {
  return (
    <button {...props} className={cx('mlp-button', `mlp-button--${variant}`, `mlp-button--${size}`, block && 'mlp-button--block')} aria-busy={loading || undefined} disabled={loading || props.disabled}>
      {loading ? <Loader2 className="mlp-button__spinner spin" size={16} /> : icon ? <span className="mlp-button__icon">{icon}</span> : null}
      <span className="mlp-button__label">{loading ? '处理中' : children}</span>
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

export function Pressable({ children, className, ...props }) {
  return <button type="button" className={cx('mlp-pressable', className)} {...props}>{children}</button>;
}

export function TextInput({ className, ...props }) {
  return <input className={cx('mlp-text-input', className)} {...props} />;
}

export function TextArea({ className, ...props }) {
  return <textarea className={cx('mlp-text-area', className)} {...props} />;
}

export function Checkbox({ label, className, ...props }) {
  return (
    <label className={cx('mlp-checkbox', className)}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
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

export function PageScaffold({ children, topBar, bottomBar, className, ...props }) {
  return <div className={cx('app-page', 'mlp-page-scaffold', className)} {...props}>{topBar ? <div className="mlp-page-scaffold__top">{topBar}</div> : null}<main className="mlp-page-scaffold__content">{children}</main>{bottomBar ? <div className="mlp-page-scaffold__bottom">{bottomBar}</div> : null}</div>;
}

export function ScrollablePageWithActions({ children, primaryAction, secondaryAction, actions, actionLayout, actionBarClassName, className, ...props }) {
  const legacyActions = primaryAction == null && secondaryAction == null ? actions : null;
  const layout = actionLayout || (secondaryAction ? 'dual' : 'single');
  const actionContent = legacyActions || <>{secondaryAction}{primaryAction}</>;
  return <PageScaffold className={cx('mlp-scroll-actions', className)} bottomBar={<ActionBar layout={layout} className={actionBarClassName}>{actionContent}</ActionBar>} {...props}>{children}</PageScaffold>;
}

export function ActionBar({ children, layout = 'auto', className }) {
  return <div className={cx('mlp-action-bar', `mlp-action-bar--${layout}`, className)}>{children}</div>;
}

export function FormSection({ title, description, action, children, className, ...props }) {
  return <section className={cx('mlp-form-section', className)} {...props}>{title || description || action ? <header className="mlp-section-head"><div>{title ? <strong>{title}</strong> : null}{description ? <p>{description}</p> : null}</div>{action}</header> : null}<div className="mlp-form-section__body">{children}</div></section>;
}

export function SelectionChips({ options = [], value = [], multiple = false, onChange, label = '选项', disabled = false, readOnly = false, ...props }) {
  const selected = new Set(Array.isArray(value) ? value : [value]);
  const choose = (id) => onChange?.(multiple ? (selected.has(id) ? [...selected].filter((item) => item !== id) : [...selected, id]) : id);
  return <div className="mlp-selection-chips" role="group" aria-label={label} data-read-only={readOnly || undefined} {...props}>{options.map((option) => <button key={option.id} type="button" className={selected.has(option.id) ? 'active' : ''} aria-pressed={selected.has(option.id)} disabled={disabled || readOnly || option.disabled} onClick={() => choose(option.id)}>{option.label}</button>)}</div>;
}

export function SurfaceCard({ children, selected = false, interactive = false, className, ...props }) {
  const Tag = interactive ? 'button' : 'section';
  return <Tag className={cx('mlp-surface-card', selected && 'selected', interactive && 'interactive', className)} {...props}>{children}</Tag>;
}

export function CardTitle({ children, className, ...props }) {
  return <strong className={cx('mlp-card-title', className)} {...props}>{children}</strong>;
}

export function CardBody({ children, className, ...props }) {
  return <p className={cx('mlp-card-body', className)} {...props}>{children}</p>;
}

export function CardMeta({ children, className, ...props }) {
  return <span className={cx('mlp-card-meta', className)} {...props}>{children}</span>;
}

export function MediaCard({ src, alt = '', title, subtitle, meta, badge, ratio = '3 / 4', selected = false, onClick, className, ...props }) {
  return <SurfaceCard interactive selected={selected} className={cx('mlp-media-card', className)} onClick={onClick} {...props}><div className="mlp-media-card__media" style={{ '--mlp-media-ratio': ratio }}>{src ? <img src={src} alt={alt} /> : <PlaceholderImage ratio={ratio} />}{badge ? <Badge>{badge}</Badge> : null}</div><div className="mlp-media-card__copy"><strong title={title}>{title}</strong>{subtitle ? <span title={subtitle}>{subtitle}</span> : null}{meta ? <small>{meta}</small> : null}</div></SurfaceCard>;
}

export function SettingsRow({ icon, title, description, value, trailing, onClick, disabled = false, className, ...props }) {
  const Tag = onClick ? 'button' : 'div';
  return <Tag className={cx('mlp-settings-row', onClick && 'interactive', className)} onClick={onClick} disabled={onClick ? disabled : undefined} {...props}>{icon ? <span className="mlp-settings-row__icon">{icon}</span> : null}<span className="mlp-settings-row__copy"><strong>{title}</strong>{description ? <small>{description}</small> : null}</span>{value ? <span className="mlp-settings-row__value">{value}</span> : null}{trailing}</Tag>;
}

export function Switch({ checked = false, onChange, label, disabled = false, ...props }) {
  return <label className="mlp-switch"><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked)} {...props} /><span className="mlp-switch__track"><span /></span>{label ? <span className="mlp-switch__label">{label}</span> : null}</label>;
}

export function Badge({ children, tone = 'neutral', className }) {
  return <span className={cx('mlp-badge', `mlp-badge--${tone}`, className)}>{children}</span>;
}

export function SearchField({ value, onChange, placeholder = '搜索', disabled = false, ...props }) {
  return <label className="mlp-search-field"><Search size={16} /><input value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} {...props} /></label>;
}

export function ProgressBar({ value = 0, max = 100, label, showValue = false, className }) {
  const percent = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return <div className={cx('mlp-progress', className)}>{label || showValue ? <div className="mlp-progress__label"><span>{label}</span>{showValue ? <span>{Math.round(percent)}%</span> : null}</div> : null}<div className="mlp-progress__track" role="progressbar" aria-valuemin="0" aria-valuemax={max} aria-valuenow={value}><span style={{ width: `${percent}%` }} /></div></div>;
}
