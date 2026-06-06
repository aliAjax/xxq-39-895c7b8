import { Crown, Shirt, Scissors, Footprints, Sparkles, Sword, Plus, Edit3, ListTodo, Package } from 'lucide-react';
import { ClothingElement, ClothingCategory, STATUS_LABELS, DIFFICULTY_LABELS, CATEGORY_LABELS } from '../types';
import { useStore } from '../store/useStore';

const categoryIcons: Record<ClothingCategory, React.ElementType> = {
  head: Crown,
  top: Shirt,
  bottom: Scissors,
  shoes: Footprints,
  accessory: Sparkles,
  weapon: Sword,
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-DEFAULT',
  confirmed: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-accent/20 text-accent',
  completed: 'bg-success/20 text-success',
};

const difficultyColors: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-orange-400',
  expert: 'text-red-400',
};

interface ElementCardProps {
  element: ClothingElement;
  index: number;
}

export function ElementCard({ element, index }: ElementCardProps) {
  const { selectedElementId, setSelectedElement, getTaskProgress } = useStore();
  const Icon = categoryIcons[element.category];
  const isSelected = selectedElementId === element.id;
  const isPlaceholder = !element.name.trim();
  const taskProgress = getTaskProgress(element);

  return (
    <div
      onClick={() => setSelectedElement(element.id)}
      className={`group relative bg-white/5 rounded-xl p-5 cursor-pointer transition-all duration-200 animate-scale-in border ${
        isSelected
          ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
          : isPlaceholder
          ? 'border-dashed border-white/20 hover:border-accent/40 hover:bg-white/10'
          : 'border-transparent hover:bg-white/10 hover:shadow-xl'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute top-3 right-3">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            statusColors[element.status]
          }`}
        >
          {STATUS_LABELS[element.status]}
        </span>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isPlaceholder
            ? 'bg-white/10'
            : 'bg-gradient-to-br from-accent/30 to-accent/10'
        }`}>
          <Icon size={20} className={isPlaceholder ? 'text-gray-400' : 'text-accent'} />
        </div>
        <div>
          <h3 className={`font-semibold ${isPlaceholder ? 'text-gray-400' : 'text-white'}`}>
            {isPlaceholder ? (
              <span className="flex items-center gap-1">
                <Edit3 size={14} />
                点击填写{CATEGORY_LABELS[element.category]}
              </span>
            ) : (
              element.name
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isPlaceholder ? '占位元素' : (
              <>
                难度:{' '}
                <span className={difficultyColors[element.difficulty]}>
                  {DIFFICULTY_LABELS[element.difficulty]}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {element.colors.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1.5">颜色</p>
          <div className="flex gap-1.5">
            {element.colors.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white/20 shadow-inner"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {element.materials.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">材质</p>
          <div className="flex flex-wrap gap-1">
            {element.materials.map((material, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                  material.materialId
                    ? 'bg-accent/20 text-accent'
                    : 'bg-white/10 text-gray-300'
                }`}
                title={material.notes || ''}
              >
                {material.materialId && <Package size={10} />}
                {material.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {element.questions && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-warning flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            {element.questions.length > 30
              ? element.questions.slice(0, 30) + '...'
              : element.questions}
          </p>
        </div>
      )}

      {element.tasks && element.tasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <ListTodo size={12} />
              任务进度
            </span>
            <span className="text-xs text-gray-400">
              {element.tasks.filter((t) => t.completed).length}/{element.tasks.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-300"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>
      )}

      {element.needToBuy && (
        <div className="absolute bottom-3 right-3">
          <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded">
            待采购
          </span>
        </div>
      )}
    </div>
  );
}

interface AddElementCardProps {
  onClick: () => void;
}

export function AddElementCard({ onClick }: AddElementCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white/5 rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 border-dashed border-white/20 hover:border-accent/50 hover:bg-accent/5 flex items-center justify-center min-h-[180px]"
    >
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-accent/20 flex items-center justify-center mx-auto mb-3 transition-all">
          <Plus size={24} className="text-gray-400 group-hover:text-accent" />
        </div>
        <p className="text-gray-400 group-hover:text-white transition-colors">
          添加服装元素
        </p>
      </div>
    </div>
  );
}
