import React from 'react';
import { ProjectCard } from '.';

function HomeContent({ portfolioRef }) {
  return (
    <div ref={portfolioRef} id="portfolio-section-container">
      <p>Portfolio</p>
      <div id="project-container">
        <button>Scroll to 3</button>
        <ProjectCard />
        <ProjectCard />
        <ProjectCard portfolioRef={portfolioRef} />
        <ProjectCard />
      </div>
    </div>
  );
}

export default HomeContent;
