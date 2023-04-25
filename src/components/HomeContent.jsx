import React, { useState } from 'react';
import { ProjectWrapper } from '.';

function HomeContent({ portfolioRef }) {
  const [projects, setProjects] = useState([]);
  const [descriptionTracker, setDescriptionTracker] = useState({});

  function createDescriptionTracker(projects) {
    const initialTracker = {};

    projects.forEach((project) => {
      initialTracker[project.id] = project.description.map((paragraph, idx) => {
        return idx !== 0 ? false : true;
      });
    });

    return initialTracker;
  }

  createDescriptionTracker(projects);

  if (projects.length === 0) {
    fetch('/data/portfolio.txt')
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        setDescriptionTracker(createDescriptionTracker(result));
        setProjects(result);
      })
      .catch((error) => {
        console.error('error fetching portfolio.txt file', error);
      });
  }

  console.log('projects', projects);

  return (
    <div ref={portfolioRef} id="portfolio-section-container">
      <p>Portfolio</p>
      <div id="project-container">
        {projects.map((project) => {
          return (
            <ProjectWrapper
              key={project.id}
              project={project}
              descriptionTracker={descriptionTracker}
            />
          );
        })}
      </div>
    </div>
  );
}

export default HomeContent;
