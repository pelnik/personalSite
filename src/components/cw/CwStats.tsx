import React, { useCallback, useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis, type TooltipContentProps,
} from 'recharts';
import { Link } from 'react-router-dom';
import {
  getLetterHistory, getShowcase, getShowcaseLetterHistory, getStats,
  type CwStatsData, type LetterPoint, type SessionSummary,
} from './cwApi';

const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const dateOnly = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const percent = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 });
const multiplier = new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function chartColor(showcase: boolean) {
  return showcase ? '#5f6f74' : '#176b81';
}
const dateTick = (time: number) => shortDate.format(time);
const percentTick = (value: number) => `${value}%`;

type ChartSession = SessionSummary & { time: number; firstInLesson: boolean };
type DaySummary = { time: number; sent: number; errors: number };

function summarizeDays(points: LetterPoint[]) {
  const days = new Map<number, DaySummary>();
  for (const point of points) {
    const time = new Date(point.createdAt).setHours(0, 0, 0, 0);
    const day = days.get(time) ?? { time, sent: 0, errors: 0 };
    day.sent += point.sent;
    day.errors += point.errors;
    days.set(time, day);
  }

  return [...days.values()].map((day) => ({ ...day, rate: 100 * day.errors / day.sent }));
}

function AccuracyTooltip({ active, payload, showcase }: Pick<TooltipContentProps<number, string>, 'active' | 'payload'> & { showcase: boolean }) {
  const session = payload?.[0]?.payload as ChartSession | undefined;
  if (!active || !session) return null;
  return (
    <div className="cw-chart-tooltip">
      <strong>{(showcase ? dateOnly : fullDate).format(new Date(session.createdAt))}</strong>
      <div>Lesson {session.lesson} · {session.accuracy}% accuracy</div>
      {session.firstInLesson && <div>First session of lesson {session.lesson}</div>}
      <div>{session.charWpm} WPM character speed · {session.effWpm} WPM effective</div>
    </div>
  );
}

function HistoryTooltip({ active, payload }: Pick<TooltipContentProps<number, string>, 'active' | 'payload'>) {
  const day = payload?.[0]?.payload as DaySummary | undefined;
  if (!active || !day) return null;
  return (
    <div className="cw-chart-tooltip">
      <strong>{shortDate.format(day.time)}</strong>
      <div>{percent.format(day.errors / day.sent)} errors</div>
      <div>{day.errors} missed out of {day.sent} sent</div>
    </div>
  );
}

