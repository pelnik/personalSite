import React from 'react';

function ProjectCard({ testRef }) {
  return (
    <div ref={testRef} className="project-card">
      Test
    </div>
  );
}

export default ProjectCard;
