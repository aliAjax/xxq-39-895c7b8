import { useState } from 'react';
import { X, Sparkles, Wand2 } from 'lucide-react';
import { CATEGORY_LABELS, ClothingCategory } from '../types';
import { useStore } from '../store/useStore';

const COMMON_CATEGORIES: ClothingCategory[] = ['head', 'top', 'bottom', 'shoes', 'accessory', 'weapon'];

export function CharacterCreationWizard() {
  const { showCharacterWizard, setShowCharacterWizard, createCharacterWithData } = useStore();

  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [autoGenerateElements, setAutoGenerateElements] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCharacterWithData({
      name,
      source,
      description,
      autoGenerateElements,
    });

    setName('');
    setSource('');
    setDescription('');
    setAutoGenerateElements(true);
  };

  const handleClose = () => {
    setShowCharacterWizard(false);
    setName('');
    setSource('');
    setDescription('');
    setAutoGenerateElements(true);
  };

  if (!showCharacterWizard) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-primary-light border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wand2 size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">创建新角色</h2>
              <p className="text-xs text-gray-400">填写基本信息开始拆解</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              角色名称 <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：雷电将军"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              作品来源
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="例如：原神 / Genshin Impact"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              角色描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述角色特点、服装风格等..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={autoGenerateElements}
                  onChange={(e) => setAutoGenerateElements(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
              </label>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" />
                  <span className="text-sm font-medium text-white">自动生成服装分类占位</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  为常见服装分类创建空的元素占位，方便后续逐个填写
                </p>
                {autoGenerateElements && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {COMMON_CATEGORIES.map((cat) => (
                      <span
                        key={cat}
                        className="text-xs px-2.5 py-1 bg-white/10 text-gray-300 rounded-lg"
                      >
                        {CATEGORY_LABELS[cat]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 bg-accent hover:bg-accent-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              创建角色
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
