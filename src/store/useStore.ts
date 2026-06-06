import { create } from 'zustand';
import { Character, ClothingElement, ClothingCategory, ReferenceImage, ReferenceTag, PaletteColor, ProductionTask, BudgetSummary, BudgetItem, CharacterStats, TaskTemplate, AppSettings, SavedView, OverviewFilters } from '../types';
import { useCharacterStore } from './useCharacterStore';
import { useUIStore } from './useUIStore';
import { useTaskTemplateStore } from './useTaskTemplateStore';
import { useViewStore } from './useViewStore';

interface StoreState {
  characters: Character[];
  activeCharacterId: string | null;
  selectedCategory: ClothingCategory | 'all';
  selectedElementId: string | null;
  showShoppingList: boolean;
  showReferenceBoard: boolean;
  showColorPalette: boolean;
  showBudgetPanel: boolean;
  showPrintSpecification: boolean;
  showScheduleCalendar: boolean;
  showProjectOverview: boolean;
  newElementFromReference: { imageUrl: string; category: ClothingCategory } | null;
  showCharacterWizard: boolean;
  showSettings: boolean;
  settings: AppSettings;
  savedViews: SavedView[];
  showExportCenter: boolean;
  showMaterialSummary: boolean;

  setActiveCharacter: (id: string | null) => void;
  setSelectedCategory: (category: ClothingCategory | 'all') => void;
  setSelectedElement: (id: string | null) => void;
  setShowShoppingList: (show: boolean) => void;
  setShowReferenceBoard: (show: boolean) => void;
  setShowColorPalette: (show: boolean) => void;
  setShowBudgetPanel: (show: boolean) => void;
  setShowPrintSpecification: (show: boolean) => void;
  setShowScheduleCalendar: (show: boolean) => void;
  setShowProjectOverview: (show: boolean) => void;
  setNewElementFromReference: (data: { imageUrl: string; category: ClothingCategory } | null) => void;
  setShowCharacterWizard: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowExportCenter: (show: boolean) => void;
  setShowMaterialSummary: (show: boolean) => void;

  updateTaskTemplates: (templates: TaskTemplate[]) => void;
  resetTaskTemplates: () => void;
  applyTaskTemplates: (characterId: string, elementId: string) => void;
  addMissingTasks: (characterId: string, elementId: string) => void;

  addCharacter: () => void;
  createCharacterWithData: (data: { name: string; source: string; description: string; autoGenerateElements: boolean }) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;

