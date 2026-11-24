import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SiteContentContainer } from '..';
import { useAuth } from '../Auth';
import { ModeSwitch, SettingsBar, TestMode } from './trainer';
import * as cwApi from './cwApi';
import { FeedbackMode } from './feedback';
import { loadJscw } from './loadJscw';

const CwStats = lazy(() => import('./CwStats'));

export default function CwTrainer() {
  const { token, account, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'feedback' ? 'feedback' : 'test';
  const [busyMode, setBusyMode] = useState<typeof mode | null>(null);
  const busy = busyMode === mode;
  const onBusyChange = useCallback((isBusy: boolean) => {
    setBusyMode(isBusy ? mode : null);
  }, [mode]);
  useEffect(() => () => { setBusyMode(null); }, [mode]);
  const [settings, setSettings] = useState<cwApi.Settings | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [options, setOptions] = useState<cwApi.Options | null>(null);
  const [latestSessionId, setLatestSessionId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const saveQueue = useRef(Promise.resolve());
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
  function changeMode(nextMode: typeof mode) {
    const next = new URLSearchParams(searchParams);
    if (nextMode === 'feedback') next.set('mode', 'feedback');
    else next.delete('mode');
    setError('');
    setSearchParams(next, { replace: true });
  }

  return (
    <SiteContentContainer>
      <section className="cw-page">
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
        <ModeSwitch mode={mode} disabled={busy} onChange={changeMode} />
        <p>{mode === 'feedback'
          ? 'Each group plays, then waits while you type it. A wrong letter turns red, buzzes, and shows the right letter underneath. Letters you miss come up more often. Nothing is saved.'
          : 'Listen to Morse code groups, type what you hear, then check your copy.'}</p>

        {settings && options ? (
          <>
            <SettingsBar
              settings={settings}
              options={options}
              disabled={busy}
              hidden={mode === 'feedback' ? ['minutes'] : []}
              onChange={changeSettings}
            />
            {mode === 'feedback' ? (
              <FeedbackMode
                settings={settings}
                kochOrder={options.lessons.at(-1)?.chars ?? []}
                audioReady={audioReady}
                onBusyChange={onBusyChange}
                onError={setError}
              />
            ) : (
              <TestMode
                settings={settings}
                lessons={options.lessons}
                token={token}
                audioReady={audioReady}
                onChangeSettings={changeSettings}
                onBusyChange={onBusyChange}
                onSaved={setLatestSessionId}
                onError={setError}
              />
            )}
          </>
        ) : !error && <p>Loading settings…</p>}

        {token ? settings && (
          <Suspense fallback={<p>Loading stats…</p>}>
            <CwStats key={token} mode="account" token={token} lesson={settings.lesson} latestSessionId={latestSessionId} />
          </Suspense>
        ) : (
          <Suspense fallback={null}>
            <CwStats key="showcase" mode="showcase" />
          </Suspense>
        )}
        {error && <p role="alert" className="cw-error">{error}</p>}
        <p className="cw-credits">
          Lessons follow the Koch course from <a href="https://lcwo.net/">LCWO</a> (lcwo.net). Audio by{' '}
          <a href="https://fkurz.net/ham/jscwlib.html">jscwlib</a>, by Fabian Kurz, DJ5CW (MIT).
        </p>
      </section>
    </SiteContentContainer>
  );
}
