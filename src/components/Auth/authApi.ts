export type Account = { id: number; username: string; isAdmin: boolean };
type AuthResponse = { token?: string; account?: Account; message?: string };

async function submit(path: string, username: string, password: string) {
  // Login and registration must not send a stored token: it may be expired.
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data: AuthResponse = await response.json();
  if (!response.ok || !data.token || !data.account) {
    throw new Error(data.message || 'Authentication failed');
  }
  return { token: data.token, account: data.account };
}

export const login = (username: string, password: string) => submit('login', username, password);
export const register = (username: string, password: string) => submit('register', username, password);

export async function getMe(token: string): Promise<Account> {
  const response = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Session expired');
  const data: { account: Account } = await response.json();
  return data.account;
}
