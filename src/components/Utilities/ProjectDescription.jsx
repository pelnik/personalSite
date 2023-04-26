import React from 'react';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function ProjectDescription({ project, descriptionTracker, projectWidth }) {
  const descriptions = project.description;

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
        <div className="description-text-scrolling">
          {descriptions.map((description, idx) => {
            return (
              <p
                className="individual-description"
                key={idx}
                style={{
                  width: projectWidth,
                }}
              >
                {description}
              </p>
            );
          })}
        </div>
      </div>
      <div className="description-scrolling-icons">
        <ArrowBackIosNewIcon />
        <ArrowForwardIosIcon />
      </div>
    </div>
  );
}

export default ProjectDescription;
