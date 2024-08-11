import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeFooter, HomeHeader } from '..';

function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title =
      'Oh no 404! - No Page Found - Matthew Pelnik, Data Analyst and Full Stack Web Developer';
  }, []);

  return (
    <div className="site-full-window not-found-full-window">
      <HomeHeader />
      <div className="home-content-parent" id="not-found-content">
        <div className="not-found-flex">
          <h2 className="section-title">Page Not Found</h2>
          <div id="not-found-text">
            <p>
              Looks like that page isn&apos;t available. Go home directly{' '}
              <Link to="/">here</Link> or go back{' '}
              <a
                onClick={() => {
                  navigate(-1);
                }}
              >
                here
              </a>
              .
            </p>
            <p>
              If you think there should be a page here, please feel free to
              reach out to me, as always, at{' '}
              <a href="mailto:matthew.pelnik@gmail.com">
                matthew.pelnik@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
}

export default NotFound;
