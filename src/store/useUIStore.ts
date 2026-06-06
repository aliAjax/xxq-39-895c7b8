import { create } from 'zustand';

interface UIStoreState {
  showShoppingList: boolean;
  showReferenceBoard: boolean;
  showColorPalette: boolean;
  showBudgetPanel: boolean;
  showPrintSpecification: boolean;
  showScheduleCalendar: boolean;
  showProjectOverview: boolean;
  showCharacterWizard: boolean;
  showSettings: boolean;
  showExportCenter: boolean;
  showMaterialSummary: boolean;

  setShowShoppingList: (show: boolean) => void;
  setShowReferenceBoard: (show: boolean) => void;
  setShowColorPalette: (show: boolean) => void;
  setShowBudgetPanel: (show: boolean) => void;
  setShowPrintSpecification: (show: boolean) => void;
  setShowScheduleCalendar: (show: boolean) => void;
  setShowProjectOverview: (show: boolean) => void;
  setShowCharacterWizard: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowExportCenter: (show: boolean) => void;
  setShowMaterialSummary: (show: boolean) => void;

  closeAllPanels: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  showShoppingList: false,
  showReferenceBoard: false,
  showColorPalette: false,
  showBudgetPanel: false,
  showPrintSpecification: false,
  showScheduleCalendar: false,
  showProjectOverview: false,
  showCharacterWizard: false,
  showSettings: false,
  showExportCenter: false,
  showMaterialSummary: false,

  closeAllPanels: () => set({
    showShoppingList: false,
    showReferenceBoard: false,
    showColorPalette: false,
    showBudgetPanel: false,
    showPrintSpecification: false,
    showScheduleCalendar: false,
    showProjectOverview: false,
    showSettings: false,
    showMaterialSummary: false,
  }),

  setShowShoppingList: (show) => set(show ? {
    showShoppingList: true,
    showReferenceBoard: false,
    showColorPalette: false,
    showBudgetPanel: false,
    showPrintSpecification: false,
    showScheduleCalendar: false,
    showSettings: false,
  } : { showShoppingList: false }),

  setShowReferenceBoard: (show) => set(show ? {
    showReferenceBoard: true,
    showShoppingList: false,
    showColorPalette: false,
    showBudgetPanel: false,
    showPrintSpecification: false,
    showScheduleCalendar: false,
    showSettings: false,
  } : { showReferenceBoard: false }),

  setShowColorPalette: (show) => set(show ? {
    showColorPalette: true,
    showShoppingList: false,
    showReferenceBoard: false,
    showBudgetPanel: false,
    showPrintSpecification: false,
    showScheduleCalendar: false,
    showSettings: false,
  } : { showColorPalette: false }),

  setShowBudgetPanel: (show) => set(show ? {
    showBudgetPanel: true,
    showShoppingList: false,
    showReferenceBoard: false,
    showColorPalette: false,
    showPrintSpecification: false,
    showScheduleCalendar: false,
    showSettings: false,
  } : { showBudgetPanel: false }),

  setShowPrintSpecification: (show) => set(show ? {
    showPrintSpecification: true,
    showShoppingList: false,
    showReferenceBoard: false,
    showColorPalette: false,
    showBudgetPanel: false,
    showScheduleCalendar: false,
    showSettings: false,
  } : { showPrintSpecification: false }),

  setShowScheduleCalendar: (show) => set(show ? {
    showScheduleCalendar: true,
    showShoppingList: false,
    showReferenceBoard: false,
    showColorPalette: false,
    showBudgetPanel: false,
    showPrintSpecification: false,
    showSettings: false,
  } : { showScheduleCalendar: false }),

  setShowProjectOverview: (show) => set(show ? {
    showProjectOverview: true,
    showShoppingList: false,
    showReferenceBoard: false,
    showColorPalette: false,
    showBudgetPanel: false,
    showPrintSpecification: false,
    showScheduleCalendar: false,
    showSettings: false,
    showMaterialSummary: false,
  } : { showProjectOverview: false }),

  setShowCharacterWizard: (show) => set({ showCharacterWizard: show }),

  setShowSettings: (show) => set(show ? {
    showSettings: true,
    showShoppingList: false,
    showReferenceBoard: false,
    showColorPalette: false,
    showBudgetPanel: false,
    showPrintSpecification: false,
    showScheduleCalendar: false,
    showProjectOverview: false,
    showMaterialSummary: false,
  } : { showSettings: false }),

  setShowExportCenter: (show) => set({ showExportCenter: show }),

  setShowMaterialSummary: (show) => set(show ? {
    showMaterialSummary: true,
    showShoppingList: false,
    showReferenceBoard: false,
    showColorPalette: false,
    showBudgetPanel: false,
    showPrintSpecification: false,
    showScheduleCalendar: false,
    showSettings: false,
    showProjectOverview: false,
  } : { showMaterialSummary: false }),
}));
