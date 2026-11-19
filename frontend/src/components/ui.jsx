import React from 'react';
import Icon from './Icon';

export function Button({
  variant = 'primary',
  size,
  icon,
  iconRight,
  loading,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} {...rest} disabled={loading || rest.disabled}>
      {loading ? <span className="spinner" /> : icon ? <Icon name={icon} size={15} /> : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={15} /> : null}
    </button>
  );
}

export function Card({ children, className = '', hover, ...rest }) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHead({ title, subtitle, actions, icon }) {
  return (
    <div className="card-head">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {icon ? (
          <span style={{ color: 'var(--blue-600)', display: 'grid', placeItems: 'center' }}>
            <Icon name={icon} size={17} />
          </span>
        ) : null}
        <div style={{ minWidth: 0 }}>
          <h2>{title}</h2>
          {subtitle ? <div className="small muted">{subtitle}</div> : null}
        </div>
      </div>
      {actions ? <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div> : null}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

const BADGE_TONE = {
  DRAFT: 'gray',
  ANALYZED: 'blue',
  COMPLETED: 'green',
  COMPLETE: 'green',
  GOOD: 'green',
  NEEDS_IMPROVEMENT: 'amber',
  MISSING: 'red'
};

export function StatusBadge({ status }) {
  const label = String(status || 'DRAFT')
    .toLowerCase()
    .replace(/_/g, ' ');
  return <span className={`badge badge-${BADGE_TONE[status] || 'gray'}`}>{label}</span>;
}

export function Badge({ tone = 'gray', icon, children }) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon ? <Icon name={icon} size={12} /> : null}
      {children}
    </span>
  );
}

export function StatusText({ status }) {
  if (status === 'COMPLETE' || status === 'GOOD') {
    return (
      <span className="status-good">
        <span className="status-dot dot-green" />
        {status === 'COMPLETE' ? 'Complete' : 'Good'}
      </span>
    );
  }
  if (status === 'NEEDS_IMPROVEMENT') {
    return (
      <span className="status-warn">
        <span className="status-dot dot-amber" />
        Needs Improvement
      </span>
    );
  }
  return (
    <span className="status-bad">
      <span className="status-dot dot-red" />
      Missing
    </span>
  );
}

export function Field({ label, hint, required, error, htmlFor, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      {label ? (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required ? <span className="req">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <div className="field-hint" style={{ color: 'var(--red-600)' }}>{error}</div> : null}
      {!error && hint ? <div className="field-hint">{hint}</div> : null}
    </div>
  );
}

export function Input(props) {
  const { className = '', ...rest } = props;
  return <input className={`input ${className}`} {...rest} />;
}

export function Textarea({ className = '', ...rest }) {
  return <textarea className={`textarea ${className}`} {...rest} />;
}

export function Select({ options = [], className = '', ...rest }) {
  return (
    <select className={`select ${className}`} {...rest}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({ label, ...rest }) {
  return (
    <label className="checkbox">
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export function Alert({ tone = 'info', title, icon, children }) {
  const fallback = { error: 'alert', success: 'checkCircle', warn: 'alert', info: 'info', plain: 'info' };
  return (
    <div className={`alert alert-${tone}`}>
      <Icon name={icon || fallback[tone] || 'info'} size={16} />
      <div>
        {title ? <strong className="alert-title">{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}

export function TableWrap({ children }) {
  return <div className="table-wrap">{children}</div>;
}

export function EmptyState({ icon = 'file', title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} size={22} />
      </div>
      <div className="empty-title">{title}</div>
      {text ? <p className="empty-text">{text}</p> : null}
      {action}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === value}
          className={`tab ${tab.key === value ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.icon ? <Icon name={tab.icon} size={15} /> : null}
          {tab.label}
          {tab.count !== undefined ? <span className="tab-count">{tab.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, tone }) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="progress-track progress-thin">
      <div className={`progress-fill ${tone || ''}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Metric({ icon, label, value, note, tone }) {
  return (
    <div className="card metric">
      <div className="metric-label">
        {icon ? <Icon name={icon} size={13} /> : null}
        {label}
      </div>
      <div className="metric-value" style={tone ? { color: tone } : undefined}>
        {value}
      </div>
      {note ? <div className="metric-note">{note}</div> : null}
    </div>
  );
}

export function scoreTone(score) {
  if (score === null || score === undefined) return 'gray';
  if (score >= 85) return 'green';
  if (score >= 70) return 'amber';
  return 'red';
}

export function ScoreRing({ score, size = 128 }) {
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const tone = score === null || score === undefined ? '' : pct >= 85 ? 'ring-good' : pct >= 70 ? 'ring-warn' : 'ring-bad';
  const color =
    score === null || score === undefined
      ? 'var(--slate-400)'
      : pct >= 85
        ? 'var(--green-700)'
        : pct >= 70
          ? 'var(--amber-700)'
          : 'var(--red-700)';
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`score-ring ${tone}`} style={{ '--size': `${size}px` }}>
      <svg className="score-ring-svg" viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <circle className="score-ring-track" cx="50" cy="50" r={radius} />
        <circle
          className="score-ring-arc"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
        />
      </svg>
      <div className="score-ring-inner">
        <div className="score-ring-value" style={{ color }}>
          {score === null || score === undefined ? '—' : `${score}%`}
        </div>
        <div className="score-ring-label">Score</div>
      </div>
    </div>
  );
}

export function Trend({ current, previous }) {
  if (previous === null || previous === undefined || current === null || current === undefined) {
    return null;
  }
  const delta = current - previous;
  if (delta > 0) {
    return (
      <span className="trend-up">
        <Icon name="trendingUp" size={14} />+{delta} points
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="trend-down">
        <Icon name="chevronDown" size={14} />
        {delta} points
      </span>
    );
  }
  return (
    <span className="trend-flat">
      <Icon name="minus" size={14} />No change
    </span>
  );
}

export function PageHead({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="page-head">
      <div style={{ minWidth: 0 }}>
        {breadcrumb ? <div className="topbar-breadcrumb mb-12">{breadcrumb}</div> : null}
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

export function Initials({ name = '', size = '' }) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return <div className={`avatar ${size}`}>{initials || '?'}</div>;
}