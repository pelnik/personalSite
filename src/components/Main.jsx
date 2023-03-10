import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home, About, Header, Footer, Portfolio, Snake, NotFound } from '.';
import { JuiceboxMain } from '../fullReactProjects/juicebox/components';

function Main() {
  const homeRoutes = ['/', '/about', '/portfolio'];
  const otherRoutes = ['/snake', '/juicebox/*'];

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
        {otherRoutes.map((route, idx) => (
          <Route path={route} element={null} key={`otherRouteHeader ${idx}`} />
        ))}
        <Route path="*" element={<Header />} />
      </Routes>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/juicebox/*" element={<JuiceboxMain />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Routes>
        {homeRoutes.map((route, idx) => (
          <Route
            path={route}
            element={<Footer />}
            key={`homeRouteFooter ${idx}`}
          />
        ))}
        {otherRoutes.map((route, idx) => (
          <Route path={route} element={null} key={`otherRouteFooter ${idx}`} />
        ))}
        <Route path="*" element={<Footer />} />
      </Routes>
    </div>
  );
}

export default Main;
