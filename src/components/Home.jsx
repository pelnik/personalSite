import React from 'react';

function Home() {
  return (
    <main className="main" id="indexMain">
      <div className="mainContainer">
        <div id="indexTextContentContainer">
          <div className="indexTextContent">
            <h1>👋 Welcome to my page!</h1>
            <p>
              👉 My name is Matt Pelnik and welcome to my personal site. I&apos;m a
              web software engineer based out of Tulsa, OK. I have an
              engineering background with and have worked in tech, healthcare,
              and energy. Please have a look at my portfolio and about section
              to learn more about me.
            </p>
            <p>
              👉 I&apos;ve worked previously with Oracle in their healthcare group
              as a business analyst building low code automation systems. I
              wanted to move my interest to a career and code fulltime, and
              I&apos;d love to talk.
            </p>
          </div>
        </div>
        <div className="indexIMGContainer">
          <img
            src="/Media/main/Professional pic.jpg"
            className="professionalPicMain rightFlexIMG"
            alt="Matt Pelnik"
          />
        </div>
      </div>
    </main>

  );
}

export default Home;
