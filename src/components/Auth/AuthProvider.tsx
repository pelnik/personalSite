import React, { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import * as authApi from './authApi';
import type { Account } from './authApi';

export type AuthContextValue = {
  token: string;
  account: Account | null;
  login(username: string, password: string): Promise<void>;
  register(username: string, password: string): Promise<void>;
  logout(): void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function storedToken() {
  try {
    return localStorage.getItem('authToken') || '';
  } catch {
    return '';
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(storedToken);
  const [account, setAccount] = useState<Account | null>(null);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('authToken');
    } catch {
      // The in-memory state still logs out when storage is unavailable.
    }
    setToken('');
    setAccount(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    authApi.getMe(token).then(
      (current) => { if (active) setAccount(current); },
      () => { if (active) logout(); }
    );
    return () => { active = false; };
  }, [token, logout]);

  async function authenticate(action: typeof authApi.login, username: string, password: string) {
    const result = await action(username, password);
    try {
      localStorage.setItem('authToken', result.token);
    } catch {
      // The current tab can still use the token.
    }
    setToken(result.token);
    setAccount(result.account);
  }

  return (
    <AuthContext.Provider value={{
      token,
      account,
      login: (username, password) => authenticate(authApi.login, username, password),
      register: (username, password) => authenticate(authApi.register, username, password),
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
