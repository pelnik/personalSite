import { useCallback, useEffect, useRef, useState } from 'react';
import { loadJscw } from './loadJscw';
import type { Jscw } from './jscwlib';
import type { Settings } from './cwApi';
export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'done';
export function usePlayer() {
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState({ elapsed: 0, duration: 0 });
  const player = useRef<Jscw | null>(null);
  const generation = useRef(0);
  const prepare = useCallback(() => {
    const Constructor = window.jscw;
    if (!Constructor) throw new Error('Audio player is not ready');
    if ('audioSession' in navigator && navigator.audioSession) {
      navigator.audioSession.type = 'playback';
    }
    player.current ??= new Constructor();
    // Resume during the click gesture for browsers with strict audio rules.
    void player.current.audioCtx?.resume();
  }, []);
  const start = useCallback(async (text: string, settings: Settings) => {
    const current = ++generation.current;
    setStatus('loading');
    setCompleted(false);
    setProgress({ elapsed: 0, duration: 0 });
    const Constructor = await loadJscw();
    if (current !== generation.current) return;
    player.current ??= new Constructor();
    player.current.setWpm(settings.charWpm);
    player.current.setEff(settings.effWpm === settings.charWpm ? 0 : settings.effWpm);
    player.current.setFreq(settings.toneHz);
    player.current.onFinished = () => {
      if (current !== generation.current) return;
      setCompleted(true);
      setStatus('done');
    };
    player.current.play(text);
    const duration = player.current.getLength();
    if (Number.isFinite(duration) && duration > 0) {
      setProgress({ elapsed: 0, duration });
    }
    setStatus('playing');
  }, []);
  const stop = useCallback(() => {
    generation.current++;
    player.current?.stop();
    setStatus('idle');
    setCompleted(false);
    setProgress({ elapsed: 0, duration: 0 });
  }, []);
  useEffect(() => {
    if (status !== 'playing') return;
    const playback = player.current;
    if (!playback) return;

    const timer = window.setInterval(() => {
      const duration = playback.getLength();
      const elapsed = playback.getTime();
      if (Number.isFinite(duration) && duration > 0 && Number.isFinite(elapsed)) {
        setProgress({ elapsed: Math.min(elapsed, duration), duration });
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [status]);
  useEffect(() => () => {
    generation.current++;
    player.current?.stop();
    void player.current?.audioCtx?.close();
  }, []);
  return { status, completed, progress, prepare, start, stop };
}
