import React from 'react';

import { Header, Footer } from '..';

function JuiceboxDoc() {
  return (
    <div className="siteFullWindow">
      <Header />
      <div className="main" id="jbDocMain">
        <div className="mainContainer">
          <div className="textContentContainer" id="indexTextContentContainer">
            <div className="indexTextContent"></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default JuiceboxDoc;
