import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ClothingGrid } from './components/ClothingGrid';
import { EditorPanel } from './components/EditorPanel';
import { ShoppingList } from './components/ShoppingList';
import { BudgetPanel } from './components/BudgetPanel';
import { ReferenceBoard } from './components/ReferenceBoard';
import { CharacterCreationWizard } from './components/CharacterCreationWizard';
import { MaterialLibrary } from './components/MaterialLibrary';
import { ColorPalette } from './components/ColorPalette';
import { PrintSpecification } from './components/PrintSpecification';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { useStore } from './store/useStore';
import { useMaterialStore } from './store/useMaterialStore';

function App() {
  const { selectedElementId, showReferenceBoard, showShoppingList, showColorPalette, showBudgetPanel, showPrintSpecification, showScheduleCalendar, setShowPrintSpecification, characters, activeCharacterId } = useStore();
  const { showMaterialLibrary } = useMaterialStore();
  const isAddingNew = selectedElementId === 'new';
  const showEditor = selectedElementId !== null;

  const activeCharacter = characters.find((c) => c.id === activeCharacterId);

  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main id="main-content" className="flex-1 flex overflow-hidden">
          {showMaterialLibrary ? (
            <MaterialLibrary />
          ) : (
            <>
              <ClothingGrid />
              {showEditor && <EditorPanel isNew={isAddingNew} />}
              {showReferenceBoard && <ReferenceBoard />}
            </>
          )}
        </main>
      </div>

      {!showMaterialLibrary && showShoppingList && <ShoppingList />}
      {!showMaterialLibrary && showColorPalette && <ColorPalette />}
      {!showMaterialLibrary && showBudgetPanel && <BudgetPanel />}
      {!showMaterialLibrary && showScheduleCalendar && <ScheduleCalendar />}
      {showPrintSpecification && activeCharacter && (
        <PrintSpecification
          character={activeCharacter}
          onClose={() => setShowPrintSpecification(false)}
        />
      )}
      <CharacterCreationWizard />
    </div>
  );
}

export default App;
