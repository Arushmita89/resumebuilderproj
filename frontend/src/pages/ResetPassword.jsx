import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api';
import AuthShell, { PasswordInput } from '../components/AuthShell';
import { Alert, Button, Field } from '../components/ui';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Set a New Password — ResumeBuilder';
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password, confirm);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      footer={
        <>
          Remembered it? <Link to="/login">Back to Login</Link>
        </>
      }
    >
      <h1 className="auth-title">Set a new password</h1>
      <p className="auth-sub">Choose a new password for your ResumeBuilder account.</p>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {!token ? (
        <Alert tone="error" title="Missing reset link">
          This page needs a valid reset link. Request a new one from the login screen.
        </Alert>
      ) : null}

      {done ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Alert tone="success" title="Password updated">
            Your password has been changed. You can now log in with your new password.
          </Alert>
          <Button variant="primary" className="btn-block" size="lg" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <Field label="New Password" htmlFor="password" hint="Minimum 8 characters." required>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a new password"
              autoComplete="new-password"
              required
            />
          </Field>

          <Field label="Confirm Password" htmlFor="confirm" required>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              required
            />
          </Field>

          <Button type="submit" className="btn-block" size="lg" loading={loading} disabled={!token}>
            {loading ? 'Updating…' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
