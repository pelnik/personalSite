import React, { useEffect, useRef } from 'react';
import { HomeContent, SiteContentContainer } from '..';

function Home() {
  useEffect(() => {
    document.title =
      'Homepage - Matthew Pelnik, Data Analyst and Web Developer - SAS, SQL, Matt Pelnik';
  }, []);

  return (
    <SiteContentContainer>
      <HomeContent />
    </SiteContentContainer>
  );
}

export default Home;
