import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi } from '../api';
import { formatDateTime, relativeTime } from '../format';
import Icon from '../components/Icon';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  PageHead,
  Select,
  TableWrap,
  scoreTone
} from '../components/ui';

const RANGES = [
  { value: '', label: 'All time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' }
];

function withinRange(createdAt, days) {
  if (!days) return true;
  const cutoff = Date.now() - Number(days) * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() >= cutoff;
}

export default function AnalysisHistory() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('');
  const [sort, setSort] = useState('recent');

  const load = useCallback(async () => {
    try {
      setError('');
      setEntries(await analysisApi.history());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Analysis History — ResumeBuilder';
    load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = entries.filter((entry) => {
      if (!withinRange(entry.createdAt, range)) return false;
      if (!needle) return true;
      return String(entry.resumeTitle || '').toLowerCase().includes(needle);
    });

    const sorted = [...filtered];
    if (sort === 'score-desc') {
      sorted.sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0));
    } else if (sort === 'score-asc') {
      sorted.sort((a, b) => (a.overallScore ?? 0) - (b.overallScore ?? 0));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  }, [entries, query, range, sort]);

  const best = entries.reduce(
    (top, entry) => (top === null || (entry.overallScore ?? 0) > (top ?? 0) ? entry.overallScore : top),
    null
  );
  const latestScore = entries.length ? entries[0].overallScore : null;

  return (
    <div className="page">
      <PageHead
        title="Analysis History"
        subtitle="Every analysis run you have made, so you can compare scores over time."
        actions={
          <Button icon="chart" onClick={() => navigate('/analysis')}>
            Resume Analysis
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {loading ? (
        <Card>
          <div className="card-body">
            <div className="skeleton" style={{ height: 15, width: '40%', marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 90 }} />
          </div>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <EmptyState
            icon="history"
            title="No analysis runs yet"
            text="Once you analyze a resume, each run is stored here with its score so you can track progress."
            action={
              <Button icon="chart" onClick={() => navigate('/analysis')}>
                Analyze a Resume
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="stack">
          <div className="grid grid-3">
            <Card className="metric">
              <div className="metric-label">
                <Icon name="history" size={13} />
                Total Runs
              </div>
              <div className="metric-value">{entries.length}</div>
              <div className="metric-note">
                Across {new Set(entries.map((e) => e.resumeId)).size} resume
                {new Set(entries.map((e) => e.resumeId)).size === 1 ? '' : 's'}
              </div>
            </Card>

            <Card className="metric">
              <div className="metric-label">
                <Icon name="chart" size={13} />
                Latest Score
              </div>
              <div
                className="metric-value"
                style={{
                  color:
                    latestScore >= 85
                      ? 'var(--green-700)'
                      : latestScore >= 70
                        ? 'var(--amber-700)'
                        : 'var(--red-700)'
                }}
              >
                {latestScore}%
              </div>
              <div className="metric-note">{entries[0].resumeTitle}</div>
            </Card>

            <Card className="metric">
              <div className="metric-label">
                <Icon name="award" size={13} />
                Best Score
              </div>
              <div className="metric-value">{best}%</div>
              <div className="metric-note">Highest score across all runs</div>
            </Card>
          </div>

          <Card>
            <div className="card-body">
              <div className="filter-bar">
                <div className="search-box">
                  <Icon name="search" size={15} />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by resume name…"
                  />
                </div>
                <Select options={RANGES} value={range} onChange={(e) => setRange(e.target.value)} />
                <Select
                  options={[
                    { value: 'recent', label: 'Newest first' },
                    { value: 'score-desc', label: 'Highest score' },
                    { value: 'score-asc', label: 'Lowest score' }
                  ]}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                />
                <span className="small muted nowrap">
                  {visible.length} of {entries.length} runs
                </span>
              </div>
            </div>
          </Card>

          {visible.length === 0 ? (
            <Card>
              <EmptyState
                icon="search"
                title="No runs match your filters"
                text="Try a different search term or widen the date range."
                action={
                  <Button
                    variant="secondary"
                    icon="reset"
                    onClick={() => {
                      setQuery('');
                      setRange('');
                      setSort('recent');
                    }}
                  >
                    Clear Filters
                  </Button>
                }
              />
            </Card>
          ) : (
            <TableWrap>
              <table className="table">
                <thead>
                  <tr>
                    <th>Run</th>
                    <th>Resume</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((entry, index) => {
                    const tone = scoreTone(entry.overallScore);
                    return (
                      <tr key={entry.id}>
                        <td className="nowrap">
                          <span className="muted small">#{entries.length - index}</span>
                        </td>
                        <td>
                          <div className="cell-title">{entry.resumeTitle}</div>
                          <div className="cell-sub">Run ID {entry.id}</div>
                        </td>
                        <td className="nowrap">
                          <div>{formatDateTime(entry.createdAt)}</div>
                          <div className="cell-sub">{relativeTime(entry.createdAt)}</div>
                        </td>
                        <td className="num">
                          <span className={`score-pill score-${tone}`}>{entry.overallScore}%</span>
                        </td>
                        <td className="col-actions">
                          <div className="action-group">
                            <button
                              type="button"
                              className="link-btn"
                              onClick={() => navigate(`/analysis/${entry.resumeId}/details?run=${entry.id}`)}
                            >
                              View Report
                            </button>
                            <span className="muted small" style={{ margin: '0 4px' }}>
                              |
                            </span>
                            <button
                              type="button"
                              className="link-btn"
                              onClick={() => navigate(`/analysis/${entry.resumeId}/reanalyze`)}
                            >
                              Re-analyze
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          )}

          <Alert tone="plain" icon="shield">
            Historical reports are stored exactly as they were produced. Opening one does not change your
            current score — re-analyze to create a new run from your current resume content.
          </Alert>
        </div>
      )}
    </div>
  );
}