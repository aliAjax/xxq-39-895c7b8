import {
  ClothingElement,
  Character,
  RiskItem,
  RiskType,
  ElementRiskResult,
  DateRiskResult,
  CharacterRiskSummary,
  ProjectRiskSummary,
  HIGH_DIFFICULTY_LEVELS,
  RISK_TYPE_LABELS,
} from '../types';
import { getStartOfDay, isSameDay } from './dateUtils';

const isHighDifficulty = (element: ClothingElement): boolean => {
  return HIGH_DIFFICULTY_LEVELS.includes(element.difficulty);
};

const hasSchedule = (element: ClothingElement): boolean => {
  return !!element.scheduleStartDate || !!element.scheduleDueDate;
};

const getScheduledDates = (element: ClothingElement): number[] => {
  const start = element.scheduleStartDate;
  const due = element.scheduleDueDate;

  if (!start && !due) return [];

  const dates: number[] = [];
  const oneDay = 24 * 60 * 60 * 1000;

  if (start && due) {
    const startDay = getStartOfDay(start);
    const dueDay = getStartOfDay(due);
    const minDay = Math.min(startDay, dueDay);
    const maxDay = Math.max(startDay, dueDay);
    const daysCount = Math.round((maxDay - minDay) / oneDay) + 1;

    for (let i = 0; i < daysCount; i++) {
      dates.push(minDay + i * oneDay);
    }
  } else if (start) {
    dates.push(getStartOfDay(start));
  } else if (due) {
    dates.push(getStartOfDay(due));
  }

  return dates;
};

const getElementTotalBudget = (element: ClothingElement): number => {
  const budget = element.budget;
  if (!budget) return 0;
  return budget.materialCost + budget.toolCost + budget.outsourcingCost;
};

export const checkOverdueRisk = (element: ClothingElement): RiskItem | null => {
  if (!element.scheduleDueDate) return null;
  if (element.status === 'completed') return null;

  const today = getStartOfDay(Date.now());
  const dueDay = getStartOfDay(element.scheduleDueDate);

  if (dueDay < today) {
    return {
      type: 'overdue',
      severity: 'danger',
      message: `「${element.name || '未命名'}」已逾期`,
      elementId: element.id,
      date: dueDay,
    };
  }

  return null;
};

export const checkProcurementNoBudgetRisk = (element: ClothingElement): RiskItem | null => {
  if (!element.needToBuy) return null;

  const totalBudget = getElementTotalBudget(element);
  if (totalBudget <= 0) {
    return {
      type: 'procurement_no_budget',
      severity: 'warning',
      message: `「${element.name || '未命名'}」需要采购但未设置预算`,
      elementId: element.id,
    };
  }

  return null;
};

export const checkProcurementNotCompletedRisk = (element: ClothingElement): RiskItem | null => {
  if (!element.needToBuy) return null;
  if (element.status === 'completed') return null;

  const budget = element.budget;
  if (budget && budget.purchased) return null;

  const totalBudget = getElementTotalBudget(element);
  if (totalBudget <= 0) return null;

  return {
    type: 'procurement_not_completed',
    severity: 'warning',
    message: `「${element.name || '未命名'}」需要采购但尚未完成`,
    elementId: element.id,
  };
};

export const getElementRisks = (element: ClothingElement): ElementRiskResult => {
  const risks: RiskItem[] = [];

  const overdueRisk = checkOverdueRisk(element);
  if (overdueRisk) risks.push(overdueRisk);

  const procurementNoBudgetRisk = checkProcurementNoBudgetRisk(element);
  if (procurementNoBudgetRisk) risks.push(procurementNoBudgetRisk);

  const procurementNotCompletedRisk = checkProcurementNotCompletedRisk(element);
  if (procurementNotCompletedRisk) risks.push(procurementNotCompletedRisk);

  const hasRisk = risks.length > 0;
  const highestSeverity: 'none' | 'warning' | 'danger' = hasRisk
    ? risks.some((r) => r.severity === 'danger')
      ? 'danger'
      : 'warning'
    : 'none';

  return {
    elementId: element.id,
    risks,
    hasRisk,
    highestSeverity,
  };
};

