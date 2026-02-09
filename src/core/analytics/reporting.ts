import type {
  Account,
  Income,
  Expense,
  Goal,
  CashFlowResult,
  NetWorthComposition,
  ProgressMetrics,
} from '../types';
import {
  calculateCashFlow,
  calculateNetWorthComposition,
  calculateProgressMetrics,
} from './index';

export type ReportFormat = 'json' | 'csv' | 'pdf';

export type ReportData = Readonly<{
  timestamp: string;
  cashFlow: CashFlowResult;
  netWorth: NetWorthComposition;
  progress: ProgressMetrics;
  accounts: readonly Account[];
  incomes: readonly Income[];
  expenses: readonly Expense[];
  goals: readonly Goal[];
}>;

export function generateReport(
  accounts: readonly Account[],
  incomes: readonly Income[],
  expenses: readonly Expense[],
  goals: readonly Goal[],
  year: number
): ReportData {
  return {
    timestamp: new Date().toISOString(),
    cashFlow: calculateCashFlow(incomes, expenses, year),
    netWorth: calculateNetWorthComposition(accounts),
    progress: calculateProgressMetrics(goals),
    accounts,
    incomes,
    expenses,
    goals,
  };
}

export function exportToJSON(data: ReportData): string {
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(data: ReportData): string {
  const lines: string[] = [];

  lines.push('# Financial Report');
  lines.push(`Generated: ${data.timestamp}`);
  lines.push('');

  lines.push('## Cash Flow Summary');
  lines.push(`Total Income,${data.cashFlow.totalIncome}`);
  lines.push(`Total Expenses,${data.cashFlow.totalExpenses}`);
  lines.push(`Net Cash Flow,${data.cashFlow.netCashFlow}`);
  lines.push('');

  lines.push('## Net Worth Summary');
  lines.push(`Total Net Worth,${data.netWorth.totalNetWorth}`);
  lines.push(`Total Assets,${data.netWorth.totalAssets}`);
  lines.push(`Total Liabilities,${data.netWorth.totalLiabilities}`);
  lines.push('');

  lines.push('## Goals Progress');
  lines.push(
    `Overall Progress,${(data.progress.totalProgress * 100).toFixed(2)}%`
  );
  lines.push(`Completed Goals,${data.progress.completedGoals}`);
  lines.push(`In Progress Goals,${data.progress.inProgressGoals}`);
  lines.push(`On Track Goals,${data.progress.onTrackGoals}`);
  lines.push('');

  lines.push('## Accounts');
  lines.push('ID,Name,Type,Balance');
  for (const account of data.accounts) {
    lines.push(
      `${account.id},"${account.name}",${account.type},${account.balance}`
    );
  }
  lines.push('');

  lines.push('## Income');
  lines.push('ID,Name,Type,Category,Amount,Frequency,Start Date');
  for (const income of data.incomes) {
    lines.push(
      `${income.id},"${income.name}",${income.type},${income.category},${income.amount},${income.frequency},${income.startDate}`
    );
  }
  lines.push('');

  lines.push('## Expenses');
  lines.push('ID,Name,Type,Category,Amount,Frequency,Start Date,Mandatory');
  for (const expense of data.expenses) {
    const mandatory = expense.type === 'recurring' ? expense.mandatory : 'N/A';
    lines.push(
      `${expense.id},"${expense.name}",${expense.type},${expense.category},${expense.amount},${expense.frequency},${expense.startDate},${mandatory}`
    );
  }
  lines.push('');

  lines.push('## Goals');
  lines.push(
    'ID,Name,Type,Target Amount,Current Amount,Progress,Target Date,Status,Priority'
  );
  for (const goal of data.goals) {
    const progress =
      goal.targetAmount > 0
        ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2)
        : '0.00';
    lines.push(
      `${goal.id},"${goal.name}",${goal.type},${goal.targetAmount},${goal.currentAmount},${progress}%,${goal.targetDate},${goal.status},${goal.priority}`
    );
  }

  return lines.join('\n');
}

export function downloadReport(
  data: ReportData,
  format: ReportFormat,
  filename?: string
): void {
  const defaultFilename = `financial-report-${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'json':
      downloadFile(
        exportToJSON(data),
        `${filename ?? defaultFilename}.json`,
        'application/json'
      );
      break;
    case 'csv':
      downloadFile(
        exportToCSV(data),
        `${filename ?? defaultFilename}.csv`,
        'text/csv'
      );
      break;
    case 'pdf':
      throw new Error('PDF export not implemented yet');
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
