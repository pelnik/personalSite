import React from 'react';

import { Header, Footer } from '..';

function JuiceboxDoc() {
  return (
    <div className="siteFullWindow">
      <Header />
      <div className="main" id="jbDocMain">
        <div className="mainContainer" id="jb-main-container">
          <div className="textContentContainer" id="indexTextContentContainer">
            <div className="indexTextContent">
              <h1>Juicebox API Documentation</h1>
              <p className="jbText">
                Thanks for looking into my API documentation! The following will
                showcase the various paths that can be accessed with my API.
                Throughout, I will give example you can copy to your Terminal in
                cURL, so that you can test my API yourself.
              </p>
              <p className="jbText">
                First, the visual style of the documentation will represent
                different types of information. Text bubbles that look like this
                are just informational.
              </p>
              <p className="jbCode">
                Text bubbles that look like this have URL paths or API return
                code.
              </p>
              <p className="jbCurl">
                And lastly, these will show cURL commands you can copy paste to
                your Terminal to verify that my API is working, assuming you
                have cURL installed. These commands will work for Linux and
                MacOS, but may need to be modified a bit to work with Windows.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default JuiceboxDoc;
