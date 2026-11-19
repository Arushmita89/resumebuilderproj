import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { analysisApi } from '../api';
import { useResume } from '../hooks';
import Icon from '../components/Icon';
import { Alert, Button, Card, Field, Input, PageHead, Textarea } from '../components/ui';

const LIMIT = 4000;
const MIN_LENGTH = 80;

const SAMPLE = `We are hiring a Java Developer Intern to work on our internal logistics platform.

Responsibilities:
- Develop and maintain REST APIs using Spring Boot and Java 17
- Design and optimise MySQL schemas, write efficient SQL queries
- Write unit and integration tests with JUnit and Mockito
- Work with Git, CI/CD pipelines and Docker in a Linux environment
- Collaborate with the frontend team that builds dashboards in React
- Participate in code reviews and follow agile scrum ceremonies

Requirements:
- Strong Java and Spring Boot fundamentals
- Hands-on experience with REST APIs, MySQL and relational database design
- Familiarity with Git, Docker and CI/CD tooling
- Understanding of data structures and object-oriented programming
- Good communication and problem-solving skills

Nice to have: Spring Security, Redis, microservices and unit testing experience.`;

export default function JobDescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resume, loading, error } = useResume(id);

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [running, setRunning] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    document.title = 'Analyze Against a Job Description — ResumeBuilder';
  }, []);

  useEffect(() => {
    if (!resume) return;
    setJobTitle(resume.targetJobTitle || '');
    setJobDescription(resume.targetJobDescription || '');
  }, [resume]);

  const count = jobDescription.length;
  const tooShort = count > 0 && count < MIN_LENGTH;

  async function analyze() {
    if (count < MIN_LENGTH) {
      setFormError(`Paste at least ${MIN_LENGTH} characters so keyword matching has something to work with.`);
      return;
    }
    setFormError('');
    setRunning(true);
    try {
      await analysisApi.run(id, {
        jobTitle: jobTitle.trim() || null,
        jobDescription: jobDescription.trim()
      });
      navigate(`/analysis/${id}`);
    } catch (err) {
      setFormError(err.message);
      setRunning(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <PageHead
        title="Analyze Against a Job Description"
        subtitle="Paste the job description you are applying for so the analysis can check keyword coverage."
        breadcrumb={
          <>
            <Link to={`/analysis/${id}`}>Resume Analysis</Link> / Job Description
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <Card>
        <div className="card-body">
          <div className="row-between mb-16" style={{ alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0 }}>
              <h2>{resume ? resume.title : 'Your resume'}</h2>
              <p className="small muted mt-8">
                The job description is saved with this resume, so you can re-run the analysis at any time
                without pasting it again.
              </p>
            </div>
            <span className="badge badge-gray nowrap">{loading ? 'Loading…' : 'Ready'}</span>
          </div>

          <Field label="Target Job Title" hint="Optional — shown on the analysis report header">
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Java Developer Intern"
              style={{ maxWidth: 420 }}
            />
          </Field>

          <Field
            label="Job Description"
            required
            hint={`Paste the full description, including responsibilities and requirements. Minimum ${MIN_LENGTH} characters.`}
          >
            <Textarea
              className="textarea-lg"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value.slice(0, LIMIT))}
              placeholder="Paste the job description here…"
            />
          </Field>

          <div className="row-between" style={{ marginTop: -8, marginBottom: 18 }}>
            <button
              type="button"
              className="link-btn"
              onClick={() => setJobDescription(SAMPLE)}
            >
              Use a sample Java Developer job description
            </button>
            <span className={`char-count ${count > LIMIT * 0.9 ? 'over' : ''}`}>
              {count} / {LIMIT} characters
            </span>
          </div>

          {tooShort ? (
            <Alert tone="warn" title="Description looks too short">
              Keyword extraction needs more text. Most job descriptions are 800–2500 characters.
            </Alert>
          ) : null}

          <div className="btn-row">
            <Button
              size="lg"
              icon="chart"
              loading={running}
              onClick={analyze}
              disabled={loading}
            >
              {running ? 'Analyzing…' : 'Analyze Resume'}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate(`/analysis/${id}`)}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mt-20">
        <div className="card-head">
          <h2>What this analysis checks</h2>
        </div>
        <div className="card-body">
          <div className="spec-list">
            <div className="spec-item">
              <Icon name="target" size={15} />
              <span>
                <strong>Keyword coverage.</strong> The engine extracts up to 15 keywords from the job
                description using a fixed technology dictionary plus term-frequency counting, then reports
                which of them appear in your resume.
              </span>
            </div>
            <div className="spec-item">
              <Icon name="clipboard" size={15} />
              <span>
                <strong>Resume completeness.</strong> Six sections are scored independently — personal
                information, education, experience, skills, projects and formatting.
              </span>
            </div>
            <div className="spec-item">
              <Icon name="sliders" size={15} />
              <span>
                <strong>Formatting and structure.</strong> Checks for valid email and phone formats,
                complete dates, malformed URLs and overly long bullet points.
              </span>
            </div>
            <div className="spec-item">
              <Icon name="shield" size={15} />
              <span>
                <strong>Deterministic results.</strong> Every suggestion is produced by a rule. No content
                is generated or rewritten for you.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}