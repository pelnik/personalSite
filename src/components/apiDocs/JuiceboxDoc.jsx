import React from 'react';

import { Header, Footer } from '..';

function JuiceboxDoc() {
  return (
    <div className="siteFullWindow">
      <Header />
      <div className="main" id="jbDocMain">
        <div className="mainContainer" id="jb-main-container">
          <div className="textContentContainer" id="indexTextContentContainer">
            <div className="indexTextContent api-text-content">
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
                <br />
                <br />
                <span className="important">
                  For values in curly braces, &#91;&#93;, you will need to use
                  your own value. Most commonly usernames and tokens.
                </span>
              </p>
              <hr className="api-rule" />
              <h2>Registration</h2>
              <p className="jbCode">pelnik.dev/api/juicebox/register</p>
              <p className="jbText">
                You can get posts without a user token, but to do most things,
                first you will need a user token.
              </p>
              <p className="jbCurl">
                curl https://pelnik.dev/api/juicebox/users/register -X POST -H
                &quot;Content-Type: application/json&quot; -d &apos;&#123;
                &quot;username&quot;: &quot;&#91;FunGuy23&#93;&quot;,
                &quot;password&quot;: &quot;&#91;verysecure&#93;&quot;,
                &quot;name&quot;: &quot;&#91;Billy&#93;&quot;,
                &quot;location&quot;: &quot;&#91;Kansas&#93;&quot; &#125;&apos;
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
