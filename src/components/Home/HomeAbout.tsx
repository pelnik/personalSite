import React from 'react';

function HomeAbout() {
  return (
    <div id="about-parent">
      <div id="about-pic-flex">
        <img className="personal-pic" src="/Media/main/personal_pic.jpg" />
        <p className="about-text">
          Hi, thank you for visiting my site! I’m Matt, a Data Analyst using
          Databricks, Python, and Spark to detect provider fraud for Medicare.
          This is my personal site. Feel free to look around!
        </p>
      </div>
    </div>
  );
}

export default HomeAbout;
