// wf-pw-variations.jsx — Page Workbench (existing-ui screen 04, redesigned).
// Reuses StageContextStrip (variant='page') from wf03-variations.jsx.
// Single-page deep-dive: walk through every stage, set page attributes,
// compare across stages, run stage-specific tools.

/* ---------------------- Sample page status across stages ---------------------- */

const PAGE_STAGE_STATUS = {
  source: 'clean', initial_crop: 'clean', dewarp: 'clean', deskew: 'clean',
  grayscale: 'clean', threshold: 'dirty', denoise: 'notrun', canvas_map: 'notrun',
  text_zones: 'notrun', ocr: 'notrun', spellcheck: 'notrun', text_review: 'notrun',
  illust: 'notrun', hyphen_join: 'notrun', regex: 'notrun', page_split: 'notrun',
  proof_pack: 'notrun', validation: 'notrun', zip: 'notrun', build_package: 'notrun',
  submit_check: 'notrun', archive: 'notrun',
};

/* ---------------------- Workbench header ---------------------- */

const PWHeader = ({ pageIdx = 23, pageOf = 232, pagePrefix = 'p012', editMode = 'view' }) => (
  <div style={{
    height: 56, padding: '0 32px', borderBottom: '1px solid var(--border-1)',
    background: 'var(--bg-surface)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)' }}>
        <Icon name="chevL" size={12} />
        <span>belloc-survivals</span>
        <Icon name="chevR" size={11} style={{ color: 'var(--ink-4)' }} />
        <span style={{ color: 'var(--ink-2)' }}>Pages</span>
        <Icon name="chevR" size={11} style={{ color: 'var(--ink-4)' }} />
        <span className="mono" style={{ color: 'var(--ink-1)', fontWeight: 600 }}>{pagePrefix}</span>
      </div>
      <Divider vertical style={{ height: 22 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Button variant="outline" size="sm" icon="chevL">Prev</Button>
        <span style={{ fontSize: 12, color: 'var(--ink-2)', minWidth: 84, textAlign: 'center' }}>
          <span className="mono">{String(pageIdx).padStart(3, '0')}</span>
          <span style={{ color: 'var(--ink-4)' }}> of </span>
          <span className="mono">{pageOf}</span>
        </span>
        <Button variant="outline" size="sm" iconRight="chevR">Next</Button>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <EditModeSelector mode={editMode} />
      <Divider vertical style={{ height: 22 }} />
      <Button variant="ghost" size="sm" icon="search">Find similar</Button>
      <Button variant="primary" size="sm" icon="check">Mark reviewed</Button>
    </div>
  </div>
);

const EditModeSelector = ({ mode }) => {
  const opts = [
    { id: 'view',   label: 'View',        icon: 'file' },
    { id: 'split',  label: 'Split',       icon: 'grip' },
    { id: 'illust', label: 'Illustration', icon: 'image' },
    { id: 'rotate', label: 'Rotate',      icon: 'arrowR' },
  ];
  return (
    <div style={{
      display: 'inline-flex', padding: 3, background: 'var(--bg-raised)',
      border: '1px solid var(--border-1)', borderRadius: 7,
    }}>
      {opts.map(o => {
        const a = mode === o.id;
        return (
          <div key={o.id} style={{
            padding: '4px 9px', borderRadius: 5, cursor: 'pointer',
            background: a ? 'var(--bg-surface)' : 'transparent',
            boxShadow: a ? '0 1px 1px rgba(15,23,42,.06), 0 0 0 1px var(--border-1)' : 'none',
            color: a ? 'var(--ink-1)' : 'var(--ink-3)', fontSize: 12, fontWeight: a ? 600 : 500,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name={o.icon} size={12} />
            {o.label}
          </div>
        );
      })}
    </div>
  );
};

/* ---------------------- Page attributes bar ---------------------- */

const ATTR_TYPES = [
  { id: 'title',  name: 'Title page' },
  { id: 'blank',  name: 'Blank' },
  { id: 'plate',  name: 'Plate / illustration' },
  { id: 'body',   name: 'Body' },
  { id: 'toc',    name: 'Table of contents' },
  { id: 'index',  name: 'Index' },
  { id: 'errata', name: 'Errata' },
  { id: 'catalog',name: 'Publisher catalog' },
  { id: 'ad',     name: 'Advertisement' },
  { id: 'colophon', name: 'Colophon' },
];

const PageAttributesBar = ({ attrs, openEditor }) => (
  <div style={{
    margin: '12px 32px 0',
    borderRadius: 10, border: '1px solid var(--border-1)',
    background: 'var(--bg-surface)', boxShadow: 'none',
    padding: '10px 14px',
    display: 'flex', alignItems: 'center', gap: 16, position: 'relative',
  }}>
    <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', flex: '0 0 auto' }}>
      Page
    </div>
    <AttrPill label="type"    value={attrs.typeName} dot="brand" />
    <AttrPill label="number"  value={attrs.numbered ? `${attrs.numberStyle} · ${attrs.numberValue}` : 'unnumbered'} dot={attrs.numbered ? 'clean' : 'neutral'} />
    <AttrPill label="section" value={attrs.section} dot="neutral" />
    <AttrPill label="align"   value={attrs.align} mono />
    {attrs.marker ? (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '0 9px', height: 22, borderRadius: 6,
        background: 'color-mix(in oklab, var(--accent) 14%, var(--bg-surface))',
        border: '1px solid color-mix(in oklab, var(--accent) 50%, var(--border-1))',
        color: 'var(--ink-1)', fontSize: 11.5, fontWeight: 500,
      }}>
        <Icon name="bell" size={11} style={{ color: 'var(--accent)' }} />
        {attrs.marker}
      </span>
    ) : null}
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
      <Button variant="ghost" size="sm" icon="search">Detect</Button>
      <Button variant="outline" size="sm" iconRight="chevD">Edit attributes</Button>
    </div>
    {openEditor ? <AttrEditorPopover attrs={attrs} /> : null}
  </div>
);

const AttrPill = ({ label, value, dot, mono }) => {
  const dotColor = {
    brand:   'var(--accent)',
    clean:   'var(--exact)',
    neutral: 'var(--ink-4)',
  }[dot] || 'var(--ink-4)';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '0 10px', height: 24, borderRadius: 6,
      background: 'var(--bg-raised)', border: '1px solid var(--border-1)',
    }}>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>{label}</span>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: dotColor }} />
      <span className={mono ? 'mono' : ''} style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-1)' }}>{value}</span>
    </div>
  );
};

const AttrEditorPopover = ({ attrs }) => (
  <div style={{
    position: 'absolute', top: 'calc(100% + 6px)', right: 32,
    width: 460, background: 'var(--bg-surface)', borderRadius: 12,
    border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-floating)',
    padding: 16, zIndex: 20,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>Edit page attributes · p012</div>
      <span style={{ fontSize: 11, color: 'var(--ink-4)' }}><KeyCap>esc</KeyCap> close</span>
    </div>
    {/* Page type */}
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>Page type</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {ATTR_TYPES.map(t => {
          const a = t.id === attrs.type;
          return (
            <span key={t.id} style={{
              padding: '4px 9px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              border: '1px solid',
              borderColor: a ? 'var(--accent)' : 'var(--border-1)',
              background: a ? 'color-mix(in oklab, var(--accent) 12%, var(--bg-surface))' : 'var(--bg-surface)',
              color: a ? 'var(--ink-1)' : 'var(--ink-2)', cursor: 'pointer',
            }}>{t.name}</span>
          );
        })}
      </div>
    </div>
    {/* Numbering */}
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>Numbering</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Toggle on={attrs.numbered} />
        <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{attrs.numbered ? 'Numbered' : 'Unnumbered'}</span>
        <Divider vertical style={{ height: 18 }} />
        <Seg2 opts={['arabic', 'roman', 'custom']} active="arabic" />
        <Input value="12" mono style={{ width: 80, height: 30 }} />
      </div>
    </div>
    {/* Section */}
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>Section</div>
      <Seg2 opts={['frontmatter', 'body', 'backmatter']} active="body" />
    </div>
    {/* Structural markers */}
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>Structural marker</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <MarkerOpt label="Start of frontmatter (roman i)" muted />
        <MarkerOpt label="Start of body (arabic 1)" muted />
        <MarkerOpt label="Start of backmatter / post-book material" active />
        <MarkerOpt label="None" muted />
      </div>
    </div>
    {/* Alignment */}
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>Alignment</div>
      <Seg2 opts={['left', 'center', 'right', '—']} active="left" />
    </div>
    {/* Footer */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-1)' }}>
      <Button variant="ghost" size="sm" icon="search">Re-detect</Button>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button variant="primary" size="sm">Save attributes</Button>
      </div>
    </div>
  </div>
);

const MarkerOpt = ({ label, active, muted }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 9px', borderRadius: 6,
    background: active ? 'color-mix(in oklab, var(--accent) 10%, var(--bg-surface))' : 'transparent',
    border: active ? '1px solid color-mix(in oklab, var(--accent) 40%, var(--border-1))' : '1px solid transparent',
    color: muted ? 'var(--ink-3)' : 'var(--ink-1)', fontSize: 12, cursor: 'pointer',
  }}>
    <span style={{
      width: 14, height: 14, borderRadius: 99, border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-2)'}`,
      display: 'grid', placeItems: 'center',
    }}>
      {active ? <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent)' }} /> : null}
    </span>
    {label}
  </div>
);

const Seg2 = ({ opts, active }) => (
  <div style={{
    display: 'inline-flex', padding: 3, background: 'var(--bg-raised)',
    border: '1px solid var(--border-1)', borderRadius: 7,
  }}>
    {opts.map(o => {
      const a = active === o;
      return (
        <span key={o} style={{
          padding: '4px 9px', borderRadius: 5, cursor: 'pointer',
          background: a ? 'var(--bg-surface)' : 'transparent',
          boxShadow: a ? '0 1px 1px rgba(15,23,42,.06), 0 0 0 1px var(--border-1)' : 'none',
          color: a ? 'var(--ink-1)' : 'var(--ink-3)', fontSize: 12, fontWeight: a ? 600 : 500,
        }}>{o}</span>
      );
    })}
  </div>
);

