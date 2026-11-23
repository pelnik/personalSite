import React, { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { flushSync } from 'react-dom';
import { getFeedbackGroup, type LetterCounts, type LetterSummary, type Settings } from '../cwApi';
import { usePlayer } from '../usePlayer';
import { buzz } from './buzzer';
import FeedbackSummary from './FeedbackSummary';

type Props = {
  settings: Settings;
  kochOrder: string[];
  audioReady: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string) => void;
};

type Group = { number: number; text: string; answers: (string | null)[] };
type Miss = { text: string; number: number };

function countAnswer(counts: LetterCounts, sent: string, answer: string) {
  const [seen, missed] = counts[sent] ?? [0, 0];
  counts[sent] = [seen + 1, missed + Number(sent !== answer)];
}

function answerLabel(sent: string, answer: string | null) {
  if (answer === null) return 'Waiting';
  if (answer === sent) return sent;
  return answer === ' ' ? `${sent} missed` : `${sent} typed as ${answer}`;
}

export default function FeedbackMode({ settings, kochOrder, audioReady, onBusyChange, onError }: Props) {
  const { prepare, start: play, stop: stopAudio, status: playerStatus, playedChars, audioContext } = usePlayer();
  const [status, setStatus] = useState<'idle' | 'running' | 'stopped'>('idle');
  const [groups, setGroups] = useState<Group[]>([]);
  const [totals, setTotals] = useState<LetterCounts>({});
  const [letters, setLetters] = useState<LetterSummary[]>([]);
  const [latestMiss, setLatestMiss] = useState<Miss | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const runSettings = useRef(settings);
  const recent = useRef<LetterCounts[]>([]);
  const requestedAfterGroup = useRef<Group | null>(null);
  const pauseTimer = useRef<number | undefined>(undefined);
  const running = status === 'running';
  const currentGroup = groups.at(-1);

  const cancelPending = useCallback(() => {
    generation.current++;
    controller.current?.abort();
    window.clearTimeout(pauseTimer.current);
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  const stop = useCallback(() => {
    cancelPending();
    stopAudio();
    setStatus('stopped');
    onBusyChange(false);
  }, [cancelPending, stopAudio, onBusyChange]);

  const loadGroup = useCallback(async (delay: number) => {
    const run = generation.current;
    const settings = runSettings.current;
    const nextAt = performance.now() + delay;

    async function playGroup(group: string, letters: LetterSummary[]) {
      if (generation.current !== run) return;
      try {
        setLetters(letters);
        setGroups((previous) => [
          ...previous.slice(-11),
          { number: (previous.at(-1)?.number ?? 0) + 1, text: group, answers: Array<string | null>(group.length).fill(null) },
        ]);
        await play(group, settings);
      } catch (cause) {
        handleFailure(cause);
      }
    }

    function handleFailure(cause: unknown) {
      if (generation.current !== run) return;
      stop();
      onError(cause instanceof Error ? cause.message : 'Could not play feedback group');
    }

    try {
      const { group, letters } = await getFeedbackGroup({
        lesson: settings.lesson, groupLength: settings.groupLength, recent: recent.current,
      }, controller.current?.signal);
      if (generation.current !== run) return;
      const remaining = nextAt - performance.now();
      if (remaining > 0) {
        pauseTimer.current = window.setTimeout(() => { void playGroup(group, letters); }, remaining);
      } else {
        await playGroup(group, letters);
      }
    } catch (cause) {
      handleFailure(cause);
    }
  }, [play, stop, onError]);

  function start() {
    if (!audioReady) return;
    try { prepare(); }
    catch (cause) { onError(cause instanceof Error ? cause.message : 'Could not start audio'); return; }

    generation.current++;
    controller.current = new AbortController();
    runSettings.current = settings;
    recent.current = [];
    requestedAfterGroup.current = null;
    onError('');
    // Mount and focus the input within the click so mobile browsers open the keyboard.
    flushSync(() => {
      setGroups([]);
      setTotals({});
      setLetters([]);
      setLatestMiss(null);
      setStatus('running');
      onBusyChange(true);
    });
    input.current?.focus();
    void loadGroup(0);
  }

  function answer(event: ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    event.currentTarget.value = '';
    if (!running || !currentGroup) return;

    const answers = [...currentGroup.answers];
    const updatedTotals = { ...totals };
    let answerIndex = answers.indexOf(null);
    const previousIndex = answerIndex;
    for (const key of value) {
      if (answerIndex < 0 || answerIndex >= playedChars) break;
      const typed = key.toUpperCase();
      if (typed !== ' ' && !kochOrder.includes(typed)) continue;

      const sent = currentGroup.text[answerIndex];
      answers[answerIndex] = typed;
      countAnswer(updatedTotals, sent, typed);
      if (typed !== sent) {
        if (typed !== ' ') buzz(audioContext());
        setLatestMiss((previous) => ({ text: answerLabel(sent, typed), number: (previous?.number ?? 0) + 1 }));
      }
      answerIndex = answers.indexOf(null, answerIndex + 1);
    }
    if (answerIndex === previousIndex) return;
    setGroups([...groups.slice(0, -1), { ...currentGroup, answers }]);
    setTotals(updatedTotals);
  }

  useEffect(() => {
    if (!running || playerStatus !== 'done' || !currentGroup || requestedAfterGroup.current === currentGroup) return;
    const { text, answers } = currentGroup;
    if (answers.some((answer) => answer === null)) return;

    requestedAfterGroup.current = currentGroup;
    const counts: LetterCounts = {};
    let missed = false;
    answers.forEach((answer, index) => {
      if (answer === null) return;
      countAnswer(counts, text[index], answer);
      missed ||= text[index] !== answer;
    });
    recent.current = [counts, ...recent.current.slice(0, 99)];
    void loadGroup(missed ? 1500 : 700);
  }, [currentGroup, loadGroup, playerStatus, running]);

  let answered = 0;
  let right = 0;
  for (const [seen, missed] of Object.values(totals)) {
    answered += seen;
    right += seen - missed;
  }
  const percentage = answered ? ` (${Math.round(right / answered * 100)}%)` : '';

  return (
    <>
      <div className="cw-actions">
        {running
          ? <button type="button" onClick={stop}>Stop</button>
          : <button type="button" disabled={!audioReady} onClick={start}>Start</button>}
      </div>
      {running && (
        <>
          <p>Right: {right} of {answered}{percentage}</p>
          <label className="cw-fb-board">
            <input
              ref={input}
              className="cw-visually-hidden"
              aria-label="Type what you hear"
              aria-describedby="cw-fb-hint"
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              onChange={answer}
            />
            {groups.map(({ number, text, answers }) => {
              const visible = number === currentGroup?.number ? answers.slice(0, playedChars) : answers;
              if (!visible.length) return null;
              return (
                <span className="cw-fb-group" key={number}>
                  {visible.map((typed, slot) => {
                    const sent = text[slot];
                    const state = typed === null ? 'waiting' : typed === sent ? 'right' : 'wrong';
                    return (
                      <span className={`cw-fb-slot cw-fb-${state}`} key={slot} role="img" aria-label={answerLabel(sent, typed)}>
                        <span className="cw-fb-typed">{typed === ' ' ? '_' : typed ?? '·'}</span>
                        <span className="cw-fb-correct">{state === 'wrong' ? sent : ''}</span>
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </label>
          <span className="cw-visually-hidden" aria-live="polite">
            {latestMiss && <span key={latestMiss.number}>{latestMiss.text}</span>}
          </span>
          <p id="cw-fb-hint" className="cw-check-hint">Space if you don't know a letter</p>
        </>
      )}
      {status === 'stopped' && (
        <FeedbackSummary score={`${right} of ${answered} right${percentage}`} answered={answered} totals={totals} letters={letters} />
      )}
    </>
  );
}
