import { Download, Check, ChevronRight, Crown, Shirt, Scissors, Footprints, Sparkles, Sword, Wallet, Package, CheckCircle2, Circle } from 'lucide-react';
import { ClothingCategory } from '../types';
import { useStore } from '../store/useStore';
import { exportShoppingList } from '../utils/export';

const categoryIcons: Record<ClothingCategory, React.ElementType> = {
  head: Crown,
  top: Shirt,
  bottom: Scissors,
  shoes: Footprints,
  accessory: Sparkles,
  weapon: Sword,
};

const categoryLabels: Record<ClothingCategory, string> = {
  head: '头部',
  top: '上衣',
  bottom: '下装',
  shoes: '鞋袜',
  accessory: '配饰',
  weapon: '武器',
};

export function ShoppingList() {
  const { showShoppingList, setShowShoppingList, getActiveCharacter } = useStore();
  const character = getActiveCharacter();

  if (!showShoppingList) return null;

  const shoppingItems = character?.elements.filter((el) => el.needToBuy) || [];

  const groupedItems = shoppingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<ClothingCategory, typeof shoppingItems>);

  const completedCount = shoppingItems.filter((el) => el.budget?.purchased).length;
  const progress = shoppingItems.length > 0 ? (completedCount / shoppingItems.length) * 100 : 0;

  const totalBudget = shoppingItems.reduce((sum, item) => {
    const budget = item.budget;
    return sum + (budget ? budget.materialCost + budget.toolCost + budget.outsourcingCost : 0);
  }, 0);

  const purchasedBudget = shoppingItems.reduce((sum, item) => {
    const budget = item.budget;
    if (budget?.purchased) {
      return sum + budget.materialCost + budget.toolCost + budget.outsourcingCost;
    }
    return sum;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-primary rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">采购清单</h2>
              <p className="text-sm text-gray-400 mt-0.5">{character?.name}</p>
            </div>
            <button
              onClick={() => setShowShoppingList(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-400 rotate-180" />
            </button>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">采购进度</span>
              <span className="text-sm font-medium text-success">
                {completedCount} / {shoppingItems.length}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success to-success-light rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {totalBudget > 0 && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Wallet size={14} className="text-accent" />
                <span className="text-gray-400">预算:</span>
                <span className="font-semibold text-white">¥{totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-success" />
                <span className="text-gray-400">已采购:</span>
                <span className="font-semibold text-success">¥{purchasedBudget.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-y-auto max-h-[50vh] p-6">
          {Object.entries(groupedItems).map(([category, items]) => {
            const Icon = categoryIcons[category as ClothingCategory];
            return (
              <div key={category} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} className="text-accent" />
                  <h3 className="font-semibold text-white">
                    {categoryLabels[category as ClothingCategory]}
                  </h3>
                  <span className="text-xs text-gray-500">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => {
                    const budget = item.budget;
                    const itemBudget = budget ? budget.materialCost + budget.toolCost + budget.outsourcingCost : 0;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          budget?.purchased
                            ? 'bg-success/10'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            budget?.purchased
                              ? 'border-success bg-success'
                              : 'border-white/30'
                          }`}
                        >
                          {budget?.purchased && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium truncate ${
                              budget?.purchased
                                ? 'text-gray-500 line-through'
                                : 'text-white'
                            }`}
                          >
                            {item.name}
                          </p>
                          {item.materials.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {item.materials.map((m, i) => (
                                <div
                                  key={i}
                                  className={`flex items-start gap-1.5 text-xs ${
                                    budget?.purchased ? 'text-gray-600' : 'text-gray-500'
                                  }`}
                                >
                                  {m.materialId && (
                                    <Package size={11} className="text-accent mt-0.5 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className={m.materialId ? 'text-accent/80' : ''}>
                                        {m.name}
                                      </span>
                                      {m.needToBuy !== undefined && (
                                        <span className={`flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded ${
                                          m.needToBuy
                                            ? 'bg-accent/15 text-accent'
                                            : 'bg-success/15 text-success'
                                        }`}>
                                          {m.needToBuy ? (
                                            <><CheckCircle2 size={9} /> 需采购</>
                                          ) : (
                                            <><Circle size={9} /> 已有</>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                    {m.notes && (
                                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1">
                                        {m.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {itemBudget > 0 && (
                          <div className="text-right flex-shrink-0">
                            <span className={`font-semibold ${
                              budget?.purchased ? 'text-success' : 'text-accent'
                            }`}>
                              ¥{itemBudget.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {shoppingItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">采购清单为空</p>
              <p className="text-sm text-gray-600 mt-1">
                在编辑元素时勾选"加入采购清单"
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10">
          <button
            onClick={() => character && exportShoppingList(character)}
            disabled={!character || shoppingItems.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            <Download size={18} />
            导出采购清单
          </button>
        </div>
      </div>
    </div>
  );
}
