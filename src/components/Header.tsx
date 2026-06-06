import { Image, FileJson, ShoppingCart, ImageIcon, Palette, Wallet, Printer, Calendar, LayoutGrid } from 'lucide-react';
import { useStore } from '../store/useStore';
import { exportToJSON, exportToImage } from '../utils/export';

export function Header() {
  const {
    activeCharacterId,
    characters,
    updateCharacter,
    getCompletionRate,
    setShowShoppingList,
    showShoppingList,
    setShowReferenceBoard,
    showReferenceBoard,
    setShowColorPalette,
    showColorPalette,
    setShowBudgetPanel,
    showBudgetPanel,
    setShowPrintSpecification,
    showPrintSpecification,
    setShowScheduleCalendar,
    showScheduleCalendar,
    setShowProjectOverview,
    showProjectOverview,
  } = useStore();

  const character = characters.find((c) => c.id === activeCharacterId);
  const completionRate = getCompletionRate();

  if (!character) {
    return (
      <header className="bg-primary-light/50 backdrop-blur border-b border-white/10 p-6">
        <p className="text-gray-400">请选择或创建一个角色</p>
      </header>
    );
  }

  const handleExportImage = async () => {
    await exportToImage('main-content', `${character.name}-服装设定`);
  };

  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (completionRate / 100) * circumference;

  return (
    <header className="bg-primary-light/50 backdrop-blur border-b border-white/10">
      <div className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4ecdc4" />
                  <stop offset="100%" stopColor="#6ee7de" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{completionRate}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={character.name}
              onChange={(e) =>
                updateCharacter(character.id, { name: e.target.value })
              }
              className="text-2xl font-serif font-bold bg-transparent border-none outline-none text-white placeholder-gray-500 w-full"
              placeholder="角色名称"
            />
            <div className="flex items-center gap-3 mt-2">
              <input
                type="text"
                value={character.source}
                onChange={(e) =>
                  updateCharacter(character.id, { source: e.target.value })
                }
                className="text-sm bg-white/10 border border-transparent focus:border-accent/50 rounded px-3 py-1.5 text-gray-300 outline-none transition-all w-48"
                placeholder="作品来源"
              />
              <span className="text-sm text-gray-500">
                {character.elements.length} 个服装元素
              </span>
            </div>
            <textarea
              value={character.description}
              onChange={(e) =>
                updateCharacter(character.id, { description: e.target.value })
              }
              className="mt-2 text-sm text-gray-400 bg-transparent border-none outline-none resize-none w-full"
              placeholder="角色简介..."
              rows={1}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProjectOverview(!showProjectOverview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                showProjectOverview
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <LayoutGrid size={18} />
              项目总览
            </button>
            <button
              onClick={() => setShowReferenceBoard(!showReferenceBoard)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                showReferenceBoard
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <ImageIcon size={18} />
              参考图
            </button>
            <button
              onClick={() => setShowColorPalette(!showColorPalette)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                showColorPalette
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Palette size={18} />
              色板
            </button>
            <button
              onClick={() => setShowShoppingList(!showShoppingList)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                showShoppingList
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <ShoppingCart size={18} />
              采购清单
            </button>
            <button
              onClick={() => setShowBudgetPanel(!showBudgetPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                showBudgetPanel
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Wallet size={18} />
              预算管理
            </button>
            <button
              onClick={() => setShowScheduleCalendar(!showScheduleCalendar)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                showScheduleCalendar
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Calendar size={18} />
              排期日历
            </button>
            <button
              onClick={() => setShowPrintSpecification(!showPrintSpecification)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                showPrintSpecification
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Printer size={18} />
              制作说明书
            </button>
            <button
              onClick={() => exportToJSON(character)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all"
            >
              <FileJson size={18} />
              JSON
            </button>
            <button
              onClick={handleExportImage}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all"
            >
              <Image size={18} />
              图片
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
