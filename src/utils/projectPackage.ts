import { Character, Material, ProjectPackage, ImportPreview, ImportConflict, MaterialImportConflict } from '../types';

const PACKAGE_VERSION = '1.0.0';

export function getProjectPackageFilename(): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  return `cosplay-project-${dateStr}.json`;
}

export function exportProjectPackage(characters: Character[], materials: Material[]): void {
  try {
    if (characters.length === 0 && materials.length === 0) {
      throw new Error('项目为空，没有可导出的内容');
    }

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
    link.download = getProjectPackageFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Failed to export project package:', error);
    throw new Error('导出项目包失败，请重试');
  }
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

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    return b.every((item) => setA.has(item));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

function getMaterialChangedFields(imported: Material, existing: Material): Array<{
  field: keyof Material;
  importedValue: unknown;
  existingValue: unknown;
}> {
  const changed: Array<{
    field: keyof Material;
    importedValue: unknown;
    existingValue: unknown;
  }> = [];

  const allKeys = new Set<keyof Material>([
    ...(Object.keys(imported) as Array<keyof Material>),
    ...(Object.keys(existing) as Array<keyof Material>),
  ]);

  for (const field of allKeys) {
    const iv = imported[field];
    const ev = existing[field];

    if (!isEqual(iv, ev)) {
      changed.push({ field, importedValue: iv, existingValue: ev });
    }
  }

  return changed;
}

export function generateImportPreview(
  pkg: ProjectPackage,
  existingCharacters: Character[],
  existingMaterials: Material[]
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

  const newMaterials: Material[] = [];
  const materialConflicts: MaterialImportConflict[] = [];
  const existingMaterialNames = new Map(existingMaterials.map((m) => [m.name, m]));

  for (const importedMat of pkg.materials) {
    const existing = existingMaterialNames.get(importedMat.name);
    if (existing) {
      const changedFields = getMaterialChangedFields(importedMat, existing);
      if (changedFields.length > 0) {
        materialConflicts.push({
          importedMaterial: importedMat,
          existingMaterial: existing,
          resolution: 'skip',
          changedFields,
        });
      }
    } else {
      newMaterials.push(importedMat);
    }
  }

  return {
    newCharacters,
    conflicts,
    newMaterials,
    materialConflicts,
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

  let mergedMaterials = [...existingMaterials];

  for (const newMat of preview.newMaterials) {
    mergedMaterials.push(newMat);
  }

  for (const matConflict of preview.materialConflicts) {
    if (matConflict.resolution === 'overwrite') {
      mergedMaterials = mergedMaterials.map((m) =>
        m.name === matConflict.importedMaterial.name ? matConflict.importedMaterial : m
      );
    }
  }

  return { characters: mergedCharacters, materials: mergedMaterials };
}
