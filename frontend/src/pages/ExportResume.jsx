import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { downloadPdf } from '../api';
import { formatDate } from '../format';
import { useReport, useResume } from '../hooks';
import Icon from '../components/Icon';
import { Alert, Button, Card, Checkbox, Field, Input, PageHead, StatusBadge } from '../components/ui';

function Row({ label, children }) {
  return (
    <div className="kv-row">
      <span className="kv-key">{label}</span>
      <span className="kv-val">{children}</span>
    </div>
  );
}

export default function ExportResume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resume, loading, error } = useResume(id);
  const { report } = useReport(id);

  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [done, setDone] = useState(false);
  const [confirmPrint, setConfirmPrint] = useState(false);

  useEffect(() => {
    document.title = 'Export Resume — ResumeBuilder';
  }, []);

  useEffect(() => {
    if (resume?.title && !fileName) {
      setFileName(resume.title);
    }
  }, [resume, fileName]);

  const safeName = fileName.trim().replace(/[\\/:*?"<>|]/g, '') || 'resume';

  async function download() {
    setBusy(true);
    setDownloadError('');
    setDone(false);
    try {
      await downloadPdf(id, `${safeName}.pdf`);
      setDone(true);
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function print() {
    window.print();
  }

  const checks = [
    {
      label: 'Name, email and phone present',
      ok: Boolean(resume?.fullName && resume?.email && resume?.phone)
    },
    {
      label: 'At least one experience or project entry',
      ok: Boolean((resume?.experience?.length || 0) + (resume?.projects?.length || 0))
    },
    {
      label: 'Technical skills listed',
      ok: Boolean(resume?.skillTechnical)
    },
    { label: 'No formatting issues', ok: report ? report.formattingIssues.length === 0 : null },
    { label: 'Score of 70 or higher', ok: report ? report.overallScore >= 70 : null }
  ];

  return (
    <div className="page" style={{ maxWidth: 940 }}>
      <PageHead
        title="Export Resume"
        subtitle="Download a print-ready PDF or send the resume to your printer."
        breadcrumb={
          <>
            <Link to={`/analysis/${id}`}>Resume Analysis</Link> / Export
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}
      {downloadError ? <Alert tone="error">{downloadError}</Alert> : null}

      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <Card>
          <div className="card-head">
            <h2>Download PDF</h2>
            {resume ? <StatusBadge status={resume.status} /> : null}
          </div>
          <div className="card-body">
            <p className="small muted mb-16">
              The PDF is generated on the server from your saved resume using the selected template. Only
              content you have entered is included.
            </p>

            <Field label="File Name" hint="A .pdf extension is added automatically.">
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Aarush-Resume"
              />
            </Field>

            <Button
              size="lg"
              icon="download"
              loading={busy}
              onClick={download}
              disabled={loading}
            >
              {busy ? 'Generating PDF…' : 'Download PDF'}
            </Button>

            {done ? (
              <Alert tone="success" title="Download started">
                Check your browser downloads folder for {safeName}.pdf
              </Alert>
            ) : null}

            <div className="divider" />

            <div className="subhead mb-8">Print instead</div>
            <Checkbox
              label="I have reviewed the preview and confirmed the layout fits on one page"
              checked={confirmPrint}
              onChange={(e) => setConfirmPrint(e.target.checked)}
            />
            <div className="btn-row mt-12">
              <Button variant="secondary" icon="printer" onClick={print} disabled={!confirmPrint}>
                Print Resume
              </Button>
            </div>
          </div>
        </Card>

        <div className="stack">
          <Card>
            <div className="card-head">
              <h2>Pre-flight Check</h2>
              <span className="badge badge-gray">Before you send</span>
            </div>
            <div className="card-body">
              <ul className="check-list">
                {checks.map((check) => (
                  <li key={check.label}>
                    <span
                      style={{
                        color:
                          check.ok === null
                            ? 'var(--slate-400)'
                            : check.ok
                              ? 'var(--green-600)'
                              : 'var(--amber-600)'
                      }}
                    >
                      <Icon
                        name={
                          check.ok === null ? 'clock' : check.ok ? 'checkCircle' : 'alert'
                        }
                        size={16}
                      />
                    </span>
                    <span>{check.label}</span>
                  </li>
                ))}
              </ul>
              {report ? (
                <Button
                  variant="secondary"
                  className="mt-16"
                  icon="chart"
                  onClick={() => navigate(`/analysis/${id}/details`)}
                >
                  Review analysis before exporting
                </Button>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="card-head">
              <h2>Resume Summary</h2>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="skeleton" style={{ height: 96 }} />
              ) : (
                <>
                  <Row label="Title">{resume?.title || '—'}</Row>
                  <Row label="Name">{resume?.fullName || 'Missing'}</Row>
                  <Row label="Email">{resume?.email || 'Missing'}</Row>
                  <Row label="Template">{resume?.template || 'modern'}</Row>
                  <Row label="Experience">
                    {resume?.experience?.length || 0} entr{(resume?.experience?.length || 0) === 1 ? 'y' : 'ies'}
                  </Row>
                  <Row label="Education">
                    {resume?.education?.length || 0} entr{(resume?.education?.length || 0) === 1 ? 'y' : 'ies'}
                  </Row>
                  <Row label="Projects">{resume?.projects?.length || 0}</Row>
                  <Row label="Last updated">{formatDate(resume?.updatedAt)}</Row>
                </>
              )}
              <div className="btn-row mt-16">
                <Button variant="secondary" icon="edit" onClick={() => navigate(`/builder/${id}`)}>
                  Edit Resume
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}