  addElement: (characterId: string, element: Omit<ClothingElement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateElement: (characterId: string, elementId: string, updates: Partial<ClothingElement>) => void;
  deleteElement: (characterId: string, elementId: string) => void;

  addReferenceImage: (characterId: string, image: Omit<ReferenceImage, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReferenceImage: (characterId: string, imageId: string, updates: Partial<ReferenceImage>) => void;
  deleteReferenceImage: (characterId: string, imageId: string) => void;
  toggleReferenceTag: (characterId: string, imageId: string, tag: ReferenceTag) => void;
  createElementFromReference: (characterId: string, imageId: string, category: ClothingCategory) => void;

  addPaletteColor: (characterId: string, color: Omit<PaletteColor, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePaletteColor: (characterId: string, colorId: string, updates: Partial<PaletteColor>) => void;
  deletePaletteColor: (characterId: string, colorId: string) => void;
  autoGeneratePalette: (characterId: string) => void;
  getElementsUsingColor: (characterId: string, color: string) => ClothingElement[];

  addTask: (characterId: string, elementId: string, task: Omit<ProductionTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (characterId: string, elementId: string, taskId: string, updates: Partial<ProductionTask>) => void;
  deleteTask: (characterId: string, elementId: string, taskId: string) => void;
  toggleTaskComplete: (characterId: string, elementId: string, taskId: string) => void;
  getTaskProgress: (element: ClothingElement) => number;

  getActiveCharacter: () => Character | undefined;
  getFilteredElements: () => ClothingElement[];
  getCompletionRate: () => number;
  getFilteredReferenceImages: (tagFilter: ReferenceTag | 'all') => ReferenceImage[];

  getBudgetSummary: () => BudgetSummary | null;
  getCharacterBudgetSummary: (characterId: string) => BudgetSummary | null;
  getProjectBudgetSummary: () => BudgetSummary;
  updateElementBudget: (characterId: string, elementId: string, budget: Partial<BudgetItem>) => void;
  toggleElementPurchased: (characterId: string, elementId: string) => void;
  replaceCharacters: (characters: Character[]) => void;
  getCharacterStats: (characterId: string) => CharacterStats | null;
  getAllSources: () => string[];
  bulkMarkElementsPurchased: (items: Array<{ characterId: string; elementId: string }>, purchased: boolean) => void;

  addSavedView: (name: string, filters: OverviewFilters) => void;
  deleteSavedView: (viewId: string) => void;
  updateSavedView: (viewId: string, updates: Partial<SavedView>) => void;
}

const getCombinedState = () => {
  const charState = useCharacterStore.getState();
  const uiState = useUIStore.getState();
  const tplState = useTaskTemplateStore.getState();
  const viewState = useViewStore.getState();

  return {
    characters: charState.characters,
    activeCharacterId: charState.activeCharacterId,
    selectedCategory: charState.selectedCategory,
    selectedElementId: charState.selectedElementId,
    newElementFromReference: charState.newElementFromReference,

    showShoppingList: uiState.showShoppingList,
    showReferenceBoard: uiState.showReferenceBoard,
    showColorPalette: uiState.showColorPalette,
    showBudgetPanel: uiState.showBudgetPanel,
    showPrintSpecification: uiState.showPrintSpecification,
    showScheduleCalendar: uiState.showScheduleCalendar,
    showProjectOverview: uiState.showProjectOverview,
    showCharacterWizard: uiState.showCharacterWizard,
    showSettings: uiState.showSettings,
    showExportCenter: uiState.showExportCenter,
    showMaterialSummary: uiState.showMaterialSummary,

    settings: tplState.settings,
    savedViews: viewState.savedViews,
  };
};

export const useStore = create<StoreState>((set) => ({
  ...getCombinedState(),

  setActiveCharacter: (id) => {
    useCharacterStore.getState().setActiveCharacter(id);
    useUIStore.setState({
      showReferenceBoard: false,
      showColorPalette: false,
      showBudgetPanel: false,
      showPrintSpecification: false,
      showScheduleCalendar: false,
      showSettings: false,
      showProjectOverview: false,
      showMaterialSummary: false,
    });
    set(getCombinedState());
  },

  setSelectedCategory: (category) => {
    useCharacterStore.getState().setSelectedCategory(category);
    set({ selectedCategory: category });
  },

  setSelectedElement: (id) => {
    useCharacterStore.getState().setSelectedElement(id);
    useUIStore.getState().setShowSettings(false);
    set(getCombinedState());
  },

  setNewElementFromReference: (data) => {
    useCharacterStore.getState().setNewElementFromReference(data);
    set({ newElementFromReference: data });
  },

  setShowShoppingList: (show) => {
    useUIStore.getState().setShowShoppingList(show);
    set(getCombinedState());
  },

  setShowReferenceBoard: (show) => {
    useUIStore.getState().setShowReferenceBoard(show);
    set(getCombinedState());
  },

  setShowColorPalette: (show) => {
    useUIStore.getState().setShowColorPalette(show);
    set(getCombinedState());
  },

  setShowBudgetPanel: (show) => {
    useUIStore.getState().setShowBudgetPanel(show);
    set(getCombinedState());
  },

  setShowPrintSpecification: (show) => {
    useUIStore.getState().setShowPrintSpecification(show);
    set(getCombinedState());
  },

  setShowScheduleCalendar: (show) => {
    useUIStore.getState().setShowScheduleCalendar(show);
    set(getCombinedState());
  },

  setShowProjectOverview: (show) => {
    useUIStore.getState().setShowProjectOverview(show);
    if (show) {
      useCharacterStore.getState().setSelectedElement(null);
    }
    set(getCombinedState());
  },

  setShowCharacterWizard: (show) => {
    useUIStore.getState().setShowCharacterWizard(show);
    set({ showCharacterWizard: show });
  },

  setShowSettings: (show) => {
    useUIStore.getState().setShowSettings(show);
    if (show) {
      useCharacterStore.getState().setSelectedElement(null);
    }
    set(getCombinedState());
  },

  setShowExportCenter: (show) => {
    useUIStore.getState().setShowExportCenter(show);
    set({ showExportCenter: show });
  },

  setShowMaterialSummary: (show) => {
    useUIStore.getState().setShowMaterialSummary(show);
    if (show) {
      useCharacterStore.getState().setSelectedElement(null);
    }
    set(getCombinedState());
  },

  updateTaskTemplates: (templates) => {
    useTaskTemplateStore.getState().updateTaskTemplates(templates);
    set({ settings: useTaskTemplateStore.getState().settings });
  },

  resetTaskTemplates: () => {
    useTaskTemplateStore.getState().resetTaskTemplates();
    set({ settings: useTaskTemplateStore.getState().settings });
  },

  applyTaskTemplates: (characterId, elementId) => {
    const charStore = useCharacterStore.getState();
    const tplStore = useTaskTemplateStore.getState();
    const templates = [...tplStore.settings.taskTemplates].sort((a, b) => a.order - b.order);
    const now = Date.now();
    const newTasks: ProductionTask[] = templates.map((tpl, index) => ({
      id: `task-${now}-${index}`,
      type: tpl.type,
      name: tpl.name,
      completed: false,
      createdAt: now,
      updatedAt: now,
    }));

    const character = charStore.characters.find((c) => c.id === characterId);
    const element = character?.elements.find((e) => e.id === elementId);
    if (!element) return;

    charStore.updateElement(characterId, elementId, { tasks: newTasks, updatedAt: now });
    set({ characters: useCharacterStore.getState().characters });
  },

  addMissingTasks: (characterId, elementId) => {
    const charStore = useCharacterStore.getState();
    const tplStore = useTaskTemplateStore.getState();
    const character = charStore.characters.find((c) => c.id === characterId);
    const element = character?.elements.find((e) => e.id === elementId);
    if (!element) return;

    const templates = [...tplStore.settings.taskTemplates].sort((a, b) => a.order - b.order);
    const existingTaskTypes = new Set(element.tasks.map((t) => t.type));
    const now = Date.now();
    const missingTasks = templates
      .filter((tpl) => !existingTaskTypes.has(tpl.type))
      .map((tpl, index) => ({
        id: `task-${now}-${index}`,
        type: tpl.type,
        name: tpl.name,
        completed: false,
        createdAt: now,
        updatedAt: now,
      }));

    if (missingTasks.length === 0) return;

    charStore.updateElement(characterId, elementId, {
      tasks: [...element.tasks, ...missingTasks],
      updatedAt: now,
    });
    set({ characters: useCharacterStore.getState().characters });
  },

  addCharacter: () => {
    useCharacterStore.getState().addCharacter();
    set(getCombinedState());
  },

  createCharacterWithData: (data) => {
    useCharacterStore.getState().createCharacterWithData(data);
    useUIStore.getState().setShowCharacterWizard(false);
    set(getCombinedState());
  },

  updateCharacter: (id, updates) => {
    useCharacterStore.getState().updateCharacter(id, updates);
    set({ characters: useCharacterStore.getState().characters });
  },

  deleteCharacter: (id) => {
    useCharacterStore.getState().deleteCharacter(id);
    set(getCombinedState());
  },

  addElement: (characterId, element) => {
    useCharacterStore.getState().addElement(characterId, element);
    set(getCombinedState());
  },

  updateElement: (characterId, elementId, updates) => {
    useCharacterStore.getState().updateElement(characterId, elementId, updates);
    set({ characters: useCharacterStore.getState().characters });
  },

  deleteElement: (characterId, elementId) => {
    useCharacterStore.getState().deleteElement(characterId, elementId);
    set(getCombinedState());
  },

  addReferenceImage: (characterId, image) => {
    useCharacterStore.getState().addReferenceImage(characterId, image);
    set({ characters: useCharacterStore.getState().characters });
  },

  updateReferenceImage: (characterId, imageId, updates) => {
    useCharacterStore.getState().updateReferenceImage(characterId, imageId, updates);
    set({ characters: useCharacterStore.getState().characters });
  },

  deleteReferenceImage: (characterId, imageId) => {
    useCharacterStore.getState().deleteReferenceImage(characterId, imageId);
    set({ characters: useCharacterStore.getState().characters });
  },

  toggleReferenceTag: (characterId, imageId, tag) => {
    useCharacterStore.getState().toggleReferenceTag(characterId, imageId, tag);
    set({ characters: useCharacterStore.getState().characters });
  },

  createElementFromReference: (characterId, imageId, category) => {
    useCharacterStore.getState().createElementFromReference(characterId, imageId, category);
    useUIStore.getState().setShowReferenceBoard(false);
    set(getCombinedState());
  },

  addPaletteColor: (characterId, color) => {
    useCharacterStore.getState().addPaletteColor(characterId, color);
    set({ characters: useCharacterStore.getState().characters });
  },

  updatePaletteColor: (characterId, colorId, updates) => {
    useCharacterStore.getState().updatePaletteColor(characterId, colorId, updates);
    set({ characters: useCharacterStore.getState().characters });
  },

  deletePaletteColor: (characterId, colorId) => {
    useCharacterStore.getState().deletePaletteColor(characterId, colorId);
    set({ characters: useCharacterStore.getState().characters });
  },

  autoGeneratePalette: (characterId) => {
    useCharacterStore.getState().autoGeneratePalette(characterId);
    set({ characters: useCharacterStore.getState().characters });
  },

  getElementsUsingColor: (characterId, color) => {
    return useCharacterStore.getState().getElementsUsingColor(characterId, color);
  },

  addTask: (characterId, elementId, task) => {
    useCharacterStore.getState().addTask(characterId, elementId, task);
    set({ characters: useCharacterStore.getState().characters });
  },

  updateTask: (characterId, elementId, taskId, updates) => {
    useCharacterStore.getState().updateTask(characterId, elementId, taskId, updates);
    set({ characters: useCharacterStore.getState().characters });
  },

  deleteTask: (characterId, elementId, taskId) => {
    useCharacterStore.getState().deleteTask(characterId, elementId, taskId);
    set({ characters: useCharacterStore.getState().characters });
  },

  toggleTaskComplete: (characterId, elementId, taskId) => {
    useCharacterStore.getState().toggleTaskComplete(characterId, elementId, taskId);
    set({ characters: useCharacterStore.getState().characters });
  },

  getTaskProgress: (element) => {
    return useCharacterStore.getState().getTaskProgress(element);
  },

  getActiveCharacter: () => {
    return useCharacterStore.getState().getActiveCharacter();
  },

  getFilteredElements: () => {
    return useCharacterStore.getState().getFilteredElements();
  },

  getCompletionRate: () => {
    return useCharacterStore.getState().getCompletionRate();
  },

  getFilteredReferenceImages: (tagFilter) => {
    return useCharacterStore.getState().getFilteredReferenceImages(tagFilter);
  },

  getBudgetSummary: () => {
    return useCharacterStore.getState().getBudgetSummary();
  },

  getCharacterBudgetSummary: (characterId) => {
    return useCharacterStore.getState().getCharacterBudgetSummary(characterId);
  },

  getProjectBudgetSummary: () => {
    return useCharacterStore.getState().getProjectBudgetSummary();
  },

  updateElementBudget: (characterId, elementId, budget) => {
    useCharacterStore.getState().updateElementBudget(characterId, elementId, budget);
    set({ characters: useCharacterStore.getState().characters });
  },

  toggleElementPurchased: (characterId, elementId) => {
    useCharacterStore.getState().toggleElementPurchased(characterId, elementId);
    set({ characters: useCharacterStore.getState().characters });
  },

  replaceCharacters: (characters) => {
    useCharacterStore.getState().replaceCharacters(characters);
    set(getCombinedState());
  },

  getCharacterStats: (characterId) => {
    return useCharacterStore.getState().getCharacterStats(characterId);
  },

  getAllSources: () => {
    return useCharacterStore.getState().getAllSources();
  },

  bulkMarkElementsPurchased: (items, purchased) => {
    useCharacterStore.getState().bulkMarkElementsPurchased(items, purchased);
    set({ characters: useCharacterStore.getState().characters });
  },

  addSavedView: (name, filters) => {
    useViewStore.getState().addSavedView(name, filters);
    set({ savedViews: useViewStore.getState().savedViews });
  },

  deleteSavedView: (viewId) => {
    useViewStore.getState().deleteSavedView(viewId);
    set({ savedViews: useViewStore.getState().savedViews });
  },

  updateSavedView: (viewId, updates) => {
    useViewStore.getState().updateSavedView(viewId, updates);
    set({ savedViews: useViewStore.getState().savedViews });
  },
}));

useCharacterStore.subscribe(() => {
  const charState = useCharacterStore.getState();
  useStore.setState({
    characters: charState.characters,
    activeCharacterId: charState.activeCharacterId,
    selectedCategory: charState.selectedCategory,
    selectedElementId: charState.selectedElementId,
    newElementFromReference: charState.newElementFromReference,
  });
});

useUIStore.subscribe(() => {
  const uiState = useUIStore.getState();
  useStore.setState({
    showShoppingList: uiState.showShoppingList,
    showReferenceBoard: uiState.showReferenceBoard,
    showColorPalette: uiState.showColorPalette,
    showBudgetPanel: uiState.showBudgetPanel,
    showPrintSpecification: uiState.showPrintSpecification,
    showScheduleCalendar: uiState.showScheduleCalendar,
    showProjectOverview: uiState.showProjectOverview,
    showCharacterWizard: uiState.showCharacterWizard,
    showSettings: uiState.showSettings,
    showExportCenter: uiState.showExportCenter,
    showMaterialSummary: uiState.showMaterialSummary,
  });
});

useTaskTemplateStore.subscribe(() => {
  useStore.setState({
    settings: useTaskTemplateStore.getState().settings,
  });
});

useViewStore.subscribe(() => {
  useStore.setState({
    savedViews: useViewStore.getState().savedViews,
  });
});
