import React from 'react';
import { ProjectDescription } from '..';

import { Link } from 'react-router-dom';

// Work on Project description navigation

function ProjectWrapper({
  project,
  descriptionTracker,
  firstProjectID,
  projectElement,
  projectWidth,
}) {
  console.log(
    'ref check',
    firstProjectID === project.id,
    'first',
    firstProjectID,
    'project ID',
    project.id
  );

  return project.external ? (
    <div className="individual-project">
      <a
        className="project-link-container"
        href={project.link}
        target="_blank"
        rel="noreferrer"
        ref={firstProjectID === project.id ? projectElement : null}
      >
        <div className="img-container">
          <img src={project.img} alt={project.img_alt} />
        </div>
        <ProjectDescription
          project={project}
          projectWidth={projectWidth}
          descriptionTracker={descriptionTracker}
        />
      </a>
      <a
        className="github-link"
        href={project.github_link}
        target="_blank"
        rel="noreferrer"
      >
        Github repo
      </a>
    </div>
  ) : (
    <div className="individual-project">
      <Link
        className="project-link-container"
        ref={firstProjectID === project.id ? projectElement : null}
        to={project.link}
      >
        <div className="img-container">
          <img src={project.img} alt={project.img_alt} />
        </div>
        <ProjectDescription
          project={project}
          descriptionTracker={descriptionTracker}
          projectWidth={projectWidth}
        />
      </Link>
      <a
        className="github-link"
        href={project.github_link}
        target="_blank"
        rel="noreferrer"
      >
        Github repo
      </a>
    </div>
  );
}

export default ProjectWrapper;
