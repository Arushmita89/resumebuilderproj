import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { analysisApi } from '../api';
import { formatDateTime } from '../format';
import { useReport, useResume } from '../hooks';
import Icon from '../components/Icon';
import { Alert, Button, Card, EmptyState, PageHead, ScoreRing, Trend } from '../components/ui';

export default function Reanalyze() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { report, loading, error, reload } = useReport(id);
  const { resume } = useResume(id);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState('');
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    document.title = 'Make Changes and Re-analyze — ResumeBuilder';
  }, []);

  async function reanalyze() {
    setRunning(true);
    setRunError('');
    try {
      const next = await analysisApi.run(id);
      setUpdated(next);
      await reload();
    } catch (err) {
      setRunError(err.message);
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ maxWidth: 860 }}>
        <Card>
          <div className="card-body">
            <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 110 }} />
          </div>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page" style={{ maxWidth: 860 }}>
        <PageHead title="Make Changes and Re-analyze" />
        <Card>
          <EmptyState
            icon="refresh"
            title="Nothing to compare yet"
            text="This resume has no previous analysis run. Analyze it once to get a baseline score, then come back here after making changes."
            action={
              <Button icon="chart" onClick={() => navigate(`/analysis/${id}`)}>
                Go to Resume Analysis
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const before = report.overallScore;
  const after = updated?.overallScore;
  const editedSince =
    resume?.updatedAt && report.analyzedAt && new Date(resume.updatedAt) > new Date(report.analyzedAt);

  return (
    <div className="page" style={{ maxWidth: 880 }}>
      <PageHead
        title="Make Changes and Re-analyze"
        breadcrumb={
          <>
            <Link to={`/analysis/${id}`}>Resume Analysis</Link> / Re-analyze
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}
      {runError ? <Alert tone="error">{runError}</Alert> : null}

      <Card>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 13, marginBottom: 18 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--blue-50)',
                color: 'var(--blue-600)',
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 auto'
              }}
            >
              <Icon name="refresh" size={19} />
            </span>
            <div>
              <p style={{ fontSize: 14.5 }}>
                {updated
                  ? 'Analysis complete. Here is how your score changed after your updates.'
                  : "You've made updates to your resume. Run the analysis again to see your improved results."}
              </p>
              <p className="small muted mt-8">
                {resume?.title} · Last analyzed {formatDateTime(report.analyzedAt)}
              </p>
            </div>
          </div>

          {editedSince && !updated ? (
            <Alert tone="info" title="Changes detected">
              This resume was modified {formatDateTime(resume.updatedAt)}, after the last analysis run.
              Re-analyzing will score your updated content.
            </Alert>
          ) : null}

          <div className="grid grid-3" style={{ alignItems: 'center' }}>
            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div className="small muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 650 }}>
                Previous Score
              </div>
              <div style={{ margin: '12px auto 6px', width: 104 }}>
                <ScoreRing score={before} size={104} />
              </div>
              <div className="small muted">{formatDateTime(report.analyzedAt)}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              {updated ? (
                <>
                  <Trend current={after} previous={before} />
                  <div style={{ marginTop: 10, color: 'var(--slate-300)' }}>
                    <Icon name="arrowRight" size={26} />
                  </div>
                </>
              ) : (
                <span className="badge badge-gray">
                  <Icon name="clock" size={12} />
                  Awaiting re-analysis
                </span>
              )}
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div className="small muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 650 }}>
                Updated Score
              </div>
              <div style={{ margin: '12px auto 6px', width: 104 }}>
                {after !== undefined ? <ScoreRing score={after} size={104} /> : <ScoreRing score={null} size={104} />}
              </div>
              <div className="small muted">{updated ? 'Just now' : 'Not yet run'}</div>
            </div>
          </div>

          {updated ? (
            <Alert
              tone={after >= before ? 'success' : 'warn'}
              title={after >= before ? 'Score improved' : 'Score changed'}
            >
              {updated.verdict} {after >= before
                ? `Your score improved by ${after - before} point${after - before === 1 ? '' : 's'} after the changes you made.`
                : `Your score changed by ${Math.abs(after - before)} point${after - before === 1 || after - before === -1 ? '' : 's'}. Review the sections below.`}
            </Alert>
          ) : null}

          {updated ? (
            <div className="grid grid-2 mt-16">
              <div className="card" style={{ boxShadow: 'none' }}>
                <div className="card-head">
                  <h2>Section changes</h2>
                </div>
                <div>
                  {report.sections.map((section) => {
                    const next = updated.sections.find((s) => s.key === section.key);
                    const delta = (next?.score ?? 0) - section.score;
                    return (
                      <div className="analysis-row" key={section.key} style={{ padding: '11px 16px' }}>
                        <div className="analysis-row-main">
                          <div className="analysis-row-title">{section.section}</div>
                          <div className="analysis-row-meta">
                            {section.score} → {next?.score ?? 0} of {section.maxPoints}
                          </div>
                        </div>
                        <div className="analysis-row-side">
                          {delta > 0 ? (
                            <span className="trend-up">
                              <Icon name="trendingUp" size={13} />+{delta}
                            </span>
                          ) : delta < 0 ? (
                            <span className="trend-down">
                              <Icon name="chevronDown" size={13} />
                              {delta}
                            </span>
                          ) : (
                            <span className="trend-flat">
                              <Icon name="minus" size={13} />0
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Card>
                <div className="card-head">
                  <h2>Next steps</h2>
                </div>
                <div className="card-body">
                  <ul className="suggestion-list mb-16">
                    {updated.overallTips.slice(0, 4).map((tip, index) => (
                      <li key={index}>
                        <Icon name="bulb" size={15} />
                        <span>{tip}</span>
                      </li>
                    ))}
                    {updated.overallTips.length === 0 ? (
                      <li>
                        <Icon name="checkCircle" size={15} />
                        <span>No outstanding suggestions — this resume is in good shape.</span>
                      </li>
                    ) : null}
                  </ul>
                  <div className="btn-row">
                    <Button variant="secondary" icon="edit" onClick={() => navigate(`/builder/${id}`)}>
                      Back to Builder
                    </Button>
                    <Button icon="download" onClick={() => navigate(`/analysis/${id}/export`)}>
                      Download PDF
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          <div className="btn-row mt-20" style={{ justifyContent: 'space-between' }}>
            <Button variant="secondary" icon="chevronLeft" onClick={() => navigate(`/builder/${id}`)}>
              Back to Builder
            </Button>
            <div className="btn-row">
              <Button variant="ghost" onClick={() => navigate(`/analysis/${id}/details`)} disabled={!updated}>
                View Detailed Analysis
              </Button>
              <Button icon="refresh" onClick={reanalyze} loading={running} size="lg">
                {running ? 'Running analysis…' : 'Re-analyze'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}