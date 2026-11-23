import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteContentContainer } from '..';
import { useAuth } from '../Auth';
import { SettingsBar, ResultView } from './index';
import * as cwApi from './cwApi';
import { usePlayer } from './usePlayer';
import { loadJscw } from './loadJscw';

function formatTime(seconds: number) {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

export default function CwTrainer() {
  const { token, account, logout } = useAuth();
  const [settings, setSettings] = useState<cwApi.Settings | null>(null);
  const [playedSettings, setPlayedSettings] = useState<cwApi.Settings | null>(null);
  const [audioReady, setAudioReady] = useState(false);
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
    async function load() {
      try {
        const { settings: next, options: choices } = await cwApi.getSettings(token);
        if (active) { setSettings(next); setOptions(choices); setError(''); }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : 'Could not load settings'); }
    }
    void load();
    return () => { active = false; };
  }, [token]);
  useEffect(() => {
    let active = true;
    async function loadAudio() {
      try { await loadJscw(); if (active) setAudioReady(true); }
      catch (cause) { if (active) setError(cause instanceof Error ? cause.message : 'Could not load audio player'); }
    }
    void loadAudio();
    return () => { active = false; };
  }, []);

  function changeSettings(changes: Partial<cwApi.Settings>) {
    setSettings((current) => current ? { ...current, ...changes } : current);
    setError('');
    if (token) {
      const previous = saveQueue.current;
      saveQueue.current = (async () => {
        await previous;
        try { await cwApi.putSettings(token, changes); }
        catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save settings'); }
      })();
    }
  }
  async function start() {
    if (!settings || !audioReady) return;
    try { player.prepare(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not start audio'); return; }
    setPlayedSettings({ ...settings });
    setError('');
    setResult(null);
    setTyped('');
    setText('');
    setLoading(true);
    try {
      const practice = await cwApi.getPractice(token, settings);
      setText(practice.text);
      await player.start(practice.text, settings);
    } catch (cause) {
      setText('');
      player.stop();
      setError(cause instanceof Error ? cause.message : 'Could not start practice');
    } finally { setLoading(false); }
  }
  async function check() {
    if (!playedSettings || !text || player.playedChars < 1) return;
    setLoading(true);
    setError('');
    try {
      const sent = text.slice(0, player.playedChars).trimEnd();
      const response = await cwApi.postResults(token, {
        lesson: playedSettings.lesson, charWpm: playedSettings.charWpm, effWpm: playedSettings.effWpm,
        toneHz: playedSettings.toneHz, groupLength: playedSettings.groupLength, sent, typed,
      });
      setResult(response.result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not check practice'); }
    finally { setLoading(false); }
  }
  function again() {
    setResult(null);
    setTyped('');
    setText('');
    setPlayedSettings(null);
  }
  const { elapsed, duration } = player.progress;
  const playing = player.status === 'playing' || player.status === 'loading';
  return <SiteContentContainer><section className="cw-page">
    <div className="cw-heading">
      <h1>CW Trainer</h1>
      {token ? (
        <div className="cw-account">
          {account && <span>Signed in as <strong>{account.username}</strong></span>}
          <button className="cw-auth-control" type="button" onClick={logout}>Log out</button>
        </div>
      ) : (
        <Link className="cw-auth-control" to="/login?next=/cw">Log in</Link>
      )}
    </div>
    <p>Listen to Morse code groups, type what you hear, then check your copy.</p>
    {settings && options ? <>
      <SettingsBar settings={settings} options={options} disabled={playing || loading} onChange={changeSettings} />
      <div className="cw-actions">
        {!text && <button type="button" onClick={start} disabled={loading || !audioReady}>Start</button>}
        {playing && <button type="button" onClick={player.stop}>Stop</button>}
        {text && player.status === 'done' && !result && <button type="button" onClick={check} disabled={loading || player.playedChars < 1}>Check</button>}
        {(result || text && player.status === 'done' && player.playedChars < 1) && <button type="button" onClick={again}>Practice again</button>}
      </div>
      {player.status === 'playing' && duration > 0 && (
        <p>Elapsed: {formatTime(elapsed)} of {formatTime(Math.round(duration))} ({Math.floor(100 * elapsed / duration)}%)</p>
      )}
      {text && <label className="cw-copy-label">Type what you hear<textarea ref={typingBox} autoFocus value={typed} onChange={(event) => setTyped(event.target.value)} autoCapitalize="characters" autoCorrect="off" spellCheck={false} rows={5} /></label>}
      {result && <ResultView result={result} loggedIn={Boolean(token)} />}
    </> : !error && <p>Loading settings…</p>}
    {error && <p role="alert" className="cw-error">{error}</p>}
    <p className="cw-credits">Lessons follow the Koch course from <a href="https://lcwo.net/">LCWO</a> (lcwo.net). Audio by <a href="https://fkurz.net/ham/jscwlib.html">jscwlib</a>, by Fabian Kurz, DJ5CW (MIT).</p>
  </section></SiteContentContainer>;
}
