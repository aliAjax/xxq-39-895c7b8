import { create } from 'zustand';
import { Character, ClothingElement, ClothingCategory, ProductionStatus } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { sampleCharacters } from '../data/sampleData';

interface StoreState {
  characters: Character[];
  activeCharacterId: string | null;
  selectedCategory: ClothingCategory | 'all';
  selectedElementId: string | null;
  showShoppingList: boolean;
  
  setActiveCharacter: (id: string | null) => void;
  setSelectedCategory: (category: ClothingCategory | 'all') => void;
  setSelectedElement: (id: string | null) => void;
  setShowShoppingList: (show: boolean) => void;
  
  addCharacter: () => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  
  addElement: (characterId: string, element: Omit<ClothingElement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateElement: (characterId: string, elementId: string, updates: Partial<ClothingElement>) => void;
  deleteElement: (characterId: string, elementId: string) => void;
  
  getActiveCharacter: () => Character | undefined;
  getFilteredElements: () => ClothingElement[];
  getCompletionRate: () => number;
}

const initializeData = (): Character[] => {
  const stored = loadFromStorage();
  if (stored && stored.length > 0) {
    return stored;
  }
  return sampleCharacters;
};

export const useStore = create<StoreState>((set, get) => ({
  characters: initializeData(),
  activeCharacterId: null,
  selectedCategory: 'all',
  selectedElementId: null,
  showShoppingList: false,

  setActiveCharacter: (id) => set({ activeCharacterId: id, selectedElementId: null }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedElement: (id) => set({ selectedElementId: id }),
  setShowShoppingList: (show) => set({ showShoppingList: show }),

  addCharacter: () => {
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: '新角色',
      source: '',
      description: '',
      elements: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
}));

if (typeof window !== 'undefined') {
  const state = useStore.getState();
  if (state.characters.length > 0 && !state.activeCharacterId) {
    useStore.setState({ activeCharacterId: state.characters[0].id });
  }
}
