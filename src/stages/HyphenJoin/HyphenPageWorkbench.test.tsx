/**
 * HyphenPageWorkbench unit tests.
 *
 * Tests:
 *   - Root testid HYPHEN_PAGE_WORKBENCH present
 *   - Viewer testid HYPHEN_PAGE_WORKBENCH_VIEWER present
 *   - Decisions testid HYPHEN_PAGE_WORKBENCH_DECISIONS present
 *   - Page image URL passed to ArtifactViewer
 *   - Cases list renders one card per case (via testid)
 *   - EmptyCases: decisions container present, no cards
 *   - onDecide fires with caseId + 'accept' when Accept clicked on undecided case
 *   - onDecide fires with caseId + 'keep' when Keep clicked
 *   - onDecide fires with caseId + 'flag' when Flag clicked
 *   - onDecide fires with caseId + 'validate' when Accept clicked on joined case
 *   - Second card Accept fires onDecide with correct caseId
 *   - Forwards custom data-testid
 *
 * ArtifactViewer is mocked (react-konva cannot run in jsdom).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ── Mock ArtifactViewer (wraps react-konva; jsdom cannot run canvas) ──────────
vi.mock('../PageWorkbench/ArtifactViewer.js', () => ({
  ArtifactViewer: ({
    imageSrc,
    'data-testid': tid,
  }: {
    imageSrc?: string;
    pageWidth?: number;
    pageHeight?: number;
    overlayMode?: string;
    'data-testid'?: string;
  }) => <div data-testid={tid ?? 'artifact-viewer-mock'} data-src={imageSrc} />,
}));

import { HyphenPageWorkbench } from './HyphenPageWorkbench.js';
import type { HyphenPageWorkbenchPage } from './HyphenPageWorkbench.js';
import type { HJDecisionCase } from './HJDecisionCard.js';
import {
  HYPHEN_PAGE_WORKBENCH,
  HYPHEN_PAGE_WORKBENCH_VIEWER,
  HYPHEN_PAGE_WORKBENCH_DECISIONS,
  HJ_DECISION_CARD,
} from '../../testids/index.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_PAGE: HyphenPageWorkbenchPage = {
  id: 'p-042',
  imageUrl: 'images/p-042-before.png',
  afterImageUrl: 'images/p-042-after.png',
  pageWidth: 2400,
  pageHeight: 3200,
  splitX: 0.5,
};

const MOCK_CASES: HJDecisionCase[] = [
  {
    id: 'case-1',
    originalText: 'some-thing',
    joinProposal: 'something',
    ngrams: [3, 7, 12, 8, 5],
    status: 'undecided',
  },
  {
    id: 'case-2',
    originalText: 're-port',
    joinProposal: 'report',
    status: 'undecided',
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('HyphenPageWorkbench', () => {
  let onDecide: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onDecide = vi.fn();
  });

  it('renders the root testid', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    expect(screen.getByTestId(HYPHEN_PAGE_WORKBENCH)).toBeInTheDocument();
  });

  it('renders the viewer testid (ArtifactViewer slot)', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    expect(screen.getByTestId(HYPHEN_PAGE_WORKBENCH_VIEWER)).toBeInTheDocument();
  });

  it('renders the decisions testid (case list container)', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    expect(screen.getByTestId(HYPHEN_PAGE_WORKBENCH_DECISIONS)).toBeInTheDocument();
  });

  it('page image URL is passed to ArtifactViewer (mock exposes data-src)', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    // The mocked ArtifactViewer renders a div[data-testid="artifact-viewer-mock"]
    // with data-src set to imageSrc. It is a child of the viewer container.
    const artifactMock = screen.getByTestId('artifact-viewer-mock');
    expect(artifactMock.getAttribute('data-src')).toBe(MOCK_PAGE.imageUrl);
  });

  it('renders one HJDecisionCard per case (via testid)', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    // Each HJDecisionCard renders with the HJ_DECISION_CARD base testid by default —
    // but since there are two cards both render with the same default testid, use getAllByTestId.
    const cards = screen.getAllByTestId(HJ_DECISION_CARD);
    expect(cards).toHaveLength(2);
  });

  it('EmptyCases: decisions container present, no cards', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={[]} onDecide={onDecide} />);
    expect(screen.getByTestId(HYPHEN_PAGE_WORKBENCH_DECISIONS)).toBeInTheDocument();
    expect(screen.queryAllByTestId(HJ_DECISION_CARD)).toHaveLength(0);
  });

  it('onDecide fires with caseId + accept when Accept clicked on undecided case', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    const acceptBtns = screen.getAllByTestId('hj-decision-card-accept');
    fireEvent.click(acceptBtns[0]!);
    expect(onDecide).toHaveBeenCalledWith('case-1', 'accept');
  });

  it('onDecide fires with caseId + keep when Keep clicked', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    const keepBtns = screen.getAllByTestId('hj-decision-card-keep');
    fireEvent.click(keepBtns[0]!);
    expect(onDecide).toHaveBeenCalledWith('case-1', 'keep');
  });

  it('onDecide fires with caseId + flag when Flag clicked', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    const flagBtns = screen.getAllByTestId('hj-decision-card-flag');
    fireEvent.click(flagBtns[0]!);
    expect(onDecide).toHaveBeenCalledWith('case-1', 'flag');
  });

  it('onDecide fires with caseId + validate when Accept clicked on auto-joined case', () => {
    const joinedCase: HJDecisionCase = {
      id: 'case-joined',
      originalText: 'vali-date',
      joinProposal: 'validate',
      status: 'auto-joined',
    };
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={[joinedCase]} onDecide={onDecide} />);
    // For joined cases, the Accept action emits 'validate' (human confirmation of auto-join)
    const acceptBtns = screen.getAllByTestId('hj-decision-card-accept');
    fireEvent.click(acceptBtns[0]!);
    expect(onDecide).toHaveBeenCalledWith('case-joined', 'validate');
  });

  it('second card Accept fires onDecide with correct caseId', () => {
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    const acceptBtns = screen.getAllByTestId('hj-decision-card-accept');
    fireEvent.click(acceptBtns[1]!);
    expect(onDecide).toHaveBeenCalledWith('case-2', 'accept');
  });

  it('forwards custom data-testid to root', () => {
    render(
      <HyphenPageWorkbench
        page={MOCK_PAGE}
        cases={MOCK_CASES}
        onDecide={onDecide}
        data-testid="custom-hpw"
      />,
    );
    expect(screen.getByTestId('custom-hpw')).toBeInTheDocument();
  });

  it('threads onNext to each HJDecisionCard so J key fires it', () => {
    const onNext = vi.fn();
    render(
      <HyphenPageWorkbench
        page={MOCK_PAGE}
        cases={MOCK_CASES}
        onDecide={onDecide}
        onNext={onNext}
      />,
    );
    const cards = screen.getAllByTestId(HJ_DECISION_CARD);
    fireEvent.keyDown(cards[0]!, { key: 'j' });
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('threads onPrev to each HJDecisionCard so K key fires it', () => {
    const onPrev = vi.fn();
    render(
      <HyphenPageWorkbench
        page={MOCK_PAGE}
        cases={MOCK_CASES}
        onDecide={onDecide}
        onPrev={onPrev}
      />,
    );
    const cards = screen.getAllByTestId(HJ_DECISION_CARD);
    fireEvent.keyDown(cards[0]!, { key: 'k' });
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('does not thread onNext/onPrev when not provided', () => {
    // Should render without error when onNext/onPrev are absent
    render(<HyphenPageWorkbench page={MOCK_PAGE} cases={MOCK_CASES} onDecide={onDecide} />);
    const cards = screen.getAllByTestId(HJ_DECISION_CARD);
    // J key with no onNext handler should not throw
    expect(() => fireEvent.keyDown(cards[0]!, { key: 'j' })).not.toThrow();
  });
});
