import React from 'react';
import { ButtonSpecial } from '.';

function HomeHeader() {
  return (
    <div id="navbar">
      <div className="subnavbar" id="left-navbar">
        <p className="center-text" id="navbar-my-name">
          Matthew Pelnik
        </p>
      </div>
      <div className="subnavbar" id="right-navbar">
        <ButtonSpecial className="navbar-button">About</ButtonSpecial>
      </div>
    </div>
  );
}

export default HomeHeader;
