import React from 'react';
import { ProjectCard } from '.';

function HomeContent({ portfolioRef }) {
  return (
    <div ref={portfolioRef} id="portfolio-section-container">
      <p>Portfolio</p>
      <div id="project-container">
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
        <ProjectCard />
      </div>
    </div>
  );
}

export default HomeContent;