/* ---------------------- Artifact viewer (left pane) ---------------------- */

const ArtifactPlate = ({ stage, label, accent, mode = 'view' }) => (
  <div style={{
    flex: 1, position: 'relative', borderRadius: 10,
    background: stage === 'threshold' ? '#fcfcfa' : 'var(--bg-raised)',
    border: '1px solid var(--border-1)', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  }}>
    {/* label header */}
    <div style={{
      padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: accent || 'var(--ocr)' }} />
        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-1)' }}>{stage}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>3000×4140</span>
        <Icon name="image" size={12} style={{ color: 'var(--ink-4)' }} />
      </div>
    </div>
    {/* image surface */}
    <div style={{ flex: 1, position: 'relative', padding: 18 }}>
      <PaperRender stage={stage} mode={mode} />
    </div>
    {/* footer */}
    <div style={{
      padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderTop: '1px solid var(--border-1)', background: 'var(--bg-surface)',
      fontSize: 10.5, color: 'var(--ink-3)',
    }}>
      <span className="mono">100%</span>
      <span className="mono">last run · 2m ago</span>
    </div>
  </div>
);

const PaperRender = ({ stage, mode }) => {
  // Striped page placeholder; stage variants change colors & overlays
  const isThreshold = stage === 'threshold';
  const isGrayscale = stage === 'grayscale';
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: isThreshold ? '#ffffff' : isGrayscale ? '#e8e6e1' : '#fbf9f4',
      border: '1px solid var(--border-2)',
      boxShadow: '0 4px 16px rgba(15,23,42,.08)',
    }}>
      {/* paper texture stripes (text) */}
      <div style={{ position: 'absolute', inset: '8% 11% 14%',
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 7px, ${isThreshold ? '#0f172a' : isGrayscale ? '#1e293b' : '#3a2c1c'} 7px 9px, transparent 9px 14px)`,
      }} />
      {/* indent first line, last short line look */}
      <div style={{ position: 'absolute', left: '15%', right: '70%', top: '8%', height: 9,
        background: isThreshold ? '#fff' : isGrayscale ? '#e8e6e1' : '#fbf9f4' }} />
      <div style={{ position: 'absolute', left: '11%', right: '40%', bottom: '15%', height: 9,
        background: isThreshold ? '#fff' : isGrayscale ? '#e8e6e1' : '#fbf9f4' }} />
      {/* drop cap zone */}
      <div style={{ position: 'absolute', left: '11%', top: '8%', width: 28, height: 36,
        background: isThreshold ? '#0f172a' : isGrayscale ? '#1e293b' : '#3a2c1c' }} />
      {/* page number bottom */}
      <div style={{
        position: 'absolute', left: '50%', bottom: '5%', transform: 'translateX(-50%)',
        fontFamily: 'var(--mono-font)', fontSize: 12,
        color: isThreshold ? '#0f172a' : isGrayscale ? '#1e293b' : '#3a2c1c',
        opacity: 0.8,
      }}>12</div>

      {mode === 'split' ? <SplitOverlay /> : null}
      {mode === 'illust' ? <IllustOverlay /> : null}
      {mode === 'ocr-words' ? <WordBboxOverlay /> : null}
    </div>
  );
};

const SplitOverlay = () => (
  <>
    <div style={{
      position: 'absolute', left: '11%', top: '8%', width: '38%', bottom: '14%',
      border: '2px dashed var(--accent)', borderRadius: 4,
      background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
    }}>
      <span style={{ position: 'absolute', top: -22, left: 0, fontFamily: 'var(--mono-font)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>L</span>
    </div>
    <div style={{
      position: 'absolute', right: '11%', top: '8%', width: '38%', bottom: '14%',
      border: '2px dashed var(--accent)', borderRadius: 4,
      background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
    }}>
      <span style={{ position: 'absolute', top: -22, right: 0, fontFamily: 'var(--mono-font)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>R</span>
    </div>
  </>
);

const IllustOverlay = () => (
  <div style={{
    position: 'absolute', left: '20%', top: '24%', width: '60%', height: '38%',
    border: '2px solid #0ea5e9', borderRadius: 4,
    background: 'color-mix(in oklab, #0ea5e9 12%, transparent)',
  }}>
    <span style={{ position: 'absolute', top: -22, left: 0, fontFamily: 'var(--mono-font)', fontSize: 11, color: '#0ea5e9', fontWeight: 600 }}>illust · plate</span>
  </div>
);

const WordBboxOverlay = () => {
  const rows = [];
  for (let row = 0; row < 14; row++) {
    let x = 12 + Math.random() * 2;
    const y = 9 + row * 5.4;
    while (x < 88) {
      const w = 3 + Math.random() * 10;
      rows.push({ x, y, w });
      x += w + 1.5;
    }
  }
  return (
    <>
      {rows.map((r, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${r.x}%`, top: `${r.y}%`,
          width: `${r.w}%`, height: '2.6%',
          border: '1px solid color-mix(in oklab, var(--ocr) 70%, transparent)',
          background: 'color-mix(in oklab, var(--ocr) 12%, transparent)',
        }} />
      ))}
      {/* one selected (red) bbox */}
      <div style={{
        position: 'absolute', left: '40%', top: '36%', width: '9%', height: '2.6%',
        border: '1.5px solid var(--mismatch)',
        background: 'color-mix(in oklab, var(--mismatch) 18%, transparent)',
      }} />
    </>
  );
};

const ArtifactViewer = ({ stage, mode = 'view', compareWith }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
    {/* Top bar: primary stage selector + compare-mode */}
    <div style={{
      padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Show</span>
        <StageSelect value={stage} />
        {compareWith ? (
          <>
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>compared with</span>
            <StageSelect value={compareWith} accent="#a855f7" />
          </>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {!compareWith ? <Button variant="ghost" size="sm" icon="image">Compare across stages…</Button> : <Button variant="ghost" size="sm" icon="x">Exit compare</Button>}
        <Divider vertical style={{ height: 18 }} />
        <Button variant="ghost" size="sm" icon="search">Zoom</Button>
        <Button variant="ghost" size="sm" icon="image">Fit</Button>
        <Button variant="ghost" size="sm">100%</Button>
      </div>
    </div>
    {/* Pane(s) */}
    <div style={{ flex: 1, padding: 14, display: 'flex', gap: 14, minHeight: 0, background: 'var(--bg-page)' }}>
      <ArtifactPlate stage={stage} label={stage === 'threshold' ? 'after Otsu' : ''} mode={mode} accent="var(--ocr)" />
      {compareWith ? <ArtifactPlate stage={compareWith} label="reference" mode="view" accent="#a855f7" /> : null}
    </div>
  </div>
);

const StageSelect = ({ value, accent }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '4px 10px 4px 10px', borderRadius: 7,
    background: 'var(--bg-raised)', border: '1px solid var(--border-1)',
    cursor: 'pointer',
  }}>
    <span style={{ width: 7, height: 7, borderRadius: 99, background: accent || 'var(--ocr)' }} />
    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-1)' }}>{value}</span>
    <Icon name="chevD" size={11} style={{ color: 'var(--ink-3)' }} />
  </div>
);

/* ---------------------- Stage-specific controls (right pane) ---------------------- */

const STAGE_CONTROL = {
  threshold:  ThresholdControls,
  canvas_map: CanvasMapControls,
  ocr:        OcrControls,
  grayscale:  GrayscaleControls,
  initial_crop: InitialCropControls,
  deskew:     DeskewControls,
};

function StageControlsPanel({ stage, mode }) {
  const Comp = STAGE_CONTROL[stage] || GenericControls;
  return (
    <div style={{
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Stage controls</div>
          <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)' }}>{stage}</span>
            <Badge tone="dirty">dirty</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button variant="outline" size="sm">Apply & Run</Button>
          <button title="Collapse drawer" style={{
            width: 24, height: 24, borderRadius: 5,
            border: '1px solid var(--border-1)', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name="chevL" size={12} />
          </button>
        </div>
      </div>
      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <Comp />
      </div>
      {/* Footer */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-1)',
        display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button variant="primary" size="md" icon="arrowR" full>Apply & Run from here</Button>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'center' }}>
          will re-run {stage} + {STAGE_DEFS.length - 1 - STAGE_DEFS.findIndex(s => s.id === stage)} downstream stages
        </div>
      </div>
    </div>
  );
}

function GenericControls() {
  return (
    <div style={{ fontSize: 12, color: 'var(--ink-3)', padding: '20px 0', textAlign: 'center' }}>
      No per-page overrides for this stage.
    </div>
  );
}

function ControlField({ label, hint, children, mono }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)' }}>{label}</div>
        {hint ? <span className={mono ? 'mono' : ''} style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function ThresholdControls() {
  return (
    <>
      <ControlField label="Threshold level" hint="auto · Otsu fallback" mono>
        <Slider value={140} min={0} max={255} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
          <span className="mono" style={{ color: 'var(--ink-4)' }}>0</span>
          <Input value="140" mono style={{ width: 80, height: 30 }} />
          <span className="mono" style={{ color: 'var(--ink-4)' }}>255</span>
        </div>
      </ControlField>
      <ControlField label="Otsu fallback" hint="auto when manual ≈ Otsu">
        <CheckRow label="Use Otsu when manual within 8 of computed" on />
      </ControlField>
      <ControlField label="Fuzzy %" hint="0.02">
        <Input value="0.02" mono />
      </ControlField>
      <ControlField label="Pixel-count cols / rows">
        <div style={{ display: 'flex', gap: 8 }}>
          <Input value="150" mono />
          <Input value="75" mono />
        </div>
      </ControlField>
      <ControlField label="Region overrides" hint="2 zones">
        <ZoneRow label="zone-1" range="0 — 1820" level="140" />
        <ZoneRow label="zone-2" range="1820 — 4140" level="118" highlight />
        <Button variant="ghost" size="sm" icon="plus" style={{ marginTop: 6 }}>Add region</Button>
      </ControlField>
      <ControlField label="Comparison sliders">
        <CheckRow label="Show grayscale underlay (Y to toggle)" on />
        <CheckRow label="Show before/after split bar" />
      </ControlField>
    </>
  );
}

function CanvasMapControls() {
  return (
    <>
      <ControlField label="Force alignment">
        <Seg2 opts={['Default', 'Top', 'Center', 'Bottom']} active="Top" />
      </ControlField>
      <ControlField label="White space margins (px)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Input value="120" mono />
          <Input value="120" mono />
          <Input value="80" mono />
          <Input value="80" mono />
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 4 }}>top · right · bottom · left</div>
      </ControlField>
      <ControlField label="Rescale">
        <CheckRow label="Single-dimension rescale" />
        <CheckRow label="Rotated standard (90° book)" />
      </ControlField>
      <ControlField label="Detected text bbox">
        <div className="mono" style={{
          padding: '8px 10px', fontSize: 11, color: 'var(--ink-2)',
          background: 'var(--bg-raised)', borderRadius: 6, border: '1px solid var(--border-1)',
        }}>
          x: 318  y: 286
          <br/>w: 2364  h: 3568
        </div>
      </ControlField>
    </>
  );
}

function GrayscaleControls() {
  return (
    <>
      <ControlField label="Mode">
        <Seg2 opts={['Luma 709', 'Perceptual', 'Custom']} active="Perceptual" />
      </ControlField>
      <ControlField label="GEGL gamma" hint="WF-11">
        <Slider value={2.2} min={1} max={3} />
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>2.2 · default</div>
      </ControlField>
      <ControlField label="Mid-tone bias">
        <Slider value={0.45} min={0} max={1} />
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>0.45</div>
      </ControlField>
    </>
  );
}

function DeskewControls() {
  return (
    <>
      <ControlField label="Auto deskew">
        <CheckRow label="Skip auto deskew" />
      </ControlField>
      <ControlField label="Manual angles (°)" hint="before / after crop">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Input value="0.4" mono />
          <Input value="0.0" mono />
        </div>
      </ControlField>
      <ControlField label="Detected skew">
        <div className="mono" style={{ fontSize: 12, color: 'var(--ink-1)' }}>+0.42° · baseline match 0.91</div>
      </ControlField>
    </>
  );
}

function InitialCropControls() {
  return (
    <>
      <ControlField label="Fuzzy %"><Input value="0.02" mono /></ControlField>
      <ControlField label="Pixel-count cols">
        <Input value="150" mono />
      </ControlField>
      <ControlField label="Pixel-count rows">
        <Input value="75" mono />
      </ControlField>
    </>
  );
}

function OcrControls() {
  return (
    <>
      <ControlField label="Engine">
        <Seg2 opts={['DocTR', 'Tesseract', 'EasyOCR']} active="DocTR" />
      </ControlField>
      <ControlField label="DocTR model">
        <Input value="default fine-tuned" />
      </ControlField>
      <ControlField label="DPI">
        <Input value="150" mono />
      </ControlField>
      <ControlField label="Scan area">
        <CheckRow label="Use canvas_map bbox" on />
        <CheckRow label="Drop margin words (< 1% w)" on />
      </ControlField>
      <ControlField label="Word post-filters">
        <CheckRow label="Snap to baseline grid" />
        <CheckRow label="Drop sub-char tokens" on />
      </ControlField>
      <ControlField label="Confidence threshold">
        <Slider value={0.74} min={0} max={1} />
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>0.74 · flag below this</div>
      </ControlField>
    </>
  );
}

const ZoneRow = ({ label, range, level, highlight }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '60px 1fr 64px 20px', alignItems: 'center', gap: 8,
    padding: '7px 10px', borderRadius: 7, marginBottom: 6,
    background: highlight ? 'color-mix(in oklab, var(--fuzzy) 12%, var(--bg-raised))' : 'var(--bg-raised)',
    border: `1px solid ${highlight ? 'color-mix(in oklab, var(--fuzzy) 30%, var(--border-1))' : 'var(--border-1)'}`,
  }}>
    <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{range}</span>
    <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{level}</span>
    <Icon name="x" size={12} style={{ color: 'var(--ink-4)' }} />
  </div>
);

