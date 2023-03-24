import React from 'react';

function HomeHeader() {
  return (
    <div id="navbar">
      <div className="subnavbar" id="left-navbar">
        <p className="center-text" id="navbar-my-name">
          Matthew Pelnik
        </p>
      </div>
      <div className="subnavbar" id="right-navbar">
        <div className="button-special">
          <button className="navbar-button">About</button>
        </div>
      </div>
    </div>
  );
}

export default HomeHeader;
