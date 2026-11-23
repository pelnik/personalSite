export type Settings = { lesson: number; charWpm: number; effWpm: number; toneHz: number; minutes: number; groupLength: number };
export type Options = { lessons: { lesson: number; newChars: string[]; chars: string[] }[]; charWpm: number[]; effWpm: number[]; toneHz: number[]; minutes: number[]; groupLength: number[] };
export type Operation = { type: 'match' | 'wrong' | 'missing' | 'extra'; sent?: string; typed?: string };
export type Result = { ops: Operation[]; errors: number; sentCount: number; accuracy: number; passed: boolean; letterCounts: Record<string, [number, number]> };
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
export const postResults = (token: string, values: Omit<Settings, 'minutes'> & { sent: string; typed: string }) => request<{ result: Result; saved: boolean; session?: { id: number; createdAt: string } }>('/results', token, { method: 'POST', body: JSON.stringify(values) });
