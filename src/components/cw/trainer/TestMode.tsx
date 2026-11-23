import React, { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import ResultView from '../ResultView';
import * as cwApi from '../cwApi';
import { usePlayer } from '../usePlayer';

type Props = {
  settings: cwApi.Settings;
  lessons: cwApi.Options['lessons'];
  token: string;
  audioReady: boolean;
  onChangeSettings: (changes: Partial<cwApi.Settings>) => void;
  onBusyChange: (busy: boolean) => void;
  onSaved: (sessionId: number) => void;
  onError: (message: string) => void;
};

function formatTime(seconds: number) {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

export default function TestMode({
  settings, lessons, token, audioReady, onChangeSettings, onBusyChange, onSaved, onError,
}: Props) {
  const [playedSettings, setPlayedSettings] = useState<cwApi.Settings | null>(null);
  const [text, setText] = useState('');
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<cwApi.Result | null>(null);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);
  const player = usePlayer();
  const { elapsed, duration } = player.progress;
  const playing = player.status === 'playing' || player.status === 'loading';
  const showCheck = Boolean(text && player.status === 'done' && !result);
  const canCheck = showCheck && !loading && player.playedChars > 0;
  const nextLesson = playedSettings ? playedSettings.lesson + 1 : null;
  const canAdvance = result?.passed && player.completed &&
    lessons.some(({ lesson }) => lesson === nextLesson);

  const busy = playing || loading;
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function start() {
    if (!audioReady) return;
    try { player.prepare(); }
    catch (cause) { onError(cause instanceof Error ? cause.message : 'Could not start audio'); return; }
    setPlayedSettings({ ...settings });
    onError('');
    setResult(null);
    setTyped('');
    setText('');
    setLoading(true);
    try {
      const practice = await cwApi.getPractice(token, settings);
      if (!mounted.current) return;
      setText(practice.text);
      await player.start(practice.text, settings);
    } catch (cause) {
      if (!mounted.current) return;
      setText('');
      player.stop();
      onError(cause instanceof Error ? cause.message : 'Could not start practice');
    } finally { if (mounted.current) setLoading(false); }
  }
  async function check() {
    if (!playedSettings || !canCheck) return;
    setLoading(true);
    onError('');
    try {
      const sent = player.completed ? text : text.slice(0, player.playedChars).trimEnd();
      const response = await cwApi.postResults(token, {
        lesson: playedSettings.lesson, charWpm: playedSettings.charWpm, effWpm: playedSettings.effWpm,
        toneHz: playedSettings.toneHz, groupLength: playedSettings.groupLength, sent, typed, complete: player.completed,
      });
      setResult(response.result);
      if (response.saved && response.session) onSaved(response.session.id);
    } catch (cause) { onError(cause instanceof Error ? cause.message : 'Could not check practice'); }
    finally { setLoading(false); }
  }
  function again() {
    setResult(null);
    setTyped('');
    setText('');
    setPlayedSettings(null);
  }
  function advance() {
    if (!canAdvance || nextLesson === null) return;
    onChangeSettings({ lesson: nextLesson });
    again();
  }

  function checkShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    if (canCheck && !event.repeat) void check();
  }

  return (
    <>
      <div className="cw-actions">
        {!text && (
          <button type="button" onClick={start} disabled={loading || !audioReady}>Start</button>
        )}
        {playing && <button type="button" onClick={player.stop}>Stop</button>}
        {showCheck && (
          <button type="button" onClick={check} disabled={!canCheck}>Check</button>
        )}
        {(result || (showCheck && player.playedChars < 1)) && (
          <button type="button" onClick={again}>Practice again</button>
        )}
        {canAdvance && <button type="button" onClick={advance}>Next lesson</button>}
      </div>
      {token && !text && <p>Practice adapts to the letters you miss</p>}
      {player.status === 'playing' && duration > 0 && (
        <p>
          Elapsed: {formatTime(elapsed)} of {formatTime(Math.round(duration))}{' '}
          ({Math.floor(100 * elapsed / duration)}%)
        </p>
      )}
      {text && (
        <>
          <label className="cw-copy-label">
            Type what you hear
            <textarea
              autoFocus
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={checkShortcut}
              aria-describedby="cw-check-hint"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              rows={5}
            />
          </label>
          <p id="cw-check-hint" className="cw-check-hint">Ctrl+Enter or ⌘+Enter to check</p>
        </>
      )}
      {result && <ResultView result={result} loggedIn={Boolean(token)} complete={player.completed} />}
    </>
  );
}
