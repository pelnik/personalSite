import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/Auth';

import Tooltip from '@mui/joy/Tooltip';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar(props) {
  const token = props.token;
  const { logout } = useAuth();

  const navigate = useNavigate();

  function onClickLogOut() {
    logout();
  }

  function onClickLogIn() {
    navigate('/login?next=/juicebox');
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
                <LoginIcon aria-label="Log In" />
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
