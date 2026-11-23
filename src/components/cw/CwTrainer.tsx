import React, { useEffect, useRef, useState } from 'react';
import { SiteContentContainer } from '..';
import { useAuth } from '../Auth';
import { SettingsBar, ResultView } from './index';
import * as cwApi from './cwApi';
import { usePlayer } from './usePlayer';

export default function CwTrainer() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<cwApi.Settings | null>(null);
  const [options, setOptions] = useState<cwApi.Options | null>(null);
  const [text, setText] = useState('');
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<cwApi.Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const typingBox = useRef<HTMLTextAreaElement>(null);
  const saveQueue = useRef(Promise.resolve());
  const player = usePlayer();

  useEffect(() => { document.title = 'CW Trainer - Matthew Pelnik'; }, []);
  useEffect(() => {
    let active = true;
    cwApi.getSettings(token).then(({ settings: next, options: choices }) => {
      if (active) { setSettings(next); setOptions(choices); setError(''); }
    }).catch((cause: Error) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, [token]);

  function changeSettings(changes: Partial<cwApi.Settings>) {
    setSettings((current) => current ? { ...current, ...changes } : current);
    setError('');
    if (token) {
      saveQueue.current = saveQueue.current.then(() => cwApi.putSettings(token, changes).then(() => undefined)).catch((cause: Error) => { setError(cause.message); });
    }
  }
  async function start() {
    if (!settings) return;
    setError('');
    setResult(null);
    setTyped('');
    setText('');
    setLoading(true);
    try {
      const practice = await cwApi.getPractice(token, settings);
      setText(practice.text);
      typingBox.current?.focus();
      await player.start(practice.text, settings);
    } catch (cause) {
      setText('');
      player.stop();
      setError(cause instanceof Error ? cause.message : 'Could not start practice');
    } finally { setLoading(false); }
  }
  async function check() {
    if (!settings || !text || player.playedChars < 1) return;
    setLoading(true);
    setError('');
    try {
      const sent = text.slice(0, player.playedChars).trimEnd();
      const response = await cwApi.postResults(token, {
        lesson: settings.lesson, charWpm: settings.charWpm, effWpm: settings.effWpm,
        toneHz: settings.toneHz, groupLength: settings.groupLength, sent, typed,
      });
      setResult(response.result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not check practice'); }
    finally { setLoading(false); }
  }
  function again() {
    setResult(null);
    setTyped('');
    setText('');
  }
  const group = player.playedChars ? text.slice(0, player.playedChars).split(' ').length : 0;
  const totalGroups = text ? text.split(' ').length : 0;
  const playing = player.status === 'playing' || player.status === 'loading';
  return <SiteContentContainer><section className="cw-page">
    <h1>CW Trainer</h1>
    <p>Listen to Morse code groups, type what you hear, then check your copy.</p>
    {settings && options ? <>
      <SettingsBar settings={settings} options={options} disabled={playing || loading} onChange={changeSettings} />
      <div className="cw-actions">
        {!text && <button type="button" onClick={start} disabled={loading}>Start</button>}
        {playing && <button type="button" onClick={player.stop}>Stop</button>}
        {text && player.status === 'done' && !result && <button type="button" onClick={check} disabled={loading || player.playedChars < 1}>Check</button>}
        {(result || text && player.status === 'done' && player.playedChars < 1) && <button type="button" onClick={again}>Practice again</button>}
      </div>
      {playing && <p role="status">Group {group} of {totalGroups}</p>}
      {text && <label className="cw-copy-label">Type what you hear<textarea ref={typingBox} value={typed} onChange={(event) => setTyped(event.target.value)} autoCapitalize="characters" autoCorrect="off" spellCheck={false} rows={5} /></label>}
      {result && <ResultView result={result} loggedIn={Boolean(token)} />}
    </> : !error && <p>Loading settings…</p>}
    {error && <p role="alert" className="cw-error">{error}</p>}
    <p className="cw-credits">Lessons follow the Koch course from <a href="https://lcwo.net/">LCWO</a> (lcwo.net). Audio by <a href="https://fkurz.net/ham/jscwlib.html">jscwlib</a>, by Fabian Kurz, DJ5CW (MIT).</p>
  </section></SiteContentContainer>;
}
