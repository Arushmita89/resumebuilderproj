import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';
import AuthShell, { PasswordInput } from '../components/AuthShell';
import { Alert, Button, Checkbox, Field, Input } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('reason') === 'expired';

  useEffect(() => {
    document.title = 'Login — ResumeBuilder';
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || '/', { replace: true });
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
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </>
      }
    >
      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-sub">Login to continue building and analyzing your resumes.</p>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {!error && expired ? <Alert tone="info" title="Session expired">Your session is no longer valid. Please log in again.</Alert> : null}

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

        <Field label="Password" htmlFor="password" required>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </Field>

        <div className="auth-options">
          <Checkbox
            label="Remember me"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <Link to="/forgot-password" className="link-btn">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="btn-block" size="lg" loading={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </Button>
      </form>

      <div className="auth-divider">or</div>

      <Button
        variant="secondary"
        className="btn-block"
        icon="userPlus"
        onClick={() => navigate('/signup')}
      >
        Create a new account
      </Button>
    </AuthShell>
  );
}