import React from 'react';
import { useTasks } from '../context/TaskContext';

function getLocalDateString() {
  const date = new Date();
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];
}

export default function FocusDashboard() {
  const { activeDynamicTask, staticTasks, completeDynamicTask, completeStaticTask } = useTasks();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col min-h-[80vh]">
      
      {/* Primary Focus Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-12">
        <h2 className="text-zinc-500 uppercase tracking-widest text-xs font-semibold mb-8">
          Current Focus
        </h2>
        
        {activeDynamicTask ? (
          <div className="flex flex-col items-center w-full max-w-lg transition-all duration-500 p-4">
            <h1 className="text-3xl md:text-5xl font-light text-zinc-900 dark:text-zinc-100 text-center leading-tight mb-12 tracking-tight">
              {activeDynamicTask.title}
            </h1>
            <button 
              onClick={() => completeDynamicTask(activeDynamicTask.id)}
              className="group relative px-8 py-3 rounded-full overflow-hidden bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="relative z-10 font-medium">Mark Complete</span>
              <div className="absolute inset-0 bg-white/20 dark:bg-zinc-300/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border border-zinc-300 dark:border-zinc-800 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-light text-zinc-500 dark:text-zinc-400 mb-2">You're all caught up.</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Enjoy the silence.</p>
          </div>
        )}
      </section>

      {/* Secondary Routines Section */}
      <section className="w-full mt-12 border-t border-zinc-200 dark:border-zinc-900/50 pt-8">
        <h3 className="text-zinc-500 text-sm mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-700 block"></span>
          Daily Routines
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {staticTasks.filter(t => {
            if (t.startDate && t.startDate > getLocalDateString()) return false;
            return t.status === 'pending' || t.lastCompletedDate === getLocalDateString();
          }).map(task => {
            const isCompleted = task.status === 'completed';
            return (
              <button
                key={task.id}
                onClick={() => completeStaticTask(task.id)}
                disabled={isCompleted}
                className={`flex-1 min-w-[200px] flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isCompleted 
                    ? 'border-transparent bg-zinc-100 dark:bg-zinc-900/30 text-zinc-400 dark:text-zinc-600 cursor-default' 
                    : 'border-zinc-300 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isCompleted ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800' : 'border-zinc-400 dark:border-zinc-600'
                }`}>
                  {isCompleted && (
                    <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${isCompleted ? 'line-through decoration-zinc-300 dark:decoration-zinc-700' : ''}`}>
                  {task.title}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  );
}
