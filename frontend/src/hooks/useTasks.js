import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { toast } from 'sonner';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const { request, loading } = useApi();

  const fetchTasks = useCallback(async () => {
    const res = await request('/tasks');
    if (res?.success) {
      setTasks(res.data);
    }
  }, [request]);

  const moveTask = async (taskId, newStatus) => {
    // OPTIMISTIC UPDATE: Move UI immediately for a "snappy" Jira feel
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    const res = await request(`/tasks/${taskId}`, 'PATCH', { status: newStatus });
    
    if (!res?.success) {
      setTasks(previousTasks); // Rollback if the backend fails
      toast.error("Failed to sync card position");
    }
  };

  const quickAdd = async (status, title) => {
    const res = await request('/tasks', 'POST', { 
      title, 
      status, 
      priority: 'MEDIUM',
      category: 'Ops' 
    });
    
    if (res?.success) {
      setTasks(prev => [...prev, res.data]);
      toast.success("Task created");
    }
  };

  return { tasks, loading, fetchTasks, moveTask, quickAdd, setTasks };
};