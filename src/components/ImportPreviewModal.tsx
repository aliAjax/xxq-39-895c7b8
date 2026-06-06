import { useState } from 'react';
import { X, Upload, AlertTriangle, Plus, ArrowRight, Package, ChevronDown, ChevronUp, Layers, Image, Palette, DollarSign, Info, Merge } from 'lucide-react';
import { ImportPreview, ImportConflict, ConflictResolution, MaterialImportConflict, MaterialConflictResolution, CharacterDiffDetail } from '../types';
import { useStore } from '../store/useStore';
import { useMaterialStore } from '../store/useMaterialStore';
import { applyImport } from '../utils/projectPackage';

interface ImportPreviewModalProps {
  preview: ImportPreview;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: '名称',
  applicableParts: '适用部位',
  notes: '备注',
  needToBuy: '采购标记',
  createdAt: '创建时间',
  updatedAt: '更新时间',
};

function getFieldLabel(field: string): string {
  if (FIELD_LABELS[field]) {
    return FIELD_LABELS[field];
  }
  return field;
}

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined) {
    return '无';
  }

  if (typeof value === 'boolean') {
    if (field === 'needToBuy') {
      return value ? '需要采购' : '不需要采购';
    }
    return value ? '是' : '否';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '无';
    return value.join(', ');
  }

  if (typeof value === 'number') {
    if (field === 'createdAt' || field === 'updatedAt') {
      return new Date(value).toLocaleString();
    }
    if (!isNaN(value) && isFinite(value) && value > 1e12) {
      return new Date(value).toLocaleString();
    }
    return String(value);
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}

function CollapsibleSection({ title, icon, children, defaultOpen = false, count }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-white font-medium">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {isOpen && <div className="px-3 pb-3 pt-1 space-y-2">{children}</div>}
    </div>
  );
}

interface CharacterDiffViewProps {
  diff: CharacterDiffDetail;
}

