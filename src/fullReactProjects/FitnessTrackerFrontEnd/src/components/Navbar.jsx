import React from 'react';
import { NavbarUser, NavbarNoUser } from './';
import { Link, useNavigate } from 'react-router-dom';
import { default as Logo } from '../Media/Logo';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Navbar = ({ setToken, token }) => {
  const navigate = useNavigate();

  return (
    <div id="navbar">
      <div id="left-navbar">
        <ArrowBackIcon
          onClick={() => {
            navigate(-1);
          }}
          className="navbar-icons"
        />
        <Link to="/fitness/" id="navbar-logo">
          <Logo />
        </Link>
      </div>
      <div id="navbarTabs">
        <div id="navbarTabs-container">
          <Link to="/fitness/">
            <h2>Routines</h2>
          </Link>
          {token ? (
            <Link to="my-routines">
              <h2>My Routines</h2>
            </Link>
          ) : null}
          <Link to="activities">
            <h2>Activities</h2>
          </Link>
        </div>
      </div>
      <div id="navbarUser">
        {token ? <NavbarUser setToken={setToken} /> : <NavbarNoUser />}
      </div>
    </div>
  );
};

export default Navbar;
