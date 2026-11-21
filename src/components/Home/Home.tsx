import React, { useEffect, useRef } from 'react';
import { HomeContent, SiteContentContainer } from '..';

function Home() {
  useEffect(() => {
    document.title =
      'Homepage - Matthew Pelnik, Data Analyst, Databricks and Spark';
  }, []);

  return (
    <SiteContentContainer>
      <HomeContent />
    </SiteContentContainer>
  );
}

export default Home;
