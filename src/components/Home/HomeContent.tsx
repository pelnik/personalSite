import React, { useState, useEffect, useRef } from 'react';
import { HomeAbout, ProjectWrapper } from '..';
import { portfolio_list } from '../Utilities/portfolio_list';

type HomeContentProps = {
  // portfolioRef: React.RefObject<HTMLDivElement | null>;
};

type DescriptionTracker = Record<number, boolean[]>;

function HomeContent() {
  function createDescriptionTracker() {
    const initialTracker: DescriptionTracker = {};

    portfolio_list.forEach((project) => {
      initialTracker[project.id] = project.description.map((paragraph, idx) => {
        return idx !== 0 ? false : true;
      });
    });

    return initialTracker;
  }

  const [descriptionTracker, setDescriptionTracker] = useState(
    createDescriptionTracker()
  );
  const [projectWidth, setProjectWidth] = useState<number | null>(null);
  const projectElement = useRef<HTMLDivElement | null>(null);

  let firstProjectID = 100;

  function getProjectElementWidth() {
    if (!projectElement.current)
      throw new Error('No project element ref found');

    let stringWidth = getComputedStyle(projectElement.current).width;
    stringWidth = stringWidth.slice(0, -2);

    return Number(stringWidth);
  }

  useEffect(() => {
    function setEventListenerOnResize() {
      if (!projectElement.current)
        throw new Error('No project element ref found');

      let stringWidth = getComputedStyle(projectElement.current).width;
      stringWidth = stringWidth.slice(0, -2);

      setProjectWidth(getProjectElementWidth());
    }

    window.addEventListener('resize', setEventListenerOnResize);

    return () => {
      window.removeEventListener('resize', setEventListenerOnResize);
    };
  }, [projectElement.current]);

  useEffect(() => {
    if (Object.keys(portfolio_list).length !== 0) {
      setProjectWidth(getProjectElementWidth());
    }
  }, [portfolio_list]);

  return (
    <div className="site-content-parent">
      <div className="home-content-flex">
        <HomeAbout />
        <hr className="main-page-separator" />
        <div id="portfolio-section-container">
          <h2 className="section-title">Web Projects</h2>
          <div id="project-container">
            {portfolio_list.map((project) => {
              return (
                <ProjectWrapper
                  key={project.id}
                  project={project}
                  descriptionTracker={descriptionTracker}
                  firstProjectID={firstProjectID}
                  projectElement={projectElement}
                  projectWidth={projectWidth}
                  setDescriptionTracker={setDescriptionTracker}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeContent;
