import type { Account, Category, Transaction } from '../core/types';
import { accountBalanceFromLedger, creditAvailable, summarizeLedger } from './ledger-service';

export interface DashboardMetrics { cashAndBank: number; creditOutstanding: number; creditAvailable: number; netWorth: number; income: number; expenses: number; cashFlow: number; savingsRate?: number; topCategories: Array<{ categoryId: string; name: string; amount: number }>; }

export function calculateDashboardMetrics(accounts: Account[], transactions: Transaction[], categories: Category[]): DashboardMetrics {
  const summary = summarizeLedger(accounts, transactions);
  const cashAndBank = accounts.filter(account => account.type !== 'credit').reduce((total, account) => total + accountBalanceFromLedger(account, transactions), 0);
  const creditOutstanding = accounts.filter(account => account.type === 'credit').reduce((total, account) => total + accountBalanceFromLedger(account, transactions), 0);
  const available = accounts.filter(account => account.type === 'credit').reduce((total, account) => total + (creditAvailable(account, transactions) ?? 0), 0);
  const spending = new Map<string, number>();
  for (const transaction of transactions) if (transaction.status !== 'void' && (transaction.kind === 'expense' || transaction.kind === 'credit_purchase') && transaction.categoryId) spending.set(transaction.categoryId, (spending.get(transaction.categoryId) ?? 0) + transaction.amount);
  const topCategories = [...spending.entries()].map(([categoryId, amount]) => ({ categoryId, name: categories.find(category => category.id === categoryId)?.name ?? 'Uncategorized', amount })).sort((a, b) => b.amount - a.amount).slice(0, 5);
  return { cashAndBank, creditOutstanding, creditAvailable: available, netWorth: summary.netWorth, income: summary.income, expenses: summary.expenses, cashFlow: summary.cashFlow, savingsRate: summary.income > 0 ? (summary.cashFlow / summary.income) * 100 : undefined, topCategories };
}
