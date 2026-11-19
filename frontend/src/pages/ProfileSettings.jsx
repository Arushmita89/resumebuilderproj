import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../auth';
import Icon from '../components/Icon';
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  PageHead
} from '../components/ui';

const THEMES = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'settings' }
];

const MIN_PASSWORD = 8;

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, theme, setTheme } = useAuth();

  const [fullName, setFullName] = useState('');
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    document.title = 'Profile Settings — ResumeBuilder';
  }, []);

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
  }, [user]);

  const nameChanged = fullName.trim() !== (user?.fullName || '') && fullName.trim().length > 0;

  async function saveProfile() {
    setProfileBusy(true);
    setProfileMessage(null);
    try {
      await updateProfile(fullName.trim());
      setProfileMessage({ tone: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMessage({ tone: 'error', text: err.message });
    } finally {
      setProfileBusy(false);
    }
  }

  const passwordProblems = [];
  if (newPassword && newPassword.length < MIN_PASSWORD) {
    passwordProblems.push(`New password must be at least ${MIN_PASSWORD} characters.`);
  }
  if (confirmPassword && newPassword !== confirmPassword) {
    passwordProblems.push('New passwords do not match.');
  }

  async function savePassword(event) {
    event.preventDefault();
    if (!currentPassword || !newPassword || passwordProblems.length) return;
    setPasswordBusy(true);
    setPasswordMessage(null);
    try {
      await authApi.changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({
        tone: 'success',
        text: 'Password changed. Use it the next time you sign in.'
      });
    } catch (err) {
      setPasswordMessage({ tone: 'error', text: err.message });
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 920 }}>
      <PageHead
        title="Profile Settings"
        subtitle="Manage your account details, appearance and password."
      />

      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <div className="stack">
          <Card>
            <div className="card-head">
              <h2>Personal Information</h2>
            </div>
            <div className="card-body">
              <div className="profile-row">
                <span className="avatar avatar-lg">
                  {(user?.fullName || '?')
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase()}
                </span>
                <div>
                  <div style={{ fontWeight: 650 }}>{user?.fullName}</div>
                  <div className="small muted">{user?.email}</div>
                </div>
              </div>

              {profileMessage ? (
                <div className="mt-12">
                  <Alert tone={profileMessage.tone}>{profileMessage.text}</Alert>
                </div>
              ) : null}

              <Field
                label="Full Name"
                required
                hint="This appears in the sidebar and on your resumes by default."
                className="mt-16"
              >
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aarush Kumar"
                  maxLength={120}
                />
              </Field>

              <Field label="Email Address" hint="Your sign-in email cannot be changed.">
                <Input value={user?.email || ''} disabled />
              </Field>

              <Button
                icon="save"
                onClick={saveProfile}
                loading={profileBusy}
                disabled={!nameChanged}
              >
                Save Changes
              </Button>
            </div>
          </Card>

          <Card>
            <div className="card-head">
              <h2>Appearance</h2>
            </div>
            <div className="card-body">
              <div className="subhead mb-8">Theme</div>
              <div className="theme-options">
                {THEMES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`theme-option ${theme === option.value ? 'active' : ''}`}
                    onClick={() => setTheme(option.value)}
                  >
                    <Icon name={option.icon} size={16} />
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="small muted mt-12">
                Choose a theme, or follow your operating system setting. Your preference is stored in this
                browser only.
              </p>
            </div>
          </Card>

          <Card>
            <div className="card-head">
              <h2>Session</h2>
            </div>
            <div className="card-body">
              <p className="small muted mb-16">
                You are signed in as <strong>{user?.email}</strong>. Sign out if you are using a shared
                computer.
              </p>
              <div className="btn-row">
                <Button
                  variant="danger"
                  icon="logout"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="card-head">
            <h2>Change Password</h2>
            <span className="badge badge-gray">
              <Icon name="lock" size={12} />
              Security
            </span>
          </div>
          <form className="card-body" onSubmit={savePassword}>
            {passwordMessage ? (
              <div className="mb-16">
                <Alert tone={passwordMessage.tone}>{passwordMessage.text}</Alert>
              </div>
            ) : null}

            <Field label="Current Password" required htmlFor="currentPassword">
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>

            <Field
              label="New Password"
              required
              htmlFor="newPassword"
              hint={`At least ${MIN_PASSWORD} characters.`}
            >
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>

            <Field
              label="Confirm New Password"
              required
              htmlFor="confirmPassword"
              error={passwordProblems.find((p) => p.includes('match'))}
            >
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>

            <Button
              type="submit"
              icon="key"
              loading={passwordBusy}
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword.length < MIN_PASSWORD ||
                newPassword !== confirmPassword
              }
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}