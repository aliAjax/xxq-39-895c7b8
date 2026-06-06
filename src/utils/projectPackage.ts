import {
  Character,
  Material,
  ProjectPackage,
  ImportPreview,
  ImportConflict,
  MaterialImportConflict,
  CharacterDiffDetail,
  ClothingElement,
  ReferenceImage,
  BudgetItem,
  ElementMaterial,
  ColorPalette,
} from '../types';

const PACKAGE_VERSION = '1.1.0';
const MIN_SUPPORTED_VERSION = '1.0.0';

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

function migrateMaterials(materials: unknown): ElementMaterial[] {
  if (!Array.isArray(materials)) {
    return [];
  }
  return materials.map((m) => {
    if (typeof m === 'string') {
      return { name: m };
    }
    if (typeof m === 'object' && m !== null && 'name' in m) {
      return m as ElementMaterial;
    }
    return { name: String(m) };
  });
}

function migratePalette(palette: unknown): ColorPalette {
  const now = Date.now();
  if (!palette || typeof palette !== 'object') {
    return { colors: [], createdAt: now, updatedAt: now };
  }
  const p = palette as ColorPalette;
  return {
    colors: Array.isArray(p.colors) ? p.colors : [],
    createdAt: p.createdAt || now,
    updatedAt: p.updatedAt || now,
  };
}

function migrateElement(el: Record<string, unknown>): ClothingElement {
  const now = Date.now();
  return {
    id: String(el.id || `el-${now}-${Math.random().toString(36).slice(2, 8)}`),
    name: String(el.name || ''),
    category: (el.category as ClothingElement['category']) || 'accessory',
    colors: Array.isArray(el.colors) ? (el.colors as string[]) : [],
    materials: migrateMaterials(el.materials),
    difficulty: (el.difficulty as ClothingElement['difficulty']) || 'medium',
    referenceImages: Array.isArray(el.referenceImages) ? (el.referenceImages as string[]) : [],
    notes: String(el.notes || ''),
    questions: String(el.questions || ''),
    status: (el.status as ClothingElement['status']) || 'pending',
    needToBuy: Boolean(el.needToBuy),
    tasks: Array.isArray(el.tasks) ? (el.tasks as ClothingElement['tasks']) : [],
    budget: el.budget && typeof el.budget === 'object' ? (el.budget as BudgetItem) : undefined,
    scheduleStartDate: typeof el.scheduleStartDate === 'number' ? el.scheduleStartDate : undefined,
    scheduleDueDate: typeof el.scheduleDueDate === 'number' ? el.scheduleDueDate : undefined,
    scheduleReminder: typeof el.scheduleReminder === 'string' ? el.scheduleReminder : undefined,
    createdAt: typeof el.createdAt === 'number' ? el.createdAt : now,
    updatedAt: typeof el.updatedAt === 'number' ? el.updatedAt : now,
  };
}

function migrateCharacter(char: Record<string, unknown>): Character {
  const now = Date.now();
  const elements = Array.isArray(char.elements)
    ? char.elements.map((el) => migrateElement(el as Record<string, unknown>))
    : [];

  return {
    id: String(char.id || `char-${now}-${Math.random().toString(36).slice(2, 8)}`),
    name: String(char.name || '未命名角色'),
    source: String(char.source || ''),
    description: String(char.description || ''),
    elements,
    referenceImages: Array.isArray(char.referenceImages)
      ? (char.referenceImages as ReferenceImage[])
      : [],
    colorPalette: migratePalette(char.colorPalette),
    createdAt: typeof char.createdAt === 'number' ? char.createdAt : now,
    updatedAt: typeof char.updatedAt === 'number' ? char.updatedAt : now,
  };
}

function migrateMaterial(mat: Record<string, unknown>): Material {
  const now = Date.now();
  return {
    id: String(mat.id || `mat-${now}-${Math.random().toString(36).slice(2, 8)}`),
    name: String(mat.name || '未命名材质'),
    applicableParts: Array.isArray(mat.applicableParts)
      ? (mat.applicableParts as Material['applicableParts'])
      : [],
    notes: String(mat.notes || ''),
    needToBuy: Boolean(mat.needToBuy),
    createdAt: typeof mat.createdAt === 'number' ? mat.createdAt : now,
    updatedAt: typeof mat.updatedAt === 'number' ? mat.updatedAt : now,
  };
}

