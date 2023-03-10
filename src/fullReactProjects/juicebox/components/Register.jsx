import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api-adapter';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

function Register(props) {
  const setToken = props.setToken;
  const token = props.token;
  const navigate = useNavigate();

  const defaultUser = {
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    location: '',
  };

  const [user, setUser] = useState(defaultUser);
  const [userExistsError, setUserExistError] = useState(false);

  function setButtonColor() {
    if (userExistsError) {
      return {
        color: '#FF0000',
        text: 'User already registered',
      };
    }

    for (const key in user) {
      if (user[key] === '') {
        return {
          color: '#FF0000',
          text: 'Please enter all fields',
        };
      }
    }

    if (user.password !== user.confirmPassword) {
      return {
        color: '#FF0000',
        text: "Password Confirmation doesn't match",
      };
    }

    return {
      color: '#9BC2BF',
      text: 'Register',
    };
  }

  const { color: buttonColor, text: buttonText } = setButtonColor();

  function onChange(evt, key) {
    const userCopy = {
      ...user,
      [key]: evt.target.value,
    };

    setUser(userCopy);
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    let newToken = null;
    const registerResponse = await register(user);

    if ('token' in registerResponse) {
      newToken = registerResponse.token;
      setUser(defaultUser);
    }

    if (registerResponse.name === 'UserExistsError') {
      setUserExistError(true);
    }

    if (newToken !== null) {
      setToken(newToken);
    }
  };

  useEffect(() => {
    if (token !== '') {
      navigate('/juicebox/');
    }
  }, [token]);

  useEffect(() => {
    setUserExistError(false);
  }, [user]);

  return (
    <div className="formContainer" id="login">
      <form className="form" onSubmit={handleSubmit}>
        <h1>Register New User</h1>
        <label>
          <TextField
            type="text"
            value={user.username}
            name="username"
            autoComplete="username"
            onChange={(evt) => {
              onChange(evt, 'username');
            }}
            variant="outlined"
            label="Username"
          />
        </label>
        <label>
          <TextField
            type="password"
            autoComplete="new-password"
            value={user.password}
            name="password"
            variant="outlined"
            label="Password"
            onChange={(evt) => {
              onChange(evt, 'password');
            }}
          />
        </label>
        <label>
          <TextField
            type="password"
            autoComplete="confirm-password"
            value={user.confirmPassword}
            name="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            onChange={(evt) => {
              onChange(evt, 'confirmPassword');
            }}
          />
        </label>
        <label>
          <TextField
            type="text"
            value={user.name}
            name="name"
            variant="outlined"
            label="Name"
            onChange={(evt) => {
              onChange(evt, 'name');
            }}
          />
        </label>
        <label>
          <TextField
            type="text"
            value={user.location}
            name="location"
            variant="outlined"
            label="Location"
            onChange={(evt) => {
              onChange(evt, 'location');
            }}
          />
        </label>
        <Button
          variant="outlined"
          className="register-button"
          type="submit"
          sx={{ color: buttonColor, borderColor: buttonColor }}
        >
          {buttonText}
        </Button>
      </form>
    </div>
  );
}

export default Register;
