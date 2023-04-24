import React, { useState } from 'react';
import { ProjectWrapper } from '.';

function HomeContent({ portfolioRef }) {
  const [projects, setProjects] = useState([]);

  if (projects.length === 0) {
    fetch('/data/portfolio.txt')
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        setProjects(result);
      });
  }

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
