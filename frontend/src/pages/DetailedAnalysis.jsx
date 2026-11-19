import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  StatusText,
  Tabs
} from '../components/ui';

function SectionCard({ section }) {
  const tone =
    section.status === 'MISSING' ? 'red' : section.status === 'NEEDS_IMPROVEMENT' ? 'amber' : 'green';
  const issueIconClass = tone === 'red' ? 'i-bad' : 'i-warn';

  return (
    <div className="section-block">
      <div className="section-block-head">
        <div style={{ minWidth: 0 }}>
          <div className="row-between" style={{ justifyContent: 'flex-start', gap: 10 }}>
            <h2>{section.section}</h2>
            <span className="badge badge-gray nowrap">
              {section.score} / {section.maxPoints}
            </span>
          </div>
          <div style={{ marginTop: 8, maxWidth: 240 }}>
            <ProgressBar value={(section.score / section.maxPoints) * 100} tone={tone} />
          </div>
        </div>
        <StatusText status={section.status} />
      </div>

      <div className="section-block-body">
        <div className="grid grid-2" style={{ gap: 24, alignItems: 'start' }}>
          <div>
            <div className="subhead">Issues</div>
            {section.issues.length ? (
              <ul className="issue-list">
                {section.issues.map((issue, index) => (
                  <li key={index}>
                    <span className={issueIconClass}>
                      <Icon name="alert" size={15} />
                    </span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small muted">No issues detected in this section.</p>
            )}
          </div>

          <div>
            <div className="subhead">Suggestions</div>
            {section.suggestions.length ? (
              <ul className="suggestion-list">
                {section.suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <Icon name="bulb" size={15} />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small muted">Nothing to improve here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailedAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const historyId = searchParams.get('run');

  const latest = useReport(id);
  const { resume } = useResume(id);

  const [tab, setTab] = useState('overview');
  const [historical, setHistorical] = useState(null);
  const [entryLoading, setEntryLoading] = useState(false);

  useEffect(() => {
    document.title = 'Detailed Analysis — ResumeBuilder';
  }, []);

  useEffect(() => {
    if (!historyId) return;
    setEntryLoading(true);
    analysisApi
      .entry(historyId)
      .then((entry) => setHistorical(entry))
      .catch(() => setHistorical(null))
      .finally(() => setEntryLoading(false));
  }, [historyId]);

  const report = historical?.report || latest.report;
  const loading = entryLoading || latest.loading;

  const tabs = useMemo(
    () => [
      { key: 'overview', label: 'Overview', icon: 'chart' },
      {
        key: 'keywords',
        label: 'Keywords',
        icon: 'target',
        count: report?.keywords?.jobDescriptionProvided
          ? `${report.keywords.matchedCount}/${report.keywords.totalKeywords}`
          : undefined
      },
      {
        key: 'formatting',
        label: 'Formatting',
        icon: 'sliders',
        count: report?.formattingIssues?.length || 0
      },
      { key: 'sections', label: 'Sections', icon: 'clipboard', count: report?.sections?.length || 0 }
    ],
    [report]
  );

  if (loading) {
    return (
      <div className="page">
        <Card>
          <div className="card-body">
            <div className="skeleton" style={{ height: 18, width: '35%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 100 }} />
          </div>
        </Card>
      </div>
    );
  }

  if (latest.error) {
    return (
      <div className="page">
        <Alert tone="error">{latest.error}</Alert>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page">
        <PageHead title="Detailed Analysis" />
        <Card>
          <EmptyState
            icon="chart"
            title="No analysis report available"
            text="Run the analysis for this resume first, then the detailed report will appear here."
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

  const summary = report.summary;
  const keywords = report.keywords;

  return (
    <div className="page">
      <PageHead
        title="Detailed Analysis"
        subtitle={
          historical
            ? `Stored run from ${formatDateTime(historical.createdAt)} — ${historical.resumeTitle}`
            : 'Every rule, issue and suggestion produced by the analysis engine.'
        }
        breadcrumb={
          <>
            <Link to={`/analysis/${id}`}>Resume Analysis</Link> / Detailed
          </>
        }
        actions={
          <div className="btn-row">
            {historical ? (
              <span className="badge badge-amber">
                <Icon name="clock" size={12} />
                Historical run
              </span>
            ) : null}
            <Button
              variant="secondary"
              icon="edit"
              onClick={() => navigate(`/builder/${id}`)}
            >
              Edit Resume
            </Button>
            <Button icon="download" onClick={() => navigate(`/analysis/${id}/export`)}>
              Export PDF
            </Button>
          </div>
        }
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      {tab === 'overview' ? (
        <div className="stack">
          <Card>
            <div className="card-body">
              <div className="score-hero">
                <ScoreRing score={report.overallScore} />
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: 18 }}>{report.verdict}</h2>
                  <p className="muted mt-8" style={{ maxWidth: 600 }}>
                    {resume?.title} · {report.targetJobTitle || 'No target job title'} · Analyzed{' '}
                    {formatDateTime(report.analyzedAt)}
                  </p>
                  <div className="btn-row mt-16">
                    <Button variant="secondary" icon="refresh" onClick={() => navigate(`/analysis/${id}/reanalyze`)}>
                      Make Changes and Re-analyze
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-4">
            <Metric icon="target" label="Keyword Match" value={`${summary.keywordMatched}/${summary.keywordTotal}`} note="Terms found in resume" />
            <Metric icon="clipboard" label="Missing Sections" value={summary.missingSections} note="No usable content" />
            <Metric icon="sliders" label="Formatting Issues" value={summary.formattingIssues} note="Structure and format" />
            <Metric
              icon="award"
              label="Sections Complete"
              value={`${summary.strongSections}/${summary.totalSections}`}
              note="Scored 90% or above"
            />
          </div>

          <Card>
            <div className="card-head">
              <h2>How this score is calculated</h2>
            </div>
            <div className="card-body">
              <ul className="suggestion-list">
                {report.sections.map((section) => (
                  <li key={section.key}>
                    <Icon name="check" size={15} />
                    <span>
                      <strong>{section.section}</strong> — contributes up to {section.maxPoints} points.
                      Earned {section.score}.
                    </span>
                  </li>
                ))}
              </ul>
              <div className="alert alert-info mt-16" style={{ marginBottom: 0 }}>
                <Icon name="shield" size={16} />
                <div>
                  Total possible is 100 points. A section scores <strong>Complete</strong> at 90% or above,{' '}
                  <strong>Good</strong> at 70%, <strong>Needs Improvement</strong> at 40%, and{' '}
                  <strong>Missing</strong> below that or when the section is empty.
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'keywords' ? (
        <div className="stack">
          {!keywords?.jobDescriptionProvided ? (
            <Card>
              <EmptyState
                icon="target"
                title="No job description attached"
                text="Keyword matching compares your resume against a specific job description. Paste one to see matched and missing keywords."
                action={
                  <Button icon="target" onClick={() => navigate(`/analysis/${id}/job-description`)}>
                    Analyze Against a Job Description
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              <Card>
                <div className="card-head">
                  <h2>Target Job Description</h2>
                  <span className="badge badge-blue">
                    {keywords.totalKeywords} keywords extracted
                  </span>
                </div>
                <div className="card-body">
                  <div
                    style={{
                      maxHeight: 132,
                      overflowY: 'auto',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 14,
                      fontSize: 12.5,
                      color: 'var(--slate-600)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.65
                    }}
                  >
                    {resume?.targetJobDescription || 'Job description text is not available for this run.'}
                  </div>
                  <div className="btn-row mt-12">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="edit"
                      onClick={() => navigate(`/analysis/${id}/job-description`)}
                    >
                      Update Job Description
                    </Button>
                    <span className="small muted">
                      Matching is literal and case-insensitive — a keyword counts only when it appears in
                      your resume text.
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="card-head">
                  <h2>Matched Keywords</h2>
                  <span className="badge badge-green">
                    {keywords.matchedCount} of {keywords.totalKeywords}
                  </span>
                </div>
                <div className="card-body">
                  {keywords.matchedKeywords.length ? (
                    <div className="tag-list">
                      {keywords.keywords
                        .filter((hit) => hit.matched)
                        .map((hit) => (
                          <span className="chip chip-matched" key={hit.keyword}>
                            <Icon name="check" size={12} strokeWidth={2.4} />
                            {hit.keyword}
                            <span className="muted" style={{ marginLeft: 2, fontWeight: 500 }}>
                              ×{hit.occurrences}
                            </span>
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="small muted">
                      None of the extracted keywords appear in your resume yet.
                    </p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="card-head">
                  <h2>Missing Keywords</h2>
                  <span className="badge badge-red">{keywords.missingKeywords.length} missing</span>
                </div>
                <div className="card-body">
                  {keywords.missingKeywords.length ? (
                    <>
                      <div className="tag-list">
                        {keywords.keywords
                          .filter((hit) => !hit.matched)
                          .map((hit) => (
                            <span className="chip chip-missing" key={hit.keyword}>
                              <Icon name="plus" size={12} strokeWidth={2.4} />
                              {hit.keyword}
                            </span>
                          ))}
                      </div>
                      <Alert tone="warn" title="How to use this list">
                        Add these terms where they are genuinely accurate — in your skills list, project
                        descriptions or experience bullets. Do not add a keyword you cannot discuss in an
                        interview.
                      </Alert>
                    </>
                  ) : (
                    <p className="small muted">
                      Every extracted keyword already appears in your resume. Good coverage.
                    </p>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      ) : null}

      {tab === 'formatting' ? (
        <Card>
          <div className="card-head">
            <h2>Formatting Issues</h2>
            <span className={`badge badge-${report.formattingIssues.length ? 'amber' : 'green'}`}>
              {report.formattingIssues.length} issue{report.formattingIssues.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="card-body">
            {report.formattingIssues.length === 0 ? (
              <div className="alert alert-success" style={{ marginBottom: 0 }}>
                <Icon name="checkCircle" size={16} />
                <div>
                  <strong className="alert-title">No formatting issues found</strong>
                  Email, phone, dates, links and bullet lengths all passed the formatting rules.
                </div>
              </div>
            ) : (
              <div className="stack">
                {report.formattingIssues.map((issue, index) => (
                  <div
                    key={issue.id || index}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '13px 15px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface-alt)'
                    }}
                  >
                    <span style={{ color: issue.severity === 'error' ? 'var(--red-600)' : 'var(--amber-600)', flex: '0 0 auto' }}>
                      <Icon name={issue.severity === 'error' ? 'xCircle' : 'alert'} size={17} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 650, fontSize: 13.5 }}>{issue.label}</div>
                      <div className="small muted mt-8">{issue.message}</div>
                    </div>
                    <span
                      className={`badge ${issue.severity === 'error' ? 'badge-red' : 'badge-amber'} nowrap`}
                      style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}
                    >
                      {issue.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ) : null}

      {tab === 'sections' ? (
        <div>
          {report.sections.map((section) => (
            <SectionCard key={section.key} section={section} />
          ))}
          <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" icon="chevronLeft" onClick={() => setTab('overview')}>
              Back to Overview
            </Button>
            <Button iconRight="arrowRight" onClick={() => navigate(`/analysis/${id}/reanalyze`)}>
              Make Changes and Re-analyze
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}