import React, { useEffect } from 'react';
import { Link, Outlet, useMatch } from 'react-router-dom';
import { SiteContentContainer } from '.';

type AboutLink = {
  label: string;
  href: string;
  description?: string;
  // An archive.org snapshot of the same page, shown after the link in case
  // the site goes down.
  archiveHref?: string;
};

const ABOUT_LINKS: AboutLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/pelnik',
    description: 'My Github profile',
    archiveHref: 'https://web.archive.org/web/https://github.com/pelnik',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/mpelnik/',
    description: 'My LinkedIn',
    archiveHref:
      'https://web.archive.org/web/https://www.linkedin.com/in/mpelnik/',
  },
];

// Structured data (schema.org JSON-LD) that search engines and AI tools read
// directly. Keep it in step with the intro below, the stats, and
// public/llms.txt.
const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Matthew Pelnik',
  alternateName: 'Matt Pelnik',
  url: 'https://pelnik.dev/about',
  image: 'https://pelnik.dev/Media/main/Professional%20pic.jpg',
  jobTitle: 'Data Analyst',
  description:
    'Data Analyst in the Tulsa area, working for a contractor for CMS (Medicare) creating proactive models to find provider fraud, mostly in Databricks with Python and Spark.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tulsa',
    addressRegion: 'OK',
    addressCountry: 'US',
  },
  knowsAbout: ['Databricks', 'Python', 'Spark', 'Fraud detection'],
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'degree',
    name: 'Chemical Engineering degree',
  },
  sameAs: ABOUT_LINKS.map((link) => link.href),
};

// `<` escaped so the JSON can't close the script tag.
const PERSON_SCHEMA_JSON = JSON.stringify(PERSON_SCHEMA).replace(/</g, '\\u003c');

const ABOUT_TITLE =
  'About - Matthew Pelnik, Data Analyst, Databricks and Spark';
const STATS_TITLE =
  'Stats - Matthew Pelnik, Data Analyst, Databricks and Spark';

function MainAbout() {
  // The stats overlay renders inside this page, and a parent's effect runs
  // after its child's, so this page sets the title for both routes.
  const statsOpen = useMatch('/about/stats') !== null;

  useEffect(() => {
    document.title = statsOpen ? STATS_TITLE : ABOUT_TITLE;
  }, [statsOpen]);

  return (
    <SiteContentContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PERSON_SCHEMA_JSON }}
      />
      <div className="home-content-flex">
        <div id="about-pic-flex">
          <img
            className="personal-pic about-page-pic"
            src="/Media/main/Professional pic.jpg"
            alt="Personal picture"
          />
          <div className="about-text about-page-text">
            <p>
              Thank you for visiting my site! I am a Data Analyst working out of
              the Tulsa area. Currently, I work for a contractor for CMS
              (Medicare) creating proactive models to pursue provider fraud.
              Most of my time is spent in Databricks using Python and Spark.
            </p>
            <p>
              Outside of work, I enjoy staying active playing tennis and
              kickball in local leagues.
            </p>
          </div>
        </div>
        <hr className="main-page-separator" />
        <div id="about-links-section">
          <h2 className="section-title">Links</h2>
          <ul id="about-links">
            {ABOUT_LINKS.map((link) => {
              return (
                <li key={link.href} className="about-link-card">
                  <div className="about-link-row">
                    <a
                      className="about-link"
                      target="_blank"
                      rel="noreferrer"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                    {link.archiveHref && (
                      <a
                        className="archive-link"
                        target="_blank"
                        rel="noreferrer"
                        href={link.archiveHref}
                        title={`Archived copy of ${link.label} on archive.org`}
                      >
                        archived
                      </a>
                    )}
                  </div>
                  {link.description && (
                    <p className="about-link-description">{link.description}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <Link to="stats" className="stats-button">
          Stats
        </Link>
      </div>
      <Outlet />
    </SiteContentContainer>
  );
}

export default MainAbout;
