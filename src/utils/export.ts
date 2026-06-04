import html2canvas from 'html2canvas';
import { Character } from '../types';

export function exportToJSON(character: Character): void {
  const dataStr = JSON.stringify(character, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${character.name}-服装设定.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportToImage(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#1a1a2e',
      scale: 2,
      useCORS: true,
    });
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export image:', error);
  }
}

export function exportShoppingList(character: Character): void {
  const items = character.elements.filter(el => el.needToBuy);
  const totalBudget = items.reduce((sum, item) => {
    const budget = item.budget;
    return sum + (budget ? budget.materialCost + budget.toolCost + budget.outsourcingCost : 0);
  }, 0);
  const purchasedBudget = items.reduce((sum, item) => {
    const budget = item.budget;
    if (budget?.purchased) {
      return sum + budget.materialCost + budget.toolCost + budget.outsourcingCost;
    }
    return sum;
  }, 0);

  const lines = [
    `# ${character.name} - 采购清单`,
    `来源: ${character.source}`,
    '',
    `## 预算汇总`,
    `- 总预算: ¥${totalBudget.toLocaleString()}`,
    `- 已采购: ¥${purchasedBudget.toLocaleString()}`,
    `- 待采购: ¥${(totalBudget - purchasedBudget).toLocaleString()}`,
    '',
    '## 采购明细:',
    '',
    ...items.map(item => {
      const budget = item.budget;
      const itemBudget = budget ? budget.materialCost + budget.toolCost + budget.outsourcingCost : 0;
      const purchased = budget?.purchased;
      const checkbox = purchased ? '[x]' : '[ ]';
      const budgetStr = itemBudget > 0 ? ` ¥${itemBudget.toLocaleString()}` : '';
      return `- ${checkbox} ${item.name}${budgetStr}`;
    }),
    '',
    `生成时间: ${new Date().toLocaleString()}`,
  ];
  
  const text = lines.join('\n');
  const dataBlob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${character.name}-采购清单.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
