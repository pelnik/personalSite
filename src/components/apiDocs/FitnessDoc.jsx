import React, { useEffect } from 'react';

import { HomeHeader, HomeFooter } from '..';

function FitnessDoc() {
  useEffect(() => {
    document.title = `Fitness Tracker API Documentation -
      Matthew Pelnik, Data Analyst and Web Developer - SAS, SQL, Matt Pelnik`;
  }, []);

  return (
    <div className="site-full-window">
      <HomeHeader />
      <div className="home-content-parent">
        <div className="doc-flex">
          <h2 className="section-title">Fitness Tracker API Documentation</h2>
          <p className="doc-text">
            Thanks for looking into my API documentation! The following will
            summarize <u>a few</u> of the various paths that can be accessed
            with my API. Throughout, I will give example you can copy to your
            Terminal in cURL, so that you can test my API yourself.
          </p>
          <p className="doc-text">
            First, the visual style of the documentation will represent
            different types of information. Text that looks like this are just
            informational.
          </p>
          <p className="doc-code">
            Text that looks like this have URL paths or API return code.
          </p>
          <p className="doc-curl">
            And lastly, these will show cURL commands you can copy paste to your
            Terminal to verify that my API is working, assuming you have cURL
            installed. These commands will work for Linux and MacOS, but may
            need to be modified a bit to work with Windows.
            <br />
            <br />
            <span className="important">
              For values in square brackets, &#91;&#93;, you will need to use
              your own value or it is optional in some cases. Most commonly it
              is for username, passwords and tokens.
            </span>
          </p>
          <hr />
          <h3 className="subsection-title">Registration</h3>
          <p className="doc-code">pelnik.dev/api/fitness/users/register</p>
          <p className="doc-text">
            You can get routines and activities without a user token, but to do
            most things, first you will need a user token. To register a user,
            you will need to send just a username and password.
          </p>
          <p className="doc-curl">
            curl https://pelnik.dev/api/fitness/users/register -X POST -H
            &quot;Content-Type: application/json&quot; -d &apos;&#123;
            &quot;username&quot;: &quot;&#91;FunGuy23&#93;&quot;,
            &quot;password&quot;: &quot;&#91;verysecure&#93;&quot;&#125;&apos;
          </p>
          <hr />
          <h3 className="subsection-title">Login</h3>
          <p className="doc-code">pelnik.dev/api/fitness/users/login</p>
          <p className="doc-text">
            You can get routines and activities without a user token, but to do
            most things, first you will need a user token. To login a user, you
            will need to send a username and password.
          </p>
          <p className="doc-curl">
            curl https://pelnik.dev/api/fitness/users/login -X POST -H
            &quot;Content-Type: application/json&quot; -d &apos;&#123;
            &quot;username&quot;: &quot;&#91;FunGuy23&#93;&quot;,
            &quot;password&quot;: &quot;&#91;verysecure&#93;&quot; &#125;&apos;
          </p>
          <hr />
          <h3 className="subsection-title">Get My Routines</h3>
          <p className="doc-code">pelnik.dev/api/fitness/users/me</p>
          <p className="doc-text">
            You can get you own public and private routines and activities that
            you have created, as well as the duration and count of each activity
            added to the routine.
          </p>
          <p className="doc-curl">
            curl https://pelnik.dev/api/fitness/users/me -H &quot;Content-Type:
            application/json&quot; &#91;-H &quot;Authorization: Bearer
            &#91;token&#93;&quot;&#93;
          </p>
          <hr />
          <h3 className="subsection-title">And Many More!</h3>
          <a
            href="https://github.com/pelnik/FitnessTracker"
            target="_blank"
            className="jbLink"
          >
            Click here to take look around at the back end repo I created
            directly!
          </a>
          <a
            href="https://github.com/pelnik/personalSite"
            className="jbLink"
            target="_blank"
          >
            All of these individual repos were modified and added to my personal
            site API.
          </a>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
}

export default FitnessDoc;
