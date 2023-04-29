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

    activeImages.current = [...activeImages.current].map((image, newIdx) => {
      return idx === newIdx;
    });
  }

  function getCurrentImage() {
    return activeImages.current.findIndex((imageActive) => imageActive);
  }

  function setScrollingInterval(withTimeout) {
    if (scrollingInterval.current.length === 0) {
      const intervalID = setInterval(() => {
        const currentIdx = getCurrentImage();
        const nextIdx =
          currentIdx + 1 > activeImages.current.length - 1 ? 0 : currentIdx + 1;

        scrollToImageIdx(nextIdx);
      }, 3000);
      scrollingInterval.current.push(intervalID);

      if (withTimeout) {
        setTimeout(onMouseLeave, 9000);
      }
    }
  }

  const onMouseEnter = (evt) => {
    setScrollingInterval(false);
  };

  const onMouseLeave = (evt) => {
    scrollingInterval.current.forEach((intervalID) => {
      clearInterval(intervalID);
    });

    scrollingInterval.current = [];
  };

  function onTouchMove(evt) {
    setScrollingInterval(true);
  }

  return project.external ? (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
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
      onTouchStart={onMouseEnter}
      onTouchEnd={onMouseLeave}
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
