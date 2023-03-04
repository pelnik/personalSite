import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Home,
  About,
  Header,
  Footer,
  Portfolio,
  Snake,
} from '.';

function Main() {
  const homeRoutes = ['/', '/about', '/portfolio'];

  return (
    <div className="fullWindow">
      <Routes>
        {homeRoutes.map((route, idx) => (
          <Route
            path={route}
            element={<Header />}
            key={`homeRouteHeader ${idx}`}
          />
        ))}
        <Route path="*" element={null} />
      </Routes>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="*" element={null} />
      </Routes>
      <Routes>
        {homeRoutes.map((route, idx) => (
          <Route
            path={route}
            element={<Footer />}
            key={`homeRouteFooter ${idx}`}
          />
        ))}
        <Route path="*" element={null} />
      </Routes>
    </div>
  );
}

export default Main;
