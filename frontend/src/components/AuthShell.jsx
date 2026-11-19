import React from 'react';
import { Link } from 'react-router-dom';
import { BrandMark } from './Layout';

export default function AuthShell({ children, footer }) {
  return (
    <div className="center-page" style={{ flexDirection: 'column', gap: 22 }}>
      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <BrandMark />
            <span className="brand-name">
              Resume<span>Builder</span>
            </span>
          </Link>
        </div>
        <div className="card card-pad" style={{ padding: 28 }}>
          {children}
        </div>
        <div className="auth-foot">{footer}</div>
      </div>
      <p className="small muted" style={{ textAlign: 'center', maxWidth: 420 }}>
        Automated Resume Builder with Resume Analysis — React + Spring Boot final-year project.
      </p>
    </div>
  );
}

export function PasswordInput({ ...rest }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="password-field">
      <input {...rest} type={visible ? 'text' : 'password'} className="input" />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {visible ? (
            <>
              <path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.4 0 10 6 10 6a18.4 18.4 0 0 1-2.2 3.2" />
              <path d="M6.2 6.4A18.4 18.4 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.6-1.1" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
              <path d="m2 2 20 20" />
            </>
          ) : (
            <>
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}