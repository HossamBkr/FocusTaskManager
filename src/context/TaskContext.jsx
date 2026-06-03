import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export function useTasks() {
  return useContext(TaskContext);
}

// Helper to get local date string YYYY-MM-DD
function getLocalDateString() {
  const date = new Date();
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];
}

const mockInitialState = {
  dynamicTasks: [
    { id: 'd1', title: 'Finish Q3 Report', priority: 2.5, date: '2026-06-02', status: 'pending' },
    { id: 'd2', title: 'Schedule Dentist Appointment', priority: 4.0, date: getLocalDateString(), status: 'pending' },
    { id: 'd3', title: 'Fix critical bug in auth flow', priority: 1.1, date: getLocalDateString(), status: 'pending' },
  ],
  staticTasks: [
    { id: 's1', title: 'Morning Stretch', status: 'completed' },
    { id: 's2', title: 'Read 10 pages', status: 'pending' },
    { id: 's3', title: 'Drink 2L Water', status: 'pending' }
  ],
  backlog: [],
  lastEvaluatedDate: '2026-06-02'
};

export function TaskProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('focus_tasks_state');
    if (saved) {
      return JSON.parse(saved);
    }
    return mockInitialState;
  });

  useEffect(() => {
    const todayStr = getLocalDateString();
    
    if (state.lastEvaluatedDate !== todayStr) {
      let newState = { ...state };
      
      // 1. Reset static tasks
      newState.staticTasks = newState.staticTasks.map(t => ({ ...t, status: 'pending' }));
      
      // 2. Roll over dynamic tasks
      newState.dynamicTasks = newState.dynamicTasks.map(t => {
        if (t.status === 'pending' && t.date < todayStr) {
          return { ...t, date: todayStr };
        }
        return t;
      });
      
      // 3. Limit and Backlog logic
      const todaysPending = newState.dynamicTasks.filter(t => t.status === 'pending' && t.date === todayStr);
      if (todaysPending.length > 10) {
        todaysPending.sort((a, b) => a.priority - b.priority);
        
        const toBacklogIds = new Set(todaysPending.slice(10).map(t => t.id));
        
        const toBacklogTasks = newState.dynamicTasks.filter(t => toBacklogIds.has(t.id));
        newState.backlog = [...newState.backlog, ...toBacklogTasks];
        
        newState.dynamicTasks = newState.dynamicTasks.filter(t => !toBacklogIds.has(t.id));
      }
      
      newState.lastEvaluatedDate = todayStr;
      setState(newState);
      localStorage.setItem('focus_tasks_state', JSON.stringify(newState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('focus_tasks_state', JSON.stringify(state));
  }, [state]);

  const completeDynamicTask = (id) => {
    setState(prev => ({
      ...prev,
      dynamicTasks: prev.dynamicTasks.map(t => 
        t.id === id ? { ...t, status: 'completed' } : t
      )
    }));
  };

  const completeStaticTask = (id) => {
    setState(prev => ({
      ...prev,
      staticTasks: prev.staticTasks.map(t => 
        t.id === id ? { ...t, status: 'completed' } : t
      )
    }));
  };

  const addDynamicTask = (task) => {
    setState(prev => ({
      ...prev,
      dynamicTasks: [...prev.dynamicTasks, {
        ...task,
        id: `d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending'
      }]
    }));
  };

  const deleteDynamicTask = (id) => {
    setState(prev => ({
      ...prev,
      dynamicTasks: prev.dynamicTasks.filter(t => t.id !== id)
    }));
  };

  const addStaticTask = (title) => {
    setState(prev => ({
      ...prev,
      staticTasks: [...prev.staticTasks, {
        id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        status: 'pending'
      }]
    }));
  };

  const deleteStaticTask = (id) => {
    setState(prev => ({
      ...prev,
      staticTasks: prev.staticTasks.filter(t => t.id !== id)
    }));
  };

  const reorderStaticTasks = (activeId, overId) => {
    setState(prev => {
      const oldIndex = prev.staticTasks.findIndex(t => t.id === activeId);
      const newIndex = prev.staticTasks.findIndex(t => t.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = [...prev.staticTasks];
        const [movedItem] = newTasks.splice(oldIndex, 1);
        newTasks.splice(newIndex, 0, movedItem);
        return { ...prev, staticTasks: newTasks };
      }
      return prev;
    });
  };

  const getTodayActiveDynamicTask = () => {
    const todayStr = getLocalDateString();
    const todaysPending = state.dynamicTasks.filter(t => t.status === 'pending' && t.date === todayStr);
    if (todaysPending.length === 0) return null;
    
    // Lowest float = highest priority
    todaysPending.sort((a, b) => a.priority - b.priority);
    return todaysPending[0];
  };

  const getTodayStaticTasks = () => {
    return state.staticTasks;
  };

  return (
    <TaskContext.Provider value={{
      state,
      completeDynamicTask,
      completeStaticTask,
      addDynamicTask,
      deleteDynamicTask,
      addStaticTask,
      deleteStaticTask,
      reorderStaticTasks,
      activeDynamicTask: getTodayActiveDynamicTask(),
      staticTasks: getTodayStaticTasks()
    }}>
      {children}
    </TaskContext.Provider>
  );
}
