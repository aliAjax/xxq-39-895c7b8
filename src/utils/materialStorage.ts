import { Material } from '../types';

const MATERIAL_STORAGE_KEY = 'cosplay-material-library-data';

const sampleMaterials: Material[] = [
  {
    id: 'mat-sample-1',
    name: '真丝雪纺',
    applicableParts: ['top', 'bottom', 'accessory'],
    notes: '轻薄飘逸，适合古风、礼服类服装',
    needToBuy: true,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'mat-sample-2',
    name: 'EVA泡沫板',
    applicableParts: ['head', 'accessory', 'weapon'],
    notes: '常用道具材料，容易切割塑形',
    needToBuy: false,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'mat-sample-3',
    name: 'PU皮革',
    applicableParts: ['top', 'bottom', 'shoes', 'accessory'],
    notes: '仿皮质感，耐磨易打理',
    needToBuy: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
];

export function loadMaterialsFromStorage(): Material[] {
  try {
    const data = localStorage.getItem(MATERIAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load materials from storage:', error);
  }
  return sampleMaterials;
}

export function saveMaterialsToStorage(materials: Material[]): void {
  try {
    localStorage.setItem(MATERIAL_STORAGE_KEY, JSON.stringify(materials));
  } catch (error) {
    console.error('Failed to save materials to storage:', error);
  }
}

export function clearMaterialStorage(): void {
  try {
    localStorage.removeItem(MATERIAL_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear material storage:', error);
  }
}
