import { useState } from 'react';
import { X, ChevronUp, ChevronDown, RotateCcw, Save, ListTodo, GripVertical } from 'lucide-react';
import { TaskTemplate, TASK_TYPE_LABELS, TaskType, DEFAULT_TASK_TEMPLATES } from '../types';
import { useStore } from '../store/useStore';

export function SettingsPanel() {
  const { showSettings, setShowSettings, settings, updateTaskTemplates, resetTaskTemplates } = useStore();
  const [editingTemplates, setEditingTemplates] = useState<TaskTemplate[]>(
    [...settings.taskTemplates].sort((a, b) => a.order - b.order)
  );

  const handleTemplateNameChange = (id: string, name: string) => {
    setEditingTemplates(editingTemplates.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  const moveTemplate = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editingTemplates.length - 1) return;

    const newTemplates = [...editingTemplates];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newTemplates[index], newTemplates[targetIndex]] = [newTemplates[targetIndex], newTemplates[index]];

    const reordered = newTemplates.map((t, i) => ({ ...t, order: i }));
    setEditingTemplates(reordered);
  };

  const handleSave = () => {
    updateTaskTemplates(editingTemplates);
    setShowSettings(false);
  };

  const handleReset = () => {
    if (confirm('确定要重置为默认任务模板吗？')) {
      resetTaskTemplates();
      setEditingTemplates([...DEFAULT_TASK_TEMPLATES].sort((a, b) => a.order - b.order));
    }
  };

  if (!showSettings) return null;

  return (
    <div className="w-80 bg-primary-light border-l border-white/10 flex flex-col animate-slide-in">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo size={18} className="text-accent" />
          <h2 className="font-semibold text-white">设置</h2>
        </div>
        <button
          onClick={() => setShowSettings(false)}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white text-sm">默认任务模板</h3>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-accent transition-colors"
            >
              <RotateCcw size={12} />
              重置
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            调整默认任务的顺序和名称，新建元素时可一键套用。
          </p>

          <div className="space-y-2">
            {editingTemplates.map((template, index) => (
              <div
                key={template.id}
                className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg group"
              >
                <GripVertical size={16} className="text-gray-600 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-5 text-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={template.name}
                      onChange={(e) => handleTemplateNameChange(template.id, e.target.value)}
                      className="flex-1 bg-transparent border-b border-transparent hover:border-white/20 focus:border-accent text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 ml-7">
                    {TASK_TYPE_LABELS[template.type as TaskType]}
                  </span>
                </div>
                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveTemplate(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => moveTemplate(index, 'down')}
                    disabled={index === editingTemplates.length - 1}
                    className="p-0.5 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors"
        >
          <Save size={16} />
          保存设置
        </button>
      </div>
    </div>
  );
}
