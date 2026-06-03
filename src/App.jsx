import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import FocusDashboard from './views/FocusDashboard';
import Planner from './views/Planner';
import RoutinesManager from './views/RoutinesManager';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <HashRouter>
          <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 selection:bg-zinc-300 dark:selection:bg-zinc-800 transition-colors duration-300">
            <ThemeToggle />
            <main className="pb-32">
              <Routes>
                <Route path="/" element={<FocusDashboard />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/routines" element={<RoutinesManager />} />
              </Routes>
            </main>
            <Navigation />
          </div>
        </HashRouter>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
