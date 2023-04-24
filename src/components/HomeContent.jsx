import React, { useState } from 'react';
import { ProjectWrapper } from '.';

// const PROJECTS = [
//   {
//     id: 100,
//     img: '/Media/main/project_scents_front.jpg',
//     img_alt: 'makes scents front end screenshot',
//     link: '/scents',
//     external: true,
//     github_link: 'https://github.com/The-Underdogs-2301',
//     description: [
//       `Makes Scents is a full-stack eCommerce, fragrance store with
//       an Express back end and a React front end. I designed the cart
//       functionality on the front end and back end from the bottom
//       up. The cart allows you to add items from different areas of
//       the site and dynamically update the cart state, along with
//       items subtotals and totals.`,
//       `A PostgreSQL database was used with an Express back end called
//       through REST APIs using stateless user authentication and
//       password encryption.`,
//       `The user can register, login, browse and filter products, add
//       items to the cart, adjust quantities while adding to the cart
//       or in the cart itself, and remove items from the cart. Admin
//       users can update product and user information throughout the
//       site without needing a developer to update the back end.`,
//       `PLEASE NOTE: Our app uses a free tier of a platform as a
//       service site to host our back end. Because of that, it goes to
//       sleep after a few minutes of inactivity, and it will take a
//       little while to spin up on first load.`,
//     ],
//   },
//   {
//     id: 99,
//     img: '/Media/main/fitness-back-end.jpg',
//     img_alt: 'fitness tracker back end screenshot',
//     link: '/api/fitness/docs',
//     external: false,
//     github_link: 'https://github.com/jina366/FitnessTrackerFront',
//     description: [
//       `We developed a fitness tracker back end that tracks user
//       routines and activities. You can choose if you want your
//       routines public, and the API will serve up appropriate
//       routines whether you are logged in or logged out. The site has
//       a Postgres database back end and JSON Web Tokens are used for
//       stateless user authentication.`,
//       `The REST APIs were built using a test driven development
//       design where Jest test were provided specifying the needed
//       capabilities, and the API was built to meet those.`,
//       `Several features typical of a site of this nature are built
//       into the API, such as user registration, login, the ability to
//       see routines and activities with or without authorization,
//       edit and create routines, and the attachment of activities to
//       individual routines.`,
//       `The documentation linked has several cURL commands you can use
//       to test the API.`,
//     ],
//   },
//   {
//     id: 98,
//     img: '/Media/main/fitness-front-end.jpg',
//     img_alt: 'fitness tracker front end screenshot',
//     link: '/fitness',
//     external: false,
//     github_link: 'https://github.com/pelnik/FitnessTracker',
//     description: [
//       `The front end for our fitness tracker was developed on top of
//       the API built allowing users to track their own fitness
//       efforts. The site uses extensive routing to allow the user to
//       navigate directly to certain pages, like "create new activity"
//       for instance and also implements the Material UI React
//       framework for icons.`,
//       `The front end allows the user to use the features described in
//       the backend section, such as registering a user, logging in,
//       creating a routine or activity, adding activities to the
//       routine, editing, and deleting. Register a user and play
//       around in the site!`,
//     ],
//   },
//   {
//     id: 97,
//     img: '/Media/main/juicebox-back-end.jpg',
//     img_alt: 'Juicebox back end screenshot',
//     link: '/api/juicebox/docs',
//     external: false,
//     github_link: 'https://github.com/pelnik/juicebox',
//     description: [
//       `For this pair project, we developed an API for a social media
//       site using Express. The site has a Postgres database back end
//       that the server allows communication to through the back end.
//       JSON Web Tokens are used for stateless user authentication, as
//       opposed to implementing user sessions and verification for
//       each user.`,
//       `Several features typical of a site of this nature are built
//       into the API, such as user registration, login, the ability to
//       see posts with or without authorization, edit and create
//       posts, and the ability to add tags to posts and retrieve posts
//       by those tags.`,
//       `The documentation linked has several cURL commands you can use
//       to test the API.`,
//     ],
//   },
//   {
//     id: 96,
//     img: '/Media/main/juicebox-front-end.jpg',
//     img_alt: 'Juicebox front end screenshot',
//     link: '/juicebox',
//     external: false,
//     github_link: 'https://github.com/pelnik/JuiceboxFrontEnd',
//     description: [
//       `A pair project developing a social media site that implements
//       the API backend we built, described in the back end section.
//       We implemented the popular Material UI React framework to
//       allow for quick implementation of advanced UI features for
//       form input and other visual components.`,
//       `The front end allows the user to use the features described in
//       the backend section, such as registering a user, logging in,
//       creating a post, editing, and deleting. Register a user and
//       play around in the site!`,
//     ],
//   },
//   {
//     id: 95,
//     img: '/Media/main/Strangers_Things_screenshot.png',
//     img_alt: 'Strangers Things screenshot',
//     link: '/stranger',
//     external: false,
//     github_link: 'https://github.com/pelnik/StrangersThings',
//     description: [
//       `A pair project in the spirit of Craigslist coded in React
//       using APIs allowing for user authentication, registration,
//       making posts, messaging, and more. The site has a responsive
//       desktop and mobile view, and the ads are posted by my cohort
//       and anyone else with access to appropriate sites or APIs. The
//       site also employs routing so users can access sections of the
//       site directly. Feel free to register a user and experiment
//       with the persistent posting and messaging capabilities!`,
//     ],
//   },
//   {
//     id: 94,
//     img: '/Media/main/snake-screenshot.png',
//     img_alt: 'snake game screenshot',
//     link: '/snake',
//     external: false,
//     github_link: 'https://github.com/pelnik/arcade',
//     description: [
//       `The classic game coded in vanilla Javascript. The game has
//       several difficulties, score tracking, and scales to multiple
//       desktop screen sizes. To run it features extensive Javascript
//       DOM interaction as well as event listeners for user input to
//       update HTML elements and give a seamless game experience. The
//       game is built for using arrow keys on desktop. Play a few
//       rounds!`,
//     ],
//   },
//   {
//     id: 93,
//     img: '/Media/main/Zoo Clicker.jpg',
//     img_alt: 'Zoo clicker game screenshot',
//     link: '/portfolio/ZooClicker/index.html',
//     external: true,
//     github_link: 'https://github.com/pelnik/CookieClicker',
//     description: [
//       `An interactive game in vanilla JS, HTML, and CSS that lets the
//       user gain more points as they click. It has a mobile view as
//       well as a standard desktop view with a seamless responsive
//       design. The user can buy producers with the currency
//       they'&apos;'ve acquired, generating more clicks, and unlocking
//       more animals.`,
//     ],
//   },
//   {
//     id: 92,
//     img: '/Media/main/deucesWildPic.jpg',
//     img_alt: 'Deuces Wild screenshot',
//     link: '/portfolio/deucesWild/index.html',
//     external: true,
//     github_link: 'https://github.com/pelnik/Deuces-Wild',
//     description: [
//       `This is a card game inspired by a trip with friends to Las
//       Vegas. While there, one theme that kept coming up was one
//       friend's obsession with Deuces Wild, and by the end of
//       the trip, everyone had played it. This game is coded in
//       vanilla Javascript, HTML, and CSS. It is completely modular,
//       object based, and it tracks your hand history.`,
//     ],
//   },
//   {
//     id: 91,
//     img: '/Media/main/qwirty-screenshot.jpg',
//     img_alt: 'qwirty site screenshot',
//     link: '/portfolio/qwirty/index.html',
//     external: true,
//     github_link: 'https://github.com/pelnik/qwirtyStorePage',
//     description: [
//       `For this project, the goal was to closely replicate a provided
//       template for a store page using just HTML and CSS. The page
//       extensively uses flexbox to adjust layout and dynamically
//       adjusts items, the header, and several other elements for a
//       responsive design.`,
//     ],
//   },
// ];

function HomeContent({ portfolioRef }) {
  const [projects, setProjects] = useState([]);

  if (projects.length === 0) {
    fetch('/data/portfolio.txt')
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        console.log('result', result);
        setProjects(result);
      });
  }

  console.log('PROJECTS', projects);

  return (
    <div ref={portfolioRef} id="portfolio-section-container">
      <p>Portfolio</p>
      <div id="project-container">
        {projects.map((project) => {
          return <ProjectWrapper key={project.id} project={project} />;
        })}
      </div>
    </div>
  );
}

export default HomeContent;
