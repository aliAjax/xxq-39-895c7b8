import { create } from 'zustand';
import { Character, ClothingElement, ClothingCategory, ReferenceImage, ReferenceTag, PaletteColor, ProductionTask, BudgetSummary, BudgetItem, CharacterStats } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { calculateCharacterBudget, calculateProjectBudget } from '../utils/budgetUtils';
import { sampleCharacters } from '../data/sampleData';

const DEFAULT_CATEGORIES: ClothingCategory[] = ['head', 'top', 'bottom', 'shoes', 'accessory', 'weapon'];

const DEFAULT_BUDGET: BudgetItem = {
  materialCost: 0,
  toolCost: 0,
  outsourcingCost: 0,
  purchased: false,
  notes: '',
};

interface CharacterStoreState {
  characters: Character[];
  activeCharacterId: string | null;
  selectedCategory: ClothingCategory | 'all';
  selectedElementId: string | null;
  newElementFromReference: { imageUrl: string; category: ClothingCategory } | null;

  setActiveCharacter: (id: string | null) => void;
  setSelectedCategory: (category: ClothingCategory | 'all') => void;
  setSelectedElement: (id: string | null) => void;
  setNewElementFromReference: (data: { imageUrl: string; category: ClothingCategory } | null) => void;

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
}

const initializeData = (): Character[] => {
  const stored = loadFromStorage();
  if (stored && stored.length > 0) {
    return stored;
  }
  return sampleCharacters;
};

