import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { templateApi } from '../api';
import Icon from '../components/Icon';
import MiniResume from '../components/MiniResume';
import { Alert, Button, EmptyState, PageHead } from '../components/ui';

const CATEGORIES = ['All', 'Modern', 'Classic', 'Professional', 'Minimal'];

const FALLBACK = [
  { key: 'modern', name: 'Modern', category: 'Modern', description: 'Clean single-column layout with a bold accent header.' },
  { key: 'classic', name: 'Classic', category: 'Classic', description: 'Traditional centered header with clear section rules.' },
  { key: 'professional', name: 'Professional', category: 'Professional', description: 'Two-tone header with a dedicated skills column.' },
  { key: 'minimal', name: 'Minimal', category: 'Minimal', description: 'Ultra-clean single column, maximises readability.' },
  { key: 'elegant', name: 'Elegant', category: 'Professional', description: 'Lightweight typography with generous spacing.' },
  { key: 'simple', name: 'Simple', category: 'Minimal', description: 'Plain and compact layout for early-career applicants.' }
];

export default function Templates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(searchParams.get('template') || 'modern');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Choose a Template — ResumeBuilder';
    templateApi
      .list()
      .then((list) => setTemplates(list.length ? list : FALLBACK))
      .catch(() => setTemplates(FALLBACK));
  }, []);

  const visible = category === 'All'
    ? templates
    : templates.filter((t) => (t.category || 'Modern') === category);

  function continueToBuilder() {
    navigate(`/builder/new?template=${selected}`);
  }

  return (
    <div className="page">
      <PageHead
        title="Choose a Template"
        subtitle="Select a professional template for your resume. You can change it anytime."
        actions={
          <Button icon="arrowRight" iconRight={false} onClick={continueToBuilder}>
            Continue
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="filter-bar">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-pill ${category === item ? 'active' : ''}`}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState icon="layout" title="No templates in this category" text="Try another category filter." />
        </div>
      ) : (
        <div className="grid grid-3">
          {visible.map((template) => {
            const isSelected = selected === template.key;
            return (
              <button
                key={template.key}
                type="button"
                className={`template-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelected(template.key)}
                aria-pressed={isSelected}
              >
                {isSelected ? (
                  <span className="template-check">
                    <Icon name="check" size={13} strokeWidth={2.6} />
                  </span>
                ) : null}
                <div className="template-thumb">
                  <MiniResume template={template.key} />
                </div>
                <div className="template-meta">
                  <div style={{ minWidth: 0 }}>
                    <div className="template-name">{template.name}</div>
                    <span className="badge badge-gray">{template.category}</span>
                  </div>
                  <span className="small muted nowrap">
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="card mt-20">
        <div className="card-body row-between" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div className="row-between" style={{ gap: 12, minWidth: 0 }}>
            <Icon name="info" size={16} />
            <div className="small muted">
              All six templates use a single-column structure so applicant tracking systems can read the
              content in the correct order.
            </div>
          </div>
          <div className="btn-row">
            <Button variant="secondary" onClick={() => navigate('/resumes')}>
              Cancel
            </Button>
            <Button icon="arrowRight" onClick={continueToBuilder}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}