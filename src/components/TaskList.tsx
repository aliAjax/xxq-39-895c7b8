import { useState } from 'react';
import { Plus, X, Check, ListTodo } from 'lucide-react';
import {
  ProductionTask,
  TaskType,
  TASK_TYPE_LABELS,
  ClothingElement,
} from '../types';
import { useStore } from '../store/useStore';

interface TaskListProps {
  elementId: string;
  characterId: string;
  tasks: ProductionTask[];
}

export function TaskList({ elementId, characterId, tasks }: TaskListProps) {
  const { addTask, deleteTask, toggleTaskComplete, addDefaultTasks, getTaskProgress } = useStore();
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('other');

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    addTask(characterId, elementId, {
      type: newTaskType,
      name: newTaskName.trim(),
      completed: false,
    });
    setNewTaskName('');
  };

  const handleAddDefaultTasks = () => {
    addDefaultTasks(characterId, elementId);
  };

  const progress = tasks.length > 0 ? getTaskProgress({ tasks } as ClothingElement) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400 flex items-center gap-2">
          <ListTodo size={16} />
          制作任务清单
        </label>
        {tasks.length === 0 && (
          <button
            onClick={handleAddDefaultTasks}
            className="text-xs text-accent hover:text-accent-light transition-colors"
          >
            + 添加默认任务
          </button>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">完成进度</span>
            <span className="text-xs text-gray-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group flex items-center gap-3 p-3 rounded-lg transition-all ${
              task.completed ? 'bg-success/10' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <button
              onClick={() => toggleTaskComplete(characterId, elementId, task.id)}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                task.completed
                  ? 'bg-success text-white'
                  : 'border border-white/30 hover:border-accent'
              }`}
            >
              {task.completed && <Check size={12} />}
            </button>
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm ${
                  task.completed ? 'text-gray-500 line-through' : 'text-white'
                }`}
              >
                {task.name}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {TASK_TYPE_LABELS[task.type]}
              </span>
            </div>
            <button
              onClick={() => deleteTask(characterId, elementId, task.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
            >
              <X size={14} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <select
          value={newTaskType}
          onChange={(e) => setNewTaskType(e.target.value as TaskType)}
          className="w-28 bg-white/10 border border-white/10 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
        >
          {Object.entries(TASK_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 text-sm"
          placeholder="添加新任务..."
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskName.trim()}
          className="px-3 py-2 bg-accent hover:bg-accent-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
