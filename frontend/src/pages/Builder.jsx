import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { analysisApi, downloadPdf, resumeApi, templateApi } from '../api';
import Icon from '../components/Icon';
import ResumePreview from '../components/ResumePreview';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  PageHead,
  Textarea
} from '../components/ui';

const STEPS = [
  { key: 'personal', label: 'Personal' },
  { key: 'education', label: 'Education' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'review', label: 'Review' }
];

const BLANK = {
  title: '',
  template: 'modern',
  targetJobTitle: '',
  targetJobDescription: '',
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  professionalSummary: '',
  skillTechnical: '',
  skillSoft: '',
  skillLanguages: '',
  education: [],
  experience: [],
  projects: [],
  certifications: []
};

const emptyEducation = { school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', description: '' };
const emptyExperience = {
  company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '', bullets: []
};
const emptyProject = { name: '', link: '', startDate: '', endDate: '', description: '', tech: '' };
const emptyCertification = { name: '', issuer: '', year: '' };

/* ------------------------------------------------------------- primitives */

function Stepper({ current, onJump }) {
  return (
    <div className="steps">
      {STEPS.map((step, index) => {
        const state = index === current ? 'current' : index < current ? 'done' : '';
        return (
          <div
            key={step.key}
            className={`step ${state} ${index <= current ? 'clickable' : ''}`}
            onClick={() => index <= current && onJump(index)}
            role={index <= current ? 'button' : undefined}
            tabIndex={index <= current ? 0 : undefined}
            onKeyDown={(e) => {
              if (index <= current && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onJump(index);
              }
            }}
          >
            <div className="step-dot">
              {index < current ? <Icon name="check" size={12} strokeWidth={2.8} /> : index + 1}
            </div>
            <div className="step-label">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function RepeatItem({ index, title, onRemove, children }) {
  return (
    <div className="repeat-item">
      <div className="repeat-item-head">
        <span className="repeat-index">{title} {index + 1}</span>
        <button type="button" className="btn btn-danger btn-sm" onClick={onRemove} icon="trash">
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

function AddRow({ label, onClick, icon = 'plus' }) {
  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={onClick} icon={icon}>
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ steps */

function PersonalStep({ form, set }) {
  return (
    <Card>
      <div className="card-head">
        <h2>Personal Information</h2>
        <span className="badge badge-blue">Step 1 of 6</span>
      </div>
      <div className="card-body">
        <p className="small muted mb-16">
          These details appear at the top of your resume and are checked for completeness by the analysis
          engine.
        </p>

        <div className="form-grid">
          <Field label="Full Name" required>
            <Input
              value={form.fullName}
              onChange={(e) => set({ fullName: e.target.value })}
              placeholder="Arushmita Singh"
            />
          </Field>
          <Field label="Professional Title">
            <Input
              value={form.targetJobTitle}
              onChange={(e) => set({ targetJobTitle: e.target.value })}
              placeholder="Software Developer"
            />
          </Field>
          <Field label="Email Address" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="arushmita.singh@gmail.com"
            />
          </Field>
          <Field label="Phone Number" required>
            <Input
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Location" required>
            <Input
              value={form.location}
              onChange={(e) => set({ location: e.target.value })}
              placeholder="Kolkata, West Bengal"
            />
          </Field>
          <Field label="LinkedIn" hint="Full URL, for example linkedin.com/in/username">
            <Input
              value={form.linkedin}
              onChange={(e) => set({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/arushmitasingh"
            />
          </Field>
          <Field label="GitHub">
            <Input
              value={form.github}
              onChange={(e) => set({ github: e.target.value })}
              placeholder="github.com/arushmitasingh"
            />
          </Field>
          <Field label="Portfolio" hint="Optional — used if GitHub is empty">
            <Input
              value={form.portfolio}
              onChange={(e) => set({ portfolio: e.target.value })}
              placeholder="arushmitasingh.dev"
            />
          </Field>
        </div>

        <Field
          className="mt-16"
          label="Professional Summary"
          hint={`${form.professionalSummary.length} characters · 120 or more is recommended`}
        >
          <Textarea
            rows={5}
            value={form.professionalSummary}
            onChange={(e) => set({ professionalSummary: e.target.value })}
            placeholder="Final-year B.Tech student specialising in Java and backend development, with hands-on experience building REST APIs in Spring Boot…"
          />
        </Field>
      </div>
    </Card>
  );
}

function EducationStep({ form, set }) {
  const list = form.education || [];

  const patch = (index, update) =>
    set({ education: list.map((item, i) => (i === index ? { ...item, ...update } : item)) });

  return (
    <Card>
      <div className="card-head">
        <h2>Education</h2>
        <span className="badge badge-blue">Step 2 of 6</span>
      </div>
      <div className="card-body">
        <p className="small muted mb-16">
          Add your qualifications most recent first. Include dates, CGPA/GPA and relevant coursework —
          the analysis engine checks all three.
        </p>

        {list.length === 0 ? (
          <div className="alert alert-plain">
            <Icon name="info" size={16} />
            <div>No education entries yet. Add at least one to complete this section.</div>
          </div>
        ) : null}

        {list.map((item, index) => (
          <RepeatItem
            key={index}
            index={index}
            title="Education"
            onRemove={() => set({ education: list.filter((_, i) => i !== index) })}
          >
            <div className="form-grid">
              <Field label="Institution">
                <Input
                  value={item.school}
                  onChange={(e) => patch(index, { school: e.target.value })}
                  placeholder="Techno Main Campus, Kolkata"
                />
              </Field>
              <Field label="Degree">
                <Input
                  value={item.degree}
                  onChange={(e) => patch(index, { degree: e.target.value })}
                  placeholder="B.Tech"
                />
              </Field>
              <Field label="Field of Study">
                <Input
                  value={item.field}
                  onChange={(e) => patch(index, { field: e.target.value })}
                  placeholder="Computer Science and Engineering"
                />
              </Field>
              <Field label="CGPA / GPA">
                <Input
                  value={item.gpa}
                  onChange={(e) => patch(index, { gpa: e.target.value })}
                  placeholder="8.6"
                />
              </Field>
              <Field label="Start Date">
                <Input
                  value={item.startDate}
                  onChange={(e) => patch(index, { startDate: e.target.value })}
                  placeholder="Aug 2022"
                />
              </Field>
              <Field label="End Date">
                <Input
                  value={item.endDate}
                  onChange={(e) => patch(index, { endDate: e.target.value })}
                  placeholder="Jun 2026"
                />
              </Field>
            </div>
            <Field label="Coursework or Achievements">
              <Textarea
                rows={2}
                value={item.description}
                onChange={(e) => patch(index, { description: e.target.value })}
                placeholder="Coursework: Data Structures, DBMS, Operating Systems, Computer Networks."
              />
            </Field>
          </RepeatItem>
        ))}

        <AddRow label="Add Education" onClick={() => set({ education: [...list, { ...emptyEducation }] })} />
      </div>
    </Card>
  );
}

function ExperienceStep({ form, set }) {
  const list = form.experience || [];

  const patch = (index, update) =>
    set({ experience: list.map((item, i) => (i === index ? { ...item, ...update } : item)) });

  const setBullet = (index, bulletIndex, value) => {
    const bullets = [...(list[index].bullets || [])];
    bullets[bulletIndex] = value;
    patch(index, { bullets });
  };

  return (
    <Card>
      <div className="card-head">
        <h2>Experience</h2>
        <span className="badge badge-blue">Step 3 of 6</span>
      </div>
      <div className="card-body">
        <p className="small muted mb-16">
          Include internships, part-time work and volunteer roles. Start every bullet with a strong action
          verb and include a measurable result where possible.
        </p>

        {list.length === 0 ? (
          <div className="alert alert-plain">
            <Icon name="info" size={16} />
            <div>
              No experience entries yet. If you have none, skip this step — the analysis will flag it and you
              can compensate with strong project entries.
            </div>
          </div>
        ) : null}

        {list.map((item, index) => (
          <RepeatItem
            key={index}
            index={index}
            title="Experience"
            onRemove={() => set({ experience: list.filter((_, i) => i !== index) })}
          >
            <div className="form-grid">
              <Field label="Job Title">
                <Input
                  value={item.title}
                  onChange={(e) => patch(index, { title: e.target.value })}
                  placeholder="Java Developer Intern"
                />
              </Field>
              <Field label="Company">
                <Input
                  value={item.company}
                  onChange={(e) => patch(index, { company: e.target.value })}
                  placeholder="CodeCraft Solutions"
                />
              </Field>
              <Field label="Location">
                <Input
                  value={item.location}
                  onChange={(e) => patch(index, { location: e.target.value })}
                  placeholder="Kolkata"
                />
              </Field>
              <Field label="Start Date">
                <Input
                  value={item.startDate}
                  onChange={(e) => patch(index, { startDate: e.target.value })}
                  placeholder="Jun 2025"
                />
              </Field>
              <Field label="End Date" hint="Leave empty if this is your current role">
                <Input
                  value={item.endDate}
                  onChange={(e) => patch(index, { endDate: e.target.value })}
                  placeholder="Aug 2025"
                />
              </Field>
              <Field label="Current role">
                <div style={{ paddingTop: 8 }}>
                  <Checkbox
                    label="I currently work here"
                    checked={!!item.current}
                    onChange={(e) => patch(index, { current: e.target.checked, endDate: e.target.checked ? '' : item.endDate })}
                  />
                </div>
              </Field>
            </div>

            <Field label="Achievement Bullets" hint="One achievement per line, 15 words or fewer">
              {(item.bullets || []).map((bullet, bulletIndex) => (
                <div className="bullet-row" key={bulletIndex}>
                  <span className="bullet-marker">
                    <Icon name="minus" size={13} />
                  </span>
                  <Input
                    value={bullet}
                    onChange={(e) => setBullet(index, bulletIndex, e.target.value)}
                    placeholder="Developed 12 REST API endpoints in Spring Boot used by 40+ internal users."
                  />
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() =>
                      patch(index, {
                        bullets: (item.bullets || []).filter((_, i) => i !== bulletIndex)
                      })
                    }
                    title="Remove bullet"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              ))}
              <div className="mt-8">
                <AddRow
                  label="Add Bullet"
                  onClick={() => patch(index, { bullets: [...(item.bullets || []), ''] })}
                />
              </div>
            </Field>
          </RepeatItem>
        ))}

        <AddRow label="Add Experience" onClick={() => set({ experience: [...list, { ...emptyExperience }] })} />
      </div>
    </Card>
  );
}

function SkillsStep({ form, set }) {
  return (
    <Card>
      <div className="card-head">
        <h2>Skills</h2>
        <span className="badge badge-blue">Step 4 of 6</span>
      </div>
      <div className="card-body">
        <p className="small muted mb-16">
          Separate each skill with a comma. The analysis engine counts how many of your skills appear in the
          target job description, so list concrete technologies rather than broad categories.
        </p>

        <Field
          label="Technical Skills"
          required
          hint="Comma separated · at least 6 recommended"
        >
          <Textarea
            rows={2}
            value={form.skillTechnical}
            onChange={(e) => set({ skillTechnical: e.target.value })}
            placeholder="Java, Spring Boot, REST API, MySQL, Hibernate, JPA, Git"
          />
        </Field>

        <Field label="Soft Skills" hint="Comma separated">
          <Input
            value={form.skillSoft}
            onChange={(e) => set({ skillSoft: e.target.value })}
            placeholder="Problem solving, Teamwork, Communication, Time management"
          />
        </Field>

        <Field label="Languages" hint="Comma separated">
          <Input
            value={form.skillLanguages}
            onChange={(e) => set({ skillLanguages: e.target.value })}
            placeholder="English, Hindi, Bengali"
          />
        </Field>

        <Field label="Certifications" hint="Optional — name, issuer and year">
          <div className="stack-sm">
            {(form.certifications || []).map((item, index) => (
              <div key={index} className="repeat-item" style={{ marginBottom: 0 }}>
                <div className="repeat-item-head">
                  <span className="repeat-index">Certification {index + 1}</span>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      set({ certifications: form.certifications.filter((_, i) => i !== index) })
                    }
                    icon="trash"
                  >
                    Remove
                  </button>
                </div>
                <div className="form-grid form-grid-3">
                  <Field label="Name">
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        set({
                          certifications: form.certifications.map((c, i) =>
                            i === index ? { ...c, name: e.target.value } : c
                          )
                        })
                      }
                      placeholder="Oracle Java SE 8"
                    />
                  </Field>
                  <Field label="Issuer">
                    <Input
                      value={item.issuer}
                      onChange={(e) =>
                        set({
                          certifications: form.certifications.map((c, i) =>
                            i === index ? { ...c, issuer: e.target.value } : c
                          )
                        })
                      }
                      placeholder="Oracle"
                    />
                  </Field>
                  <Field label="Year">
                    <Input
                      value={item.year}
                      onChange={(e) =>
                        set({
                          certifications: form.certifications.map((c, i) =>
                            i === index ? { ...c, year: e.target.value } : c
                          )
                        })
                      }
                      placeholder="2024"
                    />
                  </Field>
                </div>
              </div>
            ))}
            <div>
              <AddRow
                label="Add Certification"
                onClick={() => set({ certifications: [...(form.certifications || []), { ...emptyCertification }] })}
                icon="award"
              />
            </div>
          </div>
        </Field>
      </div>
    </Card>
  );
}

function ProjectsStep({ form, set }) {
  const list = form.projects || [];
  const patch = (index, update) =>
    set({ projects: list.map((item, i) => (i === index ? { ...item, ...update } : item)) });

  return (
    <Card>
      <div className="card-head">
        <h2>Projects</h2>
        <span className="badge badge-blue">Step 5 of 6</span>
      </div>
      <div className="card-body">
        <p className="small muted mb-16">
          For students this is usually the strongest section. Describe the problem, your approach and the
          outcome, and link the repository or deployed demo.
        </p>

        {list.length === 0 ? (
          <div className="alert alert-plain">
            <Icon name="info" size={16} />
            <div>No projects yet. Add at least two academic or personal projects.</div>
          </div>
        ) : null}

        {list.map((item, index) => (
          <RepeatItem
            key={index}
            index={index}
            title="Project"
            onRemove={() => set({ projects: list.filter((_, i) => i !== index) })}
          >
            <div className="form-grid">
              <Field label="Project Name">
                <Input
                  value={item.name}
                  onChange={(e) => patch(index, { name: e.target.value })}
                  placeholder="Automated Resume Builder"
                />
              </Field>
              <Field label="Technologies" hint="Comma separated">
                <Input
                  value={item.tech}
                  onChange={(e) => patch(index, { tech: e.target.value })}
                  placeholder="React, Spring Boot, MySQL"
                />
              </Field>
              <Field label="Start Date">
                <Input
                  value={item.startDate}
                  onChange={(e) => patch(index, { startDate: e.target.value })}
                  placeholder="Jan 2026"
                />
              </Field>
              <Field label="End Date">
                <Input
                  value={item.endDate}
                  onChange={(e) => patch(index, { endDate: e.target.value })}
                  placeholder="Apr 2026"
                />
              </Field>
            </div>
            <Field label="Repository or Demo Link">
              <Input
                value={item.link}
                onChange={(e) => patch(index, { link: e.target.value })}
                placeholder="github.com/username/project"
              />
            </Field>
            <Field label="Description" hint="80 characters or more, including measurable detail">
              <Textarea
                rows={4}
                value={item.description}
                onChange={(e) => patch(index, { description: e.target.value })}
                placeholder="Built a rule-based resume analysis platform that scores resumes across six sections and reports missing job-description keywords. Handles 200+ resumes."
              />
            </Field>
          </RepeatItem>
        ))}

        <AddRow label="Add Project" onClick={() => set({ projects: [...list, { ...emptyProject }] })} icon="code" />
      </div>
    </Card>
  );
}

function ReviewStep({ form, onJump, onAnalyze, onSave, saving, resumeId }) {
  const completeness = [
    { label: 'Personal information', ok: !!(form.fullName && form.email && form.phone && form.location), count: null },
    { label: 'Education entries', ok: (form.education || []).length > 0, count: (form.education || []).length },
    { label: 'Experience entries', ok: (form.experience || []).length > 0, count: (form.experience || []).length },
    { label: 'Technical skills', ok: !!form.skillTechnical, count: null },
    { label: 'Project entries', ok: (form.projects || []).length > 0, count: (form.projects || []).length }
  ];

  const filled = completeness.filter((row) => row.ok).length;

  return (
    <Card>
      <div className="card-head">
        <h2>Review</h2>
        <span className="badge badge-blue">Step 6 of 6</span>
      </div>
      <div className="card-body">
        <p className="small muted mb-16">
          Check each section before running the analysis. You can jump back to any step using the progress
          indicator above.
        </p>

        <div className="stack-sm mb-20">
          {completeness.map((row, index) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-alt)'
              }}
            >
              <span style={{ color: row.ok ? 'var(--green-600)' : 'var(--amber-600)' }}>
                <Icon name={row.ok ? 'checkCircle' : 'alert'} size={17} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{row.label}</div>
                <div className="small muted">
                  {row.ok ? 'Filled in' : 'Missing — the analysis will flag this section'}
                  {row.count !== null ? ` · ${row.count} ${row.count === 1 ? 'entry' : 'entries'}` : ''}
                </div>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => onJump(index)}>
                Edit
              </button>
            </div>
          ))}
        </div>

        <Alert tone={filled >= 4 ? 'success' : 'warn'} title={`${filled} of 5 sections filled in`}>
          {filled >= 4
            ? 'This resume is ready for rule-based analysis. Run the analysis to get a score, section statuses and keyword matching.'
            : 'Fill in the missing sections first, or run the analysis now to see exactly what is holding the score back.'}
        </Alert>

        <div className="btn-row">
          <Button variant="secondary" onClick={onSave} loading={saving} icon="save">
            Save Resume
          </Button>
          <Button onClick={onAnalyze} disabled={!resumeId && !form.title.trim()} icon="chart">
            Analyze Resume
          </Button>
        </div>

        <p className="small muted mt-12">
          A resume name is required before saving. Enter one in the top bar of this page.
        </p>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ page */

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = id === 'new';

  const [form, setForm] = useState(() => ({ ...BLANK, template: searchParams.get('template') || 'modern' }));
  const [templates, setTemplates] = useState([]);
  const [step, setStep] = useState(0);
  const [resumeId, setResumeId] = useState(null);
  const [zoom, setZoom] = useState(0.7);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(!isNew);

  const skipFetchRef = useRef(null);

  const set = useCallback((update) => setForm((prev) => ({ ...prev, ...update })), []);

  useEffect(() => {
    templateApi
      .list()
      .then(setTemplates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    if (skipFetchRef.current === id) {
      skipFetchRef.current = null;
      setResumeId(Number(id));
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    resumeApi
      .get(id)
      .then((resume) => {
        if (!active) return;
        setForm({
          ...BLANK,
          ...resume,
          education: resume.education || [],
          experience: (resume.experience || []).map((e) => ({ ...e, bullets: e.bullets || [] })),
          projects: resume.projects || [],
          certifications: resume.certifications || []
        });
        setResumeId(resume.id);
      })
      .catch((err) => setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isNew]);

  useEffect(() => {
    document.title = `${isNew ? 'Create Your Resume' : 'Edit Resume'} — ResumeBuilder`;
  }, [isNew]);

  const payload = useMemo(() => ({ ...form, template: form.template || 'modern' }), [form]);

  async function save() {
    if (!form.title.trim()) {
      setError('Enter a resume name before saving.');
      return null;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = resumeId
        ? await resumeApi.update(resumeId, payload)
        : await resumeApi.create(payload);
      setResumeId(saved.id);
      if (!resumeId) {
        skipFetchRef.current = String(saved.id);
        navigate(`/builder/${saved.id}`, { replace: true });
      }
      return saved;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function saveAndContinue() {
    const saved = await save();
    if (saved) {
      setNotice('Saved. Your progress is stored on the server.');
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }

  async function runAnalysis() {
    const saved = await save();
    if (!saved) return;
    setSaving(true);
    try {
      await analysisApi.run(saved.id, {
        jobTitle: form.targetJobTitle || null,
        jobDescription: form.targetJobDescription || null
      });
      navigate(`/analysis/${saved.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function download() {
    setError('');
    try {
      if (!resumeId) {
        setError('Save the resume before downloading a PDF.');
        return;
      }
      await downloadPdf(resumeId, `${form.title || 'resume'}.pdf`);
    } catch (err) {
      setError(err.message);
    }
  }

  const templateOptions = templates.length
    ? templates.map((t) => ({ value: t.key, label: t.name }))
    : [
        { value: 'modern', label: 'Modern' },
        { value: 'classic', label: 'Classic' },
        { value: 'professional', label: 'Professional' },
        { value: 'minimal', label: 'Minimal' },
        { value: 'elegant', label: 'Elegant' },
        { value: 'simple', label: 'Simple' }
      ];

  return (
    <div className="page page-wide">
      <PageHead
        title={isNew ? 'Create Your Resume' : 'Edit Resume'}
        subtitle="Fill in each step and watch the live preview update on the right."
        actions={
          <div className="btn-row">
            <Button variant="secondary" icon="download" onClick={download} disabled={!resumeId}>
              Download PDF
            </Button>
            <Button icon="save" onClick={save} loading={saving}>
              Save
            </Button>
          </div>
        }
      />

      <div className="card card-pad mb-16" style={{ padding: '14px 18px' }}>
        <Field label="Resume Name" required hint="Used to identify this resume in your dashboard and analysis history.">
          <Input
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Software Developer Resume"
            style={{ maxWidth: 420 }}
          />
        </Field>
      </div>

      <Stepper current={step} onJump={setStep} />

      {error ? <Alert tone="error">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <div className="builder-layout">
        <div className="builder-pane">
          {loading ? (
            <Card>
              <div className="card-body">
                <div className="skeleton" style={{ height: 15, width: '40%', marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 36, marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 36, marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 36 }} />
              </div>
            </Card>
          ) : (
            <>
              {step === 0 ? <PersonalStep form={form} set={set} /> : null}
              {step === 1 ? <EducationStep form={form} set={set} /> : null}
              {step === 2 ? <ExperienceStep form={form} set={set} /> : null}
              {step === 3 ? <SkillsStep form={form} set={set} /> : null}
              {step === 4 ? <ProjectsStep form={form} set={set} /> : null}
              {step === 5 ? (
                <ReviewStep
                  form={form}
                  resumeId={resumeId}
                  saving={saving}
                  onJump={setStep}
                  onSave={save}
                  onAnalyze={runAnalysis}
                />
              ) : null}

              <div className="btn-row mt-20" style={{ justifyContent: 'space-between' }}>
                <Button
                  variant="secondary"
                  icon="chevronLeft"
                  onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                  disabled={step === 0}
                >
                  Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button iconRight="chevronRight" onClick={saveAndContinue} loading={saving}>
                    Save &amp; Continue
                  </Button>
                ) : (
                  <Button icon="chart" onClick={runAnalysis} loading={saving}>
                    Save &amp; Analyze
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="preview-pane">
          <div className="card">
            <div className="preview-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="eye" size={15} />
                <span className="small" style={{ fontWeight: 600 }}>Live Preview</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  className="select input-sm"
                  style={{ width: 130 }}
                  value={form.template}
                  onChange={(e) => set({ template: e.target.value })}
                  aria-label="Preview template"
                >
                  {templateOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="zoom-group">
                  <button type="button" onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} title="Zoom out">
                    <Icon name="minus" size={13} />
                  </button>
                  <span className="zoom-value">{Math.round(zoom * 100)}%</span>
                  <button type="button" onClick={() => setZoom((z) => Math.min(1.2, +(z + 0.1).toFixed(2)))} title="Zoom in">
                    <Icon name="plus" size={13} />
                  </button>
                </div>
              </div>
            </div>

            <div className="preview-stage">
              <div style={{ zoom }}>
                <ResumePreview resume={form} template={form.template} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}