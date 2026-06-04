import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ClothingGrid } from './components/ClothingGrid';
import { EditorPanel } from './components/EditorPanel';
import { ShoppingList } from './components/ShoppingList';
import { useStore } from './store/useStore';

function App() {
  const { selectedElementId } = useStore();
  const isAddingNew = selectedElementId === 'new';
  const showEditor = selectedElementId !== null;

  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main id="main-content" className="flex-1 flex overflow-hidden">
          <ClothingGrid />
          {showEditor && <EditorPanel isNew={isAddingNew} />}
        </main>
      </div>

      <ShoppingList />
    </div>
  );
}

export default App;
