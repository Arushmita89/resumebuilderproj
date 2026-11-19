import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import AuthShell from '../components/AuthShell';
import { Alert, Button, Field, Input } from '../components/ui';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Forgot Password — ResumeBuilder';
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      setResult(await authApi.forgotPassword(email.trim()));
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
      <h1 className="auth-title">Reset your password</h1>
      <p className="auth-sub">Enter the email address you registered with to generate a reset link.</p>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {result.resetUrl ? (
            <Alert tone="success" title="Reset link generated">
              Email delivery is not configured in this project, so the link is shown here instead. It
              expires in {result.expiresInMinutes} minutes and can be used once.
            </Alert>
          ) : (
            <Alert tone="info" title="Check your inbox">
              If an account exists for {email.trim()}, a reset link has been generated for it.
            </Alert>
          )}
          <Button
            variant={result.resetUrl ? 'primary' : 'secondary'}
            className="btn-block"
            size="lg"
            iconRight="arrowRight"
            onClick={() => navigate(result.resetUrl || '/login')}
          >
            {result.resetUrl ? 'Continue to set a new password' : 'Back to Login'}
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <Field label="Email Address" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </Field>

          <Button type="submit" className="btn-block" size="lg" loading={loading}>
            {loading ? 'Generating link…' : 'Send Reset Link'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
