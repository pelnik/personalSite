import React from 'react';

function MainAbout() {
  return (
    <div id="about-parent">
      <div id="about-pic-flex">
        <img className="personal-pic" src="/Media/main/personal_pic.jpg" />
        <p className="about-text">
          👋 Hi there, thank you for visiting my site! I’m Matt, a Business
          Intelligence Analyst in Institutional Research at Tulsa Community
          College. I use Python and SQL to turn institutional data into reports
          and analyses that support student and faculty success, operations, and
          compliance.
          <br />
          <br />
          👇 This site was built by me from scratch with React and Express. View
          my web development projects below.
        </p>
      </div>
    </div>
  );
}

export default MainAbout;
