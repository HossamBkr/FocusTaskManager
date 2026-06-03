import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navigation() {
  const linkClass = ({ isActive }) => 
    `text-sm font-medium transition-colors px-5 py-2 rounded-full ${
      isActive 
        ? 'text-zinc-900 bg-white dark:text-zinc-100 dark:bg-zinc-800/80 shadow-sm' 
        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
    }`;

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/80 rounded-full shadow-2xl">
        <NavLink to="/" className={linkClass}>
          Focus
        </NavLink>
        <NavLink to="/planner" className={linkClass}>
          Planner
        </NavLink>
        <NavLink to="/routines" className={linkClass}>
          Routines
        </NavLink>
      </div>
    </nav>
  );
}
