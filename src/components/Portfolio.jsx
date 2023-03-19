import React, { useEffect } from 'react';
import { Header, Footer } from '.';
import '../css/site.css';
import { Link } from 'react-router-dom';

function Portfolio() {
  useEffect(() => {
    document.title =
      'My Portfolio - Matthew Pelnik, Full Stack Web Software Engineer';
  }, []);

  return (
    <div className="siteFullWindow">
      <Header />
      <div className="main" id="portfolioMain">
        <div id="portfolioMainContainer">
          <h1>Portfolio</h1>
          <p>
            Please see my portfolio below. This is a collection of various
            projects that I have developed over time that each showcase a
            different primary skill.
          </p>
          <div className="projectContainer">
            <div className="project">
              <Link to="/api/juicebox">
                <img
                  src="/Media/main/juicebox-back-end.jpg"
                  alt="Juicebox back end screenshot"
                />
                <p>
                  For this pair project, we developed an API for a social media
                  site using Express. The site has a Postgres database back end
                  that the server allows communication to through the back end.
                  JSON Web Tokens are used for stateless user authentication, as
                  opposed to implementing user sessions and verification for
                  each user.
                </p>
                <p>
                  Several features typical of a site of this nature are built
                  into the API, such as user registration, login, the ability to
                  see posts with or without authorization, edit and create
                  posts, and the ability to add tags to posts and retrieve posts
                  by those tags.
                </p>
                <p>
                  The documentation linked has several cURL commands you can use
                  to test the API.
                </p>
              </Link>
              <p>
                <a
                  className="projectGithubLink"
                  href="https://github.com/pelnik/juicebox"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github repo
                </a>
              </p>
            </div>
            <div className="project">
              <Link to="/juicebox">
                <img
                  src="/Media/main/juicebox-front-end.jpg"
                  alt="Juicebox front end screenshot"
                />
                <p>
                  A pair project developing a social media site that implements
                  the API backend we built, described in the back end section.
                  We implemented the popular Material UI React framework to
                  allow for quick implementation of advanced UI features for
                  form input and other visual components.
                </p>
                <p>
                  The front end allows the user to use the features described in
                  the backend section, such as registering a user, logging in,
                  creating a post, editing, and deleting. Register a user and
                  play around in the site!
                </p>
              </Link>
              <p>
                <a
                  className="projectGithubLink"
                  href="https://github.com/pelnik/JuiceboxFrontEnd"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github repo
                </a>
              </p>
            </div>
            <div className="project">
              <Link to="/stranger">
                <img
                  src="/Media/main/Strangers_Things_screenshot.png"
                  alt="Strangers Things screenshot"
                />
                <p>
                  A pair project in the spirit of Craigslist coded in React
                  using APIs allowing for user authentication, registration,
                  making posts, messaging, and more. The site has a responsive
                  desktop and mobile view, and the ads are posted by my cohort
                  and anyone else with access to appropriate sites or APIs. The
                  site also employs routing so users can access sections of the
                  site directly. Feel free to register a user and experiment
                  with the persistent posting and messaging capabilities!
                </p>
              </Link>
              <p>
                <a
                  className="projectGithubLink"
                  href="https://github.com/pelnik/StrangersThings"
                  target="_blank"
                  rel="noreferrer"
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
                  target="_blank"
                  rel="noreferrer"
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
                  target="_blank"
                  rel="noreferrer"
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
                  friend&apos;s obsession with Deuces Wild, and by the end of
                  the trip, everyone had played it. This game is coded in
                  vanilla Javascript, HTML, and CSS. It is completely modular,
                  object based, and it tracks your hand history.
                </p>
              </a>
              <p>
                <a
                  className="projectGithubLink"
                  href="https://github.com/pelnik/Deuces-Wild"
                  target="_blank"
                  rel="noreferrer"
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
                  target="_blank"
                  rel="noreferrer"
                >
                  Github repo
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Portfolio;
