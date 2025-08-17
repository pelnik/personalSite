import React, { useEffect, useRef } from 'react';
import { SiteHeader, HomeContent, SiteFooter } from '..';

function Home() {
  useEffect(() => {
    document.title =
      'Homepage - Matthew Pelnik, Data Analyst and Web Developer - SAS, SQL, Matt Pelnik';
  }, []);

  return (
    <div className="site-full-window">
      <SiteHeader />
      <HomeContent />
      <SiteFooter />
    </div>
  );
}

export default Home;
