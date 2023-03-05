/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { ErrorIcon } from '..';

function NotFound() {
  useEffect(() => {
    document.title = 'Oh no 404! - No Page Found - Matthew Pelnik, Full Stack Web Software Engineer';
  }, []);

  return (
    <main className="main" id="nfFullWindow">
      <div className="nfTextContent">
        <h1 id="nfErrorHeader">
          <ErrorIcon />
          Page Not Found
          <ErrorIcon />
        </h1>
        <p>
          Looks like that page isn&apos;t available. Please follow any
          of the links in the header, footer, or go straight to my
          portfolio directly <Link to="/portfolio">here</Link>
          .
        </p>
        <p>
          If you think this page should have worked, please feel free
          to reach out to me, as always, at <a href="mailto:matt@pelnik.dev">matt@pelnik.dev</a>
          .
        </p>
      </div>
    </main>
  );
}

export default NotFound;
