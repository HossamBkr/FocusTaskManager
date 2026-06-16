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
    { id: 'd1', title: 'Finish Q3 Report', date: '2026-06-02', status: 'pending' },
    { id: 'd2', title: 'Schedule Dentist Appointment', date: getLocalDateString(), status: 'pending' },
    { id: 'd3', title: 'Fix critical bug in auth flow', date: getLocalDateString(), status: 'pending' },
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
      newState.staticTasks = newState.staticTasks.map(t => {
        if (!t.lastCompletedDate) {
          return { ...t, status: 'pending' };
        }
        
        const lastDate = new Date(t.lastCompletedDate + 'T00:00:00');
        const today = new Date(todayStr + 'T00:00:00');
        const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= (t.frequency || 1)) {
          return { ...t, status: 'pending' };
        }
        return t;
      });
      
      // 2. Roll over dynamic tasks
      const rolledOver = [];
      const others = [];
      
      newState.dynamicTasks.forEach(t => {
        if (t.status === 'pending' && t.date < todayStr) {
          rolledOver.push({ ...t, date: todayStr });
        } else {
          others.push(t);
        }
      });
      
      // Prepend rolled over tasks so they have highest priority
      newState.dynamicTasks = [...rolledOver, ...others];
      
      // 3. Limit and Backlog logic
      const todaysPending = newState.dynamicTasks.filter(t => t.status === 'pending' && t.date === todayStr);
      if (todaysPending.length > 10) {
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
        t.id === id ? { ...t, status: 'completed', lastCompletedDate: getLocalDateString() } : t
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

  const editDynamicTask = (id, newTitle) => {
    setState(prev => ({
      ...prev,
      dynamicTasks: prev.dynamicTasks.map(t => 
        t.id === id ? { ...t, title: newTitle } : t
      )
    }));
  };

  const deleteDynamicTask = (id) => {
    setState(prev => ({
      ...prev,
      dynamicTasks: prev.dynamicTasks.filter(t => t.id !== id)
    }));
  };

  const reorderDynamicTasks = (activeId, overId) => {
    setState(prev => {
      const oldIndex = prev.dynamicTasks.findIndex(t => t.id === activeId);
      const newIndex = prev.dynamicTasks.findIndex(t => t.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = [...prev.dynamicTasks];
        const [movedItem] = newTasks.splice(oldIndex, 1);
        newTasks.splice(newIndex, 0, movedItem);
        return { ...prev, dynamicTasks: newTasks };
      }
      return prev;
    });
  };

  const addStaticTask = (title, frequency = 1) => {
    setState(prev => ({
      ...prev,
      staticTasks: [...prev.staticTasks, {
        id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        status: 'pending',
        frequency,
        lastCompletedDate: null
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
    
    // Implicit priority: The first item in the array is the highest priority
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
      editDynamicTask,
      deleteDynamicTask,
      reorderDynamicTasks,
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
