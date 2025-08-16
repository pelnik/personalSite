import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home, Snake, NotFound, JuiceboxDoc, FitnessDoc } from '.';
import '../css/site.css';
import { JuiceboxMain } from '../fullReactProjects/juicebox/components';
import { StrangerMain } from '../fullReactProjects/stranger/src/components';
import { FitnessMain } from '../fullReactProjects/FitnessTrackerFrontEnd/src/components';

function Main() {
  return (
    <main className="full-window">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Home />} />
        <Route path="/portfolio" element={<Home />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/stranger/*" element={<StrangerMain />} />
        <Route path="/juicebox/*" element={<JuiceboxMain />} />
        <Route path="/api/juicebox/docs" element={<JuiceboxDoc />} />
        <Route path="/api/fitness/docs" element={<FitnessDoc />} />
        <Route path="/fitness/*" element={<FitnessMain />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default Main;
