import React from 'react';

type Mode = 'test' | 'feedback';
type Props = { mode: Mode; disabled: boolean; onChange: (mode: Mode) => void };

export default function ModeSwitch({ mode, disabled, onChange }: Props) {
  return (
    <div className="cw-mode-switch" role="group" aria-label="Mode">
      <button type="button" aria-pressed={mode === 'test'} disabled={disabled} onClick={() => onChange('test')}>
        Test
      </button>
      <button type="button" aria-pressed={mode === 'feedback'} disabled={disabled} onClick={() => onChange('feedback')}>
        Feedback
      </button>
    </div>
  );
}
