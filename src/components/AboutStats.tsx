import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Also listed in public/llms.txt: update both.
const STATS: string[] = [
  'College Degree: Chemical Engineering',
  'College GPA: 3.76',
  'ACT: 34',
];

// Shown over the About page at /about/stats. Closing it goes back to /about.
function AboutStats() {
  const navigate = useNavigate();
  const closeLink = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    closeLink.current?.focus();

    function handleKeyDown(evt: KeyboardEvent) {
      if (evt.key === 'Escape') navigate('/about');
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  function handleBackdropClick(evt: React.MouseEvent<HTMLDivElement>) {
    if (evt.target === evt.currentTarget) navigate('/about');
  }

  return (
    <div className="stats-backdrop" onClick={handleBackdropClick}>
      <div
        className="stats-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
      >
        <Link
          to="/about"
          className="stats-close"
          aria-label="Close stats"
          ref={closeLink}
        >
          ×
        </Link>
        <h2 id="stats-title" className="section-title">
          Stats
        </h2>
        <ul className="stats-list">
          {STATS.map((stat, idx) => {
            return <li key={idx}>{stat}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}

export default AboutStats;
