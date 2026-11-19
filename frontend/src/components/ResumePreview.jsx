import React from 'react';

const SAMPLE = {
  fullName: 'Arushmita Singh',
  title: 'Software Developer',
  email: 'arushmita.singh@gmail.com',
  phone: '+91 98765 43210',
  location: 'Kolkata, West Bengal',
  linkedin: 'linkedin.com/in/arushmitasingh',
  github: 'github.com/arushmitasingh',
  summary:
    'Final-year B.Tech student specialising in Java and backend development. Built and deployed REST APIs ' +
    'using Spring Boot and MySQL, with hands-on experience in React front ends and rule-based data ' +
    'analysis. Looking for a full-time software development role.',
  technical: 'Java, Spring Boot, REST API, MySQL, Hibernate, JPA, Git',
  soft: 'Problem solving, Teamwork, Communication',
  languages: 'English, Hindi, Bengali',
  education: [
    {
      school: 'Techno Main Campus, Kolkata',
      degree: 'B.Tech',
      field: 'Computer Science and Engineering',
      startDate: 'Aug 2022',
      endDate: 'Jun 2026',
      gpa: '8.6',
      description: 'Coursework: Data Structures, DBMS, Operating Systems, Computer Networks, Software Engineering.'
    }
  ],
  experience: [
    {
      company: 'CodeCraft Solutions',
      title: 'Java Developer Intern',
      location: 'Kolkata',
      startDate: 'Jun 2025',
      endDate: 'Aug 2025',
      bullets: [
        'Developed 12 REST API endpoints in Spring Boot for an inventory management module used by 40+ internal users.',
        'Reduced average report generation time by 35% by adding pagination and indexed queries in MySQL.',
        'Wrote 30 unit tests with JUnit and Mockito, raising backend test coverage from 45% to 78%.'
      ]
    }
  ],
  projects: [
    {
      name: 'Automated Resume Builder',
      tech: 'React, Spring Boot, MySQL',
      startDate: 'Jan 2026',
      endDate: 'Apr 2026',
      link: 'github.com/arushmitasingh/resume-builder',
      description:
        'Built a rule-based resume analysis platform that scores resumes across six sections and reports missing ' +
        'job-description keywords. Handles 200+ resumes with JWT authentication.'
    },
    {
      name: 'Campus Attendance Portal',
      tech: 'React, Node.js, PostgreSQL',
      startDate: 'Aug 2025',
      endDate: 'Nov 2025',
      link: 'github.com/arushmitasingh/attendance',
      description:
        'Developed a web portal used by 1,200 students for daily attendance marking, reducing register time by 50%.'
    }
  ],
  certifications: [
    { name: 'Oracle Java SE 8 Associate', issuer: 'Oracle', year: '2024' }
  ]
};

function merge(resume) {
  if (!resume) return SAMPLE;
  const hasContent = resume.fullName || resume.education?.length || resume.experience?.length;
  if (hasContent) return resume;
  return { ...SAMPLE, ...resume };
}

function contactParts(resume) {
  return [resume.phone, resume.email, resume.location, resume.linkedin, resume.github].filter(Boolean);
}

function dateRange(start, end, current) {
  if (!start && !end) return null;
  if (current || (!end && start)) return `${start} — Present`;
  return `${start || ''} — ${end || ''}`;
}

function Empty({ children }) {
  return <div className="doc-empty">{children}</div>;
}

