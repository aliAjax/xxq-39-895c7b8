import { useState, useMemo } from 'react';
import { X, Search, Package, CheckCircle, Circle, ChevronDown, ChevronUp, Check, Crown, Shirt, Scissors, Footprints, Sparkles, Sword, Wallet, Users, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useMaterialStore } from '../store/useMaterialStore';
import { useToastStore } from '../store/useToastStore';
import { ClothingCategory, CATEGORY_LABELS, Material, Character, ClothingElement, ElementMaterial } from '../types';

interface MaterialUsage {
  characterId: string;
  characterName: string;
  elementId: string;
  elementName: string;
  elementCategory: ClothingCategory;
  elementNeedToBuy: boolean;
  elementPurchased: boolean;
  elementBudget: number;
  material: ElementMaterial;
}

interface SummarizedMaterial {
  name: string;
  libraryMaterial: Material | null;
  inLibrary: boolean;
  libraryNeedToBuy: boolean;
  usages: MaterialUsage[];
  totalElements: number;
  totalBudget: number;
  purchasedCount: number;
  needToBuyCount: number;
}

const categoryIcons: Record<ClothingCategory, React.ElementType> = {
  head: Crown,
  top: Shirt,
  bottom: Scissors,
  shoes: Footprints,
  accessory: Sparkles,
  weapon: Sword,
};

type FilterType = 'all' | 'need_to_buy' | 'in_library' | 'not_in_library';

