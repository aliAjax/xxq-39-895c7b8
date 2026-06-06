import { describe, it, expect } from 'vitest';
import { generateImportPreview, applyImport } from '../projectPackage';
import type {
  Character,
  Material,
  ClothingElement,
  ReferenceImage,
  ColorPalette,
  ProjectPackage,
} from '../../types';

function createBaseElement(id: string, name: string): ClothingElement {
  return {
    id,
    name,
    category: 'accessory',
    colors: [],
    materials: [],
    difficulty: 'medium',
    referenceImages: [],
    notes: '',
    questions: '',
    status: 'pending',
    needToBuy: false,
    tasks: [],
    createdAt: 1000,
    updatedAt: 1000,
  };
}

function createBasePalette(colors: Array<{ id: string; color: string; name: string }>): ColorPalette {
  return {
    colors: colors.map((c) => ({
      ...c,
      category: 'primary',
      createdAt: 1000,
      updatedAt: 1000,
    })),
    createdAt: 1000,
    updatedAt: 1000,
  };
}

function createBaseImage(id: string, url: string): ReferenceImage {
  return {
    id,
    url,
    tags: [],
    notes: '',
    createdAt: 1000,
    updatedAt: 1000,
  };
}

function createBaseCharacter(
  id: string,
  name: string,
  options: Partial<Character> = {}
): Character {
  return {
    id,
    name,
    source: '',
    description: '',
    elements: [],
    referenceImages: [],
    colorPalette: createBasePalette([]),
    createdAt: 1000,
    updatedAt: 1000,
    ...options,
  };
}

function createBaseMaterial(id: string, name: string): Material {
  return {
    id,
    name,
    applicableParts: [],
    notes: '',
    needToBuy: false,
    createdAt: 1000,
    updatedAt: 1000,
  };
}

function createPackage(characters: Character[], materials: Material[] = []): ProjectPackage {
  return {
    version: '1.1.0',
    exportedAt: 2000,
    characters,
    materials,
  };
}

