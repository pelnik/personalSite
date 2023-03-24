import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Home,
  About,
  Portfolio,
  Snake,
  NotFound,
  JuiceboxDoc,
  FitnessDoc,
} from '.';
import { JuiceboxMain } from '../fullReactProjects/juicebox/components';
import { StrangerMain } from '../fullReactProjects/stranger/src/components';
import { FitnessMain } from '../fullReactProjects/FitnessTrackerFrontEnd/src/components';

function Main() {
  return (
    <main className="fullWindow">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
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
