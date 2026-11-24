export type Settings = { lesson: number; charWpm: number; effWpm: number; toneHz: number; minutes: number; groupLength: number };
export type Options = { lessons: { lesson: number; newChars: string[]; chars: string[] }[]; charWpm: number[]; effWpm: number[]; toneHz: number[]; minutes: number[]; groupLength: number[] };
export type Operation = { type: 'match' | 'wrong' | 'missing' | 'extra'; sent?: string; typed?: string };
export type LetterCounts = Record<string, [number, number]>;
export type Result = { ops: Operation[]; errors: number; sentCount: number; accuracy: number; passed: boolean; letterCounts: LetterCounts };
async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/cw${path}`, { ...init, headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'CW request failed');
  return data as T;
}
export const getSettings = (token: string) => request<{ settings: Settings; options: Options }>('/settings', token);
export const putSettings = (token: string, settings: Partial<Settings>) => request<{ settings: Settings }>('/settings', token, { method: 'PUT', body: JSON.stringify(settings) });
export const getPractice = (token: string, settings: Settings) => {
  const query = new URLSearchParams(Object.entries(settings).filter(([key]) => key !== 'toneHz').map(([key, value]) => [key, String(value)]));
  return request<{ text: string; chars: string[]; weights: Record<string, number>; baseline: Record<string, number> }>(`/practice?${query}`, token);
};
export const postResults = (token: string, values: Omit<Settings, 'minutes'> & { sent: string; typed: string; complete: boolean }) => request<{ result: Result; saved: boolean; session?: { id: number; createdAt: string } }>('/results', token, { method: 'POST', body: JSON.stringify(values) });

export type SessionSummary = {
  id: number;
  createdAt: string;
  lesson: number;
  accuracy: number;
  charWpm: number;
  effWpm: number;
};

export type LetterSummary = {
  char: string;
  attempts: number;
  errors: number;
  errorRate: number | null;
  multiplier: number;
  share: number;
  baselineShare: number;
};

export const getFeedbackGroup = (values: { lesson: number; groupLength: number; recent: LetterCounts[] }, signal?: AbortSignal) =>
  request<{ group: string; weights: Record<string, number>; baseline: Record<string, number>; letters: LetterSummary[] }>(
    '/feedback/group', '', { method: 'POST', body: JSON.stringify(values), signal },
  );

export type CwStatsData = {
  sessions: SessionSummary[];
  letters: LetterSummary[];
  lessonStarts: { lesson: number; sessionId: number }[];
};
export type LetterPoint = { createdAt: string; sent: number; errors: number };

export const getStats = (token: string, lesson: number) =>
  request<CwStatsData>(`/stats?lesson=${lesson}`, token);

export const getLetterHistory = (token: string, char: string) =>
  request<{ char: string; points: LetterPoint[] }>(`/stats/letter?${new URLSearchParams({ char })}`, token);

export const getShowcase = () =>
  request<{ showcase: (CwStatsData & { lesson: number }) | null }>('/showcase', '');

export const getShowcaseLetterHistory = (char: string) =>
  request<{ char: string; points: LetterPoint[] }>(`/showcase/letter?${new URLSearchParams({ char })}`, '');
