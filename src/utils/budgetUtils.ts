import { Character, ClothingCategory, BudgetSummary, BudgetItem, ClothingElement } from '../types';

const DEFAULT_CATEGORIES: ClothingCategory[] = ['head', 'top', 'bottom', 'shoes', 'accessory', 'weapon'];

const DEFAULT_BUDGET: BudgetItem = {
  materialCost: 0,
  toolCost: 0,
  outsourcingCost: 0,
  purchased: false,
  notes: '',
};

export function calculateElementBudget(element: ClothingElement) {
  const budget = element.budget || DEFAULT_BUDGET;
  const estimated = budget.materialCost + budget.toolCost + budget.outsourcingCost;
  const purchased = budget.purchased ? estimated : 0;
  return { estimated, purchased, purchasedStatus: budget.purchased };
}

export function calculateCharacterBudget(character: Character): BudgetSummary {
  let totalEstimated = 0;
  let totalPurchased = 0;

  const categoryBreakdown: Record<ClothingCategory, { estimated: number; purchased: number }> = {
    head: { estimated: 0, purchased: 0 },
    top: { estimated: 0, purchased: 0 },
    bottom: { estimated: 0, purchased: 0 },
    shoes: { estimated: 0, purchased: 0 },
    accessory: { estimated: 0, purchased: 0 },
    weapon: { estimated: 0, purchased: 0 },
  };

  const elements = character.elements.map((el) => {
    const { estimated, purchased, purchasedStatus } = calculateElementBudget(el);

    totalEstimated += estimated;
    totalPurchased += purchased;

    categoryBreakdown[el.category].estimated += estimated;
    categoryBreakdown[el.category].purchased += purchased;

    return {
      id: el.id,
      name: el.name,
      category: el.category,
      estimated,
      purchased,
      purchasedStatus,
    };
  });

  return {
    totalEstimated,
    totalPurchased,
    totalRemaining: totalEstimated - totalPurchased,
    categoryBreakdown,
    elements,
  };
}

export function calculateProjectBudget(characters: Character[]): BudgetSummary {
  let totalEstimated = 0;
  let totalPurchased = 0;

  const categoryBreakdown: Record<ClothingCategory, { estimated: number; purchased: number }> = {
    head: { estimated: 0, purchased: 0 },
    top: { estimated: 0, purchased: 0 },
    bottom: { estimated: 0, purchased: 0 },
    shoes: { estimated: 0, purchased: 0 },
    accessory: { estimated: 0, purchased: 0 },
    weapon: { estimated: 0, purchased: 0 },
  };

  const allElements: BudgetSummary['elements'] = [];

  characters.forEach((character) => {
    const characterBudget = calculateCharacterBudget(character);
    totalEstimated += characterBudget.totalEstimated;
    totalPurchased += characterBudget.totalPurchased;

    DEFAULT_CATEGORIES.forEach((category) => {
      categoryBreakdown[category].estimated += characterBudget.categoryBreakdown[category].estimated;
      categoryBreakdown[category].purchased += characterBudget.categoryBreakdown[category].purchased;
    });

    characterBudget.elements.forEach((el) => {
      allElements.push({
        ...el,
        name: `${character.name} - ${el.name || '未命名'}`,
      });
    });
  });

  return {
    totalEstimated,
    totalPurchased,
    totalRemaining: totalEstimated - totalPurchased,
    categoryBreakdown,
    elements: allElements,
  };
}