const CheckRow = ({ label, on }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
    <span style={{
      width: 16, height: 16, borderRadius: 4,
      border: on ? 'none' : '1px solid var(--border-2)',
      background: on ? 'var(--accent)' : 'transparent',
      display: 'grid', placeItems: 'center', color: 'var(--accent-ink)',
    }}>
      {on ? <Icon name="check" size={10} stroke={3} /> : null}
    </span>
    <span style={{ fontSize: 12, color: on ? 'var(--ink-1)' : 'var(--ink-2)' }}>{label}</span>
  </div>
);

const Slider = ({ value, min, max }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position: 'relative', height: 20 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 4, background: 'var(--bg-sunk)', borderRadius: 99, transform: 'translateY(-50%)' }} />
      <div style={{ position: 'absolute', left: 0, width: `${pct}%`, top: '50%', height: 4, background: 'var(--accent)', borderRadius: 99, transform: 'translateY(-50%)' }} />
      <div style={{ position: 'absolute', left: `calc(${pct}% - 7px)`, top: '50%', width: 14, height: 14, background: 'var(--bg-surface)', border: '2px solid var(--accent)', borderRadius: 99, transform: 'translateY(-50%)' }} />
    </div>
  );
};

/* ---------------------- Text review pane (collapsible) ---------------------- */

