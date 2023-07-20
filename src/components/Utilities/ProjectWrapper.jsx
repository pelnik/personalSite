import React, { useEffect, useRef } from 'react';
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

  function clearIntervals() {
    scrollingInterval.current.forEach((intervalID) => {
      clearInterval(intervalID);
    });

    scrollingInterval.current = [];
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
        setTimeout(clearIntervals, 9000);
      }
    }
  }

  const onMouseEnter = (evt) => {
    setScrollingInterval(false);
  };

  function onTouchMove(evt) {
    setScrollingInterval(true);
  }

  useEffect(() => {
    return clearIntervals;
  }, []);

  return project.external ? (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={clearIntervals}
      onTouchMove={onTouchMove}
      onTouchEnd={clearIntervals}
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
      onMouseLeave={clearIntervals}
      onTouchStart={onMouseEnter}
      onTouchEnd={clearIntervals}
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
