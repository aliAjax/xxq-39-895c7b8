import { Character, AppSettings, DEFAULT_TASK_TEMPLATES } from '../types';

const STORAGE_KEY = 'cosplay-costume-analyzer-data';
const SETTINGS_STORAGE_KEY = 'cosplay-costume-analyzer-settings';

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
      tasks: el.tasks || [],
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

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        taskTemplates: parsed.taskTemplates || DEFAULT_TASK_TEMPLATES,
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return {
    taskTemplates: [...DEFAULT_TASK_TEMPLATES],
  };
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}
