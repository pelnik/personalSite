import React from 'react';

function ProjectDetails({ project }) {
  return (
    <div className="project-content">
      <div className="img-container">
        <img src={project.img} alt={project.img_alt} />
      </div>
      <div className="project-description">
        {project.description.map((section, idx) => {
          return <p key={idx}>{section}</p>;
        })}
        <a
          className="github-link"
          href={project.github_link}
          target="_blank"
          rel="noreferrer"
        >
          Github repo
        </a>
      </div>
    </div>
  );
}

export default ProjectDetails;
