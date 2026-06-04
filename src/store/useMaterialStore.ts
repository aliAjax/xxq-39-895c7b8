import { create } from 'zustand';
import { Material, ClothingCategory } from '../types';
import { loadMaterialsFromStorage, saveMaterialsToStorage } from '../utils/materialStorage';

interface MaterialStoreState {
  materials: Material[];
  showMaterialLibrary: boolean;
  searchKeyword: string;
  filterPart: ClothingCategory | 'all';
  filterNeedToBuy: boolean | 'all';
  selectedMaterialId: string | null;
  showMaterialSelector: boolean;
  selectorTargetElementId: string | null;

  setShowMaterialLibrary: (show: boolean) => void;
  setSearchKeyword: (keyword: string) => void;
  setFilterPart: (part: ClothingCategory | 'all') => void;
  setFilterNeedToBuy: (needToBuy: boolean | 'all') => void;
  setSelectedMaterialId: (id: string | null) => void;
  setShowMaterialSelector: (show: boolean, targetElementId?: string | null) => void;

  addMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  replaceMaterials: (materials: Material[]) => void;

  getFilteredMaterials: () => Material[];
}

const initializeMaterials = (): Material[] => {
  return loadMaterialsFromStorage();
};

export const useMaterialStore = create<MaterialStoreState>((set, get) => ({
  materials: initializeMaterials(),
  showMaterialLibrary: false,
  searchKeyword: '',
  filterPart: 'all',
  filterNeedToBuy: 'all',
  selectedMaterialId: null,
  showMaterialSelector: false,
  selectorTargetElementId: null,

  setShowMaterialLibrary: (show) => set({ showMaterialLibrary: show }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setFilterPart: (part) => set({ filterPart: part }),
  setFilterNeedToBuy: (needToBuy) => set({ filterNeedToBuy: needToBuy }),
  setSelectedMaterialId: (id) => set({ selectedMaterialId: id }),
  setShowMaterialSelector: (show, targetElementId = null) =>
    set({ showMaterialSelector: show, selectorTargetElementId: targetElementId }),

  addMaterial: (material) => {
    const now = Date.now();
    const newMaterial: Material = {
      ...material,
      id: `mat-${now}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newMaterials = [...state.materials, newMaterial];
      saveMaterialsToStorage(newMaterials);
      return { materials: newMaterials };
    });
  },

  updateMaterial: (id, updates) => {
    set((state) => {
      const newMaterials = state.materials.map((mat) =>
        mat.id === id ? { ...mat, ...updates, updatedAt: Date.now() } : mat
      );
      saveMaterialsToStorage(newMaterials);
      return { materials: newMaterials };
    });
  },

  deleteMaterial: (id) => {
    set((state) => {
      const newMaterials = state.materials.filter((mat) => mat.id !== id);
      saveMaterialsToStorage(newMaterials);
      return {
        materials: newMaterials,
        selectedMaterialId: state.selectedMaterialId === id ? null : state.selectedMaterialId,
      };
    });
  },

  replaceMaterials: (materials) => {
    saveMaterialsToStorage(materials);
    set({ materials, selectedMaterialId: null });
  },

  getFilteredMaterials: () => {
    const state = get();
    let filtered = [...state.materials];

    if (state.searchKeyword) {
      const keyword = state.searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (mat) =>
          mat.name.toLowerCase().includes(keyword) ||
          mat.notes.toLowerCase().includes(keyword)
      );
    }

    if (state.filterPart !== 'all') {
      filtered = filtered.filter((mat) => mat.applicableParts.includes(state.filterPart as ClothingCategory));
    }

    if (state.filterNeedToBuy !== 'all') {
      filtered = filtered.filter((mat) => mat.needToBuy === state.filterNeedToBuy);
    }

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  },
}));
