export type ClothingCategory = 'head' | 'top' | 'bottom' | 'shoes' | 'accessory' | 'weapon';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export type ProductionStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed';

export type ReferenceTag = ClothingCategory;

export interface ReferenceImage {
  id: string;
  url: string;
  tags: ReferenceTag[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface ClothingElement {
  id: string;
  name: string;
  category: ClothingCategory;
  colors: string[];
  materials: string[];
  difficulty: DifficultyLevel;
  referenceImages: string[];
  notes: string;
  questions: string;
  status: ProductionStatus;
  needToBuy: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Character {
  id: string;
  name: string;
  source: string;
  description: string;
  elements: ClothingElement[];
  referenceImages: ReferenceImage[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  characters: Character[];
  activeCharacterId: string | null;
  selectedCategory: ClothingCategory | 'all';
  selectedElementId: string | null;
  showShoppingList: boolean;
  showReferenceBoard: boolean;
  newElementFromReference: { imageUrl: string; category: ClothingCategory } | null;
  showCharacterWizard: boolean;
}

export const REFERENCE_TAG_LABELS: Record<ReferenceTag, string> = {
  head: '头部',
  top: '上衣',
  bottom: '下装',
  shoes: '鞋袜',
  accessory: '配饰',
  weapon: '武器',
};

export const CATEGORY_LABELS: Record<ClothingCategory | 'all', string> = {
  all: '全部',
  head: '头部',
  top: '上衣',
  bottom: '下装',
  shoes: '鞋袜',
  accessory: '配饰',
  weapon: '武器',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  expert: '专家',
};

export const STATUS_LABELS: Record<ProductionStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  in_progress: '制作中',
  completed: '已完成',
};

export const CATEGORY_ICONS: Record<ClothingCategory, string> = {
  head: 'Crown',
  top: 'Shirt',
  bottom: 'Scissors',
  shoes: 'Footprints',
  accessory: 'Sparkles',
  weapon: 'Sword',
};

export interface Material {
  id: string;
  name: string;
  applicableParts: ClothingCategory[];
  notes: string;
  needToBuy: boolean;
  createdAt: number;
  updatedAt: number;
}
