import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi, resumeApi } from '../api';
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

export default function AnalysisHub() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(null);

  const load = useCallback(async () => {
    try {
      setError('');
      setResumes(await resumeApi.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Resume Analysis — ResumeBuilder';
    load();
  }, [load]);

  async function run(id) {
    setRunning(id);
    try {
      await analysisApi.run(id);
      navigate(`/analysis/${id}`);
    } catch (err) {
      setError(err.message);
      setRunning(null);
    }
  }

  const analyzed = resumes.filter((r) => r.status !== 'DRAFT');
  const drafts = resumes.filter((r) => r.status === 'DRAFT');

  return (
    <div className="page">
      <PageHead
        title="Resume Analysis"
        subtitle="Check your resume for completeness, formatting and job-relevant keywords."
        actions={
          resumes.length ? (
            <Button variant="secondary" icon="target" onClick={() => navigate(`/analysis/${resumes[0].id}/job-description`)}>
              Analyze Against a Job Description
            </Button>
          ) : null
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {loading ? (
        <Card>
          <div className="card-body">
            <div className="skeleton" style={{ height: 15, width: '35%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 15, width: '55%' }} />
          </div>
        </Card>
      ) : resumes.length === 0 ? (
        <Card>
          <EmptyState
            icon="file"
            title="No resumes to analyze"
            text="Create a resume first. The analysis engine scores each of six sections plus keyword coverage against a job description."
            action={
              <Button icon="plus" onClick={() => navigate('/builder/new')}>
                Create New Resume
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="stack">
          <TableWrap>
            <table className="table">
              <thead>
                <tr>
                  <th>Resume Name</th>
                  <th>Last Analyzed</th>
                  <th>Latest Score</th>
                  <th>Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...analyzed, ...drafts].map((resume) => (
                  <tr key={resume.id}>
                    <td>
                      <div className="cell-title">
                        <span style={{ color: 'var(--slate-400)' }}>
                          <Icon name="file" size={15} />
                        </span>
                        {resume.title}
                      </div>
                      <div className="cell-sub">Template: {resume.template || 'modern'}</div>
                    </td>
                    <td className="nowrap">
                      {resume.lastAnalyzedAt ? relativeTime(resume.lastAnalyzedAt) : 'Never analyzed'}
                    </td>
                    <td className="num">
                      {resume.lastAnalysisScore === null || resume.lastAnalysisScore === undefined
                        ? '—'
                        : `${resume.lastAnalysisScore}%`}
                    </td>
                    <td>
                      <StatusBadge status={resume.status} />
                    </td>
                    <td className="col-actions">
                      <div className="action-group">
                        {resume.status === 'DRAFT' ? (
                          <Button variant="primary" size="sm" loading={running === resume.id} onClick={() => run(resume.id)}>
                            Analyze
                          </Button>
                        ) : (
                          <>
                            <button type="button" className="link-btn" onClick={() => navigate(`/analysis/${resume.id}`)}>
                              View Report
                            </button>
                            <span className="muted small" style={{ margin: '0 4px' }}>|</span>
                            <button
                              type="button"
                              className="link-btn"
                              onClick={() => navigate(`/analysis/${resume.id}/job-description`)}
                            >
                              Add Job Description
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>

          <Alert tone="plain" icon="shield">
            Analysis is performed by a rule-based engine on the server: section completeness checks,
            action-verb and quantification checks, formatting rules, and literal keyword matching against
            the job description you provide. Nothing is generated or rewritten by AI.
          </Alert>
        </div>
      )}
    </div>
  );
}