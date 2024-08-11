import React from 'react';

function About() {
  return (
    <div id="about-parent">
      <div id="about-pic-flex">
        <img className="personal-pic" src="/Media/main/personal_pic.jpg" />
        <p className="about-text">
          Hi there, thank you for visiting my site! I'm a data analyst and web
          developer based out of Tulsa, Oklahoma. I specialize in advanced
          analytics using SAS, currently on a federal contract identifying
          fraudulent providers billing Medicare. This site was built by me from
          scratch with React and Express. Take a look at my web development
          projects below 👇
        </p>
      </div>
    </div>
  );
}

export default About;
