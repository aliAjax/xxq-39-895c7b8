import { create } from 'zustand';
import { TaskTemplate, AppSettings, DEFAULT_TASK_TEMPLATES, ProductionTask } from '../types';
import { loadSettings, saveSettings } from '../utils/storage';

interface TaskTemplateStoreState {
  settings: AppSettings;

  updateTaskTemplates: (templates: TaskTemplate[]) => void;
  resetTaskTemplates: () => void;
  generateTasksFromTemplates: () => ProductionTask[];
  getMissingTaskTypes: (existingTaskTypes: string[]) => TaskTemplate[];
}

export const useTaskTemplateStore = create<TaskTemplateStoreState>((set, get) => ({
  settings: loadSettings(),

  updateTaskTemplates: (templates) => {
    set((state) => {
      const newSettings = { ...state.settings, taskTemplates: templates };
      saveSettings(newSettings);
      return { settings: newSettings };
    });
  },

  resetTaskTemplates: () => {
    set((state) => {
      const newSettings = { ...state.settings, taskTemplates: [...DEFAULT_TASK_TEMPLATES] };
      saveSettings(newSettings);
      return { settings: newSettings };
    });
  },

  generateTasksFromTemplates: () => {
    const templates = [...get().settings.taskTemplates].sort((a, b) => a.order - b.order);
    const now = Date.now();
    return templates.map((tpl, index) => ({
      id: `task-${now}-${index}`,
      type: tpl.type,
      name: tpl.name,
      completed: false,
      createdAt: now,
      updatedAt: now,
    }));
  },

  getMissingTaskTypes: (existingTaskTypes) => {
    const templates = [...get().settings.taskTemplates].sort((a, b) => a.order - b.order);
    const existingSet = new Set(existingTaskTypes);
    return templates.filter((tpl) => !existingSet.has(tpl.type));
  },
}));
