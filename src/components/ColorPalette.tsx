import { useState } from 'react';
import { X, Plus, RefreshCw, Palette, Edit3, Trash2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PaletteColor, ColorCategory, COLOR_CATEGORY_LABELS, CATEGORY_LABELS } from '../types';

export function ColorPalette() {
  const {
    activeCharacterId,
    characters,
    setShowColorPalette,
    addPaletteColor,
    updatePaletteColor,
    deletePaletteColor,
    autoGeneratePalette,
    getElementsUsingColor,
    setSelectedElement,
  } = useStore();

  const character = characters.find((c) => c.id === activeCharacterId);
  const paletteColors = character?.colorPalette?.colors || [];

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: 'primary' as ColorCategory });
  const [newColor, setNewColor] = useState('#6B21A8');
  const [newColorName, setNewColorName] = useState('');
  const [newColorCategory, setNewColorCategory] = useState<'primary' | 'secondary' | 'accent'>('primary');
  const [showAddForm, setShowAddForm] = useState(false);

  const elementsUsingColor = selectedColor
    ? getElementsUsingColor(activeCharacterId || '', selectedColor)
    : [];

  const groupedColors = {
    primary: paletteColors.filter((c) => c.category === 'primary'),
    secondary: paletteColors.filter((c) => c.category === 'secondary'),
    accent: paletteColors.filter((c) => c.category === 'accent'),
  };

  const handleAddColor = () => {
    if (!activeCharacterId || !newColorName.trim()) return;
    addPaletteColor(activeCharacterId, {
      color: newColor,
      name: newColorName.trim(),
      category: newColorCategory,
    });
    setNewColorName('');
    setShowAddForm(false);
  };

  const handleStartEdit = (color: PaletteColor) => {
    setEditingColor(color.id);
    setEditForm({ name: color.name, category: color.category });
  };

  const handleSaveEdit = (colorId: string) => {
    if (!activeCharacterId) return;
    updatePaletteColor(activeCharacterId, colorId, editForm);
    setEditingColor(null);
  };

  const handleDeleteColor = (colorId: string) => {
    if (!activeCharacterId || !confirm('确定要删除这个颜色吗？')) return;
    deletePaletteColor(activeCharacterId, colorId);
    if (selectedColor === colorId) {
      setSelectedColor(null);
    }
  };

  const handleAutoGenerate = () => {
    if (!activeCharacterId) return;
    autoGeneratePalette(activeCharacterId);
  };

  if (!character) return null;

  return (
    <div className="w-96 bg-primary-light border-l border-white/10 flex flex-col animate-slide-in">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={20} className="text-accent" />
          <h2 className="font-semibold text-white">颜色方案板</h2>
        </div>
        <button
          onClick={() => {
            setShowColorPalette(false);
            setSelectedColor(null);
          }}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="flex gap-2">
          <button
            onClick={handleAutoGenerate}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            从元素汇总
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            手动添加
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white/5 rounded-lg p-4 space-y-3 animate-fade-in">
            <h3 className="text-sm font-medium text-white">添加新颜色</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">颜色名称</label>
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
                placeholder="例如：深紫主色"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">颜色类型</label>
              <select
                value={newColorCategory}
                onChange={(e) => setNewColorCategory(e.target.value as ColorCategory)}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent/50"
              >
                {Object.entries(COLOR_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">选择颜色</label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer bg-transparent"
              />
            </div>
            <button
              onClick={handleAddColor}
              disabled={!newColorName.trim()}
              className="w-full py-2 bg-accent hover:bg-accent-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              添加颜色
            </button>
          </div>
        )}

        {(Object.keys(groupedColors) as ColorCategory[]).map((category) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {COLOR_CATEGORY_LABELS[category]} ({groupedColors[category].length})
            </h3>
            <div className="space-y-2">
              {groupedColors[category].map((color) => (
                <div
                  key={color.id}
                  className={`group relative p-3 rounded-lg transition-all cursor-pointer ${
                    selectedColor === color.color
                      ? 'bg-accent/20 border border-accent/50'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                  onClick={() => setSelectedColor(selectedColor === color.color ? null : color.color)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-inner flex-shrink-0"
                      style={{ backgroundColor: color.color }}
                    />
                    {editingColor === color.id ? (
                      <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-accent/50"
                          autoFocus
                        />
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ColorCategory })}
                          className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-accent/50"
                        >
                          {Object.entries(COLOR_CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveEdit(color.id)}
                            className="p-1.5 bg-accent hover:bg-accent-dark rounded text-white transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingColor(null)}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-gray-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{color.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{color.color.toUpperCase()}</p>
                      </div>
                    )}
                    {editingColor !== color.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(color);
                          }}
                          className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        >
                          <Edit3 size={14} className="text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteColor(color.id);
                          }}
                          className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {groupedColors[category].length === 0 && (
                <p className="text-sm text-gray-500 italic">暂无颜色</p>
              )}
            </div>
          </div>
        ))}

        {selectedColor && elementsUsingColor.length > 0 && (
          <div className="border-t border-white/10 pt-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              使用该颜色的元素 ({elementsUsingColor.length})
            </h3>
            <div className="space-y-2">
              {elementsUsingColor.map((element) => (
                <div
                  key={element.id}
                  onClick={() => {
                    setSelectedElement(element.id);
                    setShowColorPalette(false);
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                >
                  <p className="font-medium text-white text-sm">{element.name}</p>
                  <p className="text-xs text-gray-500">{CATEGORY_LABELS[element.category]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedColor && elementsUsingColor.length === 0 && (
          <div className="border-t border-white/10 pt-5">
            <p className="text-sm text-gray-500 italic">暂无服装元素使用该颜色</p>
          </div>
        )}
      </div>
    </div>
  );
}
