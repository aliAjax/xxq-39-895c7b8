import { useState } from 'react';
import { Download, X, FileJson, Image, ShoppingCart, Package, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useMaterialStore } from '../store/useMaterialStore';
import {
  getJSONFilename,
  getImageFilename,
  getShoppingListFilename,
  exportToJSON,
  exportCharacterImage,
  exportShoppingList,
} from '../utils/export';
import {
  getProjectPackageFilename,
  exportProjectPackage,
} from '../utils/projectPackage';

type ExportType = 'json' | 'image' | 'shopping' | 'project';

interface ExportOption {
  type: ExportType;
  icon: React.ElementType;
  title: string;
  description: string;
  extension: string;
}

const exportOptions: ExportOption[] = [
  {
    type: 'json',
    icon: FileJson,
    title: '角色JSON',
    description: '导出当前角色的完整设定数据',
    extension: '.json',
  },
  {
    type: 'image',
    icon: Image,
    title: '画面图片',
    description: '导出当前画面的高清PNG图片',
    extension: '.png',
  },
  {
    type: 'shopping',
    icon: ShoppingCart,
    title: '采购清单',
    description: '导出当前角色的采购清单文本',
    extension: '.txt',
  },
  {
    type: 'project',
    icon: Package,
    title: '完整项目包',
    description: '导出所有角色和素材库的完整项目包',
    extension: '.json',
  },
];

export function ExportCenter() {
  const { showExportCenter, setShowExportCenter, getActiveCharacter, characters } = useStore();
  const { materials } = useMaterialStore();
  const [exportingType, setExportingType] = useState<ExportType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const character = getActiveCharacter();

  if (!showExportCenter) return null;

  const getFilename = (type: ExportType): string => {
    switch (type) {
      case 'json':
        return character ? getJSONFilename(character) : '未选择角色.json';
      case 'image':
        return character ? getImageFilename(character) : '未选择角色.png';
      case 'shopping':
        return character ? getShoppingListFilename(character) : '未选择角色.txt';
      case 'project':
        return getProjectPackageFilename();
      default:
        return '';
    }
  };

  const isDisabled = (type: ExportType): boolean => {
    if (exportingType !== null) return true;
    if (type === 'project') return false;
    return !character;
  };

  const getDisabledReason = (type: ExportType): string | null => {
    if (type === 'project') return null;
    if (!character) return '请先选择一个角色';
    return null;
  };

  const handleExport = async (type: ExportType) => {
    setError(null);
    setSuccess(null);
    setExportingType(type);

    try {
      switch (type) {
        case 'json':
          if (!character) throw new Error('请先选择一个角色');
          exportToJSON(character);
          setSuccess('角色JSON导出成功');
          break;
        case 'image':
          if (!character) throw new Error('请先选择一个角色');
          await exportCharacterImage(character);
          setSuccess('画面图片导出成功');
          break;
        case 'shopping':
          if (!character) throw new Error('请先选择一个角色');
          exportShoppingList(character);
          setSuccess('采购清单导出成功');
          break;
        case 'project':
          exportProjectPackage(characters, materials);
          setSuccess('项目包导出成功');
          break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '导出失败，请重试';
      setError(message);
    } finally {
      setExportingType(null);
    }
  };

  const handleClose = () => {
    setShowExportCenter(false);
    setError(null);
    setSuccess(null);
    setExportingType(null);
  };

  const shoppingItemsCount = character?.elements.filter((el) => el.needToBuy).length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-primary rounded-2xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Download size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-white">导出中心</h2>
                <p className="text-sm text-gray-400 mt-0.5">选择需要导出的内容</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-3">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const filename = getFilename(option.type);
            const disabled = isDisabled(option.type);
            const disabledReason = getDisabledReason(option.type);
            const isExporting = exportingType === option.type;

            return (
              <div
                key={option.type}
                className={`p-4 rounded-xl border transition-all ${
                  disabled
                    ? 'bg-white/5 border-white/5 opacity-60'
                    : 'bg-white/5 border-white/10 hover:border-accent/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      disabled ? 'bg-white/10' : 'bg-accent/15'
                    }`}
                  >
                    <Icon size={22} className={disabled ? 'text-gray-500' : 'text-accent'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${disabled ? 'text-gray-500' : 'text-white'}`}>
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <FileText size={12} className="text-gray-600" />
                      <span className="text-xs text-gray-600 font-mono truncate">
                        {filename}
                      </span>
                    </div>
                    {option.type === 'shopping' && character && (
                      <p className="text-xs text-gray-600 mt-1">
                        共 {shoppingItemsCount} 项待采购
                      </p>
                    )}
                    {option.type === 'project' && (
                      <p className="text-xs text-gray-600 mt-1">
                        {characters.length} 个角色 · {materials.length} 个素材
                      </p>
                    )}
                    {disabledReason && (
                      <p className="text-xs text-gray-600 mt-1">{disabledReason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleExport(option.type)}
                    disabled={disabled || isExporting}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all flex-shrink-0 ${
                      disabled
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : isExporting
                        ? 'bg-accent/50 text-white cursor-wait'
                        : 'bg-accent hover:bg-accent-dark text-white'
                    }`}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        导出中
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        导出
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {(error || success) && (
          <div className={`p-4 border-t ${error ? 'border-error/30' : 'border-success/30'}`}>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg ${
                error ? 'bg-error/10' : 'bg-success/10'
              }`}
            >
              {error ? (
                <AlertCircle size={18} className="text-error flex-shrink-0" />
              ) : (
                <CheckCircle size={18} className="text-success flex-shrink-0" />
              )}
              <p className={`text-sm ${error ? 'text-error' : 'text-success'}`}>
                {error || success}
              </p>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-white/10">
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-gray-300 rounded-xl font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
