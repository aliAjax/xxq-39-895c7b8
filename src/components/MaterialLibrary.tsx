import { useState } from 'react';
import { X, Plus, Edit3, Trash2, Search, Package, CheckCircle, Circle } from 'lucide-react';
import { Material, ClothingCategory, CATEGORY_LABELS } from '../types';
import { useMaterialStore } from '../store/useMaterialStore';

export function MaterialLibrary() {
  const {
    materials,
    showMaterialLibrary,
    setShowMaterialLibrary,
    searchKeyword,
    setSearchKeyword,
    filterPart,
    setFilterPart,
    filterNeedToBuy,
    setFilterNeedToBuy,
    selectedMaterialId,
    setSelectedMaterialId,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getFilteredMaterials,
  } = useMaterialStore();

  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    applicableParts: [] as ClothingCategory[],
    notes: '',
    needToBuy: false,
  });

  const filteredMaterials = getFilteredMaterials();

  const openAddForm = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      applicableParts: [],
      notes: '',
      needToBuy: false,
    });
    setShowForm(true);
  };

  const openEditForm = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      applicableParts: [...material.applicableParts],
      notes: material.notes,
      needToBuy: material.needToBuy,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingMaterial) {
      updateMaterial(editingMaterial.id, formData);
    } else {
      addMaterial(formData);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个材料吗？')) {
      deleteMaterial(id);
    }
  };

  const togglePart = (part: ClothingCategory) => {
    setFormData((prev) => ({
      ...prev,
      applicableParts: prev.applicableParts.includes(part)
        ? prev.applicableParts.filter((p) => p !== part)
        : [...prev.applicableParts, part],
    }));
  };

  if (!showMaterialLibrary) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      <div className="bg-primary-light/50 backdrop-blur border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <Package size={28} className="text-accent" />
              材质库
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              共 {materials.length} 种材料 · 筛选后 {filteredMaterials.length} 种
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg transition-all font-medium"
            >
              <Plus size={18} />
              添加材料
            </button>
            <button
              onClick={() => setShowMaterialLibrary(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索材料名称或备注..."
              className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          <select
            value={filterPart}
            onChange={(e) => setFilterPart(e.target.value as ClothingCategory | 'all')}
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent/50 transition-colors text-sm"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={String(filterNeedToBuy)}
            onChange={(e) =>
              setFilterNeedToBuy(
                e.target.value === 'all' ? 'all' : e.target.value === 'true'
              )
            }
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent/50 transition-colors text-sm"
          >
            <option value="all">全部采购状态</option>
            <option value="true">需要采购</option>
            <option value="false">已有库存</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Package size={48} className="mb-4 opacity-50" />
            <p className="text-lg">暂无匹配的材料</p>
            <p className="text-sm mt-1">
              {searchKeyword || filterPart !== 'all' || filterNeedToBuy !== 'all'
                ? '尝试调整筛选条件'
                : '点击上方按钮添加第一个材料'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material, index) => (
              <div
                key={material.id}
                className={`group relative bg-white/5 rounded-xl p-5 cursor-pointer transition-all duration-200 border ${
                  selectedMaterialId === material.id
                    ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                    : 'border-transparent hover:bg-white/10 hover:shadow-xl'
                } animate-scale-in`}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() =>
                  setSelectedMaterialId(
                    selectedMaterialId === material.id ? null : material.id
                  )
                }
              >
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditForm(material);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  >
                    <Edit3 size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(material.id);
                    }}
                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-accent/30 to-accent/10">
                    <Package size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 pr-16">
                    <h3 className="font-semibold text-white">{material.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {material.needToBuy ? (
                        <span className="flex items-center gap-1 text-xs text-accent">
                          <CheckCircle size={12} />
                          需要采购
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <Circle size={12} />
                          已有库存
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {material.applicableParts.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">适用部位</p>
                    <div className="flex flex-wrap gap-1">
                      {material.applicableParts.map((part) => (
                        <span
                          key={part}
                          className="text-xs px-2 py-0.5 bg-white/10 text-gray-300 rounded"
                        >
                          {CATEGORY_LABELS[part]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {material.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">备注</p>
                    <p className="text-sm text-gray-400 line-clamp-2">{material.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-primary-light rounded-2xl w-full max-w-lg p-6 border border-white/10 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingMaterial ? '编辑材料' : '添加材料'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">材料名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：真丝雪纺、EVA泡沫板"
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">适用部位</label>
                <div className="flex flex-wrap gap-2">
                  {(
                    (Object.entries(CATEGORY_LABELS) as [ClothingCategory | 'all', string][])
                      .filter(([key]) => key !== 'all') as [ClothingCategory, string][]
                  ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => togglePart(key)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          formData.applicableParts.includes(key)
                            ? 'bg-accent text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="记录材料特性、采购渠道、价格等信息..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors resize-none text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="material-need-to-buy"
                  checked={formData.needToBuy}
                  onChange={(e) =>
                    setFormData({ ...formData, needToBuy: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-accent focus:ring-accent/50"
                />
                <label htmlFor="material-need-to-buy" className="text-sm text-gray-300">
                  需要采购
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex-1 py-2.5 bg-accent hover:bg-accent-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {editingMaterial ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
