import { Character, Material, ProjectPackage, ImportPreview, ImportConflict } from '../types';

const PACKAGE_VERSION = '1.0.0';

export function exportProjectPackage(characters: Character[], materials: Material[]): void {
  const pkg: ProjectPackage = {
    version: PACKAGE_VERSION,
    exportedAt: Date.now(),
    characters,
    materials,
  };
  const dataStr = JSON.stringify(pkg, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `cosplay-project-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function readProjectPackage(file: File): Promise<ProjectPackage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.version || !Array.isArray(parsed.characters)) {
          reject(new Error('无效的项目包文件格式'));
          return;
        }
        const pkg: ProjectPackage = {
          version: parsed.version || '1.0.0',
          exportedAt: parsed.exportedAt || Date.now(),
          characters: parsed.characters || [],
          materials: parsed.materials || [],
        };
        resolve(pkg);
      } catch {
        reject(new Error('文件解析失败，请确认是有效的项目包文件'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

export function generateImportPreview(
  pkg: ProjectPackage,
  existingCharacters: Character[],
  _existingMaterials: Material[]
): ImportPreview {
  const newCharacters: Character[] = [];
  const conflicts: ImportConflict[] = [];

  for (const importedChar of pkg.characters) {
    const existing = existingCharacters.find((c) => c.name === importedChar.name);
    if (existing) {
      conflicts.push({
        importedCharacter: importedChar,
        existingCharacter: existing,
        resolution: 'overwrite',
      });
    } else {
      newCharacters.push(importedChar);
    }
  }

  return {
    newCharacters,
    conflicts,
    materialsToImport: pkg.materials,
    existingMaterialsCount: _existingMaterials.length,
  };
}

export function applyImport(
  preview: ImportPreview,
  existingCharacters: Character[],
  existingMaterials: Material[]
): { characters: Character[]; materials: Material[] } {
  let mergedCharacters = [...existingCharacters];

  for (const newChar of preview.newCharacters) {
    mergedCharacters.push(newChar);
  }

  for (const conflict of preview.conflicts) {
    if (conflict.resolution === 'overwrite') {
      mergedCharacters = mergedCharacters.map((c) =>
        c.name === conflict.importedCharacter.name ? conflict.importedCharacter : c
      );
    } else if (conflict.resolution === 'saveAsNew') {
      const renamed: Character = {
        ...conflict.importedCharacter,
        id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: `${conflict.importedCharacter.name} (导入)`,
      };
      mergedCharacters.push(renamed);
    }
  }

  const existingMaterialNames = new Set(existingMaterials.map((m) => m.name));
  const newMaterials = preview.materialsToImport.filter(
    (m) => !existingMaterialNames.has(m.name)
  );
  const mergedMaterials = [...existingMaterials, ...newMaterials];

  return { characters: mergedCharacters, materials: mergedMaterials };
}
