import React from 'react';
import { ProjectDescription } from '..';

import { Link } from 'react-router-dom';

// Work on Project description navigation

function ProjectWrapper({ project, descriptionTracker }) {
  return project.external ? (
    <div className="individual-project">
      <a
        className="project-link-container"
        href={project.link}
        target="_blank"
        rel="noreferrer"
      >
        <div className="img-container">
          <img src={project.img} alt={project.img_alt} />
        </div>
        <ProjectDescription
          project={project}
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
      <Link className="project-link-container" to={project.link}>
        <div className="img-container">
          <img src={project.img} alt={project.img_alt} />
        </div>
        <ProjectDescription
          project={project}
          descriptionTracker={descriptionTracker}
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
