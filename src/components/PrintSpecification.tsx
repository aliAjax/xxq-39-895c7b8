import { X, Printer, Download, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { Character, ClothingCategory, CATEGORY_LABELS, DIFFICULTY_LABELS } from '../types';
import { useStore } from '../store/useStore';
import { useToastStore } from '../store/useToastStore';
import { exportPrintSpecification } from '../utils/export';

interface PrintSpecificationProps {
  character: Character;
  onClose: () => void;
}

const CATEGORY_ORDER: ClothingCategory[] = ['head', 'top', 'bottom', 'shoes', 'accessory', 'weapon'];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/50',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  hard: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  expert: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export function PrintSpecification({ character, onClose }: PrintSpecificationProps) {
  const { getTaskProgress } = useStore();
  const { showToast } = useToastStore();

  const elementsByCategory = character.elements.reduce((acc, el) => {
    if (!acc[el.category]) {
      acc[el.category] = [];
    }
    acc[el.category].push(el);
    return acc;
  }, {} as Record<ClothingCategory, typeof character.elements>);

  const allColors = [...new Set(character.elements.flatMap((el) => el.colors))];
  const allMaterials = [
    ...new Map(
      character.elements.flatMap((el) => el.materials).map((m) => [m.name, m])
    ).values(),
  ];
  const questionsList = character.elements.filter((el) => el.questions.trim());
  const needToBuyItems = character.elements.filter((el) => el.needToBuy);

  const getOverallDifficulty = (): keyof typeof DIFFICULTY_LABELS => {
    if (character.elements.length === 0) return 'easy';
    const difficultyOrder: (keyof typeof DIFFICULTY_LABELS)[] = ['easy', 'medium', 'hard', 'expert'];
    const maxDiff = character.elements.reduce((max, el) => {
      const idx = difficultyOrder.indexOf(el.difficulty);
      return idx > max ? idx : max;
    }, 0);
    return difficultyOrder[maxDiff];
  };

  const handleExportImage = async () => {
    try {
      await exportPrintSpecification(character);
      showToast('success', '制作说明书导出成功');
    } catch (error) {
      const message = error instanceof Error ? error.message : '导出失败';
      showToast('error', message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-primary-light border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl animate-slide-in max-h-[95vh] flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Printer size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">制作说明书</h2>
              <p className="text-xs text-gray-400">适合打印或分享给裁缝的规格说明</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportImage}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-colors font-medium"
            >
              <Download size={18} />
              导出图片
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div id="print-spec-content" className="bg-primary rounded-2xl p-8 space-y-8">
            <div className="border-b border-white/10 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white">{character.name}</h1>
                  {character.source && (
                    <p className="text-gray-400 mt-1">来源: {character.source}</p>
                  )}
                  {character.description && (
                    <p className="text-gray-500 mt-2 text-sm max-w-xl">{character.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{character.elements.length}</div>
                    <div className="text-xs text-gray-500">服装元素</div>
                  </div>
                  <div className="text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${DIFFICULTY_COLORS[getOverallDifficulty()]}`}>
                      {DIFFICULTY_LABELS[getOverallDifficulty()]}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">整体难度</div>
                  </div>
                </div>
              </div>
            </div>

            {allColors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-accent rounded-full"></div>
                  颜色方案
                </h3>
                <div className="flex flex-wrap gap-3">
                  {allColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-300">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allMaterials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  材质清单
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allMaterials.map((material, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1.5 rounded-lg text-sm border ${
                        material.materialId
                          ? 'bg-accent/10 text-accent border-accent/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                      title={material.notes || ''}
                    >
                      {material.name}
                      {material.materialId && ' (库)'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                元素详情
              </h3>
              <div className="space-y-6">
                {CATEGORY_ORDER.map((category) => {
                  const elements = elementsByCategory[category];
                  if (!elements || elements.length === 0) return null;

                  return (
                    <div key={category} className="bg-white/5 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">
                        {CATEGORY_LABELS[category]} ({elements.length})
                      </h4>
                      <div className="grid gap-3">
                        {elements.map((element) => {
                          const progress = getTaskProgress(element);
                          return (
                            <div
                              key={element.id}
                              className="bg-white/5 rounded-lg p-4 border border-white/10"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium text-white">{element.name || '未命名'}</h5>
                                    {element.needToBuy && (
                                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                                        需采购
                                      </span>
                                    )}
                                  </div>
                                  {element.materials.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      材质: {element.materials.map((m) => m.name).join(', ')}
                                    </p>
                                  )}
                                  {element.notes && (
                                    <p className="text-xs text-gray-400 mt-1">{element.notes}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium border ${DIFFICULTY_COLORS[element.difficulty]}`}>
                                    {DIFFICULTY_LABELS[element.difficulty]}
                                  </span>
                                  <div className="text-xs text-gray-500">{progress}%</div>
                                </div>
                              </div>
                              {element.colors.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-3">
                                  {element.colors.map((color, i) => (
                                    <div
                                      key={i}
                                      className="w-4 h-4 rounded-full border border-white/20"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                </div>
                              )}
                              <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {needToBuyItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-red-500 rounded-full"></div>
                  采购清单
                  <span className="text-sm font-normal text-gray-500">({needToBuyItems.length}项)</span>
                </h3>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <div className="grid gap-2">
                    {needToBuyItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded border-2 border-red-500/50 flex items-center justify-center">
                          <CheckCircle size={12} className="text-red-400 opacity-0" />
                        </div>
                        <span className="text-gray-300">{item.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {questionsList.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-yellow-500 rounded-full"></div>
                  待确认问题
                </h3>
                <div className="space-y-3">
                  {questionsList.map((element) => (
                    <div
                      key={element.id}
                      className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-white text-sm">{element.name}</h5>
                          <p className="text-yellow-300/80 text-sm mt-1 whitespace-pre-wrap">
                            {element.questions}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {character.referenceImages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-cyan-500 rounded-full"></div>
                  参考图
                  <span className="text-sm font-normal text-gray-500">
                    ({character.referenceImages.length}张)
                  </span>
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {character.referenceImages.map((img) => (
                    <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                      <img
                        src={img.url}
                        alt={img.notes || '参考图'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>生成时间: {new Date().toLocaleString()}</span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-accent" />
                  角色服装设定拆解工具
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