export function MaterialSummary() {
  const { showMaterialSummary, setShowMaterialSummary, characters, bulkMarkElementsPurchased } = useStore();
  const { materials } = useMaterialStore();
  const { showToast } = useToastStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<ClothingCategory | 'all'>('all');
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const summarizedMaterials = useMemo(() => {
    const materialMap = new Map<string, SummarizedMaterial>();

    const libraryMap = new Map<string, Material>();
    materials.forEach((m) => {
      libraryMap.set(m.name.trim().toLowerCase(), m);
    });

    characters.forEach((character: Character) => {
      character.elements.forEach((element: ClothingElement) => {
        const budget = element.budget;
        const elementBudget = budget
          ? budget.materialCost + budget.toolCost + budget.outsourcingCost
          : 0;

        element.materials.forEach((mat: ElementMaterial) => {
          const nameKey = mat.name.trim().toLowerCase();
          if (!nameKey) return;

          if (!materialMap.has(nameKey)) {
            const libMat = libraryMap.get(nameKey) || null;
            materialMap.set(nameKey, {
              name: mat.name.trim(),
              libraryMaterial: libMat,
              inLibrary: !!libMat,
              libraryNeedToBuy: libMat?.needToBuy ?? false,
              usages: [],
              totalElements: 0,
              totalBudget: 0,
              purchasedCount: 0,
              needToBuyCount: 0,
            });
          }

          const summary = materialMap.get(nameKey)!;
          const usage: MaterialUsage = {
            characterId: character.id,
            characterName: character.name,
            elementId: element.id,
            elementName: element.name || '未命名',
            elementCategory: element.category,
            elementNeedToBuy: element.needToBuy,
            elementPurchased: budget?.purchased ?? false,
            elementBudget,
            material: mat,
          };
          summary.usages.push(usage);
        });
      });
    });

    materialMap.forEach((summary) => {
      const uniqueElements = new Map<string, { budget: number; purchased: boolean; needToBuy: boolean }>();

      summary.usages.forEach((usage) => {
        const key = `${usage.characterId}|${usage.elementId}`;
        if (!uniqueElements.has(key)) {
          uniqueElements.set(key, {
            budget: usage.elementBudget,
            purchased: usage.elementPurchased,
            needToBuy: usage.elementNeedToBuy,
          });
        }
      });

      summary.totalElements = uniqueElements.size;
      summary.totalBudget = Array.from(uniqueElements.values()).reduce((sum, el) => sum + el.budget, 0);
      summary.purchasedCount = Array.from(uniqueElements.values()).filter((el) => el.purchased).length;
      summary.needToBuyCount = Array.from(uniqueElements.values()).filter((el) => el.needToBuy).length;
    });

    return Array.from(materialMap.values()).sort((a, b) => {
      if (b.needToBuyCount !== a.needToBuyCount) return b.needToBuyCount - a.needToBuyCount;
      return b.totalElements - a.totalElements;
    });
  }, [characters, materials]);

  const filteredMaterials = useMemo(() => {
    let filtered = [...summarizedMaterials];

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(keyword) ||
          m.usages.some(
            (u) =>
              u.characterName.toLowerCase().includes(keyword) ||
              u.elementName.toLowerCase().includes(keyword)
          )
      );
    }

    if (filterType === 'need_to_buy') {
      filtered = filtered.filter((m) => m.needToBuyCount > 0);
    } else if (filterType === 'in_library') {
      filtered = filtered.filter((m) => m.inLibrary);
    } else if (filterType === 'not_in_library') {
      filtered = filtered.filter((m) => !m.inLibrary);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((m) =>
        m.usages.some((u) => u.elementCategory === filterCategory)
      );
    }

    return filtered;
  }, [summarizedMaterials, searchKeyword, filterType, filterCategory]);

  const stats = useMemo(() => {
    const totalMaterials = summarizedMaterials.length;
    const inLibraryCount = summarizedMaterials.filter((m) => m.inLibrary).length;
    const needToBuyMaterials = summarizedMaterials.filter((m) => m.needToBuyCount > 0).length;

    let totalBudget = 0;
    let purchasedBudget = 0;
    const uniqueElements = new Set<string>();
    const purchasedElements = new Set<string>();

    summarizedMaterials.forEach((m) => {
      m.usages.forEach((u) => {
        const key = `${u.characterId}|${u.elementId}`;
        if (!uniqueElements.has(key)) {
          uniqueElements.add(key);
          totalBudget += u.elementBudget;
          if (u.elementPurchased) {
            purchasedElements.add(key);
            purchasedBudget += u.elementBudget;
          }
        }
      });
    });

    return {
      totalMaterials,
      inLibraryCount,
      needToBuyMaterials,
      totalBudget,
      purchasedBudget,
      uniqueElementCount: uniqueElements.size,
    };
  }, [summarizedMaterials]);

  const toggleExpand = (name: string) => {
    setExpandedMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const selectableItems = useMemo(() => {
    const items: Array<{ id: string; characterId: string; elementId: string; purchasable: boolean }> = [];
    filteredMaterials.forEach((m) => {
      m.usages.forEach((u) => {
        const id = `${u.characterId}|${u.elementId}`;
        const purchasable = u.elementNeedToBuy && !u.elementPurchased;
        if (!items.some((i) => i.id === id)) {
          items.push({ id, characterId: u.characterId, elementId: u.elementId, purchasable });
        }
      });
    });
    return items;
  }, [filteredMaterials]);

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const purchasableIds = selectableItems.filter((i) => i.purchasable).map((i) => i.id);
    const allSelected = purchasableIds.every((id) => selectedItems.has(id));

    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(purchasableIds));
    }
  };

  const handleSelectMaterial = (materialName: string, checked: boolean) => {
    const material = summarizedMaterials.find((m) => m.name === materialName);
    if (!material) return;

    const elementIds = new Set<string>();
    material.usages.forEach((u) => {
      const id = `${u.characterId}|${u.elementId}`;
      if (u.elementNeedToBuy && !u.elementPurchased) {
        elementIds.add(id);
      }
    });

    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (checked) {
        elementIds.forEach((id) => next.add(id));
      } else {
        elementIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  const getMaterialSelectState = (material: SummarizedMaterial): 'none' | 'some' | 'all' => {
    const purchasableIds: string[] = [];
    material.usages.forEach((u) => {
      const id = `${u.characterId}|${u.elementId}`;
      if (u.elementNeedToBuy && !u.elementPurchased && !purchasableIds.includes(id)) {
        purchasableIds.push(id);
      }
    });

    if (purchasableIds.length === 0) return 'none';

    const selectedCount = purchasableIds.filter((id) => selectedItems.has(id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === purchasableIds.length) return 'all';
    return 'some';
  };

  const handleBulkMarkPurchased = () => {
    if (selectedItems.size === 0) return;

    const items = Array.from(selectedItems).map((id) => {
      const [characterId, elementId] = id.split('|');
      return { characterId, elementId };
    });

    bulkMarkElementsPurchased(items, true);
    setSelectedItems(new Set());
    showToast('success', `已将 ${items.length} 个元素标记为已采购`);
  };

  const allPurchasableSelected = useMemo(() => {
    const purchasableIds = selectableItems.filter((i) => i.purchasable).map((i) => i.id);
    return purchasableIds.length > 0 && purchasableIds.every((id) => selectedItems.has(id));
  }, [selectableItems, selectedItems]);

  const selectedPurchasableCount = useMemo(() => {
    return selectableItems.filter((i) => i.purchasable && selectedItems.has(i.id)).length;
  }, [selectableItems, selectedItems]);

  if (!showMaterialSummary) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      <div className="bg-primary-light/50 backdrop-blur border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <Layers size={28} className="text-accent" />
              材料需求汇总
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              跨角色合并统计所有材料需求 · 共 {stats.totalMaterials} 种材料
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedPurchasableCount > 0 && (
              <button
                onClick={handleBulkMarkPurchased}
                className="flex items-center gap-2 bg-success hover:bg-success/80 text-white px-4 py-2 rounded-lg transition-all font-medium"
              >
                <Check size={18} />
                批量标记已采购 ({selectedPurchasableCount})
              </button>
            )}
            <button
              onClick={() => setShowMaterialSummary(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-accent" />
              <span className="text-xs text-gray-400">材料种类</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalMaterials}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-success" />
              <span className="text-xs text-gray-400">材质库中</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.inLibraryCount}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-warning" />
              <span className="text-xs text-gray-400">需采购材料</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.needToBuyMaterials}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={16} className="text-accent" />
              <span className="text-xs text-gray-400">预算总额</span>
            </div>
            <p className="text-2xl font-bold text-white">¥{stats.totalBudget.toLocaleString()}</p>
            {stats.purchasedBudget > 0 && (
              <p className="text-xs text-success mt-1">已采购 ¥{stats.purchasedBudget.toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索材料、角色或元素名称..."
              className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent/50 transition-colors text-sm"
          >
            <option value="all">全部状态</option>
            <option value="need_to_buy">需采购</option>
            <option value="in_library">材质库中</option>
            <option value="not_in_library">未入库</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ClothingCategory | 'all')}
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent/50 transition-colors text-sm"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={handleSelectAll}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              allPurchasableSelected
                ? 'bg-accent text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {allPurchasableSelected ? '取消全选' : '全选需采购'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Package size={48} className="mb-4 opacity-50" />
            <p className="text-lg">暂无匹配的材料</p>
            <p className="text-sm mt-1">
              {searchKeyword || filterType !== 'all' || filterCategory !== 'all'
                ? '尝试调整筛选条件'
                : '角色元素中暂无材料信息'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMaterials.map((material, index) => {
              const isExpanded = expandedMaterials.has(material.name);
              const selectState = getMaterialSelectState(material);
              const uniqueUsages = Array.from(
                new Map(material.usages.map((u) => [`${u.characterId}|${u.elementId}`, u])).values()
              );

              return (
                <div
                  key={material.name}
                  className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all animate-scale-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div
                    className="p-4 cursor-pointer flex items-center gap-4"
                    onClick={() => toggleExpand(material.name)}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectState !== 'none') {
                          handleSelectMaterial(material.name, false);
                        } else if (selectState === 'none' && material.needToBuyCount > 0) {
                          handleSelectMaterial(material.name, true);
                        }
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectState === 'all'
                          ? 'border-accent bg-accent'
                          : selectState === 'some'
                          ? 'border-accent bg-accent/30'
                          : material.needToBuyCount > 0
                          ? 'border-white/30 hover:border-accent/50'
                          : 'border-white/10 cursor-not-allowed'
                      }`}
                    >
                      {(selectState === 'all' || selectState === 'some') && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-accent/30 to-accent/10 flex-shrink-0">
                      <Package size={20} className="text-accent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white truncate">{material.name}</h3>
                        {material.inLibrary ? (
                          <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded">
                            <CheckCircle size={12} />
                            材质库中 · {material.libraryNeedToBuy ? '需采购' : '已有库存'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                            <Circle size={12} />
                            未入库
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {material.totalElements} 个元素
                        </span>
                        <span className="flex items-center gap-1">
                          <Check size={12} className="text-success" />
                          {material.purchasedCount} 已采购
                        </span>
                        {material.totalBudget > 0 && (
                          <span className="flex items-center gap-1">
                            <Wallet size={12} className="text-accent" />
                            ¥{material.totalBudget.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(material.name);
                      }}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/10">
                      <div className="p-2">
                        {uniqueUsages.map((usage) => {
                          const itemId = `${usage.characterId}|${usage.elementId}`;
                          const Icon = categoryIcons[usage.elementCategory];
                          const isSelected = selectedItems.has(itemId);
                          const canSelect = usage.elementNeedToBuy && !usage.elementPurchased;

                          return (
                            <div
                              key={itemId}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                usage.elementPurchased
                                  ? 'bg-success/5'
                                  : usage.elementNeedToBuy
                                  ? 'bg-white/5 hover:bg-white/10'
                                  : 'bg-white/[0.02]'
                              }`}
                            >
                              <div
                                onClick={() => {
                                  if (canSelect) {
                                    handleSelectItem(itemId, !isSelected);
                                  }
                                }}
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  !canSelect
                                    ? 'border-white/10 cursor-not-allowed'
                                    : isSelected
                                    ? 'border-accent bg-accent cursor-pointer'
                                    : 'border-white/30 hover:border-accent/50 cursor-pointer'
                                }`}
                              >
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>

                              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white/10 flex-shrink-0">
                                <Icon size={16} className="text-accent" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-medium truncate ${
                                      usage.elementPurchased
                                        ? 'text-gray-500 line-through'
                                        : 'text-white'
                                    }`}
                                  >
                                    {usage.elementName}
                                  </span>
                                  <span className="text-xs px-1.5 py-0.5 bg-white/10 text-gray-400 rounded">
                                    {CATEGORY_LABELS[usage.elementCategory]}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  角色：{usage.characterName}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                {usage.elementNeedToBuy ? (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      usage.elementPurchased
                                        ? 'bg-success/15 text-success'
                                        : 'bg-accent/15 text-accent'
                                    }`}
                                  >
                                    {usage.elementPurchased ? '已采购' : '需采购'}
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-500">
                                    无需采购
                                  </span>
                                )}
                                {usage.elementBudget > 0 && (
                                  <span
                                    className={`font-semibold text-sm ${
                                      usage.elementPurchased ? 'text-success' : 'text-accent'
                                    }`}
                                  >
                                    ¥{usage.elementBudget.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
