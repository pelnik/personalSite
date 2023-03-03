import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Home,
  About,
  Header,
  Footer,
} from '.';

function Main() {
  const homeRoutes = ['*', '/about', '/portfolio'];

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
      </Routes>
      <Routes>
        <Route path="*" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Routes>
        {homeRoutes.map((route, idx) => (
          <Route
            path={route}
            element={<Footer />}
            key={`homeRouteFooter ${idx}`}
          />
        ))}
      </Routes>
    </div>
  );
}

export default Main;