function CharacterDiffView({ diff }: CharacterDiffViewProps) {
  const newElementCount = diff.elementCount.newElements.length;
  const removedElementCount = diff.elementCount.removedElements.length;
  const newImageCount = diff.referenceImageCount.newImages.length;
  const removedImageCount = diff.referenceImageCount.removedImages.length;
  const newColorCount = diff.colorPaletteDiff.newColors.length;
  const removedColorCount = diff.colorPaletteDiff.removedColors.length;

  return (
    <div className="space-y-2">
      {diff.basicInfoDiff.length > 0 && (
        <CollapsibleSection
          title="基础信息"
          icon={<Info size={14} className="text-blue-400" />}
          count={diff.basicInfoDiff.length}
          defaultOpen
        >
          <div className="space-y-1.5">
            {diff.basicInfoDiff.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs text-gray-500 flex-shrink-0 w-16">
                  {item.field}
                </span>
                <ArrowRight size={12} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-400 flex-1 min-w-0 break-all">
                  <span className="text-gray-300">
                    {formatValue(item.field, item.existingValue)}
                  </span>
                  <span className="text-gray-600 mx-1">→</span>
                  <span className="text-accent">
                    {formatValue(item.field, item.importedValue)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {(newElementCount > 0 || removedElementCount > 0) && (
        <CollapsibleSection
          title="元素差异"
          icon={<Layers size={14} className="text-green-400" />}
          count={newElementCount + removedElementCount}
        >
          <div className="space-y-2">
            {newElementCount > 0 && (
              <div>
                <p className="text-xs text-green-400 mb-1">新增元素 ({newElementCount})</p>
                <div className="flex flex-wrap gap-1">
                  {diff.elementCount.newElements.slice(0, 8).map((name, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded"
                    >
                      {name || '未命名'}
                    </span>
                  ))}
                  {newElementCount > 8 && (
                    <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded">
                      +{newElementCount - 8} 更多
                    </span>
                  )}
                </div>
              </div>
            )}
            {removedElementCount > 0 && (
              <div>
                <p className="text-xs text-red-400 mb-1">减少元素 ({removedElementCount})</p>
                <div className="flex flex-wrap gap-1">
                  {diff.elementCount.removedElements.slice(0, 8).map((name, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded line-through"
                    >
                      {name || '未命名'}
                    </span>
                  ))}
                  {removedElementCount > 8 && (
                    <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded">
                      +{removedElementCount - 8} 更多
                    </span>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              现有 {diff.elementCount.existing} 个 → 导入 {diff.elementCount.imported} 个
            </p>
          </div>
        </CollapsibleSection>
      )}

      {(newImageCount > 0 || removedImageCount > 0) && (
        <CollapsibleSection
          title="参考图差异"
          icon={<Image size={14} className="text-purple-400" />}
          count={newImageCount + removedImageCount}
        >
          <div className="space-y-2">
            {newImageCount > 0 && (
              <div>
                <p className="text-xs text-green-400 mb-1">新增参考图 ({newImageCount})</p>
                <div className="flex flex-wrap gap-1">
                  {diff.referenceImageCount.newImages.slice(0, 5).map((url, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded max-w-[150px] truncate"
                      title={url}
                    >
                      {url.split('/').pop() || url}
                    </span>
                  ))}
                  {newImageCount > 5 && (
                    <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded">
                      +{newImageCount - 5} 更多
                    </span>
                  )}
                </div>
              </div>
            )}
            {removedImageCount > 0 && (
              <div>
                <p className="text-xs text-red-400 mb-1">减少参考图 ({removedImageCount})</p>
                <div className="flex flex-wrap gap-1">
                  {diff.referenceImageCount.removedImages.slice(0, 5).map((url, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded max-w-[150px] truncate line-through"
                      title={url}
                    >
                      {url.split('/').pop() || url}
                    </span>
                  ))}
                  {removedImageCount > 5 && (
                    <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded">
                      +{removedImageCount - 5} 更多
                    </span>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              现有 {diff.referenceImageCount.existing} 张 → 导入 {diff.referenceImageCount.imported} 张
            </p>
          </div>
        </CollapsibleSection>
      )}

      {(newColorCount > 0 || removedColorCount > 0) && (
        <CollapsibleSection
          title="色板差异"
          icon={<Palette size={14} className="text-pink-400" />}
          count={newColorCount + removedColorCount}
        >
          <div className="space-y-2">
            {newColorCount > 0 && (
              <div>
                <p className="text-xs text-green-400 mb-1">新增颜色 ({newColorCount})</p>
                <div className="flex flex-wrap gap-1.5">
                  {diff.colorPaletteDiff.newColors.slice(0, 8).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded border border-white/20 flex items-center justify-center"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {newColorCount > 8 && (
                    <span className="text-xs px-2 py-1 bg-white/10 text-gray-400 rounded">
                      +{newColorCount - 8}
                    </span>
                  )}
                </div>
              </div>
            )}
            {removedColorCount > 0 && (
              <div>
                <p className="text-xs text-red-400 mb-1">减少颜色 ({removedColorCount})</p>
                <div className="flex flex-wrap gap-1.5">
                  {diff.colorPaletteDiff.removedColors.slice(0, 8).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded border border-white/20 flex items-center justify-center relative opacity-50"
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-px bg-red-500 rotate-45" />
                      </div>
                    </div>
                  ))}
                  {removedColorCount > 8 && (
                    <span className="text-xs px-2 py-1 bg-white/10 text-gray-400 rounded">
                      +{removedColorCount - 8}
                    </span>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              现有 {diff.colorPaletteDiff.existingCount} 色 → 导入 {diff.colorPaletteDiff.importedCount} 色
            </p>
          </div>
        </CollapsibleSection>
      )}

      {diff.budgetDiff.hasBudget && (
        <CollapsibleSection
          title="预算差异"
          icon={<DollarSign size={14} className="text-yellow-400" />}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">现有总预算</span>
              <span className="text-white font-medium">
                ¥{diff.budgetDiff.existingTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">导入总预算</span>
              <span
                className={`font-medium ${
                  diff.budgetDiff.importedTotal > diff.budgetDiff.existingTotal
                    ? 'text-red-400'
                    : diff.budgetDiff.importedTotal < diff.budgetDiff.existingTotal
                    ? 'text-green-400'
                    : 'text-white'
                }`}
              >
                ¥{diff.budgetDiff.importedTotal.toFixed(2)}
              </span>
            </div>
            {diff.budgetDiff.importedTotal !== diff.budgetDiff.existingTotal && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                <span className="text-gray-500">差额</span>
                <span
                  className={
                    diff.budgetDiff.importedTotal > diff.budgetDiff.existingTotal
                      ? 'text-red-400'
                      : 'text-green-400'
                  }
                >
                  {diff.budgetDiff.importedTotal > diff.budgetDiff.existingTotal ? '+' : ''}¥
                  {(diff.budgetDiff.importedTotal - diff.budgetDiff.existingTotal).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

function getTotalDiffCount(diff: CharacterDiffDetail): number {
  let count = 0;
  count += diff.basicInfoDiff.length;
  count += diff.elementCount.newElements.length + diff.elementCount.removedElements.length;
  count +=
    diff.referenceImageCount.newImages.length + diff.referenceImageCount.removedImages.length;
  count += diff.colorPaletteDiff.newColors.length + diff.colorPaletteDiff.removedColors.length;
  if (
    diff.budgetDiff.hasBudget &&
    diff.budgetDiff.importedTotal !== diff.budgetDiff.existingTotal
  ) {
    count += 1;
  }
  return count;
}

function ConflictCharacterCard({
  conflict,
  index,
  onResolutionChange,
}: {
  conflict: ImportConflict;
  index: number;
  onResolutionChange: (index: number, resolution: ConflictResolution) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const totalDiffCount = getTotalDiffCount(conflict.diff);

  return (
    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 truncate">已有:</span>
              <span className="text-white font-medium truncate">
                {conflict.existingCharacter.name}
              </span>
              <span className="text-xs text-gray-500">
                ({conflict.existingCharacter.elements.length} 元素)
              </span>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 truncate">导入:</span>
              <span className="text-accent font-medium truncate">
                {conflict.importedCharacter.name}
              </span>
              <span className="text-xs text-gray-500">
                ({conflict.importedCharacter.elements.length} 元素)
              </span>
            </div>
          </div>
        </div>

        {totalDiffCount > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center gap-2 text-xs text-yellow-400 hover:text-yellow-300 py-1.5 mb-3 bg-yellow-500/10 hover:bg-yellow-500/15 rounded-lg transition-colors"
          >
            <span className="px-1.5 py-0.5 bg-yellow-500/30 text-yellow-200 rounded text-[10px] font-medium">
              {totalDiffCount} 处差异
            </span>
            <span>查看详情</span>
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        {showDetails && (
          <div className="mb-3">
            <CharacterDiffView diff={conflict.diff} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onResolutionChange(index, 'overwrite')}
            className={`text-xs py-2 px-3 rounded-lg font-medium transition-all ${
              conflict.resolution === 'overwrite'
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            覆盖现有
          </button>
          <button
            onClick={() => onResolutionChange(index, 'skip')}
            className={`text-xs py-2 px-3 rounded-lg font-medium transition-all ${
              conflict.resolution === 'skip'
                ? 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            跳过
          </button>
          <button
            onClick={() => onResolutionChange(index, 'saveAsNew')}
            className={`text-xs py-2 px-3 rounded-lg font-medium transition-all ${
              conflict.resolution === 'saveAsNew'
                ? 'bg-accent/20 text-accent border border-accent/50'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            另存为新角色
          </button>
          <button
            onClick={() => onResolutionChange(index, 'mergeNew')}
            className={`text-xs py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
              conflict.resolution === 'mergeNew'
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            <Merge size={12} />
            只合并新增
          </button>
        </div>

        {conflict.resolution === 'mergeNew' && (
          <p className="text-xs text-green-400/70 mt-2 text-center">
            将合并新增的元素、参考图和色板颜色，保留现有数据不变
          </p>
        )}
      </div>
    </div>
  );
}

export function ImportPreviewModal({ preview, onClose }: ImportPreviewModalProps) {
  const { replaceCharacters } = useStore();
  const { replaceMaterials } = useMaterialStore();
  const [conflicts, setConflicts] = useState<ImportConflict[]>(preview.conflicts);
  const [materialConflicts, setMaterialConflicts] = useState<MaterialImportConflict[]>(
    preview.materialConflicts
  );

  const updateConflictResolution = (index: number, resolution: ConflictResolution) => {
    setConflicts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, resolution } : c))
    );
  };

  const updateMaterialConflictResolution = (
    index: number,
    resolution: MaterialConflictResolution
  ) => {
    setMaterialConflicts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, resolution } : c))
    );
  };

  const handleConfirmImport = () => {
    const updatedPreview: ImportPreview = {
      ...preview,
      conflicts,
      materialConflicts,
    };
    const { characters, materials } = applyImport(
      updatedPreview,
      useStore.getState().characters,
      useMaterialStore.getState().materials
    );
    replaceCharacters(characters);
    replaceMaterials(materials);
    onClose();
  };

  const totalCharactersToImport =
    preview.newCharacters.length +
    conflicts.filter((c) => c.resolution !== 'skip').length;
  const totalMaterialsToImport =
    preview.newMaterials.length +
    materialConflicts.filter((c) => c.resolution !== 'skip').length;
  const hasAnythingToImport = totalCharactersToImport > 0 || totalMaterialsToImport > 0;

  const showNoData =
    preview.newCharacters.length === 0 &&
    conflicts.length === 0 &&
    preview.newMaterials.length === 0 &&
    materialConflicts.length === 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-primary-light border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-in max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Upload size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">导入预览</h2>
              <p className="text-xs text-gray-400">确认导入内容与冲突处理方式</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {preview.newCharacters.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-success flex items-center gap-2 mb-3">
                <Plus size={16} />
                新增角色 ({preview.newCharacters.length})
              </h3>
              <div className="space-y-2">
                {preview.newCharacters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-white font-medium">{char.name}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        {char.source || '无来源'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {char.elements.length} 个元素
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {conflicts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-yellow-400 flex items-center gap-2 mb-3">
                <AlertTriangle size={16} />
                冲突角色 ({conflicts.length})
              </h3>
              <div className="space-y-3">
                {conflicts.map((conflict, index) => (
                  <ConflictCharacterCard
                    key={conflict.importedCharacter.id}
                    conflict={conflict}
                    index={index}
                    onResolutionChange={updateConflictResolution}
                  />
                ))}
              </div>
            </div>
          )}

          {preview.newMaterials.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-blue-400 flex items-center gap-2 mb-3">
                <Package size={16} />
                新增材质 ({preview.newMaterials.length})
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {preview.newMaterials.map((mat) => (
                    <span
                      key={mat.id}
                      className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg"
                    >
                      {mat.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {materialConflicts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-orange-400 flex items-center gap-2 mb-3">
                <AlertTriangle size={16} />
                冲突材质 ({materialConflicts.length})
              </h3>
              <div className="space-y-3">
                {materialConflicts.map((matConflict, index) => (
                  <div
                    key={matConflict.importedMaterial.id}
                    className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-white font-medium">
                          {matConflict.importedMaterial.name}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          有 {matConflict.changedFields.length} 处字段变更
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 mb-3 space-y-2">
                      {matConflict.changedFields.map((change, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 flex-shrink-0 w-16">
                            {getFieldLabel(change.field)}
                          </span>
                          <ArrowRight
                            size={12}
                            className="text-gray-600 flex-shrink-0 mt-1"
                          />
                          <span className="text-xs text-gray-400 flex-1 min-w-0">
                            <span
                              className={
                                change.field === 'needToBuy' && !change.existingValue
                                  ? 'text-red-400'
                                  : ''
                              }
                            >
                              {formatValue(change.field, change.existingValue)}
                            </span>
                            <span className="text-gray-600 mx-1">→</span>
                            <span
                              className={
                                change.field === 'needToBuy' && change.importedValue
                                  ? 'text-green-400'
                                  : 'text-accent'
                              }
                            >
                              {formatValue(change.field, change.importedValue)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateMaterialConflictResolution(index, 'overwrite')
                        }
                        className={`flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-all ${
                          matConflict.resolution === 'overwrite'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                            : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        覆盖现有
                      </button>
                      <button
                        onClick={() => updateMaterialConflictResolution(index, 'skip')}
                        className={`flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-all ${
                          matConflict.resolution === 'skip'
                            ? 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                            : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        跳过
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showNoData && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">项目包中没有可导入的数据</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              将导入{' '}
              <span className="text-white font-medium">{totalCharactersToImport}</span>{' '}
              个角色
              {totalMaterialsToImport > 0 && (
                <>
                  {' '}和{' '}
                  <span className="text-white font-medium">
                    {totalMaterialsToImport}
                  </span>{' '}
                  条材质
                </>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={!hasAnythingToImport}
                className="py-2.5 px-5 bg-accent hover:bg-accent-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-lg"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
