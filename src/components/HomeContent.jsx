import React, { useState, useEffect, useRef } from 'react';
import { About, ProjectWrapper } from '.';

function HomeContent({ portfolioRef }) {
  const [projects, setProjects] = useState([]);
  const [descriptionTracker, setDescriptionTracker] = useState({});
  const [projectWidth, setProjectWidth] = useState(null);
  const projectElement = useRef(null);

  let firstProjectID = 100;

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

  function getProjectElementWidth() {
    let stringWidth = getComputedStyle(projectElement.current).width;
    stringWidth = stringWidth.slice(0, -2);

    return Number(stringWidth);
  }

  if (projects.length === 0) {
    fetch('/data/portfolio.json')
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
  } else if (projects.length > 1) {
    firstProjectID = projects[0].id;
  }

  useEffect(() => {
    window.addEventListener('resize', () => {
      let stringWidth = getComputedStyle(projectElement.current).width;
      stringWidth = stringWidth.slice(0, -2);

      setProjectWidth(getProjectElementWidth());
    });
  }, []);

  useEffect(() => {
    if (Object.keys(projects).length !== 0) {
      setProjectWidth(getProjectElementWidth());
    }
  }, [projects]);

  return (
    <div id="home-content-parent">
      <div id="home-content-flex">
        <About />
        <div ref={portfolioRef} id="portfolio-section-container">
          <p>Portfolio</p>
          <div id="project-container">
            {projects.map((project) => {
              return (
                <ProjectWrapper
                  key={project.id}
                  project={project}
                  descriptionTracker={descriptionTracker}
                  firstProjectID={firstProjectID}
                  projectElement={projectElement}
                  projectWidth={projectWidth}
                  setDescriptionTracker={setDescriptionTracker}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeContent;
