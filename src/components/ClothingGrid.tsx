import { useState } from 'react';
import { CategoryFilter } from './CategoryFilter';
import { ElementCard, AddElementCard } from './ElementCard';
import { useStore } from '../store/useStore';

export function ClothingGrid() {
  const { getFilteredElements, getActiveCharacter, setSelectedElement, selectedElementId } =
    useStore();
  const [isAddingNew, setIsAddingNew] = useState(false);

  const character = getActiveCharacter();
  const elements = getFilteredElements();

  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedElement('new');
  };

  const handleCloseEditor = () => {
    setIsAddingNew(false);
  };

  if (!character) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-serif text-gray-400 mb-2">欢迎使用服装设定拆解工具</p>
          <p className="text-gray-500">请从左侧选择或创建一个角色开始</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <CategoryFilter />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {elements.map((element, index) => (
            <ElementCard key={element.id} element={element} index={index} />
          ))}
          <AddElementCard onClick={handleAddNew} />
        </div>

        {elements.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">暂无服装元素</p>
            <p className="text-sm text-gray-600">点击下方卡片添加第一个元素</p>
          </div>
        )}
      </div>
    </div>
  );
}
