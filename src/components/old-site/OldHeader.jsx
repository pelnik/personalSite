import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header" id="indexHeader">
      <div className="leftHeader">
        <ArrowBackIcon
          onClick={() => {
            navigate(-1);
          }}
        />
        <Link to="/">
          <div className="material-symbols-outlined">Home</div>
        </Link>
        <p className="headerItems" id="myHeaderName">
          Matthew Pelnik
        </p>
      </div>
      <div className="rightHeader">
        <Link className="wideHeaderItems" to="/about">
          <p className="headerItems" id="myAboutPage">
            About
          </p>
        </Link>
        <Link className="wideHeaderItems" to="/portfolio">
          <p className="headerItems" id="myPortfolio">
            Portfolio
          </p>
        </Link>
        <Link className="articleIconContainer" to="/about">
          <img
            className="articleIcon"
            src="/Media/main/aboutPageIcon.svg"
            id="aboutIcon"
            alt="about"
          />
        </Link>
        <Link className="articleIconContainer" to="/portfolio">
          <img
            className="articleIcon"
            src="/Media/main/article_FILL1_wght600_GRAD0_opsz48.svg"
            alt="portfolio"
          />
        </Link>
      </div>
    </header>
  );
}

export default Header;
