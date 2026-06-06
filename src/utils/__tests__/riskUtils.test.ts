import { describe, it, expect } from 'vitest';
import {
  checkOverdueRisk,
  checkProcurementNoBudgetRisk,
  checkProcurementNotCompletedRisk,
  getDateRisks,
  getElementRisks,
} from '../riskUtils';
import type { ClothingElement } from '../../types';
import { getStartOfDay } from '../dateUtils';

const today = getStartOfDay(Date.now());
const oneDay = 24 * 60 * 60 * 1000;

function createBaseElement(overrides: Partial<ClothingElement> = {}): ClothingElement {
  return {
    id: 'el-1',
    name: '测试元素',
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('checkOverdueRisk - 逾期风险', () => {
  it('无截止日期时返回 null', () => {
    const element = createBaseElement({ scheduleDueDate: undefined });
    expect(checkOverdueRisk(element)).toBeNull();
  });

  it('状态为 completed 时不返回逾期风险', () => {
    const element = createBaseElement({
      scheduleDueDate: today - oneDay * 3,
      status: 'completed',
    });
    expect(checkOverdueRisk(element)).toBeNull();
  });

  it('截止日期在今天之前，返回逾期风险（danger）', () => {
    const dueDate = today - oneDay * 2;
    const element = createBaseElement({
      id: 'el-overdue',
      name: '逾期道具',
      scheduleDueDate: dueDate,
      status: 'in_progress',
    });
    const result = checkOverdueRisk(element);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('overdue');
    expect(result?.severity).toBe('danger');
    expect(result?.elementId).toBe('el-overdue');
    expect(result?.message).toContain('逾期道具');
    expect(result?.date).toBe(getStartOfDay(dueDate));
  });

  it('截止日期在今天之后，返回 null', () => {
    const element = createBaseElement({
      scheduleDueDate: today + oneDay * 5,
      status: 'pending',
    });
    expect(checkOverdueRisk(element)).toBeNull();
  });

  it('截止日期就是今天，返回 null（不算逾期）', () => {
    const element = createBaseElement({
      scheduleDueDate: today,
      status: 'in_progress',
    });
    expect(checkOverdueRisk(element)).toBeNull();
  });
});

describe('checkProcurementNoBudgetRisk - 采购无预算', () => {
  it('needToBuy 为 false 时返回 null', () => {
    const element = createBaseElement({ needToBuy: false });
    expect(checkProcurementNoBudgetRisk(element)).toBeNull();
  });

  it('needToBuy 为 true 但无 budget 时返回风险', () => {
    const element = createBaseElement({
      id: 'el-nobudget',
      name: '无预算道具',
      needToBuy: true,
      budget: undefined,
    });
    const result = checkProcurementNoBudgetRisk(element);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('procurement_no_budget');
    expect(result?.severity).toBe('warning');
    expect(result?.elementId).toBe('el-nobudget');
    expect(result?.message).toContain('无预算道具');
  });

  it('needToBuy 为 true 但预算总额为 0 时返回风险', () => {
    const element = createBaseElement({
      needToBuy: true,
      budget: {
        materialCost: 0,
        toolCost: 0,
        outsourcingCost: 0,
        purchased: false,
        notes: '',
      },
    });
    const result = checkProcurementNoBudgetRisk(element);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('procurement_no_budget');
  });

  it('needToBuy 为 true 且有预算时返回 null', () => {
    const element = createBaseElement({
      needToBuy: true,
      budget: {
        materialCost: 100,
        toolCost: 50,
        outsourcingCost: 0,
        purchased: false,
        notes: '',
      },
    });
    expect(checkProcurementNoBudgetRisk(element)).toBeNull();
  });
});

describe('checkProcurementNotCompletedRisk - 采购未完成', () => {
  it('needToBuy 为 false 时返回 null', () => {
    const element = createBaseElement({ needToBuy: false });
    expect(checkProcurementNotCompletedRisk(element)).toBeNull();
  });

  it('无预算时返回 null（应由无预算风险覆盖）', () => {
    const element = createBaseElement({
      needToBuy: true,
      budget: undefined,
    });
    expect(checkProcurementNotCompletedRisk(element)).toBeNull();
  });

  it('预算已采购时返回 null', () => {
    const element = createBaseElement({
      needToBuy: true,
      budget: {
        materialCost: 100,
        toolCost: 0,
        outsourcingCost: 0,
        purchased: true,
        notes: '',
      },
    });
    expect(checkProcurementNotCompletedRisk(element)).toBeNull();
  });

  it('有预算但未采购时返回风险', () => {
    const element = createBaseElement({
      id: 'el-notpurchased',
      name: '未采购道具',
      needToBuy: true,
      budget: {
        materialCost: 200,
        toolCost: 30,
        outsourcingCost: 0,
        purchased: false,
        notes: '',
      },
    });
    const result = checkProcurementNotCompletedRisk(element);
    expect(result).not.toBeNull();
    expect(result?.type).toBe('procurement_not_completed');
    expect(result?.severity).toBe('warning');
    expect(result?.elementId).toBe('el-notpurchased');
    expect(result?.message).toContain('未采购道具');
  });
});

describe('getDateRisks - 高难度排期冲突', () => {
  const testDate = today + oneDay * 10;

  function createScheduledElement(
    id: string,
    name: string,
    difficulty: ClothingElement['difficulty'],
    start: number,
    end?: number
  ): ClothingElement {
    return createBaseElement({
      id,
      name,
      difficulty,
      scheduleStartDate: start,
      scheduleDueDate: end ?? start,
    });
  }

  it('当日只有 1 个高难度元素时不产生冲突', () => {
    const elements = [
      createScheduledElement('el-1', '高难度1', 'hard', testDate),
      createScheduledElement('el-2', '中难度', 'medium', testDate),
    ];
    const result = getDateRisks(testDate, elements);
    expect(result.highDifficultyConflictCount).toBe(0);
    expect(result.risks.some((r) => r.type === 'high_difficulty_conflict')).toBe(false);
  });

  it('当日有 2 个高难度元素时产生冲突（danger）', () => {
    const elements = [
      createScheduledElement('el-1', '高难度1', 'hard', testDate),
      createScheduledElement('el-2', '高难度2', 'expert', testDate),
    ];
    const result = getDateRisks(testDate, elements);
    expect(result.highDifficultyConflictCount).toBe(1);
    const conflict = result.risks.find((r) => r.type === 'high_difficulty_conflict');
    expect(conflict).not.toBeUndefined();
    expect(conflict?.severity).toBe('danger');
    expect(conflict?.message).toContain('高难度1');
    expect(conflict?.message).toContain('高难度2');
    expect(conflict?.relatedElementIds).toEqual(['el-1', 'el-2']);
  });

  it('当日有 3 个高难度元素也只产生 1 个冲突记录', () => {
    const elements = [
      createScheduledElement('el-1', '高难度1', 'hard', testDate),
      createScheduledElement('el-2', '高难度2', 'hard', testDate),
      createScheduledElement('el-3', '高难度3', 'expert', testDate),
    ];
    const result = getDateRisks(testDate, elements);
    expect(result.highDifficultyConflictCount).toBe(1);
    const conflict = result.risks.find((r) => r.type === 'high_difficulty_conflict');
    expect(conflict?.relatedElementIds?.length).toBe(3);
  });

  it('元素排期跨越多天，日期在范围内应被计入', () => {
    const start = testDate - oneDay * 2;
    const end = testDate + oneDay * 2;
    const elements = [
      createScheduledElement('el-1', '高难度1', 'hard', start, end),
      createScheduledElement('el-2', '高难度2', 'expert', testDate),
    ];
    const result = getDateRisks(testDate, elements);
    expect(result.highDifficultyConflictCount).toBe(1);
  });

  it('当日无排期元素时无风险', () => {
    const elements = [createBaseElement({ id: 'el-1', name: '无排期' })];
    const result = getDateRisks(testDate, elements);
    expect(result.hasRisk).toBe(false);
    expect(result.risks.length).toBe(0);
  });

  it('包含 characterId 时风险项会携带 characterId', () => {
    const elements = [
      createScheduledElement('el-1', '高难度1', 'hard', testDate),
      createScheduledElement('el-2', '高难度2', 'hard', testDate),
    ];
    const result = getDateRisks(testDate, elements, 'char-1');
    const conflict = result.risks.find((r) => r.type === 'high_difficulty_conflict');
    expect(conflict?.characterId).toBe('char-1');
  });
});

describe('getElementRisks - 元素风险汇总', () => {
  it('无风险元素返回空结果', () => {
    const element = createBaseElement({ id: 'el-safe' });
    const result = getElementRisks(element);
    expect(result.elementId).toBe('el-safe');
    expect(result.hasRisk).toBe(false);
    expect(result.highestSeverity).toBe('none');
    expect(result.risks.length).toBe(0);
  });

  it('同时有多个风险时正确汇总', () => {
    const element = createBaseElement({
      id: 'el-multi',
      needToBuy: true,
      scheduleDueDate: today - oneDay,
      status: 'in_progress',
    });
    const result = getElementRisks(element);
    expect(result.hasRisk).toBe(true);
    expect(result.risks.length).toBeGreaterThanOrEqual(2);
    expect(result.highestSeverity).toBe('danger');
  });

  it('只有 warning 级别风险时 highestSeverity 为 warning', () => {
    const element = createBaseElement({
      id: 'el-warning',
      needToBuy: true,
      budget: {
        materialCost: 0,
        toolCost: 0,
        outsourcingCost: 0,
        purchased: false,
        notes: '',
      },
    });
    const result = getElementRisks(element);
    expect(result.highestSeverity).toBe('warning');
  });
});
