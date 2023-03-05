import React, { useEffect } from 'react';
import '../css/site.css';

function About() {
  useEffect(() => {
    document.title = 'About Me - Matthew Pelnik, Full Stack Web Software Engineer';
  }, []);

  return (
    <main className="main" id="aboutMain">
      <div className="mainContainer">
        <div id="indexTextContentContainer">
          <div className="indexTextContent">
            <h1>About me</h1>
            <p>
              I&apos;m a full stack web software engineer open to relocating and working
              on-site or remotely. I previously received my chemical
              engineering degree and went to work with an energy company in
              Tulsa. While there, I found my passion for technology systems,
              initially starting with business intelligence reports where I
              created automated reporting from various systems. I have since
              worked on &quot;low code&quot; user interface platforms to generate online
              user entry forms, built automation systems at Oracle for a
              federal contract deliverables tracking system, and coded in
              the data language SAS and SQL full-time, as well as Power Query
              M and DAX.
            </p>
            <p>
              My goal is to take the next step and advance my passion and
              technical background further through a full-time software
              development position. Please have a look at my portfolio.
            </p>
            <p>
              In my free time, I like doing anything active, running and
              biking particularly. If I get a chance I will take a trip to go
              hiking since there is not a lot near me. I&apos;m in a kickball rec
              league and enjoy a good trivia night with friends.
            </p>
            <p>
              Please feel free to reach out to me at any time at (918)
              798-2238 or matt@pelnik.dev.
            </p>
          </div>
        </div>
        <div className="aboutIMGContainer">
          <img src="/Media/main/Professional pic.jpg" className="professionalPicMain rightFlexIMG" alt="Matt Pelnik professional pic" />
          <img src="/Media/main/about_Colorado_pic.jpeg" className="rightFlexIMG" id="aboutColoradoPic" alt="Colorado trip" />
          <img src="/Media/main/about_kickball_pic.JPG" className="rightFlexIMG" id="aboutKickballPic" alt="kickball team" />
        </div>
      </div>
    </main>
  );
}

export default About;
