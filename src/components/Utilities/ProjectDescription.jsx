import React, { useRef } from 'react';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function ProjectDescription({ project, descriptionTracker, projectWidth }) {
  const descriptions = project.description;
  const descriptionRef = useRef(new Map());

  console.log('description tracker', descriptionTracker);

  function scrollToDescriptionIdx(idx) {
    const map = descriptionRef.current;
    console.log('map', map);
    const node = map.get(idx);
    console.log('node', node);
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }

  return (
    <div className="project-description-container">
      <div className="project-description-icons">
        {descriptions.map((description, idx) => {
          if (descriptionTracker[project.id][idx]) {
            return (
              <CircleIcon
                key={idx}
                className="description-selector selected"
                onClick={(evt) => {
                  evt.preventDefault();
                  scrollToDescriptionIdx(idx);
                }}
              />
            );
          }

          return (
            <CircleIcon
              key={idx}
              className="description-selector not-selected"
              onClick={(evt) => {
                evt.preventDefault();
                scrollToDescriptionIdx(idx);
              }}
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
                ref={(node) => {
                  const map = descriptionRef.current;
                  if (node) {
                    map.set(idx, node);
                  } else {
                    map.delete(idx);
                  }
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
