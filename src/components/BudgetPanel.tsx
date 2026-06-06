import { ChevronRight, Crown, Shirt, Scissors, Footprints, Sparkles, Sword, Check, PieChart, TrendingUp, ShoppingBag, Wallet, Package } from 'lucide-react';
import { ClothingCategory } from '../types';
import { useStore } from '../store/useStore';

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

const CATEGORY_COLORS: Record<ClothingCategory, string> = {
  head: '#FF6B6B',
  top: '#4ECDC4',
  bottom: '#45B7D1',
  shoes: '#96CEB4',
  accessory: '#FFEAA7',
  weapon: '#DDA0DD',
};

export function BudgetPanel() {
  const { showBudgetPanel, setShowBudgetPanel, getActiveCharacter, getBudgetSummary, toggleElementPurchased, activeCharacterId } = useStore();
  const character = getActiveCharacter();
  const budgetSummary = getBudgetSummary();

  if (!showBudgetPanel || !character || !budgetSummary) return null;

  const progress = budgetSummary.totalEstimated > 0 
    ? (budgetSummary.totalPurchased / budgetSummary.totalEstimated) * 100 
    : 0;

  const categoriesWithBudget = Object.entries(budgetSummary.categoryBreakdown)
    .filter(([, data]) => data.estimated > 0)
    .sort((a, b) => b[1].estimated - a[1].estimated);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-primary rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Wallet size={22} className="text-accent" />
                预算管理
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{character.name}</p>
            </div>
            <button
              onClick={() => setShowBudgetPanel(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-400 rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <PieChart size={14} />
                总预算
              </div>
              <div className="text-2xl font-bold text-white">
                ¥{budgetSummary.totalEstimated.toLocaleString()}
              </div>
            </div>
            <div className="bg-success/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-success text-xs mb-1">
                <Check size={14} />
                已采购
              </div>
              <div className="text-2xl font-bold text-success">
                ¥{budgetSummary.totalPurchased.toLocaleString()}
              </div>
            </div>
            <div className="bg-accent/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-accent text-xs mb-1">
                <TrendingUp size={14} />
                待采购
              </div>
              <div className="text-2xl font-bold text-accent">
                ¥{budgetSummary.totalRemaining.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">采购进度</span>
              <span className="text-sm font-medium text-success">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success to-success-light rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[50vh] p-6">
          {categoriesWithBudget.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <PieChart size={14} />
                分类占比
              </h3>
              <div className="space-y-3">
                {categoriesWithBudget.map(([category, data]) => {
                  const percentage = budgetSummary.totalEstimated > 0 
                    ? (data.estimated / budgetSummary.totalEstimated) * 100 
                    : 0;
                  const Icon = categoryIcons[category as ClothingCategory];
                  return (
                    <div key={category} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${CATEGORY_COLORS[category as ClothingCategory]}20` }}
                          >
                            <Icon size={16} style={{ color: CATEGORY_COLORS[category as ClothingCategory] }} />
                          </div>
                          <span className="font-medium text-white">
                            {categoryLabels[category as ClothingCategory]}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white">
                            ¥{data.estimated.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {percentage.toFixed(1)}% · 已购 ¥{data.purchased.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: CATEGORY_COLORS[category as ClothingCategory]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <ShoppingBag size={14} />
              元素明细
            </h3>
            <div className="space-y-2">
              {budgetSummary.elements.map((element) => {
                const Icon = categoryIcons[element.category];
                const fullElement = character.elements.find((el) => el.id === element.id);
                return (
                  <div
                    key={element.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                      element.purchasedStatus
                        ? 'bg-success/10'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <button
                      onClick={() => activeCharacterId && toggleElementPurchased(activeCharacterId, element.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                        element.purchasedStatus
                          ? 'border-success bg-success'
                          : 'border-white/30 hover:border-accent'
                      }`}
                    >
                      {element.purchasedStatus && (
                        <Check size={12} className="text-white" />
                      )}
                    </button>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${CATEGORY_COLORS[element.category]}20` }}>
                      <Icon size={16} style={{ color: CATEGORY_COLORS[element.category] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          element.purchasedStatus
                            ? 'text-gray-500 line-through'
                            : 'text-white'
                        }`}
                      >
                        {element.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {categoryLabels[element.category]}
                      </p>
                      {fullElement && fullElement.materials.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {fullElement.materials.map((m, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                m.materialId
                                  ? 'bg-accent/20 text-accent'
                                  : 'bg-white/10 text-gray-400'
                              }`}
                              title={m.notes || ''}
                            >
                              {m.materialId && <Package size={9} />}
                              {m.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-semibold ${
                        element.purchasedStatus ? 'text-success' : 'text-white'
                      }`}>
                        ¥{element.estimated.toLocaleString()}
                      </div>
                      {element.estimated > 0 && (
                        <div className="text-xs text-gray-500">
                          {element.purchasedStatus ? '已采购' : '待采购'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {budgetSummary.totalEstimated === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无预算数据</p>
              <p className="text-sm text-gray-600 mt-1">
                在编辑服装元素时录入预算信息
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
