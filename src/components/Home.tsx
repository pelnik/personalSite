import React, { useEffect, useRef } from 'react';
import { HomeHeader, HomeContent, HomeFooter } from '.';

function Home() {
  useEffect(() => {
    document.title =
      'Homepage - Matthew Pelnik, Data Analyst and Web Developer - SAS, SQL, Matt Pelnik';
  }, []);

  return (
    <div className="site-full-window">
      <HomeHeader />
      <HomeContent />
      <HomeFooter />
    </div>
  );
}

export default Home;
