import { Crown, Shirt, Scissors, Footprints, Sparkles, Sword } from 'lucide-react';
import { ClothingCategory } from '../types';
import { useStore } from '../store/useStore';

const categories: { key: ClothingCategory | 'all'; label: string; icon?: React.ElementType }[] = [
  { key: 'all', label: '全部' },
  { key: 'head', label: '头部', icon: Crown },
  { key: 'top', label: '上衣', icon: Shirt },
  { key: 'bottom', label: '下装', icon: Scissors },
  { key: 'shoes', label: '鞋袜', icon: Footprints },
  { key: 'accessory', label: '配饰', icon: Sparkles },
  { key: 'weapon', label: '武器', icon: Sword },
];

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory, getActiveCharacter } = useStore();
  const character = getActiveCharacter();

  const getCount = (key: ClothingCategory | 'all') => {
    if (!character) return 0;
    if (key === 'all') return character.elements.length;
    return character.elements.filter((el) => el.category === key).length;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setSelectedCategory(key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
            selectedCategory === key
              ? 'bg-accent text-white shadow-lg shadow-accent/30'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          {Icon && <Icon size={16} />}
          <span className="text-sm font-medium">{label}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              selectedCategory === key ? 'bg-white/20' : 'bg-white/10'
            }`}
          >
            {getCount(key)}
          </span>
        </button>
      ))}
    </div>
  );
}
