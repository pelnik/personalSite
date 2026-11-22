import React from 'react';
import { ButtonSpecial } from '.';
import { Link } from 'react-router-dom';
import { useAuth } from './Auth';

function SiteHeader() {
  const { account, logout } = useAuth();
  return (
    <div id="navbar">
      <div className="subnavbar" id="left-navbar">
        <Link to="/" className="center-text" id="navbar-my-name">
          Matthew Pelnik
        </Link>
      </div>
      <div className="subnavbar" id="right-navbar">
        <ButtonSpecial to="/about" className="navbar-button">
          About
        </ButtonSpecial>
        {account ? (
          <>
            <span>{account.username}</span>
            <ButtonSpecial handleClick={logout} className="navbar-button">Log out</ButtonSpecial>
          </>
        ) : (
          <ButtonSpecial to="/login" className="navbar-button">Log in</ButtonSpecial>
        )}
      </div>
    </div>
  );
}

export default SiteHeader;
