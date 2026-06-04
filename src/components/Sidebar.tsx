import { useState, useRef } from 'react';
import { Plus, Trash2, Package, Download, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useMaterialStore } from '../store/useMaterialStore';
import { exportProjectPackage, readProjectPackage, generateImportPreview } from '../utils/projectPackage';
import { ImportPreview as ImportPreviewType } from '../types';
import { ImportPreviewModal } from './ImportPreviewModal';

export function Sidebar() {
  const {
    characters,
    activeCharacterId,
    setActiveCharacter,
    setShowCharacterWizard,
    deleteCharacter,
  } = useStore();
  const { showMaterialLibrary, setShowMaterialLibrary, materials } = useMaterialStore();

  const [importPreview, setImportPreview] = useState<ImportPreviewType | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportProject = () => {
    exportProjectPackage(characters, materials);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const pkg = await readProjectPackage(file);
      const preview = generateImportPreview(pkg, characters, materials);
      setImportPreview(preview);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : '导入失败');
    }
    e.target.value = '';
  };

  const handleClosePreview = () => {
    setImportPreview(null);
    setImportError(null);
  };

  const getCharacterProgress = (id: string) => {
    const char = characters.find((c) => c.id === id);
    if (!char || char.elements.length === 0) return 0;
    const completed = char.elements.filter((el) => el.status === 'completed').length;
    return Math.round((completed / char.elements.length) * 100);
  };

  return (
    <aside className="w-72 bg-primary-dark h-screen flex flex-col border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-serif font-bold text-white text-shadow">
          服装设定拆解
        </h1>
        <p className="text-sm text-gray-400 mt-1">COSPLAY / 原画设计工具</p>
      </div>

      <div className="p-4 space-y-2">
        <button
          onClick={() => setShowCharacterWizard(true)}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          新建角色
        </button>
        <button
          onClick={() => setShowMaterialLibrary(!showMaterialLibrary)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all duration-200 font-medium ${
            showMaterialLibrary
              ? 'bg-accent/20 text-accent border border-accent/50'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-transparent'
          }`}
        >
          <Package size={18} />
          材质库
          <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded">
            {materials.length}
          </span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleExportProject}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 px-3 rounded-lg transition-all text-sm border border-transparent hover:border-white/10"
          >
            <Download size={16} />
            导出
          </button>
          <button
            onClick={handleImportClick}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 px-3 rounded-lg transition-all text-sm border border-transparent hover:border-white/10"
          >
            <Upload size={16} />
            导入
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        {importError && (
          <p className="text-xs text-red-400 px-2">{importError}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          角色列表
        </h2>
        <div className="space-y-2">
          {characters.map((character, index) => (
            <div
              key={character.id}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                onClick={() => setActiveCharacter(character.id)}
                className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeCharacterId === character.id
                    ? 'bg-accent/20 border border-accent/50'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {character.name}
                    </h3>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {character.source || '未设置来源'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定要删除这个角色吗？')) {
                        deleteCharacter(character.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded transition-all"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">完成度</span>
                    <span className="text-success font-medium">
                      {getCharacterProgress(character.id)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-success to-success-light rounded-full transition-all duration-500"
                      style={{ width: `${getCharacterProgress(character.id)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-1 mt-2">
                  {character.elements.length > 0 ? (
                    [...new Set(character.elements.map((el) => el.category))].slice(
                      0,
                      4
                    ).map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] px-2 py-0.5 bg-white/10 text-gray-300 rounded"
                      >
                        {
                          {
                            head: '头部',
                            top: '上衣',
                            bottom: '下装',
                            shoes: '鞋袜',
                            accessory: '配饰',
                            weapon: '武器',
                          }[cat]
                        }
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">暂无元素</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {characters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">还没有角色</p>
              <p className="text-xs mt-1">点击上方按钮创建</p>
            </div>
          )}
        </div>
      </div>

      {importPreview && (
        <ImportPreviewModal preview={importPreview} onClose={handleClosePreview} />
      )}
    </aside>
  );
}
