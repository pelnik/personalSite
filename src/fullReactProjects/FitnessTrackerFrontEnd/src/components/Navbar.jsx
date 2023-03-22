import React from 'react';
import { NavbarUser, NavbarNoUser } from './';
import { Link } from 'react-router-dom';
import { default as Logo } from '../Media/Logo';

const Navbar = ({ setToken, token }) => {
  return (
    <div id="navbar">
      <div id="navbar-logo">
        <Logo />
      </div>
      <div id="navbarTabs">
        <div id="navbarTabs-container">
          <Link to="/">
            <h2>Home</h2>
          </Link>
          <Link to="/routines">
            <h2>Routines</h2>
          </Link>
          {token ? (
            <Link to="my-routines">
              <h2>My Routines</h2>
            </Link>
          ) : null}
          <Link to="/activities">
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
