import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/Layout';
import Icon from '../components/Icon';
import MiniResume from '../components/MiniResume';
import { Button } from '../components/ui';

const FEATURES = [
  {
    icon: 'clipboard',
    title: 'Guided Resume Creation',
    text: 'A six-step form covering personal details, education, experience, skills and projects. Save at every step and come back later.'
  },
  {
    icon: 'layout',
    title: 'Multiple Professional Templates',
    text: 'Six ATS-safe layouts — Modern, Classic, Professional, Minimal, Elegant and Simple. Switch templates without losing content.'
  },
  {
    icon: 'target',
    title: 'ATS and Keyword Analysis',
    text: 'Paste a job description and see exactly which keywords your resume covers and which ones are missing.'
  },
  {
    icon: 'download',
    title: 'One-Click PDF Export',
    text: 'Download a print-ready A4 PDF generated on the server, formatted so applicant tracking systems can read it.'
  }
];

const CHECKS = [
  'Section completeness across six resume sections',
  'Job description keyword matching with missing-term list',
  'Experience quality checks for action verbs and measurable results',
  'Formatting and structure checks for dates, links and contact details',
  'A single 0-100 score with prioritised, actionable suggestions',
  'Full analysis history so you can track improvement over time'
];

const TEMPLATES = [
  { key: 'modern', name: 'Modern', category: 'Modern' },
  { key: 'classic', name: 'Classic', category: 'Classic' },
  { key: 'professional', name: 'Professional', category: 'Professional' },
  { key: 'minimal', name: 'Minimal', category: 'Minimal' },
  { key: 'elegant', name: 'Elegant', category: 'Professional' },
  { key: 'simple', name: 'Simple', category: 'Minimal' }
];

const STACK = [
  { label: 'Frontend', value: 'React 18 + Vite, React Router' },
  { label: 'Backend', value: 'Spring Boot REST API, Spring Security + JWT' },
  { label: 'Database', value: 'MySQL / PostgreSQL (H2 for local dev)' },
  { label: 'Analysis', value: 'Rule-based engine — no machine learning' },
  { label: 'Export', value: 'Server-side PDF generation' }
];

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'ResumeBuilder — Build a Better Resume';
  }, []);

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" className="sidebar-brand" style={{ borderBottom: 0, height: 'auto', padding: 0, textDecoration: 'none' }}>
          <BrandMark />
          <span className="brand-name">
            Resume<span>Builder</span>
          </span>
        </Link>

        <div className="landing-nav-links">
          <button type="button" className="landing-nav-link" onClick={() => scrollTo('home')}>
            Home
          </button>
          <button type="button" className="landing-nav-link" onClick={() => scrollTo('features')}>
            Features
          </button>
          <button type="button" className="landing-nav-link" onClick={() => scrollTo('templates')}>
            Templates
          </button>
          <button type="button" className="landing-nav-link" onClick={() => scrollTo('how')}>
            How it works
          </button>
        </div>

        <div className="landing-nav-right">
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button onClick={() => navigate('/signup')}>Get Started</Button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <span className="eyebrow">
            <Icon name="shield" size={13} />
            ATS-friendly resume builder
          </span>
          <h1 className="hero-title">Build a Better Resume</h1>
          <p className="hero-subtitle">
            Create professional, ATS-friendly resumes and check them before you apply.
          </p>

          <div className="card card-pad" style={{ textAlign: 'left', maxWidth: 620, margin: '0 auto 28px' }}>
            <div className="grid grid-2" style={{ gap: 14 }}>
              {FEATURES.map((feature) => (
                <div key={feature.title} style={{ display: 'flex', gap: 11 }}>
                  <span style={{ color: 'var(--blue-600)', flex: '0 0 auto', marginTop: 1 }}>
                    <Icon name={feature.icon} size={17} />
                  </span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 650 }}>{feature.title}</div>
                    <div className="small muted">{feature.text.split('.')[0]}.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-actions">
            <Button size="lg" icon="arrowRight" iconRight={false} onClick={() => navigate('/signup')}>
              Get Started
            </Button>
            <Button size="lg" variant="secondary" onClick={() => scrollTo('how')}>
              Learn More
            </Button>
          </div>
          <p className="hero-note">Free account · No credit card required · PDF export included</p>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-container">
            <div className="section-head">
              <h2>Everything you need before you apply</h2>
              <p>
                ResumeBuilder focuses on the two things that decide how far your resume gets: how it reads,
                and whether an applicant tracking system can parse it.
              </p>
            </div>
            <div className="grid grid-4">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="feature-card">
                  <div className="feature-icon">
                    <Icon name={feature.icon} size={18} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="landing-section landing-section-alt">
          <div className="landing-container">
            <div className="grid grid-2" style={{ gap: 44, alignItems: 'start' }}>
              <div>
                <div className="section-head" style={{ textAlign: 'left', margin: '0 0 22px' }}>
                  <h2>How the analysis works</h2>
                  <p>
                    The analysis engine is entirely rule-based. No AI writes or rewrites your content —
                    it only measures what you have already written.
                  </p>
                </div>
                <div className="spec-list">
                  {CHECKS.map((check) => (
                    <div key={check} className="spec-item">
                      <Icon name="check" size={15} />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
                <div className="btn-row mt-20">
                  <Button onClick={() => navigate('/signup')} icon="arrowRight">
                    Create your resume
                  </Button>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h2>Project architecture</h2>
                  <span className="badge badge-blue">B.Tech final-year project</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {STACK.map((row, index) => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '13px 20px',
                        borderBottom: index === STACK.length - 1 ? 0 : '1px solid var(--border)'
                      }}
                    >
                      <div style={{ width: 108, flex: '0 0 auto', fontSize: 12.5, fontWeight: 650, color: 'var(--slate-500)' }}>
                        {row.label}
                      </div>
                      <div style={{ fontSize: 13.5 }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="templates" className="landing-section">
          <div className="landing-container">
            <div className="section-head">
              <h2>Six professional templates</h2>
              <p>
                Every template is single-column and ATS-safe, so the structure stays readable by parsing
                software and by the recruiter reading it on screen.
              </p>
            </div>
            <div className="grid grid-3">
              {TEMPLATES.map((template) => (
                <div key={template.key} className="card card-hover" style={{ overflow: 'hidden' }}>
                  <div className="template-thumb">
                    <MiniResume template={template.key} />
                  </div>
                  <div className="template-meta">
                    <div>
                      <div className="template-name">{template.name}</div>
                      <span className="badge badge-gray">{template.category}</span>
                    </div>
                    <Icon name="chevronRight" size={15} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <h2>Start building your resume in five minutes</h2>
          <p>Create an account, fill in the guided form, then run the analysis and fix what it flags.</p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <Button size="lg" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrandMark size={22} />
            <strong style={{ fontSize: 13.5 }}>ResumeBuilder</strong>
            <span className="muted">— Automated Resume Builder with Resume Analysis</span>
          </div>
          <div className="landing-footer-links">
            <span>React + Spring Boot</span>
            <span>Rule-based analysis</span>
            <span>PDF export</span>
          </div>
        </div>
      </footer>
    </div>
  );
}