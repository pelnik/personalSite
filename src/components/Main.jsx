import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home, About, Header, Footer, Portfolio, Snake, NotFound } from '.';
import { JuiceboxMain } from '../fullReactProjects/juicebox/components';

function Main() {
  return (
    <main className="fullWindow">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/juicebox/*" element={<JuiceboxMain />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default Main;
