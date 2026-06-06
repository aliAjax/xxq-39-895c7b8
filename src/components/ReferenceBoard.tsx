import { useState } from 'react';
import { X, Plus, Trash2, Crown, Shirt, Scissors, Footprints, Sparkles, Sword, Image as ImageIcon, FileText, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ReferenceImage, ReferenceTag, REFERENCE_TAG_LABELS, ClothingCategory, CATEGORY_LABELS } from '../types';

const tagIcons: Record<ReferenceTag, React.ElementType> = {
  head: Crown,
  top: Shirt,
  bottom: Scissors,
  shoes: Footprints,
  accessory: Sparkles,
  weapon: Sword,
};

const tagColors: Record<ReferenceTag, string> = {
  head: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  top: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bottom: 'bg-green-500/20 text-green-400 border-green-500/30',
  shoes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accessory: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  weapon: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const activeTagColors: Record<ReferenceTag, string> = {
  head: 'bg-purple-500 text-white border-purple-500',
  top: 'bg-blue-500 text-white border-blue-500',
  bottom: 'bg-green-500 text-white border-green-500',
  shoes: 'bg-yellow-500 text-white border-yellow-500',
  accessory: 'bg-pink-500 text-white border-pink-500',
  weapon: 'bg-red-500 text-white border-red-500',
};

export function ReferenceBoard() {
  const {
    activeCharacterId,
    showReferenceBoard,
    setShowReferenceBoard,
    getFilteredReferenceImages,
    deleteReferenceImage,
    toggleReferenceTag,
    addReferenceImage,
    addElement,
  } = useStore();

  const [tagFilter, setTagFilter] = useState<ReferenceTag | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageNotes, setNewImageNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<ReferenceTag[]>([]);
  const [selectedImage, setSelectedImage] = useState<ReferenceImage | null>(null);
  const [showCreateElementModal, setShowCreateElementModal] = useState(false);
  const [creatingFromImage, setCreatingFromImage] = useState<ReferenceImage | null>(null);
  const [newElementName, setNewElementName] = useState('');
  const [newElementCategory, setNewElementCategory] = useState<ClothingCategory>('top');
  const [newElementNeedToBuy, setNewElementNeedToBuy] = useState(false);

  const images = getFilteredReferenceImages(tagFilter);

  const handleAddImage = () => {
    if (!activeCharacterId || !newImageUrl.trim()) return;

    addReferenceImage(activeCharacterId, {
      url: newImageUrl.trim(),
      tags: selectedTags,
      notes: newImageNotes.trim(),
    });

    setNewImageUrl('');
    setNewImageNotes('');
    setSelectedTags([]);
    setShowAddModal(false);
  };

  const toggleTag = (tag: ReferenceTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleDeleteImage = (imageId: string) => {
    if (!activeCharacterId) return;
    if (confirm('确定要删除这张参考图吗？')) {
      deleteReferenceImage(activeCharacterId, imageId);
    }
  };

  const openCreateElementModal = (image: ReferenceImage) => {
    setCreatingFromImage(image);
    setNewElementName('');
    setNewElementCategory(image.tags.length > 0 ? image.tags[0] : 'top');
    setNewElementNeedToBuy(false);
    setShowCreateElementModal(true);
  };

  const handleCreateElement = () => {
    if (!activeCharacterId || !creatingFromImage || !newElementName.trim()) return;

    addElement(activeCharacterId, {
      name: newElementName.trim(),
      category: newElementCategory,
      colors: [],
      materials: [],
      difficulty: 'medium',
      referenceImages: [creatingFromImage.url],
      notes: creatingFromImage.notes || '',
      questions: '',
      status: 'pending',
      needToBuy: newElementNeedToBuy,
      tasks: [],
    });

    setShowCreateElementModal(false);
    setCreatingFromImage(null);
    setSelectedImage(null);
    setShowReferenceBoard(false);
  };

  if (!showReferenceBoard) return null;

  return (
    <>
      <div className="w-96 bg-primary-light border-l border-white/10 flex flex-col animate-slide-in">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-accent" />
            <h2 className="font-semibold text-white">参考图看板</h2>
            <span className="text-xs text-gray-500">({images.length})</span>
          </div>
          <button
            onClick={() => setShowReferenceBoard(false)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                tagFilter === 'all'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}
            >
              全部
            </button>
            {(Object.keys(REFERENCE_TAG_LABELS) as ReferenceTag[]).map((tag) => {
              const Icon = tagIcons[tag];
              return (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                    tagFilter === tag
                      ? activeTagColors[tag]
                      : `${tagColors[tag]} hover:opacity-80`
                  }`}
                >
                  <Icon size={12} />
                  {REFERENCE_TAG_LABELS[tag]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {images.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-500 mb-2">暂无参考图</p>
              <p className="text-sm text-gray-600 mb-4">点击下方按钮添加第一张参考图</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-accent/30 transition-all"
                >
                  <div
                    className="aspect-square cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center bg-white/5">
                      <FileText size={32} className="text-gray-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateElementModal(image);
                      }}
                      className="p-1.5 bg-success/80 hover:bg-success rounded transition-colors"
                      title="创建服装元素"
                    >
                      <Plus size={14} className="text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}
                      className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded transition-colors"
                      title="删除图片"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex flex-wrap gap-1">
                      {image.tags.length > 0 ? (
                        image.tags.map((tag) => {
                          const Icon = tagIcons[tag];
                          return (
                            <button
                              key={tag}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (activeCharacterId) {
                                  toggleReferenceTag(activeCharacterId, image.id, tag);
                                }
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-0.5 ${activeTagColors[tag]}`}
                              title="点击移除标签"
                            >
                              <Icon size={10} />
                              {REFERENCE_TAG_LABELS[tag]}
                            </button>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-gray-500">未分类</span>
                      )}
                    </div>
                    {image.notes && (
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                        {image.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            添加参考图
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-primary-light border border-white/10 rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">添加参考图</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">图片链接 *</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                  placeholder="粘贴图片URL"
                  autoFocus
                />
              </div>

              {newImageUrl && (
                <div className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={newImageUrl}
                    alt="预览"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-40 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">图片无法加载</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">分类标签</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(REFERENCE_TAG_LABELS) as ReferenceTag[]).map((tag) => {
                    const Icon = tagIcons[tag];
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-2 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? activeTagColors[tag]
                            : `${tagColors[tag]} hover:opacity-80`
                        }`}
                      >
                        <Icon size={14} />
                        {REFERENCE_TAG_LABELS[tag]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">备注</label>
                <textarea
                  value={newImageNotes}
                  onChange={(e) => setNewImageNotes(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 resize-none text-sm"
                  rows={2}
                  placeholder="记录一些关于这张图的要点..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddImage}
                disabled={!newImageUrl.trim()}
                className="flex-1 py-2.5 bg-accent hover:bg-accent-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>

            <img
              src={selectedImage.url}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            <div className="mt-4 bg-primary-light border border-white/10 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-2">标签</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.tags.length > 0 ? (
                      selectedImage.tags.map((tag) => {
                        const Icon = tagIcons[tag];
                        return (
                          <span
                            key={tag}
                            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 ${activeTagColors[tag]}`}
                          >
                            <Icon size={12} />
                            {REFERENCE_TAG_LABELS[tag]}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-gray-500">未设置标签</span>
                    )}
                  </div>
                </div>

                {selectedImage.notes && (
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">备注</p>
                    <p className="text-sm text-gray-300">{selectedImage.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    openCreateElementModal(selectedImage);
                  }}
                  className="flex-1 py-2 bg-success hover:bg-success/80 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  从此图创建服装元素
                </button>

                <button
                  onClick={() => {
                    handleDeleteImage(selectedImage.id);
                    setSelectedImage(null);
                  }}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateElementModal && creatingFromImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setShowCreateElementModal(false)}
        >
          <div
            className="bg-primary-light border border-white/10 rounded-2xl p-6 w-full max-w-md animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">创建服装元素</h3>
              <button
                onClick={() => setShowCreateElementModal(false)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
                <img
                  src={creatingFromImage.url}
                  alt=""
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {creatingFromImage.tags.length > 0 ? (
                      creatingFromImage.tags.map((tag) => {
                        const Icon = tagIcons[tag];
                        return (
                          <span
                            key={tag}
                            className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-0.5 ${activeTagColors[tag]}`}
                          >
                            <Icon size={10} />
                            {REFERENCE_TAG_LABELS[tag]}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-gray-500">未分类</span>
                    )}
                  </div>
                  {creatingFromImage.notes && (
                    <p className="text-xs text-gray-400 line-clamp-2">
                      备注：{creatingFromImage.notes}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">元素名称 *</label>
                <input
                  type="text"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateElement()}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                  placeholder="例如：发饰、外套等"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">部位分类</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_LABELS) as (ClothingCategory | 'all')[])
                    .filter((k) => k !== 'all')
                    .map((category) => {
                      const cat = category as ClothingCategory;
                      const Icon = tagIcons[cat];
                      const isSelected = newElementCategory === cat;
                      return (
                        <button
                          key={category}
                          onClick={() => setNewElementCategory(cat)}
                          className={`text-xs px-3 py-2 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? activeTagColors[cat]
                              : `${tagColors[cat]} hover:opacity-80`
                          }`}
                        >
                          <Icon size={14} />
                          {CATEGORY_LABELS[category]}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createElementNeedToBuy"
                  checked={newElementNeedToBuy}
                  onChange={(e) => setNewElementNeedToBuy(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-accent focus:ring-accent/50"
                />
                <label htmlFor="createElementNeedToBuy" className="text-sm text-gray-300 flex items-center gap-1.5">
                  <ShoppingCart size={14} />
                  加入采购清单
                </label>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">创建后将自动：</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    把参考图加入元素的参考图列表
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    继承参考图的备注信息
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    关闭参考图看板并打开元素编辑面板
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateElementModal(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateElement}
                disabled={!newElementName.trim()}
                className="flex-1 py-2.5 bg-accent hover:bg-accent-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                创建元素
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
