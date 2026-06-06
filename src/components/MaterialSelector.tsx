import { X, Search, Package, Plus, CheckCircle2 } from 'lucide-react';
import { CATEGORY_LABELS, Material, ElementMaterial } from '../types';
import { useMaterialStore } from '../store/useMaterialStore';

interface MaterialSelectorProps {
  currentMaterials: ElementMaterial[];
  onSelect: (material: Material) => void;
  onClose: () => void;
}

export function MaterialSelector({
  currentMaterials,
  onSelect,
  onClose,
}: MaterialSelectorProps) {
  const {
    showMaterialSelector,
    searchKeyword,
    setSearchKeyword,
    filterPart,
    setFilterPart,
    filterNeedToBuy,
    setFilterNeedToBuy,
    getFilteredMaterials,
  } = useMaterialStore();

  const filteredMaterials = getFilteredMaterials();

  const handleSelect = (material: Material) => {
    onSelect(material);
    onClose();
  };

  if (!showMaterialSelector) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-primary-light rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-white/10 shadow-2xl animate-scale-in">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">从材质库选择</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              共 {filteredMaterials.length} 种材料可选
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
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
            onChange={(e) =>
              setFilterPart(e.target.value as typeof filterPart)
            }
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

        <div className="flex-1 overflow-y-auto p-4">
          {filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
              <Package size={40} className="mb-3 opacity-50" />
              <p className="text-sm">暂无匹配的材料</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredMaterials.map((material) => {
                const isSelected = currentMaterials.some(
                  (m) => m.materialId === material.id || m.name === material.name
                );
                return (
                  <div
                    key={material.id}
                    onClick={() => !isSelected && handleSelect(material)}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? 'bg-accent/20 border-accent/50 cursor-not-allowed'
                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-accent/30'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 size={16} className="text-accent" />
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-accent/30'
                            : 'bg-gradient-to-br from-accent/30 to-accent/10 group-hover:from-accent/40 group-hover:to-accent/20'
                        }`}
                      >
                        <Plus
                          size={16}
                          className={isSelected ? 'text-accent' : 'text-accent'}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-sm ${
                            isSelected ? 'text-accent' : 'text-white'
                          }`}
                        >
                          {material.name}
                        </h3>
                        {material.applicableParts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {material.applicableParts.slice(0, 3).map((part) => (
                              <span
                                key={part}
                                className="text-[10px] px-1.5 py-0.5 bg-white/10 text-gray-400 rounded"
                              >
                                {CATEGORY_LABELS[part]}
                              </span>
                            ))}
                            {material.applicableParts.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-gray-500 rounded">
                                +{material.applicableParts.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        {material.notes && (
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                            {material.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