const TextReviewPane = ({ open }) => (
  <div style={{
    height: open ? 280 : 44,
    background: 'var(--bg-surface)', borderTop: '1px solid var(--border-1)',
    display: 'flex', flexDirection: 'column', flex: '0 0 auto',
  }}>
    <div style={{
      height: 44, padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: open ? '1px solid var(--border-1)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name={open ? 'chevD' : 'chevR'} size={13} style={{ color: 'var(--ink-3)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>OCR text · review</span>
        <Badge tone="dirty">unsaved · 3 edits</Badge>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>437 words · 12 likely scannos</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" size="sm" icon="image">Re-OCR & diff</Button>
        <Button variant="outline" size="sm">Save</Button>
        <Button variant="primary" size="sm" icon="check">Mark reviewed</Button>
      </div>
    </div>
    {open ? (
      <div style={{ flex: 1, padding: '14px 32px', overflow: 'auto', display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div className="mono" style={{
            width: '100%', height: '100%', borderRadius: 8,
            background: 'var(--bg-raised)', border: '1px solid var(--border-1)',
            padding: '12px 14px', fontSize: 12, lineHeight: 1.7, color: 'var(--ink-1)',
            overflow: 'auto', whiteSpace: 'pre-wrap',
          }}>{`12   SURVIVALS AND NEW ARRIVALS
Yet there are men, today, who claim that the
old certitudes have crumbled — that <span class="scanno">whereever</span> the
wind of doubt has stirred, no rooted faith remains.
They are wrong. The chief surv1val of our time is
the appetite for the eternal, which no <span class="scanno">acid</span>
washes out of the human creature. […]`.replace(/<[^>]+>/g, '')}</div>
          {/* highlighted scannos as colored boxes (visual placeholder) */}
          <span style={{
            position: 'absolute', left: 140, top: 50, width: 78, height: 18,
            background: 'color-mix(in oklab, var(--mismatch) 22%, transparent)',
            border: '1px solid var(--mismatch)', borderRadius: 3,
          }} />
          <span style={{
            position: 'absolute', left: 282, top: 117, width: 36, height: 18,
            background: 'color-mix(in oklab, var(--fuzzy) 22%, transparent)',
            border: '1px solid var(--fuzzy)', borderRadius: 3,
          }} />
        </div>
        <div style={{ width: 240, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Likely scannos</div>
          {[
            { word: 'whereever', conf: 0.42, fix: 'wherever' },
            { word: 'surv1val',  conf: 0.21, fix: 'survival' },
            { word: 'acld',      conf: 0.55, fix: 'acid' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 7,
              background: 'var(--bg-raised)', border: '1px solid var(--border-1)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Icon name="alert" size={13} style={{ color: 'var(--mismatch)' }} />
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-1)', textDecoration: 'line-through', opacity: 0.8 }}>{s.word}</div>
                <div className="mono" style={{ fontSize: 11.5, color: 'var(--exact)' }}>→ {s.fix}</div>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>{s.conf.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    ) : null}
  </div>
);

/* ---------------------- Variation ---------------------- */

const SAMPLE_ATTRS = {
  type: 'body', typeName: 'Body',
  numbered: true, numberStyle: 'arabic', numberValue: 12,
  section: 'body', align: 'left', marker: null,
};

const VariationPW = ({
  theme = 'light',
  stage = 'threshold',
  mode = 'view',
  compareWith,
  attrs = SAMPLE_ATTRS,
  editMode = 'view',
  textReviewOpen = false,
  // layout
  layout = '3col',         // '3col' | '2col'
  rightWidth,
  // explicit pane content overrides
  leftPane,
  centerPane,
  rightPane,
  rightView = 'page',     // 'page' | 'hierarchy' | 'block' | 'text' | 'words'
  selectedBlockId,
  wordsDensity = 'cards',
  leftCollapsed = false,
  rightCollapsed = false,
}) => {
  const isTwoCol = layout === '2col';
  const rwidth = rightWidth ?? (isTwoCol ? 760 : 372);
  const left = leftPane ?? <StageControlsPanel stage={stage} mode={mode} />;
  const center = centerPane ?? <ArtifactViewer stage={stage} mode={mode} compareWith={compareWith} />;
  let right;
  if (rightPane) {
    right = rightPane;
  } else if (rightView === 'hierarchy') {
    right = <HierarchyTreePanel selectedId={selectedBlockId} />;
  } else if (rightView === 'block') {
    right = <BlockTypePickerPanel selectedBlockId={selectedBlockId || 'B2.2.2'} />;
  } else if (rightView === 'text' || rightView === 'words') {
    right = <OcrTextPanel view={rightView} density={wordsDensity} selectedBlock={selectedBlockId || 'B2.2.2'} />;
  } else {
    right = <PageAttributesPanel attrs={attrs} />;
  }
  // Build right drawer tabs based on stage / view
  const rightTabs = [
    { id: 'page', name: 'Page', icon: 'file' },
    ...(stage === 'text_zones' ? [
      { id: 'hierarchy', name: 'Hierarchy', badge: '23' },
      ...(selectedBlockId ? [{ id: 'block', name: 'Block', icon: 'image' }] : []),
    ] : []),
    ...(stage === 'ocr' ? [
      { id: 'words', name: 'Words', badge: '437' },
      { id: 'text', name: 'Text' },
    ] : []),
  ];
  return (
    <div className="pgd" data-theme={theme} style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-page)', overflow: 'hidden',
    }}>
      <TopNav />
      <PWHeader editMode={editMode} pageIdx={23} pageOf={232} pagePrefix={attrs.pagePrefix || 'p012'} />
      <StageContextStrip
        currentStage={stage}
        variant="page"
        pageStageStatus={attrs.pageStageStatus || PAGE_STAGE_STATUS}
        pageId={attrs.pagePrefix || 'p012'}
      />
      <div style={{ flex: 1, padding: '12px 0 0', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, minHeight: 0, display: 'flex',
          margin: '0 32px',
          borderRadius: 10, border: '1px solid var(--border-1)',
          background: 'var(--bg-surface)', boxShadow: 'none',
          overflow: 'hidden',
        }}>
          {!isTwoCol ? (
            <Drawer side="left" width={372} collapsed={leftCollapsed}
              label="stage controls" icons={[{ icon: 'image' }, { icon: 'grip' }]}>
              {left}
            </Drawer>
          ) : (
            <Drawer side="left" width={48} collapsed label="stage · ocr" icons={[{ icon: 'image' }, { icon: 'grip' }]} />
          )}
          <div style={{ flex: 1, display: 'flex', minWidth: 0, background: 'var(--bg-page)' }}>{center}</div>
          <Drawer side="right" width={rwidth} collapsed={rightCollapsed}
            label={rightView === 'page' ? 'page attrs'
              : rightView === 'hierarchy' ? 'hierarchy'
              : rightView === 'block' ? 'block type'
              : rightView === 'words' ? 'ocr words'
              : rightView === 'text' ? 'ocr text' : 'context'}
            icons={[{ icon: 'file' }, { icon: 'image' }]}
            tabs={rightTabs.length > 1 ? rightTabs : null}
            activeTab={rightView}>
            {right}
          </Drawer>
        </div>
        <div style={{ padding: '4px 32px 0', fontSize: 10.5, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="info" size={11} />
          <span>{isTwoCol
            ? 'OCR stage uses a 2-column layout — image left, recognised text right. Stage controls collapse to the left strip; click to expand.'
            : 'At < 1280px both side drawers collapse into a left tab strip (Controls · Hierarchy · Page).'}</span>
        </div>
      </div>
      <TextReviewPane open={textReviewOpen} />
      <ServerFooter />
    </div>
  );
};

/* Narrow strip shown in place of left drawer in 2-col layout */
const CollapsedStageStrip = ({ stage }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 6 }}>
    <button title="Expand stage controls" style={{
      width: 36, height: 36, borderRadius: 7, border: '1px solid var(--border-1)',
      background: 'var(--bg-raised)', color: 'var(--ink-2)', cursor: 'pointer',
      display: 'grid', placeItems: 'center',
    }}>
      <Icon name="chevR" size={14} />
    </button>
    <div className="mono" style={{
      fontSize: 9, color: 'var(--ink-3)', writingMode: 'vertical-rl',
      transform: 'rotate(180deg)', letterSpacing: '0.1em', marginTop: 8,
    }}>stage · {stage}</div>
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button title="Stage controls" style={{
        width: 36, height: 36, borderRadius: 7, border: '1px solid var(--border-1)',
        background: 'var(--bg-surface)', color: 'var(--ink-2)', cursor: 'pointer',
        display: 'grid', placeItems: 'center',
      }}>
        <Icon name="image" size={14} />
      </button>
      <button title="Stage controls" style={{
        width: 36, height: 36, borderRadius: 7, border: '1px solid var(--border-1)',
        background: 'var(--bg-surface)', color: 'var(--ink-2)', cursor: 'pointer',
        display: 'grid', placeItems: 'center',
      }}>
        <Icon name="grip" size={14} />
      </button>
    </div>
  </div>
);

/* ---------------------- Crop / overlay comparison viewer ---------------------- */

// Render a page with the proposed crop region outlined.
// Optionally show a 2-up: source · cropped result.
const CropCompareViewer = ({ stage, original = 'source', mode = 'side-by-side' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
    <div style={{
      padding: '10px 14px', borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Show</span>
        <StageSelect value={stage} />
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>vs</span>
        <StageSelect value={original} accent="#a855f7" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Seg2 opts={['side-by-side', 'overlay', 'blink']} active={mode} />
        <Divider vertical style={{ height: 18 }} />
        <Button variant="ghost" size="sm" icon="search">Zoom</Button>
        <Button variant="ghost" size="sm">Fit</Button>
      </div>
    </div>
    <div style={{ flex: 1, padding: 14, minHeight: 0, display: 'flex', gap: 14, background: 'var(--bg-page)' }}>
      {mode === 'overlay' ? (
        <OverlayPlate stage={stage} original={original} />
      ) : (
        <>
          <SourcePlate accent="#a855f7" />
          <CroppedPlate stage={stage} />
        </>
      )}
    </div>
    <div style={{
      padding: '6px 14px', borderTop: '1px solid var(--border-1)', background: 'var(--bg-surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 11, color: 'var(--ink-3)',
    }}>
      <span className="mono">crop reduced area by 12.3% · 3000×4140 → 2360×3568</span>
      <span style={{ display: 'flex', gap: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent)' }}/> proposed crop
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: '#0ea5e9' }}/> canvas_map bbox
        </span>
      </span>
    </div>
  </div>
);

const SourcePlate = ({ accent }) => (
  <div style={{
    flex: 1, position: 'relative', borderRadius: 10,
    background: 'var(--bg-raised)', border: '1px solid var(--border-1)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  }}>
    <div style={{
      padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: accent }} />
        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>source · original</span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>untrimmed</span>
      </div>
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>3000×4140</span>
    </div>
    <div style={{ flex: 1, position: 'relative', padding: 18 }}>
      {/* full uncropped page with margins + crop rect overlay */}
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        background: '#fbf9f4', border: '1px solid var(--border-2)',
        boxShadow: '0 4px 16px rgba(15,23,42,.08)',
      }}>
        {/* page text */}
        <div style={{ position: 'absolute', inset: '12% 18% 18% 18%',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 6px, #3a2c1c 6px 8px, transparent 8px 13px)' }} />
        {/* crop proposal rect */}
        <div style={{
          position: 'absolute', left: '14%', top: '10%', right: '14%', bottom: '14%',
          border: '2.5px solid var(--accent)', borderRadius: 2,
          boxShadow: '0 0 0 9999px rgba(15,23,42,.32)',
        }}>
          <span style={{
            position: 'absolute', top: -22, left: 0,
            fontFamily: 'var(--mono-font)', fontSize: 11, color: 'var(--accent)', fontWeight: 600,
            background: 'var(--bg-surface)', padding: '1px 6px', borderRadius: 4,
          }}>proposed crop · fuzzy 0.02</span>
          {/* corner handles */}
          {[
            { t: -4, l: -4 }, { t: -4, r: -4 }, { b: -4, l: -4 }, { b: -4, r: -4 },
          ].map((p, i) => (
            <span key={i} style={{
              position: 'absolute', width: 8, height: 8, background: 'var(--accent)', borderRadius: 1,
              ...(p.t !== undefined ? { top: p.t } : {}),
              ...(p.l !== undefined ? { left: p.l } : {}),
              ...(p.r !== undefined ? { right: p.r } : {}),
              ...(p.b !== undefined ? { bottom: p.b } : {}),
            }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CroppedPlate = ({ stage }) => (
  <div style={{
    flex: 1, position: 'relative', borderRadius: 10,
    background: 'var(--bg-raised)', border: '1px solid var(--border-1)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  }}>
    <div style={{
      padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--ocr)' }} />
        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{stage}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>after crop</span>
      </div>
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>2360×3568</span>
    </div>
    <div style={{ flex: 1, position: 'relative', padding: 18 }}>
      {/* tighter cropped page */}
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        background: '#fbf9f4', border: '1px solid var(--border-2)',
        boxShadow: '0 4px 16px rgba(15,23,42,.08)',
      }}>
        <div style={{ position: 'absolute', inset: '5% 6% 6%',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 7px, #3a2c1c 7px 9px, transparent 9px 14px)' }} />
        <div style={{ position: 'absolute', left: '50%', bottom: '3%', transform: 'translateX(-50%)',
          fontFamily: 'var(--mono-font)', fontSize: 12, color: '#3a2c1c', opacity: 0.8 }}>12</div>
      </div>
    </div>
  </div>
);

const OverlayPlate = ({ stage, original }) => (
  <div style={{
    flex: 1, position: 'relative', borderRadius: 10,
    background: 'var(--bg-raised)', border: '1px solid var(--border-1)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  }}>
    <div style={{
      padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: '#a855f7' }} />
        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{original}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>with</span>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)' }} />
        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{stage}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>overlay</span>
      </div>
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>3000×4140</span>
    </div>
    <div style={{ flex: 1, position: 'relative', padding: 24 }}>
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        background: '#fbf9f4', border: '1px solid var(--border-2)',
        boxShadow: '0 4px 16px rgba(15,23,42,.08)',
      }}>
        <div style={{ position: 'absolute', inset: '11% 18% 16% 18%',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 6px, #3a2c1c 6px 8px, transparent 8px 13px)' }} />
        {/* initial_crop rect — brand */}
        <div style={{
          position: 'absolute', left: '14%', top: '9%', right: '14%', bottom: '13%',
          border: '2px solid var(--accent)', borderRadius: 2,
        }}>
          <span style={{ position: 'absolute', top: -20, left: 0,
            fontFamily: 'var(--mono-font)', fontSize: 11, color: 'var(--accent)', fontWeight: 600,
            background: 'var(--bg-surface)', padding: '1px 6px', borderRadius: 4 }}>initial_crop</span>
        </div>
        {/* canvas_map rect — slightly tighter, sky */}
        <div style={{
          position: 'absolute', left: '17%', top: '11%', right: '16%', bottom: '15%',
          border: '2px solid #0ea5e9', borderRadius: 2, borderStyle: 'dashed',
        }}>
          <span style={{ position: 'absolute', bottom: -20, right: 0,
            fontFamily: 'var(--mono-font)', fontSize: 11, color: '#0ea5e9', fontWeight: 600,
            background: 'var(--bg-surface)', padding: '1px 6px', borderRadius: 4 }}>canvas_map · aligned</span>
        </div>
      </div>
    </div>
  </div>
);

/* ---------------------- Labeler canvas (text_zones stage) ---------------------- */

const LABEL_TONES = {
  structural: { stroke: '#a89788', bg: 'rgba(168, 151, 136, 0.06)', label: '#7d6b5d' },
  paragraph:  { stroke: '#8aa56b', bg: 'rgba(138, 165, 107, 0.07)', label: '#5d7d3c' },
  line:       { stroke: '#d99094', bg: 'rgba(217, 144, 148, 0.06)', label: '#a85d62' },
  word:       { stroke: '#7ba3cf', bg: 'rgba(123, 163, 207, 0.06)', label: '#4e7aab' },
};

const LayerToggle = ({ active }) => {
  const layers = [
    { id: 'blocks',    name: 'Blocks',    tone: LABEL_TONES.structural.stroke },
    { id: 'paragraph', name: 'Paragraph', tone: LABEL_TONES.paragraph.stroke },
    { id: 'lines',     name: 'Lines',     tone: LABEL_TONES.line.stroke },
    { id: 'words',     name: 'Words',     tone: LABEL_TONES.word.stroke },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Layers</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {layers.map(l => {
          const on = active.includes(l.id);
          return (
            <span key={l.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 500,
              background: on ? 'var(--bg-surface)' : 'var(--bg-raised)',
              border: `1px solid ${on ? l.tone : 'var(--border-1)'}`,
              color: on ? 'var(--ink-1)' : 'var(--ink-4)', cursor: 'pointer',
            }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: l.tone, opacity: on ? 1 : 0.45 }} />
              {l.name}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Block list driving both the canvas overlays AND the hierarchy tree.
const PAGE_BLOCKS = [
  // Header band
  { id: 'B1',     kind: 'header band',  type: 'structural', x: 80,  y: 80,   w: 1540, h: 80,  depth: 1, parent: null, hasBlockChildren: true,  label: 'Header band' },
  { id: 'B1.1',   kind: 'running header text', type: 'paragraph', x: 600, y: 105, w: 520, h: 40,  depth: 2, parent: 'B1', leaf: true, label: 'Header band', text: '"WOODROW WILSON" — running head', counts: '1L · 2W' },
  // Body main
  { id: 'B2',     kind: 'body main', type: 'structural', x: 80,  y: 200,  w: 1540, h: 1880, depth: 1, parent: null, hasBlockChildren: true,  label: 'Body' },
  // Column 1
  { id: 'B2.1',   kind: 'column', type: 'structural', x: 120, y: 240,  w: 700,  h: 1800, depth: 2, parent: 'B2', hasBlockChildren: true,  label: 'Column 1' },
  { id: 'B2.1.1', kind: 'chapter heading', type: 'paragraph', x: 160, y: 280, w: 620, h: 80,  depth: 3, parent: 'B2.1', leaf: true, label: 'chapter heading', text: '"II · The Founding of the Government"', counts: '1L · 7W' },
  { id: 'B2.1.2', kind: 'byline / author', type: 'paragraph', x: 160, y: 392, w: 400, h: 38,  depth: 3, parent: 'B2.1', leaf: true, label: 'byline', counts: '1L · 3W' },
  { id: 'B2.1.3', kind: 'body text', type: 'paragraph', x: 160, y: 470, w: 620, h: 420, depth: 3, parent: 'B2.1', leaf: true, label: 'body',   counts: '12L · 84W' },
  { id: 'B2.1.4', kind: 'body text', type: 'paragraph', x: 160, y: 920, w: 620, h: 240, depth: 3, parent: 'B2.1', leaf: true, label: 'body',   counts: '8L · 56W' },
  // Column 2
  { id: 'B2.2',   kind: 'column', type: 'structural', x: 860, y: 240,  w: 700,  h: 1800, depth: 2, parent: 'B2', hasBlockChildren: true,  label: 'Column 2' },
  { id: 'B2.2.1', kind: 'body text', type: 'paragraph', x: 900, y: 280, w: 620, h: 320, depth: 3, parent: 'B2.2', leaf: true, label: 'body', counts: '10L · 102W' },
  // Block quote (the selected block)
  { id: 'B2.2.2', kind: 'block quote', type: 'structural', x: 920, y: 640, w: 580, h: 440, depth: 3, parent: 'B2.2', hasBlockChildren: true,  label: 'Block quote', text: '"I have no purpose but to serve the present age…" — two paragraphs of extended verse.', counts: '2 children' },
  { id: 'B2.2.2.1', kind: 'body text', type: 'paragraph', x: 950, y: 680, w: 540, h: 170, depth: 4, parent: 'B2.2.2', leaf: true, label: 'quote p1', counts: '4L · 37W' },
  { id: 'B2.2.2.2', kind: 'body text', type: 'paragraph', x: 950, y: 870, w: 540, h: 190, depth: 4, parent: 'B2.2.2', leaf: true, label: 'quote p2', counts: '5L · 16W' },
  { id: 'B2.2.3', kind: 'body text', type: 'paragraph', x: 900, y: 1110, w: 620, h: 120, depth: 3, parent: 'B2.2', leaf: true, label: 'body', counts: '4L · 41W' },
  // Figure region
  { id: 'B2.2.4', kind: 'figure region', type: 'structural', x: 900, y: 1280, w: 620, h: 400, depth: 3, parent: 'B2.2', hasBlockChildren: true, label: 'figure region', counts: '1 child' },
  { id: 'B2.2.4.1', kind: 'figure caption', type: 'paragraph', x: 920, y: 1580, w: 580, h: 80, depth: 4, parent: 'B2.2.4', leaf: true, label: 'caption text', counts: '1L · 14W' },
  { id: 'B2.2.5', kind: 'body text', type: 'paragraph', x: 900, y: 1720, w: 620, h: 280, depth: 3, parent: 'B2.2', leaf: true, label: 'body', counts: '8L · 18W' },
  // Footnote band
  { id: 'B3',     kind: 'footnote band', type: 'structural', x: 80, y: 2120, w: 1540, h: 160, depth: 1, parent: null, hasBlockChildren: true, label: 'Footnote band' },
  { id: 'B3.1',   kind: 'footnote entry', type: 'paragraph', x: 120, y: 2140, w: 1460, h: 50, depth: 2, parent: 'B3', leaf: true, label: 'footnote 1', counts: '3L · 32W' },
  { id: 'B3.2',   kind: 'footnote entry', type: 'paragraph', x: 120, y: 2200, w: 1460, h: 50, depth: 2, parent: 'B3', leaf: true, label: 'footnote 2', counts: '1L · 7W' },
  // Footer band
  { id: 'B4',     kind: 'footer band', type: 'structural', x: 80, y: 2310, w: 1540, h: 70, depth: 1, parent: null, hasBlockChildren: true, label: 'Footer band' },
  { id: 'B4.1',   kind: 'page number', type: 'paragraph', x: 780, y: 2330, w: 140, h: 32, depth: 2, parent: 'B4', leaf: true, label: 'page number "47"', counts: '1L · 1W' },
];

const LabelerCanvas = ({ activeLayers = ['blocks', 'paragraph', 'lines'], selectedId }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
    <div style={{
      padding: '10px 14px', borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Show</span>
        <StageSelect value="text_zones" />
        <Divider vertical style={{ height: 18 }} />
        <LayerToggle active={activeLayers} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Button variant="ghost" size="sm" icon="search">Auto-detect blocks</Button>
        <Divider vertical style={{ height: 18 }} />
        <Button variant="ghost" size="sm">Zoom</Button>
        <Button variant="ghost" size="sm">Fit</Button>
      </div>
    </div>
    <div style={{ flex: 1, padding: 20, minHeight: 0, background: 'var(--bg-page)', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{
        position: 'relative', height: '100%', aspectRatio: '0.71',
        background: '#fbf9f4',
        border: '1px solid var(--border-2)',
        boxShadow: '0 4px 16px rgba(15,23,42,.08)',
      }}>
        {/* Underlying scan stripes */}
        <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 7px, #3a2c1c 7px 9px, transparent 9px 14px)',
          maskImage: 'linear-gradient(0deg, transparent 0%, black 4%, black 96%, transparent 100%)',
          opacity: 0.45,
        }} />
        {/* SVG overlay */}
        <svg viewBox="0 0 1700 2440" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {PAGE_BLOCKS.map(b => {
            const isStructural = b.type === 'structural';
            if (isStructural && !activeLayers.includes('blocks')) return null;
            if (!isStructural && !activeLayers.includes('paragraph')) return null;
            const tone = isStructural ? LABEL_TONES.structural : LABEL_TONES.paragraph;
            const sw = Math.max(1, 3.5 - b.depth * 0.6);
            const dash = b.hasBlockChildren ? '6 4' : 'none';
            const selected = b.id === selectedId;
            return (
              <g key={b.id}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h}
                  fill={tone.bg} stroke={tone.stroke} strokeWidth={sw} strokeDasharray={dash} rx="2" />
                {selected ? (
                  <rect x={b.x - 6} y={b.y - 6} width={b.w + 12} height={b.h + 12}
                    fill="none" stroke="#f97316" strokeWidth="3" rx="4" />
                ) : null}
                {b.label ? (
                  <g>
                    <rect x={b.x + 4} y={b.y - 4} width={Math.max(60, b.label.length * 7)} height={18}
                      fill="var(--bg-surface)" stroke={tone.stroke} strokeWidth="0.6" rx="3" />
                    <text x={b.x + 10} y={b.y + 10}
                      fontFamily="var(--mono-font)" fontSize="12" fill={tone.label}
                      style={{ fontWeight: 500 }}>
                      {(isStructural ? '┃ ' : '¶ ') + b.label}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
          {/* sample word bboxes if "words" layer on */}
          {activeLayers.includes('words') ? (
            <g>
              {Array.from({ length: 80 }).map((_, i) => {
                const col = i % 8; const row = Math.floor(i / 8);
                const baseX = 180 + col * 75; const baseY = 510 + row * 40;
                return <rect key={i} x={baseX} y={baseY} width={62} height={22}
                  fill={LABEL_TONES.word.bg} stroke={LABEL_TONES.word.stroke} strokeWidth="0.6" rx="1.5" />;
              })}
            </g>
          ) : null}
        </svg>
      </div>
    </div>
    <div style={{
      padding: '6px 14px', borderTop: '1px solid var(--border-1)', background: 'var(--bg-surface)',
      display: 'flex', justifyContent: 'space-between',
      fontSize: 11, color: 'var(--ink-3)',
    }}>
      <span><b style={{ color: 'var(--ink-2)' }}>Stroke weight</b> tracks nesting depth. <b style={{ color: 'var(--ink-2)' }}>Dashed</b> = block with block children. <b style={{ color: 'var(--ink-2)' }}>Solid</b> = leaf paragraph.</span>
      <span style={{ display: 'flex', gap: 12 }}>
        <span><span style={{ color: LABEL_TONES.structural.label }}>┃</span> structural</span>
        <span><span style={{ color: LABEL_TONES.paragraph.label }}>¶</span> paragraph</span>
      </span>
    </div>
  </div>
);

/* ---------------------- Page hierarchy tree (right pane) ---------------------- */

const TYPE_CHIP_TONE = {
  structural: { bg: 'color-mix(in oklab, #a89788 18%, var(--bg-surface))', fg: '#5d4e42', border: '#a89788' },
  paragraph:  { bg: 'color-mix(in oklab, #8aa56b 18%, var(--bg-surface))', fg: '#4a6231', border: '#8aa56b' },
};

const HierarchyTreePanel = ({ selectedId, onSelect, blocks = PAGE_BLOCKS }) => {
  // Build a flat ordered tree for rendering
  const childrenOf = (parentId) => blocks.filter(b => b.parent === parentId);
  const render = (parentId, indent = 0, lastFlags = []) => {
    const kids = childrenOf(parentId);
    return kids.map((b, i) => {
      const last = i === kids.length - 1;
      return (
        <React.Fragment key={b.id}>
          <TreeRow node={b} indent={indent} lastFlags={lastFlags} last={last}
            selected={b.id === selectedId} hasKids={childrenOf(b.id).length > 0} />
          {render(b.id, indent + 1, [...lastFlags, last])}
        </React.Fragment>
      );
    });
  };
  return (
    <div style={{
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid var(--border-1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Page hierarchy</span>
            <Badge tone="neutral" mono>{blocks.length} blocks</Badge>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Button variant="ghost" size="sm">Collapse</Button>
            <Button variant="ghost" size="sm">Expand all</Button>
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', height: 30, borderRadius: 7, background: 'var(--bg-raised)', border: '1px solid var(--border-1)' }}>
          <Icon name="search" size={12} style={{ color: 'var(--ink-3)' }} />
          <input placeholder="Search blocks…" style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 12, color: 'var(--ink-1)' }} />
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>{blocks.length} of {blocks.length}</span>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 6px' }}>
        <TreeRow node={{ id: 'PAGE', kind: 'PAGE', type: 'structural', label: 'page · Page 47', counts: `${childrenOf(null).length} children` }}
          indent={-1} lastFlags={[]} last={false} hasKids={true} root />
        {render(null, 0, [])}
      </div>
      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--border-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="ghost" size="sm" icon="plus">structural</Button>
          <Button variant="ghost" size="sm" icon="plus">paragraph</Button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="outline" size="sm" icon="image">Draw on canvas</Button>
          <Button variant="primary" size="sm" icon="search">Auto-detect</Button>
        </div>
      </div>
    </div>
  );
};

const TreeRow = ({ node, indent, lastFlags = [], last, selected, hasKids, root }) => {
  const tone = TYPE_CHIP_TONE[node.type] || TYPE_CHIP_TONE.structural;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', minHeight: 28, padding: '3px 6px',
      borderRadius: 6, position: 'relative',
      background: selected ? 'color-mix(in oklab, #f97316 8%, var(--bg-surface))' : 'transparent',
      border: selected ? '1.5px solid #f97316' : '1.5px solid transparent',
      margin: '1px 0',
    }}>
      {/* indent guides */}
      <span style={{ display: 'inline-flex', alignItems: 'center', height: 22 }}>
        {lastFlags.map((isLast, i) => (
          <span key={i} style={{
            width: 14, height: 22, position: 'relative',
            borderLeft: isLast ? '0' : '1px solid var(--border-2)',
            marginLeft: i === 0 ? 0 : 0,
          }} />
        ))}
        {!root ? (
          <span style={{ width: 14, height: 22, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 0, top: 0, bottom: last ? '50%' : 0, width: 1, background: 'var(--border-2)',
            }} />
            <span style={{
              position: 'absolute', left: 0, top: '50%', width: 12, height: 1, background: 'var(--border-2)',
            }} />
          </span>
        ) : null}
        {hasKids ? (
          <span style={{
            width: 14, height: 14, marginRight: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink-3)',
          }}>
            <Icon name="chevD" size={11} />
          </span>
        ) : <span style={{ width: 14 }} />}
      </span>
      {/* chip */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        height: 19, padding: '0 7px', borderRadius: 4,
        background: tone.bg, color: tone.fg, fontSize: 11, fontWeight: 600,
        border: `1px solid ${tone.border}`,
      }}>
        {hasKids && node.type === 'paragraph' ? '¶ ' : ''}{node.kind}
      </span>
      <span className="mono" style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)' }}>{node.id}</span>
      <span style={{
        marginLeft: 8, fontSize: 11.5, color: selected ? 'var(--ink-1)' : 'var(--ink-2)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        flex: 1, minWidth: 0,
      }}>{node.label || node.kind}</span>
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', flex: '0 0 auto' }}>{node.counts || ''}</span>
    </div>
  );
};

/* ---------------------- Block type picker panel ---------------------- */

const BLOCK_TYPES_STRUCTURAL = [
  { id: 'body-main', name: 'body (main)' },
  { id: 'column',    name: 'column' },
  { id: 'sidebar',   name: 'sidebar' },
  { id: 'header',    name: 'header band' },
  { id: 'footer',    name: 'footer band' },
  { id: 'footnote',  name: 'footnote band' },
];
const BLOCK_TYPES_CONTENT = [
  { id: 'body-text',     name: 'body text' },
  { id: 'chapter-h',     name: 'chapter heading' },
  { id: 'section-h',     name: 'section heading' },
  { id: 'subsection-h',  name: 'subsection heading' },
  { id: 'title',         name: 'title' },
  { id: 'block-quote',   name: 'block quote' },
  { id: 'list',          name: 'list' },
  { id: 'figure-caption',name: 'figure caption' },
  { id: 'footnote-entry',name: 'footnote entry' },
  { id: 'running-header',name: 'running header text' },
  { id: 'page-number',   name: 'page number' },
];

const BlockTypePickerPanel = ({ selectedBlockId, modelSuggestion = 'block-quote', confidence = 0.71, selectedTypeId = 'block-quote' }) => (
  <div style={{
    flex: 1, minHeight: 0,
    display: 'flex', flexDirection: 'column', height: '100%',
  }}>
    {/* Header */}
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Block · {selectedBlockId}</div>
          <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)' }}>Block quote · layout type</span>
            <Badge tone="neutral" mono>structural · 2 children</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', height: 26, borderRadius: 6, background: 'var(--bg-raised)', border: '1px solid var(--border-1)' }}>
            <Icon name="search" size={11} style={{ color: 'var(--ink-3)' }} />
            <input placeholder="Search…" style={{ width: 96, border: 0, outline: 0, background: 'transparent', fontSize: 11.5, color: 'var(--ink-1)' }} />
          </div>
        </div>
      </div>
    </div>
    <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
      {/* Text preview */}
      <div style={{
        borderRadius: 8, border: '1px solid var(--border-1)', background: 'var(--bg-surface)',
        padding: '10px 14px', fontSize: 12.5, fontStyle: 'italic', color: 'var(--ink-2)', marginBottom: 12,
      }}>
        “I have no purpose but to serve the present age…” — two paragraphs of extended verse.
      </div>
      {/* Model suggestion */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8,
        background: 'color-mix(in oklab, var(--accent) 14%, var(--bg-surface))',
        border: '1px solid color-mix(in oklab, var(--accent) 50%, var(--border-1))',
        marginBottom: 14,
      }}>
        <div style={{ width: 26, height: 26, borderRadius: 99, background: 'var(--bg-surface)', border: '1px solid var(--accent)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
          <Icon name="info" size={13} />
        </div>
        <div style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-1)' }}>
          Model suggests <b>{modelSuggestion.replace('-', ' ')}</b> · {Math.round(confidence * 100)}% conf
        </div>
        <Button variant="primary" size="sm" icon="check">Accept</Button>
        <Button variant="outline" size="sm">Reject</Button>
      </div>
      {/* Structural */}
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Structural</div>
      <TypeGrid types={BLOCK_TYPES_STRUCTURAL} selected={selectedTypeId} />
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', margin: '16px 0 8px' }}>Content</div>
      <TypeGrid types={BLOCK_TYPES_CONTENT} selected={selectedTypeId} />
    </div>
    <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-1)', display: 'flex', justifyContent: 'space-between' }}>
      <Button variant="ghost" size="sm" icon="chevL">Back to tree</Button>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="outline" size="sm">Mark uncertain</Button>
        <Button variant="primary" size="sm">Save type</Button>
      </div>
    </div>
  </div>
);

const TypeGrid = ({ types, selected }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
    {types.map(t => {
      const a = t.id === selected;
      return (
        <div key={t.id} style={{
          position: 'relative', height: 64, padding: '8px 10px',
          borderRadius: 8, cursor: 'pointer',
          border: a ? '1.5px solid var(--ink-1)' : '1px solid var(--border-1)',
          background: 'var(--bg-surface)', boxShadow: a ? '0 0 0 2px color-mix(in oklab, var(--ink-1) 12%, transparent)' : 'none',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ width: 24, height: 2, background: a ? 'var(--ink-1)' : 'var(--ink-3)', borderRadius: 1 }} />
            <span style={{ width: 32, height: 2, background: a ? 'var(--ink-1)' : 'var(--ink-3)', borderRadius: 1 }} />
            <span style={{ width: 18, height: 2, background: a ? 'var(--ink-1)' : 'var(--ink-3)', borderRadius: 1 }} />
          </div>
          <span style={{ fontSize: 11, color: a ? 'var(--ink-1)' : 'var(--ink-2)', fontWeight: a ? 600 : 500 }}>{t.name}</span>
          {a ? (
            <span style={{
              position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 99,
              background: 'var(--ink-1)', color: 'var(--accent-ink)',
              display: 'grid', placeItems: 'center',
            }}>
              <Icon name="check" size={9} stroke={3} />
            </span>
          ) : null}
        </div>
      );
    })}
  </div>
);

/* ---------------------- Page attributes panel (right drawer) ---------------------- */

const PageAttributesPanel = ({ attrs, onCollapse }) => (
  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
    {/* Header */}
    <div style={{
      padding: '12px 14px', borderBottom: '1px solid var(--border-1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Page attributes</div>
        <div className="mono" style={{ marginTop: 3, fontSize: 14, fontWeight: 600, color: 'var(--ink-1)' }}>{attrs.pagePrefix || 'p012'}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Button variant="ghost" size="sm" icon="search">Detect</Button>
        <button title="Collapse drawer" onClick={onCollapse} style={{
          width: 24, height: 24, borderRadius: 5,
          border: '1px solid var(--border-1)', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
        }}>
          <Icon name="chevR" size={12} />
        </button>
      </div>
    </div>
    {/* Body */}
    <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
      {/* Page type */}
      <AttrField label="Page type" hint={attrs.typeName}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {ATTR_TYPES.map(t => {
            const a = t.id === attrs.type;
            return (
              <span key={t.id} style={{
                padding: '4px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 500,
                border: '1px solid',
                borderColor: a ? 'var(--accent)' : 'var(--border-1)',
                background: a ? 'color-mix(in oklab, var(--accent) 12%, var(--bg-surface))' : 'var(--bg-surface)',
                color: a ? 'var(--ink-1)' : 'var(--ink-2)', cursor: 'pointer',
              }}>{t.name}</span>
            );
          })}
        </div>
      </AttrField>
      {/* Numbering */}
      <AttrField label="Numbering" hint={attrs.numbered ? `${attrs.numberStyle} · ${attrs.numberValue}` : 'unnumbered'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Toggle on={attrs.numbered} />
          <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{attrs.numbered ? 'Numbered' : 'Unnumbered'}</span>
        </div>
        {attrs.numbered ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Seg2 opts={['arabic', 'roman', 'custom']} active={attrs.numberStyle || 'arabic'} />
            <Input value={String(attrs.numberValue || '12')} mono style={{ width: 78, height: 30 }} />
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            Plates, frontispieces, ads, and blank pages typically skip numbering.
          </div>
        )}
      </AttrField>
      {/* Section */}
      <AttrField label="Section" hint={attrs.section}>
        <Seg2 opts={['frontmatter', 'body', 'backmatter']} active={attrs.section} />
      </AttrField>
      {/* Structural marker */}
      <AttrField label="Structural marker">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <MarkerOpt label="Start of frontmatter (roman i)" active={attrs.marker === 'Start of frontmatter'} />
          <MarkerOpt label="Start of body (arabic 1)" active={attrs.marker === 'Start of body content'} />
          <MarkerOpt label="Start of post-book material" active={attrs.marker === 'Start of post-book material'} />
          <MarkerOpt label="Unnumbered insert (plate)" active={attrs.marker === 'unnumbered insert'} />
          <MarkerOpt label="None" active={!attrs.marker} />
        </div>
      </AttrField>
      {/* Alignment */}
      <AttrField label="Alignment" hint={attrs.align}>
        <Seg2 opts={['left', 'center', 'right', '—']} active={attrs.align} />
      </AttrField>
    </div>
    {/* Footer */}
    <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-1)',
      display: 'flex', justifyContent: 'space-between', gap: 8 }}>
      <Button variant="ghost" size="sm">Reset to detected</Button>
      <Button variant="primary" size="sm">Save attributes</Button>
    </div>
  </div>
);

const AttrField = ({ label, hint, children }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>{label}</div>
      {hint ? <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{hint}</span> : null}
    </div>
    {children}
  </div>
);

/* ---------------------- Drawer wrapper ---------------------- */

const Drawer = ({ side, width = 360, children, tabs, activeTab, onTab, collapsed, label, icons = [] }) => {
  if (collapsed) {
    return (
      <aside style={{
        width: 48, flex: '0 0 auto',
        borderLeft:  side === 'right' ? '1px solid var(--border-1)' : 'none',
        borderRight: side === 'left'  ? '1px solid var(--border-1)' : 'none',
        background: 'var(--bg-raised)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '12px 0', gap: 8,
      }}>
        <button title={`Expand ${label || (side + ' drawer')}`} style={{
          width: 36, height: 36, borderRadius: 7, border: '1px solid var(--border-1)',
          background: 'var(--bg-surface)', color: 'var(--ink-2)', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
        }}>
          <Icon name={side === 'right' ? 'chevL' : 'chevR'} size={14} />
        </button>
        {label ? (
          <div style={{
            marginTop: 6, fontSize: 9.5, color: 'var(--ink-3)', writingMode: 'vertical-rl',
            transform: 'rotate(180deg)', letterSpacing: '.12em', fontFamily: 'var(--mono-font)',
            textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap',
          }}>{label}</div>
        ) : null}
        {icons.length ? (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {icons.map((ic, i) => (
              <button key={i} title={ic.title || ''} style={{
                width: 36, height: 36, borderRadius: 7, border: '1px solid var(--border-1)',
                background: 'var(--bg-surface)', color: 'var(--ink-2)', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
              }}>
                <Icon name={ic.icon} size={14} />
              </button>
            ))}
          </div>
        ) : null}
      </aside>
    );
  }
  return (
    <aside style={{
      width, flex: '0 0 auto',
      borderLeft:  side === 'right' ? '1px solid var(--border-1)' : 'none',
      borderRight: side === 'left'  ? '1px solid var(--border-1)' : 'none',
      background: 'var(--bg-surface)',
      display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
    }}>
      {tabs ? (
        <div style={{
          display: 'flex', alignItems: 'center', padding: '0 8px',
          borderBottom: '1px solid var(--border-1)', background: 'var(--bg-raised)',
          height: 36, gap: 2, flex: '0 0 auto',
        }}>
          {tabs.map(t => {
            const a = activeTab === t.id;
            return (
              <div key={t.id} onClick={() => onTab && onTab(t.id)} style={{
                padding: '6px 10px', borderRadius: 5, cursor: 'pointer',
                background: a ? 'var(--bg-surface)' : 'transparent',
                boxShadow: a ? '0 1px 1px rgba(15,23,42,.06), 0 0 0 1px var(--border-1)' : 'none',
                fontSize: 12, fontWeight: a ? 600 : 500,
                color: a ? 'var(--ink-1)' : 'var(--ink-3)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {t.icon ? <Icon name={t.icon} size={12} /> : null}
                {t.name}
                {t.badge ? <span className="mono" style={{
                  fontSize: 10, padding: '0 5px', height: 14, borderRadius: 7,
                  background: 'var(--bg-raised)', border: '1px solid var(--border-1)',
                  color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center',
                }}>{t.badge}</span> : null}
              </div>
            );
          })}
          <button title={`Collapse ${side}`} style={{
            marginLeft: 'auto', width: 24, height: 24, borderRadius: 5,
            border: 0, background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name={side === 'right' ? 'chevR' : 'chevL'} size={12} />
          </button>
        </div>
      ) : null}
      {children}
    </aside>
  );
};

/* ---------------------- OCR text + words panel (right drawer on OCR stage) ---------------------- */

const OCR_LINES = [
  { id: 'L1', para: 1, paraName: 'body text (within block quote)', text: '"I have no purpose but', counts: '5 words · ✓5', dirty: 0,
    words: [
      { id: 'L1·W1', text: '"I',     conf: 0.92 },
      { id: 'L1·W2', text: 'have',   conf: 0.96 },
      { id: 'L1·W3', text: 'no',     conf: 0.94 },
      { id: 'L1·W4', text: 'purpose',conf: 0.97 },
      { id: 'L1·W5', text: 'but',    conf: 0.95 },
    ] },
  { id: 'L2', para: 1, paraName: 'body text (within block quote)', text: 'to serve the present age,', counts: '5 words · ↻5', dirty: 1,
    words: [
      { id: 'L2·W1', text: 'to',     conf: 0.94 },
      { id: 'L2·W2', text: 'serve',  conf: 0.92 },
      { id: 'L2·W3', text: 'the',    conf: 0.96 },
      { id: 'L2·W4', text: 'present',conf: 0.61, dirty: true, italic: true, selected: true, alt: 'prefent' },
      { id: 'L2·W5', text: 'age,',   conf: 0.93 },
    ] },
  { id: 'L3', para: 1, paraName: 'body text (within block quote)', text: 'my calling to fulfill;', counts: '4 words · ✓4',
    words: [
      { id: 'L3·W1', text: 'my',      conf: 0.93 },
      { id: 'L3·W2', text: 'calling', conf: 0.95 },
      { id: 'L3·W3', text: 'to',      conf: 0.94 },
      { id: 'L3·W4', text: 'fulfill;',conf: 0.91 },
    ] },
  { id: 'L4', para: 2, paraName: 'body text (within block quote)', text: 'O may it all my powers', counts: '6 words · ↻5', dirty: 1,
    words: [
      { id: 'L4·W1', text: 'O',       conf: 0.88 },
      { id: 'L4·W2', text: 'may',     conf: 0.94 },
      { id: 'L4·W3', text: 'it',      conf: 0.97 },
      { id: 'L4·W4', text: 'all',     conf: 0.96 },
      { id: 'L4·W5', text: 'my',      conf: 0.95, selected: true },
      { id: 'L4·W6', text: 'powers',  conf: 0.93 },
    ] },
];

const OcrTextPanel = ({ view = 'words', density = 'cards', selectedBlock = 'B2.2.2' }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
    {/* Breadcrumb */}
    <div style={{
      padding: '8px 14px', borderBottom: '1px solid var(--border-1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      background: 'var(--bg-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, fontSize: 11.5 }}>
        <span style={{ color: 'var(--ink-4)' }}>Matches</span>
        <Icon name="chevR" size={10} style={{ color: 'var(--ink-4)' }} />
        <span style={{
          padding: '2px 7px', borderRadius: 4, background: 'color-mix(in oklab, #a89788 18%, var(--bg-surface))',
          border: '1px solid #a89788', color: '#5d4e42', fontSize: 11, fontWeight: 600,
        }}>Body</span>
        <Icon name="chevR" size={10} style={{ color: 'var(--ink-4)' }} />
        <span style={{
          padding: '2px 7px', borderRadius: 4, background: 'color-mix(in oklab, #a89788 18%, var(--bg-surface))',
          border: '1px solid #a89788', color: '#5d4e42', fontSize: 11, fontWeight: 600,
        }}>Column 2 of 2</span>
        <Icon name="chevR" size={10} style={{ color: 'var(--ink-4)' }} />
        <span style={{
          padding: '2px 7px', borderRadius: 4, background: 'color-mix(in oklab, #a89788 18%, var(--bg-surface))',
          border: '1px solid #a89788', color: '#5d4e42', fontSize: 11, fontWeight: 600,
        }}>Block quote</span>
      </div>
      <Button variant="ghost" size="sm" icon="chevL">Jump to parent</Button>
    </div>
    {/* Layout / Items sub-tabs */}
    <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Seg2 opts={['Layout', `Items · 40`]} active="Items · 40" />
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
        <Button variant="ghost" size="sm" icon="x">Swap tabs</Button>
      </div>
    </div>
    {/* Action toolbar */}
    <div style={{
      padding: '8px 14px', borderBottom: '1px solid var(--border-1)',
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      background: 'var(--bg-raised)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px',
          background: 'color-mix(in oklab, var(--accent) 12%, var(--bg-surface))',
          border: '1px solid var(--accent)', borderRadius: 5, fontSize: 11.5, fontWeight: 600,
        }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: 'var(--accent-ink)' }}>
            <Icon name="check" size={8} stroke={3} />
          </span>
          2 of 26 selected
        </span>
      </div>
      <Divider vertical style={{ height: 18 }} />
      <Button variant="outline" size="sm" icon="check">Validate</Button>
      <Button variant="ghost" size="sm">OCR · GT</Button>
      <Button variant="ghost" size="sm">Refine</Button>
      <Divider vertical style={{ height: 18 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>View</span>
        <Seg2 opts={['Blocks', 'Paragraphs', 'Lines', 'Words']} active="Words" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Density</span>
        <Seg2 opts={['Cards', 'Rows']} active={density === 'cards' ? 'Cards' : 'Rows'} />
      </div>
    </div>
    {/* Scope strip */}
    <div style={{ padding: '6px 14px', borderBottom: '1px solid var(--border-1)', fontSize: 11.5, color: 'var(--ink-3)' }}>
      <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-4)', marginRight: 8 }}>Scope</span>
      Block quote (2 paragraphs · 6 lines · 26 words) · <span style={{ color: 'var(--ink-2)' }}>grouped by line</span>
    </div>
    {/* Body */}
    <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {OCR_LINES.map(line => (
        density === 'cards' ? <LineBlockCards key={line.id} line={line} /> : <LineBlockRows key={line.id} line={line} />
      ))}
    </div>
  </div>
);

const LineBlockCards = ({ line }) => (
  <div style={{
    borderRadius: 9, border: '1px solid var(--border-1)', background: 'var(--bg-surface)',
  }}>
    <LineHeader line={line} />
    <div style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
      {line.words.map(w => <WordCard key={w.id} w={w} />)}
    </div>
  </div>
);

const LineBlockRows = ({ line }) => (
  <div style={{
    borderRadius: 9, border: '1px solid var(--border-1)', background: 'var(--bg-surface)',
  }}>
    <LineHeader line={line} />
    <div style={{ padding: 4 }}>
      {line.words.map(w => <WordRow key={w.id} w={w} />)}
    </div>
  </div>
);

const LineHeader = ({ line }) => (
  <div style={{
    padding: '8px 12px', borderBottom: '1px solid var(--border-1)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'color-mix(in oklab, #d99094 8%, var(--bg-surface))',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        padding: '1px 7px', borderRadius: 99,
        background: 'color-mix(in oklab, #d99094 25%, var(--bg-surface))',
        border: '1px solid #d99094', color: '#a85d62', fontSize: 10.5, fontWeight: 600,
      }}>{line.id.replace('L', 'line ')}</span>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>¶#{line.para}</span>
      <span style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>· {line.paraName} · {line.counts}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{line.words.filter(w => w.selected).length} selected</span>
      <Button variant="ghost" size="sm">Select line</Button>
    </div>
  </div>
);

const WordCard = ({ w }) => (
  <div style={{
    position: 'relative', borderRadius: 7,
    border: w.selected ? '2px solid var(--mismatch)' : '1px solid var(--border-1)',
    background: 'var(--bg-surface)',
    padding: 7, display: 'flex', flexDirection: 'column', gap: 5,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 14, height: 14, borderRadius: 3,
          border: w.selected ? 'none' : '1px solid var(--border-2)',
          background: w.selected ? 'var(--mismatch)' : 'transparent',
          display: 'grid', placeItems: 'center', color: 'white',
        }}>{w.selected ? <Icon name="check" size={9} stroke={3} /> : null}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{w.id}</span>
      </div>
      <ConfPip conf={w.conf} dirty={w.dirty} />
    </div>
    {/* word visual — placeholder */}
    <div style={{
      borderRadius: 4, height: 28, background: '#fbf9f4',
      border: '1px solid var(--border-2)', display: 'grid', placeItems: 'center',
      fontFamily: 'Georgia, serif', fontSize: 14, color: '#3a2c1c',
    }}>
      <span style={{ fontStyle: w.italic ? 'italic' : 'normal' }}>{w.alt || w.text}</span>
    </div>
    {/* OCR text input */}
    <input defaultValue={w.text} className="mono" style={{
      height: 22, padding: '0 6px', borderRadius: 4,
      background: w.dirty ? 'color-mix(in oklab, var(--fuzzy) 12%, var(--bg-surface))' : 'var(--bg-raised)',
      border: `1px solid ${w.dirty ? 'color-mix(in oklab, var(--fuzzy) 50%, var(--border-1))' : 'var(--border-1)'}`,
      fontSize: 11, color: 'var(--ink-1)', outline: 0,
    }} />
    {w.italic ? (
      <span style={{
        position: 'absolute', bottom: 5, right: 5,
        fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
        background: 'var(--bg-raised)', color: 'var(--ink-3)',
        border: '1px solid var(--border-1)', fontStyle: 'italic',
      }}>italic</span>
    ) : null}
  </div>
);

const WordRow = ({ w }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '16px 60px 1fr 1fr 28px 60px',
    alignItems: 'center', gap: 10, padding: '4px 8px',
    borderRadius: 5,
    background: w.selected ? 'color-mix(in oklab, var(--mismatch) 6%, transparent)' : 'transparent',
  }}>
    <span style={{
      width: 14, height: 14, borderRadius: 3,
      border: w.selected ? 'none' : '1px solid var(--border-2)',
      background: w.selected ? 'var(--mismatch)' : 'transparent',
      display: 'grid', placeItems: 'center', color: 'white',
    }}>{w.selected ? <Icon name="check" size={9} stroke={3} /> : null}</span>
    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{w.id}</span>
    <span style={{
      padding: '2px 8px', borderRadius: 3, background: '#fbf9f4',
      border: '1px solid var(--border-2)',
      fontFamily: 'Georgia, serif', fontSize: 13, color: '#3a2c1c',
      fontStyle: w.italic ? 'italic' : 'normal',
    }}>{w.alt || w.text}</span>
    <input defaultValue={w.text} className="mono" style={{
      height: 22, padding: '0 6px', borderRadius: 3,
      background: w.dirty ? 'color-mix(in oklab, var(--fuzzy) 12%, var(--bg-surface))' : 'var(--bg-raised)',
      border: `1px solid ${w.dirty ? 'color-mix(in oklab, var(--fuzzy) 50%, var(--border-1))' : 'var(--border-1)'}`,
      fontSize: 11, color: 'var(--ink-1)', outline: 0,
    }} />
    <ConfPip conf={w.conf} dirty={w.dirty} />
    <Button variant="ghost" size="sm" iconRight="chevR">Open</Button>
  </div>
);

const ConfPip = ({ conf, dirty }) => {
  const ok = !dirty && conf >= 0.85;
  const warn = !ok && conf >= 0.7;
  const fail = !ok && !warn;
  const tone = ok ? 'var(--exact)' : warn ? 'var(--fuzzy)' : 'var(--mismatch)';
  const sym = ok ? '✓' : warn ? '↻' : '✗';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 5px', borderRadius: 3, fontSize: 10, fontWeight: 600,
      background: `color-mix(in oklab, ${tone} 14%, var(--bg-surface))`,
      border: `1px solid color-mix(in oklab, ${tone} 50%, var(--border-1))`,
      color: 'var(--ink-1)',
    }}>
      <span style={{ color: tone }}>{sym}</span>
      <span className="mono">{conf.toFixed(2)}</span>
    </span>
  );
};

Object.assign(window, { OcrTextPanel, OCR_LINES });
