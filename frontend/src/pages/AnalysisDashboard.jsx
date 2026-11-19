import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { analysisApi } from '../api';
import { formatDateTime } from '../format';
import { useReport, useResume } from '../hooks';
import Icon from '../components/Icon';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Metric,
  PageHead,
  ProgressBar,
  ScoreRing,
  StatusText
} from '../components/ui';

export default function AnalysisDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { report, loading, error, reload } = useReport(id);
  const { resume } = useResume(id);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState('');

  useEffect(() => {
    document.title = 'Resume Analysis — ResumeBuilder';
  }, []);

  async function runAnalysis() {
    setRunning(true);
    setRunError('');
    try {
      await analysisApi.run(id);
      await reload();
    } catch (err) {
      setRunError(err.message);
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Card>
          <div className="card-body">
            <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 18 }} />
            <div className="skeleton" style={{ height: 120, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 60 }} />
          </div>
        </Card>
      </div>
    );
  }

  const summary = report?.summary;

  return (
    <div className="page">
      <PageHead
        title="Resume Analysis"
        subtitle="Check your resume for completeness, formatting and job-relevant keywords."
        breadcrumb={<>Analysis / {resume?.title || `Resume ${id}`}</>}
        actions={
          <div className="btn-row">
            <Button
              variant="secondary"
              icon="target"
              onClick={() => navigate(`/analysis/${id}/job-description`)}
            >
              {report?.keywords?.jobDescriptionProvided ? 'Update Job Description' : 'Add Job Description'}
            </Button>
            <Button icon="refresh" onClick={runAnalysis} loading={running}>
              {report ? 'Re-run Analysis' : 'Run Analysis'}
            </Button>
          </div>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}
      {runError ? <Alert tone="error">{runError}</Alert> : null}

      {!report ? (
        <Card>
          <EmptyState
            icon="chart"
            title="This resume has not been analyzed yet"
            text="Run the rule-based analysis to score six resume sections, check formatting and match keywords against a job description."
            action={
              <div className="btn-row" style={{ justifyContent: 'center' }}>
                <Button icon="chart" onClick={runAnalysis} loading={running}>
                  Run Analysis
                </Button>
                <Button
                  variant="secondary"
                  icon="target"
                  onClick={() => navigate(`/analysis/${id}/job-description`)}
                >
                  Add Job Description
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="stack">
          <Card>
            <div className="card-body">
              <div className="score-hero">
                <ScoreRing score={report.overallScore} />
                <div style={{ minWidth: 0 }}>
                  <div className="row-between" style={{ justifyContent: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 19 }}>{report.verdict}</h2>
                    {report.targetJobTitle ? <span className="badge badge-blue">{report.targetJobTitle}</span> : null}
                  </div>
                  <p className="muted mt-8" style={{ maxWidth: 560 }}>
                    {resume?.title} · Analyzed {formatDateTime(report.analyzedAt)} · Rule-based analysis,{' '}
                    {report.sections.length} sections scored
                  </p>
                  {summary ? (
                    <p className="small muted mt-12">
                      {summary.strongSections} of {summary.totalSections} sections scored complete. Fix the
                      highest-impact issues below, then re-run the analysis to compare your score.
                    </p>
                  ) : null}
                  <div className="btn-row mt-16">
                    <Button iconRight="arrowRight" onClick={() => navigate(`/analysis/${id}/details`)}>
                      View Detailed Analysis
                    </Button>
                    <Button
                      variant="secondary"
                      icon="edit"
                      onClick={() => navigate(`/builder/${id}`)}
                    >
                      Edit Resume
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-3">
            <Metric
              icon="target"
              label="Keyword Match"
              value={
                report.keywords?.jobDescriptionProvided ? (
                  <>
                    {summary.keywordMatched}
                    <span className="muted"> / {summary.keywordTotal}</span>
                  </>
                ) : (
                  <span style={{ fontSize: 17 }}>No job description</span>
                )
              }
              note={
                report.keywords?.jobDescriptionProvided
                  ? `${report.keywords.missingKeywords.length} required keyword${
                      report.keywords.missingKeywords.length === 1 ? '' : 's'
                    } missing`
                  : 'Paste a job description to enable keyword matching'
              }
            />
            <Metric
              icon="clipboard"
              label="Missing Sections"
              value={summary.missingSections}
              note={
                summary.missingSections === 0
                  ? 'All sections present'
                  : 'Sections with no usable content'
              }
            />
            <Metric
              icon="sliders"
              label="Formatting Issues"
              value={summary.formattingIssues}
              note={
                summary.formattingIssues === 0
                  ? 'No formatting problems found'
                  : 'See the Formatting tab for details'
              }
            />
          </div>

          <Card>
            <div className="card-head">
              <h2>Section-wise Analysis</h2>
              <span className="badge badge-gray">6 sections</span>
            </div>
            <div>
              {report.sections.map((section) => (
                <div className="analysis-row" key={section.key}>
                  <span
                    style={{
                      color:
                        section.status === 'MISSING'
                          ? 'var(--red-600)'
                          : section.status === 'NEEDS_IMPROVEMENT'
                            ? 'var(--amber-600)'
                            : 'var(--green-600)'
                    }}
                  >
                    <Icon
                      name={
                        section.status === 'MISSING'
                          ? 'xCircle'
                          : section.status === 'NEEDS_IMPROVEMENT'
                            ? 'alert'
                            : 'checkCircle'
                      }
                      size={18}
                    />
                  </span>

                  <div className="analysis-row-main">
                    <div className="analysis-row-title">{section.section}</div>
                    <div className="analysis-row-meta">
                      {section.issues.length
                        ? `${section.issues.length} issue${section.issues.length === 1 ? '' : 's'} found`
                        : 'No issues detected'}
                    </div>
                  </div>

                  <div className="analysis-row-side">
                    <div style={{ width: 140 }}>
                      <ProgressBar
                        value={(section.score / section.maxPoints) * 100}
                        tone={
                          section.status === 'MISSING'
                            ? 'red'
                            : section.status === 'NEEDS_IMPROVEMENT'
                              ? 'amber'
                              : 'green'
                        }
                      />
                    </div>
                    <div className="analysis-row-score">
                      {section.score}/{section.maxPoints}
                    </div>
                    <StatusText status={section.status} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card-foot">
              <span className="small muted">
                Scores are weighted per section. The overall score is the weighted total.
              </span>
              <Button
                variant="secondary"
                size="sm"
                iconRight="arrowRight"
                onClick={() => navigate(`/analysis/${id}/details`)}
              >
                View Detailed Analysis
              </Button>
            </div>
          </Card>

          {report.overallTips?.length ? (
            <Card>
              <div className="card-head">
                <h2>Priority Improvements</h2>
                <span className="badge badge-amber">{report.overallTips.length} suggestions</span>
              </div>
              <div className="card-body">
                <ul className="suggestion-list">
                  {report.overallTips.map((tip, index) => (
                    <li key={index}>
                      <Icon name="bulb" size={15} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}