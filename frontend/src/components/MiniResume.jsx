import React from 'react';

function Block({ lines = 2, heading = false, gray }) {
  return (
    <div className="mini-block">
      {heading ? <div className={`mini-h ${gray ? 'gray' : ''}`} /> : null}
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`mini-line ${i % 3 === 0 ? 'w90' : i % 3 === 1 ? 'w70' : 'w50'}`} />
      ))}
    </div>
  );
}

function TickLines({ count = 3 }) {
  return (
    <div className="mini-block">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <span className="mini-tick" />
          <span className="mini-line" style={{ width: '80%', marginBottom: 0 }} />
        </div>
      ))}
    </div>
  );
}

/**
 * Miniature A4 resume used on the template cards. Purely a structural preview —
 * no real content, so it stays legible at 158px wide.
 */
export default function MiniResume({ template = 'modern' }) {
  if (template === 'classic') {
    return (
      <div className="mini mini-t-classic mini-centered">
        <div className="mini-name">ARUSHMITA SINGH</div>
        <div className="mini-line w50" style={{ margin: '3px auto' }} />
        <div className="mini-line w70" style={{ margin: '0 auto 2px' }} />
        <div className="mini-h gray" style={{ margin: '9px auto 4px' }} />
        <Block lines={2} />
        <div className="mini-h gray" style={{ margin: '6px auto 4px' }} />
        <Block lines={2} />
        <div className="mini-h gray" style={{ margin: '6px auto 4px' }} />
        <TickLines count={2} />
      </div>
    );
  }

  if (template === 'professional') {
    return (
      <div className="mini mini-t-professional">
        <div style={{ background: '#f1f5f9', padding: 6, margin: -6, marginBottom: 8, borderLeft: '2px solid #1d4ed8' }}>
          <div className="mini-name">ARUSHMITA SINGH</div>
          <div className="mini-title">Software Developer</div>
        </div>
        <Block lines={1} />
        <div className="mini-h" style={{ margin: '4px 0 3px' }} />
        <div className="mini-side">
          <div>
            <div className="mini-line w90" />
            <div className="mini-line w70" />
            <div className="mini-line w50" />
            <div className="mini-h" style={{ margin: '5px 0 3px' }} />
            <div className="mini-line w90" />
            <div className="mini-line w70" />
          </div>
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mini-line" style={{ marginBottom: 3 }} />
            ))}
          </div>
        </div>
        <div className="mini-h" style={{ margin: '5px 0 3px' }} />
        <Block lines={2} />
      </div>
    );
  }

  if (template === 'minimal') {
    return (
      <div className="mini mini-t-minimal">
        <div className="mini-name" style={{ fontWeight: 500 }}>Arushmita Singh</div>
        <div className="mini-title" style={{ color: '#64748b' }}>Software Developer</div>
        <div className="mini-line w70" style={{ marginTop: 3 }} />
        <div className="mini-h gray" style={{ margin: '9px 0 3px', width: '26%' }} />
        <Block lines={2} />
        <div className="mini-h gray" style={{ margin: '6px 0 3px', width: '26%' }} />
        <Block lines={2} />
        <div className="mini-h gray" style={{ margin: '6px 0 3px', width: '26%' }} />
        <TickLines count={3} />
      </div>
    );
  }

  if (template === 'elegant') {
    return (
      <div className="mini mini-t-elegant">
        <div className="mini-name" style={{ fontWeight: 400, letterSpacing: '0.03em' }}>Arushmita Singh</div>
        <div className="mini-title" style={{ color: '#475569' }}>Software Developer</div>
        <div className="mini-line w50" style={{ marginTop: 4 }} />
        <div className="mini-h gray" style={{ margin: '11px 0 3px', width: '32%' }} />
        <Block lines={2} />
        <div className="mini-h gray" style={{ margin: '7px 0 3px', width: '32%' }} />
        <Block lines={2} />
        <div className="mini-h gray" style={{ margin: '7px 0 3px', width: '32%' }} />
        <Block lines={3} />
      </div>
    );
  }

  if (template === 'simple') {
    return (
      <div className="mini mini-t-simple">
        <div className="mini-name" style={{ fontSize: 7 }}>ARUSHMITA SINGH</div>
        <div className="mini-line w50" style={{ marginTop: 2 }} />
        <div className="mini-h" style={{ margin: '8px 0 3px', background: '#0f172a' }} />
        <Block lines={2} />
        <div className="mini-h" style={{ margin: '6px 0 3px', background: '#0f172a' }} />
        <Block lines={2} />
        <div className="mini-h" style={{ margin: '6px 0 3px', background: '#0f172a' }} />
        <Block lines={2} />
      </div>
    );
  }

  return (
    <div className="mini mini-t-modern">
      <div className="mini-name">ARUSHMITA SINGH</div>
      <div className="mini-title">Software Developer</div>
      <div className="mini-line w70" style={{ marginTop: 3 }} />
      <div style={{ height: 1, background: '#1d4ed8', margin: '7px 0' }} />
      <div className="mini-h" style={{ margin: '0 0 3px' }} />
      <Block lines={2} />
      <div className="mini-h" style={{ margin: '6px 0 3px' }} />
      <Block lines={2} />
      <div className="mini-h" style={{ margin: '6px 0 3px' }} />
      <TickLines count={3} />
    </div>
  );
}