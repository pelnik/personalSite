import { useCallback, useEffect, useRef, useState } from 'react';
import { loadJscw } from './loadJscw';
import type { Jscw } from './jscwlib';
import type { Settings } from './cwApi';
export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'done';
export function usePlayer() {
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [playedChars, setPlayedChars] = useState(0);
  const player = useRef<Jscw | null>(null);
  const generation = useRef(0);
  const start = useCallback(async (text: string, settings: Settings) => {
    const current = ++generation.current;
    setStatus('loading');
    setPlayedChars(0);
    const Constructor = await loadJscw();
    if (current !== generation.current) return;
    player.current ??= new Constructor();
    player.current.setWpm(settings.charWpm);
    player.current.setEff(settings.effWpm === settings.charWpm ? 0 : settings.effWpm);
    player.current.setFreq(settings.toneHz);
    player.current.onCharacterPlay = ({ n }) => { if (current === generation.current) setPlayedChars(n + 1); };
    player.current.onFinished = () => { if (current === generation.current) setStatus('done'); };
    player.current.play(text);
    setStatus('playing');
  }, []);
  const stop = useCallback(() => {
    generation.current++;
    player.current?.stop();
    setStatus('done');
  }, []);
  useEffect(() => () => { generation.current++; player.current?.stop(); }, []);
  return { status, playedChars, start, stop };
}
