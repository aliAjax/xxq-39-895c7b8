import { create } from 'zustand';
import { SavedView, OverviewFilters } from '../types';
import { loadViews, saveViews } from '../utils/storage';

interface ViewStoreState {
  savedViews: SavedView[];

  addSavedView: (name: string, filters: OverviewFilters) => void;
  deleteSavedView: (viewId: string) => void;
  updateSavedView: (viewId: string, updates: Partial<SavedView>) => void;
}

export const useViewStore = create<ViewStoreState>((set) => ({
  savedViews: loadViews(),

  addSavedView: (name, filters) => {
    const now = Date.now();
    const newView: SavedView = {
      id: `view-${now}`,
      name: name.trim(),
      filters: { ...filters },
      createdAt: now,
    };
    set((state) => {
      const newViews = [...state.savedViews, newView];
      saveViews(newViews);
      return { savedViews: newViews };
    });
  },

  deleteSavedView: (viewId) => {
    set((state) => {
      const newViews = state.savedViews.filter((v) => v.id !== viewId);
      saveViews(newViews);
      return { savedViews: newViews };
    });
  },

  updateSavedView: (viewId, updates) => {
    set((state) => {
      const newViews = state.savedViews.map((v) =>
        v.id === viewId ? { ...v, ...updates } : v
      );
      saveViews(newViews);
      return { savedViews: newViews };
    });
  },
}));
