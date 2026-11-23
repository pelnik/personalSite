import React, { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis, type TooltipContentProps,
} from 'recharts';
import { getLetterHistory, getStats, type CwStatsData, type LetterPoint, type SessionSummary } from './cwApi';

const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const percent = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 });
const multiplier = new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const chartColor = '#176b81';
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

function AccuracyTooltip({ active, payload }: Pick<TooltipContentProps<number, string>, 'active' | 'payload'>) {
  const session = payload?.[0]?.payload as ChartSession | undefined;
  if (!active || !session) return null;
  return (
    <div className="cw-chart-tooltip">
      <strong>{fullDate.format(new Date(session.createdAt))}</strong>
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

function LetterHistory({ token, char, latestSessionId }: {
  token: string;
  char: string;
  latestSessionId: number | null;
}) {
  const [history, setHistory] = useState<{ char: string; points: LetterPoint[] } | null>(null);
  const [error, setError] = useState<{ char: string; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await getLetterHistory(token, char);
        if (active) {
          setHistory(response);
          setError(null);
        }
      } catch (cause) {
        if (active) setError({ char, message: cause instanceof Error ? cause.message : 'Could not load letter history' });
      }
    }
    void load();
    return () => { active = false; };
  }, [token, char, latestSessionId]);

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
          <Line dataKey="rate" stroke={chartColor} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CwStats({ token, lesson, latestSessionId }: {
  token: string;
  lesson: number;
  latestSessionId: number | null;
}) {
  const [data, setData] = useState<{ lesson: number; stats: CwStatsData } | null>(null);
  const [error, setError] = useState<{ lesson: number; message: string } | null>(null);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const stats = await getStats(token, lesson);
        if (active) {
          setData({ lesson, stats });
          setError(null);
        }
      } catch (cause) {
        if (active) setError({ lesson, message: cause instanceof Error ? cause.message : 'Could not load stats' });
      }
    }
    void load();
    return () => { active = false; };
  }, [token, lesson, latestSessionId]);

  const stats = data?.lesson === lesson ? data.stats : null;
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
    <section className="cw-stats" aria-labelledby="cw-stats-title">
      <h2 id="cw-stats-title">Your stats</h2>
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
                      <LineChart data={chartSessions} margin={{ top: 24, right: 24, bottom: 5, left: 5 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="time" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={dateTick} />
                        <YAxis domain={[0, 100]} tickFormatter={percentTick} />
                        <ReferenceLine y={90} stroke="#167147" strokeDasharray="5 4" label={{ value: '90%', position: 'insideTopRight' }} />
                        {chartSessions.filter(({ firstInLesson }) => firstInLesson).map((session) => (
                          <ReferenceLine
                            key={session.id}
                            x={session.time}
                            stroke="#8d9b9f"
                            label={{ value: `L${session.lesson}`, position: 'top' }}
                          />
                        ))}
                        <Tooltip content={AccuracyTooltip} />
                        <Line dataKey="accuracy" stroke={chartColor} strokeWidth={2} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
                <section aria-labelledby="cw-letters-title">
                  <h3 id="cw-letters-title">Letters in this lesson</h3>
                  <div className="cw-chart" role="group" aria-label="Error rate by letter">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartLetters}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="char" />
                        <YAxis domain={[0, 100]} tickFormatter={percentTick} />
                        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Error rate']} />
                        <Bar dataKey="rate" fill={chartColor} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="cw-stats-table-wrap">
                    <table className="cw-stats-table">
                      <thead><tr>
                        <th scope="col">Letter</th>
                        <th scope="col">Recent attempts</th>
                        <th scope="col">Error rate</th>
                        <th scope="col">Shown vs baseline</th>
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
                    ? <LetterHistory key={selected} token={token} char={selected} latestSessionId={latestSessionId} />
                    : <p>Select a letter in the table to see its history.</p>}
                </section>
              </>
            )}
    </section>
  );
}
