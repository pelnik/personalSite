import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home, NotFound, MainAbout, AboutStats } from '.';
import { LoginPage } from './Auth';
import '../css/site.css';

// Loaded on demand, so the homepage doesn't download the demo apps (and the
// MUI components they use). These import modules directly rather than through
// the barrel, which would pull everything into one chunk.
const Snake = lazy(() => import('./portfolio/snake/Snake'));
const JuiceboxDoc = lazy(() => import('./apiDocs/JuiceboxDoc'));
const FitnessDoc = lazy(() => import('./apiDocs/FitnessDoc'));
const StrangerMain = lazy(() => import('../fullReactProjects/stranger/src/components/StrangerMain'));
const JuiceboxMain = lazy(() => import('../fullReactProjects/juicebox/components/JuiceboxMain'));
const FitnessMain = lazy(() => import('../fullReactProjects/FitnessTrackerFrontEnd/src/components/Main'));

function Main() {
  return (
    <main className="full-window">
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<MainAbout />}>
            <Route path="stats" element={<AboutStats />} />
          </Route>
          <Route path="/portfolio" element={<Home />} />
          <Route path="/snake" element={<Snake />} />
          <Route path="/stranger/*" element={<StrangerMain />} />
          <Route path="/juicebox/*" element={<JuiceboxMain />} />
          <Route path="/api/juicebox/docs" element={<JuiceboxDoc />} />
          <Route path="/api/fitness/docs" element={<FitnessDoc />} />
          <Route path="/fitness/*" element={<FitnessMain />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
  );
}

export default Main;