function migrateProjectPackage(pkg: Record<string, unknown>): ProjectPackage {
  const now = Date.now();
  const version = String(pkg.version || '1.0.0');

  const characters = Array.isArray(pkg.characters)
    ? pkg.characters.map((c) => migrateCharacter(c as Record<string, unknown>))
    : [];

  const materials = Array.isArray(pkg.materials)
    ? pkg.materials.map((m) => migrateMaterial(m as Record<string, unknown>))
    : [];

  return {
    version,
    exportedAt: typeof pkg.exportedAt === 'number' ? pkg.exportedAt : now,
    characters,
    materials,
  };
}

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

        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !parsed.version ||
          !Array.isArray(parsed.characters)
        ) {
          reject(new Error('无效的项目包文件格式'));
          return;
        }

        if (compareVersions(parsed.version, MIN_SUPPORTED_VERSION) < 0) {
          reject(
            new Error(
              `项目包版本 ${parsed.version} 过低，最低支持版本 ${MIN_SUPPORTED_VERSION}`
            )
          );
          return;
        }

        const pkg = migrateProjectPackage(parsed as Record<string, unknown>);
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

function getBasicInfoDiff(
  imported: Character,
  existing: Character
): CharacterDiffDetail['basicInfoDiff'] {
  const fields: Array<{ key: keyof Character; label: string }> = [
    { key: 'name', label: '名称' },
    { key: 'source', label: '来源' },
    { key: 'description', label: '描述' },
    { key: 'createdAt', label: '创建时间' },
    { key: 'updatedAt', label: '更新时间' },
  ];

  const diff: CharacterDiffDetail['basicInfoDiff'] = [];

  for (const { key, label } of fields) {
    const iv = imported[key];
    const ev = existing[key];
    if (!isEqual(iv, ev)) {
      diff.push({ field: label, importedValue: iv, existingValue: ev });
    }
  }

  return diff;
}

function getElementDiff(
  imported: Character,
  existing: Character
): CharacterDiffDetail['elementCount'] {
  const importedNames = new Set(imported.elements.map((e) => e.name || e.id));
  const existingNames = new Set(existing.elements.map((e) => e.name || e.id));

  const newElements: string[] = [];
  const removedElements: string[] = [];
  const commonElements: string[] = [];

  for (const el of imported.elements) {
    const name = el.name || el.id;
    if (existingNames.has(name)) {
      commonElements.push(name);
    } else {
      newElements.push(name);
    }
  }

  for (const el of existing.elements) {
    const name = el.name || el.id;
    if (!importedNames.has(name)) {
      removedElements.push(name);
    }
  }

  return {
    imported: imported.elements.length,
    existing: existing.elements.length,
    newElements,
    removedElements,
    commonElements,
  };
}

function getReferenceImageDiff(
  imported: Character,
  existing: Character
): CharacterDiffDetail['referenceImageCount'] {
  const importedUrls = new Set(imported.referenceImages.map((img) => img.url));
  const existingUrls = new Set(existing.referenceImages.map((img) => img.url));

  const newImages: string[] = [];
  const removedImages: string[] = [];
  const commonImages: string[] = [];

  for (const img of imported.referenceImages) {
    if (existingUrls.has(img.url)) {
      commonImages.push(img.url);
    } else {
      newImages.push(img.url);
    }
  }

  for (const img of existing.referenceImages) {
    if (!importedUrls.has(img.url)) {
      removedImages.push(img.url);
    }
  }

  return {
    imported: imported.referenceImages.length,
    existing: existing.referenceImages.length,
    newImages,
    removedImages,
    commonImages,
  };
}

function getColorPaletteDiff(
  imported: Character,
  existing: Character
): CharacterDiffDetail['colorPaletteDiff'] {
  const importedColors = new Set(
    (imported.colorPalette?.colors || []).map((c) => c.color.toLowerCase())
  );
  const existingColors = new Set(
    (existing.colorPalette?.colors || []).map((c) => c.color.toLowerCase())
  );

  const newColors: string[] = [];
  const removedColors: string[] = [];
  const commonColors: string[] = [];

  for (const c of imported.colorPalette?.colors || []) {
    const color = c.color.toLowerCase();
    if (existingColors.has(color)) {
      commonColors.push(c.color);
    } else {
      newColors.push(c.color);
    }
  }

  for (const c of existing.colorPalette?.colors || []) {
    const color = c.color.toLowerCase();
    if (!importedColors.has(color)) {
      removedColors.push(c.color);
    }
  }

  return {
    importedCount: (imported.colorPalette?.colors || []).length,
    existingCount: (existing.colorPalette?.colors || []).length,
    newColors,
    removedColors,
    commonColors,
  };
}

