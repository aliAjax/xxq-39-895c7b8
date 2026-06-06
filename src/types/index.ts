export type ClothingCategory = 'head' | 'top' | 'bottom' | 'shoes' | 'accessory' | 'weapon';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export type ProductionStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed';

export type TaskType = 'cutting' | 'pattern_making' | 'procurement' | 'sewing' | 'coloring' | 'fitting' | 'other';

export type ReferenceTag = ClothingCategory;

export interface ReferenceImage {
  id: string;
  url: string;
  tags: ReferenceTag[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProductionTask {
  id: string;
  type: TaskType;
  name: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BudgetItem {
  materialCost: number;
  toolCost: number;
  outsourcingCost: number;
  purchased: boolean;
  notes: string;
}

export interface BudgetSummary {
  totalEstimated: number;
  totalPurchased: number;
  totalRemaining: number;
  categoryBreakdown: Record<ClothingCategory, { estimated: number; purchased: number }>;
  elements: Array<{
    id: string;
    name: string;
    category: ClothingCategory;
    estimated: number;
    purchased: number;
    purchasedStatus: boolean;
  }>;
}

export interface ClothingElement {
  id: string;
  name: string;
  category: ClothingCategory;
  colors: string[];
  materials: ElementMaterial[];
  difficulty: DifficultyLevel;
  referenceImages: string[];
  notes: string;
  questions: string;
  status: ProductionStatus;
  needToBuy: boolean;
  tasks: ProductionTask[];
  budget?: BudgetItem;
  scheduleStartDate?: number;
  scheduleDueDate?: number;
  scheduleReminder?: string;
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
  colorPalette: ColorPalette;
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
  showColorPalette: boolean;
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

export interface ElementMaterial {
  name: string;
  materialId?: string;
  needToBuy?: boolean;
  notes?: string;
}

export interface Material {
  id: string;
  name: string;
  applicableParts: ClothingCategory[];
  notes: string;
  needToBuy: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ColorCategory = 'primary' | 'secondary' | 'accent';

export interface PaletteColor {
  id: string;
  color: string;
  name: string;
  category: ColorCategory;
  createdAt: number;
  updatedAt: number;
}

export interface ColorPalette {
  colors: PaletteColor[];
  createdAt: number;
  updatedAt: number;
}

export const COLOR_CATEGORY_LABELS: Record<ColorCategory, string> = {
  primary: '主色',
  secondary: '辅色',
  accent: '点缀色',
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  cutting: '裁剪',
  pattern_making: '打版',
  procurement: '采购',
  sewing: '缝制',
  coloring: '上色',
  fitting: '试穿',
  other: '其他',
};

export const DEFAULT_TASK_TYPES: TaskType[] = ['pattern_making', 'procurement', 'cutting', 'sewing', 'coloring', 'fitting'];

export interface TaskTemplate {
  id: string;
  type: TaskType;
  name: string;
  order: number;
}

export interface AppSettings {
  taskTemplates: TaskTemplate[];
}

export const DEFAULT_TASK_TEMPLATES: TaskTemplate[] = [
  { id: 'tpl-1', type: 'pattern_making', name: '打版', order: 0 },
  { id: 'tpl-2', type: 'procurement', name: '采购', order: 1 },
  { id: 'tpl-3', type: 'cutting', name: '裁剪', order: 2 },
  { id: 'tpl-4', type: 'sewing', name: '缝制', order: 3 },
  { id: 'tpl-5', type: 'coloring', name: '上色', order: 4 },
  { id: 'tpl-6', type: 'fitting', name: '试穿', order: 5 },
];

export interface ProjectPackage {
  version: string;
  exportedAt: number;
  characters: Character[];
  materials: Material[];
}

export type ConflictResolution = 'overwrite' | 'skip' | 'saveAsNew';

export type MaterialConflictResolution = 'overwrite' | 'skip';

export interface ImportConflict {
  importedCharacter: Character;
  existingCharacter: Character;
  resolution: ConflictResolution;
}

export interface MaterialImportConflict {
  importedMaterial: Material;
  existingMaterial: Material;
  resolution: MaterialConflictResolution;
  changedFields: Array<{
    field: keyof Material;
    importedValue: unknown;
    existingValue: unknown;
  }>;
}

export interface ImportPreview {
  newCharacters: Character[];
  conflicts: ImportConflict[];
  newMaterials: Material[];
  materialConflicts: MaterialImportConflict[];
}

export interface CharacterStats {
  totalElements: number;
  completedCount: number;
  completionRate: number;
  pendingPurchaseCount: number;
  inProgressCount: number;
  expertDifficultyCount: number;
  hasUnansweredQuestions: boolean;
  lastUpdated: number;
}

export type OverviewCompletionFilter = 'all' | 'not_started' | 'in_progress' | 'completed';

export interface OverviewFilters {
  sourceFilter: string;
  completionFilter: OverviewCompletionFilter;
  hasQuestionsFilter: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  filters: OverviewFilters;
  createdAt: number;
}
