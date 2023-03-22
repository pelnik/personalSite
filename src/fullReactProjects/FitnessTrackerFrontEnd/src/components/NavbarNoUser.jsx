import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Tooltip from '@mui/material/Tooltip';

function NavbarNoUser() {
  const navigate = useNavigate();

  return (
    <div className="navbar-user" id="navbar-no-user-container">
      <button
        onClick={() => {
          navigate('/users/login');
        }}
      >
        <Tooltip title="Log In">
          <LoginIcon className="navbar-icons" />
        </Tooltip>
      </button>
      <button
        onClick={() => {
          navigate('/users/register');
        }}
      >
        <Tooltip title="Register">
          <PersonAddIcon className="navbar-icons" />
        </Tooltip>
      </button>
    </div>
  );
}

export default NavbarNoUser;
