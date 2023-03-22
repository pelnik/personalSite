import React, { useState, useEffect } from 'react';
import { registerAccount } from '../apiAdapters';
import { saveToLocalStorage } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';

const Register = ({ setToken, token }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function makeProfile(username, password) {
    try {
      const result = await registerAccount(username, password);

      if (result.token !== undefined) {
        setToken(result.token);
        saveToLocalStorage(result.token);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError('User already exists');
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    console.log('token register', token);
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <div className="center-form">
      <div className="form-parent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            makeProfile(username, password);
          }}
        >
          <h1>Register</h1>
          <h3>Username</h3>
          <input
            name="username"
            type="text"
            value={username}
            minLength="6"
            autoComplete="username"
            required
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
          <h3>Password</h3>
          <input
            name="password"
            type="password"
            value={password}
            autoComplete="password"
            minLength="8"
            required
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <h3>Confirm Password</h3>
          <input
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            autoComplete="confirmPassword"
            minLength="8"
            required
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          />
          {confirmPassword === password && password !== '' ? (
            <button type="submit">Submit</button>
          ) : password === '' ? (
            <p className="warning register-warning">Please enter a password</p>
          ) : (
            <p className="warning register-warning">
              Confirmation not matching
            </p>
          )}
          <p className="error-message">{error}</p>
        </form>
      </div>
    </div>
  );
};

export default Register;
