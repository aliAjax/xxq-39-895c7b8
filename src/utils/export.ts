import html2canvas from 'html2canvas';
import { Character } from '../types';

export function getJSONFilename(character: Character): string {
  return `${character.name}-服装设定.json`;
}

export function getImageFilename(character: Character): string {
  return `${character.name}-服装设定.png`;
}

export function getShoppingListFilename(character: Character): string {
  return `${character.name}-采购清单.txt`;
}

export function getProjectPackageFilename(): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  return `cosplay-project-${dateStr}.json`;
}

export function exportToJSON(character: Character): void {
  try {
    const dataStr = JSON.stringify(character, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = getJSONFilename(character);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export JSON:', error);
    throw new Error('导出JSON失败，请重试');
  }
}

export async function exportToImage(elementId: string, filename: string, backgroundColor: string = '#1a1a2e'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('找不到要导出的画面元素');
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
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
    throw new Error('导出图片失败，请检查画面是否正常加载');
  }
}

export async function exportCharacterImage(character: Character): Promise<void> {
  await exportToImage('main-content', `${character.name}-服装设定`, '#1a1a2e');
}

export async function exportPrintSpecification(character: Character): Promise<void> {
  await exportToImage('print-spec-content', `${character.name}-制作说明书`, '#0f0f1a');
}

export function exportShoppingList(character: Character): void {
  try {
    const items = character.elements.filter(el => el.needToBuy);
    if (items.length === 0) {
      throw new Error('采购清单为空，没有需要导出的内容');
    }

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
    link.download = getShoppingListFilename(character);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Failed to export shopping list:', error);
    throw new Error('导出采购清单失败，请重试');
  }
}
