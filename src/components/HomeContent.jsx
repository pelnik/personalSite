import React, { useRef } from 'react';
import { ProjectCard } from '.';

function HomeContent() {
  const testRef = useRef(null);

  return (
    <div id="project-container">
      <button
        onClick={(evt) => {
          testRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }}
      >
        Scroll to 3
      </button>
      <ProjectCard />
      <ProjectCard />
      <ProjectCard testRef={testRef} />
      <ProjectCard />
    </div>
  );
}

export default HomeContent;
