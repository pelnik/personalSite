import React from 'react';

import CircleIcon from '@mui/icons-material/Circle';

function ProjectDescription({ project }) {
  const descriptions = project.description;

  return (
    <div className="project-description-container">
      <CircleIcon className="description-selector" fontSize="small" />
    </div>
  );
}

export default ProjectDescription;
