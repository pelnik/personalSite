import React from 'react';
import { ButtonSpecial } from '.';
import { Link } from 'react-router-dom';

function SiteHeader() {
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
      </div>
    </div>
  );
}

export default SiteHeader;
