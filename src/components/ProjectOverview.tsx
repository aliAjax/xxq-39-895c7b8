import { useState, useMemo } from 'react';
import { Package, ShoppingCart, Hammer, Sparkles, Clock, AlertCircle, Filter, X, Plus, Save, Eye, Check, Wallet, PieChart, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { OverviewCompletionFilter } from '../types';
import { calculateProjectBudget, calculateCharacterBudget } from '../utils/budgetUtils';

export function ProjectOverview() {
  const { characters, setActiveCharacter, setShowProjectOverview, getCharacterStats, getAllSources, savedViews, addSavedView, deleteSavedView } = useStore();

  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<OverviewCompletionFilter>('all');
  const [hasQuestionsFilter, setHasQuestionsFilter] = useState<boolean>(false);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [newViewName, setNewViewName] = useState<string>('');

  const allSources = getAllSources();

  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      if (sourceFilter !== 'all' && char.source !== sourceFilter) {
        return false;
      }

      const stats = getCharacterStats(char.id);
      if (!stats) return false;

      if (completionFilter !== 'all') {
        if (completionFilter === 'not_started' && stats.completionRate !== 0) {
          return false;
        }
        if (completionFilter === 'in_progress' && (stats.completionRate === 0 || stats.completionRate === 100)) {
          return false;
        }
        if (completionFilter === 'completed' && stats.completionRate !== 100) {
          return false;
        }
      }

      if (hasQuestionsFilter && !stats.hasUnansweredQuestions) {
        return false;
      }

      return true;
    });
  }, [characters, sourceFilter, completionFilter, hasQuestionsFilter, getCharacterStats]);

  const overallStats = useMemo(() => {
    let totalElements = 0;
    let completedElements = 0;
    let pendingPurchase = 0;
    let inProgress = 0;
    let expertCount = 0;
    let hasQuestions = 0;

    characters.forEach((char) => {
      const stats = getCharacterStats(char.id);
      if (stats) {
        totalElements += stats.totalElements;
        completedElements += stats.completedCount;
        pendingPurchase += stats.pendingPurchaseCount;
        inProgress += stats.inProgressCount;
        expertCount += stats.expertDifficultyCount;
        if (stats.hasUnansweredQuestions) hasQuestions++;
      }
    });

    const completionRate = totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0;

    return {
      totalCharacters: characters.length,
      totalElements,
      completedElements,
      completionRate,
      pendingPurchase,
      inProgress,
      expertCount,
      hasQuestions,
    };
  }, [characters, getCharacterStats]);

  const projectBudget = useMemo(() => {
    return calculateProjectBudget(characters);
  }, [characters]);

  const budgetProgress = projectBudget.totalEstimated > 0
    ? (projectBudget.totalPurchased / projectBudget.totalEstimated) * 100
    : 0;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? '刚刚' : `${diffMins} 分钟前`;
      }
      return `${diffHours} 小时前`;
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const handleCharacterClick = (characterId: string) => {
    setActiveCharacter(characterId);
    setShowProjectOverview(false);
  };

  const clearFilters = () => {
    setSourceFilter('all');
    setCompletionFilter('all');
    setHasQuestionsFilter(false);
    setActiveViewId(null);
  };

  const hasActiveFilters = sourceFilter !== 'all' || completionFilter !== 'all' || hasQuestionsFilter;

  const applyView = (viewId: string) => {
    const view = savedViews.find((v) => v.id === viewId);
    if (view) {
      setSourceFilter(view.filters.sourceFilter);
      setCompletionFilter(view.filters.completionFilter);
      setHasQuestionsFilter(view.filters.hasQuestionsFilter);
      setActiveViewId(viewId);
    }
  };

  const handleSaveView = () => {
    if (newViewName.trim() === '') return;
    addSavedView(newViewName.trim(), {
      sourceFilter,
      completionFilter,
      hasQuestionsFilter,
    });
    setNewViewName('');
    setShowSaveModal(false);
  };

  const handleDeleteView = (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeViewId === viewId) {
      setActiveViewId(null);
    }
    deleteSavedView(viewId);
  };

  const openSaveModal = () => {
    setNewViewName('');
    setShowSaveModal(true);
  };

  const getCompletionColor = (rate: number) => {
    if (rate === 100) return 'from-success to-success-light';
    if (rate >= 50) return 'from-warning to-warning-light';
    if (rate > 0) return 'from-info to-info-light';
    return 'from-gray-500 to-gray-400';
  };

  const getCompletionLabel = (rate: number, total: number) => {
    if (total === 0) return '未开始';
    if (rate === 100) return '已完成';
    if (rate >= 50) return '制作中';
    if (rate > 0) return '刚开始';
    return '未开始';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-primary">
      <div className="p-6 border-b border-white/10 bg-primary-light/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">多角色项目总览</h2>
            <p className="text-sm text-gray-400 mt-1">同时管理多个 COS 角色，掌握整体进度</p>
          </div>
          <button
            onClick={() => setShowProjectOverview(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all"
          >
            <X size={18} />
            返回工作区
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 border-b border-white/10">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Package size={16} />
            <span>角色总数</span>
          </div>
          <div className="text-3xl font-bold text-white">{overallStats.totalCharacters}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Hammer size={16} />
            <span>元素总数</span>
          </div>
          <div className="text-3xl font-bold text-white">{overallStats.totalElements}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Sparkles size={16} />
            <span>整体完成度</span>
          </div>
          <div className="text-3xl font-bold text-success">{overallStats.completionRate}%</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <ShoppingCart size={16} />
            <span>待采购</span>
          </div>
          <div className="text-3xl font-bold text-warning">{overallStats.pendingPurchase}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Hammer size={16} />
            <span>制作中</span>
          </div>
          <div className="text-3xl font-bold text-info">{overallStats.inProgress}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Sparkles size={16} />
            <span>专家难度</span>
          </div>
          <div className="text-3xl font-bold text-danger">{overallStats.expertCount}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <AlertCircle size={16} />
            <span>有待确认</span>
          </div>
          <div className="text-3xl font-bold text-warning">{overallStats.hasQuestions}</div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className="text-accent" />
          <h3 className="text-sm font-semibold text-white">项目预算总览</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <PieChart size={14} />
              总预算
            </div>
            <div className="text-2xl font-bold text-white">
              ¥{projectBudget.totalEstimated.toLocaleString()}
            </div>
          </div>
          <div className="bg-success/10 rounded-xl p-4 border border-success/20">
            <div className="flex items-center gap-2 text-success text-xs mb-1">
              <Check size={14} />
              已采购金额
            </div>
            <div className="text-2xl font-bold text-success">
              ¥{projectBudget.totalPurchased.toLocaleString()}
            </div>
          </div>
          <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
            <div className="flex items-center gap-2 text-accent text-xs mb-1">
              <TrendingUp size={14} />
              待采购金额
            </div>
            <div className="text-2xl font-bold text-accent">
              ¥{projectBudget.totalRemaining.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="mt-3 bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">采购进度</span>
            <span className="text-sm font-medium text-success">
              {Math.round(budgetProgress)}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success to-success-light rounded-full transition-all duration-500"
              style={{ width: `${budgetProgress}%` }}
            />
          </div>
        </div>
      </div>

      {savedViews.length > 0 && (
        <div className="px-6 py-3 border-b border-white/10 flex items-center gap-2 flex-wrap bg-white/[0.02]">
          <div className="flex items-center gap-2 text-gray-400 mr-2">
            <Eye size={16} />
            <span className="text-xs font-medium">常用视图</span>
          </div>
          {savedViews.map((view) => (
            <div
              key={view.id}
              onClick={() => applyView(view.id)}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                activeViewId === view.id
                  ? 'bg-accent/20 text-accent border border-accent/40'
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {activeViewId === view.id && <Check size={12} />}
              <span className="max-w-[120px] truncate">{view.name}</span>
              <button
                onClick={(e) => handleDeleteView(view.id, e)}
                className="opacity-0 group-hover:opacity-100 ml-0.5 text-gray-400 hover:text-danger transition-all"
                title="删除视图"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={openSaveModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 border border-dashed border-white/20 hover:border-white/40 transition-all"
          >
            <Plus size={12} />
            <span>保存当前</span>
          </button>
        </div>
      )}

      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter size={18} />
          <span className="text-sm font-medium">筛选</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">作品来源:</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent/50"
          >
            <option value="all">全部</option>
            {allSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">完成状态:</label>
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value as OverviewCompletionFilter)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent/50"
          >
            <option value="all">全部</option>
            <option value="not_started">未开始</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasQuestionsFilter}
            onChange={(e) => setHasQuestionsFilter(e.target.checked)}
            className="w-4 h-4 rounded border-white/30 bg-white/10 text-accent focus:ring-accent/50"
          />
          <span className="text-sm text-gray-300">仅显示有待确认问题</span>
        </label>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-accent hover:text-accent-light transition-colors"
          >
            清除筛选
          </button>
        )}

        <button
          onClick={openSaveModal}
          className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all ml-auto"
        >
          <Save size={14} />
          <span>保存视图</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filteredCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Package size={48} className="mb-4 opacity-50" />
            <p className="text-lg">没有符合条件的角色</p>
            <p className="text-sm mt-1">尝试调整筛选条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCharacters.map((char, index) => {
              const stats = getCharacterStats(char.id);
              const budget = calculateCharacterBudget(char);
              if (!stats) return null;

              const completionLabel = getCompletionLabel(stats.completionRate, stats.totalElements);
              const gradientClass = getCompletionColor(stats.completionRate);
              const budgetProgress = budget.totalEstimated > 0
                ? (budget.totalPurchased / budget.totalEstimated) * 100
                : 0;

              return (
                <div
                  key={char.id}
                  onClick={() => handleCharacterClick(char.id)}
                  className="group bg-white/5 rounded-xl p-5 border border-white/10 cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate group-hover:text-accent transition-colors">
                        {char.name}
                      </h3>
                      <p className="text-sm text-gray-400 truncate mt-0.5">
                        {char.source || '未设置来源'}
                      </p>
                    </div>
                    {stats.hasUnansweredQuestions && (
                      <div className="flex-shrink-0 ml-2">
                        <AlertCircle size={18} className="text-warning" />
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">完成度</span>
                      <span className={`font-medium ${
                        stats.completionRate === 100 ? 'text-success' :
                        stats.completionRate > 0 ? 'text-info' : 'text-gray-400'
                      }`}>
                        {stats.completionRate}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-500`}
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.completedCount} / {stats.totalElements} 个元素 · {completionLabel}
                    </div>
                  </div>

                  <div className="mb-4">
                    {budget.totalEstimated > 0 ? (
                      <>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Wallet size={14} />
                            预算进度
                          </span>
                          <span className="font-medium text-success">
                            {Math.round(budgetProgress)}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-success to-success-light rounded-full transition-all duration-500"
                            style={{ width: `${budgetProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>总预算 ¥{budget.totalEstimated.toLocaleString()}</span>
                          <span>已购 ¥{budget.totalPurchased.toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Wallet size={14} />
                            预算进度
                          </span>
                          <span className="font-medium text-gray-500">
                            暂无
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-600/50 rounded-full" style={{ width: '0%' }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>暂未设置预算</span>
                          <span>¥0</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-warning">{stats.pendingPurchaseCount}</div>
                      <div className="text-[10px] text-gray-400">待采购</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-info">{stats.inProgressCount}</div>
                      <div className="text-[10px] text-gray-400">制作中</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-danger">{stats.expertDifficultyCount}</div>
                      <div className="text-[10px] text-gray-400">专家难度</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDate(stats.lastUpdated)}</span>
                    </div>
                    <span className="text-accent group-hover:translate-x-1 transition-transform">
                      查看详情 →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSaveModal(false)}>
          <div
            className="bg-primary-light border border-white/10 rounded-xl p-6 w-96 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">保存当前视图</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              将当前的筛选条件保存为常用视图，方便下次快速切换。
            </p>
            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-2">视图名称</label>
              <input
                type="text"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveView();
                }}
                placeholder="例如：进行中的项目"
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSaveView}
                disabled={newViewName.trim() === ''}
                className="flex-1 px-4 py-2 bg-accent hover:bg-accent-light text-white rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