export const getDateRisks = (
  date: number,
  elements: ClothingElement[],
  characterId?: string
): DateRiskResult => {
  const targetDay = getStartOfDay(date);
  const dayElements = elements.filter((el) => {
    if (!hasSchedule(el)) return false;
    const dates = getScheduledDates(el);
    return dates.some((d) => isSameDay(d, targetDay));
  });

  const risks: RiskItem[] = [];

  const highDifficultyElements = dayElements.filter(isHighDifficulty);
  if (highDifficultyElements.length >= 2) {
    const elementNames = highDifficultyElements
      .map((el) => el.name || '未命名')
      .join('、');
    risks.push({
      type: 'high_difficulty_conflict',
      severity: 'danger',
      message: `${highDifficultyElements.length} 个高难度元素排期冲突：${elementNames}`,
      elementId: highDifficultyElements[0].id,
      relatedElementIds: highDifficultyElements.map((el) => el.id),
      date: targetDay,
      characterId,
    });
  }

  dayElements.forEach((el) => {
    const overdueRisk = checkOverdueRisk(el);
    if (overdueRisk) {
      risks.push({
        ...overdueRisk,
        characterId,
        date: targetDay,
      });
    }
  });

  const highDifficultyConflictCount = highDifficultyElements.length >= 2 ? 1 : 0;
  const overdueCount = dayElements.filter((el) => checkOverdueRisk(el) !== null).length;

  return {
    date: targetDay,
    risks,
    highDifficultyConflictCount,
    overdueCount,
    hasRisk: risks.length > 0,
  };
};

export const getCharacterRiskSummary = (character: Character): CharacterRiskSummary => {
  const risks: RiskItem[] = [];

  character.elements.forEach((element) => {
    const elementRisks = getElementRisks(element);
    elementRisks.risks.forEach((risk) => {
      risks.push({
        ...risk,
        characterId: character.id,
      });
    });
  });

  const scheduledElements = character.elements.filter(hasSchedule);
  const allDatesSet = new Set<number>();
  scheduledElements.forEach((el) => {
    getScheduledDates(el).forEach((d) => allDatesSet.add(d));
  });

  const allDates = Array.from(allDatesSet).sort((a, b) => a - b);
  const conflictDates: number[] = [];

  allDates.forEach((date) => {
    const dayRisks = getDateRisks(date, character.elements, character.id);
    const conflictRisk = dayRisks.risks.find((r) => r.type === 'high_difficulty_conflict');
    if (conflictRisk && !risks.some((r) => r.type === 'high_difficulty_conflict' && r.date === date)) {
      risks.push(conflictRisk);
      conflictDates.push(date);
    }
  });

  const dangerCount = risks.filter((r) => r.severity === 'danger').length;
  const warningCount = risks.filter((r) => r.severity === 'warning').length;
  const overdueCount = risks.filter((r) => r.type === 'overdue').length;
  const highDifficultyConflictCount = conflictDates.length;
  const procurementNoBudgetCount = risks.filter((r) => r.type === 'procurement_no_budget').length;
  const procurementNotCompletedCount = risks.filter((r) => r.type === 'procurement_not_completed').length;

  return {
    characterId: character.id,
    totalRisks: risks.length,
    dangerCount,
    warningCount,
    overdueCount,
    highDifficultyConflictCount,
    procurementNoBudgetCount,
    procurementNotCompletedCount,
    risks,
  };
};

export const getProjectRiskSummary = (characters: Character[]): ProjectRiskSummary => {
  const characterRisks: Record<string, CharacterRiskSummary> = {};
  const allRisks: RiskItem[] = [];

  characters.forEach((character) => {
    const summary = getCharacterRiskSummary(character);
    characterRisks[character.id] = summary;
    allRisks.push(...summary.risks);
  });

  const dangerCount = allRisks.filter((r) => r.severity === 'danger').length;
  const warningCount = allRisks.filter((r) => r.severity === 'warning').length;

  return {
    totalRisks: allRisks.length,
    dangerCount,
    warningCount,
    characterRisks,
    allRisks,
  };
};

export const getRiskSeverityColor = (severity: 'warning' | 'danger'): string => {
  return severity === 'danger'
    ? 'bg-red-500/20 border-red-500/50 text-red-300'
    : 'bg-amber-500/20 border-amber-500/50 text-amber-300';
};

export const getRiskSeverityBgClass = (severity: 'warning' | 'danger'): string => {
  return severity === 'danger' ? 'bg-red-500' : 'bg-amber-500';
};

export const getRiskSeverityTextClass = (severity: 'warning' | 'danger'): string => {
  return severity === 'danger' ? 'text-red-400' : 'text-amber-400';
};

export const formatRiskMessage = (risk: RiskItem): string => {
  return risk.message;
};

export const getRiskTypeIcon = (type: RiskType): string => {
  switch (type) {
    case 'overdue':
      return 'Clock';
    case 'high_difficulty_conflict':
      return 'AlertTriangle';
    case 'procurement_no_budget':
      return 'Wallet';
    case 'procurement_not_completed':
      return 'ShoppingCart';
    default:
      return 'AlertCircle';
  }
};

export { RISK_TYPE_LABELS };
