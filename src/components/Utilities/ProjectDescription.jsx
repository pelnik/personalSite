import React, { useRef } from 'react';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { pink } from '@mui/material/colors';

function ProjectDescription({
  project,
  descriptionTracker,
  setDescriptionTracker,
  projectWidth,
}) {
  const descriptions = project.description;
  const descriptionRef = useRef(new Map());

  function scrollToDescriptionIdx(idx) {
    const map = descriptionRef.current;
    const node = map.get(idx);
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
    setDescriptionTracker({
      ...descriptionTracker,
      [project.id]: descriptionTracker[project.id].map(
        (description, descriptionTrackerIdx) => {
          return descriptionTrackerIdx === idx ? true : false;
        }
      ),
    });
  }

  function displayForwardArrow() {
    if (descriptionTracker[project.id][0] === true) {
      return false;
    }

    return true;
  }

  function getNewIndex(position) {
    const trueIndex = descriptionTracker[project.id].findIndex(
      (track) => track === true
    );

    const newPosition = trueIndex + position;

    if (
      newPosition < 0 ||
      newPosition > descriptionTracker[project.id].length - 1
    ) {
      return trueIndex;
    }

    return newPosition;
  }

  function displayBackArrow() {
    if (descriptionTracker[project.id].at(-1) === true) {
      return false;
    }

    return true;
  }

  function updateDescription(position) {
    const newIndex = getNewIndex(position);
    scrollToDescriptionIdx(newIndex);
  }

  return (
    <div className="project-description-container">
      <div
        className="project-description-icons"
        onClick={(evt) => {
          evt.preventDefault();
        }}
      >
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
        <ArrowBackIosNewIcon
          className={
            displayForwardArrow()
              ? 'description-arrow'
              : 'description-arrow no-display'
          }
          onClick={(evt) => {
            evt.preventDefault();
            updateDescription(-1);
          }}
        />
        <ArrowForwardIosIcon
          className={
            displayBackArrow()
              ? 'description-arrow'
              : 'description-arrow no-display'
          }
          onClick={(evt) => {
            evt.preventDefault();
            updateDescription(1);
          }}
        />
      </div>
    </div>
  );
}

export default ProjectDescription;
