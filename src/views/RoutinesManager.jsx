import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
      <div className="flex items-center gap-3">
        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
        </svg>
        <span className="text-zinc-700 dark:text-zinc-300">{task.title}</span>
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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

  const isAtLimit = staticTasks.length >= 12;

  const handleAdd = (e) => {
    e.preventDefault();
    if (newRoutine.trim() && !isAtLimit) {
      addStaticTask(newRoutine.trim());
      setNewRoutine('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-light text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">Daily Routines</h1>
      
      <form onSubmit={handleAdd} className="flex gap-3 mb-10">
        <input 
          type="text" 
          value={newRoutine}
          onChange={(e) => setNewRoutine(e.target.value)}
          placeholder={isAtLimit ? "Limit reached (12 max)" : "New daily routine..."}
          maxLength={50}
          disabled={isAtLimit}
          className="flex-1 border rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors bg-white dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-800 disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!newRoutine.trim() || isAtLimit}
          className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Add
        </button>
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
