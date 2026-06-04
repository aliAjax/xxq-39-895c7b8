import { Character } from '../types';

const STORAGE_KEY = 'cosplay-costume-analyzer-data';

function migrateData(characters: Character[]): Character[] {
  const now = Date.now();
  return characters.map((char) => ({
    ...char,
    referenceImages: char.referenceImages || [],
    colorPalette: char.colorPalette || {
      colors: [],
      createdAt: now,
      updatedAt: now,
    },
    elements: char.elements.map((el) => ({
      ...el,
      referenceImages: el.referenceImages || [],
    })),
  }));
}

export function loadFromStorage(): Character[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return migrateData(parsed);
    }
  } catch (error) {
    console.error('Failed to load from storage:', error);
  }
  return null;
}

export function saveToStorage(characters: Character[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}
