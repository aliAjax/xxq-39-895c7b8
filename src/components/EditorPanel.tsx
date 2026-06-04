import { useState, useEffect } from 'react';
import { X, Trash2, Plus, Link, Image } from 'lucide-react';
import {
  ClothingElement,
  ClothingCategory,
  DifficultyLevel,
  ProductionStatus,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
} from '../types';
import { useStore } from '../store/useStore';

interface EditorPanelProps {
  isNew?: boolean;
}

export function EditorPanel({ isNew = false }: EditorPanelProps) {
  const {
    activeCharacterId,
    selectedElementId,
    setSelectedElement,
    addElement,
    updateElement,
    deleteElement,
    characters,
    newElementFromReference,
  } = useStore();

  const character = characters.find((c) => c.id === activeCharacterId);
  const element = character?.elements.find((e) => e.id === selectedElementId);

  const [formData, setFormData] = useState<
    Partial<ClothingElement> & { category: ClothingCategory }
  >({
    name: '',
    category: 'head',
    colors: [],
    materials: [],
    difficulty: 'medium',
    referenceImages: [],
    notes: '',
    questions: '',
    status: 'pending',
    needToBuy: false,
  });

  const [newColor, setNewColor] = useState('#ffffff');
  const [newMaterial, setNewMaterial] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (element && !isNew) {
      setFormData(element);
    } else if (isNew) {
      if (newElementFromReference) {
        setFormData({
          name: '',
          category: newElementFromReference.category,
          colors: [],
          materials: [],
          difficulty: 'medium',
          referenceImages: [newElementFromReference.imageUrl],
          notes: '',
          questions: '',
          status: 'pending',
          needToBuy: false,
        });
      } else {
        setFormData({
          name: '',
          category: 'head',
          colors: [],
          materials: [],
          difficulty: 'medium',
          referenceImages: [],
          notes: '',
          questions: '',
          status: 'pending',
          needToBuy: false,
        });
      }
    }
  }, [element, isNew, newElementFromReference]);

  const handleSave = () => {
    if (!activeCharacterId || !formData.name) return;

    if (isNew) {
      addElement(activeCharacterId, {
        name: formData.name,
        category: formData.category,
        colors: formData.colors || [],
        materials: formData.materials || [],
        difficulty: formData.difficulty as DifficultyLevel,
        referenceImages: formData.referenceImages || [],
        notes: formData.notes || '',
        questions: formData.questions || '',
        status: formData.status as ProductionStatus,
        needToBuy: formData.needToBuy || false,
      });
    } else if (selectedElementId) {
      updateElement(activeCharacterId, selectedElementId, formData);
    }
    setSelectedElement(null);
  };

  const handleDelete = () => {
    if (!activeCharacterId || !selectedElementId) return;
    if (confirm('确定要删除这个服装元素吗？')) {
      deleteElement(activeCharacterId, selectedElementId);
    }
  };

  const addColor = () => {
    if (newColor && !formData.colors?.includes(newColor)) {
      setFormData({ ...formData, colors: [...(formData.colors || []), newColor] });
      setNewColor('#ffffff');
    }
  };

  const removeColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors?.filter((c) => c !== color) });
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !formData.materials?.includes(newMaterial.trim())) {
      setFormData({
        ...formData,
        materials: [...(formData.materials || []), newMaterial.trim()],
      });
      setNewMaterial('');
    }
  };

  const removeMaterial = (material: string) => {
    setFormData({ ...formData, materials: formData.materials?.filter((m) => m !== material) });
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !formData.referenceImages?.includes(newImageUrl.trim())) {
      setFormData({
        ...formData,
        referenceImages: [...(formData.referenceImages || []), newImageUrl.trim()],
      });
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (url: string) => {
    setFormData({
      ...formData,
      referenceImages: formData.referenceImages?.filter((u) => u !== url),
    });
  };

  const isOpen = selectedElementId !== null || isNew;

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-primary-light border-l border-white/10 flex flex-col animate-slide-in">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">
            {isNew ? '添加元素' : '编辑元素'}
          </h2>
          {newElementFromReference && (
            <div className="flex items-center gap-1 mt-1 text-xs text-success">
              <Image size={12} />
              <span>从参考图创建 · {CATEGORY_LABELS[newElementFromReference.category]}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setSelectedElement(null)}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">元素名称 *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
            placeholder="例如：发饰、外套等"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">部位分类</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as ClothingCategory })
            }
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent/50 transition-colors"
          >
            {Object.entries(CATEGORY_LABELS)
              .filter(([key]) => key !== 'all')
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">制作状态</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as ProductionStatus })
            }
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent/50 transition-colors"
          >
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">制作难度</label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })
            }
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent/50 transition-colors"
          >
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">颜色</label>
          <div className="flex gap-2 mb-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer bg-transparent"
            />
            <button
              onClick={addColor}
              className="px-3 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.colors?.map((color, i) => (
              <div
                key={i}
                className="group relative"
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-white/20 cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => removeColor(color)}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <X size={10} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">材质</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
              className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 text-sm"
              placeholder="例如：真丝、金属"
            />
            <button
              onClick={addMaterial}
              className="px-3 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {formData.materials?.map((material, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded flex items-center gap-1 group"
              >
                {material}
                <button
                  onClick={() => removeMaterial(material)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">参考图链接</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addImageUrl()}
              className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 text-sm"
              placeholder="粘贴图片URL"
            />
            <button
              onClick={addImageUrl}
              className="px-3 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm transition-colors"
            >
              <Link size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {formData.referenceImages?.map((url, i) => (
              <div
                key={i}
                className="relative group bg-white/5 rounded-lg overflow-hidden"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-24 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => removeImageUrl(url)}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} className="text-white" />
                </button>
                <p className="absolute bottom-2 left-2 text-xs text-white truncate max-w-[200px]">
                  {url}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">备注</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 resize-none text-sm"
            rows={3}
            placeholder="记录制作要点..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">待确认问题</label>
          <textarea
            value={formData.questions || ''}
            onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 resize-none text-sm"
            rows={2}
            placeholder="需要确认的细节..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="needToBuy"
            checked={formData.needToBuy}
            onChange={(e) => setFormData({ ...formData, needToBuy: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-white/10 text-accent focus:ring-accent/50"
          />
          <label htmlFor="needToBuy" className="text-sm text-gray-300">
            加入采购清单
          </label>
        </div>
      </div>

      <div className="p-4 border-t border-white/10 flex gap-2">
        <button
          onClick={handleSave}
          disabled={!formData.name}
          className="flex-1 py-2.5 bg-accent hover:bg-accent-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isNew ? '添加' : '保存'}
        </button>
        {!isNew && (
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
