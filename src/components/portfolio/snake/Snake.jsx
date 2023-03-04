import React, { useEffect } from 'react';
import './index.css';
import { Link } from 'react-router-dom';

function Snake() {
  useEffect(() => {
    const scriptTag = document.createElement('script');

    scriptTag.src = '/legacyJS/snakeGame.js';
    scriptTag.defer = true;
    scriptTag.type = 'module';

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  });

  return (
    <div id="body">
      <div id="full-window">
        <div id="game">
          <header id="header-parent">
            <div id="header-buttons">
              <button id="home-button" type="button">
                <Link to="/portfolio">
                  <img src="./Media/snake/home_icon.svg" alt="home icon" />
                </Link>
              </button>
              <h1>Classic Snake</h1>
            </div>
          </header>
          <div id="full-game-container">
            <div id="game-button-parent">
              <div id="game-header-buttons">
                <button className="start-button-not-started" id="start-button" type="button">
                  Start
                </button>
                <select id="select-difficulty" defaultValue="Medium">
                  <option value="Easy">Difficulty: Easy</option>
                  <option value="Medium">Difficulty: Medium</option>
                  <option value="Hard">Difficulty: Hard</option>
                </select>
              </div>
              <p id="points">Points: 0</p>
              <div id="stats-parent">
                <p id="stat-label">Statistics</p>
                <div id="stat-content">
                  <div id="highest-points">Highest Points: 0</div>
                  <div id="average-points">Average Points: 0.00</div>
                  <div id="lowest-points">Lowest Points: 0</div>
                </div>
              </div>
            </div>
            <div id="game-wall">
              <div id="game-content">
                {/* JS inserts "pixels" here */}
              </div>
            </div>
          </div>
        </div>
        <div id="footer-parent">
          <div id="footerIconParent">
            <a href="https://www.linkedin.com/in/mpelnik/">
              <img className="footerIcon" src="/Media/snake/linkedin_icon.svg" alt="linkedIn icon" />
            </a>
            <a href="https://github.com/pelnik">
              <img className="footerIcon" src="/Media/snake/github_icon.svg" alt="gitHub icon" />
            </a>
            <a href="tel:9187982238">
              <img className="footerIcon" src="/Media/snake/phone_icon.svg" alt="phone icon" />
            </a>
            <a href="mailto:matt@pelnik.dev">
              <img className="footerIcon" src="/Media/snake/email_icon.svg" alt="email icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Snake;
