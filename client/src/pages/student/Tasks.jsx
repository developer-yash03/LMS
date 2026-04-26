import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiClock, FiCheckCircle, FiChevronRight, FiAlertCircle, FiBook } from 'react-icons/fi';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './Tasks.css';

const Tasks = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [movingTask, setMovingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // TODO: Backend Integration - Fetch student's tasks
        // Expected API: GET /api/students/tasks
        // Response should contain:
        // {
        //   tasks: [{
        //     _id,
        //     title,
        //     description,
        //     status,
        //     dueDate,
        //     courseName,
        //     priority,
        //     createdAt
        //   }]
        // }
        const data = await apiRequest('/students/tasks', 'GET');
        const allTasks = data?.tasks || [];
        
        setTasks({
          todo: allTasks.filter(t => t.status === 'todo'),
          inProgress: allTasks.filter(t => t.status === 'inProgress'),
          completed: allTasks.filter(t => t.status === 'completed')
        });
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const moveTask = async (taskId, newStatus) => {
    setMovingTask(taskId);
    try {
      // TODO: Backend Integration - Update task status
      // Expected API: PUT /api/students/tasks/:id
      // Body: { status: 'todo' | 'inProgress' | 'completed' }
      // Response: { success: true, task: updatedTask }
      const result = await apiRequest(`/students/tasks/${taskId}`, 'PUT', { status: newStatus });
      
      const updatedTask = result?.task;
      if (!updatedTask) return;
        
      setTasks(prev => ({
        todo: newStatus === 'todo' ? [...prev.todo, updatedTask] : prev.todo.filter(t => t._id !== taskId),
        inProgress: newStatus === 'inProgress' ? [...prev.inProgress, updatedTask] : prev.inProgress.filter(t => t._id !== taskId),
        completed: newStatus === 'completed' ? [...prev.completed, updatedTask] : prev.completed.filter(t => t._id !== taskId)
      }));
    } catch (error) {
      console.error('Failed to move task:', error);
    } finally {
      setMovingTask(null);
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: { background: '#fef2f2', color: '#dc2626' },
      medium: { background: '#fef3c7', color: '#d97706' },
      low: { background: '#dcfce7', color: '#16A34A' }
    };
    return styles[priority] || styles.low;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const TaskCard = ({ task, currentColumn }) => {
    const otherColumns = [
      { key: 'todo', label: 'To Do' },
      { key: 'inProgress', label: 'In Progress' },
      { key: 'completed', label: 'Completed' }
    ].filter(c => c.key !== currentColumn);

    return (
      <div className="task-card-auth">
        <div className="task-priority-bar-auth" style={{ background: getPriorityBadge(task.priority).color }} />
        
        <div className="task-content-auth">
          <div className="task-header-auth">
            <span 
              className="task-priority-tag-auth"
              style={getPriorityBadge(task.priority)}
            >
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="task-due-auth">
                <FiClock size={12} /> {formatDate(task.dueDate)}
              </span>
            )}
          </div>
          
          <h4 className="task-title-auth">{task.title}</h4>
          
          {task.description && (
            <p className="task-desc-auth">{task.description}</p>
          )}
          
          <div className="task-meta-auth">
            <span className="task-course-tag-auth"><FiBook size={12} /> {task.courseName || 'General'}</span>
          </div>
        </div>
        
        <div className="task-moves-auth">
          {otherColumns.map(col => (
            <button
              key={col.key}
              className="task-move-btn-auth"
              onClick={() => moveTask(task._id, col.key)}
              disabled={movingTask === task._id}
            >
              {col.label} <FiChevronRight size={14} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="student-page">
      <div className="student-header-banner">
        <div className="student-header-content">
          <span className="student-header-label">TASK TRACKER</span>
          <h1>Your Tasks</h1>
          <p>Organize and track assignments across all your courses.</p>
        </div>
        <div className="student-header-visual">
          <FiCheckSquare size={64} />
        </div>
      </div>

      <div className="kanban-board-auth">
        {/* To Do Column */}
        <div className="kanban-col-auth">
          <div className="kanban-col-header-auth">
            <span className="kanban-col-title-auth">
              <FiCheckSquare size={16} /> To Do
            </span>
            <span className="kanban-col-count-auth">{tasks.todo.length}</span>
          </div>
          <div className="kanban-col-body-auth">
            {tasks.todo.length === 0 ? (
              <div className="kanban-col-empty-auth">
                <p>No tasks</p>
              </div>
            ) : (
              tasks.todo.map(task => <TaskCard key={task._id} task={task} currentColumn="todo" />)
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="kanban-col-auth">
          <div className="kanban-col-header-auth">
            <span className="kanban-col-title-auth">
              <FiClock size={16} /> In Progress
            </span>
            <span className="kanban-col-count-auth">{tasks.inProgress.length}</span>
          </div>
          <div className="kanban-col-body-auth">
            {tasks.inProgress.length === 0 ? (
              <div className="kanban-col-empty-auth">
                <p>No tasks</p>
              </div>
            ) : (
              tasks.inProgress.map(task => <TaskCard key={task._id} task={task} currentColumn="inProgress" />)
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="kanban-col-auth">
          <div className="kanban-col-header-auth">
            <span className="kanban-col-title-auth">
              <FiCheckCircle size={16} /> Completed
            </span>
            <span className="kanban-col-count-auth">{tasks.completed.length}</span>
          </div>
          <div className="kanban-col-body-auth">
            {tasks.completed.length === 0 ? (
              <div className="kanban-col-empty-auth">
                <p>No tasks</p>
              </div>
            ) : (
              tasks.completed.map(task => <TaskCard key={task._id} task={task} currentColumn="completed" />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;