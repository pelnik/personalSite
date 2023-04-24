import React from 'react';
import { ProjectDetails } from '..';

import { Link } from 'react-router-dom';

function ProjectWrapper({ project }) {
  if (project?.external) {
    <div className="individual-project">
      <a href={project.link} target="_blank" rel="noreferrer">
        <ProjectDetails project={project} />
      </a>
    </div>;
  }
  return (
    <div className="individual-project">
      <Link to={project?.link}>
        <ProjectDetails project={project} />
      </Link>
    </div>
  );
}

export default ProjectWrapper;
