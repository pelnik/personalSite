import React from 'react';

function ProjectDetails({ project }) {
  return (
    <div className="project-content">
      <img src={project.img} alt={project.img_alt} />
      <div className="project-description">
        {project.description.map((section, idx) => {
          return <p key={idx}>{section}</p>;
        })}
      </div>
    </div>
  );
}

export default ProjectDetails;
