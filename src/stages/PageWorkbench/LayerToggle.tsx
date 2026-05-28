/**
 * LayerToggle — internal HUD for showing/hiding annotation layers.
 *
 * Renders a compact pill row with one Toggle per layer type:
 * Blocks / Words / Detections.
 *
 * NOT exported from the package — this is an internal sub-component
 * of LabelerCanvas, exercised by LabelerCanvas.stories.tsx.
 */

import { Toggle } from '../../primitives/Toggle.js';
import type { LayerVisibility } from './LabelerCanvas.js';

interface LayerToggleProps {
  visibility: LayerVisibility;
  onChange: (next: LayerVisibility) => void;
}

const LAYERS = [
  { key: 'blocks', label: 'Blocks' },
  { key: 'words', label: 'Words' },
  { key: 'detections', label: 'Detections' },
] as const;

export function LayerToggle({ visibility, onChange }: LayerToggleProps) {
  return (
    <div
      className="layer-toggle"
      data-testid="layer-toggle"
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 'var(--space-1, 4px)',
        padding: 'var(--space-1, 4px) var(--space-2, 8px)',
        background: 'var(--bg-raised, rgba(0,0,0,0.7))',
        borderRadius: 'var(--radius-pill, 9999px)',
        alignItems: 'center',
      }}
    >
      {LAYERS.map(({ key, label }) => (
        <span key={key} data-testid={`labeler-layer-toggle-${key}`}>
          <Toggle
            checked={visibility[key]}
            onCheckedChange={(checked) => {
              onChange({ ...visibility, [key]: checked });
            }}
            label={label}
          />
        </span>
      ))}
    </div>
  );
}

LayerToggle.displayName = 'LayerToggle';