function LetterHistory({ load, char, latestSessionId, color }: {
  load: (char: string) => Promise<{ char: string; points: LetterPoint[] }>;
  char: string;
  latestSessionId: number | null;
  color: string;
}) {
  const [history, setHistory] = useState<{ char: string; points: LetterPoint[] } | null>(null);
  const [error, setError] = useState<{ char: string; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchHistory() {
      try {
        const response = await load(char);
        if (active) {
          setHistory(response);
          setError(null);
        }
      } catch (cause) {
        if (active) setError({ char, message: cause instanceof Error ? cause.message : 'Could not load letter history' });
      }
    }
    void fetchHistory();
    return () => { active = false; };
  }, [load, char, latestSessionId]);

  if (error?.char === char) return <p role="alert">{error.message}</p>;
  if (history?.char !== char) return <p>Loading letter history…</p>;
  if (!history.points.length) return <p>No practice for {char} yet.</p>;

  return (
    <div className="cw-chart" role="group" aria-label={`Error rate by day for ${char}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={summarizeDays(history.points)}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="time" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={dateTick} />
          <YAxis domain={[0, 100]} tickFormatter={percentTick} />
          <Tooltip content={HistoryTooltip} />
          <Line dataKey="rate" stroke={color} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

type Props =
  | { mode: 'account'; token: string; lesson: number; latestSessionId: number | null }
  | { mode: 'showcase' };

export default function CwStats(props: Props) {
  const showcaseMode = props.mode === 'showcase';
  const token = props.mode === 'account' ? props.token : null;
  const lesson = props.mode === 'account' ? props.lesson : null;
  const latestSessionId = props.mode === 'account' ? props.latestSessionId : null;
  const color = chartColor(showcaseMode);
  const loadHistory = useCallback(
    (char: string) => token ? getLetterHistory(token, char) : getShowcaseLetterHistory(char),
    [token]
  );
  const [data, setData] = useState<{ lesson: number; stats: CwStatsData } | null>(null);
  const [error, setError] = useState<{ lesson: number; message: string } | null>(null);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (token && lesson !== null) {
          const stats = await getStats(token, lesson);
          if (active) {
            setData({ lesson, stats });
            setError(null);
          }
        } else {
          const { showcase } = await getShowcase();
          if (active && showcase) setData({ lesson: showcase.lesson, stats: showcase });
        }
      } catch (cause) {
        if (active && lesson !== null) setError({ lesson, message: cause instanceof Error ? cause.message : 'Could not load stats' });
      }
    }
    void load();
    return () => { active = false; };
  }, [token, lesson, latestSessionId]);

  const stats = data && (showcaseMode || data.lesson === lesson) ? data.stats : null;
  if (showcaseMode && !stats) return null;
  const lessonStartIds = new Set(stats?.lessonStarts.map(({ sessionId }) => sessionId));
  const chartSessions = stats?.sessions.map((session) => ({
    ...session,
    time: Date.parse(session.createdAt),
    firstInLesson: lessonStartIds.has(session.id),
  }));
  const letters = stats?.letters ?? [];
  const selected = letters.some(({ char }) => char === selectedChar) ? selectedChar : null;
  const chartLetters = letters.map(({ char, errorRate }) => ({ char, rate: errorRate === null ? null : errorRate * 100 }));

  return (
    <section className={showcaseMode ? 'cw-stats cw-stats-showcase' : 'cw-stats'} aria-labelledby="cw-stats-title">
      <h2 id="cw-stats-title">{showcaseMode ? "Matt's practice" : 'Your stats'}</h2>
      {showcaseMode && (
        <p>
          Matt is learning Morse code with this trainer. These are his real results.{' '}
          <Link to="/login?next=/cw">Log in</Link> to track your own.
        </p>
      )}
      {error?.lesson === lesson ? <p role="alert">{error.message}</p>
        : !chartSessions ? <p>Loading stats…</p>
          : chartSessions.length === 0 ? <p>No sessions yet. Finish a practice to see your stats.</p>
            : (
              <>
                <section aria-labelledby="cw-accuracy-title">
                  <h3 id="cw-accuracy-title">Accuracy over time</h3>
                  <p>{chartSessions.length} {chartSessions.length === 1 ? 'session' : 'sessions'}</p>
                  <div className="cw-chart" role="group" aria-label="Session accuracy">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartSessions} margin={{ top: 24, right: 42, bottom: 5, left: 5 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="time" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={dateTick} />
                        <YAxis domain={[0, 100]} tickFormatter={percentTick} />
                        <ReferenceLine y={90} stroke="#167147" strokeDasharray="5 4" label={{ value: '90%', position: 'right' }} />
                        {chartSessions.filter(({ firstInLesson }) => firstInLesson).map((session) => (
                          <ReferenceLine
                            key={session.id}
                            x={session.time}
                            stroke="#8d9b9f"
                            label={{ value: `L${session.lesson}`, position: 'top' }}
                          />
                        ))}
                        <Tooltip content={(tooltip) => <AccuracyTooltip {...tooltip} showcase={showcaseMode} />} />
                        <Line dataKey="accuracy" stroke={color} strokeWidth={2} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
                <section aria-labelledby="cw-letters-title">
                  <h3 id="cw-letters-title">
                    {showcaseMode ? `Letters in Matt's current lesson (Lesson ${data?.lesson})` : 'Letters in this lesson'}
                  </h3>
                  <div className="cw-chart" role="group" aria-label="Error rate by letter">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartLetters}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="char" />
                        <YAxis domain={[0, 100]} tickFormatter={percentTick} />
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Error rate']} />
                        <Bar dataKey="rate" fill={color} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="cw-stats-table-wrap">
                    <table className="cw-stats-table">
                      <thead><tr>
                        <th scope="col">Letter</th>
                        <th scope="col">
                          <span className="cw-table-heading-full">Recent attempts</span>
                          <span className="cw-table-heading-short">Seen</span>
                        </th>
                        <th scope="col">
                          <span className="cw-table-heading-full">Error rate</span>
                          <span className="cw-table-heading-short">Error %</span>
                        </th>
                        <th scope="col">
                          <span className="cw-table-heading-full">Shown vs baseline</span>
                          <span className="cw-table-heading-short">vs baseline</span>
                        </th>
                      </tr></thead>
                      <tbody>
                        {letters.map((letter) => (
                          <tr key={letter.char}>
                            <th scope="row">
                              <button type="button" aria-pressed={selected === letter.char}
                                onClick={() => setSelectedChar(letter.char)}>{letter.char}</button>
                            </th>
                            <td>{letter.attempts}</td>
                            <td>{letter.errorRate === null ? '—' : percent.format(letter.errorRate)}</td>
                            <td>{multiplier.format(letter.multiplier)}×</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
                <section aria-labelledby="cw-letter-history-title">
                  <h3 id="cw-letter-history-title">{selected ? `Letter history: ${selected}` : 'Letter history'}</h3>
                  {selected
                    ? <LetterHistory key={selected} load={loadHistory} char={selected} latestSessionId={latestSessionId} color={color} />
                    : <p>Select a letter in the table to see its history.</p>}
                </section>
              </>
            )}
    </section>
  );
}
