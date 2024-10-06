import React from 'react';

function About() {
  return (
    <div id="about-parent">
      <div id="about-pic-flex">
        <img className="personal-pic" src="/Media/main/personal_pic.jpg" />
        <p className="about-text">
          👋 Hi there, thank you for visiting my site! I'm a data analyst and
          web developer based out of Tulsa, Oklahoma. I specialize in data
          analytics using SAS, SQL, and Power BI. I am currently working a
          federal contract using statistical and medical analyses to identify
          fraudulent providers billing Medicare.
          <br />
          <br />
          🗃️{' '}
          <a
            target="_blank"
            className="resume-link"
            href="/Resume Matthew Pelnik.pdf"
          >
            Take a look at my resume!
          </a>
          <br />
          <br />
          👇 This site was built by me from scratch with React and Express. View
          my web development projects below.
        </p>
      </div>
    </div>
  );
}

export default About;
