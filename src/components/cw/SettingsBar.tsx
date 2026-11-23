import React from 'react';
import type { Options, Settings } from './cwApi';
type Props = { settings: Settings; options: Options; disabled: boolean; onChange: (changes: Partial<Settings>) => void };
export default function SettingsBar({ settings, options, disabled, onChange }: Props) {
  const controls: { key: keyof Settings; label: string; choices: { value: number; text: string }[] }[] = [
    { key: 'lesson', label: 'Lesson', choices: options.lessons.map(({ lesson, chars }) => ({ value: lesson, text: `Lesson ${lesson}: ${chars.join(' ')}` })) },
    { key: 'charWpm', label: 'Character speed', choices: options.charWpm.map((n) => ({ value: n, text: `${n} WPM` })) },
    { key: 'effWpm', label: 'Effective speed', choices: options.effWpm.filter((n) => n <= settings.charWpm).map((n) => ({ value: n, text: `${n} WPM` })) },
    { key: 'toneHz', label: 'Tone', choices: options.toneHz.map((n) => ({ value: n, text: `${n} Hz` })) },
    { key: 'minutes', label: 'Duration', choices: options.minutes.map((n) => ({ value: n, text: `${n} minute${n === 1 ? '' : 's'}` })) },
    { key: 'groupLength', label: 'Group length', choices: options.groupLength.map((n) => ({ value: n, text: n ? String(n) : 'Random (2–7)' })) },
  ];
  return <div className="cw-settings">{controls.map(({ key, label, choices }) => <label key={key}>{label}<select value={settings[key]} disabled={disabled} onChange={(event) => {
    const value = Number(event.target.value);
    onChange(key === 'charWpm' && value < settings.effWpm ? { charWpm: value, effWpm: value } : { [key]: value });
  }}>{choices.map(({ value, text }) => <option key={value} value={value}>{text}</option>)}</select></label>)}</div>;
}
