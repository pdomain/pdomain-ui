# `@pdomain/pdomain-ui/worklist`

This package provides virtualized, keyboard-navigable list panels for the
pdomain-\* review workflow.

## Three list components share one API

| Component   | Item type       | Default `aria-label` |
|-------------|-----------------|----------------------|
| `<WordList>` | `WordListItem` | `"Word list"` |
| `<LineList>` | `BlockListItem` | `"Line list"` |
| `<PageList>` | `PageListItem`  | `"Page list"` |

All three components share the same render-prop row API. They also share
keyboard navigation with `ArrowDown`, `ArrowUp`, and `Enter`.

## Render-prop slot

```tsx
import { WordList } from '@pdomain/pdomain-ui/worklist'
import type { WordRowProps, WordListItem } from '@pdomain/pdomain-ui/worklist'

<WordList
  items={words}
  selectedIndex={selectedIdx}
  onSelect={setSelectedIdx}
  getMatchStatus={(w) => deriveStatus(w)}
  renderRow={(p: WordRowProps<MyWord>) => (
    <div className={p.isSelected ? 'selected' : ''}>
      <span className={`status-${p.matchStatus}`} />
      {p.item.text}
    </div>
  )}
/>
```

## Migration guide — `LineCard` adapter (Phase 2)

In Phase 2, `pdomain-ocr-labeler-spa` will replace its internal `LineCard.tsx`
with a `renderRow` implementation for `<WordList>` or `<LineList>`. The
expected prop shape is:

```ts
// Props that `renderRow` will receive
interface WordRowProps<TWord extends WordListItem> {
  item: TWord          // full word/block data — replaces LineCard's `line: LineMatch`
  index: number        // zero-based position in display list
  isSelected: boolean  // replaces LineCard header bg styling
  matchStatus: MatchStatus  // 'exact' | 'fuzzy' | 'mismatch' | 'none'
}
```

### Mapping from `LineCard` to `renderRow`

| `LineCard` prop  | `renderRow` equivalent |
|------------------|------------------------|
| `line.overall_match_status` | `p.matchStatus` (derived from `getMatchStatus`) |
| `line.is_fully_validated`   | App-side derived from `p.item.review` |
| `onValidate`     | Passed via closure / context |
| `onCopyGtToOcr`  | Passed via closure / context |
| `onDelete`       | Passed via closure / context |
| `onCommitGt`     | Passed via closure / context |
| `onEditWord`     | Passed via closure / context |
| `imageBaseUrl`   | Passed via closure / context |

The adapter pattern is:

```tsx
// In labeler-spa: create a bound renderRow from the app's callbacks
function makeLineCardRow(callbacks: LineCardCallbacks) {
  return function LineCardRow(p: WordRowProps<LineMatch>) {
    return (
      <LineCard
        line={p.item}
        {...callbacks}
      />
    )
  }
}

// Then:
<WordList
  items={filteredLines}
  renderRow={makeLineCardRow(callbacks)}
  getMatchStatus={(line) => line.overall_match_status ?? 'none'}
  selectedIndex={selectedLineIndex}
  onSelect={setSelectedLineIndex}
/>
```

### `MatchStatus` mapping

In labeler-spa, `LineCard`'s `MatchStatus` includes the `unmatched_ocr` and
`unmatched_gt` variants. The pdomain-ui `MatchStatus` type is a strict
four-value union: `exact | fuzzy | mismatch | none`. Use these mappings during
migration:

- `'unmatched_ocr'` → map to `'mismatch'`
- `'unmatched_gt'` → map to `'mismatch'` (or `'none'` depending on app policy)
- `'unvalidated'` → map to `'none'`

The consuming app's `getMatchStatus` callback owns the mapping. It does not
belong in pdomain-ui because pdomain-ui has no labeler-specific concepts.

## Filter / sort hooks

`useWorklistFilter` and `useWorklistSort` provide memoized filter predicates
and sort comparators. Use them with `items` arrays before passing those arrays
to list components. Their implementations are in `hooks/`.

```ts
import { useWorklistFilter } from '@pdomain/pdomain-ui/worklist'

const filtered = useWorklistFilter(words, { matchStatus: 'mismatch' })
```
