import React, { useEffect } from 'react';
import { Header, HomeContent, Footer } from '.';

function Home() {
  useEffect(() => {
    document.title =
      'Homepage - Matthew Pelnik, Full Stack Web Software Engineer';
  }, []);

  return (
    <div className="siteFullWindow">
      <Header />
      <HomeContent />
      <Footer />
    </div>
  );
}

export default Home;