describe('generateImportPreview - 导入预览冲突判断', () => {
  describe('角色冲突检测', () => {
    it('导入全新角色不会产生冲突', () => {
      const importedChar = createBaseCharacter('char-new', '新角色');
      const existingChars = [createBaseCharacter('char-1', '已有角色')];
      const pkg = createPackage([importedChar]);

      const preview = generateImportPreview(pkg, existingChars, []);

      expect(preview.newCharacters.length).toBe(1);
      expect(preview.newCharacters[0].name).toBe('新角色');
      expect(preview.conflicts.length).toBe(0);
    });

    it('同名且完全相同的角色不会产生冲突', () => {
      const char = createBaseCharacter('char-1', '相同角色');
      const existingChars = [char];
      const pkg = createPackage([{ ...char, id: 'char-imported' }]);

      const preview = generateImportPreview(pkg, existingChars, []);

      expect(preview.newCharacters.length).toBe(0);
      expect(preview.conflicts.length).toBe(0);
    });

    it('同名但基础信息不同会产生冲突', () => {
      const existingChar = createBaseCharacter('char-1', '冲突角色', {
        source: '原作A',
        description: '旧描述',
      });
      const importedChar = createBaseCharacter('char-imported', '冲突角色', {
        source: '原作B',
        description: '新描述',
      });
      const pkg = createPackage([importedChar]);

      const preview = generateImportPreview(pkg, [existingChar], []);

      expect(preview.conflicts.length).toBe(1);
      const conflict = preview.conflicts[0];
      expect(conflict.diff.basicInfoDiff.length).toBeGreaterThan(0);
      expect(conflict.resolution).toBe('overwrite');
    });

    it('同名且元素不同会产生冲突', () => {
      const existingChar = createBaseCharacter('char-1', '元素不同角色', {
        elements: [createBaseElement('el-1', '元素A')],
      });
      const importedChar = createBaseCharacter('char-imported', '元素不同角色', {
        elements: [createBaseElement('el-x', '元素B')],
      });
      const pkg = createPackage([importedChar]);

      const preview = generateImportPreview(pkg, [existingChar], []);

      expect(preview.conflicts.length).toBe(1);
      const diff = preview.conflicts[0].diff.elementCount;
      expect(diff.newElements).toContain('元素B');
      expect(diff.removedElements).toContain('元素A');
    });

    it('同名且参考图不同会产生冲突', () => {
      const existingChar = createBaseCharacter('char-1', '图不同角色', {
        referenceImages: [createBaseImage('img-1', 'https://example.com/old.jpg')],
      });
      const importedChar = createBaseCharacter('char-imported', '图不同角色', {
        referenceImages: [createBaseImage('img-2', 'https://example.com/new.jpg')],
      });
      const pkg = createPackage([importedChar]);

      const preview = generateImportPreview(pkg, [existingChar], []);

      expect(preview.conflicts.length).toBe(1);
      const diff = preview.conflicts[0].diff.referenceImageCount;
      expect(diff.newImages).toContain('https://example.com/new.jpg');
      expect(diff.removedImages).toContain('https://example.com/old.jpg');
    });

    it('同名且调色板不同会产生冲突', () => {
      const existingChar = createBaseCharacter('char-1', '调色板角色', {
        colorPalette: createBasePalette([{ id: 'c1', color: '#FF0000', name: '红' }]),
      });
      const importedChar = createBaseCharacter('char-imported', '调色板角色', {
        colorPalette: createBasePalette([{ id: 'c2', color: '#00FF00', name: '绿' }]),
      });
      const pkg = createPackage([importedChar]);

      const preview = generateImportPreview(pkg, [existingChar], []);

      expect(preview.conflicts.length).toBe(1);
      const diff = preview.conflicts[0].diff.colorPaletteDiff;
      expect(diff.newColors).toContain('#00FF00');
      expect(diff.removedColors).toContain('#FF0000');
    });
  });

  describe('材质冲突检测', () => {
    it('导入全新材质不会产生冲突', () => {
      const importedMat = createBaseMaterial('mat-new', '新材质');
      const existingMats = [createBaseMaterial('mat-1', '已有材质')];
      const pkg = createPackage([], [importedMat]);

      const preview = generateImportPreview(pkg, [], existingMats);

      expect(preview.newMaterials.length).toBe(1);
      expect(preview.materialConflicts.length).toBe(0);
    });

    it('同名且完全相同的材质不会产生冲突', () => {
      const mat = createBaseMaterial('mat-1', '相同材质');
      const existingMats = [mat];
      const pkg = createPackage([], [{ ...mat }]);

      const preview = generateImportPreview(pkg, [], existingMats);

      expect(preview.newMaterials.length).toBe(0);
      expect(preview.materialConflicts.length).toBe(0);
    });

    it('同名但属性不同会产生冲突', () => {
      const existingMat = createBaseMaterial('mat-1', '冲突材质');
      existingMat.notes = '旧备注';
      const importedMat = createBaseMaterial('mat-imported', '冲突材质');
      importedMat.notes = '新备注';
      importedMat.needToBuy = true;
      const pkg = createPackage([], [importedMat]);

      const preview = generateImportPreview(pkg, [], [existingMat]);

      expect(preview.materialConflicts.length).toBe(1);
      const conflict = preview.materialConflicts[0];
      expect(conflict.changedFields.length).toBeGreaterThan(0);
      expect(conflict.resolution).toBe('skip');
    });
  });
});

