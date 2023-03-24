import React, { useEffect } from 'react';
import { HomeHeader, HomeContent, HomeFooter } from '.';

function Home() {
  useEffect(() => {
    document.title =
      'Homepage - Matthew Pelnik, Full Stack Web Software Engineer';
  }, []);

  return (
    <div className="siteFullWindow">
      <HomeHeader />
      <HomeContent />
      <HomeFooter />
    </div>
  );
}

export default Home;
