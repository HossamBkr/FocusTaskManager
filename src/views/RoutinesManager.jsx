import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { DndContext, closestCenter, KeyboardSensor, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function getLocalDateString() {
  const date = new Date();
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];
}

function SortableRoutineItem({ task, onDelete }) {
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
      className="flex items-center justify-between p-4 rounded-2xl group transition-colors cursor-grab active:cursor-grabbing border bg-white/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
        </svg>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center min-w-0">
          <span className="text-zinc-700 dark:text-zinc-300 break-words whitespace-pre-wrap">{task.title}</span>
          {(task.frequency > 1 || (task.startDate && task.startDate > getLocalDateString())) && (
            <span className="inline-flex items-center justify-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full mt-1 sm:mt-0 sm:ml-2 whitespace-nowrap self-start sm:self-center">
              {(task.startDate && task.startDate > getLocalDateString()) ? `Starts ${task.startDate} • ` : ''}Every {task.frequency || 1} days
            </span>
          )}
        </div>
      </div>
      <button 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(task.id)}
        className="text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 -mr-2 cursor-pointer"
        aria-label="Delete routine"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default function RoutinesManager() {
  const { staticTasks, addStaticTask, deleteStaticTask, reorderStaticTasks } = useTasks();
  const [newRoutine, setNewRoutine] = useState('');
  const [newFrequency, setNewFrequency] = useState(1);
  const [startDate, setStartDate] = useState(getLocalDateString());

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
      reorderStaticTasks(active.id, over.id);
    }
  };

  const isAtLimit = staticTasks.length >= 18;

  const handleAdd = (e) => {
    e.preventDefault();
    if (newRoutine.trim() && !isAtLimit) {
      addStaticTask(newRoutine.trim(), parseInt(newFrequency) || 1, startDate);
      setNewRoutine('');
      setNewFrequency(1);
      setStartDate(getLocalDateString());
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-light text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">Daily Routines</h1>
      
      <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-10">
        <div className="flex gap-3 w-full">
          <input 
            type="text" 
            value={newRoutine}
            onChange={(e) => setNewRoutine(e.target.value)}
            placeholder={isAtLimit ? "Limit reached (18 max)" : "New daily routine..."}
            maxLength={400}
            disabled={isAtLimit}
            className="flex-1 border rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors bg-white dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-800 disabled:opacity-50 min-w-[120px]"
          />
        </div>
        <div className="flex gap-3 w-full overflow-x-auto pb-1 sm:pb-0">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isAtLimit}
            className="w-36 shrink-0 bg-white dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none transition-colors dark:[color-scheme:dark]"
            required
          />
          <div className="flex items-center gap-2 border rounded-xl px-3 py-3 bg-white dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-800 shrink-0">
            <span className="text-sm text-zinc-500 whitespace-nowrap">Every</span>
            <input 
              type="number" 
              min="1" 
              max="30"
              value={newFrequency}
              onChange={(e) => setNewFrequency(e.target.value)}
              onBlur={(e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 30) val = 30;
                setNewFrequency(val);
              }}
              disabled={isAtLimit}
              className="w-10 text-center bg-transparent text-zinc-900 dark:text-zinc-200 focus:outline-none disabled:opacity-50 dark:[color-scheme:dark] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-zinc-500 whitespace-nowrap">days</span>
          </div>
          <button 
            type="submit"
            disabled={!newRoutine.trim() || isAtLimit}
            className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 ml-auto sm:ml-0"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {staticTasks.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-8">No routines added yet.</p>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={staticTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {staticTasks.map(task => (
                <SortableRoutineItem 
                  key={task.id} 
                  task={task} 
                  onDelete={deleteStaticTask} 
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