describe('applyImport - mergeNew 合并逻辑', () => {
  it('mergeNew 会合并新元素，保留已有元素', () => {
    const existingChar = createBaseCharacter('char-1', '合并角色', {
      elements: [createBaseElement('el-old', '旧元素')],
    });
    const importedChar = createBaseCharacter('char-imported', '合并角色', {
      elements: [
        createBaseElement('el-new1', '新元素1'),
        createBaseElement('el-new2', '新元素2'),
      ],
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);
    expect(preview.conflicts.length).toBe(1);

    preview.conflicts[0].resolution = 'mergeNew';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters.length).toBe(1);
    const merged = result.characters[0];
    const elementNames = merged.elements.map((e) => e.name);
    expect(elementNames).toContain('旧元素');
    expect(elementNames).toContain('新元素1');
    expect(elementNames).toContain('新元素2');
    expect(merged.elements.length).toBe(3);
  });

  it('mergeNew 不会重复添加同名元素', () => {
    const existingChar = createBaseCharacter('char-1', '同名元素角色', {
      elements: [createBaseElement('el-common', '公共元素')],
      source: '旧来源',
    });
    const importedChar = createBaseCharacter('char-imported', '同名元素角色', {
      elements: [createBaseElement('el-imported', '公共元素')],
      source: '新来源',
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);
    expect(preview.conflicts.length).toBe(1);

    preview.conflicts[0].resolution = 'mergeNew';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters[0].elements.length).toBe(1);
    expect(result.characters[0].elements[0].name).toBe('公共元素');
  });

  it('mergeNew 会合并新参考图，保留已有参考图', () => {
    const existingChar = createBaseCharacter('char-1', '图片合并角色', {
      referenceImages: [createBaseImage('img-old', 'https://example.com/old.jpg')],
    });
    const importedChar = createBaseCharacter('char-imported', '图片合并角色', {
      referenceImages: [createBaseImage('img-new', 'https://example.com/new.jpg')],
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);

    preview.conflicts[0].resolution = 'mergeNew';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters[0].referenceImages.length).toBe(2);
    const urls = result.characters[0].referenceImages.map((img) => img.url);
    expect(urls).toContain('https://example.com/old.jpg');
    expect(urls).toContain('https://example.com/new.jpg');
  });

  it('mergeNew 不会重复添加同 URL 参考图', () => {
    const existingChar = createBaseCharacter('char-1', '同图角色', {
      referenceImages: [createBaseImage('img-old', 'https://example.com/same.jpg')],
      source: '旧来源',
    });
    const importedChar = createBaseCharacter('char-imported', '同图角色', {
      referenceImages: [createBaseImage('img-new', 'https://example.com/same.jpg')],
      source: '新来源',
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);
    expect(preview.conflicts.length).toBe(1);

    preview.conflicts[0].resolution = 'mergeNew';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters[0].referenceImages.length).toBe(1);
  });

  it('mergeNew 会合并新颜色，保留已有颜色', () => {
    const existingChar = createBaseCharacter('char-1', '颜色合并角色', {
      colorPalette: createBasePalette([{ id: 'c1', color: '#FF0000', name: '红' }]),
    });
    const importedChar = createBaseCharacter('char-imported', '颜色合并角色', {
      colorPalette: createBasePalette([{ id: 'c2', color: '#0000FF', name: '蓝' }]),
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);

    preview.conflicts[0].resolution = 'mergeNew';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters[0].colorPalette.colors.length).toBe(2);
    const colors = result.characters[0].colorPalette.colors.map((c) => c.color);
    expect(colors).toContain('#FF0000');
    expect(colors).toContain('#0000FF');
  });

  it('mergeNew 不会重复添加同色（大小写不敏感）', () => {
    const existingChar = createBaseCharacter('char-1', '同色角色', {
      colorPalette: createBasePalette([{ id: 'c1', color: '#ff0000', name: '红' }]),
      source: '旧来源',
    });
    const importedChar = createBaseCharacter('char-imported', '同色角色', {
      colorPalette: createBasePalette([{ id: 'c2', color: '#FF0000', name: '大红' }]),
      source: '新来源',
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);
    expect(preview.conflicts.length).toBe(1);

    preview.conflicts[0].resolution = 'mergeNew';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters[0].colorPalette.colors.length).toBe(1);
  });

  it('mergeNew 会更新 updatedAt 时间戳', () => {
    const existingChar = createBaseCharacter('char-1', '时间角色', {
      updatedAt: 1000,
    });
    const importedChar = createBaseCharacter('char-imported', '时间角色', {
      elements: [createBaseElement('el-new', '新元素')],
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);

    preview.conflicts[0].resolution = 'mergeNew';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters[0].updatedAt).toBeGreaterThan(1000);
  });

  it('mergeNew 保留原有角色的 id 和基础信息', () => {
    const existingChar = createBaseCharacter('char-original-id', '保留ID角色', {
      source: '保留的来源',
      description: '保留的描述',
    });
    const importedChar = createBaseCharacter('char-imported-id', '保留ID角色', {
      source: '导入的来源',
      description: '导入的描述',
      elements: [createBaseElement('el-new', '新元素')],
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);

    preview.conflicts[0].resolution = 'mergeNew';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters[0].id).toBe('char-original-id');
    expect(result.characters[0].source).toBe('保留的来源');
    expect(result.characters[0].description).toBe('保留的描述');
  });
});

