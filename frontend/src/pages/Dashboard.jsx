import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analysisApi, resumeApi } from '../api';
import { useAuth } from '../auth';
import { relativeTime } from '../format';
import Icon from '../components/Icon';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  PageHead,
  StatusBadge,
  TableWrap
} from '../components/ui';

const QUICK_ACTIONS = [
  {
    icon: 'plus',
    title: 'Create New Resume',
    text: 'Start from scratch with the guided six-step form.',
    to: '/builder/new'
  },
  {
    icon: 'layout',
    title: 'Choose Template',
    text: 'Pick from six ATS-safe professional layouts.',
    to: '/templates'
  },
  {
    icon: 'chart',
    title: 'Analyze Resume',
    text: 'Check completeness, formatting and keywords.',
    to: '/analysis'
  },
  {
    icon: 'history',
    title: 'Analysis History',
    text: 'Compare your scores across past runs.',
    to: '/history'
  }
];

function QuickActionCard({ action }) {
  return (
    <Link to={action.to} className="card card-hover" style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card-body">
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--blue-50)',
            color: 'var(--blue-600)',
            display: 'grid',
            placeItems: 'center',
            marginBottom: 12
          }}
        >
          <Icon name={action.icon} size={17} />
        </span>
        <h3 style={{ marginBottom: 4 }}>{action.title}</h3>
        <p className="small muted">{action.text}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const list = await resumeApi.list();
      setResumes(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Dashboard — ResumeBuilder';
    load();
  }, [load]);

  async function analyze(id) {
    try {
      await analysisApi.run(id);
      await load();
      navigate(`/analysis/${id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await resumeApi.remove(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const firstName = (user?.fullName || 'there').split(' ')[0];
  const recent = [...resumes]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5);

  return (
    <div className="page">
      <PageHead
        title={`Welcome back, ${firstName}!`}
        subtitle="Build your resume, analyze it, and make it ATS-ready."
        actions={
          <Button icon="plus" onClick={() => navigate('/builder/new')}>
            Create New Resume
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="section-title">Quick Actions</div>
      <div className="grid grid-4 mb-20">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionCard key={action.title} action={action} />
        ))}
      </div>

      <div className="row-between mb-12">
        <div className="section-title" style={{ marginBottom: 0 }}>
          Recent Resumes
        </div>
        {resumes.length > 5 ? (
          <Link to="/resumes" className="small">
            View all {resumes.length}
          </Link>
        ) : null}
      </div>

      <TableWrap>
        {loading ? (
          <div style={{ padding: 20 }}>
            <div className="skeleton" style={{ height: 15, width: '35%', marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 15, width: '55%' }} />
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon="file"
            title="No resumes yet"
            text="Create your first resume to unlock template selection, PDF export and rule-based analysis."
            action={
              <Button icon="plus" onClick={() => navigate('/builder/new')}>
                Create New Resume
              </Button>
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Resume Name</th>
                <th>Last Modified</th>
                <th>Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((resume) => (
                <tr key={resume.id}>
                  <td>
                    <div className="cell-title">
                      <span style={{ color: 'var(--slate-400)' }}>
                        <Icon name="file" size={15} />
                      </span>
                      {resume.title}
                    </div>
                    <div className="cell-sub">
                      {resume.template ? `Template: ${resume.template}` : 'Template: modern'}
                      {resume.lastAnalysisScore !== null && resume.lastAnalysisScore !== undefined
                        ? ` · Score ${resume.lastAnalysisScore}%`
                        : ' · Not analyzed'}
                    </div>
                  </td>
                  <td className="nowrap">{relativeTime(resume.updatedAt)}</td>
                  <td>
                    <StatusBadge status={resume.status} />
                  </td>
                  <td className="col-actions">
                    <div className="action-group">
                      <Link to={`/builder/${resume.id}`} className="btn btn-secondary btn-sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => analyze(resume.id)}
                        title="Run rule-based analysis"
                      >
                        Analyze
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => remove(resume.id, resume.title)}
                        title="Delete resume"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      <Card className="mt-20">
        <div className="card-body" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--blue-50)',
              color: 'var(--blue-600)',
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto'
            }}
          >
            <Icon name="target" size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 650 }}>Tip: analyze against a real job description</div>
            <div className="small muted">
              Paste the job description before analyzing so keyword matching can report which required
              terms are missing from your resume.
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/analysis')}>
            Go to Resume Analysis
          </Button>
        </div>
      </Card>
    </div>
  );
}