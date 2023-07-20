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
import '../css/site-redesign.css';
import { JuiceboxMain } from '../fullReactProjects/juicebox/components';
import { StrangerMain } from '../fullReactProjects/stranger/src/components';
import { FitnessMain } from '../fullReactProjects/FitnessTrackerFrontEnd/src/components';

let loads = 0;

function Main() {
  loads += 1;
  console.log('loads', loads);

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