describe('applyImport - 其他合并策略', () => {
  it('overwrite 会完全替换现有角色', () => {
    const existingChar = createBaseCharacter('char-1', '覆盖角色', {
      elements: [createBaseElement('el-old', '旧元素')],
    });
    const importedChar = createBaseCharacter('char-imported', '覆盖角色', {
      elements: [createBaseElement('el-new', '新元素')],
      source: '新来源',
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);

    preview.conflicts[0].resolution = 'overwrite';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters.length).toBe(1);
    expect(result.characters[0].elements.length).toBe(1);
    expect(result.characters[0].elements[0].name).toBe('新元素');
    expect(result.characters[0].source).toBe('新来源');
  });

  it('saveAsNew 会作为新角色添加，名称带 (导入)', () => {
    const existingChar = createBaseCharacter('char-1', '另存角色', {
      elements: [createBaseElement('el-old', '旧元素')],
    });
    const importedChar = createBaseCharacter('char-imported', '另存角色', {
      elements: [createBaseElement('el-new', '新元素')],
    });

    const pkg = createPackage([importedChar]);
    const preview = generateImportPreview(pkg, [existingChar], []);

    preview.conflicts[0].resolution = 'saveAsNew';

    const result = applyImport(preview, [existingChar], []);

    expect(result.characters.length).toBe(2);
    const newChar = result.characters.find((c) => c.name === '另存角色 (导入)');
    expect(newChar).not.toBeUndefined();
    expect(newChar?.elements[0].name).toBe('新元素');
  });

  it('新角色会被直接添加', () => {
    const existingChars = [createBaseCharacter('char-1', '已有角色')];
    const newChar = createBaseCharacter('char-new', '新角色');
    const pkg = createPackage([newChar]);

    const preview = generateImportPreview(pkg, existingChars, []);
    const result = applyImport(preview, existingChars, []);

    expect(result.characters.length).toBe(2);
    expect(result.characters.map((c) => c.name)).toContain('新角色');
  });

  it('新材质会被直接添加', () => {
    const existingMats = [createBaseMaterial('mat-1', '已有材质')];
    const newMat = createBaseMaterial('mat-new', '新材质');
    const pkg = createPackage([], [newMat]);

    const preview = generateImportPreview(pkg, [], existingMats);
    const result = applyImport(preview, [], existingMats);

    expect(result.materials.length).toBe(2);
    expect(result.materials.map((m) => m.name)).toContain('新材质');
  });

  it('材质冲突使用 overwrite 会替换现有材质', () => {
    const existingMat = createBaseMaterial('mat-1', '覆盖材质');
    existingMat.notes = '旧备注';
    const importedMat = createBaseMaterial('mat-imported', '覆盖材质');
    importedMat.notes = '新备注';
    importedMat.needToBuy = true;

    const pkg = createPackage([], [importedMat]);
    const preview = generateImportPreview(pkg, [], [existingMat]);

    preview.materialConflicts[0].resolution = 'overwrite';

    const result = applyImport(preview, [], [existingMat]);

    expect(result.materials.length).toBe(1);
    expect(result.materials[0].notes).toBe('新备注');
    expect(result.materials[0].needToBuy).toBe(true);
  });

  it('材质冲突使用 skip 会保留现有材质不变', () => {
    const existingMat = createBaseMaterial('mat-1', '跳过材质');
    existingMat.notes = '旧备注';
    const importedMat = createBaseMaterial('mat-imported', '跳过材质');
    importedMat.notes = '新备注';

    const pkg = createPackage([], [importedMat]);
    const preview = generateImportPreview(pkg, [], [existingMat]);

    preview.materialConflicts[0].resolution = 'skip';

    const result = applyImport(preview, [], [existingMat]);

    expect(result.materials.length).toBe(1);
    expect(result.materials[0].notes).toBe('旧备注');
  });
});
