import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { DndContext, closestCenter, KeyboardSensor, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableDynamicItem({ task, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors gap-4 cursor-grab active:cursor-grabbing"
    >
      <div className="flex-1">
        <h3 className="text-zinc-900 dark:text-zinc-200 font-medium text-sm mb-1 break-words whitespace-pre-wrap">{task.title}</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {task.date}
          </span>
        </div>
      </div>
      <button 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(task.id)}
        className="text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 sm:-mr-2 self-start sm:self-center cursor-pointer"
        aria-label="Delete task"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default function Planner() {
  const { state, addDynamicTask, deleteDynamicTask, reorderDynamicTasks } = useTasks();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

  const pendingTasks = state.dynamicTasks
    .filter(t => t.status === 'pending')
    .sort((a, b) => {
      // Sort ONLY by Date ascending
      // If dates match, do NOT sort. We rely on the natural array index for priority order.
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return 0;
    });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      reorderDynamicTasks(active.id, over.id);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (title.trim() && date) {
      addDynamicTask({
        title: title.trim(),
        date
      });
      setTitle('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col h-[85vh]">
      <h1 className="text-3xl font-light text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">Planner</h1>
      
      <form onSubmit={handleAdd} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-8 shrink-0">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">Create Task</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            maxLength={400}
            className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            required
          />
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full md:w-40 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
            required
          />
          <button 
            type="submit"
            disabled={!title.trim() || !date}
            className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Add Task
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        <h2 className="text-sm font-medium text-zinc-500 mb-4 sticky top-0 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur py-2 z-10">Pipeline</h2>
        <div className="space-y-3">
          {pendingTasks.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-600 text-sm py-4">No tasks in the pipeline.</p>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={pendingTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {pendingTasks.map(task => (
                  <SortableDynamicItem 
                    key={task.id} 
                    task={task} 
                    onDelete={deleteDynamicTask} 
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
