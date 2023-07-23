import React from 'react';
import { ButtonSpecial } from '.';
import { Link } from 'react-router-dom';

function HomeHeader({ portfolioRef }) {
  function handlePortfolioClick(evt) {
    portfolioRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'center',
    });
  }

  return (
    <div id="navbar">
      <div className="subnavbar" id="left-navbar">
        <Link to="/" className="center-text" id="navbar-my-name">
          Matthew Pelnik
        </Link>
      </div>
      <div className="subnavbar" id="right-navbar">
        <ButtonSpecial
          handleClick={handlePortfolioClick}
          className="navbar-button"
        >
          Portfolio
        </ButtonSpecial>
      </div>
    </div>
  );
}

export default HomeHeader;
