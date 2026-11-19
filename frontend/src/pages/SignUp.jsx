import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import AuthShell, { PasswordInput } from '../components/AuthShell';
import { Alert, Button, Checkbox, Field, Input } from '../components/ui';

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Sign Up — ResumeBuilder';
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
    if (!terms) {
      setError('Please accept the terms to continue.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      navigate('/', { replace: true });
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
          Already have an account? <Link to="/login">Login</Link>
        </>
      }
    >
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-sub">Start building ATS-friendly resumes in a few minutes.</p>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <form onSubmit={submit} noValidate>
        <Field label="Full Name" htmlFor="fullName" required>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Arushmita Singh"
            autoComplete="name"
            required
          />
        </Field>

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

        <Field label="Password" htmlFor="password" hint="Minimum 8 characters." required>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
        </Field>

        <Field label="Confirm Password" htmlFor="confirm" required>
          <PasswordInput
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />
        </Field>

        <div className="auth-options">
          <Checkbox
            label="I agree to the terms of use"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          />
        </div>

        <Button type="submit" className="btn-block" size="lg" loading={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </Button>
      </form>
    </AuthShell>
  );
}