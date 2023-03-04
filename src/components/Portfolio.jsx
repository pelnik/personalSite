import React from 'react';
import '../css/site.css';
import { Link } from 'react-router-dom';

function Portfolio() {
  return (
    <main className="main" id="portfolioMain">
      <div id="portfolioMainContainer">
        <h1>Portfolio</h1>
        <p>
          Please see my portfolio below. This is a collection of various
          projects that I have developed over time that each showcase a
          different primary skill.
        </p>
        <div className="projectContainer">
          <div className="project">
            <a
              href="https://strangers-things-classified-ads.netlify.app"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/Media/main/Strangers_Things_screenshot.png"
                alt="Strangers Things screenshot"
              />
              <p>
                A pair project in the spirit of Craigslist coded in React using
                APIs allowing for user authentication, registration, making
                posts, messaging, and more. The site has a responsive desktop
                and mobile view, and the ads are posted by my cohort and anyone
                else with access to appropriate sites or APIs. The site also
                employs routing so users can access sections of the site
                directly. Feel free to register a user and experiment with the
                persistent posting and messaging capabilities!
              </p>
            </a>
            <p>
              <a
                className="projectGithubLink"
                href="https://github.com/pelnik/StrangersThings"
              >
                Github repo
              </a>
            </p>
          </div>
          <div className="project">
            <Link to="/snake">
              <img
                src="/Media/main/snake-screenshot.png"
                alt="snake game screenshot"
              />
              <p>
                The classic game coded in vanilla Javascript. The game has
                several difficulties, score tracking, and scales to multiple
                desktop screen sizes. To run it features extensive Javascript
                DOM interaction as well as event listeners for user input to
                update HTML elements and give a seamless game experience. The
                game is built for using arrow keys on desktop. Play a few
                rounds!
              </p>
            </Link>
            <p>
              <a
                className="projectGithubLink"
                href="https://github.com/pelnik/arcade"
              >
                Github repo
              </a>
            </p>
          </div>
          <div className="project">
            <a
              href="/portfolio/ZooClicker/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/Media/main/Zoo Clicker.jpg"
                alt="Zoo clicker game screenshot"
              />
              <p>
                An interactive game in vanilla JS, HTML, and CSS that lets the
                user gain more points as they click. It has a mobile view as
                well as a standard desktop view with a seamless responsive
                design. The user can buy producers with the currency
                they&apos;ve acquired, generating more clicks, and unlocking
                more animals.
              </p>
            </a>
            <p>
              <a
                className="projectGithubLink"
                href="https://github.com/pelnik/CookieClicker"
              >
                Github repo
              </a>
            </p>
          </div>
          <div className="project">
            <a href="/portfolio/deucesWild/index.html" target="_blank">
              <img
                src="/Media/main/deucesWildPic.jpg"
                alt="Deuces Wild screenshot"
              />
              <p>
                This is a card game inspired by a trip with friends to Las
                Vegas. While there, one theme that kept coming up was one
                friend&apos;s obsession with Deuces Wild, and by the end of the
                trip, everyone had played it. This game is coded in vanilla
                Javascript, HTML, and CSS. It is completely modular, object
                based, and it tracks your hand history.
              </p>
            </a>
            <p>
              <a
                className="projectGithubLink"
                href="https://github.com/pelnik/Deuces-Wild"
              >
                Github repo
              </a>
            </p>
          </div>
          <div className="project">
            <a
              href="/portfolio/qwirty/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/Media/main/qwirty-screenshot.jpg"
                alt="qwirty site screenshot"
              />
              <p>
                For this project, the goal was to closely replicate a provided
                template for a store page using just HTML and CSS. The page
                extensively uses flexbox to adjust layout and dynamically
                adjusts items, the header, and several other elements for a
                responsive design.
              </p>
            </a>
            <p>
              <a
                className="projectGithubLink"
                href="https://github.com/pelnik/qwirtyStorePage"
              >
                Github repo
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Portfolio;
