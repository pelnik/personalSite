import React, { useEffect, useRef } from 'react';
import { HomeHeader, HomeContent, HomeFooter } from '.';

function Home() {
  const portfolioRef = useRef(null);

  useEffect(() => {
    document.title =
      'Homepage - Matthew Pelnik, Data Analyst and Full Stack Web Developer';
  }, []);

  return (
    <div className="site-full-window">
      <HomeHeader portfolioRef={portfolioRef} />
      <HomeContent portfolioRef={portfolioRef} />
      <HomeFooter />
    </div>
  );
}

export default Home;
