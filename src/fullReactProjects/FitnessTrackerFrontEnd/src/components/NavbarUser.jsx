import React from 'react';
import { saveToLocalStorage } from '../utils/localStorage';
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';

function NavbarUser({ setToken }) {
  return (
    <div className="navbar-user" id="navbar-user-container">
      <button
        onClick={() => {
          setToken('');
          saveToLocalStorage('');
        }}
      >
        <Tooltip title="Log Out">
          <LogoutIcon className="navbar-icons" />
        </Tooltip>
      </button>
    </div>
  );
}

export default NavbarUser;