export default function ResumePreview({ resume, template = 'modern' }) {
  const data = merge(resume);

  const technical = (data.skillTechnical || '').split(',').map((s) => s.trim()).filter(Boolean);
  const soft = (data.skillSoft || '').split(',').map((s) => s.trim()).filter(Boolean);
  const languages = (data.skillLanguages || '').split(',').map((s) => s.trim()).filter(Boolean);

  const sections = [
    {
      key: 'summary',
      title: 'Professional Summary',
      body: data.professionalSummary ? (
        <div className="doc-paragraph">{data.professionalSummary}</div>
      ) : (
        <Empty>Add a 2–3 line professional summary.</Empty>
      )
    },
    {
      key: 'education',
      title: 'Education',
      body:
        data.education && data.education.length ? (
          data.education.map((item, i) => (
            <div className="doc-entry" key={i}>
              <div className="doc-entry-head">
                <div>
                  <div className="doc-entry-title">{item.school || 'Institution name'}</div>
                  <div className="doc-entry-sub">
                    {[item.degree, item.field].filter(Boolean).join(', ') || 'Degree, Field of study'}
                    {item.gpa ? ` · CGPA ${item.gpa}` : ''}
                  </div>
                </div>
                <div className="doc-entry-date">{dateRange(item.startDate, item.endDate)}</div>
              </div>
              {item.description ? <div className="doc-paragraph">{item.description}</div> : null}
            </div>
          ))
        ) : (
          <Empty>No education entries yet.</Empty>
        )
    },
    {
      key: 'skills',
      title: 'Skills',
      body:
        technical.length || soft.length || languages.length ? (
          <div>
            {technical.length ? (
              <div className="doc-skill-row">
                <span className="doc-skill-label">Technical:</span>
                <span>{technical.join(', ')}</span>
              </div>
            ) : null}
            {soft.length ? (
              <div className="doc-skill-row">
                <span className="doc-skill-label">Soft skills:</span>
                <span>{soft.join(', ')}</span>
              </div>
            ) : null}
            {languages.length ? (
              <div className="doc-skill-row">
                <span className="doc-skill-label">Languages:</span>
                <span>{languages.join(', ')}</span>
              </div>
            ) : null}
          </div>
        ) : (
          <Empty>No skills added yet.</Empty>
        )
    },
    {
      key: 'experience',
      title: 'Experience',
      body:
        data.experience && data.experience.length ? (
          data.experience.map((item, i) => (
            <div className="doc-entry" key={i}>
              <div className="doc-entry-head">
                <div>
                  <div className="doc-entry-title">{item.title || 'Job title'}</div>
                  <div className="doc-entry-sub">
                    {[item.company, item.location].filter(Boolean).join(', ') || 'Company'}
                  </div>
                </div>
                <div className="doc-entry-date">{dateRange(item.startDate, item.endDate, item.current)}</div>
              </div>
              {item.description ? <div className="doc-paragraph">{item.description}</div> : null}
              {item.bullets && item.bullets.filter(Boolean).length ? (
                <ul className="doc-bullets">
                  {item.bullets.filter(Boolean).map((bullet, j) => (
                    <li key={j}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))
        ) : (
          <Empty>No work experience yet — add internships or part-time roles.</Empty>
        )
    },
    {
      key: 'projects',
      title: 'Projects',
      body:
        data.projects && data.projects.length ? (
          data.projects.map((item, i) => (
            <div className="doc-entry" key={i}>
              <div className="doc-entry-head">
                <div>
                  <div className="doc-entry-title">{item.name || 'Project name'}</div>
                  <div className="doc-entry-sub">{item.tech || 'Technologies used'}</div>
                </div>
                <div className="doc-entry-date">{dateRange(item.startDate, item.endDate)}</div>
              </div>
              {item.description ? <div className="doc-paragraph">{item.description}</div> : null}
              {item.link ? <div className="doc-entry-date">{item.link}</div> : null}
            </div>
          ))
        ) : (
          <Empty>No projects added yet.</Empty>
        )
    },
    {
      key: 'certifications',
      title: 'Certifications',
      body:
        data.certifications && data.certifications.length ? (
          data.certifications.map((item, i) => (
            <div className="doc-entry" key={i}>
              <div className="doc-entry-title">{item.name || 'Certification name'}</div>
              <div className="doc-entry-sub">
                {[item.issuer, item.year].filter(Boolean).join(' · ') || 'Issuer'}
              </div>
            </div>
          ))
        ) : (
          <Empty>No certifications listed.</Empty>
        )
    }
  ];

  return (
    <div className={`doc doc-t-${template}`} style={{ fontFamily: 'inherit' }}>
      <header className="doc-header">
        <h1 className="doc-name">{data.fullName || 'Your Name'}</h1>
        <div className="doc-title">{data.targetJobTitle || data.title || 'Professional title'}</div>
        <div className="doc-contact">
          {contactParts(data).length ? (
            contactParts(data).map((part) => <span key={part}>{part}</span>)
          ) : (
            <Empty>Add your contact details</Empty>
          )}
        </div>
      </header>

      {sections.map((section) => (
        <section className="doc-section" key={section.key}>
          <div className="doc-section-title">{section.title}</div>
          {section.body}
        </section>
      ))}
    </div>
  );
}