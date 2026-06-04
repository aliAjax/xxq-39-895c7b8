import { Character } from '../types';

const STORAGE_KEY = 'cosplay-costume-analyzer-data';

export function loadFromStorage(): Character[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
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
