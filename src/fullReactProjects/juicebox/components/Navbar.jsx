import React from 'react';
import { useNavigate } from 'react-router-dom';
import { saveToLocalStorage } from '../utils/localStorage';

import Tooltip from '@mui/joy/Tooltip';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar(props) {
  const setToken = props.setToken;
  const token = props.token;

  const navigate = useNavigate();

  function onClickLogOut() {
    saveToLocalStorage('');
    setToken('');
  }

  function onClickLogIn() {
    navigate('/juicebox/login');
  }

  function onClickRegister() {
    navigate('/juicebox/register');
  }

  function onClickHome() {
    navigate('/juicebox/');
  }

  return (
    <div className="navbar" id="navbar">
      <div className="subheader" id="leftHeader">
        <ul className="navBarLinks">
          <li onClick={onClickHome}>
            <Tooltip title="Home">
              <HomeIcon />
            </Tooltip>
          </li>
        </ul>
      </div>
      <div className="subheader" id="rightHeader">
        <ul className="navBarLinks">
          {!token ? (
            <li onClick={onClickLogIn}>
              <Tooltip title="Log In">
                <LoginIcon />
              </Tooltip>
            </li>
          ) : null}
          {!token ? (
            <li onClick={onClickRegister}>
              <Tooltip title="Register">
                <PersonAddIcon />
              </Tooltip>
            </li>
          ) : null}
          {token ? (
            <li onClick={onClickLogOut}>
              <Tooltip title="Log Out">
                <LogoutIcon />
              </Tooltip>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
