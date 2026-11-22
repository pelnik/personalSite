import React, { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SiteContentContainer } from '..';
import { useAuth } from '.';

export default function LoginPage() {
  const { account, login, register, logout } = useAuth();
  const [registerMode, setRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Log in - Matthew Pelnik'; }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      await (registerMode ? register : login)(username, password);
      const next = params.get('next');
      navigate(next?.startsWith('/') && !next.startsWith('//') ? next : '/', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Authentication failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <SiteContentContainer>
      <section className="login-page">
        <h1>{registerMode ? 'Create account' : 'Log in'}</h1>
        {account ? (
          <>
            <p>Logged in as {account.username}</p>
            <button type="button" onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <form onSubmit={submit}>
              <label htmlFor="auth-username">Username</label>
              <input id="auth-username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
              <label htmlFor="auth-password">Password</label>
              <input id="auth-password" name="password" type="password" autoComplete={registerMode ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} required />
              {error && <p role="alert">{error}</p>}
              <button type="submit" disabled={pending}>{registerMode ? 'Create account' : 'Log in'}</button>
            </form>
            <button type="button" className="login-mode-toggle" onClick={() => { setRegisterMode(!registerMode); setError(''); }}>
              {registerMode ? 'Already have an account? Log in' : 'Need an account? Create one'}
            </button>
          </>
        )}
      </section>
    </SiteContentContainer>
  );
}
