import React, { useEffect } from 'react';
import './deucesStyle.css';

function Deuces() {
  useEffect(() => {
    const scriptTag = document.createElement('script');

    scriptTag.src = '/legacyJS/deucesGame.js';
    scriptTag.defer = true;
    scriptTag.type = 'module';

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  });

  return (
    <div id="fullWindow">
      <div id="aboutFullTextParent">
        <img id="aboutClose" src="/Media/deuces/close-line-icon.svg" alt="close button" />
        <h2>About</h2>
        <p id="aboutFullText">
          This is a replication of the video poker game Deuces Wild, inspired by
          a trip with friends to Las Vegas. This is my first web development
          project coded from scratch with no outside project guide or help aside
          from language reference documents, and it is coded purely in vanilla
          HTML, CSS, and Javascript. I did not want to use other frameworks, so
          I could get familiar with the fundamentals before implementing other
          resources. My full commit history is available
          at <a href="github.com/pelnik"> my GitHub</a>.
          <br />
          <br />
          <span className="attribution">
            Credit for card graphics to Xiong from Wikimedia Commons.
            <br />
            Other icons and graphics used through no attribution licenses from
            uxwing.com.
          </span>
        </p>
      </div>
      <div id="fullWindowGrid">
        <div id="leftSideParent">
          <img src="/Media/deuces/2 Hearts logo.png" id="logo" alt="deuces logo" />
          <p id="aboutButton">About</p>
          <div className="gameBoard">
            <div id="playGameParent">
              <button type="button" id="playGame">
                Play Game!
              </button>
              <br />
              <br />
              <br />
            </div>

            {/* Parent button for images that will be added through JS */}
            <div id="imageParent" />

            <div id="parentSubmitButton">
              <button type="button" id="submitButton">Submit!</button>
            </div>
          </div>
        </div>

        <div id="fullSidebarContainer">
          <img
            src="/Media/deuces/right-angle-arrow-bold-icon.svg"
            id="sidebarArrow"
            alt="sidebar opener"
          />
          <div className="scoreSidebar">
            <div id="sidebarHeaderContainer">
              <h1 id="sidebarMainHeader">Scoring Sidebar</h1>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Deuces;
