import { create } from 'zustand';
import { Character, ClothingElement, ClothingCategory, ReferenceImage, ReferenceTag } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { sampleCharacters } from '../data/sampleData';

interface StoreState {
  characters: Character[];
  activeCharacterId: string | null;
  selectedCategory: ClothingCategory | 'all';
  selectedElementId: string | null;
  showShoppingList: boolean;
  showReferenceBoard: boolean;
  newElementFromReference: { imageUrl: string; category: ClothingCategory } | null;
  
  setActiveCharacter: (id: string | null) => void;
  setSelectedCategory: (category: ClothingCategory | 'all') => void;
  setSelectedElement: (id: string | null) => void;
  setShowShoppingList: (show: boolean) => void;
  setShowReferenceBoard: (show: boolean) => void;
  setNewElementFromReference: (data: { imageUrl: string; category: ClothingCategory } | null) => void;
  
  addCharacter: () => void;
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
  
  getActiveCharacter: () => Character | undefined;
  getFilteredElements: () => ClothingElement[];
  getCompletionRate: () => number;
  getFilteredReferenceImages: (tagFilter: ReferenceTag | 'all') => ReferenceImage[];
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
  showReferenceBoard: false,
  newElementFromReference: null,

  setActiveCharacter: (id) => set({ activeCharacterId: id, selectedElementId: null, showReferenceBoard: false }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedElement: (id) => set({ selectedElementId: id, newElementFromReference: null }),
  setShowShoppingList: (show) => set({ showShoppingList: show, showReferenceBoard: false }),
  setShowReferenceBoard: (show) => set({ showReferenceBoard: show, showShoppingList: false }),
  setNewElementFromReference: (data) => set({ newElementFromReference: data }),

  addCharacter: () => {
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: '新角色',
      source: '',
      description: '',
      elements: [],
      referenceImages: [],
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
      showReferenceBoard: false,
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

  getFilteredReferenceImages: (tagFilter) => {
    const state = get();
    const character = state.characters.find((char) => char.id === state.activeCharacterId);
    if (!character) return [];
    if (tagFilter === 'all') return character.referenceImages;
    return character.referenceImages.filter((img) => img.tags.includes(tagFilter));
  },
}));

if (typeof window !== 'undefined') {
  const state = useStore.getState();
  if (state.characters.length > 0 && !state.activeCharacterId) {
    useStore.setState({ activeCharacterId: state.characters[0].id });
  }
}