function getBudgetDiff(
  imported: Character,
  existing: Character
): CharacterDiffDetail['budgetDiff'] {
  let importedTotal = 0;
  let existingTotal = 0;
  let hasBudget = false;

  for (const el of imported.elements) {
    if (el.budget) {
      hasBudget = true;
      importedTotal +=
        (el.budget.materialCost || 0) +
        (el.budget.toolCost || 0) +
        (el.budget.outsourcingCost || 0);
    }
  }

  for (const el of existing.elements) {
    if (el.budget) {
      hasBudget = true;
      existingTotal +=
        (el.budget.materialCost || 0) +
        (el.budget.toolCost || 0) +
        (el.budget.outsourcingCost || 0);
    }
  }

  return {
    importedTotal: Math.round(importedTotal * 100) / 100,
    existingTotal: Math.round(existingTotal * 100) / 100,
    hasBudget,
  };
}

function getCharacterDiff(
  imported: Character,
  existing: Character
): CharacterDiffDetail {
  return {
    basicInfoDiff: getBasicInfoDiff(imported, existing),
    elementCount: getElementDiff(imported, existing),
    referenceImageCount: getReferenceImageDiff(imported, existing),
    colorPaletteDiff: getColorPaletteDiff(imported, existing),
    budgetDiff: getBudgetDiff(imported, existing),
  };
}

function getMaterialChangedFields(
  imported: Material,
  existing: Material
): Array<{
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
      const diff = getCharacterDiff(importedChar, existing);
      const hasAnyDiff =
        diff.basicInfoDiff.length > 0 ||
        diff.elementCount.newElements.length > 0 ||
        diff.elementCount.removedElements.length > 0 ||
        diff.referenceImageCount.newImages.length > 0 ||
        diff.referenceImageCount.removedImages.length > 0 ||
        diff.colorPaletteDiff.newColors.length > 0 ||
        diff.colorPaletteDiff.removedColors.length > 0 ||
        (diff.budgetDiff.hasBudget &&
          diff.budgetDiff.importedTotal !== diff.budgetDiff.existingTotal);

      if (hasAnyDiff) {
        conflicts.push({
          importedCharacter: importedChar,
          existingCharacter: existing,
          resolution: 'overwrite',
          diff,
        });
      }
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

function mergeNewElementsAndReferences(
  imported: Character,
  existing: Character
): Character {
  const now = Date.now();

  const existingElementNames = new Set(existing.elements.map((e) => e.name || e.id));
  const newElements = imported.elements.filter(
    (el) => !existingElementNames.has(el.name || el.id)
  );

  const existingImageUrls = new Set(existing.referenceImages.map((img) => img.url));
  const newImages = imported.referenceImages.filter(
    (img) => !existingImageUrls.has(img.url)
  );

  const existingColors = new Set(
    (existing.colorPalette?.colors || []).map((c) => c.color.toLowerCase())
  );
  const newColors = (imported.colorPalette?.colors || []).filter(
    (c) => !existingColors.has(c.color.toLowerCase())
  );

  const mergedElements = [...existing.elements, ...newElements];
  const mergedImages = [...existing.referenceImages, ...newImages];
  const mergedPalette: ColorPalette = {
    colors: [...(existing.colorPalette?.colors || []), ...newColors],
    createdAt: existing.colorPalette?.createdAt || now,
    updatedAt: now,
  };

  return {
    ...existing,
    elements: mergedElements,
    referenceImages: mergedImages,
    colorPalette: mergedPalette,
    updatedAt: now,
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
        c.name === conflict.importedCharacter.name
          ? { ...conflict.importedCharacter, updatedAt: Date.now() }
          : c
      );
    } else if (conflict.resolution === 'saveAsNew') {
      const renamed: Character = {
        ...conflict.importedCharacter,
        id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: `${conflict.importedCharacter.name} (导入)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      mergedCharacters.push(renamed);
    } else if (conflict.resolution === 'mergeNew') {
      mergedCharacters = mergedCharacters.map((c) =>
        c.name === conflict.importedCharacter.name
          ? mergeNewElementsAndReferences(conflict.importedCharacter, c)
          : c
      );
    }
  }

  let mergedMaterials = [...existingMaterials];

  for (const newMat of preview.newMaterials) {
    mergedMaterials.push(newMat);
  }

  for (const matConflict of preview.materialConflicts) {
    if (matConflict.resolution === 'overwrite') {
      mergedMaterials = mergedMaterials.map((m) =>
        m.name === matConflict.importedMaterial.name
          ? { ...matConflict.importedMaterial, updatedAt: Date.now() }
          : m
      );
    }
  }

  return { characters: mergedCharacters, materials: mergedMaterials };
}
