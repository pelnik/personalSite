import React, { useRef } from 'react';
import { ProjectDescription, ProjectImages } from '..';

import { Link } from 'react-router-dom';

// Work on Project description navigation

function ProjectWrapper({
  project,
  descriptionTracker,
  firstProjectID,
  projectElement,
  projectWidth,
  setDescriptionTracker,
}) {
  const images = project.img;

  const imageRef = useRef(new Map());

  const activeImages = useRef(
    images.map((image, idx) => {
      return idx === 0;
    })
  );
  const scrollingInterval = useRef([]);

  function scrollToImageIdx(idx) {
    const map = imageRef.current;
    const node = map.get(idx);
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });

    console.log(
      'new array to set ',
      activeImages.current.map((image, newIdx) => {
        return idx === newIdx;
      })
    );

    activeImages.current = [...activeImages.current].map((image, newIdx) => {
      return idx === newIdx;
    });
  }

  function getCurrentImage() {
    console.log('activeImages inside of getCurrent', activeImages.current);
    console.log(
      'get current image',
      activeImages.current.findIndex((imageActive) => imageActive)
    );
    return activeImages.current.findIndex((imageActive) => imageActive);
  }

  const onMouseEnter = (evt) => {
    const intervalID = setInterval(() => {
      console.log('hover scope active images', activeImages.current);
      const currentIdx = getCurrentImage();
      const nextIdx =
        currentIdx + 1 > activeImages.current.length - 1 ? 0 : currentIdx + 1;

      console.log('next idx, passed into funtion', nextIdx);

      scrollToImageIdx(nextIdx);
    }, 2000);
    scrollingInterval.current.push(intervalID);
  };

  const onMouseLeave = (evt) => {
    scrollingInterval.current.forEach((intervalID) => {
      clearInterval(intervalID);
    });

    scrollingInterval.current = [];
  };

  return project.external ? (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="individual-project"
    >
      <a
        className="project-link-container"
        href={project.link}
        target="_blank"
        rel="noreferrer"
        ref={firstProjectID === project.id ? projectElement : null}
      >
        <ProjectImages
          project={project}
          projectWidth={projectWidth}
          imageRef={imageRef}
          images={images}
        />
        <ProjectDescription
          project={project}
          projectWidth={projectWidth}
          descriptionTracker={descriptionTracker}
          setDescriptionTracker={setDescriptionTracker}
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
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="individual-project"
    >
      <Link
        className="project-link-container"
        ref={firstProjectID === project.id ? projectElement : null}
        to={project.link}
      >
        <ProjectImages
          project={project}
          projectWidth={projectWidth}
          imageRef={imageRef}
          images={images}
        />
        <ProjectDescription
          project={project}
          projectWidth={projectWidth}
          descriptionTracker={descriptionTracker}
          setDescriptionTracker={setDescriptionTracker}
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
