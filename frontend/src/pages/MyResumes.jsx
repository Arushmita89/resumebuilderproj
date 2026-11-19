import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../api';
import { formatDate, relativeTime } from '../format';
import MiniResume from '../components/MiniResume';
import Icon from '../components/Icon';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  PageHead,
  Select,
  StatusBadge,
  scoreTone
} from '../components/ui';

const FILTERS = [
  { value: 'ALL', label: 'All resumes' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'ANALYZED', label: 'Analyzed' },
  { value: 'COMPLETED', label: 'Completed' }
];

const SORTS = [
  { value: 'recent', label: 'Last updated' },
  { value: 'title', label: 'Name (A–Z)' },
  { value: 'score', label: 'Highest score' }
];

const PAGE_SIZE = 9;

function ScoreTag({ score }) {
  if (score === null || score === undefined) {
    return <span className="badge badge-gray">Not analyzed</span>;
  }
  const tone = scoreTone(score);
  return <span className={`score-pill score-${tone}`}>{score}%</span>;
}

export default function MyResumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState(null);
  const [deleting, setDeleting] = useState(null);

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
    document.title = 'My Resumes — ResumeBuilder';
    load();
  }, [load]);

  useEffect(() => {
    function onClick() {
      setMenu(null);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const counts = useMemo(
    () => ({
      ALL: resumes.length,
      DRAFT: resumes.filter((r) => r.status === 'DRAFT').length,
      ANALYZED: resumes.filter((r) => r.status === 'ANALYZED').length,
      COMPLETED: resumes.filter((r) => r.status === 'COMPLETED').length
    }),
    [resumes]
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = resumes.filter((resume) => {
      if (filter !== 'ALL' && resume.status !== filter) return false;
      if (!needle) return true;
      return String(resume.title || '').toLowerCase().includes(needle);
    });

    const sorted = [...filtered];
    if (sort === 'title') {
      sorted.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    } else if (sort === 'score') {
      sorted.sort((a, b) => (b.lastAnalysisScore ?? -1) - (a.lastAnalysisScore ?? -1));
    } else {
      sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    return sorted;
  }, [resumes, query, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const shown = visible.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, filter, sort]);

  async function confirmDelete() {
    try {
      await resumeApi.remove(deleting.id);
      setDeleting(null);
      await load();
    } catch (err) {
      setError(err.message);
      setDeleting(null);
    }
  }

  return (
    <div className="page">
      <PageHead
        title="My Resumes"
        subtitle="Every resume in your account, with its latest analysis score."
        actions={
          <Button icon="plus" onClick={() => navigate('/builder/new')}>
            Create New Resume
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {loading ? (
        <div className="grid grid-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <div className="card-body">
                <div className="skeleton" style={{ height: 150, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </div>
            </Card>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <Card>
          <EmptyState
            icon="file"
            title="No resumes yet"
            text="Create your first resume to get started. You can pick one of six templates, fill in your details and run the analysis engine."
            action={
              <div className="btn-row" style={{ justifyContent: 'center' }}>
                <Button icon="plus" onClick={() => navigate('/builder/new')}>
                  Create New Resume
                </Button>
                <Button variant="secondary" icon="layers" onClick={() => navigate('/templates')}>
                  Browse Templates
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="stack">
          <Card>
            <div className="card-body">
              <div className="filter-bar" style={{ marginBottom: 0 }}>
                <div className="search-box">
                  <Icon name="search" size={15} />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search resumes…"
                  />
                </div>
                <div className="filter-pills">
                  {FILTERS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`filter-pill ${filter === option.value ? 'active' : ''}`}
                      onClick={() => setFilter(option.value)}
                    >
                      {option.label} ({counts[option.value]})
                    </button>
                  ))}
                </div>
                <Select options={SORTS} value={sort} onChange={(e) => setSort(e.target.value)} />
              </div>
            </div>
          </Card>

          {shown.length === 0 ? (
            <Card>
              <EmptyState
                icon="search"
                title="No resumes match"
                text="Adjust your search term or switch to a different status filter."
                action={
                  <Button
                    variant="secondary"
                    icon="reset"
                    onClick={() => {
                      setQuery('');
                      setFilter('ALL');
                    }}
                  >
                    Clear Filters
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              <div className="grid grid-3">
                {shown.map((resume) => (
                  <div className="resume-card" key={resume.id}>
                    <div className="resume-card-preview">
                      <MiniResume template={resume.template} />
                      <div className="resume-card-overlay">
                        <Button size="sm" onClick={() => navigate(`/builder/${resume.id}`)}>
                          Open Editor
                        </Button>
                      </div>
                    </div>

                    <div className="resume-card-body">
                      <div className="row-between" style={{ alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <button
                            type="button"
                            className="resume-card-title"
                            onClick={() => navigate(`/builder/${resume.id}`)}
                          >
                            {resume.title}
                          </button>
                          <div className="small muted mt-8">
                            {resume.targetJobTitle || 'No target job title'}
                          </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label={`Actions for ${resume.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenu(menu === resume.id ? null : resume.id);
                            }}
                          >
                            <Icon name="menu" size={16} />
                          </button>
                          {menu === resume.id ? (
                            <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenu(null);
                                  navigate(`/builder/${resume.id}`);
                                }}
                              >
                                <Icon name="edit" size={14} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenu(null);
                                  navigate(`/analysis/${resume.id}`);
                                }}
                              >
                                <Icon name="chart" size={14} /> Analyze
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenu(null);
                                  navigate(`/analysis/${resume.id}/export`);
                                }}
                              >
                                <Icon name="download" size={14} /> Export PDF
                              </button>
                              <div className="dropdown-divider" />
                              <button
                                type="button"
                                className="danger"
                                onClick={() => {
                                  setMenu(null);
                                  setDeleting(resume);
                                }}
                              >
                                <Icon name="trash" size={14} /> Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="resume-card-meta">
                        <StatusBadge status={resume.status} />
                        <ScoreTag score={resume.lastAnalysisScore} />
                      </div>

                      <div className="resume-card-foot">
                        <span className="small muted">
                          Updated {resume.updatedAt ? relativeTime(resume.updatedAt) : '—'}
                        </span>
                        <div className="btn-row" style={{ gap: 6 }}>
                          {resume.status === 'DRAFT' ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              icon="chart"
                              onClick={() => navigate(`/analysis/${resume.id}`)}
                            >
                              Analyze
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              iconRight="arrowRight"
                              onClick={() => navigate(`/analysis/${resume.id}`)}
                            >
                              Report
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pageCount > 1 ? (
                <div className="pagination">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="chevronLeft"
                    disabled={current <= 1}
                    onClick={() => setPage(current - 1)}
                  >
                    Previous
                  </Button>
                  <span className="small muted">
                    Page {current} of {pageCount}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconRight="chevronRight"
                    disabled={current >= pageCount}
                    onClick={() => setPage(current + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </>
          )}

          <p className="small muted">
            Showing {shown.length} of {visible.length} resume{visible.length === 1 ? '' : 's'} · Last
            refresh {formatDate(new Date())}
          </p>
        </div>
      )}

      {deleting ? (
        <div className="modal-backdrop" onClick={() => setDeleting(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Delete this resume?</h2>
            </div>
            <div className="modal-body">
              <p>
                <strong>{deleting.title}</strong> and its stored analysis history will be permanently
                deleted. This cannot be undone.
              </p>
            </div>
            <div className="modal-foot">
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="danger" icon="trash" onClick={confirmDelete}>
                Delete Resume
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}