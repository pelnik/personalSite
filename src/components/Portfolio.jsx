import React, { useEffect } from 'react';
import { OldHeader, OldFooter } from '.';
import { Link } from 'react-router-dom';

function Portfolio() {
  useEffect(() => {
    document.title =
      'My Portfolio - Matthew Pelnik, Full Stack Web Software Engineer';
  }, []);

  return (
    <div className="siteFullWindow">
      <OldHeader />
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
              <a href="/scents" target="_blank" rel="noreferrer">
                <img
                  src="/Media/main/project_scents_front.jpg"
                  alt="makes scents front end screenshot"
                />
                <p>
                  Makes Scents is a full-stack eCommerce, fragrance store with
                  an Express back end and a React front end. I designed the cart
                  functionality on the front end and back end from the bottom
                  up. The cart allows you to add items from different areas of
                  the site and dynamically update the cart state, along with
                  items subtotals and totals.
                </p>
                <p>
                  A PostgreSQL database was used with an Express back end called
                  through REST APIs using stateless user authentication and
                  password encryption.
                </p>
                <p>
                  The user can register, login, browse and filter products, add
                  items to the cart, adjust quantities while adding to the cart
                  or in the cart itself, and remove items from the cart. Admin
                  users can update product and user information throughout the
                  site without needing a developer to update the back end.
                </p>
                <p>
                  PLEASE NOTE: Our app uses a free tier of a platform as a
                  service site to host our back end. Because of that, it goes to
                  sleep after a few minutes of inactivity, and it will take a
                  little while to spin up on first load.
                </p>
              </a>
              <p>
                <a
                  className="projectGithubLink"
                  href="https://github.com/The-Underdogs-2301"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github repo
                </a>
              </p>
            </div>
            <div className="project">
              <Link to="/api/fitness/docs">
                <img
                  src="/Media/main/fitness-back-end.jpg"
                  alt="fitness tracker back end screenshot"
                />
                <p>
                  We developed a fitness tracker back end that tracks user
                  routines and activities. You can choose if you want your
                  routines public, and the API will serve up appropriate
                  routines whether you are logged in or logged out. The site has
                  a Postgres database back end and JSON Web Tokens are used for
                  stateless user authentication.
                </p>
                <p>
                  The REST APIs were built using a test driven development
                  design where Jest test were provided specifying the needed
                  capabilities, and the API was built to meet those.
                </p>
                <p>
                  Several features typical of a site of this nature are built
                  into the API, such as user registration, login, the ability to
                  see routines and activities with or without authorization,
                  edit and create routines, and the attachment of activities to
                  individual routines.
                </p>
                <p>
                  The documentation linked has several cURL commands you can use
                  to test the API.
                </p>
              </Link>
              <p>
                <a
                  className="projectGithubLink"
                  href="https://github.com/pelnik/FitnessTracker"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github repo
                </a>
              </p>
            </div>
            <div className="project">
              <Link to="/fitness">
                <img
                  src="/Media/main/fitness-front-end.jpg"
                  alt="fitness tracker front end screenshot"
                />
                <p>
                  The front end for our fitness tracker was developed on top of
                  the API built allowing users to track their own fitness
                  efforts. The site uses extensive routing to allow the user to
                  navigate directly to certain pages, like "create new activity"
                  for instance and also implements the Material UI React
                  framework for icons.
                </p>
                <p>
                  The front end allows the user to use the features described in
                  the backend section, such as registering a user, logging in,
                  creating a routine or activity, adding activities to the
                  routine, editing, and deleting. Register a user and play
                  around in the site!
                </p>
              </Link>
              <p>
                <a
                  className="projectGithubLink"
                  href="https://github.com/jina366/FitnessTrackerFront"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github repo
                </a>
              </p>
            </div>
            <div className="project">
              <Link to="/api/juicebox/docs">
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
              <a href="/portfolio/DeucesWild/index.html" target="_blank">
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
      <OldFooter />
    </div>
  );
}

export default Portfolio;