export const useCharacterStore = create<CharacterStoreState>((set, get) => ({
  characters: initializeData(),
  activeCharacterId: null,
  selectedCategory: 'all',
  selectedElementId: null,
  newElementFromReference: null,

  setActiveCharacter: (id) => set({ activeCharacterId: id, selectedElementId: null }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedElement: (id) => set({ selectedElementId: id, newElementFromReference: null }),
  setNewElementFromReference: (data) => set({ newElementFromReference: data }),

  addCharacter: () => {
    const now = Date.now();
    const newCharacter: Character = {
      id: `char-${now}`,
      name: '新角色',
      source: '',
      description: '',
      elements: [],
      referenceImages: [],
      colorPalette: {
        colors: [],
        createdAt: now,
        updatedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newCharacters = [...state.characters, newCharacter];
      saveToStorage(newCharacters);
      return {
        characters: newCharacters,
        activeCharacterId: newCharacter.id,
      };
    });
  },

  createCharacterWithData: ({ name, source, description, autoGenerateElements }) => {
    const now = Date.now();
    const elements: ClothingElement[] = autoGenerateElements
      ? DEFAULT_CATEGORIES.map((category, index) => ({
          id: `el-${now}-${index}`,
          name: '',
          category,
          colors: [],
          materials: [],
          difficulty: 'medium',
          referenceImages: [],
          notes: '',
          questions: '',
          status: 'pending',
          needToBuy: false,
          tasks: [],
          createdAt: now,
          updatedAt: now,
        }))
      : [];

    const newCharacter: Character = {
      id: `char-${now}`,
      name: name.trim() || '新角色',
      source: source.trim(),
      description: description.trim(),
      elements,
      referenceImages: [],
      colorPalette: {
        colors: [],
        createdAt: now,
        updatedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const newCharacters = [...state.characters, newCharacter];
      saveToStorage(newCharacters);
      return {
        characters: newCharacters,
        activeCharacterId: newCharacter.id,
        selectedCategory: 'all',
      };
    });
  },

  updateCharacter: (id, updates) => {
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === id ? { ...char, ...updates, updatedAt: Date.now() } : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  deleteCharacter: (id) => {
    set((state) => {
      const newCharacters = state.characters.filter((char) => char.id !== id);
      saveToStorage(newCharacters);
      return {
        characters: newCharacters,
        activeCharacterId: state.activeCharacterId === id ? null : state.activeCharacterId,
      };
    });
  },

  addElement: (characterId, element) => {
    const newElement: ClothingElement = {
      ...element,
      id: `el-${Date.now()}`,
      tasks: element.tasks || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? { ...char, elements: [...char.elements, newElement], updatedAt: Date.now() }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters, selectedElementId: newElement.id };
    });
  },

  updateElement: (characterId, elementId, updates) => {
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              elements: char.elements.map((el) =>
                el.id === elementId ? { ...el, ...updates, updatedAt: Date.now() } : el
              ),
              updatedAt: Date.now(),
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  deleteElement: (characterId, elementId) => {
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              elements: char.elements.filter((el) => el.id !== elementId),
              updatedAt: Date.now(),
            }
          : char
      );
      saveToStorage(newCharacters);
      return {
        characters: newCharacters,
        selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
      };
    });
  },

  addReferenceImage: (characterId, image) => {
    const newImage: ReferenceImage = {
      ...image,
      id: `ref-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? { ...char, referenceImages: [...char.referenceImages, newImage], updatedAt: Date.now() }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  updateReferenceImage: (characterId, imageId, updates) => {
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              referenceImages: char.referenceImages.map((img) =>
                img.id === imageId ? { ...img, ...updates, updatedAt: Date.now() } : img
              ),
              updatedAt: Date.now(),
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  deleteReferenceImage: (characterId, imageId) => {
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              referenceImages: char.referenceImages.filter((img) => img.id !== imageId),
              updatedAt: Date.now(),
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  toggleReferenceTag: (characterId, imageId, tag) => {
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              referenceImages: char.referenceImages.map((img) =>
                img.id === imageId
                  ? {
                      ...img,
                      tags: img.tags.includes(tag)
                        ? img.tags.filter((t) => t !== tag)
                        : [...img.tags, tag],
                      updatedAt: Date.now(),
                    }
                  : img
              ),
              updatedAt: Date.now(),
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  createElementFromReference: (characterId, imageId, category) => {
    const state = get();
    const character = state.characters.find((c) => c.id === characterId);
    const image = character?.referenceImages.find((img) => img.id === imageId);
    if (!image) return;

    set({
      newElementFromReference: { imageUrl: image.url, category },
      selectedElementId: 'new',
    });
  },

  addPaletteColor: (characterId, color) => {
    const now = Date.now();
    const newColor: PaletteColor = {
      ...color,
      id: `palette-${now}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              colorPalette: {
                ...char.colorPalette,
                colors: [...char.colorPalette.colors, newColor],
                updatedAt: now,
              },
              updatedAt: now,
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  updatePaletteColor: (characterId, colorId, updates) => {
    const now = Date.now();
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              colorPalette: {
                ...char.colorPalette,
                colors: char.colorPalette.colors.map((c) =>
                  c.id === colorId ? { ...c, ...updates, updatedAt: now } : c
                ),
                updatedAt: now,
              },
              updatedAt: now,
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  deletePaletteColor: (characterId, colorId) => {
    const now = Date.now();
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              colorPalette: {
                ...char.colorPalette,
                colors: char.colorPalette.colors.filter((c) => c.id !== colorId),
                updatedAt: now,
              },
              updatedAt: now,
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  autoGeneratePalette: (characterId) => {
    const state = get();
    const character = state.characters.find((c) => c.id === characterId);
    if (!character) return;

    const allColors: string[] = [];
    character.elements.forEach((el) => {
      el.colors.forEach((color) => {
        if (!allColors.includes(color)) {
          allColors.push(color);
        }
      });
    });

    if (allColors.length === 0) return;

    const existingColors = character.colorPalette?.colors || [];
    const existingColorValues = new Set(existingColors.map((c) => c.color));

    const added: PaletteColor[] = [];
    let primaryCount = existingColors.filter((c) => c.category === 'primary').length;
    let secondaryCount = existingColors.filter((c) => c.category === 'secondary').length;

    allColors.forEach((color) => {
      if (existingColorValues.has(color)) return;
      const now = Date.now();
      let category: 'primary' | 'secondary' | 'accent';
      if (primaryCount === 0) {
        category = 'primary';
        primaryCount++;
      } else if (secondaryCount < 2) {
        category = 'secondary';
        secondaryCount++;
      } else {
        category = 'accent';
      }
      added.push({
        id: `palette-${now}-${added.length}`,
        color,
        name: `颜色 ${existingColors.length + added.length + 1}`,
        category,
        createdAt: now,
        updatedAt: now,
      });
    });

    if (added.length === 0) return;

    const merged = [...existingColors, ...added];
    const now = Date.now();

    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              colorPalette: {
                colors: merged,
                createdAt: char.colorPalette?.createdAt || now,
                updatedAt: now,
              },
              updatedAt: now,
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  getElementsUsingColor: (characterId, color) => {
    const state = get();
    const character = state.characters.find((c) => c.id === characterId);
    if (!character) return [];
    return character.elements.filter((el) => el.colors.includes(color));
  },

  getActiveCharacter: () => {
    const state = get();
    return state.characters.find((char) => char.id === state.activeCharacterId);
  },

  getFilteredElements: () => {
    const state = get();
    const character = state.characters.find((char) => char.id === state.activeCharacterId);
    if (!character) return [];
    if (state.selectedCategory === 'all') return character.elements;
    return character.elements.filter((el) => el.category === state.selectedCategory);
  },

  getCompletionRate: () => {
    const state = get();
    const character = state.characters.find((char) => char.id === state.activeCharacterId);
    if (!character || character.elements.length === 0) return 0;
    const completed = character.elements.filter(
      (el) => el.status === 'completed'
    ).length;
    return Math.round((completed / character.elements.length) * 100);
  },

  addTask: (characterId, elementId, task) => {
    const now = Date.now();
    const newTask: ProductionTask = {
      ...task,
      id: `task-${now}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              elements: char.elements.map((el) =>
                el.id === elementId
                  ? { ...el, tasks: [...el.tasks, newTask], updatedAt: now }
                  : el
              ),
              updatedAt: now,
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  updateTask: (characterId, elementId, taskId, updates) => {
    const now = Date.now();
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              elements: char.elements.map((el) =>
                el.id === elementId
                  ? {
                      ...el,
                      tasks: el.tasks.map((t) =>
                        t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
                      ),
                      updatedAt: now,
                    }
                  : el
              ),
              updatedAt: now,
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  deleteTask: (characterId, elementId, taskId) => {
    const now = Date.now();
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              elements: char.elements.map((el) =>
                el.id === elementId
                  ? { ...el, tasks: el.tasks.filter((t) => t.id !== taskId), updatedAt: now }
                  : el
              ),
              updatedAt: now,
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  toggleTaskComplete: (characterId, elementId, taskId) => {
    const now = Date.now();
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              elements: char.elements.map((el) =>
                el.id === elementId
                  ? {
                      ...el,
                      tasks: el.tasks.map((t) =>
                        t.id === taskId ? { ...t, completed: !t.completed, updatedAt: now } : t
                      ),
                      updatedAt: now,
                    }
                  : el
              ),
              updatedAt: now,
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  getTaskProgress: (element) => {
    const tasks = element.tasks || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  },

  getFilteredReferenceImages: (tagFilter) => {
    const state = get();
    const character = state.characters.find((char) => char.id === state.activeCharacterId);
    if (!character) return [];
    if (tagFilter === 'all') return character.referenceImages;
    return character.referenceImages.filter((img) => img.tags.includes(tagFilter));
  },

  getBudgetSummary: () => {
    const state = get();
    const character = state.characters.find((char) => char.id === state.activeCharacterId);
    if (!character) return null;
    return calculateCharacterBudget(character);
  },

  getCharacterBudgetSummary: (characterId) => {
    const state = get();
    const character = state.characters.find((char) => char.id === characterId);
    if (!character) return null;
    return calculateCharacterBudget(character);
  },

  getProjectBudgetSummary: () => {
    const state = get();
    return calculateProjectBudget(state.characters);
  },

  updateElementBudget: (characterId, elementId, budget) => {
    const now = Date.now();
    set((state) => {
      const newCharacters = state.characters.map((char) =>
        char.id === characterId
          ? {
              ...char,
              elements: char.elements.map((el) =>
                el.id === elementId
                  ? {
                      ...el,
                      budget: { ...DEFAULT_BUDGET, ...el.budget, ...budget },
                      updatedAt: now,
                    }
                  : el
              ),
              updatedAt: now,
            }
          : char
      );
      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },

  toggleElementPurchased: (characterId, elementId) => {
    const state = get();
    const character = state.characters.find((c) => c.id === characterId);
    const element = character?.elements.find((e) => e.id === elementId);
    const currentBudget = element?.budget || DEFAULT_BUDGET;
    state.updateElementBudget(characterId, elementId, { purchased: !currentBudget.purchased });
  },

  replaceCharacters: (characters) => {
    saveToStorage(characters);
    set({
      characters,
      activeCharacterId: characters.length > 0 ? characters[0].id : null,
      selectedElementId: null,
    });
  },

  getCharacterStats: (characterId) => {
    const state = get();
    const character = state.characters.find((c) => c.id === characterId);
    if (!character) return null;

    const elements = character.elements;
    const totalElements = elements.length;
    const completedCount = elements.filter((el) => el.status === 'completed').length;
    const completionRate = totalElements > 0 ? Math.round((completedCount / totalElements) * 100) : 0;
    const pendingPurchaseCount = elements.filter((el) => el.needToBuy && el.status !== 'completed').length;
    const inProgressCount = elements.filter((el) => el.status === 'in_progress').length;
    const expertDifficultyCount = elements.filter((el) => el.difficulty === 'expert').length;
    const hasUnansweredQuestions = elements.some((el) => el.questions && el.questions.trim() !== '' && el.status !== 'completed');
    const lastUpdated = character.updatedAt;

    return {
      totalElements,
      completedCount,
      completionRate,
      pendingPurchaseCount,
      inProgressCount,
      expertDifficultyCount,
      hasUnansweredQuestions,
      lastUpdated,
    };
  },

  getAllSources: () => {
    const state = get();
    const sources = new Set<string>();
    state.characters.forEach((char) => {
      if (char.source && char.source.trim() !== '') {
        sources.add(char.source.trim());
      }
    });
    return Array.from(sources);
  },

  bulkMarkElementsPurchased: (items, purchased) => {
    const now = Date.now();
    const itemMap = new Map<string, Set<string>>();
    items.forEach(({ characterId, elementId }) => {
      if (!itemMap.has(characterId)) {
        itemMap.set(characterId, new Set());
      }
      itemMap.get(characterId)!.add(elementId);
    });

    set((state) => {
      const newCharacters = state.characters.map((char) => {
        const elementIds = itemMap.get(char.id);
        if (!elementIds) return char;

        let hasChanges = false;
        const newElements = char.elements.map((el) => {
          if (!elementIds.has(el.id)) return el;

          const currentBudget = el.budget || DEFAULT_BUDGET;
          if (currentBudget.purchased === purchased) return el;

          hasChanges = true;
          return {
            ...el,
            budget: { ...currentBudget, purchased },
            updatedAt: now,
          };
        });

        if (!hasChanges) return char;

        return {
          ...char,
          elements: newElements,
          updatedAt: now,
        };
      });

      saveToStorage(newCharacters);
      return { characters: newCharacters };
    });
  },
}));

if (typeof window !== 'undefined') {
  const state = useCharacterStore.getState();
  if (state.characters.length > 0 && !state.activeCharacterId) {
    useCharacterStore.setState({ activeCharacterId: state.characters[0].id });
  }
}
