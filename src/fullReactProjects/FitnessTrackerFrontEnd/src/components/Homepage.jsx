import React from 'react';
import { default as Logo } from '../Media/Logo';

function Homepage() {
  return (
    <div className="main-content" id="homepage">
      <div id="homepage-logo">
        <Logo />
        <h1>Fitness Trackr</h1>
      </div>
      <div id="homepage-text-content">
        <p>The place for all of your exercise routines.</p>
        <p>
          Look at our public routines and activities by clicking the tabs above.
        </p>
        <p>
          Then register to make your own public or private routines and
          activities!
        </p>
      </div>
      <div id="attr">Icon from www.wishforge.games</div>
    </div>
  );
}

export default Homepage;
