import { useState } from 'react';
import { X, Upload, AlertTriangle, Plus, ArrowRight, Package } from 'lucide-react';
import { ImportPreview, ImportConflict, ConflictResolution, MaterialImportConflict, MaterialConflictResolution } from '../types';
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

function formatValue(field: string, value: unknown): string {
  if (field === 'needToBuy') {
    return value ? '需要采购' : '不需要采购';
  }
  if (field === 'applicableParts') {
    return (value as string[]).join(', ') || '无';
  }
  if (field === 'createdAt' || field === 'updatedAt') {
    return new Date(value as number).toLocaleString();
  }
  if (value === null || value === undefined) {
    return '无';
  }
  return String(value);
}

export function ImportPreviewModal({ preview, onClose }: ImportPreviewModalProps) {
  const { replaceCharacters } = useStore();
  const { replaceMaterials } = useMaterialStore();
  const [conflicts, setConflicts] = useState<ImportConflict[]>(preview.conflicts);
  const [materialConflicts, setMaterialConflicts] = useState<MaterialImportConflict[]>(preview.materialConflicts);

  const updateConflictResolution = (index: number, resolution: ConflictResolution) => {
    setConflicts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, resolution } : c))
    );
  };

  const updateMaterialConflictResolution = (index: number, resolution: MaterialConflictResolution) => {
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
                  <div
                    key={conflict.importedCharacter.id}
                    className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 truncate">
                            已有:
                          </span>
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
                          <span className="text-sm text-gray-400 truncate">
                            导入:
                          </span>
                          <span className="text-accent font-medium truncate">
                            {conflict.importedCharacter.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({conflict.importedCharacter.elements.length} 元素)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateConflictResolution(index, 'overwrite')}
                        className={`flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-all ${
                          conflict.resolution === 'overwrite'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                            : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        覆盖现有
                      </button>
                      <button
                        onClick={() => updateConflictResolution(index, 'skip')}
                        className={`flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-all ${
                          conflict.resolution === 'skip'
                            ? 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                            : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        跳过
                      </button>
                      <button
                        onClick={() => updateConflictResolution(index, 'saveAsNew')}
                        className={`flex-1 text-xs py-2 px-3 rounded-lg font-medium transition-all ${
                          conflict.resolution === 'saveAsNew'
                            ? 'bg-accent/20 text-accent border border-accent/50'
                            : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        另存为新角色
                      </button>
                    </div>
                  </div>
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
                            {FIELD_LABELS[change.field] || change.field}
                          </span>
                          <ArrowRight size={12} className="text-gray-600 flex-shrink-0 mt-1" />
                          <span className="text-xs text-gray-400 flex-1 min-w-0">
                            <span className={change.field === 'needToBuy' && !change.existingValue ? 'text-red-400' : ''}>
                              {formatValue(change.field, change.existingValue)}
                            </span>
                            <span className="text-gray-600 mx-1">→</span>
                            <span className={change.field === 'needToBuy' && change.importedValue ? 'text-green-400' : 'text-accent'}>
                              {formatValue(change.field, change.importedValue)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateMaterialConflictResolution(index, 'overwrite')}
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
