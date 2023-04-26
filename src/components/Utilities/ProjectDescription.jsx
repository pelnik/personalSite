import React from 'react';

import CircleIcon from '@mui/icons-material/Circle';

function ProjectDescription({ project, descriptionTracker }) {
  const descriptions = project.description;

  console.log('descriptionTracker', descriptionTracker);

  return (
    <div className="project-description-container">
      <div className="project-description-icons">
        {descriptions.map((description, idx) => {
          if (descriptionTracker[project.id][idx]) {
            return (
              <CircleIcon key={idx} className="description-selector selected" />
            );
          }

          return (
            <CircleIcon
              key={idx}
              className="description-selector not-selected"
            />
          );
        })}
      </div>
      <div className="description-text">
        {descriptions.map((description, idx) => {
          return (
            <p
              className="individual-description"
              key={idx}
              style={
                {
                  // display:
                }
              }
            >
              {description}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectDescription;
